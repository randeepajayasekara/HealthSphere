/**
 * HealthSphere - UMID Management Dashboard
 * Component for managing Universal Medical IDs
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    Search, 
    QrCode, 
    Shield, 
    Users, 
    Activity, 
    AlertTriangle,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Download,
    Plus,
    Filter,
    RefreshCw,
    MoreHorizontal,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { UMIDService, UMIDQueryService } from '@/lib/firestore/umid-services';
import { 
    UniversalMedicalID,
    UMIDAccessLog,
    UserRole
} from '@/app/types';

interface UMIDManagementDashboardProps {
    userRole: UserRole;
    userId: string;
    onCreateNew?: () => void;
    onViewDetails?: (umid: UniversalMedicalID) => void;
}

export default function UMIDManagementDashboard({
    userRole,
    userId,
    onCreateNew,
    onViewDetails
}: UMIDManagementDashboardProps) {
    const [umids, setUmids] = useState<UniversalMedicalID[]>([]);
    const [accessLogs, setAccessLogs] = useState<UMIDAccessLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedUMID, setSelectedUMID] = useState<UniversalMedicalID | null>(null);
    const [stats, setStats] = useState({
        totalUMIDs: 0,
        activeUMIDs: 0,
        recentAccesses: 0,
        securityAlerts: 0
    });

    // Load data based on user role
    useEffect(() => {
        loadData();
    }, [userRole, userId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (userRole === 'patient') {
                // Patient can only see their own UMIDs
                const patientUMIDs = await UMIDQueryService.getPatientUMIDs(userId);
                setUmids(patientUMIDs);
                setStats({
                    totalUMIDs: patientUMIDs.length,
                    activeUMIDs: patientUMIDs.filter(u => u.isActive).length,
                    recentAccesses: 0, // Calculate from access logs
                    securityAlerts: 0
                });
            } else if (['admin', 'hospital_management'].includes(userRole)) {
                // Admin can see all UMIDs
                const { umids: allUMIDs } = await UMIDQueryService.getAllUMIDs({ isActive: undefined });
                setUmids(allUMIDs);
                setStats({
                    totalUMIDs: allUMIDs.length,
                    activeUMIDs: allUMIDs.filter(u => u.isActive).length,
                    recentAccesses: 0, // Calculate from access logs
                    securityAlerts: 0
                });
            } else {
                // Healthcare providers can search for UMIDs
                const searchResults = await UMIDQueryService.searchUMIDs('');
                setUmids(searchResults);
                setStats({
                    totalUMIDs: searchResults.length,
                    activeUMIDs: searchResults.filter(u => u.isActive).length,
                    recentAccesses: 0,
                    securityAlerts: 0
                });
            }
        } catch (error) {
            console.error('Error loading UMID data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadData();
            return;
        }

        setIsLoading(true);
        try {
            const results = await UMIDQueryService.searchUMIDs(searchTerm);
            setUmids(results);
        } catch (error) {
            console.error('Error searching UMIDs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivateUMID = async (umidId: string) => {
        if (!confirm('Are you sure you want to deactivate this UMID?')) return;

        try {
            await UMIDService.deactivateUMID(umidId);
            loadData(); // Refresh the list
        } catch (error) {
            console.error('Error deactivating UMID:', error);
            alert('Failed to deactivate UMID');
        }
    };

    const loadAccessLogs = async (umidId: string) => {
        try {
            const { logs } = await UMIDService.getAccessLogs(umidId, 20);
            setAccessLogs(logs);
        } catch (error) {
            console.error('Error loading access logs:', error);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <Card>
            <CardContent className="flex items-center p-6">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        UMID Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage Universal Medical IDs and access controls
                    </p>
                </div>
                {['admin', 'hospital_management'].includes(userRole) && (
                    <Button onClick={onCreateNew} className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Generate New UMID</span>
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total UMIDs"
                    value={stats.totalUMIDs}
                    icon={QrCode}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active UMIDs"
                    value={stats.activeUMIDs}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Recent Accesses"
                    value={stats.recentAccesses}
                    icon={Activity}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Security Alerts"
                    value={stats.securityAlerts}
                    icon={Shield}
                    color="bg-red-500"
                />
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Search and Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Search className="w-5 h-5" />
                                <span>Search UMIDs</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search by UMID number, patient name, or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <Button onClick={handleSearch}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                                <Button variant="outline" onClick={loadData}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* UMID List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Universal Medical IDs</CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading...' : `${umids.length} UMIDs found`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto" />
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading UMIDs...</p>
                                </div>
                            ) : umids.length === 0 ? (
                                <div className="text-center py-8">
                                    <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">No UMIDs found</p>
                                    {['admin', 'hospital_management'].includes(userRole) && (
                                        <Button onClick={onCreateNew} className="mt-4">
                                            Generate First UMID
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>UMID Number</TableHead>
                                                <TableHead>Patient Name</TableHead>
                                                <TableHead>Issue Date</TableHead>
                                                <TableHead>Last Access</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {umids.map((umid) => (
                                                <TableRow key={umid.id}>
                                                    <TableCell className="font-mono">
                                                        {umid.umidNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {umid.linkedMedicalData.basicInfo.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {umid.issueDate.toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {umid.lastAccessDate 
                                                            ? umid.lastAccessDate.toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={umid.isActive ? "default" : "secondary"}>
                                                            {umid.isActive ? (
                                                                <><CheckCircle className="w-3 h-3 mr-1" />Active</>
                                                            ) : (
                                                                <><XCircle className="w-3 h-3 mr-1" />Inactive</>
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedUMID(umid);
                                                                    loadAccessLogs(umid.id);
                                                                    onViewDetails?.(umid);
                                                                }}
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                            </Button>
                                                            {['admin', 'hospital_management'].includes(userRole) && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => console.log('Edit UMID:', umid.id)}
                                                                    >
                                                                        <Edit className="w-3 h-3" />
                                                                    </Button>
                                                                    {umid.isActive && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleDeactivateUMID(umid.id)}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="access-logs" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>Access Logs</span>
                            </CardTitle>
                            <CardDescription>
                                Recent UMID access attempts and activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accessLogs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No access logs available
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                        Select a UMID from the overview to view its access history
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Staff Member</TableHead>
                                                <TableHead>Access Type</TableHead>
                                                <TableHead>Purpose</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accessLogs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        {log.accessTime.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{log.accessedBy}</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {log.staffRole}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            log.accessType === 'emergency_override' ? 'destructive' :
                                                            log.accessType === 'scan' ? 'default' : 'secondary'
                                                        }>
                                                            {log.accessType.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{log.purpose}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={log.wasSuccessful ? "default" : "destructive"}>
                                                            {log.wasSuccessful ? 'Success' : 'Failed'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{log.location || 'Unknown'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total UMIDs Created</span>
                                        <Badge variant="outline">{stats.totalUMIDs}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Active UMIDs</span>
                                        <Badge variant="default">{stats.activeUMIDs}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Success Rate</span>
                                        <Badge variant="default">95.2%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Average Access Time</span>
                                        <Badge variant="outline">2.3s</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Failed Access Attempts</span>
                                        <Badge variant="destructive">12</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Emergency Overrides</span>
                                        <Badge variant="secondary">3</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Locked UMIDs</span>
                                        <Badge variant="outline">0</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Security Score</span>
                                        <Badge variant="default">Excellent</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">New UMID generated successfully</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Emergency access granted</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">4 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="font-medium">Multiple failed access attempts detected</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
