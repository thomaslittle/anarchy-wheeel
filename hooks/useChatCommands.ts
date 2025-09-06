'use client';

import { useCallback, useRef, useEffect } from 'react';
import type { UseOBSReturn } from './useOBS';

interface ChatCommandHandler {
  command: string;
  description: string;
  handler: (username: string, args: string[], isModerator: boolean, isBroadcaster: boolean) => Promise<void>;
  requiresModerator?: boolean;
}

interface UseChatCommandsProps {
  obs: UseOBSReturn;
  onSendChatMessage?: (message: string) => boolean;
  onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onRemoveParticipant?: (username: string) => boolean;
  onClearAll?: () => void;
  onUpdateKeyword?: (keyword: string) => void;
}

interface UseChatCommandsReturn {
  handleChatMessage: (username: string, message: string, isModerator: boolean, isBroadcaster: boolean) => Promise<void>;
  getAvailableCommands: () => ChatCommandHandler[];
  sendChatMessage: (message: string) => boolean;
}

export function useChatCommands({
  obs,
  onSendChatMessage,
  onNotification,
  onRemoveParticipant,
  onClearAll,
  onUpdateKeyword
}: UseChatCommandsProps): UseChatCommandsReturn {
  const commandsRef = useRef<ChatCommandHandler[]>([]);

  // Initialize commands
  const initializeCommands = useCallback(() => {
    commandsRef.current = [
      {
        command: '!showwheel',
        description: 'Show the wheel browser source in OBS',
        requiresModerator: true,
        handler: async (username: string) => {
          console.log(`Chat command !showwheel executed by ${username}`);
          console.log('Current OBS connection status:', obs.connectionStatus);
          console.log('Current OBS isConnected:', obs.isConnected);
          console.log('Current OBS settings:', obs.settings);
          console.log('OBS functions available:', {
            showBrowserSource: typeof obs.showBrowserSource,
            hideBrowserSource: typeof obs.hideBrowserSource,
            connect: typeof obs.connect
          });
          
          if (!obs.isConnected) {
            const errorMsg = `❌ OBS is not connected (status: ${obs.connectionStatus.status}). Please connect to OBS first.`;
            onNotification?.(errorMsg, 'error');
            const chatSent = onSendChatMessage?.('⚠️ OBS is not connected. Cannot show wheel.');
            if (!chatSent) {
              console.log('Chat message not sent (not connected to chat), but notification shown instead');
            }
            return;
          }

          try {
            console.log('Attempting to show browser source via chat command...');
            const success = await obs.showBrowserSource();
            console.log('Show browser source result:', success);
            
            if (success) {
              onNotification?.(`🎯 ${username} made the wheel visible in OBS!`, 'success');
              const chatSent = onSendChatMessage?.('🎯 Wheel is now visible! Get ready to spin!');
              console.log('Success notification sent to:', chatSent ? 'chat' : 'UI only');
            } else {
              onNotification?.('❌ Failed to show wheel in OBS. Check browser source name.', 'error');
              const chatSent = onSendChatMessage?.('❌ Failed to show wheel. Please check OBS setup.');
              console.log('Error notification sent to:', chatSent ? 'chat' : 'UI only');
            }
          } catch (error) {
            console.error('Error showing wheel:', error);
            onNotification?.(`❌ Error showing wheel in OBS: ${error}`, 'error');
            const chatSent = onSendChatMessage?.('❌ Error showing wheel. Please try again.');
            console.log('Error notification sent to:', chatSent ? 'chat' : 'UI only');
          }
        }
      },
      {
        command: '!hidewheel',
        description: 'Hide the wheel browser source in OBS',
        requiresModerator: true,
        handler: async (username: string) => {
          if (!obs.isConnected) {
            onNotification?.('❌ OBS is not connected. Please connect to OBS first.', 'error');
            return;
          }

          try {
            const success = await obs.hideBrowserSource();
            if (success) {
              onNotification?.(`👁️ ${username} hid the wheel from OBS!`, 'info');
            } else {
              onNotification?.('❌ Failed to hide wheel in OBS. Check browser source name.', 'error');
            }
          } catch (error) {
            console.error('Error hiding wheel:', error);
            onNotification?.('❌ Error hiding wheel in OBS.', 'error');
          }
        }
      },
      {
        command: '!togglewheel',
        description: 'Toggle the wheel browser source visibility in OBS',
        requiresModerator: true,
        handler: async (username: string) => {
          if (!obs.isConnected) {
            onNotification?.('❌ OBS is not connected. Please connect to OBS first.', 'error');
            return;
          }

          try {
            const isNowVisible = await obs.toggleBrowserSource();
            const action = isNowVisible ? 'shown' : 'hidden';
            const emoji = isNowVisible ? '🎯' : '👁️';
            
            onNotification?.(`${emoji} ${username} ${action} the wheel in OBS!`, 'info');
          } catch (error) {
            console.error('Error toggling wheel:', error);
            onNotification?.('❌ Error toggling wheel in OBS.', 'error');
          }
        }
      },
      {
        command: '!removeentry',
        description: 'Remove a participant from the wheel (!removeentry username)',
        requiresModerator: true,
        handler: async (username: string, args: string[]) => {
          if (!onRemoveParticipant) {
            onNotification?.('❌ Remove participant function not available.', 'error');
            return;
          }

          if (args.length === 0) {
            onNotification?.('❌ Usage: !removeentry {username}', 'error');
            onSendChatMessage?.(`@${username} Usage: !removeentry {username}`);
            return;
          }

          const targetUsername = args[0];
          
          try {
            const success = onRemoveParticipant(targetUsername);
            
            if (success) {
              onNotification?.(`🗑️ ${username} removed ${targetUsername} from the wheel!`, 'success');
              onSendChatMessage?.(`🗑️ ${targetUsername} has been removed from the wheel.`);
            } else {
              onNotification?.(`❌ ${targetUsername} was not found in the wheel.`, 'error');
              onSendChatMessage?.(`@${username} ${targetUsername} is not in the wheel.`);
            }
          } catch (error) {
            console.error('Error removing participant:', error);
            onNotification?.('❌ Error removing participant.', 'error');
            onSendChatMessage?.('❌ Error removing participant. Please try again.');
          }
        }
      },
      {
        command: '!obsstatus',
        description: 'Check OBS connection status',
        requiresModerator: true,
        handler: async (_username: string) => {
          const status = obs.connectionStatus;
          const statusEmoji = status.status === 'connected' ? '✅' : 
                             status.status === 'connecting' ? '🔄' : 
                             status.status === 'error' ? '❌' : '⭕';
          
          onNotification?.(`${statusEmoji} OBS Status: ${status.message}`, 'info');
        }
      },
      {
        command: '!wheelhelp',
        description: 'Show available wheel commands',
        requiresModerator: false,
        handler: async (_username: string) => {
          const availableCommands = commandsRef.current
            .filter(cmd => !cmd.requiresModerator || true) // Show all commands in help
            .map(cmd => cmd.command)
            .join(', ');
          
          // Help command - this one we do want to try to send to chat if possible
          const chatSent = onSendChatMessage?.(`🎯 Wheel commands: ${availableCommands} (Mod only: most commands)`);
          if (!chatSent) {
            onNotification?.(`🎯 Available commands: ${availableCommands}`, 'info');
          }
        }
      },
      {
        command: '!clearwheel',
        description: 'Remove all entries from the wheel',
        requiresModerator: true,
        handler: async (username: string) => {
          if (!onClearAll) {
            onNotification?.('❌ Clear wheel function not available.', 'error');
            return;
          }

          try {
            onClearAll();
            onNotification?.(`🗑️ ${username} cleared all entries from the wheel!`, 'success');
            onSendChatMessage?.('🗑️ All entries have been cleared from the wheel.');
          } catch (error) {
            console.error('Error clearing wheel:', error);
            onNotification?.('❌ Error clearing wheel.', 'error');
            onSendChatMessage?.('❌ Error clearing wheel. Please try again.');
          }
        }
      },
      {
        command: '!keyword',
        description: 'Update the giveaway keyword (!keyword {new_keyword})',
        requiresModerator: true,
        handler: async (username: string, args: string[]) => {
          if (!onUpdateKeyword) {
            onNotification?.('❌ Update keyword function not available.', 'error');
            return;
          }

          if (args.length === 0) {
            onNotification?.('❌ Usage: !keyword {new_keyword}', 'error');
            onSendChatMessage?.(`@${username} Usage: !keyword {new_keyword}`);
            return;
          }

          const newKeyword = args[0];
          
          // Basic validation for keyword format
          if (!newKeyword.startsWith('!') || newKeyword.length < 2) {
            onNotification?.('❌ Keyword must start with ! and be at least 2 characters long.', 'error');
            onSendChatMessage?.(`@${username} Keyword must start with ! and be at least 2 characters long.`);
            return;
          }

          try {
            onUpdateKeyword(newKeyword);
            onNotification?.(`🔄 ${username} changed the entry keyword to: ${newKeyword}`, 'success');
            onSendChatMessage?.(`🔄 Entry keyword changed to: ${newKeyword}`);
          } catch (error) {
            console.error('Error updating keyword:', error);
            onNotification?.('❌ Error updating keyword.', 'error');
            onSendChatMessage?.('❌ Error updating keyword. Please try again.');
          }
        }
      }
    ];
  }, [obs.isConnected, obs.connectionStatus, obs.showBrowserSource, obs.hideBrowserSource, obs.toggleBrowserSource, onNotification, onSendChatMessage, onRemoveParticipant, onClearAll, onUpdateKeyword]);

  // Initialize commands when OBS instance changes or on first use
  useEffect(() => {
    // Only log when connection status actually changes
    const shouldLog = obs.connectionStatus.status !== 'disconnected' || !initializeCommands.toString().includes('connected');
    if (shouldLog) {
      console.log('Reinitializing commands due to OBS change:', obs.isConnected, obs.connectionStatus);
    }
    initializeCommands();
  }, [obs.isConnected, obs.connectionStatus, initializeCommands]);

  const sendChatMessage = useCallback((message: string) => {
    return onSendChatMessage?.(message) || false;
  }, [onSendChatMessage]);

  const handleChatMessage = useCallback(async (
    username: string,
    message: string,
    isModerator: boolean,
    isBroadcaster: boolean
  ) => {
    console.log('Chat message received in useChatCommands:', { username, message, isModerator, isBroadcaster });
    
    const trimmedMessage = message.trim();
    
    // Check if message starts with a command
    if (!trimmedMessage.startsWith('!')) {
      console.log('Message does not start with !, ignoring');
      return;
    }

    // Parse command and arguments
    const parts = trimmedMessage.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    console.log('Parsed command:', { command, args });
    console.log('Available commands:', commandsRef.current.map(cmd => cmd.command));

    // Find matching command
    const commandHandler = commandsRef.current.find(cmd => cmd.command === command);
    if (!commandHandler) {
      console.log('Command not found, ignoring');
      return; // Command not found, ignore
    }
    
    console.log('Found command handler for:', command);

    // Check permissions
    if (commandHandler.requiresModerator && !isModerator && !isBroadcaster) {
      onNotification?.(`⚠️ ${username} tried to use ${command} but lacks moderator permissions.`, 'warning');
      onSendChatMessage?.(`@${username} Sorry, ${command} requires moderator permissions.`);
      return;
    }

    // Execute command
    try {
      await commandHandler.handler(username, args, isModerator, isBroadcaster);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      onNotification?.(`❌ Error executing ${command}`, 'error');
      onSendChatMessage?.(`❌ Error executing ${command}. Please try again.`);
    }
  }, [onNotification, onSendChatMessage]);

  const getAvailableCommands = useCallback(() => {
    return [...commandsRef.current];
  }, []);

  return {
    handleChatMessage,
    getAvailableCommands,
    sendChatMessage
  };
}