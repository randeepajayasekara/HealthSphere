/**
 * ConsultationDashboard Component
 * Main dashboard component for consultation management
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Activity,
  BarChart3,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { ConsultationQueue } from './consultation-queue';
import { ConsultationAnalytics } from './consultation-analytics';
import { ConsultationTimer } from './consultation-timer';
import { ConsultationStatusBadge } from './consultation-status';
import { useConsultations } from '@/app/hooks/use-consultations';
import { useAuth } from '@/app/contexts/auth-context';
import { Consultation, ConsultationStatus, PatientProfile } from '@/app/types';

interface ConsultationDashboardProps {
  patients: PatientProfile[];
  className?: string;
}

export function ConsultationDashboard({
  patients,
  className = ""
}: ConsultationDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  const {
    consultations,
    loading,
    error,
    updateConsultation,
    updateConsultationStatus,
    searchConsultations,
    filterConsultations,
    getConsultationStats
  } = useConsultations({ 
    doctorId: user?.id || '',
    autoRefresh: true 
  });

  // Get consultations by status using filter
  const getConsultationsByStatus = (status: ConsultationStatus) => {
    return consultations.filter(c => c.status === status);
  };

  // Get current consultation
  const getCurrentConsultation = () => {
    return consultations.find(c => c.status === 'in_progress');
  };

  const currentConsultation = getCurrentConsultation();
  const scheduledConsultations = getConsultationsByStatus('scheduled');
  const waitingConsultations = getConsultationsByStatus('waiting');
  const inProgressConsultations = getConsultationsByStatus('in_progress');
  const completedConsultations = getConsultationsByStatus('completed');

  // Quick stats
  const todayConsultations = consultations.filter(c => 
    new Date(c.date).toDateString() === new Date().toDateString()
  );
  
  const upcomingConsultations = consultations.filter(c => 
    c.status === 'scheduled' && new Date(c.date) >= new Date()
  );

  const handleStartConsultation = async (consultationId: string) => {
    await updateConsultationStatus(consultationId, 'in_progress');
  };

  const handleStatusChange = async (consultationId: string, status: ConsultationStatus) => {
    await updateConsultationStatus(consultationId, status);
  };

  const handleReorderQueue = async (consultationIds: string[]) => {
    // Implementation for reordering queue
    // This would typically involve updating a priority/order field
    console.log('Reordering queue:', consultationIds);
  };

  const handleUpdatePriority = async (consultationId: string, priority: 'emergency' | 'urgent' | 'high' | 'medium' | 'low') => {
    await updateConsultation(consultationId, { priority });
  };

  const QuickStatsCard = ({ 
    title, 
    value, 
    icon: Icon, 
    variant = 'default' 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    variant?: 'default' | 'warning' | 'success' | 'destructive'; 
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${
            variant === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
            variant === 'success' ? 'bg-green-100 dark:bg-green-900' :
            variant === 'destructive' ? 'bg-red-100 dark:bg-red-900' :
            'bg-blue-100 dark:bg-blue-900'
          }`}>
            <Icon className={`h-6 w-6 ${
              variant === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
              variant === 'success' ? 'text-green-600 dark:text-green-400' :
              variant === 'destructive' ? 'text-red-600 dark:text-red-400' :
              'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error loading consultations: {error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Consultation Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your consultations and track performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Current Consultation Alert */}
      {currentConsultation && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Consultation in Progress
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {patients.find(p => p.id === currentConsultation.patientId)?.firstName} {patients.find(p => p.id === currentConsultation.patientId)?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ConsultationTimer
                  startTime={currentConsultation.actualStartTime}
                  status={currentConsultation.status}
                  onStatusChange={(status) => handleStatusChange(currentConsultation.id, status)}
                />
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatsCard
          title="Today's Consultations"
          value={todayConsultations.length}
          icon={CalendarDays}
        />
        <QuickStatsCard
          title="Waiting"
          value={waitingConsultations.length}
          icon={Clock}
          variant="warning"
        />
        <QuickStatsCard
          title="In Progress"
          value={inProgressConsultations.length}
          icon={Activity}
          variant="success"
        />
        <QuickStatsCard
          title="Completed Today"
          value={completedConsultations.filter(c => 
            new Date(c.date).toDateString() === new Date().toDateString()
          ).length}
          icon={Users}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayConsultations.slice(0, 5).map(consultation => {
                    const patient = patients.find(p => p.id === consultation.patientId);
                    return (
                      <div key={consultation.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {consultation.startTime}
                          </div>
                          <div>
                            <p className="font-medium">
                              {patient?.firstName} {patient?.lastName}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {consultation.type}
                            </p>
                          </div>
                        </div>
                        <ConsultationStatusBadge
                          status={consultation.status}
                          priority={consultation.priority}
                          size="sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultations
                    .filter(c => c.status === 'completed')
                    .slice(0, 5)
                    .map(consultation => {
                      const patient = patients.find(p => p.id === consultation.patientId);
                      return (
                        <div key={consultation.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {patient?.firstName} {patient?.lastName}
                              </p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Completed {consultation.duration}min consultation
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {consultation.actualEndTime && new Date(consultation.actualEndTime).toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue">
          <ConsultationQueue
            consultations={consultations}
            patients={patients}
            onStartConsultation={handleStartConsultation}
            onReorderQueue={handleReorderQueue}
            onUpdatePriority={handleUpdatePriority}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <ConsultationAnalytics
            consultations={consultations}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ConsultationDashboard;
