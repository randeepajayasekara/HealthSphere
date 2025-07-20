/**
 * Virtual Waiting Room Patient Card Component
 * Individual patient card with actions and device status
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Video, 
  Phone, 
  User, 
  AlertTriangle,
  Camera,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Monitor,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Play,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VirtualWaitingRoomPatient } from '@/lib/firestore/virtual-waiting-room-service';
import { formatDistanceToNow } from 'date-fns';

interface VirtualWaitingRoomPatientCardProps {
  patient: VirtualWaitingRoomPatient;
  onStartConsultation: (patientId: string) => void;
  onUpdatePriority: (patientId: string, priority: VirtualWaitingRoomPatient['priority']) => void;
  onSendMessage: (patientId: string) => void;
  onRemoveFromQueue: (patientId: string) => void;
  className?: string;
}

export function VirtualWaitingRoomPatientCard({
  patient,
  onStartConsultation,
  onUpdatePriority,
  onSendMessage,
  onRemoveFromQueue,
  className = ""
}: VirtualWaitingRoomPatientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: VirtualWaitingRoomPatient['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800';
    }
  };

  const getStatusColor = (status: VirtualWaitingRoomPatient['status']) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'in_consultation': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800';
    }
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'fair': return <Wifi className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <WifiOff className="h-4 w-4 text-red-600" />;
      default: return <Wifi className="h-4 w-4 text-zinc-600" />;
    }
  };

  const waitTime = formatDistanceToNow(patient.joinedAt, { addSuffix: true });
  const waitTimeMinutes = Math.floor((Date.now() - patient.joinedAt.getTime()) / (1000 * 60));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={patient.patientAvatar} alt={patient.patientName} />
                <AvatarFallback className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {patient.patientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{patient.patientName}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getPriorityColor(patient.priority)}>
                    {patient.priority}
                  </Badge>
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{waitTimeMinutes}m</span>
                </div>
                <div className="text-xs">joined {waitTime}</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStartConsultation(patient.id)}>
                    <Video className="h-4 w-4 mr-2" />
                    Start Consultation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSendMessage(patient.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onUpdatePriority(patient.id, 'urgent')}>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Set Urgent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdatePriority(patient.id, 'low')}>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Set Low Priority
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onRemoveFromQueue(patient.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Remove from Queue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Patient Contact Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-zinc-600 dark:text-zinc-400">
                  📧 {patient.patientEmail}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  📞 {patient.patientPhone}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {patient.consultationType.replace('_', ' ')}
              </Badge>
            </div>

            {/* Device Status */}
            <div className="flex items-center space-x-4 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Camera className={`h-4 w-4 ${patient.patientDeviceInfo?.hasCamera ? 'text-green-600' : 'text-red-600'}`} />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {patient.patientDeviceInfo?.hasCamera ? 'Camera' : 'No Camera'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {patient.patientDeviceInfo?.hasMicrophone ? (
                  <Mic className="h-4 w-4 text-green-600" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {patient.patientDeviceInfo?.hasMicrophone ? 'Mic' : 'No Mic'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getConnectionQualityIcon(patient.patientDeviceInfo?.connectionQuality || 'good')}
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {patient.patientDeviceInfo?.connectionQuality || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-zinc-600" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {patient.patientDeviceInfo?.browserInfo || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Symptoms/Notes */}
            {patient.symptoms && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Symptoms/Reason
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className={`text-sm text-zinc-600 dark:text-zinc-400 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {patient.symptoms}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <Button
                onClick={() => onStartConsultation(patient.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={patient.status === 'in_consultation'}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Consultation
              </Button>
              <Button
                variant="outline"
                onClick={() => onSendMessage(patient.id)}
                className="border-zinc-200 dark:border-zinc-800"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onUpdatePriority(patient.id, patient.priority === 'urgent' ? 'medium' : 'urgent')}
                className="border-zinc-200 dark:border-zinc-800"
              >
                {patient.priority === 'urgent' ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
