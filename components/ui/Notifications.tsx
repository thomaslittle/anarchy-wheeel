'use client';

import { useEffect } from 'react';
import type { NotificationData } from '@/types';
import { cn } from '@/lib/utils';

interface NotificationProps {
  notification: NotificationData;
  onRemove: (id: string) => void;
}

function Notification({ notification, onRemove }: NotificationProps) {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-[var(--success-color)]';
      case 'error':
        return 'bg-[var(--error-color)]';
      case 'warning':
        return 'bg-[var(--warning-color)]';
      case 'info':
      default:
        return 'bg-[var(--accent-primary)]';
    }
  };

  return (
    <div
      className={cn(
        "fixed top-5 right-5 z-50",
        "text-white font-bold px-5 py-4 rounded-xl",
        "shadow-[0_4px_15px_var(--shadow-color)]",
        "animate-[slideIn_0.3s_ease-out]",
        "max-w-sm break-words",
        getNotificationStyles()
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1">{notification.message}</span>
        <button
          onClick={() => onRemove(notification.id)}
          className="text-white hover:opacity-70 text-lg font-bold flex-shrink-0"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface NotificationsProps {
  notifications: NotificationData[];
  onRemove: (id: string) => void;
}

export function Notifications({ notifications, onRemove }: NotificationsProps) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className="pointer-events-auto"
          style={{ 
            transform: `translateY(${index * 80}px)` 
          }}
        >
          <Notification notification={notification} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}