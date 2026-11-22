import { sound } from './audio';
import {
  ITEMS,
  RECIPES,
  STOOL_REPO_URL,
  addItemToInventory,
  craftRecipe,
  createStarterInventory,
  dropFromSlot,
} from './catalog';
import {
  GRAVITY,
  InputIntent,
  computeDamageAfterDefense,
  createEnemy,
  createInitialPlayer,
  moveEntityWithTiles,
  rectsOverlap,
  stepEnemyAI,
  stepPlayerPhysics,
  tryDamageTile,
  tryPlaceItemAtTile,
} from './physics';
import { LoadedTextures, loadGameTextures, renderGameFrame } from './renderer';
import {
  DropEntity,
  EnemyEntity,
  EnemyKind,
  FloatingText,
  GamePhase,
  HudSnapshot,
  InventorySlot,
  Particle,
  PlayerState,
  ProjectileEntity,
  RunStats,
  TILE_SIZE,
  TileType,
  WorldData,
} from './types';
import {
  generateWorld,
  getNearbyStations,
  getTile,
  isInsideValidHouse,
  isTileSolid,
  recomputeLighting,
} from './worldGen';

const PARTICLE_POOL_SIZE = 180;
const DAY_DURATION_SEC = 110;

export class KotarriaEngine {
  public phase: GamePhase = 'title';
  public world: WorldData;
  public player: PlayerState;
  public hotbar: (InventorySlot | null)[];
  public backpack: (InventorySlot | null)[];
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
  private hudEmitTimer = 0;
  private toastMessage: string | null = null;
  private toastTimer = 0;
  private bossSpawnedDay = 0;
  public godMode = false;
  public uiModalOpen = false;
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

    this.world = generateWorld(42069);
    this.player = createInitialPlayer(this.world);
    const inv = createStarterInventory();
    this.hotbar = inv.hotbar;
    this.backpack = inv.backpack;
    this.syncActiveWeapon();

    // Seed 2 starter slimes a bit off to the sides so the world feels alive right away
    this.spawnStarterCreatures();
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

  private ensureLoopRunning(): void {
    if (
      this.rafId === null &&
      this.canvas &&
      (this.phase === 'title' || (this.phase === 'playing' && !this.uiModalOpen))
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
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.render();
    } else if (this.phase === 'playing') {
      this.ensureLoopRunning();
    }
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
      this.ensureLoopRunning();
    } else {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.render();
    }
    this.emitHud(true);
  }

  public startNewGame(): void {
    this.world = generateWorld(Math.floor(Date.now() % 100000) + 777);
    this.player = createInitialPlayer(this.world);
    const inv = createStarterInventory();
    this.hotbar = inv.hotbar;
    this.backpack = inv.backpack;
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
    this.showToast('Добро пожаловать в Котаррию! Построй дом и скрафти оружие.');
    this.setPhase('playing');
  }

  public clearInputs(): void {
    this.keys.clear();
    this.jumpJustPressed = false;
    this.mouseLeftDown = false;
    this.mouseRightDown = false;
  }

  public handleKeyDown(code: string): void {
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
    } else if (code === 'KeyF') {
      this.petNearestStool();
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

  public useSelectedConsumable(): boolean {
    const slot = this.hotbar[this.selectedSlot];
    if (!slot) return false;
    const def = ITEMS[slot.itemId];
    if (!def || def.category !== 'consumable') return false;

    if (def.healAmount) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + def.healAmount);
      this.spawnFloatingText(
        this.player.x + this.player.width / 2,
        this.player.y - 10,
        `+${def.healAmount} HP`,
        '#4ade80',
      );
    }
    if (def.manaAmount) {
      this.player.mana = Math.min(this.player.maxMana, this.player.mana + def.manaAmount);
    }
    if (def.defenseBonus) {
      this.player.defense = Math.min(14, this.player.defense + def.defenseBonus);
      this.showToast(`Защита кота выросла до ${this.player.defense}!`);
    }

    slot.count--;
    if (slot.count <= 0) {
      this.hotbar[this.selectedSlot] = null;
    }
    sound.playHeal();
    this.syncActiveWeapon();
    this.emitHud();
    return true;
  }

  public summonNightBoss(): void {
    if (this.phase !== 'playing') return;
    if (this.enemies.some((e) => e.kind === 'eye_boss')) return;
    const boss = createEnemy(
      this.nextEntityId++,
      'eye_boss',
      this.player.x + 260 * this.player.facing,
      this.player.y - 180,
      1 + (this.dayCount - 1) * 0.15,
    );
    this.enemies.push(boss);
    this.showToast('Око Ночи пробудилось!');
    this.emitHud();
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
      this.player.hp = this.player.maxHp;
      this.player.mana = this.player.maxMana;
    }
    this.showToast(enabled ? 'Дебаг: Режим бога ВКЛ' : 'Дебаг: Режим бога ВЫКЛ');
    this.emitHud(true);
  }

  public restoreVitals(): void {
    this.player.hp = this.player.maxHp;
    this.player.mana = this.player.maxMana;
    sound.playHeal();
    this.showToast('Дебаг: HP и Мана восстановлены');
    this.emitHud(true);
  }

  public setTimePreset(preset: 'morning' | 'noon' | 'night'): void {
    this.timeOfDay = preset === 'morning' ? 0.14 : preset === 'noon' ? 0.25 : 0.72;
    recomputeLighting(this.world, this.timeOfDay);
    this.showToast(
      preset === 'morning'
        ? 'Дебаг: Установлено утро'
        : preset === 'noon'
          ? 'Дебаг: Установлен полдень'
          : 'Дебаг: Наступила ночь',
    );
    this.emitHud(true);
  }

  public giveDebugKit(kind: 'weapons' | 'resources' | 'stool'): void {
    if (kind === 'weapons') {
      const weaponIds = [
        'ruby_greatsword',
        'iron_broadsword',
        'fish_spear',
        'gold_bow',
        'fish_boomerang',
        'fire_staff',
        'frost_wand',
        'laser_pointer',
        'yarn_bomb',
        'gold_pickaxe',
      ];
      for (const id of weaponIds) {
        addItemToInventory(this.hotbar, this.backpack, id, id === 'yarn_bomb' ? 25 : 1);
      }
      this.showToast('Дебаг: Выдан весь арсенал оружий!');
    } else if (kind === 'resources') {
      const mats: [string, number][] = [
        ['planks_block', 99],
        ['wood_wall', 99],
        ['brick_block', 64],
        ['torch_item', 50],
        ['iron_bar', 40],
        ['gold_bar', 40],
        ['ruby_gem', 20],
        ['monster_bone', 30],
        ['slime_gel', 40],
        ['workbench_item', 1],
        ['furnace_item', 1],
        ['anvil_item', 1],
      ];
      for (const [id, cnt] of mats) {
        addItemToInventory(this.hotbar, this.backpack, id, cnt);
      }
      this.showToast('Дебаг: Выданы ресурсы и станции!');
    } else {
      addItemToInventory(this.hotbar, this.backpack, 'stool_item', 1);
      this.showToast('Дебаг: Табуретка добавлена в инвентарь!');
    }
    this.syncActiveWeapon();
    this.emitHud(true);
  }

  public spawnDebugEnemy(kind: EnemyKind): void {
    const enemy = createEnemy(
      this.nextEntityId++,
      kind,
      this.player.x + 170 * this.player.facing,
      this.player.y - (kind === 'bat' || kind === 'eye_boss' ? 120 : 20),
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
    if (this.phase !== 'title' && (this.phase !== 'playing' || this.uiModalOpen)) {
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
    if (this.godMode) {
      this.player.hp = this.player.maxHp;
      this.player.mana = this.player.maxMana;
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

    const { jumped, landed } = stepPlayerPhysics(this.player, this.world, input, dt);
    if (jumped) {
      sound.playJump();
      this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#d6d3d1', 5, 80);
    }
    if (landed) {
      this.spawnBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#a8a29e', 4, 60);
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

    // Update drops & magnet pickup
    this.stepDrops(dt);

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

    // Right-clicking the stool works regardless of currently held item
    if (this.mouseRightDown && this.placeCooldown <= 0 && inRange && hoverTile === TileType.Stool) {
      this.interactStoolRightClick(tx, ty);
      this.placeCooldown = 0.35;
      return;
    }

    if (wantPlace && this.placeCooldown <= 0) {
      if (item?.category === 'consumable') {
        this.useSelectedConsumable();
        this.placeCooldown = 0.3;
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
        this.useSelectedConsumable();
        this.attackCooldown = 0.35;
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
              sound.playBlockBreak();
              this.spawnBurst(tileX, tileY, '#cbd5e1', 10, 140);
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
        // Pickaxes can also bop nearby monsters!
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
    const manaCost = item.manaCost ?? 0;
    if (manaCost > 0 && this.player.mana < manaCost) {
      this.showToast('Недостаточно маны!');
      this.attackCooldown = 0.25;
      return;
    }

    const pcx = this.player.x + this.player.width / 2;
    const pcy = this.player.y + this.player.height / 2 - 4;
    const angle = Math.atan2(targetWy - pcy, targetWx - pcx);
    const cd = item.cooldown ?? 0.3;

    this.triggerSwingAnimation(cd, targetWx, targetWy);
    this.attackCooldown = cd;

    if (manaCost > 0) {
      this.player.mana = Math.max(0, this.player.mana - manaCost);
    }

    if (item.weaponKind === 'melee' || item.weaponKind === 'spear') {
      sound.playSwing();
      this.performMeleeHitbox(item.damage ?? 15, item.reach ?? 68, item.knockback ?? 5);
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
        damage: item.damage ?? 16,
        knockback: item.knockback ?? 3.5,
        life: 2.2,
        maxLife: 2.2,
        pierceLeft: item.pierce ?? 1,
        aoeRadius: 0,
        color: item.accent,
        hitIds: [],
      });
    } else if (item.weaponKind === 'magic') {
      sound.playMagic();
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: item.id === 'frost_wand' ? 'frost_bolt' : 'fireball',
        x: pcx,
        y: pcy,
        vx,
        vy,
        radius: 8,
        damage: item.damage ?? 25,
        knockback: item.knockback ?? 4.5,
        life: 1.8,
        maxLife: 1.8,
        pierceLeft: item.pierce ?? 1,
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
        damage: item.damage ?? 17,
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
        damage: item.damage ?? 22,
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
      this.projectiles.push({
        id: this.nextEntityId++,
        fromPlayer: true,
        kind: 'yarn_bomb',
        x: pcx,
        y: pcy,
        vx,
        vy: vy - 90,
        radius: 9,
        damage: item.damage ?? 42,
        knockback: item.knockback ?? 9,
        life: 1.3,
        maxLife: 1.3,
        pierceLeft: 1,
        aoeRadius: item.aoeRadius ?? 82,
        color: '#ec4899',
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
      if (enemy.kind === 'eye_boss') {
        this.stats.bossDefeated = true;
        this.showToast('Око Ночи повержено! Слава Коту-Герою!');
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

      if (p.kind === 'arrow' || p.kind === 'yarn_bomb') {
        p.vy += GRAVITY * (p.kind === 'yarn_bomb' ? 0.85 : 0.45) * dt;
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

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Trail particles for magic/bombs
      if (p.kind === 'fireball' || p.kind === 'frost_bolt' || p.kind === 'yarn_bomb') {
        if (Math.random() < 0.55) {
          this.spawnParticle(p.x, p.y, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, p.color, 3, 0.22, 40);
        }
      }

      // Check tile impact
      const tx = Math.floor(p.x / TILE_SIZE);
      const ty = Math.floor(p.y / TILE_SIZE);
      const hitSolidTile = isTileSolid(getTile(this.world, tx, ty));

      if (hitSolidTile && p.kind !== 'boomerang') {
        if (p.kind === 'yarn_bomb' || p.aoeRadius > 0) {
          this.detonateProjectile(p);
        } else {
          this.spawnBurst(p.x, p.y, p.color, 6, 90);
        }
        this.projectiles.splice(i, 1);
        continue;
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
        if (p.kind === 'yarn_bomb') {
          this.detonateProjectile(p);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private detonateProjectile(p: ProjectileEntity): void {
    sound.playExplosion();
    this.spawnBurst(p.x, p.y, p.color, 24, 240);
    this.spawnBurst(p.x, p.y, '#fef08a', 12, 170);
    this.trauma = Math.min(1, this.trauma + 0.55);

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

    let kind: EnemyKind = 'slime';
    if (underground) {
      kind = Math.random() < 0.55 ? 'bat' : 'skeleton';
    } else if (isNight) {
      const r = Math.random();
      kind = r < 0.45 ? 'goblin' : r < 0.8 ? 'skeleton' : 'bat';
    } else {
      kind = Math.random() < 0.8 ? 'slime' : 'goblin';
    }

    const scale = 1 + (this.dayCount - 1) * 0.2;
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

      if (enemy.aiState === 'ko') {
        if (enemy.koTimer <= 0) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Despawn very far away regular mobs to keep action near player
      if (
        enemy.kind !== 'eye_boss' &&
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
    const dmg = computeDamageAfterDefense(rawDmg, this.player.defense);
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.player.invulnTimer = 0.75;
    this.player.hitFlashTimer = 0.1;
    this.player.vx = knockDir * 240;
    this.player.vy = -230;
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

    const shakeMag = this.trauma * this.trauma * 12;
    const shakeX = (Math.random() * 2 - 1) * shakeMag;
    const shakeY = (Math.random() * 2 - 1) * shakeMag;
    const { tx, ty, inRange } = this.getHoverWorldTile();
    const slot = this.hotbar[this.selectedSlot];

    renderGameFrame(this.ctx, width, height, {
      world: this.world,
      player: this.player,
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
      stoolSpeech: this.stoolSpeech
        ? { text: this.stoolSpeech.text, stage: this.stoolSpeech.stage }
        : null,
    });

    this.ctx.restore();
  }

  public getHudSnapshot(): HudSnapshot {
    const pxTile = Math.max(0, Math.min(this.world.width - 1, Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE)));
    const feetTileY = Math.round((this.player.y + this.player.height) / TILE_SIZE);
    const depthMeters = Math.max(
      0,
      Math.round((feetTileY - this.world.surfaceHeights[pxTile]) * 2),
    );
    const boss = this.enemies.find((e) => e.kind === 'eye_boss' && e.aiState !== 'ko');
    const nearbyStool = this.findNearestStoolTile(4.5) !== null;
    return {
      phase: this.phase,
      hp: Math.round(this.player.hp),
      maxHp: this.player.maxHp,
      mana: Math.round(this.player.mana),
      maxMana: this.player.maxMana,
      defense: this.player.defense,
      dayCount: this.dayCount,
      timeOfDay: this.timeOfDay,
      isNight: this.timeOfDay >= 0.55 || this.timeOfDay < 0.08,
      depthMeters,
      houseValid: this.player.houseValid,
      nearbyStations: getNearbyStations(
        this.world,
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
      ),
      hotbar: this.hotbar.map((s) => (s ? { ...s } : null)),
      backpack: this.backpack.map((s) => (s ? { ...s } : null)),
      selectedSlot: this.selectedSlot,
      activeToolMode: this.activeToolMode,
      stats: { ...this.stats },
      bossInfo: boss ? { name: boss.name, hp: Math.round(boss.hp), maxHp: boss.maxHp } : null,
      toastMessage: this.toastMessage,
      godMode: this.godMode,
      nearbyStool,
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
    const key = [
      snap.phase,
      snap.hp,
      snap.mana,
      snap.defense,
      snap.dayCount,
      snap.isNight ? 1 : 0,
      snap.depthMeters,
      snap.houseValid ? 1 : 0,
      snap.selectedSlot,
      snap.activeToolMode,
      snap.toastMessage ?? '',
      snap.bossInfo ? `${snap.bossInfo.hp}` : '',
      snap.nearbyStations.join(','),
      hotbarKey,
      backpackKey,
      snap.stats.itemsCrafted,
      snap.stats.monstersKilled,
      snap.stats.blocksPlaced,
      snap.godMode ? 1 : 0,
      snap.nearbyStool ? 1 : 0,
      snap.stoolSpeech ? `${snap.stoolSpeech.stage}:${snap.stoolSpeech.text}` : '',
    ].join('|');
    if (!force && key === this.lastHudKey) return;
    this.lastHudKey = key;
    this.onHudChange(snap);
  }
}
