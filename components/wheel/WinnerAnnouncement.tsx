'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WinnerAnnouncementProps {
  winner: string | null;
  winnerText: string;
  onComplete?: () => void;
  duration?: number;
  wheelRef?: React.RefObject<HTMLDivElement | null>;
}

export function WinnerAnnouncement({
  winner,
  winnerText,
  onComplete,
  duration = 5000,
  wheelRef
}: WinnerAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [wheelPosition, setWheelPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (winner) {
      setShouldRender(true);

      // Calculate wheel position if wheelRef is provided
      if (wheelRef?.current) {
        const rect = wheelRef.current.getBoundingClientRect();
        setWheelPosition({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height
        });
      }

      // Small delay to ensure DOM is ready
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 10);

      // Auto-hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        // Clean up after fade out animation completes
        setTimeout(() => {
          setShouldRender(false);
          onComplete?.();
        }, 300);
      }, 5000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setIsVisible(false);
      setShouldRender(false);
    }
  }, [winner, wheelRef, onComplete]);

  if (!winner || !shouldRender) return null;

  const displayText = winnerText.replace(/{winner}/g, winner);
  const textParts = displayText.split('\n');

  // Use wheel position if available, otherwise fallback to full screen
  const useWheelPosition = wheelRef?.current && wheelPosition.width > 0;

  return (
    <div
      className={cn(
        "absolute z-50 pointer-events-none",
        "flex items-center justify-center",
        "transition-opacity duration-300 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0",
        !useWheelPosition && "inset-0"
      )}
      style={{
        willChange: 'opacity',
        ...(useWheelPosition ? {
          left: wheelPosition.x + wheelPosition.width / 2,
          top: wheelPosition.y + wheelPosition.height / 2,
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          height: 'auto'
        } : {})
      }}
    >
      <div
        className={cn(
          "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]",
          "text-white font-bold text-center",
          "shadow-[0_10px_30px_var(--shadow-color)]",
          "border-4 border-white/20",
          "backdrop-blur-sm",
          "transform transition-all duration-600 ease-out",
          isVisible
            ? "scale-100 translate-y-0"
            : "scale-75 translate-y-4",
          "whitespace-pre-line",
          // Responsive padding and sizing
          "px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6",
          "rounded-lg sm:rounded-xl",
          "max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl",
          "mx-4"
        )}
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          minHeight: textParts.length > 2 ? '120px' : '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {textParts.map((line, index) => {
          // Calculate responsive font sizes based on content length and line count
          const totalLines = textParts.length;
          const lineLength = line.length;

          let baseFontSize = 'text-xl'; // Default

          if (totalLines === 1) {
            // Single line - scale based on length
            if (lineLength <= 15) baseFontSize = 'text-2xl md:text-3xl';
            else if (lineLength <= 25) baseFontSize = 'text-xl md:text-2xl';
            else if (lineLength <= 40) baseFontSize = 'text-lg md:text-xl';
            else baseFontSize = 'text-base md:text-lg';
          } else if (totalLines === 2) {
            // Two lines - adjust based on which line and length
            if (index === 0) {
              // First line - usually title/celebration
              if (lineLength <= 20) baseFontSize = 'text-xl md:text-2xl';
              else baseFontSize = 'text-lg md:text-xl';
            } else {
              // Second line - usually winner name
              if (lineLength <= 15) baseFontSize = 'text-lg md:text-xl';
              else baseFontSize = 'text-base md:text-lg';
            }
          } else {
            // Three or more lines - smaller fonts
            if (index === 0 && lineLength <= 20) {
              baseFontSize = 'text-lg md:text-xl';
            } else {
              baseFontSize = 'text-base md:text-lg';
            }
          }

          return (
            <div key={index} className={cn(
              "leading-tight",
              index > 0 && (totalLines > 2 ? 'mt-1' : 'mt-2'),
              baseFontSize,
              // Add emphasis to first line if it's likely a title
              index === 0 && totalLines > 1 && 'font-extrabold'
            )}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}