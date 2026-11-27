import { drawBossEnemy } from './bossRenderer';
import { ITEMS } from './catalog';
import {
  DropEntity,
  EnemyEntity,
  EquipmentState,
  FloatingText,
  Language,
  NpcEntity,
  Particle,
  PlayerState,
  ProjectileEntity,
  TILE_SIZE,
  TileType,
  WallType,
  WorldData,
} from './types';
import { getBiomeAtX, getTileMaxDamage, isTileSolid } from './worldGen';

export interface LoadedTextures {
  catImg: HTMLImageElement | null;
  skyImg: HTMLImageElement | null;
  swordImg: HTMLImageElement | null;
  kotulhuImg: HTMLImageElement | null;
  catWormImg: HTMLImageElement | null;
  pharaohImg: HTMLImageElement | null;
  jesterImg: HTMLImageElement | null;
  sunImg: HTMLImageElement | null;
  atomicImg: HTMLImageElement | null;
  partyImg: HTMLImageElement | null;
  melonImg: HTMLImageElement | null;
  alienImg: HTMLImageElement | null;
  directorImg: HTMLImageElement | null;
  grassTufts: HTMLImageElement[];
}

function canvasToImage(canvas: HTMLCanvasElement, cb: (img: HTMLImageElement) => void): void {
  const outImg = new Image();
  outImg.onload = () => cb(outImg);
  outImg.src = canvas.toDataURL('image/png');
}

function cropOpaqueCanvas(img: HTMLImageElement, stripWhite = false): HTMLCanvasElement {
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  const maxDim = 192;
  const scale = Math.min(1, maxDim / Math.max(1, natW, natH));
  const w = Math.max(1, Math.round(natW * scale));
  const h = Math.max(1, Math.round(natH * scale));

  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d');
  if (!sctx) return src;
  sctx.drawImage(img, 0, 0, w, h);
  const data = sctx.getImageData(0, 0, w, h);
  const px = data.data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (stripWhite && px[i] > 230 && px[i + 1] > 230 && px[i + 2] > 230) {
        px[i + 3] = 0;
      }
      if (px[i + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  sctx.putImageData(data, 0, 0);

  if (maxX <= minX || maxY <= minY) return src;
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  octx?.drawImage(src, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

export function loadGameTextures(onReady?: () => void): LoadedTextures {
  const tex: LoadedTextures = {
    catImg: null,
    skyImg: null,
    swordImg: null,
    kotulhuImg: null,
    catWormImg: null,
    pharaohImg: null,
    jesterImg: null,
    sunImg: null,
    atomicImg: null,
    partyImg: null,
    melonImg: null,
    alienImg: null,
    directorImg: null,
    grassTufts: [],
  };

  const load = (src: string, assign: (img: HTMLImageElement) => void) => {
    const img = new Image();
    img.onload = () => {
      assign(img);
      onReady?.();
    };
    img.src = src;
  };

  load('/assets/aistudio/zazuuu_cat_d36ff0de.jpg', (img) => {
    const face = document.createElement('canvas');
    face.width = 48;
    face.height = 48;
    const fctx = face.getContext('2d');
    fctx?.drawImage(img, 120, 120, 500, 500, 0, 0, 48, 48);
    canvasToImage(face, (ready) => {
      tex.catImg = ready;
      onReady?.();
    });
  });
  load('/assets/aistudio/sky_1533a301.jpg', (img) => {
    const sky = document.createElement('canvas');
    sky.width = 960;
    sky.height = 600;
    const sctx = sky.getContext('2d');
    sctx?.drawImage(img, 0, 0, 960, 600);
    canvasToImage(sky, (ready) => {
      tex.skyImg = ready;
      onReady?.();
    });
  });
  load('/assets/aistudio/sword_03ad3b16.png', (img) => {
    canvasToImage(cropOpaqueCanvas(img, false), (ready) => {
      tex.swordImg = ready;
      onReady?.();
    });
  });
  const loadSquareTexture = (src: string, setter: (ready: HTMLImageElement) => void) => {
    load(src, (img) => {
      const c = document.createElement('canvas');
      c.width = 96;
      c.height = 96;
      const cctx = c.getContext('2d');
      const size = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
      const sx = ((img.naturalWidth || img.width) - size) / 2;
      const sy = ((img.naturalHeight || img.height) - size) / 2;
      cctx?.drawImage(img, sx, sy, size, size, 0, 0, 96, 96);
      canvasToImage(c, (ready) => {
        setter(ready);
        onReady?.();
      });
    });
  };

  loadSquareTexture('/assets/aistudio/wait_518dc071.jpg', (r) => {
    tex.kotulhuImg = r;
  });
  loadSquareTexture('/assets/aistudio/chine_5a03a968.jpg', (r) => {
    tex.catWormImg = r;
  });
  loadSquareTexture('/assets/aistudio/idk_0270621b.jpg', (r) => {
    tex.pharaohImg = r;
  });
  loadSquareTexture('/assets/aistudio/123_0187db8e.jpg', (r) => {
    tex.jesterImg = r;
  });
  loadSquareTexture('/assets/aistudio/321__3__20414179.jpg', (r) => {
    tex.sunImg = r;
  });
  loadSquareTexture('/assets/aistudio/asd_ebf0b5a3.jpg', (r) => {
    tex.atomicImg = r;
  });
  loadSquareTexture('/assets/aistudio/w_eb0ab916.jpg', (r) => {
    tex.partyImg = r;
  });
  loadSquareTexture('/assets/aistudio/sasd_e0cb3f21.jpg', (r) => {
    tex.melonImg = r;
  });
  loadSquareTexture('/assets/aistudio/dsad_302645e2.jpg', (r) => {
    tex.alienImg = r;
  });
  loadSquareTexture('/assets/aistudio/dir_72c7e44f.jpg', (r) => {
    tex.directorImg = r;
  });
  load('/assets/aistudio/grass_c96c811a.png', (img) => {
    const cropped = cropOpaqueCanvas(img, true);
    const sliceW = Math.max(16, Math.floor(cropped.width / 4));
    for (let i = 0; i < 4; i++) {
      const tuft = document.createElement('canvas');
      tuft.width = 32;
      tuft.height = 18;
      const tctx = tuft.getContext('2d');
      tctx?.drawImage(
        cropped,
        i * Math.floor((cropped.width - sliceW) / 3),
        0,
        sliceW,
        cropped.height,
        0,
        0,
        32,
        18,
      );
      canvasToImage(tuft, (ready) => {
        tex.grassTufts[i] = ready;
        onReady?.();
      });
    }
  });

  return tex;
}

export interface RenderContextState {
  world: WorldData;
  player: PlayerState;
  npcs: NpcEntity[];
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  drops: DropEntity[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  tileDamageMap: Map<number, number>;
  cameraX: number;
  cameraY: number;
  shakeX: number;
  shakeY: number;
  timeOfDay: number;
  elapsed: number;
  hoverTileX: number;
  hoverTileY: number;
  hoverInRange: boolean;
  selectedItemId: string | null;
  equipment?: EquipmentState;
  textures: LoadedTextures;
  language?: Language;
  stoolSpeech?: { text: string; stage: 'petted' | 'copied' } | null;
}

const TILE_PALETTE: Record<number, { fill: string; edge: string; speck?: string }> = {
  [TileType.Dirt]: { fill: '#7a4d2f', edge: '#5a3620', speck: '#93603e' },
  [TileType.Grass]: { fill: '#75492c', edge: '#3f9b2c', speck: '#58b941' },
  [TileType.Stone]: { fill: '#636b78', edge: '#464d57', speck: '#818a99' },
  [TileType.Wood]: { fill: '#6e4223', edge: '#4d2d16', speck: '#8f5932' },
  [TileType.Leaves]: { fill: '#2e7d32', edge: '#1b5e20', speck: '#66bb6a' },
  [TileType.Planks]: { fill: '#b97e48', edge: '#8b5a2b', speck: '#d69d66' },
  [TileType.Brick]: { fill: '#b34b3c', edge: '#7f2f24', speck: '#d97a6c' },
  [TileType.RoofTile]: { fill: '#c2410c', edge: '#7c2d12', speck: '#fb923c' },
  [TileType.CoalOre]: { fill: '#575f6b', edge: '#334155', speck: '#0f172a' },
  [TileType.CopperOre]: { fill: '#5c6470', edge: '#3f4652', speck: '#f97316' },
  [TileType.IronOre]: { fill: '#5c6470', edge: '#3d4450', speck: '#e2c4a8' },
  [TileType.GoldOre]: { fill: '#5e6573', edge: '#3f4652', speck: '#facc15' },
  [TileType.RubyOre]: { fill: '#525968', edge: '#373e4d', speck: '#f43f5e' },
  [TileType.Glass]: { fill: 'rgba(186, 230, 253, 0.35)', edge: '#e0f2fe' },
  [TileType.Platform]: { fill: '#b67d47', edge: '#7c5128' },
  [TileType.Snow]: { fill: '#e0f2fe', edge: '#bae6fd', speck: '#ffffff' },
  [TileType.Ice]: { fill: '#38bdf8', edge: '#0284c7', speck: '#e0f2fe' },
  [TileType.SnowBrick]: { fill: '#cbd5e1', edge: '#94a3b8', speck: '#f8fafc' },
  [TileType.CrimsonGrass]: { fill: '#691c22', edge: '#dc2626', speck: '#f87171' },
  [TileType.CrimsonDirt]: { fill: '#6b1d24', edge: '#450a0a', speck: '#991b1b' },
  [TileType.Crimstone]: { fill: '#7f1d1d', edge: '#450a0a', speck: '#ef4444' },
  [TileType.CrimsonBrick]: { fill: '#991b1b', edge: '#450a0a', speck: '#f87171' },
  [TileType.CrimsonWood]: { fill: '#5c1428', edge: '#3b0712', speck: '#be123c' },
  [TileType.CrimsonLeaves]: { fill: '#991b1b', edge: '#7f1d1d', speck: '#fb7185' },
  [TileType.Sand]: { fill: '#eab308', edge: '#ca8a04', speck: '#fef08a' },
  [TileType.SandstoneBrick]: { fill: '#d97706', edge: '#92400e', speck: '#fde047' },
  [TileType.Obsidian]: { fill: '#2e1065', edge: '#1e1b4b', speck: '#a855f7' },
  [TileType.Marble]: { fill: '#e2e8f0', edge: '#cbd5e1', speck: '#ffffff' },
  [TileType.CrystalBlock]: { fill: '#a21caf', edge: '#701a75', speck: '#f5d0fe' },
  [TileType.WoodBeam]: { fill: '#6b4226', edge: '#451a03', speck: '#9a5f37' },
  [TileType.Cactus]: { fill: '#15803d', edge: '#14532d', speck: '#4ade80' },
  [TileType.HellstoneOre]: { fill: '#7f1d1d', edge: '#450a0a', speck: '#fb923c' },
  [TileType.CrimsonTooth]: { fill: '#f5f5f4', edge: '#d6d3d1', speck: '#e7e5e4' },
};

const WALL_COLORS: Record<number, string> = {
  [WallType.DirtWall]: '#3b2416',
  [WallType.WoodWall]: '#593a22',
  [WallType.StoneWall]: '#2d333d',
  [WallType.BrickWall]: '#5e2821',
  [WallType.SnowWall]: '#3b5875',
  [WallType.CrimsonWall]: '#451218',
  [WallType.MarbleWall]: '#64748b',
  [WallType.SandstoneWall]: '#854d0e',
};

const LIGHT_SHADE_STYLES: string[] = Array.from({ length: 17 }, (_, i) => {
  const alpha = ((16 - i) / 16) * 0.86;
  return `rgba(5,9,20,${alpha.toFixed(2)})`;
});

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderContextState,
): void {
  const {
    world,
    player,
    npcs,
    enemies,
    projectiles,
    drops,
    particles,
    floatingTexts,
    tileDamageMap,
    cameraX,
    cameraY,
    shakeX,
    shakeY,
    timeOfDay,
    elapsed,
    hoverTileX,
    hoverTileY,
    hoverInRange,
    selectedItemId,
    textures,
  } = state;

  const camX = Math.round(cameraX + shakeX);
  const camY = Math.round(cameraY + shakeY);

  // Day/night factor: 1 = bright day, 0 = midnight
  const sunAngle = timeOfDay * Math.PI * 2;
  const dayFactor = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.sin(sunAngle)));

  // 1. Sky backdrop (uses user's Frutiger Aero sky_1533a301.jpg with subtle parallax & day/night blend)
  ctx.fillStyle = '#091529';
  ctx.fillRect(0, 0, width, height);

  if (textures.skyImg) {
    const img = textures.skyImg;
    const scale = Math.max(width / img.width, height / img.height) * 1.15;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const parallaxX = -((camX * 0.08) % Math.max(1, drawW - width));
    const parallaxY = Math.max(height - drawH, Math.min(0, -camY * 0.05));

    ctx.save();
    ctx.globalAlpha = 0.25 + dayFactor * 0.75;
    ctx.drawImage(img, parallaxX, parallaxY, drawW, drawH);
    ctx.restore();
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, dayFactor > 0.4 ? '#0c4a6e' : '#080f1e');
    grad.addColorStop(1, dayFactor > 0.4 ? '#7dd3fc' : '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  const playerTileX = Math.floor((player.x + player.width / 2) / TILE_SIZE);
  const currentBiome = getBiomeAtX(playerTileX, world.width);

  // Biome atmosphere tint over sky
  if (currentBiome === 'snow') {
    ctx.fillStyle = `rgba(186, 230, 253, ${(0.18 + dayFactor * 0.14).toFixed(2)})`;
    ctx.fillRect(0, 0, width, height);
    // Gentle falling snowflakes in Snow biome
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    for (let i = 0; i < 28; i++) {
      const fx = ((i * 173 + elapsed * (22 + (i % 4) * 8)) % (width + 40)) - 20;
      const fy = ((i * 97 + elapsed * (45 + (i % 5) * 10)) % height);
      ctx.fillRect(fx, fy, 2.5, 2.5);
    }
  } else if (currentBiome === 'desert') {
    ctx.fillStyle = `rgba(245, 158, 11, ${(0.14 + dayFactor * 0.14).toFixed(2)})`;
    ctx.fillRect(0, 0, width, height);
  } else if (currentBiome === 'crimson') {
    ctx.fillStyle = `rgba(127, 29, 29, ${(0.28 + (1 - dayFactor) * 0.18).toFixed(2)})`;
    ctx.fillRect(0, 0, width, height);
  } else if (currentBiome === 'crystal') {
    ctx.fillStyle = `rgba(162, 28, 175, ${(0.16 + (1 - dayFactor) * 0.14).toFixed(2)})`;
    ctx.fillRect(0, 0, width, height);
  } else if (currentBiome === 'ocean') {
    ctx.fillStyle = `rgba(14, 165, 233, ${(0.16 + dayFactor * 0.1).toFixed(2)})`;
    ctx.fillRect(0, 0, width, height);
  }

  // Night overlay + stars & moon
  if (dayFactor < 0.7) {
    const nightAlpha = (0.7 - dayFactor) / 0.7;
    ctx.fillStyle = `rgba(6, 11, 24, ${nightAlpha * 0.65})`;
    ctx.fillRect(0, 0, width, height);

    // Subtle stars
    ctx.fillStyle = `rgba(248, 250, 252, ${nightAlpha * 0.75})`;
    for (let i = 0; i < 36; i++) {
      const sx = ((i * 197 + 43) % width);
      const sy = ((i * 89 + 19) % Math.floor(height * 0.55));
      const twinkle = 1 + 0.5 * Math.sin(elapsed * 2.5 + i);
      ctx.fillRect(sx, sy, twinkle, twinkle);
    }

    // Moon
    const moonX = width * 0.82 - (timeOfDay - 0.5) * 260;
    const moonY = height * 0.16;
    ctx.fillStyle = `rgba(254, 249, 195, ${nightAlpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant parallax rolling hills above ground (biome-tinted!)
  ctx.fillStyle =
    currentBiome === 'snow'
      ? dayFactor > 0.4
        ? 'rgba(148, 197, 232, 0.45)'
        : 'rgba(30, 58, 95, 0.55)'
      : currentBiome === 'desert'
        ? dayFactor > 0.4
          ? 'rgba(217, 119, 6, 0.36)'
          : 'rgba(120, 53, 15, 0.55)'
        : currentBiome === 'crimson'
          ? dayFactor > 0.4
            ? 'rgba(127, 29, 29, 0.48)'
            : 'rgba(69, 10, 10, 0.65)'
          : currentBiome === 'crystal'
            ? dayFactor > 0.4
              ? 'rgba(134, 25, 143, 0.42)'
              : 'rgba(74, 4, 78, 0.62)'
            : currentBiome === 'ocean'
              ? dayFactor > 0.4
                ? 'rgba(3, 105, 161, 0.38)'
                : 'rgba(12, 74, 110, 0.58)'
              : dayFactor > 0.4
                ? 'rgba(20, 83, 45, 0.35)'
                : 'rgba(15, 23, 42, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let sx = 0; sx <= width + 40; sx += 40) {
    const wx = sx + camX * 0.25;
    const hy = height * 0.66 - Math.sin(wx * 0.004) * 38 - Math.cos(wx * 0.009) * 20 - camY * 0.12;
    ctx.lineTo(sx, hy);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Determine visible tile bounds
  const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
  const endCol = Math.min(world.width - 1, Math.ceil((camX + width) / TILE_SIZE) + 1);
  const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
  const endRow = Math.min(world.height - 1, Math.ceil((camY + height) / TILE_SIZE) + 1);

  ctx.save();
  ctx.translate(-camX, -camY);

  // 2. Render Background Walls
  for (let ty = startRow; ty <= endRow; ty++) {
    for (let tx = startCol; tx <= endCol; tx++) {
      const idx = ty * world.width + tx;
      const wall = world.walls[idx] as WallType;
      if (wall === WallType.None) continue;
      const tile = world.tiles[idx] as TileType;
      if (isTileSolid(tile) && tile !== TileType.Glass) continue;

      const x = tx * TILE_SIZE;
      const y = ty * TILE_SIZE;
      ctx.fillStyle = WALL_COLORS[wall] ?? '#2c221b';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Subtle plank or stone seam
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      if (wall === WallType.WoodWall) {
        ctx.fillRect(x, y + 15, TILE_SIZE, 2);
      } else {
        ctx.fillRect(x, y + 15, TILE_SIZE, 1);
        ctx.fillRect(x + (ty % 2 === 0 ? 15 : 8), y, 1, TILE_SIZE);
      }
    }
  }

  // 3. Render Foreground Tiles
  for (let ty = startRow; ty <= endRow; ty++) {
    for (let tx = startCol; tx <= endCol; tx++) {
      const idx = ty * world.width + tx;
      const tile = world.tiles[idx] as TileType;
      if (tile === TileType.Air) continue;

      const x = tx * TILE_SIZE;
      const y = ty * TILE_SIZE;
      const lightVal = Math.max(0.1, Math.min(1, world.light[idx]));

      const chestHasLoot =
        tile === TileType.Chest && (world.chests[idx]?.length ?? 0) > 0;
      drawTile(ctx, tile, x, y, tx, ty, elapsed, textures, chestHasLoot, world);

      // Crack overlay if damaged
      const dmg = tileDamageMap.get(idx);
      if (dmg && dmg > 0) {
        const ratio = Math.min(1, dmg / getTileMaxDamage(tile));
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 6);
        ctx.lineTo(x + 16, y + 14);
        if (ratio > 0.35) {
          ctx.lineTo(x + 25, y + 24);
          ctx.moveTo(x + 16, y + 14);
          ctx.lineTo(x + 8, y + 26);
        }
        if (ratio > 0.65) {
          ctx.moveTo(x + 24, y + 7);
          ctx.lineTo(x + 16, y + 14);
        }
        ctx.stroke();
      }

      // Cave & night lighting shade per tile (zero string allocation; skip non-square tapered fangs)
      if (lightVal < 0.95 && tile !== TileType.CrimsonTooth) {
        const bucket = Math.max(0, Math.min(15, Math.floor(lightVal * 16)));
        ctx.fillStyle = LIGHT_SHADE_STYLES[bucket];
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // 4. Render Drops on Ground
  for (const drop of drops) {
    const bob = Math.sin(elapsed * 4 + drop.id) * 3;
    const def = ITEMS[drop.itemId];
    const cx = drop.x;
    const cy = drop.y + bob;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, drop.y + 8, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (def?.textureSrc === '/assets/aistudio/sword_03ad3b16.png' && textures.swordImg) {
      ctx.drawImage(textures.swordImg, cx - 10, cy - 12, 20, 24);
    } else {
      ctx.fillStyle = def?.color ?? '#facc15';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 7, cy - 7, 14, 14, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = def?.accent ?? '#fff';
      ctx.fillRect(cx - 3, cy - 3, 5, 4);
    }
    ctx.restore();
  }

  // 5. Render Villager NPCs
  for (const npc of npcs) {
    drawHumanNpc(ctx, npc, player, elapsed, textures);
  }

  // 6. Render Enemies
  for (const enemy of enemies) {
    drawEnemy(ctx, enemy, elapsed, textures);
  }

  // 6.5. Render Grappling Hook Chain (if active)
  if (player.grapple.active) {
    const pcx = player.x + player.width / 2;
    const pcy = player.y + player.height / 2 - 4;
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(pcx, pcy);
    ctx.lineTo(player.grapple.x, player.grapple.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hook claw head
    const hAngle = Math.atan2(player.grapple.y - pcy, player.grapple.x - pcx);
    ctx.translate(player.grapple.x, player.grapple.y);
    ctx.rotate(hAngle);
    ctx.fillStyle = player.grapple.hooked ? '#fbbf24' : '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -7);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-4, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 7. Render Cat Hero (Zazu texture + animated body/paws/tail + armor/wings + held weapon)
  drawCatHero(ctx, player, elapsed, textures, state.equipment);

  // 8. Render Projectiles
  for (const proj of projectiles) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    const angle = Math.atan2(proj.vy, proj.vx);
    ctx.rotate(angle);

    if (proj.kind === 'arrow') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.fillStyle = proj.color || '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(5, -4);
      ctx.lineTo(5, 4);
      ctx.closePath();
      ctx.fill();
    } else if (proj.kind === 'bullet') {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-10, -2, 18, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-12, -1, 8, 2);
    } else if (proj.kind === 'zenith_blade') {
      const col = proj.color || '#22d3ee';
      const acc = proj.accentColor || '#f472b6';
      // Sweeping multi-colored Terraria Zenith blade trail!
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = acc;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = col;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-10, -7);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-10, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-16, -6, 4, 12);
    } else if (proj.kind === 'demon_scythe') {
      ctx.rotate(elapsed * 22);
      ctx.fillStyle = proj.color || '#9333ea';
      ctx.strokeStyle = proj.accentColor || '#e879f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0.2, Math.PI * 1.45);
      ctx.quadraticCurveTo(-4, -2, 0, 0);
      ctx.fill();
      ctx.stroke();
    } else if (proj.kind === 'vampire_knife') {
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -3.5);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-8, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (proj.kind === 'rainbow_cat') {
      const hue = Math.floor((elapsed * 320 + proj.id * 45) % 360);
      ctx.fillStyle = `hsl(${hue}, 92%, 62%)`;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tiny cat ears on Meowmere projectile
      ctx.beginPath();
      ctx.moveTo(-6, -7);
      ctx.lineTo(-3, -14);
      ctx.lineTo(0, -8);
      ctx.moveTo(1, -8);
      ctx.lineTo(4, -14);
      ctx.lineTo(7, -7);
      ctx.fill();
    } else if (proj.kind === 'terra_beam') {
      ctx.fillStyle = proj.color || '#10b981';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.quadraticCurveTo(0, -18, -12, -14);
      ctx.quadraticCurveTo(2, 0, -12, 14);
      ctx.quadraticCurveTo(0, 18, 14, 0);
      ctx.fill();
      ctx.stroke();
    } else if (proj.kind === 'star_rain' || proj.kind === 'star_wrath') {
      ctx.rotate(elapsed * 12);
      ctx.fillStyle = proj.kind === 'star_wrath' ? '#f472b6' : '#fde047';
      ctx.strokeStyle = proj.kind === 'star_wrath' ? '#fde047' : '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s < 10; s++) {
        const rad = s % 2 === 0 ? 13 : 5.5;
        const a = (s * Math.PI) / 5;
        if (s === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (proj.kind === 'water_bolt') {
      ctx.fillStyle = proj.color || '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(2, -1, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.kind === 'dynamite') {
      ctx.rotate(elapsed * 11);
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.6;
      ctx.fillRect(-9, -4, 18, 8);
      ctx.strokeRect(-9, -4, 18, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-5, -4, 3, 8);
      ctx.fillRect(2, -4, 3, 8);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(11, -4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.kind === 'laser') {
      ctx.fillStyle = proj.color || '#ef4444';
      ctx.fillRect(-16, -2.5, 32, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-14, -1, 28, 2);
    } else if (proj.kind === 'boomerang') {
      ctx.rotate(elapsed * 16);
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-3, -3, 5, 6);
    } else if (proj.kind === 'yarn_bomb') {
      ctx.rotate(elapsed * 8);
      ctx.fillStyle = '#ec4899';
      ctx.strokeStyle = '#831843';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(5, 3);
      ctx.moveTo(-4, 4);
      ctx.lineTo(4, -4);
      ctx.stroke();
    } else if (proj.kind === 'stinger') {
      ctx.fillStyle = proj.color || '#facc15';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -4);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 4);
      ctx.closePath();
      ctx.fill();
    } else if (proj.kind === 'phantasmal_bolt') {
      ctx.fillStyle = proj.color || '#2dd4bf';
      ctx.beginPath();
      ctx.ellipse(0, 0, proj.radius + 4, proj.radius * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, 0, proj.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Magic orb / fireball / frost bolt / slime glob / cursed_orb
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2, -1, proj.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 9. Render Pooled Particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.active) continue;
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // 10. Tile Hover Cursor Highlight
  if (hoverTileX >= 0 && hoverTileX < world.width && hoverTileY >= 0 && hoverTileY < world.height) {
    const hx = hoverTileX * TILE_SIZE;
    const hy = hoverTileY * TILE_SIZE;
    const selDef = selectedItemId ? ITEMS[selectedItemId] : null;
    const isPlacing = selDef && (selDef.placesTile !== undefined || selDef.placesWall !== undefined);

    ctx.strokeStyle = hoverInRange
      ? isPlacing
        ? 'rgba(52, 211, 153, 0.92)'
        : 'rgba(250, 204, 21, 0.9)'
      : 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx + 1, hy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  }

  // 11. Floating Damage / Info Texts
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  for (const ft of floatingTexts) {
    const alpha = Math.max(0, Math.min(1, ft.life / (ft.maxLife * 0.5)));
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;

  // 12. High-Visibility Stool Marker & Active Stool Speech Bubble
  for (let ty = startRow; ty <= endRow; ty++) {
    for (let tx = startCol; tx <= endCol; tx++) {
      if (world.tiles[ty * world.width + tx] === TileType.Stool) {
        const sx = tx * TILE_SIZE + 16;
        const bob = Math.sin(elapsed * 3.5) * 3;
        const sy = ty * TILE_SIZE - 16 + bob;
        const label = state.stoolSpeech
          ? state.stoolSpeech.text
          : state.language === 'ru'
            ? 'ТАБУРЕТКА'
            : 'STOOL';
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        const tw = Math.max(82, ctx.measureText(label).width + 16);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = state.stoolSpeech?.stage === 'copied' ? '#34d399' : '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sx - tw / 2, sy - 22, tw, 21, 7);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = state.stoolSpeech ? '#fef3c7' : '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText(label, sx, sy - 8);
      }
    }
  }

  ctx.restore();

  // Darkness debuff screen-space vignette
  if (player.effects?.some((e) => e.id === 'darkness')) {
    const grad = ctx.createRadialGradient(width / 2, height / 2, 70, width / 2, height / 2, Math.max(width, height) * 0.55);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0.72)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  tx: number,
  ty: number,
  elapsed: number,
  textures: LoadedTextures,
  chestHasLoot = false,
  world?: WorldData,
): void {
  if (tile === TileType.Torch) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 13, y + 12, 6, 20);
    const flicker = Math.sin(elapsed * 14 + tx * 3) * 1.5;
    ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
    ctx.beginPath();
    ctx.arc(x + 16, y + 10, 22 + flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(x + 16, y + 10, 6 + flicker * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 16, y + 11, 3, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (tile === TileType.Workbench) {
    ctx.fillStyle = '#854d27';
    ctx.fillRect(x + 2, y + 12, 28, 6);
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(x + 4, y + 18, 5, 14);
    ctx.fillRect(x + 23, y + 18, 5, 14);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 18, y + 9, 8, 3);
    return;
  }

  if (tile === TileType.Furnace) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y + 4, 28, 28);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 8, y + 16, 16, 16);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 10, y + 20, 12, 10);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 13, y + 23, 6, 7);
    return;
  }

  if (tile === TileType.Anvil) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 3, y + 14, 26, 7);
    ctx.fillRect(x + 9, y + 21, 14, 6);
    ctx.fillRect(x + 5, y + 27, 22, 5);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 4, y + 14, 24, 2);
    return;
  }

  if (tile === TileType.DoorClosed) {
    ctx.fillStyle = '#7c4a26';
    ctx.fillRect(x + 10, y, 12, TILE_SIZE);
    ctx.strokeStyle = '#4a2b13';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 10, y, 12, TILE_SIZE);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 18, y + 15, 3, 3);
    return;
  }

  if (tile === TileType.DoorOpen) {
    ctx.fillStyle = 'rgba(124, 74, 38, 0.45)';
    ctx.fillRect(x + 2, y, 6, TILE_SIZE);
    return;
  }

  if (tile === TileType.Bed) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 2, y + 20, 28, 12);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(x + 3, y + 15, 26, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 4, y + 12, 8, 5);
    return;
  }

  if (tile === TileType.Platform) {
    ctx.fillStyle = '#b67d47';
    ctx.fillRect(x, y, TILE_SIZE, 8);
    ctx.fillStyle = '#7c5128';
    ctx.fillRect(x, y + 6, TILE_SIZE, 2);
    return;
  }

  if (tile === TileType.Cactus) {
    ctx.fillStyle = '#15803d';
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1.4;
    ctx.fillRect(x + 7, y, 18, TILE_SIZE);
    ctx.strokeRect(x + 7, y, 18, TILE_SIZE);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(x + 11, y + 2, 3, TILE_SIZE - 4);
    ctx.fillRect(x + 19, y + 4, 2, TILE_SIZE - 8);
    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(x + 4, y + 8, 3, 2);
    ctx.fillRect(x + 25, y + 18, 3, 2);
    return;
  }

  if (tile === TileType.Stool) {
    // High-visibility golden-crimson plush Stool with glowing spotlight halo & sparkles!
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4.5 + tx);
    ctx.fillStyle = `rgba(251, 191, 36, ${(0.18 + pulse * 0.16).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x + 16, y + 17, 21 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();

    // Bold bright oak legs
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.1;
    ctx.fillRect(x + 5, y + 14, 5, 18);
    ctx.strokeRect(x + 5, y + 14, 5, 18);
    ctx.fillRect(x + 22, y + 14, 5, 18);
    ctx.strokeRect(x + 22, y + 14, 5, 18);
    // Crossbar
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 9, y + 22, 14, 4);

    // Tall plush crimson & gold velvet seat
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 6, 30, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Bright golden trim & sparkle dots
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 4, y + 8, 24, 3);
    const spY = y + 2 - ((elapsed * 16) % 10);
    ctx.fillStyle = '#f9a8d4';
    ctx.fillRect(x + 6 + Math.sin(elapsed * 5) * 3, spY, 3, 3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 24 - Math.cos(elapsed * 4) * 3, spY - 2, 3, 3);
    return;
  }

  if (tile === TileType.Table) {
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.4;
    ctx.fillRect(x + 1, y + 12, 30, 5);
    ctx.strokeRect(x + 1, y + 12, 30, 5);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 3, y + 13, 26, 2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + 17, 4, 15);
    ctx.fillRect(x + 24, y + 17, 4, 15);
    return;
  }

  if (tile === TileType.Chair) {
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.3;
    // Backrest + seat + legs
    ctx.fillRect(x + 6, y + 4, 4, 28);
    ctx.strokeRect(x + 6, y + 4, 4, 28);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 6, y + 16, 18, 5);
    ctx.strokeRect(x + 6, y + 16, 18, 5);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 19, y + 21, 4, 11);
    return;
  }

  if (tile === TileType.Chandelier) {
    const glow = 0.22 + 0.08 * Math.sin(elapsed * 9 + tx);
    ctx.fillStyle = `rgba(253, 224, 71, ${glow.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x + 16, y + 18, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x + 16, y + 12);
    ctx.moveTo(x + 6, y + 16);
    ctx.lineTo(x + 26, y + 16);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 13, y + 10, 6, 8);
    for (const cxOff of [6, 16, 26]) {
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(x + cxOff - 1.5, y + 11, 3, 5);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x + cxOff, y + 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (tile === TileType.Bookshelf) {
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.4;
    ctx.fillRect(x + 2, y + 2, 28, 30);
    ctx.strokeRect(x + 2, y + 2, 28, 30);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 4, y + 5, 24, 10);
    ctx.fillRect(x + 4, y + 18, 24, 11);
    const bookColors = ['#ef4444', '#38bdf8', '#22c55e', '#facc15', '#a855f7'];
    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = bookColors[(b + tx) % bookColors.length];
      ctx.fillRect(x + 5 + b * 4.5, y + 6, 3.5, 9);
      ctx.fillStyle = bookColors[(b + ty + 2) % bookColors.length];
      ctx.fillRect(x + 5 + b * 4.5, y + 19, 3.5, 10);
    }
    return;
  }

  if (tile === TileType.Pot) {
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 21, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 10, y + 9, 12, 4);
    ctx.strokeRect(x + 10, y + 9, 12, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 10, y + 18, 4, 4);
    return;
  }

  if (tile === TileType.Rope) {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 13, y, 6, TILE_SIZE);
    ctx.fillStyle = '#fde68a';
    for (let ry = 2; ry < TILE_SIZE; ry += 7) {
      ctx.fillRect(x + 13, y + ry, 4, 2);
      ctx.fillRect(x + 15, y + ry + 3, 4, 2);
    }
    return;
  }

  if (tile === TileType.LifeCrystal) {
    const beat = 1 + Math.sin(elapsed * 5 + tx) * 0.09;
    ctx.fillStyle = 'rgba(236, 72, 153, 0.28)';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 16 * beat, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 27);
    ctx.lineTo(x + 6, y + 15);
    ctx.arc(x + 11, y + 12, 5, Math.PI, 0);
    ctx.arc(x + 21, y + 12, 5, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (tile === TileType.PiggyBank) {
    ctx.fillStyle = '#f472b6';
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 21, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(x + 9, y + 26, 3, 5);
    ctx.fillRect(x + 20, y + 26, 3, 5);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(x + 23, y + 19, 4, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 14, y + 14, 5, 2);
    ctx.fillRect(x + 20, y + 17, 2, 2);
    return;
  }

  if (tile === TileType.Chest) {
    // Ornate wooden & gold treasure chest
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 10, 26, 21, 3);
    ctx.fill();
    ctx.stroke();

    // Lid highlight
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 4, y + 11, 24, 7);

    // Gold bands & lock plate
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 3, y + 17, 26, 3);
    ctx.fillRect(x + 7, y + 10, 3, 21);
    ctx.fillRect(x + 22, y + 10, 3, 21);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 13, y + 16, 6, 7);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 15, y + 18, 2, 3);

    // Subtle golden sparkle when chest contains loot
    if (chestHasLoot) {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 5 + tx);
      ctx.fillStyle = `rgba(254, 240, 138, ${(0.35 + pulse * 0.55).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x + 25, y + 8, 2.5 + pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (tile === TileType.Campfire) {
    const flicker = Math.sin(elapsed * 14 + tx * 2) * 2;
    ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
    ctx.beginPath();
    ctx.arc(x + 16, y + 18, 24 + flicker, 0, Math.PI * 2);
    ctx.fill();
    // Crossed logs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + 25, 24, 6);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 7, y + 22, 18, 4);
    // Flame
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 24);
    ctx.quadraticCurveTo(x + 16, y + 4 + flicker, x + 23, y + 24);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 24);
    ctx.quadraticCurveTo(x + 16, y + 12 + flicker * 0.5, x + 20, y + 24);
    ctx.fill();
    return;
  }

  if (tile === TileType.HeartLantern) {
    const pulse = 1 + Math.sin(elapsed * 4 + tx) * 0.08;
    ctx.fillStyle = 'rgba(236, 72, 153, 0.26)';
    ctx.beginPath();
    ctx.arc(x + 16, y + 17, 18 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x + 16, y + 8);
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 28);
    ctx.lineTo(x + 7, y + 17);
    ctx.arc(x + 11.5, y + 14, 4.5, Math.PI, 0);
    ctx.arc(x + 20.5, y + 14, 4.5, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (tile === TileType.Sunflower) {
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 14, y + 14, 4, 18);
    ctx.fillRect(x + 9, y + 21, 6, 3);
    ctx.fillRect(x + 17, y + 19, 6, 3);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x + 16, y + 11, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(x + 16, y + 11, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (tile === TileType.CrimsonAltar) {
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 5 + tx);
    ctx.fillStyle = `rgba(220, 38, 38, ${(0.25 + pulse * 0.2).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x + 16, y + 18, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 14, 26, 17, 4);
    ctx.fill();
    ctx.stroke();
    // Glowing crimson eyes on altar
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(x + 10, y + 16, 3, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 13, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 22, y + 16, 3, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (tile === TileType.CrimsonTooth) {
    // Cohesive tapered bone-ivory fang (auto-detects upper hanging vs lower upward fang)
    let upCount = 0;
    let downCount = 0;
    let rootAbove = true;
    if (world) {
      while (ty - upCount - 1 >= 0 && world.tiles[(ty - upCount - 1) * world.width + tx] === TileType.CrimsonTooth && upCount < 4) {
        upCount++;
      }
      while (ty + downCount + 1 < world.height && world.tiles[(ty + downCount + 1) * world.width + tx] === TileType.CrimsonTooth && downCount < 4) {
        downCount++;
      }
      const topAnchorY = ty - upCount - 1;
      const botAnchorY = ty + downCount + 1;
      const topTile = topAnchorY >= 0 ? (world.tiles[topAnchorY * world.width + tx] as TileType) : TileType.Air;
      const botTile = botAnchorY < world.height ? (world.tiles[botAnchorY * world.width + tx] as TileType) : TileType.Air;
      if (topTile === TileType.Air && botTile !== TileType.Air) {
        rootAbove = false;
      }
    }
    const totalLen = upCount + downCount + 1;
    const t0 = rootAbove ? upCount / totalLen : downCount / totalLen;
    const t1 = rootAbove ? (upCount + 1) / totalLen : (downCount + 1) / totalLen;
    const w0 = 13 * (1 - t0 * 0.92);
    const w1 = t1 >= 0.99 ? 1.2 : 13 * (1 - t1 * 0.92);
    const topHalf = rootAbove ? w0 : w1;
    const botHalf = rootAbove ? w1 : w0;
    const cx = x + 16;

    ctx.fillStyle = '#fefce8';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - topHalf, y);
    ctx.lineTo(cx + topHalf, y);
    ctx.lineTo(cx + botHalf, y + TILE_SIZE);
    ctx.lineTo(cx - botHalf, y + TILE_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ivory enamel ridge highlight
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.moveTo(cx - topHalf * 0.25, y + 1);
    ctx.lineTo(cx + topHalf * 0.2, y + 1);
    ctx.lineTo(cx + botHalf * 0.2, y + TILE_SIZE - 1);
    ctx.lineTo(cx - botHalf * 0.25, y + TILE_SIZE - 1);
    ctx.closePath();
    ctx.fill();
    return;
  }

  const pal = TILE_PALETTE[tile] ?? { fill: '#64748b', edge: '#334155' };
  ctx.fillStyle = pal.fill;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Inner texture detail
  ctx.fillStyle = pal.edge;
  ctx.fillRect(x, y, TILE_SIZE, 2);
  ctx.fillRect(x, y, 2, TILE_SIZE);

  if (tile === TileType.Grass) {
    // Green turf strip + pre-baked grass_c96c811a.png tufts overlay!
    ctx.fillStyle = '#3f9b2c';
    ctx.fillRect(x, y, TILE_SIZE, 8);
    ctx.fillStyle = '#65c449';
    ctx.fillRect(x, y, TILE_SIZE, 3);
    if (textures.grassTufts.length > 0) {
      const tuft = textures.grassTufts[tx % textures.grassTufts.length];
      if (tuft && tuft.complete) {
        const sway = Math.round(Math.sin(elapsed * 2.2 + tx * 0.7) * 1.5);
        ctx.drawImage(tuft, x + sway, y - 16);
      }
    }
  } else if (tile === TileType.CrimsonGrass) {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x, y, TILE_SIZE, 8);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(x, y, TILE_SIZE, 3);
    // Crimson spore blades above tile
    const sway = Math.round(Math.sin(elapsed * 2.1 + tx) * 1.5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 6 + sway, y - 6, 3, 6);
    ctx.fillRect(x + 17 + sway, y - 8, 3, 8);
    ctx.fillRect(x + 25 + sway, y - 5, 2, 5);
  } else if (tile === TileType.Snow) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, TILE_SIZE, 5);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x + 5, y + 12, 7, 4);
    ctx.fillRect(x + 18, y + 21, 8, 4);
  } else if (tile === TileType.Ice) {
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x + 4, y + 5, 10, 3);
    ctx.fillRect(x + 16, y + 18, 10, 3);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 24);
    ctx.lineTo(x + 22, y + 7);
    ctx.stroke();
  } else if (tile === TileType.Planks || tile === TileType.WoodBeam) {
    ctx.fillStyle = pal.edge;
    if (tile === TileType.WoodBeam) {
      ctx.fillRect(x + 8, y, 2, TILE_SIZE);
      ctx.fillRect(x + 22, y, 2, TILE_SIZE);
    } else {
      ctx.fillRect(x, y + 10, TILE_SIZE, 2);
      ctx.fillRect(x, y + 21, TILE_SIZE, 2);
      ctx.fillRect(x + ((tx + ty) % 2 === 0 ? 12 : 22), y, 2, TILE_SIZE);
    }
  } else if (
    tile === TileType.Brick ||
    tile === TileType.RoofTile ||
    tile === TileType.SnowBrick ||
    tile === TileType.CrimsonBrick ||
    tile === TileType.SandstoneBrick
  ) {
    ctx.fillStyle = pal.edge;
    ctx.fillRect(x, y + 15, TILE_SIZE, 2);
    ctx.fillRect(x + (ty % 2 === 0 ? 14 : 6), y, 2, 16);
    ctx.fillRect(x + (ty % 2 === 0 ? 6 : 22), y + 16, 2, 16);
  } else if (tile === TileType.Marble) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 10);
    ctx.quadraticCurveTo(x + 16, y + 16, x + 28, y + 8);
    ctx.stroke();
  } else if (tile === TileType.CrystalBlock) {
    ctx.fillStyle = '#f5d0fe';
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 4);
    ctx.lineTo(x + 26, y + 16);
    ctx.lineTo(x + 16, y + 28);
    ctx.lineTo(x + 6, y + 16);
    ctx.closePath();
    ctx.fill();
  } else if (tile === TileType.Glass) {
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 20);
    ctx.lineTo(x + 20, y + 6);
    ctx.stroke();
  } else if (pal.speck) {
    ctx.fillStyle = pal.speck;
    const h = (tx * 73 + ty * 37) % 13;
    ctx.fillRect(x + 6 + (h % 9), y + 6 + ((h * 3) % 8), 5, 5);
    ctx.fillRect(x + 16 + ((h * 2) % 8), y + 17 + (h % 7), 6, 5);
  }
}

function drawCatHero(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  elapsed: number,
  textures: LoadedTextures,
  equipment?: EquipmentState,
): void {
  const cx = player.x + player.width / 2;
  const bottomY = player.y + player.height;
  const walkSwing = player.onGround ? Math.sin(player.walkDistance * 0.14) * 5 : 4;

  const helmetDef = equipment?.helmet ? ITEMS[equipment.helmet.itemId] : null;
  const chestDef = equipment?.chestplate ? ITEMS[equipment.chestplate.itemId] : null;
  const greavesDef = equipment?.greaves ? ITEMS[equipment.greaves.itemId] : null;
  const hasWings = Boolean(
    equipment?.accessories.some(
      (a) => a && (ITEMS[a.itemId]?.accessoryKind === 'angel_wings'),
    ),
  );
  const hasShield = Boolean(
    equipment?.accessories.some(
      (a) =>
        a &&
        (ITEMS[a.itemId]?.accessoryKind === 'cobalt_shield' ||
          ITEMS[a.itemId]?.accessoryKind === 'ankh_shield'),
    ),
  );

  ctx.save();
  ctx.translate(cx, bottomY);

  // Status effect auras around player
  const hasShine = player.effects?.some((e) => e.id === 'shine');
  const hasFire = player.effects?.some((e) => e.id === 'on_fire');
  const hasPoison = player.effects?.some((e) => e.id === 'poisoned');
  const hasIronskin = player.effects?.some((e) => e.id === 'ironskin');
  if (hasShine) {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.26)';
    ctx.beginPath();
    ctx.arc(0, -22, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  if (hasIronskin) {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -22, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (hasFire) {
    ctx.fillStyle = 'rgba(249, 115, 22, 0.32)';
    ctx.beginPath();
    ctx.arc(0, -20 + Math.sin(elapsed * 20) * 2, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  if (hasPoison) {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.28)';
    ctx.beginPath();
    ctx.arc(0, -20, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.scale(player.facing * player.squashX, player.squashY);

  // Angel Wings behind torso when equipped
  if (hasWings) {
    const flap = player.onGround ? Math.sin(elapsed * 2.5) * 0.1 : Math.sin(elapsed * 18) * 0.48;
    ctx.save();
    ctx.translate(-8, -22);
    ctx.rotate(-0.45 + flap);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, -18, -28, -4);
    ctx.quadraticCurveTo(-20, 6, -6, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Animated tail behind body
  const tailWag = Math.sin(elapsed * 6 + player.walkDistance * 0.08) * 0.35;
  ctx.save();
  ctx.translate(-9, -18);
  ctx.rotate(-0.5 + tailWag);
  ctx.strokeStyle = '#6b6458';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -8, -14, -18);
  ctx.stroke();
  ctx.restore();

  // Legs (back + front, tinted if Greaves equipped)
  ctx.fillStyle = greavesDef ? greavesDef.accent : '#5c554b';
  ctx.beginPath();
  ctx.roundRect(-7 - walkSwing * 0.5, -12, 6, 12, 3);
  ctx.fill();

  ctx.fillStyle = greavesDef ? greavesDef.color : '#8b8274';
  ctx.beginPath();
  ctx.roundRect(1 + walkSwing * 0.5, -12, 6, 12, 3);
  ctx.fill();

  // Cute cat torso (or Chestplate armor)
  ctx.fillStyle = player.hitFlashTimer > 0 ? '#ffffff' : chestDef ? chestDef.color : '#9c9284';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-10, -26, 20, 17, 6);
  ctx.fill();
  ctx.stroke();

  if (chestDef) {
    ctx.fillStyle = chestDef.accent;
    ctx.fillRect(-5, -23, 10, 10);
  } else {
    // Belly patch & red adventurer collar
    ctx.fillStyle = '#e7e2d8';
    ctx.fillRect(-4, -22, 9, 11);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(-9, -26, 18, 4);
  }

  // Cobalt Shield badge on front side
  if (hasShield) {
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(2, -23, 9, 12, 3);
    ctx.fill();
    ctx.stroke();
  }

  // Cat Head using user's Zazu cat texture!
  const headY = -36 + Math.abs(walkSwing) * 0.2;
  ctx.save();
  ctx.translate(0, headY);

  // Pointed cat ears behind head
  ctx.fillStyle = '#8f8678';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-11, -5);
  ctx.lineTo(-13, -17);
  ctx.lineTo(-3, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(11, -5);
  ctx.lineTo(13, -17);
  ctx.lineTo(3, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (textures.catImg && textures.catImg.complete && player.hitFlashTimer <= 0) {
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(textures.catImg, -14, -14, 28, 28);
  } else {
    ctx.fillStyle = player.hitFlashTimer > 0 ? '#ffffff' : '#a8a29e';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Head outline ring
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, 13, 0, Math.PI * 2);
  ctx.stroke();

  // Equipped Helmet dome & crest over top of cat head
  if (helmetDef) {
    ctx.fillStyle = helmetDef.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, headY - 2, 13.5, Math.PI * 0.92, Math.PI * 2.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = helmetDef.accent;
    ctx.fillRect(-3, headY - 16, 6, 4);
  }

  // Held / Swinging Weapon in Paw
  if (player.activeWeaponId) {
    const item = ITEMS[player.activeWeaponId];
    if (item) {
      drawHeldWeapon(ctx, item, player, textures);
    }
  }

  ctx.restore();
}

function drawHeldWeapon(
  ctx: CanvasRenderingContext2D,
  item: (typeof ITEMS)[string],
  player: PlayerState,
  textures: LoadedTextures,
): void {
  const isSwinging = player.attackTimer > 0;
  const progress = isSwinging ? 1 - player.attackTimer / Math.max(0.01, player.attackDuration) : 0;

  ctx.save();
  ctx.translate(6, -18);

  if (item.weaponKind === 'melee' || item.category === 'tool') {
    const swingAngle = isSwinging ? -1.4 + progress * 2.8 : -0.35;
    ctx.rotate(swingAngle);

    if (item.textureSrc === '/assets/aistudio/sword_03ad3b16.png' && textures.swordImg) {
      // User's ornate sword texture tightly cropped!
      ctx.drawImage(textures.swordImg, -10, -48, 20, 50);
      if (item.id === 'ruby_greatsword') {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.fillRect(-4, -42, 8, 30);
      }
    } else if (item.category === 'tool') {
      // Pickaxe silhouette
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -26, 4, 26);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(-12, -23);
      ctx.quadraticCurveTo(0, -30, 12, -23);
      ctx.lineTo(10, -19);
      ctx.quadraticCurveTo(0, -24, -10, -19);
      ctx.closePath();
      ctx.fill();
    } else {
      // Sword silhouette
      ctx.fillStyle = item.color;
      ctx.fillRect(-3, -34, 6, 26);
      ctx.fillStyle = item.accent;
      ctx.fillRect(-7, -9, 14, 4);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-2, -5, 4, 8);
    }

    if (isSwinging && progress > 0.15 && progress < 0.8) {
      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(0, 0, 34, -1.2, 0.4);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  } else if (item.weaponKind === 'spear') {
    const thrust = isSwinging ? Math.sin(progress * Math.PI) * 26 : 0;
    ctx.translate(thrust, 0);
    ctx.rotate(Math.PI / 2 - 0.15);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -46, 4, 52);
    ctx.fillStyle = item.accent;
    ctx.beginPath();
    ctx.moveTo(0, -56);
    ctx.lineTo(-6, -42);
    ctx.lineTo(6, -42);
    ctx.closePath();
    ctx.fill();
  } else if (item.weaponKind === 'bow') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(4, 0, 14, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, -13);
    ctx.lineTo(isSwinging ? 0 : 6, 0);
    ctx.lineTo(6, 13);
    ctx.stroke();
  } else if (item.weaponKind === 'magic' || item.weaponKind === 'laser') {
    ctx.rotate(isSwinging ? 0.5 : 0.2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -22, 4, 24);
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, -24, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = item.accent;
    ctx.beginPath();
    ctx.arc(0, -24, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.weaponKind === 'gun') {
    ctx.fillStyle = item.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.fillRect(0, -5, 22, 8);
    ctx.strokeRect(0, -5, 22, 8);
    ctx.fillStyle = item.accent;
    ctx.fillRect(4, -2, 6, 3);
  } else if (item.weaponKind === 'hook') {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, -10);
    ctx.stroke();
    ctx.fillStyle = item.accent;
    ctx.beginPath();
    ctx.arc(14, -10, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.placesTile !== undefined || item.placesWall !== undefined) {
    ctx.fillStyle = item.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, -8, 12, 12);
    ctx.strokeRect(0, -8, 12, 12);
  }

  ctx.restore();
}

function drawHumanNpc(
  ctx: CanvasRenderingContext2D,
  npc: NpcEntity,
  player: PlayerState,
  elapsed: number,
  textures: LoadedTextures,
): void {
  const cx = npc.x + npc.width / 2;
  const bottomY = npc.y + npc.height;
  const ap = npc.appearance;
  const isSitting = npc.actionState === 'sit';
  const walkSwing = npc.onGround && !isSitting ? Math.sin(npc.walkDistance * 0.16) * 5.5 : 0;
  const breath = Math.sin(elapsed * 2.6 + npc.id) * 0.8;

  // Glance toward cat when nearby
  const lookDx = player.x + player.width / 2 - cx;
  const eyeShift = Math.max(-1.3, Math.min(1.3, lookDx / 120));

  ctx.save();
  ctx.translate(cx, bottomY);

  // Subtle shadow on ground
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.scale(npc.facing, 1);

  // Back leg
  ctx.fillStyle = ap.pants;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.3;
  if (isSitting) {
    ctx.beginPath();
    ctx.roundRect(-2, -13, 12, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(6, -11, 5, 11, 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.roundRect(-6 - walkSwing * 0.6, -15, 5.5, 14, 2);
    ctx.fill();
    ctx.stroke();
    // Shoe
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6 - walkSwing * 0.6, -3, 7, 3);
  }

  // Torso (shirt + optional apron/tie)
  const torsoY = (isSitting ? -28 : -31) + breath;
  ctx.fillStyle = ap.shirt;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-7, torsoY, 14, 17, 4);
  ctx.fill();
  ctx.stroke();

  if (ap.apron) {
    ctx.fillStyle = ap.apron;
    ctx.fillRect(-5, torsoY + 3, 10, 13);
  }

  // Front leg (walking)
  if (!isSitting) {
    ctx.fillStyle = ap.pants;
    ctx.beginPath();
    ctx.roundRect(0.5 + walkSwing * 0.6, -15, 5.5, 14, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.fillRect(0.5 + walkSwing * 0.6, -3, 7, 3);
  }

  // Neck
  ctx.fillStyle = ap.skinShade;
  ctx.fillRect(-2.5, torsoY - 3, 5, 4);

  // Head: Director Meow uses circular cat portrait + red bowtie!
  const headY = torsoY - 11;
  if (ap.textureSrc && textures.directorImg && textures.directorImg.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, headY - 1, 11.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(textures.directorImg, -12, headY - 13, 24, 24);
    ctx.restore();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, headY - 1, 11.5, 0, Math.PI * 2);
    ctx.stroke();
    // Red bowtie on suit collar
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, torsoY + 2);
    ctx.lineTo(-5, torsoY - 1);
    ctx.lineTo(-5, torsoY + 5);
    ctx.closePath();
    ctx.moveTo(0, torsoY + 2);
    ctx.lineTo(5, torsoY - 1);
    ctx.lineTo(5, torsoY + 5);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = ap.skin;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, headY, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rosy cheek & nose
    ctx.fillStyle = ap.blush;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(3.5, headY + 2, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = ap.skinShade;
    ctx.fillRect(4.5, headY - 0.5, 2, 2.5);

    // Smile
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(2.8, headY + 3, 2.5, 0.15, Math.PI - 0.35);
    ctx.stroke();

    // Eyes (with realistic blink!)
    const isBlinking = npc.blinkTimer < 0;
    if (isBlinking) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, headY - 1);
      ctx.lineTo(3.5, headY - 1);
      ctx.moveTo(5, headY - 1);
      ctx.lineTo(8, headY - 1);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, headY - 3, 3.6, 3.6);
      ctx.fillRect(4.8, headY - 3, 3.4, 3.6);
      ctx.fillStyle = ap.eyeColor;
      ctx.fillRect(1.1 + eyeShift * 0.6, headY - 2.3, 2, 2.4);
      ctx.fillRect(5.6 + eyeShift * 0.6, headY - 2.3, 2, 2.4);
    }

    // Eyebrows
    ctx.fillStyle = ap.hair;
    ctx.fillRect(-0.2, headY - 4.8, 3.8, 1.3);
    ctx.fillRect(4.8, headY - 4.8, 3.4, 1.3);

    // Merchant glasses
    if (ap.glasses) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(-0.5, headY - 3.5, 4.4, 4.4);
      ctx.strokeRect(4.5, headY - 3.5, 4.2, 4.4);
    }

    // Beard / Mustache if bearded
    if (ap.hairStyle === 'beard') {
      ctx.fillStyle = ap.hair;
      ctx.beginPath();
      ctx.arc(2, headY + 4, 6.5, 0, Math.PI);
      ctx.fill();
    }

    // Hair styles
    ctx.fillStyle = ap.hair;
    ctx.beginPath();
    ctx.arc(-0.5, headY - 2.5, 9.5, Math.PI * 0.9, Math.PI * 2.05);
    ctx.fill();
    ctx.fillRect(-9.5, headY - 3, 4.5, 8);
    if (ap.hairStyle === 'bun') {
      ctx.beginPath();
      ctx.arc(-9, headY - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hats
    if (ap.hat === 'tophat') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, headY - 10, 20, 3);
      ctx.fillRect(-7, headY - 19, 14, 9);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-7, headY - 12, 14, 2);
    } else if (ap.hat === 'nurse') {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.fillRect(-6, headY - 13, 12, 6);
      ctx.strokeRect(-6, headY - 13, 12, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-1, headY - 12, 2, 4);
      ctx.fillRect(-2, headY - 11, 4, 2);
    } else if (ap.hat === 'helmet') {
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, headY - 5, 10.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(6, headY - 9, 4, 4);
    } else if (ap.hat === 'leaves') {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-4, headY - 9, 3.5, 0, Math.PI * 2);
      ctx.arc(1, headY - 10, 4, 0, Math.PI * 2);
      ctx.arc(6, headY - 8, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Front Arm (waving, reading book, attacking, or natural walk swing)
  ctx.save();
  ctx.translate(1, torsoY + 4);
  if (npc.actionState === 'wave') {
    ctx.rotate(-2.2 + Math.sin(elapsed * 12) * 0.45);
  } else if (npc.actionState === 'read') {
    ctx.rotate(-0.65);
  } else if (npc.actionState === 'attack') {
    ctx.rotate(-0.9);
  } else {
    ctx.rotate(-walkSwing * 0.08);
  }
  ctx.fillStyle = ap.shirt;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(-2.5, 0, 5, 12, 2);
  ctx.fill();
  ctx.stroke();
  // Hand
  ctx.fillStyle = ap.skin;
  ctx.beginPath();
  ctx.arc(0, 12.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Pocket guide book when reading
  if (npc.actionState === 'read') {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(1, 9, 6, 8);
  }
  ctx.restore();

  ctx.restore(); // unflip facing

  // Clean Villager Name Tag above head & hats
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  const nameTag = `${npc.title} ${npc.name}`;
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 3;
  ctx.strokeText(nameTag, 0, -62 + breath);
  ctx.fillStyle = npc.homeTileX !== null ? '#a7f3d0' : '#fde68a';
  ctx.fillText(nameTag, 0, -62 + breath);

  // Lively Overhead Speech Bubble cleanly separated above nameplate
  if (npc.speechText) {
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    const bw = Math.min(220, Math.max(84, ctx.measureText(npc.speechText).width + 18));
    const bh = 22;
    const bx = -bw / 2;
    const by = -98 + breath;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(npc.speechText, 0, by + 15, bw - 10);
  }

  ctx.restore();
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  elapsed: number,
  textures: LoadedTextures,
): void {
  const cx = enemy.x + enemy.width / 2;
  const cy = enemy.y + enemy.height / 2;
  const isFlash = enemy.hitFlashTimer > 0;
  const isWindup = enemy.aiState === 'windup';

  ctx.save();
  if (enemy.aiState === 'ko') {
    ctx.globalAlpha = Math.max(0, enemy.koTimer / 0.35);
    ctx.translate(cx, cy);
    ctx.rotate(enemy.facing * (1 - enemy.koTimer / 0.35) * 1.4);
    ctx.translate(-cx, -cy);
  }

  if (
    enemy.kind === 'slime' ||
    enemy.kind === 'ice_slime' ||
    enemy.kind === 'sand_slime' ||
    enemy.kind === 'stardust_cell'
  ) {
    const squish = isWindup ? 0.72 : 1 + Math.sin(enemy.animPhase) * 0.08;
    const fill = isFlash
      ? '#ffffff'
      : isWindup
        ? '#bef264'
        : enemy.kind === 'ice_slime'
          ? '#38bdf8'
          : enemy.kind === 'sand_slime'
            ? '#eab308'
            : enemy.kind === 'stardust_cell'
              ? '#0ea5e9'
              : '#22c55e';
    const stroke =
      enemy.kind === 'ice_slime'
        ? '#0c4a6e'
        : enemy.kind === 'sand_slime'
          ? '#713f12'
          : enemy.kind === 'stardust_cell'
            ? '#0284c7'
            : '#14532d';
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      enemy.y + enemy.height - (enemy.height * squish) / 2,
      (enemy.width / 2) / squish,
      (enemy.height / 2) * squish,
      0,
      Math.PI,
      0,
    );
    ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
    ctx.lineTo(enemy.x, enemy.y + enemy.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = enemy.kind === 'stardust_cell' ? '#bae6fd' : '#0f172a';
    ctx.fillRect(cx - 5 + enemy.facing * 3, cy - 2, 3, 4);
    ctx.fillRect(cx + 2 + enemy.facing * 3, cy - 2, 3, 4);
  } else if (
    enemy.kind === 'bat' ||
    enemy.kind === 'ice_bat' ||
    enemy.kind === 'crimera' ||
    enemy.kind === 'hellbat' ||
    enemy.kind === 'pixie' ||
    enemy.kind === 'solar_corite' ||
    enemy.kind === 'nebula_floater' ||
    enemy.kind === 'alien_drone'
  ) {
    const flap = Math.sin(elapsed * 22 + enemy.id) * 9;
    if (enemy.kind === 'alien_drone') {
      ctx.fillStyle = isFlash ? '#ffffff' : '#334155';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 6, Math.PI, 0);
      ctx.fill();
    } else if (enemy.kind === 'pixie') {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlash ? '#ffffff' : '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx - 9, cy - 4 + flap * 0.4, 8, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 9, cy - 4 - flap * 0.4, 8, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const bodyColor = isFlash
        ? '#ffffff'
        : enemy.kind === 'ice_bat'
          ? '#0ea5e9'
          : enemy.kind === 'crimera'
            ? '#dc2626'
            : enemy.kind === 'hellbat'
              ? '#ea580c'
              : enemy.kind === 'solar_corite'
                ? '#f97316'
                : enemy.kind === 'nebula_floater'
                  ? '#d946ef'
                  : '#6b21a8';
      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - 18, cy - 8 + flap);
      ctx.lineTo(cx - 10, cy + 6);
      ctx.lineTo(cx, cy + 3);
      ctx.lineTo(cx + 10, cy + 6);
      ctx.lineTo(cx + 18, cy - 8 + flap);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = enemy.kind === 'ice_bat' ? '#e0f2fe' : '#fde047';
      ctx.fillRect(cx - 4, cy - 3, 3, 3);
      ctx.fillRect(cx + 1, cy - 3, 3, 3);
    }
  } else if (
    enemy.kind === 'goblin' ||
    enemy.kind === 'skeleton' ||
    enemy.kind === 'frost_viking' ||
    enemy.kind === 'antlion' ||
    enemy.kind === 'mummy' ||
    enemy.kind === 'face_monster' ||
    enemy.kind === 'blood_crawler' ||
    enemy.kind === 'sand_shark' ||
    enemy.kind === 'fire_imp' ||
    enemy.kind === 'fire_demon' ||
    enemy.kind === 'vortex_alien'
  ) {
    const isSkel = enemy.kind === 'skeleton';
    const bodyFill = isFlash
      ? '#ffffff'
      : isSkel
        ? '#e2e8f0'
        : enemy.kind === 'frost_viking'
          ? '#0284c7'
          : enemy.kind === 'antlion'
            ? '#d97706'
            : enemy.kind === 'mummy'
              ? '#fef3c7'
              : enemy.kind === 'face_monster'
                ? '#b91c1c'
                : enemy.kind === 'blood_crawler'
                  ? '#7f1d1d'
                  : enemy.kind === 'sand_shark'
                    ? '#64748b'
                    : enemy.kind === 'fire_imp' || enemy.kind === 'fire_demon'
                      ? '#dc2626'
                      : enemy.kind === 'vortex_alien'
                        ? '#10b981'
                        : '#4d7c0f';
    ctx.fillStyle = bodyFill;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(enemy.x + 3, enemy.y + 14, enemy.width - 6, enemy.height - 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, enemy.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (enemy.kind === 'frost_viking') {
      // Horned helmet
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx - 12, enemy.y + 2, 4, 6);
      ctx.fillRect(cx + 8, enemy.y + 2, 4, 6);
    } else if (enemy.kind === 'fire_demon' || enemy.kind === 'fire_imp') {
      // Demon horns
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 8, enemy.y - 2, 3, 6);
      ctx.fillRect(cx + 5, enemy.y - 2, 3, 6);
    }
    ctx.fillStyle = isWindup ? '#ef4444' : isSkel ? '#0f172a' : '#fef08a';
    ctx.fillRect(cx + enemy.facing * 2 - 2, enemy.y + 8, 4, 3);
    ctx.fillStyle = isWindup ? '#f97316' : '#94a3b8';
    ctx.save();
    ctx.translate(cx + enemy.facing * 10, cy);
    ctx.rotate(isWindup ? -0.9 * enemy.facing : 0.3 * enemy.facing);
    ctx.fillRect(-2, -16, 4, 18);
    ctx.restore();
  } else {
    drawBossEnemy(ctx, enemy, elapsed, textures);
  }

  // Telegraph ring during windup
  if (isWindup) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(enemy.width, enemy.height) * 0.72, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Pillar shield bar if shielded
  if ((enemy.maxShield ?? 0) > 0 && (enemy.shield ?? 0) > 0 && enemy.aiState !== 'ko') {
    const bw = Math.max(40, enemy.width);
    const bx = cx - bw / 2;
    const by = enemy.y - 17;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(bx - 1, by - 1, bw + 2, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(bx, by, bw * Math.max(0, (enemy.shield ?? 0) / (enemy.maxShield ?? 1)), 3);
  }

  // Enemy HP bar when damaged
  if (enemy.hp < enemy.maxHp && enemy.aiState !== 'ko') {
    const bw = Math.max(28, enemy.width);
    const bx = cx - bw / 2;
    const by = enemy.y - 10;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bx, by, bw * Math.max(0, enemy.hp / enemy.maxHp), 4);
  }

  ctx.restore();
}
