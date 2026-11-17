import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Edit3, Save, X } from 'lucide-react';
import { EditableProjectItem } from '../../types/projectsExhibition';
import { EditorialArtworkPlate } from './EditorialArtworkPlate';
import { soundEngine } from '../../audio/soundEngine';

interface CaseStudyDossierModalProps {
  project: EditableProjectItem;
  isCompleted: boolean;
  activeVideoProjectId: string | null;
  onActivateVideo: (projectId: string) => void;
  onUploadImage: (projectId: string, file: File, slot?: 'primary' | 'secondary' | 'detail') => void;
  onUploadVideo: (projectId: string, file: File) => void;
  onClearMedia: (projectId: string, kind: 'image' | 'video') => void;
  onSaveProject: (updated: EditableProjectItem) => void;
  onCompleteQuest: (questId: string) => void;
  onClose: () => void;
}

export const CaseStudyDossierModal: React.FC<CaseStudyDossierModalProps> = ({
  project,
  isCompleted,
  activeVideoProjectId,
  onActivateVideo,
  onUploadImage,
  onUploadVideo,
  onClearMedia,
  onSaveProject,
  onCompleteQuest,
  onClose,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableProjectItem>(project);

  useEffect(() => {
    setDraft(project);
  }, [project]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSuccess();
    onSaveProject({ ...draft, isDemoPlaceholder: false });
    setEditing(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#140742]/82 backdrop-blur-md overflow-y-auto px-4 sm:px-8 py-10 sm:py-16"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1080px] mx-auto pixel-polaroid rounded-[24px] overflow-hidden"
      >
        {/* Arcade Marquee Modal Header */}
        <div className="bg-gradient-to-r from-[#2D0E96] via-[#4C1EDB] to-[#D81B60] text-white px-6 sm:px-10 py-6 border-b-[3px] border-[#150C36] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tab text-[#FFE14D]">
              <span>{project.code}</span>
              <span aria-hidden="true">·</span>
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.isDemoPlaceholder ? 'DEMO SLOT' : 'CUSTOM CASE STUDY'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-[2px_2px_0_#150C36]">
              {project.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playInteract();
                setEditing((v) => !v);
              }}
              className="px-4 py-2 bg-[#FFE14D] hover:bg-white text-[#150C36] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editing ? 'Cancel Edit' : 'Edit Project'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-[#FF4785] hover:bg-white text-white hover:text-[#150C36] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] cursor-pointer"
              aria-label="Close case study"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="p-6 sm:p-10 space-y-5 bg-[#FFFDF5]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">PROJECT TITLE</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">CATEGORY</span>
                <input
                  type="text"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">ROLE</span>
                <input
                  type="text"
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">PROTOTYPE LINK LABEL</span>
                <input
                  type="text"
                  value={draft.liveLinkPlaceholder}
                  onChange={(e) => setDraft({ ...draft, liveLinkPlaceholder: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-pixel text-[#3D2E75]">SHORT SUMMARY</span>
              <textarea
                rows={2}
                value={draft.tagline}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">01 · OVERVIEW</span>
                <textarea
                  rows={4}
                  value={draft.overview}
                  onChange={(e) => setDraft({ ...draft, overview: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">02 · PROBLEM STATEMENT</span>
                <textarea
                  rows={4}
                  value={draft.problemStatement}
                  onChange={(e) => setDraft({ ...draft, problemStatement: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">WIREFRAMES &amp; FLOW</span>
                <textarea
                  rows={3}
                  value={draft.wireframeNotes}
                  onChange={(e) => setDraft({ ...draft, wireframeNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-pixel text-[#3D2E75]">OUTCOMES &amp; LEARNINGS</span>
                <textarea
                  rows={3}
                  value={draft.finalOutcome}
                  onChange={(e) => setDraft({ ...draft, finalOutcome: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[#150C36] text-sm text-[#150C36] focus:border-[#FF4785] focus:outline-none"
                />
              </label>
            </div>

            <div className="pt-4 border-t-2 border-[#150C36]/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-xs font-bold text-[#3D2E75] hover:text-[#150C36] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#22FF88] hover:bg-[#FFE14D] text-[#150C36] border-2 border-[#150C36] shadow-[3px_3px_0_#150C36] font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 sm:p-10 space-y-10 bg-[#FFFDF5]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <EditorialArtworkPlate
                  variant={project.demoVariant}
                  frameStyle="arcade-crt"
                  title={project.title}
                  subtitle={project.tagline}
                  imageUrl={project.media.imageUrl}
                  videoUrl={project.media.videoUrl}
                  videoId={`modal-${project.id}`}
                  activeVideoId={activeVideoProjectId}
                  isDemo={project.isDemoPlaceholder}
                  editMode={true}
                  onActivateVideo={onActivateVideo}
                  onUploadImage={(file) => onUploadImage(project.id, file, 'primary')}
                  onUploadVideo={(file) => onUploadVideo(project.id, file)}
                  onClearMedia={(kind) => onClearMedia(project.id, kind)}
                  className="w-full aspect-video"
                />
              </div>

              <div className="lg:col-span-5 space-y-5">
                <p className="text-base sm:text-lg text-[#271C54] font-medium leading-relaxed">
                  {project.tagline}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-[#150C36]/15">
                  <div>
                    <p className="text-xs font-mono-tab text-[#6B5CA5]">ROLE</p>
                    <p className="text-sm font-bold text-[#150C36] mt-0.5">{project.role}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono-tab text-[#6B5CA5]">DURATION</p>
                    <p className="text-sm font-bold text-[#150C36] mt-0.5">{project.duration}</p>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#150C36]/15">
                  <p className="font-mono-tab text-[11px] text-[#6B5CA5] mb-1.5">DELIVERABLES</p>
                  <p className="text-sm font-medium text-[#150C36] leading-relaxed">
                    {project.deliverables.join(' · ')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSuccess();
                    onCompleteQuest(project.id);
                  }}
                  className={`w-full py-3.5 border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] font-pixel text-[9px] flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    isCompleted
                      ? 'bg-[#22FF88] text-[#150C36]'
                      : 'bg-[#FF8C00] hover:bg-[#FFE14D] text-[#150C36]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleted ? 'QUEST REVIEWED ★' : 'MARK REVIEWED (+100 XP)'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 border-t-2 border-[#150C36]/15">
              <div className="bg-white border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] rounded-xl p-5 space-y-2">
                <p className="font-pixel text-[9px] text-[#3B17C2]">01 · OVERVIEW</p>
                <p className="text-sm text-[#271C54] leading-relaxed">{project.overview}</p>
              </div>

              <div className="bg-white border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] rounded-xl p-5 space-y-2">
                <p className="font-pixel text-[9px] text-[#D81B60]">02 · PROBLEM</p>
                <p className="text-sm text-[#271C54] leading-relaxed">{project.problemStatement}</p>
              </div>

              <div className="bg-white border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] rounded-xl p-5 space-y-3">
                <p className="font-pixel text-[9px] text-[#FF7B00]">03 · RESEARCH</p>
                <ul className="space-y-2">
                  {project.researchInsights.map((item, idx) => (
                    <li key={idx} className="text-sm text-[#271C54] leading-relaxed flex gap-2.5">
                      <span className="font-pixel text-[9px] text-[#FF7B00] mt-1">0{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] rounded-xl p-5 space-y-3">
                <p className="font-pixel text-[9px] text-[#0891B2]">04 · PROCESS</p>
                <ul className="space-y-2">
                  {project.designApproach.map((step, idx) => (
                    <li key={idx} className="text-sm text-[#271C54] leading-relaxed flex gap-2.5">
                      <span className="font-pixel text-[9px] text-[#0891B2] mt-1">0{idx + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] rounded-xl p-5 space-y-2">
                <p className="font-pixel text-[9px] text-[#3B17C2]">05 · WIREFRAMES &amp; UI</p>
                <p className="text-sm text-[#271C54] leading-relaxed">{project.wireframeNotes}</p>
                <p className="text-sm text-[#271C54] leading-relaxed pt-1">{project.finalUiNotes}</p>
              </div>

              <div className="bg-[#ECFFF4] border-2 border-[#150C36] shadow-[4px_4px_0_#150C36] rounded-xl p-5 space-y-2">
                <p className="font-pixel text-[9px] text-[#0E7A43]">06 · OUTCOMES &amp; LEARNINGS</p>
                <p className="text-sm text-[#150C36] font-semibold leading-relaxed">
                  {project.finalOutcome}
                </p>
                <ul className="space-y-1.5 pt-2">
                  {project.learnings.map((l, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-[#1E3B2B] flex gap-2">
                      <span className="text-[#16A34A] font-bold">✓</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
