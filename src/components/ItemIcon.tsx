import React from 'react';
import { ITEMS } from '../game/catalog';

interface ItemIconProps {
  itemId: string;
  size?: number;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ itemId, size = 28 }) => {
  const item = ITEMS[itemId];
  if (!item) return null;

  // Use user-supplied textures for swords & boss summoners (Kotulhu & Cat Worm)
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

  if (
    item.textureSrc === '/assets/aistudio/wait_518dc071.jpg' ||
    item.textureSrc === '/assets/aistudio/chine_5a03a968.jpg'
  ) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full overflow-hidden border border-amber-300/80 shadow-sm pointer-events-none select-none shrink-0"
      >
        <img
          src={item.textureSrc}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
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

  // Grappling Hook
  if (item.weaponKind === 'hook') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <line x1="4" y1="20" x2="14" y2="10" stroke="#94a3b8" strokeWidth="2.2" strokeDasharray="2 1.5" />
        <path d="M12 6 L19 5 L18 12 M13 9 L19 5" stroke={item.accent} strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Minishark Gun
  if (item.weaponKind === 'gun') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path d="M3 10 Q11 6 19 10 L21 10 L21 13 L15 13 L12 16 L6 14 L4 18 L3 17 Z" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
        <polygon points="10,8 13,4 14,8" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
        <circle cx="16" cy="10.8" r="1" fill="#f8fafc" />
      </svg>
    );
  }

  // Armor Pieces (Helmet, Chestplate, Greaves)
  if (item.category === 'armor') {
    if (item.armorSlot === 'helmet') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path
            d="M5 13 L6 6 L9 9 L15 9 L18 6 L19 13 L19 19 L14 19 L14 15 L10 15 L10 19 L5 19 Z"
            fill={item.color}
            stroke="#0f172a"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <rect x="8" y="11" width="8" height="2.4" rx="1" fill={item.accent} />
        </svg>
      );
    }
    if (item.armorSlot === 'chestplate') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path
            d="M4 7 L9 5 L12 7 L15 5 L20 7 L21 12 L18 13 L17 20 L7 20 L6 13 L3 12 Z"
            fill={item.color}
            stroke="#0f172a"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M12 8 L15 12 L12 16 L9 12 Z" fill={item.accent} opacity="0.9" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path
          d="M6 4 L18 4 L19 20 L14 20 L12 12 L10 20 L5 20 Z"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <rect x="7" y="5" width="10" height="2.5" fill={item.accent} />
      </svg>
    );
  }

  // Accessories
  if (item.category === 'accessory') {
    if (item.id === 'cloud_in_bottle') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <rect x="8" y="3" width="8" height="3" rx="1" fill="#b45309" stroke="#0f172a" strokeWidth="1" />
          <path d="M8 6 L16 6 L18 11 L18 19 Q18 21 16 21 L8 21 Q6 21 6 19 L6 11 Z" fill="#e0f2fe" stroke="#0f172a" strokeWidth="1.4" />
          <circle cx="10.5" cy="15" r="2.8" fill="#ffffff" />
          <circle cx="13.5" cy="14.5" r="2.6" fill="#ffffff" />
          <circle cx="12" cy="13" r="2.5" fill="#ffffff" />
        </svg>
      );
    }
    if (item.id === 'hermes_boots') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M7 5 L13 5 L13 14 L19 15 L19 19 L7 19 Z" fill={item.color} stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M4 9 L9 7 L8 11 Z" fill={item.accent} stroke="#0f172a" strokeWidth="1" />
        </svg>
      );
    }
    if (item.id === 'cobalt_shield') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M5 4 L19 4 L19 12 Q19 18 12 21 Q5 18 5 12 Z" fill={item.color} stroke="#0f172a" strokeWidth="1.5" />
          <path d="M12 7 L15.5 11 L12 16 L8.5 11 Z" fill={item.accent} />
        </svg>
      );
    }
    if (item.id === 'shiny_red_balloon') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <ellipse cx="12" cy="9.5" rx="6" ry="7" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
          <ellipse cx="10" cy="7" rx="1.6" ry="2.4" fill="#ffffff" opacity="0.7" />
          <path d="M12 16.5 Q10 19 13 21.5" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
        </svg>
      );
    }
    if (item.id === 'shackle') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <circle cx="9" cy="12" r="5" fill="none" stroke={item.color} strokeWidth="3" />
          <circle cx="15" cy="12" r="5" fill="none" stroke={item.accent} strokeWidth="2.5" />
        </svg>
      );
    }
    if (item.id === 'mana_flower') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <circle cx="12" cy="7" r="3.5" fill={item.color} stroke="#0f172a" strokeWidth="1" />
          <circle cx="7.5" cy="11.5" r="3.5" fill={item.color} stroke="#0f172a" strokeWidth="1" />
          <circle cx="16.5" cy="11.5" r="3.5" fill={item.color} stroke="#0f172a" strokeWidth="1" />
          <circle cx="9.5" cy="16" r="3.5" fill={item.color} stroke="#0f172a" strokeWidth="1" />
          <circle cx="14.5" cy="16" r="3.5" fill={item.color} stroke="#0f172a" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.8" fill={item.accent} />
        </svg>
      );
    }
    if (item.id === 'lucky_horseshoe') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M7 5 L7 13 A5 5 0 0 0 17 13 L17 5" fill="none" stroke={item.color} strokeWidth="4" strokeLinecap="round" />
          <path d="M7 5 L7 13 A5 5 0 0 0 17 13 L17 5" fill="none" stroke={item.accent} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    }
    if (item.id === 'angel_wings') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M12 12 Q6 4 2 8 Q4 14 11 16 Z" fill={item.color} stroke="#0f172a" strokeWidth="1.2" />
          <path d="M12 12 Q18 4 22 8 Q20 14 13 16 Z" fill={item.color} stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="12" cy="13" r="2.2" fill={item.accent} />
        </svg>
      );
    }
    if (item.id === 'celestial_emblem') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill={item.color} stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="3" fill={item.accent} />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <circle cx="12" cy="13" r="6.5" fill="none" stroke="#eab308" strokeWidth="3" />
        <circle cx="12" cy="7" r="3" fill={item.color} stroke="#0f172a" strokeWidth="1.2" />
      </svg>
    );
  }

  // Bombs & Dynamite
  if (item.weaponKind === 'bomb') {
    if (item.id === 'dynamite') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <rect x="7" y="7" width="10" height="14" rx="2" fill="#dc2626" stroke="#0f172a" strokeWidth="1.4" />
          <rect x="7" y="10" width="10" height="2" fill="#1e293b" />
          <rect x="7" y="15" width="10" height="2" fill="#1e293b" />
          <path d="M12 7 Q14 3 18 4" stroke="#facc15" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      );
    }
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

  // Table, Chair, Chandelier, Bookshelf, PiggyBank, Rope
  if (item.id === 'table_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="3" y="7" width="18" height="3.5" rx="1" fill={item.color} stroke="#0f172a" strokeWidth="1.2" />
        <rect x="5" y="10.5" width="2.5" height="9.5" fill={item.accent} stroke="#0f172a" strokeWidth="1" />
        <rect x="16.5" y="10.5" width="2.5" height="9.5" fill={item.accent} stroke="#0f172a" strokeWidth="1" />
      </svg>
    );
  }
  if (item.id === 'chair_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="7" y="4" width="2.5" height="16" fill={item.color} stroke="#0f172a" strokeWidth="1" />
        <rect x="7" y="12" width="10" height="3" rx="0.8" fill={item.accent} stroke="#0f172a" strokeWidth="1.1" />
        <rect x="14.5" y="15" width="2.5" height="5" fill={item.color} stroke="#0f172a" strokeWidth="1" />
      </svg>
    );
  }
  if (item.id === 'chandelier_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <line x1="12" y1="3" x2="12" y2="12" stroke="#eab308" strokeWidth="2" />
        <path d="M5 13 Q12 18 19 13" stroke="#eab308" strokeWidth="2.4" fill="none" />
        <circle cx="5.5" cy="10" r="2.2" fill="#fef08a" />
        <circle cx="12" cy="11" r="2.2" fill="#fef08a" />
        <circle cx="18.5" cy="10" r="2.2" fill="#fef08a" />
      </svg>
    );
  }
  if (item.id === 'bookshelf_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="4" y="4" width="16" height="16" rx="1.5" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
        <rect x="6" y="6" width="3" height="5" fill="#ef4444" />
        <rect x="10" y="6" width="3" height="5" fill="#38bdf8" />
        <rect x="14" y="6" width="4" height="5" fill="#facc15" />
        <rect x="6" y="13" width="4" height="5" fill="#22c55e" />
        <rect x="11" y="13" width="3" height="5" fill="#a855f7" />
        <rect x="15" y="13" width="3" height="5" fill="#fb923c" />
      </svg>
    );
  }
  if (item.id === 'piggy_bank_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <ellipse cx="12" cy="13" rx="7" ry="5.5" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
        <circle cx="17.5" cy="13" r="2" fill={item.accent} stroke="#0f172a" strokeWidth="1" />
        <rect x="10.5" y="7" width="3" height="1.5" fill="#0f172a" />
        <rect x="8" y="17.5" width="2" height="3" fill={item.color} />
        <rect x="14" y="17.5" width="2" height="3" fill={item.color} />
      </svg>
    );
  }
  if (item.id === 'rope_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <path d="M12 3 Q15 7 12 11 Q9 15 12 19 L12 21" stroke={item.color} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M12 3 Q15 7 12 11 Q9 15 12 19" stroke={item.accent} strokeWidth="1.4" strokeDasharray="2 2" fill="none" />
      </svg>
    );
  }

  // Treasure Chest
  if (item.id === 'chest_item') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="4" y="7" width="16" height="13" rx="2" fill="#78350f" stroke="#0f172a" strokeWidth="1.4" />
        <rect x="5" y="8" width="14" height="5" fill={item.color} />
        <rect x="4" y="12" width="16" height="2.2" fill={item.accent} />
        <rect x="10.5" y="11" width="3" height="4.5" rx="0.6" fill="#fef08a" stroke="#0f172a" strokeWidth="0.9" />
      </svg>
    );
  }

  // Boss Summoners (SVG icons for all bosses without custom JPGs)
  if (item.category === 'summon') {
    if (item.id === 'summon_king_slime' || item.id === 'summon_queen_slime') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path
            d="M4 17 L6 8 L10 12 L12 6 L14 12 L18 8 L20 17 Z"
            fill={item.accent}
            stroke="#0f172a"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="14" r="2.6" fill={item.color} />
        </svg>
      );
    }
    if (item.id === 'summon_skele_cat' || item.id === 'summon_skeletron_prime') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M5 12 L4 5 L9 8 L15 8 L20 5 L19 12 A7 7 0 0 1 5 12 Z" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
          <circle cx="9.5" cy="12" r="2" fill={item.accent} />
          <circle cx="14.5" cy="12" r="2" fill={item.accent} />
          <rect x="9" y="16" width="6" height="3" fill="#0f172a" />
        </svg>
      );
    }
    if (item.id === 'summon_brain_cthulhu') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <ellipse cx="12" cy="12" rx="8" ry="6.5" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
          <path d="M12 6 L12 18 M7 10 Q12 12 17 10 M8 14 Q12 13 16 14" stroke={item.accent} strokeWidth="1.3" fill="none" />
        </svg>
      );
    }
    if (item.id === 'summon_queen_bee') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <ellipse cx="9" cy="8" rx="3.5" ry="2.2" fill="#e0f2fe" />
          <ellipse cx="15" cy="8" rx="3.5" ry="2.2" fill="#e0f2fe" />
          <ellipse cx="12" cy="14" rx="6" ry="5" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="#0f172a" strokeWidth="2" />
          <line x1="8" y1="16" x2="16" y2="16" stroke="#0f172a" strokeWidth="2" />
        </svg>
      );
    }
    if (item.id === 'summon_deerclops') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M6 4 L8 9 L4 10 M18 4 L16 9 L20 10" stroke="#7dd3fc" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="14" r="6" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
          <circle cx="12" cy="14" r="2.2" fill="#ffffff" />
          <circle cx="12" cy="14" r="1" fill="#0f172a" />
        </svg>
      );
    }
    if (item.id === 'summon_wall_of_flesh') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <circle cx="12" cy="8" r="3.5" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
          <rect x="8.5" y="12" width="7" height="7" rx="1.5" fill={item.color} stroke="#0f172a" strokeWidth="1.3" />
          <circle cx="11" cy="7.5" r="0.9" fill={item.accent} />
          <circle cx="13" cy="7.5" r="0.9" fill={item.accent} />
        </svg>
      );
    }
    if (item.id === 'summon_destroyer' || item.id === 'summon_duke_fishron') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M4 15 Q9 7 15 12 T20 9" stroke={item.color} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="9" r="2.2" fill={item.accent} />
          <circle cx="12" cy="12" r="1.4" fill={item.accent} />
        </svg>
      );
    }
    if (item.id === 'summon_plantera' || item.id === 'summon_empress_light') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <circle cx="12" cy="8" r="4" fill={item.color} />
          <circle cx="8" cy="13" r="4" fill={item.color} />
          <circle cx="16" cy="13" r="4" fill={item.color} />
          <circle cx="12" cy="12" r="3.2" fill={item.accent} stroke="#0f172a" strokeWidth="1" />
        </svg>
      );
    }
    if (item.id === 'summon_golem') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <rect x="5" y="5" width="14" height="14" rx="3" fill={item.color} stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" fill={item.accent} />
        </svg>
      );
    }
    if (item.id === 'summon_cultist' || item.id === 'summon_moon_lord') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <circle cx="12" cy="12" r="8" fill={item.color} stroke={item.accent} strokeWidth="1.8" />
          <polygon points="12,6 16.5,15.5 7.5,15.5" fill="none" stroke={item.accent} strokeWidth="1.4" />
          <circle cx="12" cy="12" r="2" fill="#ffffff" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <circle cx="12" cy="12" r="8" fill="#f8fafc" stroke="#7f1d1d" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" fill={item.color} />
        <circle cx="12" cy="12" r="1.8" fill="#0f172a" />
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
    if (item.id === 'house_blueprint') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <rect x="3" y="4" width="18" height="16" rx="2" fill="#0284c7" stroke="#0f172a" strokeWidth="1.3" />
          <path d="M6 12 L12 7 L18 12 L18 18 L6 18 Z" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="10.5" y="13" width="3" height="5" fill="#fef08a" />
        </svg>
      );
    }
    if (item.id === 'life_crystal') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <path d="M12 20 C6 15 4 11 4 8 A4.2 4.2 0 0 1 12 6.5 A4.2 4.2 0 0 1 20 8 C20 11 18 15 12 20 Z" fill="#ec4899" stroke="#0f172a" strokeWidth="1.3" />
          <circle cx="9" cy="8.5" r="1.4" fill="#fbcfe8" />
        </svg>
      );
    }
    if (item.id === 'mana_crystal') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <polygon points="12,3 14.8,9 21,9.6 16,13.8 17.5,20 12,16.5 6.5,20 8,13.8 3,9.6 9.2,9" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.3" />
          <circle cx="12" cy="11.5" r="2.2" fill="#bae6fd" />
        </svg>
      );
    }
    if (item.id === 'magic_mirror') {
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
          <ellipse cx="12" cy="10" rx="6.5" ry="7.5" fill="#e0f2fe" stroke="#475569" strokeWidth="2.2" />
          <line x1="8.5" y1="8.5" x2="13" y2="5.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="10.5" y="17" width="3" height="4.5" rx="1" fill="#475569" />
        </svg>
      );
    }
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

  // Fallen Star & Bars / Gems / Materials
  if (item.id === 'fallen_star') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <polygon points="12,3 14.8,9 21,9.6 16,13.8 17.5,20 12,16.5 6.5,20 8,13.8 3,9.6 9.2,9" fill="#fde047" stroke="#b45309" strokeWidth="1.3" />
      </svg>
    );
  }
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

  // Crystal Block
  if (item.id === 'crystal_block') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <polygon
          points="12,3 20,9 17,20 7,20 4,9"
          fill={item.color}
          stroke="#0f172a"
          strokeWidth="1.4"
        />
        <polygon points="12,5 16,10 12,17 8,10" fill={item.accent} opacity="0.85" />
      </svg>
    );
  }

  // Wood Beam
  if (item.id === 'wood_beam') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="8" y="3" width="8" height="18" rx="1" fill={item.color} stroke="#0f172a" strokeWidth="1.4" />
        <line x1="11" y1="4" x2="11" y2="20" stroke={item.accent} strokeWidth="1.5" />
      </svg>
    );
  }

  // Brick blocks
  if (
    item.id === 'brick_block' ||
    item.id === 'snow_brick' ||
    item.id === 'crimson_brick' ||
    item.id === 'sandstone_brick'
  ) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none">
        <rect x="4" y="4" width="16" height="16" rx="2" fill={item.color} stroke="#0f172a" strokeWidth="1.5" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={item.accent} strokeWidth="1.4" opacity="0.7" />
        <line x1="12" y1="4" x2="12" y2="12" stroke={item.accent} strokeWidth="1.4" opacity="0.7" />
        <line x1="8" y1="12" x2="8" y2="20" stroke={item.accent} strokeWidth="1.4" opacity="0.7" />
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
