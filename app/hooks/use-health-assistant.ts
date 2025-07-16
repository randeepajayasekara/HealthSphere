'use client';

import { useState, useCallback } from 'react';
import { 
  HealthInquiry, 
  HealthInquiryAssistant, 
  AIHealthResponse,
  UploadedReport,
  ExtractedReportData,
  ReportAnalysisResult,
  EmergencyFlag
} from '@/app/types';
import { useAuth } from '@/app/contexts/auth-context';

interface UseHealthAssistantReturn {
  sendInquiry: (inquiry: Partial<HealthInquiry>) => Promise<HealthInquiry>;
  analyzeReport: (reportFile: File) => Promise<ExtractedReportData>;
  getInquiryHistory: (limit?: number) => Promise<HealthInquiry[]>;
  updateInquiryReview: (inquiryId: string, reviewNotes: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  analytics: {
    totalInquiries: number;
    emergencyDetections: number;
    averageResponseTime: number;
  } | null;
}

export function useHealthAssistant(): UseHealthAssistantReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState(null);

  const sendInquiry = useCallback(async (inquiryData: Partial<HealthInquiry>): Promise<HealthInquiry> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health-assistant/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inquiryData.query,
          userId: user.id,
          userRole: user.role,
          inquiryType: inquiryData.inquiryType || 'general_health',
          attachments: inquiryData.attachedReports || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process inquiry');
      }

      const data = await response.json();
      return data.inquiry;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const analyzeReport = useCallback(async (reportFile: File): Promise<ExtractedReportData> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', reportFile);
      formData.append('userId', user.id);

      const response = await fetch('/api/health-assistant/report-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze report');
      }

      const data = await response.json();
      return data.extractedData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getInquiryHistory = useCallback(async (limit: number = 20): Promise<HealthInquiry[]> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/health-assistant/inquiry?userId=${user.id}&limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }

      const data = await response.json();
      return data.history;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateInquiryReview = useCallback(async (inquiryId: string, reviewNotes: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/health-assistant/inquiry/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy: user.id,
          reviewNotes,
          humanReviewRequired: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    sendInquiry,
    analyzeReport,
    getInquiryHistory,
    updateInquiryReview,
    isLoading,
    error,
    analytics
  };
}
