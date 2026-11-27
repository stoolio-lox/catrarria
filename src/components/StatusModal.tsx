import React from 'react';
import { Save } from 'lucide-react';
import { UI_TEXT } from '../game/i18n';
import { Language, RunStats } from '../game/types';

interface StatusModalProps {
  mode: 'paused' | 'gameover';
  language: Language;
  stats: RunStats;
  onResume?: () => void;
  onSaveWorld?: () => void;
  onSaveAndMenu?: () => void;
  onOpenSettings?: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  mode,
  language,
  stats,
  onResume,
  onSaveWorld,
  onSaveAndMenu,
  onOpenSettings,
  onRestart,
  onTitle,
}) => {
  const t = UI_TEXT[language];
  const isPause = mode === 'paused';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-label={isPause ? t.pauseTitle : t.gameoverTitle}
    >
      <div className="w-full max-w-md bg-[#10192b] border border-amber-400/45 rounded-2xl p-6 shadow-2xl text-center">
        <h2 className="font-display font-extrabold text-2xl text-amber-300 mb-1">
          {isPause ? t.pauseTitle : t.gameoverTitle}
        </h2>
        <p className="text-sm text-slate-300 mb-5">
          {isPause ? t.pauseSub : t.gameoverSub}
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-6 text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">{t.daysStat}</div>
            <div className="text-lg font-mono-num font-bold text-white">
              {stats.daysSurvived}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">{t.monstersStat}</div>
            <div className="text-lg font-mono-num font-bold text-white">
              {stats.monstersKilled}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">{t.placedStat}</div>
            <div className="text-lg font-mono-num font-bold text-white">
              {stats.blocksPlaced}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isPause && onResume && (
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-base cursor-pointer"
            >
              {t.resume}
            </button>
          )}
          {isPause && onSaveWorld && (
            <button
              type="button"
              data-testid="save-game-btn"
              onClick={onSaveWorld}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveWorldBtn}</span>
            </button>
          )}
          {isPause && onSaveAndMenu && (
            <button
              type="button"
              data-testid="save-and-menu-btn"
              onClick={onSaveAndMenu}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-200 font-display font-bold text-sm cursor-pointer"
            >
              {t.saveAndMenuBtn}
            </button>
          )}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-200 font-display font-bold text-base cursor-pointer"
            >
              {t.settings}
            </button>
          )}
          <button
            type="button"
            data-start={!isPause ? 'true' : undefined}
            onClick={onRestart}
            className={`w-full py-3 rounded-xl font-display font-bold text-base cursor-pointer ${
              isPause
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {isPause ? t.restart : t.playAgain}
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-800/70 text-slate-300 text-sm font-medium cursor-pointer"
          >
            {t.mainMenu}
          </button>
        </div>
      </div>
    </div>
  );
};
