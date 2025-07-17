/**
 * Firestore services for message and conversation management
 * Handles real-time messaging, conversation management, and role-based access
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  writeBatch,
  getDocs,
  Timestamp,
  addDoc,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { sanitizeMedicalData, logSecurityEvent } from '@/app/utils/security';
import type { 
  Message, 
  Conversation, 
  User, 
  UserRole, 
  Notification,
  QueryParams,
  PaginationParams 
} from '@/app/types';

/**
 * Message Service - Handles messaging functionality
 */
export class MessageService {
  private static readonly CONVERSATIONS_COLLECTION = 'conversations';
  private static readonly MESSAGES_COLLECTION = 'messages';
  private static readonly USERS_COLLECTION = 'users';

  /**
   * Create a new conversation
   */
  static async createConversation(
    participants: string[],
    initiatedBy: string,
    title?: string,
    isGroupConversation: boolean = false
  ): Promise<string> {
    try {
      const conversation: Omit<Conversation, 'id'> = {
        participants,
        title,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        isGroupConversation,
        metadata: {
          createdBy: initiatedBy,
          participantRoles: await this.getParticipantRoles(participants)
        }
      };

      const sanitizedConversation = sanitizeMedicalData(conversation);
      const docRef = await addDoc(collection(db, this.CONVERSATIONS_COLLECTION), {
        ...sanitizedConversation,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      await logSecurityEvent(initiatedBy, 'CONVERSATION_CREATE', 'CONVERSATION', true, {
        conversationId: docRef.id,
        participantCount: participants.length,
        isGroup: isGroupConversation
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachments?: any[]
  ): Promise<string> {
    try {
      const message: Omit<Message, 'id'> = {
        conversationId,
        senderId,
        content: sanitizeMedicalData(content),
        attachments: attachments || [],
        createdAt: new Date(),
        isRead: false,
        isDeleted: false
      };

      const batch = writeBatch(db);

      // Add message
      const messageRef = doc(collection(db, this.MESSAGES_COLLECTION));
      batch.set(messageRef, {
        ...message,
        createdAt: serverTimestamp()
      });

      // Update conversation last message time
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
      batch.update(conversationRef, {
        lastMessageAt: serverTimestamp()
      });

      await batch.commit();

      await logSecurityEvent(senderId, 'MESSAGE_SEND', 'MESSAGE', true, {
        conversationId,
        messageId: messageRef.id,
        hasAttachments: !!attachments?.length
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get conversations for a user with role-based filtering
   */
  static async getUserConversations(
    userId: string,
    userRole: UserRole,
    pagination?: PaginationParams
  ): Promise<{ conversations: Conversation[]; hasMore: boolean }> {
    try {
      let conversationQuery = query(
        collection(db, this.CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      if (pagination?.limit) {
        conversationQuery = query(conversationQuery, limit(pagination.limit + 1));
      }

      const snapshot = await getDocs(conversationQuery);
      const conversations: Conversation[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastMessageAt: data.lastMessageAt?.toDate() || new Date()
        } as Conversation);
      });

      // Filter conversations based on role permissions
      const filteredConversations = await this.filterConversationsByRole(conversations, userRole);
      
      const hasMore = pagination?.limit ? filteredConversations.length > pagination.limit : false;
      if (hasMore) {
        filteredConversations.pop(); // Remove the extra item
      }

      return { conversations: filteredConversations, hasMore };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  /**
   * Get messages for a conversation with real-time updates
   */
  static getConversationMessages(
    conversationId: string,
    userId: string,
    onUpdate: (messages: Message[]) => void,
    pagination?: PaginationParams
  ): () => void {
    try {
      let messageQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc')
      );

      if (pagination?.limit) {
        messageQuery = query(messageQuery, limit(pagination.limit));
      }

      const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
        const messages: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            readAt: data.readAt?.toDate()
          } as Message);
        });

        // Mark messages as read
        this.markMessagesAsRead(conversationId, userId, messages.filter(m => !m.isRead && m.senderId !== userId));
        
        onUpdate(messages.reverse()); // Reverse to show oldest first
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    conversationId: string,
    userId: string,
    messages: Message[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      messages.forEach((message) => {
        if (message.senderId !== userId && !message.isRead) {
          const messageRef = doc(db, this.MESSAGES_COLLECTION, message.id);
          batch.update(messageRef, {
            isRead: true,
            readAt: serverTimestamp()
          });
        }
      });

      if (messages.length > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Search messages within conversations
   */
  static async searchMessages(
    userId: string,
    searchTerm: string,
    conversationId?: string
  ): Promise<Message[]> {
    try {
      let searchQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (conversationId) {
        searchQuery = query(searchQuery, where('conversationId', '==', conversationId));
      }

      const snapshot = await getDocs(searchQuery);
      const messages: Message[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const message = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          readAt: data.readAt?.toDate()
        } as Message;

        // Simple text search - in production, use full-text search
        if (message.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          messages.push(message);
        }
      });

      // Filter messages the user has access to
      return await this.filterMessagesByAccess(messages, userId);
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  /**
   * Get user details for conversation participants
   */
  static async getConversationParticipants(conversationId: string): Promise<User[]> {
    try {
      const conversationDoc = await getDoc(doc(db, this.CONVERSATIONS_COLLECTION, conversationId));
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationDoc.data() as Conversation;
      const participants: User[] = [];

      for (const participantId of conversation.participants) {
        const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, participantId));
        if (userDoc.exists()) {
          participants.push({ id: userDoc.id, ...userDoc.data() } as User);
        }
      }

      return participants;
    } catch (error) {
      console.error('Error getting conversation participants:', error);
      throw new Error('Failed to fetch participants');
    }
  }

  /**
   * Delete a message (soft delete)
   */
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(db, this.MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const message = messageDoc.data() as Message;
      
      if (message.senderId !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'MESSAGE_DELETE', 'MESSAGE', true, {
        messageId,
        conversationId: message.conversationId
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Create notifications for new messages
   */
  static async createMessageNotifications(
    conversationId: string,
    senderId: string,
    messageContent: string
  ): Promise<void> {
    try {
      const conversation = await getDoc(doc(db, this.CONVERSATIONS_COLLECTION, conversationId));
      
      if (!conversation.exists()) return;

      const conversationData = conversation.data() as Conversation;
      const recipients = conversationData.participants.filter(id => id !== senderId);

      const batch = writeBatch(db);

      for (const recipientId of recipients) {
        const notification: Omit<Notification, 'id'> = {
          userId: recipientId,
          title: 'New Message',
          message: `You have a new message: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
          type: 'message',
          relatedEntityId: conversationId,
          isRead: false,
          createdAt: new Date(),
          priority: 'normal'
        };

        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          ...notification,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error creating message notifications:', error);
    }
  }

  /**
   * Helper methods
   */
  private static async getParticipantRoles(participantIds: string[]): Promise<Record<string, UserRole>> {
    const roles: Record<string, UserRole> = {};
    
    for (const id of participantIds) {
      try {
        const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, id));
        if (userDoc.exists()) {
          roles[id] = userDoc.data().role;
        }
      } catch (error) {
        console.warn(`Failed to get role for user ${id}:`, error);
      }
    }
    
    return roles;
  }

  private static async filterConversationsByRole(
    conversations: Conversation[],
    userRole: UserRole
  ): Promise<Conversation[]> {
    // Implement role-based filtering logic
    // For now, return all conversations, but this can be extended
    return conversations;
  }

  private static async filterMessagesByAccess(
    messages: Message[],
    userId: string
  ): Promise<Message[]> {
    // Filter messages based on user access rights
    // For now, return all messages, but this can be extended
    return messages;
  }
}

/**
 * Real-time conversation updates
 */
export class ConversationRealtimeService {
  private static activeSubscriptions = new Map<string, () => void>();

  /**
   * Subscribe to conversation updates
   */
  static subscribeToConversation(
    conversationId: string,
    onUpdate: (conversation: Conversation) => void
  ): () => void {
    const conversationRef = doc(db, MessageService['CONVERSATIONS_COLLECTION'], conversationId);
    
    const unsubscribe = onSnapshot(conversationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        onUpdate({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastMessageAt: data.lastMessageAt?.toDate() || new Date()
        } as Conversation);
      }
    });

    this.activeSubscriptions.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from conversation updates
   */
  static unsubscribeFromConversation(conversationId: string): void {
    const unsubscribe = this.activeSubscriptions.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.activeSubscriptions.delete(conversationId);
    }
  }

  /**
   * Clean up all subscriptions
   */
  static cleanup(): void {
    this.activeSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.activeSubscriptions.clear();
  }
}
