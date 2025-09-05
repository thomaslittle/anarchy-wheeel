'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import OBSWebSocket from 'obs-websocket-js';

interface OBSConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  message: string;
}

interface OBSSettings {
  host: string;
  port: number;
  password?: string;
  browserSourceName: string;
}

export interface UseOBSReturn {
  connectionStatus: OBSConnectionStatus;
  isConnected: boolean;
  settings: OBSSettings;
  connect: (settings: OBSSettings) => Promise<void>;
  disconnect: () => void;
  showBrowserSource: () => Promise<boolean>;
  hideBrowserSource: () => Promise<boolean>;
  toggleBrowserSource: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<OBSSettings>) => void;
}

export function useOBS(): UseOBSReturn {
  const [connectionStatus, setConnectionStatus] = useState<OBSConnectionStatus>(() => {
    // Try to restore connection status from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('obs-connection-status');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only restore if it was recently connected (within 30 seconds)
          const now = Date.now();
          if (parsed.timestamp && (now - parsed.timestamp < 30000) && parsed.status === 'connected') {
            return { status: 'disconnected', message: 'Reconnecting...' };
          }
        }
      } catch (error) {
        console.error('Failed to load OBS connection status:', error);
      }
    }
    
    return {
      status: 'disconnected',
      message: 'Disconnected'
    };
  });

  const [settings, setSettings] = useState<OBSSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('obs-settings');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('Failed to load OBS settings:', error);
      }
    }
    
    return {
      host: 'localhost',
      port: 4455,
      password: '',
      browserSourceName: ''
    };
  });

  const obsRef = useRef<OBSWebSocket | null>(null);
  const isConnected = connectionStatus.status === 'connected';

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('obs-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save OBS settings:', error);
      }
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<OBSSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const connect = useCallback(async (connectionSettings: OBSSettings) => {
    if (obsRef.current) {
      await disconnect();
    }

    setConnectionStatus({
      status: 'connecting',
      message: 'Connecting to OBS...'
    });

    try {
      const obs = new OBSWebSocket();
      obsRef.current = obs;

      await obs.connect(
        `ws://${connectionSettings.host}:${connectionSettings.port}`,
        connectionSettings.password || undefined
      );

      setConnectionStatus({
        status: 'connected',
        message: `Connected to OBS at ${connectionSettings.host}:${connectionSettings.port}`
      });

      // Update settings on successful connection
      updateSettings(connectionSettings);

      // Set up error handlers
      obs.on('ConnectionClosed', () => {
        setConnectionStatus({
          status: 'disconnected',
          message: 'Connection to OBS closed'
        });
        obsRef.current = null;
      });

      obs.on('ConnectionError', (error) => {
        setConnectionStatus({
          status: 'error',
          message: `OBS connection error: ${error.message}`
        });
      });

    } catch (error) {
      console.error('Failed to connect to OBS:', error);
      setConnectionStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to OBS'
      });
      obsRef.current = null;
    }
  }, [updateSettings]);

  const disconnect = useCallback(async () => {
    if (obsRef.current) {
      try {
        await obsRef.current.disconnect();
      } catch (error) {
        console.error('Error disconnecting from OBS:', error);
      }
      obsRef.current = null;
    }
    
    setConnectionStatus({
      status: 'disconnected',
      message: 'Disconnected'
    });
  }, []);

  const showBrowserSource = useCallback(async (): Promise<boolean> => {
    console.log('showBrowserSource called, isConnected:', isConnected);
    
    if (!obsRef.current || !isConnected) {
      console.error('OBS not connected - obsRef.current:', !!obsRef.current, 'isConnected:', isConnected);
      return false;
    }

    try {
      console.log('Attempting to show browser source:', settings.browserSourceName);
      const currentSceneName = await getCurrentSceneName();
      const sceneItemId = await getSceneItemId(settings.browserSourceName);
      console.log('Found scene item ID:', sceneItemId, 'in scene:', currentSceneName);
      
      await obsRef.current.call('SetSceneItemEnabled', {
        sceneName: currentSceneName,
        sceneItemId: sceneItemId,
        sceneItemEnabled: true
      });
      
      console.log('Successfully showed browser source');
      return true;
    } catch (error) {
      console.error('Failed to show browser source:', error);
      return false;
    }
  }, [isConnected, settings.browserSourceName]);

  const hideBrowserSource = useCallback(async (): Promise<boolean> => {
    if (!obsRef.current || !isConnected) {
      console.error('OBS not connected');
      return false;
    }

    try {
      const currentSceneName = await getCurrentSceneName();
      const sceneItemId = await getSceneItemId(settings.browserSourceName);
      
      await obsRef.current.call('SetSceneItemEnabled', {
        sceneName: currentSceneName,
        sceneItemId: sceneItemId,
        sceneItemEnabled: false
      });
      return true;
    } catch (error) {
      console.error('Failed to hide browser source:', error);
      return false;
    }
  }, [isConnected, settings.browserSourceName]);

  const toggleBrowserSource = useCallback(async (): Promise<boolean> => {
    if (!obsRef.current || !isConnected) {
      console.error('OBS not connected');
      return false;
    }

    try {
      const currentSceneName = await getCurrentSceneName();
      const sceneItemId = await getSceneItemId(settings.browserSourceName);
      
      const response = await obsRef.current.call('GetSceneItemEnabled', {
        sceneName: currentSceneName,
        sceneItemId
      });
      
      const isCurrentlyEnabled = response.sceneItemEnabled;
      
      await obsRef.current.call('SetSceneItemEnabled', {
        sceneName: currentSceneName,
        sceneItemId,
        sceneItemEnabled: !isCurrentlyEnabled
      });
      
      return !isCurrentlyEnabled;
    } catch (error) {
      console.error('Failed to toggle browser source:', error);
      return false;
    }
  }, [isConnected, settings.browserSourceName]);

  // Helper function to get the current scene name
  const getCurrentSceneName = async (): Promise<string> => {
    if (!obsRef.current) {
      throw new Error('OBS not connected');
    }

    try {
      const response = await obsRef.current.call('GetCurrentProgramScene');
      return response.sceneName;
    } catch (error) {
      console.error('Failed to get current scene name:', error);
      throw error;
    }
  };

  // Helper function to get scene item ID by name
  const getSceneItemId = async (sourceName: string): Promise<number> => {
    if (!obsRef.current) {
      throw new Error('OBS not connected');
    }

    try {
      console.log('Getting current scene name...');
      const currentSceneName = await getCurrentSceneName();
      console.log('Current scene name:', currentSceneName);

      console.log('Getting scene item list for scene:', currentSceneName);
      const response = await obsRef.current.call('GetSceneItemList', {
        sceneName: currentSceneName
      });
      
      console.log('Scene items found:', response.sceneItems.map((item: any) => ({ 
        name: item.sourceName, 
        id: item.sceneItemId, 
        enabled: item.sceneItemEnabled 
      })));

      // Try exact match first, then case-insensitive match
      let sceneItem = response.sceneItems.find(
        (item: any) => item.sourceName === sourceName
      );

      if (!sceneItem) {
        // Try case-insensitive search
        sceneItem = response.sceneItems.find(
          (item: any) => item.sourceName.toLowerCase() === sourceName.toLowerCase()
        );
        
        if (sceneItem) {
          console.log(`Found case-insensitive match: "${sceneItem.sourceName}" for "${sourceName}"`);
        }
      }

      if (!sceneItem) {
        const availableSources = response.sceneItems.map((item: any) => item.sourceName).join(', ');
        throw new Error(`Browser source "${sourceName}" not found in scene "${currentSceneName}". Available sources: ${availableSources}`);
      }

      console.log(`Found scene item "${sceneItem.sourceName}" with ID: ${sceneItem.sceneItemId}`);
      return sceneItem.sceneItemId as number;
    } catch (error) {
      console.error(`Failed to find browser source "${sourceName}":`, error);
      throw new Error(`Failed to find browser source "${sourceName}": ${error}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (obsRef.current) {
        obsRef.current.disconnect();
      }
    };
  }, []);

  return {
    connectionStatus,
    isConnected,
    settings,
    connect,
    disconnect,
    showBrowserSource,
    hideBrowserSource,
    toggleBrowserSource,
    updateSettings
  };
}