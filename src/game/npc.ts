import { ITEMS } from './catalog';
import { moveEntityWithTiles } from './physics';
import {
  EnemyEntity,
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
  appearance: NpcAppearance;
  shopItemIds: string[];
}

export const NPC_TEMPLATES: Record<NpcKind, NpcTemplate> = {
  guide: {
    kind: 'guide',
    name: 'Максим',
    title: 'Гид',
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
    name: 'Борис',
    title: 'Торговец',
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
      'healing_potion',
      'mana_potion',
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
    name: 'Алина',
    title: 'Медсестра',
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
    shopItemIds: ['healing_potion', 'mana_potion', 'warm_milk', 'life_crystal'],
  },
  demolitionist: {
    kind: 'demolitionist',
    name: 'Гриша',
    title: 'Подрывник',
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
    name: 'Лиза',
    title: 'Дриада',
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
      'cloud_in_bottle',
      'hermes_boots',
      'band_of_regen',
      'magic_mirror',
      'life_crystal',
      'mana_crystal',
      'crystal_block',
    ],
  },
};

export function createNpc(
  id: number,
  kind: NpcKind,
  x: number,
  y: number,
  homeTileX: number | null = null,
  homeTileY: number | null = null,
): NpcEntity {
  const tpl = NPC_TEMPLATES[kind];
  return {
    id,
    kind,
    name: tpl.name,
    title: tpl.title,
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
    biome: 'forest' | 'snow' | 'crimson';
    validHouseCount: number;
    hasBoss: boolean;
    stoolPetted: boolean;
  },
): string {
  if (opts.hasBoss) {
    switch (npc.kind) {
      case 'guide':
        return 'Держись, котик! Прыгай по платформам и бей босса издалека луком или магией!';
      case 'nurse':
        return 'Осторожнее там! Если здоровье упадёт, забегай ко мне — я мигом подлечу!';
      case 'demolitionist':
        return 'Закидай этого босса динамитом! Ничто не устоит перед хорошим взрывом!';
      default:
        return 'Мы верим в тебя! Покажи этому чудищу силу кошачьих лап!';
    }
  }

  switch (npc.kind) {
    case 'guide':
      if (opts.validHouseCount === 0) {
        return 'Построй домик: стены, задний фон, дверь, свет (факел/люстра), стол и стул — и придут новые жители! Или используй «Чертёж уютного дома» из рюкзака.';
      }
      if (opts.isNight) {
        return 'Ночью выходят гоблины и скелеты, зато с неба падают Упавшие звёзды! Собери 3 штуки для Кристалла Маны.';
      }
      if (!opts.stoolPetted) {
        return 'Кстати, рядом со спавном стоит особенная табуретка. Попробуй её погладить, а потом нажать ПКМ!';
      }
      return `Отлично! У тебя уже ${opts.validHouseCount} жилых комнат. Ищи под землёй Кристаллы Жизни, горшки с монетами и сундуки!`;

    case 'merchant':
      if (opts.biome === 'snow') {
        return 'Брр, прохладно! Запасайся факелами, верёвками и лечебными зельями!';
      }
      return 'Золотые монетки звенят в кармане? Загляни в лавку — есть Крюк-кошка, Мини-акула и чертежи домов!';

    case 'nurse':
      return 'Милый котик, не забывай проверять царапины! Могу полностью восстановить здоровье за пару монет.';

    case 'demolitionist':
      return 'Кирка — это скучно! Возьми Терра-бомбу или Динамит — проломишь любую пещеру за секунду!';

    case 'dryad':
      return opts.biome === 'crimson'
        ? 'Красный биом полон тревожной энергии, будь начеку!'
        : 'У меня есть волшебные аксессуары Террарии: Облако в бутылке для двойного прыжка и Ботинки Гермеса!';
  }
}

export function syncVillageNpcs(
  npcs: NpcEntity[],
  world: WorldData,
  nextIdFn: () => number,
  player: PlayerState,
  bossDefeated: boolean,
  forceInviteAll = false,
): { spawnedNames: string[]; validHouseCount: number } {
  const houses = findValidNpcHouses(world);
  const spawnedNames: string[] = [];

  // Ensure Guide Максим always exists
  if (!npcs.some((n) => n.kind === 'guide')) {
    const spawnX = Math.floor(world.width / 2) - 4;
    const spawnY = world.surfaceHeights[spawnX] - 2;
    const guide = createNpc(nextIdFn(), 'guide', spawnX * TILE_SIZE, spawnY * TILE_SIZE);
    guide.speechText = 'Привет, котик! Я гид Максим.';
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

  // Let existing villagers (starting with Guide) settle into newly built houses first
  assignFreeHomes();

  // Unlock sequence for Terraria-style villagers
  const desiredKinds: NpcKind[] = ['guide'];
  if (forceInviteAll || houses.length >= 1 || player.coins >= 20) desiredKinds.push('merchant');
  if (forceInviteAll || houses.length >= 2 || player.maxHp > 100) desiredKinds.push('nurse');
  if (forceInviteAll || houses.length >= 3) desiredKinds.push('demolitionist');
  if (forceInviteAll || houses.length >= 4 || bossDefeated) desiredKinds.push('dryad');

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
      );
      npc.speechText = `Всем привет! Я ${npc.title} ${npc.name}!`;
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

  // Natural human blinking cycle
  npc.blinkTimer -= dt;
  if (npc.blinkTimer <= -0.14) {
    npc.blinkTimer = 2.1 + Math.random() * 2.8;
  }

  // Check if an enemy is threatening nearby -> defend village!
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
                : '#fde047',
      };
    }
  } else {
    npc.stateTimer -= dt;
    const distToPlayer = Math.hypot(player.x + player.width / 2 - ncx, player.y + player.height / 2 - ncy);

    // At night, return toward home if assigned
    const homeWx = npc.homeTileX !== null ? (npc.homeTileX + 0.5) * TILE_SIZE : null;
    if (isNight && homeWx !== null && Math.abs(homeWx - ncx) > 36) {
      npc.actionState = 'walk';
      npc.facing = homeWx >= ncx ? 1 : -1;
      npc.stateTimer = 1.2;
    } else if (npc.stateTimer <= 0) {
      // Choose a natural human behavior
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
      } else if (roll < 0.25 && npc.kind === 'guide') {
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
      // Human-like door handling: open closed door directly ahead
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
