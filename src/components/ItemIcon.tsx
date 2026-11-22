import React from 'react';
import { ITEMS } from '../game/catalog';

interface ItemIconProps {
  itemId: string;
  size?: number;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ itemId, size = 28 }) => {
  const item = ITEMS[itemId];
  if (!item) return null;

  // Use user-supplied ornate sword texture for Zazu Sword & Ruby Greatsword
  if (item.textureSrc === '/assets/aistudio/sword_03ad3b16.png') {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center overflow-hidden pointer-events-none select-none"
      >
        <img
          src={item.textureSrc}
          alt={item.name}
          referrerPolicy="no-referrer"
          style={{
            width: size * 1.45,
            height: size * 1.45,
            filter: item.id === 'ruby_greatsword' ? 'hue-rotate(155deg) saturate(1.4)' : undefined,
          }}
          className="object-contain rotate-45 max-w-none"
        />
      </div>
    );
  }

  // Pickaxes
  if (item.category === 'tool') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path
          d="M5 19 L17 7"
          stroke="#78350f"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M11 4 Q17.5 3.5 20 13 L17.5 13.5 Q15.5 7.5 11.5 6.5 Z"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 5.5 Q16.5 6 18 10"
          stroke={item.accent}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Spears
  if (item.weaponKind === 'spear') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <line x1="4" y1="20" x2="17" y2="7" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
        <polygon points="21,3 13,6 18,11" fill={item.accent} stroke="#0f172a" strokeWidth="1.3" />
      </svg>
    );
  }

  // Melee Swords (non-texture)
  if (item.weaponKind === 'melee') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <polygon
          points="20,4 17,11 11,17 7,13 13,7"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line x1="8" y1="12" x2="12" y2="16" stroke={item.accent} strokeWidth="3" strokeLinecap="round" />
        <line x1="5" y1="19" x2="9" y2="15" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Bows
  if (item.weaponKind === 'bow') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path
          d="M7 4 Q19 12 7 20"
          fill="none"
          stroke={item.color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="7" y1="4" x2="7" y2="20" stroke="#e2e8f0" strokeWidth="1.2" />
        <line x1="5" y1="12" x2="19" y2="12" stroke={item.accent} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  // Boomerang
  if (item.weaponKind === 'boomerang') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path
          d="M5 17 Q5 6 19 6 Q15 10 12 12 Q9 15 5 17 Z"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.4"
        />
        <circle cx="15" cy="8" r="1.5" fill={item.accent} />
      </svg>
    );
  }

  // Magic staffs & Laser
  if (item.weaponKind === 'magic' || item.weaponKind === 'laser') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <line x1="5" y1="19" x2="15" y2="9" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="17" cy="7" r="4.5" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
        <circle cx="16.5" cy="6.5" r="1.8" fill={item.accent} />
      </svg>
    );
  }

  // Yarn Bomb
  if (item.weaponKind === 'bomb') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <circle cx="12" cy="13" r="7" fill={item.color} stroke="#0f172a" strokeWidth="1.5" />
        <path d="M8 10 Q12 13 16 10 M7 14 Q12 17 17 14" stroke={item.accent} strokeWidth="1.5" fill="none" />
        <path d="M12 6 Q14 3 17 4" stroke="#facc15" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Torch
  if (item.id === 'torch_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="10" y="10" width="4" height="11" rx="1" fill="#78350f" stroke="#0f172a" strokeWidth="1.2" />
        <path d="M12 3 C15 6 16 9 12 11 C8 9 9 6 12 3 Z" fill="#f97316" stroke="#7c2d12" strokeWidth="1" />
        <circle cx="12" cy="8.5" r="1.8" fill="#fef08a" />
      </svg>
    );
  }

  // Door
  if (item.id === 'door_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="7" y="3" width="10" height="18" rx="1" fill={item.color} stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="14.5" cy="12" r="1.3" fill={item.accent} />
      </svg>
    );
  }

  // Bed
  if (item.id === 'bed_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="3" y="12" width="18" height="6" rx="1" fill="#78350f" stroke="#0f172a" strokeWidth="1.3" />
        <rect x="4" y="9" width="16" height="5" rx="1" fill={item.color} />
        <rect x="4" y="7" width="6" height="3" rx="1" fill={item.accent} />
      </svg>
    );
  }

  // Stool
  if (item.id === 'stool_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="5" y="7" width="14" height="4" rx="1.5" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
        <rect x="6.5" y="8" width="11" height="1.5" fill={item.accent} opacity="0.8" />
        <rect x="7" y="11" width="2.5" height="9" fill="#78350f" stroke="#0f172a" strokeWidth="1" />
        <rect x="14.5" y="11" width="2.5" height="9" fill="#78350f" stroke="#0f172a" strokeWidth="1" />
        <rect x="8.5" y="15" width="7" height="2" fill="#78350f" />
      </svg>
    );
  }

  // Stations
  if (item.category === 'station') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="4" y="6" width="16" height="12" rx="2" fill={item.color} stroke="#0f172a" strokeWidth="1.5" />
        <rect x="7" y="10" width="10" height="5" rx="1" fill={item.accent} />
      </svg>
    );
  }

  // Consumables
  if (item.category === 'consumable') {
    if (item.id === 'crispy_fish') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <ellipse cx="11" cy="12" rx="7" ry="4.5" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
          <polygon points="17,12 22,8 22,16" fill={item.accent} stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="8" cy="11" r="1.2" fill="#0f172a" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path
          d="M9 4 L15 4 L15 8 L18 13 L18 19 Q18 20 17 20 L7 20 Q6 20 6 19 L6 13 L9 8 Z"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.4"
        />
        <rect x="8" y="13" width="8" height="5" rx="1" fill={item.accent} />
      </svg>
    );
  }

  // Bars / Gems / Materials
  if (item.category === 'material') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <polygon
          points="12,4 20,10 17,19 7,19 4,10"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <polygon points="12,6 16,10 12,15 8,10" fill={item.accent} opacity="0.7" />
      </svg>
    );
  }

  // Building blocks & background walls
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        fill={item.color}
        stroke="#0f172a"
        strokeWidth="1.5"
        strokeDasharray={item.category === 'wall' ? '3 2' : undefined}
      />
      <rect x="6" y="6" width="12" height="4" fill={item.accent} opacity="0.55" />
    </svg>
  );
};
