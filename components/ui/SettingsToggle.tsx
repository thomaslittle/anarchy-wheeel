'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SettingsToggleProps {
  onClick: () => void;
  className?: string;
}

export function SettingsToggle({ onClick, className }: SettingsToggleProps) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      className={cn(
        "fixed top-[140px] right-5 z-40",
        "rounded-full px-4 py-3",
        "hover:shadow-[0_5px_15px_var(--shadow-color)]",
        className
      )}
      aria-label="Open settings"
    >
      ⚙️ Settings
    </Button>
  );
}