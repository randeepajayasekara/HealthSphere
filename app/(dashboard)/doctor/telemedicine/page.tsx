"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";``
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Video,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Calendar as CalendarIcon,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Play,
  Pause,
  PhoneCall,
  Phone,
  PhoneOff,
  Monitor,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  User,
  Mail,
  MapPin,
  TrendingUp,
  BarChart3,
  VideoOff,
  Wifi,
  WifiOff,
  Share,
  MessageSquare,
  FileText,
  X,
  Save,
  ExternalLink,
  Copy,
  Globe,
  Headphones,
  Volume2,
  VolumeX,
  Timer,
  Stethoscope,
  Heart,
  Brain
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { TelemedicineSession, TelemedicineSessionStatus, PatientProfile, VirtualMeetingInfo } from '@/app/types';
import { cn } from '@/lib/utils';

interface TelemedicineSessionWithPatient extends TelemedicineSession {
  patient?: PatientProfile;
}

export default function TelemedicinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<TelemedicineSessionWithPatient[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TelemedicineSessionWithPatient[]>([]);
  const [selectedSession, setSelectedSession] = useState<TelemedicineSessionWithPatient | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TelemedicineSessionStatus | 'all'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({ start: null, end: null });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New session form state
  const [newSession, setNewSession] = useState({
    patientId: '',
    title: '',
    description: '',
    scheduledTime: new Date(),
    duration: 30,
    virtualMeeting: {
      platform: 'zoom' as const,
      link: '',
      password: '',
      instructions: ''
    }
  });

  // Edit session form state
  const [editSession, setEditSession] = useState<Partial<TelemedicineSession>>({});

  const statusOptions: { value: TelemedicineSessionStatus; label: string; color: string }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'waiting', label: 'Waiting', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'completed', label: 'Completed', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    { value: 'technical_issues', label: 'Technical Issues', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
    { value: 'no_show', label: 'No Show', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' }
  ];

  const platformOptions = [
    { value: 'zoom', label: 'Zoom', icon: <Video className="h-4 w-4" /> },
    { value: 'google_meet', label: 'Google Meet', icon: <Video className="h-4 w-4" /> },
    { value: 'microsoft_teams', label: 'Microsoft Teams', icon: <Video className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom Platform', icon: <Globe className="h-4 w-4" /> }
  ];

  const getStatusColor = (status: TelemedicineSessionStatus) => {
    return statusOptions.find(opt => opt.value === status)?.color || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
  };

  const getStatusLabel = (status: TelemedicineSessionStatus) => {
    return statusOptions.find(opt => opt.value === status)?.label || 'Unknown';
  };

  const getStatusIcon = (status: TelemedicineSessionStatus) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'waiting':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Video className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      case 'technical_issues':
        return <AlertCircle className="h-4 w-4" />;
      case 'no_show':
        return <User className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'google_meet':
        return <Video className="h-4 w-4 text-green-600" />;
      case 'microsoft_teams':
        return <Video className="h-4 w-4 text-purple-600" />;
      default:
        return <Globe className="h-4 w-4 text-zinc-600" />;
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, selectedStatus, selectedPatient, dateRange]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load patients first
      const patientsResponse = await DoctorService.getDoctorPatients(user.id);
      if (patientsResponse.error) {
        throw new Error(patientsResponse.error.message);
      }
      setPatients(patientsResponse.data || []);

      // Load telemedicine sessions
      const sessionsResponse = await DoctorService.getTelemedicineSessions(user.id);
      if (sessionsResponse.error) {
        throw new Error(sessionsResponse.error.message);
      }
      
      // Enrich sessions with patient information
      const enrichedSessions = (sessionsResponse.data || []).map(session => {
        const patient = patientsResponse.data?.find(p => p.id === session.patientId);
        return { ...session, patient };
      });
      
      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error loading telemedicine sessions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load telemedicine sessions');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(session => session.status === selectedStatus);
    }

    // Patient filter
    if (selectedPatient !== 'all') {
      filtered = filtered.filter(session => session.patientId === selectedPatient);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(session => new Date(session.scheduledTime) >= dateRange.start!);
    }
    if (dateRange.end) {
      filtered = filtered.filter(session => new Date(session.scheduledTime) <= dateRange.end!);
    }

    setFilteredSessions(filtered);
  };

  const handleCreateSession = async () => {
    if (!user?.id || !newSession.patientId || !newSession.title) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const sessionData = {
        ...newSession,
        doctorId: user.id,
        status: 'scheduled' as TelemedicineSessionStatus
      };
      
      const response = await DoctorService.createTelemedicineSession(sessionData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setIsCreateDialogOpen(false);
      setNewSession({
        patientId: '',
        title: '',
        description: '',
        scheduledTime: new Date(),
        duration: 30,
        virtualMeeting: {
          platform: 'zoom',
          link: '',
          password: '',
          instructions: ''
        }
      });
      
      await loadData();
    } catch (error) {
      console.error('Error creating telemedicine session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create telemedicine session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSession = async () => {
    if (!selectedSession?.id) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await DoctorService.updateTelemedicineSession(selectedSession.id, editSession);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setIsEditDialogOpen(false);
      setSelectedSession(null);
      setEditSession({});
      
      await loadData();
    } catch (error) {
      console.error('Error updating telemedicine session:', error);
      setError(error instanceof Error ? error.message : 'Failed to update telemedicine session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinSession = (session: TelemedicineSessionWithPatient) => {
    if (session.virtualMeeting.link) {
      window.open(session.virtualMeeting.link, '_blank');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await DoctorService.updateTelemedicineSession(sessionId, {
        status: 'in_progress',
        startTime: new Date()
      });
      await loadData();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await DoctorService.updateTelemedicineSession(sessionId, {
        status: 'completed',
        endTime: new Date()
      });
      await loadData();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/doctor/patients/${patientId}`);
  };

  const handleSessionDetail = (session: TelemedicineSessionWithPatient) => {
    setSelectedSession(session);
    setIsSessionDetailOpen(true);
  };

  const handleEditClick = (session: TelemedicineSessionWithPatient) => {
    setSelectedSession(session);
    setEditSession({
      title: session.title,
      description: session.description,
      scheduledTime: session.scheduledTime,
      duration: session.duration,
      virtualMeeting: {
        platform: session.virtualMeeting?.platform || 'zoom',
        link: session.virtualMeeting?.link || '',
        password: session.virtualMeeting?.password || '',
        instructions: session.virtualMeeting?.instructions || ''
      },
      sessionNotes: session.sessionNotes,
      status: session.status
    });
    setIsEditDialogOpen(true);
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Telemedicine</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage virtual consultations and remote care
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Telemedicine</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage virtual consultations and remote care
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Telemedicine Session</DialogTitle>
                <DialogDescription>
                  Create a new virtual consultation session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient</Label>
                    <Select value={newSession.patientId} onValueChange={(value) => setNewSession(prev => ({ ...prev, patientId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select value={newSession.duration.toString()} onValueChange={(value) => setNewSession(prev => ({ ...prev, duration: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter session title..."
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter session description..."
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduled-time">Scheduled Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newSession.scheduledTime, "PPP pp")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newSession.scheduledTime}
                        onSelect={(date) => date && setNewSession(prev => ({ ...prev, scheduledTime: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-base font-medium">Virtual Meeting Details</Label>
                  
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={newSession.virtualMeeting.platform} onValueChange={(value) => setNewSession(prev => ({ ...prev, virtualMeeting: { ...prev.virtualMeeting, platform: value as any } }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting-link">Meeting Link</Label>
                    <Input
                      id="meeting-link"
                      placeholder="Enter meeting link..."
                      value={newSession.virtualMeeting.link}
                      onChange={(e) => setNewSession(prev => ({ ...prev, virtualMeeting: { ...prev.virtualMeeting, link: e.target.value } }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting-password">Meeting Password (optional)</Label>
                    <Input
                      id="meeting-password"
                      placeholder="Enter meeting password..."
                      value={newSession.virtualMeeting.password}
                      onChange={(e) => setNewSession(prev => ({ ...prev, virtualMeeting: { ...prev.virtualMeeting, password: e.target.value } }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Special instructions for the patient..."
                      value={newSession.virtualMeeting.instructions}
                      onChange={(e) => setNewSession(prev => ({ ...prev, virtualMeeting: { ...prev.virtualMeeting, instructions: e.target.value } }))}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSession}
                  disabled={submitting || !newSession.patientId || !newSession.title}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Schedule Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="search"
                  placeholder="Search sessions, patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TelemedicineSessionStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="patient">Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Video className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-zinc-500">
              {filteredSessions.length} filtered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => new Date(s.scheduledTime).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-xs text-zinc-500">
              Scheduled for today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'in_progress').length}
            </div>
            <p className="text-xs text-zinc-500">
              Active sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-zinc-500">
              Sessions completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Telemedicine Sessions</CardTitle>
          <CardDescription>
            Manage your virtual consultations and remote care sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.patient?.profileImageUrl} />
                        <AvatarFallback>
                          {session.patient?.firstName?.[0]}{session.patient?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {session.patient?.firstName} {session.patient?.lastName}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {session.patient?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.title}</div>
                      <div className="text-sm text-zinc-500 truncate max-w-xs">
                        {session.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {format(new Date(session.scheduledTime), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {format(new Date(session.scheduledTime), 'h:mm a')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-zinc-500" />
                      {session.duration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(session.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(session.status)}
                        {getStatusLabel(session.status)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getPlatformIcon(session.virtualMeeting.platform)}
                      <span className="text-sm capitalize">
                        {session.virtualMeeting.platform.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {session.status === 'scheduled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartSession(session.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {session.status === 'in_progress' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleJoinSession(session)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompleteSession(session.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {(session.status === 'scheduled' || session.status === 'waiting') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleJoinSession(session)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSessionDetail(session)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(session)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPatient(session.patientId)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500">No telemedicine sessions found</p>
              <p className="text-sm text-zinc-400">
                {searchTerm || selectedStatus !== 'all' || selectedPatient !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Schedule your first telemedicine session to get started'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Telemedicine Session</DialogTitle>
            <DialogDescription>
              Update the virtual consultation session details
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Select 
                    value={editSession.duration?.toString() || '30'} 
                    onValueChange={(value) => setEditSession(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editSession.status || 'scheduled'} 
                    onValueChange={(value) => setEditSession(prev => ({ ...prev, status: value as TelemedicineSessionStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-title">Session Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter session title..."
                  value={editSession.title || ''}
                  onChange={(e) => setEditSession(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter session description..."
                  value={editSession.description || ''}
                  onChange={(e) => setEditSession(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-scheduled-time">Scheduled Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editSession.scheduledTime ? format(new Date(editSession.scheduledTime), "PPP pp") : "Select date and time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editSession.scheduledTime ? new Date(editSession.scheduledTime) : undefined}
                      onSelect={(date) => date && setEditSession(prev => ({ ...prev, scheduledTime: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-medium">Virtual Meeting Details</Label>
                
                <div>
                  <Label htmlFor="edit-platform">Platform</Label>
                  <Select 
                    value={editSession.virtualMeeting?.platform || 'zoom'} 
                    onValueChange={(value) => setEditSession(prev => ({ 
                      ...prev, 
                      virtualMeeting: { 
                        platform: value as any,
                        link: prev.virtualMeeting?.link || '',
                        password: prev.virtualMeeting?.password || '',
                        instructions: prev.virtualMeeting?.instructions || ''
                      } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-meeting-link">Meeting Link</Label>
                  <Input
                    id="edit-meeting-link"
                    placeholder="Enter meeting link..."
                    value={editSession.virtualMeeting?.link || ''}
                    onChange={(e) => setEditSession(prev => ({ 
                      ...prev, 
                      virtualMeeting: { 
                        platform: prev.virtualMeeting?.platform || 'zoom',
                        link: e.target.value,
                        password: prev.virtualMeeting?.password || '',
                        instructions: prev.virtualMeeting?.instructions || ''
                      } 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-meeting-password">Meeting Password (optional)</Label>
                  <Input
                    id="edit-meeting-password"
                    placeholder="Enter meeting password..."
                    value={editSession.virtualMeeting?.password || ''}
                    onChange={(e) => setEditSession(prev => ({ 
                      ...prev, 
                      virtualMeeting: { 
                        platform: prev.virtualMeeting?.platform || 'zoom',
                        link: prev.virtualMeeting?.link || '',
                        password: e.target.value,
                        instructions: prev.virtualMeeting?.instructions || ''
                      } 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-instructions">Instructions</Label>
                  <Textarea
                    id="edit-instructions"
                    placeholder="Special instructions for the patient..."
                    value={editSession.virtualMeeting?.instructions || ''}
                    onChange={(e) => setEditSession(prev => ({ 
                      ...prev, 
                      virtualMeeting: { 
                        platform: prev.virtualMeeting?.platform || 'zoom',
                        link: prev.virtualMeeting?.link || '',
                        password: prev.virtualMeeting?.password || '',
                        instructions: e.target.value
                      } 
                    }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-session-notes">Session Notes</Label>
                  <Textarea
                    id="edit-session-notes"
                    placeholder="Add session notes..."
                    value={editSession.sessionNotes || ''}
                    onChange={(e) => setEditSession(prev => ({ ...prev, sessionNotes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSession}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Update Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={isSessionDetailOpen} onOpenChange={setIsSessionDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Telemedicine Session Details
            </DialogTitle>
            <DialogDescription>
              {selectedSession && `${selectedSession.patient?.firstName} ${selectedSession.patient?.lastName} - ${format(new Date(selectedSession.scheduledTime), 'PPP pp')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Patient</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedSession.patient?.profileImageUrl} />
                      <AvatarFallback>
                        {selectedSession.patient?.firstName?.[0]}{selectedSession.patient?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedSession.patient?.firstName} {selectedSession.patient?.lastName}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {selectedSession.patient?.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedSession.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedSession.status)}
                        {getStatusLabel(selectedSession.status)}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Scheduled Time</Label>
                  <p className="mt-1 text-sm">{format(new Date(selectedSession.scheduledTime), 'PPP pp')}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Duration</Label>
                  <p className="mt-1 text-sm">{selectedSession.duration} minutes</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-zinc-500">Session Title</Label>
                <p className="mt-1 text-sm">{selectedSession.title}</p>
              </div>
              
              {selectedSession.description && (
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Description</Label>
                  <p className="mt-1 text-sm">{selectedSession.description}</p>
                </div>
              )}
              
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-medium">Virtual Meeting Details</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-zinc-500">Platform</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getPlatformIcon(selectedSession.virtualMeeting.platform)}
                      <span className="text-sm capitalize">
                        {selectedSession.virtualMeeting.platform.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-zinc-500">Meeting Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm truncate flex-1">{selectedSession.virtualMeeting.link}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMeetingLink(selectedSession.virtualMeeting.link)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleJoinSession(selectedSession)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {selectedSession.virtualMeeting.password && (
                  <div>
                    <Label className="text-sm font-medium text-zinc-500">Meeting Password</Label>
                    <p className="mt-1 text-sm">{selectedSession.virtualMeeting.password}</p>
                  </div>
                )}
                
                {selectedSession.virtualMeeting.instructions && (
                  <div>
                    <Label className="text-sm font-medium text-zinc-500">Instructions</Label>
                    <p className="mt-1 text-sm">{selectedSession.virtualMeeting.instructions}</p>
                  </div>
                )}
              </div>
              
              {selectedSession.sessionNotes && (
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Session Notes</Label>
                  <p className="mt-1 text-sm">{selectedSession.sessionNotes}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <div>Created: {format(new Date(selectedSession.createdAt), 'PPP pp')}</div>
                  <div>Updated: {format(new Date(selectedSession.updatedAt), 'PPP pp')}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsSessionDetailOpen(false)}>
              Close
            </Button>
            {selectedSession && (
              <>
                {selectedSession.status === 'scheduled' && (
                  <Button 
                    onClick={() => {
                      setIsSessionDetailOpen(false);
                      handleJoinSession(selectedSession);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setIsSessionDetailOpen(false);
                    handleEditClick(selectedSession);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Session
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
