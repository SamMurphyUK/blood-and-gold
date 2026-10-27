// Stage 3A: recalculateGladiatorStats, moved verbatim out of App.tsx so the update systems can use it without importing App.

import type {Gladiator} from '../types';
import {WEAPON_DATABASE} from '../data/weapons';

export function recalculateGladiatorStats(glad: Gladiator): Gladiator {
  const attrs = glad.attributes || { str: 10, dex: 10, vit: 10, con: 10, wil: 10 };
  const str = attrs.str ?? 10;
  const dex = attrs.dex ?? 10;
  const vit = attrs.vit ?? attrs.con ?? 10;

  // Bounded ~20% attribute scaling:
  // e.g. base modifier: 1 + (stat - 10) * 0.02. Across typical stat variance 5 to 15, modifier spans 0.90 to 1.10 (a ~20% range)
  const strMod = Math.max(0.85, Math.min(1.25, 1 + (str - 10) * 0.02));
  const dexMod = Math.max(0.85, Math.min(1.25, 1 + (dex - 10) * 0.02));
  const vitMod = Math.max(0.85, Math.min(1.25, 1 + (vit - 10) * 0.02));

  // STR directly scales melee attack power (~20% difference)
  let atk = Math.max(1, Math.round(glad.baseAttack * strMod));
  let def = glad.baseDefense;
  // DEX directly scales attack rate & speed (~20% difference)
  let spd = Math.max(1, Math.round(glad.baseSpeed * dexMod));
  // VIT directly scales maximum health points pool (~20% difference)
  const rawBaseHp = 135 + (glad.level || 1) * 15;
  let maxHp = Math.max(80, Math.round(rawBaseHp * vitMod));

  // Weight class modifiers
  if (glad.weightClass === 'Lightweight') {
    spd += 3;
    atk += 1;
    maxHp = Math.max(80, maxHp - 20);
  } else if (glad.weightClass === 'Heavyweight') {
    spd = Math.max(5, spd - 3);
    def += 3;
    atk += 3;
    maxHp += 30;
  } else if (glad.weightClass === 'Colossal') {
    spd = Math.max(4, spd - 5);
    def += 8;
    atk += 6;
    maxHp += 80;
  }

  const rightW = glad.equipped.rightHand ? WEAPON_DATABASE[glad.equipped.rightHand] : null;
  const leftW = glad.equipped.leftHand ? WEAPON_DATABASE[glad.equipped.leftHand] : null;

  if (rightW && rightW.slotType === 'BOTH') {
    atk += rightW.atkBonus;
    def += rightW.defBonus;
    spd += rightW.spdBonus;
  } else {
    if (rightW) {
      atk += rightW.atkBonus;
      def += rightW.defBonus;
      spd += rightW.spdBonus;
    }
    if (leftW) {
      atk += leftW.atkBonus;
      def += leftW.defBonus;
      spd += leftW.spdBonus;
    }
  }

  // Pep talk status modifiers (reduced by 50% for tactical balance, with backfire risks)
  if (glad.pepTalkStatus === 'Inspire') {
    atk = Math.round(atk * 1.08);
    def = Math.round(def * 1.08);
  } else if (glad.pepTalkStatus === 'Petulant') {
    // Backfire: Proud gladiator petulant scorn / distraction
    spd = Math.max(4, Math.round(spd * 0.92));
  } else if (glad.pepTalkStatus === 'Panic') {
    // Backfire: Threatened resentful panic
    def = Math.max(0, Math.round(def * 0.90));
    spd = Math.max(4, Math.round(spd * 0.90));
  } else if (glad.pepTalkStatus === 'Reckless') {
    // Backfire: Bloodlust reckless aggression (+15% dmg dealt, takes +15% more damage / -15% DEF)
    atk = Math.round(atk * 1.15);
    def = Math.max(0, Math.round(def * 0.85));
  } else if (glad.pepTalkStatus === 'Rage') {
    atk = Math.round(atk * 1.08);
  } else if (glad.pepTalkStatus === 'Resolve') {
    def = Math.round(def * 1.08);
  } else if (glad.pepTalkStatus === 'Rattled') {
    def = Math.max(0, Math.round(def * 0.92));
  } else if (glad.pepTalkStatus === 'Hesitant') {
    spd = Math.max(4, Math.round(spd * 0.95));
  }

  if (glad.pepTalkThreatened) {
    atk = Math.round(atk * 1.15);
  }

  return {
    ...glad,
    attributes: {
      str,
      dex,
      vit,
      con: vit,
      wil: attrs.wil ?? 10,
    },
    maxHp: Math.max(80, maxHp),
    hp: Math.min(Math.max(1, glad.hp), Math.max(80, maxHp)),
    attack: Math.max(1, atk),
    defense: Math.max(0, def),
    speed: Math.max(1, spd),
  };
}
