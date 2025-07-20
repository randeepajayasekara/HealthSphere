"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Video, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Monitor,
  Wifi,
  UserPlus,
  Bell,
  Settings
} from 'lucide-react';

// Components
import { VirtualWaitingRoomPatientCard } from '@/app/components/doctor/virtual-waiting-room-patient-card';
import { VirtualWaitingRoomStats } from '@/app/components/doctor/virtual-waiting-room-stats';
import { VirtualWaitingRoomQueueControls } from '@/app/components/doctor/virtual-waiting-room-queue-controls';

// Hooks
import { useVirtualWaitingRoom } from '@/hooks/use-virtual-waiting-room';
import { useAuth } from '@/app/contexts/auth-context';

export default function VirtualWaitingRoomPage() {
  const { user } = useAuth();
  const {
    patients,
    filteredPatients,
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
  } = useVirtualWaitingRoom();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Please log in to access the virtual waiting room.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Access Denied
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Only doctors can access the virtual waiting room.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Virtual Waiting Room
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage your virtual consultations and patient queue
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                <Video className="h-3 w-3 mr-1" />
                Jitsi Meet Ready
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mb-8">
            <VirtualWaitingRoomStats stats={stats} />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Queue Controls */}
        <div className="mb-6">
          <VirtualWaitingRoomQueueControls
            patients={patients}
            onRefresh={refreshData}
            onNotifyAllPatients={notifyAllPatients}
            onSeedDummyData={seedDummyData}
            onExportQueue={exportQueue}
            searchTerm={filters.searchTerm}
            onSearchChange={updateSearchTerm}
            priorityFilter={filters.priorityFilter}
            onPriorityFilterChange={updatePriorityFilter}
            statusFilter={filters.statusFilter}
            onStatusFilterChange={updateStatusFilter}
            sortBy={filters.sortBy}
            onSortChange={updateSortBy}
            sortOrder={filters.sortOrder}
            onSortOrderChange={updateSortOrder}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Queue */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-red-600" />
                    <span>Patient Queue</span>
                    <Badge variant="secondary" className="text-xs">
                      {filteredPatients.length} patients
                    </Badge>
                  </div>
                  {isLoading && (
                    <RefreshCw className="h-4 w-4 animate-spin text-zinc-400" />
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  Patients waiting for virtual consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <AnimatePresence mode="popLayout">
                    {filteredPatients.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <Users className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                          No patients in queue
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                          {patients.length === 0 
                            ? "Your virtual waiting room is empty."
                            : "No patients match your current filters."
                          }
                        </p>
                        {patients.length === 0 && (
                          <Button
                            onClick={seedDummyData}
                            variant="outline"
                            className="border-zinc-200 dark:border-zinc-800"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Test Patients
                          </Button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPatients.map((patient, index) => (
                          <VirtualWaitingRoomPatientCard
                            key={patient.id}
                            patient={patient}
                            onStartConsultation={startConsultation}
                            onUpdatePriority={updatePatientPriority}
                            onSendMessage={sendMessageToPatient}
                            onRemoveFromQueue={removePatientFromQueue}
                            className={selectedPatient === patient.id ? 'ring-2 ring-red-500' : ''}
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  className="w-full justify-start border-zinc-200 dark:border-zinc-800"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Queue
                </Button>
                <Button
                  onClick={notifyAllPatients}
                  variant="outline"
                  className="w-full justify-start border-zinc-200 dark:border-zinc-800"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notify All Patients
                </Button>
                <Button
                  onClick={seedDummyData}
                  variant="outline"
                  className="w-full justify-start border-zinc-200 dark:border-zinc-800"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Test Patients
                </Button>
                <Button
                  onClick={exportQueue}
                  variant="outline"
                  className="w-full justify-start border-zinc-200 dark:border-zinc-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Export Queue
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Jitsi Meet</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Connection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    Good
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Real-time Updates</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                    Active
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Help & Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <ul className="space-y-1">
                    <li>• Click "Start Consultation" to begin a video call</li>
                    <li>• Use priority controls to manage queue order</li>
                    <li>• Monitor patient device status for tech issues</li>
                    <li>• Export queue data for reporting</li>
                    <li>• Auto-refresh keeps data current</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
