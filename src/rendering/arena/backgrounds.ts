// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawEmperorBalconySprite, drawEmptyEmperorBalconySprite} from './balcony';
import {drawArenaCrowdStands} from './crowdStands';
import {drawFortifications} from './fortifications';
import {LOGIC_HEIGHT, LOGIC_WIDTH, drawDitherRect} from '../primitives';
import type {ArenaFortification, ArenaMapTheme} from '../../types';

export function drawRomeInFlamesBackground(
  ctx: CanvasRenderingContext2D,
  animTimer: number,
) {
  // 1. Sky & Burning Atmospheric Background (Smoke & fire plumes)
  ctx.fillStyle = '#1D1312';
  ctx.fillRect(0, 0, LOGIC_WIDTH, 52);

  // Gradient fire glow in sky
  drawDitherRect(ctx, 0, 0, LOGIC_WIDTH, 20, '#6d3947', '#9e4a42', 0.5);
  drawDitherRect(ctx, 0, 20, LOGIC_WIDTH, 24, '#9e4a42', '#ba7654', 0.5);

  // Thick rising smoke plumes drifting across the burning sky
  const smokeShift = Math.floor(animTimer * 12) % 40;
  for (let sx = -20; sx < LOGIC_WIDTH + 40; sx += 48) {
    const smX = sx + smokeShift;
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(smX, 6, 26, 18);
    ctx.fillStyle = '#574b50';
    ctx.fillRect(smX + 4, 10, 18, 14);
  }

  // 2. Burning Classic Roman Architecture: Stone Pillars and Semicircular Arches
  ctx.fillStyle = '#574b50';
  ctx.fillRect(0, 36, LOGIC_WIDTH, 26);
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(0, 36, LOGIC_WIDTH, 2);

  // Classic Roman Arches & Columns with flickering flames
  for (let ax = 14; ax < LOGIC_WIDTH - 14; ax += 52) {
    // Arch opening
    ctx.fillStyle = '#2A1B19';
    ctx.fillRect(ax + 6, 22, 28, 40);
    // Arch Trim & Keystone
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(ax + 4, 20, 32, 3);
    ctx.fillRect(ax + 17, 18, 6, 4);

    // Flickering flames licking up the stone pillars and archways
    const fTick = (Math.floor(animTimer * 14) + ax) % 4;
    const flameH = 6 + (fTick % 3) * 3;
    ctx.fillStyle = '#9e4a42';
    ctx.fillRect(ax + 8, 38 - flameH, 8, flameH);
    ctx.fillRect(ax + 24, 38 - flameH, 8, flameH);
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(ax + 10, 36 - flameH, 5, flameH - 1);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(ax + 11, 34 - flameH, 3, flameH - 3);

    // Stone Pillars / Columns flanking arches
    ctx.fillStyle = '#817475';
    ctx.fillRect(ax, 22, 6, 40);
    ctx.fillRect(ax + 34, 22, 6, 40);
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(ax - 1, 20, 8, 3);
    ctx.fillRect(ax + 33, 20, 8, 3);
    ctx.fillRect(ax - 1, 60, 8, 2);
    ctx.fillRect(ax + 33, 60, 8, 2);
  }

  // 3. Reinforced Iron-Banded Gate with Imperial Eagle Banner/Flag
  const gx = 224;
  const gy = 18;
  const gw = 48;
  const gh = 44;

  ctx.fillStyle = '#3f363b';
  ctx.fillRect(gx - 4, gy - 2, gw + 8, gh + 4);
  ctx.fillStyle = '#574b50';
  ctx.fillRect(gx, gy, gw, gh);
  // Iron straps
  ctx.fillStyle = '#1D1312';
  ctx.fillRect(gx, gy + 8, gw, 3);
  ctx.fillRect(gx, gy + 22, gw, 3);
  ctx.fillRect(gx, gy + 36, gw, 3);
  // Diagonal iron braces
  ctx.fillRect(gx + 4, gy + 11, 16, 11);
  ctx.fillRect(gx + 28, gy + 11, 16, 11);
  ctx.fillRect(gx + 4, gy + 25, 16, 11);
  ctx.fillRect(gx + 28, gy + 25, 16, 11);
  // Center seam
  ctx.fillStyle = '#090d16';
  ctx.fillRect(gx + Math.floor(gw / 2) - 1, gy, 2, gh);

  // Imperial Eagle Standard (Aquila) & Fluttering Flag
  const poleX = gx + 54;
  const poleY = gy - 16;
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(poleX, poleY, 2, 58);
  // Golden Aquila
  ctx.fillStyle = '#ded095';
  ctx.fillRect(poleX - 4, poleY - 5, 10, 4);
  ctx.fillRect(poleX - 1, poleY - 8, 4, 4);
  ctx.fillStyle = '#cb9f6b';
  ctx.fillRect(poleX - 5, poleY - 4, 2, 2);
  ctx.fillRect(poleX + 5, poleY - 4, 2, 2);

  // Crimson banner with golden wreath flapping from crossbar
  ctx.fillStyle = '#ded095';
  ctx.fillRect(poleX - 12, poleY + 1, 14, 1);
  const flagFlap = Math.floor(animTimer * 10) % 2 === 0 ? 1 : 0;
  ctx.fillStyle = '#9e4a42';
  ctx.fillRect(poleX - 12, poleY + 2, 12, 18);
  ctx.fillRect(poleX - 11 + flagFlap, poleY + 20, 10, 3);
  ctx.fillStyle = '#ded095';
  ctx.fillRect(poleX - 9, poleY + 6, 6, 6);
  ctx.fillStyle = '#9e4a42';
  ctx.fillRect(poleX - 8, poleY + 7, 4, 4);

  // 4. Scorched Arena Sand / Flagstone Ground
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(0, 60, LOGIC_WIDTH, 6);
  ctx.fillStyle = '#574b50';
  ctx.fillRect(0, 65, LOGIC_WIDTH, 1);

  ctx.fillStyle = '#574b50';
  ctx.fillRect(0, 66, LOGIC_WIDTH, LOGIC_HEIGHT - 66);
  drawDitherRect(ctx, 0, 66, LOGIC_WIDTH, LOGIC_HEIGHT - 66, '#574b50', '#3f363b', 0.5);
  drawDitherRect(ctx, 20, 90, LOGIC_WIDTH - 40, 70, '#574b50', '#7f644b', 0.25);

  // Glowing burning embers on the ground
  for (let i = 0; i < 16; i++) {
    const ex = (i * 23 + 17) % LOGIC_WIDTH;
    const ey = 75 + ((i * 19 + 7) % (LOGIC_HEIGHT - 85));
    const flicker = (Math.floor(animTimer * 16) + i) % 3;
    ctx.fillStyle = flicker === 0 ? '#ded095' : flicker === 1 ? '#ba7654' : '#9e4a42';
    ctx.fillRect(ex, ey, 2, 1);
  }

  // Rising embers and sparks
  for (let i = 0; i < 12; i++) {
    const px = (i * 31 + Math.sin(animTimer * 2 + i) * 15) % LOGIC_WIDTH;
    const py = (LOGIC_HEIGHT - (animTimer * 35 + i * 22) % LOGIC_HEIGHT);
    const pColor = i % 3 === 0 ? '#ded095' : i % 3 === 1 ? '#ba7654' : '#9e4a42';
    ctx.fillStyle = pColor;
    ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
  }
}

export function drawRiverValleyBackground(
  ctx: CanvasRenderingContext2D,
  fortifications?: ArenaFortification[],
  animTimer = 0,
) {
  // Twilight Sky over River Valley
  ctx.fillStyle = '#47505c';
  ctx.fillRect(0, 0, LOGIC_WIDTH, 18);
  drawDitherRect(ctx, 0, 16, LOGIC_WIDTH, 10, '#47505c', '#6d3947', 0.5);
  ctx.fillStyle = '#6d3947';
  ctx.fillRect(0, 24, LOGIC_WIDTH, 12);
  drawDitherRect(ctx, 0, 32, LOGIC_WIDTH, 10, '#6d3947', '#cb9f6b', 0.5);
  ctx.fillStyle = '#cb9f6b';
  ctx.fillRect(0, 40, LOGIC_WIDTH, 8);

  // Distant river bluffs
  ctx.fillStyle = '#3f363b';
  for (let x = 0; x < LOGIC_WIDTH; x += 18) {
    const hillH = 10 + Math.round(Math.sin(x * 0.05) * 5);
    ctx.fillRect(x, 48 - hillH, 18, hillH);
  }
  ctx.fillStyle = '#55796f';
  for (let x = 0; x < LOGIC_WIDTH; x += 12) {
    const ridgeH = 6 + Math.round(Math.cos(x * 0.08) * 3);
    ctx.fillRect(x, 50 - ridgeH, 12, ridgeH);
  }

  // Weeping Willow Trees along upper riverbank
  for (let tx = 14; tx < LOGIC_WIDTH - 14; tx += 48) {
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(tx + 4, 38, 3, 14);
    ctx.fillStyle = '#55796f';
    ctx.fillRect(tx - 2, 28, 15, 10);
    ctx.fillStyle = '#88997a';
    ctx.fillRect(tx, 26, 11, 4);
    const sway = Math.sin(animTimer * 2.5 + tx * 0.2) > 0 ? 1 : 0;
    ctx.fillStyle = '#6f705a';
    ctx.fillRect(tx - 3 + sway, 36, 2, 9);
    ctx.fillRect(tx + 1 + sway, 37, 2, 10);
    ctx.fillRect(tx + 7 + sway, 36, 2, 11);
    ctx.fillRect(tx + 12 + sway, 37, 2, 8);
    ctx.fillStyle = '#88997a';
    ctx.fillRect(tx - 3 + sway, 44, 2, 2);
    ctx.fillRect(tx + 7 + sway, 46, 2, 2);
  }

  ctx.fillStyle = '#7f644b';
  ctx.fillRect(0, 50, LOGIC_WIDTH, 4);

  // Open river valley floor
  ctx.fillStyle = '#7f644b';
  ctx.fillRect(0, 54, LOGIC_WIDTH, LOGIC_HEIGHT - 54);
  drawDitherRect(ctx, 0, 54, LOGIC_WIDTH, LOGIC_HEIGHT - 54, '#7f644b', '#88997a', 0.25);
  drawDitherRect(ctx, 20, 75, LOGIC_WIDTH - 40, LOGIC_HEIGHT - 85, '#7f644b', '#cb9f6b', 0.25);

  // Rushing river water channel
  const rivX = 136;
  const rivW = 54;
  ctx.fillStyle = '#ba7654';
  ctx.fillRect(rivX - 6, 54, 6, LOGIC_HEIGHT - 54);
  ctx.fillRect(rivX + rivW, 54, 6, LOGIC_HEIGHT - 54);
  ctx.fillStyle = '#47505c';
  ctx.fillRect(rivX, 54, rivW, LOGIC_HEIGHT - 54);
  ctx.fillStyle = '#55796f';
  for (let ry = 54; ry < LOGIC_HEIGHT; ry += 6) {
    const wave = Math.sin(animTimer * 6 + ry * 0.4) * 4;
    ctx.fillRect(rivX + 2 + wave, ry, rivW - 4, 3);
  }
  const foam = Math.floor(animTimer * 10);
  ctx.fillStyle = '#ded095';
  for (let fy = 58; fy < LOGIC_HEIGHT - 6; fy += 14) {
    const fx = rivX + 4 + ((fy * 17 + foam * 6) % (rivW - 12));
    ctx.fillRect(fx, fy, 5, 1);
    ctx.fillRect(fx + 1, fy - 1, 3, 1);
  }

  if (fortifications && fortifications.length > 0) {
    drawFortifications(ctx, fortifications, animTimer);
  }
}

export function drawAlpineRampartBackground(
  ctx: CanvasRenderingContext2D,
  fortifications?: ArenaFortification[],
  animTimer = 0,
) {
  // Cold Mountain Sky
  ctx.fillStyle = '#47505c';
  ctx.fillRect(0, 0, LOGIC_WIDTH, 22);
  drawDitherRect(ctx, 0, 18, LOGIC_WIDTH, 14, '#47505c', '#817475', 0.5);
  ctx.fillStyle = '#817475';
  ctx.fillRect(0, 30, LOGIC_WIDTH, 18);

  // Snowy mountain crags
  for (let cx = -10; cx < LOGIC_WIDTH + 20; cx += 36) {
    const cragH = 26 + Math.round(Math.sin(cx * 0.12) * 8);
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(cx, 48 - cragH, 36, cragH);
    ctx.fillStyle = '#574b50';
    ctx.fillRect(cx + 6, 48 - cragH + 4, 24, cragH - 4);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(cx + 10, 48 - cragH, 16, 6);
    ctx.fillRect(cx + 14, 48 - cragH - 3, 8, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 12, 48 - cragH, 12, 3);
    ctx.fillRect(cx + 15, 48 - cragH - 2, 6, 2);
  }

  // Drifting cold mist / mountain fog
  const fogShift = Math.floor(animTimer * 10) % 60;
  for (let fx = -40; fx < LOGIC_WIDTH + 60; fx += 55) {
    ctx.fillStyle = 'rgba(215, 225, 235, 0.28)';
    ctx.fillRect(fx + fogShift, 24, 44, 7);
    ctx.fillRect(fx + fogShift + 6, 28, 32, 5);
  }

  // Snowy Pine & Fir Trees
  for (let px = 8; px < LOGIC_WIDTH - 8; px += 26) {
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(px + 4, 40, 2, 10);
    ctx.fillStyle = '#55796f';
    ctx.fillRect(px, 34, 10, 8);
    ctx.fillRect(px + 2, 28, 6, 7);
    ctx.fillRect(px + 3, 24, 4, 5);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(px, 34, 10, 2);
    ctx.fillRect(px + 2, 28, 6, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 3, 23, 4, 2);
  }

  ctx.fillStyle = '#817475';
  ctx.fillRect(0, 48, LOGIC_WIDTH, 4);

  // Frost-covered stone rampart pavers & snow
  ctx.fillStyle = '#817475';
  ctx.fillRect(0, 52, LOGIC_WIDTH, LOGIC_HEIGHT - 52);
  drawDitherRect(ctx, 0, 52, LOGIC_WIDTH, LOGIC_HEIGHT - 52, '#817475', '#574b50', 0.5);

  ctx.fillStyle = '#3f363b';
  for (let ry = 62; ry < LOGIC_HEIGHT; ry += 14) {
    ctx.fillRect(0, ry, LOGIC_WIDTH, 1);
    for (let rx = 12; rx < LOGIC_WIDTH; rx += 28) {
      const stag = (ry / 14) % 2 === 0 ? 0 : 14;
      ctx.fillRect(rx + stag, ry, 1, 14);
    }
  }

  // Snow dusting patches
  ctx.fillStyle = '#ded095';
  for (let i = 0; i < 18; i++) {
    const sx = (i * 29 + 17) % (LOGIC_WIDTH - 20);
    const sy = 60 + ((i * 23 + 11) % (LOGIC_HEIGHT - 70));
    ctx.fillRect(sx, sy, 8, 2);
    ctx.fillRect(sx + 2, sy - 1, 4, 1);
  }

  if (fortifications && fortifications.length > 0) {
    drawFortifications(ctx, fortifications, animTimer);
  }
}

export function drawCleanArenaBackground(
  ctx: CanvasRenderingContext2D,
  emperorPosture: 'standing' | 'thumbs_up' | 'thumbs_down' = 'standing',
  isEmptyBalcony = false,
  mapTheme: ArenaMapTheme = 'standard',
  fortifications?: ArenaFortification[],
  animTimer = 0,
  crowdTier: 1 | 2 | 3 | 4 | 5 = 1,
) {
  // Render Dynamic Visual Crowd Tier (Tiers 1 to 5)
  drawArenaCrowdStands(ctx, crowdTier, animTimer, mapTheme);
  for (let px = 6; px < LOGIC_WIDTH - 6; px += 22) {
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(px, 16, 8, 18);
    ctx.fillStyle = PALETTE[7];
    ctx.fillRect(px + 1, 18, 6, 14);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(px + 2, 14, 4, 3);
    ctx.fillRect(px + 3, 12, 2, 2);
  }

  // Imperial Balcony in Center
  ctx.fillStyle = PALETTE[4];
  ctx.fillRect(146, 12, 52, 24);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(146, 12, 52, 4);

  if (isEmptyBalcony) {
    drawEmptyEmperorBalconySprite(ctx, 172, 24);
  } else {
    drawEmperorBalconySprite(ctx, 172, 24, emperorPosture);
  }

  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(148, 22, 2, 14);
  ctx.fillRect(164, 22, 2, 14);
  ctx.fillRect(180, 22, 2, 14);
  ctx.fillRect(196, 22, 2, 14);
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(146, 23, 52, 2);

  // Wall perimeter barrier
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 48, LOGIC_WIDTH, 12);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 48, LOGIC_WIDTH, 2);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 59, LOGIC_WIDTH, 1);

  // Golden Sand Pit Arena Floor
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(0, 60, LOGIC_WIDTH, LOGIC_HEIGHT - 60);

  if (mapTheme === 'standard') {
    ctx.strokeStyle = PALETTE[14];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(LOGIC_WIDTH / 2, 130, 96, 38, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawDitherRect(ctx, 36, 95, LOGIC_WIDTH - 72, 68, PALETTE[1], PALETTE[0], 0.25);
  }

  if (fortifications && fortifications.length > 0) {
    drawFortifications(ctx, fortifications, animTimer);
  }
}
