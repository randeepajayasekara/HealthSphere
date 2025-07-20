"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot, 
  MessageCircle, 
  Settings, 
  Save, 
  RefreshCw, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Zap,
  Shield,
  Globe,
  Edit,
  Trash2
} from "lucide-react";
import { DoctorProfile } from "@/app/types";
import { DoctorService } from "@/lib/firestore/doctor-service";
import toast from "react-hot-toast";

interface ChatbotConfiguration {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  personality: 'professional' | 'friendly' | 'empathetic' | 'concise';
  responseTime: 'immediate' | 'quick' | 'normal' | 'thoughtful';
  language: string;
  specialty: string;
  knowledgeBase: string[];
  autoResponses: {
    greeting: string;
    farewell: string;
    confusion: string;
    emergency: string;
  };
  restrictions: {
    noMedicalAdvice: boolean;
    requireDoctorApproval: boolean;
    businessHoursOnly: boolean;
    maxConversationLength: number;
  };
  integrations: {
    appointmentBooking: boolean;
    prescriptionRefills: boolean;
    labResults: boolean;
    emergencyAlerts: boolean;
  };
  analytics: {
    totalConversations: number;
    satisfactionScore: number;
    resolvedQueries: number;
    escalatedToDoctor: number;
  };
}

export default function ChatbotManagementPage() {
  const { user, isLoading, error } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfiguration>({
    id: '',
    name: '',
    description: '',
    isActive: false,
    personality: 'professional',
    responseTime: 'normal',
    language: 'en',
    specialty: '',
    knowledgeBase: [],
    autoResponses: {
      greeting: '',
      farewell: '',
      confusion: '',
      emergency: ''
    },
    restrictions: {
      noMedicalAdvice: true,
      requireDoctorApproval: false,
      businessHoursOnly: false,
      maxConversationLength: 10
    },
    integrations: {
      appointmentBooking: false,
      prescriptionRefills: false,
      labResults: false,
      emergencyAlerts: true
    },
    analytics: {
      totalConversations: 0,
      satisfactionScore: 0,
      resolvedQueries: 0,
      escalatedToDoctor: 0
    }
  });
  const [isLoading2, setIsLoading2] = useState(false);
  const [activeTab, setActiveTab] = useState<'configuration' | 'responses' | 'analytics'>('configuration');

  useEffect(() => {
    if (user) {
      loadDoctorProfile();
      loadChatbotConfiguration();
    }
  }, [user]);

  const loadDoctorProfile = async () => {
    if (!user) return;
    
    try {
      const response = await DoctorService.getDoctorProfile(user.id);
      if (response.data) {
        setDoctorProfile(response.data);
        setChatbotConfig(prev => ({
          ...prev,
          specialty: response.data!.specialization || '',
          name: `Dr. ${response.data!.firstName} ${response.data!.lastName} Assistant`
        }));
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error);
    }
  };

  const loadChatbotConfiguration = async () => {
    if (!user) return;
    
    try {
      // Mock data for demonstration - in real app, this would come from API
      const mockConfig: ChatbotConfiguration = {
        id: user.id + '_chatbot',
        name: `Dr. ${user.firstName} ${user.lastName} Assistant`,
        description: 'AI-powered medical assistant for patient inquiries and appointment scheduling',
        isActive: true,
        personality: 'professional',
        responseTime: 'normal',
        language: 'en',
        specialty: doctorProfile?.specialization || 'General Medicine',
        knowledgeBase: [
          'General medical information',
          'Appointment scheduling',
          'Practice policies',
          'Common symptoms',
          'Preventive care'
        ],
        autoResponses: {
          greeting: 'Hello! I\'m Dr. ' + user.lastName + '\'s AI assistant. How may I help you today?',
          farewell: 'Thank you for contacting our practice. Have a great day!',
          confusion: 'I\'m sorry, I didn\'t understand that. Could you please rephrase your question?',
          emergency: 'If this is a medical emergency, please call 911 or go to the nearest emergency room immediately.'
        },
        restrictions: {
          noMedicalAdvice: true,
          requireDoctorApproval: false,
          businessHoursOnly: false,
          maxConversationLength: 15
        },
        integrations: {
          appointmentBooking: true,
          prescriptionRefills: false,
          labResults: false,
          emergencyAlerts: true
        },
        analytics: {
          totalConversations: 342,
          satisfactionScore: 4.6,
          resolvedQueries: 289,
          escalatedToDoctor: 53
        }
      };
      
      setChatbotConfig(mockConfig);
    } catch (error) {
      console.error("Error loading chatbot configuration:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading2(true);
    try {
      // Mock save operation - in real app, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Chatbot configuration saved successfully");
    } catch (error) {
      console.error("Error saving chatbot configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading2(false);
    }
  };

  const toggleChatbot = async () => {
    const newStatus = !chatbotConfig.isActive;
    setChatbotConfig(prev => ({ ...prev, isActive: newStatus }));
    
    try {
      // Mock toggle operation
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(newStatus ? "Chatbot activated" : "Chatbot deactivated");
    } catch (error) {
      // Revert on error
      setChatbotConfig(prev => ({ ...prev, isActive: !newStatus }));
      toast.error("Failed to toggle chatbot");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading page: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access chatbot management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (user.role !== "doctor") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only available to doctors.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Chatbot Management
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                Configure and manage your AI-powered medical assistant
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className={`h-5 w-5 ${chatbotConfig.isActive ? 'text-green-600' : 'text-zinc-400'}`} />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {chatbotConfig.isActive ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={chatbotConfig.isActive}
                  onCheckedChange={toggleChatbot}
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={isLoading2}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading2 ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-8 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-600" />
              Chatbot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {chatbotConfig.analytics.totalConversations}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total Conversations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {chatbotConfig.analytics.satisfactionScore}/5
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Satisfaction Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {chatbotConfig.analytics.resolvedQueries}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Resolved Queries
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {chatbotConfig.analytics.escalatedToDoctor}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Escalated to Doctor
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('configuration')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === 'configuration'
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-600 dark:bg-red-900/20 dark:text-red-300'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>General Settings</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('responses')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === 'responses'
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-600 dark:bg-red-900/20 dark:text-red-300'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Auto Responses</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === 'analytics'
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-600 dark:bg-red-900/20 dark:text-red-300'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[800px]">
              {activeTab === 'configuration' && (
                <div className="space-y-6">
                  {/* Basic Configuration */}
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-purple-600" />
                        Basic Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Chatbot Name</Label>
                          <Input
                            id="name"
                            value={chatbotConfig.name}
                            onChange={(e) => setChatbotConfig(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter chatbot name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specialty">Medical Specialty</Label>
                          <Select
                            value={chatbotConfig.specialty}
                            onValueChange={(value) => setChatbotConfig(prev => ({ ...prev, specialty: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Medicine</SelectItem>
                              <SelectItem value="cardiology">Cardiology</SelectItem>
                              <SelectItem value="dermatology">Dermatology</SelectItem>
                              <SelectItem value="orthopedics">Orthopedics</SelectItem>
                              <SelectItem value="pediatrics">Pediatrics</SelectItem>
                              <SelectItem value="psychiatry">Psychiatry</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={chatbotConfig.description}
                          onChange={(e) => setChatbotConfig(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your chatbot's purpose and capabilities"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personality & Behavior */}
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                        Personality & Behavior
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="personality">Personality</Label>
                          <Select
                            value={chatbotConfig.personality}
                            onValueChange={(value: any) => setChatbotConfig(prev => ({ ...prev, personality: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="empathetic">Empathetic</SelectItem>
                              <SelectItem value="concise">Concise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="responseTime">Response Time</Label>
                          <Select
                            value={chatbotConfig.responseTime}
                            onValueChange={(value: any) => setChatbotConfig(prev => ({ ...prev, responseTime: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="quick">Quick (1-2 seconds)</SelectItem>
                              <SelectItem value="normal">Normal (3-5 seconds)</SelectItem>
                              <SelectItem value="thoughtful">Thoughtful (5+ seconds)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integrations */}
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-green-600" />
                        Integrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Appointment Booking</Label>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              Allow patients to book appointments
                            </p>
                          </div>
                          <Switch
                            checked={chatbotConfig.integrations.appointmentBooking}
                            onCheckedChange={(checked) => setChatbotConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, appointmentBooking: checked }
                            }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Emergency Alerts</Label>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              Send alerts for emergency situations
                            </p>
                          </div>
                          <Switch
                            checked={chatbotConfig.integrations.emergencyAlerts}
                            onCheckedChange={(checked) => setChatbotConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, emergencyAlerts: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Restrictions */}
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-red-600" />
                        Safety Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">No Medical Advice</Label>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              Prevent chatbot from giving medical advice
                            </p>
                          </div>
                          <Switch
                            checked={chatbotConfig.restrictions.noMedicalAdvice}
                            onCheckedChange={(checked) => setChatbotConfig(prev => ({
                              ...prev,
                              restrictions: { ...prev.restrictions, noMedicalAdvice: checked }
                            }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Business Hours Only</Label>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              Only operate during business hours
                            </p>
                          </div>
                          <Switch
                            checked={chatbotConfig.restrictions.businessHoursOnly}
                            onCheckedChange={(checked) => setChatbotConfig(prev => ({
                              ...prev,
                              restrictions: { ...prev.restrictions, businessHoursOnly: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'responses' && (
                <div className="space-y-6">
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                        Auto Responses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="greeting">Greeting Message</Label>
                          <Textarea
                            id="greeting"
                            value={chatbotConfig.autoResponses.greeting}
                            onChange={(e) => setChatbotConfig(prev => ({
                              ...prev,
                              autoResponses: { ...prev.autoResponses, greeting: e.target.value }
                            }))}
                            placeholder="Enter greeting message"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="farewell">Farewell Message</Label>
                          <Textarea
                            id="farewell"
                            value={chatbotConfig.autoResponses.farewell}
                            onChange={(e) => setChatbotConfig(prev => ({
                              ...prev,
                              autoResponses: { ...prev.autoResponses, farewell: e.target.value }
                            }))}
                            placeholder="Enter farewell message"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confusion">Confusion Message</Label>
                          <Textarea
                            id="confusion"
                            value={chatbotConfig.autoResponses.confusion}
                            onChange={(e) => setChatbotConfig(prev => ({
                              ...prev,
                              autoResponses: { ...prev.autoResponses, confusion: e.target.value }
                            }))}
                            placeholder="Enter confusion message"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="emergency">Emergency Message</Label>
                          <Textarea
                            id="emergency"
                            value={chatbotConfig.autoResponses.emergency}
                            onChange={(e) => setChatbotConfig(prev => ({
                              ...prev,
                              autoResponses: { ...prev.autoResponses, emergency: e.target.value }
                            }))}
                            placeholder="Enter emergency message"
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                        Performance Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              Total Conversations
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {chatbotConfig.analytics.totalConversations}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              Resolved Queries
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {chatbotConfig.analytics.resolvedQueries}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              Escalated to Doctor
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {chatbotConfig.analytics.escalatedToDoctor}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              Satisfaction Score
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {chatbotConfig.analytics.satisfactionScore}/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {Math.round((chatbotConfig.analytics.resolvedQueries / chatbotConfig.analytics.totalConversations) * 100)}%
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              Resolution Rate
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {Math.round((chatbotConfig.analytics.escalatedToDoctor / chatbotConfig.analytics.totalConversations) * 100)}%
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              Escalation Rate
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
