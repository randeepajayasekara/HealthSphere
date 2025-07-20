"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Stethoscope,
  FileText,
  PieChart,
  LineChart,
  DollarSign,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Filter,
  Loader2,
  Calendar as CalendarIcon,
  Brain,
  Zap
} from 'lucide-react';
import { DoctorService, type DoctorAnalytics } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { toast } from 'react-hot-toast';

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  target: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TimeSeriesData {
  date: string;
  appointments: number;
  completions: number;
  cancellations: number;
  satisfaction: number;
}

interface PatientDemographics {
  ageGroups: { label: string; value: number; color: string }[];
  conditions: { label: string; value: number; color: string }[];
  insuranceTypes: { label: string; value: number; color: string }[];
}

interface Insight {
  type: 'positive' | 'warning' | 'negative' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export default function DoctorAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30_days');
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [patientDemographics, setPatientDemographics] = useState<PatientDemographics>({
    ageGroups: [],
    conditions: [],
    insuranceTypes: []
  });
  const [insights, setInsights] = useState<Insight[]>([]);

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
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // For now, we'll generate mock analytics data
      // In production, this would come from the actual DoctorService
      const mockAnalytics: DoctorAnalytics = {
        totalPatients: 245,
        totalAppointments: 312,
        completedAppointments: 298,
        cancelledAppointments: 14,
        totalPrescriptions: 189,
        averageConsultationTime: 32,
        patientSatisfactionRating: 4.6,
        periodStart: startDate,
        periodEnd: endDate
      };

      setAnalytics(mockAnalytics);
      
      // Generate insights
      generateInsights(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed successfully');
  };

  const generateInsights = (analytics: DoctorAnalytics) => {
    const generatedInsights: Insight[] = [];
    
    // Calculate key metrics
    const completionRate = analytics.totalAppointments > 0 
      ? (analytics.completedAppointments / analytics.totalAppointments) * 100 
      : 0;
    
    const cancellationRate = analytics.totalAppointments > 0
      ? (analytics.cancelledAppointments / analytics.totalAppointments) * 100
      : 0;
    
    const satisfactionScore = analytics.patientSatisfactionRating || 0;
    const avgConsultationTime = analytics.averageConsultationTime || 0;

    // Generate insights based on performance
    if (completionRate >= 95) {
      generatedInsights.push({
        type: 'positive',
        icon: CheckCircle,
        message: 'Excellent appointment completion rate',
        color: 'text-green-600',
        priority: 'high'
      });
    } else if (completionRate < 80) {
      generatedInsights.push({
        type: 'warning',
        icon: AlertTriangle,
        message: 'Consider improving appointment completion rate',
        color: 'text-yellow-600',
        priority: 'high'
      });
    }

    if (cancellationRate > 15) {
      generatedInsights.push({
        type: 'negative',
        icon: XCircle,
        message: 'High cancellation rate detected - review scheduling',
        color: 'text-red-600',
        priority: 'high'
      });
    }

    if (satisfactionScore >= 4.5) {
      generatedInsights.push({
        type: 'positive',
        icon: Star,
        message: 'Outstanding patient satisfaction scores',
        color: 'text-green-600',
        priority: 'medium'
      });
    } else if (satisfactionScore < 3.5) {
      generatedInsights.push({
        type: 'warning',
        icon: ThumbsDown,
        message: 'Patient satisfaction needs improvement',
        color: 'text-yellow-600',
        priority: 'high'
      });
    }

    if (avgConsultationTime > 60) {
      generatedInsights.push({
        type: 'info',
        icon: Clock,
        message: 'Consultation times are above average - consider efficiency',
        color: 'text-blue-600',
        priority: 'medium'
      });
    }

    if (analytics.totalPatients > 500) {
      generatedInsights.push({
        type: 'positive',
        icon: Users,
        message: 'Managing a large patient roster effectively',
        color: 'text-green-600',
        priority: 'low'
      });
    }

    setInsights(generatedInsights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'negative':
        return XCircle;
      default:
        return Activity;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Analytics & Performance
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Comprehensive insights into your medical practice and patient care
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="border-zinc-200 dark:border-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
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
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalPatients || 0)}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Active under your care
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalAppointments || 0)}</div>
            <div className="flex items-center space-x-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span>{analytics?.completedAppointments || 0} completed</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{analytics?.cancelledAppointments || 0} cancelled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Consultation</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics?.averageConsultationTime || 0)}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Average duration
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.patientSatisfactionRating ? analytics.patientSatisfactionRating.toFixed(1) : 'N/A'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-zinc-600 dark:text-zinc-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${
                    i < Math.floor(analytics?.patientSatisfactionRating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-zinc-300'
                  }`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-red-600" />
              <span>Performance Insights</span>
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your practice performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {insight.message}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 text-xs ${
                          insight.priority === 'high' ? 'border-red-200 text-red-700' :
                          insight.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {insight.priority} priority
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  <span>Appointment Completion</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Completed</span>
                    <span className="text-sm font-medium">
                      {analytics?.completedAppointments || 0} / {analytics?.totalAppointments || 0}
                    </span>
                  </div>
                  <Progress 
                    value={analytics?.totalAppointments ? (analytics.completedAppointments / analytics.totalAppointments) * 100 : 0} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Completion Rate</span>
                    <span>
                      {analytics?.totalAppointments 
                        ? Math.round((analytics.completedAppointments / analytics.totalAppointments) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Practice Efficiency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Avg. Consultation Time</span>
                    <span className="text-sm font-medium">
                      {formatTime(analytics?.averageConsultationTime || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Prescriptions Written</span>
                    <span className="text-sm font-medium">
                      {analytics?.totalPrescriptions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">On-Time Rate</span>
                    <span className="text-sm font-medium">
                      {analytics?.totalAppointments 
                        ? Math.round(((analytics.totalAppointments - analytics.cancelledAppointments) / analytics.totalAppointments) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Quality Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Patient Satisfaction</span>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {analytics?.patientSatisfactionRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Completion Rate</span>
                    <span className="text-sm font-medium">
                      {analytics?.totalAppointments 
                        ? Math.round((analytics.completedAppointments / analytics.totalAppointments) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Cancellation Rate</span>
                    <span className="text-sm font-medium">
                      {analytics?.totalAppointments 
                        ? Math.round((analytics.cancelledAppointments / analytics.totalAppointments) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>Productivity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Patients per Day</span>
                    <span className="text-sm font-medium">
                      {analytics?.totalAppointments 
                        ? Math.round(analytics.totalAppointments / 30) 
                        : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Avg. Consultation</span>
                    <span className="text-sm font-medium">
                      {formatTime(analytics?.averageConsultationTime || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Response Time</span>
                    <span className="text-sm font-medium">
                      &lt; 24h
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Patient Milestone</span>
                    <Badge variant="outline" className="text-xs">
                      {analytics?.totalPatients || 0}+ patients
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Satisfaction Score</span>
                    <Badge variant="outline" className="text-xs">
                      {analytics?.patientSatisfactionRating && analytics.patientSatisfactionRating >= 4.5 ? 'Excellent' : 
                       analytics?.patientSatisfactionRating && analytics.patientSatisfactionRating >= 4.0 ? 'Good' : 
                       analytics?.patientSatisfactionRating && analytics.patientSatisfactionRating >= 3.5 ? 'Fair' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Completion Rate</span>
                    <Badge variant="outline" className="text-xs">
                      {analytics?.totalAppointments 
                        ? Math.round((analytics.completedAppointments / analytics.totalAppointments) * 100) >= 95 ? 'Excellent' :
                          Math.round((analytics.completedAppointments / analytics.totalAppointments) * 100) >= 85 ? 'Good' : 'Needs Improvement'
                        : 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Patient Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Patient demographics data will be displayed here</p>
                  <p className="text-xs mt-1">Data visualization coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <span>Common Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Common conditions analysis will be displayed here</p>
                  <p className="text-xs mt-1">Data analysis coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-purple-600" />
                  <span>Performance Trends</span>
                </CardTitle>
                <CardDescription>
                  Track your practice performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Performance trends visualization will be displayed here</p>
                  <p className="text-xs mt-1">Time series charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
