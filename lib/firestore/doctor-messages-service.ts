/**
 * Doctor Messages Service - Firestore Integration
 * Handles messaging functionality for doctors with patients and healthcare staff
 */

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    Timestamp,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
    Message, 
    Conversation, 
    User,
    Attachment,
    ApiResponse,
    QueryParams
} from '@/app/types';

export interface MessageThread {
    id: string;
    participantId: string;
    participantName: string;
    participantRole: string;
    participantAvatar?: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    priority: 'normal' | 'high' | 'urgent';
    isStarred: boolean;
    status: 'active' | 'archived' | 'blocked';
    messageType: 'general' | 'medical' | 'appointment' | 'prescription' | 'lab_result' | 'emergency';
    messages: DoctorMessage[];
}

export interface SendMessageData {
    senderId: string;
    recipientId: string;
    subject: string;
    content: string;
    priority: 'normal' | 'high' | 'urgent';
    messageType: 'general' | 'medical' | 'appointment' | 'prescription' | 'lab_result' | 'emergency';
    attachments?: Attachment[];
}

export interface ReplyMessageData {
    conversationId: string;
    senderId: string;
    content: string;
    messageType: 'general' | 'medical' | 'appointment' | 'prescription' | 'lab_result' | 'emergency';
    attachments?: Attachment[];
}

export interface DoctorMessage extends Message {
    recipientId: string;
    priority: 'normal' | 'high' | 'urgent';
    messageType: 'general' | 'medical' | 'appointment' | 'prescription' | 'lab_result' | 'emergency';
}

export class DoctorMessagesService {
    private static readonly MESSAGES_COLLECTION = 'messages';
    private static readonly CONVERSATIONS_COLLECTION = 'conversations';
    private static readonly USERS_COLLECTION = 'users';
    private static readonly PATIENTS_COLLECTION = 'patients';
    private static readonly DOCTORS_COLLECTION = 'doctors';
    private static readonly NURSES_COLLECTION = 'nurses';

    /**
     * Get message threads for a doctor
     */
    static async getMessageThreads(
        doctorId: string,
        queryParams?: QueryParams
    ): Promise<ApiResponse<MessageThread[]>> {
        try {
            let conversationsQuery = query(
                collection(db, this.CONVERSATIONS_COLLECTION),
                where('participantIds', 'array-contains', doctorId),
                orderBy('lastMessageTime', 'desc')
            );

            if (queryParams?.pagination?.limit) {
                conversationsQuery = query(conversationsQuery, limit(queryParams.pagination.limit));
            }

            const querySnapshot = await getDocs(conversationsQuery);
            const threads: MessageThread[] = [];

            for (const docSnapshot of querySnapshot.docs) {
                const conversationData = docSnapshot.data();
                const otherParticipantId = conversationData.participantIds.find((id: string) => id !== doctorId);
                
                if (otherParticipantId) {
                    // Get participant info
                    const participantInfo = await this.getParticipantInfo(otherParticipantId);
                    
                    // Get messages for this conversation
                    const messagesQuery = query(
                        collection(db, this.MESSAGES_COLLECTION),
                        where('conversationId', '==', docSnapshot.id),
                        orderBy('createdAt', 'desc'),
                        limit(50)
                    );
                    
                    const messagesSnapshot = await getDocs(messagesQuery);
                    const messages = messagesSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            conversationId: data.conversationId || '',
                            senderId: data.senderId || '',
                            content: data.content || '',
                            recipientId: data.recipientId || '',
                            priority: data.priority || 'normal',
                            messageType: data.messageType || 'general',
                            attachments: data.attachments || [],
                            createdAt: data.createdAt?.toDate() || new Date(),
                            isRead: data.isRead || false,
                            isDeleted: data.isDeleted || false,
                            readAt: data.readAt?.toDate()
                        } as DoctorMessage;
                    });

                    // Count unread messages
                    const unreadCount = messages.filter(msg => 
                        msg.recipientId === doctorId && !msg.isRead
                    ).length;

                    threads.push({
                        id: docSnapshot.id,
                        participantId: otherParticipantId,
                        participantName: participantInfo.name,
                        participantRole: participantInfo.role,
                        participantAvatar: participantInfo.avatar,
                        lastMessage: conversationData.lastMessage || '',
                        lastMessageTime: conversationData.lastMessageTime?.toDate() || new Date(),
                        unreadCount,
                        priority: conversationData.priority || 'normal',
                        isStarred: conversationData.starredBy?.includes(doctorId) || false,
                        status: conversationData.status || 'active',
                        messageType: conversationData.messageType || 'general',
                        messages: messages.reverse()
                    });
                }
            }

            return { data: threads };
        } catch (error) {
            console.error('Error fetching message threads:', error);
            return {
                error: { status: 500, message: 'Failed to fetch message threads' }
            };
        }
    }

    /**
     * Get participant information from various collections
     */
    private static async getParticipantInfo(participantId: string): Promise<{
        name: string;
        role: string;
        avatar?: string;
    }> {
        try {
            // Try to find in users collection first
            const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, participantId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                    role: userData.role || 'unknown',
                    avatar: userData.profileImageUrl
                };
            }

            // Try patients collection
            const patientDoc = await getDoc(doc(db, this.PATIENTS_COLLECTION, participantId));
            if (patientDoc.exists()) {
                const patientData = patientDoc.data();
                return {
                    name: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
                    role: 'patient',
                    avatar: patientData.profileImageUrl
                };
            }

            // Try doctors collection
            const doctorDoc = await getDoc(doc(db, this.DOCTORS_COLLECTION, participantId));
            if (doctorDoc.exists()) {
                const doctorData = doctorDoc.data();
                return {
                    name: `Dr. ${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim(),
                    role: 'doctor',
                    avatar: doctorData.profileImageUrl
                };
            }

            // Try nurses collection
            const nurseDoc = await getDoc(doc(db, this.NURSES_COLLECTION, participantId));
            if (nurseDoc.exists()) {
                const nurseData = nurseDoc.data();
                return {
                    name: `${nurseData.firstName || ''} ${nurseData.lastName || ''}`.trim(),
                    role: 'nurse',
                    avatar: nurseData.profileImageUrl
                };
            }

            return {
                name: 'Unknown User',
                role: 'unknown'
            };
        } catch (error) {
            console.error('Error getting participant info:', error);
            return {
                name: 'Unknown User',
                role: 'unknown'
            };
        }
    }

    /**
     * Get contacts for a doctor (patients and staff)
     */
    static async getContacts(doctorId: string): Promise<ApiResponse<User[]>> {
        try {
            const contacts: User[] = [];

            // Get patients
            const patientsQuery = query(
                collection(db, this.PATIENTS_COLLECTION),
                where('primaryDoctorId', '==', doctorId),
                orderBy('lastName', 'asc')
            );
            const patientsSnapshot = await getDocs(patientsQuery);
            const patients = patientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                role: 'patient'
            })) as User[];
            contacts.push(...patients);

            // Get other doctors
            const doctorsQuery = query(
                collection(db, this.DOCTORS_COLLECTION),
                where('id', '!=', doctorId),
                orderBy('lastName', 'asc')
            );
            const doctorsSnapshot = await getDocs(doctorsQuery);
            const doctors = doctorsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                role: 'doctor'
            })) as User[];
            contacts.push(...doctors);

            // Get nurses
            const nursesQuery = query(
                collection(db, this.NURSES_COLLECTION),
                orderBy('lastName', 'asc')
            );
            const nursesSnapshot = await getDocs(nursesQuery);
            const nurses = nursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                role: 'nurse'
            })) as User[];
            contacts.push(...nurses);

            return { data: contacts };
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return {
                error: { status: 500, message: 'Failed to fetch contacts' }
            };
        }
    }

    /**
     * Send a new message
     */
    static async sendMessage(messageData: SendMessageData): Promise<ApiResponse<DoctorMessage>> {
        try {
            const batch = writeBatch(db);

            // Create or get conversation
            const conversationId = await this.getOrCreateConversation(
                messageData.senderId,
                messageData.recipientId,
                messageData.messageType
            );

            // Create message
            const messageRef = doc(collection(db, this.MESSAGES_COLLECTION));
            const message: Omit<DoctorMessage, 'id'> = {
                conversationId,
                senderId: messageData.senderId,
                recipientId: messageData.recipientId,
                content: messageData.content,
                messageType: messageData.messageType,
                priority: messageData.priority,
                attachments: messageData.attachments || [],
                isRead: false,
                isDeleted: false,
                createdAt: new Date()
            };

            batch.set(messageRef, {
                ...message,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Update conversation
            const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
            batch.update(conversationRef, {
                lastMessage: messageData.content,
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: messageData.senderId,
                updatedAt: serverTimestamp()
            });

            await batch.commit();

            return { data: { id: messageRef.id, ...message } };
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                error: { status: 500, message: 'Failed to send message' }
            };
        }
    }

    /**
     * Reply to a message
     */
    static async replyToMessage(replyData: ReplyMessageData): Promise<ApiResponse<DoctorMessage>> {
        try {
            const messageRef = doc(collection(db, this.MESSAGES_COLLECTION));
            const message: Omit<DoctorMessage, 'id'> = {
                conversationId: replyData.conversationId,
                senderId: replyData.senderId,
                recipientId: '', // Will be set based on conversation participants
                content: replyData.content,
                messageType: replyData.messageType,
                priority: 'normal',
                attachments: replyData.attachments || [],
                isRead: false,
                isDeleted: false,
                createdAt: new Date()
            };

            // Get conversation to find recipient
            const conversationDoc = await getDoc(doc(db, this.CONVERSATIONS_COLLECTION, replyData.conversationId));
            if (conversationDoc.exists()) {
                const conversationData = conversationDoc.data();
                const recipientId = conversationData.participantIds.find((id: string) => id !== replyData.senderId);
                message.recipientId = recipientId;
            }

            const batch = writeBatch(db);
            
            batch.set(messageRef, {
                ...message,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Update conversation
            const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, replyData.conversationId);
            batch.update(conversationRef, {
                lastMessage: replyData.content,
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: replyData.senderId,
                updatedAt: serverTimestamp()
            });

            await batch.commit();

            return { data: { id: messageRef.id, ...message } };
        } catch (error) {
            console.error('Error replying to message:', error);
            return {
                error: { status: 500, message: 'Failed to reply to message' }
            };
        }
    }

    /**
     * Get or create conversation between two users
     */
    private static async getOrCreateConversation(
        senderId: string,
        recipientId: string,
        messageType: string
    ): Promise<string> {
        try {
            // Check if conversation already exists
            const conversationsQuery = query(
                collection(db, this.CONVERSATIONS_COLLECTION),
                where('participantIds', 'array-contains', senderId)
            );
            
            const snapshot = await getDocs(conversationsQuery);
            
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.participantIds.includes(recipientId)) {
                    return doc.id;
                }
            }

            // Create new conversation
            const conversationRef = doc(collection(db, this.CONVERSATIONS_COLLECTION));
            const conversation = {
                participantIds: [senderId, recipientId],
                messageType,
                priority: 'normal',
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: '',
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: senderId,
                starredBy: []
            };

            await addDoc(collection(db, this.CONVERSATIONS_COLLECTION), conversation);
            return conversationRef.id;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    /**
     * Get a specific conversation
     */
    static async getConversation(conversationId: string): Promise<ApiResponse<MessageThread>> {
        try {
            const conversationDoc = await getDoc(doc(db, this.CONVERSATIONS_COLLECTION, conversationId));
            if (!conversationDoc.exists()) {
                return {
                    error: { status: 404, message: 'Conversation not found' }
                };
            }

            const conversationData = conversationDoc.data();
            const messages = await this.getMessagesForConversation(conversationId);
            
            // Get participant info (assuming first participant is the other party)
            const otherParticipantId = conversationData.participantIds[0];
            const participantInfo = await this.getParticipantInfo(otherParticipantId);

            const thread: MessageThread = {
                id: conversationId,
                participantId: otherParticipantId,
                participantName: participantInfo.name,
                participantRole: participantInfo.role,
                participantAvatar: participantInfo.avatar,
                lastMessage: conversationData.lastMessage || '',
                lastMessageTime: conversationData.lastMessageTime?.toDate() || new Date(),
                unreadCount: 0,
                priority: conversationData.priority || 'normal',
                isStarred: false,
                status: conversationData.status || 'active',
                messageType: conversationData.messageType || 'general',
                messages: messages.data || []
            };

            return { data: thread };
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return {
                error: { status: 500, message: 'Failed to fetch conversation' }
            };
        }
    }

    /**
     * Get messages for a conversation
     */
    private static async getMessagesForConversation(conversationId: string): Promise<ApiResponse<DoctorMessage[]>> {
        try {
            const messagesQuery = query(
                collection(db, this.MESSAGES_COLLECTION),
                where('conversationId', '==', conversationId),
                orderBy('createdAt', 'asc')
            );
            
            const snapshot = await getDocs(messagesQuery);
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    conversationId: data.conversationId || '',
                    senderId: data.senderId || '',
                    content: data.content || '',
                    recipientId: data.recipientId || '',
                    priority: data.priority || 'normal',
                    messageType: data.messageType || 'general',
                    attachments: data.attachments || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    isRead: data.isRead || false,
                    isDeleted: data.isDeleted || false,
                    readAt: data.readAt?.toDate()
                } as DoctorMessage;
            });

            return { data: messages };
        } catch (error) {
            console.error('Error fetching messages:', error);
            return {
                error: { status: 500, message: 'Failed to fetch messages' }
            };
        }
    }

    /**
     * Archive a conversation
     */
    static async archiveConversation(conversationId: string): Promise<ApiResponse<void>> {
        try {
            const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
            await updateDoc(conversationRef, {
                status: 'archived',
                updatedAt: serverTimestamp()
            });

            return { data: undefined };
        } catch (error) {
            console.error('Error archiving conversation:', error);
            return {
                error: { status: 500, message: 'Failed to archive conversation' }
            };
        }
    }

    /**
     * Star/unstar a conversation
     */
    static async starConversation(conversationId: string, isStarred: boolean): Promise<ApiResponse<void>> {
        try {
            const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
            // This would need to be implemented based on the user who is starring
            await updateDoc(conversationRef, {
                isStarred,
                updatedAt: serverTimestamp()
            });

            return { data: undefined };
        } catch (error) {
            console.error('Error starring conversation:', error);
            return {
                error: { status: 500, message: 'Failed to star conversation' }
            };
        }
    }

    /**
     * Subscribe to real-time message updates
     */
    static subscribeToMessages(
        doctorId: string,
        callback: (messages: MessageThread[]) => void
    ): () => void {
        const conversationsQuery = query(
            collection(db, this.CONVERSATIONS_COLLECTION),
            where('participantIds', 'array-contains', doctorId),
            orderBy('lastMessageTime', 'desc')
        );

        return onSnapshot(conversationsQuery, async (snapshot) => {
            const threads: MessageThread[] = [];
            
            for (const doc of snapshot.docs) {
                const conversationData = doc.data();
                const otherParticipantId = conversationData.participantIds.find((id: string) => id !== doctorId);
                
                if (otherParticipantId) {
                    const participantInfo = await this.getParticipantInfo(otherParticipantId);
                    const messages = await this.getMessagesForConversation(doc.id);
                    
                    threads.push({
                        id: doc.id,
                        participantId: otherParticipantId,
                        participantName: participantInfo.name,
                        participantRole: participantInfo.role,
                        participantAvatar: participantInfo.avatar,
                        lastMessage: conversationData.lastMessage || '',
                        lastMessageTime: conversationData.lastMessageTime?.toDate() || new Date(),
                        unreadCount: 0,
                        priority: conversationData.priority || 'normal',
                        isStarred: conversationData.starredBy?.includes(doctorId) || false,
                        status: conversationData.status || 'active',
                        messageType: conversationData.messageType || 'general',
                        messages: messages.data || []
                    });
                }
            }
            
            callback(threads);
        });
    }

    /**
     * Mark messages as read
     */
    static async markMessagesAsRead(messageIds: string[]): Promise<ApiResponse<void>> {
        try {
            const batch = writeBatch(db);
            
            messageIds.forEach(messageId => {
                const messageRef = doc(db, this.MESSAGES_COLLECTION, messageId);
                batch.update(messageRef, {
                    isRead: true,
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();
            return { data: undefined };
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return {
                error: { status: 500, message: 'Failed to mark messages as read' }
            };
        }
    }
}
