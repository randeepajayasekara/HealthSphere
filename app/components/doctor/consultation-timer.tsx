/**
 * ConsultationTimer Component
 * Tracks and displays consultation duration with real-time updates
 */

import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, Square } from 'lucide-react';
import { ConsultationStatus } from '@/app/types';

interface ConsultationTimerProps {
  startTime?: Date;
  endTime?: Date;
  status: ConsultationStatus;
  onStatusChange?: (status: ConsultationStatus) => void;
  showControls?: boolean;
  className?: string;
}

export function ConsultationTimer({
  startTime,
  endTime,
  status,
  onStatusChange,
  showControls = true,
  className = ""
}: ConsultationTimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (startTime && status === 'in_progress') {
      const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(Math.max(0, elapsed));
    } else if (startTime && endTime) {
      const elapsed = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(Math.max(0, elapsed));
    }
  }, [startTime, endTime, currentTime, status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  const getTimerColor = () => {
    if (status === 'in_progress') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    } else if (status === 'paused') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    } else if (status === 'completed') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    } else {
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
    }
  };

  const getTimerIcon = () => {
    if (status === 'in_progress') {
      return <Timer className="h-4 w-4 animate-pulse" />;
    } else if (status === 'paused') {
      return <Pause className="h-4 w-4" />;
    } else if (status === 'completed') {
      return <Square className="h-4 w-4" />;
    } else {
      return <Timer className="h-4 w-4" />;
    }
  };

  const handleStart = () => {
    onStatusChange?.('in_progress');
  };

  const handlePause = () => {
    onStatusChange?.('paused');
  };

  const handleResume = () => {
    onStatusChange?.('in_progress');
  };

  const handleStop = () => {
    onStatusChange?.('completed');
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Badge className={getTimerColor()}>
        {getTimerIcon()}
        <span className="ml-2 font-mono text-sm">
          {formatTime(elapsedTime)}
        </span>
      </Badge>

      {showControls && (
        <div className="flex items-center space-x-2">
          {status === 'scheduled' && (
            <Button
              size="sm"
              onClick={handleStart}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}

          {status === 'in_progress' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePause}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button
                size="sm"
                onClick={handleStop}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Square className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </>
          )}

          {status === 'paused' && (
            <Button
              size="sm"
              onClick={handleResume}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Additional timer utilities
export const ConsultationTimerUtils = {
  formatDuration: (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  getDurationMinutes: (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    return Math.floor((end.getTime() - startTime.getTime()) / (1000 * 60));
  },

  isOvertime: (startTime: Date, expectedDuration: number, endTime?: Date) => {
    const actualDuration = ConsultationTimerUtils.getDurationMinutes(startTime, endTime);
    return actualDuration > expectedDuration;
  }
};

export default ConsultationTimer;
