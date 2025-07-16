"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MessageService, ConversationRealtimeService } from '@/lib/firestore/message-services';
import type { Message, Conversation, User, UserRole, Notification } from '@/app/types';

interface MessageContextType {
  // State
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string, attachments?: any[]) => Promise<void>;
  createConversation: (participants: string[], title?: string, isGroup?: boolean) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchMessages: (query: string) => Promise<Message[]>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // User management
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Real-time updates
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationRead: (notificationId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: React.ReactNode;
  initialUser?: User;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ 
  children, 
  initialUser 
}) => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Subscriptions tracking
  const [activeSubscriptions, setActiveSubscriptions] = useState<Map<string, () => void>>(new Map());

  // Load user conversations on mount or user change
  useEffect(() => {
    if (currentUser) {
      loadUserConversations();
    }
  }, [currentUser]);

  // Calculate unread count
  useEffect(() => {
    const count = conversations.reduce((total, conv) => {
      // In a real implementation, this would come from the conversation data
      return total + (conv.metadata?.unreadCount || 0);
    }, 0);
    setUnreadCount(count);
  }, [conversations]);

  const loadUserConversations = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { conversations: userConversations } = await MessageService.getUserConversations(
        currentUser.id,
        currentUser.role
      );
      setConversations(userConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    // Unsubscribe from previous conversation
    if (activeConversation) {
      unsubscribeFromConversation(activeConversation.id);
    }
    
    setActiveConversationState(conversation);
    
    if (conversation) {
      // Subscribe to new conversation
      subscribeToConversation(conversation.id);
      
      // Mark conversation as read
      markAsRead(conversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const sendMessage = async (content: string, attachments?: any[]): Promise<void> => {
    if (!activeConversation || !currentUser) {
      throw new Error('No active conversation or user');
    }

    try {
      const messageId = await MessageService.sendMessage(
        activeConversation.id,
        currentUser.id,
        content,
        attachments
      );

      // Create notification for other participants
      await MessageService.createMessageNotifications(
        activeConversation.id,
        currentUser.id,
        content
      );

      // Update local state optimistically
      const newMessage: Message = {
        id: messageId,
        conversationId: activeConversation.id,
        senderId: currentUser.id,
        content,
        attachments: attachments || [],
        createdAt: new Date(),
        isRead: false,
        isDeleted: false
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation last message time
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, lastMessageAt: new Date() }
          : conv
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  const createConversation = async (
    participants: string[], 
    title?: string, 
    isGroup: boolean = false
  ): Promise<string> => {
    if (!currentUser) {
      throw new Error('No current user');
    }

    try {
      const conversationId = await MessageService.createConversation(
        participants,
        currentUser.id,
        title,
        isGroup
      );

      // Reload conversations to include the new one
      await loadUserConversations();

      return conversationId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    }
  };

  const markAsRead = async (conversationId: string): Promise<void> => {
    if (!currentUser) return;

    try {
      const conversationMessages = messages.filter(m => 
        m.conversationId === conversationId && 
        m.senderId !== currentUser.id && 
        !m.isRead
      );

      await MessageService.markMessagesAsRead(
        conversationId,
        currentUser.id,
        conversationMessages
      );

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.conversationId === conversationId && msg.senderId !== currentUser.id
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      ));

    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const searchMessages = async (query: string): Promise<Message[]> => {
    if (!currentUser) return [];

    try {
      return await MessageService.searchMessages(
        currentUser.id,
        query,
        activeConversation?.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
      return [];
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    if (!currentUser) return;

    try {
      await MessageService.deleteMessage(messageId, currentUser.id);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true }
          : msg
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    }
  };

  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!currentUser) return;

    // Check if already subscribed
    if (activeSubscriptions.has(conversationId)) return;

    const unsubscribe = MessageService.getConversationMessages(
      conversationId,
      currentUser.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    setActiveSubscriptions(prev => new Map(prev).set(conversationId, unsubscribe));
  }, [currentUser, activeSubscriptions]);

  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    const unsubscribe = activeSubscriptions.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      setActiveSubscriptions(prev => {
        const newSubs = new Map(prev);
        newSubs.delete(conversationId);
        return newSubs;
      });
    }
  }, [activeSubscriptions]);

  // Notification management
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after 10 seconds if not marked as persistent
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, isRead: true }
        : notif
    ));
  };

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      activeSubscriptions.forEach(unsubscribe => unsubscribe());
      ConversationRealtimeService.cleanup();
    };
  }, []);

  // Listen for real-time conversation updates
  useEffect(() => {
    if (currentUser) {
      // In a real implementation, you would subscribe to conversation list updates
      // For now, we'll manually refresh periodically
      const interval = setInterval(() => {
        loadUserConversations();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const contextValue: MessageContextType = {
    // State
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isLoading,
    error,
    
    // Actions
    setActiveConversation,
    sendMessage,
    createConversation,
    markAsRead,
    searchMessages,
    deleteMessage,
    
    // User management
    currentUser,
    setCurrentUser,
    
    // Real-time updates
    subscribeToConversation,
    unsubscribeFromConversation,
    
    // Notifications
    notifications,
    addNotification,
    markNotificationRead
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};

// Hook for creating conversations with specific users
export const useCreateConversation = () => {
  const { createConversation, setActiveConversation, conversations } = useMessages();

  const createConversationWithUser = async (
    targetUserId: string,
    targetUserName: string,
    currentUserId: string
  ) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(targetUserId) && 
      conv.participants.includes(currentUserId) &&
      !conv.isGroupConversation
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
      return existingConversation.id;
    }

    // Create new conversation
    const conversationId = await createConversation(
      [currentUserId, targetUserId],
      `Conversation with ${targetUserName}`,
      false
    );

    return conversationId;
  };

  return { createConversationWithUser };
};

// Hook for emergency messaging
export const useEmergencyMessaging = () => {
  const { createConversation, sendMessage, addNotification } = useMessages();

  const sendEmergencyBroadcast = async (
    message: string,
    recipientIds: string[],
    currentUserId: string,
    emergencyType: string
  ) => {
    try {
      const conversationId = await createConversation(
        [currentUserId, ...recipientIds],
        `EMERGENCY - ${emergencyType}`,
        true
      );

      await sendMessage(`🚨 EMERGENCY ALERT 🚨\n\n${message}`);

      // Create high-priority notifications
      recipientIds.forEach(recipientId => {
        addNotification({
          userId: recipientId,
          title: 'Emergency Alert',
          message: `Emergency broadcast: ${message}`,
          type: 'system',
          relatedEntityId: conversationId,
          isRead: false,
          createdAt: new Date(),
          priority: 'urgent'
        });
      });

      return conversationId;
    } catch (error) {
      console.error('Error sending emergency broadcast:', error);
      throw error;
    }
  };

  return { sendEmergencyBroadcast };
};

export default MessageProvider;
