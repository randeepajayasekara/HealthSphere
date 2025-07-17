/**
 * HealthSphere Contact Services
 * Firestore service layer for contact forms, support tickets, and help requests
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch,
  onSnapshot,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { sanitizeMedicalData, logSecurityEvent } from '@/app/utils/security';

// Collection references
const CONTACT_SUBMISSIONS = 'contactSubmissions';
const SUPPORT_TICKETS = 'supportTickets';
const FAQ_CATEGORIES = 'faqCategories';
const FAQ_ITEMS = 'faqItems';
const CONTACT_ANALYTICS = 'contactAnalytics';

// Types
export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: ContactCategory;
  priority: ContactPriority;
  status: ContactStatus;
  userId?: string;
  userRole?: string;
  submittedAt: Date;
  respondedAt?: Date;
  assignedTo?: string;
  responseMessage?: string;
  attachments?: ContactAttachment[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
}

export interface ContactAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: Date;
}

export interface SupportTicket {
  id?: string;
  ticketNumber: string;
  contactSubmissionId: string;
  assignedTo?: string;
  status: TicketStatus;
  priority: ContactPriority;
  category: ContactCategory;
  tags: string[];
  internalNotes: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  estimatedResolutionTime?: Date;
}

export interface FAQCategory {
  id?: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQItem {
  id?: string;
  categoryId: string;
  question: string;
  answer: string;
  tags: string[];
  order: number;
  isActive: boolean;
  viewCount: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactAnalytics {
  id?: string;
  date: Date;
  totalSubmissions: number;
  categoryCounts: Record<ContactCategory, number>;
  priorityCounts: Record<ContactPriority, number>;
  averageResponseTime: number;
  resolutionRate: number;
  satisfactionScore: number;
}

export type ContactCategory = 
  | 'general_inquiry'
  | 'technical_support'
  | 'billing_insurance'
  | 'medical_records'
  | 'appointment_scheduling'
  | 'emergency_assistance'
  | 'feature_request'
  | 'bug_report'
  | 'account_access'
  | 'privacy_security'
  | 'other';

export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContactStatus = 'submitted' | 'in_review' | 'in_progress' | 'responded' | 'resolved' | 'closed';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';

/**
 * Service class for managing contact submissions and support tickets
 */
export class ContactService {
  
  /**
   * Submit a new contact form
   */
  static async submitContactForm(
    submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<string> {
    try {
      const sanitizedSubmission = sanitizeMedicalData(submission);
      
      const contactData: Omit<ContactSubmission, 'id'> = {
        ...sanitizedSubmission,
        status: 'submitted',
        submittedAt: new Date()
      };

      const docRef = await addDoc(collection(db, CONTACT_SUBMISSIONS), {
        ...contactData,
        submittedAt: serverTimestamp()
      });

      // Log security event if user is authenticated
      if (submission.userId) {
        await logSecurityEvent(
          submission.userId, 
          'CONTACT_SUBMISSION', 
          'CONTACT_FORM', 
          true, 
          {
            category: submission.category,
            priority: submission.priority
          }
        );
      }

      // Create support ticket for high priority submissions
      if (submission.priority === 'high' || submission.priority === 'urgent') {
        await this.createSupportTicket(docRef.id, submission.category, submission.priority);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw new Error('Failed to submit contact form');
    }
  }

  /**
   * Create a support ticket from contact submission
   */
  static async createSupportTicket(
    contactSubmissionId: string,
    category: ContactCategory,
    priority: ContactPriority
  ): Promise<string> {
    try {
      const ticketNumber = this.generateTicketNumber();
      
      const ticket: Omit<SupportTicket, 'id'> = {
        ticketNumber,
        contactSubmissionId,
        status: 'open',
        priority,
        category,
        tags: [category, priority],
        internalNotes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, SUPPORT_TICKETS), {
        ...ticket,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new Error('Failed to create support ticket');
    }
  }

  /**
   * Get contact submissions with pagination
   */
  static async getContactSubmissions(
    filters?: {
      status?: ContactStatus;
      category?: ContactCategory;
      priority?: ContactPriority;
      userId?: string;
    },
    pagination?: {
      limit?: number;
      lastDoc?: QueryDocumentSnapshot;
    }
  ): Promise<{
    submissions: ContactSubmission[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        collection(db, CONTACT_SUBMISSIONS),
        orderBy('submittedAt', 'desc')
      );

      // Apply filters
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      // Apply pagination
      if (pagination?.limit) {
        q = query(q, limit(pagination.limit + 1));
      }
      if (pagination?.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc));
      }

      const snapshot = await getDocs(q);
      const submissions: ContactSubmission[] = [];
      
      snapshot.docs.forEach((doc, index) => {
        if (!pagination?.limit || index < pagination.limit) {
          const data = doc.data();
          submissions.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            respondedAt: data.respondedAt?.toDate()
          } as ContactSubmission);
        }
      });

      const lastDoc = snapshot.docs[submissions.length - 1];
      const hasMore = snapshot.docs.length > (pagination?.limit || 0);

      return { submissions, lastDoc, hasMore };
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      throw new Error('Failed to fetch contact submissions');
    }
  }

  /**
   * Update contact submission status
   */
  static async updateContactStatus(
    submissionId: string,
    status: ContactStatus,
    responseMessage?: string,
    assignedTo?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (responseMessage) {
        updateData.responseMessage = responseMessage;
        updateData.respondedAt = serverTimestamp();
      }

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      await updateDoc(doc(db, CONTACT_SUBMISSIONS, submissionId), updateData);
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw new Error('Failed to update contact status');
    }
  }

  /**
   * Get FAQ categories
   */
  static async getFAQCategories(): Promise<FAQCategory[]> {
    try {
      const q = query(
        collection(db, FAQ_CATEGORIES),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      
      // If no documents found, return empty array
      if (snapshot.empty) {
        console.warn('No FAQ categories found in database');
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FAQCategory[];
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
      
      // If it's a permission denied error, throw specific message
      if (error instanceof Error && error.message.includes('permission-denied')) {
        throw new Error('Permission denied accessing FAQ categories');
      }
      
      // For other errors, return empty array instead of throwing
      console.warn('Returning empty FAQ categories array due to error');
      return [];
    }
  }

  /**
   * Get FAQ items by category
   */
  static async getFAQItems(categoryId?: string): Promise<FAQItem[]> {
    try {
      let q = query(
        collection(db, FAQ_ITEMS),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      if (categoryId) {
        q = query(q, where('categoryId', '==', categoryId));
      }

      const snapshot = await getDocs(q);
      
      // If no documents found, return empty array
      if (snapshot.empty) {
        console.warn('No FAQ items found in database');
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FAQItem[];
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
      
      // If it's a permission denied error, throw specific message
      if (error instanceof Error && error.message.includes('permission-denied')) {
        throw new Error('Permission denied accessing FAQ items');
      }
      
      // For other errors, return empty array instead of throwing
      console.warn('Returning empty FAQ items array due to error');
      return [];
    }
  }

  /**
   * Search FAQ items
   */
  static async searchFAQ(searchTerm: string): Promise<FAQItem[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // In production, you might want to use Algolia or similar service
      const snapshot = await getDocs(
        query(
          collection(db, FAQ_ITEMS),
          where('isActive', '==', true),
          orderBy('viewCount', 'desc'),
          limit(20)
        )
      );

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FAQItem[];

      // Client-side filtering for search term
      const searchLower = searchTerm.toLowerCase();
      return items.filter(item => 
        item.question.toLowerCase().includes(searchLower) ||
        item.answer.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching FAQ:', error);
      throw new Error('Failed to search FAQ');
    }
  }

  /**
   * Increment FAQ view count
   */
  static async incrementFAQView(faqId: string): Promise<void> {
    try {
      const docRef = doc(db, FAQ_ITEMS, faqId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentCount = docSnap.data().viewCount || 0;
        await updateDoc(docRef, {
          viewCount: currentCount + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing FAQ view:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Rate FAQ helpfulness
   */
  static async rateFAQHelpfulness(faqId: string, isHelpful: boolean): Promise<void> {
    try {
      const docRef = doc(db, FAQ_ITEMS, faqId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const updates: any = {};
        
        if (isHelpful) {
          updates.helpfulVotes = (data.helpfulVotes || 0) + 1;
        } else {
          updates.unhelpfulVotes = (data.unhelpfulVotes || 0) + 1;
        }
        
        await updateDoc(docRef, updates);
      }
    } catch (error) {
      console.error('Error rating FAQ helpfulness:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Get contact analytics
   */
  static async getContactAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<ContactAnalytics | null> {
    try {
      const q = query(
        collection(db, CONTACT_SUBMISSIONS),
        where('submittedAt', '>=', Timestamp.fromDate(startDate)),
        where('submittedAt', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      const submissions = snapshot.docs.map(doc => doc.data() as ContactSubmission);

      // Calculate analytics
      const totalSubmissions = submissions.length;
      const categoryCounts = {} as Record<ContactCategory, number>;
      const priorityCounts = {} as Record<ContactPriority, number>;
      
      submissions.forEach(submission => {
        categoryCounts[submission.category] = (categoryCounts[submission.category] || 0) + 1;
        priorityCounts[submission.priority] = (priorityCounts[submission.priority] || 0) + 1;
      });

      const responseTimeTotal = submissions
        .filter(s => s.respondedAt && s.submittedAt)
        .reduce((total, s) => {
          const responseTime = s.respondedAt!.getTime() - s.submittedAt.getTime();
          return total + responseTime;
        }, 0);

      const respondedSubmissions = submissions.filter(s => s.respondedAt).length;
      const averageResponseTime = respondedSubmissions > 0 
        ? responseTimeTotal / respondedSubmissions / (1000 * 60 * 60) // Convert to hours
        : 0;

      const resolvedSubmissions = submissions.filter(s => s.status === 'resolved').length;
      const resolutionRate = totalSubmissions > 0 ? resolvedSubmissions / totalSubmissions : 0;

      return {
        date: new Date(),
        totalSubmissions,
        categoryCounts,
        priorityCounts,
        averageResponseTime,
        resolutionRate,
        satisfactionScore: 0 // Would need separate satisfaction tracking
      };
    } catch (error) {
      console.error('Error fetching contact analytics:', error);
      return null;
    }
  }

  /**
   * Subscribe to contact submissions real-time updates
   */
  static subscribeToContactSubmissions(
    callback: (submissions: ContactSubmission[]) => void,
    filters?: {
      status?: ContactStatus;
      category?: ContactCategory;
      userId?: string;
    }
  ): () => void {
    let q = query(
      collection(db, CONTACT_SUBMISSIONS),
      orderBy('submittedAt', 'desc'),
      limit(50)
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

    return onSnapshot(q, (snapshot) => {
      const submissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        respondedAt: doc.data().respondedAt?.toDate()
      })) as ContactSubmission[];
      
      callback(submissions);
    });
  }

  /**
   * Generate unique ticket number
   */
  private static generateTicketNumber(): string {
    const prefix = 'HS';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}

export default ContactService;
