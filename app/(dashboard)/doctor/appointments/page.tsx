"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Plus,
  Filter,
  Check,
  X,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Download,
  Loader2,
  CheckCircle2,
  Timer,
  Users,
  Activity,
  CalendarDays,
  PlayCircle,
  PauseCircle,
  Stethoscope,
  FileText,
  Grid3X3,
  List
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { Appointment, AppointmentStatus, AppointmentType } from '@/app/types';

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [realTimeSubscription, setRealTimeSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
      setupRealTimeSubscription();
    }
    
    return () => {
      if (realTimeSubscription) {
        realTimeSubscription();
      }
    };
  }, [user, selectedDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, typeFilter, searchTerm]);

  const loadAppointments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await DoctorService.getDoctorAppointments(user.id, {
        filter: {
          dateRange: {
            startDate: selectedDate,
            endDate: selectedDate
          }
        }
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const setupRealTimeSubscription = () => {
    if (!user?.id) return;

    // Clean up previous subscription
    if (realTimeSubscription) {
      realTimeSubscription();
    }

    const unsubscribe = DoctorService.subscribeToTodayAppointments(
      user.id,
      (todayAppointments) => {
        const today = new Date();
        const selected = selectedDate;
        
        // If selected date is today, update with real-time data
        if (selected.toDateString() === today.toDateString()) {
          setAppointments(todayAppointments);
        }
      }
    );

    setRealTimeSubscription(() => unsubscribe);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.type === typeFilter);
    }

    // Sort by start time
    filtered.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`);
      const timeB = new Date(`2000-01-01T${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await DoctorService.updateAppointmentStatus(appointmentId, status);
      // Optimistically update the UI
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status, updatedAt: new Date() }
            : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Reload appointments on error
      loadAppointments();
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'checked_in': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'no_show': return 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-700';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return <CalendarIcon className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'checked_in': return <User className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no_show': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: AppointmentType) => {
    switch (type) {
      case 'regular_checkup': return <Stethoscope className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      case 'specialist_consultation': return <User className="h-4 w-4" />;
      case 'emergency': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'vaccination': return <Check className="h-4 w-4" />;
      case 'lab_test': return <CheckCircle className="h-4 w-4" />;
      case 'imaging': return <FileText className="h-4 w-4" />;
      case 'surgery': return <Activity className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
      case 'regular_checkup': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'follow_up': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'specialist_consultation': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'emergency': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'vaccination': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'lab_test': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
      case 'imaging': return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800';
      case 'surgery': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const pending = appointments.filter(apt => 
      ['scheduled', 'confirmed', 'checked_in'].includes(apt.status)
    ).length;
    const inProgress = appointments.filter(apt => apt.status === 'in_progress').length;
    const cancelled = appointments.filter(apt => 
      ['cancelled', 'no_show'].includes(apt.status)
    ).length;

    return { total, completed, pending, inProgress, cancelled };
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="hover:shadow-lg transition-all duration-200 border-zinc-200 dark:border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-center">
              <div className="text-lg font-semibold text-red-600">
                {formatTime(appointment.startTime)}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatTime(appointment.endTime)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getTypeIcon(appointment.type)}
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {appointment.reason}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Patient: {appointment.patientId.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              <span className="ml-1">{appointment.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className={getTypeColor(appointment.type)}>
              {appointment.type.replace('_', ' ')}
            </Badge>
            {appointment.virtualMeeting && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <Video className="h-4 w-4 mr-1" />
                Virtual
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {appointment.status === 'scheduled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                className="hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-300"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirm
              </Button>
            )}
            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAppointmentStatus(appointment.id, 'checked_in')}
                className="hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-300"
              >
                <User className="h-4 w-4 mr-1" />
                Check In
              </Button>
            )}
            {appointment.status === 'checked_in' && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            {appointment.status === 'in_progress' && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            <Button size="sm" variant="outline" className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const stats = getAppointmentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">Loading appointments...</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">Please wait while we fetch your schedule</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Appointments
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage your schedule and patient appointments
            </p>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button 
            onClick={loadAppointments}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Appointments
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your schedule and patient appointments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={refreshAppointments}
            disabled={refreshing}
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Date Selection and Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
              <CalendarIcon className="h-5 w-5 mr-2 text-red-600" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-zinc-200 dark:border-zinc-700"
              classNames={{
                months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                month: "space-y-4 w-full flex flex-col",
                table: "w-full h-full border-collapse space-y-1",
                head_row: "",
                row: "w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-red-50 [&:has([aria-selected])]:dark:bg-red-900/20",
                day: "h-8 w-8 p-0 font-normal hover:bg-red-50 hover:dark:bg-red-900/20 aria-selected:opacity-100",
                day_selected: "bg-red-600 text-red-50 hover:bg-red-600 hover:text-red-50 focus:bg-red-600 focus:text-red-50 dark:bg-red-600 dark:text-red-50",
                day_today: "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-100",
                day_outside: "text-zinc-500 opacity-50 aria-selected:bg-red-50 aria-selected:text-zinc-500 aria-selected:opacity-30",
                day_disabled: "text-zinc-500 opacity-50",
                day_range_middle: "aria-selected:bg-red-50 aria-selected:text-red-900 dark:aria-selected:bg-red-900/20 dark:aria-selected:text-red-100",
                day_hidden: "invisible",
              }}
            />
          </CardContent>
        </Card>

        {/* Stats and Filters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total</CardTitle>
                <CalendarDays className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {filteredAppointments.length} shown
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.completed}</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}% completion
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">In Progress</CardTitle>
                <PlayCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.inProgress}</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Active sessions
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Pending</CardTitle>
                <Timer className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.pending}</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Awaiting action
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-zinc-300 dark:border-zinc-600 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-zinc-300 dark:border-zinc-600">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-zinc-300 dark:border-zinc-600">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="regular_checkup">Regular Checkup</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="specialist_consultation">Specialist</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="lab_test">Lab Test</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center justify-end mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Grid
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointments Content */}
      {viewMode === 'list' ? (
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">
              Appointments for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-400">
              {filteredAppointments.length} of {appointments.length} appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="text-lg font-semibold text-red-600">
                            {formatTime(appointment.startTime)}
                          </div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            {formatTime(appointment.endTime)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(appointment.type)}
                            <Badge className={getTypeColor(appointment.type)}>
                              {appointment.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {appointment.reason}
                            </div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                              Patient: {appointment.patientId.slice(0, 8)}...
                            </div>
                            {appointment.virtualMeeting && (
                              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-1">
                                <Video className="h-3 w-3 mr-1" />
                                Virtual Meeting
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status.replace('_', ' ')}</span>
                        </Badge>

                        <div className="flex items-center space-x-2">
                          {appointment.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-300"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'checked_in')}
                              className="hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-300"
                            >
                              <User className="h-4 w-4 mr-1" />
                              Check In
                            </Button>
                          )}
                          {appointment.status === 'checked_in' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                          {appointment.status === 'in_progress' && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  No appointments found
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {statusFilter !== 'all' || typeFilter !== 'all' || searchTerm
                    ? "Try adjusting your filters or search criteria"
                    : "No appointments scheduled for this date"
                  }
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Appointments for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {filteredAppointments.length} of {appointments.length} appointments
            </p>
          </div>
          
          {filteredAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAppointments.map(renderAppointmentCard)}
            </div>
          ) : (
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardContent className="py-12">
                <div className="text-center">
                  <CalendarIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    No appointments found
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    {statusFilter !== 'all' || typeFilter !== 'all' || searchTerm
                      ? "Try adjusting your filters or search criteria"
                      : "No appointments scheduled for this date"
                    }
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
