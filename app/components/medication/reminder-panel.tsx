'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Pill, 
  CheckCircle2, 
  Timer, 
  X,
  AlertTriangle,
  Volume2,
  VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { MedicationReminder } from '@/app/types';
import { cn } from '@/lib/utils';

interface MedicationReminderPanelProps {
  reminders: MedicationReminder[];
  onTakeMedication: (reminderId: string, scheduleId: string) => Promise<void>;
  onSnoozeReminder: (reminderId: string, minutes: number) => Promise<void>;
  onDismissReminder: (reminderId: string) => Promise<void>;
}

export function MedicationReminderPanel({
  reminders,
  onTakeMedication,
  onSnoozeReminder,
  onDismissReminder,
}: MedicationReminderPanelProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check for overdue reminders
  const overdueReminders = reminders.filter(reminder => 
    reminder.scheduledTime < currentTime && reminder.status === 'pending'
  );

  const upcomingReminders = reminders.filter(reminder => 
    reminder.scheduledTime > currentTime && reminder.status === 'pending'
  );

  const getUrgencyColor = (reminder: MedicationReminder) => {
    const timeDiff = reminder.scheduledTime.getTime() - currentTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (minutesDiff < 15) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (minutesDiff < 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const formatTimeUntil = (time: Date) => {
    const diff = time.getTime() - currentTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (diff < 0) {
      const overdue = Math.abs(minutes);
      if (overdue < 60) return `${overdue}m overdue`;
      return `${Math.floor(overdue / 60)}h ${overdue % 60}m overdue`;
    }

    if (minutes < 60) return `in ${minutes}m`;
    return `in ${hours}h ${minutes % 60}m`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700",
            overdueReminders.length > 0 && "border-red-300 bg-red-50 dark:bg-red-900/20"
          )}
        >
          <Bell className="h-4 w-4 mr-2" />
          Reminders
          {reminders.length > 0 && (
            <Badge 
              variant={overdueReminders.length > 0 ? "destructive" : "secondary"}
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {reminders.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Medication Reminders
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </SheetTitle>
          <SheetDescription>
            {reminders.length === 0 
              ? "No pending reminders" 
              : `${reminders.length} pending reminder${reminders.length === 1 ? '' : 's'}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Overdue Reminders */}
          {overdueReminders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Overdue ({overdueReminders.length})
                </h3>
              </div>
              
              {overdueReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  timeText={formatTimeUntil(reminder.scheduledTime)}
                  urgencyColor={getUrgencyColor(reminder)}
                  onTake={() => onTakeMedication(reminder.id, reminder.scheduleId)}
                  onSnooze={(minutes) => onSnoozeReminder(reminder.id, minutes)}
                  onDismiss={() => onDismissReminder(reminder.id)}
                />
              ))}
            </div>
          )}

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming ({upcomingReminders.length})
                </h3>
              </div>
              
              {upcomingReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  timeText={formatTimeUntil(reminder.scheduledTime)}
                  urgencyColor={getUrgencyColor(reminder)}
                  onTake={() => onTakeMedication(reminder.id, reminder.scheduleId)}
                  onSnooze={(minutes) => onSnoozeReminder(reminder.id, minutes)}
                  onDismiss={() => onDismissReminder(reminder.id)}
                  isUpcoming={true}
                />
              ))}
            </div>
          )}

          {reminders.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No reminders
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                You're all caught up! No pending medication reminders.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ReminderCardProps {
  reminder: MedicationReminder;
  timeText: string;
  urgencyColor: string;
  onTake: () => Promise<void>;
  onSnooze: (minutes: number) => Promise<void>;
  onDismiss: () => Promise<void>;
  isUpcoming?: boolean;
}

function ReminderCard({
  reminder,
  timeText,
  urgencyColor,
  onTake,
  onSnooze,
  onDismiss,
  isUpcoming = false,
}: ReminderCardProps) {
  const [taking, setTaking] = useState(false);
  const [snoozing, setSnoozing] = useState(false);

  const handleTake = async () => {
    setTaking(true);
    try {
      await onTake();
    } finally {
      setTaking(false);
    }
  };

  const handleSnooze = async (minutes: number) => {
    setSnoozing(true);
    try {
      await onSnooze(minutes);
    } finally {
      setSnoozing(false);
    }
  };

  return (
    <Card className={cn("border-2 transition-all duration-200", urgencyColor)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {reminder.reminderText || 'Take medication'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Scheduled: {reminder.scheduledTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              <Badge variant="outline" className="mt-2">
                {timeText}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          {!isUpcoming && (
            <Button
              size="sm"
              onClick={handleTake}
              disabled={taking}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {taking ? 'Taking...' : 'Take Now'}
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSnooze(15)}
            disabled={snoozing}
          >
            <Timer className="h-3 w-3 mr-1" />
            {snoozing ? 'Snoozing...' : '15m'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSnooze(30)}
            disabled={snoozing}
          >
            30m
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Snooze Progress */}
        {reminder.snoozeCount > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>Snoozed {reminder.snoozeCount} time{reminder.snoozeCount === 1 ? '' : 's'}</span>
              <span>{reminder.maxSnoozeCount - reminder.snoozeCount} remaining</span>
            </div>
            <Progress 
              value={(reminder.snoozeCount / reminder.maxSnoozeCount) * 100} 
              className="h-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
