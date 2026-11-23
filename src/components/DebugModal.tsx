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
  verifyDebugPassword,
} from '../game/catalog';
import { DebugChestPreset, EnemyKind, HudSnapshot, ItemCategory, WorldVariant } from '../game/types';
import { BIOME_NAMES, WORLD_VARIANTS } from '../game/worldGen';
import { ItemIcon } from './ItemIcon';

type DebugTab = 'items' | 'player' | 'world' | 'mobs';

const CATEGORY_LABELS: Record<'all' | ItemCategory, string> = {
  all: 'Все категории',
  armor: 'Броня и сеты',
  weapon: 'Оружие',
  tool: 'Кирки и инструменты',
  block: 'Блоки и мебель',
  wall: 'Стены',
  consumable: 'Зелья, кристаллы и чертежи',
  material: 'Материалы и слитки',
  station: 'Станции крафта',
  summon: 'Призывалки боссов',
  accessory: 'Аксессуары',
};

const PRE_HARDMODE_BOSSES: { kind: EnemyKind; label: string; style: string }[] = [
  { kind: 'king_slime', label: 'Король Слизней', style: 'bg-emerald-950/50 border-emerald-500/40 hover:border-emerald-400 text-emerald-200' },
  { kind: 'eye_boss', label: 'Глаз Ктулху (Око)', style: 'bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200' },
  { kind: 'kotulhu', label: 'Котулху', style: 'bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200' },
  { kind: 'cat_worm', label: 'Пожиратель Котов', style: 'bg-amber-950/50 border-amber-500/40 hover:border-amber-400 text-amber-200' },
  { kind: 'brain_cthulhu', label: 'Мозг Ктулху', style: 'bg-rose-950/50 border-pink-500/40 hover:border-pink-400 text-pink-200' },
  { kind: 'queen_bee', label: 'Королева Пчёл', style: 'bg-amber-950/50 border-yellow-500/40 hover:border-yellow-300 text-yellow-200' },
  { kind: 'skele_cat', label: 'Скелетрон', style: 'bg-purple-950/50 border-purple-500/40 hover:border-purple-400 text-purple-200' },
  { kind: 'deerclops', label: 'Циклоп-Олень', style: 'bg-sky-950/50 border-sky-500/40 hover:border-sky-300 text-sky-200' },
  { kind: 'wall_of_flesh', label: 'Стена Плоти', style: 'bg-red-950/60 border-red-500/45 hover:border-red-300 text-red-200' },
];

const HARDMODE_BOSSES: { kind: EnemyKind; label: string; style: string }[] = [
  { kind: 'queen_slime', label: 'Королева Слизней', style: 'bg-pink-950/50 border-pink-500/40 hover:border-pink-300 text-pink-200' },
  { kind: 'the_twins', label: 'Близнецы', style: 'bg-emerald-950/50 border-lime-500/40 hover:border-lime-300 text-lime-200' },
  { kind: 'the_destroyer', label: 'Уничтожитель', style: 'bg-slate-800/80 border-red-500/40 hover:border-red-300 text-slate-200' },
  { kind: 'skeletron_prime', label: 'Скелетрон Прайм', style: 'bg-slate-800/80 border-amber-500/40 hover:border-amber-300 text-amber-200' },
  { kind: 'plantera', label: 'Плантера', style: 'bg-emerald-950/50 border-pink-500/45 hover:border-pink-300 text-emerald-200' },
  { kind: 'golem', label: 'Голем', style: 'bg-amber-950/50 border-orange-500/45 hover:border-orange-300 text-orange-200' },
  { kind: 'duke_fishron', label: 'Герцог Рыброн', style: 'bg-teal-950/50 border-teal-400/45 hover:border-teal-300 text-teal-200' },
  { kind: 'empress_light', label: 'Императрица Света', style: 'bg-fuchsia-950/50 border-fuchsia-400/50 hover:border-fuchsia-300 text-fuchsia-200' },
  { kind: 'lunatic_cultist', label: 'Культист-Лунатик', style: 'bg-indigo-950/50 border-indigo-400/50 hover:border-indigo-300 text-indigo-200' },
  { kind: 'moon_lord', label: 'Лунный Лорд', style: 'bg-cyan-950/60 border-cyan-400/55 hover:border-cyan-200 text-cyan-200' },
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
  onClearEnemies,
  onTeleportSpawn,
  onTeleportCoords,
  onBoostDefense,
  onRegenerateWorld,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DebugTab>('items');

  const [coordX, setCoordX] = useState(() => String(hud.playerTileX));
  const [coordY, setCoordY] = useState(() => String(hud.playerTileY));

  const [itemSearch, setItemSearch] = useState('');
  const [itemCategory, setItemCategory] = useState<'all' | ItemCategory>('all');
  const [selectedItemId, setSelectedItemId] = useState('starfury');
  const [itemCountInput, setItemCountInput] = useState('1');
  const [chestPreset, setChestPreset] = useState<DebugChestPreset>('terraria');

  useEffect(() => {
    if (unlocked) {
      setCoordX(String(hud.playerTileX));
      setCoordY(String(hud.playerTileY));
    }
  }, [unlocked, hud.playerTileX, hud.playerTileY]);

  const allItems = useMemo(
    () =>
      Object.values(ITEMS).sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [],
  );

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return allItems.filter((item) => {
      if (itemCategory !== 'all' && item.category !== itemCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [allItems, itemSearch, itemCategory]);

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
      setError('Неверный пароль. Доступ запрещён.');
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

  const chestPresetInfo = DEBUG_CHEST_PRESETS[chestPreset];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-label="Дебаг-меню"
    >
      <div className="w-full max-w-3xl bg-[#0e172a] border border-emerald-400/45 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#09101f]">
          <div className="flex items-center gap-2.5">
            <Bug className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-display font-bold text-lg text-emerald-300 leading-tight">
                Дебаг-консоль Котаррии
              </h2>
              {unlocked && (
                <p className="text-[11px] text-slate-400">
                  Выдача любых предметов, спавн сундуков, телепорты, статы и боссы
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть дебаг-меню"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Введите пароль разработчика для открытия консоли отладки.</span>
            </div>

            <div>
              <label
                htmlFor="debug-password-input"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Пароль
              </label>
              <input
                id="debug-password-input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Введите пароль..."
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
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold cursor-pointer"
              >
                Разблокировать
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Live Telemetry Strip */}
            <div className="px-5 py-3 bg-[#0a1222] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">Позиция и биом</div>
                <div className="font-mono-num text-sky-300 font-semibold truncate">
                  X {hud.playerTileX}, Y {hud.playerTileY} · {BIOME_NAMES[hud.biome]}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">Кот и рюкзак</div>
                <div className="font-mono-num text-rose-300 font-semibold truncate">
                  HP {hud.hp}/{hud.maxHp} · МН {hud.mana}/{hud.maxMana} · {slotUsage.used}/{slotUsage.total}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">Время и ресурсы</div>
                <div className="font-mono-num text-amber-300 font-semibold truncate">
                  День {hud.dayCount} ({clockText}) · {hud.coins} мон.
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
                <div className="text-slate-400">Мир и враги</div>
                <div className="font-mono-num text-emerald-300 font-semibold truncate">
                  Дома: {hud.validHouseCount} · Жители: {hud.npcsSummary.length}/5 · Мобы: {hud.enemyCount}
                </div>
              </div>
            </div>

            {/* Tab Bar */}
            <div
              role="tablist"
              aria-label="Разделы дебаг-консоли"
              className="px-5 py-2.5 bg-[#0b1324] border-b border-slate-800 flex flex-wrap gap-2"
            >
              {(
                [
                  { id: 'items', label: 'Предметы и Сундуки', icon: PackagePlus },
                  { id: 'player', label: 'Персонаж и Статы', icon: Shield },
                  { id: 'world', label: 'Мир и Телепорт', icon: Compass },
                  { id: 'mobs', label: 'Мобы и Боссы', icon: Swords },
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
                  {/* Give Item: "предмет" "сколько" */}
                  <section className="rounded-xl bg-slate-900/75 border border-slate-800 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <PackagePlus className="w-4 h-4" />
                        <span>Дать: предмет и количество</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono-num">
                        Найдено предметов: {filteredItems.length} из {allItems.length}
                      </span>
                    </div>

                    <form onSubmit={handleGiveItemSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="debug-item-search"
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            Поиск предмета
                          </label>
                          <input
                            id="debug-item-search"
                            type="text"
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            placeholder="Название или ID (например starfury, кирка)..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="debug-item-category"
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            Категория
                          </label>
                          <select
                            id="debug-item-category"
                            value={itemCategory}
                            onChange={(e) =>
                              setItemCategory(e.target.value as 'all' | ItemCategory)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs text-white cursor-pointer"
                          >
                            {(Object.keys(CATEGORY_LABELS) as ('all' | ItemCategory)[]).map(
                              (cat) => (
                                <option key={cat} value={cat}>
                                  {CATEGORY_LABELS[cat]}
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
                            Предмет
                          </label>
                          <select
                            id="debug-item-select"
                            value={selectedItem?.id ?? ''}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            disabled={filteredItems.length === 0}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 outline-none text-xs text-white cursor-pointer disabled:opacity-50"
                          >
                            {filteredItems.length === 0 ? (
                              <option value="">Ничего не найдено</option>
                            ) : (
                              filteredItems.map((it) => (
                                <option key={it.id} value={it.id}>
                                  {it.name} [{it.id}]
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
                            Сколько (1–999)
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
                            Выдать предмет
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 mr-1">Быстро:</span>
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
                            Макс. стак (×{selectedItem.maxStack})
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
                                {selectedItem.name}
                              </span>
                              <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">
                                {selectedItem.id}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {CATEGORY_LABELS[selectedItem.category]}
                              </span>
                              {selectedItem.damage && (
                                <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300">
                                  Урон {selectedItem.damage}
                                </span>
                              )}
                              {selectedItem.pickPower && (
                                <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300">
                                  Кирка ур. {selectedItem.pickPower}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {selectedItem.description}
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
                        <span>Выдача и спавн сундуков</span>
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Можно положить в рюкзак или поставить сразу с лутом
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="debug-chest-preset"
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Наполнение сундука
                        </label>
                        <select
                          id="debug-chest-preset"
                          value={chestPreset}
                          onChange={(e) => setChestPreset(e.target.value as DebugChestPreset)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-xs text-white cursor-pointer"
                        >
                          {(Object.keys(DEBUG_CHEST_PRESETS) as DebugChestPreset[]).map((key) => (
                            <option key={key} value={key}>
                              {DEBUG_CHEST_PRESETS[key].label}
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
                              <span>{item?.name ?? entry.itemId}</span>
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
                        Дать сундук в рюкзак
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveChest(chestPreset, 'place')}
                        className="px-3 py-2.5 rounded-xl border bg-amber-950/50 border-amber-500/45 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        Поставить сундук рядом
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveChest(chestPreset, 'place_and_open')}
                        className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        Поставить и открыть
                      </button>
                    </div>
                  </section>

                  {/* Quick Kits */}
                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Быстрые наборы
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onGiveKit('weapons')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        Всё оружие
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('armor')}
                        className="px-3 py-2.5 rounded-xl border bg-indigo-950/60 border-indigo-400/50 hover:border-indigo-300 text-indigo-200 text-xs font-semibold cursor-pointer"
                      >
                        Броня и крылья
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('terraria')}
                        className="px-3 py-2.5 rounded-xl border bg-sky-950/60 border-sky-500/45 hover:border-sky-300 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        Терра-набор
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('resources')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-emerald-400/60 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        Ресурсы и мебель
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('summons')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        Все 19 призывалок
                      </button>
                      <button
                        type="button"
                        onClick={() => onGiveKit('stool')}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-pink-400/60 text-pink-200 text-xs font-semibold cursor-pointer"
                      >
                        Табуретка
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
                      Выживание и броня
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
                        Режим бога: {hud.godMode ? 'ВКЛ' : 'ВЫКЛ'}
                      </button>
                      <button
                        type="button"
                        onClick={onRestoreVitals}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-sky-400/60 text-slate-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        Восстановить HP и Ману
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostDefense(5)}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        +5 к броне (сейчас {hud.defense})
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostDefense(15)}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-amber-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        +15 к броне
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostDefense(-5)}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-300 text-xs font-semibold text-left cursor-pointer"
                      >
                        -5 к броне
                      </button>
                      <button
                        type="button"
                        onClick={onTeleportSpawn}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-sky-400/60 text-sky-200 text-xs font-semibold text-left cursor-pointer"
                      >
                        Телепорт на спавн
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      Максимум HP и Маны
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(20, 0)}
                        className="px-3 py-2.5 rounded-xl border bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        +20 Макс. HP ({hud.maxHp}/400)
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(100, 0)}
                        className="px-3 py-2.5 rounded-xl border bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        Макс. HP = 400
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(0, 20)}
                        className="px-3 py-2.5 rounded-xl border bg-sky-950/40 border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        +20 Макс. Мана ({hud.maxMana}/200)
                      </button>
                      <button
                        type="button"
                        onClick={() => onBoostMaxStats(0, 200)}
                        className="px-3 py-2.5 rounded-xl border bg-sky-950/40 border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        Макс. Мана = 200
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      Монеты (сейчас: {hud.coins})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onAddCoins(50)}
                        className="px-3 py-2.5 rounded-xl border bg-amber-950/40 border-amber-500/40 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        +50 монет
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddCoins(500)}
                        className="px-3 py-2.5 rounded-xl border bg-amber-950/40 border-amber-500/40 hover:border-amber-300 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        +500 монет
                      </button>
                      <button
                        type="button"
                        onClick={onResetCoins}
                        className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Обнулить монеты
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        Поселение и статистика забега
                      </span>
                      <span className="text-[11px] font-mono-num text-slate-400">
                        Убито: {hud.stats.monstersKilled} · Выкопано: {hud.stats.blocksMined} · Поставлено: {hud.stats.blocksPlaced}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {hud.roomReport?.hasHouseForNpc
                        ? 'Текущее помещение котика полностью пригодно для жителя!'
                        : hud.roomReport?.reasons.length
                          ? `До пригодного жилья рядом: ${hud.roomReport.reasons.join(', ')}`
                          : 'Кот находится на открытой местности.'}
                    </p>
                  </section>
                </>
              )}

              {activeTab === 'world' && (
                <>
                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Время суток
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => onSetTime('morning')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Утро (09:20)
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTime('noon')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Полдень (12:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTime('evening')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-orange-400/60 text-orange-200 text-xs font-semibold cursor-pointer"
                      >
                        Вечер (18:30)
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTime('night')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-indigo-400/60 text-indigo-200 text-xs font-semibold cursor-pointer"
                      >
                        Ночь (23:15)
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-emerald-400" />
                      Дома и жители ({hud.npcsSummary.length}/5)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={onBuildHouseHere}
                        className="px-3 py-2.5 rounded-xl border bg-emerald-950/50 border-emerald-500/45 hover:border-emerald-300 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        Построить домик рядом
                      </button>
                      <button
                        type="button"
                        onClick={onInviteAllNpcs}
                        className="px-3 py-2.5 rounded-xl border bg-emerald-950/50 border-emerald-500/45 hover:border-emerald-300 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        Позвать всех жителей
                      </button>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-sky-400" />
                        Телепорт по координатам
                      </h3>
                      <span className="text-xs font-mono-num text-sky-300">
                        Сейчас: X {hud.playerTileX}, Y {hud.playerTileY} ({BIOME_NAMES[hud.biome]})
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
                          Координата X (0–{hud.worldWidth - 1})
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
                          Координата Y (0–{hud.worldHeight - 1})
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
                          Телепорт
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.round(hud.worldWidth * 0.14), 30)}
                        className="px-2.5 py-2 rounded-xl border bg-sky-950/50 border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold cursor-pointer"
                      >
                        Снежный биом (X: {Math.round(hud.worldWidth * 0.14)})
                      </button>
                      <button
                        type="button"
                        onClick={onTeleportSpawn}
                        className="px-2.5 py-2 rounded-xl border bg-emerald-950/50 border-emerald-500/40 hover:border-emerald-400 text-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        Лес / Спавн (X: {Math.floor(hud.worldWidth / 2)})
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.round(hud.worldWidth * 0.86), 30)}
                        className="px-2.5 py-2 rounded-xl border bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        Красный биом (X: {Math.round(hud.worldWidth * 0.86)})
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.round(hud.worldWidth * 0.22), 14)}
                        className="px-2.5 py-2 rounded-xl border bg-cyan-950/50 border-cyan-500/40 hover:border-cyan-300 text-cyan-200 text-xs font-semibold cursor-pointer"
                      >
                        Небесный остров (Y: 14)
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.floor(hud.worldWidth / 2), Math.round(hud.worldHeight * 0.45))}
                        className="px-2.5 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Пещеры (Y: {Math.round(hud.worldHeight * 0.45)})
                      </button>
                      <button
                        type="button"
                        onClick={() => onTeleportCoords(Math.floor(hud.worldWidth / 2), hud.worldHeight - 25)}
                        className="px-2.5 py-2 rounded-xl border bg-indigo-950/60 border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-semibold cursor-pointer"
                      >
                        Преисподняя (Y: {hud.worldHeight - 25})
                      </button>
                    </div>
                  </section>

                  {/* 2 World Generation Variants */}
                  <section className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Генерация мира ({hud.worldWidth}×{hud.worldHeight})
                      </h3>
                      <span className="text-[11px] text-amber-300 font-semibold">
                        Текущий: {WORLD_VARIANTS[hud.worldVariant].title}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['crimson_classic', 'crystal_highlands'] as WorldVariant[]).map((variantId) => {
                        const v = WORLD_VARIANTS[variantId];
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
                            <div className="text-[11px] text-slate-400">{v.badge} · Пересоздать мир</div>
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
                      Обычные монстры и все 19 боссов Террарии
                    </h3>
                    <span className="text-xs font-mono-num text-rose-300">
                      Активных врагов: {hud.enemyCount}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                      Обычные враги
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => onSpawnEnemy('slime')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        + Слизень
                      </button>
                      <button
                        type="button"
                        onClick={() => onSpawnEnemy('bat')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        + Мышь
                      </button>
                      <button
                        type="button"
                        onClick={() => onSpawnEnemy('goblin')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        + Гоблин
                      </button>
                      <button
                        type="button"
                        onClick={() => onSpawnEnemy('skeleton')}
                        className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        + Скелет
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-amber-300 mb-1.5">
                      Боссы Pre-Hardmode (9)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRE_HARDMODE_BOSSES.map((b) => (
                        <button
                          key={b.kind}
                          type="button"
                          onClick={() => onSpawnEnemy(b.kind)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                        >
                          + {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-cyan-300 mb-1.5">
                      Боссы Hardmode и Финал (10)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HARDMODE_BOSSES.map((b) => (
                        <button
                          key={b.kind}
                          type="button"
                          onClick={() => onSpawnEnemy(b.kind)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${b.style}`}
                        >
                          + {b.label}
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
                    <span>Очистить всех врагов</span>
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
