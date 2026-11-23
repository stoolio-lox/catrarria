import React, { useState } from 'react';
import { Mountain, Settings, Sparkles } from 'lucide-react';
import { WorldVariant } from '../game/types';
import { WORLD_VARIANTS } from '../game/worldGen';

interface TitleScreenProps {
  onStart: (variant: WorldVariant) => void;
  onOpenSettings: () => void;
  initialVariant?: WorldVariant;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenSettings,
  initialVariant = 'crimson_classic',
}) => {
  const [selectedVariant, setSelectedVariant] = useState<WorldVariant>(initialVariant);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between py-6 px-4 sm:px-6 bg-gradient-to-b from-[#071122]/80 via-[#071122]/45 to-[#071122]/90 overflow-y-auto">
      {/* Top Safe Space */}
      <div className="h-2" aria-hidden="true" />

      {/* Center Emblem + World Generation Selector + Primary CTA */}
      <div className="flex flex-col items-center text-center max-w-2xl w-full">
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-xl bg-slate-900">
            <img
              src="/assets/aistudio/zazuuu_cat_d36ff0de.jpg"
              alt="Кот Зазу — главный герой Котаррии"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <img
            src="/assets/aistudio/sword_03ad3b16.png"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain absolute -right-10 -bottom-4 rotate-45 pointer-events-none"
          />
        </div>

        {/* Custom Inline SVG Title Lockup */}
        <svg
          viewBox="0 0 460 92"
          className="w-full max-w-[400px] h-auto mb-2 drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]"
          role="img"
          aria-label="Котаррия"
        >
          <defs>
            <linearGradient id="kotarriaWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path
            d="M28 16 L432 16 L446 46 L432 76 L28 76 L14 46 Z"
            fill="#142038"
            stroke="#f59e0b"
            strokeWidth="3"
          />
          <text
            x="230"
            y="60"
            textAnchor="middle"
            fill="url(#kotarriaWood)"
            stroke="#0b1120"
            strokeWidth="5"
            paintOrder="stroke fill"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: '46px',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}
          >
            КОТАРРИЯ
          </text>
        </svg>

        <p className="text-sm sm:text-base text-slate-100 hud-stroke max-w-lg mb-4 leading-relaxed">
          Копай огромные недра, строй дома для жителей, собирай броню и срази всех 19 боссов Террарии!
        </p>

        {/* 2 World Generation Variants */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-5 text-left"
          role="radiogroup"
          aria-label="Вариант генерации мира"
        >
          {(['crimson_classic', 'crystal_highlands'] as WorldVariant[]).map((variantId) => {
            const v = WORLD_VARIANTS[variantId];
            const active = selectedVariant === variantId;
            return (
              <button
                key={variantId}
                type="button"
                role="radio"
                aria-checked={active}
                data-variant={variantId}
                onClick={() => setSelectedVariant(variantId)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0f1c34]/95 border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.45),0_10px_24px_rgba(0,0,0,0.45)]'
                    : 'bg-[#0b1324]/85 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="flex items-center gap-1.5 font-display font-bold text-sm text-white">
                    {variantId === 'crimson_classic' ? (
                      <Mountain className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    <span>{v.title}</span>
                  </span>
                  <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 shrink-0">
                    {v.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{v.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            data-start="true"
            onClick={() => onStart(selectedVariant)}
            className="px-10 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-display font-extrabold text-xl tracking-wide shadow-[0_6px_0_#92400e,0_12px_28px_rgba(0,0,0,0.5)] transition-transform duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            Играть
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="px-6 py-3.5 rounded-xl bg-[#0e172a]/90 hover:bg-slate-800 border border-slate-600/80 hover:border-amber-400/60 text-slate-100 font-display font-bold text-base flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Настройки</span>
          </button>
        </div>
      </div>

      {/* Flat Borderless Control Hints */}
      <p className="text-xs sm:text-sm text-slate-200/90 hud-stroke text-center tracking-wide mt-4">
        A / D Движение · Space Прыжок / Крылья · ЛКМ Копать / Атака · ПКМ Строить · E Инвентарь и Крафт · 1–9 Хотбар · Esc Пауза
      </p>
    </div>
  );
};
