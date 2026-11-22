import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKPACK_SIZE,
  HOTBAR_SIZE,
  ITEMS,
  RECIPES,
  STOOL_REPO_URL,
  addItemToInventory,
  canCraftRecipe,
  consumeItemFromInventory,
  countItemInInventory,
  countUsedSlots,
  craftRecipe,
  createStarterInventory,
  dropFromSlot,
  verifyDebugPassword,
} from './catalog';
import {
  computeDamageAfterDefense,
  createEnemy,
  createInitialPlayer,
  isBossKind,
  stepEnemyAI,
  stepPlayerPhysics,
  tryDamageTile,
  tryPlaceItemAtTile,
} from './physics';
import { DEFAULT_SETTINGS, clampVolume } from './settings';
import { EnemyKind, TILE_SIZE, TileType, WallType } from './types';
import {
  generateWorld,
  getNearbyStations,
  getTile,
  getWall,
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

test('all 5 bosses exist with summon items, distinct AI, and Cat Worm body segments', () => {
  const bossKinds: EnemyKind[] = ['king_slime', 'kotulhu', 'cat_worm', 'skele_cat', 'eye_boss'];
  const world = generateWorld(888);
  const player = createInitialPlayer(world);

  for (const kind of bossKinds) {
    assert.equal(isBossKind(kind), true);
    const summonItem = Object.values(ITEMS).find((it) => it.category === 'summon' && it.summonsBoss === kind);
    assert.ok(summonItem, `Missing summon item for boss ${kind}`);

    const boss = createEnemy(10, kind, player.x + 180, player.y - 60, 1);
    assert.ok(boss.maxHp >= 240);
    if (kind === 'cat_worm') {
      assert.equal(boss.segments?.length, 9);
    }

    const startX = boss.x;
    for (let i = 0; i < 30; i++) {
      stepEnemyAI(boss, player, world, 1 / 60, true);
    }
    assert.ok(Number.isFinite(boss.x) && Number.isFinite(boss.y));
    if (kind === 'cat_worm' || kind === 'kotulhu' || kind === 'skele_cat') {
      assert.ok(Math.abs(boss.x - startX) > 1 || Math.abs(boss.vx) > 0);
    }
  }

  assert.equal(isBossKind('slime'), false);
  assert.equal(ITEMS.summon_kotulhu.textureSrc, '/assets/aistudio/wait_518dc071.jpg');
  assert.equal(ITEMS.summon_cat_worm.textureSrc, '/assets/aistudio/chine_5a03a968.jpg');
});

