// Stage 3C: a throttled re-render clock for HUD readouts that read refs while rendering.
// With the per-frame setGladiators gone, App only re-renders on state changes and on roster flushes. Anything in the
// JSX that reads live ref data (for example the sandbox telemetry's "Active" fighter counts) uses this to refresh
// at ~10 Hz while it is on screen, instead of depending on an accidental 60 Hz render. Idle (active = false) costs nothing.

import {useEffect, useState} from 'react';

export function useHudTick(active: boolean, intervalMs = 100): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return tick;
}
