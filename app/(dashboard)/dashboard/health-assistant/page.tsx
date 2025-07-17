'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  FileText, 
  Camera, 
  Mic, 
  MicOff,
  Loader2,
  AlertTriangle,
  Heart,
  Shield,
  Brain,
  FileImage,
  Download,
  Trash2,
  MoreVertical,
  Settings,
  History,
  Bookmark,
  Share2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useAuth } from '@/app/contexts/auth-context';
import { useHealthAssistant } from '@/app/hooks/use-health-assistant';
import { HealthInquiry, AIHealthResponse, UploadedReport, EmergencyFlag } from '@/app/types';
import { 
  EmergencyAlert, 
  RecommendationCard, 
  ReportSummary, 
  AnalyticsDashboard 
} from '@/app/components/health-assistant/health-assistant-components';
import { HealthAssistantSettings } from '@/app/components/health-assistant/health-assistant-settings';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: UploadedReport[];
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
  emergencyFlags?: EmergencyFlag[];
  reportSummary?: any;
  isProcessing?: boolean;
}

// Custom markdown components for better styling
const MarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 mt-3">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 mt-2">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside space-y-1 mb-2 ml-2 text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside space-y-1 mb-2 ml-2 text-sm">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-sm leading-relaxed">
      {children}
    </li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-900 dark:text-slate-100">
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-slate-700 dark:text-slate-300">
      {children}
    </em>
  ),
  code: ({ children, className }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className={className}>
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => (
    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2 border border-slate-200 dark:border-slate-700">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg mb-2 text-sm italic">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-2">
      <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-slate-50 dark:bg-slate-800">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
      {children}
    </tbody>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
      {children}
    </td>
  ),
  a: ({ children, href }: any) => (
    <a 
      href={href} 
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => (
    <hr className="my-3 border-slate-200 dark:border-slate-700" />
  ),
};

export default function HealthAssistantPage() {
  const { user } = useAuth();
  const {
    sendInquiry,
    analyzeReport,
    getInquiryHistory,
    isLoading,
    error
  } = useHealthAssistant();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `# Welcome to HealthSphere AI Assistant! 👋

Hello **${user?.firstName || 'there'}**! I'm your AI-powered health companion. Here's how I can help you:

## 🩺 **Medical Services**
- **Symptom Analysis** - Describe your symptoms for preliminary assessment
- **Report Analysis** - Upload lab results, X-rays, or medical reports
- **Medication Information** - Get details about medications and interactions
- **General Health Guidance** - Ask questions about health and wellness

## 🚨 **Emergency Detection**
I'm equipped to identify urgent situations that need immediate medical care.

---

### How to get started:
1. **Type your question** in the message box below
2. **Upload files** using the 📎 attachment button
3. **Use voice input** with the 🎤 microphone button
4. Try the **quick action buttons** for common queries

> **Note**: I provide preliminary guidance only. Always consult with healthcare professionals for medical decisions.

How can I assist you today?`,
      timestamp: new Date(),
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: attachedFiles.map(file => ({
        id: Date.now().toString() + Math.random(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add processing message
    const processingMessage: Message = {
      id: Date.now().toString() + '_processing',
      type: 'assistant',
      content: '🔄 **Analyzing your inquiry...**\n\nPlease wait while I process your request.',
      timestamp: new Date(),
      isProcessing: true
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      const inquiry: Partial<HealthInquiry> = {
        query: inputMessage,
        inquiryType: attachedFiles.length > 0 ? 'report_analysis' : 'general_health',
        attachedReports: userMessage.attachments,
      };

      const response = await sendInquiry(inquiry);
      
      // Remove processing message and add response
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      const assistantMessage: Message = {
        id: Date.now().toString() + '_response',
        type: 'assistant',
        content: response.aiResponse.response,
        timestamp: new Date(),
        urgencyLevel: response.urgencyLevel,
        emergencyFlags: response.aiResponse.emergencyFlags,
        reportSummary: response.aiResponse.reportSummary
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Remove processing message and add error
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: `## ⚠️ Error Occurred

I apologize, but I encountered an error processing your request. 

**What you can do:**
- Try rephrasing your question
- Check your internet connection
- Contact support if the issue persists

Please try again or reach out to our support team for assistance.`,
        timestamp: new Date(),
        urgencyLevel: 'low'
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setInputMessage('');
    setAttachedFiles([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/dicom'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'emergency': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col health-assistant-page">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 medical-icon-pulse">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Health Assistant
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI-powered medical guidance and analysis
              </p>
            </div>
            {user?.role && (
              <div className={`role-indicator ${user.role}-theme`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Export Chat
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Session
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {message.type === 'user' ? (
                          <>
                            <AvatarImage src={user?.profileImageUrl} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500">
                            <Bot className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <Card className={`ai-message-card ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : `bg-white dark:bg-slate-800 ${
                                message.urgencyLevel 
                                  ? `urgency-${message.urgencyLevel} ${getUrgencyColor(message.urgencyLevel)}` 
                                  : ''
                              }`
                        }`}>
                          <CardContent className="p-3 medical-content">
                            {message.isProcessing ? (
                              <div className="flex items-center space-x-2 ai-processing">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown 
                                    components={MarkdownComponents}
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className={`prose prose-sm max-w-none ${
                                  message.type === 'user' 
                                    ? 'prose-invert' 
                                    : 'dark:prose-invert'
                                }`}>
                                  <ReactMarkdown 
                                    components={MarkdownComponents}
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                                
                                {/* Emergency Flags */}
                                {message.emergencyFlags && message.emergencyFlags.length > 0 && (
                                  <EmergencyAlert flags={message.emergencyFlags} />
                                )}

                                {/* Attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {message.attachments.map((attachment, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        <FileImage className="h-3 w-3 mr-1" />
                                        {attachment.fileName}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Recommendations */}
                                {message.type === 'assistant' && !message.isProcessing && (
                                  <RecommendationCard 
                                    recommendations={[
                                      {
                                        type: 'follow_up',
                                        priority: 'medium',
                                        description: 'Schedule a follow-up appointment with your healthcare provider',
                                        timeframe: 'Within 1-2 weeks'
                                      }
                                    ]} 
                                  />
                                )}

                                {/* Report Summary */}
                                {message.reportSummary && (
                                  <ReportSummary reportData={message.reportSummary} />
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        <span className="text-xs text-slate-400 mt-1">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              {/* File Attachments Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm truncate max-w-32">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your symptoms, ask about medications, or upload medical reports... (Markdown supported)"
                    className="min-h-[44px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>

                <div className="flex space-x-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.dcm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 w-11 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`h-11 w-11 p-0 ${isRecording ? 'text-red-500' : ''}`}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!inputMessage.trim() && attachedFiles.length === 0)}
                    className="h-11 w-11 p-0 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputMessage("## My Symptoms\n\nI have a **headache** and **fever**. What could this be?\n\n### Additional Details:\n- Started this morning\n- Temperature: ~100°F\n- No other symptoms")}
                  className="text-xs"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Symptom Check
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputMessage("## Lab Results Analysis\n\nCan you analyze my lab results?\n\n> Please upload your lab report using the attachment button")}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Report Analysis
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputMessage("## Medication Information\n\nTell me about **medication interactions** and safety guidelines.\n\n### Questions:\n1. Drug interactions\n2. Side effects\n3. Dosage recommendations")}
                  className="text-xs"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Drug Info
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 p-4">
            <AnalyticsDashboard userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="history" className="flex-1 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Inquiry History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Your previous conversations and analysis history will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 p-4">
            <HealthAssistantSettings 
              userId={user?.id || ''} 
              userRole={user?.role || 'patient'} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
