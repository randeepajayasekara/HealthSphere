/**
 * HealthSphere - UMID Stats Component
 * Component for displaying UMID statistics and insights
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Shield, 
    Heart, 
    Clock, 
    CheckCircle,
    Activity,
    Eye,
    AlertTriangle
} from 'lucide-react';

interface UMIDStats {
    totalUMIDs: number;
    activeUMIDs: number;
    recentAccesses: number;
    securityAlerts: number;
}

interface UMIDStatsDisplayProps {
    stats: UMIDStats;
    isLoading?: boolean;
}

export default function UMIDStatsDisplay({ stats, isLoading = false }: UMIDStatsDisplayProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-blue-800 dark:text-blue-200">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5" />
                            <span>Your Privacy & Security</span>
                        </div>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Protected
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Your data is encrypted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">You control access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Complete audit trail</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">HIPAA compliant</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-purple-800 dark:text-purple-200">
                        <div className="flex items-center space-x-2">
                            <Heart className="w-5 h-5" />
                            <span>Your Medical Records</span>
                        </div>
                        <Badge variant="outline" className="text-purple-700 border-purple-300">
                            {stats.activeUMIDs} Active
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Total UMIDs:</span>
                        <Badge variant="secondary">{stats.totalUMIDs}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Active UMIDs:</span>
                        <Badge variant="default">{stats.activeUMIDs}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Critical allergies stored</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Emergency contacts ready</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-200">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Access Activity</span>
                        </div>
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {stats.recentAccesses === 0 ? 'No Activity' : 'Active'}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Recent accesses:</span>
                        <Badge variant={stats.recentAccesses > 0 ? "default" : "secondary"}>
                            {stats.recentAccesses}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Security alerts:</span>
                        <Badge variant={stats.securityAlerts > 0 ? "destructive" : "secondary"}>
                            {stats.securityAlerts}
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">24/7 availability</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Instant emergency access</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
