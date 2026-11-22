import {
  CraftingStation,
  InventorySlot,
  TILE_SIZE,
  TileType,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  WallType,
  WorldData,
} from './types';

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function tileIndex(x: number, y: number, width = WORLD_WIDTH): number {
  return y * width + x;
}

export function inBounds(x: number, y: number, world: WorldData): boolean {
  return x >= 0 && x < world.width && y >= 0 && y < world.height;
}

export function getTile(world: WorldData, x: number, y: number): TileType {
  if (!inBounds(x, y, world)) return TileType.Stone;
  return world.tiles[tileIndex(x, y, world.width)] as TileType;
}

export function setTile(world: WorldData, x: number, y: number, tile: TileType): void {
  if (!inBounds(x, y, world)) return;
  world.tiles[tileIndex(x, y, world.width)] = tile;
}

export function getWall(world: WorldData, x: number, y: number): WallType {
  if (!inBounds(x, y, world)) return WallType.None;
  return world.walls[tileIndex(x, y, world.width)] as WallType;
}

export function setWall(world: WorldData, x: number, y: number, wall: WallType): void {
  if (!inBounds(x, y, world)) return;
  world.walls[tileIndex(x, y, world.width)] = wall;
}

export function isTileSolid(tile: TileType): boolean {
  return (
    tile !== TileType.Air &&
    tile !== TileType.Leaves &&
    tile !== TileType.Torch &&
    tile !== TileType.Workbench &&
    tile !== TileType.Furnace &&
    tile !== TileType.Anvil &&
    tile !== TileType.DoorOpen &&
    tile !== TileType.Platform &&
    tile !== TileType.Bed &&
    tile !== TileType.Chest &&
    tile !== TileType.Stool &&
    tile !== TileType.Wood // Trees act as background trunks you can walk past and chop!
  );
}

export function isTilePlatform(tile: TileType): boolean {
  return tile === TileType.Platform || tile === TileType.Workbench;
}

export function isTileMineable(tile: TileType): boolean {
  return tile !== TileType.Air;
}

export function getTileRequiredPickPower(tile: TileType): number {
  switch (tile) {
    case TileType.GoldOre:
    case TileType.RubyOre:
      return 2;
    default:
      return 1;
  }
}

export function getTileMaxDamage(tile: TileType): number {
  switch (tile) {
    case TileType.Leaves:
    case TileType.Torch:
    case TileType.Platform:
      return 1;
    case TileType.Dirt:
    case TileType.Grass:
    case TileType.Glass:
      return 2;
    case TileType.Wood:
    case TileType.Planks:
    case TileType.Workbench:
    case TileType.DoorClosed:
    case TileType.DoorOpen:
    case TileType.Bed:
    case TileType.Chest:
      return 3;
    case TileType.Stool:
      return 2;
    case TileType.Stone:
    case TileType.Brick:
    case TileType.RoofTile:
    case TileType.CoalOre:
    case TileType.Furnace:
    case TileType.Anvil:
      return 4;
    case TileType.IronOre:
      return 5;
    case TileType.GoldOre:
      return 6;
    case TileType.RubyOre:
      return 7;
    default:
      return 2;
  }
}

export function generateWorld(seed = 42069): WorldData {
  const rand = seededRandom(seed);
  const width = WORLD_WIDTH;
  const height = WORLD_HEIGHT;
  const tiles = new Uint8Array(width * height);
  const walls = new Uint8Array(width * height);
  const surfaceHeights = new Int16Array(width);
  const light = new Float32Array(width * height);

  const baseSurface = 24;
  const spawnX = Math.floor(width / 2);

  // 1. Surface contour with flat central clearing for spawning & building
  for (let x = 0; x < width; x++) {
    const wave1 = Math.sin(x * 0.085) * 3.4;
    const wave2 = Math.cos(x * 0.21) * 1.4;
    let sy = Math.round(baseSurface + wave1 + wave2);

    // Flatten spawn meadow (x: 70..90) so player never spawns facing a wall
    const distFromCenter = Math.abs(x - spawnX);
    if (distFromCenter <= 10) {
      sy = baseSurface;
    } else if (distFromCenter <= 16) {
      const t = (distFromCenter - 10) / 6;
      sy = Math.round(baseSurface * (1 - t) + sy * t);
    }
    surfaceHeights[x] = Math.max(14, Math.min(34, sy));
  }

  // 2. Terrain strata + underground caves + ores
  for (let x = 0; x < width; x++) {
    const sy = surfaceHeights[x];
    for (let y = 0; y < height; y++) {
      const idx = tileIndex(x, y, width);
      if (y < sy) {
        tiles[idx] = TileType.Air;
        walls[idx] = WallType.None;
      } else if (y === sy) {
        tiles[idx] = TileType.Grass;
        walls[idx] = WallType.None;
      } else if (y < sy + 5 + Math.floor(rand() * 3)) {
        tiles[idx] = TileType.Dirt;
        walls[idx] = WallType.DirtWall;
      } else {
        tiles[idx] = TileType.Stone;
        walls[idx] = WallType.StoneWall;
      }
    }
  }

  // 3. Carve natural caves
  const caveCount = 26;
  for (let c = 0; c < caveCount; c++) {
    let cx = 8 + Math.floor(rand() * (width - 16));
    let cy = surfaceHeights[cx] + 7 + Math.floor(rand() * (height - surfaceHeights[cx] - 14));
    // Keep directly beneath spawn safe from gaping pits
    if (Math.abs(cx - spawnX) < 8 && cy < baseSurface + 10) {
      cy += 10;
    }
    const steps = 18 + Math.floor(rand() * 28);
    let angle = rand() * Math.PI * 2;
    for (let s = 0; s < steps; s++) {
      const r = 1.6 + rand() * 1.9;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            const tx = Math.round(cx + dx);
            const ty = Math.round(cy + dy);
            if (tx > 1 && tx < width - 2 && ty > surfaceHeights[tx] + 3 && ty < height - 3) {
              tiles[tileIndex(tx, ty, width)] = TileType.Air;
            }
          }
        }
      }
      angle += (rand() - 0.5) * 0.9;
      cx += Math.cos(angle) * 1.6;
      cy += Math.sin(angle) * 1.2;
    }
  }

  // 4. Ore veins (Coal, Iron, Gold, Ruby)
  const placeOreVeins = (
    tile: TileType,
    count: number,
    minDepthOffset: number,
    maxY: number,
    veinSize: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const ox = 3 + Math.floor(rand() * (width - 6));
      const minY = Math.min(height - 5, surfaceHeights[ox] + minDepthOffset);
      if (minY >= maxY) continue;
      const oy = minY + Math.floor(rand() * (maxY - minY));
      for (let j = 0; j < veinSize; j++) {
        const vx = ox + Math.floor((rand() - 0.5) * 4);
        const vy = oy + Math.floor((rand() - 0.5) * 4);
        if (vx > 1 && vx < width - 2 && vy > surfaceHeights[vx] + 2 && vy < height - 2) {
          const cur = tiles[tileIndex(vx, vy, width)];
          if (cur === TileType.Stone || cur === TileType.Dirt) {
            tiles[tileIndex(vx, vy, width)] = tile;
          }
        }
      }
    }
  };

  placeOreVeins(TileType.CoalOre, 58, 3, height - 4, 6);
  placeOreVeins(TileType.IronOre, 44, 6, height - 3, 5);
  placeOreVeins(TileType.GoldOre, 28, 16, height - 2, 4);
  placeOreVeins(TileType.RubyOre, 18, 24, height - 2, 3);

  // 5. Forest trees (avoid central spawn pad x: 75..85 so spawn is open)
  let lastTreeX = -10;
  for (let x = 5; x < width - 5; x++) {
    if (Math.abs(x - spawnX) <= 6) continue;
    if (x - lastTreeX < 5) continue;
    if (rand() < 0.28) {
      const sy = surfaceHeights[x];
      if (tiles[tileIndex(x, sy, width)] === TileType.Grass) {
        const trunkH = 4 + Math.floor(rand() * 4);
        for (let h = 1; h <= trunkH; h++) {
          if (sy - h > 2) {
            tiles[tileIndex(x, sy - h, width)] = TileType.Wood;
          }
        }
        const topY = sy - trunkH;
        for (let dy = -2; dy <= 1; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (Math.abs(dx) === 2 && Math.abs(dy) === 2) continue;
            const lx = x + dx;
            const ly = topY + dy;
            if (lx > 1 && lx < width - 2 && ly > 1) {
              const idx = tileIndex(lx, ly, width);
              if (tiles[idx] === TileType.Air) {
                tiles[idx] = TileType.Leaves;
              }
            }
          }
        }
        lastTreeX = x;
      }
    }
  }

  // 6. Place two cozy welcome torches and an interactive stool near spawn camp
  const sySpawn = surfaceHeights[spawnX];
  tiles[tileIndex(spawnX - 3, sySpawn - 1, width)] = TileType.Torch;
  tiles[tileIndex(spawnX + 3, sySpawn - 1, width)] = TileType.Torch;
  tiles[tileIndex(spawnX + 2, sySpawn - 1, width)] = TileType.Stool;

  // 7. Generate Treasure Chests across surface & caves with basic boss summoners!
  const chests: Record<number, InventorySlot[]> = {};
  const placeChest = (cx: number, cy: number, loot: InventorySlot[]) => {
    if (cx < 2 || cx >= width - 2 || cy < 2 || cy >= height - 2) return;
    // Ensure solid floor beneath chest and clear space for the chest itself
    const floorIdx = tileIndex(cx, cy + 1, width);
    if (!isTileSolid(tiles[floorIdx] as TileType)) {
      tiles[floorIdx] = TileType.Planks;
    }
    const idx = tileIndex(cx, cy, width);
    tiles[idx] = TileType.Chest;
    chests[idx] = loot;
  };

  // Surface chest left of spawn: Kotulhu basic summoner + starter gear
  const leftChestX = spawnX - 15;
  placeChest(leftChestX, surfaceHeights[leftChestX] - 1, [
    { itemId: 'summon_kotulhu', count: 2 },
    { itemId: 'crispy_fish', count: 3 },
    { itemId: 'torch_item', count: 12 },
    { itemId: 'wood_bow', count: 1 },
  ]);

  // Surface chest right of spawn: Cat Worm basic summoner + bombs & iron
  const rightChestX = spawnX + 16;
  placeChest(rightChestX, surfaceHeights[rightChestX] - 1, [
    { itemId: 'summon_cat_worm', count: 2 },
    { itemId: 'warm_milk', count: 2 },
    { itemId: 'yarn_bomb', count: 8 },
    { itemId: 'iron_bar', count: 6 },
  ]);

  // Cave treasure chests across varying depths
  const caveLootTables: InventorySlot[][] = [
    [
      { itemId: 'summon_king_slime', count: 1 },
      { itemId: 'summon_kotulhu', count: 1 },
      { itemId: 'iron_bar', count: 8 },
      { itemId: 'crispy_fish', count: 3 },
    ],
    [
      { itemId: 'summon_cat_worm', count: 1 },
      { itemId: 'fish_boomerang', count: 1 },
      { itemId: 'gold_bar', count: 5 },
      { itemId: 'torch_item', count: 16 },
    ],
    [
      { itemId: 'summon_kotulhu', count: 1 },
      { itemId: 'summon_eye_boss', count: 1 },
      { itemId: 'catnip_elixir', count: 1 },
      { itemId: 'ruby_gem', count: 2 },
    ],
    [
      { itemId: 'summon_skele_cat', count: 1 },
      { itemId: 'gold_bar', count: 8 },
      { itemId: 'warm_milk', count: 3 },
      { itemId: 'ruby_gem', count: 3 },
    ],
    [
      { itemId: 'summon_king_slime', count: 1 },
      { itemId: 'summon_cat_worm', count: 1 },
      { itemId: 'iron_bar', count: 10 },
      { itemId: 'yarn_bomb', count: 10 },
    ],
    [
      { itemId: 'summon_skele_cat', count: 1 },
      { itemId: 'summon_eye_boss', count: 1 },
      { itemId: 'gold_bar', count: 10 },
      { itemId: 'catnip_elixir', count: 1 },
    ],
  ];

  const chestColumns = [22, 42, 62, 98, 118, 138];
  chestColumns.forEach((cx, i) => {
    const sy = surfaceHeights[cx];
    const targetDepth = sy + 9 + (i % 3) * 11;
    const cy = Math.min(height - 5, targetDepth);
    // Carve a tiny 3x2 stone treasure alcove so the chest sits cleanly on planks
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 0; dy++) {
        tiles[tileIndex(cx + dx, cy + dy, width)] = TileType.Air;
        walls[tileIndex(cx + dx, cy + dy, width)] = WallType.WoodWall;
      }
      tiles[tileIndex(cx + dx, cy + 1, width)] = TileType.Planks;
    }
    tiles[tileIndex(cx - 1, cy, width)] = TileType.Torch;
    placeChest(cx, cy, caveLootTables[i % caveLootTables.length]);
  });

  const world: WorldData = { width, height, tiles, walls, surfaceHeights, light, chests };
  recomputeLighting(world, 0.25);
  return world;
}

/**
 * Recompute per-tile light (0.06..1.0) based on sky exposure, timeOfDay ambient, and torches/furnaces.
 */
export function recomputeLighting(world: WorldData, timeOfDay: number): void {
  const { width, height, tiles, walls, light } = world;
  // Day ambient brightness: noon (0.25) -> 1.0, midnight (0.75) -> 0.24
  const sunAngle = timeOfDay * Math.PI * 2;
  const dayFactor = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.sin(sunAngle)));
  const skyLight = 0.24 + dayFactor * 0.76;

  light.fill(0.06);

  const queueX: number[] = [];
  const queueY: number[] = [];

  for (let x = 0; x < width; x++) {
    let blocked = false;
    for (let y = 0; y < height; y++) {
      const idx = tileIndex(x, y, width);
      const tile = tiles[idx] as TileType;
      const wall = walls[idx] as WallType;
      if (tile === TileType.Torch || tile === TileType.Furnace || tile === TileType.RubyOre) {
        const emit = tile === TileType.Torch ? 1.0 : tile === TileType.Furnace ? 0.85 : 0.45;
        if (emit > light[idx]) {
          light[idx] = emit;
          queueX.push(x);
          queueY.push(y);
        }
      }
      if (!blocked) {
        if (isTileSolid(tile) && tile !== TileType.Glass) {
          light[idx] = Math.max(light[idx], skyLight * 0.88);
          blocked = true;
        } else if (wall === WallType.None) {
          light[idx] = Math.max(light[idx], skyLight);
          queueX.push(x);
          queueY.push(y);
        } else {
          light[idx] = Math.max(light[idx], skyLight * 0.55);
          queueX.push(x);
          queueY.push(y);
        }
      }
    }
  }

  // BFS light propagation
  let head = 0;
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (head < queueX.length) {
    const cx = queueX[head];
    const cy = queueY[head];
    head++;
    const curLight = light[tileIndex(cx, cy, width)];
    if (curLight <= 0.1) continue;

    for (let d = 0; d < 4; d++) {
      const nx = cx + dirs[d][0];
      const ny = cy + dirs[d][1];
      if (!inBounds(nx, ny, world)) continue;
      const nIdx = tileIndex(nx, ny, width);
      const nTile = tiles[nIdx] as TileType;
      const decay = isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09;
      const nextLight = curLight - decay;
      if (nextLight > light[nIdx] + 0.02) {
        light[nIdx] = nextLight;
        queueX.push(nx);
        queueY.push(ny);
      }
    }
  }
}

export function getNearbyStations(
  world: WorldData,
  px: number,
  py: number,
): CraftingStation[] {
  const stations = new Set<CraftingStation>(['hand']);
  const tx = Math.floor(px / TILE_SIZE);
  const ty = Math.floor(py / TILE_SIZE);
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const tile = getTile(world, tx + dx, ty + dy);
      if (tile === TileType.Workbench) stations.add('workbench');
      if (tile === TileType.Furnace) stations.add('furnace');
      if (tile === TileType.Anvil) stations.add('anvil');
    }
  }
  return Array.from(stations);
}

/**
 * Checks if player is standing inside a valid enclosed house (background walls + solid enclosure + light source).
 */
export function isInsideValidHouse(
  world: WorldData,
  px: number,
  py: number,
): boolean {
  const startX = Math.floor(px / TILE_SIZE);
  const startY = Math.floor(py / TILE_SIZE);
  if (!inBounds(startX, startY, world)) return false;

  // Must have a background wall right behind the player
  if (getWall(world, startX, startY) === WallType.None) return false;

  const visited = new Set<number>();
  const queue: [number, number][] = [[startX, startY]];
  let hasLight = false;
  let interiorCount = 0;

  while (queue.length > 0 && interiorCount < 160) {
    const [cx, cy] = queue.shift()!;
    const key = cy * world.width + cx;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!inBounds(cx, cy, world)) return false;
    const tile = getTile(world, cx, cy);
    if (isTileSolid(tile) || tile === TileType.DoorClosed) {
      continue;
    }
    if (tile === TileType.Torch || tile === TileType.Furnace) {
      hasLight = true;
    }
    if (getWall(world, cx, cy) === WallType.None && tile !== TileType.DoorOpen) {
      // Exposed to open air without walls -> not enclosed
      return false;
    }
    interiorCount++;
    queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }

  return interiorCount >= 6 && interiorCount < 160 && hasLight;
}
