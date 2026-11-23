import { DEBUG_CHEST_PRESETS, ITEMS, tileTypeToDropItem, wallTypeToDropItem } from './catalog';
import {
  DebugChestPreset,
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
  const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const speedMult = bonuses?.speedMult ?? (bonuses?.hasHermesBoots ? 1.38 : 1);
  const jumpMult = bonuses?.jumpMult ?? 1;
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
      player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * dt);
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
      wall === WallType.MarbleWall
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

export const BOSS_KINDS: EnemyKind[] = [
  'king_slime',
  'eye_boss',
  'kotulhu',
  'cat_worm',
  'brain_cthulhu',
  'queen_bee',
  'deerclops',
  'skele_cat',
  'wall_of_flesh',
  'queen_slime',
  'the_twins',
  'the_destroyer',
  'skeletron_prime',
  'plantera',
  'golem',
  'duke_fishron',
  'empress_light',
  'lunatic_cultist',
  'moon_lord',
];

const BOSS_KIND_SET = new Set<EnemyKind>(BOSS_KINDS);

export function isBossKind(kind: EnemyKind): boolean {
  return BOSS_KIND_SET.has(kind);
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
    case 'king_slime':
      return {
        id,
        kind,
        name: 'Король Слизней-Котов',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 68,
        height: 54,
        hp: Math.round(240 * mult),
        maxHp: Math.round(240 * mult),
        damage: Math.round(20 * mult),
        defense: 4,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.1,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        summonTimer: 4.5,
        drops: [
          { itemId: 'slime_gel', min: 10, max: 16, chance: 1 },
          { itemId: 'gold_bar', min: 3, max: 5, chance: 1 },
          { itemId: 'catnip_elixir', min: 1, max: 1, chance: 1 },
        ],
      };
    case 'kotulhu':
      return {
        id,
        kind,
        name: 'Котулху (Босс)',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 66,
        height: 66,
        hp: Math.round(320 * mult),
        maxHp: Math.round(320 * mult),
        damage: Math.round(26 * mult),
        defense: 5,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.3,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
          { itemId: 'iron_bar', min: 5, max: 8, chance: 1 },
          { itemId: 'warm_milk', min: 2, max: 3, chance: 1 },
        ],
      };
    case 'cat_worm': {
      const segs: { x: number; y: number }[] = [];
      for (let i = 1; i <= 9; i++) {
        segs.push({ x: x + i * 24, y });
      }
      return {
        id,
        kind,
        name: 'Котовый Червь (Босс)',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 54,
        height: 54,
        hp: Math.round(380 * mult),
        maxHp: Math.round(380 * mult),
        damage: Math.round(24 * mult),
        defense: 6,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.8,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        segments: segs,
        drops: [
          { itemId: 'iron_bar', min: 6, max: 10, chance: 1 },
          { itemId: 'gold_bar', min: 4, max: 6, chance: 1 },
          { itemId: 'catnip_elixir', min: 1, max: 1, chance: 1 },
        ],
      };
    }
    case 'skele_cat':
      return {
        id,
        kind,
        name: 'Кототрон (Босс)',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 64,
        height: 64,
        hp: Math.round(440 * mult),
        maxHp: Math.round(440 * mult),
        damage: Math.round(30 * mult),
        defense: 8,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.5,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'monster_bone', min: 10, max: 16, chance: 1 },
          { itemId: 'ruby_gem', min: 4, max: 7, chance: 1 },
          { itemId: 'gold_bar', min: 5, max: 8, chance: 1 },
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
        hp: Math.round(280 * mult),
        maxHp: Math.round(280 * mult),
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
    case 'brain_cthulhu':
      return {
        id,
        kind,
        name: 'Мозг Ктулху',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 74,
        height: 68,
        hp: Math.round(360 * mult),
        maxHp: Math.round(360 * mult),
        damage: Math.round(26 * mult),
        defense: 6,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.4,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        summonTimer: 4.0,
        drops: [
          { itemId: 'crimstone_block', min: 10, max: 18, chance: 1 },
          { itemId: 'crimson_helmet', min: 1, max: 1, chance: 0.45 },
          { itemId: 'ruby_gem', min: 2, max: 4, chance: 1 },
        ],
      };
    case 'queen_bee':
      return {
        id,
        kind,
        name: 'Королева Пчёл',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 68,
        height: 58,
        hp: Math.round(410 * mult),
        maxHp: Math.round(410 * mult),
        damage: Math.round(28 * mult),
        defense: 7,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.2,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'gold_bar', min: 5, max: 9, chance: 1 },
          { itemId: 'healing_potion', min: 3, max: 5, chance: 1 },
          { itemId: 'shiny_red_balloon', min: 1, max: 1, chance: 0.35 },
        ],
      };
    case 'deerclops':
      return {
        id,
        kind,
        name: 'Циклоп-Олень',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 72,
        height: 86,
        hp: Math.round(500 * mult),
        maxHp: Math.round(500 * mult),
        damage: Math.round(32 * mult),
        defense: 8,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.2,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'ice_block', min: 12, max: 20, chance: 1 },
          { itemId: 'fallen_star', min: 4, max: 7, chance: 1 },
          { itemId: 'ruby_gem', min: 3, max: 5, chance: 1 },
        ],
      };
    case 'wall_of_flesh':
      return {
        id,
        kind,
        name: 'Стена Плоти',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 84,
        height: 168,
        hp: Math.round(640 * mult),
        maxHp: Math.round(640 * mult),
        damage: Math.round(36 * mult),
        defense: 10,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.4,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'obsidian_block', min: 12, max: 18, chance: 1 },
          { itemId: 'cobalt_shield', min: 1, max: 1, chance: 0.5 },
          { itemId: 'crystal_block', min: 8, max: 14, chance: 1 },
        ],
      };
    case 'queen_slime':
      return {
        id,
        kind,
        name: 'Королева Слизней',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 76,
        height: 62,
        hp: Math.round(740 * mult),
        maxHp: Math.round(740 * mult),
        damage: Math.round(38 * mult),
        defense: 11,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.1,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        summonTimer: 5.5,
        drops: [
          { itemId: 'crystal_block', min: 10, max: 16, chance: 1 },
          { itemId: 'angel_wings', min: 1, max: 1, chance: 0.35 },
          { itemId: 'crystal_chestplate', min: 1, max: 1, chance: 0.4 },
        ],
      };
    case 'the_twins':
      return {
        id,
        kind,
        name: 'Близнецы (Ретиназер и Спазматизм)',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 78,
        height: 70,
        hp: Math.round(860 * mult),
        maxHp: Math.round(860 * mult),
        damage: Math.round(42 * mult),
        defense: 12,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.15,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'crystal_block', min: 10, max: 18, chance: 1 },
          { itemId: 'gold_bar', min: 8, max: 12, chance: 1 },
          { itemId: 'mana_flower', min: 1, max: 1, chance: 0.45 },
        ],
      };
    case 'the_destroyer': {
      const segs: { x: number; y: number }[] = [];
      for (let i = 1; i <= 14; i++) {
        segs.push({ x: x + i * 24, y });
      }
      return {
        id,
        kind,
        name: 'Уничтожитель',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 60,
        height: 60,
        hp: Math.round(980 * mult),
        maxHp: Math.round(980 * mult),
        damage: Math.round(44 * mult),
        defense: 14,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.5,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        segments: segs,
        drops: [
          { itemId: 'iron_bar', min: 12, max: 18, chance: 1 },
          { itemId: 'crystal_block', min: 10, max: 16, chance: 1 },
          { itemId: 'obsidian_block', min: 10, max: 16, chance: 1 },
        ],
      };
    }
    case 'skeletron_prime':
      return {
        id,
        kind,
        name: 'Скелетрон Прайм',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 76,
        height: 76,
        hp: Math.round(1040 * mult),
        maxHp: Math.round(1040 * mult),
        damage: Math.round(46 * mult),
        defense: 14,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.25,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'monster_bone', min: 12, max: 20, chance: 1 },
          { itemId: 'crystal_block', min: 12, max: 18, chance: 1 },
          { itemId: 'cobalt_shield', min: 1, max: 1, chance: 0.45 },
        ],
      };
    case 'plantera':
      return {
        id,
        kind,
        name: 'Плантера',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 78,
        height: 78,
        hp: Math.round(1200 * mult),
        maxHp: Math.round(1200 * mult),
        damage: Math.round(48 * mult),
        defense: 15,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.2,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'life_crystal', min: 2, max: 3, chance: 1 },
          { itemId: 'ruby_gem', min: 6, max: 10, chance: 1 },
          { itemId: 'crystal_helmet', min: 1, max: 1, chance: 0.45 },
        ],
      };
    case 'golem':
      return {
        id,
        kind,
        name: 'Голем Храма',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 82,
        height: 84,
        hp: Math.round(1350 * mult),
        maxHp: Math.round(1350 * mult),
        damage: Math.round(52 * mult),
        defense: 18,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.1,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'gold_bar', min: 10, max: 16, chance: 1 },
          { itemId: 'obsidian_block', min: 14, max: 20, chance: 1 },
          { itemId: 'celestial_emblem', min: 1, max: 1, chance: 0.5 },
        ],
      };
    case 'duke_fishron':
      return {
        id,
        kind,
        name: 'Герцог Рыброн',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 84,
        height: 66,
        hp: Math.round(1520 * mult),
        maxHp: Math.round(1520 * mult),
        damage: Math.round(56 * mult),
        defense: 16,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 0.95,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'crispy_fish', min: 8, max: 14, chance: 1 },
          { itemId: 'angel_wings', min: 1, max: 1, chance: 0.6 },
          { itemId: 'crystal_block', min: 14, max: 22, chance: 1 },
        ],
      };
    case 'empress_light':
      return {
        id,
        kind,
        name: 'Императрица Света',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 78,
        height: 82,
        hp: Math.round(1700 * mult),
        maxHp: Math.round(1700 * mult),
        damage: Math.round(60 * mult),
        defense: 16,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.0,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'fallen_star', min: 10, max: 16, chance: 1 },
          { itemId: 'celestial_emblem', min: 1, max: 1, chance: 0.6 },
          { itemId: 'crystal_greaves', min: 1, max: 1, chance: 0.5 },
        ],
      };
    case 'lunatic_cultist':
      return {
        id,
        kind,
        name: 'Культист-Лунатик',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 56,
        height: 70,
        hp: Math.round(1860 * mult),
        maxHp: Math.round(1860 * mult),
        damage: Math.round(62 * mult),
        defense: 18,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.05,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'fallen_star', min: 12, max: 20, chance: 1 },
          { itemId: 'crystal_block', min: 16, max: 24, chance: 1 },
          { itemId: 'mana_potion', min: 5, max: 8, chance: 1 },
        ],
      };
    case 'moon_lord':
      return {
        id,
        kind,
        name: 'Лунный Лорд (Финальный босс)',
        x,
        y,
        vx: 0,
        vy: 0,
        width: 112,
        height: 116,
        hp: Math.round(2500 * mult),
        maxHp: Math.round(2500 * mult),
        damage: Math.round(68 * mult),
        defense: 22,
        facing: 1,
        onGround: false,
        aiState: 'patrol',
        stateTimer: 1.15,
        hitFlashTimer: 0,
        koTimer: 0,
        animPhase: 0,
        drops: [
          { itemId: 'terra_blade', min: 1, max: 1, chance: 1 },
          { itemId: 'angel_wings', min: 1, max: 1, chance: 0.8 },
          { itemId: 'life_crystal', min: 3, max: 5, chance: 1 },
          { itemId: 'fallen_star', min: 15, max: 25, chance: 1 },
        ],
      };
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

  // Policy 1: Slime
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

  // Policy 2: Bat
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

  // Policy 3: Goblin / Skeleton
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

  // Policy 8: Hover / Bullet-Hell Bosses (Kotulhu, Skele-Cat, Eye Boss, Brain of Cthulhu, The Twins, Skeletron Prime, Plantera, Lunatic Cultist, Moon Lord)
  const isPhase2 = enemy.hp < enemy.maxHp * 0.5;
  enemy.facing = dir;
  if (enemy.aiState === 'patrol') {
    const hoverRadius =
      enemy.kind === 'moon_lord' ? 235 : enemy.kind === 'skele_cat' || enemy.kind === 'skeletron_prime' ? 215 : 185;
    const speedFactor = isPhase2 ? 0.44 : 0.3;
    const orbitX = player.x + Math.cos(enemy.animPhase * speedFactor) * hoverRadius;
    const orbitY =
      player.y -
      (enemy.kind === 'moon_lord' ? 155 : enemy.kind === 'skeletron_prime' ? 145 : 120) +
      Math.sin(enemy.animPhase * 0.48) * 52;
    const odx = orbitX - enemy.x;
    const ody = orbitY - enemy.y;
    const maxSpeed = enemy.kind === 'moon_lord' || enemy.kind === 'the_twins' ? 320 : isPhase2 ? 275 : 225;
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
      // Brain of Cthulhu teleports across player before lunging
      if (enemy.kind === 'brain_cthulhu' && Math.random() < 0.55) {
        enemy.x = player.x + (Math.random() < 0.5 ? -210 : 210);
        enemy.y = Math.max(48, player.y - 120);
      }

      enemy.aiState = 'attack';
      const dashSpeed =
        enemy.kind === 'the_twins' || enemy.kind === 'skeletron_prime'
          ? 470
          : enemy.kind === 'moon_lord'
            ? 340
            : isPhase2
              ? 440
              : 375;
      enemy.vx = (dx / len) * dashSpeed;
      enemy.vy = (dy / len) * dashSpeed;
      enemy.stateTimer = isPhase2 ? 0.56 : 0.65;

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
  return {};
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
  if (r < 0.3) {
    items.push({ itemId: 'torch_item', count: 3 + Math.floor(Math.random() * 4) });
  } else if (r < 0.55) {
    items.push({ itemId: 'rope_item', count: 4 + Math.floor(Math.random() * 5) });
  } else if (r < 0.75) {
    items.push({ itemId: 'healing_potion', count: 1 });
  } else if (r < 0.9) {
    items.push({ itemId: 'terraria_bomb', count: 2 + Math.floor(Math.random() * 3) });
  } else {
    items.push({ itemId: 'mana_potion', count: 1 });
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


