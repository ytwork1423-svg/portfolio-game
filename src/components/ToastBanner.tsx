import React from 'react';
import { ToastNotification } from '../types/game';
import { Trophy, Sparkles, Star, Compass } from 'lucide-react';

interface ToastBannerProps {
  toasts: ToastNotification[];
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-xs w-full pointer-events-none">
      {toasts.map((toast) => {
        const borderClass =
          toast.kind === 'achievement'
            ? 'border-[#FFD93D]'
            : toast.kind === 'secret'
            ? 'border-[#FF3E9D]'
            : 'border-[#22FF88]';

        const iconColor =
          toast.kind === 'achievement'
            ? 'text-[#FFD93D]'
            : toast.kind === 'secret'
            ? 'text-[#FF3E9D]'
            : 'text-[#22FF88]';

        return (
          <div
            key={toast.id}
            className={`bg-[#0B0B19]/95 border-2 ${borderClass} shadow-[4px_4px_0_0_#000] px-3.5 py-2.5 flex items-center gap-3`}
          >
            <div className={`shrink-0 ${iconColor}`}>
              {toast.kind === 'achievement' ? (
                <Trophy className="w-5 h-5" />
              ) : toast.kind === 'secret' ? (
                <Sparkles className="w-5 h-5" />
              ) : toast.kind === 'quest' ? (
                <Compass className="w-5 h-5" />
              ) : (
                <Star className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-pixel text-[10px] text-white truncate">{toast.title}</p>
              <p className="text-xs text-[#CBD5E1] truncate mt-0.5">{toast.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
