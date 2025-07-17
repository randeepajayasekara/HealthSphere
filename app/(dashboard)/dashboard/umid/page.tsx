/**
 * HealthSphere - UMID Main Page
 * Universal Medical ID system main interface
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
    Scan, 
    Settings, 
    Users, 
    Activity,
    AlertTriangle,
    Info,
    CheckCircle,
    Lock,
    Smartphone,
    Heart,
    Clock
} from 'lucide-react';

// Import UMID components
import UMIDAccessScanner from '@/app/components/umid/umid-access-scanner';
import UMIDGenerator from '@/app/components/umid/umid-generator';
import UMIDManagementDashboard from '@/app/components/umid/umid-management-dashboard';

// Mock user data - replace with actual auth context
interface User {
    id: string;
    role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'hospital_management';
    name: string;
    department?: string;
}

export default function UMIDMainPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState<User>({
        id: 'user123',
        role: 'doctor',
        name: 'Dr. John Smith',
        department: 'Emergency Medicine'
    });

    // Feature access based on user role
    const canGenerate = ['admin', 'hospital_management'].includes(user.role);
    const canAccess = ['doctor', 'nurse', 'admin', 'hospital_management', 'lab_technician'].includes(user.role);
    const canManage = ['admin', 'hospital_management'].includes(user.role);
    const isPatient = user.role === 'patient';

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
                            Logged in as <span className="font-medium">{user.name}</span> ({user.role})
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
                                        All services running normally • Response time: 0.8s
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-green-700 border-green-300">
                                99.9% Uptime
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Access Features */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">Quick Access</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            title="Access UMID"
                            description="Scan QR code or enter UMID to access patient information"
                            icon={Scan}
                            available={canAccess}
                            onClick={() => setActiveTab('access')}
                            badge="Scan"
                        />
                        
                        <FeatureCard
                            title="Generate UMID"
                            description="Create new Universal Medical ID for patients"
                            icon={QrCode}
                            available={canGenerate}
                            onClick={() => setActiveTab('generate')}
                            badge="Create"
                        />
                        
                        <FeatureCard
                            title="Manage UMIDs"
                            description="View, edit, and manage existing Universal Medical IDs"
                            icon={Settings}
                            available={canManage || isPatient}
                            onClick={() => setActiveTab('manage')}
                            badge="Admin"
                        />
                    </div>
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                                <Shield className="w-5 h-5" />
                                <span>Security Features</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">End-to-end encryption</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">TOTP authentication</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Audit trail logging</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Role-based access</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
                                <Heart className="w-5 h-5" />
                                <span>Medical Data</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Critical allergies</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Current medications</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Emergency contacts</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Chronic conditions</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 dark:border-orange-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                                <Clock className="w-5 h-5" />
                                <span>Emergency Ready</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Instant access</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Emergency override</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Offline capable</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">24/7 availability</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Interface */}
                <Card className="border-2 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                                        <Info className="w-4 h-4" />
                                        <span className="hidden sm:inline">Overview</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="access" 
                                        disabled={!canAccess}
                                        className="flex items-center space-x-2"
                                    >
                                        <Scan className="w-4 h-4" />
                                        <span className="hidden sm:inline">Access</span>
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
                                        disabled={!canManage && !isPatient}
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
                                        <h3 className="text-2xl font-bold">Welcome to UMID System</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                            The Universal Medical ID system provides secure, instant access to critical 
                                            patient medical information during emergencies and routine care. Select a 
                                            feature above to get started.
                                        </p>
                                    </div>

                                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                                            <strong>New to UMID?</strong> The Universal Medical ID system uses QR codes 
                                            and secure authentication to provide healthcare providers with immediate access 
                                            to patient's critical medical information in emergency situations.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                                            </div>
                                            <h4 className="font-semibold">Generate UMID</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Create a secure QR code with patient's critical medical data
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                                            </div>
                                            <h4 className="font-semibold">Patient Carries UMID</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Patient keeps QR code accessible for emergency situations
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                                            </div>
                                            <h4 className="font-semibold">Emergency Access</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Healthcare providers scan and authenticate for instant access
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="access" className="mt-0">
                                    <UMIDAccessScanner
                                        staffId={user.id}
                                        staffRole={user.role}
                                        onAccessSuccess={(data) => {
                                            console.log('Access successful:', data);
                                        }}
                                        onAccessFailed={(error) => {
                                            console.error('Access failed:', error);
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent value="generate" className="mt-0">
                                    <UMIDGenerator
                                        onGenerated={(umid) => {
                                            console.log('UMID generated:', umid);
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
                        HealthSphere Universal Medical ID System • Secure • Reliable • Instant
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
