"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Stethoscope,
  TestTube,
  Scan,
  Heart,
  Eye,
  Activity,
  Paperclip,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Shield,
  Lock,
  Share2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  medicalRecordsService, 
  doctorService, 
  patientUtilities,
  UnsubscribeFunction 
} from '@/lib/firestore/patient-services';
import { MedicalRecord, MedicalRecordType, User as UserType } from '@/app/types';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  doctor?: UserType | null;
  onView: (record: MedicalRecord) => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ 
  record, 
  doctor, 
  onView 
}) => {
  const getTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'lab_result':
        return <TestTube className="w-5 h-5 text-green-600" />;
      case 'imaging':
        return <Scan className="w-5 h-5 text-purple-600" />;
      case 'procedure':
        return <Activity className="w-5 h-5 text-orange-600" />;
      case 'hospitalization':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'vaccination':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-600" />;
    }
  };

  const getTypeColor = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'lab_result':
        return 'text-green-700 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      case 'imaging':
        return 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
      case 'procedure':
        return 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
      case 'hospitalization':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'vaccination':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'text-zinc-700 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-zinc-900 cursor-pointer" onClick={() => onView(record)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(record.type).split(' ').slice(1).join(' ')}`}>
                {getTypeIcon(record.type)}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {record.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Record
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`text-xs ${getTypeColor(record.type)}`}>
                    {record.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {patientUtilities.formatDate(record.date)}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {record.attachments && record.attachments.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{record.attachments.length} file(s)</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 mt-2" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {record.description}
          </p>
          
          {record.diagnosis && (
            <div className="mt-2 text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Diagnosis:</span>
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">{record.diagnosis}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock className="w-3 h-3" />
              <span>Updated {patientUtilities.formatDate(record.updatedAt)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">Secure</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface RecordViewDialogProps {
  record: MedicalRecord | null;
  doctor?: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecordViewDialog: React.FC<RecordViewDialogProps> = ({ 
  record, 
  doctor, 
  isOpen, 
  onClose 
}) => {
  if (!record) return null;

  const getTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-6 h-6 text-blue-600" />;
      case 'lab_result':
        return <TestTube className="w-6 h-6 text-green-600" />;
      case 'imaging':
        return <Scan className="w-6 h-6 text-purple-600" />;
      case 'procedure':
        return <Activity className="w-6 h-6 text-orange-600" />;
      case 'hospitalization':
        return <Heart className="w-6 h-6 text-red-600" />;
      case 'vaccination':
        return <Shield className="w-6 h-6 text-emerald-600" />;
      default:
        return <FileText className="w-6 h-6 text-zinc-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getTypeIcon(record.type)}
            <div>
              <div className="text-lg font-semibold">
                {record.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Record
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
                {patientUtilities.formatDate(record.date)} • Dr. {doctor?.firstName} {doctor?.lastName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Record Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Record Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Type:</span>
                    <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                      {record.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Date:</span>
                    <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                      {patientUtilities.formatDate(record.date)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Provider:</span>
                    <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                      Dr. {doctor?.firstName} {doctor?.lastName}
                    </span>
                  </div>
                </div>
              </div>
              
              {record.diagnosis && (
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Diagnosis</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {record.diagnosis}
                  </p>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Description</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {record.description}
              </p>
            </div>
            
            {/* Treatment */}
            {record.treatment && (
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Treatment</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {record.treatment}
                </p>
              </div>
            )}
            
            {/* Notes */}
            {record.notes && (
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Additional Notes</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {record.notes}
                </p>
              </div>
            )}
            
            {/* Attachments */}
            {record.attachments && record.attachments.length > 0 && (
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Attachments</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {record.attachments.map((attachment, index) => (
                    <Card key={index} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {attachment.fileType} • {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Lock className="w-4 h-4 text-green-600" />
            <span>This record is encrypted and secure</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<MedicalRecordType | 'all'>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Real-time medical records subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = medicalRecordsService.subscribeToMedicalRecords(
      user.id,
      (recordsData) => {
        setRecords(recordsData);
        setLoading(false);
        
        // Fetch doctor information for each record
        recordsData.forEach(async (record) => {
          if (record.providerId && !doctors[record.providerId]) {
            try {
              const doctor = await doctorService.getDoctor(record.providerId);
              if (doctor) {
                setDoctors(prev => ({
                  ...prev,
                  [record.providerId]: doctor
                }));
              }
            } catch (error) {
              console.error('Error fetching doctor:', error);
            }
          }
        });
      }
    );

    return unsubscribe;
  }, [user?.id, doctors]);

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const filteredRecords = records.filter(record => {
    const doctor = record.providerId ? doctors[record.providerId] : null;
    const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
    
    const matchesSearch = 
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const recentRecords = filteredRecords.slice(0, 10);
  const consultationRecords = filteredRecords.filter(r => r.type === 'consultation');
  const labRecords = filteredRecords.filter(r => r.type === 'lab_result');
  const imagingRecords = filteredRecords.filter(r => r.type === 'imaging');
  const allRecords = filteredRecords.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['patient']}>
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
              <div className="grid gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Medical Records
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Secure access to your complete medical history
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                <Shield className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input
                placeholder="Search records, diagnoses, or doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {(['all', 'consultation', 'lab_result', 'imaging', 'procedure', 'vaccination'] as const).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={typeFilter === type ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Records Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {consultationRecords.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Consultations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TestTube className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {labRecords.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Lab Results</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Scan className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {imagingRecords.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Imaging</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {records.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Records List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <TabsTrigger 
                  value="recent" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Recent
                </TabsTrigger>
                <TabsTrigger 
                  value="consultations" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Consultations
                </TabsTrigger>
                <TabsTrigger 
                  value="lab" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Lab Results
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  All Records
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record) => (
                        <MedicalRecordCard
                          key={record.id}
                          record={record}
                          doctor={record.providerId ? doctors[record.providerId] : undefined}
                          onView={handleViewRecord}
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <FileText className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                          No Medical Records Found
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          Your medical records will appear here after your first appointment.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="consultations" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {consultationRecords.map((record) => (
                      <MedicalRecordCard
                        key={record.id}
                        record={record}
                        doctor={record.providerId ? doctors[record.providerId] : undefined}
                        onView={handleViewRecord}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="lab" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {labRecords.map((record) => (
                      <MedicalRecordCard
                        key={record.id}
                        record={record}
                        doctor={record.providerId ? doctors[record.providerId] : undefined}
                        onView={handleViewRecord}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {allRecords.map((record) => (
                      <MedicalRecordCard
                        key={record.id}
                        record={record}
                        doctor={record.providerId ? doctors[record.providerId] : undefined}
                        onView={handleViewRecord}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Record View Dialog */}
      <RecordViewDialog
        record={selectedRecord}
        doctor={selectedRecord?.providerId ? doctors[selectedRecord.providerId] : undefined}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedRecord(null);
        }}
      />
    </ProtectedRoute>
  );
}
