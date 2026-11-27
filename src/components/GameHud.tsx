import React from 'react';
import { Backpack, Bug, Copy, Hammer, HelpCircle, PackageMinus, Pause, Settings, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { ITEMS, getItemDescription, getItemName } from '../game/catalog';
import { UI_TEXT, tr } from '../game/i18n';
import { HudSnapshot } from '../game/types';
import { getBiomeName } from '../game/worldGen';
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
  const lang = hud.language;
  const t = UI_TEXT[lang];
  const selectedSlot = hud.hotbar[hud.selectedSlot];
  const selectedItem = selectedSlot ? ITEMS[selectedSlot.itemId] : null;
  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const manaPct = Math.max(0, Math.min(100, (hud.mana / hud.maxMana) * 100));

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Row: Left Vitality/Clock Cluster + Center Bosses/Events + Right Utility Controls */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left Cluster */}
        <div className="pointer-events-auto flex flex-col gap-1.5 shrink-0 max-w-[270px]">
          <div className="flex items-center gap-3 bg-[#0e172a]/90 border border-amber-400/30 rounded-xl p-2.5 shadow-lg">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-amber-300/60 shrink-0 bg-slate-900">
              <img
                src="/assets/aistudio/zazuuu_cat_d36ff0de.jpg"
                alt="Zazu"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-[172px]">
              {/* HP Bar */}
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-200 tracking-wide">{t.health}</span>
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
                <span className="font-medium text-sky-200">{t.mana}</span>
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
                    <span className="font-medium text-cyan-200">{t.wingFlight}</span>
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
                <span>
                  {t.day} {hud.dayCount} · {hud.isNight ? t.night : t.day}
                </span>
                <span aria-hidden="true">/</span>
                <span>
                  {t.defense} {hud.defense}
                </span>
                <span aria-hidden="true">/</span>
                <span className="text-amber-300 font-semibold">
                  {t.coins} {hud.coins}
                </span>
                <span aria-hidden="true">/</span>
                <span>
                  {hud.houseValid ? t.indoors : `${hud.depthMeters}${t.depth}`} · {t.houses} {hud.validHouseCount}
                </span>
                <span aria-hidden="true">/</span>
                <span className="text-sky-300 font-sans font-semibold">
                  {getBiomeName(hud.biome, lang)}
                </span>
                {hud.godMode && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="text-emerald-300 font-semibold">{t.god}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {hud.activeEffects.length > 0 && (
            <div
              data-testid="active-effects-bar"
              aria-label={t.effectsTitle}
              className="flex flex-wrap items-center gap-1 bg-[#0e172a]/90 border border-slate-700/80 rounded-lg p-1.5 shadow-lg"
            >
              {hud.activeEffects.map((eff) => (
                <div
                  key={eff.id}
                  data-effect-id={eff.id}
                  data-debuff={eff.isDebuff ? 'true' : 'false'}
                  title={`${eff.name} — ${eff.description}`}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${
                    eff.isDebuff
                      ? 'bg-rose-950/90 border-rose-500/70 text-rose-100'
                      : 'bg-emerald-950/85 border-emerald-400/55 text-emerald-100'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-xs shrink-0"
                    style={{ backgroundColor: eff.color }}
                  />
                  <span className="truncate max-w-[78px]">{eff.name}</span>
                  <span className="font-mono-num opacity-90">{Math.ceil(eff.remaining)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top-Center: Active Boss Bars + Lunar / Alien Event Trackers + Toast */}
        <div className="flex flex-col items-center gap-1.5 max-w-[440px] w-full">
          {hud.activeBosses.length > 0 && (
            <>
              <div
                className={
                  hud.activeBosses.length > 1
                    ? 'grid grid-cols-2 gap-1.5 w-full'
                    : 'flex flex-col items-center gap-1.5 w-full max-w-[320px]'
                }
                data-testid="active-boss-bars"
              >
                {hud.activeBosses.slice(0, 6).map((boss) => {
                  const bHpPct = Math.max(0, Math.min(100, (boss.hp / Math.max(1, boss.maxHp)) * 100));
                  const hasShield = (boss.maxShield ?? 0) > 0;
                  const shieldVal = boss.shield ?? 0;
                  const shieldMax = boss.maxShield ?? 0;
                  const shieldPct = hasShield
                    ? Math.max(0, Math.min(100, (shieldVal / Math.max(1, shieldMax)) * 100))
                    : 0;
                  return (
                    <div
                      key={boss.id}
                      className="flex flex-col items-center bg-[#180d14]/92 border border-rose-500/50 rounded-lg px-2.5 py-1 shadow-lg w-full"
                    >
                      <div className="flex items-center justify-between w-full text-[11px] font-semibold text-rose-200 mb-0.5 gap-1.5">
                        <span className="truncate">{boss.name}</span>
                        <span className="font-mono-num shrink-0 text-[10px]">
                          {boss.hp}/{boss.maxHp}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-sm overflow-hidden border border-rose-900">
                        <div
                          className="h-full bg-rose-600 transition-[width] duration-150"
                          style={{ width: `${bHpPct}%` }}
                        />
                      </div>
                      {hasShield && (
                        <div className="w-full mt-0.5">
                          <div className="flex items-center justify-between text-[9px] text-cyan-200">
                            <span>{shieldVal > 0 ? t.pillarShield : t.pillarExposed}</span>
                            <span className="font-mono-num">
                              {shieldVal}/{shieldMax}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-950 rounded-sm overflow-hidden border border-cyan-900">
                            <div
                              className="h-full bg-cyan-400 transition-[width] duration-150"
                              style={{ width: `${shieldPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {hud.activeBosses.length > 6 && (
                <div className="px-2.5 py-0.5 rounded-md bg-[#180d14]/90 border border-rose-500/40 text-[11px] font-mono-num text-rose-200">
                  +{hud.activeBosses.length - 6} {tr(lang, 'more bosses', 'ещё боссов')}
                </div>
              )}
            </>
          )}

          {(hud.lunarEvent.active || hud.alienInvasion.active) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
              {hud.lunarEvent.active && (
                <div
                  data-testid="lunar-event-banner"
                  className="flex-1 min-w-[175px] flex items-center justify-between gap-2 bg-[#0c1a2e]/92 border border-cyan-400/50 rounded-lg px-3 py-1 text-xs shadow-lg"
                >
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-200">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>{t.lunarPillarsLabel}</span>
                  </span>
                  <span className="font-mono-num font-bold text-white">
                    {hud.lunarEvent.pillarsAlive.length}/4
                  </span>
                </div>
              )}

              {hud.alienInvasion.active && (
                <div
                  data-testid="alien-event-banner"
                  className="flex-1 min-w-[175px] flex items-center justify-between gap-2 bg-[#092018]/92 border border-lime-400/55 rounded-lg px-3 py-1 text-xs shadow-lg"
                >
                  <span className="font-semibold text-lime-300">{t.alienInvasionLabel}</span>
                  <span className="font-mono-num font-bold text-white">
                    {hud.alienInvasion.defeated}/{hud.alienInvasion.target}
                  </span>
                </div>
              )}
            </div>
          )}

          {hud.toastMessage && (
            <div className="bg-[#0e172a]/95 border border-amber-400/50 text-amber-100 px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-lg text-center max-w-full">
              {hud.toastMessage}
            </div>
          )}
        </div>

        {/* Top-Right Compact Utility Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleInventory();
            }}
            aria-label={t.inventoryBtn}
            className={`h-10 px-3 rounded-lg border flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
              inventoryOpen
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-amber-400/60'
            }`}
          >
            <Backpack className="w-4 h-4" />
            <span className="hidden sm:inline whitespace-nowrap">{t.inventoryBtn}</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleBuildMode();
            }}
            aria-label={t.buildMode}
            title={t.buildMode}
            className={`h-10 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              hud.activeToolMode === 'build'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-emerald-400/60'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span className="hidden sm:inline whitespace-nowrap">
              {hud.activeToolMode === 'build' ? t.buildMode : t.autoMode}
            </span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onSummonBoss();
            }}
            aria-label={t.bossBtn}
            title={t.bossBtn}
            className="h-10 px-2.5 rounded-lg border bg-[#0e172a]/90 text-rose-300 border-slate-700 hover:border-rose-400/70 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.bossBtn}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleHelp();
            }}
            aria-label={t.howToPlayTitle}
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
            aria-label={muted ? 'Unmute' : 'Mute'}
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
            aria-label={t.debugBtn}
            title={`${t.debugBtn} [F9]`}
            className={`h-10 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              debugOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-[#0e172a]/90 text-emerald-300 border-slate-700 hover:border-emerald-400/70'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span className="hidden sm:inline">{t.debugBtn}</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenSettings();
            }}
            aria-label={t.settings}
            title={t.settings}
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
            aria-label={t.pauseTitle}
            className="w-10 h-10 rounded-lg border bg-[#0e172a]/90 text-slate-100 border-slate-700 hover:border-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast notifications are rendered cleanly inside the top-center stack above */}

      {/* Stool Interactive Speech & Ctrl+V Hint Banner */}
      {hud.stoolSpeech && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto fixed bottom-32 left-1/2 -translate-x-1/2 w-[min(92vw,480px)] bg-[#0e172a]/96 border-2 border-amber-400/70 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center justify-center shrink-0">
            <ItemIcon itemId="stool_item" size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-300">
              {t.stoolSays}
            </div>
            <div className="font-display font-bold text-base text-white mt-0.5">
              “{hud.stoolSpeech.text}”
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
                  aria-label={t.copyBtn}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyBtn}</span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onDismissStoolSpeech}
            aria-label={t.closeBtn}
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
          <div className="pointer-events-auto fixed bottom-32 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 max-w-[94vw]">
            {hud.nearbyChest && (
              <div className="bg-[#0e172a]/92 border border-amber-400/55 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-amber-100">
                <span>
                  {hud.nearbyChest.hasLoot ? t.chestTreasure : t.chestEmpty}
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
                  {t.openPrompt}
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
                  {t.talkPrompt}
                </button>
              </div>
            )}

            {hud.nearbyStool && (
              <div className="bg-[#0e172a]/92 border border-amber-400/45 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-amber-100">
                <span>{t.stool}</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onPetStool();
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold cursor-pointer"
                >
                  {t.petPrompt}
                </button>
              </div>
            )}

            {hud.nearbyDoor && (
              <div className="bg-[#0e172a]/92 border border-orange-400/50 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-orange-100">
                <span>{t.door}</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleDoor();
                  }}
                  className="px-2.5 py-1 rounded-md bg-orange-400 hover:bg-orange-300 text-slate-950 font-semibold cursor-pointer"
                >
                  {hud.nearbyDoor.isOpen ? t.closeDoor : t.openDoor}
                </button>
              </div>
            )}
          </div>
        )}

      {/* Optional Compact Help Card */}
      {helpOpen && (
        <div className="pointer-events-auto self-end bg-[#0e172a]/95 border border-slate-600 rounded-xl p-4 max-w-sm text-xs text-slate-200 space-y-1.5 shadow-xl">
          <div className="font-display font-bold text-sm text-amber-300 mb-1">
            {t.howToPlayTitle}
          </div>
          <p>{t.helpP1}</p>
          <p>{t.helpP2}</p>
          <p>{t.helpP3}</p>
          <p>{t.helpP4}</p>
          <p>{t.helpP5}</p>
          <p>{t.helpP6}</p>
        </div>
      )}

      {/* Bottom-Center Hotbar + Selected Item Name & Description */}
      <div className="flex flex-col items-center gap-1.5">
        {selectedItem && (
          <div
            data-testid="hotbar-item-caption"
            className="flex flex-col items-center text-center max-w-[92vw]"
          >
            <div className="text-xs font-semibold text-slate-100 hud-stroke tracking-wide">
              {getItemName(selectedItem, lang)}
              {selectedItem.damage ? ` · ${t.damageStat} ${selectedItem.damage}` : ''}
              {selectedItem.manaCost ? ` · ${t.mana} ${selectedItem.manaCost}` : ''}
              {selectedItem.pickPower
                ? ` · ${tr(lang, 'Pick', 'Кирка')} ${selectedItem.pickPower}`
                : ''}
              {selectedItem.category === 'summon'
                ? ` · ${tr(lang, 'LMB / RMB summon', 'ЛКМ / ПКМ призвать')}`
                : ''}
              {selectedItem.placesTile !== undefined || selectedItem.placesWall !== undefined
                ? ` · ${tr(lang, 'RMB place', 'ПКМ поставить')}`
                : ''}
            </div>
            <div
              data-testid="hotbar-item-description"
              className="text-[11px] text-amber-200/95 hud-stroke truncate max-w-[min(86vw,560px)]"
            >
              {getItemDescription(selectedItem, lang)}
            </div>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 bg-[#0e172a]/92 border border-slate-600/80 rounded-xl p-1.5 shadow-2xl"
            role="toolbar"
            aria-label={t.hotbar}
          >
            {hud.hotbar.map((slot, idx) => {
              const active = idx === hud.selectedSlot;
              const item = slot ? ITEMS[slot.itemId] : null;
              const itemName = item ? getItemName(item, lang) : '';
              return (
                <button
                  key={idx}
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSelectSlot(idx);
                  }}
                  title={item ? `${itemName} — ${getItemDescription(item, lang)}` : undefined}
                  aria-label={`${idx + 1}: ${item ? itemName : t.empty}`}
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
              aria-label={`${t.dropBtn} (${getItemName(selectedItem, lang)})`}
              title={t.dropBtn}
              className="h-12 px-2.5 rounded-xl border bg-[#0e172a]/92 border-slate-600/80 hover:border-rose-400/70 text-rose-200 hover:text-rose-100 flex items-center gap-1.5 text-xs font-semibold shadow-2xl transition-colors cursor-pointer"
            >
              <PackageMinus className="w-4 h-4" />
              <span className="hidden md:inline whitespace-nowrap">{t.dropBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
