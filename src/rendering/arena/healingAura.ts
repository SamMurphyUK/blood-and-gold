// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

export function drawSaladinHealingAura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  animTime: number,
) {
  const breath = Math.sin(animTime * 2.8);
  const radius = Math.max(1, 22 + breath * 3);
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
  grad.addColorStop(0, 'rgba(74, 222, 128, 0.42)'); // #4ade80
  grad.addColorStop(0.35, 'rgba(222, 208, 149, 0.22)'); // #ded095
  grad.addColorStop(0.7, 'rgba(85, 121, 111, 0.10)'); // #55796f
  grad.addColorStop(1, 'rgba(74, 222, 128, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
