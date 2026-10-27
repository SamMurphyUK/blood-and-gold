// Moved verbatim out of App.tsx (Stage 2B rendering extraction). No logic changes.

import type {Culture} from '../types';

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
