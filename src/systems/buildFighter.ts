// Stage 3B: the one constructor for an ArenaFighter.
// Twelve spawn sites (trial squads, tier enemies, Emperor duel, Rome in Flames, camp defense, reinforcements)
// each repeated the same ten "fresh fighter" fields. Those live here now; each site still passes its own
// identity, stats, placement and timers, and may override any base field.

import type {ArenaFighter} from '../types';

const FIGHTER_BASE = {
  stamina: 100,
  maxStamina: 100,
  vx: 0,
  vy: 0,
  state: 'idle',
  isBaiting: false,
  pinnedTimer: 0,
  deathTimer: 0,
  flashWhiteTimer: 0,
  rageTimer: 0,
} as const;

type BaseKeys = keyof typeof FIGHTER_BASE;

export type FighterSpec = Omit<ArenaFighter, BaseKeys> & Partial<Pick<ArenaFighter, BaseKeys>>;

export function buildFighter(spec: FighterSpec): ArenaFighter {
  return {...FIGHTER_BASE, ...spec};
}
