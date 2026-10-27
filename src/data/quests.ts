// Branching Quest & Visual Novel System for Gladiator Manager
// Crusader Kings & Visual Novel style branching event chains with antiquity lore.
// Strictly uses the 16-color antiquity palette, procedural NPC portraits, and dynamic consequence simulation.

import type { NpcPortraitType, Culture } from '../types';

export type RequiredQuestStat = 'attack' | 'defense' | 'speed' | 'level' | 'none';

export interface QuestReward {
  gold?: number;
  xp?: number;
  heal?: number;
  damage?: number;
  killed?: boolean;
  recruit?: {
    name: string;
    culture: Culture;
    title: string;
    attack: number;
    defense: number;
    speed: number;
    maxHp: number;
  };
  unlockChain?: string;
}

export interface QuestPenalty {
  gold?: number;
  damage?: number;
  killed?: boolean;
}

export interface QuestChoice {
  text: string;
  requiredStat: RequiredQuestStat;
  baseChance: number; // 0 to 100
  statWeight: number; // multiplier for gladiator stat deviation
  successNextId?: string;
  failureNextId?: string;
  rewards?: QuestReward;
  penalty?: QuestPenalty;
}

export interface QuestNode {
  id: string;
  chainId: string;
  stage: number; // 1, 2, or 3
  isTerminal?: boolean; // true if this is an outcome resolution node
  speaker: string;
  portraitType: NpcPortraitType;
  title: string;
  text: string;
  duration: number; // in seconds (0 for immediate choice, 12-25 for dispatched expedition)
  choices: QuestChoice[];
}

export interface QuestChainMeta {
  id: string;
  title: string;
  speaker: string;
  portraitType: NpcPortraitType;
  description: string;
  startNodeId: string;
}

// ============================================================================
// QUEST DATABASE
// In-world dilemmas and multi-stage branching event chains
// ============================================================================

export const QUEST_CHAINS: QuestChainMeta[] = [
  {
    id: 'chain_corrupt_senator',
    title: "The Senator's Ledgers",
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    description: 'Senator Gaius has dark business in the shadows of the Subura and pays generously in gold for muscle.',
    startNodeId: 'senator_s1_start',
  },
  {
    id: 'chain_shadow_broker',
    title: 'The Catacomb Smugglers',
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    description: 'An underworld courier offers high-value covert contracts and gold under the cover of night.',
    startNodeId: 'shadow_s1_start',
  },
  {
    id: 'chain_priestess_bellona',
    title: "Bellona's Blood Rite",
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    description: 'The war temple calls upon worthy arena warriors to undergo sacrificial ordeals for sacred gold.',
    startNodeId: 'bellona_s1_start',
  },
  {
    id: 'chain_escaped_slave_ring',
    title: 'The Rebel Underground',
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    description: 'A clandestine alliance of escaped arena champions seeks arms and brotherhood in the hills.',
    startNodeId: 'slave_s1_start',
  },
  {
    id: 'chain_imperial_magistrate',
    title: 'The Imperial Tribute Escort',
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    description: 'The Emperor’s Magistrate demands vetted champions to protect high-stakes arena treasuries.',
    startNodeId: 'magistrate_s1_start',
  },
];

export const QUEST_DATABASE: Record<string, QuestNode> = {
  // --------------------------------------------------------------------------
  // CHAIN 1: THE SENATOR'S LEDGERS (Corrupt Senator)
  // --------------------------------------------------------------------------
  senator_s1_start: {
    id: 'senator_s1_start',
    chainId: 'chain_corrupt_senator',
    stage: 1,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: "The Senator's Subura Gambit",
    text: "A rival merchant threatens to release private counting-house records to the Praetorian Guard before dawn. The Senator promises a heavy purse of gold if a champion retrieves those ledgers tonight. How will your gladiator proceed?",
    duration: 15,
    choices: [
      {
        text: 'Smash through the front courtyard and intimidate the villa bodyguards.',
        requiredStat: 'attack',
        baseChance: 65,
        statWeight: 2.2,
        successNextId: 'senator_s2_recovered',
        failureNextId: 'senator_s2_ambushed',
        rewards: { gold: 180 },
        penalty: { damage: 35, gold: -30 },
      },
      {
        text: 'Slip over the garden wall and pick the lock of the private archive.',
        requiredStat: 'speed',
        baseChance: 60,
        statWeight: 2.4,
        successNextId: 'senator_s2_recovered',
        failureNextId: 'senator_s2_ambushed',
        rewards: { gold: 200 },
        penalty: { damage: 25 },
      },
      {
        text: 'Decline the Senator’s shady enterprise.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        successNextId: 'senator_refused',
      },
    ],
  },

  senator_s2_recovered: {
    id: 'senator_s2_recovered',
    chainId: 'chain_corrupt_senator',
    stage: 2,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'The Blackmail Conspiracy',
    text: "Excellent work! But reading these seized documents reveals an imperial conspiracy: the rival was acting on orders of the City Tribune to seize our ludus! We can strike back by intercepting the Tribune’s courier on the Via Sacra tonight.",
    duration: 18,
    choices: [
      {
        text: 'Intercept the armed courier escort in a fierce street clash.',
        requiredStat: 'attack',
        baseChance: 62,
        statWeight: 2.0,
        successNextId: 'senator_s3_finale_win',
        failureNextId: 'senator_s3_finale_fail',
        rewards: { gold: 300 },
        penalty: { damage: 55 },
      },
      {
        text: 'Hold the choke-point bridge behind a heavy shield wall until the carriage is isolated.',
        requiredStat: 'defense',
        baseChance: 68,
        statWeight: 2.1,
        successNextId: 'senator_s3_finale_win',
        failureNextId: 'senator_s3_finale_fail',
        rewards: { gold: 280 },
        penalty: { damage: 45 },
      },
    ],
  },

  senator_s2_ambushed: {
    id: 'senator_s2_ambushed',
    chainId: 'chain_corrupt_senator',
    stage: 2,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'Trapped in the Subura',
    text: "Disaster! The merchant was alerted and your gladiator had to fight through an armed ambush! The wounded gladiator managed to drag a locked iron strongbox back to safety, but bounty hunters are tracking the blood trail. We must make a stand!",
    duration: 16,
    choices: [
      {
        text: 'Form a desperate shield bastion at the courtyard gate.',
        requiredStat: 'defense',
        baseChance: 55,
        statWeight: 2.2,
        successNextId: 'senator_s3_finale_win',
        failureNextId: 'senator_s3_finale_fail',
        rewards: { gold: 220 },
        penalty: { damage: 70, killed: false },
      },
      {
        text: 'Unleash veteran arena experience to counter-attack the pursuers.',
        requiredStat: 'level',
        baseChance: 50,
        statWeight: 3.5,
        successNextId: 'senator_s3_finale_win',
        failureNextId: 'senator_s3_finale_fail',
        rewards: { gold: 250 },
        penalty: { damage: 60 },
      },
    ],
  },

  senator_s3_finale_win: {
    id: 'senator_s3_finale_win',
    chainId: 'chain_corrupt_senator',
    stage: 3,
    isTerminal: true,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'The Senator’s Grand Bounty',
    text: "Magnificent triumph! The rival is bankrupt, the Tribune is disgraced, and our alliance is cemented in imperial gold. As promised, here is a lavish purse of 500 gold from my personal treasury for your stable.",
    duration: 0,
    choices: [
      {
        text: 'Accept the gold bounty.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 500 },
      },
    ],
  },

  senator_s3_finale_fail: {
    id: 'senator_s3_finale_fail',
    chainId: 'chain_corrupt_senator',
    stage: 3,
    isTerminal: true,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'Betrayal and Bloodshed',
    text: "The city cohorts overran our position! We were forced to burn the evidence and flee into the sewers. Your gladiator barely escaped with their life, severely wounded by praetorian crossbows. The Senator washes his hands of the affair...",
    duration: 0,
    choices: [
      {
        text: 'Tend to the wounded and swear vengeance.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 65, gold: -50 },
      },
    ],
  },

  senator_refused: {
    id: 'senator_refused',
    chainId: 'chain_corrupt_senator',
    stage: 1,
    isTerminal: true,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'An Offer Declined',
    text: "Hmph. So the master of the ludus fears a little imperial intrigue? Very well. I shall find blades that do not hesitate when gold is cast on the table. Good day to you.",
    duration: 0,
    choices: [
      {
        text: 'Dismiss the senator back to his litter.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAIN 2: THE CATACOMB SMUGGLERS (Shadow Broker)
  // --------------------------------------------------------------------------
  shadow_s1_start: {
    id: 'shadow_s1_start',
    chainId: 'chain_shadow_broker',
    stage: 1,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'The Subterranean Smugglers',
    text: "A clandestine caravan carrying tempered Iberian steel and barbarian gold coins is stalled beneath the Aqueduct. The City Watch patrols the main archway. I need an expeditious operative from your stable to secure the contraband.",
    duration: 16,
    choices: [
      {
        text: 'Slip through the subterranean drainage channels under darkness.',
        requiredStat: 'speed',
        baseChance: 68,
        statWeight: 2.3,
        successNextId: 'shadow_s2_catacombs',
        failureNextId: 'shadow_s2_ambush',
        rewards: { gold: 180 },
        penalty: { damage: 30 },
      },
      {
        text: 'Ambush the City Watch patrol to create a diversion for the cargo.',
        requiredStat: 'attack',
        baseChance: 62,
        statWeight: 2.2,
        successNextId: 'shadow_s2_catacombs',
        failureNextId: 'shadow_s2_ambush',
        rewards: { gold: 210 },
        penalty: { damage: 45, gold: -40 },
      },
      {
        text: 'Refuse underworld entanglements.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        successNextId: 'shadow_refused',
      },
    ],
  },

  shadow_s2_catacombs: {
    id: 'shadow_s2_catacombs',
    chainId: 'chain_shadow_broker',
    stage: 2,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Vault of the Underworld',
    text: "The Iberian steel is ours! But a rival syndicate has locked the deepest iron gate in the catacombs, where the stolen tribute vault lies. We must crack the vault before the Praetorians descend.",
    duration: 20,
    choices: [
      {
        text: 'Batter down the reinforced iron grating with brutal force.',
        requiredStat: 'attack',
        baseChance: 60,
        statWeight: 2.1,
        successNextId: 'shadow_s3_finale_win',
        failureNextId: 'shadow_s3_finale_fail',
        rewards: { gold: 320 },
        penalty: { damage: 50 },
      },
      {
        text: 'Use veteran cunning to decipher the counterweight trap mechanism.',
        requiredStat: 'level',
        baseChance: 65,
        statWeight: 3.2,
        successNextId: 'shadow_s3_finale_win',
        failureNextId: 'shadow_s3_finale_fail',
        rewards: { gold: 350 },
        penalty: { damage: 40 },
      },
    ],
  },

  shadow_s2_ambush: {
    id: 'shadow_s2_ambush',
    chainId: 'chain_shadow_broker',
    stage: 2,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Cornered in the Tunnels',
    text: "The alarm was raised! Syndicate assassins trapped your gladiator in the lower crypts. To survive, they must fight back-to-back against overwhelming numbers in pitch darkness!",
    duration: 18,
    choices: [
      {
        text: 'Hold the narrow tunnel entrance with an ironclad shield defense.',
        requiredStat: 'defense',
        baseChance: 58,
        statWeight: 2.4,
        successNextId: 'shadow_s3_finale_win',
        failureNextId: 'shadow_s3_finale_fail',
        rewards: { gold: 270 },
        penalty: { damage: 65 },
      },
      {
        text: 'Dash through the flaming tar barricade to flank the ambushers.',
        requiredStat: 'speed',
        baseChance: 52,
        statWeight: 2.5,
        successNextId: 'shadow_s3_finale_win',
        failureNextId: 'shadow_s3_finale_fail',
        rewards: { gold: 300 },
        penalty: { damage: 75, killed: false },
      },
    ],
  },

  shadow_s3_finale_win: {
    id: 'shadow_s3_finale_win',
    chainId: 'chain_shadow_broker',
    stage: 3,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'The Smuggler’s Masterpiece',
    text: "Unbelievable. The entire vault was plundered without the authorities knowing who struck. Your share of the illicit gold is staggering. The underworld now speaks of your ludus with awe.",
    duration: 0,
    choices: [
      {
        text: 'Claim the black market riches.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 550 },
      },
    ],
  },

  shadow_s3_finale_fail: {
    id: 'shadow_s3_finale_fail',
    chainId: 'chain_shadow_broker',
    stage: 3,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Ambush at the Gate',
    text: "A devastating collapse! The Praetorians sealed the catacomb exits and poured burning pitch. Your gladiator escaped through a sewer grate by a hair’s breadth, heavily burned and bleeding.",
    duration: 0,
    choices: [
      {
        text: 'Drag the scorched survivor back to camp.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 80, gold: -60 },
      },
    ],
  },

  shadow_refused: {
    id: 'shadow_refused',
    chainId: 'chain_shadow_broker',
    stage: 1,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Shadows Melt Away',
    text: "Pity. A fortune in unminted bullion slips through your fingers. We were never here.",
    duration: 0,
    choices: [
      {
        text: 'Return to the training yard.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAIN 3: BELLONA'S BLOOD RITE (Priestess of Bellona)
  // --------------------------------------------------------------------------
  bellona_s1_start: {
    id: 'bellona_s1_start',
    chainId: 'chain_priestess_bellona',
    stage: 1,
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    title: 'The War Goddess’s Altar',
    text: "The sacred vultures feast on the temple altars! Bellona, goddess of holy slaughter, demands an offering of sweat and steel. She seeks a gladiator to enter the subterranean Temple of Mars and conquer the Ordeal of Blades.",
    duration: 18,
    choices: [
      {
        text: 'Endure the gauntlet of swinging bronze scythes without flinching.',
        requiredStat: 'defense',
        baseChance: 66,
        statWeight: 2.2,
        successNextId: 'bellona_s2_altar',
        failureNextId: 'bellona_s2_scourge',
        rewards: { gold: 160, heal: 30 },
        penalty: { damage: 40 },
      },
      {
        text: 'Recite the ancient hymns of war while dodging temple pit vipers.',
        requiredStat: 'speed',
        baseChance: 62,
        statWeight: 2.3,
        successNextId: 'bellona_s2_altar',
        failureNextId: 'bellona_s2_scourge',
        rewards: { gold: 180 },
        penalty: { damage: 35 },
      },
      {
        text: 'Politely decline the divine invitation.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        successNextId: 'bellona_refused',
      },
    ],
  },

  bellona_s2_altar: {
    id: 'bellona_s2_altar',
    chainId: 'chain_priestess_bellona',
    stage: 2,
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    title: 'The Great Altar Trial',
    text: "The goddess smiles! The temple brazier blazes with divine wrath. But now comes the true test: an untamed mountain lion has been unleashed into the sacrificial pit. The champion must defeat the beast barehanded or with ritual iron.",
    duration: 20,
    choices: [
      {
        text: 'Tackle the sacred beast and break its stance in the sanctum sand.',
        requiredStat: 'attack',
        baseChance: 64,
        statWeight: 2.2,
        successNextId: 'bellona_s3_finale_win',
        failureNextId: 'bellona_s3_finale_fail',
        rewards: { gold: 320 },
        penalty: { damage: 60 },
      },
      {
        text: 'Withstand the beast’s ferocious mauling behind a solid bronze guard.',
        requiredStat: 'defense',
        baseChance: 68,
        statWeight: 2.1,
        successNextId: 'bellona_s3_finale_win',
        failureNextId: 'bellona_s3_finale_fail',
        rewards: { gold: 300 },
        penalty: { damage: 50 },
      },
    ],
  },

  bellona_s2_scourge: {
    id: 'bellona_s2_scourge',
    chainId: 'chain_priestess_bellona',
    stage: 2,
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    title: 'Wrath of the Scourge',
    text: "Your champion stumbled during the blade dance, spilling blood unworthily upon the temple flags! Fanatic acolytes surround your fighter with burning flails. Only supreme experience can break through their ring of fire!",
    duration: 16,
    choices: [
      {
        text: 'Draw upon veteran arena discipline to carve a path through the fanatics.',
        requiredStat: 'level',
        baseChance: 58,
        statWeight: 3.5,
        successNextId: 'bellona_s3_finale_win',
        failureNextId: 'bellona_s3_finale_fail',
        rewards: { gold: 200 },
        penalty: { damage: 70 },
      },
      {
        text: 'Sprint through the blazing braziers to shatter the sanctum gate.',
        requiredStat: 'speed',
        baseChance: 54,
        statWeight: 2.4,
        successNextId: 'bellona_s3_finale_win',
        failureNextId: 'bellona_s3_finale_fail',
        rewards: { gold: 180 },
        penalty: { damage: 85, killed: false },
      },
    ],
  },

  bellona_s3_finale_win: {
    id: 'bellona_s3_finale_win',
    chainId: 'chain_priestess_bellona',
    stage: 3,
    isTerminal: true,
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    title: "Bellona's Sacred Benediction",
    text: "Ita est! The temple choruses roar in ecstasy! Bellona has accepted your warrior as her divine instrument of fury. The priestess anoints your gladiator with consecrated oils (healing all wounds) and blesses your ludus with golden tributes.",
    duration: 0,
    choices: [
      {
        text: 'Receive the goddess’s miraculous blessing.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 500, heal: 200 },
      },
    ],
  },

  bellona_s3_finale_fail: {
    id: 'bellona_s3_finale_fail',
    chainId: 'chain_priestess_bellona',
    stage: 3,
    isTerminal: true,
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    title: 'The Goddess Rejects the Weak',
    text: "The omens turned black as charcoal. Your gladiator collapsed in the bloodied sanctum, trampled by the sacred beast and banished from the temple with heavy wounds and curses of ill fortune.",
    duration: 0,
    choices: [
      {
        text: 'Carry the cursed champion back to the infirmary.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 90, gold: -40 },
      },
    ],
  },

  bellona_refused: {
    id: 'bellona_refused',
    chainId: 'chain_priestess_bellona',
    stage: 1,
    isTerminal: true,
    speaker: 'Priestess of Bellona',
    portraitType: 'priestess_bellona',
    title: 'The Omens Pass',
    text: "You dare turn your back on the goddess of slaughter? May your iron rust and your shields splinter in the sands.",
    duration: 0,
    choices: [
      {
        text: 'Close the camp gates.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAIN 4: THE REBEL UNDERGROUND (Escaped Slave Ring)
  // --------------------------------------------------------------------------
  slave_s1_start: {
    id: 'slave_s1_start',
    chainId: 'chain_escaped_slave_ring',
    stage: 1,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'The Broken Collar',
    text: "Hail, Dominus. Fugitives who broke their collars in the Capuan pits are hidden in the olive groves of Mount Vesuvius, hunted by Roman bounty hounds. They lack weapons and a seasoned warrior to guide their vanguard to the mountain pass.",
    duration: 18,
    choices: [
      {
        text: 'Lead the rebel vanguard to smash through the bounty hunter checkpoint.',
        requiredStat: 'attack',
        baseChance: 65,
        statWeight: 2.2,
        successNextId: 'slave_s2_camp',
        failureNextId: 'slave_s2_surrounded',
        rewards: { gold: 150 },
        penalty: { damage: 40 },
      },
      {
        text: 'Guide the fugitives through hidden ravine trails under twilight.',
        requiredStat: 'speed',
        baseChance: 70,
        statWeight: 2.1,
        successNextId: 'slave_s2_camp',
        failureNextId: 'slave_s2_surrounded',
        rewards: { gold: 160 },
        penalty: { damage: 30 },
      },
      {
        text: 'Turn them away to protect the ludus from imperial scrutiny.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        successNextId: 'slave_refused',
      },
    ],
  },

  slave_s2_camp: {
    id: 'slave_s2_camp',
    chainId: 'chain_escaped_slave_ring',
    stage: 2,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Fortress in the Crags',
    text: "We reached the mountain caves! But an auxiliary Roman cavalry detachment is ascending the canyon with bloodhounds. If we hold the narrow stone ridge until sundown, the rebel families will escape across the river.",
    duration: 22,
    choices: [
      {
        text: 'Hold the narrow rocky pass as an impenetrable living shield-wall.',
        requiredStat: 'defense',
        baseChance: 66,
        statWeight: 2.3,
        successNextId: 'slave_s3_finale_win',
        failureNextId: 'slave_s3_finale_fail',
        rewards: { gold: 300 },
        penalty: { damage: 55 },
      },
      {
        text: 'Launch a daring downhill counter-charge into the Roman cavalry vanguard.',
        requiredStat: 'attack',
        baseChance: 60,
        statWeight: 2.4,
        successNextId: 'slave_s3_finale_win',
        failureNextId: 'slave_s3_finale_fail',
        rewards: { gold: 320 },
        penalty: { damage: 65 },
      },
    ],
  },

  slave_s2_surrounded: {
    id: 'slave_s2_surrounded',
    chainId: 'chain_escaped_slave_ring',
    stage: 2,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Surrounded on the Ridge',
    text: "The dogs found us! Imperial legionaries surround the rocky outcrop, firing volleys of incendiary arrows into the dry brush. The wounded must break out before the whole ridge turns to ash!",
    duration: 17,
    choices: [
      {
        text: 'Break the encirclement through sheer tactical veteran command.',
        requiredStat: 'level',
        baseChance: 56,
        statWeight: 3.5,
        successNextId: 'slave_s3_finale_win',
        failureNextId: 'slave_s3_finale_fail',
        rewards: { gold: 240 },
        penalty: { damage: 75 },
      },
      {
        text: 'Dash through the flaming wall of scrub oak to lead a breakout.',
        requiredStat: 'speed',
        baseChance: 54,
        statWeight: 2.4,
        successNextId: 'slave_s3_finale_win',
        failureNextId: 'slave_s3_finale_fail',
        rewards: { gold: 260 },
        penalty: { damage: 85, killed: false },
      },
    ],
  },

  slave_s3_finale_win: {
    id: 'slave_s3_finale_win',
    chainId: 'chain_escaped_slave_ring',
    stage: 3,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Brotherhood of Freedom',
    text: "We did it! The Roman auxiliaries broke and fled down the mountain. In gratitude, the rebel coalition presents a treasure chest of captured pay chests (500 Gold). Furthermore, one of their liberated champions pledges their sword to your ludus!",
    duration: 0,
    choices: [
      {
        text: 'Welcome the veteran recruit into your ludus stable!',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: {
          gold: 500,
          recruit: {
            name: 'Kallisto Iron-Chain',
            culture: 'celt',
            title: 'Rebel War-Chief',
            attack: 30,
            defense: 16,
            speed: 15,
            maxHp: 180,
          },
        },
      },
    ],
  },

  slave_s3_finale_fail: {
    id: 'slave_s3_finale_fail',
    chainId: 'chain_escaped_slave_ring',
    stage: 3,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'The Fall of the Rebellion',
    text: "The legionary shields were too dense. The rebel line collapsed under a barrage of javelins. Your gladiator barely dragged their broken body from the burning ridge. Many comrades were lost...",
    duration: 0,
    choices: [
      {
        text: 'Mourn the fallen comrades and retreat.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 85, gold: -40 },
      },
    ],
  },

  slave_refused: {
    id: 'slave_refused',
    chainId: 'chain_escaped_slave_ring',
    stage: 1,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'A Cold Rebuff',
    text: "Then stay in your gilded cages, master. We shall seek freedom with our own blood.",
    duration: 0,
    choices: [
      {
        text: 'Return to the training grounds.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAIN 5: THE IMPERIAL TRIBUTE ESCORT (Imperial Magistrate)
  // --------------------------------------------------------------------------
  magistrate_s1_start: {
    id: 'magistrate_s1_start',
    chainId: 'chain_imperial_magistrate',
    stage: 1,
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    title: 'The Imperial Tribute Escort',
    text: "By order of the Emperor, a convoy carrying five hundred talents of silver for the Grand Coliseum Games arrives tomorrow along the Appian Way. Highway bandits and deserters infest the hills. Dispatch your strongest champion to command the escort guard.",
    duration: 20,
    choices: [
      {
        text: 'Form a disciplined forward guard to intimidate highwaymen.',
        requiredStat: 'defense',
        baseChance: 68,
        statWeight: 2.1,
        successNextId: 'magistrate_s2_appian',
        failureNextId: 'magistrate_s2_ambush',
        rewards: { gold: 260 },
        penalty: { damage: 35 },
      },
      {
        text: 'Deploy as an advance scout to ambush bandit lookouts.',
        requiredStat: 'speed',
        baseChance: 64,
        statWeight: 2.3,
        successNextId: 'magistrate_s2_appian',
        failureNextId: 'magistrate_s2_ambush',
        rewards: { gold: 280 },
        penalty: { damage: 40 },
      },
      {
        text: 'Decline the imperial magistrate’s commission.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        successNextId: 'magistrate_refused',
      },
    ],
  },

  magistrate_s2_appian: {
    id: 'magistrate_s2_appian',
    chainId: 'chain_imperial_magistrate',
    stage: 2,
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    title: 'The Gorge Ambush',
    text: "The convoy was attacked in the narrow basalt gorge by a rogue cohort of deserters! The carriage driver is down and the chest is pinned under crossfire. Your champion must lead the charge to break the enemy ring!",
    duration: 22,
    choices: [
      {
        text: 'Lead a ferocious frontal assault into the rogue enemy formation.',
        requiredStat: 'attack',
        baseChance: 64,
        statWeight: 2.2,
        successNextId: 'magistrate_s3_finale_win',
        failureNextId: 'magistrate_s3_finale_fail',
        rewards: { gold: 380 },
        penalty: { damage: 60 },
      },
      {
        text: 'Form an impenetrable tortoise defense over the imperial carriage.',
        requiredStat: 'defense',
        baseChance: 70,
        statWeight: 2.0,
        successNextId: 'magistrate_s3_finale_win',
        failureNextId: 'magistrate_s3_finale_fail',
        rewards: { gold: 360 },
        penalty: { damage: 50 },
      },
    ],
  },

  magistrate_s2_ambush: {
    id: 'magistrate_s2_ambush',
    chainId: 'chain_imperial_magistrate',
    stage: 2,
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    title: 'Disaster on the Highway',
    text: "The escort vanguard was scattered by flaming caltrops! The imperial carriage is overturned in the ditch and bandits are attempting to drag away the strongbox. Everything rests on your gladiator's veteran resolve!",
    duration: 18,
    choices: [
      {
        text: 'Rally the panicked Roman legionaries with seasoned veteran authority.',
        requiredStat: 'level',
        baseChance: 60,
        statWeight: 3.5,
        successNextId: 'magistrate_s3_finale_win',
        failureNextId: 'magistrate_s3_finale_fail',
        rewards: { gold: 320 },
        penalty: { damage: 70 },
      },
      {
        text: 'Charge the bandit chieftain in a desperate duel to break their morale.',
        requiredStat: 'attack',
        baseChance: 55,
        statWeight: 2.3,
        successNextId: 'magistrate_s3_finale_win',
        failureNextId: 'magistrate_s3_finale_fail',
        rewards: { gold: 340 },
        penalty: { damage: 80, killed: false },
      },
    ],
  },

  magistrate_s3_finale_win: {
    id: 'magistrate_s3_finale_win',
    chainId: 'chain_imperial_magistrate',
    stage: 3,
    isTerminal: true,
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    title: 'Imperial Commendation',
    text: "In the name of the Senate and People of Rome! The silver is delivered intact to the imperial coliseum. The Magistrate confers upon your ludus the official Imperial Laurel Diploma, granting 650 Gold!",
    duration: 0,
    choices: [
      {
        text: 'Accept the imperial laurel and gold treasure chest.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 650 },
      },
    ],
  },

  magistrate_s3_finale_fail: {
    id: 'magistrate_s3_finale_fail',
    chainId: 'chain_imperial_magistrate',
    stage: 3,
    isTerminal: true,
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    title: 'Disgrace Before the Throne',
    text: "The imperial convoy was sacked and burned. The Magistrate escaped with his life but holds your ludus responsible for the catastrophe. Heavy fines are levied against your treasury.",
    duration: 0,
    choices: [
      {
        text: 'Pay the imperial fines and attend to the wounded.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 80, gold: -100 },
      },
    ],
  },

  magistrate_refused: {
    id: 'magistrate_refused',
    chainId: 'chain_imperial_magistrate',
    stage: 1,
    isTerminal: true,
    speaker: 'Imperial Magistrate',
    portraitType: 'imperial_magistrate',
    title: 'Imperial Contempt',
    text: "A refusal to serve Rome? The imperial censors shall remember this when allocations are drawn.",
    duration: 0,
    choices: [
      {
        text: 'Return to your affairs.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CULTURAL PERSONAL QUEST 1: CELTIC CLAN TORC (celt_torc_start)
  // --------------------------------------------------------------------------
  celt_torc_start: {
    id: 'celt_torc_start',
    chainId: 'chain_escaped_slave_ring',
    stage: 1,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'The Stolen Golden Torc',
    text: "The slaver who stole the druidic torc travels down the Appian Way with six heavy bodyguards. Reclaiming it will restore tribal honor and bring home their accumulated gold!",
    duration: 16,
    choices: [
      {
        text: 'Charge the slaver’s carriage in an unstoppable Gallic fury.',
        requiredStat: 'attack',
        baseChance: 68,
        statWeight: 2.3,
        successNextId: 'celt_torc_win',
        failureNextId: 'celt_torc_fail',
        rewards: { gold: 280, heal: 25 },
        penalty: { damage: 45 },
      },
      {
        text: 'Form a sturdy shield wall to block their retreat at the crossroads.',
        requiredStat: 'defense',
        baseChance: 64,
        statWeight: 2.1,
        successNextId: 'celt_torc_win',
        failureNextId: 'celt_torc_fail',
        rewards: { gold: 250 },
        penalty: { damage: 35 },
      },
      {
        text: 'Decline to intervene in personal vengeance.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  celt_torc_win: {
    id: 'celt_torc_win',
    chainId: 'chain_escaped_slave_ring',
    stage: 2,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Honor of the Sacred Oak',
    text: "Victory! The slaver’s mercenaries scattered into the scrub. The ancestral torc now rests safe, along with an iron strongbox containing 350 Gold and the eternal gratitude of the Celtic clans!",
    duration: 0,
    choices: [
      {
        text: 'Welcome the triumphant champion home.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 350, heal: 40 },
      },
    ],
  },

  celt_torc_fail: {
    id: 'celt_torc_fail',
    chainId: 'chain_escaped_slave_ring',
    stage: 2,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Ambush at the Crossroads',
    text: "The slaver had hired veteran praetorian deserters. Your gladiator fought valiantly but was driven back with severe wounds before reclaiming the torc.",
    duration: 0,
    choices: [
      {
        text: 'Tend to the wounded warrior.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 60, gold: -30 },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CULTURAL PERSONAL QUEST 2: SUBURA DEBTORS' DEN (roman_debt_start)
  // --------------------------------------------------------------------------
  roman_debt_start: {
    id: 'roman_debt_start',
    chainId: 'chain_corrupt_senator',
    stage: 1,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'Subura Debtors’ Den',
    text: "The loan-sharks have fortified an underground vault beneath the Subura tavern. Breaching it will rescue the veteran legionary and yield their accumulated interest coffers.",
    duration: 15,
    choices: [
      {
        text: 'Batter through the reinforced timber cellar door.',
        requiredStat: 'attack',
        baseChance: 65,
        statWeight: 2.2,
        successNextId: 'roman_debt_win',
        failureNextId: 'roman_debt_fail',
        rewards: { gold: 240 },
        penalty: { damage: 40 },
      },
      {
        text: 'Use veteran legionary discipline to intimidate the tavern bouncers.',
        requiredStat: 'level',
        baseChance: 68,
        statWeight: 3.2,
        successNextId: 'roman_debt_win',
        failureNextId: 'roman_debt_fail',
        rewards: { gold: 280 },
        penalty: { damage: 30 },
      },
      {
        text: 'Refuse to meddle in private debts.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  roman_debt_win: {
    id: 'roman_debt_win',
    chainId: 'chain_corrupt_senator',
    stage: 2,
    isTerminal: true,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'The Veteran’s Gratitude',
    text: "The extortioners were routed! The veteran legionary was cut from his shackles. He shares guarded secrets of the tournament draws and hands over 320 Gold seized from the loan-sharks!",
    duration: 0,
    choices: [
      {
        text: 'Celebrate the successful rescue.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 320 },
      },
    ],
  },

  roman_debt_fail: {
    id: 'roman_debt_fail',
    chainId: 'chain_corrupt_senator',
    stage: 2,
    isTerminal: true,
    speaker: 'Corrupt Senator',
    portraitType: 'corrupt_senator',
    title: 'Trapped in the Cellar',
    text: "The loan-sharks hurled boiling oil down the cellar stairs! Your champion was forced to retreat through the alleys with burned flesh and bruised pride.",
    duration: 0,
    choices: [
      {
        text: 'Retreat to camp.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 55, gold: -40 },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CULTURAL PERSONAL QUEST 3: DESERT STALLIONS AT OSTIA (berber_port_start)
  // --------------------------------------------------------------------------
  berber_port_start: {
    id: 'berber_port_start',
    chainId: 'chain_shadow_broker',
    stage: 1,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Desert Stallions at Ostia',
    text: "Corrupt port censors at Ostia have chained the warehouse holding rare medicinal salves and desert arms. We can slip past their patrols or confront the garrison captain.",
    duration: 17,
    choices: [
      {
        text: 'Slip over the harbor warehouse roofs with desert agility.',
        requiredStat: 'speed',
        baseChance: 70,
        statWeight: 2.3,
        successNextId: 'berber_port_win',
        failureNextId: 'berber_port_fail',
        rewards: { gold: 250, heal: 40 },
        penalty: { damage: 30 },
      },
      {
        text: 'Challenge the corrupt harbor captain to a duel of honor.',
        requiredStat: 'attack',
        baseChance: 62,
        statWeight: 2.2,
        successNextId: 'berber_port_win',
        failureNextId: 'berber_port_fail',
        rewards: { gold: 280 },
        penalty: { damage: 45 },
      },
      {
        text: 'Let the port authorities keep the impounded goods.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  berber_port_win: {
    id: 'berber_port_win',
    chainId: 'chain_shadow_broker',
    stage: 2,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Spoils of the Dunes',
    text: "A triumph! The medicinal oils restored our fighters’ vitality, and the recovered trade chests held 320 Gold in rare unminted bullion!",
    duration: 0,
    choices: [
      {
        text: 'Unpack the recovered supplies in camp.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 320, heal: 50 },
      },
    ],
  },

  berber_port_fail: {
    id: 'berber_port_fail',
    chainId: 'chain_shadow_broker',
    stage: 2,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Port Guard Skirmish',
    text: "The harbor watch signaled for auxiliary reinforcements. Your operative barely swam across the Tiber estuary under a hail of sling stones.",
    duration: 0,
    choices: [
      {
        text: 'Tend to the waterlogged fighter.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 50, gold: -25 },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CULTURAL PERSONAL QUEST 4: THE STEPPE COURIER (scythian_courier_start)
  // --------------------------------------------------------------------------
  scythian_courier_start: {
    id: 'scythian_courier_start',
    chainId: 'chain_escaped_slave_ring',
    stage: 1,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'The Steppe Courier’s Plight',
    text: "The courier is chained inside a fortified timber staging post along the Via Flaminia. Precision bowmanship or swift night infiltration can break the palisade.",
    duration: 16,
    choices: [
      {
        text: 'Pick off the lookouts with long-range recurve bow fire.',
        requiredStat: 'speed',
        baseChance: 68,
        statWeight: 2.4,
        successNextId: 'scythian_courier_win',
        failureNextId: 'scythian_courier_fail',
        rewards: { gold: 260 },
        penalty: { damage: 35 },
      },
      {
        text: 'Storm the palisade gate behind an impenetrable shield wall.',
        requiredStat: 'defense',
        baseChance: 64,
        statWeight: 2.1,
        successNextId: 'scythian_courier_win',
        failureNextId: 'scythian_courier_fail',
        rewards: { gold: 250 },
        penalty: { damage: 40 },
      },
      {
        text: 'Avoid conflicting with the auxiliary border posts.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  scythian_courier_win: {
    id: 'scythian_courier_win',
    chainId: 'chain_escaped_slave_ring',
    stage: 2,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Ride to the Horizon',
    text: "The courier was freed without alerting the main garrison! In gratitude, the steppe kin share captured imperial tribute gold (350 Gold) and swear their bows to our cause.",
    duration: 0,
    choices: [
      {
        text: 'Welcome the courier’s tribute.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 350 },
      },
    ],
  },

  scythian_courier_fail: {
    id: 'scythian_courier_fail',
    chainId: 'chain_escaped_slave_ring',
    stage: 2,
    isTerminal: true,
    speaker: 'Escaped Slave Ring',
    portraitType: 'escaped_slave_ring',
    title: 'Crossbow Volley at the Palisade',
    text: "Auxiliary crossbowmen opened fire from the watchtowers! Your champion carried the wounded courier back under heavy fire, suffering deep bolt wounds.",
    duration: 0,
    choices: [
      {
        text: 'Bandage the deep puncture wounds.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 65, gold: -30 },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CULTURAL PERSONAL QUEST 5: THE RIVAL LUDUS SABOTAGE (hunnic_raid_start)
  // --------------------------------------------------------------------------
  hunnic_raid_start: {
    id: 'hunnic_raid_start',
    chainId: 'chain_shadow_broker',
    stage: 1,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'The Rival Ludus Sabotage',
    text: "The rival stable keeps their armory and contest prizes locked in a suburban villa outside the city walls. A night raid will shatter their armor and claim their tournament purses!",
    duration: 18,
    choices: [
      {
        text: 'Smash through their villa gates in a terrifying Hunnic assault.',
        requiredStat: 'attack',
        baseChance: 66,
        statWeight: 2.3,
        successNextId: 'hunnic_raid_win',
        failureNextId: 'hunnic_raid_fail',
        rewards: { gold: 320 },
        penalty: { damage: 50 },
      },
      {
        text: 'Use veteran gladiatorial cunning to set fire to their equipment wagons.',
        requiredStat: 'level',
        baseChance: 64,
        statWeight: 3.3,
        successNextId: 'hunnic_raid_win',
        failureNextId: 'hunnic_raid_fail',
        rewards: { gold: 340 },
        penalty: { damage: 45 },
      },
      {
        text: 'Refuse to engage in unsanctioned stable feuds.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
      },
    ],
  },

  hunnic_raid_win: {
    id: 'hunnic_raid_win',
    chainId: 'chain_shadow_broker',
    stage: 2,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Ashes and Gold',
    text: "The rival stable is in ruins! Their weapons were hauled away as scrap and their prize purses yielded 400 Gold. Their gladiators will tremble when facing us in the Coliseum!",
    duration: 0,
    choices: [
      {
        text: 'Stack the plundered arms in our armory.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        rewards: { gold: 400 },
      },
    ],
  },

  hunnic_raid_fail: {
    id: 'hunnic_raid_fail',
    chainId: 'chain_shadow_broker',
    stage: 2,
    isTerminal: true,
    speaker: 'Shadow Broker',
    portraitType: 'shadow_broker',
    title: 'Trapped in the Courtyard',
    text: "The rival stable had hired heavy gladiators to guard the armory. A vicious brawl broke out in the dark, and our fighter had to fight their way out through a hail of javelins.",
    duration: 0,
    choices: [
      {
        text: 'Treat the wounded raider.',
        requiredStat: 'none',
        baseChance: 100,
        statWeight: 0,
        penalty: { damage: 65, gold: -40 },
      },
    ],
  },
};

// ============================================================================
// ACTIVE QUEST EXPEDITION STATE
// ============================================================================

export interface ActiveQuestExpedition {
  questId: string;
  nodeId: string;
  choiceIndex: number;
  gladiatorId: string;
  gladiatorName: string;
  remainingTime: number; // in seconds
  totalDuration: number;
  speaker: string;
  portraitType: NpcPortraitType;
  questTitle: string;
  actionText: string;
  calculatedChance: number;
}

// ============================================================================
// STAT CHECK CALCULATION UTILITIES
// ============================================================================

export function calculateGladiatorSuccessChance(
  glad: { attack: number; defense: number; speed: number; level: number; hp?: number; maxHp?: number },
  requiredStat: RequiredQuestStat,
  baseChance: number,
  statWeight: number,
): number {
  if (requiredStat === 'none') {
    return baseChance;
  }

  let statVal = 15;
  if (requiredStat === 'attack') {
    statVal = glad.attack;
  } else if (requiredStat === 'defense') {
    statVal = glad.defense;
  } else if (requiredStat === 'speed') {
    statVal = glad.speed;
  } else if (requiredStat === 'level') {
    statVal = 10 + glad.level * 4;
  }

  // Baseline average stat is around 15. Every point above/below alters percentage by statWeight.
  const delta = (statVal - 15) * statWeight;
  let rawChance = baseChance + delta;

  // HP percentage effectiveness penalty:
  // Under 25% HP: -50% (0.50 multiplier)
  // Under 50% HP: -15% (0.85 multiplier)
  // Under 75% HP: -10% (0.90 multiplier)
  // Otherwise (>= 75% HP): 1.0 multiplier
  const maxHp = glad.maxHp && glad.maxHp > 0 ? glad.maxHp : 150;
  const currentHp = glad.hp !== undefined ? glad.hp : maxHp;
  const hpPct = Math.max(0, currentHp / maxHp);

  let hpMultiplier = 1.0;
  if (hpPct < 0.25) {
    hpMultiplier = 0.50;
  } else if (hpPct < 0.50) {
    hpMultiplier = 0.85;
  } else if (hpPct < 0.75) {
    hpMultiplier = 0.90;
  }

  rawChance = rawChance * hpMultiplier;

  // Quests 15% harder across the board (multiplier 0.85):
  const finalChance = Math.round(rawChance * 0.85);

  // Clamp within realistic RPG odds (10% minimum chance, 95% maximum cap)
  return Math.max(10, Math.min(95, finalChance));
}
