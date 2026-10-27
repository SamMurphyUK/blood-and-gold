// Moved verbatim out of App.tsx / portraits.ts (Stage 1 decoupling). No logic changes.

import type {QuestReward, QuestPenalty, QuestChoice, QuestNode} from '../data/quests';
import type {PaletteColor} from '../../constants';

// --- Cultural Heritage ---
export type Culture = 'roman' | 'celt' | 'berber' | 'scythian' | 'hunnic';

export type CombatTactics = 'aggressive' | 'defensive' | 'ranged';

export type SlotType = 'RIGHT' | 'LEFT' | 'BOTH';

export interface WeaponDef {
  id: string;
  name: string;
  slotType: SlotType;
  tier: 1 | 2 | 3;
  cost: number;
  atkBonus: number;
  defBonus: number;
  spdBonus: number;
  critBonus?: number; // e.g. 0.05 for +5% Crit
  pinBonus?: number;  // e.g. 0.15 for +15% Pin/Control chance
  description: string;
  icon: string;
  isExotic?: boolean; // Traveling Nomad Merchant exclusive Caravan Bazaar item
  isRanged?: boolean;
  isThrowingTrident?: boolean;
}

export interface PhysicianNpcState {
  active: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  timer: number; // 40 seconds
  healTickTimer: number; // ticks every 1.0s
  speechTimer: number; // speech every 6-8s
  didHumorCheck: boolean; // 5-10% rare chance once per visit
  flipX: boolean;
  animTimer: number;
  state: 'entering' | 'roaming' | 'departing';
}

export interface CampSpeechBubble {
  id: string;
  gladiatorId: string;
  speakerName: string;
  text: string;
  timer: number;
  maxDuration: number;
}

export interface ArenaSpeechBubble {
  id: string;
  fighterId: string;
  speakerName: string;
  text: string;
  timer: number;
  maxDuration: number;
}

export type WeightClass = 'Lightweight' | 'Cruiserweight' | 'Heavyweight' | 'Colossal';

export type GladiatorClass =
  | 'Murmillo'
  | 'Retiarius'
  | 'Bestiarius'
  | 'Dimachaerus'
  | 'Thracian'
  | 'Legionary'
  | 'Rebel'
  | 'War Horse'
  | 'War Elephant';

export type PersonalityTrait =
  | 'Proud'
  | 'Scarred Veteran'
  | 'Crowd Pleaser'
  | 'Claustrophobic'
  | 'Bloodthirsty'
  | 'Resilient'
  | 'Insecure'
  | 'Mad';

export interface TraitDefinition {
  name: PersonalityTrait;
  title: string;
  effect: string;
  flavor: string;
  color?: string;
  badgeBg?: string;
}

export interface GladiatorAttributes {
  str: number; // Strength: scales melee attack damage (~20% range)
  dex: number; // Dexterity: scales attack speed, cooldown recovery & agility (~20% range)
  vit: number; // Vitality: scales maximum HP (~20% range)
  wil: number; // Morale / resolve / recovery
  con?: number; // legacy alias for vit
}

export type PepTalkTone = 'INSPIRE' | 'MOCK' | 'THREATEN';

export interface LudusUpgrades {
  trainingGrounds: number; // 0, 1, 2, 3
  medicalBay: number;      // 0, 1, 2, 3
  breedingPens: number;    // 0, 1, 2
}

export interface DynamicVisitor {
  id: string;
  type: 'merchant' | 'scout' | 'patron' | 'rival';
  name: string;
  title: string;
  greeting: string;
  offerText: string;
  cost?: number;
  reward?: number;
  rewardText?: string;
  attributeBoost?: { type: keyof GladiatorAttributes; val: number; name: string };
  scoutRecruit?: Gladiator;
  timer: number;
}

export interface VisitorWalkingNpcState {
  active: boolean;
  visitor: DynamicVisitor;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'walking' | 'pausing_at_tent' | 'entering_tent';
  pauseTimer: number;
  speechText: string;
  hasSpoken: boolean;
  animTimer: number;
  flipX: boolean;
  walkTimer: number;
}

export interface EtherealSpark {
  x: number;
  y: number;
  timer: number;
  maxDuration: number;
}

export interface Gladiator {
  id: string;
  name: string;
  culture: Culture;
  title: string;
  level: number;
  xp: number;
  xpNeeded: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  weaponLevel: number;
  armorLevel: number;
  kills: number;
  tactics: CombatTactics;
  status: 'Available' | 'On Quest' | 'In Arena' | 'Retired / Breeding';
  equipped: { rightHand: string | null; leftHand: string | null };
  justEquipped?: boolean;
  equipParticleTimer?: number;
  // Spatial Camp Roaming State (in logic pixels)
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'idle' | 'walking' | 'sparring' | 'resting' | 'sitting';
  targetActivity?: 'idle' | 'walking' | 'sparring' | 'resting' | 'sitting';
  isSitting?: boolean;
  isOnQuest?: boolean;
  sparHitTimer?: number;
  actionTimer: number;
  animTimer: number;
  flipX: boolean;
  // Sitting cooldown & seated duration timers to prevent rapid toggling / flickering
  sitCooldown?: number;
  seatedDuration?: number;
  // Legendary Unique Hero Archetype ('beastmaster' | 'saladin' | 'zuzubu')
  heroType?: 'beastmaster' | 'saladin' | 'zuzubu';
  isCavalry?: boolean;
  isElephant?: boolean;
  // Quest Departure & Return Walk Animations
  questWalkState?: 'departing' | 'returning' | 'none';
  questWalkTimer?: number;
  questWalkTotal?: number;
  hidden?: boolean;
  // New Recruits Walk-In Entrance
  isWalkingIn?: boolean;

  // Progression & Attributes Expansion
  attributes?: GladiatorAttributes;
  weightClass?: WeightClass;
  gladiatorClass?: GladiatorClass;
  archetype?: string;
  traits?: PersonalityTrait[];
  pepTalkStatus?: 'Inspire' | 'Rage' | 'Resolve' | 'Rattled' | 'Hesitant' | 'Resentful' | 'Petulant' | 'Panic' | 'Reckless' | 'None';
  pepTalkThreatened?: boolean;
  inspireCount?: number;
  heritageTitle?: string;
  generation?: number;

  // Ghost Flash Investigation & Madness
  investigatingFlash?: {
    clickCount: number;
    flashX: number;
    flashY: number;
    arrived: boolean;
  };
  madTwitchTimer?: number;
}

export interface EnemyTemplate {
  name: string;
  culture: Culture;
  title: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  tactics: CombatTactics;
  isCavalry?: boolean;
  isElephant?: boolean;
  equipped?: { rightHand: string | null; leftHand: string | null };
}

export type ArenaMapTheme =
  | 'standard'
  | 'rome_flames'
  | 'river_rubicon'
  | 'alpine_rampart'
  | 'gallic_crossing'
  | 'camp_defense';

export interface SlashVFX {
  id: string;
  x: number;
  y: number;
  angle: number;
  framesLeft: number;
  isClash: boolean;
}

export interface DevoteeState {
  active: boolean;
  state: 'entering' | 'cheering' | 'leaving';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  battlesLeft: number;
  hasGiftedGold: boolean;
  animTimer: number;
  flipX: boolean;
  speechTimer: number;
}

export interface ArenaFortification {
  type: 'river' | 'low_wall';
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BattleTier {
  id: string;
  name: string;
  difficulty: string;
  goldReward: number;
  description: string;
  isBoss?: boolean;
  enemies: EnemyTemplate[];
  cooldownBattles?: number;
  mapTheme?: ArenaMapTheme;
  fortifications?: ArenaFortification[];
  isFortifiedQuest?: boolean;
  heroReward?: 'beastmaster' | 'saladin' | 'zuzubu';
  isPodiumTrial?: boolean;
  hasHeraldBribeOption?: boolean;
}

export interface CombatLogEntry {
  id: string;
  timeStr: string;
  text: string;
  tone: 'player' | 'enemy' | 'neutral' | 'crit' | 'pin';
}

export interface FloatingParticle {
  x: number;
  y: number;
  color: PaletteColor;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size?: number;
  isBlood?: boolean;
}

export interface CrispPopup {
  id: string;
  logicX: number;
  logicY: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
  isFatal?: boolean;
}

export interface Projectile {
  id: string;
  ownerId: string;
  isPlayerTeam: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isCrit: boolean;
  life: number;
  maxLife: number;
  culture: Culture;
  isStone?: boolean;
  isBolt?: boolean;
  isPiercingTrident?: boolean;
  pierceCount?: number;
  hitFighterIds?: string[];
}

export interface BondShiftRecord {
  pairKey: string;
  glad1Name: string;
  glad2Name: string;
  delta: number;
  newScore: number;
  reason: string;
}

export interface MemorialGrave {
  id: string;
  gladiatorId: string;
  name: string;
  culture: Culture;
  title: string;
  battlesWon: number;
  epitaph: string;
  slotIndex: number;
  x: number;
  y: number;
}

export interface PartyMemberPostBattle {
  id: string;
  name: string;
  culture: Culture;
  title: string;
  startLevel: number;
  endLevel: number;
  startXp: number;
  endXp: number;
  xpNeeded: number;
  xpGained: number;
  startBondPips: number;
  endBondPips: number;
  didLevelUp: boolean;
  hpRemaining: number;
  maxHp: number;
  heroType?: HeroType;
  gladiatorClass?: GladiatorClass;
  statGains?: { str: number; dex: number; vit: number };
  newStats?: { str: number; dex: number; vit: number };
}

export interface AftermathData {
  isVictory: boolean;
  isTrial: boolean; // true if official Coliseum Trial, false if side skirmish
  tierName: string;
  goldEarned: number;
  narratives: string[];
  bondShifts: BondShiftRecord[];
  partyMembers: PartyMemberPostBattle[];
}

export interface QuestResolutionModalState {
  node: QuestNode;
  glad: Gladiator;
  isSuccess: boolean;
  roll: number;
  chance: number;
  choice: QuestChoice;
  outcomeNode?: QuestNode;
  rewards?: QuestReward;
  penalty?: QuestPenalty;
}

export interface CourierNpcState {
  active: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'walking' | 'at_tent' | 'departing';
  speechTimer: number;
  speechText: string;
  walkTimer: number;
  animTimer: number;
  flipX: boolean;
  hasPlayedHorn: boolean;
}

export interface CourierNoticeState {
  chainId: string;
  speaker: string;
  title: string;
  nodeId: string;
}

export interface BattlefieldLootState {
  enemyName: string;
  item: WeaponDef;
  targetGladId: string;
  targetGladName: string;
}

export interface ArenaFighter {
  id: string;
  sourceGladiatorId?: string;
  isPlayerTeam: boolean;
  name: string;
  culture: Culture;
  title: string;
  level: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  speed: number;
  tactics: CombatTactics;
  equipped?: { rightHand: string | null; leftHand: string | null };
  critBonus?: number;
  pinBonus?: number;
  isCavalry?: boolean;
  isElephant?: boolean;
  isEmperor?: boolean;
  isDead?: boolean;
  heroType?: 'beastmaster' | 'saladin' | 'zuzubu';
  zuzubuThrownSpear?: boolean;
  saladinAuraTimer?: number;
  elephantChargeCooldown?: number;
  isCharging?: boolean;
  hasCavalryHit?: boolean;
  chargeTimer?: number;
  chargeVx?: number;
  chargeVy?: number;
  stunTimer?: number;
  consecutiveMissilesTaken?: number;
  moraleRallyTimer?: number;
  blindDistractTimer?: number;
  pepTalkStatus?: 'Inspire' | 'Rage' | 'Resolve' | 'Rattled' | 'Hesitant' | 'Resentful' | 'Petulant' | 'Panic' | 'Reckless' | 'None';
  pepTalkThreatened?: boolean;
  attributes?: GladiatorAttributes;
  weightClass?: WeightClass;
  gladiatorClass?: GladiatorClass;
  traits?: PersonalityTrait[];
  madTwitchTimer?: number;
  consecutiveMisses?: number;
  repositionTimer?: number;
  stationaryDuelTimer?: number;

  // Real-time arena physics coordinates (logic pixels)
  x: number;
  y: number;
  vx: number;
  vy: number;
  flipX: boolean;

  // State machine
  state: 'idle' | 'walking' | 'attack' | 'hurt' | 'pinned' | 'pinning' | 'death';
  animTimer: number;
  attackCooldown: number;
  tacticsTimer: number;
  isBaiting: boolean;

  // Pin / Grapple mechanic
  pinnedTimer: number;
  pinCooldown: number;
  pinnedTargetId?: string;
  pinnedByFighterId?: string;
  hasThrownTrident?: boolean;

  // Dramatic Finishing Blow / Death sequence
  deathTimer: number;
  flashWhiteTimer: number;
  rageTimer: number;
}

export interface HeroArrivalModalState {
  hero: Gladiator;
  speaker: string;
  title: string;
  tale: string;
  charCount: number;
  charTimer: number;
  isDone: boolean;
}

export interface SideEnemyDef {
  name: string;
  culture: Culture;
  title: string;
  tactics: CombatTactics;
  category: 'Renegade Thracians' | 'Pit Brawlers' | 'Deserter Legionaries' | 'Desert Nomads' | 'Wild Beasts & Handlers' | 'Mounted Outriders';
  isCavalry?: boolean;
  isElephant?: boolean;
}

export interface CampFeastState {
  active: boolean;
  timer: number;
  totalDuration: number;
  tableAlpha: number;
  banterTimer: number;
  unlocked: boolean;
}

export interface FeastSlaveNpc {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  flipX: boolean;
  state: 'entering' | 'serving' | 'departing';
  platterItem: 'roast' | 'wine' | 'bread';
}

export interface PepTalkEvaluation {
  statusCategory: 'INSPIRED' | 'SKEPTICAL' | 'DEMORALIZED';
  outcome: 'Inspire' | 'Petulant' | 'Panic' | 'Reckless' | 'Rage' | 'Resolve' | 'Rattled' | 'Hesitant' | 'Resentful' | 'Threatened' | 'Neutral';
  buff: string;
  desc: string;
}

export interface TravelingMerchantState {
  active: boolean;
  state: 'entering' | 'sitting' | 'leaving';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  sitTimer: number; // starts at 15s
  hasPlayedSitSpeech: boolean;
  hasPlayedDepartSpeech: boolean;
  flipX: boolean;
  animTimer: number;
}

export type TutorialStage =
  | 'idle'
  | 'wine_speech'
  | 'spotlight_tent'
  | 'spotlight_armory'
  | 'call_warning'
  | 'done';

export type PostBattleTutorialStage =
  | 'none'
  | 'recruits_dialogue_1'
  | 'recruits_dialogue_2'
  | 'courtyard_zoom'
  | 'dummy_spotlight_1'
  | 'dummy_spotlight_2'
  | 'tent_spotlight'
  | 'done';

export type JudgmentPhase =
  | 'hold'
  | 'pan_up'
  | 'hold_balcony'
  | 'eye_cut_in'
  | 'flash'
  | 'verdict'
  | 'pan_down'
  | 'post_pan_hold'
  | 'execution_walk'
  | 'execution_strike'
  | 'execution_settle'
  | 'done';

export interface JudgmentState {
  active: boolean;
  phase: JudgmentPhase;
  startTime: number;
  cameraPanY: number;
  verdict: 'thumbs_up' | 'thumbs_down';
  isPlayerVictorious: boolean;
  isTrial: boolean;
  hasDownedGlads: boolean;
  downedGladIds: string[];
  audioTriggered: { build: boolean; cheer: boolean; slash: boolean; murmur: boolean; executionRoar: boolean };
  executionerId?: string;
  victimId?: string;
  execStartX?: number;
  execStartY?: number;
  execTargetX?: number;
  execTargetY?: number;
  execTimer?: number;
  execStrikeProgress?: number; // 0 (raise sword) -> 1 (thrust down)
}

// --- Portrait / NPC identifiers (previously declared in portraits.ts) ---
export type NpcPortraitType =
  | 'corrupt_senator'
  | 'shadow_broker'
  | 'imperial_magistrate'
  | 'priestess_bellona'
  | 'escaped_slave_ring';

export type HeroType = 'beastmaster' | 'saladin' | 'zuzubu' | 'emperor';
