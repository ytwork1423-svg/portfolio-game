import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Pause,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HUB_DESTINATIONS } from '../data/portfolioData';
import { DestinationId, HubDestination } from '../types/game';
import { HUB_COLLECTIBLES } from '../game/overworldMap';
import { HubTouchInput } from './OverworldHubCanvas';

interface GameHUDProps {
  mode: 'HUB' | 'DESTINATION';
  activeDestinationId: DestinationId | null;
  focusedDestId?: DestinationId | null;
  visitedDestinations?: DestinationId[];
  xp: number;
  collectedCount: number;
  visitedCount: number;
  nearbyDest: HubDestination | null;
  muted: boolean;
  touchInputRef?: React.MutableRefObject<HubTouchInput>;
  onSelectDestination: (dest: HubDestination) => void;
  onHoverDestination?: (id: DestinationId | null) => void;
  onReturnToHub: () => void;
  onOpenPause: () => void;
  onToggleMute: () => void;
  onActivateNearby?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  activeDestinationId,
  focusedDestId = null,
  visitedDestinations = [],
  xp,
  collectedCount,
  visitedCount,
  nearbyDest,
  muted,
  touchInputRef,
  onSelectDestination,
  onHoverDestination,
  onReturnToHub,
  onOpenPause,
  onToggleMute,
  onActivateNearby,
}) => {
  const [mapOpen, setMapOpen] = useState(false);

  const activeDest = activeDestinationId
    ? HUB_DESTINATIONS.find((d) => d.id === activeDestinationId) || null
    : null;

  const focusedDest =
    mode === 'HUB' && focusedDestId
      ? HUB_DESTINATIONS.find((d) => d.id === focusedDestId) || null
      : null;

  const playerRank = Math.floor(xp / 180) + 1;
  const rankProgress = ((xp % 180) / 180) * 100;
  const totalCollectibles = HUB_COLLECTIBLES.length;

  const setTouch = (key: keyof HubTouchInput, val: boolean) => {
    if (!touchInputRef) return;
    touchInputRef.current[key] = val;
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-6 pt-3 pointer-events-none">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 bg-[#06060E]/94 backdrop-blur-sm border-2 border-[#31256E] px-3.5 sm:px-5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.75)] pointer-events-auto">
          {/* Left Zone: Return to Hub (when inside destination) + Destination Map */}
          <div className="relative flex items-center gap-2.5 min-w-0">
            {mode === 'DESTINATION' && (
              <button
                onClick={onReturnToHub}
                className="pixel-btn flex items-center gap-1.5 bg-[#22FF88] hover:bg-[#4ADE80] text-[#06060E] border-2 border-white px-3 py-2 font-pixel text-[9px] cursor-pointer whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">OVERWORLD HUB</span>
                <span className="sm:hidden">HUB</span>
              </button>
            )}

            <button
              onClick={() => setMapOpen((o) => !o)}
              className="pixel-btn flex items-center gap-2 bg-[#14112B] hover:bg-[#231C4A] border-2 border-[#38BDF8] px-3.5 py-2 text-left cursor-pointer whitespace-nowrap shrink-0"
              aria-expanded={mapOpen}
            >
              <Compass className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span className="font-pixel text-[9px] text-[#38BDF8]">
                {activeDest ? activeDest.title.toUpperCase() : 'DESTINATION MAP'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-150 ${
                  mapOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mapOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-[#090916] border-3 border-[#38BDF8] shadow-[6px_6px_0_0_#000] p-3.5 z-50">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#31256E]">
                  <span className="font-pixel text-[10px] text-[#38BDF8]">
                    FAST TRAVEL · 6 WORLDS
                  </span>
                  <button
                    onClick={() => setMapOpen(false)}
                    className="text-xs text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {mode === 'DESTINATION' && (
                  <button
                    onClick={() => {
                      setMapOpen(false);
                      onReturnToHub();
                    }}
                    className="w-full text-left px-3 py-2 mb-2 bg-[#191536] border border-[#22FF88] text-xs font-semibold text-[#22FF88] hover:bg-[#22FF88] hover:text-[#06060E] transition-colors cursor-pointer"
                  >
                    ← Return to Central Overworld Town
                  </button>
                )}

                <div className="grid grid-cols-1 gap-1.5">
                  {HUB_DESTINATIONS.map((d) => {
                    const isHere = d.id === activeDestinationId;
                    const isExplored = visitedDestinations.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          setMapOpen(false);
                          onSelectDestination(d);
                        }}
                        onMouseEnter={() => onHoverDestination?.(d.id)}
                        onMouseLeave={() => onHoverDestination?.(null)}
                        className={`w-full text-left px-3 py-2 border transition-colors cursor-pointer ${
                          isHere
                            ? 'bg-[#191536] border-white text-white'
                            : 'bg-[#121126] border-[#31256E] text-[#CBD5E1] hover:border-[#FF3E9D] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-[9px]" style={{ color: d.accentColor }}>
                            {d.title.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                            {isExplored && <Check className="w-3 h-3 text-[#22FF88]" />}
                            <span>{d.shortLabel}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{d.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center Zone: XP Progress + Destinations & Collectibles */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="font-pixel text-[10px] text-[#FFD93D]">LV {playerRank}</span>
              <div className="w-32 h-3.5 bg-[#121126] border-2 border-[#5B45B8] p-0.5">
                <div
                  className="h-full bg-[#22FF88] transition-all duration-300"
                  style={{ width: `${Math.max(10, rankProgress)}%` }}
                />
              </div>
              <span className="font-mono-tab text-xs font-semibold text-[#22FF88]">{xp} XP</span>
            </div>

            <div className="h-4 w-px bg-[#31256E]" />

            <div className="flex items-center gap-4 text-xs font-mono-tab text-[#CBD5E1]">
              <span>
                Worlds: <strong className="text-white">{visitedCount}/6</strong>
              </span>
              <span className="text-[#FFD93D]">
                ★ {collectedCount}/{totalCollectibles}
              </span>
            </div>
          </div>

          {/* Right Zone: Audio & Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleMute}
              className="pixel-btn bg-[#14112B] hover:bg-[#231C4A] border-2 border-[#5B45B8] p-2 text-white cursor-pointer"
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-[#94A3B8]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#22FF88]" />
              )}
            </button>

            <button
              onClick={onOpenPause}
              className="pixel-btn flex items-center gap-1.5 bg-[#14112B] hover:bg-[#231C4A] border-2 border-[#FF3E9D] px-3.5 py-2 text-white cursor-pointer whitespace-nowrap"
            >
              <Pause className="w-4 h-4 text-[#FFD93D]" />
              <span className="hidden sm:inline font-pixel text-[9px]">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* Compact Hover/Focus Destination Preview Card (Desktop bottom-left, never obstructs center plaza or minimap) */}
      {mode === 'HUB' && focusedDest && (
        <div className="hidden md:block fixed bottom-28 left-5 z-20 w-80 bg-[#070713]/95 border-2 px-4 py-3 shadow-[6px_6px_0_0_rgba(0,0,0,0.85)] pointer-events-none transition-all duration-150"
          style={{ borderColor: focusedDest.accentColor }}
        >
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tab mb-1">
            <span style={{ color: focusedDest.accentColor }} className="font-bold tracking-wider">
              {focusedDest.code} · {focusedDest.shortLabel.toUpperCase()}
            </span>
            <span className={visitedDestinations.includes(focusedDest.id) ? 'text-[#22FF88]' : 'text-[#94A3B8]'}>
              {visitedDestinations.includes(focusedDest.id) ? '✓ Explored' : `+${focusedDest.xpReward} XP`}
            </span>
          </div>
          <p className="font-pixel text-xs text-white mb-1">{focusedDest.title.toUpperCase()}</p>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">{focusedDest.description}</p>
        </div>
      )}

      {/* Nearby Landmark Enter CTA in Hub */}
      {mode === 'HUB' && nearbyDest && onActivateNearby && (
        <div className="fixed bottom-24 md:bottom-24 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={onActivateNearby}
            className="pixel-btn flex items-center gap-2.5 bg-[#22FF88] hover:bg-[#4ADE80] text-[#06060E] border-2 border-white px-6 py-3 shadow-[4px_4px_0_0_#000] font-pixel text-[10px] cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>ENTER {nearbyDest.title.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* Clear World Navigation Guidance & Quick Destination Bar in Hub */}
      {mode === 'HUB' && (
        <div className="hidden md:flex fixed bottom-4 left-5 z-20 flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-3 bg-[#06060E]/92 border border-[#31256E] px-3.5 py-1.5 text-[10px] font-pixel text-[#FFD93D]">
            <span>EXPLORE THE WORLD — CHOOSE YOUR NEXT QUEST</span>
            <span className="text-[#94A3B8] font-sans text-[11px] font-normal">
              WASD / Click Landmark / Quick Jump
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {HUB_DESTINATIONS.map((d) => {
              const isFocused = focusedDestId === d.id;
              const isExplored = visitedDestinations.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDestination(d)}
                  onMouseEnter={() => onHoverDestination?.(d.id)}
                  onMouseLeave={() => onHoverDestination?.(null)}
                  onFocus={() => onHoverDestination?.(d.id)}
                  onBlur={() => onHoverDestination?.(null)}
                  className={`pixel-btn px-3 py-1.5 border text-[11px] font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    isFocused
                      ? 'bg-[#1F1A45] text-white border-white'
                      : 'bg-[#0B0B19]/92 hover:bg-[#191536] border-[#31256E] text-[#E2E8F0] hover:text-white'
                  }`}
                  style={{ borderBottomColor: d.accentColor, borderBottomWidth: '2px' }}
                >
                  {isExplored && (
                    <span className="text-[#22FF88] text-[10px]" aria-label="Explored">
                      ✓
                    </span>
                  )}
                  <span>{d.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile 4-Way Touch D-Pad in Hub */}
      {mode === 'HUB' && touchInputRef && (
        <div className="md:hidden fixed bottom-4 left-4 z-30 grid grid-cols-3 gap-1 w-32">
          <div />
          <button
            type="button"
            onPointerDown={() => setTouch('up', true)}
            onPointerUp={() => setTouch('up', false)}
            onPointerLeave={() => setTouch('up', false)}
            onPointerCancel={() => setTouch('up', false)}
            className="h-10 bg-[#121126]/90 border-2 border-[#5B45B8] active:border-[#22FF88] flex items-center justify-center text-white touch-none"
            aria-label="Walk north"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <div />
          <button
            type="button"
            onPointerDown={() => setTouch('left', true)}
            onPointerUp={() => setTouch('left', false)}
            onPointerLeave={() => setTouch('left', false)}
            onPointerCancel={() => setTouch('left', false)}
            className="h-10 bg-[#121126]/90 border-2 border-[#5B45B8] active:border-[#22FF88] flex items-center justify-center text-white touch-none"
            aria-label="Walk west"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => setTouch('down', true)}
            onPointerUp={() => setTouch('down', false)}
            onPointerLeave={() => setTouch('down', false)}
            onPointerCancel={() => setTouch('down', false)}
            className="h-10 bg-[#121126]/90 border-2 border-[#5B45B8] active:border-[#22FF88] flex items-center justify-center text-white touch-none"
            aria-label="Walk south"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => setTouch('right', true)}
            onPointerUp={() => setTouch('right', false)}
            onPointerLeave={() => setTouch('right', false)}
            onPointerCancel={() => setTouch('right', false)}
            className="h-10 bg-[#121126]/90 border-2 border-[#5B45B8] active:border-[#22FF88] flex items-center justify-center text-white touch-none"
            aria-label="Walk east"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
};
