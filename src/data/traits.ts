// Moved verbatim out of App.tsx / portraits.ts (Stage 1 decoupling). No logic changes.

import type {PersonalityTrait, TraitDefinition} from '../types';

export const TRAIT_DEFINITIONS: Record<PersonalityTrait, TraitDefinition> = {
  'Proud': {
    name: 'Proud',
    title: 'Proud',
    effect: 'Despises being mocked; gains +20% morale & resolve from honorable inspiration.',
    flavor: 'Highborn heritage and stubborn pride. Will never submit easily to humiliation.',
    color: '#cb9f6b',
    badgeBg: '#3f3126',
  },
  'Scarred Veteran': {
    name: 'Scarred Veteran',
    title: 'Scarred Veteran',
    effect: 'Immune to panic and fear checks in combat; +15% resistance to stagger.',
    flavor: 'Carries the deep gashes of twenty arena seasons; unfazed by the sight of severed limbs.',
    color: '#ded095',
    badgeBg: '#3f363b',
  },
  'Crowd Pleaser': {
    name: 'Crowd Pleaser',
    title: 'Crowd Pleaser',
    effect: 'Generates +25% extra gold and renown on dramatic finishing blows.',
    flavor: 'Plays to the roaring bleachers with theatrical flourish and dramatic execution.',
    color: '#fbbf24',
    badgeBg: '#42341d',
  },
  'Claustrophobic': {
    name: 'Claustrophobic',
    title: 'Claustrophobic',
    effect: 'Panics in tight clusters; gains +10% movement speed and agility when flanking in open sand.',
    flavor: 'Yearns for open sky and wide steppe horizons; despises crowded choke points.',
    color: '#88997a',
    badgeBg: '#2a3328',
  },
  'Bloodthirsty': {
    name: 'Bloodthirsty',
    title: 'Bloodthirsty',
    effect: 'Enters a feral berserk frenzy (+15% Crit) when any enemy falls below 20% HP.',
    flavor: 'The scent of spilled blood awakens a savage battle joy that cannot be reasoned with.',
    color: '#ba7654',
    badgeBg: '#44221d',
  },
  'Resilient': {
    name: 'Resilient',
    title: 'Resilient',
    effect: 'Recovers +25% faster from fatigue and pins; +10% natural damage reduction when wounded.',
    flavor: 'Dense bone and forged sinew. Shrugs off bruises that would fell lesser men.',
    color: '#55796f',
    badgeBg: '#223531',
  },
  'Insecure': {
    name: 'Insecure',
    title: 'Insecure',
    effect: 'Vulnerable to harsh mockery (-15% DEF); flourishes under patient mentorship (+15% ATK).',
    flavor: 'Haunted by fear of failure under the glaring eyes of the Roman crowd.',
    color: '#a4968d',
    badgeBg: '#342e30',
  },
  'Mad': {
    name: 'Mad',
    title: 'Mad',
    effect: 'Erratic decision-making in the arena; hallucinates lights beneath the sand; +15% unpredictable damage variance.',
    flavor: 'The mind fractured under relentless psychological strain. Listens to the dirt singing.',
    color: '#9e4a42',
    badgeBg: '#381c20',
  },
};
