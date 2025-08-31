'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate weighted segments
  const calculateSegments = useCallback(() => {
    if (participants.length === 0) return [];
    
    const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
    let currentAngle = 0;
    
    return participants.map((participant, index) => {
      const segmentAngle = (participant.weight / totalWeight) * (2 * Math.PI);
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      
      currentAngle += segmentAngle;
      
      return {
        participant,
        startAngle,
        endAngle,
        segmentAngle,
        index
      };
    });
  }, [participants]);

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

    const segments = calculateSegments();

    // Draw wheel segments with weighted sizes
    segments.forEach(({ participant, startAngle, endAngle, segmentAngle, index }) => {
      const rotatedStartAngle = startAngle + currentRotation;
      const rotatedEndAngle = endAngle + currentRotation;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, rotatedStartAngle, rotatedEndAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = settings.colors[index % settings.colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text - adjust font size based on segment size
      const textAngle = rotatedStartAngle + segmentAngle / 2;
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

      const text = participant.username;
      
      // Adjust font size based on segment size (minimum 10px, maximum 16px)
      const baseFontSize = Math.max(10, Math.min(16, (segmentAngle / (Math.PI / 6)) * 14));
      ctx.font = `bold ${baseFontSize}px Segoe UI`;
      
      const textWidth = ctx.measureText(text).width;
      
      // Only draw text background and text if segment is large enough
      if (segmentAngle > 0.1) { // Minimum angle threshold for text visibility
        // Text background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-textWidth/2 - 4, -baseFontSize/2 - 2, textWidth + 8, baseFontSize + 4);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
      }

      ctx.restore();
    });

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
  }, [participants, currentRotation, settings, calculateSegments]);

  // Handle smooth transitions when participant weights change
  useEffect(() => {
    if (!isSpinning) {
      setIsTransitioning(true);
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match the CSS transition duration
      
      return () => clearTimeout(transitionTimer);
    }
  }, [participants.map(p => p.weight).join(','), isSpinning]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  return (
    <div 
      ref={wheelRef || containerRef}
      className={cn(
        "flex flex-col items-center relative",
        "z-10", // Ensure wheel stays below modals but above background
        isTransitioning && "transition-all duration-300 ease-in-out",
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
          "transition-all duration-300 ease-in-out", // Smooth transitions for visual changes
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