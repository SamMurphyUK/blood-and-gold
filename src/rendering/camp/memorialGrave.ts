// Moved verbatim out of App.tsx (Stage 2A rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawDitherShadow} from '../primitives';
import type {MemorialGrave} from '../../types';

// ============================================================================
// CULTURAL GRAVES ON CAMP FIELD (ROMAN, CELTIC, BERBER, SCYTHIAN, HUNNIC)
// ============================================================================

export function drawCulturalGrave(
  ctx: CanvasRenderingContext2D,
  grave: MemorialGrave,
  isHovered: boolean,
  animTimer: number,
) {
  if (!grave) return;
  const x = Math.round(grave.x || 0);
  const y = Math.round(grave.y || 0);
  const safeAnim = animTimer || 0;
  const culture = grave.culture || 'roman';

  ctx.save();
  ctx.translate(x, y);

  // Ground shadow under grave
  drawDitherShadow(ctx, 0, 1, 9, 3, PALETTE[5]);

  if (isHovered) {
    // Subtle reverence shadow warmth at base of memorial marker (no flashing box/square overlay)
    drawDitherShadow(ctx, 0, 1, 11, 4, PALETTE[15]);
  }

  if (culture === 'roman') {
    // Roman: Carved stone stele / marble altar pillar inscribed with an eagle or laurel motif
    // 1. Pedestal base
    ctx.fillStyle = PALETTE[10]; // weathered stone gray
    ctx.fillRect(-8, -2, 16, 3);
    ctx.fillStyle = PALETTE[11]; // warm limestone highlight
    ctx.fillRect(-7, -2, 14, 1);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-8, 1, 16, 1);

    // 2. Vertical marble altar pillar / stele
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-6, -18, 12, 16);
    ctx.fillStyle = PALETTE[0]; // pale highlight edge
    ctx.fillRect(-6, -18, 2, 16);
    ctx.fillStyle = PALETTE[10]; // right shade edge
    ctx.fillRect(4, -18, 2, 16);

    // 3. Cornice / pediment capital roof
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-7, -21, 14, 3);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(-6, -21, 12, 1);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-4, -23, 8, 2);
    ctx.fillRect(-2, -24, 4, 1);

    // 4. Inscribed Eagle / Laurel motif in bronze/gold
    ctx.fillStyle = PALETTE[15]; // bronze / antique gold
    ctx.fillRect(-4, -15, 8, 2); // eagle wing span
    ctx.fillRect(-1, -16, 2, 4); // eagle body/head
    ctx.fillRect(-5, -14, 2, 2); // left wingtip
    ctx.fillRect(3, -14, 2, 2);  // right wingtip
    ctx.fillStyle = PALETTE[0];  // golden laurel highlight
    ctx.fillRect(-1, -12, 2, 2);

    // 5. Inscription lines carved into stone
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-4, -9, 8, 1);
    ctx.fillRect(-3, -7, 6, 1);
    ctx.fillRect(-4, -5, 8, 1);

    // 6. Offering cup at base with eternal ember flame
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(-2, -3, 4, 2);
    const flameFlicker = Math.floor(animTimer * 10) % 2 === 0;
    ctx.fillStyle = flameFlicker ? PALETTE[3] : PALETTE[2];
    ctx.fillRect(-1, -5, 2, 2);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(0, -6, 1, 1);
  } else if (grave.culture === 'celt') {
    // Celtic: Moss-covered standing menhir stone / Celtic circular cross carved in rough slate
    // 1. Slate Menhir monolith body (rough, tapered)
    ctx.fillStyle = PALETTE[6]; // slate blue-gray
    ctx.fillRect(-6, -20, 12, 21);
    ctx.fillRect(-5, -23, 10, 3);
    ctx.fillRect(-4, -25, 7, 2);
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-5, -20, 2, 20);
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(4, -20, 2, 21);

    // 2. Celtic circular ring cross carved into slate face
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-1, -19, 2, 14); // vertical shaft
    ctx.fillRect(-5, -14, 10, 2); // horizontal crossbar
    ctx.fillRect(-4, -17, 8, 1);  // circular halo top
    ctx.fillRect(-4, -10, 8, 1);  // circular halo bottom
    ctx.fillRect(-4, -16, 1, 6);  // left arc
    ctx.fillRect(3, -16, 1, 6);   // right arc
    ctx.fillStyle = PALETTE[0];   // center knotwork
    ctx.fillRect(-1, -14, 2, 2);

    // 3. Moss patches on stone
    ctx.fillStyle = PALETTE[12]; // mossy olive drab
    ctx.fillRect(-6, -8, 3, 5);
    ctx.fillRect(-5, -22, 2, 3);
    ctx.fillRect(2, -4, 4, 4);
    ctx.fillStyle = PALETTE[8];  // olive sage highlight
    ctx.fillRect(-6, -6, 2, 2);
    ctx.fillRect(3, -3, 2, 2);

    // 4. Wild purple heather flowers at stone base
    ctx.fillStyle = PALETTE[4]; // wine / heather bloom
    ctx.fillRect(-8, -2, 2, 2);
    ctx.fillRect(6, -2, 2, 2);
    ctx.fillStyle = PALETTE[12];
    ctx.fillRect(-7, 0, 1, 2);
    ctx.fillRect(7, 0, 1, 2);
  } else if (grave.culture === 'berber') {
    // Berber: Desert stone cairn wrapped with woven prayer cloth and desert stones
    // 1. Bottom stones layer
    ctx.fillStyle = PALETTE[14]; // raw umber stone
    ctx.fillRect(-8, -4, 6, 4);
    ctx.fillStyle = PALETTE[1];  // sand ochre stone
    ctx.fillRect(-3, -5, 7, 5);
    ctx.fillStyle = PALETTE[2];  // terracotta stone
    ctx.fillRect(3, -4, 6, 4);

    // 2. Middle stone tier
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-6, -9, 6, 5);
    ctx.fillStyle = PALETTE[1];
    ctx.fillRect(-1, -10, 7, 6);

    // 3. Woven prayer cloth sash wrapped around middle stones
    ctx.fillStyle = PALETTE[4]; // burgundy woven sash
    ctx.fillRect(-7, -8, 14, 3);
    ctx.fillStyle = PALETTE[0]; // pale fringe and border
    ctx.fillRect(-7, -8, 14, 1);
    ctx.fillRect(-7, -6, 14, 1);
    // Hanging woven ribbon tail
    ctx.fillStyle = PALETTE[4];
    ctx.fillRect(-5, -5, 2, 5);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(-5, 0, 2, 1);

    // 4. Upper tier and desert capstone
    ctx.fillStyle = PALETTE[2];
    ctx.fillRect(-4, -14, 8, 5);
    ctx.fillStyle = PALETTE[1]; // sand ochre capstone
    ctx.fillRect(-3, -18, 6, 4);
    ctx.fillStyle = PALETTE[15]; // bronze sun glint
    ctx.fillRect(-2, -18, 4, 1);

    // 5. Desert pebble ring at base
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-10, 0, 2, 1);
    ctx.fillRect(9, 0, 2, 1);
    ctx.fillRect(-6, 1, 2, 1);
    ctx.fillRect(5, 1, 2, 1);
  } else if (grave.culture === 'scythian') {
    // Scythian: Kurgan burial mound marker topped with a bronze spear/arrow totem
    // 1. Kurgan earthen burial mound
    ctx.fillStyle = PALETTE[14]; // raw umber earth
    ctx.fillRect(-10, -5, 20, 6);
    ctx.fillStyle = PALETTE[12]; // mossy olive turf
    ctx.fillRect(-9, -7, 18, 4);
    ctx.fillRect(-7, -9, 14, 3);
    ctx.fillRect(-4, -10, 8, 2);
    ctx.fillStyle = PALETTE[8];  // sage grass highlight
    ctx.fillRect(-8, -7, 5, 2);
    ctx.fillRect(2, -7, 5, 2);

    // 2. Upright bronze spear / totem pole planted deep in mound
    ctx.fillStyle = PALETTE[14]; // dark wood pole
    ctx.fillRect(-1, -22, 2, 15);

    // 3. Bronze spearhead pointing upwards
    ctx.fillStyle = PALETTE[15]; // antique bronze
    ctx.fillRect(-2, -26, 4, 4);
    ctx.fillRect(-1, -29, 2, 3);
    ctx.fillStyle = PALETTE[0];  // glittering spearhead tip
    ctx.fillRect(0, -30, 1, 2);

    // 4. Crossbar arrow fletching / totem wings
    ctx.fillStyle = PALETTE[15];
    ctx.fillRect(-6, -24, 12, 1);
    ctx.fillStyle = PALETTE[0];
    ctx.fillRect(-6, -26, 2, 3);
    ctx.fillRect(4, -26, 2, 3);

    // 5. Crimson prayer ribbon tied below spearhead fluttering in wind
    ctx.fillStyle = PALETTE[3];
    const ribbonWave = Math.floor(animTimer * 6) % 2 === 0 ? 1 : 0;
    ctx.fillRect(1, -22, 4 + ribbonWave, 2);
    ctx.fillRect(3 + ribbonWave, -20, 2, 2);
  } else {
    // Hunnic: Timber post notched with horse-tail horsehair crest and iron battle studs
    // 1. Heavy dark timber post
    ctx.fillStyle = PALETTE[5];  // charred dark iron
    ctx.fillRect(-4, -22, 8, 23);
    ctx.fillStyle = PALETTE[14]; // raw umber wood grain
    ctx.fillRect(-3, -22, 3, 22);

    // 2. Notched tribal cuts in wood
    ctx.fillStyle = PALETTE[5];
    ctx.fillRect(-3, -16, 5, 1);
    ctx.fillRect(-2, -12, 4, 1);
    ctx.fillRect(-3, -8, 5, 1);

    // 3. Iron battle studs driven into post
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-2, -19, 2, 2);
    ctx.fillRect(1, -15, 2, 2);
    ctx.fillRect(-2, -10, 2, 2);
    ctx.fillRect(1, -6, 2, 2);

    // 4. Iron collar ring at top of post
    ctx.fillStyle = PALETTE[10];
    ctx.fillRect(-5, -23, 10, 2);
    ctx.fillStyle = PALETTE[11];
    ctx.fillRect(-4, -24, 8, 1);

    // 5. Horsehair crest / horse-tail hanging from the timber post
    const tailSway = Math.floor(animTimer * 5) % 2 === 0 ? 1 : 0;
    ctx.fillStyle = PALETTE[0]; // pale horsehair
    ctx.fillRect(4, -22, 3, 10);
    ctx.fillRect(4 + tailSway, -12, 3, 8);
    ctx.fillStyle = PALETTE[9]; // dark charcoal strands
    ctx.fillRect(5, -21, 1, 9);
    ctx.fillRect(5 + tailSway, -11, 1, 7);
  }

  // Memorial graves in camp remain clean with eternal embers/offerings (no flies in camp)
  ctx.restore();
}
