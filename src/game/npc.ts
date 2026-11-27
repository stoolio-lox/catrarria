import { ITEMS } from './catalog';
import { moveEntityWithTiles } from './physics';
import {
  BiomeType,
  EnemyEntity,
  Language,
  NpcAppearance,
  NpcEntity,
  NpcKind,
  PlayerState,
  TILE_SIZE,
  TileType,
  WorldData,
} from './types';
import { findValidNpcHouses, getBiomeAtX, getTile, setTile } from './worldGen';

export interface NpcTemplate {
  kind: NpcKind;
  name: string;
  title: string;
  nameRu: string;
  titleRu: string;
  appearance: NpcAppearance;
  shopItemIds: string[];
}

export const NPC_TEMPLATES: Record<NpcKind, NpcTemplate> = {
  guide: {
    kind: 'guide',
    name: 'Max',
    title: 'Guide',
    nameRu: 'Максим',
    titleRu: 'Гид',
    appearance: {
      skin: '#f6c7a6',
      skinShade: '#df9e78',
      hair: '#6b4226',
      hairStyle: 'parted',
      hat: 'none',
      shirt: '#2e7d32',
      pants: '#5c4033',
      eyeColor: '#1e3a8a',
      blush: '#f48fb1',
    },
    shopItemIds: ['house_blueprint', 'table_item', 'chair_item', 'torch_item', 'rope_item'],
  },
  merchant: {
    kind: 'merchant',
    name: 'Boris',
    title: 'Merchant',
    nameRu: 'Борис',
    titleRu: 'Торговец',
    appearance: {
      skin: '#f1c29b',
      skinShade: '#d59c72',
      hair: '#cbd5e1',
      hairStyle: 'beard',
      hat: 'tophat',
      shirt: '#1d4ed8',
      apron: '#fef3c7',
      pants: '#334155',
      eyeColor: '#0f172a',
      blush: '#fb7185',
      glasses: true,
    },
    shopItemIds: [
      'torch_item',
      'rope_item',
      'campfire_item',
      'sunflower_item',
      'healing_potion',
      'mana_potion',
      'recall_potion',
      'piggy_bank_item',
      'grappling_hook',
      'copper_pickaxe',
      'copper_bow',
      'minishark',
      'house_blueprint',
    ],
  },
  nurse: {
    kind: 'nurse',
    name: 'Alina',
    title: 'Nurse',
    nameRu: 'Алина',
    titleRu: 'Медсестра',
    appearance: {
      skin: '#ffe0c8',
      skinShade: '#e8b391',
      hair: '#facc15',
      hairStyle: 'bun',
      hat: 'nurse',
      shirt: '#f8fafc',
      apron: '#fda4af',
      pants: '#e2e8f0',
      eyeColor: '#0284c7',
      blush: '#f472b6',
    },
    shopItemIds: [
      'healing_potion',
      'mana_potion',
      'milk_potion',
      'red_potion',
      'regen_potion',
      'ironskin_potion',
      'swiftness_potion',
      'heart_lantern_item',
      'warm_milk',
      'life_crystal',
    ],
  },
  demolitionist: {
    kind: 'demolitionist',
    name: 'Grisha',
    title: 'Demolitionist',
    nameRu: 'Гриша',
    titleRu: 'Подрывник',
    appearance: {
      skin: '#ebb893',
      skinShade: '#c68d65',
      hair: '#c2410c',
      hairStyle: 'beard',
      hat: 'helmet',
      shirt: '#7c2d12',
      apron: '#451a03',
      pants: '#1e293b',
      eyeColor: '#1e293b',
      blush: '#fb923c',
    },
    shopItemIds: ['terraria_bomb', 'dynamite', 'iron_bar', 'gold_bar', 'obsidian_block'],
  },
  dryad: {
    kind: 'dryad',
    name: 'Liza',
    title: 'Dryad',
    nameRu: 'Лиза',
    titleRu: 'Дриада',
    appearance: {
      skin: '#f5cfb3',
      skinShade: '#d8a684',
      hair: '#15803d',
      hairStyle: 'crown',
      hat: 'leaves',
      shirt: '#16a34a',
      pants: '#14532d',
      eyeColor: '#10b981',
      blush: '#fda4af',
    },
    shopItemIds: [
      'sunflower_item',
      'cloud_in_bottle',
      'hermes_boots',
      'band_of_regen',
      'magic_mirror',
      'featherfall_potion',
      'shine_potion',
      'heartreach_potion',
      'life_crystal',
      'mana_crystal',
      'crystal_block',
    ],
  },
  director: {
    kind: 'director',
    name: 'Meow',
    title: 'Director',
    nameRu: 'Зазу',
    titleRu: 'Директор',
    appearance: {
      skin: '#d6d3d1',
      skinShade: '#a8a29e',
      hair: '#475569',
      hairStyle: 'short',
      hat: 'suit',
      shirt: '#1e293b',
      apron: '#f8fafc',
      pants: '#0f172a',
      eyeColor: '#16a34a',
      blush: '#fb7185',
      textureSrc: '/assets/aistudio/dir_72c7e44f.jpg',
    },
    shopItemIds: [
      'red_potion',
      'milk_potion',
      'wrath_potion',
      'obsidian_skin_potion',
      'summon_pharaoh_cat',
      'summon_alien_invasion',
      'summon_jester_cat',
      'summon_pillars',
      'angel_wings',
      'terraspark_boots',
      'ankh_shield',
      'magic_mirror',
      'dynamite',
      'house_blueprint',
    ],
  },
};

export function getNpcDisplay(kind: NpcKind, lang: Language = 'en'): { name: string; title: string } {
  const tpl = NPC_TEMPLATES[kind];
  return lang === 'ru'
    ? { name: tpl.nameRu, title: tpl.titleRu }
    : { name: tpl.name, title: tpl.title };
}

export function createNpc(
  id: number,
  kind: NpcKind,
  x: number,
  y: number,
  homeTileX: number | null = null,
  homeTileY: number | null = null,
  lang: Language = 'en',
): NpcEntity {
  const tpl = NPC_TEMPLATES[kind];
  const disp = getNpcDisplay(kind, lang);
  return {
    id,
    kind,
    name: disp.name,
    title: disp.title,
    x,
    y,
    vx: 0,
    vy: 0,
    width: 24,
    height: 44,
    facing: 1,
    onGround: false,
    homeTileX,
    homeTileY,
    hp: 250,
    maxHp: 250,
    walkDistance: 0,
    blinkTimer: 1.5 + Math.random() * 2.5,
    actionState: 'idle',
    stateTimer: 1.4,
    attackCooldown: 0,
    speechText: null,
    speechTimer: 0,
    appearance: { ...tpl.appearance },
  };
}

export function getNpcShopItems(kind: NpcKind): { itemId: string; price: number }[] {
  const tpl = NPC_TEMPLATES[kind];
  return tpl.shopItemIds
    .filter((id) => Boolean(ITEMS[id]))
    .map((id) => ({
      itemId: id,
      price: ITEMS[id].shopPrice ?? 20,
    }));
}

export function getNpcDialogue(
  npc: NpcEntity,
  opts: {
    isNight: boolean;
    biome: BiomeType;
    validHouseCount: number;
    hasBoss: boolean;
    stoolPetted: boolean;
  },
  lang: Language = 'en',
): string {
  if (opts.hasBoss) {
    if (lang === 'ru') {
      switch (npc.kind) {
        case 'guide':
          return 'Держись, котик! Прыгай по платформам и бей босса издалека луком или магией!';
        case 'nurse':
          return 'Осторожнее там! Если здоровье упадёт, забегай ко мне — я мигом подлечу!';
        case 'demolitionist':
          return 'Закидай этого босса динамитом! Ничто не устоит перед хорошим взрывом!';
        case 'director':
          return 'Коллега, бюджет на битву с боссом одобрен! Можешь призвать хоть пять сразу!';
        default:
          return 'Мы верим в тебя! Покажи этому чудищу силу кошачьих лап!';
      }
    }
    switch (npc.kind) {
      case 'guide':
        return 'Stay sharp, kitty! Hop across platforms and strike the boss from afar with bows or magic!';
      case 'nurse':
        return 'Be careful out there! If your HP drops low, swing by me for an instant heal!';
      case 'demolitionist':
        return 'Blast that boss with Dynamite! Nothing survives a proper mining explosion!';
      case 'director':
        return 'Overtime battle budget approved! Remember, you can summon multiple bosses at once if you dare!';
      default:
        return 'We believe in you! Show that monster the power of Zazu paws!';
    }
  }

  if (lang === 'ru') {
    switch (npc.kind) {
      case 'guide':
        if (opts.validHouseCount === 0) {
          return 'Построй домик: стены, фон, дверь, свет (факел/люстра), стол и стул — и придут новые жители! Или используй «Чертёж уютного дома».';
        }
        if (opts.isNight) {
          return 'Ночью выходят монстры, зато падают Упавшие звёзды! 3 звезды = Кристалл Маны.';
        }
        if (!opts.stoolPetted) {
          return 'Кстати, рядом со спавном стоит особенная табуретка. Погладь её (ЛКМ), а потом нажми ПКМ!';
        }
        return `Отлично! У тебя уже ${opts.validHouseCount} жилых комнат. На западе Пустыня с Пирамидой и боссом Насерафалом II!`;

      case 'merchant':
        if (opts.biome === 'snow') {
          return 'Брр, морозно! Запасайся факелами, верёвками и лечебными зельями!';
        }
        if (opts.biome === 'desert') {
          return 'Жаркая Пустыня полна песка и древних сокровищ в Пирамиде!';
        }
        return 'Монетки звенят в кармане? Загляни в лавку — есть Крюк-кошка, Мини-акула и чертежи домов!';

      case 'nurse':
        return 'Милый котик, не забывай проверять царапины! Могу полностью восстановить здоровье за пару монет.';

      case 'demolitionist':
        return 'Кирка — это скучно! Возьми Терра-бомбу или Динамит — проломишь Пирамиду и пещеры за секунду!';

      case 'dryad':
        if (opts.biome === 'crimson') {
          return 'Багряный биом полон тревожной энергии, будь начеку!';
        }
        if (opts.biome === 'crystal') {
          return 'Кристальная долина сияет древней магией — идеальное место для крыльев и брони!';
        }
        return 'У меня есть волшебные аксессуары Террарии: Облако в бутылке для двойного прыжка и Ботинки Гермеса!';

      case 'director':
        return 'Добро пожаловать в офис Котаррии! Продаю призыв Насерафала II, Марсианский Кото-Зонд и Маяк 4 Небесных Башен.';
    }
  }

  switch (npc.kind) {
    case 'guide':
      if (opts.validHouseCount === 0) {
        return 'Build a house with walls, background wall, door, light, table & chair to welcome new villagers! Or use a Cozy House Blueprint.';
      }
      if (opts.isNight) {
        return 'Monsters prowl at night, but Fallen Stars drop from the sky! Craft 3 into a Mana Crystal.';
      }
      if (!opts.stoolPetted) {
        return 'Psst! Check out the Starter Stool near spawn — pet it with LMB first, then right-click it!';
      }
      return `Awesome! You have ${opts.validHouseCount} valid houses. Head west to raid the Desert Pyramid and challenge Naserafal II!`;

    case 'merchant':
      if (opts.biome === 'snow') {
        return 'Brrr, chilly Tundra! Stock up on torches, climbing ropes, and healing potions!';
      }
      if (opts.biome === 'desert') {
        return 'Hot sands ahead! Bring ropes for descending into the Desert Pyramid burial chamber.';
      }
      return 'Got shiny coins jingling? Check my shop for Grappling Hooks, the Minishark, and House Blueprints!';

    case 'nurse':
      return 'Sweet kitty, keep those whiskers healthy! I can restore all your HP and Mana in a blink.';

    case 'demolitionist':
      return 'Pickaxes are too slow! Grab a bundle of Dynamite and blast straight into the Underworld!';

    case 'dryad':
      if (opts.biome === 'crimson') {
        return 'The Crimson radiates fierce bloodstone energy — stay alert!';
      }
      if (opts.biome === 'crystal') {
        return 'Crystal Hollow shimmers with pure mana! Mine Crystal Shards for endgame wings & armor.';
      }
      return 'I carry classic Terraria accessories: Cloud in a Bottle for double jumps and Hermes Boots!';

    case 'director':
      return 'Cat HQ quarterly report: Pharaoh Naserafal II, Martian Cat Probe & Celestial Pillar Beacons are now in stock!';
  }
}

export function syncVillageNpcs(
  npcs: NpcEntity[],
  world: WorldData,
  nextIdFn: () => number,
  player: PlayerState,
  bossDefeated: boolean,
  forceInviteAll = false,
  lang: Language = 'en',
): { spawnedNames: string[]; validHouseCount: number } {
  const houses = findValidNpcHouses(world);
  const spawnedNames: string[] = [];

  for (const npc of npcs) {
    const disp = getNpcDisplay(npc.kind, lang);
    npc.name = disp.name;
    npc.title = disp.title;
  }

  // Ensure Guide Max always exists
  if (!npcs.some((n) => n.kind === 'guide')) {
    const spawnX = Math.floor(world.width / 2) - 4;
    const spawnY = world.surfaceHeights[spawnX] - 2;
    const guide = createNpc(nextIdFn(), 'guide', spawnX * TILE_SIZE, spawnY * TILE_SIZE, null, null, lang);
    guide.speechText =
      lang === 'ru' ? 'Привет, котик! Я гид Максим.' : 'Hey kitty! I am Max the Guide.';
    guide.speechTimer = 5;
    npcs.push(guide);
  }

  const assignFreeHomes = () => {
    const usedHomes = new Set<string>();
    for (const npc of npcs) {
      if (npc.homeTileX !== null && npc.homeTileY !== null) {
        const stillValid = houses.some(
          (h) => h.centerTileX === npc.homeTileX && h.centerTileY === npc.homeTileY,
        );
        if (stillValid) {
          usedHomes.add(`${npc.homeTileX},${npc.homeTileY}`);
        } else {
          npc.homeTileX = null;
          npc.homeTileY = null;
        }
      }
    }
    for (const npc of npcs) {
      if (npc.homeTileX === null) {
        const free = houses.find((h) => !usedHomes.has(`${h.centerTileX},${h.centerTileY}`));
        if (free) {
          npc.homeTileX = free.centerTileX;
          npc.homeTileY = free.centerTileY;
          usedHomes.add(`${free.centerTileX},${free.centerTileY}`);
        }
      }
    }
  };

  assignFreeHomes();

  // Unlock sequence for Terraria-style villagers + Director Meow
  const desiredKinds: NpcKind[] = ['guide'];
  if (forceInviteAll || houses.length >= 1 || player.coins >= 20) desiredKinds.push('merchant');
  if (forceInviteAll || houses.length >= 2 || player.maxHp > 100) desiredKinds.push('nurse');
  if (forceInviteAll || houses.length >= 3) desiredKinds.push('demolitionist');
  if (forceInviteAll || houses.length >= 4 || bossDefeated) desiredKinds.push('dryad');
  if (forceInviteAll || houses.length >= 5 || bossDefeated) desiredKinds.push('director');

  for (const kind of desiredKinds) {
    if (!npcs.some((n) => n.kind === kind)) {
      const freeHouse = houses.find(
        (h) => !npcs.some((n) => n.homeTileX === h.centerTileX && n.homeTileY === h.centerTileY),
      );
      const tx = freeHouse
        ? freeHouse.centerTileX
        : Math.max(4, Math.min(world.width - 4, Math.floor(player.x / TILE_SIZE) + (npcs.length % 2 === 0 ? -5 : 5)));
      const ty = freeHouse ? freeHouse.floorY - 2 : world.surfaceHeights[tx] - 2;
      const npc = createNpc(
        nextIdFn(),
        kind,
        tx * TILE_SIZE,
        ty * TILE_SIZE,
        freeHouse ? freeHouse.centerTileX : null,
        freeHouse ? freeHouse.centerTileY : null,
        lang,
      );
      npc.speechText =
        lang === 'ru'
          ? `Всем привет! Я ${npc.title} ${npc.name}!`
          : `Hello there! I am ${npc.title} ${npc.name}!`;
      npc.speechTimer = 4.5;
      npcs.push(npc);
      spawnedNames.push(`${npc.title} ${npc.name}`);
    }
  }

  assignFreeHomes();

  return { spawnedNames, validHouseCount: houses.length };
}

export function stepNpcAI(
  npc: NpcEntity,
  world: WorldData,
  player: PlayerState,
  enemies: EnemyEntity[],
  isNight: boolean,
  dt: number,
): { shootAt?: { targetX: number; targetY: number; color: string } } {
  npc.attackCooldown = Math.max(0, npc.attackCooldown - dt);
  if (npc.speechTimer > 0) {
    npc.speechTimer -= dt;
    if (npc.speechTimer <= 0) npc.speechText = null;
  }

  npc.blinkTimer -= dt;
  if (npc.blinkTimer <= -0.14) {
    npc.blinkTimer = 2.1 + Math.random() * 2.8;
  }

  let nearestThreat: EnemyEntity | null = null;
  let nearestThreatDist = 230;
  const ncx = npc.x + npc.width / 2;
  const ncy = npc.y + npc.height / 2;
  for (const e of enemies) {
    if (e.aiState === 'ko') continue;
    const d = Math.hypot(e.x + e.width / 2 - ncx, e.y + e.height / 2 - ncy);
    if (d < nearestThreatDist) {
      nearestThreatDist = d;
      nearestThreat = e;
    }
  }

  let shootAt: { targetX: number; targetY: number; color: string } | undefined;
  if (nearestThreat) {
    npc.facing = nearestThreat.x + nearestThreat.width / 2 >= ncx ? 1 : -1;
    npc.actionState = 'attack';
    npc.vx *= Math.max(0, 1 - dt * 10);
    if (npc.attackCooldown <= 0) {
      npc.attackCooldown = 1.15;
      shootAt = {
        targetX: nearestThreat.x + nearestThreat.width / 2,
        targetY: nearestThreat.y + nearestThreat.height / 2,
        color:
          npc.kind === 'dryad'
            ? '#22c55e'
            : npc.kind === 'demolitionist'
              ? '#f97316'
              : npc.kind === 'nurse'
                ? '#f472b6'
                : npc.kind === 'director'
                  ? '#38bdf8'
                  : '#fde047',
      };
    }
  } else {
    npc.stateTimer -= dt;
    const distToPlayer = Math.hypot(player.x + player.width / 2 - ncx, player.y + player.height / 2 - ncy);

    const homeWx = npc.homeTileX !== null ? (npc.homeTileX + 0.5) * TILE_SIZE : null;
    if (isNight && homeWx !== null && Math.abs(homeWx - ncx) > 36) {
      npc.actionState = 'walk';
      npc.facing = homeWx >= ncx ? 1 : -1;
      npc.stateTimer = 1.2;
    } else if (npc.stateTimer <= 0) {
      const ntx = Math.floor(ncx / TILE_SIZE);
      const nty = Math.floor((npc.y + npc.height - 8) / TILE_SIZE);
      const nearSeat =
        getTile(world, ntx, nty) === TileType.Chair ||
        getTile(world, ntx, nty) === TileType.Stool ||
        getTile(world, ntx - 1, nty) === TileType.Chair ||
        getTile(world, ntx + 1, nty) === TileType.Chair;

      const roll = Math.random();
      if (distToPlayer < 110 && roll < 0.35) {
        npc.actionState = 'wave';
        npc.facing = player.x + player.width / 2 >= ncx ? 1 : -1;
        npc.stateTimer = 1.4;
      } else if (nearSeat && roll < 0.6) {
        npc.actionState = 'sit';
        npc.stateTimer = 2.6 + Math.random() * 2.0;
      } else if (roll < 0.25 && (npc.kind === 'guide' || npc.kind === 'director')) {
        npc.actionState = 'read';
        npc.stateTimer = 2.2 + Math.random() * 1.4;
      } else if (roll < 0.72) {
        npc.actionState = 'walk';
        if (homeWx !== null && Math.abs(ncx - homeWx) > 170) {
          npc.facing = homeWx >= ncx ? 1 : -1;
        } else {
          npc.facing = Math.random() < 0.5 ? 1 : -1;
        }
        npc.stateTimer = 1.5 + Math.random() * 2.0;
      } else {
        npc.actionState = 'idle';
        if (distToPlayer < 160) {
          npc.facing = player.x + player.width / 2 >= ncx ? 1 : -1;
        }
        npc.stateTimer = 1.3 + Math.random() * 1.6;
      }
    }

    if (npc.actionState === 'walk') {
      const targetVx = npc.facing * 72;
      npc.vx += (targetVx - npc.vx) * Math.min(1, dt * 10);
      const aheadTx = Math.floor((ncx + npc.facing * 18) / TILE_SIZE);
      const torsoTy = Math.floor((npc.y + npc.height * 0.65) / TILE_SIZE);
      if (getTile(world, aheadTx, torsoTy) === TileType.DoorClosed) {
        setTile(world, aheadTx, torsoTy, TileType.DoorOpen);
      }
      if (getTile(world, aheadTx, torsoTy - 1) === TileType.DoorClosed) {
        setTile(world, aheadTx, torsoTy - 1, TileType.DoorOpen);
      }
    } else {
      npc.vx *= Math.max(0, 1 - dt * 12);
    }
  }

  npc.vy = Math.min(680, npc.vy + 1280 * dt);
  const { hitWall } = moveEntityWithTiles(npc, world, dt, false);
  if (hitWall && npc.actionState === 'walk') {
    if (npc.onGround && Math.random() < 0.55) {
      npc.vy = -340;
    } else {
      npc.facing = (npc.facing * -1) as 1 | -1;
    }
  }

  if (npc.onGround) {
    npc.walkDistance += Math.abs(npc.vx) * dt;
  }

  return { shootAt };
}

export function getNpcWorldBiome(npc: NpcEntity, world: WorldData) {
  const tx = Math.max(0, Math.min(world.width - 1, Math.floor((npc.x + npc.width / 2) / TILE_SIZE)));
  return getBiomeAtX(tx, world.width);
}
