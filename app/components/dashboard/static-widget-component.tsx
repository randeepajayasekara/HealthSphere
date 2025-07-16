"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Shield, 
  Heart, 
  Bell, 
  Video, 
  Brain, 
  TestTube, 
  Clock,
  MoreVertical,
  RefreshCw,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  Stethoscope,
  FlaskConical,
  Thermometer
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WidgetConfig } from '@/app/utils/widgets';
import type { UniversalMedicalID } from '@/app/types';

interface StaticWidgetComponentProps {
  widget: WidgetConfig;
  umid: UniversalMedicalID | null;
  data: any[];
  onRemove: () => void;
  screenWidth?: number;
  isCompactMode?: boolean;
  isRefreshing?: boolean;
}

const iconMap = {
  Calendar,
  FileText,
  Pill,
  Activity,
  Shield,
  Heart,
  Bell,
  Video,
  Brain,
  TestTube,
  Clock,
  User,
  Stethoscope,
  FlaskConical,
  Thermometer
};

export function StaticWidgetComponent({ 
  widget, 
  umid, 
  data,
  onRemove, 
  screenWidth = 1200,
  isCompactMode = false,
  isRefreshing = false
}: StaticWidgetComponentProps) {
  const [isLocalRefreshing, setIsLocalRefreshing] = useState(false);
  
  const IconComponent = iconMap[widget.icon as keyof typeof iconMap] || Calendar;

  // Determine if we should show compact view
  const isCompact = isCompactMode || screenWidth < 768;
  const isMobile = screenWidth < 640;

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'appointments':
        return renderAppointments();
      case 'medical_records':
        return renderMedicalRecords();
      case 'prescriptions':
        return renderPrescriptions();
      case 'vital_signs':
        return renderVitalSigns();
      case 'lab_results':
        return renderLabResults();
      case 'notifications':
        return renderNotifications();
      case 'umid_status':
        return renderUMIDStatus();
      case 'health_summary':
        return renderHealthSummary();
      case 'medication_reminders':
        return renderMedicationReminders();
      case 'telemedicine':
        return renderTelemedicine();
      case 'ai_assistant':
        return renderAIAssistant();
      default:
        return renderDefaultContent();
    }
  };

  const renderAppointments = () => {
    const upcomingAppointments = data.slice(0, isCompact ? 2 : 3);
    
    return (
      <div className="space-y-2">
        {upcomingAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming appointments</p>
        ) : (
          upcomingAppointments.map((appointment: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {appointment.doctorName || 'Dr. Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.type || 'Consultation'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">
                  {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'TBD'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appointment.time || '--:--'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderMedicalRecords = () => {
    const recentRecords = data.slice(0, isCompact ? 2 : 3);
    
    return (
      <div className="space-y-2">
        {recentRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent records</p>
        ) : (
          recentRecords.map((record: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-green-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {record.title || 'Medical Record'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {record.type || 'General'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {record.date ? getTimeAgo(new Date(record.date)) : 'Unknown'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderPrescriptions = () => {
    const activePrescriptions = data.slice(0, isCompact ? 2 : 3);
    
    return (
      <div className="space-y-2">
        {activePrescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active prescriptions</p>
        ) : (
          activePrescriptions.map((prescription: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
              <div className="flex items-center space-x-2">
                <Pill className="w-4 h-4 text-purple-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {prescription.medication || 'Unknown Medication'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prescription.dosage || 'As prescribed'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {prescription.status || 'Active'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderVitalSigns = () => {
    const recentVitals = data.slice(0, isCompact ? 2 : 4);
    
    return (
      <div className="space-y-2">
        {recentVitals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent vital signs</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {recentVitals.map((vital: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-red-600" />
                  <p className="text-xs font-medium">{vital.type || 'Vital'}</p>
                </div>
                <p className="text-sm font-bold">
                  {vital.value || '--'} <span className="text-xs font-normal text-muted-foreground">{vital.unit || ''}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {vital.date ? getTimeAgo(new Date(vital.date)) : 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLabResults = () => {
    const recentResults = data.slice(0, isCompact ? 2 : 3);
    
    return (
      <div className="space-y-2">
        {recentResults.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent lab results</p>
        ) : (
          recentResults.map((result: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {result.testName || 'Lab Test'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.value || '--'} {result.unit || ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={result.status === 'normal' ? 'default' : result.status === 'abnormal' ? 'destructive' : 'secondary'} 
                  className="text-xs"
                >
                  {result.status || 'Pending'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    const recentNotifications = data.slice(0, isCompact ? 3 : 5);
    
    return (
      <div className="space-y-2">
        {recentNotifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No new notifications</p>
        ) : (
          recentNotifications.map((notification: any, index: number) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
              <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {notification.title || 'Notification'}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message || 'No message'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.createdAt ? getTimeAgo(new Date(notification.createdAt)) : 'Unknown'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderUMIDStatus = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">UMID Status</span>
          </div>
          <Badge variant="default" className="text-xs">Active</Badge>
        </div>
        
        {umid ? (
          <div className="space-y-2">
            <div className="p-2 bg-green-50 dark:bg-green-950 rounded-md">
              <p className="text-xs font-medium text-green-800 dark:text-green-200">ID: {umid.umidNumber}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Issued: {umid.issueDate ? new Date(umid.issueDate).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Allergies: {umid.linkedMedicalData?.criticalAllergies?.length || 0}</p>
              <p>Conditions: {umid.linkedMedicalData?.chronicConditions?.length || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">UMID not configured</p>
        )}
      </div>
    );
  };

  const renderHealthSummary = () => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-red-600" />
              <p className="text-xs font-medium">Heart Rate</p>
            </div>
            <p className="text-sm font-bold">72 <span className="text-xs font-normal">bpm</span></p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-950 rounded-md">
            <div className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-blue-600" />
              <p className="text-xs font-medium">Temperature</p>
            </div>
            <p className="text-sm font-bold">98.6 <span className="text-xs font-normal">°F</span></p>
          </div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
          <p className="text-xs font-medium mb-1">Overall Health Score</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <span className="text-xs font-medium">78%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMedicationReminders = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Vitamin D</p>
              <p className="text-xs text-muted-foreground">Due in 2 hours</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Pending</Badge>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-800 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Lisinopril</p>
              <p className="text-xs text-muted-foreground">Taken 3 hours ago</p>
            </div>
          </div>
          <Badge variant="default" className="text-xs">Completed</Badge>
        </div>
      </div>
    );
  };

  const renderTelemedicine = () => {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">No scheduled video calls</p>
        <Button variant="outline" size="sm" className="w-full">
          <Video className="w-4 h-4 mr-2" />
          Schedule Call
        </Button>
      </div>
    );
  };

  const renderAIAssistant = () => {
    return (
      <div className="space-y-2">
        <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-md">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-medium">AI Health Assistant</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your health trends look good. Consider scheduling your annual checkup.
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          <Brain className="w-4 h-4 mr-2" />
          Ask AI
        </Button>
      </div>
    );
  };

  const renderDefaultContent = () => {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Widget data loading...</p>
      </div>
    );
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'appointments':
        return 'bg-blue-500';
      case 'prescriptions':
        return 'bg-purple-500';
      case 'vital_signs':
        return 'bg-red-500';
      case 'notifications':
        return 'bg-yellow-500';
      case 'lab_results':
        return 'bg-green-500';
      case 'umid_status':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`
      h-full transition-all duration-200 hover:shadow-lg
      ${isCompact ? 'min-h-[120px]' : 'min-h-[160px]'}
      relative group
    `}>
      <CardHeader className={`pb-2 ${isCompact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${getStatusColor(widget.type)}`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <CardTitle className={`${isCompact ? 'text-sm' : 'text-base'} font-medium truncate`}>
              {widget.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-1">
            {(isRefreshing || isLocalRefreshing) && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => {
                    setIsLocalRefreshing(true);
                    setTimeout(() => setIsLocalRefreshing(false), 1000);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove} className="text-red-600">
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${isCompact ? 'p-3 pt-0' : 'p-4 pt-0'}`}>
        {renderWidgetContent()}
        
        {widget.lastUpdated && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Updated {getTimeAgo(new Date(widget.lastUpdated))}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
