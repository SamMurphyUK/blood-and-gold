// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawLineageStewardess} from '../npcs/stewardess';
import {LOGIC_HEIGHT, LOGIC_WIDTH, drawDitherRect, drawDitherShadow, drawSoftAmbientBloom} from '../primitives';
import type {LudusUpgrades} from '../../types';

export function drawShootingStarEffect(
  ctx: CanvasRenderingContext2D,
  progress: number,
  startX = 270,
  startY = 2,
  endX = 75,
  endY = 40,
) {
  if (progress <= 0 || progress >= 1) return;
  const curX = Math.round(startX + (endX - startX) * progress);
  const curY = Math.round(startY + (endY - startY) * progress);

  ctx.save();
  // Head
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(curX, curY, 2, 2);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(curX - 1, curY, 4, 1);
  ctx.fillRect(curX, curY - 1, 1, 4);

  // Diagonal trailing streak
  for (let s = 1; s <= 14; s++) {
    const sx = Math.round(curX - (endX - startX) * 0.025 * s);
    const sy = Math.round(curY - (endY - startY) * 0.025 * s);
    ctx.fillStyle = s <= 3 ? '#ffffff' : s <= 7 ? PALETTE[0] : PALETTE[15];
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Lingering fading pixel particles
  for (let p = 0; p < 8; p++) {
    const pT = p / 8;
    const px = Math.round(startX + (endX - startX) * (progress * pT) + Math.sin(p * 3 + progress * 8) * 2);
    const py = Math.round(startY + (endY - startY) * (progress * pT) + Math.cos(p * 2 + progress * 6) * 2);
    ctx.fillStyle = (p % 2 === 0) ? PALETTE[0] : PALETTE[15];
    ctx.fillRect(px, py, 1, 1);
  }
  ctx.restore();
}

// ============================================================================
// CAMP VIEW RENDERERS (Pale Alabaster Floor, Grey Framing Walls, Moving Clouds)
// ============================================================================

export function drawCampSkyAndWalls(
  ctx: CanvasRenderingContext2D,
  animTime: number,
  podiumTierWon = 0,
  shootingStarProgress = 0,
  campTimeOfDay = 35,
) {
  // Sky Horizon
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(0, 0, LOGIC_WIDTH, 14);
  drawDitherRect(ctx, 0, 14, LOGIC_WIDTH, 8, PALETTE[9], PALETTE[6], 0.5);
  ctx.fillStyle = PALETTE[6];
  ctx.fillRect(0, 22, LOGIC_WIDTH, 14);

  // CELESTIAL ORBITAL CYCLE: SUN AND MOON
  const cTime = ((campTimeOfDay % 120) + 120) % 120;

  // 1. Radiant Sun Arc (Dawn -> Day -> Dusk: cTime 0 to 82)
  if (cTime >= 0 && cTime <= 82) {
    const sunT = cTime / 80;
    const sunX = Math.round(-15 + (LOGIC_WIDTH + 30) * Math.min(1, Math.max(0, sunT)));
    const sunY = Math.round(36 - Math.sin(Math.min(1, Math.max(0, sunT)) * Math.PI) * 26);

    // Soft ambient radial glow expanding and contracting gently (harmonic breath)
    const breath = 1 + 0.12 * Math.sin(animTime * 1.8);
    const sunGlowRadius = Math.max(1, 24 * breath);

    ctx.save();
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunGlowRadius);
    sunGrad.addColorStop(0, 'rgba(247, 222, 170, 0.65)'); // #F7DEAA core
    sunGrad.addColorStop(0.35, 'rgba(217, 156, 82, 0.32)'); // #d99c52 warm mid
    sunGrad.addColorStop(0.7, 'rgba(186, 118, 84, 0.12)'); // #ba7654 ambient
    sunGrad.addColorStop(1, 'rgba(186, 118, 84, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunGlowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Sun Disc (#F7DEAA with #d99c52 rim)
    ctx.fillStyle = '#d99c52';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F7DEAA';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cardinal rays
    ctx.fillStyle = '#F7DEAA';
    ctx.fillRect(sunX - 7, sunY, 2, 1);
    ctx.fillRect(sunX + 6, sunY, 2, 1);
    ctx.fillRect(sunX, sunY - 7, 1, 2);
    ctx.fillRect(sunX, sunY + 6, 1, 2);
    ctx.restore();
  }

  // 2. Pale Moon Arc (Dusk -> Night -> Dawn: cTime 76 to 120 and 0 to 16)
  if (cTime >= 76 || cTime <= 16) {
    const moonT = cTime >= 76 ? (cTime - 76) / 44 : (cTime + 44) / 60;
    const moonX = Math.round(-15 + (LOGIC_WIDTH + 30) * Math.min(1, Math.max(0, moonT)));
    const moonY = Math.round(36 - Math.sin(Math.min(1, Math.max(0, moonT)) * Math.PI) * 24);

    // Soft cool nocturnal ambient bloom (expanding and contracting gently)
    const breath = 1 + 0.1 * Math.sin(animTime * 1.5 + 1);
    const moonGlowRadius = Math.max(1, 20 * breath);

    ctx.save();
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonGlowRadius);
    moonGrad.addColorStop(0, 'rgba(222, 208, 149, 0.45)'); // #ded095 pale silver core
    moonGrad.addColorStop(0.4, 'rgba(245, 214, 155, 0.18)'); // #f5d69b warm cream
    moonGrad.addColorStop(0.75, 'rgba(71, 80, 92, 0.08)');  // slate blue
    moonGrad.addColorStop(1, 'rgba(71, 80, 92, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonGlowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pale Silver-Crescent Disc (#ded095 / #f5d69b)
    ctx.fillStyle = '#ded095';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
    ctx.fill();
    // Inner crescent shadow cutout
    ctx.fillStyle = PALETTE[6];
    ctx.beginPath();
    ctx.arc(moonX + 1.5, moonY - 0.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    // Silver rim highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(moonX - 4, moonY - 1, 1, 2);
    ctx.fillRect(moonX - 3, moonY - 3, 1, 1);
    ctx.fillRect(moonX - 3, moonY + 2, 1, 1);
    ctx.restore();
  }

  // Slow drift pixel clouds
  const cloud1X = (Math.floor(animTime * 2.2) + 20) % (LOGIC_WIDTH + 60) - 40;
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(cloud1X, 8, 38, 6);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cloud1X + 4, 7, 26, 2);

  const cloud2X = (Math.floor(animTime * 1.6) + 180) % (LOGIC_WIDTH + 60) - 40;
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(cloud2X, 16, 44, 7);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cloud2X + 6, 15, 30, 2);

  // Solitary rare shooting star only when active in camp skybox
  if (shootingStarProgress > 0 && shootingStarProgress < 1) {
    drawShootingStarEffect(ctx, shootingStarProgress, 270, 2, 75, 40);
  }

  // Distant olive groves along the horizon
  ctx.fillStyle = PALETTE[12];
  for (let i = 0; i < LOGIC_WIDTH; i += 14) {
    const treeH = 5 + (Math.sin(i * 0.45) > 0 ? 3 : 0);
    ctx.fillRect(i, 44 - treeH, 11, treeH);
  }

  // Ashlar rear wall with coping
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 44, LOGIC_WIDTH, 34);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 44, LOGIC_WIDTH, 2);

  // Arched recessed niches with dark depth
  for (let ax = 45; ax < LOGIC_WIDTH - 45; ax += 66) {
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(ax, 52, 14, 20);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(ax + 2, 54, 10, 18);
  }

  // Podium candles by camp windows / alcoves (up to 5 lit for each won podium tier)
  const CANDLE_ALCOVES = [
    [52, 68],
    [118, 68],
    [184, 68],
    [250, 68],
    [284, 68],
  ];
  CANDLE_ALCOVES.forEach(([cx, cy], cIdx) => {
    if (cIdx < podiumTierWon) {
      // Soft painterly warm ambient radial bloom replacing hard dithered rings
      drawSoftAmbientBloom(ctx, cx, cy - 4, 10, animTime, 0.75, cIdx * 1.3);
      // Bronze saucer dish
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(cx - 3, cy + 2, 6, 2);
      // Ivory wax pillar
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(cx - 1, cy - 3, 3, 5);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(cx - 2, cy, 1, 2);
      // Flickering flame pixel
      const flicker = (Math.floor(animTime * 14) + cIdx * 2) % 3;
      const fX = flicker === 0 ? 0 : flicker === 1 ? -1 : 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx, cy - 5, 1, 2);
      ctx.fillStyle = '#F7DEAA';
      ctx.fillRect(cx + fX, cy - 6, 1, 2);
      ctx.fillStyle = '#ba7654';
      ctx.fillRect(cx, cy - 7, 1, 1);
    }
  });

  // Pale alabaster courtyard floor
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 78, LOGIC_WIDTH, LOGIC_HEIGHT - 78);

  // Courtyard flagstone grid markings
  ctx.fillStyle = PALETTE[1];
  for (let fy = 88; fy < LOGIC_HEIGHT; fy += 14) {
    ctx.fillRect(0, fy, LOGIC_WIDTH, 1);
  }
  for (let fx = 18; fx < LOGIC_WIDTH - 18; fx += 28) {
    for (let fy = 88; fy < LOGIC_HEIGHT; fy += 14) {
      const stagger = (fy / 14) % 2 === 0 ? 0 : 14;
      ctx.fillRect(fx + stagger, fy, 1, 14);
    }
  }

  // Procedural 16-bit grass tufts scattered across camp courtyard ground
  const CAMP_GRASS_TUFTS = [
    [42, 94], [68, 118], [98, 102], [116, 142], [148, 96],
    [174, 126], [196, 106], [218, 146], [252, 118], [274, 94],
    [288, 128], [84, 162], [134, 156], [182, 166], [228, 160]
  ];
  CAMP_GRASS_TUFTS.forEach(([gx, gy]) => {
    ctx.fillStyle = PALETTE[8]; // olive sage green
    ctx.fillRect(gx, gy, 2, 2);
    ctx.fillRect(gx + 1, gy - 1, 1, 2);
    ctx.fillStyle = PALETTE[12]; // mossy olive drab
    ctx.fillRect(gx - 1, gy + 1, 3, 1);
  });

  // Perimeter stone framing walls
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 0, 18, LOGIC_HEIGHT);
  ctx.fillRect(LOGIC_WIDTH - 18, 0, 18, LOGIC_HEIGHT);
  ctx.fillStyle = PALETTE[6];
  ctx.fillRect(0, 0, 4, LOGIC_HEIGHT);
  ctx.fillRect(LOGIC_WIDTH - 4, 0, 4, LOGIC_HEIGHT);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(17, 0, 1, LOGIC_HEIGHT);
  ctx.fillRect(LOGIC_WIDTH - 18, 0, 1, LOGIC_HEIGHT);
}

export function drawCampCourtyardProps(
  ctx: CanvasRenderingContext2D,
  hoveredProp?: 'tent' | 'weaponRack' | 'dummy' | 'bell' | 'merchant' | 'stewardess' | 'visitor' | null,
  animTimer = 0,
  upgrades?: LudusUpgrades,
) {
  const tLvl = upgrades?.trainingGrounds || 0;
  const mLvl = upgrades?.medicalBay || 0;
  const bLvl = upgrades?.breedingPens || 0;

  // Bronze Trial Bell at Camp Bottom Right
  drawDitherShadow(ctx, 302, 178, 10, 3, PALETTE[5]);
  ctx.fillStyle = PALETTE[14]; // raw umber wood gallows post
  ctx.fillRect(298, 154, 4, 24);
  ctx.fillRect(298, 154, 12, 3);
  ctx.fillStyle = PALETTE[5]; // iron brace
  ctx.fillRect(298, 154, 4, 2);
  ctx.fillRect(302, 157, 2, 2);
  ctx.fillStyle = PALETTE[11]; // chain
  ctx.fillRect(307, 157, 1, 4);
  ctx.fillStyle = PALETTE[15]; // bronze bell dome
  ctx.fillRect(305, 161, 5, 4);
  ctx.fillRect(304, 165, 7, 3);
  ctx.fillStyle = PALETTE[0]; // bronze glint
  ctx.fillRect(306, 162, 2, 2);
  ctx.fillStyle = PALETTE[14]; // clapper
  ctx.fillRect(307, 168, 1, 2);

  // --------------------------------------------------------------------------
  // MEDICAL BAY UPGRADES: PROGRESSIVE DECORATIONS AROUND TENT (Levels 1, 2, 3)
  // --------------------------------------------------------------------------
  if (mLvl >= 1) {
    // Level 1: Medicinal vine leaves (#627d4d / #3e5a32) creeping subtly up camp wall & tent corner
    ctx.fillStyle = '#3e5a32'; // dark vine stem
    ctx.fillRect(34, 52, 1, 22);
    ctx.fillRect(35, 60, 4, 1);
    ctx.fillRect(38, 56, 1, 8);
    ctx.fillRect(42, 66, 1, 14);
    // Tendrils climbing left corner of tent
    ctx.fillRect(44, 72, 3, 1);
    ctx.fillRect(46, 70, 1, 8);
    // Leaves in #627d4d
    ctx.fillStyle = '#627d4d';
    ctx.fillRect(33, 54, 2, 2);
    ctx.fillRect(35, 58, 2, 2);
    ctx.fillRect(38, 62, 2, 2);
    ctx.fillRect(41, 68, 2, 2);
    ctx.fillRect(45, 71, 2, 2);
    ctx.fillRect(46, 75, 2, 2);
    ctx.fillStyle = '#88997a'; // sage leaf highlights
    ctx.fillRect(34, 55, 1, 1);
    ctx.fillRect(39, 63, 1, 1);
    ctx.fillRect(46, 72, 1, 1);
  }

  if (mLvl >= 2) {
    // Level 2: Expanded lush healing vines with medicinal flower buds, herb drying rack, and stone mortar
    // Additional lush climbing vines with red/white medicinal flower buds
    ctx.fillStyle = '#3e5a32';
    ctx.fillRect(26, 48, 1, 28);
    ctx.fillRect(27, 54, 6, 1);
    ctx.fillRect(31, 50, 1, 6);
    ctx.fillStyle = '#627d4d';
    ctx.fillRect(25, 50, 2, 2);
    ctx.fillRect(27, 53, 2, 2);
    ctx.fillRect(30, 49, 2, 2);
    // Medicinal flower buds (#9e4a42 red buds & #ded095 white buds)
    ctx.fillStyle = '#9e4a42'; // red flower bud
    ctx.fillRect(26, 52, 1, 1);
    ctx.fillRect(36, 58, 1, 1);
    ctx.fillRect(43, 66, 1, 1);
    ctx.fillStyle = '#ffffff'; // white flower bud
    ctx.fillRect(29, 49, 1, 1);
    ctx.fillRect(40, 61, 1, 1);

    // Herb drying rack by tent wall (x: 30, y: 70-78)
    drawDitherShadow(ctx, 32, 79, 6, 2, PALETTE[5]);
    ctx.fillStyle = '#7f644b'; // timber posts
    ctx.fillRect(28, 68, 2, 10);
    ctx.fillRect(36, 68, 2, 10);
    ctx.fillRect(27, 69, 11, 1); // horizontal hanging crossbar
    // Suspended hung dried herb bunches (#88997a, #ded095, #6f705a)
    ctx.fillStyle = '#88997a';
    ctx.fillRect(29, 70, 2, 4);
    ctx.fillRect(30, 74, 1, 2);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(32, 70, 2, 5);
    ctx.fillRect(33, 75, 1, 1);
    ctx.fillStyle = '#6f705a';
    ctx.fillRect(35, 70, 2, 4);

    // Stone mortar and pestle by tent wall (x: 43, y: 84)
    drawDitherShadow(ctx, 44, 87, 4, 1, PALETTE[5]);
    ctx.fillStyle = '#817475'; // limestone block
    ctx.fillRect(42, 83, 5, 4);
    ctx.fillStyle = '#ded095'; // pestle handle
    ctx.fillRect(44, 80, 1, 4);
    ctx.fillStyle = '#627d4d'; // ground green salve paste
    ctx.fillRect(43, 83, 3, 1);
  }

  if (mLvl >= 3) {
    // Level 3: Covered apothecary bench with clay salve amphorae, clean rolled linen bandages & dense ivy
    // Shaded bench table at (x: 23, y: 81)
    drawDitherShadow(ctx, 31, 88, 10, 2, PALETTE[5]);
    ctx.fillStyle = '#7f644b'; // wooden bench table
    ctx.fillRect(22, 80, 18, 7);
    ctx.fillRect(23, 87, 2, 2);
    ctx.fillRect(37, 87, 2, 2);
    // Bench canopy awning (#ded095 canvas with #7f644b posts)
    ctx.fillStyle = '#7f644b'; // slender posts
    ctx.fillRect(21, 68, 1, 14);
    ctx.fillRect(39, 68, 1, 14);
    ctx.fillStyle = '#ded095'; // awning roof
    ctx.fillRect(19, 67, 23, 3);
    ctx.fillStyle = '#ba7654'; // scallop valance
    ctx.fillRect(19, 70, 23, 1);
    // Dense climbing ivy along canopy frame
    ctx.fillStyle = '#3e5a32';
    ctx.fillRect(20, 66, 21, 1);
    ctx.fillStyle = '#627d4d';
    ctx.fillRect(21, 65, 3, 2);
    ctx.fillRect(28, 65, 4, 2);
    ctx.fillRect(36, 65, 3, 2);

    // Clay salve amphorae jars on table (#ba7654, #ded095)
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(24, 76, 3, 4);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(25, 75, 1, 1);
    ctx.fillStyle = '#ba7654';
    ctx.fillRect(28, 77, 3, 3);
    // Clean rolled linen bandages (#ffffff, #ded095)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(32, 78, 3, 2);
    ctx.fillRect(32, 77, 3, 1);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(35, 78, 3, 2);
  }

  // Camp Pavilion Tent
  const cx = 64;
  drawDitherShadow(ctx, cx, 99, 24, 4, PALETTE[5]);

  for (let y = 58; y <= 80; y++) {
    const progress = (y - 58) / 22;
    const halfW = Math.round(progress * 20);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(cx - halfW, y, cx - 2 - (cx - halfW), 1);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(cx - 2, y, 4, 1);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(cx + 2, y, halfW - 2, 1);
  }

  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cx - 20, 81, 14, 17);
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(cx + 6, 81, 14, 17);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(cx - 6, 81, 12, 17);

  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(cx - 1, 52, 2, 6);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(cx + 1, 50, 8, 4);

  // --------------------------------------------------------------------------
  // BREEDING PENS UPGRADES: COURTYARD ARBOR & LINEAGE STEWARDESS (Levels 1, 2)
  // --------------------------------------------------------------------------
  if (bLvl >= 1) {
    // Level 1: Fenced courtyard arbor with woven straw bedding beside tent (x: 84-110, y: 76-88)
    drawDitherShadow(ctx, 97, 88, 14, 3, PALETTE[5]);
    // Woven golden straw bedding inside arbor (#ded095, #cb9f6b, #ba7654)
    ctx.fillStyle = '#cb9f6b';
    ctx.fillRect(86, 78, 22, 9);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(88, 79, 18, 7);
    ctx.fillStyle = '#ba7654'; // woven straw cross-strands
    for (let sx = 89; sx < 104; sx += 4) {
      ctx.fillRect(sx, 81, 2, 1);
      ctx.fillRect(sx + 1, 83, 2, 1);
    }
    // Timber fence arbor posts & split rails (#7f644b, #cb9f6b)
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(84, 75, 2, 12);
    ctx.fillRect(108, 75, 2, 12);
    ctx.fillRect(96, 74, 2, 13);
    // Split fence rails
    ctx.fillStyle = '#cb9f6b';
    ctx.fillRect(84, 76, 26, 1);
    ctx.fillRect(84, 81, 26, 1);

    // Level 2 Breeding Pens addition: Decorative gilded laurel motifs accenting pen entryway
    if (bLvl >= 2) {
      ctx.fillStyle = '#ded095'; // gilded laurel crown on center arbor post
      ctx.fillRect(94, 71, 6, 3);
      ctx.fillRect(95, 70, 4, 1);
      ctx.fillStyle = '#9c8053';
      ctx.fillRect(96, 72, 2, 2);
    }

    // Spawn the female Lineage Stewardess NPC tending to records & lineage scrolls
    const isStewardessHovered = hoveredProp === 'stewardess';
    drawLineageStewardess(ctx, 96, 84, bLvl, animTimer, isStewardessHovered);
  }

  // --------------------------------------------------------------------------
  // TRAINING GROUNDS UPGRADES: PROGRESSIVE DECORATIONS AROUND DUMMY (Levels 1, 2, 3)
  // --------------------------------------------------------------------------
  if (tLvl >= 2) {
    // Level 2: Sand training ring bordered with rounded stones around Manikin
    // Circular sand clearing around (cx: 236, cy: 91, rx: 25, ry: 9)
    ctx.fillStyle = '#cb9f6b';
    ctx.fillRect(212, 85, 48, 12);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(215, 87, 42, 8);
    // Rounded stone border ring (#817475, #a4968d, #574b50)
    const stones = [
      [211, 90], [213, 85], [218, 83], [225, 82], [235, 82],
      [245, 82], [253, 84], [258, 87], [260, 92], [257, 96],
      [250, 97], [240, 98], [228, 98], [219, 97], [213, 94]
    ];
    stones.forEach(([sx, sy], idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#817475' : '#a4968d';
      ctx.fillRect(sx, sy, 3, 2);
      ctx.fillStyle = '#574b50';
      ctx.fillRect(sx + 1, sy + 1, 2, 1);
    });

    // Weapon rack filled with practice gladii and spears on right edge of sand pit (x: 262, y: 84)
    drawDitherShadow(ctx, 266, 92, 7, 2, PALETTE[5]);
    ctx.fillStyle = '#7f644b'; // rack uprights
    ctx.fillRect(261, 80, 2, 10);
    ctx.fillRect(270, 80, 2, 10);
    ctx.fillRect(259, 83, 14, 1);
    // Upright practice spears and gladii
    ctx.fillStyle = '#ded095'; // wooden practice spears
    ctx.fillRect(264, 72, 1, 18);
    ctx.fillRect(268, 73, 1, 17);
    ctx.fillStyle = '#a4968d'; // spear tips
    ctx.fillRect(264, 70, 1, 2);
    ctx.fillRect(268, 71, 1, 2);
    // Slanted gladii
    ctx.fillStyle = '#cb9f6b';
    ctx.fillRect(262, 80, 1, 8);
    ctx.fillRect(266, 81, 1, 7);
  }

  if (tLvl >= 3) {
    // Level 3: Dual training dummies, hanging sand punching bags, crossed iron weapons mounted above
    // Crossed iron weapons mounted on wall plaque above sand pit (x: 236, y: 64)
    ctx.fillStyle = '#7f644b'; // wooden mounting plaque
    ctx.fillRect(231, 60, 12, 9);
    ctx.fillStyle = '#9c8053'; // bronze rim
    ctx.strokeRect(231.5, 60.5, 11, 8);
    // Crossed iron gladii blades (#ded095, #a4968d)
    ctx.fillStyle = '#ded095';
    ctx.fillRect(229, 61, 16, 1);
    ctx.fillRect(229, 67, 16, 1);
    ctx.fillRect(235, 58, 4, 13);
    ctx.fillStyle = '#9e4a42'; // center crimson boss
    ctx.fillRect(235, 63, 4, 3);

    // Second Training Dummy at (x: 216, y: 86)
    drawDitherShadow(ctx, 216, 95, 7, 2, PALETTE[5]);
    ctx.fillStyle = PALETTE[14]; // post
    ctx.fillRect(215, 73, 3, 22);
    ctx.fillRect(210, 77, 13, 3); // arms
    ctx.fillStyle = PALETTE[1];  // straw body
    ctx.fillRect(212, 75, 9, 12);
    // Battered bronze practice skullcap helmet mounted on dummy head
    ctx.fillStyle = '#9c8053';
    ctx.fillRect(213, 70, 7, 4);
    ctx.fillStyle = '#ded095';
    ctx.fillRect(214, 69, 5, 1);

    // Hanging heavy sand punching bag (x: 274, y: 76)
    drawDitherShadow(ctx, 274, 94, 6, 2, PALETTE[5]);
    ctx.fillStyle = '#7f644b'; // timber gallows arm
    ctx.fillRect(271, 66, 8, 2);
    ctx.fillRect(278, 66, 2, 26);
    // Chain suspension
    ctx.fillStyle = '#a4968d';
    ctx.fillRect(273, 68, 1, 4);
    ctx.fillRect(275, 68, 1, 4);
    // Heavy cylinder leather sand punching bag (#cb9f6b, #7f644b)
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(271, 72, 6, 15);
    ctx.fillStyle = '#cb9f6b';
    ctx.fillRect(272, 73, 4, 13);
    ctx.fillStyle = '#3f363b'; // iron reinforcing bands
    ctx.fillRect(271, 76, 6, 1);
    ctx.fillRect(271, 82, 6, 1);
  }

  // Wooden Training Dummy / Manikin (Primary)
  drawDitherShadow(ctx, 237, 98, 8, 2, PALETTE[5]);
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(236, 74, 3, 24);
  ctx.fillRect(230, 78, 15, 3);
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(233, 76, 9, 13);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(244, 78, 4, 6);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(245, 79, 2, 4);

  // Level 1 Training Grounds: Extra practice swords and wooden shields leaning against Manikin post
  if (tLvl >= 1) {
    // Wooden gladius leaning against left post base
    ctx.fillStyle = '#cb9f6b'; // blade
    ctx.fillRect(231, 88, 2, 10);
    ctx.fillStyle = '#7f644b'; // hilt
    ctx.fillRect(230, 85, 4, 2);
    ctx.fillRect(231, 83, 2, 2);
    // Wooden sword leaning against right post base
    ctx.fillStyle = '#cb9f6b';
    ctx.fillRect(240, 89, 2, 9);
    ctx.fillStyle = '#7f644b';
    ctx.fillRect(239, 86, 4, 2);
    // Round wooden shield propped against post base
    ctx.fillStyle = '#574b50'; // iron rim
    ctx.fillRect(232, 92, 10, 6);
    ctx.fillStyle = '#ba7654'; // wood planks
    ctx.fillRect(233, 93, 8, 4);
    ctx.fillStyle = '#ded095'; // center boss
    ctx.fillRect(236, 94, 2, 2);
  }

  // Weapon Rack
  drawDitherShadow(ctx, 175, 90, 12, 2, PALETTE[5]);
  ctx.fillStyle = PALETTE[14];
  ctx.fillRect(168, 80, 2, 8);
  ctx.fillRect(182, 80, 2, 8);
  ctx.fillRect(166, 82, 18, 2);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(170, 77, 1, 9);
  ctx.fillRect(174, 76, 1, 10);
  ctx.fillRect(178, 77, 1, 9);
}
