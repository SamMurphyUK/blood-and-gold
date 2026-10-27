// Stage 3A: getPodiumCountdownMultiplier, moved verbatim out of App.tsx so the update systems can use it without importing App.

export function getPodiumCountdownMultiplier(tierIdx: number): number {
  if (tierIdx <= 1) return 1.0;
  if (tierIdx === 2) return 1.3; // Tier 3: 30% longer countdown
  if (tierIdx === 3) return 1.5; // Tier 4: 50% longer countdown
  return 1.6; // Tier 5: 60% longer countdown
}
