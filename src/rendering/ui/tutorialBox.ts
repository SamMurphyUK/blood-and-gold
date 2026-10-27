// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawManagerVnPortrait} from '../cinematicIntro';
import {LOGIC_HEIGHT, LOGIC_WIDTH} from '../primitives';

// ============================================================================
// TUTORIAL ENGINE TYPES, STRINGS & MANAGER DIALOGUE RENDERER
// ============================================================================

export function drawManagerTutorialBox(
  ctx: CanvasRenderingContext2D,
  title: string,
  text: string,
  charCount: number,
  isLineDone: boolean,
  elapsed: number,
) {
  if (!text) return;
  const safeCharCount = Math.max(0, Math.min(text.length, charCount || 0));
  const safeElapsed = Math.max(0, elapsed || 0);

  const boxX = 14;
  const boxW = LOGIC_WIDTH - 28;
  const boxH = 58;
  const currentBoxY = LOGIC_HEIGHT - boxH - 8;

  // Box Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(boxX - 2, currentBoxY - 2, boxW + 4, boxH + 4);

  // Outer Stone Frame (#8C7A6B weathered stone beveled border)
  ctx.fillStyle = '#8C7A6B';
  ctx.fillRect(boxX, currentBoxY, boxW, boxH);

  // Inner Dark Antiquity Panel (#2A1B19)
  ctx.fillStyle = '#2A1B19';
  ctx.fillRect(boxX + 3, currentBoxY + 3, boxW - 6, boxH - 6);

  // Dual Fillet Trim Borders
  ctx.strokeStyle = '#3f363b';
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX + 2.5, currentBoxY + 2.5, boxW - 5, boxH - 5);
  ctx.strokeStyle = PALETTE[15];
  ctx.strokeRect(boxX + 4.5, currentBoxY + 4.5, boxW - 9, boxH - 9);

  // Corner Studs
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(boxX + 5, currentBoxY + 5, 2, 2);
  ctx.fillRect(boxX + boxW - 7, currentBoxY + 5, 2, 2);
  ctx.fillRect(boxX + 5, currentBoxY + boxH - 7, 2, 2);
  ctx.fillRect(boxX + boxW - 7, currentBoxY + boxH - 7, 2, 2);

  // 16-bit Manager Portrait in Left Corner
  drawManagerVnPortrait(ctx, boxX + 7, currentBoxY + 8);

  const textX = boxX + 50;
  const maxW = boxW - 58;

  // Speaker Ribbon: Red highlight extends cleanly across to match the margin end of the smaller pixelated text
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(boxX + 50, currentBoxY + 8, maxW, 11);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(boxX + 50, currentBoxY + 18, maxW, 1);

  ctx.font = "bold 8px 'Cinzel', Georgia, serif";
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE[0];
  ctx.fillText(title || 'LANISTA AULUS', boxX + 54, currentBoxY + 16);

  // Typewriter Text
  const visible = text.slice(0, safeCharCount);
  ctx.font = "italic 9px Georgia, 'Cinzel', serif";
  const words = visible.split(' ');
  const lines: string[] = [];
  let curLine = '';

  for (const word of words) {
    const testLine = curLine ? `${curLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxW && curLine) {
      lines.push(curLine);
      curLine = word;
    } else {
      curLine = testLine;
    }
  }
  if (curLine) lines.push(curLine);

  lines.forEach((line, idx) => {
    ctx.fillStyle = '#090d16';
    ctx.fillText(line, textX + 1, currentBoxY + 28 + idx * 11);
    ctx.fillStyle = PALETTE[0];
    ctx.fillText(line, textX, currentBoxY + 27 + idx * 11);
  });

  // Cursor while typing
  if (!isLineDone && Math.floor(safeElapsed * 12) % 2 === 0) {
    const lastIdx = lines.length - 1;
    const lastW = lastIdx >= 0 ? ctx.measureText(lines[lastIdx]).width : 0;
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(textX + lastW + 2, currentBoxY + 20 + Math.max(0, lastIdx) * 11, 3, 7);
  }

  // Indicator when ready
  if (isLineDone && Math.sin(safeElapsed * 7) > -0.2) {
    ctx.font = "bold 8px 'Cinzel', Georgia, serif";
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE[0];
    ctx.fillText('▼ PRESS SPACE / A TO ADVANCE', boxX + boxW - 8, currentBoxY + boxH - 5);
  }
}
