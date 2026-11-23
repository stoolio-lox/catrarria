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
  TileType,
  WallType,
} from './types';

export const ITEMS: Record<string, ItemDef> = {
  // === TOOLS (7 pickaxes!) ===
  wood_pickaxe: {
    id: 'wood_pickaxe',
    name: 'Деревянная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Добывает землю, снег и мягкий камень.',
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
    name: 'Медная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Удобная кирка для ранних пещер и меди.',
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
    name: 'Железная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Ломает камень, багролит и золотую руду.',
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
    name: 'Ледяная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Быстрая морозная кирка из Снежного биома.',
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
    name: 'Золотая кирка-коготь',
    category: 'tool',
    maxStack: 1,
    description: 'Копает рубины, мрамор и обсидиан.',
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
    name: 'Багряная кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Мощная кирка Красного биома, крошит обсидиан.',
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
    name: 'Обсидиановая кирка',
    category: 'tool',
    maxStack: 1,
    description: 'Легендарная сверхбыстрая кирка мастера.',
    pickPower: 5,
    damage: 22,
    knockback: 6,
    cooldown: 0.08,
    reach: 78,
    color: '#6d28d9',
    accent: '#ddd6fe',
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
  copper_sword: {
    id: 'copper_sword',
    name: 'Медный клинок',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Лёгкий и быстрый меч из медных слитков.',
    damage: 16,
    knockback: 5,
    cooldown: 0.25,
    reach: 64,
    color: '#d97706',
    accent: '#fed7aa',
  },
  ice_blade: {
    id: 'ice_blade',
    name: 'Морозный клинок',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Острый ледяной меч из Снежного биома.',
    damage: 23,
    knockback: 6,
    cooldown: 0.26,
    reach: 72,
    color: '#38bdf8',
    accent: '#e0f2fe',
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
  crimson_katana: {
    id: 'crimson_katana',
    name: 'Багряная катана',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Молниеносный багряный меч Красного биома.',
    damage: 32,
    knockback: 6.5,
    cooldown: 0.21,
    reach: 78,
    color: '#dc2626',
    accent: '#fecaca',
  },
  gold_claymore: {
    id: 'gold_claymore',
    name: 'Золотой клеймор',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Тяжёлый золотой двуручник с огромным отбросом.',
    damage: 34,
    knockback: 8.5,
    cooldown: 0.32,
    reach: 82,
    color: '#eab308',
    accent: '#fef9c3',
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
  obsidian_nightblade: {
    id: 'obsidian_nightblade',
    name: 'Клинок Ночного Мяу',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    description: 'Абсолютный обсидианово-кристальный меч.',
    damage: 48,
    knockback: 9.5,
    cooldown: 0.24,
    reach: 90,
    color: '#7c3aed',
    accent: '#f5d0fe',
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
  copper_bow: {
    id: 'copper_bow',
    name: 'Медный лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Крепкий скорострельный лук с медными стрелами.',
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
    name: 'Ледяной лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Пускает морозные стрелы, пробивает 2 врагов.',
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
  crimson_bow: {
    id: 'crimson_bow',
    name: 'Багряный лук Кровозуба',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Тяжёлый лук Красного биома, пробивает 3 цели.',
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
    name: 'Кристальный звёздный лук',
    category: 'weapon',
    weaponKind: 'bow',
    maxStack: 1,
    description: 'Сверхбыстрые кристальные стрелы (пробитие 4).',
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
  chest_item: {
    id: 'chest_item',
    name: 'Сундук сокровищ',
    category: 'block',
    maxStack: 20,
    description: 'Вместительный сундук для хранения трофеев. ПКМ — открыть.',
    placesTile: TileType.Chest,
    color: '#b45309',
    accent: '#facc15',
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
  snow_block: {
    id: 'snow_block',
    name: 'Снег',
    category: 'block',
    maxStack: 999,
    description: 'Пушистый блок из Снежного биома.',
    placesTile: TileType.Snow,
    color: '#e0f2fe',
    accent: '#ffffff',
  },
  ice_block: {
    id: 'ice_block',
    name: 'Лёд',
    category: 'block',
    maxStack: 999,
    description: 'Прочный ледяной блок с блеском.',
    placesTile: TileType.Ice,
    color: '#38bdf8',
    accent: '#bae6fd',
  },
  snow_brick: {
    id: 'snow_brick',
    name: 'Снежный кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Аккуратный белый кирпич для ледяных замков.',
    placesTile: TileType.SnowBrick,
    color: '#bae6fd',
    accent: '#f0f9ff',
  },
  crimson_grass: {
    id: 'crimson_grass',
    name: 'Багряный дёрн',
    category: 'block',
    maxStack: 999,
    description: 'Ярко-красная трава Красного биома.',
    placesTile: TileType.CrimsonGrass,
    color: '#dc2626',
    accent: '#f87171',
  },
  crimson_dirt: {
    id: 'crimson_dirt',
    name: 'Багряная земля',
    category: 'block',
    maxStack: 999,
    description: 'Тёмно-красная почва Красного биома.',
    placesTile: TileType.CrimsonDirt,
    color: '#7f1d1d',
    accent: '#b91c1c',
  },
  crimstone_block: {
    id: 'crimstone_block',
    name: 'Кровавый камень',
    category: 'block',
    maxStack: 999,
    description: 'Твёрдая порода из недр Красного биома.',
    placesTile: TileType.Crimstone,
    color: '#991b1b',
    accent: '#ef4444',
  },
  crimson_brick: {
    id: 'crimson_brick',
    name: 'Багряный кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Красивый тёмно-алый кирпич для цитадели.',
    placesTile: TileType.CrimsonBrick,
    color: '#b91c1c',
    accent: '#fca5a5',
  },
  crimson_wood: {
    id: 'crimson_wood',
    name: 'Багряное дерево',
    category: 'block',
    maxStack: 999,
    description: 'Красная древесина из багряных лесов.',
    placesTile: TileType.CrimsonWood,
    color: '#881337',
    accent: '#fb7185',
  },
  sand_block: {
    id: 'sand_block',
    name: 'Песок',
    category: 'block',
    maxStack: 999,
    description: 'Золотистый песок для пляжа и стекла.',
    placesTile: TileType.Sand,
    color: '#eab308',
    accent: '#fef08a',
  },
  sandstone_brick: {
    id: 'sandstone_brick',
    name: 'Песчаный кирпич',
    category: 'block',
    maxStack: 999,
    description: 'Тёплый золотой кирпич для храмов.',
    placesTile: TileType.SandstoneBrick,
    color: '#ca8a04',
    accent: '#fde047',
  },
  marble_block: {
    id: 'marble_block',
    name: 'Белый мрамор',
    category: 'block',
    maxStack: 999,
    description: 'Благородный белый камень с узором.',
    placesTile: TileType.Marble,
    color: '#e2e8f0',
    accent: '#ffffff',
  },
  obsidian_block: {
    id: 'obsidian_block',
    name: 'Обсидиан',
    category: 'block',
    maxStack: 999,
    description: 'Сверхпрочный тёмно-фиолетовый камень глубин.',
    placesTile: TileType.Obsidian,
    color: '#3b0764',
    accent: '#a855f7',
  },
  crystal_block: {
    id: 'crystal_block',
    name: 'Светящийся кристалл',
    category: 'block',
    maxStack: 999,
    description: 'Сияет в темноте и питает звёздное оружие.',
    placesTile: TileType.CrystalBlock,
    color: '#d946ef',
    accent: '#f5d0fe',
  },
  wood_beam: {
    id: 'wood_beam',
    name: 'Деревянная балка',
    category: 'block',
    maxStack: 999,
    description: 'Опора для дома — сквозь неё можно свободно ходить.',
    placesTile: TileType.WoodBeam,
    color: '#6b4226',
    accent: '#a16207',
  },
  snow_wall: {
    id: 'snow_wall',
    name: 'Задняя стена (снег)',
    category: 'wall',
    maxStack: 999,
    description: 'Прохладная ледяная фоновая стена для дома.',
    placesWall: WallType.SnowWall,
    color: '#7dd3fc',
    accent: '#e0f2fe',
  },
  crimson_wall: {
    id: 'crimson_wall',
    name: 'Задняя стена (багрянец)',
    category: 'wall',
    maxStack: 999,
    description: 'Алая фоновая стена из Красного биома.',
    placesWall: WallType.CrimsonWall,
    color: '#7f1d1d',
    accent: '#dc2626',
  },
  marble_wall: {
    id: 'marble_wall',
    name: 'Задняя стена (мрамор)',
    category: 'wall',
    maxStack: 999,
    description: 'Роскошный светлый фон для дворца.',
    placesWall: WallType.MarbleWall,
    color: '#cbd5e1',
    accent: '#f8fafc',
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
  copper_ore: {
    id: 'copper_ore',
    name: 'Медная руда',
    category: 'material',
    maxStack: 999,
    description: 'Легко плавится в медные слитки.',
    color: '#b45309',
    accent: '#fb923c',
  },
  copper_bar: {
    id: 'copper_bar',
    name: 'Медный слиток',
    category: 'material',
    maxStack: 999,
    description: 'Первый металл для медной кирки, меча и лука.',
    color: '#d97706',
    accent: '#fed7aa',
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

  // === TERRARIA FURNITURE & HOUSE BUILDING ===
  table_item: {
    id: 'table_item',
    name: 'Деревянный стол',
    category: 'block',
    maxStack: 30,
    description: 'Стол для дома жителей. Нужен вместе со стулом для заселения NPC.',
    placesTile: TileType.Table,
    color: '#92400e',
    accent: '#d97706',
    shopPrice: 12,
  },
  chair_item: {
    id: 'chair_item',
    name: 'Деревянный стул',
    category: 'block',
    maxStack: 30,
    description: 'Удобный стул для жителей и кота. Нужен для комнаты жителя.',
    placesTile: TileType.Chair,
    color: '#b45309',
    accent: '#fbbf24',
    shopPrice: 10,
  },
  chandelier_item: {
    id: 'chandelier_item',
    name: 'Золотая люстра',
    category: 'block',
    maxStack: 20,
    description: 'Яркий источник света для дома — заменяет факел и украшает потолок.',
    placesTile: TileType.Chandelier,
    color: '#facc15',
    accent: '#fef08a',
    shopPrice: 25,
  },
  bookshelf_item: {
    id: 'bookshelf_item',
    name: 'Книжный шкаф',
    category: 'block',
    maxStack: 20,
    description: 'Засчитывается как стол для жилья жителей. Полна кошачьих сказок.',
    placesTile: TileType.Bookshelf,
    color: '#78350f',
    accent: '#38bdf8',
    shopPrice: 28,
  },
  piggy_bank_item: {
    id: 'piggy_bank_item',
    name: 'Копилка-Свинка',
    category: 'block',
    maxStack: 5,
    description: 'Знаковая розовая свинка из Террарии! Засчитывается как стол в доме.',
    placesTile: TileType.PiggyBank,
    color: '#f472b6',
    accent: '#fbcfe8',
    shopPrice: 40,
  },
  rope_item: {
    id: 'rope_item',
    name: 'Верёвка',
    category: 'block',
    maxStack: 99,
    description: 'Ставится вертикально. Зажми W или S, чтобы карабкаться по шахтам!',
    placesTile: TileType.Rope,
    color: '#d97706',
    accent: '#fde68a',
    shopPrice: 2,
  },
  house_blueprint: {
    id: 'house_blueprint',
    name: 'Чертёж уютного дома',
    category: 'consumable',
    maxStack: 10,
    specialKind: 'house_blueprint',
    description: 'Мгновенно строит готовый домик 9×6 со стенами, дверями, люстрой, столом и стулом!',
    color: '#38bdf8',
    accent: '#fde047',
    shopPrice: 45,
  },

  // === TERRARIA CRYSTALS, POTIONS & GADGETS ===
  life_crystal: {
    id: 'life_crystal',
    name: 'Кристалл Жизни',
    category: 'consumable',
    maxStack: 20,
    specialKind: 'life_crystal',
    description: 'Легендарное сердце Террарии! Навсегда добавляет +20 макс. HP (до 400).',
    color: '#ec4899',
    accent: '#fbcfe8',
    shopPrice: 95,
  },
  fallen_star: {
    id: 'fallen_star',
    name: 'Упавшая звезда',
    category: 'material',
    maxStack: 99,
    description: 'Падает с неба ночью. 3 звезды крафтятся в Кристалл Маны!',
    color: '#fde047',
    accent: '#fef9c3',
  },
  mana_crystal: {
    id: 'mana_crystal',
    name: 'Кристалл Маны',
    category: 'consumable',
    maxStack: 20,
    specialKind: 'mana_crystal',
    description: 'Навсегда увеличивает максимум маны на +20 (до 200).',
    color: '#3b82f6',
    accent: '#bae6fd',
    shopPrice: 70,
  },
  healing_potion: {
    id: 'healing_potion',
    name: 'Лечебное зелье',
    category: 'consumable',
    maxStack: 30,
    healAmount: 65,
    description: 'Классическое красное зелье Террарии: лечит +65 HP.',
    color: '#ef4444',
    accent: '#fecaca',
    shopPrice: 15,
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Зелье маны',
    category: 'consumable',
    maxStack: 30,
    manaAmount: 75,
    description: 'Восстанавливает +75 маны для магии.',
    color: '#2563eb',
    accent: '#93c5fd',
    shopPrice: 12,
  },
  magic_mirror: {
    id: 'magic_mirror',
    name: 'Волшебное зеркало',
    category: 'consumable',
    maxStack: 1,
    specialKind: 'magic_mirror',
    description: 'Взгляни в зеркало, чтобы мгновенно вернуться домой на точку спавна!',
    color: '#38bdf8',
    accent: '#e0f2fe',
    shopPrice: 80,
  },
  grappling_hook: {
    id: 'grappling_hook',
    name: 'Крюк-кошка',
    category: 'weapon',
    weaponKind: 'hook',
    maxStack: 1,
    cooldown: 0.25,
    description: 'Цепляется за любые блоки и притягивает кота! Также работает по кнопке [G].',
    color: '#94a3b8',
    accent: '#f59e0b',
    shopPrice: 55,
  },

  // === TERRARIA PASSIVE ACCESSORIES (Equip in Accessory slots!) ===
  cloud_in_bottle: {
    id: 'cloud_in_bottle',
    name: 'Облако в бутылке',
    category: 'accessory',
    accessoryKind: 'cloud_bottle',
    maxStack: 1,
    description: 'Аксессуар: даёт двойной прыжок в воздухе.',
    color: '#bae6fd',
    accent: '#ffffff',
    shopPrice: 85,
  },
  hermes_boots: {
    id: 'hermes_boots',
    name: 'Ботинки Гермеса',
    category: 'accessory',
    accessoryKind: 'hermes_boots',
    maxStack: 1,
    description: 'Аксессуар: ускоряет бег кота на +38%.',
    color: '#16a34a',
    accent: '#fde047',
    shopPrice: 90,
  },
  band_of_regen: {
    id: 'band_of_regen',
    name: 'Кольцо регенерации',
    category: 'accessory',
    accessoryKind: 'regen_ring',
    maxStack: 1,
    description: 'Аксессуар: постоянно лечит +1.8 HP/сек.',
    color: '#e11d48',
    accent: '#fda4af',
    shopPrice: 95,
  },
  cobalt_shield: {
    id: 'cobalt_shield',
    name: 'Кобальтовый щит',
    category: 'accessory',
    accessoryKind: 'cobalt_shield',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Аксессуар: +2 защиты и полный иммунитет к отбрасыванию!',
    color: '#1d4ed8',
    accent: '#93c5fd',
    shopPrice: 110,
  },
  shiny_red_balloon: {
    id: 'shiny_red_balloon',
    name: 'Красный шарик',
    category: 'accessory',
    accessoryKind: 'red_balloon',
    maxStack: 1,
    description: 'Аксессуар: увеличивает высоту прыжка на +35%.',
    color: '#ef4444',
    accent: '#fecaca',
    shopPrice: 95,
  },
  shackle: {
    id: 'shackle',
    name: 'Кандалы',
    category: 'accessory',
    accessoryKind: 'shackle',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Базовый аксессуар: +2 к защите.',
    color: '#64748b',
    accent: '#cbd5e1',
    shopPrice: 45,
  },
  mana_flower: {
    id: 'mana_flower',
    name: 'Цветок Маны',
    category: 'accessory',
    accessoryKind: 'mana_flower',
    maxStack: 1,
    description: 'Аксессуар: снижает расход маны на 25% и ускоряет её регенерацию.',
    color: '#2563eb',
    accent: '#bfdbfe',
    shopPrice: 120,
  },
  lucky_horseshoe: {
    id: 'lucky_horseshoe',
    name: 'Счастливая подкова',
    category: 'accessory',
    accessoryKind: 'horseshoe',
    maxStack: 1,
    description: 'Аксессуар с небесных островов: полностью отменяет урон от падения!',
    color: '#f59e0b',
    accent: '#fef08a',
    shopPrice: 105,
  },
  angel_wings: {
    id: 'angel_wings',
    name: 'Крылья Ангела',
    category: 'accessory',
    accessoryKind: 'angel_wings',
    maxStack: 1,
    description: 'Аксессуар: позволяет летать (зажми Пробел/W) и убирает урон от падения!',
    color: '#f8fafc',
    accent: '#38bdf8',
    shopPrice: 220,
  },
  celestial_emblem: {
    id: 'celestial_emblem',
    name: 'Небесная эмблема',
    category: 'accessory',
    accessoryKind: 'celestial_emblem',
    maxStack: 1,
    description: 'Аксессуар: +15% к урону всем оружием и +20 макс. маны.',
    color: '#7c3aed',
    accent: '#fde047',
    shopPrice: 185,
  },

  // === ARMOR SETS (7 SETS x 3 PIECES = 21 ITEMS) ===
  wood_helmet: {
    id: 'wood_helmet',
    name: 'Деревянный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'wood',
    defenseBonus: 1,
    maxStack: 1,
    description: 'Броня (Шлем): +1 защиты. Сет дерева даёт ещё +2 защиты.',
    color: '#92400e',
    accent: '#d97706',
  },
  wood_chestplate: {
    id: 'wood_chestplate',
    name: 'Деревянный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'wood',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Броня (Нагрудник): +2 защиты. Сет дерева даёт ещё +2 защиты.',
    color: '#92400e',
    accent: '#d97706',
  },
  wood_greaves: {
    id: 'wood_greaves',
    name: 'Деревянные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'wood',
    defenseBonus: 1,
    maxStack: 1,
    description: 'Броня (Поножи): +1 защиты. Сет дерева даёт ещё +2 защиты.',
    color: '#92400e',
    accent: '#d97706',
  },
  copper_helmet: {
    id: 'copper_helmet',
    name: 'Медный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'copper',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Броня (Шлем): +2 защиты. Медный сет: +2 защиты и +8% скорости.',
    color: '#c2410c',
    accent: '#fdba74',
  },
  copper_chestplate: {
    id: 'copper_chestplate',
    name: 'Медный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'copper',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Броня (Нагрудник): +3 защиты. Медный сет: +2 защиты и +8% скорости.',
    color: '#c2410c',
    accent: '#fdba74',
  },
  copper_greaves: {
    id: 'copper_greaves',
    name: 'Медные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'copper',
    defenseBonus: 2,
    maxStack: 1,
    description: 'Броня (Поножи): +2 защиты. Медный сет: +2 защиты и +8% скорости.',
    color: '#c2410c',
    accent: '#fdba74',
  },
  iron_helmet: {
    id: 'iron_helmet',
    name: 'Железный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'iron',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Броня (Шлем): +3 защиты. Железный сет: +3 защиты.',
    color: '#64748b',
    accent: '#e2e8f0',
  },
  iron_chestplate: {
    id: 'iron_chestplate',
    name: 'Железный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'iron',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Броня (Нагрудник): +4 защиты. Железный сет: +3 защиты.',
    color: '#64748b',
    accent: '#e2e8f0',
  },
  iron_greaves: {
    id: 'iron_greaves',
    name: 'Железные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'iron',
    defenseBonus: 3,
    maxStack: 1,
    description: 'Броня (Поножи): +3 защиты. Железный сет: +3 защиты.',
    color: '#64748b',
    accent: '#e2e8f0',
  },
  gold_helmet: {
    id: 'gold_helmet',
    name: 'Золотой шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'gold',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Броня (Шлем): +4 защиты. Золотой сет: +4 защиты и +10% урона.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  gold_chestplate: {
    id: 'gold_chestplate',
    name: 'Золотой нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'gold',
    defenseBonus: 5,
    maxStack: 1,
    description: 'Броня (Нагрудник): +5 защиты. Золотой сет: +4 защиты и +10% урона.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  gold_greaves: {
    id: 'gold_greaves',
    name: 'Золотые поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'gold',
    defenseBonus: 4,
    maxStack: 1,
    description: 'Броня (Поножи): +4 защиты. Золотой сет: +4 защиты и +10% урона.',
    color: '#ca8a04',
    accent: '#fef08a',
  },
  crimson_helmet: {
    id: 'crimson_helmet',
    name: 'Багровый шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'crimson',
    defenseBonus: 5,
    maxStack: 1,
    description: 'Броня (Шлем): +5 защиты. Багровый сет: +2.0 HP/сек регенерации!',
    color: '#991b1b',
    accent: '#f87171',
  },
  crimson_chestplate: {
    id: 'crimson_chestplate',
    name: 'Багровый нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'crimson',
    defenseBonus: 6,
    maxStack: 1,
    description: 'Броня (Нагрудник): +6 защиты. Багровый сет: +2.0 HP/сек регенерации!',
    color: '#991b1b',
    accent: '#f87171',
  },
  crimson_greaves: {
    id: 'crimson_greaves',
    name: 'Багровые поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'crimson',
    defenseBonus: 5,
    maxStack: 1,
    description: 'Броня (Поножи): +5 защиты. Багровый сет: +2.0 HP/сек регенерации!',
    color: '#991b1b',
    accent: '#f87171',
  },
  obsidian_helmet: {
    id: 'obsidian_helmet',
    name: 'Обсидиановый шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'obsidian',
    defenseBonus: 6,
    maxStack: 1,
    description: 'Броня (Шлем): +6 защиты. Обсидиановый сет: +18% урона и защита от падения.',
    color: '#312e81',
    accent: '#a78bfa',
  },
  obsidian_chestplate: {
    id: 'obsidian_chestplate',
    name: 'Обсидиановый нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'obsidian',
    defenseBonus: 8,
    maxStack: 1,
    description: 'Броня (Нагрудник): +8 защиты. Обсидиановый сет: +18% урона и защита от падения.',
    color: '#312e81',
    accent: '#a78bfa',
  },
  obsidian_greaves: {
    id: 'obsidian_greaves',
    name: 'Обсидиановые поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'obsidian',
    defenseBonus: 6,
    maxStack: 1,
    description: 'Броня (Поножи): +6 защиты. Обсидиановый сет: +18% урона и защита от падения.',
    color: '#312e81',
    accent: '#a78bfa',
  },
  crystal_helmet: {
    id: 'crystal_helmet',
    name: 'Кристальный шлем',
    category: 'armor',
    armorSlot: 'helmet',
    armorSet: 'crystal',
    defenseBonus: 7,
    maxStack: 1,
    description: 'Броня (Шлем): +7 защиты. Кристальный сет: +25% урона, +40 маны, -20% маны.',
    color: '#0284c7',
    accent: '#67e8f9',
  },
  crystal_chestplate: {
    id: 'crystal_chestplate',
    name: 'Кристальный нагрудник',
    category: 'armor',
    armorSlot: 'chestplate',
    armorSet: 'crystal',
    defenseBonus: 9,
    maxStack: 1,
    description: 'Броня (Нагрудник): +9 защиты. Кристальный сет: +25% урона, +40 маны, -20% маны.',
    color: '#0284c7',
    accent: '#67e8f9',
  },
  crystal_greaves: {
    id: 'crystal_greaves',
    name: 'Кристальные поножи',
    category: 'armor',
    armorSlot: 'greaves',
    armorSet: 'crystal',
    defenseBonus: 7,
    maxStack: 1,
    description: 'Броня (Поножи): +7 защиты. Кристальный сет: +25% урона, +40 маны, -20% маны.',
    color: '#0284c7',
    accent: '#67e8f9',
  },

  // === TERRARIA EXPLOSIVES & ICONIC WEAPONS ===
  terraria_bomb: {
    id: 'terraria_bomb',
    name: 'Терра-бомба',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 99,
    damage: 65,
    knockback: 10,
    cooldown: 0.45,
    projectileSpeed: 400,
    aoeRadius: 92,
    description: 'Взрывает блоки вокруг и ранит монстров! Добывает руду без кирки.',
    color: '#1e293b',
    accent: '#ef4444',
    shopPrice: 8,
  },
  dynamite: {
    id: 'dynamite',
    name: 'Динамит',
    category: 'weapon',
    weaponKind: 'bomb',
    maxStack: 99,
    damage: 120,
    knockback: 12,
    cooldown: 0.55,
    projectileSpeed: 370,
    aoeRadius: 135,
    description: 'Мощнейший динамит Террарии! Разносит огромную воронку в породе.',
    color: '#dc2626',
    accent: '#fde047',
    shopPrice: 18,
  },
  starfury: {
    id: 'starfury',
    name: 'Звёздная ярость',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    damage: 34,
    knockback: 6,
    cooldown: 0.28,
    reach: 74,
    description: 'Меч из парящих островов: обрушивает падающую звезду с неба прямо на курсор!',
    color: '#ec4899',
    accent: '#fde047',
  },
  terra_blade: {
    id: 'terra_blade',
    name: 'Терра-клинок',
    category: 'weapon',
    weaponKind: 'melee',
    maxStack: 1,
    damage: 58,
    knockback: 7.5,
    cooldown: 0.22,
    reach: 88,
    description: 'Легендарный меч Террарии! Выпускает пробивной зелёный энергетический луч.',
    color: '#10b981',
    accent: '#bef264',
  },
  minishark: {
    id: 'minishark',
    name: 'Мини-акула',
    category: 'weapon',
    weaponKind: 'gun',
    maxStack: 1,
    damage: 14,
    knockback: 2.2,
    cooldown: 0.1,
    projectileSpeed: 880,
    pierce: 1,
    description: 'Наполовину акула, наполовину пулемёт! Бешеная скорострельность.',
    color: '#475569',
    accent: '#fbbf24',
    shopPrice: 140,
  },
  water_bolt: {
    id: 'water_bolt',
    name: 'Водяной скипетр',
    category: 'weapon',
    weaponKind: 'magic',
    maxStack: 1,
    damage: 26,
    knockback: 4,
    cooldown: 0.28,
    projectileSpeed: 460,
    manaCost: 10,
    pierce: 4,
    description: 'Книга магии Данжа: пускает синий шар, рикошетящий от стен пещер!',
    color: '#0284c7',
    accent: '#7dd3fc',
  },

  // === BOSS SUMMONERS ===
  summon_king_slime: {
    id: 'summon_king_slime',
    name: 'Желейная корона',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Короля Слизней-Котов! Нажми ЛКМ или ПКМ в руке.',
    summonsBoss: 'king_slime',
    color: '#22c55e',
    accent: '#facc15',
  },
  summon_kotulhu: {
    id: 'summon_kotulhu',
    name: 'Галстук Котулху',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Котулху! Базовая призывалка из сундука.',
    summonsBoss: 'kotulhu',
    textureSrc: '/assets/aistudio/wait_518dc071.jpg',
    color: '#dc2626',
    accent: '#fca5a5',
  },
  summon_cat_worm: {
    id: 'summon_cat_worm',
    name: 'Шляпа Котового Червя',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Пожирателя Котов (Котового Червя)! Нажми ЛКМ или ПКМ.',
    summonsBoss: 'cat_worm',
    textureSrc: '/assets/aistudio/chine_5a03a968.jpg',
    color: '#d97706',
    accent: '#fde68a',
  },
  summon_skele_cat: {
    id: 'summon_skele_cat',
    name: 'Проклятый Кото-череп',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Кототрона с костяными лапами!',
    summonsBoss: 'skele_cat',
    color: '#e2e8f0',
    accent: '#a855f7',
  },
  summon_eye_boss: {
    id: 'summon_eye_boss',
    name: 'Подозрительное Око',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Око Ночи — ночного стража небес.',
    summonsBoss: 'eye_boss',
    color: '#991b1b',
    accent: '#f87171',
  },
  summon_brain_cthulhu: {
    id: 'summon_brain_cthulhu',
    name: 'Кровавый хребет',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Мозг Ктулху — ужас багровых недр!',
    summonsBoss: 'brain_cthulhu',
    color: '#be123c',
    accent: '#fda4af',
  },
  summon_queen_bee: {
    id: 'summon_queen_bee',
    name: 'Абееминация',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Королеву Пчёл — стремительную хозяйку улья.',
    summonsBoss: 'queen_bee',
    color: '#eab308',
    accent: '#1e293b',
  },
  summon_deerclops: {
    id: 'summon_deerclops',
    name: 'Оленья кукла',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Циклопа-Оленя из снежной вьюги!',
    summonsBoss: 'deerclops',
    color: '#38bdf8',
    accent: '#e0f2fe',
  },
  summon_wall_of_flesh: {
    id: 'summon_wall_of_flesh',
    name: 'Кукла Вуду Гида',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Стену Плоти — гигантского хранителя преисподней!',
    summonsBoss: 'wall_of_flesh',
    color: '#7f1d1d',
    accent: '#f43f5e',
  },
  summon_queen_slime: {
    id: 'summon_queen_slime',
    name: 'Желатиновый кристалл',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Королеву Слизней с кристальными крыльями!',
    summonsBoss: 'queen_slime',
    color: '#ec4899',
    accent: '#a5f3fc',
  },
  summon_twins: {
    id: 'summon_twins',
    name: 'Механический глаз',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Близнецов — Ретиназера и Спазматизма!',
    summonsBoss: 'the_twins',
    color: '#475569',
    accent: '#22c55e',
  },
  summon_destroyer: {
    id: 'summon_destroyer',
    name: 'Механический червь',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Уничтожителя — гигантского стального змея из лазеров!',
    summonsBoss: 'the_destroyer',
    color: '#334155',
    accent: '#ef4444',
  },
  summon_skeletron_prime: {
    id: 'summon_skeletron_prime',
    name: 'Механический череп',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Скелетрона Прайма с 4 стальными руками!',
    summonsBoss: 'skeletron_prime',
    color: '#64748b',
    accent: '#f87171',
  },
  summon_plantera: {
    id: 'summon_plantera',
    name: 'Бутон Плантеры',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Плантеру — яростный цветок подземных джунглей!',
    summonsBoss: 'plantera',
    color: '#db2777',
    accent: '#4ade80',
  },
  summon_golem: {
    id: 'summon_golem',
    name: 'Ядро Голема',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает древнего каменного Голема храма!',
    summonsBoss: 'golem',
    color: '#92400e',
    accent: '#facc15',
  },
  summon_duke_fishron: {
    id: 'summon_duke_fishron',
    name: 'Трюфельный червь',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Герцога Рыброна — повелителя морских бурь!',
    summonsBoss: 'duke_fishron',
    color: '#0d9488',
    accent: '#67e8f9',
  },
  summon_empress_light: {
    id: 'summon_empress_light',
    name: 'Призматическая златоглазка',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Императрицу Света с радужными лучами!',
    summonsBoss: 'empress_light',
    color: '#f472b6',
    accent: '#fde047',
  },
  summon_cultist: {
    id: 'summon_cultist',
    name: 'Небесная печать',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает Культиста-Лунатика — предвестника Лунного Лорда!',
    summonsBoss: 'lunatic_cultist',
    color: '#1d4ed8',
    accent: '#fde047',
  },
  summon_moon_lord: {
    id: 'summon_moon_lord',
    name: 'Сигил Лунного Лорда',
    category: 'summon',
    maxStack: 10,
    description: 'Призывает финального босса Террарии — Лунного Лорда!',
    summonsBoss: 'moon_lord',
    color: '#0f766e',
    accent: '#5eead4',
  },
};

export const RECIPES: CraftingRecipe[] = [
  // === HAND CRAFTING (Simple 1-2 ingredient basics) ===
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

  // === FURNACE: SMELTING (Clean 2:1 or 1:1) ===
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

  // === PICKAXES (Compact 2-ingredient crafts!) ===
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

  // === WEAPONS: SWORDS, BOWS, SPEARS & MAGIC ===
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

  // === FOOD & BOSS SUMMONERS ===
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
    id: 'craft_summon_moon_lord',
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

  // === TERRARIA EXTRAS: FURNITURE, CRYSTALS, HOOK & LEGENDARY GEAR ===
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

  // === ARMOR SETS & ACCESSORIES (Compact <= 3 ingredients, <= 8 count!) ===
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

  // Also stock backpack with building materials, furniture & Terraria gear
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
    case TileType.CrimsonDirt:
      return 'crimson_dirt';
    case TileType.Crimstone:
      return 'crimstone_block';
    case TileType.CrimsonBrick:
      return 'crimson_brick';
    case TileType.CrimsonWood:
      return 'crimson_wood';
    case TileType.CrimsonLeaves:
      return Math.random() < 0.3 ? 'crimson_wood' : null;
    case TileType.Sand:
      return 'sand_block';
    case TileType.SandstoneBrick:
      return 'sandstone_brick';
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
): { ok: boolean; given: number; leftover: number; itemName: string } {
  const def = ITEMS[itemId];
  if (!def) {
    return { ok: false, given: 0, leftover: 0, itemName: itemId };
  }
  const safeCount = Math.max(1, Math.min(999, Math.floor(Number.isFinite(rawCount) ? rawCount : 1)));
  const leftover = addItemToInventory(hotbar, backpack, itemId, safeCount);
  const given = safeCount - leftover;
  return { ok: given > 0, given, leftover, itemName: def.name };
}

export const ARMOR_SET_META: Record<
  ArmorSetId,
  { label: string; color: string; accent: string; bonusText: string }
> = {
  wood: {
    label: 'Деревянный сет',
    color: '#92400e',
    accent: '#d97706',
    bonusText: '+2 доп. защиты',
  },
  copper: {
    label: 'Медный сет',
    color: '#c2410c',
    accent: '#fdba74',
    bonusText: '+2 защиты и +8% скорости бега',
  },
  iron: {
    label: 'Железный сет',
    color: '#64748b',
    accent: '#e2e8f0',
    bonusText: '+3 доп. защиты',
  },
  gold: {
    label: 'Золотой сет',
    color: '#ca8a04',
    accent: '#fef08a',
    bonusText: '+4 защиты и +10% урона',
  },
  crimson: {
    label: 'Багровый сет',
    color: '#991b1b',
    accent: '#f87171',
    bonusText: '+2.0 HP/сек регенерации',
  },
  obsidian: {
    label: 'Обсидиановый сет',
    color: '#312e81',
    accent: '#a78bfa',
    bonusText: '+18% урона и анти-падение',
  },
  crystal: {
    label: 'Кристальный сет',
    color: '#0284c7',
    accent: '#67e8f9',
    bonusText: '+25% урона, +40 маны и -20% расхода маны',
  },
};

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
): { equipped: boolean; slotKey?: EquipSlotKey; reason?: string } {
  const arr = fromArea === 'hotbar' ? hotbar : backpack;
  if (fromIndex < 0 || fromIndex >= arr.length) {
    return { equipped: false, reason: 'Неверный слот инвентаря' };
  }
  const slot = arr[fromIndex];
  if (!slot) {
    return { equipped: false, reason: 'Слот пуст' };
  }
  const def = ITEMS[slot.itemId];
  if (!def) {
    return { equipped: false, reason: 'Неизвестный предмет' };
  }

  let chosenKey: EquipSlotKey | undefined = targetSlotKey;

  if (def.category === 'armor' && def.armorSlot) {
    if (chosenKey && chosenKey !== def.armorSlot) {
      return { equipped: false, reason: 'Этот предмет не подходит в выбранный слот брони' };
    }
    chosenKey = def.armorSlot;
  } else if (def.category === 'accessory') {
    if (chosenKey && !chosenKey.startsWith('acc')) {
      return { equipped: false, reason: 'Аксессуар можно надеть только в слот аксессуаров' };
    }
    if (!chosenKey) {
      const emptyIdx = equipment.accessories.findIndex((s) => s === null);
      chosenKey = (`acc${emptyIdx >= 0 ? emptyIdx : 0}`) as EquipSlotKey;
    }
  } else {
    return { equipped: false, reason: 'Можно надеть только броню или аксессуар' };
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
  { label: string; description: string; items: { itemId: string; count: number }[] }
> = {
  empty: {
    label: 'Пустой сундук',
    description: 'Чистый сундук для хранения вещей.',
    items: [],
  },
  summons: {
    label: 'Призывалки боссов (Pre-HM)',
    description: 'Базовые призывалки, лечебные зелья и факелы.',
    items: [
      { itemId: 'summon_kotulhu', count: 2 },
      { itemId: 'summon_cat_worm', count: 2 },
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
    label: 'Хардмод призывалки (Все 10)',
    description: 'Механические боссы, Плантера, Голем, Рыброн, Императрица и Лунный Лорд.',
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
      { itemId: 'summon_moon_lord', count: 2 },
    ],
  },
  armor: {
    label: 'Набор брони и крыльев',
    description: 'Кристальная и обсидиановая броня, крылья ангела и топовые аксессуары.',
    items: [
      { itemId: 'crystal_helmet', count: 1 },
      { itemId: 'crystal_chestplate', count: 1 },
      { itemId: 'crystal_greaves', count: 1 },
      { itemId: 'angel_wings', count: 1 },
      { itemId: 'cobalt_shield', count: 1 },
      { itemId: 'hermes_boots', count: 1 },
      { itemId: 'celestial_emblem', count: 1 },
      { itemId: 'mana_flower', count: 1 },
      { itemId: 'shiny_red_balloon', count: 1 },
      { itemId: 'band_of_regen', count: 1 },
    ],
  },
  terraria: {
    label: 'Сокровищница Террарии',
    description: 'Звёздная ярость, Терра-клинок, крюк, аксессуары и кристаллы.',
    items: [
      { itemId: 'starfury', count: 1 },
      { itemId: 'terra_blade', count: 1 },
      { itemId: 'minishark', count: 1 },
      { itemId: 'water_bolt', count: 1 },
      { itemId: 'grappling_hook', count: 1 },
      { itemId: 'cloud_in_bottle', count: 1 },
      { itemId: 'hermes_boots', count: 1 },
      { itemId: 'angel_wings', count: 1 },
      { itemId: 'magic_mirror', count: 1 },
      { itemId: 'life_crystal', count: 3 },
      { itemId: 'fallen_star', count: 10 },
      { itemId: 'dynamite', count: 10 },
    ],
  },
  builder: {
    label: 'Строительный сундук',
    description: 'Чертежи домов, доски, стены, мебель и станции крафта.',
    items: [
      { itemId: 'house_blueprint', count: 3 },
      { itemId: 'planks_block', count: 99 },
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

