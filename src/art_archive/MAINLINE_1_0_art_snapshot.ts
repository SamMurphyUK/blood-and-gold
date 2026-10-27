/**
 * ART & GAMEPLAY ASSET SNAPSHOT: MAINLINE 1.0 (MAINLINE-1.0 / MAINLINE_1.0)
 *
 * Tag: MAINLINE-1.0 / MAINLINE_1.0
 * Tag Message: "MAINLINE 1.0 - Full game snapshot: 0 starting gold, synchronized manikin zoom & spotlight, escalating short respite fee (200G -> 400G -> 600G -> 1200G), continuous podium tournament progression"
 * Date: 2026-10-26
 *
 * Dedicated permanent snapshot file bundling:
 * - 16-color antiquity palette constants & theme configurations
 * - 0 Starting gold economy baseline
 * - Synchronized manikin zoom & circular spotlight timing at 5.0s
 * - Short Respite escalating fee schedule: [200, 400, 600, 1200]
 * - Coliseum podium continuous progression (no option to return to camp during podium trials)
 * - 5 cultural gladiators: Roman Murmillo, Celtic Champion, Berber Skirmisher, Scythian Lancer, Hunnic Raider
 * - Procedural pixel rendering routines with 4x logical scaling (344x192 logic resolution)
 * - Upright pin mechanic with struggle jitter & 2-frame crimson flash
 * - Pinning attacker stance with crossed grip sparks / links VFX
 * - Dramatic finishing blow slow-fall backward rotation & sand blood pools
 * - Bloodsworn RAGE aura visual effects & 100% crit mechanics
 * - Camp environment: Pale alabaster floor, animated sky clouds, grey boundary walls, geometric pavilion tent, dummy, weapon rack
 * - Coliseum arena duel environment: Dithered bleachers, imperial balcony, golden sand floor, duel ring
 * - Five-Tier Coliseum Monumental Roman Podium with ceremonial braziers & laurel wreaths
 * - Comprehensive string tables for contextual speech bubbles (camp roaming & arena skirmishes)
 * - Pairwise Brotherhood bonding system metrics & aftermath narrative generators
 */

// ============================================================================
// 1. SNAPSHOT METADATA & REPOSITORY VERSION CONSTANTS
// ============================================================================

export const SNAPSHOT_TAG = 'MAINLINE-1.0';
export const SNAPSHOT_TAG_ALT = 'MAINLINE_1.0';
export const SNAPSHOT_TAG_MESSAGE =
  'MAINLINE 1.0 - Full game snapshot: 0 starting gold, synchronized manikin zoom & spotlight, escalating short respite fee (200G -> 400G -> 600G -> 1200G), continuous podium tournament progression';

export const SNAPSHOT_METADATA = {
  version: '1.0.0',
  name: 'MAINLINE 1.0',
  tag: SNAPSHOT_TAG,
  altTag: SNAPSHOT_TAG_ALT,
  message: SNAPSHOT_TAG_MESSAGE,
  timestamp: '2026-10-26T05:14:43-07:00',
  gameTitle: 'Ludus Champion',
  startingGold: 0,
  respiteCostSchedule: [200, 400, 600, 1200] as const,
  manikinSpotlightDelaySec: 5.0,
  podiumReturnToCampAllowed: false,
  logicResolution: {
    width: 344,
    height: 192,
    pixelScale: 4,
    displayCanvasWidth: 1376,
    displayCanvasHeight: 768,
  },
} as const;

// ============================================================================
// 2. VERIFIED 16-COLOR ANTIQUITY PALETTE & THEME
// ============================================================================

export const PALETTE = [
  '#ded095', // 0: pale parchment yellow / alabaster
  '#cb9f6b', // 1: sand ochre / light tan
  '#ba7654', // 2: terracotta clay
  '#9e4a42', // 3: deep roman crimson / rust
  '#6d3947', // 4: wine / burgundy
  '#3f363b', // 5: dark iron / charred brown-gray
  '#47505c', // 6: slate blue-gray
  '#55796f', // 7: weathered verdigris / dark sage
  '#88997a', // 8: olive sage green
  '#574b50', // 9: dark taupe / charcoal mauve
  '#817475', // 10: weathered stone gray
  '#a4968d', // 11: warm gray / limestone
  '#6f705a', // 12: mossy olive drab
  '#9da056', // 13: golden olive / brassy green
  '#7f644b', // 14: raw umber / leather brown
  '#9c8053', // 15: bronze / antique gold
] as const;

export type PaletteColor = (typeof PALETTE)[number];

export const THEME = {
  fontFamily: "'Cinzel', 'Trajan Pro', Georgia, serif",
  colors: {
    bgDark: '#3f363b',
    panelBg: '#574b50',
    panelBorder: '#7f644b',
    goldAccent: '#ded095',
    crimsonAccent: '#9e4a42',
    tealAccent: '#55796f',
    sandYellow: '#cb9f6b',
    textMain: '#ded095',
    textMuted: '#a4968d',
  },
};

// ============================================================================
// 3. CULTURAL ARCHETYPES & SQUAD DATA
// ============================================================================

export type Culture = 'roman' | 'celt' | 'berber' | 'scythian' | 'hunnic';
export type CombatTactics = 'aggressive' | 'defensive' | 'ranged';

export const CULTURE_LABELS: Record<Culture, string> = {
  roman: 'Roman Murmillo',
  celt: 'Celtic Champion',
  berber: 'Berber Skirmisher',
  scythian: 'Scythian Lancer',
  hunnic: 'Hunnic Raider',
};

export const CULTURE_DESCRIPTIONS: Record<Culture, string> = {
  roman: 'Heavy bronze crested helmet, segmented lorica, Scutum tower shield & Gladius.',
  celt: 'Golden torc, tribal woad war-paint, heavy spatha iron blade & painted round shield.',
  berber: 'Desert linen headwrap, swift curved falcata blade & tempered bronze buckler.',
  scythian: 'Pointed steppe leather cap, decorated tunic, long lance & composite recurve bow.',
  hunnic: 'Fur-lined iron skullcap, layered lamellar armor plates & curved cavalry sabre.',
};

export interface GladiatorSnapshot {
  id: string;
  name: string;
  culture: Culture;
  title: string;
  level: number;
  xp: number;
  xpNeeded: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  weaponLevel: number;
  armorLevel: number;
  kills: number;
  tactics: CombatTactics;
}

export const INITIAL_GLADIATORS_SNAPSHOT: GladiatorSnapshot[] = [
  {
    id: 'glad_roman',
    name: 'Valerius Iron-Wall',
    culture: 'roman',
    title: 'Murmillo Veteran',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    hp: 175,
    maxHp: 175,
    attack: 22,
    defense: 15,
    speed: 10,
    weaponLevel: 1,
    armorLevel: 1,
    kills: 0,
    tactics: 'defensive',
  },
  {
    id: 'glad_celt',
    name: 'Brennus the Unbroken',
    culture: 'celt',
    title: 'Gallic Berserker',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    hp: 155,
    maxHp: 155,
    attack: 25,
    defense: 11,
    speed: 13,
    weaponLevel: 1,
    armorLevel: 1,
    kills: 0,
    tactics: 'aggressive',
  },
  {
    id: 'glad_berber',
    name: 'Tariq Desert-Wind',
    culture: 'berber',
    title: 'Numidian Skirmisher',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    hp: 140,
    maxHp: 140,
    attack: 23,
    defense: 9,
    speed: 16,
    weaponLevel: 1,
    armorLevel: 1,
    kills: 0,
    tactics: 'ranged',
  },
  {
    id: 'glad_scythian',
    name: 'Aria Steppe-Rider',
    culture: 'scythian',
    title: 'Scythian Lancer',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    hp: 145,
    maxHp: 145,
    attack: 26,
    defense: 12,
    speed: 14,
    weaponLevel: 1,
    armorLevel: 1,
    kills: 0,
    tactics: 'ranged',
  },
  {
    id: 'glad_hunnic',
    name: 'Attila Blood-Fang',
    culture: 'hunnic',
    title: 'Hunnic Raider',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    hp: 150,
    maxHp: 150,
    attack: 24,
    defense: 13,
    speed: 12,
    weaponLevel: 1,
    armorLevel: 1,
    kills: 0,
    tactics: 'aggressive',
  },
];

// ============================================================================
// 4. ORDERED DITHERING & SHADOW ALGORITHMS
// ============================================================================

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
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iw = Math.floor(w);
  const ih = Math.floor(h);

  ctx.fillStyle = baseColor;
  ctx.fillRect(ix, iy, iw, ih);

  ctx.fillStyle = ditherColor;
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
  ctx.fillStyle = shadowColor;
  const startX = Math.floor(cx - radiusX);
  const endX = Math.floor(cx + radiusX);
  const startY = Math.floor(cy - radiusY);
  const endY = Math.floor(cy + radiusY);

  for (let py = startY; py <= endY; py++) {
    for (let px = startX; px <= endX; px++) {
      const dx = (px - cx) / radiusX;
      const dy = (py - cy) / radiusY;
      if (dx * dx + dy * dy <= 1) {
        if ((px + py) % 2 === 0) {
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
}

// ============================================================================
// 5. CULTURAL GLADIATOR SPRITE & ANIMATION RENDERING ROUTINES
// ============================================================================

export function drawCulturalGladiator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  culture: Culture,
  state:
    | 'idle'
    | 'walking'
    | 'sparring'
    | 'resting'
    | 'attack'
    | 'hurt'
    | 'pinned'
    | 'pinning'
    | 'death',
  flipX: boolean,
  animTimer: number,
  flashWhiteTimer = 0,
  deathTimer = 0,
  rageTimer = 0,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flipX) {
    ctx.scale(-1, 1);
  }

  // Pulsating red RAGE aura
  if (rageTimer > 0) {
    const pulse = 1 + 0.3 * Math.sin(animTimer * 16);
    drawDitherShadow(ctx, 0, -12, 13 * pulse, 17 * pulse, PALETTE[3]);
  }

  let struggleJitterX = 0;
  if (state === 'pinned') {
    const struggleFrame = Math.floor(animTimer * 30);
    struggleJitterX = struggleFrame % 2 === 0 ? 0.75 : -0.75;
  } else if (state === 'pinning') {
    const struggleFrame = Math.floor(animTimer * 30);
    struggleJitterX = struggleFrame % 2 === 0 ? 0.5 : -0.5;
  }

  // 1. PINNING FIGHTER
  if (state === 'pinning') {
    ctx.translate(struggleJitterX, 0);

    drawDitherShadow(ctx, 2, 1, 14, 3, PALETTE[5]);

    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-5, -6, 4, 7);
    ctx.fillRect(-1, -4, 4, 5);
    ctx.fillStyle = culture === 'roman' || culture === 'hunnic' ? PALETTE[15] : PALETTE[10];
    ctx.fillRect(-6, 0, 3, 2);
    ctx.fillRect(0, 0, 3, 2);

    if (culture === 'roman') {
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(-2, -16, 9, 10);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(0, -14, 6, 2);
    } else if (culture === 'celt') {
      ctx.fillStyle = PALETTE[1];
      ctx.fillRect(-2, -16, 9, 10);
      ctx.fillStyle = PALETTE[7];
      ctx.fillRect(0, -14, 5, 3);
    } else if (culture === 'berber') {
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(-2, -16, 9, 10);
      ctx.fillStyle = PALETTE[4];
      ctx.fillRect(0, -12, 6, 3);
    } else if (culture === 'scythian') {
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(-2, -16, 9, 10);
      ctx.fillStyle = PALETTE[12];
      ctx.fillRect(0, -13, 4, 4);
    } else {
      ctx.fillStyle = PALETTE[9];
      ctx.fillRect(-2, -16, 9, 10);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(-1, -14, 7, 5);
    }

    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(4, -14, 8, 3);
    ctx.fillRect(10, -15, 3, 5);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(6, -14, 3, 3);

    ctx.fillStyle = culture === 'roman' ? PALETTE[15] : PALETTE[1];
    ctx.fillRect(2, -22, 6, 6);
    if (culture === 'roman') {
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(2, -25, 6, 3);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(6, -20, 2, 1);
    } else if (culture === 'celt') {
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(1, -24, 6, 3);
    } else if (culture === 'berber') {
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(1, -24, 7, 3);
    } else if (culture === 'scythian') {
      ctx.fillStyle = PALETTE[8];
      ctx.fillRect(2, -25, 5, 4);
    } else {
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(1, -24, 7, 3);
    }

    const vfxBaseY = -27;
    const sparkPulse = Math.floor(animTimer * 15) % 2 === 0;

    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(3, vfxBaseY - 4, 2, 6);
    ctx.fillRect(7, vfxBaseY - 4, 2, 6);
    ctx.fillRect(4, vfxBaseY - 2, 4, 2);

    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(5, vfxBaseY - 2, 2, 2);

    if (sparkPulse) {
      ctx.fillStyle = PALETTE[0];
      ctx.fillRect(1, vfxBaseY - 5, 2, 1);
      ctx.fillRect(9, vfxBaseY - 5, 2, 1);
      ctx.fillRect(5, vfxBaseY - 6, 2, 1);
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(5, vfxBaseY + 3, 2, 1);
    } else {
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(2, vfxBaseY - 4, 1, 2);
      ctx.fillRect(9, vfxBaseY - 4, 1, 2);
      ctx.fillStyle = PALETTE[2];
      ctx.fillRect(4, vfxBaseY - 5, 4, 1);
    }

    ctx.restore();
    return;
  }

  // 2. FALLEN PRONE / COLLAPSED DEATH STATE
  if (state === 'death' && deathTimer <= 0) {
    drawDitherShadow(ctx, 0, 1, 14, 3, PALETTE[5]);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-12, -2, 8, 2);
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-10, -2, 4, 1);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-5, -5, 10, 4);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(4, -6, 5, 5);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-2, -1, 6, 2);
    ctx.restore();
    return;
  }

  // 3. DRAMATIC SLOW-FALL ANIMATION
  if (state === 'death' && deathTimer > 0) {
    const fallProgress = 1 - deathTimer / 1.6;
    const rot = (fallProgress * Math.PI) / 2.2;
    ctx.rotate(flipX ? -rot : rot);
  }

  drawDitherShadow(ctx, 0, 1, 7, 2, PALETTE[5]);

  let lungeX = 0;
  if (state === 'attack' || state === 'sparring') {
    lungeX = 4;
  } else if (state === 'hurt') {
    lungeX = -3;
  } else if (state === 'pinned') {
    lungeX = struggleJitterX;
  } else if (state === 'walking') {
    lungeX = Math.round(Math.sin(animTimer * 9) * 1.2);
  }

  const hipY = -12;
  const torsoY = -21;
  const headY = -28;

  const isWhiteFlash = flashWhiteTimer > 0;
  const isRedFlash = state === 'pinned' && Math.floor(animTimer * 30) % 2 === 0;

  const walkStride = state === 'walking' ? Math.round(Math.sin(animTimer * 12) * 2) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14];
  ctx.fillRect(lungeX - 2 - walkStride, hipY, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY, 2, 6);

  ctx.fillStyle = isWhiteFlash
    ? PALETTE[0]
    : isRedFlash
      ? PALETTE[4]
      : culture === 'roman' || culture === 'hunnic'
        ? PALETTE[15]
        : PALETTE[10];
  ctx.fillRect(lungeX - 2 - walkStride, hipY + 6, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY + 6, 2, 6);

  if (isWhiteFlash) {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
  } else if (isRedFlash) {
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[4];
    ctx.fillRect(lungeX - 3, torsoY + 2, 6, 2);
    ctx.fillRect(lungeX - 3, torsoY + 6, 6, 2);
  } else if (culture === 'roman') {
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 4, torsoY + 2, 8, 1);
    ctx.fillRect(lungeX - 4, torsoY + 5, 8, 1);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 3, torsoY + 7, 6, 2);
  } else if (culture === 'celt') {
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[7];
    ctx.fillRect(lungeX - 3, torsoY + 2, 6, 2);
    ctx.fillRect(lungeX - 1, torsoY + 4, 3, 2);
    ctx.fillStyle = PALETTE[2];
    ctx.fillRect(lungeX - 4, torsoY + 7, 8, 3);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 2, torsoY - 1, 4, 1);
  } else if (culture === 'berber') {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 3, torsoY, 7, 9);
    ctx.fillStyle = PALETTE[4];
    ctx.fillRect(lungeX - 3, torsoY + 5, 7, 3);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 2, torsoY + 1, 5, 2);
  } else if (culture === 'scythian') {
    ctx.fillStyle = PALETTE[8];
    ctx.fillRect(lungeX - 3, torsoY, 7, 9);
    ctx.fillStyle = PALETTE[12];
    ctx.fillRect(lungeX - 1, torsoY, 2, 9);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 1, torsoY + 3, 2, 1);
    ctx.fillRect(lungeX - 1, torsoY + 6, 2, 1);
  } else {
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 3, torsoY + 1, 6, 3);
    ctx.fillRect(lungeX - 3, torsoY + 5, 6, 3);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
  }

  if (isWhiteFlash) {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
  } else if (isRedFlash) {
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX, headY + 3, 2, 1);
  } else if (culture === 'roman') {
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX, headY + 3, 3, 1);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 2, headY - 4, 5, 4);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 1, headY - 5, 3, 1);
  } else if (culture === 'celt') {
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, headY - 1, 6, 3);
    ctx.fillRect(lungeX - 4, headY + 1, 2, 5);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
  } else if (culture === 'berber') {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 4, headY - 2, 8, 6);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 4, headY + 1, 8, 1);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 2, headY + 2, 5, 4);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
  } else if (culture === 'scythian') {
    ctx.fillStyle = PALETTE[8];
    ctx.fillRect(lungeX - 3, headY + 1, 6, 6);
    ctx.fillRect(lungeX - 2, headY - 3, 4, 4);
    ctx.fillRect(lungeX - 1, headY - 5, 2, 2);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, headY + 2, 6, 1);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 1, headY + 3, 4, 3);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
  } else {
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 4, headY + 1, 8, 3);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 3, headY - 2, 6, 3);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
  }

  const isStriking = state === 'attack' || state === 'sparring';

  if (state === 'pinned') {
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
  } else if (!isWhiteFlash) {
    if (culture === 'roman') {
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 6, torsoY - 1, 4, 15);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 5, 2, 3);

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
      ctx.fillStyle = PALETTE[7];
      ctx.fillRect(lungeX - 6, torsoY + 1, 4, 10);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 4, 2, 4);

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
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 2, 3, 7);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX - 4, torsoY + 4, 1, 3);

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
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 5, torsoY - 2, 1, 12);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY - 3, 2, 1);
      ctx.fillRect(lungeX - 4, torsoY + 10, 2, 1);

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
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 6, torsoY, 4, 11);
      ctx.fillStyle = PALETTE[10];
      ctx.fillRect(lungeX - 6, torsoY, 4, 1);
      ctx.fillRect(lungeX - 6, torsoY + 10, 4, 1);

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

  ctx.restore();
}

// ============================================================================
// 6. CAMP COURTYARD & ARENA ENVIRONMENT ROUTINES
// ============================================================================

export function drawCampSkyAndWalls(
  ctx: CanvasRenderingContext2D,
  animTime: number,
  logicWidth = 344,
  logicHeight = 192,
) {
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(0, 0, logicWidth, 14);
  drawDitherRect(ctx, 0, 14, logicWidth, 8, PALETTE[9], PALETTE[6], 0.5);
  ctx.fillStyle = PALETTE[6];
  ctx.fillRect(0, 22, logicWidth, 14);

  const cloud1X = (Math.floor(animTime * 2.2) + 20) % (logicWidth + 60) - 40;
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(cloud1X, 8, 38, 6);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cloud1X + 4, 7, 26, 2);

  const cloud2X = (Math.floor(animTime * 1.6) + 180) % (logicWidth + 60) - 40;
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(cloud2X, 16, 44, 7);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(cloud2X + 6, 15, 30, 2);

  ctx.fillStyle = PALETTE[12];
  for (let i = 0; i < logicWidth; i += 14) {
    const treeH = 5 + (Math.sin(i * 0.45) > 0 ? 3 : 0);
    ctx.fillRect(i, 44 - treeH, 11, treeH);
  }

  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 44, logicWidth, 34);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 44, logicWidth, 2);

  for (let ax = 45; ax < logicWidth - 45; ax += 66) {
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(ax, 52, 14, 20);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(ax + 2, 54, 10, 18);
  }

  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 78, logicWidth, logicHeight - 78);

  ctx.fillStyle = PALETTE[1];
  for (let fy = 88; fy < logicHeight; fy += 14) {
    ctx.fillRect(0, fy, logicWidth, 1);
  }
  for (let fx = 18; fx < logicWidth - 18; fx += 28) {
    for (let fy = 88; fy < logicHeight; fy += 14) {
      const stagger = (fy / 14) % 2 === 0 ? 0 : 14;
      ctx.fillRect(fx + stagger, fy, 1, 14);
    }
  }

  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 0, 18, logicHeight);
  ctx.fillRect(logicWidth - 18, 0, 18, logicHeight);
  ctx.fillStyle = PALETTE[6];
  ctx.fillRect(0, 0, 4, logicHeight);
  ctx.fillRect(logicWidth - 4, 0, 4, logicHeight);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(17, 0, 1, logicHeight);
  ctx.fillRect(logicWidth - 18, 0, 1, logicHeight);
}

export function drawCampCourtyardProps(ctx: CanvasRenderingContext2D) {
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

export function drawCleanArenaBackground(
  ctx: CanvasRenderingContext2D,
  logicWidth = 344,
  logicHeight = 192,
) {
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 0, logicWidth, 48);

  for (let ty = 6; ty < 46; ty += 8) {
    ctx.fillStyle = PALETTE[6];
    ctx.fillRect(0, ty, logicWidth, 2);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(0, ty + 2, logicWidth, 6);
  }

  drawDitherRect(ctx, 0, 12, logicWidth, 28, PALETTE[5], PALETTE[9], 0.5);

  ctx.fillStyle = PALETTE[4];
  ctx.fillRect(146, 12, 52, 24);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(146, 12, 52, 4);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(148, 16, 2, 20);
  ctx.fillRect(164, 16, 2, 20);
  ctx.fillRect(180, 16, 2, 20);
  ctx.fillRect(196, 16, 2, 20);

  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 48, logicWidth, 12);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 48, logicWidth, 2);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 59, logicWidth, 1);

  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(0, 60, logicWidth, logicHeight - 60);

  ctx.strokeStyle = PALETTE[14];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(logicWidth / 2, 130, 96, 38, 0, 0, Math.PI * 2);
  ctx.stroke();

  drawDitherRect(ctx, 36, 95, logicWidth - 72, 68, PALETTE[1], PALETTE[0], 0.25);
}

// ============================================================================
// 7. RESPITE COST SCHEDULE & BONDING CONSTANTS
// ============================================================================

export const RESPITE_COST_SCHEDULE = [200, 400, 600, 1200] as const;

export const BOND_TIERS = {
  acquaintance: { min: 0, max: 24, title: 'Acquaintance', color: '#88997a', icon: '🛡️' },
  battleBrother: { min: 25, max: 49, title: 'Battle Brother', color: '#cb9f6b', icon: '🤝' },
  bloodsworn: { min: 50, max: 100, title: 'Bloodsworn', color: '#9e4a42', icon: '🩸' },
} as const;

export const BOND_RULES = {
  startingScore: 16,
  victoryDelta: 8,
  nearDeathSurvivalDelta: 12,
  idleDecayDelta: -2,
  rageMinThreshold: 40,
  rageDurationSec: 6.0,
  rageSpeedMultiplier: 1.4,
  critDamageMultiplier: 1.5,
  missChance: 0.05,
} as const;
