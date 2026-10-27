// Cinematic Story Dialogue Events for Gladiator Manager
// Rich narrative vignettes for each warrior culture exploring their homeland,
// memory of freedom, combat ethos, and in-world quest dilemmas presented to Dominus.

import type { Culture } from '../types';

export interface StoryDialogueEvent {
  id: string;
  culture: Culture;
  title: string;
  lines: string[];
  questNodeId: string; // The linked quest node presented at the end of dialogue
}

export const STORY_EVENTS: Record<Culture, StoryDialogueEvent[]> = {
  roman: [
    {
      id: 'roman_quest_senator',
      culture: 'roman',
      title: "The Senator's Subura Gambit",
      lines: [
        'Dominus, an envoy bearing the gold signet ring of Senator Gaius approached me in the shadows of the bathhouse.',
        'A rival merchant threatens to expose his private accounting ledgers to the Praetorians before dawn, and the Senator offers a lavish purse for seasoned muscle.',
        'He wants a champion from our ludus to enter the merchant villa in the Subura and secure those ledgers before the morning cohort marches.',
      ],
      questNodeId: 'senator_s1_start',
    },
    {
      id: 'roman_quest_magistrate',
      culture: 'roman',
      title: 'The Imperial Tribute Escort',
      lines: [
        'Dominus, an imperial clerk bearing the seal of the City Magistrate has entered our courtyard with an urgent commission.',
        'A convoy carrying five hundred talents of silver for the Grand Coliseum Games arrives tomorrow along the Appian Way, but deserters infest the hills.',
        'The Magistrate demands our strongest champion to command the forward guard and safeguard the Emperor’s silver.',
      ],
      questNodeId: 'magistrate_s1_start',
    },
    {
      id: 'roman_quest_debt',
      culture: 'roman',
      title: 'Subura Debtors’ Den',
      lines: [
        'Dominus, word has reached me that my former cohort comrade has been chained by loan-sharks in the lower Subura.',
        'He knows the patrol rotations of the arena guard and promises vital tactical intel if we liberate him from the extortioners.',
        'Give me leave to dispatch a team to breach their cellar and settle his debt with steel or coin.',
      ],
      questNodeId: 'roman_debt_start',
    },
  ],

  celt: [
    {
      id: 'celt_quest_torc',
      culture: 'celt',
      title: 'The Stolen Golden Torc',
      lines: [
        'Dominus! My scouts in the cattle forum have located the Roman slaver who stripped the sacred golden torc from my fallen clan-brother.',
        'He travels with six bodyguards toward the southern villas. That torc was blessed by the druids in the ancient oak groves of Gaul—it belongs to our bloodline!',
        'Give me leave to lead an expedition to reclaim our honor and bring back their seized treasury!',
      ],
      questNodeId: 'celt_torc_start',
    },
    {
      id: 'celt_quest_rebel',
      culture: 'celt',
      title: 'The Broken Collar',
      lines: [
        'Dominus, a fugitive warrior carrying secret markings has arrived at our camp gate under cover of the night fog.',
        'Over fifty of our kin who shattered their iron collars in the Capuan pits hide in the olive groves of Mount Vesuvius, hunted by Roman bounty hounds.',
        'They lack weapons and beg our ludus to send a veteran champion to guide their vanguard through the mountain pass.',
      ],
      questNodeId: 'slave_s1_start',
    },
  ],

  berber: [
    {
      id: 'berber_quest_smugglers',
      culture: 'berber',
      title: 'The Subterranean Smugglers',
      lines: [
        'Dominus, an underworld courier from the Numidian trade routes came to me under cover of dusk.',
        'A clandestine caravan carrying tempered Iberian blades and barbarian gold is stalled beneath the Aqueduct, watched by the City Cohort.',
        'The Shadow Broker offers half the contraband if our ludus provides the muscle to secure the passage.',
      ],
      questNodeId: 'shadow_s1_start',
    },
    {
      id: 'berber_quest_port',
      culture: 'berber',
      title: 'Desert Stallions at Ostia',
      lines: [
        'Dominus, a merchant vessel from the North African coast has docked at Ostia carrying swift desert chargers and rare medicinal balms.',
        'Corrupt port censors have impounded the cargo, demanding extortionate bribes to release it to our camp.',
        'Dispatch an operative to negotiate or seize our rightful supplies before the magistrate auctions them.',
      ],
      questNodeId: 'berber_port_start',
    },
  ],

  scythian: [
    {
      id: 'scythian_quest_bellona',
      culture: 'scythian',
      title: 'The War Goddess’s Altar',
      lines: [
        'Dominus, a priestess bearing the sacred blood-crested raven standard of Bellona has come seeking champions from our stable.',
        'The war temple calls upon fearless arena fighters to conquer the subterranean Ordeal of Blades in the Temple of Mars.',
        'Those who survive are consecrated with sacred relics and golden tributes that elevate our standing across Rome.',
      ],
      questNodeId: 'bellona_s1_start',
    },
    {
      id: 'scythian_quest_courier',
      culture: 'scythian',
      title: 'The Steppe Courier’s Plight',
      lines: [
        'Dominus, an allied scout from our northern steppe clans was intercepted by auxiliary border cavalry along the Via Flaminia.',
        'He is held at a fortified staging post before being marched to the execution pits.',
        'With swift movement and long-range bow fire, a dispatched champion could break the stockade and rescue him before sunrise.',
      ],
      questNodeId: 'scythian_courier_start',
    },
  ],

  hunnic: [
    {
      id: 'hunnic_quest_feud',
      culture: 'hunnic',
      title: 'The Rival Ludus Sabotage',
      lines: [
        'Dominus! I caught two prowlers near our water cisterns carrying hemlock vials bearing the seal of a rival patrician stable.',
        'They fear our squad in the upcoming Coliseum games and attempted to cripple our champions in the dark.',
        'In our war-bands, treachery is answered with fire and steel. Give the order to raid their suburban armory and teach them fear!',
      ],
      questNodeId: 'hunnic_raid_start',
    },
    {
      id: 'hunnic_quest_vault',
      culture: 'hunnic',
      title: 'The Catacomb Plunder',
      lines: [
        'Dominus, word from the underground catacombs: a forgotten imperial tribute vault lies half-collapsed beneath the old forum.',
        'Rival cutthroats circle the ruins, but our layered iron lamellar blades can shatter their barricades.',
        'A fortune in unminted bullion awaits if we strike before the praetorian night watch awakens.',
      ],
      questNodeId: 'shadow_s1_start',
    },
  ],
};

export type StoryPhase =
  | 'inactive'
  | 'bar_rising'
  | 'portrait_fading_in'
  | 'typing'
  | 'line_ready'
  | 'quest_choice'
  | 'closing_fade'
  | 'closing_bar_lowering';

export interface ActiveStoryState {
  phase: StoryPhase;
  event: StoryDialogueEvent | null;
  gladiatorId: string;
  gladiatorName: string;
  culture: Culture;
  currentLineIndex: number;
  typedCharCount: number;
  phaseTimer: number;
  portraitColorAlpha: number;
  barRiseProgress: number; // 0 = off screen bottom, 1 = fully raised
  bgDimmerAlpha: number;   // 0 = normal, 1 = max dim
  isSpeedingUp: boolean;
  charTimer: number;
}

export const INITIAL_STORY_STATE: ActiveStoryState = {
  phase: 'inactive',
  event: null,
  gladiatorId: '',
  gladiatorName: '',
  culture: 'roman',
  currentLineIndex: 0,
  typedCharCount: 0,
  phaseTimer: 0,
  portraitColorAlpha: 0,
  barRiseProgress: 0,
  bgDimmerAlpha: 0,
  isSpeedingUp: false,
  charTimer: 0,
};

/**
 * Selects a random story quest event for a given gladiator.
 */
export function getStoryEventForGladiator(
  gladiatorId: string,
  gladiatorName: string,
  culture: Culture,
): StoryDialogueEvent {
  const events = STORY_EVENTS[culture] || STORY_EVENTS.roman;
  const chosen = events[Math.floor(Math.random() * events.length)];
  return chosen;
}
