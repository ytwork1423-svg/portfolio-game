// Chunky 7x7 arcade bitmap glyphs styled after retro 3D neon-pink space titles

const GLYPHS: Record<string, string[]> = {
  G: [
    '.11111.',
    '11...11',
    '11.....',
    '11..111',
    '11...11',
    '11...11',
    '.11111.',
  ],
  A: [
    '..111..',
    '.11.11.',
    '11...11',
    '1111111',
    '11...11',
    '11...11',
    '11...11',
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
  I: [
    '111111',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
    '111111',
  ],
  F: [
    '111111',
    '11....',
    '11....',
    '11111.',
    '11....',
    '11....',
    '11....',
  ],
  E: [
    '111111',
    '11....',
    '11....',
    '11111.',
    '11....',
    '11....',
    '111111',
  ],
  D: [
    '11111..',
    '11..11.',
    '11...11',
    '11...11',
    '11...11',
    '11..11.',
    '11111..',
  ],
  P: [
    '111111.',
    '11...11',
    '11...11',
    '111111.',
    '11.....',
    '11.....',
    '11.....',
  ],
  O: [
    '.11111.',
    '11...11',
    '11...11',
    '11...11',
    '11...11',
    '11...11',
    '.11111.',
  ],
  R: [
    '111111.',
    '11...11',
    '11...11',
    '111111.',
    '11..11.',
    '11...11',
    '11...11',
  ],
  T: [
    '111111',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
    '..11..',
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
};

export interface ArcadeCell {
  gx: number;
  gy: number;
  topEdge: boolean;
  bottomEdge: boolean;
  leftEdge: boolean;
  rightEdge: boolean;
  seed: number;
  delay: number;
}

export interface ArcadeWordLayout {
  widthUnits: number;
  heightUnits: number;
  cells: ArcadeCell[];
}

export function buildArcadeWord(word: string): ArcadeWordLayout {
  const letters = word.toUpperCase().split('');
  const heightUnits = 7;
  let cursorX = 0;

  // First build occupancy grid for each letter independently so letters never merge borders
  const cells: ArcadeCell[] = [];

  letters.forEach((ch, lIdx) => {
    const matrix = GLYPHS[ch] || GLYPHS.O;
    const lw = matrix[0].length;
    const isFilled = (lx: number, ly: number) =>
      ly >= 0 && ly < heightUnits && lx >= 0 && lx < lw && matrix[ly][lx] === '1';

    for (let ly = 0; ly < heightUnits; ly++) {
      for (let lx = 0; lx < lw; lx++) {
        if (!isFilled(lx, ly)) continue;
        const hash = ((lIdx + 1) * 73 + lx * 31 + ly * 17) % 97;
        cells.push({
          gx: cursorX + lx,
          gy: ly,
          topEdge: !isFilled(lx, ly - 1),
          bottomEdge: !isFilled(lx, ly + 1),
          leftEdge: !isFilled(lx - 1, ly),
          rightEdge: !isFilled(lx + 1, ly),
          seed: hash / 97,
          delay: (lIdx / Math.max(1, letters.length)) * 0.35 + (hash / 97) * 0.2,
        });
      }
    }

    cursorX += lw + (lIdx < letters.length - 1 ? 1.35 : 0);
  });

  return {
    widthUnits: cursorX,
    heightUnits,
    cells,
  };
}

const EXTRUSION_PALETTE = [
  '#3A062E',
  '#4B0739',
  '#5E0945',
  '#740C53',
  '#8B0F62',
  '#A51473',
  '#BF1A85',
  '#DA2297',
  '#EC32A7',
  '#F546B5',
];

export function renderArcadeTitleScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  topWord: ArcadeWordLayout,
  bottomWord: ArcadeWordLayout,
  assembleProgress: number, // 0..1
  impactGlow: number, // 0..1
  sheenPhase: number // 0..1
) {
  const cx = w / 2;
  const cy = h / 2;

  const maxUnits = Math.max(topWord.widthUnits, bottomWord.widthUnits);
  const targetWidth = Math.min(w * 0.88, 1180);
  const maxByHeight = (h * 0.56) / 19;
  const cellSize = Math.max(4, Math.min(targetWidth / maxUnits, maxByHeight));

  const topWordW = topWord.widthUnits * cellSize;
  const bottomWordW = bottomWord.widthUnits * cellSize;
  const wordH = topWord.heightUnits * cellSize;
  const horizonGap = Math.max(26, cellSize * 3.8);

  const topOriginX = cx - topWordW / 2;
  const topOriginY = cy - horizonGap / 2 - wordH;
  const bottomOriginX = cx - bottomWordW / 2;
  const bottomOriginY = cy + horizonGap / 2;

  const drawExtrudedWord = (
    layout: ArcadeWordLayout,
    originX: number,
    originY: number,
    rowOffsetSign: number
  ) => {
    const settledT = Math.max(0, Math.min(1, (assembleProgress - 0.55) / 0.45));

    // 1. Deep 3D perspective extrusion converging toward central horizon (cx, cy)
    if (settledT > 0.05) {
      const steps = EXTRUSION_PALETTE.length;
      for (let s = 0; s < steps; s++) {
        const depthNorm = 1 - s / steps; // 1 = farthest back, ~0.1 = closest to face
        const scale = 1 - depthNorm * 0.23 * settledT;
        ctx.fillStyle = EXTRUSION_PALETTE[s];
        ctx.globalAlpha = (0.55 + 0.45 * settledT) * (0.45 + (s / steps) * 0.55);

        for (let i = 0; i < layout.cells.length; i++) {
          const c = layout.cells[i];
          const fx = originX + c.gx * cellSize;
          const fy = originY + c.gy * cellSize;
          const ex = cx + (fx - cx) * scale;
          const ey = cy + (fy - cy) * scale;
          const ew = cellSize * scale + 0.8;
          const eh = cellSize * scale + 0.8;
          ctx.fillRect(ex, ey, ew, eh);
        }
      }
      ctx.globalAlpha = 1;
    }

    // 2. Front illuminated pixel cells + dynamic assembly streaks
    for (let i = 0; i < layout.cells.length; i++) {
      const c = layout.cells[i];
      const localP = Math.max(0, Math.min(1, (assembleProgress - c.delay) / 0.45));
      if (localP <= 0.01) continue;

      // Ease-out cubic snap
      const ease = 1 - Math.pow(1 - localP, 3);
      const targetX = originX + c.gx * cellSize;
      const targetY = originY + c.gy * cellSize;

      const angle = (c.seed * Math.PI * 2) + rowOffsetSign * 0.8;
      const startDist = (1 - ease) * Math.max(w, h) * 0.34;
      const drawX = targetX + Math.cos(angle) * startDist;
      const drawY = targetY + Math.sin(angle) * startDist * 0.65;

      // Flying particle streak while assembling
      if (localP < 0.96) {
        ctx.globalAlpha = 0.65 * (1 - localP);
        ctx.fillStyle = c.seed > 0.5 ? '#FF94E0' : '#67E8F9';
        ctx.fillRect(
          drawX + Math.cos(angle) * 24,
          drawY + Math.sin(angle) * 16,
          cellSize * 0.8,
          cellSize * 0.8
        );
      }

      ctx.globalAlpha = Math.min(1, ease * 1.15);

      // Vertical glossy pink gradient look across the 7 rows
      const rowRatio = c.gy / 6;
      const isSheenBand =
        settledT > 0.8 && Math.abs((c.gx / Math.max(1, layout.widthUnits)) - sheenPhase) < 0.08;

      if (isSheenBand || impactGlow > 0.45) {
        ctx.fillStyle = '#FFB8EC';
      } else if (rowRatio < 0.28) {
        ctx.fillStyle = '#FF9AE1';
      } else if (rowRatio < 0.65) {
        ctx.fillStyle = '#FF74D0';
      } else {
        ctx.fillStyle = '#FF55C2';
      }

      ctx.fillRect(drawX, drawY, cellSize + 0.6, cellSize + 0.6);

      // Crisp bright white-pink outer perimeter edges (only after mostly assembled)
      if (ease > 0.72) {
        const edgeW = Math.max(1.5, cellSize * 0.14);
        ctx.fillStyle = impactGlow > 0.35 ? '#FFFFFF' : '#FFE8F9';
        if (c.topEdge) ctx.fillRect(drawX, drawY, cellSize + 0.6, edgeW);
        if (c.bottomEdge) ctx.fillRect(drawX, drawY + cellSize - edgeW + 0.5, cellSize + 0.6, edgeW);
        if (c.leftEdge) ctx.fillRect(drawX, drawY, edgeW, cellSize + 0.6);
        if (c.rightEdge) ctx.fillRect(drawX + cellSize - edgeW + 0.5, drawY, edgeW, cellSize + 0.6);
      }
    }
    ctx.globalAlpha = 1;
  };

  drawExtrudedWord(topWord, topOriginX, topOriginY, -1);
  drawExtrudedWord(bottomWord, bottomOriginX, bottomOriginY, 1);

  // 3. Soft arcade specular light flares along key letter corners (matching reference image)
  if (assembleProgress > 0.82) {
    const flareAlpha = Math.min(1, (assembleProgress - 0.82) / 0.18) * (0.55 + impactGlow * 0.45);
    const flarePoints = [
      { x: topOriginX + topWordW * 0.12, y: topOriginY + wordH * 0.18 },
      { x: topOriginX + topWordW * 0.54, y: topOriginY + wordH * 0.94 },
      { x: topOriginX + topWordW * 0.88, y: topOriginY + wordH * 0.46 },
      { x: bottomOriginX + bottomWordW * 0.25, y: bottomOriginY + wordH * 0.08 },
      { x: bottomOriginX + bottomWordW * 0.62, y: bottomOriginY + wordH * 0.9 },
    ];
    for (const fp of flarePoints) {
      const r = Math.max(18, cellSize * 2.2);
      const rg = ctx.createRadialGradient(fp.x, fp.y, 1, fp.x, fp.y, r);
      rg.addColorStop(0, `rgba(255, 255, 255, ${flareAlpha})`);
      rg.addColorStop(0.35, `rgba(255, 130, 215, ${flareAlpha * 0.55})`);
      rg.addColorStop(1, 'rgba(255, 62, 157, 0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(fp.x, fp.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
