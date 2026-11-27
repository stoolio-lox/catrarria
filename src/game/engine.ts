import { sound } from './audio';
import {
  ITEMS,
  RECIPES,
  STOOL_REPO_URL,
  addItemToInventory,
  computeEquipmentBonuses,
  countItemInInventory,
  craftRecipe,
  createInitialEquipment,
  createStarterInventory,
  dropFromSlot,
  equipItemFromInventory,
  getChestPresetInfo,
  getItemName,
  giveDebugItem as applyGiveDebugItem,
  unequipItemToInventory,
} from './catalog';
import {
  STATUS_EFFECT_DEFS,
  applyStatusEffect,
  clearAllDebuffs,
  computeEffectModifiers,
  getEffectDescription,
  getEffectName,
  rollRedPotion,
  stepActiveEffects,
} from './effects';
import { tr } from './i18n';
import { getNpcDialogue, getNpcDisplay, getNpcShopItems, stepNpcAI, syncVillageNpcs } from './npc';
import {
  deserializeWorldData,
  loadWorldFromStorage,
  saveWorldToStorage,
  serializeWorldSnapshot,
} from './saves';
import {
  GRAVITY,
  InputIntent,
  MAX_WING_FUEL,
  PILLAR_KINDS,
  computeDamageAfterDefense,
  createEnemy,
  createInitialPlayer,
  explodeTilesRadius,
  getEnemyName,
  isBossKind,
  isPillarKind,
  moveEntityWithTiles,
  placeDebugChestNearPlayer,
  rectsOverlap,
  rollPotDrops,
  stepEnemyAI,
  stepPlayerPhysics,
  teleportPlayerToCoords,
  toggleDoorAtTile,
  tryDamageTile,
  tryPlaceItemAtTile,
} from './physics';
import { LoadedTextures, loadGameTextures, renderGameFrame } from './renderer';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settings';
import {
  DebugChestPreset,
  DropEntity,
  EnemyEntity,
  EnemyKind,
  EquipSlotKey,
  EquipmentState,
  FloatingText,
  GamePhase,
  GameSettings,
  HudBossBar,
  HudSnapshot,
  InventorySlot,
  Language,
  NpcEntity,
  Particle,
  PlayerState,
  ProjectileEntity,
  RunStats,
  TILE_SIZE,
  TileType,
  WorldData,
  WorldVariant,
} from './types';
import {
  buildQuickHouseAt,
  generateWorld,
  getBiomeAtX,
  getBiomeName,
  getNearbyStations,
  getTile,
  getWorldVariantInfo,
  inspectRoomHousing,
  isInsideValidHouse,
  isTileSolid,
  recomputeLighting,
  recomputeLightingLocal,
  setTile,
  tileIndex,
} from './worldGen';

const PARTICLE_POOL_SIZE = 180;
const DAY_DURATION_SEC = 110;

export class KotarriaEngine {
  public phase: GamePhase = 'title';
  public worldVariant: WorldVariant = 'crimson_classic';
  public world: WorldData;
  public player: PlayerState;
  public hotbar: (InventorySlot | null)[];
  public backpack: (InventorySlot | null)[];
  public equipment: EquipmentState;
  public selectedSlot = 0;
  public activeToolMode: 'auto' | 'build' = 'auto';

  public enemies: EnemyEntity[] = [];
  public projectiles: ProjectileEntity[] = [];
  public drops: DropEntity[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];
  public tileDamageMap = new Map<number, number>();

  public stats: RunStats = {
    daysSurvived: 1,
    monstersKilled: 0,
    blocksMined: 0,
    blocksPlaced: 0,
    itemsCrafted: 0,
    bossDefeated: false,
  };

  public dayCount = 1;
  public timeOfDay = 0.22; // Starts in bright morning
  public elapsed = 0;

  private hitstopTimer = 0;
  private trauma = 0;
  private cameraX = 0;
  private cameraY = 0;
  private nextEntityId = 1;
  private particleCursor = 0;
  private spawnTimer = 3.5;
  private lightUpdateTimer = 0;
  private houseCheckTimer = 0;
  private houseRegenTimer = 0;
  private regenAccessoryTimer = 0;
  private effectRegenTimer = 0;
  private effectDotTimer = 0;
  private autoSaveTimer = 25;
  private npcSyncTimer = 0.6;
  private starFallTimer = 11;
  private validHouseCount = 0;
  private hudEmitTimer = 0;
  private toastMessage: string | null = null;
  private toastTimer = 0;
  private bossSpawnedDay = 0;
  private lastWasNight = false;
  public activeSaveId: string | null = null;
  public lunarEvent = { active: false, moonLordSpawned: false };
  public alienInvasion = { active: false, defeated: 0, target: 24, saucerSpawned: false };
  public godMode = false;
  public uiModalOpen = false;
  public settings: GameSettings = { ...DEFAULT_SETTINGS };
  public activeChestCoords: { tx: number; ty: number } | null = null;
  public npcs: NpcEntity[] = [];
  public activeNpcId: number | null = null;
  public stoolPetted = false;
  public stoolSpeech: {
    stage: 'petted' | 'copied';
    text: string;
    hint?: string;
    copiedUrl?: string;
    timer: number;
  } | null = null;

  // Input state
  private keys = new Set<string>();
  private jumpJustPressed = false;
  private mouseLeftDown = false;
  private mouseRightDown = false;
  private mouseLeftQueued = false;
  private mouseRightQueued = false;
  private mouseScreenX = 600;
  private mouseScreenY = 360;
  private attackCooldown = 0;
  private placeCooldown = 0;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private textures: LoadedTextures;
  private rafId: number | null = null;
  private timeoutId: number | null = null;
  private lastTimestamp = 0;
  private lastRenderTime = 0;
  private lastHudKey = '';
  private onHudChange: (snap: HudSnapshot) => void;

  constructor(onHudChange: (snap: HudSnapshot) => void) {
    this.onHudChange = onHudChange;
    this.textures = loadGameTextures();
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 3,
        life: 0,
        maxLife: 1,
        color: '#ffffff',
        gravity: 200,
      });
    }

    this.settings = loadSettings();
    sound.applySettings({
      musicEnabled: this.settings.musicEnabled,
      musicVolume: this.settings.musicVolume,
      sfxEnabled: this.settings.sfxEnabled,
      sfxVolume: this.settings.sfxVolume,
    });

    this.world = generateWorld(42069, this.worldVariant);
    this.player = createInitialPlayer(this.world);
    const inv = createStarterInventory();
    this.hotbar = inv.hotbar;
    this.backpack = inv.backpack;
    this.equipment = createInitialEquipment();
    this.syncActiveWeapon();

    // Seed 2 starter slimes a bit off to the sides and Guide near spawn
    this.spawnStarterCreatures();
    const sync = syncVillageNpcs(
      this.npcs,
      this.world,
      () => this.nextEntityId++,
      this.player,
      this.stats.bossDefeated,
      false,
      this.lang,
    );
    this.validHouseCount = sync.validHouseCount;
  }

  private get lang(): Language {
    return this.settings.language;
  }

  private t(en: string, ru: string): string {
    return tr(this.lang, en, ru);
  }

  private spawnStarterCreatures(): void {
    const midX = Math.floor(this.world.width / 2);
    const leftX = (midX - 14) * TILE_SIZE;
    const leftY = (this.world.surfaceHeights[midX - 14] - 2) * TILE_SIZE;
    const rightX = (midX + 15) * TILE_SIZE;
    const rightY = (this.world.surfaceHeights[midX + 15] - 2) * TILE_SIZE;
    this.enemies.push(createEnemy(this.nextEntityId++, 'slime', leftX, leftY, 1));
    this.enemies.push(createEnemy(this.nextEntityId++, 'slime', rightX, rightY, 1));
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.centerCameraImmediate();
    this.ensureLoopRunning();
    this.emitHud(true);
  }

  private shouldPauseSimulation(): boolean {
    return this.uiModalOpen && this.settings.autopauseInMenus;
  }

  private ensureLoopRunning(): void {
    if (
      this.rafId === null &&
      this.canvas &&
      (this.phase === 'title' || (this.phase === 'playing' && !this.shouldPauseSimulation()))
    ) {
      this.lastTimestamp = performance.now();
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  public setUiModalOpen(open: boolean): void {
    if (this.uiModalOpen === open) return;
    this.uiModalOpen = open;
    if (open) {
      this.clearInputs();
    }
    if (this.shouldPauseSimulation()) {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.render();
    } else if (this.phase === 'playing') {
      this.ensureLoopRunning();
    }
  }

  public applySettings(next: GameSettings): void {
    const langChanged = this.settings.language !== next.language;
    this.settings = { ...next };
    saveSettings(this.settings);
    if (langChanged) {
      for (const npc of this.npcs) {
        const disp = getNpcDisplay(npc.kind, this.lang);
        npc.name = disp.name;
        npc.title = disp.title;
      }
      for (const enemy of this.enemies) {
        enemy.name = getEnemyName(enemy, this.lang);
      }
    }
    sound.applySettings({
      musicEnabled: this.settings.musicEnabled,
      musicVolume: this.settings.musicVolume,
      sfxEnabled: this.settings.sfxEnabled,
      sfxVolume: this.settings.sfxVolume,
    });
    this.syncMusicTheme();
    if (this.shouldPauseSimulation()) {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else if (this.phase === 'playing') {
      this.ensureLoopRunning();
    }
    this.emitHud(true);
  }

  private syncMusicTheme(): void {
    if (this.phase === 'title') {
      sound.setMusicTheme('title');
      return;
    }
    if (this.phase !== 'playing') {
      sound.setMusicTheme('none');
      return;
    }
    const hasBoss = this.enemies.some((e) => isBossKind(e.kind) && e.aiState !== 'ko');
    if (hasBoss) {
      sound.setMusicTheme('boss');
      return;
    }
    const isNight = this.timeOfDay >= 0.55 || this.timeOfDay < 0.08;
    const pxTile = Math.max(0, Math.min(this.world.width - 1, Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE)));
    const feetTileY = Math.round((this.player.y + this.player.height) / TILE_SIZE);
    const underground = feetTileY - this.world.surfaceHeights[pxTile] > 6;
    sound.setMusicTheme(isNight || underground ? 'night' : 'day');
  }

  public detach(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.canvas = null;
    this.ctx = null;
  }

  public resizeCanvas(): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(320, Math.round(rect.width * dpr));
    const h = Math.max(240, Math.round(rect.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.render();
    }
  }

  private centerCameraImmediate(): void {
    if (!this.canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const viewW = this.canvas.width / dpr;
    const viewH = this.canvas.height / dpr;
    this.cameraX = this.player.x + this.player.width / 2 - viewW / 2;
    this.cameraY = this.player.y + this.player.height / 2 - viewH / 2;
  }

  public setPhase(next: GamePhase): void {
    this.phase = next;
    if (typeof document !== 'undefined') {
      document.body.dataset.state = next;
    }
    this.clearInputs();
    if (next === 'playing') {
      this.centerCameraImmediate();
      this.ensureLoopRunning();
    } else if (next === 'title') {
      this.activeChestCoords = null;
      this.activeNpcId = null;
      this.ensureLoopRunning();
    } else {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.render();
    }
    this.syncMusicTheme();
    this.emitHud(true);
  }

  public startNewGame(variant?: WorldVariant): void {
    sound.unlock();
    if (variant) {
      this.worldVariant = variant;
    }
    this.world = generateWorld(Math.floor(Date.now() % 100000) + 777, this.worldVariant);
    this.player = createInitialPlayer(this.world);
    const inv = createStarterInventory();
    this.hotbar = inv.hotbar;
    this.backpack = inv.backpack;
    this.equipment = createInitialEquipment();
    this.selectedSlot = 0;
    this.activeToolMode = 'auto';
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.floatingTexts = [];
    this.tileDamageMap.clear();
    this.dayCount = 1;
    this.timeOfDay = 0.22;
    this.bossSpawnedDay = 0;
    this.lastWasNight = false;
    this.activeSaveId = null;
    this.autoSaveTimer = 25;
    this.lunarEvent = { active: false, moonLordSpawned: false };
    this.alienInvasion = { active: false, defeated: 0, target: 24, saucerSpawned: false };
    this.godMode = false;
    this.uiModalOpen = false;
    this.activeChestCoords = null;
    this.activeNpcId = null;
    this.npcs = [];
    this.stoolPetted = false;
    this.stoolSpeech = null;
    this.stats = {
      daysSurvived: 1,
      monstersKilled: 0,
      blocksMined: 0,
      blocksPlaced: 0,
      itemsCrafted: 0,
      bossDefeated: false,
    };
    this.syncActiveWeapon();
    this.spawnStarterCreatures();
    const sync = syncVillageNpcs(
      this.npcs,
      this.world,
      () => this.nextEntityId++,
      this.player,
      false,
      false,
      this.lang,
    );
    this.validHouseCount = sync.validHouseCount;
    const variantMeta = getWorldVariantInfo(this.worldVariant, this.lang);
    this.showToast(
      this.t(
        `World "${variantMeta.title}" created! Guide Max & the Stool await nearby.`,
        `Мир «${variantMeta.title}» создан! Рядом Гид Максим и табуретка.`,
      ),
    );
    this.setPhase('playing');
  }

  public regenerateWorldVariant(variant: WorldVariant): void {
    this.startNewGame(variant);
  }

  public saveCurrentWorld(slotId?: string, silent = false): { ok: boolean; saveId: string | null } {
    const id = slotId ?? this.activeSaveId ?? `world_${Date.now().toString(36)}`;
    const pxTile = Math.max(
      0,
      Math.min(this.world.width - 1, Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE)),
    );
    const biome = getBiomeAtX(pxTile, this.world.width);
    const variantTitle = getWorldVariantInfo(this.worldVariant, this.lang).title;
    const snapshot = serializeWorldSnapshot({
      id,
      name: `${variantTitle} · ${this.t('Day', 'День')} ${this.dayCount}`,
      biome,
      world: this.world,
      player: this.player,
      hotbar: this.hotbar,
      backpack: this.backpack,
      equipment: this.equipment,
      selectedSlot: this.selectedSlot,
      activeToolMode: this.activeToolMode,
      dayCount: this.dayCount,
      timeOfDay: this.timeOfDay,
      bossSpawnedDay: this.bossSpawnedDay,
      lastWasNight: this.lastWasNight,
      lunarEvent: this.lunarEvent,
      alienInvasion: this.alienInvasion,
      godMode: this.godMode,
      stoolPetted: this.stoolPetted,
      stats: this.stats,
      npcs: this.npcs,
    });
    const ok = saveWorldToStorage(snapshot);
    if (ok) {
      this.activeSaveId = id;
      if (!silent) {
        sound.playCraft();
        this.showToast(this.t('World & progress saved!', 'Мир и прогресс сохранены!'));
      }
      this.emitHud(true);
    } else if (!silent) {
      this.showToast(this.t('Could not save world (storage full).', 'Не удалось сохранить мир.'));
    }
    return { ok, saveId: ok ? id : null };
  }

  public loadSavedWorld(saveId: string): boolean {
    const data = loadWorldFromStorage(saveId);
    if (!data) {
      this.showToast(this.t('Save file not found.', 'Сохранение не найдено.'));
      return false;
    }
    sound.unlock();
    this.worldVariant = data.world.variant ?? data.meta?.variant ?? 'crimson_classic';
    this.world = deserializeWorldData(data);
    this.player = {
      ...createInitialPlayer(this.world),
      ...data.player,
      effects: Array.isArray(data.player.effects) ? data.player.effects.map((e) => ({ ...e })) : [],
      grapple: { active: false, hooked: false, x: 0, y: 0, vx: 0, vy: 0 },
    };
    this.hotbar = data.hotbar.map((s) => (s ? { ...s } : null));
    this.backpack = data.backpack.map((s) => (s ? { ...s } : null));
    this.equipment = {
      helmet: data.equipment?.helmet ? { ...data.equipment.helmet } : null,
      chestplate: data.equipment?.chestplate ? { ...data.equipment.chestplate } : null,
      greaves: data.equipment?.greaves ? { ...data.equipment.greaves } : null,
      accessories: Array.isArray(data.equipment?.accessories)
        ? data.equipment.accessories.map((a) => (a ? { ...a } : null))
        : [null, null, null, null, null],
    };
    this.selectedSlot = Math.max(0, Math.min(8, data.selectedSlot ?? 0));
    this.activeToolMode = data.activeToolMode ?? 'auto';
    this.dayCount = data.dayCount ?? 1;
    this.timeOfDay = data.timeOfDay ?? 0.22;
    this.bossSpawnedDay = data.bossSpawnedDay ?? 0;
    this.lastWasNight = Boolean(data.lastWasNight);
    this.godMode = Boolean(data.godMode);
    this.stats = { ...data.stats };
    this.stoolPetted = Boolean(data.stoolPetted);
    this.lunarEvent = data.lunarEvent ? { ...data.lunarEvent } : { active: false, moonLordSpawned: false };
    this.alienInvasion = data.alienInvasion
      ? { ...data.alienInvasion }
      : { active: false, defeated: 0, target: 24, saucerSpawned: false };
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.floatingTexts = [];
    this.tileDamageMap.clear();
    this.npcs = Array.isArray(data.npcs)
      ? data.npcs.map((n) => ({
          ...n,
          speechText: null,
          speechTimer: 0,
        }))
      : [];
    const sync = syncVillageNpcs(
      this.npcs,
      this.world,
      () => this.nextEntityId++,
      this.player,
      this.stats.bossDefeated,
      false,
      this.lang,
    );
    this.validHouseCount = sync.validHouseCount;
    this.activeSaveId = saveId;
    this.autoSaveTimer = 25;
    this.uiModalOpen = false;
    this.activeChestCoords = null;
    this.activeNpcId = null;
    this.syncActiveWeapon();
    recomputeLighting(this.world, this.timeOfDay);
    this.showToast(
      this.t(`Loaded Day ${this.dayCount} world!`, `Мир загружен (День ${this.dayCount})!`),
    );
    this.setPhase('playing');
    return true;
  }

  public clearInputs(): void {
    this.keys.clear();
    this.jumpJustPressed = false;
    this.mouseLeftDown = false;
    this.mouseRightDown = false;
    this.mouseLeftQueued = false;
    this.mouseRightQueued = false;
  }

  public handleKeyDown(code: string): void {
    sound.unlock();
    if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
      if (!this.keys.has(code)) {
        this.jumpJustPressed = true;
      }
    }
    this.keys.add(code);

    if (code.startsWith('Digit')) {
      const n = Number(code.slice(5));
      if (n >= 1 && n <= 9) {
        this.selectHotbarSlot(n - 1);
      }
    } else if (code === 'KeyB') {
      this.toggleToolMode();
    } else if (code === 'KeyG') {
      this.fireGrapplingHookFromKey();
    } else if (code === 'KeyF') {
      this.interactNearestTarget();
    } else if (code === 'KeyQ') {
      const dropAll = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
      this.dropSelectedHotbarItem(dropAll);
    }
  }

  public handleKeyUp(code: string): void {
    this.keys.delete(code);
  }

  public handleMouseMove(clientX: number, clientY: number): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouseScreenX = clientX - rect.left;
    this.mouseScreenY = clientY - rect.top;
  }

  public handleMouseDown(button: number, clientX: number, clientY: number): void {
    sound.unlock();
    this.handleMouseMove(clientX, clientY);
    if (button === 0) {
      this.mouseLeftDown = true;
      this.mouseLeftQueued = true;
    }
    if (button === 2) {
      this.mouseRightDown = true;
      this.mouseRightQueued = true;
    }
  }

  public handleMouseUp(button: number): void {
    if (button === 0) this.mouseLeftDown = false;
    if (button === 2) this.mouseRightDown = false;
  }

  public selectHotbarSlot(idx: number): void {
    if (idx < 0 || idx >= 9) return;
    this.selectedSlot = idx;
    this.syncActiveWeapon();
    this.emitHud();
  }

  public toggleToolMode(): void {
    this.activeToolMode = this.activeToolMode === 'auto' ? 'build' : 'auto';
    this.showToast(
      this.activeToolMode === 'build'
        ? this.t('Build mode: LMB places blocks', 'Режим стройки: ЛКМ ставит блоки')
        : this.t('Combat/Mine mode: LMB attack/mine, RMB place', 'Обычный режим: ЛКМ атака/копка, ПКМ стройка'),
    );
    this.emitHud();
  }

  public swapSlots(
    fromArea: 'hotbar' | 'backpack',
    fromIdx: number,
    toArea: 'hotbar' | 'backpack',
    toIdx: number,
  ): void {
    const fromArr = fromArea === 'hotbar' ? this.hotbar : this.backpack;
    const toArr = toArea === 'hotbar' ? this.hotbar : this.backpack;
    if (fromIdx < 0 || fromIdx >= fromArr.length || toIdx < 0 || toIdx >= toArr.length) return;
    const temp = fromArr[fromIdx];
    fromArr[fromIdx] = toArr[toIdx];
    toArr[toIdx] = temp;
    this.syncActiveWeapon();
    this.emitHud();
  }

  public dropSlotItem(
    area: 'hotbar' | 'backpack',
    index: number,
    amount: number | 'all' = 1,
  ): boolean {
    if (this.phase !== 'playing') return false;
    const slots = area === 'hotbar' ? this.hotbar : this.backpack;
    const dropped = dropFromSlot(slots, index, amount);
    if (!dropped) return false;

    const dir = this.player.facing;
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    this.drops.push({
      id: this.nextEntityId++,
      itemId: dropped.itemId,
      count: dropped.droppedCount,
      x: pcx + dir * 22,
      y: pcy - 6,
      vx: dir * 270,
      vy: -210,
      life: 60,
      pickupDelay: 1.4,
      noAutoMagnet: true,
    });

    const name = getItemName(dropped.itemId, this.lang);
    const label = `${name}${dropped.droppedCount > 1 ? ` ×${dropped.droppedCount}` : ''}`;
    this.spawnFloatingText(pcx, this.player.y - 10, this.t(`Dropped: ${label}`, `Выброшено: ${label}`), '#fde68a');
    sound.playDrop();
    this.syncActiveWeapon();
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
    return true;
  }

  public dropSelectedHotbarItem(dropAll = false): boolean {
    return this.dropSlotItem('hotbar', this.selectedSlot, dropAll ? 'all' : 1);
  }

  public equipInventoryItem(
    fromArea: 'hotbar' | 'backpack',
    fromIndex: number,
    targetSlotKey?: EquipSlotKey,
  ): boolean {
    const res = equipItemFromInventory(
      this.hotbar,
      this.backpack,
      this.equipment,
      fromArea,
      fromIndex,
      targetSlotKey,
      this.lang,
    );
    if (!res.equipped) {
      if (res.reason) this.showToast(res.reason);
      this.emitHud(true);
      return false;
    }
    const bonuses = computeEquipmentBonuses(this.equipment);
    this.player.mana = Math.min(this.player.mana, this.player.maxMana + bonuses.maxManaBonus);
    sound.playPickup();
    this.syncActiveWeapon();
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
    return true;
  }

  public unequipEquipmentSlot(slotKey: EquipSlotKey): boolean {
    const ok = unequipItemToInventory(this.hotbar, this.backpack, this.equipment, slotKey);
    if (!ok) {
      this.showToast(this.t('Backpack is full — cannot unequip!', 'Нет места в рюкзаке, чтобы снять экипировку!'));
      this.emitHud(true);
      return false;
    }
    const bonuses = computeEquipmentBonuses(this.equipment);
    this.player.mana = Math.min(this.player.mana, this.player.maxMana + bonuses.maxManaBonus);
    sound.playPickup();
    this.syncActiveWeapon();
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
    return true;
  }

  public tryCraft(recipeId: string): boolean {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    const stations = getNearbyStations(
      this.world,
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
    );
    const ok = craftRecipe(recipe, this.hotbar, this.backpack, stations);
    if (ok) {
      this.stats.itemsCrafted++;
      sound.playCraft();
      const name = getItemName(recipe.resultId, this.lang);
      this.showToast(this.t(`Crafted: ${name} ×${recipe.resultCount}`, `Скрафчено: ${name} ×${recipe.resultCount}`));
      this.syncActiveWeapon();
      this.emitHud();
    }
    return ok;
  }

  public useSelectedConsumable(aimTx?: number, aimTy?: number): boolean {
    const slot = this.hotbar[this.selectedSlot];
    if (!slot) return false;
    const def = ITEMS[slot.itemId];
    if (!def || def.category !== 'consumable') return false;

    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;

    if (def.specialKind === 'house_blueprint') {
      const ptx = Math.floor(pcx / TILE_SIZE);
      const feetY = Math.round((this.player.y + this.player.height) / TILE_SIZE);
      const anchorX =
        aimTx !== undefined
          ? Math.max(6, Math.min(this.world.width - 7, aimTx))
          : Math.max(6, Math.min(this.world.width - 7, ptx + this.player.facing * 5));
      const floorY =
        aimTy !== undefined
          ? Math.max(8, Math.min(this.world.height - 3, aimTy))
          : Math.max(8, Math.min(this.world.height - 3, feetY));
      const res = buildQuickHouseAt(this.world, anchorX, floorY, this.lang);
      if (!res.built) {
        this.showToast(res.reason ?? this.t('Cannot build a house here!', 'Здесь нельзя построить дом!'));
        return false;
      }
      slot.count--;
      if (slot.count <= 0) {
        this.hotbar[this.selectedSlot] = null;
      }
      this.stats.blocksPlaced += 16;
      recomputeLightingLocal(this.world, this.timeOfDay, res.centerTileX, res.centerTileY);
      sound.playCraft();
      sound.playPlace();
      this.spawnBurst(res.centerTileX * TILE_SIZE, res.centerTileY * TILE_SIZE, '#fde047', 18, 170);
      const sync = syncVillageNpcs(
        this.npcs,
        this.world,
        () => this.nextEntityId++,
        this.player,
        this.stats.bossDefeated,
        false,
        this.lang,
      );
      this.validHouseCount = sync.validHouseCount;
      this.showToast(
        sync.spawnedNames.length > 0
          ? this.t(
              `House built! ${sync.spawnedNames[0]} moved in!`,
              `Дом построен! Заселился житель: ${sync.spawnedNames[0]}!`,
            )
          : this.t(
              `Cozy house built! (Houses: ${this.validHouseCount})`,
              `Уютный дом построен! (Домов: ${this.validHouseCount})`,
            ),
      );
      this.syncActiveWeapon();
      this.emitHud(true);
      return true;
    }

    if (def.specialKind === 'magic_mirror') {
      this.spawnBurst(pcx, pcy, '#38bdf8', 18, 170);
      this.teleportToSpawn();
      sound.playMirror();
      this.spawnBurst(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        '#bae6fd',
        18,
        170,
      );
      this.showToast(this.t('Magic Mirror teleported you home!', 'Волшебное зеркало перенесло кота домой!'));
      this.emitHud(true);
      return true;
    }

    if (def.specialKind === 'recall_potion') {
      this.spawnBurst(pcx, pcy, '#38bdf8', 16, 160);
      this.teleportToSpawn();
      sound.playMirror();
      this.spawnBurst(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        '#bae6fd',
        16,
        160,
      );
      this.showToast(this.t('Recall Potion warped you home!', 'Зелье возврата перенесло кота домой!'));
    } else if (def.specialKind === 'red_potion') {
      const roll = rollRedPotion(this.player.effects);
      const names = roll.appliedEffects.map((id) => getEffectName(id, this.lang)).join(', ');
      if (roll.outcome === 'good') {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + roll.healAmount);
        this.spawnFloatingText(pcx, this.player.y - 14, this.t('LUCKY! +60 HP', 'УДАЧА! +60 HP'), '#4ade80');
        this.spawnBurst(pcx, pcy, '#fde047', 22, 190);
        sound.playStar();
        this.showToast(
          this.t(`Red Potion (50/50) GOOD: ${names}!`, `Красное зелье (50/50) ПОВЕЗЛО: ${names}!`),
        );
      } else {
        this.spawnFloatingText(pcx, this.player.y - 14, this.t('CURSED!', 'ПРОКЛЯТИЕ!'), '#ef4444');
        this.spawnBurst(pcx, pcy, '#b91c1c', 22, 190);
        sound.playPlayerHurt();
        this.showToast(
          this.t(`Red Potion (50/50) BAD: ${names}!`, `Красное зелье (50/50) НЕ ПОВЕЗЛО: ${names}!`),
        );
      }
    } else if (def.specialKind === 'milk_potion') {
      const cleanse = clearAllDebuffs(this.player.effects);
      this.player.effects = cleanse.remaining;
      const cleared = cleanse.removedCount;
      if (def.healAmount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + def.healAmount);
      }
      this.spawnFloatingText(
        pcx,
        this.player.y - 12,
        cleared > 0 ? this.t('CLEANSED!', 'ОЧИЩЕНО!') : `+${def.healAmount ?? 15} HP`,
        '#bae6fd',
      );
      this.spawnBurst(pcx, pcy, '#f8fafc', 16, 150);
      sound.playHeal();
      this.showToast(
        cleared > 0
          ? this.t(
              `Milk Potion removed ${cleared} debuff(s)!`,
              `Зелье молока сняло плохие эффекты (${cleared})!`,
            )
          : this.t('Milk Potion refreshed you! +15 HP', 'Зелье молока освежило кота! +15 HP'),
      );
    } else if (def.specialKind === 'buff_potion' && def.grantsEffects) {
      const names: string[] = [];
      for (const ge of def.grantsEffects) {
        applyStatusEffect(this.player.effects, ge.id, ge.duration);
        names.push(getEffectName(ge.id, this.lang));
      }
      this.spawnFloatingText(pcx, this.player.y - 12, names[0] ?? 'BUFF!', def.accent);
      this.spawnBurst(pcx, pcy, def.color, 14, 150);
      sound.playHeal();
      this.showToast(this.t(`Effect active: ${names.join(', ')}`, `Эффект: ${names.join(', ')}`));
    } else if (def.specialKind === 'life_crystal') {
      if (this.player.maxHp >= 400) {
        this.showToast(this.t('Max HP (400) already reached!', 'Максимум HP (400) уже достигнут!'));
        return false;
      }
      this.player.maxHp = Math.min(400, this.player.maxHp + 20);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
      this.spawnFloatingText(pcx, this.player.y - 12, this.t('+20 Max HP!', '+20 Макс. HP!'), '#f472b6');
      this.spawnBurst(pcx, pcy, '#ec4899', 16, 160);
      sound.playStar();
    } else if (def.specialKind === 'mana_crystal') {
      if (this.player.maxMana >= 200) {
        this.showToast(this.t('Max Mana (200) already reached!', 'Максимум маны (200) уже достигнут!'));
        return false;
      }
      this.player.maxMana = Math.min(200, this.player.maxMana + 20);
      this.player.mana = Math.min(this.player.maxMana, this.player.mana + 40);
      this.spawnFloatingText(pcx, this.player.y - 12, this.t('+20 Max Mana!', '+20 Макс. Мана!'), '#60a5fa');
      this.spawnBurst(pcx, pcy, '#3b82f6', 16, 160);
      sound.playStar();
    } else {
      if (def.healAmount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + def.healAmount);
        this.spawnFloatingText(pcx, this.player.y - 10, `+${def.healAmount} HP`, '#4ade80');
      }
      if (def.manaAmount) {
        this.player.mana = Math.min(this.player.maxMana, this.player.mana + def.manaAmount);
      }
      if (def.defenseBonus) {
        this.player.defense = Math.min(20, this.player.defense + def.defenseBonus);
        this.showToast(this.t(`Defense increased to ${this.player.defense}!`, `Защита кота выросла до ${this.player.defense}!`));
      }
      sound.playHeal();
    }

    slot.count--;
    if (slot.count <= 0) {
      this.hotbar[this.selectedSlot] = null;
    }
    this.syncActiveWeapon();
    this.emitHud(true);
    return true;
  }

  public summonBoss(kind: EnemyKind, consumeSelectedSlot = false): boolean {
    if (this.phase !== 'playing') return false;
    if (!isBossKind(kind)) return false;

    if (consumeSelectedSlot) {
      const slot = this.hotbar[this.selectedSlot];
      if (!slot || slot.count <= 0) return false;
      slot.count--;
      if (slot.count <= 0) {
        this.hotbar[this.selectedSlot] = null;
        this.syncActiveWeapon();
      }
    }

    const spawnOffsetY =
      kind === 'cat_worm' || kind === 'the_destroyer'
        ? 140
        : kind === 'wall_of_flesh'
          ? -40
          : kind === 'king_slime' || kind === 'queen_slime' || kind === 'golem' || kind === 'deerclops'
            ? -60
            : -180;
    const boss = createEnemy(
      this.nextEntityId++,
      kind,
      this.player.x + 250 * this.player.facing,
      this.player.y + spawnOffsetY,
      1 + (this.dayCount - 1) * 0.15,
      this.lang,
    );
    this.enemies.push(boss);
    sound.playBossRoar();
    this.trauma = Math.min(1, this.trauma + 0.5);
    this.showToast(
      this.t(`${getEnemyName(boss, 'en')} has awoken!`, `${getEnemyName(boss, 'ru')} пробудился!`),
    );
    this.syncMusicTheme();
    this.emitHud(true);
    return true;
  }

  public spawnCelestialPillars(consumeSelectedSlot = false): boolean {
    if (this.phase !== 'playing') return false;
    if (consumeSelectedSlot) {
      const slot = this.hotbar[this.selectedSlot];
      if (!slot || slot.count <= 0) return false;
      slot.count--;
      if (slot.count <= 0) {
        this.hotbar[this.selectedSlot] = null;
        this.syncActiveWeapon();
      }
    }

    const offsets = [-360, -160, 160, 360];
    for (let i = 0; i < PILLAR_KINDS.length; i++) {
      const kind = PILLAR_KINDS[i];
      const wx = Math.max(
        8 * TILE_SIZE,
        Math.min((this.world.width - 8) * TILE_SIZE, this.player.x + offsets[i]),
      );
      const tx = Math.floor(wx / TILE_SIZE);
      const wy = Math.max(6, this.world.surfaceHeights[tx] - 6) * TILE_SIZE;
      const pillar = createEnemy(this.nextEntityId++, kind, wx, wy, 1, this.lang);
      this.enemies.push(pillar);
      this.spawnBurst(wx + 32, wy + 52, '#38bdf8', 14, 180);
    }

    this.lunarEvent = { active: true, moonLordSpawned: false };
    sound.playBossRoar();
    this.trauma = Math.min(1, this.trauma + 0.55);
    this.showToast(
      this.t(
        'The 4 Celestial Pillars have descended! Defeat their minions to drop the shields!',
        '4 Небесные Башни спустились! Бейте миньонов вокруг них, чтобы снять щиты!',
      ),
    );
    this.syncMusicTheme();
    this.emitHud(true);
    return true;
  }

  public startAlienInvasion(consumeSelectedSlot = false): boolean {
    if (this.phase !== 'playing') return false;
    if (consumeSelectedSlot) {
      const slot = this.hotbar[this.selectedSlot];
      if (!slot || slot.count <= 0) return false;
      slot.count--;
      if (slot.count <= 0) {
        this.hotbar[this.selectedSlot] = null;
        this.syncActiveWeapon();
      }
    }

    this.alienInvasion = { active: true, defeated: 0, target: 24, saucerSpawned: false };
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const wx = Math.max(
        6 * TILE_SIZE,
        Math.min((this.world.width - 6) * TILE_SIZE, this.player.x + side * 240),
      );
      const kind: EnemyKind = i === 0 ? 'alien_cat' : 'alien_drone';
      this.enemies.push(
        createEnemy(this.nextEntityId++, kind, wx, this.player.y - 120, 1, this.lang),
      );
    }
    sound.playBossRoar();
    this.showToast(
      this.t(
        'Alien Invasion! Green Martian Cats and UFO Drones are invading!',
        'Нашествие инопланетян! Зелёные марсианские коты и НЛО атакуют!',
      ),
    );
    this.syncMusicTheme();
    this.emitHud(true);
    return true;
  }

  public summonNightBoss(): void {
    this.summonBoss('eye_boss', false);
  }

  private findNearestChestTile(maxDistTiles = 4.5): { tx: number; ty: number; hasLoot: boolean } | null {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const ptx = Math.floor(pcx / TILE_SIZE);
    const pty = Math.floor(pcy / TILE_SIZE);
    const r = Math.ceil(maxDistTiles);
    let best: { tx: number; ty: number; hasLoot: boolean } | null = null;
    let bestDist = Infinity;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = ptx + dx;
        const ty = pty + dy;
        if (getTile(this.world, tx, ty) === TileType.Chest) {
          const dist = Math.hypot((tx + 0.5) * TILE_SIZE - pcx, (ty + 0.5) * TILE_SIZE - pcy);
          if (dist <= maxDistTiles * TILE_SIZE && dist < bestDist) {
            bestDist = dist;
            const idx = tileIndex(tx, ty, this.world.width);
            best = { tx, ty, hasLoot: (this.world.chests[idx]?.length ?? 0) > 0 };
          }
        }
      }
    }
    return best;
  }

  public openChest(tx: number, ty: number): void {
    if (getTile(this.world, tx, ty) !== TileType.Chest) return;
    const idx = tileIndex(tx, ty, this.world.width);
    if (!this.world.chests[idx]) {
      this.world.chests[idx] = [];
    }
    this.activeChestCoords = { tx, ty };
    sound.playChestOpen();
    this.emitHud(true);
  }

  public openNearestChest(): boolean {
    const chest = this.findNearestChestTile(4.5);
    if (!chest) return false;
    this.openChest(chest.tx, chest.ty);
    return true;
  }

  public closeChest(): void {
    this.activeChestCoords = null;
    this.emitHud(true);
  }

  public takeChestItem(itemIdx: number): void {
    if (!this.activeChestCoords) return;
    const key = tileIndex(this.activeChestCoords.tx, this.activeChestCoords.ty, this.world.width);
    const items = this.world.chests[key];
    if (!items || itemIdx < 0 || itemIdx >= items.length) return;
    const slot = items[itemIdx];
    const leftover = addItemToInventory(this.hotbar, this.backpack, slot.itemId, slot.count);
    const taken = slot.count - leftover;
    if (taken > 0) {
      sound.playPickup();
      const name = getItemName(slot.itemId, this.lang);
      this.showToast(this.t(`Took from chest: ${name} ×${taken}`, `Взято из сундука: ${name} ×${taken}`));
    }
    if (leftover <= 0) {
      items.splice(itemIdx, 1);
    } else {
      slot.count = leftover;
      this.showToast(this.t('Inventory is full!', 'Инвентарь полон!'));
    }
    this.syncActiveWeapon();
    this.emitHud(true);
  }

  public takeAllChestLoot(): void {
    if (!this.activeChestCoords) return;
    const key = tileIndex(this.activeChestCoords.tx, this.activeChestCoords.ty, this.world.width);
    const items = this.world.chests[key];
    if (!items || items.length === 0) return;

    let takenAny = false;
    for (let i = items.length - 1; i >= 0; i--) {
      const slot = items[i];
      const leftover = addItemToInventory(this.hotbar, this.backpack, slot.itemId, slot.count);
      if (leftover < slot.count) {
        takenAny = true;
      }
      if (leftover <= 0) {
        items.splice(i, 1);
      } else {
        slot.count = leftover;
      }
    }
    if (takenAny) {
      sound.playPickup();
      this.showToast(
        items.length === 0
          ? this.t('Looted all items from chest!', 'Сундук полностью собран!')
          : this.t('Some items stayed (backpack full).', 'Часть предметов осталась (рюкзак полон).'),
      );
    }
    this.syncActiveWeapon();
    this.emitHud(true);
  }

  private syncActiveWeapon(): void {
    const slot = this.hotbar[this.selectedSlot];
    this.player.activeWeaponId = slot ? slot.itemId : null;
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastTimer = 3.2;
  }

  private copyToClipboard(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    if (typeof document !== 'undefined') {
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'fixed';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      } catch {
        // Clipboard fallback best-effort
      }
    }
  }

  private findNearestStoolTile(maxDistTiles = 4.5): { tx: number; ty: number } | null {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const ptx = Math.floor(pcx / TILE_SIZE);
    const pty = Math.floor(pcy / TILE_SIZE);
    const r = Math.ceil(maxDistTiles);
    let best: { tx: number; ty: number } | null = null;
    let bestDist = Infinity;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = ptx + dx;
        const ty = pty + dy;
        if (getTile(this.world, tx, ty) === TileType.Stool) {
          const dist = Math.hypot((tx + 0.5) * TILE_SIZE - pcx, (ty + 0.5) * TILE_SIZE - pcy);
          if (dist <= maxDistTiles * TILE_SIZE && dist < bestDist) {
            bestDist = dist;
            best = { tx, ty };
          }
        }
      }
    }
    return best;
  }

  public petNearestStool(): boolean {
    const stool = this.findNearestStoolTile(4.5);
    if (!stool) return false;
    this.petStool(stool.tx, stool.ty);
    return true;
  }

  public petStool(tx: number, ty: number): void {
    this.stoolPetted = true;
    sound.playPurr();
    const wx = (tx + 0.5) * TILE_SIZE;
    const wy = ty * TILE_SIZE;
    this.spawnBurst(wx, wy, '#f472b6', 12, 110);
    this.spawnFloatingText(wx, wy - 8, this.t('♥ Purr!', '♥ Мур!'), '#f9a8d4');
    this.stoolSpeech = {
      stage: 'petted',
      text: this.t('Right-click me', 'Нажми на меня ПКМ'),
      timer: 14,
    };
    this.showToast(
      this.t('Stool purrs: "Right-click me"', 'Табуретка мурлычет: «Нажми на меня ПКМ»'),
    );
    this.emitHud(true);
  }

  public interactStoolRightClick(tx: number, ty: number): void {
    const wx = (tx + 0.5) * TILE_SIZE;
    const wy = ty * TILE_SIZE;
    if (!this.stoolPetted) {
      this.showToast(
        this.t('Pet the stool first! (LMB or F nearby)', 'Сначала погладь табуретку! (ЛКМ или F рядом)'),
      );
      this.spawnFloatingText(wx, wy - 8, this.t('Pet me!', 'Погладь меня!'), '#fde047');
      this.emitHud(true);
      return;
    }

    this.copyToClipboard(STOOL_REPO_URL);
    sound.playStoolCopy();
    this.spawnBurst(wx, wy, '#34d399', 16, 150);
    this.spawnFloatingText(wx, wy - 10, this.t('Copied!', 'Скопировано!'), '#6ee7b7');
    this.stoolSpeech = {
      stage: 'copied',
      text: this.t('Paste in browser', 'Вставь это в браузер'),
      hint: this.t('Tip: press Ctrl+V in your browser', 'Подсказка: нажми Ctrl+V в браузере'),
      copiedUrl: STOOL_REPO_URL,
      timer: 25,
    };
    this.showToast(
      this.t('Stool: "Paste in browser" — URL copied!', 'Табуретка: «Вставь это в браузер» — ссылка скопирована!'),
    );
    this.emitHud(true);
  }

  public dismissStoolSpeech(): void {
    this.stoolSpeech = null;
    this.emitHud(true);
  }

  public copyStoolUrlAgain(): void {
    this.copyToClipboard(STOOL_REPO_URL);
    sound.playStoolCopy();
    this.showToast(this.t('Link copied again! Press Ctrl+V in your browser.', 'Ссылка снова скопирована! Нажми Ctrl+V в браузере.'));
    this.emitHud(true);
  }

  // === DEBUG MENU ACTIONS ===
  public setGodMode(enabled: boolean): void {
    this.godMode = enabled;
    if (enabled) {
      const bonuses = computeEquipmentBonuses(this.equipment);
      this.player.hp = this.player.maxHp;
      this.player.mana = this.player.maxMana + bonuses.maxManaBonus;
    }
    this.showToast(enabled ? this.t('Debug: God Mode ON', 'Дебаг: Режим бога ВКЛ') : this.t('Debug: God Mode OFF', 'Дебаг: Режим бога ВЫКЛ'));
    this.emitHud(true);
  }

  public restoreVitals(): void {
    const bonuses = computeEquipmentBonuses(this.equipment);
    this.player.hp = this.player.maxHp;
    this.player.mana = this.player.maxMana + bonuses.maxManaBonus;
    sound.playHeal();
    this.showToast(this.t('Debug: HP & Mana restored', 'Дебаг: HP и Мана восстановлены'));
    this.emitHud(true);
  }

  public setTimePreset(preset: 'morning' | 'noon' | 'evening' | 'night'): void {
    this.timeOfDay =
      preset === 'morning'
        ? 0.14
        : preset === 'noon'
          ? 0.25
          : preset === 'evening'
            ? 0.52
            : 0.72;
    this.lastWasNight = this.timeOfDay >= 0.55 || this.timeOfDay < 0.08;
    recomputeLighting(this.world, this.timeOfDay);
    this.syncMusicTheme();
    this.showToast(
      preset === 'morning'
        ? this.t('Debug: Morning set', 'Дебаг: Установлено утро')
        : preset === 'noon'
          ? this.t('Debug: Noon set', 'Дебаг: Установлен полдень')
          : preset === 'evening'
            ? this.t('Debug: Evening set', 'Дебаг: Установлен вечер')
            : this.t('Debug: Night set', 'Дебаг: Наступила ночь'),
    );
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
  }

  public giveDebugItem(itemId: string, count: number): void {
    const res = applyGiveDebugItem(this.hotbar, this.backpack, itemId, count, this.lang);
    if (!ITEMS[itemId]) {
      this.showToast(this.t(`Debug: Item "${itemId}" not found`, `Дебаг: Предмет "${itemId}" не найден`));
      this.emitHud(true);
      return;
    }
    if (res.given <= 0) {
      this.showToast(this.t('Debug: Inventory is full!', 'Дебаг: Инвентарь переполнен!'));
      this.emitHud(true);
      return;
    }
    sound.playPickup();
    this.syncActiveWeapon();
    this.showToast(
      res.leftover > 0
        ? this.t(
            `Debug: Gave ${res.itemName} ×${res.given} (${res.leftover} overflow)`,
            `Дебаг: Выдано ${res.itemName} ×${res.given} (остаток ${res.leftover} не влез)`,
          )
        : this.t(`Debug: Gave ${res.itemName} ×${res.given}`, `Дебаг: Выдано ${res.itemName} ×${res.given}`),
    );
    this.emitHud(true);
  }

  public giveDebugChest(
    preset: DebugChestPreset,
    mode: 'inventory' | 'place' | 'place_and_open',
  ): void {
    if (mode === 'inventory') {
      const res = applyGiveDebugItem(this.hotbar, this.backpack, 'chest_item', 1, this.lang);
      if (res.given <= 0) {
        this.showToast(this.t('Debug: Inventory is full!', 'Дебаг: Инвентарь переполнен!'));
      } else {
        sound.playPickup();
        this.syncActiveWeapon();
        this.showToast(this.t('Debug: Chest added to inventory!', 'Дебаг: Сундук добавлен в инвентарь!'));
      }
      this.emitHud(true);
      return;
    }

    const placed = placeDebugChestNearPlayer(this.world, this.player, preset);
    if (!placed.placed) {
      this.showToast(this.t('Debug: No open tile nearby for chest!', 'Дебаг: Рядом нет свободного места для сундука!'));
      return;
    }

    this.stats.blocksPlaced++;
    recomputeLightingLocal(this.world, this.timeOfDay, placed.tx, placed.ty);
    sound.playPlace();
    this.spawnBurst(
      (placed.tx + 0.5) * TILE_SIZE,
      (placed.ty + 0.5) * TILE_SIZE,
      '#facc15',
      14,
      150,
    );
    const presetMeta = getChestPresetInfo(preset, this.lang);
    this.showToast(
      this.t(
        `Debug: Placed "${presetMeta.label}" (${placed.tx}, ${placed.ty})`,
        `Дебаг: Поставлен «${presetMeta.label}» (${placed.tx}, ${placed.ty})`,
      ),
    );

    if (mode === 'place_and_open') {
      this.openChest(placed.tx, placed.ty);
    } else {
      this.emitHud(true);
    }
    if (this.uiModalOpen) {
      this.render();
    }
  }

  public addDebugCoins(delta: number): void {
    this.player.coins = Math.max(0, this.player.coins + delta);
    sound.playCoin();
    this.showToast(this.t(`Debug: Coins now ${this.player.coins}`, `Дебаг: Монет теперь ${this.player.coins}`));
    this.emitHud(true);
  }

  public resetDebugCoins(): void {
    this.player.coins = 0;
    this.showToast(this.t('Debug: Coins reset to 0', 'Дебаг: Монеты сброшены до 0'));
    this.emitHud(true);
  }

  public boostMaxStats(hpDelta: number, manaDelta: number): void {
    if (hpDelta !== 0) {
      this.player.maxHp = Math.max(100, Math.min(400, this.player.maxHp + hpDelta));
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, hpDelta));
    }
    if (manaDelta !== 0) {
      this.player.maxMana = Math.max(60, Math.min(200, this.player.maxMana + manaDelta));
      this.player.mana = Math.min(this.player.maxMana, this.player.mana + Math.max(0, manaDelta));
    }
    sound.playStar();
    this.showToast(this.t(`Debug: Max HP ${this.player.maxHp}, Mana ${this.player.maxMana}`, `Дебаг: Макс. HP ${this.player.maxHp}, Мана ${this.player.maxMana}`));
    this.emitHud(true);
  }

  public buildDebugHouseHere(): void {
    const pcx = this.player.x + this.player.width / 2;
    const ptx = Math.floor(pcx / TILE_SIZE);
    const feetY = Math.round((this.player.y + this.player.height) / TILE_SIZE);
    const floorY = Math.max(8, Math.min(this.world.height - 3, feetY));
    const candidates = [
      Math.max(6, Math.min(this.world.width - 7, ptx + this.player.facing * 6)),
      Math.max(6, Math.min(this.world.width - 7, ptx - this.player.facing * 6)),
      Math.max(6, Math.min(this.world.width - 7, ptx)),
    ];

    let builtRes: ReturnType<typeof buildQuickHouseAt> | null = null;
    for (const anchorX of candidates) {
      const attempt = buildQuickHouseAt(this.world, anchorX, floorY, this.lang);
      if (attempt.built) {
        builtRes = attempt;
        break;
      }
      if (!builtRes) builtRes = attempt;
    }

    if (!builtRes || !builtRes.built) {
      this.showToast(builtRes?.reason ?? this.t('Debug: No space to build house nearby', 'Дебаг: Нет места для постройки дома рядом'));
      return;
    }

    this.stats.blocksPlaced += 16;
    recomputeLightingLocal(this.world, this.timeOfDay, builtRes.centerTileX, builtRes.centerTileY);
    sound.playCraft();
    sound.playPlace();
    this.spawnBurst(
      builtRes.centerTileX * TILE_SIZE,
      builtRes.centerTileY * TILE_SIZE,
      '#fde047',
      18,
      170,
    );
    const sync = syncVillageNpcs(
      this.npcs,
      this.world,
      () => this.nextEntityId++,
      this.player,
      this.stats.bossDefeated,
      false,
      this.lang,
    );
    this.validHouseCount = sync.validHouseCount;
    this.showToast(
      sync.spawnedNames.length > 0
        ? this.t(`Debug: House built! ${sync.spawnedNames[0]} arrived`, `Дебаг: Дом построен! Заселился ${sync.spawnedNames[0]}`)
        : this.t(`Debug: House built! (Houses: ${this.validHouseCount})`, `Дебаг: Дом построен! (Домов: ${this.validHouseCount})`),
    );
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
  }

  public giveDebugKit(
    kind: 'weapons' | 'armor' | 'resources' | 'stool' | 'summons' | 'terraria',
  ): void {
    if (kind === 'weapons') {
      const weaponIds = [
        'copper_sword',
        'ice_blade',
        'iron_broadsword',
        'crimson_katana',
        'gold_claymore',
        'enchanted_sword',
        'ruby_greatsword',
        'obsidian_nightblade',
        'starfury',
        'star_wrath',
        'terra_blade',
        'dawnbreaker_sword',
        'meowmere_blade',
        'zenith',
        'vampire_knives',
        'fish_spear',
        'copper_bow',
        'ice_bow',
        'gold_bow',
        'crimson_bow',
        'crystal_bow',
        'minishark',
        'megashark',
        'sdmg',
        'alien_blaster',
        'melon_blaster',
        'atomic_launcher',
        'fish_boomerang',
        'fire_staff',
        'frost_wand',
        'water_bolt',
        'demon_scythe',
        'pharaoh_staff',
        'jester_cards',
        'lollipop_wand',
        'laser_pointer',
        'yarn_bomb',
        'copper_pickaxe',
        'ice_pickaxe',
        'gold_pickaxe',
        'crimson_pickaxe',
        'obsidian_pickaxe',
        'lunar_pickaxe',
      ];
      for (const id of weaponIds) {
        addItemToInventory(this.hotbar, this.backpack, id, id === 'yarn_bomb' ? 25 : 1);
      }
      this.showToast(
        this.t(
          'Debug: Gave all pickaxes, swords, Zenith, bows, guns, and magic!',
          'Дебаг: Выданы все кирки, мечи, Зенит, луки, пушки и магия!',
        ),
      );
    } else if (kind === 'armor') {
      const armorAndAcc = [
        'molten_helmet',
        'molten_chestplate',
        'molten_greaves',
        'hallowed_helmet',
        'hallowed_chestplate',
        'hallowed_greaves',
        'crystal_helmet',
        'crystal_chestplate',
        'crystal_greaves',
        'angel_wings',
        'ankh_shield',
        'terraspark_boots',
        'cloud_in_bottle',
        'shiny_red_balloon',
        'mana_flower',
        'celestial_emblem',
        'band_of_regen',
      ];
      for (const id of armorAndAcc) {
        addItemToInventory(this.hotbar, this.backpack, id, 1);
      }
      this.showToast(
        this.t(
          'Debug: Gave Molten/Hallowed/Crystal armor, Angel Wings, Ankh Shield & Terraspark Boots!',
          'Дебаг: Выдана топ-броня, Крылья, Щит Анкха и Терра-ботинки!',
        ),
      );
    } else if (kind === 'terraria') {
      const terrariaItems: [string, number][] = [
        ['zenith', 1],
        ['star_wrath', 1],
        ['terra_blade', 1],
        ['meowmere_blade', 1],
        ['vampire_knives', 1],
        ['sdmg', 1],
        ['demon_scythe', 1],
        ['grappling_hook', 1],
        ['angel_wings', 1],
        ['ankh_shield', 1],
        ['terraspark_boots', 1],
        ['magic_mirror', 1],
        ['red_potion', 5],
        ['milk_potion', 5],
        ['ironskin_potion', 3],
        ['regen_potion', 3],
        ['life_crystal', 3],
        ['mana_crystal', 2],
        ['campfire_item', 2],
        ['heart_lantern_item', 2],
        ['sunflower_item', 2],
      ];
      for (const [id, cnt] of terrariaItems) {
        addItemToInventory(this.hotbar, this.backpack, id, cnt);
      }
      this.player.coins += 250;
      this.showToast(
        this.t('Debug: Gave legendary Terraria kit & +250 coins!', 'Дебаг: Выдан легендарный Терра-набор и +250 монет!'),
      );
    } else if (kind === 'resources') {
      const mats: [string, number][] = [
        ['planks_block', 99],
        ['wood_wall', 99],
        ['brick_block', 64],
        ['snow_brick', 64],
        ['crimson_brick', 64],
        ['marble_block', 64],
        ['sandstone_brick', 64],
        ['sandstone_wall', 64],
        ['cactus_block', 32],
        ['crystal_block', 32],
        ['obsidian_block', 32],
        ['torch_item', 50],
        ['table_item', 4],
        ['chair_item', 4],
        ['chandelier_item', 4],
        ['bookshelf_item', 2],
        ['house_blueprint', 2],
        ['copper_bar', 40],
        ['iron_bar', 40],
        ['gold_bar', 40],
        ['ruby_gem', 20],
        ['monster_bone', 30],
        ['slime_gel', 40],
        ['solar_fragment', 20],
        ['vortex_fragment', 20],
        ['nebula_fragment', 20],
        ['stardust_fragment', 20],
        ['workbench_item', 1],
        ['furnace_item', 1],
        ['anvil_item', 1],
        ['chest_item', 2],
      ];
      for (const [id, cnt] of mats) {
        addItemToInventory(this.hotbar, this.backpack, id, cnt);
      }
      this.showToast(
        this.t('Debug: Gave blocks, furniture, fragments & stations!', 'Дебаг: Выданы ресурсы, мебель, фрагменты и станции!'),
      );
    } else if (kind === 'summons') {
      const summons = [
        'summon_king_slime',
        'summon_kotulhu',
        'summon_cat_worm',
        'summon_brain_cthulhu',
        'summon_queen_bee',
        'summon_skele_cat',
        'summon_eye_boss',
        'summon_deerclops',
        'summon_wall_of_flesh',
        'summon_queen_slime',
        'summon_twins',
        'summon_destroyer',
        'summon_skeletron_prime',
        'summon_plantera',
        'summon_golem',
        'summon_duke_fishron',
        'summon_empress_light',
        'summon_cultist',
        'summon_pillars',
        'summon_moon_lord',
        'summon_pharaoh_cat',
        'summon_jester_cat',
        'summon_sun_cat',
        'summon_atomic_cat',
        'summon_party_cat',
        'summon_melon_bandit',
        'summon_alien_invasion',
      ];
      for (const id of summons) {
        addItemToInventory(this.hotbar, this.backpack, id, 2);
      }
      this.showToast(
        this.t(
          'Debug: Gave all Boss, Cat Boss, Pillar & Alien summons!',
          'Дебаг: Выданы призывалки всех боссов, котов, башен и инопланетян!',
        ),
      );
    } else {
      addItemToInventory(this.hotbar, this.backpack, 'stool_item', 1);
      this.showToast(this.t('Debug: Stool added to inventory!', 'Дебаг: Табуретка добавлена в инвентарь!'));
    }
    this.syncActiveWeapon();
    this.emitHud(true);
  }

  public inviteAllNpcs(): void {
    const sync = syncVillageNpcs(
      this.npcs,
      this.world,
      () => this.nextEntityId++,
      this.player,
      true,
      true,
      this.lang,
    );
    this.validHouseCount = sync.validHouseCount;
    sound.playNpcTalk();
    this.showToast(
      this.t(
        'All 6 villagers (Guide, Merchant, Nurse, Demolitionist, Dryad, Director Meow) arrived!',
        'Все 6 жителей (Гид, Торговец, Медсестра, Подрывник, Дриада, Директор Зазу) прибыли!',
      ),
    );
    this.emitHud(true);
  }

  public spawnDebugEnemy(kind: EnemyKind): void {
    if (isBossKind(kind)) {
      this.summonBoss(kind, false);
      return;
    }
    const enemy = createEnemy(
      this.nextEntityId++,
      kind,
      this.player.x + 170 * this.player.facing,
      this.player.y - (kind.includes('bat') || kind === 'pixie' || kind === 'alien_drone' ? 120 : 20),
      1 + (this.dayCount - 1) * 0.15,
      this.lang,
    );
    this.enemies.push(enemy);
    const enemyName = getEnemyName(enemy, this.lang);
    this.showToast(this.t(`Debug: Spawned ${enemyName}`, `Дебаг: Призван ${enemyName}`));
    this.emitHud(true);
  }

  public clearAllEnemies(): void {
    this.enemies = [];
    this.projectiles = this.projectiles.filter((p) => p.fromPlayer);
    this.lunarEvent.active = false;
    this.alienInvasion.active = false;
    this.showToast(this.t('Debug: All enemies & events cleared', 'Дебаг: Все враги и события убраны'));
    this.emitHud(true);
  }

  public teleportToSpawn(): void {
    this.player.x = this.player.spawnX;
    this.player.y = this.player.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.centerCameraImmediate();
    this.showToast(this.t('Debug: Teleported to spawn', 'Дебаг: Телепорт на спавн'));
    this.emitHud(true);
  }

  public teleportToCoords(tileX: number, tileY: number): void {
    const clampedTx = Math.max(
      2,
      Math.min(this.world.width - 3, Math.round(Number.isFinite(tileX) ? tileX : Math.floor(this.world.width / 2))),
    );
    const resolvedY =
      tileY < 0
        ? Math.max(4, (this.world.surfaceHeights[clampedTx] ?? 70) - 2)
        : tileY;
    const dest = teleportPlayerToCoords(this.player, this.world, clampedTx, resolvedY);
    this.player.vy = 0;
    this.centerCameraImmediate();
    const biome = getBiomeAtX(dest.tx, this.world.width);
    this.showToast(
      this.t(
        `Teleport: X=${dest.tx}, Y=${dest.ty} (${getBiomeName(biome, 'en')})`,
        `Телепорт: X=${dest.tx}, Y=${dest.ty} (${getBiomeName(biome, 'ru')})`,
      ),
    );
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
  }

  public boostDefense(delta: number): void {
    this.player.defense = Math.max(0, Math.min(50, this.player.defense + delta));
    this.showToast(this.t(`Debug: Defense is now ${this.player.defense}`, `Дебаг: Броня теперь ${this.player.defense}`));
    this.emitHud(true);
  }

  private spawnParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size = 4,
    life = 0.45,
    gravity = 320,
  ): void {
    if (!this.settings.particlesEnabled) return;
    const p = this.particles[this.particleCursor];
    this.particleCursor = (this.particleCursor + 1) % PARTICLE_POOL_SIZE;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.size = size;
    p.life = life;
    p.maxLife = life;
    p.gravity = gravity;
  }

  private spawnBurst(x: number, y: number, color: string, count: number, speed = 150): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.35 + Math.random() * 0.8);
      this.spawnParticle(
        x,
        y,
        Math.cos(a) * sp,
        Math.sin(a) * sp - 40,
        color,
        3 + Math.random() * 3,
        0.3 + Math.random() * 0.35,
      );
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string): void {
    this.floatingTexts.push({
      id: this.nextEntityId++,
      x,
      y,
      vy: -42,
      text,
      color,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  private loop = (now: number): void => {
    this.rafId = null;
    if (this.phase !== 'title' && (this.phase !== 'playing' || this.shouldPauseSimulation())) {
      return;
    }

    const rawDt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    if (this.phase === 'title') {
      this.stepTitleTour(dt);
    } else {
      this.stepSimulation(dt);
    }

    if (now - this.lastRenderTime >= 32) {
      this.lastRenderTime = now;
      this.render();
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private stepTitleTour(dt: number): void {
    this.elapsed += dt;
    // Gentle parallax camera drift over spawn meadow
    const centerWorldX = (this.world.width / 2) * TILE_SIZE;
    const baseY = (this.world.surfaceHeights[Math.floor(this.world.width / 2)] - 10) * TILE_SIZE;
    if (this.canvas) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const viewW = this.canvas.width / dpr;
      const viewH = this.canvas.height / dpr;
      this.cameraX = centerWorldX - viewW / 2 + Math.sin(this.elapsed * 0.25) * 160;
      this.cameraY = baseY - viewH * 0.35;
    }
    // Keep cat idling on ground safely
    stepPlayerPhysics(
      this.player,
      this.world,
      { left: false, right: false, up: false, down: false, jumpHeld: false, jumpJustPressed: false },
      dt,
    );
  }

  private stepSimulation(dt: number): void {
    this.elapsed += dt;

    // Trauma & hit-flash decay even during hitstop
    this.trauma = Math.max(0, this.trauma - dt * 1.9);
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.toastMessage = null;
        this.emitHud();
      }
    }
    if (this.stoolSpeech) {
      this.stoolSpeech.timer -= dt;
      if (this.stoolSpeech.timer <= 0) {
        this.stoolSpeech = null;
        this.emitHud();
      }
    }
    const equipBonuses = computeEquipmentBonuses(this.equipment);
    if (this.godMode) {
      this.player.hp = this.player.maxHp;
      this.player.mana = this.player.maxMana + equipBonuses.maxManaBonus;
    }

    // Update particles & floating text in real dt
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Day/night progression
    const prevTime = this.timeOfDay;
    this.timeOfDay = (this.timeOfDay + dt / DAY_DURATION_SEC) % 1;
    if (this.timeOfDay < prevTime) {
      this.dayCount++;
      this.stats.daysSurvived = this.dayCount;
      this.showToast(this.t(`Day ${this.dayCount} has begun!`, `Наступил день ${this.dayCount}!`));
    }

    // Update lighting periodically (local around player; full refresh on day/night transition)
    const isNightCycle = this.timeOfDay >= 0.55 || this.timeOfDay < 0.08;
    this.lightUpdateTimer -= dt;
    if (isNightCycle !== this.lastWasNight) {
      this.lastWasNight = isNightCycle;
      recomputeLighting(this.world, this.timeOfDay);
      this.lightUpdateTimer = 0.6;
    } else if (this.lightUpdateTimer <= 0) {
      const ptx = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
      const pty = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);
      recomputeLightingLocal(this.world, this.timeOfDay, ptx, pty, 36);
      this.lightUpdateTimer = 0.6;
    }

    // Check house validity periodically
    this.houseCheckTimer -= dt;
    if (this.houseCheckTimer <= 0) {
      const wasValid = this.player.houseValid;
      this.player.houseValid = isInsideValidHouse(
        this.world,
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
      );
      if (this.player.houseValid && !wasValid) {
        this.showToast(
          this.t(
            'Cozy home verified! Health regenerates indoors.',
            'Уютный дом построен! Здоровье восстанавливается.',
          ),
        );
      }
      this.houseCheckTimer = 0.8;
    }

    if (this.player.houseValid && this.player.hp < this.player.maxHp) {
      this.houseRegenTimer += dt;
      if (this.houseRegenTimer >= 1.0) {
        this.houseRegenTimer = 0;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 3);
      }
    }

    // Tick active buffs/debuffs & nearby Terraria tile auras (Campfire, Heart Lantern, Sunflower)
    stepActiveEffects(this.player.effects, dt);
    const fxMods = computeEffectModifiers(this.player.effects);
    const fireImmune = Boolean(equipBonuses.hasFireImmune || fxMods.fireImmune);
    if (fireImmune) {
      const fireIdx = this.player.effects.findIndex((e) => e.id === 'on_fire');
      if (fireIdx !== -1) this.player.effects.splice(fireIdx, 1);
    }

    const ptxNow = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const ptyNow = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);
    let hasCampfire = false;
    let hasHeartLantern = false;
    let hasSunflower = false;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -7; dx <= 7; dx++) {
        const t = getTile(this.world, ptxNow + dx, ptyNow + dy);
        if (t === TileType.Campfire) hasCampfire = true;
        else if (t === TileType.HeartLantern) hasHeartLantern = true;
        else if (t === TileType.Sunflower) hasSunflower = true;
      }
    }

    const totalFxRegen =
      fxMods.hpRegenPerSec + (hasCampfire ? 1.5 : 0) + (hasHeartLantern ? 2.0 : 0);
    if (totalFxRegen > 0 && this.player.hp < this.player.maxHp) {
      this.effectRegenTimer += dt * totalFxRegen;
      if (this.effectRegenTimer >= 1) {
        const heal = Math.floor(this.effectRegenTimer);
        this.effectRegenTimer -= heal;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      }
    }

    if (fxMods.hpDotPerSec > 0 && !this.godMode) {
      this.effectDotTimer += dt * fxMods.hpDotPerSec;
      if (this.effectDotTimer >= 1) {
        const dotDmg = Math.floor(this.effectDotTimer);
        this.effectDotTimer -= dotDmg;
        this.player.hp = Math.max(0, this.player.hp - dotDmg);
        this.spawnFloatingText(
          this.player.x + this.player.width / 2,
          this.player.y - 10,
          `-${dotDmg}`,
          '#f97316',
        );
        if (this.player.hp <= 0) {
          this.setPhase('gameover');
          return;
        }
      }
    }

    if (fxMods.hasShine) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const lx = ptxNow + dx;
          const ly = ptyNow + dy;
          if (lx >= 0 && lx < this.world.width && ly >= 0 && ly < this.world.height) {
            const dist = Math.hypot(dx, dy);
            if (dist <= 4.5) {
              const idx = tileIndex(lx, ly, this.world.width);
              const shineVal = Math.max(0.25, 1.0 - dist * 0.16);
              if (shineVal > this.world.light[idx]) {
                this.world.light[idx] = shineVal;
              }
            }
          }
        }
      }
    }

    // Periodic autosave to active slot (or autosave slot)
    this.autoSaveTimer -= dt;
    if (this.autoSaveTimer <= 0) {
      this.autoSaveTimer = 25;
      this.saveCurrentWorld(this.activeSaveId ?? 'autosave_slot', true);
    }

    // Equipped armor & accessory bonuses
    if (equipBonuses.hpRegenPerSec > 0 && this.player.hp < this.player.maxHp) {
      this.regenAccessoryTimer += dt * equipBonuses.hpRegenPerSec;
      if (this.regenAccessoryTimer >= 1) {
        const heal = Math.floor(this.regenAccessoryTimer);
        this.regenAccessoryTimer -= heal;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      }
    }

    // Player movement
    const input: InputIntent = {
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft'),
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight'),
      up: this.keys.has('KeyW') || this.keys.has('ArrowUp'),
      down: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      jumpHeld: this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp'),
      jumpJustPressed: this.jumpJustPressed,
    };
    this.jumpJustPressed = false;

    // Auto-open closed doors when walking straight up against them (Terraria Smart Doors)
    if (input.left !== input.right) {
      const dir = (input.right ? 1 : -1) * (fxMods.invertHorizontal ? -1 : 1);
      const frontX = dir > 0 ? this.player.x + this.player.width + 6 : this.player.x - 6;
      const frontTx = Math.floor(frontX / TILE_SIZE);
      const topTy = Math.floor((this.player.y + 6) / TILE_SIZE);
      const botTy = Math.floor((this.player.y + this.player.height - 4) / TILE_SIZE);
      for (let ty = topTy; ty <= botTy; ty++) {
        if (getTile(this.world, frontTx, ty) === TileType.DoorClosed) {
          const opened = toggleDoorAtTile(this.world, this.player, frontTx, ty);
          if (opened.toggled) {
            sound.playPlace();
            recomputeLightingLocal(this.world, this.timeOfDay, frontTx, ty);
            this.emitHud();
          }
          break;
        }
      }
    }

    const preStepVy = this.player.vy;
    const { jumped, doubleJumped, landed, flying } = stepPlayerPhysics(
      this.player,
      this.world,
      input,
      dt,
      {
        speedMult: equipBonuses.speedMult * fxMods.speedMult * (hasSunflower ? 1.1 : 1),
        jumpMult: equipBonuses.jumpMult,
        hasDoubleJump: equipBonuses.hasDoubleJump,
        hasWings: equipBonuses.hasWings,
        manaRegenBonus: equipBonuses.manaRegenBonus + fxMods.manaRegenBonus,
        gravityMult: fxMods.gravityMult,
        invertHorizontal: fxMods.invertHorizontal,
      },
    );
    const effectiveMaxMana = this.player.maxMana + equipBonuses.maxManaBonus;
    if (
      equipBonuses.maxManaBonus > 0 &&
      this.player.mana >= this.player.maxMana &&
      this.player.mana < effectiveMaxMana
    ) {
      const manaRate = (this.player.houseValid ? 8 : 5) + equipBonuses.manaRegenBonus + fxMods.manaRegenBonus;
      this.player.mana = Math.min(effectiveMaxMana, this.player.mana + manaRate * dt);
    }

    if (jumped) {
      sound.playJump();
      this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#d6d3d1', 5, 80);
    }
    if (doubleJumped) {
      sound.playJump();
      this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#f8fafc', 11, 135);
    }
    if (flying && Math.random() < 0.45) {
      this.spawnParticle(
        this.player.x + this.player.width / 2 - this.player.facing * 8,
        this.player.y + this.player.height * 0.65,
        -this.player.facing * 45 + (Math.random() - 0.5) * 30,
        65,
        '#bae6fd',
        3.2,
        0.28,
        80,
      );
    }
    if (landed) {
      this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#a8a29e', 4, 60);
      if (!equipBonuses.hasNoFallDamage && !fxMods.noFallDamage && !this.godMode && preStepVy > 590) {
        const fallDmg = Math.round((preStepVy - 560) * 0.14);
        if (fallDmg > 0) {
          this.damagePlayer(fallDmg, 0);
        }
      }
    }

    // Smooth camera follow clamped to world bounds
    if (this.canvas) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const viewW = this.canvas.width / dpr;
      const viewH = this.canvas.height / dpr;
      const targetCamX = this.player.x + this.player.width / 2 - viewW / 2;
      const targetCamY = this.player.y + this.player.height / 2 - viewH / 2;
      const damp = Math.min(1, dt * 8);
      this.cameraX += (targetCamX - this.cameraX) * damp;
      this.cameraY += (targetCamY - this.cameraY) * damp;
      this.cameraX = Math.max(0, Math.min(this.world.width * TILE_SIZE - viewW, this.cameraX));
      this.cameraY = Math.max(0, Math.min(this.world.height * TILE_SIZE - viewH, this.cameraY));
    }

    // Active mouse actions (Attack / Mine / Place / Consume)
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.placeCooldown = Math.max(0, this.placeCooldown - dt);
    this.handleActivePointerActions();

    // Update projectiles
    this.stepProjectiles(dt);

    // Spawn & update enemies
    this.stepEnemySpawning(dt);
    this.stepEnemies(dt);

    // Sync & update friendly village NPCs
    const isNightNow = this.timeOfDay >= 0.55 || this.timeOfDay < 0.08;
    this.npcSyncTimer -= dt;
    if (this.npcSyncTimer <= 0) {
      this.npcSyncTimer = 1.6;
      const sync = syncVillageNpcs(
        this.npcs,
        this.world,
        () => this.nextEntityId++,
        this.player,
        this.stats.bossDefeated,
        false,
        this.lang,
      );
      this.validHouseCount = sync.validHouseCount;
      if (sync.spawnedNames.length > 0) {
        this.showToast(
          this.t(
            `New villager arrived: ${sync.spawnedNames[0]}!`,
            `В деревню поселился житель: ${sync.spawnedNames[0]}!`,
          ),
        );
        sound.playNpcTalk();
      }
    }
    for (const npc of this.npcs) {
      const npcRes = stepNpcAI(npc, this.world, this.player, this.enemies, isNightNow, dt);
      if (npcRes.shootAt) {
        const ncx = npc.x + npc.width / 2;
        const ncy = npc.y + npc.height * 0.42;
        const ang = Math.atan2(npcRes.shootAt.targetY - ncy, npcRes.shootAt.targetX - ncx);
        const speed = 520;
        this.projectiles.push({
          id: this.nextEntityId++,
          fromPlayer: true,
          kind: npc.kind === 'guide' ? 'arrow' : 'fireball',
          x: ncx,
          y: ncy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          radius: 5,
          damage: 14,
          knockback: 3.5,
          life: 1.4,
          maxLife: 1.4,
          pierceLeft: 1,
          aoeRadius: 0,
          color: npcRes.shootAt.color,
          hitIds: [],
        });
      }
    }

    // Nighttime Terraria Fallen Stars
    if (isNightNow) {
      this.starFallTimer -= dt;
      if (this.starFallTimer <= 0) {
        this.starFallTimer = 13 + Math.random() * 8;
        const starWx = Math.max(
          4 * TILE_SIZE,
          Math.min((this.world.width - 4) * TILE_SIZE, this.player.x + (Math.random() - 0.5) * 700),
        );
        const stx = Math.floor(starWx / TILE_SIZE);
        const sty = Math.max(4, this.world.surfaceHeights[stx] - 10);
        this.drops.push({
          id: this.nextEntityId++,
          itemId: 'fallen_star',
          count: 1,
          x: starWx,
          y: sty * TILE_SIZE,
          vx: (Math.random() - 0.5) * 90,
          vy: 140,
          life: 65,
          pickupDelay: 0.25,
        });
        this.spawnBurst(starWx, sty * TILE_SIZE, '#fde047', 10, 120);
        sound.playStar();
      }
    }

    // Update drops & magnet pickup
    this.stepDrops(dt);

    // Sync adaptive Terraria-style music theme
    this.syncMusicTheme();

    // Emit throttled HUD snapshot
    this.hudEmitTimer -= dt;
    if (this.hudEmitTimer <= 0) {
      this.hudEmitTimer = 0.12;
      this.emitHud();
    }
  }

  private getHoverWorldTile(): { tx: number; ty: number; wx: number; wy: number; inRange: boolean } {
    const wx = this.cameraX + this.mouseScreenX;
    const wy = this.cameraY + this.mouseScreenY;
    const tx = Math.floor(wx / TILE_SIZE);
    const ty = Math.floor(wy / TILE_SIZE);
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const inRange = Math.hypot((tx + 0.5) * TILE_SIZE - pcx, (ty + 0.5) * TILE_SIZE - pcy) <= 6.2 * TILE_SIZE;
    return { tx, ty, wx, wy, inRange };
  }

  private handleActivePointerActions(): void {
    const slot = this.hotbar[this.selectedSlot];
    const item = slot ? ITEMS[slot.itemId] : null;
    const { tx, ty, wx, wy, inRange } = this.getHoverWorldTile();
    const hoverTile = inRange ? getTile(this.world, tx, ty) : TileType.Air;

    const leftActive = this.mouseLeftDown || this.mouseLeftQueued;
    const rightActive = this.mouseRightDown || this.mouseRightQueued;
    if (this.attackCooldown <= 0 || this.activeToolMode === 'build') {
      this.mouseLeftQueued = false;
    }
    if (this.placeCooldown <= 0) {
      this.mouseRightQueued = false;
    }

    const wantPlace = rightActive || (leftActive && this.activeToolMode === 'build');
    const wantPrimary = leftActive && this.activeToolMode !== 'build';

    // Right-clicking (or Build-mode LMB on) a door, chest, stool, bed, or NPC works regardless of held item
    if (rightActive && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Chest) {
      this.openChest(tx, ty);
      this.placeCooldown = 0.35;
      return;
    }
    if (rightActive && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Stool) {
      this.interactStoolRightClick(tx, ty);
      this.placeCooldown = 0.35;
      return;
    }
    if (
      wantPlace &&
      this.placeCooldown <= 0 &&
      inRange &&
      (hoverTile === TileType.DoorClosed || hoverTile === TileType.DoorOpen)
    ) {
      const doorRes = toggleDoorAtTile(this.world, this.player, tx, ty);
      if (doorRes.toggled) {
        sound.playPlace();
        recomputeLightingLocal(this.world, this.timeOfDay, tx, ty);
        this.emitHud();
      } else if (doorRes.blockedByPlayer) {
        this.showToast(this.t('Step away from doorway to close the door!', 'Отойди от проёма, чтобы закрыть дверь!'));
        this.emitHud();
      }
      this.placeCooldown = 0.25;
      return;
    }
    if (rightActive && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Bed) {
      this.player.spawnX = tx * TILE_SIZE + 2;
      this.player.spawnY = ty * TILE_SIZE - this.player.height - 2;
      sound.playHeal();
      this.showToast(this.t('Spawn point set at bed!', 'Точка возрождения установлена на лежанку!'));
      this.placeCooldown = 0.4;
      return;
    }
    if (rightActive && this.placeCooldown <= 0) {
      const clickedNpc = this.findNpcAtPoint(wx, wy);
      if (clickedNpc) {
        this.openNpc(clickedNpc.id);
        this.placeCooldown = 0.35;
        return;
      }
    }

    if (wantPlace && this.placeCooldown <= 0) {
      if (item?.category === 'consumable') {
        this.useSelectedConsumable(tx, ty);
        this.placeCooldown = 0.3;
        return;
      }
      if (item?.category === 'summon') {
        if (item.specialKind === 'lunar_sigil') {
          this.spawnCelestialPillars(true);
          this.placeCooldown = 0.5;
          return;
        }
        if (item.specialKind === 'alien_probe') {
          this.startAlienInvasion(true);
          this.placeCooldown = 0.5;
          return;
        }
        if (item.summonsBoss) {
          this.summonBoss(item.summonsBoss, true);
          this.placeCooldown = 0.5;
          return;
        }
      }
      if (slot && item && (item.placesTile !== undefined || item.placesWall !== undefined)) {
        const res = tryPlaceItemAtTile(this.world, this.player, slot.itemId, tx, ty);
        if (res.placed) {
          slot.count--;
          if (slot.count <= 0) {
            this.hotbar[this.selectedSlot] = null;
            this.syncActiveWeapon();
          }
          this.stats.blocksPlaced++;
          sound.playPlace();
          this.spawnBurst((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, item.color, 6, 90);
          recomputeLightingLocal(this.world, this.timeOfDay, tx, ty);
          this.placeCooldown = 0.14;
          this.emitHud();
        } else if (res.action === 'door_toggle') {
          sound.playPlace();
          this.placeCooldown = 0.25;
        } else if (res.action === 'bed_spawn') {
          sound.playHeal();
          this.showToast(this.t('Spawn point set at bed!', 'Точка возрождения установлена на лежанку!'));
          this.placeCooldown = 0.4;
        } else if (res.action === 'stool_interact') {
          this.interactStoolRightClick(tx, ty);
          this.placeCooldown = 0.35;
        } else if (res.action === 'chest_open') {
          this.openChest(tx, ty);
          this.placeCooldown = 0.35;
        }
        return;
      }
    }

    // Left-clicking a stool with anything other than a pickaxe pets it!
    if (wantPrimary && this.attackCooldown <= 0 && inRange && hoverTile === TileType.Stool && item?.category !== 'tool') {
      this.petStool(tx, ty);
      this.attackCooldown = 0.35;
      return;
    }

    if (wantPrimary && this.attackCooldown <= 0) {
      if (!item) return;

      if (item.category === 'consumable') {
        this.useSelectedConsumable(tx, ty);
        this.attackCooldown = 0.35;
        return;
      }

      if (item.category === 'summon') {
        if (item.specialKind === 'lunar_sigil') {
          this.spawnCelestialPillars(true);
          this.attackCooldown = 0.5;
          return;
        }
        if (item.specialKind === 'alien_probe') {
          this.startAlienInvasion(true);
          this.attackCooldown = 0.5;
          return;
        }
        if (item.summonsBoss) {
          this.summonBoss(item.summonsBoss, true);
          this.attackCooldown = 0.5;
          return;
        }
      }

      if (item.category === 'tool') {
        if (inRange) {
          const res = tryDamageTile(this.world, this.tileDamageMap, tx, ty, item.pickPower ?? 1);
          const tileX = (tx + 0.5) * TILE_SIZE;
          const tileY = (ty + 0.5) * TILE_SIZE;
          if (res.hitTile !== TileType.Air || res.broken) {
            if (res.broken) {
              this.stats.blocksMined++;
              if (res.hitTile === TileType.Pot) {
                this.spawnPotLootAt(tx, ty);
              } else {
                sound.playBlockBreak();
                this.spawnBurst(tileX, tileY, '#cbd5e1', 10, 140);
              }
              if (res.hitTile === TileType.Chest) {
                const idx = tileIndex(tx, ty, this.world.width);
                const chestItems = this.world.chests[idx] ?? [];
                for (const cSlot of chestItems) {
                  this.drops.push({
                    id: this.nextEntityId++,
                    itemId: cSlot.itemId,
                    count: cSlot.count,
                    x: tileX,
                    y: tileY,
                    vx: (Math.random() - 0.5) * 140,
                    vy: -175,
                    life: 60,
                    pickupDelay: 0.25,
                  });
                }
                delete this.world.chests[idx];
                if (this.activeChestCoords?.tx === tx && this.activeChestCoords?.ty === ty) {
                  this.activeChestCoords = null;
                }
              }
              if (res.droppedItemId) {
                this.drops.push({
                  id: this.nextEntityId++,
                  itemId: res.droppedItemId,
                  count: 1,
                  x: tileX,
                  y: tileY,
                  vx: (Math.random() - 0.5) * 90,
                  vy: -140,
                  life: 60,
                  pickupDelay: 0.18,
                });
              }
              recomputeLightingLocal(this.world, this.timeOfDay, tx, ty);
            } else {
              sound.playMineHit();
              this.spawnBurst(tileX, tileY, '#94a3b8', 4, 70);
            }
          }
        }
        this.triggerSwingAnimation(item.cooldown ?? 0.22, wx, wy);
        this.performMeleeHitbox(item.damage ?? 6, item.reach ?? 54, item.knockback ?? 3);
        this.attackCooldown = item.cooldown ?? 0.22;
        return;
      }

      if (item.category === 'weapon') {
        this.fireWeapon(item, slot!, wx, wy);
        return;
      }

      if (item.placesTile !== undefined || item.placesWall !== undefined) {
        const res = tryPlaceItemAtTile(this.world, this.player, item.id, tx, ty);
        if (res.placed) {
          slot!.count--;
          if (slot!.count <= 0) {
            this.hotbar[this.selectedSlot] = null;
            this.syncActiveWeapon();
          }
          this.stats.blocksPlaced++;
          sound.playPlace();
          recomputeLightingLocal(this.world, this.timeOfDay, tx, ty);
          this.attackCooldown = 0.14;
          this.emitHud();
        }
      }
    }
  }

  private triggerSwingAnimation(duration: number, targetWx: number, targetWy: number): void {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    this.player.facing = targetWx >= pcx ? 1 : -1;
    this.player.attackDuration = duration;
    this.player.attackTimer = duration;
    this.player.attackAngle = Math.atan2(targetWy - pcy, targetWx - pcx);
  }

  private fireWeapon(
    item: (typeof ITEMS)[string],
    slot: InventorySlot,
    targetWx: number,
    targetWy: number,
  ): void {
    const bonuses = computeEquipmentBonuses(this.equipment);
    const fxMods = computeEffectModifiers(this.player.effects);
    const manaCost = Math.max(0, Math.round((item.manaCost ?? 0) * bonuses.manaCostMult));
    if (manaCost > 0 && this.player.mana < manaCost) {
      this.showToast(this.t('Not enough mana!', 'Недостаточно маны!'));
      this.attackCooldown = 0.25;
      return;
    }

    const dmgScale = bonuses.damageMult * fxMods.damageMult;
    const scaledDamage = (base: number) => Math.max(1, Math.round(base * dmgScale));

    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2 - 4;
    const angle = Math.atan2(targetWy - pcy, targetWx - pcx);
    const cd = item.cooldown ?? 0.3;

    this.triggerSwingAnimation(cd, targetWx, targetWy);
    this.attackCooldown = cd;

    if (manaCost > 0) {
      this.player.mana = Math.max(0, this.player.mana - manaCost);
    }

    if (item.weaponKind === 'hook') {
      this.launchGrapplingHook(targetWx, targetWy);
      return;
    }

    if (item.weaponKind === 'melee' || item.weaponKind === 'spear') {
      sound.playSwing();
      this.performMeleeHitbox(scaledDamage(item.damage ?? 15), item.reach ?? 68, item.knockback ?? 5);

      if (item.id === 'zenith') {
        const bladePalette = [
          { color: '#22d3ee', accent: '#cffafe' },
          { color: '#f472b6', accent: '#fef08a' },
          { color: '#10b981', accent: '#a7f3d0' },
          { color: '#a855f7', accent: '#e9d5ff' },
          { color: '#f59e0b', accent: '#fde68a' },
        ];
        sound.playMagic();
        for (let b = 0; b < 3; b++) {
          const pal = bladePalette[(Math.floor(this.elapsed * 20) + b) % bladePalette.length];
          const spreadAng = angle + (b - 1) * 0.18;
          const bSpeed = 860 + b * 75;
          this.projectiles.push({
            id: this.nextEntityId++,
            fromPlayer: true,
            kind: 'zenith_blade',
            x: pcx,
            y: pcy,
            vx: Math.cos(spreadAng) * bSpeed,
            vy: Math.sin(spreadAng) * bSpeed,
            radius: 16,
            damage: scaledDamage(Math.round((item.damage ?? 190) * 0.85)),
            knockback: 7,
            life: 0.72,
            maxLife: 0.72,
            pierceLeft: 99,
            aoeRadius: 0,
            color: pal.color,
            accentColor: pal.accent,
            curveDir: b % 2 === 0 ? 1 : -1,
            returning: false,
            hitIds: [],
          });
        }
      } else if (item.id === 'star_wrath') {
        sound.playStar();
        for (let m = 0; m < 3; m++) {
          const startX = targetWx + (m - 1) * 70 - 80;
          const startY = targetWy - 420 - m * 45;
          const sAng = Math.atan2(targetWy - startY, targetWx + (m - 1) * 28 - startX);
          const sSpeed = 920;
          this.projectiles.push({
            id: this.nextEntityId++,
            fromPlayer: true,
            kind: 'star_wrath',
            x: startX,
            y: startY,
            vx: Math.cos(sAng) * sSpeed,
            vy: Math.sin(sAng) * sSpeed,
            radius: 13,
            damage: scaledDamage((item.damage ?? 118) + 18),
            knockback: 6,
            life: 1.15,
            maxLife: 1.15,
            pierceLeft: 4,
            aoeRadius: 0,
            color: '#ec4899',
            accentColor: '#fde047',
            hitIds: [],
          });
        }
      } else if (item.id === 'starfury') {
        const startX = targetWx + (Math.random() - 0.5) * 90 - 90;
        const startY = targetWy - 380;
        const sAng = Math.atan2(targetWy - startY, targetWx - startX);
        const sSpeed = 820;
        sound.playStar();
        this.projectiles.push({
          id: this.nextEntityId++,
          fromPlayer: true,
          kind: 'star_rain',
          x: startX,
          y: startY,
          vx: Math.cos(sAng) * sSpeed,
          vy: Math.sin(sAng) * sSpeed,
          radius: 12,
          damage: scaledDamage((item.damage ?? 34) + 12),
          knockback: 5,
          life: 1.1,
          maxLife: 1.1,
          pierceLeft: 3,
          aoeRadius: 0,
          color: '#fde047',
          hitIds: [],
        });
      } else if (
        item.id === 'terra_blade' ||
        item.id === 'dawnbreaker_sword' ||
        item.id === 'enchanted_sword'
      ) {
        const beamSpeed =
          item.id === 'dawnbreaker_sword' ? 680 : item.id === 'enchanted_sword' ? 540 : 620;
        sound.playMagic();
        this.projectiles.push({
          id: this.nextEntityId++,
          fromPlayer: true,
          kind: 'terra_beam',
          x: pcx,
          y: pcy,
          vx: Math.cos(angle) * beamSpeed,
          vy: Math.sin(angle) * beamSpeed,
          radius: item.id === 'enchanted_sword' ? 9 : 11,
          damage: scaledDamage(Math.round((item.damage ?? 58) * 0.9)),
          knockback: 5.5,
          life: 1.1,
          maxLife: 1.1,
          pierceLeft: item.id === 'enchanted_sword' ? 2 : 3,
          aoeRadius: 0,
          color:
            item.id === 'dawnbreaker_sword'
              ? '#f59e0b'
              : item.id === 'enchanted_sword'
                ? '#38bdf8'
                : '#10b981',
          hitIds: [],
        });
      } else if (item.id === 'meowmere_blade') {
        const boltSpeed = 620;
        sound.playStar();
        this.projectiles.push({
          id: this.nextEntityId++,
          fromPlayer: true,
          kind: 'rainbow_cat',
          x: pcx,
          y: pcy,
          vx: Math.cos(angle) * boltSpeed,
          vy: Math.sin(angle) * boltSpeed,
          radius: 11,
          damage: scaledDamage(Math.round((item.damage ?? 94) * 0.85)),
          knockback: 6,
          life: 2.4,
          maxLife: 2.4,
          pierceLeft: 5,
          bouncesLeft: 4,
          aoeRadius: 0,
          color: '#ec4899',
          accentColor: '#5eead4',
          hitIds: [],
        });
      }
      return;
    }

    const speed = item.projectileSpeed ?? 560;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    if (item.weaponKind === 'bow') {
      sound.playBow();
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: 'arrow',
        x: pcx,
        y: pcy,
        vx,
        vy,
        radius: 5,
        damage: scaledDamage(item.damage ?? 16),
        knockback: item.knockback ?? 3.5,
        life: 2.2,
        maxLife: 2.2,
        pierceLeft: item.pierce ?? 1,
        aoeRadius: 0,
        color: item.accent,
        hitIds: [],
      });
    } else if (item.weaponKind === 'gun') {
      sound.playLaser();
      const spread = (Math.random() - 0.5) * (item.id === 'sdmg' ? 0.04 : 0.08);
      const gAng = angle + spread;
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: 'bullet',
        x: pcx,
        y: pcy,
        vx: Math.cos(gAng) * speed,
        vy: Math.sin(gAng) * speed,
        radius: 4,
        damage: scaledDamage(item.damage ?? 14),
        knockback: item.knockback ?? 2,
        life: 1.3,
        maxLife: 1.3,
        pierceLeft: item.pierce ?? 1,
        aoeRadius: 0,
        color: item.id === 'sdmg' ? '#5eead4' : '#fde047',
        hitIds: [],
      });
    } else if (item.weaponKind === 'magic') {
      sound.playMagic();
      if (item.id === 'vampire_knives') {
        for (const offset of [-0.18, -0.06, 0.06, 0.18]) {
          const kAng = angle + offset;
          this.projectiles.push({
            id: this.nextEntityId++,
            fromPlayer: true,
            kind: 'vampire_knife',
            x: pcx,
            y: pcy,
            vx: Math.cos(kAng) * speed,
            vy: Math.sin(kAng) * speed,
            radius: 7,
            damage: scaledDamage(item.damage ?? 38),
            knockback: item.knockback ?? 3,
            life: 0.9,
            maxLife: 0.9,
            pierceLeft: item.pierce ?? 2,
            aoeRadius: 0,
            color: '#dc2626',
            accentColor: '#fca5a5',
            lifesteal: 0.1,
            hitIds: [],
          });
        }
        return;
      }
      if (item.id === 'demon_scythe') {
        for (const offset of [-0.1, 0.1]) {
          const sAng = angle + offset;
          this.projectiles.push({
            id: this.nextEntityId++,
            fromPlayer: true,
            kind: 'demon_scythe',
            x: pcx,
            y: pcy,
            vx: Math.cos(sAng) * speed,
            vy: Math.sin(sAng) * speed,
            radius: 11,
            damage: scaledDamage(item.damage ?? 42),
            knockback: item.knockback ?? 4.5,
            life: 1.9,
            maxLife: 1.9,
            pierceLeft: item.pierce ?? 5,
            aoeRadius: 0,
            color: '#9333ea',
            accentColor: '#e879f9',
            hitIds: [],
          });
        }
        return;
      }
      if (item.id === 'jester_cards') {
        for (const offset of [-0.14, 0, 0.14]) {
          const cAng = angle + offset;
          this.projectiles.push({
            id: this.nextEntityId++,
            fromPlayer: true,
            kind: 'stinger',
            x: pcx,
            y: pcy,
            vx: Math.cos(cAng) * speed,
            vy: Math.sin(cAng) * speed,
            radius: 7,
            damage: scaledDamage(item.damage ?? 44),
            knockback: item.knockback ?? 4,
            life: 1.8,
            maxLife: 1.8,
            pierceLeft: item.pierce ?? 3,
            aoeRadius: 0,
            color: offset === 0 ? '#a855f7' : offset < 0 ? '#ef4444' : '#38bdf8',
            hitIds: [],
          });
        }
        return;
      }
      const isWaterBolt = item.id === 'water_bolt';
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: isWaterBolt ? 'water_bolt' : item.id === 'frost_wand' ? 'frost_bolt' : 'fireball',
        x: pcx,
        y: pcy,
        vx,
        vy,
        radius: isWaterBolt ? 9 : 8,
        damage: scaledDamage(item.damage ?? 25),
        knockback: item.knockback ?? 4.5,
        life: isWaterBolt ? 3.0 : 1.8,
        maxLife: isWaterBolt ? 3.0 : 1.8,
        pierceLeft: item.pierce ?? 1,
        bouncesLeft: isWaterBolt ? 5 : 0,
        aoeRadius: item.aoeRadius ?? 0,
        color: item.color,
        hitIds: [],
      });
    } else if (item.weaponKind === 'laser') {
      sound.playLaser();
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: 'laser',
        x: pcx,
        y: pcy,
        vx,
        vy,
        radius: 5,
        damage: scaledDamage(item.damage ?? 17),
        knockback: item.knockback ?? 2,
        life: 0.75,
        maxLife: 0.75,
        pierceLeft: item.pierce ?? 2,
        aoeRadius: 0,
        color: item.color || '#ef4444',
        hitIds: [],
      });
    } else if (item.weaponKind === 'boomerang') {
      sound.playSwing();
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: 'boomerang',
        x: pcx,
        y: pcy,
        vx,
        vy,
        radius: 10,
        damage: scaledDamage(item.damage ?? 22),
        knockback: item.knockback ?? 5,
        life: 1.6,
        maxLife: 1.6,
        pierceLeft: item.pierce ?? 4,
        aoeRadius: 0,
        color: '#38bdf8',
        returning: false,
        hitIds: [],
      });
    } else if (item.weaponKind === 'bomb') {
      sound.playSwing();
      const isDynamite = item.id === 'dynamite';
      const isTerrariaBomb = item.id === 'terraria_bomb';
      const isAtomicLauncher = item.id === 'atomic_launcher';
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: isDynamite ? 'dynamite' : 'yarn_bomb',
        x: pcx,
        y: pcy,
        vx,
        vy: isAtomicLauncher ? vy : vy - 90,
        radius: isAtomicLauncher ? 12 : 9,
        damage: scaledDamage(item.damage ?? 42),
        knockback: item.knockback ?? 9,
        life: 1.4,
        maxLife: 1.4,
        pierceLeft: 1,
        aoeRadius: item.aoeRadius ?? 82,
        blastTiles: isDynamite ? 3.2 : isTerrariaBomb ? 2.1 : 0,
        color: item.color,
        hitIds: [],
      });
      if (!isAtomicLauncher) {
        slot.count--;
        if (slot.count <= 0) {
          this.hotbar[this.selectedSlot] = null;
          this.syncActiveWeapon();
          this.emitHud();
        }
      }
    }
  }

  private performMeleeHitbox(damage: number, reach: number, knockback: number): void {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const hitX = this.player.facing > 0 ? pcx - 10 : pcx - reach;
    const hitY = pcy - reach * 0.65;
    const hitW = reach + 10;
    const hitH = reach * 1.25;

    // Smash breakable cave pots within melee swing
    const tx0 = Math.floor(hitX / TILE_SIZE);
    const tx1 = Math.floor((hitX + hitW) / TILE_SIZE);
    const ty0 = Math.floor(hitY / TILE_SIZE);
    const ty1 = Math.floor((hitY + hitH) / TILE_SIZE);
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        if (getTile(this.world, tx, ty) === TileType.Pot) {
          this.breakPotAt(tx, ty);
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.aiState === 'ko') continue;
      if (rectsOverlap(hitX, hitY, hitW, hitH, enemy.x, enemy.y, enemy.width, enemy.height)) {
        this.damageEnemy(enemy, damage, this.player.facing * knockback * 48, -160);
      }
    }
  }

  private damageEnemy(enemy: EnemyEntity, rawDmg: number, kbX: number, kbY: number): void {
    const isShieldedPillar = isPillarKind(enemy.kind) && (enemy.shield ?? 0) > 0;
    const dmg = isShieldedPillar ? 1 : computeDamageAfterDefense(rawDmg, enemy.defense);
    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.06;
    if (!isPillarKind(enemy.kind)) {
      enemy.vx = kbX;
      enemy.vy = Math.min(enemy.vy, kbY);
    }

    const ex = enemy.x + enemy.width / 2;
    const ey = enemy.y + enemy.height / 2;
    this.spawnFloatingText(
      ex,
      enemy.y - 6,
      isShieldedPillar ? this.t('SHIELD 1', 'ЩИТ 1') : `${dmg}`,
      isShieldedPillar ? '#38bdf8' : '#fde047',
    );
    this.spawnBurst(ex, ey, isShieldedPillar ? '#38bdf8' : '#f87171', 12, 160);
    sound.playEnemyHit();
    this.trauma = Math.min(1, this.trauma + 0.25);

    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.aiState = 'ko';
      enemy.koTimer = 0.35;
      this.hitstopTimer = 0.045;
      this.trauma = Math.min(1, this.trauma + 0.45);
      this.stats.monstersKilled++;
      const coinReward = isBossKind(enemy.kind)
        ? 40 + Math.floor(Math.random() * 25)
        : 2 + Math.floor(Math.random() * 7);
      this.player.coins += coinReward;
      this.spawnFloatingText(ex, enemy.y - 20, this.t(`+${coinReward} coins`, `+${coinReward} монет`), '#facc15');
      sound.playCoin();

      // Pillar minion shield reduction
      const minionToPillar: Partial<Record<EnemyKind, EnemyKind>> = {
        solar_corite: 'solar_pillar',
        vortex_alien: 'vortex_pillar',
        nebula_floater: 'nebula_pillar',
        stardust_cell: 'stardust_pillar',
      };
      const linkedPillarKind = minionToPillar[enemy.kind];
      if (linkedPillarKind) {
        const pillar = this.enemies.find(
          (e) => e.kind === linkedPillarKind && e.aiState !== 'ko' && (e.shield ?? 0) > 0,
        );
        if (pillar) {
          pillar.shield = Math.max(0, (pillar.shield ?? 0) - 1);
          this.spawnBurst(pillar.x + pillar.width / 2, pillar.y + pillar.height / 2, '#38bdf8', 14, 180);
          if (pillar.shield === 0) {
            this.showToast(
              this.t(`${pillar.name}'s shield shattered!`, `Щит «${pillar.name}» разрушен!`),
            );
          }
        }
      }

      // Alien Invasion progression
      if (
        this.alienInvasion.active &&
        (enemy.kind === 'alien_cat' || enemy.kind === 'alien_drone' || enemy.kind === 'martian_saucer')
      ) {
        this.alienInvasion.defeated += enemy.kind === 'martian_saucer' ? 4 : 1;
        if (!this.alienInvasion.saucerSpawned && this.alienInvasion.defeated >= 12) {
          this.alienInvasion.saucerSpawned = true;
          this.summonBoss('martian_saucer', false);
        }
        if (this.alienInvasion.defeated >= this.alienInvasion.target) {
          this.alienInvasion.active = false;
          this.player.coins += 150;
          this.showToast(
            this.t('Alien Invasion repelled! +150 bonus coins!', 'Нашествие инопланетян отражено! +150 монет!'),
          );
          this.syncMusicTheme();
        }
      }

      if (isBossKind(enemy.kind)) {
        this.stats.bossDefeated = true;
        this.showToast(
          this.t(
            `${getEnemyName(enemy, 'en')} defeated! +${coinReward} coins & loot!`,
            `${getEnemyName(enemy, 'ru')} повержен! +${coinReward} монет и трофеи!`,
          ),
        );
        this.syncMusicTheme();

        if (enemy.kind === 'lunatic_cultist') {
          this.spawnCelestialPillars(false);
        } else if (isPillarKind(enemy.kind)) {
          const remainingPillars = this.enemies.filter(
            (e) => e.id !== enemy.id && isPillarKind(e.kind) && e.aiState !== 'ko',
          );
          if (remainingPillars.length === 0 && this.lunarEvent.active && !this.lunarEvent.moonLordSpawned) {
            this.lunarEvent.active = false;
            this.lunarEvent.moonLordSpawned = true;
            this.summonBoss('moon_lord', false);
            this.showToast(
              this.t(
                'All 4 Celestial Pillars destroyed! Moon Lord awakens!',
                'Все 4 Небесные Башни пали! Лунный Лорд пробудился!',
              ),
            );
          }
        }
      }

      this.spawnBurst(ex, ey, '#fb923c', 20, 210);
      for (const d of enemy.drops) {
        if (Math.random() <= d.chance) {
          const cnt = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
          this.drops.push({
            id: this.nextEntityId++,
            itemId: d.itemId,
            count: cnt,
            x: ex,
            y: ey,
            vx: (Math.random() - 0.5) * 140,
            vy: -190,
            life: 60,
            pickupDelay: 0.2,
          });
        }
      }
      this.emitHud();
    } else {
      this.hitstopTimer = 0.025;
    }
  }

  private stepProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;

      if (p.kind === 'arrow' || p.kind === 'yarn_bomb' || p.kind === 'dynamite') {
        p.vy += GRAVITY * (p.kind === 'arrow' ? 0.45 : 0.85) * dt;
      } else if (p.kind === 'demon_scythe') {
        const curSpd = Math.hypot(p.vx, p.vy);
        if (curSpd > 0 && curSpd < 840) {
          const factor = 1 + 2.8 * dt;
          p.vx *= factor;
          p.vy *= factor;
        }
      } else if (p.kind === 'zenith_blade') {
        const pcx = this.player.x + this.player.width / 2;
        const pcy = this.player.y + this.player.height / 2;
        const curve = p.curveDir ?? 1;
        if (!p.returning) {
          // Sweeping Terraria Zenith arc perpendicular to travel
          const ang = Math.atan2(p.vy, p.vx) + curve * 1.45 * dt;
          const spd = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(ang) * spd;
          p.vy = Math.sin(ang) * spd;
          if (p.life < p.maxLife * 0.52) {
            p.returning = true;
            p.hitIds = [];
          }
        } else {
          const dx = pcx - p.x;
          const dy = pcy - p.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          p.vx = (dx / len) * 960;
          p.vy = (dy / len) * 960;
          if (len < 28) {
            this.projectiles.splice(i, 1);
            continue;
          }
        }
      } else if (p.kind === 'boomerang') {
        if (!p.returning && p.life < p.maxLife * 0.55) {
          p.returning = true;
          p.hitIds = []; // Allow hitting on return!
        }
        if (p.returning) {
          const pcx = this.player.x + this.player.width / 2;
          const pcy = this.player.y + this.player.height / 2;
          const dx = pcx - p.x;
          const dy = pcy - p.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          p.vx = (dx / len) * 560;
          p.vy = (dy / len) * 560;
          if (len < 24) {
            this.projectiles.splice(i, 1);
            continue;
          }
        }
      }

      const prevTx = Math.floor(p.x / TILE_SIZE);
      const prevTy = Math.floor(p.y / TILE_SIZE);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Trail particles for magic/bombs/stars/zenith
      if (
        p.kind === 'fireball' ||
        p.kind === 'frost_bolt' ||
        p.kind === 'yarn_bomb' ||
        p.kind === 'dynamite' ||
        p.kind === 'star_rain' ||
        p.kind === 'star_wrath' ||
        p.kind === 'terra_beam' ||
        p.kind === 'water_bolt' ||
        p.kind === 'rainbow_cat' ||
        p.kind === 'zenith_blade' ||
        p.kind === 'demon_scythe'
      ) {
        if (Math.random() < 0.65) {
          this.spawnParticle(p.x, p.y, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, p.color, 3.2, 0.22, 40);
        }
      }

      // Check tile impact
      const tx = Math.floor(p.x / TILE_SIZE);
      const ty = Math.floor(p.y / TILE_SIZE);
      const hitTile = getTile(this.world, tx, ty);

      if (p.fromPlayer && hitTile === TileType.Pot) {
        this.breakPotAt(tx, ty);
      }

      const hitSolidTile = isTileSolid(hitTile);
      if (hitSolidTile && p.kind !== 'boomerang' && p.kind !== 'zenith_blade') {
        if ((p.kind === 'water_bolt' || p.kind === 'rainbow_cat') && (p.bouncesLeft ?? 0) > 0) {
          p.bouncesLeft = (p.bouncesLeft ?? 1) - 1;
          if (tx !== prevTx) p.vx *= -1;
          else p.vy *= -1;
          p.x += p.vx * dt * 1.4;
          p.y += p.vy * dt * 1.4;
          sound.playMagic();
        } else if ((p.kind === 'star_rain' || p.kind === 'star_wrath') && p.y < this.player.y - 40) {
          // Starfury / Star Wrath meteors fall through upper sky tiles toward target elevation
        } else {
          if (p.kind === 'yarn_bomb' || p.kind === 'dynamite' || p.aoeRadius > 0) {
            this.detonateProjectile(p);
          } else {
            this.spawnBurst(p.x, p.y, p.color, 6, 90);
          }
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.fromPlayer) {
        let removed = false;
        for (const enemy of this.enemies) {
          if (enemy.aiState === 'ko' || p.hitIds.includes(enemy.id)) continue;
          if (
            rectsOverlap(
              p.x - p.radius,
              p.y - p.radius,
              p.radius * 2,
              p.radius * 2,
              enemy.x,
              enemy.y,
              enemy.width,
              enemy.height,
            )
          ) {
            p.hitIds.push(enemy.id);
            if (p.aoeRadius > 0) {
              this.detonateProjectile(p);
              this.projectiles.splice(i, 1);
              removed = true;
              break;
            } else {
              const dir = p.vx >= 0 ? 1 : -1;
              this.damageEnemy(enemy, p.damage, dir * p.knockback * 40, -130);
              if (p.lifesteal && p.lifesteal > 0) {
                const heal = Math.max(1, Math.round(p.damage * p.lifesteal));
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
              }
              p.pierceLeft--;
              if (p.pierceLeft <= 0) {
                this.projectiles.splice(i, 1);
                removed = true;
                break;
              }
            }
          }
        }
        if (removed) continue;
      } else {
        // Enemy projectile hitting player
        if (
          this.player.invulnTimer <= 0 &&
          rectsOverlap(
            p.x - p.radius,
            p.y - p.radius,
            p.radius * 2,
            p.radius * 2,
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height,
          )
        ) {
          this.damagePlayer(p.damage, p.vx >= 0 ? 1 : -1);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.life <= 0) {
        if (p.kind === 'yarn_bomb' || p.kind === 'dynamite') {
          this.detonateProjectile(p);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private detonateProjectile(p: ProjectileEntity): void {
    sound.playExplosion();
    this.spawnBurst(p.x, p.y, p.color, 26, 250);
    this.spawnBurst(p.x, p.y, '#fef08a', 14, 180);
    this.trauma = Math.min(1, this.trauma + 0.58);

    if (p.blastTiles && p.blastTiles > 0) {
      const blasted = explodeTilesRadius(this.world, this.tileDamageMap, p.x, p.y, p.blastTiles);
      for (const b of blasted) {
        this.stats.blocksMined++;
        this.drops.push({
          id: this.nextEntityId++,
          itemId: b.itemId,
          count: 1,
          x: (b.tx + 0.5) * TILE_SIZE,
          y: (b.ty + 0.5) * TILE_SIZE,
          vx: (Math.random() - 0.5) * 140,
          vy: -140,
          life: 60,
          pickupDelay: 0.2,
        });
      }
      recomputeLightingLocal(this.world, this.timeOfDay, Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE));
    }

    for (const enemy of this.enemies) {
      if (enemy.aiState === 'ko') continue;
      const ex = enemy.x + enemy.width / 2;
      const ey = enemy.y + enemy.height / 2;
      const d = Math.hypot(ex - p.x, ey - p.y);
      if (d <= p.aoeRadius) {
        const dir = ex >= p.x ? 1 : -1;
        this.damageEnemy(enemy, p.damage, dir * p.knockback * 50, -210);
      }
    }
  }

  private stepEnemySpawning(dt: number): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    const isNight = this.timeOfDay >= 0.55 || this.timeOfDay < 0.08;
    const ptx = Math.max(0, Math.min(this.world.width - 1, Math.floor(this.player.x / TILE_SIZE)));
    const feetTileY = Math.round((this.player.y + this.player.height) / TILE_SIZE);
    const depthTiles = feetTileY - this.world.surfaceHeights[ptx];
    const underground = depthTiles > 6;
    const inUnderworld = feetTileY >= this.world.height - 52;

    const maxEnemies = Math.min(
      14,
      4 + this.dayCount + (isNight ? 3 : 0) + (this.alienInvasion.active ? 4 : 0),
    );
    this.spawnTimer = this.alienInvasion.active ? 2.4 : isNight ? 4.0 : 5.8;

    if (this.enemies.length >= maxEnemies) return;

    // Auto-spawn Eye Boss on Night 2+ once per night
    if (isNight && this.dayCount >= 2 && this.bossSpawnedDay < this.dayCount) {
      this.bossSpawnedDay = this.dayCount;
      this.summonNightBoss();
      return;
    }

    const side = Math.random() < 0.5 ? -1 : 1;
    const spawnWorldX = Math.max(
      4 * TILE_SIZE,
      Math.min((this.world.width - 4) * TILE_SIZE, this.player.x + side * (360 + Math.random() * 180)),
    );
    const tx = Math.floor(spawnWorldX / TILE_SIZE);
    let ty = this.world.surfaceHeights[tx] - 2;
    if (underground) {
      ty = Math.max(4, Math.min(this.world.height - 4, Math.floor(this.player.y / TILE_SIZE) - 2));
    }

    if (isTileSolid(getTile(this.world, tx, ty))) return;
    if (isInsideValidHouse(this.world, spawnWorldX, ty * TILE_SIZE)) return;

    const biome = getBiomeAtX(tx, this.world.width);
    let kind: EnemyKind = 'slime';

    // 1. Alien Invasion wave mobs
    if (this.alienInvasion.active) {
      kind = Math.random() < 0.65 ? 'alien_cat' : 'alien_drone';
    } else {
      // 2. Lunar Pillar nearby spawns matching minion
      const nearbyPillar = this.enemies.find(
        (e) =>
          isPillarKind(e.kind) &&
          e.aiState !== 'ko' &&
          Math.abs(e.x - this.player.x) < 960,
      );
      if (nearbyPillar) {
        kind =
          nearbyPillar.kind === 'solar_pillar'
            ? 'solar_corite'
            : nearbyPillar.kind === 'vortex_pillar'
              ? 'vortex_alien'
              : nearbyPillar.kind === 'nebula_pillar'
                ? 'nebula_floater'
                : 'stardust_cell';
      } else if (inUnderworld) {
        const r = Math.random();
        kind = r < 0.4 ? 'hellbat' : r < 0.72 ? 'fire_imp' : 'fire_demon';
      } else if (underground) {
        if (biome === 'snow') kind = Math.random() < 0.55 ? 'ice_bat' : 'skeleton';
        else if (biome === 'crimson') kind = Math.random() < 0.55 ? 'crimera' : 'blood_crawler';
        else kind = Math.random() < 0.55 ? 'bat' : 'skeleton';
      } else if (biome === 'crimson') {
        const r = Math.random();
        kind = r < 0.4 ? 'crimera' : r < 0.75 ? 'face_monster' : 'blood_crawler';
      } else if (biome === 'snow') {
        const r = Math.random();
        kind = r < 0.45 ? 'ice_slime' : r < 0.75 ? 'ice_bat' : 'frost_viking';
      } else if (biome === 'desert') {
        const r = Math.random();
        kind = r < 0.4 ? 'sand_slime' : r < 0.75 ? 'antlion' : 'mummy';
      } else if (biome === 'crystal') {
        const r = Math.random();
        kind = r < 0.65 ? 'pixie' : 'skeleton';
      } else if (biome === 'ocean') {
        kind = Math.random() < 0.7 ? 'sand_shark' : 'slime';
      } else if (isNight) {
        const r = Math.random();
        kind = r < 0.45 ? 'goblin' : r < 0.8 ? 'skeleton' : 'bat';
      } else {
        kind = Math.random() < 0.8 ? 'slime' : 'goblin';
      }
    }

    const scale = 1 + (this.dayCount - 1) * 0.2 + (biome === 'crimson' || biome === 'crystal' ? 0.2 : 0);
    this.enemies.push(
      createEnemy(this.nextEntityId++, kind, spawnWorldX, ty * TILE_SIZE, scale, this.lang),
    );
  }

  private stepEnemies(dt: number): void {
    let activeAttackers = 0;
    for (const e of this.enemies) {
      if (e.aiState === 'windup' || e.aiState === 'attack') activeAttackers++;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const allowToken = activeAttackers < 3;
      const aiRes = stepEnemyAI(enemy, this.player, this.world, dt, allowToken);

      if (aiRes.spawnSlimeGlob) {
        this.projectiles.push({
          id: this.nextEntityId++,
          fromPlayer: false,
          kind: 'slime_glob',
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          vx: aiRes.spawnSlimeGlob.vx,
          vy: aiRes.spawnSlimeGlob.vy,
          radius: 7,
          damage: Math.round(enemy.damage * 0.8),
          knockback: 4,
          life: 2.2,
          maxLife: 2.2,
          pierceLeft: 1,
          aoeRadius: 0,
          color: '#dc2626',
          hitIds: [],
        });
      }

      if (aiRes.spawnProjectiles && aiRes.spawnProjectiles.length > 0) {
        for (const sp of aiRes.spawnProjectiles) {
          this.projectiles.push({
            id: this.nextEntityId++,
            fromPlayer: false,
            kind: sp.kind,
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            vx: sp.vx,
            vy: sp.vy,
            radius: sp.radius,
            damage: sp.damage ?? Math.round(enemy.damage * 0.78),
            knockback: 4,
            life: 2.8,
            maxLife: 2.8,
            pierceLeft: 1,
            aoeRadius: 0,
            color: sp.color,
            hitIds: [],
          });
        }
      }

      if (aiRes.spawnMinionKind && this.enemies.length < 18) {
        const minion = createEnemy(
          this.nextEntityId++,
          aiRes.spawnMinionKind,
          enemy.x + enemy.width / 2,
          enemy.y,
          1,
          this.lang,
        );
        minion.vy = -220;
        minion.vx = (Math.random() - 0.5) * 180;
        this.enemies.push(minion);
      }

      if (enemy.aiState === 'ko') {
        if (enemy.koTimer <= 0) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Despawn very far away regular mobs to keep action near player
      if (
        !isBossKind(enemy.kind) &&
        Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y) > 1650
      ) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Contact damage on player
      if (
        this.player.invulnTimer <= 0 &&
        rectsOverlap(
          this.player.x + 2,
          this.player.y + 2,
          this.player.width - 4,
          this.player.height - 4,
          enemy.x,
          enemy.y,
          enemy.width,
          enemy.height,
        )
      ) {
        const dir = this.player.x >= enemy.x ? 1 : -1;
        this.damagePlayer(enemy.damage, dir, enemy.kind);
      }
    }
  }

  private damagePlayer(rawDmg: number, knockDir: number, sourceKind?: EnemyKind): void {
    if (this.godMode) return;
    const bonuses = computeEquipmentBonuses(this.equipment);
    const fxMods = computeEffectModifiers(this.player.effects);
    const totalDefense = Math.max(
      0,
      Math.round((this.player.defense + bonuses.defense + fxMods.defenseBonus) * fxMods.defenseMult),
    );
    const dmg = computeDamageAfterDefense(rawDmg, totalDefense);
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.player.invulnTimer = 0.75;
    this.player.hitFlashTimer = 0.1;
    if (!bonuses.hasKnockbackImmune && knockDir !== 0) {
      this.player.vx = knockDir * 240;
      this.player.vy = -230;
    }
    this.trauma = Math.min(1, this.trauma + 0.55);
    this.hitstopTimer = 0.04;

    if (sourceKind && !bonuses.hasDebuffImmune && Math.random() < 0.32) {
      const fireImmune = Boolean(bonuses.hasFireImmune || fxMods.fireImmune);
      if ((sourceKind === 'fire_imp' || sourceKind === 'fire_demon' || sourceKind === 'hellbat' || sourceKind === 'solar_corite') && !fireImmune) {
        applyStatusEffect(this.player.effects, 'on_fire', 5);
      } else if (sourceKind === 'slime' || sourceKind === 'plantera' || sourceKind === 'queen_bee' || sourceKind === 'stardust_cell') {
        applyStatusEffect(this.player.effects, 'poisoned', 6);
      } else if (sourceKind === 'ice_slime' || sourceKind === 'ice_bat' || sourceKind === 'deerclops') {
        applyStatusEffect(this.player.effects, 'slow', 5);
      } else if (sourceKind === 'brain_cthulhu' || sourceKind === 'jester_cat' || sourceKind === 'nebula_floater') {
        applyStatusEffect(this.player.effects, 'confusion', 4);
      } else if (sourceKind === 'mummy' || sourceKind === 'skeleton' || sourceKind === 'crimera') {
        applyStatusEffect(this.player.effects, 'weak', 7);
      } else if (sourceKind === 'face_monster' || sourceKind === 'skele_cat') {
        applyStatusEffect(this.player.effects, 'broken_armor', 6);
      }
    }

    sound.playPlayerHurt();
    this.spawnFloatingText(
      this.player.x + this.player.width / 2,
      this.player.y - 12,
      `-${dmg}`,
      '#ef4444',
    );
    this.spawnBurst(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      '#ef4444',
      14,
      180,
    );

    if (this.player.hp <= 0) {
      this.setPhase('gameover');
    } else {
      this.emitHud();
    }
  }

  private stepDrops(dt: number): void {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const fxMods = computeEffectModifiers(this.player.effects);
    const magnetRange = 84 * fxMods.magnetMult;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.life -= dt;
      d.pickupDelay = Math.max(0, d.pickupDelay - dt);

      const box = {
        x: d.x - 6,
        y: d.y - 6,
        vx: d.vx,
        vy: Math.min(480, d.vy + GRAVITY * 0.75 * dt),
        width: 12,
        height: 12,
        onGround: false,
      };
      moveEntityWithTiles(box, this.world, dt, false);
      d.x = box.x + 6;
      d.y = box.y + 6;
      d.vx = box.vx * (box.onGround ? Math.pow(0.05, dt) : Math.pow(0.4, dt));
      d.vy = box.vy;

      const dist = Math.hypot(pcx - d.x, pcy - d.y);
      const canMagnet = !d.noAutoMagnet && dist < magnetRange;
      const canDirectPickup = d.pickupDelay <= 0 && dist < 28;
      if (d.pickupDelay <= 0 && (canMagnet || canDirectPickup)) {
        if (canMagnet && dist >= 28) {
          // Magnetic pull toward cat
          const pull = 360 * dt;
          d.x += ((pcx - d.x) / Math.max(1, dist)) * pull;
          d.y += ((pcy - d.y) / Math.max(1, dist)) * pull;
        }
        if (dist < 28) {
          const leftover = addItemToInventory(this.hotbar, this.backpack, d.itemId, d.count);
          if (leftover < d.count) {
            sound.playPickup();
            const itemName = getItemName(d.itemId, this.lang);
            this.spawnFloatingText(d.x, d.y - 10, `+${d.count - leftover} ${itemName}`, '#bae6fd');
            this.syncActiveWeapon();
            this.emitHud();
          }
          if (leftover <= 0) {
            this.drops.splice(i, 1);
            continue;
          } else {
            d.count = leftover;
          }
        }
      }

      if (d.life <= 0) {
        this.drops.splice(i, 1);
      }
    }
  }

  private render(): void {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    this.ctx.save();
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const shakeMag = this.settings.screenShake ? this.trauma * this.trauma * 12 : 0;
    const shakeX = (Math.random() * 2 - 1) * shakeMag;
    const shakeY = (Math.random() * 2 - 1) * shakeMag;
    const { tx, ty, inRange } = this.getHoverWorldTile();
    const slot = this.hotbar[this.selectedSlot];

    renderGameFrame(this.ctx, width, height, {
      world: this.world,
      player: this.player,
      npcs: this.npcs,
      enemies: this.enemies,
      projectiles: this.projectiles,
      drops: this.drops,
      particles: this.particles,
      floatingTexts: this.floatingTexts,
      tileDamageMap: this.tileDamageMap,
      cameraX: this.cameraX,
      cameraY: this.cameraY,
      shakeX,
      shakeY,
      timeOfDay: this.timeOfDay,
      elapsed: this.elapsed,
      hoverTileX: this.phase === 'playing' ? tx : -1,
      hoverTileY: this.phase === 'playing' ? ty : -1,
      hoverInRange: inRange,
      selectedItemId: slot ? slot.itemId : null,
      textures: this.textures,
      equipment: this.equipment,
      language: this.lang,
      stoolSpeech: this.stoolSpeech
        ? { text: this.stoolSpeech.text, stage: this.stoolSpeech.stage }
        : null,
    });

    this.ctx.restore();
  }

  private hasInventoryItem(itemId: string): boolean {
    return countItemInInventory(this.hotbar, this.backpack, itemId) > 0;
  }

  private getOwnedAccessories(): string[] {
    const equippedIds = this.equipment.accessories
      .filter((s): s is InventorySlot => s !== null)
      .map((s) => s.itemId);
    if (this.hasInventoryItem('grappling_hook') && !equippedIds.includes('grappling_hook')) {
      equippedIds.push('grappling_hook');
    }
    return equippedIds;
  }

  private spawnPotLootAt(tx: number, ty: number): void {
    setTile(this.world, tx, ty, TileType.Air);
    this.tileDamageMap.delete(tileIndex(tx, ty, this.world.width));
    const wx = (tx + 0.5) * TILE_SIZE;
    const wy = (ty + 0.5) * TILE_SIZE;
    const loot = rollPotDrops();
    this.player.coins += loot.coins;
    sound.playPotBreak();
    sound.playCoin();
    this.spawnBurst(wx, wy, '#d97706', 14, 150);
    this.spawnFloatingText(wx, wy - 12, this.t(`+${loot.coins} coins`, `+${loot.coins} монет`), '#facc15');
    for (const drop of loot.items) {
      this.drops.push({
        id: this.nextEntityId++,
        itemId: drop.itemId,
        count: drop.count,
        x: wx,
        y: wy,
        vx: (Math.random() - 0.5) * 120,
        vy: -165,
        life: 60,
        pickupDelay: 0.16,
      });
    }
    this.emitHud();
  }

  private breakPotAt(tx: number, ty: number): void {
    if (getTile(this.world, tx, ty) !== TileType.Pot) return;
    this.stats.blocksMined++;
    this.spawnPotLootAt(tx, ty);
  }

  private launchGrapplingHook(targetWx: number, targetWy: number): void {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const ang = Math.atan2(targetWy - pcy, targetWx - pcx);
    this.player.grapple = {
      active: true,
      hooked: false,
      x: pcx + Math.cos(ang) * 14,
      y: pcy + Math.sin(ang) * 14,
      vx: Math.cos(ang) * 760,
      vy: Math.sin(ang) * 760,
    };
    sound.playHook();
    this.emitHud();
  }

  public fireGrapplingHookFromKey(): void {
    if (this.phase !== 'playing') return;
    if (this.player.grapple.active) {
      this.player.grapple.active = false;
      this.player.grapple.hooked = false;
      return;
    }
    if (!this.hasInventoryItem('grappling_hook')) {
      this.showToast(
        this.t(
          'Need a Grappling Hook (buy from Merchant Boris or loot a chest)!',
          'Нужен Крюк-кошка (купи у Торговца Бориса или найди в сундуке)!',
        ),
      );
      return;
    }
    const { wx, wy } = this.getHoverWorldTile();
    this.launchGrapplingHook(wx, wy);
  }

  private findNpcAtPoint(wx: number, wy: number): NpcEntity | null {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    let best: NpcEntity | null = null;
    let bestDist = 42;
    for (const npc of this.npcs) {
      const ncx = npc.x + npc.width / 2;
      const ncy = npc.y + npc.height / 2;
      if (Math.hypot(ncx - pcx, ncy - pcy) > 7.5 * TILE_SIZE) continue;
      const d = Math.hypot(ncx - wx, ncy - wy);
      if (d < bestDist) {
        bestDist = d;
        best = npc;
      }
    }
    return best;
  }

  private findNearestNpc(maxDistPx = 115): NpcEntity | null {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    let best: NpcEntity | null = null;
    let bestDist = maxDistPx;
    for (const npc of this.npcs) {
      const d = Math.hypot(npc.x + npc.width / 2 - pcx, npc.y + npc.height / 2 - pcy);
      if (d < bestDist) {
        bestDist = d;
        best = npc;
      }
    }
    return best;
  }

  private findNearestDoorTile(maxDistTiles = 3.2): { tx: number; ty: number; isOpen: boolean } | null {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const ptx = Math.floor(pcx / TILE_SIZE);
    const pty = Math.floor(pcy / TILE_SIZE);
    const r = Math.ceil(maxDistTiles);
    let best: { tx: number; ty: number; isOpen: boolean } | null = null;
    let bestDist = Infinity;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = ptx + dx;
        const ty = pty + dy;
        const t = getTile(this.world, tx, ty);
        if (t === TileType.DoorClosed || t === TileType.DoorOpen) {
          const dist = Math.hypot((tx + 0.5) * TILE_SIZE - pcx, (ty + 0.5) * TILE_SIZE - pcy);
          if (dist <= maxDistTiles * TILE_SIZE && dist < bestDist) {
            bestDist = dist;
            best = { tx, ty, isOpen: t === TileType.DoorOpen };
          }
        }
      }
    }
    return best;
  }

  public toggleNearestDoor(): boolean {
    const door = this.findNearestDoorTile(3.6);
    if (!door) return false;
    const res = toggleDoorAtTile(this.world, this.player, door.tx, door.ty);
    if (res.toggled) {
      sound.playPlace();
      recomputeLightingLocal(this.world, this.timeOfDay, door.tx, door.ty);
      this.emitHud(true);
      return true;
    }
    if (res.blockedByPlayer) {
      this.showToast(this.t('Step away from doorway to close the door!', 'Отойди от проёма, чтобы закрыть дверь!'));
      this.emitHud(true);
    }
    return false;
  }

  private interactNearestTarget(): void {
    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2;
    const chest = this.findNearestChestTile(4.5);
    const npc = this.findNearestNpc(118);
    const stool = this.findNearestStoolTile(4.5);
    const door = this.findNearestDoorTile(3.2);

    const chestDist = chest ? Math.hypot((chest.tx + 0.5) * TILE_SIZE - pcx, (chest.ty + 0.5) * TILE_SIZE - pcy) : Infinity;
    const npcDist = npc ? Math.hypot(npc.x + npc.width / 2 - pcx, npc.y + npc.height / 2 - pcy) : Infinity;
    const stoolDist = stool ? Math.hypot((stool.tx + 0.5) * TILE_SIZE - pcx, (stool.ty + 0.5) * TILE_SIZE - pcy) : Infinity;
    const doorDist = door ? Math.hypot((door.tx + 0.5) * TILE_SIZE - pcx, (door.ty + 0.5) * TILE_SIZE - pcy) : Infinity;

    const minDist = Math.min(chestDist, npcDist, stoolDist, doorDist);
    if (!Number.isFinite(minDist)) return;

    if (chest && chestDist === minDist) {
      this.openChest(chest.tx, chest.ty);
    } else if (npc && npcDist === minDist) {
      this.openNpc(npc.id);
    } else if (stool && stoolDist === minDist) {
      this.petStool(stool.tx, stool.ty);
    } else if (door) {
      this.toggleNearestDoor();
    }
  }

  public openNearestNpc(): boolean {
    const npc = this.findNearestNpc(118);
    if (!npc) return false;
    this.openNpc(npc.id);
    return true;
  }

  public openNpc(id: number): void {
    const npc = this.npcs.find((n) => n.id === id);
    if (!npc) return;
    this.activeChestCoords = null;
    this.activeNpcId = npc.id;
    npc.facing = this.player.x >= npc.x ? 1 : -1;
    sound.playNpcTalk();
    this.emitHud(true);
  }

  public closeNpc(): void {
    this.activeNpcId = null;
    this.emitHud(true);
  }

  private getNurseHealCost(): number {
    const missing = Math.max(0, this.player.maxHp - this.player.hp);
    if (missing <= 0) return 0;
    return Math.min(this.player.coins, Math.max(5, Math.round(missing * 0.2)));
  }

  public buyNpcItem(itemId: string): boolean {
    if (this.activeNpcId === null) return false;
    const npc = this.npcs.find((n) => n.id === this.activeNpcId);
    if (!npc) return false;
    const entry = getNpcShopItems(npc.kind).find((s) => s.itemId === itemId);
    if (!entry) return false;

    if (this.player.coins < entry.price) {
      this.showToast(this.t(`Not enough coins (need ${entry.price})!`, `Не хватает монет (нужно ${entry.price})!`));
      return false;
    }

    const leftover = addItemToInventory(this.hotbar, this.backpack, itemId, 1);
    if (leftover > 0) {
      this.showToast(this.t('Backpack is full!', 'Рюкзак переполнен!'));
      return false;
    }

    this.player.coins -= entry.price;
    sound.playCoin();
    const itemName = getItemName(itemId, this.lang);
    this.showToast(this.t(`Bought from ${npc.name}: ${itemName}`, `Куплено у ${npc.name}: ${itemName}`));
    this.syncActiveWeapon();
    this.emitHud(true);
    return true;
  }

  public healAtNurse(): boolean {
    if (this.activeNpcId === null) return false;
    const npc = this.npcs.find((n) => n.id === this.activeNpcId && n.kind === 'nurse');
    if (!npc) return false;
    if (this.player.hp >= this.player.maxHp) {
      this.showToast(this.t('Your health is already full!', 'Здоровье котика уже полное!'));
      return false;
    }
    const cost = this.getNurseHealCost();
    const bonuses = computeEquipmentBonuses(this.equipment);
    this.player.coins = Math.max(0, this.player.coins - cost);
    this.player.hp = this.player.maxHp;
    this.player.mana = this.player.maxMana + bonuses.maxManaBonus;
    sound.playHeal();
    this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#4ade80', 14, 150);
    this.showToast(
      cost > 0
        ? this.t(`${npc.name} healed you for ${cost} coins!`, `${npc.name} вылечила кота за ${cost} монет!`)
        : this.t(`${npc.name} healed you for free!`, `${npc.name} вылечила кота бесплатно!`),
    );
    this.emitHud(true);
    return true;
  }

  public getHudSnapshot(): HudSnapshot {
    const pxTile = Math.max(0, Math.min(this.world.width - 1, Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE)));
    const pyTile = Math.max(0, Math.min(this.world.height - 1, Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE)));
    const feetTileY = Math.round((this.player.y + this.player.height) / TILE_SIZE);
    const depthMeters = Math.max(
      0,
      Math.round((feetTileY - this.world.surfaceHeights[pxTile]) * 2),
    );
    const biome = getBiomeAtX(pxTile, this.world.width);
    const isNight = this.timeOfDay >= 0.55 || this.timeOfDay < 0.08;
    const liveBosses = this.enemies.filter((e) => isBossKind(e.kind) && e.aiState !== 'ko');
    const activeBosses: HudBossBar[] = liveBosses.map((b) => ({
      id: b.id,
      kind: b.kind,
      name: getEnemyName(b, this.lang),
      hp: Math.round(b.hp),
      maxHp: b.maxHp,
      shield: b.shield,
      maxShield: b.maxShield,
    }));
    const boss = liveBosses[0] ?? null;
    const nearbyStool = this.findNearestStoolTile(4.5) !== null;
    const nearbyChest = this.findNearestChestTile(4.5);
    const nearbyDoor = this.findNearestDoorTile(3.2);
    const nearbyNpcEntity = this.findNearestNpc(118);
    const roomInspection = inspectRoomHousing(this.world, pxTile, pyTile, this.lang);
    const ownedAccessories = this.getOwnedAccessories();

    const activeChest =
      this.activeChestCoords &&
      getTile(this.world, this.activeChestCoords.tx, this.activeChestCoords.ty) === TileType.Chest
        ? {
            tx: this.activeChestCoords.tx,
            ty: this.activeChestCoords.ty,
            items: (
              this.world.chests[
                tileIndex(this.activeChestCoords.tx, this.activeChestCoords.ty, this.world.width)
              ] ?? []
            ).map((s) => ({ ...s })),
          }
        : null;

    const activeNpcEntity =
      this.activeNpcId !== null ? this.npcs.find((n) => n.id === this.activeNpcId) ?? null : null;
    const activeNpc = activeNpcEntity
      ? {
          id: activeNpcEntity.id,
          kind: activeNpcEntity.kind,
          name: getNpcDisplay(activeNpcEntity.kind, this.lang).name,
          title: getNpcDisplay(activeNpcEntity.kind, this.lang).title,
          quote: getNpcDialogue(
            activeNpcEntity,
            {
              isNight,
              biome,
              validHouseCount: this.validHouseCount,
              hasBoss: liveBosses.length > 0,
              stoolPetted: this.stoolPetted,
            },
            this.lang,
          ),
          settled: activeNpcEntity.homeTileX !== null,
          shopItems: getNpcShopItems(activeNpcEntity.kind),
          canHeal: activeNpcEntity.kind === 'nurse',
          healCost: this.getNurseHealCost(),
        }
      : null;

    const bonuses = computeEquipmentBonuses(this.equipment);
    const fxMods = computeEffectModifiers(this.player.effects);
    const totalDefense = Math.max(
      0,
      Math.round((this.player.defense + bonuses.defense + fxMods.defenseBonus) * fxMods.defenseMult),
    );
    const equipmentCopy: EquipmentState = {
      helmet: this.equipment.helmet ? { ...this.equipment.helmet } : null,
      chestplate: this.equipment.chestplate ? { ...this.equipment.chestplate } : null,
      greaves: this.equipment.greaves ? { ...this.equipment.greaves } : null,
      accessories: this.equipment.accessories.map((a) => (a ? { ...a } : null)),
    };

    const pillarsAlive = this.enemies
      .filter((e) => isPillarKind(e.kind) && e.aiState !== 'ko')
      .map((p) => ({
        kind: p.kind,
        name: getEnemyName(p, this.lang),
        tx: Math.floor((p.x + p.width / 2) / TILE_SIZE),
        shield: Math.round(p.shield ?? 0),
        maxShield: p.maxShield ?? 120,
        hp: Math.round(p.hp),
        maxHp: p.maxHp,
      }));
    const saucerAlive = this.enemies.some(
      (e) => e.kind === 'martian_saucer' && e.aiState !== 'ko',
    );

    return {
      phase: this.phase,
      language: this.lang,
      hp: Math.round(this.player.hp),
      maxHp: this.player.maxHp,
      mana: Math.round(this.player.mana),
      maxMana: this.player.maxMana + bonuses.maxManaBonus,
      defense: totalDefense,
      coins: this.player.coins,
      dayCount: this.dayCount,
      timeOfDay: this.timeOfDay,
      isNight,
      depthMeters,
      playerTileX: pxTile,
      playerTileY: pyTile,
      biome,
      worldVariant: this.world.variant,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
      houseValid: this.player.houseValid,
      validHouseCount: this.validHouseCount,
      roomReport: roomInspection.report,
      nearbyStations: getNearbyStations(
        this.world,
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
      ),
      hotbar: this.hotbar.map((s) => (s ? { ...s } : null)),
      backpack: this.backpack.map((s) => (s ? { ...s } : null)),
      equipment: equipmentCopy,
      equipmentBonuses: bonuses,
      activeEffects: this.player.effects.map((e) => {
        const def = STATUS_EFFECT_DEFS[e.id];
        return {
          id: e.id,
          name: getEffectName(e.id, this.lang),
          description: getEffectDescription(e.id, this.lang),
          remaining: e.duration,
          maxDuration: e.maxDuration,
          isDebuff: e.isDebuff,
          color: def.color,
        };
      }),
      activeSaveId: this.activeSaveId,
      wingFuel: this.player.wingFuel,
      wingFuelMax: MAX_WING_FUEL,
      selectedSlot: this.selectedSlot,
      activeToolMode: this.activeToolMode,
      stats: { ...this.stats },
      enemyCount: this.enemies.length,
      bossInfo: boss
        ? {
            name: getEnemyName(boss, this.lang),
            hp: Math.round(boss.hp),
            maxHp: boss.maxHp,
          }
        : null,
      activeBosses,
      lunarEvent: {
        active: this.lunarEvent.active || pillarsAlive.length > 0,
        pillarsAlive,
        moonLordSpawned: this.lunarEvent.moonLordSpawned,
      },
      alienInvasion: {
        active: this.alienInvasion.active,
        defeated: this.alienInvasion.defeated,
        target: this.alienInvasion.target,
        saucerAlive,
      },
      toastMessage: this.toastMessage,
      godMode: this.godMode,
      nearbyStool,
      nearbyChest,
      nearbyDoor,
      nearbyNpc: nearbyNpcEntity
        ? {
            id: nearbyNpcEntity.id,
            kind: nearbyNpcEntity.kind,
            name: getNpcDisplay(nearbyNpcEntity.kind, this.lang).name,
            title: getNpcDisplay(nearbyNpcEntity.kind, this.lang).title,
          }
        : null,
      npcsSummary: this.npcs.map((n) => ({
        id: n.id,
        kind: n.kind,
        name: getNpcDisplay(n.kind, this.lang).name,
        title: getNpcDisplay(n.kind, this.lang).title,
        settled: n.homeTileX !== null,
        homeTileX: n.homeTileX,
        homeTileY: n.homeTileY,
      })),
      ownedAccessories,
      activeChest,
      activeNpc,
      stoolSpeech: this.stoolSpeech
        ? {
            stage: this.stoolSpeech.stage,
            text: this.stoolSpeech.text,
            hint: this.stoolSpeech.hint,
            copiedUrl: this.stoolSpeech.copiedUrl,
          }
        : null,
    };
  }

  private emitHud(force = false): void {
    const snap = this.getHudSnapshot();
    const hotbarKey = snap.hotbar.map((s) => (s ? `${s.itemId}:${s.count}` : '')).join(',');
    const backpackKey = snap.backpack.map((s) => (s ? `${s.itemId}:${s.count}` : '')).join(',');
    const equipKey = [
      snap.equipment.helmet?.itemId ?? '',
      snap.equipment.chestplate?.itemId ?? '',
      snap.equipment.greaves?.itemId ?? '',
      snap.equipment.accessories.map((a) => a?.itemId ?? '').join(','),
    ].join(';');
    const effectsKey = snap.activeEffects
      .map((e) => `${e.id}:${Math.ceil(e.remaining)}`)
      .join(',');
    const chestKey = snap.activeChest
      ? `${snap.activeChest.tx},${snap.activeChest.ty}:${snap.activeChest.items
          .map((s) => (s ? `${s.itemId}:${s.count}` : ''))
          .join(',')}`
      : '';
    const bossKey = snap.activeBosses.map((b) => `${b.id}:${b.hp}:${b.shield ?? 0}`).join(',');
    const key = [
      snap.phase,
      snap.language,
      snap.worldVariant,
      snap.hp,
      snap.maxHp,
      snap.mana,
      snap.maxMana,
      snap.defense,
      Math.round(snap.wingFuel * 20),
      snap.coins,
      snap.dayCount,
      snap.isNight ? 1 : 0,
      snap.depthMeters,
      snap.playerTileX,
      snap.playerTileY,
      snap.biome,
      snap.houseValid ? 1 : 0,
      snap.validHouseCount,
      snap.roomReport ? `${snap.roomReport.valid}:${snap.roomReport.hasHouseForNpc}:${snap.roomReport.reasons.length}` : '',
      snap.selectedSlot,
      snap.activeToolMode,
      snap.toastMessage ?? '',
      bossKey,
      `${snap.lunarEvent.active}:${snap.lunarEvent.pillarsAlive.map((p) => `${p.kind}:${p.shield}:${p.hp}`).join(',')}`,
      `${snap.alienInvasion.active}:${snap.alienInvasion.defeated}:${snap.alienInvasion.saucerAlive}`,
      snap.nearbyStations.join(','),
      hotbarKey,
      backpackKey,
      equipKey,
      effectsKey,
      snap.activeSaveId ?? '',
      snap.stats.itemsCrafted,
      snap.stats.monstersKilled,
      snap.stats.blocksPlaced,
      snap.enemyCount,
      snap.godMode ? 1 : 0,
      snap.nearbyStool ? 1 : 0,
      snap.nearbyChest ? `${snap.nearbyChest.tx},${snap.nearbyChest.ty}:${snap.nearbyChest.hasLoot ? 1 : 0}` : '',
      snap.nearbyDoor ? `${snap.nearbyDoor.tx},${snap.nearbyDoor.ty}:${snap.nearbyDoor.isOpen ? 1 : 0}` : '',
      snap.nearbyNpc ? `${snap.nearbyNpc.id}` : '',
      snap.npcsSummary.map((n) => `${n.id}:${n.settled}`).join(','),
      snap.ownedAccessories.join(','),
      chestKey,
      snap.activeNpc ? `${snap.activeNpc.id}:${snap.activeNpc.healCost}` : '',
      snap.stoolSpeech ? `${snap.stoolSpeech.stage}:${snap.stoolSpeech.text}` : '',
    ].join('|');
    if (!force && key === this.lastHudKey) return;
    this.lastHudKey = key;
    this.onHudChange(snap);
  }
}
