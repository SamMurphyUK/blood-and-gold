/**
 * ART & GAMEPLAY ASSET SNAPSHOT: MAINLINE 2.0 (MAINLINE-2.0 / MAINLINE_2_0)
 *
 * Tag: MAINLINE-2.0 / MAINLINE_2_0
 * Tag Message: "MAINLINE 2.0 - Traveling merchant walking physics & caravan bazaar fix, clean camp hover rendering (no flashing boxes), casualty header cleanup, dynamic procedural arena side-skirmishes scaling with podium clearance"
 * Date: 2026-10-26
 *
 * Dedicated permanent snapshot file bundling:
 * - 16-color antiquity palette constants & theme configurations
 * - Traveling Nomad Merchant state machine & delta-time walking physics
 * - Caravan Bazaar exotic wares & relics trading
 * - Clean camp rendering with zero hover boxes or flashing strokeRects
 * - Dynamic procedural arena side-skirmishes scaling by completed podium trials
 * - Casualty header cleanup on victory/aftermath screens
 * - 5 Cultural Gladiators with distinct sprites, walk cycles, and weapons
 * - Multi-Fighter Arena Battles with Real-Time Movement, AI Psychology, Stamina, Pin/Grapple, CRIT & Dramatic Finisher
 * - Pairwise Brotherhood bonding system metrics & aftermath narrative generators
 */

// ============================================================================
// 1. SNAPSHOT METADATA & REPOSITORY VERSION CONSTANTS
// ============================================================================

export const SNAPSHOT_TAG = 'MAINLINE-2.0';
export const SNAPSHOT_TAG_ALT = 'MAINLINE_2_0';
export const SNAPSHOT_TAG_MESSAGE =
  'MAINLINE 2.0 - Traveling merchant walking physics & caravan bazaar fix, clean camp hover rendering (no flashing boxes), casualty header cleanup, dynamic procedural arena side-skirmishes scaling with podium clearance';

export const SNAPSHOT_METADATA = {
  version: '2.0.0',
  name: 'MAINLINE 2.0',
  tag: SNAPSHOT_TAG,
  altTag: SNAPSHOT_TAG_ALT,
  message: SNAPSHOT_TAG_MESSAGE,
  timestamp: '2026-10-26T07:01:00-07:00',
  gameTitle: 'Ludus Champion',
  startingGold: 0,
  respiteCostSchedule: [200, 400, 600, 1200] as const,
  manikinSpotlightDelaySec: 5.0,
  podiumReturnToCampAllowed: true,
  travelingMerchant: {
    spawnX: 24,
    spawnY: 110,
    targetX: 180,
    targetY: 106,
    sitDurationSec: 25.0,
  },
  sideSkirmishTiers: {
    tier1: { squadSize: '1-2', levels: '1-2', goldReward: '40-75' },
    tier2: { squadSize: '2-3', levels: '2-3', goldReward: '90-160' },
    tier3: { squadSize: '3-4', levels: '3-4', goldReward: '180-280' },
    tier4Plus: { squadSize: '4-5', levels: '4-5', goldReward: '300-450+' },
  },
  logicResolution: {
    width: 344,
    height: 192,
    pixelScale: 4,
    displayCanvasWidth: 1376,
    displayCanvasHeight: 768,
  },
} as const;

// ============================================================================
// 2. VERIFIED 16-COLOR ANTIQUITY PALETTE & THEME
// ============================================================================

export const PALETTE = [
  '#ded095', // 0: pale parchment yellow / alabaster
  '#cb9f6b', // 1: sand ochre / light tan
  '#ba7654', // 2: terracotta clay
  '#9e4a42', // 3: deep roman crimson / rust
  '#6d3947', // 4: wine / burgundy
  '#3f363b', // 5: dark iron / charred brown-gray
  '#47505c', // 6: slate blue-gray
  '#55796f', // 7: weathered verdigris / dark sage
  '#88997a', // 8: olive sage green
  '#574b50', // 9: dark taupe / charcoal mauve
  '#817475', // 10: weathered stone gray
  '#a4968d', // 11: warm gray / limestone
  '#6f705a', // 12: mossy olive drab
  '#9da056', // 13: golden olive / brassy green
  '#7f644b', // 14: raw umber / leather brown
  '#9c8053', // 15: bronze / antique gold
] as const;

export type PaletteColor = (typeof PALETTE)[number];

export const THEME = {
  fontFamily: "'Cinzel', 'Trajan Pro', Georgia, serif",
  colors: {
    bgDark: '#3f363b',
    panelBg: '#574b50',
    panelBorder: '#7f644b',
    goldAccent: '#ded095',
    crimsonAccent: '#9e4a42',
    tealAccent: '#55796f',
    sandYellow: '#cb9f6b',
    textMain: '#ded095',
    textMuted: '#a4968d',
  },
};

// ============================================================================
// 3. CULTURAL ARCHETYPES & SQUAD DATA
// ============================================================================

export type Culture = 'roman' | 'celt' | 'berber' | 'scythian' | 'hunnic';
export type CombatTactics = 'aggressive' | 'defensive' | 'ranged';

export const CULTURE_LABELS: Record<Culture, string> = {
  roman: 'Roman Murmillo',
  celt: 'Celtic Champion',
  berber: 'Berber Skirmisher',
  scythian: 'Scythian Lancer',
  hunnic: 'Hunnic Raider',
};

export const CULTURE_DESCRIPTIONS: Record<Culture, string> = {
  roman: 'Heavy bronze crested helmet, segmented lorica, Scutum tower shield & Gladius.',
  celt: 'Golden torc, tribal woad war-paint, heavy spatha iron blade & painted round shield.',
  berber: 'Desert linen headwrap, swift curved falcata blade & tempered bronze buckler.',
  scythian: 'Pointed steppe leather cap, decorated tunic, long lance & composite recurve bow.',
  hunnic: 'Fur-lined iron skullcap, layered lamellar armor plates & curved cavalry sabre.',
};

// ============================================================================
// 4. WEAPON & CARAVAN BAZAAR DATABASE
// ============================================================================

export interface WeaponDef {
  id: string;
  name: string;
  slotType: 'RIGHT' | 'LEFT' | 'BOTH';
  tier: 1 | 2 | 3;
  cost: number;
  atkBonus: number;
  defBonus: number;
  spdBonus: number;
  critBonus?: number;
  pinBonus?: number;
  description: string;
  icon: string;
}

export const WEAPON_DATABASE: Record<string, WeaponDef> = {
  gladius: {
    id: 'gladius',
    name: 'Gladius',
    slotType: 'RIGHT',
    tier: 1,
    cost: 80,
    atkBonus: 6,
    defBonus: 0,
    spdBonus: 0,
    description: 'Standard double-edged Roman short sword for close-quarters thrusting.',
    icon: '🗡️',
  },
  sica: {
    id: 'sica',
    name: 'Sica',
    slotType: 'RIGHT',
    tier: 2,
    cost: 220,
    atkBonus: 14,
    defBonus: 0,
    spdBonus: 0,
    critBonus: 0.05,
    description: 'Curved Thracian falchion blade designed to hook around enemy shields (+5% Crit).',
    icon: '⚔️',
  },
  fuscina: {
    id: 'fuscina',
    name: 'Fuscina / Trident',
    slotType: 'RIGHT',
    tier: 3,
    cost: 480,
    atkBonus: 24,
    defBonus: 0,
    spdBonus: 0,
    critBonus: 0.10,
    description: 'Three-pronged barbed masterwork trident for punishing reach and lethal strikes (+10% Crit).',
    icon: '🔱',
  },
  parmula: {
    id: 'parmula',
    name: 'Parmula',
    slotType: 'LEFT',
    tier: 1,
    cost: 75,
    atkBonus: 0,
    defBonus: 6,
    spdBonus: 4,
    description: 'Light rounded bronze buckler providing nimble mobility and reliable deflection.',
    icon: '🛡️',
  },
  scutum: {
    id: 'scutum',
    name: 'Scutum',
    slotType: 'LEFT',
    tier: 2,
    cost: 210,
    atkBonus: 0,
    defBonus: 16,
    spdBonus: 0,
    description: 'Heavy curved legionary tower shield offering tremendous protection against blows.',
    icon: '🛡️',
  },
  rete: {
    id: 'rete',
    name: 'Rete',
    slotType: 'LEFT',
    tier: 3,
    cost: 450,
    atkBonus: 0,
    defBonus: 10,
    spdBonus: 0,
    pinBonus: 0.15,
    description: 'Weighted combat entanglement net to ensnare foes (+15% Pin/Control chance).',
    icon: '🕸️',
  },
  spiculum: {
    id: 'spiculum',
    name: 'Spiculum',
    slotType: 'BOTH',
    tier: 1,
    cost: 180,
    atkBonus: 12,
    defBonus: 4,
    spdBonus: 0,
    description: 'Heavy war spear with steel ferrule, combining thrusting power and guard reach.',
    icon: '🥢',
  },
  heavy_falx: {
    id: 'heavy_falx',
    name: 'Heavy Falx',
    slotType: 'BOTH',
    tier: 2,
    cost: 380,
    atkBonus: 28,
    defBonus: 0,
    spdBonus: -4,
    description: 'Brutal two-handed Dacian curved cleaver that hacks through armor with savage force.',
    icon: '🪓',
  },
  imperial_rhomphaia: {
    id: 'imperial_rhomphaia',
    name: 'Imperial Rhomphaia',
    slotType: 'BOTH',
    tier: 3,
    cost: 750,
    atkBonus: 42,
    defBonus: 0,
    spdBonus: 0,
    description: 'Devastating masterwork two-handed greatblade crafted for emperors and high champions.',
    icon: '🗡️',
  },
  damascene_spatha: {
    id: 'damascene_spatha',
    name: 'Damascene Spatha',
    slotType: 'RIGHT',
    tier: 3,
    cost: 620,
    atkBonus: 32,
    defBonus: 0,
    spdBonus: 2,
    critBonus: 0.12,
    description: 'Forged from folded crucible steel with mesmerizing water-markings (+12% Crit).',
    icon: '🗡️',
  },
  obsidian_kopis: {
    id: 'obsidian_kopis',
    name: 'Obsidian Kopis',
    slotType: 'RIGHT',
    tier: 3,
    cost: 720,
    atkBonus: 36,
    defBonus: 0,
    spdBonus: 0,
    critBonus: 0.15,
    description: 'Vicious forward-curving blade inlaid with razor obsidian shards (+15% Crit).',
    icon: '⚔️',
  },
  gilded_tower_aegis: {
    id: 'gilded_tower_aegis',
    name: 'Gilded Tower Aegis',
    slotType: 'LEFT',
    tier: 3,
    cost: 650,
    atkBonus: 0,
    defBonus: 24,
    spdBonus: 2,
    pinBonus: 0.20,
    description: 'Gold-leaf reinforced legionary bulwark offering unrivaled protection and shield bashes (+20% Pin).',
    icon: '🛡️',
  },
  spiked_caestus: {
    id: 'spiked_caestus',
    name: 'Spiked Caestus',
    slotType: 'RIGHT',
    tier: 3,
    cost: 580,
    atkBonus: 28,
    defBonus: 4,
    spdBonus: 6,
    critBonus: 0.10,
    pinBonus: 0.25,
    description: 'Iron-studded leather combat wraps allowing blindingly fast strikes and grapple control (+25% Pin, +10% Crit).',
    icon: '🥊',
  },
  imperial_dragon_standard: {
    id: 'imperial_dragon_standard',
    name: 'Imperial Dragon Standard',
    slotType: 'BOTH',
    tier: 3,
    cost: 980,
    atkBonus: 48,
    defBonus: 12,
    spdBonus: 0,
    critBonus: 0.15,
    pinBonus: 0.20,
    description: 'Legendary two-handed imperial standard crowned with a gilded draco totem (+15% Crit, +20% Pin).',
    icon: '🚩',
  },
};

// ============================================================================
// 5. TRAVELING NOMAD MERCHANT STATE & RENDERING
// ============================================================================

export interface TravelingMerchantState {
  active: boolean;
  state: 'entering' | 'sitting' | 'leaving';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  sitTimer: number;
  hasPlayedSitSpeech: boolean;
  hasPlayedDepartSpeech: boolean;
  flipX: boolean;
  animTimer: number;
}

export const INITIAL_MERCHANT_STATE: TravelingMerchantState = {
  active: false,
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

// ============================================================================
// 6. PROCEDURAL SIDE-SKIRMISH BOUNTY SYSTEM
// ============================================================================

export interface SideEnemyDef {
  name: string;
  culture: Culture;
  title: string;
  tactics: CombatTactics;
  category: 'Rogue Thracians' | 'Pit Brawlers' | 'Deserter Legionaries' | 'Desert Nomads' | 'Wild Beasts & Handlers';
}

export const SIDE_FIGHTER_POOL: SideEnemyDef[] = [
  { name: 'Rogue Thracian Sica-Bearer', culture: 'celt', title: 'Renegade Duelist', tactics: 'aggressive', category: 'Rogue Thracians' },
  { name: 'Thracian Falx Cleaver', culture: 'celt', title: 'Two-Handed Reaver', tactics: 'aggressive', category: 'Rogue Thracians' },
  { name: 'Rebel Thraex Vanguard', culture: 'celt', title: 'Outlaw Pit Striker', tactics: 'aggressive', category: 'Rogue Thracians' },
  { name: 'Unchained Pit Brawler', culture: 'roman', title: 'Caestus Bruiser', tactics: 'aggressive', category: 'Pit Brawlers' },
  { name: 'Subterranean Pit Mauler', culture: 'hunnic', title: 'Bare-Knuckle Enforcer', tactics: 'aggressive', category: 'Pit Brawlers' },
  { name: 'Scarred Arena Heavyweight', culture: 'roman', title: 'Underground Veteran', tactics: 'defensive', category: 'Pit Brawlers' },
  { name: 'Deserter Hastatus', culture: 'roman', title: 'Shield-Wall Defector', tactics: 'defensive', category: 'Deserter Legionaries' },
  { name: 'Mutinous Legion Veteran', culture: 'roman', title: 'Disciplined Outcast', tactics: 'defensive', category: 'Deserter Legionaries' },
  { name: 'Turncoat Centurion', culture: 'roman', title: 'Rogue Formation Leader', tactics: 'defensive', category: 'Deserter Legionaries' },
  { name: 'Numidian Sling Scout', culture: 'berber', title: 'Dune Skirmisher', tactics: 'ranged', category: 'Desert Nomads' },
  { name: 'Berber Sand-Stalker', culture: 'berber', title: 'Swift Falcata Raider', tactics: 'aggressive', category: 'Desert Nomads' },
  { name: 'Bedouin Desert Raider', culture: 'berber', title: 'Desert Archer', tactics: 'ranged', category: 'Desert Nomads' },
  { name: 'Scythian Steppe Outlaw', culture: 'scythian', title: 'Composite Recurve Lancer', tactics: 'ranged', category: 'Desert Nomads' },
  { name: 'Arena Beastmaster', culture: 'berber', title: 'Savage Lion-Handler', tactics: 'ranged', category: 'Wild Beasts & Handlers' },
  { name: 'Pit Mastiff Handler', culture: 'celt', title: 'War-Hound Breeder', tactics: 'aggressive', category: 'Wild Beasts & Handlers' },
  { name: 'Iberian Wolf Wrangler', culture: 'scythian', title: 'Predator Wrangler', tactics: 'defensive', category: 'Wild Beasts & Handlers' },
];
