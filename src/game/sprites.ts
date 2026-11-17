// Hand-crafted 16-bit style pixel-art sprite matrices rendered to offscreen cached canvases
// Each character in a row maps to a palette hex color ('.' = transparent).

const spriteCache = new Map<string, HTMLCanvasElement>();

function renderMatrixToCanvas(rows: string[], palette: Record<string, string>): HTMLCanvasElement {
  const height = rows.length;
  const width = rows[0]?.length || 1;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || !palette[ch]) continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

export function getCachedSprite(
  key: string,
  rows: string[],
  palette: Record<string, string>
): HTMLCanvasElement {
  const existing = spriteCache.get(key);
  if (existing) return existing;
  const created = renderMatrixToCanvas(rows, palette);
  spriteCache.set(key, created);
  return created;
}

const MEERA_PALETTE: Record<string, string> = {
  H: '#4A2518', // dark brown hair
  h: '#6E3B28', // hair highlight
  P: '#FF5CA8', // pink bow
  p: '#FFA6D0', // bow highlight
  S: '#E8B088', // skin
  s: '#C98A63', // skin shadow
  E: '#1A0F24', // eyes
  B: '#FFFFFF', // white shirt / shoes
  G: '#0E9F58', // emerald green sweater/skirt
  g: '#22FF88', // bright green trim
  K: '#1B1730', // outline / dark
};

const MEERA_IDLE_1 = [
  '.....HHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHHHHHHHPPpH..',
  '..HHHhhhhHPPPH..',
  '.HHHHSSSSSSHHHH.',
  '.HHHSSESSESSHHH.',
  '.HHHSSSSSSSSHHH.',
  '.HHHHsSSSSsHHHH.',
  '.HHH.BBBBBB.HHH.',
  '.HH.GGBBBBGG.HH.',
  '.HH.GGGGGGGG.HH.',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '....GGGGGGGG....',
  '.....GG..GG.....',
  '.....SS..SS.....',
  '....BBg..gBB....',
  '....KKK..KKK....',
];

const MEERA_IDLE_2 = [
  '................',
  '.....HHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHHHHHHHPPpH..',
  '..HHHhhhhHPPPH..',
  '.HHHHSSSSSSHHHH.',
  '.HHHSSESSESSHHH.',
  '.HHHSSSSSSSSHHH.',
  '.HHHHsSSSSsHHHH.',
  '.HHH.BBBBBB.HHH.',
  '.HH.GGBBBBGG.HH.',
  '.HH.GGGGGGGG.HH.',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '.....GG..GG.....',
  '.....SS..SS.....',
  '....BBg..gBB....',
  '....KKK..KKK....',
];

const MEERA_WALK_1 = [
  '.....HHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHHHHHHHPPpH..',
  '..HHHhhhhHPPPH..',
  '.HHHHSSSSSSHHHH.',
  '.HHHSSESSESSHHH.',
  '.HHHSSSSSSSSHHH.',
  '.HHHHsSSSSsHHHH.',
  '..HH.BBBBBB.HH..',
  '..H.GGBBBBGG.H..',
  '....GGGGGGGG....',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '....GGGGGGGG....',
  '...SS......SS...',
  '..BBg......gBB..',
  '..KKK......KKK..',
  '................',
];

const MEERA_WALK_2 = [
  '................',
  '.....HHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHHHHHHHPPpH..',
  '..HHHhhhhHPPPH..',
  '.HHHHSSSSSSHHHH.',
  '.HHHSSESSESSHHH.',
  '.HHHSSSSSSSSHHH.',
  '.HHHHsSSSSsHHHH.',
  '...H.BBBBBB.H...',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '......SSSS......',
  '.....BBggBB.....',
  '.....KKKKKK.....',
  '................',
];

const MEERA_JUMP = [
  '.....HHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHHHHHHHPPpH..',
  '..HHHhhhhHPPPH..',
  '.HHHHSSSSSSHHHH.',
  '.HHHSSESSESSHHH.',
  '.HHHSSSSSSSSHHH.',
  '..HHHsSSSSsHHH..',
  '.SS..BBBBBB..SS.',
  '..H.GGBBBBGG.H..',
  '....GGGGGGGG....',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '...SS......SS...',
  '..BBg......gBB..',
  '..KKK......KKK..',
  '................',
  '................',
];

const MEERA_WAVE = [
  '.....HHHHHH...SS',
  '...HHHHHHHHHH.SS',
  '..HHHHHHHHPPpH.G',
  '..HHHhhhhHPPPHGG',
  '.HHHHSSSSSSHHHGG',
  '.HHHSSESSESSHH..',
  '.HHHSSSSSSSSHH..',
  '.HHHHsSSSSsHHHH.',
  '.HHH.BBBBBB.HHH.',
  '.HH.GGBBBBGG.HH.',
  '.HH.GGGGGGGG.HH.',
  '....GGBBBBGG....',
  '....GGGGGGGG....',
  '....GGGGGGGG....',
  '.....GG..GG.....',
  '.....SS..SS.....',
  '....BBg..gBB....',
  '....KKK..KKK....',
];

export function getMeeraSprite(
  frame: 'idle1' | 'idle2' | 'walk1' | 'walk2' | 'jump' | 'wave'
): HTMLCanvasElement {
  const map = {
    idle1: MEERA_IDLE_1,
    idle2: MEERA_IDLE_2,
    walk1: MEERA_WALK_1,
    walk2: MEERA_WALK_2,
    jump: MEERA_JUMP,
    wave: MEERA_WAVE,
  };
  return getCachedSprite(`meera_${frame}`, map[frame], MEERA_PALETTE);
}

const PARACHUTE_PALETTE: Record<string, string> = {
  K: '#1B1730', // crisp dark outline
  P: '#FF3E9D', // neon pink canopy panels
  p: '#FF85C2', // bright pink highlight
  W: '#FFFFFF', // crisp white panel
  G: '#22FF88', // emerald green accent stripe
  C: '#38BDF8', // sky cyan accent trim
};

const PARACHUTE_MATRIX = [
  '......KKKKKKKKKKKK......',
  '....KKppppWWWWppppKK....',
  '..KKPPPpppWWWWpppPPPKK..',
  '.KPPPPPpWWWWWWWWpPPPPPK.',
  'KPPPPPPWWWWWWGGGGPPPPPPK',
  'KPPPPPpWWWWWWGGGGpPPPPPK',
  'KCCCCCCWWWWWWCCCCPPPPPPK',
  '.KKKKKK.KKKKKK.KKKKKKKK.',
];

export function getParachuteSprite(): HTMLCanvasElement {
  return getCachedSprite('parachute_canopy', PARACHUTE_MATRIX, PARACHUTE_PALETTE);
}

const FOX_PALETTE: Record<string, string> = {
  W: '#F4F8FF',
  C: '#67E8F9',
  B: '#3B82F6',
  E: '#111827',
  P: '#FF75B5',
};

const FOX_IDLE = [
  '..W...W.......',
  '.WPW.WPW......',
  '.WWWWWWW......',
  '.WEWWWEW....CC',
  '.WWWWWWW...CWW',
  '..WWWWW...CWWC',
  '..WWWWWWWWWWC.',
  '..WWWWWWWWWW..',
  '..WWCCWWWWCC..',
  '..WW..WW..WW..',
  '..BB..BB..BB..',
];

const FOX_WALK = [
  '..W...W.......',
  '.WPW.WPW......',
  '.WWWWWWW...CC.',
  '.WEWWWEW..CWWC',
  '.WWWWWWW..CWW.',
  '..WWWWW..CWWC.',
  '..WWWWWWWWWW..',
  '..WWWWWWWWWW..',
  '.WW.CC..CC.WW.',
  '.BB........BB.',
  '..............',
];

export function getFoxSprite(walking: boolean): HTMLCanvasElement {
  return getCachedSprite(walking ? 'fox_walk' : 'fox_idle', walking ? FOX_WALK : FOX_IDLE, FOX_PALETTE);
}

const STAR_PALETTE: Record<string, string> = {
  Y: '#FFD93D',
  L: '#FFF3A8',
  O: '#F59E0B',
};

const STAR_MATRIX = [
  '.....YY.....',
  '.....YL.....',
  '....YYLY....',
  'YYYYYLLYYYYY',
  '.YYYYLLYYYY.',
  '..YYLLLLYY..',
  '...YYYYYY...',
  '..YYYOOYYY..',
  '.YYY....YYY.',
  '.YY......YY.',
];

const COIN_PALETTE: Record<string, string> = {
  Y: '#FFD93D',
  L: '#FFF7C2',
  O: '#D97706',
};

const COIN_MATRIX_1 = [
  '..YYYY..',
  '.YLLYYY.',
  'YL..OYYO',
  'YL..OYYO',
  'YL..OYYO',
  'YL..OYYO',
  '.YOOYYY.',
  '..OOOO..',
];

const COIN_MATRIX_2 = [
  '...YY...',
  '..YLLY..',
  '..YLOY..',
  '..YLOY..',
  '..YLOY..',
  '..YLOY..',
  '..YOOY..',
  '...OO...',
];

const KEY_PALETTE: Record<string, string> = {
  G: '#FFD93D',
  L: '#FFF7C2',
  O: '#B45309',
};

const KEY_MATRIX = [
  '..GGGG......',
  '.GLLLLG.....',
  '.GL..OG.....',
  '.GLLLLGGGGGG',
  '..GGGGGOOGOG',
  '.........O.O',
];

export function getCollectibleSprite(
  kind: 'star' | 'coin' | 'secret_key' | 'glitch_gem',
  tick: number
): HTMLCanvasElement {
  if (kind === 'star') return getCachedSprite('star', STAR_MATRIX, STAR_PALETTE);
  if (kind === 'secret_key') return getCachedSprite('secret_key', KEY_MATRIX, KEY_PALETTE);
  if (kind === 'glitch_gem') {
    return getCachedSprite('glitch_gem', STAR_MATRIX, {
      Y: '#FF3E9D',
      L: '#A5F3FC',
      O: '#7E22CE',
    });
  }
  const narrow = Math.floor(tick / 12) % 2 === 1;
  return getCachedSprite(narrow ? 'coin_2' : 'coin_1', narrow ? COIN_MATRIX_2 : COIN_MATRIX_1, COIN_PALETTE);
}

const CLOUD_PALETTE: Record<string, string> = {
  W: '#F5E8FF',
  L: '#C084FC',
  P: '#FF75B5',
  D: '#5B45B8',
};

const CLOUD_MATRIX = [
  '........WWWWWW..........',
  '......WWWWWWWWWW........',
  '....WWWWWWWWWWWWWW..WWW.',
  '..WWWWWWWWWWWWWWWWWWWWWW',
  '.LLLLWWWWWWWWWWWWWWWWWWP',
  'DDDDLLLLLPPPPPPPPPPPPPDD',
];

export function getCloudSprite(): HTMLCanvasElement {
  return getCachedSprite('cloud_1', CLOUD_MATRIX, CLOUD_PALETTE);
}

const TREE_PALETTE: Record<string, string> = {
  G: '#10B981',
  L: '#22FF88',
  C: '#38BDF8',
  D: '#065F46',
  B: '#4C1D95',
  b: '#7C3AED',
};

const TREE_MATRIX = [
  '....LLLLLL....',
  '..LLGGGGCCLL..',
  '.LGGGGCCCCGGL.',
  'LGGGGGCCCCGGGD',
  'LGGGGGGGGGGGGD',
  'DGGGGGGGGDDDD.',
  '.DDDDGGDDDDD..',
  '.....BbB......',
  '.....BbB......',
  '.....BbB......',
  '....BBbBB.....',
];

export function getTreeSprite(): HTMLCanvasElement {
  return getCachedSprite('tree_1', TREE_MATRIX, TREE_PALETTE);
}

const LAMP_PALETTE: Record<string, string> = {
  P: '#4F46E5',
  p: '#818CF8',
  C: '#67E8F9',
  W: '#ECFEFF',
};

const LAMP_MATRIX = [
  '.PPPPPPPPP..',
  'PP.......PP.',
  'P........WWC',
  'P........CCC',
  'P...........',
  'P...........',
  'P...........',
  'P...........',
  'P...........',
  'P...........',
  'P...........',
  'Pp..........',
  'PPP.........',
];

export function getLampSprite(): HTMLCanvasElement {
  return getCachedSprite('lamp_1', LAMP_MATRIX, LAMP_PALETTE);
}

// Interactive station sprites
const STATION_MATRICES: Record<string, { rows: string[]; palette: Record<string, string> }> = {
  ds_console: {
    rows: [
      '.KKKKKKKKKKKKKK.',
      'KPPPPPPPPPPPPPPK',
      'KPGGGGGGGGGGGGPK',
      'KPGggggggggggGPK',
      'KPGgSSSSSSSSgGPK',
      'KPPPPPPPPPPPPPPK',
      '.KKKKKKKKKKKKKK.',
      'KPPPPPPPPPPPPPPK',
      'KP+PPPPppppPPoPK',
      'KP++PPppppppPoPK',
      'KPPPPPPPPPPPPPPK',
      '.KKKKKKKKKKKKKK.',
    ],
    palette: {
      K: '#120D24',
      P: '#FF3E9D',
      p: '#FF8AC6',
      G: '#1F4B3B',
      g: '#22FF88',
      S: '#FFD93D',
      '+': '#E2E8F0',
      o: '#38BDF8',
    },
  },
  computer: {
    rows: [
      '..KKKKKKKKKK..',
      '.KLLLLLLLLLLK.',
      '.KLCCCCCCCCLK.',
      '.KLCGGGGGGCLK.',
      '.KLCCCCCCCCLK.',
      '.KLLLLLLLLLLK.',
      '..KKKKKKKKKK..',
      '.....KKKK.....',
      '..KKKKKKKKKK..',
      '.KPPPPPPPPPPK.',
      '.KKKKKKKKKKKK.',
    ],
    palette: {
      K: '#1B1730',
      L: '#F8DDF0',
      C: '#0F172A',
      G: '#22FF88',
      P: '#FF75B5',
    },
  },
  bookshelf: {
    rows: [
      'KKKKKKKKKKKK',
      'KBBBBBBBBBBK',
      'KBRGYPBGRPYK',
      'KBRGYPBGRPYK',
      'KBBBBBBBBBBK',
      'KPYBGRPYBGRK',
      'KPYBGRPYBGRK',
      'KBBBBBBBBBBK',
      'KGRPYBGRPYBK',
      'KBBBBBBBBBBK',
    ],
    palette: {
      K: '#1B1730',
      B: '#78350F',
      R: '#FF3E9D',
      G: '#22FF88',
      Y: '#FFD93D',
      P: '#A855F7',
    },
  },
  sketchbook: {
    rows: [
      '..KKKKKKKK..',
      '.KWWWWWWWWK.',
      '.KWPWWWWGWK.',
      '.KWWPWWGWWK.',
      '.KWWWYWWWWK.',
      '.KWWWWWWWWK.',
      '..KKKKKKKK..',
      '....KKKK....',
      '...KBBBBK...',
    ],
    palette: {
      K: '#1B1730',
      W: '#FFFBEB',
      P: '#FF3E9D',
      G: '#22FF88',
      Y: '#FFD93D',
      B: '#5B45B8',
    },
  },
  chest: {
    rows: [
      '..KKKKKKKK..',
      '.KOOOOOOOOOK',
      'KOOYYYYYYYOK',
      'KOOOOOOOOOOK',
      'KKKKKYYKKKKK',
      'KBBBBYYBBBBK',
      'KBBBBBBBBBBK',
      '.KKKKKKKKKK.',
    ],
    palette: {
      K: '#1B1730',
      O: '#F59E0B',
      Y: '#FFD93D',
      B: '#7C2D12',
    },
  },
  tool_shrine: {
    rows: [
      '....CCCC....',
      '...CWWWWC...',
      '..CCGGGGCC..',
      '...CCCCCC...',
      '..KKKKKKKK..',
      '.KPPPPPPPPK.',
      '.KPPGGGGPPK.',
      '.KPPPPPPPPK.',
      'KKKKKKKKKKKK',
    ],
    palette: {
      K: '#1B1730',
      C: '#38BDF8',
      W: '#ECFEFF',
      G: '#22FF88',
      P: '#4C1D95',
    },
  },
  quest_board: {
    rows: [
      '.KKKKKKKKKKKKKK.',
      'KBBBBBBBBBBBBBBK',
      'KBWWWWBYYYYBWWBK',
      'KBWPWWBYPPYBWGBK',
      'KBWWWWBYYYYBWWBK',
      'KBBBBBBBBBBBBBBK',
      'KBGGGGGBWWBBBBBK',
      'KBBBBBBBBBBBBBBK',
      '..KK........KK..',
      '..KK........KK..',
    ],
    palette: {
      K: '#1B1730',
      B: '#92400E',
      W: '#FFFBEB',
      Y: '#FEF08A',
      P: '#FF3E9D',
      G: '#22FF88',
    },
  },
  portal_door: {
    rows: [
      '..KKKKKKKK..',
      '.KPPPPPPPPK.',
      'KPCCCCCCCCPK',
      'KPCWWWWWWCPK',
      'KPCWGGGGWCPK',
      'KPCWGGGGWCPK',
      'KPCWWWWWWCPK',
      'KPCCCCCCCCPK',
      'KKKKKKKKKKKK',
    ],
    palette: {
      K: '#120D24',
      P: '#5B45B8',
      C: '#FF3E9D',
      W: '#FFD93D',
      G: '#1E1B4B',
    },
  },
  boss_hydra: {
    rows: [
      '..P......P..',
      '.PPP....PPP.',
      'PPYPP..PPYPP',
      'PPPPPPPPPPPP',
      '.PPKPPPPKPP.',
      '..PPPPPPPP..',
      '.PPGGGGGGPP.',
      'PPPKKKKKKPPP',
      'PP.PPPPPP.PP',
      'P..PP..PP..P',
      '...KK..KK...',
    ],
    palette: {
      P: '#9333EA',
      Y: '#FFD93D',
      K: '#111827',
      G: '#FF3E9D',
    },
  },
  contact_gate: {
    rows: [
      '..CCCCCCCCCC..',
      '.CCGGGGGGGGCC.',
      'CCGGWWWWWWGGCC',
      'CGWWPPPPPPWWGC',
      'CGWPCCCCCCPWGC',
      'CGWPCCCCCCPWGC',
      'CGWWPPPPPPWWGC',
      'CCGGWWWWWWGGCC',
      'KKKKKKKKKKKKKK',
    ],
    palette: {
      C: '#38BDF8',
      G: '#22FF88',
      W: '#ECFEFF',
      P: '#FF3E9D',
      K: '#1E1B4B',
    },
  },
  signpost: {
    rows: [
      '.KKKKKKKK.',
      'KYYYYYYYYK',
      'KYKKKKKKYK',
      'KYYYYYYYYK',
      '.KKKKKKKK.',
      '....KK....',
      '....KK....',
      '....KK....',
    ],
    palette: {
      K: '#1B1730',
      Y: '#FBBF24',
    },
  },
};

export function getStationSprite(key: string): HTMLCanvasElement {
  const def = STATION_MATRICES[key] || STATION_MATRICES.signpost;
  return getCachedSprite(`station_${key}`, def.rows, def.palette);
}
