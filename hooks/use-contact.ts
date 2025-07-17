/**
 * HealthSphere Contact Hook
 * Custom hook for managing contact form and FAQ functionality
 */

import { useState, useEffect, useCallback } from 'react';
import ContactService, { 
  type ContactSubmission, 
  type FAQCategory, 
  type FAQItem,
  type ContactCategory,
  type ContactPriority,
  type ContactStatus
} from '@/lib/firestore/contact-services';
import { toast } from 'react-hot-toast';

interface UseContactFormOptions {
  onSuccess?: (submissionId: string) => void;
  onError?: (error: Error) => void;
}

interface UseContactReturn {
  // Form state
  isSubmitting: boolean;
  submitSuccess: boolean;
  
  // FAQ state
  faqCategories: FAQCategory[];
  faqItems: FAQItem[];
  loadingFAQs: boolean;
  
  // Actions
  submitContactForm: (submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  loadFAQData: () => Promise<void>;
  searchFAQ: (searchTerm: string) => Promise<FAQItem[]>;
  incrementFAQView: (faqId: string) => Promise<void>;
  rateFAQHelpfulness: (faqId: string, isHelpful: boolean) => Promise<void>;
  resetForm: () => void;
  retryLoadFAQ: () => void;
}

/**
 * Custom hook for contact form and FAQ functionality
 */
export function useContact(options: UseContactFormOptions = {}): UseContactReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loadingFAQs, setLoadingFAQs] = useState(false);

  const { onSuccess, onError } = options;

  // Load FAQ data on hook initialization
  useEffect(() => {
    loadFAQData();
  }, []);

  const submitContactForm = useCallback(async (
    submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const submissionId = await ContactService.submitContactForm(submission);
      setSubmitSuccess(true);
      toast.success('Your message has been sent successfully! We\'ll get back to you soon.');
      
      if (onSuccess) {
        onSuccess(submissionId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, onError]);

  const loadFAQData = useCallback(async () => {
    setLoadingFAQs(true);
    
    try {
      const [categories, items] = await Promise.all([
        ContactService.getFAQCategories(),
        ContactService.getFAQItems()
      ]);
      
      setFaqCategories(categories || []);
      setFaqItems(items || []);
      
      // If no data is found, show a helpful message
      if (categories.length === 0 && items.length === 0) {
        console.warn('No FAQ data found. You may need to seed the database first.');
        toast.error('FAQ data not available. Please contact support or try again later.');
      }
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      
      // Set empty arrays to prevent undefined errors
      setFaqCategories([]);
      setFaqItems([]);
      
      // Check if it's a Firebase connection issue
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('permission-denied')) {
        toast.error('Access denied. Please check your permissions.');
      } else if (errorMessage.includes('unavailable')) {
        toast.error('Service temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to load FAQ items. You may need to seed the database first.');
      }
    } finally {
      setLoadingFAQs(false);
    }
  }, []);

  const searchFAQ = useCallback(async (searchTerm: string): Promise<FAQItem[]> => {
    try {
      return await ContactService.searchFAQ(searchTerm);
    } catch (error) {
      console.error('Error searching FAQ:', error);
      toast.error('Failed to search FAQ');
      return [];
    }
  }, []);

  const incrementFAQView = useCallback(async (faqId: string) => {
    try {
      await ContactService.incrementFAQView(faqId);
    } catch (error) {
      console.error('Error incrementing FAQ view:', error);
      // Don't show error toast for analytics failures
    }
  }, []);

  const rateFAQHelpfulness = useCallback(async (faqId: string, isHelpful: boolean) => {
    try {
      await ContactService.rateFAQHelpfulness(faqId, isHelpful);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error rating FAQ helpfulness:', error);
      toast.error('Failed to submit rating');
    }
  }, []);

  const resetForm = useCallback(() => {
    setSubmitSuccess(false);
    setIsSubmitting(false);
  }, []);

  const retryLoadFAQ = useCallback(() => {
    loadFAQData();
  }, [loadFAQData]);

  return {
    // State
    isSubmitting,
    submitSuccess,
    faqCategories,
    faqItems,
    loadingFAQs,
    
    // Actions
    submitContactForm,
    loadFAQData,
    searchFAQ,
    incrementFAQView,
    rateFAQHelpfulness,
    resetForm,
    retryLoadFAQ
  };
}

/**
 * Hook for managing contact submission history (for authenticated users)
 */
export function useContactHistory(userId?: string) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ContactService.getContactSubmissions(
        { userId },
        { limit: 20 }
      );
      setSubmissions(result.submissions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load submissions';
      setError(errorMessage);
      console.error('Error loading contact submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  return {
    submissions,
    loading,
    error,
    reload: loadSubmissions
  };
}

/**
 * Hook for real-time contact submissions (for admin/support staff)
 */
export function useContactSubmissionsRealtime(filters?: {
  status?: ContactStatus;
  category?: ContactCategory;
  userId?: string;
}) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = ContactService.subscribeToContactSubmissions(
      (newSubmissions) => {
        setSubmissions(newSubmissions);
        setLoading(false);
      },
      filters
    );

    return unsubscribe;
  }, [filters]);

  return {
    submissions,
    loading
  };
}

export default useContact;
