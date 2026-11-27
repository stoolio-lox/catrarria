import { DEBUG_CHEST_PRESETS, ITEMS, tileTypeToDropItem, wallTypeToDropItem } from './catalog';
import {
  DebugChestPreset,
  EnemyEntity,
  EnemyKind,
  Language,
  PlayerState,
  TILE_SIZE,
  TileType,
  WallType,
  WorldData,
} from './types';
import {
  getTile,
  getTileMaxDamage,
  getTileRequiredPickPower,
  getWall,
  inBounds,
  isTileMineable,
  isTilePlatform,
  isTileSolid,
  setTile,
  setWall,
  tileIndex,
} from './worldGen';

export const GRAVITY = 1280;
export const MAX_FALL_SPEED = 720;
export const PLAYER_MOVE_SPEED = 245;
export const PLAYER_JUMP_SPEED = 510;

export interface InputIntent {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
}

export const MAX_WING_FUEL = 1.6;

export function createInitialPlayer(world: WorldData): PlayerState {
  const spawnTileX = Math.floor(world.width / 2);
  const spawnTileY = world.surfaceHeights[spawnTileX];
  const width = 26;
  const height = 42;
  const x = spawnTileX * TILE_SIZE + (TILE_SIZE - width) / 2;
  const y = spawnTileY * TILE_SIZE - height - 2;

  return {
    x,
    y,
    vx: 0,
    vy: 0,
    width,
    height,
    facing: 1,
    onGround: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    doubleJumpAvailable: true,
    wingFuel: MAX_WING_FUEL,
    hp: 100,
    maxHp: 100,
    mana: 60,
    maxMana: 60,
    defense: 2,
    coins: 25,
    invulnTimer: 0,
    hitFlashTimer: 0,
    walkDistance: 0,
    squashX: 1,
    squashY: 1,
    attackTimer: 0,
    attackDuration: 0.25,
    attackAngle: 0,
    activeWeaponId: 'zazu_sword',
    spawnX: x,
    spawnY: y,
    houseValid: false,
    effects: [],
    grapple: {
      active: false,
      hooked: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    },
  };
}

export function teleportPlayerToCoords(
  player: PlayerState,
  world: WorldData,
  tileX: number,
  tileY: number,
): { tx: number; ty: number } {
  const tx = Math.max(2, Math.min(world.width - 3, Math.round(Number.isFinite(tileX) ? tileX : Math.floor(world.width / 2))));
  const ty = Math.max(2, Math.min(world.height - 3, Math.round(Number.isFinite(tileY) ? tileY : 20)));
  let safeTy = ty;

  if (
    isTileSolid(getTile(world, tx, safeTy)) ||
    isTileSolid(getTile(world, tx, safeTy - 1))
  ) {
    for (let checkY = safeTy; checkY >= 2; checkY--) {
      if (
        !isTileSolid(getTile(world, tx, checkY)) &&
        !isTileSolid(getTile(world, tx, checkY - 1))
      ) {
        safeTy = checkY;
        break;
      }
    }
  }

  player.x = tx * TILE_SIZE + (TILE_SIZE - player.width) / 2;
  player.y = (safeTy + 1) * TILE_SIZE - player.height - 0.5;
  player.vx = 0;
  player.vy = 0;
  return { tx, ty: safeTy };
}

export function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function moveEntityWithTiles(
  entity: { x: number; y: number; vx: number; vy: number; width: number; height: number; onGround: boolean },
  world: WorldData,
  dt: number,
  dropThroughPlatforms = false,
): { landed: boolean; hitWall: boolean } {
  let landed = false;
  let hitWall = false;

  // Horizontal move + resolve
  entity.x += entity.vx * dt;
  const minTileY = Math.floor((entity.y + 2) / TILE_SIZE);
  const maxTileY = Math.floor((entity.y + entity.height - 2) / TILE_SIZE);

  if (entity.vx > 0) {
    const rightTile = Math.floor((entity.x + entity.width) / TILE_SIZE);
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      if (isTileSolid(getTile(world, rightTile, ty))) {
        entity.x = rightTile * TILE_SIZE - entity.width - 0.01;
        entity.vx = 0;
        hitWall = true;
        break;
      }
    }
  } else if (entity.vx < 0) {
    const leftTile = Math.floor(entity.x / TILE_SIZE);
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      if (isTileSolid(getTile(world, leftTile, ty))) {
        entity.x = (leftTile + 1) * TILE_SIZE + 0.01;
        entity.vx = 0;
        hitWall = true;
        break;
      }
    }
  }

  // Clamp inside world bounds
  if (entity.x < 4) {
    entity.x = 4;
    entity.vx = 0;
    hitWall = true;
  }
  const maxX = world.width * TILE_SIZE - entity.width - 4;
  if (entity.x > maxX) {
    entity.x = maxX;
    entity.vx = 0;
    hitWall = true;
  }

  // Vertical move + resolve
  const prevBottom = entity.y + entity.height;
  entity.y += entity.vy * dt;
  const wasOnGround = entity.onGround;
  entity.onGround = false;

  const leftCol = Math.floor((entity.x + 2) / TILE_SIZE);
  const rightCol = Math.floor((entity.x + entity.width - 2) / TILE_SIZE);

  if (entity.vy >= 0) {
    const bottomRow = Math.floor((entity.y + entity.height) / TILE_SIZE);
    for (let tx = leftCol; tx <= rightCol; tx++) {
      const tile = getTile(world, tx, bottomRow);
      const solid = isTileSolid(tile);
      const plat = !dropThroughPlatforms && isTilePlatform(tile) && prevBottom <= bottomRow * TILE_SIZE + 6;
      if (solid || plat) {
        entity.y = bottomRow * TILE_SIZE - entity.height;
        entity.vy = 0;
        entity.onGround = true;
        if (!wasOnGround) landed = true;
        break;
      }
    }
  } else {
    const topRow = Math.floor(entity.y / TILE_SIZE);
    for (let tx = leftCol; tx <= rightCol; tx++) {
      if (isTileSolid(getTile(world, tx, topRow))) {
        entity.y = (topRow + 1) * TILE_SIZE + 0.01;
        entity.vy = 0;
        break;
      }
    }
  }

  return { landed, hitWall };
}

export interface PlayerAccessoryBonuses {
  hasCloudInBottle?: boolean;
  hasHermesBoots?: boolean;
  speedMult?: number;
  jumpMult?: number;
  hasDoubleJump?: boolean;
  hasWings?: boolean;
  manaRegenBonus?: number;
  gravityMult?: number;
  invertHorizontal?: boolean;
}

export function stepPlayerPhysics(
  player: PlayerState,
  world: WorldData,
  input: InputIntent,
  dt: number,
  bonuses?: PlayerAccessoryBonuses,
): { jumped: boolean; doubleJumped: boolean; landed: boolean; flying: boolean } {
  let jumped = false;
  let doubleJumped = false;
  let flying = false;

  const pcx = player.x + player.width / 2;
  const pcy = player.y + player.height / 2;
  const rawDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const moveDir = bonuses?.invertHorizontal ? -rawDir : rawDir;
  const speedMult = bonuses?.speedMult ?? (bonuses?.hasHermesBoots ? 1.38 : 1);
  const jumpMult = bonuses?.jumpMult ?? 1;
  const gravityMult = bonuses?.gravityMult ?? 1;
  const canDoubleJump = Boolean(bonuses?.hasDoubleJump || bonuses?.hasCloudInBottle);
  const hasWings = Boolean(bonuses?.hasWings);
  const manaRate = (player.houseValid ? 8 : 5) + (bonuses?.manaRegenBonus ?? 0);

  // Grappling hook flight & pull
  if (player.grapple.active) {
    if (!player.grapple.hooked) {
      player.grapple.x += player.grapple.vx * dt;
      player.grapple.y += player.grapple.vy * dt;
      const gtx = Math.floor(player.grapple.x / TILE_SIZE);
      const gty = Math.floor(player.grapple.y / TILE_SIZE);
      if (isTileSolid(getTile(world, gtx, gty))) {
        player.grapple.hooked = true;
        player.grapple.vx = 0;
        player.grapple.vy = 0;
        player.doubleJumpAvailable = true;
        player.wingFuel = MAX_WING_FUEL;
      } else if (Math.hypot(player.grapple.x - pcx, player.grapple.y - pcy) > 350) {
        player.grapple.active = false;
      }
    }

    if (player.grapple.active && player.grapple.hooked) {
      if (input.jumpJustPressed) {
        player.grapple.active = false;
        player.grapple.hooked = false;
        player.vy = -PLAYER_JUMP_SPEED * 0.92 * jumpMult;
        jumped = true;
      } else {
        const dx = player.grapple.x - pcx;
        const dy = player.grapple.y - pcy;
        const dist = Math.hypot(dx, dy);
        if (dist > 26) {
          const pullSpeed = 540;
          player.vx = (dx / dist) * pullSpeed;
          player.vy = (dy / dist) * pullSpeed;
        } else {
          player.vx = 0;
          player.vy = 0;
        }
        const { landed } = moveEntityWithTiles(player, world, dt, true);
        player.invulnTimer = Math.max(0, player.invulnTimer - dt);
        player.hitFlashTimer = Math.max(0, player.hitFlashTimer - dt);
        player.attackTimer = Math.max(0, player.attackTimer - dt);
        player.mana = Math.min(player.maxMana, player.mana + manaRate * dt);
        return { jumped, doubleJumped, landed, flying: false };
      }
    }
  }

  // Check if cat is overlapping a Rope tile
  const centerTx = Math.floor(pcx / TILE_SIZE);
  const topTy = Math.floor((player.y + 4) / TILE_SIZE);
  const botTy = Math.floor((player.y + player.height - 4) / TILE_SIZE);
  const touchingRope =
    getTile(world, centerTx, topTy) === TileType.Rope ||
    getTile(world, centerTx, botTy) === TileType.Rope;

  const targetVx = moveDir * PLAYER_MOVE_SPEED * speedMult;
  const accel = player.onGround ? 18 : 11;
  player.vx += (targetVx - player.vx) * Math.min(1, accel * dt);
  if (Math.abs(player.vx) < 3 && moveDir === 0) player.vx = 0;
  if (moveDir !== 0) {
    player.facing = moveDir > 0 ? 1 : -1;
  }

  // Coyote time & jump buffer
  if (player.onGround) {
    player.coyoteTimer = 0.1;
    player.doubleJumpAvailable = true;
    player.wingFuel = MAX_WING_FUEL;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }

  if (input.jumpJustPressed) {
    player.jumpBufferTimer = 0.12;
  } else {
    player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
  }

  if (touchingRope && (input.up || input.down)) {
    player.vy = input.up ? -210 : 225;
    player.vx *= 0.85;
    player.doubleJumpAvailable = true;
    player.wingFuel = MAX_WING_FUEL;
    player.coyoteTimer = 0.08;
  } else {
    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
      player.vy = -PLAYER_JUMP_SPEED * jumpMult;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      player.squashX = 0.84;
      player.squashY = 1.18;
      jumped = true;
    } else if (
      input.jumpJustPressed &&
      !player.onGround &&
      player.coyoteTimer <= 0 &&
      canDoubleJump &&
      player.doubleJumpAvailable
    ) {
      player.vy = -PLAYER_JUMP_SPEED * 0.95 * jumpMult;
      player.doubleJumpAvailable = false;
      player.jumpBufferTimer = 0;
      player.squashX = 0.86;
      player.squashY = 1.16;
      doubleJumped = true;
    }

    // Angel Wings flight + glide!
    if (hasWings && !player.onGround && player.coyoteTimer <= 0 && input.jumpHeld) {
      if (player.wingFuel > 0) {
        player.vy = Math.max(-390, player.vy - 1850 * dt);
        player.wingFuel = Math.max(0, player.wingFuel - dt);
        flying = true;
      } else {
        // Gentle wing glide when fuel runs out
        player.vy = Math.min(MAX_FALL_SPEED * 0.3, player.vy + GRAVITY * 0.35 * dt);
        flying = true;
      }
    } else {
      // Variable jump height cut when jump key released early
      if (!input.jumpHeld && player.vy < -180) {
        player.vy *= 0.65;
      }
      const maxFall = gravityMult < 0.8 ? MAX_FALL_SPEED * 0.45 : MAX_FALL_SPEED;
      player.vy = Math.min(maxFall, player.vy + GRAVITY * gravityMult * dt);
    }
  }

  const { landed } = moveEntityWithTiles(player, world, dt, input.down);
  if (landed) {
    player.squashX = 1.22;
    player.squashY = 0.78;
    player.doubleJumpAvailable = true;
    player.wingFuel = MAX_WING_FUEL;
  }

  // Walk cycle synced strictly to horizontal distance traveled
  if (player.onGround) {
    player.walkDistance += Math.abs(player.vx) * dt;
  }

  // Exponentially damp squash/stretch back to 1
  const damp = Math.min(1, dt * 14);
  player.squashX += (1 - player.squashX) * damp;
  player.squashY += (1 - player.squashY) * damp;

  // Timers & mana regeneration
  player.invulnTimer = Math.max(0, player.invulnTimer - dt);
  player.hitFlashTimer = Math.max(0, player.hitFlashTimer - dt);
  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.mana = Math.min(player.maxMana, player.mana + manaRate * dt);

  return { jumped, doubleJumped, landed, flying };
}

export function canReachTile(
  player: PlayerState,
  tx: number,
  ty: number,
  maxTiles = 5.5,
): boolean {
  const pcx = player.x + player.width / 2;
  const pcy = player.y + player.height / 2;
  const tcx = (tx + 0.5) * TILE_SIZE;
  const tcy = (ty + 0.5) * TILE_SIZE;
  const dist = Math.hypot(tcx - pcx, tcy - pcy);
  return dist <= maxTiles * TILE_SIZE;
}

export function hasAdjacentSupport(world: WorldData, tx: number, ty: number): boolean {
  if (getWall(world, tx, ty) !== WallType.None) return true;
  const neighbors = [
    [tx + 1, ty],
    [tx - 1, ty],
    [tx, ty + 1],
    [tx, ty - 1],
  ];
  for (const [nx, ny] of neighbors) {
    if (getTile(world, nx, ny) !== TileType.Air) return true;
  }
  return false;
}

export function toggleDoorAtTile(
  world: WorldData,
  player: PlayerState,
  tx: number,
  ty: number,
): { toggled: boolean; opened: boolean; blockedByPlayer: boolean } {
  if (!inBounds(tx, ty, world)) {
    return { toggled: false, opened: false, blockedByPlayer: false };
  }
  const curTile = getTile(world, tx, ty);
  if (curTile !== TileType.DoorClosed && curTile !== TileType.DoorOpen) {
    return { toggled: false, opened: false, blockedByPlayer: false };
  }

  // Gather the entire contiguous vertical door stack (2-3 tiles tall)
  const doorYs: number[] = [ty];
  for (let dy = -1; dy >= -3; dy--) {
    const ny = ty + dy;
    if (!inBounds(tx, ny, world) || getTile(world, tx, ny) !== curTile) break;
    doorYs.push(ny);
  }
  for (let dy = 1; dy <= 3; dy++) {
    const ny = ty + dy;
    if (!inBounds(tx, ny, world) || getTile(world, tx, ny) !== curTile) break;
    doorYs.push(ny);
  }

  if (curTile === TileType.DoorClosed) {
    for (const y of doorYs) {
      setTile(world, tx, y, TileType.DoorOpen);
    }
    return { toggled: true, opened: true, blockedByPlayer: false };
  }

  // Only close if player is not standing inside any tile of this doorway
  for (const y of doorYs) {
    if (
      rectsOverlap(
        player.x,
        player.y,
        player.width,
        player.height,
        tx * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
      )
    ) {
      return { toggled: false, opened: true, blockedByPlayer: true };
    }
  }

  for (const y of doorYs) {
    setTile(world, tx, y, TileType.DoorClosed);
  }
  return { toggled: true, opened: false, blockedByPlayer: false };
}

export function tryPlaceItemAtTile(
  world: WorldData,
  player: PlayerState,
  itemId: string,
  tx: number,
  ty: number,
): {
  placed: boolean;
  action: 'tile' | 'wall' | 'door_toggle' | 'bed_spawn' | 'stool_interact' | 'chest_open' | 'none';
} {
  if (!inBounds(tx, ty, world)) return { placed: false, action: 'none' };
  if (!canReachTile(player, tx, ty, 6.2)) return { placed: false, action: 'none' };

  const curTile = getTile(world, tx, ty);

  // Interact with chest on right click
  if (curTile === TileType.Chest) {
    return { placed: false, action: 'chest_open' };
  }

  // Interact with stool on right click
  if (curTile === TileType.Stool) {
    return { placed: false, action: 'stool_interact' };
  }

  // Interact with door (opens/closes full vertical door stack)
  if (curTile === TileType.DoorClosed || curTile === TileType.DoorOpen) {
    const res = toggleDoorAtTile(world, player, tx, ty);
    return { placed: false, action: res.toggled ? 'door_toggle' : 'none' };
  }

  // Set spawn point on bed
  if (curTile === TileType.Bed) {
    player.spawnX = tx * TILE_SIZE + 2;
    player.spawnY = ty * TILE_SIZE - player.height - 2;
    return { placed: false, action: 'bed_spawn' };
  }

  const def = ITEMS[itemId];
  if (!def) return { placed: false, action: 'none' };

  if (def.placesWall !== undefined) {
    const curWall = getWall(world, tx, ty);
    if (curWall !== WallType.None) return { placed: false, action: 'none' };
    setWall(world, tx, ty, def.placesWall);
    return { placed: true, action: 'wall' };
  }

  if (def.placesTile !== undefined) {
    if (
      curTile !== TileType.Air &&
      curTile !== TileType.Leaves &&
      curTile !== TileType.CrimsonLeaves
    ) {
      return { placed: false, action: 'none' };
    }
    if (!hasAdjacentSupport(world, tx, ty)) {
      return { placed: false, action: 'none' };
    }
    // Prevent burying player inside solid block
    if (isTileSolid(def.placesTile)) {
      const boxX = tx * TILE_SIZE;
      const boxY = ty * TILE_SIZE;
      if (rectsOverlap(player.x, player.y, player.width, player.height, boxX, boxY, TILE_SIZE, TILE_SIZE)) {
        return { placed: false, action: 'none' };
      }
    }
    setTile(world, tx, ty, def.placesTile);
    if (def.placesTile === TileType.Bed) {
      player.spawnX = tx * TILE_SIZE + 2;
      player.spawnY = ty * TILE_SIZE - player.height - 2;
    } else if (def.placesTile === TileType.Chest) {
      const idx = tileIndex(tx, ty, world.width);
      if (!world.chests[idx]) {
        world.chests[idx] = [];
      }
    }
    return { placed: true, action: 'tile' };
  }

  return { placed: false, action: 'none' };
}

export function tryDamageTile(
  world: WorldData,
  tileDamageMap: Map<number, number>,
  tx: number,
  ty: number,
  pickPower: number,
): { broken: boolean; droppedItemId: string | null; hitTile: TileType } {
  if (!inBounds(tx, ty, world)) {
    return { broken: false, droppedItemId: null, hitTile: TileType.Air };
  }
  const tile = getTile(world, tx, ty);

  // If tile is Air, allow breaking player-placed background walls
  if (!isTileMineable(tile)) {
    const wall = getWall(world, tx, ty);
    if (
      wall === WallType.WoodWall ||
      wall === WallType.StoneWall ||
      wall === WallType.BrickWall ||
      wall === WallType.SnowWall ||
      wall === WallType.CrimsonWall ||
      wall === WallType.MarbleWall ||
      wall === WallType.SandstoneWall
    ) {
      setWall(world, tx, ty, WallType.None);
      return { broken: true, droppedItemId: wallTypeToDropItem(wall), hitTile: TileType.Air };
    }
    return { broken: false, droppedItemId: null, hitTile: TileType.Air };
  }

  const req = getTileRequiredPickPower(tile);
  if (pickPower < req) {
    return { broken: false, droppedItemId: null, hitTile: tile };
  }

  const key = ty * world.width + tx;
  const maxDmg = getTileMaxDamage(tile);
  const nextDmg = (tileDamageMap.get(key) ?? 0) + pickPower;

  if (nextDmg >= maxDmg) {
    tileDamageMap.delete(key);
    setTile(world, tx, ty, TileType.Air);
    // If block below grass is broken or grass itself is broken, drop dirt
    return {
      broken: true,
      droppedItemId: tileTypeToDropItem(tile),
      hitTile: tile,
    };
  } else {
    tileDamageMap.set(key, nextDmg);
    return { broken: false, droppedItemId: null, hitTile: tile };
  }
}

export const PILLAR_KINDS: EnemyKind[] = [
  'solar_pillar',
  'vortex_pillar',
  'nebula_pillar',
  'stardust_pillar',
];

const PILLAR_KIND_SET = new Set<EnemyKind>(PILLAR_KINDS);

export function isPillarKind(kind: EnemyKind): boolean {
  return PILLAR_KIND_SET.has(kind);
}

export const BOSS_KINDS: EnemyKind[] = [
  'king_slime',
  'eye_boss',
  'kotulhu',
  'cat_worm',
  'pharaoh_cat',
  'jester_cat',
  'sun_cat',
  'atomic_cat',
  'party_cat',
  'melon_bandit',
  'brain_cthulhu',
  'queen_bee',
  'deerclops',
  'skele_cat',
  'wall_of_flesh',
  'martian_saucer',
  'queen_slime',
  'the_twins',
  'the_destroyer',
  'skeletron_prime',
  'plantera',
  'golem',
  'duke_fishron',
  'empress_light',
  'lunatic_cultist',
  'solar_pillar',
  'vortex_pillar',
  'nebula_pillar',
  'stardust_pillar',
  'moon_lord',
];

const BOSS_KIND_SET = new Set<EnemyKind>(BOSS_KINDS);

export function isBossKind(kind: EnemyKind): boolean {
  return BOSS_KIND_SET.has(kind);
}

export function getEnemyName(enemy: EnemyEntity, lang: Language = 'en'): string {
  return lang === 'ru' ? (enemy.nameRu ?? enemy.name) : enemy.name;
}

export function createEnemy(
  id: number,
  kind: EnemyKind,
  x: number,
  y: number,
  difficultyScale = 1,
  _lang: Language = 'en',
): EnemyEntity {
  const mult = Math.max(1, difficultyScale);
  const base = (
    name: string,
    nameRu: string,
    width: number,
    height: number,
    hp: number,
    damage: number,
    defense: number,
    drops: { itemId: string; min: number; max: number; chance: number }[],
    extra?: Partial<EnemyEntity>,
  ): EnemyEntity => ({
    id,
    kind,
    name,
    nameRu,
    x,
    y,
    vx: 0,
    vy: 0,
    width,
    height,
    hp: Math.round(hp * mult),
    maxHp: Math.round(hp * mult),
    damage: Math.round(damage * mult),
    defense,
    facing: 1,
    onGround: false,
    aiState: 'patrol',
    stateTimer: 1.0,
    hitFlashTimer: 0,
    koTimer: 0,
    animPhase: Math.random() * Math.PI * 2,
    drops,
    ...extra,
  });

  switch (kind) {
    // === STANDARD & BIOME MOBS ===
    case 'slime':
      return base('Green Slime', 'Зелёный слизень', 28, 22, 28, 10, 1, [
        { itemId: 'slime_gel', min: 1, max: 3, chance: 1 },
        { itemId: 'crispy_fish', min: 1, max: 1, chance: 0.28 },
      ], { stateTimer: 0.7 });
    case 'ice_slime':
      return base('Ice Slime', 'Ледяной слизень', 30, 22, 36, 13, 2, [
        { itemId: 'slime_gel', min: 1, max: 3, chance: 1 },
        { itemId: 'ice_block', min: 2, max: 4, chance: 0.6 },
      ], { stateTimer: 0.7 });
    case 'sand_slime':
      return base('Sand Slime', 'Песчаный слизень', 28, 22, 34, 13, 2, [
        { itemId: 'slime_gel', min: 1, max: 3, chance: 1 },
        { itemId: 'sand_block', min: 2, max: 4, chance: 0.65 },
      ], { stateTimer: 0.7 });
    case 'bat':
      return base('Cave Bat', 'Пещерная мышь', 28, 20, 24, 12, 1, [
        { itemId: 'coal_ore', min: 1, max: 2, chance: 0.6 },
        { itemId: 'monster_bone', min: 1, max: 1, chance: 0.4 },
      ]);
    case 'ice_bat':
      return base('Ice Bat', 'Ледяная мышь', 28, 20, 32, 15, 2, [
        { itemId: 'ice_block', min: 1, max: 3, chance: 0.7 },
        { itemId: 'fallen_star', min: 1, max: 1, chance: 0.2 },
      ]);
    case 'hellbat':
      return base('Hellbat', 'Адская мышь', 30, 22, 54, 22, 3, [
        { itemId: 'obsidian_block', min: 1, max: 3, chance: 0.55 },
        { itemId: 'coal_ore', min: 2, max: 4, chance: 0.7 },
      ]);
    case 'goblin':
      return base('Goblin Scout', 'Гоблин-разбойник', 26, 40, 46, 16, 3, [
        { itemId: 'iron_ore', min: 1, max: 3, chance: 0.65 },
        { itemId: 'monster_bone', min: 1, max: 2, chance: 0.75 },
        { itemId: 'crispy_fish', min: 1, max: 1, chance: 0.35 },
      ]);
    case 'skeleton':
      return base('Bone Skeleton', 'Костяной страж', 26, 44, 58, 20, 4, [
        { itemId: 'monster_bone', min: 2, max: 4, chance: 1 },
        { itemId: 'gold_ore', min: 1, max: 2, chance: 0.45 },
      ]);
    case 'frost_viking':
      return base('Undead Viking', 'Снежный викинг', 28, 46, 72, 22, 5, [
        { itemId: 'monster_bone', min: 2, max: 4, chance: 1 },
        { itemId: 'ice_block', min: 3, max: 5, chance: 0.8 },
        { itemId: 'iron_ore', min: 2, max: 3, chance: 0.55 },
      ]);
    case 'antlion':
      return base('Antlion Charger', 'Муравьиный лев', 34, 28, 62, 20, 4, [
        { itemId: 'sand_block', min: 3, max: 6, chance: 1 },
        { itemId: 'cactus_block', min: 1, max: 3, chance: 0.5 },
      ]);
    case 'mummy':
      return base('Pyramid Mummy', 'Мумия Пирамиды', 28, 46, 82, 24, 5, [
        { itemId: 'sandstone_brick', min: 2, max: 5, chance: 0.85 },
        { itemId: 'monster_bone', min: 2, max: 3, chance: 0.9 },
        { itemId: 'summon_pharaoh_cat', min: 1, max: 1, chance: 0.2 },
      ]);
    case 'crimera':
      return base('Crimera', 'Кримера', 34, 26, 64, 22, 4, [
        { itemId: 'crimstone_block', min: 2, max: 4, chance: 0.85 },
        { itemId: 'monster_bone', min: 1, max: 2, chance: 0.6 },
      ]);
    case 'face_monster':
      return base('Face Monster', 'Кровавый монстр', 32, 46, 78, 25, 5, [
        { itemId: 'crimstone_block', min: 2, max: 5, chance: 0.9 },
        { itemId: 'crimson_wood', min: 2, max: 4, chance: 0.6 },
      ]);
    case 'blood_crawler':
      return base('Blood Crawler', 'Кровавый паук', 36, 26, 70, 23, 4, [
        { itemId: 'crimstone_block', min: 2, max: 4, chance: 0.8 },
        { itemId: 'healing_potion', min: 1, max: 1, chance: 0.3 },
      ]);
    case 'pixie':
      return base('Crystal Pixie', 'Кристальная пикси', 28, 28, 76, 24, 4, [
        { itemId: 'crystal_block', min: 2, max: 4, chance: 0.85 },
        { itemId: 'fallen_star', min: 1, max: 2, chance: 0.35 },
      ]);
    case 'sand_shark':
      return base('Ocean Shark', 'Морская акула', 44, 26, 94, 28, 5, [
        { itemId: 'crispy_fish', min: 2, max: 4, chance: 1 },
        { itemId: 'summon_duke_fishron', min: 1, max: 1, chance: 0.14 },
      ]);
    case 'fire_imp':
      return base('Fire Imp', 'Огненный бес', 28, 36, 86, 28, 5, [
        { itemId: 'obsidian_block', min: 2, max: 4, chance: 0.8 },
        { itemId: 'ruby_gem', min: 1, max: 2, chance: 0.35 },
      ]);
    case 'fire_demon':
      return base('Underworld Demon', 'Демон преисподней', 38, 48, 128, 34, 7, [
        { itemId: 'obsidian_block', min: 3, max: 6, chance: 1 },
        { itemId: 'summon_wall_of_flesh', min: 1, max: 1, chance: 0.25 },
      ]);

    // === LUNAR PILLAR MOBS ===
    case 'solar_corite':
      return base('Solar Corite', 'Солнечный корит', 34, 34, 150, 40, 8, [
        { itemId: 'solar_fragment', min: 1, max: 2, chance: 0.9 },
      ]);
    case 'vortex_alien':
      return base('Vortex Storm Diver', 'Вихревой штурмовик', 32, 42, 145, 38, 8, [
        { itemId: 'vortex_fragment', min: 1, max: 2, chance: 0.9 },
      ]);
    case 'nebula_floater':
      return base('Nebula Floater', 'Мозговик Туманности', 34, 38, 145, 39, 7, [
        { itemId: 'nebula_fragment', min: 1, max: 2, chance: 0.9 },
      ]);
    case 'stardust_cell':
      return base('Stardust Cell', 'Клетка Звёздной Пыли', 34, 34, 140, 36, 7, [
        { itemId: 'stardust_fragment', min: 1, max: 2, chance: 0.9 },
      ]);

    // === ALIEN INVASION ===
    case 'alien_cat':
      return base('Mars Alien Cat', 'Марсианский Кот', 38, 44, 125, 30, 6, [
        { itemId: 'fallen_star', min: 1, max: 2, chance: 0.5 },
        { itemId: 'mana_potion', min: 1, max: 2, chance: 0.4 },
      ]);
    case 'alien_drone':
      return base('Martian Drone', 'Марсианский Дрон', 34, 28, 95, 26, 5, [
        { itemId: 'iron_bar', min: 1, max: 3, chance: 0.6 },
        { itemId: 'healing_potion', min: 1, max: 1, chance: 0.35 },
      ]);
    case 'martian_saucer':
      return base('Martian Saucer (Boss)', 'Марсианская Тарелка (Босс)', 106, 62, 1350, 48, 14, [
        { itemId: 'alien_blaster', min: 1, max: 1, chance: 1 },
        { itemId: 'crystal_block', min: 10, max: 16, chance: 1 },
        { itemId: 'life_crystal', min: 1, max: 2, chance: 0.85 },
      ]);

    // === 4 CELESTIAL PILLARS ===
    case 'solar_pillar':
      return base('Solar Pillar', 'Солнечная Башня', 76, 132, 1600, 44, 14, [
        { itemId: 'solar_fragment', min: 12, max: 18, chance: 1 },
        { itemId: 'fallen_star', min: 4, max: 6, chance: 1 },
      ], { shield: 8, maxShield: 8, pillarKind: 'solar', summonTimer: 3.5, stateTimer: 1.6 });
    case 'vortex_pillar':
      return base('Vortex Pillar', 'Вихревая Башня', 76, 132, 1600, 44, 14, [
        { itemId: 'vortex_fragment', min: 12, max: 18, chance: 1 },
        { itemId: 'fallen_star', min: 4, max: 6, chance: 1 },
      ], { shield: 8, maxShield: 8, pillarKind: 'vortex', summonTimer: 3.5, stateTimer: 1.6 });
    case 'nebula_pillar':
      return base('Nebula Pillar', 'Башня Туманности', 76, 132, 1600, 44, 14, [
        { itemId: 'nebula_fragment', min: 12, max: 18, chance: 1 },
        { itemId: 'fallen_star', min: 4, max: 6, chance: 1 },
      ], { shield: 8, maxShield: 8, pillarKind: 'nebula', summonTimer: 3.5, stateTimer: 1.6 });
    case 'stardust_pillar':
      return base('Stardust Pillar', 'Башня Звёздной Пыли', 76, 132, 1600, 44, 14, [
        { itemId: 'stardust_fragment', min: 12, max: 18, chance: 1 },
        { itemId: 'fallen_star', min: 4, max: 6, chance: 1 },
      ], { shield: 8, maxShield: 8, pillarKind: 'stardust', summonTimer: 3.5, stateTimer: 1.6 });

    // === 6 MEME CAT BOSSES ===
    case 'pharaoh_cat':
      return base('Naserafal II — Pharaoh Cat', 'Насерафал II — Кот-Фараон', 78, 78, 680, 34, 9, [
        { itemId: 'pharaoh_staff', min: 1, max: 1, chance: 1 },
        { itemId: 'sandstone_brick', min: 15, max: 25, chance: 1 },
        { itemId: 'gold_bar', min: 6, max: 10, chance: 1 },
        { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
      ], { summonTimer: 5.5 });
    case 'jester_cat':
      return base('Jester Cat (Boss)', 'Кот-Шут (Босс)', 74, 74, 820, 38, 10, [
        { itemId: 'jester_cards', min: 1, max: 1, chance: 1 },
        { itemId: 'fallen_star', min: 5, max: 9, chance: 1 },
        { itemId: 'healing_potion', min: 3, max: 5, chance: 1 },
      ]);
    case 'sun_cat':
      return base('Solar Zazu (Boss)', 'Солнечный Зазу (Босс)', 80, 80, 1180, 46, 13, [
        { itemId: 'dawnbreaker_sword', min: 1, max: 1, chance: 1 },
        { itemId: 'solar_fragment', min: 5, max: 9, chance: 1 },
        { itemId: 'gold_bar', min: 8, max: 12, chance: 1 },
      ]);
    case 'atomic_cat':
      return base('Atomic Nuke Cat (Boss)', 'Атомный Кот (Босс)', 86, 78, 1360, 52, 15, [
        { itemId: 'atomic_launcher', min: 1, max: 1, chance: 1 },
        { itemId: 'dynamite', min: 10, max: 16, chance: 1 },
        { itemId: 'obsidian_block', min: 14, max: 22, chance: 1 },
      ]);
    case 'party_cat':
      return base('Propeller Lollipop Cat (Boss)', 'Кот с Пропеллером (Босс)', 76, 80, 960, 40, 11, [
        { itemId: 'lollipop_wand', min: 1, max: 1, chance: 1 },
        { itemId: 'shiny_red_balloon', min: 1, max: 1, chance: 0.65 },
        { itemId: 'angel_wings', min: 1, max: 1, chance: 0.45 },
      ]);
    case 'melon_bandit':
      return base('Watermelon Outlaw Cat ($1M)', 'Арбузный Кот-Бандит ($1M)', 78, 78, 1080, 44, 12, [
        { itemId: 'melon_blaster', min: 1, max: 1, chance: 1 },
        { itemId: 'bounty_badge', min: 1, max: 1, chance: 1 },
        { itemId: 'life_crystal', min: 1, max: 2, chance: 1 },
      ]);

    // === CLASSIC & TERRARIA BOSSES ===
    case 'king_slime':
      return base('King Slime Cat', 'Король Слизней-Котов', 68, 54, 240, 20, 4, [
        { itemId: 'slime_gel', min: 10, max: 16, chance: 1 },
        { itemId: 'gold_bar', min: 3, max: 5, chance: 1 },
        { itemId: 'catnip_elixir', min: 1, max: 1, chance: 1 },
      ], { summonTimer: 4.5, stateTimer: 1.1 });
    case 'kotulhu':
      return base('Kotulhu (Boss)', 'Котулху (Босс)', 66, 66, 320, 26, 5, [
        { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
        { itemId: 'iron_bar', min: 5, max: 8, chance: 1 },
        { itemId: 'warm_milk', min: 2, max: 3, chance: 1 },
      ], { stateTimer: 1.3 });
    case 'cat_worm': {
      const segs: { x: number; y: number }[] = [];
      for (let i = 1; i <= 9; i++) {
        segs.push({ x: x + i * 24, y });
      }
      return base('Cat Worm (Boss)', 'Котовый Червь (Босс)', 54, 54, 380, 24, 6, [
        { itemId: 'iron_bar', min: 6, max: 10, chance: 1 },
        { itemId: 'gold_bar', min: 4, max: 6, chance: 1 },
        { itemId: 'catnip_elixir', min: 1, max: 1, chance: 1 },
      ], { segments: segs, stateTimer: 1.8 });
    }
    case 'skele_cat':
      return base('Skeletron Cat (Boss)', 'Кототрон (Босс)', 64, 64, 440, 30, 8, [
        { itemId: 'monster_bone', min: 10, max: 16, chance: 1 },
        { itemId: 'ruby_gem', min: 4, max: 7, chance: 1 },
        { itemId: 'gold_bar', min: 5, max: 8, chance: 1 },
      ], { stateTimer: 1.5 });
    case 'eye_boss':
      return base('Eye of Cthulhu (Boss)', 'Глаз Ктулху (Босс)', 56, 56, 280, 24, 5, [
        { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
        { itemId: 'gold_bar', min: 3, max: 5, chance: 1 },
        { itemId: 'catnip_elixir', min: 1, max: 1, chance: 1 },
      ], { stateTimer: 1.4 });
    case 'brain_cthulhu':
      return base('Brain of Cthulhu', 'Мозг Ктулху', 74, 68, 360, 26, 6, [
        { itemId: 'crimstone_block', min: 10, max: 18, chance: 1 },
        { itemId: 'crimson_helmet', min: 1, max: 1, chance: 0.45 },
        { itemId: 'ruby_gem', min: 2, max: 4, chance: 1 },
      ], { summonTimer: 4.0, stateTimer: 1.4 });
    case 'queen_bee':
      return base('Queen Bee', 'Королева Пчёл', 68, 58, 410, 28, 7, [
        { itemId: 'gold_bar', min: 5, max: 9, chance: 1 },
        { itemId: 'healing_potion', min: 3, max: 5, chance: 1 },
        { itemId: 'shiny_red_balloon', min: 1, max: 1, chance: 0.35 },
      ], { stateTimer: 1.2 });
    case 'deerclops':
      return base('Deerclops', 'Циклоп-Олень', 72, 86, 500, 32, 8, [
        { itemId: 'ice_block', min: 12, max: 20, chance: 1 },
        { itemId: 'fallen_star', min: 4, max: 7, chance: 1 },
        { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
      ], { stateTimer: 1.2 });
    case 'wall_of_flesh':
      return base('Wall of Flesh', 'Стена Плоти', 84, 168, 640, 36, 10, [
        { itemId: 'obsidian_block', min: 12, max: 18, chance: 1 },
        { itemId: 'cobalt_shield', min: 1, max: 1, chance: 0.5 },
        { itemId: 'crystal_block', min: 8, max: 14, chance: 1 },
      ], { stateTimer: 1.4 });
    case 'queen_slime':
      return base('Queen Slime', 'Королева Слизней', 76, 62, 740, 38, 11, [
        { itemId: 'crystal_block', min: 10, max: 16, chance: 1 },
        { itemId: 'angel_wings', min: 1, max: 1, chance: 0.35 },
        { itemId: 'crystal_chestplate', min: 1, max: 1, chance: 0.4 },
      ], { summonTimer: 5.5, stateTimer: 1.1 });
    case 'the_twins':
      return base('The Twins (Retinazer & Spazmatism)', 'Близнецы (Ретиназер и Спазматизм)', 78, 70, 860, 42, 12, [
        { itemId: 'crystal_block', min: 10, max: 18, chance: 1 },
        { itemId: 'gold_bar', min: 8, max: 12, chance: 1 },
        { itemId: 'mana_flower', min: 1, max: 1, chance: 0.45 },
      ], { stateTimer: 1.15 });
    case 'the_destroyer': {
      const segs: { x: number; y: number }[] = [];
      for (let i = 1; i <= 14; i++) {
        segs.push({ x: x + i * 24, y });
      }
      return base('The Destroyer', 'Уничтожитель', 60, 60, 980, 44, 14, [
        { itemId: 'iron_bar', min: 12, max: 18, chance: 1 },
        { itemId: 'crystal_block', min: 10, max: 16, chance: 1 },
        { itemId: 'obsidian_block', min: 10, max: 16, chance: 1 },
      ], { segments: segs, stateTimer: 1.5 });
    }
    case 'skeletron_prime':
      return base('Skeletron Prime', 'Скелетрон Прайм', 76, 76, 1040, 46, 14, [
        { itemId: 'monster_bone', min: 12, max: 20, chance: 1 },
        { itemId: 'crystal_block', min: 12, max: 18, chance: 1 },
        { itemId: 'cobalt_shield', min: 1, max: 1, chance: 0.45 },
      ], { stateTimer: 1.25 });
    case 'plantera':
      return base('Plantera', 'Плантера', 78, 78, 1200, 48, 15, [
        { itemId: 'life_crystal', min: 2, max: 3, chance: 1 },
        { itemId: 'ruby_gem', min: 6, max: 10, chance: 1 },
        { itemId: 'crystal_helmet', min: 1, max: 1, chance: 0.45 },
      ], { stateTimer: 1.2 });
    case 'golem':
      return base('Temple Golem', 'Голем Храма', 82, 84, 1350, 52, 18, [
        { itemId: 'gold_bar', min: 10, max: 16, chance: 1 },
        { itemId: 'obsidian_block', min: 14, max: 20, chance: 1 },
        { itemId: 'celestial_emblem', min: 1, max: 1, chance: 0.5 },
      ], { stateTimer: 1.1 });
    case 'duke_fishron':
      return base('Duke Fishron', 'Герцог Рыброн', 84, 66, 1520, 56, 16, [
        { itemId: 'crispy_fish', min: 8, max: 14, chance: 1 },
        { itemId: 'angel_wings', min: 1, max: 1, chance: 0.6 },
        { itemId: 'crystal_block', min: 14, max: 22, chance: 1 },
      ], { stateTimer: 0.95 });
    case 'empress_light':
      return base('Empress of Light', 'Императрица Света', 78, 82, 1700, 60, 16, [
        { itemId: 'fallen_star', min: 10, max: 16, chance: 1 },
        { itemId: 'celestial_emblem', min: 1, max: 1, chance: 0.6 },
        { itemId: 'crystal_greaves', min: 1, max: 1, chance: 0.5 },
      ], { stateTimer: 1.0 });
    case 'lunatic_cultist':
      return base('Lunatic Cultist', 'Культист-Лунатик', 56, 70, 1860, 62, 18, [
        { itemId: 'fallen_star', min: 12, max: 20, chance: 1 },
        { itemId: 'crystal_block', min: 16, max: 24, chance: 1 },
        { itemId: 'mana_potion', min: 5, max: 8, chance: 1 },
      ], { stateTimer: 1.05 });
    case 'moon_lord':
      return base('Moon Lord (Final Boss)', 'Лунный Лорд (Финальный босс)', 112, 116, 2500, 68, 22, [
        { itemId: 'meowmere_blade', min: 1, max: 1, chance: 1 },
        { itemId: 'terra_blade', min: 1, max: 1, chance: 1 },
        { itemId: 'angel_wings', min: 1, max: 1, chance: 0.85 },
        { itemId: 'life_crystal', min: 3, max: 5, chance: 1 },
        { itemId: 'fallen_star', min: 15, max: 25, chance: 1 },
      ], { stateTimer: 1.15 });
  }
}

export interface EnemyProjectileSpawn {
  kind: 'slime_glob' | 'cursed_orb' | 'stinger' | 'phantasmal_bolt' | 'laser';
  vx: number;
  vy: number;
  color: string;
  radius: number;
  damage?: number;
}

export function stepEnemyAI(
  enemy: EnemyEntity,
  player: PlayerState,
  world: WorldData,
  dt: number,
  allowAttackToken: boolean,
): {
  spawnSlimeGlob?: { vx: number; vy: number };
  spawnMinionKind?: EnemyKind;
  spawnProjectiles?: EnemyProjectileSpawn[];
} {
  enemy.animPhase += dt * 7;
  enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);

  if (enemy.aiState === 'ko') {
    enemy.koTimer -= dt;
    enemy.vy += GRAVITY * 0.8 * dt;
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    return {};
  }

  const dx = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
  const dy = player.y + player.height / 2 - (enemy.y + enemy.height / 2);
  const dist = Math.hypot(dx, dy);
  const len = Math.max(1, dist);
  const dir: 1 | -1 = dx >= 0 ? 1 : -1;
  enemy.stateTimer -= dt;

  // Policy 0: Celestial Pillars (stationary hovering monoliths with shield + minion summoning)
  if (isPillarKind(enemy.kind)) {
    enemy.vx = 0;
    enemy.vy = Math.sin(enemy.animPhase * 0.35) * 14;
    enemy.y += enemy.vy * dt;
    enemy.facing = dir;

    let spawnMinionKind: EnemyKind | undefined;
    if (dist < 1100) {
      enemy.summonTimer = (enemy.summonTimer ?? 3.5) - dt;
      if (enemy.summonTimer <= 0) {
        enemy.summonTimer = 4.6;
        spawnMinionKind =
          enemy.kind === 'solar_pillar'
            ? 'solar_corite'
            : enemy.kind === 'vortex_pillar'
              ? 'vortex_alien'
              : enemy.kind === 'nebula_pillar'
                ? 'nebula_floater'
                : 'stardust_cell';
      }
    }

    const spawnProjectiles: EnemyProjectileSpawn[] = [];
    if (enemy.stateTimer <= 0) {
      enemy.stateTimer = 1.9;
      if (dist < 560) {
        const boltColor =
          enemy.kind === 'solar_pillar'
            ? '#f97316'
            : enemy.kind === 'vortex_pillar'
              ? '#14b8a6'
              : enemy.kind === 'nebula_pillar'
                ? '#e879f9'
                : '#38bdf8';
        spawnProjectiles.push(
          { kind: 'phantasmal_bolt', vx: (dx / len) * 350, vy: (dy / len) * 350, color: boltColor, radius: 9 },
          { kind: 'cursed_orb', vx: (dx / len) * 290 + 45, vy: (dy / len) * 290 - 50, color: boltColor, radius: 8 },
        );
      }
    }
    return {
      spawnMinionKind,
      spawnProjectiles: spawnProjectiles.length > 0 ? spawnProjectiles : undefined,
    };
  }

  // Policy 1: Slime (Green Slime, Ice Slime, Sand Slime)
  if (enemy.kind === 'slime' || enemy.kind === 'ice_slime' || enemy.kind === 'sand_slime') {
    if (enemy.onGround) {
      enemy.vx *= Math.max(0, 1 - dt * 10);
      if (enemy.aiState === 'patrol' && enemy.stateTimer <= 0) {
        if (dist < 460 && allowAttackToken) {
          enemy.aiState = 'windup';
          enemy.stateTimer = 0.35;
          enemy.facing = dir;
        } else {
          enemy.facing = Math.random() < 0.5 ? 1 : -1;
          enemy.vx = enemy.facing * 95;
          enemy.vy = -260;
          enemy.stateTimer = 1.0 + Math.random() * 0.6;
        }
      } else if (enemy.aiState === 'windup' && enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        enemy.vx = enemy.facing * 185;
        enemy.vy = -380;
        enemy.stateTimer = 0.7;
      } else if (enemy.aiState === 'attack' && enemy.stateTimer <= 0) {
        enemy.aiState = 'patrol';
        enemy.stateTimer = 0.85;
      }
    }
    enemy.vy = Math.min(MAX_FALL_SPEED, enemy.vy + GRAVITY * dt);
    moveEntityWithTiles(enemy, world, dt, false);
    return {};
  }

  // Policy 2: Aerial Swarm & Pillar Mobs
  if (
    enemy.kind === 'bat' ||
    enemy.kind === 'ice_bat' ||
    enemy.kind === 'crimera' ||
    enemy.kind === 'pixie' ||
    enemy.kind === 'hellbat' ||
    enemy.kind === 'fire_imp' ||
    enemy.kind === 'fire_demon' ||
    enemy.kind === 'solar_corite' ||
    enemy.kind === 'vortex_alien' ||
    enemy.kind === 'nebula_floater' ||
    enemy.kind === 'stardust_cell' ||
    enemy.kind === 'alien_drone'
  ) {
    enemy.facing = dir;
    const isCaster =
      enemy.kind === 'fire_imp' ||
      enemy.kind === 'fire_demon' ||
      enemy.kind === 'vortex_alien' ||
      enemy.kind === 'nebula_floater' ||
      enemy.kind === 'alien_drone';
    const spawnProjectiles: EnemyProjectileSpawn[] = [];

    if (enemy.aiState === 'patrol') {
      const targetSpeed = enemy.kind.endsWith('bat') ? 90 : 125;
      const hoverX = Math.cos(enemy.animPhase * 0.5) * 90 + (dist > 140 ? dir * targetSpeed : -dir * 45);
      const hoverY = Math.sin(enemy.animPhase) * 40 + (dy < -20 ? -55 : dy > 60 ? 55 : 0);
      enemy.vx += (hoverX - enemy.vx) * Math.min(1, dt * 4);
      enemy.vy += (hoverY - enemy.vy) * Math.min(1, dt * 4);
      if (dist < 380 && enemy.stateTimer <= 0 && allowAttackToken) {
        enemy.aiState = 'windup';
        enemy.stateTimer = 0.4;
      }
    } else if (enemy.aiState === 'windup') {
      enemy.vx *= 0.9;
      enemy.vy = -35;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        const dash = enemy.kind === 'solar_corite' ? 410 : 330;
        enemy.vx = (dx / len) * dash;
        enemy.vy = (dy / len) * dash;
        enemy.stateTimer = 0.55;
        if (isCaster) {
          const projColor =
            enemy.kind === 'alien_drone'
              ? '#22c55e'
              : enemy.kind === 'nebula_floater'
                ? '#e879f9'
                : enemy.kind === 'vortex_alien'
                  ? '#14b8a6'
                  : '#f97316';
          spawnProjectiles.push({
            kind: enemy.kind === 'alien_drone' || enemy.kind === 'vortex_alien' ? 'laser' : 'cursed_orb',
            vx: (dx / len) * 370,
            vy: (dy / len) * 370,
            color: projColor,
            radius: 7,
          });
        }
      }
    } else if (enemy.aiState === 'attack') {
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'recover';
        enemy.stateTimer = 0.8;
      }
    } else {
      enemy.vx *= 0.94;
      enemy.vy = -70;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'patrol';
        enemy.stateTimer = 1.1;
      }
    }
    moveEntityWithTiles(enemy, world, dt, true);
    return {
      spawnProjectiles: spawnProjectiles.length > 0 ? spawnProjectiles : undefined,
    };
  }

  // Policy 3: Ground Walkers, Desert / Crimson / Snow / Ocean Mobs & Alien Cat
  if (
    enemy.kind === 'goblin' ||
    enemy.kind === 'skeleton' ||
    enemy.kind === 'frost_viking' ||
    enemy.kind === 'antlion' ||
    enemy.kind === 'mummy' ||
    enemy.kind === 'face_monster' ||
    enemy.kind === 'blood_crawler' ||
    enemy.kind === 'sand_shark' ||
    enemy.kind === 'alien_cat'
  ) {
    const speed =
      enemy.kind === 'alien_cat'
        ? 175
        : enemy.kind === 'sand_shark' || enemy.kind === 'blood_crawler'
          ? 160
          : enemy.kind === 'goblin'
            ? 145
            : 122;
    const spawnProjectiles: EnemyProjectileSpawn[] = [];
    if (enemy.aiState === 'patrol') {
      enemy.facing = dir;
      enemy.vx += (dir * speed - enemy.vx) * Math.min(1, dt * 8);
      const engageDist = enemy.kind === 'alien_cat' || enemy.kind === 'antlion' ? 290 : 150;
      if (dist < engageDist && Math.abs(dy) < 95 && enemy.stateTimer <= 0 && allowAttackToken) {
        enemy.aiState = 'windup';
        enemy.stateTimer = 0.36;
        enemy.vx = 0;
      }
    } else if (enemy.aiState === 'windup') {
      enemy.vx *= 0.8;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        enemy.vx = enemy.facing * (speed * 2.05);
        if (enemy.onGround) enemy.vy = enemy.kind === 'alien_cat' ? -330 : -220;
        enemy.stateTimer = 0.45;
        if (enemy.kind === 'alien_cat') {
          spawnProjectiles.push({
            kind: 'laser',
            vx: (dx / len) * 440,
            vy: (dy / len) * 440,
            color: '#22c55e',
            radius: 7,
          });
        } else if (enemy.kind === 'antlion') {
          spawnProjectiles.push({
            kind: 'slime_glob',
            vx: (dx / len) * 320,
            vy: (dy / len) * 320 - 50,
            color: '#eab308',
            radius: 7,
          });
        }
      }
    } else if (enemy.aiState === 'attack') {
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'recover';
        enemy.stateTimer = 0.65;
      }
    } else {
      enemy.vx *= 0.85;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'patrol';
        enemy.stateTimer = 0.9;
      }
    }

    enemy.vy = Math.min(MAX_FALL_SPEED, enemy.vy + GRAVITY * dt);
    const { hitWall } = moveEntityWithTiles(enemy, world, dt, false);
    if (hitWall && enemy.onGround) {
      enemy.vy = -420;
    }
    return {
      spawnProjectiles: spawnProjectiles.length > 0 ? spawnProjectiles : undefined,
    };
  }

  // Policy 4: Leaping Ground Bosses (King Slime, Queen Slime, Deerclops, Golem)
  if (
    enemy.kind === 'king_slime' ||
    enemy.kind === 'queen_slime' ||
    enemy.kind === 'deerclops' ||
    enemy.kind === 'golem'
  ) {
    let spawnMinionKind: EnemyKind | undefined;
    const spawnProjectiles: EnemyProjectileSpawn[] = [];
    if (enemy.kind === 'king_slime' || enemy.kind === 'queen_slime') {
      enemy.summonTimer = (enemy.summonTimer ?? 4) - dt;
      if (enemy.summonTimer <= 0) {
        enemy.summonTimer = enemy.kind === 'queen_slime' ? 5.6 : 5.2;
        spawnMinionKind = enemy.kind === 'queen_slime' ? 'bat' : 'slime';
      }
    }

    if (enemy.onGround) {
      enemy.vx *= Math.max(0, 1 - dt * 8);
      if (enemy.aiState === 'patrol' && enemy.stateTimer <= 0) {
        enemy.aiState = 'windup';
        enemy.stateTimer = enemy.kind === 'golem' ? 0.38 : 0.45;
        enemy.facing = dir;
      } else if (enemy.aiState === 'windup' && enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        const bigJump = Math.random() < 0.4;
        const leapVx = enemy.kind === 'golem' ? 275 : enemy.kind === 'queen_slime' ? 255 : 225;
        enemy.vx = enemy.facing * (bigJump ? leapVx : leapVx * 0.78);
        enemy.vy = bigJump ? -580 : -420;
        enemy.stateTimer = 0.85;

        if (enemy.kind === 'queen_slime') {
          spawnProjectiles.push(
            { kind: 'slime_glob', vx: (dx / len) * 340, vy: (dy / len) * 340 - 40, color: '#f472b6', radius: 9 },
            { kind: 'slime_glob', vx: (dx / len) * 290, vy: (dy / len) * 290 - 95, color: '#a5f3fc', radius: 8 },
          );
        } else if (enemy.kind === 'deerclops') {
          spawnProjectiles.push({
            kind: 'cursed_orb',
            vx: enemy.facing * 310,
            vy: -90,
            color: '#7dd3fc',
            radius: 10,
          });
        } else if (enemy.kind === 'golem') {
          spawnProjectiles.push(
            { kind: 'laser', vx: (dx / len) * 430, vy: (dy / len) * 430, color: '#facc15', radius: 8 },
            { kind: 'cursed_orb', vx: (dx / len) * 330, vy: -140, color: '#f97316', radius: 10 },
          );
        }
      } else if (enemy.aiState === 'attack' && enemy.stateTimer <= 0) {
        enemy.aiState = 'patrol';
        enemy.stateTimer = 0.65;
      }
    }
    enemy.vy = Math.min(MAX_FALL_SPEED, enemy.vy + GRAVITY * dt);
    const { hitWall } = moveEntityWithTiles(enemy, world, dt, false);
    if (hitWall && enemy.onGround) {
      enemy.vy = -510;
    }
    return {
      spawnMinionKind,
      spawnProjectiles: spawnProjectiles.length > 0 ? spawnProjectiles : undefined,
    };
  }

  // Policy 5: Burrowing Serpentine Worms (Cat Worm 9 segs & The Destroyer 14 segs + lasers!)
  if (enemy.kind === 'cat_worm' || enemy.kind === 'the_destroyer') {
    const isDestroyer = enemy.kind === 'the_destroyer';
    const spawnProjectiles: EnemyProjectileSpawn[] = [];
    enemy.facing = dir;
    if (enemy.aiState === 'patrol') {
      const targetAngle = Math.atan2(dy + Math.sin(enemy.animPhase * 0.45) * 95, dx);
      const speed = isDestroyer ? 285 : 230;
      enemy.vx += (Math.cos(targetAngle) * speed - enemy.vx) * Math.min(1, dt * 3.4);
      enemy.vy += (Math.sin(targetAngle) * speed - enemy.vy) * Math.min(1, dt * 3.4);
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'windup';
        enemy.stateTimer = isDestroyer ? 0.35 : 0.45;
      }
    } else if (enemy.aiState === 'windup') {
      enemy.vx *= 0.92;
      enemy.vy *= 0.92;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        const chargeSpeed = isDestroyer ? 520 : 430;
        enemy.vx = (dx / len) * chargeSpeed;
        enemy.vy = (dy / len) * chargeSpeed;
        enemy.stateTimer = 0.72;
        if (isDestroyer) {
          spawnProjectiles.push(
            { kind: 'laser', vx: (dx / len) * 460, vy: (dy / len) * 460, color: '#ef4444', radius: 7 },
            { kind: 'laser', vx: (dx / len) * 420 + 60, vy: (dy / len) * 420 - 55, color: '#f87171', radius: 7 },
          );
        }
      }
    } else if (enemy.aiState === 'attack') {
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'patrol';
        enemy.stateTimer = isDestroyer ? 1.25 : 1.65;
      }
    }

    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    const maxWX = world.width * TILE_SIZE - enemy.width - 16;
    const maxWY = world.height * TILE_SIZE - enemy.height - 16;
    enemy.x = Math.max(16, Math.min(maxWX, enemy.x));
    enemy.y = Math.max(16, Math.min(maxWY, enemy.y));

    if (enemy.segments && enemy.segments.length > 0) {
      let prevX = enemy.x + enemy.width / 2;
      let prevY = enemy.y + enemy.height / 2;
      const segSpacing = isDestroyer ? 24 : 26;
      for (const seg of enemy.segments) {
        const sdx = prevX - seg.x;
        const sdy = prevY - seg.y;
        const sdist = Math.hypot(sdx, sdy);
        if (sdist > segSpacing) {
          seg.x = prevX - (sdx / sdist) * segSpacing;
          seg.y = prevY - (sdy / sdist) * segSpacing;
        }
        prevX = seg.x;
        prevY = seg.y;
      }
    }
    return {
      spawnProjectiles: spawnProjectiles.length > 0 ? spawnProjectiles : undefined,
    };
  }

  // Policy 6: Wall of Flesh (Inexorable towering sweep + laser barrages)
  if (enemy.kind === 'wall_of_flesh') {
    enemy.facing = dir;
    const isPhase2 = enemy.hp < enemy.maxHp * 0.5;
    const marchSpeed = isPhase2 ? 155 : 112;
    enemy.vx += (dir * marchSpeed - enemy.vx) * Math.min(1, dt * 3);
    const targetY = player.y + player.height / 2 - enemy.height / 2;
    enemy.vy += (Math.max(-130, Math.min(130, (targetY - enemy.y) * 2.0)) - enemy.vy) * Math.min(1, dt * 3);
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    if (enemy.stateTimer <= 0) {
      enemy.stateTimer = isPhase2 ? 0.95 : 1.35;
      return {
        spawnProjectiles: [
          { kind: 'laser', vx: (dx / len) * 440, vy: (dy / len) * 440, color: '#f43f5e', radius: 8 },
          { kind: 'cursed_orb', vx: (dx / len) * 350, vy: (dy / len) * 350 - 70, color: '#a855f7', radius: 9 },
        ],
      };
    }
    return {};
  }

  // Policy 7: Swooping Aerial Bosses (Queen Bee, Duke Fishron, Empress of Light)
  if (
    enemy.kind === 'queen_bee' ||
    enemy.kind === 'duke_fishron' ||
    enemy.kind === 'empress_light'
  ) {
    const isPhase2 = enemy.hp < enemy.maxHp * 0.5;
    enemy.facing = dir;
    if (enemy.aiState === 'patrol') {
      const targetX = player.x - dir * 230;
      const targetY = player.y - 75 + Math.sin(enemy.animPhase * 0.7) * 55;
      const topSpeed = enemy.kind === 'queen_bee' ? 280 : 350;
      enemy.vx += (Math.max(-topSpeed, Math.min(topSpeed, (targetX - enemy.x) * 3.2)) - enemy.vx) * Math.min(1, dt * 5);
      enemy.vy += (Math.max(-topSpeed, Math.min(topSpeed, (targetY - enemy.y) * 3.2)) - enemy.vy) * Math.min(1, dt * 5);
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'windup';
        enemy.stateTimer = isPhase2 ? 0.3 : 0.42;
      }
    } else if (enemy.aiState === 'windup') {
      enemy.vx *= 0.85;
      enemy.vy *= 0.85;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        const dashSpeed =
          enemy.kind === 'duke_fishron' ? 560 : enemy.kind === 'empress_light' ? 520 : 440;
        enemy.vx = (dx / len) * dashSpeed;
        enemy.vy = (dy / len) * (dashSpeed * 0.65);
        enemy.stateTimer = 0.55;

        if (enemy.kind === 'queen_bee') {
          return {
            spawnProjectiles: [
              { kind: 'stinger', vx: (dx / len) * 390, vy: (dy / len) * 390, color: '#facc15', radius: 7 },
              { kind: 'stinger', vx: (dx / len) * 370, vy: (dy / len) * 370 - 50, color: '#eab308', radius: 7 },
            ],
          };
        }
        if (enemy.kind === 'duke_fishron') {
          return {
            spawnProjectiles: [
              { kind: 'cursed_orb', vx: (dx / len) * 380, vy: (dy / len) * 380, color: '#2dd4bf', radius: 11 },
              { kind: 'cursed_orb', vx: (dx / len) * 320, vy: (dy / len) * 320 - 80, color: '#38bdf8', radius: 10 },
            ],
          };
        }
        return {
          spawnProjectiles: [
            { kind: 'phantasmal_bolt', vx: (dx / len) * 440, vy: (dy / len) * 440, color: '#f472b6', radius: 9 },
            { kind: 'phantasmal_bolt', vx: (dx / len) * 410 + 70, vy: (dy / len) * 410 - 65, color: '#facc15', radius: 9 },
            { kind: 'phantasmal_bolt', vx: (dx / len) * 410 - 70, vy: (dy / len) * 410 + 65, color: '#38bdf8', radius: 9 },
          ],
        };
      }
    } else if (enemy.aiState === 'attack') {
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'recover';
        enemy.stateTimer = isPhase2 ? 0.5 : 0.72;
      }
    } else {
      enemy.vx *= 0.9;
      enemy.vy *= 0.9;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'patrol';
        enemy.stateTimer = isPhase2 ? 0.78 : 1.05;
      }
    }
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    return {};
  }

  // Policy 8: Hover / Bullet-Hell Bosses + Meme Cat Bosses + Martian Saucer
  const isPhase2 = enemy.hp < enemy.maxHp * 0.5;
  enemy.facing = dir;
  let spawnMinionKind: EnemyKind | undefined;
  if (enemy.kind === 'pharaoh_cat') {
    enemy.summonTimer = (enemy.summonTimer ?? 5.5) - dt;
    if (enemy.summonTimer <= 0) {
      enemy.summonTimer = 6.5;
      spawnMinionKind = 'mummy';
    }
  }

  if (enemy.aiState === 'patrol') {
    const hoverRadius =
      enemy.kind === 'moon_lord'
        ? 235
        : enemy.kind === 'martian_saucer'
          ? 200
          : enemy.kind === 'skele_cat' || enemy.kind === 'skeletron_prime'
            ? 215
            : 185;
    const speedFactor = isPhase2 ? 0.44 : 0.3;
    const orbitX = player.x + Math.cos(enemy.animPhase * speedFactor) * hoverRadius;
    const orbitY =
      player.y -
      (enemy.kind === 'moon_lord' ? 155 : enemy.kind === 'martian_saucer' ? 165 : enemy.kind === 'skeletron_prime' ? 145 : 120) +
      Math.sin(enemy.animPhase * 0.48) * 52;
    const odx = orbitX - enemy.x;
    const ody = orbitY - enemy.y;
    const maxSpeed = enemy.kind === 'moon_lord' || enemy.kind === 'the_twins' || enemy.kind === 'sun_cat' ? 320 : isPhase2 ? 275 : 225;
    enemy.vx += (Math.max(-maxSpeed, Math.min(maxSpeed, odx * 2.5)) - enemy.vx) * Math.min(1, dt * 4.5);
    enemy.vy += (Math.max(-maxSpeed, Math.min(maxSpeed, ody * 2.5)) - enemy.vy) * Math.min(1, dt * 4.5);
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'windup';
      enemy.stateTimer = isPhase2 ? 0.36 : 0.5;
    }
  } else if (enemy.aiState === 'windup') {
    enemy.vx *= 0.88;
    enemy.vy *= 0.88;
    if (enemy.stateTimer <= 0) {
      if ((enemy.kind === 'brain_cthulhu' || enemy.kind === 'jester_cat') && Math.random() < 0.55) {
        enemy.x = player.x + (Math.random() < 0.5 ? -210 : 210);
        enemy.y = Math.max(48, player.y - 120);
      }

      enemy.aiState = 'attack';
      const dashSpeed =
        enemy.kind === 'the_twins' || enemy.kind === 'skeletron_prime' || enemy.kind === 'sun_cat'
          ? 470
          : enemy.kind === 'moon_lord'
            ? 340
            : isPhase2
              ? 440
              : 375;
      enemy.vx = (dx / len) * dashSpeed;
      enemy.vy = (dy / len) * dashSpeed;
      enemy.stateTimer = isPhase2 ? 0.56 : 0.65;

      if (enemy.kind === 'martian_saucer') {
        return {
          spawnProjectiles: [
            { kind: 'laser', vx: (dx / len) * 480, vy: (dy / len) * 480, color: '#22c55e', radius: 8 },
            { kind: 'laser', vx: (dx / len) * 450 + 60, vy: (dy / len) * 450 - 35, color: '#4ade80', radius: 7 },
            { kind: 'cursed_orb', vx: (dx / len) * 340, vy: (dy / len) * 340 + 40, color: '#38bdf8', radius: 10 },
          ],
        };
      }
      if (enemy.kind === 'pharaoh_cat') {
        return {
          spawnMinionKind,
          spawnProjectiles: [
            { kind: 'phantasmal_bolt', vx: (dx / len) * 400, vy: (dy / len) * 400, color: '#facc15', radius: 9 },
            { kind: 'cursed_orb', vx: (dx / len) * 330 + 60, vy: (dy / len) * 330 - 50, color: '#f59e0b', radius: 9 },
          ],
        };
      }
      if (enemy.kind === 'jester_cat') {
        return {
          spawnProjectiles: [
            { kind: 'stinger', vx: (dx / len) * 430, vy: (dy / len) * 430, color: '#dc2626', radius: 8 },
            { kind: 'stinger', vx: (dx / len) * 410 + 65, vy: (dy / len) * 410 - 55, color: '#3b82f6', radius: 8 },
            { kind: 'stinger', vx: (dx / len) * 410 - 65, vy: (dy / len) * 410 + 55, color: '#facc15', radius: 8 },
          ],
        };
      }
      if (enemy.kind === 'sun_cat') {
        return {
          spawnProjectiles: [
            { kind: 'phantasmal_bolt', vx: (dx / len) * 460, vy: (dy / len) * 460, color: '#f59e0b', radius: 10 },
            { kind: 'cursed_orb', vx: (dx / len) * 390 + 70, vy: (dy / len) * 390 - 45, color: '#fef08a', radius: 10 },
          ],
        };
      }
      if (enemy.kind === 'atomic_cat') {
        return {
          spawnProjectiles: [
            { kind: 'cursed_orb', vx: (dx / len) * 360, vy: (dy / len) * 360 - 30, color: '#facc15', radius: 12 },
            { kind: 'laser', vx: (dx / len) * 440 + 55, vy: (dy / len) * 440 + 30, color: '#84cc16', radius: 8 },
          ],
        };
      }
      if (enemy.kind === 'party_cat') {
        return {
          spawnProjectiles: [
            { kind: 'phantasmal_bolt', vx: (dx / len) * 420, vy: (dy / len) * 420, color: '#ec4899', radius: 9 },
            { kind: 'phantasmal_bolt', vx: (dx / len) * 390 - 55, vy: (dy / len) * 390 + 55, color: '#38bdf8', radius: 9 },
            { kind: 'cursed_orb', vx: (dx / len) * 350 + 55, vy: (dy / len) * 350 - 55, color: '#facc15', radius: 9 },
          ],
        };
      }
      if (enemy.kind === 'melon_bandit') {
        return {
          spawnProjectiles: [
            { kind: 'stinger', vx: (dx / len) * 470, vy: (dy / len) * 470, color: '#16a34a', radius: 7 },
            { kind: 'stinger', vx: (dx / len) * 450 + 40, vy: (dy / len) * 450 - 35, color: '#ef4444', radius: 7 },
            { kind: 'stinger', vx: (dx / len) * 450 - 40, vy: (dy / len) * 450 + 35, color: '#facc15', radius: 7 },
          ],
        };
      }
      if (enemy.kind === 'the_twins') {
        return {
          spawnProjectiles: [
            { kind: 'cursed_orb', vx: (dx / len) * 390, vy: (dy / len) * 390, color: '#22c55e', radius: 9 },
            { kind: 'laser', vx: (dx / len) * 470, vy: (dy / len) * 470 - 30, color: '#ef4444', radius: 7 },
          ],
        };
      }
      if (enemy.kind === 'skeletron_prime') {
        return {
          spawnProjectiles: [
            { kind: 'laser', vx: (dx / len) * 450, vy: (dy / len) * 450, color: '#f43f5e', radius: 8 },
            { kind: 'cursed_orb', vx: (dx / len) * 340, vy: (dy / len) * 340 - 65, color: '#cbd5e1', radius: 9 },
          ],
        };
      }
      if (enemy.kind === 'plantera') {
        return {
          spawnProjectiles: [
            { kind: 'stinger', vx: (dx / len) * 370, vy: (dy / len) * 370, color: '#4ade80', radius: 8 },
            { kind: 'stinger', vx: (dx / len) * 340 + 55, vy: (dy / len) * 340 - 45, color: '#ec4899', radius: 8 },
          ],
        };
      }
      if (enemy.kind === 'lunatic_cultist') {
        return {
          spawnProjectiles: [
            { kind: 'phantasmal_bolt', vx: (dx / len) * 410, vy: (dy / len) * 410, color: '#60a5fa', radius: 9 },
            { kind: 'cursed_orb', vx: (dx / len) * 340 + 60, vy: (dy / len) * 340 - 60, color: '#facc15', radius: 8 },
          ],
        };
      }
      if (enemy.kind === 'moon_lord') {
        return {
          spawnProjectiles: [
            { kind: 'phantasmal_bolt', vx: (dx / len) * 460, vy: (dy / len) * 460, color: '#2dd4bf', radius: 11 },
            { kind: 'phantasmal_bolt', vx: (dx / len) * 420 + 85, vy: (dy / len) * 420 - 55, color: '#5eead4', radius: 10 },
            { kind: 'laser', vx: (dx / len) * 510, vy: (dy / len) * 510 + 40, color: '#22d3ee', radius: 9 },
          ],
        };
      }

      const globSpeed = enemy.kind === 'skele_cat' ? 330 : 295;
      return {
        spawnMinionKind,
        spawnSlimeGlob: {
          vx: (dx / len) * globSpeed,
          vy: (dy / len) * globSpeed,
        },
      };
    }
  } else if (enemy.aiState === 'attack') {
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'recover';
      enemy.stateTimer = isPhase2 ? 0.62 : 0.86;
    }
  } else {
    enemy.vx *= 0.92;
    enemy.vy *= 0.92;
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'patrol';
      enemy.stateTimer = isPhase2 ? 0.95 : 1.3;
    }
  }
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  return { spawnMinionKind };
}

export function computeDamageAfterDefense(rawDamage: number, defense: number): number {
  return Math.max(1, Math.round(rawDamage - defense * 0.5));
}

export function explodeTilesRadius(
  world: WorldData,
  tileDamageMap: Map<number, number>,
  wx: number,
  wy: number,
  radiusTiles: number,
): { itemId: string; tx: number; ty: number }[] {
  const cx = Math.floor(wx / TILE_SIZE);
  const cy = Math.floor(wy / TILE_SIZE);
  const r = Math.ceil(radiusTiles);
  const dropped: { itemId: string; tx: number; ty: number }[] = [];

  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > radiusTiles * radiusTiles) continue;
      const tx = cx + dx;
      const ty = cy + dy;
      if (!inBounds(tx, ty, world) || tx <= 1 || tx >= world.width - 2 || ty <= 1 || ty >= world.height - 2) {
        continue;
      }
      const tile = getTile(world, tx, ty);
      if (tile === TileType.Air || tile === TileType.Chest || tile === TileType.Stool) continue;
      tileDamageMap.delete(tileIndex(tx, ty, world.width));
      setTile(world, tx, ty, TileType.Air);
      const dropId = tileTypeToDropItem(tile);
      if (dropId) {
        dropped.push({ itemId: dropId, tx, ty });
      }
    }
  }
  return dropped;
}

export function rollPotDrops(): { coins: number; items: { itemId: string; count: number }[] } {
  const coins = 4 + Math.floor(Math.random() * 11);
  const items: { itemId: string; count: number }[] = [];
  const r = Math.random();
  if (r < 0.25) {
    items.push({ itemId: 'torch_item', count: 3 + Math.floor(Math.random() * 4) });
  } else if (r < 0.46) {
    items.push({ itemId: 'rope_item', count: 4 + Math.floor(Math.random() * 5) });
  } else if (r < 0.62) {
    items.push({ itemId: 'healing_potion', count: 1 });
  } else if (r < 0.74) {
    items.push({ itemId: 'terraria_bomb', count: 2 + Math.floor(Math.random() * 3) });
  } else if (r < 0.82) {
    items.push({ itemId: 'recall_potion', count: 1 });
  } else if (r < 0.90) {
    items.push({ itemId: 'ironskin_potion', count: 1 });
  } else if (r < 0.95) {
    items.push({ itemId: 'red_potion', count: 1 });
  } else {
    items.push({ itemId: 'milk_potion', count: 1 });
  }
  return { coins, items };
}

export function placeDebugChestNearPlayer(
  world: WorldData,
  player: PlayerState,
  preset: DebugChestPreset,
): { placed: boolean; tx: number; ty: number } {
  const ptx = Math.floor((player.x + player.width / 2) / TILE_SIZE);
  const pty = Math.floor((player.y + player.height - 4) / TILE_SIZE);
  const dxOrder = [player.facing, -player.facing, 0, player.facing * 2, -player.facing * 2, 3, -3];
  const dyOrder = [0, 1, -1, 2, -2];

  const isFreeForChest = (tx: number, ty: number) => {
    if (!inBounds(tx, ty, world) || tx <= 1 || tx >= world.width - 2 || ty <= 1 || ty >= world.height - 2) {
      return false;
    }
    const cur = getTile(world, tx, ty);
    return cur === TileType.Air || cur === TileType.Leaves || cur === TileType.CrimsonLeaves;
  };

  // Prefer tiles sitting directly on solid ground or platform
  for (const dy of dyOrder) {
    for (const dx of dxOrder) {
      const tx = ptx + dx;
      const ty = pty + dy;
      if (isFreeForChest(tx, ty)) {
        const below = getTile(world, tx, ty + 1);
        if (isTileSolid(below) || isTilePlatform(below)) {
          setTile(world, tx, ty, TileType.Chest);
          const idx = tileIndex(tx, ty, world.width);
          world.chests[idx] = DEBUG_CHEST_PRESETS[preset].items.map((it) => ({ ...it }));
          return { placed: true, tx, ty };
        }
      }
    }
  }

  // Fallback: any nearby air tile
  for (const dy of dyOrder) {
    for (const dx of dxOrder) {
      const tx = ptx + dx;
      const ty = pty + dy;
      if (isFreeForChest(tx, ty)) {
        setTile(world, tx, ty, TileType.Chest);
        const idx = tileIndex(tx, ty, world.width);
        world.chests[idx] = DEBUG_CHEST_PRESETS[preset].items.map((it) => ({ ...it }));
        return { placed: true, tx, ty };
      }
    }
  }

  return { placed: false, tx: ptx, ty: pty };
}


