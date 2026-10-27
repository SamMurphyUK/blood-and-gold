// Stage 3B/3C: the one place the gladiator roster changes, and the store React subscribes to.
//
// `gladiatorsRef` is the live roster. The 60 FPS camp loop (update + renderFrame) reads and replaces it directly,
// and event handlers read it for the freshest data. React does not own a copy any more: App reads the roster
// through `useSyncExternalStore(roster.subscribe, roster.getSnapshot)`, and the snapshot only moves when
//   - a discrete mutation happens (set / add / patch / remove / refresh publish immediately), or
//   - pending frame-loop changes are flushed (`tick` writes the ref only; `flush` runs ~10 Hz from App and
//     publishes them, which is what keeps HP bars and roster lists live without a 60 Hz React re-render).
// Every method starts from the ref, so consecutive calls in the same tick see each other's changes. That is also
// why the expedition finale recruit is no longer lost: it used to be queued as a state updater and then
// overwritten by a list built from the ref.

import type {MutableRefObject} from 'react';
import type {Gladiator} from '../types';

export interface Roster {
  /** Replace the whole roster and publish to React now. */
  set(next: Gladiator[]): void;
  add(glad: Gladiator): void;
  patch(id: string, change: Partial<Gladiator> | ((g: Gladiator) => Gladiator)): void;
  remove(id: string): void;
  /** Publish a new snapshot after gladiators were mutated in place. */
  refresh(): void;
  /** Frame loop only: replace the roster in the ref without notifying React. Pending until `flush`. */
  tick(next: Gladiator[]): void;
  /** Publish pending `tick` changes (called ~10 Hz). No-op when nothing is pending. */
  flush(): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): Gladiator[];
}

export function createRoster(gladiatorsRef: MutableRefObject<Gladiator[]>): Roster {
  let snapshot = gladiatorsRef.current;
  let dirty = false;
  const listeners = new Set<() => void>();

  function publish() {
    dirty = false;
    if (snapshot === gladiatorsRef.current) return;
    snapshot = gladiatorsRef.current;
    listeners.forEach((l) => l());
  }

  const roster: Roster = {
    set(next) {
      gladiatorsRef.current = next;
      publish();
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
      roster.set([...gladiatorsRef.current]);
    },
    tick(next) {
      gladiatorsRef.current = next;
      dirty = true;
    },
    flush() {
      if (dirty) publish();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
  };
  return roster;
}
