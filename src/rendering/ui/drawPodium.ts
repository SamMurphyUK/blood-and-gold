// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

import {drawRomanPodiumScreen} from './podiumScreen';
import type {RenderView} from '../view';

export type PodiumSceneView = Pick<
  RenderView,
  | 'unlockedTierIndex'
  | 'podiumGladiatorsRef'
  | 'gladiators'
  | 'animTimeRef'
  | 'podiumTimerRef'
  | 'podiumFlashTimerRef'
>;

// PODIUM scene: the low-res pixel pass (second branch of the old draw() mode chain).
export function drawPodium(view: PodiumSceneView, offCtx: CanvasRenderingContext2D) {
  const {
    unlockedTierIndex,
    podiumGladiatorsRef,
    gladiators,
    animTimeRef,
    podiumTimerRef,
    podiumFlashTimerRef,
  } = view;

  // 2. PODIUM VIEW: 5-Stage Monumental Roman Staircase with Winning Gladiators & Fire Ignition
  const newlyWonTier = Math.max(0, unlockedTierIndex - 1);
  const gladsToDraw =
    podiumGladiatorsRef.current.length > 0
      ? podiumGladiatorsRef.current
      : gladiators.filter((g) => g.hp > 0).slice(0, 3);

    drawRomanPodiumScreen(
    offCtx,
    unlockedTierIndex,
    animTimeRef.current,
    gladsToDraw,
    newlyWonTier,
    podiumTimerRef.current,
    podiumFlashTimerRef.current,
  );
}
