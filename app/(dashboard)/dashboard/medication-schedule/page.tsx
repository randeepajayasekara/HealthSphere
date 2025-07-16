'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Plus,
  Pill,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Settings,
  Bell,
  Activity,
  Heart,
  Shield,
  Timer,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MedicationSchedule, AdherenceRecord, UserRole, MedicationReminder } from '@/app/types';
import { MedicationScheduleService, MedicationReminderService } from '@/lib/firestore/medication-services';
import { useAuth } from '@/app/contexts/auth-context';
import { AddMedicationDialog } from '@/app/components/medication/add-medication-dialog';
import { MedicationReminderPanel } from '@/app/components/medication/reminder-panel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TodayMedication {
  id: string;
  scheduleId: string;
  medicationName: string;
  dosage: any;
  time: string;
  label: string;
  mealRelation?: string;
  status: 'pending' | 'taken' | 'missed' | 'late';
  instructions: string;
}

export default function MedicationSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [todayMedications, setTodayMedications] = useState<TodayMedication[]>([]);
  const [pendingReminders, setPendingReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // Stats state
  const [adherenceStats, setAdherenceStats] = useState({
    overall: 85,
    thisWeek: 92,
    streak: 5,
    totalMedications: 4
  });

  useEffect(() => {
    if (user?.id) {
      loadMedicationData();
    }
  }, [user?.id]);

  const loadMedicationData = async () => {
    try {
      setLoading(true);
      
      // Load schedules based on user role
      const { schedules: userSchedules } = await MedicationScheduleService.getSchedulesByRole(
        user!.id,
        user!.role as UserRole,
        { page: 1, limit: 50 }
      );
      
      setSchedules(userSchedules);

      // For patients, load today's medications and reminders
      if (user!.role === 'patient') {
        const [todayMeds, reminders] = await Promise.all([
          MedicationScheduleService.getTodaySchedule(user!.id),
          MedicationReminderService.getPendingReminders(user!.id)
        ]);
        setTodayMedications(todayMeds);
        setPendingReminders(reminders);
      }

      // Calculate adherence stats
      calculateAdherenceStats(userSchedules);
    } catch (error) {
      console.error('Error loading medication data:', error);
      toast.error('Failed to load medication data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAdherenceStats = (schedules: MedicationSchedule[]) => {
    if (schedules.length === 0) return;

    const totalAdherence = schedules.reduce((sum, schedule) => 
      sum + (schedule.adherence?.adherencePercentage || 0), 0
    ) / schedules.length;

    const maxStreak = Math.max(...schedules.map(s => s.adherence?.streakDays || 0));

    setAdherenceStats({
      overall: Math.round(totalAdherence),
      thisWeek: 92, // This would be calculated from recent records
      streak: maxStreak,
      totalMedications: schedules.filter(s => s.isActive).length
    });
  };

  const handleTakeMedication = async (medicationId: string, scheduleId: string) => {
    try {
      const adherenceRecord: Omit<AdherenceRecord, 'date'> = {
        scheduledTime: new Date().toTimeString().slice(0, 5),
        actualTime: new Date(),
        status: 'taken',
        notes: 'Taken via app',
      };

      await MedicationScheduleService.recordAdherence(scheduleId, adherenceRecord);
      
      // Update local state
      setTodayMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { ...med, status: 'taken' }
            : med
        )
      );

      toast.success('Medication recorded successfully');
      loadMedicationData(); // Refresh data
    } catch (error) {
      toast.error('Failed to record medication');
    }
  };

  const handleAddMedication = async (medicationData: any) => {
    try {
      await MedicationScheduleService.createSchedule(medicationData);
      toast.success('Medication added successfully');
      loadMedicationData();
    } catch (error) {
      toast.error('Failed to add medication');
      throw error;
    }
  };

  const handleSnoozeReminder = async (reminderId: string, minutes: number) => {
    try {
      await MedicationReminderService.updateReminderStatus(reminderId, 'snoozed');
      
      // Remove from pending reminders
      setPendingReminders(prev => prev.filter(r => r.id !== reminderId));
      
      toast.success(`Reminder snoozed for ${minutes} minutes`);
    } catch (error) {
      toast.error('Failed to snooze reminder');
      throw error;
    }
  };

  const handleDismissReminder = async (reminderId: string) => {
    try {
      await MedicationReminderService.updateReminderStatus(reminderId, 'dismissed');
      
      // Remove from pending reminders
      setPendingReminders(prev => prev.filter(r => r.id !== reminderId));
      
      toast.success('Reminder dismissed');
    } catch (error) {
      toast.error('Failed to dismiss reminder');
      throw error;
    }
  };

  const handleTakeMedicationFromReminder = async (reminderId: string, scheduleId: string) => {
    try {
      // Record adherence
      await handleTakeMedication('', scheduleId);
      
      // Update reminder status
      await MedicationReminderService.updateReminderStatus(reminderId, 'delivered');
      
      // Remove from pending reminders
      setPendingReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (error) {
      toast.error('Failed to record medication');
      throw error;
    }
  };

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'missed': return 'text-red-600 bg-red-50 border-red-200';
      case 'late': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'missed': return <AlertCircle className="h-4 w-4" />;
      case 'late': return <Timer className="h-4 w-4" />;
      default: return <Pill className="h-4 w-4" />;
    }
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              Medication Schedule
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your medications and track adherence
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <MedicationReminderPanel
              reminders={pendingReminders}
              onTakeMedication={handleTakeMedicationFromReminder}
              onSnoozeReminder={handleSnoozeReminder}
              onDismissReminder={handleDismissReminder}
            />
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>

        {/* Add Medication Dialog */}
        <AddMedicationDialog
          isOpen={showAddModal}
          onOpenChange={setShowAddModal}
          onSubmit={handleAddMedication}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Adherence</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{adherenceStats.overall}%</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <Progress value={adherenceStats.overall} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Week</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{adherenceStats.thisWeek}%</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Progress value={adherenceStats.thisWeek} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Streak</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{adherenceStats.streak} days</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Keep it up!</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Medications</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{adherenceStats.totalMedications}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">All monitored</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
            <TabsTrigger value="today" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Today's Schedule
            </TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Pill className="h-4 w-4 mr-2" />
              All Medications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Today's Schedule Tab */}
          <TabsContent value="today" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-100">Today's Medications</CardTitle>
                    <CardDescription>
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    {todayMedications.length} medications
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayMedications.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No medications today
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      You're all set! No medications scheduled for today.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddModal(true)}
                      className="bg-white/80 dark:bg-slate-800/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Medication
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayMedications.map((medication) => (
                      <div
                        key={medication.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                          getMedicationStatusColor(medication.status)
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(medication.status)}
                              <div>
                                <h4 className="font-semibold">{medication.medicationName}</h4>
                                <p className="text-sm opacity-80">
                                  {medication.dosage.amount} {medication.dosage.unit} • {medication.time}
                                  {medication.label && ` • ${medication.label}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {medication.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleTakeMedication(medication.id, medication.scheduleId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Take Now
                              </Button>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Snooze
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Skip
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {medication.mealRelation && (
                          <div className="mt-2 flex items-center gap-1 text-sm opacity-75">
                            <Target className="h-3 w-3" />
                            {medication.mealRelation.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-100">Medication Library</CardTitle>
                    <CardDescription>Manage all your medications and schedules</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search medications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSchedules.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No medications found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {searchTerm ? 'Try a different search term' : 'Start by adding your first medication'}
                    </p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-6 rounded-lg border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Pill className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {schedule.medicationName}
                              </h3>
                              {schedule.brandName && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Brand: {schedule.brandName}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <span>{schedule.dosage.amount} {schedule.dosage.unit}</span>
                                <span>•</span>
                                <span>{schedule.schedule.frequency.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{schedule.formulation}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant={schedule.isActive ? "default" : "secondary"}
                                  className={schedule.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}
                                >
                                  {schedule.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
                                  {schedule.adherence?.adherencePercentage?.toFixed(0) || 0}% adherence
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Toggle active status
                                MedicationScheduleService.updateSchedule(
                                  schedule.id, 
                                  { isActive: !schedule.isActive },
                                  user!.id
                                ).then(() => {
                                  loadMedicationData();
                                  toast.success(`Medication ${schedule.isActive ? 'deactivated' : 'activated'}`);
                                });
                              }}
                            >
                              {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  View Analytics
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Schedule times */}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {schedule.schedule.times.map((time, index) => (
                              <Badge 
                                key={index} 
                                variant="outline"
                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                              >
                                {time.time} {time.label && `(${time.label})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <TrendingUp className="h-5 w-5" />
                    Adherence Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">
                        Advanced analytics coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                          <Zap className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">5-Day Streak</h4>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">Keep taking your medications on time</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">85% Adherence Goal</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">You've reached your monthly goal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
