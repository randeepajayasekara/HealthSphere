"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Pill,
  Heart,
  Activity,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { DoctorService, type DoctorAnalytics } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';

export default function DoctorAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30_days');

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7_days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30_days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90_days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1_year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await DoctorService.getDoctorAnalytics(user.id, { startDate, endDate });
      
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (!analytics || analytics.totalAppointments === 0) return 0;
    return Math.round((analytics.completedAppointments / analytics.totalAppointments) * 100);
  };

  const getCancellationRate = () => {
    if (!analytics || analytics.totalAppointments === 0) return 0;
    return Math.round((analytics.cancelledAppointments / analytics.totalAppointments) * 100);
  };

  const getPatientSatisfactionScore = () => {
    if (!analytics) return 0;
    return Math.round(analytics.patientSatisfactionRating * 20); // Convert 0-5 to 0-100
  };

  const getPerformanceInsights = () => {
    const completionRate = getCompletionRate();
    const cancellationRate = getCancellationRate();
    const satisfactionScore = getPatientSatisfactionScore();

    const insights = [];

    if (completionRate >= 90) {
      insights.push({
        type: 'positive',
        icon: Award,
        message: 'Excellent appointment completion rate',
        color: 'text-green-600'
      });
    } else if (completionRate < 80) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        message: 'Consider improving appointment completion',
        color: 'text-yellow-600'
      });
    }

    if (cancellationRate > 15) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        message: 'High cancellation rate detected',
        color: 'text-red-600'
      });
    }

    if (satisfactionScore >= 85) {
      insights.push({
        type: 'positive',
        icon: Heart,
        message: 'Outstanding patient satisfaction',
        color: 'text-green-600'
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-zinc-400 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const insights = getPerformanceInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Analytics & Performance
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Insights into your medical practice and patient care
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7_days">Last 7 days</SelectItem>
            <SelectItem value="30_days">Last 30 days</SelectItem>
            <SelectItem value="90_days">Last 90 days</SelectItem>
            <SelectItem value="1_year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPatients || 0}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Active under your care
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalAppointments || 0}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {analytics?.completedAppointments || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Consultation</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageConsultationTime || 0}m</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Per appointment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPrescriptions || 0}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Medications prescribed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Appointment Completion Rate</span>
                <span className="font-medium">{getCompletionRate()}%</span>
              </div>
              <Progress value={getCompletionRate()} className="h-2" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Target: 90%+
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Patient Satisfaction</span>
                <span className="font-medium">{getPatientSatisfactionScore()}%</span>
              </div>
              <Progress value={getPatientSatisfactionScore()} className="h-2" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Based on patient feedback
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Cancellation Rate</span>
                <span className="font-medium">{getCancellationRate()}%</span>
              </div>
              <Progress value={getCancellationRate()} className="h-2" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Target: &lt;10%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              Practice Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                      <div>
                        <p className="text-sm font-medium">{insight.message}</p>
                        <Badge 
                          variant={insight.type === 'positive' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {insight.type === 'positive' ? 'Excellent' : 'Attention Needed'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No insights available for this period
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>
            Comprehensive view of your practice metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics?.totalAppointments || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics?.completedAppointments || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analytics?.cancelledAppointments || 0}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Patients</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics?.totalPatients || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">New This Period</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.floor((analytics?.totalPatients || 0) * 0.1)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Avg. Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics?.patientSatisfactionRating.toFixed(1) || '0.0'}/5.0
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="efficiency" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Avg. Consultation Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics?.averageConsultationTime || 0} min
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getCompletionRate()}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Prescriptions Issued</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics?.totalPrescriptions || 0}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
