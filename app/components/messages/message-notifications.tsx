"use client";

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Users,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useMessages } from '@/app/contexts/message-context';
import type { Notification, UserRole } from '@/app/types';

interface MessageNotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const MessageNotificationToast: React.FC<MessageNotificationToastProps> = ({
  notification,
  onDismiss,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification.priority !== 'urgent') {
      const duration = 8000; // 8 seconds
      const interval = 50; // Update every 50ms
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            handleDismiss();
            return 0;
          }
          return prev - decrement;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [notification.priority]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
    handleDismiss();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle className="h-5 w-5" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5" />;
      case 'appointment':
        return <Clock className="h-5 w-5" />;
      case 'staffing':
        return <Users className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColorScheme = () => {
    switch (notification.priority) {
      case 'urgent':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          progress: 'bg-red-500'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          progress: 'bg-orange-500'
        };
      case 'normal':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          icon: 'text-emerald-600 dark:text-emerald-400',
          progress: 'bg-emerald-500'
        };
      default:
        return {
          bg: 'bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800',
          icon: 'text-zinc-600 dark:text-zinc-400',
          progress: 'bg-zinc-500'
        };
    }
  };

  const colorScheme = getColorScheme();

  if (!isVisible) return null;

  return (
    <Card className={`w-80 ${colorScheme.bg} border shadow-lg transition-all duration-300 hover:shadow-xl transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* Progress bar for non-urgent notifications */}
      {notification.priority !== 'urgent' && (
        <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-t-lg overflow-hidden">
          <div 
            className={`h-full ${colorScheme.progress} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`${colorScheme.icon} mt-0.5`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {notification.title}
                </h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Additional info */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {notification.type}
              </Badge>
              
              {notification.priority === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
              
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>

            {/* Action buttons */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.type === 'primary' ? 'default' : 'outline'}
                    onClick={handleAction}
                    className={`text-xs h-7 ${
                      action.type === 'primary' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MessageNotificationContainer: React.FC = () => {
  const { notifications, markNotificationRead } = useMessages();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Filter and sort notifications
    const messageNotifications = notifications
      .filter(n => ['message', 'system', 'appointment', 'staffing'].includes(n.type))
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        const aPriority = priorityOrder[a.priority] || 3;
        const bPriority = priorityOrder[b.priority] || 3;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5); // Show max 5 notifications

    setVisibleNotifications(messageNotifications);
  }, [notifications]);

  const handleDismissNotification = (notificationId: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId));
    markNotificationRead(notificationId);
  };

  const handleNotificationAction = (notification: Notification) => {
    // Handle notification action (e.g., navigate to conversation)
    if (notification.relatedEntityId && notification.type === 'message') {
      // Navigate to the conversation
      window.location.href = `/dashboard/messages?conversation=${notification.relatedEntityId}`;
    }
    markNotificationRead(notification.id);
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {visibleNotifications.map((notification) => (
        <MessageNotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={handleDismissNotification}
          onAction={handleNotificationAction}
        />
      ))}
    </div>
  );
};

export default MessageNotificationContainer;
