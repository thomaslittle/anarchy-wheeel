'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FormatNavigationProps {
  currentFormat: string;
}

const formats = [
  { id: '2d-wheel', name: '🎡 2D Wheel', href: '/2d-wheel' },
  { id: 'deal-no-deal', name: '💼 Deal/No Deal', href: '/deal-no-deal', disabled: true },
  { id: 'hat-draw', name: '🎩 Hat Draw', href: '/hat-draw', disabled: true },
];

export function FormatNavigation({ currentFormat }: FormatNavigationProps) {
  return (
    <div className="fixed top-5 left-5 z-40">
      <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]">
        {formats.map((format) => (
          format.disabled ? (
            <div
              key={format.id}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed",
                "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] opacity-50"
              )}
            >
              {format.name}
            </div>
          ) : (
            <Link
              key={format.id}
              href={format.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-[var(--bg-tertiary)]",
                currentFormat === format.id
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-transparent text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
              )}
            >
              {format.name}
            </Link>
          )
        ))}
      </div>
    </div>
  );
}