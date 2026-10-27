/**
 * ART & GAMEPLAY ASSET SNAPSHOT: MAINLINE-DEMO (MAINLINE_DEMO)
 *
 * Tag: MAINLINE-DEMO / MAINLINE_DEMO
 * Tag Message: "MAINLINE DEMO - Full game snapshot: art, multi-fighter arena, bonding, dialogue bubbles, refined pin animation"
 * Date: 2026-10-25
 *
 * Dedicated permanent snapshot file bundling:
 * - 16-color antiquity palette constants & theme configurations
 * - 5 cultural gladiators: Roman Murmillo, Celtic Champion, Berber Skirmisher, Scythian Lancer, Hunnic Raider
 * - Procedural pixel rendering routines with 4x logical scaling (344x192)
 * - Upright pin mechanic with struggle jitter & 2-frame crimson flash
 * - Pinning attacker stance with crossed grip sparks / links VFX
 * - Dramatic finishing blow slow-fall backward rotation & sand blood pools
 * - Bloodsworn RAGE aura visual effects & 100% crit mechanics
 * - Camp environment: Pale alabaster floor, animated sky clouds, grey boundary walls, geometric pavilion tent, dummy, weapon rack
 * - Coliseum arena duel environment: Dithered bleachers, imperial balcony, golden sand floor, duel ring
 * - Comprehensive string tables for contextual speech bubbles (camp roaming & arena skirmishes)
 * - Pairwise Brotherhood bonding system metrics & aftermath narrative generators
 */

// ============================================================================
// 1. SNAPSHOT METADATA & REPOSITORY VERSION CONSTANTS
// ============================================================================

export const SNAPSHOT_TAG = 'MAINLINE-DEMO';
export const SNAPSHOT_TAG_ALT = 'MAINLINE_DEMO';
export const SNAPSHOT_TAG_MESSAGE =
  'MAINLINE DEMO - Full game snapshot: art, multi-fighter arena, bonding, dialogue bubbles, refined pin animation';

export const SNAPSHOT_METADATA = {
  version: '2.0.0',
  name: 'MAINLINE DEMO',
  tag: SNAPSHOT_TAG,
  altTag: SNAPSHOT_TAG_ALT,
  message: SNAPSHOT_TAG_MESSAGE,
  timestamp: '2026-10-25T18:04:41-07:00',
  gameTitle: 'Ludus Champion',
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
// Complete implementation of upright pin jitter, 2-frame crimson flash,
// pinning attacker stance with vfx sparks, dramatic finishing blow rotation,
// and pulsating RAGE auras.
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

  // Struggle Jitter for grappling / pinning states:
  // Pinned victim: subtle shaking animation (±0.75 logic px struggle tremble)
  // Pinning attacker: subtle hold tremble (±0.5 px)
  let struggleJitterX = 0;
  if (state === 'pinned') {
    const struggleFrame = Math.floor(animTimer * 30);
    struggleJitterX = struggleFrame % 2 === 0 ? 0.75 : -0.75;
  } else if (state === 'pinning') {
    const struggleFrame = Math.floor(animTimer * 30);
    struggleJitterX = struggleFrame % 2 === 0 ? 0.5 : -0.5;
  }

  // 1. PINNING FIGHTER (Bent forward grappling victim upright + distinct VFX above head)
  if (state === 'pinning') {
    ctx.translate(struggleJitterX, 0);

    // Shadow under knees and ground stance
    drawDitherShadow(ctx, 2, 1, 14, 3, PALETTE[5]);

    // Knees & legs bent in solid upright grapple stance
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(-5, -6, 4, 7);
    ctx.fillRect(-1, -4, 4, 5);
    ctx.fillStyle = culture === 'roman' || culture === 'hunnic' ? PALETTE[15] : PALETTE[10];
    ctx.fillRect(-6, 0, 3, 2);
    ctx.fillRect(0, 0, 3, 2);

    // Upright / slight forward leaning torso
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

    // Powerful arms extended horizontally forward gripping the upright pinned victim
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(4, -14, 8, 3);
    ctx.fillRect(10, -15, 3, 5);
    ctx.fillStyle = PALETTE[14]; // leather bracers
    ctx.fillRect(6, -14, 3, 3);

    // Head focused forward in grapple
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

    // DISTINCT SMALL PIXEL VFX ABOVE HEAD (Aggressive grappling crossed grip sparks/chains/stars)
    const vfxBaseY = -27;
    const sparkPulse = Math.floor(animTimer * 15) % 2 === 0;

    // Crossed grappling iron/gold links
    ctx.fillStyle = PALETTE[15]; // antique gold/bronze
    ctx.fillRect(3, vfxBaseY - 4, 2, 6);
    ctx.fillRect(7, vfxBaseY - 4, 2, 6);
    ctx.fillRect(4, vfxBaseY - 2, 4, 2);

    // Gleaming center grip clash
    ctx.fillStyle = PALETTE[0]; // white/pale gold spark
    ctx.fillRect(5, vfxBaseY - 2, 2, 2);

    // Radiating grapple stars / sparks
    if (sparkPulse) {
      ctx.fillStyle = PALETTE[0]; // bright flash sparks
      ctx.fillRect(1, vfxBaseY - 5, 2, 1);
      ctx.fillRect(9, vfxBaseY - 5, 2, 1);
      ctx.fillRect(5, vfxBaseY - 6, 2, 1);
      ctx.fillStyle = PALETTE[3]; // crimson combat fury
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
    // Blood stain on sand
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(-2, -1, 6, 2);
    ctx.restore();
    return;
  }

  // 3. DRAMATIC SLOW-FALL ANIMATION (During fatal blow sequence)
  if (state === 'death' && deathTimer > 0) {
    const fallProgress = 1 - deathTimer / 1.6; // 0 to 1
    const rot = (fallProgress * Math.PI) / 2.2; // tilts backward
    ctx.rotate(flipX ? -rot : rot);
  }

  // Foot shadow
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

  // Flash white filter during dramatic hit / death
  const isWhiteFlash = flashWhiteTimer > 0;
  // Flashes palette crimson/rust (#9e4a42) every two frames while pinned
  const isRedFlash = state === 'pinned' && Math.floor(animTimer * 30) % 2 === 0;

  // 1. Legs & Stride
  const walkStride = state === 'walking' ? Math.round(Math.sin(animTimer * 12) * 2) : 0;
  ctx.fillStyle = isWhiteFlash ? PALETTE[0] : isRedFlash ? PALETTE[3] : PALETTE[14];
  ctx.fillRect(lungeX - 2 - walkStride, hipY, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY, 2, 6);

  // Greaves / boots
  ctx.fillStyle = isWhiteFlash
    ? PALETTE[0]
    : isRedFlash
      ? PALETTE[4]
      : culture === 'roman' || culture === 'hunnic'
        ? PALETTE[15]
        : PALETTE[10];
  ctx.fillRect(lungeX - 2 - walkStride, hipY + 6, 2, 6);
  ctx.fillRect(lungeX + 1 + walkStride, hipY + 6, 2, 6);

  // 2. Torso according to Culture
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
    // Heavy segmented lorica plate & brass bands
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 4, torsoY + 2, 8, 1);
    ctx.fillRect(lungeX - 4, torsoY + 5, 8, 1);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 3, torsoY + 7, 6, 2);
  } else if (culture === 'celt') {
    // Torc & woad chest markings / leather harness
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
    // Desert sand tunic & burgundy sash
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 3, torsoY, 7, 9);
    ctx.fillStyle = PALETTE[4];
    ctx.fillRect(lungeX - 3, torsoY + 5, 7, 3);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 2, torsoY + 1, 5, 2);
  } else if (culture === 'scythian') {
    // Steppe kaftan with olive/sage trim
    ctx.fillStyle = PALETTE[8];
    ctx.fillRect(lungeX - 3, torsoY, 7, 9);
    ctx.fillStyle = PALETTE[12];
    ctx.fillRect(lungeX - 1, torsoY, 2, 9);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 1, torsoY + 3, 2, 1);
    ctx.fillRect(lungeX - 1, torsoY + 6, 2, 1);
  } else {
    // Hunnic: Dark lamellar armor plates
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(lungeX - 4, torsoY, 8, 9);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 3, torsoY + 1, 6, 3);
    ctx.fillRect(lungeX - 3, torsoY + 5, 6, 3);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 4, torsoY + 7, 8, 2);
  }

  // 3. Head & Cultural Headgear
  if (isWhiteFlash) {
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
  } else if (isRedFlash) {
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX, headY + 3, 2, 1);
  } else if (culture === 'roman') {
    // Enclosed bronze helmet with crimson crest
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, headY, 6, 7);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX, headY + 3, 3, 1);
    ctx.fillStyle = PALETTE[3];
    ctx.fillRect(lungeX - 2, headY - 4, 5, 4);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 1, headY - 5, 3, 1);
  } else if (culture === 'celt') {
    // Fair wild hair with bronze brow band
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 3, headY + 2, 6, 5);
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(lungeX - 3, headY - 1, 6, 3);
    ctx.fillRect(lungeX - 4, headY + 1, 2, 5);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
  } else if (culture === 'berber') {
    // Desert turban wrap
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(lungeX - 4, headY - 2, 8, 6);
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 4, headY + 1, 8, 1);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 2, headY + 2, 5, 4);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 3, 1, 1);
  } else if (culture === 'scythian') {
    // Pointed steppe leather bashlyk cap
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
    // Hunnic: Fur-trimmed skullcap
    ctx.fillStyle = PALETTE[14];
    ctx.fillRect(lungeX - 4, headY + 1, 8, 3);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX - 3, headY - 2, 6, 3);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(lungeX - 2, headY + 3, 5, 4);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(lungeX + 1, headY + 4, 1, 1);
  }

  // 4. Weapons & Shields (Explicit Hand Anchors)
  const isStriking = state === 'attack' || state === 'sparring';

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
  } else if (!isWhiteFlash) {
    if (culture === 'roman') {
      // Left Hand: Scutum Tower Shield
      ctx.fillStyle = PALETTE[3];
      ctx.fillRect(lungeX - 6, torsoY - 1, 4, 15);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 5, 2, 3);

      // Right Hand: Gladius Blade
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
      // Left Hand: Painted Round Shield
      ctx.fillStyle = PALETTE[7];
      ctx.fillRect(lungeX - 6, torsoY + 1, 4, 10);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 4, 2, 4);

      // Right Hand: Heavy Spatha Longsword
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
      // Left Hand: Small Tempered Buckler
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 5, torsoY + 2, 3, 7);
      ctx.fillStyle = PALETTE[5];
      ctx.fillRect(lungeX - 4, torsoY + 4, 1, 3);

      // Right Hand: Curved Falcata Blade
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
      // Left Hand: Composite Recurve Bow
      ctx.fillStyle = PALETTE[14];
      ctx.fillRect(lungeX - 5, torsoY - 2, 1, 12);
      ctx.fillStyle = PALETTE[15];
      ctx.fillRect(lungeX - 4, torsoY - 3, 2, 1);
      ctx.fillRect(lungeX - 4, torsoY + 10, 2, 1);

      // Right Hand: Long Steppe Lance / Spear
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
      // Hunnic: Oval Wooden Shield & Curved Sabre
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
  // Sky Horizon
  ctx.fillStyle = PALETTE[9];
  ctx.fillRect(0, 0, logicWidth, 14);
  drawDitherRect(ctx, 0, 14, logicWidth, 8, PALETTE[9], PALETTE[6], 0.5);
  ctx.fillStyle = PALETTE[6];
  ctx.fillRect(0, 22, logicWidth, 14);

  // Slow drift pixel clouds
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

  // Distant olive groves along the horizon
  ctx.fillStyle = PALETTE[12];
  for (let i = 0; i < logicWidth; i += 14) {
    const treeH = 5 + (Math.sin(i * 0.45) > 0 ? 3 : 0);
    ctx.fillRect(i, 44 - treeH, 11, treeH);
  }

  // Ashlar rear wall with coping
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 44, logicWidth, 34);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 44, logicWidth, 2);

  // Arched recessed niches with dark depth
  for (let ax = 45; ax < logicWidth - 45; ax += 66) {
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(ax, 52, 14, 20);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(ax + 2, 54, 10, 18);
  }

  // Pale alabaster courtyard floor
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 78, logicWidth, logicHeight - 78);

  // Courtyard flagstone grid markings
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

  // Perimeter stone framing walls
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

  // Wooden Training Dummy
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

export function drawCleanArenaBackground(
  ctx: CanvasRenderingContext2D,
  logicWidth = 344,
  logicHeight = 192,
) {
  // Spectator stands
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 0, logicWidth, 48);

  for (let ty = 6; ty < 46; ty += 8) {
    ctx.fillStyle = PALETTE[6];
    ctx.fillRect(0, ty, logicWidth, 2);
    ctx.fillStyle = PALETTE[9];
    ctx.fillRect(0, ty + 2, logicWidth, 6);
  }

  drawDitherRect(ctx, 0, 12, logicWidth, 28, PALETTE[5], PALETTE[9], 0.5);

  // Imperial Balcony in Center
  ctx.fillStyle = PALETTE[4];
  ctx.fillRect(146, 12, 52, 24);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(146, 12, 52, 4);
  ctx.fillStyle = PALETTE[15];
  ctx.fillRect(148, 16, 2, 20);
  ctx.fillRect(164, 16, 2, 20);
  ctx.fillRect(180, 16, 2, 20);
  ctx.fillRect(196, 16, 2, 20);

  // Wall perimeter barrier
  ctx.fillStyle = PALETTE[10];
  ctx.fillRect(0, 48, logicWidth, 12);
  ctx.fillStyle = PALETTE[11];
  ctx.fillRect(0, 48, logicWidth, 2);
  ctx.fillStyle = PALETTE[5];
  ctx.fillRect(0, 59, logicWidth, 1);

  // Golden Sand Pit Arena Floor
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(0, 60, logicWidth, logicHeight - 60);

  // Center duel arena emblem ring
  ctx.strokeStyle = PALETTE[14];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(logicWidth / 2, 130, 96, 38, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle sand dust texture
  drawDitherRect(ctx, 36, 95, logicWidth - 72, 68, PALETTE[1], PALETTE[0], 0.25);
}

// ============================================================================
// 7. COMPLETE VERIFIED DIALOGUE TABLES (CAMP & ARENA SKIRMISHES)
// ============================================================================

export const CAMP_DIALOGUE_TABLES = {
  culture: {
    roman: [
      'Discipline triumphs where wild fury falters.',
      'By Jupiter’s thunder, our formation remains unbreakable.',
      'The coliseum roars only for those who master iron discipline.',
      'A true legionary feels neither thirst nor fear—only order.',
    ],
    celt: [
      'The spirits of my ancestors whisper in the autumn wind.',
      'My golden torc was blessed by the sacred groves of old.',
      'No Roman cage can tame the ancestral fire within my blood.',
      'Iron may strike deep, but ancient ferocity never bends.',
    ],
    berber: [
      'The desert winds taught me to strike before the eye can blink.',
      'These stone walls cannot quench the swift spirit of the dunes.',
      'A warrior who conquers desert thirst knows no defeat.',
      'Swift as the desert viper, silent as the drifting sands.',
    ],
    scythian: [
      'My heart yearns for the open expanse of the great steppe.',
      'Every bronze tip is notched with precision and quiet resolve.',
      'On vast horizons, swift distance is the truest armor.',
      'The recurve bowstring sings a melody older than these stone arenas.',
    ],
    hunnic: [
      'The iron vanguard breaks through every shield wall in time.',
      'Years of endurance on the march forged these iron sinews.',
      'We do not fear the pit—we raid the arena like a contested border.',
      'Unforgiving endurance outlasts the sharpest blade.',
    ],
  },
  health: {
    wounded: [
      'My ribs still ache from that murmillo’s scutum...',
      'These linen bandages will not hold forever... I need rest.',
      'Stitched flesh and bruised bone, but my grip is firm.',
      'Blood was spilled today, but breath still fills my chest.',
    ],
    fullHealth: [
      'My blade is thirsty.',
      'My sinews are coiled and ready for the roar of the crowd.',
      'Never felt stronger. Bring forth the next challenger!',
      'The sands call out—my arms are rested and eager.',
    ],
  },
  experience: {
    rookie: [
      'Will the sands remember my name?',
      'My knees trembled before my first duel, but no longer.',
      'One bout at a time... I must survive to earn renown.',
      'The trainer pushes hard, but glory demands sacrifice.',
    ],
    veteran: [
      'I have survived thirty bouts on this bloodied sand.',
      'They chant for spectacle, but I fight for survival and honor.',
      'Few survive enough seasons here to count gray hairs.',
      'Veterans know the truth: pride kills faster than steel.',
    ],
  },
} as const;

export const ARENA_DIALOGUE_TABLES = {
  kill: {
    roman: [
      'For the ludus!',
      'Order and iron prevail!',
      'Discipline breaks wild fury!',
      'The arena honors the legion!',
    ],
    celt: [
      'The soil drinks your life!',
      'Ancestors guide my blade!',
      'Broken on Gallic steel!',
      'Your soul joins the wind!',
    ],
    berber: [
      'Swift as the dune wind!',
      'Dust claims another!',
      'Too slow for desert steel!',
      'The sands sweep you away!',
    ],
    scythian: [
      'Steppe lance strikes true!',
      'Pierced through the heart!',
      'Distance is fatal!',
      'Returned to the plains!',
    ],
    hunnic: [
      'Crushed under iron!',
      'Torn like winter grass!',
      'No one halts our raid!',
      'Felled by the war-band!',
    ],
    praiseFoe: ['A worthy foe... rest now.', 'You fought with courage.'],
  },
  pin: {
    general: [
      'Yield!',
      'Hold them!',
      'Strike now, brothers!',
      "Down! Don't let them rise!",
      'I have them pinned!',
    ],
    roman: ['Shield lock! Finish them!', 'Under iron heel!'],
    celt: ['Taste the arena dirt!', 'Got you in my grip!'],
    berber: ['Nowhere to flee!', 'Trapped in the dunes!'],
    scythian: ['Held fast! Strike now!', 'Pinned in place!'],
    hunnic: ['Broke your stance!', 'Pinned like quarry!'],
  },
  kite: [
    'Step into my reach!',
    'Not yet!',
    'Patience...',
    'Come closer if you dare!',
    'Overextended!',
    'Walk into my trap!',
    'Too eager!',
  ],
  release_pin: [
    'Get off me!',
    'Still standing!',
    "You'll pay for that!",
    'Is that all you have?',
    'My footing holds!',
    'Back to my feet!',
    'The legion stance never breaks!',
    'You cannot bind wild blood!',
  ],
} as const;

// ============================================================================
// 8. BROTHERHOOD BONDING CONSTANTS & THRESHOLDS
// ============================================================================

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
