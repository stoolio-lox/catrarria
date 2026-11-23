import React from 'react';
import { Backpack, Bug, Copy, Hammer, HelpCircle, PackageMinus, Pause, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { ITEMS } from '../game/catalog';
import { HudSnapshot } from '../game/types';
import { ItemIcon } from './ItemIcon';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  inventoryOpen: boolean;
  helpOpen: boolean;
  debugOpen: boolean;
  settingsOpen: boolean;
  onSelectSlot: (idx: number) => void;
  onToggleInventory: () => void;
  onToggleBuildMode: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onToggleHelp: () => void;
  onToggleDebug: () => void;
  onOpenSettings: () => void;
  onSummonBoss: () => void;
  onOpenChest: () => void;
  onOpenNpc: () => void;
  onPetStool: () => void;
  onToggleDoor: () => void;
  onDismissStoolSpeech: () => void;
  onCopyStoolUrl: () => void;
  onDropSelected: (dropAll: boolean) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  muted,
  inventoryOpen,
  helpOpen,
  debugOpen,
  settingsOpen,
  onSelectSlot,
  onToggleInventory,
  onToggleBuildMode,
  onToggleMute,
  onTogglePause,
  onToggleHelp,
  onToggleDebug,
  onOpenSettings,
  onSummonBoss,
  onOpenChest,
  onOpenNpc,
  onPetStool,
  onToggleDoor,
  onDismissStoolSpeech,
  onCopyStoolUrl,
  onDropSelected,
}) => {
  const selectedSlot = hud.hotbar[hud.selectedSlot];
  const selectedItem = selectedSlot ? ITEMS[selectedSlot.itemId] : null;
  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const manaPct = Math.max(0, Math.min(100, (hud.mana / hud.maxMana) * 100));

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Row: Left Vitality/Clock Cluster + Right Utility Controls */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left Cluster */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#0e172a]/90 border border-amber-400/30 rounded-xl p-2.5 shadow-lg">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-amber-300/60 shrink-0 bg-slate-900">
            <img
              src="/assets/aistudio/zazuuu_cat_d36ff0de.jpg"
              alt="Котик"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-[168px]">
            {/* HP Bar */}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-rose-200 tracking-wide">ЗДОРОВЬЕ</span>
              <span className="font-mono-num font-bold text-white">
                {hud.hp}/{hud.maxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-700 mb-1.5">
              <div
                className="h-full bg-rose-500 transition-[width] duration-150"
                style={{ width: `${hpPct}%` }}
              />
            </div>

            {/* Mana Bar */}
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="font-medium text-sky-200">МАНА</span>
              <span className="font-mono-num text-sky-100">
                {hud.mana}/{hud.maxMana}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-700 mb-1.5">
              <div
                className="h-full bg-sky-400 transition-[width] duration-150"
                style={{ width: `${manaPct}%` }}
              />
            </div>

            {hud.equipmentBonuses.hasWings && (
              <div className="mb-1.5">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="font-medium text-cyan-200">ПОЛЁТ КРЫЛЬЕВ</span>
                  <span className="font-mono-num text-cyan-100">
                    {Math.round((hud.wingFuel / Math.max(0.1, hud.wingFuelMax)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-sm overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-cyan-300 transition-[width] duration-75"
                    style={{
                      width: `${Math.max(0, Math.min(100, (hud.wingFuel / Math.max(0.1, hud.wingFuelMax)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Clean Typographic Metadata */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-300 font-mono-num">
              <span>День {hud.dayCount} · {hud.isNight ? 'Ночь' : 'День'}</span>
              <span aria-hidden="true">/</span>
              <span>Броня {hud.defense}</span>
              <span aria-hidden="true">/</span>
              <span className="text-amber-300 font-semibold">Монеты {hud.coins}</span>
              <span aria-hidden="true">/</span>
              <span>
                {hud.houseValid ? 'В доме' : `${hud.depthMeters}м`} · Дома {hud.validHouseCount}
              </span>
              {hud.godMode && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="text-emerald-300 font-semibold">БОГ</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Boss HP Bar (only when boss active) */}
        {hud.bossInfo && (
          <div className="flex flex-col items-center bg-[#180d14]/92 border border-rose-500/50 rounded-xl px-4 sm:px-5 py-2 shadow-lg min-w-[200px] sm:min-w-[280px]">
            <div className="flex items-center justify-between w-full text-xs font-semibold text-rose-200 mb-1">
              <span>{hud.bossInfo.name}</span>
              <span className="font-mono-num">
                {hud.bossInfo.hp}/{hud.bossInfo.maxHp}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-sm overflow-hidden border border-rose-900">
              <div
                className="h-full bg-rose-600 transition-[width] duration-150"
                style={{ width: `${Math.max(0, (hud.bossInfo.hp / hud.bossInfo.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Top-Right Compact Utility Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleInventory();
            }}
            aria-label="Открыть инвентарь и крафт"
            className={`h-10 px-3 rounded-lg border flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
              inventoryOpen
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-amber-400/60'
            }`}
          >
            <Backpack className="w-4 h-4" />
            <span className="hidden sm:inline whitespace-nowrap">Инвентарь [E]</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleBuildMode();
            }}
            aria-label="Переключить режим стройки"
            title="Режим стройки [B]"
            className={`h-10 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              hud.activeToolMode === 'build'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-emerald-400/60'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span className="hidden sm:inline whitespace-nowrap">
              {hud.activeToolMode === 'build' ? 'Стройка [B]' : 'Авто [B]'}
            </span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onSummonBoss();
            }}
            aria-label="Вызвать ночного босса"
            title="Вызвать Око Ночи (Босс)"
            className="h-10 px-2.5 rounded-lg border bg-[#0e172a]/90 text-rose-300 border-slate-700 hover:border-rose-400/70 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Босс
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleHelp();
            }}
            aria-label="Подсказки управления"
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              helpOpen
                ? 'bg-sky-500 text-slate-950 border-sky-300'
                : 'bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-slate-500'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? 'Включить звук' : 'Выключить звук'}
            className="w-10 h-10 rounded-lg border bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleDebug();
            }}
            aria-label="Открыть дебаг меню"
            title="Дебаг-меню [F9]"
            className={`h-10 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              debugOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-[#0e172a]/90 text-emerald-300 border-slate-700 hover:border-emerald-400/70'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span className="hidden sm:inline">Дебаг</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenSettings();
            }}
            aria-label="Открыть настройки"
            title="Настройки"
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              settingsOpen
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-amber-400/60'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            aria-label="Пауза"
            className="w-10 h-10 rounded-lg border bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Toast Banner anchored below top HUD stats away from cat hero */}
      {hud.toastMessage && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 bg-[#0e172a]/95 border border-amber-400/50 text-amber-100 px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
          {hud.toastMessage}
        </div>
      )}

      {/* Stool Interactive Speech & Ctrl+V Hint Banner */}
      {hud.stoolSpeech && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto fixed bottom-28 left-1/2 -translate-x-1/2 w-[min(92vw,480px)] bg-[#0e172a]/96 border-2 border-amber-400/70 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center justify-center shrink-0">
            <ItemIcon itemId="stool_item" size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-300">
              Табуретка говорит
            </div>
            <div className="font-display font-bold text-base text-white mt-0.5">
              «{hud.stoolSpeech.text}»
            </div>
            {hud.stoolSpeech.hint && (
              <div className="mt-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-lg px-2.5 py-1.5">
                {hud.stoolSpeech.hint}
              </div>
            )}
            {hud.stoolSpeech.copiedUrl && (
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate text-[11px] font-mono-num text-sky-200 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                  {hud.stoolSpeech.copiedUrl}
                </code>
                <button
                  type="button"
                  onClick={onCopyStoolUrl}
                  aria-label="Скопировать ссылку ещё раз"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать</span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onDismissStoolSpeech}
            aria-label="Закрыть диалог табуретки"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nearby Interactables Prompt Row (Chest / NPC Villager / Stool / Door) */}
      {!hud.stoolSpeech &&
        !hud.activeChest &&
        !hud.activeNpc &&
        !inventoryOpen &&
        !settingsOpen &&
        (hud.nearbyChest || hud.nearbyNpc || hud.nearbyStool || hud.nearbyDoor) && (
          <div className="pointer-events-auto fixed bottom-28 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 max-w-[94vw]">
            {hud.nearbyChest && (
              <div className="bg-[#0e172a]/92 border border-amber-400/55 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-amber-100">
                <span>
                  {hud.nearbyChest.hasLoot ? 'Сундук с сокровищами' : 'Пустой сундук'}
                </span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenChest();
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold cursor-pointer"
                >
                  Открыть [F / ПКМ]
                </button>
              </div>
            )}

            {hud.nearbyNpc && (
              <div className="bg-[#0e172a]/92 border border-sky-400/55 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-sky-100">
                <span>
                  {hud.nearbyNpc.title} {hud.nearbyNpc.name}
                </span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenNpc();
                  }}
                  className="px-2.5 py-1 rounded-md bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold cursor-pointer"
                >
                  Поговорить [F / ПКМ]
                </button>
              </div>
            )}

            {hud.nearbyStool && (
              <div className="bg-[#0e172a]/92 border border-amber-400/45 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-amber-100">
                <span>Табуретка</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onPetStool();
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold cursor-pointer"
                >
                  Погладить [ЛКМ]
                </button>
              </div>
            )}

            {hud.nearbyDoor && (
              <div className="bg-[#0e172a]/92 border border-orange-400/50 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-orange-100">
                <span>Дверь</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleDoor();
                  }}
                  className="px-2.5 py-1 rounded-md bg-orange-400 hover:bg-orange-300 text-slate-950 font-semibold cursor-pointer"
                >
                  {hud.nearbyDoor.isOpen ? 'Закрыть [ПКМ / F]' : 'Открыть [ПКМ / F]'}
                </button>
              </div>
            )}
          </div>
        )}

      {/* Optional Compact Help Card */}
      {helpOpen && (
        <div className="pointer-events-auto self-end bg-[#0e172a]/95 border border-slate-600 rounded-xl p-4 max-w-sm text-xs text-slate-200 space-y-1.5 shadow-xl">
          <div className="font-display font-bold text-sm text-amber-300 mb-1">
            Как играть в Котаррию
          </div>
          <p><strong className="text-white">A / D</strong> — бег, <strong className="text-white">Space / W</strong> — прыжок и подъём по верёвке, <strong className="text-white">S</strong> — спуск.</p>
          <p><strong className="text-white">ЛКМ</strong> — бить/копать, <strong className="text-white">ПКМ</strong> (или [B] Стройка) — ставить блоки и открывать сундуки/говорить с жителями, <strong className="text-white">[G]</strong> — Крюк-кошка.</p>
          <p><strong className="text-white">Дома и жители:</strong> поставь стены, фон, дверь, свет (факел/люстра), стол и стул — или активируй «Чертёж уютного дома» из рюкзака! К тебе поселятся Гид, Торговец, Медсестра, Подрывник и Дриада.</p>
          <p><strong className="text-white">Штуки из Террарии:</strong> разбивай горшки под землёй ради монет, собирай Кристаллы Жизни, падающие ночью звёзды, Облако в бутылке, Ботинки Гермеса и Волшебное зеркало!</p>
          <p><strong className="text-white">Табуретка:</strong> погладь её (<strong className="text-white">ЛКМ</strong>), а затем нажми <strong className="text-white">ПКМ</strong>.</p>
          <p><strong className="text-white">Выбросить предмет:</strong> <strong className="text-white">Q</strong> (Shift+Q — весь стек), рюкзак на <strong className="text-white">[E]</strong> (63 слота).</p>
        </div>
      )}

      {/* Bottom-Center Hotbar */}
      <div className="flex flex-col items-center gap-1.5">
        {selectedItem && (
          <div className="text-xs font-medium text-slate-100 hud-stroke tracking-wide">
            {selectedItem.name}
            {selectedItem.damage ? ` · Урон ${selectedItem.damage}` : ''}
            {selectedItem.manaCost ? ` · Мана ${selectedItem.manaCost}` : ''}
            {selectedItem.weaponKind === 'hook' ? ' · [G] / ЛКМ выстрелить крюком' : ''}
            {selectedItem.category === 'summon' ? ' · ЛКМ / ПКМ призвать босса' : ''}
            {selectedItem.category === 'consumable' ? ' · ЛКМ / ПКМ применить' : ''}
            {selectedItem.category === 'armor' || selectedItem.category === 'accessory'
              ? ' · Надень в инвентаре [E]'
              : ''}
            {selectedItem.placesTile !== undefined || selectedItem.placesWall !== undefined
              ? ' · ПКМ поставить'
              : ''}
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 bg-[#0e172a]/92 border border-slate-600/80 rounded-xl p-1.5 shadow-2xl"
            role="toolbar"
            aria-label="Панель быстрого доступа"
          >
            {hud.hotbar.map((slot, idx) => {
              const active = idx === hud.selectedSlot;
              const item = slot ? ITEMS[slot.itemId] : null;
              return (
                <button
                  key={idx}
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSelectSlot(idx);
                  }}
                  aria-label={`Слот ${idx + 1}${item ? `: ${item.name}` : ': пусто'}`}
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center transition-transform cursor-pointer ${
                    active
                      ? 'bg-amber-500/25 border-amber-400 scale-105 shadow-[0_0_0_1px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-900/85 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="absolute top-0.5 left-1 text-[10px] font-mono-num text-slate-400">
                    {idx + 1}
                  </span>
                  {slot && <ItemIcon itemId={slot.itemId} size={26} />}
                  {slot && slot.count > 1 && (
                    <span className="absolute bottom-0.5 right-1 text-[11px] font-mono-num font-bold text-white hud-stroke">
                      {slot.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedItem && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onDropSelected(e.shiftKey);
              }}
              aria-label={`Выбросить выбранный предмет (${selectedItem.name})`}
              title="Выбросить 1 предмет [Q] (Shift — весь стек)"
              className="h-12 px-2.5 rounded-xl border bg-[#0e172a]/92 border-slate-600/80 hover:border-rose-400/70 text-rose-200 hover:text-rose-100 flex items-center gap-1.5 text-xs font-semibold shadow-2xl transition-colors cursor-pointer"
            >
              <PackageMinus className="w-4 h-4" />
              <span className="hidden md:inline whitespace-nowrap">Выбросить [Q]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
