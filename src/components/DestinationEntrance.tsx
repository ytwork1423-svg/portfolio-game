import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { HUB_DESTINATIONS } from '../data/portfolioData';
import { DestinationId } from '../types/game';
import { PixelAvatar } from './PixelAvatar';
import { PlayerProfileEntrance } from './PlayerProfileEntrance';
import { MissionControlEntrance } from './MissionControlEntrance';

interface DestinationEntranceProps {
  destinationId: DestinationId;
  playerHubPos?: { x: number; y: number };
  onComplete: () => void;
}

export const DestinationEntrance: React.FC<DestinationEntranceProps> = ({
  destinationId,
  playerHubPos,
  onComplete,
}) => {
  const dest = HUB_DESTINATIONS.find((d) => d.id === destinationId) || HUB_DESTINATIONS[0];

  useEffect(() => {
    if (destinationId === 'profile' || destinationId === 'missions') return;
    const timer = window.setTimeout(onComplete, 1650);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [destinationId, onComplete]);

  if (destinationId === 'profile') {
    return <PlayerProfileEntrance playerHubPos={playerHubPos} onComplete={onComplete} />;
  }

  if (destinationId === 'missions') {
    return <MissionControlEntrance playerHubPos={playerHubPos} onComplete={onComplete} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#06060E] overflow-hidden flex items-center justify-center select-none">
      {/* Destination-Specific Animated Background Geometry */}

      {destinationId === 'skills' && (
        <>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #FF3E9D 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{ duration: 1.1, ease: 'linear' }}
            className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#38BDF8]/40 to-transparent"
          />
        </>
      )}



      {destinationId === 'academy' && (
        <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
          {[0, 1, 2, 3, 4].map((idx) => (
            <motion.div
              key={idx}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: -90, opacity: [0, 1, 0.7] }}
              transition={{ duration: 1.3, delay: idx * 0.1 }}
              className="w-8 h-10 bg-[#A855F7]/30 border-2 border-[#FFD93D]"
            />
          ))}
        </div>
      )}

      {destinationId === 'trophies' && (
        <>
          <motion.div
            initial={{ rotate: -28, opacity: 0 }}
            animate={{ rotate: 0, opacity: 0.35 }}
            transition={{ duration: 1.0 }}
            className="absolute -top-24 left-1/4 w-48 h-[140%] bg-gradient-to-b from-[#FFD93D] to-transparent origin-top"
          />
          <motion.div
            initial={{ rotate: 28, opacity: 0 }}
            animate={{ rotate: 0, opacity: 0.35 }}
            transition={{ duration: 1.0 }}
            className="absolute -top-24 right-1/4 w-48 h-[140%] bg-gradient-to-b from-[#FF3E9D] to-transparent origin-top"
          />
        </>
      )}

      {destinationId === 'portal' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: ring * 1.4, opacity: 0 }}
              transition={{ duration: 1.3, delay: ring * 0.15, ease: 'easeOut' }}
              className="absolute w-48 h-48 border-4 border-[#38BDF8]"
            />
          ))}
        </div>
      )}

      {/* Center Cinematic Title Card */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        <div className="inline-flex items-center justify-center mb-5 p-3 bg-[#121126] border-2 border-white/20">
          <PixelAvatar subject="meera" size={56} />
        </div>

        <p
          className="font-pixel text-xs sm:text-sm mb-3 tracking-widest"
          style={{ color: dest.accentColor }}
        >
          {dest.code}
        </p>

        <h1 className="font-pixel text-xl sm:text-4xl text-white mb-4 leading-tight">
          {dest.title.toUpperCase()}
        </h1>

        <p className="text-sm sm:text-base text-[#CBD5E1] max-w-lg mx-auto mb-8">
          {dest.description}
        </p>

        <div className="w-56 h-2 bg-[#121126] border border-[#31256E] mx-auto overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="h-full w-full"
            style={{ backgroundColor: dest.accentColor }}
          />
        </div>
      </motion.div>

      <button
        onClick={onComplete}
        className="fixed bottom-6 right-6 z-20 px-4 py-2 bg-[#121126] hover:bg-[#191536] border-2 border-[#5B45B8] font-pixel text-[9px] text-[#CBD5E1] hover:text-white cursor-pointer"
      >
        SKIP INTRO [SPACE] ▶
      </button>
    </div>
  );
};
