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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Video, 
  Plus, 
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Stethoscope,
  User,
  CalendarDays,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  appointmentService, 
  doctorService, 
  patientUtilities,
  UnsubscribeFunction 
} from '@/lib/firestore/patient-services';
import { Appointment, AppointmentStatus, AppointmentType, User as UserType } from '@/app/types';

interface AppointmentCardProps {
  appointment: Appointment;
  doctor?: UserType | null;
  onStatusUpdate: (appointmentId: string, status: AppointmentStatus) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  doctor, 
  onStatusUpdate 
}) => {
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-600" />;
    }
  };

  const canCancel = ['scheduled', 'confirmed'].includes(appointment.status);
  const isVirtual = appointment.virtualMeeting !== null && appointment.virtualMeeting !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctor?.profileImageUrl} />
                <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                  {doctor ? `Dr. ${doctor.firstName[0]}${doctor.lastName[0]}` : 'Dr'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {(doctor as any)?.specialization || doctor?.role === 'doctor' ? 'Doctor' : 'General Practice'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(appointment.status)}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${patientUtilities.getStatusColor(appointment.status)}`}>
                    {appointment.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-zinc-600 dark:text-zinc-400">
                {isVirtual ? (
                  <>
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Virtual</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>In-Person</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarDays className="w-4 h-4 text-red-600" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {patientUtilities.formatDate(appointment.date)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  {patientUtilities.formatTime(appointment.startTime)} - {patientUtilities.formatTime(appointment.endTime)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Type:</span>
                <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                  {appointment.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Reason:</span>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  {appointment.reason}
                </p>
              </div>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Notes:</span> {appointment.notes}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center space-x-2">
              {patientUtilities.isToday(appointment.date) && (
                <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
                  Today
                </Badge>
              )}
              {patientUtilities.isUpcoming(appointment.date) && !patientUtilities.isToday(appointment.date) && (
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                  Upcoming
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {appointment.status === 'confirmed' && isVirtual && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // Navigate to telemedicine page
                    window.location.href = `/dashboard/telemedicine?appointment=${appointment.id}`;
                  }}
                >
                  <Video className="w-4 h-4 mr-1" />
                  Join Call
                </Button>
              )}
              {canCancel && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                  onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<UserType[]>([]);

  // Real-time appointments subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = appointmentService.subscribeToPatientAppointments(
      user.id,
      (appointmentsData) => {
        setAppointments(appointmentsData);
        setLoading(false);
        
        // Fetch doctor information for each appointment
        appointmentsData.forEach(async (appointment) => {
          if (!doctors[appointment.doctorId]) {
            try {
              const doctor = await doctorService.getDoctor(appointment.doctorId);
              if (doctor) {
                setDoctors(prev => ({
                  ...prev,
                  [appointment.doctorId]: doctor
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

  // Load available doctors for booking
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await doctorService.getAvailableDoctors();
        setAvailableDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading doctors:', error);
        toast.error('Failed to load available doctors');
      }
    };

    if (isBookingOpen) {
      loadDoctors();
    }
  }, [isBookingOpen]);

  const handleStatusUpdate = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      if (status === 'cancelled') {
        await appointmentService.cancelAppointment(appointmentId, 'Cancelled by patient');
        toast.success('Appointment cancelled successfully');
      } else {
        await appointmentService.updateAppointmentStatus(appointmentId, status);
        toast.success('Appointment updated successfully');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const doctor = doctors[appointment.doctorId];
    const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : '';
    
    const matchesSearch = 
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => 
    patientUtilities.isUpcoming(apt.date) && ['scheduled', 'confirmed'].includes(apt.status)
  );

  const pastAppointments = filteredAppointments.filter(apt => 
    apt.date < new Date() || ['completed', 'cancelled', 'no_show'].includes(apt.status)
  );

  const allAppointments = filteredAppointments.sort((a, b) => b.date.getTime() - a.date.getTime());

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
                My Appointments
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Manage your medical appointments and consultations
              </p>
            </div>
            
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                </DialogHeader>
                <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-red-600" />
                  <p>Appointment booking functionality will be available soon.</p>
                  <p className="text-sm mt-2">Please call our reception for now.</p>
                </div>
              </DialogContent>
            </Dialog>
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
                placeholder="Search appointments, doctors, or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Appointments Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  Past ({pastAppointments.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  All ({allAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          doctor={doctors[appointment.doctorId]}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Calendar className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                          No Upcoming Appointments
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                          You don't have any upcoming appointments scheduled.
                        </p>
                        <Button 
                          onClick={() => setIsBookingOpen(true)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Book Your First Appointment
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        doctor={doctors[appointment.doctorId]}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {pastAppointments.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Clock className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        No Past Appointments
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Your appointment history will appear here.
                      </p>
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {allAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        doctor={doctors[appointment.doctorId]}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
