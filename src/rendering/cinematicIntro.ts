// Gladiator Manager - 16-Bit Cinematic Intro Sequence Engine
// Strictly uses the 16-color antiquity palette, procedural pixel dithering,
// 4x virtual pixel scaling, minimalist blocky fillRect sprites, and smooth camera panning.
// tslint:disable
/* eslint-disable */

import {PALETTE, PaletteColor} from '../../constants';
import {drawAulusPortrait} from './portraits';

export const INTRO_MONOLOGUE_TEXT =
  'I must take this ludus to the finals of the Grand Colosseum... but look at my first recruit. He looks absolutely terrible.';

// Procedural dithering helper for the cinematic engine
function ditherFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c1: PaletteColor | string,
  c2: PaletteColor | string,
  density: 0.25 | 0.5 | 0.75 = 0.5,
) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iw = Math.floor(w);
  const ih = Math.floor(h);

  ctx.fillStyle = c1;
  ctx.fillRect(ix, iy, iw, ih);

  ctx.fillStyle = c2;
  for (let py = iy; py < iy + ih; py++) {
    for (let px = ix; px < ix + iw; px++) {
      let draw = false;
      if (density === 0.5) {
        draw = (px + py) % 2 === 0;
      } else if (density === 0.25) {
        draw = px % 2 === 0 && py % 2 === 0;
      } else if (density === 0.75) {
        draw = px % 2 === 0 || py % 2 === 0;
      }
      if (draw) {
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
}

// Draw minimalist blocky Roman column using stacked rectangles
export function drawPixelColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  width = 16,
) {
  const halfW = Math.floor(width / 2);
  const colX = Math.floor(x);
  const baseY = Math.floor(y);

  // 1. Plinth / Stepped Pedestal Base
  ctx.fillStyle = PALETTE[5]; // dark iron shadow
  ctx.fillRect(colX - halfW - 4, baseY + height - 2, width + 8, 4);
  ctx.fillStyle = PALETTE[9]; // dark taupe
  ctx.fillRect(colX - halfW - 3, baseY + height - 6, width + 6, 4);
  ctx.fillStyle = PALETTE[10]; // stone gray
  ctx.fillRect(colX - halfW - 2, baseY + height - 9, width + 4, 3);
  ctx.fillStyle = PALETTE[11]; // highlight edge
  ctx.fillRect(colX - halfW - 2, baseY + height - 9, width + 4, 1);

  // 2. Fluted Column Shaft
  const shaftTop = baseY + 12;
  const shaftHeight = height - 21;
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(colX - halfW, shaftTop, width, shaftHeight);

  // Highlight on left edge
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(colX - halfW, shaftTop, 2, shaftHeight);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(colX - halfW + 1, shaftTop, 1, shaftHeight);

  // Fluting vertical grooves
  ctx.fillStyle = PALETTE[5];
  for (let fx = colX - halfW + 4; fx < colX + halfW - 2; fx += 4) {
    ctx.fillRect(fx, shaftTop, 1, shaftHeight);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(fx + 1, shaftTop, 1, shaftHeight);
    ctx.fillStyle = PALETTE[5];
  }

  // Shadow on right edge
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(colX + halfW - 2, shaftTop, 2, shaftHeight);

  // 3. Corinthian / Ionic Capital with stepped abacus & volutes
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(colX - halfW - 3, baseY, width + 6, 3);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(colX - halfW - 3, baseY, width + 6, 1);

  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(colX - halfW - 2, baseY + 3, width + 4, 4);
  ctx.fillStyle = PALETTE[15]; // bronze/gold rosette trim
  ctx.fillRect(colX - 2, baseY + 4, 4, 2);

  // Scroll volutes
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(colX - halfW - 3, baseY + 4, 3, 4);
  ctx.fillRect(colX + halfW, baseY + 4, 3, 4);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(colX - halfW - 2, baseY + 5, 1, 2);
  ctx.fillRect(colX + halfW + 1, baseY + 5, 1, 2);

  // Necking ring
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(colX - halfW - 1, baseY + 7, width + 2, 3);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(colX - halfW, baseY + 10, width, 2);
}

// Draw stylized, abstract block-art representation of the elderly manager in a toga
export function drawBlockyManagerFigure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  animTime: number,
) {
  const bx = Math.floor(x);
  const by = Math.floor(y);

  // Subtle natural breathing bob
  const breathY = Math.sin(animTime * 2.2) * 0.8;

  // Ground shadow
  ctx.fillStyle = PALETTE[5];
  for (let sy = by + 2; sy <= by + 4; sy++) {
    const sw = 18 - (sy - (by + 2)) * 4;
    ctx.fillRect(bx - sw / 2 + 1, sy, sw, 1);
  }

  // Sandals / Feet
  ctx.fillStyle = PALETTE[14]; // raw umber
  ctx.fillRect(bx - 4, by + 1, 4, 2);
  ctx.fillRect(bx + 2, by + 1, 4, 2);

  // Flowing Toga Body (stacked minimalist rectangles)
  // Main ivory/parchment toga body
  ctx.fillStyle = PALETTE[0]; // pale parchment yellow
  ctx.fillRect(bx - 7, by - 26 + breathY, 15, 27);

  // Shading folds along bottom & left
  ctx.fillStyle = PALETTE[1]; // sand ochre fold shading
  ctx.fillRect(bx - 7, by - 12 + breathY, 5, 13);
  ctx.fillRect(bx - 2, by - 8 + breathY, 3, 9);
  ctx.fillStyle = PALETTE[14]; // deep fold accents
  ctx.fillRect(bx - 7, by - 2 + breathY, 3, 3);
  ctx.fillRect(bx - 1, by + breathY, 2, 1);

  // Terracotta & crimson patrician clavus / sash draped over right shoulder
  ctx.fillStyle = PALETTE[2]; // terracotta clay
  ctx.fillRect(bx - 1, by - 26 + breathY, 6, 22);
  ctx.fillStyle = PALETTE[3]; // deep roman crimson border
  ctx.fillRect(bx + 3, by - 26 + breathY, 2, 22);
  ctx.fillStyle = PALETTE[15]; // bronze brooch clasp at shoulder
  ctx.fillRect(bx + 2, by - 24 + breathY, 3, 3);

  // Weathered arm extended towards balustrade
  ctx.fillStyle = PALETTE[1]; // tan skin
  ctx.fillRect(bx + 7, by - 20 + breathY, 6, 3);
  ctx.fillRect(bx + 11, by - 18 + breathY, 4, 2);
  // Wax tablet held in hand
  ctx.fillStyle = PALETTE[14]; // wood frame
  ctx.fillRect(bx + 13, by - 22 + breathY, 4, 7);
  ctx.fillStyle = PALETTE[0]; // wax writing surface
  ctx.fillRect(bx + 14, by - 21 + breathY, 2, 5);

  // Head & weathered patrician profile
  ctx.fillStyle = PALETTE[1]; // weathered tan face
  ctx.fillRect(bx - 3, by - 36 + breathY, 8, 10);
  ctx.fillRect(bx + 5, by - 33 + breathY, 3, 4); // nose profile looking right

  // Dark bronze-brown curls with golden laurel crown
  ctx.fillStyle = PALETTE[14]; // dark bronze-brown curls
  ctx.fillRect(bx - 5, by - 38 + breathY, 8, 4); // crown hair
  ctx.fillRect(bx - 6, by - 35 + breathY, 3, 7); // back of head
  ctx.fillRect(bx + 2, by - 29 + breathY, 5, 3); // trim beard
  ctx.fillStyle = PALETTE[15]; // bronze laurel band
  ctx.fillRect(bx - 4, by - 37 + breathY, 7, 2);
  ctx.fillStyle = PALETTE[0]; // golden laurel leaves glint
  ctx.fillRect(bx - 2, by - 38 + breathY, 4, 1);

  // Contemplative eye slit gazing right toward off-screen Colosseum
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(bx + 3, by - 33 + breathY, 2, 1);
  // Furrowed brow
  ctx.fillStyle = PALETTE[2];
  ctx.fillRect(bx + 2, by - 35 + breathY, 3, 1);
}

// 16-bit blocky portrait of the elderly manager for the Visual Novel box
export function drawManagerVnPortrait(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
) {
  // Portrait frame background
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(px, py, 38, 42);

  // Flat solid background inside frame (#1b1216, zero dithering)
  ctx.fillStyle = '#1b1216';
  ctx.fillRect(px + 2, py + 2, 34, 38);

  // Consistent 32x32 Lanista Aulus Headshot Profile (crimson sash, laurel crown, sharp weathered profile)
  drawAulusPortrait(ctx, px + 3, py + 5, 32);

  // Gold frame border
  ctx.strokeStyle = PALETTE[15];
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, 37, 41);
  ctx.strokeStyle = PALETTE[0];
  ctx.strokeRect(px + 1.5, py + 1.5, 35, 39);
}

// ============================================================================
// PHASE 1: THE MANAGER (Elderly Lanista on Terrace gazing into the distance)
// ============================================================================
export function renderPhase1(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsed: number,
) {
  // Fade in during first 0.5s, hold, then fade out during last 0.6s (total 3.2s)
  let alpha = 1.0;
  if (elapsed < 0.5) {
    alpha = Math.max(0, elapsed / 0.5);
  } else if (elapsed > 2.6) {
    alpha = Math.max(0, 1 - (elapsed - 2.6) / 0.6);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // 1. Dawn / Dusk Sky Gradient across Rome
  ctx.fillStyle = PALETTE[4]; // wine / burgundy
  ctx.fillRect(0, 0, w, 28);
  ditherFill(ctx, 0, 28, w, 20, PALETTE[4], PALETTE[3], 0.5);
  ctx.fillStyle = PALETTE[3]; // crimson rust
  ctx.fillRect(0, 48, w, 22);
  ditherFill(ctx, 0, 70, w, 22, PALETTE[3], PALETTE[2], 0.5);
  ctx.fillStyle = PALETTE[2]; // terracotta
  ctx.fillRect(0, 92, w, 18);
  ditherFill(ctx, 0, 110, w, 16, PALETTE[2], PALETTE[1], 0.5);

  // Soft morning dawn glow on the right horizon
  ctx.fillStyle = PALETTE[0]; // pale gold sun crest
  ctx.fillRect(260, 100, 48, 14);
  ditherFill(ctx, 240, 94, 88, 22, PALETTE[1], PALETTE[0], 0.25);

  // 2. Distant Roman Cityscape & Coliseum Silhouette on the Horizon
  ctx.fillStyle = PALETTE[5]; // dark iron
  // Distant aqueduct arches on left
  for (let ax = 0; ax < 90; ax += 18) {
    ctx.fillRect(ax, 106, 14, 20);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(ax + 3, 112, 8, 14);
    ctx.fillStyle = PALETTE[5];
  }
  // Colosseum silhouette in middle distance (off to the right)
  ctx.fillRect(190, 86, 120, 40);
  for (let cx = 196; cx < 304; cx += 12) {
    // Arch cutouts in colosseum
    ctx.fillStyle = PALETTE[2];
    ctx.fillRect(cx, 92, 7, 10);
    ctx.fillRect(cx, 106, 7, 12);
    ctx.fillStyle = PALETTE[5];
  }
  // Sloping colosseum outer wall
  ctx.fillRect(182, 98, 8, 28);
  ctx.fillRect(310, 98, 8, 28);

  // Distant umbrella pines (stone pines)
  const pineX = [85, 110, 160, 175];
  pineX.forEach((px) => {
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(px + 4, 108, 2, 16);
    ctx.fillStyle = PALETTE[12]; // mossy olive canopy
    ctx.fillRect(px, 102, 10, 7);
    ctx.fillRect(px + 2, 99, 6, 4);
  });

  // 3. Villa Balcony & Stone Terrace Foreground (Y = 126 to 192)
  // Stone Balustrade Wall
  ctx.fillStyle = PALETTE[10]; // weathered stone gray
  ctx.fillRect(0, 126, w, 24);
  ctx.fillStyle = PALETTE[11]; // coping stone top edge
  ctx.fillRect(0, 124, w, 3);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 124, w, 1);

  // Balustrade decorative pillars
  for (let bx = 16; bx < w; bx += 24) {
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(bx - 3, 129, 6, 18);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(bx - 2, 129, 4, 18);
  }

  // Terrace flagstones floor (Y = 150 to 192)
  ctx.fillStyle = PALETTE[9]; // dark charcoal mauve flagstone
  ctx.fillRect(0, 150, w, h - 150);
  ctx.fillStyle = PALETTE[5];
  // Flagstone mortar lines
  for (let fy = 158; fy < h; fy += 12) {
    ctx.fillRect(0, fy, w, 1);
  }
  for (let fx = 12; fx < w; fx += 28) {
    for (let fy = 150; fy < h; fy += 12) {
      const stagger = (fy / 12) % 2 === 0 ? 0 : 14;
      ctx.fillRect(fx + stagger, fy, 1, 12);
    }
  }

  // Left Roman arch framing pillar
  drawPixelColumn(ctx, 24, 0, 165, 20);

  // 4. Abstract block-art representation of the elderly manager in toga
  drawBlockyManagerFigure(ctx, 148, 162, elapsed);

  // Subtitle / atmospheric prompt: Roman Antiquity Prelude
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE[0];
  ctx.fillText('• PROLOGUE: THE LANISTA •', w / 2, 18);

  ctx.restore();
}

// 16-bit celestial star flash effect in the pastel skybox
export function drawCelestialStarFlash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
) {
  const t = Math.max(0, Math.min(1, progress));
  const intensity = Math.sin(t * Math.PI);
  if (intensity <= 0.01) return;

  ctx.save();
  ctx.globalAlpha *= intensity;

  const coreRadius = Math.max(1, Math.round(1 + intensity * 3));
  const rayLength = Math.max(3, Math.round(3 + intensity * 12));

  // 1. Warm outer glow
  ctx.fillStyle = PALETTE[2];
  ctx.fillRect(cx - coreRadius - 2, cy - 1, (coreRadius + 2) * 2 + 1, 3);
  ctx.fillRect(cx - 1, cy - coreRadius - 2, 3, (coreRadius + 2) * 2 + 1);

  // 2. Antique gold corona
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - coreRadius, cy - coreRadius, coreRadius * 2 + 1, coreRadius * 2 + 1);

  // 3. Cardinal cross rays
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cx - rayLength, cy, rayLength * 2 + 1, 1);
  ctx.fillRect(cx, cy - rayLength, 1, rayLength * 2 + 1);

  // Diagonal glints
  const diag = Math.max(1, Math.round(rayLength * 0.4));
  ctx.fillStyle = PALETTE[1];
  for (let d = -diag; d <= diag; d++) {
    if (d !== 0) {
      ctx.fillRect(cx + d, cy + d, 1, 1);
      ctx.fillRect(cx + d, cy - d, 1, 1);
    }
  }

  // 4. White-hot center glint
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 1, cy - 1, 3, 3);

  ctx.restore();
}

// ============================================================================
// PHASE 2 & 3: THE APPROACH & THE PAN-UP
// Tall vertical scene with negative Y coordinates, sliding gladiator actors,
// followed by smooth camera pan revealing coliseum balcony, ruler, and sun.
// ============================================================================
export function renderPhase2And3(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsed: number,
) {
  const safeElapsed = Math.max(0, isNaN(elapsed) ? 0 : elapsed);
  // Fade in at start (0.0 to 0.5s)
  const fadeIn = Math.max(0, Math.min(1, safeElapsed / 0.5));

  ctx.save();
  ctx.globalAlpha = fadeIn;

  // Timeline for actor approach vs camera pan:
  // t = 0.0s to 2.2s: Actors slide horizontally toward each other at bottom
  // t = 2.2s to 6.8s: Camera pans upward from cameraY = 0 to 280 (decelerating)
  let cameraY = 0;
  const panStart = 2.2;
  const panDuration = 4.6;
  const maxPanDistance = 280;

  if (safeElapsed > panStart) {
    const panProgress = Math.min(1, (safeElapsed - panStart) / panDuration);
    // Smooth deceleration curve (cubic ease-out)
    const eased = 1 - Math.pow(1 - panProgress, 2.6);
    cameraY = eased * maxPanDistance;
  }

  // Apply Camera Pan translation:
  // When cameraY > 0, virtual negative coordinates shift downward into view!
  ctx.save();
  ctx.translate(0, Math.round(cameraY));

  // --------------------------------------------------------------------------
  // VIRTUAL TALL SCENE RENDERING:
  // Y = -300 to -170: Pure Deep Darkness (#3f363b / #1a1921)
  // Y = -170 to -60:  Pastel Sky with 16-bit blocky warm sun (#ded095)
  // Y = -60 to 20:    Coliseum Balcony with Emperor / Ruler figure
  // Y = 20 to 110:    Coliseum spectator stands & stone perimeter walls
  // Y = 110 to 192:   Golden Sand Pit Arena Floor with 2 approaching gladiators
  // --------------------------------------------------------------------------

  // 1. Deep Darkness Void (Y = -340 to -180)
  ctx.fillStyle = '#1a1921'; // pure deep night darkness
  ctx.fillRect(0, -340, w, 170);
  ditherFill(ctx, 0, -180, w, 24, '#1a1921', PALETTE[5], 0.5);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, -156, w, 20);

  // 2. Pastel Dawn Sky (Y = -150 to -50)
  ditherFill(ctx, 0, -136, w, 22, PALETTE[5], PALETTE[4], 0.5);
  ctx.fillStyle = PALETTE[4]; // wine
  ctx.fillRect(0, -114, w, 18);
  ditherFill(ctx, 0, -96, w, 20, PALETTE[4], PALETTE[3], 0.5);
  ctx.fillStyle = PALETTE[3]; // crimson
  ctx.fillRect(0, -76, w, 16);
  ditherFill(ctx, 0, -60, w, 18, PALETTE[3], PALETTE[2], 0.5);
  ctx.fillStyle = PALETTE[2]; // terracotta
  ctx.fillRect(0, -42, w, 20);

  // 16-bit Blocky Warm Sun in the Pastel Sky at X = 172, Y = -118
  const sunX = 172;
  const sunY = -112;
  // Outer warm aura
  ctx.fillStyle = PALETTE[2];
  ctx.fillRect(sunX - 22, sunY - 22, 44, 44);
  // Outer square disc in sand ochre
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(sunX - 16, sunY - 16, 32, 32);
  ditherFill(ctx, sunX - 22, sunY - 22, 44, 44, PALETTE[2], PALETTE[1], 0.25);
  // Golden ring
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(sunX - 12, sunY - 12, 24, 24);
  // Core brilliant warm sun in pale parchment yellow (#ded095)
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(sunX - 8, sunY - 8, 16, 16);
  // Blocky cardinal solar rays
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(sunX - 26, sunY - 2, 52, 4);
  ctx.fillRect(sunX - 2, sunY - 26, 4, 52);
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(sunX - 32, sunY - 1, 64, 2);
  ctx.fillRect(sunX - 1, sunY - 32, 2, 64);

  // Silhouette of Coliseum Upper Tier Cornices (Y = -70 to -40)
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, -50, w, 24);
  for (let ax = 12; ax < w; ax += 22) {
    ctx.fillStyle = PALETTE[2]; // warm morning sky glowing through top arches
    ctx.fillRect(ax, -44, 11, 14);
    ctx.fillStyle = PALETTE[5];
  }

  // 3. Ornate Coliseum Imperial Balcony (Y = -34 to 12)
  // Balcony corbel stone brackets
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(116, -2, 112, 14);
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(120, -6, 104, 6);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(122, -6, 100, 2);

  // Hanging imperial crimson drapery with gold embroidery
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(124, 0, 96, 14);
  ctx.fillStyle = PALETTE[15]; // gold fringe
  ctx.fillRect(124, 12, 96, 2);
  for (let dx = 128; dx < 220; dx += 14) {
    ctx.fillRect(dx, 4, 6, 6);
  }

  // Balustrade rail in front of balcony
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(120, -18, 104, 4);
  ctx.fillStyle = PALETTE[0]; // gold rail highlights
  ctx.fillRect(120, -19, 104, 1);

  // Blocky Ruler Figure standing on balcony center (X = 172, Y = -16)
  // Purple/burgundy imperial toga
  ctx.fillStyle = PALETTE[4]; // royal wine / burgundy
  ctx.fillRect(166, -34, 12, 16);
  ctx.fillStyle = PALETTE[0]; // gold sash
  ctx.fillRect(169, -34, 4, 16);
  // Head
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(168, -42, 8, 8);
  // Golden Laurel Crown (#ded095)
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(166, -44, 12, 3);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(167, -42, 2, 2);
  ctx.fillRect(175, -42, 2, 2);

  // Flanking Praetorian Guards on balcony
  // Left Guard (X = 142)
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(138, -34, 8, 16);
  ctx.fillStyle = PALETTE[15]; // bronze helmet
  ctx.fillRect(139, -42, 6, 7);
  ctx.fillStyle = PALETTE[3];  // red plume
  ctx.fillRect(140, -45, 4, 3);
  // Spear
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(134, -54, 2, 36);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(133, -58, 4, 5);

  // Right Guard (X = 202)
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(198, -34, 8, 16);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(199, -42, 6, 7);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(200, -45, 4, 3);
  // Spear
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(208, -54, 2, 36);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(207, -58, 4, 5);

  // 4. Middle Spectator Bleachers & Stone Walls (Y = 12 to 110)
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 12, w, 68);
  for (let ty = 18; ty < 76; ty += 10) {
    ctx.fillStyle = PALETTE[6];
    ctx.fillRect(0, ty, w, 2);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(0, ty + 2, w, 8);
  }
  // Arena spectator crowd silhouette textures
  ditherFill(ctx, 0, 24, w, 44, PALETTE[5], PALETTE[9], 0.5);

  // Lower Stone Barrier Wall (Y = 80 to 110)
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 80, w, 30);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 80, w, 3);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 109, w, 1);

  // 5. Golden Arena Sand Pit (Y = 110 to 192)
  ctx.fillStyle = PALETTE[1]; // sand ochre
  ctx.fillRect(0, 110, w, h - 110);
  ditherFill(ctx, 0, 110, w, 14, PALETTE[1], PALETTE[2], 0.25);
  ditherFill(ctx, 30, 134, w - 60, 48, PALETTE[1], PALETTE[0], 0.25);

  // 6. Minimalist Blocky Actor Sprites sliding horizontally toward each other
  // Gladiator 1 (Left Actor): slides from X = 48 towards X = 152
  // Gladiator 2 (Right Actor): slides from X = 296 towards X = 192
  const slideProgress = Math.min(1, elapsed / 2.2);
  const glad1X = Math.round(48 + slideProgress * 104);  // ends at 152
  const glad2X = Math.round(296 - slideProgress * 104); // ends at 192
  const gladY = 158;

  const stepAnim = Math.sin(elapsed * 14) * 2;

  // Actor 1 (Left: Roman Murmillo in bronze helmet & scutum)
  // Shadow
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(glad1X - 7, gladY + 1, 14, 2);

  // Legs stepping forward
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(glad1X - 3 - Math.round(stepAnim), gladY - 8, 3, 9);
  ctx.fillRect(glad1X + 1 + Math.round(stepAnim), gladY - 8, 3, 9);

  // Torso (lorica iron & bronze)
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(glad1X - 4, gladY - 18, 9, 10);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(glad1X - 4, gladY - 15, 9, 2);

  // Crested Bronze Helmet
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(glad1X - 3, gladY - 26, 7, 8);
  ctx.fillStyle = PALETTE[3]; // crimson crest
  ctx.fillRect(glad1X - 2, gladY - 30, 6, 4);

  // Sword extended forward
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(glad1X + 4, gladY - 14, 11, 2);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(glad1X + 15, gladY - 14, 2, 2);

  // Shield on left arm
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(glad1X - 6, gladY - 18, 3, 14);

  // Actor 2 (Right: Opponent Champion in round shield & spatha)
  // Shadow
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(glad2X - 7, gladY + 1, 14, 2);

  // Legs stepping forward
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(glad2X - 3 + Math.round(stepAnim), gladY - 8, 3, 9);
  ctx.fillRect(glad2X + 1 - Math.round(stepAnim), gladY - 8, 3, 9);

  // Torso
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(glad2X - 5, gladY - 18, 9, 10);
  ctx.fillStyle = PALETTE[7]; // woad markings / verdigris
  ctx.fillRect(glad2X - 4, gladY - 15, 7, 3);

  // Golden / Bronze Helmet
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(glad2X - 4, gladY - 26, 7, 8);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(glad2X - 5, gladY - 29, 8, 3);

  // Blade extended facing left toward Actor 1
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(glad2X - 15, gladY - 14, 11, 2);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(glad2X - 17, gladY - 14, 2, 2);

  // Round Shield
  ctx.fillStyle = PALETTE[7];
  ctx.fillRect(glad2X + 3, gladY - 17, 3, 12);

  ctx.restore(); // restore camera translate

  // Single celestial star flash in the skybox during the last ~0.7s of the pan (6.2s to 7.0s)
  if (safeElapsed >= 6.2 && safeElapsed <= 7.0) {
    const starProgress = (safeElapsed - 6.2) / 0.8;
    drawCelestialStarFlash(ctx, Math.round(w / 2), Math.round(h * 0.36), starProgress);
  }

  ctx.restore(); // restore globalAlpha
}

// ============================================================================
// PHASE 4: THE TITLE (Flanked by Procedural Roman Columns in Deep Darkness)
// ============================================================================
export function renderPhase4(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsed: number,
) {
  // Fade in over 1.0s, hold for 2.2s, fade out over 0.8s (total ~4.0s)
  let alpha = 1.0;
  if (elapsed < 1.0) {
    alpha = Math.max(0, elapsed / 1.0);
  } else if (elapsed > 3.2) {
    alpha = Math.max(0, 1 - (elapsed - 3.2) / 0.8);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // 1. Deep Dark Stone Background (#3f363b / #1a1921)
  ctx.fillStyle = '#1a1921';
  ctx.fillRect(0, 0, w, h);
  ditherFill(ctx, 0, 0, w, h, '#1a1921', PALETTE[5], 0.25);

  // Large Ashlar stone joint grid in darkness
  ctx.fillStyle = PALETTE[5];
  for (let gy = 24; gy < h; gy += 32) {
    ctx.fillRect(0, gy, w, 1);
  }
  for (let gx = 0; gx < w; gx += 48) {
    for (let gy = 0; gy < h; gy += 32) {
      const stagger = (gy / 32) % 2 === 0 ? 0 : 24;
      ctx.fillRect(gx + stagger, gy, 1, 32);
    }
  }

  // 2. Procedurally Drawn Pixel-Art Roman Columns Flanking the Screen
  // Left Column at X = 44
  drawPixelColumn(ctx, 44, 18, 156, 22);
  // Right Column at X = 300
  drawPixelColumn(ctx, 300, 18, 156, 22);

  // 3. Central Roman Laurel Medallion & Eagle Standard
  const cx = w / 2;
  const cy = 46;

  // Golden Laurel Wreath
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - 18, cy - 14, 36, 26);
  ctx.fillStyle = '#1a1921';
  ctx.fillRect(cx - 12, cy - 10, 24, 18);

  // Roman Laurel Leaves & Eagle
  ctx.fillStyle = PALETTE[0]; // pale gold
  ctx.fillRect(cx - 2, cy - 8, 4, 14); // center stem
  ctx.fillRect(cx - 8, cy - 4, 16, 2); // eagle wing
  ctx.fillRect(cx - 10, cy - 2, 4, 2);
  ctx.fillRect(cx + 6, cy - 2, 4, 2);
  ctx.fillRect(cx - 2, cy + 4, 4, 3); // laurel knot ribbon

  // 4. Grand Title Typography (16-bit Antiquity Roman Capitals)
  ctx.textAlign = 'center';

  // Top Banner / Subtitle Ribbon above the main title: "BLOOD AND GOLD"
  ctx.fillStyle = '#9c8053';
  ctx.fillRect(cx - 76, 68, 152, 12);
  ctx.fillStyle = '#1a1921';
  ctx.fillRect(cx - 74, 69, 148, 10);

  ctx.font = "bold 9px 'Cinzel', Georgia, serif";
  ctx.fillStyle = '#090d16';
  ctx.fillText('B L O O D   A N D   G O L D', cx + 1, 78);
  ctx.fillStyle = '#a13d2d'; // crimson
  ctx.fillText('B L O O D   A N D   G O L D', cx + 1, 77);
  ctx.fillStyle = '#F7DEAA'; // antique gold
  ctx.fillText('B L O O D   A N D   G O L D', cx, 77);

  // Main Prominent Title: "GLADIATOR MANAGER" (large chiseled antique typography)
  ctx.font = "900 17px 'Cinzel', Trajan Pro, Georgia, serif";
  ctx.fillStyle = '#090d16';
  ctx.fillText('GLADIATOR MANAGER', cx + 1, 107);
  ctx.fillText('GLADIATOR MANAGER', cx, 108);

  // Terracotta / crimson intermediate glow
  ctx.fillStyle = PALETTE[3];
  ctx.fillText('GLADIATOR MANAGER', cx + 1, 106);

  // Brilliant antique gold foreground (#F7DEAA)
  ctx.fillStyle = '#F7DEAA';
  ctx.fillText('GLADIATOR MANAGER', cx, 105);

  // Decorative Antiquity Divider Line
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - 80, 116, 160, 2);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cx - 16, 115, 32, 4);
  ctx.fillRect(cx - 2, 114, 4, 6);

  // Latin Motto
  ctx.font = "italic 9px 'Cinzel', Georgia, serif";
  ctx.fillStyle = PALETTE[1];
  ctx.fillText('• SANGUIS ET GLORIA • ANNO DCCLIII A.U.C. •', cx, 132);

  ctx.restore();
}

// ============================================================================
// PHASE 5: THE MONOLOGUE (Visual Novel UI Dialogue Box & Typewriter Text)
// ============================================================================
export function renderPhase5(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsed: number,
  typedCharCount: number,
  isTypingComplete: boolean,
) {
  const safeElapsed = Math.max(0, isNaN(elapsed) ? 0 : elapsed);
  const safeCharCount = Math.max(0, isNaN(typedCharCount) ? 0 : typedCharCount);

  ctx.save();

  // 1. Background remains in deep dark stone
  ctx.fillStyle = '#1a1921';
  ctx.fillRect(0, 0, w, h);
  ditherFill(ctx, 0, 0, w, h, '#1a1921', PALETTE[5], 0.25);

  // Columns dimly visible in background darkness
  ctx.save();
  ctx.globalAlpha = 0.35;
  drawPixelColumn(ctx, 44, 18, 156, 22);
  drawPixelColumn(ctx, 300, 18, 156, 22);
  ctx.restore();

  // 2. Slide-in Visual Novel Dialogue Box at the bottom of the screen
  // Slides up from bottom over 0.35s
  const slideProgress = Math.min(1, safeElapsed / 0.35);
  const targetBoxY = 110;
  const currentBoxY = Math.round(h - slideProgress * (h - targetBoxY));

  const boxX = 14;
  const boxW = w - 28;
  const boxH = 74;

  // Box Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(boxX - 2, currentBoxY - 2, boxW + 4, boxH + 4);

  // Outer Stone Frame (#574b50)
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(boxX, currentBoxY, boxW, boxH);

  // Inner Dark Velveteen Parchment Panel
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(boxX + 3, currentBoxY + 3, boxW - 6, boxH - 6);

  // Dual Gold Fillet Borders
  ctx.strokeStyle = PALETTE[14];
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX + 2.5, currentBoxY + 2.5, boxW - 5, boxH - 5);
  ctx.strokeStyle = PALETTE[15];
  ctx.strokeRect(boxX + 4.5, currentBoxY + 4.5, boxW - 9, boxH - 9);

  // Decorative Corner Studs
  const corners = [
    [boxX + 5, currentBoxY + 5],
    [boxX + boxW - 7, currentBoxY + 5],
    [boxX + 5, currentBoxY + boxH - 7],
    [boxX + boxW - 7, currentBoxY + boxH - 7],
  ];
  ctx.fillStyle = PALETTE[0];
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(cx, cy, 2, 2);
  });

  // 3. Simple 16-bit blocky portrait of the manager in the corner of the box
  const portraitX = boxX + 8;
  const portraitY = currentBoxY + 9;
  drawManagerVnPortrait(ctx, portraitX, portraitY);

  // 4. Speaker Label
  // Red highlight extends cleanly across to match the margin end of the smaller pixelated text
  const textX = boxX + 52;
  const maxW = boxW - 62;

  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(boxX + 52, currentBoxY + 9, maxW, 12);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(boxX + 52, currentBoxY + 20, maxW, 1);

  ctx.font = "bold 9px 'Cinzel', Georgia, serif";
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE[0];
  ctx.fillText('LANISTA AULUS', boxX + 56, currentBoxY + 18);

  // 5. Typewriter Text Rendering
  const visibleText = INTRO_MONOLOGUE_TEXT.slice(0, safeCharCount);
  const words = visibleText.split(' ');
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
    // Drop shadow
    ctx.fillStyle = '#090d16';
    ctx.fillText(line, textX + 1, currentBoxY + 34 + idx * 13);
    // Main text in parchment pale yellow (#ded095)
    ctx.fillStyle = PALETTE[0];
    ctx.fillText(line, textX, currentBoxY + 33 + idx * 13);
  });

  // Blinking typing cursor while typing
  if (!isTypingComplete && Math.floor(elapsed * 12) % 2 === 0) {
    const lastLineIdx = lines.length - 1;
    const lastLineWidth = lastLineIdx >= 0 ? ctx.measureText(lines[lastLineIdx]).width : 0;
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(textX + lastLineWidth + 2, currentBoxY + 25 + Math.max(0, lastLineIdx) * 13, 4, 9);
  }

  // 6. Blinking "Click or Press Space to Continue" indicator
  if (isTypingComplete) {
    const blink = Math.sin(elapsed * 7) > -0.2;
    if (blink) {
      ctx.font = "bold 9px 'Cinzel', Georgia, serif";
      ctx.textAlign = 'right';
      ctx.fillStyle = PALETTE[0];
      ctx.fillText('▼ CLICK OR PRESS SPACE TO ENTER LUDUS', boxX + boxW - 12, currentBoxY + boxH - 8);
    }
  }

  ctx.restore();
}
