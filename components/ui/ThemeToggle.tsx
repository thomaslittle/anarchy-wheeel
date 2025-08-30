'use client';

import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className={cn(
        "fixed top-5 right-5 z-40",
        "rounded-full px-4 py-3",
        "hover:shadow-[0_5px_15px_var(--shadow-color)]",
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </Button>
  );
}