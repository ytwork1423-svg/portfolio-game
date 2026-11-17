import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { FastForward } from 'lucide-react';
import {
  FOUNTAIN_CENTER,
  HUB_HEIGHT,
  HUB_LAMPS,
  HUB_TREES,
  HUB_WIDTH,
} from '../game/overworldMap';
import { HUB_DESTINATIONS } from '../data/portfolioData';
import { drawLandmarkBuilding } from '../game/hubLandmarks';
import {
  getCloudSprite,
  getFoxSprite,
  getLampSprite,
  getMeeraSprite,
  getTreeSprite,
} from '../game/sprites';
import {
  buildPixelPhrase,
  renderMissionCrtLandscape,
  renderMissionTitleTypography,
} from '../game/crtTitleRenderer';
import { soundEngine } from '../audio/soundEngine';

interface MissionControlEntranceProps {
  playerHubPos?: { x: number; y: number };
  onComplete: () => void;
}

type MissionCrtStage =
  | 'LEAVING_HUB'       // Scene A: Mission Control activated, Meera reacts, slight pullback + CRT frame forms
  | 'CRT_POWER_ON'      // Scene B: Horizontal line compression -> cathode flash -> CRT screen expansion
  | 'TITLE_ASSEMBLE'    // Scene C: Pixel fragments assemble MISSION CONTROL + PROJECTS
  | 'TITLE_READY'       // Scene D: Interactive PRESS START TO EXPLORE + physical arcade controls
  | 'ENTERING_PROJECTS'; // Scene E: Pixel shatter + camera moves through CRT into Projects world

const T_SCENE_A_END = 1000;
const T_SCENE_B_END = 2080;
const T_SCENE_C_END = 3300;
const T_SCENE_E_DURATION = 1360;

export const MissionControlEntrance: React.FC<MissionControlEntranceProps> = ({
  playerHubPos,
  onComplete,
}) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [stage, setStage] = useState<MissionCrtStage>(
    prefersReducedMotion ? 'TITLE_READY' : 'LEAVING_HUB'
  );
  const [joyTilt, setJoyTilt] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
  const [startPressed, setStartPressed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<MissionCrtStage>(prefersReducedMotion ? 'TITLE_READY' : 'LEAVING_HUB');
  const enterStartNowRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const crtBootAudioFiredRef = useRef(false);
  const titleImpactAudioFiredRef = useRef(false);
  const forceReadyOffsetRef = useRef(prefersReducedMotion ? T_SCENE_C_END + 60 : 0);

  const subPhrase = useMemo(() => buildPixelPhrase('MISSION CONTROL'), []);
  const mainPhrase = useMemo(() => buildPixelPhrase('PROJECTS'), []);

  const finishImmediately = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const setStageSync = useCallback((next: MissionCrtStage) => {
    stageRef.current = next;
    setStage(next);
  }, []);

  const triggerEnterProjects = useCallback(() => {
    if (stageRef.current === 'ENTERING_PROJECTS') return;

    if (stageRef.current !== 'TITLE_READY') {
      if (prefersReducedMotion) {
        finishImmediately();
        return;
      }
      forceReadyOffsetRef.current = T_SCENE_C_END + 120;
      setStageSync('TITLE_READY');
      soundEngine.playTitleImpact();
      return;
    }

    setStartPressed(true);
    setJoyTilt({ left: -12, right: 12 });
    soundEngine.playStartGame();
    soundEngine.playWarp();
    enterStartNowRef.current = performance.now();
    setStageSync('ENTERING_PROJECTS');

    if (prefersReducedMotion) {
      window.setTimeout(finishImmediately, 180);
    }
  }, [finishImmediately, prefersReducedMotion, setStageSync]);

  // Keyboard interactions: Enter / Space advances or starts; Escape skips straight to Projects
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finishImmediately();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerEnterProjects();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setJoyTilt((t) => ({ ...t, left: -16 }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setJoyTilt((t) => ({ ...t, right: 16 }));
      }
    };
    const onKeyUp = () => {
      if (stageRef.current !== 'ENTERING_PROJECTS') {
        setJoyTilt({ left: 0, right: 0 });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [finishImmediately, triggerEnterProjects]);

  // Master CRT Canvas Loop (Scenes A -> B -> C -> D -> E)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const missionsDest =
      HUB_DESTINATIONS.find((d) => d.id === 'missions') || HUB_DESTINATIONS[1];

    const rawX = playerHubPos?.x ?? FOUNTAIN_CENTER.x;
    const rawY = playerHubPos?.y ?? FOUNTAIN_CENTER.y + 60;
    const distToCitadel = Math.hypot(
      rawX - missionsDest.doorX,
      rawY - missionsDest.doorY
    );
    const startX = distToCitadel > 680 ? FOUNTAIN_CENTER.x : rawX;
    const startY = distToCitadel > 680 ? FOUNTAIN_CENTER.y - 20 : rawY;

    const stars = Array.from({ length: 120 }, (_, i) => ({
      x: (i * 211) % HUB_WIDTH,
      y: (i * 137) % HUB_HEIGHT,
      size: i % 5 === 0 ? 3 : 2,
      phase: i * 0.55,
    }));

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(320, Math.round(rect.width));
      const targetH = Math.max(220, Math.round(rect.height));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let startNow: number | null = null;
    let tick = 0;
    let animId = 0;

    if (!prefersReducedMotion) {
      soundEngine.playInteract();
    }

    const render = (now: number) => {
      tick++;
      updateCanvasSize();
      const w = canvas.width;
      const h = canvas.height;
      ctx.imageSmoothingEnabled = false;

      if (startNow === null) startNow = now;
      const elapsed =
        forceReadyOffsetRef.current > 0
          ? forceReadyOffsetRef.current + (now - startNow) * 0.001
          : now - startNow;

      // Advance timeline Stages A -> B -> C -> D cleanly
      if (stageRef.current !== 'ENTERING_PROJECTS') {
        if (elapsed < T_SCENE_A_END) {
          if (stageRef.current !== 'LEAVING_HUB') setStageSync('LEAVING_HUB');
        } else if (elapsed < T_SCENE_B_END) {
          if (stageRef.current !== 'CRT_POWER_ON') setStageSync('CRT_POWER_ON');
          if (!crtBootAudioFiredRef.current && !prefersReducedMotion) {
            crtBootAudioFiredRef.current = true;
            soundEngine.playCrtBoot();
          }
        } else if (elapsed < T_SCENE_C_END) {
          if (stageRef.current !== 'TITLE_ASSEMBLE') setStageSync('TITLE_ASSEMBLE');
          if (
            elapsed > T_SCENE_C_END - 220 &&
            !titleImpactAudioFiredRef.current &&
            !prefersReducedMotion
          ) {
            titleImpactAudioFiredRef.current = true;
            soundEngine.playTitleImpact();
          }
        } else {
          if (stageRef.current !== 'TITLE_READY') setStageSync('TITLE_READY');
        }
      }

      ctx.clearRect(0, 0, w, h);

      // Helper: Draw live Overworld Hub focused on Mission Control Citadel
      const drawHubScene = (freezeFactor: number, zoom: number, pulseSelect: number) => {
        ctx.fillStyle = '#05050D';
        ctx.fillRect(0, 0, w, h);

        const frozenTick = Math.floor(tick * freezeFactor);
        const midX = (startX + (missionsDest.x + missionsDest.width / 2)) * 0.5;
        const midY = (startY + (missionsDest.y + missionsDest.height / 2)) * 0.5;

        for (const s of stars) {
          const sx = ((s.x - midX * 0.15) % w + w) % w;
          const sy = ((s.y - midY * 0.15) % h + h) % h;
          ctx.globalAlpha = 0.35 + 0.45 * Math.sin(frozenTick * 0.04 + s.phase);
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(sx, sy, s.size, s.size);
        }
        ctx.globalAlpha = 1;

        const cloudSprite = getCloudSprite();
        ctx.drawImage(cloudSprite, w * 0.16, 30, cloudSprite.width * 3.5, cloudSprite.height * 3.5);
        ctx.drawImage(cloudSprite, w * 0.7, 50, cloudSprite.width * 3, cloudSprite.height * 3);

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-midX, -midY);

        ctx.fillStyle = '#0B2824';
        ctx.fillRect(72, 92, HUB_WIDTH - 144, HUB_HEIGHT - 178);
        ctx.strokeStyle = '#22FF88';
        ctx.lineWidth = 4;
        ctx.strokeRect(72, 92, HUB_WIDTH - 144, HUB_HEIGHT - 178);

        ctx.lineCap = 'round';
        for (const d of HUB_DESTINATIONS) {
          const isMissions = d.id === 'missions';
          ctx.strokeStyle = isMissions ? '#FFD93D' : '#1E293B';
          ctx.lineWidth = 54;
          ctx.beginPath();
          ctx.moveTo(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y);
          ctx.lineTo(d.doorX, d.doorY + 12);
          ctx.stroke();

          ctx.strokeStyle = '#26334A';
          ctx.lineWidth = 36;
          ctx.beginPath();
          ctx.moveTo(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y);
          ctx.lineTo(d.doorX, d.doorY + 12);
          ctx.stroke();
        }

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y, 148, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5B45B8';
        ctx.lineWidth = 3;
        ctx.stroke();

        const treeSprite = getTreeSprite();
        for (const tr of HUB_TREES) {
          ctx.drawImage(treeSprite, tr.x, tr.y, treeSprite.width * 5, treeSprite.height * 5);
        }
        const lampSprite = getLampSprite();
        for (const lp of HUB_LAMPS) {
          ctx.drawImage(lampSprite, lp.x, lp.y, lampSprite.width * 3.8, lampSprite.height * 3.8);
        }

        for (const dest of HUB_DESTINATIONS) {
          const isTarget = dest.id === 'missions';
          drawLandmarkBuilding(ctx, dest, frozenTick, {
            isNearby: isTarget,
            isHovered: isTarget,
            isSelected: isTarget,
            selectionProgress: isTarget ? pulseSelect : 0,
            isVisited: false,
          });
        }

        // Fox companion + Reacting Meera Sprite
        const foxSpr = getFoxSprite(false);
        ctx.drawImage(foxSpr, startX + 36, startY + 8, foxSpr.width * 3.4, foxSpr.height * 3.4);

        const meeraFrame = pulseSelect < 0.45 ? 'jump' : 'wave';
        const meeraSpr = getMeeraSprite(meeraFrame);
        const hopOffset = Math.sin(Math.min(1, pulseSelect * 2.2) * Math.PI) * 14;
        ctx.drawImage(
          meeraSpr,
          startX - meeraSpr.width * 2.1,
          startY - meeraSpr.height * 4.2 - hopOffset,
          meeraSpr.width * 4.2,
          meeraSpr.height * 4.2
        );

        ctx.restore();
      };

      // =====================================================================
      // STAGE RENDERING
      // =====================================================================
      if (stageRef.current === 'LEAVING_HUB') {
        const tA = Math.min(1, elapsed / T_SCENE_A_END);
        const freezeFactor = tA < 0.36 ? 1 : Math.max(0.04, 1 - (tA - 0.36) * 1.55);
        const camZoom = 1.04 - tA * 0.22; // gentle pullback
        drawHubScene(freezeFactor, camZoom, tA);

        if (tA > 0.32) {
          const distort = (tA - 0.32) / 0.68;
          ctx.fillStyle = `rgba(7, 8, 20, ${distort * 0.28})`;
          for (let y = 0; y < h; y += 6) {
            ctx.fillRect(0, y, w, 2);
          }
          ctx.strokeStyle = `rgba(255, 217, 61, ${distort * 0.28})`;
          ctx.lineWidth = 4;
          ctx.strokeRect(4, 4, w - 8, h - 8);
        }
      } else if (stageRef.current === 'CRT_POWER_ON') {
        const tB = Math.min(1, (elapsed - T_SCENE_A_END) / (T_SCENE_B_END - T_SCENE_A_END));

        ctx.fillStyle = '#070814';
        ctx.fillRect(0, 0, w, h);

        if (tB < 0.32) {
          // 1. Compress vertically into horizontal cathode scan beam
          const compT = tB / 0.32;
          const scaleY = Math.max(0.012, 1 - Math.pow(compT, 0.8));
          const scaleX = 1 - compT * 0.08;
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(scaleX, scaleY);
          ctx.translate(-w / 2, -h / 2);
          drawHubScene(0.04, 0.82, 1);
          ctx.restore();

          ctx.fillStyle = `rgba(255, 248, 224, ${compT * 0.88})`;
          ctx.fillRect(w * 0.05, h / 2 - 2, w * 0.9, 4);
        } else if (tB < 0.48) {
          // 2. Crisp center display spark flash
          const sparkT = (tB - 0.32) / 0.16;
          const sparkRadius = 20 + Math.sin(sparkT * Math.PI) * 58;
          const rg = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, sparkRadius);
          rg.addColorStop(0, '#FFFFFF');
          rg.addColorStop(0.45, '#FFD93D');
          rg.addColorStop(0.8, 'rgba(56, 189, 248, 0.35)');
          rg.addColorStop(1, 'rgba(7, 8, 20, 0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, sparkRadius, 0, Math.PI * 2);
          ctx.fill();

          const lineW = (1 - sparkT * 0.65) * (w * 0.86);
          ctx.fillStyle = '#FFFDF2';
          ctx.fillRect(w / 2 - lineW / 2, h / 2 - 1.5, lineW, 3);
        } else {
          // 3. Expand vertically & horizontally to reveal warm retro Mission Control screen
          const expT = (tB - 0.48) / 0.52;
          const easeExp = 1 - Math.pow(1 - expT, 3);
          const scaleX = 0.86 + easeExp * 0.14;
          const scaleY = 0.02 + easeExp * 0.98;

          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(scaleX, scaleY);
          ctx.translate(-w / 2, -h / 2);
          renderMissionCrtLandscape(ctx, w, h, tick, 0);
          ctx.restore();

          const scanY = (1 - easeExp) * h;
          ctx.fillStyle = `rgba(255, 255, 255, ${(1 - easeExp) * 0.25})`;
          ctx.fillRect(0, scanY, w, 6);
        }
      } else if (stageRef.current === 'TITLE_ASSEMBLE' || stageRef.current === 'TITLE_READY') {
        const assembleT =
          stageRef.current === 'TITLE_READY'
            ? 1
            : Math.min(1, (elapsed - T_SCENE_B_END) / (T_SCENE_C_END - T_SCENE_B_END));

        renderMissionCrtLandscape(ctx, w, h, tick, 0);
        renderMissionTitleTypography(ctx, w, h, subPhrase, mainPhrase, assembleT, 0, tick);
      } else if (stageRef.current === 'ENTERING_PROJECTS') {
        const enterElapsed = enterStartNowRef.current
          ? now - enterStartNowRef.current
          : T_SCENE_E_DURATION;
        const enterT = Math.min(1, enterElapsed / T_SCENE_E_DURATION);

        if (enterT >= 1) {
          finishImmediately();
          return;
        }

        const shatterT = Math.min(1, enterT / 0.72);
        const landscapeZoom = 1 + Math.pow(enterT, 2) * 0.4;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(landscapeZoom, landscapeZoom);
        ctx.translate(-w / 2, -h / 2);
        renderMissionCrtLandscape(ctx, w, h, tick, enterT);
        ctx.restore();

        renderMissionTitleTypography(ctx, w, h, subPhrase, mainPhrase, 1, shatterT, tick);

        // Controlled arcade confirmation flash -> transforms cleanly into Projects midnight world
        if (enterT < 0.24) {
          const flashAlpha = (1 - enterT / 0.24) * 0.52;
          ctx.fillStyle = `rgba(255, 246, 224, ${flashAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
        if (enterT > 0.34) {
          const veilT = (enterT - 0.34) / 0.66;
          ctx.fillStyle = `rgba(7, 8, 20, ${Math.min(0.95, veilT * 0.95)})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [
    finishImmediately,
    mainPhrase,
    playerHubPos,
    prefersReducedMotion,
    setStageSync,
    subPhrase,
  ]);

  const isHubClosing = stage === 'LEAVING_HUB';
  const isEntering = stage === 'ENTERING_PROJECTS';

  return (
    <div className="fixed inset-0 z-50 bg-[#070814] overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Emerging Projects Environment Backdrop revealed smoothly during Scene E push-through */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isEntering ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed inset-0 bg-[#070814]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(255,217,61,0.13), transparent 46%), linear-gradient(to right, rgba(49,37,110,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(49,37,110,0.22) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 56px 56px, 56px 56px',
        }}
      />

      {/* Always-accessible Skip Control */}
      <button
        onClick={finishImmediately}
        className="fixed top-4 right-4 z-40 px-3.5 py-2 bg-[#0B0F1E]/90 hover:bg-[#FFD93D] border border-[#3B4B6B] hover:border-white font-pixel text-[9px] text-[#CBD5E1] hover:text-[#070814] flex items-center gap-2 cursor-pointer transition-colors"
      >
        <span>SKIP [ESC]</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* =================================================================== */}
      {/* SCULPTED VINTAGE CRT TELEVISION & ARCADE CONSOLE CABINET            */}
      {/* =================================================================== */}
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 1.24 }}
        animate={
          isHubClosing
            ? { scale: 1.08, opacity: 1 }
            : isEntering
            ? { scale: 1.54, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={
          isEntering
            ? { duration: 1.18, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        }
        className="relative z-20 w-[94vw] max-w-[1040px] flex flex-col items-center"
      >
        {/* Outer Sculpted Dark Steel-Slate Television Housing */}
        <div className="w-full bg-gradient-to-b from-[#23324D] via-[#172136] to-[#11192B] p-3 sm:p-5 md:p-6 rounded-[28px] sm:rounded-[38px] border-2 border-[#3C4F73] shadow-[0_32px_90px_rgba(0,0,0,0.92),inset_0_2px_0_rgba(255,255,255,0.14)]">
          {/* Inner Recessed Cathode Tube Cavity */}
          <div className="relative bg-[#080B14] p-2 sm:p-3 rounded-[22px] sm:rounded-[30px] shadow-[inset_0_8px_22px_rgba(0,0,0,0.92)] border border-[#0B101D]">
            {/* Curved CRT Glass Display Viewport */}
            <div
              onClick={() => {
                if (
                  stage === 'TITLE_READY' ||
                  stage === 'TITLE_ASSEMBLE' ||
                  stage === 'CRT_POWER_ON'
                ) {
                  triggerEnterProjects();
                }
              }}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[68vh] overflow-hidden rounded-[20px] sm:rounded-[28px] bg-[#070814] cursor-pointer"
            >
              {/* Main Pixel-Art Landscape & Title Canvas */}
              <canvas ref={canvasRef} className="w-full h-full block pixelated" />

              {/* Subtle Horizontal CRT Scanlines Overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, rgba(20, 14, 41, 0) 0px, rgba(20, 14, 41, 0) 2px, rgba(20, 14, 41, 0.11) 3px, rgba(20, 14, 41, 0.11) 4px)',
                }}
              />

              {/* Curved CRT Edge Vignette & Soft Specular Glass Reflection */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[20px] sm:rounded-[28px]"
                style={{
                  boxShadow:
                    'inset 0 0 42px rgba(7, 8, 20, 0.58), inset 0 2px 12px rgba(255,255,255,0.16)',
                }}
              />
              <div className="pointer-events-none absolute top-0 inset-x-8 h-12 bg-gradient-to-b from-white/[0.12] to-transparent rounded-t-[26px]" />

              {/* SCENE D: INTERACTIVE ARCADE PROMPT */}
              {(stage === 'TITLE_READY' || (stage === 'TITLE_ASSEMBLE' && prefersReducedMotion)) && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-x-0 bottom-[16%] sm:bottom-[17%] z-20 flex flex-col items-center px-4 text-center"
                >
                  <button
                    type="button"
                    autoFocus
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerEnterProjects();
                    }}
                    className="pixel-btn group relative px-5 sm:px-7 py-2.5 sm:py-3 bg-[#140E29]/95 hover:bg-[#FFD93D] border-2 border-[#FFD93D] hover:border-white shadow-[0_6px_0_0_#070814] cursor-pointer transition-colors"
                  >
                    <span className="font-pixel text-[10px] sm:text-xs md:text-sm text-[#FFF6E0] group-hover:text-[#070814] tracking-wider flex items-center gap-2.5">
                      <span className="pixel-cursor-blink text-[#22FF88] group-hover:text-[#070814]">
                        ▶
                      </span>
                      <span>PRESS START TO EXPLORE</span>
                    </span>
                  </button>

                  <p className="mt-2.5 font-mono-tab text-[10px] sm:text-[11px] font-semibold text-[#140E29] bg-[#FFF6E0]/85 px-2.5 py-0.5 tracking-wide">
                    CLICK SCREEN · TAP START · PRESS [ENTER] OR [SPACE]
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* INTEGRATED PHYSICAL ARCADE CONTROLS ON LOWER CRT CABINET DECK     */}
          {/* ================================================================= */}
          <div className="relative mt-2.5 sm:mt-3.5 px-4 sm:px-10 pt-1 pb-1 flex items-center justify-between gap-4">
            {/* Left Ball-Top Arcade Joystick */}
            <button
              type="button"
              onClick={triggerEnterProjects}
              onMouseEnter={() => setJoyTilt((t) => ({ ...t, left: -12 }))}
              onMouseLeave={() => setJoyTilt((t) => ({ ...t, left: 0 }))}
              aria-label="Left arcade joystick - press to explore Projects"
              className="group relative flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FFD93D] min-w-[48px] min-h-[48px] justify-end"
            >
              <div
                className="flex flex-col items-center origin-bottom transition-transform duration-150"
                style={{ transform: `rotate(${joyTilt.left}deg)` }}
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FF75B5] via-[#E11D48] to-[#881337] border-2 border-[#111524] shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.35),0_4px_8px_rgba(0,0,0,0.65)] relative">
                  <span className="absolute top-1.5 left-2 w-2 h-1.5 rounded-full bg-white/75" />
                </div>
                <div className="w-2 h-3.5 sm:h-4 bg-gradient-to-r from-[#94A3B8] via-[#E2E8F0] to-[#475569] border-x border-[#0F172A]" />
              </div>
              <div className="w-11 sm:w-14 h-3 rounded-full bg-[#090C16] border-2 border-[#334155] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />
            </button>

            {/* Center Cabinet Nameplate + Physical Illuminated START Button */}
            <div className="flex items-center gap-3 sm:gap-5">
              <span className="hidden sm:inline font-mono-tab text-[10px] text-[#94A3B8] tracking-wider">
                CH-03 · MISSION CONTROL
              </span>

              <button
                type="button"
                onClick={triggerEnterProjects}
                className={`px-4 sm:px-6 py-2 rounded-md border-2 border-[#090D18] font-pixel text-[9px] sm:text-[10px] tracking-wider cursor-pointer transition-all min-h-[44px] flex items-center gap-2 ${
                  startPressed
                    ? 'bg-[#22FF88] text-[#06060E] translate-y-0.5 shadow-none'
                    : 'bg-gradient-to-b from-[#FFD93D] to-[#D97706] hover:from-[#FEF08A] hover:to-[#F59E0B] text-[#070814] shadow-[0_4px_0_0_#78350F,0_6px_14px_rgba(0,0,0,0.6)] active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <span>START</span>
              </button>

              <span className="hidden md:inline font-mono-tab text-[10px] text-[#64748B] tracking-wider">
                ARCADE CRT-94
              </span>
            </div>

            {/* Right Ball-Top Arcade Joystick */}
            <button
              type="button"
              onClick={triggerEnterProjects}
              onMouseEnter={() => setJoyTilt((t) => ({ ...t, right: 12 }))}
              onMouseLeave={() => setJoyTilt((t) => ({ ...t, right: 0 }))}
              aria-label="Right arcade joystick - press to explore Projects"
              className="group relative flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FFD93D] min-w-[48px] min-h-[48px] justify-end"
            >
              <div
                className="flex flex-col items-center origin-bottom transition-transform duration-150"
                style={{ transform: `rotate(${joyTilt.right}deg)` }}
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FF75B5] via-[#E11D48] to-[#881337] border-2 border-[#111524] shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.35),0_4px_8px_rgba(0,0,0,0.65)] relative">
                  <span className="absolute top-1.5 left-2 w-2 h-1.5 rounded-full bg-white/75" />
                </div>
                <div className="w-2 h-3.5 sm:h-4 bg-gradient-to-r from-[#94A3B8] via-[#E2E8F0] to-[#475569] border-x border-[#0F172A]" />
              </div>
              <div className="w-11 sm:w-14 h-3 rounded-full bg-[#090C16] border-2 border-[#334155] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
