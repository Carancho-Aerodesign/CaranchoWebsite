import { useEffect } from 'react';
import { AlertCircle, CheckCircle, X, XCircle } from 'lucide-react';

import type { NotificationState } from '../../types';

interface NotificationProps {
  notification: NotificationState | null;
  onDismiss: () => void;
}

export function Notification({ notification, onDismiss }: NotificationProps) {
  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) {
    return null;
  }

  const { message, type } = notification;
  const baseClasses =
    'fixed bottom-5 right-5 md:bottom-10 md:right-10 flex items-center p-4 rounded-lg shadow-lg text-white z-[999] animate-fade-in-up';
  const typeClasses: Record<NotificationState['type'], string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <Icon className="mr-3" />
      <span>{message}</span>
      <button type="button" onClick={onDismiss} className="ml-4">
        <X size={20} />
      </button>
    </div>
  );
}
