"use client";

import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { useState, useEffect } from 'react';
import { StaticDashboard } from '@/app/components/dashboard/static-dashboard';
import { UMIDPrompt } from '@/app/components/dashboard/umid-prompt';
import { DashboardService, UMIDService } from '@/lib/firestore/dashboard-services';
import { createDefaultDashboardLayout } from '@/app/utils/widgets';
import { createInitialUMID } from '@/app/utils/umid';
import type { WidgetConfig } from '@/app/utils/widgets';
import type { UniversalMedicalID } from '@/app/types';

interface DashboardLayout {
    id: string;
    patientId: string;
    name: string;
    widgets: WidgetConfig[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PatientDashboard() {
    const { user } = useAuth();
    const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout | null>(null);
    const [umid, setUmid] = useState<UniversalMedicalID | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showUMIDPrompt, setShowUMIDPrompt] = useState(false);

    // Load dashboard and UMID data
    useEffect(() => {
        if (!user) return;

        const loadDashboardData = async () => {
            try {
                // Load user's dashboard layouts
                const layouts = await DashboardService.getUserDashboardLayouts(user.id);
                let defaultLayout = layouts.find(l => l.isDefault);

                // Create default layout if none exists
                if (!defaultLayout) {
                    defaultLayout = createDefaultDashboardLayout(user.id);
                    await DashboardService.saveDashboardLayout(defaultLayout, user.id);
                }

                setDashboardLayout(defaultLayout);

                // Load UMID
                const userUMID = await UMIDService.getUMIDByPatientId(user.id);
                if (userUMID) {
                    setUmid(userUMID);
                } else {
                    // Show UMID creation prompt
                    setShowUMIDPrompt(true);
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    // Handle UMID creation
    const handleCreateUMID = async () => {
        if (!user) return;

        try {
            const newUMID = createInitialUMID(
                user.id, 
                user.email, 
                `${user.firstName} ${user.lastName}`
            );

            await UMIDService.saveUMID(newUMID as UniversalMedicalID, user.id);
            setUmid(newUMID as UniversalMedicalID);
            setShowUMIDPrompt(false);
        } catch (error) {
            console.error('Error creating UMID:', error);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={['patient']}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-zinc-950 dark:to-black flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                        <p className="text-muted-foreground">Loading your dashboard...</p>
                    </motion.div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['patient']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
                {showUMIDPrompt && (
                    <UMIDPrompt 
                        onCreateUMID={handleCreateUMID}
                        onDismiss={() => setShowUMIDPrompt(false)}
                    />
                )}
                
                {dashboardLayout && (
                    <StaticDashboard 
                        layout={dashboardLayout}
                        umid={umid}
                        onLayoutChange={(newLayout: DashboardLayout) => setDashboardLayout(newLayout)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}