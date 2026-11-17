import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Compass,
  Cpu,
  Grid,
  Layout,
  Lightbulb,
  Palette,
  PenTool,
  Play,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  BOSS_ENCOUNTERS,
  SKILLS_INVENTORY,
  TOOLS_INVENTORY,
} from '../../data/portfolioData';
import { SkillItem, ToolItem } from '../../types/game';
import { PixelAvatar } from '../PixelAvatar';
import { soundEngine } from '../../audio/soundEngine';

interface SkillLabViewProps {
  bossDefeated: boolean;
  onDefeatBoss: () => void;
}

const SKILL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  grid: Grid,
  compass: Compass,
  search: Search,
  layout: Layout,
  play: Play,
  zap: Zap,
  palette: Palette,
  pen: PenTool,
  lightbulb: Lightbulb,
  check: CheckCircle2,
};

export const SkillLabView: React.FC<SkillLabViewProps> = ({ bossDefeated, onDefeatBoss }) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Core UX' | 'Visual & Craft' | 'Strategy'>('ALL');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem>(SKILLS_INVENTORY[0]);
  const [selectedTool, setSelectedTool] = useState<ToolItem>(TOOLS_INVENTORY[0]);
  const [demoWireframeMode, setDemoWireframeMode] = useState<'lowfi' | 'hifi'>('lowfi');
  const [pulseCount, setPulseCount] = useState(0);

  // Embedded UX Design Thinking Lab Simulator
  const [simRound, setSimRound] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [simFeedback, setSimFeedback] = useState<{
    text: string;
    isOptimal: boolean;
    choiceId: string;
  } | null>(null);
  const [simState, setSimState] = useState<'ACTIVE' | 'CLEARED' | 'FAILED'>(
    bossDefeated ? 'CLEARED' : 'ACTIVE'
  );

  const visibleSkills =
    categoryFilter === 'ALL'
      ? SKILLS_INVENTORY
      : SKILLS_INVENTORY.filter((s) => s.category === categoryFilter);

  const activeEncounter = BOSS_ENCOUNTERS[simRound];

  const handleSimChoice = (choiceId: string) => {
    if (simFeedback || simState !== 'ACTIVE') return;
    const choice = activeEncounter.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    const nextBoss = Math.max(0, bossHp - choice.damageToBoss);
    const nextPlayer = Math.max(0, playerHp - choice.damageToPlayer);
    setBossHp(nextBoss);
    setPlayerHp(nextPlayer);
    setSimFeedback({ text: choice.explanation, isOptimal: choice.isOptimal, choiceId });
    if (choice.isOptimal) soundEngine.playSuccess();
    else soundEngine.playHit();
  };

  const handleSimNext = () => {
    if (playerHp <= 0) {
      setSimState('FAILED');
      return;
    }
    if (simRound >= BOSS_ENCOUNTERS.length - 1 || bossHp <= 0) {
      soundEngine.playVictory();
      setSimState('CLEARED');
      onDefeatBoss();
      return;
    }
    setSimRound((r) => r + 1);
    setSimFeedback(null);
  };

  const resetSim = () => {
    soundEngine.playInteract();
    setSimRound(0);
    setPlayerHp(100);
    setBossHp(100);
    setSimFeedback(null);
    setSimState('ACTIVE');
  };

  return (
    <div
      className="min-h-screen bg-[#060814] text-[#F4F4FF] pt-24 pb-20 px-4 sm:px-8 overflow-y-auto"
      style={{
        backgroundImage:
          'radial-gradient(circle at 80% 10%, rgba(255,62,157,0.12), transparent 40%), radial-gradient(circle at 15% 20%, rgba(56,189,248,0.12), transparent 38%)',
      }}
    >
      <div className="max-w-[1260px] mx-auto space-y-16">
        {/* Lab Header */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#31256E] pb-8"
        >
          <div>
            <p className="font-pixel text-[10px] text-[#38BDF8] mb-2">
              DESTINATION 02 · FUTURISTIC CREATIVE LABORATORY
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Skill Lab &amp; Tool Armory
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1] mt-3 max-w-2xl leading-relaxed">
              Select any capability or design tool below to inspect how Meera translates UX theory
              and visual craft into structured, interactive product work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#0F1124] border border-[#31256E] p-1">
            {(['ALL', 'Core UX', 'Visual & Craft', 'Strategy'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playCoin();
                  setCategoryFilter(cat);
                }}
                className={`px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#FF3E9D] text-white'
                    : 'text-[#CBD5E1] hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All Skills' : cat}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Interactive Skills Grid + Live Demonstration Stage */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Skill Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visibleSkills.map((skill) => {
              const Icon = SKILL_ICONS[skill.iconKey] || Sparkles;
              const active = skill.id === selectedSkill.id;
              return (
                <button
                  key={skill.id}
                  onClick={() => {
                    soundEngine.playCoin();
                    setSelectedSkill(skill);
                  }}
                  className={`text-left p-4 border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    active
                      ? 'bg-[#161333] border-[#38BDF8] shadow-[4px_4px_0_0_#38BDF8]'
                      : 'bg-[#0C0E1E] border-[#26214D] hover:border-[#FF3E9D]'
                  }`}
                >
                  <div
                    className={`w-11 h-11 shrink-0 flex items-center justify-center border-2 ${
                      active
                        ? 'bg-[#38BDF8] text-[#06060E] border-white'
                        : 'bg-[#06060E] text-[#FF75B5] border-[#5B45B8]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white">{skill.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {skill.category} · {skill.tier}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Lab Demonstration Console */}
          <div className="lg:col-span-5 bg-[#0E1024] border-2 border-[#38BDF8] p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#26214D] pb-3">
              <div className="flex items-center gap-2 text-[#38BDF8]">
                <Cpu className="w-4 h-4" />
                <span className="font-pixel text-[10px]">LIVE WORKSTATION</span>
              </div>
              <span className="font-mono-tab text-xs text-[#22FF88]">
                {selectedSkill.equippedSlot}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{selectedSkill.name}</h2>
              <p className="text-sm text-[#CBD5E1] mt-2 leading-relaxed">{selectedSkill.summary}</p>
            </div>

            <div className="bg-[#060814] border border-[#31256E] p-4 space-y-3">
              <p className="font-pixel text-[9px] text-[#FFD93D]">
                {selectedSkill.demoHeadline.toUpperCase()}
              </p>
              <ul className="space-y-2">
                {selectedSkill.demoPoints.map((pt) => (
                  <li key={pt} className="text-xs sm:text-sm text-[#E2E8F0] flex items-center gap-2">
                    <span className="text-[#22FF88]">◆</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              {/* Interactive Micro-Demo inside Lab */}
              <div className="pt-3 mt-3 border-t border-[#26214D]">
                {selectedSkill.demoType === 'wireframe' || selectedSkill.demoType === 'grid' ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#94A3B8]">
                        Interactive Fidelity Toggle
                      </span>
                      <div className="flex gap-1 bg-[#121126] p-0.5 border border-[#31256E]">
                        <button
                          onClick={() => setDemoWireframeMode('lowfi')}
                          className={`px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                            demoWireframeMode === 'lowfi'
                              ? 'bg-[#38BDF8] text-[#06060E]'
                              : 'text-[#CBD5E1]'
                          }`}
                        >
                          Wireframe
                        </button>
                        <button
                          onClick={() => setDemoWireframeMode('hifi')}
                          className={`px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                            demoWireframeMode === 'hifi'
                              ? 'bg-[#FF3E9D] text-white'
                              : 'text-[#CBD5E1]'
                          }`}
                        >
                          Styled UI
                        </button>
                      </div>
                    </div>
                    <div
                      className={`p-3 border transition-all ${
                        demoWireframeMode === 'lowfi'
                          ? 'border-dashed border-[#5B45B8] bg-[#0B0B19]'
                          : 'border-[#22FF88] bg-[#161333]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`h-2.5 w-24 ${
                            demoWireframeMode === 'lowfi' ? 'bg-[#31256E]' : 'bg-[#22FF88]'
                          }`}
                        />
                        <div
                          className={`h-4 w-12 ${
                            demoWireframeMode === 'lowfi'
                              ? 'border border-[#5B45B8]'
                              : 'bg-[#FF3E9D]'
                          }`}
                        />
                      </div>
                      <div
                        className={`h-8 w-full ${
                          demoWireframeMode === 'lowfi'
                            ? 'border border-[#31256E]'
                            : 'bg-[#060814] border border-[#38BDF8]'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#CBD5E1]">
                      Test tactile response state ({pulseCount} triggered)
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playStar();
                        setPulseCount((c) => c + 1);
                      }}
                      className="pixel-btn px-3.5 py-1.5 bg-[#22FF88] text-[#06060E] font-pixel text-[9px] border border-white cursor-pointer"
                    >
                      TEST STATE ⚡
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#151330] border border-[#5B45B8] p-4">
              <p className="text-xs font-bold text-[#FF75B5] mb-1">HOW MEERA APPLIES THIS</p>
              <p className="text-sm text-[#E2E8F0] leading-relaxed">{selectedSkill.application}</p>
            </div>
          </div>
        </section>

        {/* Weapons Mastery / Design Software Dock */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0C0E1E] border-2 border-[#FF3E9D] p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-pixel text-[10px] text-[#FF3E9D] mb-1.5">SOFTWARE ARMORY</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Primary Design Tools &amp; Workflow
              </h2>
            </div>
            <span className="text-xs text-[#94A3B8]">Click any tool to inspect workflow</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TOOLS_INVENTORY.map((tool) => {
              const active = tool.id === selectedTool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    soundEngine.playCoin();
                    setSelectedTool(tool);
                  }}
                  className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col gap-3 ${
                    active
                      ? 'bg-[#191536] border-white shadow-[4px_4px_0_0_#FF3E9D]'
                      : 'bg-[#060814] border-[#26214D] hover:border-[#38BDF8]'
                  }`}
                >
                  <div
                    className="w-11 h-11 flex items-center justify-center border-2 border-white font-pixel text-xs text-[#06060E]"
                    style={{ backgroundColor: tool.color }}
                  >
                    {tool.shortCode}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tool.name}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{tool.weaponClass}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pixel-window-retro p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 space-y-2">
              <p className="font-pixel text-[10px] text-[#9D174D]">{selectedTool.weaponClass}</p>
              <h3 className="text-xl font-bold text-[#161129]">
                {selectedTool.name} — {selectedTool.role}
              </h3>
              <p className="text-sm text-[#272038] leading-relaxed">{selectedTool.description}</p>
            </div>
            <div className="md:col-span-5 bg-white border-2 border-[#161129] p-4">
              <p className="text-[11px] font-bold text-[#7E22CE] mb-1">TYPICAL PIPELINE</p>
              <p className="text-sm font-semibold text-[#161129] leading-relaxed">
                {selectedTool.workflowExample}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Interactive UX Thinking Simulator */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0C0E1E] border-2 border-[#22FF88] p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26214D] pb-4">
            <div>
              <p className="font-pixel text-[10px] text-[#22FF88] mb-1.5">
                INTERACTIVE DESIGN THINKING CHALLENGE
              </p>
              <h2 className="text-2xl font-bold text-white">
                UX Problem-Solving Simulator vs. Lord Clutter
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <PixelAvatar subject="meera" size={36} />
                <span className="font-mono-tab text-xs font-bold text-[#22FF88]">
                  UX HP {playerHp}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PixelAvatar subject="boss" size={36} />
                <span className="font-mono-tab text-xs font-bold text-[#FF3E9D]">
                  Clutter {simState === 'CLEARED' ? 0 : bossHp}%
                </span>
              </div>
            </div>
          </div>

          {simState === 'ACTIVE' && activeEncounter && (
            <div className="space-y-4">
              <div className="bg-[#151330] border border-[#5B45B8] p-5">
                <p className="font-pixel text-[9px] text-[#FFD93D] mb-2">
                  {activeEncounter.roundLabel}
                </p>
                <p className="text-xs font-bold text-[#FF75B5] mb-1.5">
                  {activeEncounter.bossAttackName}
                </p>
                <p className="text-base text-white leading-relaxed">{activeEncounter.scenario}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeEncounter.choices.map((c, idx) => {
                  const picked = simFeedback?.choiceId === c.id;
                  return (
                    <button
                      key={c.id}
                      disabled={Boolean(simFeedback)}
                      onClick={() => handleSimChoice(c.id)}
                      className={`text-left p-4 border-2 transition-colors cursor-pointer flex items-start gap-3 ${
                        picked
                          ? c.isOptimal
                            ? 'bg-[#064E3B] border-[#22FF88]'
                            : 'bg-[#4C0519] border-[#FF3E9D]'
                          : 'bg-[#060814] border-[#26214D] hover:border-[#FFD93D]'
                      }`}
                    >
                      <span className="font-pixel text-[10px] text-[#FFD93D] mt-0.5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white leading-relaxed">{c.label}</p>
                        {simFeedback && picked && (
                          <p className="text-xs font-semibold text-[#FFD93D] mt-1">
                            Approach: {c.strategyTag}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {simFeedback && (
                <div
                  className={`p-4 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    simFeedback.isOptimal
                      ? 'bg-[#064E3B]/70 border-[#22FF88]'
                      : 'bg-[#4C0519]/70 border-[#FF3E9D]'
                  }`}
                >
                  <p className="text-sm text-white leading-relaxed">{simFeedback.text}</p>
                  <button
                    onClick={handleSimNext}
                    className="pixel-btn shrink-0 px-5 py-2.5 bg-[#FFD93D] text-[#06060E] font-pixel text-[10px] border-2 border-white cursor-pointer"
                  >
                    {simRound >= BOSS_ENCOUNTERS.length - 1 || playerHp <= 0
                      ? 'COMPLETE LAB ▶'
                      : 'NEXT SCENARIO ▶'}
                  </button>
                </div>
              )}
            </div>
          )}

          {simState === 'CLEARED' && (
            <div className="bg-[#151330] border-2 border-[#22FF88] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#22FF88] text-[#06060E] flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-pixel text-xs text-[#22FF88]">SIMULATION CLEARED!</p>
                  <p className="text-sm text-[#E2E8F0] mt-1">
                    All UX dilemmas resolved using user research, progressive disclosure, and WCAG contrast.
                  </p>
                </div>
              </div>
              <button
                onClick={resetSim}
                className="pixel-btn px-4 py-2.5 bg-[#060814] border-2 border-white text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Simulator</span>
              </button>
            </div>
          )}

          {simState === 'FAILED' && (
            <div className="bg-[#4C0519]/50 border-2 border-[#FF3E9D] p-6 flex items-center justify-between gap-4">
              <p className="text-sm text-white">
                Clutter overwhelmed user patience — reset the simulator and prioritize user clarity!
              </p>
              <button
                onClick={resetSim}
                className="pixel-btn px-5 py-2.5 bg-[#22FF88] text-[#06060E] font-pixel text-[10px] border-2 border-white cursor-pointer"
              >
                RETRY
              </button>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};
