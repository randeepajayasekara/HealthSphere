/**
 * Virtual Waiting Room Stats Component
 * Displays real-time statistics and metrics
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Timer,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import type { VirtualWaitingRoomStats } from '@/lib/firestore/virtual-waiting-room-service';

interface VirtualWaitingRoomStatsProps {
  stats: VirtualWaitingRoomStats;
  className?: string;
}

export function VirtualWaitingRoomStats({ stats, className = "" }: VirtualWaitingRoomStatsProps) {
  const statCards = [
    {
      title: "Patients Waiting",
      value: stats.totalPatientsWaiting.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Currently in queue"
    },
    {
      title: "Average Wait Time",
      value: `${stats.averageWaitTime}m`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Across all patients"
    },
    {
      title: "Longest Wait",
      value: `${stats.longestWaitTime}m`,
      icon: Timer,
      color: stats.longestWaitTime > 30 ? "text-red-600" : "text-yellow-600",
      bgColor: stats.longestWaitTime > 30 ? "bg-red-100 dark:bg-red-900/20" : "bg-yellow-100 dark:bg-yellow-900/20",
      description: "Current longest"
    },
    {
      title: "Served Today",
      value: stats.patientsServedToday.toString(),
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Consultations completed"
    },
    {
      title: "Consultation Rate",
      value: `${Math.round(stats.consultationsCompleted / Math.max(1, stats.patientsServedToday) * 100)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "Completion rate"
    },
    {
      title: "Avg Session Duration",
      value: `${stats.averageConsultationDuration}m`,
      icon: Activity,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      description: "Per consultation"
    }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span>{stat.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {stat.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
