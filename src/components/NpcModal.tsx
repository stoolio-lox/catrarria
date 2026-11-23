import React from 'react';
import { CheckCircle2, Coins, HeartPulse, Home, ShoppingBag, X, XCircle } from 'lucide-react';
import { ITEMS } from '../game/catalog';
import { NPC_TEMPLATES } from '../game/npc';
import { HousingRoomReport, NpcKind } from '../game/types';
import { ItemIcon } from './ItemIcon';

interface NpcModalProps {
  npc: {
    id: number;
    kind: NpcKind;
    name: string;
    title: string;
    quote: string;
    settled: boolean;
    shopItems: { itemId: string; price: number }[];
    canHeal: boolean;
    healCost: number;
  };
  coins: number;
  hp: number;
  maxHp: number;
  validHouseCount: number;
  roomReport: HousingRoomReport | null;
  onBuyItem: (itemId: string) => void;
  onHealNurse: () => void;
  onClose: () => void;
}

const NpcPortrait: React.FC<{ kind: NpcKind }> = ({ kind }) => {
  const tpl = NPC_TEMPLATES[kind];
  const app = tpl.appearance;
  return (
    <svg viewBox="0 0 40 48" width={46} height={54} className="shrink-0">
      <rect x="11" y="25" width="18" height="17" rx="4" fill={app.shirt} stroke="#0f172a" strokeWidth="1.5" />
      {app.apron && <rect x="13" y="27" width="14" height="15" rx="2" fill={app.apron} />}
      <rect x="12" y="10" width="16" height="16" rx="4" fill={app.skin} stroke="#0f172a" strokeWidth="1.5" />
      <rect x="11" y="8" width="18" height="5" rx="2" fill={app.hair} />
      {app.hat === 'tophat' && (
        <>
          <rect x="9" y="7" width="22" height="3" rx="1" fill="#1e293b" />
          <rect x="13" y="1" width="14" height="7" rx="1" fill="#1e293b" />
          <rect x="13" y="6" width="14" height="1.5" fill="#facc15" />
        </>
      )}
      {app.hat === 'nurse' && (
        <>
          <rect x="13" y="3" width="14" height="6" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="18.8" y="4.3" width="2.4" height="3.6" fill="#ef4444" />
          <rect x="18" y="5.1" width="4" height="2" fill="#ef4444" />
        </>
      )}
      {app.hat === 'helmet' && (
        <>
          <path d="M10 11 Q20 2 30 11 Z" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="20" cy="6" r="2.2" fill="#fef08a" />
        </>
      )}
      {app.hat === 'leaves' && (
        <path d="M10 10 Q15 4 20 8 Q25 4 30 10" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      <circle cx="16.5" cy="17" r="1.5" fill={app.eyeColor} />
      <circle cx="23.5" cy="17" r="1.5" fill={app.eyeColor} />
      <path d="M17.5 21 Q20 23 22.5 21" stroke="#7c2d12" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {app.hairStyle === 'beard' && (
        <path d="M13 21 Q20 29 27 21 L25 26 Q20 29 15 26 Z" fill={app.hair} />
      )}
    </svg>
  );
};

export const NpcModal: React.FC<NpcModalProps> = ({
  npc,
  coins,
  hp,
  maxHp,
  validHouseCount,
  roomReport,
  onBuyItem,
  onHealNurse,
  onClose,
}) => {
  const needsHeal = hp < maxHp;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
      aria-label={`Разговор с ${npc.title} ${npc.name}`}
    >
      <div className="w-full max-w-2xl bg-[#10192b] border border-amber-400/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-700/80 bg-[#0b1322]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center justify-center overflow-hidden">
              <NpcPortrait kind={npc.kind} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-amber-300">
                  {npc.title} {npc.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    npc.settled
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Home className="w-3 h-3" />
                  {npc.settled ? 'Живёт в доме' : 'Без своего дома'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono-num font-bold text-amber-200">
                  Монеты котика: {coins}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Построено домов: {validHouseCount}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть диалог с жителем"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto game-scroll space-y-4">
          {/* Dialogue bubble */}
          <div className="bg-[#0b1322] border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 leading-relaxed">
            «{npc.quote}»
          </div>

          {/* Guide Housing Inspector */}
          {npc.kind === 'guide' && roomReport && (
            <div className="bg-[#0b1322] border border-sky-500/35 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-200">
                <span>Проверка комнаты для жилья (вокруг котика)</span>
                <span className={roomReport.hasHouseForNpc ? 'text-emerald-300' : 'text-amber-300'}>
                  {roomReport.hasHouseForNpc ? 'Подходит для жителя!' : 'Не завершена'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
                {[
                  { label: 'Стены и фон', ok: roomReport.hasWall && roomReport.interiorCount >= 6 },
                  { label: 'Свет', ok: roomReport.hasLight },
                  { label: 'Дверь', ok: roomReport.hasDoor },
                  { label: 'Стол', ok: roomReport.hasTable },
                  { label: 'Стул', ok: roomReport.hasSeat },
                ].map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
                      req.ok
                        ? 'bg-emerald-950/60 border-emerald-500/35 text-emerald-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {req.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nurse Heal Service */}
          {npc.canHeal && (
            <div className="flex items-center justify-between gap-3 bg-rose-950/35 border border-rose-500/40 rounded-xl p-3.5">
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-rose-100">
                    Полное лечение ({hp}/{maxHp} HP)
                  </div>
                  <div className="text-xs text-rose-200/80">
                    Восстановит всё здоровье и ману мгновенно.
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={!needsHeal}
                onClick={onHealNurse}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  needsHeal
                    ? 'bg-rose-500 hover:bg-rose-400 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {!needsHeal
                  ? 'Здоров'
                  : npc.healCost === 0
                    ? 'Вылечить бесплатно'
                    : `Вылечить (${npc.healCost} монет)`}
              </button>
            </div>
          )}

          {/* Shop */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Лавка жителя</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="npc-shop-list">
              {npc.shopItems.map(({ itemId, price }) => {
                const def = ITEMS[itemId];
                if (!def) return null;
                const canAfford = coins >= price;
                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                        <ItemIcon itemId={itemId} size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {def.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate" title={def.description}>
                          {def.description}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyItem(itemId)}
                      aria-label={`Купить ${def.name} за ${price} монет`}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-colors ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                      <span>{price}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
