'use client';

import type { UseOBSReturn } from '@/hooks/useOBS';
import { OBSConnection } from './OBSConnection';
import { cn } from '@/lib/utils';

interface OBSControlsProps {
  obs: UseOBSReturn;
  className?: string;
}

export function OBSControls({ obs, className }: OBSControlsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* OBS Connection Component */}
      <OBSConnection obs={obs} />
    </div>
  );
}