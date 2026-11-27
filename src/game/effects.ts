import { ActiveStatusEffect, Language, StatusEffectId } from './types';

export interface StatusEffectDef {
  id: StatusEffectId;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  isDebuff: boolean;
  color: string;
  badge: string;
}

export const STATUS_EFFECT_DEFS: Record<StatusEffectId, StatusEffectDef> = {
  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    nameRu: 'Регенерация',
    description: 'Restores +6 HP/s continuously.',
    descriptionRu: 'Восстанавливает +6 HP в секунду.',
    isDebuff: false,
    color: '#ec4899',
    badge: '+HP',
  },
  ironskin: {
    id: 'ironskin',
    name: 'Ironskin',
    nameRu: 'Железная кожа',
    description: 'Increases total Defense by +8.',
    descriptionRu: 'Увеличивает общую броню на +8.',
    isDebuff: false,
    color: '#eab308',
    badge: '+8 DEF',
  },
  swiftness: {
    id: 'swiftness',
    name: 'Swiftness',
    nameRu: 'Стремительность',
    description: 'Increases movement speed by +32%.',
    descriptionRu: 'Ускоряет движение на +32%.',
    isDebuff: false,
    color: '#10b981',
    badge: '+SPD',
  },
  mana_power: {
    id: 'mana_power',
    name: 'Magic Power',
    nameRu: 'Магическая сила',
    description: '+25% weapon damage & +3 Mana/s regen.',
    descriptionRu: '+25% к урону и +3 маны в секунду.',
    isDebuff: false,
    color: '#8b5cf6',
    badge: '+MP',
  },
  featherfall: {
    id: 'featherfall',
    name: 'Featherfall',
    nameRu: 'Лёгкость пера',
    description: 'Slows falling speed and prevents fall damage.',
    descriptionRu: 'Плавное падение и защита от урона при падении.',
    isDebuff: false,
    color: '#38bdf8',
    badge: 'FEATHER',
  },
  wrath: {
    id: 'wrath',
    name: 'Wrath',
    nameRu: 'Гнев',
    description: 'Increases all weapon damage by +25%.',
    descriptionRu: 'Увеличивает урон от всего оружия на +25%.',
    isDebuff: false,
    color: '#ef4444',
    badge: '+25% DMG',
  },
  obsidian_skin: {
    id: 'obsidian_skin',
    name: 'Obsidian Skin',
    nameRu: 'Обсидиановая кожа',
    description: '+6 Defense & full immunity to On Fire! burn.',
    descriptionRu: '+6 брони и иммунитет к горению.',
    isDebuff: false,
    color: '#6366f1',
    badge: 'FIRE IMM',
  },
  shine: {
    id: 'shine',
    name: 'Shine',
    nameRu: 'Сияние',
    description: 'Emits bright golden light around your cat in dark caves.',
    descriptionRu: 'Освещает пещеры тёплой золотой аурой вокруг кота.',
    isDebuff: false,
    color: '#fde047',
    badge: 'LIGHT',
  },
  heartreach: {
    id: 'heartreach',
    name: 'Heartreach',
    nameRu: 'Притяжение',
    description: 'Doubles coin and item pickup magnet range.',
    descriptionRu: 'Удваивает радиус притягивания монет и дропа.',
    isDebuff: false,
    color: '#f43f5e',
    badge: 'MAGNET',
  },
  poisoned: {
    id: 'poisoned',
    name: 'Poisoned',
    nameRu: 'Отравление',
    description: 'Loses 4 HP/s and stops natural health regeneration.',
    descriptionRu: 'Теряется 4 HP/сек; очищается Зельем молока.',
    isDebuff: true,
    color: '#22c55e',
    badge: 'POISON',
  },
  on_fire: {
    id: 'on_fire',
    name: 'On Fire!',
    nameRu: 'Горение!',
    description: 'Burns for 6 HP/s! Drink Milk Potion to extinguish.',
    descriptionRu: 'Сжигает 6 HP/сек! Выпей Зелье молока, чтобы снять.',
    isDebuff: true,
    color: '#f97316',
    badge: 'BURN',
  },
  slow: {
    id: 'slow',
    name: 'Slow',
    nameRu: 'Замедление',
    description: 'Movement speed reduced by 38%.',
    descriptionRu: 'Скорость бега снижена на 38%.',
    isDebuff: true,
    color: '#64748b',
    badge: 'SLOW',
  },
  weak: {
    id: 'weak',
    name: 'Weak',
    nameRu: 'Слабость',
    description: '-4 Defense and -20% weapon damage.',
    descriptionRu: '-4 к броне и -20% к урону оружия.',
    isDebuff: true,
    color: '#a855f7',
    badge: 'WEAK',
  },
  broken_armor: {
    id: 'broken_armor',
    name: 'Broken Armor',
    nameRu: 'Сломанная броня',
    description: 'Armor Defense is cut in half!',
    descriptionRu: 'Защита брони снижена вдвое!',
    isDebuff: true,
    color: '#94a3b8',
    badge: '1/2 DEF',
  },
  confusion: {
    id: 'confusion',
    name: 'Confused',
    nameRu: 'Конфузия',
    description: 'Left and right movement controls are reversed!',
    descriptionRu: 'Управление влево и вправо перепутано!',
    isDebuff: true,
    color: '#e879f9',
    badge: 'INVERT',
  },
  darkness: {
    id: 'darkness',
    name: 'Darkness',
    nameRu: 'Тьма',
    description: 'Dims vision around the edges of the screen.',
    descriptionRu: 'Сужает обзор в темноте.',
    isDebuff: true,
    color: '#334155',
    badge: 'DARK',
  },
};

export const GOOD_BUFF_POOL: StatusEffectId[] = [
  'regeneration',
  'ironskin',
  'swiftness',
  'mana_power',
  'featherfall',
  'wrath',
  'obsidian_skin',
  'shine',
  'heartreach',
];

export const BAD_DEBUFF_POOL: StatusEffectId[] = [
  'poisoned',
  'on_fire',
  'slow',
  'weak',
  'broken_armor',
  'confusion',
  'darkness',
];

export function getEffectName(id: StatusEffectId, lang: Language = 'en'): string {
  const def = STATUS_EFFECT_DEFS[id];
  return lang === 'ru' ? def.nameRu : def.name;
}

export function getEffectDescription(id: StatusEffectId, lang: Language = 'en'): string {
  const def = STATUS_EFFECT_DEFS[id];
  return lang === 'ru' ? def.descriptionRu : def.description;
}

export function applyStatusEffect(
  effects: ActiveStatusEffect[],
  id: StatusEffectId,
  duration: number,
  immuneToDebuffs = false,
): boolean {
  const def = STATUS_EFFECT_DEFS[id];
  if (!def) return false;
  if (def.isDebuff && immuneToDebuffs) return false;
  const existing = effects.find((e) => e.id === id);
  if (existing) {
    existing.duration = Math.max(existing.duration, duration);
    existing.maxDuration = Math.max(existing.maxDuration, duration);
  } else {
    effects.push({
      id,
      duration,
      maxDuration: duration,
      isDebuff: def.isDebuff,
    });
  }
  return true;
}

export function clearAllDebuffs(effects: ActiveStatusEffect[]): {
  remaining: ActiveStatusEffect[];
  removedCount: number;
} {
  const remaining = effects.filter((e) => !e.isDebuff);
  return {
    remaining,
    removedCount: effects.length - remaining.length,
  };
}

export function stepActiveEffects(effects: ActiveStatusEffect[], dt: number): ActiveStatusEffect[] {
  const next: ActiveStatusEffect[] = [];
  for (const eff of effects) {
    const rem = eff.duration - dt;
    if (rem > 0) {
      next.push({ ...eff, duration: rem });
    }
  }
  return next;
}

function pickUnique<T>(pool: T[], count: number, randFn: () => number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  while (copy.length > 0 && out.length < count) {
    const idx = Math.floor(randFn() * copy.length) % copy.length;
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export interface RedPotionRollResult {
  outcome: 'good' | 'bad';
  appliedEffects: StatusEffectId[];
  healAmount: number;
}

/**
 * Iconic Terraria Red Potion: strict 50/50 gamble.
 * - 50% Good: grants 4 random positive buffs for 60s + heals +60 HP
 * - 50% Bad: inflicts 4 random negative debuffs for 18s
 */
export function rollRedPotion(
  effects: ActiveStatusEffect[],
  randFn: () => number = Math.random,
): RedPotionRollResult {
  const isGood = randFn() < 0.5;
  if (isGood) {
    const chosen = pickUnique(GOOD_BUFF_POOL, 4, randFn);
    for (const id of chosen) {
      applyStatusEffect(effects, id, 60, false);
    }
    return {
      outcome: 'good',
      appliedEffects: chosen,
      healAmount: 60,
    };
  }
  const chosen = pickUnique(BAD_DEBUFF_POOL, 4, randFn);
  for (const id of chosen) {
    applyStatusEffect(effects, id, 18, false);
  }
  return {
    outcome: 'bad',
    appliedEffects: chosen,
    healAmount: 0,
  };
}

export interface EffectModifiers {
  defenseBonus: number;
  defenseMult: number;
  speedMult: number;
  damageMult: number;
  hpRegenPerSec: number;
  hpDotPerSec: number;
  manaRegenBonus: number;
  gravityMult: number;
  noFallDamage: boolean;
  invertHorizontal: boolean;
  hasShine: boolean;
  magnetMult: number;
  hasDarkness: boolean;
  fireImmune: boolean;
}

export function computeEffectModifiers(effects: ActiveStatusEffect[]): EffectModifiers {
  const has = (id: StatusEffectId) => effects.some((e) => e.id === id);

  const fireImmune = has('obsidian_skin');
  let defenseBonus = 0;
  let defenseMult = 1;
  let speedMult = 1;
  let damageMult = 1;
  let hpRegenPerSec = 0;
  let hpDotPerSec = 0;
  let manaRegenBonus = 0;
  let gravityMult = 1;
  let noFallDamage = false;

  if (has('regeneration')) hpRegenPerSec += 6;
  if (has('ironskin')) defenseBonus += 8;
  if (has('obsidian_skin')) defenseBonus += 6;
  if (has('swiftness')) speedMult *= 1.32;
  if (has('mana_power')) {
    damageMult += 0.25;
    manaRegenBonus += 3;
  }
  if (has('wrath')) damageMult += 0.25;
  if (has('featherfall')) {
    gravityMult = 0.52;
    noFallDamage = true;
  }

  // Debuffs
  if (has('poisoned')) {
    hpDotPerSec += 4;
    hpRegenPerSec = 0;
  }
  if (has('on_fire') && !fireImmune) {
    hpDotPerSec += 6;
  }
  if (has('slow')) speedMult *= 0.62;
  if (has('weak')) {
    defenseBonus -= 4;
    damageMult = Math.max(0.4, damageMult - 0.2);
  }
  if (has('broken_armor')) defenseMult = 0.5;

  return {
    defenseBonus,
    defenseMult,
    speedMult,
    damageMult,
    hpRegenPerSec,
    hpDotPerSec,
    manaRegenBonus,
    gravityMult,
    noFallDamage,
    invertHorizontal: has('confusion'),
    hasShine: has('shine'),
    magnetMult: has('heartreach') ? 2.1 : 1,
    hasDarkness: has('darkness'),
    fireImmune,
  };
}
