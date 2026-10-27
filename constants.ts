/**
 * Game Configuration for Gladiator Manager
 */

import playgroundFile from './playground_config.json';

export const PALETTE = [
  '#ded095', // 0: pale parchment yellow
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

export type PaletteColor = (typeof PALETTE)[number] | string;

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

export const CONFIG = {
  // Baseline Game Information
  title: {
    value: 'BLOOD AND GOLD',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1376,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 768,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System Constants
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // Thematic Elements
  backgroundColor: {
    value: '#090d16',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#fbbf24',
    type: 'color',
    label: 'Primary Color',
    group: 'THEME',
  },
  fontFamily: {
    value: THEME.fontFamily,
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio Volumes
  defaultMusicVolume: {
    value: 0.5,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.7,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Rules & Gameplay Balances
  startingGold: {
    value: 0,
    type: 'number',
    label: 'Starting Gold',
    group: 'RULES',
  },
  recruitCostBase: {
    value: 120,
    type: 'number',
    label: 'Recruitment Base Cost',
    group: 'RULES',
  },
  armoryUpgradeCostBase: {
    value: 75,
    type: 'number',
    label: 'Armory Upgrade Base Cost',
    group: 'RULES',
  },
  minGoldLossThreshold: {
    value: 50,
    type: 'number',
    label: 'Min Gold Loss Threshold',
    group: 'RULES',
  },

  // Assets Aspect Ratios & Dimensions (derived from read_assets_metadata)
  assetCampBgAspectRatio: {
    value: 1.79166667,
    type: 'number',
    label: 'Camp Background Aspect Ratio',
    group: 'ASSETS',
  },
  assetCampBgWidth: {
    value: 1376,
    type: 'number',
    label: 'Camp Background Width',
    group: 'ASSETS',
  },
  assetCampBgHeight: {
    value: 768,
    type: 'number',
    label: 'Camp Background Height',
    group: 'ASSETS',
  },

  assetArenaBgAspectRatio: {
    value: 1.79166667,
    type: 'number',
    label: 'Arena Background Aspect Ratio',
    group: 'ASSETS',
  },
  assetArenaBgWidth: {
    value: 1376,
    type: 'number',
    label: 'Arena Background Width',
    group: 'ASSETS',
  },
  assetArenaBgHeight: {
    value: 768,
    type: 'number',
    label: 'Arena Background Height',
    group: 'ASSETS',
  },

  assetCampTentAspectRatio: {
    value: 1.02411348,
    type: 'number',
    label: 'Camp Tent Aspect Ratio',
    group: 'ASSETS',
  },
  assetCampTentWidth: {
    value: 722,
    type: 'number',
    label: 'Camp Tent Width',
    group: 'ASSETS',
  },
  assetCampTentHeight: {
    value: 705,
    type: 'number',
    label: 'Camp Tent Height',
    group: 'ASSETS',
  },

  assetDummyAspectRatio: {
    value: 0.51990632,
    type: 'number',
    label: 'Training Dummy Aspect Ratio',
    group: 'ASSETS',
  },
  assetDummyWidth: {
    value: 444,
    type: 'number',
    label: 'Training Dummy Width',
    group: 'ASSETS',
  },
  assetDummyHeight: {
    value: 854,
    type: 'number',
    label: 'Training Dummy Height',
    group: 'ASSETS',
  },

  assetCoinAspectRatio: {
    value: 1.27112676,
    type: 'number',
    label: 'Gold Coin Icon Aspect Ratio',
    group: 'ASSETS',
  },
  assetCoinWidth: {
    value: 722,
    type: 'number',
    label: 'Gold Coin Icon Width',
    group: 'ASSETS',
  },
  assetCoinHeight: {
    value: 568,
    type: 'number',
    label: 'Gold Coin Icon Height',
    group: 'ASSETS',
  },

  assetSwordAspectRatio: {
    value: 1.52919021,
    type: 'number',
    label: 'Gladius Sword Icon Aspect Ratio',
    group: 'ASSETS',
  },
  assetSwordWidth: {
    value: 812,
    type: 'number',
    label: 'Gladius Sword Icon Width',
    group: 'ASSETS',
  },
  assetSwordHeight: {
    value: 531,
    type: 'number',
    label: 'Gladius Sword Icon Height',
    group: 'ASSETS',
  },

  assetShieldAspectRatio: {
    value: 0.61268556,
    type: 'number',
    label: 'Scutum Shield Icon Aspect Ratio',
    group: 'ASSETS',
  },
  assetShieldWidth: {
    value: 454,
    type: 'number',
    label: 'Scutum Shield Icon Width',
    group: 'ASSETS',
  },
  assetShieldHeight: {
    value: 741,
    type: 'number',
    label: 'Scutum Shield Icon Height',
    group: 'ASSETS',
  },
};

type ConfigValue = number | string | boolean;

const PLAYGROUND_DEFAULTS: Record<string, ConfigValue> = {};
for (const entry of playgroundFile.schema) {
  PLAYGROUND_DEFAULTS[entry.name] = entry.default;
}

function isUsableConfigValue(value: unknown, type: string): value is ConfigValue {
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'string' || type === 'color') return typeof value === 'string' && value.length > 0;
  return value != null && value !== '';
}

/**
 * Playground injects `globalThis.playgroundConfig` only after its SDK is up.
 * Standalone playback uses the shipped `values` in playground_config.json,
 * including a real starting purse of 0. Undefined and NaN are still rejected.
 */
function readConfiguredValue(key: string): unknown {
  const values = (playgroundFile as {values?: Record<string, unknown>}).values;
  if (!values || typeof values !== 'object') return undefined;
  return values[key];
}

function readPlaygroundOverride(key: string): unknown {
  const injected = (globalThis as {playgroundConfig?: Record<string, unknown>})
    .playgroundConfig;
  if (!injected || typeof injected !== 'object') return undefined;
  return injected[key];
}

/** Type helper for reading values in game code */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * Live Playground overrides win. Otherwise the value falls back to the
 * matching default in playground_config.json, then to the baked CONFIG entry.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  const entry = CONFIG[key];
  const override = readPlaygroundOverride(key);
  if (isUsableConfigValue(override, entry.type)) {
    return override as (typeof CONFIG)[K]['value'];
  }
  const configured = readConfiguredValue(key);
  if (isUsableConfigValue(configured, entry.type)) {
    return configured as (typeof CONFIG)[K]['value'];
  }
  const fallback = PLAYGROUND_DEFAULTS[key];
  if (fallback !== undefined && isUsableConfigValue(fallback, entry.type)) {
    return fallback as (typeof CONFIG)[K]['value'];
  }
  if (isUsableConfigValue(entry.value, entry.type)) {
    return entry.value;
  }
  return (typeof fallback === 'number' ? fallback : entry.value) as (typeof CONFIG)[K]['value'];
}
