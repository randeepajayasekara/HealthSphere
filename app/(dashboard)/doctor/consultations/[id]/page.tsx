"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Save,
  Edit,
  Plus,
  X,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Zap,
  Stethoscope,
  FileText,
  Pill,
  TestTube,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Info,
  Play,
  Pause,
  Square,
  Timer,
  Printer,
  Download,
  Share,
  Eye,
  MessageCircle,
  Video,
  Phone as PhoneIcon,
  RefreshCw,
  Loader2,
  Star,
  AlertTriangle,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Clipboard,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
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
import { motion } from 'framer-motion';

interface ConsultationWithPatient extends Consultation {
  patient?: PatientProfile;
}

export default function ConsultationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const consultationId = params.id as string;
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<ConsultationWithPatient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedConsultation, setEditedConsultation] = useState<Partial<Consultation>>({});
  
  // Form states
  const [newSymptom, setNewSymptom] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [newLabOrder, setNewLabOrder] = useState({
    testName: '',
    priority: 'routine' as 'routine' | 'urgent' | 'stat',
    instructions: ''
  });
  const [newReferral, setNewReferral] = useState({
    specialistName: '',
    specialty: '',
    reason: '',
    priority: 'routine' as 'routine' | 'urgent',
    notes: ''
  });

  // Load consultation data
  useEffect(() => {
    if (consultationId && user?.id) {
      loadConsultation();
    }
  }, [consultationId, user?.id]);

  const loadConsultation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ConsultationService.getConsultationWithPatient(consultationId);
      
      if (response.error) {
        setError(response.error.message);
        return;
      }
      
      if (response.data) {
        setConsultation(response.data);
        setEditedConsultation(response.data);
      }
    } catch (error) {
      console.error('Error loading consultation:', error);
      setError('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!consultation || !user?.id) return;

    try {
      setSaving(true);
      
      const response = await ConsultationService.updateConsultation(
        consultation.id,
        editedConsultation,
        user.id
      );

      if (response.error) {
        toast.error(response.error.message);
        return;
      }

      if (response.data) {
        setConsultation(prev => prev ? { ...prev, ...response.data } : response.data as ConsultationWithPatient);
        setIsEditing(false);
        toast.success('Consultation updated successfully');
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast.error('Failed to save consultation');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: ConsultationStatus) => {
    if (!consultation || !user?.id) return;

    try {
      const additionalData: any = {};
      
      if (newStatus === 'in_progress') {
        additionalData.actualStartTime = new Date();
      } else if (newStatus === 'completed') {
        additionalData.actualEndTime = new Date();
      }

      const response = await ConsultationService.updateConsultationStatus(
        consultation.id,
        newStatus,
        user.id,
        additionalData
      );

      if (response.error) {
        toast.error(response.error.message);
        return;
      }

      setConsultation(prev => prev ? { ...prev, status: newStatus, ...additionalData } : null);
      toast.success(`Consultation ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast.error('Failed to update consultation status');
    }
  };

  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    
    const currentSymptoms = editedConsultation.symptoms || [];
    setEditedConsultation(prev => ({
      ...prev,
      symptoms: [...currentSymptoms, newSymptom.trim()]
    }));
    setNewSymptom('');
  };

  const removeSymptom = (index: number) => {
    const currentSymptoms = editedConsultation.symptoms || [];
    setEditedConsultation(prev => ({
      ...prev,
      symptoms: currentSymptoms.filter((_, i) => i !== index)
    }));
  };

  const addDiagnosis = () => {
    if (!newDiagnosis.trim()) return;
    
    const currentDiagnoses = editedConsultation.diagnosis || [];
    setEditedConsultation(prev => ({
      ...prev,
      diagnosis: [...currentDiagnoses, newDiagnosis.trim()]
    }));
    setNewDiagnosis('');
  };

  const removeDiagnosis = (index: number) => {
    const currentDiagnoses = editedConsultation.diagnosis || [];
    setEditedConsultation(prev => ({
      ...prev,
      diagnosis: currentDiagnoses.filter((_, i) => i !== index)
    }));
  };

  const addPrescription = () => {
    if (!newPrescription.medicationName.trim()) return;
    
    const currentPrescriptions = editedConsultation.prescriptions || [];
    setEditedConsultation(prev => ({
      ...prev,
      prescriptions: [...currentPrescriptions, {
        medicationId: `temp-${Date.now()}`,
        ...newPrescription
      }]
    }));
    setNewPrescription({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const removePrescription = (index: number) => {
    const currentPrescriptions = editedConsultation.prescriptions || [];
    setEditedConsultation(prev => ({
      ...prev,
      prescriptions: currentPrescriptions.filter((_, i) => i !== index)
    }));
  };

  const addLabOrder = () => {
    if (!newLabOrder.testName.trim()) return;
    
    const currentLabOrders = editedConsultation.labOrders || [];
    setEditedConsultation(prev => ({
      ...prev,
      labOrders: [...currentLabOrders, {
        testId: `temp-${Date.now()}`,
        ...newLabOrder
      }]
    }));
    setNewLabOrder({
      testName: '',
      priority: 'routine',
      instructions: ''
    });
  };

  const removeLabOrder = (index: number) => {
    const currentLabOrders = editedConsultation.labOrders || [];
    setEditedConsultation(prev => ({
      ...prev,
      labOrders: currentLabOrders.filter((_, i) => i !== index)
    }));
  };

  const addReferral = () => {
    if (!newReferral.specialistName.trim() || !newReferral.specialty.trim()) return;
    
    const currentReferrals = editedConsultation.referrals || [];
    setEditedConsultation(prev => ({
      ...prev,
      referrals: [...currentReferrals, newReferral]
    }));
    setNewReferral({
      specialistName: '',
      specialty: '',
      reason: '',
      priority: 'routine',
      notes: ''
    });
  };

  const removeReferral = (index: number) => {
    const currentReferrals = editedConsultation.referrals || [];
    setEditedConsultation(prev => ({
      ...prev,
      referrals: currentReferrals.filter((_, i) => i !== index)
    }));
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()} disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                    <div className="h-20 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Consultation Details</h1>
        </div>
        <Alert className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={loadConsultation} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Consultation Not Found</h1>
        </div>
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-12 text-center">
            <Stethoscope className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Consultation not found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              The consultation you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Consultation Details
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {consultation.patient?.firstName} {consultation.patient?.lastName} • {format(consultation.date, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {consultation.status === 'scheduled' && (
            <Button 
              onClick={() => handleStatusChange('in_progress')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
          )}
          {consultation.status === 'in_progress' && (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => handleStatusChange('paused')}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button 
                onClick={() => handleStatusChange('completed')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          )}
          {consultation.status === 'paused' && (
            <Button 
              onClick={() => handleStatusChange('in_progress')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          {isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedConsultation(consultation);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="examination">Examination</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Chief Complaint */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.chiefComplaint || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                      placeholder="Enter chief complaint..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {consultation.chiefComplaint || consultation.reason || 'No chief complaint specified'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Symptoms */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Symptoms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          value={newSymptom}
                          onChange={(e) => setNewSymptom(e.target.value)}
                          placeholder="Add symptom..."
                          onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                        />
                        <Button onClick={addSymptom} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editedConsultation.symptoms || []).map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{symptom}</span>
                            <button
                              onClick={() => removeSymptom(index)}
                              className="ml-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {consultation.symptoms && consultation.symptoms.length > 0 ? (
                        consultation.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary">
                            {symptom}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-zinc-500 dark:text-zinc-400">No symptoms recorded</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History of Present Illness */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">History of Present Illness</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.historyOfPresentIllness || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                      placeholder="Enter history of present illness..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {consultation.historyOfPresentIllness || 'No history of present illness recorded'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examination" className="space-y-6">
              {/* Vital Signs */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Vital Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="temperature">Temperature (°C)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          value={editedConsultation.vitals?.temperature || ''}
                          onChange={(e) => setEditedConsultation(prev => ({
                            ...prev,
                            vitals: { ...prev.vitals, temperature: parseFloat(e.target.value) || undefined }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                        <Input
                          id="heartRate"
                          type="number"
                          value={editedConsultation.vitals?.heartRate || ''}
                          onChange={(e) => setEditedConsultation(prev => ({
                            ...prev,
                            vitals: { ...prev.vitals, heartRate: parseInt(e.target.value) || undefined }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="systolic">Systolic BP</Label>
                        <Input
                          id="systolic"
                          type="number"
                          value={editedConsultation.vitals?.bloodPressure?.systolic || ''}
                          onChange={(e) => setEditedConsultation(prev => ({
                            ...prev,
                            vitals: { 
                              ...prev.vitals, 
                              bloodPressure: { 
                                ...prev.vitals?.bloodPressure, 
                                systolic: parseInt(e.target.value) || 0,
                                diastolic: prev.vitals?.bloodPressure?.diastolic || 0
                              }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diastolic">Diastolic BP</Label>
                        <Input
                          id="diastolic"
                          type="number"
                          value={editedConsultation.vitals?.bloodPressure?.diastolic || ''}
                          onChange={(e) => setEditedConsultation(prev => ({
                            ...prev,
                            vitals: { 
                              ...prev.vitals, 
                              bloodPressure: { 
                                ...prev.vitals?.bloodPressure, 
                                diastolic: parseInt(e.target.value) || 0,
                                systolic: prev.vitals?.bloodPressure?.systolic || 0
                              }
                            }
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {consultation.vitals?.temperature && (
                        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Thermometer className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {consultation.vitals.temperature}°C
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Temperature</p>
                        </div>
                      )}
                      {consultation.vitals?.heartRate && (
                        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {consultation.vitals.heartRate} BPM
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Heart Rate</p>
                        </div>
                      )}
                      {consultation.vitals?.bloodPressure && (
                        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {consultation.vitals.bloodPressure.systolic}/{consultation.vitals.bloodPressure.diastolic}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Blood Pressure</p>
                        </div>
                      )}
                      {consultation.vitals?.oxygenSaturation && (
                        <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                          <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {consultation.vitals.oxygenSaturation}%
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Oxygen Saturation</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Physical Examination */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Physical Examination</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.physicalExamination || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, physicalExamination: e.target.value }))}
                      placeholder="Enter physical examination findings..."
                      rows={5}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {consultation.physicalExamination || 'No physical examination findings recorded'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnosis" className="space-y-6">
              {/* Assessment */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.assessment || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, assessment: e.target.value }))}
                      placeholder="Enter assessment..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {consultation.assessment || 'No assessment recorded'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Diagnoses */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Diagnoses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          value={newDiagnosis}
                          onChange={(e) => setNewDiagnosis(e.target.value)}
                          placeholder="Add diagnosis..."
                          onKeyPress={(e) => e.key === 'Enter' && addDiagnosis()}
                        />
                        <Button onClick={addDiagnosis} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(editedConsultation.diagnosis || []).map((diagnosis, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <span className="text-zinc-900 dark:text-zinc-100">{diagnosis}</span>
                            <button
                              onClick={() => removeDiagnosis(index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {consultation.diagnosis && consultation.diagnosis.length > 0 ? (
                        consultation.diagnosis.map((diagnosis, index) => (
                          <div key={index} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <span className="text-zinc-900 dark:text-zinc-100">{diagnosis}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 dark:text-zinc-400">No diagnoses recorded</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatment" className="space-y-6">
              {/* Treatment Plan */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.treatmentPlan || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                      placeholder="Enter treatment plan..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {consultation.treatmentPlan || 'No treatment plan recorded'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Pill className="h-5 w-5" />
                    <span>Prescriptions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medicationName">Medication Name</Label>
                          <Input
                            id="medicationName"
                            value={newPrescription.medicationName}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, medicationName: e.target.value }))}
                            placeholder="Enter medication name..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input
                            id="dosage"
                            value={newPrescription.dosage}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="frequency">Frequency</Label>
                          <Input
                            id="frequency"
                            value={newPrescription.frequency}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Input
                            id="duration"
                            value={newPrescription.duration}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={newPrescription.instructions}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Enter special instructions..."
                          rows={2}
                        />
                      </div>
                      <Button onClick={addPrescription} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prescription
                      </Button>
                      <div className="space-y-2">
                        {(editedConsultation.prescriptions || []).map((prescription, index) => (
                          <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                  {prescription.medicationName}
                                </h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                  {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                                </p>
                                {prescription.instructions && (
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    {prescription.instructions}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removePrescription(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                        consultation.prescriptions.map((prescription, index) => (
                          <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                              {prescription.medicationName}
                            </h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                            </p>
                            {prescription.instructions && (
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                {prescription.instructions}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 dark:text-zinc-400">No prescriptions recorded</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lab Orders */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TestTube className="h-5 w-5" />
                    <span>Lab Orders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="testName">Test Name</Label>
                          <Input
                            id="testName"
                            value={newLabOrder.testName}
                            onChange={(e) => setNewLabOrder(prev => ({ ...prev, testName: e.target.value }))}
                            placeholder="Enter test name..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="labPriority">Priority</Label>
                          <Select
                            value={newLabOrder.priority}
                            onValueChange={(value) => setNewLabOrder(prev => ({ ...prev, priority: value as 'routine' | 'urgent' | 'stat' }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="routine">Routine</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="stat">STAT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="labInstructions">Instructions</Label>
                        <Textarea
                          id="labInstructions"
                          value={newLabOrder.instructions}
                          onChange={(e) => setNewLabOrder(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Enter special instructions..."
                          rows={2}
                        />
                      </div>
                      <Button onClick={addLabOrder} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lab Order
                      </Button>
                      <div className="space-y-2">
                        {(editedConsultation.labOrders || []).map((labOrder, index) => (
                          <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {labOrder.testName}
                                  </h4>
                                  <Badge variant={labOrder.priority === 'stat' ? 'destructive' : labOrder.priority === 'urgent' ? 'default' : 'secondary'}>
                                    {labOrder.priority}
                                  </Badge>
                                </div>
                                {labOrder.instructions && (
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    {labOrder.instructions}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeLabOrder(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultation.labOrders && consultation.labOrders.length > 0 ? (
                        consultation.labOrders.map((labOrder, index) => (
                          <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {labOrder.testName}
                              </h4>
                              <Badge variant={labOrder.priority === 'stat' ? 'destructive' : labOrder.priority === 'urgent' ? 'default' : 'secondary'}>
                                {labOrder.priority}
                              </Badge>
                            </div>
                            {labOrder.instructions && (
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {labOrder.instructions}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 dark:text-zinc-400">No lab orders recorded</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              {/* Doctor Notes */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Doctor Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.doctorNotes || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, doctorNotes: e.target.value }))}
                      placeholder="Enter doctor notes..."
                      rows={6}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {consultation.doctorNotes || 'No doctor notes recorded'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Follow-up Instructions */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Follow-up Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedConsultation.followUpInstructions || ''}
                      onChange={(e) => setEditedConsultation(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                      placeholder="Enter follow-up instructions..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {consultation.followUpInstructions || 'No follow-up instructions recorded'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={consultation.patient?.profileImageUrl} />
                  <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                    {consultation.patient?.firstName?.[0]}{consultation.patient?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {consultation.patient?.firstName} {consultation.patient?.lastName}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {consultation.patient?.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {consultation.patient?.phone || 'No phone number'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {consultation.patient?.dateOfBirth ? 
                      format(consultation.patient.dateOfBirth, 'MMM d, yyyy') : 
                      'Date of birth not available'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Status */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Consultation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Status:</span>
                <Badge className={getStatusColor(consultation.status)}>
                  {consultation.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Priority:</span>
                <Badge className={getPriorityColor(consultation.priority)}>
                  {consultation.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Type:</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {consultation.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Date:</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {format(consultation.date, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Time:</span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {formatTime(consultation.startTime)}
                  {consultation.endTime && ` - ${formatTime(consultation.endTime)}`}
                </span>
              </div>
              {consultation.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Duration:</span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    {consultation.duration} minutes
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {consultation.virtualMeeting && (
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Join Virtual Meeting
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Patient
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Patient
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Medical Records
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
