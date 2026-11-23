import {
  BiomeType,
  CraftingStation,
  HousingRoomReport,
  InventorySlot,
  TILE_SIZE,
  TileType,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  WallType,
  WorldData,
  WorldVariant,
} from './types';

export const BIOME_NAMES: Record<BiomeType, string> = {
  forest: 'Лес',
  snow: 'Снежный биом',
  crimson: 'Красный биом',
};

export const WORLD_VARIANTS: Record<
  WorldVariant,
  { id: WorldVariant; title: string; subtitle: string; badge: string; accent: string }
> = {
  crimson_classic: {
    id: 'crimson_classic',
    title: 'Классический Кримзон',
    subtitle: 'Ровные луга, Снежный запад, Кровавый восток, 5 небесных островов и глубокая преисподняя.',
    badge: '1000 × 220 • Стандарт',
    accent: '#ef4444',
  },
  crystal_highlands: {
    id: 'crystal_highlands',
    title: 'Небесные пики и Кристальные гроты',
    subtitle: 'Высокие альпийские хребты, 9 парящих островов с крыльями и богатые кристальные пещеры.',
    badge: '1000 × 220 • Экстрим',
    accent: '#38bdf8',
  },
};

export function getBiomeAtX(tx: number, width = WORLD_WIDTH): BiomeType {
  const snowEnd = Math.floor(width * 0.32);
  const crimsonStart = Math.floor(width * 0.68);
  if (tx < snowEnd) return 'snow';
  if (tx >= crimsonStart) return 'crimson';
  return 'forest';
}

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
    tile !== TileType.CrimsonLeaves &&
    tile !== TileType.Torch &&
    tile !== TileType.Workbench &&
    tile !== TileType.Furnace &&
    tile !== TileType.Anvil &&
    tile !== TileType.DoorOpen &&
    tile !== TileType.Platform &&
    tile !== TileType.Bed &&
    tile !== TileType.Chest &&
    tile !== TileType.Stool &&
    tile !== TileType.Wood &&
    tile !== TileType.CrimsonWood &&
    tile !== TileType.WoodBeam &&
    tile !== TileType.Table &&
    tile !== TileType.Chair &&
    tile !== TileType.Chandelier &&
    tile !== TileType.Bookshelf &&
    tile !== TileType.Pot &&
    tile !== TileType.Rope &&
    tile !== TileType.LifeCrystal &&
    tile !== TileType.PiggyBank
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
    case TileType.Crimstone:
    case TileType.CrimsonBrick:
    case TileType.Marble:
    case TileType.CrystalBlock:
    case TileType.GoldOre:
    case TileType.RubyOre:
      return 2;
    case TileType.Obsidian:
      return 3;
    default:
      return 1;
  }
}

export function getTileMaxDamage(tile: TileType): number {
  switch (tile) {
    case TileType.Leaves:
    case TileType.CrimsonLeaves:
    case TileType.Torch:
    case TileType.Platform:
    case TileType.Pot:
    case TileType.Rope:
      return 1;
    case TileType.Dirt:
    case TileType.Grass:
    case TileType.Snow:
    case TileType.Sand:
    case TileType.CrimsonGrass:
    case TileType.CrimsonDirt:
    case TileType.Glass:
    case TileType.Table:
    case TileType.Chair:
    case TileType.Chandelier:
    case TileType.Bookshelf:
    case TileType.PiggyBank:
      return 2;
    case TileType.Wood:
    case TileType.CrimsonWood:
    case TileType.WoodBeam:
    case TileType.Planks:
    case TileType.Ice:
    case TileType.SnowBrick:
    case TileType.SandstoneBrick:
    case TileType.Workbench:
    case TileType.DoorClosed:
    case TileType.DoorOpen:
    case TileType.Bed:
    case TileType.Chest:
    case TileType.LifeCrystal:
      return 3;
    case TileType.Stool:
      return 2;
    case TileType.Stone:
    case TileType.Brick:
    case TileType.RoofTile:
    case TileType.CoalOre:
    case TileType.CopperOre:
    case TileType.Furnace:
    case TileType.Anvil:
      return 4;
    case TileType.IronOre:
    case TileType.Crimstone:
    case TileType.CrimsonBrick:
    case TileType.Marble:
    case TileType.CrystalBlock:
      return 5;
    case TileType.GoldOre:
      return 6;
    case TileType.RubyOre:
      return 7;
    case TileType.Obsidian:
      return 9;
    default:
      return 2;
  }
}

export function generateWorld(
  seed = 42069,
  variant: WorldVariant = 'crimson_classic',
): WorldData {
  const rand = seededRandom(seed + (variant === 'crystal_highlands' ? 777 : 0));
  const width = WORLD_WIDTH;
  const height = WORLD_HEIGHT;
  const tiles = new Uint8Array(width * height);
  const walls = new Uint8Array(width * height);
  const surfaceHeights = new Int16Array(width);
  const light = new Float32Array(width * height);

  const isHighlands = variant === 'crystal_highlands';
  const baseSurface = 56;
  const spawnX = Math.floor(width / 2);

  // 1. Surface contour with flat central clearing for spawning & building
  for (let x = 0; x < width; x++) {
    const biome = getBiomeAtX(x, width);
    const wave1 = isHighlands
      ? Math.sin(x * 0.045) * 9.5 + Math.sin(x * 0.11) * 4.2
      : Math.sin(x * 0.055) * (biome === 'snow' ? 5.2 : biome === 'crimson' ? 4.8 : 4.0);
    const wave2 = isHighlands ? Math.cos(x * 0.16) * 3.1 : Math.cos(x * 0.15) * 2.0;
    let sy = Math.round(baseSurface + wave1 + wave2);

    // Flatten spawn meadow so player spawns on comfortable terrain
    const distFromCenter = Math.abs(x - spawnX);
    if (distFromCenter <= 14) {
      sy = baseSurface;
    } else if (distFromCenter <= 24) {
      const t = (distFromCenter - 14) / 10;
      sy = Math.round(baseSurface * (1 - t) + sy * t);
    }
    surfaceHeights[x] = Math.max(32, Math.min(78, sy));
  }

  // 2. Biome-aware Terrain Strata + Deep Underworld Obsidian Crust
  const underworldStart = height - 28; // y = 192..219
  for (let x = 0; x < width; x++) {
    const sy = surfaceHeights[x];
    const biome = getBiomeAtX(x, width);
    const soilDepth = 8 + Math.floor(rand() * 4);

    for (let y = 0; y < height; y++) {
      const idx = tileIndex(x, y, width);
      if (y < sy) {
        tiles[idx] = TileType.Air;
        walls[idx] = WallType.None;
      } else if (y >= underworldStart) {
        tiles[idx] = rand() < 0.72 ? TileType.Obsidian : TileType.Crimstone;
        walls[idx] = WallType.CrimsonWall;
      } else if (biome === 'snow') {
        if (y === sy) {
          tiles[idx] = TileType.Snow;
          walls[idx] = WallType.None;
        } else if (y < sy + soilDepth) {
          tiles[idx] = rand() < 0.74 ? TileType.Snow : TileType.Ice;
          walls[idx] = WallType.SnowWall;
        } else if (y < sy + 42) {
          tiles[idx] = rand() < 0.62 ? TileType.Ice : TileType.Stone;
          walls[idx] = WallType.SnowWall;
        } else {
          tiles[idx] = TileType.Stone;
          walls[idx] = WallType.StoneWall;
        }
      } else if (biome === 'crimson') {
        if (y === sy) {
          tiles[idx] = TileType.CrimsonGrass;
          walls[idx] = WallType.None;
        } else if (y < sy + soilDepth) {
          tiles[idx] = TileType.CrimsonDirt;
          walls[idx] = WallType.CrimsonWall;
        } else if (y < sy + 52) {
          tiles[idx] = rand() < 0.8 ? TileType.Crimstone : TileType.Stone;
          walls[idx] = WallType.CrimsonWall;
        } else {
          tiles[idx] = rand() < 0.48 ? TileType.Crimstone : TileType.Stone;
          walls[idx] = WallType.CrimsonWall;
        }
      } else {
        if (y === sy) {
          tiles[idx] = TileType.Grass;
          walls[idx] = WallType.None;
        } else if (y < sy + soilDepth) {
          tiles[idx] = TileType.Dirt;
          walls[idx] = WallType.DirtWall;
        } else if (isHighlands && y > 102 && y < 175 && rand() < 0.16) {
          tiles[idx] = TileType.Marble;
          walls[idx] = WallType.MarbleWall;
        } else {
          tiles[idx] = TileType.Stone;
          walls[idx] = WallType.StoneWall;
        }
      }
    }
  }

  // 3. Carve natural caves across the huge world (+ Underworld hell caverns)
  const caveCount = isHighlands ? 175 : 145;
  for (let c = 0; c < caveCount; c++) {
    let cx = 10 + Math.floor(rand() * (width - 20));
    let cy = surfaceHeights[cx] + 8 + Math.floor(rand() * (height - surfaceHeights[cx] - 18));
    if (Math.abs(cx - spawnX) < 12 && cy < baseSurface + 16) {
      cy += 16;
    }
    const steps = 26 + Math.floor(rand() * 44);
    let angle = rand() * Math.PI * 2;
    for (let s = 0; s < steps; s++) {
      const r = 1.9 + rand() * 2.5;
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
      cx += Math.cos(angle) * 1.75;
      cy += Math.sin(angle) * 1.3;
    }
  }

  // 4. Ore veins & Crystal/Marble grottos
  const placeOreVeins = (
    tile: TileType,
    count: number,
    minDepthOffset: number,
    maxY: number,
    veinSize: number,
    biomeFilter?: BiomeType,
  ) => {
    for (let i = 0; i < count; i++) {
      const ox = 4 + Math.floor(rand() * (width - 8));
      if (biomeFilter && getBiomeAtX(ox, width) !== biomeFilter) continue;
      const minY = Math.min(height - 5, surfaceHeights[ox] + minDepthOffset);
      if (minY >= maxY) continue;
      const oy = minY + Math.floor(rand() * (maxY - minY));
      for (let j = 0; j < veinSize; j++) {
        const vx = ox + Math.floor((rand() - 0.5) * 5);
        const vy = oy + Math.floor((rand() - 0.5) * 4);
        if (vx > 1 && vx < width - 2 && vy > surfaceHeights[vx] + 2 && vy < height - 2) {
          const cur = tiles[tileIndex(vx, vy, width)];
          if (
            cur === TileType.Stone ||
            cur === TileType.Dirt ||
            cur === TileType.Ice ||
            cur === TileType.Crimstone ||
            cur === TileType.CrimsonDirt ||
            cur === TileType.Snow ||
            cur === TileType.Marble
          ) {
            tiles[tileIndex(vx, vy, width)] = tile;
          }
        }
      }
    }
  };

  const oreMult = isHighlands ? 1.35 : 1;
  placeOreVeins(TileType.CoalOre, Math.round(320 * oreMult), 3, height - 6, 7);
  placeOreVeins(TileType.CopperOre, Math.round(290 * oreMult), 3, height - 16, 7);
  placeOreVeins(TileType.IronOre, Math.round(250 * oreMult), 8, height - 4, 6);
  placeOreVeins(TileType.GoldOre, Math.round(180 * oreMult), 22, height - 3, 5);
  placeOreVeins(TileType.RubyOre, Math.round(130 * oreMult), 36, height - 3, 4);
  placeOreVeins(TileType.Sand, 85, 2, 92, 9, 'forest');
  placeOreVeins(TileType.Marble, isHighlands ? 150 : 90, 26, height - 24, 9);
  placeOreVeins(TileType.CrystalBlock, isHighlands ? 160 : 80, 42, height - 12, 6);
  placeOreVeins(TileType.Obsidian, 110, 72, height - 2, 7);

  // 5. Biome Trees
  let lastTreeX = -10;
  for (let x = 6; x < width - 6; x++) {
    if (Math.abs(x - spawnX) <= 9) continue;
    if (x - lastTreeX < 5) continue;
    if (rand() < 0.31) {
      const sy = surfaceHeights[x];
      const ground = tiles[tileIndex(x, sy, width)];
      const biome = getBiomeAtX(x, width);
      if (
        ground === TileType.Grass ||
        ground === TileType.Snow ||
        ground === TileType.CrimsonGrass
      ) {
        const trunkTile = biome === 'crimson' ? TileType.CrimsonWood : TileType.Wood;
        const leafTile =
          biome === 'crimson'
            ? TileType.CrimsonLeaves
            : biome === 'snow'
              ? TileType.Snow
              : TileType.Leaves;
        const trunkH = 4 + Math.floor(rand() * 5);
        for (let h = 1; h <= trunkH; h++) {
          if (sy - h > 2) {
            tiles[tileIndex(x, sy - h, width)] = trunkTile;
          }
        }
        const topY = sy - trunkH;
        for (let dy = -2; dy <= 1; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (Math.abs(dx) === 2 && Math.abs(dy) === 2) continue;
            if (biome === 'snow' && dy === -2 && Math.abs(dx) > 0) continue;
            const lx = x + dx;
            const ly = topY + dy;
            if (lx > 1 && lx < width - 2 && ly > 1) {
              const idx = tileIndex(lx, ly, width);
              if (tiles[idx] === TileType.Air) {
                tiles[idx] = leafTile;
              }
            }
          }
        }
        lastTreeX = x;
      }
    }
  }

  // 6. Welcome camp at center spawn
  const sySpawn = surfaceHeights[spawnX];
  tiles[tileIndex(spawnX - 3, sySpawn - 1, width)] = TileType.Torch;
  tiles[tileIndex(spawnX + 3, sySpawn - 1, width)] = TileType.Torch;
  tiles[tileIndex(spawnX + 2, sySpawn - 1, width)] = TileType.Stool;

  // 7. Treasure Chest Helper & Sky Islands
  const chests: Record<number, InventorySlot[]> = {};
  const placeChest = (cx: number, cy: number, loot: InventorySlot[]) => {
    if (cx < 2 || cx >= width - 2 || cy < 2 || cy >= height - 2) return;
    const floorIdx = tileIndex(cx, cy + 1, width);
    if (!isTileSolid(tiles[floorIdx] as TileType)) {
      tiles[floorIdx] = TileType.Planks;
    }
    const idx = tileIndex(cx, cy, width);
    tiles[idx] = TileType.Chest;
    chests[idx] = loot;
  };

  // Floating Sky Islands (5 in Classic, 9 in Crystal Highlands!)
  const skyIslandCols = isHighlands
    ? [90, 190, 295, 405, 500, 610, 725, 830, 925]
    : [115, 290, 440, 635, 865];

  const skyLootPool: InventorySlot[][] = [
    [
      { itemId: 'starfury', count: 1 },
      { itemId: 'lucky_horseshoe', count: 1 },
      { itemId: 'shiny_red_balloon', count: 1 },
      { itemId: 'crystal_block', count: 16 },
    ],
    [
      { itemId: 'angel_wings', count: 1 },
      { itemId: 'celestial_emblem', count: 1 },
      { itemId: 'fallen_star', count: 6 },
      { itemId: 'gold_bar', count: 6 },
    ],
    [
      { itemId: 'cloud_in_bottle', count: 1 },
      { itemId: 'lucky_horseshoe', count: 1 },
      { itemId: 'summon_empress_light', count: 1 },
      { itemId: 'mana_flower', count: 1 },
    ],
    [
      { itemId: 'starfury', count: 1 },
      { itemId: 'shiny_red_balloon', count: 1 },
      { itemId: 'summon_queen_slime', count: 1 },
      { itemId: 'crystal_block', count: 20 },
    ],
  ];

  skyIslandCols.forEach((ix, idx) => {
    const iy = 15 + (idx % 3) * 5;
    const halfW = 8;
    for (let dx = -halfW; dx <= halfW; dx++) {
      const tx = ix + dx;
      if (tx < 3 || tx >= width - 3) continue;
      setTile(
        { width, height, variant, tiles, walls, surfaceHeights, light, chests },
        tx,
        iy,
        isHighlands ? TileType.CrystalBlock : TileType.Grass,
      );
      const belly = Math.max(1, Math.round(3 - Math.abs(dx) * 0.34));
      for (let dy = 1; dy <= belly; dy++) {
        tiles[tileIndex(tx, iy + dy, width)] =
          isHighlands && dy === 1 ? TileType.Marble : TileType.Dirt;
      }
    }
    // Small shrine hut & chest on sky island
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= -1; dy++) {
        tiles[tileIndex(ix + dx, iy + dy, width)] = TileType.Air;
        walls[tileIndex(ix + dx, iy + dy, width)] = isHighlands
          ? WallType.MarbleWall
          : WallType.WoodWall;
      }
      tiles[tileIndex(ix + dx, iy - 4, width)] = TileType.Planks;
    }
    tiles[tileIndex(ix - 3, iy - 1, width)] = TileType.DoorClosed;
    tiles[tileIndex(ix - 3, iy - 2, width)] = TileType.DoorClosed;
    tiles[tileIndex(ix + 3, iy - 1, width)] = TileType.DoorClosed;
    tiles[tileIndex(ix + 3, iy - 2, width)] = TileType.DoorClosed;
    tiles[tileIndex(ix - 2, iy - 2, width)] = TileType.Torch;
    tiles[tileIndex(ix + 2, iy - 2, width)] = TileType.Torch;
    placeChest(ix, iy - 1, skyLootPool[idx % skyLootPool.length]);
  });

  // Surface Chests near spawn (Kotulhu & Cat Worm basics preserved!)
  const leftChestX = spawnX - 15;
  placeChest(leftChestX, surfaceHeights[leftChestX] - 1, [
    { itemId: 'summon_kotulhu', count: 2 },
    { itemId: 'wood_helmet', count: 1 },
    { itemId: 'crispy_fish', count: 3 },
    { itemId: 'torch_item', count: 12 },
    { itemId: 'copper_sword', count: 1 },
  ]);

  const rightChestX = spawnX + 16;
  placeChest(rightChestX, surfaceHeights[rightChestX] - 1, [
    { itemId: 'summon_cat_worm', count: 2 },
    { itemId: 'shackle', count: 1 },
    { itemId: 'warm_milk', count: 2 },
    { itemId: 'yarn_bomb', count: 8 },
    { itemId: 'iron_bar', count: 6 },
  ]);

  // Snow biome surface chest (14% of width = 140)
  const snowChestX = Math.floor(width * 0.14);
  placeChest(snowChestX, surfaceHeights[snowChestX] - 1, [
    { itemId: 'ice_blade', count: 1 },
    { itemId: 'ice_pickaxe', count: 1 },
    { itemId: 'cloud_in_bottle', count: 1 },
    { itemId: 'summon_deerclops', count: 1 },
    { itemId: 'snow_brick', count: 24 },
  ]);

  // Crimson biome surface chest (86% of width = 860)
  const crimsonChestX = Math.floor(width * 0.86);
  placeChest(crimsonChestX, surfaceHeights[crimsonChestX] - 1, [
    { itemId: 'crimson_bow', count: 1 },
    { itemId: 'hermes_boots', count: 1 },
    { itemId: 'summon_brain_cthulhu', count: 1 },
    { itemId: 'crimson_brick', count: 24 },
    { itemId: 'catnip_elixir', count: 1 },
  ]);

  // Underground cave & underworld chests scaled across 1000-wide map
  const caveLootTables: InventorySlot[][] = [
    [
      { itemId: 'summon_king_slime', count: 1 },
      { itemId: 'summon_kotulhu', count: 1 },
      { itemId: 'magic_mirror', count: 1 },
      { itemId: 'iron_chestplate', count: 1 },
      { itemId: 'copper_bar', count: 10 },
    ],
    [
      { itemId: 'summon_cat_worm', count: 1 },
      { itemId: 'summon_queen_bee', count: 1 },
      { itemId: 'ice_bow', count: 1 },
      { itemId: 'cloud_in_bottle', count: 1 },
      { itemId: 'gold_bar', count: 6 },
    ],
    [
      { itemId: 'summon_eye_boss', count: 1 },
      { itemId: 'cobalt_shield', count: 1 },
      { itemId: 'grappling_hook', count: 1 },
      { itemId: 'catnip_elixir', count: 1 },
      { itemId: 'ruby_gem', count: 2 },
    ],
    [
      { itemId: 'summon_skele_cat', count: 1 },
      { itemId: 'water_bolt', count: 1 },
      { itemId: 'gold_helmet', count: 1 },
      { itemId: 'warm_milk', count: 3 },
      { itemId: 'crystal_block', count: 14 },
    ],
    [
      { itemId: 'summon_twins', count: 1 },
      { itemId: 'hermes_boots', count: 1 },
      { itemId: 'shiny_red_balloon', count: 1 },
      { itemId: 'iron_bar', count: 12 },
      { itemId: 'terraria_bomb', count: 8 },
    ],
    [
      { itemId: 'summon_plantera', count: 1 },
      { itemId: 'crimson_pickaxe', count: 1 },
      { itemId: 'band_of_regen', count: 1 },
      { itemId: 'obsidian_block', count: 16 },
      { itemId: 'mana_flower', count: 1 },
    ],
  ];

  const chestFractions = [0.08, 0.16, 0.24, 0.34, 0.42, 0.58, 0.66, 0.74, 0.82, 0.9, 0.95];
  chestFractions.forEach((frac, i) => {
    const cx = Math.floor(width * frac);
    const sy = surfaceHeights[cx];
    const targetDepth = sy + 16 + (i % 4) * 26;
    const cy = Math.min(height - 10, targetDepth);
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 0; dy++) {
        tiles[tileIndex(cx + dx, cy + dy, width)] = TileType.Air;
        walls[tileIndex(cx + dx, cy + dy, width)] = WallType.WoodWall;
      }
      tiles[tileIndex(cx + dx, cy + 1, width)] = TileType.Planks;
    }
    tiles[tileIndex(cx - 1, cy, width)] = TileType.Torch;
    placeChest(cx, cy, caveLootTables[i % caveLootTables.length]);
  });

  // Underworld Sanctuary Chest at center deep (x=500, y=195)
  const uwX = spawnX;
  const uwY = underworldStart + 4;
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 0; dy++) {
      tiles[tileIndex(uwX + dx, uwY + dy, width)] = TileType.Air;
      walls[tileIndex(uwX + dx, uwY + dy, width)] = WallType.CrimsonWall;
    }
    tiles[tileIndex(uwX + dx, uwY + 1, width)] = TileType.CrimsonBrick;
  }
  tiles[tileIndex(uwX - 2, uwY - 1, width)] = TileType.Torch;
  tiles[tileIndex(uwX + 2, uwY - 1, width)] = TileType.Torch;
  placeChest(uwX, uwY, [
    { itemId: 'summon_wall_of_flesh', count: 2 },
    { itemId: 'obsidian_chestplate', count: 1 },
    { itemId: 'obsidian_pickaxe', count: 1 },
    { itemId: 'dynamite', count: 10 },
    { itemId: 'summon_golem', count: 1 },
  ]);

  // 8. Scatter Breakable Pots & Life Crystals across the huge caves
  let potsPlaced = 0;
  for (let attempt = 0; attempt < 1600 && potsPlaced < 150; attempt++) {
    const px = 6 + Math.floor(rand() * (width - 12));
    const py = surfaceHeights[px] + 6 + Math.floor(rand() * (height - surfaceHeights[px] - 10));
    const idx = tileIndex(px, py, width);
    const below = tiles[tileIndex(px, py + 1, width)] as TileType;
    if (tiles[idx] === TileType.Air && isTileSolid(below)) {
      tiles[idx] = TileType.Pot;
      potsPlaced++;
    }
  }

  const targetCrystals = isHighlands ? 56 : 45;
  let crystalsPlaced = 0;
  for (let attempt = 0; attempt < 1800 && crystalsPlaced < targetCrystals; attempt++) {
    const cx = 8 + Math.floor(rand() * (width - 16));
    const minCy = Math.min(height - 10, surfaceHeights[cx] + 22);
    const cy = minCy + Math.floor(rand() * Math.max(1, height - 6 - minCy));
    const idx = tileIndex(cx, cy, width);
    const below = tiles[tileIndex(cx, cy + 1, width)] as TileType;
    if (tiles[idx] === TileType.Air && isTileSolid(below)) {
      tiles[idx] = TileType.LifeCrystal;
      crystalsPlaced++;
    }
  }

  const world: WorldData = { width, height, variant, tiles, walls, surfaceHeights, light, chests };
  recomputeLighting(world, 0.25);
  return world;
}

// Reusable scratch buffer so recomputeLighting allocates zero heap memory during gameplay
let lightQueueScratch: Int32Array | null = null;

/**
 * Fast BFS lighting (0.06..1.0) optimized for 1000x220 worlds.
 */
export function recomputeLighting(world: WorldData, timeOfDay: number): void {
  const { width, height, tiles, walls, light } = world;
  const total = width * height;
  const sunAngle = timeOfDay * Math.PI * 2;
  const dayFactor = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.sin(sunAngle)));
  const skyLight = 0.24 + dayFactor * 0.76;

  light.fill(0.06);

  if (!lightQueueScratch || lightQueueScratch.length < total * 2) {
    lightQueueScratch = new Int32Array(total * 2);
  }
  const queue = lightQueueScratch;
  let tail = 0;

  const enqueue = (idx: number) => {
    if (tail < queue.length) {
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    let blocked = false;
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      const tile = tiles[idx] as TileType;
      const wall = walls[idx] as WallType;

      if (
        tile === TileType.Torch ||
        tile === TileType.Chandelier ||
        tile === TileType.Furnace ||
        tile === TileType.RubyOre ||
        tile === TileType.CrystalBlock ||
        tile === TileType.LifeCrystal
      ) {
        const emit =
          tile === TileType.Torch || tile === TileType.Chandelier
            ? 1.0
            : tile === TileType.Furnace
              ? 0.85
              : tile === TileType.CrystalBlock || tile === TileType.LifeCrystal
                ? 0.74
                : 0.45;
        if (emit > light[idx]) {
          light[idx] = emit;
          enqueue(idx);
        }
      }

      if (!blocked) {
        if (isTileSolid(tile) && tile !== TileType.Glass) {
          light[idx] = Math.max(light[idx], skyLight * 0.88);
          blocked = true;
          enqueue(idx);
        } else if (wall === WallType.None) {
          light[idx] = Math.max(light[idx], skyLight);
          // Only enqueue sky tiles adjacent to dark/walled/solid neighbors
          const hasRightEdge =
            x + 1 < width &&
            (walls[idx + 1] !== WallType.None || isTileSolid(tiles[idx + 1] as TileType));
          const hasLeftEdge =
            x - 1 >= 0 &&
            (walls[idx - 1] !== WallType.None || isTileSolid(tiles[idx - 1] as TileType));
          const hasBottomEdge =
            y + 1 < height &&
            (walls[idx + width] !== WallType.None || isTileSolid(tiles[idx + width] as TileType));
          if (hasRightEdge || hasLeftEdge || hasBottomEdge) {
            enqueue(idx);
          }
        } else {
          light[idx] = Math.max(light[idx], skyLight * 0.55);
          enqueue(idx);
        }
      }
    }
  }

  let head = 0;
  while (head < tail) {
    const idx = queue[head++];
    const curLight = light[idx];
    if (curLight <= 0.1) continue;

    const cx = idx % width;
    const cy = (idx - cx) / width;

    // Right
    if (cx + 1 < width) {
      const nIdx = idx + 1;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
      }
    }
    // Left
    if (cx - 1 >= 0) {
      const nIdx = idx - 1;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
      }
    }
    // Down
    if (cy + 1 < height) {
      const nIdx = idx + width;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
      }
    }
    // Up
    if (cy - 1 >= 0) {
      const nIdx = idx - width;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
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

export function inspectRoomHousing(
  world: WorldData,
  startX: number,
  startY: number,
): { report: HousingRoomReport; visitedKeys: number[]; floorY: number } {
  const emptyReport = (reasons: string[]): HousingRoomReport => ({
    valid: false,
    hasHouseForNpc: false,
    interiorCount: 0,
    hasWall: false,
    hasLight: false,
    hasDoor: false,
    hasTable: false,
    hasSeat: false,
    reasons,
    centerTileX: startX,
    centerTileY: startY,
  });

  if (!inBounds(startX, startY, world)) {
    return { report: emptyReport(['Вне границ мира']), visitedKeys: [], floorY: startY };
  }

  const startTile = getTile(world, startX, startY);
  if (isTileSolid(startTile) || startTile === TileType.DoorClosed) {
    return { report: emptyReport(['Внутри блока']), visitedKeys: [], floorY: startY };
  }

  if (getWall(world, startX, startY) === WallType.None && startTile !== TileType.DoorOpen) {
    return {
      report: emptyReport(['Поставь задние стены (дерево/кирпич), чтобы закрыть комнату']),
      visitedKeys: [],
      floorY: startY,
    };
  }

  const visited = new Set<number>();
  const queue: [number, number][] = [[startX, startY]];
  let head = 0;
  let hasLight = false;
  let hasDoor = false;
  let hasTable = false;
  let hasSeat = false;
  let hasWallGap = false;
  let sumX = 0;
  let sumY = 0;
  let maxY = startY;
  const visitedKeys: number[] = [];

  while (head < queue.length && visited.size < 185) {
    const [cx, cy] = queue[head++];
    const key = cy * world.width + cx;
    if (visited.has(key)) continue;

    if (!inBounds(cx, cy, world)) {
      hasWallGap = true;
      break;
    }

    const tile = getTile(world, cx, cy);
    if (tile === TileType.DoorClosed) {
      hasDoor = true;
      continue;
    }
    if (isTileSolid(tile)) {
      continue;
    }

    const wall = getWall(world, cx, cy);
    if (wall === WallType.None && tile !== TileType.DoorOpen) {
      hasWallGap = true;
      break;
    }

    visited.add(key);
    visitedKeys.push(key);
    sumX += cx;
    sumY += cy;
    if (cy > maxY) maxY = cy;

    if (
      tile === TileType.Torch ||
      tile === TileType.Chandelier ||
      tile === TileType.Furnace ||
      tile === TileType.CrystalBlock
    ) {
      hasLight = true;
    }
    if (tile === TileType.DoorOpen || tile === TileType.Platform) {
      hasDoor = true;
    }
    if (
      tile === TileType.Table ||
      tile === TileType.Workbench ||
      tile === TileType.Bookshelf ||
      tile === TileType.PiggyBank
    ) {
      hasTable = true;
    }
    if (tile === TileType.Chair || tile === TileType.Stool || tile === TileType.Bed) {
      hasSeat = true;
    }

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (inBounds(nx, ny, world) && getTile(world, nx, ny) === TileType.DoorClosed) {
        hasDoor = true;
      }
    }

    queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }

  const interiorCount = visited.size;
  const tooLarge = visited.size >= 185;
  const enclosed = !hasWallGap && !tooLarge && interiorCount >= 6;

  const reasons: string[] = [];
  if (hasWallGap) reasons.push('Закройте задние стены и периметр');
  else if (tooLarge) reasons.push('Комната не замкнута или слишком огромная');
  else if (interiorCount < 6) reasons.push('Сделайте комнату просторнее (от 6 клеток)');
  if (!hasLight) reasons.push('Поставьте факел или люстру');
  if (!hasDoor) reasons.push('Добавьте дверь или платформу');
  if (!hasTable) reasons.push('Поставьте стол или верстак');
  if (!hasSeat) reasons.push('Поставьте стул, табуретку или кровать');

  const centerTileX = interiorCount > 0 ? Math.round(sumX / interiorCount) : startX;
  const centerTileY = interiorCount > 0 ? Math.round(sumY / interiorCount) : startY;
  const valid = enclosed && hasLight;
  const hasHouseForNpc = valid && hasDoor && hasTable && hasSeat;

  return {
    report: {
      valid,
      hasHouseForNpc,
      interiorCount,
      hasWall: !hasWallGap,
      hasLight,
      hasDoor,
      hasTable,
      hasSeat,
      reasons,
      centerTileX,
      centerTileY,
    },
    visitedKeys,
    floorY: maxY,
  };
}

export function isInsideValidHouse(
  world: WorldData,
  px: number,
  py: number,
): boolean {
  const startX = Math.floor(px / TILE_SIZE);
  const startY = Math.floor(py / TILE_SIZE);
  return inspectRoomHousing(world, startX, startY).report.valid;
}

export interface ValidNpcHouse {
  roomKey: number;
  centerTileX: number;
  centerTileY: number;
  floorY: number;
}

export function findValidNpcHouses(world: WorldData): ValidNpcHouse[] {
  const claimedTiles = new Set<number>();
  const houses: ValidNpcHouse[] = [];

  for (let y = 3; y < world.height - 3; y++) {
    for (let x = 3; x < world.width - 3; x++) {
      const idx = y * world.width + x;
      if (claimedTiles.has(idx)) continue;
      const tile = world.tiles[idx] as TileType;
      if (
        tile !== TileType.Chair &&
        tile !== TileType.Stool &&
        tile !== TileType.Bed &&
        tile !== TileType.Table
      ) {
        continue;
      }
      const { report, visitedKeys, floorY } = inspectRoomHousing(world, x, y);
      if (report.hasHouseForNpc && visitedKeys.length > 0) {
        let minKey = visitedKeys[0];
        for (const k of visitedKeys) {
          claimedTiles.add(k);
          if (k < minKey) minKey = k;
        }
        houses.push({
          roomKey: minKey,
          centerTileX: report.centerTileX,
          centerTileY: report.centerTileY,
          floorY,
        });
      }
    }
  }
  return houses;
}

export function buildQuickHouseAt(
  world: WorldData,
  anchorX: number,
  floorY: number,
): { built: boolean; reason?: string; centerTileX: number; centerTileY: number } {
  const left = anchorX - 4;
  const right = anchorX + 4;
  const top = floorY - 5;

  if (left < 2 || right >= world.width - 2 || top < 2 || floorY >= world.height - 2) {
    return { built: false, reason: 'Слишком близко к краю мира', centerTileX: anchorX, centerTileY: floorY - 2 };
  }

  for (let x = left; x <= right; x++) {
    for (let y = top - 1; y <= floorY; y++) {
      const t = getTile(world, x, y);
      if (t === TileType.Chest || t === TileType.Stool || t === TileType.LifeCrystal) {
        return {
          built: false,
          reason: 'Освободи место (рядом сундук, табуретка или кристалл)',
          centerTileX: anchorX,
          centerTileY: floorY - 2,
        };
      }
    }
  }

  for (let x = left; x <= right; x++) {
    setTile(world, x, floorY, TileType.Planks);
    setTile(world, x, top, TileType.Planks);
    setTile(world, x, top - 1, TileType.RoofTile);
  }

  for (let y = top + 1; y < floorY; y++) {
    if (y === floorY - 1 || y === floorY - 2) {
      setTile(world, left, y, TileType.DoorClosed);
      setTile(world, right, y, TileType.DoorClosed);
    } else {
      setTile(world, left, y, TileType.Planks);
      setTile(world, right, y, TileType.Planks);
    }
  }

  for (let x = left + 1; x < right; x++) {
    for (let y = top + 1; y < floorY; y++) {
      setTile(world, x, y, TileType.Air);
      setWall(world, x, y, WallType.WoodWall);
    }
  }

  setTile(world, anchorX, floorY - 3, TileType.Glass);
  setTile(world, anchorX, top + 1, TileType.Chandelier);
  setTile(world, anchorX - 2, floorY - 1, TileType.Table);
  setTile(world, anchorX - 1, floorY - 1, TileType.Chair);
  setTile(world, anchorX + 2, floorY - 1, TileType.Workbench);
  setTile(world, left + 1, floorY - 3, TileType.Torch);
  setTile(world, right - 1, floorY - 3, TileType.Torch);

  return { built: true, centerTileX: anchorX, centerTileY: floorY - 2 };
}
