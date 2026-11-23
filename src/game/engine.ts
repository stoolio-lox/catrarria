import { sound } from './audio';
import {
  DEBUG_CHEST_PRESETS,
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
  giveDebugItem as applyGiveDebugItem,
  unequipItemToInventory,
} from './catalog';
import { getNpcDialogue, getNpcShopItems, stepNpcAI, syncVillageNpcs } from './npc';
import {
  GRAVITY,
  InputIntent,
  MAX_WING_FUEL,
  computeDamageAfterDefense,
  createEnemy,
  createInitialPlayer,
  explodeTilesRadius,
  isBossKind,
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
  HudSnapshot,
  InventorySlot,
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
  BIOME_NAMES,
  WORLD_VARIANTS,
  buildQuickHouseAt,
  findValidNpcHouses,
  generateWorld,
  getBiomeAtX,
  getNearbyStations,
  getTile,
  inspectRoomHousing,
  isInsideValidHouse,
  isTileSolid,
  recomputeLighting,
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
  private npcSyncTimer = 0.6;
  private starFallTimer = 11;
  private validHouseCount = 0;
  private hudEmitTimer = 0;
  private toastMessage: string | null = null;
  private toastTimer = 0;
  private bossSpawnedDay = 0;
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

    // Seed 2 starter slimes a bit off to the sides and Guide Максим near spawn
    this.spawnStarterCreatures();
    const sync = syncVillageNpcs(
      this.npcs,
      this.world,
      () => this.nextEntityId++,
      this.player,
      this.stats.bossDefeated,
    );
    this.validHouseCount = sync.validHouseCount;
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
    this.settings = { ...next };
    saveSettings(this.settings);
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
    );
    this.validHouseCount = sync.validHouseCount;
    const variantMeta = WORLD_VARIANTS[this.worldVariant];
    this.showToast(`Мир «${variantMeta.title}» создан! Рядом Гид Максим и табуретка.`);
    this.setPhase('playing');
  }

  public regenerateWorldVariant(variant: WorldVariant): void {
    this.startNewGame(variant);
  }

  public clearInputs(): void {
    this.keys.clear();
    this.jumpJustPressed = false;
    this.mouseLeftDown = false;
    this.mouseRightDown = false;
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
    if (button === 0) this.mouseLeftDown = true;
    if (button === 2) this.mouseRightDown = true;
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
        ? 'Режим стройки: ЛКМ ставит блоки'
        : 'Обычный режим: ЛКМ атака/копка, ПКМ стройка',
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

    const def = ITEMS[dropped.itemId];
    const label = `${def?.name ?? dropped.itemId}${dropped.droppedCount > 1 ? ` ×${dropped.droppedCount}` : ''}`;
    this.spawnFloatingText(pcx, this.player.y - 10, `Выброшено: ${label}`, '#fde68a');
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
      this.showToast('Нет места в рюкзаке, чтобы снять экипировку!');
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
      const item = ITEMS[recipe.resultId];
      this.showToast(`Скрафчено: ${item?.name ?? recipe.resultId} ×${recipe.resultCount}`);
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
      const res = buildQuickHouseAt(this.world, anchorX, floorY);
      if (!res.built) {
        this.showToast(res.reason ?? 'Здесь нельзя построить дом!');
        return false;
      }
      slot.count--;
      if (slot.count <= 0) {
        this.hotbar[this.selectedSlot] = null;
      }
      this.stats.blocksPlaced += 16;
      recomputeLighting(this.world, this.timeOfDay);
      sound.playCraft();
      sound.playPlace();
      this.spawnBurst(res.centerTileX * TILE_SIZE, res.centerTileY * TILE_SIZE, '#fde047', 18, 170);
      const sync = syncVillageNpcs(
        this.npcs,
        this.world,
        () => this.nextEntityId++,
        this.player,
        this.stats.bossDefeated,
      );
      this.validHouseCount = sync.validHouseCount;
      this.showToast(
        sync.spawnedNames.length > 0
          ? `Дом построен! Заселился житель: ${sync.spawnedNames[0]}!`
          : 'Уютный дом построен! (Домов: ' + this.validHouseCount + ')',
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
      this.showToast('Волшебное зеркало перенесло кота домой!');
      this.emitHud(true);
      return true;
    }

    if (def.specialKind === 'life_crystal') {
      if (this.player.maxHp >= 400) {
        this.showToast('Максимум HP (400) уже достигнут!');
        return false;
      }
      this.player.maxHp = Math.min(400, this.player.maxHp + 20);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
      this.spawnFloatingText(pcx, this.player.y - 12, '+20 Макс. HP!', '#f472b6');
      this.spawnBurst(pcx, pcy, '#ec4899', 16, 160);
      sound.playStar();
    } else if (def.specialKind === 'mana_crystal') {
      if (this.player.maxMana >= 200) {
        this.showToast('Максимум маны (200) уже достигнут!');
        return false;
      }
      this.player.maxMana = Math.min(200, this.player.maxMana + 20);
      this.player.mana = Math.min(this.player.maxMana, this.player.mana + 40);
      this.spawnFloatingText(pcx, this.player.y - 12, '+20 Макс. Мана!', '#60a5fa');
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
        this.showToast(`Защита кота выросла до ${this.player.defense}!`);
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

    const existing = this.enemies.find((e) => e.kind === kind && e.aiState !== 'ko');
    if (existing) {
      this.showToast(`${existing.name} уже на арене!`);
      return false;
    }

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
    );
    this.enemies.push(boss);
    sound.playBossRoar();
    this.trauma = Math.min(1, this.trauma + 0.5);
    this.showToast(`${boss.name} пробудился!`);
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
      const def = ITEMS[slot.itemId];
      this.showToast(`Взято из сундука: ${def?.name ?? slot.itemId} ×${taken}`);
    }
    if (leftover <= 0) {
      items.splice(itemIdx, 1);
    } else {
      slot.count = leftover;
      this.showToast('Инвентарь полон!');
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
      this.showToast(items.length === 0 ? 'Сундук полностью собран!' : 'Часть предметов осталась (рюкзак полон).');
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
    this.spawnFloatingText(wx, wy - 8, '♥ Мур!', '#f9a8d4');
    this.stoolSpeech = {
      stage: 'petted',
      text: 'Нажми на меня ПКМ',
      timer: 14,
    };
    this.showToast('Табуретка мурлычет: «Нажми на меня ПКМ»');
    this.emitHud(true);
  }

  public interactStoolRightClick(tx: number, ty: number): void {
    const wx = (tx + 0.5) * TILE_SIZE;
    const wy = ty * TILE_SIZE;
    if (!this.stoolPetted) {
      this.showToast('Сначала погладь табуретку! (ЛКМ или F рядом)');
      this.spawnFloatingText(wx, wy - 8, 'Погладь меня!', '#fde047');
      this.emitHud(true);
      return;
    }

    this.copyToClipboard(STOOL_REPO_URL);
    sound.playStoolCopy();
    this.spawnBurst(wx, wy, '#34d399', 16, 150);
    this.spawnFloatingText(wx, wy - 10, 'Скопировано!', '#6ee7b7');
    this.stoolSpeech = {
      stage: 'copied',
      text: 'Вставь это в браузер',
      hint: 'Подсказка для тех, кто тупой: нажми Ctrl+V',
      copiedUrl: STOOL_REPO_URL,
      timer: 25,
    };
    this.showToast('Табуретка: «Вставь это в браузер» — ссылка скопирована!');
    this.emitHud(true);
  }

  public dismissStoolSpeech(): void {
    this.stoolSpeech = null;
    this.emitHud(true);
  }

  public copyStoolUrlAgain(): void {
    this.copyToClipboard(STOOL_REPO_URL);
    sound.playStoolCopy();
    this.showToast('Ссылка снова скопирована! Нажми Ctrl+V в браузере.');
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
    this.showToast(enabled ? 'Дебаг: Режим бога ВКЛ' : 'Дебаг: Режим бога ВЫКЛ');
    this.emitHud(true);
  }

  public restoreVitals(): void {
    const bonuses = computeEquipmentBonuses(this.equipment);
    this.player.hp = this.player.maxHp;
    this.player.mana = this.player.maxMana + bonuses.maxManaBonus;
    sound.playHeal();
    this.showToast('Дебаг: HP и Мана восстановлены');
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
    recomputeLighting(this.world, this.timeOfDay);
    this.syncMusicTheme();
    this.showToast(
      preset === 'morning'
        ? 'Дебаг: Установлено утро'
        : preset === 'noon'
          ? 'Дебаг: Установлен полдень'
          : preset === 'evening'
            ? 'Дебаг: Установлен вечер'
            : 'Дебаг: Наступила ночь',
    );
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
  }

  public giveDebugItem(itemId: string, count: number): void {
    const res = applyGiveDebugItem(this.hotbar, this.backpack, itemId, count);
    if (!ITEMS[itemId]) {
      this.showToast(`Дебаг: Предмет "${itemId}" не найден`);
      this.emitHud(true);
      return;
    }
    if (res.given <= 0) {
      this.showToast('Дебаг: Инвентарь переполнен!');
      this.emitHud(true);
      return;
    }
    sound.playPickup();
    this.syncActiveWeapon();
    this.showToast(
      res.leftover > 0
        ? `Дебаг: Выдано ${res.itemName} ×${res.given} (остаток ${res.leftover} не влез)`
        : `Дебаг: Выдано ${res.itemName} ×${res.given}`,
    );
    this.emitHud(true);
  }

  public giveDebugChest(
    preset: DebugChestPreset,
    mode: 'inventory' | 'place' | 'place_and_open',
  ): void {
    if (mode === 'inventory') {
      const res = applyGiveDebugItem(this.hotbar, this.backpack, 'chest_item', 1);
      if (res.given <= 0) {
        this.showToast('Дебаг: Инвентарь переполнен!');
      } else {
        sound.playPickup();
        this.syncActiveWeapon();
        this.showToast('Дебаг: Сундук добавлен в инвентарь!');
      }
      this.emitHud(true);
      return;
    }

    const placed = placeDebugChestNearPlayer(this.world, this.player, preset);
    if (!placed.placed) {
      this.showToast('Дебаг: Рядом нет свободного места для сундука!');
      return;
    }

    this.stats.blocksPlaced++;
    recomputeLighting(this.world, this.timeOfDay);
    sound.playPlace();
    this.spawnBurst(
      (placed.tx + 0.5) * TILE_SIZE,
      (placed.ty + 0.5) * TILE_SIZE,
      '#facc15',
      14,
      150,
    );
    const presetMeta = DEBUG_CHEST_PRESETS[preset];
    this.showToast(`Дебаг: Поставлен «${presetMeta.label}» (${placed.tx}, ${placed.ty})`);

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
    this.showToast(`Дебаг: Монет теперь ${this.player.coins}`);
    this.emitHud(true);
  }

  public resetDebugCoins(): void {
    this.player.coins = 0;
    this.showToast('Дебаг: Монеты сброшены до 0');
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
    this.showToast(`Дебаг: Макс. HP ${this.player.maxHp}, Мана ${this.player.maxMana}`);
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
      const attempt = buildQuickHouseAt(this.world, anchorX, floorY);
      if (attempt.built) {
        builtRes = attempt;
        break;
      }
      if (!builtRes) builtRes = attempt;
    }

    if (!builtRes || !builtRes.built) {
      this.showToast(builtRes?.reason ?? 'Дебаг: Нет места для постройки дома рядом');
      return;
    }

    this.stats.blocksPlaced += 16;
    recomputeLighting(this.world, this.timeOfDay);
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
    );
    this.validHouseCount = sync.validHouseCount;
    this.showToast(
      sync.spawnedNames.length > 0
        ? `Дебаг: Дом построен! Заселился ${sync.spawnedNames[0]}`
        : `Дебаг: Дом построен! (Домов: ${this.validHouseCount})`,
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
        'ruby_greatsword',
        'obsidian_nightblade',
        'starfury',
        'terra_blade',
        'fish_spear',
        'copper_bow',
        'ice_bow',
        'gold_bow',
        'crimson_bow',
        'crystal_bow',
        'minishark',
        'fish_boomerang',
        'fire_staff',
        'frost_wand',
        'water_bolt',
        'laser_pointer',
        'yarn_bomb',
        'copper_pickaxe',
        'ice_pickaxe',
        'gold_pickaxe',
        'crimson_pickaxe',
        'obsidian_pickaxe',
      ];
      for (const id of weaponIds) {
        addItemToInventory(this.hotbar, this.backpack, id, id === 'yarn_bomb' ? 25 : 1);
      }
      this.showToast('Дебаг: Выданы все кирки, мечи, луки и магия!');
    } else if (kind === 'armor') {
      const armorAndAcc = [
        'crimson_helmet',
        'crimson_chestplate',
        'crimson_greaves',
        'obsidian_helmet',
        'obsidian_chestplate',
        'obsidian_greaves',
        'crystal_helmet',
        'crystal_chestplate',
        'crystal_greaves',
        'angel_wings',
        'cobalt_shield',
        'hermes_boots',
        'cloud_in_bottle',
        'shiny_red_balloon',
        'mana_flower',
        'celestial_emblem',
        'band_of_regen',
      ];
      for (const id of armorAndAcc) {
        addItemToInventory(this.hotbar, this.backpack, id, 1);
      }
      this.showToast('Дебаг: Выдана топ-броня, Крылья Ангела и аксессуары!');
    } else if (kind === 'terraria') {
      const terrariaItems: [string, number][] = [
        ['starfury', 1],
        ['terra_blade', 1],
        ['minishark', 1],
        ['water_bolt', 1],
        ['grappling_hook', 1],
        ['angel_wings', 1],
        ['cobalt_shield', 1],
        ['cloud_in_bottle', 1],
        ['hermes_boots', 1],
        ['band_of_regen', 1],
        ['magic_mirror', 1],
        ['life_crystal', 3],
        ['mana_crystal', 2],
        ['house_blueprint', 2],
        ['dynamite', 12],
        ['terraria_bomb', 15],
        ['rope_item', 30],
        ['chandelier_item', 2],
        ['piggy_bank_item', 1],
      ];
      for (const [id, cnt] of terrariaItems) {
        addItemToInventory(this.hotbar, this.backpack, id, cnt);
      }
      this.player.coins += 250;
      this.showToast('Дебаг: Выдан легендарный Терра-набор и +250 монет!');
    } else if (kind === 'resources') {
      const mats: [string, number][] = [
        ['planks_block', 99],
        ['wood_wall', 99],
        ['brick_block', 64],
        ['snow_brick', 64],
        ['crimson_brick', 64],
        ['marble_block', 64],
        ['sandstone_brick', 64],
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
        ['workbench_item', 1],
        ['furnace_item', 1],
        ['anvil_item', 1],
        ['chest_item', 2],
      ];
      for (const [id, cnt] of mats) {
        addItemToInventory(this.hotbar, this.backpack, id, cnt);
      }
      this.showToast('Дебаг: Выданы ресурсы, мебель, блоки и станции!');
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
        'summon_moon_lord',
      ];
      for (const id of summons) {
        addItemToInventory(this.hotbar, this.backpack, id, 2);
      }
      this.showToast('Дебаг: Выданы призывалки всех 19 боссов!');
    } else {
      addItemToInventory(this.hotbar, this.backpack, 'stool_item', 1);
      this.showToast('Дебаг: Табуретка добавлена в инвентарь!');
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
    );
    this.validHouseCount = sync.validHouseCount;
    sound.playNpcTalk();
    this.showToast('Все 5 жителей (Гид, Торговец, Медсестра, Подрывник, Дриада) прибыли!');
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
      this.player.y - (kind === 'bat' ? 120 : 20),
      1 + (this.dayCount - 1) * 0.15,
    );
    this.enemies.push(enemy);
    this.showToast(`Дебаг: Призван ${enemy.name}`);
    this.emitHud(true);
  }

  public clearAllEnemies(): void {
    this.enemies = [];
    this.projectiles = this.projectiles.filter((p) => p.fromPlayer);
    this.showToast('Дебаг: Все враги убраны');
    this.emitHud(true);
  }

  public teleportToSpawn(): void {
    this.player.x = this.player.spawnX;
    this.player.y = this.player.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.centerCameraImmediate();
    this.showToast('Дебаг: Телепорт на спавн');
    this.emitHud(true);
  }

  public teleportToCoords(tileX: number, tileY: number): void {
    const dest = teleportPlayerToCoords(this.player, this.world, tileX, tileY);
    this.centerCameraImmediate();
    const biome = getBiomeAtX(dest.tx, this.world.width);
    this.showToast(`Телепорт: X=${dest.tx}, Y=${dest.ty} (${BIOME_NAMES[biome]})`);
    this.emitHud(true);
    if (this.uiModalOpen) {
      this.render();
    }
  }

  public boostDefense(delta: number): void {
    this.player.defense = Math.max(0, Math.min(50, this.player.defense + delta));
    this.showToast(`Дебаг: Броня теперь ${this.player.defense}`);
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
      this.showToast(`Наступил день ${this.dayCount}!`);
    }

    // Update lighting periodically
    this.lightUpdateTimer -= dt;
    if (this.lightUpdateTimer <= 0) {
      recomputeLighting(this.world, this.timeOfDay);
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
        this.showToast('Уютный дом построен! Здоровье восстанавливается.');
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
      const dir = input.right ? 1 : -1;
      const frontX = dir > 0 ? this.player.x + this.player.width + 6 : this.player.x - 6;
      const frontTx = Math.floor(frontX / TILE_SIZE);
      const topTy = Math.floor((this.player.y + 6) / TILE_SIZE);
      const botTy = Math.floor((this.player.y + this.player.height - 4) / TILE_SIZE);
      for (let ty = topTy; ty <= botTy; ty++) {
        if (getTile(this.world, frontTx, ty) === TileType.DoorClosed) {
          const opened = toggleDoorAtTile(this.world, this.player, frontTx, ty);
          if (opened.toggled) {
            sound.playPlace();
            recomputeLighting(this.world, this.timeOfDay);
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
        speedMult: equipBonuses.speedMult,
        jumpMult: equipBonuses.jumpMult,
        hasDoubleJump: equipBonuses.hasDoubleJump,
        hasWings: equipBonuses.hasWings,
        manaRegenBonus: equipBonuses.manaRegenBonus,
      },
    );
    const effectiveMaxMana = this.player.maxMana + equipBonuses.maxManaBonus;
    if (
      equipBonuses.maxManaBonus > 0 &&
      this.player.mana >= this.player.maxMana &&
      this.player.mana < effectiveMaxMana
    ) {
      const manaRate = (this.player.houseValid ? 8 : 5) + equipBonuses.manaRegenBonus;
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
      if (!equipBonuses.hasNoFallDamage && !this.godMode && preStepVy > 590) {
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
      );
      this.validHouseCount = sync.validHouseCount;
      if (sync.spawnedNames.length > 0) {
        this.showToast(`В деревню поселился житель: ${sync.spawnedNames[0]}!`);
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

    const wantPlace = this.mouseRightDown || (this.mouseLeftDown && this.activeToolMode === 'build');
    const wantPrimary = this.mouseLeftDown && this.activeToolMode !== 'build';

    // Right-clicking (or Build-mode LMB on) a door, chest, stool, bed, or NPC works regardless of held item
    if (this.mouseRightDown && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Chest) {
      this.openChest(tx, ty);
      this.placeCooldown = 0.35;
      return;
    }
    if (this.mouseRightDown && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Stool) {
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
        recomputeLighting(this.world, this.timeOfDay);
        this.emitHud();
      } else if (doorRes.blockedByPlayer) {
        this.showToast('Отойди от проёма, чтобы закрыть дверь!');
        this.emitHud();
      }
      this.placeCooldown = 0.25;
      return;
    }
    if (this.mouseRightDown && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Bed) {
      this.player.spawnX = tx * TILE_SIZE + 2;
      this.player.spawnY = ty * TILE_SIZE - this.player.height - 2;
      sound.playHeal();
      this.showToast('Точка возрождения установлена на лежанку!');
      this.placeCooldown = 0.4;
      return;
    }
    if (this.mouseRightDown && this.placeCooldown <= 0) {
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
      if (item?.category === 'summon' && item.summonsBoss) {
        this.summonBoss(item.summonsBoss, true);
        this.placeCooldown = 0.5;
        return;
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
          recomputeLighting(this.world, this.timeOfDay);
          this.placeCooldown = 0.14;
          this.emitHud();
        } else if (res.action === 'door_toggle') {
          sound.playPlace();
          this.placeCooldown = 0.25;
        } else if (res.action === 'bed_spawn') {
          sound.playHeal();
          this.showToast('Точка возрождения установлена на лежанку!');
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

      if (item.category === 'summon' && item.summonsBoss) {
        this.summonBoss(item.summonsBoss, true);
        this.attackCooldown = 0.5;
        return;
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
              recomputeLighting(this.world, this.timeOfDay);
            } else {
              sound.playMineHit();
              this.spawnBurst(tileX, tileY, '#94a3b8', 4, 70);
            }
          }
        }
        this.triggerSwingAnimation(item.cooldown ?? 0.22, wx, wy);
        // Pickaxes can also bop nearby monsters and break nearby pots!
        this.performMeleeHitbox(item.damage ?? 6, item.reach ?? 54, item.knockback ?? 3);
        this.attackCooldown = item.cooldown ?? 0.22;
        return;
      }

      if (item.category === 'weapon') {
        this.fireWeapon(item, slot!, wx, wy);
        return;
      }

      // If holding a block in auto mode and clicking LMB, also allow placing!
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
          recomputeLighting(this.world, this.timeOfDay);
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
    const manaCost = Math.max(0, Math.round((item.manaCost ?? 0) * bonuses.manaCostMult));
    if (manaCost > 0 && this.player.mana < manaCost) {
      this.showToast('Недостаточно маны!');
      this.attackCooldown = 0.25;
      return;
    }

    const dmgScale = bonuses.damageMult;
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

      if (item.id === 'starfury') {
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
      } else if (item.id === 'terra_blade') {
        const beamSpeed = 620;
        sound.playMagic();
        this.projectiles.push({
          id: this.nextEntityId++,
          fromPlayer: true,
          kind: 'terra_beam',
          x: pcx,
          y: pcy,
          vx: Math.cos(angle) * beamSpeed,
          vy: Math.sin(angle) * beamSpeed,
          radius: 11,
          damage: scaledDamage(Math.round((item.damage ?? 58) * 0.9)),
          knockback: 5.5,
          life: 1.1,
          maxLife: 1.1,
          pierceLeft: 3,
          aoeRadius: 0,
          color: '#10b981',
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
      const spread = (Math.random() - 0.5) * 0.08;
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
        color: '#fde047',
        hitIds: [],
      });
    } else if (item.weaponKind === 'magic') {
      sound.playMagic();
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
        life: 0.7,
        maxLife: 0.7,
        pierceLeft: item.pierce ?? 2,
        aoeRadius: 0,
        color: '#ef4444',
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
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: isDynamite ? 'dynamite' : 'yarn_bomb',
        x: pcx,
        y: pcy,
        vx,
        vy: vy - 90,
        radius: 9,
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
      slot.count--;
      if (slot.count <= 0) {
        this.hotbar[this.selectedSlot] = null;
        this.syncActiveWeapon();
        this.emitHud();
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
    const dmg = computeDamageAfterDefense(rawDmg, enemy.defense);
    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.06;
    enemy.vx = kbX;
    enemy.vy = Math.min(enemy.vy, kbY);

    const ex = enemy.x + enemy.width / 2;
    const ey = enemy.y + enemy.height / 2;
    this.spawnFloatingText(ex, enemy.y - 6, `${dmg}`, '#fde047');
    this.spawnBurst(ex, ey, '#f87171', 12, 160);
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
      this.spawnFloatingText(ex, enemy.y - 20, `+${coinReward} монет`, '#facc15');
      sound.playCoin();

      if (isBossKind(enemy.kind)) {
        this.stats.bossDefeated = true;
        this.showToast(`${enemy.name} повержен! +${coinReward} монет и трофеи!`);
        this.syncMusicTheme();
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

      // Trail particles for magic/bombs/stars
      if (
        p.kind === 'fireball' ||
        p.kind === 'frost_bolt' ||
        p.kind === 'yarn_bomb' ||
        p.kind === 'dynamite' ||
        p.kind === 'star_rain' ||
        p.kind === 'terra_beam' ||
        p.kind === 'water_bolt'
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
      if (hitSolidTile && p.kind !== 'boomerang') {
        if (p.kind === 'water_bolt' && (p.bouncesLeft ?? 0) > 0) {
          p.bouncesLeft = (p.bouncesLeft ?? 1) - 1;
          if (tx !== prevTx) p.vx *= -1;
          else p.vy *= -1;
          p.x += p.vx * dt * 1.4;
          p.y += p.vy * dt * 1.4;
          sound.playMagic();
        } else if (p.kind === 'star_rain' && p.y < this.player.y - 40) {
          // Starfury stars fall past sky canopy toward target elevation
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
      recomputeLighting(this.world, this.timeOfDay);
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
    const depthTiles = Math.floor(this.player.y / TILE_SIZE) - this.world.surfaceHeights[Math.floor(this.player.x / TILE_SIZE)];
    const underground = depthTiles > 6;

    // Multi-knob difficulty ramp
    const maxEnemies = Math.min(11, 4 + this.dayCount + (isNight ? 3 : 0));
    this.spawnTimer = isNight ? 4.2 : 6.2;

    if (this.enemies.length >= maxEnemies) return;

    // Auto-spawn Eye Boss on Night 2+ once per night
    if (isNight && this.dayCount >= 2 && this.bossSpawnedDay < this.dayCount) {
      this.bossSpawnedDay = this.dayCount;
      this.summonNightBoss();
      return;
    }

    // Pick spawn offset away from player
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

    // Never spawn inside solid blocks or inside player's valid house
    if (isTileSolid(getTile(this.world, tx, ty))) return;
    if (isInsideValidHouse(this.world, spawnWorldX, ty * TILE_SIZE)) return;

    const biome = getBiomeAtX(tx, this.world.width);
    let kind: EnemyKind = 'slime';
    if (underground) {
      kind = Math.random() < 0.55 ? 'bat' : 'skeleton';
    } else if (biome === 'crimson') {
      const r = Math.random();
      kind = r < 0.45 ? 'goblin' : r < 0.8 ? 'skeleton' : 'bat';
    } else if (biome === 'snow') {
      const r = Math.random();
      kind = r < 0.5 ? 'slime' : r < 0.8 ? 'bat' : 'skeleton';
    } else if (isNight) {
      const r = Math.random();
      kind = r < 0.45 ? 'goblin' : r < 0.8 ? 'skeleton' : 'bat';
    } else {
      kind = Math.random() < 0.8 ? 'slime' : 'goblin';
    }

    const scale = 1 + (this.dayCount - 1) * 0.2 + (biome === 'crimson' ? 0.2 : 0);
    this.enemies.push(
      createEnemy(this.nextEntityId++, kind, spawnWorldX, ty * TILE_SIZE, scale),
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

      if (aiRes.spawnMinionKind && this.enemies.length < 14) {
        const minion = createEnemy(
          this.nextEntityId++,
          aiRes.spawnMinionKind,
          enemy.x + enemy.width / 2,
          enemy.y,
          1,
        );
        minion.vy = -260;
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
        this.damagePlayer(enemy.damage, dir);
      }
    }
  }

  private damagePlayer(rawDmg: number, knockDir: number): void {
    if (this.godMode) return;
    const bonuses = computeEquipmentBonuses(this.equipment);
    const totalDefense = this.player.defense + bonuses.defense;
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
      const canMagnet = !d.noAutoMagnet && dist < 84;
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
            const def = ITEMS[d.itemId];
            this.spawnFloatingText(d.x, d.y - 10, `+${d.count - leftover} ${def?.name ?? ''}`, '#bae6fd');
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
    this.spawnFloatingText(wx, wy - 12, `+${loot.coins} монет`, '#facc15');
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
      this.showToast('Нужен Крюк-кошка (купи у Торговца Бориса или найди в сундуке)!');
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
      recomputeLighting(this.world, this.timeOfDay);
      this.emitHud(true);
      return true;
    }
    if (res.blockedByPlayer) {
      this.showToast('Отойди от проёма, чтобы закрыть дверь!');
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
      this.showToast(`Не хватает монет (нужно ${entry.price})!`);
      return false;
    }

    const leftover = addItemToInventory(this.hotbar, this.backpack, itemId, 1);
    if (leftover > 0) {
      this.showToast('Рюкзак переполнен!');
      return false;
    }

    this.player.coins -= entry.price;
    sound.playCoin();
    const def = ITEMS[itemId];
    this.showToast(`Куплено у ${npc.name}: ${def?.name ?? itemId}`);
    this.syncActiveWeapon();
    this.emitHud(true);
    return true;
  }

  public healAtNurse(): boolean {
    if (this.activeNpcId === null) return false;
    const npc = this.npcs.find((n) => n.id === this.activeNpcId && n.kind === 'nurse');
    if (!npc) return false;
    if (this.player.hp >= this.player.maxHp) {
      this.showToast('Здоровье котика уже полное!');
      return false;
    }
    const cost = this.getNurseHealCost();
    const bonuses = computeEquipmentBonuses(this.equipment);
    this.player.coins = Math.max(0, this.player.coins - cost);
    this.player.hp = this.player.maxHp;
    this.player.mana = this.player.maxMana + bonuses.maxManaBonus;
    sound.playHeal();
    this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#4ade80', 14, 150);
    this.showToast(cost > 0 ? `Медсестра Алина вылечила кота за ${cost} монет!` : 'Медсестра Алина вылечила кота бесплатно!');
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
    const boss = this.enemies.find((e) => isBossKind(e.kind) && e.aiState !== 'ko');
    const nearbyStool = this.findNearestStoolTile(4.5) !== null;
    const nearbyChest = this.findNearestChestTile(4.5);
    const nearbyDoor = this.findNearestDoorTile(3.2);
    const nearbyNpcEntity = this.findNearestNpc(118);
    const roomInspection = inspectRoomHousing(this.world, pxTile, pyTile);
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
          name: activeNpcEntity.name,
          title: activeNpcEntity.title,
          quote: getNpcDialogue(activeNpcEntity, {
            isNight,
            biome,
            validHouseCount: this.validHouseCount,
            hasBoss: Boolean(boss),
            stoolPetted: this.stoolPetted,
          }),
          settled: activeNpcEntity.homeTileX !== null,
          shopItems: getNpcShopItems(activeNpcEntity.kind),
          canHeal: activeNpcEntity.kind === 'nurse',
          healCost: this.getNurseHealCost(),
        }
      : null;

    const bonuses = computeEquipmentBonuses(this.equipment);
    const equipmentCopy: EquipmentState = {
      helmet: this.equipment.helmet ? { ...this.equipment.helmet } : null,
      chestplate: this.equipment.chestplate ? { ...this.equipment.chestplate } : null,
      greaves: this.equipment.greaves ? { ...this.equipment.greaves } : null,
      accessories: this.equipment.accessories.map((a) => (a ? { ...a } : null)),
    };

    return {
      phase: this.phase,
      hp: Math.round(this.player.hp),
      maxHp: this.player.maxHp,
      mana: Math.round(this.player.mana),
      maxMana: this.player.maxMana + bonuses.maxManaBonus,
      defense: this.player.defense + bonuses.defense,
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
      wingFuel: this.player.wingFuel,
      wingFuelMax: MAX_WING_FUEL,
      selectedSlot: this.selectedSlot,
      activeToolMode: this.activeToolMode,
      stats: { ...this.stats },
      enemyCount: this.enemies.length,
      bossInfo: boss ? { name: boss.name, hp: Math.round(boss.hp), maxHp: boss.maxHp } : null,
      toastMessage: this.toastMessage,
      godMode: this.godMode,
      nearbyStool,
      nearbyChest,
      nearbyDoor,
      nearbyNpc: nearbyNpcEntity
        ? {
            id: nearbyNpcEntity.id,
            kind: nearbyNpcEntity.kind,
            name: nearbyNpcEntity.name,
            title: nearbyNpcEntity.title,
          }
        : null,
      npcsSummary: this.npcs.map((n) => ({
        id: n.id,
        kind: n.kind,
        name: n.name,
        title: n.title,
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
    const chestKey = snap.activeChest
      ? `${snap.activeChest.tx},${snap.activeChest.ty}:${snap.activeChest.items
          .map((s) => (s ? `${s.itemId}:${s.count}` : ''))
          .join(',')}`
      : '';
    const key = [
      snap.phase,
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
      snap.bossInfo ? `${snap.bossInfo.name}:${snap.bossInfo.hp}` : '',
      snap.nearbyStations.join(','),
      hotbarKey,
      backpackKey,
      equipKey,
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
