// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {drawAlpineRampartBackground, drawCleanArenaBackground, drawRiverValleyBackground, drawRomeInFlamesBackground} from './backgrounds';
import {getCrowdTier} from './crowdTier';
import {drawEyeCutIn} from './eyeCutIn';
import {drawCampCourtyardProps, drawCampSkyAndWalls} from '../camp/scene';
import {getSafeNow} from '../frameTime';
import {LOGIC_HEIGHT, LOGIC_WIDTH, PIXEL_SCALE} from '../primitives';
import {drawCulturalGladiator} from '../sprites/culturalGladiator';
import type {RenderView} from '../view';

export type ArenaSceneView = Pick<
  RenderView,
  | 'judgmentState'
  | 'activeTierRef'
  | 'isSandboxBattleRef'
  | 'animTimeRef'
  | 'unlockedTierIndex'
  | 'ludusUpgrades'
  | 'isEmperorDuelRef'
  | 'totalBattlesWonRef'
  | 'arenaFightersRef'
  | 'projectilesRef'
  | 'slashVfxRef'
>;

export type ArenaOverlayView = Pick<
  RenderView,
  | 'arenaFightersRef'
  | 'arenaSpeechBubblesRef'
  | 'canvasWidth'
>;

// ARENA scene: the low-res pixel pass (the final `else` of the old draw() mode chain).
export function drawArena(view: ArenaSceneView, offCtx: CanvasRenderingContext2D) {
  const {
    judgmentState,
    activeTierRef,
    isSandboxBattleRef,
    animTimeRef,
    unlockedTierIndex,
    ludusUpgrades,
    isEmperorDuelRef,
    totalBattlesWonRef,
    arenaFightersRef,
    projectilesRef,
    slashVfxRef,
  } = view;

  // 3. ARENA VIEW: Real-time Multi-Fighter Arena Duel (Rome in Flames or Standard Coliseum)
  const j = judgmentState;
  const isCinematic = j.active;
  const panY = isCinematic ? j.cameraPanY : 0;
  const posture = j.phase === 'verdict' ? j.verdict : 'standing';

  offCtx.save();
  if (isCinematic) {
    offCtx.translate(0, panY);
  }

  const curTier = activeTierRef.current;
  if (isSandboxBattleRef.current || curTier?.mapTheme === 'rome_flames') {
    drawRomeInFlamesBackground(offCtx, animTimeRef.current || 0);
  } else if (curTier?.mapTheme === 'river_rubicon' || curTier?.mapTheme === 'gallic_crossing') {
    drawRiverValleyBackground(offCtx, curTier?.fortifications, animTimeRef.current || 0);
  } else if (curTier?.mapTheme === 'alpine_rampart') {
    drawAlpineRampartBackground(offCtx, curTier?.fortifications, animTimeRef.current || 0);
  } else if (curTier?.mapTheme === 'camp_defense') {
    drawCampSkyAndWalls(offCtx, animTimeRef.current || 0, Math.min(5, unlockedTierIndex), 0);
    drawCampCourtyardProps(offCtx, null, animTimeRef.current || 0, ludusUpgrades);
  } else {
    const isBossOrSpec = isEmperorDuelRef.current || isSandboxBattleRef.current || !!curTier?.isBoss;
    const currentCrowdTier = getCrowdTier(unlockedTierIndex, totalBattlesWonRef.current, isBossOrSpec);
    drawCleanArenaBackground(
      offCtx,
      posture,
      isEmperorDuelRef.current,
      curTier?.mapTheme || 'standard',
      curTier?.fortifications,
      animTimeRef.current || 0,
      currentCrowdTier,
    );
  }

  const fighters = arenaFightersRef.current;

  // Draw all arena combatants sorted by Y for correct isometric depth
  const sortedFighters = [...fighters].sort((a, b) => a.y - b.y);

  for (const fighter of sortedFighters) {
    const isDeadFighter = fighter.hp <= 0 || fighter.isDead || fighter.state === 'death';
    const effectiveState = isDeadFighter ? 'death' : fighter.state;

    const isExecutioner =
      judgmentState.active &&
      (judgmentState.phase === 'execution_strike' || judgmentState.phase === 'execution_settle') &&
      fighter.id === judgmentState.executionerId;

    const execStance = isExecutioner
      ? {
          isExecutioner: true,
          strikeProgress: judgmentState.execStrikeProgress ?? 0,
        }
      : undefined;

    drawCulturalGladiator(
      offCtx,
      fighter.x,
      fighter.y,
      fighter.culture,
      effectiveState,
      fighter.flipX,
      fighter.animTimer,
      fighter.flashWhiteTimer,
      fighter.deathTimer,
      fighter.rageTimer,
      fighter.level,
      fighter.equipped,
      fighter.isCavalry,
      fighter.isElephant,
      isDeadFighter ? false : fighter.isCharging,
      isDeadFighter ? 0 : (fighter.stunTimer || 0),
      fighter.isEmperor,
      fighter.heroType,
      execStance,
      isDeadFighter,
    );
  }

  // Draw Ranged Projectiles (Javelins, Steppe Arrows, Sling Stones, Bolts, Piercing Tridents)
  projectilesRef.current.forEach((proj) => {
    offCtx.save();
    offCtx.translate(Math.round(proj.x), Math.round(proj.y));
    const rot = Math.atan2(proj.vy, proj.vx);
    offCtx.rotate(rot);

    if (proj.isStone) {
      // Sling stone projectile
      offCtx.fillStyle = PALETTE[5];
      offCtx.fillRect(-2, -2, 4, 4);
      offCtx.fillStyle = PALETTE[10];
      offCtx.fillRect(-1, -1, 3, 3);
      offCtx.fillStyle = PALETTE[11];
      offCtx.fillRect(0, 0, 1, 1);
    } else if (proj.isBolt) {
      // Crossbow bolt
      offCtx.fillStyle = PALETTE[14];
      offCtx.fillRect(-5, -1, 9, 2);
      offCtx.fillStyle = PALETTE[11]; // iron head
      offCtx.fillRect(4, -1, 4, 2);
      offCtx.fillStyle = PALETTE[0]; // gleaming tip
      offCtx.fillRect(8, 0, 1, 1);
      offCtx.fillStyle = PALETTE[3]; // crimson fletching
      offCtx.fillRect(-6, -2, 3, 4);
    } else if (proj.isPiercingTrident) {
      // Fuscina de Venator Throwing Trident (Piercing)
      offCtx.fillStyle = PALETTE[14]; // wood shaft
      offCtx.fillRect(-10, -1, 16, 2);
      offCtx.fillStyle = PALETTE[15]; // bronze socket
      offCtx.fillRect(6, -2, 2, 5);
      offCtx.fillStyle = PALETTE[11]; // three barbed prongs
      offCtx.fillRect(8, -3, 6, 1);
      offCtx.fillRect(8, 0, 7, 1);
      offCtx.fillRect(8, 3, 6, 1);
      offCtx.fillStyle = PALETTE[0]; // gleaming tips
      offCtx.fillRect(14, -3, 2, 1);
      offCtx.fillRect(15, 0, 2, 1);
      offCtx.fillRect(14, 3, 2, 1);
      // Piercing kinetic trail
      offCtx.fillStyle = 'rgba(222, 208, 149, 0.6)';
      offCtx.fillRect(-14, -1, 4, 2);
    } else {
      // Steppe lance / javelin or arrow
      offCtx.fillStyle = PALETTE[14]; // wood shaft
      offCtx.fillRect(-7, -1, 14, 2);
      offCtx.fillStyle = PALETTE[11]; // steel head
      offCtx.fillRect(5, -1, 4, 2);
      offCtx.fillStyle = PALETTE[0]; // gleaming tip
      offCtx.fillRect(9, 0, 1, 1);

      if (proj.isCrit) {
        offCtx.fillStyle = PALETTE[15]; // critical gold trail
        offCtx.fillRect(-9, -1, 2, 2);
      }
    }
    offCtx.restore();
  });

  // Render Stylized White Pixel Slash VFX & Blade Clash
  slashVfxRef.current.forEach((slash) => {
    offCtx.save();
    offCtx.translate(slash.x, slash.y);
    offCtx.rotate(slash.angle);

    if (slash.isClash) {
      // Crossed / clashing dual-slash spark VFX
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(-9, -1, 18, 2);
      offCtx.fillRect(-6, -3, 12, 2);
      offCtx.fillRect(-2, -5, 4, 2);
      offCtx.fillStyle = '#F7DEAA';
      offCtx.fillRect(-1, -9, 2, 18);
      offCtx.fillRect(-3, -6, 2, 12);
      offCtx.fillRect(-5, -2, 2, 4);
      // Central brilliant clash spark
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(-2, -2, 4, 4);
      offCtx.fillStyle = PALETTE[0];
      offCtx.fillRect(-4, -4, 2, 2);
      offCtx.fillRect(2, 2, 2, 2);
      offCtx.fillRect(2, -4, 2, 2);
      offCtx.fillRect(-4, 2, 2, 2);
    } else {
      // Sharp, stylized white pixel arc / slash effect (#ffffff / #F7DEAA) for 2 frames
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(-8, -1, 16, 2);
      offCtx.fillRect(-5, -2, 10, 2);
      offCtx.fillRect(-2, -3, 5, 2);
      offCtx.fillStyle = '#F7DEAA';
      offCtx.fillRect(-7, 1, 14, 1);
      offCtx.fillRect(-4, -4, 2, 1);
      offCtx.fillRect(2, -4, 2, 1);
    }
    offCtx.restore();
  });

  // Advance framesLeft for 2-frame slash rendering
  slashVfxRef.current = slashVfxRef.current
    .map((s) => ({ ...s, framesLeft: s.framesLeft - 1 }))
    .filter((s) => s.framesLeft > 0);

  offCtx.restore();

  // EMPEROR'S JUDGMENT CINEMATIC OVERLAYS (Phase 2 Eye Cut-In, Phase 3 Flash & Verdict Banner)
  if (isCinematic) {
    const now = getSafeNow();
    const elapsed = Math.max(0, (now - j.startTime) / 1000);

    if (j.phase === 'eye_cut_in') {
      const eyeTime = Math.max(0, elapsed - 6.0);
      drawEyeCutIn(offCtx, eyeTime);
    } else if (j.phase === 'flash') {
      const flashProgress = Math.max(0, Math.min(1, (elapsed - 8.2) / 0.2));
      offCtx.save();
      offCtx.fillStyle = '#FFFFFF';
      offCtx.globalAlpha = 1 - flashProgress;
      offCtx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);
      offCtx.restore();
    } else if (j.phase === 'verdict') {
      // Clean subtle stone pedestal base on canvas; crisp typography rendered in DOM overlay
      offCtx.save();
      const isMercy = j.verdict === 'thumbs_up';
      const bannerY = 150;
      const bannerW = 220;
      const bannerX = Math.round((LOGIC_WIDTH - bannerW) / 2);

      offCtx.fillStyle = isMercy ? '#2A1B19' : '#3f1a18';
      offCtx.fillRect(bannerX, bannerY, bannerW, 24);
      offCtx.strokeStyle = isMercy ? '#ded095' : '#9e4a42';
      offCtx.lineWidth = 1;
      offCtx.strokeRect(bannerX, bannerY, bannerW, 24);
      offCtx.restore();
    }
  }
}

// ARENA overlay: crisp nameplates and bars on the display canvas after the blit.
// The Emperor's-Judgment early-out stays in renderFrame so it still skips the gold coins too.
export function drawArenaOverlay(view: ArenaOverlayView, displayCtx: CanvasRenderingContext2D) {
  const {
    arenaFightersRef,
    arenaSpeechBubblesRef,
    canvasWidth,
  } = view;

  displayCtx.save();
  displayCtx.imageSmoothingEnabled = true;

  const fighters = arenaFightersRef.current;
  for (const fighter of fighters) {
    if (fighter.hp <= 0 && fighter.deathTimer <= 0) continue;

    // Convert logic coordinates (344x192) to high-res display coordinates (1376x768)
    const dispX = fighter.x * PIXEL_SCALE;
    const dispY = (fighter.y - 34) * PIXEL_SCALE;

    // Fighter Nameplate
    displayCtx.font = "bold 13px 'Cinzel', serif";
    displayCtx.textAlign = 'center';
    displayCtx.fillStyle = '#090d16';
    displayCtx.fillText(fighter.name, dispX + 1, dispY - 11);
    displayCtx.fillStyle = fighter.isPlayerTeam ? '#ded095' : '#cb9f6b';
    displayCtx.fillText(fighter.name, dispX, dispY - 12);

    // Overhead Health Bar (Crisp Vector - No Stamina Bar, Health Only)
    const barW = 68;
    const barH = 7;
    const barX = dispX - barW / 2;
    const hpPct = Math.max(0, fighter.hp / fighter.maxHp);

    displayCtx.fillStyle = 'rgba(20, 20, 24, 0.85)';
    displayCtx.fillRect(barX - 1, dispY - 8, barW + 2, barH + 2);
    displayCtx.fillStyle = fighter.isPlayerTeam ? '#55796f' : '#9e4a42';
    displayCtx.fillRect(barX, dispY - 7, Math.round(barW * hpPct), barH);
    displayCtx.strokeStyle = '#ded095';
    displayCtx.lineWidth = 1;
    displayCtx.strokeRect(barX - 1, dispY - 8, barW + 2, barH + 2);
  }

  // FLOATING ARENA COMBAT SPEECH BUBBLES (Max 2 concurrent, crisp typography, clean fade)
  const activeArenaBubbles = arenaSpeechBubblesRef.current;
  for (const bubble of activeArenaBubbles) {
    const fighter = fighters.find((f) => f.id === bubble.fighterId);
    if (!fighter || (fighter.hp <= 0 && fighter.deathTimer <= 0)) continue;

    const dispX = Math.round(fighter.x * PIXEL_SCALE);
    const dispY = Math.round((fighter.y - 46) * PIXEL_SCALE);

    let alpha = 1.0;
    if (bubble.timer < 0.6) {
      alpha = Math.max(0, bubble.timer / 0.6);
    } else if (bubble.timer > bubble.maxDuration - 0.25) {
      alpha = Math.max(0, (bubble.maxDuration - bubble.timer) / 0.25);
    }

    displayCtx.save();
    displayCtx.globalAlpha = alpha;

    // Wrap and measure text
    displayCtx.font = "italic 12px Georgia, serif";
    const maxTextWidth = 175;
    const words = bubble.text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = displayCtx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 16;
    let maxMeasuredW = 0;
    for (const line of lines) {
      const w = displayCtx.measureText(line).width;
      if (w > maxMeasuredW) maxMeasuredW = w;
    }

    const bubbleW = Math.max(105, Math.round(maxMeasuredW + 20));
    const bubbleH = Math.round(lines.length * lineHeight + 20);

    let bubbleX = Math.round(dispX - bubbleW / 2);
    bubbleX = Math.max(16, Math.min(canvasWidth - bubbleW - 16, bubbleX));
    const bubbleY = Math.round(dispY - bubbleH);

    const arrowTipX = Math.max(bubbleX + 10, Math.min(bubbleX + bubbleW - 10, dispX));
    const arrowTipY = dispY + 3;

    // Drop shadow for crisp arena contrast
    displayCtx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    displayCtx.shadowBlur = 8;
    displayCtx.shadowOffsetY = 3;

    // Balloon shape
    const r = 5;
    displayCtx.beginPath();
    displayCtx.moveTo(bubbleX + r, bubbleY);
    displayCtx.lineTo(bubbleX + bubbleW - r, bubbleY);
    displayCtx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + r);
    displayCtx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - r);
    displayCtx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - r, bubbleY + bubbleH);

    // Downward pointer arrow
    displayCtx.lineTo(arrowTipX + 6, bubbleY + bubbleH);
    displayCtx.lineTo(arrowTipX, arrowTipY);
    displayCtx.lineTo(arrowTipX - 6, bubbleY + bubbleH);

    displayCtx.lineTo(bubbleX + r, bubbleY + bubbleH);
    displayCtx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - r);
    displayCtx.lineTo(bubbleX, bubbleY + r);
    displayCtx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r, bubbleY);
    displayCtx.closePath();

    displayCtx.fillStyle = fighter.isPlayerTeam ? '#ded095' : '#cb9f6b';
    displayCtx.fill();

    displayCtx.shadowColor = 'transparent';
    displayCtx.lineWidth = 1.5;
    displayCtx.strokeStyle = fighter.isPlayerTeam ? '#7f644b' : '#3f363b';
    displayCtx.stroke();

    // Speaker name header
    displayCtx.textAlign = 'left';
    displayCtx.font = "bold 9px 'Cinzel', serif";
    displayCtx.fillStyle = fighter.isPlayerTeam ? '#9e4a42' : '#3f363b';
    displayCtx.fillText(bubble.speakerName.toUpperCase(), bubbleX + 9, bubbleY + 12);

    // Dialogue text
    displayCtx.font = "bold italic 11px Georgia, serif";
    displayCtx.fillStyle = '#1c1719';
    lines.forEach((line, idx) => {
      displayCtx.fillText(line, bubbleX + 9, bubbleY + 24 + idx * lineHeight);
    });

    displayCtx.restore();
  }

  displayCtx.restore();
}
