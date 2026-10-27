// High-Resolution Procedural Portrait Renderer for Gladiator Manager
// 512x512 internal vector canvas scaled smoothly down to UI frames.
// Stylized realistic antiquity dark fantasy / painterly illustration.
// Smooth Bezier curves, layered polygon planes, radial/linear gradients,
// 3 distinct tonal layers (dark base shadow, cultural mid-tone skin, sharp warm torchlight highlights),
// and heavy ink-black comic shadows (#0c070a) against a dark vignette backdrop.

import type {Culture, GladiatorClass, NpcPortraitType, HeroType} from '../types';

export interface PortraitConfig {
  culture: Culture;
  level?: number;
  isDead?: boolean;
  heroType?: HeroType | string;
  gladiatorClass?: GladiatorClass | string;
  npcType?: NpcPortraitType | string;
  isCavalry?: boolean;
  isElephant?: boolean;
  silhouette?: boolean;
  silhouetteColor?: string;
  opacity?: number;
}

// Cultural Skin Tones Architecture
interface SkinPalette {
  shadow: string;       // Layer 1: Dark base shadow (#38241e / #2f1e1a / #221614)
  shadowDeep: string;   // Deepest occlusion shadow
  mid: string;          // Layer 2: Mid-tone skin shade tailored by culture
  midWarm: string;      // Slightly warmer transitional mid-tone
  highlight: string;    // Layer 3: Sharp warm torchlight highlight
  specular: string;     // Peak specular glint (#fff0ce / #fadc9b)
  irisColor: string;    // Characteristic iris color
}

const SKIN_PALETTES: Record<Culture, SkinPalette> = {
  roman: {
    shadow: '#2f1e1a',
    shadowDeep: '#1d1210',
    mid: '#a66d4a',
    midWarm: '#bc7f59',
    highlight: '#e8b97d',
    specular: '#fff0ce',
    irisColor: '#523422',
  },
  celt: {
    shadow: '#38221c',
    shadowDeep: '#241410',
    mid: '#c98d65',
    midWarm: '#db9e76',
    highlight: '#fadc9b',
    specular: '#fff6e0',
    irisColor: '#3d6c8d', // piercing Celtic blue-grey
  },
  berber: {
    shadow: '#261510',
    shadowDeep: '#180c09',
    mid: '#78472a',
    midWarm: '#8f5634',
    highlight: '#d99c64',
    specular: '#fad7a7',
    irisColor: '#7a5426', // golden amber
  },
  scythian: {
    shadow: '#2e1d17',
    shadowDeep: '#1c100c',
    mid: '#9e6b48',
    midWarm: '#b57e56',
    highlight: '#eab882',
    specular: '#fff0ce',
    irisColor: '#805f2b', // steppe hawk amber
  },
  hunnic: {
    shadow: '#2b1a15',
    shadowDeep: '#190e0b',
    mid: '#966542',
    midWarm: '#ab7752',
    highlight: '#e2af79',
    specular: '#fff0ce',
    irisColor: '#452b1b',
  },
};

// ----------------------------------------------------------------------------
// HIGH-RESOLUTION PROCEDURAL 512x512 PAINTERLY PORTRAIT ENGINE
// ----------------------------------------------------------------------------

export function renderProceduralPortrait512(
  ctx: CanvasRenderingContext2D,
  config: PortraitConfig,
) {
  const {
    culture,
    level = 1,
    isDead = false,
    heroType,
    gladiatorClass,
    npcType,
    silhouette = false,
    silhouetteColor = '#0c070a',
  } = config;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. DARK VIGNETTE BACKGROUND
  // Deep vignette from dark charcoal/obsidian #140f12 at center to ink black #080507 at edges,
  // with subtle warm ambient torch glow radiating from upper-left (#2b1812 / rgba(85,38,24,0.6))
  const bgGrad = ctx.createRadialGradient(256, 240, 50, 256, 256, 320);
  bgGrad.addColorStop(0, '#161013');
  bgGrad.addColorStop(0.55, '#120c0f');
  bgGrad.addColorStop(1, '#080507');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Upper-left torch glow
  const torchGlow = ctx.createRadialGradient(70, 70, 10, 130, 130, 310);
  torchGlow.addColorStop(0, 'rgba(92, 42, 26, 0.65)');
  torchGlow.addColorStop(0.45, 'rgba(48, 20, 14, 0.32)');
  torchGlow.addColorStop(1, 'rgba(16, 11, 14, 0)');
  ctx.fillStyle = torchGlow;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle painterly atmospheric noise / embers in background
  ctx.save();
  ctx.fillStyle = 'rgba(235, 185, 125, 0.12)';
  for (let i = 0; i < 28; i++) {
    const ex = (i * 37 + 19) % 512;
    const ey = (i * 53 + 29) % 512;
    const er = 1.2 + (i % 3) * 0.8;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // If in silhouette mode:
  if (silhouette) {
    ctx.fillStyle = silhouetteColor;
    drawSilhouetteBust(ctx);
    ctx.restore();
    return;
  }

  // Beast War Mounts (War Elephant & War Horse)
  if (config.isElephant || config.gladiatorClass === 'War Elephant' || config.heroType === 'elephant') {
    drawWarElephantPortrait(ctx, config);
    if (isDead) drawFallenGladiatorOverlay(ctx);
    ctx.restore();
    return;
  }

  if (config.isCavalry || config.gladiatorClass === 'War Horse' || config.heroType === 'horse') {
    drawWarHorsePortrait(ctx, config);
    if (isDead) drawFallenGladiatorOverlay(ctx);
    ctx.restore();
    return;
  }

  // Determine skin tone palette
  let skin = SKIN_PALETTES[culture] || SKIN_PALETTES.roman;
  if (heroType === 'zuzubu') {
    // Deep Ethiopian obsidian-bronze skin
    skin = {
      shadow: '#1d1210',
      shadowDeep: '#120a08',
      mid: '#4d2d1d',
      midWarm: '#5e3824',
      highlight: '#ba7e52',
      specular: '#e0a474',
      irisColor: '#2b1910',
    };
  } else if (heroType === 'saladin') {
    skin = {
      shadow: '#2a1a14',
      shadowDeep: '#180d09',
      mid: '#855132',
      midWarm: '#9a623f',
      highlight: '#e4b07c',
      specular: '#ffe0b8',
      irisColor: '#4f3b23',
    };
  } else if (heroType === 'emperor') {
    skin = {
      shadow: '#2f1e1a',
      shadowDeep: '#1d1210',
      mid: '#ab7352',
      midWarm: '#bf8461',
      highlight: '#f2c894',
      specular: '#fff2d6',
      irisColor: '#422818',
    };
  }

  // 2. LAYER 1: NECK & SHOULDERS (ANATOMICAL BASE)
  drawNeckAndTrapezius(ctx, skin);

  // 3. WARGEAR / PAULDRONS / SHOULDER ATTIRE (Behind Jaw)
  drawShoulderArmor(ctx, config);

  // 4. JAWLINE & HEAD CONSTRUCTION (REALISTIC ANATOMICAL PROPORTIONS)
  drawHeadBase(ctx, skin);

  // 5. LAYER 2: MID-TONE SKIN PLANES (Organic Bezier & Polygonal Planes)
  drawMidTonePlanes(ctx, skin, config);

  // 6. LAYER 3: SHARP WARM TORCHLIGHT HIGHLIGHTS (Brow, Nasal Bridge, Cheekbone)
  drawTorchHighlights(ctx, skin, config);

  // 7. HEAVY INK-BLACK SHADOWS (#0c070a Comic-Book Chiaroscuro)
  drawHeavyInkShadows(ctx);

  // 8. PIERCING GRITTY GLADIATOR EYES
  drawGrittyGladiatorEyes(ctx, skin);

  // 9. NOSE & MOUTH DETAILS
  drawNoseAndMouth(ctx, skin, config);

  // 9b. RANK-EVOLVING FACIAL SCARS & HARDENED EXPRESSION (Level 3+)
  if (level >= 3 && !heroType) {
    drawFacialScars(ctx, level, skin);
  }

  // 10. CHARACTER SPECIFICS, HAIR, HEADGEAR & WARPAINT
  drawCharacterFeatures(ctx, config, skin);

  // 11. DECEASED FALLEN OVERLAY (if isDead)
  if (isDead) {
    drawFallenGladiatorOverlay(ctx);
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// COMPONENT DRAWING ROUTINES (SMOOTH BEZIER & VECTOR PLANES)
// ----------------------------------------------------------------------------

function drawSilhouetteBust(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  // Head dome
  ctx.arc(256, 230, 110, Math.PI * 0.85, Math.PI * 0.15, false);
  // Right jaw down
  ctx.quadraticCurveTo(345, 330, 325, 370);
  ctx.quadraticCurveTo(295, 415, 275, 420);
  ctx.lineTo(237, 420);
  ctx.quadraticCurveTo(217, 415, 187, 370);
  ctx.quadraticCurveTo(167, 330, 168, 230);
  ctx.closePath();
  ctx.fill();

  // Neck and shoulders
  ctx.beginPath();
  ctx.moveTo(195, 360);
  ctx.quadraticCurveTo(160, 410, 80, 512);
  ctx.lineTo(432, 512);
  ctx.quadraticCurveTo(352, 410, 317, 360);
  ctx.closePath();
  ctx.fill();
}

function drawNeckAndTrapezius(ctx: CanvasRenderingContext2D, skin: SkinPalette) {
  // Shoulders and Trapezius base fill
  ctx.beginPath();
  ctx.moveTo(190, 340);
  ctx.bezierCurveTo(160, 390, 110, 440, 60, 512);
  ctx.lineTo(452, 512);
  ctx.bezierCurveTo(402, 440, 352, 390, 322, 340);
  ctx.closePath();

  const neckGrad = ctx.createLinearGradient(120, 360, 380, 480);
  neckGrad.addColorStop(0, skin.shadow);
  neckGrad.addColorStop(0.5, skin.shadowDeep);
  neckGrad.addColorStop(1, '#0e080a');
  ctx.fillStyle = neckGrad;
  ctx.fill();

  // Sternocleidomastoid muscles (V-shaped descending bands)
  ctx.beginPath();
  ctx.moveTo(215, 370);
  ctx.quadraticCurveTo(230, 430, 246, 485);
  ctx.lineTo(256, 485);
  ctx.quadraticCurveTo(240, 430, 226, 370);
  ctx.closePath();
  ctx.fillStyle = skin.shadow;
  ctx.fill();

  // Left neck lit rim (warm torch reflection)
  ctx.beginPath();
  ctx.moveTo(195, 360);
  ctx.quadraticCurveTo(185, 415, 175, 480);
  ctx.lineTo(195, 480);
  ctx.quadraticCurveTo(208, 415, 215, 360);
  ctx.closePath();
  const leftNeckGlow = ctx.createLinearGradient(175, 360, 215, 360);
  leftNeckGlow.addColorStop(0, skin.highlight);
  leftNeckGlow.addColorStop(1, skin.shadow);
  ctx.fillStyle = leftNeckGlow;
  ctx.fill();

  // Suprasternal notch shadow (throat pit)
  ctx.beginPath();
  ctx.ellipse(256, 480, 14, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();
}

function drawShoulderArmor(ctx: CanvasRenderingContext2D, config: PortraitConfig) {
  const { culture, level = 1, heroType, gladiatorClass } = config;

  if (heroType === 'emperor') {
    // Imperial purple paludamentum with gold trim and lion brooch
    ctx.beginPath();
    ctx.moveTo(110, 430);
    ctx.bezierCurveTo(80, 460, 60, 512, 50, 512);
    ctx.lineTo(462, 512);
    ctx.bezierCurveTo(452, 460, 432, 430, 390, 430);
    ctx.closePath();
    const purpleGrad = ctx.createLinearGradient(60, 440, 450, 512);
    purpleGrad.addColorStop(0, '#5a1936');
    purpleGrad.addColorStop(0.5, '#421227');
    purpleGrad.addColorStop(1, '#240a16');
    ctx.fillStyle = purpleGrad;
    ctx.fill();

    // Golden embroidered mantle border
    ctx.beginPath();
    ctx.moveTo(110, 430);
    ctx.lineTo(170, 512);
    ctx.lineTo(195, 512);
    ctx.lineTo(135, 430);
    ctx.closePath();
    ctx.fillStyle = '#cda24d';
    ctx.fill();

    // Radiant gold shoulder brooch
    ctx.beginPath();
    ctx.arc(135, 435, 20, 0, Math.PI * 2);
    const goldBrooch = ctx.createRadialGradient(130, 430, 3, 135, 435, 20);
    goldBrooch.addColorStop(0, '#fff4d1');
    goldBrooch.addColorStop(0.5, '#cba043');
    goldBrooch.addColorStop(1, '#664a13');
    ctx.fillStyle = goldBrooch;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    return;
  }

  if (heroType === 'saladin') {
    // Elegant emerald desert mantle with gold clasps
    ctx.beginPath();
    ctx.moveTo(110, 440);
    ctx.quadraticCurveTo(80, 475, 50, 512);
    ctx.lineTo(462, 512);
    ctx.quadraticCurveTo(432, 475, 402, 440);
    ctx.closePath();
    const emeraldGrad = ctx.createLinearGradient(80, 450, 430, 512);
    emeraldGrad.addColorStop(0, '#2d6a4f');
    emeraldGrad.addColorStop(0.5, '#1b4332');
    emeraldGrad.addColorStop(1, '#0e241b');
    ctx.fillStyle = emeraldGrad;
    ctx.fill();
    return;
  }

  if (heroType === 'beastmaster') {
    // Heavy predator fur cowl around neck/shoulders with bone charms
    ctx.beginPath();
    ctx.moveTo(90, 430);
    ctx.quadraticCurveTo(70, 470, 50, 512);
    ctx.lineTo(462, 512);
    ctx.quadraticCurveTo(442, 470, 422, 430);
    ctx.closePath();
    const furGrad = ctx.createLinearGradient(90, 430, 420, 512);
    furGrad.addColorStop(0, '#5a3d28');
    furGrad.addColorStop(0.6, '#3a2517');
    furGrad.addColorStop(1, '#1e130c');
    ctx.fillStyle = furGrad;
    ctx.fill();

    // Curved bone predator fangs necklace
    const fangPoints = [170, 205, 240, 275, 310, 345];
    ctx.fillStyle = '#e8dec8';
    fangPoints.forEach((fx, i) => {
      ctx.beginPath();
      ctx.moveTo(fx - 6, 450 + (i % 2) * 5);
      ctx.quadraticCurveTo(fx + 2, 475 + (i % 2) * 8, fx + 1, 490 + (i % 2) * 10);
      ctx.quadraticCurveTo(fx - 2, 475 + (i % 2) * 8, fx + 6, 450 + (i % 2) * 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0c070a';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });
    return;
  }

  if (heroType === 'zuzubu' || culture === 'celt') {
    // Sculpted Celtic / African bronze neck torc around throat
    ctx.beginPath();
    ctx.ellipse(256, 440, 75, 26, 0, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    const torcGrad = ctx.createLinearGradient(180, 430, 330, 460);
    torcGrad.addColorStop(0, '#fadb93');
    torcGrad.addColorStop(0.4, '#b07f35');
    torcGrad.addColorStop(1, '#473111');
    ctx.strokeStyle = torcGrad;
    ctx.stroke();

    // Torc terminal beast-heads
    ctx.beginPath();
    ctx.arc(220, 448, 10, 0, Math.PI * 2);
    ctx.arc(292, 448, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#fadb93';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // RANK-EVOLVING PAULDRON & SHOULDER WARGEAR (Levels 1-2, 3-4, 5+)
  if (level <= 2) {
    // Level 1-2 (Recruit / Novice): Basic unarmored / light leather harness
    ctx.beginPath();
    ctx.moveTo(85, 480);
    ctx.quadraticCurveTo(130, 445, 185, 455);
    ctx.lineTo(175, 480);
    ctx.quadraticCurveTo(125, 470, 75, 512);
    ctx.closePath();
    const strapGrad = ctx.createLinearGradient(75, 455, 185, 480);
    strapGrad.addColorStop(0, '#664028');
    strapGrad.addColorStop(0.5, '#422818');
    strapGrad.addColorStop(1, '#1f120a');
    ctx.fillStyle = strapGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Iron ring buckle
    ctx.beginPath();
    ctx.arc(145, 465, 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (level <= 4) {
    // Level 3-4 (Veteran): Layered iron/bronze pauldron with metallic specular reflection and bronze rivets
    ctx.beginPath();
    ctx.moveTo(55, 480);
    ctx.quadraticCurveTo(110, 435, 185, 445);
    ctx.lineTo(175, 490);
    ctx.quadraticCurveTo(110, 475, 45, 512);
    ctx.closePath();

    const pauldronGrad = ctx.createLinearGradient(45, 435, 185, 490);
    pauldronGrad.addColorStop(0, '#828a94');
    pauldronGrad.addColorStop(0.3, '#d1d8e0'); // metallic specular reflection
    pauldronGrad.addColorStop(0.7, '#434a52');
    pauldronGrad.addColorStop(1, '#1b1f24');
    ctx.fillStyle = pauldronGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // Bronze rivets & reinforcement banding
    ctx.fillStyle = '#dfb558';
    ctx.fillRect(115, 450, 12, 10);
    ctx.fillRect(145, 456, 12, 10);
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(115, 450, 12, 10);
    ctx.strokeRect(145, 456, 12, 10);
  } else {
    // Level 5+ (Champion / Legend): Heavy ornate gilded / blackened steel armor, majestic lion crest, gold specular reflections
    ctx.beginPath();
    ctx.moveTo(45, 470);
    ctx.quadraticCurveTo(105, 420, 195, 435);
    ctx.lineTo(185, 495);
    ctx.quadraticCurveTo(105, 475, 35, 512);
    ctx.closePath();

    const legendPauldronGrad = ctx.createLinearGradient(35, 420, 195, 495);
    legendPauldronGrad.addColorStop(0, '#212429'); // blackened steel base
    legendPauldronGrad.addColorStop(0.25, '#4f545c');
    legendPauldronGrad.addColorStop(0.5, '#e0b343'); // ornate gold leaf banding
    legendPauldronGrad.addColorStop(0.75, '#fff6d1'); // blazing specular glint
    legendPauldronGrad.addColorStop(1, '#15171a');
    ctx.fillStyle = legendPauldronGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3.8;
    ctx.stroke();

    // Sculpted Imperial Lion / Eagle gold relief on pauldron
    ctx.beginPath();
    ctx.arc(125, 460, 18, 0, Math.PI * 2);
    const goldEmblem = ctx.createRadialGradient(122, 456, 2, 125, 460, 18);
    goldEmblem.addColorStop(0, '#fffbe6');
    goldEmblem.addColorStop(0.5, '#d4a843');
    goldEmblem.addColorStop(1, '#5e430f');
    ctx.fillStyle = goldEmblem;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Heavy golden gorget neck-collar plate protecting throat
    ctx.beginPath();
    ctx.moveTo(215, 435);
    ctx.quadraticCurveTo(256, 455, 297, 435);
    ctx.lineTo(290, 460);
    ctx.quadraticCurveTo(256, 478, 222, 460);
    ctx.closePath();
    ctx.fillStyle = '#c99a38';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawHeadBase(ctx: CanvasRenderingContext2D, skin: SkinPalette) {
  // Layer 1: Dark Base Shadow defining cranial & jaw volume
  ctx.beginPath();
  // Forehead dome
  ctx.moveTo(256, 120);
  ctx.bezierCurveTo(200, 118, 168, 175, 170, 240);
  // Left zygomatic arch & jaw
  ctx.quadraticCurveTo(168, 300, 178, 335);
  ctx.quadraticCurveTo(185, 368, 228, 410);
  // Chin mental protuberance
  ctx.quadraticCurveTo(242, 418, 256, 418);
  ctx.quadraticCurveTo(270, 418, 284, 410);
  // Right jaw & zygomatic arch
  ctx.quadraticCurveTo(327, 368, 334, 335);
  ctx.quadraticCurveTo(344, 300, 342, 240);
  ctx.bezierCurveTo(344, 175, 312, 118, 256, 120);
  ctx.closePath();

  // Dark base shadow gradient: lit from upper-left, falling into deep shadow on right
  const baseGrad = ctx.createLinearGradient(165, 160, 345, 380);
  baseGrad.addColorStop(0, skin.shadow);
  baseGrad.addColorStop(0.45, skin.shadow);
  baseGrad.addColorStop(0.8, skin.shadowDeep);
  baseGrad.addColorStop(1, '#160d0b');
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Inking contour perimeter
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();
}

function drawMidTonePlanes(
  ctx: CanvasRenderingContext2D,
  skin: SkinPalette,
  _config: PortraitConfig,
) {
  // Layer 2: Mid-tone skin shade tailored by culture
  // 1. Forehead plane (lit upper-left)
  ctx.beginPath();
  ctx.moveTo(256, 130);
  ctx.bezierCurveTo(215, 130, 185, 160, 182, 210);
  ctx.lineTo(248, 212);
  ctx.lineTo(264, 212);
  ctx.bezierCurveTo(295, 180, 285, 140, 256, 130);
  ctx.closePath();
  const foreheadGrad = ctx.createLinearGradient(185, 130, 280, 210);
  foreheadGrad.addColorStop(0, skin.midWarm);
  foreheadGrad.addColorStop(0.65, skin.mid);
  foreheadGrad.addColorStop(1, skin.shadow);
  ctx.fillStyle = foreheadGrad;
  ctx.fill();

  // 2. Left zygomatic arch / cheek plane
  ctx.beginPath();
  ctx.moveTo(178, 235);
  ctx.quadraticCurveTo(174, 275, 188, 325);
  ctx.quadraticCurveTo(215, 360, 235, 375);
  ctx.lineTo(238, 340);
  ctx.quadraticCurveTo(215, 290, 210, 255);
  ctx.closePath();
  const cheekGrad = ctx.createLinearGradient(175, 250, 240, 350);
  cheekGrad.addColorStop(0, skin.midWarm);
  cheekGrad.addColorStop(0.6, skin.mid);
  cheekGrad.addColorStop(1, skin.shadow);
  ctx.fillStyle = cheekGrad;
  ctx.fill();

  // 3. Nasal bridge plane
  ctx.beginPath();
  ctx.moveTo(246, 215);
  ctx.lineTo(240, 295);
  ctx.lineTo(256, 305);
  ctx.lineTo(262, 295);
  ctx.lineTo(258, 215);
  ctx.closePath();
  const noseGrad = ctx.createLinearGradient(240, 220, 264, 300);
  noseGrad.addColorStop(0, skin.midWarm);
  noseGrad.addColorStop(0.7, skin.mid);
  noseGrad.addColorStop(1, skin.shadow);
  ctx.fillStyle = noseGrad;
  ctx.fill();

  // 4. Chin prominence pad (mental protuberance)
  ctx.beginPath();
  ctx.ellipse(256, 400, 26, 16, 0, 0, Math.PI * 2);
  const chinGrad = ctx.createRadialGradient(250, 396, 4, 256, 400, 26);
  chinGrad.addColorStop(0, skin.midWarm);
  chinGrad.addColorStop(0.7, skin.mid);
  chinGrad.addColorStop(1, skin.shadow);
  ctx.fillStyle = chinGrad;
  ctx.fill();

  // 5. Upper lip & philtrum plane
  ctx.beginPath();
  ctx.moveTo(246, 318);
  ctx.lineTo(242, 342);
  ctx.lineTo(268, 342);
  ctx.lineTo(264, 318);
  ctx.closePath();
  ctx.fillStyle = skin.mid;
  ctx.fill();
}

function drawTorchHighlights(
  ctx: CanvasRenderingContext2D,
  skin: SkinPalette,
  _config: PortraitConfig,
) {
  // Layer 3: Sharp warm torchlight specular highlights
  // (Left brow ridge, frontal bone, nose bridge, tip of nose, upper cheekbone)

  // 1. Left brow ridge highlight (frontal bone prominence)
  ctx.beginPath();
  ctx.moveTo(192, 208);
  ctx.quadraticCurveTo(220, 204, 246, 214);
  ctx.quadraticCurveTo(220, 214, 192, 216);
  ctx.closePath();
  const browHL = ctx.createLinearGradient(192, 208, 246, 214);
  browHL.addColorStop(0, skin.highlight);
  browHL.addColorStop(0.5, skin.specular);
  browHL.addColorStop(1, skin.highlight);
  ctx.fillStyle = browHL;
  ctx.fill();

  // 2. Left upper cheekbone blade (zygomatic arch prominence)
  ctx.beginPath();
  ctx.moveTo(180, 260);
  ctx.quadraticCurveTo(210, 262, 235, 276);
  ctx.quadraticCurveTo(208, 276, 182, 272);
  ctx.closePath();
  const cheekHL = ctx.createLinearGradient(180, 262, 235, 276);
  cheekHL.addColorStop(0, skin.highlight);
  cheekHL.addColorStop(0.4, skin.specular);
  cheekHL.addColorStop(1, skin.highlight);
  ctx.fillStyle = cheekHL;
  ctx.fill();

  // 3. Nasal bridge sharp ridge line
  ctx.beginPath();
  ctx.moveTo(249, 222);
  ctx.lineTo(247, 285);
  ctx.lineTo(252, 285);
  ctx.lineTo(252, 222);
  ctx.closePath();
  const noseRidgeHL = ctx.createLinearGradient(247, 222, 252, 285);
  noseRidgeHL.addColorStop(0, skin.highlight);
  noseRidgeHL.addColorStop(0.6, skin.specular);
  noseRidgeHL.addColorStop(1, skin.highlight);
  ctx.fillStyle = noseRidgeHL;
  ctx.fill();

  // 4. Tip of nose specular highlight
  ctx.beginPath();
  ctx.arc(249, 292, 6.5, 0, Math.PI * 2);
  const noseTipHL = ctx.createRadialGradient(248, 290, 1, 249, 292, 6.5);
  noseTipHL.addColorStop(0, skin.specular);
  noseTipHL.addColorStop(0.6, skin.highlight);
  noseTipHL.addColorStop(1, skin.midWarm);
  ctx.fillStyle = noseTipHL;
  ctx.fill();

  // 5. Chin specular button
  ctx.beginPath();
  ctx.arc(252, 398, 9, 0, Math.PI * 2);
  const chinHL = ctx.createRadialGradient(250, 396, 2, 252, 398, 9);
  chinHL.addColorStop(0, skin.specular);
  chinHL.addColorStop(0.7, skin.highlight);
  chinHL.addColorStop(1, 'transparent');
  ctx.fillStyle = chinHL;
  ctx.fill();

  // 6. Left temple rim light
  ctx.beginPath();
  ctx.moveTo(172, 180);
  ctx.quadraticCurveTo(168, 220, 172, 250);
  ctx.quadraticCurveTo(176, 220, 178, 180);
  ctx.closePath();
  ctx.fillStyle = skin.highlight;
  ctx.fill();
}

function drawHeavyInkShadows(ctx: CanvasRenderingContext2D) {
  // Heavy ink-black comic shadows (#0c070a)
  ctx.fillStyle = '#0c070a';

  // 1. Deep brow shadows & eye socket cavities
  // Left eye orbit shadow
  ctx.beginPath();
  ctx.moveTo(195, 214);
  ctx.quadraticCurveTo(225, 218, 244, 224);
  ctx.quadraticCurveTo(240, 235, 220, 234);
  ctx.quadraticCurveTo(200, 230, 195, 214);
  ctx.closePath();
  ctx.fill();

  // Right eye orbit shadow (deeper shadow on right side)
  ctx.beginPath();
  ctx.moveTo(266, 224);
  ctx.quadraticCurveTo(290, 218, 318, 216);
  ctx.quadraticCurveTo(318, 234, 295, 236);
  ctx.quadraticCurveTo(275, 236, 266, 224);
  ctx.closePath();
  ctx.fill();

  // 2. Right side of nose cast shadow (shadow side)
  ctx.beginPath();
  ctx.moveTo(258, 225);
  ctx.lineTo(274, 290);
  ctx.lineTo(262, 305);
  ctx.lineTo(252, 302);
  ctx.closePath();
  ctx.fill();

  // 3. Under-plane of nose & nostril cavities
  ctx.beginPath();
  ctx.moveTo(238, 298);
  ctx.quadraticCurveTo(250, 308, 266, 300);
  ctx.lineTo(260, 308);
  ctx.quadraticCurveTo(250, 312, 242, 306);
  ctx.closePath();
  ctx.fill();

  // Left & right nostrils
  ctx.beginPath();
  ctx.ellipse(242, 300, 3.5, 2.5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(262, 300, 3.5, 2.5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 4. Upper lip in deep ink shadow
  ctx.beginPath();
  ctx.moveTo(234, 346);
  ctx.quadraticCurveTo(248, 342, 256, 345);
  ctx.quadraticCurveTo(264, 342, 278, 346);
  ctx.quadraticCurveTo(268, 354, 256, 354);
  ctx.quadraticCurveTo(244, 354, 234, 346);
  ctx.closePath();
  ctx.fill();

  // 5. Labiomental groove (shadow beneath lower lip carving the chin)
  ctx.beginPath();
  ctx.moveTo(242, 370);
  ctx.quadraticCurveTo(256, 376, 270, 370);
  ctx.quadraticCurveTo(256, 373, 242, 370);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#0c070a';
  ctx.stroke();

  // 6. Submandibular shadow: Heavy graphic shadow cast by entire jawline onto neck!
  ctx.beginPath();
  ctx.moveTo(178, 345);
  ctx.quadraticCurveTo(185, 375, 230, 418);
  ctx.lineTo(282, 418);
  ctx.quadraticCurveTo(327, 375, 334, 345);
  // Shadow depth downwards onto neck
  ctx.lineTo(330, 370);
  ctx.quadraticCurveTo(310, 420, 275, 436);
  ctx.lineTo(237, 436);
  ctx.quadraticCurveTo(195, 420, 182, 370);
  ctx.closePath();
  ctx.fill();
}

function drawGrittyGladiatorEyes(ctx: CanvasRenderingContext2D, skin: SkinPalette) {
  // Heavy graphic comic eyebrows
  ctx.fillStyle = '#0c070a';
  // Left brow (angular warrior brow)
  ctx.beginPath();
  ctx.moveTo(182, 218);
  ctx.lineTo(215, 206);
  ctx.lineTo(246, 216);
  ctx.lineTo(244, 222);
  ctx.lineTo(215, 214);
  ctx.lineTo(185, 224);
  ctx.closePath();
  ctx.fill();

  // Right brow
  ctx.beginPath();
  ctx.moveTo(266, 218);
  ctx.lineTo(295, 208);
  ctx.lineTo(328, 220);
  ctx.lineTo(325, 226);
  ctx.lineTo(295, 216);
  ctx.lineTo(268, 224);
  ctx.closePath();
  ctx.fill();

  // Left Eye (X: 204 to 242, Y: 233)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(204, 234);
  ctx.quadraticCurveTo(223, 224, 242, 232);
  ctx.quadraticCurveTo(223, 242, 204, 234);
  ctx.closePath();
  ctx.clip();

  // Sclera
  ctx.fillStyle = '#ded095';
  ctx.fill();
  // Upper lid shadow in eye
  ctx.fillStyle = '#6e5f4f';
  ctx.fillRect(204, 224, 40, 5);

  // Iris
  ctx.beginPath();
  ctx.arc(224, 234, 7, 0, Math.PI * 2);
  ctx.fillStyle = skin.irisColor;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pupil
  ctx.beginPath();
  ctx.arc(224, 234, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();

  // Specular catchlight dot
  ctx.beginPath();
  ctx.arc(222, 232, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Left eye comic upper eyeliner
  ctx.beginPath();
  ctx.moveTo(202, 234);
  ctx.quadraticCurveTo(223, 222, 244, 232);
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Right Eye (X: 268 to 306, Y: 234)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(268, 232);
  ctx.quadraticCurveTo(287, 224, 306, 234);
  ctx.quadraticCurveTo(287, 242, 268, 232);
  ctx.closePath();
  ctx.clip();

  // Sclera in shadow
  ctx.fillStyle = '#bdae8c';
  ctx.fill();
  ctx.fillStyle = '#574838';
  ctx.fillRect(268, 224, 40, 6);

  // Iris
  ctx.beginPath();
  ctx.arc(286, 234, 7, 0, Math.PI * 2);
  ctx.fillStyle = skin.irisColor;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pupil
  ctx.beginPath();
  ctx.arc(286, 234, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();

  // Secondary catchlight
  ctx.beginPath();
  ctx.arc(284, 232, 1.4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Right eye comic upper eyeliner
  ctx.beginPath();
  ctx.moveTo(266, 232);
  ctx.quadraticCurveTo(287, 222, 308, 234);
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();
}

function drawNoseAndMouth(
  ctx: CanvasRenderingContext2D,
  skin: SkinPalette,
  config: PortraitConfig,
) {
  // Lower lip volume
  ctx.beginPath();
  ctx.moveTo(238, 354);
  ctx.quadraticCurveTo(256, 368, 274, 354);
  ctx.quadraticCurveTo(256, 356, 238, 354);
  ctx.closePath();
  const lipGrad = ctx.createLinearGradient(238, 354, 274, 368);
  lipGrad.addColorStop(0, skin.midWarm);
  lipGrad.addColorStop(0.5, skin.highlight);
  lipGrad.addColorStop(1, skin.shadow);
  ctx.fillStyle = lipGrad;
  ctx.fill();

  // Heavy jaw stubble / 5 o'clock shadow
  ctx.save();
  ctx.fillStyle = 'rgba(16, 10, 14, 0.4)';
  ctx.beginPath();
  ctx.moveTo(182, 340);
  ctx.quadraticCurveTo(210, 365, 235, 385);
  ctx.lineTo(277, 385);
  ctx.quadraticCurveTo(302, 365, 330, 340);
  ctx.lineTo(332, 360);
  ctx.quadraticCurveTo(315, 410, 270, 418);
  ctx.lineTo(242, 418);
  ctx.quadraticCurveTo(197, 410, 180, 360);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Thracian / Brawler specific scar & broken nose
  if (config.gladiatorClass === 'Thracian') {
    // Broken crooked nose bridge
    ctx.beginPath();
    ctx.moveTo(246, 245);
    ctx.lineTo(253, 265);
    ctx.lineTo(247, 280);
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Jagged brow scar
    ctx.beginPath();
    ctx.moveTo(202, 198);
    ctx.lineTo(206, 226);
    ctx.strokeStyle = '#fadc9b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawCharacterFeatures(
  ctx: CanvasRenderingContext2D,
  config: PortraitConfig,
  skin: SkinPalette,
) {
  const { culture, level = 1, heroType, gladiatorClass, npcType } = config;

  // 1. NPC TYPES (SENATOR, BROKER, MAGISTRATE, PRIESTESS, REBEL)
  if (npcType) {
    drawNpcFeatures(ctx, npcType as NpcPortraitType);
    return;
  }

  // 2. HERO: EMPEROR AURELIUS
  if (heroType === 'emperor') {
    drawEmperorFeatures(ctx);
    return;
  }

  // 3. HERO: LANISTA AULUS
  if (heroType === 'aulus' || (config.gladiatorClass === 'Legionary' && config.culture === 'roman' && level === 99)) {
    drawAulusFeatures(ctx);
    return;
  }

  // 4. HERO: SALADIN THE MEDIC
  if (heroType === 'saladin') {
    drawSaladinFeatures(ctx);
    return;
  }

  // 5. HERO: BEASTMASTER
  if (heroType === 'beastmaster') {
    drawBeastmasterFeatures(ctx);
    return;
  }

  // 6. HERO: ZUZUBU
  if (heroType === 'zuzubu') {
    drawZuzubuFeatures(ctx);
    return;
  }

  // 7. CULTURE SPECIFICS (RANK-EVOLVING HEADGEAR & WEAR)
  if (culture === 'celt') {
    drawCelticFeatures(ctx, level);
  } else if (culture === 'berber') {
    drawBerberFeatures(ctx, level);
  } else if (culture === 'scythian' || culture === 'hunnic') {
    drawSteppeFeatures(ctx, level);
  } else {
    // ROMAN / MURMILLO
    drawRomanMurmilloFeatures(ctx, level, gladiatorClass);
  }
}

function drawFacialScars(ctx: CanvasRenderingContext2D, level: number, skin: SkinPalette) {
  ctx.save();
  // Level 3-4 (Veteran): Hardened battle scar across left eyebrow and cheek
  ctx.beginPath();
  ctx.moveTo(206, 202);
  ctx.lineTo(214, 245);
  ctx.strokeStyle = '#9e323b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Highlight along scar edge (raised scar tissue)
  ctx.beginPath();
  ctx.moveTo(208, 202);
  ctx.lineTo(216, 245);
  ctx.strokeStyle = skin.specular || '#fadc9b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Stitch cross-notches
  const stitches = [[209, 214], [211, 226], [213, 238]];
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 1.5;
  stitches.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy - 2);
    ctx.lineTo(sx + 4, sy + 2);
    ctx.stroke();
  });

  // Level 5+ (Champion / Legend): Intimidating battle-hardened gaze, second deep scar across right cheek and jaw
  if (level >= 5) {
    ctx.beginPath();
    ctx.moveTo(278, 260);
    ctx.lineTo(315, 318);
    ctx.strokeStyle = '#821f29';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(280, 260);
    ctx.lineTo(317, 318);
    ctx.strokeStyle = skin.specular || '#fff0ce';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cross slash on cheek
    ctx.beginPath();
    ctx.moveTo(288, 298);
    ctx.lineTo(306, 275);
    ctx.strokeStyle = '#821f29';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Extra deep chiaroscuro shadow on right jaw
    ctx.fillStyle = 'rgba(12, 7, 10, 0.45)';
    ctx.beginPath();
    ctx.moveTo(290, 310);
    ctx.quadraticCurveTo(325, 360, 335, 330);
    ctx.lineTo(275, 410);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawAulusFeatures(ctx: CanvasRenderingContext2D) {
  // Lanista Aulus: Distinguished patrician master, dark curls swept back,
  // golden laurel wreath leaves glinting with radial gold highlights, draped white toga with crimson sash.

  // Swept back curls with silver highlights
  ctx.beginPath();
  ctx.moveTo(170, 210);
  ctx.bezierCurveTo(155, 140, 205, 90, 256, 90);
  ctx.bezierCurveTo(310, 90, 360, 140, 342, 210);
  ctx.quadraticCurveTo(315, 140, 256, 135);
  ctx.quadraticCurveTo(195, 140, 170, 210);
  ctx.closePath();
  const hairGrad = ctx.createLinearGradient(170, 90, 340, 200);
  hairGrad.addColorStop(0, '#382b26');
  hairGrad.addColorStop(0.5, '#211815');
  hairGrad.addColorStop(1, '#0c070a');
  ctx.fillStyle = hairGrad;
  ctx.fill();

  // Aristocratic silver hair strands
  ctx.strokeStyle = '#c9c2b9';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(190 + i * 22, 115 + (i % 2) * 8);
    ctx.quadraticCurveTo(215 + i * 20, 135, 230 + i * 18, 160);
    ctx.stroke();
  }

  // Golden laurel wreath crown around brow
  drawLaurelWreath(ctx, 256, 170, 78);

  // Patrician trim beard along jawline
  ctx.beginPath();
  ctx.moveTo(180, 340);
  ctx.quadraticCurveTo(190, 380, 230, 414);
  ctx.lineTo(282, 414);
  ctx.quadraticCurveTo(322, 380, 332, 340);
  ctx.quadraticCurveTo(315, 388, 275, 410);
  ctx.lineTo(237, 410);
  ctx.quadraticCurveTo(197, 388, 180, 340);
  ctx.closePath();
  ctx.fillStyle = '#261b17';
  ctx.fill();

  // White toga with crimson sash across left shoulder
  ctx.beginPath();
  ctx.moveTo(70, 512);
  ctx.quadraticCurveTo(120, 440, 195, 435);
  ctx.lineTo(215, 512);
  ctx.closePath();
  const togaGrad = ctx.createLinearGradient(70, 440, 215, 512);
  togaGrad.addColorStop(0, '#f2ece4');
  togaGrad.addColorStop(0.6, '#ded095');
  togaGrad.addColorStop(1, '#8c7b6d');
  ctx.fillStyle = togaGrad;
  ctx.fill();

  // Crimson sash
  ctx.beginPath();
  ctx.moveTo(140, 440);
  ctx.lineTo(240, 512);
  ctx.lineTo(275, 512);
  ctx.lineTo(175, 435);
  ctx.closePath();
  ctx.fillStyle = '#9e2a2b';
  ctx.fill();
}

function drawEmperorFeatures(ctx: CanvasRenderingContext2D) {
  // Emperor Aurelius: Proud patrician sneer, radiant golden laurel crown, imperial purple cloak with gold clasp.

  // Swept back curls
  ctx.beginPath();
  ctx.moveTo(168, 205);
  ctx.bezierCurveTo(155, 130, 205, 80, 256, 80);
  ctx.bezierCurveTo(310, 80, 360, 130, 344, 205);
  ctx.quadraticCurveTo(315, 135, 256, 130);
  ctx.quadraticCurveTo(195, 135, 168, 205);
  ctx.closePath();
  ctx.fillStyle = '#1e1410';
  ctx.fill();

  // Double radiant golden laurel crown
  drawLaurelWreath(ctx, 256, 160, 84, true);

  // Imperious patrician sneer (raised left corner of lip)
  ctx.beginPath();
  ctx.moveTo(234, 344);
  ctx.quadraticCurveTo(245, 338, 256, 344);
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawLaurelWreath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  isEmperor = false,
) {
  const leafCount = isEmperor ? 12 : 10;
  for (let i = 0; i < leafCount; i++) {
    const angle = Math.PI * 0.9 + (i / (leafCount - 1)) * Math.PI * 1.2;
    const lx = cx + Math.cos(angle) * radius;
    const ly = cy + Math.sin(angle) * (radius * 0.65);

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle + Math.PI / 2);

    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
    const goldGrad = ctx.createRadialGradient(-3, -2, 1, 0, 0, 14);
    goldGrad.addColorStop(0, '#fff6d6');
    goldGrad.addColorStop(0.4, '#e5be59');
    goldGrad.addColorStop(0.8, '#a67d26');
    goldGrad.addColorStop(1, '#52380d');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Central leaf vein
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.strokeStyle = '#fff8de';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

function drawCelticFeatures(ctx: CanvasRenderingContext2D, level = 1) {
  // Celtic Champion: Evolving from wild copper hair to bronze horned cap to crowned golden horns & heavy woad
  ctx.save();
  const copperGrad = ctx.createLinearGradient(120, 80, 390, 350);
  copperGrad.addColorStop(0, '#d97036');
  copperGrad.addColorStop(0.5, '#b85e33');
  copperGrad.addColorStop(1, '#5e250f');
  ctx.fillStyle = copperGrad;

  // Left hair cascade
  ctx.beginPath();
  ctx.moveTo(256, 90);
  ctx.bezierCurveTo(180, 80, 130, 130, 120, 220);
  ctx.bezierCurveTo(110, 300, 130, 380, 110, 480);
  ctx.bezierCurveTo(135, 470, 160, 400, 170, 340);
  ctx.quadraticCurveTo(175, 230, 256, 120);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Right hair cascade
  ctx.beginPath();
  ctx.moveTo(256, 90);
  ctx.bezierCurveTo(330, 80, 380, 130, 390, 220);
  ctx.bezierCurveTo(400, 300, 380, 380, 400, 480);
  ctx.bezierCurveTo(375, 470, 350, 400, 340, 340);
  ctx.quadraticCurveTo(335, 230, 256, 120);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Individual flowing hair strands
  ctx.strokeStyle = '#f09a58';
  ctx.lineWidth = 2.5;
  const strands = [
    [210, 110, 160, 170, 135, 250],
    [230, 100, 190, 150, 150, 230],
    [280, 100, 330, 150, 360, 240],
    [300, 110, 350, 170, 375, 260],
  ];
  strands.forEach(([x1, y1, cx, cy, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  });

  // Braided beard with beard-ring
  ctx.beginPath();
  ctx.moveTo(225, 405);
  ctx.quadraticCurveTo(240, 460, 248, 495);
  ctx.lineTo(264, 495);
  ctx.quadraticCurveTo(272, 460, 287, 405);
  ctx.closePath();
  ctx.fillStyle = '#b85e33';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Beard ring (Iron for Lvl 1-2, Bronze for Lvl 3-4, Gold for Lvl 5+)
  ctx.fillStyle = level >= 5 ? '#fadb93' : level >= 3 ? '#dfb558' : '#7f848e';
  ctx.fillRect(245, 465, 22, 10);
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(245, 465, 22, 10);

  // Woad blue cheek warpaint
  ctx.beginPath();
  ctx.moveTo(185, 245);
  ctx.lineTo(240, 275);
  ctx.lineTo(235, 290);
  ctx.lineTo(180, 260);
  ctx.closePath();
  ctx.fillStyle = 'rgba(58, 107, 136, 0.82)';
  ctx.fill();

  if (level >= 3) {
    // Level 3-4 (Veteran): Hardened bronze brow band with rivets
    ctx.beginPath();
    ctx.moveTo(170, 195);
    ctx.quadraticCurveTo(256, 175, 342, 195);
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#c49b42';
    ctx.stroke();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Metallic specular glint
    ctx.beginPath();
    ctx.moveTo(200, 190);
    ctx.lineTo(235, 185);
    ctx.strokeStyle = '#fff0ce';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  if (level >= 5) {
    // Level 5+ (Champion / Legend): Heavy ornate golden horned war-helm
    ctx.beginPath();
    // Left sweeping golden horn
    ctx.moveTo(185, 190);
    ctx.bezierCurveTo(130, 170, 100, 90, 120, 40);
    ctx.quadraticCurveTo(145, 90, 195, 170);
    ctx.closePath();
    // Right sweeping golden horn
    ctx.moveTo(327, 190);
    ctx.bezierCurveTo(382, 170, 412, 90, 392, 40);
    ctx.quadraticCurveTo(367, 90, 317, 170);
    ctx.closePath();
    const hornGrad = ctx.createLinearGradient(100, 40, 412, 190);
    hornGrad.addColorStop(0, '#fff4cc');
    hornGrad.addColorStop(0.5, '#e0b343');
    hornGrad.addColorStop(1, '#664a13');
    ctx.fillStyle = hornGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBerberFeatures(ctx: CanvasRenderingContext2D, level = 1) {
  // Berber / Numidian: Evolving from simple linen wrap to bronze clasp with mail cheek-veil to ornate gilded sultan-helm
  ctx.save();
  const indigoGrad = ctx.createLinearGradient(120, 80, 390, 300);
  indigoGrad.addColorStop(0, '#3a4b66');
  indigoGrad.addColorStop(0.5, '#263447');
  indigoGrad.addColorStop(1, '#151d29');
  ctx.fillStyle = indigoGrad;

  // Upper turban dome
  ctx.beginPath();
  ctx.moveTo(160, 210);
  ctx.bezierCurveTo(140, 110, 200, 70, 256, 70);
  ctx.bezierCurveTo(312, 70, 372, 110, 352, 210);
  ctx.quadraticCurveTo(310, 150, 256, 145);
  ctx.quadraticCurveTo(202, 150, 160, 210);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Draped folds across brow
  ctx.strokeStyle = '#5a739c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(165, 165);
  ctx.quadraticCurveTo(256, 130, 347, 170);
  ctx.stroke();

  // Draped litham tail on shoulder
  ctx.beginPath();
  ctx.moveTo(335, 230);
  ctx.quadraticCurveTo(370, 320, 360, 480);
  ctx.lineTo(325, 480);
  ctx.quadraticCurveTo(335, 330, 315, 250);
  ctx.closePath();
  ctx.fillStyle = indigoGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (level >= 3) {
    // Level 3-4 (Veteran): Bronze brow clasp with hanging iron mail cheek-guard
    ctx.beginPath();
    ctx.arc(256, 155, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#c49b42';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mail cheek-guard veil
    ctx.beginPath();
    ctx.moveTo(170, 240);
    ctx.lineTo(195, 340);
    ctx.lineTo(215, 340);
    ctx.lineTo(190, 240);
    ctx.closePath();
    ctx.fillStyle = '#47505c';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (level >= 5) {
    // Level 5+ (Champion / Legend): Ornate sculpted gilded desert helm with towering silk plumes
    ctx.beginPath();
    ctx.moveTo(246, 75);
    ctx.quadraticCurveTo(230, 20, 256, 10);
    ctx.quadraticCurveTo(282, 20, 266, 75);
    ctx.closePath();
    const plumeGrad = ctx.createLinearGradient(230, 10, 282, 75);
    plumeGrad.addColorStop(0, '#e5383b');
    plumeGrad.addColorStop(0.5, '#fadb93');
    plumeGrad.addColorStop(1, '#9e2226');
    ctx.fillStyle = plumeGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gilded face veil chain trim
    ctx.beginPath();
    ctx.moveTo(175, 260);
    ctx.quadraticCurveTo(256, 290, 337, 260);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fadb93';
    ctx.stroke();
  }
  ctx.restore();
}

function drawSteppeFeatures(ctx: CanvasRenderingContext2D, level = 1) {
  // Scythian / Hunnic: Evolving from simple pointed leather archer cap to iron spangenhelm to towering gilded stag/wolf dread-helm
  ctx.save();

  if (level <= 2) {
    // Level 1-2 (Recruit / Novice): Pointed leather bashlyk cap with fleece trim
    ctx.beginPath();
    ctx.moveTo(165, 190);
    ctx.bezierCurveTo(170, 120, 220, 60, 256, 50);
    ctx.bezierCurveTo(292, 60, 342, 120, 347, 190);
    ctx.quadraticCurveTo(256, 175, 165, 190);
    ctx.closePath();

    const capGrad = ctx.createLinearGradient(165, 50, 347, 190);
    capGrad.addColorStop(0, '#5a3d28');
    capGrad.addColorStop(0.5, '#422c1d');
    capGrad.addColorStop(1, '#24160e');
    ctx.fillStyle = capGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fleece trim
    ctx.beginPath();
    ctx.moveTo(158, 185);
    ctx.quadraticCurveTo(256, 170, 354, 185);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#d9cfbc';
    ctx.stroke();
  } else if (level <= 4) {
    // Level 3-4 (Veteran): Conical iron-plated spangenhelm with cheek-guards and bronze rivets
    ctx.beginPath();
    ctx.moveTo(165, 195);
    ctx.bezierCurveTo(175, 115, 215, 65, 256, 55);
    ctx.bezierCurveTo(297, 65, 337, 115, 347, 195);
    ctx.quadraticCurveTo(256, 175, 165, 195);
    ctx.closePath();

    const ironGrad = ctx.createLinearGradient(165, 55, 347, 195);
    ironGrad.addColorStop(0, '#575f6b');
    ironGrad.addColorStop(0.35, '#a6afb8'); // metallic specular
    ironGrad.addColorStop(0.7, '#383e47');
    ironGrad.addColorStop(1, '#1b1e24');
    ctx.fillStyle = ironGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Spangen bands & rivets
    ctx.beginPath();
    ctx.moveTo(250, 56);
    ctx.lineTo(246, 182);
    ctx.lineTo(266, 182);
    ctx.lineTo(262, 56);
    ctx.closePath();
    ctx.fillStyle = '#b07f35';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cheek flaps
    ctx.beginPath();
    ctx.moveTo(168, 200);
    ctx.quadraticCurveTo(162, 270, 180, 330);
    ctx.lineTo(202, 325);
    ctx.quadraticCurveTo(188, 270, 188, 200);
    ctx.closePath();
    ctx.fillStyle = '#383e47';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    // Level 5+ (Champion / Legend): Towering gilded kurgan dread-helm with golden stag antlers / wolf mask
    ctx.beginPath();
    ctx.moveTo(160, 200);
    ctx.bezierCurveTo(170, 105, 215, 55, 256, 45);
    ctx.bezierCurveTo(297, 45, 342, 105, 352, 200);
    ctx.quadraticCurveTo(256, 175, 160, 200);
    ctx.closePath();

    const goldDreadGrad = ctx.createLinearGradient(160, 45, 352, 200);
    goldDreadGrad.addColorStop(0, '#cda24d');
    goldDreadGrad.addColorStop(0.3, '#fff4cc'); // radiant specular glint
    goldDreadGrad.addColorStop(0.7, '#8f6826');
    goldDreadGrad.addColorStop(1, '#3b2507');
    ctx.fillStyle = goldDreadGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Golden Stag Antlers on helm crown
    ctx.beginPath();
    // Left antler
    ctx.moveTo(225, 60);
    ctx.quadraticCurveTo(180, 20, 165, -15);
    ctx.lineTo(178, -12);
    ctx.quadraticCurveTo(195, 25, 235, 65);
    // Right antler
    ctx.moveTo(287, 60);
    ctx.quadraticCurveTo(332, 20, 347, -15);
    ctx.lineTo(334, -12);
    ctx.quadraticCurveTo(317, 25, 277, 65);
    ctx.closePath();
    ctx.fillStyle = '#fff0ce';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Triple horsehair standards trailing
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(350, 190);
    ctx.quadraticCurveTo(395, 280, 385, 420);
    ctx.stroke();
  }

  // Long braided dark side lock falling over left chest
  ctx.beginPath();
  ctx.moveTo(175, 230);
  ctx.quadraticCurveTo(160, 320, 175, 460);
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#1e1410';
  ctx.stroke();
  ctx.strokeStyle = level >= 5 ? '#ffd27d' : '#a67d26';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(170, 440, 10, 6);

  ctx.restore();
}

function drawRomanMurmilloFeatures(
  ctx: CanvasRenderingContext2D,
  level: number,
  gladiatorClass?: string,
) {
  // Level 1-2 (Recruit / Novice): Basic unarmored / light leather, raw determination, unadorned brow
  if (level <= 2 && gladiatorClass !== 'Murmillo' && gladiatorClass !== 'Legionary') {
    ctx.save();
    // Swept dark Roman wavy hair with unadorned brow
    ctx.beginPath();
    ctx.moveTo(170, 210);
    ctx.bezierCurveTo(155, 140, 205, 95, 256, 95);
    ctx.bezierCurveTo(310, 95, 360, 140, 342, 210);
    ctx.quadraticCurveTo(315, 145, 256, 140);
    ctx.quadraticCurveTo(195, 145, 170, 210);
    ctx.closePath();
    const hairGrad = ctx.createLinearGradient(170, 95, 340, 210);
    hairGrad.addColorStop(0, '#2b1d18');
    hairGrad.addColorStop(0.5, '#19100d');
    hairGrad.addColorStop(1, '#0c070a');
    ctx.fillStyle = hairGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Simple raw leather brow strap
    ctx.beginPath();
    ctx.moveTo(172, 195);
    ctx.quadraticCurveTo(256, 180, 340, 195);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#52341f';
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0c070a';
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Level 3-4 (Veteran) & Level 5+ (Champion / Legend): Galea Helmet & Plumes
  ctx.save();

  if (level <= 4) {
    // Level 3-4 (Veteran): Iron/bronze cheek-guarded galea, red crest plume, metallic reflections
    ctx.beginPath();
    ctx.moveTo(250, 40);
    ctx.bezierCurveTo(230, 80, 236, 140, 240, 160);
    ctx.lineTo(272, 160);
    ctx.bezierCurveTo(276, 140, 282, 80, 262, 40);
    ctx.closePath();
    const plumeGrad = ctx.createLinearGradient(230, 40, 280, 160);
    plumeGrad.addColorStop(0, '#df3b40');
    plumeGrad.addColorStop(0.5, '#9e2226');
    plumeGrad.addColorStop(1, '#591215');
    ctx.fillStyle = plumeGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Helmet Bronze Galea Dome
    ctx.beginPath();
    ctx.moveTo(165, 195);
    ctx.bezierCurveTo(155, 115, 205, 90, 256, 90);
    ctx.bezierCurveTo(310, 90, 355, 115, 347, 195);
    ctx.quadraticCurveTo(256, 175, 165, 195);
    ctx.closePath();

    const galeaGrad = ctx.createLinearGradient(165, 90, 347, 195);
    galeaGrad.addColorStop(0, '#a67d3b');
    galeaGrad.addColorStop(0.3, '#fadc9b'); // metallic torch highlight
    galeaGrad.addColorStop(0.7, '#78531f');
    galeaGrad.addColorStop(1, '#3b250a');
    ctx.fillStyle = galeaGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Bronze brow visor rim
    ctx.beginPath();
    ctx.moveTo(158, 192);
    ctx.quadraticCurveTo(256, 172, 354, 192);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#c49b42';
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0c070a';
    ctx.stroke();

    // Cheek plates (paragnathides) framing jaw
    ctx.beginPath();
    ctx.moveTo(168, 200);
    ctx.quadraticCurveTo(165, 280, 185, 340);
    ctx.lineTo(205, 335);
    ctx.quadraticCurveTo(188, 280, 188, 200);
    ctx.closePath();
    ctx.fillStyle = galeaGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    // Level 5+ (Champion / Legend): Heavy ornate gilded / blackened steel armor, majestic triple plumes & crowned laurel
    // Majestic triple plumage (crimson, gold, white-hot crest)
    ctx.beginPath();
    ctx.moveTo(246, 20);
    ctx.bezierCurveTo(220, 70, 230, 140, 236, 160);
    ctx.lineTo(276, 160);
    ctx.bezierCurveTo(282, 140, 292, 70, 266, 20);
    ctx.closePath();
    const legendPlumeGrad = ctx.createLinearGradient(220, 20, 292, 160);
    legendPlumeGrad.addColorStop(0, '#fadc9b'); // radiant gold crest tip
    legendPlumeGrad.addColorStop(0.3, '#e5383b'); // royal crimson
    legendPlumeGrad.addColorStop(0.7, '#ba181b');
    legendPlumeGrad.addColorStop(1, '#3a080a');
    ctx.fillStyle = legendPlumeGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Galea dome in blackened steel & gold leaf
    ctx.beginPath();
    ctx.moveTo(162, 195);
    ctx.bezierCurveTo(152, 110, 202, 85, 256, 85);
    ctx.bezierCurveTo(310, 85, 360, 110, 350, 195);
    ctx.quadraticCurveTo(256, 172, 162, 195);
    ctx.closePath();

    const legendGaleaGrad = ctx.createLinearGradient(162, 85, 350, 195);
    legendGaleaGrad.addColorStop(0, '#1c1f24'); // blackened steel
    legendGaleaGrad.addColorStop(0.3, '#d4a843'); // ornate gold leaf
    legendGaleaGrad.addColorStop(0.5, '#fff6d1'); // specular reflection
    legendGaleaGrad.addColorStop(0.75, '#574218');
    legendGaleaGrad.addColorStop(1, '#15171a');
    ctx.fillStyle = legendGaleaGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Heavy sculpted gilded laurel wreath crowning visor
    drawLaurelWreath(ctx, 256, 185, 82, true);

    // Embossed lion cheek plates
    ctx.beginPath();
    ctx.moveTo(164, 200);
    ctx.quadraticCurveTo(160, 280, 182, 345);
    ctx.lineTo(208, 340);
    ctx.quadraticCurveTo(188, 280, 188, 200);
    ctx.closePath();
    ctx.fillStyle = '#cda24d';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function drawSaladinFeatures(ctx: CanvasRenderingContext2D) {
  // Saladin: Flowing deep emerald turban with gold gem clasp and wise weathered gaze.
  ctx.save();

  // Deep emerald silk turban wrapping cranium
  ctx.beginPath();
  ctx.moveTo(155, 200);
  ctx.bezierCurveTo(135, 105, 200, 65, 256, 65);
  ctx.bezierCurveTo(315, 65, 375, 105, 357, 200);
  ctx.quadraticCurveTo(310, 145, 256, 140);
  ctx.quadraticCurveTo(202, 145, 155, 200);
  ctx.closePath();

  const turbanGrad = ctx.createLinearGradient(140, 65, 370, 200);
  turbanGrad.addColorStop(0, '#388061');
  turbanGrad.addColorStop(0.5, '#20543d');
  turbanGrad.addColorStop(1, '#0e291d');
  ctx.fillStyle = turbanGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Ornate gold gem clasp at forehead center
  ctx.beginPath();
  ctx.arc(256, 142, 15, 0, Math.PI * 2);
  const goldClasp = ctx.createRadialGradient(253, 139, 2, 256, 142, 15);
  goldClasp.addColorStop(0, '#fff4cc');
  goldClasp.addColorStop(0.5, '#d4a843');
  goldClasp.addColorStop(1, '#664c12');
  ctx.fillStyle = goldClasp;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central gleaming sapphire/emerald stone
  ctx.beginPath();
  ctx.arc(256, 142, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#00f5b4';
  ctx.fill();

  // Well-groomed graying philosopher beard
  ctx.beginPath();
  ctx.moveTo(182, 340);
  ctx.quadraticCurveTo(190, 390, 230, 425);
  ctx.lineTo(282, 425);
  ctx.quadraticCurveTo(322, 390, 330, 340);
  ctx.quadraticCurveTo(310, 390, 275, 412);
  ctx.lineTo(237, 412);
  ctx.quadraticCurveTo(200, 390, 182, 340);
  ctx.closePath();
  ctx.fillStyle = '#7a7673';
  ctx.fill();

  ctx.restore();
}

function drawBeastmasterFeatures(ctx: CanvasRenderingContext2D) {
  // Beastmaster: Predator fur cowl with curved bone claws framing scarred face.
  ctx.save();

  // Predator fur cowl over cranium
  ctx.beginPath();
  ctx.moveTo(150, 220);
  ctx.bezierCurveTo(135, 110, 195, 75, 256, 75);
  ctx.bezierCurveTo(315, 75, 375, 110, 362, 220);
  ctx.quadraticCurveTo(315, 155, 256, 150);
  ctx.quadraticCurveTo(195, 155, 150, 220);
  ctx.closePath();

  const cowlGrad = ctx.createLinearGradient(140, 75, 370, 220);
  cowlGrad.addColorStop(0, '#694a32');
  cowlGrad.addColorStop(0.5, '#473120');
  cowlGrad.addColorStop(1, '#21150c');
  ctx.fillStyle = cowlGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Predator ears on cowl
  ctx.beginPath();
  ctx.arc(175, 95, 18, 0, Math.PI * 2);
  ctx.arc(337, 95, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#473120';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Curved bone claws framing the cheeks
  const leftClaws = [
    [155, 190, 180, 225],
    [150, 225, 175, 260],
    [150, 260, 172, 295],
  ];
  ctx.fillStyle = '#f0e6d2';
  leftClaws.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x1 + 18, (y1 + y2) / 2, x2, y2);
    ctx.quadraticCurveTo(x1 + 4, (y1 + y2) / 2, x1, y1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Deep predator claw scar across right cheek
  ctx.beginPath();
  ctx.moveTo(275, 255);
  ctx.lineTo(315, 320);
  ctx.strokeStyle = '#8a1f26';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(283, 255);
  ctx.lineTo(323, 320);
  ctx.strokeStyle = '#8a1f26';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}

function drawZuzubuFeatures(ctx: CanvasRenderingContext2D) {
  // Zuzubu: Tall chiseled Ethiopian warrior, leopard pelt headband
  // with spotted rosette patterns, piercing focused eyes.
  ctx.save();

  // Tight cropped dark curls
  ctx.beginPath();
  ctx.moveTo(172, 210);
  ctx.bezierCurveTo(165, 140, 205, 100, 256, 100);
  ctx.bezierCurveTo(307, 100, 347, 140, 340, 210);
  ctx.quadraticCurveTo(256, 170, 172, 210);
  ctx.closePath();
  ctx.fillStyle = '#0c070a';
  ctx.fill();

  // Leopard pelt headband across brow
  ctx.beginPath();
  ctx.moveTo(165, 188);
  ctx.quadraticCurveTo(256, 172, 347, 188);
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#d4a85b'; // tawny leopard coat base
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#0c070a';
  ctx.stroke();

  // Spotted rosette patterns on headband
  ctx.fillStyle = '#1c120c';
  const rosettes = [
    [185, 185], [210, 182], [235, 180], [260, 179],
    [285, 180], [310, 183], [330, 187],
  ];
  rosettes.forEach(([rx, ry], idx) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx + 2, ry - 1, 2, 0, Math.PI * 2);
    ctx.fillStyle = idx % 2 === 0 ? '#d4a85b' : '#ba873c';
    ctx.fill();
    ctx.fillStyle = '#1c120c';
  });

  ctx.restore();
}

function drawNpcFeatures(ctx: CanvasRenderingContext2D, npcType: NpcPortraitType) {
  ctx.save();
  if (npcType === 'shadow_broker') {
    // Shrouded in deep obsidian hood with only glowing predator eyes visible
    ctx.beginPath();
    ctx.moveTo(140, 230);
    ctx.bezierCurveTo(120, 100, 190, 60, 256, 60);
    ctx.bezierCurveTo(322, 60, 392, 100, 372, 230);
    ctx.quadraticCurveTo(256, 140, 140, 230);
    ctx.closePath();
    ctx.fillStyle = '#0e0b10';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Dark face veil
    ctx.fillStyle = 'rgba(10, 6, 12, 0.88)';
    ctx.fillRect(160, 240, 192, 180);

    // Glowing piercing cold eyes in shadow
    ctx.fillStyle = '#ffd27d';
    ctx.beginPath();
    ctx.ellipse(224, 234, 6, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(286, 234, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (npcType === 'priestess_bellona') {
    // Veiled ceremonial red brow mark priestess
    ctx.beginPath();
    ctx.moveTo(150, 220);
    ctx.bezierCurveTo(130, 90, 200, 70, 256, 70);
    ctx.bezierCurveTo(312, 70, 382, 90, 362, 220);
    ctx.closePath();
    ctx.fillStyle = '#7a1923';
    ctx.fill();

    // Sacred blood mark on forehead
    ctx.beginPath();
    ctx.arc(256, 195, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#c7222f';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    // Corrupt Senator / Magistrate: Toga drape with purple stripe and receding curls
    ctx.beginPath();
    ctx.moveTo(170, 205);
    ctx.bezierCurveTo(155, 140, 205, 95, 256, 95);
    ctx.bezierCurveTo(310, 95, 360, 140, 342, 205);
    ctx.closePath();
    ctx.fillStyle = '#211815';
    ctx.fill();

    // Senatorial purple border on shoulder
    ctx.beginPath();
    ctx.moveTo(130, 440);
    ctx.lineTo(165, 435);
    ctx.lineTo(215, 512);
    ctx.lineTo(180, 512);
    ctx.closePath();
    ctx.fillStyle = '#5c1b3c';
    ctx.fill();
  }
  ctx.restore();
}

function drawWarHorsePortrait(ctx: CanvasRenderingContext2D, config: PortraitConfig) {
  const level = config.level || 1;

  // 1. Muscular Equine Neck & Flank Base
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(110, 512);
  ctx.bezierCurveTo(150, 410, 200, 310, 240, 220); // Crest of neck
  ctx.lineTo(310, 260); // Throat
  ctx.bezierCurveTo(340, 340, 390, 430, 440, 512); // Chest/shoulder
  ctx.closePath();

  // Rich chestnut/bay coat gradient
  const coatGrad = ctx.createLinearGradient(120, 220, 400, 512);
  coatGrad.addColorStop(0, '#5a341e');
  coatGrad.addColorStop(0.35, '#7a4526');
  coatGrad.addColorStop(0.7, '#422414');
  coatGrad.addColorStop(1, '#1e0e09');
  ctx.fillStyle = coatGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Neck muscle definition (splenius & brachiocephalicus bands)
  ctx.beginPath();
  ctx.moveTo(220, 280);
  ctx.quadraticCurveTo(270, 370, 340, 470);
  ctx.strokeStyle = '#32190c';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Torchlight specular along neck crest
  ctx.beginPath();
  ctx.moveTo(200, 310);
  ctx.quadraticCurveTo(230, 260, 260, 210);
  ctx.strokeStyle = '#cb8a52';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // 2. Horse Head (Nasal bone, cheek, muzzle)
  ctx.beginPath();
  ctx.moveTo(240, 220);
  // Brow down to muzzle
  ctx.bezierCurveTo(250, 180, 290, 140, 350, 180);
  // Nose tip & upper lip
  ctx.quadraticCurveTo(400, 220, 420, 280);
  // Chin & lower jaw curve
  ctx.quadraticCurveTo(400, 310, 360, 290);
  // Jowl / cheek mass (mandible curve)
  ctx.bezierCurveTo(330, 340, 270, 330, 260, 270);
  ctx.closePath();

  const headGrad = ctx.createLinearGradient(250, 160, 410, 300);
  headGrad.addColorStop(0, '#824c2c');
  headGrad.addColorStop(0.4, '#63371f');
  headGrad.addColorStop(0.85, '#3b1e10');
  headGrad.addColorStop(1, '#1b0c06');
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Large muscular jowl / cheek plate
  ctx.beginPath();
  ctx.ellipse(300, 275, 38, 30, Math.PI * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#4f2b18';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dark muzzle & flared nostrils
  ctx.beginPath();
  ctx.ellipse(400, 265, 18, 14, Math.PI * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#1e110c';
  ctx.fill();
  // Nostril cavity
  ctx.beginPath();
  ctx.ellipse(404, 262, 7, 5, Math.PI * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();

  // 3. Piercing, intelligent warhorse eye
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(305, 205, 12, 8, -Math.PI * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();
  // Iris
  ctx.beginPath();
  ctx.arc(305, 205, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#4a2d12';
  ctx.fill();
  // Catchlight
  ctx.beginPath();
  ctx.arc(303, 203, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Heavy brow bone ridge above eye
  ctx.beginPath();
  ctx.moveTo(285, 195);
  ctx.quadraticCurveTo(310, 190, 325, 205);
  ctx.strokeStyle = '#8f5734';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 4. Alert, sculpted equine ears
  // Right ear (foreground)
  ctx.beginPath();
  ctx.moveTo(270, 160);
  ctx.quadraticCurveTo(275, 95, 290, 85);
  ctx.quadraticCurveTo(305, 95, 295, 165);
  ctx.closePath();
  ctx.fillStyle = '#6e3e23';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#32190c'; // inner ear
  ctx.beginPath();
  ctx.moveTo(278, 150);
  ctx.quadraticCurveTo(282, 105, 290, 95);
  ctx.quadraticCurveTo(298, 105, 290, 150);
  ctx.closePath();
  ctx.fill();

  // Left ear (background)
  ctx.beginPath();
  ctx.moveTo(240, 175);
  ctx.quadraticCurveTo(235, 115, 245, 105);
  ctx.quadraticCurveTo(260, 115, 255, 175);
  ctx.closePath();
  ctx.fillStyle = '#422414';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 5. Dark sweeping mane along neck crest
  const maneColor = '#140c08';
  ctx.fillStyle = maneColor;
  for (let i = 0; i < 7; i++) {
    const mx = 175 + i * 16;
    const my = 330 - i * 22;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(mx - 35, my + 15, mx - 45, my + 45);
    ctx.quadraticCurveTo(mx - 15, my + 25, mx + 15, my + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 6. Roman Bronze Chamfron (Head Armor Plate) & Bridle
  // Bronze Chamfron plate running down the forehead
  ctx.beginPath();
  ctx.moveTo(280, 170);
  ctx.lineTo(345, 150);
  ctx.lineTo(375, 230);
  ctx.lineTo(330, 255);
  ctx.closePath();
  const bronzeGrad = ctx.createLinearGradient(280, 150, 375, 255);
  bronzeGrad.addColorStop(0, '#fadb93');
  bronzeGrad.addColorStop(0.4, '#b07f35');
  bronzeGrad.addColorStop(1, '#473111');
  ctx.fillStyle = bronzeGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Embossed Imperial Eagle crest on chamfron
  ctx.beginPath();
  ctx.arc(330, 205, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#fff0ce';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Level 3+ Armor Upgrades: Crimson horsehair plume on chamfron
  if (level >= 3) {
    ctx.beginPath();
    ctx.moveTo(290, 150);
    ctx.quadraticCurveTo(270, 70, 305, 50);
    ctx.quadraticCurveTo(330, 70, 320, 150);
    ctx.closePath();
    const plumeGrad = ctx.createLinearGradient(280, 50, 320, 150);
    plumeGrad.addColorStop(0, '#e5383b');
    plumeGrad.addColorStop(0.5, '#ba181b');
    plumeGrad.addColorStop(1, '#660708');
    ctx.fillStyle = plumeGrad;
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Leather bridle straps & bronze bit ring
  ctx.strokeStyle = '#2b1a11';
  ctx.lineWidth = 6;
  // Noseband
  ctx.beginPath();
  ctx.moveTo(350, 230);
  ctx.lineTo(390, 275);
  ctx.stroke();
  // Cheek strap
  ctx.beginPath();
  ctx.moveTo(315, 185);
  ctx.lineTo(365, 280);
  ctx.stroke();
  // Throatlatch
  ctx.beginPath();
  ctx.moveTo(275, 175);
  ctx.lineTo(290, 310);
  ctx.stroke();

  // Bronze bit ring at mouth corner
  ctx.beginPath();
  ctx.arc(370, 282, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#fadb93';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}

function drawWarElephantPortrait(ctx: CanvasRenderingContext2D, config: PortraitConfig) {
  const level = config.level || 1;

  ctx.save();

  // 1. Colossal Weathered Stone-Gray Elephant Head Dome & Massive Ear
  // Left massive ear (flaring in background)
  ctx.beginPath();
  ctx.moveTo(180, 160);
  ctx.bezierCurveTo(70, 180, 40, 340, 90, 480);
  ctx.quadraticCurveTo(150, 460, 200, 380);
  ctx.closePath();
  const earGrad = ctx.createLinearGradient(40, 180, 200, 480);
  earGrad.addColorStop(0, '#5a5558');
  earGrad.addColorStop(0.6, '#3a3638');
  earGrad.addColorStop(1, '#1b191a');
  ctx.fillStyle = earGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Weathered skin folds on ear
  ctx.strokeStyle = '#242123';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(90 + i * 18, 250 + i * 25);
    ctx.quadraticCurveTo(120 + i * 15, 300 + i * 20, 150 + i * 10, 380);
    ctx.stroke();
  }

  // Head dome (massive skull)
  ctx.beginPath();
  ctx.moveTo(170, 260);
  ctx.bezierCurveTo(160, 130, 230, 70, 310, 70);
  ctx.bezierCurveTo(390, 70, 450, 130, 440, 250);
  ctx.quadraticCurveTo(400, 360, 350, 390);
  ctx.lineTo(240, 390);
  ctx.quadraticCurveTo(190, 350, 170, 260);
  ctx.closePath();

  const headGrad = ctx.createLinearGradient(160, 70, 440, 390);
  headGrad.addColorStop(0, '#787375');
  headGrad.addColorStop(0.35, '#948d90'); // lit forehead
  headGrad.addColorStop(0.7, '#4e4a4c');
  headGrad.addColorStop(1, '#242223');
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Heavy cranial wrinkles & skin texturing
  ctx.strokeStyle = '#322f30';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(230 + (i % 2) * 10, 130 + i * 18);
    ctx.quadraticCurveTo(305, 125 + i * 18, 380 - (i % 2) * 10, 132 + i * 18);
    ctx.stroke();
  }

  // 2. Observer intelligent dark eye with heavy wrinkled lids
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(360, 210, 10, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(360, 210, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#3d2516';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(358, 208, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Heavy skin folds framing eye
  ctx.beginPath();
  ctx.moveTo(340, 200);
  ctx.quadraticCurveTo(360, 192, 380, 202);
  ctx.moveTo(342, 220);
  ctx.quadraticCurveTo(360, 226, 378, 218);
  ctx.strokeStyle = '#242223';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. Mighty Curled Trunk descending from brow
  ctx.beginPath();
  ctx.moveTo(270, 290);
  ctx.bezierCurveTo(275, 360, 280, 430, 260, 480);
  ctx.quadraticCurveTo(285, 510, 315, 485);
  ctx.bezierCurveTo(330, 430, 335, 360, 340, 290);
  ctx.closePath();

  const trunkGrad = ctx.createLinearGradient(260, 290, 340, 500);
  trunkGrad.addColorStop(0, '#857e81');
  trunkGrad.addColorStop(0.5, '#5c5759');
  trunkGrad.addColorStop(1, '#2c2a2b');
  ctx.fillStyle = trunkGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Horizontal ring ridges on trunk
  ctx.strokeStyle = '#272526';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const ty = 315 + i * 22;
    ctx.beginPath();
    ctx.moveTo(275, ty);
    ctx.quadraticCurveTo(300, ty - 3, 330, ty);
    ctx.stroke();
  }

  // 4. Colossal Ivory Tusks with Bronze Ferrules / Reinforcing Bands
  // Right tusk (foreground sweeping forward & up)
  ctx.beginPath();
  ctx.moveTo(340, 360);
  ctx.bezierCurveTo(410, 370, 490, 330, 470, 220); // Sharp upward curve!
  ctx.quadraticCurveTo(460, 240, 435, 300);
  ctx.bezierCurveTo(410, 350, 360, 380, 330, 385);
  ctx.closePath();

  const tuskGrad = ctx.createLinearGradient(330, 380, 470, 220);
  tuskGrad.addColorStop(0, '#ebdcc7');
  tuskGrad.addColorStop(0.4, '#fff9e8');
  tuskGrad.addColorStop(0.8, '#f5e4cc');
  tuskGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = tuskGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Bronze tusk ferrule bands
  ctx.beginPath();
  ctx.moveTo(350, 365);
  ctx.lineTo(370, 375);
  ctx.lineTo(385, 355);
  ctx.lineTo(365, 345);
  ctx.closePath();
  ctx.fillStyle = '#b07f35';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Left tusk (partially visible behind trunk)
  ctx.beginPath();
  ctx.moveTo(260, 370);
  ctx.bezierCurveTo(200, 380, 150, 350, 160, 260);
  ctx.quadraticCurveTo(175, 310, 240, 390);
  ctx.closePath();
  ctx.fillStyle = '#d4c5b0';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 5. Carthaginian Spiked Bronze Chamfron (Head Armor)
  ctx.beginPath();
  ctx.moveTo(240, 95);
  ctx.lineTo(375, 95);
  ctx.lineTo(360, 200);
  ctx.lineTo(255, 200);
  ctx.closePath();
  const armorGrad = ctx.createLinearGradient(240, 95, 375, 200);
  armorGrad.addColorStop(0, '#fadb93');
  armorGrad.addColorStop(0.4, '#b07f35');
  armorGrad.addColorStop(1, '#473111');
  ctx.fillStyle = armorGrad;
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Armor spikes / bosses
  const spikes = [
    [270, 125], [310, 120], [350, 125],
    [280, 165], [335, 165],
  ];
  spikes.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fff0ce';
    ctx.fill();
    ctx.strokeStyle = '#0c070a';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Edge of Carthaginian Crimson & Gold War Howdah / Banner behind neck
  ctx.beginPath();
  ctx.moveTo(210, 70);
  ctx.lineTo(160, 20);
  ctx.lineTo(350, 20);
  ctx.lineTo(310, 70);
  ctx.closePath();
  ctx.fillStyle = '#9e2a2b';
  ctx.fill();
  ctx.strokeStyle = '#dfb558';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawFallenGladiatorOverlay(ctx: CanvasRenderingContext2D) {
  // Cold desaturating dark shroud
  ctx.save();
  ctx.fillStyle = 'rgba(12, 8, 10, 0.65)';
  ctx.fillRect(0, 0, 512, 512);

  // Stylized graphic fallen skull emblem in center
  ctx.save();
  ctx.translate(256, 256);
  ctx.beginPath();
  // Skull dome
  ctx.arc(0, -15, 42, Math.PI * 0.8, Math.PI * 0.2, false);
  ctx.lineTo(24, 25);
  ctx.lineTo(-24, 25);
  ctx.closePath();
  ctx.fillStyle = '#e8dec8';
  ctx.fill();
  ctx.strokeStyle = '#0c070a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Skull eye sockets
  ctx.beginPath();
  ctx.ellipse(-16, -10, 12, 15, -0.15, 0, Math.PI * 2);
  ctx.ellipse(16, -10, 12, 15, 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#0c070a';
  ctx.fill();

  // Nasal cavity
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(-6, 18);
  ctx.lineTo(6, 18);
  ctx.closePath();
  ctx.fill();

  // Teeth
  ctx.fillStyle = '#0c070a';
  ctx.fillRect(-18, 25, 36, 14);
  ctx.fillStyle = '#e8dec8';
  for (let t = -14; t <= 14; t += 7) {
    ctx.fillRect(t, 27, 4, 10);
  }
  ctx.restore();

  // Crimson banner text: FALLEN IN MEMORIAM
  ctx.fillStyle = '#9e2a2b';
  ctx.fillRect(100, 390, 312, 34);
  ctx.strokeStyle = '#fadc9b';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, 390, 312, 34);

  ctx.font = "bold 16px 'Cinzel', Georgia, serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff0ce';
  ctx.fillText('FALLEN IN MEMORIAM', 256, 413);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// UNIVERSAL API & DATA URL CACHING ENGINE
// ----------------------------------------------------------------------------

const cachedDataUrls: Record<string, string> = {};

export function getPortraitDataUrl(
  cultureOrGlad: any,
  sizeOrOptions?: any,
  silhouette = false,
  silhouetteColor = '#0c070a',
  level = 1,
  isDead = false,
  heroType?: HeroType | string,
  gladiatorClass?: GladiatorClass | string,
  npcType?: NpcPortraitType | string,
  isCavalry?: boolean,
  isElephant?: boolean,
): string {
  if (typeof document === 'undefined') return '';

  let config: PortraitConfig;

  if (typeof cultureOrGlad === 'object' && cultureOrGlad !== null) {
    const g = cultureOrGlad;
    const isDeceased = Boolean(
      g.isDead ||
      (typeof g.currentHp === 'number' && g.currentHp <= 0) ||
      (typeof g.hp === 'number' && g.hp <= 0) ||
      g.status === 'dead' ||
      g.status === 'fallen'
    );
    const resolvedHero = g.heroType || (g.id === 'aulus' || g.name === 'Lanista Aulus' ? 'aulus' : undefined);

    config = {
      culture: (g.culture || 'roman') as Culture,
      level: typeof g.level === 'number' ? g.level : 1,
      isDead: isDeceased,
      heroType: resolvedHero,
      gladiatorClass: g.gladiatorClass || g.class || g.archetype,
      npcType: g.npcType,
      isCavalry: Boolean(g.isCavalry || g.archetype === 'War Horse' || g.gladiatorClass === 'War Horse'),
      isElephant: Boolean(g.isElephant || g.archetype === 'War Elephant' || g.gladiatorClass === 'War Elephant'),
      silhouette: Boolean(sizeOrOptions?.silhouette || silhouette),
      silhouetteColor: (typeof sizeOrOptions === 'object' && sizeOrOptions?.silhouetteColor) || silhouetteColor,
    };
  } else {
    config = {
      culture: (cultureOrGlad || 'roman') as Culture,
      level: typeof level === 'number' ? level : 1,
      isDead: Boolean(isDead),
      heroType,
      gladiatorClass,
      npcType,
      isCavalry: Boolean(isCavalry || gladiatorClass === 'War Horse' || heroType === 'horse'),
      isElephant: Boolean(isElephant || gladiatorClass === 'War Elephant' || heroType === 'elephant'),
      silhouette: Boolean(silhouette),
      silhouetteColor,
    };
  }

  const cacheKey = `${config.culture}_${config.silhouette}_${config.silhouetteColor}_${config.level}_${config.isDead}_${config.heroType || ''}_${config.gladiatorClass || ''}_${config.npcType || ''}_${config.isCavalry ? 'cav' : ''}_${config.isElephant ? 'ele' : ''}`;
  if (cachedDataUrls[cacheKey]) {
    return cachedDataUrls[cacheKey];
  }

  // Render to 512x512 high-res canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  renderProceduralPortrait512(ctx, config);

  const url = canvas.toDataURL('image/png');
  cachedDataUrls[cacheKey] = url;
  return url;
}

export const getGladiatorHeadshotDataUrl = getPortraitDataUrl;

export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  cultureOrGlad: any,
  x: number,
  y: number,
  size = 512,
  options?: {
    silhouette?: boolean;
    silhouetteColor?: string;
    opacity?: number;
    level?: number;
    isDead?: boolean;
    heroType?: HeroType | string;
    gladiatorClass?: GladiatorClass | string;
    npcType?: NpcPortraitType | string;
  },
) {
  let dataUrl = '';
  if (typeof cultureOrGlad === 'object' && cultureOrGlad !== null) {
    dataUrl = getPortraitDataUrl(cultureOrGlad, options);
  } else {
    dataUrl = getPortraitDataUrl(
      cultureOrGlad,
      size,
      options?.silhouette,
      options?.silhouetteColor,
      options?.level,
      options?.isDead,
      options?.heroType,
      options?.gladiatorClass,
      options?.npcType,
    );
  }

  const img = new Image();
  img.src = dataUrl;
  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    if (options?.opacity !== undefined) {
      ctx.globalAlpha *= options.opacity;
    }
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  } else {
    img.onload = () => {
      ctx.save();
      if (options?.opacity !== undefined) {
        ctx.globalAlpha *= options.opacity;
      }
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    };
  }
}

export const renderGladiatorHeadshot = drawPortrait;

export function drawNpcPortrait(
  ctx: CanvasRenderingContext2D,
  portraitType: NpcPortraitType | string,
  x: number,
  y: number,
  size = 512,
  options?: {
    silhouette?: boolean;
    silhouetteColor?: string;
    opacity?: number;
  },
) {
  drawPortrait(ctx, 'roman', x, y, size, {
    ...options,
    npcType: portraitType as NpcPortraitType,
  });
}

export function getNpcPortraitDataUrl(
  portraitType: NpcPortraitType | string,
  size = 512,
  silhouette = false,
  silhouetteColor = '#0c070a',
): string {
  return getPortraitDataUrl(
    'roman',
    size,
    silhouette,
    silhouetteColor,
    1,
    false,
    undefined,
    undefined,
    portraitType as NpcPortraitType,
  );
}

export function drawAulusPortrait(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size = 512,
  options?: {
    silhouette?: boolean;
    silhouetteColor?: string;
    opacity?: number;
  },
) {
  drawPortrait(ctx, 'roman', x, y, size, {
    ...options,
    heroType: 'aulus',
  });
}

export function getAulusPortraitDataUrl(
  size = 512,
  silhouette = false,
  silhouetteColor = '#0c070a',
): string {
  return getPortraitDataUrl(
    'roman',
    size,
    silhouette,
    silhouetteColor,
    5,
    false,
    'aulus',
  );
}
