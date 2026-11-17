import { getFoxSprite, getMeeraSprite } from './sprites';

// Crisp 7-row chunky arcade bitmap glyphs tailored for PLAYER PROFILE & ABOUT ME
const CRT_GLYPHS: Record<string, string[]> = {
  A: [
    '..1111..',
    '.11..11.',
    '11....11',
    '11111111',
    '11....11',
    '11....11',
    '11....11',
  ],
  B: [
    '111111..',
    '11...11.',
    '11...11.',
    '111111..',
    '11...11.',
    '11...11.',
    '111111..',
  ],
  C: [
    '.111111.',
    '11....11',
    '11......',
    '11......',
    '11......',
    '11....11',
    '.111111.',
  ],
  E: [
    '1111111',
    '11.....',
    '11.....',
    '111111.',
    '11.....',
    '11.....',
    '1111111',
  ],
  F: [
    '1111111',
    '11.....',
    '11.....',
    '111111.',
    '11.....',
    '11.....',
    '11.....',
  ],
  I: [
    '111111',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
    '111111',
  ],
  J: [
    '..111111',
    '.....11.',
    '.....11.',
    '.....11.',
    '11...11.',
    '11...11.',
    '.11111..',
  ],
  L: [
    '11....',
    '11....',
    '11....',
    '11....',
    '11....',
    '11....',
    '111111',
  ],
  M: [
    '11....11',
    '111..111',
    '11111111',
    '11.11.11',
    '11....11',
    '11....11',
    '11....11',
  ],
  N: [
    '11....11',
    '111...11',
    '1111..11',
    '11.11.11',
    '11..1111',
    '11...111',
    '11....11',
  ],
  O: [
    '.111111.',
    '11....11',
    '11....11',
    '11....11',
    '11....11',
    '11....11',
    '.111111.',
  ],
  P: [
    '111111..',
    '11...11.',
    '11...11.',
    '111111..',
    '11......',
    '11......',
    '11......',
  ],
  R: [
    '111111..',
    '11...11.',
    '11...11.',
    '111111..',
    '11..11..',
    '11...11.',
    '11....11',
  ],
  S: [
    '.111111.',
    '11....11',
    '11......',
    '.111111.',
    '......11',
    '11....11',
    '.111111.',
  ],
  T: [
    '11111111',
    '...11...',
    '...11...',
    '...11...',
    '...11...',
    '...11...',
    '...11...',
  ],
  U: [
    '11....11',
    '11....11',
    '11....11',
    '11....11',
    '11....11',
    '11....11',
    '.111111.',
  ],
  Y: [
    '11....11',
    '11....11',
    '.11..11.',
    '..1111..',
    '...11...',
    '...11...',
    '...11...',
  ],
};

export interface PixelCell {
  gx: number;
  gy: number;
  wordIndex: number;
  letterIndex: number;
  topEdge: boolean;
  bottomEdge: boolean;
  leftEdge: boolean;
  rightEdge: boolean;
  seed: number;
}

export interface PixelPhraseLayout {
  widthUnits: number;
  heightUnits: number;
  cells: PixelCell[];
}

export function buildPixelPhrase(phrase: string): PixelPhraseLayout {
  const heightUnits = 7;
  const cells: PixelCell[] = [];
  let cursorX = 0;
  let wordIdx = 0;

  const chars = phrase.toUpperCase().split('');
  chars.forEach((ch, idx) => {
    if (ch === ' ') {
      cursorX += 3.2;
      wordIdx++;
      return;
    }

    const matrix = CRT_GLYPHS[ch] || CRT_GLYPHS.O;
    const lw = matrix[0].length;
    const isFilled = (lx: number, ly: number) =>
      ly >= 0 && ly < heightUnits && lx >= 0 && lx < lw && matrix[ly][lx] === '1';

    for (let ly = 0; ly < heightUnits; ly++) {
      for (let lx = 0; lx < lw; lx++) {
        if (!isFilled(lx, ly)) continue;
        const hash = ((idx + 3) * 67 + lx * 29 + ly * 19) % 101;
        cells.push({
          gx: cursorX + lx,
          gy: ly,
          wordIndex: wordIdx,
          letterIndex: idx,
          topEdge: !isFilled(lx, ly - 1),
          bottomEdge: !isFilled(lx, ly + 1),
          leftEdge: !isFilled(lx - 1, ly),
          rightEdge: !isFilled(lx + 1, ly),
          seed: hash / 101,
        });
      }
    }

    cursorX += lw + (idx < chars.length - 1 && chars[idx + 1] !== ' ' ? 1.3 : 0);
  });

  return {
    widthUnits: cursorX,
    heightUnits,
    cells,
  };
}

// Draw a chunky vintage pixel cloud inspired by the cream/peach pastel reference
function drawRetroPixelCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  px: number,
  scale: number
) {
  const unit = Math.max(2, Math.round(px * scale));
  const pattern = [
    '.....11111......',
    '...111111111....',
    '.1111111111111..',
    '111111111111111.',
    '2222222222222222',
    '.33333333333333.',
  ];
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      const code = pattern[r][c];
      if (code === '.') continue;
      ctx.fillStyle =
        code === '1'
          ? '#FFF3E0'
          : code === '2'
          ? '#F6D3B3'
          : '#DFA89C';
      ctx.fillRect(Math.floor(x + c * unit), Math.floor(y + r * unit), unit, unit);
    }
  }
}

export function renderRetroLandscape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tick: number,
  disintegration: number // 0 = normal, 0..1 = zooming forward into About Me
) {
  const px = Math.max(3, Math.floor(Math.min(w, h) / 145));

  // 1. Warm vintage cream sky shifting gently toward soft rose & obsidian-violet horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#FFF5E1');
  skyGrad.addColorStop(0.52, '#FCE3D4');
  skyGrad.addColorStop(0.76, '#F4C9D6');
  skyGrad.addColorStop(1, '#2D1E46');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft vintage solar halo behind center title (warm cream spotlight matching reference)
  const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.44, 16, w * 0.5, h * 0.44, Math.max(w, h) * 0.46);
  sunGrad.addColorStop(0, 'rgba(255, 252, 240, 0.92)');
  sunGrad.addColorStop(0.55, 'rgba(255, 232, 200, 0.35)');
  sunGrad.addColorStop(1, 'rgba(255, 232, 200, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle horizontal atmospheric pixel bands near horizon
  ctx.fillStyle = 'rgba(255, 117, 181, 0.14)';
  ctx.fillRect(0, Math.floor(h * 0.62), w, px * 2);
  ctx.fillStyle = 'rgba(103, 232, 249, 0.14)';
  ctx.fillRect(0, Math.floor(h * 0.66), w, px * 1.5);

  // 3. Layered Pixel-Art Clouds drifting peacefully at distinct speeds
  const clouds = [
    { baseX: w * 0.1, y: h * 0.14, speed: 0.24, scale: 1.3 },
    { baseX: w * 0.68, y: h * 0.11, speed: 0.18, scale: 1.65 },
    { baseX: w * 0.34, y: h * 0.24, speed: 0.12, scale: 0.9 },
    { baseX: w * 0.82, y: h * 0.31, speed: 0.28, scale: 1.1 },
    { baseX: w * 0.06, y: h * 0.38, speed: 0.15, scale: 1.05 },
  ];
  for (const cl of clouds) {
    const cx = ((cl.baseX + tick * cl.speed) % (w + 180)) - 90;
    drawRetroPixelCloud(ctx, cx, cl.y, px, cl.scale);
  }

  // 4. Stepped Distant Pastel Lavender / Teal Pixel Mountains
  const colW = px * 4;
  const horizonY = h * 0.72;
  for (let x = 0; x < w + colW; x += colW) {
    const ridgeH =
      Math.sin(x * 0.008 + 0.5) * (h * 0.075) +
      Math.cos(x * 0.019) * (h * 0.032) +
      h * 0.09;
    const ry = Math.floor((horizonY - ridgeH) / px) * px;
    ctx.fillStyle = '#C9BEDC';
    ctx.fillRect(x, ry, colW + 1, h - ry);
    ctx.fillStyle = '#DDD3EC';
    ctx.fillRect(x, ry, colW + 1, px * 2);
  }

  // 5. Midground Cyan-Sage Pixel Forest & Designer Sanctuary Silhouette
  const midY = h * 0.78;
  for (let x = 0; x < w + colW; x += colW) {
    const hillH =
      Math.sin(x * 0.014 + 2.1) * (h * 0.04) +
      Math.cos(x * 0.03) * (h * 0.02) +
      h * 0.065;
    const hy = Math.floor((midY - hillH) / px) * px;
    ctx.fillStyle = '#8FB9A8';
    ctx.fillRect(x, hy, colW + 1, h - hy);
    ctx.fillStyle = '#A8D5C2';
    ctx.fillRect(x, hy, colW + 1, px * 1.5);
  }

  // Distant Pixel Atelier Cottage (ties directly to Player Profile's building on Hub!)
  const hutX = Math.floor(w * 0.5 - px * 16);
  const hutY = Math.floor(midY - px * 17);
  ctx.fillStyle = '#332568';
  ctx.fillRect(hutX + px * 2, hutY + px * 7, px * 28, px * 11);
  // Pitched coral-pink roof
  ctx.fillStyle = '#9D174D';
  ctx.fillRect(hutX, hutY + px * 4, px * 32, px * 4);
  ctx.fillStyle = '#FF3E9D';
  ctx.fillRect(hutX + px * 4, hutY + px * 1, px * 24, px * 3);
  // Chimney + animated smoke puff
  ctx.fillStyle = '#4C1D95';
  ctx.fillRect(hutX + px * 23, hutY - px * 3, px * 4, px * 5);
  const smokePhase = (tick * 0.035) % 1;
  ctx.globalAlpha = 0.7 * (1 - smokePhase);
  ctx.fillStyle = '#FFF3E0';
  ctx.fillRect(
    Math.floor(hutX + px * 23 + Math.sin(smokePhase * 5) * px * 2),
    Math.floor(hutY - px * (5 + smokePhase * 7)),
    px * 3,
    px * 2
  );
  ctx.globalAlpha = 1;
  // Lit cozy atelier window & emerald door
  ctx.fillStyle = '#FFD93D';
  ctx.fillRect(hutX + px * 6, hutY + px * 10, px * 6, px * 4);
  ctx.fillStyle = '#22FF88';
  ctx.fillRect(hutX + px * 18, hutY + px * 10, px * 5, px * 8);

  // 6. Foreground Deep Obsidian-Emerald Ridge framing the characters
  const fgY = h * 0.85;
  for (let x = 0; x < w + colW; x += colW) {
    const wave = Math.sin(x * 0.011) * (h * 0.018);
    const fy = Math.floor((fgY + wave) / px) * px;
    ctx.fillStyle = '#0F4C3A';
    ctx.fillRect(x, fy, colW + 1, h - fy);
    ctx.fillStyle = '#22FF88';
    ctx.fillRect(x, fy, colW + 1, px);
    ctx.fillStyle = '#0B1221';
    ctx.fillRect(x, fy + px * 5, colW + 1, h - (fy + px * 5));
  }

  // Subtle swaying pixel flowers / neon sparkles on foreground ridge
  for (let f = 0; f < 9; f++) {
    const fx = Math.floor(w * (0.09 + f * 0.1));
    const sway = Math.round(Math.sin(tick * 0.06 + f) * px * 0.5);
    const fy = Math.floor(fgY + Math.sin(fx * 0.011) * (h * 0.018) - px * 2);
    ctx.fillStyle = f % 3 === 0 ? '#FF3E9D' : f % 2 === 0 ? '#38BDF8' : '#FFD93D';
    ctx.fillRect(fx + sway, fy, px * 1.4, px * 1.4);
  }

  // 7. Meera & Pixel Fox on the lower hill greeting the player
  if (disintegration < 0.7) {
    const bob = Math.floor(tick / 18) % 2 === 0 ? 0 : -px * 0.5;
    const meeraSpr = getMeeraSprite(Math.floor(tick / 20) % 2 === 0 ? 'wave' : 'idle1');
    const foxSpr = getFoxSprite(Math.floor(tick / 24) % 2 === 0);

    const charScale = Math.max(2, Math.floor(px * 0.92));
    const mw = meeraSpr.width * charScale;
    const mh = meeraSpr.height * charScale;
    const mx = Math.floor(w * 0.14);
    const my = Math.floor(fgY + Math.sin(mx * 0.011) * (h * 0.018) - mh + px + bob);

    ctx.globalAlpha = Math.max(0, 1 - disintegration * 1.4);
    ctx.drawImage(meeraSpr, mx, my, mw, mh);

    const fw = foxSpr.width * Math.max(2, Math.floor(px * 0.78));
    const fh = foxSpr.height * Math.max(2, Math.floor(px * 0.78));
    const fx = Math.floor(w * 0.82);
    const fy = Math.floor(fgY + Math.sin(fx * 0.011) * (h * 0.018) - fh + px);
    ctx.drawImage(foxSpr, fx, fy, fw, fh);
    ctx.globalAlpha = 1;
  }
}

export function renderCrtTitleTypography(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  subPhrase: PixelPhraseLayout,
  mainPhrase: PixelPhraseLayout,
  assembleT: number, // 0..1
  shatterT: number, // 0..1 (Scene E exit fragmentation)
  tick: number
) {
  const cx = w / 2;

  // Main title ("ABOUT ME") sizing — large, architectural, chunky pixel art
  const mainMaxW = w * 0.78;
  const mainCell = Math.max(4, Math.min(mainMaxW / mainPhrase.widthUnits, (h * 0.25) / 7));
  const mainW = mainPhrase.widthUnits * mainCell;
  const mainH = 7 * mainCell;
  const mainOriginX = cx - mainW / 2;
  const mainOriginY = h * 0.34;

  // Sub-label ("PLAYER PROFILE") sizing
  const subMaxW = w * 0.52;
  const subCell = Math.max(2.5, Math.min(subMaxW / subPhrase.widthUnits, mainCell * 0.38));
  const subW = subPhrase.widthUnits * subCell;
  const subH = 7 * subCell;
  const subOriginX = cx - subW / 2;
  const subOriginY = mainOriginY - subH - Math.max(14, mainCell * 2.1);

  const drawChunkyPhrase = (
    layout: PixelPhraseLayout,
    originX: number,
    originY: number,
    cell: number,
    isHeroTitle: boolean
  ) => {
    const shadowStep = Math.max(2, cell * 0.42);
    const outlineW = Math.max(1.5, cell * 0.18);

    // 1. Crosshatch / Stepped 3D Retro Drop Shadow (drawn once words start landing)
    if (assembleT > 0.25 && shatterT < 0.25) {
      const shadowAlpha = Math.min(1, (assembleT - 0.25) / 0.35) * (1 - shatterT * 4);
      ctx.globalAlpha = shadowAlpha;

      for (const c of layout.cells) {
        const pxX = originX + c.gx * cell;
        const pxY = originY + c.gy * cell;

        // Deepest stepped shadow with subtle retro dither look
        ctx.fillStyle = isHeroTitle ? '#331D47' : '#25193B';
        ctx.fillRect(pxX + shadowStep * 1.4, pxY + shadowStep * 1.5, cell + 0.6, cell + 0.6);

        // Inner shadow step matching vintage pixel poster print
        ctx.fillStyle = isHeroTitle ? '#9D174D' : '#161129';
        ctx.fillRect(pxX + shadowStep * 0.7, pxY + shadowStep * 0.75, cell + 0.6, cell + 0.6);
      }
      ctx.globalAlpha = 1;
    }

    // 2. Individual Pixel Cells (gather from crisp grid offsets OR shatter cleanly on Scene E)
    for (const c of layout.cells) {
      const letterDelay = (c.letterIndex / 14) * 0.34 + c.seed * 0.14;
      const localP = Math.max(0, Math.min(1, (assembleT - letterDelay) / 0.42));
      if (localP <= 0.01) continue;

      // Crisp bounce overshoot near lock-in
      const easeOut = 1 - Math.pow(1 - localP, 3);
      const bounceOffset =
        localP > 0.68 && localP < 1
          ? Math.sin(((localP - 0.68) / 0.32) * Math.PI) * -cell * 0.45
          : 0;

      const targetX = originX + c.gx * cell;
      const targetY = originY + c.gy * cell + bounceOffset;

      // Gather displacement (ordered orbital pixel spiral)
      const angle = c.seed * Math.PI * 2;
      const gatherDist = (1 - easeOut) * (isHeroTitle ? 95 : 55);

      // Exit shatter displacement (Scene E burst toward viewer & outward)
      const shatterEase = shatterT * shatterT;
      const sxDir = (targetX - cx) * 0.012 + Math.cos(angle) * 1.4;
      const syDir = (targetY - h * 0.42) * 0.012 + Math.sin(angle) * 1.1;
      const shatterScale = 1 + shatterEase * (0.4 + c.seed * 0.9);

      const drawX =
        targetX +
        Math.cos(angle) * gatherDist +
        sxDir * shatterEase * (w * 0.42);
      const drawY =
        targetY +
        Math.sin(angle) * gatherDist * 0.6 +
        syDir * shatterEase * (h * 0.42);

      const drawCell = cell * (shatterT > 0 ? Math.max(0.2, 1.35 - shatterEase) * shatterScale * 0.7 : 1);

      ctx.globalAlpha = Math.min(1, easeOut * 1.2) * Math.max(0, 1 - shatterEase * 1.15);

      // Colour Ramp:
      // ABOUT ME uses warm cream-gold top transitioning cleanly into coral-neon pink bottom
      // PLAYER PROFILE uses crisp deep obsidian-violet ink with neon pink top glint for razor-sharp legibility on cream sky
      if (isHeroTitle) {
        const rowT = c.gy / 6;
        if (rowT < 0.25) {
          ctx.fillStyle = '#FFF2CC'; // Warm Cream Top Highlight
        } else if (rowT < 0.5) {
          ctx.fillStyle = '#FDBA8C'; // Vintage Pastel Peach
        } else if (rowT < 0.78) {
          ctx.fillStyle = '#FF75B5'; // Portfolio Pastel Neon Pink
        } else {
          ctx.fillStyle = '#FF3E9D'; // Portfolio Signature Pink
        }
      } else {
        ctx.fillStyle = c.gy < 2 ? '#4C1D95' : c.gy < 5 ? '#2E1A59' : '#161129';
      }

      ctx.fillRect(drawX, drawY, drawCell + 0.6, drawCell + 0.6);

      // Crisp Dark Ink Stepped Outline (makes pixel lettering razor sharp against cream sky!)
      if (shatterT < 0.25 && easeOut > 0.75) {
        ctx.fillStyle = '#161129';
        if (c.topEdge) ctx.fillRect(drawX - outlineW * 0.5, drawY - outlineW, drawCell + outlineW, outlineW);
        if (c.bottomEdge) ctx.fillRect(drawX - outlineW * 0.5, drawY + drawCell, drawCell + outlineW, outlineW);
        if (c.leftEdge) ctx.fillRect(drawX - outlineW, drawY, outlineW, drawCell + 0.6);
        if (c.rightEdge) ctx.fillRect(drawX + drawCell, drawY, outlineW, drawCell + 0.6);

        // Specular highlight pixel along top edges
        if (c.topEdge && c.gy === 0) {
          ctx.fillStyle = isHeroTitle ? '#FFFFFF' : '#FF75B5';
          ctx.fillRect(drawX, drawY, drawCell + 0.4, Math.max(1.5, cell * 0.16));
        }
      }
    }

    ctx.globalAlpha = 1;
  };

  drawChunkyPhrase(subPhrase, subOriginX, subOriginY, subCell, false);
  drawChunkyPhrase(mainPhrase, mainOriginX, mainOriginY, mainCell, true);

  // Subtle decorative arcade glint stars on corners once settled
  if (assembleT > 0.9 && shatterT < 0.1) {
    const twinkle = Math.floor(tick / 14) % 2 === 0 ? 1 : 0.45;
    const glints = [
      { x: mainOriginX - mainCell * 1.4, y: mainOriginY + mainCell * 0.5, c: '#FF3E9D' },
      { x: mainOriginX + mainW + mainCell * 0.8, y: mainOriginY + mainH - mainCell, c: '#22FF88' },
    ];
    for (const g of glints) {
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = g.c;
      const gs = Math.max(3, mainCell * 0.35);
      ctx.fillRect(g.x - gs, g.y, gs * 2, gs * 0.6);
      ctx.fillRect(g.x - gs * 0.3, g.y - gs * 0.7, gs * 0.6, gs * 2);
    }
    ctx.globalAlpha = 1;
  }
}

// =============================================================================
// MISSION CONTROL -> PROJECTS CRT LANDSCAPE & 3D PIXEL TITLE RENDERER
// =============================================================================
export function renderMissionCrtLandscape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tick: number,
  disintegration: number
) {
  const px = Math.max(3, Math.floor(Math.min(w, h) / 145));

  // 1. Warm vintage cream sky transitioning through pastel peach-cyan into nocturnal command slate
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#FFF6E0');
  skyGrad.addColorStop(0.46, '#FBE2C6');
  skyGrad.addColorStop(0.72, '#D7E8EE');
  skyGrad.addColorStop(1, '#12132B');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle solar highlight centered behind title lockup
  const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.43, 18, w * 0.5, h * 0.43, Math.max(w, h) * 0.48);
  sunGrad.addColorStop(0, 'rgba(255, 253, 242, 0.94)');
  sunGrad.addColorStop(0.55, 'rgba(255, 226, 175, 0.36)');
  sunGrad.addColorStop(1, 'rgba(255, 226, 175, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  // Retro atmospheric pixel horizon bars (cyan & pink portfolio accents)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
  ctx.fillRect(0, Math.floor(h * 0.6), w, px * 2);
  ctx.fillStyle = 'rgba(255, 62, 157, 0.12)';
  ctx.fillRect(0, Math.floor(h * 0.64), w, px * 1.5);

  // 2. Drifting Layered Pixel Clouds
  const clouds = [
    { baseX: w * 0.08, y: h * 0.13, speed: 0.22, scale: 1.35 },
    { baseX: w * 0.72, y: h * 0.1, speed: 0.16, scale: 1.6 },
    { baseX: w * 0.38, y: h * 0.22, speed: 0.11, scale: 0.9 },
    { baseX: w * 0.84, y: h * 0.29, speed: 0.26, scale: 1.1 },
    { baseX: w * 0.15, y: h * 0.37, speed: 0.14, scale: 1.0 },
  ];
  for (const cl of clouds) {
    const cx = ((cl.baseX + tick * cl.speed) % (w + 180)) - 90;
    drawRetroPixelCloud(ctx, cx, cl.y, px, cl.scale);
  }

  // 3. Distant Pastel Slate-Violet Mountain Ridges
  const colW = px * 4;
  const horizonY = h * 0.71;
  for (let x = 0; x < w + colW; x += colW) {
    const ridgeH =
      Math.sin(x * 0.009 + 1.2) * (h * 0.07) +
      Math.cos(x * 0.021) * (h * 0.03) +
      h * 0.085;
    const ry = Math.floor((horizonY - ridgeH) / px) * px;
    ctx.fillStyle = '#B9C3DA';
    ctx.fillRect(x, ry, colW + 1, h - ry);
    ctx.fillStyle = '#D5DDF0';
    ctx.fillRect(x, ry, colW + 1, px * 2);
  }

  // 4. Midground Mint-Teal Foothills + Mission Control Citadel Silhouette
  const midY = h * 0.78;
  for (let x = 0; x < w + colW; x += colW) {
    const hillH =
      Math.sin(x * 0.015 + 0.4) * (h * 0.036) +
      Math.cos(x * 0.032) * (h * 0.018) +
      h * 0.06;
    const hy = Math.floor((midY - hillH) / px) * px;
    ctx.fillStyle = '#7FB4A9';
    ctx.fillRect(x, hy, colW + 1, h - hy);
    ctx.fillStyle = '#9FD3C7';
    ctx.fillRect(x, hy, colW + 1, px * 1.5);
  }

  // Stylized Mission Control Citadel (matches hub's twin beacon towers & radar screen)
  const citX = Math.floor(w * 0.5 - px * 22);
  const citY = Math.floor(midY - px * 20);
  ctx.fillStyle = '#2A215C';
  ctx.fillRect(citX, citY + px * 2, px * 7, px * 19);
  ctx.fillRect(citX + px * 37, citY + px * 2, px * 7, px * 19);

  const beaconOn = Math.floor(tick / 16) % 2 === 0;
  ctx.fillStyle = beaconOn ? '#FFD93D' : '#FF3E9D';
  ctx.fillRect(citX + px * 1.5, citY - px * 1, px * 4, px * 3);
  ctx.fillRect(citX + px * 38.5, citY - px * 1, px * 4, px * 3);

  ctx.fillStyle = '#191538';
  ctx.fillRect(citX + px * 6, citY + px * 6, px * 32, px * 15);
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(citX + px * 21, citY, px * 2, px * 6);
  const dishSpan = Math.max(px * 2, Math.abs(Math.round(Math.cos(tick * 0.05) * px * 5)));
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(citX + px * 22 - dishSpan / 2, citY - px * 2, dishSpan, px * 2.5);

  ctx.fillStyle = '#070814';
  ctx.fillRect(citX + px * 11, citY + px * 8, px * 22, px * 7);
  ctx.fillStyle = beaconOn ? '#22FF88' : '#38BDF8';
  ctx.fillRect(citX + px * 13, citY + px * 10, px * 8, px * 2);
  ctx.fillStyle = '#FFD93D';
  ctx.fillRect(citX + px * 24, citY + px * 10, px * 7, px * 3);

  ctx.fillStyle = '#FFD93D';
  ctx.fillRect(citX + px * 18, citY + px * 16, px * 8, px * 5);

  // 5. Foreground Command Ridge (Deep Slate-Emerald with Neon Trim)
  const fgY = h * 0.855;
  for (let x = 0; x < w + colW; x += colW) {
    const wave = Math.sin(x * 0.012 + 0.8) * (h * 0.016);
    const fy = Math.floor((fgY + wave) / px) * px;
    ctx.fillStyle = '#0E3A36';
    ctx.fillRect(x, fy, colW + 1, h - fy);
    ctx.fillStyle = '#22FF88';
    ctx.fillRect(x, fy, colW + 1, px);
    ctx.fillStyle = '#070814';
    ctx.fillRect(x, fy + px * 5, colW + 1, h - (fy + px * 5));
  }

  for (let f = 0; f < 8; f++) {
    const fx = Math.floor(w * (0.1 + f * 0.11));
    const fy = Math.floor(fgY + Math.sin(fx * 0.012 + 0.8) * (h * 0.016) - px * 2);
    const pulse = Math.floor(tick / 18 + f) % 3 === 0;
    ctx.fillStyle = pulse ? '#FFD93D' : f % 2 === 0 ? '#38BDF8' : '#FF3E9D';
    ctx.fillRect(fx, fy, px * 1.4, px * 1.4);
  }

  // 6. Existing Portfolio Characters (Meera & Pixel Fox) on foreground ridge
  if (disintegration < 0.7) {
    const bob = Math.floor(tick / 18) % 2 === 0 ? 0 : -px * 0.5;
    const meeraSpr = getMeeraSprite(Math.floor(tick / 20) % 2 === 0 ? 'wave' : 'idle1');
    const foxSpr = getFoxSprite(Math.floor(tick / 22) % 2 === 0);

    const mScale = Math.max(2, Math.floor(px * 0.92));
    const mw = meeraSpr.width * mScale;
    const mh = meeraSpr.height * mScale;
    const mx = Math.floor(w * 0.13);
    const my = Math.floor(fgY + Math.sin(mx * 0.012 + 0.8) * (h * 0.016) - mh + px + bob);

    ctx.globalAlpha = Math.max(0, 1 - disintegration * 1.4);
    ctx.drawImage(meeraSpr, mx, my, mw, mh);

    const fScale = Math.max(2, Math.floor(px * 0.78));
    const fw = foxSpr.width * fScale;
    const fh = foxSpr.height * fScale;
    const fx = Math.floor(w * 0.83);
    const fy = Math.floor(fgY + Math.sin(fx * 0.012 + 0.8) * (h * 0.016) - fh + px);
    ctx.drawImage(foxSpr, fx, fy, fw, fh);
    ctx.globalAlpha = 1;
  }
}

export function renderMissionTitleTypography(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  subPhrase: PixelPhraseLayout,
  mainPhrase: PixelPhraseLayout,
  assembleT: number,
  shatterT: number,
  tick: number
) {
  const cx = w / 2;

  // Main dominant title: "PROJECTS"
  const mainMaxW = w * 0.8;
  const mainCell = Math.max(4, Math.min(mainMaxW / mainPhrase.widthUnits, (h * 0.27) / 7));
  const mainW = mainPhrase.widthUnits * mainCell;
  const mainH = 7 * mainCell;
  const mainOriginX = cx - mainW / 2;
  const mainOriginY = h * 0.34;

  // Header sub-title: "MISSION CONTROL"
  const subMaxW = w * 0.56;
  const subCell = Math.max(2.5, Math.min(subMaxW / subPhrase.widthUnits, mainCell * 0.36));
  const subW = subPhrase.widthUnits * subCell;
  const subH = 7 * subCell;
  const subOriginX = cx - subW / 2;
  const subOriginY = mainOriginY - subH - Math.max(14, mainCell * 2.0);

  const drawTitleBlock = (
    layout: PixelPhraseLayout,
    originX: number,
    originY: number,
    cell: number,
    isHeroTitle: boolean
  ) => {
    const shadowStep = Math.max(2, cell * 0.44);
    const outlineW = Math.max(1.5, cell * 0.18);

    // 1. Stepped 3D Arcade Drop Shadow
    if (assembleT > 0.25 && shatterT < 0.25) {
      const shadowAlpha = Math.min(1, (assembleT - 0.25) / 0.35) * (1 - shatterT * 4);
      ctx.globalAlpha = shadowAlpha;
      for (const c of layout.cells) {
        const pxX = originX + c.gx * cell;
        const pxY = originY + c.gy * cell;

        ctx.fillStyle = isHeroTitle ? '#251748' : '#1A1336';
        ctx.fillRect(pxX + shadowStep * 1.45, pxY + shadowStep * 1.55, cell + 0.6, cell + 0.6);

        ctx.fillStyle = isHeroTitle ? '#9D174D' : '#110D24';
        ctx.fillRect(pxX + shadowStep * 0.72, pxY + shadowStep * 0.78, cell + 0.6, cell + 0.6);
      }
      ctx.globalAlpha = 1;
    }

    // 2. Pixel Cells Assemble -> Impact Bounce -> Scene E Disintegration
    for (const c of layout.cells) {
      const letterDelay = (c.letterIndex / 15) * 0.34 + c.seed * 0.14;
      const localP = Math.max(0, Math.min(1, (assembleT - letterDelay) / 0.42));
      if (localP <= 0.01) continue;

      const easeOut = 1 - Math.pow(1 - localP, 3);
      const bounceOffset =
        localP > 0.68 && localP < 1
          ? Math.sin(((localP - 0.68) / 0.32) * Math.PI) * -cell * 0.48
          : 0;

      const targetX = originX + c.gx * cell;
      const targetY = originY + c.gy * cell + bounceOffset;

      const angle = c.seed * Math.PI * 2;
      const gatherDist = (1 - easeOut) * (isHeroTitle ? 96 : 56);

      const shatterEase = shatterT * shatterT;
      const sxDir = (targetX - cx) * 0.013 + Math.cos(angle) * 1.45;
      const syDir = (targetY - h * 0.42) * 0.013 + Math.sin(angle) * 1.15;
      const shatterScale = 1 + shatterEase * (0.4 + c.seed * 0.9);

      const drawX = targetX + Math.cos(angle) * gatherDist + sxDir * shatterEase * (w * 0.44);
      const drawY = targetY + Math.sin(angle) * gatherDist * 0.6 + syDir * shatterEase * (h * 0.44);
      const drawCell =
        cell * (shatterT > 0 ? Math.max(0.2, 1.35 - shatterEase) * shatterScale * 0.7 : 1);

      ctx.globalAlpha = Math.min(1, easeOut * 1.2) * Math.max(0, 1 - shatterEase * 1.15);

      if (isHeroTitle) {
        const rowT = c.gy / 6;
        if (rowT < 0.26) {
          ctx.fillStyle = '#FFF5C4';
        } else if (rowT < 0.5) {
          ctx.fillStyle = '#FFD93D';
        } else if (rowT < 0.76) {
          ctx.fillStyle = '#FF85B8';
        } else {
          ctx.fillStyle = '#FF3E9D';
        }
      } else {
        ctx.fillStyle = c.gy < 2 ? '#3B256E' : c.gy < 5 ? '#26184B' : '#140E29';
      }

      ctx.fillRect(drawX, drawY, drawCell + 0.6, drawCell + 0.6);

      if (shatterT < 0.25 && easeOut > 0.75) {
        ctx.fillStyle = '#140E29';
        if (c.topEdge) ctx.fillRect(drawX - outlineW * 0.5, drawY - outlineW, drawCell + outlineW, outlineW);
        if (c.bottomEdge) ctx.fillRect(drawX - outlineW * 0.5, drawY + drawCell, drawCell + outlineW, outlineW);
        if (c.leftEdge) ctx.fillRect(drawX - outlineW, drawY, outlineW, drawCell + 0.6);
        if (c.rightEdge) ctx.fillRect(drawX + drawCell, drawY, outlineW, drawCell + 0.6);

        if (c.topEdge && c.gy === 0) {
          ctx.fillStyle = isHeroTitle ? '#FFFFFF' : '#38BDF8';
          ctx.fillRect(drawX, drawY, drawCell + 0.4, Math.max(1.5, cell * 0.16));
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  drawTitleBlock(subPhrase, subOriginX, subOriginY, subCell, false);
  drawTitleBlock(mainPhrase, mainOriginX, mainOriginY, mainCell, true);

  if (assembleT > 0.9 && shatterT < 0.1) {
    const twinkle = Math.floor(tick / 14) % 2 === 0 ? 1 : 0.45;
    const glints = [
      { x: mainOriginX - mainCell * 1.4, y: mainOriginY + mainCell * 0.4, c: '#38BDF8' },
      { x: mainOriginX + mainW + mainCell * 0.8, y: mainOriginY + mainH - mainCell, c: '#22FF88' },
    ];
    for (const g of glints) {
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = g.c;
      const gs = Math.max(3, mainCell * 0.35);
      ctx.fillRect(g.x - gs, g.y, gs * 2, gs * 0.6);
      ctx.fillRect(g.x - gs * 0.3, g.y - gs * 0.7, gs * 0.6, gs * 2);
    }
    ctx.globalAlpha = 1;
  }
}
