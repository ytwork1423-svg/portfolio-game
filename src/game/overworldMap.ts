import { HubCollectible } from '../types/game';

export const HUB_WIDTH = 1800;
export const HUB_HEIGHT = 1080;

export const HUB_ISLAND_BOUNDS = {
  minX: 85,
  maxX: 1715,
  minY: 105,
  maxY: 975,
};

export const FOUNTAIN_CENTER = { x: 900, y: 555 };

export const HUB_COLLECTIBLES: HubCollectible[] = [
  // Central Plaza & North Path to Mission Control
  { id: 'hc-1', kind: 'coin', x: 900, y: 445, xpValue: 15, label: 'Plaza Coin' },
  { id: 'hc-2', kind: 'star', x: 900, y: 390, xpValue: 30, label: 'Mission Star' },

  // Northwest Path to Player Profile
  { id: 'hc-3', kind: 'coin', x: 670, y: 455, xpValue: 15, label: 'Studio Coin' },
  { id: 'hc-4', kind: 'star', x: 465, y: 375, xpValue: 30, label: 'Sketch Star' },

  // Northeast Path to Skill Lab
  { id: 'hc-5', kind: 'coin', x: 1130, y: 455, xpValue: 15, label: 'Lab Coin' },
  { id: 'hc-6', kind: 'glitch_gem', x: 1320, y: 380, xpValue: 50, label: 'Prototype Prism' },

  // Secret Grove behind Skill Lab
  { id: 'hc-secret-key', kind: 'secret_key', x: 1645, y: 165, xpValue: 150, label: 'Golden Designer Key' },

  // Southwest Path to Training Academy
  { id: 'hc-7', kind: 'coin', x: 660, y: 660, xpValue: 15, label: 'Scholar Coin' },
  { id: 'hc-8', kind: 'star', x: 465, y: 765, xpValue: 30, label: 'Wisdom Star' },

  // Southeast Path to Trophy Gallery
  { id: 'hc-9', kind: 'coin', x: 1140, y: 660, xpValue: 15, label: 'Hall Coin' },
  { id: 'hc-10', kind: 'star', x: 1325, y: 765, xpValue: 30, label: 'Trophy Star' },

  // South Path to Connection Portal
  { id: 'hc-11', kind: 'coin', x: 900, y: 675, xpValue: 15, label: 'Portal Coin' },
  { id: 'hc-12', kind: 'star', x: 900, y: 735, xpValue: 40, label: 'Warp Star' },
];

export const HUB_TREES = [
  { x: 135, y: 155 },
  { x: 545, y: 165 },
  { x: 1245, y: 165 },
  { x: 1625, y: 245 },
  { x: 135, y: 525 },
  { x: 1645, y: 525 },
  { x: 145, y: 890 },
  { x: 575, y: 925 },
  { x: 1225, y: 925 },
  { x: 1640, y: 890 },
];

export const HUB_LAMPS = [
  { x: 755, y: 505 },
  { x: 1035, y: 505 },
  { x: 425, y: 395 },
  { x: 1355, y: 395 },
  { x: 430, y: 855 },
  { x: 1355, y: 855 },
];
