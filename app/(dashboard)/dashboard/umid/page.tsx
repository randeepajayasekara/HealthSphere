/**
 * HealthSphere - UMID Main Page
 * Universal Medical ID system main interface for patients
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    QrCode, 
    Shield, 
    Settings, 
    Activity,
    AlertTriangle,
    Info,
    CheckCircle,
    Lock,
    Smartphone,
    Heart,
    Clock,
    Plus,
    User
} from 'lucide-react';

// Import UMID components
import UMIDGenerator from '@/app/components/umid/umid-generator';
import UMIDManagementDashboard from '@/app/components/umid/umid-management-dashboard';
import UMIDStatsDisplay from '@/app/components/umid/umid-stats-display';

// Import authentication context and UMID hook
import { useAuth } from '@/app/contexts/auth-context';
import { useUMID } from '@/hooks/use-umid';

export default function UMIDMainPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { umids, stats, isLoading: umidLoading, generateUMID, refreshData } = useUMID();

    // Combined loading state
    const isLoading = authLoading || umidLoading;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading UMID System...</p>
                </div>
            </div>
        );
    }

    // Authentication check
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
                        <h2 className="text-xl font-semibold">Authentication Required</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please log in to access the Universal Medical ID system.
                        </p>
                        <Button onClick={() => window.location.href = '/login'}>
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Patient role restrictions - patients can only generate and manage their own UMIDs
    const isPatient = user.role === 'patient';
    const canGenerate = isPatient; // Patients can generate UMIDs for themselves
    const canManage = isPatient; // Patients can manage their own UMIDs
    
    // Get user's full name
    const userFullName = `${user.firstName} ${user.lastName}`;

    const FeatureCard = ({ 
        title, 
        description, 
        icon: Icon, 
        available, 
        onClick, 
        badge 
    }: {
        title: string;
        description: string;
        icon: any;
        available: boolean;
        onClick?: () => void;
        badge?: string;
    }) => (
        <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            available 
                ? 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-700' 
                : 'border-gray-200 dark:border-gray-700 opacity-60'
        }`} onClick={available ? onClick : undefined}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                            available 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                                : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                            <Icon className={`w-6 h-6 ${
                                available 
                                    ? 'text-emerald-600 dark:text-emerald-400' 
                                    : 'text-gray-400'
                            }`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
                        </div>
                    </div>
                    {badge && (
                        <Badge variant={available ? "default" : "secondary"}>
                            {badge}
                        </Badge>
                    )}
                </div>
                {!available && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Not available for your role
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl">
                            <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                Universal Medical ID
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Secure, instant access to critical medical information
                            </p>
                        </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Logged in as <span className="font-medium">{userFullName}</span> ({user.role})
                        </span>
                    </div>
                </div>

                {/* System Status */}
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-200">
                                        UMID System Operational
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        {stats.totalUMIDs} UMIDs • {stats.activeUMIDs} Active • {stats.recentAccesses} Recent Accesses
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-green-700 border-green-300">
                                {userFullName}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Access Features */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">Your UMID Management</h2>
                    
                    {/* Show alert if user has no UMIDs */}
                    {!isLoading && stats.totalUMIDs === 0 && (
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                                <strong>No UMIDs Found:</strong> You haven't created any Universal Medical IDs yet. 
                                Create your first UMID to ensure your medical information is accessible in emergencies.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard
                            title="Generate My UMID"
                            description="Create your personal Universal Medical ID with your medical information"
                            icon={Plus}
                            available={canGenerate}
                            onClick={() => setActiveTab('generate')}
                            badge="Create New"
                        />
                        
                        <FeatureCard
                            title="Manage My UMIDs"
                            description="View, edit, and manage your existing Universal Medical IDs"
                            icon={Settings}
                            available={canManage}
                            onClick={() => setActiveTab('manage')}
                            badge="My UMIDs"
                        />
                    </div>
                </div>

                {/* Information Cards */}
                <UMIDStatsDisplay stats={stats} isLoading={isLoading} />

                {/* Main Interface */}
                <Card className="border-2 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                                        <Info className="w-4 h-4" />
                                        <span className="hidden sm:inline">Overview</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="generate" 
                                        disabled={!canGenerate}
                                        className="flex items-center space-x-2"
                                    >
                                        <QrCode className="w-4 h-4" />
                                        <span className="hidden sm:inline">Generate</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="manage" 
                                        disabled={!canManage}
                                        className="flex items-center space-x-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="hidden sm:inline">Manage</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6">
                                <TabsContent value="overview" className="space-y-6 mt-0">
                                    <div className="text-center space-y-4">
                                        <h3 className="text-2xl font-bold">Welcome to Your UMID System</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                            Your Universal Medical ID provides healthcare providers with secure, instant access to your 
                                            critical medical information during emergencies and routine care. Create and manage your 
                                            UMID to ensure your medical information is always accessible when needed.
                                        </p>
                                    </div>

                                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                                            <strong>Your Medical Safety Net:</strong> Your UMID contains critical medical information 
                                            like allergies, medications, and emergency contacts. Keep your UMID QR code accessible 
                                            (wallet, phone, medical bracelet) for emergency situations.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                                            </div>
                                            <h4 className="font-semibold">Create Your UMID</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Generate a secure QR code with your critical medical information
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                                            </div>
                                            <h4 className="font-semibold">Keep It Accessible</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Store your UMID QR code where you can easily access it in emergencies
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                                            </div>
                                            <h4 className="font-semibold">Emergency Ready</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Healthcare providers can instantly access your medical information
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="generate" className="mt-0">
                                    <UMIDGenerator
                                        initialPatientId={user.id}
                                        onGenerated={async (umid) => {
                                            console.log('UMID generated:', umid);
                                            await refreshData(); // Refresh the data to show new UMID
                                            setActiveTab('manage');
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent value="manage" className="mt-0">
                                    <UMIDManagementDashboard
                                        userRole={user.role}
                                        userId={user.id}
                                        onCreateNew={() => setActiveTab('generate')}
                                        onViewDetails={(umid) => {
                                            console.log('View UMID details:', umid);
                                        }}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>
                        Your HealthSphere Universal Medical ID • Secure • Personal • Life-Saving
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>End-to-End Encrypted</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Smartphone className="w-3 h-3" />
                            <span>Mobile Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
