'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
}

export function useConfetti() {
  const fireConfetti = useCallback((options?: ConfettiOptions) => {
    const defaults: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      shapes: ['square', 'circle'],
      scalar: 1.2,
    };

    const finalOptions = { ...defaults, ...options };

    confetti({
      ...finalOptions,
    });
  }, []);

  const fireworksConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 0,
      colors: ['#9146ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  const celebrationConfetti = useCallback(() => {
    fireConfetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 }
    });

    setTimeout(() => {
      fireConfetti({
        particleCount: 50,
        spread: 120,
        origin: { x: 0.3, y: 0.7 }
      });
    }, 150);

    setTimeout(() => {
      fireConfetti({
        particleCount: 50,
        spread: 120,
        origin: { x: 0.7, y: 0.7 }
      });
    }, 300);
  }, [fireConfetti]);

  return {
    fireConfetti,
    fireworksConfetti,
    celebrationConfetti,
  };
}