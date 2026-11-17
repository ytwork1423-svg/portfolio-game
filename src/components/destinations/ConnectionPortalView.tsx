import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Download, ExternalLink, Mail, Send, Trophy } from 'lucide-react';
import { ACHIEVEMENTS, DESIGNER_PROFILE } from '../../data/portfolioData';
import { HUB_COLLECTIBLES } from '../../game/overworldMap';
import { soundEngine } from '../../audio/soundEngine';

interface ConnectionPortalViewProps {
  xp: number;
  collectedCount: number;
  visitedCount: number;
  unlockedAchievements: string[];
}

export const ConnectionPortalView: React.FC<ConnectionPortalViewProps> = ({
  xp,
  collectedCount,
  visitedCount,
  unlockedAchievements,
}) => {
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(DESIGNER_PROFILE.contact.email).catch(() => {});
    soundEngine.playCoin();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadResume = () => {
    soundEngine.playSuccess();
    const resumeText = [
      `${DESIGNER_PROFILE.name} — ${DESIGNER_PROFILE.role}`,
      `Location: ${DESIGNER_PROFILE.location}`,
      `Email: ${DESIGNER_PROFILE.contact.email}`,
      '',
      'EDUCATION',
      `${DESIGNER_PROFILE.education.degree} | ${DESIGNER_PROFILE.education.institution} (${DESIGNER_PROFILE.education.period})`,
      DESIGNER_PROFILE.education.focus,
      '',
      'MISSION',
      DESIGNER_PROFILE.mission,
      '',
      'CORE SKILLS',
      'UI Design, UX Design, User Research, Wireframing, Prototyping, Interaction Design, Visual Design, Graphic Design, Design Thinking, Usability Testing',
      '',
      'TOOLS',
      'Figma, Adobe Illustrator, Procreate, Canva, Blender',
    ].join('\n');

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Meera_Manoj_Design_Quest_Summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;
    soundEngine.playVictory();
    setSent(true);
  };

  return (
    <div
      className="min-h-screen bg-[#060C1A] text-[#F4F4FF] pt-24 pb-20 px-4 sm:px-8 overflow-y-auto relative"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 15%, rgba(56,189,248,0.18), transparent 48%), radial-gradient(circle at 80% 75%, rgba(34,255,136,0.12), transparent 40%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto space-y-12">
        {/* Celestial Victory Celebration Banner */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0B1429] border-3 border-[#38BDF8] p-7 sm:p-10 text-center space-y-5 shadow-[0_0_50px_rgba(56,189,248,0.2)] relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2.5 text-[#FFD93D]">
            <Trophy className="w-5 h-5" />
            <span className="font-pixel text-[10px] sm:text-xs">
              FINAL DESTINATION · CONNECTION PORTAL ACTIVATED
            </span>
            <Trophy className="w-5 h-5" />
          </div>

          <h1 className="font-pixel text-xl sm:text-3xl text-[#22FF88] leading-tight">
            THANK YOU FOR EXPLORING!
          </h1>

          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed">
            {DESIGNER_PROFILE.contact.availability}. Reach out directly to collaborate on product
            design, internships, visual systems, or interactive experiences.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="bg-[#060C1A] border border-[#31256E] p-3">
              <p className="text-[11px] text-[#94A3B8]">Total Score</p>
              <p className="font-mono-tab text-lg font-bold text-[#22FF88]">{xp} XP</p>
            </div>
            <div className="bg-[#060C1A] border border-[#31256E] p-3">
              <p className="text-[11px] text-[#94A3B8]">Worlds Explored</p>
              <p className="font-mono-tab text-lg font-bold text-[#38BDF8]">{visitedCount}/6</p>
            </div>
            <div className="bg-[#060C1A] border border-[#31256E] p-3">
              <p className="text-[11px] text-[#94A3B8]">Collectibles</p>
              <p className="font-mono-tab text-lg font-bold text-[#FFD93D]">
                {collectedCount}/{HUB_COLLECTIBLES.length}
              </p>
            </div>
            <div className="bg-[#060C1A] border border-[#31256E] p-3">
              <p className="text-[11px] text-[#94A3B8]">Trophies</p>
              <p className="font-mono-tab text-lg font-bold text-[#FF75B5]">
                {unlockedAchievements.length}/{ACHIEVEMENTS.length}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Contact Channels + Collaboration Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 pixel-window-retro p-6 sm:p-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="font-pixel text-[10px] text-[#161129]">DIRECT CHANNELS</p>
              <h2 className="text-2xl font-bold text-[#161129]">Connect with Meera</h2>

              <div className="bg-white border-2 border-[#161129] p-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-[#9D174D] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {DESIGNER_PROFILE.contact.email}
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 bg-[#161129] text-[#22FF88] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'LinkedIn Profile', href: DESIGNER_PROFILE.contact.linkedin },
                  { label: 'Behance Case Studies', href: DESIGNER_PROFILE.contact.behance },
                  { label: 'Dribbble Visual Shots', href: DESIGNER_PROFILE.contact.dribbble },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-3 bg-white border-2 border-[#161129] hover:bg-[#22FF88] text-sm font-bold text-[#161129] transition-colors"
                  >
                    <span>{social.label}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownloadResume}
              className="pixel-btn w-full py-3.5 bg-[#FF3E9D] hover:bg-[#EC4899] text-white border-2 border-[#161129] font-pixel text-[10px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PORTFOLIO SUMMARY</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-[#0B1429] border-2 border-[#31256E] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="font-pixel text-[10px] text-[#38BDF8] mb-2">COLLABORATION PORTAL</p>
              <h2 className="text-2xl font-bold text-white mb-5">Send a Quest Invitation</h2>

              {sent ? (
                <div className="bg-[#064E3B]/60 border-2 border-[#22FF88] p-6 space-y-4">
                  <p className="font-pixel text-xs text-[#22FF88]">QUEST MESSAGE PREPARED!</p>
                  <p className="text-sm sm:text-base text-[#E2E8F0] leading-relaxed">
                    Thank you, <strong className="text-white">{senderName}</strong>! Your inquiry
                    has been logged locally. You can also reach Meera directly at{' '}
                    <span className="text-[#38BDF8]">{DESIGNER_PROFILE.contact.email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setMessage('');
                    }}
                    className="px-4 py-2 bg-[#121126] border border-[#22FF88] text-xs font-semibold text-[#22FF88] cursor-pointer"
                  >
                    Write Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full bg-[#060C1A] border-2 border-[#31256E] focus:border-[#38BDF8] outline-none px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="alex@studio.com"
                        className="w-full bg-[#060C1A] border-2 border-[#31256E] focus:border-[#38BDF8] outline-none px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      Project, Internship or Collaboration Note
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell Meera about your team, product idea, or design opportunity..."
                      className="w-full bg-[#060C1A] border-2 border-[#31256E] focus:border-[#38BDF8] outline-none px-3.5 py-2.5 text-sm text-white resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="pixel-btn px-7 py-3.5 bg-[#22FF88] hover:bg-[#4ADE80] text-[#06060E] font-pixel text-[10px] border-2 border-white inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>SEND INVITATION</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
