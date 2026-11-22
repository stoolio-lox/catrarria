import React, { useEffect, useMemo, useState } from 'react';
import { PackageMinus, Trash2, X } from 'lucide-react';
import {
  ITEMS,
  RECIPES,
  STATION_NAMES,
  canCraftRecipe,
  countItemInInventory,
  countUsedSlots,
} from '../game/catalog';
import { CraftingRecipe, HudSnapshot } from '../game/types';
import { ItemIcon } from './ItemIcon';

interface InventoryModalProps {
  hud: HudSnapshot;
  onClose: () => void;
  onSwapSlots: (
    fromArea: 'hotbar' | 'backpack',
    fromIdx: number,
    toArea: 'hotbar' | 'backpack',
    toIdx: number,
  ) => void;
  onDropSlot: (
    area: 'hotbar' | 'backpack',
    index: number,
    amount: number | 'all',
  ) => void;
  onCraft: (recipeId: string) => void;
  onSelectHotbar: (idx: number) => void;
}

type CraftFilter = 'all' | 'weapons' | 'tools' | 'building' | 'stations' | 'potions';

const CATEGORY_TABS: { id: CraftFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'weapons', label: 'Оружие' },
  { id: 'tools', label: 'Инструменты' },
  { id: 'building', label: 'Стройка' },
  { id: 'stations', label: 'Станции' },
  { id: 'potions', label: 'Еда' },
];

export const InventoryModal: React.FC<InventoryModalProps> = ({
  hud,
  onClose,
  onSwapSlots,
  onDropSlot,
  onCraft,
  onSelectHotbar,
}) => {
  const [filter, setFilter] = useState<CraftFilter>('all');
  const [onlyCraftable, setOnlyCraftable] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<{
    area: 'hotbar' | 'backpack';
    index: number;
  } | null>(null);

  const slotUsage = useMemo(
    () => countUsedSlots(hud.hotbar, hud.backpack),
    [hud.hotbar, hud.backpack],
  );

  const pickedSlotData = useMemo(() => {
    if (!pickedSlot) return null;
    const slot =
      pickedSlot.area === 'hotbar'
        ? hud.hotbar[pickedSlot.index]
        : hud.backpack[pickedSlot.index];
    if (!slot) return null;
    const item = ITEMS[slot.itemId];
    return item ? { ...pickedSlot, slot, item } : null;
  }, [pickedSlot, hud.hotbar, hud.backpack]);

  useEffect(() => {
    if (!pickedSlotData) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyQ' || e.code === 'Delete') {
        e.preventDefault();
        const dropAll = e.shiftKey;
        const willEmpty = dropAll || pickedSlotData.slot.count <= 1;
        onDropSlot(pickedSlotData.area, pickedSlotData.index, dropAll ? 'all' : 1);
        if (willEmpty) setPickedSlot(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pickedSlotData, onDropSlot]);

  const visibleRecipes = useMemo(() => {
    const filtered = RECIPES.filter((r) => {
      if (filter !== 'all' && r.category !== filter) return false;
      if (onlyCraftable && !canCraftRecipe(r, hud.hotbar, hud.backpack, hud.nearbyStations)) {
        return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      const ca = canCraftRecipe(a, hud.hotbar, hud.backpack, hud.nearbyStations) ? 1 : 0;
      const cb = canCraftRecipe(b, hud.hotbar, hud.backpack, hud.nearbyStations) ? 1 : 0;
      return cb - ca;
    });
  }, [filter, onlyCraftable, hud.hotbar, hud.backpack, hud.nearbyStations]);

  const handleSlotClick = (area: 'hotbar' | 'backpack', index: number) => {
    if (!pickedSlotData) {
      const slot = area === 'hotbar' ? hud.hotbar[index] : hud.backpack[index];
      if (slot) {
        setPickedSlot({ area, index });
      } else if (area === 'hotbar') {
        onSelectHotbar(index);
      }
      return;
    }

    if (pickedSlotData.area === area && pickedSlotData.index === index) {
      setPickedSlot(null);
      return;
    }

    onSwapSlots(pickedSlotData.area, pickedSlotData.index, area, index);
    setPickedSlot(null);
  };

  const handleSlotRightClick = (
    e: React.MouseEvent,
    area: 'hotbar' | 'backpack',
    index: number,
  ) => {
    e.preventDefault();
    const slot = area === 'hotbar' ? hud.hotbar[index] : hud.backpack[index];
    if (!slot) return;
    const willEmpty = slot.count <= 1;
    onDropSlot(area, index, 1);
    if (
      willEmpty &&
      pickedSlotData &&
      pickedSlotData.area === area &&
      pickedSlotData.index === index
    ) {
      setPickedSlot(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65"
      role="dialog"
      aria-modal="true"
      aria-label="Инвентарь и крафт"
    >
      <div className="w-full max-w-6xl bg-[#10192b] border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/80 bg-[#0b1322]">
          <div>
            <h2 className="font-display font-bold text-lg text-amber-300">
              Большой Рюкзак и Крафт Котика
            </h2>
            <p className="text-xs text-slate-400">
              Слоты: <span className="font-mono-num text-slate-200">{slotUsage.used}/{slotUsage.total}</span> · Станции рядом: {hud.nearbyStations.map((s) => STATION_NAMES[s]).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть инвентарь"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-column Inventory + Crafting */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-5 overflow-y-auto game-scroll">
          {/* Left: Backpack + Selected Drop Bar + Hotbar */}
          <div className="lg:col-span-6 space-y-3.5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-200">
                  Рюкзак ({hud.backpack.length} слотов)
                </h3>
                <span className="text-[11px] text-slate-400">
                  ЛКМ — выбрать/переместить · ПКМ — выбросить 1
                </span>
              </div>
              <div
                className="grid grid-cols-9 gap-1.5"
                data-testid="backpack-grid"
              >
                {hud.backpack.map((slot, idx) => {
                  const isPicked =
                    pickedSlotData?.area === 'backpack' && pickedSlotData.index === idx;
                  const item = slot ? ITEMS[slot.itemId] : null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSlotClick('backpack', idx)}
                      onContextMenu={(e) => handleSlotRightClick(e, 'backpack', idx)}
                      title={
                        item
                          ? `${item.name} — ${item.description} (ПКМ: выбросить 1)`
                          : 'Пустой слот'
                      }
                      aria-label={item ? `${item.name}, ${slot?.count}` : `Слот рюкзака ${idx + 1}`}
                      className={`relative aspect-square rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        isPicked
                          ? 'bg-amber-500/30 border-amber-400'
                          : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {slot && <ItemIcon itemId={slot.itemId} size={22} />}
                      {slot && slot.count > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-mono-num font-bold text-white hud-stroke">
                          {slot.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Slot Action & Drop Bar */}
            {pickedSlotData ? (
              <div
                className="bg-[#0b1322] border border-amber-400/50 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2"
                aria-label="Действия с выбранным предметом"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    <ItemIcon itemId={pickedSlotData.slot.itemId} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-amber-200 truncate">
                      {pickedSlotData.item.name}
                      {pickedSlotData.slot.count > 1 && (
                        <span className="font-mono-num text-white ml-1">
                          ×{pickedSlotData.slot.count}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Кликните по другому слоту, чтобы переложить, или выбросьте
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const willEmpty = pickedSlotData.slot.count <= 1;
                      onDropSlot(pickedSlotData.area, pickedSlotData.index, 1);
                      if (willEmpty) setPickedSlot(null);
                    }}
                    aria-label={`Выбросить 1: ${pickedSlotData.item.name}`}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 text-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <PackageMinus className="w-3.5 h-3.5" />
                    <span>Выбросить 1 [Q]</span>
                  </button>

                  {pickedSlotData.slot.count > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        onDropSlot(pickedSlotData.area, pickedSlotData.index, 'all');
                        setPickedSlot(null);
                      }}
                      aria-label={`Выбросить всё: ${pickedSlotData.item.name}`}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/60 text-rose-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Всё (×{pickedSlotData.slot.count})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setPickedSlot(null)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Панель быстрого доступа (1–9)
              </h3>
              <div
                className="grid grid-cols-9 gap-1.5"
                data-testid="hotbar-modal-grid"
              >
                {hud.hotbar.map((slot, idx) => {
                  const isPicked =
                    pickedSlotData?.area === 'hotbar' && pickedSlotData.index === idx;
                  const item = slot ? ITEMS[slot.itemId] : null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSlotClick('hotbar', idx)}
                      onContextMenu={(e) => handleSlotRightClick(e, 'hotbar', idx)}
                      title={
                        item
                          ? `${item.name} — ${item.description} (ПКМ: выбросить 1)`
                          : 'Пустой слот'
                      }
                      aria-label={item ? `Хотбар ${idx + 1}: ${item.name}` : `Хотбар ${idx + 1} пуст`}
                      className={`relative aspect-square rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        isPicked
                          ? 'bg-amber-500/30 border-amber-400'
                          : idx === hud.selectedSlot
                            ? 'bg-amber-500/15 border-amber-500/70'
                            : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span className="absolute top-0.5 left-1 text-[9px] font-mono-num text-slate-500">
                        {idx + 1}
                      </span>
                      {slot && <ItemIcon itemId={slot.itemId} size={22} />}
                      {slot && slot.count > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-mono-num font-bold text-white hud-stroke">
                          {slot.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick House & Arsenal Summary */}
            <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-100">
                Статус дома: {hud.houseValid ? 'Уютный дом готов (+реген HP)' : 'Нет закрытого тёплого дома'}
              </div>
              <p className="text-slate-400">
                Для дома поставьте стены, закройте задний фон (Задняя стена), добавьте дверь и факел.
              </p>
            </div>
          </div>

          {/* Right: Crafting Station */}
          <div className="lg:col-span-6 flex flex-col min-h-[340px] max-h-[600px]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      filter === tab.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyCraftable}
                  onChange={(e) => setOnlyCraftable(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Только доступные</span>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto game-scroll space-y-2 pr-1">
              {visibleRecipes.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-400">
                  Нет подходящих рецептов. Добудьте дерево, камень или руду!
                </div>
              ) : (
                visibleRecipes.map((recipe) => (
                  <RecipeRow
                    key={recipe.id}
                    recipe={recipe}
                    hud={hud}
                    onCraft={onCraft}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecipeRow: React.FC<{
  recipe: CraftingRecipe;
  hud: HudSnapshot;
  onCraft: (id: string) => void;
}> = ({ recipe, hud, onCraft }) => {
  const result = ITEMS[recipe.resultId];
  if (!result) return null;
  const craftable = canCraftRecipe(recipe, hud.hotbar, hud.backpack, hud.nearbyStations);
  const stationOk =
    recipe.station === 'hand' || hud.nearbyStations.includes(recipe.station);

  return (
    <div
      className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
        craftable
          ? 'bg-slate-900/95 border-amber-500/40'
          : 'bg-slate-900/55 border-slate-800 opacity-85'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
          <ItemIcon itemId={recipe.resultId} size={26} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-100 truncate">
            {result.name}{' '}
            {recipe.resultCount > 1 && (
              <span className="font-mono-num text-amber-300">×{recipe.resultCount}</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {result.damage ? `Урон ${result.damage} · ` : ''}
            {result.description}
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] mt-1 font-mono-num">
            {recipe.ingredients.map((ing) => {
              const ingDef = ITEMS[ing.itemId];
              const have = countItemInInventory(hud.hotbar, hud.backpack, ing.itemId);
              const enough = have >= ing.count;
              return (
                <span
                  key={ing.itemId}
                  className={enough ? 'text-emerald-300' : 'text-rose-300'}
                >
                  {ingDef?.name ?? ing.itemId} {have}/{ing.count}
                </span>
              );
            })}
            <span className={stationOk ? 'text-slate-400' : 'text-amber-400'}>
              · {STATION_NAMES[recipe.station]}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!craftable}
        onClick={() => onCraft(recipe.id)}
        className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
          craftable
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        Создать
      </button>
    </div>
  );
};
