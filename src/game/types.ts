export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';
export type Language = 'en' | 'ru';

export const TILE_SIZE = 32;
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 380;

export type BiomeType = 'forest' | 'snow' | 'desert' | 'crimson' | 'crystal' | 'ocean';
export type WorldVariant = 'crimson_classic' | 'crystal_highlands';

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
  Table = 40,
  Chair = 41,
  Chandelier = 42,
  Bookshelf = 43,
  Pot = 44,
  Rope = 45,
  LifeCrystal = 46,
  PiggyBank = 47,
  Cactus = 48,
  Campfire = 49,
  HeartLantern = 50,
  HellstoneOre = 51,
  CrimsonAltar = 52,
  CrimsonTooth = 53,
  Sunflower = 54,
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
  SandstoneWall = 8,
}

export type ItemCategory =
  | 'tool'
  | 'weapon'
  | 'block'
  | 'wall'
  | 'consumable'
  | 'material'
  | 'station'
  | 'summon'
  | 'accessory'
  | 'armor';
export type ArmorSlotKind = 'helmet' | 'chestplate' | 'greaves';
export type ArmorSetId =
  | 'wood'
  | 'copper'
  | 'iron'
  | 'gold'
  | 'crimson'
  | 'obsidian'
  | 'crystal'
  | 'molten'
  | 'hallowed';
export type EquipSlotKey =
  | 'helmet'
  | 'chestplate'
  | 'greaves'
  | 'acc0'
  | 'acc1'
  | 'acc2'
  | 'acc3'
  | 'acc4';

export type WeaponKind = 'melee' | 'spear' | 'bow' | 'magic' | 'boomerang' | 'laser' | 'bomb' | 'gun' | 'hook';
export type CraftingStation = 'hand' | 'workbench' | 'furnace' | 'anvil';
export type StationId = CraftingStation;
export type AccessoryKind =
  | 'cloud_bottle'
  | 'hermes_boots'
  | 'regen_ring'
  | 'cobalt_shield'
  | 'red_balloon'
  | 'shackle'
  | 'mana_flower'
  | 'horseshoe'
  | 'angel_wings'
  | 'celestial_emblem'
  | 'bounty_badge'
  | 'terraspark_boots'
  | 'ankh_shield';
export type ConsumableSpecialKind =
  | 'life_crystal'
  | 'mana_crystal'
  | 'magic_mirror'
  | 'recall_potion'
  | 'house_blueprint'
  | 'alien_probe'
  | 'lunar_sigil'
  | 'buff_potion'
  | 'red_potion'
  | 'milk_potion';

export type StatusEffectId =
  | 'regeneration'
  | 'ironskin'
  | 'swiftness'
  | 'mana_power'
  | 'featherfall'
  | 'wrath'
  | 'obsidian_skin'
  | 'shine'
  | 'heartreach'
  | 'poisoned'
  | 'on_fire'
  | 'slow'
  | 'weak'
  | 'broken_armor'
  | 'confusion'
  | 'darkness';

export interface ActiveStatusEffect {
  id: StatusEffectId;
  duration: number;
  maxDuration: number;
  isDebuff: boolean;
}

export interface ItemDef {
  id: string;
  name: string;
  nameRu?: string;
  category: ItemCategory;
  maxStack: number;
  description: string;
  descriptionRu?: string;
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
  // Armor properties
  armorSlot?: ArmorSlotKind;
  armorSet?: ArmorSetId;
  // Consumable / Accessory / Summon properties
  healAmount?: number;
  manaAmount?: number;
  defenseBonus?: number;
  summonsBoss?: EnemyKind;
  accessoryKind?: AccessoryKind;
  specialKind?: ConsumableSpecialKind;
  grantsEffects?: { id: StatusEffectId; duration: number }[];
  shopPrice?: number;
}

export interface InventorySlot {
  itemId: string;
  count: number;
}

export interface EquipmentState {
  helmet: InventorySlot | null;
  chestplate: InventorySlot | null;
  greaves: InventorySlot | null;
  accessories: (InventorySlot | null)[]; // length 5
}

export interface EquipmentBonuses {
  defense: number;
  activeSet: ArmorSetId | null;
  setBonusText: string | null;
  speedMult: number;
  jumpMult: number;
  damageMult: number;
  manaCostMult: number;
  maxManaBonus: number;
  hpRegenPerSec: number;
  manaRegenBonus: number;
  hasDoubleJump: boolean;
  hasWings: boolean;
  hasNoFallDamage: boolean;
  hasKnockbackImmune: boolean;
  hasDebuffImmune?: boolean;
  hasFireImmune?: boolean;
}

export interface CraftingRecipe {
  id: string;
  resultId: string;
  resultCount: number;
  station: CraftingStation;
  category: 'armor' | 'tools' | 'weapons' | 'building' | 'stations' | 'potions' | 'summons';
  ingredients: { itemId: string; count: number }[];
}

export interface GrappleHookState {
  active: boolean;
  hooked: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
  doubleJumpAvailable: boolean;
  wingFuel: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  defense: number;
  coins: number;
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
  grapple: GrappleHookState;
  effects: ActiveStatusEffect[];
}

export type NpcKind = 'guide' | 'merchant' | 'nurse' | 'demolitionist' | 'dryad' | 'director';

export interface NpcAppearance {
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: 'short' | 'parted' | 'bun' | 'beard' | 'crown';
  hat: 'none' | 'tophat' | 'nurse' | 'helmet' | 'leaves' | 'suit';
  shirt: string;
  apron?: string;
  pants: string;
  eyeColor: string;
  blush: string;
  glasses?: boolean;
  textureSrc?: string;
}

export interface NpcEntity {
  id: number;
  kind: NpcKind;
  name: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  onGround: boolean;
  homeTileX: number | null;
  homeTileY: number | null;
  hp: number;
  maxHp: number;
  walkDistance: number;
  blinkTimer: number;
  actionState: 'idle' | 'walk' | 'sit' | 'wave' | 'read' | 'attack';
  stateTimer: number;
  attackCooldown: number;
  speechText: string | null;
  speechTimer: number;
  appearance: NpcAppearance;
}

export interface HousingRoomReport {
  valid: boolean;
  hasHouseForNpc: boolean;
  interiorCount: number;
  hasWall: boolean;
  hasLight: boolean;
  hasDoor: boolean;
  hasTable: boolean;
  hasSeat: boolean;
  reasons: string[];
  centerTileX: number;
  centerTileY: number;
}

export type EnemyKind =
  | 'slime'
  | 'bat'
  | 'goblin'
  | 'skeleton'
  | 'ice_slime'
  | 'ice_bat'
  | 'frost_viking'
  | 'antlion'
  | 'sand_slime'
  | 'mummy'
  | 'crimera'
  | 'face_monster'
  | 'blood_crawler'
  | 'pixie'
  | 'sand_shark'
  | 'hellbat'
  | 'fire_imp'
  | 'fire_demon'
  | 'solar_corite'
  | 'vortex_alien'
  | 'nebula_floater'
  | 'stardust_cell'
  | 'alien_cat'
  | 'alien_drone'
  | 'martian_saucer'
  | 'solar_pillar'
  | 'vortex_pillar'
  | 'nebula_pillar'
  | 'stardust_pillar'
  | 'king_slime'
  | 'kotulhu'
  | 'cat_worm'
  | 'skele_cat'
  | 'eye_boss'
  | 'brain_cthulhu'
  | 'queen_bee'
  | 'deerclops'
  | 'wall_of_flesh'
  | 'queen_slime'
  | 'the_twins'
  | 'the_destroyer'
  | 'skeletron_prime'
  | 'plantera'
  | 'golem'
  | 'duke_fishron'
  | 'empress_light'
  | 'lunatic_cultist'
  | 'moon_lord'
  | 'pharaoh_cat'
  | 'jester_cat'
  | 'sun_cat'
  | 'atomic_cat'
  | 'party_cat'
  | 'melon_bandit';

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  name: string;
  nameRu?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shield?: number;
  maxShield?: number;
  pillarKind?: 'solar' | 'vortex' | 'nebula' | 'stardust';
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
  kind:
    | 'arrow'
    | 'fireball'
    | 'boomerang'
    | 'laser'
    | 'yarn_bomb'
    | 'frost_bolt'
    | 'slime_glob'
    | 'star_rain'
    | 'terra_beam'
    | 'bullet'
    | 'water_bolt'
    | 'dynamite'
    | 'cursed_orb'
    | 'stinger'
    | 'phantasmal_bolt'
    | 'zenith_blade'
    | 'demon_scythe'
    | 'vampire_knife'
    | 'rainbow_cat'
    | 'star_wrath';
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
  bouncesLeft?: number;
  aoeRadius: number;
  blastTiles?: number;
  color: string;
  accentColor?: string;
  curveDir?: number;
  returning?: boolean;
  lifesteal?: number;
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
  variant: WorldVariant;
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
  language: Language;
  musicEnabled: boolean;
  musicVolume: number; // 0..1
  sfxEnabled: boolean;
  sfxVolume: number; // 0..1
  screenShake: boolean;
  particlesEnabled: boolean;
  autopauseInMenus: boolean;
}

export type DebugChestPreset = 'empty' | 'summons' | 'terraria' | 'builder' | 'armor' | 'bosses' | 'cats' | 'potions';

export interface HudBossBar {
  id: number;
  kind: EnemyKind;
  name: string;
  hp: number;
  maxHp: number;
  shield?: number;
  maxShield?: number;
}

export interface HudSnapshot {
  phase: GamePhase;
  language: Language;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  defense: number;
  coins: number;
  dayCount: number;
  timeOfDay: number; // 0..1 (0.25 = noon, 0.75 = midnight)
  isNight: boolean;
  depthMeters: number;
  playerTileX: number;
  playerTileY: number;
  biome: BiomeType;
  worldVariant: WorldVariant;
  worldWidth: number;
  worldHeight: number;
  houseValid: boolean;
  validHouseCount: number;
  roomReport: HousingRoomReport | null;
  nearbyStations: CraftingStation[];
  hotbar: (InventorySlot | null)[];
  backpack: (InventorySlot | null)[];
  equipment: EquipmentState;
  equipmentBonuses: EquipmentBonuses;
  wingFuel: number;
  wingFuelMax: number;
  selectedSlot: number;
  activeToolMode: 'auto' | 'build';
  stats: RunStats;
  enemyCount: number;
  bossInfo: { name: string; hp: number; maxHp: number } | null;
  activeBosses: HudBossBar[];
  lunarEvent: {
    active: boolean;
    pillarsAlive: {
      kind: EnemyKind;
      name: string;
      tx: number;
      shield: number;
      maxShield: number;
      hp: number;
      maxHp: number;
    }[];
    moonLordSpawned: boolean;
  };
  alienInvasion: {
    active: boolean;
    defeated: number;
    target: number;
    saucerAlive: boolean;
  };
  toastMessage: string | null;
  godMode: boolean;
  nearbyStool: boolean;
  nearbyChest: { tx: number; ty: number; hasLoot: boolean } | null;
  nearbyDoor: { tx: number; ty: number; isOpen: boolean } | null;
  nearbyNpc: { id: number; kind: NpcKind; name: string; title: string } | null;
  npcsSummary: {
    id: number;
    kind: NpcKind;
    name: string;
    title: string;
    settled: boolean;
    homeTileX: number | null;
    homeTileY: number | null;
  }[];
  ownedAccessories: string[];
  activeChest: {
    tx: number;
    ty: number;
    items: (InventorySlot | null)[];
  } | null;
  activeNpc: {
    id: number;
    kind: NpcKind;
    name: string;
    title: string;
    quote: string;
    settled: boolean;
    shopItems: { itemId: string; price: number }[];
    canHeal: boolean;
    healCost: number;
  } | null;
  stoolSpeech: {
    stage: 'petted' | 'copied';
    text: string;
    hint?: string;
    copiedUrl?: string;
  } | null;
  activeEffects: {
    id: StatusEffectId;
    name: string;
    description: string;
    remaining: number;
    maxDuration: number;
    isDebuff: boolean;
    color: string;
  }[];
  activeSaveId: string | null;
}

export interface SaveSlotMeta {
  id: string;
  name: string;
  variant: WorldVariant;
  dayCount: number;
  hp: number;
  maxHp: number;
  coins: number;
  biome: BiomeType;
  playerTileX: number;
  playerTileY: number;
  savedAt: number;
}
