// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';
import type {PhysicianNpcState} from '../../types';

// Procedural Alexandrian Physician NPC Sprite
export function drawPhysicianNpc(
  ctx: CanvasRenderingContext2D,
  physician: PhysicianNpcState,
  animTimer: number,
) {
  if (!physician.active) return;
  const px = Math.round(physician.x);
  const py = Math.round(physician.y);

  ctx.save();
  ctx.translate(px, py);
  if (physician.flipX) ctx.scale(-1, 1);

  // Ground shadow
  drawDitherShadow(ctx, 0, 1, 7, 2, PALETTE[5]);

  const isWalking = physician.state === 'entering' || physician.state === 'roaming' || physician.state === 'departing';
  const walkStride = isWalking ? Math.round(Math.sin(animTimer * 12) * 2) : 0;
  const walkBob = isWalking ? Math.round(Math.abs(Math.sin(animTimer * 12)) * 1) : 0;
  const yOff = -walkBob;

  // Leather sandals & feet
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(-2 - walkStride, yOff - 3, 2, 3);
  ctx.fillRect(1 + walkStride, yOff - 3, 2, 3);

  // Scholarly White Robe (#ffffff) with Emerald Green Trim (#2f5c3a)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-4, yOff - 17, 8, 14);
  // Emerald trim along hem and down chest
  ctx.fillStyle = '#2f5c3a';
  ctx.fillRect(-4, yOff - 4, 8, 2);
  ctx.fillRect(-1, yOff - 17, 2, 13);
  ctx.fillStyle = '#437e50';
  ctx.fillRect(-4, yOff - 10, 8, 1);

  // Medical leather satchel slung across shoulder
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(-4, yOff - 16, 2, 8);
  ctx.fillRect(-2, yOff - 12, 2, 4);
  ctx.fillStyle = '#3f363b';
  ctx.fillRect(-6, yOff - 9, 3, 5);
  // Healing cross emblem on satchel
  ctx.fillStyle = '#2f5c3a';
  ctx.fillRect(-5, yOff - 7, 1, 3);
  ctx.fillRect(-6, yOff - 6, 3, 1);

  // Left hand: Carrying smoking herbal censer on a bronze chain
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(-4, yOff - 11, 2, 3);
  // Bronze chain
  ctx.fillStyle = '#9c8053';
  ctx.fillRect(-6, yOff - 10, 1, 4);
  // Censer body
  ctx.fillStyle = '#ded095';
  ctx.fillRect(-8, yOff - 6, 5, 4);
  ctx.fillStyle = '#ba7654';
  ctx.fillRect(-7, yOff - 7, 3, 2);
  // Herbal smoke drifting upward from censer
  const smokeFrame = Math.floor(animTimer * 6) % 3;
  ctx.fillStyle = 'rgba(136, 153, 122, 0.7)';
  ctx.fillRect(-7 + (smokeFrame === 0 ? 0 : smokeFrame === 1 ? -1 : 1), yOff - 9, 2, 2);
  ctx.fillRect(-8 + (smokeFrame === 1 ? 1 : 0), yOff - 12, 3, 2);

  // Right hand: Carrying linen bandage roll & herbal vial
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(3, yOff - 11, 2, 3);
  // Clean white linen bandage roll
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, yOff - 10, 3, 3);
  // Emerald tincture bottle
  ctx.fillStyle = '#2f5c3a';
  ctx.fillRect(4, yOff - 7, 2, 3);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(4, yOff - 8, 2, 1);

  // Head, Alexandrian philosopher haircut & scholarly emerald browband
  ctx.fillStyle = PALETTE[1]; // skin
  ctx.fillRect(-3, yOff - 22, 6, 5);
  ctx.fillStyle = '#574b50'; // grizzled dark curls
  ctx.fillRect(-4, yOff - 24, 8, 3);
  ctx.fillRect(-4, yOff - 22, 2, 3);
  // Emerald green browband
  ctx.fillStyle = '#2f5c3a';
  ctx.fillRect(-3, yOff - 23, 6, 1);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(0, yOff - 23, 1, 1);
  // Trimmed beard & eyes
  ctx.fillStyle = '#574b50';
  ctx.fillRect(-3, yOff - 18, 6, 2);
  ctx.fillStyle = '#3f363b';
  ctx.fillRect(1, yOff - 20, 1, 1);

  ctx.restore();
}
