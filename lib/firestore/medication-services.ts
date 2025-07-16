/**
 * HealthSphere - Medication Services
 * Firestore service layer for medication schedule management
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
  Timestamp,
  writeBatch,
  onSnapshot,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
  MedicationSchedule, 
  MedicationReminder, 
  AdherenceRecord, 
  MedicationAdherence,
  PaginationParams,
  UserRole 
} from '@/app/types';

// Collection references
const MEDICATION_SCHEDULES = 'medicationSchedules';
const MEDICATION_REMINDERS = 'medicationReminders';
const ADHERENCE_RECORDS = 'adherenceRecords';
const MEDICATION_ANALYTICS = 'medicationAnalytics';

/**
 * Service class for managing medication schedules
 */
export class MedicationScheduleService {
  /**
   * Create a new medication schedule
   */
  static async createSchedule(
    schedule: Omit<MedicationSchedule, 'id' | 'createdAt' | 'lastModified'>
  ): Promise<string> {
    try {
      const scheduleData = {
        ...schedule,
        createdAt: Timestamp.now(),
        lastModified: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, MEDICATION_SCHEDULES), scheduleData);
      
      // Initialize adherence tracking
      await this.initializeAdherence(docRef.id, schedule.patientId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating medication schedule:', error);
      throw new Error('Failed to create medication schedule');
    }
  }

  /**
   * Get medication schedules for a patient
   */
  static async getPatientSchedules(
    patientId: string,
    includeInactive: boolean = false
  ): Promise<MedicationSchedule[]> {
    try {
      let q = query(
        collection(db, MEDICATION_SCHEDULES),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastModified: doc.data().lastModified?.toDate(),
      })) as MedicationSchedule[];
    } catch (error) {
      console.error('Error fetching patient schedules:', error);
      throw new Error('Failed to fetch medication schedules');
    }
  }

  /**
   * Get schedules by role and permissions
   */
  static async getSchedulesByRole(
    userId: string,
    userRole: UserRole,
    pagination?: PaginationParams
  ): Promise<{ schedules: MedicationSchedule[]; hasMore: boolean }> {
    try {
      let baseQuery = collection(db, MEDICATION_SCHEDULES);
      let queryConstraints: any[] = [];

      // Role-based access control
      switch (userRole) {
        case 'patient':
          queryConstraints.push(where('patientId', '==', userId));
          break;
        case 'doctor':
          queryConstraints.push(where('createdBy', '==', 'doctor'));
          // Additional filtering by assigned patients can be added
          break;
        case 'nurse':
        case 'pharmacist':
          // Can view all active schedules for care coordination
          queryConstraints.push(where('isActive', '==', true));
          break;
        case 'admin':
        case 'hospital_management':
          // Full access - no additional constraints
          break;
        default:
          queryConstraints.push(where('patientId', '==', userId));
      }

      queryConstraints.push(orderBy('lastModified', 'desc'));

      if (pagination?.limit) {
        queryConstraints.push(limit(pagination.limit + 1)); // +1 to check if there are more
      }

      const q = query(baseQuery, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const schedules = snapshot.docs.slice(0, pagination?.limit || snapshot.docs.length).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastModified: doc.data().lastModified?.toDate(),
      })) as MedicationSchedule[];

      const hasMore = pagination?.limit ? snapshot.docs.length > pagination.limit : false;

      return { schedules, hasMore };
    } catch (error) {
      console.error('Error fetching schedules by role:', error);
      throw new Error('Failed to fetch medication schedules');
    }
  }

  /**
   * Update medication schedule
   */
  static async updateSchedule(
    scheduleId: string,
    updates: Partial<MedicationSchedule>,
    userId: string
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        lastModified: Timestamp.now(),
        modifiedBy: userId,
      };

      await updateDoc(doc(db, MEDICATION_SCHEDULES, scheduleId), updateData);
    } catch (error) {
      console.error('Error updating medication schedule:', error);
      throw new Error('Failed to update medication schedule');
    }
  }

  /**
   * Delete/deactivate medication schedule
   */
  static async deactivateSchedule(scheduleId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, MEDICATION_SCHEDULES, scheduleId), {
        isActive: false,
        lastModified: Timestamp.now(),
        modifiedBy: userId,
      });
    } catch (error) {
      console.error('Error deactivating medication schedule:', error);
      throw new Error('Failed to deactivate medication schedule');
    }
  }

  /**
   * Initialize adherence tracking for a new schedule
   */
  private static async initializeAdherence(
    scheduleId: string,
    patientId: string
  ): Promise<void> {
    try {
      const adherenceData: MedicationAdherence = {
        totalDoses: 0,
        takenDoses: 0,
        missedDoses: 0,
        lateCount: 0,
        adherencePercentage: 100,
        adherenceHistory: [],
        adherenceGoal: 90,
        streakDays: 0,
        longestStreak: 0,
        improvementTrend: 'stable',
      };

      await updateDoc(doc(db, MEDICATION_SCHEDULES, scheduleId), {
        adherence: adherenceData,
      });
    } catch (error) {
      console.error('Error initializing adherence:', error);
      throw error;
    }
  }

  /**
   * Record medication adherence
   */
  static async recordAdherence(
    scheduleId: string,
    adherenceRecord: Omit<AdherenceRecord, 'date'> & { date?: Date }
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Add adherence record
      const recordData = {
        scheduleId,
        patientId: '', // Will be set from schedule
        ...adherenceRecord,
        date: adherenceRecord.date ? Timestamp.fromDate(adherenceRecord.date) : Timestamp.now(),
      };

      const recordRef = doc(collection(db, ADHERENCE_RECORDS));
      batch.set(recordRef, recordData);

      // Update schedule adherence statistics
      const scheduleRef = doc(db, MEDICATION_SCHEDULES, scheduleId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (scheduleDoc.exists()) {
        const schedule = scheduleDoc.data() as MedicationSchedule;
        const updatedAdherence = this.calculateUpdatedAdherence(
          schedule.adherence,
          adherenceRecord
        );

        batch.update(scheduleRef, { 
          adherence: updatedAdherence,
          lastModified: Timestamp.now(),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error recording adherence:', error);
      throw new Error('Failed to record medication adherence');
    }
  }

  /**
   * Calculate updated adherence statistics
   */
  private static calculateUpdatedAdherence(
    currentAdherence: MedicationAdherence,
    newRecord: Omit<AdherenceRecord, 'date'>
  ): MedicationAdherence {
    const totalDoses = currentAdherence.totalDoses + 1;
    const takenDoses = newRecord.status === 'taken' || newRecord.status === 'late' 
      ? currentAdherence.takenDoses + 1 
      : currentAdherence.takenDoses;
    const missedDoses = newRecord.status === 'missed' || newRecord.status === 'skipped'
      ? currentAdherence.missedDoses + 1 
      : currentAdherence.missedDoses;
    const lateCount = newRecord.status === 'late' 
      ? currentAdherence.lateCount + 1 
      : currentAdherence.lateCount;
    
    const adherencePercentage = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 100;
    
    // Update streak
    let streakDays = currentAdherence.streakDays;
    if (newRecord.status === 'taken') {
      streakDays += 1;
    } else if (newRecord.status === 'missed' || newRecord.status === 'skipped') {
      streakDays = 0;
    }
    
    const longestStreak = Math.max(currentAdherence.longestStreak, streakDays);
    
    // Calculate trend (simplified)
    const recentPercentage = adherencePercentage;
    const previousPercentage = currentAdherence.adherencePercentage;
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recentPercentage > previousPercentage + 5) {
      improvementTrend = 'improving';
    } else if (recentPercentage < previousPercentage - 5) {
      improvementTrend = 'declining';
    }

    return {
      totalDoses,
      takenDoses,
      missedDoses,
      lateCount,
      adherencePercentage,
      adherenceHistory: [
        ...currentAdherence.adherenceHistory,
        { ...newRecord, date: new Date() }
      ].slice(-30), // Keep last 30 records
      adherenceGoal: currentAdherence.adherenceGoal,
      streakDays,
      longestStreak,
      lastMissedDate: newRecord.status === 'missed' ? new Date() : currentAdherence.lastMissedDate,
      improvementTrend,
    };
  }

  /**
   * Get adherence analytics for a patient
   */
  static async getAdherenceAnalytics(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      // Implementation for comprehensive analytics
      // This would typically involve complex aggregations
      // For now, return a placeholder structure
      return {
        overallAdherence: 0,
        medicationBreakdown: [],
        improvementAreas: [],
        achievements: [],
      };
    } catch (error) {
      console.error('Error fetching adherence analytics:', error);
      throw new Error('Failed to fetch adherence analytics');
    }
  }

  /**
   * Real-time subscription to patient schedules
   */
  static subscribeToPatientSchedules(
    patientId: string,
    callback: (schedules: MedicationSchedule[]) => void
  ): () => void {
    const q = query(
      collection(db, MEDICATION_SCHEDULES),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastModified: doc.data().lastModified?.toDate(),
      })) as MedicationSchedule[];
      
      callback(schedules);
    });
  }

  /**
   * Get today's medication schedule for a patient
   */
  static async getTodaySchedule(patientId: string): Promise<any[]> {
    try {
      const schedules = await this.getPatientSchedules(patientId);
      const today = new Date();
      
      // Process schedules to generate today's medication times
      const todaySchedule = schedules.flatMap(schedule => {
        if (!schedule.isActive) return [];
        
        return schedule.schedule.times.map(time => ({
          id: `${schedule.id}-${time.time}`,
          scheduleId: schedule.id,
          medicationName: schedule.medicationName,
          dosage: schedule.dosage,
          time: time.time,
          label: time.label,
          mealRelation: time.mealRelation,
          status: 'pending', // This would be fetched from adherence records
          instructions: schedule.instructions.generalInstructions,
        }));
      });

      return todaySchedule.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      throw new Error('Failed to fetch today\'s medication schedule');
    }
  }
}

/**
 * Reminder service for medication notifications
 */
export class MedicationReminderService {
  /**
   * Create medication reminders for a schedule
   */
  static async createReminders(
    scheduleId: string,
    reminderData: Omit<MedicationReminder, 'id' | 'scheduleId'>[]
  ): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const reminderIds: string[] = [];

      reminderData.forEach(reminder => {
        const reminderRef = doc(collection(db, MEDICATION_REMINDERS));
        batch.set(reminderRef, {
          ...reminder,
          scheduleId,
          scheduledTime: Timestamp.fromDate(reminder.scheduledTime),
          deliveryAttempts: [],
        });
        reminderIds.push(reminderRef.id);
      });

      await batch.commit();
      return reminderIds;
    } catch (error) {
      console.error('Error creating reminders:', error);
      throw new Error('Failed to create medication reminders');
    }
  }

  /**
   * Get pending reminders for a patient
   */
  static async getPendingReminders(patientId: string): Promise<MedicationReminder[]> {
    try {
      // First get patient's schedules
      const schedules = await MedicationScheduleService.getPatientSchedules(patientId);
      const scheduleIds = schedules.map(s => s.id);

      if (scheduleIds.length === 0) return [];

      // Get pending reminders for these schedules
      const reminders: MedicationReminder[] = [];
      
      for (const scheduleId of scheduleIds) {
        const q = query(
          collection(db, MEDICATION_REMINDERS),
          where('scheduleId', '==', scheduleId),
          where('status', '==', 'pending'),
          orderBy('scheduledTime', 'asc')
        );

        const snapshot = await getDocs(q);
        const scheduleReminders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate(),
          actualTime: doc.data().actualTime?.toDate(),
        })) as MedicationReminder[];

        reminders.push(...scheduleReminders);
      }

      return reminders.sort((a, b) => 
        a.scheduledTime.getTime() - b.scheduledTime.getTime()
      );
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
      throw new Error('Failed to fetch pending reminders');
    }
  }

  /**
   * Update reminder status
   */
  static async updateReminderStatus(
    reminderId: string,
    status: MedicationReminder['status'],
    responseTime?: Date
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        actualTime: responseTime ? Timestamp.fromDate(responseTime) : Timestamp.now(),
      };

      await updateDoc(doc(db, MEDICATION_REMINDERS, reminderId), updateData);
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw new Error('Failed to update reminder status');
    }
  }
}

/**
 * Utility functions for medication management
 */
export class MedicationUtils {
  /**
   * Validate medication schedule data
   */
  static validateSchedule(schedule: Partial<MedicationSchedule>): string[] {
    const errors: string[] = [];

    if (!schedule.medicationName?.trim()) {
      errors.push('Medication name is required');
    }

    if (!schedule.dosage?.amount || schedule.dosage.amount <= 0) {
      errors.push('Valid dosage amount is required');
    }

    if (!schedule.schedule?.times?.length) {
      errors.push('At least one dosage time is required');
    }

    if (!schedule.duration?.type) {
      errors.push('Duration type is required');
    }

    return errors;
  }

  /**
   * Generate medication times based on frequency
   */
  static generateMedicationTimes(frequency: string, customTimes?: string[]): any[] {
    const times: any[] = [];

    switch (frequency) {
      case 'once_daily':
        times.push({ time: '08:00', label: 'Morning' });
        break;
      case 'twice_daily':
        times.push(
          { time: '08:00', label: 'Morning' },
          { time: '20:00', label: 'Evening' }
        );
        break;
      case 'three_times_daily':
        times.push(
          { time: '08:00', label: 'Morning' },
          { time: '14:00', label: 'Afternoon' },
          { time: '20:00', label: 'Evening' }
        );
        break;
      case 'four_times_daily':
        times.push(
          { time: '08:00', label: 'Morning' },
          { time: '12:00', label: 'Noon' },
          { time: '16:00', label: 'Afternoon' },
          { time: '20:00', label: 'Evening' }
        );
        break;
      case 'custom':
        if (customTimes) {
          times.push(...customTimes.map((time, index) => ({
            time,
            label: `Dose ${index + 1}`,
          })));
        }
        break;
    }

    return times;
  }
}
