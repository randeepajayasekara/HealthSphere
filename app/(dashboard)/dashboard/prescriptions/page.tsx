"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Pill, 
  Download, 
  Search, 
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MapPin,
  Phone,
  ChevronRight,
  FileText,
  ShoppingCart,
  Archive,
  Plus,
  Eye,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  prescriptionService, 
  doctorService, 
  patientUtilities,
  UnsubscribeFunction 
} from '@/lib/firestore/patient-services';
import { Prescription, User as UserType, Medication } from '@/app/types';

interface PrescriptionCardProps {
  prescription: Prescription;
  doctor?: UserType | null;
  onView: (prescription: Prescription) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ 
  prescription, 
  doctor, 
  onView 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      case 'completed':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'expired':
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800';
      default:
        return 'text-zinc-700 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Pill className="w-4 h-4 text-zinc-600" />;
    }
  };

  const isExpiringSoon = () => {
    if (prescription.status !== 'active') return false;
    const expiryDate = new Date(prescription.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-zinc-900 cursor-pointer" onClick={() => onView(prescription)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctor?.profileImageUrl} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {doctor ? `Dr. ${doctor.firstName[0]}${doctor.lastName[0]}` : 'Dr'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Prescription #{prescription.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(prescription.status)}
                  <Badge className={`text-xs ${getStatusColor(prescription.status)}`}>
                    {prescription.status.toUpperCase()}
                  </Badge>
                  {isExpiringSoon() && (
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {patientUtilities.formatDate(prescription.date)}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {prescription.medications.length} medication(s)
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 mt-2" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Diagnosis:</span>
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">{prescription.diagnosis}</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Medications:</span>
              <div className="space-y-1">
                {prescription.medications.slice(0, 3).map((medication, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-900 dark:text-zinc-100">{medication.name}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">{medication.dosage}</span>
                  </div>
                ))}
                {prescription.medications.length > 3 && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    +{prescription.medications.length - 3} more medication(s)
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center space-x-4 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Expires: {patientUtilities.formatDate(prescription.expiryDate)}</span>
                </div>
                {prescription.refillsRemaining !== undefined && (
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>{prescription.refillsRemaining} refills left</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {prescription.status === 'active' && (
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface PrescriptionViewDialogProps {
  prescription: Prescription | null;
  doctor?: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrescriptionViewDialog: React.FC<PrescriptionViewDialogProps> = ({ 
  prescription, 
  doctor, 
  isOpen, 
  onClose 
}) => {
  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Pill className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-lg font-semibold">
                Prescription #{prescription.id.slice(-6).toUpperCase()}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
                {patientUtilities.formatDate(prescription.date)} • Dr. {doctor?.firstName} {doctor?.lastName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Prescription Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Prescription Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Date Prescribed:</span>
                    <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                      {patientUtilities.formatDate(prescription.date)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Expires:</span>
                    <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                      {patientUtilities.formatDate(prescription.expiryDate)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">Status:</span>
                    <span className="ml-2">
                      <Badge className={prescription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {prescription.status.toUpperCase()}
                      </Badge>
                    </span>
                  </div>
                  {prescription.refillsRemaining !== undefined && (
                    <div>
                      <span className="font-medium text-zinc-600 dark:text-zinc-400">Refills Remaining:</span>
                      <span className="ml-2 text-zinc-900 dark:text-zinc-100">
                        {prescription.refillsRemaining}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Diagnosis</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {prescription.diagnosis}
                </p>
              </div>
            </div>
            
            {/* Medications */}
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Medications</h4>
              <div className="space-y-4">
                {prescription.medications.map((medication, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                          {medication.name}
                        </h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">Dosage:</span>
                            <span className="ml-2 text-zinc-900 dark:text-zinc-100">{medication.dosage}</span>
                          </div>
                          <div>
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">Frequency:</span>
                            <span className="ml-2 text-zinc-900 dark:text-zinc-100">{medication.frequency}</span>
                          </div>
                          <div>
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">Duration:</span>
                            <span className="ml-2 text-zinc-900 dark:text-zinc-100">{medication.duration}</span>
                          </div>
                          <div>
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">Quantity:</span>
                            <span className="ml-2 text-zinc-900 dark:text-zinc-100">{medication.quantity}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {medication.notes && (
                          <div className="mb-3">
                            <span className="font-medium text-zinc-600 dark:text-zinc-400 text-sm">Instructions:</span>
                            <p className="text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                              {medication.notes}
                            </p>
                          </div>
                        )}
                        
                        {medication.sideEffects && (
                          <div className="mb-3">
                            <span className="font-medium text-zinc-600 dark:text-zinc-400 text-sm">Possible Side Effects:</span>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              {medication.sideEffects}
                            </p>
                          </div>
                        )}
                        
                        {medication.precautions && (
                          <div>
                            <span className="font-medium text-zinc-600 dark:text-zinc-400 text-sm">Precautions:</span>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              {medication.precautions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Instructions */}
            {prescription.instructions && (
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">General Instructions</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {prescription.instructions}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Prescription ID: {prescription.id}
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
            {prescription.status === 'active' && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Order Refill
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Real-time prescriptions subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = prescriptionService.subscribeToPrescriptions(
      user.id,
      (prescriptionsData) => {
        setPrescriptions(prescriptionsData);
        setLoading(false);
        
        // Fetch doctor information for each prescription
        prescriptionsData.forEach(async (prescription) => {
          if (!doctors[prescription.doctorId]) {
            try {
              const doctor = await doctorService.getDoctor(prescription.doctorId);
              if (doctor) {
                setDoctors(prev => ({
                  ...prev,
                  [prescription.doctorId]: doctor
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

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsViewDialogOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const doctor = doctors[prescription.doctorId];
    const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
    
    const matchesSearch = 
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const activePrescriptions = filteredPrescriptions.filter(p => p.status === 'active');
  const expiredPrescriptions = filteredPrescriptions.filter(p => p.status === 'expired');
  const completedPrescriptions = filteredPrescriptions.filter(p => p.status === 'completed');
  const allPrescriptions = filteredPrescriptions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Get expiring soon prescriptions
  const expiringSoon = activePrescriptions.filter(prescription => {
    const expiryDate = new Date(prescription.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });

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
                My Prescriptions
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Manage your prescriptions and medication orders
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                <Pill className="w-3 h-3 mr-1" />
                Secure Prescriptions
              </Badge>
            </div>
          </motion.div>

          {/* Expiring Soon Alert */}
          {expiringSoon.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        Prescriptions Expiring Soon
                      </h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        {expiringSoon.length} prescription(s) will expire within 7 days. Consider ordering refills.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input
              placeholder="Search prescriptions, medications, or doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
            />
          </motion.div>

          {/* Prescription Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {activePrescriptions.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {expiringSoon.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Expiring Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Archive className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {completedPrescriptions.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Pill className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {prescriptions.length}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prescriptions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <TabsTrigger 
                  value="active" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Active ({activePrescriptions.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Completed ({completedPrescriptions.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="expired" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Expired ({expiredPrescriptions.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  All ({allPrescriptions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {activePrescriptions.length > 0 ? (
                      activePrescriptions.map((prescription) => (
                        <PrescriptionCard
                          key={prescription.id}
                          prescription={prescription}
                          doctor={doctors[prescription.doctorId]}
                          onView={handleViewPrescription}
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Pill className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                          No Active Prescriptions
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          You don't have any active prescriptions at the moment.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {completedPrescriptions.map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        doctor={doctors[prescription.doctorId]}
                        onView={handleViewPrescription}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="expired" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {expiredPrescriptions.map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        doctor={doctors[prescription.doctorId]}
                        onView={handleViewPrescription}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {allPrescriptions.map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        doctor={doctors[prescription.doctorId]}
                        onView={handleViewPrescription}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Prescription View Dialog */}
      <PrescriptionViewDialog
        prescription={selectedPrescription}
        doctor={selectedPrescription ? doctors[selectedPrescription.doctorId] : undefined}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedPrescription(null);
        }}
      />
    </ProtectedRoute>
  );
}
