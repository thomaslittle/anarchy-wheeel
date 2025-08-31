'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAudioReturn {
  soundsEnabled: boolean;
  toggleSound: () => void;
  playTickSound: () => void;
  playCongratsSound: () => void;
  playToggleOnSound: () => void;
  playToggleOffSound: () => void;
}

export function useAudio(): UseAudioReturn {
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTickOscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('soundsEnabled');
    if (saved !== null) {
      setSoundsEnabled(saved === 'true');
    }

    if (typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext !== 'undefined') {
      const AudioContextClass = AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playToggleOnSound = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Higher pitch for "on" sound
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.15);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.15);
    } catch (error) {
      console.log('Toggle on sound failed:', error);
    }
  }, []);

  const playToggleOffSound = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Lower pitch for "off" sound
      oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.2);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    } catch (error) {
      console.log('Toggle off sound failed:', error);
    }
  }, []);

  const toggleSound = useCallback(() => {
    const newState = !soundsEnabled;
    setSoundsEnabled(newState);
    localStorage.setItem('soundsEnabled', newState.toString());
    
    // Always play toggle sound regardless of current state to provide feedback
    if (newState) {
      playToggleOnSound();
    } else {
      playToggleOffSound();
    }
  }, [soundsEnabled, playToggleOnSound, playToggleOffSound]);

  const playTickSound = useCallback(() => {
    if (!soundsEnabled || !audioContextRef.current) return;

    try {
      if (currentTickOscillatorRef.current) {
        try {
          currentTickOscillatorRef.current.stop();
        } catch {
          // Ignore if already stopped
        }
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(500, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.08, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.02);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.02);

      currentTickOscillatorRef.current = oscillator;
      oscillator.onended = () => {
        currentTickOscillatorRef.current = null;
      };
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, [soundsEnabled]);

  const playCongratsSound = useCallback(() => {
    if (!soundsEnabled || !audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const frequencies = [523.25, 659.25, 783.99];
      const duration = 0.8;

      frequencies.forEach((freq, index) => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);

        oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime);
        oscillator.type = 'sine';

        const startTime = audioContextRef.current!.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });

      setTimeout(() => {
        const highOsc = audioContextRef.current!.createOscillator();
        const highGain = audioContextRef.current!.createGain();

        highOsc.connect(highGain);
        highGain.connect(audioContextRef.current!.destination);

        highOsc.frequency.setValueAtTime(1046.5, audioContextRef.current!.currentTime);
        highOsc.type = 'sine';

        highGain.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
        highGain.gain.linearRampToValueAtTime(0.2, audioContextRef.current!.currentTime + 0.1);
        highGain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 0.6);

        highOsc.start(audioContextRef.current!.currentTime);
        highOsc.stop(audioContextRef.current!.currentTime + 0.6);
      }, 300);
    } catch (error) {
      console.log('Congratulations sound failed:', error);
    }
  }, [soundsEnabled]);

  return {
    soundsEnabled,
    toggleSound,
    playTickSound,
    playCongratsSound,
    playToggleOnSound,
    playToggleOffSound,
  };
}