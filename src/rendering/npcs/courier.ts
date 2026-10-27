// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';

export function drawRomanCivilianCourier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  animTimer: number,
  flipX: boolean,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flipX) ctx.scale(-1, 1);

  // Ground shadow
  drawDitherShadow(ctx, 0, 1, 6, 2, PALETTE[5]);

  const walkStride = Math.round(Math.sin(animTimer * 14) * 2);

  // Brown leather sandals & bare calves
  ctx.fillStyle = PALETTE[1]; // flesh
  ctx.fillRect(-2 - walkStride, -6, 2, 4);
  ctx.fillRect(1 + walkStride, -6, 2, 4);
  ctx.fillStyle = PALETTE[14]; // leather sandals
  ctx.fillRect(-3 - walkStride, -2, 3, 2);
  ctx.fillRect(0 + walkStride, -2, 3, 2);

  // Roman Civilian Toga/Tunic Body (#ded095 pale parchment with #ba7654 terracotta drape)
  ctx.fillStyle = '#ded095'; // civilian tunic body
  ctx.fillRect(-4, -18, 8, 12);

  // Terracotta drape / sash across shoulder & chest (#ba7654)
  ctx.fillStyle = '#ba7654';
  ctx.fillRect(-4, -17, 3, 11);
  ctx.fillRect(-2, -14, 5, 3);
  ctx.fillRect(1, -11, 3, 4);
  // Gold fringe hem at base of toga
  ctx.fillStyle = '#ded095';
  ctx.fillRect(-4, -7, 8, 1);

  // Messenger leather pouch slung across body
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(2, -12, 3, 4);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(2, -10, 3, 1);

  // Arms: Right hand carrying imperial decree scroll with crimson wax seal
  ctx.fillStyle = PALETTE[1]; // arm
  ctx.fillRect(3, -15, 3, 5);
  ctx.fillStyle = '#ded095'; // parchment scroll
  ctx.fillRect(5, -16, 5, 2);
  ctx.fillStyle = '#9e4a42'; // red wax seal
  ctx.fillRect(7, -17, 2, 4);

  // Head and Roman civilian haircut
  ctx.fillStyle = PALETTE[1]; // face skin
  ctx.fillRect(-3, -24, 6, 6);
  ctx.fillStyle = PALETTE[5]; // dark roman curly hair
  ctx.fillRect(-4, -26, 8, 3);
  ctx.fillRect(-4, -24, 2, 3);
  ctx.fillStyle = PALETTE[5]; // eyes & mouth
  ctx.fillRect(1, -22, 1, 1);
  ctx.fillRect(0, -20, 2, 1); // shouting mouth

  ctx.restore();
}
