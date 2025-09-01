'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWheel } from '@/hooks/useWheel';
import { useTwitch } from '@/hooks/useTwitch';
import { useAudio } from '@/hooks/useAudio';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfetti } from '@/hooks/useConfetti';
import { useLayoutManager } from '@/hooks/useLayoutManager';

import { SpinningWheel } from '@/components/wheel/SpinningWheel';
import { WinnerAnnouncement } from '@/components/wheel/WinnerAnnouncement';
import { ParticipantList } from '@/components/wheel/ParticipantList';
import { WheelControls } from '@/components/wheel/WheelControls';
import { ManualControls } from '@/components/wheel/ManualControls';
import { HowToUse } from '@/components/wheel/HowToUse';

import { TwitchLogin } from '@/components/auth/TwitchLogin';
import { UserInfo } from '@/components/auth/UserInfo';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { SettingsToggle } from '@/components/ui/SettingsToggle';
import { Notifications } from '@/components/ui/Notifications';
import { DraggableSection } from '@/components/ui/DraggableSection';
import { LayoutToggle } from '@/components/ui/LayoutToggle';

import { SettingsModal } from '@/components/settings/SettingsModal';
import { LayoutControlPanel } from '@/components/ui/LayoutControlPanel';

import { cn } from '@/lib/utils';

export default function Home() {
  const [showWinner, setShowWinner] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewWinnerText, setPreviewWinnerText] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wheel = useWheel();
  const twitch = useTwitch();
  const { playCongratsSound, playTickSound } = useAudio();
  const notifications = useNotifications();
  const { celebrationConfetti } = useConfetti();
  const layoutManager = useLayoutManager();

  const handleSpin = useCallback(() => {
    wheel.spinWheel((winner) => {
      setShowWinner(winner);
      playCongratsSound();
      celebrationConfetti();
    }, playTickSound);
  }, [wheel, playCongratsSound, celebrationConfetti, playTickSound]);

  // Set up Twitch chat message handler
  useEffect(() => {
    if (!twitch.setOnChatMessage) return;

    twitch.setOnChatMessage((username, message, isModerator, isBroadcaster) => {
      // Handle entry with keyword
      if (message.toLowerCase() === twitch.entryKeyword.toLowerCase()) {
        const success = wheel.addParticipant(username);
        if (success) {
          notifications.addNotification(
            `🎯 ${username} entered!`,
            'success'
          );
        }
      }

      // Handle moderator commands
      if (isModerator || isBroadcaster) {
        if (message.toLowerCase() === '!spin') {
          handleSpin();
          notifications.addNotification(
            `🎯 ${username} spun the wheel!`,
            'info'
          );
        } else if (message.toLowerCase().startsWith('!addentry')) {
          const parts = message.split(' ');
          if (parts.length === 2) {
            const entryUsername = parts[1];
            const success = wheel.addParticipant(entryUsername);
            if (success) {
              notifications.addNotification(
                `🎯 ${username} added ${entryUsername} to the wheel!`,
                'success'
              );
            }
          }
        } else if (message.toLowerCase() === '!removewinner') {
          const success = wheel.removeWinner();
          if (success) {
            notifications.addNotification(
              '❌ The most recent winner has been removed from the wheel.',
              'error'
            );
          } else {
            notifications.addNotification(
              '❌ No winner to remove.',
              'error'
            );
          }
        } else if (message.toLowerCase().startsWith('!weight ')) {
          const parts = message.split(' ');
          if (parts.length === 3) {
            const targetUsername = parts[1];
            const weight = parseFloat(parts[2]);
            if (!isNaN(weight) && weight >= 0.1 && weight <= 10) {
              const success = wheel.updateParticipantWeight(targetUsername, weight);
              if (success) {
                notifications.addNotification(
                  `⚖️ ${username} set weight for ${targetUsername} to ${weight}x`,
                  'info'
                );
              } else {
                notifications.addNotification(
                  `❌ Could not set weight for ${targetUsername}. Are they in the wheel?`,
                  'error'
                );
              }
            } else {
              notifications.addNotification(
                '❌ Weight must be between 0.1 and 10.',
                'error'
              );
            }
          }
        }
      }
    });
  }, [twitch, wheel, notifications, handleSpin]);

  const handlePreviewWinner = (winnerText: string) => {
    setPreviewWinnerText(winnerText);
    setShowWinner('TestUser');
    setIsSettingsOpen(false);
  };

  if (!twitch.user) {
    return (
      <>
        <ThemeToggle />
        <SoundToggle />

        <div className="min-h-screen p-5">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              🎯 Twitch Wheel Giveaway
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              Professional giveaway tool for Twitch streamers
            </p>
          </div>

          <TwitchLogin onLogin={twitch.login} />
        </div>

        <Notifications
          notifications={notifications.notifications}
          onRemove={notifications.removeNotification}
        />
      </>
    );
  }

  return (
    <>
      <ThemeToggle />
      <SoundToggle />
      <SettingsToggle onClick={() => setIsSettingsOpen(true)} />
      <LayoutToggle
        isDragMode={layoutManager.isDragMode}
        onToggle={layoutManager.toggleDragMode}
      />

      <div className="min-h-screen p-5">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
            🎯 Twitch Wheel Giveaway
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Professional giveaway tool for Twitch streamers
          </p>
          {twitch.user && (
            <div className="mt-4">
              <a 
                href="/transparent" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                📺 Open OBS Mode
              </a>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Use this link as Browser Source in OBS: <code className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs">http://localhost:3000/transparent</code>
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={cn(
          "relative",
          layoutManager.isDragMode ? "min-h-screen" : "max-w-7xl mx-auto"
        )}>
          {layoutManager.isDragMode ? (
            // Drag Mode Layout
            <>
              {/* Layout Control Panel */}
              <LayoutControlPanel
                sectionLayouts={layoutManager.sectionLayouts}
                onVisibilityToggle={layoutManager.toggleSectionVisibility}
                onReset={layoutManager.resetLayout}
                onExitLayoutMode={layoutManager.toggleDragMode}
              />

              {/* How To Use */}
              <DraggableSection
                id="how-to-use"
                defaultPosition={layoutManager.sectionLayouts.get('how-to-use')?.position || { x: 0, y: 0 }}
                isLocked={layoutManager.sectionLayouts.get('how-to-use')?.isLocked || false}
                isVisible={layoutManager.sectionLayouts.get('how-to-use')?.isVisible !== false}
                onLockToggle={layoutManager.toggleSectionLock}
                onVisibilityToggle={layoutManager.toggleSectionVisibility}
                onPositionChange={layoutManager.updateSectionPosition}
                className="absolute w-80"
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <HowToUse />
                </div>
              </DraggableSection>

              {/* Manual Controls */}
              <DraggableSection
                id="manual-controls"
                defaultPosition={layoutManager.sectionLayouts.get('manual-controls')?.position || { x: 0, y: 200 }}
                isLocked={layoutManager.sectionLayouts.get('manual-controls')?.isLocked || false}
                isVisible={layoutManager.sectionLayouts.get('manual-controls')?.isVisible !== false}
                onLockToggle={layoutManager.toggleSectionLock}
                onVisibilityToggle={layoutManager.toggleSectionVisibility}
                onPositionChange={layoutManager.updateSectionPosition}
                className="absolute w-80"
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <ManualControls
                    participants={wheel.participants}
                    onAddParticipant={wheel.addParticipant}
                    onRemoveWinner={wheel.removeWinner}
                    onClearAll={wheel.clearAll}
                  />
                </div>
              </DraggableSection>

              {/* Participant List */}
              <DraggableSection
                id="participant-list"
                defaultPosition={layoutManager.sectionLayouts.get('participant-list')?.position || { x: 0, y: 400 }}
                isLocked={layoutManager.sectionLayouts.get('participant-list')?.isLocked || false}
                isVisible={layoutManager.sectionLayouts.get('participant-list')?.isVisible !== false}
                onLockToggle={layoutManager.toggleSectionLock}
                onVisibilityToggle={layoutManager.toggleSectionVisibility}
                onPositionChange={layoutManager.updateSectionPosition}
                className="absolute w-80"
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <ParticipantList
                    participants={wheel.participants}
                    onRemoveParticipant={wheel.removeParticipant}
                    onUpdateWeight={wheel.updateParticipantWeight}
                  />
                </div>
              </DraggableSection>

              {/* Wheel Section */}
              <DraggableSection
                id="wheel-section"
                defaultPosition={layoutManager.sectionLayouts.get('wheel-section')?.position || { x: 400, y: 0 }}
                isLocked={layoutManager.sectionLayouts.get('wheel-section')?.isLocked || false}
                isVisible={layoutManager.sectionLayouts.get('wheel-section')?.isVisible !== false}
                onLockToggle={layoutManager.toggleSectionLock}
                onVisibilityToggle={layoutManager.toggleSectionVisibility}
                onPositionChange={layoutManager.updateSectionPosition}
                className="absolute w-[480px]"
              >
                <div
                  className={cn(
                    "flex flex-col items-center p-8 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <SpinningWheel
                    participants={wheel.participants}
                    currentRotation={wheel.currentRotation}
                    settings={wheel.settings}
                    isSpinning={wheel.isSpinning}
                    className="mb-6"
                    wheelRef={wheelRef}
                  />

                  <div className="text-center space-y-4">
                    <button
                      onClick={handleSpin}
                      disabled={wheel.participants.length === 0 || wheel.isSpinning}
                      className={cn(
                        "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]",
                        "text-white text-2xl font-bold px-8 py-5 rounded-xl",
                        "transition-all duration-300 ease-in-out",
                        "hover:shadow-[0_8px_20px_rgba(145,70,255,0.4)]",
                        "hover:transform hover:-translate-y-1",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        "disabled:transform-none disabled:shadow-none",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2"
                      )}
                    >
                      🎲 SPIN THE WHEEL!
                    </button>

                    <div
                      className={cn(
                        "p-4 rounded-lg font-medium text-center",
                        "bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                      )}
                    >
                      {wheel.isSpinning ? (
                        <span className="text-[var(--warning-color)]">Spinning...</span>
                      ) : wheel.participants.length === 0 ? (
                        <span className="text-[var(--text-secondary)]">Add participants to get started!</span>
                      ) : wheel.lastWinner ? (
                        <span className="text-[var(--success-color)]">Winner: {wheel.lastWinner}</span>
                      ) : (
                        <span className="text-[var(--success-color)]">
                          {wheel.participants.length} participants ready!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DraggableSection>

              {/* Connection Controls */}
              <DraggableSection
                id="connection-controls"
                defaultPosition={layoutManager.sectionLayouts.get('connection-controls')?.position || { x: 400, y: 500 }}
                isLocked={layoutManager.sectionLayouts.get('connection-controls')?.isLocked || false}
                isVisible={layoutManager.sectionLayouts.get('connection-controls')?.isVisible !== false}
                onLockToggle={layoutManager.toggleSectionLock}
                onVisibilityToggle={layoutManager.toggleSectionVisibility}
                onPositionChange={layoutManager.updateSectionPosition}
                className="absolute w-96"
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <UserInfo user={twitch.user} onLogout={twitch.logout} className="mb-6" />

                  <WheelControls
                    connectionStatus={twitch.connectionStatus}
                    isConnected={twitch.isConnected}
                    entryKeyword={twitch.entryKeyword}
                    onConnect={twitch.connectToChat}
                    onDisconnect={twitch.disconnectFromChat}
                    onKeywordChange={twitch.setEntryKeyword}
                  />
                </div>
              </DraggableSection>
            </>
          ) : (
            // Normal Layout
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              {/* Left Sidebar Sections */}
              <div className="w-full xl:w-80 space-y-6">
                {/* How To Use */}
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <HowToUse />
                </div>

                {/* Manual Controls */}
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <ManualControls
                    participants={wheel.participants}
                    onAddParticipant={wheel.addParticipant}
                    onRemoveWinner={wheel.removeWinner}
                    onClearAll={wheel.clearAll}
                  />
                </div>

                {/* Participant List */}
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <ParticipantList
                    participants={wheel.participants}
                    onRemoveParticipant={wheel.removeParticipant}
                    onUpdateWeight={wheel.updateParticipantWeight}
                  />
                </div>
              </div>

              {/* Right Side - Wheel and Controls */}
              <div className="flex-1 space-y-8">
                {/* Wheel Section */}
                <div
                  className={cn(
                    "flex flex-col items-center p-8 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <SpinningWheel
                    participants={wheel.participants}
                    currentRotation={wheel.currentRotation}
                    settings={wheel.settings}
                    isSpinning={wheel.isSpinning}
                    className="mb-6"
                    wheelRef={wheelRef}
                  />

                  <div className="text-center space-y-4">
                    <button
                      onClick={handleSpin}
                      disabled={wheel.participants.length === 0 || wheel.isSpinning}
                      className={cn(
                        "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]",
                        "text-white text-2xl font-bold px-8 py-5 rounded-xl",
                        "transition-all duration-300 ease-in-out",
                        "hover:shadow-[0_8px_20px_rgba(145,70,255,0.4)]",
                        "hover:transform hover:-translate-y-1",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        "disabled:transform-none disabled:shadow-none",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2"
                      )}
                    >
                      🎲 SPIN THE WHEEL!
                    </button>

                    <div
                      className={cn(
                        "p-4 rounded-lg font-medium text-center",
                        "bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                      )}
                    >
                      {wheel.isSpinning ? (
                        <span className="text-[var(--warning-color)]">Spinning...</span>
                      ) : wheel.participants.length === 0 ? (
                        <span className="text-[var(--text-secondary)]">Add participants to get started!</span>
                      ) : wheel.lastWinner ? (
                        <span className="text-[var(--success-color)]">Winner: {wheel.lastWinner}</span>
                      ) : (
                        <span className="text-[var(--success-color)]">
                          {wheel.participants.length} participants ready!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Info and Connection Controls */}
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
                    "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]"
                  )}
                >
                  <UserInfo user={twitch.user} onLogout={twitch.logout} className="mb-6" />

                  <WheelControls
                    connectionStatus={twitch.connectionStatus}
                    isConnected={twitch.isConnected}
                    entryKeyword={twitch.entryKeyword}
                    onConnect={twitch.connectToChat}
                    onDisconnect={twitch.disconnectFromChat}
                    onKeywordChange={twitch.setEntryKeyword}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals and Overlays */}
      <WinnerAnnouncement
        winner={showWinner}
        winnerText={previewWinnerText || wheel.settings.winnerText}
        onComplete={() => setShowWinner(null)}
        wheelRef={wheelRef}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={wheel.settings}
        onUpdateSettings={wheel.updateSettings}
        onResetColors={wheel.resetColors}
        onPreviewWinner={handlePreviewWinner}
        participants={wheel.participants}
        onUpdateWeight={wheel.updateParticipantWeight}
      />

      <Notifications
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
      />
    </>
  );
}