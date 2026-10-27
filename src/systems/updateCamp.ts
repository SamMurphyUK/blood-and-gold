// Stage 3A: camp scene simulation, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {PALETTE} from '../../constants';
import {gameAudio} from '../../utils/helper';
import {FEAST_BANTER_BY_CULTURE, FEAST_BANTER_BY_TRAIT} from '../data/feast';
import {getCampSpeechLine} from '../logic/campSpeech';
import {recalculateGladiatorStats} from '../logic/gladiatorStats';
import {getPodiumCountdownMultiplier} from '../logic/tiers';
import {LOGIC_HEIGHT, LOGIC_WIDTH} from '../rendering/primitives';
import type {UpdateView} from './view';
import {updateDevotee, updateCourier, updateWalkingVisitor, updatePhysician, updateMerchant, updateCourierArrivals, updateVisitorArrivals} from './updateNpcs';
import {updateFirstVictoryOnboarding, updateTutorialIntro, updatePostBattleHold, updateDialogueTypewriters, updateExpeditions, updateStoryEvents} from './updateStory';

/** Camp-mode frame: the same sections, in the same order, as the camp branch of the old `update(dt)`. */
export function updateCamp(view: UpdateView, dt: number) {
  const {
    isManagerMenuOpen,
    isUpgradesModalOpen,
    isBreedingModalOpen,
    isVisitorModalOpen,
    pepTalkState,
    isEmperorDuelModalOpen,
    heroArrivalModalRef,
    keeperSequenceRef,
    isBanditAlarmOpen,
    isTrialBellModalOpenRef,
    tutorialStageRef,
    isDebugMenuOpen,
    postBattleStageRef,
    deploymentTierRef,
    isHeraldSummonsOpenRef,
    isBattlesModalOpenRef,
    isArmoryModalOpenRef,
    isRosterModalOpenRef,
    isBondingModalOpenRef,
    isGameMenuOpenRef,
    isHowToPlayOpenRef,
    isQuestBoardOpenRef,
    activeQuestNodeRef,
    questResolutionRef,
    storyStateRef,
    gameStateRef,
    modeRef,
  } = view;

  updateCampSky(view, dt);

  updateFeast(view, dt);

  updateDevotee(view, dt);

  updateCourier(view, dt);

  updateWalkingVisitor(view, dt);

  updatePhysician(view, dt);

  updateMerchant(view, dt);

  updateEquipExitParticles(view, dt);

  updateFirstVictoryOnboarding(view);

  updateCourtyardSparkle(view, dt);

  // 1. Initial Tutorial Sequence State Machine
  const curTutStage = tutorialStageRef.current;

  updateTutorialIntro(view, dt, curTutStage);

  const curPostStage = postBattleStageRef.current;
  const isAnyCampModalOpen =
    isGameMenuOpenRef.current ||
    isHowToPlayOpenRef.current ||
    isHeraldSummonsOpenRef.current ||
    isTrialBellModalOpenRef.current ||
    isBattlesModalOpenRef.current ||
    deploymentTierRef.current !== null ||
    isArmoryModalOpenRef.current ||
    isRosterModalOpenRef.current ||
    isBondingModalOpenRef.current ||
    isQuestBoardOpenRef.current ||
    activeQuestNodeRef.current !== null ||
    questResolutionRef.current !== null ||
    storyStateRef.current.phase !== 'inactive' ||
    (keeperSequenceRef.current?.active ?? false) ||
    heroArrivalModalRef.current !== null;

  updatePostBattleHold(view, dt, curPostStage, isAnyCampModalOpen);

  updateCampCamera(view, dt, curTutStage, curPostStage);

  updateDialogueTypewriters(view, dt, curTutStage);

  const isAnyModalOrNoticeActive =
    isGameMenuOpenRef.current ||
    isHowToPlayOpenRef.current ||
    isHeraldSummonsOpenRef.current ||
    isTrialBellModalOpenRef.current ||
    isBattlesModalOpenRef.current ||
    deploymentTierRef.current !== null ||
    isArmoryModalOpenRef.current ||
    isRosterModalOpenRef.current ||
    isBondingModalOpenRef.current ||
    isQuestBoardOpenRef.current ||
    activeQuestNodeRef.current !== null ||
    questResolutionRef.current !== null ||
    isUpgradesModalOpen ||
    isBreedingModalOpen ||
    isVisitorModalOpen ||
    isManagerMenuOpen ||
    isDebugMenuOpen ||
    isEmperorDuelModalOpen ||
    isBanditAlarmOpen ||
    pepTalkState !== null ||
    modeRef.current !== 'camp' ||
    tutorialStageRef.current !== 'done' ||
    (postBattleStageRef.current !== 'none' && postBattleStageRef.current !== 'done') ||
    (keeperSequenceRef.current?.active ?? false) ||
    heroArrivalModalRef.current !== null ||
    gameStateRef.current.status !== 'PLAYING';

  updateExpeditions(view, dt, isAnyCampModalOpen, isAnyModalOrNoticeActive);

  updateCourierArrivals(view, dt, isAnyModalOrNoticeActive);

  updateVisitorArrivals(view, dt, isAnyModalOrNoticeActive);

  updateAutoCallFights(view, dt, isAnyModalOrNoticeActive);

  updateStoryEvents(view, dt, isAnyModalOrNoticeActive);

  updateCampSpeech(view, dt);

  updateCampGladiators(view, dt);
}

type UpdateCampSkyView = Pick<
  UpdateView,
  | 'campShootingStarTimerRef'
  | 'campShootingStarActiveDurationRef'
  | 'campTimeOfDayRef'
>;

export function updateCampSky(view: UpdateCampSkyView, dt: number) {
  const {campShootingStarTimerRef, campShootingStarActiveDurationRef, campTimeOfDayRef} = view;

  // Rare ambient shooting star timer (500 - 1000s in camp skybox ONLY)
  if (campShootingStarActiveDurationRef.current > 0) {
    campShootingStarActiveDurationRef.current -= dt;
  } else {
    campShootingStarTimerRef.current -= dt;
    if (campShootingStarTimerRef.current <= 0) {
      campShootingStarActiveDurationRef.current = 1.4;
      campShootingStarTimerRef.current = 500 + Math.random() * 500;
    }
  }

  // Day/Night and Weather time progression
  campTimeOfDayRef.current = ((campTimeOfDayRef.current || 0) + dt * 0.5) % 120;
}

type UpdateFeastView = Pick<
  UpdateView,
  | 'setFeastState'
  | 'feastStateRef'
  | 'setFeastSlaves'
  | 'feastSlavesRef'
  | 'setGladiators'
  | 'campSpeechBubblesRef'
  | 'gladiatorsRef'
>;

export function updateFeast(view: UpdateFeastView, dt: number) {
  const {
    setFeastState,
    feastStateRef,
    setFeastSlaves,
    feastSlavesRef,
    setGladiators,
    campSpeechBubblesRef,
    gladiatorsRef,
  } = view;

  // Update Active Camp Feast Sequence (30 - 40 seconds)
  if (feastStateRef.current?.active) {
    const fs = feastStateRef.current;
    fs.timer -= dt;

    // Fade in banquet table smoothly
    if (fs.timer > fs.totalDuration - 2.5) {
      fs.tableAlpha = Math.min(1, (fs.totalDuration - fs.timer) / 2.0);
    } else if (fs.timer < 3.0) {
      fs.tableAlpha = Math.max(0, fs.timer / 3.0);
    } else {
      fs.tableAlpha = 1.0;
    }

    // Feast Banter Dialogue Generation (fires every 3.5 - 5.5s)
    fs.banterTimer -= dt;
    if (fs.banterTimer <= 0) {
      fs.banterTimer = 3.6 + Math.random() * 2.0;
      const seatedGlads = gladiatorsRef.current.filter((g) => g.hp > 0 && g.state === 'sitting');
      if (seatedGlads.length > 0 && campSpeechBubblesRef.current.length < 2) {
        const speaker = seatedGlads[Math.floor(Math.random() * seatedGlads.length)];
        let banterPool: string[] = [];

        // Culture banter
        if (FEAST_BANTER_BY_CULTURE[speaker.culture]) {
          banterPool.push(...FEAST_BANTER_BY_CULTURE[speaker.culture]);
        }
        // Personality trait banter
        if (speaker.traits) {
          for (const tr of speaker.traits) {
            if (FEAST_BANTER_BY_TRAIT[tr]) {
              banterPool.push(...FEAST_BANTER_BY_TRAIT[tr]);
            }
          }
        }

        if (banterPool.length === 0) {
          banterPool = [
            'Drink deep! Tonight we eat like kings!',
            'To our brothers and the sands we conquered!',
            'More wine! The night is young!',
          ];
        }

        const chosenLine = banterPool[Math.floor(Math.random() * banterPool.length)];
        campSpeechBubblesRef.current.push({
          id: `feast_banter_${Date.now()}_${speaker.id}`,
          gladiatorId: speaker.id,
          speakerName: speaker.name.split(' ')[0],
          text: chosenLine,
          timer: 4.5,
          maxDuration: 4.5,
        });
      }
    }

    // Update Slave NPCs bustling with platters
    const updatedSlaves = feastSlavesRef.current.map((slave) => {
      const s = { ...slave };
      if (s.state === 'entering') {
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const d = Math.hypot(dx, dy);
        if (d > 2) {
          s.x += (dx / d) * 32 * dt;
          s.y += (dy / d) * 32 * dt;
        } else {
          s.state = 'serving';
          s.targetX = s.x + (Math.random() > 0.5 ? 12 : -12);
        }
      } else if (s.state === 'serving') {
        if (fs.timer < 4.0) {
          s.state = 'departing';
          s.targetY = 195;
        } else {
          // Gentle bustling around table
          const dx = s.targetX - s.x;
          if (Math.abs(dx) > 1) {
            s.x += (dx > 0 ? 1 : -1) * 8 * dt;
            s.flipX = dx < 0;
          } else if (Math.random() < 0.05) {
            s.targetX = 145 + Math.random() * 45;
          }
        }
      } else if (s.state === 'departing') {
        s.y += 32 * dt;
      }
      return s;
    });
    feastSlavesRef.current = updatedSlaves;
    setFeastSlaves(updatedSlaves);

    // Conclude feast after 35 seconds
    if (fs.timer <= 0) {
      fs.active = false;
      feastStateRef.current = null;
      setFeastState(null);
      setFeastSlaves([]);
      feastSlavesRef.current = [];
      // Stand up gladiators
      const stoodUp = gladiatorsRef.current.map((g) => ({
        ...g,
        state: 'idle' as const,
        targetActivity: 'idle' as const,
        actionTimer: 2.0,
        seatedDuration: 0,
        sitCooldown: 8.0,
      }));
      gladiatorsRef.current = stoodUp;
      setGladiators(stoodUp);
    } else {
      setFeastState({ ...fs });
    }
  }
}

type UpdateEquipExitParticlesView = Pick<UpdateView, 'gladiatorsRef'>;

export function updateEquipExitParticles(view: UpdateEquipExitParticlesView, dt: number) {
  const {gladiatorsRef} = view;

  // Update gladiator equip exit particle effect timers
  for (const glad of gladiatorsRef.current) {
    if (glad.equipParticleTimer && glad.equipParticleTimer > 0) {
      glad.equipParticleTimer -= dt;
      if (glad.equipParticleTimer <= 0) {
        glad.equipParticleTimer = 0;
        glad.justEquipped = false;
      }
    }
  }
}

type UpdateCourtyardSparkleView = Pick<UpdateView, 'sparkleTimerRef' | 'particlesRef'>;

export function updateCourtyardSparkle(view: UpdateCourtyardSparkleView, dt: number) {
  const {sparkleTimerRef, particlesRef} = view;

  // Sparkle shine particles over camp courtyard
  if (sparkleTimerRef.current > 0) {
    sparkleTimerRef.current -= dt;
    if (Math.random() < 0.45) {
      const sx = 35 + Math.random() * (LOGIC_WIDTH - 70);
      const sy = 84 + Math.random() * 76;
      particlesRef.current.push({
        x: sx,
        y: sy,
        color: Math.random() < 0.6 ? PALETTE[0] : PALETTE[15],
        vx: (Math.random() - 0.5) * 8,
        vy: -10 - Math.random() * 12,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        size: 2,
      });
    }
  }
}

type UpdateCampCameraView = Pick<
  UpdateView,
  | 'isFeastOfferPendingRef'
  | 'keeperSequenceRef'
  | 'camZoomRef'
  | 'camXRef'
  | 'camYRef'
  | 'dimAlphaRef'
  | 'spotRadiusRef'
  | 'spotXRef'
  | 'spotYRef'
>;

export function updateCampCamera(view: UpdateCampCameraView, dt: number, curTutStage: string, curPostStage: string) {
  const {
    isFeastOfferPendingRef,
    keeperSequenceRef,
    camZoomRef,
    camXRef,
    camYRef,
    dimAlphaRef,
    spotRadiusRef,
    spotXRef,
    spotYRef,
  } = view;

  // 2. Camera & Spotlight Target Interpolation
  let targetCamX = LOGIC_WIDTH / 2;
  let targetCamY = LOGIC_HEIGHT / 2;
  let targetCamZoom = 1.0;
  let targetDimAlpha = 0.0;
  let targetSpotRadius = 0;
  let targetSpotX = 64;
  let targetSpotY = 78;

  if (curTutStage === 'spotlight_tent') {
    targetCamX = 64;
    targetCamY = 78;
    targetCamZoom = 1.15;
    targetDimAlpha = 0.75;
    targetSpotRadius = 36;
    targetSpotX = 64;
    targetSpotY = 78;
  } else if (curTutStage === 'spotlight_armory') {
    targetCamX = 175;
    targetCamY = 84;
    targetCamZoom = 1.15;
    targetDimAlpha = 0.75;
    targetSpotRadius = 34;
    targetSpotX = 175;
    targetSpotY = 84;
  } else if (curTutStage === 'call_warning') {
    targetCamX = LOGIC_WIDTH / 2;
    targetCamY = LOGIC_HEIGHT / 2;
    targetCamZoom = 1.0;
    targetDimAlpha = 0.35; // pulls zoom back to 1.0x and fades dimness slightly
    targetSpotRadius = 0;
  } else if (curPostStage === 'courtyard_zoom') {
    // While waiting the 5-second countdown in camp (outside menus), the camera stays in normal / gentle overview perspective
    targetCamX = LOGIC_WIDTH / 2;
    targetCamY = LOGIC_HEIGHT / 2;
    targetCamZoom = 1.0;
    targetDimAlpha = 0.0;
    targetSpotRadius = 0;
  } else if (curPostStage === 'dummy_spotlight_1' || curPostStage === 'dummy_spotlight_2') {
    // The camera zoom-in directly toward the MANIKIN (scale: 1.18, centered on the manikin coordinates)
    // occurs EXACTLY when the 5-second timer completes, in lockstep with the spotlight dimming and typewriter dialogue trigger!
    targetCamX = 237;
    targetCamY = 86;
    targetCamZoom = 1.18;
    targetDimAlpha = 0.75;
    targetSpotRadius = 32;
    targetSpotX = 237;
    targetSpotY = 86;
  } else if (curPostStage === 'tent_spotlight') {
    // Precisely center the spotlight on the TENT (x: 75, y: 70)
    targetCamX = 75;
    targetCamY = 70;
    targetCamZoom = 1.18;
    targetDimAlpha = 0.75;
    targetSpotRadius = 36;
    targetSpotX = 75;
    targetSpotY = 70;
  } else if (keeperSequenceRef.current && keeperSequenceRef.current.active) {
    // Post-Fifth Podium Narrative Dialogue Sequence: Dimmed screen, strictly NO zoom!
    targetCamX = LOGIC_WIDTH / 2;
    targetCamY = LOGIC_HEIGHT / 2;
    targetCamZoom = 1.0;
    targetDimAlpha = 0.75;
    targetSpotRadius = 0;
  } else if (isFeastOfferPendingRef.current) {
    // Third Pedestal Victory Return: Dimmed screen for special Lanista feast offer!
    targetCamX = LOGIC_WIDTH / 2;
    targetCamY = LOGIC_HEIGHT / 2;
    targetCamZoom = 1.0;
    targetDimAlpha = 0.75;
    targetSpotRadius = 0;
  }

  const lerpSpd = dt * 4.5;
  camZoomRef.current += (targetCamZoom - camZoomRef.current) * Math.min(1, lerpSpd);
  camXRef.current += (targetCamX - camXRef.current) * Math.min(1, lerpSpd);
  camYRef.current += (targetCamY - camYRef.current) * Math.min(1, lerpSpd);
  dimAlphaRef.current += (targetDimAlpha - dimAlphaRef.current) * Math.min(1, dt * 5.0);
  spotRadiusRef.current += (targetSpotRadius - spotRadiusRef.current) * Math.min(1, dt * 4.0);
  spotXRef.current += (targetSpotX - spotXRef.current) * Math.min(1, lerpSpd);
  spotYRef.current += (targetSpotY - spotYRef.current) * Math.min(1, lerpSpd);
}

type UpdateAutoCallFightsView = Pick<
  UpdateView,
  | 'setCourierNpcState'
  | 'courierNpcRef'
  | 'heraldTimerRef'
  | 'tutorialStageRef'
  | 'firstBattleDoneRef'
  | 'storyStateRef'
  | 'unlockedTierIndexRef'
>;

export function updateAutoCallFights(view: UpdateAutoCallFightsView, dt: number, isAnyModalOrNoticeActive: boolean) {
  const {
    setCourierNpcState,
    courierNpcRef,
    heraldTimerRef,
    tutorialStageRef,
    firstBattleDoneRef,
    storyStateRef,
    unlockedTierIndexRef,
  } = view;

  // Scheduled Auto-Call Fights (Every 30 - 120s normal interval, or 7.5s after tutorial)
  // Strictly PAUSED while tutorial, post-battle dialogue, story, or modal is active
  if (!isAnyModalOrNoticeActive && storyStateRef.current.phase === 'inactive' && tutorialStageRef.current === 'done') {
    heraldTimerRef.current -= dt;
    if (heraldTimerRef.current <= 0 && !courierNpcRef.current.active) {
      const baseDelay = firstBattleDoneRef.current
        ? 30 + Math.random() * 90 // 30 to 120 seconds interval
        : 35;
      heraldTimerRef.current = baseDelay * getPodiumCountdownMultiplier(unlockedTierIndexRef.current);
      // Spawn Roman Civilian Courier walking up from bottom of camp to the lower-left tent doorway!
      courierNpcRef.current = {
        active: true,
        x: 165,
        y: 192,
        targetX: 45,
        targetY: 83,
        state: 'walking',
        speechTimer: 5.0,
        speechText: 'A decree from Rome! The Emperor summons your gladiators!',
        walkTimer: 0,
        animTimer: 0,
        flipX: true,
        hasPlayedHorn: false,
      };
      setCourierNpcState({ ...courierNpcRef.current });
    }
  }
}

type UpdateCampSpeechView = Pick<
  UpdateView,
  | 'tutorialStageRef'
  | 'storyStateRef'
  | 'campSpeechBubblesRef'
  | 'gladiatorSpeechCooldownsRef'
  | 'gladiatorsRef'
  | 'gladiatorBondsRef'
>;

export function updateCampSpeech(view: UpdateCampSpeechView, dt: number) {
  const {
    tutorialStageRef,
    storyStateRef,
    campSpeechBubblesRef,
    gladiatorSpeechCooldownsRef,
    gladiatorsRef,
    gladiatorBondsRef,
  } = view;

  // CAMP PHASE: 5 cultural gladiators roam, spar at dummy (+XP), rest near tent (+HP)

  // 1. Ambient Camp Speech Bubbles update
  campSpeechBubblesRef.current = campSpeechBubblesRef.current.filter((b) => {
    b.timer -= dt;
    return b.timer > 0;
  });

  // 2. Decrement speech cooldowns & trigger ambient speech bubbles (after tutorial)
  if (storyStateRef.current.phase === 'inactive' && tutorialStageRef.current === 'done') {
    for (const glad of gladiatorsRef.current) {
      if (glad.hp <= 0) continue;

      const currentCd = gladiatorSpeechCooldownsRef.current[glad.id] ?? 12;
      const newCd = currentCd - dt;
      gladiatorSpeechCooldownsRef.current[glad.id] = newCd;

      if (newCd <= 0) {
        // Concurrency limit: Strictly NO MORE than 2 speech bubbles ever active at the same time in camp
        const activeBubbles = campSpeechBubblesRef.current;
        const alreadySpeaking = activeBubbles.some((b) => b.gladiatorId === glad.id);

        if (activeBubbles.length < 2 && !alreadySpeaking) {
          const line = getCampSpeechLine(glad, gladiatorsRef.current, gladiatorBondsRef.current);
          activeBubbles.push({
            id: `bubble_${Date.now()}_${Math.random()}`,
            gladiatorId: glad.id,
            speakerName: glad.name.split(' ')[0],
            text: line,
            timer: 4.5,
            maxDuration: 4.5,
          });
          // Timing: Trigger randomly every 10 to 40 seconds per eligible gladiator
          gladiatorSpeechCooldownsRef.current[glad.id] = 10 + Math.random() * 30;
        } else {
          // If at capacity or already speaking, recheck in 3 to 6 seconds
          gladiatorSpeechCooldownsRef.current[glad.id] = 3 + Math.random() * 3;
        }
      }
    }
  }
}

type UpdateCampGladiatorsView = Pick<
  UpdateView,
  | 'ludusUpgrades'
  | 'feastStateRef'
  | 'deploymentTierRef'
  | 'isHeraldSummonsOpenRef'
  | 'setGladiators'
  | 'particlesRef'
  | 'campSpeechBubblesRef'
  | 'gladiatorsRef'
  | 'handleGladiatorInvestigationArrival'
>;

export function updateCampGladiators(view: UpdateCampGladiatorsView, dt: number) {
  const {
    ludusUpgrades,
    feastStateRef,
    deploymentTierRef,
    isHeraldSummonsOpenRef,
    setGladiators,
    particlesRef,
    campSpeechBubblesRef,
    gladiatorsRef,
    handleGladiatorInvestigationArrival,
  } = view;

  // Update camp gladiators with quest departure & return walk physics
  const updatedCampGlads = gladiatorsRef.current.map((glad) => {
    if (glad.hp <= 0 || glad.hidden) return glad;

    const updated = { ...glad };
    updated.animTimer += dt;

    // 1. Handling New Recruit Walk-In Animation (from off-screen left x: -30, y: 110 to camp target station)
    if (updated.isWalkingIn) {
      const dx = updated.targetX - updated.x;
      const dy = updated.targetY - updated.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 3) {
        updated.isWalkingIn = false;
        updated.state = 'idle';
        updated.targetActivity = 'idle';
        updated.actionTimer = 2.0 + Math.random() * 2.0;
      } else {
        const moveSpeed = 32;
        updated.x += (dx / dist) * moveSpeed * dt;
        updated.y += (dy / dist) * moveSpeed * dt;
        updated.state = 'walking';
        updated.flipX = false;
      }
      return updated;
    }

    // 2. Handling Quest Departure Walk Animation (walking to camp exit gate at 330, 145)
    if (updated.questWalkState === 'departing') {
      const timer = (updated.questWalkTimer ?? 2.0) - dt;
      updated.questWalkTimer = timer;

      const dx = updated.targetX - updated.x;
      const dy = updated.targetY - updated.y;
      const dist = Math.hypot(dx, dy);

      if (timer <= 0 || dist < 3) {
        updated.questWalkState = 'none';
        updated.hidden = true;
        updated.state = 'idle';
      } else {
        const moveSpeed = Math.max(35, dist / Math.max(0.1, timer));
        updated.x += (dx / dist) * moveSpeed * dt;
        updated.y += (dy / dist) * moveSpeed * dt;
        updated.state = 'walking';
        updated.flipX = false;
      }
      return updated;
    }

    // 2. Handling Quest Return Walk Animation (spawning at entrance and walking back into courtyard)
    if (updated.questWalkState === 'returning') {
      const timer = (updated.questWalkTimer ?? 2.2) - dt;
      updated.questWalkTimer = timer;

      const dx = updated.targetX - updated.x;
      const dy = updated.targetY - updated.y;
      const dist = Math.hypot(dx, dy);

      if (timer <= 0 || dist < 3) {
        updated.questWalkState = 'none';
        updated.state = 'idle';
        updated.targetActivity = 'idle';
        updated.actionTimer = 2.0 + Math.random() * 2.0;
        if (updated.justEquipped) {
          updated.equipParticleTimer = 2.0;
        }
      } else {
        const moveSpeed = Math.max(30, dist / Math.max(0.1, timer));
        updated.x += (dx / dist) * moveSpeed * dt;
        updated.y += (dy / dist) * moveSpeed * dt;
        updated.state = 'walking';
        updated.flipX = true;
      }
      return updated;
    }

    // If currently on quest (and not departing/returning), skip normal roaming
    if (updated.status === 'On Quest') {
      return updated;
    }

    // Normal Camp Wandering, Resting, Sparring & Sitting
    // Check if currently investigating a Ghost Flash spark
    if (updated.investigatingFlash) {
      const inv = updated.investigatingFlash;
      const distToSpark = Math.hypot(updated.x - inv.flashX, updated.y - inv.flashY);
      if (!inv.arrived && distToSpark <= 6) {
        inv.arrived = true;
        handleGladiatorInvestigationArrival(updated, inv.clickCount);
      }
    }

    // Twitching / hallucinating behavior for Mad gladiators in camp
    if (updated.traits?.includes('Mad')) {
      updated.madTwitchTimer = (updated.madTwitchTimer || 0) + dt;
      if (updated.madTwitchTimer >= 2.0 && Math.random() < 0.35) {
        updated.madTwitchTimer = 0;
        updated.flipX = !updated.flipX; // erratic manic turn
      }
    }

    // Strict sit cooldown management (cooldown minimum 8-12s, minimum seated duration 6s)
    if (updated.sitCooldown && updated.sitCooldown > 0) {
      updated.sitCooldown = Math.max(0, updated.sitCooldown - dt);
    }

    const distToTarget = Math.hypot(
      (updated.targetX ?? updated.x) - updated.x,
      (updated.targetY ?? updated.y) - updated.y,
    );
    const investigating =
      !!updated.investigatingFlash && !updated.investigatingFlash.arrived;
    const feastActive = !!feastStateRef.current?.active;

    // Crouch only while a rest/sit timer is still running and the gladiator
    // has reached the seat. Pathfinding and a finished timer return to idle/walk.
    if (investigating) {
      updated.isSitting = false;
      updated.seatedDuration = 0;
      if (updated.state === 'sitting' || updated.state === 'resting') {
        updated.state = 'walking';
      }
      if (updated.targetActivity === 'sitting' || updated.targetActivity === 'resting') {
        updated.targetActivity = 'walking';
      }
    } else if (
      (updated.state === 'sitting' || updated.isSitting) &&
      distToTarget <= 2 &&
      updated.actionTimer > 0
    ) {
      updated.actionTimer -= dt;
      updated.state = 'sitting';
      updated.isSitting = true;
      updated.targetActivity = 'sitting';
      updated.targetX = updated.x;
      updated.targetY = updated.y;
      updated.seatedDuration = (updated.seatedDuration || 0) + dt;
      if (updated.actionTimer <= 0) {
        updated.isSitting = false;
        updated.state = 'idle';
        updated.targetActivity = 'idle';
        updated.sitCooldown = feastActive ? 4.0 : 12.0;
        updated.seatedDuration = 0;
        updated.actionTimer = 2.5 + Math.random() * 3.0;
      }
    } else if (updated.state === 'sitting' || updated.isSitting) {
      updated.isSitting = false;
      updated.seatedDuration = 0;
      if (distToTarget > 2) {
        updated.state = 'walking';
      } else {
        updated.state = 'idle';
        if (updated.targetActivity === 'sitting') {
          updated.targetActivity = 'idle';
        }
      }
    } else {
      updated.isSitting = false;
      updated.seatedDuration = 0;
    }

    // 10% Buffed passive healing in camp (+1.65 HP/s normal, +4.4 HP/s resting near tent)
    // MEDICAL BAY FACILITY UPGRADE: Accelerates HP recovery by +55% / +110% / +220%!
    // Must pause while the Emperor's summons pop-up is on screen!
    if (!isHeraldSummonsOpenRef.current && deploymentTierRef.current?.isPodiumTrial !== true) {
      const hasSaladin = gladiatorsRef.current.some(
        (g) => g.heroType === 'saladin' && g.hp > 0,
      );
      const saladinMultiplier = hasSaladin ? 2.0 : 1.0;
      const medBayMult = 1 + (ludusUpgrades.medicalBay * 0.55);
      const isRestingNearTent = updated.state === 'resting';
      const healRate = (isRestingNearTent ? 4.4 : 1.65) * saladinMultiplier * medBayMult;
      if (updated.hp < updated.maxHp) {
        updated.hp = Math.min(updated.maxHp, updated.hp + healRate * dt);
      }

      // Saladin Hero Healing Aura: When Saladin is in camp, heals nearby allies at steady passive 2.2 HP/sec with cross particles
      const saladinInCamp = gladiatorsRef.current.find(
        (g) => g.heroType === 'saladin' && g.hp > 0 && !g.hidden && g.questWalkState === 'none',
      );
      if (saladinInCamp && updated.id !== saladinInCamp.id && updated.hp < updated.maxHp) {
        const distToSaladin = Math.hypot(updated.x - saladinInCamp.x, updated.y - saladinInCamp.y);
        if (distToSaladin <= 75) {
          updated.hp = Math.min(updated.maxHp, updated.hp + 2.2 * dt);
          if (Math.random() < dt * 2.0) {
            particlesRef.current.push({
              x: updated.x + (Math.random() - 0.5) * 8,
              y: updated.y - 10 + (Math.random() - 0.5) * 6,
              color: Math.random() < 0.6 ? '#4ade80' : '#ded095',
              vx: (Math.random() - 0.5) * 6,
              vy: -12 - Math.random() * 8,
              life: 0.6,
              maxLife: 0.6,
              size: 2,
            });
          }
        }
      }
    }

    // Saladin itself emits floating cross particles in camp
    if (updated.heroType === 'saladin' && updated.hp > 0 && Math.random() < dt * 4.0) {
      particlesRef.current.push({
        x: updated.x + (Math.random() - 0.5) * 12,
        y: updated.y - 12 + (Math.random() - 0.5) * 8,
        color: Math.random() < 0.65 ? '#4ade80' : '#ded095',
        vx: (Math.random() - 0.5) * 8,
        vy: -14 - Math.random() * 8,
        life: 0.7,
        maxLife: 0.7,
        size: 2,
      });
    }

    if (updated.state !== 'sitting' && !updated.isSitting) {
      updated.actionTimer -= dt;
      if (updated.actionTimer <= 0) {
        const canSit = (updated.sitCooldown || 0) <= 0;
        const nextActs: ('idle' | 'walking' | 'sparring' | 'resting' | 'sitting')[] = canSit
          ? ['idle', 'walking', 'sparring', 'resting', 'sitting']
          : ['idle', 'walking', 'sparring', 'resting'];
        const roll = nextActs[Math.floor(Math.random() * nextActs.length)];

        if (roll === 'sitting') {
          updated.isSitting = true;
          updated.sitCooldown = 12.0;
          updated.seatedDuration = 0;
        }

        updated.targetActivity = roll;
        updated.actionTimer = 2.5 + Math.random() * 3.5;

        if (roll === 'walking') {
          updated.targetX = 65 + Math.random() * 190;
          updated.targetY = 95 + Math.random() * 60;
        } else if (roll === 'sparring') {
          updated.targetX = 215 + Math.random() * 25;
          updated.targetY = 88 + Math.random() * 20;
        } else if (roll === 'resting') {
          updated.targetX = 65 + Math.random() * 35;
          updated.targetY = 98 + Math.random() * 26;
        } else if (roll === 'sitting') {
          updated.targetX = 100 + Math.random() * 120;
          updated.targetY = 112 + Math.random() * 40;
        } else {
          updated.targetX = updated.x;
          updated.targetY = updated.y;
        }
      }

      const dx = updated.targetX - updated.x;
      const dy = updated.targetY - updated.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        const moveSpeed = 15 + updated.speed * 0.3;
        updated.x += (dx / dist) * moveSpeed * dt;
        updated.y += (dy / dist) * moveSpeed * dt;
        if (Math.abs(dx) > 0.5) {
          updated.flipX = dx < 0;
        }
        updated.state = 'walking';
      } else {
        updated.state = updated.targetActivity || 'idle';
        if (updated.state === 'sitting') {
          updated.isSitting = true;
          updated.seatedDuration = 0;
          updated.actionTimer = Math.max(6.0, updated.actionTimer);
        }
      }
    }

    // Clamp living gladiators within camp courtyard grounds so they never walk off-screen
    if (updated.questWalkState === 'none' && !updated.isWalkingIn) {
      updated.x = Math.max(38, Math.min(295, updated.x));
      updated.y = Math.max(90, Math.min(166, updated.y));
    }

    // Sparring practice strikes at the wooden Manikin with wood impact thump SFX
    if (updated.state === 'sparring') {
      updated.sparHitTimer = (updated.sparHitTimer || 0) + dt;
      if (updated.sparHitTimer >= 0.8) {
        updated.sparHitTimer = 0;
        gameAudio.playFootstepWood();
        particlesRef.current.push({
          x: 237,
          y: 80,
          color: PALETTE[14],
          vx: (Math.random() - 0.5) * 14,
          vy: -10 - Math.random() * 8,
          life: 0.35,
          maxLife: 0.35,
        });
      }
    }

    // Social conversation banter when two gladiators wander close
    if (updated.state === 'idle' || updated.state === 'walking' || updated.state === 'sitting') {
      const nearbyOther = gladiatorsRef.current.find(
        (other) =>
          other.id !== updated.id &&
          other.hp > 0 &&
          !other.hidden &&
          Math.hypot(other.x - updated.x, other.y - updated.y) < 24,
      );
      if (
        nearbyOther &&
        campSpeechBubblesRef.current.length < 2 &&
        !campSpeechBubblesRef.current.some((b) => b.gladiatorId === updated.id || b.gladiatorId === nearbyOther.id) &&
        Math.random() < dt * 0.08
      ) {
        const banterQuotes = [
          'Hast thou traded for the Parthian archer card yet?',
          'More spiced Falernian wine tonight, brother!',
          'My dice always favor the high rolls after a hard training bout.',
          'I wager three copper tokens on the next chariot race.',
        ];
        const q = banterQuotes[Math.floor(Math.random() * banterQuotes.length)];
        campSpeechBubblesRef.current.push({
          id: `banter_${Date.now()}_${Math.random()}`,
          gladiatorId: updated.id,
          speakerName: updated.name.split(' ')[0],
          text: q,
          timer: 4.2,
          maxDuration: 4.2,
        });
        updated.flipX = nearbyOther.x < updated.x;
      }
    }

    // Sparring XP progression at dummy (reduced by 20%)
    if (updated.state === 'sparring' && Math.random() < dt * 0.28) {
      updated.xp += 1;
      if (updated.xp >= updated.xpNeeded) {
        updated.level += 1;
        updated.xp = 0;
        updated.xpNeeded = Math.floor(updated.xpNeeded * 1.5);

        const strGain = (updated.culture === 'celt' || updated.culture === 'hunnic' || updated.weightClass === 'Heavyweight') ? 2 : 1;
        const dexGain = (updated.culture === 'berber' || updated.culture === 'scythian' || updated.weightClass === 'Lightweight') ? 2 : 1;
        const vitGain = (updated.culture === 'roman' || updated.weightClass === 'Heavyweight') ? 2 : 1;
        const curA = updated.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
        updated.attributes = {
          ...curA,
          str: (curA.str ?? 10) + strGain,
          dex: (curA.dex ?? 10) + dexGain,
          vit: (curA.vit ?? curA.con ?? 10) + vitGain,
          con: (curA.vit ?? curA.con ?? 10) + vitGain,
        };

        const recalc = recalculateGladiatorStats(updated);
        updated.attack = recalc.attack;
        updated.defense = recalc.defense;
        updated.speed = recalc.speed;
        updated.maxHp = recalc.maxHp;
        updated.hp = updated.maxHp;
      }
    }

    return updated;
  });

  // Gentle separation / anti-stacking for up to 10 living champions in camp
  // Locked seated gladiators are NEVER moved or jittered when bumped by roaming gladiators
  for (let i = 0; i < updatedCampGlads.length; i++) {
    const g1 = updatedCampGlads[i];
    if (g1.hp <= 0 || g1.hidden || g1.questWalkState !== 'none' || g1.isWalkingIn) continue;
    for (let j = i + 1; j < updatedCampGlads.length; j++) {
      const g2 = updatedCampGlads[j];
      if (g2.hp <= 0 || g2.hidden || g2.questWalkState !== 'none' || g2.isWalkingIn) continue;
      const cdx = g2.x - g1.x;
      const cdy = g2.y - g1.y;
      const cdist = Math.hypot(cdx, cdy);
      if (cdist < 14 && cdist > 0.001) {
        const overlap = 14 - cdist;
        const nx = (cdx / cdist) * overlap;
        const ny = (cdy / cdist) * overlap;

        const g1Sitting = g1.state === 'sitting' || g1.isSitting;
        const g2Sitting = g2.state === 'sitting' || g2.isSitting;

        if (g1Sitting && g2Sitting) {
          // Both seated: neither moves
        } else if (g1Sitting) {
          // g1 is seated & locked in place: only nudge roaming g2
          g2.x = Math.max(38, Math.min(295, g2.x + nx));
          g2.y = Math.max(90, Math.min(166, g2.y + ny));
        } else if (g2Sitting) {
          // g2 is seated & locked in place: only nudge roaming g1
          g1.x = Math.max(38, Math.min(295, g1.x - nx));
          g1.y = Math.max(90, Math.min(166, g1.y - ny));
        } else {
          // Both roaming: divide overlap equally
          g1.x = Math.max(38, Math.min(295, g1.x - nx * 0.5));
          g1.y = Math.max(90, Math.min(166, g1.y - ny * 0.5));
          g2.x = Math.max(38, Math.min(295, g2.x + nx * 0.5));
          g2.y = Math.max(90, Math.min(166, g2.y + ny * 0.5));
        }
      }
    }
  }

  gladiatorsRef.current = updatedCampGlads;
  setGladiators(updatedCampGlads);
}
