// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';

export function drawEmptyEmperorBalconySprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  railY: number,
) {
  // Two Praetorian Guards flanking the empty throne, watching down on sands in shock
  [-20, 20].forEach((offset) => {
    const gx = cx + offset;
    const gy = railY;
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(gx - 2, gy - 12, 5, 8);
    ctx.fillRect(gx - 2, gy - 18, 5, 6);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(gx - 2, gy - 21, 5, 3);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(gx + (offset < 0 ? -4 : 4), gy - 26, 1, 26);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(gx + (offset < 0 ? -4 : 4), gy - 29, 1, 3);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(gx + (offset < 0 ? -4 : 4), gy - 30, 1, 1);
  });

  // Empty Gilded Imperial Throne Chair
  const ty = railY;
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - 7, ty - 22, 14, 18);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cx - 7, ty - 24, 3, 3);
  ctx.fillRect(cx + 4, ty - 24, 3, 3);
  ctx.fillRect(cx - 2, ty - 25, 4, 3);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(cx - 5, ty - 20, 10, 14);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cx - 3, ty - 16, 6, 3);
  ctx.fillRect(cx - 1, ty - 18, 2, 5);
  ctx.fillStyle = PALETTE[4];
  ctx.fillRect(cx - 6, ty - 6, 12, 4);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - 7, ty - 6, 14, 1);
}

export function drawEmperorBalconySprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  railY: number,
  posture: 'standing' | 'thumbs_up' | 'thumbs_down',
  animTimer = 0,
) {
  // Emperor at cx, rail at railY
  // 1. Two Praetorian Guards flanking the Emperor
  [-18, 18].forEach((offset) => {
    const gx = cx + offset;
    const gy = railY;
    // Guard armor
    ctx.fillStyle = PALETTE[15]; // bronze cuirass
    ctx.fillRect(gx - 2, gy - 12, 5, 8);
    // Bronze helmet & red plume
    ctx.fillRect(gx - 2, gy - 18, 5, 6);
    ctx.fillStyle = PALETTE[3]; // crimson crest
    ctx.fillRect(gx - 2, gy - 21, 5, 3);
    // Upright spear
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(gx + (offset < 0 ? -4 : 4), gy - 26, 1, 26);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(gx + (offset < 0 ? -4 : 4), gy - 29, 1, 3);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(gx + (offset < 0 ? -4 : 4), gy - 30, 1, 1);
  });

  // 2. Emperor Sprite
  const ey = railY;
  // Imperial Purple/Wine Toga
  ctx.fillStyle = PALETTE[4]; // imperial wine
  ctx.fillRect(cx - 5, ey - 14, 11, 10);
  ctx.fillStyle = PALETTE[3]; // crimson sash drape
  ctx.fillRect(cx - 4, ey - 14, 4, 10);
  ctx.fillStyle = PALETTE[0]; // gold embroidered border
  ctx.fillRect(cx - 5, ey - 5, 11, 1);
  ctx.fillRect(cx - 1, ey - 14, 1, 9);
  // Gold Fibula shoulder clasp
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - 4, ey - 13, 2, 2);

  // Head and Laurel Wreath Crown
  ctx.fillStyle = PALETTE[1]; // flesh tone
  ctx.fillRect(cx - 3, ey - 20, 7, 6);
  ctx.fillStyle = PALETTE[5]; // stern eyes slit
  ctx.fillRect(cx - 1, ey - 18, 4, 1);
  // Golden Laurel Crown
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(cx - 4, ey - 22, 9, 3);
  ctx.fillStyle = PALETTE[0]; // gleaming laurel leaf points
  ctx.fillRect(cx - 4, ey - 23, 2, 2);
  ctx.fillRect(cx + 3, ey - 23, 2, 2);
  ctx.fillRect(cx - 1, ey - 23, 3, 1);

  // Hands & Arms according to posture
  if (posture === 'standing') {
    // Both hands resting on the balustrade rail
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(cx - 5, ey - 4, 3, 2);
    ctx.fillRect(cx + 3, ey - 4, 3, 2);
    ctx.fillStyle = PALETTE[15]; // gold imperial rings
    ctx.fillRect(cx - 4, ey - 4, 1, 1);
    ctx.fillRect(cx + 4, ey - 4, 1, 1);
  } else if (posture === 'thumbs_up') {
    // Left hand on rail
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(cx - 5, ey - 4, 3, 2);
    // Right arm raised high extending a prominent THUMB UP
    ctx.fillStyle = PALETTE[4]; // purple sleeve
    ctx.fillRect(cx + 4, ey - 13, 4, 4);
    ctx.fillStyle = PALETTE[1]; // forearm
    ctx.fillRect(cx + 7, ey - 16, 3, 5);
    // Fist & Thumb UP
    ctx.fillRect(cx + 6, ey - 19, 5, 4); // fist
    ctx.fillRect(cx + 8, ey - 24, 3, 6); // thumb pointing straight UP!
    ctx.fillStyle = PALETTE[0]; // gleaming golden specular on thumb
    ctx.fillRect(cx + 9, ey - 24, 1, 3);
  } else if (posture === 'thumbs_down') {
    // Left hand on rail
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(cx - 5, ey - 4, 3, 2);
    // Right arm extended forward/outward with prominent THUMB DOWN
    ctx.fillStyle = PALETTE[4]; // sleeve
    ctx.fillRect(cx + 4, ey - 11, 4, 4);
    ctx.fillStyle = PALETTE[1]; // forearm
    ctx.fillRect(cx + 7, ey - 11, 5, 3);
    // Fist & Thumb DOWN
    ctx.fillRect(cx + 10, ey - 13, 5, 5); // fist
    ctx.fillRect(cx + 12, ey - 8, 3, 6);  // thumb pointing sharply DOWN!
    ctx.fillStyle = PALETTE[3]; // crimson death accent on thumb tip
    ctx.fillRect(cx + 12, ey - 3, 3, 1);
  }
}
