"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bot,
  Send,
  Stethoscope,
  Brain,
  Heart,
  Activity,
  FileText,
  Pill,
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  Circle,
  Clock,
  User,
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  Loader2,
  MessageSquare,
  Lightbulb,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  Globe,
  Shield,
  Database,
  Cpu,
  Zap,
  Settings,
  HelpCircle,
  BookOpen,
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { DoctorHealthAssistantService } from '@/lib/firestore/doctor-health-assistant-service';
import type { 
  AssistantCapability as ServiceCapability,
  ChatMessage as ServiceChatMessage,
  ChatSession as ServiceChatSession,
  MedicalInsight as ServiceMedicalInsight,
  PatientContext as ServicePatientContext
} from '@/lib/firestore/doctor-health-assistant-service';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'analysis' | 'suggestion' | 'diagnosis' | 'treatment';
  confidence?: number;
  sources?: string[];
  attachments?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  patientId?: string;
  patientName?: string;
  specialty: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  status: 'active' | 'archived' | 'completed';
}

interface AssistantCapability {
  id: string;
  name: string;
  description: string;
  category: 'diagnosis' | 'treatment' | 'research' | 'education' | 'administration';
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  confidence: number;
}

interface MedicalInsight {
  id: string;
  title: string;
  description: string;
  category: 'symptom' | 'diagnosis' | 'treatment' | 'prevention' | 'research';
  confidence: number;
  sources: string[];
  relevance: number;
  createdAt: Date;
}

interface PatientContext {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  currentSymptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
  };
}

export default function DoctorHealthAssistantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [capabilities, setCapabilities] = useState<AssistantCapability[]>([]);
  const [insights, setInsights] = useState<MedicalInsight[]>([]);
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const [assistantConfig, setAssistantConfig] = useState({
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 1000,
    specialty: 'general',
    includePatientData: true,
    confidenceThreshold: 0.8
  });
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const assistantCapabilities: AssistantCapability[] = [
    {
      id: 'diagnosis',
      name: 'Diagnostic Support',
      description: 'AI-powered symptom analysis and differential diagnosis suggestions',
      category: 'diagnosis',
      icon: Stethoscope,
      enabled: true,
      confidence: 0.85
    },
    {
      id: 'treatment',
      name: 'Treatment Planning',
      description: 'Evidence-based treatment recommendations and protocols',
      category: 'treatment',
      icon: Heart,
      enabled: true,
      confidence: 0.82
    },
    {
      id: 'drug-interaction',
      name: 'Drug Interaction Checker',
      description: 'Comprehensive medication interaction analysis',
      category: 'treatment',
      icon: Pill,
      enabled: true,
      confidence: 0.95
    },
    {
      id: 'lab-interpretation',
      name: 'Lab Result Analysis',
      description: 'Automated interpretation of laboratory results',
      category: 'diagnosis',
      icon: FlaskConical,
      enabled: true,
      confidence: 0.88
    },
    {
      id: 'research',
      name: 'Medical Literature Search',
      description: 'Access to latest research papers and clinical guidelines',
      category: 'research',
      icon: BookOpen,
      enabled: true,
      confidence: 0.78
    },
    {
      id: 'education',
      name: 'Patient Education',
      description: 'Generate patient-friendly explanations and materials',
      category: 'education',
      icon: Users,
      enabled: true,
      confidence: 0.80
    }
  ];

  useEffect(() => {
    if (user?.id) {
      initializeAssistant();
      loadSessions();
      loadCapabilities();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const initializeAssistant = async () => {
    try {
      setLoading(true);
      
      // Initialize AI assistant service
      const response = await DoctorHealthAssistantService.initializeAssistant(user?.id!, assistantConfig);
      
      if (response.success && response.data) {
        setCapabilities(assistantCapabilities);
        
        // Create initial session if none exists
        if (sessions.length === 0) {
          await createNewSession();
        }
        
        toast.success('Health Assistant initialized successfully');
      } else {
        throw new Error(response.error || 'Failed to initialize assistant');
      }
    } catch (error) {
      console.error('Error initializing assistant:', error);
      toast.error('Failed to initialize Health Assistant');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!user?.id) return;
    
    try {
      const response = await DoctorHealthAssistantService.getSessions(user.id);
      if (response.success && response.data) {
        setSessions(response.data);
        if (response.data.length > 0 && !currentSession) {
          setCurrentSession(response.data[0]);
        }
      } else {
        console.error('Error loading sessions:', response.error);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadCapabilities = async () => {
    try {
      const response = await DoctorHealthAssistantService.getCapabilities();
      if (response.success && response.data) {
        // Map service capabilities to UI capabilities with icons
        const mappedCapabilities = response.data.map((cap: ServiceCapability) => {
          const uiCapability = assistantCapabilities.find(ui => ui.id === cap.id);
          return {
            ...cap,
            icon: uiCapability?.icon || MessageSquare
          };
        });
        setCapabilities(mappedCapabilities);
      } else {
        console.error('Error loading capabilities:', response.error);
        // Fall back to default capabilities
        setCapabilities(assistantCapabilities);
      }
    } catch (error) {
      console.error('Error loading capabilities:', error);
      // Fall back to default capabilities
      setCapabilities(assistantCapabilities);
    }
  };

  const createNewSession = async (patientId?: string) => {
    if (!user?.id) return;
    
    try {
      const response = await DoctorHealthAssistantService.createSession({
        doctorId: user.id,
        patientId,
        specialty: assistantConfig.specialty,
        title: patientId ? `Consultation - ${patientId}` : 'General Consultation'
      });
      
      if (response.success && response.data) {
        setCurrentSession(response.data);
        setSessions(prev => [response.data!, ...prev]);
        toast.success('New consultation session created');
      } else {
        throw new Error(response.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new session');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentSession || !user?.id) return;
    
    try {
      setSending(true);
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        type: 'text'
      };
      
      // Add user message to UI immediately
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);
      
      setMessage('');
      
      // Send message to AI assistant
      const response = await DoctorHealthAssistantService.sendMessage({
        sessionId: currentSession.id,
        message: message,
        patientContext: patientContext,
        includeInsights: showInsights,
        model: assistantConfig.model,
        temperature: assistantConfig.temperature
      });
      
      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.content,
          timestamp: new Date(),
          type: response.data.type || 'text',
          confidence: response.data.confidence,
          sources: response.data.sources
        };
        
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, assistantMessage]
        } : null);
        
        // Update insights if available
        if (response.data?.insights) {
          setInsights(prev => [...response.data!.insights!, ...prev]);
        }
        
        // Speak response if enabled
        if (speechEnabled) {
          speakResponse(response.data.content);
        }
      } else {
        throw new Error(response.error || 'Failed to get response from assistant');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectPatient = async (patientId: string) => {
    try {
      const response = await DoctorHealthAssistantService.getPatientContext(patientId);
      if (response.success && response.data) {
        setPatientContext(response.data);
        setSelectedPatient(patientId);
        toast.success('Patient context loaded');
      } else {
        throw new Error(response.error || 'Failed to load patient context');
      }
    } catch (error) {
      console.error('Error loading patient context:', error);
      toast.error('Failed to load patient context');
    }
  };

  const toggleCapability = async (capabilityId: string) => {
    try {
      const updatedCapabilities = capabilities.map(cap => 
        cap.id === capabilityId ? { ...cap, enabled: !cap.enabled } : cap
      );
      setCapabilities(updatedCapabilities);
      
      // Convert to service format for update
      const serviceCapabilities = updatedCapabilities.map(cap => ({
        id: cap.id,
        name: cap.name,
        description: cap.description,
        category: cap.category,
        enabled: cap.enabled,
        confidence: cap.confidence
      }));
      
      const response = await DoctorHealthAssistantService.updateCapabilities(serviceCapabilities);
      if (response.success) {
        toast.success('Capability settings updated');
      } else {
        throw new Error(response.error || 'Failed to update capabilities');
      }
    } catch (error) {
      console.error('Error updating capability:', error);
      toast.error('Failed to update capability');
      // Revert the change
      loadCapabilities();
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast.error('Voice recognition not supported');
    }
  };

  const speakResponse = (text: string) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const exportSession = async () => {
    if (!currentSession) return;
    
    try {
      const response = await DoctorHealthAssistantService.exportSession(currentSession.id);
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${currentSession.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Session exported successfully');
      } else {
        throw new Error(response.error || 'Failed to export session');
      }
    } catch (error) {
      console.error('Error exporting session:', error);
      toast.error('Failed to export session');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Brain className="h-4 w-4" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'diagnosis': return <Stethoscope className="h-4 w-4" />;
      case 'treatment': return <Heart className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Brain className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Initializing Health Assistant...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-red-600" />
                Health Assistant
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                AI-powered medical consultation and diagnostic support
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={assistantConfig.model} onValueChange={(value) => 
                setAssistantConfig(prev => ({ ...prev, model: value }))
              }>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => createNewSession()}
              >
                <Bot className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </motion.div>

          {/* Main Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-4">
              {/* Patient Context */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-red-600" />
                    Patient Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientContext ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{patientContext.patientName}</span>
                        <Badge variant="outline">{patientContext.age} years</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Symptoms:</span>
                          <p className="text-zinc-600 dark:text-zinc-400">
                            {patientContext.currentSymptoms.join(', ') || 'None specified'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Allergies:</span>
                          <p className="text-zinc-600 dark:text-zinc-400">
                            {patientContext.allergies.join(', ') || 'None known'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        No patient selected
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => selectPatient('demo-patient-123')}
                      >
                        Load Demo Patient
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sessions */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-red-600" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            currentSession?.id === session.id
                              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                              : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          }`}
                          onClick={() => setCurrentSession(session)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm truncate">{session.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {session.specialty}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {format(session.updatedAt, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Capabilities */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-red-600" />
                    Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {capabilities.map((capability) => (
                      <div
                        key={capability.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex items-center space-x-2">
                          <capability.icon className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">{capability.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCapability(capability.id)}
                          className={capability.enabled ? 'text-green-600' : 'text-zinc-400'}
                        >
                          {capability.enabled ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-9">
              <Card className="border-zinc-200 dark:border-zinc-800 h-[700px] flex flex-col">
                <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{currentSession?.title || 'Health Assistant'}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          AI Medical Consultation • {assistantConfig.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSpeechEnabled(!speechEnabled)}
                        className={speechEnabled ? 'text-red-600' : 'text-zinc-400'}
                      >
                        {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={exportSession}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[500px] p-4">
                    <div className="space-y-4">
                      {currentSession?.messages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              msg.role === 'user'
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              {msg.role === 'assistant' && getMessageIcon(msg.type)}
                              <span className="text-sm font-medium capitalize">
                                {msg.role === 'user' ? 'You' : 'Assistant'}
                              </span>
                              {msg.confidence && (
                                <Badge variant="outline" className={`text-xs ${getConfidenceColor(msg.confidence)}`}>
                                  {Math.round(msg.confidence * 100)}% confident
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  Sources: {msg.sources.join(', ')}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                              {format(msg.timestamp, 'h:mm a')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {sending && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 max-w-[80%]">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                              <span className="text-sm">Assistant is thinking...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                </CardContent>

                <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                  <form onSubmit={sendMessage} className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask about symptoms, diagnosis, treatment options..."
                        className="pr-12"
                        disabled={sending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={startVoiceInput}
                        disabled={isListening || sending}
                      >
                        {isListening ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!message.trim() || sending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage('Analyze these symptoms: headache, fever, fatigue')}
                    >
                      <Stethoscope className="h-3 w-3 mr-1" />
                      Analyze Symptoms
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage('Check for drug interactions with current medications')}
                    >
                      <Pill className="h-3 w-3 mr-1" />
                      Drug Interactions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage('Interpret recent lab results')}
                    >
                      <FlaskConical className="h-3 w-3 mr-1" />
                      Lab Results
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage('Generate patient education material')}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Patient Education
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
