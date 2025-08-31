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
        <p><strong>1.</strong> Set your entry keyword</p>
        <p><strong>2.</strong> Click &quot;Connect to Chat&quot;</p>
        <p><strong>3.</strong> Tell viewers to type the keyword</p>
        <p><strong>4.</strong> Mods can type !spin to spin</p>
        <p><strong>5.</strong> Or click the spin button manually!</p>
      </div>
    </div>
  );
}