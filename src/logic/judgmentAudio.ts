// Stage 3A: playJudgmentAudio, moved verbatim out of App.tsx so the update systems can use it without importing App.

import {gameAudio} from '../../utils/helper';

export function playJudgmentAudio(type: 'build' | 'cheer' | 'slash' | 'roar') {
  if (type === 'build') {
    try {
      const a = new Audio('crowd_ooo_build.mp3');
      a.volume = 0.6;
      a.play().catch(() => {});
    } catch (_) {}
    gameAudio.playCrowdMurmurBuild();
  } else if (type === 'cheer' || type === 'roar') {
    try {
      const a = new Audio('crowd_cheer.mp3');
      a.volume = 0.9;
      a.play().catch(() => {});
    } catch (_) {}
    gameAudio.playCrowdWhoop();
    gameAudio.playCrowdReaction(5, true);
    gameAudio.playCrowdFatalBlow(5);
  } else if (type === 'slash') {
    try {
      const a = new Audio('sword_slash.mp3');
      a.volume = 0.8;
      a.play().catch(() => {});
    } catch (_) {}
    gameAudio.playSwordClash();
    gameAudio.playMeleePunch();
  }
}
