// Original pixel art for the debug alt-camp. A salt quay, not the ludus courtyard.
// Drawn with the game palette and the same fillRect language as the camp sprites.
// It does not call the camp scene or the cultural-gladiator renderer.

import {PALETTE} from '../../../constants';
import {LOGIC_HEIGHT, LOGIC_WIDTH, drawDitherRect, drawDitherShadow} from '../primitives';

const P = PALETTE;

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, swatch: number) {
  ctx.fillStyle = P[swatch];
  ctx.fillRect(x, y, w, h);
}

function drawSkyAndSea(ctx: CanvasRenderingContext2D, anim: number) {
  px(ctx, 0, 0, LOGIC_WIDTH, 10, 6);
  drawDitherRect(ctx, 0, 10, LOGIC_WIDTH, 8, P[6], P[9], 0.5);
  px(ctx, 0, 18, LOGIC_WIDTH, 14, 9);

  // Block sun, low over the water. Same parchment and ochre the camp sun uses, built from pixels.
  const sunX = 262;
  const sunY = 14;
  px(ctx, sunX - 2, sunY - 3, 6, 8, 1);
  px(ctx, sunX - 3, sunY - 2, 8, 6, 1);
  px(ctx, sunX - 1, sunY - 1, 4, 4, 0);
  px(ctx, sunX - 6, sunY, 2, 1, 0);
  px(ctx, sunX + 5, sunY, 2, 1, 0);
  px(ctx, sunX, sunY - 6, 1, 2, 0);
  px(ctx, sunX, sunY + 5, 1, 2, 0);

  // Distant headland
  px(ctx, 28, 26, 36, 6, 7);
  px(ctx, 34, 22, 18, 4, 8);
  px(ctx, 40, 20, 6, 2, 8);

  // Far sail
  px(ctx, 176, 24, 1, 10, 5);
  px(ctx, 177, 26, 7, 6, 0);
  px(ctx, 177, 28, 4, 3, 11);

  // Gulls
  const gullBob = Math.sin(anim * 3) > 0 ? 0 : 1;
  for (const [gx, gy] of [[70, 8], [150, 12 + gullBob], [210, 6]] as const) {
    px(ctx, gx, gy, 1, 1, 0);
    px(ctx, gx + 2, gy, 1, 1, 0);
    px(ctx, gx + 1, gy + 1, 1, 1, 11);
  }

  // Water, dark to shallow, with a scrolling foam stitch.
  px(ctx, 0, 32, LOGIC_WIDTH, 16, 7);
  drawDitherRect(ctx, 0, 32, LOGIC_WIDTH, 8, P[7], P[6], 0.25);
  px(ctx, 0, 48, LOGIC_WIDTH, 22, 8);
  drawDitherRect(ctx, 0, 58, LOGIC_WIDTH, 10, P[8], P[7], 0.25);
  px(ctx, 0, 70, LOGIC_WIDTH, 22, 1);
  drawDitherRect(ctx, 0, 70, LOGIC_WIDTH, 12, P[1], P[8], 0.25);

  const shift = Math.floor(anim * 10) % 10;
  ctx.fillStyle = P[0];
  for (let band = 0; band < 4; band++) {
    const y = 40 + band * 10;
    for (let x = -10 + ((shift + band * 3) % 10); x < LOGIC_WIDTH; x += 10) {
      ctx.fillRect(x, y, 4, 1);
    }
  }
}

function drawQuay(ctx: CanvasRenderingContext2D, anim: number) {
  px(ctx, 0, 96, LOGIC_WIDTH, LOGIC_HEIGHT - 96, 11);
  px(ctx, 0, 92, LOGIC_WIDTH, 4, 5);
  px(ctx, 0, 92, LOGIC_WIDTH, 1, 10);

  ctx.fillStyle = P[10];
  for (let row = 0; row < 8; row++) {
    const y = 104 + row * 11;
    ctx.fillRect(0, y, LOGIC_WIDTH, 1);
    const off = row % 2 === 0 ? 0 : 14;
    for (let x = off; x < LOGIC_WIDTH; x += 28) {
      ctx.fillRect(x, y - 10, 1, 11);
    }
  }

  // Splash against the lip
  const splash = Math.floor(anim * 6) % 3;
  px(ctx, 120 + splash, 90, 3, 1, 0);
  px(ctx, 200, 91, 2, 1, 0);
  px(ctx, 300 - splash, 90, 4, 1, 0);
}

function drawShip(ctx: CanvasRenderingContext2D, anim: number) {
  // Hull in the shallows, stern to the left, bronze ram to the right.
  px(ctx, 16, 78, 78, 14, 14);
  px(ctx, 20, 72, 66, 8, 1);
  px(ctx, 16, 84, 78, 2, 4);
  px(ctx, 22, 90, 64, 4, 5);
  ctx.fillStyle = P[5];
  for (let x = 24; x < 88; x += 8) ctx.fillRect(x, 74, 1, 12);

  px(ctx, 88, 76, 12, 10, 14);
  px(ctx, 98, 72, 6, 8, 14);
  px(ctx, 102, 68, 5, 6, 15);
  px(ctx, 104, 70, 2, 2, 0);

  px(ctx, 8, 66, 14, 20, 14);
  px(ctx, 10, 60, 10, 8, 5);
  px(ctx, 12, 58, 6, 3, 15);

  px(ctx, 22, 70, 64, 3, 11);

  // Mast, yard, furled sail
  px(ctx, 50, 34, 2, 38, 14);
  px(ctx, 38, 38, 26, 2, 5);
  px(ctx, 44, 40, 14, 18, 0);
  px(ctx, 46, 42, 2, 14, 1);
  px(ctx, 54, 42, 2, 14, 11);
  px(ctx, 50, 32, 2, 3, 3);

  // Stay lines
  ctx.fillStyle = P[5];
  ctx.fillRect(28, 64, 1, 1);
  for (let i = 0; i < 14; i++) ctx.fillRect(28 + i, 64 - i, 1, 1);
  for (let i = 0; i < 12; i++) ctx.fillRect(72 - i, 66 - i, 1, 1);

  // Oar lifting on the beat
  const oar = Math.round(Math.sin(anim * 2) * 2);
  px(ctx, 70, 86 + oar, 16, 1, 14);
  px(ctx, 84, 84 + oar, 3, 4, 14);

  // Shield hung on the stern
  px(ctx, 12, 74, 6, 7, 3);
  px(ctx, 14, 76, 2, 3, 15);
}

function drawNetPost(ctx: CanvasRenderingContext2D, x: number, anim: number) {
  px(ctx, x, 108, 3, 40, 14);
  px(ctx, x + 22, 112, 3, 36, 14);
  px(ctx, x, 108, 25, 2, 14);
  const sway = Math.round(Math.sin(anim * 1.6) );
  ctx.fillStyle = P[12];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      if ((row + col) % 2 === 0) ctx.fillRect(x + 4 + col * 3 + sway, 112 + row * 3, 1, 1);
    }
  }
}

function drawBrazier(ctx: CanvasRenderingContext2D, x: number, y: number, anim: number) {
  drawDitherShadow(ctx, x + 3, y + 2, 6, 2, P[5]);
  px(ctx, x + 2, y - 8, 2, 8, 5);
  px(ctx, x - 1, y - 10, 8, 3, 10);
  px(ctx, x, y - 12, 6, 2, 6);
  const flick = Math.floor(anim * 9) % 3;
  px(ctx, x + 1, y - 16 - (flick === 2 ? 1 : 0), 4, 4, 3);
  px(ctx, x + 2, y - 18 - (flick === 0 ? 1 : 0), 2, 3, 1);
  px(ctx, x + 2, y - 19, 1, 2, 0);
}

function drawColumn(ctx: CanvasRenderingContext2D) {
  // Broken shaft and a capital lying in front of it.
  drawDitherShadow(ctx, 318, 168, 10, 3, P[5]);
  px(ctx, 308, 150, 14, 4, 10);
  px(ctx, 310, 118, 8, 32, 11);
  px(ctx, 310, 118, 8, 3, 10);
  px(ctx, 312, 130, 4, 1, 10);
  px(ctx, 312, 140, 4, 1, 10);
  px(ctx, 322, 156, 12, 5, 11);
  px(ctx, 322, 154, 12, 2, 0);
  px(ctx, 324, 158, 3, 2, 10);
}

function drawRopeAndBollard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y - 12, 4, 12, 14);
  px(ctx, x - 2, y - 14, 8, 3, 5);
  px(ctx, x + 6, y - 4, 5, 4, 14);
  px(ctx, x + 10, y - 6, 4, 4, 14);
  px(ctx, x + 8, y - 2, 4, 3, 4);
}

function drawBoarPen(ctx: CanvasRenderingContext2D, anim: number) {
  const x = 18;
  const y = 168;
  px(ctx, x, y - 22, 2, 22, 14);
  px(ctx, x + 28, y - 22, 2, 22, 14);
  px(ctx, x, y - 22, 30, 2, 14);
  px(ctx, x, y - 12, 30, 2, 14);
  px(ctx, x, y - 2, 30, 2, 5);

  const sniff = Math.sin(anim * 2) > 0 ? 0 : 1;
  // Boar, facing right, inside the rails.
  drawDitherShadow(ctx, x + 16, y - 2, 8, 2, P[5]);
  px(ctx, x + 8, y - 12, 14, 7, 9);
  px(ctx, x + 10, y - 14, 8, 3, 4);
  px(ctx, x + 20, y - 14 + sniff, 7, 6, 9);
  px(ctx, x + 25, y - 12 + sniff, 3, 2, 1);
  px(ctx, x + 26, y - 10 + sniff, 3, 1, 0);
  px(ctx, x + 24, y - 12 + sniff, 1, 1, 5);
  px(ctx, x + 8, y - 16, 2, 3, 4);
  px(ctx, x + 9, y - 5, 2, 3, 5);
  px(ctx, x + 16, y - 5, 2, 3, 5);
  px(ctx, x + 6, y - 10, 2, 2, 4);
}

function drawRetiarius(ctx: CanvasRenderingContext2D, anim: number) {
  const stride = Math.round(Math.sin(anim * 8) * 2);
  const net = Math.round(Math.sin(anim * 2.2));
  drawDitherShadow(ctx, 0, 1, 6, 2, P[5]);
  px(ctx, -3 - stride, -12, 2, 6, 14);
  px(ctx, 1 + stride, -12, 2, 6, 14);
  px(ctx, -3 - stride, -6, 2, 6, 1);
  px(ctx, 1 + stride, -6, 2, 6, 1);
  px(ctx, -4, -15, 8, 3, 0);
  px(ctx, -4, -15, 8, 1, 5);
  px(ctx, -3, -23, 7, 8, 1);
  px(ctx, -2, -21, 2, 3, 2);
  // Galerus, the retiarius shoulder guard. It sticks out past the body.
  px(ctx, -11, -26, 7, 10, 10);
  px(ctx, -11, -26, 7, 2, 0);
  px(ctx, -11, -24, 2, 8, 11);
  px(ctx, -2, -29, 5, 5, 1);
  px(ctx, -2, -31, 5, 2, 5);
  px(ctx, 1, -27, 1, 1, 5);
  // Trident, held high.
  px(ctx, 6, -38, 1, 26, 14);
  px(ctx, 3, -40, 1, 6, 11);
  px(ctx, 6, -42, 1, 6, 0);
  px(ctx, 9, -40, 1, 6, 11);
  px(ctx, 4, -36, 5, 1, 10);
  // Weighted net, hanging off the galerus arm.
  ctx.fillStyle = P[11];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      if ((row + col) % 2 === 0) ctx.fillRect(-12 + col * 2 + net, -16 + row * 2, 1, 1);
    }
  }
  px(ctx, -10 + net, -6, 3, 2, 15);
}

function drawThracian(ctx: CanvasRenderingContext2D) {
  drawDitherShadow(ctx, 0, 1, 6, 2, P[5]);
  px(ctx, -3, -12, 2, 6, 14);
  px(ctx, 1, -12, 2, 6, 14);
  px(ctx, -3, -6, 2, 6, 15);
  px(ctx, 1, -6, 2, 6, 15);
  px(ctx, -3, -5, 2, 1, 0);
  px(ctx, 1, -5, 2, 1, 0);
  px(ctx, -4, -22, 8, 10, 4);
  px(ctx, -4, -14, 8, 2, 15);
  px(ctx, -3, -20, 6, 2, 3);
  // Griffin-crest helmet. The plume is the silhouette.
  px(ctx, -4, -30, 8, 8, 15);
  px(ctx, -3, -33, 6, 3, 15);
  px(ctx, -2, -46, 4, 14, 3);
  px(ctx, -1, -48, 2, 4, 0);
  px(ctx, 1, -44, 2, 6, 4);
  px(ctx, -2, -26, 5, 1, 5);
  // Parmula
  px(ctx, -11, -24, 6, 11, 3);
  px(ctx, -10, -20, 4, 4, 15);
  px(ctx, -9, -19, 2, 2, 0);
  // Sica, the curve stepping forward.
  px(ctx, 5, -16, 3, 2, 11);
  px(ctx, 7, -19, 2, 4, 10);
  px(ctx, 8, -22, 2, 3, 11);
  px(ctx, 7, -23, 2, 1, 0);
}

function drawCrupellarius(ctx: CanvasRenderingContext2D) {
  drawDitherShadow(ctx, 0, 2, 8, 2, P[5]);
  // The plate goes to the ground. No bare legs.
  px(ctx, -5, -6, 4, 6, 6);
  px(ctx, 1, -6, 4, 6, 6);
  px(ctx, -7, -24, 14, 16, 10);
  px(ctx, -7, -24, 14, 2, 6);
  px(ctx, -1, -22, 2, 14, 5);
  px(ctx, -7, -16, 14, 2, 5);
  px(ctx, -5, -20, 1, 1, 15);
  px(ctx, 4, -20, 1, 1, 15);
  px(ctx, -5, -12, 1, 1, 15);
  px(ctx, 4, -12, 1, 1, 15);
  px(ctx, -7, -32, 14, 9, 6);
  px(ctx, -7, -32, 14, 2, 10);
  px(ctx, -3, -28, 6, 1, 0);
  px(ctx, -9, -26, 2, 3, 5);
  px(ctx, 7, -26, 2, 3, 5);
}

function drawGladiatrix(ctx: CanvasRenderingContext2D, anim: number) {
  const stride = Math.round(Math.sin(anim * 7 + 1) * 1);
  drawDitherShadow(ctx, 0, 1, 5, 2, P[5]);
  px(ctx, -2 - stride, -12, 2, 12, 1);
  px(ctx, 1 + stride, -12, 2, 6, 1);
  px(ctx, 1 + stride, -6, 2, 6, 15);
  px(ctx, -3, -15, 6, 3, 0);
  px(ctx, -3, -15, 6, 1, 14);
  px(ctx, -2, -23, 5, 8, 1);
  px(ctx, -2, -21, 5, 2, 14);
  px(ctx, -2, -28, 4, 5, 1);
  // Hair knot and a braid down the back, so the outline is not a man's.
  px(ctx, -2, -36, 6, 6, 4);
  px(ctx, 0, -38, 3, 3, 3);
  px(ctx, -6, -28, 3, 14, 4);
  px(ctx, -7, -16, 4, 2, 3);
  px(ctx, 1, -26, 1, 1, 5);
  // Short sword, point down-forward
  px(ctx, 4, -18, 1, 8, 15);
  px(ctx, 3, -20, 3, 2, 11);
  px(ctx, 4, -10, 1, 2, 0);
}

function drawSagittarius(ctx: CanvasRenderingContext2D, anim: number) {
  const draw = Math.sin(anim * 1.4) > 0.2;
  drawDitherShadow(ctx, 0, 1, 5, 2, P[5]);
  px(ctx, -2, -12, 2, 12, 8);
  px(ctx, 1, -12, 2, 12, 14);
  px(ctx, -3, -22, 7, 10, 8);
  px(ctx, -3, -14, 7, 2, 14);
  px(ctx, -2, -27, 5, 5, 1);
  // Pointed cap
  px(ctx, -3, -31, 6, 4, 14);
  px(ctx, -2, -34, 4, 3, 14);
  px(ctx, -1, -36, 2, 2, 5);
  // Quiver
  px(ctx, -6, -22, 3, 8, 15);
  px(ctx, -6, -24, 1, 3, 0);
  px(ctx, -4, -24, 1, 2, 3);
  // Bow. A real arc, string pulled on the beat.
  const stringX = draw ? 4 : 7;
  px(ctx, 8, -32, 2, 3, 14);
  px(ctx, 10, -29, 2, 3, 14);
  px(ctx, 11, -26, 2, 12, 14);
  px(ctx, 10, -14, 2, 3, 14);
  px(ctx, 8, -11, 2, 3, 14);
  px(ctx, stringX, -29, 1, 16, 0);
  if (draw) {
    px(ctx, 5, -22, 10, 1, 11);
    px(ctx, 14, -23, 3, 3, 10);
    px(ctx, 3, -23, 2, 3, 0);
  }
}

function drawVenator(ctx: CanvasRenderingContext2D) {
  drawDitherShadow(ctx, 0, 1, 5, 2, P[5]);
  px(ctx, -2, -12, 2, 12, 14);
  px(ctx, 1, -12, 2, 12, 14);
  px(ctx, -3, -22, 7, 10, 7);
  px(ctx, -6, -22, 3, 12, 8);
  px(ctx, -2, -28, 5, 6, 1);
  px(ctx, -3, -30, 6, 3, 14);
  px(ctx, 0, -26, 1, 1, 5);
  // Hunting spear
  px(ctx, 5, -36, 1, 30, 14);
  px(ctx, 4, -38, 3, 3, 11);
  px(ctx, 5, -40, 1, 2, 0);
  px(ctx, 3, -18, 5, 1, 15);
}

function drawHound(ctx: CanvasRenderingContext2D, anim: number) {
  const wag = Math.round(Math.sin(anim * 12) * 2);
  drawDitherShadow(ctx, 2, 1, 6, 2, P[5]);
  px(ctx, -4, -7, 10, 5, 14);
  px(ctx, -2, -8, 6, 2, 1);
  px(ctx, 5, -10, 5, 5, 14);
  px(ctx, 8, -11, 2, 2, 4);
  px(ctx, 8, -8, 1, 1, 5);
  px(ctx, 9, -6, 2, 1, 0);
  px(ctx, -3, -3, 2, 3, 5);
  px(ctx, 3, -3, 2, 3, 5);
  px(ctx, -6, -6 + wag, 3, 1, 14);
  px(ctx, -8, -7 + wag, 2, 1, 4);
}

interface Figure {
  name: string;
  note: string;
  x: number;
  y: number;
  flip: boolean;
  lift: number;
  draw: (ctx: CanvasRenderingContext2D, anim: number) => void;
}

const FIGURES: Figure[] = [
  {name: 'Nemo', note: 'Retiarius', x: 168, y: 162, flip: false, lift: 48, draw: drawRetiarius},
  {name: 'Dacus', note: 'Thracian', x: 214, y: 170, flip: false, lift: 54, draw: drawThracian},
  {name: 'Ferrum', note: 'Crupellarius', x: 132, y: 178, flip: false, lift: 42, draw: drawCrupellarius},
  {name: 'Livia', note: 'Gladiatrix', x: 268, y: 164, flip: true, lift: 44, draw: drawGladiatrix},
  {name: 'Toxotes', note: 'Sagittarius', x: 236, y: 146, flip: true, lift: 50, draw: drawSagittarius},
  {name: 'Ursus', note: 'Venator', x: 78, y: 156, flip: false, lift: 44, draw: drawVenator},
];

export function drawAltCamp(ctx: CanvasRenderingContext2D, animTime: number) {
  drawSkyAndSea(ctx, animTime);
  drawQuay(ctx, animTime);
  drawShip(ctx, animTime);
  drawNetPost(ctx, 108, animTime);
  drawRopeAndBollard(ctx, 96, 150);
  drawBoarPen(ctx, animTime);
  drawBrazier(ctx, 324, 140, animTime);
  drawColumn(ctx);

  const houndWag = (c: CanvasRenderingContext2D, anim: number) => drawHound(c, anim);
  const sorted = [...FIGURES].sort((a, b) => a.y - b.y);
  for (const figure of sorted) {
    ctx.save();
    ctx.translate(figure.x, figure.y);
    if (figure.flip) ctx.scale(-1, 1);
    figure.draw(ctx, animTime);
    ctx.restore();
  }
  ctx.save();
  ctx.translate(96, 176);
  houndWag(ctx, animTime);
  ctx.restore();
}

export function drawAltCampOverlay(
  displayCtx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  _animTime: number,
) {
  const scaleX = canvasWidth / LOGIC_WIDTH;
  const scaleY = canvasHeight / LOGIC_HEIGHT;
  displayCtx.save();
  displayCtx.textAlign = 'center';
  displayCtx.font = "bold 11px 'Cinzel', Georgia, serif";
  displayCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  displayCtx.shadowBlur = 4;
  displayCtx.shadowOffsetY = 1;

  const plates: {name: string; note: string; x: number; y: number}[] = [
    ...FIGURES.map((f) => ({name: f.name, note: f.note, x: f.x, y: f.y - f.lift})),
    {name: 'Ferox', note: 'Hound', x: 96, y: 150},
  ];
  for (const plate of plates) {
    const dx = Math.round(plate.x * scaleX);
    const dy = Math.round(plate.y * scaleY);
    displayCtx.fillStyle = '#ded095';
    displayCtx.fillText(plate.name, dx, dy);
    displayCtx.font = "9px Georgia, serif";
    displayCtx.fillStyle = '#cb9f6b';
    displayCtx.fillText(plate.note, dx, dy + 11);
    displayCtx.font = "bold 11px 'Cinzel', Georgia, serif";
  }
  displayCtx.restore();
}
