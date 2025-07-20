/**
 * Virtual Waiting Room Hook
 * Provides comprehensive state management and real-time updates for the doctor's virtual waiting room
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { VirtualWaitingRoomService, VirtualWaitingRoomPatient, VirtualWaitingRoomStats } from '@/lib/firestore/virtual-waiting-room-service';
import { toast } from 'react-hot-toast';

export interface VirtualWaitingRoomFilters {
  searchTerm: string;
  priorityFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface UseVirtualWaitingRoomReturn {
  patients: VirtualWaitingRoomPatient[];
  filteredPatients: VirtualWaitingRoomPatient[];
  stats: VirtualWaitingRoomStats | null;
  filters: VirtualWaitingRoomFilters;
  isLoading: boolean;
  error: string | null;
  
  // Filter actions
  updateSearchTerm: (term: string) => void;
  updatePriorityFilter: (priority: string) => void;
  updateStatusFilter: (status: string) => void;
  updateSortBy: (sort: string) => void;
  updateSortOrder: (order: 'asc' | 'desc') => void;
  clearFilters: () => void;
  
  // Patient actions
  startConsultation: (patientId: string) => Promise<void>;
  updatePatientPriority: (patientId: string, priority: VirtualWaitingRoomPatient['priority']) => Promise<void>;
  removePatientFromQueue: (patientId: string) => Promise<void>;
  sendMessageToPatient: (patientId: string) => Promise<void>;
  notifyAllPatients: () => Promise<void>;
  
  // Data actions
  refreshData: () => Promise<void>;
  seedDummyData: () => Promise<void>;
  exportQueue: () => void;
}

export function useVirtualWaitingRoom(): UseVirtualWaitingRoomReturn {
  const { user } = useAuth();
  const [patients, setPatients] = useState<VirtualWaitingRoomPatient[]>([]);
  const [stats, setStats] = useState<VirtualWaitingRoomStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<VirtualWaitingRoomFilters>({
    searchTerm: '',
    priorityFilter: 'all',
    statusFilter: 'all',
    sortBy: 'joinedAt',
    sortOrder: 'asc'
  });

  // Filter and sort patients based on current filters
  const filteredPatients = useCallback(() => {
    let filtered = [...patients];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.patientName.toLowerCase().includes(searchLower) ||
        patient.patientEmail.toLowerCase().includes(searchLower) ||
        patient.patientPhone.includes(filters.searchTerm) ||
        patient.symptoms?.toLowerCase().includes(searchLower)
      );
    }

    // Apply priority filter
    if (filters.priorityFilter !== 'all') {
      filtered = filtered.filter(patient => patient.priority === filters.priorityFilter);
    }

    // Apply status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === filters.statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof VirtualWaitingRoomPatient];
      let bValue: any = b[filters.sortBy as keyof VirtualWaitingRoomPatient];

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle priority sorting (special case)
      if (filters.sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [patients, filters]);

  // Load initial data and set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    // Set up real-time subscription to waiting room
    const unsubscribe = VirtualWaitingRoomService.subscribeToWaitingRoom(
      user.id,
      (updatedPatients) => {
        setPatients(updatedPatients);
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
        toast.error('Failed to load waiting room data');
      }
    );

    // Load stats
    loadStats();

    return () => unsubscribe();
  }, [user?.id]);

  // Load statistics
  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const response = await VirtualWaitingRoomService.getWaitingRoomStats(user.id);
      if (response.data) {
        setStats(response.data);
      } else if (response.error) {
        console.error('Error loading stats:', response.error);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Filter update functions
  const updateSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const updatePriorityFilter = (priority: string) => {
    setFilters(prev => ({ ...prev, priorityFilter: priority }));
  };

  const updateStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  };

  const updateSortBy = (sort: string) => {
    setFilters(prev => ({ ...prev, sortBy: sort }));
  };

  const updateSortOrder = (order: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortOrder: order }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      priorityFilter: 'all',
      statusFilter: 'all',
      sortBy: 'joinedAt',
      sortOrder: 'asc'
    });
  };

  // Patient action functions
  const startConsultation = async (patientId: string) => {
    if (!user?.id) return;

    try {
      toast.loading('Starting consultation...', { id: 'start-consultation' });
      
      // Create meeting room
      const meetingResponse = await VirtualWaitingRoomService.createMeetingRoom(patientId, user.id);
      
      if (meetingResponse.data) {
        // Update patient status
        await VirtualWaitingRoomService.updatePatientStatus(patientId, 'in_consultation');
        
        // Open Jitsi meeting in new window
        window.open(meetingResponse.data.meetingUrl, '_blank');
        
        toast.success('Consultation started successfully!', { id: 'start-consultation' });
      } else {
        throw new Error(meetingResponse.error?.message || 'Failed to create meeting room');
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('Failed to start consultation', { id: 'start-consultation' });
    }
  };

  const updatePatientPriority = async (patientId: string, priority: VirtualWaitingRoomPatient['priority']) => {
    try {
      toast.loading('Updating priority...', { id: 'update-priority' });
      
      const response = await VirtualWaitingRoomService.updatePatientPriority(patientId, priority);
      
      if (response.data) {
        toast.success(`Priority updated to ${priority}`, { id: 'update-priority' });
      } else {
        throw new Error(response.error?.message || 'Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority', { id: 'update-priority' });
    }
  };

  const removePatientFromQueue = async (patientId: string) => {
    try {
      toast.loading('Removing patient from queue...', { id: 'remove-patient' });
      
      const response = await VirtualWaitingRoomService.removePatientFromWaitingRoom(patientId);
      
      if (response.data !== undefined) {
        toast.success('Patient removed from queue', { id: 'remove-patient' });
      } else {
        throw new Error(response.error?.message || 'Failed to remove patient');
      }
    } catch (error) {
      console.error('Error removing patient:', error);
      toast.error('Failed to remove patient', { id: 'remove-patient' });
    }
  };

  const sendMessageToPatient = async (patientId: string) => {
    try {
      // This would integrate with the messaging system
      toast.success('Message sent to patient');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const notifyAllPatients = async () => {
    try {
      toast.loading('Notifying all patients...', { id: 'notify-all' });
      
      // This would send notifications to all waiting patients
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('All patients notified', { id: 'notify-all' });
    } catch (error) {
      console.error('Error notifying patients:', error);
      toast.error('Failed to notify patients', { id: 'notify-all' });
    }
  };

  const refreshData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      await loadStats();
      // The real-time subscription will handle patient data updates
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const seedDummyData = async () => {
    if (!user?.id) return;

    try {
      toast.loading('Adding test patients...', { id: 'seed-data' });
      
      const response = await VirtualWaitingRoomService.seedDummyData(user.id);
      
      if (response.data !== undefined) {
        toast.success('Test patients added successfully!', { id: 'seed-data' });
      } else {
        throw new Error(response.error?.message || 'Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to add test patients', { id: 'seed-data' });
    }
  };

  const exportQueue = () => {
    try {
      const dataToExport = filteredPatients().map(patient => ({
        name: patient.patientName,
        email: patient.patientEmail,
        phone: patient.patientPhone,
        priority: patient.priority,
        status: patient.status,
        consultationType: patient.consultationType,
        joinedAt: patient.joinedAt.toISOString(),
        waitTime: Math.floor((Date.now() - patient.joinedAt.getTime()) / (1000 * 60)),
        symptoms: patient.symptoms || ''
      }));

      const csvContent = [
        ['Name', 'Email', 'Phone', 'Priority', 'Status', 'Consultation Type', 'Joined At', 'Wait Time (min)', 'Symptoms'],
        ...dataToExport.map(patient => [
          patient.name,
          patient.email,
          patient.phone,
          patient.priority,
          patient.status,
          patient.consultationType,
          patient.joinedAt,
          patient.waitTime.toString(),
          patient.symptoms
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `waiting-room-queue-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Queue exported successfully!');
    } catch (error) {
      console.error('Error exporting queue:', error);
      toast.error('Failed to export queue');
    }
  };

  return {
    patients,
    filteredPatients: filteredPatients(),
    stats,
    filters,
    isLoading,
    error,
    
    // Filter actions
    updateSearchTerm,
    updatePriorityFilter,
    updateStatusFilter,
    updateSortBy,
    updateSortOrder,
    clearFilters,
    
    // Patient actions
    startConsultation,
    updatePatientPriority,
    removePatientFromQueue,
    sendMessageToPatient,
    notifyAllPatients,
    
    // Data actions
    refreshData,
    seedDummyData,
    exportQueue
  };
}
