import { BIOME_LABELS, WORLD_VARIANT_LABELS } from './i18n';
import {
  BiomeType,
  CraftingStation,
  HousingRoomReport,
  InventorySlot,
  Language,
  TILE_SIZE,
  TileType,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  WallType,
  WorldData,
  WorldVariant,
} from './types';

export const BIOME_NAMES: Record<BiomeType, string> = {
  forest: 'Forest',
  snow: 'Snow Tundra',
  desert: 'Desert & Pyramid',
  crimson: 'Crimson',
  crystal: 'Crystal Hollow',
  ocean: 'Ocean Coast',
};

export function getBiomeName(biome: BiomeType, lang: Language = 'en'): string {
  return BIOME_LABELS[biome][lang];
}

export const WORLD_VARIANTS: Record<
  WorldVariant,
  { id: WorldVariant; title: string; subtitle: string; badge: string; accent: string }
> = {
  crimson_classic: {
    id: 'crimson_classic',
    title: WORLD_VARIANT_LABELS.crimson_classic.title.en,
    subtitle: WORLD_VARIANT_LABELS.crimson_classic.subtitle.en,
    badge: WORLD_VARIANT_LABELS.crimson_classic.badge.en,
    accent: '#ef4444',
  },
  crystal_highlands: {
    id: 'crystal_highlands',
    title: WORLD_VARIANT_LABELS.crystal_highlands.title.en,
    subtitle: WORLD_VARIANT_LABELS.crystal_highlands.subtitle.en,
    badge: WORLD_VARIANT_LABELS.crystal_highlands.badge.en,
    accent: '#38bdf8',
  },
};

export function getWorldVariantInfo(variant: WorldVariant, lang: Language = 'en') {
  const lbl = WORLD_VARIANT_LABELS[variant];
  return {
    id: variant,
    title: lbl.title[lang],
    subtitle: lbl.subtitle[lang],
    badge: lbl.badge[lang],
    accent: WORLD_VARIANTS[variant].accent,
  };
}

export function getBiomeAtX(tx: number, width = WORLD_WIDTH): BiomeType {
  const ratio = tx / Math.max(1, width);
  if (ratio < 0.1834) return 'snow';       // 0..440
  if (ratio < 0.375) return 'desert';      // 440..900
  if (ratio < 0.625) return 'forest';      // 900..1500 (spawn 1200)
  if (ratio < 0.825) return 'crimson';     // 1500..1980
  if (ratio < 0.9334) return 'crystal';    // 1980..2240
  return 'ocean';                          // 2240..2400
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
    tile !== TileType.PiggyBank &&
    tile !== TileType.Cactus &&
    tile !== TileType.Campfire &&
    tile !== TileType.HeartLantern &&
    tile !== TileType.CrimsonAltar &&
    tile !== TileType.Sunflower
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
    case TileType.CrimsonTooth:
    case TileType.Marble:
    case TileType.CrystalBlock:
    case TileType.GoldOre:
    case TileType.RubyOre:
      return 2;
    case TileType.Obsidian:
    case TileType.HellstoneOre:
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
    case TileType.Campfire:
    case TileType.Sunflower:
      return 1;
    case TileType.Dirt:
    case TileType.Grass:
    case TileType.Snow:
    case TileType.Sand:
    case TileType.Cactus:
    case TileType.CrimsonGrass:
    case TileType.CrimsonDirt:
    case TileType.Glass:
    case TileType.Table:
    case TileType.Chair:
    case TileType.Chandelier:
    case TileType.Bookshelf:
    case TileType.PiggyBank:
    case TileType.HeartLantern:
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
    case TileType.CrimsonTooth:
    case TileType.CrimsonAltar:
    case TileType.Marble:
    case TileType.CrystalBlock:
      return 5;
    case TileType.GoldOre:
      return 6;
    case TileType.RubyOre:
      return 7;
    case TileType.Obsidian:
    case TileType.HellstoneOre:
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
  const baseSurface = 72;
  const spawnX = Math.floor(width / 2); // 1200
  const pyramidX = Math.floor(width * 0.275); // 660 (right in Desert!)

  // 1. Surface contour with flat Spawn meadow & flat Desert Pyramid plateau
  for (let x = 0; x < width; x++) {
    const biome = getBiomeAtX(x, width);
    const wave1 = isHighlands
      ? Math.sin(x * 0.04) * 11 + Math.sin(x * 0.1) * 4.5
      : Math.sin(x * 0.048) *
        (biome === 'snow'
          ? 5.5
          : biome === 'desert'
            ? 3.2
            : biome === 'crimson'
              ? 5.2
              : biome === 'crystal'
                ? 6.4
                : biome === 'ocean'
                  ? 2.2
                  : 4.2);
    const wave2 = isHighlands ? Math.cos(x * 0.15) * 3.2 : Math.cos(x * 0.14) * 2.0;
    let sy = Math.round(baseSurface + wave1 + wave2);

    if (biome === 'ocean') {
      const coastT = (x - Math.floor(width * 0.9334)) / Math.max(1, width * 0.0666);
      sy = Math.round(baseSurface + 3 + coastT * 10 + Math.sin(x * 0.18) * 1.4);
    }

    // Flatten spawn meadow
    const distFromCenter = Math.abs(x - spawnX);
    if (distFromCenter <= 18) {
      sy = baseSurface;
    } else if (distFromCenter <= 30) {
      const t = (distFromCenter - 18) / 12;
      sy = Math.round(baseSurface * (1 - t) + sy * t);
    }

    // Flatten Desert Pyramid plateau around pyramidX = 660
    const distFromPyramid = Math.abs(x - pyramidX);
    if (distFromPyramid <= 28) {
      sy = baseSurface + 2;
    } else if (distFromPyramid <= 40) {
      const t = (distFromPyramid - 28) / 12;
      sy = Math.round((baseSurface + 2) * (1 - t) + sy * t);
    }

    surfaceHeights[x] = Math.max(42, Math.min(98, sy));
  }

  // 2. Biome-aware Terrain Strata + Deep Underworld Obsidian Crust
  const underworldStart = height - 48; // y = 332..379
  for (let x = 0; x < width; x++) {
    const sy = surfaceHeights[x];
    const biome = getBiomeAtX(x, width);
    const soilDepth = 10 + Math.floor(rand() * 5);

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
        } else if (y < sy + 64) {
          tiles[idx] = rand() < 0.62 ? TileType.Ice : TileType.Stone;
          walls[idx] = WallType.SnowWall;
        } else {
          tiles[idx] = TileType.Stone;
          walls[idx] = WallType.StoneWall;
        }
      } else if (biome === 'desert') {
        if (y === sy) {
          tiles[idx] = TileType.Sand;
          walls[idx] = WallType.None;
        } else if (y < sy + soilDepth + 12) {
          tiles[idx] = rand() < 0.88 ? TileType.Sand : TileType.SandstoneBrick;
          walls[idx] = WallType.SandstoneWall;
        } else if (y < sy + 72) {
          tiles[idx] = rand() < 0.45 ? TileType.SandstoneBrick : TileType.Stone;
          walls[idx] = WallType.SandstoneWall;
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
        } else if (y < sy + 76) {
          tiles[idx] = rand() < 0.8 ? TileType.Crimstone : TileType.Stone;
          walls[idx] = WallType.CrimsonWall;
        } else {
          tiles[idx] = rand() < 0.48 ? TileType.Crimstone : TileType.Stone;
          walls[idx] = WallType.CrimsonWall;
        }
      } else if (biome === 'crystal') {
        const surfChance = isHighlands ? 0.56 : 0.3;
        const midChance = isHighlands ? 0.48 : 0.24;
        const deepChance = isHighlands ? 0.36 : 0.16;
        if (y === sy) {
          tiles[idx] = rand() < surfChance ? TileType.CrystalBlock : TileType.Grass;
          walls[idx] = WallType.None;
        } else if (y < sy + soilDepth) {
          tiles[idx] = rand() < 0.35 ? TileType.Marble : TileType.Dirt;
          walls[idx] = WallType.MarbleWall;
        } else if (y < sy + 80) {
          tiles[idx] = rand() < midChance ? TileType.CrystalBlock : rand() < 0.5 ? TileType.Marble : TileType.Stone;
          walls[idx] = WallType.MarbleWall;
        } else {
          tiles[idx] = rand() < deepChance ? TileType.CrystalBlock : TileType.Stone;
          walls[idx] = WallType.StoneWall;
        }
      } else if (biome === 'ocean') {
        if (y < sy + soilDepth + 8) {
          tiles[idx] = TileType.Sand;
          walls[idx] = y === sy ? WallType.None : WallType.SandstoneWall;
        } else {
          tiles[idx] = TileType.Stone;
          walls[idx] = WallType.StoneWall;
        }
      } else {
        if (y === sy) {
          tiles[idx] = TileType.Grass;
          walls[idx] = WallType.None;
        } else if (y < sy + soilDepth) {
          tiles[idx] = TileType.Dirt;
          walls[idx] = WallType.DirtWall;
        } else if (isHighlands && y > 130 && y < 290 && rand() < 0.22) {
          tiles[idx] = rand() < 0.35 ? TileType.CrystalBlock : TileType.Marble;
          walls[idx] = WallType.MarbleWall;
        } else {
          tiles[idx] = TileType.Stone;
          walls[idx] = WallType.StoneWall;
        }
      }
    }
  }

  // 3. Carve natural caves across the huge 2400x380 world
  const caveCount = isHighlands ? 460 : 380;
  for (let c = 0; c < caveCount; c++) {
    let cx = 12 + Math.floor(rand() * (width - 24));
    let cy = surfaceHeights[cx] + 10 + Math.floor(rand() * (height - surfaceHeights[cx] - 22));
    if (Math.abs(cx - spawnX) < 16 && cy < baseSurface + 20) {
      cy += 20;
    }
    if (Math.abs(cx - pyramidX) < 30 && cy < baseSurface + 32) {
      cy += 34;
    }
    const steps = 32 + Math.floor(rand() * 58);
    let angle = rand() * Math.PI * 2;
    for (let s = 0; s < steps; s++) {
      const r = 2.0 + rand() * 2.8;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            const tx = Math.round(cx + dx);
            const ty = Math.round(cy + dy);
            if (tx > 1 && tx < width - 2 && ty > surfaceHeights[tx] + 4 && ty < height - 3) {
              tiles[tileIndex(tx, ty, width)] = TileType.Air;
            }
          }
        }
      }
      angle += (rand() - 0.5) * 0.85;
      cx += Math.cos(angle) * 1.8;
      cy += Math.sin(angle) * 1.35;
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
      if (Math.abs(ox - pyramidX) < 28) continue;
      const minY = Math.min(height - 6, surfaceHeights[ox] + minDepthOffset);
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
            cur === TileType.Sand ||
            cur === TileType.Marble
          ) {
            tiles[tileIndex(vx, vy, width)] = tile;
          }
        }
      }
    }
  };

  const oreMult = isHighlands ? 1.4 : 1;
  placeOreVeins(TileType.CoalOre, Math.round(920 * oreMult), 4, height - 8, 8);
  placeOreVeins(TileType.CopperOre, Math.round(820 * oreMult), 4, height - 20, 7);
  placeOreVeins(TileType.IronOre, Math.round(740 * oreMult), 10, height - 6, 7);
  placeOreVeins(TileType.GoldOre, Math.round(540 * oreMult), 28, height - 4, 6);
  placeOreVeins(TileType.RubyOre, Math.round(390 * oreMult), 48, height - 4, 5);
  placeOreVeins(TileType.Marble, isHighlands ? 420 : 250, 34, height - 30, 10);
  placeOreVeins(TileType.CrystalBlock, isHighlands ? 950 : 210, 42, height - 14, isHighlands ? 10 : 7);
  placeOreVeins(TileType.Obsidian, 310, 110, height - 3, 8);

  // Underworld Hellstone Ore veins (y >= underworldStart)
  for (let i = 0; i < 240; i++) {
    const ox = 8 + Math.floor(rand() * (width - 16));
    const oy = underworldStart + 3 + Math.floor(rand() * Math.max(4, height - underworldStart - 6));
    for (let j = 0; j < 6; j++) {
      const vx = ox + Math.floor((rand() - 0.5) * 4);
      const vy = oy + Math.floor((rand() - 0.5) * 4);
      if (vx > 2 && vx < width - 3 && vy >= underworldStart && vy < height - 2) {
        tiles[tileIndex(vx, vy, width)] = TileType.HellstoneOre;
      }
    }
  }

  // 5. Biome Trees & Desert Cacti
  let lastTreeX = -10;
  for (let x = 8; x < width - 8; x++) {
    if (Math.abs(x - spawnX) <= 10) continue;
    if (Math.abs(x - pyramidX) <= 29) continue;
    if (Math.abs(x - 1615) <= 22 || Math.abs(x - 1835) <= 22) continue;
    if (Math.abs(x - 1040) <= 10 || Math.abs(x - 320) <= 10) continue;
    if (x - lastTreeX < 5) continue;

    const sy = surfaceHeights[x];
    const ground = tiles[tileIndex(x, sy, width)];
    const biome = getBiomeAtX(x, width);

    if (biome === 'desert' && ground === TileType.Sand) {
      if (rand() < 0.24) {
        const ch = 2 + Math.floor(rand() * 3);
        for (let h = 1; h <= ch; h++) {
          if (sy - h > 2) tiles[tileIndex(x, sy - h, width)] = TileType.Cactus;
        }
        lastTreeX = x;
      }
      continue;
    }

    if (rand() < 0.3) {
      if (
        ground === TileType.Grass ||
        ground === TileType.Snow ||
        ground === TileType.CrimsonGrass ||
        ground === TileType.CrystalBlock
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

  // 6. Welcome camp at center spawn (1200) + Campfire & Sunflowers
  const sySpawn = surfaceHeights[spawnX];
  tiles[tileIndex(spawnX - 3, sySpawn - 1, width)] = TileType.Torch;
  tiles[tileIndex(spawnX + 3, sySpawn - 1, width)] = TileType.Torch;
  tiles[tileIndex(spawnX + 2, sySpawn - 1, width)] = TileType.Stool;
  tiles[tileIndex(spawnX - 5, sySpawn - 1, width)] = TileType.Campfire;
  if (tiles[tileIndex(spawnX + 7, surfaceHeights[spawnX + 7], width)] === TileType.Grass) {
    tiles[tileIndex(spawnX + 7, surfaceHeights[spawnX + 7] - 1, width)] = TileType.Sunflower;
  }
  if (tiles[tileIndex(spawnX - 9, surfaceHeights[spawnX - 9], width)] === TileType.Grass) {
    tiles[tileIndex(spawnX - 9, surfaceHeights[spawnX - 9] - 1, width)] = TileType.Sunflower;
  }

  // 7. Treasure Chest Helper
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

  // === 7.2 TERRARIA CRIMSON MONSTER-MOUTH CAVE ENTRANCES (x = 1615 & x = 1835) ===
  const carveCrimsonMouthCave = (mouthX: number, slotSeed: number) => {
    const sy = surfaceHeights[mouthX];
    // Clear sky overhang & level left approach shelf so no floating grass appears near the maw
    for (let dx = -17; dx <= 16; dx++) {
      const wx = mouthX + dx;
      if (wx <= 2 || wx >= width - 3) continue;
      if (dx <= -12) {
        // Flat Crimson approach path right into the open mouth
        for (let wy = Math.max(4, sy - 24); wy <= sy - 1; wy++) {
          tiles[tileIndex(wx, wy, width)] = TileType.Air;
          walls[tileIndex(wx, wy, width)] = WallType.None;
        }
        tiles[tileIndex(wx, sy, width)] = TileType.CrimsonGrass;
        for (let wy = sy + 1; wy <= sy + 6; wy++) {
          if (tiles[tileIndex(wx, wy, width)] === TileType.Air) {
            tiles[tileIndex(wx, wy, width)] = TileType.Crimstone;
          }
        }
      } else if (dx >= 13) {
        // Taper back down cleanly to natural Crimson terrain on the right
        const stepY = sy + Math.round((dx - 13) * 0.5);
        const clearTo = Math.min(surfaceHeights[wx], stepY);
        for (let wy = Math.max(4, sy - 24); wy < clearTo; wy++) {
          tiles[tileIndex(wx, wy, width)] = TileType.Air;
          walls[tileIndex(wx, wy, width)] = WallType.None;
        }
        if (tiles[tileIndex(wx, clearTo, width)] === TileType.Air) {
          tiles[tileIndex(wx, clearTo, width)] = TileType.CrimsonGrass;
        }
      }
    }

    // Upper & lower organic Crimstone monster jaws framing a gaping left-facing mouth
    for (let dx = -11; dx <= 12; dx++) {
      const wx = mouthX + dx;
      const jawArch = Math.round(Math.sqrt(Math.max(0, 144 - dx * dx)) * 0.65) + 2;
      // Clear everything strictly above the skull dome
      for (let wy = Math.max(4, sy - 24); wy < sy - jawArch - 3; wy++) {
        tiles[tileIndex(wx, wy, width)] = TileType.Air;
        walls[tileIndex(wx, wy, width)] = WallType.None;
      }
      // Upper jaw / monster cranium arch (open on left edge dx=-11..-9!)
      for (let dy = -jawArch - 3; dy <= -jawArch + 1; dy++) {
        const wy = sy + dy;
        if (wy > 3 && wy < height - 4) {
          const isOuter = dy === -jawArch - 3;
          tiles[tileIndex(wx, wy, width)] = isOuter ? TileType.CrimsonGrass : TileType.Crimstone;
          walls[tileIndex(wx, wy, width)] = WallType.CrimsonWall;
        }
      }
      // Clear hollow gaping mouth interior & paint CrimsonWall throat
      const mouthFloorDy = dx <= -7 ? 0 : 4;
      for (let dy = -jawArch + 2; dy <= mouthFloorDy; dy++) {
        const wy = sy + dy;
        if (wy > 3 && wy < height - 4) {
          tiles[tileIndex(wx, wy, width)] = TileType.Air;
          walls[tileIndex(wx, wy, width)] = dx <= -9 && dy < -3 ? WallType.None : WallType.CrimsonWall;
        }
      }
      // Back wall of jaw curving down behind the maw (dx = 10..12)
      if (dx >= 10) {
        for (let dy = -jawArch + 2; dy <= 5; dy++) {
          const wy = sy + dy;
          tiles[tileIndex(wx, wy, width)] = dy === -jawArch + 2 && dx === 12 ? TileType.CrimsonGrass : TileType.Crimstone;
          walls[tileIndex(wx, wy, width)] = WallType.CrimsonWall;
        }
      }
      // Lower jaw gums & fleshy ridge
      for (let dy = mouthFloorDy + 1; dy <= 8; dy++) {
        const wy = sy + dy;
        if (wy > 3 && wy < height - 4) {
          tiles[tileIndex(wx, wy, width)] =
            dx <= -8 && dy === mouthFloorDy + 1 ? TileType.CrimsonGrass : TileType.Crimstone;
          walls[tileIndex(wx, wy, width)] = WallType.CrimsonWall;
        }
      }
    }

    // Sharp ivory CrimsonTooth fangs pointing into the gaping maw!
    const upperFangs = [-9, -5, -1, 3, 7];
    for (const fdx of upperFangs) {
      const fx = mouthX + fdx;
      const archY = sy - Math.round(Math.sqrt(Math.max(0, 144 - fdx * fdx)) * 0.65);
      const toothLen = Math.abs(fdx) <= 3 ? 3 : 2;
      for (let t = 0; t < toothLen; t++) {
        tiles[tileIndex(fx, archY + t, width)] = TileType.CrimsonTooth;
      }
    }
    const lowerFangs = [-6, -2, 2, 6];
    for (const fdx of lowerFangs) {
      const fx = mouthX + fdx;
      const toothLen = Math.abs(fdx) <= 2 ? 2 : 1;
      for (let t = 0; t < toothLen; t++) {
        tiles[tileIndex(fx, sy + 4 - t, width)] = TileType.CrimsonTooth;
      }
    }

    // Subtle crimson throat glow torch inside back of jaw
    tiles[tileIndex(mouthX + 8, sy + 1, width)] = TileType.Torch;

    // Open throat entrance through lower jaw + diagonal gullet tunnel down to Altar Heart Chamber
    const chamberX = mouthX + (slotSeed % 2 === 0 ? 5 : -3);
    const chamberY = Math.min(height - 30, sy + 42);
    const steps = 46;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = Math.round((mouthX + 3) + Math.sin(t * Math.PI) * 4 + (chamberX - (mouthX + 3)) * t);
      const cy = Math.round(sy + 4 + (chamberY - sy - 4) * t);
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx * dx + dy * dy <= 10) {
            const tx = cx + dx;
            const ty = cy + dy;
            if (tx > 2 && tx < width - 3 && ty > 3 && ty < height - 4) {
              tiles[tileIndex(tx, ty, width)] = TileType.Air;
              walls[tileIndex(tx, ty, width)] = WallType.CrimsonWall;
            }
          }
        }
      }
      if (s % 5 === 0) {
        tiles[tileIndex(cx - 1, cy + 2, width)] = TileType.Platform;
        tiles[tileIndex(cx, cy + 2, width)] = TileType.Platform;
        tiles[tileIndex(cx + 1, cy + 2, width)] = TileType.Platform;
      }
    }

    // Crimson Heart / Altar Cavern at bottom of throat
    for (let dx = -12; dx <= 12; dx++) {
      for (let dy = -6; dy <= 4; dy++) {
        if ((dx * dx) / 144 + (dy * dy) / 36 <= 1.05) {
          const tx = chamberX + dx;
          const ty = chamberY + dy;
          if (tx > 2 && tx < width - 3 && ty > 3 && ty < height - 4) {
            tiles[tileIndex(tx, ty, width)] = dy >= 3 ? TileType.CrimsonBrick : TileType.Air;
            walls[tileIndex(tx, ty, width)] = WallType.CrimsonWall;
          }
        }
      }
    }
    tiles[tileIndex(chamberX - 4, chamberY + 2, width)] = TileType.CrimsonAltar;
    tiles[tileIndex(chamberX + 4, chamberY + 2, width)] = TileType.CrimsonAltar;
    tiles[tileIndex(chamberX - 7, chamberY + 2, width)] = TileType.LifeCrystal;
    tiles[tileIndex(chamberX + 7, chamberY + 2, width)] = TileType.Pot;
    tiles[tileIndex(chamberX - 6, chamberY + 1, width)] = TileType.Torch;
    tiles[tileIndex(chamberX + 6, chamberY + 1, width)] = TileType.Torch;
    placeChest(chamberX, chamberY + 2, [
      { itemId: 'vampire_knives', count: 1 },
      { itemId: 'red_potion', count: 3 },
      { itemId: 'milk_potion', count: 3 },
      { itemId: 'summon_brain_cthulhu', count: 2 },
      { itemId: 'crimson_brick', count: 32 },
    ]);
  };

  carveCrimsonMouthCave(1615, 0);
  carveCrimsonMouthCave(1835, 1);

  // Natural Surface Cave Mouths in Forest (x = 1040) & Snow (x = 320)
  for (const caveX of [1040, 320]) {
    const sy = surfaceHeights[caveX];
    for (let s = 0; s < 32; s++) {
      const cx = caveX + Math.round(Math.sin(s * 0.22) * 3);
      const cy = sy + s;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx * dx + dy * dy <= 9) {
            const tx = cx + dx;
            const ty = cy + dy;
            if (tx > 2 && tx < width - 3 && ty > 3 && ty < height - 4) {
              tiles[tileIndex(tx, ty, width)] = TileType.Air;
              walls[tileIndex(tx, ty, width)] = caveX < 450 ? WallType.SnowWall : WallType.StoneWall;
            }
          }
        }
      }
      if (s % 5 === 3) {
        tiles[tileIndex(cx, cy + 1, width)] = TileType.Platform;
        tiles[tileIndex(cx + 1, cy + 1, width)] = TileType.Platform;
      }
    }
    tiles[tileIndex(caveX - 3, sy - 1, width)] = TileType.Campfire;
  }

  // === 7.5 DESERT SANDSTONE PYRAMID (centered at pyramidX = 660) ===
  const pyrBaseY = surfaceHeights[pyramidX];
  const pyrHalf = 22;
  // Build stepped pyramid exterior & sandstone interior
  for (let layer = 0; layer < pyrHalf; layer++) {
    const y = pyrBaseY - 1 - layer;
    const span = pyrHalf - layer;
    for (let dx = -span; dx <= span; dx++) {
      const tx = pyramidX + dx;
      const idx = tileIndex(tx, y, width);
      const isEdge = Math.abs(dx) >= span - 1 || layer === pyrHalf - 1;
      walls[idx] = WallType.SandstoneWall;
      tiles[idx] = isEdge ? TileType.SandstoneBrick : TileType.Air;
    }
  }
  // Open left & right entrance doorways at ground level
  for (const side of [-1, 1]) {
    const doorX = pyramidX + side * pyrHalf;
    tiles[tileIndex(doorX, pyrBaseY - 1, width)] = TileType.DoorClosed;
    tiles[tileIndex(doorX, pyrBaseY - 2, width)] = TileType.DoorClosed;
    tiles[tileIndex(doorX - side, pyrBaseY - 1, width)] = TileType.Air;
    tiles[tileIndex(doorX - side, pyrBaseY - 2, width)] = TileType.Air;
    tiles[tileIndex(doorX - side * 2, pyrBaseY - 3, width)] = TileType.Torch;
    tiles[tileIndex(doorX + side, pyrBaseY, width)] = TileType.SandstoneBrick;
    tiles[tileIndex(doorX, pyrBaseY, width)] = TileType.SandstoneBrick;
  }
  // Interior Burial Chamber right under pyramid floor + Platforms for exploring!
  const chamberFloorY = pyrBaseY + 12;
  for (let x = pyramidX - 15; x <= pyramidX + 15; x++) {
    for (let y = pyrBaseY; y <= chamberFloorY + 2; y++) {
      const idx = tileIndex(x, y, width);
      walls[idx] = WallType.SandstoneWall;
      if (
        y === chamberFloorY ||
        y === chamberFloorY + 1 ||
        y === chamberFloorY + 2 ||
        Math.abs(x - pyramidX) >= 14
      ) {
        tiles[idx] = TileType.SandstoneBrick;
      } else {
        tiles[idx] = TileType.Air;
      }
    }
  }
  // Entrance shaft down into the Pharaoh Chamber with Rope & Platforms
  for (let y = pyrBaseY - 1; y < chamberFloorY; y++) {
    for (let dx = -2; dx <= 2; dx++) {
      tiles[tileIndex(pyramidX + dx, y, width)] = TileType.Air;
      walls[tileIndex(pyramidX + dx, y, width)] = WallType.SandstoneWall;
    }
    tiles[tileIndex(pyramidX, y, width)] = TileType.Rope;
    if (y % 4 === 0) {
      tiles[tileIndex(pyramidX - 1, y, width)] = TileType.Platform;
      tiles[tileIndex(pyramidX + 1, y, width)] = TileType.Platform;
    }
  }
  // Decorate Pharaoh Chamber (Chandeliers, Torches, Tables, Pots, Pharaoh Chest!)
  tiles[tileIndex(pyramidX - 8, pyrBaseY - 1, width)] = TileType.Torch;
  tiles[tileIndex(pyramidX + 8, pyrBaseY - 1, width)] = TileType.Torch;
  tiles[tileIndex(pyramidX, pyrBaseY - 10, width)] = TileType.Chandelier;
  tiles[tileIndex(pyramidX - 6, chamberFloorY - 5, width)] = TileType.Chandelier;
  tiles[tileIndex(pyramidX + 6, chamberFloorY - 5, width)] = TileType.Chandelier;
  tiles[tileIndex(pyramidX - 10, chamberFloorY - 1, width)] = TileType.Pot;
  tiles[tileIndex(pyramidX + 10, chamberFloorY - 1, width)] = TileType.Pot;
  tiles[tileIndex(pyramidX - 5, chamberFloorY - 1, width)] = TileType.Pot;
  tiles[tileIndex(pyramidX + 5, chamberFloorY - 1, width)] = TileType.Pot;
  placeChest(pyramidX, chamberFloorY - 1, [
    { itemId: 'summon_pharaoh_cat', count: 3 },
    { itemId: 'pharaoh_staff', count: 1 },
    { itemId: 'gold_bar', count: 10 },
    { itemId: 'healing_potion', count: 4 },
    { itemId: 'sandstone_brick', count: 40 },
    { itemId: 'summon_alien_invasion', count: 1 },
  ]);

  // 8. Floating Sky Islands across 2400-wide sky
  const skyIslandCols = isHighlands
    ? [180, 380, 560, 780, 990, 1200, 1420, 1640, 1860, 2060, 2240]
    : [220, 560, 950, 1450, 1840, 2180];

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
      { itemId: 'summon_sun_cat', count: 1 },
    ],
  ];

  skyIslandCols.forEach((ix, idx) => {
    const iy = 24 + (idx % 3) * 6;
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

  // Surface Chests near Spawn (Kotulhu & Cat Worm basics!)
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
    { itemId: 'red_potion', count: 2 },
    { itemId: 'milk_potion', count: 2 },
    { itemId: 'ironskin_potion', count: 2 },
    { itemId: 'yarn_bomb', count: 8 },
    { itemId: 'iron_bar', count: 6 },
  ]);

  // Snow biome surface chest (~x=220)
  const snowChestX = 220;
  placeChest(snowChestX, surfaceHeights[snowChestX] - 1, [
    { itemId: 'ice_blade', count: 1 },
    { itemId: 'ice_pickaxe', count: 1 },
    { itemId: 'cloud_in_bottle', count: 1 },
    { itemId: 'summon_deerclops', count: 1 },
    { itemId: 'snow_brick', count: 24 },
  ]);

  // Desert outpost chest (~x=510)
  const desertChestX = 510;
  placeChest(desertChestX, surfaceHeights[desertChestX] - 1, [
    { itemId: 'summon_pharaoh_cat', count: 2 },
    { itemId: 'sandstone_brick', count: 32 },
    { itemId: 'healing_potion', count: 3 },
    { itemId: 'summon_melon_bandit', count: 1 },
  ]);

  // Crimson biome surface chest (~x=1750)
  const crimsonChestX = 1750;
  placeChest(crimsonChestX, surfaceHeights[crimsonChestX] - 1, [
    { itemId: 'crimson_bow', count: 1 },
    { itemId: 'hermes_boots', count: 1 },
    { itemId: 'summon_brain_cthulhu', count: 1 },
    { itemId: 'summon_jester_cat', count: 1 },
    { itemId: 'crimson_brick', count: 24 },
  ]);

  // Crystal Hollow chest (~x=2100)
  const crystalChestX = 2100;
  placeChest(crystalChestX, surfaceHeights[crystalChestX] - 1, [
    { itemId: 'crystal_bow', count: 1 },
    { itemId: 'summon_queen_slime', count: 1 },
    { itemId: 'summon_party_cat', count: 1 },
    { itemId: 'crystal_block', count: 24 },
  ]);

  // Ocean Coast chest (~x=2320)
  const oceanChestX = 2320;
  placeChest(oceanChestX, surfaceHeights[oceanChestX] - 1, [
    { itemId: 'fish_spear', count: 1 },
    { itemId: 'summon_duke_fishron', count: 1 },
    { itemId: 'summon_atomic_cat', count: 1 },
    { itemId: 'crispy_fish', count: 6 },
    { itemId: 'angel_wings', count: 1 },
  ]);

  // Underground cave & underworld chests scaled across 2400-wide map
  const caveLootTables: InventorySlot[][] = [
    [
      { itemId: 'summon_king_slime', count: 1 },
      { itemId: 'summon_kotulhu', count: 1 },
      { itemId: 'enchanted_sword', count: 1 },
      { itemId: 'magic_mirror', count: 1 },
      { itemId: 'iron_chestplate', count: 1 },
      { itemId: 'red_potion', count: 1 },
      { itemId: 'copper_bar', count: 10 },
    ],
    [
      { itemId: 'summon_cat_worm', count: 1 },
      { itemId: 'summon_queen_bee', count: 1 },
      { itemId: 'ice_bow', count: 1 },
      { itemId: 'cloud_in_bottle', count: 1 },
      { itemId: 'milk_potion', count: 2 },
      { itemId: 'gold_bar', count: 6 },
    ],
    [
      { itemId: 'summon_eye_boss', count: 1 },
      { itemId: 'cobalt_shield', count: 1 },
      { itemId: 'grappling_hook', count: 1 },
      { itemId: 'ironskin_potion', count: 2 },
      { itemId: 'regen_potion', count: 2 },
      { itemId: 'ruby_gem', count: 2 },
    ],
    [
      { itemId: 'summon_skele_cat', count: 1 },
      { itemId: 'water_bolt', count: 1 },
      { itemId: 'gold_helmet', count: 1 },
      { itemId: 'swiftness_potion', count: 2 },
      { itemId: 'recall_potion', count: 2 },
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
      { itemId: 'heart_lantern_item', count: 1 },
      { itemId: 'mana_flower', count: 1 },
    ],
  ];

  const chestFractions = [
    0.05, 0.11, 0.17, 0.24, 0.33, 0.4, 0.46, 0.54, 0.6, 0.68, 0.75, 0.82, 0.88, 0.94,
  ];
  chestFractions.forEach((frac, i) => {
    const cx = Math.floor(width * frac);
    const sy = surfaceHeights[cx];
    const targetDepth = sy + 28 + (i % 5) * 42;
    const cy = Math.min(height - 14, targetDepth);
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

  // Underworld Sanctuary Chest at center deep (x=1200, y=337)
  const uwX = spawnX;
  const uwY = underworldStart + 5;
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
    { itemId: 'summon_cultist', count: 1 },
  ]);

  // 9. Scatter Breakable Pots & Life Crystals across 2400x380 caves
  let potsPlaced = 0;
  for (let attempt = 0; attempt < 4200 && potsPlaced < 420; attempt++) {
    const px = 8 + Math.floor(rand() * (width - 16));
    const py = surfaceHeights[px] + 8 + Math.floor(rand() * (height - surfaceHeights[px] - 12));
    const idx = tileIndex(px, py, width);
    const below = tiles[tileIndex(px, py + 1, width)] as TileType;
    if (tiles[idx] === TileType.Air && isTileSolid(below)) {
      tiles[idx] = TileType.Pot;
      potsPlaced++;
    }
  }

  const targetCrystals = isHighlands ? 140 : 110;
  let crystalsPlaced = 0;
  for (let attempt = 0; attempt < 4600 && crystalsPlaced < targetCrystals; attempt++) {
    const cx = 8 + Math.floor(rand() * (width - 16));
    const minCy = Math.min(height - 12, surfaceHeights[cx] + 30);
    const cy = minCy + Math.floor(rand() * Math.max(1, height - 8 - minCy));
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

// Reusable scratch buffer so lighting recomputation allocates zero heap memory during gameplay
let lightQueueScratch: Int32Array | null = null;

/**
 * Region-bounded BFS lighting (0.06..1.0) so even 2400x380 worlds update in <2ms around the camera.
 */
export function recomputeLightingRegion(
  world: WorldData,
  timeOfDay: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): void {
  const { width, height, tiles, walls, light } = world;
  const x0 = Math.max(0, minX);
  const x1 = Math.min(width - 1, maxX);
  const y0 = Math.max(0, minY);
  const y1 = Math.min(height - 1, maxY);

  const sunAngle = timeOfDay * Math.PI * 2;
  const dayFactor = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.sin(sunAngle)));
  const skyLight = 0.24 + dayFactor * 0.76;

  const regionCells = (x1 - x0 + 1) * (y1 - y0 + 1);
  if (!lightQueueScratch || lightQueueScratch.length < regionCells * 2) {
    lightQueueScratch = new Int32Array(Math.max(regionCells * 2, 65536));
  }
  const queue = lightQueueScratch;
  let tail = 0;

  const enqueue = (idx: number) => {
    if (tail < queue.length) {
      queue[tail++] = idx;
    }
  };

  for (let x = x0; x <= x1; x++) {
    // Check whether sky is already blocked above y0
    let blocked = false;
    for (let y = 0; y < y0; y++) {
      const t = tiles[y * width + x] as TileType;
      if (isTileSolid(t) && t !== TileType.Glass) {
        blocked = true;
        break;
      }
    }

    for (let y = y0; y <= y1; y++) {
      const idx = y * width + x;
      light[idx] = 0.06;
      const tile = tiles[idx] as TileType;
      const wall = walls[idx] as WallType;

      if (
        tile === TileType.Torch ||
        tile === TileType.Chandelier ||
        tile === TileType.Furnace ||
        tile === TileType.RubyOre ||
        tile === TileType.CrystalBlock ||
        tile === TileType.LifeCrystal ||
        tile === TileType.Campfire ||
        tile === TileType.HeartLantern ||
        tile === TileType.CrimsonAltar ||
        tile === TileType.HellstoneOre
      ) {
        const emit =
          tile === TileType.Torch ||
          tile === TileType.Chandelier ||
          tile === TileType.Campfire
            ? 1.0
            : tile === TileType.Furnace || tile === TileType.HeartLantern
              ? 0.88
              : tile === TileType.CrystalBlock ||
                  tile === TileType.LifeCrystal ||
                  tile === TileType.CrimsonAltar
                ? 0.74
                : 0.55;
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
          const hasRightEdge =
            x + 1 <= x1 &&
            (walls[idx + 1] !== WallType.None || isTileSolid(tiles[idx + 1] as TileType));
          const hasLeftEdge =
            x - 1 >= x0 &&
            (walls[idx - 1] !== WallType.None || isTileSolid(tiles[idx - 1] as TileType));
          const hasBottomEdge =
            y + 1 <= y1 &&
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

    if (cx + 1 <= x1) {
      const nIdx = idx + 1;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
      }
    }
    if (cx - 1 >= x0) {
      const nIdx = idx - 1;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
      }
    }
    if (cy + 1 <= y1) {
      const nIdx = idx + width;
      const nTile = tiles[nIdx] as TileType;
      const nextLight = curLight - (isTileSolid(nTile) && nTile !== TileType.Glass ? 0.14 : 0.09);
      if (nextLight > light[nIdx] + 0.025) {
        light[nIdx] = nextLight;
        enqueue(nIdx);
      }
    }
    if (cy - 1 >= y0) {
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

export function recomputeLightingLocal(
  world: WorldData,
  timeOfDay: number,
  centerTx: number,
  centerTy: number,
  halfW = 105,
  halfH = 72,
): void {
  recomputeLightingRegion(
    world,
    timeOfDay,
    centerTx - halfW,
    centerTx + halfW,
    centerTy - halfH,
    centerTy + halfH,
  );
}

export function recomputeLighting(world: WorldData, timeOfDay: number): void {
  recomputeLightingRegion(world, timeOfDay, 0, world.width - 1, 0, world.height - 1);
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
  lang: Language = 'en',
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
    return {
      report: emptyReport([lang === 'ru' ? 'Вне границ мира' : 'Outside world bounds']),
      visitedKeys: [],
      floorY: startY,
    };
  }

  const startTile = getTile(world, startX, startY);
  if (isTileSolid(startTile) || startTile === TileType.DoorClosed) {
    return {
      report: emptyReport([lang === 'ru' ? 'Внутри блока' : 'Inside a solid block']),
      visitedKeys: [],
      floorY: startY,
    };
  }

  if (getWall(world, startX, startY) === WallType.None && startTile !== TileType.DoorOpen) {
    return {
      report: emptyReport([
        lang === 'ru'
          ? 'Поставь задние стены (дерево/кирпич), чтобы закрыть комнату'
          : 'Place background walls (wood/brick/sandstone) to enclose the room',
      ]),
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
      tile === TileType.CrystalBlock ||
      tile === TileType.Campfire ||
      tile === TileType.HeartLantern
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
  if (hasWallGap) {
    reasons.push(lang === 'ru' ? 'Закройте задние стены и периметр' : 'Close all walls & background gaps');
  } else if (tooLarge) {
    reasons.push(lang === 'ru' ? 'Комната не замкнута или слишком огромная' : 'Room is unenclosed or too large');
  } else if (interiorCount < 6) {
    reasons.push(lang === 'ru' ? 'Сделайте комнату просторнее (от 6 клеток)' : 'Make room larger (at least 6 tiles)');
  }
  if (!hasLight) reasons.push(lang === 'ru' ? 'Поставьте факел или люстру' : 'Add a Torch or Chandelier');
  if (!hasDoor) reasons.push(lang === 'ru' ? 'Добавьте дверь или платформу' : 'Add a Door or Platform');
  if (!hasTable) reasons.push(lang === 'ru' ? 'Поставьте стол или верстак' : 'Place a Table or Workbench');
  if (!hasSeat) reasons.push(lang === 'ru' ? 'Поставьте стул, табуретку или кровать' : 'Place a Chair, Stool, or Bed');

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
  lang: Language = 'en',
): { built: boolean; reason?: string; centerTileX: number; centerTileY: number } {
  const left = anchorX - 4;
  const right = anchorX + 4;
  const top = floorY - 5;

  if (left < 2 || right >= world.width - 2 || top < 2 || floorY >= world.height - 2) {
    return {
      built: false,
      reason: lang === 'ru' ? 'Слишком близко к краю мира' : 'Too close to the world border',
      centerTileX: anchorX,
      centerTileY: floorY - 2,
    };
  }

  for (let x = left; x <= right; x++) {
    for (let y = top - 1; y <= floorY; y++) {
      const t = getTile(world, x, y);
      if (t === TileType.Chest || t === TileType.Stool || t === TileType.LifeCrystal) {
        return {
          built: false,
          reason:
            lang === 'ru'
              ? 'Освободи место (рядом сундук, табуретка или кристалл)'
              : 'Clear space first (Chest, Stool, or Life Crystal nearby)',
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

