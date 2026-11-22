import { ITEMS } from './catalog';
import {
  DropEntity,
  EnemyEntity,
  FloatingText,
  Particle,
  PlayerState,
  ProjectileEntity,
  TILE_SIZE,
  TileType,
  WallType,
  WorldData,
} from './types';
import { getTileMaxDamage, isTileSolid } from './worldGen';

export interface LoadedTextures {
  catImg: HTMLImageElement | null;
  skyImg: HTMLImageElement | null;
  swordImg: HTMLImageElement | null;
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
  textures: LoadedTextures;
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
  [TileType.IronOre]: { fill: '#5c6470', edge: '#3d4450', speck: '#e2c4a8' },
  [TileType.GoldOre]: { fill: '#5e6573', edge: '#3f4652', speck: '#facc15' },
  [TileType.RubyOre]: { fill: '#525968', edge: '#373e4d', speck: '#f43f5e' },
  [TileType.Glass]: { fill: 'rgba(186, 230, 253, 0.35)', edge: '#e0f2fe' },
  [TileType.Platform]: { fill: '#b67d47', edge: '#7c5128' },
};

const WALL_COLORS: Record<number, string> = {
  [WallType.DirtWall]: '#3b2416',
  [WallType.WoodWall]: '#593a22',
  [WallType.StoneWall]: '#2d333d',
  [WallType.BrickWall]: '#5e2821',
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

  // Distant parallax rolling hills above ground
  ctx.fillStyle = dayFactor > 0.4 ? 'rgba(20, 83, 45, 0.35)' : 'rgba(15, 23, 42, 0.55)';
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

      drawTile(ctx, tile, x, y, tx, ty, elapsed, textures);

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

      // Cave & night lighting shade per tile (zero string allocation)
      if (lightVal < 0.95) {
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

  // 5. Render Enemies
  for (const enemy of enemies) {
    drawEnemy(ctx, enemy, elapsed);
  }

  // 6. Render Cat Hero (Zazu texture + animated body/paws/tail + held/swinging weapon)
  drawCatHero(ctx, player, elapsed, textures);

  // 7. Render Projectiles
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
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(5, -4);
      ctx.lineTo(5, 4);
      ctx.closePath();
      ctx.fill();
    } else if (proj.kind === 'laser') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -2.5, 32, 5);
      ctx.fillStyle = '#fecaca';
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
    } else {
      // Magic orb / fireball / frost bolt / slime glob
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

  // 8. Render Pooled Particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.active) continue;
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // 9. Tile Hover Cursor Highlight
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

  // 10. Floating Damage / Info Texts
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

  // 11. World Speech Bubble over nearest visible Stool when active
  if (state.stoolSpeech) {
    for (let ty = startRow; ty <= endRow; ty++) {
      for (let tx = startCol; tx <= endCol; tx++) {
        if (world.tiles[ty * world.width + tx] === TileType.Stool) {
          const sx = tx * TILE_SIZE + 16;
          const sy = ty * TILE_SIZE - 14;
          const label = state.stoolSpeech.text;
          ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
          const tw = Math.max(90, ctx.measureText(label).width + 18);
          ctx.fillStyle = 'rgba(14, 23, 42, 0.94)';
          ctx.strokeStyle = state.stoolSpeech.stage === 'copied' ? '#34d399' : '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(sx - tw / 2, sy - 26, tw, 24, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fef3c7';
          ctx.textAlign = 'center';
          ctx.fillText(label, sx, sy - 10);
        }
      }
    }
  }

  ctx.restore();
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

  if (tile === TileType.Stool) {
    // Cozy wooden stool with 4 legs & warm cushion highlight
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(x + 8, y + 17, 3, 14);
    ctx.fillRect(x + 21, y + 17, 3, 14);
    ctx.fillStyle = '#784421';
    ctx.fillRect(x + 6, y + 17, 4, 15);
    ctx.fillRect(x + 22, y + 17, 4, 15);
    // Crossbar
    ctx.fillRect(x + 9, y + 24, 14, 3);
    // Seat
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 12, 24, 6, 2);
    ctx.fill();
    ctx.stroke();
    // Cushion / wood highlight
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 6, y + 13, 20, 2);
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
  } else if (tile === TileType.Planks) {
    ctx.fillStyle = pal.edge;
    ctx.fillRect(x, y + 10, TILE_SIZE, 2);
    ctx.fillRect(x, y + 21, TILE_SIZE, 2);
    ctx.fillRect(x + ((tx + ty) % 2 === 0 ? 12 : 22), y, 2, TILE_SIZE);
  } else if (tile === TileType.Brick || tile === TileType.RoofTile) {
    ctx.fillStyle = pal.edge;
    ctx.fillRect(x, y + 15, TILE_SIZE, 2);
    ctx.fillRect(x + (ty % 2 === 0 ? 14 : 6), y, 2, 16);
    ctx.fillRect(x + (ty % 2 === 0 ? 6 : 22), y + 16, 2, 16);
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
): void {
  const cx = player.x + player.width / 2;
  const bottomY = player.y + player.height;
  const walkSwing = player.onGround ? Math.sin(player.walkDistance * 0.14) * 5 : 4;

  ctx.save();
  ctx.translate(cx, bottomY);
  ctx.scale(player.facing * player.squashX, player.squashY);

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

  // Legs (back + front)
  ctx.fillStyle = '#5c554b';
  ctx.beginPath();
  ctx.roundRect(-7 - walkSwing * 0.5, -12, 6, 12, 3);
  ctx.fill();

  ctx.fillStyle = '#8b8274';
  ctx.beginPath();
  ctx.roundRect(1 + walkSwing * 0.5, -12, 6, 12, 3);
  ctx.fill();

  // Cute cat torso with scarf/collar
  ctx.fillStyle = player.hitFlashTimer > 0 ? '#ffffff' : '#9c9284';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-10, -26, 20, 17, 6);
  ctx.fill();
  ctx.stroke();

  // Belly patch & red adventurer collar
  ctx.fillStyle = '#e7e2d8';
  ctx.fillRect(-4, -22, 9, 11);
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(-9, -26, 18, 4);

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
  } else if (item.placesTile !== undefined || item.placesWall !== undefined) {
    ctx.fillStyle = item.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, -8, 12, 12);
    ctx.strokeRect(0, -8, 12, 12);
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyEntity, elapsed: number): void {
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

  if (enemy.kind === 'slime') {
    const squish = isWindup ? 0.72 : 1 + Math.sin(enemy.animPhase) * 0.08;
    ctx.fillStyle = isFlash ? '#ffffff' : isWindup ? '#bef264' : '#22c55e';
    ctx.strokeStyle = '#14532d';
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

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 5 + enemy.facing * 3, cy - 2, 3, 4);
    ctx.fillRect(cx + 2 + enemy.facing * 3, cy - 2, 3, 4);
  } else if (enemy.kind === 'bat') {
    const flap = Math.sin(elapsed * 22 + enemy.id) * 9;
    ctx.fillStyle = isFlash ? '#ffffff' : isWindup ? '#fb7185' : '#6b21a8';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1.8;
    // Wings
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
    // Glowing eyes
    ctx.fillStyle = '#fde047';
    ctx.fillRect(cx - 4, cy - 3, 3, 3);
    ctx.fillRect(cx + 1, cy - 3, 3, 3);
  } else if (enemy.kind === 'goblin' || enemy.kind === 'skeleton') {
    const isSkel = enemy.kind === 'skeleton';
    ctx.fillStyle = isFlash ? '#ffffff' : isSkel ? '#e2e8f0' : '#4d7c0f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    // Body
    ctx.beginPath();
    ctx.roundRect(enemy.x + 3, enemy.y + 14, enemy.width - 6, enemy.height - 14, 4);
    ctx.fill();
    ctx.stroke();
    // Head
    ctx.beginPath();
    ctx.arc(cx, enemy.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Eyes
    ctx.fillStyle = isWindup ? '#ef4444' : isSkel ? '#0f172a' : '#fef08a';
    ctx.fillRect(cx + enemy.facing * 2 - 2, enemy.y + 8, 4, 3);
    // Weapon telegraph
    ctx.fillStyle = isWindup ? '#f97316' : '#94a3b8';
    ctx.save();
    ctx.translate(cx + enemy.facing * 10, cy);
    ctx.rotate(isWindup ? -0.9 * enemy.facing : 0.3 * enemy.facing);
    ctx.fillRect(-2, -16, 4, 18);
    ctx.restore();
  } else if (enemy.kind === 'eye_boss') {
    ctx.fillStyle = isFlash ? '#ffffff' : isWindup ? '#fca5a5' : '#f8fafc';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, enemy.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iris + pupil
    ctx.fillStyle = isWindup ? '#ef4444' : '#dc2626';
    ctx.beginPath();
    ctx.arc(cx + enemy.facing * 6, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + enemy.facing * 8, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Telegraph ring during windup
  if (isWindup) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(enemy.width, enemy.height) * 0.72, 0, Math.PI * 2);
    ctx.stroke();
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
