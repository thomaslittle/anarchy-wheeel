'use client';

import { useState } from 'react';
import type { Participant, ConnectionStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface WheelControlsProps {
  participants: Participant[];
  isSpinning: boolean;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  entryKeyword: string;
  onSpin: () => void;
  onAddParticipant: (username: string) => void;
  onRemoveWinner: () => void;
  onClearAll: () => void;
  onConnect: (keyword: string) => void;
  onDisconnect: () => void;
  onKeywordChange: (keyword: string) => void;
  className?: string;
}

export function WheelControls({
  participants,
  isSpinning,
  connectionStatus,
  isConnected,
  entryKeyword,
  onSpin,
  onAddParticipant,
  onRemoveWinner,
  onClearAll,
  onConnect,
  onDisconnect,
  onKeywordChange,
  className
}: WheelControlsProps) {
  const [manualUsername, setManualUsername] = useState('');
  const [keywordInput, setKeywordInput] = useState(entryKeyword);

  const handleAddParticipant = () => {
    if (manualUsername.trim()) {
      onAddParticipant(manualUsername.trim());
      setManualUsername('');
    }
  };

  const handleConnect = () => {
    if (keywordInput.trim()) {
      onKeywordChange(keywordInput.trim());
      onConnect(keywordInput.trim());
    }
  };

  const handleClearAll = () => {
    if (participants.length === 0) return;
    
    if (confirm('Remove all participants?')) {
      onClearAll();
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected': return 'text-[var(--success-color)]';
      case 'connecting': return 'text-[var(--warning-color)]';
      case 'error': return 'text-[var(--error-color)]';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Spin Button */}
      <div className="text-center">
        <Button
          variant="spin"
          size="lg"
          onClick={onSpin}
          disabled={participants.length === 0 || isSpinning}
          className="w-full py-5"
        >
          🎲 SPIN THE WHEEL!
        </Button>
        
        <div 
          className={cn(
            "mt-4 p-3 rounded-lg text-center font-medium",
            "bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
          )}
        >
          {isSpinning ? (
            <span className="text-[var(--warning-color)]">Spinning...</span>
          ) : participants.length === 0 ? (
            <span className="text-[var(--text-secondary)]">Add participants to get started!</span>
          ) : (
            <span className="text-[var(--success-color)]">
              {participants.length} participants ready!
            </span>
          )}
        </div>
      </div>

      {/* Giveaway Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
          🎮 Giveaway Settings
        </h3>

        <Input
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="Entry keyword (e.g., !enter)"
        />

        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={isConnected ? onDisconnect : handleConnect}
            className="w-full"
          >
            {isConnected ? '🔌 Disconnect' : '🔗 Connect to Chat'}
          </Button>
          
          <div className="text-sm text-center">
            Status: <span className={getStatusColor()}>{connectionStatus.message}</span>
          </div>
        </div>

        {/* Chat Commands Info */}
        <div 
          className={cn(
            "p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]",
            "text-sm space-y-1"
          )}
        >
          <div className="font-semibold text-[var(--text-primary)] mb-2">Chat Commands:</div>
          <div className="text-[var(--text-secondary)]">!spin - Mods only: spin the wheel</div>
          <div className="text-[var(--text-secondary)]">!addentry {'{'}&quot;username&quot;{'}'} - Mods only: add a user to the wheel</div>
          <div className="text-[var(--text-secondary)]">!removewinner - Mods only: remove the most recent winner</div>
        </div>
      </div>

      {/* Manual Controls */}
      <div className="space-y-4">
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

      {/* How to Use */}
      <div 
        className={cn(
          "space-y-3 pt-6 border-t border-[var(--border-color)]"
        )}
      >
        <h3 className="text-lg font-semibold text-[var(--accent-primary)]">
          💡 How to Use
        </h3>
        
        <div className="space-y-2 text-[var(--text-secondary)] text-sm">
          <p><strong>1.</strong> Set your entry keyword</p>
          <p><strong>2.</strong> Click &ldquo;Connect to Chat&rdquo;</p>
          <p><strong>3.</strong> Tell viewers to type the keyword</p>
          <p><strong>4.</strong> Mods can type !spin to spin</p>
          <p><strong>5.</strong> Or click the spin button manually!</p>
        </div>
      </div>
    </div>
  );
}