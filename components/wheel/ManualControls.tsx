'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Participant } from '@/types';
import { cn } from '@/lib/utils';

interface ManualControlsProps {
  participants: Participant[];
  onAddParticipant: (username: string) => void;
  onRemoveWinner: () => void;
  onClearAll: () => void;
  className?: string;
}

export function ManualControls({
  participants,
  onAddParticipant,
  onRemoveWinner,
  onClearAll,
  className
}: ManualControlsProps) {
  const [manualUsername, setManualUsername] = useState('');

  const handleAddParticipant = () => {
    if (manualUsername.trim()) {
      onAddParticipant(manualUsername.trim());
      setManualUsername('');
    }
  };

  const handleClearAll = () => {
    if (participants.length === 0) return;
    
    if (confirm('Remove all participants?')) {
      onClearAll();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
        ⚙️ Manual Controls
      </h3>

      <div className="space-y-3">
        <Input
          value={manualUsername}
          onChange={(e) => setManualUsername(e.target.value)}
          placeholder="Add username manually"
          onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
        />
        
        <Button
          variant="secondary"
          onClick={handleAddParticipant}
          className="w-full"
        >
          ➕ Add Participant
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="danger"
          onClick={handleClearAll}
          className="text-sm"
        >
          🗑️ Clear All
        </Button>
        
        <Button
          variant="secondary"
          onClick={onRemoveWinner}
          className="text-sm"
        >
          ❌ Remove Winner
        </Button>
      </div>
    </div>
  );
}