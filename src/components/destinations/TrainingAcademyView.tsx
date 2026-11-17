import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { ACADEMY_MILESTONES, DESIGNER_PROFILE } from '../../data/portfolioData';
import { DestinationId } from '../../types/game';
import { soundEngine } from '../../audio/soundEngine';

interface TrainingAcademyViewProps {
  onNavigateDestination: (id: DestinationId) => void;
}

export const TrainingAcademyView: React.FC<TrainingAcademyViewProps> = ({
  onNavigateDestination,
}) => {
  const [selectedId, setSelectedId] = useState(ACADEMY_MILESTONES[0].id);
  const selected =
    ACADEMY_MILESTONES.find((m) => m.id === selectedId) || ACADEMY_MILESTONES[0];

  return (
    <div
      className="min-h-screen bg-[#090617] text-[#F4F4FF] pt-24 pb-20 px-4 sm:px-8 overflow-y-auto"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% 12%, rgba(168,85,247,0.16), transparent 42%), radial-gradient(circle at 85% 30%, rgba(255,217,61,0.1), transparent 36%)',
      }}
    >
      <div className="max-w-[1220px] mx-auto space-y-14">
        {/* Academy Header & Degree Crest */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#110C26] border-2 border-[#A855F7] p-7 sm:p-10">
            <div>
              <p className="font-pixel text-[10px] text-[#A855F7] mb-2">
                DESTINATION 04 · TRAINING ACADEMY
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Education, Courses &amp; Growth
              </h1>
              <p className="text-sm sm:text-base text-[#CBD5E1] mt-4 leading-relaxed max-w-2xl">
                A timeline of Meera’s formal academic foundation in UX/UI design, studio coursework,
                and open slots reserved for verified industry experiences and certifications.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#31256E] flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-[#94A3B8]">Current Degree</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {DESIGNER_PROFILE.education.degree}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Institution</p>
                <p className="text-sm font-bold text-[#FFD93D] mt-0.5">
                  {DESIGNER_PROFILE.education.institution}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Timeline</p>
                <p className="font-mono-tab text-sm font-bold text-[#22FF88] mt-0.5">
                  {DESIGNER_PROFILE.education.period}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 pixel-window-retro p-6 sm:p-7 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b-2 border-[#161129] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#7E22CE]" />
                <span className="font-pixel text-[10px] text-[#161129]">ACADEMIC CREST</span>
              </div>
              <span className="font-mono-tab text-xs font-bold text-[#9D174D]">2023–2027</span>
            </div>
            <div className="py-5 space-y-2.5">
              <h2 className="text-xl font-bold text-[#161129]">
                {DESIGNER_PROFILE.education.degree}
              </h2>
              <p className="text-sm font-semibold text-[#7E22CE]">
                {DESIGNER_PROFILE.education.institution}
              </p>
              <p className="text-sm text-[#272038] leading-relaxed">
                {DESIGNER_PROFILE.education.focus}
              </p>
            </div>
            <div className="bg-white/80 border-2 border-[#161129] p-3 text-xs font-semibold text-[#161129]">
              Active Focus: Research-led product design, accessible interfaces &amp; visual craft.
            </div>
          </div>
        </motion.section>

        {/* Interactive Illuminated Milestone Timeline */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline Selector */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-pixel text-xs text-[#FFD93D] mb-4">
              SELECT A MILESTONE TO INSPECT
            </h2>
            {ACADEMY_MILESTONES.map((item, idx) => {
              const active = item.id === selected.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.07 }}
                  onClick={() => {
                    soundEngine.playCoin();
                    setSelectedId(item.id);
                  }}
                  className={`w-full text-left p-5 border-2 transition-all cursor-pointer flex items-start gap-4 ${
                    active
                      ? 'bg-[#1A133B] border-[#FFD93D] shadow-[4px_4px_0_0_#FFD93D]'
                      : 'bg-[#110C26] border-[#31256E] hover:border-[#A855F7]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${
                      active
                        ? 'bg-[#FFD93D] text-[#06060E] border-white'
                        : 'bg-[#090617] text-[#A855F7] border-[#5B45B8]'
                    }`}
                  >
                    {item.kind === 'Education' ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : item.kind === 'Coursework' ? (
                      <BookOpen className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                      <span className="font-mono-tab text-[#22FF88]">{item.period}</span>
                      <span>·</span>
                      <span>{item.kind}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#CBD5E1] mt-0.5">{item.organization}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Milestone Detail Display */}
          <div className="lg:col-span-6 bg-[#110C26] border-2 border-[#A855F7] p-7 space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#31256E] pb-3">
              <span className="font-pixel text-[10px] text-[#A855F7]">
                {selected.kind.toUpperCase()} RECORD
              </span>
              <span className="font-mono-tab text-xs text-[#FFD93D]">{selected.period}</span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">{selected.title}</h3>
              <p className="text-sm font-semibold text-[#FF75B5] mt-1">{selected.organization}</p>
              <p className="text-sm sm:text-base text-[#E2E8F0] mt-4 leading-relaxed">
                {selected.detail}
              </p>
            </div>

            <div className="bg-[#090617] border border-[#31256E] p-5 space-y-3">
              <p className="font-pixel text-[9px] text-[#22FF88]">KEY HIGHLIGHTS</p>
              <ul className="space-y-2.5">
                {selected.highlights.map((hl) => (
                  <li key={hl} className="text-sm text-[#CBD5E1] flex items-start gap-2.5">
                    <span className="text-[#FFD93D]">◆</span>
                    <span className="leading-relaxed">{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateDestination('trophies')}
                className="pixel-btn px-5 py-2.5 bg-[#FFD93D] text-[#06060E] font-pixel text-[10px] border-2 border-white flex items-center gap-2 cursor-pointer"
              >
                <span>VISIT TROPHY GALLERY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
