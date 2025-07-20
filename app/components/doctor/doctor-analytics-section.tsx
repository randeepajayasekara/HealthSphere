"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Award,
  Target,
  PieChart
} from "lucide-react";
import { DoctorProfile, User } from "@/app/types";
import { DoctorService } from "@/lib/firestore/doctor-service";
import toast from "react-hot-toast";

interface DoctorAnalyticsSectionProps {
  user: User;
}

interface PerformanceMetrics {
  totalPatients: number;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
  appointmentsNoShow: number;
  averageRating: number;
  totalReviews: number;
  revenue: number;
  consultationTime: number;
  patientSatisfaction: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  specialization: string;
  department: string;
}

interface AppointmentStats {
  completed: number;
  cancelled: number;
  noShow: number;
  pending: number;
  total: number;
}

export function DoctorAnalyticsSection({ user }: DoctorAnalyticsSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalPatients: 0,
    appointmentsCompleted: 0,
    appointmentsCancelled: 0,
    appointmentsNoShow: 0,
    averageRating: 0,
    totalReviews: 0,
    revenue: 0,
    consultationTime: 0,
    patientSatisfaction: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    specialization: '',
    department: ''
  });

  useEffect(() => {
    loadDoctorProfile();
    loadAnalyticsData();
  }, [user.id, timeRange]);

  const loadDoctorProfile = async () => {
    try {
      const response = await DoctorService.getDoctorProfile(user.id);
      if (response.data) {
        setDoctorProfile(response.data);
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error);
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration - in real app, this would come from API
      const mockMetrics: PerformanceMetrics = {
        totalPatients: 247,
        appointmentsCompleted: 189,
        appointmentsCancelled: 23,
        appointmentsNoShow: 15,
        averageRating: 4.7,
        totalReviews: 142,
        revenue: 28500,
        consultationTime: 25,
        patientSatisfaction: 92,
        weeklyGrowth: 12,
        monthlyGrowth: 18,
        specialization: doctorProfile?.specialization || 'General Medicine',
        department: doctorProfile?.department || 'Internal Medicine'
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentStats = (): AppointmentStats => {
    const total = metrics.appointmentsCompleted + metrics.appointmentsCancelled + metrics.appointmentsNoShow;
    return {
      completed: metrics.appointmentsCompleted,
      cancelled: metrics.appointmentsCancelled,
      noShow: metrics.appointmentsNoShow,
      pending: Math.max(0, total - metrics.appointmentsCompleted - metrics.appointmentsCancelled - metrics.appointmentsNoShow),
      total
    };
  };

  const getPerformanceGrade = () => {
    const completionRate = (metrics.appointmentsCompleted / (metrics.appointmentsCompleted + metrics.appointmentsCancelled + metrics.appointmentsNoShow)) * 100;
    const satisfactionScore = metrics.patientSatisfaction;
    const ratingScore = (metrics.averageRating / 5) * 100;
    
    const overallScore = (completionRate + satisfactionScore + ratingScore) / 3;
    
    if (overallScore >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (overallScore >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (overallScore >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    if (overallScore >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    if (overallScore >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const appointmentStats = getAppointmentStats();
  const performanceGrade = getPerformanceGrade();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Analytics & Performance
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Track your practice performance and patient metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.totalPatients}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{metrics.weeklyGrowth}%</span>
              <span className="text-xs text-zinc-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {appointmentStats.total}
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">
                {Math.round((appointmentStats.completed / appointmentStats.total) * 100)}% completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.averageRating}/5
            </div>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {metrics.totalReviews} reviews
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ${metrics.revenue.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{metrics.monthlyGrowth}%</span>
              <span className="text-xs text-zinc-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Grade */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Performance Grade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full ${performanceGrade.bg} flex items-center justify-center`}>
                <span className={`text-2xl font-bold ${performanceGrade.color}`}>
                  {performanceGrade.grade}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Excellent Performance
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Based on appointment completion, patient satisfaction, and ratings
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {Math.round((appointmentStats.completed / appointmentStats.total) * 100)}%
                </div>
                <div className="text-xs text-zinc-500">Completion Rate</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {metrics.patientSatisfaction}%
                </div>
                <div className="text-xs text-zinc-500">Satisfaction</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {metrics.averageRating}/5
                </div>
                <div className="text-xs text-zinc-500">Average Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Breakdown */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Appointment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Completed</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {appointmentStats.completed}
              </span>
            </div>
            <Progress 
              value={(appointmentStats.completed / appointmentStats.total) * 100} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Cancelled</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {appointmentStats.cancelled}
              </span>
            </div>
            <Progress 
              value={(appointmentStats.cancelled / appointmentStats.total) * 100} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">No Show</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {appointmentStats.noShow}
              </span>
            </div>
            <Progress 
              value={(appointmentStats.noShow / appointmentStats.total) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Patient Satisfaction Metrics */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Patient Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Overall Satisfaction</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {metrics.patientSatisfaction}%
              </span>
            </div>
            <Progress value={metrics.patientSatisfaction} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Average Rating</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= metrics.averageRating
                        ? 'text-yellow-500 fill-current'
                        : 'text-zinc-300'
                    }`}
                  />
                ))}
                <span className="ml-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  {metrics.averageRating}/5
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Consultation Time</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {metrics.consultationTime} min avg
              </span>
            </div>
            <Progress value={(metrics.consultationTime / 60) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              className="justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Reports
            </Button>
            
            <Button 
              variant="outline"
              className="justify-start hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Users className="h-4 w-4 mr-2" />
              Patient Feedback
            </Button>
            
            <Button 
              variant="outline"
              className="justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Target className="h-4 w-4 mr-2" />
              Set Performance Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
