/**
 * ConsultationQueue Component
 * Displays and manages the consultation queue with drag-and-drop reordering
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  Play, 
  User, 
  AlertTriangle, 
  Timer,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Consultation, ConsultationPriority, PatientProfile } from '@/app/types';
import { ConsultationTimer } from './consultation-timer';

interface ConsultationQueueProps {
  consultations: Consultation[];
  patients: PatientProfile[]; // Add patients data
  onStartConsultation: (consultationId: string) => void;
  onReorderQueue: (consultationIds: string[]) => void;
  onUpdatePriority: (consultationId: string, priority: ConsultationPriority) => void;
  className?: string;
}

export function ConsultationQueue({
  consultations,
  patients,
  onStartConsultation,
  onReorderQueue,
  onUpdatePriority,
  className = ""
}: ConsultationQueueProps) {
  const [queueItems, setQueueItems] = useState<Consultation[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Filter and sort consultations for the queue
  useEffect(() => {
    const queueConsultations = consultations
      .filter(c => ['scheduled', 'waiting'].includes(c.status))
      .sort((a, b) => {
        // Sort by priority first, then by date and time
        const priorityOrder = {
          'emergency': 0,
          'urgent': 1,
          'high': 2,
          'medium': 3,
          'low': 4
        };
        
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        // Compare by date first, then by start time
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // If same date, compare by start time
        return a.startTime.localeCompare(b.startTime);
      });

    setQueueItems(queueConsultations);
  }, [consultations]);

  const getPatientById = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getConsultationDateTime = (consultation: Consultation) => {
    const dateStr = new Date(consultation.date).toISOString().split('T')[0];
    return new Date(`${dateStr}T${consultation.startTime}`);
  };

  const getWaitingTime = (consultation: Consultation) => {
    const now = new Date();
    const appointmentTime = getConsultationDateTime(consultation);
    const diffMinutes = Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) {
      return `${Math.abs(diffMinutes)}m early`;
    } else if (diffMinutes === 0) {
      return 'On time';
    } else {
      return `${diffMinutes}m waiting`;
    }
  };

  const getPriorityColor = (priority: ConsultationPriority) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200 dark:border-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800';
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...queueItems];
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      setQueueItems(newItems);
      onReorderQueue(newItems.map(item => item.id));
    }
  };

  const moveDown = (index: number) => {
    if (index < queueItems.length - 1) {
      const newItems = [...queueItems];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setQueueItems(newItems);
      onReorderQueue(newItems.map(item => item.id));
    }
  };

  const QueueItem = ({ consultation, index }: { consultation: Consultation; index: number }) => {
    const patient = getPatientById(consultation.patientId);
    const appointmentDateTime = getConsultationDateTime(consultation);
    const isOverdue = appointmentDateTime < new Date();
    
    if (!patient) {
      return null; // Skip if patient not found
    }
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`relative ${draggedItem === consultation.id ? 'z-10' : ''}`}
      >
        <Card className={`border-l-4 ${getPriorityColor(consultation.priority)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    #{index + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={patient.profileImageUrl} />
                    <AvatarFallback>
                      {patient.firstName[0]}{patient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {consultation.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span>{appointmentDateTime.toLocaleTimeString()}</span>
                    </div>
                    
                    <div className={`flex items-center space-x-1 text-xs ${
                      isOverdue ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'
                    }`}>
                      <Timer className="h-3 w-3" />
                      <span>{getWaitingTime(consultation)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => onStartConsultation(consultation.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => moveUp(index)} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => moveDown(index)} 
                      disabled={index === queueItems.length - 1}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdatePriority(consultation.id, 'urgent')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark Urgent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Consultation Queue</span>
          <Badge variant="outline" className="ml-2">
            {queueItems.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <AnimatePresence>
            {queueItems.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No consultations in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queueItems.map((consultation, index) => (
                  <QueueItem
                    key={consultation.id}
                    consultation={consultation}
                    index={index}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ConsultationQueue;
