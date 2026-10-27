// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

import {PALETTE} from '../../../constants';
import {CULTURE_LABELS} from '../../data/cultures';
import {KEEPER_POST_FIFTH_PANELS} from '../../data/keeper';
import {DUMMY_TEXT_1, DUMMY_TEXT_2, POST_BATTLE_TENT_TEXT, POST_BATTLE_TEXT_1, POST_BATTLE_TEXT_2, TUTORIAL_TEXT_ARMORY, TUTORIAL_TEXT_TENT, TUTORIAL_TEXT_WARNING} from '../../data/tutorial';
import {drawSaladinHealingAura} from '../arena/healingAura';
import {getSmoothDayNightTint} from './dayNight';
import {drawFeastSlaves, drawFeastTable} from './feast';
import {drawCulturalGrave} from './memorialGrave';
import {drawCampCourtyardProps, drawCampSkyAndWalls} from './scene';
import {drawRomanCivilianCourier} from '../npcs/courier';
import {drawDevoteeSprite} from '../npcs/devotee';
import {drawTravelingMerchant} from '../npcs/merchant';
import {drawPhysicianNpc} from '../npcs/physician';
import {drawVisitorNpc} from '../npcs/visitor';
import {LOGIC_HEIGHT, LOGIC_WIDTH, PIXEL_SCALE, drawSoftAmbientBloom} from '../primitives';
import {drawCulturalGladiator} from '../sprites/culturalGladiator';
import {drawManagerTutorialBox} from '../ui/tutorialBox';
import type {RenderView} from '../view';

export type CampSceneView = Pick<
  RenderView,
  | 'camZoomRef'
  | 'camXRef'
  | 'camYRef'
  | 'campShootingStarActiveDurationRef'
  | 'animTimeRef'
  | 'unlockedTierIndex'
  | 'campTimeOfDayRef'
  | 'hoveredCampObject'
  | 'ludusUpgrades'
  | 'feastStateRef'
  | 'feastSlavesRef'
  | 'etherealSparksRef'
  | 'memorialGraves'
  | 'hoveredGraveId'
  | 'selectedGraveId'
  | 'physicianNpcRef'
  | 'merchantStateRef'
  | 'devoteeStateRef'
  | 'courierNpcRef'
  | 'visitorWalkingNpcRef'
  | 'gladiators'
  | 'sparkleTimerRef'
  | 'campWeatherRef'
  | 'dimAlphaRef'
  | 'tutorialStageRef'
  | 'postBattleStageRef'
  | 'spotXRef'
  | 'spotYRef'
  | 'spotRadiusRef'
  | 'tutCharCountRef'
  | 'tutIsLineDoneRef'
  | 'postTutCharCountRef'
  | 'postTutIsLineDoneRef'
  | 'keeperSequenceRef'
  | 'isFeastOfferPendingRef'
>;

export type CampOverlayView = Pick<
  RenderView,
  | 'memorialGraves'
  | 'hoveredGraveId'
  | 'selectedGraveId'
  | 'camXRef'
  | 'camZoomRef'
  | 'camYRef'
  | 'canvasWidth'
  | 'hoveredCampObjectRef'
  | 'merchantStateRef'
  | 'visitorWalkingNpcRef'
  | 'courierNpcRef'
  | 'campSpeechBubblesRef'
  | 'gladiators'
  | 'devoteeStateRef'
  | 'physicianNpcRef'
>;

// CAMP scene: the low-res pixel pass (first branch of the old draw() mode chain).
export function drawCamp(view: CampSceneView, offCtx: CanvasRenderingContext2D) {
  const {
    camZoomRef,
    camXRef,
    camYRef,
    campShootingStarActiveDurationRef,
    animTimeRef,
    unlockedTierIndex,
    campTimeOfDayRef,
    hoveredCampObject,
    ludusUpgrades,
    feastStateRef,
    feastSlavesRef,
    etherealSparksRef,
    memorialGraves,
    hoveredGraveId,
    selectedGraveId,
    physicianNpcRef,
    merchantStateRef,
    devoteeStateRef,
    courierNpcRef,
    visitorWalkingNpcRef,
    gladiators,
    sparkleTimerRef,
    campWeatherRef,
    dimAlphaRef,
    tutorialStageRef,
    postBattleStageRef,
    spotXRef,
    spotYRef,
    spotRadiusRef,
    tutCharCountRef,
    tutIsLineDoneRef,
    postTutCharCountRef,
    postTutIsLineDoneRef,
    keeperSequenceRef,
    isFeastOfferPendingRef,
  } = view;

  // 1. CAMP VIEW (Pale Alabaster Floor, Grey Framing Walls, Roaming Gladiators with Camera Zoom & Pan)
  offCtx.save();
  // Translate to screen center, scale, translate back from camera focus point
  offCtx.translate(LOGIC_WIDTH / 2, LOGIC_HEIGHT / 2);
  offCtx.scale(camZoomRef.current || 1, camZoomRef.current || 1);
  offCtx.translate(-camXRef.current, -camYRef.current);

  // Solitary rare shooting star only in camp skybox
  const campStarDuration = 1.5;
  const shootingStarProg =
    campShootingStarActiveDurationRef.current > 0
      ? Math.max(0, Math.min(1, 1 - campShootingStarActiveDurationRef.current / campStarDuration))
      : 0;

  drawCampSkyAndWalls(
    offCtx,
    animTimeRef.current || 0,
    Math.min(5, unlockedTierIndex),
    shootingStarProg,
    campTimeOfDayRef.current || 35,
  );
  drawCampCourtyardProps(offCtx, hoveredCampObject, animTimeRef.current || 0, ludusUpgrades);

  // Render Feast Table and Bustling Slaves if feast is active
  if (feastStateRef.current?.active) {
    drawFeastTable(
      offCtx,
      168,
      126,
      feastStateRef.current.tableAlpha,
      animTimeRef.current || 0,
    );
    drawFeastSlaves(
      offCtx,
      feastSlavesRef.current,
      animTimeRef.current || 0,
    );
  }

  // Draw Ethereal Sparks (Ghost Flash Easter Egg: tiny 2x2 px spark particle in #ffffff / pale cyan #e0f8cf)
  etherealSparksRef.current.forEach((spark) => {
    const alpha = Math.max(0, spark.timer / spark.maxDuration);
    offCtx.save();
    offCtx.globalAlpha = alpha;
    const sx = Math.round(spark.x);
    const sy = Math.round(spark.y);
    // Core 2x2 spark
    offCtx.fillStyle = '#ffffff';
    offCtx.fillRect(sx, sy, 2, 2);
    // Pale cyan ethereal glow (#e0f8cf)
    offCtx.fillStyle = '#e0f8cf';
    offCtx.fillRect(sx - 1, sy, 1, 2);
    offCtx.fillRect(sx + 2, sy, 1, 2);
    offCtx.fillRect(sx, sy - 1, 2, 1);
    offCtx.fillRect(sx, sy + 2, 2, 1);
    offCtx.restore();
  });

  // Draw Cultural Memorial Graves along Camp Bottom Strip
  (memorialGraves || []).forEach((grave) => {
    if (!grave) return;
    const isHovered = hoveredGraveId === grave.id || selectedGraveId === grave.id;
    drawCulturalGrave(offCtx, grave, isHovered, animTimeRef.current || 0);
  });

  // Draw Alexandrian Physician NPC (if present in camp)
  if (physicianNpcRef.current.active) {
    drawPhysicianNpc(offCtx, physicianNpcRef.current, animTimeRef.current || 0);
  }

  // Draw Traveling Nomad Merchant (if present in camp)
  if (merchantStateRef.current.active) {
    const isMerchantHovered = hoveredCampObject === 'merchant';
    drawTravelingMerchant(offCtx, merchantStateRef.current, isMerchantHovered, animTimeRef.current || 0);
  }

  // Draw Zealous Devotee Camp Visitor (if present in camp)
  if (devoteeStateRef.current.active) {
    drawDevoteeSprite(offCtx, devoteeStateRef.current, animTimeRef.current || 0);
  }

  // Draw Roman Civilian Courier arriving from bottom of camp towards tent
  if (courierNpcRef.current.active) {
    drawRomanCivilianCourier(
      offCtx,
      courierNpcRef.current.x,
      courierNpcRef.current.y,
      courierNpcRef.current.animTimer || 0,
      courierNpcRef.current.flipX,
    );
  }

  // Draw Dynamic Camp Visitor walking into tent
  if (visitorWalkingNpcRef.current?.active) {
    drawVisitorNpc(
      offCtx,
      visitorWalkingNpcRef.current,
      animTimeRef.current || 0,
    );
  }

  // Stable Y-sorting with gladiator ID tie-breaker to completely eliminate z-index thrashing
  const sortedCampGlads = [...(gladiators || [])].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 0.01) return a.y - b.y;
    return a.id.localeCompare(b.id);
  });

  sortedCampGlads.forEach((glad) => {
    if (!glad || glad.hp <= 0 || glad.hidden) return;

    // Saladin Hero Healing Aura in Camp
    if (glad.heroType === 'saladin' && glad.hp > 0 && !glad.hidden && glad.questWalkState === 'none') {
      drawSaladinHealingAura(offCtx, glad.x, glad.y - 8, animTimeRef.current || 0);
    }

    let alpha = 1.0;
    if (glad.questWalkState === 'departing' && (glad.questWalkTimer ?? 0) < 0.6) {
      alpha = Math.max(0, (glad.questWalkTimer ?? 0) / 0.6);
    } else if (
      glad.questWalkState === 'returning' &&
      (glad.questWalkTimer ?? 0) > (glad.questWalkTotal ?? 2.2) - 0.5
    ) {
      const elapsed = (glad.questWalkTotal ?? 2.2) - (glad.questWalkTimer ?? 0);
      alpha = Math.min(1, Math.max(0, elapsed / 0.5));
    }

    offCtx.save();
    if (alpha < 1.0) {
      offCtx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    drawCulturalGladiator(
      offCtx,
      glad.x,
      glad.y,
      glad.culture,
      glad.state,
      glad.flipX,
      glad.animTimer || 0,
      0,
      0,
      0,
      glad.level || 1,
      glad.equipped,
      glad.isCavalry,
      glad.isElephant,
      false,
      0,
      false,
      glad.heroType,
    );

    // Equip Exit / Return Particle Effect: gold/bright floating particle aura VFX (#F7DEAA) rising from sprite over 2 seconds
    if (glad.justEquipped && (glad.equipParticleTimer ?? 0) > 0) {
      const timer = glad.equipParticleTimer ?? 0;
      const progress = 1 - timer / 2.0;
      const alpha = Math.max(0, Math.min(1, timer / 2.0));
      offCtx.save();
      offCtx.globalAlpha = alpha;

      const pOffsets = [
        { xOff: -6, rise: 24, sway: 5, color: '#F7DEAA' },
        { xOff: -2, rise: 30, sway: 7, color: '#ded095' },
        { xOff: 2,  rise: 22, sway: 4, color: '#F7DEAA' },
        { xOff: 6,  rise: 28, sway: 6, color: '#ded095' },
        { xOff: 0,  rise: 34, sway: 8, color: '#F7DEAA' },
      ];

      for (const p of pOffsets) {
        const px = Math.round(glad.x + p.xOff + Math.sin(progress * p.sway) * 2);
        const py = Math.round(glad.y - 12 - progress * p.rise);
        offCtx.fillStyle = p.color;
        offCtx.fillRect(px, py, 1, 1);
      }
      offCtx.restore();
    }

    // Low-res Health Bar above gladiator in camp
    const safeMaxHp = Math.max(1, glad.maxHp || 150);
    const hpPct = Math.max(0, Math.min(1, (glad.hp || 0) / safeMaxHp));
    offCtx.fillStyle = PALETTE[5];
    offCtx.fillRect(Math.round(glad.x - 12), Math.round(glad.y + 3), 24, 4);
    offCtx.fillStyle = hpPct > 0.4 ? PALETTE[8] : PALETTE[3];
    offCtx.fillRect(
      Math.round(glad.x - 11),
      Math.round(glad.y + 4),
      Math.round(22 * hpPct),
      2,
    );

    if (glad.hp < safeMaxHp) {
      offCtx.fillStyle = PALETTE[0];
      offCtx.fillRect(Math.round(glad.x + 8), Math.round(glad.y - 18), 3, 1);
      offCtx.fillRect(Math.round(glad.x + 9), Math.round(glad.y - 19), 1, 3);
    }

    offCtx.restore();
  });

  // Sparkle shine particle stars in camp courtyard
  if (sparkleTimerRef.current > 0) {
    for (let i = 0; i < 7; i++) {
      const sparkPhase = (animTimeRef.current || 0) * 4 + i * 1.5;
      const sx = 45 + ((i * 47 + 23) % (LOGIC_WIDTH - 90));
      const sy = 88 + ((i * 31 + 17) % 70);
      const alpha = (Math.sin(sparkPhase) + 1) * 0.5;
      if (alpha > 0.25) {
        offCtx.save();
        offCtx.globalAlpha = Math.max(0, Math.min(1, alpha));
        offCtx.fillStyle = i % 2 === 0 ? PALETTE[0] : PALETTE[15];
        offCtx.fillRect(sx - 1, sy, 3, 1);
        offCtx.fillRect(sx, sy - 1, 1, 3);
        offCtx.fillStyle = PALETTE[0];
        offCtx.fillRect(sx, sy, 1, 1);
        offCtx.restore();
      }
    }
  }

  offCtx.restore();

  // ======================================================================
  // CAMP DAY/NIGHT CYCLE & DYNAMIC WEATHER OVERLAY (3-SECOND SMOOTH GRADIENT)
  // ======================================================================
  const cTime = (campTimeOfDayRef.current || 35) % 120;
  const tintInfo = getSmoothDayNightTint(cTime);
  const isNight = tintInfo.isNight;

  if (tintInfo.a > 0.005) {
    offCtx.save();
    offCtx.fillStyle = `rgba(${tintInfo.r}, ${tintInfo.g}, ${tintInfo.b}, ${tintInfo.a})`;
    offCtx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

    // Soft Ambient Bloom for Camp Night Light Sources (Replacing hard dithered rings)
    if (isNight) {
      const curAnimTime = animTimeRef.current || 0;
      const warmGlowSources = [
        [64, 76, 28, 0],    // Pavilion tent window / entrance
        [175, 84, 24, 1.2], // Weapon rack lantern
        [305, 161, 22, 2.4],// Bronze trial bell lantern
        // Wall braziers / torches along ashlar wall niches
        [45, 52, 18, 0.8],
        [111, 52, 18, 2.0],
        [177, 52, 18, 3.2],
        [243, 52, 18, 1.5],
        [309, 52, 18, 2.8],
      ];

      // Lit candle alcoves by camp wall
      const CANDLE_ALCOVES = [
        [52, 68],
        [118, 68],
        [184, 68],
        [250, 68],
        [284, 68],
      ];
      const podiumWonCount = Math.min(5, unlockedTierIndex);
      for (let ci = 0; ci < podiumWonCount; ci++) {
        warmGlowSources.push([CANDLE_ALCOVES[ci][0], CANDLE_ALCOVES[ci][1] - 4, 14, ci * 1.4]);
      }

      warmGlowSources.forEach(([gx, gy, gr, gPhase]) => {
        drawSoftAmbientBloom(offCtx, gx, gy, gr, curAnimTime, 1.05, gPhase);
      });
    }
    offCtx.restore();
  }

  // Dynamic Camp Rain Weather
  if (campWeatherRef.current === 'rain') {
    offCtx.save();
    // Subtle blue-gray rain atmosphere
    offCtx.fillStyle = 'rgba(55, 75, 105, 0.15)';
    offCtx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

    // Diagonal rain streaks
    const aTime = animTimeRef.current || 0;
    offCtx.fillStyle = 'rgba(200, 220, 245, 0.5)';
    for (let r = 0; r < 48; r++) {
      const rx = ((r * 23 + aTime * 140) % (LOGIC_WIDTH + 40)) - 20;
      const ry = (r * 19 + aTime * 280) % LOGIC_HEIGHT;
      offCtx.fillRect(Math.round(rx), Math.round(ry), 1, 4);
      offCtx.fillRect(Math.round(rx - 1), Math.round(ry + 1), 1, 2);

      // Small splash droplets on ground
      if (ry > 84 && r % 3 === 0) {
        offCtx.fillStyle = 'rgba(220, 235, 255, 0.65)';
        offCtx.fillRect(Math.round(rx), Math.round(ry + 4), 2, 1);
        offCtx.fillStyle = 'rgba(200, 220, 245, 0.5)';
      }
    }
    offCtx.restore();
  }

  // 2. SPOTLIGHT & SCREEN DIMMING MASK
  const curDim = dimAlphaRef.current || 0;
  if (curDim > 0.01) {
    offCtx.save();
    const curTut = tutorialStageRef.current;
    const curPost = postBattleStageRef.current;
    const isCircularSpot =
      curTut === 'spotlight_tent' ||
      curTut === 'spotlight_armory' ||
      curPost === 'dummy_spotlight_1' ||
      curPost === 'dummy_spotlight_2' ||
      curPost === 'tent_spotlight';

    if (isCircularSpot) {
      // World coordinates mapped to screen space
      const screenSpotX =
        LOGIC_WIDTH / 2 + ((spotXRef.current || 64) - (camXRef.current || LOGIC_WIDTH / 2)) * (camZoomRef.current || 1);
      const screenSpotY =
        LOGIC_HEIGHT / 2 + ((spotYRef.current || 78) - (camYRef.current || LOGIC_HEIGHT / 2)) * (camZoomRef.current || 1);
      const pulse = 1 + 0.05 * Math.sin((animTimeRef.current || 0) * 4);
      const rawRadius = (spotRadiusRef.current || 20) * pulse * (camZoomRef.current || 1);
      const radius = Number.isFinite(rawRadius) ? Math.max(1, rawRadius) : 20;
      const safeX = Number.isFinite(screenSpotX) ? screenSpotX : LOGIC_WIDTH / 2;
      const safeY = Number.isFinite(screenSpotY) ? screenSpotY : LOGIC_HEIGHT / 2;

      offCtx.fillStyle = `rgba(9, 13, 22, ${Math.min(1, Math.max(0, curDim))})`;
      offCtx.beginPath();
      offCtx.rect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);
      offCtx.arc(safeX, safeY, radius, 0, Math.PI * 2, true);
      offCtx.fill('evenodd');

      // Glowing soft rim ring around spotlight
      offCtx.strokeStyle = 'rgba(222, 208, 149, 0.55)';
      offCtx.lineWidth = 1;
      offCtx.beginPath();
      offCtx.arc(safeX, safeY, radius, 0, Math.PI * 2);
      offCtx.stroke();
    } else {
      // General dimness without circular mask (call_warning)
      offCtx.fillStyle = `rgba(9, 13, 22, ${Math.min(1, Math.max(0, curDim))})`;
      offCtx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);
    }
    offCtx.restore();
  }

  // 3. TUTORIAL DIALOGUE BOX (Manager Portrait + Typewriter Audio)
  const curTut = tutorialStageRef.current;
  if (curTut === 'spotlight_tent') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (CAMP OVERVIEW)',
      TUTORIAL_TEXT_TENT,
      tutCharCountRef.current,
      tutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (curTut === 'spotlight_armory') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (ARMORY INSPECTION)',
      TUTORIAL_TEXT_ARMORY,
      tutCharCountRef.current,
      tutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (curTut === 'call_warning') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (ARENA SUMMONS WARNING)',
      TUTORIAL_TEXT_WARNING,
      tutCharCountRef.current,
      tutIsLineDoneRef.current,
      animTimeRef.current,
    );
  }

  // 4. POST-FIRST-BATTLE ONBOARDING DIALOGUE BOX
  const curPost = postBattleStageRef.current;
  if (curPost === 'recruits_dialogue_1') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (FIRST VICTORY SPOILS)',
      POST_BATTLE_TEXT_1,
      postTutCharCountRef.current,
      postTutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (curPost === 'recruits_dialogue_2') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (CAMP RECUPERATION)',
      POST_BATTLE_TEXT_2,
      postTutCharCountRef.current,
      postTutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (curPost === 'dummy_spotlight_1') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (SPARRING GROUNDS)',
      DUMMY_TEXT_1,
      postTutCharCountRef.current,
      postTutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (curPost === 'dummy_spotlight_2') {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (THE ARENA HUNGER)',
      DUMMY_TEXT_2,
      postTutCharCountRef.current,
      postTutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (curPost === 'tent_spotlight') {
    drawManagerTutorialBox(
      offCtx,
      'CAMP OVERVIEW (RECRUITMENT)',
      POST_BATTLE_TENT_TEXT,
      postTutCharCountRef.current,
      postTutIsLineDoneRef.current,
      animTimeRef.current,
    );
  } else if (keeperSequenceRef.current && keeperSequenceRef.current.active) {
    const ks = keeperSequenceRef.current;
    const curText = KEEPER_POST_FIFTH_PANELS[ks.panelIndex];
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS (GLADIATOR KEEPER)',
      curText,
      ks.charCount,
      ks.isDone,
      animTimeRef.current,
    );
  } else if (isFeastOfferPendingRef.current) {
    drawManagerTutorialBox(
      offCtx,
      'LANISTA AULUS',
      'These men should eat like kings.',
      tutCharCountRef.current,
      tutIsLineDoneRef.current,
      animTimeRef.current,
    );
  }
}

// CAMP overlay: crisp vector text drawn on the display canvas after the blit.
export function drawCampOverlay(view: CampOverlayView, displayCtx: CanvasRenderingContext2D) {
  const {
    memorialGraves,
    hoveredGraveId,
    selectedGraveId,
    camXRef,
    camZoomRef,
    camYRef,
    canvasWidth,
    hoveredCampObjectRef,
    merchantStateRef,
    visitorWalkingNpcRef,
    courierNpcRef,
    campSpeechBubblesRef,
    gladiators,
    devoteeStateRef,
    physicianNpcRef,
  } = view;

  displayCtx.save();
  displayCtx.imageSmoothingEnabled = true;

  // Draw Cultural Grave Epitaph Plaque Tooltip if hovered or clicked
  const activeGrave = (memorialGraves || []).find(
    (g) => g && g.id === (hoveredGraveId || selectedGraveId),
  );
  if (activeGrave) {
    const screenGraveX =
      LOGIC_WIDTH / 2 + ((activeGrave.x || 0) - (camXRef.current || LOGIC_WIDTH / 2)) * (camZoomRef.current || 1);
    const screenGraveY =
      LOGIC_HEIGHT / 2 + ((activeGrave.y || 0) - (camYRef.current || LOGIC_HEIGHT / 2)) * (camZoomRef.current || 1);
    const graveDispX = screenGraveX * PIXEL_SCALE;
    const graveDispY = (screenGraveY - 28 * (camZoomRef.current || 1)) * PIXEL_SCALE;

    const plaqueW = 280;
    const plaqueH = 104;
    let plaqueX = Math.round(graveDispX - plaqueW / 2);
    plaqueX = Math.max(20, Math.min(canvasWidth - plaqueW - 20, plaqueX));
    const plaqueY = Math.round(graveDispY - plaqueH);

    displayCtx.save();
    displayCtx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    displayCtx.shadowBlur = 12;
    displayCtx.shadowOffsetY = 4;

    // Plaque background & borders
    displayCtx.fillStyle = '#574b50';
    displayCtx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);
    displayCtx.shadowColor = 'transparent';

    displayCtx.lineWidth = 2;
    displayCtx.strokeStyle = '#9c8053';
    displayCtx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);
    displayCtx.lineWidth = 1;
    displayCtx.strokeStyle = '#cb9f6b';
    displayCtx.strokeRect(plaqueX + 3, plaqueY + 3, plaqueW - 6, plaqueH - 6);

    // Header: Memorial title & name
    const graveName = (activeGrave.name || 'Honored Fallen').toUpperCase();
    const graveCulture = activeGrave.culture || 'roman';
    const cultureLabel = CULTURE_LABELS[graveCulture] || 'Roman Murmillo';
    const graveTitle = activeGrave.title || 'Warrior';
    const graveBattles = activeGrave.battlesWon || 0;
    const graveEpitaph = activeGrave.epitaph || 'Honored in eternal remembrance.';

    displayCtx.textAlign = 'left';
    displayCtx.font = "bold 13px 'Cinzel', Georgia, serif";
    displayCtx.fillStyle = '#ded095';
    displayCtx.fillText(`MEMORIAL: ${graveName}`, plaqueX + 12, plaqueY + 20);

    // Subheader: Culture & battles won
    displayCtx.font = "bold 11px sans-serif";
    displayCtx.fillStyle = '#cb9f6b';
    displayCtx.fillText(`${cultureLabel} • ${graveTitle}`, plaqueX + 12, plaqueY + 38);

    displayCtx.font = "11px sans-serif";
    displayCtx.fillStyle = '#88997a';
    displayCtx.fillText(`🏆 Battles Won Before Falling: ${graveBattles} Bouts`, plaqueX + 12, plaqueY + 56);

    // Cultural Epitaph quote
    displayCtx.font = "italic 11px Georgia, serif";
    displayCtx.fillStyle = '#ded095';
    displayCtx.fillText(`"${graveEpitaph}"`, plaqueX + 12, plaqueY + 76);

    // Dismiss notice
    displayCtx.font = "9px sans-serif";
    displayCtx.fillStyle = '#a4968d';
    displayCtx.fillText('Eternal honor to the fallen. Click to dismiss.', plaqueX + 12, plaqueY + 94);

    displayCtx.restore();
  }

  // Interactive Camp Structure Hover Badge (Tent, Weapon Rack, Training Manikin, Trial Bell, Traveling Merchant)
  const currentHoveredObj = hoveredCampObjectRef.current;
  if (currentHoveredObj && !activeGrave) {
    let objWorldX = 64;
    let objWorldY = 46;
    let label = 'CAMP TENT • ROSTER (R)';
    let sub = 'Inspect Gladiators & Recruit';

    if (currentHoveredObj === 'tent') {
      objWorldX = 64;
      objWorldY = 46;
      label = 'CAMP TENT • ROSTER (R)';
      sub = 'Inspect Gladiators & Recruit';
    } else if (currentHoveredObj === 'weaponRack') {
      objWorldX = 175;
      objWorldY = 68;
      label = 'WEAPON RACK • ARMORY (U)';
      sub = 'Upgrade Weapons & Armor';
    } else if (currentHoveredObj === 'dummy') {
      objWorldX = 237;
      objWorldY = 66;
      label = 'TRAINING MANIKIN • ARENA (B)';
      sub = 'Enter Coliseum Skirmishes';
    } else if (currentHoveredObj === 'bell') {
      objWorldX = 305;
      objWorldY = 150;
      label = 'TRIAL BELL • SUMMONS';
      sub = 'Skip Respite to Next Battle';
    } else if (currentHoveredObj === 'merchant') {
      objWorldX = merchantStateRef.current.x;
      objWorldY = merchantStateRef.current.y - 20;
      label = 'TRAVELING MERCHANT • CARAVAN BAZAAR';
      sub = 'Click to Trade Exotic Wares & Relics';
    } else if (currentHoveredObj === 'stewardess') {
      objWorldX = 96;
      objWorldY = 60;
      label = 'LINEAGE STEWARDESS • BREEDING PENS';
      sub = 'Click to Inspect Dynastic Bloodlines & Offspring';
    } else if (currentHoveredObj === 'visitor') {
      const v = visitorWalkingNpcRef.current?.visitor;
      objWorldX = visitorWalkingNpcRef.current?.x || 45;
      objWorldY = (visitorWalkingNpcRef.current?.y || 83) - 24;
      label = `CAMP VISITOR: ${(v?.name.toUpperCase() || 'VISITOR')}`;
      sub = `${v?.title || 'Camp Visitor'} • Click to Speak With Visitor`;
    }

    const screenObjX =
      LOGIC_WIDTH / 2 + (objWorldX - (camXRef.current || LOGIC_WIDTH / 2)) * (camZoomRef.current || 1);
    const screenObjY =
      LOGIC_HEIGHT / 2 + (objWorldY - (camYRef.current || LOGIC_HEIGHT / 2)) * (camZoomRef.current || 1);
    const dispX = Math.round(screenObjX * PIXEL_SCALE);
    const dispY = Math.round(screenObjY * PIXEL_SCALE);

    displayCtx.save();
    displayCtx.textAlign = 'center';
    displayCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    displayCtx.shadowBlur = 8;
    displayCtx.shadowOffsetY = 2;

    const tipW = 240;
    const tipH = 34;
    const tipX = Math.max(16, Math.min(canvasWidth - tipW - 16, dispX - tipW / 2));
    const tipY = dispY - tipH - 4;

    displayCtx.fillStyle = '#574b50';
    displayCtx.fillRect(tipX, tipY, tipW, tipH);
    displayCtx.shadowColor = 'transparent';

    displayCtx.strokeStyle = '#ded095';
    displayCtx.lineWidth = 1.5;
    displayCtx.strokeRect(tipX, tipY, tipW, tipH);

    displayCtx.font = "bold 11px 'Cinzel', Georgia, serif";
    displayCtx.fillStyle = '#ded095';
    displayCtx.fillText(label, tipX + tipW / 2, tipY + 14);

    displayCtx.font = "10px sans-serif";
    displayCtx.fillStyle = '#cb9f6b';
    displayCtx.fillText(sub, tipX + tipW / 2, tipY + 27);

    displayCtx.restore();
  }

  // Roman Civilian Courier Urgent Speech Bubble
  if (courierNpcRef.current.active && courierNpcRef.current.speechTimer > 0) {
    const c = courierNpcRef.current;
    const screenLogicX = LOGIC_WIDTH / 2 + (c.x - camXRef.current) * camZoomRef.current;
    const screenLogicY = LOGIC_HEIGHT / 2 + (c.y - camYRef.current) * camZoomRef.current;
    const dispX = Math.round(screenLogicX * PIXEL_SCALE);
    const dispY = Math.round((screenLogicY - 28 * camZoomRef.current) * PIXEL_SCALE);

    displayCtx.save();
    displayCtx.font = "bold 12px Georgia, serif";
    const bubbleText = c.speechText;
    const textWidth = displayCtx.measureText(bubbleText).width;
    const bubbleW = Math.round(textWidth + 24);
    const bubbleH = 38;
    const bubbleX = Math.max(16, Math.min(canvasWidth - bubbleW - 16, dispX - bubbleW / 2));
    const bubbleY = dispY - bubbleH;

    displayCtx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    displayCtx.shadowBlur = 8;
    displayCtx.shadowOffsetY = 3;

    displayCtx.fillStyle = '#ded095';
    displayCtx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
    displayCtx.shadowColor = 'transparent';

    displayCtx.lineWidth = 2;
    displayCtx.strokeStyle = '#ba7654';
    displayCtx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

    displayCtx.textAlign = 'left';
    displayCtx.font = "bold 9px 'Cinzel', serif";
    displayCtx.fillStyle = '#9e4a42';
    displayCtx.fillText('📜 IMPERIAL COURIER', bubbleX + 8, bubbleY + 13);

    displayCtx.font = "bold italic 11px Georgia, serif";
    displayCtx.fillStyle = '#3f363b';
    displayCtx.fillText(bubbleText, bubbleX + 8, bubbleY + 28);

    displayCtx.restore();
  }

  // Ambient Camp Speech Bubbles (Parchment styled, gentle fade out, max 2 concurrent)
  const activeBubbles = campSpeechBubblesRef.current;
  for (const bubble of activeBubbles) {
    let screenLogicX = 0;
    let screenLogicY = 0;

    const glad = gladiators.find((g) => g.id === bubble.gladiatorId);
    if (glad && glad.hp > 0 && !glad.hidden) {
      screenLogicX = LOGIC_WIDTH / 2 + (glad.x - camXRef.current) * camZoomRef.current;
      screenLogicY = LOGIC_HEIGHT / 2 + (glad.y - camYRef.current) * camZoomRef.current;
    } else if (bubble.gladiatorId === 'visitor_npc' && visitorWalkingNpcRef.current?.active) {
      const v = visitorWalkingNpcRef.current;
      screenLogicX = LOGIC_WIDTH / 2 + (v.x - camXRef.current) * camZoomRef.current;
      screenLogicY = LOGIC_HEIGHT / 2 + (v.y - camYRef.current) * camZoomRef.current;
    } else if (bubble.gladiatorId === 'devotee_npc' && devoteeStateRef.current.active) {
      const d = devoteeStateRef.current;
      screenLogicX = LOGIC_WIDTH / 2 + (d.x - camXRef.current) * camZoomRef.current;
      screenLogicY = LOGIC_HEIGHT / 2 + (d.y - camYRef.current) * camZoomRef.current;
    } else if (bubble.gladiatorId === 'physician_npc' && physicianNpcRef.current.active) {
      const p = physicianNpcRef.current;
      screenLogicX = LOGIC_WIDTH / 2 + (p.x - camXRef.current) * camZoomRef.current;
      screenLogicY = LOGIC_HEIGHT / 2 + (p.y - camYRef.current) * camZoomRef.current;
    } else if (bubble.gladiatorId === 'merchant_npc' && merchantStateRef.current.active) {
      const m = merchantStateRef.current;
      screenLogicX = LOGIC_WIDTH / 2 + (m.x - camXRef.current) * camZoomRef.current;
      screenLogicY = LOGIC_HEIGHT / 2 + (m.y - camYRef.current) * camZoomRef.current;
    } else {
      continue;
    }

    const dispX = Math.round(screenLogicX * PIXEL_SCALE);
    const dispY = Math.round((screenLogicY - 32 * camZoomRef.current) * PIXEL_SCALE);

    let alpha = 1.0;
    if (bubble.timer < 0.8) {
      alpha = Math.max(0, bubble.timer / 0.8);
    } else if (bubble.timer > bubble.maxDuration - 0.3) {
      alpha = Math.max(0, (bubble.maxDuration - bubble.timer) / 0.3);
    }

    displayCtx.save();
    displayCtx.globalAlpha = alpha;

    // Measure & wrap text
    displayCtx.font = "italic 13px Georgia, serif";
    const maxTextWidth = 190;
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

    const lineHeight = 17;
    let maxMeasuredW = 0;
    for (const line of lines) {
      const w = displayCtx.measureText(line).width;
      if (w > maxMeasuredW) maxMeasuredW = w;
    }

    const bubbleW = Math.max(130, Math.round(maxMeasuredW + 22));
    const bubbleH = Math.round(lines.length * lineHeight + 22);

    // Clamp bubble horizontally within canvas bounds
    let bubbleX = Math.round(dispX - bubbleW / 2);
    bubbleX = Math.max(16, Math.min(canvasWidth - bubbleW - 16, bubbleX));
    const bubbleY = Math.round(dispY - bubbleH);

    // Downward pointer arrow pointing toward gladiator's head
    const arrowTipX = Math.max(bubbleX + 14, Math.min(bubbleX + bubbleW - 14, dispX));
    const arrowTipY = dispY + 3;

    // Parchment bubble with subtle drop shadow
    displayCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    displayCtx.shadowBlur = 8;
    displayCtx.shadowOffsetY = 3;

    const r = 6;
    displayCtx.beginPath();
    displayCtx.moveTo(bubbleX + r, bubbleY);
    displayCtx.lineTo(bubbleX + bubbleW - r, bubbleY);
    displayCtx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + r);
    displayCtx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - r);
    displayCtx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - r, bubbleY + bubbleH);

    // Pointer arrow downwards
    displayCtx.lineTo(arrowTipX + 7, bubbleY + bubbleH);
    displayCtx.lineTo(arrowTipX, arrowTipY);
    displayCtx.lineTo(arrowTipX - 7, bubbleY + bubbleH);

    displayCtx.lineTo(bubbleX + r, bubbleY + bubbleH);
    displayCtx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - r);
    displayCtx.lineTo(bubbleX, bubbleY + r);
    displayCtx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r, bubbleY);
    displayCtx.closePath();

    // Parchment fill
    displayCtx.fillStyle = '#ded095';
    displayCtx.fill();

    // Leather border
    displayCtx.shadowColor = 'transparent';
    displayCtx.lineWidth = 1.5;
    displayCtx.strokeStyle = '#7f644b';
    displayCtx.stroke();

    // Subtle inner gold rim
    displayCtx.lineWidth = 0.8;
    displayCtx.strokeStyle = '#cb9f6b';
    displayCtx.strokeRect(bubbleX + 2, bubbleY + 2, bubbleW - 4, bubbleH - 4);

    // Speaker name header in crimson
    displayCtx.textAlign = 'left';
    displayCtx.font = "bold 10px 'Cinzel', Georgia, serif";
    displayCtx.fillStyle = '#9e4a42';
    displayCtx.fillText(bubble.speakerName.toUpperCase(), bubbleX + 10, bubbleY + 13);

    // Speech lines in dark charcoal iron
    displayCtx.font = "italic 12px Georgia, serif";
    displayCtx.fillStyle = '#3f363b';
    lines.forEach((line, idx) => {
      displayCtx.fillText(line, bubbleX + 10, bubbleY + 27 + idx * lineHeight);
    });

    displayCtx.restore();
  }

  displayCtx.restore();
}
