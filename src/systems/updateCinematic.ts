// Stage 3A: intro cinematic and Emperor's Judgment timeline, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {cinematicIntroMusic} from '../../cinematicIntroAudio';
import {PALETTE} from '../../constants';
import {gameAudio} from '../../utils/helper';
import {playJudgmentAudio} from '../logic/judgmentAudio';
import {INTRO_MONOLOGUE_TEXT} from '../rendering/cinematicIntro';
import {getSafeNow} from '../rendering/frameTime';
import {LOGIC_WIDTH} from '../rendering/primitives';
import type {UpdateView} from './view';

type UpdateIntroCinematicView = Pick<
  UpdateView,
  | 'setCinematicState'
  | 'cinematicStateRef'
  | 'cinematicPhaseStartTimeRef'
  | 'typewriterCharCountRef'
  | 'typewriterCharTimerRef'
  | 'isTypewriterDoneRef'
  | 'emperorStabFiredRef'
>;

export function updateIntroCinematic(view: UpdateIntroCinematicView, dt: number): boolean {
  const {
    setCinematicState,
    cinematicStateRef,
    cinematicPhaseStartTimeRef,
    typewriterCharCountRef,
    typewriterCharTimerRef,
    isTypewriterDoneRef,
    emperorStabFiredRef,
  } = view;

  // 0. CINEMATIC INTRO STATE MACHINE (PHASES 0 TO 3)
  if (cinematicStateRef.current < 4) {
    const now = getSafeNow();
    if (isNaN(cinematicPhaseStartTimeRef.current) || !cinematicPhaseStartTimeRef.current) {
      cinematicPhaseStartTimeRef.current = now;
    }
    let elapsed = Math.max(0, (now - cinematicPhaseStartTimeRef.current) / 1000);
    if (isNaN(elapsed)) {
      elapsed = 0;
      cinematicPhaseStartTimeRef.current = now;
    }
    const cState = Math.max(0, Math.min(3, cinematicStateRef.current || 0));

    if (cState === 0) {
      // Phase 1: The Manager (Hold ~3.0 seconds, then fade out)
      if (elapsed >= 3.2) {
        cinematicStateRef.current = 1;
        setCinematicState(1);
        cinematicPhaseStartTimeRef.current = getSafeNow();
        try {
          cinematicIntroMusic.setPhase(1);
        } catch (_) {}
      }
    } else if (cState === 1) {
      // Phase 2 & 3: The Approach & The Pan-Up (Hold, slide, pan up to deep darkness)
      if (elapsed >= 2.2 && !emperorStabFiredRef.current) {
        emperorStabFiredRef.current = true;
        try {
          cinematicIntroMusic.triggerEmperorPanStab();
        } catch (_) {}
      }
      if (elapsed >= 7.0) {
        cinematicStateRef.current = 2;
        setCinematicState(2);
        cinematicPhaseStartTimeRef.current = getSafeNow();
        try {
          cinematicIntroMusic.setPhase(2);
        } catch (_) {}
      }
    } else if (cState === 2) {
      // Phase 4: The Title (Fade in flanked by Roman columns, hold ~2.8s, fade out)
      if (elapsed >= 4.0) {
        cinematicStateRef.current = 3;
        setCinematicState(3);
        cinematicPhaseStartTimeRef.current = getSafeNow();
        typewriterCharCountRef.current = 0;
        typewriterCharTimerRef.current = 0;
        isTypewriterDoneRef.current = false;
        try {
          cinematicIntroMusic.setPhase(3);
        } catch (_) {}
      }
    } else if (cState === 3) {
      // Phase 5: The Monologue (Typewriter text effect in VN dialogue box)
      if (!isTypewriterDoneRef.current) {
        typewriterCharTimerRef.current += dt;
        const charInterval = 0.034;
        while (
          typewriterCharTimerRef.current >= charInterval &&
          typewriterCharCountRef.current < INTRO_MONOLOGUE_TEXT.length
        ) {
          typewriterCharTimerRef.current -= charInterval;
          typewriterCharCountRef.current += 1;
          const ch = INTRO_MONOLOGUE_TEXT[typewriterCharCountRef.current - 1];
          if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
            const pitch = (ch.charCodeAt(0) % 5) - 2;
            try {
              gameAudio.playTypewriterBeep(pitch);
            } catch (_) {}
          }
        }
        if (typewriterCharCountRef.current >= INTRO_MONOLOGUE_TEXT.length) {
          isTypewriterDoneRef.current = true;
        }
      }
    }
    return true;
  }

  return false;
}

type UpdateJudgmentCinematicView = Pick<
  UpdateView,
  | 'setJudgmentState'
  | 'judgmentStateRef'
  | 'arenaFightersRef'
  | 'particlesRef'
  | 'modeRef'
  | 'spawnCrispPopup'
  | 'spawnBloodSpray'
  | 'finishDuelInternal'
>;

export function updateJudgmentCinematic(view: UpdateJudgmentCinematicView, dt: number): boolean {
  const {
    setJudgmentState,
    judgmentStateRef,
    arenaFightersRef,
    particlesRef,
    modeRef,
    spawnCrispPopup,
    spawnBloodSpray,
    finishDuelInternal,
  } = view;

  // 0. EMPEROR'S JUDGMENT CINEMATIC TIMELINE (Post-Battle Cinematic)
  if (modeRef.current === 'arena' && judgmentStateRef.current.active) {
    const j = judgmentStateRef.current;
    const now = getSafeNow();
    const elapsed = Math.max(0, (now - j.startTime) / 1000);

    // Advance animation timer so living fighters pace in place and death states settle
    arenaFightersRef.current.forEach((f) => {
      f.animTimer += dt;
      if (f.hp <= 0 && f.deathTimer > 0) {
        f.deathTimer = Math.max(0, f.deathTimer - dt);
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vx *= 0.88;
        f.vy *= 0.88;
      } else if (f.hp > 0) {
        // Living fighters walk in place with fixed world coordinates while emperor decides (Phases 1-4)
        f.vx = 0;
        f.vy = 0;
        if (j.phase !== 'post_pan_hold') {
          f.state = 'walking';
        } else {
          f.state = 'idle';
        }
      }
    });
    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.isBlood) {
        p.vy += 45 * dt;
      }
      p.life -= dt;
      return p.life > 0;
    });

    // Phase 1: The Hold & Pan (4.0s total: 2.0s hold on floor, 2.0s slow pan up to balcony, 2.0s hold on balcony)
    if (elapsed < 2.0) {
      j.phase = 'hold';
      j.cameraPanY = 0;
      if (!j.audioTriggered.build) {
        j.audioTriggered.build = true;
        playJudgmentAudio('build');
      }
    } else if (elapsed < 4.0) {
      j.phase = 'pan_up';
      const panProgress = Math.max(0, Math.min(1, (elapsed - 2.0) / 2.0));
      // Smooth ease-in-out curve
      const ease =
        panProgress < 0.5
          ? 2 * panProgress * panProgress
          : -1 + (4 - 2 * panProgress) * panProgress;
      j.cameraPanY = ease * 65;
    } else if (elapsed < 6.0) {
      j.phase = 'hold_balcony';
      j.cameraPanY = 65;
    }
    // Phase 2: The Eye Cut-In (Anime-style dramatic box with speed lines & pupil shifting)
    else if (elapsed < 8.2) {
      j.phase = 'eye_cut_in';
      j.cameraPanY = 65;
    }
    // Phase 3: The Flash & The Verdict
    else if (elapsed < 8.4) {
      j.phase = 'flash';
      j.cameraPanY = 65;
    } else if (elapsed < 10.7) {
      j.phase = 'verdict';
      j.cameraPanY = 65;
      if (j.verdict === 'thumbs_up' && !j.audioTriggered.cheer) {
        j.audioTriggered.cheer = true;
        playJudgmentAudio('cheer');
      } else if (j.verdict === 'thumbs_down' && !j.audioTriggered.slash) {
        j.audioTriggered.slash = true;
        playJudgmentAudio('slash');
      }
    }
    // Phase 4: The Return (Quickly pan camera back down to arena floor over ~0.8s)
    else if (elapsed < 11.5) {
      j.phase = 'pan_down';
      const returnProgress = Math.max(0, Math.min(1, (elapsed - 10.7) / 0.8));
      const ease = returnProgress * returnProgress; // Accelerate back down
      j.cameraPanY = 65 * (1 - ease);
    }
    // Phase 4 Part B / Execution Sequence:
    // If verdict is thumbs_up (mercy): 2.0s hold on arena floor with panting gladiators, dust settling, ambient murmur
    else if (j.verdict === 'thumbs_up') {
      if (elapsed < 13.5) {
        j.phase = 'post_pan_hold';
        j.cameraPanY = 0;
        if (!j.audioTriggered.murmur) {
          j.audioTriggered.murmur = true;
          playJudgmentAudio('build');
        }
        if (Math.random() < 0.25) {
          particlesRef.current.push({
            x: 50 + Math.random() * (LOGIC_WIDTH - 100),
            y: 90 + Math.random() * 65,
            color: Math.random() < 0.6 ? PALETTE[1] : PALETTE[0],
            vx: (Math.random() - 0.5) * 6,
            vy: 2 + Math.random() * 4,
            life: 0.85,
            maxLife: 0.85,
            size: 1,
          });
        }
      } else {
        j.active = false;
        j.phase = 'done';
        j.cameraPanY = 0;
        setJudgmentState({ ...j });
        finishDuelInternal(j.isPlayerVictorious, j.verdict, j.isTrial);
        return true;
      }
    }
    // If verdict is thumbs_down: Coup de Grâce Execution Cinematic Sequence
    else {
      j.cameraPanY = 0;

      // Step 1: Hold the arena camera shot for an extended dramatic moment (from 11.5s to 13.2s)
      if (elapsed < 13.2 && j.phase !== 'execution_walk' && j.phase !== 'execution_strike' && j.phase !== 'execution_settle') {
        j.phase = 'post_pan_hold';
        if (!j.audioTriggered.murmur) {
          j.audioTriggered.murmur = true;
          playJudgmentAudio('build');
        }
        if (Math.random() < 0.3) {
          particlesRef.current.push({
            x: 50 + Math.random() * (LOGIC_WIDTH - 100),
            y: 90 + Math.random() * 65,
            color: Math.random() < 0.6 ? PALETTE[1] : PALETTE[0],
            vx: (Math.random() - 0.5) * 6,
            vy: 2 + Math.random() * 4,
            life: 0.85,
            maxLife: 0.85,
            size: 1,
          });
        }
      }
      // Initialize execution pathing at end of extended hold
      else if (j.phase === 'post_pan_hold' || j.phase === 'pan_down') {
        const livingCombatants = arenaFightersRef.current.filter((f) => f.hp > 0);
        const downedCombatants = arenaFightersRef.current.filter((f) => f.hp <= 0);

        if (downedCombatants.length > 0 && livingCombatants.length > 0) {
          // Priority: target nearest downed player gladiator if one exists
          const victim =
            downedCombatants.find((f) => f.isPlayerTeam) ||
            downedCombatants[0];

          // Executioner: surviving enemy if player lost, or surviving gladiator if player won, or nearest living
          let executioner = livingCombatants.find((f) => f.isPlayerTeam !== victim.isPlayerTeam);
          if (!executioner) {
            executioner = livingCombatants[0];
          }

          const standOffsetX = executioner.x < victim.x ? -13 : 13;
          j.executionerId = executioner.id;
          j.victimId = victim.id;
          j.execStartX = executioner.x;
          j.execStartY = executioner.y;
          j.execTargetX = victim.x + standOffsetX;
          j.execTargetY = victim.y - 1;
          j.execTimer = 0;
          j.phase = 'execution_walk';
        } else {
          // No combatants to execute; transition to results
          j.active = false;
          j.phase = 'done';
          setJudgmentState({ ...j });
          finishDuelInternal(j.isPlayerVictorious, j.verdict, j.isTrial);
          return true;
        }
      }
      // Step 2: One of the living combatants actively paths and walks up to the nearest downed gladiator
      else if (j.phase === 'execution_walk') {
        j.execTimer = (j.execTimer || 0) + dt;
        const execFighter = arenaFightersRef.current.find((f) => f.id === j.executionerId);
        const victimFighter = arenaFightersRef.current.find((f) => f.id === j.victimId);

        if (execFighter && victimFighter) {
          execFighter.state = 'walking';
          execFighter.flipX = victimFighter.x < execFighter.x;

          const targetX = j.execTargetX ?? (victimFighter.x + 12);
          const targetY = j.execTargetY ?? victimFighter.y;
          const edx = targetX - execFighter.x;
          const edy = targetY - execFighter.y;
          const edist = Math.hypot(edx, edy);

          if (edist > 3 && (j.execTimer || 0) < 3.0) {
            const walkSpeed = 44;
            execFighter.x += (edx / edist) * walkSpeed * dt;
            execFighter.y += (edy / edist) * walkSpeed * dt;
          } else {
            // Arrived at downed fighter!
            execFighter.x = targetX;
            execFighter.y = targetY;
            execFighter.state = 'idle';
            execFighter.flipX = victimFighter.x < execFighter.x;
            j.phase = 'execution_strike';
            j.execTimer = 0;
            j.execStrikeProgress = 0;
          }
        } else {
          // Fallback if fighter missing
          j.phase = 'execution_settle';
          j.execTimer = 0;
        }
      }
      // Step 3: Execution stance & downward sword thrust
      else if (j.phase === 'execution_strike') {
        j.execTimer = (j.execTimer || 0) + dt;
        const timer = j.execTimer || 0;
        const execFighter = arenaFightersRef.current.find((f) => f.id === j.executionerId);
        const victimFighter = arenaFightersRef.current.find((f) => f.id === j.victimId);

        if (execFighter && victimFighter) {
          execFighter.state = 'idle';
          execFighter.flipX = victimFighter.x < execFighter.x;

          if (timer < 0.55) {
            // * The standing executioner raises their sword/weapon upward by a few pixels into an execution stance.
            j.execStrikeProgress = Math.min(0.49, timer / 1.1);
          } else {
            // * Thrusts the blade straight down into the sand behind the fallen body!
            j.execStrikeProgress = 0.5 + Math.min(0.5, (timer - 0.55) / 0.16);

            // Impact moment at ~0.65s
            if (timer >= 0.65 && !j.audioTriggered.executionRoar) {
              j.audioTriggered.executionRoar = true;

              // * Trigger a sharp blood/sand spray pixel particle burst upon impact.
              spawnBloodSpray(victimFighter.x, victimFighter.y, 28, -Math.PI / 2);
              for (let i = 0; i < 22; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
                const speed = 35 + Math.random() * 55;
                particlesRef.current.push({
                  x: victimFighter.x + (Math.random() - 0.5) * 8,
                  y: victimFighter.y + 1,
                  color: Math.random() < 0.6 ? PALETTE[1] : PALETTE[0],
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 0.85 + Math.random() * 0.45,
                  maxLife: 1.3,
                  size: 1 + (Math.random() > 0.5 ? 1 : 0),
                });
              }

              // * The arena crowd erupts into a thunderous bloodthirsty cheer (crowd_cheer.mp3 / amplified crowd roar SFX).
              playJudgmentAudio('slash');
              playJudgmentAudio('cheer');
              gameAudio.playCrowdFatalBlow(5);
              gameAudio.playMeleePunch();
              gameAudio.playChiptuneExplosion();

              spawnCrispPopup(victimFighter.x, victimFighter.y - 18, 'COUP DE GRÂCE!', '#9e4a42', true, true);
              victimFighter.flashWhiteTimer = 0.45;
            }
          }
        }

        if (timer >= 1.05) {
          j.phase = 'execution_settle';
          j.execTimer = 0;
        }
      }
      // Step 4: Pause for 1.5 seconds as the dust settles, before transitioning to the post-battle summary.
      else if (j.phase === 'execution_settle') {
        j.execTimer = (j.execTimer || 0) + dt;
        const timer = j.execTimer || 0;

        // Gently floating dust as it settles
        if (Math.random() < 0.35) {
          particlesRef.current.push({
            x: 50 + Math.random() * (LOGIC_WIDTH - 100),
            y: 90 + Math.random() * 65,
            color: Math.random() < 0.6 ? PALETTE[1] : PALETTE[0],
            vx: (Math.random() - 0.5) * 5,
            vy: 2 + Math.random() * 3,
            life: 0.9,
            maxLife: 0.9,
            size: 1,
          });
        }

        if (timer >= 1.5) {
          j.active = false;
          j.phase = 'done';
          j.cameraPanY = 0;
          setJudgmentState({ ...j });
          finishDuelInternal(j.isPlayerVictorious, j.verdict, j.isTrial);
          return true;
        }
      }
    }

    setJudgmentState({ ...j });
    return true; // Suspend combat logic during active Emperor's Judgment cinematic
  }

  return false;
}
