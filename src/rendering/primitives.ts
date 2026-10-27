// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import type {PaletteColor} from '../../constants';
import {PALETTE} from '../../constants';

// --- Virtual Pixel Scaling Engine Constants ---
// 4 virtual display pixels per 1 logic pixel (344x192 logic resolution)
export const LOGIC_WIDTH = 344;
export const LOGIC_HEIGHT = 192;
export const PIXEL_SCALE = 4;

// Soft Ambient Bloom for Camp Night Light Sources (Replacing hard dithered rings)
export function drawSoftAmbientBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  animTime: number,
  intensity = 1.0,
  phaseOffset = 0,
) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(baseRadius)) return;

  // Very slow harmonic breathing cycle (~3.5 seconds per breath cycle)
  const breathFreq = (2 * Math.PI) / 3.5;
  const breath = Math.sin(animTime * breathFreq + phaseOffset);
  // Animate the bloom radius softly expanding and contracting by ~10%
  const radius = Math.max(1, baseRadius * (1 + 0.10 * breath));

  ctx.save();
  // Multi-stop radial gradient / smooth layered glow using warm antiquity tones: #f5d69b, #d99c52, #ba7654
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  // Core brightest around the flame
  grad.addColorStop(0, `rgba(245, 214, 155, ${Math.min(1, 0.48 * intensity)})`);
  // Warm amber mid-glow
  grad.addColorStop(0.35, `rgba(217, 156, 82, ${Math.min(1, 0.28 * intensity)})`);
  // Terracotta ambient attenuation
  grad.addColorStop(0.70, `rgba(186, 118, 84, ${Math.min(1, 0.12 * intensity)})`);
  // Soft ambient falloff to zero
  grad.addColorStop(1, 'rgba(186, 118, 84, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle concentrated inner core glow
  const innerRadius = Math.max(1, radius * 0.4);
  const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
  innerGrad.addColorStop(0, `rgba(245, 214, 155, ${Math.min(1, 0.35 * intensity)})`);
  innerGrad.addColorStop(1, 'rgba(217, 156, 82, 0)');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawDitherRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  baseColor: PaletteColor,
  ditherColor: PaletteColor,
  density: 0.25 | 0.5 | 0.75 = 0.5,
) {
  const ix = Math.floor(x || 0);
  const iy = Math.floor(y || 0);
  const iw = Math.max(0, Math.floor(w || 0));
  const ih = Math.max(0, Math.floor(h || 0));
  if (iw <= 0 || ih <= 0) return;

  ctx.fillStyle = baseColor || PALETTE[5];
  ctx.fillRect(ix, iy, iw, ih);

  ctx.fillStyle = ditherColor || PALETTE[0];
  for (let py = iy; py < iy + ih; py++) {
    for (let px = ix; px < ix + iw; px++) {
      let drawPixel = false;
      if (density === 0.5) {
        drawPixel = (px + py) % 2 === 0;
      } else if (density === 0.25) {
        drawPixel = px % 2 === 0 && py % 2 === 0;
      } else if (density === 0.75) {
        drawPixel = px % 2 === 0 || py % 2 === 0;
      }
      if (drawPixel) {
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
}

export function drawDitherShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  shadowColor: PaletteColor,
) {
  const rx = Math.max(1, Math.floor(radiusX || 1));
  const ry = Math.max(1, Math.floor(radiusY || 1));
  ctx.fillStyle = shadowColor || PALETTE[5];
  const startX = Math.floor(cx - rx);
  const endX = Math.floor(cx + rx);
  const startY = Math.floor(cy - ry);
  const endY = Math.floor(cy + ry);

  for (let py = startY; py <= endY; py++) {
    for (let px = startX; px <= endX; px++) {
      const dx = (px - cx) / rx;
      const dy = (py - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        if ((px + py) % 2 === 0) {
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
}

export function drawCorpseFlies(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  animTime: number,
  seed = 0,
  flyCount = 4,
  radius = 8,
) {
  // Atmospheric buzzing/jittering/flashing fly particles around fallen bodies & memorial graves
  for (let i = 0; i < flyCount; i++) {
    const flySeed = seed * 19 + i * 37;
    const speed = 7.5 + (i % 3) * 3.2;
    const t = animTime * speed + flySeed;

    const angle = t * 1.8 + Math.sin(t * 3.7);
    const r = 4 + (Math.abs(Math.sin(t * 2.3 + i)) * Math.max(1, radius - 4));
    const jx = Math.cos(angle) * r;
    const jy = Math.sin(angle * 1.2) * (r * 0.6) - 2;

    // Twinkle/flash frames to simulate buzzing wings
    const frameTick = Math.floor(animTime * 20 + flySeed) % 5;
    if (frameTick === 0) continue; // brief flicker

    const fx = Math.round(cx + jx);
    const fy = Math.round(cy + jy);

    // Charcoal #2A1B19 or dim gray #4f4448 1x1 pixel
    ctx.fillStyle = frameTick % 2 === 0 ? '#2A1B19' : '#4f4448';
    ctx.fillRect(fx, fy, 1, 1);
  }
}
