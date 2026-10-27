// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

// Continuous, smooth 3-second Day/Night interpolated gradient transition
export function getSmoothDayNightTint(cTime: number): { r: number; g: number; b: number; a: number; isNight: boolean } {
  const normTime = ((cTime % 120) + 120) % 120;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

  // Dawn: (225, 140, 115, 0.14)
  // Day:  (255, 235, 190, 0.0)
  // Dusk: (235, 135, 45, 0.18)
  // Night: (16, 20, 32, 0.54)

  if (normTime >= 0 && normTime < 18) {
    return { r: 225, g: 140, b: 115, a: 0.14, isNight: false };
  } else if (normTime >= 18 && normTime < 21) {
    // 3-second transition: Dawn -> Day
    const t = (normTime - 18) / 3;
    return {
      r: Math.round(lerp(225, 255, t)),
      g: Math.round(lerp(140, 235, t)),
      b: Math.round(lerp(115, 190, t)),
      a: lerp(0.14, 0.0, t),
      isNight: false,
    };
  } else if (normTime >= 21 && normTime < 65) {
    return { r: 255, g: 235, b: 190, a: 0.0, isNight: false };
  } else if (normTime >= 65 && normTime < 68) {
    // 3-second transition: Day -> Dusk
    const t = (normTime - 65) / 3;
    return {
      r: Math.round(lerp(255, 235, t)),
      g: Math.round(lerp(235, 135, t)),
      b: Math.round(lerp(190, 45, t)),
      a: lerp(0.0, 0.18, t),
      isNight: false,
    };
  } else if (normTime >= 68 && normTime < 78) {
    return { r: 235, g: 135, b: 45, a: 0.18, isNight: false };
  } else if (normTime >= 78 && normTime < 81) {
    // 3-second transition: Dusk -> Night
    const t = (normTime - 78) / 3;
    return {
      r: Math.round(lerp(235, 16, t)),
      g: Math.round(lerp(135, 20, t)),
      b: Math.round(lerp(45, 32, t)),
      a: lerp(0.18, 0.54, t),
      isNight: t > 0.5,
    };
  } else if (normTime >= 81 && normTime < 117) {
    return { r: 16, g: 20, b: 32, a: 0.54, isNight: true };
  } else {
    // 3-second transition: Night -> Dawn (117 to 120)
    const t = (normTime - 117) / 3;
    return {
      r: Math.round(lerp(16, 225, t)),
      g: Math.round(lerp(20, 140, t)),
      b: Math.round(lerp(32, 115, t)),
      a: lerp(0.54, 0.14, t),
      isNight: t < 0.5,
    };
  }
}
