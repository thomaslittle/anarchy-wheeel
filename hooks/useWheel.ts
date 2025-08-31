'use client';

import { useState, useCallback, useRef } from 'react';
import type { Participant, WheelSettings } from '@/types';

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
];

const DEFAULT_WINNER_TEXT = '🎉 WINNER! 🎉\n{winner}';
const DEFAULT_SPIN_DURATION = 4000;

interface UseWheelReturn {
  participants: Participant[];
  isSpinning: boolean;
  currentRotation: number;
  lastWinner: string | null;
  settings: WheelSettings;
  addParticipant: (username: string) => boolean;
  removeParticipant: (username: string) => boolean;
  removeWinner: () => boolean;
  clearAll: () => void;
  spinWheel: (onWinnerSelected: (winner: string) => void, onTick?: () => void) => void;
  updateSettings: (newSettings: Partial<WheelSettings>) => void;
  resetColors: () => void;
  updateParticipantWeight: (username: string, weight: number) => boolean;
}

export function useWheel(): UseWheelReturn {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [settings, setSettings] = useState<WheelSettings>({
    colors: [...DEFAULT_COLORS],
    winnerText: DEFAULT_WINNER_TEXT,
    spinDuration: DEFAULT_SPIN_DURATION,
  });

  const animationRef = useRef<number | undefined>(undefined);
  const participantCooldown = useRef(new Map<string, number>());

  const addParticipant = useCallback((username: string): boolean => {
    if (!username || typeof username !== 'string') return false;
    
    const now = Date.now();
    const cooldownTime = 5000; // 5 seconds
    
    // Check cooldown
    if (participantCooldown.current.has(username)) {
      const lastEntry = participantCooldown.current.get(username)!;
      if (now - lastEntry < cooldownTime) {
        return false;
      }
    }

    // Check if already participating
    const alreadyExists = participants.some(p => p.username === username);
    if (alreadyExists) return false;

    setParticipants(prev => [...prev, { username, joinedAt: now, weight: 1 }]);
    participantCooldown.current.set(username, now);
    return true;
  }, [participants]);

  const removeParticipant = useCallback((username: string): boolean => {
    const index = participants.findIndex(p => p.username === username);
    if (index === -1) return false;

    setParticipants(prev => prev.filter(p => p.username !== username));
    participantCooldown.current.delete(username);
    return true;
  }, [participants]);

  const removeWinner = useCallback((): boolean => {
    if (!lastWinner) return false;
    
    const success = removeParticipant(lastWinner);
    if (success) {
      setLastWinner(null);
    }
    return success;
  }, [lastWinner, removeParticipant]);

  const clearAll = useCallback(() => {
    setParticipants([]);
    setLastWinner(null);
    participantCooldown.current.clear();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSpinning(false);
  }, []);

  const spinWheel = useCallback((onWinnerSelected: (winner: string) => void, onTick?: () => void) => {
    if (participants.length === 0 || isSpinning) return;

    setIsSpinning(true);
    
    const spinDuration = settings.spinDuration + Math.random() * 2000;
    const spinAmount = Math.random() * 4 + 12;
    const startRotation = currentRotation;
    const startTime = Date.now();
    
    // For tick sound calculation
    let lastTickSegment = -1;
    const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const newRotation = startRotation + (spinAmount * 2 * Math.PI * easeOut);
      
      setCurrentRotation(newRotation);
      
      // Calculate tick sounds during spinning
      if (onTick && progress < 0.95) { // Stop ticking near the end for smoother finish
        const normalizedRotation = ((newRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
        const pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        
        let currentAngle = 0;
        let currentSegment = -1;
        
        for (let i = 0; i < participants.length; i++) {
          const segmentAngle = (participants[i].weight / totalWeight) * (2 * Math.PI);
          const segmentEnd = currentAngle + segmentAngle;
          
          if (pointerAngle >= currentAngle && pointerAngle < segmentEnd) {
            currentSegment = i;
            break;
          }
          
          currentAngle += segmentAngle;
        }
        
        if (currentSegment !== lastTickSegment && currentSegment !== -1) {
          onTick();
          lastTickSegment = currentSegment;
        }
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Calculate winner based on which weighted segment is under the pointer
        // The pointer is at the 3 o'clock position (0 radians from the right)
        
        // Normalize rotation to 0-2π range
        const normalizedRotation = ((newRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
        
        // Calculate which segment is under the pointer
        // Since the wheel rotates clockwise and segments are drawn starting from 0 radians,
        // we need to reverse the rotation to find which segment aligns with the pointer
        const pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        
        // Calculate weighted segments to find which one contains the pointer angle
        const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
        let currentAngle = 0;
        let winnerIndex = 0;
        
        for (let i = 0; i < participants.length; i++) {
          const segmentAngle = (participants[i].weight / totalWeight) * (2 * Math.PI);
          const segmentEnd = currentAngle + segmentAngle;
          
          if (pointerAngle >= currentAngle && pointerAngle < segmentEnd) {
            winnerIndex = i;
            break;
          }
          
          currentAngle += segmentAngle;
        }
        
        const winner = participants[winnerIndex].username;
        
        setLastWinner(winner);
        setIsSpinning(false);
        onWinnerSelected(winner);
      }
    };

    animate();
  }, [participants, isSpinning, currentRotation, settings.spinDuration]);

  const updateSettings = useCallback((newSettings: Partial<WheelSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetColors = useCallback(() => {
    setSettings(prev => ({ ...prev, colors: [...DEFAULT_COLORS] }));
  }, []);

  const updateParticipantWeight = useCallback((username: string, weight: number): boolean => {
    if (weight < 0.1 || weight > 10) return false;
    
    setParticipants(prev => prev.map(p => 
      p.username === username ? { ...p, weight } : p
    ));
    return true;
  }, []);

  return {
    participants,
    isSpinning,
    currentRotation,
    lastWinner,
    settings,
    addParticipant,
    removeParticipant,
    removeWinner,
    clearAll,
    spinWheel,
    updateSettings,
    resetColors,
    updateParticipantWeight,
  };
}