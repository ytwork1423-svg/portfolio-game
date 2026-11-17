import React, { useEffect, useRef } from 'react';
import {
  getCloudSprite,
  getCollectibleSprite,
  getFoxSprite,
  getLampSprite,
  getMeeraSprite,
  getTreeSprite,
} from '../game/sprites';
import {
  FOUNTAIN_CENTER,
  HUB_COLLECTIBLES,
  HUB_HEIGHT,
  HUB_ISLAND_BOUNDS,
  HUB_LAMPS,
  HUB_TREES,
  HUB_WIDTH,
} from '../game/overworldMap';
import { drawLandmarkBuilding } from '../game/hubLandmarks';
import { HUB_DESTINATIONS } from '../data/portfolioData';
import { DestinationId, HubCollectible, HubDestination } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export interface HubTouchInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string;
}

interface PlazaRipple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

interface OverworldHubCanvasProps {
  hubPosRef: React.MutableRefObject<{ x: number; y: number }>;
  collectedIds: string[];
  visitedDestinations: DestinationId[];
  focusedDestId?: DestinationId | null;
  secretTrailActive: boolean;
  isOverlayOpen: boolean;
  playEntranceReveal?: boolean;
  touchInputRef: React.MutableRefObject<HubTouchInput>;
  onCollect: (item: HubCollectible) => void;
  onEnterDestination: (dest: HubDestination) => void;
  onPetFox: () => void;
  onInspectFountain: () => void;
  onNearbyDestChange: (dest: HubDestination | null) => void;
  onHoverDestChange?: (id: DestinationId | null) => void;
}

export const OverworldHubCanvas: React.FC<OverworldHubCanvasProps> = ({
  hubPosRef,
  collectedIds,
  visitedDestinations,
  focusedDestId = null,
  secretTrailActive,
  isOverlayOpen,
  playEntranceReveal = false,
  touchInputRef,
  onCollect,
  onEnterDestination,
  onPetFox,
  onInspectFountain,
  onNearbyDestChange,
  onHoverDestChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const collectedSetRef = useRef(new Set(collectedIds));
  const visitedSetRef = useRef(new Set(visitedDestinations));
  const focusedDestIdRef = useRef<DestinationId | null>(focusedDestId);
  const overlayOpenRef = useRef(isOverlayOpen);
  const secretTrailRef = useRef(secretTrailActive);

  useEffect(() => {
    collectedSetRef.current = new Set(collectedIds);
  }, [collectedIds]);

  useEffect(() => {
    visitedSetRef.current = new Set(visitedDestinations);
  }, [visitedDestinations]);

  useEffect(() => {
    focusedDestIdRef.current = focusedDestId;
  }, [focusedDestId]);

  useEffect(() => {
    overlayOpenRef.current = isOverlayOpen;
  }, [isOverlayOpen]);

  useEffect(() => {
    secretTrailRef.current = secretTrailActive;
  }, [secretTrailActive]);

  const callbacksRef = useRef({
    onCollect,
    onEnterDestination,
    onPetFox,
    onInspectFountain,
    onNearbyDestChange,
    onHoverDestChange,
  });

  useEffect(() => {
    callbacksRef.current = {
      onCollect,
      onEnterDestination,
      onPetFox,
      onInspectFountain,
      onNearbyDestChange,
      onHoverDestChange,
    };
  }, [
    onCollect,
    onEnterDestination,
    onPetFox,
    onInspectFountain,
    onNearbyDestChange,
    onHoverDestChange,
  ]);

  const stateRef = useRef({
    x: hubPosRef.current.x,
    y: hubPosRef.current.y,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    walkTarget: null as { x: number; y: number } | null,
    foxX: hubPosRef.current.x - 54,
    foxY: hubPosRef.current.y + 14,
    foxFacing: 1 as 1 | -1,
    foxHappyUntil: 0,
    wasOutsidePlaza: false,
    camX: Math.max(0, hubPosRef.current.x - 700),
    camY: playEntranceReveal ? 60 : Math.max(0, hubPosRef.current.y - 420),
    camZoom: playEntranceReveal ? 1.24 : 1,
    revealProgress: playEntranceReveal ? 0 : 1,
    hoveredDestId: null as DestinationId | null,
    hoveredSpecial: null as 'fox' | 'fountain' | null,
    lastNearbyId: null as DestinationId | null,
    pendingDest: null as HubDestination | null,
    selectionStartNow: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const keys = { up: false, down: false, left: false, right: false };
    const particles: FloatingParticle[] = [];
    const ripples: PlazaRipple[] = [];

    const stars = Array.from({ length: 170 }, (_, i) => ({
      x: (i * 211) % HUB_WIDTH,
      y: (i * 137) % HUB_HEIGHT,
      size: i % 6 === 0 ? 4 : 2,
      phase: i * 0.55,
      color: i % 8 === 0 ? '#FFD93D' : i % 5 === 0 ? '#FF75B5' : '#E2E8F0',
    }));

    const fireflies = Array.from({ length: 22 }, (_, i) => ({
      baseX: 170 + ((i * 257) % (HUB_WIDTH - 340)),
      baseY: 150 + ((i * 193) % (HUB_HEIGHT - 300)),
      phase: i * 0.9,
      color: i % 2 === 0 ? '#22FF88' : '#FFD93D',
    }));

    // Subtle tiny sky-butterflies & ambient wildlife fluttering near trees and edges
    const critters = Array.from({ length: 6 }, (_, i) => ({
      baseX: 230 + ((i * 283) % (HUB_WIDTH - 460)),
      baseY: 220 + ((i * 199) % (HUB_HEIGHT - 440)),
      phase: i * 1.4,
      color: i % 2 === 0 ? '#FF75B5' : '#67E8F9',
    }));

    const clouds = Array.from({ length: 9 }, (_, i) => ({
      x: i * 240 + 40,
      y: 38 + (i % 2) * 920,
      speed: 0.14 + (i % 3) * 0.05,
      scale: 4,
    }));

    const meadowTufts = Array.from({ length: 42 }, (_, i) => ({
      x: 115 + ((i * 179) % (HUB_WIDTH - 230)),
      y: 125 + ((i * 131) % (HUB_HEIGHT - 250)),
      flower: i % 3 === 0 ? '#FF75B5' : i % 3 === 1 ? '#FFD93D' : '#38BDF8',
    }));

    const spawnParticles = (
      x: number,
      y: number,
      count: number,
      color: string,
      text?: string,
      vyBias = 0
    ) => {
      if (text) {
        particles.push({
          x,
          y: y - 18,
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
        const angle = (Math.PI * 2 * i) / Math.max(1, count);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * (0.9 + Math.random() * 1.5),
          vy: Math.sin(angle) * (0.9 + Math.random() * 1.5) + vyBias,
          life: 24 + Math.random() * 14,
          maxLife: 38,
          color,
          size: 4,
        });
      }
    };

    const findNearbyDestination = (px: number, py: number): HubDestination | null => {
      let best: HubDestination | null = null;
      let bestDist = 100;
      for (const d of HUB_DESTINATIONS) {
        const dist = Math.hypot(px - d.doorX, py - d.doorY);
        if (dist < bestDist) {
          best = d;
          bestDist = dist;
        }
      }
      return best;
    };

    const beginDestinationSelection = (dest: HubDestination) => {
      const st = stateRef.current;
      if (st.pendingDest) return;
      soundEngine.playInteract();
      if (prefersReducedMotion) {
        callbacksRef.current.onEnterDestination(dest);
        return;
      }
      st.pendingDest = dest;
      st.selectionStartNow = performance.now();
      st.walkTarget = null;
      st.facing = dest.doorX >= st.x ? 1 : -1;
      ripples.push({
        x: dest.x + dest.width / 2,
        y: dest.y + dest.height * 0.72,
        radius: 28,
        alpha: 0.95,
        color: dest.accentColor,
      });
    };

    const triggerInteract = () => {
      if (overlayOpenRef.current) return;
      const st = stateRef.current;
      const nearby = findNearbyDestination(st.x, st.y);
      if (nearby) {
        beginDestinationSelection(nearby);
        return;
      }
      if (Math.hypot(st.x - st.foxX, st.y - st.foxY) < 76) {
        soundEngine.playStar();
        st.foxHappyUntil = performance.now() + 900;
        spawnParticles(st.foxX, st.foxY - 14, 8, '#FF3E9D', '♥');
        callbacksRef.current.onPetFox();
        return;
      }
      if (Math.hypot(st.x - FOUNTAIN_CENTER.x, st.y - FOUNTAIN_CENTER.y) < 104) {
        soundEngine.playInteract();
        ripples.push({
          x: FOUNTAIN_CENTER.x,
          y: FOUNTAIN_CENTER.y,
          radius: 36,
          alpha: 0.9,
          color: '#38BDF8',
        });
        callbacksRef.current.onInspectFountain();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (overlayOpenRef.current) return;
      const st = stateRef.current;
      if (st.pendingDest) return;
      st.revealProgress = 1;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        st.walkTarget = null;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
        st.walkTarget = null;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.up = true;
        st.walkTarget = null;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keys.down = true;
        st.walkTarget = null;
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        if (e.key === ' ') e.preventDefault();
        triggerInteract();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    };

    const onCanvasClick = (e: MouseEvent) => {
      if (overlayOpenRef.current) return;
      const st = stateRef.current;
      if (st.pendingDest) return;
      st.revealProgress = 1;
      const rect = canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + st.camX;
      const worldY = e.clientY - rect.top + st.camY;

      if (Math.hypot(worldX - st.foxX, worldY - st.foxY) < 40) {
        soundEngine.playStar();
        st.foxHappyUntil = performance.now() + 900;
        spawnParticles(st.foxX, st.foxY - 14, 10, '#FF3E9D', '♥');
        callbacksRef.current.onPetFox();
        return;
      }

      if (Math.hypot(worldX - FOUNTAIN_CENTER.x, worldY - FOUNTAIN_CENTER.y) < 62) {
        soundEngine.playInteract();
        ripples.push({
          x: FOUNTAIN_CENTER.x,
          y: FOUNTAIN_CENTER.y,
          radius: 36,
          alpha: 0.9,
          color: '#38BDF8',
        });
        callbacksRef.current.onInspectFountain();
        return;
      }

      for (const dest of HUB_DESTINATIONS) {
        if (
          worldX >= dest.x - 16 &&
          worldX <= dest.x + dest.width + 16 &&
          worldY >= dest.y - 64 &&
          worldY <= dest.y + dest.height + 28
        ) {
          beginDestinationSelection(dest);
          return;
        }
      }

      st.walkTarget = {
        x: Math.max(HUB_ISLAND_BOUNDS.minX, Math.min(HUB_ISLAND_BOUNDS.maxX, worldX)),
        y: Math.max(HUB_ISLAND_BOUNDS.minY, Math.min(HUB_ISLAND_BOUNDS.maxY, worldY)),
      };
    };

    const onCanvasMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const st = stateRef.current;
      const worldX = e.clientX - rect.left + st.camX;
      const worldY = e.clientY - rect.top + st.camY;

      let hoveredDest: DestinationId | null = null;
      for (const dest of HUB_DESTINATIONS) {
        if (
          worldX >= dest.x - 16 &&
          worldX <= dest.x + dest.width + 16 &&
          worldY >= dest.y - 64 &&
          worldY <= dest.y + dest.height + 28
        ) {
          hoveredDest = dest.id;
          break;
        }
      }
      if (st.hoveredDestId !== hoveredDest) {
        st.hoveredDestId = hoveredDest;
        callbacksRef.current.onHoverDestChange?.(hoveredDest);
      }

      if (!hoveredDest && Math.hypot(worldX - st.foxX, worldY - st.foxY) < 40) {
        st.hoveredSpecial = 'fox';
      } else if (
        !hoveredDest &&
        Math.hypot(worldX - FOUNTAIN_CENTER.x, worldY - FOUNTAIN_CENTER.y) < 62
      ) {
        st.hoveredSpecial = 'fountain';
      } else {
        st.hoveredSpecial = null;
      }

      canvas.style.cursor = hoveredDest || st.hoveredSpecial ? 'pointer' : 'default';
    };

    const onCanvasLeave = () => {
      const st = stateRef.current;
      if (st.hoveredDestId !== null) {
        st.hoveredDestId = null;
        callbacksRef.current.onHoverDestChange?.(null);
      }
      st.hoveredSpecial = null;
      canvas.style.cursor = 'default';
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMove);
    canvas.addEventListener('mouseleave', onCanvasLeave);

    let animId = 0;
    let tick = 0;

    const loop = (now: number) => {
      tick++;
      const st = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Selection activation beat before entering destination
      let selectionProgress = 0;
      if (st.pendingDest) {
        selectionProgress = Math.min(1, (now - st.selectionStartNow) / 340);
        if (selectionProgress >= 1) {
          const target = st.pendingDest;
          st.pendingDest = null;
          callbacksRef.current.onEnterDestination(target);
        }
      }

      // Entrance reveal zoom
      if (st.revealProgress < 1) {
        st.revealProgress = Math.min(1, st.revealProgress + 0.018);
      }
      const selectionZoom = st.pendingDest ? selectionProgress * 0.075 : 0;
      const targetZoom = 1 + (1 - st.revealProgress) * 0.22 + selectionZoom;
      st.camZoom += (targetZoom - st.camZoom) * 0.12;

      const activeFocusId = st.pendingDest?.id || st.hoveredDestId || focusedDestIdRef.current;
      const focusedDest = activeFocusId
        ? HUB_DESTINATIONS.find((d) => d.id === activeFocusId) || null
        : null;

      if (!overlayOpenRef.current && !st.pendingDest) {
        const touch = touchInputRef.current;
        let dx = 0;
        let dy = 0;
        if (keys.left || touch.left) dx -= 1;
        if (keys.right || touch.right) dx += 1;
        if (keys.up || touch.up) dy -= 1;
        if (keys.down || touch.down) dy += 1;

        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          st.vx = (dx / len) * 5.0;
          st.vy = (dy / len) * 5.0;
          if (dx !== 0) st.facing = dx > 0 ? 1 : -1;
        } else if (st.walkTarget) {
          const tdx = st.walkTarget.x - st.x;
          const tdy = st.walkTarget.y - st.y;
          const dist = Math.hypot(tdx, tdy);
          if (dist < 6) {
            st.vx = 0;
            st.vy = 0;
            st.walkTarget = null;
          } else {
            st.vx = (tdx / dist) * 4.8;
            st.vy = (tdy / dist) * 4.8;
            if (Math.abs(tdx) > 2) st.facing = tdx > 0 ? 1 : -1;
          }
        } else {
          st.vx *= 0.65;
          st.vy *= 0.65;
          if (Math.abs(st.vx) < 0.1) st.vx = 0;
          if (Math.abs(st.vy) < 0.1) st.vy = 0;

          // Subtle protagonist reaction: turn toward hovered/focused destination while standing
          if (focusedDest) {
            st.facing = focusedDest.doorX >= st.x ? 1 : -1;
          }
        }

        const nextX = Math.max(
          HUB_ISLAND_BOUNDS.minX,
          Math.min(HUB_ISLAND_BOUNDS.maxX, st.x + st.vx)
        );
        const nextY = Math.max(
          HUB_ISLAND_BOUNDS.minY,
          Math.min(HUB_ISLAND_BOUNDS.maxY, st.y + st.vy)
        );

        const collides = (tx: number, ty: number) => {
          if (Math.hypot(tx - FOUNTAIN_CENTER.x, ty - FOUNTAIN_CENTER.y) < 52) return true;
          for (const d of HUB_DESTINATIONS) {
            if (
              tx > d.x + 10 &&
              tx < d.x + d.width - 10 &&
              ty > d.y + 30 &&
              ty < d.y + d.height - 6
            ) {
              return true;
            }
          }
          return false;
        };

        if (!collides(nextX, st.y)) st.x = nextX;
        if (!collides(st.x, nextY)) st.y = nextY;

        hubPosRef.current = { x: st.x, y: st.y };

        // Subtle movement reactions: light footstep dust & secret trail
        const speed = Math.hypot(st.vx, st.vy);
        if (speed > 1.2) {
          if (tick % 9 === 0 && !prefersReducedMotion) {
            particles.push({
              x: st.x - st.facing * 8 + (Math.random() - 0.5) * 8,
              y: st.y + 14,
              vx: -st.vx * 0.12,
              vy: -0.35 - Math.random() * 0.35,
              life: 16,
              maxLife: 16,
              color: 'rgba(203, 213, 225, 0.55)',
              size: 4,
            });
          }
          if (secretTrailRef.current && tick % 5 === 0) {
            const colors = ['#FF3E9D', '#22FF88', '#FFD93D', '#38BDF8'];
            spawnParticles(st.x, st.y, 1, colors[tick % colors.length]);
          }
        }

        // Subtle animation when returning to Central Plaza
        const distFromPlaza = Math.hypot(st.x - FOUNTAIN_CENTER.x, st.y - FOUNTAIN_CENTER.y);
        if (distFromPlaza > 185) {
          st.wasOutsidePlaza = true;
        } else if (st.wasOutsidePlaza && distFromPlaza < 105) {
          st.wasOutsidePlaza = false;
          st.foxHappyUntil = now + 750;
          if (!prefersReducedMotion) {
            ripples.push({
              x: FOUNTAIN_CENTER.x,
              y: FOUNTAIN_CENTER.y,
              radius: 44,
              alpha: 0.72,
              color: '#22FF88',
            });
          }
        }

        // Expressive Pixel Fox Companion movement (orbits gently when standing in Plaza, trots behind when walking)
        const desiredFoxX =
          speed > 0.35
            ? st.x - st.facing * 54
            : st.x - st.facing * 52 + Math.cos(tick * 0.025) * 10;
        const desiredFoxY =
          speed > 0.35 ? st.y + 12 : st.y + 14 + Math.sin(tick * 0.03) * 4;
        const fdx = desiredFoxX - st.foxX;
        const fdy = desiredFoxY - st.foxY;
        if (Math.hypot(fdx, fdy) > 3) {
          st.foxX += fdx * 0.09;
          st.foxY += fdy * 0.09;
          if (Math.abs(fdx) > 1.2) st.foxFacing = fdx > 0 ? 1 : -1;
        } else {
          st.foxFacing = st.facing;
        }

        // Collectibles
        for (const item of HUB_COLLECTIBLES) {
          if (collectedSetRef.current.has(item.id)) continue;
          if (Math.hypot(st.x - item.x, st.y - item.y) < 38) {
            collectedSetRef.current.add(item.id);
            if (item.kind === 'secret_key') {
              soundEngine.playSecret();
              spawnParticles(item.x, item.y, 16, '#FFD93D', `+${item.xpValue} XP SECRET!`);
            } else if (item.kind === 'star' || item.kind === 'glitch_gem') {
              soundEngine.playStar();
              spawnParticles(item.x, item.y, 10, '#FFD93D', `+${item.xpValue} XP`);
            } else {
              soundEngine.playCoin();
              spawnParticles(item.x, item.y, 6, '#FFD93D', `+${item.xpValue} XP`);
            }
            callbacksRef.current.onCollect(item);
          }
        }

        const nearby = findNearbyDestination(st.x, st.y);
        const nearbyId = nearby ? nearby.id : null;
        if (nearbyId !== st.lastNearbyId) {
          st.lastNearbyId = nearbyId;
          callbacksRef.current.onNearbyDestChange(nearby);
        }
      }

      // Smooth Cinematic Camera Response:
      // gentle lead with movement + subtle shift toward hovered/selected destination
      let camFocusX = st.x + st.vx * 9;
      let camFocusY = st.y + st.vy * 9;
      if (st.pendingDest) {
        camFocusX = st.x + (st.pendingDest.doorX - st.x) * 0.35;
        camFocusY = st.y + (st.pendingDest.doorY - st.y) * 0.35;
      } else if (focusedDest && !prefersReducedMotion) {
        const shiftX = Math.max(-36, Math.min(36, (focusedDest.doorX - st.x) * 0.07));
        const shiftY = Math.max(-28, Math.min(28, (focusedDest.doorY - st.y) * 0.07));
        camFocusX += shiftX;
        camFocusY += shiftY;
      }

      const targetCamX = Math.max(0, Math.min(HUB_WIDTH - w, camFocusX - w / 2));
      const targetCamY = Math.max(0, Math.min(HUB_HEIGHT - h, camFocusY - h / 2));
      st.camX += (targetCamX - st.camX) * 0.1;
      st.camY += (targetCamY - st.camY) * 0.1;

      // --- RENDER LIVING OVERWORLD ---
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#05050D';
      ctx.fillRect(0, 0, w, h);

      // Layer 1: Parallax Starfield
      for (const s of stars) {
        const sx = Math.floor(s.x - st.camX * 0.2);
        const sy = Math.floor(s.y - st.camY * 0.2);
        const wrappedX = ((sx % w) + w) % w;
        const wrappedY = ((sy % h) + h) % h;
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(tick * 0.03 + s.phase));
        ctx.fillStyle = s.color;
        ctx.fillRect(wrappedX, wrappedY, s.size, s.size);
      }
      ctx.globalAlpha = 1;

      // Layer 2: Distant Parallax Citadel & Mountain Ridge behind sky-island
      ctx.fillStyle = '#0D0B1F';
      for (let mx = -120; mx < w + 220; mx += 180) {
        const ridgeH = 95 + ((Math.abs(mx) * 29) % 75);
        const rx = mx - ((st.camX * 0.14) % 180);
        ctx.fillRect(rx, h - ridgeH, 145, ridgeH);
        ctx.fillRect(rx + 36, h - ridgeH - 20, 70, 20);
      }

      // Parallax Distant Pixel Moon
      const moonX = Math.floor(w * 0.85 - st.camX * 0.06);
      const moonY = Math.floor(96 - st.camY * 0.04);
      ctx.fillStyle = 'rgba(255, 217, 61, 0.14)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(moonX - 18, moonY - 18, 36, 36);

      // Layer 3: Drifting Pixel Clouds
      const cloudSprite = getCloudSprite();
      for (const c of clouds) {
        if (!prefersReducedMotion) c.x = (c.x + c.speed) % (HUB_WIDTH + 200);
        const cx = Math.floor(c.x - 100 - st.camX * 0.5);
        const cy = Math.floor(c.y - st.camY * 0.5);
        ctx.drawImage(
          cloudSprite,
          cx,
          cy,
          cloudSprite.width * c.scale,
          cloudSprite.height * c.scale
        );
      }

      // World Camera Transform (including Pull-Back Entrance Zoom & Selection Zoom)
      ctx.save();
      if (Math.abs(st.camZoom - 1) > 0.002) {
        ctx.translate(w / 2, h / 2);
        ctx.scale(st.camZoom, st.camZoom);
        ctx.translate(-w / 2, -h / 2);
      }
      ctx.translate(-Math.floor(st.camX), -Math.floor(st.camY));

      // Floating Sky-Island Base & Stratified Cliff
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(60, 110, HUB_WIDTH - 120, HUB_HEIGHT - 156);
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(60, HUB_HEIGHT - 74, HUB_WIDTH - 120, 34);
      ctx.fillStyle = '#31256E';
      ctx.fillRect(60, HUB_HEIGHT - 74, HUB_WIDTH - 120, 6);

      // Flowing Cyan Energy Waterfalls off southern cliff edges
      const wfOffset = (tick * 2) % 24;
      for (const wx of [340, 1440]) {
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(wx, HUB_HEIGHT - 88, 38, 68);
        ctx.fillStyle = '#67E8F9';
        for (let wy = 0; wy < 54; wy += 16) {
          ctx.fillRect(wx + 6, HUB_HEIGHT - 84 + ((wy + wfOffset) % 54), 10, 8);
          ctx.fillRect(wx + 22, HUB_HEIGHT - 84 + ((wy + wfOffset + 8) % 54), 8, 8);
        }
        // Mist sparkle at waterfall lip
        ctx.fillStyle = 'rgba(165, 243, 252, 0.55)';
        ctx.fillRect(wx - 4 + Math.sin(tick * 0.1) * 4, HUB_HEIGHT - 22, 46, 6);
      }

      // Lush Meadow Turf + Tiny Textured Flower Tufts
      ctx.fillStyle = '#0B2824';
      ctx.fillRect(72, 92, HUB_WIDTH - 144, HUB_HEIGHT - 178);
      ctx.fillStyle = '#114541';
      for (let gx = 100; gx < HUB_WIDTH - 120; gx += 76) {
        for (let gy = 120; gy < HUB_HEIGHT - 120; gy += 72) {
          ctx.fillRect(gx, gy, 8, 4);
          ctx.fillRect(gx + 12, gy + 6, 6, 4);
        }
      }
      for (const ft of meadowTufts) {
        ctx.fillStyle = '#134E4A';
        ctx.fillRect(ft.x, ft.y, 10, 5);
        ctx.fillStyle = ft.flower;
        ctx.fillRect(ft.x + 3, ft.y - 3, 4, 4);
      }
      ctx.strokeStyle = '#22FF88';
      ctx.lineWidth = 4;
      ctx.strokeRect(72, 92, HUB_WIDTH - 144, HUB_HEIGHT - 178);

      // Radial Cobblestone Avenues + Illuminated Guide Lights
      ctx.lineCap = 'round';
      for (const d of HUB_DESTINATIONS) {
        const roadLit = activeFocusId === d.id || st.lastNearbyId === d.id;

        // Road curb & asphalt
        ctx.strokeStyle = roadLit ? d.accentColor : '#1E293B';
        ctx.globalAlpha = roadLit ? 0.55 : 1;
        ctx.lineWidth = 54;
        ctx.beginPath();
        ctx.moveTo(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y);
        ctx.lineTo(d.doorX, d.doorY + 12);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = '#26334A';
        ctx.lineWidth = 36;
        ctx.beginPath();
        ctx.moveTo(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y);
        ctx.lineTo(d.doorX, d.doorY + 12);
        ctx.stroke();

        // Subtle cobblestone dashes + traveling road lights when hovered/focused
        const steps = 7;
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          const px = FOUNTAIN_CENTER.x + (d.doorX - FOUNTAIN_CENTER.x) * t;
          const py = FOUNTAIN_CENTER.y + (d.doorY + 12 - FOUNTAIN_CENTER.y) * t;
          const pulseWave = ((tick * 0.08 - s * 0.5) % 4 + 4) % 4 < 1.2;

          if (roadLit) {
            ctx.fillStyle = d.accentColor;
            ctx.globalAlpha = pulseWave ? 0.95 : 0.45;
            ctx.fillRect(px - 5, py - 5, 10, 10);
          } else {
            ctx.fillStyle = '#475569';
            ctx.globalAlpha = 0.65;
            ctx.fillRect(px - 3, py - 3, 6, 6);
          }
        }
        ctx.globalAlpha = 1;
      }

      // Upgraded Central Circular Plaza (Multi-Tier Visual Anchor)
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y, 148, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5B45B8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner mosaic ring
      ctx.fillStyle = '#151B31';
      ctx.beginPath();
      ctx.arc(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y, 104, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Compass cardinal stone markers on plaza ring
      for (let c = 0; c < 4; c++) {
        const ang = (c * Math.PI) / 2;
        const mx = FOUNTAIN_CENTER.x + Math.cos(ang) * 124;
        const my = FOUNTAIN_CENTER.y + Math.sin(ang) * 124;
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(mx - 4, my - 4, 8, 8);
      }

      // Subtle rotating energy dots around central fountain basin
      for (let e = 0; e < 8; e++) {
        const ang = tick * 0.018 + (e * Math.PI) / 4;
        const ex = FOUNTAIN_CENTER.x + Math.cos(ang) * 58;
        const ey = FOUNTAIN_CENTER.y + Math.sin(ang) * 58;
        ctx.fillStyle = e % 2 === 0 ? '#22FF88' : '#38BDF8';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(ex - 2, ey - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      // Illuminated Fountain Basin with animated cyan water
      ctx.fillStyle = '#0B1328';
      ctx.beginPath();
      ctx.arc(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = st.hoveredSpecial === 'fountain' ? '#FFFFFF' : '#38BDF8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shimmering water highlight inside fountain
      const waterR = 32 + Math.sin(tick * 0.08) * 3;
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y, waterR, 0, Math.PI * 2);
      ctx.stroke();

      // Floating Central Compass Crystal
      const crystalBob = Math.sin(tick * 0.08) * 4;
      ctx.fillStyle = '#22FF88';
      ctx.fillRect(FOUNTAIN_CENTER.x - 11, FOUNTAIN_CENTER.y - 20 + crystalBob, 22, 22);
      ctx.fillStyle = '#FF3E9D';
      ctx.fillRect(FOUNTAIN_CENTER.x - 5, FOUNTAIN_CENTER.y - 14 + crystalBob, 10, 10);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CENTRAL PLAZA · MEERA’S UNIVERSE', FOUNTAIN_CENTER.x, FOUNTAIN_CENTER.y + 72);
      ctx.textAlign = 'left';

      // Plaza Return & Selection Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += 5.5;
        rp.alpha *= 0.92;
        if (rp.alpha < 0.04) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = rp.color;
        ctx.globalAlpha = rp.alpha;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Trees with subtle natural wind sway + Lamps with soft pulsing light pools
      const treeSprite = getTreeSprite();
      for (const tr of HUB_TREES) {
        const sway = prefersReducedMotion ? 0 : Math.sin(tick * 0.035 + tr.x * 0.02) * 1.8;
        ctx.drawImage(
          treeSprite,
          tr.x + sway,
          tr.y,
          treeSprite.width * 5.2,
          treeSprite.height * 5.2
        );
      }

      const lampSprite = getLampSprite();
      for (const lp of HUB_LAMPS) {
        const poolPulse = 28 + Math.sin(tick * 0.06 + lp.x) * 3;
        ctx.fillStyle = 'rgba(103, 232, 249, 0.14)';
        ctx.beginPath();
        ctx.arc(lp.x + 28, lp.y + 44, poolPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(lampSprite, lp.x, lp.y, lampSprite.width * 4, lampSprite.height * 4);
      }

      // Draw 6 Distinctive Game Locations
      for (const dest of HUB_DESTINATIONS) {
        const isSel = st.pendingDest?.id === dest.id;
        drawLandmarkBuilding(ctx, dest, tick, {
          isNearby: st.lastNearbyId === dest.id,
          isHovered: st.hoveredDestId === dest.id || focusedDestIdRef.current === dest.id,
          isSelected: isSel,
          selectionProgress: isSel ? selectionProgress : 0,
          isVisited: visitedSetRef.current.has(dest.id),
        });
      }

      // Collectibles
      for (const item of HUB_COLLECTIBLES) {
        if (collectedSetRef.current.has(item.id)) continue;
        const bob = Math.sin(tick * 0.07 + item.x * 0.01) * 4;
        const sprite = getCollectibleSprite(item.kind, tick);
        const scale = item.kind === 'secret_key' ? 3.2 : 2.6;
        ctx.drawImage(
          sprite,
          item.x - (sprite.width * scale) / 2,
          item.y - (sprite.height * scale) / 2 + bob,
          sprite.width * scale,
          sprite.height * scale
        );
      }

      // Ambient Drifting Fireflies & Tiny Fluttering Critters
      for (const ff of fireflies) {
        const fx = ff.baseX + Math.sin(tick * 0.02 + ff.phase) * 28;
        const fy = ff.baseY + Math.cos(tick * 0.025 + ff.phase) * 18;
        ctx.globalAlpha = 0.4 + 0.55 * Math.abs(Math.sin(tick * 0.05 + ff.phase));
        ctx.fillStyle = ff.color;
        ctx.fillRect(Math.floor(fx), Math.floor(fy), 4, 4);
      }
      for (const cr of critters) {
        const cx = cr.baseX + Math.sin(tick * 0.03 + cr.phase) * 46;
        const cy = cr.baseY + Math.cos(tick * 0.045 + cr.phase) * 22;
        const wing = Math.floor(tick / 6) % 2 === 0 ? 4 : 2;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = cr.color;
        ctx.fillRect(Math.floor(cx - wing), Math.floor(cy), wing * 2 + 2, 3);
      }
      ctx.globalAlpha = 1;

      if (st.walkTarget) {
        ctx.strokeStyle = '#22FF88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(st.walkTarget.x, st.walkTarget.y, 10 + Math.sin(tick * 0.2) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Expressive Pixel Fox Companion (scaled up cleanly to pair with prominent Meera)
      const foxMoving = Math.hypot(st.x - st.facing * 52 - st.foxX, st.y + 14 - st.foxY) > 6;
      const foxHop = now < st.foxHappyUntil ? Math.abs(Math.sin(now * 0.018)) * 12 : 0;
      const foxSprite = getFoxSprite(
        (foxMoving || now < st.foxHappyUntil) && Math.floor(tick / 8) % 2 === 0
      );
      const fw = foxSprite.width * 3.5;
      const fh = foxSprite.height * 3.5;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(st.foxX, st.foxY + 10, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(Math.floor(st.foxX), Math.floor(st.foxY - fh / 2 - foxHop));
      if (st.foxFacing === -1) ctx.scale(-1, 1);
      ctx.drawImage(foxSprite, -fw / 2, 0, fw, fh);
      ctx.restore();

      // Prominent Player Character (Exact Sprite, Larger Hero Scale ~4.4x, Breathing & Reactions)
      const isMoving = Math.hypot(st.vx, st.vy) > 0.35;
      const periodicWave = !isMoving && !st.pendingDest && Math.floor(tick / 110) % 5 === 1;
      const hoverWave = !isMoving && Boolean(focusedDest) && Math.floor(tick / 40) % 2 === 0;
      const meeraFrame = st.pendingDest
        ? 'jump'
        : isMoving
        ? Math.floor(tick / 8) % 2 === 0
          ? 'walk1'
          : 'walk2'
        : hoverWave || periodicWave
        ? 'wave'
        : Math.floor(tick / 26) % 2 === 0
        ? 'idle1'
        : 'idle2';

      const meeraSprite = getMeeraSprite(meeraFrame);
      const mw = meeraSprite.width * 4.4;
      const mh = meeraSprite.height * 4.4;
      const breathBob = isMoving || st.pendingDest ? 0 : Math.sin(tick * 0.08) * 1.4;
      const selectJump = st.pendingDest ? Math.sin(selectionProgress * Math.PI) * 18 : 0;

      // Subtle protagonist ring & crisp shadow beneath Meera's boots
      ctx.strokeStyle = 'rgba(34, 255, 136, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(st.x, st.y + 18, 26, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.beginPath();
      ctx.ellipse(st.x, st.y + 18, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(Math.floor(st.x), Math.floor(st.y - mh + 20 + breathBob - selectJump));
      if (st.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(meeraSprite, -mw / 2, 0, mw, mh);
      ctx.restore();

      // Floating World Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
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
          ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        }
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // Upgraded Mini-Map Radar (bottom-right, crisp proportions & explored/focused feedback)
      if (w >= 768) {
        const mapW = 208;
        const mapH = 126;
        const mx = w - mapW - 20;
        const my = h - mapH - 20;

        ctx.fillStyle = 'rgba(6, 6, 14, 0.92)';
        ctx.fillRect(mx, my, mapW, mapH);
        ctx.strokeStyle = '#3B307D';
        ctx.lineWidth = 2;
        ctx.strokeRect(mx, my, mapW, mapH);

        // Faint island outline & radial spokes on radar
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        const fmx = mx + (FOUNTAIN_CENTER.x / HUB_WIDTH) * mapW;
        const fmy = my + (FOUNTAIN_CENTER.y / HUB_HEIGHT) * mapH;
        for (const d of HUB_DESTINATIONS) {
          const dx = mx + (d.doorX / HUB_WIDTH) * mapW;
          const dy = my + (d.doorY / HUB_HEIGHT) * mapH;
          ctx.beginPath();
          ctx.moveTo(fmx, fmy);
          ctx.lineTo(dx, dy);
          ctx.stroke();

          const isExp = visitedSetRef.current.has(d.id);
          const isTarget = activeFocusId === d.id;
          ctx.fillStyle = d.accentColor;
          ctx.globalAlpha = isExp || isTarget ? 1 : 0.65;
          ctx.fillRect(dx - 4, dy - 4, 8, 8);
          ctx.globalAlpha = 1;

          if (isTarget) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(dx - 6, dy - 6, 12, 12);
          }
        }

        // Player beacon on radar
        const px = mx + (st.x / HUB_WIDTH) * mapW;
        const py = my + (st.y / HUB_HEIGHT) * mapH;
        ctx.fillStyle = '#22FF88';
        ctx.fillRect(px - 4, py - 4, 8, 8);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px - 2, py - 2, 4, 4);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('TOWN RADAR', mx + 10, my + 15);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onCanvasClick);
      canvas.removeEventListener('mousemove', onCanvasMove);
      canvas.removeEventListener('mouseleave', onCanvasLeave);
    };
  }, [hubPosRef, touchInputRef, playEntranceReveal]);

  return <canvas ref={canvasRef} className="w-full h-full block pixelated select-none" />;
};
