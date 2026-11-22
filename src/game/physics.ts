import { ITEMS, tileTypeToDropItem, wallTypeToDropItem } from './catalog';
import {
  EnemyEntity,
  EnemyKind,
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
    hp: 100,
    maxHp: 100,
    mana: 60,
    maxMana: 60,
    defense: 2,
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
  };
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

export function stepPlayerPhysics(
  player: PlayerState,
  world: WorldData,
  input: InputIntent,
  dt: number,
): { jumped: boolean; landed: boolean } {
  let jumped = false;

  const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const targetVx = moveDir * PLAYER_MOVE_SPEED;
  const accel = player.onGround ? 18 : 11;
  player.vx += (targetVx - player.vx) * Math.min(1, accel * dt);
  if (Math.abs(player.vx) < 3 && moveDir === 0) player.vx = 0;
  if (moveDir !== 0) {
    player.facing = moveDir > 0 ? 1 : -1;
  }

  // Coyote time & jump buffer
  if (player.onGround) {
    player.coyoteTimer = 0.1;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }

  if (input.jumpJustPressed) {
    player.jumpBufferTimer = 0.12;
  } else {
    player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
  }

  if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
    player.vy = -PLAYER_JUMP_SPEED;
    player.onGround = false;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
    player.squashX = 0.84;
    player.squashY = 1.18;
    jumped = true;
  }

  // Variable jump height cut when jump key released early
  if (!input.jumpHeld && player.vy < -180) {
    player.vy *= 0.65;
  }

  player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * dt);

  const { landed } = moveEntityWithTiles(player, world, dt, input.down);
  if (landed) {
    player.squashX = 1.22;
    player.squashY = 0.78;
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
  player.mana = Math.min(player.maxMana, player.mana + (player.houseValid ? 8 : 5) * dt);

  return { jumped, landed };
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

export function tryPlaceItemAtTile(
  world: WorldData,
  player: PlayerState,
  itemId: string,
  tx: number,
  ty: number,
): { placed: boolean; action: 'tile' | 'wall' | 'door_toggle' | 'bed_spawn' | 'stool_interact' | 'none' } {
  if (!inBounds(tx, ty, world)) return { placed: false, action: 'none' };
  if (!canReachTile(player, tx, ty, 6.2)) return { placed: false, action: 'none' };

  const curTile = getTile(world, tx, ty);

  // Interact with stool on right click
  if (curTile === TileType.Stool) {
    return { placed: false, action: 'stool_interact' };
  }

  // Interact with door if clicking a door tile
  if (curTile === TileType.DoorClosed) {
    setTile(world, tx, ty, TileType.DoorOpen);
    return { placed: false, action: 'door_toggle' };
  }
  if (curTile === TileType.DoorOpen) {
    // Only close if player is not standing inside doorway
    const doorBox = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
    if (!rectsOverlap(player.x, player.y, player.width, player.height, doorBox.x, doorBox.y, doorBox.w, doorBox.h)) {
      setTile(world, tx, ty, TileType.DoorClosed);
      return { placed: false, action: 'door_toggle' };
    }
    return { placed: false, action: 'none' };
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
    if (curTile !== TileType.Air && curTile !== TileType.Leaves) {
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

  // If tile is Air, allow breaking background walls (except deep dirt/stone unless player targets wall)
  if (!isTileMineable(tile)) {
    const wall = getWall(world, tx, ty);
    if (wall === WallType.WoodWall || wall === WallType.StoneWall || wall === WallType.BrickWall) {
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

export function createEnemy(
  id: number,
  kind: EnemyKind,
  x: number,
  y: number,
  difficultyScale = 1,
): EnemyEntity {
  const mult = Math.max(1, difficultyScale);
  switch (kind) {
    case 'slime':
      return {
        id,
        kind,
        name: 'Зелёный слизень',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 28,
        height: 22,
        hp: Math.round(28 * mult),
        maxHp: Math.round(28 * mult),
        damage: Math.round(10 * mult),
        defense: 1,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 0.7,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: Math.random() * Math.PI * 2,
        drops: [
          { itemId: 'slime_gel', min: 1, max: 3, chance: 1 },
          { itemId: 'crispy_fish', min: 1, max: 1, chance: 0.28 },
        ],
      };
    case 'bat':
      return {
        id,
        kind,
        name: 'Пещерная мышь',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 28,
        height: 20,
        hp: Math.round(24 * mult),
        maxHp: Math.round(24 * mult),
        damage: Math.round(12 * mult),
        defense: 1,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.0,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: Math.random() * Math.PI * 2,
        drops: [
          { itemId: 'coal_ore', min: 1, max: 2, chance: 0.6 },
          { itemId: 'monster_bone', min: 1, max: 1, chance: 0.4 },
        ],
      };
    case 'goblin':
      return {
        id,
        kind,
        name: 'Гоблин-разбойник',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 26,
        height: 40,
        hp: Math.round(46 * mult),
        maxHp: Math.round(46 * mult),
        damage: Math.round(16 * mult),
        defense: 3,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.1,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: Math.random() * Math.PI * 2,
        drops: [
          { itemId: 'iron_ore', min: 1, max: 3, chance: 0.65 },
          { itemId: 'monster_bone', min: 1, max: 2, chance: 0.75 },
          { itemId: 'crispy_fish', min: 1, max: 1, chance: 0.35 },
        ],
      };
    case 'skeleton':
      return {
        id,
        kind,
        name: 'Костяной страж',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 26,
        height: 44,
        hp: Math.round(58 * mult),
        maxHp: Math.round(58 * mult),
        damage: Math.round(20 * mult),
        defense: 4,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.2,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: Math.random() * Math.PI * 2,
        drops: [
          { itemId: 'monster_bone', min: 2, max: 4, chance: 1 },
          { itemId: 'gold_ore', min: 1, max: 2, chance: 0.45 },
        ],
      };
    case 'eye_boss':
      return {
        id,
        kind,
        name: 'Око Ночи (Босс)',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 56,
        height: 56,
        hp: Math.round(260 * mult),
        maxHp: Math.round(260 * mult),
        damage: Math.round(24 * mult),
        defense: 5,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.4,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
          { itemId: 'gold_bar', min: 3, max: 5, chance: 1 },
          { itemId: 'catnip_elixir', min: 1, max: 1, chance: 1 },
        ],
      };
  }
}

export function stepEnemyAI(
  enemy: EnemyEntity,
  player: PlayerState,
  world: WorldData,
  dt: number,
  allowAttackToken: boolean,
): { spawnSlimeGlob?: { vx: number; vy: number } } {
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
  const dir: 1 | -1 = dx >= 0 ? 1 : -1;
  enemy.stateTimer -= dt;

  // Policy 1: Slime (Periodic windup crouch -> elastic hop toward player)
  if (enemy.kind === 'slime') {
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

  // Policy 2: Bat (Flying hover/kiter + swoop dive after telegraph)
  if (enemy.kind === 'bat') {
    enemy.facing = dir;
    if (enemy.aiState === 'patrol') {
      const hoverX = Math.cos(enemy.animPhase * 0.5) * 90 + (dist > 140 ? dir * 85 : -dir * 45);
      const hoverY = Math.sin(enemy.animPhase) * 40 + (dy < -20 ? -50 : dy > 60 ? 50 : 0);
      enemy.vx += (hoverX - enemy.vx) * Math.min(1, dt * 4);
      enemy.vy += (hoverY - enemy.vy) * Math.min(1, dt * 4);
      if (dist < 320 && enemy.stateTimer <= 0 && allowAttackToken) {
        enemy.aiState = 'windup';
        enemy.stateTimer = 0.4;
      }
    } else if (enemy.aiState === 'windup') {
      enemy.vx *= 0.9;
      enemy.vy = -40;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        const len = Math.max(1, dist);
        enemy.vx = (dx / len) * 320;
        enemy.vy = (dy / len) * 320;
        enemy.stateTimer = 0.55;
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
    return {};
  }

  // Policy 3: Goblin / Skeleton (Ground chaser + wall jump + windup lunge)
  if (enemy.kind === 'goblin' || enemy.kind === 'skeleton') {
    const speed = enemy.kind === 'goblin' ? 145 : 118;
    if (enemy.aiState === 'patrol') {
      enemy.facing = dir;
      enemy.vx += (dir * speed - enemy.vx) * Math.min(1, dt * 8);
      if (dist < 140 && Math.abs(dy) < 55 && enemy.stateTimer <= 0 && allowAttackToken) {
        enemy.aiState = 'windup';
        enemy.stateTimer = 0.38;
        enemy.vx = 0;
      }
    } else if (enemy.aiState === 'windup') {
      enemy.vx *= 0.8;
      if (enemy.stateTimer <= 0) {
        enemy.aiState = 'attack';
        enemy.vx = enemy.facing * (speed * 2.1);
        if (enemy.onGround) enemy.vy = -210;
        enemy.stateTimer = 0.42;
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
    return {};
  }

  // Policy 4: Eye Boss (Orbit + ranged orb + dash charge)
  enemy.facing = dir;
  if (enemy.aiState === 'patrol') {
    const orbitX = player.x + Math.cos(enemy.animPhase * 0.25) * 190;
    const orbitY = player.y - 120 + Math.sin(enemy.animPhase * 0.4) * 45;
    const odx = orbitX - enemy.x;
    const ody = orbitY - enemy.y;
    enemy.vx += (Math.max(-220, Math.min(220, odx * 2.2)) - enemy.vx) * Math.min(1, dt * 4);
    enemy.vy += (Math.max(-180, Math.min(180, ody * 2.2)) - enemy.vy) * Math.min(1, dt * 4);
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'windup';
      enemy.stateTimer = 0.55;
    }
  } else if (enemy.aiState === 'windup') {
    enemy.vx *= 0.88;
    enemy.vy *= 0.88;
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'attack';
      const len = Math.max(1, dist);
      enemy.vx = (dx / len) * 380;
      enemy.vy = (dy / len) * 380;
      enemy.stateTimer = 0.65;
      const globSpeed = 290;
      return {
        spawnSlimeGlob: {
          vx: (dx / len) * globSpeed,
          vy: (dy / len) * globSpeed,
        },
      };
    }
  } else if (enemy.aiState === 'attack') {
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'recover';
      enemy.stateTimer = 0.9;
    }
  } else {
    enemy.vx *= 0.92;
    enemy.vy *= 0.92;
    if (enemy.stateTimer <= 0) {
      enemy.aiState = 'patrol';
      enemy.stateTimer = 1.4;
    }
  }
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  return {};
}

export function computeDamageAfterDefense(rawDamage: number, defense: number): number {
  return Math.max(1, Math.round(rawDamage - defense * 0.5));
}
