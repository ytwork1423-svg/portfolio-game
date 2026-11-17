import React, { useEffect, useRef, useState } from 'react';
import { Film, Image as ImageIcon, Pause, Play, Trash2, Upload, Volume2, VolumeX } from 'lucide-react';
import { DemoArtworkVariant } from '../../types/projectsExhibition';
import { soundEngine } from '../../audio/soundEngine';

export type ReferenceCardFrame = 'polaroid' | 'arcade-crt' | 'indigo-poster' | 'pastel-sky' | 'clean';

interface EditorialArtworkPlateProps {
  variant: DemoArtworkVariant;
  frameStyle?: ReferenceCardFrame;
  stickerLabel?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  activeVideoId?: string | null;
  videoId?: string;
  editMode?: boolean;
  isDemo?: boolean;
  onActivateVideo?: (id: string) => void;
  onUploadImage?: (file: File) => void;
  onUploadVideo?: (file: File) => void;
  onClearMedia?: (kind: 'image' | 'video') => void;
  onInspect?: () => void;
  className?: string;
  compact?: boolean;
}

const PixelHeartRow: React.FC = () => (
  <div className="flex items-center gap-1" aria-hidden="true">
    {[0, 1, 2].map((h) => (
      <svg key={h} width="13" height="12" viewBox="0 0 9 8" className="pixelated">
        <path
          d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"
          fill="#FF4785"
        />
        <rect x="1" y="1" width="1" height="1" fill="#FFB3CE" />
      </svg>
    ))}
  </div>
);

const PixelTrophyBadge: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 12 12" className="pixelated drop-shadow-[2px_2px_0_#150C36]" aria-hidden="true">
    <rect x="2" y="1" width="8" height="2" fill="#FFD93D" />
    <rect x="1" y="2" width="1" height="3" fill="#FF9F1C" />
    <rect x="10" y="2" width="1" height="3" fill="#FF9F1C" />
    <rect x="3" y="3" width="6" height="3" fill="#FFD93D" />
    <rect x="4" y="6" width="4" height="2" fill="#FF9F1C" />
    <rect x="5" y="8" width="2" height="2" fill="#FF9F1C" />
    <rect x="3" y="10" width="6" height="2" fill="#3B1D8F" />
  </svg>
);

const DemoGraphicCanvas: React.FC<{
  variant: DemoArtworkVariant;
  title: string;
  subtitle?: string;
  compact?: boolean;
}> = ({ variant, title, subtitle, compact }) => {
  switch (variant) {
    case 'coral-portrait':
      // Inspired by Image 2 (HI SCORE / SONG WARS cyan arcade screen inside warm crimson glow)
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-[#20EEFF] via-[#12C9F0] to-[#0891B2] text-[#08224A] p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
          {/* Subtle CRT pixel grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.45) 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <span className="w-4 h-4 rounded-full bg-[#FFE14D] border-2 border-[#08224A] inline-block" />
            <span className="font-pixel text-[8px] sm:text-[9px] text-[#08224A] tracking-wider">
              ARCADE DEMO
            </span>
            <span className="w-4 h-4 rounded-full bg-[#FFE14D] border-2 border-[#08224A] inline-block" />
          </div>

          <div className="relative z-10 my-auto text-center space-y-2 px-1">
            <p
              className={`font-pixel leading-snug break-words ${
                compact
                  ? 'text-[9px] sm:text-[11px] line-clamp-3 text-[#0A2558]'
                  : 'text-sm sm:text-2xl text-[#0A2558]'
              } drop-shadow-[2px_2px_0_rgba(255,255,255,0.85)]`}
            >
              {title.toUpperCase()}
            </p>
            {subtitle && !compact && (
              <p className="text-[11px] sm:text-xs font-semibold text-[#06234D]/85 line-clamp-2 max-w-md mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <div className="relative z-10 flex items-center justify-between text-[8px] sm:text-[9px] font-pixel text-[#08224A]">
            <span>★ 1UP</span>
            <span>INSERT IDEA</span>
          </div>
        </div>
      );

    case 'cobalt-eye':
      // Inspired by Image 1 (GAME BRAIN royal indigo-violet halftone + fiery orange 3D headline + X/O)
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#3C14C4] via-[#270A8E] to-[#13034F] text-white p-3.5 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
          <div className="pointer-events-none absolute inset-0 arcade-halftone opacity-70" />
          <span className="pointer-events-none absolute top-4 left-6 font-pixel text-[11px] text-white/80 rotate-12">
            X
          </span>
          <span className="pointer-events-none absolute bottom-5 right-6 font-pixel text-[11px] text-white/80 -rotate-12">
            O
          </span>

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 bg-[#FF7B00] border-2 border-[#150C36] font-pixel text-[7px] text-white">
              UX QUEST
            </span>
            <PixelTrophyBadge />
          </div>

          <div className="relative z-10 my-auto text-center -rotate-2 px-1">
            <p
              className={`font-pixel leading-snug break-words text-pixel-3d ${
                compact ? 'text-[9px] sm:text-[11px] line-clamp-3' : 'text-sm sm:text-xl'
              }`}
            >
              {title.toUpperCase()}
            </p>
          </div>

          {!compact && subtitle ? (
            <p className="relative z-10 text-xs text-[#E2DCFF] text-center line-clamp-2">
              {subtitle}
            </p>
          ) : (
            <div className="relative z-10 text-center font-mono-tab text-[9px] text-[#FFD93D]">
              DEMO STAGE
            </div>
          )}
        </div>
      );

    case 'sunburst-poster':
    case 'amber-badge':
      // Inspired by Image 3 (OMG! pastel sky clouds + rolling green hill inside Polaroid window)
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-[#8CE0FF] via-[#D8F6FF] to-[#FFF6E6] text-[#150C36] p-3.5 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
          {/* Pixel Cloud */}
          <div className="pointer-events-none absolute top-5 right-6 flex items-end" aria-hidden="true">
            <div className="w-8 h-4 bg-white rounded-t-full" />
            <div className="w-12 h-6 bg-white rounded-t-full -ml-3" />
            <div className="w-6 h-3.5 bg-white rounded-t-full -ml-2" />
          </div>
          {/* Rolling Pixel Hills */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] bg-[#87C229]"
            style={{ clipPath: 'ellipse(78% 72% at 28% 100%)' }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[36%] bg-[#6BA317]"
            style={{ clipPath: 'ellipse(74% 80% at 84% 100%)' }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 bg-[#FFD166] border-2 border-[#150C36] font-pixel text-[7px] text-[#150C36]">
              PLAYABLE UI
            </span>
          </div>

          <div className="relative z-10 my-auto bg-[#FFFDF5]/94 border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] p-2.5 sm:p-3">
            <p
              className={`font-bold text-[#150C36] leading-tight break-words ${
                compact ? 'text-[11px] sm:text-xs line-clamp-3' : 'text-sm sm:text-base'
              }`}
            >
              {title}
            </p>
            {!compact && subtitle && (
              <p className="text-[11px] text-[#43376B] mt-1 line-clamp-2">{subtitle}</p>
            )}
          </div>

          <div className="relative z-10 flex justify-end">
            <span className="px-2.5 py-1 bg-[#FFB703] border-2 border-[#150C36] font-pixel text-[7px] text-[#150C36] shadow-[2px_2px_0_#150C36]">
              OPEN QUEST
            </span>
          </div>
        </div>
      );

    case 'magenta-editorial':
      // Vibrant Pink/Purple Retro Arcade Shopfront & Marquee (Image 3 right storefront + Image 2 pink header)
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-[#FF368B] via-[#D81B60] to-[#59138A] text-white p-3.5 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
          <div className="pointer-events-none absolute inset-0 arcade-sky-grid opacity-30" />
          <div className="relative z-10 flex items-center justify-between gap-1">
            <span className="px-2 py-0.5 bg-[#22FFE2] text-[#150C36] border-2 border-[#150C36] font-pixel text-[7px]">
              ARCADE UI
            </span>
            <PixelHeartRow />
          </div>
          <div className="relative z-10 my-auto space-y-2 px-1">
            <p
              className={`font-pixel leading-snug break-words text-pixel-3d-pink ${
                compact ? 'text-[9px] sm:text-[11px] line-clamp-3' : 'text-xs sm:text-lg'
              }`}
            >
              {title.toUpperCase()}
            </p>
            {!compact && subtitle && (
              <p className="text-xs text-[#FFE5F2] line-clamp-2">{subtitle}</p>
            )}
          </div>
          <div className="relative z-10 h-3 w-full bg-[repeating-linear-gradient(90deg,#22FFE2_0_12px,#9333EA_12px_24px)] border border-[#150C36]" />
        </div>
      );

    case 'emerald-ui':
    case 'emerald-craft':
      // Synth-Lavender Grid Sky with Pixel UI Card (Image 3 sky + Image 1 vibrant contrast)
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-[#7E74E8] via-[#A99FF4] to-[#FFDCC2] text-[#150C36] p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
          <div className="pointer-events-none absolute inset-0 arcade-sky-grid opacity-55" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 bg-[#FFE14D] border-2 border-[#150C36] font-pixel text-[7px]">
              SYS 01
            </span>
            <span className="font-pixel text-[8px] text-white drop-shadow-[1px_1px_0_#150C36]">
              ★★
            </span>
          </div>

          <div className="relative z-10 my-auto bg-[#FFFDF5] border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-[#150C36] truncate">{title}</span>
              <span className="w-2.5 h-2.5 bg-[#22FF88] border border-[#150C36]" />
            </div>
            <div className="h-2 w-3/4 bg-[#FF5E99]" />
            <div className="h-2 w-1/2 bg-[#38BDF8]" />
          </div>

          {!compact && subtitle && (
            <p className="relative z-10 text-[11px] font-semibold text-[#150C36] line-clamp-2 bg-[#FFFDF5]/80 px-2 py-1 border border-[#150C36]">
              {subtitle}
            </p>
          )}
        </div>
      );

    case 'obsidian-mobile':
    default:
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-[#2A0E78] to-[#11053B] text-white p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
          <div className="pointer-events-none absolute inset-0 arcade-halftone opacity-50" />
          <div className="relative z-10 flex items-center justify-between text-[9px] font-pixel text-[#22E4FF]">
            <span>SPEC · WIRE</span>
            <span>●</span>
          </div>
          <div className="relative z-10 my-auto border-2 border-[#22E4FF] bg-[#0B0426] p-3 space-y-2">
            <p className="font-bold text-xs sm:text-sm text-white">{title}</p>
            <div className="h-1.5 w-2/3 bg-[#FF8C00]" />
            <div className="h-1.5 w-1/2 bg-[#22E4FF]/60" />
          </div>
          <div className="relative z-10 text-[9px] font-pixel text-[#FFD93D]">READY PLAYER</div>
        </div>
      );
  }
};

export const EditorialArtworkPlate: React.FC<EditorialArtworkPlateProps> = ({
  variant,
  frameStyle = 'polaroid',
  stickerLabel,
  title,
  subtitle,
  imageUrl,
  videoUrl,
  activeVideoId,
  videoId,
  editMode = false,
  isDemo = true,
  onActivateVideo,
  onUploadImage,
  onUploadVideo,
  onClearMedia,
  onInspect,
  className = '',
  compact = false,
}) => {
  const imgRef = useRef<HTMLInputElement | null>(null);
  const vidRef = useRef<HTMLInputElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const v = videoElRef.current;
    if (!v || !videoId) return;
    if (activeVideoId !== videoId && !v.paused) {
      v.pause();
      setIsPlaying(false);
    }
  }, [activeVideoId, videoId]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoElRef.current;
    if (!v) return;
    if (v.paused) {
      if (onActivateVideo && videoId) onActivateVideo(videoId);
      v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoElRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const innerMedia = (
    <div
      onClick={onInspect}
      className={`relative w-full h-full overflow-hidden ${onInspect ? 'cursor-pointer' : ''}`}
    >
      {videoUrl ? (
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoElRef}
            src={videoUrl}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onPlay={() => {
              if (onActivateVideo && videoId) onActivateVideo(videoId);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3 py-1.5 bg-[#FFE14D] text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] font-pixel text-[8px] flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 bg-[#FFFDF5] text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] cursor-pointer"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <DemoGraphicCanvas
          variant={variant}
          title={title}
          subtitle={subtitle}
          compact={compact}
        />
      )}

      {!imageUrl && !videoUrl && isDemo && !compact && (
        <span className="pointer-events-none absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#150C36]/80 border border-white/30 font-pixel text-[7px] text-[#FFE14D]">
          DEMO
        </span>
      )}
    </div>
  );

  // Outer frame container styled directly from the 3 reference posters
  const frameWrapperClass =
    frameStyle === 'arcade-crt'
      ? 'pixel-arcade-cabinet rounded-[22px] p-2.5 sm:p-4 flex flex-col gap-2.5'
      : frameStyle === 'indigo-poster'
        ? 'bg-[#290D8E] border-[3px] border-[#FF8C00] shadow-[6px_6px_0_0_#150C36] rounded-[18px] p-2 sm:p-2.5 flex flex-col'
        : frameStyle === 'pastel-sky'
          ? 'bg-gradient-to-b from-[#9D94F5] to-[#FFD8BA] border-[3px] border-[#150C36] shadow-[6px_6px_0_0_#150C36] rounded-[18px] p-2 sm:p-2.5 flex flex-col'
          : frameStyle === 'clean'
            ? 'bg-[#1A095A] border-2 border-[#FF8C00]/60 rounded-[18px]'
            : 'pixel-polaroid rounded-[16px] p-2 sm:p-2.5 flex flex-col';

  return (
    <div className={`group relative overflow-visible ${frameWrapperClass} ${className}`}>
      {onUploadImage && (
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              soundEngine.playSuccess();
              onUploadImage(file);
            }
            e.target.value = '';
          }}
        />
      )}
      {onUploadVideo && (
        <input
          ref={vidRef}
          type="file"
          accept="video/mp4,video/webm,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              soundEngine.playSuccess();
              onUploadVideo(file);
            }
            e.target.value = '';
          }}
        />
      )}

      {/* Optional Reference Sticker Label (OMG! / LET'S GO! / HISCORE) */}
      {stickerLabel && (
        <span className="pointer-events-none absolute -top-3 left-4 z-30 px-2.5 py-1 bg-[#FF4785] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] font-pixel text-[8px] text-white -rotate-3">
          {stickerLabel}
        </span>
      )}

      {/* Arcade Cabinet Marquee Header Strip (Image 2 style) */}
      {frameStyle === 'arcade-crt' && (
        <div className="bg-gradient-to-r from-[#FF3E9D] via-[#FF75B5] to-[#FF3E9D] border-2 border-[#150C36] py-1.5 px-3 flex items-center justify-between rounded-t-lg shrink-0">
          <span className="font-pixel text-[9px] sm:text-[10px] text-[#FFE14D] drop-shadow-[1px_1px_0_#150C36]">
            HISCORE
          </span>
          <span className="font-mono-tab text-[10px] font-bold text-[#150C36] truncate max-w-[60%]">
            {title.toUpperCase()}
          </span>
        </div>
      )}

      {/* Screen / Artwork Viewport */}
      <div
        className={`relative flex-1 min-h-0 overflow-hidden border-2 border-[#150C36] ${
          frameStyle === 'arcade-crt' ? 'rounded-[18px] bg-[#0B1736]' : 'rounded-[10px]'
        }`}
      >
        {innerMedia}
      </div>

      {/* Polaroid Cream Bottom Caption Strip (Image 3 style) */}
      {frameStyle === 'polaroid' && !compact && (
        <div className="pt-2 px-1 flex items-center justify-between gap-2 shrink-0">
          <span className="font-bold text-xs text-[#150C36] truncate">{title}</span>
          <PixelHeartRow />
        </div>
      )}

      {/* Arcade Cabinet Bottom Joystick & Button Deck (Image 2 style) */}
      {frameStyle === 'arcade-crt' && (
        <div className="pt-1 px-2 flex items-center justify-between shrink-0" aria-hidden="true">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF3B30] border-2 border-[#150C36]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFE14D] border-2 border-[#150C36]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#22E4FF] border-2 border-[#150C36]" />
          </div>
          <span className="font-pixel text-[7px] text-[#FFE14D]">25¢ INSERT COIN</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF3B30] border-2 border-[#150C36]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#22E4FF] border-2 border-[#150C36]" />
          </div>
        </div>
      )}

      {/* Hover / Edit-Mode Media Replacement Overlay */}
      {(onUploadImage || onUploadVideo || onClearMedia) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-3 right-3 z-30 flex items-center gap-1.5 transition-opacity duration-200 ${
            editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
          }`}
        >
          {onUploadImage && (
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              className="px-2.5 py-1.5 bg-[#FFE14D] hover:bg-white text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {imageUrl ? <Upload className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              <span>{imageUrl ? 'Replace' : 'Image'}</span>
            </button>
          )}
          {onUploadVideo && !compact && (
            <button
              type="button"
              onClick={() => vidRef.current?.click()}
              className="px-2.5 py-1.5 bg-[#22E4FF] hover:bg-white text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Film className="w-3 h-3" />
              <span>{videoUrl ? 'Swap Video' : 'Video'}</span>
            </button>
          )}
          {onClearMedia && (imageUrl || videoUrl) && (
            <button
              type="button"
              onClick={() => onClearMedia(videoUrl ? 'video' : 'image')}
              className="p-1.5 bg-[#FF3B30] hover:bg-white text-white hover:text-[#150C36] border-2 border-[#150C36] shadow-[2px_2px_0_#150C36] cursor-pointer"
              aria-label="Remove uploaded media"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
