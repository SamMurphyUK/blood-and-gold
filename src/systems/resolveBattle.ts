// Stage 3B: the single end-of-battle entry point.
// resolveBattle(view, outcome) replaces finishSandboxDuelInternal and finishDuelInternal. The two bodies below are
// the old callback bodies moved verbatim; they read App()'s refs/state/setters through a BattleView that App builds
// each render. App wraps this in one useCallback with the old finishDuelInternal dependency list, so the
// stale-closure behaviour of the duel path (it never saw fresh ludusUpgrades / managerRenown) is unchanged.

import type {Dispatch, MutableRefObject, SetStateAction} from 'react';
import type {GameState} from '../../utils/helper';
import {getConfig} from '../../constants';
import {gameAudio} from '../../utils/helper';
import {BATTLE_TIERS} from '../data/battleTiers';
import {INITIAL_GLADIATORS} from '../data/gladiators';
import {HERO_BEASTMASTER, HERO_SALADIN, HERO_ZUZUBU} from '../data/heroes';
import {WEAPON_DATABASE} from '../data/weapons';
import {recalculateGladiatorStats} from '../logic/gladiatorStats';
import {getPodiumCountdownMultiplier, isSpecialNarrativeQuest} from '../logic/tiers';
import type {AftermathData, ArenaFighter, BattleTier, BattlefieldLootState, BondShiftRecord, Culture, Gladiator, PartyMemberPostBattle, WeaponDef} from '../types';
import type {BattleOutcome, UpdateView} from './view';

export interface BattleView
  extends Pick<
    UpdateView,
    | 'gladiatorsRef'
    | 'arenaFightersRef'
    | 'roster'
    | 'combatOutcomeRef'
    | 'totalBattlesWonRef'
    | 'activeTierRef'
    | 'gladiatorBondsRef'
    | 'ludusUpgrades'
    | 'economy'
    | 'unlockedTierIndex'
    | 'merchantStateRef'
    | 'setMerchantState'
    | 'firstBattleDoneRef'
    | 'pendingPostBattleTutorialRef'
    | 'heraldTimerRef'
    | 'unlockedTierIndexRef'
    | 'gameStateRef'
  > {
  readonly lastDeployedGladIdsRef: MutableRefObject<string[]>;
  readonly setAftermathData: Dispatch<SetStateAction<AftermathData | null>>;
  readonly setCombatOutcome: Dispatch<SetStateAction<'in_progress' | 'victory' | 'defeat'>>;
  readonly setTotalBattlesWon: Dispatch<SetStateAction<number>>;
  readonly setGameState: Dispatch<SetStateAction<GameState>>;
  readonly selectedGladiatorIds: string[];
  readonly lowestHpPctRef: MutableRefObject<Record<string, number>>;
  readonly setGladiatorBonds: Dispatch<SetStateAction<Record<string, number>>>;
  readonly battleRageEventsRef: MutableRefObject<{ fallenName: string; survivorName: string }[]>;
  readonly unbondedDeathsRef: MutableRefObject<string[]>;
  readonly recordGladiatorDeath: (deadGlad: Gladiator) => void;
  readonly triggerHeroArrival: (hero: Gladiator) => void;
  readonly setBattlefieldLoot: Dispatch<SetStateAction<BattlefieldLootState | null>>;
  readonly setUnlockedTierIndex: Dispatch<SetStateAction<number>>;
  readonly setIsColiseumChampion: Dispatch<SetStateAction<boolean>>;
  readonly setIsEmperorEnraged: Dispatch<SetStateAction<boolean>>;
  readonly isEmperorEnragedRef: MutableRefObject<boolean>;
  readonly pendingPostFifthDialogueRef: MutableRefObject<boolean>;
  readonly setManagerRenown: Dispatch<SetStateAction<number>>;
  readonly setSpeechcraftLevel: Dispatch<SetStateAction<number>>;
  readonly managerRenown: number;
  readonly setIsEmperorDefeated: Dispatch<SetStateAction<boolean>>;
  readonly isEmperorDefeatedRef: MutableRefObject<boolean>;
  readonly setIsRevoltUnlocked: Dispatch<SetStateAction<boolean>>;
  readonly isRevoltUnlockedRef: MutableRefObject<boolean>;
  readonly setSideSkirmishes: Dispatch<SetStateAction<BattleTier[]>>;
  readonly generateSideSkirmishes: (podiumTier?: number, forceFortified?: boolean, currentGladiators?: Gladiator[]) => BattleTier[];
  readonly setFirstBattleDone: Dispatch<SetStateAction<boolean>>;
  readonly setFreeRecruitCultures: Dispatch<SetStateAction<Culture[]>>;
  readonly freeRecruitCulturesRef: MutableRefObject<Culture[]>;
  readonly triggerAutosave: (incrementDay?: any) => void;
}

function resolveSandboxBattle(view: BattleView, isVictory: boolean): void {
  const {
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
  } = view;

  const allGlads = gladiatorsRef.current;
  const fighters = arenaFightersRef.current;
  const survivingGlads = allGlads.map((g) => {
    const matchFighter = fighters.find((f) => f.sourceGladiatorId === g.id);
    if (!matchFighter) return g;
    return {
      ...g,
      hp: Math.max(1, Math.round(matchFighter.hp)),
    };
  });
  roster.set(survivingGlads);

  const narratives = isVictory
    ? [
        'The slave uprising overwhelmed the Roman legionaries in the burning streets!',
        'Rebel banners flew high above the ruined Roman gate. Rome has been seized!',
      ]
    : [
        'The disciplined legionary formation held fast against the unarmored slave charge.',
        'The uprising was quelled as Roman reinforcements cordoned off the gate.',
      ];

  const deployedGladIds = lastDeployedGladIdsRef.current;
  const partyMembers: PartyMemberPostBattle[] = deployedGladIds.map((gladId) => {
    const g = allGlads.find((x) => x.id === gladId) || allGlads[0];
    const matchFighter = fighters.find((f) => f.sourceGladiatorId === gladId);
    return {
      id: g.id,
      name: g.name,
      culture: g.culture,
      title: g.title,
      startLevel: g.level,
      endLevel: g.level,
      startXp: g.xp,
      endXp: g.xp,
      xpNeeded: g.xpNeeded,
      xpGained: isVictory ? 100 : 0,
      startBondPips: 5,
      endBondPips: 5,
      didLevelUp: false,
      hpRemaining: matchFighter ? Math.max(1, Math.round(matchFighter.hp)) : g.hp,
      maxHp: g.maxHp,
      heroType: g.heroType,
      gladiatorClass: g.gladiatorClass,
    };
  });

  setAftermathData({
    isVictory,
    isTrial: false,
    tierName: 'Rome in Flames (The Revolt to Seize Rome)',
    goldEarned: isVictory ? 240 : 0,
    narratives,
    bondShifts: [],
    partyMembers,
  });

  if (isVictory) {
    setCombatOutcome('victory');
    combatOutcomeRef.current = 'victory';
    setTotalBattlesWon((prev) => prev + 1);
    totalBattlesWonRef.current += 1;
    setGameState((prev) => ({
      ...prev,
      status: 'VICTORY',
      score: prev.score + 5000,
    }));
    gameAudio.playVictoryFanfare();
  } else {
    setCombatOutcome('defeat');
    combatOutcomeRef.current = 'defeat';
    gameAudio.playDefeatMotif();
  }
}

// Internal Conclude Duel & Apply Persistent Health / Rewards / Bond Shifts / Aftermath
function resolveDuelBattle(
  view: BattleView,
  isVictory: boolean,
  verdict: 'thumbs_up' | 'thumbs_down',
  isTrial: boolean,
): void {
  const {
    activeTierRef,
    arenaFightersRef,
    gladiatorsRef,
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
    roster,
    setBattlefieldLoot,
    setUnlockedTierIndex,
    setIsColiseumChampion,
    setIsEmperorEnraged,
    isEmperorEnragedRef,
    pendingPostFifthDialogueRef,
    setTotalBattlesWon,
    totalBattlesWonRef,
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
    setAftermathData,
    setCombatOutcome,
    combatOutcomeRef,
    firstBattleDoneRef,
    setFirstBattleDone,
    pendingPostBattleTutorialRef,
    setFreeRecruitCultures,
    freeRecruitCulturesRef,
    heraldTimerRef,
    unlockedTierIndexRef,
    gameStateRef,
    setGameState,
    triggerAutosave,
    generateSideSkirmishes,
  } = view;

  const tier = activeTierRef.current;
  const fighters = arenaFightersRef.current;
  const allGlads = gladiatorsRef.current;

  // Identify surviving and near-death deployed gladiators
  const deployedGladIds = selectedGladiatorIds.filter((id) =>
    allGlads.some((g) => g.id === id),
  );

  // Downed gladiators logic:
  // In Hero recruitment / side-quest battles, all deaths are strictly PERMANENT.
  // Downed gladiators NEVER survive with 1 HP in hero side quests / side-skirmishes!
  const isHeroOrSideQuest = !isTrial || !!tier?.heroReward || !!tier?.isFortifiedQuest || isSpecialNarrativeQuest(tier);
  if (verdict === 'thumbs_up' && !isHeroOrSideQuest) {
    fighters.forEach((f) => {
      if (f.isPlayerTeam && f.sourceGladiatorId && f.hp <= 0) {
        f.hp = 1;
        f.state = 'idle';
      }
    });
  }

  const survivingDeployedGlads = allGlads.filter((g) => {
    if (!deployedGladIds.includes(g.id)) return false;
    const fighter = fighters.find((f) => f.sourceGladiatorId === g.id);
    return fighter && fighter.hp > 0;
  });
  const survivingDeployedIds = survivingDeployedGlads.map((g) => g.id);

  // Check near-death survivors (<25% HP at any point during combat)
  const nearDeathSurvivorIds = survivingDeployedIds.filter((id) => {
    const minPct = lowestHpPctRef.current[id] ?? 1;
    return minPct <= 0.25;
  });

  // Compute pairwise bond shifts
  const newBonds = {...gladiatorBondsRef.current};
  const bondShifts: BondShiftRecord[] = [];
  const narratives: string[] = [];

  // 1. Bond Shifts across all pairs
  for (let i = 0; i < allGlads.length; i++) {
    for (let j = i + 1; j < allGlads.length; j++) {
      const g1 = allGlads[i];
      const g2 = allGlads[j];
      const pairKey = [g1.id, g2.id].sort().join('__');
      const currentScore = newBonds[pairKey] ?? 15;
      let delta = 0;
      let reason = '';

      const bothDeployedAndAlive =
        survivingDeployedIds.includes(g1.id) && survivingDeployedIds.includes(g2.id);

      if (bothDeployedAndAlive) {
        // Winning a match together gives +8 bond increase
        if (isVictory) {
          delta += 8;
          reason = 'Victory squadmates (+8)';
        }
        // Near-death survival: +12 bond if either/both survived grievous wounds
        if (nearDeathSurvivorIds.includes(g1.id) || nearDeathSurvivorIds.includes(g2.id)) {
          delta += 12;
          reason = reason ? `${reason} & Forged in blood (+12)` : 'Forged in blood (+12)';
        }
      } else {
        // Bond decays slightly (-2) each match for gladiator pairs that did not participate together
        const neitherDeployed =
          !deployedGladIds.includes(g1.id) && !deployedGladIds.includes(g2.id);
        const onlyOneDeployed =
          (deployedGladIds.includes(g1.id) && !deployedGladIds.includes(g2.id)) ||
          (!deployedGladIds.includes(g1.id) && deployedGladIds.includes(g2.id));

        if (neitherDeployed || onlyOneDeployed) {
          delta = -2;
          reason = 'Idle camp detachment (-2)';
        }
      }

      if (delta !== 0) {
        const updatedScore = Math.max(0, Math.min(100, currentScore + delta));
        newBonds[pairKey] = updatedScore;
        bondShifts.push({
          pairKey,
          glad1Name: g1.name,
          glad2Name: g2.name,
          delta,
          newScore: updatedScore,
          reason,
        });
      }
    }
  }

  setGladiatorBonds(newBonds);

  // 2. Generate atmospheric Post-Battle Narrative Derived from Battle Events
  // Low health survival narratives
  nearDeathSurvivorIds.forEach((id) => {
    const survivor = allGlads.find((g) => g.id === id);
    if (survivor) {
      narratives.push(
        `Seeing ${survivor.name} fight through grievous wounds and survive forged a deeper bond with their squadmates (+12 Bond).`,
      );
    }
  });

  // Bonded death & rage narratives
  battleRageEventsRef.current.forEach((evt) => {
    narratives.push(
      `The death of ${evt.fallenName} shattered ${evt.survivorName}'s composure, triggering a blinding blood rage that will haunt the ludus forever.`,
    );
  });

  // Unbonded death narratives
  unbondedDeathsRef.current.forEach((fallenName) => {
    narratives.push(
      `The death of ${fallenName} was met with cold silence—the detachment weighed heavily on the camp.`,
    );
  });

  // Verdict narrative for Emperor's Judgment / Quest Mortality
  if (!isHeroOrSideQuest) {
    if (verdict === 'thumbs_up') {
      narratives.push(
        `The Emperor extended his thumb UP in royal clemency! Downed gladiators survived with 1 HP.`,
      );
    } else if (verdict === 'thumbs_down') {
      narratives.push(
        `The Emperor extended his thumb DOWN in merciless judgment! Fallen warriors were permanently executed.`,
      );
    }
  } else {
    const downedInQuest = fighters.filter(
      (f) => f.isPlayerTeam && f.sourceGladiatorId && f.hp <= 0,
    );
    if (downedInQuest.length > 0) {
      narratives.push(
        `All casualties sustained during this expedition are permanent. The fallen have been laid to rest at the camp memorial wall.`,
      );
    }
  }

  // Victory bond boost narrative
  if (isVictory && survivingDeployedGlads.length >= 2) {
    const squadNames = survivingDeployedGlads.map((g) => g.name).join(' & ');
    narratives.push(
      `Fighting shoulder-to-shoulder in the sands of victory tightened the camaraderie between ${squadNames} (+8 Bond).`,
    );
  } else if (!isVictory && narratives.length === 0) {
    narratives.push(
      'Defeat scarred the arena sands. The fallen and wounded were dragged back to camp to nurse their injuries in silent contemplation.',
    );
  }

  // Check for fallen / executed gladiators to erect cultural memorial graves and remove from roster
  fighters.forEach((f) => {
    if (f.isPlayerTeam && f.sourceGladiatorId && (f.hp <= 0 || f.isDead || f.state === 'death')) {
      const deadGlad = allGlads.find((g) => g.id === f.sourceGladiatorId);
      if (deadGlad) {
        recordGladiatorDeath(deadGlad);
      }
    }
  });

  // Sync persistent HP and XP back to camp gladiators (Permadeath Cap: dead gladiators omitted to free roster slots)
  const survivingGlads: Gladiator[] = [];
  for (const g of allGlads) {
    const matchFighter = fighters.find((f) => f.sourceGladiatorId === g.id);
    if (!matchFighter) {
      if (g.status === 'In Arena') {
        survivingGlads.push({ ...g, status: 'Available' as const });
      } else {
        survivingGlads.push(g);
      }
      continue;
    }

    // If HP <= 0, permanently deceased - do not add back to roster!
    if (matchFighter.hp <= 0 || matchFighter.isDead || matchFighter.state === 'death') {
      continue;
    }

    if (isVictory) {
      const currentTierIdx = tier ? BATTLE_TIERS.findIndex((t) => t.id === tier.id) : 0;
      const trainingMult = 1 + (ludusUpgrades.trainingGrounds * 0.25);
      // Reduce leveling XP gain by 20% (multiplier 0.8)
      const xpGained = Math.round((60 + Math.max(0, currentTierIdx) * 35) * trainingMult * 0.8);
      const newXp = g.xp + xpGained;
      let lvl = g.level;
      let needed = g.xpNeeded;
      let curAttrs = g.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };

      if (newXp >= needed && lvl < 5) {
        lvl += 1; // Max Level V
        needed = Math.floor(needed * 1.5);
        gameAudio.playLevelUpStinger();

        // Archetype / Cultural stat growth increases (+1 to +2 across STR, DEX, VIT)
        const strGain = (g.culture === 'celt' || g.culture === 'hunnic' || g.weightClass === 'Heavyweight' || g.weightClass === 'Colossal' || g.isCavalry || g.isElephant) ? 2 : 1;
        const dexGain = (g.culture === 'berber' || g.culture === 'scythian' || g.weightClass === 'Lightweight' || (g.isCavalry && !g.isElephant)) ? 2 : 1;
        const vitGain = (g.culture === 'roman' || g.weightClass === 'Heavyweight' || g.weightClass === 'Colossal' || g.isElephant) ? 2 : 1;

        curAttrs = {
          ...curAttrs,
          str: (curAttrs.str ?? 10) + strGain,
          dex: (curAttrs.dex ?? 10) + dexGain,
          vit: (curAttrs.vit ?? curAttrs.con ?? 10) + vitGain,
          con: (curAttrs.vit ?? curAttrs.con ?? 10) + vitGain,
        };
      }

      const updatedGlad: Gladiator = recalculateGladiatorStats({
        ...g,
        status: 'Available',
        hp: Math.max(1, Math.round(matchFighter.hp)),
        kills: g.kills + 1,
        level: lvl,
        xp: lvl >= 5 ? 0 : newXp % needed,
        xpNeeded: needed,
        attributes: curAttrs,
        pepTalkStatus: undefined,
        pepTalkThreatened: false,
      });

      survivingGlads.push(updatedGlad);
    } else {
      // If gladiator was threatened and failed the bout, enforce execution
      if (matchFighter.pepTalkThreatened) {
        recordGladiatorDeath(g);
        narratives.push(
          `⚡ Contractually bound by the Threaten decree, ${g.name} was permanently dismissed/executed following defeat!`,
        );
      } else {
        survivingGlads.push({
          ...g,
          status: 'Available' as const,
          hp: Math.max(1, Math.round(matchFighter.hp)),
          pepTalkStatus: undefined,
          pepTalkThreatened: false,
        });
      }
    }
  }

  // 2.5 AWARD UNIQUE LEGENDARY HEROES ON FORTIFIED QUEST VICTORY
  if (isVictory && tier?.heroReward) {
    const rewardHeroType = tier.heroReward;
    const alreadyHasHero = survivingGlads.some((g) => g.heroType === rewardHeroType);
    if (!alreadyHasHero && survivingGlads.length < 10) {
      let heroToAdd: Gladiator | null = null;
      if (rewardHeroType === 'beastmaster') heroToAdd = { ...HERO_BEASTMASTER, id: `hero_beastmaster_${Date.now()}` };
      else if (rewardHeroType === 'saladin') heroToAdd = { ...HERO_SALADIN, id: `hero_saladin_${Date.now()}` };
      else if (rewardHeroType === 'zuzubu') heroToAdd = { ...HERO_ZUZUBU, id: `hero_zuzubu_${Date.now()}` };

      if (heroToAdd) {
        heroToAdd = recalculateGladiatorStats({
          ...heroToAdd,
          x: -30,
          y: 115,
          targetX: 110 + Math.random() * 50,
          targetY: 110 + Math.random() * 25,
          state: 'walking',
          targetActivity: 'idle',
          isWalkingIn: true,
          flipX: false,
        });
        survivingGlads.push(heroToAdd);
        narratives.push(
          `🏆 LEGENDARY HERO UNLOCKED: ${heroToAdd.name} (${heroToAdd.title}) was so impressed by your victory that they have joined your Ludus!`,
        );
        triggerHeroArrival(heroToAdd);
        gameAudio.playPowerupChime();
      }
    } else if (!alreadyHasHero && survivingGlads.length >= 10) {
      narratives.push(
        `A legendary hero offered their allegiance, but your stable was full (10/10). They bestowed an honorary tribute of +400 Gold!`,
      );
      economy.credit(400);
    }
  }

  roster.set(survivingGlads);

  // 3. Battlefield Salvage on Victory (Even if Survivors):
  // For each defeated enemy, roll a 25% chance to scavenge a battlefield loot item scaled to that enemy's level!
  // (Also retain 50% salvage chance when warrior executions occur)
  const anyPlayerExecuted = fighters.some(
    (f) => f.isPlayerTeam && f.sourceGladiatorId && f.hp <= 0,
  );
  const anyEnemyExecuted = fighters.some(
    (f) => !f.isPlayerTeam && f.hp <= 0,
  );
  const warriorExecutionOccurred = verdict === 'thumbs_down' && (anyPlayerExecuted || anyEnemyExecuted);

  let lootDroppedFromEnemy: ArenaFighter | null = null;
  const defeatedEnemies = fighters.filter((f) => !f.isPlayerTeam && f.hp <= 0);
  const allEnemies = fighters.filter((f) => !f.isPlayerTeam);

  if (isVictory) {
    // Roll 25% chance per defeated enemy
    for (const defEnemy of defeatedEnemies) {
      if (Math.random() < 0.25) {
        lootDroppedFromEnemy = defEnemy;
        break;
      }
    }
  }

  if (!lootDroppedFromEnemy && warriorExecutionOccurred && Math.random() < 0.50) {
    lootDroppedFromEnemy =
      defeatedEnemies.length > 0
        ? defeatedEnemies[Math.floor(Math.random() * defeatedEnemies.length)]
        : allEnemies[0] || null;
  }

  if (lootDroppedFromEnemy) {
    const livingPlayerGlads = survivingGlads.filter((g) => g.hp > 0);
    if (livingPlayerGlads.length > 0) {
      const lootEnemy = lootDroppedFromEnemy;
      const enemyLevel = lootEnemy ? lootEnemy.level : 1;
      const enemyName = lootEnemy ? lootEnemy.name : 'Fallen Champion';

      let poolWeapons: WeaponDef[] = [];
      if (enemyLevel <= 2) {
        poolWeapons = Object.values(WEAPON_DATABASE).filter((w) => w.tier === 1 && !w.isExotic);
      } else if (enemyLevel <= 4) {
        poolWeapons = Object.values(WEAPON_DATABASE).filter((w) => w.tier === 2 && !w.isExotic);
      } else {
        // Level 5+: Tier 3 or Caravan relic
        poolWeapons = Object.values(WEAPON_DATABASE).filter((w) => w.tier === 3);
      }

      // Match one of the surviving gladiators
      let candidateGlad = livingPlayerGlads.find((g) => !g.equipped.rightHand || !g.equipped.leftHand);
      if (!candidateGlad) {
        candidateGlad = livingPlayerGlads.find((g) => {
          const rW = g.equipped.rightHand ? WEAPON_DATABASE[g.equipped.rightHand] : null;
          const lW = g.equipped.leftHand ? WEAPON_DATABASE[g.equipped.leftHand] : null;
          const curTier = enemyLevel <= 2 ? 1 : enemyLevel <= 4 ? 2 : 3;
          return (rW && rW.tier < curTier) || (lW && lW.tier < curTier);
        });
      }
      if (!candidateGlad) {
        candidateGlad = livingPlayerGlads[Math.floor(Math.random() * livingPlayerGlads.length)];
      }

      let matchingPool: WeaponDef[] = [];
      if (candidateGlad.equipped.leftHand === null && candidateGlad.equipped.rightHand !== null) {
        matchingPool = poolWeapons.filter((w) => w.slotType === 'LEFT');
      } else if (candidateGlad.equipped.rightHand === null && candidateGlad.equipped.leftHand !== null) {
        matchingPool = poolWeapons.filter((w) => w.slotType === 'RIGHT' || w.slotType === 'BOTH');
      } else if (candidateGlad.equipped.rightHand === null && candidateGlad.equipped.leftHand === null) {
        matchingPool = poolWeapons;
      } else {
        const rW = candidateGlad.equipped.rightHand ? WEAPON_DATABASE[candidateGlad.equipped.rightHand] : null;
        const lW = candidateGlad.equipped.leftHand ? WEAPON_DATABASE[candidateGlad.equipped.leftHand] : null;
        if (rW && rW.tier < 3) {
          matchingPool = poolWeapons.filter((w) => w.slotType === 'RIGHT' || w.slotType === 'BOTH');
        } else if (lW && lW.tier < 3) {
          matchingPool = poolWeapons.filter((w) => w.slotType === 'LEFT');
        }
      }

      if (matchingPool.length === 0) {
        matchingPool = poolWeapons;
      }

      const chosenWeapon =
        matchingPool[Math.floor(Math.random() * matchingPool.length)] || poolWeapons[0];

      if (chosenWeapon) {
        setBattlefieldLoot({
          enemyName,
          item: chosenWeapon,
          targetGladId: candidateGlad.id,
          targetGladName: candidateGlad.name,
        });
        gameAudio.playPowerupChime();
      }
    }
  }

  let wonGold = isVictory ? (tier?.goldReward || 120) : 0;
  const hasCrowdPleaser = survivingDeployedGlads.some((g) => g.traits?.includes('Crowd Pleaser'));
  if (isVictory && hasCrowdPleaser) {
    const crowdBonus = Math.round(wonGold * 0.25);
    wonGold += crowdBonus;
    narratives.push(
      `👑 CROWD PLEASER BONUS: The roaring crowd rained +${crowdBonus} extra gold upon the sand for theatrical finishing blows!`,
    );
  }

  // Advance Five-Tier Coliseum Progression ONLY if winning an official Coliseum Trial
  let currentTierIdx = 0;
  if (isVictory && isTrial && tier) {
    currentTierIdx = BATTLE_TIERS.findIndex((t) => t.id === tier.id);
    if (currentTierIdx >= 0) {
      setUnlockedTierIndex((prev) => Math.max(prev, currentTierIdx + 1));
      if (currentTierIdx === 4) {
        setIsColiseumChampion(true);
        setIsEmperorEnraged(true);
        isEmperorEnragedRef.current = true;
        pendingPostFifthDialogueRef.current = true;
      }
    }
  } else if (tier) {
    currentTierIdx = BATTLE_TIERS.findIndex((t) => t.id === tier.id);
  }

  if (isVictory) {
    setTotalBattlesWon((prev) => prev + 1);
    totalBattlesWonRef.current += 1;
    const renownGain = hasCrowdPleaser ? 35 : 25;
    setManagerRenown((prev) => prev + renownGain);
    setSpeechcraftLevel((prev) => Math.min(5, Math.floor((managerRenown + renownGain) / 100) + 1));
  }

  if (tier?.id === 'tier_emperor') {
    if (isVictory) {
      setIsEmperorDefeated(true);
      isEmperorDefeatedRef.current = true;
      setIsRevoltUnlocked(true);
      isRevoltUnlockedRef.current = true;
      narratives.push(
        'Emperor Aurelius collapses onto the bloodstained sands! His gilded gladius shatters in the dust, ending his tyrannical reign!',
        'The crowd roars in stunned disbelief—word spreads like wildfire through Rome! The slave uprising awakens!',
      );
    } else {
      narratives.push(
        'The Emperor stood victorious over your champion. "Rome kneels to me alone!" Aurelius roared to the cheering patricians.',
      );
    }
  } else if (currentTierIdx === 4 && isVictory) {
    narratives.push(
      'The Grand Coliseum Champion has fallen! But Emperor Aurelius rises from his royal throne in fury and descends to the arena sands!',
      '"Insolent slaves!" the Emperor bellows. "I shall crush your champion with my own hands!" Challenge him in a 1-on-1 duel!',
    );
  }

  // Reset side-quest bounty pool with fresh contracts whenever any battle concludes (deduplicating already recruited heroes)
  if (tier) {
    currentTierIdx = BATTLE_TIERS.findIndex((t) => t.id === tier.id);
  }
  const nextPodiumTier = isVictory && isTrial && currentTierIdx >= 0 ? currentTierIdx + 2 : unlockedTierIndex + 1;
  setSideSkirmishes(generateSideSkirmishes(Math.max(1, nextPodiumTier), true, survivingGlads));

  // Check Traveling Nomad Merchant spawn: 20% (1 in 5) chance whenever ANY fight concludes
  const effectiveTier = isVictory && isTrial && tier && currentTierIdx >= 1 ? currentTierIdx + 1 : unlockedTierIndex;
  if (effectiveTier >= 2 && !merchantStateRef.current.active) {
    if (Math.random() < 0.20) {
      merchantStateRef.current = {
        active: true,
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
      setMerchantState({ ...merchantStateRef.current });
    }
  }

  // Calculate Party Member progression for only participating squad gladiators
  const partyMembers: PartyMemberPostBattle[] = deployedGladIds.map((gladId) => {
    const g = allGlads.find((x) => x.id === gladId) || allGlads[0];
    const matchFighter = fighters.find((f) => f.sourceGladiatorId === gladId);
    const isDead = !matchFighter || matchFighter.hp <= 0;

    const trainingMult = 1 + (ludusUpgrades.trainingGrounds * 0.25);
    // Reduce leveling XP gain by 20% (multiplier 0.8)
    const xpGained = isVictory && !isDead ? Math.round((60 + Math.max(0, currentTierIdx) * 35) * trainingMult * 0.8) : 0;
    const startLevel = g.level;
    const startXp = g.xp;
    const xpNeeded = g.xpNeeded;
    const totalXp = startXp + xpGained;
    const didLevelUp = isVictory && !isDead && totalXp >= xpNeeded && startLevel < 5;
    const endLevel = didLevelUp ? Math.min(5, startLevel + 1) : startLevel;
    const endXp = didLevelUp ? totalXp % Math.floor(xpNeeded * 1.5) : isDead ? startXp : totalXp;

    const strGain = (g.culture === 'celt' || g.culture === 'hunnic' || g.weightClass === 'Heavyweight' || g.weightClass === 'Colossal' || g.isCavalry || g.isElephant) ? 2 : 1;
    const dexGain = (g.culture === 'berber' || g.culture === 'scythian' || g.weightClass === 'Lightweight' || (g.isCavalry && !g.isElephant)) ? 2 : 1;
    const vitGain = (g.culture === 'roman' || g.weightClass === 'Heavyweight' || g.weightClass === 'Colossal' || g.isElephant) ? 2 : 1;
    const statGains = didLevelUp ? { str: strGain, dex: dexGain, vit: vitGain } : undefined;
    const curA = g.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
    const newStats = {
      str: (curA.str ?? 10) + (didLevelUp ? strGain : 0),
      dex: (curA.dex ?? 10) + (didLevelUp ? dexGain : 0),
      vit: (curA.vit ?? curA.con ?? 10) + (didLevelUp ? vitGain : 0),
    };

    const otherPartyIds = deployedGladIds.filter((id) => id !== gladId);
    let startBondScore = 30;
    if (otherPartyIds.length > 0) {
      const sum = otherPartyIds.reduce(
        (acc, oid) => acc + (gladiatorBondsRef.current[[gladId, oid].sort().join('__')] ?? 15),
        0,
      );
      startBondScore = Math.round(sum / otherPartyIds.length);
    }
    const bondGain = isVictory && !isDead ? 15 : 0;
    const endBondScore = isDead ? startBondScore : Math.min(100, startBondScore + bondGain);

    return {
      id: g.id,
      name: g.name,
      culture: g.culture,
      title: g.title,
      startLevel,
      endLevel,
      startXp,
      endXp,
      xpNeeded,
      xpGained,
      startBondPips: Math.min(10, Math.floor(startBondScore / 10)),
      endBondPips: Math.min(10, Math.floor(endBondScore / 10)),
      didLevelUp,
      statGains,
      newStats,
      hpRemaining: matchFighter ? Math.max(0, Math.round(matchFighter.hp)) : 0,
      maxHp: g.maxHp,
      heroType: g.heroType,
      gladiatorClass: g.gladiatorClass,
    };
  });

  // Populate aftermath narrative data
  setAftermathData({
    isVictory,
    isTrial,
    tierName: tier?.name || 'Coliseum Duel',
    goldEarned: wonGold,
    narratives,
    bondShifts,
    partyMembers,
  });

  if (isVictory) {
    setCombatOutcome('victory');
    combatOutcomeRef.current = 'victory';

    // First Victory Tutorial Progression & Free Recruits Allocation
    if (!firstBattleDoneRef.current) {
      firstBattleDoneRef.current = true;
      setFirstBattleDone(true);
      pendingPostBattleTutorialRef.current = true;

      const currentCultures = gladiatorsRef.current.map((g) => g.culture);
      const unrecruited = INITIAL_GLADIATORS.filter(
        (c) => !currentCultures.includes(c.culture),
      );
      const shuffled = [...unrecruited].sort(() => Math.random() - 0.5);
      const freePicks = shuffled.slice(0, 2).map((c) => c.culture);
      setFreeRecruitCultures(freePicks);
      freeRecruitCulturesRef.current = freePicks;

      heraldTimerRef.current = (30 + Math.random() * 90) * getPodiumCountdownMultiplier(unlockedTierIndexRef.current);
    } else {
      heraldTimerRef.current = (30 + Math.random() * 90) * getPodiumCountdownMultiplier(unlockedTierIndexRef.current);
    }

    // Winning the 5th podium or Emperor duel does NOT end the campaign!
    // Campaign victory is reserved strictly for winning the Slave Revolt (Seizing Rome)!
    economy.credit(wonGold, {addToScore: true});

    gameAudio.playVictoryFanfare();
  } else {
    setCombatOutcome('defeat');
    combatOutcomeRef.current = 'defeat';

    const remainingAlive = gladiatorsRef.current.filter((g) => g.hp > 0);
    const minGold = getConfig('minGoldLossThreshold') as number;
    if (remainingAlive.length === 0 && gameStateRef.current.gold < minGold) {
      setGameState((prev) => ({...prev, status: 'GAME_OVER'}));
    }

    gameAudio.playDefeatMotif();
  }

  // Persist battle results immediately
  try {
    triggerAutosave(false);
  } catch (_) {}
}

export function resolveBattle(view: BattleView, outcome: BattleOutcome): void {
  if (outcome.kind === 'sandbox') {
    resolveSandboxBattle(view, outcome.isVictory);
  } else {
    resolveDuelBattle(view, outcome.isVictory, outcome.verdict, outcome.isTrial);
  }
}
