// Moved verbatim out of App.tsx / portraits.ts (Stage 1 decoupling). No logic changes.

import type {SideEnemyDef} from '../types';

export const SIDE_FIGHTER_POOL: SideEnemyDef[] = [
  { name: 'Renegade Thracian Sica-Bearer', culture: 'celt', title: 'Renegade Duelist', tactics: 'aggressive', category: 'Renegade Thracians' },
  { name: 'Thracian Falx Cleaver', culture: 'celt', title: 'Two-Handed Reaver', tactics: 'aggressive', category: 'Renegade Thracians' },
  { name: 'Outlaw Thraex Vanguard', culture: 'celt', title: 'Outlaw Pit Striker', tactics: 'aggressive', category: 'Renegade Thracians' },
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
  // CAVALRY UNITS IN SIDE SKIRMISH POOL (Higher appearance rate)
  { name: 'Imperial Equites Deserter', culture: 'roman', title: 'Renegade Cavalry Lancer', tactics: 'aggressive', category: 'Mounted Outriders', isCavalry: true },
  { name: 'Steppe Cavalry Raider', culture: 'hunnic', title: 'Mounted Steppe Outrider', tactics: 'aggressive', category: 'Mounted Outriders', isCavalry: true },
  { name: 'Numidian Cavalry Scout', culture: 'berber', title: 'Desert Outrider', tactics: 'aggressive', category: 'Mounted Outriders', isCavalry: true },
  { name: 'Gallic Noble Cavalry', culture: 'celt', title: 'Mounted Gallic Lancer', tactics: 'aggressive', category: 'Mounted Outriders', isCavalry: true },
  { name: 'Scythian Outrider Lancer', culture: 'scythian', title: 'Mounted Steppe Lancer', tactics: 'aggressive', category: 'Mounted Outriders', isCavalry: true },
  // COLOSSAL ENEMY ARCHETYPE: WAR ELEPHANT
  { name: 'Carthaginian War Elephant', culture: 'berber', title: 'Armored War Beast', tactics: 'aggressive', category: 'Wild Beasts & Handlers', isElephant: true },
];
