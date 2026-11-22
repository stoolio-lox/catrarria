import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between py-10 px-6 bg-gradient-to-b from-[#071122]/75 via-[#071122]/35 to-[#071122]/85">
      {/* Top Safe Space */}
      <div className="h-4" aria-hidden="true" />

      {/* Center Emblem + Primary CTA */}
      <div className="flex flex-col items-center text-center max-w-xl">
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-xl bg-slate-900">
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
            className="w-24 h-24 object-contain absolute -right-11 -bottom-5 rotate-45 pointer-events-none"
          />
        </div>

        {/* Custom Inline SVG Title Lockup */}
        <svg
          viewBox="0 0 460 92"
          className="w-full max-w-[440px] h-auto mb-3 drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]"
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

        <p className="text-base sm:text-lg text-slate-100 hud-stroke max-w-md mb-7 leading-relaxed">
          Копай подземелья, строй уютный кошачий замок, крафти арсенал оружия и отбивайся от ночных чудовищ.
        </p>

        <button
          type="button"
          data-start="true"
          onClick={onStart}
          className="px-10 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-display font-extrabold text-xl tracking-wide shadow-[0_6px_0_#92400e,0_12px_28px_rgba(0,0,0,0.5)] transition-transform duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          Играть
        </button>
      </div>

      {/* Flat Borderless Control Hints */}
      <p className="text-xs sm:text-sm text-slate-200/90 hud-stroke text-center tracking-wide">
        A / D Движение · Space Прыжок · ЛКМ Копать / Атака · ПКМ Строить · E Инвентарь и Крафт · 1–9 Хотбар · Esc Пауза
      </p>
    </div>
  );
};
