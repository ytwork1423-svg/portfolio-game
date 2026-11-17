import {
  AcademyMilestone,
  AchievementDef,
  BossEncounter,
  HubDestination,
  ProjectQuest,
  SkillItem,
  ToolItem,
} from '../types/game';

export const DESIGNER_PROFILE = {
  name: 'Meera Manoj',
  handle: 'PLAYER 01',
  role: 'UI/UX & Visual Designer',
  location: 'Punjab, India',
  education: {
    degree: 'Bachelor of Design (UX/UI)',
    institution: 'Chitkara University, Punjab',
    period: '2023 – 2027',
    focus: 'Human-Centered Design, Interaction Systems, Visual Storytelling & Prototyping',
  },
  mission:
    'Create thoughtful, engaging, and user-friendly digital experiences that turn complex problems into intuitive, memorable journeys.',
  bio: 'I am a UI/UX and Visual Designer pursuing a Bachelor of Design (UX/UI) at Chitkara University. I combine structured design thinking with playful visual craft — building interfaces, interactive prototypes, and brand systems that respect users’ time and spark genuine delight.',
  interests: [
    'Retro 16-bit Pixel Art & Game Interfaces',
    'Micro-interactions & Tactile UI Systems',
    'Visual Storytelling & Editorial Typography',
    'Interactive Prototyping & Playable Web Craft',
  ],
  contact: {
    email: 'meera.manoj.design@example.com',
    linkedin: 'https://www.linkedin.com',
    behance: 'https://www.behance.net',
    dribbble: 'https://dribbble.com',
    availability: 'Open for UI/UX Design Internships & Creative Collaborations (2026)',
  },
};

export const HUB_DESTINATIONS: HubDestination[] = [
  {
    id: 'profile',
    code: 'ZONE 01',
    title: 'Player Profile',
    shortLabel: 'About Me',
    subtitle: 'Studio Room · Story & Personality',
    description: 'Meet Meera, explore her design philosophy, personality, and creative inspirations.',
    x: 220,
    y: 230,
    width: 190,
    height: 150,
    doorX: 315,
    doorY: 396,
    accentColor: '#22FF88',
    xpReward: 50,
  },
  {
    id: 'missions',
    code: 'ZONE 03',
    title: 'Mission Control',
    shortLabel: 'Projects',
    subtitle: 'Headquarters · Case Studies',
    description: 'Explore full UI/UX case studies, research insights, wireframes, and visual systems.',
    x: 785,
    y: 165,
    width: 230,
    height: 175,
    doorX: 900,
    doorY: 358,
    accentColor: '#FFD93D',
    xpReward: 75,
  },
  {
    id: 'skills',
    code: 'ZONE 02',
    title: 'Skill Lab',
    shortLabel: 'Skills & Tools',
    subtitle: 'Cyber Lab · Craft & Process',
    description: 'Test interactive UI/UX abilities, software mastery, and the Design Thinking simulator.',
    x: 1380,
    y: 230,
    width: 200,
    height: 155,
    doorX: 1480,
    doorY: 402,
    accentColor: '#FF3E9D',
    xpReward: 60,
  },
  {
    id: 'academy',
    code: 'ZONE 04',
    title: 'Training Academy',
    shortLabel: 'Education',
    subtitle: 'Starlight Library · Growth Log',
    description: 'Review university education, coursework, milestones, and design certifications.',
    x: 235,
    y: 700,
    width: 190,
    height: 155,
    doorX: 330,
    doorY: 874,
    accentColor: '#A855F7',
    xpReward: 50,
  },
  {
    id: 'portal',
    code: 'FINAL ZONE',
    title: 'Connection Portal',
    shortLabel: 'Contact',
    subtitle: 'Celestial Gate · Collaborate',
    description: 'Reach Meera via email or social channels, download summary, and start a project.',
    x: 805,
    y: 745,
    width: 190,
    height: 150,
    doorX: 900,
    doorY: 912,
    accentColor: '#38BDF8',
    xpReward: 100,
  },
  {
    id: 'trophies',
    code: 'ZONE 05',
    title: 'Trophy Gallery',
    shortLabel: 'Achievements',
    subtitle: 'Spotlight Hall · Milestones',
    description: 'View unlocked adventure trophies, collected relics, and recognition pedestals.',
    x: 1385,
    y: 700,
    width: 190,
    height: 155,
    doorX: 1480,
    doorY: 874,
    accentColor: '#F59E0B',
    xpReward: 50,
  },
];

export const ACADEMY_MILESTONES: AcademyMilestone[] = [
  {
    id: 'chitkara-bdes',
    period: '2023 – 2027 (Ongoing)',
    kind: 'Education',
    title: 'Bachelor of Design (UX/UI)',
    organization: 'Chitkara University, Punjab',
    detail:
      'Comprehensive undergraduate design program bridging human-centered research, interaction systems, visual communication, and interactive prototyping.',
    highlights: [
      'Core Studios: Design Thinking, Information Architecture, Visual Storytelling & Typography',
      'Hands-on Prototyping: Figma Design Systems, Usability Testing & Responsive Web Craft',
      'Cross-Disciplinary Visuals: Vector Illustration, Motion Studies & 3D Asset Exploration',
    ],
  },
  {
    id: 'foundation-craft',
    period: '2023 – 2024',
    kind: 'Coursework',
    title: 'Visual Foundations & User Research Lab',
    organization: 'Academic Studio Modules',
    detail:
      'Built strong habits around sketching first, conducting peer interviews, mapping empathy diagrams, and testing low-fidelity paper wireframes before opening high-fidelity tools.',
    highlights: [
      'Colour contrast & editorial typographic hierarchy exercises',
      'Contextual inquiry, persona synthesis & user journey mapping',
    ],
  },
  {
    id: 'systems-sprint',
    period: '2025 – 2026',
    kind: 'Coursework',
    title: 'Interactive Systems & Multi-Medium Craft',
    organization: 'Self-Directed & Studio Projects',
    detail:
      'Combined scalable Figma component libraries with custom Procreate illustration and Blender 3D lighting to craft distinct digital product worlds.',
    highlights: [
      'Reusable token-driven UI kits & accessible interaction states',
      'Playable portfolio architecture & micro-interaction choreography',
    ],
  },
  {
    id: 'experience-slot',
    period: 'Editable Slot · 2026+',
    kind: 'Experience Slot',
    title: 'UI/UX Internship & Industry Collaborations',
    organization: 'Ready for Your Team / Studio Name',
    detail:
      'Placeholder milestone reserved for upcoming design internships, freelance client launches, or verified workshop certifications.',
    highlights: [
      '[Editable] Add role title, company name, duration, and shipped product links',
      '[Editable] Add verified certifications (e.g., Google UX / Interaction Design Foundation)',
    ],
    isEditable: true,
  },
];

export const SKILLS_INVENTORY: SkillItem[] = [
  {
    id: 'ui-design',
    name: 'UI Design',
    category: 'Visual & Craft',
    tier: 'Core Mastery',
    equippedSlot: 'Primary Grid',
    summary: 'Component libraries, visual hierarchy, spacing rhythm, and responsive layout systems.',
    application: 'Balances whitespace, typography scale, and contrast so interfaces feel effortless to scan.',
    demoType: 'grid',
    demoHeadline: '8px Spatial Rhythm & Hierarchy',
    demoPoints: ['Consistent token spacing', 'Clear primary vs secondary actions', 'WCAG AA contrast discipline'],
    iconKey: 'grid',
  },
  {
    id: 'ux-design',
    name: 'UX Design',
    category: 'Core UX',
    tier: 'Core Mastery',
    equippedSlot: 'Flow Compass',
    summary: 'End-to-end user journeys, information architecture, and friction elimination.',
    application: 'Maps every screen to a clear user goal with zero dead ends or cognitive overload.',
    demoType: 'flow',
    demoHeadline: 'Goal-First User Flow Architecture',
    demoPoints: ['Task-frequency prioritization', 'Progressive disclosure', 'Error-prevention states'],
    iconKey: 'compass',
  },
  {
    id: 'user-research',
    name: 'User Research',
    category: 'Core UX',
    tier: 'Field Scout',
    equippedSlot: 'Insight Lens',
    summary: 'Qualitative interviews, contextual inquiry, empathy maps, and usability synthesis.',
    application: 'Replaces assumptions with observed user mental models before committing to pixels.',
    demoType: 'research',
    demoHeadline: 'From Raw Observations to Design Principles',
    demoPoints: ['1-on-1 user interviews', 'Affinity & pain-point clustering', 'Task-completion observation'],
    iconKey: 'search',
  },
  {
    id: 'wireframing',
    name: 'Wireframing',
    category: 'Core UX',
    tier: 'Architect',
    equippedSlot: 'Blueprint Deck',
    summary: 'Rapid low-to-mid fidelity structural layouts for fast iteration and critique.',
    application: 'Tests layout logic and content hierarchy early without getting distracted by decoration.',
    demoType: 'wireframe',
    demoHeadline: 'Structure Before Surface Polish',
    demoPoints: ['Sketch-to-screen flow validation', 'Content-first block sizing', 'Edge-case screen mapping'],
    iconKey: 'layout',
  },
  {
    id: 'prototyping',
    name: 'Prototyping',
    category: 'Core UX',
    tier: 'Builder',
    equippedSlot: 'Spark Engine',
    summary: 'Interactive clickable flows, state transitions, and micro-interaction validation.',
    application: 'Turns static frames into testable experiences for real stakeholder and user feedback.',
    demoType: 'prototype',
    demoHeadline: 'Testable Interactive States',
    demoPoints: ['Smart animate & transition timing', 'Real hover/active/empty states', 'Shareable usability test links'],
    iconKey: 'play',
  },
  {
    id: 'interaction-design',
    name: 'Interaction Design',
    category: 'Visual & Craft',
    tier: 'Motion Craft',
    equippedSlot: 'Pulse Core',
    summary: 'Feedback states, tactile transitions, affordances, and responsive state choreography.',
    application: 'Ensures every tap, hover, and keyboard action responds with clear intent and delight.',
    demoType: 'motion',
    demoHeadline: 'Tactile Feedback & Affordances',
    demoPoints: ['Sub-200ms response curves', 'Meaningful state transitions', 'Keyboard & touch parity'],
    iconKey: 'zap',
  },
  {
    id: 'visual-design',
    name: 'Visual Design',
    category: 'Visual & Craft',
    tier: 'Art Director',
    equippedSlot: 'Prism Array',
    summary: 'Colour systems, typographic pairing, iconography, and cohesive mood direction.',
    application: 'Gives products an unmistakable personality that elevates trust and emotional resonance.',
    demoType: 'visual',
    demoHeadline: 'Cohesive Mood, Type & Colour Discipline',
    demoPoints: ['60-30-10 colour balance', 'Expressive display + legible body pairing', 'Custom visual motifs'],
    iconKey: 'palette',
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    category: 'Visual & Craft',
    tier: 'Storyteller',
    equippedSlot: 'Poster Press',
    summary: 'Editorial compositions, custom illustrations, posters, and brand identity assets.',
    application: 'Translates complex ideas into crisp visual narratives across digital and print surfaces.',
    demoType: 'visual',
    demoHeadline: 'Editorial Composition & Brand Craft',
    demoPoints: ['Scalable vector marks', 'Grid-led poster layouts', 'Custom spot illustrations'],
    iconKey: 'pen',
  },
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    category: 'Strategy',
    tier: 'Tactician',
    equippedSlot: 'Strategy Shield',
    summary: 'Empathize, Define, Ideate, Prototype, Test — structured iterative problem-solving.',
    application: 'Frames ambiguous briefs around real human constraints rather than surface features.',
    demoType: 'thinking',
    demoHeadline: 'Iterative 5-Stage Problem Solving',
    demoPoints: ['Reframe symptoms into root problems', 'Diverge & converge rapidly', 'Validate early with real people'],
    iconKey: 'lightbulb',
  },
  {
    id: 'usability-testing',
    name: 'Usability Testing',
    category: 'Strategy',
    tier: 'Validator',
    equippedSlot: 'Audit Scanner',
    summary: 'Moderated task testing, heuristic audits, and iterative refinement loops.',
    application: 'Identifies hidden edge cases and navigation bottlenecks before handoff.',
    demoType: 'research',
    demoHeadline: 'Evidence-Driven Iteration',
    demoPoints: ['Unbiased task prompts', 'Hesitation & drop-off observation', 'Prioritized severity fixes'],
    iconKey: 'check',
  },
];

export const TOOLS_INVENTORY: ToolItem[] = [
  {
    id: 'figma',
    name: 'Figma',
    weaponClass: 'Primary Staff · UI & Systems',
    role: 'Interface Architecture, Auto-Layout & Interactive Prototypes',
    description:
      'Main workspace for wireframing, multi-screen design systems, reusable component variants, and clickable user-testing prototypes.',
    workflowExample: 'Variables & Auto-Layout component kits -> Interactive flows -> Dev-ready specs.',
    color: '#FF3E9D',
    shortCode: 'FIG',
  },
  {
    id: 'illustrator',
    name: 'Adobe Illustrator',
    weaponClass: 'Vector Blade · Identity & Icons',
    role: 'Custom Iconography, Vector Illustration & Brand Marks',
    description:
      'Precision vector craft for crisp scalable icons, geometric logos, editorial badges, and brand visual assets.',
    workflowExample: 'Grid-aligned Bezier icons -> Brand lockups -> Crisp SVG exports for web.',
    color: '#FF9F1C',
    shortCode: 'Ai',
  },
  {
    id: 'procreate',
    name: 'Procreate',
    weaponClass: 'Sketch Tome · Concept & Art',
    role: 'Rapid Ideation, Character Concepts & Visual Storytelling',
    description:
      'Digital sketchbook for early concept exploration, custom illustrations, storyboards, and expressive visual art.',
    workflowExample: 'Thumbnail storyboards -> Character silhouettes -> Custom editorial spot art.',
    color: '#A855F7',
    shortCode: 'PRO',
  },
  {
    id: 'canva',
    name: 'Canva',
    weaponClass: 'Signal Horn · Rapid Layouts',
    role: 'Presentation Decks, Social Visuals & Quick Collaterals',
    description:
      'Fast layout turnaround for case study pitch decks, social campaign templates, and collaborative design sprints.',
    workflowExample: 'Modular pitch deck templates -> Clean typography -> Rapid team handoff.',
    color: '#38BDF8',
    shortCode: 'CNV',
  },
  {
    id: 'blender',
    name: 'Blender',
    weaponClass: 'Spatial Forge · 3D Assets',
    role: '3D Objects, Lighting Studies & Dimensional Product Renders',
    description:
      'Adds depth and spatial perspective to hero visuals, playful 3D icons, and interactive product mockups.',
    workflowExample: 'Low-poly/smooth modelling -> Studio rim lighting -> Hero render integration.',
    color: '#22FF88',
    shortCode: 'BLD',
  },
];

export const PROJECT_QUESTS: ProjectQuest[] = [
  {
    id: 'quest-campus-companion',
    code: 'MISSION 01',
    title: 'CampusPulse — Student Wayfinding & Hub',
    category: 'Mobile UX · Product Architecture',
    biome: 'Pixel University District',
    difficulty: 'Rank A',
    role: 'UI/UX Designer (Concept Case Study)',
    duration: 'Editable Template · Add Real Timeline',
    isTemplate: true,
    tagline:
      'Unifying scattered campus timetables, room maps, and club events into one calm mobile companion.',
    overview:
      'An end-to-end UX case study blueprint exploring how university students navigate daily schedules, building locations, and campus announcements without jumping across five disconnected chat threads.',
    problemStatement:
      'New and current students frequently miss room changes, club deadlines, and lab updates because announcements live across PDFs, noticeboards, and informal messaging groups.',
    userChallenges: [
      'Fragmented academic updates scattered across multiple unofficial channels.',
      'Wayfinding anxiety during the first semester when locating lecture halls and labs quickly.',
      'Cluttered legacy portals that hide daily priority tasks behind desktop-only tables.',
    ],
    researchInsights: [
      '[Editable Insight Slot] Replace with peer interview sample size & direct synthesis quotes.',
      'Students primarily check schedules in motion between classes and need one-thumb glanceability.',
      'Grouping "Next Class + Room Pin" at the top of the home feed reduces repeated searching.',
    ],
    designChallenges: [
      'Surfacing urgent timetable changes immediately without triggering alert fatigue.',
      'Designing an indoor/campus wayfinding card readable outdoors in bright daylight.',
    ],
    designApproach: [
      'Defined a single "Today Strip" architecture prioritizing immediate next actions over archive menus.',
      'Created low-fidelity paper and Figma wireframes to validate navigation labels with peers.',
      'Built an interactive high-contrast prototype tuned for quick one-handed mobile use.',
    ],
    wireframeNotes:
      '3-tab bottom bar (Today · Campus Map · Clubs) with expandable class cards and quick-save bookmarks.',
    finalUiNotes:
      'High-contrast dark-navy cards paired with emerald status indicators and crisp tabular room codes.',
    visualDirection: {
      palette: ['#0F172A', '#22FF88', '#38BDF8', '#F8FAFC'],
      typography: 'Plus Jakarta Sans + JetBrains Mono for room codes',
      mood: 'Crisp, calm, high-legibility academic utility',
    },
    finalOutcome:
      '[Editable Outcome Slot] Insert validated usability test findings, peer feedback quotes, and final prototype link here once testing is logged.',
    learnings: [
      'Information hierarchy matters more than adding extra calendar features.',
      'Testing low-fidelity labels early prevented confusion between "Notices" and "Events".',
    ],
    deliverables: ['User Flow Map', 'Low-Fi Wireframes', 'Figma Component Kit', 'Interactive Prototype'],
    liveLinkPlaceholder: 'Add Figma Prototype URL',
    accentColor: '#22FF88',
  },
  {
    id: 'quest-mindful-habit',
    code: 'MISSION 02',
    title: 'Kairo — Gentle Focus & Study Rituals',
    category: 'Interaction Design · Mobile App',
    biome: 'Midnight Starlight Library',
    difficulty: 'Rank A',
    role: 'Product & Interaction Designer (Concept)',
    duration: 'Editable Template · Add Real Timeline',
    isTemplate: true,
    tagline:
      'Replacing punishing streak counters with restorative focus sessions and tactile audio-visual cues.',
    overview:
      'A visual and interaction design exploration reimagining productivity timers for creative students who experience burnout from aggressive red streak warnings.',
    problemStatement:
      'Most study and habit trackers rely on guilt-inducing streak resets, causing users to abandon the app entirely after one busy weekend.',
    userChallenges: [
      'Notification fatigue and shame loops when missing a rigid daily target.',
      'Overly complex analytics dashboards that distract from simply starting a 25-minute session.',
      'Lack of soothing visual feedback during deep work.',
    ],
    researchInsights: [
      '[Editable Insight Slot] Replace with heuristic audit notes & student diary study findings.',
      'Users respond better to gentle milestone gardens than punitive zero resets.',
      'Warm ambient state shifts help signal the psychological transition between focus and rest.',
    ],
    designChallenges: [
      'Keeping the active timer screen serene and distraction-free while still feeling tactile.',
      'Communicating weekly consistency cleanly without harsh red-vs-green judgment.',
    ],
    designApproach: [
      'Designed a tactile dial and ambient session card with minimal text during active focus.',
      'Introduced "Rest Day Tokens" so taking breaks feels intentional rather than a failure.',
      'Prototyped micro-interactions for session completion using layered visual rewards.',
    ],
    wireframeNotes:
      'Single-screen primary focus timer with slide-up session reflection drawer and soft colour themes.',
    finalUiNotes:
      'Twilight indigo canvas with warm magenta focus rings, tabular countdown typography, and calm motion.',
    visualDirection: {
      palette: ['#121126', '#FF3E9D', '#FFD93D', '#F8DDF0'],
      typography: 'Geometric Sans Display + Tabular Timers',
      mood: 'Tactile, restorative, subtly playful twilight UI',
    },
    finalOutcome:
      '[Editable Outcome Slot] Document before/after wireframe refinements and prototype walkthrough video link here.',
    learnings: [
      'Emotional tone in microcopy changes how willing users are to return after a missed day.',
      'Subtle motion cues can replace heavy instructional text.',
    ],
    deliverables: ['Heuristic Audit', 'Interaction Specs', 'Visual System', 'Figma Motion Prototype'],
    liveLinkPlaceholder: 'Add Behance Case Study URL',
    accentColor: '#FF3E9D',
  },
  {
    id: 'quest-artisan-market',
    code: 'MISSION 03',
    title: 'CraftLoom — Local Maker Storefront',
    category: 'Responsive Web UI · E-Commerce',
    biome: 'Golden Bazaar Overworld',
    difficulty: 'Rank B',
    role: 'Visual & UI Designer (Concept)',
    duration: 'Editable Template · Add Real Timeline',
    isTemplate: true,
    tagline:
      'Giving independent ceramicists and illustrators an editorial storefront that highlights craft stories.',
    overview:
      'A responsive web e-commerce concept focused on storytelling, clear material specs, and friction-free checkout for independent regional creators.',
    problemStatement:
      'Generic marketplace templates strip away the story behind handmade goods, forcing local makers to compete solely on price.',
    userChallenges: [
      'Buyers struggle to judge scale, texture, and care instructions from tiny thumbnail grids.',
      'Multi-step checkout forms with surprise shipping fees cause late-stage abandonment.',
      'Makers need a modular layout that adapts easily to small batch drops.',
    ],
    researchInsights: [
      '[Editable Insight Slot] Replace with competitor checkout friction notes & card-sorting priorities.',
      'Placing dimensions, artisan bio, and delivery estimate upfront builds immediate buyer confidence.',
      'Clean editorial photography spacing makes modest product catalogues feel curated.',
    ],
    designChallenges: [
      'Balancing rich maker storytelling with fast add-to-bag shopping efficiency.',
      'Keeping product cards scannable across desktop grids and narrow mobile screens.',
    ],
    designApproach: [
      'Structured product cards around 3 clean data points: Title, Craft Medium, and Price.',
      'Designed an inline slide-out cart drawer showing shipping progress without leaving the page.',
      'Paired custom Illustrator spot icons with warm editorial typography.',
    ],
    wireframeNotes:
      'Asymmetric hero showcase -> Curated Maker Spotlight -> Filterable Batch Grid -> Slide-over Bag.',
    finalUiNotes:
      'Spacious editorial grid with warm amber focal CTAs and crisp material specification tables.',
    visualDirection: {
      palette: ['#1E1B2E', '#FF9F1C', '#F8FAFC', '#64748B'],
      typography: 'Editorial Display + Clean Sans Body',
      mood: 'Warm craft studio meets crisp modern retail',
    },
    finalOutcome:
      '[Editable Outcome Slot] Add final responsive desktop/mobile screen gallery and stakeholder review notes.',
    learnings: [
      'Removing redundant card metadata immediately improved scannability.',
      'Slide-over cart drawers reduce context switching compared to full-page redirects.',
    ],
    deliverables: ['Information Architecture', 'Responsive Web UI', 'Custom Icon Set', 'Checkout Flow'],
    liveLinkPlaceholder: 'Add Dribbble / Live Link',
    accentColor: '#FFD93D',
  },
  {
    id: 'quest-3d-brand-world',
    code: 'MISSION 04',
    title: 'Pixel & Clay — Hybrid Brand Identity',
    category: 'Visual Design · 3D & Illustration',
    biome: 'Blender & Procreate Forge',
    difficulty: 'Rank S',
    role: 'Visual Designer & Illustrator',
    duration: 'Editable Template · Add Real Timeline',
    isTemplate: true,
    tagline:
      'Blending 3D Blender forms, Procreate character art, and vector typography into a cohesive visual system.',
    overview:
      'A multi-medium visual design showcase demonstrating how illustration, 3D lighting, and UI layout systems reinforce a single playful brand voice.',
    problemStatement:
      'Digital campaigns often look disconnected when social graphics, web pages, and illustrations are made without a shared visual grammar.',
    userChallenges: [
      'Maintaining crisp brand recognition across small mobile avatars and large event posters.',
      'Balancing playful character art with legible event dates and calls to action.',
    ],
    researchInsights: [
      '[Editable Insight Slot] Document moodboard experiments, colour contrast checks, and grid rules.',
      'Restricting the palette to 2 dominant dark neutrals + 2 punchy accents keeps 3D and 2D assets unified.',
    ],
    designChallenges: [
      'Ensuring 3D rendered lighting matches flat vector UI borders without visual clash.',
      'Scaling expressive character illustrations without crowding event typography.',
    ],
    designApproach: [
      'Sketched character silhouettes in Procreate before modelling hero props in Blender.',
      'Built vector badge lockups and typographic templates in Illustrator and Figma.',
      'Tested poster and social layouts at both thumbnail and full-screen scales.',
    ],
    wireframeNotes:
      'Modular brand guidelines covering Logo Lockups, Colour Tokens, 3D Lighting Rules, and Social Grids.',
    finalUiNotes:
      'Bold dark midnight ground letting electric pink, emerald, and 3D rim lighting command attention.',
    visualDirection: {
      palette: ['#06060E', '#FF3E9D', '#22FF88', '#A855F7'],
      typography: 'Display Pixel + Modern Geometric Sans',
      mood: 'Playful retro-futuristic craft with crisp hierarchy',
    },
    finalOutcome:
      '[Editable Outcome Slot] Attach exported Blender renders, Procreate timelapses, and brand book PDF link.',
    learnings: [
      'A shared colour and lighting rulebook lets 2D, 3D, and UI elements feel authored together.',
      'Contrast testing at thumbnail size catches legibility issues before print or social export.',
    ],
    deliverables: ['Character Concepts', 'Blender 3D Props', 'Vector Brand Marks', 'Visual Guidelines'],
    liveLinkPlaceholder: 'Add Visual Showcase URL',
    accentColor: '#A855F7',
  },
];

export const BOSS_ENCOUNTERS: BossEncounter[] = [
  {
    id: 'round-1',
    roundLabel: 'SCENARIO 1 OF 3 · DISCOVERY PHASE',
    bossAttackName: 'STAKEHOLDER CHALLENGE: "ASSUMPTION OVERLOAD"',
    scenario:
      'A stakeholder requests adding 14 dashboard widgets onto the home screen because "power users probably want everything at once." How do you respond?',
    choices: [
      {
        id: 'r1-a',
        label: 'Add all 14 widgets in tiny cards to satisfy the request immediately.',
        strategyTag: 'Passive Compliance',
        isOptimal: false,
        damageToBoss: 10,
        damageToPlayer: 35,
        explanation:
          'Cramming 14 widgets spikes cognitive load and hides critical actions. Visual polish cannot rescue broken hierarchy.',
      },
      {
        id: 'r1-b',
        label: 'Run quick task interviews & card sorting to identify the top 3 daily actions first.',
        strategyTag: 'Research-Led IA',
        isOptimal: true,
        damageToBoss: 35,
        damageToPlayer: 0,
        explanation:
          'Grounding layout decisions in real user frequency lets us surface the 3 core tasks cleanly and tuck secondary tools into progressive disclosure.',
      },
      {
        id: 'r1-c',
        label: 'Redesign the colours and gradients so the 14 widgets look trendier.',
        strategyTag: 'Cosmetic Patch',
        isOptimal: false,
        damageToBoss: 15,
        damageToPlayer: 25,
        explanation:
          'Aesthetic styling helps scannability, but without information architecture, users still get lost hunting for primary actions.',
      },
    ],
  },
  {
    id: 'round-2',
    roundLabel: 'SCENARIO 2 OF 3 · INTERACTION & USABILITY',
    bossAttackName: 'USABILITY TEST FINDING: "MYSTERY ICON MAZE"',
    scenario:
      'Usability testing shows new visitors hesitate for 6+ seconds on navigation icons without labels and abandon onboarding halfway.',
    choices: [
      {
        id: 'r2-a',
        label: 'Pair clear 1-word labels with icons, tighten onboarding to 3 progressive steps, and add clear state feedback.',
        strategyTag: 'Clarity & Progressive Disclosure',
        isOptimal: true,
        damageToBoss: 35,
        damageToPlayer: 0,
        explanation:
          'Recognition beats recall. Pairing labels with icons and trimming upfront friction respects user momentum.',
      },
      {
        id: 'r2-b',
        label: 'Add a 7-slide tooltip tutorial explaining every icon before users can click.',
        strategyTag: 'Tutorial Band-Aid',
        isOptimal: false,
        damageToBoss: 10,
        damageToPlayer: 30,
        explanation:
          'If an interface requires a long manual just to navigate, the interface itself needs clearer affordances.',
      },
      {
        id: 'r2-c',
        label: 'Hide the navigation inside a hamburger menu on desktop too.',
        strategyTag: 'Hidden Navigation',
        isOptimal: false,
        damageToBoss: 10,
        damageToPlayer: 30,
        explanation:
          'Burying primary destinations lowers discoverability and forces extra clicks on wide screens.',
      },
    ],
  },
  {
    id: 'round-3',
    roundLabel: 'SCENARIO 3 OF 3 · VISUAL ACCESSIBILITY',
    bossAttackName: 'ACCESSIBILITY AUDIT: "LOW-CONTRAST MIRAGE"',
    scenario:
      'The visual design looks sleek on a studio monitor, but grey-on-purple text fails contrast checks and status states rely on colour alone.',
    choices: [
      {
        id: 'r3-a',
        label: 'Keep the low-contrast greys because they feel subtle and minimalist.',
        strategyTag: 'Aesthetic Over Legibility',
        isOptimal: false,
        damageToBoss: 5,
        damageToPlayer: 40,
        explanation:
          'If users cannot read copy outdoors or with visual impairments, the design has failed its primary job.',
      },
      {
        id: 'r3-b',
        label: 'Enforce WCAG AA contrast ratios, increase body line-height, and pair colour cues with icons/text labels.',
        strategyTag: 'Inclusive Visual Craft',
        isOptimal: true,
        damageToBoss: 40,
        damageToPlayer: 0,
        explanation:
          'High contrast and redundant non-hue state indicators make the interface genuinely accessible while keeping its personality sharp.',
      },
      {
        id: 'r3-c',
        label: 'Turn every button neon green with drop shadows everywhere.',
        strategyTag: 'Visual Overload',
        isOptimal: false,
        damageToBoss: 15,
        damageToPlayer: 25,
        explanation:
          'When everything screams for attention, nothing stands out. Contrast should serve hierarchy, not create noise.',
      },
    ],
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_steps',
    title: 'Studio Explorer',
    description: 'Visited Player Profile and explored Meera’s creative headquarters.',
    xpBonus: 50,
    icon: 'BOOT',
  },
  {
    id: 'skill_explorer',
    title: 'Lab Technician',
    description: 'Inspected Meera’s design skills and software tools in Skill Lab.',
    xpBonus: 50,
    icon: 'PACK',
  },
  {
    id: 'first_mission',
    title: 'Case Study Analyst',
    description: 'Completed a full Project Case Study inside Mission Control.',
    xpBonus: 100,
    icon: 'SCROLL',
  },
  {
    id: 'star_collector',
    title: 'Overworld Star Collector',
    description: 'Collected at least 6 floating stars & coins across the Central Hub.',
    xpBonus: 75,
    icon: 'STAR',
  },
  {
    id: 'boss_slayer',
    title: 'Design Thinking Tactician',
    description: 'Solved all 3 UX dilemmas in the Skill Lab Design Simulator.',
    xpBonus: 150,
    icon: 'SHIELD',
  },
  {
    id: 'secret_hunter',
    title: 'Secret Hunter',
    description: 'Discovered the Golden Designer Key or secret companion interaction.',
    xpBonus: 120,
    icon: 'KEY',
  },
  {
    id: 'champion',
    title: 'Design Quest Champion',
    description: 'Reached the Connection Portal and completed the portfolio adventure!',
    xpBonus: 200,
    icon: 'CROWN',
  },
];

export const EDITABLE_GALLERY_AWARDS = [
  {
    id: 'award-slot-1',
    slotLabel: 'Editable Award Slot 01',
    title: 'Design Competition / Hackathon Recognition',
    detail: 'Placeholder pedestal — insert verified hackathon, designathon, or university jury award here.',
  },
  {
    id: 'award-slot-2',
    slotLabel: 'Editable Award Slot 02',
    title: 'Featured Showcase / Dean’s Merit',
    detail: 'Placeholder pedestal — insert verified Behance feature, exhibition, or academic honour here.',
  },
  {
    id: 'award-slot-3',
    slotLabel: 'Editable Award Slot 03',
    title: 'Verified Certification Crest',
    detail: 'Placeholder pedestal — insert verified UI/UX or visual design certificate milestone here.',
  },
];
