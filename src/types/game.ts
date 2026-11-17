export type GameScreen = 'TITLE' | 'PORTAL_WARP' | 'HUB' | 'ENTRANCE' | 'DESTINATION';

export type DestinationId = 'profile' | 'skills' | 'missions' | 'academy' | 'trophies' | 'portal';

export interface HubDestination {
  id: DestinationId;
  code: string;
  title: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
  accentColor: string;
  xpReward: number;
}

export interface HubCollectible {
  id: string;
  kind: 'coin' | 'star' | 'secret_key' | 'glitch_gem';
  x: number;
  y: number;
  xpValue: number;
  label: string;
}

export interface HubObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DialogueLine {
  speaker: string;
  portrait: 'meera' | 'fox' | 'boss' | 'system';
  text: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Core UX' | 'Visual & Craft' | 'Strategy';
  tier: string;
  equippedSlot: string;
  summary: string;
  application: string;
  demoType: 'grid' | 'flow' | 'research' | 'wireframe' | 'prototype' | 'motion' | 'visual' | 'thinking';
  demoHeadline: string;
  demoPoints: string[];
  iconKey: string;
}

export interface ToolItem {
  id: string;
  name: string;
  weaponClass: string;
  role: string;
  description: string;
  workflowExample: string;
  color: string;
  shortCode: string;
}

export interface ProjectQuest {
  id: string;
  code: string;
  title: string;
  category: string;
  biome: string;
  difficulty: 'Rank A' | 'Rank S' | 'Rank B';
  role: string;
  duration: string;
  isTemplate: boolean;
  tagline: string;
  overview: string;
  problemStatement: string;
  userChallenges: string[];
  researchInsights: string[];
  designChallenges: string[];
  designApproach: string[];
  wireframeNotes: string;
  finalUiNotes: string;
  visualDirection: {
    palette: string[];
    typography: string;
    mood: string;
  };
  finalOutcome: string;
  learnings: string[];
  deliverables: string[];
  liveLinkPlaceholder: string;
  accentColor: string;
}

export interface BossEncounter {
  id: string;
  roundLabel: string;
  bossAttackName: string;
  scenario: string;
  choices: {
    id: string;
    label: string;
    strategyTag: string;
    isOptimal: boolean;
    damageToBoss: number;
    damageToPlayer: number;
    explanation: string;
  }[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  xpBonus: number;
  icon: string;
}

export interface AcademyMilestone {
  id: string;
  period: string;
  kind: 'Education' | 'Coursework' | 'Experience Slot';
  title: string;
  organization: string;
  detail: string;
  highlights: string[];
  isEditable?: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  subtitle: string;
  kind: 'xp' | 'achievement' | 'secret' | 'quest';
}

export interface SavedProgress {
  xp: number;
  collectedIds: string[];
  visitedDestinations: DestinationId[];
  completedQuests: string[];
  unlockedAchievements: string[];
  bossDefeated: boolean;
  portalReached: boolean;
  foxPetCount: number;
  secretPaletteUnlocked: boolean;
  secretPaletteActive: boolean;
  hubX: number;
  hubY: number;
}
