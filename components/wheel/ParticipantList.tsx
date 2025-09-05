'use client';

import type { Participant } from '@/types';
import { cn } from '@/lib/utils';

interface ParticipantListProps {
  participants: Participant[];
  onRemoveParticipant: (username: string) => void;
  className?: string;
}

export function ParticipantList({ 
  participants, 
  onRemoveParticipant,
  className 
}: ParticipantListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div 
        className={cn(
          "bg-[var(--bg-tertiary)] border border-[var(--border-color)]",
          "rounded-xl p-4 max-h-48 overflow-y-auto"
        )}
      >
        <h4 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
          👥 Participants ({participants.length})
        </h4>

        {participants.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-4">
            No participants yet
          </p>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.username}
                className={cn(
                  "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                  "rounded-lg p-3 flex items-center gap-3",
                  "hover:bg-[var(--bg-tertiary)] transition-colors"
                )}
              >
                <span className="text-[var(--text-primary)] font-medium flex-1 truncate min-w-0">
                  {participant.username}
                </span>
                
                <button
                  onClick={() => onRemoveParticipant(participant.username)}
                  className={cn(
                    "bg-[var(--error-color)] text-white",
                    "px-2 py-1 rounded text-xs font-bold",
                    "hover:opacity-80 transition-opacity",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--error-color)] focus:ring-offset-1"
                  )}
                  aria-label={`Remove ${participant.username}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}