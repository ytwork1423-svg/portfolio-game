import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Sparkles, FastForward } from 'lucide-react';
import {
  getCloudSprite,
  getCollectibleSprite,
  getFoxSprite,
  getLampSprite,
  getMeeraSprite,
  getParachuteSprite,
  getTreeSprite,
} from '../game/sprites';
import { buildArcadeWord, renderArcadeTitleScene } from '../game/titleTypography';
import { DESIGNER_PROFILE } from '../data/portfolioData';
import { soundEngine } from '../audio/soundEngine';

interface TitleScreenProps {
  xp: number;
  hasSavedProgress: boolean;
  muted: boolean;
  skipIntro?: boolean;
  onIntroComplete?: () => void;
  onToggleMute: () => void;
  onHeroBonusXp: (amount: number, label: string) => void;
  onStartHub: () => void;
  onDirectProjects: () => void;
}

interface HeroStarTarget {
  id: string;
  rx: number;
  ry: number;
  kind: 'star' | 'glitch_gem';
  collected: boolean;
}

interface HeroParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string;
  trail?: boolean;
}

interface GroundRipple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

const HERO_PORTFOLIO_LETTERS = 'PORTFOLIO'.split('');
const TERMINAL_GREETING = 'HELLO, PLAYER!';

// Timeline milestones (ms) — fast, punchy, screen-recordable
const T_IMPACT = 760;        // GAMIFIED PORTFOLIO locks in place
const T_WARP_START = 2050;   // Title shatters & camera enters warp tunnel
const T_WORLD_REVEAL = 2620; // Homepage world materializes as warp clears
const T_TOUCHDOWN = 4080;    // Meera lands on terrace
const T_UI_ACTIVATE = 4240;  // Existing homepage text box & HUD reveal

export const TitleScreen: React.FC<TitleScreenProps> = ({
  xp,
  hasSavedProgress,
  muted,
  skipIntro = false,
  onIntroComplete,
  onToggleMute,
  onHeroBonusXp,
  onStartHub,
  onDirectProjects,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const initialSettled = skipIntro || prefersReducedMotion;

  const [introStage, setIntroStage] = useState<'SEQUENCE' | 'REVEALING' | 'ACTIVE'>(
    initialSettled ? 'ACTIVE' : 'SEQUENCE'
  );
  const [launching, setLaunching] = useState(false);
  const [startHovered, setStartHovered] = useState(false);
  const [typedCount, setTypedCount] = useState(initialSettled ? TERMINAL_GREETING.length : 0);

  const introElapsedOffsetRef = useRef<number>(initialSettled ? 6000 : 0);
  const introStartNowRef = useRef<number | null>(null);
  const launchStartRef = useRef<number | null>(null);
  const startHoveredRef = useRef<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 700, y: 400 });
  const shakeRef = useRef<number>(0);
  const lampAltGlowRef = useRef<boolean>(false);

  const bonusCallbackRef = useRef(onHeroBonusXp);
  const finishLaunchCallbackRef = useRef(onStartHub);
  const introCompleteCallbackRef = useRef(onIntroComplete);

  useEffect(() => {
    bonusCallbackRef.current = onHeroBonusXp;
    finishLaunchCallbackRef.current = onStartHub;
    introCompleteCallbackRef.current = onIntroComplete;
  }, [onHeroBonusXp, onStartHub, onIntroComplete]);

  useEffect(() => {
    startHoveredRef.current = startHovered;
  }, [startHovered]);

  // Fast retro terminal typing begins as the homepage text box activates
  useEffect(() => {
    if (introStage === 'SEQUENCE') return;
    if (typedCount >= TERMINAL_GREETING.length) return;
    const t = window.setTimeout(() => {
      setTypedCount((c) => c + 1);
    }, 36);
    return () => clearTimeout(t);
  }, [introStage, typedCount]);

  const handleSkipIntro = () => {
    introElapsedOffsetRef.current = 6000;
    introStartNowRef.current = performance.now();
    shakeRef.current = 0;
    setIntroStage('ACTIVE');
    setTypedCount(TERMINAL_GREETING.length);
    introCompleteCallbackRef.current?.();
  };

  const triggerLaunchSequence = () => {
    if (launching || introStage === 'SEQUENCE') return;
    soundEngine.playStartGame();
    setLaunching(true);
    launchStartRef.current = performance.now();
    shakeRef.current = 8;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const topWordLayout = buildArcadeWord('GAMIFIED');
    const bottomWordLayout = buildArcadeWord('PORTFOLIO');

    const spaceStars = Array.from({ length: 170 }, (_, i) => ({
      angle: ((i * 137.5) % 360) * (Math.PI / 180),
      dist: 0.08 + ((i * 53) % 92) / 100,
      x: (i * 197) % 1440,
      y: (i * 113) % 720,
      size: i % 6 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
      phase: i * 0.7,
      color: i % 7 === 0 ? '#FFD93D' : i % 4 === 0 ? '#FF75B5' : i % 3 === 0 ? '#93C5FD' : '#E2E8F0',
    }));

    const ambientWisps = Array.from({ length: 20 }, (_, i) => ({
      rx: ((i * 137) % 100) / 100,
      ry: 0.2 + ((i * 89) % 58) / 100,
      phase: i * 0.85,
      color: i % 2 === 0 ? '#22FF88' : '#38BDF8',
    }));

    const clouds = [
      { x: 110, y: 88, speed: 0.22, scale: 4 },
      { x: 580, y: 52, speed: 0.16, scale: 3 },
      { x: 1080, y: 110, speed: 0.26, scale: 4 },
    ];

    const heroCollectibles: HeroStarTarget[] = [
      { id: 'hs-1', rx: 0.14, ry: 0.21, kind: 'star', collected: false },
      { id: 'hs-2', rx: 0.87, ry: 0.21, kind: 'star', collected: false },
      { id: 'hs-3', rx: 0.84, ry: 0.56, kind: 'glitch_gem', collected: false },
      { id: 'hs-4', rx: 0.23, ry: 0.44, kind: 'star', collected: false },
    ];

    const particles: HeroParticle[] = [];
    const ripples: GroundRipple[] = [];

    let launchFinished = false;
    let impactTriggered = initialSettled;
    let warpTriggered = initialSettled;
    let touchdownTriggered = initialSettled;
    let uiActivateTriggered = initialSettled;
    let uiCompleteTriggered = initialSettled;
    let foxExcitedUntil = 0;
    let lampPulseUntil = 0;
    let animId = 0;
    let tick = 0;

    const spawnBurst = (
      x: number,
      y: number,
      count: number,
      color: string,
      text?: string,
      speedMult = 1
    ) => {
      if (text) {
        particles.push({
          x,
          y: y - 14,
          vx: 0,
          vy: -1.1,
          life: 48,
          maxLife: 48,
          color,
          size: 12,
          text,
        });
      }
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / Math.max(1, count) + Math.random() * 0.25;
        const spd = (1.2 + Math.random() * 2.4) * speedMult;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 26 + Math.random() * 16,
          maxLife: 42,
          color,
          size: 4 + (i % 2) * 2,
        });
      }
    };

    const spawnTitleShatter = (w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const maxUnits = Math.max(topWordLayout.widthUnits, bottomWordLayout.widthUnits);
      const cellSize = Math.max(4, Math.min((w * 0.88) / maxUnits, 1180 / maxUnits));
      const wordH = 7 * cellSize;
      const gap = Math.max(26, cellSize * 3.8);

      const emitWord = (layout: typeof topWordLayout, oy: number) => {
        const ox = cx - (layout.widthUnits * cellSize) / 2;
        for (let i = 0; i < layout.cells.length; i += 2) {
          const c = layout.cells[i];
          const px = ox + c.gx * cellSize;
          const py = oy + c.gy * cellSize;
          const dx = px - cx;
          const dy = py - cy;
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
          const spd = 4.5 + Math.random() * 9.5;
          particles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 40 + Math.random() * 22,
            maxLife: 62,
            color: i % 5 === 0 ? '#FFFFFF' : i % 3 === 0 ? '#67E8F9' : '#FF5CC4',
            size: Math.max(4, Math.min(10, cellSize * 0.65)),
            trail: true,
          });
        }
      };

      emitWord(topWordLayout, cy - gap / 2 - wordH);
      emitWord(bottomWordLayout, cy + gap / 2);

      ripples.push({ x: cx, y: cy, radius: 18, alpha: 0.95, color: '#FF3E9D' });
      ripples.push({ x: cx, y: cy, radius: 8, alpha: 0.85, color: '#67E8F9' });
    };

    const getSceneAnchors = (w: number, h: number) => {
      const groundY = h - 72;
      // Enlarged proportional character scale — clear hero focal point
      const meeraScale = Math.min(8.5, Math.max(5.0, Math.floor((w / 155) * 2) / 2));
      const meeraW = 16 * meeraScale;
      const meeraH = 18 * meeraScale;
      const lampX = Math.max(18, Math.floor(w * 0.032));
      const meeraX =
        w < 768
          ? Math.max(24, Math.floor(w * 0.08))
          : Math.max(lampX + 68, Math.floor(w * 0.085));
      const treeX = Math.min(w - 130, Math.floor(w * 0.87));
      const foxX = Math.min(treeX - 68, Math.floor(w * 0.81));
      const portalX = Math.min(w - 80, Math.floor(w * 0.78));
      return { groundY, lampX, meeraX, meeraScale, meeraW, meeraH, treeX, foxX, portalX };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };

      const elapsed =
        introElapsedOffsetRef.current +
        (introStartNowRef.current !== null ? performance.now() - introStartNowRef.current : 0);

      if (launchStartRef.current !== null || elapsed < T_UI_ACTIVATE) {
        canvas.style.cursor = 'default';
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const { groundY, lampX, foxX } = getSceneAnchors(w, h);
      let hoverInteractive = false;

      for (const hc of heroCollectibles) {
        if (hc.collected) continue;
        if (Math.hypot(mx - hc.rx * w, my - hc.ry * h) < 28) {
          hoverInteractive = true;
          break;
        }
      }
      if (Math.hypot(mx - (foxX + 20), my - (groundY - 18)) < 36) hoverInteractive = true;
      if (Math.hypot(mx - (lampX + 36), my - (groundY - 46)) < 40) hoverInteractive = true;

      canvas.style.cursor = hoverInteractive ? 'pointer' : 'default';
    };

    const onCanvasClick = (e: MouseEvent) => {
      const elapsed =
        introElapsedOffsetRef.current +
        (introStartNowRef.current !== null ? performance.now() - introStartNowRef.current : 0);

      if (launchStartRef.current !== null || elapsed < T_UI_ACTIVATE) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const w = canvas.width;
      const h = canvas.height;
      const { groundY, lampX, foxX } = getSceneAnchors(w, h);

      for (const hc of heroCollectibles) {
        if (hc.collected) continue;
        const cx = hc.rx * w;
        const cy = hc.ry * h;
        if (Math.hypot(mx - cx, my - cy) < 30) {
          hc.collected = true;
          soundEngine.playStar();
          shakeRef.current = 4;
          spawnBurst(cx, cy, 14, '#FFD93D', '+15 XP');
          bonusCallbackRef.current(
            15,
            hc.kind === 'glitch_gem' ? 'Hero Prism Collected!' : 'Star Collected!'
          );
          return;
        }
      }

      if (Math.hypot(mx - (foxX + 20), my - (groundY - 18)) < 38) {
        soundEngine.playStar();
        spawnBurst(foxX + 20, groundY - 28, 10, '#FF3E9D', '♥ +10 XP');
        bonusCallbackRef.current(10, 'Pixel Fox Companion!');
        return;
      }

      if (Math.hypot(mx - (lampX + 36), my - (groundY - 46)) < 42) {
        lampAltGlowRef.current = !lampAltGlowRef.current;
        soundEngine.playCoin();
        spawnBurst(lampX + 46, groundY - 46, 10, lampAltGlowRef.current ? '#FF3E9D' : '#67E8F9');
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onCanvasClick);

    const drawSpaceGrid = (w: number, h: number, gridPower: number, warpT: number) => {
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      // Bend/converge grid slightly during warp tunnel
      const bend = warpT * 0.45;
      const cols = 12;
      const rows = 8;

      // Vertical perspective-hinted grid lines matching reference aesthetic
      for (let i = -cols / 2; i <= cols / 2; i++) {
        const normX = i / (cols / 2);
        const distFade = Math.max(0, 1 - Math.abs(normX) * 0.25);
        const reveal = Math.max(0, Math.min(1, gridPower * 1.4 - Math.abs(normX) * 0.45));
        if (reveal <= 0) continue;

        const baseX = cx + normX * (w * 0.52);
        const topX = cx + (baseX - cx) * (1 - bend * 0.35 + warpT * 0.55);
        ctx.strokeStyle =
          Math.abs(i) <= 2
            ? `rgba(236, 72, 153, ${0.28 * reveal * distFade})`
            : `rgba(217, 119, 6, ${0.28 * reveal * distFade})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(baseX, 0);
        ctx.quadraticCurveTo(cx + (baseX - cx) * (1 - bend), cy, topX, h);
        ctx.stroke();
      }

      // Horizontal grid lines powering outward from center horizon
      for (let j = -rows / 2; j <= rows / 2; j++) {
        const normY = j / (rows / 2);
        const reveal = Math.max(0, Math.min(1, gridPower * 1.4 - Math.abs(normY) * 0.45));
        if (reveal <= 0) continue;

        const baseY = cy + normY * (h * 0.52) * (1 + warpT * 0.75);
        ctx.strokeStyle =
          Math.abs(j) <= 1
            ? `rgba(244, 114, 182, ${0.34 * reveal})`
            : `rgba(217, 119, 6, ${0.24 * reveal})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(w, baseY);
        ctx.stroke();
      }

      // Luminous center horizon laser flare (matching reference image)
      if (gridPower > 0.1) {
        const beamAlpha = Math.min(1, gridPower * 1.2) * (1 - warpT * 0.7);
        const beamWidth = w * Math.min(1, gridPower * 1.15);
        const bgGrad = ctx.createLinearGradient(cx - beamWidth / 2, cy, cx + beamWidth / 2, cy);
        bgGrad.addColorStop(0, 'rgba(255, 62, 157, 0)');
        bgGrad.addColorStop(0.5, `rgba(255, 160, 220, ${0.85 * beamAlpha})`);
        bgGrad.addColorStop(1, 'rgba(255, 62, 157, 0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(cx - beamWidth / 2, cy - 2, beamWidth, 4);

        const flare = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.34);
        flare.addColorStop(0, `rgba(255, 110, 199, ${0.35 * beamAlpha})`);
        flare.addColorStop(0.5, `rgba(168, 85, 247, ${0.14 * beamAlpha})`);
        flare.addColorStop(1, 'rgba(10, 6, 25, 0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, cy - h * 0.35, w, h * 0.7);
      }

      ctx.restore();
    };

    const render = (now: number) => {
      tick++;
      if (introStartNowRef.current === null) {
        introStartNowRef.current = now;
      }

      const elapsed = introElapsedOffsetRef.current + (now - introStartNowRef.current);
      const w = canvas.width;
      const h = canvas.height;
      ctx.imageSmoothingEnabled = false;

      // Trigger one-shot milestone events cleanly
      if (!impactTriggered && elapsed >= T_IMPACT) {
        impactTriggered = true;
        shakeRef.current = 7;
        soundEngine.playPowerOn();
        ripples.push({ x: w / 2, y: h / 2, radius: 24, alpha: 0.75, color: '#FF3E9D' });
      }
      if (!warpTriggered && elapsed >= T_WARP_START) {
        warpTriggered = true;
        shakeRef.current = 6;
        soundEngine.playWarp();
        spawnTitleShatter(w, h);
      }
      if (!touchdownTriggered && elapsed >= T_TOUCHDOWN) {
        touchdownTriggered = true;
        shakeRef.current = 5.5;
        foxExcitedUntil = now + 1100;
        lampPulseUntil = now + 900;
        soundEngine.playLand();
        const { groundY, meeraX, meeraW } = getSceneAnchors(w, h);
        const footX = meeraX + meeraW / 2;
        ripples.push({ x: footX, y: groundY + 2, radius: 10, alpha: 0.95, color: '#22FF88' });
        ripples.push({ x: footX, y: groundY + 2, radius: 6, alpha: 0.8, color: '#FF3E9D' });
        // Left & right dust puff pixels on landing impact
        for (let i = 0; i < 16; i++) {
          const dir = i % 2 === 0 ? -1 : 1;
          particles.push({
            x: footX + dir * (6 + Math.random() * 14),
            y: groundY - 4,
            vx: dir * (1.5 + Math.random() * 2.8),
            vy: -0.8 - Math.random() * 2.1,
            life: 24 + Math.random() * 14,
            maxLife: 38,
            color: i % 3 === 0 ? '#22FF88' : i % 2 === 0 ? '#E2E8F0' : '#FF75B5',
            size: 5,
          });
        }
      }
      if (!uiActivateTriggered && elapsed >= T_UI_ACTIVATE) {
        uiActivateTriggered = true;
        setIntroStage('REVEALING');
      }
      if (!uiCompleteTriggered && elapsed >= T_UI_ACTIVATE + 420) {
        uiCompleteTriggered = true;
        setIntroStage('ACTIVE');
        introCompleteCallbackRef.current?.();
      }

      const launchElapsed =
        launchStartRef.current !== null ? now - launchStartRef.current : null;

      if (launchElapsed !== null && launchElapsed >= 1750 && !launchFinished) {
        launchFinished = true;
        finishLaunchCallbackRef.current();
      }

      // Compute camera shake
      let shakeX = 0;
      let shakeY = 0;
      if (shakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * shakeRef.current;
        shakeY = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.85;
        if (shakeRef.current < 0.3) shakeRef.current = 0;
      }

      // Determine phase progresses
      const titleZoom =
        elapsed < T_WARP_START
          ? 0.96 + Math.min(1, elapsed / T_WARP_START) * 0.1
          : 1.06 + Math.min(1, (elapsed - T_WARP_START) / (T_WORLD_REVEAL - T_WARP_START)) * 0.82;

      const worldVisibility =
        elapsed < T_WORLD_REVEAL - 260
          ? 0
          : Math.min(1, (elapsed - (T_WORLD_REVEAL - 260)) / 420);

      // Gentle camera follow during parachute descent
      let descentCamY = 0;
      if (elapsed >= T_WORLD_REVEAL - 100 && elapsed < T_TOUCHDOWN + 260) {
        const followT = Math.min(1, Math.max(0, (elapsed - T_WORLD_REVEAL) / (T_TOUCHDOWN - T_WORLD_REVEAL)));
        const easeOut = 1 - Math.pow(1 - followT, 2.2);
        descentCamY = (1 - easeOut) * 64;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY + descentCamY);

      // Camera Zoom & Focus during Portal Transition (Start Exploring click)
      if (launchElapsed !== null) {
        const portalT = Math.min(1, launchElapsed / 1350);
        const zoom = 1 + portalT * 0.28;
        const focusX = w * 0.72;
        const focusY = h * 0.68;
        ctx.translate(focusX, focusY);
        ctx.scale(zoom, zoom);
        ctx.translate(-focusX, -focusY);
      }

      // Rich Layered Midnight Space / Sky
      const skyGrad = ctx.createLinearGradient(0, -100, 0, h + 40);
      skyGrad.addColorStop(0, '#04040B');
      skyGrad.addColorStop(0.55, worldVisibility > 0.5 ? '#0B0B1E' : '#09071A');
      skyGrad.addColorStop(1, worldVisibility > 0.5 ? '#1C1340' : '#160B30');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-80, -140, w + 160, h + 280);

      // Subtle Cursor Parallax
      const parallaxX = ((mouseRef.current.x - w / 2) / Math.max(1, w)) * 20;
      const parallaxY = ((mouseRef.current.y - h / 2) / Math.max(1, h)) * 8;

      // Cosmic Starfield (illuminates in first 220ms, streams radially during warp!)
      const starReveal = Math.min(1, elapsed / 240);
      const warpT =
        elapsed >= T_WARP_START && elapsed < T_WORLD_REVEAL + 180
          ? Math.min(1, (elapsed - T_WARP_START) / (T_WORLD_REVEAL - T_WARP_START))
          : 0;

      for (const s of spaceStars) {
        if (warpT > 0 && worldVisibility < 0.85) {
          // Starfield tunnel streaks pulling viewer forward
          const stretch = 1 + warpT * 2.6;
          const dist = s.dist * Math.max(w, h) * 0.65 * stretch;
          const x1 = w / 2 + Math.cos(s.angle) * (dist * 0.78);
          const y1 = h / 2 + Math.sin(s.angle) * (dist * 0.78);
          const x2 = w / 2 + Math.cos(s.angle) * dist;
          const y2 = h / 2 + Math.sin(s.angle) * dist;
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = 0.75 * (1 - worldVisibility * 0.65);
          ctx.lineWidth = s.size * 0.75;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        } else {
          const sx = (s.x / 1440) * w - parallaxX * 0.15;
          const sy = (s.y / 810) * h - parallaxY * 0.2;
          ctx.globalAlpha =
            starReveal * (0.32 + 0.68 * Math.abs(Math.sin(tick * 0.03 + s.phase)));
          ctx.fillStyle = s.color;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), s.size, s.size);
        }
      }
      ctx.globalAlpha = 1;

      // PART 1 & 2: SPACE GRID + 3D EXTRUDED "GAMIFIED PORTFOLIO" TITLE
      if (elapsed < T_WORLD_REVEAL + 120) {
        const gridPower = Math.min(1, Math.max(0, (elapsed - 60) / 420));
        const activeWarp =
          elapsed >= T_WARP_START
            ? Math.min(1, (elapsed - T_WARP_START) / (T_WORLD_REVEAL - T_WARP_START))
            : 0;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(titleZoom, titleZoom);
        ctx.translate(-w / 2, -h / 2);

        drawSpaceGrid(w, h, gridPower, activeWarp);

        if (elapsed < T_WARP_START + 90) {
          const assembleP = Math.min(1, Math.max(0, (elapsed - 130) / (T_IMPACT - 130)));
          const impactGlow =
            elapsed >= T_IMPACT && elapsed < T_IMPACT + 340
              ? 1 - (elapsed - T_IMPACT) / 340
              : 0;
          const sheenPhase = ((elapsed - T_IMPACT) % 1600) / 1600;

          if (elapsed > T_WARP_START) {
            ctx.globalAlpha = Math.max(0, 1 - (elapsed - T_WARP_START) / 90);
          }

          renderArcadeTitleScene(
            ctx,
            w,
            h,
            topWordLayout,
            bottomWordLayout,
            assembleP,
            impactGlow,
            sheenPhase
          );
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      // PART 3 & 4: EXISTING HOMEPAGE ENVIRONMENT + PARACHUTE LANDING + INTERACTIVE HERO WORLD
      if (worldVisibility > 0) {
        ctx.save();
        ctx.globalAlpha = worldVisibility;

        // Distant Silhouette Citadel & Mountains (0.3x parallax)
        ctx.fillStyle = '#120E29';
        for (let mx = -80; mx < w + 160; mx += 170) {
          const peakH = 120 + ((Math.abs(mx) * 31) % 90);
          const px = mx - parallaxX * 0.32;
          ctx.fillRect(px, h - 72 - peakH, 136, peakH);
          ctx.fillRect(px + 28, h - 72 - peakH - 26, 80, 26);
          ctx.fillStyle = 'rgba(255, 62, 157, 0.28)';
          ctx.fillRect(px + 48, h - 72 - peakH + 22, 6, 6);
          ctx.fillStyle = '#120E29';
        }

        // Retro Horizon Grid
        ctx.strokeStyle = 'rgba(91, 69, 184, 0.25)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= w; gx += 52) {
          ctx.beginPath();
          ctx.moveTo(w / 2 + (gx - w / 2) * 0.36 - parallaxX * 0.4, h - 195);
          ctx.lineTo(gx, h - 72);
          ctx.stroke();
        }

        // Ambient Drifting Light Particles
        for (const wp of ambientWisps) {
          const wx = wp.rx * w + Math.sin(tick * 0.02 + wp.phase) * 24 - parallaxX * 0.5;
          const wy = wp.ry * h + Math.cos(tick * 0.024 + wp.phase) * 14;
          ctx.globalAlpha =
            worldVisibility * (0.25 + 0.45 * Math.abs(Math.sin(tick * 0.04 + wp.phase)));
          ctx.fillStyle = wp.color;
          ctx.fillRect(Math.floor(wx), Math.floor(wy), 3, 3);
        }
        ctx.globalAlpha = worldVisibility;

        // Drifting Pixel Clouds
        const cloudSprite = getCloudSprite();
        for (const c of clouds) {
          c.x = (c.x + c.speed) % (w + 220);
          const drawX = Math.floor(c.x - 110 - parallaxX * 0.45);
          ctx.drawImage(
            cloudSprite,
            drawX,
            c.y - parallaxY * 0.3,
            cloudSprite.width * c.scale,
            cloudSprite.height * c.scale
          );
        }

        // Foreground Emerald Brick Ground Terrace
        const {
          groundY,
          lampX,
          meeraX,
          meeraScale,
          meeraW,
          meeraH,
          treeX,
          foxX,
          portalX,
        } = getSceneAnchors(w, h);

        ctx.fillStyle = '#22FF88';
        ctx.fillRect(-60, groundY, w + 120, 6);
        ctx.fillStyle = '#0F766E';
        ctx.fillRect(-60, groundY + 6, w + 120, 10);
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(-60, groundY + 16, w + 120, 90);

        ctx.fillStyle = '#3B82F6';
        for (let bx = 0; bx < w + 32; bx += 32) {
          ctx.fillRect(bx + 2, groundY + 20, 26, 12);
          ctx.fillRect((bx + 16) % (w + 32), groundY + 38, 26, 12);
        }

        // Interactive Street Lamp (reacts brightly on touchdown!)
        const lamp = getLampSprite();
        ctx.drawImage(lamp, lampX, groundY - lamp.height * 5, lamp.width * 5, lamp.height * 5);
        const lampFlaring = now < lampPulseUntil;
        ctx.fillStyle = lampAltGlowRef.current
          ? `rgba(255, 62, 157, ${lampFlaring ? 0.42 : 0.25})`
          : `rgba(103, 232, 249, ${lampFlaring ? 0.38 : 0.18})`;
        ctx.beginPath();
        ctx.arc(lampX + 48, groundY - 46, lampFlaring ? 56 : 42, 0, Math.PI * 2);
        ctx.fill();

        // Pixel Tree (gentle sway boost right after landing)
        const tree = getTreeSprite();
        const treeSway = now < lampPulseUntil ? Math.sin(tick * 0.35) * 2.5 : 0;
        ctx.drawImage(
          tree,
          treeX + treeSway,
          groundY - tree.height * 6,
          tree.width * 6,
          tree.height * 6
        );

        // Interactive Collectible Stars & Gems
        for (const hc of heroCollectibles) {
          if (hc.collected) continue;
          const cx = hc.rx * w;
          const cy = hc.ry * h + Math.sin(tick * 0.06 + hc.rx * 10) * 5;
          const spr = getCollectibleSprite(hc.kind, tick);
          ctx.fillStyle = now < lampPulseUntil ? 'rgba(255, 217, 61, 0.28)' : 'rgba(255, 217, 61, 0.14)';
          ctx.beginPath();
          ctx.arc(cx, cy, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(spr, cx - 14, cy - 14, spr.width * 2.4, spr.height * 2.4);
        }

        // Ambient Portal Beacon on Right Terrace (expands dramatically on Start Exploring!)
        const portalY = groundY - 56;
        const basePortalScale =
          launchElapsed !== null ? 0.55 + Math.min(0.65, launchElapsed / 450) : 0.42;
        const pulse = Math.sin(tick * 0.12) * 4;
        ctx.save();
        ctx.translate(portalX, portalY);
        ctx.scale(basePortalScale, basePortalScale);
        ctx.fillStyle =
          launchElapsed !== null ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.14)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 48 + pulse, 68 + pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 34, 54, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#22FF88';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 36, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#FF3E9D';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // CHARACTER PARACHUTE DESCENT & ENLARGED HERO RENDERING
        const isDescending = elapsed >= T_WORLD_REVEAL - 100 && elapsed < T_TOUCHDOWN;
        const parachuteFoldT =
          elapsed >= T_TOUCHDOWN && elapsed < T_TOUCHDOWN + 380
            ? (elapsed - T_TOUCHDOWN) / 380
            : -1;

        let drawMeeraX = meeraX;
        let drawMeeraY = groundY;
        let squashX = 1;
        let squashY = 1;
        let swayAngle = 0;
        let meeraFrame: 'idle1' | 'idle2' | 'jump' | 'wave' =
          Math.floor(tick / 26) % 2 === 0 ? 'idle1' : 'idle2';
        let meeraFacing: 1 | -1 = mouseRef.current.x < meeraX + meeraW / 2 ? -1 : 1;

        if (isDescending) {
          const descentDur = T_TOUCHDOWN - (T_WORLD_REVEAL - 100);
          const p = Math.min(1, Math.max(0, (elapsed - (T_WORLD_REVEAL - 100)) / descentDur));
          // Smooth gentle deceleration near ground
          const easedY = 1 - Math.pow(1 - p, 1.45);
          const startY = -40;
          drawMeeraY = startY + (groundY - startY) * easedY;

          // Subtle natural pendulum swing damping as she nears landing
          const damp = 1 - p * 0.72;
          swayAngle = Math.sin(p * Math.PI * 3.6) * 0.12 * damp;
          drawMeeraX = meeraX + Math.sin(p * Math.PI * 3.6) * 34 * damp;
          meeraFrame = 'jump';
          meeraFacing = 1;

          // Subtle wind trails & air sparkles around Meera during descent
          if (tick % 3 === 0) {
            particles.push({
              x: drawMeeraX + meeraW * (0.15 + Math.random() * 0.7),
              y: drawMeeraY - meeraH - 36,
              vx: (Math.random() - 0.5) * 0.6,
              vy: -2.4 - Math.random() * 1.4,
              life: 16,
              maxLife: 16,
              color: tick % 6 === 0 ? '#67E8F9' : '#FFFFFF',
              size: 3,
              trail: true,
            });
          }

          // Parachute Unfold Animation & Suspension Cords
          const unfoldT = Math.min(1, (elapsed - (T_WORLD_REVEAL - 100)) / 270);
          const chuteScaleX =
            unfoldT < 0.75
              ? 0.22 + (unfoldT / 0.75) * 0.86
              : 1.08 - ((unfoldT - 0.75) / 0.25) * 0.08;

          const chuteSpr = getParachuteSprite();
          const cw = chuteSpr.width * meeraScale * 0.92;
          const ch = chuteSpr.height * meeraScale * 0.92;
          const anchorX = drawMeeraX + meeraW / 2;
          const anchorY = drawMeeraY - meeraH * 0.85;

          ctx.save();
          ctx.translate(anchorX, anchorY);
          ctx.rotate(swayAngle);

          // Draw taut crisp pixel suspension cords from canopy rim to Meera's hands
          const canopyBottomY = -meeraH * 0.75;
          const leftWingX = (-cw * 0.44) * chuteScaleX;
          const rightWingX = (cw * 0.44) * chuteScaleX;
          const innerLeftX = (-cw * 0.18) * chuteScaleX;
          const innerRightX = (cw * 0.18) * chuteScaleX;

          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-meeraW * 0.34, meeraH * 0.22);
          ctx.lineTo(leftWingX, canopyBottomY);
          ctx.moveTo(-meeraW * 0.24, meeraH * 0.22);
          ctx.lineTo(innerLeftX, canopyBottomY);
          ctx.moveTo(meeraW * 0.34, meeraH * 0.22);
          ctx.lineTo(rightWingX, canopyBottomY);
          ctx.moveTo(meeraW * 0.24, meeraH * 0.22);
          ctx.lineTo(innerRightX, canopyBottomY);
          ctx.stroke();

          // Canopy sprite tilted slightly by airflow
          ctx.save();
          ctx.translate(0, canopyBottomY - ch);
          ctx.scale(chuteScaleX, 1 + Math.sin(tick * 0.18) * 0.03);
          ctx.drawImage(chuteSpr, -cw / 2, 0, cw, ch);
          ctx.restore();
          ctx.restore();
        } else {
          // Post-landing squash/bounce & parachute fold-away
          if (elapsed >= T_TOUCHDOWN && elapsed < T_TOUCHDOWN + 220) {
            const b = (elapsed - T_TOUCHDOWN) / 220;
            if (b < 0.45) {
              const t1 = b / 0.45;
              squashX = 1 + 0.14 * t1;
              squashY = 1 - 0.15 * t1;
            } else {
              const t2 = (b - 0.45) / 0.55;
              squashX = 1.14 - 0.14 * t2;
              squashY = 0.85 + 0.15 * t2;
            }
          }

          // Parachute gracefully folds inward and floats up out of frame
          if (parachuteFoldT >= 0 && parachuteFoldT < 1) {
            const chuteSpr = getParachuteSprite();
            const cw = chuteSpr.width * meeraScale * 0.92;
            const ch = chuteSpr.height * meeraScale * 0.92;
            const foldScaleX = Math.max(0.12, 1 - parachuteFoldT * 0.88);
            const riseY = groundY - meeraH * 1.55 - parachuteFoldT * 90;
            ctx.save();
            ctx.globalAlpha = worldVisibility * (1 - parachuteFoldT);
            ctx.translate(meeraX + meeraW / 2, riseY - ch);
            ctx.scale(foldScaleX, 1 - parachuteFoldT * 0.2);
            ctx.drawImage(chuteSpr, -cw / 2, 0, cw, ch);
            ctx.restore();
          }

          // Settled idle, celebratory post-land wave, or hover wave
          if (
            startHoveredRef.current ||
            (elapsed >= T_TOUCHDOWN + 140 && elapsed < T_TOUCHDOWN + 1150) ||
            Math.floor(tick / 90) % 4 === 1
          ) {
            meeraFrame = 'wave';
            meeraFacing = 1;
          }
        }

        // Portal leap on clicking "START EXPLORING"
        if (launchElapsed !== null) {
          const jumpT = Math.min(1, Math.max(0, (launchElapsed - 180) / 880));
          drawMeeraX = meeraX + (portalX - meeraX) * jumpT;
          const arc = Math.sin(jumpT * Math.PI) * 160;
          drawMeeraY = groundY - arc - jumpT * 20;
          meeraFrame = 'jump';
          meeraFacing = 1;
          if (jumpT > 0.85) {
            ctx.globalAlpha = worldVisibility * Math.max(0, 1 - (jumpT - 0.85) * 6);
          }
        }

        // Soft ground shadow directly beneath Meera (scales tighter as she descends!)
        const heightAboveGround = Math.max(0, groundY - drawMeeraY);
        const shadowScale = Math.max(0.35, 1 - heightAboveGround / 380);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.42 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(
          drawMeeraX + meeraW / 2,
          groundY + 3,
          (meeraW * 0.42) * shadowScale,
          7 * shadowScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Draw exact Meera sprite proportionally scaled (no stretching/distortion)
        const meeraSpr = getMeeraSprite(meeraFrame);
        ctx.save();
        ctx.translate(drawMeeraX + meeraW / 2, drawMeeraY);
        if (isDescending) {
          ctx.rotate(swayAngle * 0.65);
        }
        ctx.scale(meeraFacing * squashX, squashY);
        ctx.drawImage(meeraSpr, -meeraW / 2, -meeraH, meeraW, meeraH);
        ctx.restore();
        ctx.globalAlpha = worldVisibility;

        // Pixel Fox Companion (hops joyfully when Meera lands!)
        let drawFoxX = foxX;
        let drawFoxY = groundY;
        if (now < foxExcitedUntil) {
          drawFoxY -= Math.abs(Math.sin(now * 0.015)) * 18;
        }
        if (launchElapsed !== null) {
          const foxJumpT = Math.min(1, Math.max(0, (launchElapsed - 340) / 820));
          drawFoxX = foxX + (portalX - foxX) * foxJumpT;
          drawFoxY = groundY - Math.sin(foxJumpT * Math.PI) * 95;
        }
        const foxSpr = getFoxSprite(
          Math.floor(tick / 30) % 3 === 0 || now < foxExcitedUntil || launchElapsed !== null
        );
        ctx.drawImage(
          foxSpr,
          drawFoxX,
          drawFoxY - foxSpr.height * 4.4,
          foxSpr.width * 4.4,
          foxSpr.height * 4.4
        );

        ctx.restore();
      }

      // Ground Energy Ripples & Energy Shockwaves
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += 7.5;
        rp.alpha *= 0.91;
        if (rp.alpha < 0.04) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = rp.color;
        ctx.globalAlpha = rp.alpha;
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Flat elliptical shockwave along ground if near bottom, circular in space
        const isGround = rp.y > h * 0.7;
        ctx.ellipse(rp.x, rp.y, rp.radius, isGround ? rp.radius * 0.24 : rp.radius, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Burst, Shatter, Dust & Wind Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        const prevX = pt.x;
        const prevY = pt.y;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, pt.life / Math.max(10, pt.maxLife * 0.45));
        ctx.fillStyle = pt.color;
        if (pt.text) {
          ctx.font = 'bold 11px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(pt.text, pt.x, pt.y);
          ctx.textAlign = 'left';
        } else {
          if (pt.trail) {
            ctx.strokeStyle = pt.color;
            ctx.lineWidth = Math.max(2, pt.size * 0.55);
            ctx.beginPath();
            ctx.moveTo(prevX - pt.vx * 1.5, prevY - pt.vy * 1.5);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
          }
          ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        }
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // Pixel Mosaic Warp Wipe during final 750ms of launch (after clicking Start Exploring)
      if (launchElapsed !== null && launchElapsed > 950) {
        const mosaicT = Math.min(1, (launchElapsed - 950) / 760);
        const block = 48;
        const cols = Math.ceil(w / block);
        const rows = Math.ceil(h / block);
        ctx.fillStyle = '#06060E';
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dist = Math.hypot(c - cols * 0.72, r - rows * 0.65) / Math.hypot(cols, rows);
            if (mosaicT > dist * 0.95) {
              ctx.fillRect(c * block, r * block, block + 1, block + 1);
            }
          }
        }
        if (mosaicT > 0.55) {
          ctx.fillStyle = '#22FF88';
          ctx.font = '12px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('ENTERING PORTFOLIO WORLD...', w / 2, h / 2);
          ctx.textAlign = 'left';
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onCanvasClick);
    };
  }, [initialSettled]);

  const xpPercent = Math.min(100, Math.max(14, Math.round((xp / 900) * 100)));
  const uiVisible = introStage !== 'SEQUENCE';

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pixelated" />

      {/* Subtle scanline texture across the background */}
      <div className="pointer-events-none fixed inset-0 crt-scanlines opacity-20 z-0" />

      {/* Unobtrusive Skip button shown ONLY during the 4.2s cinematic intro */}
      {!uiVisible && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={handleSkipIntro}
            className="pixel-btn flex items-center gap-2 bg-[#121126]/85 hover:bg-[#191536] border-2 border-[#5B45B8] px-3.5 py-2 text-[10px] font-pixel text-[#CBD5E1] hover:text-white cursor-pointer"
          >
            <span>SKIP INTRO</span>
            <FastForward className="w-3.5 h-3.5 text-[#FF3E9D]" />
          </button>
        </div>
      )}

      {/* Top Hero HUD Bar */}
      <header
        className={`relative z-10 flex items-center justify-between gap-4 px-4 sm:px-8 pt-4 sm:pt-5 transition-all duration-500 ${
          launching || !uiVisible
            ? 'opacity-0 -translate-y-3 pointer-events-none'
            : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-pixel text-[10px] sm:text-xs text-[#22FF88] whitespace-nowrap">
            {DESIGNER_PROFILE.name.toUpperCase()}
          </span>
          <span className="hidden md:inline text-xs text-[#CBD5E1] font-medium">
            · {DESIGNER_PROFILE.role}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="font-pixel text-[9px] text-[#FFD93D]">PLAYER 01</span>
            <div className="w-28 h-3 bg-[#121126] border-2 border-white/75 p-0.5">
              <div
                className="h-full bg-[#22FF88] transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="font-mono-tab text-xs font-bold text-[#22FF88]">{xp} XP</span>
          </div>

          <button
            onClick={onToggleMute}
            className="pixel-btn flex items-center gap-1.5 bg-[#121126]/90 hover:bg-[#191536] border-2 border-[#5B45B8] px-3 py-1.5 text-xs text-white cursor-pointer"
            aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
          >
            {muted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#22FF88]" />
            )}
            <span className="font-pixel text-[8px]">{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
          </button>
        </div>
      </header>

      {/* Main Hero Text Box & Buttons — Preserved intact, positioned cleanly clear of enlarged Meera */}
      <main
        className={`relative z-10 flex-1 flex items-center justify-center px-4 pb-28 md:pb-16 md:pl-44 lg:pl-52 xl:pl-44 transition-opacity duration-300 ${
          launching || !uiVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <motion.div
          initial={false}
          animate={
            uiVisible && !launching
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.94, y: 18 }
          }
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[760px] bg-[#06060E]/82 backdrop-blur-[2px] border-3 border-[#22FF88] px-6 py-7 sm:px-12 sm:py-10 text-center shadow-[0_0_60px_rgba(34,255,136,0.16),8px_8px_0_0_rgba(0,0,0,0.85)]"
        >
          {/* Glowing Arcade Corner Brackets */}
          <span className="absolute -top-2 -left-2 w-4 h-4 bg-[#FF3E9D] border-2 border-white" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#38BDF8] border-2 border-white" />
          <span className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#FFD93D] border-2 border-white" />
          <span className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#22FF88] border-2 border-white" />

          {/* Small Animated Retro Terminal Greeting + Designer Role */}
          <motion.div
            initial={false}
            animate={uiVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-4"
          >
            <span className="font-pixel text-[10px] sm:text-xs text-[#FFD93D] tracking-wider">
              {TERMINAL_GREETING.slice(0, typedCount)}
              <span className="pixel-cursor-blink">█</span>
            </span>
            <span className="text-[#5B45B8] hidden sm:inline">|</span>
            <span className="text-xs sm:text-sm font-semibold text-[#E2E8F0]">
              {DESIGNER_PROFILE.name} — {DESIGNER_PROFILE.role}
            </span>
          </motion.div>

          {/* Gamified Portfolio Headline Lockup */}
          <motion.p
            initial={false}
            animate={uiVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, delay: 0.12 }}
            className="font-pixel text-[#22FF88] text-xs sm:text-base tracking-widest mb-3"
          >
            WELCOME TO MY GAMIFIED
          </motion.p>

          {/* Dominant Hero Word: PORTFOLIO */}
          <h1
            aria-label="PORTFOLIO"
            className="portfolio-hero-title font-pixel text-[#FF3E9D] text-[clamp(1.45rem,4.5vw,3.85rem)] leading-none tracking-tight mb-5 flex justify-center flex-nowrap whitespace-nowrap"
          >
            {HERO_PORTFOLIO_LETTERS.map((letter, idx) => (
              <motion.span
                key={idx}
                initial={false}
                animate={uiVisible ? { y: 0, scale: 1, opacity: 1 } : { y: -12, scale: 0.9, opacity: 0 }}
                transition={{
                  duration: 0.26,
                  delay: 0.12 + idx * 0.025,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </h1>

          {/* Supporting Line */}
          <motion.p
            initial={false}
            animate={uiVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, delay: 0.2 }}
            className="font-pixel text-[10px] sm:text-xs text-[#38BDF8] tracking-wider mb-3"
          >
            A DESIGNER&apos;S WORLD. A PLAYABLE EXPERIENCE.
          </motion.p>

          <motion.p
            initial={false}
            animate={uiVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, delay: 0.25 }}
            className="text-sm sm:text-base text-[#CBD5E1] max-w-xl mx-auto leading-relaxed mb-7"
          >
            Explore an interactive pixel-art town featuring UI/UX case studies, design labs,
            education milestones, and creative experiments.
          </motion.p>

          {/* Preserved Primary CTA Buttons with Staggered Entrance */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              initial={false}
              animate={uiVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.94 }}
              transition={{ duration: 0.26, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={triggerLaunchSequence}
              onMouseEnter={() => setStartHovered(true)}
              onMouseLeave={() => setStartHovered(false)}
              className="pixel-btn group font-pixel text-xs sm:text-sm bg-[#22FF88] hover:bg-[#4ADE80] text-[#06060E] px-8 py-4 border-3 border-white shadow-[0_0_32px_rgba(34,255,136,0.55),5px_5px_0_0_#000] hover:shadow-[0_0_44px_rgba(34,255,136,0.85),6px_6px_0_0_#000] cursor-pointer whitespace-nowrap flex items-center gap-3"
            >
              <span className="animate-bounce inline-block">▶</span>
              <span>{hasSavedProgress ? 'CONTINUE EXPLORING' : 'START EXPLORING'}</span>
            </motion.button>

            <motion.button
              initial={false}
              animate={uiVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.94 }}
              transition={{ duration: 0.26, delay: 0.39, ease: [0.16, 1, 0.3, 1] }}
              onClick={onDirectProjects}
              className="pixel-btn font-pixel text-[10px] sm:text-xs bg-[#191536] hover:bg-[#2B245A] text-[#FFD93D] px-6 py-4 border-2 border-[#FFD93D] shadow-[4px_4px_0_0_#000] cursor-pointer whitespace-nowrap"
            >
              CASE STUDIES
            </motion.button>
          </div>

          <motion.div
            initial={false}
            animate={uiVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.28, delay: 0.45 }}
            className="mt-5 flex items-center justify-center gap-2 text-xs text-[#94A3B8]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD93D]" />
            <span>Interactive scene: click the stars, street lamp, or pixel fox for bonus XP.</span>
          </motion.div>
        </motion.div>
      </main>

      {/* Bottom World Destination Preview Ribbon */}
      <footer
        className={`relative z-10 w-full bg-[#4F46E5] border-t-2 border-[#818CF8] py-2 overflow-hidden transition-all duration-500 ${
          launching || !uiVisible ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center justify-center gap-6 px-4 text-[10px] font-pixel text-white whitespace-nowrap overflow-x-auto">
          <span>PLAYER PROFILE</span>
          <span className="text-[#FFD93D]">★</span>
          <span>SKILL LAB</span>
          <span className="text-[#FFD93D]">★</span>
          <span>MISSION CONTROL</span>
          <span className="text-[#FFD93D]">★</span>
          <span>TRAINING ACADEMY</span>
          <span className="text-[#FFD93D]">★</span>
          <span>TROPHY GALLERY</span>
          <span className="text-[#FFD93D]">★</span>
          <span>CONNECTION PORTAL</span>
        </div>
      </footer>
    </div>
  );
};
