// filepath: c:\Users\Randeepa\Documents\GitHub\HealthSphere\app\components/auth/protected-route.tsx
"use client";

import { useAuth } from '@/app/contexts/auth-context';
import { UserRole } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

export function ProtectedRoute({ 
    children, 
    allowedRoles, 
    redirectTo = '/login' 
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(redirectTo);
                return;
            }

            if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // Redirect to appropriate dashboard based on user role
                const dashboardRoutes: Record<UserRole, string> = {
                    patient: '/dashboard',
                    doctor: '/doctor',
                    nurse: '/nurse',
                    admin: '/admin',
                    receptionist: '/receptionist',
                    pharmacist: '/pharmacist',
                    lab_technician: '/lab-technician',
                    hospital_management: '/hospital-management'
                };
                
                router.push(dashboardRoutes[user.role] || '/');
                return;
            }
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}