import {
  EquipmentState,
  InventorySlot,
  NpcEntity,
  PlayerState,
  RunStats,
  SaveSlotMeta,
  WorldData,
  WorldVariant,
} from './types';

export interface SerializedWorldSave {
  version: 1;
  meta: SaveSlotMeta;
  world: {
    width: number;
    height: number;
    variant: WorldVariant;
    tilesRle: number[]; // [count, value, count, value, ...]
    wallsRle: number[];
    surfaceHeights: number[];
    chests: Record<number, InventorySlot[]>;
  };
  player: PlayerState;
  hotbar: (InventorySlot | null)[];
  backpack: (InventorySlot | null)[];
  equipment: EquipmentState;
  selectedSlot: number;
  activeToolMode: 'auto' | 'build';
  dayCount: number;
  timeOfDay: number;
  bossSpawnedDay: number;
  lastWasNight: boolean;
  lunarEvent: { active: boolean; moonLordSpawned: boolean };
  alienInvasion: { active: boolean; defeated: number; target: number; saucerSpawned: boolean };
  godMode: boolean;
  stoolPetted: boolean;
  stats: RunStats;
  npcs: NpcEntity[];
}

export function encodeRleUint8(arr: Uint8Array): number[] {
  if (arr.length === 0) return [];
  const out: number[] = [];
  let cur = arr[0];
  let count = 1;
  for (let i = 1; i < arr.length; i++) {
    const val = arr[i];
    if (val === cur) {
      count++;
    } else {
      out.push(count, cur);
      cur = val;
      count = 1;
    }
  }
  out.push(count, cur);
  return out;
}

export function decodeRleUint8(rle: number[], expectedLength: number): Uint8Array {
  const out = new Uint8Array(expectedLength);
  let pos = 0;
  for (let i = 0; i + 1 < rle.length && pos < expectedLength; i += 2) {
    const count = rle[i];
    const val = rle[i + 1];
    const end = Math.min(expectedLength, pos + count);
    out.fill(val, pos, end);
    pos = end;
  }
  return out;
}

export function serializeWorldSnapshot(params: {
  id: string;
  name: string;
  biome: SaveSlotMeta['biome'];
  world: WorldData;
  player: PlayerState;
  hotbar: (InventorySlot | null)[];
  backpack: (InventorySlot | null)[];
  equipment: EquipmentState;
  selectedSlot: number;
  activeToolMode: 'auto' | 'build';
  dayCount: number;
  timeOfDay: number;
  bossSpawnedDay: number;
  lastWasNight: boolean;
  lunarEvent: { active: boolean; moonLordSpawned: boolean };
  alienInvasion: { active: boolean; defeated: number; target: number; saucerSpawned: boolean };
  godMode: boolean;
  stoolPetted: boolean;
  stats: RunStats;
  npcs: NpcEntity[];
}): SerializedWorldSave {
  const tileX = Math.max(
    0,
    Math.min(
      params.world.width - 1,
      Math.floor((params.player.x + params.player.width / 2) / 32),
    ),
  );
  const tileY = Math.max(
    0,
    Math.min(
      params.world.height - 1,
      Math.floor((params.player.y + params.player.height / 2) / 32),
    ),
  );

  const chestsCopy: Record<number, InventorySlot[]> = {};
  for (const [k, items] of Object.entries(params.world.chests)) {
    chestsCopy[Number(k)] = items.map((s) => ({ ...s }));
  }

  return {
    version: 1,
    meta: {
      id: params.id,
      name: params.name,
      variant: params.world.variant,
      dayCount: params.dayCount,
      hp: Math.round(params.player.hp),
      maxHp: params.player.maxHp,
      coins: params.player.coins,
      biome: params.biome,
      playerTileX: tileX,
      playerTileY: tileY,
      savedAt: Date.now(),
    },
    world: {
      width: params.world.width,
      height: params.world.height,
      variant: params.world.variant,
      tilesRle: encodeRleUint8(params.world.tiles),
      wallsRle: encodeRleUint8(params.world.walls),
      surfaceHeights: Array.from(params.world.surfaceHeights),
      chests: chestsCopy,
    },
    player: {
      ...params.player,
      grapple: { ...params.player.grapple },
      effects: (params.player.effects ?? []).map((e) => ({ ...e })),
    },
    hotbar: params.hotbar.map((s) => (s ? { ...s } : null)),
    backpack: params.backpack.map((s) => (s ? { ...s } : null)),
    equipment: {
      helmet: params.equipment.helmet ? { ...params.equipment.helmet } : null,
      chestplate: params.equipment.chestplate ? { ...params.equipment.chestplate } : null,
      greaves: params.equipment.greaves ? { ...params.equipment.greaves } : null,
      accessories: params.equipment.accessories.map((a) => (a ? { ...a } : null)),
    },
    selectedSlot: params.selectedSlot,
    activeToolMode: params.activeToolMode,
    dayCount: params.dayCount,
    timeOfDay: params.timeOfDay,
    bossSpawnedDay: params.bossSpawnedDay,
    lastWasNight: params.lastWasNight,
    lunarEvent: { ...params.lunarEvent },
    alienInvasion: { ...params.alienInvasion },
    godMode: params.godMode,
    stoolPetted: params.stoolPetted,
    stats: { ...params.stats },
    npcs: params.npcs.map((n) => ({
      ...n,
      appearance: { ...n.appearance },
    })),
  };
}

export function deserializeWorldData(save: SerializedWorldSave): WorldData {
  const total = save.world.width * save.world.height;
  const chestsCopy: Record<number, InventorySlot[]> = {};
  for (const [k, items] of Object.entries(save.world.chests)) {
    chestsCopy[Number(k)] = items.map((s) => ({ ...s }));
  }
  return {
    width: save.world.width,
    height: save.world.height,
    variant: save.world.variant,
    tiles: decodeRleUint8(save.world.tilesRle, total),
    walls: decodeRleUint8(save.world.wallsRle, total),
    surfaceHeights: Int16Array.from(save.world.surfaceHeights),
    light: new Float32Array(total),
    chests: chestsCopy,
  };
}

const INDEX_KEY = 'kotarria_saves_index_v1';
const SLOT_PREFIX = 'kotarria_save_v1_';
const MAX_SAVE_SLOTS = 6;

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function listSavedWorlds(): SaveSlotMeta[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as SaveSlotMeta[]).sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function saveWorldToStorage(save: SerializedWorldSave): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const existing = listSavedWorlds().filter((m) => m.id !== save.meta.id);
    const updatedIndex = [save.meta, ...existing]
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, MAX_SAVE_SLOTS);
    const keptIds = new Set(updatedIndex.map((m) => m.id));
    for (const old of existing) {
      if (!keptIds.has(old.id)) {
        storage.removeItem(`${SLOT_PREFIX}${old.id}`);
      }
    }
    storage.setItem(`${SLOT_PREFIX}${save.meta.id}`, JSON.stringify(save));
    storage.setItem(INDEX_KEY, JSON.stringify(updatedIndex));
    return true;
  } catch {
    return false;
  }
}

export function loadWorldFromStorage(saveId: string): SerializedWorldSave | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${SLOT_PREFIX}${saveId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SerializedWorldSave;
    if (!parsed || parsed.version !== 1 || !parsed.world || !parsed.player) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function deleteSavedWorld(saveId: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(`${SLOT_PREFIX}${saveId}`);
    const next = listSavedWorlds().filter((m) => m.id !== saveId);
    storage.setItem(INDEX_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}
