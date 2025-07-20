/**
 * ConsultationCard Component
 * Reusable consultation card component with consistent styling
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Video,
  Phone,
  Play,
  Pause,
  CheckCircle,
  Eye,
  Edit,
  Stethoscope,
  RefreshCw,
  Pill,
  TestTube,
  UserCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Consultation, 
  ConsultationStatus, 
  ConsultationType, 
  ConsultationPriority, 
  PatientProfile 
} from '@/app/types';

interface ConsultationWithPatient extends Consultation {
  patient?: PatientProfile;
}

interface ConsultationCardProps {
  consultation: ConsultationWithPatient;
  onStatusChange: (consultationId: string, status: ConsultationStatus) => void;
  onView: (consultation: ConsultationWithPatient) => void;
  onEdit: (consultation: ConsultationWithPatient) => void;
  className?: string;
}

export function ConsultationCard({
  consultation,
  onStatusChange,
  onView,
  onEdit,
  className = ""
}: ConsultationCardProps) {
  
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

  const renderActionButtons = () => {
    const buttons = [];

    if (consultation.status === 'scheduled') {
      buttons.push(
        <Button 
          key="start"
          size="sm"
          onClick={() => onStatusChange(consultation.id, 'in_progress')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
      );
    }

    if (consultation.status === 'in_progress') {
      buttons.push(
        <Button 
          key="pause"
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(consultation.id, 'paused')}
        >
          <Pause className="h-4 w-4" />
        </Button>,
        <Button 
          key="complete"
          size="sm"
          onClick={() => onStatusChange(consultation.id, 'completed')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Complete
        </Button>
      );
    }

    if (consultation.status === 'paused') {
      buttons.push(
        <Button 
          key="resume"
          size="sm"
          onClick={() => onStatusChange(consultation.id, 'in_progress')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Resume
        </Button>
      );
    }

    if (consultation.status === 'waiting') {
      buttons.push(
        <Button 
          key="start-waiting"
          size="sm"
          onClick={() => onStatusChange(consultation.id, 'in_progress')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
      );
    }

    return buttons;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
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
              {renderActionButtons()}
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onView(consultation)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(consultation)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ConsultationCard;
