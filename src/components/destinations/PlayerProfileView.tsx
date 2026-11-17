import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Film,
  Gamepad2,
  Image as ImageIcon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { DESIGNER_PROFILE } from '../../data/portfolioData';
import { DestinationId } from '../../types/game';
import { PixelAvatar } from '../PixelAvatar';
import { soundEngine } from '../../audio/soundEngine';

import galleryCorridorImg from '../../assets/images/about_photo_gallery_1794744876060.jpg';
import sanctuaryWideImg from '../../assets/images/about_sanctuary_wide_1794743628024.jpg';
import photoDeskImg from '../../assets/images/about_photo_desk_1794744874865.jpg';
import photoCraftImg from '../../assets/images/about_photo_craft_1794744875612.jpg';

interface PlayerProfileViewProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onNavigateDestination: (id: DestinationId) => void;
  onUnlockSecret: () => void;
}

interface StudioSceneBeat {
  id: string;
  index: string;
  title: string;
  processStage: string;
  lensTag: string;
  caption: string;
  materials: string;
  image: string;
  accentHex: string;
  motionFrom: { scale: number; x: string; y: string };
  motionTo: { scale: number; x: string; y: string };
}

const STUDIO_SCENES: StudioSceneBeat[] = [
  {
    id: 'ideate',
    index: '01 / 03',
    title: 'Sketchbooks, Wireframes & Ink',
    processStage: 'Research & Information Architecture',
    lensTag: '35MM STUDIO PLATE · DESK',
    caption:
      'Every product starts away from glowing screens — mapping user intent in graphite, testing rough spatial hierarchies on paper, and questioning every unnecessary step before opening Figma.',
    materials: 'Open wireframe notebook · Fountain pen · Pantone swatches · Crimson study lamp',
    image: photoDeskImg,
    accentHex: '#E11D48',
    motionFrom: { scale: 1.05, x: '-1.5%', y: '0.8%' },
    motionTo: { scale: 1.13, x: '1.5%', y: '-1.2%' },
  },
  {
    id: 'craft',
    index: '02 / 03',
    title: 'Material, Typography & Tonal Contrast',
    processStage: 'Visual Direction & Restraint',
    lensTag: '50MM EDITORIAL PLATE · TABLE',
    caption:
      'Testing printed type specimens alongside tactile fabrics and honed stone surfaces to calibrate hierarchy, spacing rhythm, and disciplined crimson-violet contrast.',
    materials: 'Printed type grids · Plum & rose linen swatches · Brass caliper · Honed basalt',
    image: photoCraftImg,
    accentHex: '#C084FC',
    motionFrom: { scale: 1.12, x: '1.8%', y: '-0.8%' },
    motionTo: { scale: 1.04, x: '-1.4%', y: '1%' },
  },
  {
    id: 'architecture',
    index: '03 / 03',
    title: 'Spatial Environments & Playable Systems',
    processStage: 'Interaction & Motion Craft',
    lensTag: '24MM ARCHITECTURAL PLATE · SANCTUARY',
    caption:
      'Shaping static layouts into calm, atmospheric digital rooms where state transitions, sound cues, and responsive spatial feedback guide human attention effortlessly.',
    materials: 'Obsidian studio architecture · Crimson cove lighting · Interactive prototypes',
    image: sanctuaryWideImg,
    accentHex: '#FF3E9D',
    motionFrom: { scale: 1.03, x: '0%', y: '1.2%' },
    motionTo: { scale: 1.12, x: '-1.8%', y: '-1%' },
  },
];

const MINDSET_PILLARS = [
  {
    id: 'clarity',
    index: '01',
    title: 'Structure Before Surface',
    lead: 'Hierarchy earns the right to ornament.',
    body: 'Before picking colour accents or transitions, I map the user’s core intent — stripping away visual noise until the primary action feels natural and obvious.',
  },
  {
    id: 'tactile',
    index: '02',
    title: 'Playful Tactility With Restraint',
    lead: '16-bit responsiveness meets modern editorial print.',
    body: 'Games teach us how crisp feedback makes exploration memorable. I bring that tactile warmth into practical interfaces without turning workflows into visual clutter.',
  },
  {
    id: 'empathy',
    index: '03',
    title: 'Respecting Human Attention',
    lead: 'Readable, accessible, and calm across every viewport.',
    body: 'Strong visual storytelling never obscures information behind gimmicks — typography, whitespace, lighting, and motion exist strictly to clarify meaning.',
  },
];

const GUIDE_NOTES: Record<'01' | '02' | '03', string> = {
  '01': 'STAGE 01 · Inside Meera’s quiet architectural atelier — pixel guide standing by.',
  '02': 'STAGE 02 · Scroll through the desk, materials, and space behind each design system.',
  '03': 'STAGE 03 · Creative mindset unlocked — tap the pink handheld below for a secret!',
};

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  scrollContainerRef,
  onNavigateDestination,
  onUnlockSecret,
}) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [activeChapter, setActiveChapter] = useState<'01' | '02' | '03'>('01');
  const [customPortraitUrl, setCustomPortraitUrl] = useState<string | null>(null);

  const [studioMediaTab, setStudioMediaTab] = useState<'walkthrough' | 'video'>('walkthrough');
  const [sceneIdx, setSceneIdx] = useState(0);
  const [manualBeatLock, setManualBeatLock] = useState(false);
  const [isPlayingMotion, setIsPlayingMotion] = useState(!prefersReducedMotion);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);

  const [activePillarId, setActivePillarId] = useState<string>('clarity');
  const [consoleClicks, setConsoleClicks] = useState(0);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const portraitInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const ch1Ref = useRef<HTMLElement | null>(null);
  const ch2Ref = useRef<HTMLElement | null>(null);
  const ch3Ref = useRef<HTMLElement | null>(null);
  const beatRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Global scroll progress bound to App.tsx scrollable root container
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 115,
    damping: 26,
    restDelta: 0.001,
  });

  // Section-scoped scroll progress for Chapter 01, Chapter 02, Chapter 03
  const { scrollYProgress: ch1Scroll } = useScroll({
    container: scrollContainerRef,
    target: ch1Ref,
    offset: ['start start', 'end start'],
  });

  const { scrollYProgress: ch3Scroll } = useScroll({
    container: scrollContainerRef,
    target: ch3Ref,
    offset: ['start end', 'end start'],
  });

  // Multi-layer depth transforms (guarded cleanly in JSX when reduced motion is active)
  const bgCorridorY = useTransform(smoothScroll, [0, 1], ['0%', '-8%']);
  const bgCorridorScale = useTransform(smoothScroll, [0, 0.5, 1], [1.06, 1.12, 1.16]);
  const lightShaftX = useTransform(smoothScroll, [0, 1], ['-10%', '14%']);
  const lightShaftReverseX = useTransform(smoothScroll, [0, 1], ['12%', '-12%']);
  const fgColumnY = useTransform(smoothScroll, [0, 1], ['0%', '-22%']);

  // Environmental lighting transitions across Chapters 01 -> 02 -> 03
  const crimsonWashOpacity = useTransform(smoothScroll, [0, 0.28, 0.55], [0.95, 0.7, 0.12]);
  const indigoWashOpacity = useTransform(smoothScroll, [0.18, 0.48, 0.82], [0.05, 0.9, 0.18]);
  const plumWashOpacity = useTransform(smoothScroll, [0.55, 0.82, 1], [0.05, 0.78, 0.95]);

  // Chapter 01 parallax plate transforms
  const ch1HeroImgY = useTransform(ch1Scroll, [0, 1], ['0%', '16%']);
  const ch1HeroImgScale = useTransform(ch1Scroll, [0, 1], [1.04, 1.14]);
  const ch1TextY = useTransform(ch1Scroll, [0, 1], ['0px', '-36px']);

  // Chapter 03 oversized editorial parallax bands
  const ch3BandOneX = useTransform(ch3Scroll, [0, 1], ['5%', '-11%']);
  const ch3BandTwoX = useTransform(ch3Scroll, [0, 1], ['-8%', '9%']);

  // Pixel Guide walking position along bottom rail
  const guideTravelLeft = useTransform(smoothScroll, [0, 1], ['2%', '86%']);

  // Sync active chapter via IntersectionObserver inside scroll container
  useEffect(() => {
    const sections: Array<{ id: '01' | '02' | '03'; el: HTMLElement | null }> = [
      { id: '01', el: ch1Ref.current },
      { id: '02', el: ch2Ref.current },
      { id: '03', el: ch3Ref.current },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const found = sections.find((s) => s.el === entry.target);
            if (found) setActiveChapter(found.id);
          }
        }
      },
      {
        root: scrollContainerRef?.current ?? null,
        threshold: 0.25,
      }
    );
    sections.forEach((s) => {
      if (s.el) observer.observe(s.el);
    });
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  // Scroll-driven Chapter 02 beat activation as narrative cards pass center viewport
  useEffect(() => {
    if (studioMediaTab !== 'walkthrough') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualBeatLock) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute('data-beat-index');
            if (idxAttr !== null) {
              const parsed = Number(idxAttr);
              if (!Number.isNaN(parsed)) setSceneIdx(parsed);
            }
          }
        }
      },
      {
        root: scrollContainerRef?.current ?? null,
        rootMargin: '-28% 0px -38% 0px',
        threshold: 0.25,
      }
    );

    beatRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [scrollContainerRef, studioMediaTab, manualBeatLock]);

  // Release manual beat override shortly after user scrolls naturally
  useEffect(() => {
    if (!manualBeatLock) return;
    const el = scrollContainerRef?.current ?? window;
    const release = () => setManualBeatLock(false);
    const timer = window.setTimeout(() => {
      el.addEventListener('wheel', release, { once: true, passive: true });
      el.addEventListener('touchmove', release, { once: true, passive: true });
    }, 350);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('wheel', release);
      el.removeEventListener('touchmove', release);
    };
  }, [manualBeatLock, scrollContainerRef]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (customPortraitUrl) URL.revokeObjectURL(customPortraitUrl);
    };
  }, [customPortraitUrl]);

  useEffect(() => {
    return () => {
      if (customVideoUrl) URL.revokeObjectURL(customVideoUrl);
    };
  }, [customVideoUrl]);

  const scrollToChapter = (chapter: '01' | '02' | '03') => {
    soundEngine.playInteract();
    setActiveChapter(chapter);
    const map = { '01': ch1Ref.current, '02': ch2Ref.current, '03': ch3Ref.current };
    map[chapter]?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const selectStudioBeat = (idx: number, scrollBeatIntoView = false) => {
    soundEngine.playInteract();
    setManualBeatLock(true);
    setSceneIdx(idx);
    if (scrollBeatIntoView) {
      beatRefs.current[idx]?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customPortraitUrl) URL.revokeObjectURL(customPortraitUrl);
    setCustomPortraitUrl(URL.createObjectURL(file));
    soundEngine.playSuccess();
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customVideoUrl) URL.revokeObjectURL(customVideoUrl);
    setCustomVideoUrl(URL.createObjectURL(file));
    setStudioMediaTab('video');
    soundEngine.playSuccess();
  };

  const handleConsoleTap = () => {
    soundEngine.playCoin();
    const next = consoleClicks + 1;
    setConsoleClicks(next);
    if (next === 5) {
      onUnlockSecret();
    }
  };

  const currentScene = STUDIO_SCENES[sceneIdx];

  return (
    <div
      className="relative min-h-screen bg-[#07070B] text-[#F4F4FF] pt-20 pb-36 overflow-x-clip selection:bg-[#FF3E9D] selection:text-white"
      onMouseMove={(e) => {
        if (prefersReducedMotion) return;
        const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 14;
        const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 10;
        setMouseTilt({ x: nx, y: ny });
      }}
    >
      {/* ===================================================================== */}
      {/* FIXED 5-LAYER ARCHITECTURAL PARALLAX STAGE & LIGHTING TRANSITIONS     */}
      {/* ===================================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Layer 0: Deep Architectural Concrete Gallery Plate */}
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : { y: bgCorridorY, scale: bgCorridorScale }
          }
          className="absolute inset-[-6%] w-[112%] h-[112%]"
        >
          <img
            src={galleryCorridorImg}
            alt=""
            className="w-full h-full object-cover opacity-22"
          />
          <div className="absolute inset-0 bg-[#07070B]/68" />
        </motion.div>

        {/* Layer 1: Scroll-Shifted Environmental Lighting Washes (Crimson -> Indigo -> Plum) */}
        <motion.div
          style={{ opacity: prefersReducedMotion ? 0.5 : crimsonWashOpacity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_28%,rgba(225,29,72,0.22),transparent_60%)]"
        />
        <motion.div
          style={{ opacity: prefersReducedMotion ? 0.35 : indigoWashOpacity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_42%,rgba(147,51,234,0.22),transparent_62%)]"
        />
        <motion.div
          style={{ opacity: prefersReducedMotion ? 0.35 : plumWashOpacity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_78%,rgba(255,62,157,0.18),transparent_60%)]"
        />

        {/* Layer 2: Moving Diagonal Volumetric Light Shafts */}
        <motion.div
          style={prefersReducedMotion ? undefined : { x: lightShaftX }}
          className="absolute -top-20 left-[12%] w-80 h-[135%] -skew-x-12 bg-gradient-to-r from-transparent via-[#FDA4AF]/[0.06] to-transparent"
        />
        <motion.div
          style={prefersReducedMotion ? undefined : { x: lightShaftReverseX }}
          className="absolute -top-20 right-[18%] w-64 h-[135%] -skew-x-12 bg-gradient-to-r from-transparent via-[#C084FC]/[0.05] to-transparent"
        />

        {/* Layer 3: Subtle Architectural Edge Pilasters Moving at Foreground Parallax Speed */}
        <motion.div
          style={prefersReducedMotion ? undefined : { y: fgColumnY }}
          className="hidden xl:block absolute top-0 left-0 w-10 h-[140%] bg-gradient-to-r from-[#040408] to-transparent border-r border-white/[0.04]"
        />
        <motion.div
          style={prefersReducedMotion ? undefined : { y: fgColumnY }}
          className="hidden xl:block absolute top-0 right-0 w-10 h-[140%] bg-gradient-to-l from-[#040408] to-transparent border-l border-white/[0.04]"
        />
      </div>

      {/* ===================================================================== */}
      {/* STICKY TOP CHAPTER RAIL                                               */}
      {/* ===================================================================== */}
      <div className="sticky top-[68px] z-30 bg-[#07070B]/90 backdrop-blur-md border-b border-[#271F46]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
            {[
              { id: '01' as const, label: '01 · Meet the Designer' },
              { id: '02' as const, label: '02 · Behind the Screen' },
              { id: '03' as const, label: '03 · Creative Mindset' },
            ].map((tab) => {
              const isCurrent = activeChapter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToChapter(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                    isCurrent
                      ? 'bg-[#1D122B] text-white border-[#FF3E9D]'
                      : 'bg-transparent text-[#94A3B8] border-transparent hover:text-white hover:border-[#3B2E66]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="font-mono-tab text-[11px] text-[#94A3B8]">
              SANCTUARY CHAPTER {activeChapter} / 03
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CHAPTER 01 — MEET THE DESIGNER (Photographic Sanctuary + Portrait Slot)*/}
      {/* ===================================================================== */}
      <section
        ref={ch1Ref}
        id="chapter-01"
        className="relative z-10 overflow-hidden border-b border-[#241B3E]"
      >
        {/* Section-scoped Wide Architectural Studio Plate with Depth Tracking */}
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : { y: ch1HeroImgY, scale: ch1HeroImgScale }
          }
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={sanctuaryWideImg}
            alt=""
            className="w-full h-full object-cover opacity-38 transition-transform duration-300 ease-out"
            style={{
              transform: prefersReducedMotion
                ? 'scale(1.02)'
                : `translate(${-mouseTilt.x * 0.65}px, ${-mouseTilt.y * 0.55}px)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07070B]/82 via-[#08070F]/65 to-[#07070B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070B]/92 via-[#07070B]/48 to-[#07070B]/88" />
        </motion.div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-22">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* LEFT COLUMN: Dedicated Prominent 3:4 Reserved Real Portrait Frame */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div
                className="relative bg-[#0B0A13]/92 border border-[#3E2C59] p-3.5 shadow-[0_28px_70px_rgba(0,0,0,0.82)] transition-transform duration-300 ease-out"
                style={{
                  transform: prefersReducedMotion
                    ? undefined
                    : `translate(${mouseTilt.x * 0.35}px, ${mouseTilt.y * 0.35}px)`,
                }}
              >
                {/* Frame Header Bar */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#251C3D]">
                  <span className="font-mono-tab text-[11px] tracking-wider text-[#FDA4AF]">
                    PORTRAIT FRAME · 3:4
                  </span>
                  <span className="font-pixel text-[8px] text-[#94A3B8]">
                    {customPortraitUrl ? 'PREVIEW ACTIVE' : 'RESERVED SLOT'}
                  </span>
                </div>

                {/* Aspect 3:4 Architectural Aperture */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#06060B] border border-[#2D2246]">
                  {/* Subtle studio corridor background reflection behind placeholder */}
                  {!customPortraitUrl && (
                    <>
                      <img
                        src={galleryCorridorImg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-32 scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#07070B]/65 via-[#090812]/75 to-[#07070B]/95" />
                    </>
                  )}

                  {/* Hairline Camera Viewfinder Corner Reticles */}
                  <div className="pointer-events-none absolute inset-4 z-10">
                    <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#FF3E9D]/75" />
                    <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#FF3E9D]/75" />
                    <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#FF3E9D]/75" />
                    <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#FF3E9D]/75" />
                  </div>

                  {customPortraitUrl ? (
                    <div className="relative w-full h-full z-10">
                      <img
                        src={customPortraitUrl}
                        alt={`${DESIGNER_PROFILE.name} portrait`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#07070B] via-[#07070B]/70 to-transparent flex items-center justify-between gap-2">
                        <span className="text-xs font-mono-tab text-[#22FF88]">
                          Local photo preview loaded
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => portraitInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#E11D48] hover:bg-[#FF3E9D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Swap</span>
                          </button>
                          <button
                            onClick={() => {
                              URL.revokeObjectURL(customPortraitUrl);
                              setCustomPortraitUrl(null);
                            }}
                            className="p-1.5 bg-[#131022] border border-[#3E2C59] text-[#CBD5E1] hover:text-white cursor-pointer"
                            aria-label="Reset portrait slot"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-7 text-center">
                      <div className="w-16 h-16 border border-[#FF3E9D]/55 bg-[#120D1F]/90 flex items-center justify-center mb-5">
                        <ImageIcon className="w-7 h-7 text-[#FF75B5]" />
                      </div>
                      <p className="font-pixel text-[10px] text-[#FFD93D] tracking-wider mb-2.5">
                        RESERVED PORTRAIT AREA
                      </p>
                      <h2 className="text-lg font-semibold text-white mb-2">
                        Designer Studio Photograph
                      </h2>
                      <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xs leading-relaxed mb-6">
                        This 3:4 aperture is dedicated to Meera Manoj’s real studio portrait — clean,
                        photographic, and free of illustrated placeholders.
                      </p>
                      <button
                        onClick={() => portraitInputRef.current?.click()}
                        className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#FF3E9D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Insert / Preview Real Photo</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={portraitInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitUpload}
                    className="hidden"
                    aria-label="Upload real portrait image"
                  />
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Editorial Typography & Designer Narrative */}
            <motion.div
              style={prefersReducedMotion ? undefined : { y: ch1TextY }}
              className="lg:col-span-7 space-y-6"
            >
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-wrap items-center gap-3 text-xs font-mono-tab text-[#FDA4AF]"
              >
                <span>CHAPTER 01 · MEET THE DESIGNER</span>
                <span aria-hidden="true">/</span>
                <span className="text-[#CBD5E1]">{DESIGNER_PROFILE.location}</span>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.02]">
                  {DESIGNER_PROFILE.name}
                </h1>
                <p className="text-xl sm:text-2xl font-medium text-[#FF75B5] mt-3">
                  {DESIGNER_PROFILE.role}
                </p>
              </motion.div>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="text-base sm:text-lg text-[#E2E8F0] leading-relaxed max-w-2xl"
              >
                {DESIGNER_PROFILE.bio}
              </motion.p>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="bg-[#0E0C1A]/90 border-l-2 border-[#E11D48] border-y border-r border-y-[#2A2044] border-r-[#2A2044] p-5 sm:p-6"
              >
                <p className="font-pixel text-[9px] text-[#FFD93D] mb-2 tracking-wider">
                  CREATIVE MISSION
                </p>
                <p className="text-sm sm:text-base text-white leading-relaxed">
                  “{DESIGNER_PROFILE.mission}”
                </p>
              </motion.div>

              {/* Clean unboxed profile credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-[#261E42]">
                <div>
                  <p className="text-xs text-[#94A3B8]">Degree Track</p>
                  <p className="text-sm font-semibold text-white mt-0.5">B.Des (UX/UI), 2023–27</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Institution</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Chitkara University, Punjab
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Availability</p>
                  <p className="text-sm font-semibold text-[#22FF88] mt-0.5">
                    Open to 2026 Opportunities
                  </p>
                </div>
              </div>

              {/* Scroll Prompt into Chapter 02 */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-end gap-1.5 bg-[#120F22] px-2.5 py-1.5 border border-[#382B5C]">
                    <PixelAvatar subject="meera" size={36} />
                    <PixelAvatar subject="fox" size={26} />
                  </div>
                  <p className="text-xs text-[#CBD5E1] max-w-xs leading-relaxed">
                    Scroll down through the studio to explore Meera’s materials, process plates,
                    and creative principles.
                  </p>
                </div>
                <button
                  onClick={() => scrollToChapter('02')}
                  className="px-4 py-2.5 bg-[#1A132D] hover:bg-[#E11D48] border border-[#FF3E9D] text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Enter Studio Walkthrough</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 02 — BEHIND THE SCREEN (Sticky Scroll-Driven Photography)     */}
      {/* ===================================================================== */}
      <section
        ref={ch2Ref}
        id="chapter-02"
        className="relative z-10 py-18 sm:py-28 px-4 sm:px-8 border-b border-[#241B3E] bg-[#080710]/70"
      >
        <div className="max-w-[1280px] mx-auto space-y-12">
          {/* Chapter 02 Header & Mode Switch */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-mono-tab text-[#C084FC] mb-2">
                CHAPTER 02 · BEHIND THE SCREEN
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]">
                Inside the studio workflow
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playInteract();
                  setStudioMediaTab('walkthrough');
                }}
                className={`px-3.5 py-2 text-xs font-semibold border flex items-center gap-2 cursor-pointer transition-colors ${
                  studioMediaTab === 'walkthrough'
                    ? 'bg-[#E11D48] text-white border-[#FF75B5]'
                    : 'bg-[#12101F] text-[#CBD5E1] border-[#312554] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Photographic Plates</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playInteract();
                  setStudioMediaTab('video');
                }}
                className={`px-3.5 py-2 text-xs font-semibold border flex items-center gap-2 cursor-pointer transition-colors ${
                  studioMediaTab === 'video'
                    ? 'bg-[#9333EA] text-white border-[#C084FC]'
                    : 'bg-[#12101F] text-[#CBD5E1] border-[#312554] hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Real Studio Video</span>
              </button>
            </div>
          </div>

          {studioMediaTab === 'walkthrough' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* STICKY LEFT 7 COLS: Photographic Cinema Viewport with Clip-Path Shutter Transitions */}
              <div className="lg:col-span-7 lg:sticky lg:top-28 bg-[#07070B] border border-[#3B2A54] shadow-[0_24px_65px_rgba(0,0,0,0.75)] overflow-hidden">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScene.id}
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, clipPath: 'inset(0% 0% 10% 0%)' }
                      }
                      animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <motion.img
                        src={currentScene.image}
                        alt={currentScene.title}
                        initial={prefersReducedMotion ? false : currentScene.motionFrom}
                        animate={
                          prefersReducedMotion || !isPlayingMotion
                            ? { scale: 1.03, x: '0%', y: '0%' }
                            : currentScene.motionTo
                        }
                        transition={{ duration: 6.5, ease: 'easeInOut' }}
                        className="w-full h-full object-cover"
                      />
                      {/* Moody editorial rim-light overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(145deg, ${currentScene.accentHex}24 0%, transparent 45%, rgba(7,7,11,0.88) 100%)`,
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Minimal Photographic Telemetry */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 bg-[#07070B]/85 border border-white/20 font-mono-tab text-[11px] text-white">
                      PLATE {currentScene.index}
                    </span>
                    <span className="px-2.5 py-1 bg-[#07070B]/85 font-mono-tab text-[10px] text-[#CBD5E1]">
                      {currentScene.lensTag}
                    </span>
                  </div>

                  {/* Plate Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-[#07070B] via-[#07070B]/82 to-transparent">
                    <p className="font-mono-tab text-[11px] uppercase tracking-wider mb-1" style={{ color: currentScene.accentHex }}>
                      {currentScene.processStage}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {currentScene.title}
                    </h3>
                  </div>
                </div>

                {/* Controls & Materials Spec Bar */}
                <div className="px-4 py-3 bg-[#0C0A15] border-t border-[#261E40] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => {
                        soundEngine.playInteract();
                        setIsPlayingMotion((p) => !p);
                      }}
                      className="px-3 py-1.5 bg-[#171229] hover:bg-[#E11D48] border border-[#5B45B8] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                    >
                      {isPlayingMotion ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Drift</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Animate Plate</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-[#94A3B8] truncate hidden sm:inline">
                      {currentScene.materials}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {STUDIO_SCENES.map((sc, idx) => (
                      <button
                        key={sc.id}
                        onClick={() => selectStudioBeat(idx, true)}
                        className={`px-2.5 py-1 text-xs font-mono-tab border cursor-pointer transition-colors ${
                          idx === sceneIdx
                            ? 'bg-[#FF3E9D] text-white border-white font-bold'
                            : 'bg-[#141122] text-[#94A3B8] border-[#312554] hover:text-white'
                        }`}
                      >
                        0{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SCROLLABLE RIGHT 5 COLS: Narrative Process Beats that Activate Sticky Plates */}
              <div className="lg:col-span-5 space-y-6 lg:space-y-10">
                {STUDIO_SCENES.map((sc, idx) => {
                  const isActive = idx === sceneIdx;
                  return (
                    <div
                      key={sc.id}
                      ref={(el) => {
                        beatRefs.current[idx] = el;
                      }}
                      data-beat-index={idx}
                      onClick={() => selectStudioBeat(idx, false)}
                      className={`p-6 sm:p-8 border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-[#130F21]/95 border-[#FF3E9D] shadow-[0_14px_38px_rgba(225,29,72,0.14)]'
                          : 'bg-[#0B0914]/85 border-[#241C3C] opacity-75 hover:opacity-100 hover:border-[#6D28D9]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono-tab mb-3">
                        <span style={{ color: isActive ? sc.accentHex : '#94A3B8' }}>
                          STAGE {sc.index}
                        </span>
                        <span className="text-[#CBD5E1]">{sc.processStage}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">{sc.title}</h3>
                      <p className="text-sm text-[#E2E8F0] leading-relaxed mb-4">{sc.caption}</p>

                      <div className="pt-3 border-t border-[#261E40] flex items-center justify-between text-[11px] font-mono-tab text-[#94A3B8]">
                        <span className="truncate">{sc.materials}</span>
                        <span className={isActive ? 'text-[#22FF88] shrink-0 ml-2' : 'shrink-0 ml-2'}>
                          {isActive ? '● ACTIVE' : 'VIEW'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* RESERVED REAL STUDIO VIDEO SLOT */
            <div className="bg-[#0B0914] border border-[#5B45B8] p-5 sm:p-8">
              <div className="aspect-video w-full bg-[#06060B] border border-dashed border-[#9333EA] flex flex-col items-center justify-center overflow-hidden relative">
                {customVideoUrl ? (
                  <video
                    src={customVideoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="text-center px-6 max-w-lg">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#17112B] border border-[#C084FC]/50 flex items-center justify-center">
                      <Film className="w-7 h-7 text-[#C084FC]" />
                    </div>
                    <p className="font-pixel text-[10px] text-[#FFD93D] mb-2">
                      RESERVED REAL STUDIO VIDEO AREA
                    </p>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Insert a real behind-the-scenes studio video
                    </h3>
                    <p className="text-sm text-[#CBD5E1] leading-relaxed mb-6">
                      This 16:9 cinema container is cleanly reserved for your own .mp4 or .webm
                      workspace reel. Load a local clip to preview it immediately inside this
                      architectural room.
                    </p>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="px-5 py-2.5 bg-[#9333EA] hover:bg-[#A855F7] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Load Local Studio Video</span>
                    </button>
                  </div>
                )}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  aria-label="Upload real studio video"
                />
              </div>

              {customVideoUrl && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#22FF88]">Local studio video loaded.</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#17112B] border border-[#C084FC] text-xs font-semibold text-white cursor-pointer"
                    >
                      Replace Video
                    </button>
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(customVideoUrl);
                        setCustomVideoUrl(null);
                      }}
                      className="px-3 py-1.5 bg-[#12101D] border border-[#3E2C59] text-xs text-[#CBD5E1] hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHAPTER 03 — MY CREATIVE MINDSET (Parallax Type & Mindset Pillars)    */}
      {/* ===================================================================== */}
      <section
        ref={ch3Ref}
        id="chapter-03"
        className="relative z-10 py-18 sm:py-28 overflow-hidden"
      >
        {/* Oversized Scroll-Parallax Typographic Drift Stage */}
        <div
          className="pointer-events-none select-none overflow-hidden py-4 mb-10 border-y border-white/[0.06] bg-[#07070B]/60"
          aria-hidden="true"
        >
          <motion.div
            style={prefersReducedMotion ? undefined : { x: ch3BandOneX }}
            className="whitespace-nowrap font-bold tracking-tighter text-4xl sm:text-6xl md:text-7xl text-white/[0.09] uppercase"
          >
            STRUCTURE BEFORE SURFACE · TACTILE RESTRAINT · VISUAL STORYTELLING · HUMAN ATTENTION
          </motion.div>
          <motion.div
            style={prefersReducedMotion ? undefined : { x: ch3BandTwoX }}
            className="whitespace-nowrap font-bold tracking-tighter text-3xl sm:text-5xl md:text-6xl text-[#FF3E9D]/[0.14] uppercase mt-1"
          >
            SYSTEMS · CRAFT · PROTOTYPING · ATMOSPHERE · DESIGN PHILOSOPHY · PLAYER 01
          </motion.div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="max-w-2xl">
            <p className="text-xs font-mono-tab text-[#FF75B5] mb-2">
              CHAPTER 03 · MY CREATIVE MINDSET
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]">
              How I think about systems, storytelling &amp; craft
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Interactive Design Mindset Pillars + Honest Editable Reflection Slots */}
            <div className="lg:col-span-7 space-y-4">
              {MINDSET_PILLARS.map((pillar) => {
                const open = activePillarId === pillar.id;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => {
                      soundEngine.playInteract();
                      setActivePillarId(pillar.id);
                    }}
                    className={`w-full text-left p-6 border transition-colors cursor-pointer ${
                      open
                        ? 'bg-[#120E20]/95 border-[#E11D48]'
                        : 'bg-[#0B0A13]/90 border-[#231C3A] hover:border-[#5B45B8]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono-tab text-xs font-bold text-[#FF75B5]">
                          {pillar.index}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white">{pillar.title}</h3>
                      </div>
                      <span className="text-xs font-mono-tab text-[#94A3B8]">
                        {open ? 'OPEN' : 'READ'}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-[#FDA4AF] mt-2 pl-8">{pillar.lead}</p>

                    {open && (
                      <motion.p
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className="text-sm text-[#CBD5E1] leading-relaxed mt-3 pl-8"
                      >
                        {pillar.body}
                      </motion.p>
                    )}
                  </button>
                );
              })}

              {/* Editable Personal Reflection Placeholders (zero fabricated claims) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#0B0A13]/90 border border-dashed border-[#4C1D95] p-5">
                  <p className="font-mono-tab text-[11px] text-[#C084FC] mb-1.5">
                    [EDITABLE REFLECTION 01]
                  </p>
                  <p className="text-sm font-semibold text-white mb-1">
                    Personal Design Inspiration
                  </p>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Add a favorite film, book, game interface, or physical space that shaped how you
                    see layout, contrast, and motion.
                  </p>
                </div>
                <div className="bg-[#0B0A13]/90 border border-dashed border-[#9D174D] p-5">
                  <p className="font-mono-tab text-[11px] text-[#FDA4AF] mb-1.5">
                    [EDITABLE REFLECTION 02]
                  </p>
                  <p className="text-sm font-semibold text-white mb-1">
                    Current Creative Exploration
                  </p>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Reserve this note for what you are actively studying this semester at Chitkara
                    University or experimenting with next.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Creative Fuels + Preserved Interactive Handheld Console */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="bg-[#0C0B15]/92 border border-[#2B2246] p-6 space-y-4">
                <p className="font-pixel text-[10px] text-[#FFD93D]">CREATIVE FUELS</p>
                <div className="space-y-2.5">
                  {DESIGNER_PROFILE.interests.map((interest, idx) => (
                    <div
                      key={interest}
                      className="flex items-start gap-3 py-2 border-b border-[#1E1734] last:border-b-0"
                    >
                      <span className="font-mono-tab text-xs text-[#FF75B5] mt-0.5">
                        0{idx + 1}
                      </span>
                      <span className="text-sm text-[#E2E8F0]">{interest}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preserved Retro Pink Handheld Easter Egg */}
              <div className="bg-[#0C0B15]/92 border border-[#FF3E9D]/70 p-5 flex flex-col items-center">
                <div className="flex items-center gap-2 text-xs font-pixel text-[#FF75B5] mb-3">
                  <Gamepad2 className="w-4 h-4" />
                  <span>PLAYER 01 HANDHELD</span>
                </div>

                <div className="w-full max-w-[270px] bg-[#E11D74] border-4 border-[#120D24] p-2.5 shadow-[6px_6px_0_0_#000]">
                  <div className="bg-[#120D24] p-2 border-2 border-[#FF8AC6]">
                    <div className="bg-[#163829] border-2 border-[#22FF88] h-28 flex flex-col items-center justify-center">
                      <PixelAvatar subject="meera" size={64} />
                      <span className="font-pixel text-[8px] text-[#22FF88] mt-1">
                        {consoleClicks >= 5 ? 'SECRET UNLOCKED!' : 'READY TO DESIGN'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#9D174D] my-1.5 border-y border-[#120D24]" />
                  <div className="bg-[#F43F98] border-2 border-[#120D24] p-2.5 flex items-center justify-between gap-2">
                    <button
                      onClick={handleConsoleTap}
                      className="w-9 h-9 bg-[#1B1730] border-2 border-[#120D24] text-white font-pixel text-xs cursor-pointer"
                      aria-label="Console D-pad"
                    >
                      +
                    </button>
                    <div className="flex-1 h-12 bg-[#FCE7F3] border-2 border-[#120D24] grid grid-cols-4 grid-rows-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="border border-[#FF75B5]/35" />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {['A', 'B', 'X', 'Y'].map((b) => (
                        <button
                          key={b}
                          onClick={handleConsoleTap}
                          className="w-5 h-5 rounded-full bg-[#1B1730] text-[8px] font-pixel text-[#FFD93D] cursor-pointer"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#94A3B8] mt-3">
                  {consoleClicks >= 5
                    ? 'Handheld Easter egg found! (+75 XP awarded)'
                    : `Tap controls to play (${consoleClicks}/5)`}
                </p>
              </div>
            </div>
          </div>

          {/* Seamless Handoff to Next Portfolio Worlds */}
          <div className="pt-8 border-t border-[#221A3B] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PixelAvatar subject="meera" size={38} />
              <span className="text-sm text-[#CBD5E1]">
                Ready to see the tools &amp; case studies behind this creative world?
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateDestination('skills')}
                className="pixel-btn px-4 py-2.5 bg-[#19132B] border-2 border-[#FF3E9D] text-xs font-semibold text-white hover:bg-[#E11D48] cursor-pointer flex items-center gap-2"
              >
                <span>Visit Skill Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateDestination('missions')}
                className="pixel-btn px-4 py-2.5 bg-[#22FF88] border-2 border-white text-xs font-bold text-[#06060E] cursor-pointer flex items-center gap-2"
              >
                <span>Mission Control</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCROLL-DRIVEN RECURRING PIXEL GUIDE TRACK (Meera & Fox Continuity)    */}
      {/* ===================================================================== */}
      <div className="pointer-events-none fixed bottom-3 inset-x-0 z-30 px-3 sm:px-6">
        <div className="pointer-events-auto max-w-[1280px] mx-auto bg-[#07070E]/92 backdrop-blur-md border border-[#322556] px-4 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex items-center gap-4">
          {/* Interactive Travel Rail */}
          <div className="relative flex-1 h-8 flex items-center overflow-hidden">
            <div className="w-full h-0.5 bg-[#241B3E]" />
            <motion.div
              className="absolute inset-y-0 left-0 h-0.5 my-auto bg-gradient-to-r from-[#E11D48] via-[#FF3E9D] to-[#9333EA]"
              style={{
                width: prefersReducedMotion ? '100%' : guideTravelLeft,
              }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 flex items-end gap-1"
              style={{
                left: prefersReducedMotion ? '4%' : guideTravelLeft,
              }}
            >
              <PixelAvatar subject="meera" size={28} />
              <PixelAvatar subject="fox" size={20} />
            </motion.div>
          </div>

          <p className="hidden lg:block text-[11px] text-[#CBD5E1] max-w-sm truncate">
            {GUIDE_NOTES[activeChapter]}
          </p>

          <div className="flex items-center gap-1 shrink-0">
            {(['01', '02', '03'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => scrollToChapter(ch)}
                className={`px-2 py-1 font-pixel text-[8px] border cursor-pointer transition-colors ${
                  activeChapter === ch
                    ? 'bg-[#FF3E9D] text-white border-white'
                    : 'bg-[#120F22] text-[#94A3B8] border-[#312554] hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
