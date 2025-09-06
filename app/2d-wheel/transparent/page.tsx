'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWheel } from '@/hooks/useWheel';
import { useTwitch } from '@/hooks/useTwitch';
import { useOBS } from '@/hooks/useOBS';
import { useChatCommands } from '@/hooks/useChatCommands';
import { useAudio } from '@/hooks/useAudio';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfetti } from '@/hooks/useConfetti';

import { SpinningWheel } from '@/components/wheel/SpinningWheel';
import { WinnerAnnouncement } from '@/components/wheel/WinnerAnnouncement';
import { TwitchLogin } from '@/components/auth/TwitchLogin';

export default function Wheel2DTransparent() {
  const [showWinner, setShowWinner] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wheel = useWheel();
  const twitch = useTwitch();
  const obs = useOBS();
  const { playCongratsSound, playTickSound } = useAudio();
  const notifications = useNotifications();
  const { celebrationConfetti } = useConfetti();
  
  const chatCommands = useChatCommands({
    obs,
    onSendChatMessage: twitch.sendChatMessage,
    onNotification: (message, type) => notifications.addNotification(message, type),
    onRemoveParticipant: wheel.removeParticipant,
    onClearAll: wheel.clearAll,
    onUpdateKeyword: (keyword: string) => {
      twitch.setEntryKeyword(keyword);
      // If connected, reconnect with new keyword
      if (twitch.isConnected) {
        twitch.connectToChat(keyword);
      }
    }
  });

  const handleSpin = useCallback(() => {
    wheel.spinWheel((winner) => {
      setShowWinner(winner);
      playCongratsSound();
      celebrationConfetti();
      
      // Auto-announce winner if setting is enabled
      if (wheel.settings.autoAnnounceWinner && twitch.isConnected) {
        const announcement = `🎉 Congratulations ${winner}! You won the giveaway! 🎉`;
        twitch.sendChatMessage(announcement);
      }
    }, playTickSound);
  }, [wheel, playCongratsSound, celebrationConfetti, playTickSound, twitch]);

  // Set up Twitch chat message handler
  useEffect(() => {
    if (!twitch.setOnChatMessage) return;

    twitch.setOnChatMessage(async (username, message, isModerator, isBroadcaster) => {
      // Handle chat commands first
      await chatCommands.handleChatMessage(username, message, isModerator, isBroadcaster);

      // Handle entry with keyword
      if (message.toLowerCase() === twitch.entryKeyword.toLowerCase()) {
        const success = wheel.addParticipant(username);
        if (success) {
          notifications.addNotification(`🎯 ${username} entered!`, 'success');
        }
      }

      // Handle moderator commands
      if (isModerator || isBroadcaster) {
        if (message.toLowerCase() === '!spin') {
          handleSpin();
        } else if (message.toLowerCase().startsWith('!addentry')) {
          const parts = message.split(' ');
          if (parts.length === 2) {
            const entryUsername = parts[1];
            wheel.addParticipant(entryUsername);
          }
        } else if (message.toLowerCase() === '!removewinner') {
          wheel.removeWinner();
        } else if (message.toLowerCase().startsWith('!weight ')) {
          const parts = message.split(' ');
          if (parts.length === 3) {
            const targetUsername = parts[1];
            const weight = parseFloat(parts[2]);
            if (!isNaN(weight) && weight >= 0.1 && weight <= 10) {
              wheel.updateParticipantWeight(targetUsername, weight);
            }
          }
        }
      }
    });
  }, [twitch, wheel, notifications, handleSpin, chatCommands]);

  if (!twitch.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">
            🎡 2D Wheel - OBS Mode
          </h1>
          <TwitchLogin onLogin={twitch.login} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      {/* Main Wheel */}
      <div className="flex flex-col items-center">
        <SpinningWheel
          participants={wheel.participants}
          currentRotation={wheel.currentRotation}
          settings={wheel.settings}
          isSpinning={wheel.isSpinning}
          className="mb-8"
          wheelRef={wheelRef}
        />

        {/* Status Display */}
        <div className="text-center">
          <div className="px-6 py-3 rounded-lg font-medium text-white bg-black bg-opacity-50 backdrop-blur">
            {wheel.isSpinning ? (
              <span className="text-yellow-300">🎲 Spinning...</span>
            ) : wheel.participants.length === 0 ? (
              <span className="text-gray-300">Waiting for participants...</span>
            ) : wheel.lastWinner ? (
              <span className="text-green-300">🏆 Winner: {wheel.lastWinner}</span>
            ) : (
              <span className="text-blue-300">
                {wheel.participants.length} participants ready!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      <WinnerAnnouncement
        winner={showWinner}
        winnerText={wheel.settings.winnerText}
        onComplete={() => setShowWinner(null)}
        wheelRef={wheelRef}
      />
    </div>
  );
}