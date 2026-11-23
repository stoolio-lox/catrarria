import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKPACK_SIZE,
  DEBUG_CHEST_PRESETS,
  HOTBAR_SIZE,
  ITEMS,
  RECIPES,
  STOOL_REPO_URL,
  addItemToInventory,
  canCraftRecipe,
  computeEquipmentBonuses,
  consumeItemFromInventory,
  countItemInInventory,
  countUsedSlots,
  craftRecipe,
  createInitialEquipment,
  createStarterInventory,
  dropFromSlot,
  equipItemFromInventory,
  giveDebugItem,
  tileTypeToDropItem,
  unequipItemToInventory,
  verifyDebugPassword,
} from './catalog';
import {
  BOSS_KINDS,
  MAX_WING_FUEL,
  computeDamageAfterDefense,
  createEnemy,
  createInitialPlayer,
  explodeTilesRadius,
  isBossKind,
  placeDebugChestNearPlayer,
  rollPotDrops,
  stepEnemyAI,
  stepPlayerPhysics,
  teleportPlayerToCoords,
  toggleDoorAtTile,
  tryDamageTile,
  tryPlaceItemAtTile,
} from './physics';
import { stepNpcAI, syncVillageNpcs } from './npc';
import { DEFAULT_SETTINGS, clampVolume } from './settings';
import { EnemyKind, NpcEntity, TILE_SIZE, TileType, WORLD_HEIGHT, WORLD_WIDTH, WallType } from './types';
import {
  buildQuickHouseAt,
  findValidNpcHouses,
  generateWorld,
  getBiomeAtX,
  getNearbyStations,
  getTile,
  getTileRequiredPickPower,
  getWall,
  inspectRoomHousing,
  isInsideValidHouse,
  isTileSolid,
  setTile,
  setWall,
  tileIndex,
} from './worldGen';

test('world generation creates safe spawn clearing and underground ores', () => {
  const world = generateWorld(12345);
  const spawnX = Math.floor(world.width / 2);
  const sy = world.surfaceHeights[spawnX];

  assert.equal(getTile(world, spawnX, sy), TileType.Grass);
  assert.equal(getTile(world, spawnX, sy - 1), TileType.Air);
  assert.equal(getTile(world, spawnX, sy - 2), TileType.Air);

  let oreCount = 0;
  for (let i = 0; i < world.tiles.length; i++) {
    const t = world.tiles[i];
    if (
      t === TileType.CoalOre ||
      t === TileType.CopperOre ||
      t === TileType.IronOre ||
      t === TileType.GoldOre ||
      t === TileType.RubyOre
    ) {
      oreCount++;
    }
  }
  assert.ok(oreCount > 40, `Expected > 40 ore tiles, got ${oreCount}`);
});

test('inventory stacking, consumption, and crafting with station requirements', () => {
  const { hotbar, backpack } = createStarterInventory();

  assert.ok(Object.keys(ITEMS).length >= 25);
  const weaponCount = Object.values(ITEMS).filter((i) => i.category === 'weapon').length;
  assert.ok(weaponCount >= 11, `Expected >= 11 weapons, got ${weaponCount}`);

  // Add wood logs and craft planks in hand
  const beforeWood = countItemInInventory(hotbar, backpack, 'wood_log');
  addItemToInventory(hotbar, backpack, 'wood_log', 5);
  assert.equal(countItemInInventory(hotbar, backpack, 'wood_log'), beforeWood + 5);

  const plankRecipe = RECIPES.find((r) => r.id === 'craft_planks')!;
  const beforePlanks = countItemInInventory(hotbar, backpack, 'planks_block');
  assert.equal(canCraftRecipe(plankRecipe, hotbar, backpack, ['hand']), true);
  assert.equal(craftRecipe(plankRecipe, hotbar, backpack, ['hand']), true);
  assert.equal(countItemInInventory(hotbar, backpack, 'wood_log'), beforeWood + 4);
  assert.equal(countItemInInventory(hotbar, backpack, 'planks_block'), beforePlanks + 4);

  // Anvil recipe must fail without anvil nearby
  const rubySwordRecipe = RECIPES.find((r) => r.id === 'craft_ruby_greatsword')!;
  addItemToInventory(hotbar, backpack, 'gold_bar', 10);
  addItemToInventory(hotbar, backpack, 'ruby_gem', 5);
  addItemToInventory(hotbar, backpack, 'monster_bone', 5);

  assert.equal(canCraftRecipe(rubySwordRecipe, hotbar, backpack, ['hand', 'workbench']), false);
  assert.equal(
    canCraftRecipe(rubySwordRecipe, hotbar, backpack, ['hand', 'workbench', 'anvil']),
    true,
  );
  assert.equal(
    craftRecipe(rubySwordRecipe, hotbar, backpack, ['hand', 'workbench', 'anvil']),
    true,
  );
  assert.equal(countItemInInventory(hotbar, backpack, 'ruby_greatsword'), 1);

  assert.equal(consumeItemFromInventory(hotbar, backpack, 'ruby_greatsword', 1), true);
  assert.equal(countItemInInventory(hotbar, backpack, 'ruby_greatsword'), 0);
});

test('player physics survives idle frames, moves, jumps, and collides with ground', () => {
  const world = generateWorld(777);
  const player = createInitialPlayer(world);
  const startX = player.x;

  // Survive 2 seconds with no input
  for (let i = 0; i < 120; i++) {
    stepPlayerPhysics(
      player,
      world,
      { left: false, right: false, up: false, down: false, jumpHeld: false, jumpJustPressed: false },
      1 / 60,
    );
  }
  assert.equal(player.onGround, true);
  assert.ok(Math.abs(player.x - startX) < 1);

  // Jump + move right
  const jumpRes = stepPlayerPhysics(
    player,
    world,
    { left: false, right: true, up: false, down: false, jumpHeld: true, jumpJustPressed: true },
    1 / 60,
  );
  assert.equal(jumpRes.jumped, true);
  assert.ok(player.vy < 0);
  for (let i = 0; i < 20; i++) {
    stepPlayerPhysics(
      player,
      world,
      { left: false, right: true, up: false, down: false, jumpHeld: true, jumpJustPressed: false },
      1 / 60,
    );
  }
  assert.ok(player.x > startX + 20);
});

test('mining, building a house, stations, and house validity check', () => {
  const world = generateWorld(999);
  const player = createInitialPlayer(world);
  const pxTile = Math.floor((player.x + player.width / 2) / TILE_SIZE);
  const sy = world.surfaceHeights[pxTile];

  // Mine dirt/grass directly below adjacent tile
  const dmgMap = new Map<number, number>();
  const targetX = pxTile + 2;
  const targetY = sy;
  const res1 = tryDamageTile(world, dmgMap, targetX, targetY, 1);
  assert.equal(res1.broken, false);
  const res2 = tryDamageTile(world, dmgMap, targetX, targetY, 1);
  assert.equal(res2.broken, true);
  assert.equal(res2.droppedItemId, 'dirt_block');
  assert.equal(getTile(world, targetX, targetY), TileType.Air);

  // Build an enclosed 5x4 house around the cat
  const left = pxTile - 2;
  const right = pxTile + 2;
  const top = sy - 4;
  const floor = sy;

  for (let x = left; x <= right; x++) {
    setTile(world, x, floor, TileType.Planks);
    setTile(world, x, top, TileType.Planks);
  }
  for (let y = top; y <= floor; y++) {
    setTile(world, left, y, TileType.Planks);
    setTile(world, right, y, TileType.Planks);
  }
  for (let x = left + 1; x < right; x++) {
    for (let y = top + 1; y < floor; y++) {
      setTile(world, x, y, TileType.Air);
      setWall(world, x, y, WallType.WoodWall);
    }
  }
  // Place torch & workbench inside
  const placeTorch = tryPlaceItemAtTile(world, player, 'torch_item', pxTile + 1, sy - 1);
  assert.equal(placeTorch.placed, true);
  const placeBench = tryPlaceItemAtTile(world, player, 'workbench_item', pxTile - 1, sy - 1);
  assert.equal(placeBench.placed, true);

  assert.equal(getWall(world, pxTile, sy - 1), WallType.WoodWall);
  assert.equal(isTileSolid(getTile(world, left, sy - 1)), true);
  assert.equal(isInsideValidHouse(world, player.x + player.width / 2, player.y + player.height / 2), true);

  const stations = getNearbyStations(world, player.x, player.y);
  assert.ok(stations.includes('workbench'));
});

test('enemy AI policies and defense damage calculation', () => {
  const world = generateWorld(321);
  const player = createInitialPlayer(world);
  const slime = createEnemy(1, 'slime', player.x + 120, player.y, 1);
  const bat = createEnemy(2, 'bat', player.x + 150, player.y - 80, 1);
  const goblin = createEnemy(3, 'goblin', player.x - 100, player.y, 1);

  for (let i = 0; i < 40; i++) {
    stepEnemyAI(slime, player, world, 1 / 60, true);
    stepEnemyAI(bat, player, world, 1 / 60, true);
    stepEnemyAI(goblin, player, world, 1 / 60, true);
  }

  assert.ok(goblin.x > player.x - 100, 'Goblin should chase toward player');
  assert.equal(computeDamageAfterDefense(20, 4), 18);
  assert.equal(computeDamageAfterDefense(2, 10), 1);
});

test('debug password verification and interactive stool spawn, craft, and right-click action', () => {
  assert.equal(verifyDebugPassword('secretdev'), true);
  assert.equal(verifyDebugPassword(' secretdev '), true);
  assert.equal(verifyDebugPassword('wrongpass'), false);
  assert.equal(STOOL_REPO_URL, 'https://github.com/stoolio-lox/stoolio-something.git');

  const world = generateWorld(555);
  const player = createInitialPlayer(world);
  const spawnX = Math.floor(world.width / 2);
  const sy = world.surfaceHeights[spawnX];

  // Starter stool spawns near center clearing and is passable
  assert.equal(getTile(world, spawnX + 2, sy - 1), TileType.Stool);
  assert.equal(isTileSolid(TileType.Stool), false);

  // Right-click interaction on stool returns stool_interact without consuming items
  const interactRes = tryPlaceItemAtTile(world, player, 'planks_block', spawnX + 2, sy - 1);
  assert.equal(interactRes.placed, false);
  assert.equal(interactRes.action, 'stool_interact');

  // Craft stool_item in hand from planks
  const { hotbar, backpack } = createStarterInventory();
  const stoolRecipe = RECIPES.find((r) => r.id === 'craft_stool')!;
  const beforeStools = countItemInInventory(hotbar, backpack, 'stool_item');
  assert.equal(craftRecipe(stoolRecipe, hotbar, backpack, ['hand']), true);
  assert.equal(countItemInInventory(hotbar, backpack, 'stool_item'), beforeStools + 1);
});

test('expanded 63-slot inventory capacity and dropFromSlot partial/full stack drops', () => {
  const { hotbar, backpack } = createStarterInventory();
  assert.equal(hotbar.length, HOTBAR_SIZE);
  assert.equal(backpack.length, BACKPACK_SIZE);
  assert.equal(HOTBAR_SIZE, 9);
  assert.equal(BACKPACK_SIZE, 54);

  const initialUsage = countUsedSlots(hotbar, backpack);
  assert.equal(initialUsage.total, 63);
  assert.ok(initialUsage.used > 0 && initialUsage.used < 63);

  // Drop 1 plank from hotbar slot 3 (starts with 48 planks)
  const partialDrop = dropFromSlot(hotbar, 3, 1);
  assert.deepEqual(partialDrop, { itemId: 'planks_block', droppedCount: 1 });
  assert.equal(hotbar[3]?.count, 47);

  // Drop entire remaining stack from hotbar slot 3
  const fullDrop = dropFromSlot(hotbar, 3, 'all');
  assert.deepEqual(fullDrop, { itemId: 'planks_block', droppedCount: 47 });
  assert.equal(hotbar[3], null);

  // Dropping from empty or invalid slot returns null safely
  assert.equal(dropFromSlot(hotbar, 3, 1), null);
  assert.equal(dropFromSlot(backpack, 999, 1), null);
});

test('settings defaults and volume clamping stay within 0..1', () => {
  assert.equal(DEFAULT_SETTINGS.musicEnabled, true);
  assert.equal(DEFAULT_SETTINGS.sfxEnabled, true);
  assert.equal(clampVolume(-0.4), 0);
  assert.equal(clampVolume(1.8), 1);
  assert.equal(clampVolume(0.65), 0.65);
  assert.equal(clampVolume(Number.NaN), 0.5);
});

test('world generates treasure chests with basic Kotulhu and Cat Worm summoners and supports opening & placing chests', () => {
  const world = generateWorld(2025);
  const spawnX = Math.floor(world.width / 2);

  const leftChestX = spawnX - 15;
  const leftChestY = world.surfaceHeights[leftChestX] - 1;
  assert.equal(getTile(world, leftChestX, leftChestY), TileType.Chest);
  const leftLoot = world.chests[tileIndex(leftChestX, leftChestY, world.width)] ?? [];
  assert.ok(leftLoot.some((s) => s.itemId === 'summon_kotulhu'), 'Left surface chest must contain Kotulhu summoner');

  const rightChestX = spawnX + 16;
  const rightChestY = world.surfaceHeights[rightChestX] - 1;
  assert.equal(getTile(world, rightChestX, rightChestY), TileType.Chest);
  const rightLoot = world.chests[tileIndex(rightChestX, rightChestY, world.width)] ?? [];
  assert.ok(rightLoot.some((s) => s.itemId === 'summon_cat_worm'), 'Right surface chest must contain Cat Worm summoner');

  // Verify total generated chests >= 8
  assert.ok(Object.keys(world.chests).length >= 8);

  // Move player near left chest and verify tryPlaceItemAtTile triggers chest_open
  const player = createInitialPlayer(world);
  player.x = leftChestX * TILE_SIZE;
  player.y = (leftChestY - 1) * TILE_SIZE;
  const openRes = tryPlaceItemAtTile(world, player, 'planks_block', leftChestX, leftChestY);
  assert.equal(openRes.placed, false);
  assert.equal(openRes.action, 'chest_open');

  // Verify crafting & placing a new empty chest_item initializes its chest inventory
  const placeX = leftChestX + 2;
  const placeY = world.surfaceHeights[placeX] - 1;
  const placeRes = tryPlaceItemAtTile(world, player, 'chest_item', placeX, placeY);
  assert.equal(placeRes.placed, true);
  assert.equal(getTile(world, placeX, placeY), TileType.Chest);
  assert.deepEqual(world.chests[tileIndex(placeX, placeY, world.width)], []);
});

test('all 19 Terraria & cat bosses exist with summon items, distinct AI, and segment chains', () => {
  assert.equal(BOSS_KINDS.length, 19);
  const world = generateWorld(888);
  const player = createInitialPlayer(world);

  for (const kind of BOSS_KINDS) {
    assert.equal(isBossKind(kind), true);
    const summonItem = Object.values(ITEMS).find((it) => it.category === 'summon' && it.summonsBoss === kind);
    assert.ok(summonItem, `Missing summon item for boss ${kind}`);

    const boss = createEnemy(10, kind, player.x + 180, player.y - 60, 1);
    assert.ok(boss.maxHp >= 240, `Expected ${kind} maxHp >= 240, got ${boss.maxHp}`);
    if (kind === 'cat_worm') {
      assert.equal(boss.segments?.length, 9);
    }
    if (kind === 'the_destroyer') {
      assert.equal(boss.segments?.length, 14);
    }

    const startX = boss.x;
    let sawProjectile = false;
    for (let i = 0; i < 90; i++) {
      const res = stepEnemyAI(boss, player, world, 1 / 60, true);
      if (res.spawnProjectiles && res.spawnProjectiles.length > 0) {
        sawProjectile = true;
        for (const sp of res.spawnProjectiles) {
          assert.ok(Number.isFinite(sp.x) && Number.isFinite(sp.y) && Number.isFinite(sp.vx) && Number.isFinite(sp.vy));
        }
      }
    }
    assert.ok(Number.isFinite(boss.x) && Number.isFinite(boss.y));
    if (kind === 'cat_worm' || kind === 'the_destroyer' || kind === 'kotulhu' || kind === 'skele_cat') {
      assert.ok(Math.abs(boss.x - startX) > 1 || Math.abs(boss.vx) > 0);
    }
    if (kind === 'moon_lord' || kind === 'empress_light' || kind === 'the_twins') {
      assert.ok(sawProjectile || Math.abs(boss.x - startX) > 1, `Expected ${kind} to move or shoot`);
    }
  }

  assert.equal(isBossKind('slime'), false);
  assert.equal(ITEMS.summon_kotulhu.textureSrc, '/assets/aistudio/wait_518dc071.jpg');
  assert.equal(ITEMS.summon_cat_worm.textureSrc, '/assets/aistudio/chine_5a03a968.jpg');
});

test('expanded 1000x220 world supports both variants, Snow/Crimson biomes, obsidian underworld, and crystal highlands', () => {
  const classic = generateWorld(42069, 'crimson_classic');
  const highlands = generateWorld(42069, 'crystal_highlands');

  assert.equal(classic.width, 1000);
  assert.equal(classic.height, 220);
  assert.equal(WORLD_WIDTH, 1000);
  assert.equal(WORLD_HEIGHT, 220);
  assert.equal(classic.variant, 'crimson_classic');
  assert.equal(highlands.variant, 'crystal_highlands');

  assert.equal(getBiomeAtX(140, classic.width), 'snow');
  assert.equal(getBiomeAtX(500, classic.width), 'forest');
  assert.equal(getBiomeAtX(860, classic.width), 'crimson');

  // Snow biome surface is Snow
  assert.equal(getTile(classic, 140, classic.surfaceHeights[140]), TileType.Snow);
  // Crimson biome surface is CrimsonGrass
  assert.equal(getTile(classic, 860, classic.surfaceHeights[860]), TileType.CrimsonGrass);
  // Deep underworld floor contains Obsidian tiles
  let obsidianCount = 0;
  for (let x = 200; x < 300; x++) {
    for (let y = 192; y < classic.height - 2; y++) {
      if (getTile(classic, x, y) === TileType.Obsidian) obsidianCount++;
    }
  }
  assert.ok(obsidianCount > 10, `Expected underworld obsidian layer, got ${obsidianCount}`);

  // Crystal highlands spawns significantly more crystal blocks than crimson_classic
  let classicCrystals = 0;
  let highlandCrystals = 0;
  for (let i = 0; i < classic.tiles.length; i++) {
    if (classic.tiles[i] === TileType.CrystalBlock) classicCrystals++;
    if (highlands.tiles[i] === TileType.CrystalBlock) highlandCrystals++;
  }
  assert.ok(
    highlandCrystals > classicCrystals,
    `Expected crystal_highlands (${highlandCrystals}) > crimson_classic (${classicCrystals})`,
  );

  // Verify new blocks & pickPower requirements
  assert.equal(getTileRequiredPickPower(TileType.Obsidian), 3);
  assert.equal(getTileRequiredPickPower(TileType.Crimstone), 2);
  assert.equal(tileTypeToDropItem(TileType.Snow), 'snow_block');
  assert.equal(tileTypeToDropItem(TileType.Ice), 'ice_block');
  assert.equal(tileTypeToDropItem(TileType.Crimstone), 'crimstone_block');
  assert.equal(tileTypeToDropItem(TileType.Obsidian), 'obsidian_block');
  assert.equal(tileTypeToDropItem(TileType.CrystalBlock), 'crystal_block');
});

test('expanded arsenal includes 7 pickaxes, 9 swords, 6 bows with small clear recipes', () => {
  const pickaxes = Object.values(ITEMS).filter((it) => it.category === 'tool' && (it.pickPower ?? 0) >= 1);
  const swords = Object.values(ITEMS).filter((it) => it.category === 'weapon' && it.weaponKind === 'melee');
  const bows = Object.values(ITEMS).filter((it) => it.category === 'weapon' && it.weaponKind === 'bow');

  assert.ok(pickaxes.length >= 7, `Expected >= 7 pickaxes, got ${pickaxes.length}`);
  assert.ok(swords.length >= 9, `Expected >= 9 swords, got ${swords.length}`);
  assert.ok(bows.length >= 6, `Expected >= 6 bows, got ${bows.length}`);

  // All crafting recipes stay small and readable (max 3 ingredients, max 8 per ingredient)
  for (const r of RECIPES) {
    assert.ok(r.ingredients.length >= 1 && r.ingredients.length <= 3, `Recipe ${r.id} has ${r.ingredients.length} ingredients`);
    for (const ing of r.ingredients) {
      assert.ok(ing.count >= 1 && ing.count <= 8, `Recipe ${r.id} ingredient ${ing.itemId} asks for ${ing.count}`);
    }
  }

  // Test crafting new Snow Brick and Crystal Bow
  const { hotbar, backpack } = createStarterInventory();
  addItemToInventory(hotbar, backpack, 'snow_block', 2);
  addItemToInventory(hotbar, backpack, 'ice_block', 1);
  const snowBrickRecipe = RECIPES.find((r) => r.id === 'craft_snow_brick')!;
  assert.equal(craftRecipe(snowBrickRecipe, hotbar, backpack, ['hand', 'workbench']), true);
  assert.equal(countItemInInventory(hotbar, backpack, 'snow_brick'), 4);
});

test('teleportPlayerToCoords clamps bounds and moves safely above solid ground', () => {
  const world = generateWorld(42069);
  const player = createInitialPlayer(world);

  // Teleport into Snow biome underground solid tile -> lifts safely above solid ground
  const snowRes = teleportPlayerToCoords(player, world, 140, world.surfaceHeights[140] + 2);
  assert.equal(snowRes.tx, 140);
  assert.ok(snowRes.ty < world.surfaceHeights[140], 'Should surface above solid snow');
  assert.equal(Math.floor((player.x + player.width / 2) / TILE_SIZE), 140);

  // Teleport out-of-bounds -> clamped cleanly within [2..width-3]
  const clamped = teleportPlayerToCoords(player, world, 9999, -50);
  assert.equal(clamped.tx, world.width - 3);
  assert.ok(clamped.ty >= 2 && clamped.ty <= world.height - 3);
});

test('Terraria housing blueprint, inspectRoomHousing, and NPC villager settling + door opening', () => {
  const world = generateWorld(2026);
  const player = createInitialPlayer(world);
  const anchorX = Math.floor(world.width / 2) + 28;
  const floorY = world.surfaceHeights[anchorX];

  // Clear trees/foliage around anchor so chest/stool protection passes
  for (let x = anchorX - 6; x <= anchorX + 6; x++) {
    for (let y = floorY - 8; y < floorY; y++) {
      setTile(world, x, y, TileType.Air);
    }
  }

  // Build quick house via Terraria blueprint helper
  const built = buildQuickHouseAt(world, anchorX, floorY);
  assert.equal(built.built, true);

  // Verify room inspection meets all NPC housing criteria
  const { report } = inspectRoomHousing(world, anchorX, floorY - 2);
  assert.equal(report.valid, true);
  assert.equal(report.hasWall, true);
  assert.equal(report.hasLight, true);
  assert.equal(report.hasDoor, true);
  assert.equal(report.hasTable, true);
  assert.equal(report.hasSeat, true);
  assert.equal(report.hasHouseForNpc, true);

  // Verify findValidNpcHouses finds the constructed room
  const houses = findValidNpcHouses(world);
  assert.ok(houses.length >= 1, 'Expected at least 1 valid NPC house');

  // Sync villagers -> spawns Guide Максим and Merchant Борис (since >= 1 valid house) and assigns homes
  const npcs: NpcEntity[] = [];
  let nextNpcId = 100;
  const syncRes = syncVillageNpcs(npcs, world, () => nextNpcId++, player, false, false);
  assert.ok(syncRes.validHouseCount >= 1);
  assert.ok(npcs.some((n) => n.kind === 'guide' && n.homeTileX !== null));
  assert.ok(npcs.some((n) => n.kind === 'merchant'));

  // Force invite all 5 villagers
  syncVillageNpcs(npcs, world, () => nextNpcId++, player, false, true);
  assert.equal(npcs.length, 5);

  // Verify NPC AI opens a closed door directly ahead while walking
  const guide = npcs.find((n) => n.kind === 'guide')!;
  const doorX = anchorX - 4;
  assert.equal(getTile(world, doorX, floorY - 1), TileType.DoorClosed);
  guide.x = (doorX - 0.5) * TILE_SIZE - 8;
  guide.y = floorY * TILE_SIZE - guide.height;
  guide.facing = 1;
  guide.actionState = 'walk';
  guide.stateTimer = 2;
  stepNpcAI(guide, world, player, [], false, 1 / 60);
  assert.equal(getTile(world, doorX, floorY - 1), TileType.DoorOpen);
  assert.equal(getTile(world, doorX, floorY - 2), TileType.DoorOpen);
});

test('Terraria mechanics: rope climb, Cloud in a Bottle double jump, Hermes Boots speed, Grappling Hook, dynamite & pot drops', () => {
  const world = generateWorld(5151);
  const player = createInitialPlayer(world);
  const pxTile = Math.floor((player.x + player.width / 2) / TILE_SIZE);
  const sy = world.surfaceHeights[pxTile];

  // 1. Climbing Rope
  setTile(world, pxTile, sy - 1, TileType.Rope);
  setTile(world, pxTile, sy - 2, TileType.Rope);
  setTile(world, pxTile, sy - 3, TileType.Rope);
  const startY = player.y;
  for (let i = 0; i < 15; i++) {
    stepPlayerPhysics(
      player,
      world,
      { left: false, right: false, up: true, down: false, jumpHeld: false, jumpJustPressed: false },
      1 / 60,
    );
  }
  assert.ok(player.y < startY - 25, 'Cat should climb upward on Rope tiles');

  // 2. Cloud in a Bottle mid-air double jump
  player.onGround = false;
  player.coyoteTimer = 0;
  player.doubleJumpAvailable = true;
  player.vy = 100;
  const dj = stepPlayerPhysics(
    player,
    world,
    { left: false, right: false, up: false, down: false, jumpHeld: true, jumpJustPressed: true },
    1 / 60,
    { hasCloudInBottle: true },
  );
  assert.equal(dj.doubleJumped, true);
  assert.equal(player.doubleJumpAvailable, false);
  assert.ok(player.vy < -300);

  // 3. Hermes Boots speed boost
  const normalPlayer = createInitialPlayer(world);
  const bootsPlayer = createInitialPlayer(world);
  for (let i = 0; i < 20; i++) {
    stepPlayerPhysics(
      normalPlayer,
      world,
      { left: false, right: true, up: false, down: false, jumpHeld: false, jumpJustPressed: false },
      1 / 60,
    );
    stepPlayerPhysics(
      bootsPlayer,
      world,
      { left: false, right: true, up: false, down: false, jumpHeld: false, jumpJustPressed: false },
      1 / 60,
      { hasHermesBoots: true },
    );
  }
  assert.ok(bootsPlayer.x > normalPlayer.x + 15, 'Hermes Boots should noticeably boost horizontal distance');

  // 4. Grappling hook latches onto solid block and pulls player
  const anchorTileX = pxTile + 4;
  const anchorTileY = sy - 3;
  setTile(world, anchorTileX, anchorTileY, TileType.Stone);
  player.x = pxTile * TILE_SIZE;
  player.y = (sy - 2) * TILE_SIZE;
  player.grapple = {
    active: true,
    hooked: false,
    x: (anchorTileX + 0.5) * TILE_SIZE - 8,
    y: (anchorTileY + 0.5) * TILE_SIZE,
    vx: 600,
    vy: 0,
  };
  const preHookX = player.x;
  for (let i = 0; i < 10; i++) {
    stepPlayerPhysics(
      player,
      world,
      { left: false, right: false, up: false, down: false, jumpHeld: false, jumpJustPressed: false },
      1 / 60,
    );
  }
  assert.equal(player.grapple.hooked, true);
  assert.ok(player.x > preHookX, 'Grappling hook should pull cat toward latched stone');

  // 5. ExplodeTilesRadius destroys stone crater without destroying starter stool
  const dmgMap = new Map<number, number>();
  const centerX = Math.floor(world.width / 2);
  const stoolX = centerX + 2;
  const stoolY = world.surfaceHeights[stoolX] - 1;
  assert.equal(getTile(world, stoolX, stoolY), TileType.Stool);
  explodeTilesRadius(world, dmgMap, (stoolX + 0.5) * TILE_SIZE, (stoolY + 1.5) * TILE_SIZE, 2.2);
  assert.equal(getTile(world, stoolX, stoolY), TileType.Stool, 'Explosion must protect starter Stool');
  assert.equal(getTile(world, stoolX, stoolY + 1), TileType.Air, 'Explosion should blast ground around Stool');

  // 6. Pot loot drops always include coins & item
  const potLoot = rollPotDrops();
  assert.ok(potLoot.coins >= 4 && potLoot.items.length >= 1);
});

test('debug item giver validates ID, clamps count 1..999, and chest spawner places presets safely', () => {
  const { hotbar, backpack } = createStarterInventory();

  // Unknown item fails safely
  const bad = giveDebugItem(hotbar, backpack, 'nonexistent_item_xyz', 10);
  assert.equal(bad.ok, false);
  assert.equal(bad.given, 0);

  // Give Starfury (maxStack 1) with rawCount 0 -> clamps to 1
  const sf = giveDebugItem(hotbar, backpack, 'starfury', 0);
  assert.equal(sf.ok, true);
  assert.equal(sf.given, 1);
  assert.equal(countItemInInventory(hotbar, backpack, 'starfury'), 1);

  // Give wood_log with count 1200 -> clamps to 999
  const beforeWood = countItemInInventory(hotbar, backpack, 'wood_log');
  const wood = giveDebugItem(hotbar, backpack, 'wood_log', 1200);
  assert.equal(wood.ok, true);
  assert.equal(wood.given, 999);
  assert.equal(countItemInInventory(hotbar, backpack, 'wood_log'), beforeWood + 999);

  // Place debug chest near player with summons preset while protecting existing Stool
  const world = generateWorld(7777);
  const player = createInitialPlayer(world);
  const centerX = Math.floor(world.width / 2);
  const stoolX = centerX + 2;
  const stoolY = world.surfaceHeights[stoolX] - 1;
  assert.equal(getTile(world, stoolX, stoolY), TileType.Stool);

  const placed = placeDebugChestNearPlayer(world, player, 'summons');
  assert.equal(placed.placed, true);
  assert.equal(getTile(world, placed.tx, placed.ty), TileType.Chest);
  assert.equal(getTile(world, stoolX, stoolY), TileType.Stool, 'Starter Stool must not be overwritten');

  const chestItems = world.chests[tileIndex(placed.tx, placed.ty, world.width)] ?? [];
  assert.equal(chestItems.length, DEBUG_CHEST_PRESETS.summons.items.length);
  assert.ok(chestItems.some((it) => it.itemId === 'summon_kotulhu'));
  assert.ok(chestItems.some((it) => it.itemId === 'summon_cat_worm'));

  // Place empty chest near player -> initializes empty array
  const placedEmpty = placeDebugChestNearPlayer(world, player, 'empty');
  assert.equal(placedEmpty.placed, true);
  assert.deepEqual(world.chests[tileIndex(placedEmpty.tx, placedEmpty.ty, world.width)], []);
});

test('toggleDoorAtTile opens and closes entire 2-tile doorway stack and prevents closing on player', () => {
  const world = generateWorld(9090);
  const player = createInitialPlayer(world);
  const anchorX = Math.floor(world.width / 2) + 24;
  const floorY = world.surfaceHeights[anchorX];

  for (let x = anchorX - 6; x <= anchorX + 6; x++) {
    for (let y = floorY - 8; y < floorY; y++) {
      setTile(world, x, y, TileType.Air);
    }
  }
  const built = buildQuickHouseAt(world, anchorX, floorY);
  assert.equal(built.built, true);

  const doorX = anchorX - 4;
  assert.equal(getTile(world, doorX, floorY - 1), TileType.DoorClosed);
  assert.equal(getTile(world, doorX, floorY - 2), TileType.DoorClosed);

  // Stand outside doorway and toggle bottom door tile (even while holding a sword via tryPlaceItemAtTile OR direct toggleDoorAtTile)
  player.x = (doorX - 2) * TILE_SIZE;
  player.y = floorY * TILE_SIZE - player.height;

  const openRes = tryPlaceItemAtTile(world, player, 'wood_sword', doorX, floorY - 1);
  assert.equal(openRes.action, 'door_toggle');
  assert.equal(getTile(world, doorX, floorY - 1), TileType.DoorOpen);
  assert.equal(getTile(world, doorX, floorY - 2), TileType.DoorOpen);

  // Move player inside open doorway -> closing must be blocked safely
  player.x = doorX * TILE_SIZE + 2;
  const blockedClose = toggleDoorAtTile(world, player, doorX, floorY - 2);
  assert.equal(blockedClose.toggled, false);
  assert.equal(blockedClose.blockedByPlayer, true);
  assert.equal(getTile(world, doorX, floorY - 1), TileType.DoorOpen);

  // Step outside doorway -> closing closes both tiles together
  player.x = (doorX - 2) * TILE_SIZE;
  const closedRes = toggleDoorAtTile(world, player, doorX, floorY - 1);
  assert.equal(closedRes.toggled, true);
  assert.equal(closedRes.opened, false);
  assert.equal(getTile(world, doorX, floorY - 1), TileType.DoorClosed);
  assert.equal(getTile(world, doorX, floorY - 2), TileType.DoorClosed);
});

test('armor sets, 5 accessory slots, equipment bonuses, and Angel Wings flight work end-to-end', () => {
  const { hotbar, backpack } = createStarterInventory();
  const equipment = createInitialEquipment();
  assert.equal(equipment.accessories.length, 5);

  // Give and equip full Crimson armor set
  addItemToInventory(hotbar, backpack, 'crimson_helmet', 1);
  addItemToInventory(hotbar, backpack, 'crimson_chestplate', 1);
  addItemToInventory(hotbar, backpack, 'crimson_greaves', 1);

  for (const id of ['crimson_helmet', 'crimson_chestplate', 'crimson_greaves']) {
    const idx = backpack.findIndex((s) => s?.itemId === id);
    assert.ok(idx >= 0, `Expected ${id} in backpack`);
    const eqRes = equipItemFromInventory(hotbar, backpack, equipment, 'backpack', idx);
    assert.equal(eqRes.equipped, true);
  }

  let bonuses = computeEquipmentBonuses(equipment);
  assert.equal(bonuses.activeSet, 'crimson');
  assert.equal(bonuses.defense, 13);
  assert.ok(bonuses.hpRegenPerSec >= 2);

  // Swap to full Crystal set and add Cobalt Shield, Angel Wings, Celestial Emblem
  addItemToInventory(hotbar, backpack, 'crystal_helmet', 1);
  addItemToInventory(hotbar, backpack, 'crystal_chestplate', 1);
  addItemToInventory(hotbar, backpack, 'crystal_greaves', 1);
  addItemToInventory(hotbar, backpack, 'cobalt_shield', 1);
  addItemToInventory(hotbar, backpack, 'angel_wings', 1);
  addItemToInventory(hotbar, backpack, 'celestial_emblem', 1);

  for (const id of [
    'crystal_helmet',
    'crystal_chestplate',
    'crystal_greaves',
    'cobalt_shield',
    'angel_wings',
    'celestial_emblem',
  ]) {
    const idx = backpack.findIndex((s) => s?.itemId === id);
    assert.ok(idx >= 0, `Expected ${id} in backpack`);
    const eqRes = equipItemFromInventory(hotbar, backpack, equipment, 'backpack', idx);
    assert.equal(eqRes.equipped, true);
  }

  bonuses = computeEquipmentBonuses(equipment);
  assert.equal(bonuses.activeSet, 'crystal');
  assert.equal(bonuses.hasKnockbackImmune, true);
  assert.equal(bonuses.hasWings, true);
  assert.equal(bonuses.hasNoFallDamage, true);
  assert.equal(bonuses.maxManaBonus, 60); // 40 crystal set + 20 celestial emblem
  assert.ok(bonuses.damageMult >= 1.39);
  assert.ok(countItemInInventory(hotbar, backpack, 'crimson_helmet') === 1);

  // Unequip angel_wings from acc1 back to inventory
  const unequipped = unequipItemToInventory(hotbar, backpack, equipment, 'acc1');
  assert.equal(unequipped, true);
  assert.equal(equipment.accessories[1], null);
  assert.equal(countItemInInventory(hotbar, backpack, 'angel_wings'), 1);

  // Test Angel Wings mid-air flight and fuel consumption in physics
  const world = generateWorld(3333);
  const player = createInitialPlayer(world);
  player.onGround = false;
  player.coyoteTimer = 0;
  player.wingFuel = MAX_WING_FUEL;
  player.vy = 180;

  let flew = false;
  for (let i = 0; i < 12; i++) {
    const stepRes = stepPlayerPhysics(
      player,
      world,
      { left: false, right: false, up: false, down: false, jumpHeld: true, jumpJustPressed: false },
      1 / 60,
      { hasWings: true },
    );
    if (stepRes.flying) flew = true;
  }
  assert.equal(flew, true);
  assert.ok(player.wingFuel < MAX_WING_FUEL, 'Wing flight must consume wingFuel');
  assert.ok(player.vy < 0, 'Wing flight must lift player upward');
});



