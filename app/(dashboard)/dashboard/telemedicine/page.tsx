"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Calendar, 
  Clock,
  Phone,
  Monitor,
  Wifi,
  WifiOff,
  Settings,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  PlayCircle,
  Users,
  MessageSquare,
  FileText,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import JitsiMeetComponent from '@/app/components/features/telemedicine/jitsi-meet';
import { 
  appointmentService, 
  telemedicineService, 
  doctorService, 
  patientUtilities 
} from '@/lib/firestore/patient-services';
import { Appointment, VirtualMeetingInfo, User as UserType } from '@/app/types';

interface VirtualAppointmentCardProps {
  appointment: Appointment;
  doctor?: UserType | null;
  onJoin: (appointment: Appointment) => void;
}

const VirtualAppointmentCard: React.FC<VirtualAppointmentCardProps> = ({ 
  appointment, 
  doctor, 
  onJoin 
}) => {
  const canJoin = appointment.status === 'confirmed' && 
                  patientUtilities.isToday(appointment.date);
  
  const timeUntilAppointment = () => {
    const now = new Date();
    const appointmentDateTime = new Date(
      appointment.date.toDateString() + ' ' + appointment.startTime
    );
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins > 0) {
      if (diffMins > 60) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `in ${hours}h ${mins}m`;
      }
      return `in ${diffMins} minutes`;
    } else if (diffMins > -30) {
      return 'Now';
    }
    return 'Ended';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctor?.profileImageUrl} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {doctor ? `Dr. ${doctor.firstName[0]}${doctor.lastName[0]}` : 'Dr'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Virtual Consultation
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">
                    {timeUntilAppointment()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {patientUtilities.formatTime(appointment.startTime)}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {patientUtilities.formatDate(appointment.date)}
              </div>
              {canJoin && (
                <Badge className="mt-2 bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                  Ready to Join
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Reason:</span>
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                {appointment.reason}
              </span>
            </div>
            
            {appointment.notes && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Note:</span> {appointment.notes}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Clock className="w-4 h-4" />
                <span>Duration: 30 minutes</span>
              </div>
              
              {canJoin ? (
                <Button 
                  onClick={() => onJoin(appointment)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Now
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  {timeUntilAppointment() === 'Ended' ? 'Ended' : 'Not Ready'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SystemCheckCard: React.FC<{ 
  title: string; 
  status: 'checking' | 'good' | 'warning' | 'error'; 
  description: string;
  icon: React.ReactNode;
}> = ({ title, status, description, icon }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      default:
        return 'text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-zinc-400 animate-spin" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm opacity-80">{description}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>
    </div>
  );
};

function TelemedicineContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment');
  
  const [virtualAppointments, setVirtualAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<{
    appointment: Appointment;
    meetingInfo: VirtualMeetingInfo;
    doctor: UserType | null;
  } | null>(null);
  const [systemCheck, setSystemCheck] = useState<{
    camera: 'checking' | 'good' | 'warning' | 'error';
    microphone: 'checking' | 'good' | 'warning' | 'error';
    internet: 'checking' | 'good' | 'warning' | 'error';
    browser: 'checking' | 'good' | 'warning' | 'error';
  }>({
    camera: 'checking',
    microphone: 'checking',
    internet: 'checking',
    browser: 'checking'
  });

  // Load virtual appointments
  useEffect(() => {
    if (!user?.id) return;

    const loadVirtualAppointments = async () => {
      try {
        const appointments = await telemedicineService.getVirtualAppointments(user.id);
        setVirtualAppointments(appointments);
        
        // Load doctor information
        for (const appointment of appointments) {
          if (!doctors[appointment.doctorId]) {
            const doctor = await doctorService.getDoctor(appointment.doctorId);
            if (doctor) {
              setDoctors(prev => ({
                ...prev,
                [appointment.doctorId]: doctor
              }));
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading virtual appointments:', error);
        toast.error('Failed to load virtual appointments');
        setLoading(false);
      }
    };

    loadVirtualAppointments();
  }, [user?.id, doctors]);

  // Auto-join if appointment ID is provided
  useEffect(() => {
    if (appointmentId && virtualAppointments.length > 0) {
      const appointment = virtualAppointments.find(apt => apt.id === appointmentId);
      if (appointment && appointment.virtualMeeting) {
        handleJoinCall(appointment);
      }
    }
  }, [appointmentId, virtualAppointments]);

  // System checks
  useEffect(() => {
    const runSystemChecks = async () => {
      // Check browser compatibility
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setSystemCheck(prev => ({
        ...prev,
        browser: isSupported ? 'good' : 'error'
      }));

      // Check internet connection
      setSystemCheck(prev => ({
        ...prev,
        internet: navigator.onLine ? 'good' : 'error'
      }));

      // Check camera and microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setSystemCheck(prev => ({
          ...prev,
          camera: 'good',
          microphone: 'good'
        }));
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Media access error:', error);
        setSystemCheck(prev => ({
          ...prev,
          camera: 'warning',
          microphone: 'warning'
        }));
      }
    };

    runSystemChecks();
  }, []);

  const handleJoinCall = async (appointment: Appointment) => {
    if (!appointment.virtualMeeting) {
      toast.error('Virtual meeting information not available');
      return;
    }

    try {
      const meetingInfo = await telemedicineService.joinVirtualAppointment(appointment.id);
      if (meetingInfo) {
        setActiveCall({
          appointment,
          meetingInfo,
          doctor: doctors[appointment.doctorId] || null
        });
      } else {
        toast.error('Unable to join virtual appointment');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to join virtual appointment');
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    toast.success('Call ended');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If in active call, show the video interface
  if (activeCall) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <JitsiMeetComponent
          meetingInfo={activeCall.meetingInfo}
          roomName={`healthsphere-${activeCall.appointment.id}`}
          displayName={`${user?.firstName} ${user?.lastName}`}
          email={user?.email}
          onMeetingEnd={handleEndCall}
          onError={(error) => {
            console.error('Jitsi error:', error);
            toast.error(error);
            handleEndCall();
          }}
        />
      </div>
    );
  }

  const upcomingVirtual = virtualAppointments.filter(apt => 
    patientUtilities.isUpcoming(apt.date) && ['scheduled', 'confirmed'].includes(apt.status)
  );

  const pastVirtual = virtualAppointments.filter(apt => 
    apt.date < new Date() || ['completed', 'cancelled'].includes(apt.status)
  );

  return (
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
              Virtual Consultations
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Secure video consultations with your healthcare providers
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
              <Video className="w-3 h-3 mr-1" />
              Secure & HIPAA Compliant
            </Badge>
          </div>
        </motion.div>

        {/* System Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>System Check</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SystemCheckCard
                  title="Camera"
                  status={systemCheck.camera}
                  description={systemCheck.camera === 'good' ? 'Ready' : 'Check permissions'}
                  icon={<Video className="w-5 h-5" />}
                />
                <SystemCheckCard
                  title="Microphone"
                  status={systemCheck.microphone}
                  description={systemCheck.microphone === 'good' ? 'Ready' : 'Check permissions'}
                  icon={<Phone className="w-5 h-5" />}
                />
                <SystemCheckCard
                  title="Internet"
                  status={systemCheck.internet}
                  description={systemCheck.internet === 'good' ? 'Connected' : 'Check connection'}
                  icon={systemCheck.internet === 'good' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                />
                <SystemCheckCard
                  title="Browser"
                  status={systemCheck.browser}
                  description={systemCheck.browser === 'good' ? 'Compatible' : 'Not supported'}
                  icon={<Monitor className="w-5 h-5" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Virtual Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Upcoming ({upcomingVirtual.length})
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Past Sessions ({pastVirtual.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {upcomingVirtual.length > 0 ? (
                    upcomingVirtual.map((appointment) => (
                      <VirtualAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        doctor={doctors[appointment.doctorId]}
                        onJoin={handleJoinCall}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Video className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        No Upcoming Virtual Consultations
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        Schedule a virtual appointment to get started.
                      </p>
                      <Button 
                        onClick={() => window.location.href = '/dashboard/appointments'}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Appointment
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {pastVirtual.map((appointment) => (
                    <VirtualAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      doctor={doctors[appointment.doctorId]}
                      onJoin={handleJoinCall}
                    />
                  ))}
                </AnimatePresence>
                
                {pastVirtual.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Clock className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      No Past Virtual Sessions
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Your virtual consultation history will appear here.
                    </p>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <HelpCircle className="w-5 h-5" />
                <span>Need Help with Virtual Consultations?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Technical Requirements
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Chrome, Firefox, Safari, or Edge browser</li>
                    <li>• Working camera and microphone</li>
                    <li>• Stable internet connection</li>
                    <li>• Grant camera/microphone permissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    During Your Consultation
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Join 5 minutes before your appointment</li>
                    <li>• Ensure good lighting and quiet environment</li>
                    <li>• Have your medical information ready</li>
                    <li>• Test your audio/video beforehand</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function TelemedicinePage() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <Suspense fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <TelemedicineContent />
      </Suspense>
    </ProtectedRoute>
  );
}
