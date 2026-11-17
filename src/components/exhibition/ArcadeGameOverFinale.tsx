import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  Edit3,
  FastForward,
  RotateCcw,
  Save,
} from 'lucide-react';
import { DESIGNER_PROFILE } from '../../data/portfolioData';
import { PixelAvatar } from '../PixelAvatar';
import { soundEngine } from '../../audio/soundEngine';

type ArcadeScenePhase = 'idle' | 'reveal' | 'travel' | 'dive' | 'assemble' | 'gameover';

interface ArcadeGameOverFinaleProps {
  prefersReducedMotion: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onReplayTop: () => void;
  onReturnToHub?: () => void;
  onFinaleStateChange?: (state: { progress: number; engaged: boolean }) => void;
}

// Crisp 6x7 dimensional arcade pixel bitmap font for full-screen GAME / OVER
const PIXEL_BITMAPS: Record<string, string[]> = {
  G: ['011110', '110011', '110000', '110111', '110011', '110011', '011110'],
  A: ['011110', '110011', '110011', '111111', '110011', '110011', '110011'],
  M: ['110011', '111111', '111111', '110011', '110011', '110011', '110011'],
  E: ['111111', '110000', '110000', '111110', '110000', '110000', '111111'],
  O: ['011110', '110011', '110011', '110011', '110011', '110011', '011110'],
  V: ['110011', '110011', '110011', '110011', '110011', '011110', '001100'],
  R: ['111110', '110011', '110011', '111110', '110110', '110011', '110011'],
};

interface SubPixelParticle {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  size: number;
  delay: number;
  rowNorm: number;
  rgbStart: [number, number, number];
  rgbEnd: [number, number, number];
}

interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  color: string;
}

function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function buildGameOverAssets(
  width: number,
  height: number,
  dpr: number,
): {
  particles: SubPixelParticle[];
  cachedCanvas: HTMLCanvasElement;
  cellSize: number;
} {
  const words = ['GAME', 'OVER'];
  // 4 letters * 6 cols + 3 * 2 col gap = 30 cols; 2 rows * 7 + 3 row gap = 17 rows
  const totalCols = 30;
  const totalRows = 17;

  const usableW = Math.min(width * 0.84, 1080);
  const usableH = Math.min(height * 0.56, 560);
  const cellSize = Math.max(5, Math.floor(Math.min(usableW / totalCols, usableH / totalRows)));
  const subGrid = 2;
  const subSize = Math.max(2, Math.floor(cellSize / subGrid));

  const gridPixelW = totalCols * cellSize;
  const gridPixelH = totalRows * cellSize;
  const originX = Math.round((width - gridPixelW) / 2);
  // Slightly above dead-center so THANKS FOR PLAYING sits comfortably beneath
  const originY = Math.round((height - gridPixelH) / 2 - height * 0.035);

  // Offscreen cached dimensional GAME OVER canvas for silky 1-draw-call rendering
  const cachedCanvas = document.createElement('canvas');
  cachedCanvas.width = Math.max(1, Math.round(width * dpr));
  cachedCanvas.height = Math.max(1, Math.round(height * dpr));
  const off = cachedCanvas.getContext('2d');

  const particles: SubPixelParticle[] = [];
  const macroCells: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    rowNorm: number;
    tint: string;
  }> = [];

  let idx = 0;

  words.forEach((word, wIdx) => {
    const baseRow = wIdx === 0 ? 0 : 10;
    word.split('').forEach((ch, lIdx) => {
      const glyph = PIXEL_BITMAPS[ch] || PIXEL_BITMAPS.O;
      const baseCol = lIdx * 8;
      glyph.forEach((rowStr, rIdx) => {
        for (let cIdx = 0; cIdx < rowStr.length; cIdx++) {
          if (rowStr[cIdx] !== '1') continue;
          const macroX = originX + (baseCol + cIdx) * cellSize;
          const macroY = originY + (baseRow + rIdx) * cellSize;
          const rowNorm = (baseRow + rIdx) / totalRows;

          macroCells.push({
            x: macroX,
            y: macroY,
            w: cellSize,
            h: cellSize,
            rowNorm,
            tint: rowNorm < 0.46 ? '#F5FAFF' : '#DDF0FF',
          });

          for (let sy = 0; sy < subGrid; sy++) {
            for (let sx = 0; sx < subGrid; sx++) {
              idx++;
              const r1 = seededRand(idx * 3.1);
              const r2 = seededRand(idx * 7.7);
              const r3 = seededRand(idx * 11.3);
              const angle = r1 * Math.PI * 2;
              const dist = (0.24 + r2 * 0.68) * Math.max(width, height) * 0.6;
              const tx = macroX + sx * subSize;
              const ty = macroY + sy * subSize;
              const startX = width / 2 + Math.cos(angle) * dist;
              const startY = height / 2 + Math.sin(angle) * dist * 0.85;

              let rgbStart: [number, number, number] = [255, 244, 214];
              if (r3 < 0.22) rgbStart = [34, 228, 255];
              else if (r3 < 0.48) rgbStart = [255, 62, 157];
              else if (r3 < 0.65) rgbStart = [168, 85, 247];

              const rgbEnd: [number, number, number] =
                rowNorm < 0.46 ? [245, 250, 255] : [221, 240, 255];

              particles.push({
                tx,
                ty,
                sx: startX,
                sy: startY,
                size: Math.max(2, subSize - 0.5),
                delay: r1 * 0.14 + ((baseRow + rIdx) / totalRows) * 0.08,
                rowNorm,
                rgbStart,
                rgbEnd,
              });
            }
          }
        }
      });
    });
  });

  if (off) {
    off.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ext1 = Math.max(2, Math.round(cellSize * 0.2));
    const ext2 = Math.max(4, Math.round(cellSize * 0.42));

    // Layer 1: Deep purple-indigo rear pixel bevel
    off.fillStyle = '#220646';
    for (let i = 0; i < macroCells.length; i++) {
      const c = macroCells[i];
      off.fillRect(c.x + ext2, c.y + ext2, c.w, c.h);
    }

    // Layer 2: Hot magenta mid bevel
    off.fillStyle = '#E11D8F';
    for (let i = 0; i < macroCells.length; i++) {
      const c = macroCells[i];
      off.fillRect(c.x + ext1, c.y + ext1, c.w, c.h);
    }

    // Layer 3: Left electric-cyan chromatic CRT fringe
    off.fillStyle = 'rgba(34, 228, 255, 0.52)';
    for (let i = 0; i < macroCells.length; i++) {
      const c = macroCells[i];
      off.fillRect(c.x - Math.max(1, Math.round(ext1 * 0.55)), c.y, c.w, c.h);
    }

    // Layer 4: Luminous cream-ice CRT phosphor face
    for (let i = 0; i < macroCells.length; i++) {
      const c = macroCells[i];
      off.fillStyle = c.tint;
      off.fillRect(c.x, c.y, c.w, c.h);
    }
  }

  return { particles, cachedCanvas, cellSize };
}

const GLITCH_SLICE_BARS = [
  { top: '12%', height: '6%', bg: 'rgba(255, 62, 157, 0.45)', shift: -26 },
  { top: '29%', height: '9%', bg: 'rgba(34, 228, 255, 0.38)', shift: 34 },
  { top: '52%', height: '7%', bg: 'rgba(255, 225, 77, 0.35)', shift: -30 },
  { top: '74%', height: '11%', bg: 'rgba(168, 85, 247, 0.42)', shift: 24 },
];

export const ArcadeGameOverFinale: React.FC<ArcadeGameOverFinaleProps> = ({
  prefersReducedMotion,
  scrollContainerRef,
  onReplayTop,
  onReturnToHub,
  onFinaleStateChange,
}) => {
  const [phase, setPhase] = useState<ArcadeScenePhase>(
    prefersReducedMotion ? 'gameover' : 'idle',
  );
  const [powerStep, setPowerStep] = useState<number>(prefersReducedMotion ? 5 : 0);
  const [showMeeraCameo, setShowMeeraCameo] = useState(false);
  const [showThanksLine, setShowThanksLine] = useState(prefersReducedMotion);
  const [glitchStep, setGlitchStep] = useState(0);
  const [lockWaveActive, setLockWaveActive] = useState(false);
  const [flashBurst, setFlashBurst] = useState(false);

  // Discreet editable contact invitation
  const [contactInvite, setContactInvite] = useState({
    note: 'Open for UI/UX Design Internships & Collaborations',
    email: DESIGNER_PROFILE.contact.email,
  });
  const [editingInvite, setEditingInvite] = useState(false);
  const [inviteDraft, setInviteDraft] = useState(contactInvite);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<ArcadeScenePhase>(phase);
  const phaseStartedAtRef = useRef<number>(performance.now());
  const lockStartedAtRef = useRef<number>(0);
  const hasTriggeredRef = useRef<boolean>(prefersReducedMotion);
  const engagedRef = useRef<boolean>(false);
  const timersRef = useRef<number[]>([]);

  phaseRef.current = phase;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const enterPhase = useCallback((next: ArcadeScenePhase) => {
    phaseRef.current = next;
    phaseStartedAtRef.current = performance.now();
    if (next === 'gameover') {
      lockStartedAtRef.current = performance.now();
    }
    setPhase(next);
  }, []);

  const skipToGameOver = useCallback(() => {
    clearTimers();
    setShowMeeraCameo(false);
    setPowerStep(5);
    setLockWaveActive(false);
    setFlashBurst(false);
    enterPhase('gameover');
    setShowThanksLine(true);
  }, [clearTimers, enterPhase]);

  const runCinematicSequence = useCallback(
    (allowAudio: boolean) => {
      clearTimers();
      if (prefersReducedMotion) {
        setShowMeeraCameo(false);
        setPowerStep(5);
        enterPhase('gameover');
        setShowThanksLine(true);
        return;
      }

      // Phase 1: Full-Screen Dark Arcade Room Reveal + Staggered Power-On
      enterPhase('reveal');
      setPowerStep(1);
      setShowMeeraCameo(false);
      setShowThanksLine(false);
      setLockWaveActive(false);
      setFlashBurst(false);
      if (allowAudio) soundEngine.playArcadeRoomEnter();

      const tPower2 = window.setTimeout(() => {
        setPowerStep(2);
        if (allowAudio) soundEngine.playArcadePowerStep(0);
      }, 120);

      const tPower3 = window.setTimeout(() => {
        setPowerStep(3);
        if (allowAudio) soundEngine.playArcadePowerStep(1);
      }, 240);

      const tPower4 = window.setTimeout(() => {
        setPowerStep(4);
        if (allowAudio) soundEngine.playArcadePowerStep(2);
      }, 360);

      const tPower5 = window.setTimeout(() => {
        setPowerStep(5);
        setShowMeeraCameo(true);
        if (allowAudio) soundEngine.playArcadePowerStep(3);
      }, 480);

      const tCameoExit = window.setTimeout(() => {
        setShowMeeraCameo(false);
      }, 980);

      // Phase 2: Brisk Multi-layer Parallax Camera Travel down Arcade Corridor
      const tTravel = window.setTimeout(() => {
        enterPhase('travel');
      }, 750);

      // Phase 3: Glitch & Rapid Camera Dive THROUGH the Central CRT
      const tDive = window.setTimeout(() => {
        enterPhase('dive');
        if (allowAudio) soundEngine.playArcadeGlitch();
      }, 1650);

      const tG1 = window.setTimeout(() => setGlitchStep((s) => s + 1), 1740);
      const tG2 = window.setTimeout(() => setGlitchStep((s) => s + 1), 1830);

      // Phase 4: Silky Pixel Swarm Assembles into Full-Screen GAME OVER
      const tAssemble = window.setTimeout(() => {
        enterPhase('assemble');
      }, 1960);

      // Phase 5: Smooth Lock-In Glow, Gentle Wave & Stabilize
      const tGameOver = window.setTimeout(() => {
        enterPhase('gameover');
        setFlashBurst(true);
        setLockWaveActive(true);
        if (allowAudio) {
          soundEngine.playPixelAssembleLock();
        }
      }, 2880);

      const tClearFlash = window.setTimeout(() => setFlashBurst(false), 3360);
      const tClearWave = window.setTimeout(() => setLockWaveActive(false), 3420);

      // Discreet secondary line fades in gracefully beneath stabilized GAME OVER
      const tThanks = window.setTimeout(() => {
        setShowThanksLine(true);
      }, 3320);

      timersRef.current.push(
        tPower2,
        tPower3,
        tPower4,
        tPower5,
        tCameoExit,
        tTravel,
        tDive,
        tG1,
        tG2,
        tAssemble,
        tGameOver,
        tClearFlash,
        tClearWave,
        tThanks,
      );
    },
    [clearTimers, enterPhase, prefersReducedMotion],
  );

  // =========================================================================
  // SCROLL-TRIGGERED TRANSFORMATION & FULL-VIEWPORT ENGAGEMENT
  // =========================================================================
  useEffect(() => {
    const container = scrollContainerRef?.current;
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number | null = null;
    let lastTop = container ? container.scrollTop : window.scrollY;

    const evaluateScroll = () => {
      rafId = null;
      const rect = section.getBoundingClientRect();
      const viewportH = container ? container.clientHeight : window.innerHeight;
      const currentTop = container ? container.scrollTop : window.scrollY;
      const scrollingDown = currentTop >= lastTop;
      lastTop = currentTop;

      // Progress from section top entering bottom of viewport -> reaching top of viewport
      const rawProgress = (viewportH - rect.top) / Math.max(1, viewportH);
      const progress = Math.max(0, Math.min(1, rawProgress));
      const engaged = progress >= 0.58;

      if (engaged !== engagedRef.current || progress > 0) {
        engagedRef.current = engaged;
        onFinaleStateChange?.({ progress, engaged });
      }

      // Natural scroll trigger (once, never accidentally restarts on slight scroll jitter)
      if (!hasTriggeredRef.current && progress >= 0.58) {
        hasTriggeredRef.current = true;
        if (scrollingDown && rect.top > 12 && container && !prefersReducedMotion) {
          // Gently dock the 100dvh sticky stage onto full viewport without locking upward scroll
          container.scrollTo({
            top: section.offsetTop + 16,
            behavior: 'smooth',
          });
        }
        runCinematicSequence(!soundEngine.isMuted());
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(evaluateScroll);
    };

    evaluateScroll();
    const target: EventTarget = container || window;
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [onFinaleStateChange, prefersReducedMotion, runCinematicSequence, scrollContainerRef]);

  // =========================================================================
  // FULL-SCREEN CANVAS ENGINE: ATMOSPHERIC PARTICLES + PIXEL ASSEMBLY + CRT WAVE
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    let assets = buildGameOverAssets(width, height, dpr);

    const motes: AmbientMote[] = Array.from({ length: 56 }, (_, i) => ({
      x: seededRand(i * 1.9) * width,
      y: seededRand(i * 2.7) * height,
      vx: (seededRand(i * 4.3) - 0.5) * 0.25,
      vy: -0.12 - seededRand(i * 5.9) * 0.22,
      r: 1 + seededRand(i * 6.1) * 1.6,
      alpha: 0.14 + seededRand(i * 7.3) * 0.3,
      color: i % 3 === 0 ? '#FF3E9D' : i % 3 === 1 ? '#38BDF8' : '#E9D5FF',
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      assets = buildGameOverAssets(width, height, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;

    const renderFrame = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const currentPhase = phaseRef.current;
      const elapsedPhase = (now - phaseStartedAtRef.current) / 1000;

      // 1. Atmospheric Floating Phosphor & Dust Motes (stretch smoothly during dive)
      const isDiving = currentPhase === 'dive';
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        if (!prefersReducedMotion) {
          m.x += m.vx * (isDiving ? 4 : 1);
          m.y += m.vy * (isDiving ? 4 : 1);
          if (m.y < -10) m.y = height + 10;
          if (m.x < -10) m.x = width + 10;
          if (m.x > width + 10) m.x = -10;
        }
        ctx.globalAlpha = currentPhase === 'gameover' ? m.alpha * 0.45 : m.alpha;
        ctx.fillStyle = m.color;
        if (isDiving && !prefersReducedMotion) {
          const dx = (m.x - width / 2) * 0.07;
          const dy = (m.y - height / 2) * 0.07;
          ctx.fillRect(m.x, m.y, Math.max(2, Math.abs(dx) * 0.55), Math.max(2, Math.abs(dy) * 0.35));
        } else {
          ctx.fillRect(m.x, m.y, m.r * 1.4, m.r * 1.4);
        }
      }
      ctx.globalAlpha = 1;

      // 2. Silky Full-Screen Pixel Assembly
      if (currentPhase === 'assemble') {
        const { particles, cachedCanvas } = assets;
        const assembleDuration = 0.92;
        const globalFadeIn = smoothstep(0.0, 0.14, elapsedPhase);

        // Smoothly crossfade the dimensional 3D cached artwork underneath converging pixels
        const targetBackdropAlpha = smoothstep(0.38, 0.92, elapsedPhase);
        if (targetBackdropAlpha > 0.005) {
          ctx.globalAlpha = targetBackdropAlpha;
          ctx.drawImage(cachedCanvas, 0, 0, width, height);
        }

        // Smooth converging particle swarm (quartic settle + continuous RGB interpolation)
        const particleAlpha = (1 - smoothstep(0.76, 0.92, elapsedPhase)) * globalFadeIn;
        if (particleAlpha > 0.01) {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const localT = Math.max(
              0,
              Math.min(1, (elapsedPhase - p.delay) / (assembleDuration - p.delay)),
            );
            const ease = 1 - Math.pow(1 - localT, 3.8);
            const px = p.sx + (p.tx - p.sx) * ease;
            const py = p.sy + (p.ty - p.sy) * ease;

            const colorMix = smoothstep(0.45, 0.98, localT);
            const r = Math.round(p.rgbStart[0] + (p.rgbEnd[0] - p.rgbStart[0]) * colorMix);
            const g = Math.round(p.rgbStart[1] + (p.rgbEnd[1] - p.rgbStart[1]) * colorMix);
            const b = Math.round(p.rgbStart[2] + (p.rgbEnd[2] - p.rgbStart[2]) * colorMix);

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.globalAlpha = particleAlpha * (0.45 + 0.55 * ease);
            ctx.fillRect(px, py, p.size, p.size);
          }
        }
        ctx.globalAlpha = 1;
      }

      // 3. Stabilized 1-Draw-Call Dimensional GAME OVER + Smooth Bell-Curved Wave
      if (currentPhase === 'gameover') {
        const { cachedCanvas } = assets;
        const lockAge = (now - lockStartedAtRef.current) / 1000;
        const breathAlpha = prefersReducedMotion
          ? 1
          : 0.95 + Math.sin(now * 0.0024) * 0.05;

        if (!prefersReducedMotion && lockAge < 0.52) {
          // Smooth bell-curved horizontal CRT wave that starts & ends at zero (no snap!)
          const norm = lockAge / 0.52;
          const bellAmp = Math.sin(norm * Math.PI) * (1 - norm * 0.4) * 7;
          const sliceH = 6;
          const srcScale = cachedCanvas.height / Math.max(1, height);
          ctx.globalAlpha = breathAlpha;
          for (let y = 0; y < height; y += sliceH) {
            const h = Math.min(sliceH, height - y);
            const offset = Math.sin((y / height) * 16 + now * 0.025) * bellAmp;
            ctx.drawImage(
              cachedCanvas,
              0,
              y * srcScale,
              cachedCanvas.width,
              h * srcScale,
              offset,
              y,
              width,
              h,
            );
          }
        } else {
          ctx.globalAlpha = breathAlpha;
          ctx.drawImage(cachedCanvas, 0, 0, width, height);
        }
        ctx.globalAlpha = 1;
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    if (prefersReducedMotion) {
      const handleReducedResize = () => {
        resize();
        renderFrame(performance.now());
      };
      window.removeEventListener('resize', resize);
      window.addEventListener('resize', handleReducedResize);
      renderFrame(performance.now());
      return () => {
        window.removeEventListener('resize', handleReducedResize);
      };
    }

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const copyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contactInvite.email).catch(() => {});
    }
    soundEngine.playCoin();
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 2200);
  };

  const isTravelling = phase === 'travel';
  const isDiving = phase === 'dive';
  const isScreenTakeover = phase === 'assemble' || phase === 'gameover';

  return (
    <section
      ref={sectionRef}
      aria-label="Full-Screen Arcade Ending"
      className="relative z-50 h-[145dvh] min-h-screen w-full"
    >
      {/* =====================================================================
          STICKY 100vw x 100dvh FULL-VIEWPORT CINEMATIC STAGE
      ===================================================================== */}
      <div className="sticky top-0 left-0 w-full h-[100dvh] overflow-hidden bg-[#04010C] select-none flex flex-col justify-between">
        {/* ===================================================================
            LAYER 1 — DEEP VOLUMETRIC ARCADE ATMOSPHERE & MOVING REFLECTIONS
        =================================================================== */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* Deep Purple -> Midnight Magenta Backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: isScreenTakeover
                ? 'radial-gradient(ellipse 85% 65% at 50% 48%, #20064A 0%, #09021A 55%, #030109 100%)'
                : 'radial-gradient(ellipse 75% 58% at 50% 42%, #2B0866 0%, #0E0329 52%, #04010D 100%)',
            }}
          />

          {/* Volumetric Overhead Neon Ceiling Cones (Light up progressively at powerStep >= 1) */}
          {!isScreenTakeover && (
            <motion.div
              animate={{
                opacity: powerStep >= 1 ? (isTravelling ? 0.92 : 0.72) : 0.08,
                scale: isDiving ? 1.5 : isTravelling ? 1.18 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              style={{
                background:
                  'conic-gradient(from 180deg at 50% -10%, transparent 132deg, rgba(236, 72, 153, 0.24) 168deg, rgba(139, 92, 246, 0.34) 180deg, rgba(56, 189, 248, 0.18) 192deg, transparent 228deg)',
              }}
            />
          )}

          {/* Moving Reflective Floor Light Spill */}
          {!isScreenTakeover && (
            <motion.div
              animate={
                prefersReducedMotion
                  ? { opacity: 0.45 }
                  : {
                      opacity: powerStep >= 2 ? [0.42, 0.65, 0.48] : 0.1,
                      scaleX: isTravelling ? 1.35 : 1,
                    }
              }
              transition={{
                opacity: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
                scaleX: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
              }}
              className="absolute inset-x-0 bottom-0 h-[38%]"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(236, 72, 153, 0.36), rgba(56, 189, 248, 0.16) 45%, transparent 78%)',
              }}
            />
          )}
        </div>

        {/* ===================================================================
            LAYER 2 — 3D PARALLAX ARCADE CORRIDOR (CROSS-FADES SMOOTHLY INTO CRT)
        =================================================================== */}
        {phase !== 'gameover' && (
          <motion.div
            animate={{
              opacity: isDiving || isScreenTakeover ? 0 : 1,
              scale: isDiving || isScreenTakeover ? 3.5 : isTravelling ? 1.42 : 1,
              y: isDiving || isScreenTakeover ? 42 : isTravelling ? 18 : 0,
            }}
            transition={{
              opacity: { duration: prefersReducedMotion ? 0 : 0.42, ease: 'easeOut' },
              scale: {
                duration: prefersReducedMotion ? 0 : isDiving || isScreenTakeover ? 0.45 : 0.95,
                ease: isDiving || isScreenTakeover ? [0.45, 0, 0.85, 0.35] : [0.22, 1, 0.36, 1],
              },
              y: { duration: prefersReducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] },
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ perspective: '1000px' }}
            aria-hidden="true"
          >
            {/* Overhead Sequential Neon Ceiling Strips */}
            <div className="absolute top-12 inset-x-0 flex justify-center gap-16 sm:gap-28">
              <motion.div
                animate={{ opacity: powerStep >= 1 ? 0.9 : 0.05 }}
                transition={{ duration: 0.25 }}
                className="w-28 sm:w-48 h-1.5 rounded-full bg-[#FF3E9D] shadow-[0_0_24px_#FF3E9D]"
              />
              <motion.div
                animate={{ opacity: powerStep >= 2 ? 0.85 : 0.05 }}
                transition={{ duration: 0.25 }}
                className="w-28 sm:w-48 h-1.5 rounded-full bg-[#22E4FF] shadow-[0_0_24px_#22E4FF]"
              />
            </div>

            {/* Far Background Depth Cabinets + Neon Hall Sign */}
            <motion.div
              animate={{
                opacity: isTravelling ? 0.18 : powerStep >= 2 ? 0.62 : 0.15,
                filter: isTravelling ? 'blur(5px)' : 'blur(1.5px)',
                scale: isTravelling ? 1.15 : 0.92,
              }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-[26%] flex items-end justify-between px-6 sm:px-20 max-w-[1380px] mx-auto"
            >
              <div className="w-24 sm:w-32 h-60 bg-[#080317] border-t-4 border-[#22E4FF]/60 shadow-[0_-8px_24px_rgba(34,228,255,0.22)] flex flex-col p-2">
                <div className="h-4 bg-[#0EA5E9]/55 mb-2" />
                <div className="h-20 bg-[#031D30] border border-[#22E4FF]/30" />
              </div>

              <div className="hidden md:block mb-40 font-pixel text-xs tracking-[0.35em] text-[#FF3E9D]/55 drop-shadow-[0_0_16px_rgba(255,62,157,0.5)]">
                ARCADE HALL
              </div>

              <div className="w-24 sm:w-32 h-60 bg-[#080317] border-t-4 border-[#FFE14D]/60 shadow-[0_-8px_24px_rgba(255,225,77,0.2)] flex flex-col p-2">
                <div className="h-4 bg-[#EAB308]/55 mb-2" />
                <div className="h-20 bg-[#231904] border border-[#FFE14D]/30" />
              </div>
            </motion.div>

            {/* Midground & Foreground Flanking Arcade Cabinets (Sweep wider & blur as camera passes) */}
            <div className="relative flex items-end justify-center gap-4 sm:gap-10">
              {/* LEFT MIDGROUND CABINET */}
              <motion.div
                animate={{
                  x: isTravelling || isDiving ? -260 : 0,
                  opacity: isTravelling ? 0.15 : powerStep >= 3 ? 0.94 : 0.35,
                  filter: isTravelling ? 'blur(8px)' : 'blur(0px)',
                  rotateY: 16,
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="hidden sm:flex flex-col w-[200px] md:w-[245px] bg-[#0B0619] border-2 border-[#23184A] rounded-t-xl p-3 shadow-[0_28px_70px_rgba(0,0,0,0.95)]"
              >
                <div
                  className={`h-10 rounded-sm border border-black mb-2.5 transition-all duration-200 ${
                    powerStep >= 3
                      ? 'bg-gradient-to-r from-[#22E4FF] via-[#22FF88] to-[#0284C7] shadow-[0_0_24px_rgba(34,255,136,0.5)]'
                      : 'bg-[#121024]'
                  }`}
                />
                <div
                  className={`h-[155px] rounded-[14px] border-4 border-[#150F2E] p-3 flex flex-col justify-between transition-all duration-200 ${
                    powerStep >= 3
                      ? 'bg-gradient-to-b from-[#4ADE80] via-[#10B981] to-[#064E3B] shadow-[inset_0_0_20px_rgba(255,255,255,0.25)]'
                      : 'bg-[#070510]'
                  }`}
                >
                  {powerStep >= 3 && (
                    <>
                      <div className="flex justify-between">
                        <span className="w-8 h-1.5 bg-white/80" />
                        <span className="w-5 h-1.5 bg-[#FFE14D]" />
                      </div>
                      <div className="h-8 w-full bg-[#062E24]/80 border border-[#6EE7B7]/40" />
                    </>
                  )}
                </div>
                <div className="h-7 mt-2.5 bg-[#15102B]" />
                <div className="h-28 bg-[#05030D] flex items-center justify-center gap-8">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]" />
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]" />
                </div>
              </motion.div>

              {/* CENTRAL HERO CABINET — FOCAL POINT CAMERA DIVES THROUGH */}
              <div className="relative flex flex-col w-[300px] sm:w-[370px] md:w-[430px] bg-gradient-to-b from-[#170D2E] to-[#070412] border-2 border-[#36226D] rounded-t-2xl p-3.5 sm:p-4 shadow-[0_0_110px_rgba(236,72,153,0.35)]">
                {/* Backlit Red Lightning-Bolt Marquee */}
                <motion.div
                  animate={{
                    opacity: powerStep >= 5 ? 1 : 0.25,
                    boxShadow:
                      powerStep >= 5
                        ? '0 0 36px rgba(239, 35, 60, 0.72), inset 0 0 18px rgba(255, 220, 100, 0.4)'
                        : 'none',
                  }}
                  transition={{ duration: 0.25 }}
                  className="h-11 sm:h-13 bg-gradient-to-r from-[#B9121E] via-[#EF233C] to-[#B9121E] border-2 border-[#140B29] rounded-sm flex items-center justify-center mb-3"
                >
                  <div className="w-9 h-9 rounded-full bg-[#FFF7DF] border-2 border-[#140B29] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
                      <path
                        d="M9 1L3 9h4l-1 6 7-8H9l0-6z"
                        fill="#FF9F1C"
                        stroke="#140B29"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Central CRT Monitor (Brightens dramatically as camera approaches) */}
                <div className="relative bg-[#05030D] p-2.5 rounded-[22px] border-2 border-[#2A1B54] shadow-[inset_0_10px_30px_rgba(0,0,0,0.96)]">
                  <motion.div
                    animate={{
                      filter: isTravelling ? 'brightness(1.32)' : 'brightness(1)',
                    }}
                    className={`relative h-[185px] sm:h-[225px] rounded-[16px] overflow-hidden flex flex-col justify-between border-2 transition-all duration-200 ${
                      powerStep >= 5
                        ? 'bg-gradient-to-b from-[#FF9BE8] via-[#C026D3] to-[#4C1D95] border-[#FF85C0] shadow-[0_0_45px_rgba(236,72,153,0.55)]'
                        : 'bg-[#07040F] border-[#1F153B]'
                    }`}
                  >
                    {/* Scanlines */}
                    <div
                      className="pointer-events-none absolute inset-0 z-20 opacity-40"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,0.5) 2px 4px)',
                      }}
                    />

                    {/* Colorful Pixel-Game Screen Inside Hero Cabinet */}
                    {powerStep >= 5 && !isDiving && (
                      <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between">
                        <div className="flex justify-between font-pixel text-[8px] text-white">
                          <span>1UP 99990</span>
                          <span className="text-[#FFE14D]">FINAL STAGE</span>
                        </div>

                        <div className="my-auto flex flex-col items-center gap-3">
                          <motion.div
                            animate={prefersReducedMotion ? undefined : { y: [0, -7, 0] }}
                            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                            className="flex items-center gap-2.5"
                          >
                            <span className="w-3.5 h-3.5 bg-[#FFE853] border border-black" />
                            <span className="w-5 h-5 bg-[#22E4FF] border border-black" />
                            <span className="w-3.5 h-3.5 bg-[#FFE853] border border-black" />
                          </motion.div>
                          <span className="font-pixel text-xs sm:text-sm text-white tracking-widest drop-shadow-[0_0_12px_#fff]">
                            STAGE COMPLETE
                          </span>
                        </div>

                        <div className="h-2.5 w-full bg-[repeating-linear-gradient(90deg,#FFE853_0_12px,#22E4FF_12px_24px)]" />
                      </div>
                    )}

                    {/* Glitch & Dive Surge inside CRT right before entering screen */}
                    {isDiving && (
                      <div className="relative z-10 w-full h-full bg-[#1C0436] overflow-hidden">
                        {GLITCH_SLICE_BARS.map((bar, idx) => (
                          <div
                            key={`${glitchStep}-${idx}`}
                            style={{
                              top: bar.top,
                              height: bar.height,
                              backgroundColor: bar.bg,
                              transform: `translateX(${((glitchStep + idx) % 2 === 0 ? 1 : -1) * bar.shift}px)`,
                            }}
                            className="absolute inset-x-0"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Cabinet Control Deck */}
                <div className="mt-3 px-4 py-3 bg-gradient-to-b from-[#1E1440] to-[#0D0721] border-t-2 border-[#432B8C] rounded-b-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EF233C] border border-black shadow-[0_0_8px_#EF233C]" />
                    <span className="w-2.5 h-1.5 rounded-full bg-white/90" />
                    <span className="w-2.5 h-1.5 rounded-full bg-white/90" />
                  </div>
                  <div className="h-4 w-20 bg-[#F1F5F9] border border-black flex items-center justify-center">
                    <span className="font-mono-tab text-[6px] font-bold text-[#150C36] tracking-widest">
                      PORTFOLIO
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-1.5 rounded-full bg-white/90" />
                    <span className="w-2.5 h-1.5 rounded-full bg-white/90" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#38BDF8] border border-black shadow-[0_0_8px_#38BDF8]" />
                  </div>
                </div>
                <div className="h-16 bg-[#05020C] flex items-center justify-center gap-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]" />
                </div>
              </div>

              {/* RIGHT MIDGROUND CABINET */}
              <motion.div
                animate={{
                  x: isTravelling || isDiving ? 260 : 0,
                  opacity: isTravelling ? 0.15 : powerStep >= 4 ? 0.94 : 0.35,
                  filter: isTravelling ? 'blur(8px)' : 'blur(0px)',
                  rotateY: -16,
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="hidden sm:flex flex-col w-[200px] md:w-[245px] bg-[#0B0619] border-2 border-[#23184A] rounded-t-xl p-3 shadow-[0_28px_70px_rgba(0,0,0,0.95)]"
              >
                <div
                  className={`h-10 rounded-sm border border-black mb-2.5 transition-all duration-200 ${
                    powerStep >= 4
                      ? 'bg-gradient-to-r from-[#2563EB] via-[#FACC15] to-[#2563EB] shadow-[0_0_24px_rgba(250,204,21,0.45)]'
                      : 'bg-[#121024]'
                  }`}
                />
                <div
                  className={`h-[155px] rounded-[14px] border-4 border-[#150F2E] p-3 flex items-end justify-between transition-all duration-200 ${
                    powerStep >= 4
                      ? 'bg-gradient-to-b from-[#3B82F6] to-[#0F172A] shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]'
                      : 'bg-[#070510]'
                  }`}
                >
                  {powerStep >= 4 && (
                    <>
                      <div className="w-11 h-16 bg-[#1E293B] border border-[#93C5FD]/45 rounded-t-full" />
                      <div className="w-7 h-10 bg-[#FACC15]/85 rounded-t-sm" />
                    </>
                  )}
                </div>
                <div className="h-7 mt-2.5 bg-[#15102B]" />
                <div className="h-28 bg-[#05030D] flex items-center justify-center gap-8">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]" />
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]" />
                </div>
              </motion.div>
            </div>

            {/* Brief Pre-Travel Character Completion Cameo */}
            {showMeeraCameo && !prefersReducedMotion && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: [0, 1, 1, 0], x: [-26, 0, 0, 26] }}
                transition={{ duration: 0.52, times: [0, 0.2, 0.78, 1] }}
                className="absolute bottom-14 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-end gap-2 px-3.5 py-2 bg-[#0B0420]/90 border border-[#FF3E9D]/60"
              >
                <PixelAvatar subject="meera" size={30} />
                <PixelAvatar subject="fox" size={20} />
                <span className="font-pixel text-[8px] text-[#FFE14D] pb-1">STAGE CLEAR</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===================================================================
            LAYER 3 — FULL-SCREEN CANVAS PIXEL ASSEMBLY & GAME OVER DISPLAY
            (Occupies 100vw x 100dvh directly — NO television frame or box!)
        =================================================================== */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full z-10"
          aria-hidden="true"
        />

        {/* Accessible screen-reader heading matching the full-screen canvas typography */}
        <h2 className="sr-only">GAME OVER — THANKS FOR PLAYING.</h2>

        {/* ===================================================================
            LAYER 4 — FULL-VIEWPORT CRT SCANLINES, LOCK-IN WAVE & CONTROLLED FLASH
        =================================================================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.52) 3px, rgba(0, 0, 0, 0.52) 4px)',
          }}
        />

        {/* Subtle Moving Vertical Refresh Sweep once settled */}
        {phase === 'gameover' && !prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            animate={{ y: ['-20%', '120%'] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute inset-x-0 h-28 z-20 opacity-[0.06]"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(165, 243, 252, 0.8), transparent)',
            }}
          />
        )}

        {/* Subtle CRT Edge Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            boxShadow: 'inset 0 0 110px rgba(0, 0, 0, 0.82)',
          }}
        />

        {/* Brief Glitch Band Overlay during Lock-In Distortion Wave */}
        {lockWaveActive && !prefersReducedMotion && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
            {GLITCH_SLICE_BARS.map((bar, idx) => (
              <div
                key={idx}
                style={{
                  top: bar.top,
                  height: '3px',
                  backgroundColor: bar.bg,
                  transform: `translateX(${bar.shift}px)`,
                }}
                className="absolute inset-x-0 opacity-75"
              />
            ))}
          </div>
        )}

        {/* Single Smooth Phosphor Glow Bloom on Lock-In */}
        {flashBurst && !prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.22, 0] }}
            transition={{ duration: 0.48, times: [0, 0.25, 1], ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_50%_48%,#FFF4FE,rgba(255,62,157,0.32),transparent_75%)]"
          />
        )}

        {/* ===================================================================
            LAYER 5 — TOP-RIGHT ACCESSIBLE SKIP / REPLAY CONTROLS
        =================================================================== */}
        <div className="relative z-40 w-full px-4 sm:px-8 pt-5 flex items-center justify-end">
          {phase !== 'gameover' && phase !== 'idle' ? (
            <button
              type="button"
              onClick={skipToGameOver}
              className="min-h-[40px] px-4 py-2 bg-[#0D0526]/80 hover:bg-[#FF3E9D] text-[#E2D9FF] hover:text-white border border-white/15 font-mono-tab text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Sequence</span>
            </button>
          ) : phase === 'gameover' ? (
            <button
              type="button"
              onClick={() => runCinematicSequence(!soundEngine.isMuted())}
              className="min-h-[40px] px-4 py-2 bg-[#0D0526]/75 hover:bg-[#FF3E9D] text-[#D8CEFF] hover:text-white border border-white/15 font-mono-tab text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Finale</span>
            </button>
          ) : null}
        </div>

        {/* ===================================================================
            LAYER 6 — SUBTLE SECONDARY MESSAGE & DISCREET CONTACT INVITATION
            (Sits neatly beneath the full-screen GAME OVER composition)
        =================================================================== */}
        <div className="relative z-40 w-full mt-auto pb-6 sm:pb-8 px-4 sm:px-8 flex flex-col items-center gap-5">
          {/* Secondary Line: THANKS FOR PLAYING. */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{
              opacity: showThanksLine ? 0.92 : 0,
              y: showThanksLine ? 0 : 8,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-pixel text-[10px] sm:text-xs text-[#A5F3FC] tracking-[0.28em] text-center drop-shadow-[0_0_12px_rgba(34,228,255,0.45)] mb-4 sm:mb-8"
          >
            THANKS FOR PLAYING.
          </motion.p>

          {/* Discreet Optional Final Contact Invitation & Navigation (NOT a footer) */}
          {showThanksLine && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="w-full max-w-[960px]"
            >
              {editingInvite ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    soundEngine.playSuccess();
                    setContactInvite(inviteDraft);
                    setEditingInvite(false);
                  }}
                  className="mx-auto max-w-lg bg-[#0D0524]/95 border border-[#FF3E9D]/50 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={inviteDraft.note}
                    onChange={(e) => setInviteDraft({ ...inviteDraft, note: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#050210] border border-white/20 text-xs text-white"
                    placeholder="Short invitation text"
                  />
                  <input
                    type="email"
                    value={inviteDraft.email}
                    onChange={(e) => setInviteDraft({ ...inviteDraft, email: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#050210] border border-white/20 text-xs text-white"
                    placeholder="Contact email"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="min-h-[36px] px-3.5 py-1.5 bg-[#22FF88] text-[#150C36] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingInvite(false)}
                      className="px-2.5 py-1.5 text-xs text-[#C7BFFF] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#9D91C4]">
                  <span>{contactInvite.note}</span>
                  <span aria-hidden="true" className="text-white/20">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="text-[#EAE4FF] hover:text-[#FFE14D] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-[#22FF88]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedEmail ? 'Email copied' : contactInvite.email}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteDraft(contactInvite);
                      setEditingInvite(true);
                    }}
                    className="text-[#9D91C4] hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                    aria-label="Edit contact invitation"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <span aria-hidden="true" className="text-white/20">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={onReplayTop}
                    className="text-[#9D91C4] hover:text-[#22E4FF] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Back to Top</span>
                  </button>
                  {onReturnToHub && (
                    <button
                      type="button"
                      onClick={onReturnToHub}
                      className="text-[#9D91C4] hover:text-[#22FF88] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Hub</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
