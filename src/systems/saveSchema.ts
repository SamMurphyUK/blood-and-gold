// Stage 3C: the one list of persisted game state.
//
// Every field the save file carries is declared here exactly once: its new-game value, how a loaded value is
// validated, and (where the stored form differs from the live form) how it is converted. Three operations are
// derived from that single list:
//
//   serializeSave   live game -> save-file object   (triggerAutosave)
//   restoreSave     save-file object -> live game   (restoreSavedGame, "Continue")
//   resetToInitial  new-game values -> live game    (initGame, "New Game")
//
// The App supplies `SaveBindings`: for each field, how to read the live value and how to write it (state setter
// plus its mirror ref). `SaveBindings` is a mapped type over the schema, so adding a field here without a binding in
// App, or a binding without a field, is a compile error. A field can no longer be saved but not restored, or
// restored but not reset.

import type {Dispatch, SetStateAction} from 'react';
import {getConfig} from '../../constants';
import {INITIAL_GLADIATORS} from '../data/gladiators';
import {INITIAL_MEMORIAL_GRAVES} from '../data/memorial';
import {recalculateGladiatorStats} from '../logic/gladiatorStats';
import type {Gladiator, LudusUpgrades, MemorialGrave} from '../types';

export const SAVE_KEY = 'gladiator_manager_save';
export const SAVE_VERSION = 1;

export interface GladiatorQuestProgress {
  gladiatorId: string;
  chainId: string;
  nextNodeId: string;
  stage: number;
}

interface SaveField<T> {
  /** Value for a fresh campaign. Also the `useState` initial value for the field. */
  initial: () => T;
  /** Is this raw loaded value usable? An unusable or missing value leaves the live field untouched. */
  accepts: (raw: unknown) => boolean;
  /** Live value -> stored value. Default: stored as is. */
  toSave?: (live: T) => unknown;
  /** Stored value -> live value (also where clamping lives). Default: used as is. */
  fromSave?: (raw: any) => T;
}

function field<T>(spec: SaveField<T>): SaveField<T> {
  return spec;
}

const isNumber = (raw: unknown) => typeof raw === 'number';
const isBoolean = (raw: unknown) => typeof raw === 'boolean';
const isArray = (raw: unknown) => Array.isArray(raw);
const isObject = (raw: unknown) => !!raw && typeof raw === 'object';

export function initialBonds(): Record<string, number> {
  const bonds: Record<string, number> = {};
  for (let i = 0; i < INITIAL_GLADIATORS.length; i++) {
    for (let j = i + 1; j < INITIAL_GLADIATORS.length; j++) {
      const key = [INITIAL_GLADIATORS[i].id, INITIAL_GLADIATORS[j].id].sort().join('__');
      bonds[key] = 16 + ((i * 3 + j * 5) % 6);
    }
  }
  return bonds;
}

export const SAVE_SCHEMA = {
  gold: field<number>({initial: () => getConfig('startingGold') as number, accepts: isNumber}),
  score: field<number>({initial: () => 0, accepts: isNumber}),
  day: field<number>({initial: () => 1, accepts: isNumber, fromSave: (d) => Math.max(1, d)}),
  timeOfDay: field<number>({initial: () => 35, accepts: isNumber}),
  weather: field<'clear' | 'rain'>({
    initial: () => 'clear',
    accepts: (raw) => raw === 'clear' || raw === 'rain',
  }),
  gladiators: field<Gladiator[]>({
    initial: () => [{...INITIAL_GLADIATORS[0]}],
    accepts: (raw) => Array.isArray(raw) && raw.length > 0,
    // A save never stores a mid-battle or mid-walk state.
    toSave: (live) =>
      live.map((g) => ({
        ...g,
        status: g.status === 'In Arena' ? ('Available' as const) : g.status,
        questWalkState: 'none' as const,
        hidden: false,
      })),
    fromSave: (raw: any[]) =>
      raw.map((rawG) =>
        recalculateGladiatorStats({
          ...rawG,
          status: rawG.status === 'In Arena' ? ('Available' as const) : rawG.status,
          questWalkState: 'none' as const,
          hidden: false,
          x: Math.max(38, Math.min(295, rawG.x || 100)),
          y: Math.max(90, Math.min(166, rawG.y || 120)),
          targetX: Math.max(38, Math.min(295, rawG.targetX || 100)),
          targetY: Math.max(90, Math.min(166, rawG.targetY || 120)),
          state: 'idle',
          targetActivity: 'idle',
          hp: Math.max(1, rawG.hp || rawG.maxHp || 150),
        } as Gladiator),
      ),
  }),
  playerInventory: field<string[]>({initial: () => [], accepts: isArray}),
  unlockedTierIndex: field<number>({initial: () => 0, accepts: isNumber}),
  totalBattlesWon: field<number>({initial: () => 0, accepts: isNumber}),
  totalRecruited: field<number>({initial: () => 1, accepts: isNumber}),
  managerRenown: field<number>({initial: () => 0, accepts: isNumber}),
  speechcraftLevel: field<number>({initial: () => 1, accepts: isNumber}),
  ludusUpgrades: field<LudusUpgrades>({
    initial: () => ({trainingGrounds: 0, medicalBay: 0, breedingPens: 0}),
    accepts: isObject,
  }),
  isFeastUnlocked: field<boolean>({initial: () => false, accepts: isBoolean}),
  isColiseumChampion: field<boolean>({initial: () => false, accepts: isBoolean}),
  isEmperorEnraged: field<boolean>({initial: () => false, accepts: isBoolean}),
  isEmperorDefeated: field<boolean>({initial: () => false, accepts: isBoolean}),
  isRevoltUnlocked: field<boolean>({initial: () => false, accepts: isBoolean}),
  bonds: field<Record<string, number>>({initial: initialBonds, accepts: isObject}),
  physicianCost: field<number>({initial: () => 50, accepts: isNumber, fromSave: (c) => Math.max(50, c)}),
  memorialGraves: field<MemorialGrave[]>({initial: () => INITIAL_MEMORIAL_GRAVES, accepts: isArray}),
  unlockedChains: field<string[]>({
    initial: () => ['chain_corrupt_senator', 'chain_shadow_broker', 'chain_priestess_bellona'],
    accepts: isArray,
  }),
  unlockedGladiatorQuests: field<GladiatorQuestProgress[]>({initial: () => [], accepts: isArray}),
  firstBattleDone: field<boolean>({initial: () => false, accepts: isBoolean}),
};

export type SaveKey = keyof typeof SAVE_SCHEMA;
export type SaveValue<K extends SaveKey> = (typeof SAVE_SCHEMA)[K] extends SaveField<infer T> ? T : never;

/** How the App reads and writes one live field. `set` must update both the React state and its mirror ref. */
export type SaveBindings = {
  [K in SaveKey]: {get: () => SaveValue<K>; set: (value: SaveValue<K>) => void};
};

/** Binding for the common case: a React state value mirrored in a ref. `set` updates both. */
export function bindRef<T>(ref: {current: T}, setState: Dispatch<SetStateAction<T>>) {
  return {
    get: () => ref.current,
    set: (value: T) => {
      setState(value);
      ref.current = value;
    },
  };
}

const KEYS = Object.keys(SAVE_SCHEMA) as SaveKey[];

/** Typed accessor so the per-key loops below stay readable. */
function spec<K extends SaveKey>(key: K): SaveField<SaveValue<K>> {
  return SAVE_SCHEMA[key] as unknown as SaveField<SaveValue<K>>;
}

export function serializeSave(bindings: SaveBindings): Record<string, unknown> {
  const out: Record<string, unknown> = {version: SAVE_VERSION, timestamp: Date.now()};
  for (const key of KEYS) {
    const live = bindings[key].get();
    const s = spec(key);
    out[key] = s.toSave ? s.toSave(live as never) : live;
  }
  return out;
}

/** Applies every field of `data` that is present and valid; returns the keys that were restored. */
export function restoreSave(bindings: SaveBindings, data: Record<string, unknown>): SaveKey[] {
  const restored: SaveKey[] = [];
  for (const key of KEYS) {
    const raw = data[key];
    const s = spec(key);
    if (!s.accepts(raw)) continue;
    const value = s.fromSave ? s.fromSave(raw) : (raw as SaveValue<typeof key>);
    (bindings[key].set as (v: unknown) => void)(value);
    restored.push(key);
  }
  return restored;
}

export function resetToInitial(bindings: SaveBindings): void {
  for (const key of KEYS) {
    (bindings[key].set as (v: unknown) => void)(spec(key).initial());
  }
}
