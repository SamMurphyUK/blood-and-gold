// Stage 3A: tutorial, onboarding, expeditions and story events, extracted verbatim from the old update(dt) closure in App.tsx.
// Reads and writes App()'s refs, state values and setters through the per-render `UpdateView`; the code
// inside each function is the original code, unchanged.

import {gameAudio} from '../../utils/helper';
import {KEEPER_POST_FIFTH_PANELS} from '../data/keeper';
import type {ActiveQuestExpedition} from '../data/quests';
import {
  DUMMY_TEXT_1,
  DUMMY_TEXT_2,
  POST_BATTLE_TENT_TEXT,
  POST_BATTLE_TEXT_1,
  POST_BATTLE_TEXT_2,
  TUTORIAL_TEXT_ARMORY,
  TUTORIAL_TEXT_TENT,
  TUTORIAL_TEXT_WARNING,
} from '../data/tutorial';
import type {UpdateView} from './view';

type UpdateFirstVictoryOnboardingView = Pick<
  UpdateView,
  | 'firstBattleDoneRef'
  | 'setPostBattleStage'
  | 'postBattleStageRef'
  | 'postBattleTimerRef'
  | 'pendingPostBattleTutorialRef'
  | 'sparkleTimerRef'
  | 'postTutCharCountRef'
  | 'postTutCharTimerRef'
  | 'postTutIsLineDoneRef'
>;

export function updateFirstVictoryOnboarding(view: UpdateFirstVictoryOnboardingView) {
  const {
    firstBattleDoneRef,
    setPostBattleStage,
    postBattleStageRef,
    postBattleTimerRef,
    pendingPostBattleTutorialRef,
    sparkleTimerRef,
    postTutCharCountRef,
    postTutCharTimerRef,
    postTutIsLineDoneRef,
  } = view;

  // Check if returning from first victory to initiate post-battle onboarding
  if (
    firstBattleDoneRef.current &&
    (postBattleStageRef.current === 'none' || pendingPostBattleTutorialRef.current)
  ) {
    pendingPostBattleTutorialRef.current = false;
    setPostBattleStage('recruits_dialogue_1');
    postBattleStageRef.current = 'recruits_dialogue_1';
    postTutCharCountRef.current = 0;
    postTutCharTimerRef.current = 0;
    postTutIsLineDoneRef.current = false;
    postBattleTimerRef.current = 0;
    sparkleTimerRef.current = 5.0;
    gameAudio.playPowerupChime();
  }
}

type UpdateTutorialIntroView = Pick<
  UpdateView,
  | 'setTutorialStage'
  | 'tutorialStageRef'
  | 'tutorialIdleTimerRef'
  | 'tutorialWineTimerRef'
  | 'campSpeechBubblesRef'
  | 'gladiatorsRef'
  | 'advanceTutorial'
>;

export function updateTutorialIntro(view: UpdateTutorialIntroView, dt: number, curTutStage: string) {
  const {
    setTutorialStage,
    tutorialStageRef,
    tutorialIdleTimerRef,
    tutorialWineTimerRef,
    campSpeechBubblesRef,
    gladiatorsRef,
    advanceTutorial,
  } = view;

  if (curTutStage === 'idle') {
    tutorialIdleTimerRef.current += dt;
    if (tutorialIdleTimerRef.current >= 1.0) {
      // Wait 1.0 second, then first gladiator displays ambient speech bubble:
      // "Master... I've been on the wine."
      setTutorialStage('wine_speech');
      tutorialStageRef.current = 'wine_speech';
      tutorialWineTimerRef.current = 0;
      const firstGlad = gladiatorsRef.current[0];
      if (firstGlad) {
        campSpeechBubblesRef.current = [
          {
            id: 'tut_wine_bubble',
            gladiatorId: firstGlad.id,
            speakerName: firstGlad.name.split(' ')[0],
            text: "Master... I've been on the wine.",
            timer: 3.0,
            maxDuration: 3.0,
          },
        ];
      }
    }
  } else if (curTutStage === 'wine_speech') {
    tutorialWineTimerRef.current += dt;
    if (tutorialWineTimerRef.current >= 2.5) {
      advanceTutorial();
    }
  }
}

type UpdatePostBattleHoldView = Pick<
  UpdateView,
  | 'setPostBattleStage'
  | 'postBattleStageRef'
  | 'postBattleTimerRef'
  | 'postTutCharCountRef'
  | 'postTutCharTimerRef'
  | 'postTutIsLineDoneRef'
>;

export function updatePostBattleHold(view: UpdatePostBattleHoldView, dt: number, curPostStage: string, isAnyCampModalOpen: boolean) {
  const {
    setPostBattleStage,
    postBattleStageRef,
    postBattleTimerRef,
    postTutCharCountRef,
    postTutCharTimerRef,
    postTutIsLineDoneRef,
  } = view;

  // Post-battle active camp time: ticks 5 seconds only when no modal/menu is open
  if (curPostStage === 'courtyard_zoom' && !isAnyCampModalOpen) {
    postBattleTimerRef.current += dt;
    if (postBattleTimerRef.current >= 5.0) {
      setPostBattleStage('dummy_spotlight_1');
      postBattleStageRef.current = 'dummy_spotlight_1';
      postTutCharCountRef.current = 0;
      postTutCharTimerRef.current = 0;
      postTutIsLineDoneRef.current = false;
      gameAudio.playPowerupChime();
    }
  }
}

type UpdateDialogueTypewritersView = Pick<
  UpdateView,
  | 'isFeastOfferPendingRef'
  | 'setHeroArrivalModal'
  | 'heroArrivalModalRef'
  | 'setKeeperSequence'
  | 'keeperSequenceRef'
  | 'postBattleStageRef'
  | 'tutCharCountRef'
  | 'tutCharTimerRef'
  | 'tutIsLineDoneRef'
  | 'postTutCharCountRef'
  | 'postTutCharTimerRef'
  | 'postTutIsLineDoneRef'
>;

export function updateDialogueTypewriters(view: UpdateDialogueTypewritersView, dt: number, curTutStage: string) {
  const {
    isFeastOfferPendingRef,
    setHeroArrivalModal,
    heroArrivalModalRef,
    setKeeperSequence,
    keeperSequenceRef,
    postBattleStageRef,
    tutCharCountRef,
    tutCharTimerRef,
    tutIsLineDoneRef,
    postTutCharCountRef,
    postTutCharTimerRef,
    postTutIsLineDoneRef,
  } = view;

  // 3. Typewriter Text Step for Tutorial Dialogues
  if (
    curTutStage === 'spotlight_tent' ||
    curTutStage === 'spotlight_armory' ||
    curTutStage === 'call_warning'
  ) {
    const textTarget =
      curTutStage === 'spotlight_tent'
        ? TUTORIAL_TEXT_TENT
        : curTutStage === 'spotlight_armory'
          ? TUTORIAL_TEXT_ARMORY
          : TUTORIAL_TEXT_WARNING;

    if (!tutIsLineDoneRef.current) {
      tutCharTimerRef.current += dt;
      const charInterval = 0.032;
      while (
        tutCharTimerRef.current >= charInterval &&
        tutCharCountRef.current < textTarget.length
      ) {
        tutCharTimerRef.current -= charInterval;
        tutCharCountRef.current += 1;
        const ch = textTarget[tutCharCountRef.current - 1];
        if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
          const pitch = (ch.charCodeAt(0) % 5) - 2;
          gameAudio.playTypewriterBeep(pitch);
        }
      }
      if (tutCharCountRef.current >= textTarget.length) {
        tutIsLineDoneRef.current = true;
      }
    }
  }

  // 4. Typewriter Text Step for Post-Battle Dialogue
  const curPost = postBattleStageRef.current;
  if (
    curPost === 'recruits_dialogue_1' ||
    curPost === 'recruits_dialogue_2' ||
    curPost === 'dummy_spotlight_1' ||
    curPost === 'dummy_spotlight_2' ||
    curPost === 'tent_spotlight'
  ) {
    const postTextTarget =
      curPost === 'recruits_dialogue_1'
        ? POST_BATTLE_TEXT_1
        : curPost === 'recruits_dialogue_2'
          ? POST_BATTLE_TEXT_2
          : curPost === 'dummy_spotlight_1'
            ? DUMMY_TEXT_1
            : curPost === 'dummy_spotlight_2'
              ? DUMMY_TEXT_2
              : POST_BATTLE_TENT_TEXT;

    if (!postTutIsLineDoneRef.current) {
      postTutCharTimerRef.current += dt;
      const charInterval = 0.032;
      while (
        postTutCharTimerRef.current >= charInterval &&
        postTutCharCountRef.current < postTextTarget.length
      ) {
        postTutCharTimerRef.current -= charInterval;
        postTutCharCountRef.current += 1;
        const ch = postTextTarget[postTutCharCountRef.current - 1];
        if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
          const pitch = (ch.charCodeAt(0) % 5) - 2;
          gameAudio.playTypewriterBeep(pitch);
        }
      }
      if (postTutCharCountRef.current >= postTextTarget.length) {
        postTutIsLineDoneRef.current = true;
      }
    }
  }

  // 5. Typewriter Text Step for Keeper Post-Fifth Sequence
  if (keeperSequenceRef.current && keeperSequenceRef.current.active) {
    const ks = keeperSequenceRef.current;
    const curText = KEEPER_POST_FIFTH_PANELS[ks.panelIndex];
    if (!ks.isDone) {
      ks.charTimer = (ks.charTimer || 0) + dt;
      const charInterval = 0.032;
      while (ks.charTimer >= charInterval && ks.charCount < curText.length) {
        ks.charTimer -= charInterval;
        ks.charCount += 1;
        const ch = curText[ks.charCount - 1];
        if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
          gameAudio.playTypewriterBeep((ch.charCodeAt(0) % 5) - 2);
        }
      }
      if (ks.charCount >= curText.length) {
        ks.isDone = true;
      }
      setKeeperSequence({ ...ks });
    }
  }

  // 5.5 Typewriter Text Step for Feast Offer Dialogue Box
  if (isFeastOfferPendingRef.current) {
    const feastText = "These men should eat like kings.";
    if (!tutIsLineDoneRef.current) {
      tutCharTimerRef.current += dt;
      const charInterval = 0.035;
      while (tutCharTimerRef.current >= charInterval && tutCharCountRef.current < feastText.length) {
        tutCharTimerRef.current -= charInterval;
        tutCharCountRef.current += 1;
        const ch = feastText[tutCharCountRef.current - 1];
        if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
          gameAudio.playTypewriterBeep((ch.charCodeAt(0) % 5) - 2);
        }
      }
      if (tutCharCountRef.current >= feastText.length) {
        tutIsLineDoneRef.current = true;
      }
    }
  }

  // 6. Typewriter Text Step for Hero Arrival Tale Modal
  if (heroArrivalModalRef.current && !heroArrivalModalRef.current.isDone) {
    const ham = heroArrivalModalRef.current;
    ham.charTimer = (ham.charTimer || 0) + dt;
    const charInterval = 0.028;
    while (ham.charTimer >= charInterval && ham.charCount < ham.tale.length) {
      ham.charTimer -= charInterval;
      ham.charCount += 1;
      const ch = ham.tale[ham.charCount - 1];
      if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
        gameAudio.playTypewriterBeep((ch.charCodeAt(0) % 5) - 2);
      }
    }
    if (ham.charCount >= ham.tale.length) {
      ham.isDone = true;
    }
    setHeroArrivalModal({ ...ham });
  }
}

type UpdateExpeditionsView = Pick<
  UpdateView,
  | 'setActiveExpeditions'
  | 'activeExpeditionsRef'
  | 'resolveExpedition'
>;

export function updateExpeditions(view: UpdateExpeditionsView, dt: number, isAnyCampModalOpen: boolean, isAnyModalOrNoticeActive: boolean) {
  const {setActiveExpeditions, activeExpeditionsRef, resolveExpedition} = view;

  // Update Active Quest Expeditions countdown (STRICTLY PAUSED when ANY modal or menu is open in camp)
  if (activeExpeditionsRef.current.length > 0 && !isAnyCampModalOpen && !isAnyModalOrNoticeActive) {
    const remainingExpeditions: ActiveQuestExpedition[] = [];
    const toResolve: ActiveQuestExpedition[] = [];

    for (const exp of activeExpeditionsRef.current) {
      const rem = exp.remainingTime - dt;
      if (rem <= 0) {
        toResolve.push({ ...exp, remainingTime: 0 });
      } else {
        remainingExpeditions.push({ ...exp, remainingTime: rem });
      }
    }

    activeExpeditionsRef.current = remainingExpeditions;
    setActiveExpeditions(remainingExpeditions);

    for (const exp of toResolve) {
      resolveExpedition(exp);
    }
  }
}

type UpdateStoryEventsView = Pick<
  UpdateView,
  | 'setStoryState'
  | 'storyStateRef'
  | 'storyCooldownRef'
  | 'campSpeechBubblesRef'
  | 'triggerStoryEvent'
>;

export function updateStoryEvents(view: UpdateStoryEventsView, dt: number, isAnyModalOrNoticeActive: boolean) {
  const {
    setStoryState,
    storyStateRef,
    storyCooldownRef,
    campSpeechBubblesRef,
    triggerStoryEvent,
  } = view;

  // 0. CINEMATIC STORY DIALOGUE EVENT SYSTEM
  if (storyStateRef.current.phase !== 'inactive') {
    // Pause/silence ambient camp speech bubbles
    campSpeechBubblesRef.current = [];

    const st = {...storyStateRef.current};
    st.phaseTimer += dt;

    if (st.phase === 'bar_rising') {
      // 1) Speech bar rises up from bottom, stopping just above bottom margin
      // Duration: 0.45s for bar rise
      st.barRiseProgress = Math.min(1, st.phaseTimer / 0.45);

      // 3) After a 0.2 second pause while the bar is hovering up, rest of background dims noticeably
      if (st.phaseTimer >= 0.2) {
        const dimElapsed = st.phaseTimer - 0.2;
        st.bgDimmerAlpha = Math.min(1, dimElapsed / 0.3);
      }

      if (st.phaseTimer >= 0.55) {
        st.barRiseProgress = 1;
        st.bgDimmerAlpha = 1;
        st.phase = 'portrait_fading_in';
        st.phaseTimer = 0;
        st.portraitColorAlpha = 0;
      }
    } else if (st.phase === 'portrait_fading_in') {
      // 4) Full-color 32x32 portrait fades in smoothly in the exact spot of the black silhouette
      st.portraitColorAlpha = Math.min(1, st.phaseTimer / 0.35);

      if (st.phaseTimer >= 0.38) {
        st.portraitColorAlpha = 1;
        st.phase = 'typing';
        st.phaseTimer = 0;
        st.typedCharCount = 0;
        st.charTimer = 0;
      }
    } else if (st.phase === 'typing') {
      // 6) Story text types out letter-by-letter with subtle synth beep
      const currentLine = st.event?.lines[st.currentLineIndex] || '';
      const charInterval = st.isSpeedingUp ? 0.008 : 0.034;
      st.charTimer += dt;

      while (st.charTimer >= charInterval && st.typedCharCount < currentLine.length) {
        st.charTimer -= charInterval;
        st.typedCharCount += 1;
        const ch = currentLine[st.typedCharCount - 1];
        if (ch && ch !== ' ' && ch !== '.' && ch !== ',') {
          const pitchOffset = (ch.charCodeAt(0) % 5) - 2;
          gameAudio.playTypewriterBeep(pitchOffset);
        }
      }

      if (st.typedCharCount >= currentLine.length) {
        st.phase = 'line_ready';
        st.phaseTimer = 0;
      }
    } else if (st.phase === 'line_ready') {
      // Awaiting Space key, tap, or click on speech bar
    } else if (st.phase === 'closing_fade') {
      // Closing animation in reverse order: text and lit portrait fade out -> black silhouette briefly
      st.portraitColorAlpha = Math.max(0, 1 - st.phaseTimer / 0.22);
      if (st.phaseTimer >= 0.24) {
        st.portraitColorAlpha = 0;
        st.phase = 'closing_bar_lowering';
        st.phaseTimer = 0;
      }
    } else if (st.phase === 'closing_bar_lowering') {
      // Background returns to normal brightness -> speech bar lowers back down off bottom edge
      st.bgDimmerAlpha = Math.max(0, 1 - st.phaseTimer / 0.26);
      st.barRiseProgress = Math.max(0, 1 - st.phaseTimer / 0.26);

      if (st.phaseTimer >= 0.28) {
        // Clean complete reset of all story state variables
        st.phase = 'inactive';
        st.barRiseProgress = 0;
        st.bgDimmerAlpha = 0;
        st.portraitColorAlpha = 0;
        st.event = null;
        st.currentLineIndex = 0;
        st.typedCharCount = 0;
        st.charTimer = 0;
        st.phaseTimer = 0;
        st.isSpeedingUp = false;
        // Cooldown reset: Every 40 - 60 seconds
        storyCooldownRef.current = 40 + Math.random() * 20;
      }
    }

    storyStateRef.current = st;
    setStoryState(st);
  } else {
    // Decrement story event timer (Every 40 - 60 seconds in camp view)
    // Strictly PAUSED whenever Coliseum Summons notice or ANY modal is open!
    if (!isAnyModalOrNoticeActive) {
      storyCooldownRef.current -= dt;
      if (storyCooldownRef.current <= 0) {
        triggerStoryEvent();
      }
    }
  }
}
