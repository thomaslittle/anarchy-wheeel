'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TwitchUser, ConnectionStatus } from '@/types';

interface UseTwitchReturn {
  user: TwitchUser | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  entryKeyword: string;
  moderators: Set<string>;
  login: () => void;
  logout: () => void;
  connectToChat: (keyword: string) => void;
  disconnectFromChat: () => void;
  setEntryKeyword: (keyword: string) => void;
  onChatMessage: ((username: string, message: string, isModerator: boolean, isBroadcaster: boolean) => void) | null;
  setOnChatMessage: (callback: (username: string, message: string, isModerator: boolean, isBroadcaster: boolean) => void) => void;
  sendChatMessage: (message: string) => boolean;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI || '';
const API_URL = process.env.NEXT_PUBLIC_TWITCH_API_URL || 'https://api.twitch.tv/helix';
const AUTH_URL = process.env.NEXT_PUBLIC_TWITCH_AUTH_URL || 'https://id.twitch.tv/oauth2/authorize';
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_TWITCH_WEBSOCKET_URL || 'wss://irc-ws.chat.twitch.tv:443';
const SCOPES = ['chat:read', 'chat:edit', 'user:read:email'];

export function useTwitch(): UseTwitchReturn {
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    message: 'Disconnected'
  });
  const [entryKeyword, setEntryKeywordState] = useState('!enter');

  // Load saved entry keyword on mount
  useEffect(() => {
    try {
      const savedKeyword = localStorage.getItem('twitch-entry-keyword');
      if (savedKeyword) {
        setEntryKeywordState(savedKeyword);
      }
    } catch (error) {
      console.error('Failed to load entry keyword from localStorage:', error);
    }
  }, []);

  const setEntryKeyword = useCallback((keyword: string) => {
    setEntryKeywordState(keyword);
    try {
      localStorage.setItem('twitch-entry-keyword', keyword);
    } catch (error) {
      console.error('Failed to save entry keyword to localStorage:', error);
    }
  }, []);
  const [moderators] = useState(() => new Set<string>());

  const socketRef = useRef<WebSocket | null>(null);
  const onChatMessageRef = useRef<((username: string, message: string, isModerator: boolean, isBroadcaster: boolean) => void) | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  const isConnected = connectionStatus.status === 'connected';

  // Check for existing token and user on mount
  useEffect(() => {
    const checkForToken = () => {
      // Check URL hash for new token
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');

      if (token) {
        accessTokenRef.current = token;
        localStorage.setItem('twitch_token', token);
        history.replaceState(null, '', window.location.pathname);
        validateToken(token);
        return;
      }

      // Check localStorage for existing token
      const storedToken = localStorage.getItem('twitch_token');
      if (storedToken) {
        accessTokenRef.current = storedToken;
        validateToken(storedToken);
      }
    };

    checkForToken();
  }, []);

  const validateToken = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': CLIENT_ID
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data[0];
        setUser(userData);
        localStorage.setItem('twitch_user', JSON.stringify(userData));
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  }, []);

  const login = useCallback(() => {
    const redirectUri = REDIRECT_URI || (window.location.origin + window.location.pathname);
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${SCOPES.join('+')}&state=${Math.random().toString(36)}`;
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    moderators.clear();
    localStorage.removeItem('twitch_token');
    localStorage.removeItem('twitch_user');
    
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    setConnectionStatus({
      status: 'disconnected',
      message: 'Disconnected'
    });
  }, [moderators]);

  const connectToChat = useCallback((keyword: string) => {
    if (!accessTokenRef.current || !user) {
      setConnectionStatus({
        status: 'error',
        message: 'Please sign in with Twitch first'
      });
      return;
    }

    if (!keyword.trim()) {
      setConnectionStatus({
        status: 'error',
        message: 'Please enter a keyword for entries'
      });
      return;
    }

    setEntryKeyword(keyword);
    setConnectionStatus({
      status: 'connecting',
      message: 'Connecting...'
    });

    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      const socket = new WebSocket(WEBSOCKET_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(`PASS oauth:${accessTokenRef.current}\r\n`);
        socket.send(`NICK ${user.login}\r\n`);
        socket.send('CAP REQ :twitch.tv/commands\r\n');
        socket.send('CAP REQ :twitch.tv/tags\r\n');
        
        setTimeout(() => {
          socket.send(`JOIN #${user.login}\r\n`);
        }, 1000);
      };

      socket.onmessage = (event) => {
        handleTwitchMessage(event.data);
      };

      socket.onclose = () => {
        setConnectionStatus({
          status: 'disconnected',
          message: 'Disconnected'
        });
      };

      socket.onerror = () => {
        setConnectionStatus({
          status: 'error',
          message: 'Connection Error'
        });
      };

    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Connection failed'
      });
    }
  }, [user]);

  const disconnectFromChat = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    moderators.clear();
    setConnectionStatus({
      status: 'disconnected',
      message: 'Disconnected'
    });
  }, [moderators]);

  const handleTwitchMessage = useCallback((rawMessage: string) => {
    const lines = rawMessage.split('\r\n');
    
    for (const line of lines) {
      if (!line) continue;
      
      // Reduce spam - only log important messages
      if (line.includes('001') || line.includes('366') || line.includes('JOIN') || line.includes('PRIVMSG')) {
        console.log('Twitch IRC message:', line);
      }

      // Handle PING
      if (line.startsWith('PING')) {
        try {
          socketRef.current?.send('PONG :tmi.twitch.tv\r\n');
        } catch (e) {
          console.error('Failed to send PONG:', e);
        }
        continue;
      }

      // Handle authentication response (only the initial server welcome)
      if (line.includes(':tmi.twitch.tv 001') || line.includes('Welcome, GLHF!')) {
        console.log('Twitch authentication successful');
        setConnectionStatus({
          status: 'connecting',
          message: 'Authenticated, joining channel...'
        });
      }

      // Handle successful channel join
      if (line.includes('366') && user && line.includes(`#${user.login}`)) {
        console.log('Twitch channel join successful');
        setConnectionStatus({
          status: 'connected',
          message: `Connected to #${user.login}`
        });
      }
      
      // Handle JOIN confirmation
      if (line.includes(' JOIN ') && user && line.includes(`#${user.login}`)) {
        console.log('Twitch JOIN confirmation received');
      }
      
      // Handle other IRC response codes
      if (line.includes(' 353 ') || line.includes(' 366 ')) {
        console.log('Twitch IRC response code:', line);
      }

      // Handle chat messages
      if (!line.includes('PRIVMSG')) continue;

      const tagMap: Record<string, string> = {};
      if (line.startsWith('@')) {
        const firstSpace = line.indexOf(' ');
        const tagStr = line.substring(1, firstSpace);
        tagStr.split(';').forEach(pair => {
          const [key, value] = pair.split('=');
          tagMap[key] = value ?? '';
        });
      }

      const userMatch = line.match(/:([^!\s]+)!/);
      const username = userMatch ? userMatch[1] : null;

      let message: string | null = null;
      const privIdx = line.indexOf(' PRIVMSG ');
      if (privIdx !== -1) {
        const after = line.slice(privIdx);
        const colonIdx = after.indexOf(' :');
        if (colonIdx !== -1) {
          message = after.slice(colonIdx + 2).trim();
        }
      }

      if (!username || !message) continue;

      // Check moderator status
      let isBroadcaster = false;
      let isModerator = false;

      const badges = tagMap.badges || '';
      if (badges) {
        isBroadcaster = badges.includes('broadcaster');
        isModerator = badges.includes('moderator') || isBroadcaster;
      }
      if (tagMap.mod === '1') isModerator = true;
      if (user && username.toLowerCase() === user.login.toLowerCase()) {
        isBroadcaster = true;
        isModerator = true;
      }

      // Call the message handler
      if (onChatMessageRef.current) {
        onChatMessageRef.current(username, message, isModerator, isBroadcaster);
      }
    }
  }, [user]);

  const setOnChatMessage = useCallback((callback: (username: string, message: string, isModerator: boolean, isBroadcaster: boolean) => void) => {
    onChatMessageRef.current = callback;
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (!socketRef.current || !isConnected || !user) {
      console.warn('Cannot send chat message: not connected to Twitch chat. Message was:', message);
      return false;
    }

    try {
      socketRef.current.send(`PRIVMSG #${user.login} :${message}\r\n`);
      console.log('Sent chat message:', message);
      return true;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return false;
    }
  }, [isConnected, user]);

  return {
    user,
    connectionStatus,
    isConnected,
    entryKeyword,
    moderators,
    login,
    logout,
    connectToChat,
    disconnectFromChat,
    setEntryKeyword,
    onChatMessage: onChatMessageRef.current,
    setOnChatMessage,
    sendChatMessage,
  };
}