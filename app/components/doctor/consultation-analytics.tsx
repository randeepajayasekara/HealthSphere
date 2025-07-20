/**
 * ConsultationAnalytics Component
 * Displays analytics and insights about consultation patterns
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Timer
} from 'lucide-react';
import { Consultation, ConsultationStatus, ConsultationType } from '@/app/types';

interface ConsultationAnalyticsProps {
  consultations: Consultation[];
  timeRange?: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'day' | 'week' | 'month' | 'year') => void;
  className?: string;
}

interface AnalyticsData {
  totalConsultations: number;
  averageDuration: number;
  completionRate: number;
  noShowRate: number;
  statusDistribution: Record<ConsultationStatus, number>;
  typeDistribution: Record<ConsultationType, number>;
  dailyTrends: { date: string; count: number }[];
  busyHours: { hour: number; count: number }[];
  patientSatisfaction: number;
}

export function ConsultationAnalytics({
  consultations,
  timeRange = 'week',
  onTimeRangeChange,
  className = ""
}: ConsultationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConsultations: 0,
    averageDuration: 0,
    completionRate: 0,
    noShowRate: 0,
    statusDistribution: {} as Record<ConsultationStatus, number>,
    typeDistribution: {} as Record<ConsultationType, number>,
    dailyTrends: [],
    busyHours: [],
    patientSatisfaction: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [consultations, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const filteredConsultations = consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      
      switch (timeRange) {
        case 'day':
          return consultationDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return consultationDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return consultationDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return consultationDate >= yearAgo;
        default:
          return true;
      }
    });

    const totalConsultations = filteredConsultations.length;
    
    // Calculate average duration
    const completedConsultations = filteredConsultations.filter(c => c.duration);
    const averageDuration = completedConsultations.length > 0 
      ? completedConsultations.reduce((sum, c) => sum + (c.duration || 0), 0) / completedConsultations.length
      : 0;

    // Calculate completion rate
    const completedCount = filteredConsultations.filter(c => c.status === 'completed').length;
    const completionRate = totalConsultations > 0 ? (completedCount / totalConsultations) * 100 : 0;

    // Calculate no-show rate
    const noShowCount = filteredConsultations.filter(c => c.status === 'no_show').length;
    const noShowRate = totalConsultations > 0 ? (noShowCount / totalConsultations) * 100 : 0;

    // Status distribution
    const statusDistribution = filteredConsultations.reduce((acc, consultation) => {
      acc[consultation.status] = (acc[consultation.status] || 0) + 1;
      return acc;
    }, {} as Record<ConsultationStatus, number>);

    // Type distribution
    const typeDistribution = filteredConsultations.reduce((acc, consultation) => {
      acc[consultation.type] = (acc[consultation.type] || 0) + 1;
      return acc;
    }, {} as Record<ConsultationType, number>);

    // Daily trends
    const dailyTrends = calculateDailyTrends(filteredConsultations);

    // Busy hours
    const busyHours = calculateBusyHours(filteredConsultations);

    // Patient satisfaction
    const satisfactionRatings = filteredConsultations
      .filter(c => c.patientSatisfaction?.rating)
      .map(c => c.patientSatisfaction!.rating);
    const patientSatisfaction = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length
      : 0;

    setAnalytics({
      totalConsultations,
      averageDuration,
      completionRate,
      noShowRate,
      statusDistribution,
      typeDistribution,
      dailyTrends,
      busyHours,
      patientSatisfaction
    });
  };

  const calculateDailyTrends = (consultations: Consultation[]) => {
    const trends: { date: string; count: number }[] = [];
    const dailyCounts: Record<string, number> = {};

    consultations.forEach(consultation => {
      const dateKey = new Date(consultation.date).toDateString();
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    });

    Object.entries(dailyCounts).forEach(([date, count]) => {
      trends.push({ date, count });
    });

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateBusyHours = (consultations: Consultation[]) => {
    const hourCounts: Record<number, number> = {};

    consultations.forEach(consultation => {
      const hour = parseInt(consultation.startTime.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    })).sort((a, b) => a.hour - b.hour);
  };

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'no_show':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    trend, 
    trendDirection 
  }: { 
    title: string; 
    value: number; 
    unit?: string; 
    icon: any; 
    trend?: number; 
    trendDirection?: 'up' | 'down' | 'stable'; 
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {value.toFixed(unit === '%' ? 1 : 0)}{unit}
            </p>
            {trend && (
              <div className={`flex items-center space-x-1 text-xs ${
                trendDirection === 'up' ? 'text-green-600 dark:text-green-400' :
                trendDirection === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-zinc-600 dark:text-zinc-400'
              }`}>
                <TrendingUp className="h-3 w-3" />
                <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Consultation Analytics
        </h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Consultations"
          value={analytics.totalConsultations}
          icon={Users}
        />
        <MetricCard
          title="Average Duration"
          value={analytics.averageDuration}
          unit="min"
          icon={Timer}
        />
        <MetricCard
          title="Completion Rate"
          value={analytics.completionRate}
          unit="%"
          icon={Activity}
        />
        <MetricCard
          title="Patient Satisfaction"
          value={analytics.patientSatisfaction}
          unit="/5"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(status as ConsultationStatus)}>
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Consultation Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.typeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{type}</Badge>
                  </div>
                  <div className="text-sm font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Daily Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.dailyTrends.slice(-7).map(trend => (
                <div key={trend.date} className="flex items-center justify-between">
                  <span className="text-sm">{new Date(trend.date).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (trend.count / Math.max(...analytics.dailyTrends.map(t => t.count))) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{trend.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Busy Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Busy Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.busyHours.slice(0, 8).map(hour => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm">{hour.hour}:00 - {hour.hour + 1}:00</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (hour.count / Math.max(...analytics.busyHours.map(h => h.count))) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{hour.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ConsultationAnalytics;
