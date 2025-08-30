'use client';

import { useAudio } from '@/hooks/useAudio';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const { soundsEnabled, toggleSound } = useAudio();

  return (
    <Button
      variant="secondary"
      onClick={toggleSound}
      className={cn(
        "fixed top-20 right-5 z-40",
        "rounded-full px-4 py-3",
        "hover:shadow-[0_5px_15px_var(--shadow-color)]",
        className
      )}
      aria-label={`Turn sound ${soundsEnabled ? 'off' : 'on'}`}
    >
      {soundsEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
    </Button>
  );
}