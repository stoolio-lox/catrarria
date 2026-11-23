import { EnemyEntity, EnemyKind } from './types';

export interface BossTextures {
  kotulhuImg: HTMLImageElement | null;
  catWormImg: HTMLImageElement | null;
}

/**
 * Custom sprite override map so user-provided boss images can be plugged in cleanly.
 */
export const BOSS_SPRITE_OVERRIDES: Partial<Record<EnemyKind, HTMLImageElement | null>> = {};

export function registerBossSpriteOverride(kind: EnemyKind, src: string): void {
  const img = new Image();
  img.onload = () => {
    BOSS_SPRITE_OVERRIDES[kind] = img;
  };
  img.src = src;
}

export function drawBossEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  elapsed: number,
  textures: BossTextures,
): boolean {
  const cx = enemy.x + enemy.width / 2;
  const cy = enemy.y + enemy.height / 2;
  const isFlash = enemy.hitFlashTimer > 0;
  const isWindup = enemy.aiState === 'windup';
  const isPhase2 = enemy.hp < enemy.maxHp * 0.5;

  // Allow seamless custom boss sprite override if registered
  const overrideImg = BOSS_SPRITE_OVERRIDES[enemy.kind];
  if (overrideImg && overrideImg.complete && !isFlash) {
    if (enemy.segments && enemy.segments.length > 0) {
      for (let s = enemy.segments.length - 1; s >= 0; s--) {
        const seg = enemy.segments[s];
        const segRad = Math.max(12, 22 - s * 0.9);
        ctx.fillStyle = enemy.kind === 'the_destroyer' ? '#334155' : '#b45309';
        ctx.strokeStyle = enemy.kind === 'the_destroyer' ? '#ef4444' : '#fde68a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, segRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.drawImage(overrideImg, enemy.x, enemy.y, enemy.width, enemy.height);
    return true;
  }

  switch (enemy.kind) {
    case 'king_slime': {
      const squish = isWindup ? 0.78 : 1 + Math.sin(enemy.animPhase) * 0.06;
      ctx.fillStyle = isFlash ? '#ffffff' : isWindup ? '#86efac' : '#16a34a';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        enemy.y + enemy.height - (enemy.height * squish) / 2,
        enemy.width / 2 / squish,
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

      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 18, enemy.y + 6);
      ctx.lineTo(cx - 20, enemy.y - 12);
      ctx.lineTo(cx - 8, enemy.y - 3);
      ctx.lineTo(cx, enemy.y - 14);
      ctx.lineTo(cx + 8, enemy.y - 3);
      ctx.lineTo(cx + 20, enemy.y - 12);
      ctx.lineTo(cx + 18, enemy.y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, enemy.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 12 + enemy.facing * 4, cy - 2, 6, 7);
      ctx.fillRect(cx + 6 + enemy.facing * 4, cy - 2, 6, 7);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 11 + enemy.facing * 4, cy - 1, 2, 2);
      ctx.fillRect(cx + 7 + enemy.facing * 4, cy - 1, 2, 2);
      return true;
    }

    case 'kotulhu': {
      const rad = enemy.width / 2;
      ctx.strokeStyle = isPhase2 ? '#dc2626' : '#7f1d1d';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let t = -2; t <= 2; t++) {
        const sway = Math.sin(elapsed * 7 + t * 1.4) * 9;
        ctx.beginPath();
        ctx.moveTo(cx + t * 9, cy + rad * 0.4);
        ctx.quadraticCurveTo(cx + t * 14 + sway, cy + rad + 12, cx + t * 18 - sway, cy + rad + 24);
        ctx.stroke();
      }

      ctx.strokeStyle = isWindup || isPhase2 ? '#ef4444' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, rad + 3, 0, Math.PI * 2);
      ctx.stroke();

      if (textures.kotulhuImg && textures.kotulhuImg.complete && !isFlash) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(textures.kotulhuImg, cx - rad, cy - rad, rad * 2, rad * 2);
        if (isPhase2) {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.22)';
          ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = isFlash ? '#ffffff' : '#991b1b';
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'cat_worm': {
      if (enemy.segments) {
        for (let s = enemy.segments.length - 1; s >= 0; s--) {
          const seg = enemy.segments[s];
          const segRad = Math.max(12, 22 - s * 1.1);
          ctx.fillStyle = isFlash ? '#ffffff' : s % 2 === 0 ? '#78350f' : '#b45309';
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, segRad, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, segRad * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const rad = enemy.width / 2;
      ctx.strokeStyle = isWindup ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, rad + 2, 0, Math.PI * 2);
      ctx.stroke();

      if (textures.catWormImg && textures.catWormImg.complete && !isFlash) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(textures.catWormImg, cx - rad, cy - rad, rad * 2, rad * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = isFlash ? '#ffffff' : '#d97706';
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'skele_cat': {
      const armAngle = elapsed * 3.2;
      for (const side of [-1, 1]) {
        const hx = cx + side * 44 + Math.cos(armAngle * side) * 14;
        const hy = cy + 16 + Math.sin(armAngle * 1.3) * 14;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx + side * 16, cy + 8);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = isFlash ? '#ffffff' : '#f1f5f9';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx, hy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = isFlash ? '#ffffff' : '#e2e8f0';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 10);
      ctx.lineTo(cx - 26, cy - 36);
      ctx.lineTo(cx - 6, cy - 22);
      ctx.lineTo(cx + 6, cy - 22);
      ctx.lineTo(cx + 26, cy - 36);
      ctx.lineTo(cx + 20, cy - 10);
      ctx.arc(cx, cy, enemy.width / 2 - 4, -0.3, Math.PI + 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isWindup ? '#ef4444' : '#9333ea';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 4, 6, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 10, cy + 12, 4, 8);
      ctx.fillRect(cx - 2, cy + 12, 4, 8);
      ctx.fillRect(cx + 6, cy + 12, 4, 8);
      return true;
    }

    case 'eye_boss': {
      ctx.fillStyle = isFlash ? '#ffffff' : isWindup ? '#fca5a5' : '#f8fafc';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, enemy.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isWindup ? '#ef4444' : '#dc2626';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 6, cy, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 8, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'brain_cthulhu': {
      // Orbiting Creepers
      for (let i = 0; i < 4; i++) {
        const a = elapsed * 2.4 + (i * Math.PI) / 2;
        const ox = cx + Math.cos(a) * 52;
        const oy = cy + Math.sin(a) * 44;
        ctx.fillStyle = isFlash ? '#ffffff' : '#be123c';
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Pulsing Brain Lobes
      const pulse = 1 + Math.sin(elapsed * 6) * 0.05;
      ctx.fillStyle = isFlash ? '#ffffff' : '#e11d48';
      ctx.strokeStyle = '#4c0519';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx - 12, cy, 24 * pulse, 30 * pulse, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + 12, cy, 24 * pulse, 30 * pulse, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Brain folds
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 26);
      ctx.lineTo(cx, cy + 26);
      ctx.moveTo(cx - 22, cy - 8);
      ctx.quadraticCurveTo(cx - 8, cy - 16, cx - 2, cy - 6);
      ctx.moveTo(cx + 22, cy + 6);
      ctx.quadraticCurveTo(cx + 8, cy + 14, cx + 2, cy + 4);
      ctx.stroke();
      // Inner heart-eye
      ctx.fillStyle = isPhase2 ? '#fef08a' : '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 2, cy - 1, 4, 10);
      return true;
    }

    case 'queen_bee': {
      const flap = Math.sin(elapsed * 32) * 14;
      // Translucent wings
      ctx.fillStyle = 'rgba(224, 242, 254, 0.72)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(cx - 14, cy - 22 + flap * 0.4, 22, 11, -0.45, 0, Math.PI * 2);
      ctx.ellipse(cx + 14, cy - 22 - flap * 0.4, 22, 11, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Striped bee body
      ctx.fillStyle = isFlash ? '#ffffff' : '#facc15';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 16, cy - 19, 7, 38);
      ctx.fillRect(cx - 2, cy - 21, 7, 42);
      ctx.fillRect(cx + 12, cy - 18, 6, 36);
      // Stinger + crown + glowing eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx - enemy.facing * 32, cy - 4);
      ctx.lineTo(cx - enemy.facing * 44, cy + 2);
      ctx.lineTo(cx - enemy.facing * 32, cy + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 20, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'deerclops': {
      // Towering frosty antlers
      ctx.strokeStyle = isFlash ? '#ffffff' : '#cbd5e1';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 10, enemy.y + 12);
        ctx.lineTo(cx + s * 28, enemy.y - 16);
        ctx.lineTo(cx + s * 36, enemy.y - 28);
        ctx.moveTo(cx + s * 22, enemy.y - 8);
        ctx.lineTo(cx + s * 14, enemy.y - 24);
        ctx.stroke();
      }
      // Body & furry chest
      ctx.fillStyle = isFlash ? '#ffffff' : '#64748b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(enemy.x + 8, enemy.y + 22, enemy.width - 16, enemy.height - 24, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(cx, enemy.y + 20, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Single giant cyclops eye
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 4, enemy.y + 18, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 5, enemy.y + 18, 4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'wall_of_flesh': {
      // Towering crimson flesh pillar
      ctx.fillStyle = isFlash ? '#ffffff' : '#7f1d1d';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(enemy.x + 4, enemy.y, enemy.width - 8, enemy.height, 14);
      ctx.fill();
      ctx.stroke();
      // Veins & tendrils
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const ty = enemy.y + 24 + i * 38;
        ctx.beginPath();
        ctx.moveTo(cx + enemy.facing * 26, ty);
        ctx.lineTo(cx + enemy.facing * (48 + Math.sin(elapsed * 8 + i) * 10), ty + 6);
        ctx.stroke();
      }
      // Twin eyes top & bottom + giant toothed maw center
      for (const ey of [enemy.y + 30, enemy.y + enemy.height - 30]) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx + enemy.facing * 18, ey, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx + enemy.facing * 22, ey, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Maw
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.ellipse(cx + enemy.facing * 14, cy, 18, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      for (let t = -18; t <= 18; t += 9) {
        ctx.fillRect(cx + enemy.facing * 22, cy + t - 2, 6, 4);
      }
      return true;
    }

    case 'queen_slime': {
      // Sparkling winged crystal slime
      const flap = Math.sin(elapsed * 18) * 10;
      ctx.fillStyle = 'rgba(244, 114, 182, 0.78)';
      ctx.beginPath();
      ctx.ellipse(cx - 32, cy - 12 + flap, 24, 11, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 32, cy - 12 + flap, 24, 11, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlash ? '#ffffff' : '#ec4899';
      ctx.strokeStyle = '#831843';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, enemy.y + enemy.height - 24, enemy.width / 2, 28, 0, Math.PI, 0);
      ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
      ctx.lineTo(enemy.x, enemy.y + enemy.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Crystal core & tiara
      ctx.fillStyle = '#a5f3fc';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 12, cy + 4);
      ctx.lineTo(cx, cy + 16);
      ctx.lineTo(cx - 12, cy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 14, enemy.y - 4, 28, 8);
      return true;
    }

    case 'the_twins': {
      // Paired mechanical eyeballs linked by crimson muscle cord
      const rEye = { x: cx - 22, y: cy - 12 };
      const sEye = { x: cx + 22, y: cy + 14 };
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(rEye.x, rEye.y);
      ctx.quadraticCurveTo(cx, cy + 28, sEye.x, sEye.y);
      ctx.stroke();

      for (const [eye, irisColor] of [
        [rEye, '#ef4444'],
        [sEye, '#22c55e'],
      ] as const) {
        ctx.fillStyle = isFlash ? '#ffffff' : '#cbd5e1';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = irisColor;
        ctx.beginPath();
        ctx.arc(eye.x + enemy.facing * 6, eye.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eye.x + enemy.facing * 8, eye.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'the_destroyer': {
      if (enemy.segments) {
        for (let s = enemy.segments.length - 1; s >= 0; s--) {
          const seg = enemy.segments[s];
          const segRad = Math.max(13, 24 - s * 0.7);
          ctx.fillStyle = isFlash ? '#ffffff' : s % 2 === 0 ? '#1e293b' : '#475569';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, segRad, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Armored steel head with glowing red optical visor
      ctx.fillStyle = isFlash ? '#ffffff' : '#334155';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, enemy.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 8, cy - 5, 8, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'skeletron_prime': {
      const a = elapsed * 3.5;
      const limbColors = ['#ef4444', '#38bdf8', '#facc15', '#cbd5e1'];
      for (let i = 0; i < 4; i++) {
        const angle = a + (i * Math.PI) / 2;
        const hx = cx + Math.cos(angle) * 58;
        const hy = cy + Math.sin(angle) * 54;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = limbColors[i];
        ctx.beginPath();
        ctx.arc(hx, hy, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = isFlash ? '#ffffff' : '#94a3b8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 4, 6, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'plantera': {
      // Spiky vine tendrils
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 5;
      for (let i = 0; i < 4; i++) {
        const ang = elapsed * 2 + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * 58, cy + Math.sin(ang) * 54);
        ctx.stroke();
      }
      // Magenta flower petals
      for (let p = 0; p < 6; p++) {
        const ang = (p * Math.PI) / 3 + elapsed * 0.7;
        ctx.fillStyle = isFlash ? '#ffffff' : '#ec4899';
        ctx.strokeStyle = '#831843';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(ang) * 20,
          cy + Math.sin(ang) * 20,
          17,
          11,
          ang,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = isPhase2 ? '#4ade80' : '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'golem': {
      // Temple stone colossus + floating stone fists
      const punch = Math.sin(elapsed * 5) * 10;
      ctx.fillStyle = isFlash ? '#ffffff' : '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(enemy.x + 12, enemy.y + 14, enemy.width - 24, enemy.height - 16, 8);
      ctx.fill();
      ctx.stroke();
      // Fists
      ctx.fillStyle = '#92400e';
      ctx.fillRect(enemy.x - 10, cy - 6 + punch, 18, 20);
      ctx.fillRect(enemy.x + enemy.width - 8, cy - 6 - punch, 18, 20);
      // Glowing Sun Eye Core
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, enemy.y + 26, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 3, enemy.y + 26, 5, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'duke_fishron': {
      // Winged teal pig-dragon-fish
      const flap = Math.sin(elapsed * 18) * 14;
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx - enemy.facing * 26, cy - 36 + flap);
      ctx.lineTo(cx - enemy.facing * 6, cy - 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = isFlash ? '#ffffff' : '#14b8a6';
      ctx.strokeStyle = '#134e4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tusks & glowing cyan eyes
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.moveTo(cx + enemy.facing * 28, cy + 6);
      ctx.lineTo(cx + enemy.facing * 42, cy - 4);
      ctx.lineTo(cx + enemy.facing * 30, cy + 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 20, cy - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'empress_light': {
      // Radiant prismatic butterfly wings
      const flap = Math.sin(elapsed * 16) * 8;
      const wingGrad = ctx.createLinearGradient(cx - 46, cy - 30, cx + 46, cy + 30);
      wingGrad.addColorStop(0, '#f472b6');
      wingGrad.addColorStop(0.5, '#facc15');
      wingGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = isFlash ? '#ffffff' : wingGrad;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + s * 28, cy - 10 + flap * 0.4, 26, 18, s * -0.4, 0, Math.PI * 2);
        ctx.ellipse(cx + s * 22, cy + 16 - flap * 0.3, 18, 13, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Celestial silhouette & crown
      ctx.fillStyle = '#fdf2f8';
      ctx.beginPath();
      ctx.roundRect(cx - 11, cy - 22, 22, 46, 10);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, cy - 28, 11, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'lunatic_cultist': {
      // Floating mystic arcane circle behind
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.stroke();
      // Deep blue robes
      ctx.fillStyle = isFlash ? '#ffffff' : '#1e3a8a';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, enemy.y + 4);
      ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
      ctx.lineTo(enemy.x, enemy.y + enemy.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Plague bird mask & golden eyes
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx, enemy.y + 18, 12, 0, Math.PI * 2);
      ctx.lineTo(cx + enemy.facing * 24, enemy.y + 22);
      ctx.lineTo(cx, enemy.y + 25);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx + enemy.facing * 5, enemy.y + 16, 3.5, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'moon_lord': {
      // Cosmic teal tentacles
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (let t = -3; t <= 3; t++) {
        const sway = Math.sin(elapsed * 6 + t) * 11;
        ctx.beginPath();
        ctx.moveTo(cx + t * 12, cy + 28);
        ctx.quadraticCurveTo(cx + t * 18 + sway, cy + 54, cx + t * 22 - sway, cy + 72);
        ctx.stroke();
      }
      // Twin floating hand-eyes
      for (const s of [-1, 1]) {
        const hx = cx + s * 64;
        const hy = cy - 4 + Math.sin(elapsed * 4 + s) * 12;
        ctx.fillStyle = isFlash ? '#ffffff' : '#14b8a6';
        ctx.strokeStyle = '#042f2e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#5eead4';
        ctx.beginPath();
        ctx.arc(hx, hy, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      // Massive Eldritch Torso & Forehead True Eye
      ctx.fillStyle = isFlash ? '#ffffff' : '#115e59';
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(cx - 42, enemy.y + 6, 84, 92, 26);
      ctx.fill();
      ctx.stroke();
      // Forehead, left & right eyes
      for (const [ex, ey, er] of [
        [cx, enemy.y + 24, 11],
        [cx - 18, enemy.y + 44, 8],
        [cx + 18, enemy.y + 44, 8],
      ] as const) {
        ctx.fillStyle = '#ccfbf1';
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ex, ey, er * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      // Exposed celestial heart core
      ctx.fillStyle = isPhase2 ? '#f43f5e' : '#2dd4bf';
      ctx.beginPath();
      ctx.arc(cx, cy + 16, 13, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    default:
      return false;
  }
}
