"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  MessageSquare,
  Send,
  Search,
  Filter,
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Phone,
  Video,
  Paperclip,
  MoreHorizontal,
  Archive,
  Trash2,
  Flag,
  Reply,
  Forward,
  Edit,
  Loader2,
  UserCheck,
  Calendar,
  FileText,
  Stethoscope,
  Shield,
  Heart,
  Activity
} from 'lucide-react';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { DoctorMessagesService } from '@/lib/firestore/doctor-messages-service';
import { Message, Conversation, User } from '@/app/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  priority: 'normal' | 'high' | 'urgent';
  isStarred: boolean;
  status: 'active' | 'archived' | 'blocked';
  messageType: 'general' | 'medical' | 'appointment' | 'prescription' | 'lab_result' | 'emergency';
  messages: Message[];
}

interface MessageFormData {
  recipientId: string;
  subject: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  messageType: 'general' | 'medical' | 'appointment' | 'prescription' | 'lab_result' | 'emergency';
  attachments?: File[];
}

export default function DoctorMessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<MessageThread[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<MessageThread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newMessageForm, setNewMessageForm] = useState<MessageFormData>({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'normal',
    messageType: 'general'
  });
  const [contacts, setContacts] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    if (user?.id) {
      loadMessages();
      loadContacts();
      setupRealTimeSubscriptions();
    }
  }, [user, filterType]);

  const loadMessages = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await DoctorMessagesService.getMessageThreads(user.id, {
        filter: filterType !== 'all' ? { messageType: filterType } : undefined
      });
      
      if (response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!user?.id) return;
    
    try {
      const response = await DoctorMessagesService.getContacts(user.id);
      if (response.data) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    if (!user?.id) return;

    const unsubscribe = DoctorMessagesService.subscribeToMessages(user.id, (updatedMessages) => {
      setConversations(updatedMessages);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newMessageForm.recipientId || !newMessageForm.content.trim()) return;

    try {
      setSending(true);
      
      const response = await DoctorMessagesService.sendMessage({
        senderId: user.id,
        recipientId: newMessageForm.recipientId,
        subject: newMessageForm.subject,
        content: newMessageForm.content,
        priority: newMessageForm.priority,
        messageType: newMessageForm.messageType
      });

      if (response.data) {
        toast.success('Message sent successfully');
        setShowNewMessageDialog(false);
        setNewMessageForm({
          recipientId: '',
          subject: '',
          content: '',
          priority: 'normal',
          messageType: 'general'
        });
        loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReplyMessage = async (conversationId: string, content: string) => {
    if (!user?.id || !selectedConversation) return;

    try {
      const response = await DoctorMessagesService.replyToMessage({
        conversationId,
        senderId: user.id,
        content,
        messageType: selectedConversation.messageType
      });

      if (response.data) {
        toast.success('Reply sent successfully');
        // Refresh the conversation
        const updatedConversation = await DoctorMessagesService.getConversation(conversationId);
        if (updatedConversation.data) {
          setSelectedConversation(updatedConversation.data);
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await DoctorMessagesService.archiveConversation(conversationId);
      toast.success('Conversation archived');
      loadMessages();
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };

  const handleStarConversation = async (conversationId: string, isStarred: boolean) => {
    try {
      await DoctorMessagesService.starConversation(conversationId, isStarred);
      toast.success(isStarred ? 'Conversation starred' : 'Star removed');
      loadMessages();
    } catch (error) {
      console.error('Error starring conversation:', error);
      toast.error('Failed to update conversation');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || conv.messageType === filterType;
    const matchesTab = activeTab === 'inbox' ? conv.status === 'active' : 
                      activeTab === 'starred' ? conv.isStarred : 
                      activeTab === 'archived' ? conv.status === 'archived' : true;
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Stethoscope className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'prescription': return <FileText className="h-4 w-4" />;
      case 'lab_result': return <Activity className="h-4 w-4" />;
      case 'emergency': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'appointment': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'prescription': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'lab_result': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'emergency': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-zinc-600 bg-zinc-50 dark:bg-zinc-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Loading messages...</p>
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
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Messages</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Communicate with patients and healthcare staff
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleSendMessage}>
                    <DialogHeader>
                      <DialogTitle>New Message</DialogTitle>
                      <DialogDescription>
                        Send a message to a patient or healthcare staff member
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Recipient</label>
                        <Select 
                          value={newMessageForm.recipientId} 
                          onValueChange={(value) => setNewMessageForm(prev => ({ ...prev, recipientId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map(contact => (
                              <SelectItem key={contact.id} value={contact.id}>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={contact.profileImageUrl} />
                                    <AvatarFallback>
                                      {contact.firstName?.[0]}{contact.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{contact.firstName} {contact.lastName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {contact.role}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Priority</label>
                          <Select 
                            value={newMessageForm.priority} 
                            onValueChange={(value: 'normal' | 'high' | 'urgent') => 
                              setNewMessageForm(prev => ({ ...prev, priority: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <Select 
                            value={newMessageForm.messageType} 
                            onValueChange={(value: any) => 
                              setNewMessageForm(prev => ({ ...prev, messageType: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="appointment">Appointment</SelectItem>
                              <SelectItem value="prescription">Prescription</SelectItem>
                              <SelectItem value="lab_result">Lab Result</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          value={newMessageForm.subject}
                          onChange={(e) => setNewMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Enter message subject"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          value={newMessageForm.content}
                          onChange={(e) => setNewMessageForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Type your message..."
                          rows={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sending} className="bg-red-600 hover:bg-red-700">
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Messages Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Search and Filters */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="lab_result">Lab Results</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Message Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="starred">Starred</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>

                {/* Conversation List */}
                <ScrollArea className="h-[600px] mt-4">
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                            : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participantAvatar} />
                              <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                {conversation.participantName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm truncate">
                                  {conversation.participantName}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {conversation.isStarred && (
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  )}
                                  {conversation.priority !== 'normal' && (
                                    <div className={`h-2 w-2 rounded-full ${
                                      conversation.priority === 'urgent' ? 'bg-red-500' :
                                      conversation.priority === 'high' ? 'bg-orange-500' : 'bg-zinc-300'
                                    }`} />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {conversation.participantRole}
                                </Badge>
                                <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${getMessageTypeColor(conversation.messageType)}`}>
                                  {getMessageTypeIcon(conversation.messageType)}
                                  <span className="ml-1 capitalize">{conversation.messageType.replace('_', ' ')}</span>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                {conversation.lastMessage}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-zinc-500">
                                  {format(conversation.lastMessageTime, 'MMM d, h:mm a')}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </Tabs>
            </div>

            {/* Message View */}
            <div className="lg:col-span-8">
              {selectedConversation ? (
                <Card className="border-zinc-200 dark:border-zinc-800 h-full">
                  <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.participantAvatar} />
                          <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {selectedConversation.participantRole}
                            </Badge>
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${getMessageTypeColor(selectedConversation.messageType)}`}>
                              {getMessageTypeIcon(selectedConversation.messageType)}
                              <span className="ml-1 capitalize">{selectedConversation.messageType.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStarConversation(selectedConversation.id, !selectedConversation.isStarred)}
                        >
                          <Star className={`h-4 w-4 ${selectedConversation.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleArchiveConversation(selectedConversation.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {selectedConversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderId === user?.id
                                  ? 'bg-red-600 text-white'
                                  : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user?.id ? 'text-red-100' : 'text-zinc-500'
                              }`}>
                                {format(message.createdAt, 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Type a message..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleReplyMessage(selectedConversation.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
                            if (input?.value) {
                              handleReplyMessage(selectedConversation.id, input.value);
                              input.value = '';
                            }
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-zinc-200 dark:border-zinc-800 h-full">
                  <CardContent className="flex items-center justify-center h-[500px]">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Choose a conversation from the sidebar to start messaging
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
