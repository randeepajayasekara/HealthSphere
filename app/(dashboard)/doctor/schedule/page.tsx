"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  CalendarDays,
  Timer,
  Users,
  MapPin,
  Video,
  Phone,
  Stethoscope,
  FileText,
  Activity,
  Sun,
  Moon,
  Coffee,
  Sunset,
  Loader2,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  XCircle
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { DoctorDataSeedingService } from '@/lib/firestore/doctor-data-seeding-service';
import { useAuth } from '@/app/contexts/auth-context';
import { AvailabilitySchedule, TimeSlot, AvailabilityException, Appointment } from '@/app/types';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ScheduleView {
  weekly: boolean;
  monthly: boolean;
  daily: boolean;
}

interface ScheduleStats {
  totalWorkingHours: number;
  averageAppointmentsPerDay: number;
  busyDays: string[];
  availableSlots: number;
  bookedSlots: number;
}

export default function DoctorSchedulePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  
  // Schedule data
  const [schedule, setSchedule] = useState<AvailabilitySchedule>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
    exceptions: []
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats>({
    totalWorkingHours: 0,
    averageAppointmentsPerDay: 0,
    busyDays: [],
    availableSlots: 0,
    bookedSlots: 0
  });

  const [exceptionForm, setExceptionForm] = useState({
    date: new Date(),
    isAvailable: false,
    reason: '',
    timeSlots: [] as TimeSlot[]
  });

  const [timeSlotForm, setTimeSlotForm] = useState({
    startTime: '09:00',
    endTime: '17:00'
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    if (user?.id) {
      loadScheduleData();
      loadAppointments();
    }
  }, [user, selectedDate]);

  const loadScheduleData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. In production, this would come from Firestore
      const mockSchedule: AvailabilitySchedule = {
        monday: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        tuesday: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        wednesday: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        thursday: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        friday: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '16:00' }
        ],
        saturday: [
          { startTime: '09:00', endTime: '12:00' }
        ],
        sunday: [],
        exceptions: []
      };

      setSchedule(mockSchedule);
      calculateScheduleStats(mockSchedule);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!user?.id) return;

    try {
      const startDate = startOfWeek(selectedDate);
      const endDate = endOfWeek(selectedDate);
      
      // For now, use mock data. In production, this would come from Firestore
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientId: 'patient-1',
          doctorId: user.id,
          date: new Date(),
          startTime: '09:00',
          endTime: '09:30',
          status: 'scheduled',
          type: 'regular_checkup',
          reason: 'Regular checkup',
          notes: 'Patient feeling well',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          patientId: 'patient-2',
          doctorId: user.id,
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: '10:00',
          endTime: '10:45',
          status: 'confirmed',
          type: 'follow_up',
          reason: 'Follow-up appointment',
          notes: 'Previous treatment check',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const calculateScheduleStats = (scheduleData: AvailabilitySchedule) => {
    let totalHours = 0;
    let totalSlots = 0;
    const busyDays: string[] = [];

    days.forEach(day => {
      const daySlots = scheduleData[day as keyof AvailabilitySchedule] as TimeSlot[] || [];
      daySlots.forEach(slot => {
        const start = parseISO(`2000-01-01T${slot.startTime}:00`);
        const end = parseISO(`2000-01-01T${slot.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        totalSlots += Math.floor(hours * 2); // 30-minute slots
      });
      
      if (daySlots.length > 0) {
        busyDays.push(day);
      }
    });

    const bookedSlots = appointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;

    setScheduleStats({
      totalWorkingHours: totalHours,
      averageAppointmentsPerDay: appointments.length / 7,
      busyDays,
      availableSlots: totalSlots,
      bookedSlots
    });
  };

  const saveSchedule = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      
      // For now, simulate save. In production, this would save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Schedule updated successfully');
      calculateScheduleStats(schedule);
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      startTime: timeSlotForm.startTime,
      endTime: timeSlotForm.endTime
    };

    setSchedule(prev => ({
      ...prev,
      [day]: [...(prev[day as keyof AvailabilitySchedule] as TimeSlot[] || []), newSlot]
    }));

    setTimeSlotForm({ startTime: '09:00', endTime: '17:00' });
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: (prev[day as keyof AvailabilitySchedule] as TimeSlot[] || []).filter((_, index) => index !== slotIndex)
    }));
  };

  const addException = () => {
    const newException: AvailabilityException = {
      date: exceptionForm.date,
      isAvailable: exceptionForm.isAvailable,
      reason: exceptionForm.reason,
      timeSlots: exceptionForm.timeSlots
    };

    setSchedule(prev => ({
      ...prev,
      exceptions: [...(prev.exceptions || []), newException]
    }));

    setExceptionForm({
      date: new Date(),
      isAvailable: false,
      reason: '',
      timeSlots: []
    });
    setShowExceptionDialog(false);
  };

  const removeException = (exceptionIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      exceptions: (prev.exceptions || []).filter((_, index) => index !== exceptionIndex)
    }));
  };

  const copySchedule = (fromDay: string, toDay: string) => {
    const sourceSlots = schedule[fromDay as keyof AvailabilitySchedule] as TimeSlot[] || [];
    setSchedule(prev => ({
      ...prev,
      [toDay]: [...sourceSlots]
    }));
  };

  const getWeekDays = () => {
    const startDate = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.date), date)
    );
  };

  const getTimeSlotIcon = (timeSlot: TimeSlot) => {
    const hour = parseInt(timeSlot.startTime.split(':')[0]);
    if (hour >= 6 && hour < 12) return Sun;
    if (hour >= 12 && hour < 17) return Coffee;
    if (hour >= 17 && hour < 21) return Sunset;
    return Moon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            My Schedule
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your availability and working hours
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={viewMode} onValueChange={(value: 'week' | 'month' | 'day') => setViewMode(value)}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={saveSchedule} 
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Schedule
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Schedule Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Working Hours</CardTitle>
            <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleStats.totalWorkingHours.toFixed(1)}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              hours per week
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Available Slots</CardTitle>
            <Timer className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleStats.availableSlots}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {scheduleStats.bookedSlots} booked
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Busy Days</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleStats.busyDays.length}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              out of 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Utilization</CardTitle>
            <Activity className="h-4 w-4 text-purple-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduleStats.availableSlots > 0 
                ? Math.round((scheduleStats.bookedSlots / scheduleStats.availableSlots) * 100)
                : 0}%
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              capacity utilization
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4">
            {days.map((day, index) => {
              const daySlots = schedule[day as keyof AvailabilitySchedule] as TimeSlot[] || [];
              const Icon = getTimeSlotIcon(daySlots[0] || { startTime: '09:00', endTime: '17:00' });
              
              return (
                <Card key={day} className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                        <span className="capitalize truncate">{day}</span>
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {daySlots.length} slots
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDay(day)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const fromDay = days.find(d => (schedule[d as keyof AvailabilitySchedule] as TimeSlot[])?.length > 0);
                            if (fromDay) copySchedule(fromDay, day);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {daySlots.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No availability set for {day}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDay(day)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Time Slot
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {daySlots.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 min-w-0"
                            >
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(day, slotIndex)}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 flex-shrink-0 ml-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Select a date to view appointments and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="w-full overflow-x-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border w-full max-w-none mx-auto"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-8 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  Appointments and availability for selected date
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4 h-full">
                  {getAppointmentsForDay(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center h-full">
                      <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No appointments scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getAppointmentsForDay(selectedDate).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-red-600" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                Patient ID: {appointment.patientId}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                {appointment.startTime} - {appointment.endTime} | {appointment.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">Schedule Exceptions</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Manage holidays, time off, and special availability
              </p>
            </div>
            <Button 
              onClick={() => setShowExceptionDialog(true)}
              className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exception
            </Button>
          </div>

          <div className="space-y-2">
            {schedule.exceptions && schedule.exceptions.length > 0 ? (
              schedule.exceptions.map((exception, index) => (
                <Card key={index} className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          {exception.isAvailable ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {format(exception.date, 'MMMM d, yyyy')}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                            {exception.reason || (exception.isAvailable ? 'Special availability' : 'Unavailable')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant={exception.isAvailable ? 'default' : 'destructive'}>
                          {exception.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeException(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No schedule exceptions set</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Time Slot Dialog */}
      <Dialog open={!!editingDay} onOpenChange={() => setEditingDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Slot - {editingDay && editingDay.charAt(0).toUpperCase() + editingDay.slice(1)}</DialogTitle>
            <DialogDescription>
              Set your availability for {editingDay}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={timeSlotForm.startTime}
                  onChange={(e) => setTimeSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={timeSlotForm.endTime}
                  onChange={(e) => setTimeSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDay(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingDay) {
                  addTimeSlot(editingDay);
                  setEditingDay(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Add Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Exception Dialog */}
      <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule Exception</DialogTitle>
            <DialogDescription>
              Add a special availability or unavailability date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exceptionDate">Date</Label>
              <Input
                id="exceptionDate"
                type="date"
                value={format(exceptionForm.date, 'yyyy-MM-dd')}
                onChange={(e) => setExceptionForm(prev => ({ ...prev, date: new Date(e.target.value) }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={exceptionForm.isAvailable}
                onCheckedChange={(checked) => setExceptionForm(prev => ({ ...prev, isAvailable: checked }))}
              />
              <Label htmlFor="isAvailable">
                {exceptionForm.isAvailable ? 'Available' : 'Unavailable'}
              </Label>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for exception (optional)"
                value={exceptionForm.reason}
                onChange={(e) => setExceptionForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={addException}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Add Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
