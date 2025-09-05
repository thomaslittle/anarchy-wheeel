'use client';

import { useState } from 'react';
import type { ConnectionStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface WheelControlsProps {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  entryKeyword: string;
  onConnect: (keyword: string) => void;
  onDisconnect: () => void;
  onKeywordChange: (keyword: string) => void;
  className?: string;
}

export function WheelControls({
  connectionStatus,
  isConnected,
  entryKeyword,
  onConnect,
  onDisconnect,
  onKeywordChange,
  className
}: WheelControlsProps) {
  const [keywordInput, setKeywordInput] = useState(entryKeyword);

  const handleConnect = () => {
    if (keywordInput.trim()) {
      onKeywordChange(keywordInput.trim());
      onConnect(keywordInput.trim());
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
          <div className="text-[var(--text-secondary)]">!spin - spin the wheel</div>
          <div className="text-[var(--text-secondary)]">!addentry {'{'}username{'}'} - add a user to the wheel</div>
          <div className="text-[var(--text-secondary)]">!removeentry {'{'}username{'}'} - remove a user from the wheel</div>
          <div className="text-[var(--text-secondary)]">!removewinner - remove the most recent winner</div>
          <div className="text-[var(--text-secondary)]">!weight {'{'}username{'}'} {'{'}2.5{'}'} - set user&apos;s win probability (0.1x - 10x)</div>
        </div>
      </div>

    </div>
  );
}