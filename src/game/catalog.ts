import {
  ArmorSetId,
  CraftingRecipe,
  CraftingStation,
  DebugChestPreset,
  EquipmentBonuses,
  EquipmentState,
  EquipSlotKey,
  InventorySlot,
  ItemDef,
  Language,
  TileType,
  WallType,
} from './types';

export const ITEMS: Record<string, ItemDef> = {
  // === TOOLS (8 pickaxes) ===
  wood_pickaxe: {
    id: 'wood_pickaxe',
    name: 'Wooden Pickaxe',
    nameRu: 'Деревянная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 1. Mines dirt, sand, snow, wood, and soft stone.',
    descriptionRu: 'Мощность 1. Добывает землю, песок, снег, дерево и мягкий камень.',
    pickPower: 1,
    damage: 6,
    knockback: 3,
    cooldown: 0.24,
    reach: 54,
    color: '#a97449',
    accent: '#d8b48a',
  },
  copper_pickaxe: {
    id: 'copper_pickaxe',
    name: 'Copper Pickaxe',
    nameRu: 'Медная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 1 (Fast). Ideal for early caves, sand, and copper.',
    descriptionRu: 'Мощность 1 (быстрая). Удобна для ранних пещер, песка и меди.',
    pickPower: 1,
    damage: 8,
    knockback: 3.5,
    cooldown: 0.19,
    reach: 58,
    color: '#d97706',
    accent: '#fdba74',
  },
  iron_pickaxe: {
    id: 'iron_pickaxe',
    name: 'Iron Pickaxe',
    nameRu: 'Железная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 2. Breaks hard stone, crimstone, and gold ore.',
    descriptionRu: 'Мощность 2. Ломает камень, багролит и золотую руду.',
    pickPower: 2,
    damage: 10,
    knockback: 4,
    cooldown: 0.17,
    reach: 60,
    color: '#94a3b8',
    accent: '#e2e8f0',
  },
  ice_pickaxe: {
    id: 'ice_pickaxe',
    name: 'Frost Pickaxe',
    nameRu: 'Ледяная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 2 (High Speed). Forged in the Snow Tundra for rapid mining.',
    descriptionRu: 'Мощность 2 (быстрая). Выкована в Снежном биоме для скоростной копки.',
    pickPower: 2,
    damage: 13,
    knockback: 4.5,
    cooldown: 0.14,
    reach: 64,
    color: '#0ea5e9',
    accent: '#bae6fd',
  },
  gold_pickaxe: {
    id: 'gold_pickaxe',
    name: 'Golden Claw Pickaxe',
    nameRu: 'Золотая кирка-коготь',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 3. Mines rubies, marble, sandstone bricks, and obsidian.',
    descriptionRu: 'Мощность 3. Копает рубины, мрамор, песчаный кирпич и обсидиан.',
    pickPower: 3,
    damage: 15,
    knockback: 5,
    cooldown: 0.12,
    reach: 66,
    color: '#eab308',
    accent: '#fef08a',
  },
  crimson_pickaxe: {
    id: 'crimson_pickaxe',
    name: 'Deathbringer Pickaxe',
    nameRu: 'Багряная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 4. Long-reach Crimson pickaxe that shatters obsidian.',
    descriptionRu: 'Мощность 4. Мощная кирка Багряного биома, крошит обсидиан.',
    pickPower: 4,
    damage: 18,
    knockback: 5.5,
    cooldown: 0.10,
    reach: 72,
    color: '#dc2626',
    accent: '#fca5a5',
  },
  obsidian_pickaxe: {
    id: 'obsidian_pickaxe',
    name: 'Obsidian Pickaxe',
    nameRu: 'Обсидиановая кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 5. Ultra-fast master mining tool with extended reach.',
    descriptionRu: 'Мощность 5. Легендарная сверхбыстрая кирка мастера.',
    pickPower: 5,
    damage: 22,
    knockback: 6,
    cooldown: 0.08,
    reach: 78,
    color: '#6d28d9',
    accent: '#ddd6fe',
  },
  lunar_pickaxe: {
    id: 'lunar_pickaxe',
    name: 'Luminite Celestial Pickaxe',
    nameRu: 'Небесная Люминитовая кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Pickaxe Power 6. Forged from Celestial Pillar fragments for instant excavation.',
    descriptionRu: 'Мощность 6. Создана из осколков Небесных башен для мгновенной копки.',
    pickPower: 6,
    damage: 32,
    knockback: 7,
    cooldown: 0.06,
    reach: 96,
    color: '#14b8a6',
    accent: '#99f6e4',
  },

  // === WEAPONS ===
  zazu_sword: {
    id: 'zazu_sword',
    name: "Zazu's Emerald Blade",
    nameRu: 'Изумрудный клинок Зазу',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Starter Melee Sword (18 DMG). Reliable emerald-hilted cat blade.',
    descriptionRu: 'Стартовый меч (18 урона). Легендарный клинок котика с изумрудной гардой.',
    damage: 18,
    knockback: 6,
    cooldown: 0.3,
    reach: 74,
    textureSrc: '/assets/aistudio/sword_03ad3b16.png',
    color: '#64748b',
    accent: '#10b981',
  },
  wood_sword: {
    id: 'wood_sword',
    name: 'Oak Clawblade',
    nameRu: 'Когтерез из дуба',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Sword (12 DMG). Basic wooden sword for early forest slimes.',
    descriptionRu: 'Меч (12 урона). Простой деревянный клинок для первых схваток.',
    damage: 12,
    knockback: 4.5,
    cooldown: 0.28,
    reach: 58,
    color: '#9a6b42',
    accent: '#d6a87c',
  },
  copper_sword: {
    id: 'copper_sword',
    name: 'Copper Shortsword',
    nameRu: 'Медный клинок',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Sword (16 DMG). Quick, lightweight copper blade.',
    descriptionRu: 'Меч (16 урона). Лёгкий и быстрый клинок из медных слитков.',
    damage: 16,
    knockback: 5,
    cooldown: 0.25,
    reach: 64,
    color: '#d97706',
    accent: '#fed7aa',
  },
  ice_blade: {
    id: 'ice_blade',
    name: 'Frostbrand Blade',
    nameRu: 'Морозный клинок',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Sword (23 DMG). Crisp Snow Tundra blade with wide reach.',
    descriptionRu: 'Меч (23 урона). Острый ледяной меч из Снежного биома.',
    damage: 23,
    knockback: 6,
    cooldown: 0.26,
    reach: 72,
    color: '#38bdf8',
    accent: '#e0f2fe',
  },
  iron_broadsword: {
    id: 'iron_broadsword',
    name: 'Iron Broadsword',
    nameRu: 'Железный тесак',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Sword (24 DMG). Heavy broad blade with strong knockback.',
    descriptionRu: 'Меч (24 урона). Тяжёлый широкий клинок с мощным отбросом.',
    damage: 24,
    knockback: 7.5,
    cooldown: 0.34,
    reach: 70,
    color: '#cbd5e1',
    accent: '#38bdf8',
  },
  crimson_katana: {
    id: 'crimson_katana',
    name: 'Blood Butcherer Katana',
    nameRu: 'Багряная катана',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Sword (32 DMG). Rapid slashing Crimson katana.',
    descriptionRu: 'Меч (32 урона). Молниеносная багряная катана Красного биома.',
    damage: 32,
    knockback: 6.5,
    cooldown: 0.21,
    reach: 78,
    color: '#dc2626',
    accent: '#fecaca',
  },
  gold_claymore: {
    id: 'gold_claymore',
    name: 'Golden Claymore',
    nameRu: 'Золотой клеймор',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Greatsword (34 DMG). Massive reach and heavy knockback.',
    descriptionRu: 'Двуручник (34 урона). Большой размах и сильный отброс.',
    damage: 34,
    knockback: 8.5,
    cooldown: 0.32,
    reach: 82,
    color: '#eab308',
    accent: '#fef9c3',
  },
  ruby_greatsword: {
    id: 'ruby_greatsword',
    name: 'Ruby Royal Greatsword',
    nameRu: 'Рубиновый королевский меч',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee Greatsword (38 DMG). Sweeping crimson-ruby hero blade.',
    descriptionRu: 'Двуручник (38 урона). Размашистый рубиновый клинок героя.',
    damage: 38,
    knockback: 9,
    cooldown: 0.36,
    reach: 84,
    textureSrc: '/assets/aistudio/sword_03ad3b16.png',
    color: '#e11d48',
    accent: '#fda4af',
  },
  obsidian_nightblade: {
    id: 'obsidian_nightblade',
    name: "Night's Meow Edge",
    nameRu: 'Клинок Ночного Мяу',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: "Melee Greatsword (48 DMG). Terraria-tier obsidian & crystal blade.",
    descriptionRu: 'Меч (48 урона). Мощнейший обсидианово-кристальный клинок.',
    damage: 48,
    knockback: 9.5,
    cooldown: 0.24,
    reach: 90,
    color: '#7c3aed',
    accent: '#f5d0fe',
  },
  dawnbreaker_sword: {
    id: 'dawnbreaker_sword',
    name: 'Solar Zazu Dawnblade',
    nameRu: 'Клинок Заката Зазу',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Melee + Beam (66 DMG). Fires blazing sunbeams & cuts down bosses.',
    descriptionRu: 'Меч + луч (66 урона). Выпускает ослепительный солнечный луч!',
    damage: 66,
    knockback: 8.5,
    cooldown: 0.20,
    reach: 94,
    color: '#f59e0b',
    accent: '#fef08a',
  },
  meowmere_blade: {
    id: 'meowmere_blade',
    name: 'Meowmere Rainbow Blade',
    nameRu: 'Мяумур (Радужный клинок)',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Endgame Sword (95 DMG). Unleashes bouncing rainbow cat beams!',
    descriptionRu: 'Финальный меч (95 урона). Стреляет рикошетящими радужными кото-лучами!',
    damage: 95,
    knockback: 10,
    cooldown: 0.16,
    reach: 104,
    color: '#ec4899',
    accent: '#5eead4',
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith',
    nameRu: 'Зенит (Zenith)',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Ultimate Terraria Blade (190 DMG). Launches sweeping multi-colored spectral swords through walls!',
    descriptionRu: 'Легендарный финальный меч (190 урона). Запускает рой радужных клинков сквозь стены к курсору!',
    damage: 190,
    knockback: 9,
    cooldown: 0.14,
    reach: 120,
    color: '#22d3ee',
    accent: '#f472b6',
  },
  star_wrath: {
    id: 'star_wrath',
    name: 'Star Wrath',
    nameRu: 'Звёздный гнев',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Lunar Sword (118 DMG). Rains 3 blazing pink meteors from the sky toward your cursor!',
    descriptionRu: 'Лунный меч (118 урона). Обрушивает с неба 3 розовых метеора в точку курсора!',
    damage: 118,
    knockback: 8,
    cooldown: 0.22,
    reach: 108,
    color: '#ec4899',
    accent: '#fde047',
  },
  enchanted_sword: {
    id: 'enchanted_sword',
    name: 'Enchanted Sword',
    nameRu: 'Зачарованный меч',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Treasure Sword (34 DMG). Fires a bright cyan sword beam on swing!',
    descriptionRu: 'Меч из пещер (34 урона). При взмахе выпускает голубой клинок-луч!',
    damage: 34,
    knockback: 5,
    cooldown: 0.24,
    reach: 82,
    color: '#3b82f6',
    accent: '#fef08a',
  },
  vampire_knives: {
    id: 'vampire_knives',
    name: 'Vampire Knives',
    nameRu: 'Вампирские ножи',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Crimson Relic (38 DMG). Throws 4 crimson knives that heal you on hit!',
    descriptionRu: 'Реликвия Багрянца (38 урона). Бросает веер из 4 ножей, лечащих кота при попадании!',
    damage: 38,
    knockback: 3,
    cooldown: 0.20,
    projectileSpeed: 740,
    manaCost: 0,
    pierce: 2,
    color: '#dc2626',
    accent: '#fca5a5',
  },
  demon_scythe: {
    id: 'demon_scythe',
    name: 'Demon Scythe',
    nameRu: 'Демоническая коса',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Underworld Tome (42 DMG). Casts spinning purple scythes that accelerate mid-air!',
    descriptionRu: 'Книга Преисподней (42 урона). Выпускает фиолетовые косы, разгоняющиеся в полёте!',
    damage: 42,
    knockback: 4.5,
    cooldown: 0.28,
    projectileSpeed: 110,
    manaCost: 12,
    pierce: 5,
    color: '#7e22ce',
    accent: '#e879f9',
  },
  megashark: {
    id: 'megashark',
    name: 'Megashark',
    nameRu: 'Мега-акула',
    category: 'weapon',
    weaponKind: 'gun',
    maxStack: 1,
    description: 'Hardmode Machine Gun (28 DMG). Extreme rapid fire with high bullet velocity!',
    descriptionRu: 'Хардмод-пулемёт (28 урона). Безумная скорострельность и мощная отдача!',
    damage: 28,
    knockback: 2.5,
    cooldown: 0.085,
    projectileSpeed: 980,
    color: '#334155',
    accent: '#38bdf8',
  },
  sdmg: {
    id: 'sdmg',
    name: 'S.D.M.G.',
    nameRu: 'К.П.М. (Космический дельфин)',
    category: 'weapon',
    weaponKind: 'gun',
    maxStack: 1,
    description: 'Moon Lord Drop (78 DMG). Space Dolphin Machine Gun with hyper-speed piercing rounds!',
    descriptionRu: 'Пушка Лунного Лорда (78 урона). Сверхбыстрый космический пулемёт с пробитием!',
    damage: 78,
    knockback: 3.5,
    cooldown: 0.065,
    projectileSpeed: 1140,
    pierce: 2,
    color: '#0ea5e9',
    accent: '#5eead4',
  },
  fish_spear: {
    id: 'fish_spear',
    name: 'Harpoon Fish Spear',
    nameRu: 'Копьё-гарпун',
    category: 'weapon',
    weaponKind: 'spear',
    maxStack: 1,
    description: 'Spear (21 DMG). Long forward thrust keeps monsters at bay.',
    descriptionRu: 'Копьё (21 урон). Длинный выпад, достаёт врагов на дистанции.',
    damage: 21,
    knockback: 5,
    cooldown: 0.28,
    reach: 96,
    color: '#0284c7',
    accent: '#bae6fd',
  },
  wood_bow: {
    id: 'wood_bow',
    name: 'Hunter Bow',
    nameRu: 'Охотничий лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Ranged Bow (16 DMG). Fires arrows toward the mouse cursor.',
    descriptionRu: 'Лук (16 урона). Стреляет быстрыми стрелами по курсу прицела.',
    damage: 16,
    knockback: 3.5,
    cooldown: 0.35,
    projectileSpeed: 640,
    pierce: 1,
    color: '#855836',
    accent: '#fde68a',
  },
  copper_bow: {
    id: 'copper_bow',
    name: 'Copper Bow',
    nameRu: 'Медный лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Ranged Bow (20 DMG). Sturdy bow with faster arrow velocity.',
    descriptionRu: 'Лук (20 урона). Крепкий скорострельный лук с медными стрелами.',
    damage: 20,
    knockback: 4,
    cooldown: 0.30,
    projectileSpeed: 700,
    pierce: 1,
    color: '#d97706',
    accent: '#fed7aa',
  },
  ice_bow: {
    id: 'ice_bow',
    name: 'Frostwind Bow',
    nameRu: 'Ледяной лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Ranged Bow (25 DMG). Shoots frost arrows that pierce 2 enemies.',
    descriptionRu: 'Лук (25 урона). Морозные стрелы пробивают 2 врагов подряд.',
    damage: 25,
    knockback: 4.5,
    cooldown: 0.27,
    projectileSpeed: 780,
    pierce: 2,
    color: '#0ea5e9',
    accent: '#bae6fd',
  },
  gold_bow: {
    id: 'gold_bow',
    name: 'Golden Crossbow',
    nameRu: 'Золотой арбалет',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Ranged Bow (27 DMG). High-speed bolts pierce up to 2 targets.',
    descriptionRu: 'Арбалет (27 урона). Скоростные болты пробивают до 2 целей.',
    damage: 27,
    knockback: 4.5,
    cooldown: 0.24,
    projectileSpeed: 820,
    pierce: 2,
    color: '#f59e0b',
    accent: '#fef3c7',
  },
  crimson_bow: {
    id: 'crimson_bow',
    name: 'Tendon Crimson Bow',
    nameRu: 'Багряный лук Кровозуба',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Ranged Bow (35 DMG). Heavy Crimson bow piercing 3 targets.',
    descriptionRu: 'Лук (35 урона). Тяжёлый лук Красного биома, пробивает 3 цели.',
    damage: 35,
    knockback: 5.5,
    cooldown: 0.22,
    projectileSpeed: 900,
    pierce: 3,
    color: '#dc2626',
    accent: '#fda4af',
  },
  crystal_bow: {
    id: 'crystal_bow',
    name: 'Crystal Starbow',
    nameRu: 'Кристальный звёздный лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Ranged Bow (42 DMG). Hyper-velocity crystal arrows (pierces 4).',
    descriptionRu: 'Лук (42 урона). Сверхбыстрые кристальные стрелы (пробитие 4).',
    damage: 42,
    knockback: 6,
    cooldown: 0.18,
    projectileSpeed: 980,
    pierce: 4,
    color: '#c026d3',
    accent: '#f5d0fe',
  },
  fish_boomerang: {
    id: 'fish_boomerang',
    name: 'Fish Boomerang',
    nameRu: 'Рыбный бумеранг',
    category: 'weapon',
    weaponKind: 'boomerang',
    maxStack: 1,
    description: 'Boomerang (22 DMG). Flies out and returns to your paws, hitting twice.',
    descriptionRu: 'Бумеранг (22 урона). Возвращается в лапы и бьёт врагов дважды.',
    damage: 22,
    knockback: 5,
    cooldown: 0.42,
    projectileSpeed: 540,
    pierce: 4,
    color: '#38bdf8',
    accent: '#f97316',
  },
  fire_staff: {
    id: 'fire_staff',
    name: 'Solar Meow Staff',
    nameRu: 'Посох солнечного мяу',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Magic (30 DMG, 8 Mana). Launches an exploding fireball.',
    descriptionRu: 'Магия (30 урона, 8 маны). Запускает взрывной огненный шар.',
    damage: 30,
    knockback: 5.5,
    cooldown: 0.38,
    projectileSpeed: 520,
    manaCost: 8,
    aoeRadius: 48,
    color: '#ea580c',
    accent: '#fde047',
  },
  frost_wand: {
    id: 'frost_wand',
    name: 'Frost Wand',
    nameRu: 'Ледяная палочка',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Magic (25 DMG, 6 Mana). Fires a piercing frost star (3 targets).',
    descriptionRu: 'Магия (25 урона, 6 маны). Бьёт пробивной ледяной звездой.',
    damage: 25,
    knockback: 4,
    cooldown: 0.26,
    projectileSpeed: 600,
    manaCost: 6,
    pierce: 3,
    color: '#06b6d4',
    accent: '#ecfeff',
  },
  laser_pointer: {
    id: 'laser_pointer',
    name: 'Cat Laser Pointer',
    nameRu: 'Кошачья лазер-указка',
    category: 'weapon',
    weaponKind: 'laser',
    maxStack: 1,
    description: 'Magic Laser (17 DMG, 3 Mana). Ultra-rapid piercing red beam.',
    descriptionRu: 'Лазер (17 урона, 3 маны). Невероятно быстрый луч света!',
    damage: 17,
    knockback: 2,
    cooldown: 0.13,
    projectileSpeed: 1050,
    manaCost: 3,
    pierce: 2,
    color: '#ef4444',
    accent: '#fecaca',
  },
  pharaoh_staff: {
    id: 'pharaoh_staff',
    name: 'Ankh Sun Staff',
    nameRu: 'Посох Фараона Насерафала',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Magic (44 DMG, 7 Mana). Fires piercing desert sun-bolts (4 targets).',
    descriptionRu: 'Магия (44 урона, 7 маны). Пускает солнечные лучи пирамиды (пробитие 4).',
    damage: 44,
    knockback: 5,
    cooldown: 0.22,
    projectileSpeed: 760,
    manaCost: 7,
    pierce: 4,
    color: '#f59e0b',
    accent: '#fef08a',
  },
  jester_cards: {
    id: 'jester_cards',
    name: "Jester's Trick Cards",
    nameRu: 'Карты Кота-Шута',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Magic (38 DMG, 4 Mana). Rapid razor playing cards that pierce 3 foes.',
    descriptionRu: 'Магия (38 урона, 4 маны). Быстрые карты шута, пробивают 3 врагов.',
    damage: 38,
    knockback: 4.5,
    cooldown: 0.17,
    projectileSpeed: 820,
    manaCost: 4,
    pierce: 3,
    color: '#dc2626',
    accent: '#3b82f6',
  },
  lollipop_wand: {
    id: 'lollipop_wand',
    name: 'Rainbow Lollipop Scepter',
    nameRu: 'Леденцовый Жезл Пропеллера',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Magic (46 DMG, 6 Mana). Fires swirling rainbow candy stars!',
    descriptionRu: 'Магия (46 урона, 6 маны). Стреляет радужными звёздами-леденцами!',
    damage: 46,
    knockback: 5.5,
    cooldown: 0.19,
    projectileSpeed: 720,
    manaCost: 6,
    pierce: 4,
    aoeRadius: 40,
    color: '#ec4899',
    accent: '#fde047',
  },
  alien_blaster: {
    id: 'alien_blaster',
    name: 'Martian Alien Blaster',
    nameRu: 'Бластер Инопланетного Кота',
    category: 'weapon',
    weaponKind: 'laser',
    maxStack: 1,
    description: 'Alien Laser (52 DMG, 4 Mana). Rapid green plasma bolts from Mars.',
    descriptionRu: 'Лазер (52 урона, 4 маны). Скорострельная зелёная плазма пришельцев.',
    damage: 52,
    knockback: 4,
    cooldown: 0.11,
    projectileSpeed: 1120,
    manaCost: 4,
    pierce: 3,
    color: '#22c55e',
    accent: '#bbf7d0',
  },
  melon_blaster: {
    id: 'melon_blaster',
    name: 'Watermelon Seed Gatling',
    nameRu: 'Арбузный Пулемёт',
    category: 'weapon',
    weaponKind: 'gun',
    maxStack: 1,
    description: 'Rapid Gun (36 DMG). High-speed outlaw gatling shooting melon seeds!',
    descriptionRu: 'Пушка (36 урона). Бешеный арбузный пулемёт разыскиваемого кота!',
    damage: 36,
    knockback: 3.5,
    cooldown: 0.09,
    projectileSpeed: 980,
    pierce: 2,
    color: '#16a34a',
    accent: '#ef4444',
  },
  atomic_launcher: {
    id: 'atomic_launcher',
    name: 'Atomic Bomb Launcher',
    nameRu: 'Атомная Бомбо-Пушка',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 1,
    description: 'Infinite Heavy Explosive (140 DMG). Fires mini yellow atomic bombs (no self-ammo cost)!',
    descriptionRu: 'Бесконечная взрывчатка (140 урона). Запускает мини-атомные бомбы!',
    damage: 140,
    knockback: 14,
    cooldown: 0.45,
    projectileSpeed: 540,
    aoeRadius: 150,
    color: '#facc15',
    accent: '#0f172a',
  },
  yarn_bomb: {
    id: 'yarn_bomb',
    name: 'Explosive Yarn Ball',
    nameRu: 'Взрывной клубок',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 99,
    description: 'Throwable Bomb (42 DMG). Explodes on impact to blast groups of enemies.',
    descriptionRu: 'Бомба (42 урона). Бросковый клубок, взрывается по площади!',
    damage: 42,
    knockback: 9,
    cooldown: 0.55,
    projectileSpeed: 440,
    aoeRadius: 82,
    color: '#ec4899',
    accent: '#fbcfe8',
  },

  // === BUILDING BLOCKS & FURNITURE ===
  dirt_block: {
    id: 'dirt_block',
    name: 'Dirt Block',
    nameRu: 'Земля',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Common fertile soil for landscaping.',
    descriptionRu: 'Блок. Обычная плодородная земля.',
    placesTile: TileType.Dirt,
    color: '#7c5032',
    accent: '#5c3a23',
  },
  grass_block: {
    id: 'grass_block',
    name: 'Grass Block',
    nameRu: 'Дёрн с травой',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Lush green turf for lawns and roofs.',
    descriptionRu: 'Блок. Сочная зелёная трава для двора.',
    placesTile: TileType.Grass,
    color: '#3f9b2c',
    accent: '#7c5032',
  },
  stone_block: {
    id: 'stone_block',
    name: 'Stone Block',
    nameRu: 'Камень',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Solid stone for castles, furnaces, and bricks.',
    descriptionRu: 'Блок. Прочный булыжник для стен, печей и башен.',
    placesTile: TileType.Stone,
    color: '#6b7280',
    accent: '#9ca3af',
  },
  wood_log: {
    id: 'wood_log',
    name: 'Wood',
    nameRu: 'Бревно',
    category: 'block',
    maxStack: 999,
    description: 'Material & Block. Harvested from forest trees; crafts into planks & tools.',
    descriptionRu: 'Бревно. Добывается из деревьев; основа для досок и верстака.',
    placesTile: TileType.Wood,
    color: '#784826',
    accent: '#a4693f',
  },
  planks_block: {
    id: 'planks_block',
    name: 'Wood Planks',
    nameRu: 'Доски',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Warm timber planks for floors and villager houses.',
    descriptionRu: 'Блок. Тёплые доски для пола и стен уютного домика.',
    placesTile: TileType.Planks,
    color: '#b77d48',
    accent: '#dfb07d',
  },
  brick_block: {
    id: 'brick_block',
    name: 'Red Brick',
    nameRu: 'Кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Sturdy red masonry for cat fortresses.',
    descriptionRu: 'Блок. Надёжная кирпичная кладка для замка кота.',
    placesTile: TileType.Brick,
    color: '#b45343',
    accent: '#e29587',
  },
  roof_tile: {
    id: 'roof_tile',
    name: 'Roof Shingle',
    nameRu: 'Черепица',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Bright terracotta shingles for cozy roofs.',
    descriptionRu: 'Блок. Яркая черепица для красивой крыши дома.',
    placesTile: TileType.RoofTile,
    color: '#c2410c',
    accent: '#fb923c',
  },
  glass_block: {
    id: 'glass_block',
    name: 'Glass Window',
    nameRu: 'Стекло',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Lets natural sunlight shine into houses.',
    descriptionRu: 'Блок. Прозрачное окно в дом, пропускает свет.',
    placesTile: TileType.Glass,
    color: '#7dd3fc',
    accent: '#e0f2fe',
  },
  platform_block: {
    id: 'platform_block',
    name: 'Wood Platform',
    nameRu: 'Деревянная платформа',
    category: 'block',
    maxStack: 999,
    description: 'Pass-Through Block. Jump up through it, or hold S to drop down.',
    descriptionRu: 'Платформа. Можно запрыгивать снизу и спускаться на S.',
    placesTile: TileType.Platform,
    color: '#c08552',
    accent: '#f3d5b5',
  },
  torch_item: {
    id: 'torch_item',
    name: 'Torch',
    nameRu: 'Факел',
    category: 'block',
    maxStack: 999,
    description: 'Light Source. Brightens caves and counts as house lighting for NPCs.',
    descriptionRu: 'Свет. Освещает пещеры и засчитывается как свет в доме жителя.',
    placesTile: TileType.Torch,
    color: '#f59e0b',
    accent: '#fef08a',
  },
  door_item: {
    id: 'door_item',
    name: 'Wooden Door',
    nameRu: 'Деревянная дверь',
    category: 'block',
    maxStack: 99,
    description: 'House Door. Auto-opens as you walk near or toggle with RMB / F.',
    descriptionRu: 'Дверь. Автоматически открывается при подходе или кнопкой ПКМ / F.',
    placesTile: TileType.DoorClosed,
    color: '#925e34',
    accent: '#eab308',
  },
  bed_item: {
    id: 'bed_item',
    name: 'Cat Bed',
    nameRu: 'Кошачья лежанка',
    category: 'block',
    maxStack: 10,
    description: 'Furniture. Sets your respawn point when placed inside a valid room.',
    descriptionRu: 'Мебель. Устанавливает точку возрождения в доме.',
    placesTile: TileType.Bed,
    color: '#e11d48',
    accent: '#fecdd3',
  },
  stool_item: {
    id: 'stool_item',
    name: 'Starter Stool',
    nameRu: 'Табуретка',
    category: 'block',
    maxStack: 10,
    description: 'A friendly wooden stool. Pet with LMB/F, then press RMB for a secret!',
    descriptionRu: 'Живая деревянная табуретка. Погладь (ЛКМ/F) и нажми ПКМ!',
    placesTile: TileType.Stool,
    color: '#a16207',
    accent: '#fde68a',
  },
  chest_item: {
    id: 'chest_item',
    name: 'Treasure Chest',
    nameRu: 'Сундук сокровищ',
    category: 'block',
    maxStack: 20,
    description: 'Storage Block. Place down and press RMB / F to open and store loot.',
    descriptionRu: 'Хранилище. Поставь и нажми ПКМ / F для доступа к луту.',
    placesTile: TileType.Chest,
    color: '#b45309',
    accent: '#facc15',
  },
  wood_wall: {
    id: 'wood_wall',
    name: 'Wood Background Wall',
    nameRu: 'Задняя стена (доски)',
    category: 'wall',
    maxStack: 999,
    description: 'Background Wall. Required behind rooms so villagers can move in.',
    descriptionRu: 'Фоновая стена. Нужна за комнатой для заселения жителей.',
    placesWall: WallType.WoodWall,
    color: '#6b472b',
    accent: '#8c5e3a',
  },
  stone_wall: {
    id: 'stone_wall',
    name: 'Stone Background Wall',
    nameRu: 'Задняя стена (камень)',
    category: 'wall',
    maxStack: 999,
    description: 'Background Wall. Sturdy stone backdrop for castles and basements.',
    descriptionRu: 'Фоновая стена. Каменный фон для крепости или подвала.',
    placesWall: WallType.StoneWall,
    color: '#4b5563',
    accent: '#6b7280',
  },
  sandstone_wall: {
    id: 'sandstone_wall',
    name: 'Sandstone Pyramid Wall',
    nameRu: 'Стена Пирамиды (песчаник)',
    category: 'wall',
    maxStack: 999,
    description: 'Background Wall. Ancient golden sandstone wall from the Desert Pyramid.',
    descriptionRu: 'Фоновая стена. Древняя золотистая стена из Пирамиды в Пустыне.',
    placesWall: WallType.SandstoneWall,
    color: '#a16207',
    accent: '#fde047',
  },
  snow_block: {
    id: 'snow_block',
    name: 'Snow Block',
    nameRu: 'Снег',
    category: 'block',
    maxStack: 999,
    description: 'Biome Block. Fluffy frost block found in the western Snow Tundra.',
    descriptionRu: 'Блок. Пушистый снег из западного Снежного биома.',
    placesTile: TileType.Snow,
    color: '#e0f2fe',
    accent: '#ffffff',
  },
  ice_block: {
    id: 'ice_block',
    name: 'Ice Block',
    nameRu: 'Лёд',
    category: 'block',
    maxStack: 999,
    description: 'Biome Block. Crystalline ice used for Frost Pickaxe, Ice Blade & Ice Bow.',
    descriptionRu: 'Блок. Прочный лёд для ледяного оружия и снежного кирпича.',
    placesTile: TileType.Ice,
    color: '#38bdf8',
    accent: '#bae6fd',
  },
  snow_brick: {
    id: 'snow_brick',
    name: 'Snow Brick',
    nameRu: 'Снежный кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Crisp white ice-brick for winter castles.',
    descriptionRu: 'Блок. Аккуратный белый кирпич для ледяных замков.',
    placesTile: TileType.SnowBrick,
    color: '#bae6fd',
    accent: '#f0f9ff',
  },
  crimson_grass: {
    id: 'crimson_grass',
    name: 'Crimson Turf',
    nameRu: 'Багряный дёрн',
    category: 'block',
    maxStack: 999,
    description: 'Biome Block. Vivid red grass from the eastern Crimson biome.',
    descriptionRu: 'Блок. Ярко-красная трава Красного биома.',
    placesTile: TileType.CrimsonGrass,
    color: '#dc2626',
    accent: '#f87171',
  },
  crimson_dirt: {
    id: 'crimson_dirt',
    name: 'Crimson Dirt',
    nameRu: 'Багряная земля',
    category: 'block',
    maxStack: 999,
    description: 'Biome Block. Deep crimson soil found in the Crimson biome.',
    descriptionRu: 'Блок. Тёмно-красная почва Красного биома.',
    placesTile: TileType.CrimsonDirt,
    color: '#7f1d1d',
    accent: '#b91c1c',
  },
  crimstone_block: {
    id: 'crimstone_block',
    name: 'Crimstone',
    nameRu: 'Кровавый камень',
    category: 'block',
    maxStack: 999,
    description: 'Ore/Rock. Hard crimson rock used to forge Crimson Armor & Weapons.',
    descriptionRu: 'Порода. Твёрдый камень Красного биома для багровой брони и оружия.',
    placesTile: TileType.Crimstone,
    color: '#991b1b',
    accent: '#ef4444',
  },
  crimson_brick: {
    id: 'crimson_brick',
    name: 'Crimson Brick',
    nameRu: 'Багряный кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Building Block. Rich scarlet masonry for dark citadels.',
    descriptionRu: 'Блок. Красивый тёмно-алый кирпич для цитадели.',
    placesTile: TileType.CrimsonBrick,
    color: '#b91c1c',
    accent: '#fca5a5',
  },
  crimson_wood: {
    id: 'crimson_wood',
    name: 'Shadewood',
    nameRu: 'Багряное дерево',
    category: 'block',
    maxStack: 999,
    description: 'Biome Wood. Crimson timber used for planks and the Tendon Bow.',
    descriptionRu: 'Дерево. Красная древесина для досок и Багряного лука.',
    placesTile: TileType.CrimsonWood,
    color: '#881337',
    accent: '#fb7185',
  },
  sand_block: {
    id: 'sand_block',
    name: 'Desert Sand',
    nameRu: 'Песок',
    category: 'block',
    maxStack: 999,
    description: 'Biome Block. Warm desert & ocean sand; smelts into Glass at a Furnace.',
    descriptionRu: 'Блок. Золотистый песок Пустыни и Океана; плавится в стекло.',
    placesTile: TileType.Sand,
    color: '#eab308',
    accent: '#fef08a',
  },
  sandstone_brick: {
    id: 'sandstone_brick',
    name: 'Pyramid Sandstone Brick',
    nameRu: 'Песчаный кирпич Пирамиды',
    category: 'block',
    maxStack: 999,
    description: 'Temple Block. Ancient golden blocks forming the Desert Pyramid.',
    descriptionRu: 'Храмовый блок. Золотой кирпич, из которого сложена Пирамида.',
    placesTile: TileType.SandstoneBrick,
    color: '#ca8a04',
    accent: '#fde047',
  },
  cactus_block: {
    id: 'cactus_block',
    name: 'Desert Cactus',
    nameRu: 'Пустынный кактус',
    category: 'block',
    maxStack: 999,
    description: 'Desert Plant. Can be placed or crafted into Healing Potions & Wood.',
    descriptionRu: 'Растение Пустыни. Перерабатывается в зелья и древесину.',
    placesTile: TileType.Cactus,
    color: '#16a34a',
    accent: '#86efac',
  },
  marble_block: {
    id: 'marble_block',
    name: 'White Marble',
    nameRu: 'Белый мрамор',
    category: 'block',
    maxStack: 999,
    description: 'Cave Block. Smooth white stone from deep marble pockets.',
    descriptionRu: 'Блок. Благородный белый мрамор из глубоких пещер.',
    placesTile: TileType.Marble,
    color: '#e2e8f0',
    accent: '#ffffff',
  },
  obsidian_block: {
    id: 'obsidian_block',
    name: 'Obsidian',
    nameRu: 'Обсидиан',
    category: 'block',
    maxStack: 999,
    description: 'Deep Ore/Block. Found in the Underworld; crafts Obsidian Armor & Nightblade.',
    descriptionRu: 'Блок глубин. Нужен для Обсидиановой брони, кирки и Ночного клинка.',
    placesTile: TileType.Obsidian,
    color: '#3b0764',
    accent: '#a855f7',
  },
  crystal_block: {
    id: 'crystal_block',
    name: 'Glowing Crystal Shard',
    nameRu: 'Светящийся кристалл',
    category: 'block',
    maxStack: 999,
    description: 'Luminous Crystal. Glows in the dark and crafts Crystal Armor & Wings.',
    descriptionRu: 'Сияющий кристалл. Нужен для Кристальной брони, Крыльев и лука.',
    placesTile: TileType.CrystalBlock,
    color: '#d946ef',
    accent: '#f5d0fe',
  },
  wood_beam: {
    id: 'wood_beam',
    name: 'Wood Support Beam',
    nameRu: 'Деревянная балка',
    category: 'block',
    maxStack: 999,
    description: 'Decorative Pillar. Walk freely in front of it inside houses.',
    descriptionRu: 'Опора. Декоративная балка — сквозь неё можно свободно ходить.',
    placesTile: TileType.WoodBeam,
    color: '#6b4226',
    accent: '#a16207',
  },
  snow_wall: {
    id: 'snow_wall',
    name: 'Snow Background Wall',
    nameRu: 'Задняя стена (снег)',
    category: 'wall',
    maxStack: 999,
    description: 'Background Wall. Cool frost-tinted wall for cozy tundra cabins.',
    descriptionRu: 'Фоновая стена. Прохладная ледяная фоновая стена для дома.',
    placesWall: WallType.SnowWall,
    color: '#7dd3fc',
    accent: '#e0f2fe',
  },
  crimson_wall: {
    id: 'crimson_wall',
    name: 'Crimson Background Wall',
    nameRu: 'Задняя стена (багрянец)',
    category: 'wall',
    maxStack: 999,
    description: 'Background Wall. Deep scarlet wall from the Crimson biome.',
    descriptionRu: 'Фоновая стена. Алая фоновая стена из Красного биома.',
    placesWall: WallType.CrimsonWall,
    color: '#7f1d1d',
    accent: '#dc2626',
  },
  marble_wall: {
    id: 'marble_wall',
    name: 'Marble Background Wall',
    nameRu: 'Задняя стена (мрамор)',
    category: 'wall',
    maxStack: 999,
    description: 'Background Wall. Elegant white marble backdrop for cat palaces.',
    descriptionRu: 'Фоновая стена. Роскошный светлый фон для дворца.',
    placesWall: WallType.MarbleWall,
    color: '#cbd5e1',
    accent: '#f8fafc',
  },

  // === CRAFTING STATIONS ===
  workbench_item: {
    id: 'workbench_item',
    name: 'Workbench',
    nameRu: 'Верстак',
    category: 'station',
    maxStack: 10,
    description: 'Crafting Station. Stand nearby to craft furniture, bows, bombs & summons.',
    descriptionRu: 'Станция. Открывает рецепты мебели, луков, бомб и призывалок.',
    placesTile: TileType.Workbench,
    color: '#a16207',
    accent: '#fde047',
  },
  furnace_item: {
    id: 'furnace_item',
    name: 'Furnace',
    nameRu: 'Печь',
    category: 'station',
    maxStack: 10,
    description: 'Crafting Station. Smelts copper, iron & gold ore into bars and bakes glass.',
    descriptionRu: 'Станция. Плавит медь, железо и золото в слитки, печёт стекло.',
    placesTile: TileType.Furnace,
    color: '#57534e',
    accent: '#fb923c',
  },
  anvil_item: {
    id: 'anvil_item',
    name: 'Iron Anvil',
    nameRu: 'Наковальня',
    category: 'station',
    maxStack: 10,
    description: 'Crafting Station. Forges armor sets, high-tier pickaxes, swords & wings.',
    descriptionRu: 'Станция. Куёт комплекты брони, мощные мечи, кирки и крылья.',
    placesTile: TileType.Anvil,
    color: '#334155',
    accent: '#94a3b8',
  },

  // === MATERIALS, ORES & LUNAR FRAGMENTS ===
  coal_ore: {
    id: 'coal_ore',
    name: 'Coal',
    nameRu: 'Уголь',
    category: 'material',
    maxStack: 999,
    description: 'Material. Used to craft torches, furnaces, bombs, and smelt bars.',
    descriptionRu: 'Материал. Нужен для факелов, печи и плавки руды.',
    color: '#1e293b',
    accent: '#475569',
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper Ore',
    nameRu: 'Медная руда',
    category: 'material',
    maxStack: 999,
    description: 'Ore. Smelt at a Furnace into Copper Bars.',
    descriptionRu: 'Руда. Плавится в печи в медные слитки.',
    color: '#b45309',
    accent: '#fb923c',
  },
  copper_bar: {
    id: 'copper_bar',
    name: 'Copper Bar',
    nameRu: 'Медный слиток',
    category: 'material',
    maxStack: 999,
    description: 'Bar. Used to craft Copper Armor, Copper Pickaxe, Sword & Bow.',
    descriptionRu: 'Слиток. Для медной брони, кирки, меча и лука.',
    color: '#d97706',
    accent: '#fed7aa',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    nameRu: 'Железная руда',
    category: 'material',
    maxStack: 999,
    description: 'Ore. Smelt with Coal at a Furnace into Iron Bars.',
    descriptionRu: 'Руда. Переплавляется в печи с углём в железные слитки.',
    color: '#64748b',
    accent: '#cbd5e1',
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'Gold Ore',
    nameRu: 'Золотая руда',
    category: 'material',
    maxStack: 999,
    description: 'Precious Ore. Smelt at a Furnace into Gold Bars.',
    descriptionRu: 'Ценная руда. Плавится в золотые слитки.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  iron_bar: {
    id: 'iron_bar',
    name: 'Iron Bar',
    nameRu: 'Железный слиток',
    category: 'material',
    maxStack: 999,
    description: 'Bar. Forges Anvils, Iron Armor, Chains, Hooks & Swords.',
    descriptionRu: 'Слиток. Для наковальни, железной брони, крюка и оружия.',
    color: '#94a3b8',
    accent: '#f1f5f9',
  },
  gold_bar: {
    id: 'gold_bar',
    name: 'Gold Bar',
    nameRu: 'Золотой слиток',
    category: 'material',
    maxStack: 999,
    description: 'Precious Bar. Crafts Golden Armor, Claymore, Starfury & Summons.',
    descriptionRu: 'Слиток. Для золотой брони, клеймора, Звёздной ярости и призывалок.',
    color: '#eab308',
    accent: '#fef9c3',
  },
  ruby_gem: {
    id: 'ruby_gem',
    name: 'Ruby Gem',
    nameRu: 'Рубин',
    category: 'material',
    maxStack: 99,
    description: 'Deep Cavern Gem. Used for magic staffs, Royal Greatsword & Crystal Armor.',
    descriptionRu: 'Самоцвет глубин. Для посохов, Рубинового меча и Кристальной брони.',
    color: '#e11d48',
    accent: '#fda4af',
  },
  slime_gel: {
    id: 'slime_gel',
    name: 'Slime Gel',
    nameRu: 'Гель слизня',
    category: 'material',
    maxStack: 999,
    description: 'Drop from Slimes. Crafts Torches, Rope, Potions & Boss Summons.',
    descriptionRu: 'Трофей со слизней. Для факелов, верёвки, зелий и призывалок.',
    color: '#22c55e',
    accent: '#86efac',
  },
  monster_bone: {
    id: 'monster_bone',
    name: 'Monster Bone',
    nameRu: 'Кость монстра',
    category: 'material',
    maxStack: 999,
    description: 'Drop from Skeletons & Mummies. Used for Spears, Bows & Boss Summons.',
    descriptionRu: 'Трофей со скелетов и мумий. Для копий, луков и призывалок.',
    color: '#e2e8f0',
    accent: '#94a3b8',
  },
  solar_fragment: {
    id: 'solar_fragment',
    name: 'Solar Fragment',
    nameRu: 'Солнечный фрагмент',
    category: 'material',
    maxStack: 999,
    description: 'Celestial Drop from the Solar Pillar. Crafts Meowmere & Luminite Pickaxe!',
    descriptionRu: 'Добыча с Солнечной башни. Нужен для Мяумура и Люминитовой кирки!',
    color: '#f97316',
    accent: '#fef08a',
  },
  vortex_fragment: {
    id: 'vortex_fragment',
    name: 'Vortex Fragment',
    nameRu: 'Вихревой фрагмент',
    category: 'material',
    maxStack: 999,
    description: 'Celestial Drop from the Vortex Pillar. Crafts Moon Lord Sigil & endgame gear.',
    descriptionRu: 'Добыча с Вихревой башни. Для Сигила Лунного Лорда и финал-экипировки.',
    color: '#14b8a6',
    accent: '#99f6e4',
  },
  nebula_fragment: {
    id: 'nebula_fragment',
    name: 'Nebula Fragment',
    nameRu: 'Фрагмент Туманности',
    category: 'material',
    maxStack: 999,
    description: 'Celestial Drop from the Nebula Pillar. Pulsing pink cosmic energy.',
    descriptionRu: 'Добыча с Башни Туманности. Пульсирующая розовая космическая энергия.',
    color: '#d946ef',
    accent: '#f5d0fe',
  },
  stardust_fragment: {
    id: 'stardust_fragment',
    name: 'Stardust Fragment',
    nameRu: 'Фрагмент Звёздной Пыли',
    category: 'material',
    maxStack: 999,
    description: 'Celestial Drop from the Stardust Pillar. Pure starlight condensed into crystal.',
    descriptionRu: 'Добыча с Башни Звёздной пыли. Сжатый звёздный свет для крафта.',
    color: '#38bdf8',
    accent: '#e0f2fe',
  },

  // === CONSUMABLES ===
  crispy_fish: {
    id: 'crispy_fish',
    name: 'Crispy Fish',
    nameRu: 'Хрустящая рыбка',
    category: 'consumable',
    maxStack: 30,
    description: 'Restores +35 HP immediately. Every adventure cat’s favorite snack.',
    descriptionRu: 'Восстанавливает +35 HP. Любимая хрустящая еда котика!',
    healAmount: 35,
    color: '#38bdf8',
    accent: '#fef08a',
  },
  warm_milk: {
    id: 'warm_milk',
    name: 'Warm Cat Milk',
    nameRu: 'Тёплое молоко',
    category: 'consumable',
    maxStack: 30,
    description: 'Restores +50 HP and +40 Mana when consumed.',
    descriptionRu: 'Восстанавливает +50 HP и +40 маны.',
    healAmount: 50,
    manaAmount: 40,
    color: '#f8fafc',
    accent: '#bae6fd',
  },
  catnip_elixir: {
    id: 'catnip_elixir',
    name: 'Catnip Ironskin Elixir',
    nameRu: 'Эликсир мяты (+броня)',
    category: 'consumable',
    maxStack: 10,
    description: 'Permanently grants +2 base Defense (up to 14) and heals +30 HP.',
    descriptionRu: 'Навсегда даёт +2 базовой защиты (до 14) и лечит +30 HP.',
    healAmount: 30,
    defenseBonus: 2,
    color: '#10b981',
    accent: '#a7f3d0',
  },
  hellstone_ore: {
    id: 'hellstone_ore',
    name: 'Hellstone Ore',
    nameRu: 'Адская руда',
    category: 'block',
    maxStack: 999,
    placesTile: TileType.HellstoneOre,
    description: 'Glowing Underworld Ore. Smelt with Obsidian at a Furnace into Hellstone Bars!',
    descriptionRu: 'Раскалённая руда Преисподней. Переплавляется с обсидианом в Адские слитки!',
    color: '#ea580c',
    accent: '#fde047',
  },
  hellstone_bar: {
    id: 'hellstone_bar',
    name: 'Hellstone Bar',
    nameRu: 'Адский слиток',
    category: 'material',
    maxStack: 999,
    description: 'Smelted Hellstone + Obsidian. Forges Molten Armor and top pre-hardmode gear.',
    descriptionRu: 'Слиток из Адской руды и обсидиана. Нужен для Литой (Molten) брони.',
    color: '#dc2626',
    accent: '#facc15',
  },
  campfire_item: {
    id: 'campfire_item',
    name: 'Campfire',
    nameRu: 'Костёр',
    category: 'block',
    maxStack: 99,
    placesTile: TileType.Campfire,
    description: 'Terraria Light & Regen. Emits warm light and +1.5 HP/s cozy regeneration nearby!',
    descriptionRu: 'Костёр из Террарии. Светит и даёт +1.5 HP/сек регенерации рядом!',
    color: '#ea580c',
    accent: '#fde047',
    shopPrice: 12,
  },
  heart_lantern_item: {
    id: 'heart_lantern_item',
    name: 'Heart Lantern',
    nameRu: 'Сердечный фонарь',
    category: 'block',
    maxStack: 99,
    placesTile: TileType.HeartLantern,
    description: 'Terraria Regen Lamp. Grants +2.0 HP/s bonus health regeneration when placed nearby!',
    descriptionRu: 'Фонарь из Кристалла Жизни. Даёт +2.0 HP/сек регенерации рядом!',
    color: '#ec4899',
    accent: '#fbcfe8',
    shopPrice: 65,
  },
  sunflower_item: {
    id: 'sunflower_item',
    name: 'Sunflower',
    nameRu: 'Подсолнух',
    category: 'block',
    maxStack: 99,
    placesTile: TileType.Sunflower,
    description: 'Happy Aura Plant. Increases movement speed by +10% for nearby heroes!',
    descriptionRu: 'Счастливый подсолнух: ускоряет бег кота на +10%, когда он рядом!',
    color: '#eab308',
    accent: '#4ade80',
    shopPrice: 10,
  },
  crimson_altar_item: {
    id: 'crimson_altar_item',
    name: 'Crimson Altar',
    nameRu: 'Багровый алтарь',
    category: 'block',
    maxStack: 20,
    placesTile: TileType.CrimsonAltar,
    description: 'Eerie Glowing Crimson Shrine found inside Crimson Mouth caverns.',
    descriptionRu: 'Жуткий светящийся алтарь из пещер-ртов Багрянца.',
    color: '#991b1b',
    accent: '#f87171',
  },
  crimson_tooth_block: {
    id: 'crimson_tooth_block',
    name: 'Crimson Fang Block',
    nameRu: 'Зуб Багряного рта',
    category: 'block',
    maxStack: 999,
    placesTile: TileType.CrimsonTooth,
    description: 'Giant bone-ivory fang lining the jaws of Crimson Mouth caverns.',
    descriptionRu: 'Гигантский костяной клык со входа в пещеру-рот Багрянца.',
    color: '#f5f5f4',
    accent: '#dc2626',
  },
  red_potion: {
    id: 'red_potion',
    name: 'Red Potion',
    nameRu: 'Красное зелье',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'red_potion',
    description: '50/50 Gamble! Either grants 4 strong Buffs + 60 HP OR inflicts 4 nasty Debuffs!',
    descriptionRu: 'Рулетка 50 на 50! Либо даст 4 мощных баффа + 60 HP, либо наложит 4 плохих эффекта!',
    color: '#b91c1c',
    accent: '#fca5a5',
    shopPrice: 45,
  },
  milk_potion: {
    id: 'milk_potion',
    name: 'Milk Potion',
    nameRu: 'Зелье молока',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'milk_potion',
    healAmount: 15,
    description: 'Cleansing Brew. Immediately removes ALL negative debuffs and heals +15 HP!',
    descriptionRu: 'Очищающее молоко: мгновенно снимает ВСЕ плохие эффекты и лечит +15 HP!',
    color: '#f8fafc',
    accent: '#bae6fd',
    shopPrice: 20,
  },
  ironskin_potion: {
    id: 'ironskin_potion',
    name: 'Ironskin Potion',
    nameRu: 'Зелье железной кожи',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'ironskin', duration: 90 }],
    description: 'Buff Potion (90s). Increases Defense by +8.',
    descriptionRu: 'Зелье баффа (90с): увеличивает защиту на +8.',
    color: '#eab308',
    accent: '#fef08a',
    shopPrice: 18,
  },
  regen_potion: {
    id: 'regen_potion',
    name: 'Regeneration Potion',
    nameRu: 'Зелье регенерации',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'regeneration', duration: 90 }],
    description: 'Buff Potion (90s). Continuously regenerates +3 HP per second.',
    descriptionRu: 'Зелье баффа (90с): восстанавливает +3 HP/сек.',
    color: '#f43f5e',
    accent: '#fecdd3',
    shopPrice: 18,
  },
  swiftness_potion: {
    id: 'swiftness_potion',
    name: 'Swiftness Potion',
    nameRu: 'Зелье стремительности',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'swiftness', duration: 90 }],
    description: 'Buff Potion (90s). Increases movement speed by +25%.',
    descriptionRu: 'Зелье баффа (90с): ускоряет бег кота на +25%.',
    color: '#22c55e',
    accent: '#bbf7d0',
    shopPrice: 18,
  },
  magic_power_potion: {
    id: 'magic_power_potion',
    name: 'Magic Power Potion',
    nameRu: 'Зелье магической силы',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'mana_power', duration: 90 }],
    description: 'Buff Potion (90s). Boosts weapon & magic damage +20% and mana regen.',
    descriptionRu: 'Зелье баффа (90с): +20% урона и ускоренный реген маны.',
    color: '#a855f7',
    accent: '#f3e8ff',
    shopPrice: 22,
  },
  featherfall_potion: {
    id: 'featherfall_potion',
    name: 'Featherfall Potion',
    nameRu: 'Зелье перышка',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'featherfall', duration: 90 }],
    description: 'Buff Potion (90s). Slows falling speed and prevents fall damage.',
    descriptionRu: 'Зелье баффа (90с): плавное падение и защита от урона высоты.',
    color: '#38bdf8',
    accent: '#e0f2fe',
    shopPrice: 20,
  },
  wrath_potion: {
    id: 'wrath_potion',
    name: 'Wrath Potion',
    nameRu: 'Зелье гнева',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'wrath', duration: 90 }],
    description: 'Buff Potion (90s). Increases all damage dealt by +15%.',
    descriptionRu: 'Зелье баффа (90с): увеличивает весь наносимый урон на +15%.',
    color: '#ef4444',
    accent: '#fca5a5',
    shopPrice: 25,
  },
  obsidian_skin_potion: {
    id: 'obsidian_skin_potion',
    name: 'Obsidian Skin Potion',
    nameRu: 'Зелье обсидиановой кожи',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'obsidian_skin', duration: 90 }],
    description: 'Buff Potion (90s). Grants +4 Defense and immunity to Fire / On Fire!',
    descriptionRu: 'Зелье баффа (90с): +4 защиты и полный иммунитет к огню.',
    color: '#6d28d9',
    accent: '#ddd6fe',
    shopPrice: 24,
  },
  shine_potion: {
    id: 'shine_potion',
    name: 'Shine Potion',
    nameRu: 'Зелье свечения',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'shine', duration: 120 }],
    description: 'Buff Potion (120s). Makes your hero glow brightly in dark caves!',
    descriptionRu: 'Зелье баффа (120с): подсвечивает кота и тёмные пещеры вокруг.',
    color: '#facc15',
    accent: '#fef9c3',
    shopPrice: 15,
  },
  heartreach_potion: {
    id: 'heartreach_potion',
    name: 'Heartreach Potion',
    nameRu: 'Зелье магнита',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'buff_potion',
    grantsEffects: [{ id: 'heartreach', duration: 90 }],
    description: 'Buff Potion (90s). Greatly expands item & loot magnet pickup range.',
    descriptionRu: 'Зелье баффа (90с): в 3 раза увеличивает радиус притяжения лута.',
    color: '#ec4899',
    accent: '#fbcfe8',
    shopPrice: 18,
  },
  recall_potion: {
    id: 'recall_potion',
    name: 'Recall Potion',
    nameRu: 'Зелье возврата',
    category: 'consumable',
    maxStack: 30,
    specialKind: 'recall_potion',
    description: 'Single-use Teleport. Instantly returns you to your spawn or bed!',
    descriptionRu: 'Одноразовый телепорт: мгновенно возвращает домой на кровать или спавн.',
    color: '#0ea5e9',
    accent: '#bae6fd',
    shopPrice: 15,
  },

  // === TERRARIA FURNITURE & HOUSE BUILDING ===
  table_item: {
    id: 'table_item',
    name: 'Wooden Table',
    nameRu: 'Деревянный стол',
    category: 'block',
    maxStack: 30,
    description: 'House Furniture. Place inside an enclosed room with a Chair for NPCs.',
    descriptionRu: 'Мебель. Нужен вместе со стулом для заселения жителей в дом.',
    placesTile: TileType.Table,
    color: '#92400e',
    accent: '#d97706',
    shopPrice: 12,
  },
  chair_item: {
    id: 'chair_item',
    name: 'Wooden Chair',
    nameRu: 'Деревянный стул',
    category: 'block',
    maxStack: 30,
    description: 'House Furniture. Visible wooden seat required for valid villager housing.',
    descriptionRu: 'Мебель. Удобный стул — нужен в комнате для прихода жителя.',
    placesTile: TileType.Chair,
    color: '#b45309',
    accent: '#fbbf24',
    shopPrice: 10,
  },
  chandelier_item: {
    id: 'chandelier_item',
    name: 'Golden Chandelier',
    nameRu: 'Золотая люстра',
    category: 'block',
    maxStack: 20,
    description: 'Bright Light Source. Illuminates rooms and counts as house lighting.',
    descriptionRu: 'Люстра. Яркий свет для дома и украшение потолка.',
    placesTile: TileType.Chandelier,
    color: '#facc15',
    accent: '#fef08a',
    shopPrice: 25,
  },
  bookshelf_item: {
    id: 'bookshelf_item',
    name: 'Bookshelf',
    nameRu: 'Книжный шкаф',
    category: 'block',
    maxStack: 20,
    description: 'House Furniture. Counts as a Table for NPC housing requirements.',
    descriptionRu: 'Мебель. Засчитывается как стол для жилья жителей.',
    placesTile: TileType.Bookshelf,
    color: '#78350f',
    accent: '#38bdf8',
    shopPrice: 28,
  },
  piggy_bank_item: {
    id: 'piggy_bank_item',
    name: 'Piggy Bank',
    nameRu: 'Копилка-Свинка',
    category: 'block',
    maxStack: 5,
    description: 'Iconic Terraria Prop. Counts as a cozy flat surface (table) in houses.',
    descriptionRu: 'Знаковая розовая свинка! Засчитывается как стол в доме.',
    placesTile: TileType.PiggyBank,
    color: '#f472b6',
    accent: '#fbcfe8',
    shopPrice: 40,
  },
  rope_item: {
    id: 'rope_item',
    name: 'Climbing Rope',
    nameRu: 'Верёвка',
    category: 'block',
    maxStack: 99,
    description: 'Climbable Utility. Stack vertically and hold W or S to climb shafts.',
    descriptionRu: 'Верёвка. Ставится вертикально; жми W/S для подъёма и спуска по шахтам.',
    placesTile: TileType.Rope,
    color: '#d97706',
    accent: '#fde68a',
    shopPrice: 2,
  },
  house_blueprint: {
    id: 'house_blueprint',
    name: 'Cozy House Blueprint',
    nameRu: 'Чертёж уютного дома',
    category: 'consumable',
    maxStack: 10,
    specialKind: 'house_blueprint',
    description: 'Instant Builder. Click to build a complete 9×6 NPC-ready cottage!',
    descriptionRu: 'Мгновенно строит готовый домик 9×6 со стенами, дверями, люстрой, столом и стулом!',
    color: '#38bdf8',
    accent: '#fde047',
    shopPrice: 45,
  },

  // === TERRARIA CRYSTALS, POTIONS & GADGETS ===
  life_crystal: {
    id: 'life_crystal',
    name: 'Life Crystal',
    nameRu: 'Кристалл Жизни',
    category: 'consumable',
    maxStack: 20,
    specialKind: 'life_crystal',
    description: 'Permanent Upgrade. Increases Max HP by +20 (up to 400 HP)!',
    descriptionRu: 'Навсегда добавляет +20 макс. HP (до 400)!',
    color: '#ec4899',
    accent: '#fbcfe8',
    shopPrice: 95,
  },
  fallen_star: {
    id: 'fallen_star',
    name: 'Fallen Star',
    nameRu: 'Упавшая звезда',
    category: 'material',
    maxStack: 99,
    description: 'Night Sky Material. Combine 3 stars by hand into a Mana Crystal!',
    descriptionRu: 'Падает с неба ночью. 3 звезды крафтятся в Кристалл Маны!',
    color: '#fde047',
    accent: '#fef9c3',
  },
  mana_crystal: {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    nameRu: 'Кристалл Маны',
    category: 'consumable',
    maxStack: 20,
    specialKind: 'mana_crystal',
    description: 'Permanent Upgrade. Increases Max Mana by +20 (up to 200 Mana)!',
    descriptionRu: 'Навсегда увеличивает максимум маны на +20 (до 200).',
    color: '#3b82f6',
    accent: '#bae6fd',
    shopPrice: 70,
  },
  healing_potion: {
    id: 'healing_potion',
    name: 'Healing Potion',
    nameRu: 'Лечебное зелье',
    category: 'consumable',
    maxStack: 30,
    healAmount: 65,
    description: 'Consumable. Classic red Terraria potion that restores +65 HP.',
    descriptionRu: 'Зелье. Классическое красное зелье Террарии: лечит +65 HP.',
    color: '#ef4444',
    accent: '#fecaca',
    shopPrice: 15,
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    nameRu: 'Зелье маны',
    category: 'consumable',
    maxStack: 30,
    manaAmount: 75,
    description: 'Consumable. Restores +75 Mana for staffs and laser weapons.',
    descriptionRu: 'Зелье. Восстанавливает +75 маны для магии и лазеров.',
    color: '#2563eb',
    accent: '#93c5fd',
    shopPrice: 12,
  },
  magic_mirror: {
    id: 'magic_mirror',
    name: 'Magic Mirror',
    nameRu: 'Волшебное зеркало',
    category: 'consumable',
    maxStack: 1,
    specialKind: 'magic_mirror',
    description: 'Reusable Teleport. Gaze into it to warp straight back to your spawn/bed!',
    descriptionRu: 'Телепорт. Мгновенно возвращает домой на точку спавна!',
    color: '#38bdf8',
    accent: '#e0f2fe',
    shopPrice: 80,
  },
  grappling_hook: {
    id: 'grappling_hook',
    name: 'Grappling Hook',
    nameRu: 'Крюк-кошка',
    category: 'weapon',
    weaponKind: 'hook',
    maxStack: 1,
    cooldown: 0.25,
    description: 'Mobility Tool. Latches onto blocks and pulls you in. Also works with [G]!',
    descriptionRu: 'Мобильность. Цепляется за блоки и тянет кота; работает по [G].',
    color: '#94a3b8',
    accent: '#f59e0b',
    shopPrice: 55,
  },

  // === PASSIVE ACCESSORIES ===
  cloud_in_bottle: {
    id: 'cloud_in_bottle',
    name: 'Cloud in a Bottle',
    nameRu: 'Облако в бутылке',
    category: 'accessory',
    accessoryKind: 'cloud_bottle',
    maxStack: 1,
    description: 'Accessory. Equip in an accessory slot to unlock a crisp Double Jump!',
    descriptionRu: 'Аксессуар: даёт двойной прыжок в воздухе.',
    color: '#bae6fd',
    accent: '#ffffff',
    shopPrice: 85,
  },
  hermes_boots: {
    id: 'hermes_boots',
    name: 'Hermes Boots',
    nameRu: 'Ботинки Гермеса',
    category: 'accessory',
    accessoryKind: 'hermes_boots',
    maxStack: 1,
    description: 'Accessory. Increases running speed by +38% across all biomes.',
    descriptionRu: 'Аксессуар: ускоряет бег кота на +38%.',
    color: '#16a34a',
    accent: '#fde047',
    shopPrice: 90,
  },
  band_of_regen: {
    id: 'band_of_regen',
    name: 'Band of Regeneration',
    nameRu: 'Кольцо регенерации',
    category: 'accessory',
    accessoryKind: 'regen_ring',
    maxStack: 1,
    description: 'Accessory. Continuously regenerates +1.8 HP per second.',
    descriptionRu: 'Аксессуар: постоянно восстанавливает +1.8 HP/сек.',
    color: '#e11d48',
    accent: '#fda4af',
    shopPrice: 95,
  },
  cobalt_shield: {
    id: 'cobalt_shield',
    name: 'Cobalt Shield',
    nameRu: 'Кобальтовый щит',
    category: 'accessory',
    accessoryKind: 'cobalt_shield',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Accessory. Grants +2 Defense and full immunity to knockback.',
    descriptionRu: 'Аксессуар: +2 защиты и полный иммунитет к отбрасыванию!',
    color: '#1d4ed8',
    accent: '#93c5fd',
    shopPrice: 110,
  },
  shiny_red_balloon: {
    id: 'shiny_red_balloon',
    name: 'Shiny Red Balloon',
    nameRu: 'Красный шарик',
    category: 'accessory',
    accessoryKind: 'red_balloon',
    maxStack: 1,
    description: 'Accessory. Boosts jump height by +35%.',
    descriptionRu: 'Аксессуар: увеличивает высоту прыжка на +35%.',
    color: '#ef4444',
    accent: '#fecaca',
    shopPrice: 95,
  },
  shackle: {
    id: 'shackle',
    name: 'Shackle',
    nameRu: 'Кандалы',
    category: 'accessory',
    accessoryKind: 'shackle',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Accessory. Simple iron shackle granting +2 Defense.',
    descriptionRu: 'Базовый аксессуар: +2 к защите.',
    color: '#64748b',
    accent: '#cbd5e1',
    shopPrice: 45,
  },
  mana_flower: {
    id: 'mana_flower',
    name: 'Mana Flower',
    nameRu: 'Цветок Маны',
    category: 'accessory',
    accessoryKind: 'mana_flower',
    maxStack: 1,
    description: 'Accessory. Reduces spell mana cost by 25% and speeds mana regen.',
    descriptionRu: 'Аксессуар: снижает расход маны на 25% и ускоряет её реген.',
    color: '#2563eb',
    accent: '#bfdbfe',
    shopPrice: 120,
  },
  lucky_horseshoe: {
    id: 'lucky_horseshoe',
    name: 'Lucky Horseshoe',
    nameRu: 'Счастливая подкова',
    category: 'accessory',
    accessoryKind: 'horseshoe',
    maxStack: 1,
    description: 'Accessory. Negates all fall damage from floating islands and cliffs!',
    descriptionRu: 'Аксессуар: полностью отменяет урон от падения!',
    color: '#f59e0b',
    accent: '#fef08a',
    shopPrice: 105,
  },
  angel_wings: {
    id: 'angel_wings',
    name: 'Angel Wings',
    nameRu: 'Крылья Ангела',
    category: 'accessory',
    accessoryKind: 'angel_wings',
    maxStack: 1,
    description: 'Accessory. Hold Space/W to fly through the sky and negate fall damage!',
    descriptionRu: 'Аксессуар: позволяет летать (зажми Пробел/W) и убирает урон падения!',
    color: '#f8fafc',
    accent: '#38bdf8',
    shopPrice: 220,
  },
  celestial_emblem: {
    id: 'celestial_emblem',
    name: 'Celestial Emblem',
    nameRu: 'Небесная эмблема',
    category: 'accessory',
    accessoryKind: 'celestial_emblem',
    maxStack: 1,
    description: 'Accessory. Grants +15% Damage to all weapons and +20 Max Mana.',
    descriptionRu: 'Аксессуар: +15% к урону всем оружием и +20 макс. маны.',
    color: '#7c3aed',
    accent: '#fde047',
    shopPrice: 185,
  },
  bounty_badge: {
    id: 'bounty_badge',
    name: '$1,000,000 Bounty Badge',
    nameRu: 'Значок Награды $1,000,000',
    category: 'accessory',
    accessoryKind: 'bounty_badge',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Accessory. Grants +3 Defense and +15% Damage with outlaw swagger!',
    descriptionRu: 'Аксессуар: +3 защиты и +15% к урону всем оружием!',
    color: '#eab308',
    accent: '#22c55e',
    shopPrice: 250,
  },
  terraspark_boots: {
    id: 'terraspark_boots',
    name: 'Terraspark Boots',
    nameRu: 'Терра-искровые ботинки',
    category: 'accessory',
    accessoryKind: 'terraspark_boots',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Ultimate Mobility Accessory: +45% Speed, +15% Jump, Fire Immunity & No Fall Damage!',
    descriptionRu: 'Топовый аксессуар: +45% скорости, +15% прыжка, иммунитет к огню и падению!',
    color: '#10b981',
    accent: '#fb923c',
    shopPrice: 320,
  },
  ankh_shield: {
    id: 'ankh_shield',
    name: 'Ankh Shield',
    nameRu: 'Щит Анкха',
    category: 'accessory',
    accessoryKind: 'ankh_shield',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Ultimate Shield: +4 Defense, Knockback Immunity & Immunity to ALL Debuffs!',
    descriptionRu: 'Легендарный щит: +4 защиты, анти-отбрасывание и иммунитет ко ВСЕМ дебаффам!',
    color: '#f59e0b',
    accent: '#fef08a',
    shopPrice: 340,
  },

  // === ARMOR SETS ===
  wood_helmet: {
    id: 'wood_helmet',
    name: 'Wooden Helmet',
    nameRu: 'Деревянный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'wood',
    defenseBonus: 1,
    maxStack: 1,
    description: 'Armor (Helmet): +1 Defense. Full Wood Set: +2 bonus Defense.',
    descriptionRu: 'Броня (Шлем): +1 защиты. Сет дерева даёт ещё +2 защиты.',
    color: '#92400e',
    accent: '#d97706',
  },
  wood_chestplate: {
    id: 'wood_chestplate',
    name: 'Wooden Breastplate',
    nameRu: 'Деревянный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'wood',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Armor (Chestplate): +2 Defense. Full Wood Set: +2 bonus Defense.',
    descriptionRu: 'Броня (Нагрудник): +2 защиты. Сет дерева даёт ещё +2 защиты.',
    color: '#92400e',
    accent: '#d97706',
  },
  wood_greaves: {
    id: 'wood_greaves',
    name: 'Wooden Greaves',
    nameRu: 'Деревянные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'wood',
    defenseBonus: 1,
    maxStack: 1,
    description: 'Armor (Greaves): +1 Defense. Full Wood Set: +2 bonus Defense.',
    descriptionRu: 'Броня (Поножи): +1 защиты. Сет дерева даёт ещё +2 защиты.',
    color: '#92400e',
    accent: '#d97706',
  },
  copper_helmet: {
    id: 'copper_helmet',
    name: 'Copper Helmet',
    nameRu: 'Медный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'copper',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Armor (Helmet): +2 Defense. Copper Set: +2 Defense & +8% Speed.',
    descriptionRu: 'Броня (Шлем): +2 защиты. Медный сет: +2 защиты и +8% скорости.',
    color: '#c2410c',
    accent: '#fdba74',
  },
  copper_chestplate: {
    id: 'copper_chestplate',
    name: 'Copper Chainmail',
    nameRu: 'Медный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'copper',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Armor (Chestplate): +3 Defense. Copper Set: +2 Defense & +8% Speed.',
    descriptionRu: 'Броня (Нагрудник): +3 защиты. Медный сет: +2 защиты и +8% скорости.',
    color: '#c2410c',
    accent: '#fdba74',
  },
  copper_greaves: {
    id: 'copper_greaves',
    name: 'Copper Greaves',
    nameRu: 'Медные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'copper',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Armor (Greaves): +2 Defense. Copper Set: +2 Defense & +8% Speed.',
    descriptionRu: 'Броня (Поножи): +2 защиты. Медный сет: +2 защиты и +8% скорости.',
    color: '#c2410c',
    accent: '#fdba74',
  },
  iron_helmet: {
    id: 'iron_helmet',
    name: 'Iron Helmet',
    nameRu: 'Железный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'iron',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Armor (Helmet): +3 Defense. Iron Set: +3 bonus Defense.',
    descriptionRu: 'Броня (Шлем): +3 защиты. Железный сет: +3 защиты.',
    color: '#64748b',
    accent: '#e2e8f0',
  },
  iron_chestplate: {
    id: 'iron_chestplate',
    name: 'Iron Chainmail',
    nameRu: 'Железный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'iron',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Armor (Chestplate): +4 Defense. Iron Set: +3 bonus Defense.',
    descriptionRu: 'Броня (Нагрудник): +4 защиты. Железный сет: +3 защиты.',
    color: '#64748b',
    accent: '#e2e8f0',
  },
  iron_greaves: {
    id: 'iron_greaves',
    name: 'Iron Greaves',
    nameRu: 'Железные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'iron',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Armor (Greaves): +3 Defense. Iron Set: +3 bonus Defense.',
    descriptionRu: 'Броня (Поножи): +3 защиты. Железный сет: +3 защиты.',
    color: '#64748b',
    accent: '#e2e8f0',
  },
  gold_helmet: {
    id: 'gold_helmet',
    name: 'Gold Helmet',
    nameRu: 'Золотой шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'gold',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Armor (Helmet): +4 Defense. Gold Set: +4 Defense & +10% Damage.',
    descriptionRu: 'Броня (Шлем): +4 защиты. Золотой сет: +4 защиты и +10% урона.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  gold_chestplate: {
    id: 'gold_chestplate',
    name: 'Gold Chainmail',
    nameRu: 'Золотой нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'gold',
    defenseBonus: 5,
    maxStack: 1,
    description: 'Armor (Chestplate): +5 Defense. Gold Set: +4 Defense & +10% Damage.',
    descriptionRu: 'Броня (Нагрудник): +5 защиты. Золотой сет: +4 защиты и +10% урона.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  gold_greaves: {
    id: 'gold_greaves',
    name: 'Gold Greaves',
    nameRu: 'Золотые поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'gold',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Armor (Greaves): +4 Defense. Gold Set: +4 Defense & +10% Damage.',
    descriptionRu: 'Броня (Поножи): +4 защиты. Золотой сет: +4 защиты и +10% урона.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  crimson_helmet: {
    id: 'crimson_helmet',
    name: 'Crimson Helmet',
    nameRu: 'Багровый шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'crimson',
    defenseBonus: 5,
    maxStack: 1,
    description: 'Armor (Helmet): +5 Defense. Crimson Set: +2.0 HP/s life regeneration.',
    descriptionRu: 'Броня (Шлем): +5 защиты. Багровый сет: +2.0 HP/сек регенерации!',
    color: '#991b1b',
    accent: '#f87171',
  },
  crimson_chestplate: {
    id: 'crimson_chestplate',
    name: 'Crimson Scalemail',
    nameRu: 'Багровый нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'crimson',
    defenseBonus: 6,
    maxStack: 1,
    description: 'Armor (Chestplate): +6 Defense. Crimson Set: +2.0 HP/s life regeneration.',
    descriptionRu: 'Броня (Нагрудник): +6 защиты. Багровый сет: +2.0 HP/сек регенерации!',
    color: '#991b1b',
    accent: '#f87171',
  },
  crimson_greaves: {
    id: 'crimson_greaves',
    name: 'Crimson Greaves',
    nameRu: 'Багровые поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'crimson',
    defenseBonus: 5,
    maxStack: 1,
    description: 'Armor (Greaves): +5 Defense. Crimson Set: +2.0 HP/s life regeneration.',
    descriptionRu: 'Броня (Поножи): +5 защиты. Багровый сет: +2.0 HP/сек регенерации!',
    color: '#991b1b',
    accent: '#f87171',
  },
  obsidian_helmet: {
    id: 'obsidian_helmet',
    name: 'Obsidian Helmet',
    nameRu: 'Обсидиановый шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'obsidian',
    defenseBonus: 6,
    maxStack: 1,
    description: 'Armor (Helmet): +6 Defense. Obsidian Set: +18% Damage & No Fall Damage.',
    descriptionRu: 'Броня (Шлем): +6 защиты. Обсидиановый сет: +18% урона и анти-падение.',
    color: '#312e81',
    accent: '#a78bfa',
  },
  obsidian_chestplate: {
    id: 'obsidian_chestplate',
    name: 'Obsidian Breastplate',
    nameRu: 'Обсидиановый нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'obsidian',
    defenseBonus: 8,
    maxStack: 1,
    description: 'Armor (Chestplate): +8 Defense. Obsidian Set: +18% Damage & No Fall Damage.',
    descriptionRu: 'Броня (Нагрудник): +8 защиты. Обсидиановый сет: +18% урона и анти-падение.',
    color: '#312e81',
    accent: '#a78bfa',
  },
  obsidian_greaves: {
    id: 'obsidian_greaves',
    name: 'Obsidian Greaves',
    nameRu: 'Обсидиановые поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'obsidian',
    defenseBonus: 6,
    maxStack: 1,
    description: 'Armor (Greaves): +6 Defense. Obsidian Set: +18% Damage & No Fall Damage.',
    descriptionRu: 'Броня (Поножи): +6 защиты. Обсидиановый сет: +18% урона и анти-падение.',
    color: '#312e81',
    accent: '#a78bfa',
  },
  crystal_helmet: {
    id: 'crystal_helmet',
    name: 'Crystal Helmet',
    nameRu: 'Кристальный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'crystal',
    defenseBonus: 7,
    maxStack: 1,
    description: 'Armor (Helmet): +7 Defense. Crystal Set: +25% Damage, +40 Mana & -20% Mana Cost.',
    descriptionRu: 'Броня (Шлем): +7 защиты. Кристальный сет: +25% урона, +40 маны, -20% расхода.',
    color: '#0284c7',
    accent: '#67e8f9',
  },
  crystal_chestplate: {
    id: 'crystal_chestplate',
    name: 'Crystal Breastplate',
    nameRu: 'Кристальный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'crystal',
    defenseBonus: 9,
    maxStack: 1,
    description: 'Armor (Chestplate): +9 Defense. Crystal Set: +25% Damage, +40 Mana & -20% Mana Cost.',
    descriptionRu: 'Броня (Нагрудник): +9 защиты. Кристальный сет: +25% урона, +40 маны, -20% расхода.',
    color: '#0284c7',
    accent: '#67e8f9',
  },
  crystal_greaves: {
    id: 'crystal_greaves',
    name: 'Crystal Greaves',
    nameRu: 'Кристальные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'crystal',
    defenseBonus: 7,
    maxStack: 1,
    description: 'Armor (Greaves): +7 Defense. Crystal Set: +25% Damage, +40 Mana & -20% Mana Cost.',
    descriptionRu: 'Броня (Поножи): +7 защиты. Кристальный сет: +25% урона, +40 маны, -20% расхода.',
    color: '#0284c7',
    accent: '#67e8f9',
  },
  molten_helmet: {
    id: 'molten_helmet',
    name: 'Molten Helmet',
    nameRu: 'Литой шлем (Molten)',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'molten',
    defenseBonus: 9,
    maxStack: 1,
    description: 'Armor (Helmet): +9 Defense. Molten Set: +15% Damage & Fire Immunity.',
    descriptionRu: 'Броня (Шлем): +9 защиты. Литой сет: +15% урона и иммунитет к огню.',
    color: '#dc2626',
    accent: '#fde047',
  },
  molten_chestplate: {
    id: 'molten_chestplate',
    name: 'Molten Breastplate',
    nameRu: 'Литой нагрудник (Molten)',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'molten',
    defenseBonus: 12,
    maxStack: 1,
    description: 'Armor (Chestplate): +12 Defense. Molten Set: +15% Damage & Fire Immunity.',
    descriptionRu: 'Броня (Нагрудник): +12 защиты. Литой сет: +15% урона и иммунитет к огню.',
    color: '#dc2626',
    accent: '#fde047',
  },
  molten_greaves: {
    id: 'molten_greaves',
    name: 'Molten Greaves',
    nameRu: 'Литые поножи (Molten)',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'molten',
    defenseBonus: 10,
    maxStack: 1,
    description: 'Armor (Greaves): +10 Defense. Molten Set: +15% Damage & Fire Immunity.',
    descriptionRu: 'Броня (Поножи): +10 защиты. Литой сет: +15% урона и иммунитет к огню.',
    color: '#dc2626',
    accent: '#fde047',
  },
  hallowed_helmet: {
    id: 'hallowed_helmet',
    name: 'Hallowed Mask',
    nameRu: 'Святая маска (Hallowed)',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'hallowed',
    defenseBonus: 12,
    maxStack: 1,
    description: 'Armor (Helmet): +12 Defense. Hallowed Set: +25% Damage, +18% Speed & +2.5 HP/s.',
    descriptionRu: 'Броня (Шлем): +12 защиты. Святой сет: +25% урона, +18% скорости и +2.5 HP/с.',
    color: '#eab308',
    accent: '#fef9c3',
  },
  hallowed_chestplate: {
    id: 'hallowed_chestplate',
    name: 'Hallowed Plate Mail',
    nameRu: 'Святой нагрудник (Hallowed)',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'hallowed',
    defenseBonus: 15,
    maxStack: 1,
    description: 'Armor (Chestplate): +15 Defense. Hallowed Set: +25% Damage, +18% Speed & +2.5 HP/s.',
    descriptionRu: 'Броня (Нагрудник): +15 защиты. Святой сет: +25% урона, +18% скорости и +2.5 HP/с.',
    color: '#eab308',
    accent: '#fef9c3',
  },
  hallowed_greaves: {
    id: 'hallowed_greaves',
    name: 'Hallowed Greaves',
    nameRu: 'Святые поножи (Hallowed)',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'hallowed',
    defenseBonus: 13,
    maxStack: 1,
    description: 'Armor (Greaves): +13 Defense. Hallowed Set: +25% Damage, +18% Speed & +2.5 HP/s.',
    descriptionRu: 'Броня (Поножи): +13 защиты. Святой сет: +25% урона, +18% скорости и +2.5 HP/с.',
    color: '#eab308',
    accent: '#fef9c3',
  },

  // === TERRARIA EXPLOSIVES & ICONIC WEAPONS ===
  terraria_bomb: {
    id: 'terraria_bomb',
    name: 'Terraria Bomb',
    nameRu: 'Терра-бомба',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 99,
    damage: 65,
    knockback: 10,
    cooldown: 0.45,
    projectileSpeed: 400,
    aoeRadius: 92,
    description: 'Explosive (65 DMG). Blasts terrain & ores without needing a pickaxe!',
    descriptionRu: 'Бомба (65 урона). Взрывает блоки вокруг и добывает руду без кирки.',
    color: '#1e293b',
    accent: '#ef4444',
    shopPrice: 8,
  },
  dynamite: {
    id: 'dynamite',
    name: 'Dynamite',
    nameRu: 'Динамит',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 99,
    damage: 120,
    knockback: 12,
    cooldown: 0.55,
    projectileSpeed: 370,
    aoeRadius: 135,
    description: 'Heavy Explosive (120 DMG). Carves giant craters in rock and damages bosses.',
    descriptionRu: 'Динамит (120 урона). Разносит огромную воронку в породе.',
    color: '#dc2626',
    accent: '#fde047',
    shopPrice: 18,
  },
  starfury: {
    id: 'starfury',
    name: 'Starfury',
    nameRu: 'Звёздная ярость',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    damage: 34,
    knockback: 6,
    cooldown: 0.28,
    reach: 74,
    description: 'Sky Island Sword (34 DMG). Calls down a falling star from the sky on your cursor!',
    descriptionRu: 'Меч небесных островов (34 урона). Обрушивает падающую звезду на курсор!',
    color: '#ec4899',
    accent: '#fde047',
  },
  terra_blade: {
    id: 'terra_blade',
    name: 'Terra Blade',
    nameRu: 'Терра-клинок',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    damage: 58,
    knockback: 7.5,
    cooldown: 0.22,
    reach: 88,
    description: 'Hero Sword (58 DMG). Fires a piercing emerald Terra energy beam on every swing!',
    descriptionRu: 'Легендарный меч (58 урона). Выпускает пробивной зелёный луч!',
    color: '#10b981',
    accent: '#bef264',
  },
  minishark: {
    id: 'minishark',
    name: 'Minishark',
    nameRu: 'Мини-акула',
    category: 'weapon',
    weaponKind: 'gun',
    maxStack: 1,
    damage: 14,
    knockback: 2.2,
    cooldown: 0.1,
    projectileSpeed: 880,
    pierce: 1,
    description: 'Half shark, half gatling gun (14 DMG). Blistering rapid fire with zero ammo cost!',
    descriptionRu: 'Наполовину акула, наполовину пулемёт (14 урона). Бешеная скорострельность!',
    color: '#475569',
    accent: '#fbbf24',
    shopPrice: 140,
  },
  water_bolt: {
    id: 'water_bolt',
    name: 'Water Bolt',
    nameRu: 'Водяной скипетр',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    damage: 26,
    knockback: 4,
    cooldown: 0.28,
    projectileSpeed: 460,
    manaCost: 10,
    pierce: 4,
    description: 'Dungeon Spellbook (26 DMG, 10 Mana). Fires bouncing water orbs off cave walls!',
    descriptionRu: 'Книга магии (26 урона, 10 маны). Синий шар рикошетит от стен пещер!',
    color: '#0284c7',
    accent: '#7dd3fc',
  },

  // === BOSS & EVENT SUMMONERS (Multi-spawn allowed!) ===
  summon_king_slime: {
    id: 'summon_king_slime',
    name: 'Slime Crown',
    nameRu: 'Желейная корона',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons King Slime! You can stack multiple bosses at once.',
    descriptionRu: 'Призывает Короля Слизней! Можно призывать сколько угодно боссов сразу.',
    summonsBoss: 'king_slime',
    color: '#22c55e',
    accent: '#facc15',
  },
  summon_kotulhu: {
    id: 'summon_kotulhu',
    name: "Kotulhu's Red Bowtie",
    nameRu: 'Галстук Котулху',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons Kotulhu — the bow-tied terror cat! Stackable.',
    descriptionRu: 'Призывает Котулху в красном галстуке-бабочке!',
    summonsBoss: 'kotulhu',
    textureSrc: '/assets/aistudio/wait_518dc071.jpg',
    color: '#dc2626',
    accent: '#fca5a5',
  },
  summon_cat_worm: {
    id: 'summon_cat_worm',
    name: 'Straw Hat Worm Bait',
    nameRu: 'Шляпа Котового Червя',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons Cat Worm (Eater of Cats)! Found in starter chests.',
    descriptionRu: 'Призывает Пожирателя Котов (Котового Червя)!',
    summonsBoss: 'cat_worm',
    textureSrc: '/assets/aistudio/chine_5a03a968.jpg',
    color: '#d97706',
    accent: '#fde68a',
  },
  summon_pharaoh_cat: {
    id: 'summon_pharaoh_cat',
    name: 'Scarab of Naserafal II',
    nameRu: 'Скарабей Насерафала II',
    category: 'summon',
    maxStack: 20,
    description: 'Desert Boss Summon. Summons Pharaoh Cat "Naserafal II" from the Pyramid!',
    descriptionRu: 'Призывает Босса Пустыни и Пирамиды — Фараона Насерафала II!',
    summonsBoss: 'pharaoh_cat',
    textureSrc: '/assets/aistudio/idk_0270621b.jpg',
    color: '#eab308',
    accent: '#1d4ed8',
  },
  summon_jester_cat: {
    id: 'summon_jester_cat',
    name: "Jester's Crimson Bell",
    nameRu: 'Колпак Кота-Шута',
    category: 'summon',
    maxStack: 20,
    description: 'Cat Boss Summon. Summons the chaotic Jester Cat with card barrages!',
    descriptionRu: 'Призывает хаотичного Кота-Шута с веерами острых карт!',
    summonsBoss: 'jester_cat',
    textureSrc: '/assets/aistudio/123_0187db8e.jpg',
    color: '#dc2626',
    accent: '#2563eb',
  },
  summon_sun_cat: {
    id: 'summon_sun_cat',
    name: 'Golden Sunset Idol',
    nameRu: 'Идол Солнечного Зазу',
    category: 'summon',
    maxStack: 20,
    description: 'Cat Boss Summon. Summons Solar Zazu, radiant cat of the golden sunset!',
    descriptionRu: 'Призывает сияющего Солнечного Зазу с солнечными вспышками!',
    summonsBoss: 'sun_cat',
    textureSrc: '/assets/aistudio/321__3__20414179.jpg',
    color: '#f59e0b',
    accent: '#fef08a',
  },
  summon_atomic_cat: {
    id: 'summon_atomic_cat',
    name: 'Uranium Catnip Core',
    nameRu: 'Атомная Бомба Кота',
    category: 'summon',
    maxStack: 20,
    description: 'Cat Boss Summon. Summons Atomic Cat riding a giant yellow nuke!',
    descriptionRu: 'Призывает Атомного Кота верхом на жёлтой атомной бомбе!',
    summonsBoss: 'atomic_cat',
    textureSrc: '/assets/aistudio/asd_ebf0b5a3.jpg',
    color: '#eab308',
    accent: '#1e293b',
  },
  summon_party_cat: {
    id: 'summon_party_cat',
    name: 'Rainbow Lollipop & Cap',
    nameRu: 'Леденец и Кепка с Пропеллером',
    category: 'summon',
    maxStack: 20,
    description: 'Cat Boss Summon. Summons Propeller Lollipop Cat spinning rainbow candy!',
    descriptionRu: 'Призывает Кота в кепке с пропеллером и радужным леденцом!',
    summonsBoss: 'party_cat',
    textureSrc: '/assets/aistudio/w_eb0ab916.jpg',
    color: '#ec4899',
    accent: '#38bdf8',
  },
  summon_melon_bandit: {
    id: 'summon_melon_bandit',
    name: 'WANTED Poster ($1,000,000)',
    nameRu: 'Листовка WANTED ($1,000,000)',
    category: 'summon',
    maxStack: 20,
    description: 'Bounty Summon. Summons the Watermelon Outlaw Cat — defeat for huge coin drops!',
    descriptionRu: 'Призывает разыскиваемого Арбузного Кота-Бандита (крупная награда в монетах)!',
    summonsBoss: 'melon_bandit',
    textureSrc: '/assets/aistudio/bro_baffbb45.jpg',
    color: '#16a34a',
    accent: '#facc15',
  },
  summon_skele_cat: {
    id: 'summon_skele_cat',
    name: 'Clothier Skull Voodoo',
    nameRu: 'Проклятый Кото-череп',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons Skeletron with spinning bone hands!',
    descriptionRu: 'Призывает Скелетрона с вращающимися костяными руками!',
    summonsBoss: 'skele_cat',
    color: '#e2e8f0',
    accent: '#a855f7',
  },
  summon_eye_boss: {
    id: 'summon_eye_boss',
    name: 'Suspicious Looking Eye',
    nameRu: 'Подозрительное Око',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons the Eye of Cthulhu!',
    descriptionRu: 'Призывает Глаз Ктулху (Око Ночи)!',
    summonsBoss: 'eye_boss',
    color: '#991b1b',
    accent: '#f87171',
  },
  summon_brain_cthulhu: {
    id: 'summon_brain_cthulhu',
    name: 'Bloody Spine',
    nameRu: 'Кровавый хребет',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons the Brain of Cthulhu from the Crimson!',
    descriptionRu: 'Призывает Мозг Ктулху — ужас багровых недр!',
    summonsBoss: 'brain_cthulhu',
    color: '#be123c',
    accent: '#fda4af',
  },
  summon_queen_bee: {
    id: 'summon_queen_bee',
    name: 'Abeemination',
    nameRu: 'Абееминация',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons Queen Bee with rapid stinger volleys.',
    descriptionRu: 'Призывает Королеву Пчёл — стремительную хозяйку улья.',
    summonsBoss: 'queen_bee',
    color: '#eab308',
    accent: '#1e293b',
  },
  summon_deerclops: {
    id: 'summon_deerclops',
    name: 'Deer Thing',
    nameRu: 'Оленья кукла',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons Deerclops from the freezing Snow Tundra!',
    descriptionRu: 'Призывает Циклопа-Оленя из снежной вьюги!',
    summonsBoss: 'deerclops',
    color: '#38bdf8',
    accent: '#e0f2fe',
  },
  summon_wall_of_flesh: {
    id: 'summon_wall_of_flesh',
    name: 'Guide Voodoo Doll',
    nameRu: 'Кукла Вуду Гида',
    category: 'summon',
    maxStack: 20,
    description: 'Boss Summon. Summons the Wall of Flesh — Underworld guardian!',
    descriptionRu: 'Призывает Стену Плоти — гигантского хранителя преисподней!',
    summonsBoss: 'wall_of_flesh',
    color: '#7f1d1d',
    accent: '#f43f5e',
  },
  summon_queen_slime: {
    id: 'summon_queen_slime',
    name: 'Gelatin Crystal',
    nameRu: 'Желатиновый кристалл',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons winged Queen Slime!',
    descriptionRu: 'Призывает Королеву Слизней с кристальными крыльями!',
    summonsBoss: 'queen_slime',
    color: '#ec4899',
    accent: '#a5f3fc',
  },
  summon_twins: {
    id: 'summon_twins',
    name: 'Mechanical Eye',
    nameRu: 'Механический глаз',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons The Twins — Retinazer & Spazmatism!',
    descriptionRu: 'Призывает Близнецов — Ретиназера и Спазматизма!',
    summonsBoss: 'the_twins',
    color: '#475569',
    accent: '#22c55e',
  },
  summon_destroyer: {
    id: 'summon_destroyer',
    name: 'Mechanical Worm',
    nameRu: 'Механический червь',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons The Destroyer steel serpent!',
    descriptionRu: 'Призывает Уничтожителя — гигантского стального змея!',
    summonsBoss: 'the_destroyer',
    color: '#334155',
    accent: '#ef4444',
  },
  summon_skeletron_prime: {
    id: 'summon_skeletron_prime',
    name: 'Mechanical Skull',
    nameRu: 'Механический череп',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons Skeletron Prime with 4 steel arms!',
    descriptionRu: 'Призывает Скелетрона Прайма с 4 стальными руками!',
    summonsBoss: 'skeletron_prime',
    color: '#64748b',
    accent: '#f87171',
  },
  summon_plantera: {
    id: 'summon_plantera',
    name: "Plantera's Bulb",
    nameRu: 'Бутон Плантеры',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons Plantera, ferocious floral terror!',
    descriptionRu: 'Призывает Плантеру — яростный цветок джунглей!',
    summonsBoss: 'plantera',
    color: '#db2777',
    accent: '#4ade80',
  },
  summon_golem: {
    id: 'summon_golem',
    name: 'Lihzahrd Power Cell',
    nameRu: 'Ядро Голема',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Awakens the ancient Temple Golem!',
    descriptionRu: 'Призывает древнего каменного Голема храма!',
    summonsBoss: 'golem',
    color: '#92400e',
    accent: '#facc15',
  },
  summon_duke_fishron: {
    id: 'summon_duke_fishron',
    name: 'Truffle Worm',
    nameRu: 'Трюфельный червь',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons Duke Fishron, terror of the Ocean!',
    descriptionRu: 'Призывает Герцога Рыброна — повелителя морских бурь!',
    summonsBoss: 'duke_fishron',
    color: '#0d9488',
    accent: '#67e8f9',
  },
  summon_empress_light: {
    id: 'summon_empress_light',
    name: 'Prismatic Lacewing',
    nameRu: 'Призматическая златоглазка',
    category: 'summon',
    maxStack: 20,
    description: 'Hardmode Boss Summon. Summons Empress of Light with rainbow bolts!',
    descriptionRu: 'Призывает Императрицу Света с радужными лучами!',
    summonsBoss: 'empress_light',
    color: '#f472b6',
    accent: '#fde047',
  },
  summon_cultist: {
    id: 'summon_cultist',
    name: 'Ancient Cultist Tablet',
    nameRu: 'Небесная печать Культиста',
    category: 'summon',
    maxStack: 20,
    description: 'Lunar Progression. Defeating Lunatic Cultist spawns the 4 Celestial Pillars!',
    descriptionRu: 'Призывает Культиста-Лунатика! Победа над ним открывает 4 Небесные Башни!',
    summonsBoss: 'lunatic_cultist',
    color: '#1d4ed8',
    accent: '#fde047',
  },
  summon_pillars: {
    id: 'summon_pillars',
    name: 'Lunar Pillar Beacon',
    nameRu: 'Маяк 4 Небесных Башен',
    category: 'summon',
    maxStack: 10,
    specialKind: 'lunar_sigil',
    description: 'Event Summon. Immediately spawns all 4 Celestial Pillars across the surface!',
    descriptionRu: 'Событие. Мгновенно призывает все 4 Небесные Башни на поверхности!',
    color: '#6d28d9',
    accent: '#38bdf8',
  },
  summon_moon_lord: {
    id: 'summon_moon_lord',
    name: 'Celestial Sigil',
    nameRu: 'Сигил Лунного Лорда',
    category: 'summon',
    maxStack: 20,
    description: 'Final Boss Summon. Directly summons the Moon Lord!',
    descriptionRu: 'Призывает финального босса Террарии — Лунного Лорда!',
    summonsBoss: 'moon_lord',
    color: '#0f766e',
    accent: '#5eead4',
  },
  summon_alien_invasion: {
    id: 'summon_alien_invasion',
    name: 'Martian Cat Probe',
    nameRu: 'Марсианский Кото-Зонд',
    category: 'summon',
    maxStack: 10,
    specialKind: 'alien_probe',
    textureSrc: '/assets/aistudio/dsad_302645e2.jpg',
    description: 'Invasion Event. Triggers the Alien Cat Invasion with UFOs & Martian Saucers!',
    descriptionRu: 'Событие. Запускает Нашествие Инопланетных Котов с НЛО и тарелками!',
    color: '#22c55e',
    accent: '#86efac',
  },
};

export const RECIPES: CraftingRecipe[] = [
  // === HAND CRAFTING ===
  {
    id: 'craft_planks',
    resultId: 'planks_block',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'wood_log', count: 1 }],
  },
  {
    id: 'craft_planks_crimson',
    resultId: 'planks_block',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'crimson_wood', count: 1 }],
  },
  {
    id: 'craft_wood_from_cactus',
    resultId: 'planks_block',
    resultCount: 3,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'cactus_block', count: 1 }],
  },
  {
    id: 'craft_workbench',
    resultId: 'workbench_item',
    resultCount: 1,
    station: 'hand',
    category: 'stations',
    ingredients: [{ itemId: 'wood_log', count: 4 }],
  },
  {
    id: 'craft_torch_coal',
    resultId: 'torch_item',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [
      { itemId: 'wood_log', count: 1 },
      { itemId: 'coal_ore', count: 1 },
    ],
  },
  {
    id: 'craft_torch_gel',
    resultId: 'torch_item',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [
      { itemId: 'wood_log', count: 1 },
      { itemId: 'slime_gel', count: 1 },
    ],
  },
  {
    id: 'craft_platform',
    resultId: 'platform_block',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 1 }],
  },
  {
    id: 'craft_wood_beam',
    resultId: 'wood_beam',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 1 }],
  },
  {
    id: 'craft_wood_wall',
    resultId: 'wood_wall',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 1 }],
  },
  {
    id: 'craft_wood_sword',
    resultId: 'wood_sword',
    resultCount: 1,
    station: 'hand',
    category: 'weapons',
    ingredients: [{ itemId: 'wood_log', count: 4 }],
  },
  {
    id: 'craft_stool',
    resultId: 'stool_item',
    resultCount: 1,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 4 }],
  },
  {
    id: 'craft_table',
    resultId: 'table_item',
    resultCount: 1,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 4 }],
  },
  {
    id: 'craft_chair',
    resultId: 'chair_item',
    resultCount: 1,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 2 }],
  },
  {
    id: 'craft_rope',
    resultId: 'rope_item',
    resultCount: 8,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'slime_gel', count: 1 }],
  },
  {
    id: 'craft_house_blueprint',
    resultId: 'house_blueprint',
    resultCount: 1,
    station: 'hand',
    category: 'building',
    ingredients: [
      { itemId: 'planks_block', count: 8 },
      { itemId: 'torch_item', count: 2 },
    ],
  },

  // === WORKBENCH: STATIONS & BLOCKS ===
  {
    id: 'craft_furnace',
    resultId: 'furnace_item',
    resultCount: 1,
    station: 'workbench',
    category: 'stations',
    ingredients: [
      { itemId: 'stone_block', count: 8 },
      { itemId: 'coal_ore', count: 2 },
    ],
  },
  {
    id: 'craft_anvil',
    resultId: 'anvil_item',
    resultCount: 1,
    station: 'workbench',
    category: 'stations',
    ingredients: [{ itemId: 'iron_bar', count: 3 }],
  },
  {
    id: 'craft_chest',
    resultId: 'chest_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'planks_block', count: 6 },
      { itemId: 'iron_bar', count: 1 },
    ],
  },
  {
    id: 'craft_door',
    resultId: 'door_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 4 }],
  },
  {
    id: 'craft_stone_wall',
    resultId: 'stone_wall',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'stone_block', count: 1 }],
  },
  {
    id: 'craft_snow_wall',
    resultId: 'snow_wall',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'snow_block', count: 1 }],
  },
  {
    id: 'craft_crimson_wall',
    resultId: 'crimson_wall',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'crimstone_block', count: 1 }],
  },
  {
    id: 'craft_marble_wall',
    resultId: 'marble_wall',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'marble_block', count: 1 }],
  },
  {
    id: 'craft_sandstone_wall',
    resultId: 'sandstone_wall',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'sandstone_brick', count: 1 }],
  },
  {
    id: 'craft_brick',
    resultId: 'brick_block',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'stone_block', count: 2 },
      { itemId: 'dirt_block', count: 1 },
    ],
  },
  {
    id: 'craft_snow_brick',
    resultId: 'snow_brick',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'snow_block', count: 2 },
      { itemId: 'ice_block', count: 1 },
    ],
  },
  {
    id: 'craft_crimson_brick',
    resultId: 'crimson_brick',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'crimstone_block', count: 2 }],
  },
  {
    id: 'craft_sandstone_brick',
    resultId: 'sandstone_brick',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'sand_block', count: 2 }],
  },
  {
    id: 'craft_roof',
    resultId: 'roof_tile',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'brick_block', count: 2 },
      { itemId: 'planks_block', count: 1 },
    ],
  },
  {
    id: 'craft_bed',
    resultId: 'bed_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'planks_block', count: 6 },
      { itemId: 'slime_gel', count: 3 },
    ],
  },

  // === FURNACE: SMELTING ===
  {
    id: 'smelt_copper',
    resultId: 'copper_bar',
    resultCount: 2,
    station: 'furnace',
    category: 'stations',
    ingredients: [{ itemId: 'copper_ore', count: 2 }],
  },
  {
    id: 'smelt_iron',
    resultId: 'iron_bar',
    resultCount: 1,
    station: 'furnace',
    category: 'stations',
    ingredients: [
      { itemId: 'iron_ore', count: 2 },
      { itemId: 'coal_ore', count: 1 },
    ],
  },
  {
    id: 'smelt_gold',
    resultId: 'gold_bar',
    resultCount: 1,
    station: 'furnace',
    category: 'stations',
    ingredients: [
      { itemId: 'gold_ore', count: 2 },
      { itemId: 'coal_ore', count: 1 },
    ],
  },
  {
    id: 'smelt_glass',
    resultId: 'glass_block',
    resultCount: 4,
    station: 'furnace',
    category: 'building',
    ingredients: [{ itemId: 'sand_block', count: 2 }],
  },
  {
    id: 'smelt_glass_stone',
    resultId: 'glass_block',
    resultCount: 4,
    station: 'furnace',
    category: 'building',
    ingredients: [
      { itemId: 'stone_block', count: 2 },
      { itemId: 'coal_ore', count: 1 },
    ],
  },

  // === PICKAXES ===
  {
    id: 'craft_copper_pickaxe',
    resultId: 'copper_pickaxe',
    resultCount: 1,
    station: 'workbench',
    category: 'tools',
    ingredients: [
      { itemId: 'copper_bar', count: 3 },
      { itemId: 'wood_log', count: 2 },
    ],
  },
  {
    id: 'craft_iron_pickaxe',
    resultId: 'iron_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'iron_bar', count: 3 },
      { itemId: 'wood_log', count: 2 },
    ],
  },
  {
    id: 'craft_ice_pickaxe',
    resultId: 'ice_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'ice_block', count: 6 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_gold_pickaxe',
    resultId: 'gold_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_crimson_pickaxe',
    resultId: 'crimson_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'crimstone_block', count: 8 },
      { itemId: 'gold_bar', count: 3 },
    ],
  },
  {
    id: 'craft_obsidian_pickaxe',
    resultId: 'obsidian_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'obsidian_block', count: 6 },
      { itemId: 'crystal_block', count: 3 },
    ],
  },
  {
    id: 'craft_lunar_pickaxe',
    resultId: 'lunar_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'solar_fragment', count: 4 },
      { itemId: 'vortex_fragment', count: 4 },
      { itemId: 'gold_bar', count: 4 },
    ],
  },

  // === WEAPONS ===
  {
    id: 'craft_copper_sword',
    resultId: 'copper_sword',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'copper_bar', count: 3 },
      { itemId: 'wood_log', count: 2 },
    ],
  },
  {
    id: 'craft_wood_bow',
    resultId: 'wood_bow',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'wood_log', count: 4 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_copper_bow',
    resultId: 'copper_bow',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'copper_bar', count: 3 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_fish_boomerang',
    resultId: 'fish_boomerang',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'planks_block', count: 4 },
      { itemId: 'crispy_fish', count: 1 },
    ],
  },
  {
    id: 'craft_yarn_bomb',
    resultId: 'yarn_bomb',
    resultCount: 6,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'slime_gel', count: 3 },
      { itemId: 'coal_ore', count: 1 },
    ],
  },
  {
    id: 'craft_ice_blade',
    resultId: 'ice_blade',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'ice_block', count: 6 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_ice_bow',
    resultId: 'ice_bow',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'ice_block', count: 6 },
      { itemId: 'copper_bar', count: 2 },
    ],
  },
  {
    id: 'craft_iron_broadsword',
    resultId: 'iron_broadsword',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'wood_log', count: 2 },
    ],
  },
  {
    id: 'craft_fish_spear',
    resultId: 'fish_spear',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'iron_bar', count: 3 },
      { itemId: 'monster_bone', count: 2 },
    ],
  },
  {
    id: 'craft_crimson_katana',
    resultId: 'crimson_katana',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'crimstone_block', count: 8 },
      { itemId: 'iron_bar', count: 3 },
    ],
  },
  {
    id: 'craft_crimson_bow',
    resultId: 'crimson_bow',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'crimstone_block', count: 8 },
      { itemId: 'crimson_wood', count: 4 },
    ],
  },
  {
    id: 'craft_gold_claymore',
    resultId: 'gold_claymore',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_gold_bow',
    resultId: 'gold_bow',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'monster_bone', count: 2 },
    ],
  },
  {
    id: 'craft_crystal_bow',
    resultId: 'crystal_bow',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'crystal_block', count: 4 },
      { itemId: 'gold_bar', count: 3 },
    ],
  },
  {
    id: 'craft_fire_staff',
    resultId: 'fire_staff',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 3 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_frost_wand',
    resultId: 'frost_wand',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'ice_block', count: 5 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_laser_pointer',
    resultId: 'laser_pointer',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 3 },
      { itemId: 'ruby_gem', count: 2 },
    ],
  },
  {
    id: 'craft_ruby_greatsword',
    resultId: 'ruby_greatsword',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'ruby_gem', count: 2 },
    ],
  },
  {
    id: 'craft_obsidian_nightblade',
    resultId: 'obsidian_nightblade',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'obsidian_block', count: 6 },
      { itemId: 'crystal_block', count: 4 },
    ],
  },
  {
    id: 'craft_meowmere_blade',
    resultId: 'meowmere_blade',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'terra_blade', count: 1 },
      { itemId: 'nebula_fragment', count: 5 },
      { itemId: 'stardust_fragment', count: 5 },
    ],
  },

  // === FOOD, POTIONS & SUMMONERS ===
  {
    id: 'craft_warm_milk',
    resultId: 'warm_milk',
    resultCount: 2,
    station: 'hand',
    category: 'potions',
    ingredients: [
      { itemId: 'crispy_fish', count: 1 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_catnip_elixir',
    resultId: 'catnip_elixir',
    resultCount: 1,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'slime_gel', count: 4 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_healing_cactus',
    resultId: 'healing_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'cactus_block', count: 2 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_summon_king_slime',
    resultId: 'summon_king_slime',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'slime_gel', count: 8 },
      { itemId: 'gold_bar', count: 1 },
    ],
  },
  {
    id: 'craft_summon_kotulhu',
    resultId: 'summon_kotulhu',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'slime_gel', count: 4 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_summon_cat_worm',
    resultId: 'summon_cat_worm',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'monster_bone', count: 4 },
      { itemId: 'slime_gel', count: 4 },
    ],
  },
  {
    id: 'craft_summon_pharaoh_cat',
    resultId: 'summon_pharaoh_cat',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'sandstone_brick', count: 6 },
      { itemId: 'gold_bar', count: 2 },
    ],
  },
  {
    id: 'craft_summon_jester_cat',
    resultId: 'summon_jester_cat',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'slime_gel', count: 4 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_summon_sun_cat',
    resultId: 'summon_sun_cat',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'fallen_star', count: 3 },
      { itemId: 'gold_bar', count: 3 },
    ],
  },
  {
    id: 'craft_summon_atomic_cat',
    resultId: 'summon_atomic_cat',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'dynamite', count: 3 },
      { itemId: 'crystal_block', count: 3 },
    ],
  },
  {
    id: 'craft_summon_party_cat',
    resultId: 'summon_party_cat',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'crispy_fish', count: 2 },
      { itemId: 'fallen_star', count: 2 },
    ],
  },
  {
    id: 'craft_summon_melon_bandit',
    resultId: 'summon_melon_bandit',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'cactus_block', count: 4 },
      { itemId: 'gold_bar', count: 2 },
    ],
  },
  {
    id: 'craft_summon_alien_invasion',
    resultId: 'summon_alien_invasion',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'crystal_block', count: 4 },
    ],
  },
  {
    id: 'craft_summon_skele_cat',
    resultId: 'summon_skele_cat',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'monster_bone', count: 8 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_summon_eye_boss',
    resultId: 'summon_eye_boss',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'slime_gel', count: 6 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_summon_brain_cthulhu',
    resultId: 'summon_brain_cthulhu',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'crimstone_block', count: 6 },
      { itemId: 'monster_bone', count: 3 },
    ],
  },
  {
    id: 'craft_summon_queen_bee',
    resultId: 'summon_queen_bee',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'gold_bar', count: 2 },
      { itemId: 'slime_gel', count: 5 },
    ],
  },
  {
    id: 'craft_summon_deerclops',
    resultId: 'summon_deerclops',
    resultCount: 1,
    station: 'workbench',
    category: 'summons',
    ingredients: [
      { itemId: 'ice_block', count: 6 },
      { itemId: 'monster_bone', count: 3 },
    ],
  },
  {
    id: 'craft_summon_wall_of_flesh',
    resultId: 'summon_wall_of_flesh',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'obsidian_block', count: 5 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_summon_queen_slime',
    resultId: 'summon_queen_slime',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'crystal_block', count: 4 },
      { itemId: 'slime_gel', count: 6 },
    ],
  },
  {
    id: 'craft_summon_twins',
    resultId: 'summon_twins',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'ruby_gem', count: 2 },
    ],
  },
  {
    id: 'craft_summon_destroyer',
    resultId: 'summon_destroyer',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'iron_bar', count: 5 },
      { itemId: 'monster_bone', count: 4 },
    ],
  },
  {
    id: 'craft_summon_skeletron_prime',
    resultId: 'summon_skeletron_prime',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'obsidian_block', count: 4 },
    ],
  },
  {
    id: 'craft_summon_plantera',
    resultId: 'summon_plantera',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'crystal_block', count: 4 },
      { itemId: 'wood_log', count: 4 },
    ],
  },
  {
    id: 'craft_summon_golem',
    resultId: 'summon_golem',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'obsidian_block', count: 6 },
      { itemId: 'gold_bar', count: 3 },
    ],
  },
  {
    id: 'craft_summon_duke_fishron',
    resultId: 'summon_duke_fishron',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'crispy_fish', count: 3 },
      { itemId: 'crystal_block', count: 3 },
    ],
  },
  {
    id: 'craft_summon_empress_light',
    resultId: 'summon_empress_light',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'fallen_star', count: 4 },
      { itemId: 'crystal_block', count: 4 },
    ],
  },
  {
    id: 'craft_summon_cultist',
    resultId: 'summon_cultist',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'obsidian_block', count: 4 },
      { itemId: 'fallen_star', count: 4 },
    ],
  },
  {
    id: 'craft_summon_pillars',
    resultId: 'summon_pillars',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'crystal_block', count: 4 },
      { itemId: 'obsidian_block', count: 4 },
      { itemId: 'fallen_star', count: 3 },
    ],
  },
  {
    id: 'craft_summon_moon_lord',
    resultId: 'summon_moon_lord',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'solar_fragment', count: 3 },
      { itemId: 'vortex_fragment', count: 3 },
      { itemId: 'nebula_fragment', count: 3 },
    ],
  },
  {
    id: 'craft_summon_moon_lord_alt',
    resultId: 'summon_moon_lord',
    resultCount: 1,
    station: 'anvil',
    category: 'summons',
    ingredients: [
      { itemId: 'crystal_block', count: 6 },
      { itemId: 'fallen_star', count: 6 },
      { itemId: 'ruby_gem', count: 3 },
    ],
  },

  // === TERRARIA EXTRAS ===
  {
    id: 'craft_chandelier',
    resultId: 'chandelier_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'copper_bar', count: 2 },
      { itemId: 'torch_item', count: 3 },
    ],
  },
  {
    id: 'craft_bookshelf',
    resultId: 'bookshelf_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 6 }],
  },
  {
    id: 'craft_mana_crystal',
    resultId: 'mana_crystal',
    resultCount: 1,
    station: 'hand',
    category: 'potions',
    ingredients: [{ itemId: 'fallen_star', count: 3 }],
  },
  {
    id: 'craft_healing_potion',
    resultId: 'healing_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'slime_gel', count: 3 },
      { itemId: 'crispy_fish', count: 1 },
    ],
  },
  {
    id: 'craft_mana_potion',
    resultId: 'mana_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'fallen_star', count: 1 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_grappling_hook',
    resultId: 'grappling_hook',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'iron_bar', count: 3 },
      { itemId: 'rope_item', count: 5 },
    ],
  },
  {
    id: 'craft_magic_mirror',
    resultId: 'magic_mirror',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'glass_block', count: 4 },
      { itemId: 'fallen_star', count: 2 },
    ],
  },
  {
    id: 'craft_terraria_bomb',
    resultId: 'terraria_bomb',
    resultCount: 5,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'iron_ore', count: 1 },
      { itemId: 'coal_ore', count: 2 },
    ],
  },
  {
    id: 'craft_dynamite',
    resultId: 'dynamite',
    resultCount: 2,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'terraria_bomb', count: 2 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_starfury',
    resultId: 'starfury',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'fallen_star', count: 4 },
    ],
  },
  {
    id: 'craft_water_bolt',
    resultId: 'water_bolt',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'crystal_block', count: 3 },
      { itemId: 'fallen_star', count: 2 },
    ],
  },
  {
    id: 'craft_terra_blade',
    resultId: 'terra_blade',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'obsidian_nightblade', count: 1 },
      { itemId: 'crystal_block', count: 6 },
      { itemId: 'ruby_gem', count: 2 },
    ],
  },

  // === ARMOR SETS & ACCESSORIES ===
  {
    id: 'craft_wood_helmet',
    resultId: 'wood_helmet',
    resultCount: 1,
    station: 'workbench',
    category: 'armor',
    ingredients: [{ itemId: 'wood_log', count: 5 }],
  },
  {
    id: 'craft_wood_chestplate',
    resultId: 'wood_chestplate',
    resultCount: 1,
    station: 'workbench',
    category: 'armor',
    ingredients: [{ itemId: 'wood_log', count: 7 }],
  },
  {
    id: 'craft_wood_greaves',
    resultId: 'wood_greaves',
    resultCount: 1,
    station: 'workbench',
    category: 'armor',
    ingredients: [{ itemId: 'wood_log', count: 6 }],
  },
  {
    id: 'craft_copper_helmet',
    resultId: 'copper_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'copper_bar', count: 4 }],
  },
  {
    id: 'craft_copper_chestplate',
    resultId: 'copper_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'copper_bar', count: 6 }],
  },
  {
    id: 'craft_copper_greaves',
    resultId: 'copper_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'copper_bar', count: 5 }],
  },
  {
    id: 'craft_iron_helmet',
    resultId: 'iron_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'iron_bar', count: 4 }],
  },
  {
    id: 'craft_iron_chestplate',
    resultId: 'iron_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'iron_bar', count: 6 }],
  },
  {
    id: 'craft_iron_greaves',
    resultId: 'iron_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'iron_bar', count: 5 }],
  },
  {
    id: 'craft_gold_helmet',
    resultId: 'gold_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'gold_bar', count: 4 }],
  },
  {
    id: 'craft_gold_chestplate',
    resultId: 'gold_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'gold_bar', count: 6 }],
  },
  {
    id: 'craft_gold_greaves',
    resultId: 'gold_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'gold_bar', count: 5 }],
  },
  {
    id: 'craft_crimson_helmet',
    resultId: 'crimson_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'crimstone_block', count: 6 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_crimson_chestplate',
    resultId: 'crimson_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'crimstone_block', count: 8 },
      { itemId: 'iron_bar', count: 3 },
    ],
  },
  {
    id: 'craft_crimson_greaves',
    resultId: 'crimson_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'crimstone_block', count: 7 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_obsidian_helmet',
    resultId: 'obsidian_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'obsidian_block', count: 5 },
      { itemId: 'gold_bar', count: 2 },
    ],
  },
  {
    id: 'craft_obsidian_chestplate',
    resultId: 'obsidian_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'obsidian_block', count: 7 },
      { itemId: 'gold_bar', count: 3 },
    ],
  },
  {
    id: 'craft_obsidian_greaves',
    resultId: 'obsidian_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'obsidian_block', count: 6 },
      { itemId: 'gold_bar', count: 2 },
    ],
  },
  {
    id: 'craft_crystal_helmet',
    resultId: 'crystal_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'crystal_block', count: 5 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_crystal_chestplate',
    resultId: 'crystal_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'crystal_block', count: 7 },
      { itemId: 'ruby_gem', count: 2 },
    ],
  },
  {
    id: 'craft_crystal_greaves',
    resultId: 'crystal_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'crystal_block', count: 6 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_shackle',
    resultId: 'shackle',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'iron_bar', count: 3 }],
  },
  {
    id: 'craft_cobalt_shield',
    resultId: 'cobalt_shield',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'crystal_block', count: 2 },
    ],
  },
  {
    id: 'craft_mana_flower',
    resultId: 'mana_flower',
    resultCount: 1,
    station: 'workbench',
    category: 'armor',
    ingredients: [
      { itemId: 'fallen_star', count: 3 },
      { itemId: 'mana_potion', count: 2 },
    ],
  },
  {
    id: 'craft_angel_wings',
    resultId: 'angel_wings',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'fallen_star', count: 5 },
      { itemId: 'crystal_block', count: 4 },
    ],
  },
  {
    id: 'craft_celestial_emblem',
    resultId: 'celestial_emblem',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'ruby_gem', count: 2 },
      { itemId: 'crystal_block', count: 4 },
    ],
  },

  // === HELLSTONE, ZENITH, TERRARIA GEAR & POTIONS ===
  {
    id: 'smelt_hellstone_bar',
    resultId: 'hellstone_bar',
    resultCount: 1,
    station: 'furnace',
    category: 'stations',
    ingredients: [
      { itemId: 'hellstone_ore', count: 2 },
      { itemId: 'obsidian_block', count: 1 },
    ],
  },
  {
    id: 'craft_campfire',
    resultId: 'campfire_item',
    resultCount: 1,
    station: 'hand',
    category: 'building',
    ingredients: [
      { itemId: 'wood_log', count: 4 },
      { itemId: 'torch_item', count: 2 },
    ],
  },
  {
    id: 'craft_heart_lantern',
    resultId: 'heart_lantern_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'life_crystal', count: 1 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_sunflower',
    resultId: 'sunflower_item',
    resultCount: 2,
    station: 'hand',
    category: 'building',
    ingredients: [
      { itemId: 'dirt_block', count: 2 },
      { itemId: 'fallen_star', count: 1 },
    ],
  },
  {
    id: 'craft_enchanted_sword',
    resultId: 'enchanted_sword',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'fallen_star', count: 3 },
    ],
  },
  {
    id: 'craft_demon_scythe',
    resultId: 'demon_scythe',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'hellstone_bar', count: 4 },
      { itemId: 'obsidian_block', count: 4 },
    ],
  },
  {
    id: 'craft_vampire_knives',
    resultId: 'vampire_knives',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'crimson_brick', count: 8 },
      { itemId: 'ruby_gem', count: 3 },
      { itemId: 'hellstone_bar', count: 3 },
    ],
  },
  {
    id: 'craft_megashark',
    resultId: 'megashark',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'minishark', count: 1 },
      { itemId: 'iron_bar', count: 6 },
      { itemId: 'crystal_block', count: 4 },
    ],
  },
  {
    id: 'craft_sdmg',
    resultId: 'sdmg',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'megashark', count: 1 },
      { itemId: 'vortex_fragment', count: 6 },
      { itemId: 'stardust_fragment', count: 4 },
    ],
  },
  {
    id: 'craft_star_wrath',
    resultId: 'star_wrath',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'starfury', count: 1 },
      { itemId: 'fallen_star', count: 8 },
      { itemId: 'nebula_fragment', count: 4 },
    ],
  },
  {
    id: 'craft_zenith',
    resultId: 'zenith',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'terra_blade', count: 1 },
      { itemId: 'meowmere_blade', count: 1 },
      { itemId: 'star_wrath', count: 1 },
    ],
  },
  {
    id: 'craft_molten_helmet',
    resultId: 'molten_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'hellstone_bar', count: 5 }],
  },
  {
    id: 'craft_molten_chestplate',
    resultId: 'molten_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'hellstone_bar', count: 7 }],
  },
  {
    id: 'craft_molten_greaves',
    resultId: 'molten_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [{ itemId: 'hellstone_bar', count: 6 }],
  },
  {
    id: 'craft_hallowed_helmet',
    resultId: 'hallowed_helmet',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'gold_bar', count: 6 },
      { itemId: 'crystal_block', count: 5 },
      { itemId: 'fallen_star', count: 3 },
    ],
  },
  {
    id: 'craft_hallowed_chestplate',
    resultId: 'hallowed_chestplate',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'gold_bar', count: 8 },
      { itemId: 'crystal_block', count: 7 },
      { itemId: 'fallen_star', count: 4 },
    ],
  },
  {
    id: 'craft_hallowed_greaves',
    resultId: 'hallowed_greaves',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'gold_bar', count: 6 },
      { itemId: 'crystal_block', count: 5 },
      { itemId: 'fallen_star', count: 3 },
    ],
  },
  {
    id: 'craft_terraspark_boots',
    resultId: 'terraspark_boots',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'hermes_boots', count: 1 },
      { itemId: 'hellstone_bar', count: 3 },
      { itemId: 'lucky_horseshoe', count: 1 },
    ],
  },
  {
    id: 'craft_ankh_shield',
    resultId: 'ankh_shield',
    resultCount: 1,
    station: 'anvil',
    category: 'armor',
    ingredients: [
      { itemId: 'cobalt_shield', count: 1 },
      { itemId: 'milk_potion', count: 2 },
      { itemId: 'gold_bar', count: 4 },
    ],
  },
  {
    id: 'craft_milk_potion',
    resultId: 'milk_potion',
    resultCount: 2,
    station: 'hand',
    category: 'potions',
    ingredients: [
      { itemId: 'warm_milk', count: 1 },
      { itemId: 'slime_gel', count: 1 },
    ],
  },
  {
    id: 'craft_red_potion',
    resultId: 'red_potion',
    resultCount: 1,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'healing_potion', count: 1 },
      { itemId: 'crimstone_block', count: 2 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_ironskin_potion',
    resultId: 'ironskin_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'iron_ore', count: 2 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_regen_potion',
    resultId: 'regen_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'healing_potion', count: 1 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_swiftness_potion',
    resultId: 'swiftness_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'cactus_block', count: 2 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_magic_power_potion',
    resultId: 'magic_power_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'fallen_star', count: 1 },
      { itemId: 'mana_potion', count: 1 },
    ],
  },
  {
    id: 'craft_featherfall_potion',
    resultId: 'featherfall_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'fallen_star', count: 1 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_wrath_potion',
    resultId: 'wrath_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'crimstone_block', count: 3 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_obsidian_skin_potion',
    resultId: 'obsidian_skin_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'obsidian_block', count: 2 },
      { itemId: 'coal_ore', count: 2 },
    ],
  },
  {
    id: 'craft_shine_potion',
    resultId: 'shine_potion',
    resultCount: 2,
    station: 'hand',
    category: 'potions',
    ingredients: [
      { itemId: 'torch_item', count: 3 },
      { itemId: 'slime_gel', count: 1 },
    ],
  },
  {
    id: 'craft_heartreach_potion',
    resultId: 'heartreach_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'ruby_gem', count: 1 },
      { itemId: 'slime_gel', count: 2 },
    ],
  },
  {
    id: 'craft_recall_potion',
    resultId: 'recall_potion',
    resultCount: 2,
    station: 'workbench',
    category: 'potions',
    ingredients: [
      { itemId: 'fallen_star', count: 1 },
      { itemId: 'crystal_block', count: 1 },
    ],
  },
];

export const STATION_NAMES: Record<CraftingStation, string> = {
  hand: 'By Hand',
  workbench: 'Workbench',
  furnace: 'Furnace',
  anvil: 'Anvil',
};

export function getItemName(itemOrId: string | ItemDef, lang: Language = 'en'): string {
  const def = typeof itemOrId === 'string' ? ITEMS[itemOrId] : itemOrId;
  if (!def) return typeof itemOrId === 'string' ? itemOrId : '';
  return lang === 'ru' && def.nameRu ? def.nameRu : def.name;
}

export function getItemDescription(itemOrId: string | ItemDef, lang: Language = 'en'): string {
  const def = typeof itemOrId === 'string' ? ITEMS[itemOrId] : itemOrId;
  if (!def) return '';
  return lang === 'ru' && def.descriptionRu ? def.descriptionRu : def.description;
}

export function getStationName(station: CraftingStation, lang: Language = 'en'): string {
  if (lang === 'ru') {
    const ruMap: Record<CraftingStation, string> = {
      hand: 'В лапах',
      workbench: 'Верстак',
      furnace: 'Печь',
      anvil: 'Наковальня',
    };
    return ruMap[station];
  }
  return STATION_NAMES[station];
}

export const HOTBAR_SIZE = 9;
export const BACKPACK_SIZE = 54;

export function createStarterInventory(): {
  hotbar: (InventorySlot | null)[];
  backpack: (InventorySlot | null)[];
} {
  const hotbar: (InventorySlot | null)[] = new Array(HOTBAR_SIZE).fill(null);
  const backpack: (InventorySlot | null)[] = new Array(BACKPACK_SIZE).fill(null);

  hotbar[0] = { itemId: 'zazu_sword', count: 1 };
  hotbar[1] = { itemId: 'wood_pickaxe', count: 1 };
  hotbar[2] = { itemId: 'wood_bow', count: 1 };
  hotbar[3] = { itemId: 'planks_block', count: 48 };
  hotbar[4] = { itemId: 'wood_wall', count: 36 };
  hotbar[5] = { itemId: 'torch_item', count: 12 };
  hotbar[6] = { itemId: 'door_item', count: 2 };
  hotbar[7] = { itemId: 'workbench_item', count: 1 };
  hotbar[8] = { itemId: 'crispy_fish', count: 5 };

  backpack[0] = { itemId: 'stone_block', count: 24 };
  backpack[1] = { itemId: 'roof_tile', count: 20 };
  backpack[2] = { itemId: 'glass_block', count: 8 };
  backpack[3] = { itemId: 'platform_block', count: 12 };
  backpack[4] = { itemId: 'yarn_bomb', count: 6 };
  backpack[5] = { itemId: 'wood_log', count: 8 };
  backpack[6] = { itemId: 'coal_ore', count: 4 };
  backpack[7] = { itemId: 'stool_item', count: 1 };
  backpack[8] = { itemId: 'house_blueprint', count: 1 };
  backpack[9] = { itemId: 'table_item', count: 2 };
  backpack[10] = { itemId: 'chair_item', count: 2 };
  backpack[11] = { itemId: 'rope_item', count: 16 };

  return { hotbar, backpack };
}

export function dropFromSlot(
  slots: (InventorySlot | null)[],
  index: number,
  amount: number | 'all' = 1,
): { itemId: string; droppedCount: number } | null {
  if (index < 0 || index >= slots.length) return null;
  const slot = slots[index];
  if (!slot || slot.count <= 0) return null;

  const toDrop = amount === 'all' ? slot.count : Math.min(slot.count, Math.max(1, Math.floor(amount)));
  const itemId = slot.itemId;
  slot.count -= toDrop;
  if (slot.count <= 0) {
    slots[index] = null;
  }
  return { itemId, droppedCount: toDrop };
}

export function countUsedSlots(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
): { used: number; total: number } {
  let used = 0;
  for (const s of hotbar) if (s) used++;
  for (const s of backpack) if (s) used++;
  return { used, total: hotbar.length + backpack.length };
}

export function countItemInInventory(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  itemId: string,
): number {
  let total = 0;
  for (const s of hotbar) {
    if (s && s.itemId === itemId) total += s.count;
  }
  for (const s of backpack) {
    if (s && s.itemId === itemId) total += s.count;
  }
  return total;
}

export function addItemToInventory(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  itemId: string,
  amount: number,
): number {
  const def = ITEMS[itemId];
  if (!def || amount <= 0) return amount;
  let remaining = amount;

  const tryFillExisting = (slots: (InventorySlot | null)[]) => {
    for (let i = 0; i < slots.length && remaining > 0; i++) {
      const slot = slots[i];
      if (slot && slot.itemId === itemId && slot.count < def.maxStack) {
        const add = Math.min(remaining, def.maxStack - slot.count);
        slot.count += add;
        remaining -= add;
      }
    }
  };

  const tryFillEmpty = (slots: (InventorySlot | null)[]) => {
    for (let i = 0; i < slots.length && remaining > 0; i++) {
      if (!slots[i]) {
        const add = Math.min(remaining, def.maxStack);
        slots[i] = { itemId, count: add };
        remaining -= add;
      }
    }
  };

  tryFillExisting(hotbar);
  tryFillExisting(backpack);
  tryFillEmpty(hotbar);
  tryFillEmpty(backpack);

  return remaining;
}

export function consumeItemFromInventory(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  itemId: string,
  amount: number,
): boolean {
  if (countItemInInventory(hotbar, backpack, itemId) < amount) return false;
  let remaining = amount;

  const takeFrom = (slots: (InventorySlot | null)[]) => {
    for (let i = 0; i < slots.length && remaining > 0; i++) {
      const slot = slots[i];
      if (slot && slot.itemId === itemId) {
        const take = Math.min(remaining, slot.count);
        slot.count -= take;
        remaining -= take;
        if (slot.count <= 0) {
          slots[i] = null;
        }
      }
    }
  };

  takeFrom(backpack);
  takeFrom(hotbar);
  return true;
}

export function canCraftRecipe(
  recipe: CraftingRecipe,
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  nearbyStations: CraftingStation[],
): boolean {
  if (recipe.station !== 'hand' && !nearbyStations.includes(recipe.station)) {
    return false;
  }
  return recipe.ingredients.every(
    (ing) => countItemInInventory(hotbar, backpack, ing.itemId) >= ing.count,
  );
}

export function craftRecipe(
  recipe: CraftingRecipe,
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  nearbyStations: CraftingStation[],
): boolean {
  if (!canCraftRecipe(recipe, hotbar, backpack, nearbyStations)) {
    return false;
  }
  for (const ing of recipe.ingredients) {
    consumeItemFromInventory(hotbar, backpack, ing.itemId, ing.count);
  }
  const leftover = addItemToInventory(
    hotbar,
    backpack,
    recipe.resultId,
    recipe.resultCount,
  );
  if (leftover === recipe.resultCount) {
    for (const ing of recipe.ingredients) {
      addItemToInventory(hotbar, backpack, ing.itemId, ing.count);
    }
    return false;
  }
  return true;
}

export function tileTypeToDropItem(tile: TileType): string | null {
  switch (tile) {
    case TileType.Dirt:
    case TileType.Grass:
      return 'dirt_block';
    case TileType.Stone:
      return 'stone_block';
    case TileType.Wood:
      return 'wood_log';
    case TileType.Leaves:
      return Math.random() < 0.25 ? 'wood_log' : null;
    case TileType.Planks:
      return 'planks_block';
    case TileType.Brick:
      return 'brick_block';
    case TileType.CoalOre:
      return 'coal_ore';
    case TileType.CopperOre:
      return 'copper_ore';
    case TileType.IronOre:
      return 'iron_ore';
    case TileType.GoldOre:
      return 'gold_ore';
    case TileType.RubyOre:
      return 'ruby_gem';
    case TileType.Glass:
      return 'glass_block';
    case TileType.Platform:
      return 'platform_block';
    case TileType.Torch:
      return 'torch_item';
    case TileType.Workbench:
      return 'workbench_item';
    case TileType.Furnace:
      return 'furnace_item';
    case TileType.Anvil:
      return 'anvil_item';
    case TileType.DoorClosed:
    case TileType.DoorOpen:
      return 'door_item';
    case TileType.Bed:
      return 'bed_item';
    case TileType.RoofTile:
      return 'roof_tile';
    case TileType.Stool:
      return 'stool_item';
    case TileType.Chest:
      return 'chest_item';
    case TileType.Snow:
      return 'snow_block';
    case TileType.Ice:
      return 'ice_block';
    case TileType.SnowBrick:
      return 'snow_brick';
    case TileType.CrimsonGrass:
      return 'crimson_grass';
    case TileType.CrimsonDirt:
      return 'crimson_dirt';
    case TileType.Crimstone:
      return 'crimstone_block';
    case TileType.CrimsonBrick:
      return 'crimson_brick';
    case TileType.CrimsonWood:
      return 'crimson_wood';
    case TileType.CrimsonLeaves:
      return Math.random() < 0.25 ? 'crimson_wood' : null;
    case TileType.Sand:
      return 'sand_block';
    case TileType.SandstoneBrick:
      return 'sandstone_brick';
    case TileType.Cactus:
      return 'cactus_block';
    case TileType.Obsidian:
      return 'obsidian_block';
    case TileType.Marble:
      return 'marble_block';
    case TileType.CrystalBlock:
      return 'crystal_block';
    case TileType.WoodBeam:
      return 'wood_beam';
    case TileType.Table:
      return 'table_item';
    case TileType.Chair:
      return 'chair_item';
    case TileType.Chandelier:
      return 'chandelier_item';
    case TileType.Bookshelf:
      return 'bookshelf_item';
    case TileType.Rope:
      return 'rope_item';
    case TileType.LifeCrystal:
      return 'life_crystal';
    case TileType.PiggyBank:
      return 'piggy_bank_item';
    case TileType.Campfire:
      return 'campfire_item';
    case TileType.HeartLantern:
      return 'heart_lantern_item';
    case TileType.HellstoneOre:
      return 'hellstone_ore';
    case TileType.CrimsonAltar:
      return 'crimson_altar_item';
    case TileType.CrimsonTooth:
      return 'crimson_tooth_block';
    case TileType.Sunflower:
      return 'sunflower_item';
    default:
      return null;
  }
}

export function wallTypeToDropItem(wall: WallType): string | null {
  switch (wall) {
    case WallType.WoodWall:
      return 'wood_wall';
    case WallType.StoneWall:
      return 'stone_wall';
    case WallType.DirtWall:
      return 'dirt_block';
    case WallType.BrickWall:
      return 'brick_block';
    case WallType.SnowWall:
      return 'snow_wall';
    case WallType.CrimsonWall:
      return 'crimson_wall';
    case WallType.MarbleWall:
      return 'marble_wall';
    case WallType.SandstoneWall:
      return 'sandstone_wall';
    default:
      return null;
  }
}

export const STOOL_REPO_URL = 'https://github.com/stoolio-lox/stoolio-something.git';
export const DEBUG_PASSCODE = 'secretdev';

export function verifyDebugPassword(input: string): boolean {
  return input.trim() === DEBUG_PASSCODE;
}

export function giveDebugItem(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  itemId: string,
  rawCount: number,
  lang: Language = 'en',
): { ok: boolean; given: number; leftover: number; itemName: string } {
  const def = ITEMS[itemId];
  if (!def) {
    return { ok: false, given: 0, leftover: 0, itemName: itemId };
  }
  const safeCount = Math.max(1, Math.min(999, Math.floor(Number.isFinite(rawCount) ? rawCount : 1)));
  const leftover = addItemToInventory(hotbar, backpack, itemId, safeCount);
  const given = safeCount - leftover;
  return { ok: given > 0, given, leftover, itemName: getItemName(def, lang) };
}

export const ARMOR_SET_META: Record<
  ArmorSetId,
  { label: string; labelRu: string; color: string; accent: string; bonusText: string; bonusTextRu: string }
> = {
  wood: {
    label: 'Wood Set',
    labelRu: 'Деревянный сет',
    color: '#92400e',
    accent: '#d97706',
    bonusText: '+2 bonus Defense',
    bonusTextRu: '+2 доп. защиты',
  },
  copper: {
    label: 'Copper Set',
    labelRu: 'Медный сет',
    color: '#c2410c',
    accent: '#fdba74',
    bonusText: '+2 Defense & +8% Move Speed',
    bonusTextRu: '+2 защиты и +8% скорости бега',
  },
  iron: {
    label: 'Iron Set',
    labelRu: 'Железный сет',
    color: '#64748b',
    accent: '#e2e8f0',
    bonusText: '+3 bonus Defense',
    bonusTextRu: '+3 доп. защиты',
  },
  gold: {
    label: 'Gold Set',
    labelRu: 'Золотой сет',
    color: '#ca8a04',
    accent: '#fef08a',
    bonusText: '+4 Defense & +10% Damage',
    bonusTextRu: '+4 защиты и +10% урона',
  },
  crimson: {
    label: 'Crimson Set',
    labelRu: 'Багровый сет',
    color: '#991b1b',
    accent: '#f87171',
    bonusText: '+2.0 HP/s regeneration',
    bonusTextRu: '+2.0 HP/сек регенерации',
  },
  obsidian: {
    label: 'Obsidian Set',
    labelRu: 'Обсидиановый сет',
    color: '#312e81',
    accent: '#a78bfa',
    bonusText: '+18% Damage & No Fall Damage',
    bonusTextRu: '+18% урона и анти-падение',
  },
  crystal: {
    label: 'Crystal Set',
    labelRu: 'Кристальный сет',
    color: '#0284c7',
    accent: '#67e8f9',
    bonusText: '+25% Damage, +40 Mana & -20% Mana Cost',
    bonusTextRu: '+25% урона, +40 маны и -20% расхода маны',
  },
  molten: {
    label: 'Molten Set',
    labelRu: 'Литой сет (Molten)',
    color: '#dc2626',
    accent: '#fde047',
    bonusText: '+15% Damage & Fire Immunity',
    bonusTextRu: '+15% урона и иммунитет к огню',
  },
  hallowed: {
    label: 'Hallowed Set',
    labelRu: 'Святой сет (Hallowed)',
    color: '#eab308',
    accent: '#fef9c3',
    bonusText: '+25% Damage, +18% Speed & +2.5 HP/s',
    bonusTextRu: '+25% урона, +18% скорости и +2.5 HP/сек',
  },
};

export function getArmorSetMeta(setId: ArmorSetId, lang: Language = 'en') {
  const m = ARMOR_SET_META[setId];
  return {
    label: lang === 'ru' ? m.labelRu : m.label,
    bonusText: lang === 'ru' ? m.bonusTextRu : m.bonusText,
    color: m.color,
    accent: m.accent,
  };
}

export function createInitialEquipment(): EquipmentState {
  return {
    helmet: null,
    chestplate: null,
    greaves: null,
    accessories: [null, null, null, null, null],
  };
}

export function computeEquipmentBonuses(equipment: EquipmentState): EquipmentBonuses {
  let defense = 0;
  let speedMult = 1;
  let jumpMult = 1;
  let damageMult = 1;
  let manaCostMult = 1;
  let maxManaBonus = 0;
  let hpRegenPerSec = 0;
  let manaRegenBonus = 0;
  let hasDoubleJump = false;
  let hasWings = false;
  let hasNoFallDamage = false;
  let hasKnockbackImmune = false;
  let hasDebuffImmune = false;
  let hasFireImmune = false;

  const armorPieces = [equipment.helmet, equipment.chestplate, equipment.greaves];
  for (const piece of armorPieces) {
    if (!piece) continue;
    const def = ITEMS[piece.itemId];
    if (def?.defenseBonus) defense += def.defenseBonus;
  }

  let activeSet: ArmorSetId | null = null;
  let setBonusText: string | null = null;
  const hSet = equipment.helmet ? ITEMS[equipment.helmet.itemId]?.armorSet : undefined;
  const cSet = equipment.chestplate ? ITEMS[equipment.chestplate.itemId]?.armorSet : undefined;
  const gSet = equipment.greaves ? ITEMS[equipment.greaves.itemId]?.armorSet : undefined;

  if (hSet && hSet === cSet && cSet === gSet) {
    activeSet = hSet;
    setBonusText = ARMOR_SET_META[hSet].bonusText;
    switch (hSet) {
      case 'wood':
        defense += 2;
        break;
      case 'copper':
        defense += 2;
        speedMult += 0.08;
        break;
      case 'iron':
        defense += 3;
        break;
      case 'gold':
        defense += 4;
        damageMult += 0.1;
        break;
      case 'crimson':
        hpRegenPerSec += 2.0;
        break;
      case 'obsidian':
        damageMult += 0.18;
        hasNoFallDamage = true;
        break;
      case 'crystal':
        damageMult += 0.25;
        maxManaBonus += 40;
        manaCostMult *= 0.8;
        break;
      case 'molten':
        damageMult += 0.15;
        hasFireImmune = true;
        break;
      case 'hallowed':
        damageMult += 0.25;
        speedMult += 0.18;
        hpRegenPerSec += 2.5;
        break;
    }
  }

  const seenAccessoryIds = new Set<string>();
  for (const acc of equipment.accessories) {
    if (!acc) continue;
    const def = ITEMS[acc.itemId];
    if (!def || def.category !== 'accessory') continue;
    if (seenAccessoryIds.has(def.id)) continue;
    seenAccessoryIds.add(def.id);
    if (def.defenseBonus) defense += def.defenseBonus;

    switch (def.accessoryKind) {
      case 'cloud_bottle':
        hasDoubleJump = true;
        break;
      case 'hermes_boots':
        speedMult *= 1.38;
        break;
      case 'regen_ring':
        hpRegenPerSec += 1.8;
        break;
      case 'cobalt_shield':
        hasKnockbackImmune = true;
        break;
      case 'red_balloon':
        jumpMult *= 1.35;
        break;
      case 'shackle':
        break;
      case 'mana_flower':
        manaCostMult *= 0.75;
        manaRegenBonus += 2;
        break;
      case 'horseshoe':
        hasNoFallDamage = true;
        break;
      case 'angel_wings':
        hasWings = true;
        hasNoFallDamage = true;
        jumpMult *= 1.15;
        break;
      case 'celestial_emblem':
        damageMult += 0.15;
        maxManaBonus += 20;
        break;
      case 'bounty_badge':
        damageMult += 0.15;
        break;
      case 'terraspark_boots':
        speedMult *= 1.45;
        jumpMult *= 1.15;
        hasNoFallDamage = true;
        hasFireImmune = true;
        break;
      case 'ankh_shield':
        hasKnockbackImmune = true;
        hasDebuffImmune = true;
        break;
    }
  }

  return {
    defense,
    activeSet,
    setBonusText,
    speedMult,
    jumpMult,
    damageMult,
    manaCostMult,
    maxManaBonus,
    hpRegenPerSec,
    manaRegenBonus,
    hasDoubleJump,
    hasWings,
    hasNoFallDamage,
    hasKnockbackImmune,
    hasDebuffImmune,
    hasFireImmune,
  };
}

export function getEquipmentSlot(equipment: EquipmentState, key: EquipSlotKey): InventorySlot | null {
  if (key === 'helmet') return equipment.helmet;
  if (key === 'chestplate') return equipment.chestplate;
  if (key === 'greaves') return equipment.greaves;
  const idx = Number(key.replace('acc', ''));
  return equipment.accessories[idx] ?? null;
}

export function setEquipmentSlot(
  equipment: EquipmentState,
  key: EquipSlotKey,
  slot: InventorySlot | null,
): void {
  if (key === 'helmet') equipment.helmet = slot;
  else if (key === 'chestplate') equipment.chestplate = slot;
  else if (key === 'greaves') equipment.greaves = slot;
  else {
    const idx = Number(key.replace('acc', ''));
    if (idx >= 0 && idx < equipment.accessories.length) {
      equipment.accessories[idx] = slot;
    }
  }
}

export function equipItemFromInventory(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  equipment: EquipmentState,
  fromArea: 'hotbar' | 'backpack',
  fromIndex: number,
  targetSlotKey?: EquipSlotKey,
  lang: Language = 'en',
): { equipped: boolean; slotKey?: EquipSlotKey; reason?: string } {
  const tr = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const arr = fromArea === 'hotbar' ? hotbar : backpack;
  if (fromIndex < 0 || fromIndex >= arr.length) {
    return { equipped: false, reason: tr('Invalid inventory slot', 'Неверный слот инвентаря') };
  }
  const slot = arr[fromIndex];
  if (!slot) {
    return { equipped: false, reason: tr('Slot is empty', 'Слот пуст') };
  }
  const def = ITEMS[slot.itemId];
  if (!def) {
    return { equipped: false, reason: tr('Unknown item', 'Неизвестный предмет') };
  }

  let chosenKey: EquipSlotKey | undefined = targetSlotKey;

  if (def.category === 'armor' && def.armorSlot) {
    if (chosenKey && chosenKey !== def.armorSlot) {
      return {
        equipped: false,
        reason: tr('This armor piece does not fit that slot', 'Эта броня не подходит к этому слоту'),
      };
    }
    chosenKey = def.armorSlot;
  } else if (def.category === 'accessory') {
    if (chosenKey && !chosenKey.startsWith('acc')) {
      return {
        equipped: false,
        reason: tr('Accessories must go into accessory slots', 'Аксессуар ставится только в слот аксессуаров'),
      };
    }
    if (!chosenKey) {
      const emptyIdx = equipment.accessories.findIndex((s) => s === null);
      chosenKey = (`acc${emptyIdx >= 0 ? emptyIdx : 0}`) as EquipSlotKey;
    }
  } else {
    return {
      equipped: false,
      reason: tr('Only armor or accessories can be equipped', 'Можно надеть только броню или аксессуар'),
    };
  }

  const prevEquipped = getEquipmentSlot(equipment, chosenKey);
  setEquipmentSlot(equipment, chosenKey, { itemId: slot.itemId, count: 1 });
  arr[fromIndex] = prevEquipped ? { ...prevEquipped } : null;
  return { equipped: true, slotKey: chosenKey };
}

export function unequipItemToInventory(
  hotbar: (InventorySlot | null)[],
  backpack: (InventorySlot | null)[],
  equipment: EquipmentState,
  slotKey: EquipSlotKey,
): boolean {
  const equipped = getEquipmentSlot(equipment, slotKey);
  if (!equipped) return false;
  const leftover = addItemToInventory(hotbar, backpack, equipped.itemId, equipped.count);
  if (leftover > 0) return false;
  setEquipmentSlot(equipment, slotKey, null);
  return true;
}

export const DEBUG_CHEST_PRESETS: Record<
  DebugChestPreset,
  { label: string; labelRu: string; description: string; descriptionRu: string; items: { itemId: string; count: number }[] }
> = {
  empty: {
    label: 'Empty Chest',
    labelRu: 'Пустой сундук',
    description: 'Clean storage chest for organizing your loot.',
    descriptionRu: 'Чистый сундук для хранения вещей.',
    items: [],
  },
  summons: {
    label: 'Pre-HM Boss Summons',
    labelRu: 'Призывалки боссов (Pre-HM)',
    description: 'Starter & Pre-Hardmode boss summons, potions, and torches.',
    descriptionRu: 'Базовые призывалки, лечебные зелья и факелы.',
    items: [
      { itemId: 'summon_kotulhu', count: 3 },
      { itemId: 'summon_cat_worm', count: 3 },
      { itemId: 'summon_pharaoh_cat', count: 2 },
      { itemId: 'summon_king_slime', count: 2 },
      { itemId: 'summon_eye_boss', count: 2 },
      { itemId: 'summon_brain_cthulhu', count: 2 },
      { itemId: 'summon_queen_bee', count: 2 },
      { itemId: 'summon_deerclops', count: 2 },
      { itemId: 'summon_skele_cat', count: 2 },
      { itemId: 'summon_wall_of_flesh', count: 2 },
      { itemId: 'healing_potion', count: 8 },
      { itemId: 'torch_item', count: 25 },
    ],
  },
  bosses: {
    label: 'Hardmode & Lunar Summons',
    labelRu: 'Хардмод и Лунные призывалки',
    description: 'Mech bosses, Plantera, Golem, Fishron, Empress, Cultist, Pillars & Moon Lord.',
    descriptionRu: 'Механические боссы, Плантера, Голем, Рыброн, Императрица, Культист, Башни и Лорд.',
    items: [
      { itemId: 'summon_queen_slime', count: 2 },
      { itemId: 'summon_twins', count: 2 },
      { itemId: 'summon_destroyer', count: 2 },
      { itemId: 'summon_skeletron_prime', count: 2 },
      { itemId: 'summon_plantera', count: 2 },
      { itemId: 'summon_golem', count: 2 },
      { itemId: 'summon_duke_fishron', count: 2 },
      { itemId: 'summon_empress_light', count: 2 },
      { itemId: 'summon_cultist', count: 2 },
      { itemId: 'summon_pillars', count: 2 },
      { itemId: 'summon_moon_lord', count: 2 },
    ],
  },
  cats: {
    label: 'Meme Cat Bosses & Alien Probe',
    labelRu: 'Мемные Кото-Боссы и НЛО',
    description: 'Pharaoh Naserafal II, Alien Probe, Jester Cat, Solar Zazu, Atomic Cat, Lollipop & Wanted Cat!',
    descriptionRu: 'Насерафал II, Марсианский Зонд, Шут, Солнечный, Атомный, Леденцовый и Арбузный коты!',
    items: [
      { itemId: 'summon_pharaoh_cat', count: 3 },
      { itemId: 'summon_alien_invasion', count: 2 },
      { itemId: 'summon_jester_cat', count: 3 },
      { itemId: 'summon_sun_cat', count: 3 },
      { itemId: 'summon_atomic_cat', count: 3 },
      { itemId: 'summon_party_cat', count: 3 },
      { itemId: 'summon_melon_bandit', count: 3 },
      { itemId: 'meowmere_blade', count: 1 },
      { itemId: 'atomic_launcher', count: 1 },
      { itemId: 'alien_blaster', count: 1 },
    ],
  },
  armor: {
    label: 'Armor & Angel Wings Kit',
    labelRu: 'Набор брони и крыльев',
    description: 'Crystal armor set, Angel Wings, and top passive accessories.',
    descriptionRu: 'Кристальная броня, крылья ангела и топовые аксессуары.',
    items: [
      { itemId: 'crystal_helmet', count: 1 },
      { itemId: 'crystal_chestplate', count: 1 },
      { itemId: 'crystal_greaves', count: 1 },
      { itemId: 'angel_wings', count: 1 },
      { itemId: 'cobalt_shield', count: 1 },
      { itemId: 'hermes_boots', count: 1 },
      { itemId: 'celestial_emblem', count: 1 },
      { itemId: 'bounty_badge', count: 1 },
      { itemId: 'mana_flower', count: 1 },
      { itemId: 'shiny_red_balloon', count: 1 },
    ],
  },
  terraria: {
    label: 'Terraria Treasure Vault',
    labelRu: 'Сокровищница Террарии',
    description: 'Zenith, Star Wrath, Terra Blade, Meowmere, S.D.M.G., Vampire Knives & Hellstone.',
    descriptionRu: 'Зенит, Звёздный гнев, Терра-клинок, Мяумур, К.П.М., Вампирские ножи и Адская руда.',
    items: [
      { itemId: 'zenith', count: 1 },
      { itemId: 'star_wrath', count: 1 },
      { itemId: 'terra_blade', count: 1 },
      { itemId: 'meowmere_blade', count: 1 },
      { itemId: 'sdmg', count: 1 },
      { itemId: 'vampire_knives', count: 1 },
      { itemId: 'demon_scythe', count: 1 },
      { itemId: 'terraspark_boots', count: 1 },
      { itemId: 'ankh_shield', count: 1 },
      { itemId: 'magic_mirror', count: 1 },
      { itemId: 'campfire_item', count: 3 },
      { itemId: 'heart_lantern_item', count: 2 },
    ],
  },
  potions: {
    label: 'Alchemist & Red Potion Chest',
    labelRu: 'Сундук зелий и Красное зелье',
    description: 'Red Potion (50/50 gamble!), Milk Potion cleanse, Ironskin, Regen, Swiftness & Buffs.',
    descriptionRu: 'Красное зелье (50/50!), Зелье молока, Железная кожа, Регенерация, Скорость и баффы!',
    items: [
      { itemId: 'red_potion', count: 5 },
      { itemId: 'milk_potion', count: 5 },
      { itemId: 'ironskin_potion', count: 4 },
      { itemId: 'regen_potion', count: 4 },
      { itemId: 'swiftness_potion', count: 4 },
      { itemId: 'magic_power_potion', count: 4 },
      { itemId: 'featherfall_potion', count: 4 },
      { itemId: 'wrath_potion', count: 4 },
      { itemId: 'obsidian_skin_potion', count: 4 },
      { itemId: 'shine_potion', count: 4 },
      { itemId: 'heartreach_potion', count: 4 },
      { itemId: 'recall_potion', count: 5 },
    ],
  },
  builder: {
    label: "Architect's Chest",
    labelRu: 'Строительный сундук',
    description: 'House Blueprints, planks, sandstone, walls, furniture, and crafting stations.',
    descriptionRu: 'Чертежи домов, доски, песчаник, стены, мебель и станции крафта.',
    items: [
      { itemId: 'house_blueprint', count: 3 },
      { itemId: 'planks_block', count: 99 },
      { itemId: 'sandstone_brick', count: 99 },
      { itemId: 'wood_wall', count: 99 },
      { itemId: 'table_item', count: 4 },
      { itemId: 'chair_item', count: 4 },
      { itemId: 'chandelier_item', count: 4 },
      { itemId: 'bookshelf_item', count: 2 },
      { itemId: 'door_item', count: 4 },
      { itemId: 'workbench_item', count: 2 },
      { itemId: 'furnace_item', count: 1 },
      { itemId: 'anvil_item', count: 1 },
    ],
  },
};

export function getChestPresetInfo(preset: DebugChestPreset, lang: Language = 'en') {
  const p = DEBUG_CHEST_PRESETS[preset];
  return {
    label: lang === 'ru' ? p.labelRu : p.label,
    description: lang === 'ru' ? p.descriptionRu : p.description,
    items: p.items,
  };
}
