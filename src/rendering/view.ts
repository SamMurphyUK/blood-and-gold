// New in Stage 2B (rendering extraction); no game logic lives here.
//
// RenderView: everything the frame renderer reads from App(). App builds one per render,
// exactly where the old inner draw() closure used to be, so values behave as the closure did:
//   - plain values (mode, ...) are the state captured by that render
//   - *Ref fields are the live ref objects; the renderer reads `.current` at draw time
// The view is read-only, with two exceptions that draw() has always written (typed MutableRefView).

import type {ArenaFighter, ArenaSpeechBubble, BattleTier, CampFeastState, CampSpeechBubble, CourierNpcState, DevoteeState, EtherealSpark, FeastSlaveNpc, FloatingParticle, Gladiator, JudgmentState, LudusUpgrades, MemorialGrave, PhysicianNpcState, PostBattleTutorialStage, Projectile, SlashVFX, TravelingMerchantState, TutorialStage, VisitorWalkingNpcState} from '../types';

/** Read-only handle to a React ref. */
export type RefView<T> = {readonly current: T};
/** A ref the renderer is allowed to write (draw() has always written these). */
export type MutableRefView<T> = {current: T};

/** Shape of the entries in App's flyingGoldCoinsRef (named here; App still declares it inline). */
export interface FlyingGoldCoin {
  id: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  size: number;
  arcHeight: number;
  color: string;
  glowColor: string;
  rotation: number;
  rotSpeed: number;
}

/** Shape of App's keeperSequenceRef value (named here; App still declares it inline). */
export interface KeeperSequenceState {
  active: boolean;
  panelIndex: 0 | 1 | 2;
  charCount: number;
  charTimer: number;
  isDone: boolean;
}

export interface RenderView {
  // --- Frame (setup, cinematic, particles, blit, gold coins, mode dispatch) ---
  readonly offscreenCanvasRef: RefView<HTMLCanvasElement | null>;
  readonly screenShakeTimerRef: RefView<number>;
  readonly cinematicStateRef: RefView<number>;
  readonly cinematicPhaseStartTimeRef: MutableRefView<number>;
  readonly typewriterCharCountRef: RefView<number>;
  readonly isTypewriterDoneRef: RefView<boolean>;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly particlesRef: RefView<FloatingParticle[]>;
  readonly flyingGoldCoinsRef: RefView<FlyingGoldCoin[]>;
  readonly mode: "camp" | "arena" | "podium";
  readonly judgmentState: JudgmentState;

  // --- Camp scene ---
  readonly camZoomRef: RefView<number>;
  readonly camXRef: RefView<number>;
  readonly camYRef: RefView<number>;
  readonly campShootingStarActiveDurationRef: RefView<number>;
  readonly animTimeRef: RefView<number>;
  readonly unlockedTierIndex: number;
  readonly campTimeOfDayRef: RefView<number>;
  readonly hoveredCampObject: "tent" | "weaponRack" | "dummy" | "bell" | "merchant" | "stewardess" | "visitor" | null;
  readonly ludusUpgrades: LudusUpgrades;
  readonly feastStateRef: RefView<CampFeastState | null>;
  readonly feastSlavesRef: RefView<FeastSlaveNpc[]>;
  readonly etherealSparksRef: RefView<EtherealSpark[]>;
  readonly memorialGraves: MemorialGrave[];
  readonly hoveredGraveId: string | null;
  readonly selectedGraveId: string | null;
  readonly physicianNpcRef: RefView<PhysicianNpcState>;
  readonly merchantStateRef: RefView<TravelingMerchantState>;
  readonly devoteeStateRef: RefView<DevoteeState>;
  readonly courierNpcRef: RefView<CourierNpcState>;
  readonly visitorWalkingNpcRef: RefView<VisitorWalkingNpcState | null>;
  readonly gladiatorsRef: RefView<Gladiator[]>;
  readonly sparkleTimerRef: RefView<number>;
  readonly campWeatherRef: RefView<"clear" | "rain">;
  readonly dimAlphaRef: RefView<number>;
  readonly tutorialStageRef: RefView<TutorialStage>;
  readonly postBattleStageRef: RefView<PostBattleTutorialStage>;
  readonly spotXRef: RefView<number>;
  readonly spotYRef: RefView<number>;
  readonly spotRadiusRef: RefView<number>;
  readonly tutCharCountRef: RefView<number>;
  readonly tutIsLineDoneRef: RefView<boolean>;
  readonly postTutCharCountRef: RefView<number>;
  readonly postTutIsLineDoneRef: RefView<boolean>;
  readonly keeperSequenceRef: RefView<KeeperSequenceState | null>;
  readonly isFeastOfferPendingRef: RefView<boolean>;

  // --- Podium scene ---
  readonly podiumGladiatorsRef: RefView<Gladiator[]>;
  readonly podiumTimerRef: RefView<number>;
  readonly podiumFlashTimerRef: RefView<number>;

  // --- Arena scene ---
  readonly activeTierRef: RefView<BattleTier | null>;
  readonly isSandboxBattleRef: RefView<boolean>;
  readonly isEmperorDuelRef: RefView<boolean>;
  readonly totalBattlesWonRef: RefView<number>;
  readonly arenaFightersRef: RefView<ArenaFighter[]>;
  readonly projectilesRef: RefView<Projectile[]>;
  readonly slashVfxRef: MutableRefView<SlashVFX[]>;

  // --- Camp overlay ---
  readonly hoveredCampObjectRef: RefView<"tent" | "weaponRack" | "dummy" | "bell" | "merchant" | "stewardess" | "visitor" | null>;
  readonly campSpeechBubblesRef: RefView<CampSpeechBubble[]>;

  // --- Arena overlay ---
  readonly arenaSpeechBubblesRef: RefView<ArenaSpeechBubble[]>;
}
