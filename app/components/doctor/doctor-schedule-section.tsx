"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Save, 
  X,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { DoctorProfile, User, AvailabilitySchedule, TimeSlot } from "@/app/types";
import { DoctorService } from "@/lib/firestore/doctor-service";
import toast from "react-hot-toast";

// Extended TimeSlot interface for internal component use
interface ExtendedTimeSlot extends TimeSlot {
  type: 'consultation' | 'surgery' | 'emergency' | 'break';
  maxAppointments?: number;
  available: boolean;
}

// Extended AvailabilitySchedule for internal use
interface ExtendedAvailabilitySchedule {
  monday: ExtendedTimeSlot[];
  tuesday: ExtendedTimeSlot[];
  wednesday: ExtendedTimeSlot[];
  thursday: ExtendedTimeSlot[];
  friday: ExtendedTimeSlot[];
  saturday: ExtendedTimeSlot[];
  sunday: ExtendedTimeSlot[];
}

interface DoctorScheduleSectionProps {
  user: User;
}

export function DoctorScheduleSection({ user }: DoctorScheduleSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [schedule, setSchedule] = useState<ExtendedAvailabilitySchedule>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Monday', icon: Calendar },
    { key: 'tuesday', label: 'Tuesday', icon: Calendar },
    { key: 'wednesday', label: 'Wednesday', icon: Calendar },
    { key: 'thursday', label: 'Thursday', icon: Calendar },
    { key: 'friday', label: 'Friday', icon: Calendar },
    { key: 'saturday', label: 'Saturday', icon: Calendar },
    { key: 'sunday', label: 'Sunday', icon: Calendar }
  ];

  useEffect(() => {
    loadDoctorProfile();
  }, [user.id]);

  const loadDoctorProfile = async () => {
    try {
      const response = await DoctorService.getDoctorProfile(user.id);
      if (response.data) {
        setDoctorProfile(response.data);
        // Convert basic TimeSlot to ExtendedTimeSlot
        const basicSchedule = response.data.availabilitySchedule || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        };
        
        const extendedSchedule: ExtendedAvailabilitySchedule = {
          monday: basicSchedule.monday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || [],
          tuesday: basicSchedule.tuesday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || [],
          wednesday: basicSchedule.wednesday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || [],
          thursday: basicSchedule.thursday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || [],
          friday: basicSchedule.friday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || [],
          saturday: basicSchedule.saturday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || [],
          sunday: basicSchedule.sunday?.map(slot => ({
            ...slot,
            type: 'consultation' as const,
            maxAppointments: 8,
            available: true
          })) || []
        };
        
        setSchedule(extendedSchedule);
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error);
      toast.error("Failed to load schedule");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert ExtendedTimeSlot back to basic TimeSlot for saving
      const basicSchedule: AvailabilitySchedule = {
        monday: schedule.monday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        tuesday: schedule.tuesday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        wednesday: schedule.wednesday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        thursday: schedule.thursday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        friday: schedule.friday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        saturday: schedule.saturday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        })),
        sunday: schedule.sunday.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      };

      const response = await DoctorService.updateDoctorProfile(user.id, {
        availabilitySchedule: basicSchedule
      });
      
      if (response.data) {
        setDoctorProfile(response.data);
        setIsEditing(false);
        toast.success("Schedule updated successfully");
      } else {
        toast.error(response.error?.message || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDoctorProfile();
  };

  const addTimeSlot = (day: keyof ExtendedAvailabilitySchedule) => {
    const newSlot: ExtendedTimeSlot = {
      startTime: "09:00",
      endTime: "17:00",
      type: "consultation",
      maxAppointments: 8,
      available: true
    };

    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot]
    }));
  };

  const updateTimeSlot = (day: keyof ExtendedAvailabilitySchedule, index: number, field: keyof ExtendedTimeSlot, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeTimeSlot = (day: keyof ExtendedAvailabilitySchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'surgery':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'emergency':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'break':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300';
    }
  };

  const getSlotTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Briefcase className="h-3 w-3" />;
      case 'surgery':
        return <AlertCircle className="h-3 w-3" />;
      case 'emergency':
        return <AlertCircle className="h-3 w-3" />;
      case 'break':
        return <Coffee className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const calculateWeeklyHours = () => {
    let totalHours = 0;
    Object.values(schedule).forEach((daySlots: ExtendedTimeSlot[]) => {
      daySlots.forEach(slot => {
        if (slot.available) {
          const start = new Date(`2000-01-01T${slot.startTime}`);
          const end = new Date(`2000-01-01T${slot.endTime}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          totalHours += hours;
        }
      });
    });
    return totalHours;
  };

  const getTotalAppointmentSlots = () => {
    let totalSlots = 0;
    Object.values(schedule).forEach((daySlots: ExtendedTimeSlot[]) => {
      daySlots.forEach(slot => {
        if (slot.available && slot.type === 'consultation') {
          totalSlots += slot.maxAppointments || 0;
        }
      });
    });
    return totalSlots;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Schedule & Availability
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your working hours and availability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Schedule
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
              Weekly Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {calculateWeeklyHours()}h
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Total working hours per week
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
              Appointment Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {getTotalAppointmentSlots()}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Weekly appointment capacity
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
              Working Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {Object.values(schedule).filter(daySlots => daySlots.length > 0).length}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Days per week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-red-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map(day => (
            <div key={day.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <day.icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {day.label}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {schedule[day.key as keyof ExtendedAvailabilitySchedule].length} slots
                  </Badge>
                </div>
                {isEditing && (
                  <Button
                    onClick={() => addTimeSlot(day.key as keyof ExtendedAvailabilitySchedule)}
                    size="sm"
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Slot
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {schedule[day.key as keyof ExtendedAvailabilitySchedule].length === 0 ? (
                  <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                    <p className="text-sm">No schedule set for {day.label}</p>
                  </div>
                ) : (
                  schedule[day.key as keyof ExtendedAvailabilitySchedule].map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        slot.available 
                          ? 'border-zinc-200 dark:border-zinc-700' 
                          : 'border-zinc-200 dark:border-zinc-700 opacity-50'
                      }`}
                    >
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                          <div className="space-y-1">
                            <Label className="text-xs">Start Time</Label>
                            <Select
                              value={slot.startTime}
                              onValueChange={(value) => updateTimeSlot(day.key as keyof ExtendedAvailabilitySchedule, index, 'startTime', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                    {`${i.toString().padStart(2, '0')}:00`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">End Time</Label>
                            <Select
                              value={slot.endTime}
                              onValueChange={(value) => updateTimeSlot(day.key as keyof ExtendedAvailabilitySchedule, index, 'endTime', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                    {`${i.toString().padStart(2, '0')}:00`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={slot.type}
                              onValueChange={(value) => updateTimeSlot(day.key as keyof ExtendedAvailabilitySchedule, index, 'type', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consultation">Consultation</SelectItem>
                                <SelectItem value="surgery">Surgery</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="break">Break</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Available</Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={slot.available}
                                onCheckedChange={(checked) => updateTimeSlot(day.key as keyof ExtendedAvailabilitySchedule, index, 'available', checked)}
                              />
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                {slot.available ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button
                              onClick={() => removeTimeSlot(day.key as keyof ExtendedAvailabilitySchedule, index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <Badge className={getSlotTypeColor(slot.type)}>
                              {getSlotTypeIcon(slot.type)}
                              <span className="ml-1 capitalize">{slot.type}</span>
                            </Badge>
                            {slot.maxAppointments && slot.type === 'consultation' && (
                              <Badge variant="outline" className="text-xs">
                                {slot.maxAppointments} slots
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {slot.available ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              {slot.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Schedule Templates */}
      {isEditing && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Quick Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  const standardSchedule: ExtendedAvailabilitySchedule = {
                    monday: [{ startTime: "09:00", endTime: "17:00", type: "consultation", maxAppointments: 8, available: true }],
                    tuesday: [{ startTime: "09:00", endTime: "17:00", type: "consultation", maxAppointments: 8, available: true }],
                    wednesday: [{ startTime: "09:00", endTime: "17:00", type: "consultation", maxAppointments: 8, available: true }],
                    thursday: [{ startTime: "09:00", endTime: "17:00", type: "consultation", maxAppointments: 8, available: true }],
                    friday: [{ startTime: "09:00", endTime: "17:00", type: "consultation", maxAppointments: 8, available: true }],
                    saturday: [],
                    sunday: []
                  };
                  setSchedule(standardSchedule);
                }}
                variant="outline"
                className="justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Standard Weekdays (9 AM - 5 PM)
              </Button>
              
              <Button
                onClick={() => {
                  const extendedSchedule: ExtendedAvailabilitySchedule = {
                    monday: [{ startTime: "08:00", endTime: "18:00", type: "consultation", maxAppointments: 10, available: true }],
                    tuesday: [{ startTime: "08:00", endTime: "18:00", type: "consultation", maxAppointments: 10, available: true }],
                    wednesday: [{ startTime: "08:00", endTime: "18:00", type: "consultation", maxAppointments: 10, available: true }],
                    thursday: [{ startTime: "08:00", endTime: "18:00", type: "consultation", maxAppointments: 10, available: true }],
                    friday: [{ startTime: "08:00", endTime: "18:00", type: "consultation", maxAppointments: 10, available: true }],
                    saturday: [{ startTime: "09:00", endTime: "13:00", type: "consultation", maxAppointments: 4, available: true }],
                    sunday: []
                  };
                  setSchedule(extendedSchedule);
                }}
                variant="outline"
                className="justify-start"
              >
                <Moon className="h-4 w-4 mr-2" />
                Extended Hours (8 AM - 6 PM + Saturday)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
