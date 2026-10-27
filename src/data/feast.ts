// Moved verbatim out of App.tsx / portraits.ts (Stage 1 decoupling). No logic changes.

import type {Culture, PersonalityTrait} from '../types';

// Feast Dynamic Banter Lines specific to Culture, Personality Traits, and Camaraderie
export const FEAST_BANTER_BY_CULTURE: Record<Culture, string[]> = {
  roman: [
    'Three podiums broken. Even Rome whispers of our sand.',
    'Raise your cups! The legion bows to our brotherhood tonight.',
    'No centurion ever feasted on Falernian wine this sweet!',
  ],
  celt: [
    'Drink deep! The blood of our foes bought this wine tonight!',
    'By the ancient oak, roasted boar tastes sweeter after battle!',
    'To the fallen and to our iron blades! Pour more wine!',
  ],
  berber: [
    'In the south, we celebrate survival with song. Pass the roast!',
    'The desert winds never tasted wine this sweet.',
    'A warrior who conquers the arena drinks like an emperor tonight!',
  ],
  scythian: [
    'My horse may be gone, but my brothers stand beside me.',
    'We drink to the fallen, and to the sands we conquered.',
    'The steppe night has nothing on this fire and meat!',
  ],
  hunnic: [
    'Tonight we feast like warlords! Tomorrow we break more shields!',
    'Empty the amphora! We conquered three pedestals of blood!',
    'No master can hold our spirits when the roast is carved!',
  ],
};

export const FEAST_BANTER_BY_TRAIT: Record<PersonalityTrait, string[]> = {
  'Proud': [
    'The crowds learned who the true masters of the pit are.',
    'Three pedestals beneath our sandals. We are untouchable!',
  ],
  'Scarred Veteran': [
    'Twenty seasons in the sand, and this is the finest Falernian I have tasted.',
    'Scars heal fast when the meat is hot and the brotherhood is unbroken.',
  ],
  'Crowd Pleaser': [
    'Did you hear the roar of the bleachers? They will sing of us for generations!',
    'A toast to the spectators who showered us with coin and glory!',
  ],
  'Claustrophobic': [
    'Under this open night sky, with full flagons, I breathe free!',
    'No cage can hold us when our brothers sit beside us.',
  ],
  'Bloodthirsty': [
    'A feast of meat and red wine... almost as sweet as victory.',
    'Their shields shattered like pottery. Drink to the slaughter!',
  ],
  'Resilient': [
    'My bones still ache from their lances, but good wine mends all wounds.',
    'We took their fiercest blows and we are still here to drink their wine!',
  ],
  'Insecure': [
    'I feared I would falter, but you stood by me. Thank you, brothers.',
    'Together... we survived three podiums.',
  ],
  'Mad': [
    'THE WINE SINGS WITH THE DIRT! HAHAHA! PASS THE ROAST!',
    'Do you see the fire dancing on our cups? Glorious!',
  ],
};
