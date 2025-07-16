"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageProvider } from '@/app/contexts/message-context';
import MessagingDashboardWidget from '@/app/components/messages/messaging-dashboard-widget';
import MessageWidget from '@/app/components/messages/message-widget';
import MessageNotificationContainer from '@/app/components/messages/message-notifications';
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText,
  TrendingUp,
  Heart,
  Thermometer,
  Pill
} from 'lucide-react';

// Example dashboard integration showing how messaging components can be embedded
const ExampleDashboard = () => {
  // Mock current user - in real implementation, get from auth context
  const currentUser = {
    id: 'user-1',
    email: 'doctor@healthsphere.com',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'doctor' as const,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <MessageProvider initialUser={currentUser}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Healthcare Dashboard
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Welcome back, Dr. Johnson. Here's your overview for today.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Stats and Quick Actions */}
            <div className="col-span-8 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                          Patients Today
                        </p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          24
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                          Appointments
                        </p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          12
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                          Lab Results
                        </p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          8
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                          Critical Cases
                        </p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          3
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <Activity className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Recent Patient Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        patient: 'John Doe',
                        activity: 'Vital signs updated',
                        time: '10 minutes ago',
                        status: 'stable',
                        icon: Heart
                      },
                      {
                        patient: 'Jane Smith',
                        activity: 'Lab results available',
                        time: '25 minutes ago',
                        status: 'review',
                        icon: FileText
                      },
                      {
                        patient: 'Bob Johnson',
                        activity: 'Temperature spike recorded',
                        time: '1 hour ago',
                        status: 'attention',
                        icon: Thermometer
                      },
                      {
                        patient: 'Alice Brown',
                        activity: 'Medication administered',
                        time: '2 hours ago',
                        status: 'completed',
                        icon: Pill
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          activity.status === 'attention' ? 'bg-red-100 dark:bg-red-900/20' :
                          activity.status === 'review' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          'bg-emerald-100 dark:bg-emerald-900/20'
                        }`}>
                          <activity.icon className={`h-5 w-5 ${
                            activity.status === 'attention' ? 'text-red-600' :
                            activity.status === 'review' ? 'text-yellow-600' :
                            'text-emerald-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {activity.patient}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {activity.activity}
                          </p>
                        </div>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Messages Widget */}
            <div className="col-span-4">
              <MessagingDashboardWidget
                showHeader={true}
                maxHeight="600px"
                allowNewConversation={true}
                className="sticky top-6"
                onConversationSelect={(conversation) => {
                  console.log('Conversation selected:', conversation);
                  // Handle conversation selection (e.g., navigate to full messages page)
                }}
              />
            </div>
          </div>

          {/* Additional Dashboard Content */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Patient Satisfaction</span>
                    <span className="font-semibold text-emerald-600">94%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Treatment Efficiency</span>
                    <span className="font-semibold text-blue-600">87%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Response Time</span>
                    <span className="font-semibold text-purple-600">92%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left">
                    <Users className="h-6 w-6 text-emerald-600 mb-2" />
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                      View Patients
                    </p>
                  </button>
                  
                  <button className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left">
                    <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                      Schedule
                    </p>
                  </button>
                  
                  <button className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left">
                    <FileText className="h-6 w-6 text-purple-600 mb-2" />
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                      Lab Results
                    </p>
                  </button>
                  
                  <button className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left">
                    <Activity className="h-6 w-6 text-red-600 mb-2" />
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                      Emergencies
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Message Widget - Alternative placement */}
        <MessageWidget
          userId={currentUser.id}
          userRole={currentUser.role}
          className="z-40" // Lower z-index than notifications
        />

        {/* Real-time Notifications */}
        <MessageNotificationContainer />
      </div>
    </MessageProvider>
  );
};

export default ExampleDashboard;
