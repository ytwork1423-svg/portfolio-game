import React, { useEffect, useRef } from 'react';
import { getFoxSprite, getMeeraSprite, getStationSprite } from '../game/sprites';

interface PixelAvatarProps {
  subject: 'meera' | 'fox' | 'boss' | 'system';
  size?: number;
  className?: string;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ subject, size = 64, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    let source: HTMLCanvasElement;
    if (subject === 'meera') {
      source = getMeeraSprite('idle1');
    } else if (subject === 'fox') {
      source = getFoxSprite(false);
    } else if (subject === 'boss') {
      source = getStationSprite('boss_hydra');
    } else {
      source = getStationSprite('ds_console');
    }

    const scale = Math.min(canvas.width / source.width, canvas.height / source.height);
    const drawW = source.width * scale;
    const drawH = source.height * scale;
    const offsetX = (canvas.width - drawW) / 2;
    const offsetY = (canvas.height - drawH) / 2;
    ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  }, [subject, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`pixelated ${className}`}
      aria-hidden="true"
    />
  );
};
