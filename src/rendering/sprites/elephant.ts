// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawCorpseFlies, drawDitherShadow} from '../primitives';

// ============================================================================
// 16-BIT COLOSSAL WAR ELEPHANT SPRITE (ARMORED HEAD PLATE, TUSKS, HOWDAH)
// ============================================================================

export function drawElephantSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
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
  const isRedFlash = (state === 'pinned' || state === 'hurt') && frame30 % 2 === 0;

  // Rage Aura
  if (rageTimer > 0) {
    const pulse = 1 + 0.3 * Math.sin(safeAnim * 16);
    drawDitherShadow(ctx, 0, -14, 28 * pulse, 22 * pulse, PALETTE[3]);
  }

  // 1. FALLEN DEATH STATE
  if (state === 'death' && deathTimer <= 0) {
    drawDitherShadow(ctx, 0, 1, 26, 6, PALETTE[5]);
    // Collapsed massive flank
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-22, -10, 42, 10);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(-18, -6, 36, 6);
    // Broken Howdah on sand
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-12, -14, 16, 5);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-8, -12, 12, 3);
    // Tusks in sand
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(16, -6, 12, 3);
    ctx.fillRect(26, -9, 4, 3);
    // Blood on sand
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-14, 0, 32, 2);
    ctx.fillRect(0, 1, 18, 1);
    // Fly particles buzzing around fallen war elephant
    drawCorpseFlies(ctx, 0, -6, safeAnim, 88, 8, 18);
    ctx.restore();
    return;
  }

  // 2. DRAMATIC DEATH FALL
  if (state === 'death' && deathTimer > 0) {
    const fallProgress = 1 - deathTimer / 1.6;
    const rot = (fallProgress * Math.PI) / 2.2;
    ctx.rotate(flipX ? -rot : rot);
  }

  // Wide ground shadow under elephant
  drawDitherShadow(ctx, 0, 1, 24, 6, PALETTE[5]);

  const isMoving = state === 'walking' || state === 'attack' || isCharging;
  const walkSpeed = isCharging ? 20 : 7;
  const walkCycle = isMoving ? Math.sin(safeAnim * walkSpeed) : 0;
  const walkBob = isMoving ? Math.round(Math.abs(Math.sin(safeAnim * walkSpeed)) * 1.5) : 0;

  let lungeX = 0;
  if (isCharging) lungeX = 6;
  else if (state === 'attack') lungeX = 4;
  else if (state === 'hurt') lungeX = -3;

  const bellyY = -12 - walkBob;
  const backY = bellyY - 14;

  // 4 MASSIVE PILLAR LEGS
  // Back Legs
  const backLegStride = isMoving ? Math.round(walkCycle * 4) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[9]; // inner leg shadow
  ctx.fillRect(lungeX - 16 - backLegStride, bellyY + 2, 6, 11);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[10]; // outer leg
  ctx.fillRect(lungeX - 12 - backLegStride, bellyY + 3, 6, 10);
  // Ivory toenails
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0];
  ctx.fillRect(lungeX - 12 - backLegStride, bellyY + 12, 2, 1);
  ctx.fillRect(lungeX - 9 - backLegStride, bellyY + 12, 2, 1);

  // Front Legs
  const frontLegStride = isMoving ? Math.round(-walkCycle * 4) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[9]; // inner front leg
  ctx.fillRect(lungeX + 6 + frontLegStride, bellyY + 2, 6, 11);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[10]; // outer front leg
  ctx.fillRect(lungeX + 10 + frontLegStride, bellyY + 3, 6, 10);
  // Ivory toenails
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0];
  ctx.fillRect(lungeX + 10 + frontLegStride, bellyY + 12, 2, 1);
  ctx.fillRect(lungeX + 13 + frontLegStride, bellyY + 12, 2, 1);

  // MASSIVE ELEPHANT BODY / FLANK (Stone Gray Palette: #817475, #4f4448, #3f363b)
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[10]; // weathered stone gray
  ctx.fillRect(lungeX - 22, backY, 34, 18);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[4] : PALETTE[9]; // dark charcoal muscle shade
  ctx.fillRect(lungeX - 20, bellyY - 3, 30, 6);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5]; // belly under-shadow
  ctx.fillRect(lungeX - 18, bellyY + 1, 26, 2);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[11]; // top back highlight
  ctx.fillRect(lungeX - 21, backY, 32, 2);

  // TAIL AT REAR
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[9];
  ctx.fillRect(lungeX - 24, backY + 4, 3, 10);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5];
  ctx.fillRect(lungeX - 25, backY + 12, 2, 4); // tuft

  // CARTHAGINIAN WAR BLANKET (Crimson & Gold Trim)
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[3]; // crimson blanket
  ctx.fillRect(lungeX - 14, backY - 2, 20, 11);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gold border & fringe
  ctx.fillRect(lungeX - 14, backY + 8, 20, 2);
  ctx.fillRect(lungeX - 14, backY - 2, 2, 11);
  ctx.fillRect(lungeX + 4, backY - 2, 2, 11);
  // Gold tessellated star emblem
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15];
  ctx.fillRect(lungeX - 6, backY + 2, 4, 4);

  // TOWER HOWDAH ON ELEPHANT'S BACK (Wood & Bronze Plates)
  const howdahY = backY - 9;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[14]; // raw umber timber box
  ctx.fillRect(lungeX - 10, howdahY, 14, 8);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15]; // bronze battle trim & crenelations
  ctx.fillRect(lungeX - 10, howdahY, 14, 2);
  ctx.fillRect(lungeX - 10, howdahY - 2, 3, 2); // left crenel
  ctx.fillRect(lungeX - 4, howdahY - 2, 3, 2);  // center crenel
  ctx.fillRect(lungeX + 1, howdahY - 2, 3, 2);  // right crenel
  // Howdah Imperial Pennant / Standard
  ctx.fillStyle = PALETTE[14]; // wood pole
  ctx.fillRect(lungeX - 10, howdahY - 11, 1, 12);
  ctx.fillStyle = PALETTE[3]; // crimson pennant
  ctx.fillRect(lungeX - 15, howdahY - 11, 5, 3);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(lungeX - 16, howdahY - 10, 2, 1);

  // ELEPHANT HEAD & ARMORED BRONZE HEAD PLATE (CHAMFRON)
  const hx = lungeX + 10;
  const hy = backY - 3;

  // Head dome
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[10];
  ctx.fillRect(hx, hy - 4, 13, 15);
  ctx.fillRect(hx + 3, hy - 7, 9, 5);

  // Armored Bronze Chamfron (Headplate) with Spikes
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15]; // antique bronze
  ctx.fillRect(hx + 4, hy - 7, 8, 8);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // gold specular glint
  ctx.fillRect(hx + 6, hy - 6, 4, 2);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[2]; // terracotta spike boss
  ctx.fillRect(hx + 10, hy - 4, 3, 3);

  // Heavy Ear
  const earFlap = isMoving ? Math.round(Math.sin(safeAnim * walkSpeed) * 2) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[9];
  ctx.fillRect(hx - 2, hy - 3 + earFlap, 6, 12);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[5];
  ctx.fillRect(hx - 1, hy + 7 + earFlap, 4, 3);

  // Eye
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isCharging ? PALETTE[3] : PALETTE[5];
  ctx.fillRect(hx + 6, hy - 1, 2, 2);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0];
  ctx.fillRect(hx + 6, hy - 1, 1, 1);

  // IVORY TUSKS (Colossal Curved Ivory with Bronze Ferrules)
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[15]; // bronze tusk bands
  ctx.fillRect(hx + 9, hy + 6, 3, 3);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[0]; // ivory tusk body
  ctx.fillRect(hx + 12, hy + 6, 8, 3);
  ctx.fillRect(hx + 18, hy + 3, 4, 4); // curve upward
  ctx.fillRect(hx + 21, hy, 3, 4);     // sharp upward tip
  ctx.fillRect(hx + 23, hy - 3, 2, 4);
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[1]; // shadow edge
  ctx.fillRect(hx + 12, hy + 8, 7, 1);

  // TRUNK (Swinging or Raised High in Trumpet During Charge)
  if (isCharging) {
    // Trumpeting High Trunk!
    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[10];
    ctx.fillRect(hx + 8, hy + 4, 5, 4);
    ctx.fillRect(hx + 11, hy + 1, 4, 4);
    ctx.fillRect(hx + 13, hy - 4, 4, 6);
    ctx.fillRect(hx + 15, hy - 9, 3, 6);
    ctx.fillRect(hx + 17, hy - 14, 3, 6);
    ctx.fillRect(hx + 16, hy - 17, 4, 4); // curl back
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(hx + 18, hy - 16, 2, 2); // nostrils
  } else {
    // Plodding Hanging Trunk
    const trunkSway = Math.round(Math.sin(safeAnim * 5) * 2);
    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[10];
    ctx.fillRect(hx + 8, hy + 5, 5, 5);
    ctx.fillRect(hx + 7 + trunkSway, hy + 9, 4, 6);
    ctx.fillRect(hx + 8 + trunkSway * 1.5, hy + 14, 4, 5);
    ctx.fillRect(hx + 11 + trunkSway * 1.5, hy + 16, 3, 3); // tip curl
  }

  // Trample dust puffs under feet
  if (isMoving && Math.floor(safeAnim * 10) % 2 === 0) {
    ctx.fillStyle = PALETTE[1]; // sand dust
    ctx.fillRect(lungeX - 16, bellyY + 11, 4, 2);
    ctx.fillRect(lungeX + 6, bellyY + 11, 4, 2);
  }

  ctx.restore();
}
