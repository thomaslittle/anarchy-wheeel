'use client';

import { cn } from '@/lib/utils';

interface LayoutToggleProps {
  isDragMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function LayoutToggle({
  isDragMode,
  onToggle,
  className
}: LayoutToggleProps) {
  return (
    <div className={cn(
      "fixed top-4 left-4 z-40",
      className
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "px-4 py-2 rounded-lg font-medium transition-all duration-200",
          "border border-[var(--border-color)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2",
          isDragMode
            ? "bg-[var(--accent-primary)] text-white shadow-lg"
            : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        )}
        title={isDragMode ? "Exit layout mode" : "Enter layout mode"}
      >
        {isDragMode ? "🔒 Exit Layout Mode" : "📐 Layout Mode"}
      </button>
    </div>
  );
}