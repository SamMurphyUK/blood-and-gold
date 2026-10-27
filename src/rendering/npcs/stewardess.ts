// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';

export function drawLineageStewardess(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  animTimer: number,
  isHovered: boolean,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // Foot shadow
  drawDitherShadow(ctx, 0, 1, 7, 2, PALETTE[5]);

  if (isHovered) {
    drawDitherShadow(ctx, 0, 1, 9, 3, PALETTE[15]);
  }

  const breath = Math.round(Math.sin(animTimer * 2.8) * 0.5);
  const py = -breath;

  // Level 2 Breeding Pens addition: Decorative stone water basin beside stewardess
  if (level >= 2) {
    // Stone water basin (x: -14, y: -6)
    ctx.fillStyle = '#817475'; // limestone basin base
    ctx.fillRect(-16, -5, 8, 6);
    ctx.fillStyle = '#ded095'; // rim highlight
    ctx.fillRect(-17, -7, 10, 2);
    // Fresh sparkling water inside (#55796f, #ded095)
    ctx.fillStyle = '#55796f';
    ctx.fillRect(-15, -6, 6, 2);
    const waterSparkle = Math.floor(animTimer * 5) % 2 === 0;
    if (waterSparkle) {
      ctx.fillStyle = '#ded095';
      ctx.fillRect(-14, -6, 2, 1);
    }

    // Small scroll table beside stewardess (x: 10, y: -6)
    ctx.fillStyle = '#7f644b'; // wooden table
    ctx.fillRect(10, -6, 9, 7);
    ctx.fillStyle = '#ded095'; // stacked papyrus lineage scrolls on table
    ctx.fillRect(11, -8, 7, 2);
    ctx.fillStyle = '#ba7654'; // wax seal ribbon on scroll
    ctx.fillRect(14, -8, 2, 2);
    ctx.fillStyle = '#3f363b'; // inkpot
    ctx.fillRect(16, -9, 2, 2);
    ctx.fillStyle = '#ded095'; // quill sticking out
    ctx.fillRect(17, -11, 1, 2);
  }

  // Sandals
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(-2, py - 3, 2, 3);
  ctx.fillRect(1, py - 3, 2, 3);

  // Female Matriarch / Lineage Steward NPC:
  // Draped stola tunic in soft cream / parchment (#e0d2b4 / #ded095) with burgundy sash (#6d3947)
  ctx.fillStyle = '#e0d2b4'; // soft cream stola body
  ctx.fillRect(-4, py - 18, 8, 15);
  ctx.fillStyle = '#ded095'; // drapery folds
  ctx.fillRect(-4, py - 16, 3, 13);
  ctx.fillStyle = '#6d3947'; // classical palla sash drape over shoulder
  ctx.fillRect(-3, py - 17, 2, 12);
  ctx.fillRect(-1, py - 13, 4, 3);
  ctx.fillStyle = '#ded095'; // gold embroidered hem
  ctx.fillRect(-4, py - 4, 8, 1);

  // Arms: Holding unrolled lineage papyrus scroll
  ctx.fillStyle = PALETTE[1]; // arms
  ctx.fillRect(-5, py - 12, 2, 5);
  ctx.fillRect(3, py - 12, 2, 5);

  // Unrolled lineage papyrus scroll between hands
  ctx.fillStyle = '#ded095'; // scroll papyrus
  ctx.fillRect(-3, py - 11, 7, 4);
  ctx.fillStyle = '#7f644b'; // wooden scroll rods
  ctx.fillRect(-4, py - 12, 1, 6);
  ctx.fillRect(4, py - 12, 1, 6);
  // Written text ink markings on scroll
  ctx.fillStyle = '#3f363b';
  ctx.fillRect(-2, py - 10, 4, 1);
  ctx.fillRect(-2, py - 8, 3, 1);

  // Head: Classical Roman female braided hair & golden pins
  ctx.fillStyle = PALETTE[1]; // face
  ctx.fillRect(-3, py - 22, 6, 5);
  ctx.fillStyle = '#7f644b'; // chestnut brown braided hair
  ctx.fillRect(-4, py - 25, 8, 4);
  ctx.fillRect(-4, py - 22, 2, 4); // side braids
  ctx.fillRect(2, py - 22, 2, 3);
  // Golden hairpins / laurel ribbon in braided bun
  ctx.fillStyle = '#ded095';
  ctx.fillRect(-2, py - 25, 4, 1);
  ctx.fillRect(-1, py - 26, 2, 2);

  // Serene face & eyes
  ctx.fillStyle = '#3f363b';
  ctx.fillRect(0, py - 20, 1, 1);
  ctx.fillStyle = '#9e4a42'; // lips
  ctx.fillRect(-1, py - 18, 2, 1);

  ctx.restore();
}
