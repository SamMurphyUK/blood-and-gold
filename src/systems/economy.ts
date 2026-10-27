// Stage 3B: the one place gold (and the score that tracks it) changes.
// Every purse change used to be an inline `setGameState(prev => ({...prev, gold: ...}))`; those calls now go
// through credit/debit. The two options reproduce the three arithmetic shapes the old call sites used:
//   plain      gold = prev.gold ± amount
//   floored    gold = Math.max(0, prev.gold ± amount)
//   scoring    score = prev.score + amount, in the same update as the gold change
// Whole-state replacements (new game, load) still call setGameState directly because they are not arithmetic.

import type {Dispatch, SetStateAction} from 'react';
import type {GameState} from '../../utils/helper';

export interface Economy {
  /** gold += amount. `floorAtZero` clamps the result at 0; `addToScore` adds the same amount to score. */
  credit(amount: number, opts?: {floorAtZero?: boolean; addToScore?: boolean}): void;
  /** gold -= amount. `floorAtZero` clamps the result at 0. */
  debit(amount: number, opts?: {floorAtZero?: boolean}): void;
}

export function createEconomy(setGameState: Dispatch<SetStateAction<GameState>>): Economy {
  return {
    credit(amount, opts) {
      setGameState((prev) => {
        const gold = prev.gold + amount;
        return {
          ...prev,
          gold: opts?.floorAtZero ? Math.max(0, gold) : gold,
          ...(opts?.addToScore ? {score: prev.score + amount} : {}),
        };
      });
    },
    debit(amount, opts) {
      setGameState((prev) => {
        const gold = prev.gold - amount;
        return {...prev, gold: opts?.floorAtZero ? Math.max(0, gold) : gold};
      });
    },
  };
}
