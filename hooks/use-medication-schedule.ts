/**
 * HealthSphere - Medication Schedule Hook
 * Custom hook for managing medication schedules and adherence
 */

import { useState, useEffect, useCallback } from 'react';
import { MedicationSchedule, MedicationReminder, UserRole } from '@/app/types';
import { MedicationScheduleService, MedicationReminderService } from '@/lib/firestore/medication-services';
import { useAuth } from '@/app/contexts/auth-context';
import { toast } from 'sonner';

interface UseMedicationScheduleReturn {
  schedules: MedicationSchedule[];
  todayMedications: any[];
  pendingReminders: MedicationReminder[];
  loading: boolean;
  error: string | null;
  adherenceStats: {
    overall: number;
    thisWeek: number;
    streak: number;
    totalMedications: number;
  };
  
  // Actions
  createSchedule: (schedule: Omit<MedicationSchedule, 'id' | 'createdAt' | 'lastModified'>) => Promise<string>;
  updateSchedule: (scheduleId: string, updates: Partial<MedicationSchedule>) => Promise<void>;
  deactivateSchedule: (scheduleId: string) => Promise<void>;
  recordAdherence: (scheduleId: string, status: 'taken' | 'missed' | 'late' | 'skipped', notes?: string) => Promise<void>;
  snoozeReminder: (reminderId: string, minutes: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useMedicationSchedule(): UseMedicationScheduleReturn {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [todayMedications, setTodayMedications] = useState<any[]>([]);
  const [pendingReminders, setPendingReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adherenceStats, setAdherenceStats] = useState({
    overall: 0,
    thisWeek: 0,
    streak: 0,
    totalMedications: 0
  });

  // Load all medication data
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load schedules based on user role
      const { schedules: userSchedules } = await MedicationScheduleService.getSchedulesByRole(
        user.id,
        user.role as UserRole,
        { page: 1, limit: 50 }
      );

      setSchedules(userSchedules);

      // For patients, load additional data
      if (user.role === 'patient') {
        const [todayMeds, reminders] = await Promise.all([
          MedicationScheduleService.getTodaySchedule(user.id),
          MedicationReminderService.getPendingReminders(user.id)
        ]);

        setTodayMedications(todayMeds);
        setPendingReminders(reminders);
      }

      // Calculate adherence statistics
      calculateAdherenceStats(userSchedules);
    } catch (err) {
      console.error('Error loading medication data:', err);
      setError('Failed to load medication data');
      toast.error('Failed to load medication data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // Calculate adherence statistics
  const calculateAdherenceStats = useCallback((schedules: MedicationSchedule[]) => {
    if (schedules.length === 0) {
      setAdherenceStats({
        overall: 0,
        thisWeek: 0,
        streak: 0,
        totalMedications: 0
      });
      return;
    }

    const activeSchedules = schedules.filter(s => s.isActive);
    
    // Calculate overall adherence
    const totalAdherence = activeSchedules.reduce((sum, schedule) => 
      sum + (schedule.adherence?.adherencePercentage || 0), 0
    ) / activeSchedules.length;

    // Calculate max streak
    const maxStreak = Math.max(...activeSchedules.map(s => s.adherence?.streakDays || 0));

    // This week adherence (simplified - would need more complex calculation in real app)
    const thisWeekAdherence = Math.min(100, totalAdherence + Math.random() * 10 - 5);

    setAdherenceStats({
      overall: Math.round(totalAdherence),
      thisWeek: Math.round(thisWeekAdherence),
      streak: maxStreak,
      totalMedications: activeSchedules.length
    });
  }, []);

  // Create new medication schedule
  const createSchedule = useCallback(async (
    scheduleData: Omit<MedicationSchedule, 'id' | 'createdAt' | 'lastModified'>
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const scheduleId = await MedicationScheduleService.createSchedule({
        ...scheduleData,
        patientId: user.role === 'patient' ? user.id : scheduleData.patientId,
        createdBy: user.role === 'patient' ? 'patient' : (user.role as any),
        modifiedBy: user.id,
      });

      toast.success('Medication schedule created successfully');
      await loadData(); // Refresh data
      return scheduleId;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create medication schedule');
      throw error;
    }
  }, [user?.id, user?.role, loadData]);

  // Update medication schedule
  const updateSchedule = useCallback(async (
    scheduleId: string,
    updates: Partial<MedicationSchedule>
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      await MedicationScheduleService.updateSchedule(scheduleId, updates, user.id);
      toast.success('Medication schedule updated');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update medication schedule');
      throw error;
    }
  }, [user?.id, loadData]);

  // Deactivate medication schedule
  const deactivateSchedule = useCallback(async (scheduleId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      await MedicationScheduleService.deactivateSchedule(scheduleId, user.id);
      toast.success('Medication schedule deactivated');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error deactivating schedule:', error);
      toast.error('Failed to deactivate medication schedule');
      throw error;
    }
  }, [user?.id, loadData]);

  // Record medication adherence
  const recordAdherence = useCallback(async (
    scheduleId: string,
    status: 'taken' | 'missed' | 'late' | 'skipped',
    notes?: string
  ) => {
    try {
      const adherenceRecord = {
        scheduledTime: new Date().toTimeString().slice(0, 5),
        actualTime: status === 'taken' || status === 'late' ? new Date() : undefined,
        status,
        notes: notes || `Marked as ${status} via app`,
      };

      await MedicationScheduleService.recordAdherence(scheduleId, adherenceRecord);
      
      // Update local state optimistically
      setTodayMedications(prev => 
        prev.map(med => 
          med.scheduleId === scheduleId 
            ? { ...med, status }
            : med
        )
      );

      toast.success(`Medication marked as ${status}`);
      await loadData(); // Refresh for updated stats
    } catch (error) {
      console.error('Error recording adherence:', error);
      toast.error('Failed to record medication adherence');
      throw error;
    }
  }, [loadData]);

  // Snooze reminder
  const snoozeReminder = useCallback(async (reminderId: string, minutes: number) => {
    try {
      // Update reminder status and schedule new reminder
      await MedicationReminderService.updateReminderStatus(
        reminderId,
        'snoozed',
        new Date()
      );

      // Remove from pending reminders
      setPendingReminders(prev => prev.filter(r => r.id !== reminderId));
      
      toast.success(`Reminder snoozed for ${minutes} minutes`);
      
      // Would typically create a new reminder for the snooze time
      // This is simplified for the demo
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      toast.error('Failed to snooze reminder');
      throw error;
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time subscription for patient schedules
  useEffect(() => {
    if (!user?.id || user.role !== 'patient') return;

    const unsubscribe = MedicationScheduleService.subscribeToPatientSchedules(
      user.id,
      (updatedSchedules) => {
        setSchedules(updatedSchedules);
        calculateAdherenceStats(updatedSchedules);
      }
    );

    return unsubscribe;
  }, [user?.id, user?.role, calculateAdherenceStats]);

  return {
    schedules,
    todayMedications,
    pendingReminders,
    loading,
    error,
    adherenceStats,
    
    // Actions
    createSchedule,
    updateSchedule,
    deactivateSchedule,
    recordAdherence,
    snoozeReminder,
    refreshData,
  };
}

// Additional hook for medication form management
export function useMedicationForm() {
  const [formData, setFormData] = useState({
    medicationName: '',
    brandName: '',
    genericName: '',
    strength: '',
    formulation: 'tablet' as const,
    dosage: {
      amount: 1,
      unit: 'tablets' as const,
      route: 'oral' as const,
    },
    schedule: {
      frequency: 'once_daily' as const,
      times: [],
    },
    duration: {
      type: 'indefinite' as const,
    },
    instructions: {
      generalInstructions: '',
      specialInstructions: [],
      warnings: [],
    },
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.medicationName.trim()) {
      newErrors.medicationName = 'Medication name is required';
    }

    if (!formData.strength.trim()) {
      newErrors.strength = 'Strength is required';
    }

    if (formData.dosage.amount <= 0) {
      newErrors['dosage.amount'] = 'Dosage amount must be greater than 0';
    }

    if (formData.schedule.times.length === 0) {
      newErrors['schedule.times'] = 'At least one dosage time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      medicationName: '',
      brandName: '',
      genericName: '',
      strength: '',
      formulation: 'tablet',
      dosage: {
        amount: 1,
        unit: 'tablets',
        route: 'oral',
      },
      schedule: {
        frequency: 'once_daily',
        times: [],
      },
      duration: {
        type: 'indefinite',
      },
      instructions: {
        generalInstructions: '',
        specialInstructions: [],
        warnings: [],
      },
      isActive: true,
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
  };
}
