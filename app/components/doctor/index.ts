/**
 * Consultation Module Index
 * Exports all consultation-related components and utilities
 */

// Main consultation components
export { default as ConsultationDashboard } from './consultation-dashboard';
export { default as ConsultationCard } from './consultation-card';
export { default as ConsultationQueue } from './consultation-queue';
export { default as ConsultationTimer } from './consultation-timer';
export { default as ConsultationStatusBadge } from './consultation-status';
export { default as ConsultationAnalytics } from './consultation-analytics';

// Virtual Waiting Room components
export { VirtualWaitingRoomPatientCard } from './virtual-waiting-room-patient-card';
export { VirtualWaitingRoomStats } from './virtual-waiting-room-stats';
export { VirtualWaitingRoomQueueControls } from './virtual-waiting-room-queue-controls';

// Re-export the hook
export { useConsultations } from '../../hooks/use-consultations';

// Re-export the service
export { ConsultationService } from '../../../lib/firestore/consultation-service';

// Re-export types
export type {
  Consultation,
  ConsultationStatus,
  ConsultationType,
  ConsultationPriority,
  ConsultationTemplate,
  ConsultationQueue as ConsultationQueueType,
  ConsultationAnalytics as ConsultationAnalyticsType
} from '../../types';

// Utility functions
export const ConsultationUtils = {
  /**
   * Format consultation duration
   */
  formatDuration: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  },

  /**
   * Get consultation status color
   */
  getStatusColor: (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
      case 'waiting':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'no_show':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'follow_up_required':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
    }
  },

  /**
   * Get priority color
   */
  getPriorityColor: (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
    }
  },

  /**
   * Calculate consultation time
   */
  calculateConsultationTime: (date: Date, startTime: string) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return new Date(`${dateStr}T${startTime}`);
  },

  /**
   * Check if consultation is overdue
   */
  isOverdue: (date: Date, startTime: string) => {
    const consultationTime = ConsultationUtils.calculateConsultationTime(date, startTime);
    return consultationTime < new Date();
  },

  /**
   * Get waiting time
   */
  getWaitingTime: (date: Date, startTime: string) => {
    const now = new Date();
    const consultationTime = ConsultationUtils.calculateConsultationTime(date, startTime);
    const diffMinutes = Math.floor((now.getTime() - consultationTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) {
      return `${Math.abs(diffMinutes)}m early`;
    } else if (diffMinutes === 0) {
      return 'On time';
    } else {
      return `${diffMinutes}m waiting`;
    }
  },

  /**
   * Sort consultations by priority and time
   */
  sortConsultations: (consultations: any[]) => {
    return consultations.sort((a, b) => {
      const priorityOrder: { [key: string]: number } = {
        'emergency': 0,
        'urgent': 1,
        'high': 2,
        'medium': 3,
        'low': 4
      };
      
      if (a.priority !== b.priority) {
        return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
      }
      
      // Compare by date first, then by start time
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If same date, compare by start time
      return a.startTime.localeCompare(b.startTime);
    });
  },

  /**
   * Filter consultations by date range
   */
  filterByDateRange: (consultations: any[], startDate: Date, endDate: Date) => {
    return consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate >= startDate && consultationDate <= endDate;
    });
  },

  /**
   * Group consultations by date
   */
  groupByDate: (consultations: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    consultations.forEach(consultation => {
      const dateKey = new Date(consultation.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(consultation);
    });
    
    return groups;
  },

  /**
   * Get consultation summary
   */
  getConsultationSummary: (consultations: any[]) => {
    const summary: { [key: string]: number } = {
      total: consultations.length,
      scheduled: 0,
      waiting: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      paused: 0,
      follow_up_required: 0
    };

    consultations.forEach(consultation => {
      if (consultation.status in summary) {
        summary[consultation.status]++;
      }
    });

    return summary;
  }
};
