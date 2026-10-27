// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {LOGIC_HEIGHT, LOGIC_WIDTH} from '../primitives';

export function drawEyeCutIn(
  ctx: CanvasRenderingContext2D,
  phaseTime: number,
) {
  // Middle 1/3 of screen width
  const boxW = Math.floor(LOGIC_WIDTH / 3); // exactly 114px
  const boxH = 50;
  const boxX = Math.floor((LOGIC_WIDTH - boxW) / 2); // exactly 115px
  const boxY = Math.floor((LOGIC_HEIGHT - boxH) / 2); // 71px

  // Draw thick, low-saturation stone borders (#8C7A6B, #2A1B19)
  ctx.fillStyle = '#2A1B19'; // dark charred outer border
  ctx.fillRect(boxX - 4, boxY - 4, boxW + 8, boxH + 8);
  ctx.fillStyle = '#8C7A6B'; // weathered stone inner border
  ctx.fillRect(boxX - 2, boxY - 2, boxW + 4, boxH + 4);
  ctx.fillStyle = '#2A1B19';
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // CRITICAL: Restricted clipping rect inside box
  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);
  ctx.clip();

  // Solid background inside box
  ctx.fillStyle = '#1D1312';
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Animate procedural "speed lines" rapidly panning left-to-right
  const speed = 360;
  for (let i = 0; i < 18; i++) {
    const lineY = boxY + 3 + i * 2.5;
    const lineW = 10 + ((i * 13) % 28);
    const lineX = boxX + ((i * 29 + phaseTime * speed) % (boxW + 40)) - 20;
    ctx.fillStyle = i % 3 === 0 ? '#ded095' : i % 3 === 1 ? '#ffffff' : '#8C7A6B';
    ctx.fillRect(lineX, lineY, lineW, 1);
  }

  // Draw highly detailed, procedural 16-bit headshot focusing purely on the Emperor's piercing eyes in the center
  const cx = boxX + Math.floor(boxW / 2);
  const cy = boxY + Math.floor(boxH / 2);

  // Forehead shadow & golden laurel leaves on temples
  ctx.fillStyle = '#3f363b';
  ctx.fillRect(cx - 38, cy - 18, 76, 7);
  ctx.fillStyle = '#1D1312';
  ctx.fillRect(cx - 36, cy - 14, 72, 4);

  // Golden laurel wreath leaves flanking temples
  ctx.fillStyle = '#9c8053';
  ctx.fillRect(cx - 38, cy - 16, 8, 3);
  ctx.fillRect(cx + 30, cy - 16, 8, 3);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(cx - 36, cy - 17, 5, 2);
  ctx.fillRect(cx + 32, cy - 17, 5, 2);

  // Heavy, stern furrowed brow lines
  ctx.fillStyle = '#2A1B19';
  ctx.fillRect(cx - 30, cy - 9, 26, 4);
  ctx.fillRect(cx + 4, cy - 9, 26, 4);
  // Center furrow wrinkle
  ctx.fillRect(cx - 2, cy - 12, 4, 6);
  ctx.fillRect(cx - 1, cy - 8, 2, 4);

  // Flesh base around eye zone
  ctx.fillStyle = '#cb9f6b';
  ctx.fillRect(cx - 28, cy - 5, 23, 11);
  ctx.fillRect(cx + 5, cy - 5, 23, 11);

  // Nose bridge ridge between eyes
  ctx.fillStyle = '#ba7654';
  ctx.fillRect(cx - 3, cy - 6, 6, 18);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(cx - 1, cy - 5, 2, 17);

  // Eyes Pupil Shifting:
  // After 1.0 second, animate pupil blocks shifting left, then right:
  // 0.0 - 1.0s: center (0)
  // 1.0 - 1.3s: shift left (-2)
  // 1.3 - 1.6s: shift right (+2)
  // 1.6s+: center (0) with piercing intensity
  let pupilOffset = 0;
  if (phaseTime >= 1.0 && phaseTime < 1.3) {
    pupilOffset = -2;
  } else if (phaseTime >= 1.3 && phaseTime < 1.6) {
    pupilOffset = 2;
  } else if (phaseTime >= 1.6) {
    pupilOffset = 0;
  }

  // Left Eye (cx - 25 to cx - 9)
  const leftEyeX = cx - 24;
  const eyeY = cy - 2;
  // Eye socket outline
  ctx.fillStyle = '#2A1B19';
  ctx.fillRect(leftEyeX - 1, eyeY - 2, 16, 8);
  // White sclera
  ctx.fillStyle = '#ded095';
  ctx.fillRect(leftEyeX, eyeY - 1, 14, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(leftEyeX + 2, eyeY, 10, 4);
  // Iris & Pupil (shifts left/right)
  const leftPupilX = leftEyeX + 5 + pupilOffset;
  ctx.fillStyle = '#574b50';
  ctx.fillRect(leftPupilX, eyeY - 1, 4, 6);
  ctx.fillStyle = '#000000';
  ctx.fillRect(leftPupilX + 1, eyeY, 2, 4);
  // Pupil glint
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(leftPupilX + 1, eyeY, 1, 1);

  // Right Eye (cx + 9 to cx + 25)
  const rightEyeX = cx + 10;
  ctx.fillStyle = '#2A1B19';
  ctx.fillRect(rightEyeX - 1, eyeY - 2, 16, 8);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(rightEyeX, eyeY - 1, 14, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(rightEyeX + 2, eyeY, 10, 4);
  // Iris & Pupil (shifts left/right)
  const rightPupilX = rightEyeX + 5 + pupilOffset;
  ctx.fillStyle = '#574b50';
  ctx.fillRect(rightPupilX, eyeY - 1, 4, 6);
  ctx.fillStyle = '#000000';
  ctx.fillRect(rightPupilX + 1, eyeY, 2, 4);
  // Pupil glint
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(rightPupilX + 1, eyeY, 1, 1);

  // Eye crease shadow & lower eyelids
  ctx.fillStyle = '#ba7654';
  ctx.fillRect(leftEyeX, eyeY + 5, 14, 1);
  ctx.fillRect(rightEyeX, eyeY + 5, 14, 1);
  ctx.fillStyle = '#8C7A6B';
  ctx.fillRect(leftEyeX - 2, eyeY - 3, 18, 1);
  ctx.fillRect(rightEyeX - 2, eyeY - 3, 18, 1);

  ctx.restore();
}
