// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {WEAPON_DATABASE} from '../../data/weapons';
import {drawCorpseFlies, drawDitherShadow} from '../primitives';
import {drawCavalrySprite} from './cavalry';
import {drawElephantSprite} from './elephant';
import {drawEmperorBossSprite} from './emperorBoss';
import type {Culture} from '../../types';

// ============================================================================
// DISTINCT VISUALS FOR THE 5 CULTURAL GLADIATORS
// Explicit leftHand and rightHand anchors, consistent walk animations, subtle foot shadows.
// Strict 16-color antiquity palette preserved from art-snapshot-v1.
// Supports: idle, walking, sparring, resting, attack, hurt, pinned, pinning, death, flashWhite.
// ============================================================================

export function drawCulturalGladiator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  culture: Culture,
  state: 'idle' | 'walking' | 'sparring' | 'resting' | 'sitting' | 'attack' | 'hurt' | 'pinned' | 'pinning' | 'death',
  flipX: boolean,
  animTimer: number,
  flashWhiteTimer = 0,
  deathTimer = 0,
  rageTimer = 0,
  level = 1,
  equipped?: { rightHand: string | null; leftHand: string | null },
  isCavalry = false,
  isElephant = false,
  isCharging = false,
  stunTimer = 0,
  isEmperor = false,
  heroType?: 'beastmaster' | 'saladin' | 'zuzubu',
  executionStance?: { isExecutioner: boolean; strikeProgress: number },
  isDead = false,
) {
  const isProneOrDying = isDead || state === 'death';
  const effectiveState = isProneOrDying ? 'death' : state;
  const effectiveCharging = isProneOrDying ? false : isCharging;
  const effectiveStun = isProneOrDying ? 0 : stunTimer;

  // If Emperor Boss unit, render with majestic imperial purple and gold regalia
  if (isEmperor) {
    drawEmperorBossSprite(
      ctx,
      x,
      y,
      effectiveState,
      flipX,
      animTimer,
      flashWhiteTimer,
      deathTimer,
      rageTimer,
    );
    return;
  }
  // If this unit is a War Elephant, render massive colossal 16-bit blocky elephant sprite
  if (isElephant) {
    drawElephantSprite(
      ctx,
      x,
      y,
      effectiveState,
      flipX,
      animTimer,
      flashWhiteTimer,
      deathTimer,
      rageTimer,
      level,
      effectiveCharging,
    );
    return;
  }

  // If this unit is a cavalry combatant, render as unified 16-bit rider + steed unit
  if (isCavalry) {
    drawCavalrySprite(
      ctx,
      x,
      y,
      culture,
      effectiveState,
      flipX,
      animTimer,
      flashWhiteTimer,
      deathTimer,
      rageTimer,
      level,
      effectiveCharging,
    );
    return;
  }

  ctx.save();
  ctx.translate(Math.round(x || 0), Math.round(y || 0));
  if (flipX) {
    ctx.scale(-1, 1);
  }

  const safeAnim = animTimer || 0;
  const clampedLvl = Math.max(1, Math.min(5, Math.round(level || 1)));

  // 1. UNCONDITIONAL FALLEN PRONE / COLLAPSED DEATH STATE (Absolute Precedence)
  if (isProneOrDying && deathTimer <= 0) {
    drawDitherShadow(ctx, 0, 1, 14, 3, PALETTE[5]);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-12, -2, 8, 2);
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-10, -2, 4, 1);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-5, -5, 10, 4);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(4, -6, 5, 5);
    // Blood stain on sand
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-2, -1, 6, 2);
    // Small flashing/buzzing fly particles around fallen body
    drawCorpseFlies(ctx, 0, -3, safeAnim, Math.abs(Math.round(x * 7 + y * 13)));
    ctx.restore();
    return;
  }

  // 2. DRAMATIC SLOW-FALL ANIMATION (During fatal blow sequence)
  if (isProneOrDying && deathTimer > 0) {
    const fallProgress = 1 - deathTimer / 1.6; // 0 to 1
    const rot = (fallProgress * Math.PI) / 2.2; // tilts backward
    ctx.rotate(flipX ? -rot : rot);
  }

  // Stunned / Knockdown Prone State (Only if ALIVE!)
  if (!isProneOrDying && effectiveStun > 0) {
    drawDitherShadow(ctx, 0, 1, 14, 3, PALETTE[5]);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-12, -2, 8, 2);
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-10, -2, 4, 1);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-5, -5, 10, 4);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(4, -6, 5, 5);
    // Dizzy spinning stars overhead
    const starCycle = safeAnim * 8;
    for (let s = 0; s < 3; s++) {
      const angle = starCycle + (s * Math.PI * 2) / 3;
      const sx = Math.cos(angle) * 8;
      const sy = -14 + Math.sin(angle) * 3;
      ctx.fillStyle = PALETTE[0]; // gleaming gold star
      ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(Math.round(sx) + 1, Math.round(sy) + 1, 1, 1);
    }
    ctx.restore();
    return;
  }

  // Level V Legend: subtle radiating golden pixels (Only if living)
  if (!isProneOrDying && clampedLvl >= 5) {
    const glowSeed = Math.floor(safeAnim * 10);
    const glowCoords = [
      [-7, -31], [7, -30], [-8, -17], [8, -15], [-6, -5], [6, -4], [0, -35], [5, -22], [-5, -23]
    ];
    ctx.fillStyle = PALETTE[0]; // gleaming white-hot gold
    for (let i = 0; i < glowCoords.length; i++) {
      if ((glowSeed + i) % 3 === 0) {
        ctx.fillRect(glowCoords[i][0], glowCoords[i][1], 1, 1);
      }
    }
  }

  // Pulsating red RAGE aura (Only if living)
  if (!isProneOrDying && rageTimer > 0) {
    const pulse = 1 + 0.3 * Math.sin(safeAnim * 16);
    drawDitherShadow(ctx, 0, -12, 13 * pulse, 17 * pulse, PALETTE[3]);
  }

  // Frame counter for 30 FPS timing
  const frame30 = Math.floor(safeAnim * 30);
  const isWhiteFlash = flashWhiteTimer > 0;
  const isRedFlash = state === 'pinned' && frame30 % 2 === 0;

  // Pinned struggling shake effect (victim being pinned only - pinning attacker remains steady)
  if (state === 'pinned') {
    const pinnedShakeX = frame30 % 2 === 0 ? 1 : -1;
    const pinnedShakeY = Math.floor(frame30 / 2) % 2 === 0 ? 1 : -1;
    ctx.translate(pinnedShakeX, pinnedShakeY);
  }

  // Relaxed sitting pose on dirt / camp bench
  if (state === 'sitting') {
    drawDitherShadow(ctx, 0, 1, 9, 3, PALETTE[5]);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-7, -4, 14, 3);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-6, -1, 2, 2);
    ctx.fillRect(4, -1, 2, 2);

    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14];
    ctx.fillRect(-5, -8, 10, 5);
    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[4] : (clampedLvl >= 2 ? PALETTE[15] : PALETTE[14]);
    ctx.fillRect(-4, -6, 8, 3);

    const sitTorsoY = -16;
    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : (clampedLvl >= 3 ? PALETTE[15] : PALETTE[14]);
    ctx.fillRect(-4, sitTorsoY, 8, 8);
    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[1];
    ctx.fillRect(-2, sitTorsoY + 1, 4, 4);

    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[1];
    ctx.fillRect(-5, sitTorsoY + 4, 2, 5);
    ctx.fillRect(3, sitTorsoY + 4, 2, 5);

    const sitHeadY = -23;
    ctx.fillStyle = isWhiteFlash ? PALETTE[0] : PALETTE[1];
    ctx.fillRect(-3, sitHeadY + 2, 6, 5);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(0, sitHeadY + 3, 2, 1);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(-3, sitHeadY, 6, 2);

    ctx.restore();
    return;
  }

  // Foot shadow
  drawDitherShadow(ctx, 0, 1, 7, 2, PALETTE[5]);

  let lungeX = 0;
  if (state === 'attack' || state === 'sparring' || state === 'pinning') {
    lungeX = 4;
  } else if (state === 'hurt') {
    lungeX = -3;
  } else if (state === 'pinned') {
    lungeX = 0;
  } else if (state === 'walking') {
    lungeX = Math.round(Math.sin(animTimer * 9) * 1.2);
  }

  // STRICT ANCHORS DEFINITION:
  // Hip / Legs: hipY = -12
  // Left foot anchor: (lungeX - 2 - walkStride, hipY + 6)
  // Right foot anchor: (lungeX + 1 + walkStride, hipY + 6)
  // Torso: torsoY = -21
  // Head: headY = -28
  // Left hand anchor: (lungeX - 5, torsoY + 4)
  // Right hand anchor: (lungeX + 3, torsoY + 2)
  const hipY = -12;
  const torsoY = -21;
  const headY = -28;

  // 1. LEGS & GREAVES (EVOLVES PER LEVEL - STRICT FOOT ANCHOR MAINTAINED)
  const walkStride = state === 'walking' ? Math.round(Math.sin(animTimer * 12) * 2) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14];
  ctx.fillRect(lungeX - 2 - walkStride, hipY, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY, 2, 6);

  // Greaves / boots evolution based on level:
  // Level 1: Basic leather wraps. Level 2+: Bronze greaves. Level 4+: Gilded greaves & knee cops.
  if (isWhiteFlash) {
    ctx.fillStyle = PALETTE[0];
  } else if (isRedFlash) {
    ctx.fillStyle = PALETTE[4];
  } else if (clampedLvl >= 4) {
    ctx.fillStyle = PALETTE[15]; // Ornate bronze greaves
  } else if (clampedLvl >= 2) {
    ctx.fillStyle = culture === 'roman' || culture === 'hunnic' ? PALETTE[15] : PALETTE[10];
  } else {
    ctx.fillStyle = PALETTE[14]; // Level 1 basic leather wraps
  }
  ctx.fillRect(lungeX - 2 - walkStride, hipY + 6, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY + 6, 2, 6);

  // Level 3+ Greave knee caps and Level 4+ Gold trim
  if (!isWhiteFlash && !isRedFlash && clampedLvl >= 3) {
    ctx.fillStyle = clampedLvl >= 4 ? PALETTE[0] : PALETTE[15];
    ctx.fillRect(lungeX - 2 - walkStride, hipY + 5, 2, 1);
    ctx.fillRect(lungeX + 1 + walkStride, hipY + 5, 2, 1);
  }

  // 2. TORSO & ARMOR (EVOLVES PER LEVEL AND CULTURE, OR UNIQUE HERO SPRITES)
  if (isWhiteFlash) {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
  } else if (isRedFlash) {
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[4];
    ctx.fillRect(lungeX - 3, torsoY + 2, 6, 2);
    ctx.fillRect(lungeX - 3, torsoY + 6, 6, 2);
  } else if (heroType === 'beastmaster') {
    // BEASTMASTER: Raw umber leather tunic, furred animal pelt pauldron on left shoulder, bone charms across chest
    ctx.fillStyle = PALETTE[14]; // raw umber hide vest
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[1]; // bare chest reveal
    ctx.fillRect(lungeX - 1, torsoY + 1, 3, 4);
    // Ivory bone charms / fang necklace
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 3, torsoY + 2, 1, 2);
    ctx.fillRect(lungeX + 2, torsoY + 2, 1, 2);
    ctx.fillRect(lungeX - 1, torsoY + 4, 2, 2);
    // Furred pelt pauldron on left shoulder
    ctx.fillStyle = PALETTE[14]; // fur base
    ctx.fillRect(lungeX - 6, torsoY - 2, 3, 6);
    ctx.fillStyle = PALETTE[1];  // tan fur tufts
    ctx.fillRect(lungeX - 7, torsoY - 1, 2, 4);
    ctx.fillRect(lungeX - 5, torsoY + 3, 2, 2);
    // Leather belt with iron studs
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 1, torsoY + 7, 2, 2);
  } else if (heroType === 'saladin') {
    // SALADIN THE MEDIC: Desert tunic with emerald sage herbalist sashes and apothecary pouches
    ctx.fillStyle = PALETTE[0]; // pale linen tunic
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    // Emerald sage herbalist sashes crossed across chest (#55796f)
    ctx.fillStyle = PALETTE[7];
    ctx.fillRect(lungeX - 3, torsoY + 1, 6, 2);
    ctx.fillRect(lungeX - 2, torsoY + 3, 5, 2);
    ctx.fillRect(lungeX - 4, torsoY + 5, 8, 2);
    // Leather apothecary satchel & potion vial on hip
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 5, torsoY + 6, 2, 3);
    ctx.fillStyle = PALETTE[8]; // green healing vial
    ctx.fillRect(lungeX + 3, torsoY + 6, 2, 3);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX + 3, torsoY + 5, 1, 1);
  } else if (heroType === 'zuzubu') {
    // ZUZUBU: Tall muscular Ethiopian warrior, spotted leopard skin loincloth, bronze torc
    ctx.fillStyle = PALETTE[5]; // dark muscular athletic skin tone (#3f363b)
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[9]; // pectoral contour
    ctx.fillRect(lungeX - 3, torsoY + 2, 2, 3);
    ctx.fillRect(lungeX + 1, torsoY + 2, 2, 3);
    // Polished bronze torc around neck
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, torsoY - 1, 6, 2);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 1, torsoY - 1, 2, 1);
    // SPOTTED LEOPARD SKIN LOINCLOTH (#cb9f6b sand ochre base with dark rosettes #3f363b)
    ctx.fillStyle = PALETTE[1]; // leopard base
    ctx.fillRect(lungeX - 4, torsoY + 6, 8, 4);
    // Leopard dark spots / rosettes
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 3, torsoY + 7, 2, 1);
    ctx.fillRect(lungeX + 1, torsoY + 7, 1, 2);
    ctx.fillRect(lungeX - 1, torsoY + 8, 2, 1);
    ctx.fillRect(lungeX + 2, torsoY + 9, 2, 1);
  } else if (culture === 'roman') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Bare chest / simple leather tunic
      ctx.fillStyle = PALETTE[1]; // bare chest skin
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[14]; // raw umber leather kilt
      ctx.fillRect(lungeX - 4, torsoY + 6, 8, 3);
      ctx.fillStyle = PALETTE[5]; // thin leather belt
      ctx.fillRect(lungeX - 3, torsoY + 5, 6, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Bronze pectoral disc over tunic
      ctx.fillStyle = PALETTE[3]; // crimson sub-tunic
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[15]; // bronze pectoral plate
      ctx.fillRect(lungeX - 2, torsoY + 1, 5, 5);
      ctx.fillStyle = PALETTE[0]; // bronze glint
      ctx.fillRect(lungeX, torsoY + 2, 2, 2);
      ctx.fillStyle = PALETTE[14]; // leather belt
      ctx.fillRect(lungeX - 3, torsoY + 7, 6, 2);
    } else if (clampedLvl === 3) {
      // Level III (Centurion): Segmented lorica segmentata plate & brass bands
      ctx.fillStyle = PALETTE[5]; // dark iron
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[15]; // bronze bands
      ctx.fillRect(lungeX - 4, torsoY + 2, 8, 1);
      ctx.fillRect(lungeX - 4, torsoY + 5, 8, 1);
      ctx.fillStyle = PALETTE[1]; // ochre belt
      ctx.fillRect(lungeX - 3, torsoY + 7, 6, 2);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Heavy decorated bronze cuirass with banded shoulder pauldrons
      ctx.fillStyle = PALETTE[15]; // bronze cuirass
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[5]; // muscle contours & dark trim
      ctx.fillRect(lungeX - 2, torsoY + 2, 4, 4);
      ctx.fillStyle = PALETTE[0]; // golden specular
      ctx.fillRect(lungeX - 3, torsoY + 1, 2, 2);
      ctx.fillRect(lungeX + 1, torsoY + 1, 2, 2);
      // Banded pauldrons
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 6, torsoY - 1, 2, 4);
      ctx.fillRect(lungeX + 4, torsoY - 1, 2, 4);
      ctx.fillStyle = PALETTE[3]; // crimson pteruges
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else {
      // Level V (Legend): Masterwork gilded lorica, double winged pauldrons, glowing gold gorget
      ctx.fillStyle = PALETTE[15]; // golden plate
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // gleaming masterwork gold
      ctx.fillRect(lungeX - 3, torsoY + 1, 6, 5);
      ctx.fillStyle = PALETTE[3]; // imperial crimson sash
      ctx.fillRect(lungeX - 3, torsoY + 3, 6, 2);
      // Gilded winged pauldrons
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 6, torsoY - 2, 3, 5);
      ctx.fillRect(lungeX + 4, torsoY - 2, 3, 5);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY - 1, 2, 3);
      ctx.fillRect(lungeX + 4, torsoY - 1, 2, 3);
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    }
  } else if (culture === 'celt') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Bare chest with woad paint, simple kilt
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[7]; // woad
      ctx.fillRect(lungeX - 3, torsoY + 2, 6, 2);
      ctx.fillStyle = PALETTE[14]; // rough kilt
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 3);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Bare chest with woad, bronze torc, terracotta kilt
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[7];
      ctx.fillRect(lungeX - 3, torsoY + 2, 6, 2);
      ctx.fillRect(lungeX - 1, torsoY + 4, 3, 2);
      ctx.fillStyle = PALETTE[2];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 3);
      ctx.fillStyle = PALETTE[15]; // bronze torc
      ctx.fillRect(lungeX - 2, torsoY - 1, 4, 1);
    } else if (clampedLvl === 3) {
      // Level III (Warmaster): Bronze pectoral plate over woad, thick gold torc
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[15]; // bronze pectoral
      ctx.fillRect(lungeX - 3, torsoY + 1, 6, 5);
      ctx.fillStyle = PALETTE[0]; // gold torc
      ctx.fillRect(lungeX - 3, torsoY - 1, 6, 2);
      ctx.fillStyle = PALETTE[7]; // woad arms
      ctx.fillRect(lungeX - 4, torsoY + 6, 2, 2);
      ctx.fillRect(lungeX + 2, torsoY + 6, 2, 2);
      ctx.fillStyle = PALETTE[2];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 3);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Chainmail hauberk, bronze pauldrons, heavy torc
      ctx.fillStyle = PALETTE[6]; // iron chainmail
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[11]; // steel ring glint
      ctx.fillRect(lungeX - 3, torsoY + 2, 6, 4);
      ctx.fillStyle = PALETTE[15]; // heavy gold torc
      ctx.fillRect(lungeX - 3, torsoY - 1, 6, 2);
      // Bronze shoulder plates
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 6, torsoY, 2, 4);
      ctx.fillRect(lungeX + 4, torsoY, 2, 4);
      ctx.fillStyle = PALETTE[14]; // heavy belt
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else {
      // Level V (Legend): Masterwork gold ringmail, royal tartan mantle, radiant gold torc
      ctx.fillStyle = PALETTE[15]; // gold ringmail
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // gilded rings
      ctx.fillRect(lungeX - 3, torsoY + 2, 6, 4);
      ctx.fillStyle = PALETTE[4]; // royal tartan mantle
      ctx.fillRect(lungeX - 5, torsoY - 1, 3, 5);
      ctx.fillRect(lungeX + 3, torsoY - 1, 3, 5);
      ctx.fillStyle = PALETTE[0]; // radiant torc
      ctx.fillRect(lungeX - 3, torsoY - 2, 6, 2);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    }
  } else if (culture === 'berber') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Simple desert sand tunic
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 3, torsoY, 7, 9);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 3, torsoY + 6, 7, 2);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Sand tunic & burgundy sash with leather strap
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 3, torsoY, 7, 9);
      ctx.fillStyle = PALETTE[4]; // wine sash
      ctx.fillRect(lungeX - 3, torsoY + 5, 7, 3);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 2, torsoY + 1, 5, 2);
      ctx.fillStyle = PALETTE[15]; // bronze medallion
      ctx.fillRect(lungeX - 1, torsoY + 2, 2, 2);
    } else if (clampedLvl === 3) {
      // Level III (Chieftain): Bronze scale brigandine vest over tunic
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 3, torsoY, 7, 9);
      ctx.fillStyle = PALETTE[15]; // bronze scales
      ctx.fillRect(lungeX - 3, torsoY + 1, 7, 5);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX - 2, torsoY + 2, 5, 1);
      ctx.fillRect(lungeX - 2, torsoY + 4, 5, 1);
      ctx.fillStyle = PALETTE[4];
      ctx.fillRect(lungeX - 3, torsoY + 6, 7, 2);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Polished bronze cuirass with solar disc & shoulder scales
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // solar disc
      ctx.fillRect(lungeX - 1, torsoY + 2, 3, 3);
      ctx.fillStyle = PALETTE[15]; // shoulder flaps
      ctx.fillRect(lungeX - 5, torsoY, 2, 4);
      ctx.fillRect(lungeX + 4, torsoY, 2, 4);
      ctx.fillStyle = PALETTE[4];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else {
      // Level V (Legend): Masterwork gilded desert cuirass, royal purple sash, gold pauldrons
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // gilded filigree
      ctx.fillRect(lungeX - 3, torsoY + 1, 6, 5);
      ctx.fillStyle = PALETTE[4]; // royal purple sash
      ctx.fillRect(lungeX - 3, torsoY + 5, 6, 2);
      ctx.fillStyle = PALETTE[0]; // winged gold pauldrons
      ctx.fillRect(lungeX - 6, torsoY - 1, 3, 4);
      ctx.fillRect(lungeX + 4, torsoY - 1, 3, 4);
    }
  } else if (culture === 'scythian') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Plain sage tunic
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(lungeX - 3, torsoY, 7, 9);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 2, torsoY + 6, 5, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Sage kaftan with bronze clasps & mossy trim
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(lungeX - 3, torsoY, 7, 9);
      ctx.fillStyle = PALETTE[12];
      ctx.fillRect(lungeX - 1, torsoY, 2, 9);
      ctx.fillStyle = PALETTE[15]; // bronze discs
      ctx.fillRect(lungeX - 1, torsoY + 2, 2, 2);
      ctx.fillRect(lungeX - 1, torsoY + 5, 2, 2);
    } else if (clampedLvl === 3) {
      // Level III (Warmaster): Iron & bronze scale cuirass
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(lungeX - 3, torsoY, 7, 9);
      ctx.fillStyle = PALETTE[5]; // iron scales
      ctx.fillRect(lungeX - 3, torsoY + 1, 7, 5);
      ctx.fillStyle = PALETTE[15]; // bronze scale accents
      ctx.fillRect(lungeX - 2, torsoY + 2, 5, 1);
      ctx.fillRect(lungeX - 2, torsoY + 4, 5, 1);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 3, torsoY + 7, 7, 2);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Heavy fish-scale armor, decorated bronze gorget, curved shoulder guards
      ctx.fillStyle = PALETTE[15]; // bronze scale cuirass
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // gold specular
      ctx.fillRect(lungeX - 2, torsoY + 2, 4, 3);
      ctx.fillStyle = PALETTE[15]; // shoulder guards
      ctx.fillRect(lungeX - 5, torsoY, 2, 4);
      ctx.fillRect(lungeX + 4, torsoY, 2, 4);
      ctx.fillStyle = PALETTE[3]; // crimson belt
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else {
      // Level V (Legend): Masterwork golden kurgan scale coat with stag pectoral & radiant pauldrons
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // radiant gold scales
      ctx.fillRect(lungeX - 3, torsoY + 1, 6, 6);
      ctx.fillStyle = PALETTE[3]; // stag pectoral accent
      ctx.fillRect(lungeX - 1, torsoY + 2, 2, 2);
      ctx.fillStyle = PALETTE[0]; // gilded curved pauldrons
      ctx.fillRect(lungeX - 6, torsoY - 1, 3, 5);
      ctx.fillRect(lungeX + 4, torsoY - 1, 3, 5);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    }
  } else {
    // Hunnic:
    if (clampedLvl === 1) {
      // Level I (Recruit): Animal pelt coat
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX - 3, torsoY + 6, 6, 2);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Hardened leather coat with iron studs
      ctx.fillStyle = PALETTE[9];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[11]; // iron studs
      ctx.fillRect(lungeX - 2, torsoY + 2, 1, 1);
      ctx.fillRect(lungeX + 1, torsoY + 2, 1, 1);
      ctx.fillRect(lungeX - 2, torsoY + 4, 1, 1);
      ctx.fillRect(lungeX + 1, torsoY + 4, 1, 1);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else if (clampedLvl === 3) {
      // Level III (Warmaster): Dark iron lamellar plates
      ctx.fillStyle = PALETTE[9];
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[5]; // dark iron lamellar
      ctx.fillRect(lungeX - 3, torsoY + 1, 6, 3);
      ctx.fillRect(lungeX - 3, torsoY + 5, 6, 3);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Reinforced iron lamellar, bronze rivets, studded shoulder guards
      ctx.fillStyle = PALETTE[5]; // blackened iron
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[15]; // bronze rivets
      ctx.fillRect(lungeX - 2, torsoY + 2, 1, 1);
      ctx.fillRect(lungeX + 1, torsoY + 2, 1, 1);
      ctx.fillRect(lungeX - 2, torsoY + 5, 1, 1);
      ctx.fillRect(lungeX + 1, torsoY + 5, 1, 1);
      // Studded shoulder guards
      ctx.fillStyle = PALETTE[9];
      ctx.fillRect(lungeX - 5, torsoY, 2, 4);
      ctx.fillRect(lungeX + 4, torsoY, 2, 4);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 1, 1, 1);
      ctx.fillRect(lungeX + 5, torsoY + 1, 1, 1);
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
    } else {
      // Level V (Legend): Masterwork warlord dread armor, golden wolf gorget, spiked pauldrons
      ctx.fillStyle = PALETTE[5]; // blackened steel
      ctx.fillRect(lungeX - 4, torsoY, 8, 9);
      ctx.fillStyle = PALETTE[0]; // gold wolf gorget
      ctx.fillRect(lungeX - 3, torsoY + 1, 6, 3);
      ctx.fillStyle = PALETTE[15]; // golden rivets
      ctx.fillRect(lungeX - 3, torsoY + 4, 6, 3);
      // Spiked golden pauldrons
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 6, torsoY - 1, 3, 5);
      ctx.fillRect(lungeX + 4, torsoY - 1, 3, 5);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 7, torsoY, 1, 2);
      ctx.fillRect(lungeX + 7, torsoY, 1, 2);
    }
  }

  // 3. HEAD & HELMET (EVOLVES PER LEVEL AND CULTURE, OR UNIQUE HERO SPRITES)
  if (isWhiteFlash) {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
  } else if (isRedFlash) {
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX, headY + 3, 2, 1);
  } else if (heroType === 'beastmaster') {
    // Beastmaster head: wild shaggy hair, animal tooth headband, face warpaint
    ctx.fillStyle = PALETTE[1]; // skin
    ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
    ctx.fillStyle = PALETTE[14]; // wild shaggy dark brown hair
    ctx.fillRect(lungeX - 4, headY, 8, 3);
    ctx.fillRect(lungeX - 4, headY + 2, 2, 4);
    // Leather headband with predator teeth
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 3, headY + 1, 6, 1);
    ctx.fillStyle = PALETTE[0]; // teeth
    ctx.fillRect(lungeX - 2, headY, 1, 2);
    ctx.fillRect(lungeX + 1, headY, 1, 2);
    ctx.fillStyle = PALETTE[3]; // crimson cheek warpaint
    ctx.fillRect(lungeX - 2, headY + 4, 1, 2);
    ctx.fillRect(lungeX + 2, headY + 4, 1, 2);
    ctx.fillStyle = PALETTE[5]; // eyes
    ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
  } else if (heroType === 'saladin') {
    // Saladin the Medic: Elegant desert turban with emerald green jewel clasp
    ctx.fillStyle = PALETTE[0]; // white linen turban
    ctx.fillRect(lungeX - 4, headY - 2, 8, 6);
    ctx.fillStyle = PALETTE[1]; // turban shadow folds
    ctx.fillRect(lungeX - 3, headY - 1, 6, 2);
    // Emerald jewel clasp at forehead center
    ctx.fillStyle = PALETTE[7]; // emerald
    ctx.fillRect(lungeX - 1, headY - 1, 2, 2);
    ctx.fillStyle = PALETTE[0]; // glint
    ctx.fillRect(lungeX, headY - 1, 1, 1);
    ctx.fillStyle = PALETTE[1]; // face skin
    ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
    ctx.fillStyle = PALETTE[9]; // trimmed philosopher beard
    ctx.fillRect(lungeX - 2, headY + 6, 5, 2);
    ctx.fillStyle = PALETTE[5]; // eyes
    ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
  } else if (heroType === 'zuzubu') {
    // Zuzubu: Ethiopian champion head, close cropped dark hair, fierce eyes, bronze browband
    ctx.fillStyle = PALETTE[5]; // dark skin tone
    ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(lungeX - 3, headY, 6, 3);
    // Bronze browband
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, headY + 1, 6, 1);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX, headY + 1, 2, 1);
    // Piercing eyes
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX + 1, headY + 3, 2, 1);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
  } else if (culture === 'roman') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Bare head / simple leather browband, open face
      ctx.fillStyle = PALETTE[1]; // skin
      ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
      ctx.fillStyle = PALETTE[9]; // dark hair
      ctx.fillRect(lungeX - 3, headY, 6, 2);
      ctx.fillStyle = PALETTE[14]; // leather band
      ctx.fillRect(lungeX - 3, headY + 2, 6, 1);
      ctx.fillStyle = PALETTE[5]; // eyes
      ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Open bronze helmet with simple low ridge
      ctx.fillStyle = PALETTE[15]; // bronze helmet
      ctx.fillRect(lungeX - 3, headY - 1, 6, 5);
      ctx.fillStyle = PALETTE[5]; // ridge
      ctx.fillRect(lungeX - 1, headY - 3, 3, 2);
      ctx.fillStyle = PALETTE[1]; // open face
      ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 3) {
      // Level III (Centurion): Cheek-guarded bronze helm, small crimson crest
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 3, headY, 6, 7);
      ctx.fillStyle = PALETTE[5]; // visor slit
      ctx.fillRect(lungeX, headY + 3, 3, 1);
      // Crimson crest
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 2, headY - 4, 5, 4);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 1, headY - 5, 3, 1);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Heavy murmillo helmet, face grille, tall ornate crest
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, headY - 1, 8, 8);
      ctx.fillStyle = PALETTE[5]; // face grate
      ctx.fillRect(lungeX, headY + 2, 3, 3);
      // Tall ornate crest
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 3, headY - 6, 7, 5);
      ctx.fillStyle = PALETTE[0]; // gilded crest ridge
      ctx.fillRect(lungeX - 2, headY - 7, 5, 2);
    } else {
      // Level V (Legend): Masterwork gilded murmillo helm, triple plumes (crimson/gold/white)
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, headY - 1, 8, 8);
      ctx.fillStyle = PALETTE[0]; // gilded face grille & laurel
      ctx.fillRect(lungeX - 4, headY + 1, 8, 1);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX, headY + 2, 3, 3);
      // Triple gilded plumes
      ctx.fillStyle = PALETTE[3]; // crimson center plume
      ctx.fillRect(lungeX - 2, headY - 8, 5, 7);
      ctx.fillStyle = PALETTE[15]; // left & right gold plumes
      ctx.fillRect(lungeX - 5, headY - 6, 3, 5);
      ctx.fillRect(lungeX + 3, headY - 6, 3, 5);
      ctx.fillStyle = PALETTE[0]; // radiant white-hot tips
      ctx.fillRect(lungeX - 2, headY - 9, 5, 2);
      ctx.fillRect(lungeX - 5, headY - 7, 2, 2);
      ctx.fillRect(lungeX + 4, headY - 7, 2, 2);
    }
  } else if (culture === 'celt') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Wild hair, simple rope band
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
      ctx.fillStyle = PALETTE[15]; // wild hair
      ctx.fillRect(lungeX - 3, headY, 6, 3);
      ctx.fillRect(lungeX - 4, headY + 2, 2, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Bronze brow band over hair
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 3, headY - 1, 6, 3);
      ctx.fillStyle = PALETTE[0]; // bronze brow band
      ctx.fillRect(lungeX - 3, headY + 1, 6, 1);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
    } else if (clampedLvl === 3) {
      // Level III (Warmaster): Conical bronze helmet with cheek flaps
      ctx.fillStyle = PALETTE[15]; // bronze helmet
      ctx.fillRect(lungeX - 3, headY, 6, 4);
      ctx.fillRect(lungeX - 2, headY - 3, 4, 3);
      ctx.fillStyle = PALETTE[1]; // face
      ctx.fillRect(lungeX - 2, headY + 4, 5, 3);
      ctx.fillStyle = PALETTE[15]; // cheek flaps
      ctx.fillRect(lungeX - 3, headY + 3, 1, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Horned bronze war-helmet
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 3, headY - 1, 6, 5);
      // Twin horns
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 5, headY - 5, 2, 4);
      ctx.fillRect(lungeX + 4, headY - 5, 2, 4);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, headY - 2, 2, 2);
      ctx.fillRect(lungeX + 3, headY - 2, 2, 2);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 4, 5, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else {
      // Level V (Legend): Masterwork winged crown-helm with triple gilded horns
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 3, headY - 2, 6, 6);
      ctx.fillStyle = PALETTE[0]; // crown ridge
      ctx.fillRect(lungeX - 3, headY - 4, 6, 2);
      // Triple horns
      ctx.fillRect(lungeX - 6, headY - 7, 2, 6);
      ctx.fillRect(lungeX + 5, headY - 7, 2, 6);
      ctx.fillRect(lungeX - 1, headY - 7, 2, 4);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 4, 5, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    }
  } else if (culture === 'berber') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Simple linen wrap
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 3, headY, 6, 4);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Turban wrap with bronze brow clasp
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 4, headY - 2, 8, 6);
      ctx.fillStyle = PALETTE[14]; // brow strap
      ctx.fillRect(lungeX - 4, headY + 1, 8, 1);
      ctx.fillStyle = PALETTE[15]; // bronze clasp
      ctx.fillRect(lungeX, headY + 1, 2, 1);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 2, 5, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
    } else if (clampedLvl === 3) {
      // Level III (Chieftain): Desert helm under turban with chain coif veil
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 4, headY - 2, 8, 5);
      ctx.fillStyle = PALETTE[15]; // bronze crest dome
      ctx.fillRect(lungeX - 2, headY - 4, 4, 2);
      ctx.fillStyle = PALETTE[5]; // chain coif veil
      ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
      ctx.fillStyle = PALETTE[1]; // eyes opening
      ctx.fillRect(lungeX - 1, headY + 3, 4, 2);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Sculpted bronze desert helm with eagle crest & silk plume
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, headY - 3, 8, 6);
      ctx.fillStyle = PALETTE[0]; // eagle brow
      ctx.fillRect(lungeX - 1, headY - 4, 3, 2);
      ctx.fillStyle = PALETTE[4]; // silk crest
      ctx.fillRect(lungeX - 3, headY - 5, 6, 2);
      ctx.fillStyle = PALETTE[5]; // chain veil
      ctx.fillRect(lungeX - 3, headY + 3, 6, 4);
    } else {
      // Level V (Legend): Masterwork sultan-helm with triple towering silk plumes & gold face veil
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, headY - 3, 8, 6);
      ctx.fillStyle = PALETTE[0]; // gold face veil
      ctx.fillRect(lungeX - 3, headY + 1, 6, 6);
      // Triple silk plumes (crimson/gold/white)
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 1, headY - 8, 3, 6);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX - 4, headY - 6, 3, 4);
      ctx.fillRect(lungeX + 2, headY - 6, 3, 4);
    }
  } else if (culture === 'scythian') {
    if (clampedLvl === 1) {
      // Level I (Recruit): Simple pointed leather bashlyk cap
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(lungeX - 3, headY + 1, 6, 5);
      ctx.fillRect(lungeX - 2, headY - 2, 4, 3);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 1, headY + 3, 4, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Pointed cap with bronze brow band
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(lungeX - 3, headY + 1, 6, 6);
      ctx.fillRect(lungeX - 2, headY - 3, 4, 4);
      ctx.fillRect(lungeX - 1, headY - 5, 2, 2);
      ctx.fillStyle = PALETTE[15]; // gold trim
      ctx.fillRect(lungeX - 3, headY + 2, 6, 1);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 1, headY + 3, 4, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 3) {
      // Level III (Warmaster): Bronze-plated steppe helm with cheek guards
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 3, headY, 6, 6);
      ctx.fillRect(lungeX - 2, headY - 3, 4, 4);
      ctx.fillRect(lungeX - 1, headY - 5, 2, 3);
      ctx.fillStyle = PALETTE[15]; // cheek flaps
      ctx.fillRect(lungeX - 4, headY + 2, 2, 4);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 1, headY + 3, 4, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Ornate bronze steppe helm, gold sun-disk & horsehair tail
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 3, headY - 1, 6, 7);
      ctx.fillRect(lungeX - 2, headY - 5, 4, 4);
      ctx.fillStyle = PALETTE[0]; // sun-disk
      ctx.fillRect(lungeX - 1, headY - 4, 2, 2);
      ctx.fillStyle = PALETTE[3]; // horsehair tail
      ctx.fillRect(lungeX + 2, headY - 4, 2, 6);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 1, headY + 3, 4, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else {
      // Level V (Legend): Masterwork towering gilded kurgan crown-helm, triple golden plumes, stag horns
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, headY - 2, 8, 8);
      ctx.fillStyle = PALETTE[0]; // gilded crown dome
      ctx.fillRect(lungeX - 3, headY - 6, 6, 5);
      // Stag horn prongs
      ctx.fillRect(lungeX - 5, headY - 8, 2, 4);
      ctx.fillRect(lungeX + 4, headY - 8, 2, 4);
      ctx.fillRect(lungeX - 1, headY - 9, 2, 4);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 1, headY + 3, 4, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    }
  } else {
    // Hunnic:
    if (clampedLvl === 1) {
      // Level I (Recruit): Simple fur skullcap
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 3, headY, 6, 4);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 2) {
      // Level II (Veteran): Fur-lined iron skullcap
      ctx.fillStyle = PALETTE[14]; // fur trim
      ctx.fillRect(lungeX - 4, headY + 1, 8, 3);
      ctx.fillStyle = PALETTE[5]; // iron dome
      ctx.fillRect(lungeX - 3, headY - 2, 6, 3);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 3) {
      // Level III (Warmaster): Conical iron spangenhelm with cheek flaps
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX - 3, headY - 2, 6, 5);
      ctx.fillRect(lungeX - 2, headY - 4, 4, 3);
      ctx.fillStyle = PALETTE[11]; // spangen bands
      ctx.fillRect(lungeX - 1, headY - 3, 2, 4);
      ctx.fillStyle = PALETTE[14]; // fur cheek flaps
      ctx.fillRect(lungeX - 4, headY + 2, 2, 4);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
    } else if (clampedLvl === 4) {
      // Level IV (Champion): Heavy horned dread-helm with iron face guard
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX - 4, headY - 2, 8, 6);
      ctx.fillStyle = PALETTE[11]; // horns
      ctx.fillRect(lungeX - 5, headY - 5, 2, 4);
      ctx.fillRect(lungeX + 4, headY - 5, 2, 4);
      ctx.fillStyle = PALETTE[0]; // horsehair plume
      ctx.fillRect(lungeX - 1, headY - 5, 2, 4);
      ctx.fillStyle = PALETTE[5]; // iron face guard
      ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
      ctx.fillStyle = PALETTE[0]; // eyes slit
      ctx.fillRect(lungeX, headY + 4, 2, 1);
    } else {
      // Level V (Legend): Masterwork golden khagan helm, wolf mask, triple standards
      ctx.fillStyle = PALETTE[15]; // gold dome
      ctx.fillRect(lungeX - 4, headY - 3, 8, 7);
      ctx.fillStyle = PALETTE[0]; // gold horns & mask
      ctx.fillRect(lungeX - 6, headY - 7, 2, 5);
      ctx.fillRect(lungeX + 5, headY - 7, 2, 5);
      ctx.fillRect(lungeX - 3, headY + 2, 6, 4);
      ctx.fillStyle = PALETTE[5]; // wolf eyes
      ctx.fillRect(lungeX - 1, headY + 3, 1, 1);
      ctx.fillRect(lungeX + 2, headY + 3, 1, 1);
      // Triple horse-tail standards
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 1, headY - 8, 2, 5);
    }
  }

  // 4. WEAPONS & SHIELDS (STRICT LEFT-HAND AND RIGHT-HAND ANCHOR POSITIONS)
  // Left Hand Anchor: (lungeX - 5, torsoY + 4)
  // Right Hand Anchor: (lungeX + 3, torsoY + 2)
  const isStriking = state === 'attack' || state === 'sparring' || state === 'pinning';
  const lx = lungeX - 5;
  const ly = torsoY + 4;
  const rx = lungeX + 3;
  const ry = torsoY + 2;

  if (state === 'pinned') {
    // Upright struggling hands/arms in defensive hold / grapple struggle
    ctx.fillStyle = isRedFlash ? PALETTE[3] : PALETTE[1];
    ctx.fillRect(lungeX - 4, torsoY + 2, 2, 6);
    ctx.fillRect(lungeX + 2, torsoY + 1, 2, 6);
    ctx.fillStyle = isRedFlash ? PALETTE[4] : PALETTE[14];
    ctx.fillRect(lungeX - 4, torsoY + 4, 2, 2);
    ctx.fillRect(lungeX + 2, torsoY + 3, 2, 2);

    if (Math.floor(animTimer * 15) % 2 === 0) {
      ctx.fillStyle = isRedFlash ? PALETTE[0] : PALETTE[3];
      ctx.fillRect(lungeX - 4, headY - 1, 1, 2);
      ctx.fillRect(lungeX + 3, headY - 2, 1, 2);
    }

    // Grapple sand dust at feet
    const dustStep = Math.floor(safeAnim * 15) % 2 === 0;
    ctx.fillStyle = dustStep ? PALETTE[1] : PALETTE[2];
    ctx.fillRect(-5, 0, 3, 1);
    ctx.fillRect(3, 0, 2, 1);
  } else if (!isWhiteFlash && heroType) {
    // UNIQUE WEAPONS RENDERING FOR NAMED HEROES
    if (heroType === 'beastmaster') {
      // Beastmaster: Spiked iron flail & leather beast whip in right hand, leather brace on left
      // Left arm/hand:
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lx - 2, ly - 1, 3, 5);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lx - 1, ly + 2, 2, 2);

      // Right arm/hand: Spiked flail / whip
      if (isStriking) {
        ctx.fillStyle = PALETTE[14]; // whip handle
        ctx.fillRect(rx - 1, ry + 1, 3, 2);
        ctx.fillStyle = PALETTE[5]; // whip lash extending forward
        ctx.fillRect(rx + 2, ry, 11, 2);
        ctx.fillRect(rx + 11, ry - 3, 2, 5);
        ctx.fillStyle = PALETTE[11]; // spiked flail head
        ctx.fillRect(rx + 13, ry - 4, 3, 3);
        ctx.fillStyle = PALETTE[0];
        ctx.fillRect(rx + 14, ry - 5, 1, 1);
      } else {
        ctx.fillStyle = PALETTE[14];
        ctx.fillRect(rx, ry + 1, 2, 3);
        ctx.fillStyle = PALETTE[5]; // coiled whip down hip
        ctx.fillRect(rx + 1, ry + 4, 2, 6);
        ctx.fillRect(rx, ry + 9, 3, 2);
        ctx.fillRect(rx - 2, ry + 7, 2, 3);
        ctx.fillStyle = PALETTE[11]; // spiked head
        ctx.fillRect(rx - 3, ry + 6, 2, 2);
      }
    } else if (heroType === 'saladin') {
      // Saladin: Bronze Caduceus staff in right hand, Herbalist tome in left hand
      // Left hand: Herbalist tome / scroll
      ctx.fillStyle = PALETTE[14]; // leather book
      ctx.fillRect(lx - 2, ly - 1, 4, 6);
      ctx.fillStyle = PALETTE[0];  // parchment pages
      ctx.fillRect(lx - 1, ly, 2, 4);
      ctx.fillStyle = PALETTE[7];  // emerald ribbon bookmark
      ctx.fillRect(lx, ly + 4, 1, 3);

      // Right hand: Bronze Caduceus healing staff
      ctx.fillStyle = PALETTE[15]; // bronze shaft
      ctx.fillRect(rx, ry - 14, 2, 22);
      // Twin coiled serpents at top
      ctx.fillStyle = PALETTE[7]; // emerald serpent body
      ctx.fillRect(rx - 2, ry - 12, 6, 2);
      ctx.fillRect(rx - 3, ry - 9, 8, 2);
      ctx.fillStyle = PALETTE[0]; // golden wings & top sphere
      ctx.fillRect(rx - 4, ry - 16, 10, 2);
      ctx.fillRect(rx - 1, ry - 18, 4, 3);
      ctx.fillRect(rx, ry - 19, 2, 2);

      // Soothing healing sparkle trail
      if (Math.floor(animTimer * 6) % 2 === 0) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(rx + 3, ry - 17, 1, 1);
        ctx.fillRect(rx - 3, ry - 13, 1, 1);
      }
    } else if (heroType === 'zuzubu') {
      // Zuzubu: Twin curved obsidian/bronze blades
      // Left hand blade:
      ctx.fillStyle = PALETTE[15]; // hilt
      ctx.fillRect(lx - 1, ly, 2, 2);
      ctx.fillStyle = PALETTE[5];  // obsidian blade
      ctx.fillRect(lx - 3, ly + 2, 3, 7);
      ctx.fillRect(lx - 4, ly + 7, 2, 3); // curved forward hook
      ctx.fillStyle = PALETTE[0];  // razor glint
      ctx.fillRect(lx - 5, ly + 9, 2, 2);

      // Right hand blade:
      if (isStriking) {
        ctx.fillStyle = PALETTE[15];
        ctx.fillRect(rx, ry + 1, 2, 2);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(rx + 2, ry, 11, 2);
        ctx.fillRect(rx + 11, ry - 2, 3, 3);
        ctx.fillStyle = PALETTE[0];
        ctx.fillRect(rx + 13, ry - 3, 2, 2);

        // Sweeping slash arc
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.fillRect(rx + 6, ry - 4, 8, 2);
      } else {
        ctx.fillStyle = PALETTE[15];
        ctx.fillRect(rx, ry + 1, 2, 2);
        ctx.fillStyle = PALETTE[5];
        ctx.fillRect(rx + 1, ry - 8, 2, 9);
        ctx.fillRect(rx + 2, ry - 11, 3, 4); // hooked curve
        ctx.fillStyle = PALETTE[0];
        ctx.fillRect(rx + 4, ry - 12, 2, 2);
      }
    }
  } else if (!isWhiteFlash && executionStance?.isExecutioner) {
    const strikeProg = executionStance.strikeProgress ?? 0;
    if (strikeProg < 0.5) {
      // EXECUTION STANCE: Raising weapon upward by a few pixels into execution stance
      const raiseOffset = Math.round((strikeProg / 0.5) * 6); // 0 to 6 pixels upward
      ctx.fillStyle = isRedFlash ? PALETTE[3] : PALETTE[1];
      ctx.fillRect(lungeX - 3, torsoY - 4 - raiseOffset, 2, 7);
      ctx.fillRect(lungeX + 1, torsoY - 4 - raiseOffset, 2, 7);
      // Hands clutching hilt above head
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 2, torsoY - 7 - raiseOffset, 4, 3);
      ctx.fillRect(lungeX - 5, torsoY - 6 - raiseOffset, 10, 2); // crossguard
      // Blade pointing straight down vertically, poised to plunge!
      ctx.fillStyle = PALETTE[11];
      ctx.fillRect(lungeX - 1, torsoY - 18 - raiseOffset, 2, 12);
      ctx.fillStyle = PALETTE[0]; // gleaming tip
      ctx.fillRect(lungeX, torsoY - 19 - raiseOffset, 1, 1);
      ctx.fillRect(lungeX - 1, torsoY - 6 - raiseOffset, 2, 1);
    } else {
      // DOWNWARD THRUST: Thrusts the blade straight down into the sand behind the fallen body!
      ctx.fillStyle = isRedFlash ? PALETTE[3] : PALETTE[1];
      ctx.fillRect(lungeX - 2, torsoY + 4, 2, 7);
      ctx.fillRect(lungeX + 1, torsoY + 4, 2, 7);
      // Hands clutching hilt
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 2, torsoY + 10, 4, 2);
      ctx.fillRect(lungeX - 5, torsoY + 11, 10, 2);
      // Blade plunged straight down into the sand behind fallen body
      ctx.fillStyle = PALETTE[11];
      ctx.fillRect(lungeX - 1, torsoY + 13, 2, 14);
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(lungeX, torsoY + 13, 1, 12);
      // Blood and sand spray at point of impact in sand
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 3, 0, 7, 2);
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(lungeX - 4, -1, 3, 2);
      ctx.fillRect(lungeX + 3, -1, 3, 2);
    }
  } else if (!isWhiteFlash) {
    const rightId = equipped?.rightHand;
    const leftId = equipped?.leftHand;
    const rightItem = rightId ? WEAPON_DATABASE[rightId] : null;
    const leftItem = leftId ? WEAPON_DATABASE[leftId] : null;
    const twoHandedItem =
      (rightItem && rightItem.slotType === 'BOTH' ? rightItem : null) ||
      (leftItem && leftItem.slotType === 'BOTH' ? leftItem : null);

    if (twoHandedItem) {
      // DYNAMIC RENDERING: Two-Handed Weapons (BOTH Slots Replaced)
      if (twoHandedItem.id === 'barbarian_greatclub') {
        // Barbarian Greatclub (Spiked heavy knotted war club)
        if (isStriking) {
          ctx.fillStyle = PALETTE[14]; // hilt
          ctx.fillRect(rx - 2, torsoY + 2, 4, 3);
          ctx.fillStyle = PALETTE[5]; // heavy dark oak shaft
          ctx.fillRect(rx + 2, torsoY - 1, 14, 5);
          ctx.fillStyle = PALETTE[14]; // wood grain
          ctx.fillRect(rx + 4, torsoY, 10, 3);
          // Iron spikes
          ctx.fillStyle = PALETTE[11];
          ctx.fillRect(rx + 8, torsoY - 3, 2, 2);
          ctx.fillRect(rx + 12, torsoY - 3, 2, 2);
          ctx.fillRect(rx + 10, torsoY + 4, 2, 2);
          ctx.fillRect(rx + 16, torsoY, 3, 3); // heavy club head
        } else {
          ctx.fillStyle = PALETTE[14]; // hilt
          ctx.fillRect(rx, torsoY - 2, 2, 7);
          ctx.fillStyle = PALETTE[5]; // club body
          ctx.fillRect(rx - 1, torsoY - 18, 5, 16);
          ctx.fillStyle = PALETTE[14]; // wood highlight
          ctx.fillRect(rx, torsoY - 17, 3, 14);
          // Iron spikes
          ctx.fillStyle = PALETTE[11];
          ctx.fillRect(rx - 3, torsoY - 14, 2, 2);
          ctx.fillRect(rx + 4, torsoY - 12, 2, 2);
          ctx.fillRect(rx - 3, torsoY - 8, 2, 2);
          ctx.fillRect(rx, torsoY - 20, 3, 2); // crown spike
        }
      } else if (twoHandedItem.id === 'gastraphetes') {
        // Roman Repeating Gastraphetes (Crossbow belly-bow)
        if (isStriking) {
          ctx.fillStyle = PALETTE[14]; // stock
          ctx.fillRect(rx - 2, torsoY + 1, 14, 3);
          ctx.fillStyle = PALETTE[11]; // bow prod
          ctx.fillRect(rx + 10, torsoY - 5, 2, 13);
          ctx.fillStyle = PALETTE[0]; // bowstring
          ctx.fillRect(rx + 2, torsoY - 4, 1, 11);
          // Bolt loaded
          ctx.fillStyle = PALETTE[3];
          ctx.fillRect(rx + 5, torsoY + 2, 6, 1);
        } else {
          ctx.fillStyle = PALETTE[14]; // stock
          ctx.fillRect(rx - 1, torsoY - 12, 3, 18);
          ctx.fillStyle = PALETTE[11]; // bow prod
          ctx.fillRect(rx - 6, torsoY - 11, 13, 2);
          ctx.fillStyle = PALETTE[0]; // bowstring
          ctx.fillRect(rx - 5, torsoY - 4, 11, 1);
        }
      } else if (twoHandedItem.id === 'spiculum') {
        // Spiculum (Heavy War Spear)
        if (isStriking) {
          ctx.fillStyle = PALETTE[14]; // wood shaft
          ctx.fillRect(lungeX - 4, torsoY + 2, 20, 2);
          ctx.fillStyle = PALETTE[15]; // bronze socket
          ctx.fillRect(lungeX + 16, torsoY + 1, 2, 4);
          ctx.fillStyle = PALETTE[11]; // steel spearpoint
          ctx.fillRect(lungeX + 18, torsoY + 1, 4, 2);
          ctx.fillStyle = PALETTE[0]; // gleaming tip
          ctx.fillRect(lungeX + 22, torsoY + 1, 2, 2);
          ctx.fillStyle = PALETTE[3]; // red banner tassel
          ctx.fillRect(lungeX + 14, torsoY + 3, 3, 3);
        } else {
          ctx.fillStyle = PALETTE[14];
          ctx.fillRect(rx - 1, torsoY - 14, 2, 25);
          ctx.fillStyle = PALETTE[15];
          ctx.fillRect(rx - 2, torsoY - 16, 4, 3);
          ctx.fillStyle = PALETTE[11];
          ctx.fillRect(rx - 2, torsoY - 20, 4, 5);
          ctx.fillStyle = PALETTE[0];
          ctx.fillRect(rx - 1, torsoY - 22, 2, 2);
          ctx.fillStyle = PALETTE[3];
          ctx.fillRect(rx + 1, torsoY - 14, 3, 3);
        }
      } else if (twoHandedItem.id === 'heavy_falx') {
        // Heavy Falx (Curved Cleaver)
        if (isStriking) {
          ctx.fillStyle = PALETTE[14]; // hilt
          ctx.fillRect(rx - 2, torsoY + 1, 5, 2);
          ctx.fillStyle = PALETTE[5]; // dark iron back
          ctx.fillRect(rx + 3, torsoY, 11, 2);
          ctx.fillStyle = PALETTE[11]; // cutting edge
          ctx.fillRect(rx + 3, torsoY + 2, 9, 1);
          ctx.fillRect(rx + 12, torsoY + 2, 3, 4); // hooked cleaver tip
          ctx.fillStyle = PALETTE[0]; // tip glint
          ctx.fillRect(rx + 13, torsoY + 5, 2, 2);
        } else {
          ctx.fillStyle = PALETTE[14];
          ctx.fillRect(rx - 1, torsoY - 2, 3, 8);
          ctx.fillStyle = PALETTE[5];
          ctx.fillRect(rx - 1, torsoY - 13, 2, 11);
          ctx.fillStyle = PALETTE[11];
          ctx.fillRect(rx, torsoY - 14, 2, 12);
          ctx.fillRect(rx + 2, torsoY - 16, 4, 3); // forward hook
          ctx.fillStyle = PALETTE[0];
          ctx.fillRect(rx + 4, torsoY - 17, 2, 2);
        }
      } else if (twoHandedItem.id === 'imperial_dragon_standard') {
        // Imperial Dragon Standard (Relic Battle Standard)
        if (isStriking) {
          ctx.fillStyle = PALETTE[14]; // staff
          ctx.fillRect(lungeX - 4, torsoY + 2, 20, 2);
          ctx.fillStyle = PALETTE[0];  // golden draco totem head
          ctx.fillRect(lungeX + 16, torsoY - 2, 5, 5);
          ctx.fillStyle = PALETTE[3];  // red fluttering dragon tail
          ctx.fillRect(lungeX + 8, torsoY + 4, 8, 3);
        } else {
          ctx.fillStyle = PALETTE[14]; // vertical pole
          ctx.fillRect(rx - 1, torsoY - 18, 2, 28);
          ctx.fillStyle = PALETTE[0];  // gilded dragon head
          ctx.fillRect(rx - 3, torsoY - 22, 6, 5);
          ctx.fillStyle = PALETTE[3];  // red dragon windsleeve
          ctx.fillRect(rx + 1, torsoY - 18, 5, 10);
        }
      } else {
        // Imperial Rhomphaia (Master Greatblade)
        if (isStriking) {
          ctx.fillStyle = PALETTE[15]; // gold pommel/grip
          ctx.fillRect(rx - 4, torsoY + 1, 7, 3);
          ctx.fillStyle = PALETTE[0]; // crossguard
          ctx.fillRect(rx + 3, torsoY - 1, 2, 7);
          ctx.fillStyle = PALETTE[11]; // greatblade
          ctx.fillRect(rx + 5, torsoY + 1, 15, 3);
          ctx.fillStyle = PALETTE[5]; // fuller
          ctx.fillRect(rx + 6, torsoY + 2, 12, 1);
          ctx.fillStyle = PALETTE[0]; // gleaming point
          ctx.fillRect(rx + 20, torsoY + 2, 3, 1);
        } else {
          ctx.fillStyle = PALETTE[15];
          ctx.fillRect(rx, torsoY - 3, 2, 8);
          ctx.fillStyle = PALETTE[0];
          ctx.fillRect(rx - 3, torsoY - 4, 8, 2);
          ctx.fillStyle = PALETTE[11];
          ctx.fillRect(rx - 1, torsoY - 20, 4, 16);
          ctx.fillStyle = PALETTE[5];
          ctx.fillRect(rx, torsoY - 18, 2, 13);
          ctx.fillStyle = PALETTE[0];
          ctx.fillRect(rx, torsoY - 22, 2, 2);
        }
      }
    } else {
      // DYNAMIC RENDERING: Single-Handed Weapons (Left & Right Hands Replaced Individually)

      // 1. LEFT HAND: Custom Shield/Utility or Culture Default
      if (leftItem) {
        if (leftItem.id === 'parmula') {
          // Parmula (Light Shield, +6 DEF, +4 SPD)
          ctx.fillStyle = PALETTE[15]; // bronze rim
          ctx.fillRect(lx - 2, ly - 2, 6, 6);
          ctx.fillStyle = PALETTE[14]; // leather face
          ctx.fillRect(lx - 1, ly - 1, 4, 4);
          ctx.fillStyle = PALETTE[0]; // center golden boss
          ctx.fillRect(lx, ly, 2, 2);
        } else if (leftItem.id === 'scutum') {
          // Scutum (Heavy Tower Shield, +16 DEF)
          ctx.fillStyle = PALETTE[3]; // crimson face
          ctx.fillRect(lx - 3, ly - 6, 5, 15);
          ctx.fillStyle = PALETTE[15]; // bronze boss
          ctx.fillRect(lx - 2, ly, 3, 3);
          ctx.fillStyle = PALETTE[0]; // gold trim
          ctx.fillRect(lx - 3, ly - 6, 5, 1);
          ctx.fillRect(lx - 3, ly + 8, 5, 1);
        } else if (leftItem.id === 'rete') {
          // Rete (Weighted Combat Net, +10 DEF, +15% Pin)
          ctx.fillStyle = PALETTE[14]; // hemp cord mesh
          ctx.fillRect(lx - 3, ly - 2, 6, 7);
          ctx.fillStyle = PALETTE[1];
          ctx.fillRect(lx - 2, ly - 1, 4, 5);
          ctx.fillStyle = PALETTE[5];
          ctx.fillRect(lx - 1, ly, 2, 3);
          ctx.fillStyle = PALETTE[15]; // lead sinker weights
          ctx.fillRect(lx - 3, ly + 5, 2, 2);
          ctx.fillRect(lx + 1, ly + 5, 2, 2);
        } else if (leftItem.id === 'gilded_tower_aegis') {
          // Gilded Tower Aegis (Relic Bulwark, +24 DEF, +2 SPD, +20% Pin)
          ctx.fillStyle = PALETTE[15]; // antique gold rim
          ctx.fillRect(lx - 3, ly - 6, 6, 15);
          ctx.fillStyle = PALETTE[0]; // gold leaf face
          ctx.fillRect(lx - 2, ly - 5, 4, 13);
          ctx.fillStyle = PALETTE[3]; // crimson imperial eagle boss
          ctx.fillRect(lx - 1, ly, 2, 3);
          ctx.fillStyle = PALETTE[0];
          ctx.fillRect(lx - 2, ly - 1, 4, 1);
        }
      } else {
        // Culture Default Left-Hand Item
        if (culture === 'roman') {
          ctx.fillStyle = PALETTE[3];
          ctx.fillRect(lungeX - 6, torsoY - 1, 4, 15);
          ctx.fillStyle = clampedLvl >= 4 ? PALETTE[0] : PALETTE[15];
          ctx.fillRect(lungeX - 5, torsoY + 5, 2, 3);
          if (clampedLvl >= 4) {
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(lungeX - 6, torsoY - 1, 4, 1);
            ctx.fillRect(lungeX - 6, torsoY + 13, 4, 1);
          }
        } else if (culture === 'celt') {
          ctx.fillStyle = PALETTE[7];
          ctx.fillRect(lungeX - 6, torsoY + 1, 4, 10);
          ctx.fillStyle = clampedLvl >= 4 ? PALETTE[0] : PALETTE[15];
          ctx.fillRect(lungeX - 5, torsoY + 4, 2, 4);
        } else if (culture === 'berber') {
          ctx.fillStyle = clampedLvl >= 4 ? PALETTE[0] : PALETTE[15];
          ctx.fillRect(lungeX - 5, torsoY + 2, 3, 7);
          ctx.fillStyle = PALETTE[5];
          ctx.fillRect(lungeX - 4, torsoY + 4, 1, 3);
        } else if (culture === 'scythian') {
          ctx.fillStyle = PALETTE[14];
          ctx.fillRect(lungeX - 5, torsoY - 2, 1, 12);
          ctx.fillStyle = clampedLvl >= 4 ? PALETTE[0] : PALETTE[15];
          ctx.fillRect(lungeX - 4, torsoY - 3, 2, 1);
          ctx.fillRect(lungeX - 4, torsoY + 10, 2, 1);
        } else {
          // hunnic
          ctx.fillStyle = PALETTE[14];
          ctx.fillRect(lungeX - 6, torsoY, 4, 11);
          ctx.fillStyle = clampedLvl >= 4 ? PALETTE[0] : PALETTE[10];
          ctx.fillRect(lungeX - 6, torsoY, 4, 1);
          ctx.fillRect(lungeX - 6, torsoY + 10, 4, 1);
        }
      }

      // 2. RIGHT HAND: Custom Offensive Weapon or Culture Default
      if (rightItem) {
        if (rightItem.id === 'celtic_longsword') {
          // Celtic Longsword (Broad iron Gallic spatha with sweeping horizontal slash arc)
          if (isStriking) {
            ctx.fillStyle = PALETTE[15]; // bronze pommel & crossguard
            ctx.fillRect(rx - 1, ry + 1, 3, 2);
            ctx.fillRect(rx + 2, ry - 2, 2, 8);
            ctx.fillStyle = PALETTE[11]; // broad blade
            ctx.fillRect(rx + 4, ry, 14, 3);
            ctx.fillStyle = PALETTE[0]; // gleaming cutting edge & tip
            ctx.fillRect(rx + 5, ry - 1, 12, 1);
            ctx.fillRect(rx + 18, ry + 1, 2, 1);
            // Sweeping horizontal slash arc trail
            ctx.fillStyle = 'rgba(222, 208, 149, 0.7)';
            ctx.fillRect(rx + 8, ry - 5, 8, 2);
            ctx.fillRect(rx + 14, ry - 3, 6, 2);
            ctx.fillRect(rx + 18, ry - 1, 4, 2);
          } else {
            ctx.fillStyle = PALETTE[15]; // pommel & crossguard
            ctx.fillRect(rx, ry + 1, 2, 4);
            ctx.fillRect(rx - 2, ry, 6, 2);
            ctx.fillStyle = PALETTE[11]; // long vertical blade
            ctx.fillRect(rx, ry - 14, 2, 14);
            ctx.fillStyle = PALETTE[0]; // edge highlight & tip
            ctx.fillRect(rx - 1, ry - 13, 1, 13);
            ctx.fillRect(rx, ry - 15, 2, 1);
          }
        } else if (rightItem.id === 'hunting_sling') {
          // Hunting Sling (Braided cords and stone pouch)
          if (isStriking) {
            ctx.fillStyle = PALETTE[14]; // cords whipped forward
            ctx.fillRect(rx, ry + 2, 8, 1);
            ctx.fillRect(rx + 8, ry, 3, 3); // pouch
            ctx.fillStyle = PALETTE[10]; // stone projectile about to launch
            ctx.fillRect(rx + 11, ry, 2, 2);
          } else {
            ctx.fillStyle = PALETTE[14]; // cords dangling from hand
            ctx.fillRect(rx, ry + 2, 2, 6);
            ctx.fillRect(rx + 1, ry + 8, 3, 3); // leather pouch
            ctx.fillStyle = PALETTE[10]; // stone
            ctx.fillRect(rx + 2, ry + 9, 2, 2);
          }
        } else if (rightItem.id === 'throwing_trident') {
          // Throwing Trident (Fuscina de Venator)
          if (isStriking) {
            ctx.fillStyle = PALETTE[14]; // wood shaft
            ctx.fillRect(rx - 2, ry + 1, 12, 1);
            ctx.fillStyle = PALETTE[15]; // bronze socket
            ctx.fillRect(rx + 10, ry - 1, 2, 5);
            ctx.fillStyle = PALETTE[11]; // barbed prongs
            ctx.fillRect(rx + 12, ry - 2, 5, 1);
            ctx.fillRect(rx + 12, ry + 1, 6, 1);
            ctx.fillRect(rx + 12, ry + 4, 5, 1);
            ctx.fillStyle = PALETTE[0]; // barbed tips
            ctx.fillRect(rx + 17, ry - 2, 2, 1);
            ctx.fillRect(rx + 18, ry + 1, 2, 1);
            ctx.fillRect(rx + 17, ry + 4, 2, 1);
          } else {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx, ry - 12, 1, 20);
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx - 3, ry - 13, 7, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx - 3, ry - 18, 1, 5);
            ctx.fillRect(rx, ry - 20, 1, 7);
            ctx.fillRect(rx + 3, ry - 18, 1, 5);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx - 3, ry - 19, 1, 1);
            ctx.fillRect(rx, ry - 21, 1, 1);
            ctx.fillRect(rx + 3, ry - 19, 1, 1);
          }
        } else if (rightItem.id === 'gladius') {
          // Gladius (+6 ATK)
          if (isStriking) {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx, ry, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx + 2, ry, 9, 2);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 11, ry, 2, 2);
          } else {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx, ry, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx + 1, ry + 2, 2, 8);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 1, ry + 10, 2, 1);
          }
        } else if (rightItem.id === 'sica') {
          // Sica (+14 ATK, +5% Crit)
          if (isStriking) {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx, ry, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx + 2, ry, 8, 2);
            ctx.fillRect(rx + 9, ry + 1, 3, 3); // downward curved hook
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 10, ry + 3, 2, 2);
          } else {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx, ry, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx + 1, ry + 2, 2, 7);
            ctx.fillRect(rx + 2, ry + 8, 3, 2); // hooked tip
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 4, ry + 8, 2, 1);
          }
        } else if (rightItem.id === 'fuscina') {
          // Fuscina / Trident (+24 ATK, +10% Crit)
          if (isStriking) {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx - 2, ry + 1, 12, 1);
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx + 10, ry - 1, 2, 5); // crossbar
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx + 12, ry - 2, 4, 1);
            ctx.fillRect(rx + 12, ry + 1, 5, 1);
            ctx.fillRect(rx + 12, ry + 4, 4, 1);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 16, ry - 2, 2, 1);
            ctx.fillRect(rx + 17, ry + 1, 2, 1);
            ctx.fillRect(rx + 16, ry + 4, 2, 1);
          } else {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx, ry - 12, 1, 20);
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx - 3, ry - 13, 7, 2); // crossbar
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(rx - 3, ry - 18, 1, 5);
            ctx.fillRect(rx, ry - 20, 1, 7);
            ctx.fillRect(rx + 3, ry - 18, 1, 5);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx - 3, ry - 19, 1, 1);
            ctx.fillRect(rx, ry - 21, 1, 1);
            ctx.fillRect(rx + 3, ry - 19, 1, 1);
          }
        } else if (rightItem.id === 'damascene_spatha') {
          // Damascene Spatha (+32 ATK, +12% Crit)
          if (isStriking) {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx - 1, ry + 1, 3, 2);
            ctx.fillRect(rx + 2, ry - 1, 2, 6);
            ctx.fillStyle = PALETTE[6];
            ctx.fillRect(rx + 4, ry, 13, 2);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 5, ry - 1, 10, 1);
            ctx.fillRect(rx + 16, ry, 2, 2);
          } else {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(rx, ry + 1, 2, 4);
            ctx.fillRect(rx - 2, ry, 6, 2);
            ctx.fillStyle = PALETTE[6];
            ctx.fillRect(rx, ry - 14, 2, 14);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx - 1, ry - 13, 1, 12);
          }
        } else if (rightItem.id === 'obsidian_kopis') {
          // Obsidian Kopis (+36 ATK, +15% Crit)
          if (isStriking) {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx, ry, 2, 2);
            ctx.fillStyle = PALETTE[5];
            ctx.fillRect(rx + 2, ry - 1, 10, 3);
            ctx.fillRect(rx + 10, ry + 1, 3, 3);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 12, ry + 2, 2, 2);
          } else {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(rx, ry, 2, 2);
            ctx.fillStyle = PALETTE[5];
            ctx.fillRect(rx + 1, ry + 2, 2, 8);
            ctx.fillRect(rx + 2, ry + 8, 3, 3);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(rx + 4, ry + 9, 2, 1);
          }
        } else if (rightItem.id === 'spiked_caestus') {
          // Spiked Caestus (+28 ATK, +4 DEF, +6 SPD)
          ctx.fillStyle = PALETTE[14];
          ctx.fillRect(rx, ry - 1, 4, 4);
          ctx.fillStyle = PALETTE[11];
          ctx.fillRect(rx + 4, ry - 1, 2, 1);
          ctx.fillRect(rx + 4, ry + 2, 2, 1);
          ctx.fillStyle = PALETTE[0];
          ctx.fillRect(rx + 5, ry, 2, 2);
        }
      } else {
        // Culture Default Right-Hand Item
        if (culture === 'roman') {
          if (isStriking) {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(lungeX + 3, torsoY + 2, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 5, torsoY + 2, 10, 1);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(lungeX + 15, torsoY + 2, 2, 1);
          } else {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(lungeX + 3, torsoY + 2, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 4, torsoY + 4, 1, 8);
          }
        } else if (culture === 'celt') {
          if (isStriking) {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(lungeX + 2, torsoY + 1, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 4, torsoY + 1, 13, 2);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(lungeX + 17, torsoY + 1, 2, 1);
          } else {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(lungeX + 3, torsoY, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 3, torsoY + 2, 2, 11);
          }
        } else if (culture === 'berber') {
          if (isStriking) {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(lungeX + 3, torsoY + 1, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 5, torsoY + 1, 8, 2);
            ctx.fillRect(lungeX + 13, torsoY - 1, 3, 2);
          } else {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(lungeX + 3, torsoY + 2, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 4, torsoY + 4, 2, 7);
            ctx.fillRect(lungeX + 3, torsoY + 10, 2, 2);
          }
        } else if (culture === 'scythian') {
          if (isStriking) {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(lungeX - 2, torsoY + 2, 18, 1);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 16, torsoY + 1, 4, 2);
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(lungeX + 20, torsoY + 2, 2, 1);
            ctx.fillStyle = PALETTE[3];
            ctx.fillRect(lungeX + 14, torsoY + 3, 4, 2);
          } else {
            ctx.fillStyle = PALETTE[14];
            ctx.fillRect(lungeX + 3, torsoY - 12, 1, 22);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 2, torsoY - 16, 3, 4);
            ctx.fillStyle = PALETTE[3];
            ctx.fillRect(lungeX + 4, torsoY - 12, 3, 3);
          }
        } else {
          // hunnic
          if (isStriking) {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(lungeX + 2, torsoY + 1, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 4, torsoY + 1, 10, 1);
            ctx.fillRect(lungeX + 12, torsoY, 3, 2);
          } else {
            ctx.fillStyle = PALETTE[15];
            ctx.fillRect(lungeX + 3, torsoY + 1, 2, 2);
            ctx.fillStyle = PALETTE[11];
            ctx.fillRect(lungeX + 4, torsoY + 3, 2, 8);
            ctx.fillRect(lungeX + 5, torsoY + 9, 2, 2);
          }
        }
      }
    }

    // Grapple sparks and dust around grapple point
    if (state === 'pinning') {
      const sparkPhase = Math.floor(safeAnim * 20) % 3;
      const sparkCol = sparkPhase === 0 ? PALETTE[0] : sparkPhase === 1 ? PALETTE[15] : PALETTE[2];
      ctx.fillStyle = sparkCol;
      ctx.fillRect(rx + 9, ry, 2, 2);
      ctx.fillRect(rx + 12, ry + 3, 2, 1);
      if (sparkPhase === 0) {
        ctx.fillRect(rx + 7, ry + 2, 1, 2);
        ctx.fillRect(rx + 13, ry - 1, 2, 1);
      } else if (sparkPhase === 1) {
        ctx.fillRect(rx + 10, ry - 2, 2, 1);
        ctx.fillRect(rx + 8, ry + 4, 1, 2);
      }
      // Dust puffs at feet
      const dustPulse = Math.floor(safeAnim * 15) % 2 === 0;
      ctx.fillStyle = dustPulse ? PALETTE[1] : PALETTE[14];
      ctx.fillRect(lungeX + 5, 0, 3, 1);
      ctx.fillRect(lungeX + 8, -1, 2, 1);
    }
  }

  ctx.restore();
}
