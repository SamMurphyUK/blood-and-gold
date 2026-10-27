// Stage 3A: the per-render view of App() that the update systems read and write.
// App.tsx builds one object of this shape each render (same lifetime as the old update(dt) closure), so state
// values are that render's snapshot and refs/setters are the live objects. Each system function only
// destructures the names it uses (see the Pick<UpdateView, ...> types beside each function).

import type {Dispatch, MutableRefObject, SetStateAction} from 'react';
import type {GameState} from '../../utils/helper';
import type {Economy} from './economy';
import type {Roster} from './roster';
import type {ActiveQuestExpedition, QuestNode} from '../data/quests';
import type {ActiveStoryState} from '../data/storyEvents';
import type {
  ArenaFighter,
  ArenaSpeechBubble,
  BattleTier,
  CampFeastState,
  CampSpeechBubble,
  CourierNoticeState,
  CourierNpcState,
  CrispPopup,
  DevoteeState,
  DynamicVisitor,
  EtherealSpark,
  FeastSlaveNpc,
  FloatingParticle,
  Gladiator,
  HeroArrivalModalState,
  JudgmentState,
  LudusUpgrades,
  PepTalkEvaluation,
  PepTalkTone,
  PhysicianNpcState,
  PostBattleTutorialStage,
  QuestResolutionModalState,
  TravelingMerchantState,
  TutorialStage,
  VisitorWalkingNpcState,
} from '../types';

/** What ended the battle; resolveBattle (src/systems/resolveBattle.ts) turns this into rewards, bonds and the aftermath. */
export type BattleOutcome =
  | {readonly kind: 'sandbox'; readonly isVictory: boolean}
  | {
      readonly kind: 'duel';
      readonly isVictory: boolean;
      readonly verdict: 'thumbs_up' | 'thumbs_down';
      readonly isTrial: boolean;
    };

export interface UpdateView {
  readonly screenShakeTimerRef: MutableRefObject<number>;
  readonly setCinematicState: Dispatch<SetStateAction<number>>;
  readonly cinematicStateRef: MutableRefObject<number>;
  readonly cinematicPhaseStartTimeRef: MutableRefObject<number>;
  readonly typewriterCharCountRef: MutableRefObject<number>;
  readonly typewriterCharTimerRef: MutableRefObject<number>;
  readonly isTypewriterDoneRef: MutableRefObject<boolean>;
  readonly emperorStabFiredRef: MutableRefObject<boolean>;
  readonly economy: Economy;
  readonly campShootingStarTimerRef: MutableRefObject<number>;
  readonly campShootingStarActiveDurationRef: MutableRefObject<number>;
  readonly isManagerMenuOpen: boolean;
  readonly etherealSparksRef: MutableRefObject<EtherealSpark[]>;
  readonly crowdAudioTimerRef: MutableRefObject<number>;
  readonly ludusUpgrades: LudusUpgrades;
  readonly isUpgradesModalOpen: boolean;
  readonly isBreedingModalOpen: boolean;
  readonly setFeastState: Dispatch<SetStateAction<CampFeastState | null>>;
  readonly feastStateRef: MutableRefObject<CampFeastState | null>;
  readonly setFeastSlaves: Dispatch<SetStateAction<FeastSlaveNpc[]>>;
  readonly feastSlavesRef: MutableRefObject<FeastSlaveNpc[]>;
  readonly isFeastOfferPendingRef: MutableRefObject<boolean>;
  readonly currentVisitor: DynamicVisitor | null;
  readonly setCurrentVisitor: Dispatch<SetStateAction<DynamicVisitor | null>>;
  readonly visitorTimerRef: MutableRefObject<number>;
  readonly isVisitorModalOpen: boolean;
  readonly setIsVisitorModalOpen: Dispatch<SetStateAction<boolean>>;
  readonly setVisitorWalkingNpc: Dispatch<SetStateAction<VisitorWalkingNpcState | null>>;
  readonly visitorWalkingNpcRef: MutableRefObject<VisitorWalkingNpcState | null>;
  readonly setPhysicianNpc: Dispatch<SetStateAction<PhysicianNpcState>>;
  readonly physicianNpcRef: MutableRefObject<PhysicianNpcState>;
  readonly campActionCooldowns: { inspire: number; punish: number; physician: number; study: number; };
  readonly setCampActionCooldowns: Dispatch<SetStateAction<{ inspire: number; punish: number; physician: number; study: number; }>>;
  readonly arenaActionCooldowns: { shout: number; sand: number; stimulant: number; retreatUsed: boolean; };
  readonly setArenaActionCooldowns: Dispatch<SetStateAction<{ shout: number; sand: number; stimulant: number; retreatUsed: boolean; }>>;
  readonly crispPopups: CrispPopup[];
  readonly pepTalkState: { active: boolean; pendingTier: BattleTier | null; isTrial: boolean; addressedGladiatorIds: string[]; talkOutcomes: Record<string, { tone: PepTalkTone; } & PepTalkEvaluation>; } | null;
  readonly unlockedTierIndex: number;
  readonly setIsEmperorDuel: Dispatch<SetStateAction<boolean>>;
  readonly isEmperorDuelRef: MutableRefObject<boolean>;
  readonly isEmperorDuelModalOpen: boolean;
  readonly setHeroArrivalModal: Dispatch<SetStateAction<HeroArrivalModalState | null>>;
  readonly heroArrivalModalRef: MutableRefObject<HeroArrivalModalState | null>;
  readonly setKeeperSequence: Dispatch<SetStateAction<{ active: boolean; panelIndex: 0 | 1 | 2; charCount: number; charTimer: number; isDone: boolean; } | null>>;
  readonly keeperSequenceRef: MutableRefObject<{ active: boolean; panelIndex: 0 | 1 | 2; charCount: number; charTimer: number; isDone: boolean; } | null>;
  readonly totalBattlesWonRef: MutableRefObject<number>;
  readonly podiumTimerRef: MutableRefObject<number>;
  readonly podiumHasIgnitedRef: MutableRefObject<boolean>;
  readonly podiumFlashTimerRef: MutableRefObject<number>;
  readonly setJudgmentState: Dispatch<SetStateAction<JudgmentState>>;
  readonly judgmentStateRef: MutableRefObject<JudgmentState>;
  readonly setMerchantState: Dispatch<SetStateAction<TravelingMerchantState>>;
  readonly merchantStateRef: MutableRefObject<TravelingMerchantState>;
  readonly setDevoteeState: Dispatch<SetStateAction<DevoteeState>>;
  readonly devoteeStateRef: MutableRefObject<DevoteeState>;
  readonly campTimeOfDayRef: MutableRefObject<number>;
  readonly isBanditAlarmOpen: boolean;
  readonly setCourierNpcState: Dispatch<SetStateAction<CourierNpcState>>;
  readonly courierNpcRef: MutableRefObject<CourierNpcState>;
  readonly setIsHeraldSummonsOpen: Dispatch<SetStateAction<boolean>>;
  readonly heraldTimerRef: MutableRefObject<number>;
  readonly isTrialBellModalOpenRef: MutableRefObject<boolean>;
  readonly setTutorialStage: Dispatch<SetStateAction<TutorialStage>>;
  readonly tutorialStageRef: MutableRefObject<TutorialStage>;
  readonly isDebugMenuOpen: boolean;
  readonly firstBattleDoneRef: MutableRefObject<boolean>;
  readonly setPostBattleStage: Dispatch<SetStateAction<PostBattleTutorialStage>>;
  readonly postBattleStageRef: MutableRefObject<PostBattleTutorialStage>;
  readonly postBattleTimerRef: MutableRefObject<number>;
  readonly pendingPostBattleTutorialRef: MutableRefObject<boolean>;
  readonly camZoomRef: MutableRefObject<number>;
  readonly camXRef: MutableRefObject<number>;
  readonly camYRef: MutableRefObject<number>;
  readonly dimAlphaRef: MutableRefObject<number>;
  readonly spotRadiusRef: MutableRefObject<number>;
  readonly spotXRef: MutableRefObject<number>;
  readonly spotYRef: MutableRefObject<number>;
  readonly sparkleTimerRef: MutableRefObject<number>;
  readonly tutCharCountRef: MutableRefObject<number>;
  readonly tutCharTimerRef: MutableRefObject<number>;
  readonly tutIsLineDoneRef: MutableRefObject<boolean>;
  readonly postTutCharCountRef: MutableRefObject<number>;
  readonly postTutCharTimerRef: MutableRefObject<number>;
  readonly postTutIsLineDoneRef: MutableRefObject<boolean>;
  readonly tutorialIdleTimerRef: MutableRefObject<number>;
  readonly tutorialWineTimerRef: MutableRefObject<number>;
  readonly isGameMenuOpen: boolean;
  readonly deploymentTierRef: MutableRefObject<BattleTier | null>;
  readonly setArmoryTab: Dispatch<SetStateAction<"armoria" | "inventory" | "bazaar">>;
  readonly setActiveExpeditions: Dispatch<SetStateAction<ActiveQuestExpedition[]>>;
  readonly courierNotice: CourierNoticeState | null;
  readonly setCourierNotice: Dispatch<SetStateAction<CourierNoticeState | null>>;
  readonly courierTimerRef: MutableRefObject<number>;
  readonly unlockedChains: string[];
  readonly isHeraldSummonsOpenRef: MutableRefObject<boolean>;
  readonly isBattlesModalOpenRef: MutableRefObject<boolean>;
  readonly isArmoryModalOpenRef: MutableRefObject<boolean>;
  readonly isRosterModalOpenRef: MutableRefObject<boolean>;
  readonly isBondingModalOpenRef: MutableRefObject<boolean>;
  readonly isGameMenuOpenRef: MutableRefObject<boolean>;
  readonly isHowToPlayOpenRef: MutableRefObject<boolean>;
  readonly isQuestBoardOpenRef: MutableRefObject<boolean>;
  readonly activeQuestNodeRef: MutableRefObject<QuestNode | null>;
  readonly questResolutionRef: MutableRefObject<QuestResolutionModalState | null>;
  readonly activeExpeditionsRef: MutableRefObject<ActiveQuestExpedition[]>;
  readonly roster: Roster;
  readonly setStoryState: Dispatch<SetStateAction<ActiveStoryState>>;
  readonly storyStateRef: MutableRefObject<ActiveStoryState>;
  readonly storyCooldownRef: MutableRefObject<number>;
  readonly isSandboxBattleRef: MutableRefObject<boolean>;
  readonly isSimulatedAdActive: boolean;
  readonly setIsSimulatedAdActive: Dispatch<SetStateAction<boolean>>;
  readonly setAdCountdown: Dispatch<SetStateAction<number>>;
  readonly adCountdownRef: MutableRefObject<number>;
  readonly sandboxHoldTimerRef: MutableRefObject<number>;
  readonly setDisplayedGold: Dispatch<SetStateAction<number>>;
  readonly displayedGoldRef: MutableRefObject<number>;
  readonly goldTallyRef: MutableRefObject<{ isTallying: boolean; startGold: number; targetGold: number; duration: number; timer: number; blipInterval: number; timeSinceBlip: number; }>;
  readonly flyingGoldCoinsRef: MutableRefObject<{ id: string; x: number; y: number; startX: number; startY: number; targetX: number; targetY: number; progress: number; speed: number; size: number; arcHeight: number; color: string; glowColor: string; rotation: number; rotSpeed: number; }[]>;
  readonly goldTargetGlowTimerRef: MutableRefObject<number>;
  readonly simSpeed: number;
  readonly isSimPaused: boolean;
  readonly setCrispPopups: Dispatch<SetStateAction<CrispPopup[]>>;
  readonly arenaFightersRef: MutableRefObject<ArenaFighter[]>;
  readonly particlesRef: MutableRefObject<FloatingParticle[]>;
  readonly campSpeechBubblesRef: MutableRefObject<CampSpeechBubble[]>;
  readonly arenaSpeechBubblesRef: MutableRefObject<ArenaSpeechBubble[]>;
  readonly gladiatorSpeechCooldownsRef: MutableRefObject<Record<string, number>>;
  readonly animTimeRef: MutableRefObject<number>;
  readonly gladiatorsRef: MutableRefObject<Gladiator[]>;
  readonly gameStateRef: MutableRefObject<GameState>;
  readonly modeRef: MutableRefObject<"camp" | "arena" | "podium">;
  readonly activeTierRef: MutableRefObject<BattleTier | null>;
  readonly combatOutcomeRef: MutableRefObject<"in_progress" | "victory" | "defeat">;
  readonly gladiatorBondsRef: MutableRefObject<Record<string, number>>;
  readonly unlockedTierIndexRef: MutableRefObject<number>;
  readonly spawnCrispPopup: (logicX: number, logicY: number, text: string, color: string, isCrit?: any, isFatal?: any) => void;
  readonly addCombatLog: (text: string, tone: "player" | "enemy" | "neutral" | "crit" | "pin") => void;
  readonly spawnBloodSpray: (logicX: number, logicY: number, count?: number, baseAngle?: number) => void;
  readonly handleGladiatorInvestigationArrival: (glad: Gladiator, clickNum: number) => void;
  readonly advanceTutorial: () => void;
  readonly triggerStoryEvent: (gladiatorId?: string, force?: any) => void;
  readonly resolveExpedition: (exp: ActiveQuestExpedition) => void;
  readonly closeAllCampModals: () => void;
  readonly resolveBattle: (outcome: BattleOutcome) => void;
  readonly stepArenaCombat: (dt: number) => void;
}
