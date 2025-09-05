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

  const drawParticipantNames = useCallback((
    ctx: CanvasRenderingContext2D, 
    segments: { participant: Participant; startAngle: number; endAngle: number; segmentAngle: number; index: number }[], 
    centerX: number, 
    centerY: number, 
    radius: number,
    isImageMode: boolean
  ) => {
    segments.forEach(({ participant, startAngle, segmentAngle }) => {
      // In both modes, we need to add the current rotation to get the actual position
      const rotatedStartAngle = startAngle + currentRotation;
      
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
      
      // Dynamic font sizing based on both segment size and text length
      const baseSegmentFontSize = Math.max(10, Math.min(16, (segmentAngle / (Math.PI / 6)) * 14));
      let fontSize = baseSegmentFontSize;
      
      // Calculate available width more conservatively
      // Use the arc length at text radius, but account for:
      // 1. The segment gets narrower toward the center
      // 2. We need padding from segment boundaries
      const arcLength = segmentAngle * textRadius;
      
      // Use 60% of arc length for better boundary respect
      // Also consider radial constraints - text shouldn't go too close to edges
      const maxRadialWidth = (radius - textRadius) * 1.4; // Available radial space
      const maxAngularWidth = arcLength * 0.6; // 60% of arc length for padding
      const availableWidth = Math.min(maxRadialWidth, maxAngularWidth);
      
      // Set initial font and measure text
      ctx.font = `bold ${fontSize}px Segoe UI`;
      let textWidth = ctx.measureText(text).width;
      
      // Scale down font if text is too wide, but don't scale up beyond baseSegmentFontSize
      if (textWidth > availableWidth) {
        fontSize = Math.max(7, (availableWidth / textWidth) * fontSize);
        ctx.font = `bold ${fontSize}px Segoe UI`;
        textWidth = ctx.measureText(text).width;
      }
      
      // Only draw text background and text if segment is large enough
      if (segmentAngle > 0.1) { // Minimum angle threshold for text visibility
        // Text background - make more prominent for image mode
        ctx.fillStyle = isImageMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-textWidth/2 - 4, -fontSize/2 - 2, textWidth + 8, fontSize + 4);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
      }

      ctx.restore();
    });
  }, [currentRotation]);

  const drawCenterAndPointer = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    isImageMode = false
  ) => {
    // Only draw center circle if not in image mode
    if (!isImageMode) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#9146ff';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Always draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + radius - 18, centerY);
    ctx.lineTo(centerX + radius + 15, centerY - 12);
    ctx.lineTo(centerX + radius + 15, centerY + 12);
    ctx.fillStyle = '#9146ff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

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

    // Check if we should draw image mode or color segments
    if (settings.wheelMode === 'image' && settings.wheelImage) {
      // Draw image background
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.clip();
        
        // Apply rotation to the entire context for image mode
        ctx.translate(centerX, centerY);
        ctx.rotate(currentRotation);
        ctx.translate(-centerX, -centerY);
        
        // Calculate dimensions to fill the circle
        const size = radius * 2;
        const imgX = centerX - radius;
        const imgY = centerY - radius;
        
        ctx.drawImage(img, imgX, imgY, size, size);
        ctx.restore();
        
        // Draw participant names over the image
        drawParticipantNames(ctx, segments, centerX, centerY, radius, true);
        
        // Draw center circle and pointer (hide center circle in image mode)
        drawCenterAndPointer(ctx, centerX, centerY, radius, true);
      };
      img.src = settings.wheelImage;
    } else {
      // Draw traditional color segments
      segments.forEach(({ startAngle, endAngle, index }) => {
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
      });
      
      // Draw participant names
      drawParticipantNames(ctx, segments, centerX, centerY, radius, false);
      
      // Draw center circle and pointer (show center circle in color mode)
      drawCenterAndPointer(ctx, centerX, centerY, radius, false);
    }
  }, [participants, currentRotation, settings, calculateSegments, drawParticipantNames, drawCenterAndPointer]);

  // Handle smooth transitions when participant weights change
  useEffect(() => {
    if (!isSpinning) {
      setIsTransitioning(true);
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match the CSS transition duration
      
      return () => clearTimeout(transitionTimer);
    }
  }, [participants, isSpinning]);

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
          "transition-all duration-300 ease-in-out" // Smooth transitions for visual changes
        )}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}