/**
 * ConsultationStatus Component
 * Displays consultation status with appropriate styling and actions
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Timer,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ConsultationStatus, ConsultationPriority } from '@/app/types';

interface ConsultationStatusProps {
  status: ConsultationStatus;
  priority: ConsultationPriority;
  onStatusChange?: (status: ConsultationStatus) => void;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  className?: string;
}

export function ConsultationStatusBadge({
  status,
  priority,
  onStatusChange,
  editable = false,
  size = 'md',
  showActions = false,
  className = ""
}: ConsultationStatusProps) {
  
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

  const getStatusIcon = (status: ConsultationStatus) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'waiting':
        return <Timer className="h-3 w-3" />;
      case 'in_progress':
        return <Play className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      case 'no_show':
        return <XCircle className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'follow_up_required':
        return <RefreshCw className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityIcon = (priority: ConsultationPriority) => {
    switch (priority) {
      case 'emergency':
        return <AlertTriangle className="h-3 w-3" />;
      case 'urgent':
        return <AlertTriangle className="h-3 w-3" />;
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusActions = (status: ConsultationStatus) => {
    const actions = [];

    if (status === 'scheduled') {
      actions.push(
        <Button 
          key="start"
          size="sm"
          onClick={() => onStatusChange?.('in_progress')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
      );
    }

    if (status === 'in_progress') {
      actions.push(
        <Button 
          key="pause"
          size="sm"
          variant="outline"
          onClick={() => onStatusChange?.('paused')}
        >
          <Pause className="h-4 w-4" />
        </Button>,
        <Button 
          key="complete"
          size="sm"
          onClick={() => onStatusChange?.('completed')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Complete
        </Button>
      );
    }

    if (status === 'paused') {
      actions.push(
        <Button 
          key="resume"
          size="sm"
          onClick={() => onStatusChange?.('in_progress')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Resume
        </Button>
      );
    }

    if (status === 'waiting') {
      actions.push(
        <Button 
          key="start-waiting"
          size="sm"
          onClick={() => onStatusChange?.('in_progress')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
      );
    }

    return actions;
  };

  if (editable && onStatusChange) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Scheduled</span>
              </div>
            </SelectItem>
            <SelectItem value="waiting">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span>Waiting</span>
              </div>
            </SelectItem>
            <SelectItem value="in_progress">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>In Progress</span>
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </div>
            </SelectItem>
            <SelectItem value="cancelled">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Cancelled</span>
              </div>
            </SelectItem>
            <SelectItem value="paused">
              <div className="flex items-center space-x-2">
                <Pause className="h-4 w-4" />
                <span>Paused</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Badge className={getPriorityColor(priority)}>
          {getPriorityIcon(priority)}
          <span className="ml-1">{priority}</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge className={getStatusColor(status)}>
        {getStatusIcon(status)}
        <span className="ml-1">{status.replace('_', ' ')}</span>
      </Badge>
      <Badge className={getPriorityColor(priority)}>
        {getPriorityIcon(priority)}
        <span className="ml-1">{priority}</span>
      </Badge>
      {showActions && (
        <div className="flex items-center space-x-1">
          {getStatusActions(status)}
        </div>
      )}
    </div>
  );
}

export default ConsultationStatusBadge;
