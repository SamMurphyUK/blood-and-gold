// Stage 3A: dispatcher, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import type {UpdateView} from './view';
import {updateIntroCinematic, updateJudgmentCinematic} from './updateCinematic';
import {updateGlobalTimers, updateFloatingEffects} from './updateGlobal';
import {updateVisitorTimer} from './updateNpcs';
import {updateSimulatedAd, updateSandboxHold, updateArena} from './updateArena';
import {updateCamp} from './updateCamp';
import {updatePodium} from './updatePodium';

/**
 * Per-frame simulation entry point. Replaces the old `update(dt)` closure in App.tsx; the sections run in
 * exactly the order they ran inside it, and every early `return` keeps ending the frame at the same point.
 */
export function updateWorld(view: UpdateView, dt: number) {
  const {isGameMenuOpen, gameStateRef, modeRef} = view;

  if (updateIntroCinematic(view, dt)) return;

  if (gameStateRef.current.status !== 'PLAYING' || isGameMenuOpen) return;

  updateGlobalTimers(view, dt);

  updateVisitorTimer(view, dt);

  if (updateSimulatedAd(view, dt)) return;

  if (updateSandboxHold(view, dt)) return;

  if (updateJudgmentCinematic(view, dt)) return;

  updateFloatingEffects(view, dt);

  if (modeRef.current === 'camp') {
    updateCamp(view, dt);
  } else if (modeRef.current === 'arena') {
    updateArena(view, dt);
  } else if (modeRef.current === 'podium') {
    updatePodium(view, dt);
  }
}
