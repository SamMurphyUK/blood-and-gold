// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherRect, drawDitherShadow} from '../primitives';
import type {ArenaFortification} from '../../types';

export function drawFortifications(
  ctx: CanvasRenderingContext2D,
  fortifications: ArenaFortification[],
  animTimer = 0,
) {
  for (const fort of fortifications) {
    if (fort.type === 'river') {
      ctx.fillStyle = PALETTE[2];
      ctx.fillRect(fort.x - 4, fort.y, 4, fort.h);
      ctx.fillRect(fort.x + fort.w, fort.y, 4, fort.h);
      drawDitherRect(ctx, fort.x - 6, fort.y, 6, fort.h, PALETTE[2], PALETTE[1], 0.5);
      drawDitherRect(ctx, fort.x + fort.w, fort.y, 6, fort.h, PALETTE[2], PALETTE[1], 0.5);
      ctx.fillStyle = PALETTE[6];
      ctx.fillRect(fort.x, fort.y, fort.w, fort.h);
      ctx.fillStyle = PALETTE[7];
      for (let ry = fort.y; ry < fort.y + fort.h; ry += 4) {
        const waveShift = Math.sin(animTimer * 5 + ry * 0.4) * 3;
        ctx.fillRect(fort.x + 2 + waveShift, ry, fort.w - 4, 2);
      }
      const foamTick = Math.floor(animTimer * 8);
      ctx.fillStyle = PALETTE[0];
      for (let fy = fort.y + 4; fy < fort.y + fort.h - 4; fy += 12) {
        const fx = fort.x + 4 + ((fy * 13 + foamTick * 5) % Math.max(1, fort.w - 10));
        ctx.fillRect(fx, fy, 4, 1);
        ctx.fillRect(fx + 1, fy - 1, 2, 1);
      }
      ctx.fillStyle = PALETTE[10];
      ctx.fillRect(fort.x + 6, fort.y + 24, 4, 3);
      ctx.fillRect(fort.x + fort.w - 10, fort.y + 65, 5, 3);
      ctx.fillRect(fort.x + 12, fort.y + 98, 4, 3);
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(fort.x - 2, fort.y + 35, 1, 6);
      ctx.fillRect(fort.x + fort.w + 1, fort.y + 70, 1, 6);
    } else if (fort.type === 'low_wall') {
      drawDitherShadow(ctx, fort.x + fort.w / 2, fort.y + fort.h + 2, fort.w / 2 + 2, 3, PALETTE[5]);
      ctx.fillStyle = PALETTE[10];
      ctx.fillRect(fort.x, fort.y, fort.w, fort.h);
      ctx.fillStyle = PALETTE[5];
      for (let by = fort.y; by <= fort.y + fort.h; by += 8) {
        ctx.fillRect(fort.x, by, fort.w, 1);
        const stagger = (by / 8) % 2 === 0 ? fort.x + 4 : fort.x + 8;
        ctx.fillRect(stagger, by, 1, 8);
      }
      ctx.fillStyle = PALETTE[11];
      ctx.fillRect(fort.x - 1, fort.y, fort.w + 2, 3);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(fort.x - 1, fort.y, fort.w + 2, 1);
      for (let cy = fort.y; cy < fort.y + fort.h; cy += 12) {
        ctx.fillStyle = PALETTE[11];
        ctx.fillRect(fort.x - 2, cy + 2, 2, 5);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(fort.x - 2, cy + 7, 2, 1);
      }
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(fort.x - 3, fort.y + 12, 2, 3);
      ctx.fillRect(fort.x - 3, fort.y + 28, 2, 3);
      ctx.fillStyle = PALETTE[11];
      ctx.fillRect(fort.x - 4, fort.y + 13, 1, 1);
      ctx.fillRect(fort.x - 4, fort.y + 29, 1, 1);
    }
  }
}
