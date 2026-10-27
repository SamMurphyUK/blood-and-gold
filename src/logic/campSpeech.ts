// Stage 3A: getCampSpeechLine, moved verbatim out of App.tsx so the update systems can use it without importing App.

import type {Gladiator} from '../types';

// ============================================================================
// CAMP SPEECH BUBBLE DYNAMIC STRING GENERATOR
// Tailored to Culture, Health (wounded vs full HP), Level (rookie vs veteran),
// and Closest Sworn Bond ally.
// ============================================================================

export function getCampSpeechLine(
  glad: Gladiator,
  allGlads: Gladiator[],
  bonds: Record<string, number>,
): string {
  if (!glad) return '';

  // If afflicted with Mad trait from Ghost Flash investigation breakdown:
  if (glad.traits?.includes('Mad') && Math.random() < 0.65) {
    const madLines = [
      'THE LIGHTS! THEY LIVE BENEATH THE DIRT!',
      'They whisper under the sand...',
      'Do you not hear the dirt singing, manager?!',
      'Stop poking the air! It watches us!',
      'THE PHANTOM LIGHTS DANCE AGAIN!',
    ];
    return madLines[Math.floor(Math.random() * madLines.length)];
  }

  const candidates: string[] = [
    'Hast thou traded for the Parthian archer card yet?',
    'More spiced Falernian wine tonight, brother!',
    'My dice always favor the high rolls after a hard training bout.',
    'I wager three copper tokens on the next chariot race.',
  ];
  const culture = glad.culture || 'roman';

  // 1. Cultural Heritage & Philosophy
  if (culture === 'roman') {
    candidates.push(
      'Discipline triumphs where wild fury falters.',
      'By Jupiter’s thunder, our formation remains unbreakable.',
      'The coliseum roars only for those who master iron discipline.',
      'A true legionary feels neither thirst nor fear—only order.',
    );
  } else if (culture === 'celt') {
    candidates.push(
      'The spirits of my ancestors whisper in the autumn wind.',
      'My golden torc was blessed by the sacred groves of old.',
      'No Roman cage can tame the ancestral fire within my blood.',
      'Iron may strike deep, but ancient ferocity never bends.',
    );
  } else if (culture === 'berber') {
    candidates.push(
      'The desert winds taught me to strike before the eye can blink.',
      'These stone walls cannot quench the swift spirit of the dunes.',
      'A warrior who conquers desert thirst knows no defeat.',
      'Swift as the desert viper, silent as the drifting sands.',
    );
  } else if (culture === 'scythian') {
    candidates.push(
      'My heart yearns for the open expanse of the great steppe.',
      'Every bronze tip is notched with precision and quiet resolve.',
      'On vast horizons, swift distance is the truest armor.',
      'The recurve bowstring sings a melody older than these stone arenas.',
    );
  } else {
    // hunnic
    candidates.push(
      'The iron vanguard breaks through every shield wall in time.',
      'Years of endurance on the march forged these iron sinews.',
      'We do not fear the pit—we raid the arena like a contested border.',
      'Unforgiving endurance outlasts the sharpest blade.',
    );
  }

  // 2. Health & Wound State
  const gladHp = glad.hp || 0;
  const gladMaxHp = Math.max(1, glad.maxHp || 150);
  if (gladHp < gladMaxHp * 0.6) {
    candidates.push(
      'My ribs still ache from that murmillo’s scutum...',
      'These linen bandages will not hold forever... I need rest.',
      'Stitched flesh and bruised bone, but my grip is firm.',
      'Blood was spilled today, but breath still fills my chest.',
    );
  } else if (gladHp >= gladMaxHp * 0.9) {
    candidates.push(
      'My blade is thirsty.',
      'My sinews are coiled and ready for the roar of the crowd.',
      'Never felt stronger. Bring forth the next challenger!',
      'The sands call out—my arms are rested and eager.',
    );
  }

  // 3. Level & Experience
  const gladLevel = glad.level || 1;
  if (gladLevel === 1) {
    candidates.push(
      'Will the sands remember my name?',
      'My knees trembled before my first duel, but no longer.',
      'One bout at a time... I must survive to earn renown.',
      'The trainer pushes hard, but glory demands sacrifice.',
    );
  } else if (gladLevel >= 3) {
    candidates.push(
      'I have survived thirty bouts on this bloodied sand.',
      'They chant for spectacle, but I fight for survival and honor.',
      'Few survive enough seasons here to count gray hairs.',
      'Veterans know the truth: pride kills faster than steel.',
    );
  }

  // 4. Highest Bond with brother-in-arms
  let bestScore = -1;
  let bestAlly: Gladiator | null = null;
  const safeGlads = Array.isArray(allGlads) ? allGlads.filter(Boolean) : [];
  for (const other of safeGlads) {
    if (!other || other.id === glad.id) continue;
    const key = [glad.id, other.id].sort().join('__');
    const score = (bonds && bonds[key]) ?? 15;
    if (score > bestScore) {
      bestScore = score;
      bestAlly = other;
    }
  }

  if (bestAlly && bestScore >= 20) {
    const allyFirst = (bestAlly.name || 'Comrade').split(' ')[0];
    candidates.push(
      `I trust ${allyFirst} to watch my back.`,
      `May the gods spare ${allyFirst} today.`,
      `As long as ${allyFirst} stands beside me, no champion breaks us.`,
      `Shared sweat in the yard forged an unbreakable bond with ${allyFirst}.`,
    );
  }

  return candidates[Math.floor(Math.random() * candidates.length)] || '';
}
