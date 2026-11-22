import React, { useState } from 'react';
import { Bug, Lock, Shield, Sparkles, Sun, Swords, Trash2, X } from 'lucide-react';
import { verifyDebugPassword } from '../game/catalog';
import { EnemyKind, HudSnapshot } from '../game/types';

interface DebugModalProps {
  hud: HudSnapshot;
  unlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
  onToggleGodMode: () => void;
  onRestoreVitals: () => void;
  onSetTime: (preset: 'morning' | 'noon' | 'night') => void;
  onGiveKit: (kind: 'weapons' | 'resources' | 'stool' | 'summons') => void;
  onSpawnEnemy: (kind: EnemyKind) => void;
  onClearEnemies: () => void;
  onTeleportSpawn: () => void;
  onBoostDefense: (delta: number) => void;
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
  onSpawnEnemy,
  onClearEnemies,
  onTeleportSpawn,
  onBoostDefense,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
      aria-label="Дебаг-меню"
    >
      <div className="w-full max-w-xl bg-[#0e172a] border border-emerald-400/45 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#09101f]">
          <div className="flex items-center gap-2.5">
            <Bug className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display font-bold text-lg text-emerald-300">
              Дебаг-меню
            </h2>
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
              <label htmlFor="debug-password-input" className="block text-xs font-medium text-slate-400 mb-1.5">
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
          <div className="p-5 overflow-y-auto game-scroll space-y-5 text-sm">
            {/* Hero & God Mode */}
            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Персонаж
              </h3>
              <div className="grid grid-cols-2 gap-2">
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
                  onClick={onTeleportSpawn}
                  className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold text-left cursor-pointer"
                >
                  Телепорт на спавн
                </button>
              </div>
            </section>

            {/* Time of Day */}
            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Время суток
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSetTime('morning')}
                  className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Утро
                </button>
                <button
                  type="button"
                  onClick={() => onSetTime('noon')}
                  className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Полдень
                </button>
                <button
                  type="button"
                  onClick={() => onSetTime('night')}
                  className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-indigo-400/60 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Ночь
                </button>
              </div>
            </section>

            {/* Kits & Items */}
            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Выдача предметов
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onGiveKit('weapons')}
                  className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-amber-200 text-xs font-semibold cursor-pointer"
                >
                  Всё оружие
                </button>
                <button
                  type="button"
                  onClick={() => onGiveKit('resources')}
                  className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-emerald-400/60 text-emerald-200 text-xs font-semibold cursor-pointer"
                >
                  Ресурсы
                </button>
                <button
                  type="button"
                  onClick={() => onGiveKit('summons')}
                  className="px-3 py-2.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-rose-400/60 text-rose-200 text-xs font-semibold cursor-pointer"
                >
                  Призывалки
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

            {/* Monsters */}
            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                Призыв монстров и боссов
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                <button
                  type="button"
                  onClick={() => onSpawnEnemy('king_slime')}
                  className="px-3 py-2 rounded-xl border bg-emerald-950/50 border-emerald-500/40 hover:border-emerald-400 text-emerald-200 text-xs font-semibold cursor-pointer"
                >
                  + Босс Король Слизней
                </button>
                <button
                  type="button"
                  onClick={() => onSpawnEnemy('kotulhu')}
                  className="px-3 py-2 rounded-xl border bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                >
                  + Босс Котулху
                </button>
                <button
                  type="button"
                  onClick={() => onSpawnEnemy('cat_worm')}
                  className="px-3 py-2 rounded-xl border bg-amber-950/50 border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-semibold cursor-pointer"
                >
                  + Котовый Червь
                </button>
                <button
                  type="button"
                  onClick={() => onSpawnEnemy('skele_cat')}
                  className="px-3 py-2 rounded-xl border bg-purple-950/50 border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-semibold cursor-pointer"
                >
                  + Босс Кототрон
                </button>
                <button
                  type="button"
                  onClick={() => onSpawnEnemy('eye_boss')}
                  className="px-3 py-2 rounded-xl border bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold cursor-pointer"
                >
                  + Босс Око Ночи
                </button>
                <button
                  type="button"
                  onClick={onClearEnemies}
                  className="px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 hover:border-emerald-400/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer sm:col-span-3"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить всех врагов</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
