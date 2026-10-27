// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawCorpseFlies, drawDitherShadow} from '../primitives';
import type {Culture} from '../../types';

// ============================================================================
// 16-BIT CAVALRY COMBATANT SPRITE (RIDER + STEED UNIFIED COMBATANT)
// ============================================================================

export function drawCavalrySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  culture: Culture,
  state: 'idle' | 'walking' | 'sparring' | 'resting' | 'sitting' | 'attack' | 'hurt' | 'pinned' | 'pinning' | 'death',
  flipX: boolean,
  animTimer: number,
  flashWhiteTimer = 0,
  deathTimer = 0,
  rageTimer = 0,
  level = 1,
  isCharging = false,
) {
  ctx.save();
  ctx.translate(Math.round(x || 0), Math.round(y || 0));
  if (flipX) {
    ctx.scale(-1, 1);
  }

  const safeAnim = animTimer || 0;
  const frame30 = Math.floor(safeAnim * 30);
  const isWhiteFlash = flashWhiteTimer > 0;
  const isRedFlash = state === 'pinned' && frame30 % 2 === 0;

  // Rage Aura (Only if living)
  if (rageTimer > 0 && state !== 'death') {
    const pulse = 1 + 0.3 * Math.sin(safeAnim * 16);
    drawDitherShadow(ctx, 0, -12, 18 * pulse, 18 * pulse, PALETTE[3]);
  }

  // 1. FALLEN DEATH PRONE
  if (state === 'death' && deathTimer <= 0) {
    drawDitherShadow(ctx, 0, 1, 18, 4, PALETTE[5]);
    // Fallen steed
    ctx.fillStyle = PALETTE[14]; // raw umber body
    ctx.fillRect(-15, -4, 26, 4);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-12, -7, 18, 4);
    // Neck & head fallen on sand
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(6, -5, 8, 3);
    ctx.fillRect(11, -4, 4, 3);
    // Crimson saddle cloth
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-4, -6, 8, 2);
    // Fallen rider
    ctx.fillStyle = PALETTE[15]; // bronze cuirass
    ctx.fillRect(-8, -9, 8, 4);
    ctx.fillStyle = PALETTE[5]; // helmet
    ctx.fillRect(-12, -9, 4, 4);
    // Blood on arena sand
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-6, 0, 14, 2);
    ctx.fillRect(0, 1, 6, 1);
    // Fly particles buzzing around fallen cavalry body
    drawCorpseFlies(ctx, -2, -4, safeAnim, 42, 6, 12);
    ctx.restore();
    return;
  }

  // 2. DRAMATIC DEATH FALL
  if (state === 'death' && deathTimer > 0) {
    const fallProgress = 1 - deathTimer / 1.6;
    const rot = (fallProgress * Math.PI) / 2.0;
    ctx.rotate(flipX ? -rot : rot);
  }

  // Pinned or Pinning Shake
  if (state === 'pinned') {
    const pinnedShakeX = frame30 % 2 === 0 ? 1 : -1;
    ctx.translate(pinnedShakeX, 0);
  }

  // Wide ground shadow under mount
  drawDitherShadow(ctx, 0, 1, 16, 3, PALETTE[5]);

  // Gallop animation calculations
  const isMoving = state === 'walking' || state === 'attack';
  const gallopSpeed = 18;
  const gallopCycle = isMoving ? Math.sin(safeAnim * gallopSpeed) : 0;
  const gallopBob = isMoving ? Math.round(Math.abs(Math.sin(safeAnim * gallopSpeed)) * 2) : Math.round(Math.sin(safeAnim * 3) * 0.5);

  let lungeX = 0;
  if (state === 'attack') lungeX = 6;
  else if (state === 'hurt') lungeX = -4;

  const mountY = -8 - gallopBob;
  const riderY = mountY - 10;

  // HORSE LEGS
  // Back Legs (Kick back and tuck)
  const backLegStride = isMoving ? Math.round(gallopCycle * 5) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[5]; // back inner leg shadow
  ctx.fillRect(lungeX - 11 - backLegStride, mountY + 3, 2, 7);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14]; // back outer leg
  ctx.fillRect(lungeX - 9 - backLegStride, mountY + 4, 2, 6);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // hooves
  ctx.fillRect(lungeX - 11 - backLegStride, mountY + 9, 2, 1);
  ctx.fillRect(lungeX - 9 - backLegStride, mountY + 9, 2, 1);

  // Front Legs (Reach forward and plant)
  const frontLegStride = isMoving ? Math.round(-gallopCycle * 6) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[5]; // front inner leg shadow
  ctx.fillRect(lungeX + 7 + frontLegStride, mountY + 3, 2, 7);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14]; // front outer leg
  ctx.fillRect(lungeX + 9 + frontLegStride, mountY + 4, 2, 6);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // hooves
  ctx.fillRect(lungeX + 7 + frontLegStride, mountY + 9, 2, 1);
  ctx.fillRect(lungeX + 9 + frontLegStride, mountY + 9, 2, 1);

  // HORSE BODY & FLANK
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14]; // steed coat raw umber
  ctx.fillRect(lungeX - 14, mountY - 5, 23, 9);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[4] : PALETTE[5]; // muscle belly shade
  ctx.fillRect(lungeX - 12, mountY + 1, 20, 3);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[1]; // top back highlight
  ctx.fillRect(lungeX - 13, mountY - 5, 21, 1);

  // HORSE TAIL (Flowing with gallop)
  const tailWave = isMoving ? Math.round(Math.sin(safeAnim * gallopSpeed) * 2) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // dark tail
  ctx.fillRect(lungeX - 18, mountY - 4 + tailWave, 4, 2);
  ctx.fillRect(lungeX - 21, mountY - 2 + tailWave, 4, 2);
  ctx.fillRect(lungeX - 22, mountY + tailWave, 3, 3);

  // HORSE NECK & HEAD
  const headBob = isMoving ? Math.round(Math.sin(safeAnim * gallopSpeed) * 1.5) : 0;
  const hx = lungeX + 9;
  const hy = mountY - 8 + headBob;

  // Arching neck
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14];
  ctx.fillRect(hx, hy + 2, 6, 7);
  ctx.fillRect(hx + 2, hy - 1, 5, 5);

  // Dark mane along neck
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5];
  ctx.fillRect(hx - 1, hy, 2, 8);
  ctx.fillRect(hx + 1, hy - 3, 2, 4);

  // Head and muzzle
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14];
  ctx.fillRect(hx + 4, hy - 5, 7, 6);
  ctx.fillRect(hx + 8, hy - 3, 5, 4); // muzzle
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // nostrils & mouth
  ctx.fillRect(hx + 12, hy - 1, 2, 2);

  // Ears
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[14];
  ctx.fillRect(hx + 4, hy - 8, 2, 3);

  // Eye
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0];
  ctx.fillRect(hx + 7, hy - 4, 1, 1);

  // Reins & Bridle
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15]; // bronze bridle
  ctx.fillRect(hx + 8, hy - 4, 1, 4);
  ctx.fillRect(hx + 5, hy - 2, 4, 1);
  ctx.fillStyle = PALETTE[14]; // leather reins from bit to rider's hand
  ctx.fillRect(lungeX + 1, riderY + 4, hx + 5 - (lungeX + 1), 1);

  // SADDLE CLOTH (Imperial Crimson with Gold Fringe)
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[3]; // crimson blanket
  ctx.fillRect(lungeX - 5, mountY - 6, 12, 6);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15]; // gold fringe
  ctx.fillRect(lungeX - 5, mountY, 12, 1);
  ctx.fillRect(lungeX - 5, mountY - 6, 1, 6);
  ctx.fillRect(lungeX + 6, mountY - 6, 1, 6);

  // RIDER LEGS & STIRRUPS
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14]; // rider leather breeches
  ctx.fillRect(lungeX - 2, mountY - 5, 5, 8);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15]; // bronze greave
  ctx.fillRect(lungeX - 1, mountY + 2, 3, 4);
  ctx.fillStyle = PALETTE[5]; // iron stirrup ring
  ctx.fillRect(lungeX - 2, mountY + 5, 5, 1);

  // RIDER TORSO & ARMOR (Heavy Imperial Cavalry Cuirass)
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[15]; // bronze muscle breastplate
  ctx.fillRect(lungeX - 3, riderY - 6, 7, 8);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // muscle shading
  ctx.fillRect(lungeX - 1, riderY - 4, 3, 4);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gold specular glint
  ctx.fillRect(lungeX - 2, riderY - 5, 2, 2);

  // Banded cavalry pauldrons
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15];
  ctx.fillRect(lungeX - 5, riderY - 6, 2, 4);
  ctx.fillRect(lungeX + 3, riderY - 6, 2, 4);

  // RIDER HEAD & HELMET
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[15]; // bronze cavalry helmet
  ctx.fillRect(lungeX - 3, riderY - 13, 7, 7);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // eye slit & cheek guard
  ctx.fillRect(lungeX + 1, riderY - 10, 3, 2);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // eyes glint
  ctx.fillRect(lungeX + 2, riderY - 10, 1, 1);

  // Crimson Cavalry Crest / Plume trailing in wind
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[3];
  ctx.fillRect(lungeX - 3, riderY - 16, 5, 4);
  ctx.fillRect(lungeX - 6, riderY - 15, 3, 3);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0];
  ctx.fillRect(lungeX - 1, riderY - 17, 3, 1);

  // CAVALRY WEAPON: LONG VERTICAL LANCE (1 BLOCK WIDE) WITH FLUTTERING SWALLOWTAIL BANNER
  // Rendered held straight vertically (90 degrees), exactly 1 logical pixel/block wide
  const lanceX = lungeX + (state === 'attack' ? 5 : 2);
  const lanceTopY = riderY - 26;
  const lanceBottomY = mountY + 4;
  const lanceHeight = lanceBottomY - lanceTopY;

  // Lance Shaft (strictly 1 logical pixel/block wide)
  ctx.fillStyle = PALETTE[14]; // ash wood shaft
  ctx.fillRect(lanceX, lanceTopY + 4, 1, lanceHeight - 4);
  // Steel spearhead (strictly 1 logical pixel wide)
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(lanceX, lanceTopY + 1, 1, 3);
  // Gleaming tip (strictly 1 pixel wide)
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(lanceX, lanceTopY, 1, 1);

  // 16-bit Swallowtail Flutter Banner / Pennant Flag directly beneath spearhead
  // Crimson (#ba7654, PALETTE[2]) and Gold (#ded095, PALETTE[0])
  const flagWave = Math.sin(safeAnim * 14) > 0 ? 1 : 0;
  const flagY = lanceTopY + 4;
  ctx.fillStyle = '#ba7654'; // crimson swallowtail body
  ctx.fillRect(lanceX - 5, flagY, 5, 4);
  // Swallowtail twin split tails
  ctx.fillRect(lanceX - 7 + flagWave, flagY, 2, 2);
  ctx.fillRect(lanceX - 7 + flagWave, flagY + 2, 2, 2);
  ctx.fillStyle = PALETTE[5]; // center notch cut
  ctx.fillRect(lanceX - 6 + flagWave, flagY + 1, 2, 2);
  // Gold stripe / cross accent on pennant
  ctx.fillStyle = '#ded095';
  ctx.fillRect(lanceX - 4, flagY + 1, 4, 1);
  ctx.fillRect(lanceX - 2, flagY, 1, 4);

  // Dust puff particles under hooves when galloping
  if (isMoving && Math.floor(safeAnim * 12) % 2 === 0) {
    ctx.fillStyle = PALETTE[1]; // sand ochre dust
    ctx.fillRect(lungeX - 14, mountY + 8, 3, 1);
    ctx.fillRect(lungeX - 16, mountY + 7, 2, 1);
  }

  ctx.restore();
}
