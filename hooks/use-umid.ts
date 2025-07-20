/**
 * HealthSphere - UMID Hook
 * Custom hook for managing Universal Medical ID data
 */

import { useState, useEffect, useCallback } from 'react';
import { UMIDService, UMIDQueryService } from '@/lib/firestore/umid-services';
import { UniversalMedicalID, UMIDAccessLog, LinkedMedicalData, UMIDSecuritySettings, UserRole } from '@/app/types';
import { useAuth } from '@/app/contexts/auth-context';
import toast from 'react-hot-toast';

interface UMIDStats {
    totalUMIDs: number;
    activeUMIDs: number;
    recentAccesses: number;
    securityAlerts: number;
}

interface UseUMIDReturn {
    umids: UniversalMedicalID[];
    accessLogs: UMIDAccessLog[];
    stats: UMIDStats;
    isLoading: boolean;
    error: string | null;
    generateUMID: (linkedMedicalData: LinkedMedicalData, securitySettings?: Partial<UMIDSecuritySettings>) => Promise<UniversalMedicalID | null>;
    updateUMID: (umidId: string, updates: Partial<UniversalMedicalID>) => Promise<boolean>;
    deactivateUMID: (umidId: string) => Promise<boolean>;
    refreshData: () => Promise<void>;
    getAccessHistory: (umidId: string) => Promise<UMIDAccessLog[]>;
}

export function useUMID(): UseUMIDReturn {
    const { user } = useAuth();
    const [umids, setUmids] = useState<UniversalMedicalID[]>([]);
    const [accessLogs, setAccessLogs] = useState<UMIDAccessLog[]>([]);
    const [stats, setStats] = useState<UMIDStats>({
        totalUMIDs: 0,
        activeUMIDs: 0,
        recentAccesses: 0,
        securityAlerts: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load UMID data based on user role
    const loadData = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            let userUMIDs: UniversalMedicalID[] = [];

            if (user.role === 'patient') {
                // Patients can only see their own UMIDs
                userUMIDs = await UMIDQueryService.getPatientUMIDs(user.id);
            } else if (['admin', 'hospital_management'].includes(user.role)) {
                // Admin and hospital management can see all UMIDs
                const { umids: allUMIDs } = await UMIDQueryService.getAllUMIDs({ isActive: undefined });
                userUMIDs = allUMIDs;
            } else if (['doctor', 'nurse', 'lab_technician'].includes(user.role)) {
                // Healthcare providers can search for UMIDs - for now just get empty array
                // In a real implementation, this could show recently accessed UMIDs
                userUMIDs = [];
            }

            setUmids(userUMIDs);

            // Calculate stats
            const activeUMIDs = userUMIDs.filter(umid => umid.isActive);
            const recentAccesses = userUMIDs.reduce((count, umid) => {
                const recentAccessCount = umid.accessHistory.filter(log => {
                    const logDate = new Date(log.accessTime);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return logDate > sevenDaysAgo;
                }).length;
                return count + recentAccessCount;
            }, 0);

            setStats({
                totalUMIDs: userUMIDs.length,
                activeUMIDs: activeUMIDs.length,
                recentAccesses,
                securityAlerts: 0 // TODO: Implement security alert detection
            });

        } catch (err) {
            console.error('Error loading UMID data:', err);
            setError('Failed to load UMID data. Please try again.');
            toast.error('Failed to load UMID data');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Generate new UMID
    const generateUMID = async (
        linkedMedicalData: LinkedMedicalData, 
        securitySettings?: Partial<UMIDSecuritySettings>
    ): Promise<UniversalMedicalID | null> => {
        if (!user || user.role !== 'patient') {
            toast.error('Only patients can generate UMIDs for themselves');
            return null;
        }

        try {
            setIsLoading(true);
            const newUMID = await UMIDService.generateUMID(user.id, linkedMedicalData, securitySettings);
            
            // Refresh data to include the new UMID
            await loadData();
            
            toast.success('UMID generated successfully!');
            return newUMID;
        } catch (err) {
            console.error('Error generating UMID:', err);
            setError('Failed to generate UMID. Please try again.');
            toast.error('Failed to generate UMID');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Update existing UMID
    const updateUMID = async (umidId: string, updates: Partial<UniversalMedicalID>): Promise<boolean> => {
        if (!user) return false;

        try {
            // Use updateLinkedMedicalData for medical data updates
            if (updates.linkedMedicalData) {
                await UMIDService.updateLinkedMedicalData(umidId, updates.linkedMedicalData);
            }
            
            await loadData(); // Refresh data
            toast.success('UMID updated successfully!');
            return true;
        } catch (err) {
            console.error('Error updating UMID:', err);
            toast.error('Failed to update UMID');
            return false;
        }
    };

    // Deactivate UMID
    const deactivateUMID = async (umidId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            await UMIDService.deactivateUMID(umidId);
            await loadData(); // Refresh data
            toast.success('UMID deactivated successfully!');
            return true;
        } catch (err) {
            console.error('Error deactivating UMID:', err);
            toast.error('Failed to deactivate UMID');
            return false;
        }
    };

    // Get access history for a specific UMID
    const getAccessHistory = async (umidId: string): Promise<UMIDAccessLog[]> => {
        try {
            // Use getAccessLogs method with correct signature
            const result = await UMIDService.getAccessLogs(umidId, 50);
            return result.logs;
        } catch (err) {
            console.error('Error fetching access history:', err);
            toast.error('Failed to load access history');
            return [];
        }
    };

    // Refresh data
    const refreshData = useCallback(async () => {
        await loadData();
    }, [loadData]);

    // Initial data load
    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, loadData]);

    return {
        umids,
        accessLogs,
        stats,
        isLoading,
        error,
        generateUMID,
        updateUMID,
        deactivateUMID,
        refreshData,
        getAccessHistory
    };
}
