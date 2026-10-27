// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';
import type {TravelingMerchantState} from '../../types';

export function drawTravelingMerchant(
  ctx: CanvasRenderingContext2D,
  merchant: TravelingMerchantState,
  isHovered: boolean,
  animTimer: number,
) {
  if (!merchant.active) return;
  const mx = Math.round(merchant.x);
  const my = Math.round(merchant.y);

  ctx.save();
  ctx.translate(mx, my);

  if (merchant.state === 'sitting') {
    // 1. CARPET / RUG LAID OUT BENEATH SITTING MERCHANT
    const cw = 36;
    const ch = 14;
    const cx = -Math.floor(cw / 2);
    const cy = -4;

    // Carpet ground shadow
    drawDitherShadow(ctx, 0, cy + ch / 2 + 1, cw / 2 + 3, ch / 2 + 2, PALETTE[5]);

    // Carpet base (Wine / Burgundy)
    ctx.fillStyle = PALETTE[4];
    ctx.fillRect(cx, cy, cw, ch);

    // Left and Right Fringes (Pale parchment cream)
    ctx.fillStyle = PALETTE[0];
    for (let fy = cy; fy < cy + ch; fy += 2) {
      ctx.fillRect(cx - 2, fy, 2, 1);
      ctx.fillRect(cx + cw, fy, 2, 1);
    }

    // Antique Gold & Sand geometric borders
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(cx + 1, cy + 1, cw - 2, 1);
    ctx.fillRect(cx + 1, cy + ch - 2, cw - 2, 1);
    ctx.fillRect(cx + 1, cy + 1, 1, ch - 2);
    ctx.fillRect(cx + cw - 2, cy + 1, 1, ch - 2);

    // Diamond / tessellated patterned weave inside carpet
    ctx.fillStyle = PALETTE[1]; // sand ochre
    for (let dx = cx + 4; dx < cx + cw - 4; dx += 6) {
      ctx.fillRect(dx + 1, cy + 4, 3, 1);
      ctx.fillRect(dx, cy + 5, 5, 1);
      ctx.fillRect(dx + 1, cy + 6, 3, 1);
      ctx.fillRect(dx + 2, cy + 7, 1, 1);
    }

    // EXOTIC WARES DISPLAYED ON CARPET:
    // Left side: Jeweled flasks & obsidian shards
    ctx.fillStyle = PALETTE[7]; // emerald/verdigris potion vial
    ctx.fillRect(cx + 3, cy + 3, 3, 4);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(cx + 4, cy + 2, 1, 1);

    ctx.fillStyle = PALETTE[5]; // obsidian kopis razor shard
    ctx.fillRect(cx + 7, cy + 2, 4, 2);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(cx + 10, cy + 2, 1, 1);

    // Right side: Damascene steel spatha & golden coins
    ctx.fillStyle = PALETTE[15]; // gold coins pile
    ctx.fillRect(cx + cw - 7, cy + 6, 4, 3);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(cx + cw - 6, cy + 6, 2, 1);

    ctx.fillStyle = PALETTE[11]; // damascene steel curved blade
    ctx.fillRect(cx + cw - 12, cy + 3, 5, 2);
    ctx.fillStyle = PALETTE[15]; // crossguard
    ctx.fillRect(cx + cw - 8, cy + 2, 1, 4);

    // Glittering wares sparkle animation
    const sparkPulse = Math.floor(animTimer * 6) % 3;
    if (sparkPulse === 0) {
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(cx + 8, cy + 2, 1, 1);
      ctx.fillRect(cx + cw - 10, cy + 3, 1, 1);
    }

    // 2. SITTING CROSS-LEGGED MERCHANT SPRITE
    // Seated folded legs
    ctx.fillStyle = PALETTE[14]; // raw umber folded legs
    ctx.fillRect(-6, -6, 12, 4);
    ctx.fillStyle = PALETTE[1]; // desert robe folds
    ctx.fillRect(-5, -5, 10, 3);
    ctx.fillStyle = PALETTE[4]; // wine colored sash
    ctx.fillRect(-3, -4, 6, 2);

    // Seated torso
    ctx.fillStyle = PALETTE[1]; // ochre nomad tunic
    ctx.fillRect(-4, -14, 8, 9);
    ctx.fillStyle = PALETTE[4]; // nomad traveler mantle
    ctx.fillRect(-5, -14, 2, 8);
    ctx.fillRect(3, -14, 2, 8);
    ctx.fillStyle = PALETTE[15]; // bronze merchant medallion
    ctx.fillRect(-1, -12, 2, 3);

    // Resting arms & hands on lap
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-5, -9, 3, 4);
    ctx.fillRect(2, -9, 3, 4);

    // Head, Turban & Desert Face Veil
    ctx.fillStyle = PALETTE[0]; // pale linen desert turban
    ctx.fillRect(-4, -20, 8, 6);
    ctx.fillStyle = PALETTE[15]; // bronze turban jewel clasp
    ctx.fillRect(-1, -19, 2, 2);
    ctx.fillStyle = PALETTE[1]; // face skin
    ctx.fillRect(-3, -16, 6, 3);
    ctx.fillStyle = PALETTE[5]; // dark beard and eyes
    ctx.fillRect(-2, -16, 1, 1);
    ctx.fillRect(1, -16, 1, 1);
    ctx.fillRect(-3, -14, 6, 2);

    // Hover Highlight corner brackets (No flashing box)
    if (isHovered) {
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(cx - 3, cy - 2, 3, 2);
      ctx.fillRect(cx - 3, cy - 2, 2, 3);
      ctx.fillRect(cx + cw, cy - 2, 3, 2);
      ctx.fillRect(cx + cw + 1, cy - 2, 2, 3);
      ctx.fillRect(cx - 3, cy + ch, 3, 2);
      ctx.fillRect(cx - 3, cy + ch - 1, 2, 3);
      ctx.fillRect(cx + cw, cy + ch, 3, 2);
      ctx.fillRect(cx + cw + 1, cy + ch - 1, 2, 3);
    }
  } else {
    // WALKING NOMAD MERCHANT (Entering or Leaving)
    if (merchant.flipX) {
      ctx.scale(-1, 1);
    }

    // Foot shadow
    drawDitherShadow(ctx, 0, 1, 7, 2, PALETTE[5]);

    const walkStride = Math.round(Math.sin(animTimer * 10) * 2);

    // Boots
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-2 - walkStride, -6, 2, 6);
    ctx.fillRect(1 + walkStride, -6, 2, 6);

    // Long robes
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-4, -18, 8, 12);
    ctx.fillStyle = PALETTE[4]; // wine mantle
    ctx.fillRect(-5, -18, 3, 10);
    ctx.fillRect(2, -18, 3, 10);

    // Traveling pack on back
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-7, -19, 3, 9);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(-7, -17, 3, 2);

    // Walking staff with lantern in right hand
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(4, -24, 1, 24);
    ctx.fillStyle = PALETTE[15]; // brass lantern top
    ctx.fillRect(3, -26, 3, 3);
    ctx.fillStyle = PALETTE[0]; // glowing lantern ember
    ctx.fillRect(4, -25, 1, 2);

    // Head & turban
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(-3, -24, 6, 6);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(0, -23, 2, 2);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-2, -20, 5, 3);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(1, -20, 1, 1);
  }

  ctx.restore();
}
