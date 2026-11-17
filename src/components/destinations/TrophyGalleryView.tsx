import React from 'react';
import { motion } from 'motion/react';
import { Award, KeyRound, Sparkles, Star, Trophy } from 'lucide-react';
import { ACHIEVEMENTS, EDITABLE_GALLERY_AWARDS } from '../../data/portfolioData';
import { HUB_COLLECTIBLES } from '../../game/overworldMap';

interface TrophyGalleryViewProps {
  unlockedAchievements: string[];
  collectedIds: string[];
  secretPaletteUnlocked: boolean;
  secretPaletteActive: boolean;
  onToggleSecretPalette: () => void;
}

export const TrophyGalleryView: React.FC<TrophyGalleryViewProps> = ({
  unlockedAchievements,
  collectedIds,
  secretPaletteUnlocked,
  secretPaletteActive,
  onToggleSecretPalette,
}) => {
  const collectedSet = new Set(collectedIds);

  return (
    <div
      className="min-h-screen bg-[#07060F] text-[#F4F4FF] pt-24 pb-20 px-4 sm:px-8 overflow-y-auto relative"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 25% 0%, rgba(255,217,61,0.14), transparent 45%), radial-gradient(ellipse at 75% 0%, rgba(255,62,157,0.12), transparent 45%)',
      }}
    >
      <div className="max-w-[1240px] mx-auto space-y-14">
        {/* Spotlight Header */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#31256E] pb-8"
        >
          <div>
            <p className="font-pixel text-[10px] text-[#FFD93D] mb-2">
              DESTINATION 05 · TROPHY GALLERY
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Achievements, Relics &amp; Recognition
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1] mt-3 max-w-2xl leading-relaxed">
              Every milestone discovered while exploring Meera’s world illuminates a pedestal here —
              alongside dedicated slots for verified external awards and honours.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#121024] border-2 border-[#FFD93D] px-5 py-3">
            <div>
              <p className="text-xs text-[#94A3B8]">Adventure Trophies</p>
              <p className="font-mono-tab text-lg font-bold text-[#FFD93D]">
                {unlockedAchievements.length} / {ACHIEVEMENTS.length}
              </p>
            </div>
            <div className="w-px h-8 bg-[#31256E]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Hub Collectibles</p>
              <p className="font-mono-tab text-lg font-bold text-[#22FF88]">
                {collectedIds.length} / {HUB_COLLECTIBLES.length}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Spotlight Trophy Pedestals */}
        <section className="space-y-5">
          <h2 className="font-pixel text-xs text-[#FFD93D]">ADVENTURE TROPHY PEDESTALS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ACHIEVEMENTS.map((ach, idx) => {
              const unlocked = unlockedAchievements.includes(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`p-6 border-2 flex flex-col justify-between gap-4 relative overflow-hidden ${
                    unlocked
                      ? 'bg-[#15122B] border-[#FFD93D] shadow-[0_0_28px_rgba(255,217,61,0.14)]'
                      : 'bg-[#0C0B18] border-[#26214D] opacity-70'
                  }`}
                >
                  {unlocked && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-24 bg-[#FFD93D]/15 blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 flex items-center justify-center border-2 ${
                        unlocked
                          ? 'bg-[#FFD93D] text-[#06060E] border-white'
                          : 'bg-[#06060E] text-[#64748B] border-[#31256E]'
                      }`}
                    >
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="font-mono-tab text-xs font-bold text-[#22FF88]">
                      +{ach.xpBonus} XP
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{ach.title}</h3>
                    <p className="text-sm text-[#CBD5E1] mt-1.5 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#26214D] text-xs font-semibold">
                    {unlocked ? (
                      <span className="text-[#FFD93D]">★ Spotlight Active · Unlocked</span>
                    ) : (
                      <span className="text-[#94A3B8]">Locked — explore destinations to illuminate</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Secret Relic & Game Boy Filter + Collectible Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-[#121024] border-2 border-[#FF3E9D] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#FF75B5]">
              <KeyRound className="w-5 h-5" />
              <span className="font-pixel text-[10px]">SECRET RELIC VAULT</span>
            </div>
            <h3 className="text-xl font-bold text-white">Golden Designer Key &amp; GB Filter</h3>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              {secretPaletteUnlocked
                ? 'Relic acquired! You unlocked the classic monochrome Game Boy Green display mode and rainbow star trail across the Overworld.'
                : 'Search behind the Northeast Skill Lab trees in the Overworld Town to discover the hidden Golden Designer Key.'}
            </p>
            <button
              disabled={!secretPaletteUnlocked}
              onClick={onToggleSecretPalette}
              className={`pixel-btn w-full py-3 font-pixel text-[10px] border-2 cursor-pointer ${
                secretPaletteUnlocked
                  ? secretPaletteActive
                    ? 'bg-[#22FF88] text-[#06060E] border-white'
                    : 'bg-[#191536] text-[#22FF88] border-[#22FF88]'
                  : 'bg-[#06060E] text-[#64748B] border-[#31256E] cursor-not-allowed'
              }`}
            >
              {secretPaletteUnlocked
                ? secretPaletteActive
                  ? 'GAME BOY MODE: ACTIVE'
                  : 'ENABLE GAME BOY MODE'
                : 'RELIC NOT YET FOUND'}
            </button>
          </div>

          <div className="lg:col-span-7 bg-[#0D0C1D] border-2 border-[#31256E] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#22FF88]">
              <Star className="w-4 h-4" />
              <span className="font-pixel text-[10px]">OVERWORLD COLLECTIBLES CASE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HUB_COLLECTIBLES.map((item) => {
                const found = collectedSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3 border ${
                      found
                        ? 'bg-[#151330] border-[#22FF88]'
                        : 'bg-[#06060E] border-[#26214D] opacity-55'
                    }`}
                  >
                    <p className="font-pixel text-[8px] text-[#FFD93D]">
                      {found ? 'COLLECTED' : 'HIDDEN'}
                    </p>
                    <p className="text-xs font-semibold text-white mt-1">{item.label}</p>
                    <p className="font-mono-tab text-[11px] text-[#22FF88] mt-0.5">
                      +{item.xpValue} XP
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Editable External Awards Pedestals (no fabricated awards) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <Sparkles className="w-4 h-4 text-[#FF75B5]" />
            <h2 className="font-pixel text-xs text-white">
              DESIGN RECOGNITION &amp; AWARDS (EDITABLE PEDESTALS)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EDITABLE_GALLERY_AWARDS.map((slot) => (
              <div
                key={slot.id}
                className="bg-[#0D0C1D] border border-dashed border-[#5B45B8] p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs text-[#FF75B5] font-semibold">
                  <Award className="w-4 h-4" />
                  <span>{slot.slotLabel}</span>
                </div>
                <h3 className="text-base font-bold text-white">{slot.title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{slot.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
