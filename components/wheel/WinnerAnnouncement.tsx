'use client';

import { useEffect, useState, useLayoutEffect } from 'react';
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
  const [isPositioned, setIsPositioned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Use layoutEffect to calculate position before paint
  useLayoutEffect(() => {
    if (winner && wheelRef?.current) {
      const updatePosition = () => {
        const wheelRect = wheelRef.current!.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate center relative to document, not viewport
        const centerX = wheelRect.left + scrollX + wheelRect.width / 2;
        const centerY = wheelRect.top + scrollY + wheelRect.height / 2;
        
        setPosition({ x: centerX, y: centerY });
        setIsPositioned(true);
      };

      updatePosition();
      
      // Update position on scroll to keep it centered on wheel
      const handleScroll = () => updatePosition();
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [winner, wheelRef]);

  useEffect(() => {
    if (winner) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsPositioned(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsPositioned(false);
    }
  }, [winner, duration, onComplete]);

  // Don't render until we have a winner and position calculated
  if (!winner || !isVisible || !isPositioned) return null;

  const displayText = winnerText.replace(/{winner}/g, winner);
  const textParts = displayText.split('\n');

  return (
    <div 
      className="fixed top-0 left-0 z-50 pointer-events-none"
      style={{
        transform: `translate(-50%, -50%)`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        willChange: 'transform'
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