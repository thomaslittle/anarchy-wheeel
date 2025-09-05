'use client';

import { useState } from 'react';
import type { UseOBSReturn } from '@/hooks/useOBS';
import { cn } from '@/lib/utils';

interface OBSConnectionProps {
  obs: UseOBSReturn;
  className?: string;
}

export function OBSConnection({ obs, className }: OBSConnectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempSettings, setTempSettings] = useState(obs.settings);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  const handleConnect = async () => {
    await obs.connect(tempSettings);
  };

  const handleDisconnect = () => {
    obs.disconnect();
    setAvailableSources([]);
  };

  const detectSources = async () => {
    if (!obs.isConnected) return;

    try {
      // This is a simple way to get sources - we'll trigger the detection through the OBS hook
      await obs.showBrowserSource();
    } catch (error: unknown) {
      // Parse error message to extract available sources
      if (error instanceof Error && error.message.includes('Available sources:')) {
        const sourcesMatch = error.message.match(/Available sources: (.+)$/);
        if (sourcesMatch) {
          const sources = sourcesMatch[1].split(', ').filter(s => s.trim());
          setAvailableSources(sources);
        }
      }
    }
  };

  const handleSettingsChange = (field: keyof typeof tempSettings, value: string | number) => {
    setTempSettings((prev: typeof tempSettings) => ({
      ...prev,
      [field]: field === 'port' ? Number(value) : value
    }));
  };

  const getStatusColor = () => {
    switch (obs.connectionStatus.status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (obs.connectionStatus.status) {
      case 'connected':
        return '✅';
      case 'connecting':
        return '🔄';
      case 'error':
        return '❌';
      default:
        return '⭕';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">📺</span>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">OBS Connection</h3>
            <div className={cn("flex items-center gap-2 text-sm", getStatusColor())}>
              <span>{getStatusIcon()}</span>
              <span>{obs.connectionStatus.message}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Host
              </label>
              <input
                type="text"
                value={tempSettings.host}
                onChange={(e) => handleSettingsChange('host', e.target.value)}
                placeholder="localhost"
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Port
              </label>
              <input
                type="number"
                value={tempSettings.port}
                onChange={(e) => handleSettingsChange('port', e.target.value)}
                placeholder="4455"
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Password (optional)
            </label>
            <input
              type="password"
              value={tempSettings.password || ''}
              onChange={(e) => handleSettingsChange('password', e.target.value)}
              placeholder="Enter WebSocket password"
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Browser Source Name
              </label>
              {obs.isConnected && (
                <button
                  onClick={detectSources}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Detect Sources
                </button>
              )}
            </div>
            <input
              type="text"
              value={tempSettings.browserSourceName}
              onChange={(e) => handleSettingsChange('browserSourceName', e.target.value)}
              placeholder="Enter your browser source name"
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
            {availableSources.length > 0 && (
              <div className="mt-2 text-xs">
                <p className="text-[var(--text-secondary)] mb-1">Available sources:</p>
                <div className="flex flex-wrap gap-1">
                  {availableSources.map(source => (
                    <button
                      key={source}
                      onClick={() => handleSettingsChange('browserSourceName', source)}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded border"
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!obs.isConnected ? (
              <button
                onClick={handleConnect}
                disabled={obs.connectionStatus.status === 'connecting'}
                className={cn(
                  "flex-1 px-4 py-2 rounded-md font-medium transition-colors",
                  "bg-green-600 hover:bg-green-700 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {obs.connectionStatus.status === 'connecting' ? 'Connecting...' : 'Connect'}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2 rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          {obs.isConnected && (
            <div className="flex gap-2">
              <button
                onClick={obs.showBrowserSource}
                className="flex-1 px-3 py-2 rounded-md font-medium bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white transition-colors text-sm"
              >
                Show Wheel
              </button>
              <button
                onClick={obs.hideBrowserSource}
                className="flex-1 px-3 py-2 rounded-md font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors text-sm"
              >
                Hide Wheel
              </button>
              <button
                onClick={obs.toggleBrowserSource}
                className="flex-1 px-3 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm"
              >
                Toggle
              </button>
            </div>
          )}

          <div className="text-xs text-[var(--text-secondary)]">
            <p><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Enable WebSocket Server in OBS (Tools → WebSocket Server Settings)</li>
              <li>Add Browser Source with URL: <code className="bg-[var(--bg-primary)] px-1 rounded">https://wheel.crntly.live</code> (add <code className="bg-[var(--bg-primary)] px-1 rounded">/transparent</code> if using transparent mode)</li>
              <li>Enter your WebSocket settings and browser source name below</li>
              <li>Click the &quot;Connect&quot; button to establish the connection</li>
              <li>Use OBS chat commands like !showwheel, !hidewheel, !togglewheel</li>
            </ol>
            
            {/* Chat Commands Info */}
            <div className="p-3 bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)] mb-3">
              <p className="font-medium text-sm text-[var(--text-primary)] mb-2">📢 Chat Commands:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="font-mono text-[var(--accent-primary)]">!showwheel</span> - Show wheel
                </div>
                <div>
                  <span className="font-mono text-[var(--accent-primary)]">!hidewheel</span> - Hide wheel
                </div>
                <div>
                  <span className="font-mono text-[var(--accent-primary)]">!togglewheel</span> - Toggle wheel
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                💡 Commands work even if chat replies are disabled
              </p>
            </div>

            <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
              <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">⚠️ Troubleshooting:</p>
              <ul className="text-amber-600 dark:text-amber-400 space-y-0.5">
                <li>• Browser source name must match exactly</li>
                <li>• Check OBS WebSocket port (default: 4455)</li>
                <li>• OBS and browser must be on same network</li>
                <li>• Try manual buttons first before chat commands</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}