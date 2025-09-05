'use client';

import { cn } from '@/lib/utils';

interface HowToUseProps {
  className?: string;
}

export function HowToUse({ className }: HowToUseProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-lg font-semibold text-[var(--accent-primary)]">
        💡 How to Use
      </h3>
      
      <div className="space-y-2 text-[var(--text-secondary)] text-sm">
        <p><strong>1.</strong> Set your entry keyword & connect to chat</p>
        <p><strong>2.</strong> Tell viewers to type the keyword to enter</p>
        <p><strong>3.</strong> Use mod command !spin to spin the wheel</p>
        <p><strong>4.</strong> Or control manually with the buttons!</p>
      </div>
    </div>
  );
}