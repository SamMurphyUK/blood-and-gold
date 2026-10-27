// FOUND_MAINLINE
// FOUND_MAINLINE_7
// FOUND_MAINLINE_9
// FOUND_MAINLINE_10
// Gladiator Manager - Tag: MAINLINE-2.0 (MAINLINE_2_0)
// MAINLINE 2.0 - Traveling merchant walking physics & caravan bazaar fix, clean camp hover rendering (no flashing boxes), casualty header cleanup, dynamic procedural arena side-skirmishes scaling with podium clearance
// Multi-Fighter Arena Battles with Real-Time Movement, AI Psychology, Stamina, Pin/Grapple, CRIT & Dramatic Finisher
// Crisp high-resolution vector UI & notifications overlay, preserving 16-color antiquity palette and character proportions.
// tslint:disable
/* eslint-disable */
import {ArrowLeft, Clock, HelpCircle, Menu, Pause, Play, RotateCw, Scroll, Sparkles, Trophy, Volume2, VolumeX, X} from 'lucide-react';
import React, {useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {getConfig, PALETTE, PaletteColor, THEME} from './constants';
import {getPortraitDataUrl, getNpcPortraitDataUrl, getAulusPortraitDataUrl} from './src/rendering/portraits';
import {calculateGladiatorSuccessChance, ActiveQuestExpedition, QuestNode, QUEST_CHAINS, QUEST_DATABASE, QuestReward, QuestPenalty} from './src/data/quests';
import {ActiveStoryState, getStoryEventForGladiator, INITIAL_STORY_STATE} from './src/data/storyEvents';
import {INTRO_MONOLOGUE_TEXT} from './src/rendering/cinematicIntro';
import {cinematicIntroMusic} from './cinematicIntroAudio';
import BackgroundMusic from './utils/BackgroundMusic';
import {createFixedStepper, gameAudio, GameState, MenuOverlay, Overlay, useAutoFocus, useIsMobile} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
} from './utils/usePlayground';
import type {Culture, CombatTactics, WeaponDef, PhysicianNpcState, CampSpeechBubble, ArenaSpeechBubble, PersonalityTrait, GladiatorAttributes, PepTalkTone, LudusUpgrades, DynamicVisitor, VisitorWalkingNpcState, EtherealSpark, Gladiator, EnemyTemplate, SlashVFX, DevoteeState, BattleTier, CombatLogEntry, FloatingParticle, CrispPopup, Projectile, MemorialGrave, AftermathData, QuestResolutionModalState, CourierNpcState, CourierNoticeState, BattlefieldLootState, ArenaFighter, HeroArrivalModalState, SideEnemyDef, CampFeastState, FeastSlaveNpc, PepTalkEvaluation, TravelingMerchantState, TutorialStage, PostBattleTutorialStage, JudgmentState} from './src/types';
import {WEAPON_DATABASE} from './src/data/weapons';
import {TRAIT_DEFINITIONS} from './src/data/traits';
import {BATTLE_TIERS, EMPEROR_DUEL_TIER, FORTIFIED_QUEST_TEMPLATES} from './src/data/battleTiers';
import {INITIAL_GLADIATORS} from './src/data/gladiators';
import {SAVE_KEY, SAVE_SCHEMA, bindRef, resetToInitial, restoreSave, serializeSave, type GladiatorQuestProgress, type SaveBindings} from './src/systems/saveSchema';
import {HERO_LORE_TALES, HERO_BEASTMASTER, HERO_SALADIN, HERO_ZUZUBU} from './src/data/heroes';
import {SIDE_FIGHTER_POOL} from './src/data/sideFighters';
import {TUTORIAL_TEXT_TENT, TUTORIAL_TEXT_ARMORY, TUTORIAL_TEXT_WARNING, POST_BATTLE_TEXT_1, POST_BATTLE_TEXT_2, DUMMY_TEXT_1, DUMMY_TEXT_2, POST_BATTLE_TENT_TEXT} from './src/data/tutorial';
import {renderFrame} from './src/rendering/renderFrame';
import type {RenderView} from './src/rendering/view';
import {getSafeNow} from './src/rendering/frameTime';
import {getCrowdTier} from './src/rendering/arena/crowdTier';
import {KEEPER_POST_FIFTH_PANELS} from './src/data/keeper';
import {CULTURE_DESCRIPTIONS, CULTURE_LABELS} from './src/data/cultures';
import {LOGIC_WIDTH, LOGIC_HEIGHT} from './src/rendering/primitives';
import {recalculateGladiatorStats} from './src/logic/gladiatorStats';
import {toRoman} from './src/logic/roman';
import {getPodiumCountdownMultiplier, isSpecialNarrativeQuest} from './src/logic/tiers';
import {updateWorld} from './src/systems/updateWorld';
import {createEconomy} from './src/systems/economy';
import {resolveBattle} from './src/systems/resolveBattle';
import type {BattleView} from './src/systems/resolveBattle';
import type {BattleOutcome} from './src/systems/view';
import {createRoster} from './src/systems/roster';
import {buildFighter} from './src/systems/buildFighter';
import {useHudTick} from './src/systems/useHudTick';
import type {UpdateView} from './src/systems/view';


export const INITIAL_PHYSICIAN_STATE: PhysicianNpcState = {
  active: false,
  x: 24,
  y: 110,
  targetX: 120,
  targetY: 115,
  timer: 40.0,
  healTickTimer: 1.0,
  speechTimer: 3.0,
  didHumorCheck: false,
  flipX: false,
  animTimer: 0,
  state: 'entering',
};


/** Interactive stone beveled trait tooltip badge */
export function TraitBadge({
  trait,
  className = '',
}: {
  trait: PersonalityTrait;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const def = TRAIT_DEFINITIONS[trait] || {
    name: trait,
    title: trait,
    effect: 'Unique combat personality tendency.',
    flavor: 'Forged in the arena.',
    color: '#cb9f6b',
    badgeBg: '#3f3126',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}>
      <span
        tabIndex={0}
        role="button"
        aria-label={`${def.title} trait info`}
        style={{
          color: def.color || '#ded095',
          backgroundColor: def.badgeBg || '#2A1B19',
        }}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#7f644b]/80 hover:border-[#ded095] cursor-help transition-all shadow-sm ${className}`}>
        <span>{trait === 'Mad' ? '🌀' : trait === 'Bloodthirsty' ? '🩸' : trait === 'Crowd Pleaser' ? '👑' : trait === 'Scarred Veteran' ? '⚔️' : trait === 'Proud' ? '🦁' : trait === 'Resilient' ? '🛡️' : trait === 'Claustrophobic' ? '💨' : '✨'}</span>
        <span>{def.title}</span>
      </span>

      {/* Stone beveled tooltip container (#2A1B19 interior, #8C7A6B border, antique gold title and off-white description) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 sm:w-64 p-2.5 bg-[#2A1B19] border-2 border-[#8C7A6B] rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_1px_0_#ded095] pointer-events-auto text-left animate-fadeIn">
          {/* Beveled corner rivets */}
          <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#ded095] border border-black pointer-events-none" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ded095] border border-black pointer-events-none" />
          <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#ded095] border border-black pointer-events-none" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#ded095] border border-black pointer-events-none" />

          {/* Pointer caret arrow downwards */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#8C7A6B]" />

          <div className="flex items-center justify-between pb-1 border-b border-[#7f644b]/60 mb-1.5">
            <span className="font-serif font-black text-xs text-[#ded095] tracking-wider flex items-center gap-1">
              <span>{def.title.toUpperCase()}</span>
            </span>
            <span className="text-[9px] uppercase font-bold text-[#cb9f6b]">Personality Trait</span>
          </div>

          <p className="text-[11px] text-[#f8f5ed] font-medium leading-snug mb-1.5">
            {def.effect}
          </p>

          <p className="text-[10px] text-[#cb9f6b] italic font-serif leading-tight">
            &ldquo;{def.flavor}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

export function rollNpcEquipment(
  level: number,
  culture?: Culture,
): { rightHand: string | null; leftHand: string | null } {
  if (level === 4) {
    if (Math.random() >= 0.50) {
      return { rightHand: null, leftHand: null };
    }
    const options: Array<{ rightHand: string | null; leftHand: string | null }> = [
      { rightHand: 'celtic_longsword', leftHand: 'scutum' },
      { rightHand: 'celtic_longsword', leftHand: 'parmula' },
      { rightHand: 'sica', leftHand: 'scutum' },
      { rightHand: 'sica', leftHand: 'rete' },
      { rightHand: 'barbarian_greatclub', leftHand: 'barbarian_greatclub' },
      { rightHand: 'heavy_falx', leftHand: 'heavy_falx' },
      { rightHand: 'gastraphetes', leftHand: 'gastraphetes' },
      { rightHand: 'spiculum', leftHand: 'spiculum' },
      { rightHand: 'gladius', leftHand: 'scutum' },
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  if (level >= 5) {
    if (Math.random() >= 0.80) {
      return { rightHand: null, leftHand: null };
    }
    const options: Array<{ rightHand: string | null; leftHand: string | null }> = [
      { rightHand: 'fuscina', leftHand: 'rete' },
      { rightHand: 'fuscina', leftHand: 'gilded_tower_aegis' },
      { rightHand: 'damascene_spatha', leftHand: 'gilded_tower_aegis' },
      { rightHand: 'damascene_spatha', leftHand: 'scutum' },
      { rightHand: 'obsidian_kopis', leftHand: 'gilded_tower_aegis' },
      { rightHand: 'imperial_rhomphaia', leftHand: 'imperial_rhomphaia' },
      { rightHand: 'imperial_dragon_standard', leftHand: 'imperial_dragon_standard' },
      { rightHand: 'spiculum', leftHand: 'scutum' },
      { rightHand: 'throwing_trident', leftHand: 'gilded_tower_aegis' },
      { rightHand: 'spiked_caestus', leftHand: 'gilded_tower_aegis' },
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  return { rightHand: null, leftHand: null };
}


export const INITIAL_DEVOTEE_STATE: DevoteeState = {
  active: false,
  state: 'entering',
  x: 330,
  y: 135,
  targetX: 160,
  targetY: 115,
  battlesLeft: 2,
  hasGiftedGold: false,
  animTimer: 0,
  flipX: true,
  speechTimer: 0,
};

// Escalate fee: 200G -> 400G -> 600G -> 1200G
export const RESPITE_COST_SCHEDULE = [200, 400, 600, 1200] as const;

function sumQuestAmount(base?: number, extra?: number): number | undefined {
  const sum = (base || 0) + (extra || 0);
  return sum === 0 ? undefined : sum;
}

function mergeQuestRewards(base?: QuestReward, extra?: QuestReward): QuestReward | undefined {
  if (!base && !extra) return undefined;
  const gold = sumQuestAmount(base?.gold, extra?.gold);
  const xp = sumQuestAmount(base?.xp, extra?.xp);
  const heal = sumQuestAmount(base?.heal, extra?.heal);
  const recruit = extra?.recruit || base?.recruit;
  const unlockChain = extra?.unlockChain || base?.unlockChain;
  const killed = base?.killed || extra?.killed;
  if (gold == null && xp == null && heal == null && !recruit && !unlockChain && !killed) return undefined;
  return {gold, xp, heal, recruit, unlockChain, killed};
}

function mergeQuestPenalties(base?: QuestPenalty, extra?: QuestPenalty): QuestPenalty | undefined {
  if (!base && !extra) return undefined;
  const gold = sumQuestAmount(base?.gold, extra?.gold);
  const damage = sumQuestAmount(base?.damage, extra?.damage);
  const killed = base?.killed || extra?.killed;
  if (gold == null && damage == null && !killed) return undefined;
  return {gold, damage, killed};
}

export const INITIAL_COURIER_STATE: CourierNpcState = {
  active: false,
  x: 165,
  y: 192,
  targetX: 45,
  targetY: 83,
  state: 'walking',
  speechTimer: 0,
  speechText: '',
  walkTimer: 0,
  animTimer: 0,
  flipX: true,
  hasPlayedHorn: false,
};

export function formatWeaponStats(w: WeaponDef): string {
  const parts: string[] = [];
  if (w.atkBonus > 0) parts.push(`+${w.atkBonus} ATK`);
  if (w.defBonus > 0) parts.push(`+${w.defBonus} DEF`);
  if (w.spdBonus !== 0) parts.push(`${w.spdBonus > 0 ? '+' : ''}${w.spdBonus} SPD`);
  if (w.critBonus) parts.push(`+${Math.round(w.critBonus * 100)}% Crit`);
  if (w.pinBonus) parts.push(`+${Math.round(w.pinBonus * 100)}% Pin`);
  return parts.length > 0 ? parts.join(', ') : 'Standard Quality';
}


export function getMaxSquadSizeForTier(tierIndex: number): number {
  if (tierIndex <= 1) return 2;
  return 4; // 3rd podium (tierIndex 2) and above support squad deployment of up to 4 gladiators
}

// ============================================================================
// DITHERING & CANVAS RENDERING HELPERS (PRESERVING ART-SNAPSHOT-V1)
// ============================================================================

// MARKER_BEFORE_GENERATE
export function generateSideSkirmishes(podiumTier = 1, forceFortified = false, currentGladiators: Gladiator[] = []): BattleTier[] {
  const currentTier = Math.max(1, Math.min(5, podiumTier));
  const isTrial3Beaten = currentTier >= 3;

  // Hero Quest Deduplication: Check already unlocked/recruited unique heroes
  const recruitedHeroTypes = currentGladiators
    .map((g) => g.heroType)
    .filter((h): h is 'beastmaster' | 'saladin' | 'zuzubu' => !!h);

  const availableForts = FORTIFIED_QUEST_TEMPLATES.filter(
    (f) => !f.heroReward || !recruitedHeroTypes.includes(f.heroReward),
  );

  // Check if we should insert a Rare Fortified Sidequest with custom defensive fortifications & legendary hero rewards
  let injectedFortifiedQuest: BattleTier | null = null;
  if ((forceFortified || Math.random() < 0.75) && availableForts.length > 0) {
    const pickedFort = availableForts[Math.floor(Math.random() * availableForts.length)];
    injectedFortifiedQuest = {
      ...pickedFort,
      id: `${pickedFort.id}_${Date.now()}_${Math.random()}`,
      // Fully clone enemies with guaranteed fresh positive hp
      enemies: pickedFort.enemies.map((e) => ({
        ...e,
        hp: Math.max(80, Math.round(e.hp || 150)),
        attack: Math.max(12, Math.round(e.attack || 20)),
        defense: Math.max(4, Math.round(e.defense || 10)),
        speed: Math.max(6, Math.round(e.speed || 12)),
        equipped: e.equipped ? { ...e.equipped } : undefined,
      })),
    };
  }

  const bountyConfigs = [
    {
      prefix: 'Underground Bounty',
      difficulty: currentTier <= 1 ? 'Novice' : currentTier <= 3 ? 'Challenging' : 'Fierce',
      desc: 'Rival lanistas sponsor a bloody skirmish against renegades and brawlers in the outer pits.',
      goldMult: 1.0,
      sizeOffset: 0,
    },
    {
      prefix: 'Desert Nomads & Outlaws',
      difficulty: currentTier <= 2 ? 'Challenging' : 'Fierce',
      desc: 'Swift skirmishers and steppe cavalry clash with unorthodox flanking tactics.',
      goldMult: 1.25,
      sizeOffset: currentTier >= 2 ? 1 : 0,
    },
    {
      prefix: 'Imperial Deserters & Beasts',
      difficulty: currentTier <= 2 ? 'Fierce' : 'Brutal',
      desc: 'Armored legion deserters, war elephants, and mounted lancers fight for black-market wagers.',
      goldMult: 1.5,
      sizeOffset: currentTier >= 3 ? 1 : 0,
    },
  ];

  const standardBounties = bountyConfigs.map((cfg, idx) => {
    let squadSize = 1;
    let minLvl = 1;
    let maxLvl = 1;
    let baseGold = 40;

    // 20% reduced baseline gold rewards across all bouts
    if (currentTier === 1) {
      squadSize = 1 + (idx === 2 ? 1 : 0);
      minLvl = 1;
      maxLvl = 2;
      baseGold = Math.round((45 + idx * 15) * 0.8);
    } else if (currentTier === 2) {
      squadSize = 2 + (idx >= 1 ? 1 : 0);
      minLvl = 2;
      maxLvl = 3;
      baseGold = Math.round((95 + idx * 25) * 0.8);
    } else if (currentTier === 3) {
      squadSize = 2 + idx;
      minLvl = 2;
      maxLvl = 4;
      baseGold = Math.round((180 + idx * 40) * 0.8);
    } else {
      squadSize = Math.min(4, 3 + idx);
      minLvl = Math.max(3, currentTier - 1);
      maxLvl = Math.min(5, currentTier + 1);
      baseGold = Math.round((280 + idx * 60) * 0.8);
    }

    squadSize = Math.max(1, Math.min(4, squadSize + cfg.sizeOffset));
    const goldReward = Math.round(baseGold * cfg.goldMult);

    const shuffled = [...SIDE_FIGHTER_POOL].sort(() => Math.random() - 0.5);
    const chosenEnemies: SideEnemyDef[] = [];
    let cavalryCount = 0;
    let elephantCount = 0;

    // Cavalry spawn rate: allow 1-2 in earlier tiers, up to 2-3 in higher tiers!
    const maxCavalryAllowed = currentTier <= 2 ? 1 : currentTier === 3 ? 2 : 3;

    // Pick enemies respecting cavalry & elephant caps
    for (const tmpl of shuffled) {
      if (chosenEnemies.length >= squadSize) break;
      if (tmpl.isElephant) {
        if (!isTrial3Beaten || elephantCount >= 1 || (idx < 2 && currentTier < 4)) {
          continue; // War elephant spawns in fierce/brutal contracts when Trial 3+ beaten
        }
        elephantCount++;
      } else if (tmpl.isCavalry) {
        if (cavalryCount >= maxCavalryAllowed) {
          continue;
        }
        cavalryCount++;
      }
      chosenEnemies.push(tmpl);
    }

    // Fill remaining squad slots with non-cavalry/non-elephant if needed
    if (chosenEnemies.length < squadSize) {
      const fillers = shuffled.filter((t) => !t.isElephant && !t.isCavalry && !chosenEnemies.includes(t));
      for (const tmpl of fillers) {
        if (chosenEnemies.length >= squadSize) break;
        chosenEnemies.push(tmpl);
      }
    }

    // Failsafe: Ensure chosen enemies is NEVER empty
    if (chosenEnemies.length === 0) {
      chosenEnemies.push(SIDE_FIGHTER_POOL[0]);
    }

    const enemies: EnemyTemplate[] = chosenEnemies.map((tmpl) => {
      const eLevel = Math.max(1, Math.min(5, Math.floor(minLvl + Math.random() * (maxLvl - minLvl + 1))));
      let hp = Math.max(60, (tmpl.isCavalry ? 100 : 80) + eLevel * 25 + Math.floor(Math.random() * 15));
      let attack = Math.max(10, (tmpl.isCavalry ? 18 : 15) + eLevel * 4 + Math.floor(Math.random() * 3));
      let defense = Math.max(2, (tmpl.isCavalry ? 8 : 6) + eLevel * 3);
      let speed = Math.max(5, (tmpl.isCavalry ? 18 : 10) + eLevel * 1);

      if (tmpl.isElephant) {
        // Colossal War Elephant combat stats: 3.5x - 4x infantry HP, low speed, high impact resistance
        hp = Math.max(300, 350 + eLevel * 30 + Math.floor(Math.random() * 25));
        attack = Math.max(22, 26 + eLevel * 3);
        defense = Math.max(12, 18 + eLevel * 2);
        speed = 7;
      }

      let equipped: { rightHand: string | null; leftHand: string | null } | undefined = undefined;
      if (!tmpl.isElephant && !tmpl.isCavalry) {
        const rolled = rollNpcEquipment(eLevel, tmpl.culture);
        if (rolled.rightHand || rolled.leftHand) {
          equipped = rolled;
          const rW = rolled.rightHand ? WEAPON_DATABASE[rolled.rightHand] : null;
          const lW = rolled.leftHand ? WEAPON_DATABASE[rolled.leftHand] : null;
          if (rW && rW.slotType === 'BOTH') {
            attack += rW.atkBonus;
            defense += rW.defBonus;
            speed += rW.spdBonus;
          } else {
            if (rW) {
              attack += rW.atkBonus;
              defense += rW.defBonus;
              speed += rW.spdBonus;
            }
            if (lW) {
              attack += lW.atkBonus;
              defense += lW.defBonus;
              speed += lW.spdBonus;
            }
          }
        }
      }

      return {
        name: tmpl.name,
        culture: tmpl.culture,
        title: `${tmpl.title} (Lvl ${toRoman(eLevel)})`,
        hp,
        attack,
        defense,
        speed,
        tactics: tmpl.tactics,
        isCavalry: tmpl.isCavalry || false,
        isElephant: tmpl.isElephant || false,
        equipped,
      };
    });

    const fallbackEnemies: EnemyTemplate[] = [
      {
        name: 'Underground Pit Brawler',
        culture: 'roman',
        title: 'Pit Fighter (Lvl I)',
        hp: 120,
        attack: 18,
        defense: 8,
        speed: 12,
        tactics: 'aggressive',
      },
    ];

    return {
      id: `side_skirmish_${idx}_${Date.now()}_${Math.random()}`,
      name: `${cfg.prefix} (Bounty ${toRoman(idx + 1)})`,
      difficulty: cfg.difficulty,
      goldReward,
      description: cfg.desc,
      enemies: enemies.length > 0 ? enemies : fallbackEnemies,
    };
  });

  if (injectedFortifiedQuest) {
    return [injectedFortifiedQuest, ...standardBounties.slice(0, 2)];
  }
  return standardBounties;
}

export function getArrivalWelcomeLine(welcomer: Gladiator, newcomer: Gladiator): string {
  const wCult = welcomer.culture;
  const nCult = newcomer.culture;
  const wLvl = welcomer.level;
  const nLvl = newcomer.level;

  if (wCult === 'roman' && nCult === 'celt') {
    return 'A barbarian joins the ludus? Mind your back on the sands.';
  }
  if (wCult === 'celt' && nCult === 'roman') {
    return 'Keep your legionary pride out of my ring.';
  }
  if (wCult === 'berber' && nCult === 'hunnic') {
    return 'The desert wind meets the steppe riders.';
  }
  if (wCult === 'hunnic' && nCult === 'berber') {
    return 'Can your desert sandals match our cavalry speed?';
  }
  if (wCult === 'roman' && nCult === 'scythian') {
    return 'Steppe archers fight at our flank, not behind us.';
  }
  if (wCult === 'scythian' && nCult === 'roman') {
    return 'Your heavy shield wall is only as good as our arrows.';
  }
  if (wCult === nCult) {
    return `Another brother of ${CULTURE_LABELS[wCult].split(' ')[0]} blood! Welcome to the yard.`;
  }
  if (wLvl >= 3 && nLvl === 1) {
    return 'Survive your first bout, whelp, then we’ll speak.';
  }
  if (wLvl === 1 && nLvl >= 3) {
    return 'An honored veteran... I shall watch and learn from your blade.';
  }
  return 'Welcome to the ludus. Here, blood is our common currency.';
}

export function evaluatePepTalk(
  glad: Gladiator,
  tone: PepTalkTone,
  speechcraftLvl: number,
): PepTalkEvaluation {
  const wil = glad.attributes?.wil ?? 10;
  const isVeteran = glad.level >= 3;
  const isRookie = glad.level === 1;
  const traits = glad.traits || [];
  const firstName = (glad.name || 'Champion').split(' ')[0];

  // Pre-game speech buffs reduced by 50% for combat balance
  if (tone === 'INSPIRE') {
    // Proud trait risk & backfire mechanics:
    // If used on a Proud gladiator more than twice in succession (or base ~15% chance for Proud), it backfires!
    if (traits.includes('Proud')) {
      const prevInspireCount = glad.inspireCount || 0;
      const isOverused = prevInspireCount >= 2;
      const isProudBackfire = isOverused || Math.random() < 0.15;

      if (isProudBackfire) {
        glad.inspireCount = 0;
        return {
          statusCategory: 'SKEPTICAL',
          outcome: 'Petulant',
          buff: '-8% SPD (Petulant Distraction)',
          desc: `${firstName} scoffs at being lectured: "I fight for my own glory, Lanista, not your words!" and receives a petulant debuff (-8% SPD).`,
        };
      } else {
        glad.inspireCount = prevInspireCount + 1;
        return {
          statusCategory: 'INSPIRED',
          outcome: 'Inspire',
          buff: '+8% ATK & DEF (Inspired)',
          desc: `${firstName} accepts the noble challenge with fierce pride (+8% ATK & DEF for the bout).`,
        };
      }
    }

    glad.inspireCount = (glad.inspireCount || 0) + 1;
    if (isVeteran || wil >= 14 || traits.includes('Scarred Veteran') || traits.includes('Crowd Pleaser')) {
      const atkBuff = 8;
      return {
        statusCategory: 'INSPIRED',
        outcome: 'Inspire',
        buff: `+${atkBuff}% ATK & DEF`,
        desc: `${firstName} swells with honorable conviction! +${atkBuff}% ATK & DEF for the bout!`,
      };
    } else if (traits.includes('Claustrophobic') || traits.includes('Bloodthirsty')) {
      return {
        statusCategory: 'SKEPTICAL',
        outcome: 'Neutral',
        buff: 'Unmoved / Neutral',
        desc: `${firstName} shrugs off high-minded ideals: "Save the poetry for the crowd."`,
      };
    } else {
      return {
        statusCategory: 'INSPIRED',
        outcome: 'Resolve',
        buff: '+8% DEF & Morale',
        desc: `${firstName} nods solemnly, steeling their discipline (+8% DEF).`,
      };
    }
  } else if (tone === 'MOCK') {
    glad.inspireCount = 0;
    // Bloodlust / Rouse: Base 20% chance to cause reckless aggression
    // (deals +15% damage but takes +15% more damage / defense penalty).
    if (Math.random() < 0.20) {
      return {
        statusCategory: 'SKEPTICAL',
        outcome: 'Reckless',
        buff: '+15% ATK / -15% DEF (Reckless Aggression)',
        desc: `${firstName} flies into an undisciplined blind fury (+15% DMG dealt, but takes +15% more DMG / defense penalty)!`,
      };
    } else if (traits.includes('Proud') || isRookie || traits.includes('Bloodthirsty')) {
      return {
        statusCategory: 'INSPIRED',
        outcome: 'Rage',
        buff: '+15% CRIT & Fury',
        desc: `${firstName} glares with roused battle-joy and seething fury! Gains +15% Crit chance!`,
      };
    } else if (traits.includes('Insecure')) {
      return {
        statusCategory: 'DEMORALIZED',
        outcome: 'Rattled',
        buff: '-8% DEF',
        desc: `${firstName}'s hands tremble under humiliation. Rattled stance (-8% DEF).`,
      };
    } else {
      return {
        statusCategory: 'INSPIRED',
        outcome: 'Rage',
        buff: '+10% CRIT & Fury',
        desc: `${firstName} roars with defiance and sharpened battle edge (+10% Crit)!`,
      };
    }
  } else {
    // THREATEN / INTIMIDATE
    glad.inspireCount = 0;
    // Intimidate / Threaten: Base 25% chance to backfire!
    // Instead of obedience, causes resentment/panic (-10% morale & defense, slight attack delay).
    if (Math.random() < 0.25) {
      return {
        statusCategory: 'DEMORALIZED',
        outcome: 'Panic',
        buff: '-10% DEF & Delay (Resentful Panic)',
        desc: `${firstName} recoils with bitter resentment and panic (-10% DEF, attack delay)! "You rule by fear, Lanista, but fear breeds mutiny!"`,
      };
    } else {
      return {
        statusCategory: 'INSPIRED',
        outcome: 'Threatened',
        buff: '+15% DMG (Execution Contract)',
        desc: `${firstName} knows the cost of failure. Fights with lethal desperate frenzy (+15% DMG)!`,
      };
    }
  }
}


// ============================================================================
// ARENA COMBAT SPEECH BUBBLE DYNAMIC STRING GENERATOR
// Triggered on Kills, Pinning, Kiting/Baiting, and Pin Breakouts.
// Considers Culture, Health, Level, and Bonded Squadmates.
// ============================================================================

function getArenaCombatLine(
  fighter: ArenaFighter,
  trigger: 'kill' | 'pin' | 'kite' | 'release_pin',
  allFighters: ArenaFighter[],
  bonds: Record<string, number>,
): string {
  if (!fighter) return '';
  const candidates: string[] = [];
  const safeFighters = Array.isArray(allFighters) ? allFighters.filter(Boolean) : [];

  // Custom imperial combat cries if fighter is Emperor Aurelius
  if (fighter.isEmperor) {
    if (trigger === 'kill') {
      return Math.random() < 0.5 ? 'Rome kneels to me alone!' : 'Pathetic dust beneath my gilded boots!';
    }
    if (trigger === 'pin') {
      return Math.random() < 0.5 ? 'Kneel before your Emperor!' : 'Yield to divine imperial authority!';
    }
    if (trigger === 'release_pin') {
      return 'Unhand me, barbarian dog!';
    }
    return 'Tremble before the might of the Caesar!';
  }

  // Check closest bonded comrade in squad if gladiator has sourceGladiatorId
  let bondedComradeName: string | null = null;
  if (fighter.sourceGladiatorId) {
    let highestBond = -1;
    for (const other of safeFighters) {
      if (!other || other.id === fighter.id || !other.sourceGladiatorId) continue;
      const key = [fighter.sourceGladiatorId, other.sourceGladiatorId].sort().join('__');
      const score = (bonds && bonds[key]) ?? 15;
      if (score > highestBond && score >= 25) {
        highestBond = score;
        bondedComradeName = (other.name || 'Comrade').split(' ')[0];
      }
    }
  }

  if (trigger === 'kill') {
    // 1. Cultural kill declarations
    if (fighter.culture === 'roman') {
      candidates.push(
        'For the ludus!',
        'Order and iron prevail!',
        'Discipline breaks wild fury!',
        'The arena honors the legion!',
      );
    } else if (fighter.culture === 'celt') {
      candidates.push(
        'The soil drinks your life!',
        'Ancestors guide my blade!',
        'Broken on Gallic steel!',
        'Your soul joins the wind!',
      );
    } else if (fighter.culture === 'berber') {
      candidates.push(
        'Swift as the dune wind!',
        'Dust claims another!',
        'Too slow for desert steel!',
        'The sands sweep you away!',
      );
    } else if (fighter.culture === 'scythian') {
      candidates.push(
        'Steppe lance strikes true!',
        'Pierced through the heart!',
        'Distance is fatal!',
        'Returned to the plains!',
      );
    } else {
      // hunnic
      candidates.push(
        'Crushed under iron!',
        'Torn like winter grass!',
        'No one halts our raid!',
        'Felled by the war-band!',
      );
    }

    // Praising fallen worthy foe
    candidates.push('A worthy foe... rest now.', 'You fought with courage.');

    // Bonded comrade callout
    if (bondedComradeName) {
      candidates.push(
        `That was for you, ${bondedComradeName}!`,
        `${bondedComradeName}, watch them fall!`,
      );
    }

    // Low health kill cry
    if (fighter.hp < fighter.maxHp * 0.35) {
      candidates.push('Still breathing... still standing!', 'Not my day to fall!');
    }
  } else if (trigger === 'pin') {
    candidates.push(
      'Yield!',
      'Hold them!',
      'Strike now, brothers!',
      "Down! Don't let them rise!",
      'I have them pinned!',
    );
    if (fighter.culture === 'roman') {
      candidates.push('Shield lock! Finish them!', 'Under iron heel!');
    } else if (fighter.culture === 'celt') {
      candidates.push('Taste the arena dirt!', 'Got you in my grip!');
    } else if (fighter.culture === 'berber') {
      candidates.push('Nowhere to flee!', 'Trapped in the dunes!');
    } else if (fighter.culture === 'scythian') {
      candidates.push('Held fast! Strike now!', 'Pinned in place!');
    } else {
      candidates.push('Broke your stance!', 'Pinned like quarry!');
    }
  } else if (trigger === 'kite') {
    candidates.push(
      'Step into my reach!',
      'Not yet!',
      'Patience...',
      'Come closer if you dare!',
      'Overextended!',
      'Walk into my trap!',
      'Too eager!',
    );
  } else if (trigger === 'release_pin') {
    candidates.push(
      'Get off me!',
      'Still standing!',
      "You'll pay for that!",
      'Is that all you have?',
      'My footing holds!',
      'Back to my feet!',
    );
    if (fighter.culture === 'roman') {
      candidates.push('The legion stance never breaks!');
    } else if (fighter.culture === 'celt') {
      candidates.push('You cannot bind wild blood!');
    }
  }

  if (candidates.length === 0) return '';
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ============================================================================
// CLEAN ARENA DUEL BACKGROUND (Sandy Pit, Bleachers, Balcony)
// ============================================================================


// ============================================================================
// TRAVELING NOMAD MERCHANT SYSTEM & CARAVAN BAZAAR WARES
// Spawns with a 20% chance after arena fights when coliseumTier >= 2 (unlockedTierIndex >= 2).
// Walks in, unfolds a patterned Persian carpet with exotic wares, sits for ~15s,
// speaks ambient dialogue, and departs if not engaged.
// ============================================================================

export const INITIAL_MERCHANT_STATE: TravelingMerchantState = {
  active: false,
  state: 'entering',
  x: 24,
  y: 110,
  targetX: 180,
  targetY: 106,
  sitTimer: 22.0,
  hasPlayedSitSpeech: false,
  hasPlayedDepartSpeech: false,
  flipX: false,
  animTimer: 0,
};

// ============================================================================
// STYLIZED PIXEL ART POST-BATTLE VICTORY AFTERMATH MODAL
// Features 32x32 detailed cultural portraits, segmented 10-pip blue XP bar
// with black interior borders, 10-pip yellow bonding bar, pip-by-pip fill animation,
// white flash and special fanfare on 10th pip, and Roman numeral level particle burst!
// ============================================================================

function VictoryAftermathModal({
  aftermathData,
  onProceed,
  onReturnToCamp,
}: {
  aftermathData: AftermathData;
  onProceed: () => void;
  onReturnToCamp: () => void;
}) {
  const members = aftermathData.partyMembers;

  const [currentLevels, setCurrentLevels] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => {
      map[m.id] = m.startLevel;
    });
    return map;
  });

  const [currentPips, setCurrentPips] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => {
      const isDead = m.hpRemaining <= 0;
      const pips = isDead
        ? Math.min(10, Math.floor((m.startXp / m.xpNeeded) * 10))
        : Math.min(9, Math.floor((m.startXp / m.xpNeeded) * 10));
      map[m.id] = pips;
    });
    return map;
  });

  const [currentBondPips, setCurrentBondPips] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => {
      map[m.id] = m.startBondPips;
    });
    return map;
  });

  const [isFlashing, setIsFlashing] = useState<Record<string, boolean>>({});
  const [leveledUp, setLeveledUp] = useState<Record<string, boolean>>({});
  const [particleFlash, setParticleFlash] = useState<Record<string, boolean>>({});
  const [particleFading, setParticleFading] = useState<Record<string, boolean>>({});
  const [isAnimComplete, setIsAnimComplete] = useState(false);

  // Animation Step Interval
  useEffect(() => {
    let timer: any;
    const startDelay = setTimeout(() => {
      timer = setInterval(() => {
        let allDone = true;

        setCurrentPips((prevPips) => {
          const nextPips = { ...prevPips };

          members.forEach((m) => {
            const isDead = m.hpRemaining <= 0;
            // DEAD GLADIATORS DO NOT GAIN ANY XP OR ADVANCE PROGRESS BARS!
            if (isDead) return;

            const hasLvl = leveledUp[m.id];
            const curP = prevPips[m.id] ?? 0;

            if (m.didLevelUp && !hasLvl) {
              if (curP < 10) {
                allDone = false;
                nextPips[m.id] = curP + 1;
                gameAudio.playHoverMicroTone();
                if (curP + 1 === 10) {
                  // Reached 10th pip: flash white & special SFX & particles
                  setIsFlashing((f) => ({ ...f, [m.id]: true }));
                  setParticleFlash((p) => ({ ...p, [m.id]: true }));
                  gameAudio.playLevelUpStinger();
                  setLeveledUp((l) => ({ ...l, [m.id]: true }));
                  setCurrentLevels((lvls) => ({ ...lvls, [m.id]: m.endLevel }));

                  setTimeout(() => {
                    setIsFlashing((f) => ({ ...f, [m.id]: false }));
                    // Set to surplus XP pips
                    setCurrentPips((p) => ({
                      ...p,
                      [m.id]: Math.min(
                        10,
                        Math.floor((m.endXp / Math.floor(m.xpNeeded * 1.5)) * 10),
                      ),
                    }));
                  }, 300);
                }
              }
            } else if (m.didLevelUp && hasLvl) {
              const targetP = Math.min(
                10,
                Math.floor((m.endXp / Math.floor(m.xpNeeded * 1.5)) * 10),
              );
              if (curP < targetP) {
                allDone = false;
                nextPips[m.id] = curP + 1;
                gameAudio.playHoverMicroTone();
              }
            } else {
              const targetP = Math.min(10, Math.floor((m.endXp / m.xpNeeded) * 10));
              if (curP < targetP) {
                allDone = false;
                nextPips[m.id] = curP + 1;
                gameAudio.playHoverMicroTone();
              }
            }
          });

          return nextPips;
        });

        // Step Bonding Pips
        setCurrentBondPips((prevBond) => {
          const nextBond = { ...prevBond };
          members.forEach((m) => {
            const isDead = m.hpRemaining <= 0;
            // DEAD GLADIATORS DO NOT GAIN ANY BOND INCREASES!
            if (isDead) return;

            const curB = prevBond[m.id] ?? 0;
            if (curB < m.endBondPips) {
              allDone = false;
              nextBond[m.id] = curB + 1;
            }
          });
          return nextBond;
        });

        if (allDone) {
          setIsAnimComplete(true);
          clearInterval(timer);
        }
      }, 160);
    }, 400);

    return () => {
      clearTimeout(startDelay);
      clearInterval(timer);
    };
  }, [members, leveledUp]);

  // Instant Fast Forward
  const skipAnimation = () => {
    const finalLevels: Record<string, number> = {};
    const finalPips: Record<string, number> = {};
    const finalBond: Record<string, number> = {};

    members.forEach((m) => {
      const isDead = m.hpRemaining <= 0;
      finalLevels[m.id] = m.endLevel;
      if (isDead) {
        finalPips[m.id] = Math.min(10, Math.floor((m.startXp / m.xpNeeded) * 10));
        finalBond[m.id] = m.startBondPips;
      } else {
        const targetP = m.didLevelUp
          ? Math.min(10, Math.floor((m.endXp / Math.floor(m.xpNeeded * 1.5)) * 10))
          : Math.min(10, Math.floor((m.endXp / m.xpNeeded) * 10));
        finalPips[m.id] = targetP;
        finalBond[m.id] = m.endBondPips;
      }
    });

    setCurrentLevels(finalLevels);
    setCurrentPips(finalPips);
    setCurrentBondPips(finalBond);
    setIsFlashing({});
    setParticleFlash({});
    setParticleFading({});
    setIsAnimComplete(true);
    gameAudio.playCrispClick();
  };

  return (
    <div className="absolute inset-0 bg-[#090d16]/90 flex flex-col items-center justify-center p-3 md:p-6 z-40 pointer-events-auto overflow-y-auto animate-fadeIn transition-opacity duration-300">
      <div className="relative bg-[#2A1B19] border-4 border-[#8C7A6B] p-5 md:p-7 rounded-xl max-w-xl w-full text-left shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Pixel Corner Rivets */}
        <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
        <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

        {/* Victory Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase text-[#cb9f6b] font-bold">
              Imperial Coliseum Chronicle
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-wide text-[#ded095]">
              VICTORY IN THE ARENA SANDS
            </h2>
          </div>
          <div className="text-right">
            <span className="text-sm md:text-base text-[#ded095] font-black block">
              +{aftermathData.goldEarned} Gold
            </span>
          </div>
        </div>

        {/* Party Gladiators Progression Section (Only Gladiators in the Party) */}
        <div className="mb-4">
          <div className="text-xs font-bold text-[#ded095] flex items-center justify-between mb-2 pb-1 border-b border-[#7f644b]/50">
            <span className="flex items-center gap-1.5">
              <span>⚔️ Party Champions Progression ({members.length}):</span>
            </span>
            <span className="text-[10px] text-[#a4968d]">
              XP & Morale Bars (10-Segmented)
            </span>
          </div>

          <div className="space-y-3">
            {members.map((glad) => {
              const isDead = glad.hpRemaining <= 0;
              const pips = currentPips[glad.id] ?? 0;
              const bondP = currentBondPips[glad.id] ?? 0;
              const level = currentLevels[glad.id] ?? glad.startLevel;
              const flash = !isDead && (isFlashing[glad.id] ?? false);
              const particles = !isDead && (particleFlash[glad.id] ?? false);

              return (
                <div
                  key={glad.id}
                  className={`border-2 p-3 rounded-lg flex items-center gap-3.5 shadow-md ${
                    isDead
                      ? 'bg-[#2a2428] border-[#9e4a42]/70'
                      : 'bg-[#3f363b] border-[#7f644b]'
                  }`}>
                  {/* Gladiator 32x32 Detailed Portrait (Dimmed + Prominent Pixel Skull Icon if dead) */}
                  <div
                    className={`relative w-16 h-16 shrink-0 bg-[#2d272a] border-2 rounded p-0.5 shadow-inner ${
                      isDead
                        ? 'border-[#9e4a42] opacity-50 grayscale filter brightness-75'
                        : 'border-[#9c8053]'
                    }`}>
                    <img
                      src={getPortraitDataUrl(glad.culture, 64, false, undefined, level, isDead, glad.heroType, glad.gladiatorClass)}
                      alt={glad.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    {isDead && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                        <div className="w-8 h-8 flex items-center justify-center bg-black/70 rounded-full border border-[#9e4a42]">
                          <svg viewBox="0 0 16 16" className="w-6 h-6 text-[#ded095] fill-current drop-shadow" style={{ imageRendering: 'pixelated' }}>
                            <path d="M5 2h6v1h2v3h1v4h-2v1h-1v2H9v-1H7v1H5v-2H4v-1H2V6h1V3h2V2zm0 4v2h2V6H5zm4 0v2h2V6H9zm-2 4v1h2v-1H7z" />
                          </svg>
                        </div>
                        <span className="text-[7px] font-black text-[#ded095] bg-[#9e4a42] px-1 py-0.2 rounded mt-0.5 uppercase tracking-wider">
                          DEAD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info and 10-Segmented Bars */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-sm text-[#ded095] truncate">
                        {glad.name}
                      </div>
                      <div className="text-[10px] text-[#cb9f6b]">
                        {CULTURE_LABELS[glad.culture]}
                      </div>
                    </div>

                    {/* Blue XP Bar (10 Black Interior Borders - Freezes if dead) */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[10px] font-bold mb-0.5">
                        <span className={isDead ? 'text-[#a4968d]' : 'text-[#60a5fa]'}>
                          {isDead ? '💀 NO XP GAINED (DEAD)' : 'XP PROGRESS'}
                        </span>
                        <span className="text-[#a4968d]">
                          {!isDead && glad.xpGained > 0 ? `+${glad.xpGained} XP` : '0 XP'}
                        </span>
                      </div>
                      <div
                        className={`h-3.5 w-full bg-[#1e232a] border-2 border-black rounded-none grid grid-cols-10 overflow-hidden shadow-inner ${
                          flash ? 'bg-white brightness-200 ring-2 ring-white' : ''
                        }`}>
                        {Array.from({ length: 10 }).map((_, pipIdx) => {
                          const isFilled = pipIdx < pips;
                          return (
                            <div
                              key={pipIdx}
                              className={`h-full border-r border-black last:border-r-0 transition-colors duration-100 ${
                                isDead
                                  ? 'bg-[#2a303c]'
                                  : flash
                                    ? 'bg-white'
                                    : isFilled
                                      ? 'bg-gradient-to-b from-[#60a5fa] to-[#2563eb]'
                                      : 'bg-[#2a303c]'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Yellow Bonding / Morale Bar (10 Black Interior Borders - Freezes if dead) */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold mb-0.5">
                        <span className={isDead ? 'text-[#a4968d]' : 'text-[#fef08a]'}>
                          {isDead ? '💀 BOND FROZEN (PERISHED)' : 'BOND / MORALE'}
                        </span>
                        <span className="text-[#a4968d]">
                          {!isDead && glad.endBondPips > glad.startBondPips ? '+Bond' : ''}
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-[#1e232a] border-2 border-black rounded-none grid grid-cols-10 overflow-hidden shadow-inner">
                        {Array.from({ length: 10 }).map((_, pipIdx) => {
                          const isFilled = pipIdx < bondP;
                          return (
                            <div
                              key={pipIdx}
                              className={`h-full border-r border-black last:border-r-0 transition-colors duration-100 ${
                                isDead
                                  ? 'bg-[#2a303c]'
                                  : isFilled
                                    ? 'bg-gradient-to-b from-[#fef08a] to-[#eab308]'
                                    : 'bg-[#2a303c]'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Core Attributes (STR / DEX / VIT) & Level-Up Stat Gains */}
                    <div className="mt-2 pt-1.5 border-t border-[#7f644b]/40 flex flex-col gap-1">
                      {glad.didLevelUp && glad.statGains && (
                        <div className="bg-[#2A1B19] border border-[#ded095] rounded px-2 py-1 flex items-center justify-between text-[10px] shadow-sm animate-fadeIn">
                          <span className="font-serif font-black text-[#ded095] flex items-center gap-1">
                            <span>⭐ STATS INCREASED:</span>
                          </span>
                          <div className="flex items-center gap-2 font-mono font-bold">
                            <span className="text-[#ded095]">+{glad.statGains.str} STR (ATK)</span>
                            <span className="text-[#88997a]">+{glad.statGains.dex} DEX (SPD)</span>
                            <span className="text-[#55796f]">+{glad.statGains.vit} VIT (HP)</span>
                          </div>
                        </div>
                      )}
                      {glad.newStats && (
                        <div className="flex items-center justify-between text-[10px] text-[#cb9f6b] font-mono px-1">
                          <span title="Strength: Melee Attack Power">STR: <strong className="text-[#ded095]">{glad.newStats.str}</strong> (ATK)</span>
                          <span title="Dexterity: Attack Speed & Cooldown Recovery">DEX: <strong className="text-[#88997a]">{glad.newStats.dex}</strong> (SPD)</span>
                          <span title="Vitality: Max HP Pool">VIT: <strong className="text-[#55796f]">{glad.newStats.vit}</strong> (HP)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Roman Numeral Level Badge with Particle Sparkle Effect */}
                  <div className="relative flex flex-col items-center justify-center pl-3 pr-2 min-w-[3.8rem] self-center">
                    <span className="text-[9px] text-[#a4968d] font-bold tracking-wider">
                      {isDead ? 'STATUS' : 'LEVEL'}
                    </span>
                    <div className="relative">
                      {isDead ? (
                        <span className="text-sm font-black text-[#9e4a42] font-serif tracking-widest">
                          FALLEN
                        </span>
                      ) : (
                        <span
                          className={`text-xl sm:text-2xl font-black font-serif tracking-widest transition-all duration-200 ${
                            flash ? 'text-white scale-125' : 'text-[#ded095]'
                          }`}>
                          {toRoman(level)}
                        </span>
                      )}

                      {/* Golden Sparkle Aura Effect on Level Up (Active 2.8s, smoothly fading alpha to 0) */}
                      {particles && (
                        <div
                          style={{
                            opacity: particleFading[glad.id] ? 0 : 1,
                            transition: 'opacity 1.0s ease-out',
                          }}
                          className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="absolute -top-3 -left-3 w-1.5 h-1.5 bg-[#fef08a] animate-ping" />
                          <span className="absolute -top-2 right-[-8px] w-2 h-2 bg-white animate-bounce" />
                          <span className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-[#60a5fa] animate-ping" />
                          <span className="absolute -bottom-3 right-[-6px] w-2 h-2 bg-[#fbbf24] animate-pulse" />
                          <span className="absolute top-0 -right-4 w-1.5 h-1.5 bg-white animate-ping" />
                          <span className="absolute -top-4 left-1 w-1.5 h-1.5 bg-[#fef08a] animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Recap */}
        {aftermathData.narratives.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-bold text-[#ded095] mb-1">
              📜 Witnessed by the Ludus:
            </div>
            <div className="bg-[#3f363b] border border-[#7f644b] rounded p-2.5 space-y-1">
              {aftermathData.narratives.map((nar, idx) => (
                <p key={idx} className="text-xs text-[#ded095] italic">
                  "{nar}"
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions - Direct Return to Camp for Side Skirmishes vs Podium Ascent for Coliseum Trials */}
        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-[#7f644b]">
          {!isAnimComplete && (
            <button
              onClick={skipAnimation}
              className="bg-[#3f363b] hover:bg-[#574b50] text-[#a4968d] hover:text-[#ded095] font-bold text-xs py-2 px-3 rounded border border-[#7f644b] transition">
              Fast Forward ⏩
            </button>
          )}

          {aftermathData.isTrial ? (
            <button
              onClick={onProceed}
              className="w-full flex-1 bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-3 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] min-h-[44px] cursor-pointer">
              <span>🏛️ Ascend Coliseum Podium ➔</span>
            </button>
          ) : (
            <button
              onClick={onReturnToCamp}
              className="w-full flex-1 bg-[#55796f] hover:bg-[#88997a] text-[#ded095] font-black py-3 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#88997a] min-h-[44px] cursor-pointer">
              <span>🏕️ Return to Camp Courtyard ➔</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

class GameErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean; error: Error | null}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GameErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{fontFamily: "'Cinzel', Georgia, serif"}}
          className="fixed inset-0 bg-[#3f363b] text-[#ded095] flex flex-col items-center justify-center p-6 text-center select-none z-50">
          <div className="bg-[#574b50] border-4 border-[#9e4a42] p-6 rounded-xl max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-[#9e4a42] mb-3">
              LUDUS RESTORATION
            </h2>
            <p className="text-xs text-[#ded095] mb-4">
              An unexpected disturbance struck the arena grounds. The ludus can be safely restored.
            </p>
            <button
              onClick={() => {
                this.setState({hasError: false, error: null});
                window.location.reload();
              }}
              className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold px-6 py-2.5 rounded-lg text-sm shadow cursor-pointer">
              Restore Ludus Campaign
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const INITIAL_JUDGMENT_STATE: JudgmentState = {
  active: false,
  phase: 'hold',
  startTime: 0,
  cameraPanY: 0,
  verdict: 'thumbs_up',
  isPlayerVictorious: true,
  isTrial: true,
  hasDownedGlads: false,
  downedGladIds: [],
  audioTriggered: { build: false, cheer: false, slash: false, murmur: false, executionRoar: false },
};

// APP_START_LINE

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();
  const isMobile = useIsMobile();
  const isCurrentBattleTrialRef = useRef<boolean>(true);
  const screenShakeTimerRef = useRef<number>(0);

  // Create 344x192 offscreen canvas once
  if (!offscreenCanvasRef.current && typeof document !== 'undefined') {
    const off = document.createElement('canvas');
    off.width = LOGIC_WIDTH;
    off.height = LOGIC_HEIGHT;
    offscreenCanvasRef.current = off;
  }

  // SDK & Lifecycle
  const {sdk} = usePlayground();

  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs') as number;
    const maxSubSteps = getConfig('maxSubSteps') as number;
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // --- Main React States ---
  // Cinematic Intro State Machine:
  // 0 = Phase 1: The Manager (hold ~3s, fade out)
  // 1 = Phase 2 & 3: The Approach & The Pan-Up
  // 2 = Phase 4: The Title
  // 3 = Phase 5: The Monologue (Visual Novel UI + Typewriter)
  // 4 = Main Game
  const [cinematicState, setCinematicState] = useState<number>(0);
  const cinematicStateRef = useRef<number>(0);
  cinematicStateRef.current = cinematicState;
  const cinematicPhaseStartTimeRef = useRef<number>(getSafeNow());
  const typewriterCharCountRef = useRef<number>(0);
  const typewriterCharTimerRef = useRef<number>(0);
  const isTypewriterDoneRef = useRef<boolean>(false);
  const emperorStabFiredRef = useRef<boolean>(false);

  const [gameState, setGameState] = useState<GameState>({
    status: 'PLAYING',
    score: SAVE_SCHEMA.score.initial(),
    level: 1,
    gold: SAVE_SCHEMA.gold.initial(),
  });

  // Camp Shooting Star Rare Engine (500 - 1000s or on death of veteran warrior >= lvl 3)
  const campShootingStarTimerRef = useRef<number>(500 + Math.random() * 500);
  const campShootingStarActiveDurationRef = useRef<number>(0);
  const pendingMournfulShootingStarRef = useRef<boolean>(false);

  // Lanista Manager Retro Simulation Cascading Menu State
  const [isManagerMenuOpen, setIsManagerMenuOpen] = useState<boolean>(false);
  const [activeCascadingSubMenu, setActiveCascadingSubMenu] = useState<
    'none' | 'motivate' | 'intimidate' | 'scout'
  >('none');
  const [rosterTab, setRosterTab] = useState<'champions' | 'manager'>('champions');

  // Ghost Flash Easter Egg & Psychological Escalation
  const [ghostFlashClicks, setGhostFlashClicks] = useState<number>(0);
  const ghostFlashClicksRef = useRef<number>(0);
  ghostFlashClicksRef.current = ghostFlashClicks;
  const lastCampPointerAtRef = useRef(0);
  const etherealSparksRef = useRef<EtherealSpark[]>([]);

  // Dynamic Arena Crowd Acoustic Progression Timer
  const crowdAudioTimerRef = useRef<number>(2.0);

  // Ludus Facility Upgrades, Manager Stamina & Renown
  const [ludusUpgrades, setLudusUpgrades] = useState<LudusUpgrades>(SAVE_SCHEMA.ludusUpgrades.initial());
  const [isUpgradesModalOpen, setIsUpgradesModalOpen] = useState<boolean>(false);
  const [managerStamina, setManagerStamina] = useState<number>(100);
  const managerStaminaRef = useRef<number>(100);
  managerStaminaRef.current = managerStamina;
  const [managerRenown, setManagerRenown] = useState<number>(SAVE_SCHEMA.managerRenown.initial());
  const [speechcraftLevel, setSpeechcraftLevel] = useState<number>(SAVE_SCHEMA.speechcraftLevel.initial());
  const [isBreedingModalOpen, setIsBreedingModalOpen] = useState<boolean>(false);
  const [selectedParent1Id, setSelectedParent1Id] = useState<string | null>(null);
  const [selectedParent2Id, setSelectedParent2Id] = useState<string | null>(null);

  // Feast Mechanics & Third Pedestal Victory Return States
  const [isFeastUnlocked, setIsFeastUnlocked] = useState<boolean>(SAVE_SCHEMA.isFeastUnlocked.initial());
  const isFeastUnlockedRef = useRef<boolean>(false);
  isFeastUnlockedRef.current = isFeastUnlocked;
  const [feastState, setFeastState] = useState<CampFeastState | null>(null);
  const feastStateRef = useRef<CampFeastState | null>(null);
  feastStateRef.current = feastState;
  const [feastSlaves, setFeastSlaves] = useState<FeastSlaveNpc[]>([]);
  const feastSlavesRef = useRef<FeastSlaveNpc[]>([]);
  feastSlavesRef.current = feastSlaves;
  const hasCompletedThirdPedestalRef = useRef<boolean>(false);
  const pendingThirdPedestalFeastRef = useRef<boolean>(false);
  const [isFeastOfferPending, setIsFeastOfferPending] = useState<boolean>(false);
  const isFeastOfferPendingRef = useRef<boolean>(false);
  isFeastOfferPendingRef.current = isFeastOfferPending;

  // Dynamic Camp Visitors (Merchants, Scouts, Patrons, Rivals)
  const [currentVisitor, setCurrentVisitor] = useState<DynamicVisitor | null>(null);
  const visitorTimerRef = useRef<number>(25 + Math.random() * 20);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState<boolean>(false);
  const [visitorWalkingNpc, setVisitorWalkingNpc] = useState<VisitorWalkingNpcState | null>(null);
  const visitorWalkingNpcRef = useRef<VisitorWalkingNpcState | null>(null);
  visitorWalkingNpcRef.current = visitorWalkingNpc;

  // Manager Action Bars & Cooldowns
  const [physicianCost, setPhysicianCost] = useState<number>(SAVE_SCHEMA.physicianCost.initial());
  const physicianCostRef = useRef<number>(50);
  physicianCostRef.current = physicianCost;

  const [physicianNpc, setPhysicianNpc] = useState<PhysicianNpcState>(INITIAL_PHYSICIAN_STATE);
  const physicianNpcRef = useRef<PhysicianNpcState>(INITIAL_PHYSICIAN_STATE);
  physicianNpcRef.current = physicianNpc;

  const [campActionCooldowns, setCampActionCooldowns] = useState<{
    inspire: number;
    punish: number;
    physician: number;
    study: number;
  }>({ inspire: 0, punish: 0, physician: 0, study: 0 });
  const [scoutingInsightActive, setScoutingInsightActive] = useState<boolean>(false);

  const [arenaActionCooldowns, setArenaActionCooldowns] = useState<{
    shout: number;
    sand: number;
    stimulant: number;
    retreatUsed: boolean;
  }>({ shout: 0, sand: 0, stimulant: 0, retreatUsed: false });

  // Pre-Match Pep Talk Staging Room Cinematic State
  const [pepTalkState, setPepTalkState] = useState<{
    active: boolean;
    pendingTier: BattleTier | null;
    isTrial: boolean;
    addressedGladiatorIds: string[];
    talkOutcomes: Record<string, { tone: PepTalkTone } & PepTalkEvaluation>;
  } | null>(null);

  const [mode, setMode] = useState<'camp' | 'arena' | 'podium'>('camp');
  const [unlockedTierIndex, setUnlockedTierIndex] = useState<number>(SAVE_SCHEMA.unlockedTierIndex.initial());
  const [isColiseumChampion, setIsColiseumChampion] = useState<boolean>(SAVE_SCHEMA.isColiseumChampion.initial());
  const [isEmperorEnraged, setIsEmperorEnraged] = useState<boolean>(SAVE_SCHEMA.isEmperorEnraged.initial());
  const isEmperorEnragedRef = useRef<boolean>(false);
  isEmperorEnragedRef.current = isEmperorEnraged;
  const [isEmperorDefeated, setIsEmperorDefeated] = useState<boolean>(SAVE_SCHEMA.isEmperorDefeated.initial());
  const isEmperorDefeatedRef = useRef<boolean>(false);
  isEmperorDefeatedRef.current = isEmperorDefeated;
  const [isRevoltUnlocked, setIsRevoltUnlocked] = useState<boolean>(SAVE_SCHEMA.isRevoltUnlocked.initial());
  const isRevoltUnlockedRef = useRef<boolean>(false);
  isRevoltUnlockedRef.current = isRevoltUnlocked;
  const [isEmperorDuel, setIsEmperorDuel] = useState<boolean>(false);
  const isEmperorDuelRef = useRef<boolean>(false);
  isEmperorDuelRef.current = isEmperorDuel;
  const [isEmperorDuelModalOpen, setIsEmperorDuelModalOpen] = useState<boolean>(false);
  const [emperorDuelSelectedGladId, setEmperorDuelSelectedGladId] = useState<string | null>(null);
  const emperorDuelSelectedGladIdRef = useRef<string | null>(null);
  const [isRevoltCelebrationOpen, setIsRevoltCelebrationOpen] = useState<boolean>(false);

  // Hero Arrival Lore "Hear Tale" State
  const [heroArrivalModal, setHeroArrivalModal] = useState<HeroArrivalModalState | null>(null);
  const heroArrivalModalRef = useRef<HeroArrivalModalState | null>(null);
  heroArrivalModalRef.current = heroArrivalModal;

  // Post-Fifth Podium Gladiator Keeper Narrative Dialogue State (3 Panels)
  const [keeperSequence, setKeeperSequence] = useState<{
    active: boolean;
    panelIndex: 0 | 1 | 2;
    charCount: number;
    charTimer: number;
    isDone: boolean;
  } | null>(null);
  const keeperSequenceRef = useRef(keeperSequence);
  keeperSequenceRef.current = keeperSequence;
  const pendingPostFifthDialogueRef = useRef<boolean>(false);

  // Overall Campaign Chronicles Statistics
  const [totalRecruited, setTotalRecruited] = useState<number>(SAVE_SCHEMA.totalRecruited.initial());
  const totalRecruitedRef = useRef<number>(1);
  totalRecruitedRef.current = totalRecruited;

  const [totalBattlesWon, setTotalBattlesWon] = useState<number>(SAVE_SCHEMA.totalBattlesWon.initial());
  const totalBattlesWonRef = useRef<number>(0);
  totalBattlesWonRef.current = totalBattlesWon;
  const [podiumGladiators, setPodiumGladiators] = useState<Gladiator[]>([]);
  const podiumGladiatorsRef = useRef<Gladiator[]>([]);
  podiumGladiatorsRef.current = podiumGladiators;
  const podiumTimerRef = useRef<number>(0);
  const podiumHasIgnitedRef = useRef<boolean>(false);
  const podiumFlashTimerRef = useRef<number>(0);
  const handleAdvanceFromPodiumRef = useRef<() => void>(() => {});

  const [judgmentState, setJudgmentState] = useState<JudgmentState>(INITIAL_JUDGMENT_STATE);
  const judgmentStateRef = useRef<JudgmentState>(INITIAL_JUDGMENT_STATE);
  judgmentStateRef.current = judgmentState;
  const [memorialGraves, setMemorialGraves] = useState<MemorialGrave[]>(SAVE_SCHEMA.memorialGraves.initial());
  const [hoveredGraveId, setHoveredGraveId] = useState<string | null>(null);
  const [selectedGraveId, setSelectedGraveId] = useState<string | null>(null);

  // Battlefield Loot Drop State
  const [battlefieldLoot, setBattlefieldLoot] = useState<BattlefieldLootState | null>(null);

  // Traveling Nomad Merchant State
  const [merchantState, setMerchantState] = useState<TravelingMerchantState>(INITIAL_MERCHANT_STATE);
  const merchantStateRef = useRef<TravelingMerchantState>(INITIAL_MERCHANT_STATE);
  merchantStateRef.current = merchantState;

  // Zealous Devotee Camp Visitor State (Approved name from safeguard)
  const [devoteeState, setDevoteeState] = useState<DevoteeState>(INITIAL_DEVOTEE_STATE);
  const devoteeStateRef = useRef<DevoteeState>(INITIAL_DEVOTEE_STATE);
  devoteeStateRef.current = devoteeState;

  // Camp Day/Night and Weather State
  const campTimeOfDayRef = useRef<number>(35); // 0 to 120s
  const [campWeather, setCampWeather] = useState<'clear' | 'rain'>(SAVE_SCHEMA.weather.initial());
  const campWeatherRef = useRef<'clear' | 'rain'>('clear');
  campWeatherRef.current = campWeather;

  // Day / Date Counter & Autosave Persistence Engine
  const [dayCounter, setDayCounter] = useState<number>(SAVE_SCHEMA.day.initial());
  const dayCounterRef = useRef<number>(1);
  dayCounterRef.current = dayCounter;

  // Diegetic Autosave Indicator State (2.5s gentle fade out)
  const [autosaveVisible, setAutosaveVisible] = useState<boolean>(false);
  const [autosaveKey, setAutosaveKey] = useState<number>(0);
  const autosaveTimeoutRef = useRef<any>(null);
  const [hasExistingSave, setHasExistingSave] = useState<boolean>(() => {
    try {
      return typeof localStorage !== 'undefined' && !!localStorage.getItem(SAVE_KEY);
    } catch (_) {
      return false;
    }
  });

  // Camp Bandit Raid State
  const isBanditRaidRef = useRef<boolean>(false);
  const [isBanditAlarmOpen, setIsBanditAlarmOpen] = useState<boolean>(false);

  // Stylized White Pixel Slash & Blade Clash VFX Ref
  const slashVfxRef = useRef<SlashVFX[]>([]);

  // Roman Civilian Courier State (dispatched when summons approaches)
  const [courierNpcState, setCourierNpcState] = useState<CourierNpcState>(INITIAL_COURIER_STATE);
  const courierNpcRef = useRef<CourierNpcState>(INITIAL_COURIER_STATE);
  courierNpcRef.current = courierNpcState;
  const [hoveredCampObject, setHoveredCampObject] = useState<'tent' | 'weaponRack' | 'dummy' | 'bell' | 'merchant' | 'stewardess' | 'visitor' | null>(null);
  const hoveredCampObjectRef = useRef<'tent' | 'weaponRack' | 'dummy' | 'bell' | 'merchant' | 'stewardess' | 'visitor' | null>(null);
  hoveredCampObjectRef.current = hoveredCampObject;
  const [isHeraldSummonsOpen, setIsHeraldSummonsOpen] = useState<boolean>(false);
  const heraldTimerRef = useRef<number>(999); // Will be set to 7.5s after tutorial conclusion
  // HERE_IS_THE_DECLARATION
  const [isTrialBellModalOpen, setIsTrialBellModalOpen] = useState<boolean>(false); // TEST_OCCURRENCE_1_CHECK
  const isTrialBellModalOpenRef = useRef<boolean>(false);
  isTrialBellModalOpenRef.current = isTrialBellModalOpen;
  const [isCurrentBattleTrial, setIsCurrentBattleTrial] = useState<boolean>(true);
  const [respiteCount, setRespiteCount] = useState<number>(0);
  const respiteCountRef = useRef<number>(0);
  respiteCountRef.current = respiteCount;

  // Tutorial State Flags & Animation Controls
  const [tutorialStage, setTutorialStage] = useState<TutorialStage>('idle');
  const tutorialStageRef = useRef<TutorialStage>('idle');
  tutorialStageRef.current = tutorialStage;

  // Debug Menu State ('Z' key)
  const [isDebugMenuOpen, setIsDebugMenuOpen] = useState(false);
  const [debugSpawnLevel, setDebugSpawnLevel] = useState<number>(1);

  const [firstBattleDone, setFirstBattleDone] = useState<boolean>(SAVE_SCHEMA.firstBattleDone.initial());
  const firstBattleDoneRef = useRef<boolean>(false);
  firstBattleDoneRef.current = firstBattleDone;

  const [postBattleStage, setPostBattleStage] = useState<PostBattleTutorialStage>('none');
  const postBattleStageRef = useRef<PostBattleTutorialStage>('none');
  postBattleStageRef.current = postBattleStage;
  const postBattleTimerRef = useRef<number>(0);

  const pendingPostBattleTutorialRef = useRef<boolean>(false);
  const [freeRecruitCultures, setFreeRecruitCultures] = useState<Culture[]>([]);
  const freeRecruitCulturesRef = useRef<Culture[]>([]);
  freeRecruitCulturesRef.current = freeRecruitCultures;

  // Camera & Spotlight Animation Refs (Center on tent (64, 78) / rack (175, 84))
  const camZoomRef = useRef<number>(1.0);
  const camXRef = useRef<number>(LOGIC_WIDTH / 2);
  const camYRef = useRef<number>(LOGIC_HEIGHT / 2);
  const dimAlphaRef = useRef<number>(0.0);
  const spotRadiusRef = useRef<number>(0);
  const spotXRef = useRef<number>(64);
  const spotYRef = useRef<number>(78);
  const sparkleTimerRef = useRef<number>(0);

  // Typewriter audio & text refs for tutorial
  const tutCharCountRef = useRef<number>(0);
  const tutCharTimerRef = useRef<number>(0);
  const tutIsLineDoneRef = useRef<boolean>(false);

  const postTutCharCountRef = useRef<number>(0);
  const postTutCharTimerRef = useRef<number>(0);
  const postTutIsLineDoneRef = useRef<boolean>(false);
  const postTutLineDoneRef = postTutIsLineDoneRef;

  const tutorialIdleTimerRef = useRef<number>(0);
  const tutorialWineTimerRef = useRef<number>(0);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isBattlesModalOpen, setIsBattlesModalOpen] = useState(false);
  const [deploymentTier, setDeploymentTier] = useState<BattleTier | null>(null);
  const deploymentTierRef = useRef<BattleTier | null>(null);
  deploymentTierRef.current = deploymentTier;
  const [sideSkirmishes, setSideSkirmishes] = useState<BattleTier[]>(() =>
    generateSideSkirmishes(1, false, [INITIAL_GLADIATORS[0]]),
  );
  const [isArmoryModalOpen, setIsArmoryModalOpen] = useState(false);
  const [armoryTab, setArmoryTab] = useState<'armoria' | 'inventory' | 'bazaar'>('armoria');
  const [playerInventory, setPlayerInventory] = useState<string[]>(SAVE_SCHEMA.playerInventory.initial());
  const [activeEquipSelector, setActiveEquipSelector] = useState<{
    gladId: string;
    slot: 'RIGHT' | 'LEFT';
  } | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isBondingModalOpen, setIsBondingModalOpen] = useState(false);
  const [isQuestBoardOpen, setIsQuestBoardOpen] = useState(false);
  const [activeQuestNode, setActiveQuestNode] = useState<QuestNode | null>(null);
  const [selectedQuestGladId, setSelectedQuestGladId] = useState<string | null>(null);
  const [activeExpeditions, setActiveExpeditions] = useState<ActiveQuestExpedition[]>([]);
  const [questResolution, setQuestResolution] = useState<QuestResolutionModalState | null>(null);
  const [courierNotice, setCourierNotice] = useState<CourierNoticeState | null>(null);
  const courierTimerRef = useRef<number>(55);
  const [unlockedChains, setUnlockedChains] = useState<string[]>(SAVE_SCHEMA.unlockedChains.initial());

  // Unlocked gladiator questline stages for living champions
  const [unlockedGladiatorQuests, setUnlockedGladiatorQuests] = useState<GladiatorQuestProgress[]>(
    SAVE_SCHEMA.unlockedGladiatorQuests.initial(),
  );
  const unlockedGladiatorQuestsRef = useRef<GladiatorQuestProgress[]>([]);
  unlockedGladiatorQuestsRef.current = unlockedGladiatorQuests;

  // Audio toggles
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [campMusicKick, setCampMusicKick] = useState(0);

  // Modal & Notice state refs for frame-independent loop mutual exclusion
  const isHeraldSummonsOpenRef = useRef(isHeraldSummonsOpen);
  isHeraldSummonsOpenRef.current = isHeraldSummonsOpen;
  isTrialBellModalOpenRef.current = isTrialBellModalOpen;

  const isBattlesModalOpenRef = useRef(isBattlesModalOpen);
  isBattlesModalOpenRef.current = isBattlesModalOpen;

  const isArmoryModalOpenRef = useRef(isArmoryModalOpen);
  isArmoryModalOpenRef.current = isArmoryModalOpen;

  const isRosterModalOpenRef = useRef(isRosterModalOpen);
  isRosterModalOpenRef.current = isRosterModalOpen;

  const isBondingModalOpenRef = useRef(isBondingModalOpen);
  isBondingModalOpenRef.current = isBondingModalOpen;

  const isGameMenuOpenRef = useRef(isGameMenuOpen);
  isGameMenuOpenRef.current = isGameMenuOpen;

  const isHowToPlayOpenRef = useRef(isHowToPlayOpen);
  isHowToPlayOpenRef.current = isHowToPlayOpen;

  const isQuestBoardOpenRef = useRef(isQuestBoardOpen);
  isQuestBoardOpenRef.current = isQuestBoardOpen;

  const activeQuestNodeRef = useRef(activeQuestNode);
  activeQuestNodeRef.current = activeQuestNode;

  const questResolutionRef = useRef(questResolution);
  questResolutionRef.current = questResolution;

  const activeExpeditionsRef = useRef(activeExpeditions);
  activeExpeditionsRef.current = activeExpeditions;

  // Starting Roster: Starts with just 1 single gladiator (Valerius Iron-Wall), matching the manager's opening monologue!
  // The live roster is `gladiatorsRef` (the 60 FPS loop reads and replaces it). React subscribes to it through the
  // roster store: `gladiators` below only changes on discrete roster mutations and on the ~10 Hz flush.
  const gladiatorsRef = useRef<Gladiator[]>([{...INITIAL_GLADIATORS[0]}]);
  const roster = useMemo(() => createRoster(gladiatorsRef), []);
  const gladiators = useSyncExternalStore(roster.subscribe, roster.getSnapshot);

  const [aftermathData, setAftermathData] = useState<AftermathData | null>(null);
  const [selectedCampGladId, setSelectedCampGladId] = useState<string | null>(null);

  // Cinematic Story Dialogue Event State
  const [storyState, setStoryState] = useState<ActiveStoryState>(INITIAL_STORY_STATE);
  const storyStateRef = useRef<ActiveStoryState>(INITIAL_STORY_STATE);
  storyStateRef.current = storyState;
  const storyCooldownRef = useRef<number>(40 + Math.random() * 20);
  const [gladiatorBonds, setGladiatorBonds] = useState<Record<string, number>>(SAVE_SCHEMA.bonds.initial);

  // Multi-Fighter Squad Selection (Player can select 1 to 3 gladiators)
  const [selectedGladiatorIds, setSelectedGladiatorIds] = useState<string[]>([
    INITIAL_GLADIATORS[0].id,
    INITIAL_GLADIATORS[1].id,
  ]);

  // Track gladiators who actually participated in the most recent battle for walk-in entrance filter
  const lastDeployedGladIdsRef = useRef<string[]>([]);

  // Slave Uprising Sandbox Debugger States
  const [isSandboxBattle, setIsSandboxBattle] = useState<boolean>(false);
  const isSandboxBattleRef = useRef<boolean>(false);
  const [sandboxTelemetry, setSandboxTelemetry] = useState<{
    rebelDamageDealt: number;
    romanDamageDealt: number;
  }>({ rebelDamageDealt: 0, romanDamageDealt: 0 });
  const sandboxTelemetryRef = useRef<{ rebelDamageDealt: number; romanDamageDealt: number }>({
    rebelDamageDealt: 0,
    romanDamageDealt: 0,
  });
  const [sandboxOutcomeAlert, setSandboxOutcomeAlert] = useState<string | null>(null);
  const [isSimulatedAdActive, setIsSimulatedAdActive] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(5.0);
  const adCountdownRef = useRef<number>(5.0);
  const sandboxHoldTimerRef = useRef<number>(0);

  // Active Battle Tier & Outcome
  const [activeTier, setActiveTier] = useState<BattleTier | null>(null);
  const [combatOutcome, setCombatOutcome] = useState<
    'in_progress' | 'victory' | 'defeat'
  >('in_progress');

  // Incremental Count-Up Tally & Flying Gold Particles System
  const [displayedGold, setDisplayedGold] = useState<number>(() => getConfig('startingGold') as number);
  const displayedGoldRef = useRef<number>(getConfig('startingGold') as number);
  displayedGoldRef.current = displayedGold;
  const prevGoldRef = useRef<number>(getConfig('startingGold') as number);
  const goldTallyRef = useRef<{
    isTallying: boolean;
    startGold: number;
    targetGold: number;
    duration: number;
    timer: number;
    blipInterval: number;
    timeSinceBlip: number;
  }>({
    isTallying: false,
    startGold: 0,
    targetGold: 0,
    duration: 0,
    timer: 0,
    blipInterval: 0.05,
    timeSinceBlip: 0,
  });

  const flyingGoldCoinsRef = useRef<Array<{
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
  }>>([]);
  const goldTargetGlowTimerRef = useRef<number>(0);

  // Simulation speed & pause
  const [simSpeed, setSimSpeed] = useState<1 | 2>(1);
  const [isSimPaused, setIsSimPaused] = useState(false);

  // Real-Time Combat Logs & Collapsible State (Collapsed by default, toggle with 'L')
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [isCombatLogCollapsed, setIsCombatLogCollapsed] = useState<boolean>(true);

  // Crisp Floating Vector Popups (Damage numbers, CRIT!, PINNED!, MORTAL BLOW!)
  const [crispPopups, setCrispPopups] = useState<CrispPopup[]>([]);
  const nextPopupId = useRef(1);

  // Live Arena Combat Simulation Refs
  const arenaFightersRef = useRef<ArenaFighter[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const campSpeechBubblesRef = useRef<CampSpeechBubble[]>([]);
  const arenaSpeechBubblesRef = useRef<ArenaSpeechBubble[]>([]);
  const gladiatorSpeechCooldownsRef = useRef<Record<string, number>>({});
  const animTimeRef = useRef(0);
  const matchTimerRef = useRef(0);
  const nextProjId = useRef(1);

  // Sync state refs for loop (the roster is not one of them: gladiatorsRef is the source of truth, see above)
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Narrow write API (stable for the life of the component): every gold change goes through `economy`;
  // every roster change goes through `roster` (declared with the roster state above).
  const economy = useMemo(() => createEconomy(setGameState), []);

  // ~10 Hz: publish roster changes the 60 FPS camp loop made in the ref, so HP bars and roster lists stay live
  // without re-rendering React every frame.
  useEffect(() => {
    const id = window.setInterval(roster.flush, 100);
    return () => window.clearInterval(id);
  }, [roster]);

  // The sandbox telemetry panel reads live fighter counts from arenaFightersRef while rendering, so while a
  // battle is on screen the HUD re-renders at ~10 Hz.
  useHudTick(mode === 'arena');

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const activeTierRef = useRef(activeTier);
  activeTierRef.current = activeTier;

  const combatOutcomeRef = useRef(combatOutcome);
  combatOutcomeRef.current = combatOutcome;

  const gladiatorBondsRef = useRef(gladiatorBonds);
  gladiatorBondsRef.current = gladiatorBonds;

  const unlockedTierIndexRef = useRef(unlockedTierIndex);
  unlockedTierIndexRef.current = unlockedTierIndex;

  const playerInventoryRef = useRef(playerInventory);
  playerInventoryRef.current = playerInventory;

  const ludusUpgradesRef = useRef(ludusUpgrades);
  ludusUpgradesRef.current = ludusUpgrades;

  const managerRenownRef = useRef(managerRenown);
  managerRenownRef.current = managerRenown;

  const speechcraftLevelRef = useRef(speechcraftLevel);
  speechcraftLevelRef.current = speechcraftLevel;

  const isColiseumChampionRef = useRef(isColiseumChampion);
  isColiseumChampionRef.current = isColiseumChampion;

  const memorialGravesRef = useRef(memorialGraves);
  memorialGravesRef.current = memorialGraves;

  const unlockedChainsRef = useRef(unlockedChains);
  unlockedChainsRef.current = unlockedChains;

  // Live game <-> save schema (see src/systems/saveSchema.ts). Every persisted field is listed here once: how to read
  // it and how to write it (state setter + mirror ref). `SaveBindings` is checked against the schema at compile time.
  // Everything referenced is a ref or a stable setter, so one instance for the life of the component is correct.
  const saveBindings = useMemo<SaveBindings>(
    () => ({
      gold: {
        get: () => gameStateRef.current.gold,
        set: (gold) => {
          setGameState((prev) => ({...prev, gold, status: 'PLAYING'}));
          setDisplayedGold(gold);
          displayedGoldRef.current = gold;
          prevGoldRef.current = gold;
        },
      },
      score: {
        get: () => gameStateRef.current.score,
        set: (score) => setGameState((prev) => ({...prev, score})),
      },
      day: bindRef(dayCounterRef, setDayCounter),
      timeOfDay: {
        get: () => campTimeOfDayRef.current,
        set: (t) => {
          campTimeOfDayRef.current = t;
        },
      },
      weather: bindRef(campWeatherRef, setCampWeather),
      gladiators: {get: () => gladiatorsRef.current, set: (glads) => roster.set(glads)},
      playerInventory: bindRef(playerInventoryRef, setPlayerInventory),
      unlockedTierIndex: bindRef(unlockedTierIndexRef, setUnlockedTierIndex),
      totalBattlesWon: bindRef(totalBattlesWonRef, setTotalBattlesWon),
      totalRecruited: bindRef(totalRecruitedRef, setTotalRecruited),
      managerRenown: bindRef(managerRenownRef, setManagerRenown),
      speechcraftLevel: bindRef(speechcraftLevelRef, setSpeechcraftLevel),
      ludusUpgrades: bindRef(ludusUpgradesRef, setLudusUpgrades),
      isFeastUnlocked: bindRef(isFeastUnlockedRef, setIsFeastUnlocked),
      isColiseumChampion: bindRef(isColiseumChampionRef, setIsColiseumChampion),
      isEmperorEnraged: bindRef(isEmperorEnragedRef, setIsEmperorEnraged),
      isEmperorDefeated: bindRef(isEmperorDefeatedRef, setIsEmperorDefeated),
      isRevoltUnlocked: bindRef(isRevoltUnlockedRef, setIsRevoltUnlocked),
      bonds: bindRef(gladiatorBondsRef, setGladiatorBonds),
      physicianCost: bindRef(physicianCostRef, setPhysicianCost),
      memorialGraves: bindRef(memorialGravesRef, setMemorialGraves),
      unlockedChains: bindRef(unlockedChainsRef, setUnlockedChains),
      unlockedGladiatorQuests: bindRef(unlockedGladiatorQuestsRef, setUnlockedGladiatorQuests),
      firstBattleDone: bindRef(firstBattleDoneRef, setFirstBattleDone),
    }),
    [],
  );

  // LocalStorage Persistence Engine
  const triggerAutosave = useCallback((incrementDay = false) => {
    try {
      const nextDay = incrementDay ? (dayCounterRef.current + 1) : dayCounterRef.current;
      if (incrementDay) {
        dayCounterRef.current = nextDay;
        setDayCounter(nextDay);
      }

      const saveData = serializeSave(saveBindings);

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      setHasExistingSave(true);

      // Trigger diegetic save indicator in camp for 2.5 seconds
      setAutosaveKey((k) => k + 1);
      setAutosaveVisible(true);
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        setAutosaveVisible(false);
      }, 2500);
    } catch (err) {
      console.warn('[Autosave] Failed to write gladiator_manager_save:', err);
    }
  }, []);

  const restoreSavedGame = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return false;

      const restored = restoreSave(saveBindings, data);

      // Selection follows the restored roster; Lanista stamina is not saved and always starts full.
      if (restored.includes('gladiators')) {
        const living = gladiatorsRef.current.filter((g) => g.hp > 0);
        if (living.length > 0) {
          setSelectedGladiatorIds([living[0].id]);
        }
      }
      setManagerStamina(100);
      managerStaminaRef.current = 100;

      // Seamless restoration into camp
      cinematicStateRef.current = 4;
      setCinematicState(4);
      cinematicIntroMusic.stop(0.6);
      setCampMusicKick((n) => n + 1);
      tutorialStageRef.current = 'done';
      setTutorialStage('done');
      setMode('camp');
      modeRef.current = 'camp';
      setHasExistingSave(true);

      return true;
    } catch (err) {
      console.warn('[Autosave] Failed to parse gladiator_manager_save:', err);
      return false;
    }
  }, []);

  const lowestHpPctRef = useRef<Record<string, number>>({});
  const battleRageEventsRef = useRef<{ fallenName: string; survivorName: string }[]>([]);
  const unbondedDeathsRef = useRef<string[]>([]);

  // Lifecycle reporting
  usePlaygroundGameLifecycle(gameState, sdk);

  const startBtnRef = useAutoFocus<HTMLButtonElement>(
    gameState.status === 'START',
  );

  // Bonding Helpers
  const getBondKey = (id1: string, id2: string) => [id1, id2].sort().join('__');

  const getBondScore = (bonds: Record<string, number>, id1: string, id2: string): number => {
    if (id1 === id2) return 100;
    const key = getBondKey(id1, id2);
    return bonds[key] ?? 15;
  };

  const getBondTier = (score: number) => {
    if (score >= 50) return { title: 'Bloodsworn', color: '#9e4a42', icon: '🩸', min: 50 };
    if (score >= 25) return { title: 'Battle Brother', color: '#cb9f6b', icon: '🤝', min: 25 };
    return { title: 'Acquaintance', color: '#88997a', icon: '🛡️', min: 0 };
  };

  const getClosestBondedAlly = (
    gladId: string,
    bonds: Record<string, number>,
    allGlads: Gladiator[],
  ): { ally: Gladiator | null; score: number } => {
    let bestScore = -1;
    let bestGlad: Gladiator | null = null;
    for (const other of allGlads) {
      if (other.id === gladId) continue;
      const score = getBondScore(bonds, gladId, other.id);
      if (score > bestScore) {
        bestScore = score;
        bestGlad = other;
      }
    }
    return { ally: bestGlad, score: Math.max(0, bestScore) };
  };

  // Record permanent cultural memorial grave along camp bottom strip and remove from roster
  const recordGladiatorDeath = useCallback((deadGlad: Gladiator) => {
    // Special Trigger: If any high-level / great warrior (level >= 3 or veteran/hero) died, queue solitary mournful shooting star in camp
    if (deadGlad.level >= 3 || deadGlad.heroType || deadGlad.traits?.includes('Scarred Veteran')) {
      pendingMournfulShootingStarRef.current = true;
    }

    // If gladiator who completed questline stage dies, prune their questline from pool
    setUnlockedGladiatorQuests((prev) =>
      prev.filter((uq) => uq.gladiatorId !== deadGlad.id),
    );
    unlockedGladiatorQuestsRef.current = unlockedGladiatorQuestsRef.current.filter(
      (uq) => uq.gladiatorId !== deadGlad.id,
    );

    // Permadeath: Remove gladiator entirely from player roster to immediately free up their slot (Max 5 slots)
    roster.remove(deadGlad.id);
    setSelectedGladiatorIds((prev) => prev.filter((id) => id !== deadGlad.id));

    setMemorialGraves((prev) => {
      if (prev.some((g) => g.gladiatorId === deadGlad.id)) return prev;
      const epitaphMap: Record<Culture, string> = {
        roman: 'Hic iacet fortis. In aeternum decus legionis.',
        celt: 'May the sacred oak shelter your wandering spirit.',
        berber: 'The sands remember the swift wind of your courage.',
        scythian: 'Ride the eternal steppe beyond the western horizon.',
        hunnic: 'Your iron will echoes forever in the war-horns.',
      };
      const slotIndex = prev.length;
      return [
        ...prev,
        {
          id: `grave_${deadGlad.id}_${Date.now()}`,
          gladiatorId: deadGlad.id,
          name: deadGlad.name,
          culture: deadGlad.culture,
          title: deadGlad.title,
          battlesWon: deadGlad.kills,
          epitaph: epitaphMap[deadGlad.culture] || 'Fallen with honor in the arena sands.',
          slotIndex,
          x: 42 + slotIndex * 48,
          y: 174,
        },
      ];
    });
  }, []);

  // Crisp Vector Popup Dispatcher
  const spawnCrispPopup = useCallback(
    (logicX: number, logicY: number, text: string, color: string, isCrit = false, isFatal = false) => {
      const id = `popup_${nextPopupId.current++}`;
      setCrispPopups((prev) => [
        ...prev.slice(-15),
        {
          id,
          logicX,
          logicY,
          text,
          color,
          life: 1.1,
          maxLife: 1.1,
          isCrit,
          isFatal,
        },
      ]);
    },
    [],
  );

  // Trigger Arena Combat Speech Bubble
  const triggerArenaSpeech = useCallback(
    (fighter: ArenaFighter, trigger: 'kill' | 'pin' | 'kite' | 'release_pin') => {
      const active = arenaSpeechBubblesRef.current;
      if (active.length >= 2) {
        arenaSpeechBubblesRef.current = active.slice(1);
      }
      if (arenaSpeechBubblesRef.current.some((b) => b.fighterId === fighter.id)) {
        return;
      }

      const text = getArenaCombatLine(
        fighter,
        trigger,
        arenaFightersRef.current,
        gladiatorBondsRef.current,
      );
      if (!text) return;

      arenaSpeechBubblesRef.current.push({
        id: `arena_bubble_${Date.now()}_${Math.random()}`,
        fighterId: fighter.id,
        speakerName: fighter.name.split(' ')[0],
        text,
        timer: 3.2,
        maxDuration: 3.2,
      });
    },
    [],
  );

  // Add Combat Log with crisp formatting
  const addCombatLog = useCallback(
    (text: string, tone: 'player' | 'enemy' | 'neutral' | 'crit' | 'pin') => {
      const sec = Math.floor(matchTimerRef.current);
      const min = Math.floor(sec / 60);
      const remSec = (sec % 60).toString().padStart(2, '0');
      const timeStr = `${min}:${remSec}`;
      const id = `log_${Date.now()}_${Math.random()}`;
      setCombatLogs((prev) => [{id, timeStr, text, tone}, ...prev.slice(0, 19)]);
    },
    [],
  );

  // Spawn visual pixel particles (dust, blood spray, hit sparkles)
  const spawnBloodSpray = (
    logicX: number,
    logicY: number,
    count = 12,
    baseAngle = 0,
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 1.5;
      const speed = 25 + Math.random() * 45;
      particlesRef.current.push({
        x: logicX,
        y: logicY,
        color: Math.random() < 0.7 ? PALETTE[3] : PALETTE[2], // crimson & terracotta
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 10,
        life: 0.55 + Math.random() * 0.35,
        maxLife: 0.8,
        size: 1 + (Math.random() > 0.6 ? 1 : 0),
        isBlood: true,
      });
    }
  };

  const spawnSparkles = (logicX: number, logicY: number, color: PaletteColor, count = 6) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 15 + Math.random() * 20;
      particlesRef.current.push({
        x: logicX,
        y: logicY,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45,
        maxLife: 0.45,
        size: 1,
      });
    }
  };

  // Ghost Flash Investigation Handler
  const handleGladiatorInvestigationArrival = useCallback((glad: Gladiator, clickNum: number) => {
    glad.state = 'idle';
    glad.actionTimer = 4.0;
    glad.investigatingFlash = undefined;

    let dialogue = '';
    if (clickNum <= 4) {
      // Phase 1: Curiosity & Omens (Clicks 1 to 4):
      if (glad.culture === 'celt') {
        dialogue = 'Is this a bad omen from the northern gods?';
      } else if (glad.culture === 'roman') {
        dialogue = 'Just a trick of the torchlight... or an insult from Mars.';
      } else if (glad.culture === 'berber') {
        dialogue = 'Baal’s breath, what was that flicker?';
      } else if (glad.culture === 'scythian') {
        dialogue = 'A fire spirit dancing on the dirt?';
      } else {
        dialogue = 'A spark from the underworld forge?';
      }
    } else if (clickNum < 15) {
      // Phase 2: Growing Paranoia (Clicks 5 to 14):
      glad.flipX = !glad.flipX; // agitated glance
      const paranoiaLines = [
        'Are you seeing these lights too, or am I losing my mind in this pit?',
        'The gods are mocking us today, manager. Stop poking the air!',
        'I swear something is living under the dirt...',
      ];
      dialogue = paranoiaLines[(clickNum - 5) % paranoiaLines.length];
    } else if (clickNum === 15 || (!glad.traits?.includes('Mad') && clickNum >= 15)) {
      // Phase 3: The Breaking Point (Click 15):
      // The targeted investigating gladiator completely snaps under the psychological strain!
      if (!glad.traits?.includes('Mad')) {
        glad.traits = Array.from(new Set([...(glad.traits || []), 'Mad']));
        const curAttrs = glad.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
        const curVit = curAttrs.vit ?? curAttrs.con ?? 10;
        glad.attributes = {
          ...curAttrs,
          vit: curVit,
          con: curVit,
          wil: Math.max(1, curAttrs.wil - 4),
        };
        const recalc = recalculateGladiatorStats(glad);
        glad.attack = recalc.attack;
        glad.defense = recalc.defense;
        glad.speed = recalc.speed;
        glad.maxHp = recalc.maxHp;
        glad.hp = recalc.hp;

        gameAudio.playMadnessSFX();
        dialogue = 'THE LIGHTS! THEY LIVE BENEATH THE DIRT!';
        spawnCrispPopup(glad.x, glad.y - 18, 'AFFLICTED: MAD (-4 WIL)', '#9e4a42', true);
        spawnSparkles(glad.x, glad.y - 12, '#ffffff', 14);
        spawnSparkles(glad.x, glad.y - 12, '#6d3947', 10);
        addCombatLog(
          `🌀 PSYCHOLOGICAL BREAKDOWN: ${glad.name} completely snaps chasing phantom flashes! Acquired MAD trait (-4 WIL)!`,
          'crit',
        );
      } else {
        dialogue = 'THE LIGHTS! THEY LIVE BENEATH THE DIRT!';
      }
    } else {
      // Clicks > 15 when gladiator is already afflicted
      const madRamblings = [
        'THE LIGHTS! THEY LIVE BENEATH THE DIRT!',
        'THEY WHISPER UNDER THE SAND!',
        'Do you not hear the dirt singing, manager?!',
        'STOP POKING THE AIR! IT BREATHES!',
      ];
      dialogue = madRamblings[Math.floor(Math.random() * madRamblings.length)];
    }

    if (dialogue) {
      campSpeechBubblesRef.current.push({
        id: `ghost_dialogue_${Date.now()}_${glad.id}`,
        gladiatorId: glad.id,
        speakerName: glad.name.split(' ')[0],
        text: dialogue,
        timer: 4.8,
        maxDuration: 4.8,
      });
    }
  }, [addCombatLog, spawnCrispPopup]);

  // Trigger Automatic "Hear Tale" Lore Dialogue Box on Hero Arrival
  const triggerHeroArrival = useCallback((hero: Gladiator) => {
    if (!hero.heroType) return;
    const lore = HERO_LORE_TALES[hero.heroType];
    if (!lore) return;

    closeAllCampModals();

    setTotalRecruited((prev) => prev + 1);
    totalRecruitedRef.current += 1;

    setHeroArrivalModal({
      hero,
      speaker: lore.speaker,
      title: lore.title,
      tale: lore.tale,
      charCount: 0,
      charTimer: 0,
      isDone: false,
    });

    // Arrival welcome banter for hero
    const existingLiving = gladiatorsRef.current.filter((g) => g.hp > 0 && g.id !== hero.id);
    if (existingLiving.length > 0) {
      const welcomers = existingLiving.slice(0, 2);
      welcomers.forEach((w, wIdx) => {
        w.state = 'walking';
        w.targetX = Math.round(hero.targetX + 22 + wIdx * 16);
        w.targetY = Math.round(hero.targetY + (wIdx === 0 ? -6 : 8));
        w.flipX = true;
        w.actionTimer = 4.0;

        setTimeout(() => {
          const welcomeLine = getArrivalWelcomeLine(w, hero);
          campSpeechBubblesRef.current.push({
            id: `hero_welcome_${Date.now()}_${w.id}`,
            gladiatorId: w.id,
            speakerName: w.name.split(' ')[0],
            text: welcomeLine,
            timer: 4.8,
            maxDuration: 4.8,
          });
        }, 1000 + wIdx * 500);
      });
    }

    gameAudio.playPowerupChime();
  }, []);

  const dismissHeroArrival = useCallback(() => {
    if (!heroArrivalModalRef.current) return;
    const ham = heroArrivalModalRef.current;
    if (!ham.isDone) {
      ham.charCount = ham.tale.length;
      ham.isDone = true;
      gameAudio.playTypewriterBeep(0);
      setHeroArrivalModal({ ...ham });
      return;
    }
    setHeroArrivalModal(null);
    heroArrivalModalRef.current = null;
    gameAudio.playCrispClick();
  }, []);

  // Post-Fifth Podium Gladiator Keeper 3-Panel Dialogue Sequence Handlers
  const advanceKeeperSequence = useCallback(() => {
    if (!keeperSequenceRef.current || !keeperSequenceRef.current.active) return;
    const ks = keeperSequenceRef.current;
    const curText = KEEPER_POST_FIFTH_PANELS[ks.panelIndex];

    if (!ks.isDone) {
      ks.charCount = curText.length;
      ks.isDone = true;
      gameAudio.playTypewriterBeep(0);
      setKeeperSequence({ ...ks });
      return;
    }

    if (ks.panelIndex < 2) {
      const nextPanel = (ks.panelIndex + 1) as 0 | 1 | 2;
      setKeeperSequence({
        active: true,
        panelIndex: nextPanel,
        charCount: 0,
        charTimer: 0,
        isDone: false,
      });
      gameAudio.playCrispClick();
    } else {
      // Panel 3 concluded! Transitions smoothly to the Emperor's 1v1 duel challenge
      setKeeperSequence(null);
      keeperSequenceRef.current = null;
      setIsEmperorDuelModalOpen(true);
      gameAudio.playHeraldTrumpet();
    }
  }, []);

  // Tutorial Sequence Advancement Handler
  const advanceTutorial = useCallback(() => {
    const curStage = tutorialStageRef.current;
    if (curStage === 'idle' || curStage === 'done') return;

    if (curStage === 'wine_speech') {
      campSpeechBubblesRef.current = [];
      setTutorialStage('spotlight_tent');
      tutorialStageRef.current = 'spotlight_tent';
      tutCharCountRef.current = 0;
      tutCharTimerRef.current = 0;
      tutIsLineDoneRef.current = false;
      spotRadiusRef.current = 14;
      gameAudio.playCrispClick();
    } else if (curStage === 'spotlight_tent') {
      if (!tutIsLineDoneRef.current) {
        tutCharCountRef.current = TUTORIAL_TEXT_TENT.length;
        tutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        setTutorialStage('spotlight_armory');
        tutorialStageRef.current = 'spotlight_armory';
        tutCharCountRef.current = 0;
        tutCharTimerRef.current = 0;
        tutIsLineDoneRef.current = false;
        spotRadiusRef.current = 14;
        gameAudio.playCrispClick();
      }
    } else if (curStage === 'spotlight_armory') {
      if (!tutIsLineDoneRef.current) {
        tutCharCountRef.current = TUTORIAL_TEXT_ARMORY.length;
        tutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        setTutorialStage('call_warning');
        tutorialStageRef.current = 'call_warning';
        tutCharCountRef.current = 0;
        tutCharTimerRef.current = 0;
        tutIsLineDoneRef.current = false;
        gameAudio.playCrispClick();
      }
    } else if (curStage === 'call_warning') {
      if (!tutIsLineDoneRef.current) {
        tutCharCountRef.current = TUTORIAL_TEXT_WARNING.length;
        tutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        setTutorialStage('done');
        tutorialStageRef.current = 'done';
        heraldTimerRef.current = 7.5; // Schedule first arena summons after roughly 7 to 8 seconds
        gameAudio.playCrispClick();
      }
    }
  }, []);

  // Post-First-Battle Onboarding Dialogue Advancement
  const advancePostBattleTutorial = useCallback(() => {
    const cur = postBattleStageRef.current;
    if (cur === 'none' || cur === 'done' || cur === 'courtyard_zoom') return;

    if (cur === 'recruits_dialogue_1') {
      if (!postTutIsLineDoneRef.current) {
        postTutCharCountRef.current = POST_BATTLE_TEXT_1.length;
        postTutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        setPostBattleStage('recruits_dialogue_2');
        postBattleStageRef.current = 'recruits_dialogue_2';
        postTutCharCountRef.current = 0;
        postTutCharTimerRef.current = 0;
        postTutIsLineDoneRef.current = false;
        gameAudio.playCrispClick();
      }
    } else if (cur === 'recruits_dialogue_2') {
      if (!postTutIsLineDoneRef.current) {
        postTutCharCountRef.current = POST_BATTLE_TEXT_2.length;
        postTutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        // Once dismissed, trigger subtle zoom on camp courtyard and start 5s timer
        setPostBattleStage('courtyard_zoom');
        postBattleStageRef.current = 'courtyard_zoom';
        postBattleTimerRef.current = 0;
        gameAudio.playCrispClick();
      }
    } else if (cur === 'dummy_spotlight_1') {
      if (!postTutIsLineDoneRef.current) {
        postTutCharCountRef.current = DUMMY_TEXT_1.length;
        postTutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        setPostBattleStage('dummy_spotlight_2');
        postBattleStageRef.current = 'dummy_spotlight_2';
        postTutCharCountRef.current = 0;
        postTutCharTimerRef.current = 0;
        postTutIsLineDoneRef.current = false;
        gameAudio.playCrispClick();
      }
    } else if (cur === 'dummy_spotlight_2') {
      if (!postTutIsLineDoneRef.current) {
        postTutCharCountRef.current = DUMMY_TEXT_2.length;
        postTutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        // Smoothly pan & spotlight over to the camp tent!
        setPostBattleStage('tent_spotlight');
        postBattleStageRef.current = 'tent_spotlight';
        postTutCharCountRef.current = 0;
        postTutCharTimerRef.current = 0;
        postTutIsLineDoneRef.current = false;
        gameAudio.playCrispClick();
      }
    } else if (cur === 'tent_spotlight') {
      if (!postTutIsLineDoneRef.current) {
        postTutCharCountRef.current = POST_BATTLE_TENT_TEXT.length;
        postTutIsLineDoneRef.current = true;
        gameAudio.playHoverMicroTone();
      } else {
        // Conclude spotlight effect, returning camera zoom and lighting smoothly to normal camp perspective
        setPostBattleStage('done');
        postBattleStageRef.current = 'done';
        gameAudio.playCrispClick();
      }
    }
  }, []);

  // Return to Camp from Victory / Podium / Battle screens
  const handleReturnToCamp = useCallback(() => {
    setMode('camp');
    modeRef.current = 'camp';
    screenShakeTimerRef.current = 0;
    setActiveTier(null);
    activeTierRef.current = null;
    setCombatOutcome('in_progress');
    combatOutcomeRef.current = 'in_progress';
    matchTimerRef.current = 0;
    judgmentStateRef.current = { ...INITIAL_JUDGMENT_STATE };
    setJudgmentState(judgmentStateRef.current);
    setAftermathData(null);
    setIsHeraldSummonsOpen(false);
    courierNpcRef.current = INITIAL_COURIER_STATE;
    setCourierNpcState(INITIAL_COURIER_STATE);
    setIsTrialBellModalOpen(false);
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    setIsArmoryModalOpen(false);
    setIsRosterModalOpen(false);
    setIsBondingModalOpen(false);
    setIsQuestBoardOpen(false);
    setActiveQuestNode(null);
    setQuestResolution(null);
    setIsGameMenuOpen(false);
    setIsHowToPlayOpen(false);
    setIsSandboxBattle(false);
    isSandboxBattleRef.current = false;
    setIsEmperorDuel(false);
    isEmperorDuelRef.current = false;
    setIsEmperorDuelModalOpen(false);
    setSandboxOutcomeAlert(null);
    setIsSimulatedAdActive(false);

    if (isEmperorDefeatedRef.current && isRevoltUnlockedRef.current && gameStateRef.current.status !== 'VICTORY') {
      setIsRevoltCelebrationOpen(true);
    }

    // Trigger Post-Fifth Podium Narrative Dialogue Sequence (Keeper 3-Panel Dialogue)
    if (pendingPostFifthDialogueRef.current) {
      pendingPostFifthDialogueRef.current = false;
      closeAllCampModals();
      setKeeperSequence({
        active: true,
        panelIndex: 0,
        charCount: 0,
        charTimer: 0,
        isDone: false,
      });
      gameAudio.playPowerupChime();
    }

    // Zealous Devotee (Admirer) Camp Visitor update & 25% spawn chance after podium Tier III+
    if (devoteeStateRef.current.active) {
      devoteeStateRef.current.battlesLeft -= 1;
      if (devoteeStateRef.current.battlesLeft <= 0) {
        devoteeStateRef.current.state = 'leaving';
        devoteeStateRef.current.targetX = 335;
        devoteeStateRef.current.targetY = 135;
        campSpeechBubblesRef.current.push({
          id: `devotee_part_${Date.now()}`,
          gladiatorId: 'devotee_npc',
          speakerName: 'Zealous Devotee',
          text: 'You ignore my devotion? Tsk, I feel rejected!',
          timer: 4.5,
          maxDuration: 4.5,
        });
      }
      setDevoteeState({ ...devoteeStateRef.current });
    } else if (unlockedTierIndex >= 3 && Math.random() < 0.25) {
      devoteeStateRef.current = {
        active: true,
        state: 'entering',
        x: 330,
        y: 135,
        targetX: 160,
        targetY: 115,
        battlesLeft: 2,
        hasGiftedGold: false,
        animTimer: 0,
        flipX: true,
        speechTimer: 2.0,
      };
      setDevoteeState({ ...devoteeStateRef.current });
    }

    // Dynamic Weather chance (25% chance of gentle pixel rain)
    const nextWeather = Math.random() < 0.25 ? 'rain' : 'clear';
    setCampWeather(nextWeather);
    campWeatherRef.current = nextWeather;

    // Special Trigger: Solitary mournful shooting star across the camp sky upon entering camp if a great warrior died
    if (pendingMournfulShootingStarRef.current) {
      campShootingStarActiveDurationRef.current = 1.6;
      pendingMournfulShootingStarRef.current = false;
    }

    // Rare Camp Bandit Raid (1.5% chance after returning to camp)
    isBanditRaidRef.current = false;
    if (!isSandboxBattleRef.current && !isEmperorDuelRef.current && Math.random() < 0.015) {
      closeAllCampModals();
      setIsBanditAlarmOpen(true);
      gameAudio.playShieldBlock();
    }

    // CAMP WALK-IN FILTER: ONLY gladiators who actually participated in that fight
    // (deployedCombatantIds / fighters in the arena) should do the walk-in entrance from the gate.
    // Other resting gladiators who stayed in camp remain in their normal camp positions/activities!
    let walkIndex = 0;
    const deployedIds = lastDeployedGladIdsRef.current || [];
    const restoredGlads = gladiatorsRef.current.map((g) => {
      const didParticipate = deployedIds.includes(g.id);
      if (didParticipate && g.hp > 0 && g.status !== 'On Quest') {
        const stagger = walkIndex * 0.2;
        const currentWalkIdx = walkIndex;
        walkIndex++;

        const equipTimer = g.justEquipped ? 2.0 : (g.equipParticleTimer ?? 0);

        return {
          ...g,
          status: 'Available' as const,
          hidden: false,
          x: 330 + (currentWalkIdx % 3) * 8,
          y: 140 + (currentWalkIdx % 2) * 8,
          targetX: 75 + (currentWalkIdx % 5) * 42 + Math.floor(currentWalkIdx / 5) * 18,
          targetY: 105 + (currentWalkIdx % 3) * 18 + Math.floor(currentWalkIdx / 5) * 10,
          flipX: true,
          questWalkState: 'returning' as const,
          questWalkTimer: 2.4 + stagger,
          questWalkTotal: 2.4 + stagger,
          state: 'walking' as const,
          equipParticleTimer: equipTimer,
        };
      } else {
        // Resting gladiators who stayed in camp remain in their normal camp positions/activities
        return {
          ...g,
          status: g.status === 'In Arena' ? ('Available' as const) : g.status,
          questWalkState: 'none' as const,
        };
      }
    });
    lastDeployedGladIdsRef.current = [];
    roster.set(restoredGlads);

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
    gameAudio.playCrispClick();

    // Trigger full Autosave routine immediately upon returning to camp after every battle
    triggerAutosave(true);
  }, [triggerAutosave]);

  const handleAdvanceFromPodium = useCallback(() => {
    handleReturnToCamp();
  }, [handleReturnToCamp]);

  handleAdvanceFromPodiumRef.current = handleAdvanceFromPodium;

  // Skip Intro / Transition Directly to Main Game State
  const skipIntro = useCallback(() => {
    cinematicIntroMusic.stop(0.6);
    cinematicStateRef.current = 4;
    setCinematicState(4);
    setGameState((prev) => ({...prev, status: 'PLAYING'}));
    setMode('camp');
    setCampMusicKick((n) => n + 1);
    gameAudio.playCrispClick();
    if (sdk) {
      sdk.startGame();
    }
  }, [sdk]);

  // Restart / Replay Intro
  const replayIntro = useCallback(() => {
    try {
      cinematicIntroMusic.start(0);
    } catch (_) {}
    cinematicStateRef.current = 0;
    setCinematicState(0);
    cinematicPhaseStartTimeRef.current = getSafeNow();
    typewriterCharCountRef.current = 0;
    typewriterCharTimerRef.current = 0;
    isTypewriterDoneRef.current = false;
    emperorStabFiredRef.current = false;
    setIsGameMenuOpen(false);
    gameAudio.playCrispClick();
  }, []);

  // Initialize / Restart Campaign
  const initGame = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
      setHasExistingSave(false);
    } catch (_) {}
    try {
      cinematicIntroMusic.stop(0.3);
    } catch (_) {}
    setCampMusicKick((n) => n + 1);
    cinematicStateRef.current = 4;
    setCinematicState(4);
    // Every persisted field goes back to its schema default (src/systems/saveSchema.ts).
    resetToInitial(saveBindings);
    setGameState((prev) => ({...prev, level: 1}));
    goldTallyRef.current.isTallying = false;
    flyingGoldCoinsRef.current = [];
    setMode('camp');
    modeRef.current = 'camp';
    setActiveTier(null);
    activeTierRef.current = null;
    setCombatOutcome('in_progress');
    combatOutcomeRef.current = 'in_progress';
    matchTimerRef.current = 0;
    setIsGameMenuOpen(false);
    setIsHowToPlayOpen(false);
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    deploymentTierRef.current = null;
    setSideSkirmishes(generateSideSkirmishes(1, false, [INITIAL_GLADIATORS[0]]));
    judgmentStateRef.current = { ...INITIAL_JUDGMENT_STATE };
    setJudgmentState(judgmentStateRef.current);
    setIsArmoryModalOpen(false);
    setIsRosterModalOpen(false);
    setIsQuestBoardOpen(false);
    setActiveQuestNode(null);
    setSelectedQuestGladId(null);
    setActiveExpeditions([]);
    setQuestResolution(null);
    setCourierNotice(null);
    courierTimerRef.current = 55;
    setIsSimPaused(false);
    setSimSpeed(1);
    setCombatLogs([]);
    setCrispPopups([]);
    projectilesRef.current = [];
    arenaFightersRef.current = [];
    particlesRef.current = [];

    lowestHpPctRef.current = {};
    battleRageEventsRef.current = [];
    unbondedDeathsRef.current = [];
    setAftermathData(null);
    setIsBondingModalOpen(false);
    setSelectedCampGladId(null);
    setIsEmperorDuel(false);
    isEmperorDuelRef.current = false;
    setIsEmperorDuelModalOpen(false);
    setIsRevoltCelebrationOpen(false);
    setPodiumGladiators([]);
    podiumGladiatorsRef.current = [];
    podiumTimerRef.current = 0;
    podiumHasIgnitedRef.current = false;
    podiumFlashTimerRef.current = 0;
    physicianNpcRef.current = INITIAL_PHYSICIAN_STATE;
    setPhysicianNpc(INITIAL_PHYSICIAN_STATE);
    setBattlefieldLoot(null);
    merchantStateRef.current = INITIAL_MERCHANT_STATE;
    setMerchantState(INITIAL_MERCHANT_STATE);
    devoteeStateRef.current = INITIAL_DEVOTEE_STATE;
    setDevoteeState(INITIAL_DEVOTEE_STATE);
    visitorWalkingNpcRef.current = null;
    setVisitorWalkingNpc(null);
    setCurrentVisitor(null);
    setIsVisitorModalOpen(false);
    visitorTimerRef.current = 25 + Math.random() * 20;
    setIsBanditAlarmOpen(false);
    isBanditRaidRef.current = false;
    courierNpcRef.current = INITIAL_COURIER_STATE;
    setCourierNpcState(INITIAL_COURIER_STATE);
    setArmoryTab('armoria');
    setActiveEquipSelector(null);
    setHoveredGraveId(null);
    setSelectedGraveId(null);
    setHoveredCampObject(null);
    hoveredCampObjectRef.current = null;
    setIsHeraldSummonsOpen(false);
    setIsTrialBellModalOpen(false);
    isTrialBellModalOpenRef.current = false;
    setIsCurrentBattleTrial(true);
    isCurrentBattleTrialRef.current = true;
    heraldTimerRef.current = 999; // Held until tutorial concludes, then set to 7.5s
    setRespiteCount(0);
    respiteCountRef.current = 0;
    tutorialStageRef.current = 'idle';
    setTutorialStage('idle');
    tutorialIdleTimerRef.current = 0;
    tutorialWineTimerRef.current = 0;
    postBattleStageRef.current = 'none';
    setPostBattleStage('none');
    postBattleTimerRef.current = 0;
    pendingPostBattleTutorialRef.current = false;
    setFreeRecruitCultures([]);
    freeRecruitCulturesRef.current = [];
    sparkleTimerRef.current = 0;
    camZoomRef.current = 1.0;
    camXRef.current = LOGIC_WIDTH / 2;
    camYRef.current = LOGIC_HEIGHT / 2;
    dimAlphaRef.current = 0.0;
    spotRadiusRef.current = 0;
    tutCharCountRef.current = 0;
    tutCharTimerRef.current = 0;
    tutIsLineDoneRef.current = false;
    postTutCharCountRef.current = 0;
    postTutCharTimerRef.current = 0;
    postTutIsLineDoneRef.current = false;
    setStoryState(INITIAL_STORY_STATE);
    storyStateRef.current = INITIAL_STORY_STATE;
    storyCooldownRef.current = 40 + Math.random() * 20;

    // Initialize camp speech bubbles and staggered cooldowns (10 to 40s)
    campSpeechBubblesRef.current = [];
    arenaSpeechBubblesRef.current = [];
    const initSpeechCds: Record<string, number> = {};
    INITIAL_GLADIATORS.forEach((g) => {
      initSpeechCds[g.id] = 8 + Math.random() * 18;
    });
    gladiatorSpeechCooldownsRef.current = initSpeechCds;

    setHeroArrivalModal(null);
    heroArrivalModalRef.current = null;
    setKeeperSequence(null);
    keeperSequenceRef.current = null;
    pendingPostFifthDialogueRef.current = false;
    setManagerStamina(100);
    managerStaminaRef.current = 100;
    setFeastState(null);
    feastStateRef.current = null;
    setFeastSlaves([]);
    feastSlavesRef.current = [];
    hasCompletedThirdPedestalRef.current = false;
    pendingThirdPedestalFeastRef.current = false;
    setIsFeastOfferPending(false);
    isFeastOfferPendingRef.current = false;
    ghostFlashClicksRef.current = 0;
    setGhostFlashClicks(0);
    etherealSparksRef.current = [];
    crowdAudioTimerRef.current = 2.0;

    setSelectedGladiatorIds([INITIAL_GLADIATORS[0].id]);

    if (sdk) {
      sdk.startGame();
    }
    gameAudio.playPowerupChime();
  }, [sdk]);

  const closeArmoryModal = useCallback(() => {
    setIsArmoryModalOpen(false);
    setActiveEquipSelector(null);

    // Particle Exit Effect: Trigger particle effect in canvas draw loop for any gladiator marked with justEquipped === true
    let anyEquipped = false;
    const next = gladiatorsRef.current.map((g) => {
      if (g.justEquipped) {
        anyEquipped = true;
        return {
          ...g,
          equipParticleTimer: 2.0,
        };
      }
      return g;
    });
    if (anyEquipped) {
      gameAudio.playPowerupChime();
    } else {
      gameAudio.playCrispClick();
    }
    roster.set(next);
  }, []);

  const closeArmoryModalRef = useRef(closeArmoryModal);
  closeArmoryModalRef.current = closeArmoryModal;

  // Battlefield Loot Auto-Equip & Stash Handlers
  const handleAutoEquipLoot = useCallback(() => {
    if (!battlefieldLoot) return;
    const { item, targetGladId, targetGladName } = battlefieldLoot;
    const isBoth = item.slotType === 'BOTH';
    const isRight = item.slotType === 'RIGHT';

    const oldItemsToReturn: string[] = [];

    const updatedGlads = gladiatorsRef.current.map((g) => {
      if (g.id !== targetGladId) return g;

      const oldRight = g.equipped.rightHand;
      const oldLeft = g.equipped.leftHand;

      if (isBoth) {
        if (oldRight) oldItemsToReturn.push(oldRight);
        if (oldLeft && oldLeft !== oldRight) oldItemsToReturn.push(oldLeft);
        return recalculateGladiatorStats({
          ...g,
          equipped: { rightHand: item.id, leftHand: item.id },
          justEquipped: true,
          equipParticleTimer: 2.0,
        });
      } else if (isRight) {
        if (oldRight) oldItemsToReturn.push(oldRight);
        const wasBoth = oldRight && WEAPON_DATABASE[oldRight]?.slotType === 'BOTH';
        return recalculateGladiatorStats({
          ...g,
          equipped: {
            rightHand: item.id,
            leftHand: wasBoth ? null : g.equipped.leftHand,
          },
          justEquipped: true,
          equipParticleTimer: 2.0,
        });
      } else {
        // LEFT
        if (oldLeft) oldItemsToReturn.push(oldLeft);
        const wasBoth = oldLeft && WEAPON_DATABASE[oldLeft]?.slotType === 'BOTH';
        return recalculateGladiatorStats({
          ...g,
          equipped: {
            rightHand: wasBoth ? null : g.equipped.rightHand,
            leftHand: item.id,
          },
          justEquipped: true,
          equipParticleTimer: 2.0,
        });
      }
    });

    if (oldItemsToReturn.length > 0) {
      setPlayerInventory((prev) => [...prev, ...oldItemsToReturn]);
    }

    roster.set(updatedGlads);
    setBattlefieldLoot(null);
    gameAudio.playPowerupChime();
    addCombatLog(
      `⚔️ Auto-equipped ${item.name} to ${targetGladName}!`,
      'player',
    );
  }, [battlefieldLoot, addCombatLog]);

  const handleStashLoot = useCallback(() => {
    if (!battlefieldLoot) return;
    setPlayerInventory((prev) => [...prev, battlefieldLoot.item.id]);
    addCombatLog(
      `🎒 Stashed ${battlefieldLoot.item.name} into Ludus armory storage.`,
      'neutral',
    );
    setBattlefieldLoot(null);
    gameAudio.playCoinPickup();
  }, [battlefieldLoot, addCombatLog]);

  // Set document title
  useEffect(() => {
    document.title = 'BLOOD AND GOLD';
  }, []);

  // Gold Gain Flying Particles & Smooth Tally with Pitch Escalation
  useEffect(() => {
    const curGold = gameState.gold;
    const oldGold = prevGoldRef.current;
    if (curGold > oldGold) {
      const diff = curGold - oldGold;
      // Duration scales with gold won: Math.min(2.5, Math.max(0.6, goldAmount * 0.015))
      const duration = Math.min(2.5, Math.max(0.6, diff * 0.015));

      goldTallyRef.current = {
        isTallying: true,
        startGold: displayedGoldRef.current,
        targetGold: curGold,
        duration,
        timer: 0,
        blipInterval: Math.max(0.045, Math.min(0.12, duration / Math.min(diff, 28))),
        timeSinceBlip: 0,
      };

      // Spawn small glittering gold coin/spark particles (#F7DEAA, #d99c52) originating from center
      const particleCount = Math.min(26, Math.max(8, Math.round(diff * 0.08)));
      const startX = canvasWidth * 0.5 + (Math.random() - 0.5) * 60;
      const startY = canvasHeight * 0.52 + (Math.random() - 0.5) * 60;
      const targetX = canvasWidth - 70;
      const targetY = 25;

      for (let i = 0; i < particleCount; i++) {
        const pStartX = startX + (Math.random() - 0.5) * 50;
        const pStartY = startY + (Math.random() - 0.5) * 50;
        const arcHeight = -50 - Math.random() * 90;
        const speed = 1.0 / (duration * (0.65 + Math.random() * 0.35));
        flyingGoldCoinsRef.current.push({
          id: `gold_${Date.now()}_${i}_${Math.random()}`,
          x: pStartX,
          y: pStartY,
          startX: pStartX,
          startY: pStartY,
          targetX,
          targetY,
          progress: -(i * 0.032), // rhythmic stagger
          speed,
          size: Math.random() < 0.5 ? 4 : 6,
          arcHeight,
          color: Math.random() < 0.6 ? '#F7DEAA' : '#d99c52',
          glowColor: '#fef08a',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 14,
        });
      }
    } else if (curGold < oldGold) {
      // Immediate spend (no tally/particles)
      setDisplayedGold(curGold);
      displayedGoldRef.current = curGold;
      goldTallyRef.current.isTallying = false;
    }
    prevGoldRef.current = curGold;
  }, [gameState.gold, canvasWidth, canvasHeight]);

  // Autoplay support
  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame();
    }
  }, [initGame]);

  // Sound FX cues
  useEffect(() => {
    if (gameState.status === 'GAME_OVER') {
      gameAudio.playDefeatMotif();
    } else if (gameState.status === 'VICTORY') {
      gameAudio.playVictoryFanfare();
    }
  }, [gameState.status]);

  // Clean & Failsafe Story Event Dismissal
  const dismissStoryEvent = useCallback((immediate = false) => {
    if (
      immediate ||
      storyStateRef.current.phase === 'closing_fade' ||
      storyStateRef.current.phase === 'closing_bar_lowering'
    ) {
      storyStateRef.current = { ...INITIAL_STORY_STATE };
      setStoryState({ ...INITIAL_STORY_STATE });
      storyCooldownRef.current = 40 + Math.random() * 20;
      gameAudio.playCrispClick();
    } else if (storyStateRef.current.phase !== 'inactive') {
      const updated: ActiveStoryState = {
        ...storyStateRef.current,
        phase: 'closing_fade',
        phaseTimer: 0,
      };
      storyStateRef.current = updated;
      setStoryState(updated);
      gameAudio.playCrispClick();
    }
  }, []);

  // Cinematic Story Event Trigger
  const triggerStoryEvent = useCallback((gladiatorId?: string, force = false) => {
    if (storyStateRef.current.phase !== 'inactive') return; // Concurrency rule: only ONE at a time

    // Mutual exclusion: strictly PREVENT story event if any modal, coliseum notice, or non-camp mode is active
    if (!force) {
      if (
        modeRef.current !== 'camp' ||
        isHeraldSummonsOpenRef.current ||
        isTrialBellModalOpenRef.current ||
        isBattlesModalOpenRef.current ||
        deploymentTierRef.current !== null ||
        isArmoryModalOpenRef.current ||
        isRosterModalOpenRef.current ||
        isBondingModalOpenRef.current ||
        isQuestBoardOpenRef.current ||
        activeQuestNodeRef.current !== null ||
        questResolutionRef.current !== null ||
        isGameMenuOpenRef.current ||
        isHowToPlayOpenRef.current ||
        gameStateRef.current.status !== 'PLAYING'
      ) {
        return;
      }
    } else {
      // Manual trigger: dismiss any conflicting open modal
      setIsBattlesModalOpen(false);
      setDeploymentTier(null);
      setIsArmoryModalOpen(false);
      setIsRosterModalOpen(false);
      setIsBondingModalOpen(false);
      setIsQuestBoardOpen(false);
      setActiveQuestNode(null);
      setQuestResolution(null);
      setIsHeraldSummonsOpen(false);
      setIsTrialBellModalOpen(false);
      setIsGameMenuOpen(false);
      setIsHowToPlayOpen(false);
    }

    const living = gladiatorsRef.current.filter((g) => g.hp > 0 && g.status === 'Available');
    if (living.length === 0) return;

    // Check if any living gladiator has an unlocked questline stage
    const gladsWithUnlockedQuests = living.filter((g) =>
      unlockedGladiatorQuestsRef.current.some((uq) => uq.gladiatorId === g.id),
    );

    let chosenGlad: Gladiator;
    let event: any;

    if (gladiatorId) {
      chosenGlad = living.find((g) => g.id === gladiatorId) || living[0];
    } else if (gladsWithUnlockedQuests.length > 0 && Math.random() < 0.65) {
      // 65% chance to naturally trigger unlocked stage for living gladiator who earned it
      chosenGlad = gladsWithUnlockedQuests[Math.floor(Math.random() * gladsWithUnlockedQuests.length)];
    } else {
      chosenGlad = living[Math.floor(Math.random() * living.length)];
    }

    const unlockedForGlad = unlockedGladiatorQuestsRef.current.find(
      (uq) => uq.gladiatorId === chosenGlad.id,
    );

    if (unlockedForGlad && QUEST_DATABASE[unlockedForGlad.nextNodeId]) {
      const qNode = QUEST_DATABASE[unlockedForGlad.nextNodeId];
      event = {
        id: `story_unlocked_${qNode.id}`,
        culture: chosenGlad.culture,
        title: `${qNode.title} (Stage ${toRoman(qNode.stage)})`,
        lines: [
          `Dominus, our prior triumph has advanced our standing! ${chosenGlad.name} brings word of the next venture.`,
          `Regarding the ongoing affair of "${qNode.title}":`,
          qNode.text,
        ],
        questNodeId: qNode.id,
      };
      // Prune from pool once triggered into dialogue
      setUnlockedGladiatorQuests((prev) =>
        prev.filter((uq) => !(uq.gladiatorId === chosenGlad.id && uq.nextNodeId === qNode.id)),
      );
      unlockedGladiatorQuestsRef.current = unlockedGladiatorQuestsRef.current.filter(
        (uq) => !(uq.gladiatorId === chosenGlad.id && uq.nextNodeId === qNode.id),
      );
    } else {
      event = getStoryEventForGladiator(chosenGlad.id, chosenGlad.name, chosenGlad.culture);
    }

    // Close any conflicting open menus before dialogue box opens
    closeAllCampModals();

    // Pause/silence other ambient speech bubbles
    campSpeechBubblesRef.current = [];

    const nextState: ActiveStoryState = {
      phase: 'bar_rising',
      event,
      gladiatorId: chosenGlad.id,
      gladiatorName: chosenGlad.name,
      culture: chosenGlad.culture,
      currentLineIndex: 0,
      typedCharCount: 0,
      phaseTimer: 0,
      portraitColorAlpha: 0,
      barRiseProgress: 0,
      bgDimmerAlpha: 0,
      isSpeedingUp: false,
      charTimer: 0,
    };

    storyStateRef.current = nextState;
    setStoryState(nextState);
    gameAudio.playHoverMicroTone();
  }, []);

  // Advance Story Dialogue (Space or Click/Tap)
  const advanceStoryDialogue = useCallback(() => {
    const cur = storyStateRef.current;
    if (cur.phase === 'inactive') return;

    // Fast-forward opening animation if player taps during bar rise or portrait fade
    if (cur.phase === 'bar_rising' || cur.phase === 'portrait_fading_in') {
      const updated: ActiveStoryState = {
        ...cur,
        phase: 'typing',
        barRiseProgress: 1,
        bgDimmerAlpha: 1,
        portraitColorAlpha: 1,
        phaseTimer: 0,
        typedCharCount: 0,
        charTimer: 0,
      };
      storyStateRef.current = updated;
      setStoryState(updated);
      gameAudio.playHoverMicroTone();
      return;
    }

    if (cur.phase === 'typing') {
      // If current text box is still typing, instantly completes the line
      const line = cur.event?.lines[cur.currentLineIndex] || '';
      const updated: ActiveStoryState = {
        ...cur,
        typedCharCount: line.length,
        phase: 'line_ready',
      };
      storyStateRef.current = updated;
      setStoryState(updated);
      gameAudio.playHoverMicroTone();
    } else if (cur.phase === 'line_ready') {
      const maxLines = cur.event?.lines.length || 0;
      if (cur.currentLineIndex < maxLines - 1) {
        // Advances to next dialogue segment (speech bar and lit portrait remain active!)
        const updated: ActiveStoryState = {
          ...cur,
          currentLineIndex: cur.currentLineIndex + 1,
          typedCharCount: 0,
          charTimer: 0,
          phase: 'typing',
        };
        storyStateRef.current = updated;
        setStoryState(updated);
        gameAudio.playHoverMicroTone();
      } else {
        // When sequence is exhausted, if linked quest node exists, transition directly to quest choice
        if (cur.event?.questNodeId) {
          const updated: ActiveStoryState = {
            ...cur,
            phase: 'quest_choice',
            phaseTimer: 0,
          };
          storyStateRef.current = updated;
          setStoryState(updated);
          gameAudio.playConfirmSelect();
          return;
        }

        // When sequence is exhausted, initiate closing animation in reverse order
        const updated: ActiveStoryState = {
          ...cur,
          phase: 'closing_fade',
          phaseTimer: 0,
        };
        storyStateRef.current = updated;
        setStoryState(updated);
        gameAudio.playCrispClick();
      }
    } else if (cur.phase === 'closing_fade' || cur.phase === 'closing_bar_lowering') {
      // Immediate clean dismiss if tapped during closing animation
      dismissStoryEvent(true);
    }
  }, [dismissStoryEvent]);

  // Return to Camp from Quest Resolution Modal
  const handleReturnToCampFromQuest = useCallback(() => {
    const res = questResolutionRef.current;
    if (!res) {
      setQuestResolution(null);
      return;
    }

    const { glad, outcomeNode, isSuccess } = res;

    // 1) Clear active expeditions for this gladiator
    setActiveExpeditions((prev) => prev.filter((exp) => exp.gladiatorId !== glad.id));
    activeExpeditionsRef.current = activeExpeditionsRef.current.filter(
      (exp) => exp.gladiatorId !== glad.id,
    );

    // 2) If next stage unlocked on success, unlock it into pool so long as the gladiator still lives
    if (isSuccess && outcomeNode && !outcomeNode.isTerminal && glad.hp > 0) {
      const nextStageEntry = {
        gladiatorId: glad.id,
        chainId: outcomeNode.chainId,
        nextNodeId: outcomeNode.id,
        stage: outcomeNode.stage,
      };
      setUnlockedGladiatorQuests((prev) => {
        if (prev.some((q) => q.gladiatorId === glad.id && q.nextNodeId === outcomeNode.id)) {
          return prev;
        }
        return [...prev, nextStageEntry];
      });
      unlockedGladiatorQuestsRef.current = [
        ...unlockedGladiatorQuestsRef.current.filter(
          (q) => !(q.gladiatorId === glad.id && q.nextNodeId === outcomeNode.id),
        ),
        nextStageEntry,
      ];
    }

    // 3) Update gladiator status & trigger physical walk back into camp if alive
    const currentGlads = gladiatorsRef.current;
    const targetGlad = currentGlads.find((g) => g.id === glad.id);
    const isAlive = targetGlad ? targetGlad.hp > 0 : glad.hp > 0;

    const updatedGlads = currentGlads.map((g) => {
      if (g.id !== glad.id) return g;
      if (!isAlive) {
        return {
          ...g,
          status: 'Available' as const,
          isOnQuest: false,
          hidden: false,
          questWalkState: 'none' as const,
        };
      }
      return {
        ...g,
        status: 'Available' as const,
        isOnQuest: false,
        hidden: false,
        x: 330,
        y: 145,
        targetX: 110 + Math.random() * 80,
        targetY: 110 + Math.random() * 30,
        flipX: true,
        questWalkState: 'returning' as const,
        questWalkTimer: 2.5,
        questWalkTotal: 2.5,
        state: 'walking' as const,
      };
    });

    roster.set(updatedGlads);

    // Return speech bubble
    if (isAlive) {
      const returnLines = [
        'Dominus, I have returned!',
        'The deed is done, Dominus.',
        'Back to the ludus grounds!',
        'Honor to our house, I return!',
      ];
      const rLine = returnLines[Math.floor(Math.random() * returnLines.length)];
      campSpeechBubblesRef.current.push({
        id: `bubble_return_${Date.now()}_${Math.random()}`,
        gladiatorId: glad.id,
        speakerName: glad.name.split(' ')[0],
        text: rLine,
        timer: 3.5,
        maxDuration: 3.5,
      });
    }

    // 4) Close quest modal completely and roll high chance for rare custom fortified arena quest
    setQuestResolution(null);
    setActiveQuestNode(null);
    setSideSkirmishes(generateSideSkirmishes(unlockedTierIndex + 1, true));
    gameAudio.playCrispClick();

    // Autosave after quest return
    triggerAutosave(false);
  }, [triggerAutosave]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'PLAYING') return;

      // Hero Arrival Lore "Hear Tale" Modal Key Controls
      if (heroArrivalModalRef.current) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          dismissHeroArrival();
          return;
        }
      }

      // Post-Fifth Podium Narrative Dialogue Sequence (Keeper 3-Panel Dialogue)
      if (keeperSequenceRef.current && keeperSequenceRef.current.active) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          advanceKeeperSequence();
          return;
        }
      }

    // Third Pedestal Victory Return: Feast Offer Key Controls
    if (isFeastOfferPendingRef.current) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (!tutIsLineDoneRef.current) {
          tutCharCountRef.current = 'These men should eat like kings.'.length;
          tutIsLineDoneRef.current = true;
          gameAudio.playCrispClick();
        } else {
          setIsFeastOfferPending(false);
          isFeastOfferPendingRef.current = false;
          triggerCampFeast(true);
        }
        return;
      }
    }

      // Return to camp from Podium Screen with Space, A, Enter, or Escape
      if (modeRef.current === 'podium') {
        if (
          e.key === ' ' ||
          e.key === 'a' ||
          e.key === 'A' ||
          e.key === 'Enter' ||
          e.key === 'Escape'
        ) {
          e.preventDefault();
          handleReturnToCamp();
          return;
        }
      }

      // Close Quest Resolution Modal with Escape or Space/Enter
      if (questResolutionRef.current) {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleReturnToCampFromQuest();
          return;
        }
      }

      // Post-First-Battle Tutorial Key Controls
      if (
        postBattleStageRef.current === 'recruits_dialogue_1' ||
        postBattleStageRef.current === 'recruits_dialogue_2' ||
        postBattleStageRef.current === 'dummy_spotlight_1' ||
        postBattleStageRef.current === 'dummy_spotlight_2' ||
        postBattleStageRef.current === 'tent_spotlight'
      ) {
        if (e.key === ' ' || e.key === 'a' || e.key === 'A' || e.key === 'Enter') {
          e.preventDefault();
          advancePostBattleTutorial();
          return;
        }
      }

      // Initial Tutorial Key Controls
      if (
        tutorialStageRef.current === 'spotlight_tent' ||
        tutorialStageRef.current === 'spotlight_armory' ||
        tutorialStageRef.current === 'call_warning'
      ) {
        if (e.key === ' ' || e.key === 'a' || e.key === 'A' || e.key === 'Enter') {
          e.preventDefault();
          advanceTutorial();
          return;
        }
      }

      // When a cinematic story event is playing:
      if (storyStateRef.current.phase !== 'inactive') {
        if (e.key === 'Escape') {
          e.preventDefault();
          dismissStoryEvent(true);
          return;
        }
        if (e.key === 'a' || e.key === 'A') {
          setStoryState((prev) => ({...prev, isSpeedingUp: true}));
          return;
        }
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          advanceStoryDialogue();
          return;
        }
      }

      if (e.key === 'Escape') {
        if (deploymentTier) {
          setDeploymentTier(null);
          gameAudio.playCrispClick();
          return;
        }
        if (isTrialBellModalOpenRef.current) {
          setIsTrialBellModalOpen(false);
          gameAudio.playCrispClick();
          return;
        }
        if (isArmoryModalOpenRef.current) {
          closeArmoryModalRef.current();
          return;
        }
        if (selectedCampGladId) {
          setSelectedCampGladId(null);
          return;
        }
        setIsGameMenuOpen((prev) => !prev);
        gameAudio.playCrispClick();
      } else if (e.key === 'q' || e.key === 'Q') {
        // Debug Trigger Key: immediately triggers the in-world gladiator special dialogue quest
        if (mode === 'camp') {
          storyCooldownRef.current = 0;
          triggerStoryEvent(undefined, true);
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        // Debug Inspector & Spawner Menu Key ('Z')
        if (mode === 'camp') {
          setIsDebugMenuOpen((prev) => !prev);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 'b' || e.key === 'B') {
        if (mode === 'camp' && storyStateRef.current.phase === 'inactive' && !deploymentTierRef.current?.isPodiumTrial) {
          setIsBattlesModalOpen((prev) => !prev);
          setIsArmoryModalOpen(false);
          setIsRosterModalOpen(false);
          setIsQuestBoardOpen(false);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 'u' || e.key === 'U') {
        if (mode === 'camp' && storyStateRef.current.phase === 'inactive' && !deploymentTierRef.current?.isPodiumTrial) {
          setArmoryTab('armoria');
          setIsArmoryModalOpen((prev) => !prev);
          setIsBattlesModalOpen(false);
          setIsRosterModalOpen(false);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (mode === 'camp' && storyStateRef.current.phase === 'inactive' && !deploymentTierRef.current?.isPodiumTrial) {
          setIsRosterModalOpen((prev) => !prev);
          setIsBattlesModalOpen(false);
          setIsArmoryModalOpen(false);
          setIsBondingModalOpen(false);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 'o' || e.key === 'O') {
        if (mode === 'camp' && storyStateRef.current.phase === 'inactive' && !deploymentTierRef.current?.isPodiumTrial) {
          setIsBondingModalOpen((prev) => !prev);
          setIsBattlesModalOpen(false);
          setIsArmoryModalOpen(false);
          setIsRosterModalOpen(false);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 't' || e.key === 'T') {
        // Quick shortcut to trigger a story dialogue event in Camp
        if (
          mode === 'camp' &&
          storyStateRef.current.phase === 'inactive' &&
          !isHeraldSummonsOpen &&
          !isBattlesModalOpen &&
          !isArmoryModalOpen &&
          !isRosterModalOpen &&
          !isBondingModalOpen &&
          !isGameMenuOpen &&
          !isHowToPlayOpen
        ) {
          triggerStoryEvent();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (mode === 'camp' && storyStateRef.current.phase === 'inactive') {
          dismissStoryEvent(true);
          const squadGlads = gladiatorsRef.current.filter(
            (g) => selectedGladiatorIds.includes(g.id) && g.hp > 0,
          );
          const gladsToShow =
            squadGlads.length > 0
              ? squadGlads
              : gladiatorsRef.current.filter((g) => g.hp > 0).slice(0, 3);
          podiumGladiatorsRef.current = gladsToShow;
          setPodiumGladiators(gladsToShow);
          podiumTimerRef.current = 0.5;
          podiumHasIgnitedRef.current = true;
          podiumFlashTimerRef.current = 0;
          setMode('podium');
          gameAudio.playCrispClick();
        } else if (mode === 'podium') {
          setMode('camp');
          gameAudio.playCrispClick();
        }
      } else if (e.key === ' ') {
        if (mode === 'arena') {
          setIsSimPaused((prev) => !prev);
          gameAudio.playCrispClick();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (mode === 'arena') {
          setIsCombatLogCollapsed((prev) => !prev);
          gameAudio.playCrispClick();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        setStoryState((prev) => ({...prev, isSpeedingUp: false}));
      }
    };

    const handleIntroKeyDown = (e: KeyboardEvent) => {
      if (cinematicStateRef.current >= 4) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        skipIntro();
        return;
      }

      if (cinematicStateRef.current === 3) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          if (!isTypewriterDoneRef.current) {
            typewriterCharCountRef.current = INTRO_MONOLOGUE_TEXT.length;
            isTypewriterDoneRef.current = true;
            gameAudio.playCrispClick();
          } else {
            skipIntro();
          }
        }
      } else {
        // Space/Enter can advance to next cinematic phase
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          const nextState = cinematicStateRef.current + 1;
          cinematicStateRef.current = nextState;
          setCinematicState(nextState);
          cinematicPhaseStartTimeRef.current = getSafeNow();
          if (nextState >= 4) {
            skipIntro();
          } else {
            try {
              cinematicIntroMusic.setPhase(nextState);
            } catch (_) {}
            gameAudio.playHoverMicroTone();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleIntroKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleIntroKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.status, mode, advanceStoryDialogue, dismissStoryEvent, selectedCampGladId, triggerStoryEvent, skipIntro]);

  // Recruit Gladiator from Market (Cap: 10 active roster slots)
  const recruitGladiator = (template: Gladiator) => {
    const isFree = freeRecruitCulturesRef.current.includes(template.culture);
    const cost = isFree ? 0 : (getConfig('recruitCostBase') as number);
    const livingGlads = gladiatorsRef.current.filter((g) => g.hp > 0);
    if ((!isFree && gameState.gold < cost) || livingGlads.length >= 10) {
      gameAudio.playHoverMicroTone();
      return;
    }
    const targetX = 65 + Math.random() * 150;
    const targetY = 98 + Math.random() * 45;
    let initialEquipped: { rightHand: string | null; leftHand: string | null } =
      template.equipped || { rightHand: null, leftHand: null };
    if (!initialEquipped.rightHand && !initialEquipped.leftHand) {
      if (template.level === 4 && Math.random() < 0.50) {
        initialEquipped = rollNpcEquipment(4, template.culture);
      } else if (template.level >= 5 && Math.random() < 0.80) {
        initialEquipped = rollNpcEquipment(5, template.culture);
      }
    }
    let newGlad: Gladiator = {
      ...template,
      id: `glad_${template.culture}_${Date.now()}`,
      status: 'Available',
      baseAttack: template.attack,
      baseDefense: template.defense,
      baseSpeed: template.speed,
      equipped: initialEquipped,
      x: -30,
      y: 110,
      targetX,
      targetY,
      state: 'walking',
      targetActivity: 'idle',
      actionTimer: 2.0,
      animTimer: 0,
      flipX: false,
      isWalkingIn: true,
    };
    newGlad = recalculateGladiatorStats(newGlad);
    if (!isFree) {
      economy.debit(cost);
    } else {
      setFreeRecruitCultures((prev) => prev.filter((c) => c !== template.culture));
      freeRecruitCulturesRef.current = freeRecruitCulturesRef.current.filter((c) => c !== template.culture);
    }
    setTotalRecruited((prev) => prev + 1);
    totalRecruitedRef.current += 1;
    const nextRoster = [...gladiatorsRef.current, newGlad];
    roster.set(nextRoster);

    // Auto-select recruit into squad if fewer than 3 gladiators selected
    setSelectedGladiatorIds((prev) => {
      const valid = prev.filter((id) =>
        nextRoster.some((g) => g.id === id && g.hp > 0 && g.status !== 'On Quest'),
      );
      if (valid.length < 3 && !valid.includes(newGlad.id)) {
        return [...valid, newGlad.id];
      }
      return valid;
    });

    // ARRIVAL WELCOME & CULTURAL BANTER:
    // When a newly hired recruit or hero walks in from the left gate,
    // 1-2 existing living gladiators in camp actively path over to meet them and display speech bubbles!
    const existingLiving = gladiatorsRef.current.filter((g) => g.hp > 0 && g.id !== newGlad.id && !g.isWalkingIn);
    if (existingLiving.length > 0) {
      const welcomers = existingLiving.slice(0, 2);
      welcomers.forEach((w, wIdx) => {
        w.state = 'walking';
        w.targetX = Math.round(newGlad.targetX + 20 + wIdx * 18);
        w.targetY = Math.round(newGlad.targetY + (wIdx === 0 ? -6 : 8));
        w.flipX = true;
        w.actionTimer = 3.5;

        setTimeout(() => {
          const welcomeLine = getArrivalWelcomeLine(w, newGlad);
          campSpeechBubblesRef.current.push({
            id: `welcome_${Date.now()}_${w.id}`,
            gladiatorId: w.id,
            speakerName: w.name.split(' ')[0],
            text: welcomeLine,
            timer: 4.8,
            maxDuration: 4.8,
          });
        }, 800 + wIdx * 450);
      });
    }

    gameAudio.playLevelUpStinger();
    gameAudio.playCoinPickup();
    addCombatLog(
      isFree
        ? `📜 Recruited ${template.name} (${CULTURE_LABELS[template.culture]}) for FREE (0 Gold Bonus)!`
        : `📜 Recruited ${template.name} (${CULTURE_LABELS[template.culture]}) for ${cost} Gold!`,
      'neutral',
    );
  };

  // BEASTMASTER UNIQUE PASSIVE: Train Cavalry Units and War Elephants in the Tent
  const recruitCavalry = () => {
    const cost = 350;
    const livingGlads = gladiatorsRef.current.filter((g) => g.hp > 0);
    if (gameState.gold < cost || livingGlads.length >= 10) {
      gameAudio.playHoverMicroTone();
      return;
    }
    let newCav: Gladiator = {
      id: `glad_cavalry_${Date.now()}`,
      name: 'Imperial War Horse',
      culture: 'roman',
      title: 'Armored War Steed',
      level: 1,
      xp: 0,
      xpNeeded: 100,
      hp: 210,
      maxHp: 210,
      attack: 28,
      defense: 14,
      speed: 22,
      baseAttack: 28,
      baseDefense: 14,
      baseSpeed: 22,
      weaponLevel: 1,
      armorLevel: 1,
      kills: 0,
      tactics: 'aggressive',
      status: 'Available',
      isCavalry: true,
      weightClass: 'Heavyweight',
      gladiatorClass: 'War Horse',
      archetype: 'War Horse',
      traits: ['Resilient', 'Crowd Pleaser'],
      attributes: { str: 18, dex: 16, vit: 18, con: 18, wil: 14 },
      equipped: { rightHand: null, leftHand: null },
      x: -30,
      y: 110,
      targetX: 90 + Math.random() * 60,
      targetY: 105 + Math.random() * 25,
      state: 'walking',
      targetActivity: 'idle',
      actionTimer: 2.0,
      animTimer: 0,
      flipX: false,
      isWalkingIn: true,
    };
    newCav = recalculateGladiatorStats(newCav);
    economy.debit(cost);
    setTotalRecruited((prev) => prev + 1);
    totalRecruitedRef.current += 1;
    const nextRoster = [...gladiatorsRef.current, newCav];
    roster.set(nextRoster);
    gameAudio.playLevelUpStinger();
    gameAudio.playCoinPickup();
    addCombatLog('🐎 Recruited Imperial War Horse (350 Gold) from the Beastmaster! Added to warrior roster.', 'neutral');
  };

  const recruitElephant = () => {
    const cost = 800;
    const livingGlads = gladiatorsRef.current.filter((g) => g.hp > 0);
    if (gameState.gold < cost || livingGlads.length >= 10) {
      gameAudio.playHoverMicroTone();
      return;
    }
    let newElephant: Gladiator = {
      id: `glad_elephant_${Date.now()}`,
      name: 'Carthaginian War Elephant',
      culture: 'berber',
      title: 'Colossal War Elephant',
      level: 1,
      xp: 0,
      xpNeeded: 100,
      hp: 420,
      maxHp: 420,
      attack: 34,
      defense: 22,
      speed: 7,
      baseAttack: 34,
      baseDefense: 22,
      baseSpeed: 7,
      weaponLevel: 1,
      armorLevel: 1,
      kills: 0,
      tactics: 'aggressive',
      status: 'Available',
      isElephant: true,
      weightClass: 'Colossal',
      gladiatorClass: 'War Elephant',
      archetype: 'War Elephant',
      traits: ['Resilient', 'Scarred Veteran'],
      attributes: { str: 22, dex: 8, vit: 28, con: 28, wil: 16 },
      equipped: { rightHand: null, leftHand: null },
      x: -30,
      y: 110,
      targetX: 90 + Math.random() * 60,
      targetY: 105 + Math.random() * 25,
      state: 'walking',
      targetActivity: 'idle',
      actionTimer: 2.0,
      animTimer: 0,
      flipX: false,
      isWalkingIn: true,
    };
    newElephant = recalculateGladiatorStats(newElephant);
    economy.debit(cost);
    setTotalRecruited((prev) => prev + 1);
    totalRecruitedRef.current += 1;
    const nextRoster = [...gladiatorsRef.current, newElephant];
    roster.set(nextRoster);
    gameAudio.playElephantTrumpet();
    gameAudio.playCoinPickup();
    addCombatLog('🐘 Recruited Carthaginian War Elephant (800 Gold) from the Beastmaster! Added to warrior roster.', 'neutral');
  };

  // Upgrade Weapon / Armor
  const upgradeGear = (gladiatorId: string, gearType: 'weapon' | 'armor') => {
    const cost = getConfig('armoryUpgradeCostBase') as number;
    if (gameState.gold < cost) return;

    roster.patch(gladiatorId, (g) => {
      if (gearType === 'weapon') {
        return {
          ...g,
          weaponLevel: g.weaponLevel + 1,
          attack: g.attack + 5,
        };
      } else {
        return {
          ...g,
          armorLevel: g.armorLevel + 1,
          defense: g.defense + 4,
          maxHp: g.maxHp + 25,
          hp: g.hp + 25,
        };
      }
    });

    economy.debit(cost);
    gameAudio.playLevelUpStinger();
  };

  // Open Quest in Visual Novel Modal
  const openQuestNode = useCallback((nodeId: string) => {
    const node = QUEST_DATABASE[nodeId];
    if (!node) return;
    dismissStoryEvent(true);
    setIsQuestBoardOpen(false);
    setIsBattlesModalOpen(false);
    setIsArmoryModalOpen(false);
    setIsRosterModalOpen(false);
    setIsBondingModalOpen(false);
    setIsHeraldSummonsOpen(false);
    setIsTrialBellModalOpen(false);
    setCourierNotice(null);

    // Pick first available gladiator
    const available = gladiatorsRef.current.filter((g) => g.status === 'Available' && g.hp > 0);
    if (available.length > 0) {
      setSelectedQuestGladId(available[0].id);
    } else {
      setSelectedQuestGladId(null);
    }

    setActiveQuestNode(node);
    gameAudio.playHoverMicroTone();
  }, [dismissStoryEvent]);

  // Dispatch gladiator on quest choice or resolve immediate choice
  const dispatchGladiatorOnQuest = useCallback(
    (node: QuestNode, choiceIndex: number) => {
      const choice = node.choices[choiceIndex];
      if (!choice) return;

      const glad = gladiatorsRef.current.find((g) => g.id === selectedQuestGladId);

      // If this is an immediate choice (duration === 0) or refused
      if (node.duration === 0 || choice.requiredStat === 'none') {
        setActiveQuestNode(null);
        dismissStoryEvent(true);

        if (choice.rewards) {
          const rw = choice.rewards;
          economy.credit(rw.gold || 0, {floorAtZero: true, addToScore: true});
          if (rw.unlockChain) {
            setUnlockedChains((prev) =>
              prev.includes(rw.unlockChain!) ? prev : [...prev, rw.unlockChain!],
            );
          }
          if (rw.recruit) {
            const newGlad: Gladiator = {
              id: `glad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: rw.recruit.name,
              culture: rw.recruit.culture,
              title: rw.recruit.title,
              level: 2,
              xp: 0,
              xpNeeded: 150,
              hp: rw.recruit.maxHp,
              maxHp: rw.recruit.maxHp,
              attack: rw.recruit.attack,
              defense: rw.recruit.defense,
              speed: rw.recruit.speed,
              baseAttack: rw.recruit.attack,
              baseDefense: rw.recruit.defense,
              baseSpeed: rw.recruit.speed,
              weaponLevel: 2,
              armorLevel: 2,
              kills: 2,
              tactics: 'aggressive',
              status: 'Available',
              equipped: { rightHand: null, leftHand: null },
              x: 150,
              y: 130,
              targetX: 150,
              targetY: 130,
              state: 'idle',
              targetActivity: 'idle',
              actionTimer: 2.0,
              animTimer: 0,
              flipX: false,
            };
            roster.add(newGlad);
            gameAudio.playLevelUpStinger();
          }
          if (glad && rw.heal) {
            roster.patch(glad.id, (g) => ({ ...g, hp: Math.min(g.maxHp, g.hp + rw.heal!) }));
          }
          gameAudio.playCoinPickup();
        }

        if (choice.penalty) {
          const pen = choice.penalty;
          economy.credit(pen.gold || 0, {floorAtZero: true});
          if (glad && pen.damage) {
            const target = gladiatorsRef.current.find((g) => g.id === glad.id);
            if (target) {
              const remHp = Math.max(0, target.hp - pen.damage!);
              if (remHp <= 0) recordGladiatorDeath(target);
              else roster.patch(target.id, { hp: remHp });
            }
          }
          gameAudio.playMeleePunch();
        }

        if (choice.successNextId) {
          openQuestNode(choice.successNextId);
        } else {
          gameAudio.playConfirmSelect();
        }
        return;
      }

      // Dispatched Expedition with duration > 0 and a stat check
      if (!glad) return;

      const chance = calculateGladiatorSuccessChance(
        glad,
        choice.requiredStat,
        choice.baseChance,
        choice.statWeight,
      );

      // Quest Departure Ambient Speech Bubble over Gladiator's head
      const departureLines = [
        'I shall not fail you, Dominus!',
        'May the gods guide my blade...',
        'For the glory of our ludus!',
        'I go to claim victory for our house!',
        'By the gods, the deed will be done!',
      ];
      const depLine = departureLines[Math.floor(Math.random() * departureLines.length)];

      campSpeechBubblesRef.current.push({
        id: `bubble_depart_${Date.now()}_${Math.random()}`,
        gladiatorId: glad.id,
        speakerName: glad.name.split(' ')[0],
        text: depLine,
        timer: 3.5,
        maxDuration: 3.5,
      });

      // Set gladiator to physically walk to the camp exit gate (330, 145) over ~2.0 seconds
      const updatedGlads = gladiatorsRef.current.map((g) => {
        if (g.id !== glad.id) return g;
        return {
          ...g,
          status: 'On Quest' as const,
          isOnQuest: true,
          hidden: false,
          targetX: 330,
          targetY: 145,
          state: 'walking' as const,
          flipX: false,
          questWalkState: 'departing' as const,
          questWalkTimer: 2.0,
          questWalkTotal: 2.0,
        };
      });
      roster.set(updatedGlads);

      // Immediately remove dispatched gladiator from squad selection so they do not occupy phantom slots
      setSelectedGladiatorIds((prev) => prev.filter((id) => id !== glad.id));

      const expedition: ActiveQuestExpedition = {
        questId: node.chainId,
        nodeId: node.id,
        choiceIndex,
        gladiatorId: glad.id,
        gladiatorName: glad.name,
        remainingTime: node.duration,
        totalDuration: node.duration,
        speaker: node.speaker,
        portraitType: node.portraitType,
        questTitle: node.title,
        actionText: choice.text,
        calculatedChance: chance,
      };

      const nextExpeditions = [...activeExpeditionsRef.current, expedition];
      activeExpeditionsRef.current = nextExpeditions;
      setActiveExpeditions(nextExpeditions);

      setActiveQuestNode(null);
      setSelectedQuestGladId(null);
      dismissStoryEvent(true);
      gameAudio.playConfirmSelect();
      addCombatLog(`📜 ${glad.name} dispatched on expedition: "${node.title}" (${node.duration}s)!`, 'neutral');
    },
    [selectedQuestGladId, openQuestNode, addCombatLog, recordGladiatorDeath, dismissStoryEvent],
  );

  // Resolve expedition when timer completes
  const resolveExpedition = useCallback(
    (exp: ActiveQuestExpedition) => {
      const allGlads = gladiatorsRef.current;
      const glad = allGlads.find((g) => g.id === exp.gladiatorId);
      const node = QUEST_DATABASE[exp.nodeId];
      if (!node || !glad) return;

      const choice = node.choices[exp.choiceIndex];
      if (!choice) return;

      const roll = Math.floor(Math.random() * 100) + 1;
      const isSuccess = roll <= exp.calculatedChance;
      const nextNodeId = isSuccess ? choice.successNextId : choice.failureNextId;
      const outcomeNode = nextNodeId ? QUEST_DATABASE[nextNodeId] : undefined;

      // Finale nodes state their own purse, but the resolution modal never
      // offers that choice. Pay it with the expedition reward so the treasury
      // matches the contract on the button and the amount in the finale text.
      const finaleChoice = outcomeNode?.isTerminal ? outcomeNode.choices[0] : undefined;
      const rewards = mergeQuestRewards(
        isSuccess ? choice.rewards : undefined,
        finaleChoice?.rewards,
      );
      const penalty = mergeQuestPenalties(
        !isSuccess ? choice.penalty : undefined,
        finaleChoice?.penalty,
      );

      // Apply dynamic consequences to Ludus
      if (rewards) {
        economy.credit(rewards.gold || 0, {addToScore: true});
        if (rewards.unlockChain) {
          setUnlockedChains((prev) =>
            prev.includes(rewards.unlockChain!) ? prev : [...prev, rewards.unlockChain!],
          );
        }
        if (rewards.recruit) {
          const newGlad: Gladiator = {
            id: `glad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: rewards.recruit.name,
            culture: rewards.recruit.culture,
            title: rewards.recruit.title,
            level: 2,
            xp: 0,
            xpNeeded: 150,
            hp: rewards.recruit.maxHp,
            maxHp: rewards.recruit.maxHp,
            attack: rewards.recruit.attack,
            defense: rewards.recruit.defense,
            speed: rewards.recruit.speed,
            baseAttack: rewards.recruit.attack,
            baseDefense: rewards.recruit.defense,
            baseSpeed: rewards.recruit.speed,
            weaponLevel: 2,
            armorLevel: 2,
            kills: 2,
            tactics: 'aggressive',
            status: 'Available',
            equipped: { rightHand: null, leftHand: null },
            x: 150,
            y: 130,
            targetX: 150,
            targetY: 130,
            state: 'idle',
            targetActivity: 'idle',
            actionTimer: 2.0,
            animTimer: 0,
            flipX: false,
          };
          // roster.add writes the ref as well as state, so the gladiatorsRef.current.map
          // below includes the recruit instead of overwriting it.
          roster.add(newGlad);
        }
      }

      if (penalty) {
        economy.credit(penalty.gold || 0, {floorAtZero: true});
      }

      // Update gladiator status, persistent damage, XP, and permadeath in both ref and state
      let updatedGladFinal: Gladiator = { ...glad };
      const updatedList = gladiatorsRef.current.map((g) => {
        if (g.id !== glad.id) return g;
        let newHp = g.hp;
        let newXp = g.xp;
        let newLvl = g.level;
        let newNeeded = g.xpNeeded;

        if (rewards?.heal) {
          newHp = Math.min(g.maxHp, newHp + rewards.heal);
        }
        if (penalty?.damage) {
          newHp = Math.max(0, newHp - penalty.damage);
        }
        if (penalty?.killed || newHp <= 0) {
          newHp = 0;
          recordGladiatorDeath(g);
        }

        // Award quest completion leveling XP reduced by 20%
        if (isSuccess && newHp > 0) {
          const rawQuestXp = rewards?.xp ?? Math.round(35 + node.stage * 15);
          const questXpAwarded = Math.round(rawQuestXp * 0.8);
          newXp += questXpAwarded;
          if (newXp >= newNeeded && newLvl < 5) {
            newLvl += 1;
            newXp = newXp % newNeeded;
            newNeeded = Math.floor(newNeeded * 1.5);
            gameAudio.playLevelUpStinger();
          }
        }

        updatedGladFinal = recalculateGladiatorStats({
          ...g,
          hp: newHp,
          xp: newXp,
          level: newLvl,
          xpNeeded: newNeeded,
        });
        return updatedGladFinal;
      });

      roster.set(updatedList);

      // Play audio cue
      if (isSuccess) {
        gameAudio.playVictoryFanfare();
      } else {
        gameAudio.playDefeatMotif();
      }

      // Pop the Visual Novel resolution modal
      setQuestResolution({
        node,
        glad: updatedGladFinal,
        isSuccess,
        roll,
        chance: exp.calculatedChance,
        choice,
        outcomeNode,
        rewards,
        penalty,
      });

      const questLogXp = Math.round((rewards?.xp ?? Math.round(35 + node.stage * 15)) * 0.8);
      addCombatLog(
        isSuccess
          ? `🏆 EXPEDITION SUCCESS! ${glad.name} triumphed in "${node.title}" (Rolled ${roll} vs ${exp.calculatedChance}%)! (+${questLogXp} XP)`
          : `💀 EXPEDITION FAILURE! ${glad.name} faltered in "${node.title}" (Rolled ${roll} vs ${exp.calculatedChance}%)!`,
        isSuccess ? 'crit' : 'neutral',
      );
    },
    [recordGladiatorDeath, addCombatLog],
  );

  // Toggle gladiator deployment in squad with dynamic squad size limit
  const toggleDeployGladiator = (gladId: string, maxLimit = 3) => {
    const targetGlad = gladiatorsRef.current.find((g) => g.id === gladId);
    if (!targetGlad || targetGlad.status === 'On Quest' || targetGlad.isOnQuest || targetGlad.hp <= 0) {
      gameAudio.playHoverMicroTone();
      return;
    }
    setSelectedGladiatorIds((prev) => {
      // Ensure only available, active gladiators can fill the squad slots so away gladiators do not occupy phantom slots
      const currentValid = prev.filter((id) =>
        gladiatorsRef.current.some(
          (g) => g.id === id && g.status === 'Available' && !g.isOnQuest && g.hp > 0,
        ),
      );
      if (currentValid.includes(gladId)) {
        if (currentValid.length <= 1) return currentValid; // Keep at least 1 gladiator
        return currentValid.filter((id) => id !== gladId);
      } else {
        if (currentValid.length >= maxLimit) return currentValid; // Dynamic squad limit per trial/skirmish
        return [...currentValid, gladId];
      }
    });
    gameAudio.playCrispClick();
  };

  // Change individual gladiator tactics
  const setGladiatorTactics = (gladId: string, tactics: CombatTactics) => {
    roster.patch(gladId, {tactics});
    gameAudio.playCrispClick();
  };

  // Manager In-Arena Combat Actions
  const handleArenaActionShout = useCallback(() => {
    if (arenaActionCooldowns.shout > 0 || combatOutcomeRef.current !== 'in_progress') return;
    setArenaActionCooldowns((prev) => ({ ...prev, shout: 12.0 }));

    arenaFightersRef.current.forEach((f) => {
      if (f.isPlayerTeam && f.hp > 0) {
        f.moraleRallyTimer = 4.0;
        f.attack = Math.round(f.attack * 1.15);
        f.defense = Math.round(f.defense * 1.15);
        spawnCrispPopup(f.x, f.y - 18, 'RALLIED! +15%', '#ded095', true);
      }
    });

    gameAudio.playPowerupChime();
    addCombatLog('📢 [SHOUT ORDERS] Lanista Aulus rallies the squad! +15% ATK & DEF for 4s!', 'player');
  }, [arenaActionCooldowns.shout, addCombatLog, spawnCrispPopup]);

  const handleArenaActionThrowSand = useCallback(() => {
    if (arenaActionCooldowns.sand > 0 || combatOutcomeRef.current !== 'in_progress') return;
    setArenaActionCooldowns((prev) => ({ ...prev, sand: 10.0 }));

    // Find nearest living enemy to any allied fighter
    const enemies = arenaFightersRef.current.filter((f) => !f.isPlayerTeam && f.hp > 0);
    if (enemies.length === 0) return;

    const targetEnemy = enemies[0];
    targetEnemy.blindDistractTimer = 2.5;
    targetEnemy.attackCooldown = Math.max(targetEnemy.attackCooldown, 2.5);
    targetEnemy.state = 'hurt';

    // Particle sand cloud
    for (let i = 0; i < 14; i++) {
      particlesRef.current.push({
        x: targetEnemy.x + (Math.random() - 0.5) * 12,
        y: targetEnemy.y - 12 + (Math.random() - 0.5) * 10,
        color: PALETTE[1],
        vx: (Math.random() - 0.5) * 20,
        vy: -10 - Math.random() * 15,
        life: 0.6,
        maxLife: 0.6,
      });
    }

    gameAudio.playFootstepStone();
    spawnCrispPopup(targetEnemy.x, targetEnemy.y - 18, 'BLINDED! (2.5s)', '#cb9f6b', true);
    addCombatLog(`⏳ [THROW SAND] Lanista Aulus tosses pocket sand at ${targetEnemy.name}! Blinded for 2.5s!`, 'player');
  }, [arenaActionCooldowns.sand, addCombatLog, spawnCrispPopup]);

  const handleArenaActionStimulant = useCallback(() => {
    if (arenaActionCooldowns.stimulant > 0 || combatOutcomeRef.current !== 'in_progress') return;
    setArenaActionCooldowns((prev) => ({ ...prev, stimulant: 14.0 }));

    const livingAllies = arenaFightersRef.current.filter((f) => f.isPlayerTeam && f.hp > 0);
    if (livingAllies.length === 0) return;

    // Pick ally with lowest percentage HP
    const lowestAlly = [...livingAllies].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
    lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + 35);
    lowestAlly.stamina = Math.min(lowestAlly.maxStamina, lowestAlly.stamina + 40);

    spawnCrispPopup(lowestAlly.x, lowestAlly.y - 18, '+35 HP (ADRENALINE)', '#4ade80', true);
    spawnSparkles(lowestAlly.x, lowestAlly.y - 12, '#55796f', 8);
    gameAudio.playPowerupChime();
    addCombatLog(`💉 [STIMULANT] Emergency adrenaline administered to ${lowestAlly.name}! +35 HP restored!`, 'player');
  }, [arenaActionCooldowns.stimulant, addCombatLog, spawnCrispPopup]);

  const handleArenaActionRetreat = useCallback(() => {
    if (arenaActionCooldowns.retreatUsed || combatOutcomeRef.current !== 'in_progress') return;
    setArenaActionCooldowns((prev) => ({ ...prev, retreatUsed: true }));

    addCombatLog('🚩 [SOUND RETREAT] Lanista Aulus sounds the horn of tactical withdrawal! Preserving survivors!', 'neutral');
    gameAudio.playHeraldTrumpet();
    finishDuel(false);
  }, [arenaActionCooldowns.retreatUsed, addCombatLog]);

  // Trigger Interactive Camp Feast with Roast Table, Candle Blooms, and Dialogue Banter
  const triggerCampFeast = useCallback((isInitialUnlock = false) => {
    // 1. Ensure feast happens at night
    campTimeOfDayRef.current = 105;

    // 2. Fully heal all gladiators and inspire them
    const fullyHealed = gladiatorsRef.current.map((g) => ({
      ...g,
      hp: g.maxHp,
      pepTalkStatus: 'Inspire' as const,
    }));
    roster.set(fullyHealed);

    // 3. Mark feast action unlocked permanently
    setIsFeastUnlocked(true);
    isFeastUnlockedRef.current = true;

    // 4. Start 35s feast sequence
    const fState: CampFeastState = {
      active: true,
      timer: 35.0,
      totalDuration: 35.0,
      tableAlpha: 0,
      banterTimer: 2.2,
      unlocked: true,
    };
    feastStateRef.current = fState;
    setFeastState({ ...fState });

    // 5. Spawn 3 servant/slave NPCs bustling in from bottom bringing platters
    const initialSlaves: FeastSlaveNpc[] = [
      {
        id: 'slave_feast_1',
        x: 148,
        y: 192,
        targetX: 148,
        targetY: 138,
        flipX: false,
        state: 'entering',
        platterItem: 'roast',
      },
      {
        id: 'slave_feast_2',
        x: 168,
        y: 195,
        targetX: 168,
        targetY: 140,
        flipX: false,
        state: 'entering',
        platterItem: 'wine',
      },
      {
        id: 'slave_feast_3',
        x: 188,
        y: 192,
        targetX: 188,
        targetY: 138,
        flipX: true,
        state: 'entering',
        platterItem: 'bread',
      },
    ];
    feastSlavesRef.current = initialSlaves;
    setFeastSlaves(initialSlaves);

    // 6. Direct gladiators to sit around the banquet table and drink
    const tableCenterX = 168;
    const tableCenterY = 126;
    const feastSeats = [
      { x: tableCenterX - 32, y: tableCenterY - 4, flipX: false },
      { x: tableCenterX - 32, y: tableCenterY + 4, flipX: false },
      { x: tableCenterX + 32, y: tableCenterY - 4, flipX: true },
      { x: tableCenterX + 32, y: tableCenterY + 4, flipX: true },
      { x: tableCenterX - 14, y: tableCenterY - 14, flipX: false },
      { x: tableCenterX + 14, y: tableCenterY - 14, flipX: true },
      { x: tableCenterX - 14, y: tableCenterY + 14, flipX: false },
      { x: tableCenterX + 14, y: tableCenterY + 14, flipX: true },
      { x: tableCenterX - 42, y: tableCenterY, flipX: false },
      { x: tableCenterX + 42, y: tableCenterY, flipX: true },
    ];

    const seatedGlads = gladiatorsRef.current.map((g, idx) => {
      if (g.hp <= 0 || g.status === 'On Quest' || g.hidden) return g;
      const seat = feastSeats[idx % feastSeats.length];
      return {
        ...g,
        state: 'sitting' as const,
        targetActivity: 'sitting' as const,
        targetX: seat.x,
        targetY: seat.y,
        flipX: seat.flipX,
        actionTimer: 35.0,
        seatedDuration: 0,
        sitCooldown: 0,
      };
    });
    roster.set(seatedGlads);

    gameAudio.playPotionGulp();
    gameAudio.playPowerupChime();

    addCombatLog(
      '🍷 [NIGHT FEAST] The banquet table is laid! All champions feast like kings, healing to full HP with inspired resolve!',
      'crit',
    );
  }, [addCombatLog]);

  // Manager Action: Hold Feast (Costs 33 Stamina & 50 Gold)
  const handleHoldFeast = useCallback(() => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    if (gameStateRef.current.gold < 50) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough gold (Requires 50 Gold)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);
    economy.debit(50, {floorAtZero: true});
    triggerCampFeast(false);
    setIsManagerMenuOpen(false);
    setActiveCascadingSubMenu('none');
  }, [spawnCrispPopup, triggerCampFeast]);

  // Manager In-Camp Actions with Stamina System (100 Base, -33 per action)
  const handleCampInspire = useCallback(() => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    if (campActionCooldowns.inspire > 0) return;
    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);
    setCampActionCooldowns((prev) => ({ ...prev, inspire: 30.0 }));

    const updated = gladiatorsRef.current.map((g) => {
      const attrs = g.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
      const curVit = attrs.vit ?? attrs.con ?? 10;
      const nextAttrs: GladiatorAttributes = {
        str: attrs.str ?? 10,
        dex: attrs.dex ?? 10,
        vit: curVit,
        con: curVit,
        wil: (attrs.wil ?? 10) + 10,
      };
      return {
        ...g,
        attributes: nextAttrs,
      };
    });
    roster.set(updated);

    gameAudio.playPowerupChime();
    campSpeechBubblesRef.current.push({
      id: `manager_inspire_${Date.now()}`,
      gladiatorId: gladiatorsRef.current[0]?.id || 'glad_0',
      speakerName: 'Lanista Aulus',
      text: 'Honor, discipline, and glory! Fight as brothers and Rome will fear your name!',
      timer: 4.5,
      maxDuration: 4.5,
    });
  }, [campActionCooldowns.inspire, spawnCrispPopup]);

  const handleCampPunish = useCallback(() => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    if (campActionCooldowns.punish > 0) return;
    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);
    setCampActionCooldowns((prev) => ({ ...prev, punish: 30.0 }));

    const updated = gladiatorsRef.current.map((g) => {
      const attrs = g.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
      const curVit = attrs.vit ?? attrs.con ?? 10;
      const nextAttrs: GladiatorAttributes = {
        str: (attrs.str ?? 10) + 2,
        dex: attrs.dex ?? 10,
        vit: curVit,
        con: curVit,
        wil: attrs.wil ?? 10,
      };
      return recalculateGladiatorStats({
        ...g,
        baseAttack: g.baseAttack + 3,
        attributes: nextAttrs,
      });
    });
    roster.set(updated);

    gameAudio.playSwordClash();
    campSpeechBubblesRef.current.push({
      id: `manager_punish_${Date.now()}`,
      gladiatorId: gladiatorsRef.current[0]?.id || 'glad_0',
      speakerName: 'Lanista Aulus',
      text: 'Iron bends to the hammer! Complacency is punished with blood!',
      timer: 4.5,
      maxDuration: 4.5,
    });
  }, [campActionCooldowns.punish, spawnCrispPopup]);

  const handleSummonPhysician = useCallback(() => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    if (gameStateRef.current.gold < physicianCostRef.current) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, `Not enough gold (Requires ${physicianCostRef.current}G)`, '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    if (physicianNpcRef.current.active) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Physician is already in camp!', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }

    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);
    economy.debit(physicianCostRef.current, {floorAtZero: true});

    const pState: PhysicianNpcState = {
      ...INITIAL_PHYSICIAN_STATE,
      active: true,
      x: 24,
      y: 110,
      targetX: 120,
      targetY: 115,
      timer: 40.0,
      healTickTimer: 1.0,
      speechTimer: 2.0,
      didHumorCheck: false,
      flipX: false,
      animTimer: 0,
      state: 'entering',
    };
    physicianNpcRef.current = pState;
    setPhysicianNpc({ ...pState });

    gameAudio.playPowerupChime();
    campSpeechBubblesRef.current.push({
      id: `physician_arrive_${Date.now()}`,
      gladiatorId: 'physician_npc',
      speakerName: 'Physician',
      text: 'The physician arrives with herbs and tinctures! Healing aura active!',
      timer: 4.0,
      maxDuration: 4.0,
    });
    addCombatLog(
      `🌿 [PHYSICIAN SUMMONED] Alexandrian Physician dispatched to camp for 40s (${physicianCostRef.current} Gold)! Healing aura active!`,
      'player',
    );
  }, [spawnCrispPopup, addCombatLog]);

  const handleCampPhysician = handleSummonPhysician;

  const handleCampStudyOpponent = useCallback(() => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    if (campActionCooldowns.study > 0) return;
    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);
    setCampActionCooldowns((prev) => ({ ...prev, study: 30.0 }));
    setScoutingInsightActive(true);

    gameAudio.playConfirmSelect();
    campSpeechBubblesRef.current.push({
      id: `manager_study_${Date.now()}`,
      gladiatorId: gladiatorsRef.current[0]?.id || 'glad_0',
      speakerName: 'Lanista Aulus',
      text: 'Opponent stances dissected. +10% Crit & +5% Pre-match tactical advantage!',
      timer: 4.5,
      maxDuration: 4.5,
    });
  }, [campActionCooldowns.study, spawnCrispPopup]);

  // Targeted interactions via Lanista Manager Cascading Menu (cost 33 Stamina)
  const handleMotivateGladiator = useCallback((gladId: string) => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);

    const targetGlad = gladiatorsRef.current.find((g) => g.id === gladId);
    if (!targetGlad) return;
    const attrs = targetGlad.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
    const curVit = attrs.vit ?? attrs.con ?? 10;
    const nextAttrs: GladiatorAttributes = {
      str: attrs.str ?? 10,
      dex: attrs.dex ?? 10,
      vit: curVit,
      con: curVit,
      wil: (attrs.wil ?? 10) + 10,
    };
    targetGlad.attributes = nextAttrs;
    targetGlad.pepTalkStatus = 'Inspire';
    const recalc = recalculateGladiatorStats(targetGlad);
    Object.assign(targetGlad, recalc);
    roster.refresh();
    gameAudio.playPowerupChime();
    campSpeechBubblesRef.current.push({
      id: `manager_motivate_${Date.now()}_${targetGlad.id}`,
      gladiatorId: targetGlad.id,
      speakerName: targetGlad.name.split(' ')[0],
      text: 'My blood burns with honor! I shall not fail the ludus, Dominus!',
      timer: 4.5,
      maxDuration: 4.5,
    });
    spawnCrispPopup(targetGlad.x, targetGlad.y - 18, '+10 WIL (MOTIVATED)', '#ded095', true);
    setIsManagerMenuOpen(false);
    setActiveCascadingSubMenu('none');
  }, [spawnCrispPopup]);

  const handleIntimidateGladiator = useCallback((gladId: string) => {
    if (managerStaminaRef.current < 33) {
      spawnCrispPopup(LOGIC_WIDTH / 2, 60, 'Not enough stamina (Rest until next battle)', '#ba7654', true);
      gameAudio.playHoverMicroTone();
      return;
    }
    setManagerStamina((prev) => Math.max(0, prev - 33));
    managerStaminaRef.current = Math.max(0, managerStaminaRef.current - 33);

    const targetGlad = gladiatorsRef.current.find((g) => g.id === gladId);
    if (!targetGlad) return;
    const attrs = targetGlad.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
    const curVit = attrs.vit ?? attrs.con ?? 10;
    const nextAttrs: GladiatorAttributes = {
      str: (attrs.str ?? 10) + 2,
      dex: attrs.dex ?? 10,
      vit: curVit,
      con: curVit,
      wil: attrs.wil ?? 10,
    };
    targetGlad.attributes = nextAttrs;
    targetGlad.baseAttack += 3;
    targetGlad.pepTalkStatus = 'Rage';
    const recalc = recalculateGladiatorStats(targetGlad);
    Object.assign(targetGlad, recalc);
    roster.refresh();
    gameAudio.playSwordClash();
    campSpeechBubblesRef.current.push({
      id: `manager_intimidate_${Date.now()}_${targetGlad.id}`,
      gladiatorId: targetGlad.id,
      speakerName: targetGlad.name.split(' ')[0],
      text: 'My blade is iron and my life is cheap! I fear nothing on the sands!',
      timer: 4.5,
      maxDuration: 4.5,
    });
    spawnCrispPopup(targetGlad.x, targetGlad.y - 18, '+3 ATK (INTIMIDATED)', '#ba7654', true);
    setIsManagerMenuOpen(false);
    setActiveCascadingSubMenu('none');
  }, [spawnCrispPopup]);

  // Breeding Dynasty System Handler
  const handleBreedChampions = useCallback(() => {
    if (!selectedParent1Id || !selectedParent2Id || selectedParent1Id === selectedParent2Id) return;
    if (gladiatorsRef.current.filter((g) => g.hp > 0).length >= 10) return;

    const p1 = gladiatorsRef.current.find((g) => g.id === selectedParent1Id);
    const p2 = gladiatorsRef.current.find((g) => g.id === selectedParent2Id);
    if (!p1 || !p2) return;

    const nextGen = Math.max(p1.generation || 1, p2.generation || 1) + 1;
    const combinedTraits: PersonalityTrait[] = Array.from(new Set([...(p1.traits || []), ...(p2.traits || []), 'Resilient']));
    const inheritedVit = Math.round(((p1.attributes?.vit ?? p1.attributes?.con ?? 10) + (p2.attributes?.vit ?? p2.attributes?.con ?? 10)) / 2) + 3;
    const inheritedAttrs: GladiatorAttributes = {
      str: Math.round(((p1.attributes?.str ?? 10) + (p2.attributes?.str ?? 10)) / 2) + 3,
      dex: Math.round(((p1.attributes?.dex ?? 10) + (p2.attributes?.dex ?? 10)) / 2) + 3,
      vit: inheritedVit,
      con: inheritedVit,
      wil: Math.round(((p1.attributes?.wil ?? 10) + (p2.attributes?.wil ?? 10)) / 2) + 3,
    };

    const offspringName = `${p1.name.split(' ')[0]}-Scion`;
    let prodigy: Gladiator = {
      id: `glad_prodigy_${Date.now()}`,
      name: offspringName,
      culture: p1.culture,
      title: `Dynasty Prodigy (Gen ${toRoman(nextGen)})`,
      level: 1,
      xp: 0,
      xpNeeded: 100,
      hp: 170,
      maxHp: 170,
      attack: 24,
      defense: 14,
      speed: 13,
      baseAttack: 24,
      baseDefense: 14,
      baseSpeed: 13,
      weaponLevel: 1,
      armorLevel: 1,
      kills: 0,
      tactics: p1.tactics,
      status: 'Available',
      equipped: { rightHand: null, leftHand: null },
      attributes: inheritedAttrs,
      weightClass: p1.weightClass,
      gladiatorClass: p1.gladiatorClass,
      traits: combinedTraits,
      generation: nextGen,
      heritageTitle: `Scion of ${p1.name.split(' ')[0]} & ${p2.name.split(' ')[0]}`,
      x: -30,
      y: 110,
      targetX: 85 + Math.random() * 50,
      targetY: 105 + Math.random() * 25,
      state: 'walking',
      targetActivity: 'idle',
      actionTimer: 2.0,
      animTimer: 0,
      flipX: false,
      isWalkingIn: true,
    };
    prodigy = recalculateGladiatorStats(prodigy);

    const nextRoster = [...gladiatorsRef.current, prodigy];
    roster.set(nextRoster);

    // Trigger arrival welcome banter
    const existingLiving = gladiatorsRef.current.filter((g) => g.hp > 0 && g.id !== prodigy.id);
    if (existingLiving.length > 0) {
      const welcomers = existingLiving.slice(0, 2);
      welcomers.forEach((w, wIdx) => {
        w.state = 'walking';
        w.targetX = Math.round(prodigy.targetX + 20 + wIdx * 16);
        w.targetY = Math.round(prodigy.targetY + (wIdx === 0 ? -6 : 8));
        w.flipX = true;
        w.actionTimer = 4.0;
        setTimeout(() => {
          campSpeechBubblesRef.current.push({
            id: `prodigy_welcome_${Date.now()}_${w.id}`,
            gladiatorId: w.id,
            speakerName: w.name.split(' ')[0],
            text: `The bloodline endures! Behold the offspring of ${p1.name.split(' ')[0]}!`,
            timer: 4.8,
            maxDuration: 4.8,
          });
        }, 900 + wIdx * 450);
      });
    }

    setIsBreedingModalOpen(false);
    setSelectedParent1Id(null);
    setSelectedParent2Id(null);
    gameAudio.playLevelUpStinger();
    addCombatLog(`🧬 DYNASTY PRODIGY BORN: ${prodigy.name} (${prodigy.heritageTitle}) enters the stable!`, 'player');
  }, [selectedParent1Id, selectedParent2Id, addCombatLog]);

  // Pre-Battle Pep Talk Staging Room Trigger
  const initiatePreBattlePepTalk = useCallback((tier: BattleTier, isTrial = true) => {
    // Dismiss any open popups/dialogues
    dismissStoryEvent(true);
    setIsHeraldSummonsOpen(false);
    setDeploymentTier(null);
    setIsBattlesModalOpen(false);

    setPepTalkState({
      active: true,
      pendingTier: tier,
      isTrial,
      addressedGladiatorIds: [],
      talkOutcomes: {},
    });
    gameAudio.playConfirmSelect();
  }, [dismissStoryEvent]);

  // Launch Multi-Fighter Arena Battle (isTrial = true for official Coliseum Trials, false for side skirmishes)
  const launchBattle = (tier: BattleTier, isTrial = true) => {
    // Force-close any active story dialogue cleanly
    dismissStoryEvent(true);

    isCurrentBattleTrialRef.current = isTrial;

    // Fallback: Ensure tier and its enemies array exist and are valid
    if (!tier || !tier.enemies || tier.enemies.length === 0) {
      console.warn('[Combat Guard] launchBattle called with invalid or empty tier enemies. Falling back to default tier.');
      tier = BATTLE_TIERS[0];
    }

    // Normalize any gladiator whose status might have lingered as 'In Arena'
    const safeGlads = gladiatorsRef.current.map((g) => {
      if (g.status === 'In Arena') {
        return { ...g, status: 'Available' as const };
      }
      return g;
    });
    roster.set(safeGlads);

    // Hard limit: for Arena Side Quests, enforce hard limit - player cannot select more gladiators than enemies present!
    // For Coliseum Trials, allow up to 4 gladiators on 3rd podium and above!
    const maxAllowedSquad = isTrial
      ? getMaxSquadSizeForTier(Math.min(4, unlockedTierIndex))
      : Math.max(1, tier.enemies.length);

    let availableSquadGlads = safeGlads.filter(
      (g) => selectedGladiatorIds.includes(g.id) && g.hp > 0 && g.status === 'Available' && !g.isOnQuest,
    );
    if (availableSquadGlads.length === 0) {
      const fallback = safeGlads.filter((g) => g.hp > 0 && g.status === 'Available' && !g.isOnQuest);
      if (fallback.length > 0) {
        availableSquadGlads = [fallback[0]];
        setSelectedGladiatorIds([fallback[0].id]);
      } else {
        console.error('[Combat Guard] Cannot launch battle: No living gladiators available in roster!');
        return;
      }
    }

    // Emperor duel deploys the champion the player picked, including a War Horse or War Elephant.
    if (tier.id === 'tier_emperor' && emperorDuelSelectedGladIdRef.current) {
      const chosen = safeGlads.find(
        (g) =>
          g.id === emperorDuelSelectedGladIdRef.current &&
          g.hp > 0 &&
          g.status === 'Available' &&
          !g.isOnQuest,
      );
      if (chosen) {
        availableSquadGlads = [chosen];
        setSelectedGladiatorIds([chosen.id]);
      }
    }

    // Slice to enforce hard squad constraint for side skirmishes and trials
    const deployedGlads = availableSquadGlads.slice(0, maxAllowedSquad);
    lastDeployedGladIdsRef.current = deployedGlads.map((g) => g.id);

    const nextGlads = safeGlads.map((g) =>
      deployedGlads.some((dg) => dg.id === g.id) ? { ...g, status: 'In Arena' as const } : g,
    );
    roster.set(nextGlads);

    setActiveTier(tier);
    activeTierRef.current = tier;
    setCombatOutcome('in_progress');
    combatOutcomeRef.current = 'in_progress';
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    deploymentTierRef.current = null;
    setMode('arena');
    modeRef.current = 'arena';
    screenShakeTimerRef.current = 0;
    setIsCombatLogCollapsed(true);
    setCombatLogs([]);
    setCrispPopups([]);
    projectilesRef.current = [];
    particlesRef.current = [];
    arenaSpeechBubblesRef.current = [];
    matchTimerRef.current = 0;
    lowestHpPctRef.current = {};
    battleRageEventsRef.current = [];
    unbondedDeathsRef.current = [];

    // Reset Emperor's Judgment flags cleanly
    judgmentStateRef.current = {
      active: false,
      phase: 'hold',
      startTime: 0,
      cameraPanY: 0,
      verdict: 'thumbs_up',
      isPlayerVictorious: true,
      isTrial,
      hasDownedGlads: false,
      downedGladIds: [],
      audioTriggered: { build: false, cheer: false, slash: false, murmur: false, executionRoar: false },
    };
    setJudgmentState(judgmentStateRef.current);

    // Spawn Player Squad Fighters on Left Side (Staggered formation supporting up to 6 combatants)
    const playerFighters: ArenaFighter[] = deployedGlads.map((g, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const startX = 60 + col * 28;
      const startY = 92 + row * 26 + (col === 1 ? 12 : 0);

      const rightW = g.equipped?.rightHand ? WEAPON_DATABASE[g.equipped.rightHand] : null;
      const leftW = g.equipped?.leftHand ? WEAPON_DATABASE[g.equipped.leftHand] : null;
      const isTwoHanded = rightW && rightW.slotType === 'BOTH';
      const critBonus = isTwoHanded
        ? (rightW?.critBonus || 0)
        : (rightW?.critBonus || 0) + (leftW?.critBonus || 0);
      const pinBonus = isTwoHanded
        ? (rightW?.pinBonus || 0)
        : (rightW?.pinBonus || 0) + (leftW?.pinBonus || 0);

      const gladHp = Math.max(1, Math.round(g.hp > 0 ? g.hp : g.maxHp || 150));
      const gladMaxHp = Math.max(gladHp, Math.round(g.maxHp || 150));
      const scoutAtkMult = scoutingInsightActive ? 1.05 : 1.0;
      const scoutCrit = scoutingInsightActive ? 0.10 : 0.0;

      let initialAtkCd = 0.3 + idx * 0.2;
      let extraCrit = 0;
      if (g.pepTalkStatus === 'Panic') {
        initialAtkCd += 0.5; // slight attack delay from panicked backfire
      } else if (g.pepTalkStatus === 'Rage') {
        extraCrit += 0.15;
      }

      return buildFighter({
        id: `p_fighter_${g.id}_${Date.now()}_${idx}`,
        sourceGladiatorId: g.id,
        isPlayerTeam: true,
        name: g.name,
        culture: g.culture,
        title: g.title,
        level: Math.max(1, g.level || 1),
        hp: gladHp,
        maxHp: gladMaxHp,
        attack: Math.max(5, Math.round((g.attack || 20) * scoutAtkMult)),
        defense: Math.max(0, Math.round(g.defense || 10)),
        speed: Math.max(1, Math.round(g.speed || 10)),
        tactics: g.tactics,
        equipped: g.equipped,
        critBonus: critBonus + scoutCrit + extraCrit,
        pinBonus,
        heroType: g.heroType,
        isCavalry: g.isCavalry,
        isElephant: g.isElephant,
        isCharging: g.isCavalry ? true : false,
        hasCavalryHit: false,
        attributes: g.attributes,
        weightClass: g.weightClass,
        gladiatorClass: g.gladiatorClass,
        traits: g.traits,
        pepTalkStatus: g.pepTalkStatus,
        pepTalkThreatened: g.pepTalkThreatened,
        x: startX,
        y: Math.max(88, Math.min(160, startY)),
        flipX: false, // facing right towards opponents
        animTimer: idx * 0.3,
        attackCooldown: initialAtkCd,
        tacticsTimer: 1.0 + Math.random(),
        pinCooldown: 1.0 + Math.random() * 3.0,
      });
    });

    // Spawn Enemy Squad Fighters on Right Side (Cloned fresh with guaranteed positive HP > 0)
    const isFirstBattle = !firstBattleDoneRef.current && isTrial;
    const rawEnemies = isFirstBattle ? tier.enemies.slice(0, 1) : tier.enemies;
    const enemiesToSpawn = (rawEnemies && rawEnemies.length > 0) ? rawEnemies : [
      {
        name: 'Arena Pit Brawler',
        culture: 'berber' as Culture,
        title: 'Pit Fighter',
        hp: 120,
        attack: 18,
        defense: 8,
        speed: 12,
        tactics: 'aggressive' as CombatTactics,
      }
    ];

    const tierIdx = Math.max(0, BATTLE_TIERS.findIndex((t) => t.id === tier.id));

    const enemyFighters: ArenaFighter[] = enemiesToSpawn.map((tmpl, idx) => {
      let enemyLevel = Math.min(5, tierIdx + 1);
      if (!isTrial) {
        if (tmpl.title.includes('Lvl V')) enemyLevel = 5;
        else if (tmpl.title.includes('Lvl IV')) enemyLevel = 4;
        else if (tmpl.title.includes('Lvl III')) enemyLevel = 3;
        else if (tmpl.title.includes('Lvl II')) enemyLevel = 2;
        else if (tmpl.title.includes('Lvl I')) enemyLevel = 1;
        else enemyLevel = Math.max(1, Math.min(5, unlockedTierIndex));
      }

      let equipped = tmpl.equipped ? { ...tmpl.equipped } : undefined;
      if (!equipped && !tmpl.isElephant && !tmpl.isCavalry) {
        const rolled = rollNpcEquipment(enemyLevel, tmpl.culture);
        if (rolled.rightHand || rolled.leftHand) {
          equipped = rolled;
        }
      }

      let enemyAtk = tmpl.attack || 18;
      let enemyDef = tmpl.defense || 8;
      let enemySpd = tmpl.speed || 12;
      let critBonus = 0;
      let pinBonus = 0;

      if (equipped) {
        const rW = equipped.rightHand ? WEAPON_DATABASE[equipped.rightHand] : null;
        const lW = equipped.leftHand ? WEAPON_DATABASE[equipped.leftHand] : null;
        if (rW && rW.slotType === 'BOTH') {
          enemyAtk += rW.atkBonus;
          enemyDef += rW.defBonus;
          enemySpd += rW.spdBonus;
          critBonus += rW.critBonus || 0;
          pinBonus += rW.pinBonus || 0;
        } else {
          if (rW) {
            enemyAtk += rW.atkBonus;
            enemyDef += rW.defBonus;
            enemySpd += rW.spdBonus;
            critBonus += rW.critBonus || 0;
            pinBonus += rW.pinBonus || 0;
          }
          if (lW) {
            enemyAtk += lW.atkBonus;
            enemyDef += lW.defBonus;
            enemySpd += lW.spdBonus;
            critBonus += lW.critBonus || 0;
            pinBonus += lW.pinBonus || 0;
          }
        }
      }

      const hpMultiplier = isFirstBattle ? 0.75 : 1.0;
      const rawHp = tmpl.hp || 120;
      const tunedHp = Math.max(45, Math.round(rawHp * hpMultiplier));
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const startX = 280 - col * 28;
      const startY = 92 + row * 26 + (col === 1 ? 12 : 0);

      return buildFighter({
        id: `e_fighter_${idx}_${tmpl.culture}_${Date.now()}_${Math.random()}`,
        isPlayerTeam: false,
        name: tmpl.name,
        culture: tmpl.culture,
        title: tmpl.title,
        level: enemyLevel,
        hp: tunedHp,
        maxHp: tunedHp,
        attack: Math.max(5, enemyAtk),
        defense: Math.max(0, enemyDef),
        speed: Math.max(1, enemySpd),
        tactics: tmpl.tactics || 'aggressive',
        equipped,
        critBonus,
        pinBonus,
        isCavalry: tmpl.isCavalry || false,
        isElephant: tmpl.isElephant || false,
        isCharging: tmpl.isCavalry ? true : false,
        hasCavalryHit: false,
        elephantChargeCooldown: tmpl.isElephant ? 2.0 : undefined,
        x: startX,
        y: Math.max(88, Math.min(160, startY)),
        flipX: true, // facing left towards player squad
        animTimer: idx * 0.4,
        attackCooldown: 0.5 + idx * 0.2,
        tacticsTimer: 1.2 + Math.random(),
        pinCooldown: 1.0 + Math.random() * 3.0,
        consecutiveMisses: 0,
        repositionTimer: 0,
        stationaryDuelTimer: 0,
      });
    });

    arenaFightersRef.current = [...playerFighters, ...enemyFighters];

    addCombatLog(
      `🎺 The arena horn sounds! ${deployedGlads.length} champions face ${enemiesToSpawn.length} combatants in ${tier.name}${isTrial ? ' [Coliseum Trial]' : ' [Side Skirmish]'}!`,
      'neutral',
    );
    gameAudio.playSwordClash();
  };

  const closeAllCampModals = useCallback(() => {
    dismissStoryEvent(true);
    setIsHeraldSummonsOpen(false);
    setIsTrialBellModalOpen(false);
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    setIsArmoryModalOpen(false);
    setIsRosterModalOpen(false);
    setIsBondingModalOpen(false);
    setIsQuestBoardOpen(false);
    setActiveQuestNode(null);
    setQuestResolution(null);
    setIsGameMenuOpen(false);
    setIsHowToPlayOpen(false);
    setIsUpgradesModalOpen(false);
    setIsBreedingModalOpen(false);
    setIsVisitorModalOpen(false);
    setIsManagerMenuOpen(false);
    setActiveCascadingSubMenu('none');
    setSelectedCampGladId(null);
    setSelectedGraveId(null);
    setIsDebugMenuOpen(false);
    setIsEmperorDuelModalOpen(false);
    setIsRevoltCelebrationOpen(false);
    setBattlefieldLoot(null);
    setPepTalkState(null);
  }, [dismissStoryEvent]);

  // Launch Emperor 1-on-1 Duel Scenario (1 Player Champion vs Emperor Aurelius)
  const launchEmperorDuel = (targetGladId?: string) => {
    closeAllCampModals();
    isCurrentBattleTrialRef.current = false;
    isSandboxBattleRef.current = false;
    setIsSandboxBattle(false);
    isEmperorDuelRef.current = true;
    setIsEmperorDuel(true);
    setIsEmperorDuelModalOpen(false);

    const living = gladiatorsRef.current.filter((g) => g.hp > 0 && g.status === 'Available');
    if (living.length === 0) return;

    const requestedId = targetGladId || emperorDuelSelectedGladIdRef.current || undefined;
    const chosenGlad = requestedId ? living.find((g) => g.id === requestedId) : living[0];
    if (!chosenGlad) return;

    lastDeployedGladIdsRef.current = [chosenGlad.id];
    setSelectedGladiatorIds([chosenGlad.id]);

    const nextGlads = gladiatorsRef.current.map((g) =>
      g.id === chosenGlad.id ? { ...g, status: 'In Arena' as const } : g,
    );
    roster.set(nextGlads);

    const rightW = chosenGlad.equipped?.rightHand ? WEAPON_DATABASE[chosenGlad.equipped.rightHand] : null;
    const leftW = chosenGlad.equipped?.leftHand ? WEAPON_DATABASE[chosenGlad.equipped.leftHand] : null;
    const isTwoHanded = rightW && rightW.slotType === 'BOTH';
    const critBonus = isTwoHanded
      ? (rightW?.critBonus || 0)
      : (rightW?.critBonus || 0) + (leftW?.critBonus || 0);
    const pinBonus = isTwoHanded
      ? (rightW?.pinBonus || 0)
      : (rightW?.pinBonus || 0) + (leftW?.pinBonus || 0);

    const playerFighter: ArenaFighter = buildFighter({
      id: `p_fighter_${chosenGlad.id}`,
      sourceGladiatorId: chosenGlad.id,
      isPlayerTeam: true,
      name: chosenGlad.name,
      culture: chosenGlad.culture,
      title: chosenGlad.title,
      level: chosenGlad.level,
      hp: chosenGlad.hp,
      maxHp: chosenGlad.maxHp,
      attack: chosenGlad.attack,
      defense: chosenGlad.defense,
      speed: chosenGlad.speed,
      tactics: chosenGlad.tactics,
      equipped: chosenGlad.equipped,
      critBonus,
      pinBonus,
      heroType: chosenGlad.heroType,
      isCavalry: !!chosenGlad.isCavalry,
      isElephant: !!chosenGlad.isElephant,
      isCharging: !!chosenGlad.isCavalry,
      hasCavalryHit: false,
      elephantChargeCooldown: chosenGlad.isElephant ? 2.0 : undefined,
      attributes: chosenGlad.attributes,
      weightClass: chosenGlad.weightClass,
      gladiatorClass: chosenGlad.gladiatorClass,
      traits: chosenGlad.traits,
      pepTalkStatus: chosenGlad.pepTalkStatus,
      pepTalkThreatened: chosenGlad.pepTalkThreatened,
      x: 88,
      y: 125,
      flipX: false,
      animTimer: 0,
      attackCooldown: 0.4,
      tacticsTimer: 1.0,
      pinCooldown: 4.0,
      consecutiveMisses: 0,
      repositionTimer: 0,
      stationaryDuelTimer: 0,
    });

    const emperorFighter: ArenaFighter = buildFighter({
      id: `emperor_aurelius_${Date.now()}`,
      isPlayerTeam: false,
      isEmperor: true,
      name: 'Emperor Aurelius',
      culture: 'roman',
      title: 'The Gilded Tyrant',
      level: 5,
      hp: 520,
      maxHp: 520,
      attack: 42,
      defense: 25,
      speed: 13,
      tactics: 'aggressive',
      equipped: { rightHand: 'damascene_spatha', leftHand: 'gilded_tower_aegis' },
      critBonus: 0.15,
      pinBonus: 0.20,
      x: 250,
      y: 125,
      flipX: true,
      animTimer: 0,
      attackCooldown: 0.5,
      tacticsTimer: 1.2,
      pinCooldown: 3.5,
      consecutiveMisses: 0,
      repositionTimer: 0,
      stationaryDuelTimer: 0,
    });

    arenaFightersRef.current = [playerFighter, emperorFighter];
    setActiveTier(EMPEROR_DUEL_TIER);
    activeTierRef.current = EMPEROR_DUEL_TIER;
    setCombatOutcome('in_progress');
    combatOutcomeRef.current = 'in_progress';
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    deploymentTierRef.current = null;
    setMode('arena');
    modeRef.current = 'arena';
    setCombatLogs([]);
    setCrispPopups([]);
    projectilesRef.current = [];
    particlesRef.current = [];
    arenaSpeechBubblesRef.current = [];
    matchTimerRef.current = 0;

    judgmentStateRef.current = {
      ...INITIAL_JUDGMENT_STATE,
      isTrial: false,
    };
    setJudgmentState(judgmentStateRef.current);

    addCombatLog(
      `👑 OUTRAGE ON THE ARENA SANDS! Emperor Aurelius descends from his imperial balcony in gilded lorica squamata armor! 1-on-1 Duel commences against ${chosenGlad.name}!`,
      'crit',
    );
    gameAudio.playHeraldTrumpet();
    gameAudio.playSwordClash();
  };

  // Launch Slave Uprising Sandbox Battle Scenario
  const launchSandboxBattle = () => {
    closeAllCampModals();
    isCurrentBattleTrialRef.current = false;
    isSandboxBattleRef.current = true;
    setIsSandboxBattle(true);
    setSandboxTelemetry({ rebelDamageDealt: 0, romanDamageDealt: 0 });
    sandboxTelemetryRef.current = { rebelDamageDealt: 0, romanDamageDealt: 0 };
    setSandboxOutcomeAlert(null);
    setIsSimulatedAdActive(false);
    adCountdownRef.current = 5.0;
    sandboxHoldTimerRef.current = 0;

    // Player Side: Automatically spawn all current gladiators from player's active roster
    const activePlayerGlads = gladiatorsRef.current.filter((g) => g.hp > 0);
    lastDeployedGladIdsRef.current = activePlayerGlads.map((g) => g.id);

    const nextGlads = gladiatorsRef.current.map((g) =>
      activePlayerGlads.some((ag) => ag.id === g.id) ? { ...g, status: 'In Arena' as const } : g,
    );
    roster.set(nextGlads);

    const deployedPlayerFighters: ArenaFighter[] = activePlayerGlads.map((g, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const startX = 60 + col * 20;
      const startY = 95 + row * 24;

      return buildFighter({
        id: `p_glad_${g.id}`,
        sourceGladiatorId: g.id,
        isPlayerTeam: true,
        name: g.name,
        culture: g.culture,
        title: g.title,
        level: g.level,
        hp: g.hp,
        maxHp: g.maxHp,
        attack: g.attack,
        defense: g.defense,
        speed: g.speed,
        tactics: g.tactics,
        equipped: g.equipped,
        x: startX,
        y: Math.max(88, Math.min(160, startY)),
        flipX: false,
        animTimer: idx * 0.2,
        attackCooldown: 0.4 + idx * 0.1,
        tacticsTimer: 1.0,
        pinCooldown: 2.0,
      });
    });

    // Alongside 15 low-armor Rebel Slaves (low health, low defense, fast attack speeds)
    const cultures: Culture[] = ['celt', 'berber', 'roman', 'scythian', 'hunnic'];
    const slaveFighters: ArenaFighter[] = Array.from({ length: 15 }).map((_, idx) => {
      const culture = cultures[idx % cultures.length];
      const startX = 35 + (idx % 3) * 16 + (Math.random() * 8 - 4);
      const startY = 88 + Math.floor(idx / 3) * 15 + (Math.random() * 6 - 3);

      return buildFighter({
        id: `rebel_slave_${idx}_${Date.now()}`,
        isPlayerTeam: true,
        name: `Rebel Slave ${toRoman(idx + 1)}`,
        culture,
        title: 'Rebel Slave (Fast Agility)',
        level: 1,
        hp: 48,
        maxHp: 48,
        attack: 16,
        defense: 3,
        speed: 21,
        tactics: 'aggressive',
        x: Math.max(35, Math.min(120, startX)),
        y: Math.max(86, Math.min(164, startY)),
        flipX: false,
        animTimer: Math.random() * 2,
        attackCooldown: 0.25 + Math.random() * 0.3,
        tacticsTimer: 1.0,
        pinCooldown: 2.5,
      });
    });

    // Enemy Side: 10 heavily armored Roman Legionaries (massive HP, high defense, slow attack)
    const romanFighters: ArenaFighter[] = Array.from({ length: 10 }).map((_, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const startX = 250 - col * 24 + (Math.random() * 6 - 3);
      const startY = 90 + row * 15 + (Math.random() * 6 - 3);

      return buildFighter({
        id: `roman_legionary_${idx}_${Date.now()}`,
        isPlayerTeam: false,
        name: `Roman Legionary ${toRoman(idx + 1)}`,
        culture: 'roman',
        title: 'Roman Legionary (Heavy Lorica)',
        level: 3,
        hp: 340,
        maxHp: 340,
        attack: 28,
        defense: 22,
        speed: 8,
        tactics: 'defensive',
        x: Math.max(200, Math.min(300, startX)),
        y: Math.max(86, Math.min(164, startY)),
        flipX: true,
        animTimer: Math.random() * 2,
        attackCooldown: 1.1 + Math.random() * 0.4,
        tacticsTimer: 1.5,
        pinCooldown: 3.0,
      });
    });

    arenaFightersRef.current = [...deployedPlayerFighters, ...slaveFighters, ...romanFighters];

    const sandboxTier: BattleTier = {
      id: 'sandbox_uprising',
      name: 'Rome in Flames (Slave Uprising Sandbox)',
      difficulty: 'Epic Sandbox',
      goldReward: 240, // 20% reduced gold reward
      description: 'The slave rebellion clashes with the Roman imperial garrison before the gates of Rome in Flames.',
      enemies: romanFighters.map((rf) => ({
        name: rf.name,
        culture: rf.culture,
        title: rf.title,
        hp: rf.hp,
        attack: rf.attack,
        defense: rf.defense,
        speed: rf.speed,
        tactics: rf.tactics,
      })),
    };
    setActiveTier(sandboxTier);
    activeTierRef.current = sandboxTier;
    setCombatOutcome('in_progress');
    combatOutcomeRef.current = 'in_progress';
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    deploymentTierRef.current = null;
    setIsDebugMenuOpen(false);
    setMode('arena');
    modeRef.current = 'arena';
    setIsCombatLogCollapsed(true);
    setCombatLogs([]);
    setCrispPopups([]);
    projectilesRef.current = [];
    particlesRef.current = [];
    arenaSpeechBubblesRef.current = [];
    matchTimerRef.current = 0;

    judgmentStateRef.current = {
      active: false,
      phase: 'hold',
      startTime: 0,
      cameraPanY: 0,
      verdict: 'thumbs_up',
      isPlayerVictorious: true,
      isTrial: false,
      hasDownedGlads: false,
      downedGladIds: [],
      audioTriggered: { build: false, cheer: false, slash: false, murmur: false, executionRoar: false },
    };
    setJudgmentState(judgmentStateRef.current);

    addCombatLog(
      `🔥 ROME IN FLAMES! The Slave Uprising begins: 15 Rebel Slaves & Ludus Champions clash with 10 Roman Legionaries!`,
      'crit',
    );
    gameAudio.playChiptuneExplosion();
    gameAudio.playSwordClash();
  };

  const launchCampDefenseBattle = () => {
    dismissStoryEvent(true);
    isCurrentBattleTrialRef.current = false;
    isSandboxBattleRef.current = false;
    setIsSandboxBattle(false);
    isEmperorDuelRef.current = false;
    setIsEmperorDuel(false);
    isBanditRaidRef.current = true;
    setIsBanditAlarmOpen(false);

    const activePlayerGlads = gladiatorsRef.current.filter((g) => g.hp > 0);
    lastDeployedGladIdsRef.current = activePlayerGlads.map((g) => g.id);

    const nextGlads = gladiatorsRef.current.map((g) =>
      activePlayerGlads.some((ag) => ag.id === g.id) ? { ...g, status: 'In Arena' as const } : g,
    );
    roster.set(nextGlads);

    const playerFighters: ArenaFighter[] = activePlayerGlads.map((g, idx) => buildFighter({
      id: `p_defend_${g.id}`,
      sourceGladiatorId: g.id,
      isPlayerTeam: true,
      name: g.name,
      culture: g.culture,
      title: g.title,
      level: g.level,
      hp: g.hp,
      maxHp: g.maxHp,
      attack: g.attack,
      defense: g.defense,
      speed: g.speed,
      tactics: g.tactics,
      equipped: g.equipped,
      x: 65 + (idx % 2) * 25,
      y: 95 + Math.floor(idx / 2) * 22,
      flipX: false,
      animTimer: idx * 0.2,
      attackCooldown: 0.3 + idx * 0.1,
      tacticsTimer: 1.0,
      pinCooldown: 2.0,
    }));

    const bandits: ArenaFighter[] = [
      buildFighter({
        id: `bandit_cutthroat_${Date.now()}_1`,
        isPlayerTeam: false,
        name: 'Rogue Cutthroat',
        culture: 'roman',
        title: 'Bandit Cutthroat (Lvl II)',
        level: 2,
        hp: 140,
        maxHp: 140,
        attack: 24,
        defense: 10,
        speed: 14,
        tactics: 'aggressive',
        x: 260,
        y: 105,
        flipX: true,
        animTimer: 0,
        attackCooldown: 0.5,
        tacticsTimer: 1.0,
        pinCooldown: 2.5,
      }),
      buildFighter({
        id: `bandit_marauder_${Date.now()}_2`,
        isPlayerTeam: false,
        name: 'Camp Marauder',
        culture: 'celt',
        title: 'Marauder Reaver (Lvl II)',
        level: 2,
        hp: 155,
        maxHp: 155,
        attack: 25,
        defense: 9,
        speed: 13,
        tactics: 'aggressive',
        x: 275,
        y: 130,
        flipX: true,
        animTimer: 0.2,
        attackCooldown: 0.4,
        tacticsTimer: 1.2,
        pinCooldown: 3.0,
      }),
      buildFighter({
        id: `bandit_outlaw_${Date.now()}_3`,
        isPlayerTeam: false,
        name: 'Outlaw Slinger',
        culture: 'berber',
        title: 'Bandit Outlaw (Lvl II)',
        level: 2,
        hp: 120,
        maxHp: 120,
        attack: 22,
        defense: 8,
        speed: 16,
        tactics: 'ranged',
        x: 290,
        y: 150,
        flipX: true,
        animTimer: 0.4,
        attackCooldown: 0.6,
        tacticsTimer: 1.0,
        pinCooldown: 2.5,
      }),
    ];

    arenaFightersRef.current = [...playerFighters, ...bandits];

    const raidTier: BattleTier = {
      id: 'camp_bandit_raid',
      name: 'Camp Defense: Rogue Marauders',
      difficulty: 'Courtyard Breach',
      goldReward: 160, // 20% reduced gold reward
      description: 'Bandits and marauders breach the ludus perimeter! Defend your barracks and courtyard!',
      mapTheme: 'camp_defense',
      enemies: bandits.map((b) => ({
        name: b.name,
        culture: b.culture,
        title: b.title,
        hp: b.hp,
        attack: b.attack,
        defense: b.defense,
        speed: b.speed,
        tactics: b.tactics,
      })),
    };
    setActiveTier(raidTier);
    activeTierRef.current = raidTier;
    setCombatOutcome('in_progress');
    combatOutcomeRef.current = 'in_progress';
    setIsBattlesModalOpen(false);
    setDeploymentTier(null);
    deploymentTierRef.current = null;
    setMode('arena');
    modeRef.current = 'arena';
    setCombatLogs([]);
    setCrispPopups([]);
    projectilesRef.current = [];
    particlesRef.current = [];
    arenaSpeechBubblesRef.current = [];
    matchTimerRef.current = 0;

    addCombatLog(
      '🚨 BANDITS BREACH THE PERIMETER! Defend the ludus courtyard against rogue marauders!',
      'crit',
    );
    gameAudio.playShieldBlock();
    gameAudio.playSwordClash();
  };

  const triggerRebelReinforcements = () => {
    if (isSimulatedAdActive || combatOutcome !== 'in_progress') return;
    setIsSimulatedAdActive(true);
    setAdCountdown(5.0);
    adCountdownRef.current = 5.0;
    gameAudio.playCrispClick();
  };

  // Conclude Duel entrypoint: triggers Emperor's Judgment Cinematic for ALL normal arena battles
  const finishDuel = useCallback(
    (isVictory: boolean) => {
      if (combatOutcomeRef.current !== 'in_progress') return;

      // Grace period safety check: never finish duel if match timer < 1.0
      if (matchTimerRef.current < 1.0 && !isSandboxBattleRef.current) {
        return;
      }

      if (
        isSandboxBattleRef.current ||
        isEmperorDuelRef.current ||
        isSpecialNarrativeQuest(activeTierRef.current) ||
        activeTierRef.current?.mapTheme === 'camp_defense'
      ) {
        // Flow on battle finish: NO Emperor's Judgment screen for special narrative quests, sandbox, camp defense, or Emperor 1v1 duel.
        setCombatOutcome(isVictory ? 'victory' : 'defeat');
        combatOutcomeRef.current = isVictory ? 'victory' : 'defeat';
        sandboxHoldTimerRef.current = 2.5;
        return;
      }

      const isTrial = isCurrentBattleTrialRef.current;
      const tier = activeTierRef.current;
      if (!tier) return;

      const fighters = arenaFightersRef.current;
      const allGlads = gladiatorsRef.current;
      const downedGlads = fighters.filter(
        (f) => f.isPlayerTeam && f.sourceGladiatorId && f.hp <= 0,
      );
      const hasDowned = downedGlads.length > 0;
      const allAlive = isVictory && !hasDowned;

      // Emperor's Judgment Verdict Logic:
      // If all gladiators survived with HP > 0, Emperor gives thumbs UP in approval.
      // If player lost the battle or had downed gladiators, roll chance for mercy:
      // Increased chance of thumbs down by 50% overall (from 0.50 to 0.75 thumbs down probability!)
      let verdict: 'thumbs_up' | 'thumbs_down' = 'thumbs_up';
      if (!allAlive) {
        verdict = Math.random() < 0.75 ? 'thumbs_down' : 'thumbs_up';
      }

      // Reset living fighters velocity and set them to walk-in-place pacing stance
      fighters.forEach((f) => {
        if (f.hp > 0 && !f.isDead && f.state !== 'death') {
          f.vx = 0;
          f.vy = 0;
          f.state = 'walking';
          f.pinnedTargetId = undefined;
          f.pinnedByFighterId = undefined;
          f.isCharging = false;
          f.stunTimer = 0;
          f.repositionTimer = 0;
          f.consecutiveMisses = 0;
          f.stationaryDuelTimer = 0;
        } else {
          f.hp = 0;
          f.isDead = true;
          f.state = 'death';
          f.vx = 0;
          f.vy = 0;
          f.stunTimer = 0;
          f.pinnedTimer = 0;
          f.isCharging = false;
          f.pinnedTargetId = undefined;
          f.pinnedByFighterId = undefined;
          f.repositionTimer = 0;
          f.consecutiveMisses = 0;
          f.stationaryDuelTimer = 0;
        }
      });

      // Trigger Emperor's Judgment Cinematic for both Colosseum trials and Arena side quests
      const now = getSafeNow();
      const jState: JudgmentState = {
        active: true,
        phase: 'hold',
        startTime: now,
        cameraPanY: 0,
        verdict,
        isPlayerVictorious: isVictory,
        isTrial,
        hasDownedGlads: hasDowned,
        downedGladIds: downedGlads.map((f) => f.sourceGladiatorId!),
        audioTriggered: { build: false, cheer: false, slash: false, murmur: false, executionRoar: false },
      };
      judgmentStateRef.current = jState;
      setJudgmentState(jState);
      addCombatLog(
        `👑 The arena crowd hushes... Ascending to the Emperor's Balcony for Imperial Judgment!`,
        'neutral',
      );
    },
    [addCombatLog],
  );

  // Update Projectiles with Realistic Ballistic Arc & Ground / Shield Impact Physics
  const updateProjectiles = (dt: number, allowCombatDamage = true) => {
    const fighters = arenaFightersRef.current;
    const forts = activeTierRef.current?.fortifications;

    projectilesRef.current = projectilesRef.current.filter((proj) => {
      // Natural arc trajectory with gravity
      const gravity = proj.isStone ? 80 : 50;
      proj.vy += gravity * dt;
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Arena sand floor ground impact (y >= 168)
      if (proj.y >= 168) {
        const ownerFighter = fighters.find((f) => f.id === proj.ownerId);
        if (ownerFighter && (!proj.hitFighterIds || proj.hitFighterIds.length === 0)) {
          ownerFighter.consecutiveMisses = (ownerFighter.consecutiveMisses || 0) + 1;
        }
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: proj.x + (Math.random() - 0.5) * 6,
            y: 168,
            color: PALETTE[1],
            vx: (Math.random() - 0.5) * 12,
            vy: -8 - Math.random() * 8,
            life: 0.35,
            maxLife: 0.35,
            size: 1,
          });
        }
        return false;
      }

      // Check collision with enemy targets (skip already hit targets for piercing tridents and dead units)
      const hitTarget = fighters.find(
        (f) =>
          f.isPlayerTeam !== proj.isPlayerTeam &&
          f.hp > 0 &&
          !f.isDead &&
          f.state !== 'death' &&
          (!proj.hitFighterIds || !proj.hitFighterIds.includes(f.id)) &&
          Math.hypot(f.x - proj.x, f.y - 14 - proj.y) < 16,
      );

      if (hitTarget) {
        if (!allowCombatDamage) {
          // During Emperor Pan / post-battle: impact / shield deflect without altering match outcome
          gameAudio.playShieldBlock();
          spawnSparkles(proj.x, proj.y, PALETTE[11], 4);
          return false;
        }

        const ownerFighter = fighters.find((f) => f.id === proj.ownerId);
        const isOwnerRaging = (ownerFighter?.rageTimer ?? 0) > 0;

        // Defensive AI alert tracking: missile hit increments bombardment count
        hitTarget.consecutiveMissilesTaken = (hitTarget.consecutiveMissilesTaken || 0) + 1;

        // LOW WALL MISSILE COVER CHECK: 40% chance for missile to ping off low stone wall
        if (forts && forts.length > 0) {
          const hasWallCover = forts.some((f) => {
            if (f.type !== 'low_wall') return false;
            return (
              hitTarget.x >= f.x - 4 &&
              hitTarget.x <= f.x + f.w + 14 &&
              hitTarget.y >= f.y - 6 &&
              hitTarget.y <= f.y + f.h + 6
            );
          });
          if (hasWallCover && Math.random() < 0.40) {
            gameAudio.playShieldBlock();
            spawnCrispPopup(hitTarget.x, hitTarget.y - 14, 'WALL DEFLECT!', '#a4968d');
            addCombatLog(`🧱 Low stone wall deflected the incoming missile aimed at ${hitTarget.name}!`, 'neutral');
            if (ownerFighter) {
              ownerFighter.consecutiveMisses = (ownerFighter.consecutiveMisses || 0) + 1;
            }
            return false;
          }
        }

        // Base miss chance: 18% for Throwing Trident, 5% for others
        const baseMissChance = proj.isPiercingTrident ? 0.18 : 0.05;
        const isMiss = !isOwnerRaging && Math.random() < baseMissChance;

        if (isMiss) {
          gameAudio.playSwoosh();
          spawnCrispPopup(hitTarget.x, hitTarget.y - 14, 'MISS', '#a4968d');
          addCombatLog(`💨 Projectile shot missed ${hitTarget.name}!`, 'neutral');
          if (ownerFighter) {
            ownerFighter.consecutiveMisses = (ownerFighter.consecutiveMisses || 0) + 1;
          }
        } else {
          if (ownerFighter) {
            ownerFighter.consecutiveMisses = 0;
            ownerFighter.stationaryDuelTimer = 0;
          }
          hitTarget.stationaryDuelTimer = 0;
          if (proj.isStone) {
            gameAudio.playFootstepStone();
          }
          applyDamageToFighter(hitTarget, proj.damage, proj.isCrit, proj.vx, proj.vy);
        }

        // Piercing Trident behavior: pierces up to 2 enemy targets in a line!
        if (proj.isPiercingTrident) {
          proj.pierceCount = (proj.pierceCount || 0) + 1;
          proj.hitFighterIds = proj.hitFighterIds || [];
          proj.hitFighterIds.push(hitTarget.id);

          if (proj.pierceCount < 2) {
            return proj.life > 0 && proj.x >= 20 && proj.x <= LOGIC_WIDTH - 20;
          }
        }

        return false;
      }

      const isAlive = proj.life > 0 && proj.x >= 20 && proj.x <= LOGIC_WIDTH - 20;
      if (!isAlive) {
        const ownerFighter = fighters.find((f) => f.id === proj.ownerId);
        if (ownerFighter && (!proj.hitFighterIds || proj.hitFighterIds.length === 0)) {
          ownerFighter.consecutiveMisses = (ownerFighter.consecutiveMisses || 0) + 1;
        }
        return false;
      }
      return true;
    });
  };

  // Real-Time Combat Simulation Step (Physics, AI Psychology, Stamina, Pins, Crits)
  const stepArenaCombat = (dt: number) => {
    if (combatOutcomeRef.current !== 'in_progress') return;
    if (judgmentStateRef.current.active) return;

    matchTimerRef.current += dt;
    const fighters = arenaFightersRef.current;

    // Arena sand floor boundaries
    const MIN_X = 40;
    const MAX_X = 304;
    const MIN_Y = 82;
    const MAX_Y = 168;

    // Check living fighters for each squad
    const livingPlayerFighters = fighters.filter(
      (f) => f.isPlayerTeam && f.hp > 0 && !f.isDead && f.state !== 'death',
    );
    const livingEnemyFighters = fighters.filter(
      (f) => !f.isPlayerTeam && f.hp > 0 && !f.isDead && f.state !== 'death',
    );

    // CRITICAL SAFETY GUARDS & GRACE PERIOD:
    // 1) Verify both teams actually have seeded combatants:
    const totalPlayerCount = fighters.filter((f) => f.isPlayerTeam).length;
    const totalEnemyCount = fighters.filter((f) => !f.isPlayerTeam).length;

    if (totalPlayerCount === 0 || totalEnemyCount === 0) {
      console.error('[Combat Safety Guard] Battle running with unseeded teams!', {
        totalPlayerCount,
        totalEnemyCount,
        matchTimer: matchTimerRef.current,
      });
      return; // Do NOT check win/loss! Wait for proper seeding.
    }

    // 2) Initialization Grace Period:
    // NEVER evaluate victory or defeat during the first 1.0 second of battle!
    // (Guarantees combatants are rendered, physics start, and prevents frame-0 instant-win bugs)
    if (matchTimerRef.current >= 1.0) {
      // Check match victory/defeat resolution
      if (livingEnemyFighters.length === 0) {
        if (isSandboxBattleRef.current) {
          setSandboxOutcomeAlert('🏆 REBELLION TRIUMPHANT! All Roman Legionaries defeated!');
        }
        finishDuel(true);
        return;
      }
      if (livingPlayerFighters.length === 0) {
        if (isSandboxBattleRef.current) {
          setSandboxOutcomeAlert('💀 REBELLION CRUSHED! All Rebel Slaves defeated!');
        }
        finishDuel(false);
        return;
      }
    }

    // Track missile hits on enemy team for defensive AI alert in fortified quests
    const currentTier = activeTierRef.current;
    const currentFortifications = currentTier?.fortifications;
    const isFortifiedQuest = !!currentTier?.isFortifiedQuest;

    // Check Saladin the Medic's healing aura in battle
    for (const fighter of fighters) {
      if (fighter.isPlayerTeam && fighter.heroType === 'saladin' && fighter.hp > 0) {
        fighter.saladinAuraTimer = (fighter.saladinAuraTimer || 0) + dt;
        if (fighter.saladinAuraTimer >= 1.8) {
          fighter.saladinAuraTimer = 0;
          const nearbyAllies = fighters.filter(
            (f) => f.isPlayerTeam && f.hp > 0 && f.id !== fighter.id && Math.hypot(f.x - fighter.x, f.y - fighter.y) < 80,
          );
          if (nearbyAllies.length > 0) {
            nearbyAllies.forEach((ally) => {
              if (ally.hp < ally.maxHp) {
                ally.hp = Math.min(ally.maxHp, ally.hp + 7);
                spawnCrispPopup(ally.x, ally.y - 14, '+7 HP', '#4ade80');
                spawnSparkles(ally.x, ally.y - 10, '#55796f', 4);
              }
            });
            gameAudio.playHoverMicroTone();
          }
        }
      }
    }

    // 1. UPDATE FIGHTERS
    for (const fighter of fighters) {
      fighter.animTimer += dt;

      // UNCONDITIONAL DEFEAT GUARD:
      // If hp <= 0 or isDead, unit is permanently in death state. Clear all interrupts and stop living actions immediately!
      if (fighter.hp <= 0 || fighter.isDead || fighter.state === 'death') {
        fighter.hp = 0;
        fighter.isDead = true;
        fighter.state = 'death';
        fighter.stunTimer = 0;
        fighter.pinnedTimer = 0;
        fighter.pinnedByFighterId = undefined;
        fighter.pinnedTargetId = undefined;
        fighter.isCharging = false;
        fighter.chargeTimer = 0;
        fighter.chargeVx = 0;
        fighter.chargeVy = 0;
        fighter.blindDistractTimer = 0;
        fighter.moraleRallyTimer = 0;

        if (fighter.deathTimer > 0) {
          fighter.deathTimer = Math.max(0, fighter.deathTimer - dt);
          fighter.x += fighter.vx * dt;
          fighter.y += fighter.vy * dt;
          fighter.vx *= 0.88;
          fighter.vy *= 0.88;
        } else {
          fighter.vx = 0;
          fighter.vy = 0;
        }
        continue;
      }

      if (fighter.attackCooldown > 0) fighter.attackCooldown -= dt;
      // Arena Pin Cooldown System: Time spent being pinned does NOT count towards that timer
      if (fighter.state !== 'pinned' && fighter.pinCooldown > 0) {
        fighter.pinCooldown -= dt;
      }
      if (fighter.flashWhiteTimer > 0) fighter.flashWhiteTimer -= dt;
      if (fighter.rageTimer > 0) fighter.rageTimer -= dt;

      // Handle Manager Morale Rally & Blind Distract Timers
      if (fighter.moraleRallyTimer && fighter.moraleRallyTimer > 0) {
        fighter.moraleRallyTimer -= dt;
      }
      if (fighter.blindDistractTimer && fighter.blindDistractTimer > 0) {
        fighter.blindDistractTimer -= dt;
        fighter.state = 'hurt';
        fighter.vx *= 0.7;
        fighter.vy *= 0.7;
        continue;
      }

      // Handle Stunned / Knocked Down Fighter (from War Elephant Tusk Trample) - ONLY IF LIVING
      if (fighter.stunTimer && fighter.stunTimer > 0) {
        fighter.stunTimer -= dt;
        fighter.state = 'pinned'; // unable to attack or move
        fighter.vx *= 0.82;
        fighter.vy *= 0.82;
        fighter.x += fighter.vx * dt;
        fighter.y += fighter.vy * dt;
        if (fighter.stunTimer <= 0) {
          fighter.stunTimer = 0;
          fighter.state = 'idle';
          addCombatLog(`🛡️ ${fighter.name} regains their footing from the sand!`, 'neutral');
        }
        continue;
      }

      // Handle War Elephant Tusk Trample Charge in progress
      if (fighter.isElephant) {
        if (fighter.elephantChargeCooldown === undefined) fighter.elephantChargeCooldown = 2.0;
        if (fighter.elephantChargeCooldown > 0) fighter.elephantChargeCooldown -= dt;

        if (fighter.isCharging) {
          fighter.chargeTimer = (fighter.chargeTimer || 0) - dt;
          fighter.x += (fighter.chargeVx || 0) * dt;
          fighter.y += (fighter.chargeVy || 0) * dt;

          // Dust particles
          if (Math.random() < 0.5) {
            particlesRef.current.push({
              x: fighter.x + (fighter.flipX ? 14 : -14),
              y: fighter.y + 4,
              color: PALETTE[1],
              vx: (Math.random() - 0.5) * 16,
              vy: -10 - Math.random() * 12,
              life: 0.55,
              maxLife: 0.55,
            });
          }

          // Check collisions with opposing team
          const opposingFighters = fighters.filter(
            (f) => f.isPlayerTeam !== fighter.isPlayerTeam && f.hp > 0 && !f.isDead && f.state !== 'death',
          );
          for (const opp of opposingFighters) {
            const hitDist = Math.hypot(opp.x - fighter.x, opp.y - fighter.y);
            if (hitDist < 26 && (!opp.stunTimer || opp.stunTimer <= 0)) {
              // TUSK TRAMPLE IMPACT!
              const trampleDmg = Math.max(28, Math.round(fighter.attack * 1.6 - opp.defense * 0.25));
              const stunDuration = 1.0 + Math.random() * 2.0; // 1.0 - 3.0 seconds

              const knockDir = (fighter.chargeVx && fighter.chargeVx > 0) ? 1 : -1;
              opp.vx += knockDir * 65;
              opp.vy += (Math.random() - 0.5) * 35;

              applyDamageToFighter(opp, trampleDmg, true, knockDir * 20, 0, fighter.name);

              // Only apply stun if target survived the blow!
              if (opp.hp > 0 && !opp.isDead) {
                opp.stunTimer = stunDuration;
                opp.state = 'pinned';
                opp.pinnedTimer = stunDuration;
                addCombatLog(
                  `🐘 ${fighter.name} TUSK TRAMPLE crushes ${opp.name}! Knocked down for ${stunDuration.toFixed(1)}s!`,
                  'crit',
                );
              }
            }
          }

          if (fighter.chargeTimer <= 0) {
            fighter.isCharging = false;
            fighter.elephantChargeCooldown = 6.0; // 6.0 second cooldown!
          }
          // Clamp inside arena floor
          fighter.x = Math.max(MIN_X, Math.min(MAX_X, fighter.x));
          fighter.y = Math.max(MIN_Y, Math.min(MAX_Y, fighter.y));
          continue;
        }
      }

      // Handle Pinned Victim State (Upright struggle with subtle tremble)
      if (fighter.state === 'pinned') {
        fighter.pinnedTimer -= dt;
        fighter.stamina = Math.min(
          fighter.maxStamina,
          fighter.stamina + 8 * dt,
        );
        // Release from pin when timer expires
        if (fighter.pinnedTimer <= 0) {
          fighter.state = 'idle';
          fighter.pinnedByFighterId = undefined;
          addCombatLog(
            `🛡️ ${fighter.name} breaks free from the pin!`,
            'neutral',
          );
          if (Math.random() < 0.65) {
            triggerArenaSpeech(fighter, 'release_pin');
          }
        }
        continue;
      }

      // Handle Pinning Attacker State (Stands upright gripping victim)
      if (fighter.state === 'pinning') {
        const victim = fighters.find((f) => f.id === fighter.pinnedTargetId);
        if (!victim || victim.hp <= 0 || victim.state !== 'pinned') {
          fighter.state = 'idle';
          fighter.pinnedTargetId = undefined;
        } else {
          // Keep pinning fighter positioned against standing victim
          fighter.x = victim.x + (fighter.flipX ? 9 : -9);
          fighter.y = victim.y;
        }
        continue;
      }

      // Stamina Regeneration (+18/s when active, +24/s when resting)
      const staminaRegen = fighter.isBaiting ? 25 : 18;
      fighter.stamina = Math.min(
        fighter.maxStamina,
        fighter.stamina + staminaRegen * dt,
      );

      // Find Target:
      // CAVALRY TARGETING PRIORITY: Seeks out ranged / skirmisher / backliner units first
      const enemies = fighters.filter(
        (f) => f.isPlayerTeam !== fighter.isPlayerTeam && f.hp > 0,
      );
      if (enemies.length === 0) continue;

      let target: ArenaFighter | undefined;

      if (fighter.isCavalry) {
        // Specifically seeks out and targets ranged / projectile / skirmisher units first
        const rangedOrSkirmishers = enemies.filter(
          (e) =>
            e.tactics === 'ranged' ||
            e.culture === 'berber' ||
            e.culture === 'scythian' ||
            e.title.toLowerCase().includes('skirmisher') ||
            e.title.toLowerCase().includes('slinger') ||
            e.title.toLowerCase().includes('archer') ||
            e.title.toLowerCase().includes('beastmaster'),
        );

        if (rangedOrSkirmishers.length > 0) {
          // Target closest ranged/skirmisher unit
          let minDist = 9999;
          for (const e of rangedOrSkirmishers) {
            const d = Math.hypot(e.x - fighter.x, e.y - fighter.y);
            if (d < minDist) {
              minDist = d;
              target = e;
            }
          }
        } else {
          // Otherwise target lower defense backliners
          const sortedByDef = [...enemies].sort((a, b) => a.defense - b.defense);
          target = sortedByDef[0];
        }
      }

      if (!target) {
        target = enemies.find((f) => f.state === 'pinned');
        if (!target) {
          let minDist = 9999;
          for (const e of enemies) {
            const d = Math.hypot(e.x - fighter.x, e.y - fighter.y);
            if (d < minDist) {
              minDist = d;
              target = e;
            }
          }
        }
      }
      if (!target) continue;

      const dx = target.x - fighter.x;
      const dy = target.y - fighter.y;
      const dist = Math.hypot(dx, dy);

      // Update facing orientation
      if (Math.abs(dx) > 2) {
        fighter.flipX = dx < 0;
      }

      // ZUZUBU UNIQUE HERO ABILITY: Massive Heavy Spear Chuck on Initial Charge (+65 DMG)
      // Chucks a massive heavy spear ONCE on initial charge for colossal piercing damage, then draws twin curved swords!
      if (fighter.heroType === 'zuzubu' && !fighter.zuzubuThrownSpear && dist <= 165 && fighter.attackCooldown <= 0) {
        fighter.zuzubuThrownSpear = true;
        fighter.attackCooldown = 0.8;
        fighter.stamina = Math.max(10, fighter.stamina - 15);
        fighter.state = 'attack';
        setTimeout(() => {
          if (fighter.state === 'attack') fighter.state = 'idle';
        }, 220);

        const projSpeed = 190;
        const pVx = (dx / dist) * projSpeed;
        const pVy = (dy / dist) * projSpeed;

        projectilesRef.current.push({
          id: `zuzubu_spear_${nextProjId.current++}`,
          ownerId: fighter.id,
          isPlayerTeam: fighter.isPlayerTeam,
          x: fighter.x + (fighter.flipX ? -8 : 8),
          y: fighter.y - 14,
          vx: pVx,
          vy: pVy,
          damage: Math.round(fighter.attack * 1.8 + 25),
          isCrit: true,
          life: 1.5,
          maxLife: 1.5,
          culture: fighter.culture,
          isPiercingTrident: true,
          pierceCount: 0,
          hitFighterIds: [],
        });

        gameAudio.playSwoosh();
        addCombatLog(
          `🐆 ZUZUBU chucks his massive heavy war spear on the charge for colossal piercing damage! Drawing twin curved swords!`,
          'crit',
        );
        continue;
      }

      // THROWING TRIDENT (Fuscina de Venator) UNIQUE MECHANIC:
      // Thrown ONCE at battle start / first engagement for massive damage (+45 DMG).
      // Pierces up to 2 enemy targets in a line! Higher miss chance (18%).
      // After throwing, the gladiator switches to Bare Fists for remainder of fight!
      const hasTridentEquipped = fighter.equipped?.rightHand === 'throwing_trident';
      if (hasTridentEquipped && !fighter.hasThrownTrident && dist <= 170 && fighter.attackCooldown <= 0) {
        fighter.hasThrownTrident = true;
        fighter.attackCooldown = 0.8;
        fighter.stamina = Math.max(10, fighter.stamina - 15);
        fighter.state = 'attack';
        setTimeout(() => {
          if (fighter.state === 'attack') fighter.state = 'idle';
        }, 220);

        const projSpeed = 150;
        const pVx = (dx / dist) * projSpeed;
        const pVy = (dy / dist) * projSpeed;

        projectilesRef.current.push({
          id: `trident_${nextProjId.current++}`,
          ownerId: fighter.id,
          isPlayerTeam: fighter.isPlayerTeam,
          x: fighter.x + (fighter.flipX ? -8 : 8),
          y: fighter.y - 14,
          vx: pVx,
          vy: pVy,
          damage: fighter.attack + 45,
          isCrit: true,
          life: 1.6,
          maxLife: 1.6,
          culture: fighter.culture,
          isPiercingTrident: true,
          pierceCount: 0,
          hitFighterIds: [],
        });

        // Switch to Bare Fists / Cestus for the remainder of the battle
        if (fighter.equipped) {
          fighter.equipped = { ...fighter.equipped, rightHand: null };
        }

        gameAudio.playSwoosh();
        addCombatLog(
          `🔱 ${fighter.name} hurls the Fuscina de Venator (+45 DMG) with piercing momentum! Switching to Bare Fists!`,
          'crit',
        );
        continue;
      }

      // RANGED WEAPONS (Hunting Sling & Roman Gastraphetes):
      // Rapid stone projectile with blunt ping (Range 160px) or high-velocity bolts
      const hasHuntingSling = fighter.equipped?.rightHand === 'hunting_sling';
      const hasGastraphetes =
        fighter.equipped?.rightHand === 'gastraphetes' ||
        fighter.equipped?.leftHand === 'gastraphetes';

      if ((hasHuntingSling || hasGastraphetes) && dist >= 32 && dist <= 165 && fighter.attackCooldown <= 0 && fighter.stamina >= 14) {
        fighter.attackCooldown = hasHuntingSling ? 0.75 : 1.15;
        fighter.stamina -= hasHuntingSling ? 12 : 16;
        fighter.state = 'attack';
        setTimeout(() => {
          if (fighter.state === 'attack') fighter.state = 'idle';
        }, 180);

        const projSpeed = hasHuntingSling ? 165 : 205;
        const pVx = (dx / dist) * projSpeed;
        const pVy = (dy / dist) * projSpeed;
        const isCrit = fighter.rageTimer > 0 || Math.random() < 0.08;

        if (hasHuntingSling) {
          const slingDmg = Math.max(7, Math.floor(fighter.attack * (isCrit ? 1.4 : 1.0) - target.defense * 0.25));
          projectilesRef.current.push({
            id: `sling_${nextProjId.current++}`,
            ownerId: fighter.id,
            isPlayerTeam: fighter.isPlayerTeam,
            x: fighter.x + (fighter.flipX ? -6 : 6),
            y: fighter.y - 14,
            vx: pVx,
            vy: pVy,
            damage: slingDmg,
            isCrit,
            life: 1.2,
            maxLife: 1.2,
            culture: fighter.culture,
            isStone: true,
          });
          gameAudio.playFootstepStone();
        } else {
          // Gastraphetes crossbow bolt
          const boltDmg = Math.max(12, Math.floor(fighter.attack * (isCrit ? 1.5 : 1.15) - target.defense * 0.3));
          projectilesRef.current.push({
            id: `bolt_${nextProjId.current++}`,
            ownerId: fighter.id,
            isPlayerTeam: fighter.isPlayerTeam,
            x: fighter.x + (fighter.flipX ? -6 : 6),
            y: fighter.y - 14,
            vx: pVx,
            vy: pVy,
            damage: boltDmg,
            isCrit,
            life: 1.2,
            maxLife: 1.2,
            culture: fighter.culture,
            isBolt: true,
          });
          gameAudio.playTone({ type: 'sawtooth', freq: 440, freqTo: 180, dur: 0.08, gain: 0.1 });
        }
        continue;
      }

      // In-Combat Bloodsworn RAGE mode bonuses:
      const isRaging = fighter.rageTimer > 0;
      if (isRaging) {
        fighter.stamina = Math.max(fighter.stamina, 45); // Unyielding adrenaline
      }

      // Bloodthirsty trait mechanic: Enters berserk frenzy when enemy falls below 20% HP
      if (fighter.traits?.includes('Bloodthirsty') && target.hp > 0 && (target.hp / target.maxHp) <= 0.20 && fighter.rageTimer <= 0) {
        fighter.rageTimer = 4.0;
        spawnCrispPopup(fighter.x, fighter.y - 18, 'BLOODTHIRSTY FRENZY!', '#ba7654', true);
        gameAudio.playPowerupChime();
        addCombatLog(`🩸 ${fighter.name}'s BLOODTHIRSTY trait triggers! Smelling blood, enters berserk frenzy!`, 'crit');
      }

      // Erratic decision-making & manic twitching for gladiators afflicted with 'Mad' trait
      if (fighter.traits?.includes('Mad')) {
        fighter.madTwitchTimer = (fighter.madTwitchTimer || 0) + dt;
        if (fighter.madTwitchTimer >= 2.0) {
          fighter.madTwitchTimer = 0;
          const stances: CombatTactics[] = ['aggressive', 'defensive', 'ranged'];
          fighter.tactics = stances[Math.floor(Math.random() * stances.length)];
          if (Math.random() < 0.3) {
            spawnCrispPopup(fighter.x, fighter.y - 14, 'ERRATIC FRENZY!', '#ba7654');
          }
        }
      }

      // Elephant Tusk Trample Charge Trigger: triggers every 6.0 seconds
      if (fighter.isElephant && (fighter.elephantChargeCooldown ?? 0) <= 0 && target) {
        fighter.isCharging = true;
        fighter.chargeTimer = 0.95;
        const cdx = target.x - fighter.x;
        const cdy = target.y - fighter.y;
        const cdist = Math.max(1, Math.hypot(cdx, cdy));
        fighter.chargeVx = (cdx / cdist) * 88;
        fighter.chargeVy = (cdy / cdist) * 20;
        fighter.flipX = cdx < 0;
        gameAudio.playElephantTrumpet();
        addCombatLog(`🐘 ${fighter.name} bellows and unleashes TUSK TRAMPLE charge!`, 'crit');
      }

      // AI Psychology Execution (Move speed: low plodding speed for Elephant, +40% during RAGE; roughly 1.85x for fast Cavalry)
      let moveSpeed = (22 + fighter.speed * 0.7) * (fighter.stamina < 15 ? 0.65 : 1.0);
      if (fighter.isElephant) {
        moveSpeed = 15; // low base plodding speed across arena
      } else if (fighter.isCavalry) {
        moveSpeed *= 1.85; // rides very fast across arena sands
      }
      if (isRaging) {
        moveSpeed *= 1.4;
      }
      if (fighter.heroType === 'zuzubu' && fighter.rageTimer > 0) {
        moveSpeed *= 1.5; // Zuzubu Berserk Blood Rage +50% speed
      }

      // Claustrophobic trait: +10% speed when flanking in open sands
      if (fighter.traits?.includes('Claustrophobic')) {
        const nearbyFightersCount = fighters.filter((f) => f.hp > 0 && Math.hypot(f.x - fighter.x, f.y - fighter.y) < 35).length;
        if (nearbyFightersCount <= 2) {
          moveSpeed *= 1.10;
        }
      }

      // DEFENSIVE FORTIFICATIONS PHYSICS (RIVER SLOW & LOW WALL SLOW)
      let inRiver = false;
      let onWall = false;
      if (currentFortifications && currentFortifications.length > 0) {
        for (const fort of currentFortifications) {
          if (
            fort.type === 'river' &&
            fighter.x >= fort.x &&
            fighter.x <= fort.x + fort.w &&
            fighter.y >= fort.y &&
            fighter.y <= fort.y + fort.h
          ) {
            inRiver = true;
          }
          if (
            fort.type === 'low_wall' &&
            fighter.x >= fort.x - 3 &&
            fighter.x <= fort.x + fort.w + 3 &&
            fighter.y >= fort.y &&
            fighter.y <= fort.y + fort.h
          ) {
            onWall = true;
          }
        }
      }

      if (inRiver) {
        // Rivers: Slows infantry movement by 50%. Elephants and horses are NEVER affected!
        if (!fighter.isElephant && !fighter.isCavalry) {
          moveSpeed *= 0.5;
        }
        if (Math.random() < 0.25) {
          particlesRef.current.push({
            x: fighter.x + (Math.random() - 0.5) * 6,
            y: fighter.y + 1,
            color: Math.random() < 0.5 ? PALETTE[0] : '#55796f',
            vx: (Math.random() - 0.5) * 8,
            vy: -4 - Math.random() * 6,
            life: 0.28,
            maxLife: 0.28,
          });
        }
      }

      if (onWall) {
        // Low stone walls slow units climbing over them
        moveSpeed *= 0.6;
      }

      // DEFENSIVE AI IN FORTIFIED RARE QUESTS:
      // Enemies hold ground behind fortifications unless player crosses or multiple missiles bombard them!
      const isDefensiveFortHold =
        isFortifiedQuest &&
        !fighter.isPlayerTeam &&
        (fighter.consecutiveMissilesTaken || 0) < 2 &&
        dist > 38 &&
        target.x < 170;

      if (isDefensiveFortHold) {
        // Hold ground behind cover / riverbank, only shifting vertically to guard line
        const holdX = 205;
        if (fighter.x < holdX) {
          fighter.x += 18 * dt;
          fighter.state = 'walking';
        } else {
          fighter.state = 'idle';
          // Pace guard line vertically to match target's Y lane
          if (Math.abs(dy) > 12) {
            fighter.y += (dy > 0 ? 1 : -1) * (moveSpeed * 0.7) * dt;
          }
        }
        fighter.x = Math.max(MIN_X, Math.min(MAX_X, fighter.x));
        fighter.y = Math.max(MIN_Y, Math.min(MAX_Y, fighter.y));
        continue;
      }

      // DEX scaling on attack cooldown recovery (~20% faster at high DEX)
      const fDex = fighter.attributes?.dex ?? 10;
      const dexCooldownMod = Math.max(0.85, Math.min(1.25, 1 + (fDex - 10) * 0.02));
      const atkCooldownMult = (isRaging ? 0.6 : 1.0) / dexCooldownMod;
      const isOneOnOne = livingPlayerFighters.length === 1 && livingEnemyFighters.length === 1;

      if (fighter.tactics === 'aggressive') {
        // AGGRESSIVE: Relentlessly tails and pursues the nearest enemy, always pushing forward
        const desiredDist = 18;
        if (dist > desiredDist) {
          fighter.x += (dx / dist) * moveSpeed * dt;
          fighter.y += (dy / dist) * moveSpeed * dt;
          fighter.state = 'walking';
        } else {
          fighter.state = 'idle';

          // Attempt Pin/Grapple if close, stamina >= 28, and random roll
          // In 1 on 1 fights, pin opponents very, very rarely (< 2-3% or only when nearly exhausted under 15% HP)
          const pinChance = isOneOnOne
            ? ((target.hp / target.maxHp) <= 0.15 ? 0.025 : 0.01)
            : 0.35;

          if (
            dist < 18 &&
            fighter.pinCooldown <= 0 &&
            fighter.stamina >= 28 &&
            target.state !== 'pinned'
          ) {
            fighter.pinCooldown = isOneOnOne
              ? 8.0 + Math.random() * 6.0
              : 1.0 + Math.random() * 3.0;

            if (Math.random() < pinChance) {
              // EXECUTE PIN / GRAPPLE
              fighter.state = 'pinning';
              fighter.pinnedTargetId = target.id;
              fighter.stamina -= 28;

              const pinDuration = isOneOnOne ? 1.4 : 1.8 + Math.random() * 2.4;
              target.state = 'pinned';
              target.pinnedTimer = pinDuration;
              target.pinnedByFighterId = fighter.id;
              target.vx = 0;
              target.vy = 0;

              gameAudio.playMeleePunch();
              addCombatLog(
                `🤼 ${fighter.name} tackles and PINS ${target.name} to the arena sand! Helpless!`,
                'pin',
              );
              triggerArenaSpeech(fighter, 'pin');
            } else {
              gameAudio.playShieldBlock();
              addCombatLog(
                `🛡️ ${target.name} deflects ${fighter.name}'s pin attempt!`,
                'neutral',
              );
            }
          } else if (fighter.attackCooldown <= 0 && fighter.stamina >= 18) {
            // EXECUTE MELEE ATTACK
            fighter.attackCooldown = (0.75 + Math.random() * 0.25) * atkCooldownMult;
            fighter.stamina -= isRaging ? 8 : 18;
            fighter.state = 'attack';
            setTimeout(() => {
              if (fighter.state === 'attack') fighter.state = 'idle';
            }, 220);

            // Strike Target
            resolveMeleeStrike(fighter, target);
          }
        }
      } else if (fighter.tactics === 'defensive') {
        // DEFENSIVE: Cautiously approaches, but periodically pulls back to bait an enemy strike before countering
        fighter.tacticsTimer -= dt;
        if (fighter.tacticsTimer <= 0) {
          fighter.isBaiting = !fighter.isBaiting;
          fighter.tacticsTimer = fighter.isBaiting ? 1.0 : 2.2;
        }

        if (fighter.isBaiting) {
          // Pulls back / steps away to bait enemy strike
          if (dist < 42) {
            fighter.x -= (dx / dist) * (moveSpeed * 0.9) * dt;
            fighter.y -= (dy / dist) * (moveSpeed * 0.9) * dt;
            fighter.state = 'walking';
          } else {
            fighter.state = 'idle';
          }
        } else {
          // Steps forward into engagement range
          const desiredDist = 20;
          if (dist > desiredDist) {
            fighter.x += (dx / dist) * moveSpeed * dt;
            fighter.y += (dy / dist) * moveSpeed * dt;
            fighter.state = 'walking';
          } else {
            fighter.state = 'idle';

            // High counter-strike & pin probability in group, but very, very rare in 1 on 1 fights
            const counterPinThreshold = isOneOnOne
              ? ((target.hp / target.maxHp) <= 0.15 ? 0.025 : 0.01)
              : 0.38 + (fighter.pinBonus || 0);

            if (
              dist < 18 &&
              fighter.pinCooldown <= 0 &&
              fighter.stamina >= 28 &&
              target.state !== 'pinned'
            ) {
              fighter.pinCooldown = isOneOnOne
                ? 8.0 + Math.random() * 6.0
                : 1.0 + Math.random() * 3.0;

              if (Math.random() < counterPinThreshold) {
                fighter.state = 'pinning';
                fighter.pinnedTargetId = target.id;
                fighter.stamina -= 28;

                const pinDuration = isOneOnOne ? 1.4 : 1.8 + Math.random() * 2.2;
                target.state = 'pinned';
                target.pinnedTimer = pinDuration;
                target.pinnedByFighterId = fighter.id;
                target.vx = 0;
                target.vy = 0;

                gameAudio.playMeleePunch();
                addCombatLog(
                  `🛡️ ${fighter.name} baits a miss and PINS ${target.name} down!`,
                  'pin',
                );
                triggerArenaSpeech(fighter, 'pin');
              } else {
                gameAudio.playShieldBlock();
                addCombatLog(
                  `🛡️ ${target.name} slips free from ${fighter.name}'s grapple!`,
                  'neutral',
                );
              }
            } else if (fighter.attackCooldown <= 0 && fighter.stamina >= 18) {
              fighter.attackCooldown = (0.8 + Math.random() * 0.2) * atkCooldownMult;
              fighter.stamina -= isRaging ? 8 : 18;
              fighter.state = 'attack';
              setTimeout(() => {
                if (fighter.state === 'attack') fighter.state = 'idle';
              }, 220);

              resolveMeleeStrike(fighter, target);
            }
          }
        }
      } else {
        // RANGED: Keeps distance and launches ranged attacks (javelins / arrows / thrown projectiles)
        const isTargetRanged =
          target.tactics === 'ranged' ||
          target.equipped?.rightHand === 'hunting_sling' ||
          target.equipped?.rightHand === 'gastraphetes' ||
          target.equipped?.leftHand === 'gastraphetes';

        if (isTargetRanged && dist >= 45) {
          fighter.stationaryDuelTimer = (fighter.stationaryDuelTimer || 0) + dt;
        } else if (dist < 35) {
          fighter.stationaryDuelTimer = 0;
        }

        // If two opposing ranged units are locked at long range without landing hits for more than 4 seconds,
        // naturally step in closer to each other to tighten accuracy and resolve the duel
        let idealDistMin = 65;
        let idealDistMax = 110;
        if ((fighter.stationaryDuelTimer || 0) > 4.0) {
          const tighten = Math.min(45, ((fighter.stationaryDuelTimer || 0) - 4.0) * 15);
          idealDistMin = Math.max(20, 65 - tighten);
          idealDistMax = Math.max(32, 110 - tighten);
        }

        // Active Repositioning to break out of stationary firing posture / miss cycle
        if (fighter.repositionTimer && fighter.repositionTimer > 0) {
          fighter.repositionTimer -= dt;
          fighter.x += (fighter.vx || 0) * dt;
          fighter.y += (fighter.vy || 0) * dt;
          // Bounce off vertical screen boundaries
          if (fighter.y <= MIN_Y + 4 && (fighter.vy || 0) < 0) {
            fighter.vy = Math.abs(fighter.vy || 0);
          } else if (fighter.y >= MAX_Y - 4 && (fighter.vy || 0) > 0) {
            fighter.vy = -Math.abs(fighter.vy || 0);
          }
          fighter.state = 'walking';
          if ((fighter.vx || 0) !== 0) {
            fighter.flipX = (fighter.vx || 0) < 0;
          }
        } else if (dist < idealDistMin) {
          // Backpedals away from rushing enemies
          fighter.x -= (dx / dist) * (moveSpeed * 1.1) * dt;
          fighter.y -= (dy / dist) * (moveSpeed * 1.1) * dt;
          fighter.state = 'walking';
        } else if (dist > idealDistMax) {
          // Advances into ranged shooting distance
          fighter.x += (dx / dist) * moveSpeed * dt;
          fighter.y += (dy / dist) * moveSpeed * dt;
          fighter.state = 'walking';
        } else {
          fighter.state = 'idle';

          // When a ranged character misses more than 2 shots in a row:
          // Add a 50% chance on their AI decision tick to break out of stationary firing posture and reposition:
          // Advance forward toward opponent (reducing range) and/or reposition vertically (move up or down along Y axis)
          if ((fighter.consecutiveMisses || 0) > 2) {
            fighter.tacticsTimer -= dt;
            if (fighter.tacticsTimer <= 0) {
              fighter.tacticsTimer = 0.5 + Math.random() * 0.4;
              if (Math.random() < 0.5) {
                const directionX = dx > 0 ? 1 : -1;
                const vertDir = fighter.y > 130 ? -1 : fighter.y < 95 ? 1 : (Math.random() < 0.5 ? -1 : 1);
                fighter.repositionTimer = 1.5;
                fighter.vx = directionX * moveSpeed * 1.1; // advance forward toward opponent
                fighter.vy = vertDir * moveSpeed * 0.85;   // reposition vertically (move up/down)
                fighter.consecutiveMisses = 1;             // reset streak so they test the fresh angle
                fighter.state = 'walking';
              }
            }
          }
        }

        // Fire Ranged Projectile
        if (
          fighter.attackCooldown <= 0 &&
          fighter.stamina >= 18 &&
          dist >= 35 &&
          dist <= 135
        ) {
          fighter.attackCooldown = (1.1 + Math.random() * 0.4) * atkCooldownMult;
          fighter.stamina -= isRaging ? 10 : 22;
          fighter.state = 'attack';
          setTimeout(() => {
            if (fighter.state === 'attack') fighter.state = 'idle';
          }, 180);

          // Launch Projectile
          const projSpeed = 125;
          const projVx = (dx / dist) * projSpeed;
          const projVy = (dy / dist) * projSpeed;

          // Guaranteed CRIT if target is pinned or fighter is in RAGE mode; otherwise 5% chance
          const isCrit = target.state === 'pinned' || isRaging || Math.random() < 0.05;
          const baseDmg = Math.max(
            8,
            Math.floor(fighter.attack * (isCrit ? 1.5 : 1.0) - target.defense * 0.35),
          );

          projectilesRef.current.push({
            id: `proj_${nextProjId.current++}`,
            ownerId: fighter.id,
            isPlayerTeam: fighter.isPlayerTeam,
            x: fighter.x + (fighter.flipX ? -6 : 6),
            y: fighter.y - 14,
            vx: projVx,
            vy: projVy,
            damage: Math.max(6, baseDmg),
            isCrit,
            life: 1.2,
            maxLife: 1.2,
            culture: fighter.culture,
          });

          gameAudio.playTone({
            type: 'triangle',
            freq: 480,
            freqTo: 220,
            dur: 0.12,
            gain: 0.08,
          });
        } else if (dist < 22 && fighter.attackCooldown <= 0 && fighter.stamina >= 15) {
          // Close quarter emergency jab
          fighter.attackCooldown = 0.9;
          fighter.stamina -= 15;
          fighter.state = 'attack';
          setTimeout(() => {
            if (fighter.state === 'attack') fighter.state = 'idle';
          }, 200);
          resolveMeleeStrike(fighter, target);
        }
      }

      // Clamp within Arena Floor Bounds
      fighter.x = Math.max(MIN_X, Math.min(MAX_X, fighter.x));
      fighter.y = Math.max(MIN_Y, Math.min(MAX_Y, fighter.y));
    }

    // 2. UPDATE PROJECTILES WITH BALLISTIC ARC & IMPACT DYNAMICS
    updateProjectiles(dt, true);
  };

  // Resolve Melee Strike
  const resolveMeleeStrike = (attacker: ArenaFighter, target: ArenaFighter) => {
    const isAttackerRaging = attacker.rageTimer > 0;

    // LOW STONE WALL COVER CHECK: 40% cover chance for incoming attacks directly behind/on wall to MISS
    const forts = activeTierRef.current?.fortifications;
    if (forts && forts.length > 0) {
      const hasWallCover = forts.some((f) => {
        if (f.type !== 'low_wall') return false;
        return (
          target.x >= f.x - 4 &&
          target.x <= f.x + f.w + 14 &&
          target.y >= f.y - 6 &&
          target.y <= f.y + f.h + 6
        );
      });
      if (hasWallCover && Math.random() < 0.40) {
        gameAudio.playShieldBlock();
        spawnCrispPopup(target.x, target.y - 14, 'WALL COVER!', '#a4968d');
        addCombatLog(`🧱 Low stone wall deflected the blow aimed at ${target.name}!`, 'neutral');
        return;
      }
    }

    // 1 in 20 (5%) Chance to Miss entirely:
    // Deal 0 damage, play swoosh SFX, display floating 'MISS' text
    const isCavalryInitialCharge = attacker.isCavalry && (!attacker.hasCavalryHit || attacker.isCharging);
    if (!isAttackerRaging && !isCavalryInitialCharge && Math.random() < 0.05) {
      gameAudio.playSwoosh();
      spawnCrispPopup(target.x, target.y - 14, 'MISS', '#a4968d');
      addCombatLog(`💨 ${attacker.name} swung wide and missed ${target.name}!`, 'neutral');
      attacker.consecutiveMisses = (attacker.consecutiveMisses || 0) + 1;
      return;
    }

    attacker.consecutiveMisses = 0;
    attacker.stationaryDuelTimer = 0;
    target.stationaryDuelTimer = 0;

    // Check if target is wielding a Spear / Lance / Trident
    const targetIsSpearUser =
      target.equipped?.rightHand === 'spiculum' ||
      target.equipped?.leftHand === 'spiculum' ||
      target.equipped?.rightHand === 'fuscina' ||
      target.equipped?.leftHand === 'fuscina' ||
      target.equipped?.rightHand === 'throwing_trident' ||
      target.equipped?.leftHand === 'throwing_trident' ||
      (!target.equipped?.rightHand && !target.equipped?.leftHand && target.culture === 'scythian') ||
      target.title?.toLowerCase().includes('spear') ||
      target.title?.toLowerCase().includes('lancer') ||
      target.title?.toLowerCase().includes('lance') ||
      target.title?.toLowerCase().includes('trident') ||
      target.name?.toLowerCase().includes('spear') ||
      target.name?.toLowerCase().includes('lancer') ||
      target.name?.toLowerCase().includes('lance') ||
      target.name?.toLowerCase().includes('trident');

    // HORSE CAVALRY CHARGE MECHANICS:
    // When a mounted combatant is charging (initial galloping charge toward enemy line),
    // on their FIRST hit against any target gladiator:
    let isCavalryChargeCrit = false;
    let isSpearBracedAgainstCharge = false;

    if (attacker.isCavalry && (!attacker.hasCavalryHit || attacker.isCharging)) {
      attacker.hasCavalryHit = true;
      attacker.isCharging = false;

      if (!targetIsSpearUser) {
        // Guaranteed CRITICAL DAMAGE (2.0x damage multiplier + extra screen shake and heavy impact spark particle burst!)
        isCavalryChargeCrit = true;
      } else {
        // The spear braces against the cavalry charge! Normal damage or counter-stagger, neutralizing the guaranteed crit.
        isSpearBracedAgainstCharge = true;
        attacker.stunTimer = 0.8; // counter-stagger mount
        attacker.state = 'hurt';
      }
    }

    // Critical Hit Calculation:
    // - Attacker in RAGE mode: GUARANTEED CRITICAL hit!
    // - Pinned target: GUARANTEED CRITICAL hit!
    // - Cavalry charge hit on non-spear: GUARANTEED CRITICAL hit (2.0x)!
    // - Otherwise base 5% + weapon crit bonus
    const isPinned = target.state === 'pinned';
    const isRandomCrit = Math.random() < (0.05 + (attacker.critBonus || 0));
    const isCrit = isCavalryChargeCrit || isAttackerRaging || isPinned || isRandomCrit;

    // Cavalry Weakness Trait: Takes 1.5x - 2.0x extra damage from spear users in melee (spiculum, fuscina, or Scythian lance)
    const isSpearAttacker =
      attacker.equipped?.rightHand === 'spiculum' ||
      attacker.equipped?.leftHand === 'spiculum' ||
      attacker.equipped?.rightHand === 'fuscina' ||
      attacker.equipped?.leftHand === 'fuscina' ||
      (!attacker.equipped?.rightHand && !attacker.equipped?.leftHand && attacker.culture === 'scythian') ||
      attacker.title?.toLowerCase().includes('spear') ||
      attacker.title?.toLowerCase().includes('lancer') ||
      attacker.title?.toLowerCase().includes('trident') ||
      attacker.name?.toLowerCase().includes('spear') ||
      attacker.name?.toLowerCase().includes('lancer');

    const spearBonusMult = (target.isCavalry && isSpearAttacker) ? 1.75 : 1.0;

    // ZUZUBU BERSERK BLOOD RAGE: +100% ATK
    let effectiveAtk = attacker.attack;
    if (attacker.heroType === 'zuzubu' && attacker.rageTimer > 0) {
      effectiveAtk *= 2.0;
    }

    const critMultiplier = isCavalryChargeCrit ? 2.0 : isCrit ? 1.5 : 1.0;
    const defAbsorption = target.isBaiting ? 0.65 : 0.45;
    const rawDmg = (effectiveAtk * critMultiplier - target.defense * defAbsorption) * spearBonusMult;
    const finalDmg = Math.max(isCavalryChargeCrit ? 14 : 6, Math.round(rawDmg + (Math.random() * 4 - 2)));

    const hitDx = target.x - attacker.x;
    const hitDy = target.y - attacker.y;

    if (isCavalryChargeCrit) {
      screenShakeTimerRef.current = 0.35;
      spawnSparkles(target.x, target.y - 12, '#ffffff', 18);
      spawnSparkles(target.x, target.y - 12, '#fbbf24', 16);
      spawnSparkles(target.x, target.y - 12, '#ded095', 12);
      spawnBloodSpray(target.x, target.y - 12, 16, Math.atan2(hitDy, hitDx));
      gameAudio.playMeleePunch();
      gameAudio.playChiptuneExplosion();
      spawnCrispPopup(target.x, target.y - 20, 'CAVALRY CHARGE CRIT! (2.0x)', '#fbbf24', true);
      addCombatLog(
        `🐎 CAVALRY SHOCK CHARGE! ${attacker.name} slams into ${target.name} for 2.0x CRITICAL DAMAGE!`,
        'crit',
      );
    } else if (isSpearBracedAgainstCharge) {
      gameAudio.playShieldBlock();
      spawnCrispPopup(target.x, target.y - 16, 'SPEAR BRACED!', '#88997a', true);
      addCombatLog(
        `🥢 SPEAR BRACED! ${target.name} plants spear firmly in the sand, bracing against ${attacker.name}'s cavalry charge and neutralizing the crit!`,
        'neutral',
      );
    } else if (attacker.isCavalry && Math.random() < 0.45) {
      addCombatLog(
        `🐎 ${attacker.name} lashes out with a crushing rear iron-hoof kick against ${target.name}!`,
        attacker.isPlayerTeam ? 'player' : 'enemy',
      );
    } else if (attacker.isElephant && Math.random() < 0.5) {
      addCombatLog(
        `🐘 ${attacker.name} sweeps its colossal ivory tusks across ${target.name}!`,
        attacker.isPlayerTeam ? 'player' : 'enemy',
      );
    }

    // Barbarian Greatclub special effect: heavy blunt impact with 20% brief stagger/knockback!
    const isGreatclub =
      attacker.equipped?.rightHand === 'barbarian_greatclub' ||
      attacker.equipped?.leftHand === 'barbarian_greatclub';
    if (isGreatclub && Math.random() < 0.20) {
      target.stunTimer = 0.8;
      target.state = 'pinned';
      const knockDir = hitDx >= 0 ? 1 : -1;
      target.vx += knockDir * 42;
      spawnCrispPopup(target.x, target.y - 18, 'STAGGERED!', '#fbbf24', true);
      addCombatLog(`🏏 ${attacker.name}'s Greatclub crushes ${target.name}'s guard with staggering knockback!`, 'crit');
    }

    if (spearBonusMult > 1.0) {
      addCombatLog(`🥢 SPEAR BRACE! ${attacker.name} impales the charging cavalry mount for 1.75x extra damage!`, 'crit');
    }

    // Stylized White Pixel Slash VFX & Blade Clash detection
    const contactX = Math.round((attacker.x + target.x) / 2);
    const contactY = Math.round((attacker.y + target.y) / 2 - 12);
    const hitAngle = Math.atan2(target.y - attacker.y, target.x - attacker.x);

    // Simultaneous attack check: both combatants attack within ~0.15s of each other
    const isSimultaneousSlash = Math.abs(attacker.attackCooldown - target.attackCooldown) <= 0.15;

    if (isSimultaneousSlash) {
      slashVfxRef.current.push({
        id: `clash_${Date.now()}_${Math.random()}`,
        x: contactX,
        y: contactY,
        angle: hitAngle,
        framesLeft: 3,
        isClash: true,
      });
      gameAudio.playClashSFX();
      spawnSparkles(contactX, contactY, '#ffffff', 8);
      spawnSparkles(contactX, contactY, '#F7DEAA', 6);
      addCombatLog(`⚔️ BLADE CLASH! Simultaneous slashes clash in a shower of sparks!`, 'pin');
    } else {
      slashVfxRef.current.push({
        id: `slash_${Date.now()}_${Math.random()}`,
        x: contactX,
        y: contactY,
        angle: hitAngle,
        framesLeft: 2,
        isClash: false,
      });
    }

    applyDamageToFighter(target, finalDmg, isCrit, hitDx, hitDy, attacker.name);
  };

  // Apply Damage with CRIT / Dramatic Finishing Blow logic & Telemetry Tracking
  const applyDamageToFighter = (
    target: ArenaFighter,
    damage: number,
    isCrit: boolean,
    hitDirX: number,
    hitDirY: number,
    attackerName?: string,
  ) => {
    if (isSandboxBattleRef.current) {
      if (target.isPlayerTeam) {
        sandboxTelemetryRef.current.romanDamageDealt += damage;
      } else {
        sandboxTelemetryRef.current.rebelDamageDealt += damage;
      }
      setSandboxTelemetry({ ...sandboxTelemetryRef.current });
    }
    target.hp = Math.max(0, target.hp - damage);
    target.stationaryDuelTimer = 0;
    if (attackerName) {
      const attackerFighter = arenaFightersRef.current.find(
        (f) => f.name === attackerName,
      );
      if (attackerFighter) {
        attackerFighter.consecutiveMisses = 0;
        attackerFighter.stationaryDuelTimer = 0;
      }
    }
    target.state = 'hurt';
    setTimeout(() => {
      if (target.state === 'hurt' && target.hp > 0) target.state = 'idle';
    }, 180);

    // Track minimum HP percentage reached during fight for near-death survival check
    if (target.sourceGladiatorId) {
      const curPct = Math.max(0, target.hp / target.maxHp);
      lowestHpPctRef.current[target.sourceGladiatorId] = Math.min(
        lowestHpPctRef.current[target.sourceGladiatorId] ?? 1,
        curPct,
      );
    }

    const hitAngle = Math.atan2(hitDirY, hitDirX);
    const isFatal = target.hp <= 0;

    // Knockback
    const knockbackForce = isFatal ? 42 : isCrit ? 26 : 14;
    target.vx += Math.cos(hitAngle) * knockbackForce;
    target.vy += Math.sin(hitAngle) * (knockbackForce * 0.5);

    if (isFatal) {
      // 7. DRAMATIC FINISHING BLOW:
      // Impact SFX, blood spray particles, knockback.
      // Clean display: Only show damage number!
      target.state = 'death';
      target.deathTimer = 1.6;
      target.flashWhiteTimer = 0.35;

      // Heavy impact chord SFX
      gameAudio.playMeleePunch();
      gameAudio.playChiptuneExplosion();

      // Blood spray particles
      spawnBloodSpray(target.x, target.y - 12, 18, hitAngle);
      spawnSparkles(target.x, target.y - 12, PALETTE[15], 10);

      spawnCrispPopup(
        target.x,
        target.y - 16,
        `-${damage}`,
        '#9e4a42',
        true,
        true,
      );

      addCombatLog(
        `⚔️ DRAMATIC FINISHER! ${target.name} takes a lethal strike (-${damage} DMG) and collapses to the arena sand!`,
        'crit',
      );

      // On Kill Arena Combat Speech declaration
      if (attackerName) {
        const killer = arenaFightersRef.current.find(
          (f) => f.name === attackerName && f.hp > 0,
        );
        if (killer) {
          triggerArenaSpeech(killer, 'kill');
        }
      }

      // In-Combat Bloodsworn RAGE mode activation:
      if (target.isPlayerTeam) {
        // ZUZUBU UNIQUE HERO ABILITY:
        // "If ANY allied comrade falls in battle next to him, Zuzubu enters an unstoppable Berserk Blood Rage (+100% ATK, +50% SPD)."
        const livingZuzubu = arenaFightersRef.current.find(
          (f) => f.isPlayerTeam && f.heroType === 'zuzubu' && f.hp > 0 && f.id !== target.id,
        );
        if (livingZuzubu) {
          livingZuzubu.rageTimer = 12.0; // 12-second unstoppable Berserk Blood Rage
          gameAudio.playPowerupChime();
          spawnCrispPopup(livingZuzubu.x, livingZuzubu.y - 18, 'BERSERK BLOOD RAGE!', '#fbbf24', true);
          addCombatLog(
            `🐆 Seeing ${target.name} fall sends ZUZUBU into an UNSTOPPABLE BERSERK BLOOD RAGE! (+100% ATK, +50% SPD)`,
            'crit',
          );
        }
      }

      // When a gladiator perishes, check if any surviving ally has HIGH bond (>= 40)
      if (target.isPlayerTeam && target.sourceGladiatorId) {
        const fallenId = target.sourceGladiatorId;
        const survivingAllies = arenaFightersRef.current.filter(
          (f) => f.isPlayerTeam && f.hp > 0 && f.id !== target.id && f.sourceGladiatorId,
        );
        let rageActivated = false;

        for (const ally of survivingAllies) {
          const bond = getBondScore(gladiatorBondsRef.current, ally.sourceGladiatorId!, fallenId);
          if (bond >= 40) {
            rageActivated = true;
            ally.rageTimer = 6.0;
            gameAudio.playPowerupChime();
            addCombatLog(
              `🩸 BLOOD RAGE! Seeing ${target.name} fall sends ${ally.name} into an uncontrollable fury!`,
              'crit',
            );
            battleRageEventsRef.current.push({
              fallenName: target.name,
              survivorName: ally.name,
            });
          }
        }

        if (!rageActivated) {
          unbondedDeathsRef.current.push(target.name);
          addCombatLog(
            `Cold silence follows the death of ${target.name}—the detachment weighed heavily on the camp.`,
            'neutral',
          );
        }
      }
    } else {
      target.state = 'hurt';
      setTimeout(() => {
        if (target.state === 'hurt' && target.hp > 0 && !target.isDead) {
          target.state = 'idle';
        }
      }, 180);

      if (isCrit) {
        // 6. CRITICAL HITS (CRIT):
        const curTier = activeTierRef.current;
        const isBossOrSpec = isEmperorDuelRef.current || isSandboxBattleRef.current || !!curTier?.isBoss;
        const critCrowdTier = getCrowdTier(unlockedTierIndex, totalBattlesWonRef.current, isBossOrSpec);
        gameAudio.playCrowdReaction(critCrowdTier, true);
        gameAudio.playMeleePunch();
        gameAudio.playChiptuneExplosion();

        spawnBloodSpray(target.x, target.y - 12, 14, hitAngle);
        spawnSparkles(target.x, target.y - 12, PALETTE[0], 8);

        spawnCrispPopup(
          target.x,
          target.y - 16,
          `CRIT! -${damage}`,
          '#fbbf24',
          true,
        );

        addCombatLog(
          `💥 CRITICAL HIT! ${target.name} suffers a devastating blow for ${damage} DMG!`,
          'crit',
        );
      } else {
        // Regular Hit: Only display "-${damage}"
        gameAudio.playSwordClash();
        spawnBloodSpray(target.x, target.y - 12, 6, hitAngle);

        spawnCrispPopup(
          target.x,
          target.y - 14,
          `-${damage}`,
          target.isPlayerTeam ? '#ba7654' : '#ded095',
        );

        if (attackerName) {
          addCombatLog(
            `⚔️ ${attackerName} strikes ${target.name} for ${damage} DMG.`,
            target.isPlayerTeam ? 'enemy' : 'player',
          );
        }
      }
    }
  };

  // Stage 3B: one end-of-battle entry point. The view is rebuilt every render and captured by this callback
  // under the same dependency list the old finishDuelInternal had, so it sees exactly the same (stale) values.
  const battleView: BattleView = {
    gladiatorsRef,
    arenaFightersRef,
    roster,
    lastDeployedGladIdsRef,
    setAftermathData,
    setCombatOutcome,
    combatOutcomeRef,
    setTotalBattlesWon,
    totalBattlesWonRef,
    setGameState,
    activeTierRef,
    selectedGladiatorIds,
    lowestHpPctRef,
    gladiatorBondsRef,
    setGladiatorBonds,
    battleRageEventsRef,
    unbondedDeathsRef,
    recordGladiatorDeath,
    ludusUpgrades,
    triggerHeroArrival,
    economy,
    setBattlefieldLoot,
    setUnlockedTierIndex,
    setIsColiseumChampion,
    setIsEmperorEnraged,
    isEmperorEnragedRef,
    pendingPostFifthDialogueRef,
    setManagerRenown,
    setSpeechcraftLevel,
    managerRenown,
    setIsEmperorDefeated,
    isEmperorDefeatedRef,
    setIsRevoltUnlocked,
    isRevoltUnlockedRef,
    unlockedTierIndex,
    setSideSkirmishes,
    merchantStateRef,
    setMerchantState,
    firstBattleDoneRef,
    setFirstBattleDone,
    pendingPostBattleTutorialRef,
    setFreeRecruitCultures,
    freeRecruitCulturesRef,
    heraldTimerRef,
    unlockedTierIndexRef,
    gameStateRef,
    triggerAutosave,
    generateSideSkirmishes,
  };
  const finishBattle = useCallback(
    (outcome: BattleOutcome) => resolveBattle(battleView, outcome),
    [addCombatLog, recordGladiatorDeath, selectedGladiatorIds, unlockedTierIndex, triggerAutosave],
  );

  // Main Simulation Loop
    const updateView: UpdateView = {
    screenShakeTimerRef,
    setCinematicState,
    cinematicStateRef,
    cinematicPhaseStartTimeRef,
    typewriterCharCountRef,
    typewriterCharTimerRef,
    isTypewriterDoneRef,
    emperorStabFiredRef,
    economy,
    campShootingStarTimerRef,
    campShootingStarActiveDurationRef,
    isManagerMenuOpen,
    etherealSparksRef,
    crowdAudioTimerRef,
    ludusUpgrades,
    isUpgradesModalOpen,
    isBreedingModalOpen,
    setFeastState,
    feastStateRef,
    setFeastSlaves,
    feastSlavesRef,
    isFeastOfferPendingRef,
    currentVisitor,
    setCurrentVisitor,
    visitorTimerRef,
    isVisitorModalOpen,
    setIsVisitorModalOpen,
    setVisitorWalkingNpc,
    visitorWalkingNpcRef,
    setPhysicianNpc,
    physicianNpcRef,
    campActionCooldowns,
    setCampActionCooldowns,
    arenaActionCooldowns,
    setArenaActionCooldowns,
    crispPopups,
    pepTalkState,
    unlockedTierIndex,
    setIsEmperorDuel,
    isEmperorDuelRef,
    isEmperorDuelModalOpen,
    setHeroArrivalModal,
    heroArrivalModalRef,
    setKeeperSequence,
    keeperSequenceRef,
    totalBattlesWonRef,
    podiumTimerRef,
    podiumHasIgnitedRef,
    podiumFlashTimerRef,
    setJudgmentState,
    judgmentStateRef,
    setMerchantState,
    merchantStateRef,
    setDevoteeState,
    devoteeStateRef,
    campTimeOfDayRef,
    isBanditAlarmOpen,
    setCourierNpcState,
    courierNpcRef,
    setIsHeraldSummonsOpen,
    heraldTimerRef,
    isTrialBellModalOpenRef,
    setTutorialStage,
    tutorialStageRef,
    isDebugMenuOpen,
    firstBattleDoneRef,
    setPostBattleStage,
    postBattleStageRef,
    postBattleTimerRef,
    pendingPostBattleTutorialRef,
    camZoomRef,
    camXRef,
    camYRef,
    dimAlphaRef,
    spotRadiusRef,
    spotXRef,
    spotYRef,
    sparkleTimerRef,
    tutCharCountRef,
    tutCharTimerRef,
    tutIsLineDoneRef,
    postTutCharCountRef,
    postTutCharTimerRef,
    postTutIsLineDoneRef,
    tutorialIdleTimerRef,
    tutorialWineTimerRef,
    isGameMenuOpen,
    deploymentTierRef,
    setArmoryTab,
    setActiveExpeditions,
    courierNotice,
    setCourierNotice,
    courierTimerRef,
    unlockedChains,
    isHeraldSummonsOpenRef,
    isBattlesModalOpenRef,
    isArmoryModalOpenRef,
    isRosterModalOpenRef,
    isBondingModalOpenRef,
    isGameMenuOpenRef,
    isHowToPlayOpenRef,
    isQuestBoardOpenRef,
    activeQuestNodeRef,
    questResolutionRef,
    activeExpeditionsRef,
    roster,
    setStoryState,
    storyStateRef,
    storyCooldownRef,
    isSandboxBattleRef,
    isSimulatedAdActive,
    setIsSimulatedAdActive,
    setAdCountdown,
    adCountdownRef,
    sandboxHoldTimerRef,
    setDisplayedGold,
    displayedGoldRef,
    goldTallyRef,
    flyingGoldCoinsRef,
    goldTargetGlowTimerRef,
    simSpeed,
    isSimPaused,
    setCrispPopups,
    arenaFightersRef,
    particlesRef,
    campSpeechBubblesRef,
    arenaSpeechBubblesRef,
    gladiatorSpeechCooldownsRef,
    animTimeRef,
    gladiatorsRef,
    gameStateRef,
    modeRef,
    activeTierRef,
    combatOutcomeRef,
    gladiatorBondsRef,
    unlockedTierIndexRef,
    spawnCrispPopup,
    addCombatLog,
    spawnBloodSpray,
    handleGladiatorInvestigationArrival,
    advanceTutorial,
    triggerStoryEvent,
    resolveExpedition,
    closeAllCampModals,
    resolveBattle: finishBattle,
    stepArenaCombat,
  };
  const update = (dt: number) => updateWorld(updateView, dt);

  // Main Render Loop onto 344x192 canvas scaled 4x, with Crisp High-Res Vector Overlay on Display Canvas
  const renderView: RenderView = {
    offscreenCanvasRef,
    screenShakeTimerRef,
    cinematicStateRef,
    cinematicPhaseStartTimeRef,
    typewriterCharCountRef,
    isTypewriterDoneRef,
    canvasWidth,
    canvasHeight,
    particlesRef,
    flyingGoldCoinsRef,
    mode,
    judgmentState,
    camZoomRef,
    camXRef,
    camYRef,
    campShootingStarActiveDurationRef,
    animTimeRef,
    unlockedTierIndex,
    campTimeOfDayRef,
    hoveredCampObject,
    ludusUpgrades,
    feastStateRef,
    feastSlavesRef,
    etherealSparksRef,
    memorialGraves,
    hoveredGraveId,
    selectedGraveId,
    physicianNpcRef,
    merchantStateRef,
    devoteeStateRef,
    courierNpcRef,
    visitorWalkingNpcRef,
    gladiatorsRef,
    sparkleTimerRef,
    campWeatherRef,
    dimAlphaRef,
    tutorialStageRef,
    postBattleStageRef,
    spotXRef,
    spotYRef,
    spotRadiusRef,
    tutCharCountRef,
    tutIsLineDoneRef,
    postTutCharCountRef,
    postTutIsLineDoneRef,
    keeperSequenceRef,
    isFeastOfferPendingRef,
    podiumGladiatorsRef,
    podiumTimerRef,
    podiumFlashTimerRef,
    activeTierRef,
    isSandboxBattleRef,
    isEmperorDuelRef,
    totalBattlesWonRef,
    arenaFightersRef,
    projectilesRef,
    slashVfxRef,
    hoveredCampObjectRef,
    campSpeechBubblesRef,
    arenaSpeechBubblesRef,
  };
  const draw = (displayCtx: CanvasRenderingContext2D) => renderFrame(renderView, displayCtx);

  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  // RAF loop
  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      stepperRef.current?.(time, (dt) => updateRef.current(dt));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastCampPointerAtRef.current < 40) return;
    lastCampPointerAtRef.current = now;
    // 0. Cinematic Intro interaction
    if (cinematicStateRef.current < 4) {
      cinematicIntroMusic.start(cinematicStateRef.current);
      if (cinematicStateRef.current === 3) {
        // In Monologue: if typing, complete instantly; if completed, start game
        if (!isTypewriterDoneRef.current) {
          typewriterCharCountRef.current = INTRO_MONOLOGUE_TEXT.length;
          isTypewriterDoneRef.current = true;
          gameAudio.playCrispClick();
        } else {
          skipIntro();
        }
      } else {
        // Advance to next cinematic phase
        const nextState = cinematicStateRef.current + 1;
        cinematicStateRef.current = nextState;
        setCinematicState(nextState);
        cinematicPhaseStartTimeRef.current = performance.now();
        if (nextState >= 4) {
          skipIntro();
        } else {
          cinematicIntroMusic.setPhase(nextState);
          gameAudio.playHoverMicroTone();
        }
      }
      return;
    }

    if (mode === 'podium') {
      handleAdvanceFromPodiumRef.current();
      return;
    }

    if (mode !== 'camp') return;

    // Handle Hero Arrival Lore Modal clicks
    if (heroArrivalModalRef.current) {
      dismissHeroArrival();
      return;
    }

    // Handle Post-Fifth Podium Narrative Dialogue Sequence clicks
    if (keeperSequenceRef.current && keeperSequenceRef.current.active) {
      advanceKeeperSequence();
      return;
    }

    // Handle Third Pedestal Feast Offer click
    if (isFeastOfferPendingRef.current) {
      if (!tutIsLineDoneRef.current) {
        tutCharCountRef.current = 'These men should eat like kings.'.length;
        tutIsLineDoneRef.current = true;
        gameAudio.playCrispClick();
      } else {
        setIsFeastOfferPending(false);
        isFeastOfferPendingRef.current = false;
        triggerCampFeast(true);
      }
      return;
    }

    // Handle Tutorial & Post-Battle clicks to advance dialogues
    if (tutorialStageRef.current !== 'idle' && tutorialStageRef.current !== 'done') {
      advanceTutorial();
      return;
    }
    if (
      postBattleStageRef.current === 'recruits_dialogue_1' ||
      postBattleStageRef.current === 'recruits_dialogue_2' ||
      postBattleStageRef.current === 'dummy_spotlight_1' ||
      postBattleStageRef.current === 'dummy_spotlight_2' ||
      postBattleStageRef.current === 'tent_spotlight'
    ) {
      advancePostBattleTutorial();
      return;
    }

    if (storyStateRef.current.phase !== 'inactive') {
      advanceStoryDialogue();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGIC_WIDTH / rect.width;
    const scaleY = LOGIC_HEIGHT / rect.height;
    const clickLogicX = (e.clientX - rect.left) * scaleX;
    const clickLogicY = (e.clientY - rect.top) * scaleY;

    // Invert camera zoom and panning to get exact world coordinates in camp
    const worldX = camXRef.current + (clickLogicX - LOGIC_WIDTH / 2) / camZoomRef.current;
    const worldY = camYRef.current + (clickLogicY - LOGIC_HEIGHT / 2) / camZoomRef.current;

    // 0. Check Walking Visitor NPC Click
    if (visitorWalkingNpcRef.current?.active) {
      const v = visitorWalkingNpcRef.current;
      const isOverVisitor = Math.hypot(worldX - v.x, worldY - (v.y - 8)) < 18;
      if (isOverVisitor) {
        dismissStoryEvent(true);
        v.active = false;
        setVisitorWalkingNpc(null);
        visitorWalkingNpcRef.current = null;
        setCurrentVisitor(v.visitor);
        setIsVisitorModalOpen(true);
        gameAudio.playConfirmSelect();
        return;
      }
    }

    // 0. Check Lineage Stewardess Click (Breeding Pens)
    if (ludusUpgrades.breedingPens >= 1) {
      const isOverStewardess = Math.hypot(worldX - 96, worldY - 76) < 16;
      if (isOverStewardess) {
        dismissStoryEvent(true);
        setIsBreedingModalOpen(true);
        setIsBattlesModalOpen(false);
        setIsArmoryModalOpen(false);
        setIsRosterModalOpen(false);
        gameAudio.playConfirmSelect();
        return;
      }
    }

    // 0. Check Traveling Merchant Click (Both while walking and while sitting on their carpet)
    const m = merchantStateRef.current;
    if (m.active) {
      const isOverMerchant =
        Math.hypot(worldX - m.x, worldY - (m.y - 6)) < 24 ||
        (worldX >= m.x - 22 && worldX <= m.x + 22 && worldY >= m.y - 24 && worldY <= m.y + 12) ||
        (clickLogicX >= m.x - 22 && clickLogicX <= m.x + 22 && clickLogicY >= m.y - 24 && clickLogicY <= m.y + 12);

      if (isOverMerchant) {
        dismissStoryEvent(true);
        setArmoryTab('bazaar');
        setIsArmoryModalOpen(true);
        setIsBattlesModalOpen(false);
        setIsRosterModalOpen(false);
        setIsBondingModalOpen(false);
        setIsQuestBoardOpen(false);
        gameAudio.playPowerupChime();
        return;
      }
    }

    // 1. Interactive Camp Structure: TENT (Opens Roster & Recruitment Menu [R])
    // Covers both actual rendered bounds (x: 40-88, y: 48-105) and extended prompt range (x: 60-120, y: 50-105)
    const isTent =
      (worldX >= 40 && worldX <= 122 && worldY >= 48 && worldY <= 106) ||
      (clickLogicX >= 40 && clickLogicX <= 122 && clickLogicY >= 48 && clickLogicY <= 106);

    if (isTent) {
      dismissStoryEvent(true);
      setIsRosterModalOpen(true);
      setIsBattlesModalOpen(false);
      setIsArmoryModalOpen(false);
      setIsBondingModalOpen(false);
      setIsQuestBoardOpen(false);
      gameAudio.playCrispClick();
      return;
    }

    // 2. Interactive Camp Structure: WEAPON RACK (Opens Armory & Upgrades Menu [U])
    // Covers rendered bounds (x: 160-192, y: 68-105) and prompt range (x: 195-226, y: 70-105)
    const isWeaponRack =
      (((worldX >= 160 && worldX <= 192) || (worldX >= 195 && worldX <= 226)) && worldY >= 68 && worldY <= 106) ||
      (((clickLogicX >= 160 && clickLogicX <= 192) || (clickLogicX >= 195 && clickLogicX <= 226)) && clickLogicY >= 68 && clickLogicY <= 106);

    if (isWeaponRack) {
      dismissStoryEvent(true);
      setIsArmoryModalOpen(true);
      setIsBattlesModalOpen(false);
      setIsRosterModalOpen(false);
      setIsBondingModalOpen(false);
      setIsQuestBoardOpen(false);
      gameAudio.playCrispClick();
      return;
    }

    // 3. Interactive Camp Structure: TRAINING DUMMY / MANIKIN (Opens Arena Board [B])
    // Covers rendered bounds (x: 228-256, y: 68-106) and prompt range (x: 230-250, y: 70-105)
    const isDummy =
      (worldX >= 228 && worldX <= 256 && worldY >= 68 && worldY <= 106) ||
      (clickLogicX >= 228 && clickLogicX <= 256 && clickLogicY >= 68 && clickLogicY <= 106);

    if (isDummy) {
      dismissStoryEvent(true);
      setIsBattlesModalOpen(true);
      setIsArmoryModalOpen(false);
      setIsRosterModalOpen(false);
      setIsBondingModalOpen(false);
      setIsQuestBoardOpen(false);
      gameAudio.playCrispClick();
      return;
    }

    // 3.5. Interactive Camp Structure: BRONZE TRIAL BELL (298, 154 to 316, 178)
    const isBell =
      (worldX >= 295 && worldX <= 318 && worldY >= 150 && worldY <= 182) ||
      (clickLogicX >= 295 && clickLogicX <= 318 && clickLogicY >= 150 && clickLogicY <= 182);

    if (isBell) {
      dismissStoryEvent(true);
      gameAudio.playBellRing();
      setIsTrialBellModalOpen(true);
      return;
    }

    // 4. Check if clicked near any Memorial Grave along camp bottom boundary
    const clickedGrave = memorialGraves.find((g) => {
      const dist = Math.hypot(g.x - worldX, g.y - 8 - worldY);
      return dist < 16;
    });

    if (clickedGrave) {
      setSelectedGraveId((prev) => (prev === clickedGrave.id ? null : clickedGrave.id));
      setSelectedCampGladId(null);
      gameAudio.playCrispClick();
      return;
    } else if (selectedGraveId) {
      setSelectedGraveId(null);
    }

    // 5. Check if clicked near any living gladiator
    const clickedGlad = gladiatorsRef.current.find((g) => {
      if (g.hp <= 0) return false;
      const dist = Math.hypot(g.x - worldX, g.y - 12 - worldY);
      return dist < 22;
    });

    if (clickedGlad) {
      setSelectedCampGladId((prev) => (prev === clickedGlad.id ? null : clickedGlad.id));
      gameAudio.playCrispClick();
    } else {
      setSelectedCampGladId(null);

      // 6. THE "GHOST FLASH" EASTER EGG & PSYCHOLOGICAL ESCALATION
      // Clicking any non-interactive surface on the camp ground/courtyard spawns a tiny ethereal spark / flash of light
      // (#ffffff / pale cyan #e0f8cf 2x2 px spark particle fading out over 0.6s)
      if (worldY >= 76 && worldY <= 186 && worldX >= 18 && worldX <= 326) {
        etherealSparksRef.current.push({
          x: worldX,
          y: worldY,
          timer: 0.6,
          maxDuration: 0.6,
        });
        gameAudio.playGhostSparkle();

        // Increment ghost flash clicks counter
        ghostFlashClicksRef.current += 1;
        const currentClicks = ghostFlashClicksRef.current;
        setGhostFlashClicks(currentClicks);

        // Investigation: living gladiators walk to the clicked camp coordinate.
        // Missing questWalkState counts as 'none' so the opening roster is included.
        const availableLivingGlads = gladiatorsRef.current.filter(
          (g) =>
            g.hp > 0 &&
            g.status === 'Available' &&
            !g.hidden &&
            (g.questWalkState ?? 'none') === 'none' &&
            !g.isWalkingIn,
        );

        if (availableLivingGlads.length > 0) {
          let nearestGlad = availableLivingGlads[0];
          let minD = Math.hypot(nearestGlad.x - worldX, nearestGlad.y - worldY);
          for (let i = 1; i < availableLivingGlads.length; i++) {
            const d = Math.hypot(availableLivingGlads[i].x - worldX, availableLivingGlads[i].y - worldY);
            if (d < minD) {
              minD = d;
              nearestGlad = availableLivingGlads[i];
            }
          }

          const destX = Math.round(worldX);
          const destY = Math.round(worldY);
          const moverIds = new Set(availableLivingGlads.map((g) => g.id));
          const nextGlads = gladiatorsRef.current.map((g) => {
            if (!moverIds.has(g.id)) return g;
            const moved = {
              ...g,
              targetX: destX,
              targetY: destY,
              state: 'walking' as const,
              targetActivity: 'idle' as const,
              isSitting: false,
              actionTimer: 4.5,
              investigatingFlash:
                g.id === nearestGlad.id
                  ? {
                      clickCount: currentClicks,
                      flashX: worldX,
                      flashY: worldY,
                      arrived: false,
                    }
                  : g.investigatingFlash,
            };
            return moved;
          });
          roster.set(nextGlads);

          const movedNearest = nextGlads.find((g) => g.id === nearestGlad.id);
          if (movedNearest && minD <= 6) {
            handleGladiatorInvestigationArrival(movedNearest, currentClicks);
          }
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'camp') {
      if (hoveredGraveId) setHoveredGraveId(null);
      if (hoveredCampObject) {
        setHoveredCampObject(null);
        hoveredCampObjectRef.current = null;
      }
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGIC_WIDTH / rect.width;
    const scaleY = LOGIC_HEIGHT / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Transform to world coordinates based on camera zoom & pan
    const worldX = camXRef.current + (mx - LOGIC_WIDTH / 2) / camZoomRef.current;
    const worldY = camYRef.current + (my - LOGIC_HEIGHT / 2) / camZoomRef.current;

    // 1. Detect Tent hover (Tent / Roster)
    const isOverTent =
      (worldX >= 40 && worldX <= 122 && worldY >= 48 && worldY <= 106) ||
      (mx >= 40 && mx <= 122 && my >= 48 && my <= 106);

    // 2. Detect Weapon Rack hover (Armory / Upgrades)
    const isOverRack =
      (((worldX >= 160 && worldX <= 192) || (worldX >= 195 && worldX <= 226)) && worldY >= 68 && worldY <= 106) ||
      (((mx >= 160 && mx <= 192) || (mx >= 195 && mx <= 226)) && my >= 68 && my <= 106);

    // 3. Detect Training Dummy / Manikin hover (Arena / Skirmishes)
    const isOverDummy =
      (worldX >= 228 && worldX <= 256 && worldY >= 68 && worldY <= 106) ||
      (mx >= 228 && mx <= 256 && my >= 68 && my <= 106);

    // 3.5. Detect Bronze Trial Bell hover
    const isOverBell =
      (worldX >= 295 && worldX <= 318 && worldY >= 150 && worldY <= 182) ||
      (mx >= 295 && mx <= 318 && my >= 150 && my <= 182);

    // 4. Detect Traveling Nomad Merchant hover
    const m = merchantStateRef.current;
    const isOverMerchant =
      m.active &&
      (Math.hypot(worldX - m.x, worldY - (m.y - 4)) < 18 ||
        (worldX >= m.x - 20 && worldX <= m.x + 20 && worldY >= m.y - 10 && worldY <= m.y + 10));

    // Detect Walking Visitor NPC hover
    const isOverWalkingVisitor =
      visitorWalkingNpcRef.current?.active &&
      (Math.hypot(worldX - visitorWalkingNpcRef.current.x, worldY - (visitorWalkingNpcRef.current.y - 10)) < 16);

    // Detect Lineage Stewardess hover (Breeding Pens)
    const isOverStewardess =
      ludusUpgrades.breedingPens >= 1 &&
      (Math.hypot(worldX - 96, worldY - 76) < 14 ||
        (worldX >= 88 && worldX <= 104 && worldY >= 68 && worldY <= 88));

    if (isOverWalkingVisitor) {
      setHoveredCampObject('visitor');
      hoveredCampObjectRef.current = 'visitor';
      setHoveredGraveId(null);
    } else if (isOverStewardess) {
      setHoveredCampObject('stewardess');
      hoveredCampObjectRef.current = 'stewardess';
      setHoveredGraveId(null);
    } else if (isOverMerchant) {
      setHoveredCampObject('merchant');
      hoveredCampObjectRef.current = 'merchant';
      setHoveredGraveId(null);
    } else if (isOverTent) {
      setHoveredCampObject('tent');
      hoveredCampObjectRef.current = 'tent';
      setHoveredGraveId(null);
    } else if (isOverRack) {
      setHoveredCampObject('weaponRack');
      hoveredCampObjectRef.current = 'weaponRack';
      setHoveredGraveId(null);
    } else if (isOverDummy) {
      setHoveredCampObject('dummy');
      hoveredCampObjectRef.current = 'dummy';
      setHoveredGraveId(null);
    } else if (isOverBell) {
      setHoveredCampObject('bell');
      hoveredCampObjectRef.current = 'bell';
      setHoveredGraveId(null);
    } else {
      setHoveredCampObject(null);
      hoveredCampObjectRef.current = null;

      const hovered = memorialGraves.find((g) => {
        const dist = Math.hypot(g.x - worldX, g.y - 8 - worldY);
        return dist < 16;
      });

      setHoveredGraveId(hovered ? hovered.id : null);
    }
  };


  const inCamp = mode === 'camp';
  const isMusicPlaying =
    gameState.status === 'PLAYING' && !isGameMenuOpen && !musicMuted;

  return (
    <div
      style={{fontFamily: THEME.fontFamily}}
      className="fixed inset-0 overflow-hidden touch-none flex flex-col items-center justify-between bg-[#3f363b] text-[#ded095] select-none">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes autosaveFade {
          0% { opacity: 0; transform: translateY(-8px) scale(0.95); }
          12% { opacity: 1; transform: translateY(0) scale(1); }
          65% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-4px) scale(0.98); }
        }
        .animate-autosave {
          animation: autosaveFade 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        canvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        * {
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
      `}</style>
      <BackgroundMusic
        url="assets/audio/bgm_camp.mp3"
        isPlaying={isMusicPlaying && inCamp}
        isMuted={musicMuted}
        volume={Number(getConfig('defaultMusicVolume')) || 0.5}
        playRequest={campMusicKick}
      />
      <BackgroundMusic
        url="assets/audio/bgm_arena_battle.mp3"
        isPlaying={isMusicPlaying && !inCamp}
        isMuted={musicMuted}
        volume={Number(getConfig('defaultMusicVolume')) || 0.5}
      />

      {/* INTRO AUDIO STATUS & SKIP BUTTON — unmounted once the intro ends */}
      {cinematicState < 4 && (
        <>
          <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
            <button
              onClick={() => {
                cinematicIntroMusic.start(cinematicState);
                gameAudio.playHoverMicroTone();
              }}
              title="Click to ensure 16-Bit Retro Intro Theme is playing"
              className="bg-[#3f363b]/90 hover:bg-[#574b50] active:bg-[#9c8053] border-2 border-[#9c8053] text-[#ded095] px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition shadow-2xl flex items-center gap-1.5 backdrop-blur-sm cursor-pointer min-h-[36px]">
              <span className="text-sm">🎵</span>
              <span className="hidden sm:inline">16-Bit Theme</span>
              <span className="text-[10px] text-[#cb9f6b]">
                {musicMuted ? '(Muted)' : '● Retro Synth'}
              </span>
            </button>
          </div>

          <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
            <button
              onClick={skipIntro}
              title="Skip Intro to Main Ludus [ESC]"
              className="bg-[#3f363b]/90 hover:bg-[#574b50] active:bg-[#9c8053] border-2 border-[#9c8053] text-[#ded095] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition shadow-2xl flex items-center gap-1.5 backdrop-blur-sm cursor-pointer min-h-[36px]">
              <span>Skip Intro [ESC]</span>
              <span className="text-[10px] text-[#cb9f6b]">➔</span>
            </button>
          </div>
        </>
      )}

      {/* TOP CRISP HUD BAR (ONLY VISIBLE IN MAIN GAME) */}
      {cinematicState >= 4 && (
      <header className="w-full bg-[#574b50] border-b-4 border-[#7f644b] px-3 py-2 flex flex-wrap items-center justify-between z-20 shrink-0 gap-2 shadow-[0_4px_0_#2d272a]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
          <div
            style={{
              color: '#ded095',
              textShadow: '2px 2px 0px #090d16, 1px 1px 0px #9e4a42',
            }}
            className="font-serif font-black text-xs sm:text-sm tracking-wider uppercase px-2.5 py-1 rounded bg-[#2A1B19] border-2 border-[#9c8053] flex items-center gap-1.5 shadow-[inset_1px_1px_0px_#1D1312]">
            <span>⚔️</span>
            <span>BLOOD AND GOLD</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#2A1B19] px-3 py-1 rounded border-2 border-[#9c8053] shadow-[inset_1px_1px_0px_#1D1312]">
            <span className="text-[#ded095] font-bold text-xs">🪙 GOLD:</span>
            <span className="text-xs font-extrabold text-[#ded095]">
              {gameState.gold}
            </span>
          </div>
          {mode === 'camp' && (
            <>
              <div className="flex items-center gap-1.5 bg-[#2A1B19] px-3 py-1 rounded border-2 border-[#7f644b] shadow-[inset_1px_1px_0px_#1D1312]">
                <span className="text-[#cb9f6b] font-bold text-xs">☀️ DAY:</span>
                <span className="text-xs font-black text-[#ded095] font-mono">
                  {dayCounter}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#2A1B19] px-3 py-1 rounded border-2 border-[#7f644b] shadow-[inset_1px_1px_0px_#1D1312]">
                <span className="text-[#cb9f6b] font-bold text-xs">⚡ STAMINA:</span>
                <span className={`text-xs font-black font-mono ${managerStamina < 33 ? 'text-[#9e4a42]' : 'text-[#88997a]'}`}>
                  {managerStamina} / 100
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mode === 'camp' && (
            <>
              {isRevoltUnlocked && (
                <button
                  onClick={launchSandboxBattle}
                  title="Lead the Slave Uprising to Seize Rome!"
                  className="bg-[#9e4a42] hover:bg-[#ba7654] text-[#ded095] border-2 border-[#ded095] text-xs font-bold px-3 py-1.5 rounded transition flex items-center gap-1.5 shadow-lg animate-pulse min-h-[36px] cursor-pointer">
                  <span>🔥 MARCH ON ROME</span>
                </button>
              )}

              {isEmperorEnraged && !isEmperorDefeated && (
                <button
                  onClick={() => setIsEmperorDuelModalOpen(true)}
                  title="Confront Emperor Aurelius in 1-on-1 Single Combat!"
                  className="bg-[#6d3947] hover:bg-[#9e4a42] text-[#ded095] border-2 border-[#ded095] text-xs font-bold px-3 py-1.5 rounded transition flex items-center gap-1.5 shadow-lg animate-pulse min-h-[36px] cursor-pointer">
                  <span>👑 DUEL EMPEROR (1v1)</span>
                </button>
              )}

              <button
                onClick={() => {
                  dismissStoryEvent(true);
                  setIsUpgradesModalOpen(true);
                  setIsBattlesModalOpen(false);
                  setIsArmoryModalOpen(false);
                  setIsRosterModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#574b50] hover:bg-[#6d3947] text-[#ded095] font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5 border-2 border-[#7f644b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] min-h-[36px]">
                <span>🏛️ Upgrades (F)</span>
              </button>

              <button
                onClick={() => {
                  dismissStoryEvent(true);
                  setIsBattlesModalOpen(true);
                  setIsArmoryModalOpen(false);
                  setIsRosterModalOpen(false);
                  setIsQuestBoardOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#9c8053] hover:bg-[#ded095] text-[#3f363b] font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5 border-2 border-[#7f644b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] min-h-[36px]">
                <span>⚔️ Arena Board (B)</span>
              </button>

              <button
                onClick={() => {
                  dismissStoryEvent(true);
                  if (isArmoryModalOpen) {
                    closeArmoryModal();
                  } else {
                    setArmoryTab('armoria');
                    setIsArmoryModalOpen(true);
                    setIsBattlesModalOpen(false);
                    setIsRosterModalOpen(false);
                    gameAudio.playCrispClick();
                  }
                }}
                className="bg-[#55796f] hover:bg-[#88997a] text-[#ded095] font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5 border-2 border-[#7f644b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#88997a] min-h-[36px]">
                <span>🛡️ Armory (U)</span>
              </button>

              <button
                onClick={() => {
                  dismissStoryEvent(true);
                  setIsRosterModalOpen(true);
                  setIsBattlesModalOpen(false);
                  setIsArmoryModalOpen(false);
                  setIsBondingModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5 border-2 border-[#7f644b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] min-h-[36px]">
                <span>📜 Roster ({gladiators.filter((g) => g.hp > 0).length}/10)</span>
              </button>

              <button
                onClick={() => {
                  dismissStoryEvent(true);
                  setIsBondingModalOpen(true);
                  setIsBattlesModalOpen(false);
                  setIsArmoryModalOpen(false);
                  setIsRosterModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#6d3947] hover:bg-[#9e4a42] text-[#ded095] font-bold text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5 border-2 border-[#7f644b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#9e4a42] min-h-[36px]">
                <span>🤝 Bonds (O)</span>
              </button>
            </>
          )}

          {mode === 'arena' && combatOutcome === 'in_progress' && (
            <div className="flex items-center gap-1 bg-[#3f363b] px-2 py-1 rounded border border-[#7f644b]">
              <button
                onClick={() => setIsSimPaused((prev) => !prev)}
                className="text-xs px-2 py-0.5 rounded font-bold bg-[#574b50] hover:bg-[#817475] text-[#ded095] flex items-center gap-1 min-h-[32px]">
                {isSimPaused ? <Play size={12} /> : <Pause size={12} />}
                <span>{isSimPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={() => setSimSpeed((prev) => (prev === 1 ? 2 : 1))}
                className="text-xs px-2 py-0.5 rounded font-bold bg-[#9c8053] hover:bg-[#ded095] text-[#3f363b] min-h-[32px]">
                {simSpeed}x Speed
              </button>
            </div>
          )}

          <button
            onClick={() => {
              dismissStoryEvent(true);
              setIsGameMenuOpen((prev) => !prev);
              gameAudio.playCrispClick();
            }}
            className="bg-[#3f363b] hover:bg-[#47505c] border border-[#7f644b] text-[#ded095] font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 min-w-[48px] min-h-[36px] justify-center transition">
            <Menu size={16} />
            <span>Menu</span>
          </button>
        </div>
      </header>
      )}

      {/* GAME CANVAS & CRISP VECTOR NOTIFICATIONS CONTAINER */}
      <div
        className="flex-1 w-full min-h-0 flex items-center justify-center bg-[#3f363b] relative overflow-hidden pointer-events-auto"
        style={{pointerEvents: 'auto'}}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          onPointerDown={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onPointerLeave={() => {
            setHoveredCampObject(null);
            hoveredCampObjectRef.current = null;
            setHoveredGraveId(null);
          }}
          style={{
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            width: `min(100%, calc(100vh * ${canvasWidth} / ${canvasHeight}))`,
            imageRendering: 'pixelated',
            pointerEvents: 'auto',
            cursor:
              mode === 'camp' && (hoveredCampObject || hoveredGraveId)
                ? 'pointer'
                : 'default',
          }}
          className="h-auto max-w-full max-h-full drop-shadow-2xl pointer-events-auto"
        />

        {/* CRISP HIGH-RESOLUTION EMPEROR POST-FIGHT VERDICT DIALOGUE OVERLAY */}
        {judgmentState.active && judgmentState.phase === 'verdict' && (
          <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-40 max-w-lg sm:max-w-xl w-full px-4 pointer-events-none animate-fadeIn select-none">
            <div
              style={{
                backgroundColor: '#181114',
                borderColor: judgmentState.verdict === 'thumbs_up' ? '#ded095' : '#9e4a42',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'geometricPrecision',
                imageRendering: 'auto',
              }}
              className="relative border-4 rounded-xl p-4 sm:p-5 shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_2px_0_#ded095] text-center">
              {/* Corner rivets */}
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />

              <div className="text-[10px] sm:text-xs tracking-widest uppercase font-bold text-[#cb9f6b] mb-1.5 font-serif">
                IMPERIAL BALCONY DECREE &bull; CAESAR AURELIUS
              </div>

              <h3
                style={{
                  color: judgmentState.verdict === 'thumbs_up' ? '#fadc9b' : '#ba7654',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9), 1px 1px 0 #000000',
                }}
                className="text-base sm:text-lg md:text-xl font-black font-serif tracking-wider mb-2.5 uppercase">
                {judgmentState.verdict === 'thumbs_up'
                  ? '👑 EMPEROR’S MERCY: THUMBS UP!'
                  : '💀 EMPEROR’S JUDGMENT: THUMBS DOWN!'}
              </h3>

              <p
                style={{
                  color: '#fadc9b',
                  lineHeight: '1.6',
                }}
                className="text-xs sm:text-sm md:text-base font-serif italic leading-relaxed max-w-lg mx-auto">
                {judgmentState.verdict === 'thumbs_up'
                  ? '“The Caesar is amused by your valor! Clemency is granted—downed gladiators shall survive with 1 HP.”'
                  : '“The arena sands demand blood! Condemned warriors shall be permanently executed upon the sand.”'}
              </p>

              <div className="text-[10px] text-[#a4968d] mt-2 font-mono uppercase tracking-wider">
                {judgmentState.verdict === 'thumbs_up'
                  ? 'Royal clemency bestowed on survivors'
                  : 'Coup de grâce decreed by the crowd'}
              </div>
            </div>
          </div>
        )}


        {/* DIEGETIC AUTOSAVE INDICATOR IN CAMP (Wax Seal Icon with Antique Gold Text) */}
        {autosaveVisible && mode === 'camp' && (
          <div
            key={autosaveKey}
            className="pointer-events-none absolute top-3 sm:top-4 right-3 sm:right-4 z-50 flex items-center gap-2.5 bg-[#2A1B19]/95 border-2 border-[#8C7A6B] px-3.5 py-1.5 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.9),inset_0_1px_0_#ded095] animate-autosave backdrop-blur-md">
            {/* Small stone wax seal icon */}
            <div className="w-5 h-5 rounded-full bg-[#9e4a42] border border-[#F7DEAA] flex items-center justify-center text-[10px] text-[#F7DEAA] font-black shadow-inner shrink-0">
              <span>🔏</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-black text-xs text-[#F7DEAA] tracking-wider drop-shadow-sm uppercase">
                Game Autosaved
              </span>
              <span className="text-[9px] text-[#cb9f6b] font-medium leading-none">
                Day {dayCounter} &bull; State Preserved
              </span>
            </div>
          </div>
        )}

        {/* Active Physician Healing Aura Banner in Camp */}
        {physicianNpc.active && mode === 'camp' && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-[#2A1B19]/95 border-2 border-[#4ade80] rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-pulse max-w-md">
            <span className="text-2xl">🌿</span>
            <div className="text-left">
              <div className="text-xs font-bold text-[#4ade80] flex items-center gap-1.5">
                <span>PHYSICIAN HEALING AURA ACTIVE</span>
                <span className="text-[10px] text-[#ded095] font-mono font-bold">({Math.ceil(physicianNpc.timer)}s)</span>
              </div>
              <div className="text-[11px] text-[#cb9f6b]">
                Scholarly Alexandrian Physician tending nearby champions with poultices
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Visitor Banner in Camp */}
        {currentVisitor && mode === 'camp' && (
          <div
            onClick={() => setIsVisitorModalOpen(true)}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-[#2A1B19]/95 border-2 border-[#fbbf24] rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md cursor-pointer animate-bounce flex items-center gap-2.5 max-w-md">
            <span className="text-2xl">
              {currentVisitor.type === 'merchant' ? '🧪' : currentVisitor.type === 'scout' ? '📜' : currentVisitor.type === 'patron' ? '🏛️' : '⚔️'}
            </span>
            <div className="text-left">
              <div className="text-xs font-bold text-[#ded095] flex items-center gap-1.5">
                <span>CAMP VISITOR:</span>
                <span className="text-[#fbbf24]">{currentVisitor.name}</span>
                <span className="text-[10px] text-[#a4968d]">({currentVisitor.title})</span>
              </div>
              <div className="text-[11px] text-[#cb9f6b]">
                "{currentVisitor.greeting}" &bull; Click to speak! ({Math.ceil(currentVisitor.timer)}s)
              </div>
            </div>
          </div>
        )}

        {/* CRISP FLOATING VECTOR COMBAT NOTIFICATIONS OVERLAY */}
        {mode === 'arena' && !judgmentState.active && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {crispPopups.map((pop) => {
              const leftPct = (pop.logicX / LOGIC_WIDTH) * 100;
              const topPct = (pop.logicY / LOGIC_HEIGHT) * 100;
              return (
                <div
                  key={pop.id}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    color: pop.color,
                    opacity: Math.max(0, pop.life / pop.maxLife),
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 font-extrabold whitespace-nowrap drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] ${
                    pop.isFatal
                      ? 'text-lg md:text-xl text-[#9e4a42] animate-bounce tracking-widest'
                      : pop.isCrit
                        ? 'text-base md:text-lg text-[#fbbf24] tracking-wide'
                        : pop.color === '#4ade80'
                          ? 'text-sm md:text-base text-[#4ade80] font-black animate-pulse'
                          : 'text-sm md:text-base'
                  }`}>
                  {pop.text}
                </div>
              );
            })}
          </div>
        )}

        {/* SLAVE UPRISING LIVE TELEMETRY DASHBOARD & REINFORCEMENTS BUTTON */}
        {mode === 'arena' && isSandboxBattle && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-[#2A1B19]/95 border-4 border-[#8C7A6B] rounded-xl p-2.5 sm:p-3 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col items-center gap-2 backdrop-blur-md min-w-[300px] sm:min-w-[400px] max-w-lg relative">
            <span className="absolute top-1 left-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
            {/* Dashboard Header */}
            <div className="flex items-center justify-between w-full border-b border-[#7f644b]/60 pb-1 text-xs">
              <span className="font-serif font-black text-[#ded095] tracking-wider flex items-center gap-1.5">
                <span>🔥 ROME IN FLAMES</span>
                <span className="text-[10px] text-[#cb9f6b]">| UPRISING TELEMETRY</span>
              </span>
              <span className="text-[10px] text-[#cb9f6b] font-mono uppercase font-bold">
                {combatOutcome === 'in_progress' ? '● BATTLE IN PROGRESS' : 'CONCLUDED'}
              </span>
            </div>

            {/* Live Counts & Total Faction Damage */}
            <div className="grid grid-cols-2 gap-2 w-full text-center">
              <div className="bg-[#3f363b] p-1.5 rounded border border-[#55796f]">
                <div className="text-[9px] text-[#a4968d] font-bold uppercase tracking-wider">
                  Rebels &amp; Champions
                </div>
                <div className="text-sm font-black text-[#88997a]">
                  {arenaFightersRef.current.filter((f) => f.isPlayerTeam && f.hp > 0).length} Active
                </div>
                <div className="text-[10px] text-[#ded095] mt-0.5">
                  Dmg: <strong className="font-mono text-[#ded095]">{sandboxTelemetry.rebelDamageDealt}</strong>
                </div>
              </div>

              <div className="bg-[#3f363b] p-1.5 rounded border border-[#9e4a42]">
                <div className="text-[9px] text-[#a4968d] font-bold uppercase tracking-wider">
                  Roman Legionaries
                </div>
                <div className="text-sm font-black text-[#ba7654]">
                  {arenaFightersRef.current.filter((f) => !f.isPlayerTeam && f.hp > 0).length} Active
                </div>
                <div className="text-[10px] text-[#ded095] mt-0.5">
                  Dmg: <strong className="font-mono text-[#ded095]">{sandboxTelemetry.romanDamageDealt}</strong>
                </div>
              </div>
            </div>

            {/* Outcome Alert Banner */}
            {sandboxOutcomeAlert && (
              <div
                className={`w-full py-1 px-2 rounded text-center text-xs font-black tracking-wide animate-bounce ${
                  arenaFightersRef.current.filter((f) => !f.isPlayerTeam && f.hp > 0).length === 0
                    ? 'bg-[#55796f] text-white border border-[#ded095]'
                    : 'bg-[#9e4a42] text-white border border-[#ded095]'
                }`}>
                {sandboxOutcomeAlert}
              </div>
            )}

            {/* Test Feature: Rebel Reinforcements Button */}
            {combatOutcome === 'in_progress' && (
              <button
                type="button"
                onClick={triggerRebelReinforcements}
                disabled={isSimulatedAdActive}
                className="w-full bg-[#ba7654] hover:bg-[#cb9f6b] active:scale-95 text-[#3f363b] font-black py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer">
                <span>✊ [REBEL REINFORCEMENTS]</span>
                <span className="text-[10px] opacity-80">(Simulate 5s Ad Boost)</span>
              </button>
            )}
          </div>
        )}

        {/* SIMULATED AD COUNTDOWN OVERLAY */}
        {isSimulatedAdActive && (
          <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
            <div className="relative bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-6 max-w-sm w-full text-center shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col items-center">
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
              <span className="text-3xl mb-2 animate-bounce">📢</span>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#cb9f6b] mb-1">
                Simulated Ad: Supporting the Rebellion...
              </h3>
              <div className="text-3xl font-black text-[#fbbf24] font-mono my-3">
                {Math.max(1, Math.ceil(adCountdown))}s
              </div>
              <div className="w-full bg-[#2A1B19] h-3 rounded-full overflow-hidden border border-[#7f644b] mb-3">
                <div
                  className="bg-gradient-to-r from-[#ba7654] to-[#ded095] h-full transition-all duration-200"
                  style={{ width: `${Math.max(0, Math.min(100, ((5 - adCountdown) / 5) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-[#a4968d] italic">
                Simulating sponsored support for the uprising... 5 Rebel Slaves will deploy on finish!
              </p>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* CINEMATIC STORY DIALOGUE EVENT SYSTEM OVERLAYS                       */}
        {/* ==================================================================== */}
        {/* 3) Game background dark vignette / dimmer overlay */}
        {cinematicState >= 4 && storyState.bgDimmerAlpha > 0 && storyState.phase !== 'inactive' && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              advanceStoryDialogue();
            }}
            style={{
              opacity: storyState.bgDimmerAlpha * 0.75,
              transition: 'opacity 0.12s linear',
            }}
            title="Click anywhere to advance or dismiss story"
            className="absolute inset-0 bg-[#090d16] pointer-events-auto cursor-pointer z-30"
          />
        )}

        {/* 1) Speech bar rising up from the bottom with feathered top edge */}
        {cinematicState >= 4 && storyState.phase !== 'inactive' && (
          <div
            onClick={() => {
              if (storyState.phase !== 'quest_choice') {
                advanceStoryDialogue();
              }
            }}
            style={{
              transform: `translateY(${(1 - storyState.barRiseProgress) * 130}%)`,
              transition: 'transform 0.05s linear',
            }}
            className="absolute bottom-3 sm:bottom-5 left-3 right-3 max-w-2xl sm:max-w-3xl mx-auto z-40 cursor-pointer pointer-events-auto select-none">
            {/* 5) The gladiator's name appears clearly above the speech bar */}
            <div
              style={{
                opacity: storyState.portraitColorAlpha,
                transition: 'opacity 0.15s ease-in-out',
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2A1B19] border-2 border-b-0 border-[#8C7A6B] rounded-t-lg shadow-xl text-xs font-bold text-[#ded095] tracking-wide">
              <span className="text-[#cb9f6b]">⚔️ {storyState.gladiatorName}</span>
              <span className="text-[#a4968d] text-[10px]">
                ({CULTURE_LABELS[storyState.culture]})
              </span>
              {storyState.event && (
                <span className="text-[10px] text-[#ded095]/80 italic">
                  &bull; {storyState.event.title}
                </span>
              )}
            </div>

            {/* Speech Bar Container with Antiquity Stone Box Border */}
            <div className="relative bg-[#2A1B19]/98 border-4 border-[#8C7A6B] rounded-xl rounded-tl-none p-3 sm:p-4 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex items-start gap-3 sm:gap-4.5 backdrop-blur-sm">
              <span className="absolute top-1 left-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
              {/* Failsafe Top-Right Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissStoryEvent(true);
                }}
                title="Close Story Tale [Esc]"
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3f363b]/95 hover:bg-[#9e4a42] border border-[#9c8053] text-[#ded095] hover:text-white flex items-center justify-center transition shadow-md z-50 cursor-pointer">
                <X size={16} />
              </button>

              {/* 32x32 Pixel Bust Portrait Frame (Silhouette -> Full-Color Fade) */}
              {(() => {
                const speakingGlad = gladiators.find((g) => g.id === storyState.gladiatorId);
                return (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#292326] border-2 border-[#7f644b] rounded-lg overflow-hidden shadow-inner p-1">
                    {/* 2) Solid silhouette in black */}
                    <img
                      src={getPortraitDataUrl(
                        storyState.culture,
                        80,
                        true,
                        '#000000',
                        speakingGlad?.level,
                        false,
                        speakingGlad?.heroType,
                        speakingGlad?.gladiatorClass,
                      )}
                      alt="Silhouette"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {/* 4) Full-color 32x32 portrait fading in smoothly */}
                    <img
                      src={getPortraitDataUrl(
                        storyState.culture,
                        80,
                        false,
                        undefined,
                        speakingGlad?.level,
                        false,
                        speakingGlad?.heroType,
                        speakingGlad?.gladiatorClass,
                      )}
                      alt={storyState.gladiatorName}
                      style={{
                        imageRendering: 'pixelated',
                        opacity: storyState.portraitColorAlpha,
                      }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity"
                    />
                  </div>
                );
              })()}

              {/* Story Narrative Text Section or Branching Quest Choices */}
              <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[4.2rem] sm:min-h-[5.2rem] pr-8 sm:pr-9">
                {storyState.phase === 'quest_choice' ? (
                  /* Branching Quest Choice Interface Seamlessly Inside Dialogue Box */
                  (() => {
                    const questNode = storyState.event?.questNodeId
                      ? QUEST_DATABASE[storyState.event.questNodeId]
                      : null;
                    if (!questNode) return null;

                    const effectiveGladId = selectedQuestGladId || storyState.gladiatorId;
                    const dispatchedGlad =
                      gladiators.find((g) => g.id === effectiveGladId && g.hp > 0) ||
                      gladiators.find((g) => g.id === storyState.gladiatorId) ||
                      gladiators[0];

                    return (
                      <div className="flex flex-col gap-2 select-none" onClick={(e) => e.stopPropagation()}>
                        <div className="text-xs sm:text-sm font-serif font-bold text-[#cb9f6b]">
                          Dominus, how shall we proceed with this quest?
                        </div>

                        {/* Squad Member Selector for Dispatch */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] bg-[#3f363b]/90 p-1.5 rounded border border-[#7f644b]/60">
                          <span className="text-[#a4968d] font-bold">Dispatch Champion:</span>
                          {gladiators
                            .filter((g) => g.status === 'Available' && g.hp > 0)
                            .map((g) => {
                              const isPicked = g.id === dispatchedGlad.id;
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuestGladId(g.id);
                                    gameAudio.playHoverMicroTone();
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                                    isPicked
                                      ? 'bg-[#ded095] text-[#3f363b] ring-1 ring-[#ded095]'
                                      : 'bg-[#574b50] text-[#ded095] hover:bg-[#6d3947]'
                                  }`}>
                                  <span>{g.name.split(' ')[0]}</span>
                                  <span className="text-[9px] opacity-75">
                                    ({g.attack}A/{g.defense}D/{g.speed}S)
                                  </span>
                                </button>
                              );
                            })}
                        </div>

                        {/* Choices with Calculated Probabilities */}
                        <div className="flex flex-col gap-1.5 mt-1 max-h-48 overflow-y-auto pr-1">
                          {questNode.choices.map((choice, idx) => {
                            const requiresGlad = choice.requiredStat !== 'none';
                            const calcChance = requiresGlad
                              ? calculateGladiatorSuccessChance(
                                  dispatchedGlad,
                                  choice.requiredStat,
                                  choice.baseChance,
                                  choice.statWeight,
                                )
                              : choice.baseChance;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedQuestGladId(dispatchedGlad.id);
                                  dispatchGladiatorOnQuest(questNode, idx);
                                }}
                                className="w-full text-left p-2 rounded bg-[#3f363b] hover:bg-[#574b50] border border-[#7f644b] hover:border-[#ded095] transition flex items-start justify-between gap-2 cursor-pointer group">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    {requiresGlad ? (
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                          calcChance >= 70
                                            ? 'bg-[#55796f]/40 text-[#ded095] border-[#55796f]'
                                            : calcChance >= 50
                                              ? 'bg-[#ba7654]/40 text-[#ded095] border-[#ba7654]'
                                              : 'bg-[#9e4a42]/40 text-[#ba7654] border-[#9e4a42]'
                                        }`}>
                                        [{choice.requiredStat.toUpperCase()} {calcChance}% CHANCE]
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#574b50] text-[#cb9f6b] border border-[#cb9f6b]/50">
                                        [DECISION]
                                      </span>
                                    )}
                                    <span className="text-xs font-semibold text-[#ded095] group-hover:text-white">
                                      {choice.text}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[10px] text-[#a4968d]">
                                    {choice.rewards && (
                                      <span className="text-[#88997a]">
                                        Rewards: {choice.rewards.gold ? `+${choice.rewards.gold} Gold ` : ''}
                                        {choice.rewards.heal ? `+Heal ` : ''}
                                      </span>
                                    )}
                                    {choice.penalty && (
                                      <span className="text-[#ba7654]">
                                        Risk: {choice.penalty.damage ? `-${choice.penalty.damage} HP ` : ''}
                                        {choice.penalty.gold ? `${choice.penalty.gold} Gold ` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 self-center">
                                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#9c8053] group-hover:bg-[#ded095] text-[#3f363b] transition">
                                    {questNode.duration > 0 && requiresGlad
                                      ? `Dispatch (${questNode.duration}s) ➔`
                                      : 'Resolve ➔'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    <div className="text-xs sm:text-sm md:text-base leading-relaxed text-[#ded095] font-serif italic pr-2 select-none">
                      {(() => {
                        const currentLine =
                          storyState.event?.lines[storyState.currentLineIndex] || '';
                        if (
                          storyState.phase === 'bar_rising' ||
                          storyState.phase === 'portrait_fading_in'
                        ) {
                          return '';
                        }
                        if (
                          storyState.phase === 'closing_fade' ||
                          storyState.phase === 'closing_bar_lowering'
                        ) {
                          return currentLine;
                        }
                        return currentLine.slice(0, storyState.typedCharCount);
                      })()}
                      {storyState.phase === 'typing' && (
                        <span className="inline-block w-1.5 h-3.5 bg-[#cb9f6b] ml-1 animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Footer Controls & Progression */}
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#7f644b]/50 text-[10px] text-[#a4968d]">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setStoryState((p) => ({...p, isSpeedingUp: true}));
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                            setStoryState((p) => ({...p, isSpeedingUp: false}));
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            setStoryState((p) => ({...p, isSpeedingUp: true}));
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            setStoryState((p) => ({...p, isSpeedingUp: false}));
                          }}
                          className="bg-[#3f363b] hover:bg-[#574b50] active:bg-[#9c8053] active:text-[#3f363b] px-2 py-0.5 rounded border border-[#7f644b] text-[#ded095] font-mono cursor-pointer transition min-h-[26px]">
                          [A] Hold to Speed Up
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceStoryDialogue();
                          }}
                          className="bg-[#9c8053] hover:bg-[#ded095] text-[#3f363b] px-2.5 py-0.5 rounded font-bold transition min-h-[26px]">
                          {storyState.phase === 'typing' ? 'Skip Line' : 'Advance [Space]'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissStoryEvent(true);
                          }}
                          className="bg-[#3f363b] hover:bg-[#9e4a42] text-[#ded095] hover:text-white px-2 py-0.5 rounded border border-[#7f644b] font-bold transition min-h-[26px] flex items-center gap-1 cursor-pointer">
                          <X size={12} />
                          <span>Close [Esc]</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 font-bold">
                        {storyState.phase === 'line_ready' ? (
                          <span className="text-[#cb9f6b] animate-bounce flex items-center gap-1">
                            <span>Advance to Choice</span>
                            <span>▼</span>
                          </span>
                        ) : (
                          <span className="text-[#a4968d]">
                            Segment {storyState.currentLineIndex + 1} /{' '}
                            {storyState.event?.lines.length || 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* CAMP VIEW: GLADIATOR INSPECTION CARD & QUICK SQUAD SELECTOR          */}
        {/* ==================================================================== */}
        {cinematicState >= 4 && mode === 'camp' && storyState.phase === 'inactive' && (
          <>
            {/* Grand Campaign Climax Banner: MARCH ON ROME */}
            {isRevoltUnlocked && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-md w-full px-3">
                <div className="bg-gradient-to-r from-[#9e4a42] via-[#6d3947] to-[#9e4a42] border-2 border-[#ded095] rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-[#ded095]">
                        GRAND REVOLT UNLOCKED
                      </div>
                      <h3 className="font-serif font-black text-sm md:text-base text-white leading-tight">
                        MARCH ON ROME (SEIZE THE CITY)
                      </h3>
                      <p className="text-[10px] text-[#ded095]/90 italic">
                        15 Rebel Slaves + Ludus vs 10 Roman Legionaries!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={launchSandboxBattle}
                    className="bg-[#ded095] hover:bg-white text-[#2A1B19] font-black text-xs px-3 py-1.5 rounded-lg shadow transition uppercase tracking-wider shrink-0 cursor-pointer">
                    MARCH ➔
                  </button>
                </div>
              </div>
            )}

            {/* Imperial Boss Banner: EMPEROR AURELIUS 1v1 DUEL */}
            {isEmperorEnraged && !isEmperorDefeated && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-md w-full px-3">
                <div className="bg-gradient-to-r from-[#6d3947] via-[#574b50] to-[#6d3947] border-2 border-[#ded095] rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">👑</span>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-[#cb9f6b]">
                        IMPERIAL BOSS DUEL READY
                      </div>
                      <h3 className="font-serif font-black text-sm md:text-base text-[#ded095] leading-tight">
                        DUEL EMPEROR AURELIUS
                      </h3>
                      <p className="text-[10px] text-[#ded095]/90 italic">
                        The tyrant descends in gilded armor for 1-on-1 combat!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const living = gladiatorsRef.current.filter((g) => g.hp > 0 && g.status === 'Available');
                      const topGlad = [...living].sort((a, b) => b.level - a.level)[0];
                      if (topGlad) setEmperorDuelSelectedGladId(topGlad.id);
                      setIsEmperorDuelModalOpen(true);
                    }}
                    className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black text-xs px-3 py-1.5 rounded-lg shadow transition uppercase tracking-wider shrink-0 cursor-pointer">
                    DUEL ➔
                  </button>
                </div>
              </div>
            )}

            {/* Active Expedition Countdown Banner (Top Left) */}
            {activeExpeditions.length > 0 && (
              <div className="absolute top-2.5 left-3 flex flex-col gap-1.5 z-20 pointer-events-auto">
                {activeExpeditions.map((exp) => {
                  const pct = Math.max(
                    0,
                    Math.min(100, ((exp.totalDuration - exp.remainingTime) / exp.totalDuration) * 100),
                  );
                  return (
                    <div
                      key={exp.nodeId}
                      className="bg-[#574b50]/95 border-2 border-[#9c8053] rounded-lg p-2 shadow-xl flex items-center gap-2.5 backdrop-blur-sm max-w-xs">
                      <div className="w-8 h-8 shrink-0 bg-[#2d272a] border border-[#7f644b] rounded overflow-hidden p-0.5">
                        <img
                          src={getNpcPortraitDataUrl(exp.portraitType, 32)}
                          alt={exp.speaker}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#ded095]">
                          <span className="truncate">{exp.gladiatorName}</span>
                          <span className="text-[#cb9f6b] shrink-0 font-mono ml-1">
                            {Math.ceil(exp.remainingTime)}s
                          </span>
                        </div>
                        <div className="text-[10px] text-[#a4968d] truncate">
                          {exp.questTitle}
                        </div>
                        <div className="w-full bg-[#3f363b] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-[#ded095] h-full transition-all duration-200"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Camp Courier Arrival Notification Banner (Top Center) */}
            {courierNotice && (
              <div
                onClick={() => {
                  openQuestNode(courierNotice.nodeId);
                  setCourierNotice(null);
                }}
                className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-[#574b50]/95 border-2 border-[#ded095] rounded-xl px-4 py-2 shadow-2xl z-20 pointer-events-auto backdrop-blur-sm cursor-pointer animate-bounce flex items-center gap-2.5 max-w-md">
                <span className="text-xl">📜</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#ded095] flex items-center gap-1.5">
                    <span>COURIER ARRIVED:</span>
                    <span className="text-[#cb9f6b]">{courierNotice.speaker}</span>
                  </div>
                  <div className="text-[11px] text-[#a4968d]">
                    "{courierNotice.title}" &bull; Click to read dispatch!
                  </div>
                </div>
              </div>
            )}

            {/* Camp Trial Bell Action Widget (Bottom of Camp Courtyard on Desktop) */}
            {!isMobile && (
              <div className="absolute bottom-3 right-4 z-20 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playBellRing();
                    setIsTrialBellModalOpen(true);
                  }}
                  title="Ring Camp Trial Bell (Skip Wait to Next Podium Trial)"
                  className="bg-[#574b50]/95 hover:bg-[#6d3947] active:bg-[#9c8053] border-2 border-[#9c8053] text-[#ded095] px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xl flex items-center gap-2 backdrop-blur-md cursor-pointer group">
                  <span className="text-base group-hover:scale-110 transition-transform">🔔</span>
                  <div className="text-left hidden sm:block">
                    <div className="text-[11px] font-black text-[#ded095] leading-tight">
                      TRIAL BELL
                    </div>
                    <div className="text-[9px] text-[#cb9f6b] leading-tight">
                      Skip to Podium Battle
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Quick Camp Champions Portrait Strip (Top Right Overlay) */}
            <div className="absolute top-2.5 right-3 flex items-center gap-1.5 bg-[#2A1B19]/90 border-2 border-[#8C7A6B] p-1.5 rounded-lg shadow-lg z-20 pointer-events-auto backdrop-blur-sm max-w-[calc(100vw-120px)] overflow-x-auto">
              <span className="text-[10px] text-[#cb9f6b] font-bold px-1 hidden sm:inline font-serif">
                CHAMPIONS:
              </span>
              {gladiators.map((glad) => {
                const isSelected = selectedCampGladId === glad.id;
                const isSlain = glad.hp <= 0;
                const isOnQuest = glad.status === 'On Quest' && glad.hidden;
                return (
                  <button
                    key={glad.id}
                    title={`${glad.name} (${CULTURE_LABELS[glad.culture]})${isOnQuest ? ' [On Quest]' : ''}`}
                    onClick={() => {
                      if (isOnQuest) return;
                      setSelectedCampGladId((prev) => (prev === glad.id ? null : glad.id));
                      gameAudio.playCrispClick();
                    }}
                    className={`relative w-8 h-8 rounded border transition overflow-hidden p-0.5 ${
                      isSlain
                        ? 'opacity-40 border-[#9e4a42] bg-[#3f363b]'
                        : isOnQuest
                          ? 'opacity-60 border-[#9c8053] bg-[#3f363b]'
                          : isSelected
                            ? 'border-[#ded095] ring-2 ring-[#ded095] bg-[#574b50]'
                            : 'border-[#7f644b] hover:border-[#cb9f6b] bg-[#2d272a]'
                    }`}>
                    <img
                      src={getPortraitDataUrl(
                        glad.culture,
                        32,
                        false,
                        undefined,
                        glad.level,
                        isSlain,
                        glad.heroType,
                        glad.gladiatorClass,
                      )}
                      alt={glad.name}
                      className="w-full h-full object-contain"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {isSlain && (
                      <div className="absolute inset-0 bg-[#9e4a42]/70 flex items-center justify-center text-[10px] font-bold text-white">
                        ✕
                      </div>
                    )}
                    {isOnQuest && !isSlain && (
                      <div className="absolute inset-0 bg-[#3f363b]/70 flex items-center justify-center text-[10px] font-bold text-[#ded095]">
                        ⏳
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lanista Aulus Dedicated Window Beneath Champions with Interactive Menu */}
            <div className="absolute top-14 right-3 z-20 pointer-events-auto flex items-center gap-2.5 bg-[#2A1B19]/95 border-2 border-[#8C7A6B] p-1.5 px-2.5 rounded-lg shadow-xl backdrop-blur-sm">
              <button
                title="Lanista Aulus (Manager) • Click for Directives Cascading Menu"
                onClick={() => {
                  setIsManagerMenuOpen((prev) => !prev);
                  setActiveCascadingSubMenu('none');
                  setSelectedCampGladId(null);
                  gameAudio.playCrispClick();
                }}
                className={`relative w-9 h-9 rounded border transition overflow-hidden p-0.5 shrink-0 ${
                  isManagerMenuOpen
                    ? 'border-[#ded095] ring-2 ring-[#ded095] bg-[#574b50]'
                    : 'border-[#9c8053] hover:border-[#ded095] bg-[#2d272a]'
                }`}>
                <img
                  src={getAulusPortraitDataUrl(36)}
                  alt="Lanista Aulus"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </button>

              <div className="flex flex-col text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black text-xs text-[#ded095] leading-none">LANISTA AULUS</span>
                  <span className="text-[9px] text-[#cb9f6b] font-bold">Lvl {toRoman(speechcraftLevel)}</span>
                </div>
                <div className="text-[10px] text-[#a4968d] leading-tight mt-0.5">
                  Stamina: <strong className={`font-mono ${managerStamina < 33 ? 'text-[#9e4a42]' : 'text-[#88997a]'}`}>{managerStamina} / 100</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsManagerMenuOpen((prev) => !prev);
                  setActiveCascadingSubMenu('none');
                  gameAudio.playCrispClick();
                }}
                className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black px-2.5 py-1.5 rounded text-[10px] tracking-wider transition shadow cursor-pointer min-h-[30px] flex items-center gap-1">
                <span>{isManagerMenuOpen ? '▲ CLOSE' : '▼ ACTIONS'}</span>
              </button>
            </div>

            {/* FLOATING CASCADING DIRECTIVES MENU IN CAMP VIEW */}
            {isManagerMenuOpen && !isRosterModalOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 pointer-events-auto"
                  onClick={() => {
                    setIsManagerMenuOpen(false);
                    setActiveCascadingSubMenu('none');
                  }}
                />
                <div
                  className="absolute top-28 right-3 max-w-md w-full sm:w-auto z-40 pointer-events-auto animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="bg-[#2A1B19]/98 border-4 border-[#8C7A6B] rounded-xl p-3 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col sm:flex-row gap-3 relative backdrop-blur-md">
                  <span className="absolute top-1 left-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
                  <span className="absolute bottom-1 left-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-[#ded095] border border-black pointer-events-none" />

                  {/* Manager Header & Actions */}
                  <div className="w-full sm:w-56 shrink-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-[#7f644b] text-xs font-black text-[#cb9f6b]">
                      <span className="flex items-center gap-1.5">
                        <img
                          src={getAulusPortraitDataUrl(24)}
                          alt="Lanista"
                          className="w-5 h-5 rounded border border-[#9c8053]"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <span>[▼ ACTIONS]</span>
                      </span>
                      <span className={`text-[10px] font-mono ${managerStamina < 33 ? 'text-[#9e4a42]' : 'text-[#88997a]'}`}>
                        ⚡ {managerStamina}/100
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManagerMenuOpen(false);
                          setActiveCascadingSubMenu('none');
                        }}
                        className="text-[#a4968d] hover:text-white p-0.5">
                        ✕
                      </button>
                    </div>

                    {/* HOLD FEAST UNLOCKED ACTION */}
                    {isFeastUnlocked && (
                      <button
                        type="button"
                        onClick={handleHoldFeast}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-black bg-[#48201b] hover:bg-[#6d3947] text-[#fbbf24] border border-[#fbbf24]/50 transition flex items-center justify-between cursor-pointer shadow">
                        <span>🍷 HOLD FEAST (-33 STAMINA)</span>
                        <span className="text-[10px] text-[#ded095]">50G</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onMouseEnter={() => setActiveCascadingSubMenu('motivate')}
                      onClick={() => setActiveCascadingSubMenu(activeCascadingSubMenu === 'motivate' ? 'none' : 'motivate')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        activeCascadingSubMenu === 'motivate'
                          ? 'bg-[#ded095] text-[#2A1B19]'
                          : 'bg-[#3f363b] hover:bg-[#574b50] text-[#ded095]'
                      }`}>
                      <span>▶ MOTIVATE (-33 STAMINA)</span>
                      <span className="text-[10px] opacity-75">➔</span>
                    </button>

                    <button
                      type="button"
                      onMouseEnter={() => setActiveCascadingSubMenu('intimidate')}
                      onClick={() => setActiveCascadingSubMenu(activeCascadingSubMenu === 'intimidate' ? 'none' : 'intimidate')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        activeCascadingSubMenu === 'intimidate'
                          ? 'bg-[#ded095] text-[#2A1B19]'
                          : 'bg-[#3f363b] hover:bg-[#574b50] text-[#ded095]'
                      }`}>
                      <span>▶ INTIMIDATE (-33 STAMINA)</span>
                      <span className="text-[10px] opacity-75">➔</span>
                    </button>

                    {/* DISPATCH PHYSICIAN ACTION */}
                    <button
                      type="button"
                      disabled={managerStamina < 33 || gameState.gold < physicianCost || physicianNpc.active}
                      onClick={handleSummonPhysician}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-between cursor-pointer ${
                        managerStamina < 33 || gameState.gold < physicianCost
                          ? 'bg-[#3f363b]/50 text-[#817475] border border-[#574b50] cursor-not-allowed opacity-60'
                          : physicianNpc.active
                            ? 'bg-[#2A1B19] text-[#4ade80] border border-[#4ade80]/60'
                            : 'bg-[#2f5c3a]/80 hover:bg-[#3d774b] text-[#ded095] border border-[#ded095]/60 shadow'
                      }`}>
                      <span>▶ DISPATCH PHYSICIAN ({physicianCost}G)</span>
                      <span className="text-[10px] text-[#cb9f6b]">
                        {physicianNpc.active ? `${Math.ceil(physicianNpc.timer)}s ACTIVE` : '-33 STAMINA'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleCampStudyOpponent();
                        setIsManagerMenuOpen(false);
                        setActiveCascadingSubMenu('none');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] transition flex items-center justify-between cursor-pointer">
                      <span>▶ SCOUT REPORT (-33 STAMINA)</span>
                      <span className="text-[10px] text-[#cb9f6b]">Intel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsManagerMenuOpen(false);
                        setActiveCascadingSubMenu('none');
                        setIsRosterModalOpen(true);
                        setRosterTab('champions');
                        gameAudio.playCrispClick();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] transition flex items-center justify-between cursor-pointer">
                      <span>▶ RECRUIT TALENT (0 STAMINA)</span>
                      <span className="text-[10px] text-[#88997a]">Free Cost</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsManagerMenuOpen(false);
                        setActiveCascadingSubMenu('none');
                        setIsUpgradesModalOpen(true);
                        gameAudio.playCrispClick();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] transition flex items-center justify-between cursor-pointer">
                      <span>▶ FACILITY LEDGER</span>
                      <span className="text-[10px] text-[#fbbf24]">Upgrades</span>
                    </button>
                  </div>

                  {/* Sub-dropdown listing gladiators */}
                  {activeCascadingSubMenu !== 'none' && (
                    <div className="w-full sm:w-60 bg-[#3f363b] border-2 border-[#7f644b] rounded-lg p-2.5 flex flex-col gap-1.5 animate-fadeIn">
                      <div className="text-[11px] font-bold text-[#cb9f6b] pb-1 border-b border-[#7f644b]/60 flex items-center justify-between">
                        <span>
                          {activeCascadingSubMenu === 'motivate'
                            ? 'BOOST MORALE (+10 WIL):'
                            : 'DISCIPLINE (+3 ATK):'}
                        </span>
                        <span className="text-[9px] text-[#a4968d]">Target</span>
                      </div>

                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {gladiators
                          .filter((g) => g.hp > 0)
                          .map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                if (activeCascadingSubMenu === 'motivate') {
                                  handleMotivateGladiator(g.id);
                                } else if (activeCascadingSubMenu === 'intimidate') {
                                  handleIntimidateGladiator(g.id);
                                }
                              }}
                              className="w-full p-1.5 rounded bg-[#2A1B19] hover:bg-[#574b50] border border-[#7f644b] text-left flex items-center justify-between gap-1.5 text-xs transition cursor-pointer">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-6 h-6 rounded bg-[#3f363b] overflow-hidden p-0.5 border border-[#7f644b] shrink-0">
                                  <img
                                    src={getPortraitDataUrl(g.culture, 24, false, undefined, g.level, false, g.heroType, g.gladiatorClass)}
                                    alt={g.name}
                                    className="w-full h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <span className="font-bold text-[#ded095] truncate text-[11px]">{g.name.split(' ')[0]}</span>
                              </div>
                              <span className="text-[10px] text-[#cb9f6b] shrink-0">
                                {activeCascadingSubMenu === 'motivate'
                                  ? `WIL ${g.attributes?.wil ?? 10}`
                                  : `ATK ${g.attack}`}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

            {/* Selected Gladiator Detail Inspection Card in Camp */}
            {selectedCampGladId && (() => {
              const inspectedGlad = gladiators.find((g) => g.id === selectedCampGladId);
              if (!inspectedGlad) return null;
              const closestBond = getClosestBondedAlly(inspectedGlad.id, gladiatorBonds, gladiators);
              const bondTier = getBondTier(closestBond.score);
              const isDeployed = selectedGladiatorIds.includes(inspectedGlad.id);

              return (
                <div className="absolute top-28 right-3 max-w-xs w-72 bg-[#574b50]/95 border-2 border-[#9c8053] rounded-xl p-3.5 shadow-2xl z-20 pointer-events-auto backdrop-blur-md flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-start justify-between pb-2 border-b border-[#7f644b]">
                    <div className="flex items-center gap-2.5">
                      {/* Detailed 32x32 Pixel Portrait */}
                      <div className="w-14 h-14 shrink-0 bg-[#2d272a] border-2 border-[#7f644b] rounded-lg p-0.5 shadow-md">
                        <img
                          src={getPortraitDataUrl(
                            inspectedGlad.culture,
                            64,
                            false,
                            undefined,
                            inspectedGlad.level,
                            inspectedGlad.hp <= 0,
                            inspectedGlad.heroType,
                            inspectedGlad.gladiatorClass,
                          )}
                          alt={inspectedGlad.name}
                          className="w-full h-full object-contain"
                          style={{imageRendering: 'pixelated'}}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#ded095] leading-tight flex items-center gap-1.5 flex-wrap">
                          <span>{inspectedGlad.name}</span>
                          {inspectedGlad.heroType && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#fbbf24] text-[#2A1B19] font-black uppercase">
                              {inspectedGlad.heroType.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#cb9f6b]">
                          {CULTURE_LABELS[inspectedGlad.culture]}
                        </div>
                        <div className="text-[10px] text-[#a4968d]">
                          {inspectedGlad.title} &bull; Lvl {inspectedGlad.level}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCampGladId(null)}
                      className="text-[#a4968d] hover:text-[#ded095] p-0.5">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Core Attributes (STR / DEX / VIT) */}
                  <div className="bg-[#2A1B19] p-2 rounded-lg border border-[#9c8053] flex items-center justify-around text-xs shadow-inner">
                    <div className="text-center" title="Strength: Directly scales melee damage / attack power (~20% variance)">
                      <span className="text-[9px] text-[#a4968d] uppercase font-bold block">STR (ATK)</span>
                      <span className="font-mono font-black text-[#ded095] text-sm">{inspectedGlad.attributes?.str ?? 10}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-[#7f644b]/50" />
                    <div className="text-center" title="Dexterity: Directly scales attack rate, speed & agility (~20% variance)">
                      <span className="text-[9px] text-[#a4968d] uppercase font-bold block">DEX (SPD)</span>
                      <span className="font-mono font-black text-[#88997a] text-sm">{inspectedGlad.attributes?.dex ?? 10}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-[#7f644b]/50" />
                    <div className="text-center" title="Vitality: Directly scales maximum HP pool (~20% variance)">
                      <span className="text-[9px] text-[#a4968d] uppercase font-bold block">VIT (HP)</span>
                      <span className="font-mono font-black text-[#55796f] text-sm">{inspectedGlad.attributes?.vit ?? inspectedGlad.attributes?.con ?? 10}</span>
                    </div>
                  </div>

                  {/* Vitals & Combat Stats */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-[#3f363b] p-2 rounded-lg border border-[#7f644b]/60">
                    <div>
                      <span className="text-[#a4968d]">HP: </span>
                      <span
                        className={
                          inspectedGlad.hp < inspectedGlad.maxHp * 0.5
                            ? 'text-[#9e4a42] font-bold'
                            : 'text-[#88997a] font-bold'
                        }>
                        {Math.round(inspectedGlad.hp)} / {inspectedGlad.maxHp}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#a4968d]">Victories: </span>
                      <span className="text-[#ded095] font-bold">{inspectedGlad.kills}</span>
                    </div>
                    <div>
                      <span className="text-[#a4968d]">Attack: </span>
                      <span className="text-[#ded095] font-bold">{inspectedGlad.attack}</span>
                    </div>
                    <div>
                      <span className="text-[#a4968d]">Speed: </span>
                      <span className="text-[#88997a] font-bold">{inspectedGlad.speed}</span>
                    </div>
                  </div>

                  {/* Interactive Traits Display */}
                  {inspectedGlad.traits && inspectedGlad.traits.length > 0 && (
                    <div className="bg-[#3f363b] p-2 rounded-lg border border-[#7f644b]/60 text-[10px] flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#a4968d] font-bold">Traits:</span>
                      {inspectedGlad.traits.map((t) => (
                        <TraitBadge key={t} trait={t} />
                      ))}
                    </div>
                  )}

                  {/* Sworn Bond info */}
                  {closestBond.ally && (
                    <div className="bg-[#3f363b] p-2 rounded-lg border border-[#7f644b]/60 text-[10px] flex items-center justify-between">
                      <span className="text-[#cb9f6b] flex items-center gap-1">
                        <span>{bondTier.icon}</span>
                        <span>Bond: {closestBond.ally.name.split(' ')[0]}</span>
                      </span>
                      <span className="font-bold" style={{color: bondTier.color}}>
                        {closestBond.score} ({bondTier.title})
                      </span>
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedCampGladId(null);
                        if (inspectedGlad.heroType) {
                          triggerHeroArrival(inspectedGlad);
                        } else {
                          triggerStoryEvent(inspectedGlad.id, true);
                        }
                      }}
                      className="flex-1 bg-[#6d3947] hover:bg-[#9e4a42] text-[#ded095] text-xs font-bold py-1.5 px-2 rounded transition flex items-center justify-center gap-1 min-h-[32px]">
                      <span>📜 Hear Tale</span>
                    </button>

                    <button
                      onClick={() => toggleDeployGladiator(inspectedGlad.id)}
                      className={`flex-1 text-xs font-bold py-1.5 px-2 rounded transition flex items-center justify-center gap-1 min-h-[32px] ${
                        isDeployed
                          ? 'bg-[#9e4a42] hover:bg-[#ba7654] text-[#ded095]'
                          : 'bg-[#55796f] hover:bg-[#88997a] text-[#ded095]'
                      }`}>
                      <span>{isDeployed ? '✓ In Squad' : '+ Deploy'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* CRISP COLLAPSIBLE ARENA COMBAT LOG (Bottom Overlay with Dark Stone Antiquity Borders) */}
        {mode === 'arena' && !judgmentState.active && (
          <div className="absolute bottom-2 left-3 right-3 max-w-2xl mx-auto bg-[#2A1B19]/95 border-2 border-[#8C7A6B] rounded-lg shadow-2xl flex flex-col pointer-events-auto backdrop-blur-md transition-all duration-200">
            {isCombatLogCollapsed ? (
              /* Minimized single-line bar showing latest combat action or icon tab */
              <div
                onClick={() => {
                  setIsCombatLogCollapsed(false);
                  gameAudio.playCrispClick();
                }}
                className="flex items-center justify-between gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-[#3f363b]/70 transition rounded-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCombatLogCollapsed(false);
                    gameAudio.playCrispClick();
                  }}
                  className="bg-[#3f363b] hover:bg-[#574b50] border border-[#8C7A6B] text-[#ded095] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 transition shadow">
                  <span>▲ COMBAT LOG</span>
                  <span className="text-[#a4968d]">[L]</span>
                </button>

                <div className="flex-1 min-w-0 truncate text-[11px]">
                  {combatLogs[0] ? (
                    <span
                      className={`truncate inline-block max-w-full ${
                        combatLogs[0].tone === 'crit'
                          ? 'text-[#fbbf24] font-bold'
                          : combatLogs[0].tone === 'pin'
                            ? 'text-[#ba7654] font-bold'
                            : combatLogs[0].tone === 'player'
                              ? 'text-[#ded095]'
                              : combatLogs[0].tone === 'enemy'
                                ? 'text-[#a4968d]'
                                : 'text-[#ded095]/80 italic'
                      }`}>
                      <span className="text-[10px] text-[#8C7A6B] font-mono mr-1.5">
                        [{combatLogs[0].timeStr}]
                      </span>
                      {combatLogs[0].text}
                    </span>
                  ) : (
                    <span className="text-[#8C7A6B] italic">Awaiting battle action...</span>
                  )}
                </div>

                <span className="text-[10px] text-[#cb9f6b] shrink-0 font-serif hidden sm:inline">
                  Click to Expand
                </span>
              </div>
            ) : (
              /* Expanded Full Scrollable Combat Chronicle */
              <div className="p-2.5 flex flex-col">
                <div className="text-xs font-bold text-[#ded095] flex items-center justify-between pb-1.5 border-b border-[#8C7A6B]/50 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span>📜 Arena Combat Chronicle</span>
                    <span className="text-[10px] text-[#a4968d] hidden sm:inline">
                      (Stamina • Pins • Crits • AI Tactics)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#cb9f6b]">
                      {combatOutcome === 'in_progress' ? 'Real-Time Feed' : 'Skirmish Concluded'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCombatLogCollapsed(true);
                        gameAudio.playCrispClick();
                      }}
                      className="bg-[#3f363b] hover:bg-[#574b50] border border-[#8C7A6B] text-[#ded095] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow">
                      <span>▼ MINIMIZE</span>
                      <span className="text-[#a4968d]">[L]</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-24 overflow-y-auto space-y-1 text-xs pr-1">
                  {combatLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`text-[11px] leading-tight flex items-start gap-1.5 ${
                        log.tone === 'player'
                          ? 'text-[#ded095]'
                          : log.tone === 'crit'
                            ? 'text-[#fbbf24] font-bold'
                            : log.tone === 'pin'
                              ? 'text-[#ba7654] font-bold'
                              : log.tone === 'enemy'
                                ? 'text-[#a4968d]'
                                : 'text-[#ded095]/80 italic'
                      }`}>
                      <span className="text-[10px] text-[#8C7A6B] shrink-0 font-mono">
                        [{log.timeStr}]
                      </span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* POST-BATTLE AFTERMATH SCREEN */}
        {mode === 'arena' && combatOutcome !== 'in_progress' && aftermathData && (
          aftermathData.isVictory ? (
            <VictoryAftermathModal
              aftermathData={aftermathData}
              onReturnToCamp={handleReturnToCamp}
              onProceed={() => {
                const partyGlads = aftermathData.partyMembers.map((pm) => {
                  const original = gladiatorsRef.current.find((g) => g.id === pm.id);
                  return {
                    ...(original || gladiatorsRef.current[0]),
                    id: pm.id,
                    name: pm.name,
                    culture: pm.culture,
                    title: pm.title,
                    level: pm.endLevel,
                    hp: pm.hpRemaining,
                  };
                });
                podiumGladiatorsRef.current = partyGlads;
                setPodiumGladiators(partyGlads);
                podiumTimerRef.current = 0;
                podiumHasIgnitedRef.current = false;
                podiumFlashTimerRef.current = 0;
                setMode('podium');
                setActiveTier(null);
                setCombatOutcome('in_progress');
                setAftermathData(null);
                gameAudio.playVictoryFanfare();
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#090d16]/90 flex flex-col items-center justify-center p-3 md:p-6 z-40 pointer-events-auto overflow-y-auto animate-fadeIn transition-opacity duration-300">
              <div className="relative bg-[#2A1B19] border-4 border-[#8C7A6B] p-5 md:p-7 rounded-xl max-w-xl w-full text-left shadow-[0_12px_0_#1D1312,inset_0_2px_0_#9e4a42] flex flex-col max-h-[92vh] overflow-y-auto">
                <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
                <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

                <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#ba7654] font-bold">
                      Arena Chronicle
                    </span>
                    <h2 className="text-xl md:text-2xl font-black tracking-wide text-[#ba7654]">
                      BITTER DEFEAT IN THE PIT
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#9e4a42] font-bold">Permadeath & Injury</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-bold text-[#ded095] mb-2">
                    📜 Witnessed by the Ludus:
                  </div>
                  <div className="bg-[#3f363b] border border-[#7f644b] rounded-lg p-3 space-y-2">
                    {aftermathData.narratives.map((nar, idx) => (
                      <p key={idx} className="text-xs leading-relaxed text-[#ded095] italic border-l-2 border-[#9e4a42] pl-2.5">
                        "{nar}"
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleReturnToCamp}
                  className="w-full bg-[#574b50] hover:bg-[#817475] text-[#ded095] font-bold py-3 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition shadow min-h-[44px]">
                  <span>🏕️ Return to Camp Courtyard</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* ==================================================================== */}
      {/* PODIUM PROGRESSION SCREEN OVERLAY (MODE === 'PODIUM')                */}
      {/* Strictly returns to camp courtyard on SPACE, A, ESC, or Click        */}
      {/* ==================================================================== */}
      {mode === 'podium' && (() => {
        const podiumStageNumber = Math.min(5, Math.max(1, unlockedTierIndex));
        const podiumOrdinal = ['first', 'second', 'third', 'fourth', 'fifth'][podiumStageNumber - 1] || 'first';
        let podiumCaption = `The ${podiumOrdinal} podium is lit! Light the fifth beacon and you will amuse the emperor himself.`;
        if (unlockedTierIndex >= 5 && !isEmperorDefeated) {
          podiumCaption = "All five podium beacons roar with golden fire! Outraged, Emperor Aurelius descends from his balcony: 'Insolent slaves! Face me in single combat!'";
        } else if (isEmperorDefeated) {
          podiumCaption = "The Emperor has fallen! Slaves and gladiators take up arms across the empire—march on Rome to liberate the eternal city!";
        }

        return (
          <div
            onClick={handleReturnToCamp}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 z-30 select-none">
            {/* Header Podium Banner */}
            <div className="pointer-events-auto max-w-xl mx-auto w-full bg-[#574b50]/95 border-4 border-[#9c8053] rounded-xl p-3 shadow-[0_8px_0_#2d272a,inset_0_2px_0_#ded095] backdrop-blur-sm text-center relative">
              <span className="absolute top-1 left-1 w-2 h-2 bg-[#ded095] border border-black" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ded095] border border-black" />
              <span className="absolute bottom-1 left-1 w-2 h-2 bg-[#ded095] border border-black" />
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-[#ded095] border border-black" />
              <div className="text-[10px] tracking-widest uppercase text-[#cb9f6b] font-bold">
                Imperial Coliseum Monument
              </div>
              <h2 className="text-lg md:text-2xl font-black text-[#ded095] tracking-wide">
                {unlockedTierIndex >= 5
                  ? (!isEmperorDefeated ? '👑 THE EMPEROR DESCENDS IN OUTRAGE!' : '🔥 THE SLAVE REVOLT AWAKENS!')
                  : `STAGE ${podiumStageNumber}: FIVE-TIER COLISEUM ASCENT`}
              </h2>
              <p className="text-xs md:text-sm font-serif italic text-[#ded095] mt-1.5 drop-shadow-md">
                "{podiumCaption}"
              </p>
            </div>

            {/* Bottom Action Buttons: Emperor Duel or March on Rome + Return to Camp */}
            <div className="pointer-events-auto max-w-lg mx-auto w-full flex flex-col sm:flex-row gap-2.5 text-center pb-2 z-20">
              {unlockedTierIndex >= 5 && !isEmperorDefeated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEmperorDuelModalOpen(true);
                  }}
                  className="flex-1 bg-[#6d3947] hover:bg-[#9e4a42] text-[#ded095] font-black py-2.5 px-4 rounded-full text-xs md:text-sm tracking-wider uppercase transition shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_1px_0_#ded095] flex items-center justify-center gap-2 cursor-pointer animate-pulse min-h-[44px]">
                  <span>👑 [1v1 DUEL] CONFRONT EMPEROR AURELIUS ➔</span>
                </button>
              )}

              {isRevoltUnlocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    launchSandboxBattle();
                  }}
                  className="flex-1 bg-[#9e4a42] hover:bg-[#ba7654] text-white font-black py-2.5 px-4 rounded-full text-xs md:text-sm tracking-wider uppercase transition shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_1px_0_#ded095] flex items-center justify-center gap-2 cursor-pointer animate-pulse min-h-[44px]">
                  <span>🔥 MARCH ON ROME (SEIZE THE CITY) ➔</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReturnToCamp();
                }}
                className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-2.5 px-6 rounded-full text-xs md:text-sm tracking-wider uppercase transition shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_1px_0_#ded095] flex items-center justify-center gap-2 mx-auto cursor-pointer min-h-[44px]">
                <span>🏕️ [SPACE] Return to Camp</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* MOBILE CONTROLS BAR (Camp Phase) — hidden until the intro is unmounted */}
      {cinematicState >= 4 && isMobile && mode === 'camp' && storyState.phase === 'inactive' && (
        <div className="w-full bg-[#574b50] border-t-4 border-[#7f644b] p-2 flex justify-around items-center z-10 shrink-0 shadow-[0_-4px_0_#2d272a]">
          <button
            onClick={() => {
              dismissStoryEvent(true);
              setIsUpgradesModalOpen(true);
              setIsBattlesModalOpen(false);
              setIsArmoryModalOpen(false);
              setIsRosterModalOpen(false);
              setIsQuestBoardOpen(false);
              gameAudio.playCrispClick();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#55796f] text-[#ded095] min-w-[44px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#55796f]">
            <span className="text-base">🏛️</span>
            <span className="text-[9px] font-bold">Upgrades</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              gameAudio.playBellRing();
              setIsTrialBellModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#9c8053] text-[#ded095] min-w-[44px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#9c8053]">
            <span className="text-base">🔔</span>
            <span className="text-[9px] font-bold">Bell</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              setIsQuestBoardOpen(true);
              setIsBattlesModalOpen(false);
              setIsArmoryModalOpen(false);
              setIsRosterModalOpen(false);
              setIsBondingModalOpen(false);
              gameAudio.playCrispClick();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#6d3947] text-[#ded095] min-w-[44px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#6d3947]">
            <span className="text-base">📜</span>
            <span className="text-[9px] font-bold">Quests</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              setIsBattlesModalOpen(true);
              setIsArmoryModalOpen(false);
              setIsRosterModalOpen(false);
              setIsQuestBoardOpen(false);
              gameAudio.playCrispClick();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#ba7654] text-[#ded095] min-w-[48px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ba7654]">
            <span className="text-base">⚔️</span>
            <span className="text-[9px] font-bold">Arena</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              const squadGlads = gladiatorsRef.current.filter(
                (g) => selectedGladiatorIds.includes(g.id) && g.hp > 0,
              );
              const gladsToShow =
                squadGlads.length > 0
                  ? squadGlads
                  : gladiatorsRef.current.filter((g) => g.hp > 0).slice(0, 3);
              podiumGladiatorsRef.current = gladsToShow;
              setPodiumGladiators(gladsToShow);
              podiumTimerRef.current = 0.5;
              podiumHasIgnitedRef.current = true;
              podiumFlashTimerRef.current = 0;
              setMode('podium');
              gameAudio.playCrispClick();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#9c8053] text-[#ded095] min-w-[48px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#9c8053]">
            <span className="text-base">🏛️</span>
            <span className="text-[9px] font-bold">Podium</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              if (isArmoryModalOpen) {
                closeArmoryModal();
              } else {
                setArmoryTab('armoria');
                setIsArmoryModalOpen(true);
                setIsBattlesModalOpen(false);
                setIsRosterModalOpen(false);
                setIsQuestBoardOpen(false);
                gameAudio.playCrispClick();
              }
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#88997a] text-[#88997a] min-w-[48px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#88997a]">
            <span className="text-base">🛡️</span>
            <span className="text-[9px] font-bold">Armory</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              setIsRosterModalOpen(true);
              setIsBattlesModalOpen(false);
              setIsArmoryModalOpen(false);
              setIsBondingModalOpen(false);
              setIsQuestBoardOpen(false);
              gameAudio.playCrispClick();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#7f644b] text-[#a4968d] min-w-[48px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#7f644b]">
            <span className="text-base">📜</span>
            <span className="text-[9px] font-bold">Roster</span>
          </button>

          <button
            onClick={() => {
              dismissStoryEvent(true);
              setIsBondingModalOpen(true);
              setIsBattlesModalOpen(false);
              setIsArmoryModalOpen(false);
              setIsRosterModalOpen(false);
              setIsQuestBoardOpen(false);
              gameAudio.playCrispClick();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#3f363b] border-2 border-[#6d3947] text-[#ded095] min-w-[48px] min-h-[48px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#6d3947]">
            <span className="text-base">🤝</span>
            <span className="text-[9px] font-bold">Bonds</span>
          </button>
        </div>
      )}

      {/* --- MODAL: QUEST DISPATCH BOARD (RUMORS & EXPEDITIONS) --- */}
      {isQuestBoardOpen && (
        <MenuOverlay tone="neutral" zIndex={60} onBackdropClick={() => setIsQuestBoardOpen(false)}>
          <div className="relative w-full max-w-2xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[90vh]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
              <div className="flex items-center gap-2.5">
                <Scroll size={22} className="text-[#cb9f6b]" />
                <div>
                  <h3 className="text-xl font-bold text-[#ded095]">
                    LUDUS QUEST DISPATCH BOARD
                  </h3>
                  <span className="text-[11px] text-[#cb9f6b]">
                    Antiquity Expeditions &bull; Branching Intrigue &bull; High Stakes
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsQuestBoardOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            {/* Active Expeditions Section */}
            {activeExpeditions.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-[#ded095] flex items-center gap-1.5 mb-2">
                  <Clock size={14} className="text-[#cb9f6b]" />
                  <span>ACTIVE EXPEDITIONS IN PROGRESS ({activeExpeditions.length}):</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeExpeditions.map((exp) => {
                    const pct = Math.max(
                      0,
                      Math.min(
                        100,
                        ((exp.totalDuration - exp.remainingTime) / exp.totalDuration) * 100,
                      ),
                    );
                    return (
                      <div
                        key={exp.nodeId}
                        className="bg-[#3f363b] border border-[#9c8053] rounded-lg p-2.5 flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 bg-[#2d272a] border border-[#7f644b] rounded overflow-hidden p-0.5">
                          <img
                            src={getNpcPortraitDataUrl(exp.portraitType, 40)}
                            alt={exp.speaker}
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#ded095]">
                              {exp.gladiatorName} on &ldquo;{exp.questTitle}&rdquo;
                            </span>
                            <span className="font-mono text-[#cb9f6b] text-xs font-bold">
                              {Math.ceil(exp.remainingTime)}s remaining
                            </span>
                          </div>
                          <div className="text-[11px] text-[#a4968d] truncate mt-0.5">
                            {exp.actionText} (Success Chance: {exp.calculatedChance}%)
                          </div>
                          <div className="w-full bg-[#574b50] h-2 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="bg-[#ded095] h-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Rumors and Quest Chains */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
              <div className="text-xs font-bold text-[#ded095] flex items-center justify-between pb-1 border-b border-[#7f644b]/60">
                <span>AVAILABLE RUMORS & COMMISSIONS:</span>
                <span className="text-[10px] text-[#a4968d]">
                  Glory Requirement &bull; Multi-Stage Chains
                </span>
              </div>

              {QUEST_CHAINS.map((chain) => {
                const isUnlocked = unlockedChains.includes(chain.id);
                const isDispatched = activeExpeditions.some((exp) => exp.questId === chain.id);

                return (
                  <div
                    key={chain.id}
                    className={`p-3.5 rounded-lg border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isUnlocked
                        ? 'bg-[#3f363b] border-[#7f644b] hover:border-[#9c8053]'
                        : 'bg-[#3f363b]/50 border-[#574b50] opacity-50'
                    }`}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 shrink-0 bg-[#2d272a] border border-[#7f644b] rounded-lg p-0.5 overflow-hidden">
                        <img
                          src={getNpcPortraitDataUrl(chain.portraitType, 48)}
                          alt={chain.speaker}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#ded095]">{chain.title}</span>
                          <span className="text-[10px] text-[#cb9f6b] px-1.5 py-0.5 bg-[#574b50] rounded border border-[#7f644b]">
                            {chain.speaker}
                          </span>
                          <span className="text-[10px] text-[#88997a] font-serif">
                            3-Stage Chain
                          </span>
                        </div>
                        <p className="text-xs text-[#a4968d] mt-1 leading-relaxed">
                          {chain.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => openQuestNode(chain.startNodeId)}
                        disabled={!isUnlocked || isDispatched}
                        className={`px-4 py-2 rounded text-xs font-bold transition min-h-[36px] ${
                          isDispatched
                            ? 'bg-[#574b50] text-[#a4968d] cursor-not-allowed'
                            : isUnlocked
                              ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer shadow'
                              : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                        }`}>
                        {isDispatched ? '⏳ Dispatched' : isUnlocked ? '📜 Audience' : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Champions Roster Summary */}
            <div className="mt-4 pt-3 border-t border-[#7f644b] flex items-center justify-between text-xs text-[#a4968d]">
              <div>
                Roster Status:{' '}
                <strong className="text-[#ded095]">
                  {gladiators.filter((g) => g.status === 'Available' && g.hp > 0).length} Available
                </strong>{' '}
                &bull;{' '}
                <strong className="text-[#cb9f6b]">
                  {gladiators.filter((g) => g.status === 'On Quest').length} On Quest
                </strong>
              </div>
              <button
                onClick={() => setIsQuestBoardOpen(false)}
                className="bg-[#3f363b] hover:bg-[#47505c] border border-[#7f644b] text-[#ded095] px-3 py-1 rounded">
                Close
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: VISUAL NOVEL QUEST INTERFACE (PARCHMENT MODAL) --- */}
      {activeQuestNode && (
        <MenuOverlay tone="neutral" zIndex={65} onBackdropClick={() => setActiveQuestNode(null)}>
          <div className="relative w-full max-w-2xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            {/* Top Title & Parchment Frame Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#7f644b] mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-black text-[#ded095] tracking-wide">
                      {activeQuestNode.title.toUpperCase()}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#3f363b] border border-[#cb9f6b] text-[#cb9f6b] font-bold">
                      STAGE {activeQuestNode.stage} / 3 {activeQuestNode.isTerminal ? '(FINALE)' : ''}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#cb9f6b] font-serif italic">
                    Visual Novel Event Chain &bull; Antiquity Chronicle
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveQuestNode(null)}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            {/* Main Speaker & Dialogue Frame */}
            <div className="bg-[#3f363b] border border-[#7f644b] rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start gap-4 shadow-inner">
              {/* Left: Procedural 32x32 NPC Pixel Portrait */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#2d272a] border-2 border-[#9c8053] rounded-lg p-1 overflow-hidden shadow-lg mx-auto sm:mx-0">
                <img
                  src={getNpcPortraitDataUrl(activeQuestNode.portraitType, 96)}
                  alt={activeQuestNode.speaker}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Right/Center: Speaker & Narrative Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between pb-1 border-b border-[#7f644b]/50 mb-2">
                  <span className="font-bold text-sm text-[#cb9f6b] tracking-wider uppercase">
                    {activeQuestNode.speaker}
                  </span>
                  {activeQuestNode.duration > 0 && (
                    <span className="text-[10px] text-[#88997a] flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      <span>Expedition Duration: {activeQuestNode.duration}s</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#ded095] font-serif leading-relaxed italic">
                  &ldquo;{activeQuestNode.text}&rdquo;
                </p>
              </div>
            </div>

            {/* Gladiator Selection Component (if dispatching is required) */}
            {activeQuestNode.choices.some((c) => c.requiredStat !== 'none') && (
              <div className="mb-4">
                <div className="text-xs text-[#ded095] font-bold mb-2 flex items-center justify-between">
                  <span>DISPATCH CHAMPION FROM ROSTER:</span>
                  <span className="text-[10px] text-[#a4968d]">
                    Stats dynamically determine exact success odds!
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {gladiators
                    .filter((g) => g.status === 'Available' && g.hp > 0)
                    .map((glad) => {
                      const isSelected = selectedQuestGladId === glad.id;
                      return (
                        <button
                          key={glad.id}
                          type="button"
                          onClick={() => {
                            setSelectedQuestGladId(glad.id);
                            gameAudio.playHoverMicroTone();
                          }}
                          className={`p-2 rounded-lg border text-left flex flex-col items-center justify-between transition ${
                            isSelected
                              ? 'bg-[#574b50] border-[#ded095] ring-2 ring-[#ded095] text-[#ded095]'
                              : 'bg-[#3f363b] border-[#7f644b] text-[#a4968d] hover:border-[#cb9f6b]'
                          }`}>
                          <div className="w-10 h-10 bg-[#2d272a] border border-[#7f644b] rounded p-0.5 overflow-hidden mb-1">
                            <img
                              src={getPortraitDataUrl(
                                glad.culture,
                                40,
                                false,
                                undefined,
                                glad.level,
                                glad.hp <= 0,
                                glad.heroType,
                                glad.gladiatorClass,
                              )}
                              alt={glad.name}
                              className="w-full h-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div className="font-bold text-[11px] truncate text-center w-full">
                            {glad.name.split(' ')[0]}
                          </div>
                          <div className="text-[9px] text-[#cb9f6b] text-center">
                            {glad.attack} ATK &bull; {glad.defense} DEF &bull; {glad.speed} SPD
                          </div>
                        </button>
                      );
                    })}
                </div>

                {gladiators.filter((g) => g.status === 'Available' && g.hp > 0).length === 0 && (
                  <div className="p-3 bg-[#3f363b] border border-[#9e4a42] rounded-lg text-center text-xs text-[#9e4a42]">
                    ⚠️ All champions are currently on expeditions, in the arena, or incapacitated!
                  </div>
                )}
              </div>
            )}

            {/* Multiple Choice Action Buttons with Stat Checks */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#ded095] pb-1 border-b border-[#7f644b]/50">
                CHOOSE EXPEDITION DIRECTIVE:
              </div>

              {activeQuestNode.choices.map((choice, idx) => {
                const selectedGlad = gladiators.find((g) => g.id === selectedQuestGladId);
                const hasGlad = !!selectedGlad;
                const requiresGlad = choice.requiredStat !== 'none';

                let calculatedChance = choice.baseChance;
                if (requiresGlad && selectedGlad) {
                  calculatedChance = calculateGladiatorSuccessChance(
                    selectedGlad,
                    choice.requiredStat,
                    choice.baseChance,
                    choice.statWeight,
                  );
                }

                const canChoose = !requiresGlad || (hasGlad && selectedGlad.hp > 0);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!canChoose}
                    onClick={() => dispatchGladiatorOnQuest(activeQuestNode, idx)}
                    className={`w-full p-3 rounded-lg border text-left transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                      canChoose
                        ? 'bg-[#3f363b] hover:bg-[#4a3f45] border-[#7f644b] hover:border-[#ded095] text-[#ded095] cursor-pointer'
                        : 'bg-[#3f363b]/40 border-[#574b50] text-[#817475] cursor-not-allowed'
                    }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {requiresGlad ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              calculatedChance >= 70
                                ? 'bg-[#55796f]/40 text-[#ded095] border-[#55796f]'
                                : calculatedChance >= 50
                                  ? 'bg-[#ba7654]/40 text-[#ded095] border-[#ba7654]'
                                  : 'bg-[#9e4a42]/40 text-[#ba7654] border-[#9e4a42]'
                            }`}>
                            [{choice.requiredStat.toUpperCase()} {calculatedChance}% CHANCE]
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#574b50] border border-[#cb9f6b] text-[#cb9f6b]">
                            [DECISION]
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#ded095]">
                          {choice.text}
                        </span>
                      </div>

                      {/* Rewards & Penalty Preview */}
                      <div className="flex items-center gap-3 text-[10px] text-[#a4968d] flex-wrap">
                        {choice.rewards && (
                          <span className="text-[#88997a]">
                            Reward: {choice.rewards.gold ? `+${choice.rewards.gold} Gold ` : ''}
                            {choice.rewards.heal ? `+Heal ` : ''}
                            {choice.rewards.recruit ? `+New Recruit! ` : ''}
                          </span>
                        )}
                        {choice.penalty && (
                          <span className="text-[#ba7654]">
                            Risk: {choice.penalty.damage ? `-${choice.penalty.damage} HP ` : ''}
                            {choice.penalty.gold ? `${choice.penalty.gold} Gold ` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold px-3 py-1.5 rounded bg-[#9c8053] hover:bg-[#ded095] text-[#3f363b] transition">
                        {activeQuestNode.duration > 0 && requiresGlad ? 'Dispatch ⚔️' : 'Choose ➔'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: VISUAL NOVEL QUEST RESOLUTION MODAL --- */}
      {questResolution && (
        <MenuOverlay tone="neutral" zIndex={70} onBackdropClick={handleReturnToCampFromQuest}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            {/* Header Outcome Ribbon */}
            <div className="flex items-center justify-between pb-3 border-b border-[#7f644b] mb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#cb9f6b]">
                  Expedition Chronicle
                </span>
                <h3
                  className={`text-xl md:text-2xl font-black tracking-wide ${
                    questResolution.isSuccess ? 'text-[#ded095]' : 'text-[#ba7654]'
                  }`}>
                  {questResolution.isSuccess
                    ? '⚔️ EXPEDITION TRIUMPH!'
                    : '💀 EXPEDITION SETBACK!'}
                </h3>
              </div>

              {/* D100 Dice Roll Badge */}
              <div className="text-right">
                <span className="text-[10px] text-[#a4968d] block font-mono">D100 ROLL</span>
                <span
                  className={`text-sm font-black px-2 py-0.5 rounded border ${
                    questResolution.isSuccess
                      ? 'bg-[#55796f]/40 text-[#ded095] border-[#55796f]'
                      : 'bg-[#9e4a42]/40 text-[#ba7654] border-[#9e4a42]'
                  }`}>
                  Rolled {questResolution.roll} (Req &le; {questResolution.chance}%)
                </span>
              </div>
            </div>

            {/* Narrative Speaker & Outcome Description */}
            <div className="bg-[#3f363b] border border-[#7f644b] rounded-xl p-4 mb-4 flex items-start gap-3.5">
              <div className="w-16 h-16 shrink-0 bg-[#2d272a] border border-[#9c8053] rounded-lg p-0.5 overflow-hidden">
                <img
                  src={getNpcPortraitDataUrl(questResolution.node.portraitType, 64)}
                  alt={questResolution.node.speaker}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#cb9f6b] mb-1">
                  {questResolution.node.speaker} &bull; {questResolution.node.title}
                </div>
                <p className="text-xs sm:text-sm text-[#ded095] font-serif italic leading-relaxed">
                  {questResolution.outcomeNode
                    ? `&ldquo;${questResolution.outcomeNode.text}&rdquo;`
                    : questResolution.isSuccess
                      ? `&ldquo;The expedition achieved its objective flawlessly! ${questResolution.glad.name} returns with honor and spoils.&rdquo;`
                      : `&ldquo;Disaster struck during the expedition! ${questResolution.glad.name} was outmatched by the hazards.&rdquo;`}
                </p>
              </div>
            </div>

            {/* Dynamic Consequences Breakdown */}
            <div className="bg-[#2d272a] border border-[#7f644b] rounded-lg p-3 mb-4 space-y-2 text-xs">
              <div className="font-bold text-[#ded095] flex items-center gap-1.5 pb-1 border-b border-[#7f644b]/50">
                <span>CONSEQUENCES TO THE LUDUS:</span>
              </div>

              {questResolution.rewards && (
                <div className="space-y-1 text-[#88997a]">
                  {questResolution.rewards.gold && (
                    <div>
                      🪙 Treasury: +{questResolution.rewards.gold} Gold awarded!
                      {questResolution.outcomeNode?.isTerminal &&
                      questResolution.choice.rewards?.gold &&
                      questResolution.outcomeNode.choices[0]?.rewards?.gold ? (
                        <span>
                          {' '}
                          ({questResolution.choice.rewards.gold} expedition +{' '}
                          {questResolution.outcomeNode.choices[0].rewards.gold} finale)
                        </span>
                      ) : null}
                    </div>
                  )}
                  {questResolution.rewards.heal && (
                    <div>💚 Recovery: Champion healed +{questResolution.rewards.heal} HP!</div>
                  )}
                  {questResolution.rewards.recruit && (
                    <div className="p-2 bg-[#574b50] rounded border border-[#ded095] text-[#ded095] font-bold">
                      ⚔️ UNIQUE RECRUIT UNLOCKED: {questResolution.rewards.recruit.name} (
                      {questResolution.rewards.recruit.title}) joined your stable!
                    </div>
                  )}
                  {questResolution.rewards.unlockChain && (
                    <div>📜 Next Event Chain Unlocked in Quests Board!</div>
                  )}
                </div>
              )}

              {questResolution.penalty && (
                <div className="space-y-1 text-[#ba7654]">
                  {questResolution.penalty.gold && (
                    <div>
                      🪙 Treasury Loss: {questResolution.penalty.gold} Gold lost/fine!
                      {questResolution.outcomeNode?.isTerminal &&
                      questResolution.choice.penalty?.gold &&
                      questResolution.outcomeNode.choices[0]?.penalty?.gold ? (
                        <span>
                          {' '}
                          ({questResolution.choice.penalty.gold} expedition{' '}
                          {questResolution.outcomeNode.choices[0].penalty.gold} finale)
                        </span>
                      ) : null}
                    </div>
                  )}
                  {questResolution.penalty.damage && (
                    <div>
                      🩸 Injuries: {questResolution.glad.name} suffered -{questResolution.penalty.damage} HP
                      persistent damage!
                    </div>
                  )}
                  {questResolution.glad.hp <= 0 && (
                    <div className="p-2 bg-[#9e4a42]/30 rounded border border-[#9e4a42] text-[#ded095] font-bold">
                      💀 PERMADEATH: {questResolution.glad.name} perished on the expedition! A cultural
                      memorial grave has been erected in the camp.
                    </div>
                  )}
                </div>
              )}

              {questResolution.glad.hp > 0 && (
                <div className="text-[11px] text-[#a4968d] pt-1">
                  Status: <strong>{questResolution.glad.name}</strong> is now resting in camp (HP:{' '}
                  {Math.round(questResolution.glad.hp)}/{questResolution.glad.maxHp}).
                </div>
              )}
            </div>

            {/* Stage Progression Banner (Stage II unlocked into random pool) */}
            {questResolution.isSuccess &&
              questResolution.outcomeNode &&
              !questResolution.outcomeNode.isTerminal &&
              questResolution.glad.hp > 0 && (
                <div className="p-3 bg-[#3f363b] border-2 border-[#9c8053] rounded-lg mb-4 text-[#ded095] shadow-md">
                  <div className="font-bold text-xs flex items-center gap-2 text-[#ded095]">
                    <span className="text-base">📜</span>
                    <span>
                      The chronicle advances: Stage {toRoman(questResolution.outcomeNode.stage)} unlocked for {questResolution.glad.name}!
                    </span>
                  </div>
                  <div className="text-[11px] text-[#cb9f6b] mt-1 pl-6 leading-relaxed">
                    This questline is now unlocked and will remain in the pool of random camp quests, so long as {questResolution.glad.name} still lives.
                  </div>
                </div>
              )}

            {/* Resolution Actions: Single Return to Camp button */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleReturnToCampFromQuest}
                className="w-full bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold py-3 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition shadow min-h-[44px] cursor-pointer">
                <span>🏕️ Return to Camp</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: CAMP BANDIT RAID ALARM --- */}
      {isBanditAlarmOpen && (
        <MenuOverlay tone="danger" zIndex={80} onBackdropClick={() => setIsBanditAlarmOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#9e4a42] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] animate-bounce">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center gap-3 pb-3 border-b-2 border-[#9e4a42] mb-3">
              <span className="text-3xl">🚨</span>
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#ba7654]">
                  EMERGENCY RAID INVASION
                </span>
                <h3 className="text-lg md:text-xl font-black text-white font-serif tracking-wide">
                  BANDITS BREACH THE PERIMETER!
                </h3>
              </div>
            </div>

            <div className="bg-[#3f363b] border border-[#9e4a42] rounded-lg p-3 mb-4">
              <p className="text-xs sm:text-sm text-[#ded095] leading-relaxed font-serif italic mb-2">
                "BANDITS BREACH THE PERIMETER! Defend the ludus!"
              </p>
              <p className="text-xs text-[#cb9f6b] leading-relaxed">
                Rogue marauders and cutthroats have bypassed the outer gates and invaded the barracks courtyard! Rally every gladiator to defend your ludus and gold!
              </p>
            </div>

            <button
              type="button"
              onClick={launchCampDefenseBattle}
              className="w-full bg-[#9e4a42] hover:bg-[#ba7654] text-white font-black py-3 px-4 rounded-xl text-sm md:text-base transition shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] flex items-center justify-center gap-2 cursor-pointer animate-pulse">
              <span>⚔️ TO ARMS! DEFEND THE LUDUS COURTYARD ➔</span>
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: TRIAL BELL CONFIRMATION MODAL --- */}
      {isTrialBellModalOpen && (
        <MenuOverlay tone="neutral" zIndex={65} onBackdropClick={() => setIsTrialBellModalOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#7f644b] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">🔔</span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] tracking-wide font-serif">
                    SUMMON THE COLISEUM TRIAL
                  </h3>
                  <span className="text-[11px] text-[#cb9f6b] font-bold">
                    The Bronze Bell tolls across the camp courtyard
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTrialBellModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#ded095] mb-5 leading-relaxed font-serif italic">
              "Dominus, sounding the bronze bell will immediately bypass our respite and summon the Emperor's herald to the camp gates. Shall we call the arena forward?"
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={() => {
                  setIsTrialBellModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="flex-1 bg-[#3f363b] hover:bg-[#47505c] border-2 border-[#7f644b] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-xs md:text-sm transition min-h-[44px] flex items-center justify-center shadow">
                <span>A simple misclick, my lord.</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTrialBellModalOpen(false);
                  heraldTimerRef.current = 30 + Math.random() * 90;
                  courierNpcRef.current = {
                    active: true,
                    x: 170,
                    y: 192,
                    targetX: 45,
                    targetY: 83,
                    state: 'walking',
                    speechTimer: 5.0,
                    speechText: 'A decree from Rome! The Emperor summons your gladiators!',
                    walkTimer: 0,
                    animTimer: 0,
                    flipX: true,
                    hasPlayedHorn: false,
                  };
                  setCourierNpcState({ ...courierNpcRef.current });
                }}
                className="flex-1 bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-2.5 px-4 rounded-lg text-xs md:text-sm transition min-h-[44px] flex items-center justify-center shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer">
                <span>I am ready.</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: EMPEROR 1-ON-1 DUEL CHAMPION SELECTION MODAL --- */}
      {isEmperorDuelModalOpen && (
        <MenuOverlay tone="neutral" zIndex={65} onBackdropClick={() => setIsEmperorDuelModalOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#7f644b] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">👑</span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] tracking-wide font-serif">
                    1-ON-1 DUEL: EMPEROR AURELIUS
                  </h3>
                  <span className="text-[11px] text-[#cb9f6b] font-bold">
                    The Gilded Tyrant descends in outrage to the arena sands!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEmperorDuelModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-[#ded095] mb-3 leading-relaxed font-serif italic">
              "Insolent dogs!" Emperor Aurelius draws his gilded imperial gladius. "Your gladiators made a mockery of my champion. Now face the Caesar alone!"
            </p>

            {/* Emperor Stats Preview Card */}
            <div className="bg-[#3f363b] border-2 border-[#9c8053] rounded-lg p-3 mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 bg-[#2A1B19] rounded-lg border-2 border-[#ded095] overflow-hidden p-0.5 shrink-0">
                  <img
                    src={getPortraitDataUrl('roman', 48, false, undefined, 5, false, 'emperor')}
                    alt="Emperor Aurelius"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#ded095] flex items-center gap-1.5">
                    <span>Emperor Aurelius</span>
                    <span className="text-[10px] text-[#cb9f6b]">Lvl V Boss</span>
                  </div>
                  <div className="text-[10px] text-[#cb9f6b]">
                    Gilded Lorica Squamata &bull; Golden Eagle Parma Shield
                  </div>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="text-[#ded095] font-black block">HP: 520 &bull; ATK: 42</span>
                <span className="text-[#55796f] font-bold text-[10px]">DEF: 25 &bull; SPD: 13</span>
              </div>
            </div>

            {/* Choose 1 Champion to fight 1v1 */}
            <div className="mb-4">
              <div className="text-xs font-bold text-[#ded095] mb-2 flex items-center justify-between">
                <span>SELECT YOUR ULTIMATE CHAMPION (1v1):</span>
                <span className="text-[10px] text-[#cb9f6b]">Single Combat</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {gladiators
                  .filter((g) => g.hp > 0 && g.status === 'Available')
                  .map((glad) => {
                    const livingChampions = gladiators.filter(
                      (g) => g.hp > 0 && g.status === 'Available',
                    );
                    const highlightedId =
                      emperorDuelSelectedGladId &&
                      livingChampions.some((g) => g.id === emperorDuelSelectedGladId)
                        ? emperorDuelSelectedGladId
                        : livingChampions[0]?.id;
                    const isSelected = highlightedId === glad.id;
                    return (
                      <div
                        key={glad.id}
                        onClick={() => {
                          emperorDuelSelectedGladIdRef.current = glad.id;
                          setEmperorDuelSelectedGladId(glad.id);
                          gameAudio.playHoverMicroTone();
                        }}
                        className={`p-2.5 rounded-lg border-2 flex items-center justify-between gap-2.5 cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#3f363b] border-[#ded095] shadow-md'
                            : 'bg-[#2A1B19] border-[#7f644b] hover:border-[#cb9f6b]'
                        }`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 bg-[#2A1B19] rounded border border-[#9c8053] overflow-hidden p-0.5 shrink-0">
                            <img
                              src={getPortraitDataUrl(
                                glad.culture,
                                40,
                                false,
                                undefined,
                                glad.level,
                                false,
                                glad.heroType,
                                glad.gladiatorClass,
                              )}
                              alt={glad.name}
                              className="w-full h-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#ded095] flex items-center gap-1.5">
                              <span>{glad.name}</span>
                              <span className="text-[10px] text-[#cb9f6b]">Lvl {toRoman(glad.level)}</span>
                            </div>
                            <div className="text-[10px] text-[#a4968d]">
                              {glad.attack} ATK &bull; {glad.defense} DEF &bull; {Math.round(glad.hp)}/{glad.maxHp} HP &bull; STR {glad.attributes?.str ?? 10} &bull; DEX {glad.attributes?.dex ?? 10} &bull; VIT {glad.attributes?.vit ?? glad.attributes?.con ?? 10}
                            </div>
                            {glad.traits && glad.traits.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                {glad.traits.map((t) => (
                                  <TraitBadge key={t} trait={t} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className={`text-xs font-black px-2.5 py-1 rounded ${
                          isSelected ? 'bg-[#ded095] text-[#2A1B19]' : 'bg-[#3f363b] text-[#a4968d]'
                        }`}>
                          {isSelected ? '✓ SELECTED' : 'CHOOSE'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={() => {
                  setIsEmperorDuelModalOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-xs transition">
                Withdraw
              </button>

              <button
                type="button"
                onClick={() => {
                  const livingChampions = gladiatorsRef.current.filter(
                    (g) => g.hp > 0 && g.status === 'Available',
                  );
                  const targetId =
                    emperorDuelSelectedGladId &&
                    livingChampions.some((g) => g.id === emperorDuelSelectedGladId)
                      ? emperorDuelSelectedGladId
                      : livingChampions[0]?.id;
                  if (targetId) {
                    emperorDuelSelectedGladIdRef.current = targetId;
                    setEmperorDuelSelectedGladId(targetId);
                    setSelectedGladiatorIds([targetId]);
                    setIsEmperorDuelModalOpen(false);
                    initiatePreBattlePepTalk(EMPEROR_DUEL_TIER, false);
                  }
                }}
                className="flex-1 bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-2.5 px-4 rounded-lg text-xs md:text-sm transition flex items-center justify-center gap-2 shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer">
                <span>⚔️ STAGING ROOM PEP TALK (1v1) ➔</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: REVOLT CELEBRATION STORY POPUP (THE REVOLT TO SEIZE ROME) --- */}
      {isRevoltCelebrationOpen && (
        <MenuOverlay tone="neutral" zIndex={68} onBackdropClick={() => setIsRevoltCelebrationOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#7f644b] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">🔥</span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] tracking-wide font-serif">
                    THE EMPEROR HAS FALLEN!
                  </h3>
                  <span className="text-[11px] text-[#cb9f6b] font-bold">
                    The Slave Revolt to Seize Rome has Awakened!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRevoltCelebrationOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#3f363b] border-2 border-[#9e4a42] rounded-lg p-3.5 mb-4 shadow-inner">
              <p className="text-xs sm:text-sm text-[#ded095] leading-relaxed font-serif italic mb-2">
                "Emperor Aurelius is slain! The tyrant's gilded blade shatters upon the arena sand, and the patricians flee in terror!"
              </p>
              <p className="text-xs text-[#cb9f6b] leading-relaxed">
                Word has reached the underground catacombs: <strong>15 Rebel Slaves</strong> have taken up iron cleavers and joined with your full gladiator ludus. The grand gates of Rome burn—lead the march on Rome to seize the city and forever liberate the empire!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={() => {
                  setIsRevoltCelebrationOpen(false);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-xs transition">
                Inspect Camp First
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRevoltCelebrationOpen(false);
                  launchSandboxBattle();
                }}
                className="flex-1 bg-[#9e4a42] hover:bg-[#ba7654] text-white font-black py-2.5 px-4 rounded-lg text-xs md:text-sm transition flex items-center justify-center gap-2 shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer animate-pulse">
                <span>🔥 MARCH ON ROME (SEIZE THE CITY) ➔</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: BATTLEFIELD SALVAGE LOOT DROP --- */}
      {battlefieldLoot && (
        <MenuOverlay tone="neutral" zIndex={75}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">⚔️</span>
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#cb9f6b]">
                    BATTLEFIELD DROP
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] tracking-wide font-serif">
                    SPOILS OF WAR - BATTLEFIELD SALVAGE
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-lg p-4 mb-4 flex items-start gap-3.5 shadow-inner">
              <span className="text-3xl p-1 bg-[#2A1B19] rounded border border-[#cb9f6b] shrink-0">
                {battlefieldLoot.item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[#ded095] font-serif leading-relaxed">
                  From the fallen enemy <strong className="text-[#cb9f6b]">{battlefieldLoot.enemyName}</strong>, you scavenged:{' '}
                  <strong className="text-[#ded095]">{battlefieldLoot.item.name}</strong> ({formatWeaponStats(battlefieldLoot.item)}). Surviving gladiator{' '}
                  <strong className="text-[#ded095]">{battlefieldLoot.targetGladName}</strong> can wield this weapon.
                </p>
                <div className="text-[11px] text-[#a4968d] italic mt-1.5">
                  &ldquo;{battlefieldLoot.item.description}&rdquo;
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={handleAutoEquipLoot}
                className="flex-1 bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-2.5 px-4 rounded-lg text-xs md:text-sm transition min-h-[44px] flex items-center justify-center gap-2 shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer">
                <span>Auto-Equip to {battlefieldLoot.targetGladName.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                onClick={handleStashLoot}
                className="flex-1 bg-[#3f363b] hover:bg-[#574b50] border-2 border-[#7f644b] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-xs md:text-sm transition min-h-[44px] flex items-center justify-center gap-2 shadow cursor-pointer">
                <span>Stash in Armory</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: SCHEDULED ARENA SUMMONS (HERALD AUTO-CALL) --- */}
      {isHeraldSummonsOpen && (
        <MenuOverlay tone="neutral" zIndex={65}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            {/* Stylized Pixel Header */}
            <div className="pb-3 border-b-2 border-[#7f644b] mb-3 text-center flex items-center justify-center">
              <h3
                style={{
                  color: '#F7DEAA',
                  textShadow: '2px 2px 0px #140d0c, -1px -1px 0px #2A1B19, 0 3px 0 #1D1312',
                  letterSpacing: '0.18em',
                }}
                className="text-lg md:text-2xl font-black font-serif tracking-widest uppercase">
                IMPERIAL ARENA SUMMONS
              </h3>
            </div>

            <p className="text-xs text-[#a4968d] mb-3 leading-relaxed text-center sm:text-left">
              Trumpets echo across the courtyard! The Colosseum crowd demands blood and glory.
              Proceed to mandatory squad deployment and deliver your pre-battle pep talk!
            </p>

            {/* Target Tier Card with Fighter Headshots, Level Badge, Archetype & Stats */}
            {(() => {
              const currentTierIdx = Math.min(4, unlockedTierIndex);
              const currentTier = BATTLE_TIERS[currentTierIdx];
              const isFirst = !firstBattleDone;
              const enemyList = isFirst ? currentTier.enemies.slice(0, 1) : currentTier.enemies;
              const enemyLevel = Math.min(5, currentTierIdx + 1);

              return (
                <div className="bg-[#3f363b] border border-[#9c8053] rounded-lg p-3 mb-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#ded095]">
                      ⚔️ {isFirst ? 'First Arena Bout: 1v1 Pit Skirmish' : currentTier.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#574b50] text-[#ded095] border border-[#ba7654]">
                      {isFirst ? 'Trial Duel' : currentTier.difficulty}
                    </span>
                  </div>

                  {/* Enemy combatant headshots and details */}
                  <div className="bg-[#2A1B19] p-2.5 rounded-lg border border-[#7f644b]/60">
                    <div className="text-[10px] font-bold text-[#cb9f6b] uppercase tracking-wider mb-2">
                      Opponent Combatant{enemyList.length > 1 ? `s (${enemyList.length})` : ''}:
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {enemyList.map((enemy, eIdx) => {
                        const hpVal = isFirst ? Math.max(45, Math.round(enemy.hp * 0.75)) : enemy.hp;
                        return (
                          <div
                            key={eIdx}
                            className="flex items-center gap-2.5 bg-[#3f363b] p-2 rounded-md border border-[#7f644b] flex-1 min-w-[200px]">
                            <div className="w-11 h-11 bg-[#2A1B19] rounded border border-[#9c8053] p-0.5 overflow-hidden shadow-inner shrink-0">
                              <img
                                src={getPortraitDataUrl(
                                  enemy.culture,
                                  44,
                                  false,
                                  undefined,
                                  enemyLevel,
                                  false,
                                  undefined,
                                  enemy.title.includes('Brawler') ? 'Thracian' : enemy.title.includes('Legion') || enemy.title.includes('Centurion') || enemy.title.includes('Equites') ? 'Legionary' : enemy.title.includes('Retiarius') ? 'Retiarius' : enemy.title.includes('Bestiarius') ? 'Bestiarius' : 'Murmillo',
                                )}
                                alt={enemy.name}
                                className="w-full h-full object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-[#ded095] truncate">
                                  {enemy.name}
                                </span>
                                <span className="text-[9px] font-black text-[#ded095] px-1.5 py-0.2 rounded bg-[#2A1B19] border border-[#7f644b] font-serif">
                                  Lvl {toRoman(enemyLevel)}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#cb9f6b] truncate">
                                {enemy.title}
                              </div>
                              <div className="text-[10px] text-[#a4968d] mt-0.5 font-mono">
                                HP: {hpVal} &bull; ATK: {enemy.attack} &bull; DEF: {enemy.defense} &bull; SPD: {enemy.speed}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#7f644b]/50">
                    <span className="text-[#a4968d]">Rewards on Triumph:</span>
                    <span className="font-bold text-[#ded095]">
                      +{currentTier.goldReward} Gold
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Summons Actions: Bribe Herald or Proceed to Mandatory Deployment */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-[#7f644b]">
              {(() => {
                const safeRespiteIdx = Math.max(
                  0,
                  Math.min(RESPITE_COST_SCHEDULE.length - 1, respiteCount || 0),
                );
                const currentRespiteCost = RESPITE_COST_SCHEDULE[safeRespiteIdx] || 200;
                const canAffordRespite = (gameState.gold || 0) >= currentRespiteCost;

                return (
                  <button
                    type="button"
                    disabled={!canAffordRespite}
                    onClick={() => {
                      if (!canAffordRespite) return;
                      economy.debit(currentRespiteCost, {floorAtZero: true});
                      setRespiteCount((prev) => prev + 1);
                      respiteCountRef.current = (respiteCount || 0) + 1;
                      heraldTimerRef.current = 30 * getPodiumCountdownMultiplier(unlockedTierIndexRef.current);
                      setIsHeraldSummonsOpen(false);
                      gameAudio.playCoinPickup();
                      addCombatLog(
                        `📜 Paid ${currentRespiteCost} Gold for an Imperial Respite (+30s).`,
                        'neutral',
                      );
                    }}
                    className={`flex-1 border font-bold py-2.5 px-3 rounded-lg text-xs transition min-h-[40px] flex items-center justify-center gap-1.5 ${
                      canAffordRespite
                        ? 'bg-[#3f363b] hover:bg-[#47505c] border-[#7f644b] text-[#ded095] cursor-pointer shadow'
                        : 'bg-[#2a2428] border-[#574b50] text-[#817475] cursor-not-allowed opacity-60'
                    }`}>
                    <span>
                      {canAffordRespite
                        ? `Bribe the Herald to Delay (${currentRespiteCost}G)`
                        : `Not Enough Gold to Wait (${currentRespiteCost}G)`}
                    </span>
                  </button>
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  const targetTier = BATTLE_TIERS[Math.min(4, unlockedTierIndex)];
                  const currentTierIdx = Math.min(4, unlockedTierIndex);
                  const maxTrialSquadLimit = getMaxSquadSizeForTier(currentTierIdx);

                  // Transition to Mandatory Podium Quest Pre-Battle Deployment Screen
                  setSelectedGladiatorIds((prev) => {
                    const valid = prev.filter((id) =>
                      gladiatorsRef.current.some((g) => g.id === id && g.status === 'Available' && !g.isOnQuest && g.hp > 0),
                    );
                    if (valid.length > maxTrialSquadLimit) return valid.slice(0, maxTrialSquadLimit);
                    if (valid.length === 0) {
                      const first = gladiatorsRef.current.find((g) => g.status === 'Available' && !g.isOnQuest && g.hp > 0);
                      return first ? [first.id] : [];
                    }
                    return valid;
                  });

                  setIsHeraldSummonsOpen(false);
                  setDeploymentTier({
                    ...targetTier,
                    isPodiumTrial: true,
                    hasHeraldBribeOption: true,
                  });
                  gameAudio.playConfirmSelect();
                }}
                className="flex-1 font-bold py-2.5 px-4 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition shadow min-h-[40px] bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095]">
                <span>⚔ PROCEED TO MANDATORY DEPLOYMENT ➔</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: BATTLE SELECTION BOARD (PROCEDURAL ARENA SIDE-SKIRMISHES) --- */}
      {isBattlesModalOpen && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#ded095] flex items-center gap-2 font-serif">
                  <span>⚔️ Arena Side-Skirmish Bounty Board</span>
                </h3>
                <span className="text-[11px] text-[#cb9f6b]">
                  Tier {toRoman(Math.max(1, unlockedTierIndex))} Clearance &bull; Underground Combat Contracts
                </span>
              </div>
              <button
                onClick={() => setIsBattlesModalOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            {/* Bounty Contracts Cards */}
            <div className="space-y-3.5 overflow-y-auto max-h-[75vh] touch-auto pr-1">
              {sideSkirmishes.map((bounty) => {
                const enemyCount = bounty.enemies.length;
                const isFortified = !!bounty.isFortifiedQuest;
                let threatLabel: string = 'EASY';
                let threatClass = 'bg-[#55796f] text-[#ded095] border-[#88997a]';
                if (isFortified) {
                  threatLabel = 'FORTIFIED QUEST';
                  threatClass = 'bg-[#ba7654] text-[#ded095] border-[#fbbf24] shadow-md';
                } else if (bounty.difficulty === 'Challenging') {
                  threatLabel = 'NORMAL';
                  threatClass = 'bg-[#cb9f6b] text-[#3f363b] border-[#ded095]';
                } else if (bounty.difficulty === 'Fierce' || bounty.difficulty === 'Brutal' || bounty.difficulty === 'Legendary') {
                  threatLabel = 'HARD';
                  threatClass = 'bg-[#9e4a42] text-[#ded095] border-[#ba7654]';
                }

                return (
                  <div
                    key={bounty.id}
                    className={`p-4 rounded-xl border-2 transition shadow flex flex-col justify-between gap-3 ${
                      isFortified
                        ? 'border-[#fbbf24] bg-[#3a201c] shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                        : 'border-[#7f644b] bg-[#3f363b] hover:border-[#9c8053]'
                    }`}>
                    {/* Contract Header: Name, Threat Tag, Gold Reward */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="font-serif font-black text-base text-[#ded095] flex items-center gap-2 flex-wrap">
                          <span>{bounty.name}</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border shadow-sm ${threatClass}`}>
                            {threatLabel}
                          </span>
                          {bounty.heroReward && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2A1B19] text-[#fbbf24] border border-[#fbbf24]">
                              REWARD: {bounty.heroReward.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#a4968d] mt-0.5">
                          Squad Limit: Max {enemyCount} Champion{enemyCount > 1 ? 's' : ''} Allowed
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#ded095] px-3 py-1 rounded-lg bg-[#2A1B19] border border-[#9c8053] block shadow">
                          🪙 +{bounty.goldReward} Gold
                        </span>
                      </div>
                    </div>

                    {/* Perilous Expedition Warning for Special Quests */}
                    {isSpecialNarrativeQuest(bounty) && (
                      <div className="bg-[#9e4a42]/30 border border-[#9e4a42] text-[#ded095] px-2.5 py-1.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5 shadow-sm animate-pulse">
                        <span className="text-xs">⚠</span>
                        <span>WARNING: PERILOUS EXPEDITION — DEFEAT IN THIS REALM MEANS CERTAIN DEATH FOR ALL FALLEN WARRIORS.</span>
                      </div>
                    )}

                    {/* Enemy Squad 16-bit blocky headshots with level symbol underneath */}
                    <div className="bg-[#2A1B19] p-2.5 rounded-lg border border-[#7f644b]/60">
                      <div className="text-[10px] font-bold text-[#cb9f6b] uppercase tracking-wider mb-2">
                        Enemy Squad ({enemyCount} Foes):
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {bounty.enemies.map((enemy, eIdx) => {
                          let eLevel = 1;
                          let eLvlStr = 'I';
                          if (enemy.title.includes('Lvl V')) { eLevel = 5; eLvlStr = 'V'; }
                          else if (enemy.title.includes('Lvl IV')) { eLevel = 4; eLvlStr = 'IV'; }
                          else if (enemy.title.includes('Lvl III')) { eLevel = 3; eLvlStr = 'III'; }
                          else if (enemy.title.includes('Lvl II')) { eLevel = 2; eLvlStr = 'II'; }
                          else if (enemy.title.includes('Lvl I')) { eLevel = 1; eLvlStr = 'I'; }

                          return (
                            <div key={eIdx} className="flex flex-col items-center gap-1 bg-[#3f363b] p-1.5 rounded-md border border-[#7f644b]">
                              <div className="w-10 h-10 bg-[#2A1B19] rounded border border-[#9c8053] p-0.5 overflow-hidden shadow-inner">
                                <img
                                  src={getPortraitDataUrl(enemy.culture, 40, false, undefined, eLevel, false)}
                                  alt={enemy.name}
                                  className="w-full h-full object-contain"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-[#ded095] font-serif">
                                Lvl {eLvlStr}
                              </span>
                              <span className="text-[9px] text-[#a4968d] truncate max-w-[65px] text-center">
                                {enemy.name.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button: DEPLOY FIGHTERS */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBattlesModalOpen(false);
                          // Auto-slice selected squad to strictly obey enemy team size cap
                          setSelectedGladiatorIds((prev) => {
                            const valid = prev.filter((id) =>
                              gladiatorsRef.current.some((g) => g.id === id && g.hp > 0 && g.status === 'Available'),
                            );
                            if (valid.length > bounty.enemies.length) {
                              return valid.slice(0, bounty.enemies.length);
                            }
                            if (valid.length === 0) {
                              const firstAvail = gladiatorsRef.current.find((g) => g.hp > 0 && g.status === 'Available');
                              return firstAvail ? [firstAvail.id] : [];
                            }
                            return valid;
                          });
                          setDeploymentTier(bounty);
                          gameAudio.playConfirmSelect();
                        }}
                        className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-2 px-5 rounded-lg text-xs md:text-sm transition flex items-center gap-2 shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer min-h-[38px]">
                        <span>DEPLOY FIGHTERS ➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- DEDICATED PRE-BATTLE TACTICAL DEPLOYMENT MODAL (ARENA SIDE-QUEST & MANDATORY PODIUM) --- */}
      {deploymentTier && (() => {
        const isPodiumMandatory = !!deploymentTier.isPodiumTrial;
        const currentTierIdx = Math.min(4, unlockedTierIndex);
        const enemyCap = isPodiumMandatory
          ? getMaxSquadSizeForTier(currentTierIdx)
          : deploymentTier.enemies.length;
        const allLivingGlads = gladiators.filter((g) => g.hp > 0);
        const selectedCount = selectedGladiatorIds.filter((id) =>
          allLivingGlads.some((g) => g.id === id && g.status === 'Available' && !g.isOnQuest),
        ).length;

        let threatLabel: string = 'EASY';
        let threatClass = 'bg-[#55796f] text-[#ded095] border-[#88997a]';
        if (isPodiumMandatory) {
          threatLabel = 'MANDATORY IMPERIAL TRIAL';
          threatClass = 'bg-[#ba7654] text-[#3f363b] border-[#ded095] font-black';
        } else if (deploymentTier.difficulty === 'Challenging') {
          threatLabel = 'NORMAL';
          threatClass = 'bg-[#cb9f6b] text-[#3f363b] border-[#ded095]';
        } else if (
          deploymentTier.difficulty === 'Fierce' ||
          deploymentTier.difficulty === 'Brutal' ||
          deploymentTier.difficulty === 'Legendary'
        ) {
          threatLabel = 'HARD';
          threatClass = 'bg-[#9e4a42] text-[#ded095] border-[#ba7654]';
        }

        const safeRespiteIdx = Math.max(
          0,
          Math.min(RESPITE_COST_SCHEDULE.length - 1, respiteCount || 0),
        );
        const currentRespiteCost = RESPITE_COST_SCHEDULE[safeRespiteIdx] || 200;
        const canAffordRespite = (gameState.gold || 0) >= currentRespiteCost;

        return (
          <MenuOverlay
            tone="neutral"
            zIndex={60}
            onBackdropClick={() => {
              if (!isPodiumMandatory) {
                setDeploymentTier(null);
              }
            }}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
              <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#cb9f6b] block">
                    {isPodiumMandatory
                      ? 'MANDATORY IMPERIAL SUMMONS • COLISEUM PODIUM TRIAL'
                      : 'PRE-BATTLE TACTICAL DEPLOYMENT'}
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] font-serif flex items-center gap-2">
                    <span>{deploymentTier.name}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${threatClass}`}>
                      {threatLabel}
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#ded095] px-2.5 py-1 rounded bg-[#3f363b] border border-[#9c8053]">
                    🪙 +{deploymentTier.goldReward}G Reward
                  </span>
                  {!isPodiumMandatory && (
                    <button
                      onClick={() => setDeploymentTier(null)}
                      className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Perilous Expedition Warning Banner */}
              {isSpecialNarrativeQuest(deploymentTier) && (
                <div className="bg-[#9e4a42]/40 border-2 border-[#9e4a42] text-[#ded095] p-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 mb-3 shadow-[0_0_15px_rgba(158,74,66,0.6)] animate-pulse">
                  <span className="text-base">⚠</span>
                  <span>WARNING: PERILOUS EXPEDITION — DEFEAT IN THIS REALM MEANS CERTAIN DEATH FOR ALL FALLEN WARRIORS.</span>
                </div>
              )}

              {/* Enemy Squad Reference Strip with Headshots & Stats */}
              <div className="bg-[#3f363b] border border-[#7f644b] rounded-lg p-2.5 mb-3 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#cb9f6b]">Enemy Opponents ({deploymentTier.enemies.length}):</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {deploymentTier.enemies.map((e, idx) => {
                      let eLvl = 1;
                      if (e.title.includes('Lvl V')) eLvl = 5;
                      else if (e.title.includes('Lvl IV')) eLvl = 4;
                      else if (e.title.includes('Lvl III')) eLvl = 3;
                      else if (e.title.includes('Lvl II')) eLvl = 2;
                      else eLvl = Math.min(5, currentTierIdx + 1);

                      return (
                        <div key={idx} className="w-8 h-8 bg-[#2A1B19] rounded border border-[#7f644b] overflow-hidden p-0.5" title={`${e.name} (${e.title})`}>
                          <img
                            src={getPortraitDataUrl(e.culture, 32, false, undefined, eLvl, false)}
                            alt={e.name}
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs font-bold text-[#ded095]">
                  Deployed: <strong className={selectedCount > enemyCap ? 'text-[#9e4a42]' : 'text-[#88997a]'}>{selectedCount}</strong> / {enemyCap} Cap
                </div>
              </div>

              {/* Roster Gladiator Deployment & Tactical AI & Weapon Adjustment */}
              <div className="space-y-3 overflow-y-auto max-h-80 pr-1 mb-4">
                {allLivingGlads.map((glad) => {
                  const isOnQuest = glad.status === 'On Quest' || glad.isOnQuest === true;
                  const isSelected = !isOnQuest && selectedGladiatorIds.includes(glad.id);
                  const canSelectMore = !isOnQuest && (selectedCount < enemyCap || isSelected);

                  return (
                    <div
                      key={glad.id}
                      className={`p-3 rounded-xl border-2 transition flex flex-col gap-2.5 shadow ${
                        isOnQuest
                          ? 'bg-[#211816]/60 border-[#574b50] opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#3f363b] border-[#ded095]'
                            : 'bg-[#2A1B19] border-[#7f644b]/70 opacity-80'
                      }`}>
                      {/* Top Bar: Checkbox/Toggle, Name, Level, Stats */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            disabled={isOnQuest || (!isSelected && !canSelectMore)}
                            onClick={() => toggleDeployGladiator(glad.id, enemyCap)}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs border transition ${
                              isOnQuest
                                ? 'bg-[#2A1B19] text-[#574b50] border-[#574b50] cursor-not-allowed'
                                : isSelected
                                  ? 'bg-[#ba7654] text-[#3f363b] border-[#ded095] cursor-pointer'
                                  : canSelectMore
                                    ? 'bg-[#3f363b] text-[#ded095] border-[#7f644b] hover:border-[#ded095] cursor-pointer'
                                    : 'bg-[#2A1B19] text-[#574b50] border-[#574b50] cursor-not-allowed'
                            }`}>
                            {isSelected ? '✓' : ''}
                          </button>

                          <div className="w-10 h-10 bg-[#2A1B19] rounded border border-[#7f644b] overflow-hidden p-0.5 shrink-0">
                            <img
                              src={getPortraitDataUrl(
                                glad.culture,
                                40,
                                false,
                                undefined,
                                glad.level,
                                false,
                                glad.heroType,
                                glad.gladiatorClass,
                              )}
                              alt={glad.name}
                              className="w-full h-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>

                          <div>
                            <div className="font-bold text-sm text-[#ded095] flex items-center gap-1.5 flex-wrap">
                              <span>{glad.name}</span>
                              <span className="text-[10px] text-[#cb9f6b]">Lvl {toRoman(glad.level)}</span>
                              {isOnQuest && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9e4a42] text-white font-black uppercase tracking-wider">
                                  [ON QUEST - UNAVAILABLE]
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#a4968d]">
                              {CULTURE_LABELS[glad.culture]}
                            </div>
                          </div>
                        </div>

                        {/* Combat Stats & Core Attributes */}
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="text-[#ded095] font-bold bg-[#2A1B19] px-2 py-0.5 rounded border border-[#7f644b] font-mono">
                            STR {glad.attributes?.str ?? 10} ({glad.attack} ATK)
                          </span>
                          <span className="text-[#88997a] font-bold bg-[#2A1B19] px-2 py-0.5 rounded border border-[#7f644b] font-mono">
                            DEX {glad.attributes?.dex ?? 10} ({glad.speed} SPD)
                          </span>
                          <span className="text-[#55796f] font-bold bg-[#2A1B19] px-2 py-0.5 rounded border border-[#7f644b] font-mono">
                            VIT {glad.attributes?.vit ?? glad.attributes?.con ?? 10}
                          </span>
                          <span className="text-[#a4968d] bg-[#2A1B19] px-2 py-0.5 rounded border border-[#7f644b] font-mono">
                            ❤️ {Math.round(glad.hp)}/{glad.maxHp} HP
                          </span>
                        </div>
                      </div>

                      {/* Interactive Traits Display */}
                      {glad.traits && glad.traits.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="text-[#a4968d] font-bold">Traits:</span>
                          {glad.traits.map((t) => (
                            <TraitBadge key={t} trait={t} />
                          ))}
                        </div>
                      )}

                      {/* Tactical Controls (Disabled if on quest) */}
                      {!isOnQuest && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#7f644b]/50 text-xs">
                          {/* 1. Tactical AI Stance */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#cb9f6b] font-bold uppercase tracking-wider">
                              Tactical AI Stance:
                            </span>
                            <select
                              value={glad.tactics}
                              onChange={(e) => setGladiatorTactics(glad.id, e.target.value as CombatTactics)}
                              className="bg-[#2A1B19] text-[#ded095] border border-[#7f644b] rounded px-2 py-1 text-xs font-semibold">
                              <option value="defensive">🛡️ Defensive / Turtle</option>
                              <option value="aggressive">⚔️ Aggressive / Berserk</option>
                              <option value="ranged">🏹 Target Ranged / Flanker</option>
                            </select>
                          </div>

                          {/* 2. [Right Hand] Weapon Selector */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#cb9f6b] font-bold uppercase tracking-wider">
                              [Right Hand] Weapon:
                            </span>
                            <select
                              value={glad.equipped.rightHand || ''}
                              onChange={(e) => {
                                const newWId = e.target.value || null;
                                const oldWId = glad.equipped.rightHand;
                                const oldLId = glad.equipped.leftHand;
                                const isBoth = newWId && WEAPON_DATABASE[newWId]?.slotType === 'BOTH';

                                setPlayerInventory((prev) => {
                                  const nextInv = [...prev];
                                  if (oldWId) nextInv.push(oldWId);
                                  if (isBoth && oldLId && oldLId !== oldWId) nextInv.push(oldLId);
                                  if (newWId) {
                                    const idx = nextInv.indexOf(newWId);
                                    if (idx !== -1) nextInv.splice(idx, 1);
                                  }
                                  return nextInv;
                                });

                                const nextGlads = gladiatorsRef.current.map((g) => {
                                  if (g.id !== glad.id) return g;
                                  return recalculateGladiatorStats({
                                    ...g,
                                    equipped: isBoth
                                      ? { rightHand: newWId, leftHand: newWId }
                                      : { rightHand: newWId, leftHand: g.equipped.leftHand },
                                    justEquipped: true,
                                  });
                                });
                                roster.set(nextGlads);
                                gameAudio.playCrispClick();
                              }}
                              className="bg-[#2A1B19] text-[#ded095] border border-[#7f644b] rounded px-2 py-1 text-xs">
                              <option value="">(Bare Hands / Default)</option>
                              {glad.equipped.rightHand && (
                                <option value={glad.equipped.rightHand}>
                                  Current: {WEAPON_DATABASE[glad.equipped.rightHand]?.name || glad.equipped.rightHand}
                                </option>
                              )}
                              {Array.from(new Set(playerInventory.filter((id) => {
                                const w = WEAPON_DATABASE[id];
                                return w && (w.slotType === 'RIGHT' || w.slotType === 'BOTH');
                              }))).map((wId) => (
                                <option key={wId} value={wId}>
                                  + {WEAPON_DATABASE[wId]?.name} (+{WEAPON_DATABASE[wId]?.atkBonus} ATK)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 3. [Left Hand] Shield Selector */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#55796f] font-bold uppercase tracking-wider">
                              [Left Hand] Shield / Net:
                            </span>
                            <select
                              value={glad.equipped.leftHand || ''}
                              disabled={glad.equipped.rightHand && WEAPON_DATABASE[glad.equipped.rightHand]?.slotType === 'BOTH'}
                              onChange={(e) => {
                                const newWId = e.target.value || null;
                                const oldLId = glad.equipped.leftHand;

                                setPlayerInventory((prev) => {
                                  const nextInv = [...prev];
                                  if (oldLId) nextInv.push(oldLId);
                                  if (newWId) {
                                    const idx = nextInv.indexOf(newWId);
                                    if (idx !== -1) nextInv.splice(idx, 1);
                                  }
                                  return nextInv;
                                });

                                const nextGlads = gladiatorsRef.current.map((g) => {
                                  if (g.id !== glad.id) return g;
                                  return recalculateGladiatorStats({
                                    ...g,
                                    equipped: { rightHand: g.equipped.rightHand, leftHand: newWId },
                                    justEquipped: true,
                                  });
                                });
                                roster.set(nextGlads);
                                gameAudio.playCrispClick();
                              }}
                              className="bg-[#2A1B19] text-[#ded095] border border-[#7f644b] rounded px-2 py-1 text-xs">
                              <option value="">(Default Buckler / Bare)</option>
                              {glad.equipped.leftHand && (
                                <option value={glad.equipped.leftHand}>
                                  Current: {WEAPON_DATABASE[glad.equipped.leftHand]?.name || glad.equipped.leftHand}
                                </option>
                              )}
                              {Array.from(new Set(playerInventory.filter((id) => {
                                const w = WEAPON_DATABASE[id];
                                return w && w.slotType === 'LEFT';
                              }))).map((wId) => (
                                <option key={wId} value={wId}>
                                  + {WEAPON_DATABASE[wId]?.name} (+{WEAPON_DATABASE[wId]?.defBonus} DEF)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Buttons: Cancel (only if NOT mandatory), Bribe (if transitioning from Herald), Staging Room Pep Talk */}
              <div className="flex items-center justify-between pt-3 border-t border-[#7f644b] flex-wrap gap-2">
                {!isPodiumMandatory ? (
                  <button
                    type="button"
                    onClick={() => setDeploymentTier(null)}
                    className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-xs transition">
                    Cancel
                  </button>
                ) : deploymentTier.hasHeraldBribeOption ? (
                  <button
                    type="button"
                    disabled={!canAffordRespite}
                    onClick={() => {
                      if (!canAffordRespite) return;
                      economy.debit(currentRespiteCost, {floorAtZero: true});
                      setRespiteCount((prev) => prev + 1);
                      respiteCountRef.current = (respiteCount || 0) + 1;
                      heraldTimerRef.current = 30 * getPodiumCountdownMultiplier(unlockedTierIndexRef.current);
                      setDeploymentTier(null);
                      gameAudio.playCoinPickup();
                      addCombatLog(
                        `📜 Bribed the Imperial Herald to delay mandatory summons (+30s) for ${currentRespiteCost} Gold!`,
                        'neutral',
                      );
                    }}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      canAffordRespite
                        ? 'bg-[#3f363b] hover:bg-[#47505c] border border-[#ded095] text-[#ded095] cursor-pointer shadow'
                        : 'bg-[#2a2428] border border-[#574b50] text-[#817475] cursor-not-allowed opacity-60'
                    }`}>
                    <span>Bribe Herald to Delay ({currentRespiteCost}G)</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#ba7654] font-bold uppercase tracking-wider">
                    Imperial Mandate: Summons Cannot Be Cancelled
                  </span>
                )}

                <button
                  type="button"
                  disabled={selectedCount === 0 || selectedCount > enemyCap}
                  onClick={() => {
                    const targetTier = deploymentTier;
                    setDeploymentTier(null);
                    initiatePreBattlePepTalk(targetTier, isPodiumMandatory);
                  }}
                  className={`py-3 px-6 rounded-xl font-black text-sm md:text-base tracking-wide flex items-center justify-center gap-2 transition shadow min-h-[46px] ${
                    selectedCount > 0 && selectedCount <= enemyCap
                      ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer'
                      : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                  }`}>
                  <span>STAGING ROOM PEP TALK ⚔️ ({selectedCount} vs {enemyCap}) ➔</span>
                </button>
              </div>
            </div>
          </MenuOverlay>
        );
      })()}

      {/* --- MODAL: DUAL-TABBED ARMORY & INVENTORY SYSTEM (FULL-SCREEN STONE PALETTE) --- */}
      {isArmoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/75 text-[#ded095] select-none p-2 sm:p-5 overflow-hidden"
          onClick={closeArmoryModal}>
          {/* Outer Antiquity Stone Chamber Frame */}
          <div
            className="relative flex flex-col w-full h-full max-w-6xl mx-auto bg-[#2A1B19] border-4 border-[#9c8053] shadow-[0_0_40px_rgba(0,0,0,0.95),inset_0_0_16px_rgba(0,0,0,0.85)] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Pixel Corner Rivets */}
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black z-20 pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black z-20 pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black z-20 pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black z-20 pointer-events-none" />

            {/* Top Navigation & Status Bar */}
            <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#7f644b] bg-[#3f363b]/90 shrink-0 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-[#cb9f6b] font-bold block">
                    ARMAMENTARIUM IMPERIALIS
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#ded095] tracking-wide font-serif">
                    ARMORY &amp; INVENTORY
                  </h2>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setArmoryTab('armoria');
                    setActiveEquipSelector(null);
                    gameAudio.playCrispClick();
                  }}
                  className={`px-3.5 sm:px-5 py-2 rounded-t-lg font-black text-xs sm:text-sm tracking-wider uppercase transition border-t-2 border-x-2 min-h-[38px] cursor-pointer ${
                    armoryTab === 'armoria'
                      ? 'bg-[#ded095] text-[#2A1B19] border-[#ded095] shadow-lg'
                      : 'bg-[#2A1B19] text-[#a4968d] hover:text-[#ded095] border-[#7f644b]'
                  }`}>
                  <span>⚔️ ARMORIA (THE SHOP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setArmoryTab('inventory');
                    setActiveEquipSelector(null);
                    gameAudio.playCrispClick();
                  }}
                  className={`px-3.5 sm:px-5 py-2 rounded-t-lg font-black text-xs sm:text-sm tracking-wider uppercase transition border-t-2 border-x-2 min-h-[38px] cursor-pointer ${
                    armoryTab === 'inventory'
                      ? 'bg-[#ded095] text-[#2A1B19] border-[#ded095] shadow-lg'
                      : 'bg-[#2A1B19] text-[#a4968d] hover:text-[#ded095] border-[#7f644b]'
                  }`}>
                  <span>🎒 INVENTORY ({playerInventory.length} IN STORAGE)</span>
                </button>

                {/* Traveling Nomad Merchant Caravan Bazaar Tab */}
                {(merchantState.active || armoryTab === 'bazaar') && (
                  <button
                    type="button"
                    onClick={() => {
                      setArmoryTab('bazaar');
                      setActiveEquipSelector(null);
                      gameAudio.playPowerupChime();
                    }}
                    className={`px-3.5 sm:px-5 py-2 rounded-t-lg font-black text-xs sm:text-sm tracking-wider uppercase transition border-t-2 border-x-2 min-h-[38px] cursor-pointer animate-pulse ${
                      armoryTab === 'bazaar'
                        ? 'bg-[#fbbf24] text-[#2A1B19] border-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                        : 'bg-[#572b22] text-[#fbbf24] hover:text-white border-[#9c8053]'
                    }`}>
                    <span>🐪 CARAVAN BAZAAR (EXOTIC WARES)</span>
                  </button>
                )}
              </div>

              {/* Gold Counter Display */}
              <div className="flex items-center gap-3">
                <div className="bg-[#2A1B19] px-3 py-1 rounded border-2 border-[#9c8053] flex items-center gap-1.5 shadow-inner">
                  <span className="text-[#ded095] font-bold text-xs">🪙 GOLD:</span>
                  <span className="text-sm font-extrabold text-[#ded095] font-mono">{displayedGold}</span>
                </div>
              </div>
            </div>

            {/* Main Chamber Body: Left Inventory & Character Panel + Right Tab Content */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-[#2A1B19]/95 text-[#ded095]">
              {/* LEFT-HAND INVENTORY & CHARACTER PANEL */}
              <aside className="w-full md:w-80 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-[#7f644b] p-3 sm:p-4 bg-[#211614] flex flex-col justify-between overflow-y-auto">
                <div className="space-y-3">
                  {/* Storage Status */}
                  <div className="bg-[#2A1B19] border-2 border-[#7f644b] rounded-lg p-2.5 shadow-inner">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#7f644b]/50 mb-2">
                      <span className="text-xs font-bold text-[#ded095] flex items-center gap-1.5">
                        <span>🎒 STORAGE INVENTORY</span>
                      </span>
                      <span className="text-[10px] text-[#cb9f6b] font-bold">
                        {playerInventory.length} Items
                      </span>
                    </div>

                    {playerInventory.length === 0 ? (
                      <p className="text-[11px] text-[#a4968d] italic leading-tight">
                        No unequipped armaments. Visit <strong>ARMORIA</strong> or the <strong>CARAVAN BAZAAR</strong> to purchase weapons!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-0.5">
                        {(() => {
                          const counts: Record<string, number> = {};
                          playerInventory.forEach((id) => {
                            counts[id] = (counts[id] || 0) + 1;
                          });
                          return Object.entries(counts).map(([wId, count]) => {
                            const item = WEAPON_DATABASE[wId];
                            if (!item) return null;
                            return (
                              <span
                                key={wId}
                                className="px-1.5 py-0.5 rounded bg-[#3f363b] border border-[#9c8053] text-[10px] font-bold text-[#ded095] flex items-center gap-1 shadow-sm">
                                <span>{item.icon}</span>
                                <span className="truncate max-w-[80px]">{item.name}</span>
                                <span className="text-[#cb9f6b]">x{count}</span>
                              </span>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Quick Champions Roster Summary */}
                  <div className="bg-[#2A1B19] border-2 border-[#7f644b] rounded-lg p-2.5 shadow-inner">
                    <div className="flex items-center justify-between pb-1 border-b border-[#7f644b]/50 mb-1.5">
                      <span className="text-xs font-bold text-[#ded095]">
                        CHAMPIONS ({gladiators.filter((g) => g.hp > 0).length})
                      </span>
                      <span className="text-[10px] text-[#a4968d]">Gear Status</span>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
                      {gladiators
                        .filter((g) => g.hp > 0)
                        .map((glad) => {
                          const rItem = glad.equipped.rightHand ? WEAPON_DATABASE[glad.equipped.rightHand] : null;
                          const lItem = glad.equipped.leftHand ? WEAPON_DATABASE[glad.equipped.leftHand] : null;
                          const isTwoHand = rItem?.slotType === 'BOTH' || lItem?.slotType === 'BOTH';

                          return (
                            <div
                              key={glad.id}
                              onClick={() => {
                                setArmoryTab('inventory');
                                gameAudio.playCrispClick();
                              }}
                              className="p-1.5 rounded bg-[#3f363b] hover:bg-[#574b50] border border-[#7f644b]/60 flex items-center justify-between text-[11px] cursor-pointer transition">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-6 h-6 shrink-0 bg-[#2A1B19] rounded border border-[#7f644b] overflow-hidden p-0.5">
                                  <img
                                    src={getPortraitDataUrl(
                                      glad.culture,
                                      24,
                                      false,
                                      undefined,
                                      glad.level,
                                      false,
                                      glad.heroType,
                                      glad.gladiatorClass,
                                    )}
                                    alt={glad.name}
                                    className="w-full h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <span className="font-bold text-[#ded095] truncate">
                                  {glad.name.split(' ')[0]}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#cb9f6b] shrink-0 flex items-center gap-1">
                                {isTwoHand ? (
                                  <span>🥢 {rItem?.name || lItem?.name}</span>
                                ) : (
                                  <>
                                    <span>{rItem ? rItem.icon : '🗡️'}</span>
                                    <span>{lItem ? lItem.icon : '🛡️'}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {merchantState.active && (
                    <div className="bg-[#48201b] border-2 border-[#fbbf24] rounded-lg p-2 text-xs text-[#ded095] flex items-center justify-between shadow">
                      <span className="font-bold flex items-center gap-1">
                        <span>🐪</span>
                        <span>Nomad in Camp!</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setArmoryTab('bazaar');
                          gameAudio.playPowerupChime();
                        }}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#fbbf24] text-[#2A1B19] hover:bg-white transition cursor-pointer">
                        Trade
                      </button>
                    </div>
                  )}
                </div>

                {/* BRIGHT GILDED BRONZE / WARM CREAM PARCHMENT RETURN TO CAMP BUTTON UNDERNEATH LEFT PANEL */}
                <div className="pt-3 border-t-2 border-[#7f644b]/80 mt-3">
                  <button
                    type="button"
                    onClick={closeArmoryModal}
                    title="Return to Camp Courtyard [ESC]"
                    className="w-full py-3 px-4 rounded-xl font-black text-sm tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#ded095] via-[#fff5d0] to-[#ded095] hover:from-[#ffffff] hover:via-[#fff8db] hover:to-[#ded095] text-[#2A1B19] border-2 border-[#cb9f6b] shadow-[0_0_20px_rgba(222,208,149,0.7),inset_0_2px_0_#ffffff] hover:shadow-[0_0_32px_rgba(255,248,219,1)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[46px]">
                    <ArrowLeft size={18} className="text-[#2A1B19] stroke-[2.5]" />
                    <span className="drop-shadow-sm font-serif">Return to Camp (ESC)</span>
                  </button>
                </div>
              </aside>

              {/* RIGHT-HAND CONTENT AREA (ARMORIA SHOP / INVENTORY GEAR / CARAVAN BAZAAR) */}
              <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#2A1B19]/95 text-[#ded095]">
              {/* TAB 1: ARMORIA (THE SHOP) */}
              {armoryTab === 'armoria' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="bg-[#3f363b]/70 border border-[#7f644b] rounded-lg p-3 text-xs text-[#a4968d] flex items-center justify-between flex-wrap gap-2">
                    <div>
                      ⚔️ <strong>Imperial Blacksmith &amp; Armory:</strong> Purchase weapons and shields categorized by tier and hand requirements. Purchased armaments are placed directly into your unequipped <strong>Inventory</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => setArmoryTab('inventory')}
                      className="text-[#ded095] hover:underline font-bold text-xs">
                      Equip on Gladiators ➔
                    </button>
                  </div>

                  {/* 3 Tiers of Weapons (Standard Armory Only - Exotic wares are strictly exclusive to Caravan Bazaar) */}
                  {[
                    { tierNum: 1, title: 'TIER I: NOVICE MUNITIONS (Pit Skirmish Armaments)', desc: 'Standard battlefield steel and nimble bucklers forged for fresh recruits.' },
                    { tierNum: 2, title: 'TIER II: VETERAN STEEL (Arena Veteran Blades & Bulwarks)', desc: 'Disciplined legionary shields, hooking curved blades, and devastating cleavers.' },
                    { tierNum: 3, title: 'TIER III: MASTERWORK ARTIFACTS (Imperial Coliseum Masterworks)', desc: 'Exquisite tridents, weighted retiarius nets, and legendary two-handed greatblades.' },
                  ].map((tierGroup) => {
                    const tierWeapons = Object.values(WEAPON_DATABASE).filter(
                      (w) => w.tier === tierGroup.tierNum && !w.isExotic,
                    );

                    return (
                      <div key={tierGroup.tierNum} className="space-y-3">
                        <div className="border-b-2 border-[#7f644b] pb-1 flex items-center justify-between flex-wrap gap-1">
                          <h3 className="font-serif font-black text-sm sm:text-base text-[#cb9f6b] tracking-wider uppercase">
                            {tierGroup.title}
                          </h3>
                          <span className="text-[11px] text-[#a4968d] italic">{tierGroup.desc}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {tierWeapons.map((weapon) => {
                            const canAfford = gameState.gold >= weapon.cost;
                            const countInStorage = playerInventory.filter((id) => id === weapon.id).length;
                            const countEquipped = gladiators.filter(
                              (g) => g.equipped.rightHand === weapon.id || g.equipped.leftHand === weapon.id,
                            ).length;

                            return (
                              <div
                                key={weapon.id}
                                className="bg-[#3f363b] border-2 border-[#7f644b] hover:border-[#9c8053] rounded-lg p-3.5 flex flex-col justify-between gap-2.5 transition shadow-lg relative group">
                                <div>
                                  {/* Header with Icon, Name & Slot Requirement */}
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl p-1 bg-[#2A1B19] rounded border border-[#7f644b]">
                                        {weapon.icon}
                                      </span>
                                      <div>
                                        <h4 className="font-bold text-sm text-[#ded095] group-hover:text-white transition">
                                          {weapon.name}
                                        </h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border bg-[#2A1B19] text-[#cb9f6b] border-[#7f644b]">
                                          {weapon.slotType === 'BOTH'
                                            ? 'Both Hands (Two-Handed)'
                                            : weapon.slotType === 'RIGHT'
                                              ? 'Right Hand (Offensive)'
                                              : 'Left Hand (Defensive / Utility)'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Cost badge */}
                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-black text-[#ded095] px-2 py-0.5 rounded bg-[#2A1B19] border border-[#9c8053] block">
                                        🪙 {weapon.cost}G
                                      </span>
                                    </div>
                                  </div>

                                  {/* Stat Boosts Badges */}
                                  <div className="flex flex-wrap gap-1.5 my-2">
                                    {weapon.atkBonus > 0 && (
                                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#9e4a42]/30 text-[#ded095] border border-[#9e4a42]">
                                        +{weapon.atkBonus} ATK
                                      </span>
                                    )}
                                    {weapon.defBonus > 0 && (
                                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#55796f]/40 text-[#ded095] border border-[#55796f]">
                                        +{weapon.defBonus} DEF
                                      </span>
                                    )}
                                    {weapon.spdBonus !== 0 && (
                                      <span
                                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                          weapon.spdBonus > 0
                                            ? 'bg-[#88997a]/40 text-[#ded095] border-[#88997a]'
                                            : 'bg-[#ba7654]/40 text-[#ded095] border-[#ba7654]'
                                        }`}>
                                        {weapon.spdBonus > 0 ? `+${weapon.spdBonus}` : weapon.spdBonus} SPD
                                      </span>
                                    )}
                                    {weapon.critBonus && (
                                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#9e4a42]/40 text-[#fbbf24] border border-[#fbbf24]">
                                        +{Math.round(weapon.critBonus * 100)}% CRIT
                                      </span>
                                    )}
                                    {weapon.pinBonus && (
                                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#ba7654]/40 text-[#ded095] border border-[#ba7654]">
                                        +{Math.round(weapon.pinBonus * 100)}% PIN / CONTROL
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-[#a4968d] leading-relaxed italic">
                                    {weapon.description}
                                  </p>
                                </div>

                                {/* Storage status and Buy Button */}
                                <div className="pt-2 border-t border-[#7f644b]/60 flex items-center justify-between gap-2">
                                  <div className="text-[10px] text-[#cb9f6b]">
                                    Storage: <strong>{countInStorage}</strong>
                                    {countEquipped > 0 && (
                                      <span className="text-[#a4968d] ml-1">({countEquipped} equipped)</span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!canAfford}
                                    onClick={() => {
                                      if (!canAfford) return;
                                      economy.debit(weapon.cost);
                                      setPlayerInventory((prev) => [...prev, weapon.id]);
                                      gameAudio.playCoinPickup();
                                      addCombatLog(`🛒 Purchased ${weapon.name} for ${weapon.cost} Gold into Inventory storage.`, 'neutral');
                                    }}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition min-h-[32px] cursor-pointer ${
                                      canAfford
                                        ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095]'
                                        : 'bg-[#2A1B19] text-[#817475] border border-[#574b50] cursor-not-allowed'
                                    }`}>
                                    {canAfford ? `Buy (${weapon.cost}G)` : `Need ${weapon.cost - gameState.gold}G`}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: INVENTORY (THE EQUIP SCREEN) */}
              {armoryTab === 'inventory' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Storage inventory chips overview */}
                  <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-lg p-3 text-xs">
                    <div className="font-bold text-[#ded095] mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>🎒 Ludus Storage (Unequipped Weapons): {playerInventory.length}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setArmoryTab('armoria')}
                        className="text-[#cb9f6b] hover:text-[#ded095] underline font-bold text-[11px]">
                        + Buy More in ARMORIA Shop ➔
                      </button>
                    </div>

                    {playerInventory.length === 0 ? (
                      <p className="text-[11px] text-[#a4968d] italic">
                        No unequipped armaments in storage. Visit the <strong>ARMORIA (The Shop)</strong> tab to purchase weapons and shields with gold!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const counts: Record<string, number> = {};
                          playerInventory.forEach((id) => {
                            counts[id] = (counts[id] || 0) + 1;
                          });
                          return Object.entries(counts).map(([wId, count]) => {
                            const item = WEAPON_DATABASE[wId];
                            if (!item) return null;
                            return (
                              <span
                                key={wId}
                                className="px-2 py-0.5 rounded bg-[#2A1B19] border border-[#9c8053] text-[11px] font-bold text-[#ded095] flex items-center gap-1 shadow-sm">
                                <span>{item.icon}</span>
                                <span>{item.name}</span>
                                <span className="text-[#cb9f6b]">x{count}</span>
                              </span>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Vertical list of all living gladiators in roster */}
                  <div className="space-y-3">
                    <div className="border-b-2 border-[#7f644b] pb-1 flex items-center justify-between">
                      <h3 className="font-serif font-black text-sm sm:text-base text-[#cb9f6b] tracking-wider uppercase">
                        LIVING GLADIATOR CHAMPIONS ({gladiators.filter((g) => g.hp > 0).length})
                      </h3>
                      <span className="text-[11px] text-[#a4968d]">
                        Click [Right Hand] or [Left Hand] to equip/unequip gear
                      </span>
                    </div>

                    <div className="space-y-3">
                      {gladiators
                        .filter((g) => g.hp > 0)
                        .map((glad) => {
                          const rightItem = glad.equipped.rightHand ? WEAPON_DATABASE[glad.equipped.rightHand] : null;
                          const leftItem = glad.equipped.leftHand ? WEAPON_DATABASE[glad.equipped.leftHand] : null;
                          const isTwoHanded =
                            (rightItem && rightItem.slotType === 'BOTH') ||
                            (leftItem && leftItem.slotType === 'BOTH');
                          const twoHandedItem = rightItem && rightItem.slotType === 'BOTH' ? rightItem : leftItem;

                          return (
                            <div
                              key={glad.id}
                              className={`bg-[#3f363b] border-2 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition shadow-lg ${
                                glad.justEquipped ? 'border-[#ded095] ring-2 ring-[#ded095]/40' : 'border-[#7f644b]'
                              }`}>
                              {/* Left: 16-bit blocky 32x32 headshot portrait and culture/name/stats */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-14 h-14 shrink-0 bg-[#2A1B19] border-2 border-[#9c8053] rounded-lg p-0.5 overflow-hidden shadow-inner">
                                  <img
                                    src={getPortraitDataUrl(
                                      glad.culture,
                                      56,
                                      false,
                                      undefined,
                                      glad.level,
                                      false,
                                      glad.heroType,
                                      glad.gladiatorClass,
                                    )}
                                    alt={glad.name}
                                    className="w-full h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-sm sm:text-base text-[#ded095] truncate">
                                      {glad.name}
                                    </h4>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2A1B19] text-[#cb9f6b] border border-[#7f644b]">
                                      Lvl {glad.level}
                                    </span>
                                    {glad.justEquipped && (
                                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#ded095] text-[#2A1B19] uppercase tracking-wider animate-pulse">
                                        ✨ GEAR UPDATED
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#cb9f6b] truncate">
                                    {CULTURE_LABELS[glad.culture]} &bull; {glad.title}
                                  </div>
                                  {/* Active Combat Stats & Core Attributes */}
                                  <div className="flex items-center gap-3 text-xs mt-1 text-[#a4968d] flex-wrap">
                                    <span className="text-[#ded095] font-bold">⚔️ {glad.attack} ATK</span>
                                    <span className="text-[#55796f] font-bold">🛡️ {glad.defense} DEF</span>
                                    <span className="text-[#88997a] font-bold">💨 {glad.speed} SPD</span>
                                    <span className="text-[#a4968d]">❤️ {Math.round(glad.hp)}/{glad.maxHp} HP</span>
                                    <span className="text-[#cb9f6b] font-mono text-[11px]">
                                      [STR {glad.attributes?.str ?? 10} &bull; DEX {glad.attributes?.dex ?? 10} &bull; VIT {glad.attributes?.vit ?? glad.attributes?.con ?? 10}]
                                    </span>
                                  </div>

                                  {/* Traits */}
                                  {glad.traits && glad.traits.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                      <span className="text-[10px] text-[#a4968d] font-bold">Traits:</span>
                                      {glad.traits.map((t) => (
                                        <TraitBadge key={t} trait={t} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Two Hand UI Boxes [Right Hand] and [Left Hand] */}
                              <div className="w-full md:w-auto shrink-0 flex items-center gap-2 flex-wrap">
                                {isTwoHanded && twoHandedItem ? (
                                  /* Two-Handed Occupied Dual Slot */
                                  <div className="flex-1 md:flex-initial flex items-center justify-between gap-3 p-2.5 bg-[#2A1B19] border-2 border-[#ded095] rounded-lg min-w-[280px]">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">{twoHandedItem.icon}</span>
                                      <div>
                                        <div className="text-[9px] text-[#cb9f6b] font-bold uppercase tracking-wider">
                                          [TWO-HANDED DUAL SLOT]
                                        </div>
                                        <div className="font-bold text-xs text-[#ded095]">
                                          {twoHandedItem.name}
                                        </div>
                                        <div className="text-[10px] text-[#a4968d]">
                                          +{twoHandedItem.atkBonus} ATK{twoHandedItem.defBonus ? `, +${twoHandedItem.defBonus} DEF` : ''}{twoHandedItem.spdBonus ? `, ${twoHandedItem.spdBonus} SPD` : ''}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveEquipSelector({ gladId: glad.id, slot: 'RIGHT' });
                                          gameAudio.playCrispClick();
                                        }}
                                        className="px-2.5 py-1 rounded bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold text-[11px] transition cursor-pointer">
                                        Change
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Unequip Two-Handed Weapon: Return to player inventory, clear slots, recalculate stats
                                          setPlayerInventory((prev) => [...prev, twoHandedItem.id]);
                                          const nextGlads = gladiatorsRef.current.map((g) => {
                                            if (g.id !== glad.id) return g;
                                            return recalculateGladiatorStats({
                                              ...g,
                                              equipped: { rightHand: null, leftHand: null },
                                              justEquipped: true,
                                            });
                                          });
                                          roster.set(nextGlads);
                                          gameAudio.playCrispClick();
                                        }}
                                        className="px-2.5 py-1 rounded bg-[#3f363b] hover:bg-[#9e4a42] text-[#ded095] hover:text-white border border-[#7f644b] font-bold text-[11px] transition cursor-pointer">
                                        Unequip
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Standard Right Hand and Left Hand Boxes */
                                  <div className="flex-1 md:flex-initial flex items-center gap-2 w-full md:w-auto">
                                    {/* [Right Hand] Box */}
                                    <div
                                      onClick={() => {
                                        setActiveEquipSelector({ gladId: glad.id, slot: 'RIGHT' });
                                        gameAudio.playCrispClick();
                                      }}
                                      className={`flex-1 md:w-44 p-2 rounded-lg border-2 flex items-center justify-between gap-1.5 transition cursor-pointer group ${
                                        rightItem
                                          ? 'bg-[#2A1B19] border-[#9c8053] hover:border-[#ded095]'
                                          : 'bg-[#2A1B19]/60 border-[#7f644b]/80 hover:border-[#cb9f6b]'
                                      }`}>
                                      <div className="min-w-0">
                                        <span className="text-[9px] text-[#cb9f6b] font-bold uppercase tracking-wider block">
                                          [RIGHT HAND]
                                        </span>
                                        <div className="font-bold text-xs text-[#ded095] truncate flex items-center gap-1">
                                          <span>{rightItem ? rightItem.icon : '🗡️'}</span>
                                          <span className="truncate">{rightItem ? rightItem.name : 'Default Weapon'}</span>
                                        </div>
                                        <div className="text-[9px] text-[#a4968d] truncate">
                                          {rightItem ? `+${rightItem.atkBonus} ATK` : 'Bare Hands / Cultural'}
                                        </div>
                                      </div>

                                      {rightItem ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Unequip Right Weapon
                                            setPlayerInventory((prev) => [...prev, rightItem.id]);
                                            const nextGlads = gladiatorsRef.current.map((g) => {
                                              if (g.id !== glad.id) return g;
                                              return recalculateGladiatorStats({
                                                ...g,
                                                equipped: { ...g.equipped, rightHand: null },
                                                justEquipped: true,
                                              });
                                            });
                                            roster.set(nextGlads);
                                            gameAudio.playCrispClick();
                                          }}
                                          className="text-[#a4968d] hover:text-[#9e4a42] p-1 text-xs font-bold"
                                          title="Unequip back to default">
                                          ✕
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-[#cb9f6b] font-bold group-hover:translate-x-0.5 transition-transform">
                                          +
                                        </span>
                                      )}
                                    </div>

                                    {/* [Left Hand] Box */}
                                    <div
                                      onClick={() => {
                                        setActiveEquipSelector({ gladId: glad.id, slot: 'LEFT' });
                                        gameAudio.playCrispClick();
                                      }}
                                      className={`flex-1 md:w-44 p-2 rounded-lg border-2 flex items-center justify-between gap-1.5 transition cursor-pointer group ${
                                        leftItem
                                          ? 'bg-[#2A1B19] border-[#55796f] hover:border-[#ded095]'
                                          : 'bg-[#2A1B19]/60 border-[#7f644b]/80 hover:border-[#cb9f6b]'
                                      }`}>
                                      <div className="min-w-0">
                                        <span className="text-[9px] text-[#55796f] font-bold uppercase tracking-wider block">
                                          [LEFT HAND]
                                        </span>
                                        <div className="font-bold text-xs text-[#ded095] truncate flex items-center gap-1">
                                          <span>{leftItem ? leftItem.icon : '🛡️'}</span>
                                          <span className="truncate">{leftItem ? leftItem.name : 'Default Shield'}</span>
                                        </div>
                                        <div className="text-[9px] text-[#a4968d] truncate">
                                          {leftItem ? `+${leftItem.defBonus} DEF` : 'Bare Hands / Cultural'}
                                        </div>
                                      </div>

                                      {leftItem ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Unequip Left Weapon/Shield
                                            setPlayerInventory((prev) => [...prev, leftItem.id]);
                                            const nextGlads = gladiatorsRef.current.map((g) => {
                                              if (g.id !== glad.id) return g;
                                              return recalculateGladiatorStats({
                                                ...g,
                                                equipped: { ...g.equipped, leftHand: null },
                                                justEquipped: true,
                                              });
                                            });
                                            roster.set(nextGlads);
                                            gameAudio.playCrispClick();
                                          }}
                                          className="text-[#a4968d] hover:text-[#9e4a42] p-1 text-xs font-bold"
                                          title="Unequip back to default">
                                          ✕
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-[#55796f] font-bold group-hover:translate-x-0.5 transition-transform">
                                          +
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CARAVAN BAZAAR (EXOTIC WARES & RELICS) */}
              {armoryTab === 'bazaar' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Caravan Bazaar Header Banner */}
                  <div className="bg-gradient-to-r from-[#4d1f1c] via-[#632a24] to-[#4d1f1c] border-2 border-[#fbbf24] rounded-xl p-4 text-[#ded095] shadow-xl flex items-start sm:items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-[#2A1B19] rounded-lg border border-[#fbbf24]">
                        🐪
                      </span>
                      <div>
                        <div className="text-[10px] tracking-widest uppercase text-[#fbbf24] font-bold">
                          NOMAD CARAVAN BAZAAR
                        </div>
                        <h3 className="font-serif font-black text-base sm:text-lg text-white">
                          EXOTIC WARES &amp; SACRED RELICS
                        </h3>
                        <p className="text-[11px] text-[#ded095] italic mt-0.5">
                          "Wares forged in far Damascus, obsidian-edged blades, and imperial relics not found in standard Roman armories."
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#cb9f6b] block">Time In Camp</span>
                      <span className="text-sm font-black text-[#fbbf24] font-mono">
                        {Math.max(0, Math.ceil(merchantState.sitTimer))}s Remaining
                      </span>
                    </div>
                  </div>

                  {/* Exotic Weapon Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['damascene_spatha', 'obsidian_kopis', 'gilded_tower_aegis', 'spiked_caestus', 'imperial_dragon_standard'].map((wId) => {
                      const weapon = WEAPON_DATABASE[wId];
                      if (!weapon) return null;
                      const canAfford = gameState.gold >= weapon.cost;
                      const countInStorage = playerInventory.filter((id) => id === weapon.id).length;
                      const countEquipped = gladiators.filter(
                        (g) => g.equipped.rightHand === weapon.id || g.equipped.leftHand === weapon.id,
                      ).length;

                      return (
                        <div
                          key={weapon.id}
                          className="bg-[#38201d] border-2 border-[#9c8053] hover:border-[#fbbf24] rounded-xl p-4 flex flex-col justify-between gap-3 transition shadow-xl relative group">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2.5">
                                <span className="text-3xl p-1.5 bg-[#2A1B19] rounded border border-[#cb9f6b]">
                                  {weapon.icon}
                                </span>
                                <div>
                                  <h4 className="font-serif font-black text-sm sm:text-base text-[#ded095] group-hover:text-white transition">
                                    {weapon.name}
                                  </h4>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-[#2A1B19] text-[#fbbf24] border-[#fbbf24]/50">
                                    {weapon.slotType === 'BOTH'
                                      ? 'Both Hands (Two-Handed Relic)'
                                      : weapon.slotType === 'RIGHT'
                                        ? 'Right Hand (Exotic Weapon)'
                                        : 'Left Hand (Exotic Bulwark)'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-[#fbbf24] px-2.5 py-1 rounded bg-[#2A1B19] border border-[#fbbf24] block shadow">
                                  🪙 {weapon.cost}G
                                </span>
                              </div>
                            </div>

                            {/* Stat Badges */}
                            <div className="flex flex-wrap gap-1.5 my-2.5">
                              {weapon.atkBonus > 0 && (
                                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#9e4a42]/40 text-[#ded095] border border-[#9e4a42]">
                                  +{weapon.atkBonus} ATK
                                </span>
                              )}
                              {weapon.defBonus > 0 && (
                                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#55796f]/50 text-[#ded095] border border-[#55796f]">
                                  +{weapon.defBonus} DEF
                                </span>
                              )}
                              {weapon.spdBonus !== 0 && (
                                <span
                                  className={`text-[11px] font-black px-2 py-0.5 rounded border ${
                                    weapon.spdBonus > 0
                                      ? 'bg-[#88997a]/50 text-[#ded095] border-[#88997a]'
                                      : 'bg-[#ba7654]/50 text-[#ded095] border-[#ba7654]'
                                  }`}>
                                  {weapon.spdBonus > 0 ? `+${weapon.spdBonus}` : weapon.spdBonus} SPD
                                </span>
                              )}
                              {weapon.critBonus && (
                                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#48201b] text-[#fbbf24] border border-[#fbbf24]">
                                  +{Math.round(weapon.critBonus * 100)}% CRIT
                                </span>
                              )}
                              {weapon.pinBonus && (
                                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#ba7654]/40 text-[#ded095] border border-[#ba7654]">
                                  +{Math.round(weapon.pinBonus * 100)}% PIN / CONTROL
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#a4968d] leading-relaxed italic">
                              "{weapon.description}"
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-[#7f644b]/60 flex items-center justify-between gap-2">
                            <div className="text-[11px] text-[#cb9f6b]">
                              In Storage: <strong>{countInStorage}</strong>
                              {countEquipped > 0 && (
                                <span className="text-[#a4968d] ml-1">({countEquipped} equipped)</span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => {
                                if (!canAfford) return;
                                economy.debit(weapon.cost);
                                setPlayerInventory((prev) => [...prev, weapon.id]);
                                gameAudio.playPowerupChime();
                                addCombatLog(`🐪 Acquired exotic relic ${weapon.name} from the Caravan Bazaar for ${weapon.cost} Gold!`, 'crit');
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-black transition min-h-[36px] cursor-pointer ${
                                canAfford
                                  ? 'bg-[#fbbf24] hover:bg-white text-[#2A1B19] shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                                  : 'bg-[#2A1B19] text-[#817475] border border-[#574b50] cursor-not-allowed'
                              }`}>
                              {canAfford ? `Purchase (${weapon.cost}G)` : `Need ${weapon.cost - gameState.gold}G`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>

            {/* Sub-Modal / Drawer: Hand Weapon Selector for a specific Gladiator */}
            {activeEquipSelector && (() => {
              const targetGlad = gladiators.find((g) => g.id === activeEquipSelector.gladId);
              if (!targetGlad) return null;
              const slot = activeEquipSelector.slot;
              const isRight = slot === 'RIGHT';

              // Filter unequipped weapons in playerInventory eligible for this hand
              // Right Hand: items where slotType === 'RIGHT' OR slotType === 'BOTH'
              // Left Hand: items where slotType === 'LEFT'
              const eligibleItemIds = playerInventory.filter((id) => {
                const w = WEAPON_DATABASE[id];
                if (!w) return false;
                if (isRight) {
                  return w.slotType === 'RIGHT' || w.slotType === 'BOTH';
                } else {
                  return w.slotType === 'LEFT';
                }
              });

              // Group eligible items by unique weapon ID with counts
              const eligibleCounts: Record<string, number> = {};
              eligibleItemIds.forEach((id) => {
                eligibleCounts[id] = (eligibleCounts[id] || 0) + 1;
              });
              const uniqueEligibleIds = Object.keys(eligibleCounts);

              return (
                <div className="absolute inset-0 bg-[#090d16]/85 flex items-center justify-center p-3 sm:p-6 z-50 backdrop-blur-sm">
                  <div className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#9c8053] rounded-xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.9),inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[90vh]">
                    <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
                    <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

                    {/* Selector Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#7f644b] mb-3">
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-[#cb9f6b] font-bold block">
                          EQUIP {isRight ? 'RIGHT HAND / TWO-HANDED' : 'LEFT HAND (DEFENSIVE / UTILITY)'}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-[#ded095]">
                          {targetGlad.name} ({CULTURE_LABELS[targetGlad.culture]})
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveEquipSelector(null)}
                        className="text-[#a4968d] hover:text-[#ded095] p-1">
                        <X size={20} />
                      </button>
                    </div>

                    {/* Unequip / Reset Option */}
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Unequip currently equipped gear in this slot
                          let returnedItem: string | null = null;
                          if (isRight) {
                            returnedItem = targetGlad.equipped.rightHand;
                          } else {
                            returnedItem = targetGlad.equipped.leftHand;
                          }

                          if (returnedItem) {
                            const isTwoHand = WEAPON_DATABASE[returnedItem]?.slotType === 'BOTH';
                            setPlayerInventory((prev) => [...prev, returnedItem!]);
                            const nextGlads = gladiatorsRef.current.map((g) => {
                              if (g.id !== targetGlad.id) return g;
                              const nextEquipped = isTwoHand
                                ? { rightHand: null, leftHand: null }
                                : isRight
                                  ? { ...g.equipped, rightHand: null }
                                  : { ...g.equipped, leftHand: null };
                              return recalculateGladiatorStats({
                                ...g,
                                equipped: nextEquipped,
                                justEquipped: true,
                              });
                            });
                            roster.set(nextGlads);
                          }

                          setActiveEquipSelector(null);
                          gameAudio.playCrispClick();
                        }}
                        className="w-full p-2 rounded-lg bg-[#3f363b] hover:bg-[#574b50] border border-[#7f644b] text-left flex items-center justify-between gap-2 text-xs transition">
                        <div className="flex items-center gap-2">
                          <span>🥋</span>
                          <div>
                            <span className="font-bold text-[#ded095] block">Default Hands (Unequip)</span>
                            <span className="text-[10px] text-[#a4968d]">Revert to native cultural default skin and unboosted stats</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#2A1B19] border border-[#7f644b] text-[#cb9f6b]">
                          Unequip
                        </span>
                      </button>
                    </div>

                    {/* Eligible Inventory Weapons List */}
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                      <div className="text-[11px] font-bold text-[#ded095] pb-1 border-b border-[#7f644b]/50 flex items-center justify-between">
                        <span>AVAILABLE IN STORAGE ({uniqueEligibleIds.length} Unique Types):</span>
                        <span className="text-[10px] text-[#a4968d]">Select to swap gear</span>
                      </div>

                      {uniqueEligibleIds.length === 0 ? (
                        <div className="p-4 bg-[#3f363b]/70 border border-[#7f644b] rounded-lg text-center space-y-2">
                          <p className="text-xs text-[#a4968d]">
                            No unequipped {isRight ? 'offensive or two-handed weapons' : 'defensive shields'} in storage!
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveEquipSelector(null);
                              setArmoryTab('armoria');
                              gameAudio.playCrispClick();
                            }}
                            className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold text-xs px-3 py-1.5 rounded transition">
                            Visit ARMORIA Shop to Purchase ➔
                          </button>
                        </div>
                      ) : (
                        uniqueEligibleIds.map((wId) => {
                          const w = WEAPON_DATABASE[wId];
                          if (!w) return null;
                          const count = eligibleCounts[wId] || 1;
                          const isBoth = w.slotType === 'BOTH';

                          return (
                            <button
                              key={wId}
                              type="button"
                              onClick={() => {
                                // Swapping Logic:
                                // 1. Identify previous weapons on gladiator to move back to playerInventory
                                const oldRight = targetGlad.equipped.rightHand;
                                const oldLeft = targetGlad.equipped.leftHand;
                                const returnedItems: string[] = [];

                                if (isBoth) {
                                  // Two-handed equips occupy both slots: return both previous items
                                  if (oldRight) returnedItems.push(oldRight);
                                  if (oldLeft && oldLeft !== oldRight) returnedItems.push(oldLeft);
                                } else if (isRight) {
                                  if (oldRight) {
                                    returnedItems.push(oldRight);
                                  }
                                } else {
                                  if (oldLeft) {
                                    returnedItems.push(oldLeft);
                                  }
                                }

                                // 2. Remove ONE instance of new weapon from playerInventory
                                setPlayerInventory((prev) => {
                                  const idx = prev.indexOf(wId);
                                  const nextInv = [...prev];
                                  if (idx !== -1) {
                                    nextInv.splice(idx, 1);
                                  }
                                  // Push old items back into inventory
                                  return [...nextInv, ...returnedItems];
                                });

                                // 3. Update gladiator equipped state and recalculate active combat stats
                                const nextGlads = gladiatorsRef.current.map((g) => {
                                  if (g.id !== targetGlad.id) return g;
                                  let nextEquipped: { rightHand: string | null; leftHand: string | null };

                                  if (isBoth) {
                                    nextEquipped = { rightHand: wId, leftHand: wId };
                                  } else if (isRight) {
                                    // If old weapon was two-handed, clean out left hand
                                    const wasBoth = oldRight && WEAPON_DATABASE[oldRight]?.slotType === 'BOTH';
                                    nextEquipped = {
                                      rightHand: wId,
                                      leftHand: wasBoth ? null : g.equipped.leftHand,
                                    };
                                  } else {
                                    // If old weapon was two-handed, clean out right hand
                                    const wasBoth = oldLeft && WEAPON_DATABASE[oldLeft]?.slotType === 'BOTH';
                                    nextEquipped = {
                                      rightHand: wasBoth ? null : g.equipped.rightHand,
                                      leftHand: wId,
                                    };
                                  }

                                  return recalculateGladiatorStats({
                                    ...g,
                                    equipped: nextEquipped,
                                    justEquipped: true,
                                  });
                                });

                                roster.set(nextGlads);
                                setActiveEquipSelector(null);
                                gameAudio.playPowerupChime();
                              }}
                              className="w-full p-2.5 rounded-lg bg-[#3f363b] hover:bg-[#574b50] border border-[#7f644b] hover:border-[#ded095] text-left flex items-center justify-between gap-2 transition group cursor-pointer">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-2xl p-1 bg-[#2A1B19] rounded border border-[#7f644b]">
                                  {w.icon}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-[#ded095] group-hover:text-white">
                                      {w.name}
                                    </span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#2A1B19] text-[#cb9f6b] border border-[#7f644b]">
                                      {isBoth ? 'Two-Handed' : isRight ? 'Right Hand' : 'Left Hand'}
                                    </span>
                                    <span className="text-[10px] text-[#ded095] font-bold">
                                      (x{count} available)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-[#a4968d] mt-0.5">
                                    {w.atkBonus > 0 && <span className="text-[#ded095]">+{w.atkBonus} ATK</span>}
                                    {w.defBonus > 0 && <span className="text-[#55796f]">+{w.defBonus} DEF</span>}
                                    {w.spdBonus !== 0 && (
                                      <span className={w.spdBonus > 0 ? 'text-[#88997a]' : 'text-[#ba7654]'}>
                                        {w.spdBonus > 0 ? `+${w.spdBonus}` : w.spdBonus} SPD
                                      </span>
                                    )}
                                    {w.critBonus && <span className="text-[#fbbf24]">+{Math.round(w.critBonus * 100)}% Crit</span>}
                                    {w.pinBonus && <span className="text-[#cb9f6b]">+{Math.round(w.pinBonus * 100)}% Pin</span>}
                                  </div>
                                </div>
                              </div>

                              <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded bg-[#ba7654] group-hover:bg-[#cb9f6b] text-[#3f363b] transition">
                                Equip ➔
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#7f644b] mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveEquipSelector(null)}
                        className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] px-4 py-1.5 rounded border border-[#7f644b] text-xs font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL: STABLE ROSTER --- */}
      {isRosterModalOpen && (
        <MenuOverlay tone="neutral" zIndex={50} onBackdropClick={() => setIsRosterModalOpen(false)}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-4 sm:p-5 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-3">
              <div>
                <h3 className="text-xl font-bold text-[#ded095]">
                  📜 Stable Roster &amp; Recruitment
                </h3>
                <span className="text-[11px] text-[#cb9f6b]">
                  Roster ({gladiators.filter((g) => g.hp > 0).length}/10) Champions in Ludus (Max 10 Active Slots)
                </span>
              </div>
              <button
                onClick={() => {
                  setIsRosterModalOpen(false);
                }}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-[#a4968d] mb-3">
              The champions of your ludus. Inspect your fighters, review combat traits, and recruit fresh gladiators.
            </p>

            <div className="space-y-2.5 max-h-80 sm:max-h-96 overflow-y-auto touch-auto pr-1">
              {gladiators.map((glad) => {
                const isSlain = glad.hp <= 0;
                const isWounded = glad.hp < glad.maxHp * 0.5;

                return (
                  <div
                    key={glad.id}
                    className={`p-3 rounded-lg border-2 transition ${
                      isSlain
                        ? 'bg-[#3f363b]/50 border-[#9e4a42]/50 opacity-60'
                        : 'bg-[#3f363b] border-[#7f644b]'
                    }`}>
                    <div className="flex items-start gap-3">
                      {/* Detailed 32x32 Cultural Pixel Portrait */}
                      <div className="relative w-16 h-16 shrink-0 bg-[#2d272a] border-2 border-[#7f644b] rounded-lg p-0.5 shadow-md overflow-hidden">
                        <img
                          src={getPortraitDataUrl(
                            glad.culture,
                            64,
                            false,
                            undefined,
                            glad.level,
                            isSlain,
                            glad.heroType,
                            glad.gladiatorClass,
                          )}
                          alt={glad.name}
                          className="w-full h-full object-contain"
                          style={{imageRendering: 'pixelated'}}
                        />
                        {isSlain && (
                          <div className="absolute inset-0 bg-[#9e4a42]/80 flex items-center justify-center text-xs font-bold text-[#ded095]">
                            FALLEN
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-sm text-[#ded095] leading-tight flex items-center gap-1.5 flex-wrap">
                            <span>{glad.name}</span>
                            {isSlain && <span className="text-[#9e4a42] text-xs">(FALLEN)</span>}
                            {(glad.status === 'On Quest' || glad.isOnQuest) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9e4a42] text-white font-black uppercase tracking-wider">
                                [ON QUEST - UNAVAILABLE]
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#cb9f6b]">
                            Lvl {glad.level} ({CULTURE_LABELS[glad.culture]})
                          </span>
                        </div>

                        <div className="text-[11px] text-[#a4968d] mt-0.5">
                          {CULTURE_DESCRIPTIONS[glad.culture]}
                        </div>

                        {/* Core Attributes (STR / DEX / VIT) */}
                        <div className="bg-[#2A1B19] p-1.5 rounded-lg border border-[#9c8053]/70 my-1.5 flex items-center justify-around text-[11px] shadow-inner">
                          <div className="text-center" title="Strength: Directly scales melee damage / attack power (~20% variance)">
                            <span className="text-[9px] text-[#a4968d] uppercase font-bold mr-1">STR:</span>
                            <strong className="text-[#ded095] font-mono">{glad.attributes?.str ?? 10}</strong>
                            <span className="text-[9px] text-[#cb9f6b] ml-0.5">(ATK)</span>
                          </div>
                          <div className="w-[1px] h-4 bg-[#7f644b]/50" />
                          <div className="text-center" title="Dexterity: Directly scales attack rate, speed & agility (~20% variance)">
                            <span className="text-[9px] text-[#a4968d] uppercase font-bold mr-1">DEX:</span>
                            <strong className="text-[#88997a] font-mono">{glad.attributes?.dex ?? 10}</strong>
                            <span className="text-[9px] text-[#cb9f6b] ml-0.5">(SPD)</span>
                          </div>
                          <div className="w-[1px] h-4 bg-[#7f644b]/50" />
                          <div className="text-center" title="Vitality: Directly scales maximum HP pool (~20% variance)">
                            <span className="text-[9px] text-[#a4968d] uppercase font-bold mr-1">VIT:</span>
                            <strong className="text-[#55796f] font-mono">{glad.attributes?.vit ?? glad.attributes?.con ?? 10}</strong>
                            <span className="text-[9px] text-[#cb9f6b] ml-0.5">(HP)</span>
                          </div>
                        </div>

                        {/* Interactive Traits Display */}
                        {glad.traits && glad.traits.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap my-1.5 text-[10px]">
                            <span className="text-[#a4968d] font-bold">Traits:</span>
                            {glad.traits.map((t) => (
                              <TraitBadge key={t} trait={t} />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1.5 text-xs">
                          <span
                            className={
                              isSlain
                                ? 'text-[#9e4a42]'
                                : isWounded
                                  ? 'text-[#9e4a42] font-bold'
                                  : 'text-[#88997a]'
                            }>
                            HP: {Math.round(glad.hp)}/{glad.maxHp} {isWounded && !isSlain && '(WOUNDED)'}
                          </span>
                          <span className="text-[#a4968d]">
                            ATK: {glad.attack} &bull; DEF: {glad.defense} &bull; SPD: {glad.speed} &bull; {glad.kills} Victories
                          </span>
                        </div>

                        {/* Roster Card Bonding Indicator & Tale trigger */}
                        {(() => {
                          const closest = getClosestBondedAlly(glad.id, gladiatorBonds, gladiators);
                          if (!closest.ally) return null;
                          const bondTier = getBondTier(closest.score);
                          return (
                            <div className="mt-2 pt-1.5 border-t border-[#7f644b]/60 flex items-center justify-between text-[11px]">
                              <span className="text-[#cb9f6b] flex items-center gap-1">
                                <span>{bondTier.icon}</span>
                                <span>Sworn Brother: <strong>{closest.ally.name}</strong></span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold px-2 py-0.5 rounded bg-[#574b50] border border-[#7f644b]" style={{color: bondTier.color}}>
                                  Bond: {closest.score}/100
                                </span>
                                {!isSlain && (
                                  <button
                                    onClick={() => {
                                      setIsRosterModalOpen(false);
                                      if (glad.heroType) {
                                        triggerHeroArrival(glad);
                                      } else {
                                        triggerStoryEvent(glad.id, true);
                                      }
                                    }}
                                    className="bg-[#6d3947] hover:bg-[#9e4a42] text-[#ded095] text-[10px] font-bold px-2 py-0.5 rounded border border-[#9c8053] transition">
                                    Hear Tale
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cultural Slave Market & Recruitment Section (Cap: 10 Active Champions) */}
            {gladiators.filter((g) => g.hp > 0).length < 10 && (
              <div className="mt-3 pt-2.5 border-t-2 border-[#7f644b]">
                {/* BEASTMASTER HERO PRIVILEGE: WAR MOUNT TRAINING */}
                {gladiators.some((g) => g.heroType === 'beastmaster') && (
                  <div className="mb-3 p-3 rounded-lg border-2 border-[#fbbf24] bg-[#3a201c] text-xs shadow-md">
                    <div className="font-serif font-black text-xs sm:text-sm text-[#fbbf24] flex items-center gap-1.5 mb-1">
                      <span>🐾 BEASTMASTER SPECIAL PRIVILEGE: WAR MOUNTS</span>
                    </div>
                    <p className="text-[11px] text-[#ded095] mb-2 italic">
                      With Numitor the Beastmaster in your stable, your ludus can recruit combat-trained cavalry and war elephants directly in camp!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 bg-[#2A1B19] rounded border border-[#9c8053] flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#ded095]">🐎 Imperial Equites Cavalry</div>
                          <div className="text-[10px] text-[#cb9f6b]">190 HP • 28 ATK • 22 SPD (Mounted)</div>
                        </div>
                        <button
                          type="button"
                          onClick={recruitCavalry}
                          disabled={gameState.gold < 350 || gladiators.filter((g) => g.hp > 0).length >= 10}
                          className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                            gameState.gold >= 350 && gladiators.filter((g) => g.hp > 0).length < 10
                              ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer'
                              : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                          }`}>
                          Train (350G)
                        </button>
                      </div>

                      <div className="p-2 bg-[#2A1B19] rounded border border-[#9c8053] flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#ded095]">🐘 Carthaginian War Elephant</div>
                          <div className="text-[10px] text-[#cb9f6b]">380 HP • 32 ATK • Tusk Trample</div>
                        </div>
                        <button
                          type="button"
                          onClick={recruitElephant}
                          disabled={gameState.gold < 800 || gladiators.filter((g) => g.hp > 0).length >= 10}
                          className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                            gameState.gold >= 800 && gladiators.filter((g) => g.hp > 0).length < 10
                              ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer'
                              : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                          }`}>
                          Train (800G)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-[#ded095] flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>🏛️ Slave Market (Recruitment):</span>
                    {freeRecruitCultures.length > 0 && (
                      <span className="text-[10px] bg-[#9c8053] text-[#3f363b] px-1.5 py-0.5 rounded font-bold animate-pulse">
                        {freeRecruitCultures.length} FREE ON SALE!
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[#cb9f6b]">
                    Roster ({gladiators.filter((g) => g.hp > 0).length}/10) &bull; Base: {getConfig('recruitCostBase')} Gold
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(['roman', 'celt', 'berber', 'scythian', 'hunnic'] as Culture[]).map((cult) => {
                    const existingCount = gladiators.filter((g) => g.culture === cult).length;
                    const baseTemplate = INITIAL_GLADIATORS.find((g) => g.culture === cult) || INITIAL_GLADIATORS[0];
                    const altNames: Record<Culture, string[]> = {
                      roman: ['Marcus Iron-Fist', 'Titus Spear-Bane', 'Flavius Shield-Breaker', 'Decimus Fortis', 'Lucius Storm-Guard', 'Cassius Blood-Vow', 'Tiberius Iron-Shield'],
                      celt: ['Artur War-Oak', 'Cormac Blood-Blade', 'Eamon Stone-Cleaver', 'Conall Iron-Heart', 'Boran Red-Shield', 'Fergus Wild-Boar', 'Cathal Shadow-Spear'],
                      berber: ['Hamza Sand-Strider', 'Malik Mirage-Dancer', 'Kader Sun-Fury', 'Ziyad Swift-Wind', 'Tahar Dune-Walker', 'Rachid Scimitar', 'Bilal Desert-Hawk'],
                      scythian: ['Tomyris Sun-Bow', 'Zarina Wind-Lance', 'Kada Steppe-Falcon', 'Aria Steppe-Rider', 'Shaya Wild-Rider', 'Yana Iron-Arrow', 'Batu Steppe-Ghost'],
                      hunnic: ['Bleda Scourge-Blade', 'Mundzuk Iron-Horde', 'Ernak Storm-Fang', 'Dengizik Iron-Will', 'Rugila War-Wolf', 'Oktar Dread-Axe', 'Ayaz Iron-Claw'],
                    };
                    const candName = existingCount === 0
                      ? baseTemplate.name
                      : altNames[cult][(existingCount - 1) % altNames[cult].length];

                    const cand: Gladiator = {
                      ...baseTemplate,
                      id: `cand_${cult}_${existingCount}_${Date.now()}`,
                      name: candName,
                    };
                    const isFree = freeRecruitCultures.includes(cand.culture);
                    const recruitCost = isFree ? 0 : (getConfig('recruitCostBase') as number);
                    const canAfford = (isFree || gameState.gold >= recruitCost) && gladiators.filter((g) => g.hp > 0).length < 10;
                    return (
                      <div
                        key={`${cult}_${existingCount}`}
                        className={`p-2.5 border-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition ${
                          isFree
                            ? 'bg-[#3f363b] border-[#ded095] shadow-[0_0_10px_rgba(222,208,149,0.35)]'
                            : 'bg-[#3f363b] border-[#7f644b]'
                        }`}>
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`w-10 h-10 shrink-0 bg-[#2d272a] rounded p-0.5 overflow-hidden border ${
                            isFree ? 'border-[#ded095]' : 'border-[#7f644b]'
                          }`}>
                            <img
                              src={getPortraitDataUrl(cand.culture, 40, false, undefined, 1, false, undefined, cand.gladiatorClass)}
                              alt={cand.name}
                              className="w-full h-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#ded095] truncate text-xs flex items-center gap-1.5 flex-wrap">
                              <span>{cand.name}</span>
                              {isFree && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-[#ded095] text-[#3f363b] rounded font-black tracking-wider uppercase">
                                  0 Gold!
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#cb9f6b] truncate">
                              {CULTURE_LABELS[cand.culture]} &bull; {cand.title}
                            </div>
                            {/* Core Stats (STR / DEX / VIT) */}
                            <div className="text-[10px] text-[#ded095] font-mono flex items-center gap-2 mt-0.5">
                              <span title="Strength: Melee Attack Damage">STR: <strong className="text-[#ded095]">{cand.attributes?.str ?? 10}</strong> (ATK)</span>
                              <span title="Dexterity: Attack Speed & Agility">DEX: <strong className="text-[#88997a]">{cand.attributes?.dex ?? 10}</strong> (SPD)</span>
                              <span title="Vitality: Max HP Scale">VIT: <strong className="text-[#55796f]">{cand.attributes?.vit ?? cand.attributes?.con ?? 10}</strong> (HP)</span>
                            </div>
                            {/* Traits */}
                            {cand.traits && cand.traits.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1">
                                {cand.traits.map((t) => (
                                  <TraitBadge key={t} trait={t} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => recruitGladiator(cand)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded font-bold text-[11px] shrink-0 transition min-h-[32px] ${
                            isFree
                              ? 'bg-[#ded095] hover:bg-white text-[#3f363b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ffffff] animate-bounce cursor-pointer'
                              : canAfford
                                ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer'
                                : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                          }`}>
                          {isFree ? 'Claim FREE (0g)' : `Recruit (${recruitCost}g)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-[#7f644b] flex justify-end">
              <button
                onClick={() => {
                  setIsRosterModalOpen(false);
                  setIsBondingModalOpen(true);
                  gameAudio.playCrispClick();
                }}
                className="bg-[#6d3947] hover:bg-[#9e4a42] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded transition flex items-center gap-1.5 min-h-[36px] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095]">
                <span>🤝 View Full Bonding Matrix</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: PAIRWISE GLADIATOR BONDING SYSTEM & BROTHERHOOD MATRIX --- */}
      {isBondingModalOpen && (
        <MenuOverlay tone="neutral" zIndex={50} onBackdropClick={() => setIsBondingModalOpen(false)}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-3">
              <div>
                <h3 className="text-xl font-bold text-[#ded095] flex items-center gap-2">
                  <span>🤝 Pairwise Gladiator Bonding System</span>
                </h3>
                <span className="text-[11px] text-[#cb9f6b]">
                  Brothers-in-Arms • Forged in Blood • RAGE Mode Dynamics
                </span>
              </div>
              <button
                onClick={() => setIsBondingModalOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            {/* Mechanics overview banner */}
            <div className="bg-[#3f363b] border border-[#7f644b] rounded-lg p-2.5 mb-3 text-xs space-y-1 text-[#a4968d]">
              <div className="font-bold text-[#ded095] flex items-center gap-1.5 mb-1">
                <Sparkles size={14} className="text-[#ded095]" />
                <span>Bond Dynamics & Benefits:</span>
              </div>
              <div>• <strong>Shared Victory (+8 Bond):</strong> Surviving deployed squadmates bond when triumphing in the arena.</div>
              <div>• <strong>Forged in Blood (+12 Bond):</strong> When a gladiator drops below 25% HP and survives, their bond deepens dramatically.</div>
              <div>• <strong>Camp Detachment (-2 Bond):</strong> Gladiators who do not fight together gradually drift apart.</div>
              <div>• <strong>Bloodsworn RAGE (Bond &gt;= 40):</strong> When a brother perishes, bonded squadmates enter a 6-second fiery <strong>BLOOD RAGE</strong> (100% Critical Hits, heightened speed & frenzy)!</div>
            </div>

            {/* Brotherhood Tiers Legend */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-[11px] text-center">
              <div className="bg-[#3f363b] p-1.5 rounded border border-[#88997a]/60 text-[#88997a]">
                <div className="font-bold">🛡️ Acquaintance</div>
                <div className="text-[10px] text-[#a4968d]">0 - 24 Bond</div>
              </div>
              <div className="bg-[#3f363b] p-1.5 rounded border border-[#cb9f6b]/60 text-[#cb9f6b]">
                <div className="font-bold">🤝 Battle Brother</div>
                <div className="text-[10px] text-[#a4968d]">25 - 49 Bond</div>
              </div>
              <div className="bg-[#3f363b] p-1.5 rounded border border-[#9e4a42]/60 text-[#9e4a42]">
                <div className="font-bold">🩸 Bloodsworn (Rage)</div>
                <div className="text-[10px] text-[#a4968d]">50 - 100 Bond (Rage at 40+)</div>
              </div>
            </div>

            {/* Pairwise Bond Cards */}
            <div className="space-y-2 max-h-72 overflow-y-auto touch-auto pr-1">
              {(() => {
                const pairs: { g1: Gladiator; g2: Gladiator; score: number }[] = [];
                for (let i = 0; i < gladiators.length; i++) {
                  for (let j = i + 1; j < gladiators.length; j++) {
                    const g1 = gladiators[i];
                    const g2 = gladiators[j];
                    pairs.push({
                      g1,
                      g2,
                      score: getBondScore(gladiatorBonds, g1.id, g2.id),
                    });
                  }
                }
                // Sort by bond descending
                pairs.sort((a, b) => b.score - a.score);

                return pairs.map(({ g1, g2, score }) => {
                  const tier = getBondTier(score);
                  const isRageCapable = score >= 40;

                  return (
                    <div
                      key={`${g1.id}__${g2.id}`}
                      className="bg-[#3f363b] border border-[#7f644b] rounded-lg p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-[#ded095] flex items-center gap-2">
                          <div className="flex items-center -space-x-1">
                            <div className="w-6 h-6 rounded border border-[#7f644b] overflow-hidden bg-[#2d272a] p-0.5">
                              <img
                                src={getPortraitDataUrl(g1.culture, 24, false, undefined, g1.level, false, g1.heroType, g1.gladiatorClass)}
                                alt={g1.name}
                                className="w-full h-full object-contain"
                                style={{imageRendering: 'pixelated'}}
                              />
                            </div>
                            <div className="w-6 h-6 rounded border border-[#7f644b] overflow-hidden bg-[#2d272a] p-0.5">
                              <img
                                src={getPortraitDataUrl(g2.culture, 24, false, undefined, g2.level, false, g2.heroType, g2.gladiatorClass)}
                                alt={g2.name}
                                className="w-full h-full object-contain"
                                style={{imageRendering: 'pixelated'}}
                              />
                            </div>
                          </div>
                          <span>{g1.name}</span>
                          <span className="text-[#a4968d]">&bull;</span>
                          <span>{g2.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isRageCapable && (
                            <span className="text-[9px] bg-[#9e4a42]/40 text-[#ded095] border border-[#9e4a42] px-1.5 py-0.5 rounded font-bold">
                              🔥 RAGE READY
                            </span>
                          )}
                          <span className="font-bold text-xs" style={{ color: tier.color }}>
                            {tier.icon} {score}/100
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#a4968d]">
                        <span>
                          {g1.culture.toUpperCase()} &bull; {g2.culture.toUpperCase()}
                        </span>
                        <span className="font-semibold" style={{ color: tier.color }}>
                          {tier.title}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-[#574b50] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${score}%`,
                            backgroundColor: tier.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- GAME MENU OVERLAY (ESC) --- */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div className="relative w-full max-w-md bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col items-center">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <h2 className="text-2xl md:text-3xl font-black mb-6 text-[#ded095] text-center tracking-wider font-serif">
              LUDUS COMMAND MENU
            </h2>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  gameAudio.playCrispClick();
                }}
                autoFocus
                className="w-full bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold py-2.5 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                <Play size={18} />
                <span>Resume Game</span>
              </button>

              <button
                onClick={() => {
                  setMusicMuted((prev) => !prev);
                  gameAudio.playCrispClick();
                }}
                className="w-full bg-[#3f363b] hover:bg-[#47505c] border border-[#7f644b] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                {musicMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>Music: {musicMuted ? 'Muted' : 'Playing'}</span>
              </button>

              <button
                onClick={() => {
                  const newMuted = gameAudio.toggleMute();
                  setSfxMuted(newMuted);
                }}
                className="w-full bg-[#3f363b] hover:bg-[#47505c] border border-[#7f644b] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                {sfxMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>Sound FX: {sfxMuted ? 'Muted' : 'Active'}</span>
              </button>

              <button
                onClick={() => {
                  setIsHowToPlayOpen(true);
                  gameAudio.playCrispClick();
                }}
                className="w-full bg-[#3f363b] hover:bg-[#47505c] border border-[#7f644b] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                <HelpCircle size={18} />
                <span>Campaign Guide & Rules</span>
              </button>

              <button
                onClick={replayIntro}
                className="w-full bg-[#574b50] hover:bg-[#817475] border border-[#ded095] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                <span>🎬 Watch Cinematic Intro</span>
              </button>

              <button
                onClick={() => {
                  initGame();
                }}
                className="w-full bg-[#9e4a42]/80 hover:bg-[#9e4a42] border border-[#ba7654] text-[#ded095] font-bold py-2.5 px-4 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                <RotateCw size={18} />
                <span>Restart Campaign</span>
              </button>

              <button
                onClick={() => {
                  replayIntro();
                }}
                className="w-full bg-[#3f363b] hover:bg-[#47505c] border border-[#574b50] text-[#817475] font-bold py-2 px-4 rounded-lg text-xs md:text-sm flex items-center justify-center gap-2 transition min-w-[48px] min-h-[48px]">
                <span>Quit to Title</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- HOW TO PLAY GUIDE OVERLAY --- */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div className="relative w-full max-w-md bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <h2 className="text-2xl font-bold mb-4 text-[#ded095] flex items-center gap-2 font-serif">
              <HelpCircle size={24} />
              <span>Ludus Champion Guide</span>
            </h2>

            <div className="space-y-3 text-xs md:text-sm text-[#a4968d] overflow-y-auto max-h-80 touch-auto pr-1">
              <p>
                <strong>1. In-World Gladiator Dilemmas &amp; Quests:</strong> Gladiators in camp regularly step forward with in-world quests and dilemmas personal to their heritage and situation. Hear their tale through the rising speech bar, then directly choose how to handle the crisis (dispatching them or squadmates, or making tactical decisions). Stats dynamically determine success chances. Use [Q] to test anytime!
              </p>
              <p>
                <strong>2. Five-Tier Coliseum Progression:</strong> Advance through 5 escalating trials:
                <br />&bull; <em>Tier I:</em> Pit Skirmishers
                <br />&bull; <em>Tier II:</em> Arena Centurions
                <br />&bull; <em>Tier III:</em> Beastmasters &amp; Provocatores
                <br />&bull; <em>Tier IV:</em> Imperial Praetorian Guard
                <br />&bull; <em>Tier V:</em> The Grand Coliseum Champion (Boss Battle!)
                <br />Triumphing in Tier V crowns your ludus with the Supreme Coliseum Title!
              </p>
              <p>
                <strong>3. Monumental Roman Podium Screen:</strong> Inspect your ascent up the 5 elevation stages of the grand Roman monument, adorned with sculpted pedestals, curling ivy and laurel vines, and roaring bronze braziers.
              </p>
              <p>
                <strong>4. Cultural Graves on Camp Field:</strong> When a champion falls in battle or quest, a permanent memorial grave is erected along the camp boundary, styled after their ancestral culture (Roman carved stele &amp; eagle, Celtic moss menhir &amp; cross, Berber stone cairn &amp; cloth, Scythian kurgan spear totem, Hunnic stud-notched timber &amp; horsehair). Hover or click to read their epitaph and battle record!
              </p>
              <p>
                <strong>5. Real-Time Squad Combat &amp; Pins:</strong> Deploy 1 to 3 champions. Manage stamina, bait strikes, pin opponents for guaranteed 1.5x Critical damage, and unleash fiery Bloodsworn RAGE when sworn brothers fall!
              </p>
              <p>
                <strong>6. Gold Treasury &amp; Economy:</strong> Gold is the lifeblood of the ludus. Earn gold by winning arena bouts and undertaking high-stakes commissions to recruit new champions and forge superior weapons and armor.
              </p>
            </div>

            <button
              onClick={() => setIsHowToPlayOpen(false)}
              className="mt-6 w-full bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-bold py-2.5 rounded-lg text-sm transition min-w-[48px] min-h-[48px] flex items-center justify-center gap-2">
              <ArrowLeft size={18} />
              <span>Return</span>
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* --- DEBUG CONTROL PANEL MODAL ('Z' KEY) --- */}
      {isDebugMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={85}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#7f644b] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛠️</span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] tracking-wide">
                    DEBUG CONTROL PANEL ('Z')
                  </h3>
                  <span className="text-[11px] text-[#cb9f6b]">
                    Live Visual Evolution & Cultural Spawner Testing (Cap: 5 Gladiators)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDebugMenuOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            {/* Section 1: Spawn Cultural Gladiator at any level */}
            <div className="bg-[#3f363b] border border-[#7f644b] rounded-lg p-3 mb-3">
              <div className="text-xs font-bold text-[#ded095] mb-1.5 flex items-center justify-between">
                <span>1. ORDER / SPAWN GLADIATOR (MAX 10):</span>
                <span className="text-[10px] text-[#cb9f6b]">Roster: {gladiators.filter((g) => g.hp > 0).length}/10</span>
              </div>

              {/* Target Level Selector */}
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                <span className="text-[11px] text-[#a4968d] font-bold">Spawn Tier:</span>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setDebugSpawnLevel(lvl);
                      gameAudio.playHoverMicroTone();
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      debugSpawnLevel === lvl
                        ? 'bg-[#ded095] text-[#3f363b] ring-2 ring-[#ded095]'
                        : 'bg-[#574b50] text-[#ded095] hover:bg-[#6d3947]'
                    }`}>
                    Level {toRoman(lvl)}
                  </button>
                ))}
              </div>

              {/* 5 Culture spawn buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(['roman', 'celt', 'berber', 'scythian', 'hunnic'] as Culture[]).map((cult) => {
                  const baseTmpl = INITIAL_GLADIATORS.find((g) => g.culture === cult) || INITIAL_GLADIATORS[0];
                  const canSpawn = gladiators.filter((g) => g.hp > 0).length < 10;
                  return (
                    <button
                      key={cult}
                      type="button"
                      disabled={!canSpawn}
                      onClick={() => {
                        if (!canSpawn) return;
                        const existingCount = gladiatorsRef.current.filter((g) => g.culture === cult).length;
                        const altNames: Record<Culture, string[]> = {
                          roman: ['Marcus Iron-Fist', 'Titus Spear-Bane', 'Flavius Shield-Breaker', 'Decimus Fortis', 'Lucius Storm-Guard', 'Cassius Blood-Vow', 'Tiberius Iron-Shield'],
                          celt: ['Artur War-Oak', 'Cormac Blood-Blade', 'Eamon Stone-Cleaver', 'Conall Iron-Heart', 'Boran Red-Shield', 'Fergus Wild-Boar', 'Cathal Shadow-Spear'],
                          berber: ['Hamza Sand-Strider', 'Malik Mirage-Dancer', 'Kader Sun-Fury', 'Ziyad Swift-Wind', 'Tahar Dune-Walker', 'Rachid Scimitar', 'Bilal Desert-Hawk'],
                          scythian: ['Tomyris Sun-Bow', 'Zarina Wind-Lance', 'Kada Steppe-Falcon', 'Aria Steppe-Rider', 'Shaya Wild-Rider', 'Yana Iron-Arrow', 'Batu Steppe-Ghost'],
                          hunnic: ['Bleda Scourge-Blade', 'Mundzuk Iron-Horde', 'Ernak Storm-Fang', 'Dengizik Iron-Will', 'Rugila War-Wolf', 'Oktar Dread-Axe', 'Ayaz Iron-Claw'],
                        };
                        const cName = existingCount === 0
                          ? baseTmpl.name
                          : altNames[cult][(existingCount - 1) % altNames[cult].length];

                        let debugEquipped: { rightHand: string | null; leftHand: string | null } = { rightHand: null, leftHand: null };
                        if (debugSpawnLevel === 4 && Math.random() < 0.50) {
                          debugEquipped = rollNpcEquipment(4, cult);
                        } else if (debugSpawnLevel >= 5 && Math.random() < 0.80) {
                          debugEquipped = rollNpcEquipment(5, cult);
                        }

                        let newG: Gladiator = {
                          ...baseTmpl,
                          id: `glad_${cult}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                          name: cName,
                          level: debugSpawnLevel,
                          baseAttack: baseTmpl.attack + (debugSpawnLevel - 1) * 5,
                          baseDefense: baseTmpl.defense + (debugSpawnLevel - 1) * 4,
                          baseSpeed: baseTmpl.speed,
                          attack: baseTmpl.attack + (debugSpawnLevel - 1) * 5,
                          defense: baseTmpl.defense + (debugSpawnLevel - 1) * 4,
                          speed: baseTmpl.speed,
                          hp: baseTmpl.maxHp + (debugSpawnLevel - 1) * 25,
                          maxHp: baseTmpl.maxHp + (debugSpawnLevel - 1) * 25,
                          status: 'Available',
                          equipped: debugEquipped,
                          x: 100 + Math.random() * 80,
                          y: 110 + Math.random() * 30,
                          targetX: 100 + Math.random() * 80,
                          targetY: 110 + Math.random() * 30,
                          state: 'idle',
                          targetActivity: 'idle',
                          actionTimer: 2.0,
                          animTimer: 0,
                          flipX: false,
                        };
                        newG = recalculateGladiatorStats(newG);
                        const nextR = [...gladiatorsRef.current, newG];
                        roster.set(nextR);
                        gameAudio.playLevelUpStinger();
                        gameAudio.playPowerupChime();
                      }}
                      className={`p-2 rounded text-left border flex items-center gap-2 text-xs transition ${
                        canSpawn
                          ? 'bg-[#574b50] hover:bg-[#6d3947] border-[#7f644b] text-[#ded095] cursor-pointer'
                          : 'bg-[#2a2428] border-[#574b50] text-[#817475] cursor-not-allowed'
                      }`}>
                      <div className="w-8 h-8 shrink-0 bg-[#2d272a] rounded overflow-hidden p-0.5 border border-[#7f644b]">
                        <img
                          src={getPortraitDataUrl(cult, 32, false, undefined, debugSpawnLevel, false)}
                          alt={cult}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-bold truncate text-[11px]">{CULTURE_LABELS[cult].split(' ')[0]}</div>
                        <div className="text-[10px] text-[#cb9f6b]">Lvl {toRoman(debugSpawnLevel)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Change Level of Existing Gladiators */}
            <div className="bg-[#3f363b] border border-[#7f644b] rounded-lg p-3 mb-3">
              <div className="text-xs font-bold text-[#ded095] mb-1.5 flex items-center justify-between">
                <span>2. SET ROSTER GLADIATOR LEVEL (TEST EVOLUTIONS):</span>
                <span className="text-[10px] text-[#a4968d]">Updates sprite & portrait instantly</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {gladiators.map((glad) => {
                  return (
                    <div
                      key={glad.id}
                      className="p-2 bg-[#2d272a] border border-[#7f644b] rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 shrink-0 bg-[#3f363b] rounded p-0.5 overflow-hidden border border-[#9c8053]">
                          <img
                            src={getPortraitDataUrl(glad.culture, 36, false, undefined, glad.level, glad.hp <= 0, glad.heroType, glad.gladiatorClass)}
                            alt={glad.name}
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#ded095] truncate text-xs">{glad.name}</div>
                          <div className="text-[10px] text-[#cb9f6b]">
                            {CULTURE_LABELS[glad.culture]} &bull; Current: <strong>Lvl {toRoman(glad.level)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Level selector buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              const updated = gladiatorsRef.current.map((g) => {
                                if (g.id !== glad.id) return g;
                                const curA = g.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
                                const levelDelta = Math.max(0, lvl - 1);
                                const newAttrs = {
                                  ...curA,
                                  str: 10 + Math.round(levelDelta * 1.5),
                                  dex: 10 + Math.round(levelDelta * 1.5),
                                  vit: 10 + Math.round(levelDelta * 1.5),
                                  con: 10 + Math.round(levelDelta * 1.5),
                                };
                                const upd = {
                                  ...g,
                                  level: lvl,
                                  attributes: newAttrs,
                                };
                                return recalculateGladiatorStats(upd);
                              });
                              roster.set(updated);

                              // Also update if currently in arena
                              arenaFightersRef.current = arenaFightersRef.current.map((f) => {
                                if (f.sourceGladiatorId !== glad.id) return f;
                                return {
                                  ...f,
                                  level: lvl,
                                  attack: 20 + (lvl - 1) * 5,
                                  defense: 10 + (lvl - 1) * 4,
                                };
                              });

                              gameAudio.playLevelUpStinger();
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                              glad.level === lvl
                                ? 'bg-[#ded095] text-[#3f363b] ring-1 ring-[#ded095]'
                                : 'bg-[#574b50] text-[#ded095] hover:bg-[#6d3947]'
                            }`}>
                            {toRoman(lvl)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Rare Fortified Quests & Legendary Heroes Tester */}
            <div className="bg-[#3f363b] border-2 border-[#9c8053] rounded-lg p-3 mb-3">
              <div className="text-xs font-bold text-[#ded095] mb-1.5 flex items-center justify-between">
                <span>3. RARE FORTIFIED QUESTS &amp; LEGENDARY HEROES:</span>
                <span className="text-[10px] text-[#fbbf24]">Fortifications &amp; Thematic Maps</span>
              </div>

              {/* Direct Launch Fortified Battles */}
              <div className="text-[11px] text-[#cb9f6b] font-bold mb-1">
                Launch Fortified Custom Battles:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2.5">
                {FORTIFIED_QUEST_TEMPLATES.map((fQuest) => (
                  <button
                    key={fQuest.id}
                    type="button"
                    onClick={() => {
                      setIsDebugMenuOpen(false);
                      launchBattle(fQuest, false);
                    }}
                    className="p-2 rounded bg-[#574b50] hover:bg-[#6d3947] border border-[#ded095] text-left text-xs transition cursor-pointer flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-[#ded095] text-[11px] leading-tight">
                        ⚔️ {fQuest.name.split(' (')[0]}
                      </div>
                      <div className="text-[10px] text-[#cb9f6b] mt-0.5">
                        {fQuest.mapTheme === 'river_rubicon' ? 'Water Slow (Cavalry Immune)' : fQuest.mapTheme === 'alpine_rampart' ? 'Low Walls (40% Cover)' : 'River + Wall Barricades'}
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-[#ded095] mt-1">
                      Reward: {fQuest.heroReward?.toUpperCase()} ➔
                    </span>
                  </button>
                ))}
              </div>

              {/* Direct Instant Hero Recruitment */}
              <div className="text-[11px] text-[#cb9f6b] font-bold mb-1">
                Instant Recruit Unique Legendary Heroes (Cap: 10):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={gladiators.filter((g) => g.hp > 0).length >= 10}
                  onClick={() => {
                    if (gladiatorsRef.current.filter((g) => g.hp > 0).length >= 10) return;
                    const hero: Gladiator = recalculateGladiatorStats({
                      ...HERO_BEASTMASTER,
                      id: `hero_beastmaster_${Date.now()}`,
                      x: -30,
                      y: 115,
                      targetX: 110 + Math.random() * 50,
                      targetY: 110 + Math.random() * 25,
                      state: 'walking',
                      targetActivity: 'idle',
                      isWalkingIn: true,
                      flipX: false,
                    });
                    const next = [...gladiatorsRef.current, hero];
                    roster.set(next);
                    triggerHeroArrival(hero);
                    addCombatLog('🐾 Recruited Numitor the Beastmaster via Debugger!', 'neutral');
                  }}
                  className={`p-2 rounded border text-left text-xs transition flex flex-col justify-between ${
                    gladiators.filter((g) => g.hp > 0).length < 10
                      ? 'bg-[#2A1B19] hover:bg-[#3f363b] border-[#fbbf24] text-[#ded095] cursor-pointer'
                      : 'bg-[#2A1B19] opacity-50 border-[#574b50] text-[#817475] cursor-not-allowed'
                  }`}>
                  <div className="font-bold text-[#fbbf24] text-[11px]">🐾 Beastmaster</div>
                  <div className="text-[10px] text-[#a4968d]">Trains Cavalry &amp; War Elephants in Tent</div>
                </button>

                <button
                  type="button"
                  disabled={gladiators.filter((g) => g.hp > 0).length >= 10}
                  onClick={() => {
                    if (gladiatorsRef.current.filter((g) => g.hp > 0).length >= 10) return;
                    const hero: Gladiator = recalculateGladiatorStats({
                      ...HERO_SALADIN,
                      id: `hero_saladin_${Date.now()}`,
                      x: -30,
                      y: 115,
                      targetX: 110 + Math.random() * 50,
                      targetY: 110 + Math.random() * 25,
                      state: 'walking',
                      targetActivity: 'idle',
                      isWalkingIn: true,
                      flipX: false,
                    });
                    const next = [...gladiatorsRef.current, hero];
                    roster.set(next);
                    triggerHeroArrival(hero);
                    addCombatLog('🌿 Recruited Saladin the Medic via Debugger!', 'neutral');
                  }}
                  className={`p-2 rounded border text-left text-xs transition flex flex-col justify-between ${
                    gladiators.filter((g) => g.hp > 0).length < 10
                      ? 'bg-[#2A1B19] hover:bg-[#3f363b] border-[#55796f] text-[#ded095] cursor-pointer'
                      : 'bg-[#2A1B19] opacity-50 border-[#574b50] text-[#817475] cursor-not-allowed'
                  }`}>
                  <div className="font-bold text-[#55796f] text-[11px]">🌿 Saladin the Medic</div>
                  <div className="text-[10px] text-[#a4968d]">2x Camp Heal &amp; Battle AoE Aura</div>
                </button>

                <button
                  type="button"
                  disabled={gladiators.filter((g) => g.hp > 0).length >= 10}
                  onClick={() => {
                    if (gladiatorsRef.current.filter((g) => g.hp > 0).length >= 10) return;
                    const hero: Gladiator = recalculateGladiatorStats({
                      ...HERO_ZUZUBU,
                      id: `hero_zuzubu_${Date.now()}`,
                      x: -30,
                      y: 115,
                      targetX: 110 + Math.random() * 50,
                      targetY: 110 + Math.random() * 25,
                      state: 'walking',
                      targetActivity: 'idle',
                      isWalkingIn: true,
                      flipX: false,
                    });
                    const next = [...gladiatorsRef.current, hero];
                    roster.set(next);
                    triggerHeroArrival(hero);
                    addCombatLog('🐆 Recruited Zuzubu via Debugger!', 'neutral');
                  }}
                  className={`p-2 rounded border text-left text-xs transition flex flex-col justify-between ${
                    gladiators.filter((g) => g.hp > 0).length < 10
                      ? 'bg-[#2A1B19] hover:bg-[#3f363b] border-[#ba7654] text-[#ded095] cursor-pointer'
                      : 'bg-[#2A1B19] opacity-50 border-[#574b50] text-[#817475] cursor-not-allowed'
                  }`}>
                  <div className="font-bold text-[#ba7654] text-[11px]">🐆 Zuzubu</div>
                  <div className="text-[10px] text-[#a4968d]">Spear Chuck &amp; Berserk Blood Rage</div>
                </button>
              </div>
            </div>

            {/* Section 4: Quick Cheats */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={() => {
                  economy.credit(1000);
                  gameAudio.playCoinPickup();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                🪙 +1000 Gold
              </button>

              <button
                type="button"
                onClick={() => {
                  const healed = gladiatorsRef.current.map((g) => ({
                    ...g,
                    hp: g.maxHp,
                  }));
                  roster.set(healed);
                  arenaFightersRef.current = arenaFightersRef.current.map((f) => ({
                    ...f,
                    hp: f.maxHp,
                  }));
                  gameAudio.playPowerupChime();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                💚 Heal All to 100%
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnlockedTierIndex(4);
                  gameAudio.playLevelUpStinger();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                🏛️ Unlock All Tiers
              </button>

              <button
                type="button"
                onClick={() => {
                  setLudusUpgrades((prev) => ({
                    trainingGrounds: (prev.trainingGrounds + 1) % 4,
                    medicalBay: (prev.medicalBay + 1) % 4,
                    breedingPens: (prev.breedingPens + 1) % 3,
                  }));
                  gameAudio.playLevelUpStinger();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#88997a] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                🌿 Cycle Facility Visuals (T:{ludusUpgrades.trainingGrounds} M:{ludusUpgrades.medicalBay} B:{ludusUpgrades.breedingPens})
              </button>

              <button
                type="button"
                onClick={() => {
                  merchantStateRef.current = {
                    active: true,
                    state: 'entering',
                    x: 24,
                    y: 110,
                    targetX: 180,
                    targetY: 106,
                    sitTimer: 25.0,
                    hasPlayedSitSpeech: false,
                    hasPlayedDepartSpeech: false,
                    flipX: false,
                    animTimer: 0,
                  };
                  setMerchantState({ ...merchantStateRef.current });
                  gameAudio.playPowerupChime();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#fbbf24] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                🐪 Spawn Merchant
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSummonPhysician();
                }}
                className="bg-[#2f5c3a] hover:bg-[#3d774b] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded border border-[#ded095]">
                🌿 Summon Physician ({physicianCost}G)
              </button>

              <button
                type="button"
                onClick={() => {
                  devoteeStateRef.current = {
                    active: true,
                    state: 'entering',
                    x: 330,
                    y: 135,
                    targetX: 160,
                    targetY: 115,
                    battlesLeft: 2,
                    hasGiftedGold: false,
                    animTimer: 0,
                    flipX: true,
                    speechTimer: 2.0,
                  };
                  setDevoteeState({ ...devoteeStateRef.current });
                  gameAudio.playPowerupChime();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                🙌 Spawn Devotee
              </button>

              <button
                type="button"
                onClick={() => {
                  const nw = campWeather === 'rain' ? 'clear' : 'rain';
                  setCampWeather(nw);
                  campWeatherRef.current = nw;
                  gameAudio.playCrispClick();
                }}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#88997a] text-xs font-bold px-3 py-1.5 rounded border border-[#7f644b]">
                🌧 Toggle Rain
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDebugMenuOpen(false);
                  launchCampDefenseBattle();
                }}
                className="bg-[#9e4a42] hover:bg-[#ba7654] text-white text-xs font-bold px-3 py-1.5 rounded border border-[#ba7654]">
                ⚔️ [⚔ BANDIT RAID]
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDebugMenuOpen(false);
                  launchSandboxBattle();
                }}
                className="bg-[#9e4a42] hover:bg-[#ba7654] text-[#ded095] text-xs font-bold px-3 py-1.5 rounded border border-[#ded095]">
                ⚔️ [⚔ UPRISING SANDBOX]
              </button>

              <button
                type="button"
                onClick={() => setIsDebugMenuOpen(false)}
                className="ml-auto bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] text-xs font-bold px-4 py-1.5 rounded shadow">
                Done / Close (Z)
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: PRE-MATCH PEP TALK STAGING ROOM CINEMATIC --- */}
      {pepTalkState && pepTalkState.active && (
        <MenuOverlay tone="neutral" zIndex={80} onBackdropClick={() => setPepTalkState(null)}>
          <div className="relative w-full max-w-2xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-2xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />

            {/* Header: Lanista Aulus in Staging Room */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 shrink-0 bg-[#2d272a] border-2 border-[#9c8053] rounded-lg p-0.5 overflow-hidden shadow-inner">
                  <img
                    src={getAulusPortraitDataUrl(56)}
                    alt="Lanista Aulus"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-[#cb9f6b] font-bold block">
                    ARENA GATE STAGING ROOM &bull; PSYCHOLOGICAL PROFILING
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] font-serif">
                    LANISTA AULUS' PEP TALK
                  </h3>
                  <div className="text-[11px] text-[#a4968d]">
                    Renown: <strong className="text-[#ded095]">{managerRenown}</strong> &bull; Speechcraft: <strong className="text-[#cb9f6b]">Level {toRoman(speechcraftLevel)}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs px-2.5 py-1 rounded bg-[#3f363b] border border-[#9c8053] text-[#ded095] font-bold">
                  {pepTalkState.addressedGladiatorIds.length} / 2 Addressed
                </span>
              </div>
            </div>

            <p className="text-xs text-[#a4968d] mb-3 italic">
              "The iron portcullis shakes as the crowd chants above. Address up to 2 deployed champions directly before they march onto the sand. Choose your managerial tone wisely: words can forge heroes or break fragile resolve."
            </p>

            {/* Deployed Squad Members */}
            <div className="space-y-3 mb-4">
              {gladiators
                .filter((g) => selectedGladiatorIds.includes(g.id) && g.hp > 0)
                .map((glad) => {
                  const isAddressed = pepTalkState.addressedGladiatorIds.includes(glad.id);
                  const outcome = pepTalkState.talkOutcomes[glad.id];

                  return (
                    <div
                      key={glad.id}
                      className={`p-3 rounded-xl border-2 transition shadow flex flex-col gap-2.5 ${
                        isAddressed ? 'bg-[#38221f] border-[#ded095]' : 'bg-[#3f363b] border-[#7f644b]'
                      }`}>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-[#2d272a] rounded border border-[#9c8053] overflow-hidden p-0.5 shrink-0">
                            <img
                              src={getPortraitDataUrl(
                                glad.culture,
                                40,
                                false,
                                undefined,
                                glad.level,
                                false,
                                glad.heroType,
                                glad.gladiatorClass,
                              )}
                              alt={glad.name}
                              className="w-full h-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#ded095] flex items-center gap-2">
                              <span>{glad.name}</span>
                              <span className="text-[10px] text-[#cb9f6b]">Lvl {toRoman(glad.level)}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2A1B19] text-[#88997a] border border-[#574b50]">
                                {glad.weightClass}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#a4968d] flex items-center gap-2 flex-wrap">
                              <span title="Strength: Melee Attack Power">STR: <strong className="text-[#ded095]">{glad.attributes?.str ?? 10}</strong></span> &bull;
                              <span title="Dexterity: Attack Speed & Agility">DEX: <strong className="text-[#88997a]">{glad.attributes?.dex ?? 10}</strong></span> &bull;
                              <span title="Vitality: Max HP Pool">VIT: <strong className="text-[#55796f]">{glad.attributes?.vit ?? glad.attributes?.con ?? 10}</strong></span> &bull;
                              <span title="Willpower: Morale & Resolve">WIL: <strong className="text-[#ded095]">{glad.attributes?.wil ?? 10}</strong></span>
                            </div>

                            {glad.traits && glad.traits.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                <span className="text-[10px] text-[#cb9f6b] font-bold">Traits:</span>
                                {glad.traits.map((t) => (
                                  <TraitBadge key={t} trait={t} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {outcome ? (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-[#ded095] block">
                              Psychological Reaction
                            </span>
                            <span className={`text-xs font-black px-2.5 py-1 rounded border shadow-sm ${
                              outcome.statusCategory === 'INSPIRED'
                                ? 'bg-[#55796f]/50 text-[#ded095] border-[#55796f]'
                                : outcome.statusCategory === 'SKEPTICAL'
                                  ? 'bg-[#ba7654]/50 text-[#ded095] border-[#ba7654]'
                                  : 'bg-[#9e4a42]/50 text-[#ba7654] border-[#9e4a42]'
                            }`}>
                              [{outcome.statusCategory}] {outcome.buff}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#cb9f6b] font-serif italic">Awaiting speech...</span>
                        )}
                      </div>

                      {/* Feedback text if addressed */}
                      {outcome && (
                        <div className="text-[11px] text-[#ded095] bg-[#2A1B19] p-2 rounded border border-[#7f644b]/60 italic">
                          &ldquo;{outcome.desc}&rdquo;
                        </div>
                      )}

                      {/* Tone selection buttons (if not addressed and under 2 cap) */}
                      {!outcome && (
                        <div className="flex items-center gap-2 pt-1 border-t border-[#7f644b]/40 flex-wrap">
                          <button
                            type="button"
                            disabled={pepTalkState.addressedGladiatorIds.length >= 2}
                            onClick={() => {
                              const result = evaluatePepTalk(glad, 'INSPIRE', speechcraftLevel);
                              setPepTalkState((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  addressedGladiatorIds: [...prev.addressedGladiatorIds, glad.id],
                                  talkOutcomes: { ...prev.talkOutcomes, [glad.id]: { tone: 'INSPIRE', ...result } },
                                };
                              });
                              if (result.statusCategory === 'INSPIRED') {
                                gameAudio.playPowerupChime();
                              } else {
                                gameAudio.playHoverMicroTone();
                              }
                            }}
                            className="flex-1 py-1.5 px-2 rounded bg-[#55796f] hover:bg-[#88997a] text-[#ded095] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                            <span>🔥 INSPIRE</span>
                            <span className="text-[9px] opacity-80">(Duty &amp; Honor)</span>
                          </button>

                          <button
                            type="button"
                            disabled={pepTalkState.addressedGladiatorIds.length >= 2}
                            onClick={() => {
                              const result = evaluatePepTalk(glad, 'MOCK', speechcraftLevel);
                              setPepTalkState((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  addressedGladiatorIds: [...prev.addressedGladiatorIds, glad.id],
                                  talkOutcomes: { ...prev.talkOutcomes, [glad.id]: { tone: 'MOCK', ...result } },
                                };
                              });
                              if (result.statusCategory === 'INSPIRED') {
                                gameAudio.playPowerupChime();
                              } else {
                                gameAudio.playSwordClash();
                              }
                            }}
                            className="flex-1 py-1.5 px-2 rounded bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer">
                            <span>🩸 ROUSE</span>
                            <span className="text-[9px] opacity-80">(Bloodlust)</span>
                          </button>

                          <button
                            type="button"
                            disabled={pepTalkState.addressedGladiatorIds.length >= 2}
                            onClick={() => {
                              const result = evaluatePepTalk(glad, 'THREATEN', speechcraftLevel);
                              setPepTalkState((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  addressedGladiatorIds: [...prev.addressedGladiatorIds, glad.id],
                                  talkOutcomes: { ...prev.talkOutcomes, [glad.id]: { tone: 'THREATEN', ...result } },
                                };
                              });
                              if (result.statusCategory === 'INSPIRED') {
                                gameAudio.playMeleePunch();
                              } else {
                                gameAudio.playSwordClash();
                              }
                            }}
                            className="flex-1 py-1.5 px-2 rounded bg-[#9e4a42] hover:bg-[#6d3947] text-[#ded095] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                            <span>⚡ THREATEN</span>
                            <span className="text-[9px] opacity-80">(Intimidate)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Launch Action Button */}
            <div className="flex items-center justify-between pt-3 border-t border-[#7f644b] flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPepTalkState(null)}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold py-2.5 px-4 rounded-lg transition">
                Return to Staging
              </button>

              <button
                type="button"
                onClick={() => {
                  const state = pepTalkState;
                  if (!state || !state.pendingTier) return;

                  // Apply Pep Talk buffs & threat flags to gladiator instances
                  const updatedGlads = gladiatorsRef.current.map((g) => {
                    const outcome = state.talkOutcomes[g.id];
                    if (!outcome) {
                      return { ...g, pepTalkStatus: undefined, pepTalkThreatened: false };
                    }

                    let status: any = undefined;
                    let threatened = false;

                    if (outcome.outcome === 'Threatened') {
                      threatened = true;
                      status = 'Rage';
                    } else if (outcome.outcome === 'Panic') {
                      status = 'Panic';
                    } else if (outcome.outcome === 'Petulant') {
                      status = 'Petulant';
                    } else if (outcome.outcome === 'Reckless') {
                      status = 'Reckless';
                    } else if (outcome.outcome === 'Inspire') {
                      status = 'Inspire';
                    } else if (outcome.outcome === 'Rage') {
                      status = 'Rage';
                    } else if (outcome.outcome === 'Resolve') {
                      status = 'Resolve';
                    } else if (outcome.outcome === 'Rattled') {
                      status = 'Rattled';
                    } else if (outcome.outcome === 'Hesitant') {
                      status = 'Hesitant';
                    }

                    return recalculateGladiatorStats({
                      ...g,
                      pepTalkStatus: status,
                      pepTalkThreatened: threatened,
                    });
                  });

                  roster.set(updatedGlads);
                  setPepTalkState(null);

                  // Launch combat
                  if (state.pendingTier.id === EMPEROR_DUEL_TIER.id) {
                    launchEmperorDuel(emperorDuelSelectedGladIdRef.current || undefined);
                  } else {
                    launchBattle(state.pendingTier, state.isTrial);
                  }
                }}
                className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-3 px-6 rounded-xl text-sm md:text-base tracking-wide flex items-center justify-center gap-2 transition shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer min-h-[46px]">
                <span>MARCH TO ARENA SANDS ⚔️ ➔</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: LUDUS FACILITY UPGRADES MODAL --- */}
      {isUpgradesModalOpen && (
        <MenuOverlay tone="neutral" zIndex={75} onBackdropClick={() => setIsUpgradesModalOpen(false)}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-2xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] font-serif">
                    LUDUS FACILITY UPGRADES
                  </h3>
                  <span className="text-[11px] text-[#cb9f6b]">
                    Minimalist Antiquity Infrastructure &bull; Camp Enhancements
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpgradesModalOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 mb-4">
              {/* 1. Training Grounds */}
              {(() => {
                const lvl = ludusUpgrades.trainingGrounds;
                const cost = lvl === 0 ? 140 : lvl === 1 ? 280 : lvl === 2 ? 550 : 0;
                const canAfford = gameState.gold >= cost;

                return (
                  <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                    <div>
                      <div className="font-bold text-sm text-[#ded095] flex items-center gap-2">
                        <span>🎯 Training Grounds</span>
                        <span className="text-[10px] text-[#cb9f6b] px-1.5 py-0.2 rounded bg-[#2A1B19] border border-[#7f644b]">
                          Level {toRoman(lvl || 1)} {lvl === 3 ? '(MAX)' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-[#a4968d] mt-1">
                        Increases XP and stat growth rates ({lvl === 0 ? 'Base 100%' : lvl === 1 ? '+25% XP' : lvl === 2 ? '+50% XP' : '+75% XP'}).
                      </p>
                    </div>

                    {lvl < 3 ? (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          if (!canAfford) return;
                          economy.debit(cost);
                          setLudusUpgrades((prev) => ({ ...prev, trainingGrounds: prev.trainingGrounds + 1 }));
                          gameAudio.playLevelUpStinger();
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                          canAfford
                            ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer'
                            : 'bg-[#2A1B19] text-[#817475] border border-[#574b50] cursor-not-allowed'
                        }`}>
                        Upgrade ({cost}G)
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#88997a] px-3 py-1 bg-[#2A1B19] rounded border border-[#55796f]">
                        MAX TIER
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 2. Medical Bay */}
              {(() => {
                const lvl = ludusUpgrades.medicalBay;
                const cost = lvl === 0 ? 120 : lvl === 1 ? 240 : lvl === 2 ? 480 : 0;
                const canAfford = gameState.gold >= cost;

                return (
                  <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                    <div>
                      <div className="font-bold text-sm text-[#ded095] flex items-center gap-2">
                        <span>🌿 Medical Bay</span>
                        <span className="text-[10px] text-[#55796f] px-1.5 py-0.2 rounded bg-[#2A1B19] border border-[#7f644b]">
                          Level {toRoman(lvl || 1)} {lvl === 3 ? '(MAX)' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-[#a4968d] mt-1">
                        Accelerates camp HP recovery ({lvl === 0 ? 'Standard' : lvl === 1 ? '+50% HP regen' : lvl === 2 ? '+100% HP regen' : '+200% HP regen'}) &amp; severe wound protection against permadeath.
                      </p>
                    </div>

                    {lvl < 3 ? (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          if (!canAfford) return;
                          economy.debit(cost);
                          setLudusUpgrades((prev) => ({ ...prev, medicalBay: prev.medicalBay + 1 }));
                          gameAudio.playPowerupChime();
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                          canAfford
                            ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer'
                            : 'bg-[#2A1B19] text-[#817475] border border-[#574b50] cursor-not-allowed'
                        }`}>
                        Upgrade ({cost}G)
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#88997a] px-3 py-1 bg-[#2A1B19] rounded border border-[#55796f]">
                        MAX TIER
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 3. Breeding Pens */}
              {(() => {
                const lvl = ludusUpgrades.breedingPens;
                const cost = lvl === 0 ? 220 : lvl === 1 ? 450 : 0;
                const canAfford = gameState.gold >= cost;

                return (
                  <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                    <div>
                      <div className="font-bold text-sm text-[#ded095] flex items-center gap-2">
                        <span>🧬 Dynasty Breeding Pens</span>
                        <span className="text-[10px] text-[#fbbf24] px-1.5 py-0.2 rounded bg-[#2A1B19] border border-[#7f644b]">
                          {lvl === 0 ? 'LOCKED' : `Level ${toRoman(lvl)}`} {lvl === 2 ? '(MAX)' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-[#a4968d] mt-1">
                        Unlocks retiring veteran champions (Level III+) to produce new generation prodigy offspring with inherited traits and elite baseline stats.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {lvl >= 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUpgradesModalOpen(false);
                            setIsBreedingModalOpen(true);
                            gameAudio.playConfirmSelect();
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-black bg-[#fbbf24] hover:bg-white text-[#2A1B19] transition cursor-pointer shadow">
                          Breeding Pens ➔
                        </button>
                      )}

                      {lvl < 2 && (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => {
                            if (!canAfford) return;
                            economy.debit(cost);
                            setLudusUpgrades((prev) => ({ ...prev, breedingPens: prev.breedingPens + 1 }));
                            gameAudio.playLevelUpStinger();
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                            canAfford
                              ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] cursor-pointer'
                              : 'bg-[#2A1B19] text-[#817475] border border-[#574b50] cursor-not-allowed'
                          }`}>
                          {lvl === 0 ? `Unlock (${cost}G)` : `Upgrade (${cost}G)`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 border-t border-[#7f644b] flex justify-end">
              <button
                type="button"
                onClick={() => setIsUpgradesModalOpen(false)}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold px-4 py-2 rounded-lg border border-[#7f644b]">
                Done
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: DYNASTY BREEDING PENS SYSTEM --- */}
      {isBreedingModalOpen && (
        <MenuOverlay tone="neutral" zIndex={80} onBackdropClick={() => setIsBreedingModalOpen(false)}>
          <div className="relative w-full max-w-xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-2xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] max-h-[92vh] overflow-y-auto">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🧬</span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] font-serif">
                    DYNASTY BREEDING PENS
                  </h3>
                  <span className="text-[11px] text-[#fbbf24]">
                    Breed Veteran Champions (Level III+) for Generation Prodigies
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBreedingModalOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-[#a4968d] mb-3 leading-relaxed">
              Select two veteran champions (Level III+) from your stable. Their prodigy offspring will inherit combined personality traits, elevated baseline attributes, and a unique heritage title.
            </p>

            {/* Parent 1 Selector */}
            <div className="bg-[#3f363b] p-3 rounded-xl border border-[#7f644b] mb-3">
              <span className="text-xs font-bold text-[#cb9f6b] uppercase block mb-1.5">
                Select Parent Champion 1 (Level III+):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {gladiators
                  .filter((g) => g.level >= 3 && g.hp > 0 && g.id !== selectedParent2Id)
                  .map((g) => {
                    const isSelected = selectedParent1Id === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedParent1Id(g.id)}
                        className={`w-full p-2 rounded-lg border text-left flex items-center justify-between gap-2 text-xs transition ${
                          isSelected
                            ? 'bg-[#574b50] border-[#ded095] text-[#ded095]'
                            : 'bg-[#2A1B19] border-[#7f644b] text-[#a4968d] hover:border-[#cb9f6b]'
                        }`}>
                        <div className="flex items-center gap-2">
                          <span>⚔️</span>
                          <span className="font-bold text-[#ded095]">{g.name}</span>
                          <span className="text-[10px] text-[#cb9f6b]">Lvl {toRoman(g.level)} ({g.title})</span>
                        </div>
                        <span className="text-[10px] text-[#ded095] font-mono">
                          STR {g.attributes?.str} &bull; DEX {g.attributes?.dex}
                        </span>
                      </button>
                    );
                  })}
                {gladiators.filter((g) => g.level >= 3 && g.hp > 0).length === 0 && (
                  <p className="text-xs text-[#9e4a42] italic">No Level III+ veterans currently in stable.</p>
                )}
              </div>
            </div>

            {/* Parent 2 Selector */}
            <div className="bg-[#3f363b] p-3 rounded-xl border border-[#7f644b] mb-4">
              <span className="text-xs font-bold text-[#cb9f6b] uppercase block mb-1.5">
                Select Parent Champion 2 (Level III+):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {gladiators
                  .filter((g) => g.level >= 3 && g.hp > 0 && g.id !== selectedParent1Id)
                  .map((g) => {
                    const isSelected = selectedParent2Id === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedParent2Id(g.id)}
                        className={`w-full p-2 rounded-lg border text-left flex items-center justify-between gap-2 text-xs transition ${
                          isSelected
                            ? 'bg-[#574b50] border-[#ded095] text-[#ded095]'
                            : 'bg-[#2A1B19] border-[#7f644b] text-[#a4968d] hover:border-[#cb9f6b]'
                        }`}>
                        <div className="flex items-center gap-2">
                          <span>⚔️</span>
                          <span className="font-bold text-[#ded095]">{g.name}</span>
                          <span className="text-[10px] text-[#cb9f6b]">Lvl {toRoman(g.level)} ({g.title})</span>
                        </div>
                        <span className="text-[10px] text-[#ded095] font-mono">
                          STR {g.attributes?.str} &bull; DEX {g.attributes?.dex}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Breeding Action */}
            <div className="flex items-center justify-between pt-2 border-t border-[#7f644b] gap-3">
              <button
                type="button"
                onClick={() => setIsBreedingModalOpen(false)}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold py-2.5 px-4 rounded-lg transition">
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedParent1Id || !selectedParent2Id || gladiators.filter((g) => g.hp > 0).length >= 10}
                onClick={handleBreedChampions}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition shadow min-h-[46px] ${
                  selectedParent1Id && selectedParent2Id && gladiators.filter((g) => g.hp > 0).length < 10
                    ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer'
                    : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                }`}>
                <span>🧬 BREED PRODIGY CHAMPION ➔</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- MODAL: DYNAMIC CAMP VISITOR INTERACTION --- */}
      {currentVisitor && isVisitorModalOpen && (
        <MenuOverlay tone="neutral" zIndex={85} onBackdropClick={() => setIsVisitorModalOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-2xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095]">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">
                  {currentVisitor.type === 'merchant' ? '🧪' : currentVisitor.type === 'scout' ? '📜' : currentVisitor.type === 'patron' ? '🏛️' : '⚔️'}
                </span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] font-serif">
                    {currentVisitor.name}
                  </h3>
                  <span className="text-[11px] text-[#fbbf24] font-bold">
                    {currentVisitor.title} &bull; Camp Visitor ({Math.ceil(currentVisitor.timer)}s left)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVisitorModalOpen(false)}
                className="text-[#a4968d] hover:text-[#ded095] p-1">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#3f363b] border border-[#7f644b] rounded-xl p-3.5 mb-4 shadow-inner">
              <p className="text-xs sm:text-sm text-[#ded095] italic font-serif leading-relaxed mb-2">
                &ldquo;{currentVisitor.greeting}&rdquo;
              </p>
              <div className="text-xs text-[#cb9f6b] font-bold mt-2 pt-2 border-t border-[#7f644b]/50">
                Offer: {currentVisitor.offerText}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={() => setIsVisitorModalOpen(false)}
                className="bg-[#3f363b] hover:bg-[#574b50] text-[#ded095] text-xs font-bold py-2.5 px-4 rounded-lg transition">
                Decline
              </button>

              <button
                type="button"
                disabled={currentVisitor.cost ? gameState.gold < currentVisitor.cost : false}
                onClick={() => {
                  const v = currentVisitor;
                  if (v.cost) {
                    if (gameState.gold < v.cost) return;
                    economy.debit(v.cost!);
                  }
                  if (v.reward) {
                    economy.credit(v.reward!);
                  }
                  if (v.attributeBoost) {
                    const b = v.attributeBoost;
                    const next = gladiatorsRef.current.map((g) => {
                      const attrs = g.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
                      const updatedA = { ...attrs, [b.type]: (attrs as any)[b.type] + b.val };
                      if (b.type === 'vit') updatedA.con = updatedA.vit;
                      return recalculateGladiatorStats({
                        ...g,
                        attributes: updatedA,
                      });
                    });
                    roster.set(next);
                  }
                  if (v.scoutRecruit) {
                    recruitGladiator(v.scoutRecruit);
                  }

                  setIsVisitorModalOpen(false);
                  setCurrentVisitor(null);
                  gameAudio.playPowerupChime();
                  addCombatLog(`🤝 Concluded agreement with ${v.name}: ${v.offerText}`, 'player');
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition shadow min-h-[46px] ${
                  !currentVisitor.cost || gameState.gold >= currentVisitor.cost
                    ? 'bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer'
                    : 'bg-[#574b50] text-[#817475] cursor-not-allowed'
                }`}>
                <span>ACCEPT PROPOSITION ➔</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- START TITLE OVERLAY --- */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={80}>
          <div className="relative w-full max-w-md bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-6 md:p-8 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col items-center">
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

            <div className="flex items-center gap-2 text-[#ded095] mb-2">
              <Trophy size={36} />
            </div>
            <span
              style={{
                color: '#F7DEAA',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                letterSpacing: '0.22em',
              }}
              className="text-xs uppercase font-black mb-1 font-serif tracking-widest">
              BLOOD AND GOLD
            </span>
            <h1 className="text-3xl md:text-4xl font-black mb-2 text-[#ded095] text-center tracking-wider font-serif">
              GLADIATOR MANAGER
            </h1>
            <p className="text-[#a4968d] text-center text-xs md:text-sm mb-6 leading-relaxed">
              Deploy multi-fighter squads into real-time coliseum skirmishes. Master AI psychology,
              manage combat stamina, execute devastating pins, and conquer the grand arena!
            </p>

            {hasExistingSave ? (
              <div className="w-full flex flex-col gap-2.5">
                <button
                  ref={startBtnRef}
                  onClick={() => {
                    const ok = restoreSavedGame();
                    if (!ok) initGame();
                    else gameAudio.playConfirmSelect();
                  }}
                  autoFocus
                  className="w-full bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] px-6 py-3 rounded-full font-black text-base md:text-lg transition-colors flex items-center justify-center gap-2 shadow-lg min-w-[48px] min-h-[48px] cursor-pointer">
                  <Play size={20} />
                  <span>RESUME CAMPAIGN (DAY {dayCounter})</span>
                </button>

                <button
                  onClick={initGame}
                  className="w-full bg-[#3f363b] hover:bg-[#574b50] border border-[#7f644b] text-[#ded095] px-6 py-2.5 rounded-full font-bold text-xs md:text-sm transition-colors flex items-center justify-center gap-2 min-w-[48px] min-h-[40px] cursor-pointer">
                  <RotateCw size={16} />
                  <span>START NEW CAMPAIGN</span>
                </button>
              </div>
            ) : (
              <button
                ref={startBtnRef}
                onClick={initGame}
                autoFocus
                className="w-full bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] px-6 py-3 rounded-full font-bold text-base md:text-lg transition-colors flex items-center justify-center gap-2 shadow-lg min-w-[48px] min-h-[48px] cursor-pointer">
                <Play size={20} />
                <span>ENTER THE LUDUS</span>
              </button>
            )}
          </div>
        </MenuOverlay>
      )}

      {/* --- GAME OVER OVERLAY --- */}
      {gameState.status === 'GAME_OVER' && (
        <Overlay
          title="LUDUS RUINED"
          description={`Your stable has fallen and treasury collapsed. Final Gold: ${gameState.gold}`}
          actionLabel="TRY AGAIN"
          onAction={initGame}
          icon={<RotateCw size={24} />}
          tone="danger"
        />
      )}

      {/* --- MODAL: HERO ARRIVAL HEAR TALE LORE MODAL --- */}
      {heroArrivalModal && (
        <MenuOverlay tone="neutral" zIndex={85} onBackdropClick={dismissHeroArrival}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-5 md:p-6 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-[#ded095] animate-fadeIn">
            {/* Pixel Corner Rivets */}
            <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black pointer-events-none" />

            {/* Header with Red Accent Nameplate */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#7f644b] mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">📜</span>
                <div>
                  <div className="text-[10px] tracking-widest uppercase text-[#cb9f6b] font-bold">
                    HERO ARRIVAL &bull; HEAR TALE
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-[#ded095] font-serif tracking-wide">
                    {heroArrivalModal.speaker.toUpperCase()}
                  </h3>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#9e4a42] text-white border border-[#ba7654]">
                LEGENDARY HERO
              </span>
            </div>

            {/* Hero Card & Lore Monologue with 32x32 Pixel Portrait */}
            <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-inner">
              <div className="w-20 h-20 shrink-0 bg-[#2A1B19] border-2 border-[#9c8053] rounded-lg p-1 overflow-hidden shadow-lg">
                <img
                  src={getPortraitDataUrl(
                    heroArrivalModal.hero.culture,
                    80,
                    false,
                    undefined,
                    heroArrivalModal.hero.level,
                    false,
                    heroArrivalModal.hero.heroType,
                    heroArrivalModal.hero.gladiatorClass,
                  )}
                  alt={heroArrivalModal.speaker}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-[#cb9f6b] mb-1">
                  {heroArrivalModal.title} &bull; Joined the Ludus
                </div>
                <p className="text-xs sm:text-sm text-[#ded095] font-serif italic leading-relaxed">
                  &ldquo;{heroArrivalModal.tale.slice(0, heroArrivalModal.charCount)}&rdquo;
                  {!heroArrivalModal.isDone && (
                    <span className="inline-block w-1.5 h-3.5 bg-[#cb9f6b] ml-1 animate-pulse align-middle" />
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons: [CONTINUE] / [SPACE] */}
            <div className="flex justify-end pt-2 border-t border-[#7f644b]">
              <button
                type="button"
                onClick={dismissHeroArrival}
                className="w-full sm:w-auto bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] font-black py-2.5 px-6 rounded-lg text-xs md:text-sm transition flex items-center justify-center gap-2 shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] cursor-pointer min-h-[40px]">
                <span>{heroArrivalModal.isDone ? 'CONTINUE [SPACE] ➔' : 'FAST-FORWARD [SPACE] ⏩'}</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* --- GRAND VICTORY SCREEN / CINEMATIC ENDING: WINNING THE SLAVE REVOLT --- */}
      {gameState.status === 'VICTORY' && (
        <MenuOverlay tone="victory" zIndex={90}>
          <div className="relative w-full max-w-2xl bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-2xl p-6 md:p-8 shadow-[0_16px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col text-center text-[#ded095] animate-fadeIn max-h-[92vh] overflow-y-auto">
            {/* Pixel Corner Rivets */}
            <span className="absolute top-1 left-1 w-3 h-3 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 left-1 w-3 h-3 bg-[#ded095] border border-black pointer-events-none" />
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-[#ded095] border border-black pointer-events-none" />

            {/* Grand Triumph Laurel Icon Header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl animate-bounce">🔥</span>
              <Trophy size={42} className="text-[#ded095] animate-pulse" />
              <span className="text-4xl animate-bounce">🏛️</span>
            </div>

            <span className="text-xs uppercase tracking-widest font-black text-[#cb9f6b] mb-1 font-serif">
              TRIUMPH OF THE OPPRESSED &bull; THE CHAINS ARE BROKEN
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 text-[#ded095] tracking-wide font-serif leading-tight">
              ROME IS LIBERATED — THE CHAINS ARE BROKEN!
            </h1>

            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#ded095] to-transparent mx-auto mb-4" />

            {/* Campaign Chronicles Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-center">
              <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-2.5 shadow-md">
                <span className="text-[10px] text-[#a4968d] uppercase font-bold tracking-wider block">
                  Gladiators Recruited
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#ded095] font-serif">
                  {totalRecruited}
                </span>
              </div>

              <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-2.5 shadow-md">
                <span className="text-[10px] text-[#a4968d] uppercase font-bold tracking-wider block">
                  Battles Won
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#88997a] font-serif">
                  {totalBattlesWon}
                </span>
              </div>

              <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-2.5 shadow-md">
                <span className="text-[10px] text-[#a4968d] uppercase font-bold tracking-wider block">
                  Fallen Remembered
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#9e4a42] font-serif">
                  {memorialGraves.length}
                </span>
              </div>

              <div className="bg-[#3f363b] border-2 border-[#7f644b] rounded-xl p-2.5 shadow-md">
                <span className="text-[10px] text-[#a4968d] uppercase font-bold tracking-wider block">
                  Gold Liberated
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#cb9f6b] font-serif">
                  {gameState.gold}G
                </span>
              </div>
            </div>

            {/* Fallen Heroes Remembered Tribute (if any memorials exist) */}
            {memorialGraves.length > 0 && (
              <div className="bg-[#3f363b]/70 border border-[#7f644b] rounded-xl p-3 mb-4 text-left">
                <div className="text-[11px] font-bold text-[#cb9f6b] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🪦 Fallen Champions In Memoriam ({memorialGraves.length}):</span>
                </div>
                <div className="text-xs text-[#ded095] italic leading-relaxed flex flex-wrap gap-2">
                  {memorialGraves.map((g) => (
                    <span key={g.id} className="bg-[#2A1B19] px-2 py-0.5 rounded border border-[#7f644b]/80">
                      {g.name} ({CULTURE_LABELS[g.culture].split(' ')[0]})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* "Triumph of the Oppressed" Epilogue Text */}
            <div className="bg-[#3f363b] border-2 border-[#9c8053] rounded-xl p-4 sm:p-5 mb-6 text-left shadow-inner">
              <h4 className="font-serif font-black text-xs sm:text-sm text-[#cb9f6b] uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>📜</span>
                <span>EPILOGUE: TRIUMPH OF THE OPPRESSED</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#ded095] font-serif italic leading-relaxed mb-3">
                &ldquo;The iron chains forged by imperial decrees lie shattered upon the Roman cobbles. Slaves and gladiators march shoulder to shoulder through the burning arches of the Forum. The ludus is no longer a cage of blood, but a sanctuary of legend. Across the provinces, from Britannia to the sands of Numidia, the oppressed rise in eternal glory.&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-[#cb9f6b] font-serif font-bold leading-relaxed">
                The Emperor has fallen, the Praetorian legions are shattered, and your champions stand triumphant before the eternal city. Freedom reigns eternal!
              </p>
            </div>

            {/* Replay / Play Again Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={initGame}
                className="w-full bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] py-3.5 px-8 rounded-full font-black text-sm sm:text-base tracking-wider uppercase transition flex items-center justify-center gap-2.5 shadow-[inset_-2px_-2px_0px_#2a2428,inset_2px_2px_0px_#ded095] hover:scale-105 active:scale-95 cursor-pointer min-h-[48px]">
                <RotateCw size={20} />
                <span>BEGIN A NEW DYNASTY / REPLAY CAMPAIGN</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}
    </div>
  );
}
// TEST_END_CHECK_FOUND
// FOUND_CRLF


