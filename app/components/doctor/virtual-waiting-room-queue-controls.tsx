/**
 * Virtual Waiting Room Queue Controls Component
 * Provides filtering, sorting, and bulk actions for the waiting room queue
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  SortDesc, 
  SortAsc, 
  RefreshCw, 
  Users, 
  UserPlus, 
  Bell,
  Settings,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VirtualWaitingRoomPatient } from '@/lib/firestore/virtual-waiting-room-service';

interface VirtualWaitingRoomQueueControlsProps {
  patients: VirtualWaitingRoomPatient[];
  onRefresh: () => void;
  onNotifyAllPatients: () => void;
  onSeedDummyData: () => void;
  onExportQueue: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  className?: string;
}

export function VirtualWaitingRoomQueueControls({
  patients,
  onRefresh,
  onNotifyAllPatients,
  onSeedDummyData,
  onExportQueue,
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  className = ""
}: VirtualWaitingRoomQueueControlsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const urgentCount = patients.filter(p => p.priority === 'urgent').length;
  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const readyCount = patients.filter(p => p.status === 'ready').length;

  return (
    <Card className={`border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-red-600" />
            <span>Queue Controls</span>
          </div>
          <div className="flex items-center space-x-2">
            {urgentCount > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {urgentCount} urgent
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              {waitingCount} waiting
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {readyCount} ready
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black"
            />
          </div>
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-full sm:w-32 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-32 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in_consultation">In Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort and Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joinedAt">Join Time</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="patientName">Patient Name</SelectItem>
                <SelectItem value="estimatedWaitTime">Wait Time</SelectItem>
                <SelectItem value="consultationType">Consultation Type</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="border-zinc-200 dark:border-zinc-800"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-zinc-200 dark:border-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNotifyAllPatients}
              className="border-zinc-200 dark:border-zinc-800"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notify All
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportQueue}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Queue
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSeedDummyData}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Test Patients
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || priorityFilter !== 'all' || statusFilter !== 'all') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg"
          >
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchTerm}
              </Badge>
            )}
            {priorityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Priority: {priorityFilter}
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {statusFilter}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange('');
                onPriorityFilterChange('all');
                onStatusFilterChange('all');
              }}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
