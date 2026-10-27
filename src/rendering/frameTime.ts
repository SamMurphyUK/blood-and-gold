// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

export const getSafeNow = (): number => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    const p = performance.now();
    if (typeof p === 'number' && !isNaN(p) && p > 0) return p;
  }
  return Date.now();
};
