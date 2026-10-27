// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';
import type {VisitorWalkingNpcState} from '../../types';

export function drawVisitorNpc(
  ctx: CanvasRenderingContext2D,
  npc: VisitorWalkingNpcState,
  animTimer: number,
) {
  if (!npc.active) return;
  const x = Math.round(npc.x);
  const y = Math.round(npc.y);
  const type = npc.visitor.type;

  ctx.save();
  ctx.translate(x, y);
  if (npc.flipX) ctx.scale(-1, 1);

  // Fade out if entering tent doorway
  if (npc.state === 'entering_tent') {
    ctx.globalAlpha = Math.max(0.1, (npc.y - 74) / 10);
  }

  // Ground shadow
  drawDitherShadow(ctx, 0, 1, 6, 2, PALETTE[5]);

  const isWalking = npc.state === 'walking';
  const walkStride = isWalking ? Math.round(Math.sin(animTimer * 12) * 2) : 0;
  const walkBob = isWalking ? Math.round(Math.abs(Math.sin(animTimer * 12)) * 1) : 0;
  const py = -walkBob;

  if (type === 'merchant') {
    // 1. APOTHECARY MERCHANT: Robed peddler carrying an herb satchel and small balance scale / flasks (#8C7A6B, #ba7654)
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-2 - walkStride, py - 3, 2, 3);
    ctx.fillRect(1 + walkStride, py - 3, 2, 3);

    // Terracotta Robe (#ba7654) with Weathered Stone (#8C7A6B) trim
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(-4, py - 17, 8, 14);
    ctx.fillStyle = '#8C7A6B';
    ctx.fillRect(-4, py - 4, 8, 2);
    ctx.fillRect(-1, py - 17, 2, 13);
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(-4, py - 10, 8, 2);

    // Herb satchel slung across chest
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(-4, py - 16, 2, 8);
    ctx.fillRect(-2, py - 12, 2, 4);
    ctx.fillStyle = '#574b50';
    ctx.fillRect(-6, py - 9, 3, 5);
    // Green medicinal herb sprig poking out of satchel
    ctx.fillStyle = '#627d4d';
    ctx.fillRect(-7, py - 12, 2, 4);
    ctx.fillStyle = '#88997a';
    ctx.fillRect(-8, py - 13, 2, 2);
    ctx.fillRect(-6, py - 11, 2, 2);

    // Left hand holding balance scale / brass scale (#ded095)
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-4, py - 11, 2, 3);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(-8, py - 13, 6, 1);
    ctx.fillRect(-5, py - 14, 1, 3);
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(-8, py - 12, 1, 2);
    ctx.fillRect(-3, py - 12, 1, 2);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(-9, py - 10, 3, 1);
    ctx.fillRect(-4, py - 10, 3, 1);

    // Right hand carrying glass apothecary flask with emerald elixir (#55796f)
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(3, py - 11, 2, 3);
    ctx.fillStyle = '#55796f';
    ctx.fillRect(4, py - 10, 3, 4);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(5, py - 11, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, py - 9, 1, 1);

    // Head, face & peddler hood (#8C7A6B)
    ctx.fillStyle = '#8C7A6B';
    ctx.fillRect(-4, py - 23, 8, 6);
    ctx.fillRect(-4, py - 20, 2, 5);
    ctx.fillRect(2, py - 20, 2, 5);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-2, py - 20, 5, 4);
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(1, py - 19, 1, 1);
    ctx.fillRect(-2, py - 17, 4, 1);

  } else if (type === 'scout') {
    // 2. SCOUT / SLAVE TRADER: Rugged hooded tracker with leather vest and iron key ring (#4f4448, #3f363b)
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(-3 - walkStride, py - 4, 3, 4);
    ctx.fillRect(1 + walkStride, py - 4, 3, 4);

    // Tunic (#3f363b) + Leather Vest (#7f644b / #4f4448)
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(-4, py - 17, 8, 13);
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(-4, py - 16, 8, 8);
    ctx.fillStyle = '#4f4448';
    ctx.fillRect(-5, py - 16, 2, 4);
    ctx.fillRect(3, py - 16, 2, 4);
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(-1, py - 14, 2, 1);
    ctx.fillRect(-1, py - 11, 2, 1);
    ctx.fillStyle = '#574b50';
    ctx.fillRect(-4, py - 8, 8, 2);

    // Iron key ring with heavy iron keys at belt (#a4968d, #ffffff)
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(4, py - 9, 3, 3);
    ctx.fillStyle = '#2A1B19';
    ctx.fillRect(5, py - 8, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, py - 6, 1, 4);
    ctx.fillRect(6, py - 6, 1, 3);
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(5, py - 4, 1, 1);

    // Arms: rugged braced arms
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(-5, py - 13, 2, 5);
    ctx.fillRect(3, py - 13, 2, 5);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-5, py - 8, 2, 2);
    ctx.fillRect(3, py - 8, 2, 2);

    // Deep hooded cowl (#4f4448) casting shadow over eyes
    ctx.fillStyle = '#4f4448';
    ctx.fillRect(-4, py - 23, 8, 7);
    ctx.fillRect(-3, py - 24, 6, 2);
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(-3, py - 21, 6, 5);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-2, py - 19, 4, 3);
    ctx.fillStyle = '#2A1B19';
    ctx.fillRect(0, py - 19, 1, 1);
    ctx.fillStyle = '#574b50';
    ctx.fillRect(-2, py - 17, 4, 1);

  } else if (type === 'patron') {
    // 3. PATRICIAN PATRON: Wealthy Roman noble wearing an immaculate white-and-gold bordered toga with a golden torc (#F7DEAA, #ffffff)
    ctx.fillStyle = '#9e4a42';
    ctx.fillRect(-2 - walkStride, py - 3, 2, 3);
    ctx.fillRect(1 + walkStride, py - 3, 2, 3);

    // Immaculate white toga (#ffffff) with golden border (#F7DEAA, #ded095)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, py - 18, 8, 15);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(-4, py - 17, 3, 14);
    ctx.fillRect(1, py - 12, 3, 8);

    // Gold embroidered border / hem (#F7DEAA, #ded095)
    ctx.fillStyle = '#F7DEAA';
    ctx.fillRect(-4, py - 4, 8, 1);
    ctx.fillRect(-4, py - 17, 2, 14);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(-2, py - 16, 5, 2);

    // Golden torc necklace & shoulder fibula clasp (#ded095, #9c8053)
    ctx.fillStyle = '#ded095';
    ctx.fillRect(-2, py - 19, 5, 2);
    ctx.fillRect(-3, py - 17, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, py - 19, 1, 1);

    // Hands: left hand tucked in toga, right hand holding velvet coin purse with golden coins
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(3, py - 11, 2, 3);
    ctx.fillStyle = '#6d3947';
    ctx.fillRect(4, py - 10, 4, 4);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(5, py - 11, 2, 1);
    ctx.fillRect(5, py - 9, 2, 2);

    // Head, dignified Roman patrician hairstyle & laurel trim
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-3, py - 23, 6, 5);
    ctx.fillStyle = '#574b50';
    ctx.fillRect(-4, py - 25, 8, 3);
    ctx.fillRect(-4, py - 23, 2, 2);
    ctx.fillStyle = '#F7DEAA';
    ctx.fillRect(-2, py - 25, 4, 1);
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(1, py - 21, 1, 1);

  } else {
    // 4. RIVAL LANISTA: Flaunting swagger in ornate brass-studded cuirass and crimson cloak (#ba7654, #1b1216)
    ctx.fillStyle = '#1b1216';
    ctx.fillRect(-3 - walkStride, py - 4, 3, 4);
    ctx.fillRect(1 + walkStride, py - 4, 3, 4);
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(-3 - walkStride, py - 3, 3, 1);
    ctx.fillRect(1 + walkStride, py - 3, 3, 1);

    // Flowing Crimson Cloak billowing behind shoulders (#9e4a42, #6d3947)
    const cloakSway = isWalking ? Math.round(Math.sin(animTimer * 10) * 2) : 0;
    ctx.fillStyle = '#6d3947';
    ctx.fillRect(-7 + cloakSway, py - 17, 3, 14);
    ctx.fillStyle = '#9e4a42';
    ctx.fillRect(-6 + cloakSway, py - 16, 3, 12);
    ctx.fillRect(-7 + cloakSway, py - 4, 4, 2);

    // Ornate Brass-Studded Muscle Cuirass (#ba7654, #9c8053 with gold studs #ded095)
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(-4, py - 17, 8, 9);
    ctx.fillStyle = '#9c8053';
    ctx.fillRect(-3, py - 16, 2, 3);
    ctx.fillRect(1, py - 16, 2, 3);
    // Brass studs / rivets glinting
    ctx.fillStyle = '#ded095';
    ctx.fillRect(-3, py - 14, 1, 1);
    ctx.fillRect(2, py - 14, 1, 1);
    ctx.fillRect(-1, py - 11, 2, 1);
    ctx.fillRect(-3, py - 9, 1, 1);
    ctx.fillRect(2, py - 9, 1, 1);

    // Crimson & Leather Pteruges (kilt)
    ctx.fillStyle = '#9e4a42';
    ctx.fillRect(-4, py - 8, 8, 5);
    ctx.fillStyle = '#1b1216';
    ctx.fillRect(-3, py - 6, 2, 3);
    ctx.fillRect(1, py - 6, 2, 3);

    // Swagger arms: right hand resting arrogantly on sword pommel at hip
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(3, py - 17, 3, 3);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(3, py - 14, 2, 5);
    // Sword hilt at hip (#ded095, #7f644b)
    ctx.fillStyle = '#ded095';
    ctx.fillRect(4, py - 9, 2, 2);
    ctx.fillRect(3, py - 8, 4, 1);
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(4, py - 7, 2, 6);

    // Left arm swinging with swagger
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(-6, py - 17, 3, 3);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-5, py - 14, 2, 5);

    // Head, sneering face & trimmed arrogant beard
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-3, py - 23, 6, 5);
    ctx.fillStyle = '#1b1216';
    ctx.fillRect(-4, py - 25, 8, 3);
    ctx.fillRect(-4, py - 23, 2, 2);
    ctx.fillStyle = '#1b1216';
    ctx.fillRect(-2, py - 18, 5, 2);
    ctx.fillStyle = '#9e4a42';
    ctx.fillRect(0, py - 19, 2, 1);
    ctx.fillStyle = '#3f363b';
    ctx.fillRect(1, py - 21, 1, 1);
  }

  ctx.restore();
}
