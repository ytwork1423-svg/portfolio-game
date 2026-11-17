import { ProjectQuest } from './game';

export type ExhibitStyleId = 'crt' | 'cinema' | 'wall' | 'editorial';

export type DemoArtworkVariant =
  | 'emerald-ui'
  | 'coral-portrait'
  | 'cobalt-eye'
  | 'sunburst-poster'
  | 'magenta-editorial'
  | 'emerald-craft'
  | 'amber-badge'
  | 'obsidian-mobile';

export interface ProjectExhibitMedia {
  imageUrl: string | null;
  imageName?: string;
  videoUrl: string | null;
  videoName?: string;
  secondaryImageUrl?: string | null;
  detailImageUrl?: string | null;
}

export interface EditableProjectItem extends ProjectQuest {
  exhibitStyle: ExhibitStyleId;
  demoVariant: DemoArtworkVariant;
  media: ProjectExhibitMedia;
  isDemoPlaceholder: boolean;
}

export interface HeroEditorialCopy {
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
  ribbonText: string;
}

export interface FinaleContactState {
  headline: string;
  message: string;
  email: string;
  linkedin: string;
  behance: string;
  dribbble: string;
  availability: string;
}

export function mapQuestsToExhibits(quests: ProjectQuest[]): EditableProjectItem[] {
  const styles: ExhibitStyleId[] = ['crt', 'cinema', 'wall', 'editorial'];
  const variants: DemoArtworkVariant[] = [
    'emerald-ui',
    'coral-portrait',
    'cobalt-eye',
    'sunburst-poster',
  ];
  return quests.map((q, idx) => ({
    ...q,
    exhibitStyle: styles[idx % styles.length],
    demoVariant: variants[idx % variants.length],
    isDemoPlaceholder: true,
    media: {
      imageUrl: null,
      videoUrl: null,
      secondaryImageUrl: null,
      detailImageUrl: null,
    },
  }));
}
