import React, { useEffect, useState } from 'react';
import { DialogueLine } from '../types/game';
import { PixelAvatar } from './PixelAvatar';
import { soundEngine } from '../audio/soundEngine';

interface DialogueBoxProps {
  lines: DialogueLine[];
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ lines, onClose }) => {
  const [lineIdx, setLineIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const currentLine = lines[lineIdx];
  const fullText = currentLine?.text || '';
  const isFinishedTyping = charCount >= fullText.length;

  useEffect(() => {
    setLineIdx(0);
    setCharCount(0);
  }, [lines]);

  useEffect(() => {
    if (!currentLine) return;
    if (charCount >= fullText.length) return;

    const timer = window.setTimeout(() => {
      setCharCount((c) => c + 1);
      if (charCount % 3 === 0) {
        soundEngine.playDialogueBlip();
      }
    }, 18);

    return () => clearTimeout(timer);
  }, [charCount, fullText, currentLine]);

  const handleAdvance = () => {
    if (!isFinishedTyping) {
      setCharCount(fullText.length);
      return;
    }
    if (lineIdx < lines.length - 1) {
      soundEngine.playInteract();
      setLineIdx((i) => i + 1);
      setCharCount(0);
    } else {
      soundEngine.playInteract();
      onClose();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!currentLine) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 sm:bottom-8 z-40 flex justify-center px-4 pointer-events-none">
      <div
        onClick={handleAdvance}
        role="button"
        tabIndex={0}
        className="pointer-events-auto w-full max-w-3xl bg-[#121126]/95 border-3 border-[#22FF88] shadow-[0_0_30px_rgba(34,255,136,0.25),6px_6px_0_0_#000] p-4 sm:p-5 flex items-start gap-4 cursor-pointer"
      >
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#06060E] border-2 border-[#FF3E9D] flex items-center justify-center">
          <PixelAvatar subject={currentLine.portrait} size={64} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-pixel text-[10px] sm:text-xs text-[#22FF88]">
              {currentLine.speaker}
            </span>
            <span className="font-mono-tab text-[11px] text-[#94A3B8]">
              {lineIdx + 1} / {lines.length}
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#F4F4FF] leading-relaxed min-h-[3rem]">
            {fullText.slice(0, charCount)}
          </p>

          <div className="mt-2 flex items-center justify-end gap-4 text-[10px] font-pixel text-[#FFD93D]">
            <span>{isFinishedTyping ? (lineIdx < lines.length - 1 ? 'NEXT [SPACE] ▶' : 'CLOSE [SPACE] ✓') : 'SKIP ▶'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
