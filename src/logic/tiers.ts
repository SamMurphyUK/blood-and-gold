// Stage 3A: getPodiumCountdownMultiplier, moved verbatim out of App.tsx so the update systems can use it without importing App.
// Stage 3B: isSpecialNarrativeQuest moved here too, so resolveBattle can use it without importing App.

import type {BattleTier} from '../types';

export function getPodiumCountdownMultiplier(tierIdx: number): number {
  if (tierIdx <= 1) return 1.0;
  if (tierIdx === 2) return 1.3; // Tier 3: 30% longer countdown
  if (tierIdx === 3) return 1.5; // Tier 4: 50% longer countdown
  return 1.6; // Tier 5: 60% longer countdown
}

export function isSpecialNarrativeQuest(tier: BattleTier | null): boolean {
  if (!tier) return false;
  return (
    tier.id.startsWith('sandbox_uprising') ||
    tier.id.startsWith('fortified_') ||
    tier.isFortifiedQuest === true ||
    tier.mapTheme === 'rome_flames' ||
    tier.mapTheme === 'river_rubicon' ||
    tier.mapTheme === 'alpine_rampart' ||
    tier.mapTheme === 'gallic_crossing'
  );
}
