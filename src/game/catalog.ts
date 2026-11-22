import {
  CraftingRecipe,
  CraftingStation,
  InventorySlot,
  ItemDef,
  TileType,
  WallType,
} from './types';

export const ITEMS: Record<string, ItemDef> = {
  // === TOOLS ===
  wood_pickaxe: {
    id: 'wood_pickaxe',
    name: 'Деревянная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Добывает землю, дерево и мягкий камень.',
    pickPower: 1,
    damage: 6,
    knockback: 3,
    cooldown: 0.24,
    reach: 54,
    color: '#a97449',
    accent: '#d8b48a',
  },
  iron_pickaxe: {
    id: 'iron_pickaxe',
    name: 'Железная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Быстро ломает камень, руду и кирпичи.',
    pickPower: 2,
    damage: 10,
    knockback: 4,
    cooldown: 0.17,
    reach: 60,
    color: '#94a3b8',
    accent: '#e2e8f0',
  },
  gold_pickaxe: {
    id: 'gold_pickaxe',
    name: 'Золотая кирка-коготь',
    category: 'tool',
    maxStack: 1,
    description: 'Молниеносно добывает любые породы и рубины.',
    pickPower: 3,
    damage: 14,
    knockback: 5,
    cooldown: 0.12,
    reach: 66,
    color: '#eab308',
    accent: '#fef08a',
  },

  // === WEAPONS (10+ distinct weapons!) ===
  zazu_sword: {
    id: 'zazu_sword',
    name: 'Изумрудный клинок Зазу',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Легендарный меч котика с изумрудной гардой.',
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
    name: 'Когтерез из дуба',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Надёжный деревянный меч для первых схваток.',
    damage: 12,
    knockback: 4.5,
    cooldown: 0.28,
    reach: 58,
    color: '#9a6b42',
    accent: '#d6a87c',
  },
  iron_broadsword: {
    id: 'iron_broadsword',
    name: 'Железный тесак',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Тяжёлый широкий клинок с мощным отбросом.',
    damage: 24,
    knockback: 7.5,
    cooldown: 0.34,
    reach: 70,
    color: '#cbd5e1',
    accent: '#38bdf8',
  },
  ruby_greatsword: {
    id: 'ruby_greatsword',
    name: 'Рубиновый королевский меч',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Размашистый огненно-рубиновый клинок героя.',
    damage: 38,
    knockback: 9,
    cooldown: 0.36,
    reach: 84,
    textureSrc: '/assets/aistudio/sword_03ad3b16.png',
    color: '#e11d48',
    accent: '#fda4af',
  },
  fish_spear: {
    id: 'fish_spear',
    name: 'Копьё-гарпун',
    category: 'weapon',
    weaponKind: 'spear',
    maxStack: 1,
    description: 'Длинный выпад, достаёт врагов на дистанции.',
    damage: 21,
    knockback: 5,
    cooldown: 0.28,
    reach: 96,
    color: '#0284c7',
    accent: '#bae6fd',
  },
  wood_bow: {
    id: 'wood_bow',
    name: 'Охотничий лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Стреляет быстрыми стрелами по курсу прицела.',
    damage: 16,
    knockback: 3.5,
    cooldown: 0.35,
    projectileSpeed: 640,
    pierce: 1,
    color: '#855836',
    accent: '#fde68a',
  },
  gold_bow: {
    id: 'gold_bow',
    name: 'Золотой арбалет',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Скоростные пробивные болты, пробивают 2 врагов.',
    damage: 27,
    knockback: 4.5,
    cooldown: 0.24,
    projectileSpeed: 820,
    pierce: 2,
    color: '#f59e0b',
    accent: '#fef3c7',
  },
  fish_boomerang: {
    id: 'fish_boomerang',
    name: 'Рыбный бумеранг',
    category: 'weapon',
    weaponKind: 'boomerang',
    maxStack: 1,
    description: 'Возвращается в лапы и бьёт врагов дважды.',
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
    name: 'Посох солнечного мяу',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Запускает огненный шар (тратит 8 маны).',
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
    name: 'Ледяная палочка',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    description: 'Бьёт пробивной ледяной звездой (6 маны).',
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
    name: 'Кошачья лазер-указка',
    category: 'weapon',
    weaponKind: 'laser',
    maxStack: 1,
    description: 'Невероятно быстрый луч света! (3 маны)',
    damage: 17,
    knockback: 2,
    cooldown: 0.13,
    projectileSpeed: 1050,
    manaCost: 3,
    pierce: 2,
    color: '#ef4444',
    accent: '#fecaca',
  },
  yarn_bomb: {
    id: 'yarn_bomb',
    name: 'Взрывной клубок',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 99,
    description: 'Бросковый клубок, взрывается по площади!',
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
    name: 'Земля',
    category: 'block',
    maxStack: 999,
    description: 'Обычная плодородная земля.',
    placesTile: TileType.Dirt,
    color: '#7c5032',
    accent: '#5c3a23',
  },
  grass_block: {
    id: 'grass_block',
    name: 'Дёрн с травой',
    category: 'block',
    maxStack: 999,
    description: 'Сочная зелёная трава для двора.',
    placesTile: TileType.Grass,
    color: '#3f9b2c',
    accent: '#7c5032',
  },
  stone_block: {
    id: 'stone_block',
    name: 'Камень',
    category: 'block',
    maxStack: 999,
    description: 'Прочный булыжник для стен и башен.',
    placesTile: TileType.Stone,
    color: '#6b7280',
    accent: '#9ca3af',
  },
  wood_log: {
    id: 'wood_log',
    name: 'Бревно',
    category: 'block',
    maxStack: 999,
    description: 'Сырая древесина из лесных деревьев.',
    placesTile: TileType.Wood,
    color: '#784826',
    accent: '#a4693f',
  },
  planks_block: {
    id: 'planks_block',
    name: 'Доски',
    category: 'block',
    maxStack: 999,
    description: 'Тёплые доски для пола и стен уютного домика.',
    placesTile: TileType.Planks,
    color: '#b77d48',
    accent: '#dfb07d',
  },
  brick_block: {
    id: 'brick_block',
    name: 'Кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Надёжная кирпичная кладка для замка кота.',
    placesTile: TileType.Brick,
    color: '#b45343',
    accent: '#e29587',
  },
  roof_tile: {
    id: 'roof_tile',
    name: 'Черепица',
    category: 'block',
    maxStack: 999,
    description: 'Яркая черепица для красивой крыши дома.',
    placesTile: TileType.RoofTile,
    color: '#c2410c',
    accent: '#fb923c',
  },
  glass_block: {
    id: 'glass_block',
    name: 'Стекло',
    category: 'block',
    maxStack: 999,
    description: 'Прозрачное окно в дом, пропускает свет.',
    placesTile: TileType.Glass,
    color: '#7dd3fc',
    accent: '#e0f2fe',
  },
  platform_block: {
    id: 'platform_block',
    name: 'Деревянная платформа',
    category: 'block',
    maxStack: 999,
    description: 'Можно запрыгивать снизу и спускаться на S.',
    placesTile: TileType.Platform,
    color: '#c08552',
    accent: '#f3d5b5',
  },
  torch_item: {
    id: 'torch_item',
    name: 'Факел',
    category: 'block',
    maxStack: 999,
    description: 'Освещает дом и глубокие пещеры.',
    placesTile: TileType.Torch,
    color: '#f59e0b',
    accent: '#fef08a',
  },
  door_item: {
    id: 'door_item',
    name: 'Деревянная дверь',
    category: 'block',
    maxStack: 99,
    description: 'Открывается и закрывается кликом ПКМ рядом.',
    placesTile: TileType.DoorClosed,
    color: '#925e34',
    accent: '#eab308',
  },
  bed_item: {
    id: 'bed_item',
    name: 'Кошачья лежанка',
    category: 'block',
    maxStack: 10,
    description: 'Устанавливает точку возрождения и лечит дом.',
    placesTile: TileType.Bed,
    color: '#e11d48',
    accent: '#fecdd3',
  },
  stool_item: {
    id: 'stool_item',
    name: 'Табуретка',
    category: 'block',
    maxStack: 10,
    description: 'Живая деревянная табуретка. Можно погладить (ЛКМ/F) и нажать ПКМ!',
    placesTile: TileType.Stool,
    color: '#a16207',
    accent: '#fde68a',
  },
  wood_wall: {
    id: 'wood_wall',
    name: 'Задняя стена (доски)',
    category: 'wall',
    maxStack: 999,
    description: 'Фоновая стена для закрытого тёплого дома.',
    placesWall: WallType.WoodWall,
    color: '#6b472b',
    accent: '#8c5e3a',
  },
  stone_wall: {
    id: 'stone_wall',
    name: 'Задняя стена (камень)',
    category: 'wall',
    maxStack: 999,
    description: 'Каменный фон для крепости или подвала.',
    placesWall: WallType.StoneWall,
    color: '#4b5563',
    accent: '#6b7280',
  },

  // === CRAFTING STATIONS ===
  workbench_item: {
    id: 'workbench_item',
    name: 'Верстак',
    category: 'station',
    maxStack: 10,
    description: 'Открывает рецепты мебели, луков и снаряжения.',
    placesTile: TileType.Workbench,
    color: '#a16207',
    accent: '#fde047',
  },
  furnace_item: {
    id: 'furnace_item',
    name: 'Печь',
    category: 'station',
    maxStack: 10,
    description: 'Плавит железную и золотую руду в слитки, печёт стекло.',
    placesTile: TileType.Furnace,
    color: '#57534e',
    accent: '#fb923c',
  },
  anvil_item: {
    id: 'anvil_item',
    name: 'Наковальня',
    category: 'station',
    maxStack: 10,
    description: 'Куёт мощные мечи, копья и золотые инструменты.',
    placesTile: TileType.Anvil,
    color: '#334155',
    accent: '#94a3b8',
  },

  // === MATERIALS & ORES ===
  coal_ore: {
    id: 'coal_ore',
    name: 'Уголь',
    category: 'material',
    maxStack: 999,
    description: 'Нужен для факелов и плавки руды.',
    color: '#1e293b',
    accent: '#475569',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Железная руда',
    category: 'material',
    maxStack: 999,
    description: 'Переплавляется в печи в железные слитки.',
    color: '#64748b',
    accent: '#cbd5e1',
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'Золотая руда',
    category: 'material',
    maxStack: 999,
    description: 'Переплавляется в печи в золотые слитки.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  iron_bar: {
    id: 'iron_bar',
    name: 'Железный слиток',
    category: 'material',
    maxStack: 999,
    description: 'Основа для прочных инструментов и оружия.',
    color: '#94a3b8',
    accent: '#f1f5f9',
  },
  gold_bar: {
    id: 'gold_bar',
    name: 'Золотой слиток',
    category: 'material',
    maxStack: 999,
    description: 'Редкий металл для лучшего снаряжения.',
    color: '#eab308',
    accent: '#fef9c3',
  },
  ruby_gem: {
    id: 'ruby_gem',
    name: 'Рубин',
    category: 'material',
    maxStack: 99,
    description: 'Магический кристалл из глубоких пещер.',
    color: '#e11d48',
    accent: '#fda4af',
  },
  slime_gel: {
    id: 'slime_gel',
    name: 'Гель слизня',
    category: 'material',
    maxStack: 999,
    description: 'Горит ярче угля! Годится для факелов и клубков.',
    color: '#22c55e',
    accent: '#86efac',
  },
  monster_bone: {
    id: 'monster_bone',
    name: 'Кость монстра',
    category: 'material',
    maxStack: 999,
    description: 'Крепкий трофей с ночных скелетов и гоблинов.',
    color: '#e2e8f0',
    accent: '#94a3b8',
  },

  // === CONSUMABLES ===
  crispy_fish: {
    id: 'crispy_fish',
    name: 'Хрустящая рыбка',
    category: 'consumable',
    maxStack: 30,
    description: 'Восстанавливает 35 HP. Любимая еда кота!',
    healAmount: 35,
    color: '#38bdf8',
    accent: '#fef08a',
  },
  warm_milk: {
    id: 'warm_milk',
    name: 'Тёплое молоко',
    category: 'consumable',
    maxStack: 30,
    description: 'Восстанавливает 50 HP и 40 маны.',
    healAmount: 50,
    manaAmount: 40,
    color: '#f8fafc',
    accent: '#bae6fd',
  },
  catnip_elixir: {
    id: 'catnip_elixir',
    name: 'Эликсир мяты (+броня)',
    category: 'consumable',
    maxStack: 10,
    description: 'Навсегда даёт +2 защиты (макс. до 14) и 30 HP.',
    healAmount: 30,
    defenseBonus: 2,
    color: '#10b981',
    accent: '#a7f3d0',
  },
};

export const RECIPES: CraftingRecipe[] = [
  // Stations & Basic Building (Hand / Workbench)
  {
    id: 'craft_planks',
    resultId: 'planks_block',
    resultCount: 4,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'wood_log', count: 1 }],
  },
  {
    id: 'craft_workbench',
    resultId: 'workbench_item',
    resultCount: 1,
    station: 'hand',
    category: 'stations',
    ingredients: [{ itemId: 'wood_log', count: 6 }],
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
    ingredients: [{ itemId: 'planks_block', count: 2 }],
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
    ingredients: [{ itemId: 'wood_log', count: 5 }],
  },
  {
    id: 'craft_stool',
    resultId: 'stool_item',
    resultCount: 1,
    station: 'hand',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 4 }],
  },

  // Workbench recipes
  {
    id: 'craft_furnace',
    resultId: 'furnace_item',
    resultCount: 1,
    station: 'workbench',
    category: 'stations',
    ingredients: [
      { itemId: 'stone_block', count: 12 },
      { itemId: 'coal_ore', count: 3 },
    ],
  },
  {
    id: 'craft_door',
    resultId: 'door_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [{ itemId: 'planks_block', count: 6 }],
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
    id: 'craft_brick',
    resultId: 'brick_block',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'stone_block', count: 2 },
      { itemId: 'dirt_block', count: 2 },
    ],
  },
  {
    id: 'craft_roof',
    resultId: 'roof_tile',
    resultCount: 4,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'brick_block', count: 2 },
      { itemId: 'planks_block', count: 2 },
    ],
  },
  {
    id: 'craft_bed',
    resultId: 'bed_item',
    resultCount: 1,
    station: 'workbench',
    category: 'building',
    ingredients: [
      { itemId: 'planks_block', count: 8 },
      { itemId: 'slime_gel', count: 4 },
    ],
  },
  {
    id: 'craft_wood_bow',
    resultId: 'wood_bow',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'wood_log', count: 6 },
      { itemId: 'slime_gel', count: 3 },
    ],
  },
  {
    id: 'craft_fish_boomerang',
    resultId: 'fish_boomerang',
    resultCount: 1,
    station: 'workbench',
    category: 'weapons',
    ingredients: [
      { itemId: 'planks_block', count: 6 },
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
      { itemId: 'slime_gel', count: 4 },
      { itemId: 'coal_ore', count: 2 },
    ],
  },

  // Furnace recipes
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
    ingredients: [
      { itemId: 'stone_block', count: 2 },
      { itemId: 'coal_ore', count: 1 },
    ],
  },
  {
    id: 'craft_anvil',
    resultId: 'anvil_item',
    resultCount: 1,
    station: 'workbench',
    category: 'stations',
    ingredients: [{ itemId: 'iron_bar', count: 4 }],
  },

  // Anvil recipes (high-tier tools & arsenal)
  {
    id: 'craft_iron_pickaxe',
    resultId: 'iron_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'wood_log', count: 3 },
    ],
  },
  {
    id: 'craft_gold_pickaxe',
    resultId: 'gold_pickaxe',
    resultCount: 1,
    station: 'anvil',
    category: 'tools',
    ingredients: [
      { itemId: 'gold_bar', count: 5 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
  {
    id: 'craft_iron_broadsword',
    resultId: 'iron_broadsword',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'iron_bar', count: 5 },
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
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'monster_bone', count: 3 },
    ],
  },
  {
    id: 'craft_gold_bow',
    resultId: 'gold_bow',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 5 },
      { itemId: 'monster_bone', count: 4 },
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
      { itemId: 'ruby_gem', count: 2 },
      { itemId: 'coal_ore', count: 5 },
    ],
  },
  {
    id: 'craft_frost_wand',
    resultId: 'frost_wand',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'iron_bar', count: 4 },
      { itemId: 'ruby_gem', count: 1 },
      { itemId: 'glass_block', count: 4 },
    ],
  },
  {
    id: 'craft_laser_pointer',
    resultId: 'laser_pointer',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 4 },
      { itemId: 'ruby_gem', count: 2 },
      { itemId: 'iron_bar', count: 2 },
    ],
  },
  {
    id: 'craft_ruby_greatsword',
    resultId: 'ruby_greatsword',
    resultCount: 1,
    station: 'anvil',
    category: 'weapons',
    ingredients: [
      { itemId: 'gold_bar', count: 6 },
      { itemId: 'ruby_gem', count: 3 },
      { itemId: 'monster_bone', count: 5 },
    ],
  },

  // Potions & Food
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
      { itemId: 'slime_gel', count: 5 },
      { itemId: 'ruby_gem', count: 1 },
    ],
  },
];

export const STATION_NAMES: Record<CraftingStation, string> = {
  hand: 'В лапах',
  workbench: 'Верстак',
  furnace: 'Печь',
  anvil: 'Наковальня',
};

export const HOTBAR_SIZE = 9;
export const BACKPACK_SIZE = 54;

export function createStarterInventory(): {
  hotbar: (InventorySlot | null)[];
  backpack: (InventorySlot | null)[];
} {
  const hotbar: (InventorySlot | null)[] = new Array(HOTBAR_SIZE).fill(null);
  const backpack: (InventorySlot | null)[] = new Array(BACKPACK_SIZE).fill(null);

  // Give player an inviting, action-ready starter kit!
  hotbar[0] = { itemId: 'zazu_sword', count: 1 };
  hotbar[1] = { itemId: 'wood_pickaxe', count: 1 };
  hotbar[2] = { itemId: 'wood_bow', count: 1 };
  hotbar[3] = { itemId: 'planks_block', count: 48 };
  hotbar[4] = { itemId: 'wood_wall', count: 36 };
  hotbar[5] = { itemId: 'torch_item', count: 12 };
  hotbar[6] = { itemId: 'door_item', count: 2 };
  hotbar[7] = { itemId: 'workbench_item', count: 1 };
  hotbar[8] = { itemId: 'crispy_fish', count: 5 };

  // Also stock backpack with some fun building materials & a secondary weapon
  backpack[0] = { itemId: 'stone_block', count: 24 };
  backpack[1] = { itemId: 'roof_tile', count: 20 };
  backpack[2] = { itemId: 'glass_block', count: 8 };
  backpack[3] = { itemId: 'platform_block', count: 12 };
  backpack[4] = { itemId: 'yarn_bomb', count: 6 };
  backpack[5] = { itemId: 'wood_log', count: 8 };
  backpack[6] = { itemId: 'coal_ore', count: 4 };
  backpack[7] = { itemId: 'stool_item', count: 1 };

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

  // Prefer consuming from backpack first so hotbar tools/blocks stay tidy
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
  // If inventory completely full, refund (edge case)
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
    default:
      return null;
  }
}

export const STOOL_REPO_URL = 'https://github.com/stoolio-lox/stoolio-something.git';
export const DEBUG_PASSCODE = 'secretdev';

export function verifyDebugPassword(input: string): boolean {
  return input.trim() === DEBUG_PASSCODE;
}
