// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';
import type {DevoteeState} from '../../types';

export function drawDevoteeSprite(
  ctx: CanvasRenderingContext2D,
  devotee: DevoteeState,
  animTimer: number,
) {
  if (!devotee.active) return;
  const dx = Math.round(devotee.x);
  const dy = Math.round(devotee.y);

  ctx.save();
  ctx.translate(dx, dy);
  if (devotee.flipX) ctx.scale(-1, 1);

  // Shadow
  drawDitherShadow(ctx, 0, 1, 6, 2, PALETTE[5]);

  const bounce = devotee.state === 'cheering'
    ? Math.round(Math.abs(Math.sin(animTimer * 8)) * 3)
    : devotee.state === 'entering' || devotee.state === 'leaving'
      ? Math.round(Math.abs(Math.sin(animTimer * 12)) * 2)
      : 0;

  const py = -bounce;

  // Flamboyant tunicked supporter
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(-2, py - 3, 2, 3);
  ctx.fillRect(1, py - 3, 2, 3);

  // Saffron/gold pleated tunic
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(-4, py - 16, 8, 13);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(-4, py - 15, 3, 12);
  ctx.fillRect(-2, py - 12, 5, 2);
  ctx.fillRect(-4, py - 4, 8, 1);

  // Torso / Neck Gold Medallion
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(-1, py - 14, 2, 2);

  // Cheering arms
  if (devotee.state === 'cheering') {
    const wave = Math.sin(animTimer * 10) > 0 ? 1 : -1;
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-6, py - 20 + wave, 2, 7);
    ctx.fillRect(-7, py - 22 + wave, 3, 2);
    ctx.fillRect(4, py - 20 - wave, 2, 7);
    ctx.fillRect(4, py - 22 - wave, 3, 2);
  } else {
    const wArm = Math.sin(animTimer * 12) > 0 ? 1 : -1;
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-5, py - 12 + wArm, 2, 6);
    ctx.fillRect(3, py - 12 - wArm, 2, 6);
  }

  // Head & curls
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(-3, py - 22, 6, 6);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(-4, py - 25, 8, 4);
  ctx.fillRect(-4, py - 23, 2, 4);
  ctx.fillRect(2, py - 23, 2, 4);

  // Golden browband
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(-4, py - 23, 8, 1);
  ctx.fillRect(-2, py - 24, 4, 1);

  // Beaming face
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(-1, py - 20, 1, 1);
  ctx.fillRect(1, py - 20, 1, 1);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(-1, py - 18, 3, 1);

  ctx.restore();
}
