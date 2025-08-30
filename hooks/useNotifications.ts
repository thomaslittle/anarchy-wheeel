'use client';

import { useState, useCallback } from 'react';
import type { NotificationData } from '@/types';
import { generateRandomId } from '@/lib/utils';

interface UseNotificationsReturn {
  notifications: NotificationData[];
  addNotification: (message: string, type?: NotificationData['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((
    message: string,
    type: NotificationData['type'] = 'info',
    duration: number = 3000
  ) => {
    const id = generateRandomId();
    const notification: NotificationData = {
      id,
      message,
      type,
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}