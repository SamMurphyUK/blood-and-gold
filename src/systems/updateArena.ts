// Stage 3A: arena simulation and sandbox end-of-battle flow, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {gameAudio} from '../../utils/helper';
import {toRoman} from '../logic/roman';
import {getCrowdTier} from '../rendering/arena/crowdTier';
import type {ArenaFighter, Culture} from '../types';
import type {UpdateView} from './view';

type UpdateSimulatedAdView = Pick<
  UpdateView,
  | 'isSimulatedAdActive'
  | 'setIsSimulatedAdActive'
  | 'setAdCountdown'
  | 'adCountdownRef'
  | 'arenaFightersRef'
  | 'addCombatLog'
>;

export function updateSimulatedAd(view: UpdateSimulatedAdView, dt: number): boolean {
  const {
    isSimulatedAdActive,
    setIsSimulatedAdActive,
    setAdCountdown,
    adCountdownRef,
    arenaFightersRef,
    addCombatLog,
  } = view;

  // SIMULATED AD OVERLAY COUNTDOWN IN SANDBOX BATTLE
  if (isSimulatedAdActive) {
    adCountdownRef.current -= dt;
    setAdCountdown(Math.max(0, adCountdownRef.current));
    if (adCountdownRef.current <= 0) {
      setIsSimulatedAdActive(false);
      // Spawn 5 extra Rebel Slaves to turn the tide!
      const cultures: Culture[] = ['celt', 'berber', 'roman', 'scythian', 'hunnic'];
      const extraSlaves: ArenaFighter[] = Array.from({ length: 5 }).map((_, idx) => {
        const culture = cultures[idx % cultures.length];
        const rx = 36 + Math.random() * 32;
        const ry = 90 + Math.random() * 65;
        return {
          id: `rebel_reinforce_${Date.now()}_${idx}`,
          isPlayerTeam: true,
          name: `Rebel Reinforcement ${toRoman(idx + 1)}`,
          culture,
          title: 'Rebel Reinforcement',
          level: 1,
          hp: 55,
          maxHp: 55,
          stamina: 100,
          maxStamina: 100,
          attack: 18,
          defense: 3,
          speed: 22,
          tactics: 'aggressive',
          x: rx,
          y: ry,
          vx: 0,
          vy: 0,
          flipX: false,
          state: 'idle',
          animTimer: Math.random(),
          attackCooldown: 0.2 + Math.random() * 0.2,
          tacticsTimer: 1.0,
          isBaiting: false,
          pinnedTimer: 0,
          pinCooldown: 2.0,
          deathTimer: 0,
          flashWhiteTimer: 0,
          rageTimer: 0,
        };
      });

      arenaFightersRef.current = [...arenaFightersRef.current, ...extraSlaves];
      addCombatLog('✊ 5 Rebel Slaves join the uprising from the Roman alleys to turn the tide!', 'player');
      gameAudio.playPowerupChime();
    }
    return true; // Suspend combat simulation during simulated ad
  }

  return false;
}

type UpdateSandboxHoldView = Pick<
  UpdateView,
  | 'setIsEmperorDuel'
  | 'isEmperorDuelRef'
  | 'isSandboxBattleRef'
  | 'sandboxHoldTimerRef'
  | 'arenaFightersRef'
  | 'combatOutcomeRef'
  | 'finishSandboxDuelInternal'
  | 'finishDuelInternal'
>;

export function updateSandboxHold(view: UpdateSandboxHoldView, dt: number): boolean {
  const {
    setIsEmperorDuel,
    isEmperorDuelRef,
    isSandboxBattleRef,
    sandboxHoldTimerRef,
    arenaFightersRef,
    combatOutcomeRef,
    finishSandboxDuelInternal,
    finishDuelInternal,
  } = view;

  // POST-FINISH HOLD TIMER (~2.5s hold on battlefield with NO Emperor's Judgment for Special Quests)
  if (sandboxHoldTimerRef.current > 0) {
    sandboxHoldTimerRef.current -= dt;
    if (sandboxHoldTimerRef.current <= 0) {
      sandboxHoldTimerRef.current = 0;
      if (isEmperorDuelRef.current) {
        isEmperorDuelRef.current = false;
        setIsEmperorDuel(false);
        finishDuelInternal(combatOutcomeRef.current === 'victory', 'thumbs_down', false);
      } else if (isSandboxBattleRef.current) {
        finishSandboxDuelInternal(combatOutcomeRef.current === 'victory');
      } else {
        // Special narrative quest (Rubicon, Alpine, Gallic, etc.) or Camp Defense:
        // DEFEAT IN THIS REALM MEANS CERTAIN DEATH FOR ALL FALLEN WARRIORS (thumbs_down execution)!
        const isVic = combatOutcomeRef.current === 'victory';
        finishDuelInternal(isVic, isVic ? 'thumbs_up' : 'thumbs_down', false);
      }
    }
    // Continue updating positions/particles slightly so combatants settle
    arenaFightersRef.current.forEach((f) => {
      f.animTimer += dt;
      if (f.hp <= 0 && f.deathTimer > 0) {
        f.deathTimer = Math.max(0, f.deathTimer - dt);
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vx *= 0.88;
        f.vy *= 0.88;
      } else if (f.hp > 0) {
        f.vx = 0;
        f.vy = 0;
        f.state = 'idle';
      }
    });
    return true;
  }

  return false;
}

type UpdateArenaView = Pick<
  UpdateView,
  | 'crowdAudioTimerRef'
  | 'unlockedTierIndex'
  | 'isEmperorDuelRef'
  | 'totalBattlesWonRef'
  | 'judgmentStateRef'
  | 'isSandboxBattleRef'
  | 'simSpeed'
  | 'isSimPaused'
  | 'arenaSpeechBubblesRef'
  | 'activeTierRef'
  | 'combatOutcomeRef'
  | 'stepArenaCombat'
>;

export function updateArena(view: UpdateArenaView, dt: number) {
  const {
    crowdAudioTimerRef,
    unlockedTierIndex,
    isEmperorDuelRef,
    totalBattlesWonRef,
    judgmentStateRef,
    isSandboxBattleRef,
    simSpeed,
    isSimPaused,
    arenaSpeechBubblesRef,
    activeTierRef,
    combatOutcomeRef,
    stepArenaCombat,
  } = view;

  // Update Active Arena Speech Bubbles
  arenaSpeechBubblesRef.current = arenaSpeechBubblesRef.current.filter((b) => {
    b.timer -= dt;
    return b.timer > 0;
  });

  // Dynamic Procedural Arena Crowd Ambient Engine (5 Crowd Tiers)
  if (!isSimPaused && combatOutcomeRef.current === 'in_progress' && !judgmentStateRef.current.active) {
    crowdAudioTimerRef.current -= dt;
    if (crowdAudioTimerRef.current <= 0) {
      const curTier = activeTierRef.current;
      const isBossOrSpec = isEmperorDuelRef.current || isSandboxBattleRef.current || !!curTier?.isBoss;
      const cTier = getCrowdTier(unlockedTierIndex, totalBattlesWonRef.current, isBossOrSpec);

      if (cTier === 1) {
        crowdAudioTimerRef.current = 5.5 + Math.random() * 2.5;
        if (Math.random() < 0.6) {
          gameAudio.playWindWhistle();
        } else {
          gameAudio.playBoredClap();
        }
      } else if (cTier === 2) {
        crowdAudioTimerRef.current = 4.2 + Math.random() * 2.0;
        gameAudio.playCrowdReaction(2, false);
      } else if (cTier === 3) {
        crowdAudioTimerRef.current = 3.2 + Math.random() * 1.5;
        gameAudio.playCrowdReaction(3, false);
      } else if (cTier === 4) {
        crowdAudioTimerRef.current = 2.4 + Math.random() * 1.2;
        gameAudio.playCrowdReaction(4, false);
      } else {
        // Tier 5: The Imperial Apex
        crowdAudioTimerRef.current = 1.8 + Math.random() * 1.0;
        gameAudio.playCrowdReaction(5, false);
      }
    }
  }

  // ARENA PHASE: Real-time Multi-Fighter Skirmish simulation
  if (!isSimPaused && combatOutcomeRef.current === 'in_progress') {
    const effectiveDt = dt * simSpeed;
    stepArenaCombat(effectiveDt);
  }
}
