'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Participant, WheelSettings } from '@/types';
import { cn } from '@/lib/utils';

interface SpinningWheelProps {
  participants: Participant[];
  currentRotation: number;
  settings: WheelSettings;
  isSpinning: boolean;
  className?: string;
  wheelRef?: React.RefObject<HTMLDivElement | null>;
}

export function SpinningWheel({ 
  participants, 
  currentRotation, 
  settings, 
  isSpinning,
  className,
  wheelRef
}: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (participants.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = document.body.getAttribute('data-theme') === 'dark' ? '#2a2a3e' : '#f8f9fa';
      ctx.fill();
      ctx.strokeStyle = '#9146ff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = document.body.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#212529';
      ctx.font = 'bold 18px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('Add participants', centerX, centerY - 10);
      ctx.fillText('to start!', centerX, centerY + 20);
      return;
    }

    const anglePerSegment = (2 * Math.PI) / participants.length;

    // Draw wheel segments
    for (let i = 0; i < participants.length; i++) {
      const startAngle = i * anglePerSegment + currentRotation;
      const endAngle = (i + 1) * anglePerSegment + currentRotation;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = settings.colors[i % settings.colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + anglePerSegment / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);

      let rotation = textAngle;
      if (textAngle > Math.PI / 2 && textAngle < 3 * Math.PI / 2) {
        rotation += Math.PI;
      }
      ctx.rotate(rotation);

      const text = participants[i].username;
      const textWidth = ctx.measureText(text).width;
      
      // Text background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-textWidth/2 - 4, -10, textWidth + 8, 20);

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Segoe UI';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);

      ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#9146ff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + radius - 18, centerY);
    ctx.lineTo(centerX + radius + 15, centerY - 12);
    ctx.lineTo(centerX + radius + 15, centerY + 12);
    ctx.fillStyle = '#9146ff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [participants, currentRotation, settings]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  return (
    <div 
      ref={wheelRef || containerRef}
      className={cn(
        "flex flex-col items-center relative",
        "z-10", // Ensure wheel stays below modals but above background
        className
      )}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className={cn(
          "border-[3px] border-[var(--accent-primary)] rounded-full bg-white",
          "shadow-[0_0_30px_rgba(145,70,255,0.3)]",
          "md:w-[400px] md:h-[400px] w-[300px] h-[300px]",
          "max-w-[90vw] max-h-[90vw]", // Prevent overflow on small screens
          isSpinning && "animate-pulse"
        )}
        style={{
          filter: isSpinning ? 'brightness(1.1)' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}