// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow, drawSoftAmbientBloom} from '../primitives';
import type {FeastSlaveNpc} from '../../types';

// Procedural Banquet Table with Roast Meats, Falernian Wine, and Multi-Candle Ambient Lighting
export function drawFeastTable(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  alpha: number,
  animTime: number,
) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

  // Table ground shadow
  drawDitherShadow(ctx, cx, cy + 10, 32, 6, PALETTE[5]);

  // Wooden banquet table base & legs (#7f644b, #574b50)
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(cx - 28, cy - 6, 56, 14);
  // Legs
  ctx.fillStyle = '#574b50';
  ctx.fillRect(cx - 26, cy + 8, 4, 6);
  ctx.fillRect(cx - 14, cy + 8, 3, 5);
  ctx.fillRect(cx + 11, cy + 8, 3, 5);
  ctx.fillRect(cx + 22, cy + 8, 4, 6);

  // Tablecloth runner (cream linen #ded095 with imperial crimson #9e4a42 border)
  ctx.fillStyle = '#ded095';
  ctx.fillRect(cx - 27, cy - 6, 54, 12);
  ctx.fillStyle = '#9e4a42';
  ctx.fillRect(cx - 27, cy + 5, 54, 2);
  ctx.fillRect(cx - 27, cy - 6, 54, 1);

  // Platters of roast meats & bread loaves
  // Roast suckling pig / roast meats platter in center
  ctx.fillStyle = '#9c8053'; // bronze platter
  ctx.fillRect(cx - 8, cy - 3, 16, 6);
  ctx.fillStyle = '#ba7654'; // roast meat
  ctx.fillRect(cx - 6, cy - 4, 12, 5);
  ctx.fillStyle = '#7f644b'; // browned crust
  ctx.fillRect(cx - 4, cy - 4, 8, 2);

  // Bread basket / loaves on left
  ctx.fillStyle = '#cb9f6b';
  ctx.fillRect(cx - 22, cy - 2, 8, 4);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(cx - 20, cy - 3, 5, 2);

  // Grapes & figs on right
  ctx.fillStyle = '#55796f';
  ctx.fillRect(cx + 12, cy - 2, 7, 4);
  ctx.fillStyle = '#6d3947';
  ctx.fillRect(cx + 13, cy - 3, 4, 2);

  // Falernian Wine Amphorae jars
  ctx.fillStyle = '#ba7654'; // terracotta amphora
  ctx.fillRect(cx - 13, cy - 5, 4, 7);
  ctx.fillStyle = '#6d3947'; // wine wax seal
  ctx.fillRect(cx - 12, cy - 6, 2, 2);

  ctx.fillStyle = '#ba7654';
  ctx.fillRect(cx + 8, cy - 4, 4, 6);
  ctx.fillStyle = '#ded095'; // handles
  ctx.fillRect(cx + 7, cy - 3, 1, 3);
  ctx.fillRect(cx + 12, cy - 3, 1, 3);

  // Multi-Candle Bronze Braziers & Candlelight Effects
  const candles = [
    { x: cx - 18, y: cy - 7, phase: 0 },
    { x: cx,      y: cy - 8, phase: 1.5 },
    { x: cx + 18, y: cy - 7, phase: 3.0 },
  ];

  candles.forEach((cand, cIdx) => {
    // Soft radial ambient bloom radiating warmly from the table candles
    drawSoftAmbientBloom(ctx, cand.x, cand.y, 16, animTime, 1.25, cand.phase);

    // Bronze candelabra base
    ctx.fillStyle = '#9c8053';
    ctx.fillRect(cand.x - 2, cand.y + 2, 5, 2);
    ctx.fillRect(cand.x - 1, cand.y + 1, 3, 2);

    // Ivory wax candle pillar
    ctx.fillStyle = '#ded095';
    ctx.fillRect(cand.x - 1, cand.y - 2, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cand.x, cand.y - 2, 1, 3);

    // Flickering flame pixels
    const flick = (Math.floor(animTime * 15) + cIdx * 3) % 3;
    const fOffX = flick === 0 ? 0 : flick === 1 ? -1 : 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cand.x, cand.y - 3, 1, 2);
    ctx.fillStyle = '#F7DEAA';
    ctx.fillRect(cand.x + fOffX, cand.y - 4, 1, 2);
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(cand.x, cand.y - 5, 1, 1);
  });

  ctx.restore();
}

// Bustling Servant/Slave NPCs bringing platters
export function drawFeastSlaves(
  ctx: CanvasRenderingContext2D,
  slaves: FeastSlaveNpc[],
  animTime: number,
) {
  slaves.forEach((s) => {
    ctx.save();
    ctx.translate(Math.round(s.x), Math.round(s.y));
    if (s.flipX) ctx.scale(-1, 1);

    // Shadow
    drawDitherShadow(ctx, 0, 1, 5, 2, PALETTE[5]);

    const walkStride = Math.round(Math.sin(animTime * 14) * 2);
    // Bare feet
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-2 - walkStride, -3, 2, 3);
    ctx.fillRect(1 + walkStride, -3, 2, 3);

    // Linen slave tunic (#ded095 / #a4968d) with rope belt
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(-3, -14, 6, 11);
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(-3, -7, 6, 1);

    // Hands carrying serving platter or wine flagon
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(2, -11, 2, 4);
    ctx.fillRect(-4, -11, 2, 4);

    if (s.platterItem === 'roast') {
      ctx.fillStyle = '#9c8053'; // bronze tray
      ctx.fillRect(2, -12, 6, 2);
      ctx.fillStyle = '#ba7654'; // roast
      ctx.fillRect(3, -14, 4, 3);
    } else if (s.platterItem === 'wine') {
      ctx.fillStyle = '#ba7654'; // flagon
      ctx.fillRect(3, -14, 3, 5);
      ctx.fillStyle = '#6d3947';
      ctx.fillRect(4, -15, 1, 2);
    } else {
      ctx.fillStyle = '#cb9f6b'; // bread basket
      ctx.fillRect(2, -12, 5, 3);
    }

    // Head
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-2, -19, 5, 5);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-2, -21, 5, 2);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(1, -17, 1, 1);

    ctx.restore();
  });
}
