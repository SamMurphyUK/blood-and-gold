// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {LOGIC_WIDTH, drawDitherRect} from '../primitives';
import type {ArenaMapTheme} from '../../types';

export function drawArenaCrowdStands(
  ctx: CanvasRenderingContext2D,
  tier: 1 | 2 | 3 | 4 | 5,
  animTimer: number,
  mapTheme: ArenaMapTheme = 'standard',
) {
  // Bleachers stone steps base (y: 6 to 46)
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 0, LOGIC_WIDTH, 48);

  for (let ty = 6; ty < 46; ty += 8) {
    ctx.fillStyle = PALETTE[6];
    ctx.fillRect(0, ty, LOGIC_WIDTH, 2);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(0, ty + 2, LOGIC_WIDTH, 6);
  }

  drawDitherRect(ctx, 0, 12, LOGIC_WIDTH, 28, PALETTE[5], PALETTE[9], 0.5);

  const safeAnim = animTimer || 0;

  // TIER 1: EMPTY / THE DUST BOWL (0-3 Battles completed)
  if (tier === 1) {
    // 1. Cracks and overgrown weeds / moss through stone cracks
    const weedTufts = [
      [24, 14], [52, 22], [88, 30], [122, 38], [134, 18],
      [212, 14], [244, 22], [280, 30], [314, 38], [330, 22]
    ];
    weedTufts.forEach(([wx, wy]) => {
      ctx.fillStyle = PALETTE[12]; // mossy olive drab
      ctx.fillRect(wx, wy, 3, 2);
      ctx.fillStyle = PALETTE[8];  // sage olive
      ctx.fillRect(wx + 1, wy - 1, 1, 3);
    });

    // 2. Stray dogs on empty stone stands
    // Dog 1: Curled up asleep on stone bleacher at x = 74, y = 28
    const breathOffset = Math.round(Math.sin(safeAnim * 2.5) * 0.5);
    ctx.fillStyle = PALETTE[14]; // raw umber dog body
    ctx.fillRect(72, 28 + breathOffset, 8, 4);
    ctx.fillRect(74, 26 + breathOffset, 4, 3); // head
    ctx.fillStyle = PALETTE[1];  // tan fur patch
    ctx.fillRect(73, 29 + breathOffset, 5, 2);
    ctx.fillStyle = PALETTE[5];  // nose & ears
    ctx.fillRect(78, 27 + breathOffset, 1, 1);
    ctx.fillRect(73, 26 + breathOffset, 1, 2);
    // Tail twitch
    const tailTwitch = Math.floor(safeAnim * 4) % 3 === 0 ? 1 : 0;
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(70, 30 + tailTwitch, 2, 1);

    // Dog 2: Thin stray hound sniffing stone step at x = 265, y = 36
    const sniffBob = Math.round(Math.sin(safeAnim * 5) * 1);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(264, 34, 7, 3);
    ctx.fillRect(261, 35 + sniffBob, 3, 2); // snout down
    ctx.fillStyle = PALETTE[5]; // legs
    ctx.fillRect(264, 37, 1, 2);
    ctx.fillRect(269, 37, 1, 2);

    // 3. Exactly 1-2 scattered solitary loan sharks / bored watchers in dark cloaks
    // Lone watcher 1: Cloaked loan shark slouched at x = 32, y = 18
    ctx.fillStyle = PALETTE[5];  // dark cloak
    ctx.fillRect(30, 16, 6, 7);
    ctx.fillRect(31, 13, 4, 4); // cowl
    ctx.fillStyle = PALETTE[1];  // face in shadow
    ctx.fillRect(32, 15, 2, 1);
    ctx.fillStyle = PALETTE[10]; // parchment abacus ledger
    ctx.fillRect(34, 18, 3, 3);

    // Lone watcher 2: Bored spectator leaning back against back stone wall at x = 295, y = 18
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(293, 16, 5, 7);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(294, 13, 3, 4);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(293, 12, 5, 2);
  }

  // TIER 2: SPARSE / WORD OF MOUTH (Podium 2 / 4-7 Battles)
  else if (tier === 2) {
    // Small clusters of 2-3 locals, gamblers, low-level thugs on lower stone bleachers
    // Weeds in upper corners
    ctx.fillStyle = PALETTE[8];
    ctx.fillRect(16, 12, 2, 2);
    ctx.fillRect(324, 12, 2, 2);

    // Cluster 1 (Left Lower): 2 thugs leaning forward on stone rail (x = 44, y = 32)
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(40, 31, 5, 7);
    ctx.fillRect(41, 28, 3, 3);
    ctx.fillStyle = PALETTE[2];
    ctx.fillRect(46, 30, 5, 8);
    ctx.fillRect(47, 27, 3, 3);
    ctx.fillStyle = PALETTE[1]; // flesh
    ctx.fillRect(42, 29, 2, 1);
    ctx.fillRect(48, 28, 2, 1);

    // Cluster 2 (Left Middle): 3 gamblers huddled around stone slab tossing dice (x = 94, y = 34)
    ctx.fillStyle = PALETTE[1]; // sand ochre tunic
    ctx.fillRect(90, 32, 4, 6);
    ctx.fillRect(91, 29, 3, 3);
    ctx.fillStyle = PALETTE[4]; // wine cloak
    ctx.fillRect(95, 31, 4, 7);
    ctx.fillRect(96, 28, 3, 3);
    ctx.fillStyle = PALETTE[5]; // dark hood
    ctx.fillRect(100, 32, 4, 6);
    ctx.fillRect(100, 29, 4, 3);
    // Dice on step
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(95, 37, 1, 1);
    ctx.fillRect(97, 36, 1, 1);

    // Cluster 3 (Right Lower): 2 locals watching with clay cups (x = 230, y = 32)
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(228, 31, 5, 7);
    ctx.fillRect(229, 28, 3, 3);
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(234, 30, 5, 8);
    ctx.fillRect(235, 27, 3, 3);
    ctx.fillStyle = PALETTE[2]; // cup
    ctx.fillRect(233, 33, 2, 2);

    // Cluster 4 (Right Middle): 2 gamblers gesturing (x = 285, y = 28)
    const armWave = Math.sin(safeAnim * 6) > 0 ? 1 : 0;
    ctx.fillStyle = PALETTE[3]; // crimson tunic
    ctx.fillRect(282, 27, 4, 7);
    ctx.fillRect(282, 24, 3, 3);
    ctx.fillStyle = PALETTE[1]; // waving arm
    ctx.fillRect(285, 25 - armWave, 2, 3);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(288, 28, 5, 6);
    ctx.fillRect(289, 25, 3, 3);
  }

  // TIER 3: HALF-FULL / RISING RENOWN (Podium 3 / 8-12 Battles)
  else if (tier === 3) {
    // Busy buzzing arena. Merchants, minor nobles, soldiers fill lower/middle tiers.
    // Left bleachers spectator rows:
    const leftCrowdCols = [
      [14, 34, 1], [22, 32, 4], [32, 34, 2], [42, 26, 3], [52, 28, 1],
      [64, 34, 6], [74, 32, 1], [86, 26, 4], [96, 28, 2], [108, 34, 1],
      [118, 32, 3], [128, 26, 6]
    ];
    leftCrowdCols.forEach(([cx, cy, colorIdx]) => {
      const bob = Math.round(Math.sin(safeAnim * 4 + cx) * 0.5);
      ctx.fillStyle = PALETTE[colorIdx];
      ctx.fillRect(cx, cy + bob, 5, 7);
      ctx.fillStyle = PALETTE[1]; // flesh head
      ctx.fillRect(cx + 1, cy - 3 + bob, 3, 3);
      ctx.fillStyle = PALETTE[5]; // hair/cap
      ctx.fillRect(cx + 1, cy - 4 + bob, 3, 1);
    });

    // Right bleachers spectator rows:
    const rightCrowdCols = [
      [208, 34, 3], [218, 32, 1], [228, 26, 4], [238, 34, 6], [248, 28, 2],
      [258, 32, 1], [268, 34, 3], [278, 26, 1], [290, 32, 4], [302, 34, 2],
      [314, 28, 6], [326, 32, 1]
    ];
    rightCrowdCols.forEach(([cx, cy, colorIdx]) => {
      const bob = Math.round(Math.sin(safeAnim * 4 + cx) * 0.5);
      ctx.fillStyle = PALETTE[colorIdx];
      ctx.fillRect(cx, cy + bob, 5, 7);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(cx + 1, cy - 3 + bob, 3, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(cx + 1, cy - 4 + bob, 3, 1);
    });

    // Pacing vendors on stone steps
    // Vendor 1 on left stairs pacing with wine amphora
    const vend1X = Math.round(65 + Math.sin(safeAnim * 1.6) * 14);
    ctx.fillStyle = PALETTE[0];  // cream linen tunic
    ctx.fillRect(vend1X, 20, 5, 7);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(vend1X + 1, 17, 3, 3);
    ctx.fillStyle = PALETTE[2];  // terracotta amphora
    ctx.fillRect(vend1X + 4, 18, 3, 5);

    // Vendor 2 on right stairs pacing with bread/grapes tray
    const vend2X = Math.round(275 - Math.sin(safeAnim * 1.6) * 14);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(vend2X, 20, 5, 7);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(vend2X + 1, 17, 3, 3);
    ctx.fillStyle = PALETTE[14]; // wooden tray
    ctx.fillRect(vend2X - 3, 21, 6, 2);
    ctx.fillStyle = PALETTE[0];  // bread
    ctx.fillRect(vend2X - 2, 20, 4, 1);
  }

  // TIER 4: PACKED / THE COLOSSEUM SCALE (Podium 4 / 13-17 Battles)
  else if (tier === 4) {
    // Dense double rows of spectators across all steps
    for (let bx = 6; bx <= 138; bx += 8) {
      for (let by = 16; by <= 38; by += 10) {
        const cIdx = ((bx * 7 + by * 13) % 4 === 0) ? 3 : ((bx + by) % 3 === 0 ? 0 : 4);
        const cheerPulse = Math.sin(safeAnim * 8 + bx * 0.4) > 0.4 ? 1 : 0;
        ctx.fillStyle = PALETTE[cIdx];
        ctx.fillRect(bx, by - cheerPulse, 6, 7);
        ctx.fillStyle = PALETTE[1];
        ctx.fillRect(bx + 1, by - 3 - cheerPulse, 4, 3);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(bx + 1, by - 4 - cheerPulse, 4, 1);
        if (cheerPulse > 0) {
          ctx.fillStyle = PALETTE[1];
          ctx.fillRect(bx + 5, by - 5, 1, 3);
        }
      }
    }

    for (let bx = 204; bx <= 332; bx += 8) {
      for (let by = 16; by <= 38; by += 10) {
        const cIdx = ((bx * 7 + by * 13) % 4 === 0) ? 3 : ((bx + by) % 3 === 0 ? 0 : 4);
        const cheerPulse = Math.sin(safeAnim * 8 + bx * 0.4) > 0.4 ? 1 : 0;
        ctx.fillStyle = PALETTE[cIdx];
        ctx.fillRect(bx, by - cheerPulse, 6, 7);
        ctx.fillStyle = PALETTE[1];
        ctx.fillRect(bx + 1, by - 3 - cheerPulse, 4, 3);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(bx + 1, by - 4 - cheerPulse, 4, 1);
        if (cheerPulse > 0) {
          ctx.fillStyle = PALETTE[1];
          ctx.fillRect(bx, by - 5, 1, 3);
        }
      }
    }

    // Shaded VIP boxes with purple awnings on upper tiers
    [26, 94, 235, 302].forEach((vx) => {
      ctx.fillStyle = PALETTE[4]; // imperial wine canopy
      ctx.fillRect(vx - 6, 8, 20, 5);
      ctx.fillStyle = PALETTE[15]; // gold trim
      ctx.fillRect(vx - 6, 12, 20, 1);
      ctx.fillStyle = PALETTE[14]; // timber posts
      ctx.fillRect(vx - 6, 12, 1, 6);
      ctx.fillRect(vx + 13, 12, 1, 6);
    });

    // Hanging Crimson & Gold Imperial Banners draped over stone railings
    [24, 66, 114, 224, 272, 318].forEach((bx) => {
      ctx.fillStyle = PALETTE[3]; // crimson banner
      ctx.fillRect(bx, 42, 10, 12);
      ctx.fillStyle = PALETTE[15]; // gold fringe & laurel motif
      ctx.fillRect(bx, 53, 10, 1);
      ctx.fillRect(bx + 3, 45, 4, 4);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(bx + 4, 46, 2, 2);
    });

    // Torchlight on stone pillars glinting off hundreds of spectators
    [12, 138, 204, 332].forEach((tx, idx) => {
      ctx.fillStyle = PALETTE[14]; // bracket
      ctx.fillRect(tx, 22, 2, 6);
      ctx.fillStyle = PALETTE[15]; // sconce
      ctx.fillRect(tx - 1, 21, 4, 2);
      // Flickering flame pixels
      const tf = (Math.floor(safeAnim * 14) + idx * 3) % 3;
      ctx.fillStyle = tf === 0 ? '#ffffff' : PALETTE[0];
      ctx.fillRect(tx, 18, 2, 3);
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(tx + (tf === 1 ? -1 : 1), 17, 1, 2);
    });
  }

  // TIER 5: THE IMPERIAL APEX (Podium 5 & Championship Bouts / Emperor Duel / Slave Revolt)
  else {
    // Absolute pandemonium! Wall-to-wall cheering crowd, billowing standards, jumping spectators
    for (let bx = 4; bx <= 140; bx += 6) {
      for (let by = 12; by <= 40; by += 8) {
        const cIdx = ((bx * 11 + by) % 5 === 0) ? 3 : ((bx + by) % 3 === 0 ? 0 : (by % 16 === 0 ? 15 : 4));
        const jumpOffset = Math.sin(safeAnim * 12 + bx * 0.6) > 0.2 ? 2 : 0;
        ctx.fillStyle = PALETTE[cIdx];
        ctx.fillRect(bx, by - jumpOffset, 5, 7);
        ctx.fillStyle = PALETTE[1];
        ctx.fillRect(bx + 1, by - 3 - jumpOffset, 3, 3);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(bx + 1, by - 4 - jumpOffset, 3, 1);

        // Raised arms / fists pumping in air
        if (jumpOffset > 0) {
          ctx.fillStyle = PALETTE[1];
          ctx.fillRect(bx - 1, by - 5, 1, 4);
          ctx.fillRect(bx + 4, by - 5, 1, 4);
          // Waving scarves in air
          if ((bx + by) % 6 === 0) {
            ctx.fillStyle = PALETTE[3];
            ctx.fillRect(bx + 4, by - 7, 3, 2);
          }
        }
      }
    }

    for (let bx = 202; bx <= 338; bx += 6) {
      for (let by = 12; by <= 40; by += 8) {
        const cIdx = ((bx * 11 + by) % 5 === 0) ? 3 : ((bx + by) % 3 === 0 ? 0 : (by % 16 === 0 ? 15 : 4));
        const jumpOffset = Math.sin(safeAnim * 12 + bx * 0.6) > 0.2 ? 2 : 0;
        ctx.fillStyle = PALETTE[cIdx];
        ctx.fillRect(bx, by - jumpOffset, 5, 7);
        ctx.fillStyle = PALETTE[1];
        ctx.fillRect(bx + 1, by - 3 - jumpOffset, 3, 3);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(bx + 1, by - 4 - jumpOffset, 3, 1);

        if (jumpOffset > 0) {
          ctx.fillStyle = PALETTE[1];
          ctx.fillRect(bx - 1, by - 5, 1, 4);
          ctx.fillRect(bx + 4, by - 5, 1, 4);
          if ((bx + by) % 6 === 0) {
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(bx - 2, by - 7, 3, 2);
          }
        }
      }
    }

    // Spectators hanging off stone archways and pillars
    [8, 140, 202, 334].forEach((px, idx) => {
      // Pillar climber
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(px, 12, 4, 18);
      ctx.fillStyle = PALETTE[1]; // hanging spectator
      ctx.fillRect(px + (idx % 2 === 0 ? 4 : -4), 16, 4, 7);
      ctx.fillStyle = PALETTE[3]; // red tunic
      ctx.fillRect(px + (idx % 2 === 0 ? 4 : -4), 18, 4, 5);
      ctx.fillStyle = PALETTE[1]; // grasping arm
      ctx.fillRect(px + (idx % 2 === 0 ? 1 : 1), 15, 3, 2);
    });

    // Imperial Aquila Standards & Gold Billowing Banners along entire railing
    for (let bx = 16; bx <= 130; bx += 28) {
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(bx, 42, 16, 14);
      ctx.fillStyle = PALETTE[15]; // gold eagle Aquila
      ctx.fillRect(bx + 4, 45, 8, 5);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(bx, 55, 16, 1);
    }
    for (let bx = 212; bx <= 326; bx += 28) {
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(bx, 42, 16, 14);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(bx + 4, 45, 8, 5);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(bx, 55, 16, 1);
    }

    // Monumental Braziers roaring with golden flames on corner platforms
    [10, 138, 204, 332].forEach((bx, idx) => {
      ctx.fillStyle = PALETTE[15]; // bronze tripod bowl
      ctx.fillRect(bx - 3, 22, 8, 4);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(bx - 2, 26, 6, 6);
      // Blazing flames
      const bf = (Math.floor(safeAnim * 16) + idx * 4) % 4;
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(bx - 2, 16, 6, 6);
      ctx.fillStyle = PALETTE[2];
      ctx.fillRect(bx - 1, 14, 4, 5);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(bx, 13, 2, 4);

      // Rising spark pixels
      if (bf === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + (idx % 2 === 0 ? 1 : -1), 10, 1, 1);
      }
    });
  }
}
