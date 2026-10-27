// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {LOGIC_HEIGHT, LOGIC_WIDTH, drawDitherRect, drawDitherShadow} from '../primitives';
import {drawCulturalGladiator} from '../sprites/culturalGladiator';
import type {Gladiator} from '../../types';

// ============================================================================
// FIVE-TIER COLISEUM PODIUM & MONUMENTAL STAIRCASE SCREEN
// Visually rendered in five distinct elevation stages, adorned with curly Roman
// laurel/ivy vines, sculpted pedestals, and torches, rendered strictly using the
// 16-color antiquity palette and 4x pixel scaling.
// ============================================================================

export function drawRomanPodiumScreen(
  ctx: CanvasRenderingContext2D,
  unlockedTierIndex: number,
  animTimer: number,
  winningGlads: Gladiator[],
  newlyWonTier: number,
  podiumTimer: number,
  flashTimer: number,
) {
  const safeTierIdx = Math.max(0, unlockedTierIndex || 0);
  const safeAnim = animTimer || 0;
  const safePodiumTimer = Math.max(0, podiumTimer || 0);
  const safeFlashTimer = Math.max(0, flashTimer || 0);

  // Clear canvas with dark twilight roman arena vault
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

  // Upper sky glow through arches
  ctx.fillStyle = PALETTE[4]; // wine / burgundy twilight
  ctx.fillRect(0, 0, LOGIC_WIDTH, 44);
  drawDitherRect(ctx, 0, 36, LOGIC_WIDTH, 14, PALETTE[4], PALETTE[3], 0.5);

  // Monumental Colosseum Arches in background
  for (let ax = 20; ax < LOGIC_WIDTH - 20; ax += 60) {
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(ax, 12, 42, 48);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(ax + 4, 18, 34, 42);

    // Hanging imperial crimson banners
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(ax + 14, 20, 14, 28);
    ctx.fillStyle = PALETTE[15]; // gold eagle crest on banner
    ctx.fillRect(ax + 18, 26, 6, 6);
  }

  // Grand Colonnade archway cornice
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 48, LOGIC_WIDTH, 6);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 48, LOGIC_WIDTH, 2);

  // Pale alabaster floor base
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 168, LOGIC_WIDTH, 24);
  ctx.fillStyle = PALETTE[1];
  for (let fx = 0; fx < LOGIC_WIDTH; fx += 24) {
    ctx.fillRect(fx, 168, 1, 24);
  }

  // 5-STAGE MONUMENTAL ROMAN PODIUM STAIRCASE
  const stages = [
    { idx: 0, y: 154, h: 16, w: 260, x: 42, label: 'I' },
    { idx: 1, y: 132, h: 16, w: 210, x: 67, label: 'II' },
    { idx: 2, y: 110, h: 16, w: 160, x: 92, label: 'III' },
    { idx: 3, y: 88,  h: 16, w: 110, x: 117, label: 'IV' },
    { idx: 4, y: 62,  h: 18, w: 70,  x: 137, label: 'V' },
  ];

  stages.forEach((st) => {
    const isCompleted = safeTierIdx > st.idx;
    const isCurrent = safeTierIdx === st.idx;
    const isLocked = safeTierIdx < st.idx;

    const baseColor = isLocked ? PALETTE[9] : PALETTE[10];
    const treadColor = isLocked ? PALETTE[5] : isCurrent ? PALETTE[0] : PALETTE[11];

    // Riser face
    ctx.fillStyle = baseColor;
    ctx.fillRect(st.x, st.y, st.w, st.h);

    // Tread surface
    ctx.fillStyle = treadColor;
    ctx.fillRect(st.x - 2, st.y, st.w + 4, 3);
    ctx.fillStyle = isCurrent ? PALETTE[15] : PALETTE[0];
    ctx.fillRect(st.x - 2, st.y, st.w + 4, 1);

    // Riser bottom shadow
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(st.x, st.y + st.h - 1, st.w, 1);

    // Left and right balustrade pillars
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(st.x - 5, st.y - 4, 4, st.h + 4);
    ctx.fillRect(st.x + st.w + 1, st.y - 4, 4, st.h + 4);
    ctx.fillStyle = PALETTE[15]; // gold finial
    ctx.fillRect(st.x - 5, st.y - 6, 4, 2);
    ctx.fillRect(st.x + st.w + 1, st.y - 6, 4, 2);

    // Curly Roman Laurel & Ivy Vines clinging to balustrades & risers
    ctx.fillStyle = PALETTE[12]; // mossy olive stem
    ctx.fillRect(st.x - 4, st.y - 2, 2, st.h + 2);
    ctx.fillRect(st.x + st.w + 2, st.y - 2, 2, st.h + 2);
    ctx.fillStyle = PALETTE[8];  // olive sage leaves
    ctx.fillRect(st.x - 6, st.y + 2, 2, 2);
    ctx.fillRect(st.x - 2, st.y + 6, 2, 2);
    ctx.fillRect(st.x + st.w, st.y + 4, 2, 2);
    ctx.fillRect(st.x + st.w + 4, st.y + 8, 2, 2);
    ctx.fillStyle = PALETTE[13]; // golden olive leaves
    ctx.fillRect(st.x + 8, st.y + 2, 3, 2);
    ctx.fillRect(st.x + st.w - 11, st.y + 2, 3, 2);

    // Center Stage Medallion / Laurel Crest
    const cx = Math.round(st.x + st.w / 2);
    if (isCompleted) {
      // Golden Laurel Wreath medallion carved on riser
      ctx.fillStyle = PALETTE[15]; // bronze / antique gold
      ctx.fillRect(cx - 8, st.y + 4, 16, 8);
      ctx.fillStyle = PALETTE[10];
      ctx.fillRect(cx - 5, st.y + 6, 10, 4);
      ctx.fillStyle = PALETTE[0]; // gleaming laurel ribbon
      ctx.fillRect(cx - 2, st.y + 11, 4, 2);
    } else if (isCurrent) {
      // Current trial: Glowing radiant laurel wreath with pulsing embers
      const pulse = Math.floor(safeAnim * 8) % 2 === 0;
      ctx.fillStyle = pulse ? PALETTE[0] : PALETTE[15];
      ctx.fillRect(cx - 10, st.y + 3, 20, 10);
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(cx - 6, st.y + 5, 12, 6);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(cx - 2, st.y + 7, 4, 2);
    } else {
      // Locked: Iron lock / chain motif
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(cx - 5, st.y + 5, 10, 6);
      ctx.fillStyle = PALETTE[11];
      ctx.fillRect(cx - 2, st.y + 7, 4, 2);
    }

    // CEREMONIAL PEDESTAL BRAZIERS ON LEFT AND RIGHT BALUSTRADES OF EACH TIER
    const isWon = st.idx < safeTierIdx;
    const isNewlyWon = st.idx === newlyWonTier;
    const isLit = isWon && (!isNewlyWon || safePodiumTimer >= 0.25);

    const bxLeft = st.x - 3;
    const bxRight = st.x + st.w + 1;
    const byTier = st.y - 7;

    [bxLeft, bxRight].forEach((bx) => {
      // Pedestal stand
      ctx.fillStyle = PALETTE[14]; // raw umber wood/stone base
      ctx.fillRect(bx - 1, byTier + 3, 4, 5);
      // Bronze bowl
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(bx - 3, byTier + 1, 8, 3);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(bx - 2, byTier + 1, 6, 1);

      if (isLit) {
        // Blazing pixel flames!
        const flameStep = (Math.floor(safeAnim * 14) + st.idx * 3 + (bx === bxLeft ? 0 : 2)) % 4;
        ctx.fillStyle = PALETTE[3]; // deep crimson
        ctx.fillRect(bx - 2, byTier - 3, 6, 4);
        ctx.fillStyle = PALETTE[2]; // terracotta
        ctx.fillRect(bx - 2, byTier - 5, 5, 3);
        ctx.fillStyle = PALETTE[1]; // sand ochre
        ctx.fillRect(bx - 1, byTier - 6, 4, 3);
        ctx.fillStyle = PALETTE[0]; // white-hot flame core
        ctx.fillRect(bx, byTier - 5, 2, 3);

        const tipX = flameStep === 1 ? -1 : flameStep === 2 ? 1 : 0;
        ctx.fillStyle = flameStep % 2 === 0 ? PALETTE[0] : PALETTE[15];
        ctx.fillRect(bx + tipX, byTier - 8 - (flameStep === 0 ? 1 : 0), 2, 3);
      } else {
        // Cold unlit charcoal embers in bowl
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(bx - 2, byTier, 6, 2);
        ctx.fillStyle = PALETTE[9];
        ctx.fillRect(bx - 1, byTier - 1, 4, 1);
      }
    });
  });

  // FIRE IGNITION FLASH EFFECT OVER THE NEWLY LIT TIER
  if (safeFlashTimer > 0 && newlyWonTier >= 0 && newlyWonTier < stages.length) {
    const targetStage = stages[newlyWonTier];
    const flashProgress = safeFlashTimer / 0.45; // 1 down to 0
    const flashR = Math.round(18 + (1 - flashProgress) * 32);

    ctx.save();
    // Expanding fiery radiance around the tier
    drawDitherShadow(ctx, targetStage.x + targetStage.w / 2, targetStage.y + 4, flashR * 1.6, flashR * 0.9, PALETTE[0]);
    drawDitherShadow(ctx, targetStage.x - 3, targetStage.y - 7, flashR * 0.8, flashR * 0.8, PALETTE[15]);
    drawDitherShadow(ctx, targetStage.x + targetStage.w + 1, targetStage.y - 7, flashR * 0.8, flashR * 0.8, PALETTE[15]);

    // Full-screen golden ceremonial fire flash
    ctx.fillStyle = PALETTE[0];
    ctx.globalAlpha = Math.min(0.35, flashProgress * 0.5);
    ctx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);
    ctx.restore();
  }

  // APEX STAGE 5 TRIUMPHAL STATUE / TROPHY
  const apexX = 172;
  const apexY = 58;
  if (safeTierIdx >= 5) {
    // Grand Coliseum Champion Title Crown: Golden Imperial Eagle standard
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(apexX - 8, apexY - 22, 16, 8);
    ctx.fillRect(apexX - 3, apexY - 26, 6, 6);
    ctx.fillRect(apexX - 1, apexY - 14, 2, 14);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(apexX - 6, apexY - 20, 12, 2);
    ctx.fillStyle = PALETTE[13];
    ctx.fillRect(apexX - 10, apexY - 10, 20, 4);

    // Apex eternal flame braziers
    [-18, 18].forEach((offset) => {
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(apexX + offset - 3, apexY - 14, 6, 4);
      const fs = Math.floor(safeAnim * 12) % 3;
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(apexX + offset - 2, apexY - 17, 4, 3);
      ctx.fillStyle = fs === 0 ? PALETTE[0] : PALETTE[15];
      ctx.fillRect(apexX + offset - 1, apexY - 20, 2, 3);
    });
  } else {
    // Gilded Laurel Trophy awaiting the Champion
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(apexX - 6, apexY - 14, 12, 12);
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(apexX - 3, apexY - 11, 6, 6);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(apexX - 1, apexY - 16, 2, 3);
  }

  // WINNING GLADIATORS AT THE BASE OF THE PEDESTAL
  const glads = Array.isArray(winningGlads) ? winningGlads.filter(Boolean) : [];
  const numGlads = glads.length;
  glads.forEach((glad, i) => {
    if (!glad) return;
    let gx = 172;
    if (numGlads === 1) {
      gx = 172;
    } else if (numGlads === 2) {
      gx = 138 + i * 68;
    } else if (numGlads === 3) {
      gx = 112 + i * 60;
    } else {
      gx = 78 + i * (188 / Math.max(1, numGlads - 1));
    }
    const gy = 177;
    const isFallen = (glad.hp || 0) <= 0;
    const gladFirstName = (glad.name || 'Champion').split(' ')[0].toUpperCase();

    if (isFallen) {
      // Fallen squad member in prone/fallen "body" sprite format at the base of the monument
      drawCulturalGladiator(
        ctx,
        gx,
        gy + 2,
        glad.culture || 'roman',
        'death',
        i % 2 === 1,
        safeAnim,
        0,
        0,
        0,
        glad.level || 1,
        glad.equipped,
        glad.isCavalry,
        glad.isElephant,
        false,
        0,
        false,
        glad.heroType,
        undefined,
        true,
      );

      // Name tag with (FALLEN)
      ctx.font = "bold 6px 'Cinzel', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = PALETTE[3]; // crimson
      ctx.fillText(`${gladFirstName} (FALLEN)`, gx, gy + 10);
    } else {
      // Surviving gladiator standing upright
      drawCulturalGladiator(
        ctx,
        gx,
        gy,
        glad.culture || 'roman',
        'idle',
        i % 2 === 1,
        safeAnim + i * 0.4,
        0,
        0,
        0,
        glad.level || 1,
        glad.equipped,
        glad.isCavalry,
        glad.isElephant,
        false,
        0,
        false,
        glad.heroType,
        undefined,
        false,
      );

      // Victor's Golden Laurel Wreath above head (SURVIVORS ONLY)
      const wreathY = gy - 33;
      ctx.fillStyle = PALETTE[15]; // antique gold
      ctx.fillRect(gx - 5, wreathY, 10, 3);
      ctx.fillRect(gx - 6, wreathY - 2, 3, 3);
      ctx.fillRect(gx + 3, wreathY - 2, 3, 3);
      ctx.fillStyle = PALETTE[0]; // gleaming leaf tips
      ctx.fillRect(gx - 1, wreathY + 1, 2, 2);
      ctx.fillRect(gx - 4, wreathY - 1, 2, 1);
      ctx.fillRect(gx + 2, wreathY - 1, 2, 1);

      // Gladiator Name Tag on courtyard floor
      ctx.font = "bold 6px 'Cinzel', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = PALETTE[5];
      ctx.fillText(gladFirstName, gx + 1, gy + 11);
      ctx.fillStyle = PALETTE[0];
      ctx.fillText(gladFirstName, gx, gy + 10);
    }
  });
}
