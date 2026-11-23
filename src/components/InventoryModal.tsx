import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Feather,
  Hammer,
  PackageMinus,
  Shield,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  ARMOR_SET_META,
  ITEMS,
  RECIPES,
  STATION_NAMES,
  canCraftRecipe,
  countItemInInventory,
  countUsedSlots,
} from '../game/catalog';
import {
  CraftingRecipe,
  EquipSlotKey,
  HudSnapshot,
  ItemDef,
} from '../game/types';
import { BIOME_NAMES, WORLD_VARIANTS } from '../game/worldGen';
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
  onEquipItem: (
    fromArea: 'hotbar' | 'backpack',
    fromIdx: number,
    targetSlotKey?: EquipSlotKey,
  ) => void;
  onUnequipSlot: (slotKey: EquipSlotKey) => void;
  onCraft: (recipeId: string) => void;
  onSelectHotbar: (idx: number) => void;
}

type CraftFilter =
  | 'all'
  | 'armor'
  | 'weapons'
  | 'tools'
  | 'building'
  | 'stations'
  | 'potions'
  | 'summons';

const CATEGORY_TABS: { id: CraftFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'armor', label: 'Броня' },
  { id: 'weapons', label: 'Оружие' },
  { id: 'tools', label: 'Кирки' },
  { id: 'building', label: 'Блоки' },
  { id: 'stations', label: 'Станции' },
  { id: 'potions', label: 'Зелья' },
  { id: 'summons', label: 'Боссы' },
];

function getCompactItemStat(item: ItemDef): string | null {
  if (item.category === 'armor' && item.defenseBonus) {
    return `+${item.defenseBonus} Защ.`;
  }
  if (item.category === 'tool' && item.pickPower) {
    return `Кирка ${item.pickPower}`;
  }
  if (item.weaponKind === 'hook') {
    return 'Крюк';
  }
  if (item.category === 'weapon' && item.damage) {
    return `Урон ${item.damage}`;
  }
  if (item.category === 'accessory') {
    return item.defenseBonus ? `Аксесс. +${item.defenseBonus}` : 'Аксессуар';
  }
  if (item.category === 'summon') return 'Призыв босса';
  if (item.specialKind === 'life_crystal') return '+20 Макс HP';
  if (item.specialKind === 'mana_crystal') return '+20 Мана';
  if (item.specialKind === 'house_blueprint') return 'Дом 9×6';
  if (item.specialKind === 'magic_mirror') return 'Телепорт';
  if (item.healAmount) return `+${item.healAmount} HP`;
  if (item.manaAmount) return `+${item.manaAmount} Маны`;
  if (item.category === 'wall') return 'Фон';
  return null;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  hud,
  onClose,
  onSwapSlots,
  onDropSlot,
  onEquipItem,
  onUnequipSlot,
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

  const handleSlotDoubleClick = (area: 'hotbar' | 'backpack', index: number) => {
    const slot = area === 'hotbar' ? hud.hotbar[index] : hud.backpack[index];
    if (!slot) return;
    const item = ITEMS[slot.itemId];
    if (item && (item.category === 'armor' || item.category === 'accessory')) {
      onEquipItem(area, index);
      setPickedSlot(null);
    }
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

  const handleEquipSlotClick = (slotKey: EquipSlotKey) => {
    if (
      pickedSlotData &&
      (pickedSlotData.item.category === 'armor' || pickedSlotData.item.category === 'accessory')
    ) {
      onEquipItem(pickedSlotData.area, pickedSlotData.index, slotKey);
      setPickedSlot(null);
      return;
    }
    onUnequipSlot(slotKey);
  };

  const armorSlots: { key: EquipSlotKey; label: string; slot: HudSnapshot['equipment']['helmet'] }[] = [
    { key: 'helmet', label: 'Шлем', slot: hud.equipment.helmet },
    { key: 'chestplate', label: 'Кираса', slot: hud.equipment.chestplate },
    { key: 'greaves', label: 'Поножи', slot: hud.equipment.greaves },
  ];

  const isPickedEquipable =
    pickedSlotData &&
    (pickedSlotData.item.category === 'armor' || pickedSlotData.item.category === 'accessory');

  const activeSetMeta = hud.equipmentBonuses.activeSet
    ? ARMOR_SET_META[hud.equipmentBonuses.activeSet]
    : null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
      aria-label="Инвентарь, снаряжение и крафт"
    >
      <div className="w-full max-w-6xl bg-[#10192b] border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header with Coords, Variant & Biome */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-700/80 bg-[#0b1322] shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg text-amber-300">
              Инвентарь, Снаряжение и Крафт
            </h2>
            <p className="text-xs text-slate-400">
              Слоты: <span className="font-mono-num text-slate-200">{slotUsage.used}/{slotUsage.total}</span> · Мир: <span className="text-slate-200">{WORLD_VARIANTS[hud.worldVariant].title}</span> · Станции: {hud.nearbyStations.map((s) => STATION_NAMES[s]).join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              data-testid="player-coords"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-sky-500/35 text-xs"
            >
              <Compass className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-mono-num font-bold text-sky-200">
                X: {hud.playerTileX}, Y: {hud.playerTileY}
              </span>
              <span className="text-slate-500">·</span>
              <span className="font-semibold text-amber-200">{BIOME_NAMES[hud.biome]}</span>
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
        </div>

        {/* Scrollable Vertical Layout: TOP = Inventory + Equipment, BOTTOM = Crafting */}
        <div className="flex-1 overflow-y-auto game-scroll p-4 sm:p-5 space-y-5">
          {/* === TOP: INVENTORY & EQUIPMENT === */}
          <section
            data-testid="inventory-equipment-top"
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
          >
            {/* Left: Backpack (54) + Selected Action Bar + Hotbar (9) */}
            <div className="lg:col-span-7 space-y-3 bg-[#0b1322]/75 border border-slate-800 rounded-xl p-3.5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Рюкзак ({hud.backpack.length} слотов)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    ЛКМ — выбрать · 2×ЛКМ — надеть броню/аксессуар · ПКМ — выбросить 1
                  </span>
                </div>
                <div className="grid grid-cols-9 gap-1.5" data-testid="backpack-grid">
                  {hud.backpack.map((slot, idx) => {
                    const isPicked =
                      pickedSlotData?.area === 'backpack' && pickedSlotData.index === idx;
                    const item = slot ? ITEMS[slot.itemId] : null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSlotClick('backpack', idx)}
                        onDoubleClick={() => handleSlotDoubleClick('backpack', idx)}
                        onContextMenu={(e) => handleSlotRightClick(e, 'backpack', idx)}
                        title={
                          item
                            ? `${item.name} — ${item.description}`
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

              {/* Selected Slot Action & Drop/Equip Bar */}
              {pickedSlotData && (
                <div
                  className="bg-slate-950/90 border border-amber-400/50 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2"
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
                        {isPickedEquipable
                          ? 'Нажми «Надеть» или кликни по слоту снаряжения справа'
                          : 'Кликни по другому слоту, чтобы переложить, или выбрось'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {isPickedEquipable && (
                      <button
                        type="button"
                        onClick={() => {
                          onEquipItem(pickedSlotData.area, pickedSlotData.index);
                          setPickedSlot(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        Надеть
                      </button>
                    )}

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
              )}

              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  Панель быстрого доступа (1–9)
                </h3>
                <div className="grid grid-cols-9 gap-1.5" data-testid="hotbar-modal-grid">
                  {hud.hotbar.map((slot, idx) => {
                    const isPicked =
                      pickedSlotData?.area === 'hotbar' && pickedSlotData.index === idx;
                    const item = slot ? ITEMS[slot.itemId] : null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSlotClick('hotbar', idx)}
                        onDoubleClick={() => handleSlotDoubleClick('hotbar', idx)}
                        onContextMenu={(e) => handleSlotRightClick(e, 'hotbar', idx)}
                        title={
                          item
                            ? `${item.name} — ${item.description}`
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
            </div>

            {/* Right: Equipment Panel (3 Armor + 5 Accessories + Set Bonus + Stats & Housing) */}
            <div
              data-testid="equipment-panel"
              className="lg:col-span-5 space-y-3 bg-[#0b1322]/90 border border-slate-800 rounded-xl p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>Снаряжение (Броня и Аксессуары)</span>
                </h3>
                <span className="text-xs font-mono-num font-bold text-sky-300">
                  Броня: {hud.defense}
                </span>
              </div>

              {/* 3 Armor Slots */}
              <div className="grid grid-cols-3 gap-2">
                {armorSlots.map(({ key, label, slot }) => {
                  const item = slot ? ITEMS[slot.itemId] : null;
                  const canReceive =
                    pickedSlotData?.item.category === 'armor' &&
                    pickedSlotData.item.armorSlot === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      data-equip-slot={key}
                      onClick={() => handleEquipSlotClick(key)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onUnequipSlot(key);
                      }}
                      title={
                        item
                          ? `${item.name} — ${item.description} (клик: снять)`
                          : `Слот брони: ${label}`
                      }
                      aria-label={item ? `${label}: ${item.name}` : `${label}: пусто`}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-colors cursor-pointer text-left ${
                        canReceive
                          ? 'bg-emerald-950/60 border-emerald-400'
                          : slot
                            ? 'bg-slate-900 border-sky-500/45 hover:border-amber-400/70'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                        {slot ? (
                          <ItemIcon itemId={slot.itemId} size={24} />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          {label}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-100 truncate">
                          {item ? item.name : 'Пусто'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 5 Accessory Slots */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Аксессуары (5 слотов)
                  </span>
                  <span className="text-[10px] text-slate-400">Клик по слоту — снять</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {hud.equipment.accessories.map((slot, idx) => {
                    const key = `acc${idx}` as EquipSlotKey;
                    const item = slot ? ITEMS[slot.itemId] : null;
                    const canReceive = pickedSlotData?.item.category === 'accessory';
                    return (
                      <button
                        key={key}
                        type="button"
                        data-equip-slot={key}
                        onClick={() => handleEquipSlotClick(key)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          onUnequipSlot(key);
                        }}
                        title={
                          item
                            ? `${item.name} — ${item.description} (клик: снять)`
                            : `Слот аксессуара ${idx + 1}`
                        }
                        aria-label={item ? `Аксессуар ${idx + 1}: ${item.name}` : `Слот аксессуара ${idx + 1} пуст`}
                        className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-colors cursor-pointer ${
                          canReceive
                            ? 'bg-emerald-950/60 border-emerald-400'
                            : slot
                              ? 'bg-slate-900 border-amber-400/50 hover:border-amber-300'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {slot ? (
                          <ItemIcon itemId={slot.itemId} size={24} />
                        ) : (
                          <Feather className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Set Bonus & Effective Combat Bonuses */}
              <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-xs space-y-1.5">
                {activeSetMeta ? (
                  <div className="text-emerald-300 font-semibold">
                    Бонус сета ({activeSetMeta.label}): {activeSetMeta.bonusText}
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px]">
                    Собери шлем + кирасу + поножи одного материала для бонуса комплекта!
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-num">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-sky-200 border border-slate-700">
                    Защита: {hud.defense}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-rose-200 border border-slate-700">
                    Урон: {Math.round(hud.equipmentBonuses.damageMult * 100)}%
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-200 border border-slate-700">
                    Скорость: {Math.round(hud.equipmentBonuses.speedMult * 100)}%
                  </span>
                  {hud.equipmentBonuses.hasWings && (
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-200 border border-sky-500/40">
                      Крылья ВКЛ
                    </span>
                  )}
                  {hud.equipmentBonuses.hasDoubleJump && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white border border-slate-600">
                      2× Прыжок
                    </span>
                  )}
                  {hud.equipmentBonuses.hasKnockbackImmune && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-500/40">
                      Анти-отброс
                    </span>
                  )}
                  {hud.equipmentBonuses.hasNoFallDamage && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-200 border border-amber-500/40">
                      Нет урона падения
                    </span>
                  )}
                </div>
              </div>

              {/* Compact World & Villager Info */}
              <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 px-2.5 py-2 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Дома: <strong className="text-white">{hud.validHouseCount}</strong> ({hud.houseValid ? 'Внутри +HP' : 'Снаружи'}) · Жители: <strong className="text-emerald-300">{hud.npcsSummary.length}/5</strong>
                </span>
                <span className="font-mono-num text-amber-300">
                  Монеты: {hud.coins} · {hud.depthMeters} м
                </span>
              </div>
            </div>
          </section>

          {/* === BOTTOM: FULL-WIDTH CRAFTING SECTION === */}
          <section
            data-testid="crafting-bottom"
            className="bg-[#0b1322]/90 border border-amber-400/30 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-display font-bold text-amber-300 flex items-center gap-1.5 mr-2">
                  <Hammer className="w-4 h-4" />
                  <span>Крафты</span>
                </h3>
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
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
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyCraftable}
                  onChange={(e) => setOnlyCraftable(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>Только доступные ({visibleRecipes.length})</span>
              </label>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto game-scroll pr-1"
              data-testid="crafting-list"
            >
              {visibleRecipes.length === 0 ? (
                <div className="md:col-span-2 text-center py-8 text-sm text-slate-400">
                  Нет подходящих рецептов. Добудьте дерево, камень, кристалл или руду!
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
          </section>
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
  const statTag = getCompactItemStat(result);

  return (
    <div
      className={`flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl border ${
        craftable
          ? 'bg-slate-900/95 border-amber-500/45'
          : 'bg-slate-900/50 border-slate-800/90 opacity-85'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0"
          title={result.description}
        >
          <ItemIcon itemId={recipe.resultId} size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
              {result.name}
            </span>
            {recipe.resultCount > 1 && (
              <span className="text-xs font-mono-num font-bold text-amber-300 shrink-0">
                ×{recipe.resultCount}
              </span>
            )}
            {statTag && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-num text-sky-300 shrink-0">
                {statTag}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {recipe.ingredients.map((ing) => {
              const ingDef = ITEMS[ing.itemId];
              const have = countItemInInventory(hud.hotbar, hud.backpack, ing.itemId);
              const enough = have >= ing.count;
              return (
                <span
                  key={ing.itemId}
                  title={ingDef?.name ?? ing.itemId}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] font-mono-num ${
                    enough
                      ? 'bg-emerald-950/60 border-emerald-500/35 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <ItemIcon itemId={ing.itemId} size={13} />
                  <span className="truncate max-w-[92px] font-sans">{ingDef?.name ?? ing.itemId}</span>
                  <span className="font-bold">
                    {have}/{ing.count}
                  </span>
                </span>
              );
            })}

            {recipe.station !== 'hand' && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                  stationOk
                    ? 'bg-slate-800/80 text-slate-300'
                    : 'bg-amber-950/70 border border-amber-500/35 text-amber-300'
                }`}
              >
                {STATION_NAMES[recipe.station]}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!craftable}
        onClick={() => onCraft(recipe.id)}
        aria-label={`Создать ${result.name}`}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
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
