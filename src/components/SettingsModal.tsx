import React from 'react';
import { Music, RotateCcw, Settings, Sparkles, Volume2, X } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../game/settings';
import { GameSettings } from '../game/types';

interface SettingsModalProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onChange,
  onClose,
}) => {
  const update = (patch: Partial<GameSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-label="Настройки игры"
    >
      <div className="w-full max-w-lg bg-[#0e172a] border border-amber-400/45 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#09101f]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-amber-300">
              Настройки
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть настройки"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto game-scroll space-y-5 text-sm">
          {/* Music Settings */}
          <section className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="setting-music-toggle" className="flex items-center gap-2 font-semibold text-amber-200 cursor-pointer">
                <Music className="w-4 h-4 text-amber-400" />
                <span>Музыка (в стиле Террарии)</span>
              </label>
              <button
                id="setting-music-toggle"
                type="button"
                role="switch"
                aria-checked={settings.musicEnabled}
                onClick={() => update({ musicEnabled: !settings.musicEnabled })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  settings.musicEnabled
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {settings.musicEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <label htmlFor="setting-music-volume">Громкость музыки</label>
                <span className="font-mono-num font-semibold text-amber-300">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                id="setting-music-volume"
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.musicVolume * 100)}
                onChange={(e) => update({ musicVolume: Number(e.target.value) / 100 })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </section>

          {/* SFX Settings */}
          <section className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="setting-sfx-toggle" className="flex items-center gap-2 font-semibold text-sky-200 cursor-pointer">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>Звуковые эффекты</span>
              </label>
              <button
                id="setting-sfx-toggle"
                type="button"
                role="switch"
                aria-checked={settings.sfxEnabled}
                onClick={() => update({ sfxEnabled: !settings.sfxEnabled })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  settings.sfxEnabled
                    ? 'bg-sky-500 text-slate-950 border-sky-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {settings.sfxEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <label htmlFor="setting-sfx-volume">Громкость эффектов</label>
                <span className="font-mono-num font-semibold text-sky-300">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                id="setting-sfx-volume"
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.sfxVolume * 100)}
                onChange={(e) => update({ sfxVolume: Number(e.target.value) / 100 })}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </section>

          {/* Graphics & Gameplay */}
          <section className="space-y-2.5 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Графика и геймплей</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-200 text-xs sm:text-sm">Тряска камеры при ударах и боссах</span>
              <button
                type="button"
                role="switch"
                aria-label="Тряска камеры"
                aria-checked={settings.screenShake}
                onClick={() => update({ screenShake: !settings.screenShake })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  settings.screenShake
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {settings.screenShake ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-200 text-xs sm:text-sm">Частицы и искры эффектов</span>
              <button
                type="button"
                role="switch"
                aria-label="Частицы эффектов"
                aria-checked={settings.particlesEnabled}
                onClick={() => update({ particlesEnabled: !settings.particlesEnabled })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  settings.particlesEnabled
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {settings.particlesEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-200 text-xs sm:text-sm">Автопауза в инвентаре и сундуке</span>
              <button
                type="button"
                role="switch"
                aria-label="Автопауза в меню"
                aria-checked={settings.autopauseInMenus}
                onClick={() => update({ autopauseInMenus: !settings.autopauseInMenus })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  settings.autopauseInMenus
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {settings.autopauseInMenus ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-[#09101f]">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_SETTINGS })}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
