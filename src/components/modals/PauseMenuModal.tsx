import React from 'react';
import {
  Play,
  Map,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  X,
  Home,
} from 'lucide-react';
import { HUB_DESTINATIONS } from '../../data/portfolioData';
import { DestinationId, HubDestination } from '../../types/game';

interface PauseMenuModalProps {
  isInsideDestination: boolean;
  activeDestinationId: DestinationId | null;
  muted: boolean;
  bgmEnabled: boolean;
  secretPaletteUnlocked: boolean;
  secretPaletteActive: boolean;
  onResume: () => void;
  onReturnToHub: () => void;
  onSelectDestination: (dest: HubDestination) => void;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onToggleSecretPalette: () => void;
  onResetGame: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  isInsideDestination,
  activeDestinationId,
  muted,
  bgmEnabled,
  secretPaletteUnlocked,
  secretPaletteActive,
  onResume,
  onReturnToHub,
  onSelectDestination,
  onToggleMute,
  onToggleBgm,
  onToggleSecretPalette,
  onResetGame,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B0B19] border-3 border-[#FFD93D] shadow-[8px_8px_0_0_#000] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#191536] border-b-2 border-[#FFD93D]">
          <span className="font-pixel text-xs text-[#FFD93D]">GAME MENU</span>
          <button
            onClick={onResume}
            className="p-1 text-[#CBD5E1] hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto retro-scroll">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onResume}
              className="pixel-btn flex-1 py-3 bg-[#22FF88] text-[#06060E] font-pixel text-[10px] border-2 border-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>RESUME</span>
            </button>

            {isInsideDestination && (
              <button
                onClick={onReturnToHub}
                className="pixel-btn flex-1 py-3 bg-[#191536] text-[#38BDF8] font-pixel text-[10px] border-2 border-[#38BDF8] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>OVERWORLD HUB</span>
              </button>
            )}
          </div>

          <div className="bg-[#121126] border border-[#31256E] p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-pixel text-[#38BDF8] mb-2">
              <Map className="w-4 h-4" />
              <span>DESTINATION WARP</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {HUB_DESTINATIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDestination(d)}
                  className={`text-left px-3 py-2 border text-xs flex items-center justify-between cursor-pointer ${
                    d.id === activeDestinationId
                      ? 'bg-[#191536] border-[#22FF88] text-white'
                      : 'bg-[#0B0B19] border-[#31256E] text-[#CBD5E1] hover:border-[#FF3E9D]'
                  }`}
                >
                  <span className="font-semibold">
                    {d.title} · <span className="text-[#94A3B8]">{d.shortLabel}</span>
                  </span>
                  <span className="text-[11px]" style={{ color: d.accentColor }}>
                    Enter ▶
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#121126] border border-[#31256E] p-3.5 space-y-2.5">
            <p className="font-pixel text-[10px] text-[#FFD93D]">SOUND &amp; DISPLAY</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#E2E8F0]">8-Bit Sound Effects</span>
              <button
                onClick={onToggleMute}
                className="px-3 py-1.5 bg-[#0B0B19] border border-[#5B45B8] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                {muted ? (
                  <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[#22FF88]" />
                )}
                <span>{muted ? 'Muted' : 'Active'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#E2E8F0]">Ambient Chiptune Loop</span>
              <button
                onClick={onToggleBgm}
                className="px-3 py-1.5 bg-[#0B0B19] border border-[#5B45B8] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Music className="w-3.5 h-3.5 text-[#FF75B5]" />
                <span>{bgmEnabled && !muted ? 'On' : 'Off'}</span>
              </button>
            </div>
            {secretPaletteUnlocked && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#22FF88]">Secret Game Boy Mode</span>
                <button
                  onClick={onToggleSecretPalette}
                  className="px-3 py-1.5 bg-[#0B0B19] border border-[#22FF88] text-xs font-semibold text-[#22FF88] cursor-pointer"
                >
                  {secretPaletteActive ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onResetGame}
            className="w-full py-2.5 px-3 bg-[#1B091D] hover:bg-[#3B0764] border border-[#FF3E9D] text-xs font-semibold text-[#FF75B5] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Adventure &amp; Reset Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
