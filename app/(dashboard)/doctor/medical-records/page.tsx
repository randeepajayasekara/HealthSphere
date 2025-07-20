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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  Upload,
  Calendar as CalendarIcon,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Trash2,
  Heart,
  Brain,
  Stethoscope,
  FlaskConical,
  Pill,
  X,
  Save,
  FileImage,
  Paperclip,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { MedicalRecord, MedicalRecordType, PatientProfile, Attachment } from '@/app/types';
import { cn } from '@/lib/utils';

interface MedicalRecordWithPatient extends MedicalRecord {
  patient?: PatientProfile;
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecordWithPatient[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecordWithPatient[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordWithPatient | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState<MedicalRecordType | 'all'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({ start: null, end: null });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New record form state
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    type: 'consultation' as MedicalRecordType,
    description: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpRecommendations: '',
    date: new Date()
  });

  // Edit record form state
  const [editRecord, setEditRecord] = useState<Partial<MedicalRecord>>({});

  const recordTypeOptions: { value: MedicalRecordType; label: string; color: string }[] = [
    { value: 'consultation', label: 'Consultation', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'lab_result', label: 'Lab Result', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'imaging', label: 'Imaging', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
    { value: 'procedure', label: 'Procedure', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
    { value: 'hospitalization', label: 'Hospitalization', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    { value: 'vaccination', label: 'Vaccination', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
    { value: 'other', label: 'Other', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' }
  ];

  const getRecordTypeColor = (type: MedicalRecordType) => {
    return recordTypeOptions.find(opt => opt.value === type)?.color || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
  };

  const getRecordTypeLabel = (type: MedicalRecordType) => {
    return recordTypeOptions.find(opt => opt.value === type)?.label || 'Unknown';
  };

  const getRecordTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="h-4 w-4" />;
      case 'lab_result':
        return <FlaskConical className="h-4 w-4" />;
      case 'imaging':
        return <FileImage className="h-4 w-4" />;
      case 'procedure':
        return <Activity className="h-4 w-4" />;
      case 'hospitalization':
        return <Heart className="h-4 w-4" />;
      case 'vaccination':
        return <Pill className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, selectedRecordType, selectedPatient, dateRange]);

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

      // Load medical records
      const recordsResponse = await DoctorService.getDoctorPatientMedicalRecords(user.id);
      if (recordsResponse.error) {
        throw new Error(recordsResponse.error.message);
      }
      
      // Enrich records with patient information
      const enrichedRecords = (recordsResponse.data || []).map(record => {
        const patient = patientsResponse.data?.find(p => p.id === record.patientId);
        return { ...record, patient };
      });
      
      setRecords(enrichedRecords);
    } catch (error) {
      console.error('Error loading medical records:', error);
      setError(error instanceof Error ? error.message : 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Record type filter
    if (selectedRecordType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedRecordType);
    }

    // Patient filter
    if (selectedPatient !== 'all') {
      filtered = filtered.filter(record => record.patientId === selectedPatient);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(record => new Date(record.date) >= dateRange.start!);
    }
    if (dateRange.end) {
      filtered = filtered.filter(record => new Date(record.date) <= dateRange.end!);
    }

    setFilteredRecords(filtered);
  };

  const handleCreateRecord = async () => {
    if (!user?.id || !newRecord.patientId || !newRecord.description) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const recordData = {
        ...newRecord,
        providerId: user.id,
        attachments: []
      };
      
      const response = await DoctorService.createMedicalRecord(recordData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setIsCreateDialogOpen(false);
      setNewRecord({
        patientId: '',
        type: 'consultation',
        description: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        followUpRecommendations: '',
        date: new Date()
      });
      
      await loadData();
    } catch (error) {
      console.error('Error creating medical record:', error);
      setError(error instanceof Error ? error.message : 'Failed to create medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = async () => {
    if (!selectedRecord?.id) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await DoctorService.updateMedicalRecord(selectedRecord.id, editRecord);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      setEditRecord({});
      
      await loadData();
    } catch (error) {
      console.error('Error updating medical record:', error);
      setError(error instanceof Error ? error.message : 'Failed to update medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/doctor/patients/${patientId}`);
  };

  const handleRecordDetail = (record: MedicalRecordWithPatient) => {
    setSelectedRecord(record);
    setIsRecordDetailOpen(true);
  };

  const handleEditClick = (record: MedicalRecordWithPatient) => {
    setSelectedRecord(record);
    setEditRecord({
      type: record.type,
      description: record.description,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
      followUpRecommendations: record.followUpRecommendations,
      date: record.date
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage patient medical records and documentation
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
          <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage patient medical records and documentation
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
                New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Medical Record</DialogTitle>
                <DialogDescription>
                  Add a new medical record for a patient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient</Label>
                    <Select value={newRecord.patientId} onValueChange={(value) => setNewRecord(prev => ({ ...prev, patientId: value }))}>
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
                    <Label htmlFor="type">Record Type</Label>
                    <Select value={newRecord.type} onValueChange={(value) => setNewRecord(prev => ({ ...prev, type: value as MedicalRecordType }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newRecord.date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newRecord.date}
                        onSelect={(date) => date && setNewRecord(prev => ({ ...prev, date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter record description..."
                    value={newRecord.description}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis..."
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="treatment">Treatment</Label>
                  <Textarea
                    id="treatment"
                    placeholder="Enter treatment plan..."
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, treatment: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="followup">Follow-up Recommendations</Label>
                  <Textarea
                    id="followup"
                    placeholder="Follow-up recommendations..."
                    value={newRecord.followUpRecommendations}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, followUpRecommendations: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRecord}
                  disabled={submitting || !newRecord.patientId || !newRecord.description}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Create Record
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
                  placeholder="Search records, diagnosis, treatment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="record-type">Record Type</Label>
              <Select value={selectedRecordType} onValueChange={(value) => setSelectedRecordType(value as MedicalRecordType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {recordTypeOptions.map(option => (
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

      {/* Records Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-zinc-500">
              {filteredRecords.length} filtered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-xs text-zinc-500">
              New records this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.type === 'consultation').length}
            </div>
            <p className="text-xs text-zinc-500">
              Total consultations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Results</CardTitle>
            <FlaskConical className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.type === 'lab_result').length}
            </div>
            <p className="text-xs text-zinc-500">
              Lab results reviewed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
          <CardDescription>
            View and manage all patient medical records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={record.patient?.profileImageUrl} />
                        <AvatarFallback>
                          {record.patient?.firstName?.[0]}{record.patient?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {record.patient?.firstName} {record.patient?.lastName}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {record.patient?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRecordTypeColor(record.type)}>
                      <div className="flex items-center gap-1">
                        {getRecordTypeIcon(record.type)}
                        {getRecordTypeLabel(record.type)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.description}
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecordDetail(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPatient(record.patientId)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500">No medical records found</p>
              <p className="text-sm text-zinc-400">
                {searchTerm || selectedRecordType !== 'all' || selectedPatient !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Create your first medical record to get started'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
            <DialogDescription>
              Update the medical record details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Record Type</Label>
              <Select value={editRecord.type} onValueChange={(value) => setEditRecord(prev => ({ ...prev, type: value as MedicalRecordType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recordTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editRecord.date ? format(editRecord.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editRecord.date}
                    onSelect={(date) => date && setEditRecord(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter record description..."
                value={editRecord.description || ''}
                onChange={(e) => setEditRecord(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-diagnosis">Diagnosis</Label>
              <Textarea
                id="edit-diagnosis"
                placeholder="Enter diagnosis..."
                value={editRecord.diagnosis || ''}
                onChange={(e) => setEditRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-treatment">Treatment</Label>
              <Textarea
                id="edit-treatment"
                placeholder="Enter treatment plan..."
                value={editRecord.treatment || ''}
                onChange={(e) => setEditRecord(prev => ({ ...prev, treatment: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional notes..."
                value={editRecord.notes || ''}
                onChange={(e) => setEditRecord(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-followup">Follow-up Recommendations</Label>
              <Textarea
                id="edit-followup"
                placeholder="Follow-up recommendations..."
                value={editRecord.followUpRecommendations || ''}
                onChange={(e) => setEditRecord(prev => ({ ...prev, followUpRecommendations: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditRecord}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Update Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Detail Dialog */}
      <Dialog open={isRecordDetailOpen} onOpenChange={setIsRecordDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRecord && getRecordTypeIcon(selectedRecord.type)}
              Medical Record Details
            </DialogTitle>
            <DialogDescription>
              {selectedRecord && `${selectedRecord.patient?.firstName} ${selectedRecord.patient?.lastName} - ${format(new Date(selectedRecord.date), 'PPP')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Patient</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedRecord.patient?.profileImageUrl} />
                      <AvatarFallback>
                        {selectedRecord.patient?.firstName?.[0]}{selectedRecord.patient?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedRecord.patient?.firstName} {selectedRecord.patient?.lastName}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {selectedRecord.patient?.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Type</Label>
                  <div className="mt-1">
                    <Badge className={getRecordTypeColor(selectedRecord.type)}>
                      <div className="flex items-center gap-1">
                        {getRecordTypeIcon(selectedRecord.type)}
                        {getRecordTypeLabel(selectedRecord.type)}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-zinc-500">Description</Label>
                <p className="mt-1 text-sm">{selectedRecord.description}</p>
              </div>
              
              {selectedRecord.diagnosis && (
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Diagnosis</Label>
                  <p className="mt-1 text-sm">{selectedRecord.diagnosis}</p>
                </div>
              )}
              
              {selectedRecord.treatment && (
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Treatment</Label>
                  <p className="mt-1 text-sm">{selectedRecord.treatment}</p>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Notes</Label>
                  <p className="mt-1 text-sm">{selectedRecord.notes}</p>
                </div>
              )}
              
              {selectedRecord.followUpRecommendations && (
                <div>
                  <Label className="text-sm font-medium text-zinc-500">Follow-up Recommendations</Label>
                  <p className="mt-1 text-sm">{selectedRecord.followUpRecommendations}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <div>Created: {format(new Date(selectedRecord.createdAt), 'PPP pp')}</div>
                  <div>Updated: {format(new Date(selectedRecord.updatedAt), 'PPP pp')}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsRecordDetailOpen(false)}>
              Close
            </Button>
            {selectedRecord && (
              <Button 
                onClick={() => {
                  setIsRecordDetailOpen(false);
                  handleEditClick(selectedRecord);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Record
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
