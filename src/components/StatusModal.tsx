import React from 'react';
import { RunStats } from '../game/types';

interface StatusModalProps {
  mode: 'paused' | 'gameover';
  stats: RunStats;
  onResume?: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  mode,
  stats,
  onResume,
  onRestart,
  onTitle,
}) => {
  const isPause = mode === 'paused';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-label={isPause ? 'Пауза' : 'Котик повержен'}
    >
      <div className="w-full max-w-md bg-[#10192b] border border-amber-400/45 rounded-2xl p-6 shadow-2xl text-center">
        <h2 className="font-display font-extrabold text-2xl text-amber-300 mb-1">
          {isPause ? 'Пауза' : 'Котик потерял все жизни'}
        </h2>
        <p className="text-sm text-slate-300 mb-5">
          {isPause
            ? 'Отдохни, поправь усики и продолжай приключение.'
            : 'Монстры оказались сильнее, но ты можешь начать новый поход!'}
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-6 text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Дней</div>
            <div className="text-lg font-mono-num font-bold text-white">
              {stats.daysSurvived}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Монстров</div>
            <div className="text-lg font-mono-num font-bold text-white">
              {stats.monstersKilled}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Построено</div>
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
              Продолжить
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
            {isPause ? 'Начать заново' : 'Играть снова'}
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-800/70 text-slate-300 text-sm font-medium cursor-pointer"
          >
            Главное меню
          </button>
        </div>
      </div>
    </div>
  );
};
