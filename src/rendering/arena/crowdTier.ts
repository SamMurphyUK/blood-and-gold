// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

// ============================================================================
// 5 ARENA CROWD TIERS (VISUAL & ACOUSTIC PROGRESSION)
// Tier 1: Empty / The Dust Bowl (0-3 Battles completed)
// Tier 2: Sparse / Word of Mouth (Podium 2 / 4-7 Battles)
// Tier 3: Half-Full / Rising Renown (Podium 3 / 8-12 Battles)
// Tier 4: Packed / Colosseum Scale (Podium 4 / 13-17 Battles)
// Tier 5: Imperial Apex (Podium 5 / Boss / 18+ Battles)
// ============================================================================

export function getCrowdTier(
  unlockedTierIndex: number,
  totalBattlesWon: number,
  isBossOrSpecial = false,
): 1 | 2 | 3 | 4 | 5 {
  if (isBossOrSpecial || unlockedTierIndex >= 4 || totalBattlesWon >= 18) {
    return 5;
  }
  if (unlockedTierIndex >= 3 || totalBattlesWon >= 13) {
    return 4;
  }
  if (unlockedTierIndex >= 2 || totalBattlesWon >= 8) {
    return 3;
  }
  if (unlockedTierIndex >= 1 || totalBattlesWon >= 4) {
    return 2;
  }
  return 1;
}
