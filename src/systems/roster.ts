// Stage 3B: the one place the gladiator roster changes.
// The roster lives twice in App: React state (`gladiators`, for the UI) and `gladiatorsRef` (for the frame loop
// and event handlers). Every write used to have to touch both, and a write that only queued a state updater
// (`setGladiators(prev => [...prev, g])`) was silently overwritten by a later `setGladiators(listBuiltFromRef)`,
// which is how the expedition finale recruit got lost. These methods always update the ref and the state
// together, using the ref as the base, so consecutive calls in the same tick see each other's changes.
// `gladiatorsRef.current = gladiators` in App's render body stays: it only re-syncs the ref from committed state.

import type {Dispatch, MutableRefObject, SetStateAction} from 'react';
import type {Gladiator} from '../types';

export interface Roster {
  /** Replace the whole roster. */
  set(next: Gladiator[]): void;
  /** Append one gladiator. */
  add(glad: Gladiator): void;
  /** Change one gladiator: merge a partial, or return a replacement from the current record. */
  patch(id: string, change: Partial<Gladiator> | ((g: Gladiator) => Gladiator)): void;
  /** Drop one gladiator by id. */
  remove(id: string): void;
  /** Re-publish the current roster to React state after gladiator objects were edited in place. */
  refresh(): void;
}

export function createRoster(
  gladiatorsRef: MutableRefObject<Gladiator[]>,
  setGladiators: Dispatch<SetStateAction<Gladiator[]>>,
): Roster {
  const roster: Roster = {
    set(next) {
      gladiatorsRef.current = next;
      setGladiators(next);
    },
    add(glad) {
      roster.set([...gladiatorsRef.current, glad]);
    },
    patch(id, change) {
      roster.set(
        gladiatorsRef.current.map((g) =>
          g.id === id ? (typeof change === 'function' ? change(g) : {...g, ...change}) : g,
        ),
      );
    },
    remove(id) {
      roster.set(gladiatorsRef.current.filter((g) => g.id !== id));
    },
    refresh() {
      setGladiators([...gladiatorsRef.current]);
    },
  };
  return roster;
}
