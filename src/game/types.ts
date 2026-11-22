export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export const TILE_SIZE = 32;
export const WORLD_WIDTH = 360;
export const WORLD_HEIGHT = 110;

export type BiomeType = 'forest' | 'snow' | 'crimson';

export enum TileType {
  Air = 0,
  Dirt = 1,
  Grass = 2,
  Stone = 3,
  Wood = 4,
  Leaves = 5,
  Planks = 6,
  Brick = 7,
  CoalOre = 8,
  IronOre = 9,
  GoldOre = 10,
  RubyOre = 11,
  Glass = 12,
  Platform = 13,
  Torch = 14,
  Workbench = 15,
  Furnace = 16,
  Anvil = 17,
  DoorClosed = 18,
  DoorOpen = 19,
  Bed = 20,
  Chest = 21,
  RoofTile = 22,
  Stool = 23,
  Snow = 24,
  Ice = 25,
  SnowBrick = 26,
  CrimsonGrass = 27,
  CrimsonDirt = 28,
  Crimstone = 29,
  CrimsonBrick = 30,
  CrimsonWood = 31,
  CrimsonLeaves = 32,
  Sand = 33,
  SandstoneBrick = 34,
  Obsidian = 35,
  Marble = 36,
  CopperOre = 37,
  CrystalBlock = 38,
  WoodBeam = 39,
}

export enum WallType {
  None = 0,
  DirtWall = 1,
  WoodWall = 2,
  StoneWall = 3,
  BrickWall = 4,
  SnowWall = 5,
  CrimsonWall = 6,
  MarbleWall = 7,
}

export type ItemCategory = 'tool' | 'weapon' | 'block' | 'wall' | 'consumable' | 'material' | 'station' | 'summon';
export type WeaponKind = 'melee' | 'spear' | 'bow' | 'magic' | 'boomerang' | 'laser' | 'bomb';
export type CraftingStation = 'hand' | 'workbench' | 'furnace' | 'anvil';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  maxStack: number;
  description: string;
  // Tool properties
  pickPower?: number;
  axePower?: number;
  // Weapon properties
  weaponKind?: WeaponKind;
  damage?: number;
  knockback?: number;
  cooldown?: number; // seconds
  reach?: number; // pixels for melee/spear
  projectileSpeed?: number;
  manaCost?: number;
  pierce?: number;
  aoeRadius?: number;
  textureSrc?: string; // e.g. user-provided sword texture
  color: string;
  accent: string;
  // Placement properties
  placesTile?: TileType;
  placesWall?: WallType;
  // Consumable / Summon properties
  healAmount?: number;
  manaAmount?: number;
  defenseBonus?: number;
  summonsBoss?: EnemyKind;
}

export interface InventorySlot {
  itemId: string;
  count: number;
}

export interface CraftingRecipe {
  id: string;
  resultId: string;
  resultCount: number;
  station: CraftingStation;
  category: 'tools' | 'weapons' | 'building' | 'stations' | 'potions';
  ingredients: { itemId: string; count: number }[];
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  onGround: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  defense: number;
  invulnTimer: number;
  hitFlashTimer: number;
  walkDistance: number;
  squashX: number;
  squashY: number;
  attackTimer: number;
  attackDuration: number;
  attackAngle: number;
  activeWeaponId: string | null;
  spawnX: number;
  spawnY: number;
  houseValid: boolean;
}

export type EnemyKind =
  | 'slime'
  | 'bat'
  | 'goblin'
  | 'skeleton'
  | 'king_slime'
  | 'kotulhu'
  | 'cat_worm'
  | 'skele_cat'
  | 'eye_boss';

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  defense: number;
  facing: 1 | -1;
  onGround: boolean;
  aiState: 'idle' | 'patrol' | 'windup' | 'attack' | 'recover' | 'ko';
  stateTimer: number;
  hitFlashTimer: number;
  koTimer: number;
  animPhase: number;
  segments?: { x: number; y: number }[];
  summonTimer?: number;
  drops: { itemId: string; min: number; max: number; chance: number }[];
}

export interface ProjectileEntity {
  id: number;
  fromPlayer: boolean;
  kind: 'arrow' | 'fireball' | 'boomerang' | 'laser' | 'yarn_bomb' | 'frost_bolt' | 'slime_glob';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  knockback: number;
  life: number;
  maxLife: number;
  pierceLeft: number;
  aoeRadius: number;
  color: string;
  returning?: boolean;
  hitIds: number[];
}

export interface DropEntity {
  id: number;
  itemId: string;
  count: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  pickupDelay: number;
  noAutoMagnet?: boolean;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  gravity: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface WorldData {
  width: number;
  height: number;
  tiles: Uint8Array;
  walls: Uint8Array;
  surfaceHeights: Int16Array;
  /** Light level 0..1 per tile computed around sky & torches */
  light: Float32Array;
  /** Treasure chest inventories keyed by tile index */
  chests: Record<number, InventorySlot[]>;
}

export interface RunStats {
  daysSurvived: number;
  monstersKilled: number;
  blocksMined: number;
  blocksPlaced: number;
  itemsCrafted: number;
  bossDefeated: boolean;
}

export interface GameSettings {
  musicEnabled: boolean;
  musicVolume: number; // 0..1
  sfxEnabled: boolean;
  sfxVolume: number; // 0..1
  screenShake: boolean;
  particlesEnabled: boolean;
  autopauseInMenus: boolean;
}

export interface HudSnapshot {
  phase: GamePhase;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  defense: number;
  dayCount: number;
  timeOfDay: number; // 0..1 (0.25 = noon, 0.75 = midnight)
  isNight: boolean;
  depthMeters: number;
  playerTileX: number;
  playerTileY: number;
  biome: BiomeType;
  worldWidth: number;
  worldHeight: number;
  houseValid: boolean;
  nearbyStations: CraftingStation[];
  hotbar: (InventorySlot | null)[];
  backpack: (InventorySlot | null)[];
  selectedSlot: number;
  activeToolMode: 'auto' | 'build';
  stats: RunStats;
  bossInfo: { name: string; hp: number; maxHp: number } | null;
  toastMessage: string | null;
  godMode: boolean;
  nearbyStool: boolean;
  nearbyChest: { tx: number; ty: number; hasLoot: boolean } | null;
  activeChest: {
    tx: number;
    ty: number;
    items: (InventorySlot | null)[];
  } | null;
  stoolSpeech: {
    stage: 'petted' | 'copied';
    text: string;
    hint?: string;
    copiedUrl?: string;
  } | null;
}
