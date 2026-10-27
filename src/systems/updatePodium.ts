// Stage 3A: podium ceremony, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {PALETTE} from '../../constants';
import {gameAudio} from '../../utils/helper';
import type {UpdateView} from './view';

type UpdatePodiumView = Pick<
  UpdateView,
  | 'unlockedTierIndex'
  | 'podiumTimerRef'
  | 'podiumHasIgnitedRef'
  | 'podiumFlashTimerRef'
  | 'particlesRef'
>;

export function updatePodium(view: UpdatePodiumView, dt: number) {
  const {
    unlockedTierIndex,
    podiumTimerRef,
    podiumHasIgnitedRef,
    podiumFlashTimerRef,
    particlesRef,
  } = view;

  // PODIUM PHASE: Ceremonial fire ignition on newly won tier, crowd whoop, and drifting flame embers
  podiumTimerRef.current += dt;
  if (podiumFlashTimerRef.current > 0) {
    podiumFlashTimerRef.current -= dt;
  }

  const newlyWonTier = Math.max(0, unlockedTierIndex - 1);
  const stages = [
    { idx: 0, y: 154, h: 16, w: 260, x: 42 },
    { idx: 1, y: 132, h: 16, w: 210, x: 67 },
    { idx: 2, y: 110, h: 16, w: 160, x: 92 },
    { idx: 3, y: 88,  h: 16, w: 110, x: 117 },
    { idx: 4, y: 62,  h: 18, w: 70,  x: 137 },
  ];

  if (!podiumHasIgnitedRef.current && podiumTimerRef.current >= 0.25) {
    podiumHasIgnitedRef.current = true;
    podiumFlashTimerRef.current = 0.45;
    gameAudio.playCrowdWhoop();
    gameAudio.playPowerupChime();

    const targetStage = stages[newlyWonTier] || stages[0];
    const pts = [
      { x: targetStage.x - 3, y: targetStage.y - 6 },
      { x: targetStage.x + targetStage.w + 1, y: targetStage.y - 6 },
      { x: targetStage.x + targetStage.w / 2, y: targetStage.y + 4 },
    ];

    pts.forEach((pt) => {
      for (let i = 0; i < 18; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        const speed = 25 + Math.random() * 50;
        particlesRef.current.push({
          x: pt.x,
          y: pt.y,
          color:
            Math.random() < 0.35
              ? PALETTE[0]
              : Math.random() < 0.65
                ? PALETTE[15]
                : PALETTE[3],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.7 + Math.random() * 0.8,
          maxLife: 1.5,
          size: 1 + (Math.random() > 0.5 ? 1 : 0),
        });
      }
    });
  }

  // Lit braziers continuously emit gentle embers
  if (Math.random() < 0.4) {
    const litStages = stages.filter((s) => s.idx < unlockedTierIndex);
    if (litStages.length > 0) {
      const st = litStages[Math.floor(Math.random() * litStages.length)];
      const isLeft = Math.random() < 0.5;
      const ex = isLeft ? st.x - 3 : st.x + st.w + 1;
      const ey = st.y - 6;
      particlesRef.current.push({
        x: ex + (Math.random() - 0.5) * 4,
        y: ey,
        color: Math.random() < 0.5 ? PALETTE[0] : PALETTE[15],
        vx: (Math.random() - 0.5) * 10,
        vy: -16 - Math.random() * 22,
        life: 0.7 + Math.random() * 0.5,
        maxLife: 1.2,
        size: 1,
      });
    }
  }
}
