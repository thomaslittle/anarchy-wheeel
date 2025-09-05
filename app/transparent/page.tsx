'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useWheel } from '@/hooks/useWheel';
import { useTwitch } from '@/hooks/useTwitch';
import { useOBS } from '@/hooks/useOBS';
import { useChatCommands } from '@/hooks/useChatCommands';
import { useAudio } from '@/hooks/useAudio';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfetti } from '@/hooks/useConfetti';
import { useLayoutManager } from '@/hooks/useLayoutManager';

import { SpinningWheel } from '@/components/wheel/SpinningWheel';
import { WinnerAnnouncement } from '@/components/wheel/WinnerAnnouncement';
import { ParticipantList } from '@/components/wheel/ParticipantList';
import { WheelControls } from '@/components/wheel/WheelControls';
import { ManualControls } from '@/components/wheel/ManualControls';

import { UserInfo } from '@/components/auth/UserInfo';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { SettingsToggle } from '@/components/ui/SettingsToggle';
import { Notifications } from '@/components/ui/Notifications';
import { DraggableSection } from '@/components/ui/DraggableSection';
import { LayoutToggle } from '@/components/ui/LayoutToggle';

import { SettingsModal } from '@/components/settings/SettingsModal';
import { LayoutControlPanel } from '@/components/ui/LayoutControlPanel';
import { OBSControls } from '@/components/obs/OBSControls';

import { cn } from '@/lib/utils';

export default function TransparentMode() {
  const [showWinner, setShowWinner] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewWinnerText, setPreviewWinnerText] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wheel = useWheel();
  const twitch = useTwitch();
  const obs = useOBS();
  const { playCongratsSound, playTickSound } = useAudio();
  const notifications = useNotifications();
  const { celebrationConfetti } = useConfetti();
  const layoutManager = useLayoutManager();
  
  const chatCommands = useChatCommands({
    obs,
    onSendChatMessage: twitch.sendChatMessage,
    onNotification: (message, type) => notifications.addNotification(message, type),
    onRemoveParticipant: wheel.removeParticipant
  });

  // Debug: Log chatCommands creation
  useEffect(() => {
    console.log('Transparent page chatCommands created:', chatCommands);
    console.log('Transparent page available commands:', chatCommands.getAvailableCommands());
  }, [chatCommands]);

  // Debug: Log OBS connection status when it changes
  useEffect(() => {
    console.log('Transparent page OBS status changed:', obs.connectionStatus, 'isConnected:', obs.isConnected);
    console.log('Transparent page OBS instance ID:', obs);
  }, [obs]);

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

    twitch.setOnChatMessage(async (username, message, isModerator, isBroadcaster) => {
      console.log('Transparent app received chat message:', { username, message, isModerator, isBroadcaster });
      
      // Handle chat commands first (including OBS commands)
      console.log('Transparent page calling chatCommands.handleChatMessage...');
      console.log('Transparent page chatCommands instance:', chatCommands);
      console.log('Transparent page OBS at message time:', { isConnected: obs.isConnected, status: obs.connectionStatus });
      await chatCommands.handleChatMessage(username, message, isModerator, isBroadcaster);

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
  }, [twitch, wheel, notifications, handleSpin, chatCommands]);

  const handlePreviewWinner = (winnerText: string) => {
    setPreviewWinnerText(winnerText);
    setShowWinner('TestUser');
    setIsSettingsOpen(false);
    
    setTimeout(() => {
      setShowWinner(null);
      setPreviewWinnerText(null);
      setIsSettingsOpen(true);
    }, 3000);
  };

  if (!twitch.user) {
    return (
      <div className="obs-transparent min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">
            🎯 OBS Wheel Mode
          </h1>
          <p className="text-white/80 mb-6">
            Please connect your Twitch account from the main page first
          </p>
          <Link 
            href="/" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Main Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="obs-transparent min-h-screen relative">
      {/* Minimal UI Controls for OBS */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <SoundToggle />
        <SettingsToggle onClick={() => setIsSettingsOpen(true)} />
        <LayoutToggle 
          isDragMode={layoutManager.isDragMode}
          onToggle={layoutManager.toggleDragMode}
        />
      </div>

      {/* Main Content - Optimized for OBS */}
      <div className={cn(
        "relative min-h-screen",
        layoutManager.isDragMode && "p-4"
      )}>
        {layoutManager.isDragMode ? (
          // OBS Drag Mode Layout - Transparent Background
          <>
            {/* Layout Control Panel */}
            <LayoutControlPanel
              sectionLayouts={layoutManager.sectionLayouts}
              onVisibilityToggle={layoutManager.toggleSectionVisibility}
              onReset={layoutManager.resetLayout}
              onExitLayoutMode={layoutManager.toggleDragMode}
            />

            {/* Participant List */}
            <DraggableSection
              id="participant-list"
              defaultPosition={layoutManager.sectionLayouts.get('participant-list')?.position || { x: 20, y: 80 }}
              isLocked={layoutManager.sectionLayouts.get('participant-list')?.isLocked || false}
              isVisible={layoutManager.sectionLayouts.get('participant-list')?.isVisible !== false}
              onLockToggle={layoutManager.toggleSectionLock}
              onVisibilityToggle={layoutManager.toggleSectionVisibility}
              onPositionChange={layoutManager.updateSectionPosition}
              className="absolute w-80"
            >
              <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
                <ParticipantList
                  participants={wheel.participants}
                  onRemoveParticipant={wheel.removeParticipant}
                />
              </div>
            </DraggableSection>

            {/* Wheel Section - Center Stage */}
            <DraggableSection
              id="wheel-section"
              defaultPosition={layoutManager.sectionLayouts.get('wheel-section')?.position || { x: 420, y: 80 }}
              isLocked={layoutManager.sectionLayouts.get('wheel-section')?.isLocked || false}
              isVisible={layoutManager.sectionLayouts.get('wheel-section')?.isVisible !== false}
              onLockToggle={layoutManager.toggleSectionLock}
              onVisibilityToggle={layoutManager.toggleSectionVisibility}
              onPositionChange={layoutManager.updateSectionPosition}
              className="absolute"
            >
              <div className="flex flex-col items-center">
                <SpinningWheel
                  participants={wheel.participants}
                  currentRotation={wheel.currentRotation}
                  settings={wheel.settings}
                  isSpinning={wheel.isSpinning}
                  className="mb-4"
                  wheelRef={wheelRef}
                />
                
                <button
                  onClick={handleSpin}
                  disabled={wheel.participants.length === 0 || wheel.isSpinning}
                  className={cn(
                    "bg-gradient-to-r from-purple-600 to-blue-500",
                    "text-white text-xl font-bold px-6 py-3 rounded-xl",
                    "transition-all duration-300 ease-in-out",
                    "hover:shadow-[0_8px_20px_rgba(147,51,234,0.4)]",
                    "hover:transform hover:-translate-y-1",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "disabled:transform-none disabled:shadow-none"
                  )}
                >
                  {wheel.isSpinning ? '🌀 Spinning...' : '🎲 SPIN!'}
                </button>
              </div>
            </DraggableSection>

            {/* Manual Controls */}
            <DraggableSection
              id="manual-controls"
              defaultPosition={layoutManager.sectionLayouts.get('manual-controls')?.position || { x: 20, y: 400 }}
              isLocked={layoutManager.sectionLayouts.get('manual-controls')?.isLocked || false}
              isVisible={layoutManager.sectionLayouts.get('manual-controls')?.isVisible !== false}
              onLockToggle={layoutManager.toggleSectionLock}
              onVisibilityToggle={layoutManager.toggleSectionVisibility}
              onPositionChange={layoutManager.updateSectionPosition}
              className="absolute w-80"
            >
              <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
                <ManualControls
                  participants={wheel.participants}
                  onAddParticipant={wheel.addParticipant}
                  onRemoveWinner={wheel.removeWinner}
                  onClearAll={wheel.clearAll}
                />
              </div>
            </DraggableSection>

            {/* Connection Controls */}
            <DraggableSection
              id="connection-controls"
              defaultPosition={layoutManager.sectionLayouts.get('connection-controls')?.position || { x: 800, y: 80 }}
              isLocked={layoutManager.sectionLayouts.get('connection-controls')?.isLocked || false}
              isVisible={layoutManager.sectionLayouts.get('connection-controls')?.isVisible !== false}
              onLockToggle={layoutManager.toggleSectionLock}
              onVisibilityToggle={layoutManager.toggleSectionVisibility}
              onPositionChange={layoutManager.updateSectionPosition}
              className="absolute w-72"
            >
              <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 space-y-4">
                <UserInfo user={twitch.user} onLogout={twitch.logout} />
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

            {/* OBS Controls */}
            <DraggableSection
              id="obs-controls"
              defaultPosition={layoutManager.sectionLayouts.get('obs-controls')?.position || { x: 800, y: 320 }}
              isLocked={layoutManager.sectionLayouts.get('obs-controls')?.isLocked || false}
              isVisible={layoutManager.sectionLayouts.get('obs-controls')?.isVisible !== false}
              onLockToggle={layoutManager.toggleSectionLock}
              onVisibilityToggle={layoutManager.toggleSectionVisibility}
              onPositionChange={layoutManager.updateSectionPosition}
              className="absolute w-80"
            >
              <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
                <OBSControls obs={obs} />
              </div>
            </DraggableSection>
          </>
        ) : (
          // Simple center wheel mode for OBS
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center">
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
                    "bg-gradient-to-r from-purple-600 to-blue-500",
                    "text-white text-2xl font-bold px-8 py-4 rounded-xl",
                    "transition-all duration-300 ease-in-out",
                    "hover:shadow-[0_8px_20px_rgba(147,51,234,0.4)]",
                    "hover:transform hover:-translate-y-1",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "disabled:transform-none disabled:shadow-none",
                    "shadow-lg"
                  )}
                >
                  {wheel.isSpinning ? '🌀 Spinning...' : '🎲 SPIN THE WHEEL!'}
                </button>

                <div className="px-6 py-3 rounded-lg font-medium text-center bg-black/40 backdrop-blur-md border border-white/20 text-white">
                  {wheel.isSpinning ? (
                    <span className="text-yellow-400">Spinning...</span>
                  ) : wheel.participants.length === 0 ? (
                    <span className="text-gray-300">Waiting for participants...</span>
                  ) : wheel.lastWinner ? (
                    <span className="text-green-400">Winner: {wheel.lastWinner}</span>
                  ) : (
                    <span className="text-blue-400">
                      {wheel.participants.length} participants ready!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Winner Announcement - Full Screen Overlay */}
      <WinnerAnnouncement
        winner={showWinner}
        winnerText={previewWinnerText || wheel.settings.winnerText}
        onComplete={() => setShowWinner(null)}
        wheelRef={wheelRef}
      />

      {/* Settings Modal */}
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

      {/* Notifications - Positioned for OBS */}
      <div className="fixed bottom-4 right-4 z-40 max-w-md">
        <Notifications 
          notifications={notifications.notifications}
          onRemove={notifications.removeNotification}
        />
      </div>
    </div>
  );
}