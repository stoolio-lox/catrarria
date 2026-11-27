import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Bug,
  Coins,
  Compass,
  Heart,
  Home,
  Lock,
  PackagePlus,
  Shield,
  Sparkles,
  Sun,
  Swords,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  DEBUG_CHEST_PRESETS,
  ITEMS,
  countUsedSlots,
  getChestPresetInfo,
  getItemDescription,
  getItemName,
  verifyDebugPassword,
} from '../game/catalog';
import { CATEGORY_LABELS_I18N, tr } from '../game/i18n';
import {
  DebugChestPreset,
  EnemyKind,
  HudSnapshot,
  ItemCategory,
  WorldVariant,
} from '../game/types';
import { getBiomeName, getWorldVariantInfo } from '../game/worldGen';
import { ItemIcon } from './ItemIcon';

type DebugTab = 'items' | 'player' | 'world' | 'mobs';

const MEME_CAT_BOSSES: { kind: EnemyKind; en: string; ru: string; style: string }[] = [
  { kind: 'pharaoh_cat', en: 'Naserafal II (Pyramid)', ru: 'Насерафал II (Пирамида)', style: 'bg-amber-950/60 border-amber-400/55 hover:border-amber-300 text-amber-200' },
  { kind: 'jester_cat', en: 'Jester Cat', ru: 'Кот-Шут', style: 'bg-indigo-950/60 border-rose-500/50 hover:border-rose-300 text-rose-200' },
  { kind: 'sun_cat', en: 'Solar Zazu', ru: 'Солнечный Зазу', style: 'bg-orange-950/60 border-orange-400/55 hover:border-orange-200 text-orange-200' },
  { kind: 'atomic_cat', en: 'Atomic Cat', ru: 'Атомный Кот', style: 'bg-yellow-950/60 border-yellow-400/55 hover:border-yellow-200 text-yellow-200' },
  { kind: 'party_cat', en: 'Propeller Lollipop Cat', ru: 'Кот-Пропеллер', style: 'bg-pink-950/60 border-pink-400/55 hover:border-pink-200 text-pink-200' },
  { kind: 'melon_bandit', en: 'Watermelon Outlaw ($1M)', ru: 'Арбузный Бандит ($1M)', style: 'bg-emerald-950/60 border-rose-500/50 hover:border-emerald-300 text-emerald-200' },
];

const PILLAR_BOSSES: { kind: EnemyKind; en: string; ru: string; style: string }[] = [
  { kind: 'solar_pillar', en: 'Solar Pillar', ru: 'Солнечная Башня', style: 'bg-orange-950/60 border-orange-500/50 hover:border-orange-300 text-orange-200' },
  { kind: 'vortex_pillar', en: 'Vortex Pillar', ru: 'Вихревая Башня', style: 'bg-emerald-950/60 border-emerald-500/50 hover:border-emerald-300 text-emerald-200' },
  { kind: 'nebula_pillar', en: 'Nebula Pillar', ru: 'Башня Туманности', style: 'bg-fuchsia-950/60 border-fuchsia-500/50 hover:border-fuchsia-300 text-fuchsia-200' },
  { kind: 'stardust_pillar', en: 'Stardust Pillar', ru: 'Звёздная Башня', style: 'bg-sky-950/60 border-sky-400/50 hover:border-sky-200 text-sky-200' },
];

const ALIEN_UNITS: { kind: EnemyKind; en: string; ru: string; style: string }[] = [
  { kind: 'alien_cat', en: 'Mars Alien Cat', ru: 'Кот-Пришелец', style: 'bg-lime-950/60 border-lime-400/50 hover:border-lime-200 text-lime-200' },
  { kind: 'alien_drone', en: 'Alien Drone', ru: 'Дрон Пришельцев', style: 'bg-emerald-950/60 border-emerald-400/45 hover:border-emerald-200 text-emerald-200' },
  { kind: 'martian_saucer', en: 'Martian Saucer (UFO)', ru: 'Марсианская Тарелка', style: 'bg-teal-950/60 border-cyan-400/55 hover:border-cyan-200 text-cyan-200' },
];

const BIOME_MOBS: { kind: EnemyKind; en: string; ru: string }[] = [
  { kind: 'slime', en: 'Slime', ru: 'Слизень' },
  { kind: 'bat', en: 'Cave Bat', ru: 'Мышь' },
  { kind: 'goblin', en: 'Goblin', ru: 'Гоблин' },
  { kind: 'skeleton', en: 'Skeleton', ru: 'Скелет' },
  { kind: 'ice_slime', en: 'Ice Slime', ru: 'Ледяной слизень' },
  { kind: 'frost_viking', en: 'Frost Viking', ru: 'Ледяной викинг' },
  { kind: 'antlion', en: 'Antlion', ru: 'Муравьиный лев' },
  { kind: 'mummy', en: 'Mummy', ru: 'Мумия' },
  { kind: 'crimera', en: 'Crimera', ru: 'Кримера' },
  { kind: 'face_monster', en: 'Face Monster', ru: 'Лицемонстр' },
  { kind: 'pixie', en: 'Crystal Pixie', ru: 'Пикси' },
  { kind: 'sand_shark', en: 'Sand Shark', ru: 'Песчаная акула' },
  { kind: 'hellbat', en: 'Hellbat', ru: 'Адская мышь' },
  { kind: 'fire_demon', en: 'Fire Demon', ru: 'Огненный демон' },
];

const PRE_HARDMODE_BOSSES: { kind: EnemyKind; en: string; ru: string; style: string }[] = [
  { kind: 'king_slime', en: 'King Slime', ru: 'Король Слизней', style: 'bg-emerald-950/50 border-emerald-500/40 hover:border-emerald-400 text-emerald-200' },
  { kind: 'eye_boss', en: 'Eye of Cthulhu', ru: 'Глаз Ктулху', style: 'bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200' },
  { kind: 'kotulhu', en: 'Kotulhu', ru: 'Котулху', style: 'bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200' },
  { kind: 'cat_worm', en: 'Eater of Cats', ru: 'Пожиратель Котов', style: 'bg-amber-950/50 border-amber-500/40 hover:border-amber-400 text-amber-200' },
  { kind: 'brain_cthulhu', en: 'Brain of Cthulhu', ru: 'Мозг Ктулху', style: 'bg-rose-950/50 border-pink-500/40 hover:border-pink-400 text-pink-200' },
  { kind: 'queen_bee', en: 'Queen Bee', ru: 'Королева Пчёл', style: 'bg-amber-950/50 border-yellow-500/40 hover:border-yellow-300 text-yellow-200' },
  { kind: 'skele_cat', en: 'Skeletron', ru: 'Скелетрон', style: 'bg-purple-950/50 border-purple-500/40 hover:border-purple-400 text-purple-200' },
  { kind: 'deerclops', en: 'Deerclops', ru: 'Циклоп-Олень', style: 'bg-sky-950/50 border-sky-500/40 hover:border-sky-300 text-sky-200' },
  { kind: 'wall_of_flesh', en: 'Wall of Flesh', ru: 'Стена Плоти', style: 'bg-red-950/60 border-red-500/45 hover:border-red-300 text-red-200' },
];

const HARDMODE_BOSSES: { kind: EnemyKind; en: string; ru: string; style: string }[] = [
  { kind: 'queen_slime', en: 'Queen Slime', ru: 'Королева Слизней', style: 'bg-pink-950/50 border-pink-500/40 hover:border-pink-300 text-pink-200' },
  { kind: 'the_twins', en: 'The Twins', ru: 'Близнецы', style: 'bg-emerald-950/50 border-lime-500/40 hover:border-lime-300 text-lime-200' },
  { kind: 'the_destroyer', en: 'The Destroyer', ru: 'Уничтожитель', style: 'bg-slate-800/80 border-red-500/40 hover:border-red-300 text-slate-200' },
  { kind: 'skeletron_prime', en: 'Skeletron Prime', ru: 'Скелетрон Прайм', style: 'bg-slate-800/80 border-amber-500/40 hover:border-amber-300 text-amber-200' },
  { kind: 'plantera', en: 'Plantera', ru: 'Плантера', style: 'bg-emerald-950/50 border-pink-500/45 hover:border-pink-300 text-emerald-200' },
  { kind: 'golem', en: 'Golem', ru: 'Голем', style: 'bg-amber-950/50 border-orange-500/45 hover:border-orange-300 text-orange-200' },
  { kind: 'duke_fishron', en: 'Duke Fishron', ru: 'Герцог Рыброн', style: 'bg-teal-950/50 border-teal-400/45 hover:border-teal-300 text-teal-200' },
  { kind: 'empress_light', en: 'Empress of Light', ru: 'Императрица Света', style: 'bg-fuchsia-950/50 border-fuchsia-400/50 hover:border-fuchsia-300 text-fuchsia-200' },
  { kind: 'lunatic_cultist', en: 'Lunatic Cultist', ru: 'Культист-Лунатик', style: 'bg-indigo-950/50 border-indigo-400/50 hover:border-indigo-300 text-indigo-200' },
  { kind: 'moon_lord', en: 'Moon Lord', ru: 'Лунный Лорд', style: 'bg-cyan-950/60 border-cyan-400/55 hover:border-cyan-200 text-cyan-200' },
];

interface DebugModalProps {
  hud: HudSnapshot;
  unlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
  onToggleGodMode: () => void;
  onRestoreVitals: () => void;
  onSetTime: (preset: 'morning' | 'noon' | 'evening' | 'night') => void;
  onGiveKit: (kind: 'weapons' | 'armor' | 'resources' | 'stool' | 'summons' | 'terraria') => void;
  onGiveItem: (itemId: string, count: number) => void;
  onGiveChest: (preset: DebugChestPreset, mode: 'inventory' | 'place' | 'place_and_open') => void;
  onAddCoins: (delta: number) => void;
  onResetCoins: () => void;
  onBoostMaxStats: (hpDelta: number, manaDelta: number) => void;
  onBuildHouseHere: () => void;
  onInviteAllNpcs: () => void;
  onSpawnEnemy: (kind: EnemyKind) => void;
  onSpawnPillars: () => void;
  onStartAlienInvasion: () => void;
  onClearEnemies: () => void;
  onTeleportSpawn: () => void;
  onTeleportCoords: (tx: number, ty: number) => void;
  onBoostDefense: (delta: number) => void;
  onRegenerateWorld: (variant: WorldVariant) => void;
}

export const DebugModal: React.FC<DebugModalProps> = ({
  hud,
  unlocked,
  onUnlock,
  onClose,
  onToggleGodMode,
  onRestoreVitals,
  onSetTime,
  onGiveKit,
  onGiveItem,
  onGiveChest,
  onAddCoins,
  onResetCoins,
  onBoostMaxStats,
  onBuildHouseHere,
  onInviteAllNpcs,
  onSpawnEnemy,
  onSpawnPillars,
  onStartAlienInvasion,
  onClearEnemies,
  onTeleportSpawn,
  onTeleportCoords,
  onBoostDefense,
  onRegenerateWorld,
}) => {
  const lang = hud.language;
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DebugTab>('items');

  const [coordX, setCoordX] = useState(() => String(hud.playerTileX));
  const [coordY, setCoordY] = useState(() => String(hud.playerTileY));

  const [itemSearch, setItemSearch] = useState('');
  const [itemCategory, setItemCategory] = useState<'all' | ItemCategory>('all');
  const [selectedItemId, setSelectedItemId] = useState('starfury');
  const [itemCountInput, setItemCountInput] = useState('1');
  const [chestPreset, setChestPreset] = useState<DebugChestPreset>('cats');

  useEffect(() => {
    if (unlocked) {
      setCoordX(String(hud.playerTileX));
      setCoordY(String(hud.playerTileY));
    }
  }, [unlocked, hud.playerTileX, hud.playerTileY]);

  const allItems = useMemo(
    () =>
      Object.values(ITEMS).sort((a, b) =>
        getItemName(a, lang).localeCompare(getItemName(b, lang), lang),
      ),
    [lang],
  );

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return allItems.filter((item) => {
      if (itemCategory !== 'all' && item.category !== itemCategory) return false;
      if (!q) return true;
      return (
        getItemName(item, 'en').toLowerCase().includes(q) ||
        getItemName(item, 'ru').toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        getItemDescription(item, lang).toLowerCase().includes(q)
      );
    });
  }, [allItems, itemSearch, itemCategory, lang]);

  useEffect(() => {
    if (filteredItems.length > 0 && !filteredItems.some((it) => it.id === selectedItemId)) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [filteredItems, selectedItemId]);

  const selectedItem = ITEMS[selectedItemId] ?? filteredItems[0] ?? null;
  const slotUsage = useMemo(
    () => countUsedSlots(hud.hotbar, hud.backpack),
    [hud.hotbar, hud.backpack],
  );

  const clockHour = Math.floor(((hud.timeOfDay * 24 + 6) % 24));
  const clockMin = Math.floor((((hud.timeOfDay * 24 + 6) % 1) * 60));
  const clockText = `${String(clockHour).padStart(2, '0')}:${String(clockMin).padStart(2, '0')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyDebugPassword(password)) {
      setError(null);
      setPassword('');
      onUnlock();
    } else {
      setError(tr(lang, 'Invalid password. Access denied.', 'Неверный пароль. Доступ запрещён.'));
    }
  };

  const handleGiveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const parsed = Number(itemCountInput);
    const qty = Number.isFinite(parsed) ? Math.max(1, Math.min(999, Math.floor(parsed))) : 1;
    setItemCountInput(String(qty));
    onGiveItem(selectedItem.id, qty);
  };

  const handleTeleportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tx = Number(coordX);
    const ty = Number(coordY);
    if (!Number.isFinite(tx) || !Number.isFinite(ty)) return;
    onTeleportCoords(tx, ty);
  };

  const chestPresetInfo = getChestPresetInfo(chestPreset, lang);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-label={tr(lang, 'Debug Console', 'Дебаг-меню')}
    >
      <div className="w-full max-w-3xl bg-[#0e172a] border border-emerald-400/45 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#09101f]">
          <div className="flex items-center gap-2.5">
            <Bug className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-display font-bold text-lg text-emerald-300 leading-tight">
                {tr(lang, 'Kotarria Debug Console', 'Дебаг-консоль Котаррии')}
              </h2>
              {unlocked && (
                <p className="text-[11px] text-slate-400">
                  {tr(
                    lang,
                    'Spawn items, chests, biome teleports, Lunar Pillars, Alien Invasion & all bosses',
                    'Выдача любых предметов, сундуки, телепорты, Небесные Башни, Инопланетяне и боссы',
                  )}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr(lang, 'Close Debug Console', 'Закрыть дебаг-меню')}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {tr(
                  lang,
                  'Enter developer password to unlock the Debug Console.',
                  'Введите пароль разработчика для открытия консоли отладки.',
                )}
              </span>
            </div>

            <div>
              <label
                htmlFor="debug-password-input"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                {tr(lang, 'Password', 'Пароль')}
              </label>
              <input
                id="debug-password-input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={tr(lang, 'Enter password...', 'Введите пароль...')}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 outline-none text-sm text-white"
              />
              {error && (
                <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium cursor-pointer"
              >
                {tr(lang, 'Cancel', 'Отмена')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold cursor-pointer"
              >
                {tr(lang, 'Unlock', 'Разблокировать')}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Live Telemetry Strip */}
            <div className="px-5 py-3 bg-[#0a1222] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">{tr(lang, 'Position & Biome', 'Позиция и биом')}</div>
                <div className="font-mono-num text-sky-300 font-semibold truncate">
                  X {hud.playerTileX}, Y {hud.playerTileY} · {getBiomeName(hud.biome, lang)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">{tr(lang, 'Cat & Pack', 'Кот и рюкзак')}</div>
                <div className="font-mono-num text-rose-300 font-semibold truncate">
                  HP {hud.hp}/{hud.maxHp} · MP {hud.mana}/{hud.maxMana} · {slotUsage.used}/{slotUsage.total}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">{tr(lang, 'Time & Coins', 'Время и монеты')}</div>
                <div className="font-mono-num text-amber-300 font-semibold truncate">
                  {tr(lang, 'Day', 'День')} {hud.dayCount} ({clockText}) · {hud.coins}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">{tr(lang, 'World & Mobs', 'Мир и враги')}</div>
                <div className="font-mono-num text-emerald-300 font-semibold truncate">
                  {tr(lang, 'Houses', 'Дома')}: {hud.validHouseCount} · NPC: {hud.npcsSummary.length}/6 · {tr(lang, 'Mobs', 'Мобы')}: {hud.enemyCount}
                </div>
              </div>
            </div>

            {/* Tab Bar */}
            <div
              role="tablist"
              aria-label={tr(lang, 'Debug sections', 'Разделы дебаг-консоли')}
              className="px-5 py-2.5 bg-[#0b1324] border-b border-slate-800 flex flex-wrap gap-2"
            >
              {(
                [
                  { id: 'items', label: tr(lang, 'Items & Chests', 'Предметы и Сундуки'), icon: PackagePlus },
                  { id: 'player', label: tr(lang, 'Player & Stats', 'Персонаж и Статы'), icon: Shield },
                  { id: 'world', label: tr(lang, 'World & Teleport', 'Мир и Телепорт'), icon: Compass },
                  { id: 'mobs', label: tr(lang, 'Bosses, Pillars & Aliens', 'Боссы, Башни и Пришельцы'), icon: Swords },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-400/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto game-scroll space-y-5 text-sm">
              {activeTab === 'items' && (
                <>
                  {/* Give Item */}
                  <section className="rounded-xl bg-slate-900/75 border border-slate-800 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <PackagePlus className="w-4 h-4" />
                        <span>{tr(lang, 'Give: "item" "count"', 'Дать: «предмет» и «сколько»')}</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono-num">
                        {filteredItems.length} / {allItems.length}
                      </span>
                    </div>

                    <form onSubmit={handleGiveItemSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="debug-item-search"
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            {tr(lang, 'Search item', 'Поиск предмета')}
                          </label>
                          <input
                            id="debug-item-search"
                            type="text"
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            placeholder={tr(lang, 'Name or ID (zenith, red_potion, milk_potion)...', 'Название или ID (zenith, red_potion)...')}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="debug-item-category"
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            {tr(lang, 'Category', 'Категория')}
                          </label>
                          <select
                            id="debug-item-category"
                            value={itemCategory}
                            onChange={(e) =>
                              setItemCategory(e.target.value as 'all' | ItemCategory)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs text-white cursor-pointer"
                          >
                            {(Object.keys(CATEGORY_LABELS_I18N) as ('all' | ItemCategory)[]).map(
                              (cat) => (
                                <option key={cat} value={cat}>
                                  {CATEGORY_LABELS_I18N[cat][lang]}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="debug-item-select"
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            {tr(lang, 'Item', 'Предмет')}
                          </label>
                          <select
                            id="debug-item-select"
                            value={selectedItem?.id ?? ''}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            disabled={filteredItems.length === 0}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs text-white cursor-pointer disabled:opacity-50"
                          >
                            {filteredItems.length === 0 ? (
                              <option value="">{tr(lang, 'No matches', 'Ничего не найдено')}</option>
                            ) : (
                              filteredItems.map((it) => (
                                <option key={it.id} value={it.id}>
                                  {getItemName(it, lang)} [{it.id}]
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="debug-item-count"
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            {tr(lang, 'Count (1–999)', 'Сколько (1–999)')}
                          </label>
                          <input
                            id="debug-item-count"
                            type="number"
                            min={1}
                            max={999}
                            value={itemCountInput}
                            onChange={(e) => setItemCountInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs font-mono-num text-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <button
                            type="submit"
                            disabled={!selectedItem}
                            className="w-full px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            {tr(lang, 'Give Item', 'Выдать')}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 mr-1">
                            {tr(lang, 'Quick:', 'Быстро:')}
                          </span>
                          {[1, 5, 10, 50, 99].map((qty) => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => setItemCountInput(String(qty))}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono-num cursor-pointer"
                            >
                              ×{qty}
                            </button>
                          ))}
                        </div>
                        {selectedItem && (
                          <button
                            type="button"
                            onClick={() => setItemCountInput(String(selectedItem.maxStack))}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-mono-num cursor-pointer"
                          >
                            {tr(lang, 'Max Stack', 'Макс. стак')} (×{selectedItem.maxStack})
                          </button>
                        )}
                      </div>

                      {selectedItem && (
                        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                            <ItemIcon itemId={selectedItem.id} size={32} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-white text-xs">
                                {getItemName(selectedItem, lang)}
                              </span>
                              <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">
                                {selectedItem.id}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {CATEGORY_LABELS_I18N[selectedItem.category][lang]}
                              </span>
                              {selectedItem.damage && (
                                <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300">
                                  {tr(lang, 'Dmg', 'Урон')} {selectedItem.damage}
                                </span>
                              )}
                              {selectedItem.pickPower && (
                                <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300">
                                  {tr(lang, 'Pick Lv.', 'Кирка ур.')} {selectedItem.pickPower}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                              {getItemDescription(selectedItem, lang)}
                            </p>
                          </div>
                        </div>
                      )}
                    </form>
                  </section>

                  {/* Chest Giving Section */}
                  <section className="rounded-xl bg-slate-900/75 border border-amber-500/30 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Archive className="w-4 h-4" />
                        <span>{tr(lang, 'Give & Spawn Chests', 'Выдача и спавн сундуков')}</span>
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {tr(lang, 'Place in pack or directly into world', 'В рюкзак или поставить в мир')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="debug-chest-preset"
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          {tr(lang, 'Chest Preset', 'Наполнение сундука')}
                        </label>
                        <select
                          id="debug-chest-preset"
                          value={chestPreset}
                          onChange={(e) => setChestPreset(e.target.value as DebugChestPreset)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-xs text-white cursor-pointer"
                        >
                          {(Object.keys(DEBUG_CHEST_PRESETS) as DebugChestPreset[]).map((key) => (
                            <option key={key} value={key}>
                              {getChestPresetInfo(key, lang).label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-6 text-[11px] text-slate-300 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
                        {chestPresetInfo.description}
                      </div>
                    </div>

                    {chestPresetInfo.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {chestPresetInfo.items.map((entry) => {
                          const item = ITEMS[entry.itemId];
                          return (
                            <div
                              key={entry.itemId}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200"
                            >
                              <ItemIcon itemId={entry.itemId} size={18} />
                              <span>{item ? getItemName(item, lang) : entry.itemId}</span>
                              <span className="font-mono-num text-amber-300">×{entry.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onGiveChest(chestPreset, 'inventory')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-950 border-slate-700 hover:border-amber-400/60 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Give Empty Chest', 'Сундук в рюкзак')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveChest(chestPreset, 'place')}
                        className="px-3 py-2.5 rounded-xl border bg-amber-950/50 border-amber-500/45 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Place Chest Nearby', 'Поставить рядом')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveChest(chestPreset, 'place_and_open')}
                        className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        {tr(lang, 'Place & Open', 'Поставить и открыть')}
                      </button>
                    </div>
                  </section>

                  {/* Quick Kits */}
                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      {tr(lang, 'Quick Kits', 'Быстрые наборы')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onGiveKit('weapons')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'All Weapons', 'Всё оружие')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('armor')}
                        className="px-3 py-2.5 rounded-xl border bg-indigo-950/60 border-indigo-400/50 hover:border-indigo-300 text-indigo-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Armor & Wings', 'Броня и крылья')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('terraria')}
                        className="px-3 py-2.5 rounded-xl border bg-sky-950/60 border-sky-500/45 hover:border-sky-300 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Terraria Gear', 'Терра-набор')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('resources')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-emerald-400/60 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Blocks & Furniture', 'Ресурсы и мебель')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('summons')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'All Summons (27)', 'Все 27 призывалок')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('stool')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-pink-400/60 text-pink-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Starter Stool', 'Табуретка')}
                      </button>
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'player' && (
                <>
                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      {tr(lang, 'Survival & Defense', 'Выживание и броня')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={onToggleGodMode}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                          hud.godMode
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-emerald-400/50'
                        }`}
                      >
                        {tr(lang, 'God Mode', 'Режим бога')}: {hud.godMode ? tr(lang, 'ON', 'ВКЛ') : tr(lang, 'OFF', 'ВЫКЛ')}
                      </button>
                      <button
                        type="button"
                        onClick={onRestoreVitals}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-sky-400/60 text-slate-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        {tr(lang, 'Restore HP & Mana', 'Восстановить HP и Ману')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostDefense(5)}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        +5 {tr(lang, 'Defense', 'Броня')} ({hud.defense})
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostDefense(15)}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-amber-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        +15 {tr(lang, 'Defense', 'Броня')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostDefense(-5)}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-300 text-xs font-semibold text-left cursor-pointer"
                      >
                        -5 {tr(lang, 'Defense', 'Броня')}
                      </button>
                      <button
                        type="button"
                        onClick={onTeleportSpawn}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-sky-400/60 text-sky-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        {tr(lang, 'Teleport to Spawn', 'Телепорт на спавн')}
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {tr(lang, 'Max HP & Mana', 'Максимум HP и Маны')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(20, 0)}
                        className="px-3 py-2.5 rounded-xl border bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        +20 Max HP ({hud.maxHp}/400)
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(100, 0)}
                        className="px-3 py-2.5 rounded-xl border bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        Max HP = 400
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(0, 20)}
                        className="px-3 py-2.5 rounded-xl border bg-sky-950/40 border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        +20 Max MP ({hud.maxMana}/200)
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(0, 200)}
                        className="px-3 py-2.5 rounded-xl border bg-sky-950/40 border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        Max MP = 200
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {tr(lang, 'Coins', 'Монеты')} ({hud.coins})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onAddCoins(50)}
                        className="px-3 py-2.5 rounded-xl border bg-amber-950/40 border-amber-500/40 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        +50 {tr(lang, 'Coins', 'монет')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddCoins(500)}
                        className="px-3 py-2.5 rounded-xl border bg-amber-950/40 border-amber-500/40 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        +500 {tr(lang, 'Coins', 'монет')}
                      </button>
                      <button
                        type="button"
                        onClick={onResetCoins}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Reset Coins', 'Обнулить монеты')}
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        {tr(lang, 'Run Telemetry', 'Статистика забега')}
                      </span>
                      <span className="text-[11px] font-mono-num text-slate-400">
                        {tr(lang, 'Kills', 'Убито')}: {hud.stats.monstersKilled} · {tr(lang, 'Mined', 'Выкопано')}: {hud.stats.blocksMined} · {tr(lang, 'Placed', 'Поставлено')}: {hud.stats.blocksPlaced}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {hud.roomReport?.hasHouseForNpc
                        ? tr(lang, 'Current room is valid NPC housing!', 'Текущее помещение котика пригодно для жителя!')
                        : hud.roomReport?.reasons.length
                          ? `${tr(lang, 'Missing nearby:', 'До жилья рядом:')} ${hud.roomReport.reasons.join(', ')}`
                          : tr(lang, 'Cat is outdoors.', 'Кот находится на открытой местности.')}
                    </p>
                  </section>
                </>
              )}

              {activeTab === 'world' && (
                <>
                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      {tr(lang, 'Time of Day', 'Время суток')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => onSetTime('morning')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Morning (09:20)', 'Утро (09:20)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTime('noon')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Noon (12:00)', 'Полдень (12:00)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTime('evening')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-orange-400/60 text-orange-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Evening (18:30)', 'Вечер (18:30)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTime('night')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-indigo-400/60 text-indigo-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Night (23:15)', 'Ночь (23:15)')}
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-emerald-400" />
                      {tr(lang, 'Houses & Villagers', 'Дома и жители')} ({hud.npcsSummary.length}/6)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={onBuildHouseHere}
                        className="px-3 py-2.5 rounded-xl border bg-emerald-950/50 border-emerald-500/45 hover:border-emerald-300 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Build House Nearby', 'Построить домик рядом')}
                      </button>
                      <button
                        type="button"
                        onClick={onInviteAllNpcs}
                        className="px-3 py-2.5 rounded-xl border bg-emerald-950/50 border-emerald-500/45 hover:border-emerald-300 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Invite All 6 Villagers', 'Позвать всех 6 жителей')}
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-sky-400" />
                        {tr(lang, 'Teleport by Coordinates', 'Телепорт по координатам')}
                      </h3>
                      <span className="text-xs font-mono-num text-sky-300">
                        X {hud.playerTileX}, Y {hud.playerTileY} ({getBiomeName(hud.biome, lang)})
                      </span>
                    </div>

                    <form
                      onSubmit={handleTeleportSubmit}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <div className="col-span-4">
                        <label
                          htmlFor="debug-coord-x"
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          X (0–{hud.worldWidth - 1})
                        </label>
                        <input
                          id="debug-coord-x"
                          type="number"
                          min={0}
                          max={hud.worldWidth - 1}
                          value={coordX}
                          onChange={(e) => setCoordX(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 outline-none text-xs font-mono-num text-white"
                        />
                      </div>
                      <div className="col-span-4">
                        <label
                          htmlFor="debug-coord-y"
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Y (0–{hud.worldHeight - 1})
                        </label>
                        <input
                          id="debug-coord-y"
                          type="number"
                          min={0}
                          max={hud.worldHeight - 1}
                          value={coordY}
                          onChange={(e) => setCoordY(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 outline-none text-xs font-mono-num text-white"
                        />
                      </div>
                      <div className="col-span-4">
                        <button
                          type="submit"
                          className="w-full px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          {tr(lang, 'Teleport', 'Телепорт')}
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(220, -1)}
                        className="px-2.5 py-2 rounded-xl border bg-sky-950/50 border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Snow Tundra (X: 220)', 'Снега (X: 220)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(660, 145)}
                        className="px-2.5 py-2 rounded-xl border bg-amber-950/60 border-amber-400/55 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Desert Pyramid (X: 660)', 'Пирамида (X: 660)')}
                      </button>
                      <button
                        type="button"
                        onClick={onTeleportSpawn}
                        className="px-2.5 py-2 rounded-xl border bg-emerald-950/50 border-emerald-500/40 hover:border-emerald-400 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Forest Spawn (X: 1200)', 'Лес / Спавн (X: 1200)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(1598, -1)}
                        className="px-2.5 py-2 rounded-xl border bg-rose-950/60 border-rose-500/50 hover:border-rose-300 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Crimson Mouth (X: 1598)', 'Багровый Рот (X: 1598)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(2100, -1)}
                        className="px-2.5 py-2 rounded-xl border bg-fuchsia-950/50 border-fuchsia-500/40 hover:border-fuchsia-300 text-fuchsia-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Crystal Hollow (X: 2100)', 'Кристаллы (X: 2100)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(2320, -1)}
                        className="px-2.5 py-2 rounded-xl border bg-teal-950/50 border-teal-400/45 hover:border-teal-300 text-teal-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Ocean Coast (X: 2320)', 'Океан (X: 2320)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(480, 22)}
                        className="px-2.5 py-2 rounded-xl border bg-cyan-950/50 border-cyan-500/40 hover:border-cyan-300 text-cyan-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Sky Island (Y: 22)', 'Небесный остров (Y: 22)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.floor(hud.worldWidth / 2), 215)}
                        className="px-2.5 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Deep Caverns (Y: 215)', 'Глубокие пещеры (Y: 215)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.floor(hud.worldWidth / 2), hud.worldHeight - 36)}
                        className="px-2.5 py-2 rounded-xl border bg-indigo-950/60 border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-semibold cursor-pointer"
                      >
                        {tr(lang, 'Underworld (Y: 344)', 'Преисподняя (Y: 344)')}
                      </button>
                    </div>
                  </section>

                  {/* 2 World Generation Variants */}
                  <section className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {tr(lang, 'World Generation', 'Генерация мира')} ({hud.worldWidth}×{hud.worldHeight})
                      </h3>
                      <span className="text-[11px] text-amber-300 font-semibold">
                        {getWorldVariantInfo(hud.worldVariant, lang).title}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['crimson_classic', 'crystal_highlands'] as WorldVariant[]).map((variantId) => {
                        const v = getWorldVariantInfo(variantId, lang);
                        const isActive = hud.worldVariant === variantId;
                        return (
                          <button
                            key={variantId}
                            type="button"
                            onClick={() => onRegenerateWorld(variantId)}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                                : 'bg-slate-900 border-slate-700 hover:border-sky-400/60 text-slate-200'
                            }`}
                          >
                            <div className="text-xs font-bold">{v.title}</div>
                            <div className="text-[11px] text-slate-400">
                              {v.badge} · {tr(lang, 'Regenerate', 'Пересоздать мир')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'mobs' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-rose-400" />
                      {tr(lang, 'Events, Biome Mobs & Unlimited Multi-Bosses', 'События, Мобы и Неограниченные Боссы')}
                    </h3>
                    <span className="text-xs font-mono-num text-rose-300">
                      {tr(lang, 'Active:', 'Активных:')} {hud.enemyCount}
                    </span>
                  </div>

                  {/* World Events */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onSpawnPillars}
                      className="px-3 py-2.5 rounded-xl border bg-cyan-950/60 border-cyan-400/60 hover:border-cyan-200 text-cyan-200 text-xs font-bold cursor-pointer"
                    >
                      + {tr(lang, 'Spawn All 4 Celestial Pillars', 'Заспавнить 4 Небесные Башни')}
                    </button>
                    <button
                      type="button"
                      onClick={onStartAlienInvasion}
                      className="px-3 py-2.5 rounded-xl border bg-lime-950/60 border-lime-400/60 hover:border-lime-200 text-lime-200 text-xs font-bold cursor-pointer"
                    >
                      + {tr(lang, 'Start Alien Invasion', 'Начать Нашествие Инопланетян')}
                    </button>
                  </div>

                  {/* Meme Cat Bosses */}
                  <div>
                    <div className="text-[11px] font-semibold text-amber-300 mb-1.5">
                      {tr(lang, 'Meme Cat Bosses (6 — spawn multiple anytime!)', 'Мемные Коты-Боссы (6 — можно спавнить много!)')}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MEME_CAT_BOSSES.map((b) => (
                        <button
                          key={b.kind}
                          type="button"
                          onClick={() => onSpawnEnemy(b.kind)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                        >
                          + {b[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Celestial Pillars & Alien Invasion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-cyan-300 mb-1.5">
                        {tr(lang, 'Celestial Pillars (4)', 'Небесные Башни (4)')}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PILLAR_BOSSES.map((b) => (
                          <button
                            key={b.kind}
                            type="button"
                            onClick={() => onSpawnEnemy(b.kind)}
                            className={`px-2.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                          >
                            + {b[lang]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-lime-300 mb-1.5">
                        {tr(lang, 'Alien Invasion Units (3)', 'Отряд Инопланетян (3)')}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {ALIEN_UNITS.map((b) => (
                          <button
                            key={b.kind}
                            type="button"
                            onClick={() => onSpawnEnemy(b.kind)}
                            className={`px-2.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                          >
                            + {b[lang]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Biome Mobs */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                      {tr(lang, 'Biome & Underworld Mobs (14)', 'Мобы биомов и Преисподней (14)')}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {BIOME_MOBS.map((m) => (
                        <button
                          key={m.kind}
                          type="button"
                          onClick={() => onSpawnEnemy(m.kind)}
                          className="px-2.5 py-1.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          + {m[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terraria Pre-Hardmode Bosses */}
                  <div>
                    <div className="text-[11px] font-semibold text-amber-300 mb-1.5">
                      {tr(lang, 'Pre-Hardmode Bosses (9)', 'Боссы Pre-Hardmode (9)')}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRE_HARDMODE_BOSSES.map((b) => (
                        <button
                          key={b.kind}
                          type="button"
                          onClick={() => onSpawnEnemy(b.kind)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                        >
                          + {b[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terraria Hardmode Bosses */}
                  <div>
                    <div className="text-[11px] font-semibold text-cyan-300 mb-1.5">
                      {tr(lang, 'Hardmode & Final Bosses (10)', 'Боссы Hardmode и Финал (10)')}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HARDMODE_BOSSES.map((b) => (
                        <button
                          key={b.kind}
                          type="button"
                          onClick={() => onSpawnEnemy(b.kind)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                        >
                          + {b[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClearEnemies}
                    className="w-full px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-emerald-400/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{tr(lang, 'Clear All Enemies', 'Очистить всех врагов')}</span>
                  </button>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
