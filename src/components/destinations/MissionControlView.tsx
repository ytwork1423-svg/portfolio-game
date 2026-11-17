import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowLeft,
  Edit3,
  Menu,
  Save,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PROJECT_QUESTS } from '../../data/portfolioData';
import {
  DemoArtworkVariant,
  EditableProjectItem,
  HeroEditorialCopy,
  mapQuestsToExhibits,
} from '../../types/projectsExhibition';
import { EditorialArtworkPlate, ReferenceCardFrame } from '../exhibition/EditorialArtworkPlate';
import { CaseStudyDossierModal } from '../exhibition/CaseStudyDossierModal';
import { ArcadeGameOverFinale } from '../exhibition/ArcadeGameOverFinale';
import { PixelAvatar } from '../PixelAvatar';
import { soundEngine } from '../../audio/soundEngine';

interface MissionControlViewProps {
  completedQuests: string[];
  onCompleteQuest: (questId: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  muted?: boolean;
  onReturnToHub?: () => void;
  onToggleMute?: () => void;
  onOpenPause?: () => void;
}

const INITIAL_HERO_COPY: HeroEditorialCopy = {
  headlineLine1: 'CREATIVE',
  headlineLine2: 'PROJECTS',
  subtitle: 'Designing playful interfaces, thoughtful product flows, and expressive visual worlds.',
  ribbonText: 'CRAFTED BY HAND · INSPIRED BY PLAY · DESIGNED TO CONNECT',
};

const HERO_FAN_SPECS: Array<{
  x: number;
  y: number;
  rotate: number;
  scale: number;
  z: number;
  variant: DemoArtworkVariant;
  frame: ReferenceCardFrame;
  sticker?: string;
}> = [
  { x: -245, y: 28, rotate: -13, scale: 0.88, z: 10, variant: 'magenta-editorial', frame: 'polaroid', sticker: '!' },
  { x: -125, y: 8, rotate: -6.5, scale: 0.94, z: 20, variant: 'sunburst-poster', frame: 'pastel-sky' },
  { x: 0, y: -6, rotate: 0, scale: 1.03, z: 30, variant: 'coral-portrait', frame: 'arcade-crt', sticker: 'OMG!' },
  { x: 125, y: 10, rotate: 6.5, scale: 0.94, z: 20, variant: 'cobalt-eye', frame: 'indigo-poster' },
  { x: 245, y: 28, rotate: 13, scale: 0.88, z: 10, variant: 'emerald-ui', frame: 'polaroid', sticker: "LET'S GO!" },
];

// Retro pixel SVG sprites matching the 3 reference posters (Gamepad, Trophy, Hearts, Ghosts, Sparkle, Coin, Cursor)
const PixelGamepadSprite: React.FC = () => (
  <svg width="76" height="52" viewBox="0 0 19 13" className="pixelated drop-shadow-[4px_4px_0_#150C36]" aria-hidden="true">
    <path d="M3 2h13v1h1v2h1v5h-1v2h-3v-1h-2v-1H7v1H5v1H2v-2H1V5h1V3h1z" fill="#150C36" />
    <path d="M3 3h13v2h1v5h-3v-1h-2V9H7v1H5v1H2V5h1z" fill="#FF66A3" />
    <rect x="4" y="4" width="11" height="1" fill="#FF9EC4" />
    {/* D-Pad */}
    <rect x="4" y="6" width="3" height="1" fill="#FFE14D" />
    <rect x="5" y="5" width="1" height="3" fill="#FFE14D" />
    {/* Buttons */}
    <rect x="13" y="5" width="1" height="1" fill="#22E4FF" />
    <rect x="14" y="6" width="1" height="1" fill="#FFE14D" />
    <rect x="12" y="6" width="1" height="1" fill="#22FF88" />
    <rect x="13" y="7" width="1" height="1" fill="#FFFFFF" />
  </svg>
);

const PixelTrophySprite: React.FC = () => (
  <svg width="60" height="60" viewBox="0 0 14 14" className="pixelated drop-shadow-[4px_4px_0_#150C36]" aria-hidden="true">
    <rect x="3" y="1" width="8" height="2" fill="#FFE14D" />
    <rect x="1" y="2" width="2" height="4" fill="#FF9F1C" />
    <rect x="11" y="2" width="2" height="4" fill="#FF9F1C" />
    <rect x="3" y="3" width="8" height="4" fill="#FFD93D" />
    <rect x="4" y="3" width="2" height="3" fill="#FFFDF5" />
    <rect x="5" y="7" width="4" height="2" fill="#FF9F1C" />
    <rect x="6" y="9" width="2" height="2" fill="#FF7B00" />
    <rect x="4" y="11" width="6" height="2" fill="#2B128C" />
    <rect x="4" y="11" width="6" height="1" fill="#FFE14D" />
  </svg>
);

const PixelGhostSprite: React.FC<{ bodyColor: string; sheenColor: string }> = ({
  bodyColor,
  sheenColor,
}) => (
  <svg width="46" height="50" viewBox="0 0 12 13" className="pixelated drop-shadow-[3px_3px_0_#150C36]" aria-hidden="true">
    <path d="M3 1h6v1h1v1h1v9h-2v-1H7v1H5v-1H3v1H1V3h1V2h1z" fill={bodyColor} />
    <rect x="3" y="2" width="2" height="2" fill={sheenColor} />
    {/* Eyes */}
    <rect x="3" y="4" width="2" height="3" fill="#FFFFFF" />
    <rect x="7" y="4" width="2" height="3" fill="#FFFFFF" />
    <rect x="4" y="5" width="1" height="2" fill="#150C36" />
    <rect x="8" y="5" width="1" height="2" fill="#150C36" />
  </svg>
);

const PixelSparkStarSprite: React.FC = () => (
  <svg width="42" height="42" viewBox="0 0 11 11" className="pixelated drop-shadow-[3px_3px_0_#150C36]" aria-hidden="true">
    <rect x="5" y="0" width="1" height="11" fill="#150C36" />
    <rect x="0" y="5" width="11" height="1" fill="#150C36" />
    <rect x="4" y="2" width="3" height="7" fill="#FFE14D" />
    <rect x="2" y="4" width="7" height="3" fill="#FFE14D" />
    <rect x="5" y="1" width="1" height="9" fill="#FFFDF5" />
    <rect x="1" y="5" width="9" height="1" fill="#FFFDF5" />
  </svg>
);

const PixelHeartClusterSprite: React.FC = () => (
  <div className="flex items-center gap-1.5 drop-shadow-[3px_3px_0_#150C36]" aria-hidden="true">
    {[0, 1, 2].map((idx) => (
      <svg key={idx} width="24" height="22" viewBox="0 0 9 8" className="pixelated">
        <path
          d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"
          fill="#FF4785"
        />
        <rect x="1" y="1" width="1" height="1" fill="#FFD1E1" />
      </svg>
    ))}
  </div>
);

const PixelCursorSprite: React.FC = () => (
  <svg width="32" height="38" viewBox="0 0 10 12" className="pixelated drop-shadow-[3px_3px_0_#150C36]" aria-hidden="true">
    <path d="M0 0v10h2V8h2v3h2V8h3L0 0z" fill="#150C36" />
    <path d="M1 2v6h2V6h2v3h1V7h2L1 2z" fill="#FFFDF5" />
  </svg>
);

const PixelCoinSprite: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 10 10" className="pixelated drop-shadow-[3px_3px_0_#150C36]" aria-hidden="true">
    <rect x="2" y="0" width="6" height="10" fill="#150C36" />
    <rect x="0" y="2" width="10" height="6" fill="#150C36" />
    <rect x="2" y="1" width="6" height="8" fill="#FFE14D" />
    <rect x="1" y="2" width="8" height="6" fill="#FFE14D" />
    <rect x="4" y="3" width="2" height="4" fill="#FF9F1C" />
  </svg>
);

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  completedQuests,
  onCompleteQuest,
  scrollContainerRef,
  muted = false,
  onReturnToHub,
  onToggleMute,
  onOpenPause,
}) => {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const [exhibits, setExhibits] = useState<EditableProjectItem[]>(() =>
    mapQuestsToExhibits(PROJECT_QUESTS),
  );
  // Default selected cabinet project to index 1 (Kairo) so Screenshot 1 matches immediately, switchable to any of the 4 quests
  const [selectedCabinetIdx, setSelectedCabinetIdx] = useState(1);
  const [heroCopy, setHeroCopy] = useState<HeroEditorialCopy>(INITIAL_HERO_COPY);

  const [editMode, setEditMode] = useState(false);
  const [editingHeroModal, setEditingHeroModal] = useState(false);
  const [heroDraft, setHeroDraft] = useState<HeroEditorialCopy>(INITIAL_HERO_COPY);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [dossierProjectId, setDossierProjectId] = useState<string | null>(null);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [galleryExtras, setGalleryExtras] = useState<Record<string, string | null>>({});
  const [finaleEngaged, setFinaleEngaged] = useState(false);

  const blobUrlsRef = useRef<Set<string>>(new Set());
  const topRef = useRef<HTMLDivElement | null>(null);
  const cabinetRef = useRef<HTMLElement | null>(null);
  const editorialContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    restDelta: 0.001,
  });

  const heroSpreadFactor = useTransform(smoothProgress, [0, 0.35], [1, 1.18]);
  const heroParallaxY = useTransform(smoothProgress, [0, 0.4], [0, -40]);
  const bgGridParallaxY = useTransform(smoothProgress, [0, 1], ['0%', '-10%']);
  const floatFastY = useTransform(smoothProgress, [0, 1], [16, -64]);
  const floatSlowY = useTransform(smoothProgress, [0, 1], [-12, 42]);
  const cabinetScale = useTransform(smoothProgress, [0.25, 0.75], [0.98, 1.02]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId: number | null = null;
    const onMove = (e: PointerEvent) => {
      if (rafId !== null) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 12;
      const ny = (e.clientY / window.innerHeight - 0.5) * 12;
      rafId = window.requestAnimationFrame(() => {
        setMouseTilt({ x: nx, y: ny });
        rafId = null;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const trackBlobUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  }, []);

  const revokeUrl = useCallback((url?: string | null) => {
    if (url && blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  }, []);

  const handleUploadProjectImage = useCallback(
    (projectId: string, file: File, slot: 'primary' | 'secondary' | 'detail' = 'primary') => {
      const nextUrl = trackBlobUrl(file);
      setExhibits((prev) =>
        prev.map((item) => {
          if (item.id !== projectId) return item;
          if (slot === 'secondary') {
            revokeUrl(item.media.secondaryImageUrl);
            return {
              ...item,
              isDemoPlaceholder: false,
              media: { ...item.media, secondaryImageUrl: nextUrl },
            };
          }
          if (slot === 'detail') {
            revokeUrl(item.media.detailImageUrl);
            return {
              ...item,
              isDemoPlaceholder: false,
              media: { ...item.media, detailImageUrl: nextUrl },
            };
          }
          revokeUrl(item.media.imageUrl);
          return {
            ...item,
            isDemoPlaceholder: false,
            media: { ...item.media, imageUrl: nextUrl, imageName: file.name },
          };
        }),
      );
    },
    [trackBlobUrl, revokeUrl],
  );

  const handleUploadProjectVideo = useCallback(
    (projectId: string, file: File) => {
      const nextUrl = trackBlobUrl(file);
      setExhibits((prev) =>
        prev.map((item) => {
          if (item.id !== projectId) return item;
          revokeUrl(item.media.videoUrl);
          return {
            ...item,
            isDemoPlaceholder: false,
            media: { ...item.media, videoUrl: nextUrl, videoName: file.name },
          };
        }),
      );
      setActiveVideoId(`cabinet-${projectId}`);
    },
    [trackBlobUrl, revokeUrl],
  );

  const handleClearProjectMedia = useCallback(
    (projectId: string, kind: 'image' | 'video') => {
      setExhibits((prev) =>
        prev.map((item) => {
          if (item.id !== projectId) return item;
          if (kind === 'image') {
            revokeUrl(item.media.imageUrl);
            return {
              ...item,
              media: { ...item.media, imageUrl: null, imageName: undefined },
            };
          }
          revokeUrl(item.media.videoUrl);
          return {
            ...item,
            media: { ...item.media, videoUrl: null, videoName: undefined },
          };
        }),
      );
    },
    [revokeUrl],
  );

  const handleUploadExtraTile = useCallback(
    (tileKey: string, file: File) => {
      const nextUrl = trackBlobUrl(file);
      setGalleryExtras((prev) => {
        revokeUrl(prev[tileKey]);
        return { ...prev, [tileKey]: nextUrl };
      });
    },
    [trackBlobUrl, revokeUrl],
  );

  const handleClearExtraTile = useCallback(
    (tileKey: string) => {
      setGalleryExtras((prev) => {
        revokeUrl(prev[tileKey]);
        return { ...prev, [tileKey]: null };
      });
    },
    [revokeUrl],
  );

  const activeCabinetProject = exhibits[selectedCabinetIdx] ?? exhibits[0];

  const dossierProject = useMemo(
    () => exhibits.find((e) => e.id === dossierProjectId) ?? null,
    [exhibits, dossierProjectId],
  );

  const scrollToCabinet = () => {
    soundEngine.playInteract();
    cabinetRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleFinaleStateChange = useCallback(
    ({ engaged }: { progress: number; engaged: boolean }) => {
      setFinaleEngaged((prev) => (prev === engaged ? prev : engaged));
    },
    [],
  );

  return (
    <div
      ref={topRef}
      className="relative min-h-screen text-[#FFFDF7] overflow-x-clip selection:bg-[#FF8C00] selection:text-[#150C36]"
      style={{
        background:
          'linear-gradient(180deg, #3D17CC 0%, #270B88 34%, #6D0F42 68%, #22086E 100%)',
      }}
    >
      {/* =====================================================================
          UNIFIED LIGHT-GRID DEPTH BACKDROP ACROSS THE ENTIRE SECTION
      ===================================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Atmospheric Gradient Radial Bloom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 45% at 50% 18%, rgba(139, 92, 246, 0.35), transparent 72%), radial-gradient(circle at 75% 75%, rgba(255, 71, 133, 0.24), transparent 58%)',
          }}
        />

        {/* Crisp Light Architectural Grid Layer with Parallax Depth */}
        <motion.div
          style={{
            y: prefersReducedMotion ? 0 : bgGridParallaxY,
            transform: prefersReducedMotion
              ? undefined
              : `translate3d(${mouseTilt.x * 0.28}px, ${mouseTilt.y * 0.28}px, 0)`,
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.11) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.11) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          className="absolute -inset-24 opacity-80"
        />

        {/* Secondary Fine Sub-Grid + Halftone Corner Depth */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        {/* Recessed Perspective Horizon Depth Floor Grid */}
        <div className="absolute inset-x-0 bottom-0 h-[42vh] opacity-55">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(to top, rgba(34, 228, 255, 0.24), transparent 75%), repeating-linear-gradient(to right, rgba(255, 255, 255, 0.18) 0 1px, transparent 1px 68px), repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.14) 0 1px, transparent 1px 44px)',
              transform: 'perspective(540px) rotateX(62deg)',
              transformOrigin: 'bottom center',
            }}
          />
        </div>
      </div>

      {/* =====================================================================
          MINIMAL ARCADE HEADER BAR
      ===================================================================== */}
      <header
        className={`sticky top-0 z-40 bg-[#18075B]/85 backdrop-blur-md border-b-[3px] border-[#150C36] transition-all duration-500 ${
          finaleEngaged ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {onReturnToHub && (
              <button
                type="button"
                onClick={onReturnToHub}
                className="mr-1 px-3 py-1.5 bg-[#FFE14D] hover:bg-white text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Return to Overworld Hub"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HUB</span>
              </button>
            )}
            <PixelAvatar subject="meera" size={24} className="shrink-0" />
            <span className="font-pixel text-[10px] tracking-wider text-[#FFFDF5] truncate">
              MEERA · PROJECTS
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playInteract();
                setEditMode((e) => !e);
              }}
              className={`px-3 py-1.5 border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                editMode
                  ? 'bg-[#22FF88] text-[#150C36]'
                  : 'bg-[#FF4785] hover:bg-[#FFE14D] text-white hover:text-[#150C36]'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{editMode ? 'Editing On' : 'Manage Media'}</span>
            </button>

            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2 bg-[#2B128C] hover:bg-[#FFE14D] text-white hover:text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] cursor-pointer"
                aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {onOpenPause && (
              <button
                type="button"
                onClick={onOpenPause}
                className="p-2 bg-[#2B128C] hover:bg-[#FFE14D] text-white hover:text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] cursor-pointer"
                aria-label="Open portfolio navigation menu"
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div ref={editorialContentRef} className="relative z-10">
      {/* =====================================================================
          PART 1 — HERO OPENING (CREATIVE PROJECTS + FANNED CARDS + FLOATING RETRO ELEMENTS)
      ===================================================================== */}
      <section className="relative z-10 pt-14 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-8">
        {/* Animated Retro Floating Game Elements from Reference Posters */}
        <motion.div
          aria-hidden="true"
          style={{ y: prefersReducedMotion ? 0 : floatFastY }}
          animate={prefersReducedMotion ? undefined : { y: [0, -14, 0], rotate: [-12, -6, -12] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden md:block absolute top-14 left-[7%] z-20"
        >
          <PixelGamepadSprite />
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ y: prefersReducedMotion ? 0 : floatSlowY }}
          animate={prefersReducedMotion ? undefined : { y: [0, -12, 0], rotate: [8, 14, 8] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden md:block absolute top-14 right-[8%] z-20"
        >
          <PixelTrophySprite />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.15, 1], rotate: [0, 12, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden lg:block absolute top-52 left-[14%] z-20"
        >
          <PixelSparkStarSprite />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden lg:block absolute top-56 right-[12%] z-20"
        >
          <PixelHeartClusterSprite />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { x: [0, 8, 0], y: [0, -8, 0] }}
          transition={{ duration: 3.9, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden sm:block absolute bottom-20 left-[10%] z-20"
        >
          <PixelCoinSprite />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { x: [0, -8, 0], y: [0, -10, 0] }}
          transition={{ duration: 4.1, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden sm:block absolute bottom-24 right-[10%] z-20"
        >
          <PixelCursorSprite />
        </motion.div>

        {/* Floating Arcade X / O & Curved Spark Arcs */}
        <span
          aria-hidden="true"
          className="pointer-events-none hidden md:block absolute top-28 left-[22%] font-pixel text-lg text-white/80 rotate-12"
        >
          X
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none hidden md:block absolute top-32 right-[22%] font-pixel text-lg text-white/80 -rotate-12"
        >
          O
        </span>

        <div className="relative z-10 max-w-[1160px] mx-auto text-center">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-block px-3.5 py-1 bg-[#150C36] border-2 border-[#FFE14D] font-pixel text-[9px] text-[#FFE14D] mb-6 shadow-[3px_3px_0_#FF8C00]"
          >
            HISCORE PORTFOLIO · {completedQuests.length}/{exhibits.length} QUESTS REVIEWED
          </motion.p>

          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-pixel text-3xl sm:text-5xl md:text-[3.75rem] leading-[1.22] tracking-wider text-pixel-3d max-w-4xl mx-auto -rotate-1"
          >
            <span className="block">{heroCopy.headlineLine1}</span>
            <span className="block mt-2">{heroCopy.headlineLine2}</span>
          </motion.h1>

          {/* Fanned 5-Card Overlapping Composition */}
          <motion.div
            style={{ y: prefersReducedMotion ? 0 : heroParallaxY }}
            className="relative mt-14 sm:mt-16 mb-12 h-[260px] sm:h-[320px] flex items-center justify-center"
          >
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, x: -30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="hidden sm:inline-flex items-center px-3 py-1 bg-[#22E4FF] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] text-[#150C36] font-pixel text-[9px] absolute left-[10%] md:left-[18%] top-2 -rotate-6 z-40"
            >
              @UIUX.PLAY
            </motion.span>
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="hidden sm:inline-flex items-center px-3 py-1 bg-[#FFE14D] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] text-[#150C36] font-pixel text-[9px] absolute right-[10%] md:right-[18%] top-2 rotate-6 z-40"
            >
              ★ PLAYER 01
            </motion.span>

            {HERO_FAN_SPECS.map((spec, idx) => {
              const linkedProject = exhibits[idx % exhibits.length];
              const isCenter = idx === 2;
              return (
                <motion.div
                  key={`hero-card-${idx}`}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, x: 0, y: 40, rotate: 0, scale: 0.85 }
                  }
                  animate={{
                    opacity: 1,
                    x: spec.x,
                    y: spec.y,
                    rotate: spec.rotate,
                    scale: spec.scale,
                  }}
                  transition={{
                    duration: 0.85,
                    delay: 0.14 + Math.abs(idx - 2) * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    zIndex: spec.z,
                    scale: prefersReducedMotion ? spec.scale : undefined,
                  }}
                  className={`absolute origin-bottom ${
                    isCenter
                      ? 'w-[185px] h-[230px] sm:w-[250px] sm:h-[285px]'
                      : 'w-[150px] h-[195px] sm:w-[205px] sm:h-[240px]'
                  } max-sm:scale-75`}
                >
                  <motion.div
                    style={{
                      scale: prefersReducedMotion ? 1 : heroSpreadFactor,
                      transform: prefersReducedMotion
                        ? undefined
                        : `translate3d(${mouseTilt.x * (idx - 2) * 0.35}px, ${mouseTilt.y * 0.25}px, 0)`,
                    }}
                    className="w-full h-full"
                  >
                    <EditorialArtworkPlate
                      variant={spec.variant}
                      frameStyle={spec.frame}
                      stickerLabel={spec.sticker}
                      title={linkedProject.title}
                      subtitle={linkedProject.category}
                      imageUrl={
                        idx < exhibits.length
                          ? linkedProject.media.imageUrl
                          : galleryExtras[`hero-${idx}`] || null
                      }
                      videoUrl={idx < exhibits.length ? linkedProject.media.videoUrl : null}
                      videoId={`hero-fan-${idx}`}
                      activeVideoId={activeVideoId}
                      editMode={editMode}
                      isDemo={linkedProject.isDemoPlaceholder}
                      onActivateVideo={setActiveVideoId}
                      onUploadImage={(file) =>
                        idx < exhibits.length
                          ? handleUploadProjectImage(linkedProject.id, file, 'primary')
                          : handleUploadExtraTile(`hero-${idx}`, file)
                      }
                      onUploadVideo={(file) => handleUploadProjectVideo(linkedProject.id, file)}
                      onClearMedia={(kind) =>
                        idx < exhibits.length
                          ? handleClearProjectMedia(linkedProject.id, kind)
                          : handleClearExtraTile(`hero-${idx}`)
                      }
                      onInspect={() => {
                        setSelectedCabinetIdx(idx % exhibits.length);
                        setDossierProjectId(linkedProject.id);
                      }}
                      compact={true}
                      className="w-full h-full"
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.48 }}
            className="max-w-lg mx-auto space-y-6"
          >
            <p className="text-sm sm:text-base text-[#E7E1FF] leading-relaxed">
              {heroCopy.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={scrollToCabinet}
                className="pixel-btn px-6 py-3 bg-[#FFB703] hover:bg-[#FFE14D] text-[#150C36] border-[3px] border-[#150C36] shadow-[4px_4px_0_#150C36] font-pixel text-[10px] cursor-pointer"
              >
                EXPLORE PROJECTS
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeroDraft(heroCopy);
                  setEditingHeroModal(true);
                }}
                className="pixel-btn px-5 py-3 bg-[#FFFDF5] hover:bg-[#22E4FF] text-[#150C36] border-[3px] border-[#150C36] shadow-[4px_4px_0_#150C36] text-xs font-bold cursor-pointer"
              >
                Customize Title
              </button>
            </div>
          </motion.div>
        </div>

        {/* Inline Hero Title & Copy Editor */}
        {editingHeroModal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              soundEngine.playSuccess();
              setHeroCopy(heroDraft);
              setEditingHeroModal(false);
            }}
            className="relative z-20 max-w-xl mx-auto mt-10 pixel-polaroid rounded-2xl p-6 text-left space-y-4"
          >
            <p className="font-pixel text-[10px] text-[#2D0E96]">EDIT HERO HEADING</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#3D2E75]">Headline Line 1</span>
                <input
                  type="text"
                  value={heroDraft.headlineLine1}
                  onChange={(e) => setHeroDraft({ ...heroDraft, headlineLine1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#150C36] text-sm text-[#150C36]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-[#3D2E75]">Headline Line 2</span>
                <input
                  type="text"
                  value={heroDraft.headlineLine2}
                  onChange={(e) => setHeroDraft({ ...heroDraft, headlineLine2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#150C36] text-sm text-[#150C36]"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-[#3D2E75]">Subtitle</span>
              <textarea
                rows={2}
                value={heroDraft.subtitle}
                onChange={(e) => setHeroDraft({ ...heroDraft, subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-[#150C36] text-sm text-[#150C36]"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingHeroModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#3D2E75] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#22FF88] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] text-[#150C36] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Intro</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =====================================================================
          PART 2 — OVERSIZED HISCORE ARCADE CABINET FEATURE + FLOATING GHOSTS
      ===================================================================== */}
      <section
        ref={cabinetRef}
        className="relative z-10 pt-10 sm:pt-16 pb-24 px-4 sm:px-8"
      >
        {/* Floating Retro Arcade Ghosts & Pixel Stars Flanking Cabinet (Image 2 SONG WARS) */}
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [0, -16, 0], rotate: [-8, 4, -8] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden lg:block absolute top-28 left-[4%] z-20"
        >
          <PixelGhostSprite bodyColor="#FF6B35" sheenColor="#FFB899" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [0, 14, 0], rotate: [10, -4, 10] }}
          transition={{ duration: 3.9, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden lg:block absolute top-40 right-[4%] z-20"
        >
          <PixelGhostSprite bodyColor="#22E4FF" sheenColor="#B5F9FF" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [0, -12, 0], rotate: [-5, 7, -5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden lg:block absolute bottom-32 left-[5%] z-20"
        >
          <PixelGhostSprite bodyColor="#FF75B5" sheenColor="#FFD6EA" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.18, 1], y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none hidden lg:block absolute bottom-36 right-[5%] z-20"
        >
          <PixelSparkStarSprite />
        </motion.div>

        <div className="relative z-10 max-w-[1200px] mx-auto space-y-8">
          {/* Top Quest Switcher Cartridges so all 4 projects can be played & customized inside the Cabinet */}
          <div className="flex flex-wrap items-center gap-2.5">
            {exhibits.map((proj, idx) => {
              const selected = idx === selectedCabinetIdx;
              const reviewed = completedQuests.includes(proj.id);
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playInteract();
                    setSelectedCabinetIdx(idx);
                  }}
                  className={`px-3.5 py-2 border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] font-pixel text-[8px] cursor-pointer transition-transform ${
                    selected
                      ? 'bg-[#FFE14D] text-[#150C36] -translate-y-0.5'
                      : 'bg-[#FFFDF5] hover:bg-[#22E4FF] text-[#150C36]'
                  }`}
                >
                  0{idx + 1} · {proj.title.split('–')[0].trim().toUpperCase()}
                  {reviewed ? ' ★' : ''}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-[#FFE14D] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] font-pixel text-[8px] text-[#150C36]">
                QUEST 0{selectedCabinetIdx + 1} · ARCADE CABINET FEATURE
              </span>
              <h2 className="font-pixel text-2xl sm:text-4xl leading-[1.3] text-pixel-3d">
                {activeCabinetProject.title.toUpperCase()}
              </h2>
            </div>

            <span className="inline-flex items-center px-4 py-1.5 bg-[#FFFDF5] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] text-[#150C36] text-xs font-bold self-start sm:self-end -rotate-2">
              @{activeCabinetProject.role.split(' ')[0].toLowerCase()}.design
            </span>
          </div>

          <motion.div
            style={{
              scale: prefersReducedMotion ? 1 : cabinetScale,
              transform: prefersReducedMotion
                ? undefined
                : `translate3d(${mouseTilt.x * 0.2}px, ${mouseTilt.y * 0.15}px, 0)`,
            }}
          >
            <EditorialArtworkPlate
              variant={activeCabinetProject.demoVariant}
              frameStyle="arcade-crt"
              title={activeCabinetProject.title}
              subtitle={activeCabinetProject.overview}
              imageUrl={activeCabinetProject.media.imageUrl}
              videoUrl={activeCabinetProject.media.videoUrl}
              videoId={`cabinet-${activeCabinetProject.id}`}
              activeVideoId={activeVideoId}
              editMode={editMode}
              isDemo={activeCabinetProject.isDemoPlaceholder}
              onActivateVideo={setActiveVideoId}
              onUploadImage={(file) =>
                handleUploadProjectImage(activeCabinetProject.id, file, 'primary')
              }
              onUploadVideo={(file) => handleUploadProjectVideo(activeCabinetProject.id, file)}
              onClearMedia={(kind) => handleClearProjectMedia(activeCabinetProject.id, kind)}
              onInspect={() => setDossierProjectId(activeCabinetProject.id)}
              className="w-full aspect-[16/10] sm:aspect-[21/10]"
            />
          </motion.div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-[#F4EEFF] max-w-2xl leading-relaxed">
              {activeCabinetProject.overview}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setDossierProjectId(activeCabinetProject.id)}
                className="pixel-btn px-5 py-3 bg-[#22E4FF] hover:bg-[#FFE14D] text-[#150C36] border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] font-pixel text-[9px] cursor-pointer"
              >
                READ CASE STUDY →
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* =====================================================================
          ENDING — FULL-SCREEN CINEMATIC ARCADE DIVE & PIXEL-ASSEMBLED GAME OVER
      ===================================================================== */}
      <ArcadeGameOverFinale
        prefersReducedMotion={prefersReducedMotion}
        scrollContainerRef={scrollContainerRef}
        onFinaleStateChange={handleFinaleStateChange}
        onReplayTop={() => {
          soundEngine.playInteract();
          topRef.current?.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }}
        onReturnToHub={onReturnToHub}
      />

      {/* =====================================================================
          CASE STUDY DOSSIER & LIVE EDITOR MODAL
      ===================================================================== */}
      {dossierProject && (
        <CaseStudyDossierModal
          project={dossierProject}
          isCompleted={completedQuests.includes(dossierProject.id)}
          activeVideoProjectId={activeVideoId}
          onActivateVideo={setActiveVideoId}
          onUploadImage={handleUploadProjectImage}
          onUploadVideo={handleUploadProjectVideo}
          onClearMedia={handleClearProjectMedia}
          onSaveProject={(updated) =>
            setExhibits((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
          }
          onCompleteQuest={onCompleteQuest}
          onClose={() => setDossierProjectId(null)}
        />
      )}
    </div>
  );
};
