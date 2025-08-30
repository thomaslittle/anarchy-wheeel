'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (winner) {
      // Calculate position based on wheel center
      if (wheelRef?.current) {
        const wheelRect = wheelRef.current.getBoundingClientRect();
        const centerX = wheelRect.left + wheelRect.width / 2;
        const centerY = wheelRect.top + wheelRect.height / 2;
        setPosition({ x: centerX, y: centerY });
      } else {
        // Fallback to viewport center
        setPosition({ 
          x: window.innerWidth / 2, 
          y: window.innerHeight / 2 
        });
      }
      
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [winner, duration, onComplete, wheelRef]);

  if (!winner || !isVisible) return null;

  const displayText = winnerText.replace(/{winner}/g, winner);
  const textParts = displayText.split('\n');

  return (
    <div 
      className="fixed top-0 left-0 z-50 pointer-events-none"
      style={{
        transform: `translate(-50%, -50%)`,
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div 
        className={cn(
          "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]",
          "text-white px-8 py-6 rounded-xl font-bold text-xl text-center",
          "shadow-[0_10px_30px_var(--shadow-color)]",
          "animate-[winnerPop_0.6s_ease-out]",
          "whitespace-pre-line"
        )}
      >
        {textParts.map((line, index) => (
          <div key={index} className={index > 0 ? 'mt-2' : ''}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}