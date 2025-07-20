"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Video,
  Phone,
  User,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  Square,
  Users,
  Activity,
  CalendarDays,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  Heart,
  Thermometer,
  Zap,
  Clipboard,
  Pill,
  TestTube,
  UserCheck,
  Star,
  MessageCircle,
  Phone as PhoneIcon,
  Video as VideoIcon,
  Mail,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User as UserIcon,
  AlertTriangle,
  Info,
  ExternalLink,
  PlayCircle,
  PauseCircle,
  ArrowRight,
  ArrowLeft,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, parseISO, formatDistanceToNow, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/app/contexts/auth-context';
import { ConsultationService } from '@/lib/firestore/consultation-service';
import { 
  Consultation, 
  ConsultationStatus, 
  ConsultationType, 
  ConsultationPriority, 
  PatientProfile 
} from '@/app/types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsultationWithPatient extends Consultation {
  patient?: PatientProfile;
}

export default function DoctorConsultationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<ConsultationWithPatient[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationWithPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithPatient | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<ConsultationWithPatient | null>(null);

  // Load consultations on component mount
  useEffect(() => {
    if (user?.id) {
      loadConsultations();
    }
  }, [user, dateFilter]);

  // Filter and sort consultations when filters change
  useEffect(() => {
    filterAndSortConsultations();
  }, [consultations, searchTerm, statusFilter, typeFilter, priorityFilter, sortBy, sortOrder]);

  // Real-time subscription for today's consultations
  useEffect(() => {
    if (user?.id && dateFilter === 'today') {
      const today = new Date();
      const unsubscribe = ConsultationService.subscribeToConsultations(
        user.id,
        { 
          date: today,
          status: ['scheduled', 'waiting', 'in_progress', 'paused'] 
        },
        (updatedConsultations) => {
          setConsultations(prev => {
            const nonTodayConsultations = prev.filter(c => !isToday(c.date));
            return [...nonTodayConsultations, ...updatedConsultations];
          });
        }
      );

      return () => unsubscribe();
    }
  }, [user?.id, dateFilter]);

  const loadConsultations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const dateRange = getDateRange(dateFilter);
      
      const response = await ConsultationService.getDoctorConsultations(user.id, {
        dateRange,
        pagination: { page: 1, limit: 100 },
        filters: { sortBy, sortOrder }
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setConsultations(response.data.consultations);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      setError('Failed to load consultations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (filter: string) => {
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return {
          startDate: startOfDay(today),
          endDate: endOfDay(today)
        };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return {
          startDate: startOfDay(yesterday),
          endDate: endOfDay(yesterday)
        };
      case 'tomorrow':
        const tomorrow = addDays(today, 1);
        return {
          startDate: startOfDay(tomorrow),
          endDate: endOfDay(tomorrow)
        };
      case 'week':
        return {
          startDate: startOfDay(subDays(today, 7)),
          endDate: endOfDay(today)
        };
      case 'month':
        return {
          startDate: startOfDay(subDays(today, 30)),
          endDate: endOfDay(today)
        };
      default:
        return {
          startDate: startOfDay(today),
          endDate: endOfDay(today)
        };
    }
  };

  const filterAndSortConsultations = () => {
    let filtered = [...consultations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(consultation =>
        consultation.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.diagnosis?.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
        consultation.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'startTime':
          aValue = a.startTime;
          bValue = b.startTime;
          break;
        case 'patient':
          aValue = `${a.patient?.firstName} ${a.patient?.lastName}`;
          bValue = `${b.patient?.firstName} ${b.patient?.lastName}`;
          break;
        case 'priority':
          const priorityOrder = { 'emergency': 5, 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredConsultations(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConsultations();
    setRefreshing(false);
    toast.success('Consultations refreshed');
  };

  const handleStatusChange = async (consultationId: string, newStatus: ConsultationStatus) => {
    if (!user?.id) return;

    try {
      const additionalData: any = {};
      
      if (newStatus === 'in_progress') {
        additionalData.actualStartTime = new Date();
      } else if (newStatus === 'completed') {
        additionalData.actualEndTime = new Date();
      }

      const response = await ConsultationService.updateConsultationStatus(
        consultationId,
        newStatus,
        user.id,
        additionalData
      );

      if (response.error) {
        toast.error(response.error.message);
        return;
      }

      // Update local state
      setConsultations(prev => 
        prev.map(c => 
          c.id === consultationId 
            ? { ...c, status: newStatus, ...additionalData }
            : c
        )
      );

      toast.success(`Consultation ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast.error('Failed to update consultation status');
    }
  };

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
      case 'waiting':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'no_show':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'follow_up_required':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
    }
  };

  const getPriorityColor = (priority: ConsultationPriority) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
    }
  };

  const getTypeBadgeIcon = (type: ConsultationType) => {
    switch (type) {
      case 'general_consultation':
        return <Stethoscope className="h-3 w-3" />;
      case 'follow_up':
        return <RefreshCw className="h-3 w-3" />;
      case 'emergency':
        return <AlertTriangle className="h-3 w-3" />;
      case 'telemedicine':
        return <Video className="h-3 w-3" />;
      case 'medication_review':
        return <Pill className="h-3 w-3" />;
      case 'lab_review':
        return <TestTube className="h-3 w-3" />;
      case 'routine_checkup':
        return <UserCheck className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMM d, yyyy');
  };

  const getConsultationsByStatus = (status: ConsultationStatus) => {
    return filteredConsultations.filter(c => c.status === status);
  };

  const renderConsultationCard = (consultation: ConsultationWithPatient) => (
    <motion.div
      key={consultation.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={consultation.patient?.profileImageUrl} />
                <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                  {consultation.patient?.firstName?.[0]}{consultation.patient?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {consultation.patient?.firstName} {consultation.patient?.lastName}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDate(consultation.date)} • {formatTime(consultation.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(consultation.priority)}>
                {consultation.priority}
              </Badge>
              <Badge className={getStatusColor(consultation.status)}>
                {consultation.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            {getTypeBadgeIcon(consultation.type)}
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {consultation.type.replace('_', ' ')}
            </span>
          </div>
          
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Chief Complaint:</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {consultation.chiefComplaint || consultation.reason || 'No complaint specified'}
            </p>
          </div>

          {consultation.symptoms && consultation.symptoms.length > 0 && (
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Symptoms:</p>
              <div className="flex flex-wrap gap-1">
                {consultation.symptoms.slice(0, 3).map((symptom, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
                {consultation.symptoms.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{consultation.symptoms.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {consultation.duration && (
            <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4" />
              <span>{consultation.duration} minutes</span>
            </div>
          )}

          {consultation.virtualMeeting && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <Video className="h-4 w-4" />
              <span>Virtual consultation</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {consultation.status === 'scheduled' && (
                <Button 
                  size="sm"
                  onClick={() => handleStatusChange(consultation.id, 'in_progress')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {consultation.status === 'in_progress' && (
                <div className="flex space-x-1">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(consultation.id, 'paused')}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleStatusChange(consultation.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              )}
              {consultation.status === 'paused' && (
                <Button 
                  size="sm"
                  onClick={() => handleStatusChange(consultation.id, 'in_progress')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              )}
              {consultation.status === 'waiting' && (
                <Button 
                  size="sm"
                  onClick={() => handleStatusChange(consultation.id, 'in_progress')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedConsultation(consultation);
                  setShowDetails(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push(`/doctor/consultations/${consultation.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderQuickStats = () => {
    const today = filteredConsultations.filter(c => isToday(c.date));
    const inProgress = today.filter(c => c.status === 'in_progress');
    const completed = today.filter(c => c.status === 'completed');
    const waiting = today.filter(c => c.status === 'waiting');
    const scheduled = today.filter(c => c.status === 'scheduled');

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Today</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{today.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgress.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completed.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Waiting</p>
                <p className="text-2xl font-bold text-amber-600">{waiting.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Scheduled</p>
                <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">{scheduled.length}</p>
              </div>
              <Timer className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6 border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search consultations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general_consultation">General</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="telemedicine">Telemedicine</SelectItem>
                <SelectItem value="medication_review">Medication Review</SelectItem>
                <SelectItem value="lab_review">Lab Review</SelectItem>
                <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="shrink-0"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Consultations</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Manage your patient consultations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Consultations</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Manage your patient consultations</p>
          </div>
        </div>
        <Alert className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={loadConsultations} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Consultations</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your patient consultations • {filteredConsultations.length} consultations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
          >
            {viewMode === 'cards' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Consultations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredConsultations.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({getConsultationsByStatus('scheduled').length})</TabsTrigger>
          <TabsTrigger value="waiting">Waiting ({getConsultationsByStatus('waiting').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({getConsultationsByStatus('in_progress').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({getConsultationsByStatus('completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AnimatePresence>
            {filteredConsultations.length === 0 ? (
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Stethoscope className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    No consultations found
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {dateFilter === 'today' ? 'No consultations scheduled for today' : 'No consultations match your current filters'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultations.map(consultation => renderConsultationCard(consultation))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {['scheduled', 'waiting', 'in_progress', 'completed'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            <AnimatePresence>
              {getConsultationsByStatus(status as ConsultationStatus).length === 0 ? (
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <Stethoscope className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      No {status.replace('_', ' ')} consultations
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      No consultations with {status.replace('_', ' ')} status found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getConsultationsByStatus(status as ConsultationStatus).map(consultation => 
                    renderConsultationCard(consultation)
                  )}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      {/* Consultation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-red-600" />
              <span>Consultation Details</span>
            </DialogTitle>
            <DialogDescription>
              View detailed information about this consultation
            </DialogDescription>
          </DialogHeader>
          
          {selectedConsultation && (
            <div className="space-y-6">
              {/* Patient & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedConsultation.patient?.profileImageUrl} />
                        <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                          {selectedConsultation.patient?.firstName?.[0]}{selectedConsultation.patient?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {selectedConsultation.patient?.firstName} {selectedConsultation.patient?.lastName}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedConsultation.patient?.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedConsultation.patient?.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedConsultation.patient?.dateOfBirth ? 
                            format(selectedConsultation.patient.dateOfBirth, 'MMM d, yyyy') : 
                            'Date of birth not available'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Consultation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Status:</span>
                      <Badge className={getStatusColor(selectedConsultation.status)}>
                        {selectedConsultation.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Priority:</span>
                      <Badge className={getPriorityColor(selectedConsultation.priority)}>
                        {selectedConsultation.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Type:</span>
                      <div className="flex items-center space-x-1">
                        {getTypeBadgeIcon(selectedConsultation.type)}
                        <span className="text-sm text-zinc-900 dark:text-zinc-100">
                          {selectedConsultation.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Date & Time:</span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">
                        {formatDate(selectedConsultation.date)} • {formatTime(selectedConsultation.startTime)}
                      </span>
                    </div>
                    {selectedConsultation.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Duration:</span>
                        <span className="text-sm text-zinc-900 dark:text-zinc-100">
                          {selectedConsultation.duration} minutes
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chief Complaint & Symptoms */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Chief Complaint & Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      Chief Complaint:
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {selectedConsultation.chiefComplaint || selectedConsultation.reason || 'Not specified'}
                    </p>
                  </div>
                  {selectedConsultation.symptoms && selectedConsultation.symptoms.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        Symptoms:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedConsultation.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vitals */}
              {selectedConsultation.vitals && (
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedConsultation.vitals.temperature && (
                        <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Thermometer className="h-6 w-6 text-red-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {selectedConsultation.vitals.temperature}°C
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Temperature</p>
                        </div>
                      )}
                      {selectedConsultation.vitals.bloodPressure && (
                        <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Heart className="h-6 w-6 text-red-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {selectedConsultation.vitals.bloodPressure.systolic}/{selectedConsultation.vitals.bloodPressure.diastolic}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Blood Pressure</p>
                        </div>
                      )}
                      {selectedConsultation.vitals.heartRate && (
                        <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Activity className="h-6 w-6 text-red-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {selectedConsultation.vitals.heartRate} BPM
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Heart Rate</p>
                        </div>
                      )}
                      {selectedConsultation.vitals.oxygenSaturation && (
                        <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Zap className="h-6 w-6 text-red-600 mx-auto mb-1" />
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {selectedConsultation.vitals.oxygenSaturation}%
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Oxygen Saturation</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedConsultation.notes && (
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {selectedConsultation.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
