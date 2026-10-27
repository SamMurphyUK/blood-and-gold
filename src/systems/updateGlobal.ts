// Stage 3A: frame timers, gold tally, shake, popups and particles, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {gameAudio} from '../../utils/helper';
import {PIXEL_SCALE} from '../rendering/primitives';
import type {UpdateView} from './view';

type UpdateGlobalTimersView = Pick<
  UpdateView,
  | 'screenShakeTimerRef'
  | 'setCampActionCooldowns'
  | 'setArenaActionCooldowns'
  | 'setDisplayedGold'
  | 'displayedGoldRef'
  | 'goldTallyRef'
  | 'flyingGoldCoinsRef'
  | 'goldTargetGlowTimerRef'
  | 'particlesRef'
  | 'animTimeRef'
>;

export function updateGlobalTimers(view: UpdateGlobalTimersView, dt: number) {
  const {
    screenShakeTimerRef,
    setCampActionCooldowns,
    setArenaActionCooldowns,
    setDisplayedGold,
    displayedGoldRef,
    goldTallyRef,
    flyingGoldCoinsRef,
    goldTargetGlowTimerRef,
    particlesRef,
    animTimeRef,
  } = view;

  animTimeRef.current += dt;

  // Update Gold Tally Count-Up Animation & Pitch Escalation Blips
  const tally = goldTallyRef.current;
  if (tally.isTallying) {
    tally.timer += dt;
    const tProg = Math.min(1, tally.timer / Math.max(0.001, tally.duration));
    const nextVal = Math.round(tally.startGold + (tally.targetGold - tally.startGold) * tProg);

    if (nextVal !== displayedGoldRef.current) {
      displayedGoldRef.current = nextVal;
      setDisplayedGold(nextVal);
    }

    // Rhythmic audio blips with rising pitch/frequency from ~440Hz up to ~880Hz+
    tally.timeSinceBlip += dt;
    if (tally.timeSinceBlip >= tally.blipInterval) {
      tally.timeSinceBlip = 0;
      const currentFreq = 440 + tProg * 440; // 440Hz up to 880Hz
      gameAudio.playTallyBlip(currentFreq);
    }

    if (tProg >= 1) {
      tally.isTallying = false;
      displayedGoldRef.current = tally.targetGold;
      setDisplayedGold(tally.targetGold);
      gameAudio.playTallyBlip(920); // crisp final accent
    }
  }

  // Update Flying Gold Particles Arcing Upward to Top-Right Counter
  if (flyingGoldCoinsRef.current.length > 0) {
    flyingGoldCoinsRef.current = flyingGoldCoinsRef.current.filter((coin) => {
      coin.progress += coin.speed * dt;
      if (coin.progress < 0) return true; // waiting on stagger delay

      const p = Math.min(1, coin.progress);
      const cpX = (coin.startX + coin.targetX) * 0.5;
      const cpY = Math.min(coin.startY, coin.targetY) + coin.arcHeight;

      const invT = 1 - p;
      coin.x = invT * invT * coin.startX + 2 * invT * p * cpX + p * p * coin.targetX;
      coin.y = invT * invT * coin.startY + 2 * invT * p * cpY + p * p * coin.targetY;
      coin.rotation += coin.rotSpeed * dt;

      if (p >= 1) {
        goldTargetGlowTimerRef.current = 0.2;
        for (let s = 0; s < 3; s++) {
          particlesRef.current.push({
            x: coin.targetX / PIXEL_SCALE,
            y: coin.targetY / PIXEL_SCALE,
            color: '#F7DEAA',
            vx: (Math.random() - 0.5) * 16,
            vy: -8 - Math.random() * 12,
            life: 0.35,
            maxLife: 0.35,
            size: 2,
          });
        }
        return false;
      }
      return true;
    });
  }

  if (goldTargetGlowTimerRef.current > 0) {
    goldTargetGlowTimerRef.current = Math.max(0, goldTargetGlowTimerRef.current - dt);
  }

  // Decay arena screen shake smoothly back to 0
  if (screenShakeTimerRef.current > 0) {
    screenShakeTimerRef.current = Math.max(0, screenShakeTimerRef.current - dt);
    if (isNaN(screenShakeTimerRef.current) || screenShakeTimerRef.current < 0.001) {
      screenShakeTimerRef.current = 0;
    }
  }

  // Decrement Manager Action Bar Cooldowns
  setCampActionCooldowns((prev) => ({
    inspire: Math.max(0, prev.inspire - dt),
    punish: Math.max(0, prev.punish - dt),
    physician: Math.max(0, prev.physician - dt),
    study: Math.max(0, prev.study - dt),
  }));

  setArenaActionCooldowns((prev) => ({
    ...prev,
    shout: Math.max(0, prev.shout - dt),
    sand: Math.max(0, prev.sand - dt),
    stimulant: Math.max(0, prev.stimulant - dt),
  }));
}

type UpdateFloatingEffectsView = Pick<
  UpdateView,
  | 'etherealSparksRef'
  | 'setCrispPopups'
  | 'particlesRef'
>;

export function updateFloatingEffects(view: UpdateFloatingEffectsView, dt: number) {
  const {etherealSparksRef, setCrispPopups, particlesRef} = view;

  // Update Floating Particles
  particlesRef.current = particlesRef.current.filter((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.isBlood) {
      p.vy += 45 * dt; // Gravity on blood droplets
    }
    p.life -= dt;
    return p.life > 0;
  });

  // Update Ethereal Sparks (Ghost Flash Easter Egg)
  etherealSparksRef.current = etherealSparksRef.current.filter((s) => {
    s.timer -= dt;
    return s.timer > 0;
  });

  // Update Crisp Vector Popups
  setCrispPopups((prev) =>
    prev
      .map((pop) => ({
        ...pop,
        life: pop.life - dt,
        logicY: pop.logicY - 16 * dt, // Smooth vector float upward
      }))
      .filter((pop) => pop.life > 0),
  );
}
