// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawCorpseFlies, drawDitherShadow} from '../primitives';

export function drawEmperorBossSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: 'idle' | 'walking' | 'sparring' | 'resting' | 'sitting' | 'attack' | 'hurt' | 'pinned' | 'pinning' | 'death',
  flipX: boolean,
  animTimer: number,
  flashWhiteTimer = 0,
  deathTimer = 0,
  rageTimer = 0,
) {
  ctx.save();
  ctx.translate(Math.round(x || 0), Math.round(y || 0));
  if (flipX) {
    ctx.scale(-1, 1);
  }

  const safeAnim = animTimer || 0;
  const frame30 = Math.floor(safeAnim * 30);
  const isWhiteFlash = flashWhiteTimer > 0;
  const isRedFlash = (state === 'pinned' || state === 'hurt') && frame30 % 2 === 0;

  // Golden Divine Aura sparkle particles overhead (Only if living)
  if (state !== 'death') {
    const glowSeed = Math.floor(safeAnim * 12);
    const glowCoords = [
      [-8, -32], [8, -31], [-9, -18], [9, -16], [-7, -6], [7, -5], [0, -36], [6, -24], [-6, -25]
    ];
    ctx.fillStyle = '#ded095';
    for (let i = 0; i < glowCoords.length; i++) {
      if ((glowSeed + i) % 3 === 0) {
        ctx.fillRect(glowCoords[i][0], glowCoords[i][1], 1, 1);
      }
    }
  }

  // 1. FALLEN DEATH PRONE
  if (state === 'death' && deathTimer <= 0) {
    drawDitherShadow(ctx, 0, 1, 15, 3, PALETTE[5]);
    // Fallen Emperor body
    ctx.fillStyle = PALETTE[4]; // imperial purple toga crumpled
    ctx.fillRect(-12, -4, 20, 4);
    ctx.fillStyle = PALETTE[15]; // gilded lorica squamata
    ctx.fillRect(-6, -6, 12, 3);
    // Shattered golden laurel wreath in sand
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(8, -4, 4, 2);
    ctx.fillRect(10, -6, 2, 2);
    // Gilded Gladius dropped on sand
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(-14, -2, 4, 1);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-18, -2, 4, 1);
    // Blood on sand
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-4, 0, 10, 2);
    drawCorpseFlies(ctx, 0, -3, safeAnim, 77, 4, 8);
    ctx.restore();
    return;
  }

  // 2. DRAMATIC DEATH FALL
  if (state === 'death' && deathTimer > 0) {
    const fallProgress = 1 - deathTimer / 1.6;
    const rot = (fallProgress * Math.PI) / 2.1;
    ctx.rotate(flipX ? -rot : rot);
  }

  // Pinned struggling shake effect
  if (state === 'pinned') {
    const pinnedShakeX = frame30 % 2 === 0 ? 1 : -1;
    ctx.translate(pinnedShakeX, 0);
  }

  // Foot shadow
  drawDitherShadow(ctx, 0, 1, 8, 2, PALETTE[5]);

  let lungeX = 0;
  if (state === 'attack' || state === 'pinning') {
    lungeX = 5;
  } else if (state === 'hurt') {
    lungeX = -4;
  } else if (state === 'walking') {
    lungeX = Math.round(Math.sin(safeAnim * 9) * 1.3);
  }

  const hipY = -12;
  const torsoY = -21;
  const headY = -28;

  // LEGS & GILDED GREAVES
  const walkStride = state === 'walking' ? Math.round(Math.sin(safeAnim * 12) * 2) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[4]; // imperial purple tunic hem
  ctx.fillRect(lungeX - 3, hipY - 2, 7, 3);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[15];
  ctx.fillRect(lungeX - 2 - walkStride, hipY + 1, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY + 1, 2, 6);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gleaming gold boots
  ctx.fillRect(lungeX - 2 - walkStride, hipY + 7, 2, 5);
  ctx.fillRect(lungeX + 1 + walkStride, hipY + 7, 2, 5);

  // FLOWING IMPERIAL PURPLE PALUDAMENTUM (CAPE FLUTTERING IN ARENA WIND)
  const capeWave = Math.sin(safeAnim * 8) > 0 ? 1 : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[4]; // royal purple #6d3947
  ctx.fillRect(lungeX - 7 - capeWave, torsoY - 1, 4, 14);
  ctx.fillRect(lungeX - 8 - capeWave, torsoY + 4, 3, 10);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gold embroidered border on cape
  ctx.fillRect(lungeX - 7 - capeWave, torsoY + 13, 4, 1);
  ctx.fillRect(lungeX - 8 - capeWave, torsoY + 13, 3, 1);

  // TORSO: GILDED LORICA SQUAMATA (Gold Scale Cuirass)
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[15];
  ctx.fillRect(lungeX - 4, torsoY, 8, 9);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gleaming masterwork gold
  ctx.fillRect(lungeX - 3, torsoY + 1, 6, 6);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[3]; // crimson imperial sash across chest
  ctx.fillRect(lungeX - 3, torsoY + 2, 6, 2);
  ctx.fillStyle = PALETTE[4]; // purple pteruges
  ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(lungeX - 4, torsoY + 8, 8, 1);

  // Gilded Winged Pauldrons
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0];
  ctx.fillRect(lungeX - 6, torsoY - 2, 3, 5);
  ctx.fillRect(lungeX + 4, torsoY - 2, 3, 5);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15];
  ctx.fillRect(lungeX - 5, torsoY - 1, 2, 3);
  ctx.fillRect(lungeX + 4, torsoY - 1, 2, 3);

  // HEAD & GOLDEN LAUREL WREATH
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[1];
  ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[9]; // trimmed beard
  ctx.fillRect(lungeX - 3, headY + 5, 6, 2);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // stern eyes
  ctx.fillRect(lungeX + 1, headY + 3, 2, 1);
  // Golden Laurel Crown
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15];
  ctx.fillRect(lungeX - 4, headY - 1, 8, 4);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gleaming laurel leaf points
  ctx.fillRect(lungeX - 5, headY - 3, 2, 3);
  ctx.fillRect(lungeX + 4, headY - 3, 2, 3);
  ctx.fillRect(lungeX - 2, headY - 4, 5, 2);
  ctx.fillRect(lungeX, headY - 5, 2, 2);

  // WEAPONS: GOLDEN EAGLE PARMA SHIELD (LEFT) & GILDED IMPERIAL GLADIUS (RIGHT)
  const isStriking = state === 'attack' || state === 'sparring' || state === 'pinning';
  const lx = lungeX - 5;
  const ly = torsoY + 4;
  const rx = lungeX + 3;
  const ry = torsoY + 2;

  // LEFT HAND: Golden Eagle Parma Shield
  ctx.fillStyle = PALETTE[15]; // antique gold rim
  ctx.fillRect(lx - 3, ly - 4, 6, 12);
  ctx.fillStyle = PALETTE[4];  // imperial purple face
  ctx.fillRect(lx - 2, ly - 3, 4, 10);
  ctx.fillStyle = PALETTE[0];  // golden Aquila eagle emblem in relief
  ctx.fillRect(lx - 2, ly - 1, 4, 3);
  ctx.fillRect(lx - 1, ly - 2, 2, 5);
  ctx.fillRect(lx - 3, ly + 1, 6, 1);

  // RIGHT HAND: Gilded Masterwork Imperial Gladius
  if (isStriking) {
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(rx - 1, ry + 1, 3, 2);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(rx + 2, ry - 1, 2, 6);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(rx + 4, ry, 12, 2);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(rx + 4, ry - 1, 10, 1);
    ctx.fillRect(rx + 15, ry, 2, 1);

    // Radiant golden sweeping slash trail
    ctx.fillStyle = 'rgba(255, 245, 180, 0.75)';
    ctx.fillRect(rx + 6, ry - 6, 9, 2);
    ctx.fillRect(rx + 13, ry - 4, 7, 2);
    ctx.fillRect(rx + 17, ry - 2, 5, 2);
  } else {
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(rx, ry + 1, 2, 3);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(rx - 2, ry, 6, 2);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(rx, ry - 12, 2, 12);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(rx, ry - 14, 2, 2);
  }

  ctx.restore();
}
