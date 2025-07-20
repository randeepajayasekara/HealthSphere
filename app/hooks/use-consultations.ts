/**
 * useConsultations Hook
 * Custom hook for managing consultation state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { ConsultationService } from '@/lib/firestore/consultation-service';
import { 
  Consultation, 
  ConsultationStatus, 
  ConsultationType, 
  ConsultationPriority, 
  PatientProfile,
  ApiResponse
} from '@/app/types';
import { toast } from 'react-hot-toast';

interface ConsultationWithPatient extends Consultation {
  patient?: PatientProfile;
}

interface UseConsultationsOptions {
  doctorId: string;
  autoRefresh?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  filters?: {
    status?: ConsultationStatus;
    type?: ConsultationType;
    priority?: ConsultationPriority;
  };
}

interface UseConsultationsReturn {
  consultations: ConsultationWithPatient[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Actions
  loadConsultations: () => Promise<void>;
  refreshConsultations: () => Promise<void>;
  updateConsultationStatus: (consultationId: string, status: ConsultationStatus) => Promise<void>;
  updateConsultation: (consultationId: string, data: Partial<Consultation>) => Promise<void>;
  
  // Filters
  searchConsultations: (searchTerm: string) => Promise<ConsultationWithPatient[]>;
  filterConsultations: (filters: { [key: string]: any }) => ConsultationWithPatient[];
  
  // Real-time
  subscribeToConsultations: (filters: { date?: Date; status?: ConsultationStatus[] }) => () => void;
  
  // Analytics
  getConsultationStats: () => {
    total: number;
    byStatus: { [key in ConsultationStatus]: number };
    byType: { [key in ConsultationType]: number };
    byPriority: { [key in ConsultationPriority]: number };
  };
}

export const useConsultations = (options: UseConsultationsOptions): UseConsultationsReturn => {
  const [consultations, setConsultations] = useState<ConsultationWithPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ConsultationService.getDoctorConsultations(options.doctorId, {
        dateRange: options.dateRange,
        filters: options.filters
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setConsultations(response.data.consultations);
      }
    } catch (err) {
      console.error('Error loading consultations:', err);
      setError('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  }, [options.doctorId, options.dateRange, options.filters]);

  const refreshConsultations = useCallback(async () => {
    setRefreshing(true);
    await loadConsultations();
    setRefreshing(false);
  }, [loadConsultations]);

  const updateConsultationStatus = useCallback(async (consultationId: string, status: ConsultationStatus) => {
    try {
      const additionalData: any = {};
      
      if (status === 'in_progress') {
        additionalData.actualStartTime = new Date();
      } else if (status === 'completed') {
        additionalData.actualEndTime = new Date();
      }

      const response = await ConsultationService.updateConsultationStatus(
        consultationId,
        status,
        options.doctorId,
        additionalData
      );

      if (response.error) {
        toast.error(response.error.message);
        return;
      }

      // Update local state
      setConsultations(prev => 
        prev.map(c => 
          c.id === consultationId 
            ? { ...c, status, ...additionalData }
            : c
        )
      );

      toast.success(`Consultation ${status.replace('_', ' ')}`);
    } catch (err) {
      console.error('Error updating consultation status:', err);
      toast.error('Failed to update consultation status');
    }
  }, [options.doctorId]);

  const updateConsultation = useCallback(async (consultationId: string, data: Partial<Consultation>) => {
    try {
      const response = await ConsultationService.updateConsultation(
        consultationId,
        data,
        options.doctorId
      );

      if (response.error) {
        toast.error(response.error.message);
        return;
      }

      // Update local state
      setConsultations(prev => 
        prev.map(c => 
          c.id === consultationId 
            ? { ...c, ...response.data }
            : c
        )
      );

      toast.success('Consultation updated successfully');
    } catch (err) {
      console.error('Error updating consultation:', err);
      toast.error('Failed to update consultation');
    }
  }, [options.doctorId]);

  const searchConsultations = useCallback(async (searchTerm: string): Promise<ConsultationWithPatient[]> => {
    try {
      const response = await ConsultationService.searchConsultations(options.doctorId, searchTerm);
      
      if (response.error) {
        console.error('Search error:', response.error);
        return [];
      }

      return response.data || [];
    } catch (err) {
      console.error('Error searching consultations:', err);
      return [];
    }
  }, [options.doctorId]);

  const filterConsultations = useCallback((filters: { [key: string]: any }): ConsultationWithPatient[] => {
    return consultations.filter(consultation => {
      // Apply filters
      if (filters.status && consultation.status !== filters.status) {
        return false;
      }
      if (filters.type && consultation.type !== filters.type) {
        return false;
      }
      if (filters.priority && consultation.priority !== filters.priority) {
        return false;
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          consultation.reason?.toLowerCase().includes(term) ||
          consultation.chiefComplaint?.toLowerCase().includes(term) ||
          consultation.patient?.firstName?.toLowerCase().includes(term) ||
          consultation.patient?.lastName?.toLowerCase().includes(term) ||
          consultation.diagnosis?.some(d => d.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [consultations]);

  const subscribeToConsultations = useCallback((filters: { date?: Date; status?: ConsultationStatus[] }) => {
    return ConsultationService.subscribeToConsultations(
      options.doctorId,
      filters,
      (updatedConsultations) => {
        setConsultations(prev => {
          // Merge with existing consultations
          const existingIds = new Set(prev.map(c => c.id));
          const newConsultations = updatedConsultations.filter(c => !existingIds.has(c.id));
          
          return [
            ...prev.map(existing => {
              const updated = updatedConsultations.find(u => u.id === existing.id);
              return updated ? { ...existing, ...updated } : existing;
            }),
            ...newConsultations
          ];
        });
      }
    );
  }, [options.doctorId]);

  const getConsultationStats = useCallback(() => {
    const stats = {
      total: consultations.length,
      byStatus: {} as { [key in ConsultationStatus]: number },
      byType: {} as { [key in ConsultationType]: number },
      byPriority: {} as { [key in ConsultationPriority]: number }
    };

    // Initialize counters
    const statuses: ConsultationStatus[] = ['scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show', 'paused', 'follow_up_required'];
    const types: ConsultationType[] = ['general_consultation', 'follow_up', 'emergency', 'specialist_consultation', 'second_opinion', 'telemedicine', 'pre_operative', 'post_operative', 'medication_review', 'lab_review', 'routine_checkup'];
    const priorities: ConsultationPriority[] = ['low', 'medium', 'high', 'urgent', 'emergency'];

    statuses.forEach(status => stats.byStatus[status] = 0);
    types.forEach(type => stats.byType[type] = 0);
    priorities.forEach(priority => stats.byPriority[priority] = 0);

    // Count consultations
    consultations.forEach(consultation => {
      stats.byStatus[consultation.status]++;
      stats.byType[consultation.type]++;
      stats.byPriority[consultation.priority]++;
    });

    return stats;
  }, [consultations]);

  // Load consultations on mount
  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(() => {
        refreshConsultations();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, refreshConsultations]);

  return {
    consultations,
    loading,
    error,
    refreshing,
    
    // Actions
    loadConsultations,
    refreshConsultations,
    updateConsultationStatus,
    updateConsultation,
    
    // Filters
    searchConsultations,
    filterConsultations,
    
    // Real-time
    subscribeToConsultations,
    
    // Analytics
    getConsultationStats
  };
};

export default useConsultations;
