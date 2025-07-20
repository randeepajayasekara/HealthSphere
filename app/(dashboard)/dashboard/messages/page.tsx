"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  MoreVertical,
  Users,
  Phone,
  Video,
  Archive,
  Trash2,
  Star,
  StarOff,
  Filter,
  Settings,
  UserCheck,
  Clock,
  CheckCheck,
  AlertCircle,
  Stethoscope,
  UserPlus,
  X,
  ChevronDown,
  Smile,
  Image,
  File
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageService, ConversationRealtimeService } from '@/lib/firestore/message-services';
import type { Message, Conversation, User, UserRole } from '@/app/types';

interface ConversationPreview extends Omit<Conversation, 'participants'> {
  lastMessage?: Message;
  unreadCount?: number;
  participants?: User[];
  participantIds: string[];
}

interface MessageWithSender extends Message {
  sender?: User;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationPreview | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock current user - in real implementation, get from auth context
  const currentUser: User = {
    id: 'user-1',
    email: 'doctor@healthsphere.com',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'doctor',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock data for development
  const mockConversations: ConversationPreview[] = [
    {
      id: 'conv-1',
      participantIds: ['user-1', 'user-2'],
      title: 'Thanks for using Healthsphere!',
      lastMessageAt: new Date(),
      createdAt: new Date(),
      isGroupConversation: false,
      lastMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-2',
        content: 'Thank you for using Healthsphere! We hope you find it helpful.',
        createdAt: new Date(),
        isRead: false,
        isDeleted: false
      },
      unreadCount: 1,
      participants: [
        {
          id: 'user-2',
          email: 'john.doe@email.com',
          firstName: 'Health',
          lastName: 'Sphere',
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
  ];

  const mockMessages: MessageWithSender[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: 'Hi',
      createdAt: new Date(Date.now() - 3),
      isRead: true,
      isDeleted: false,
      sender: currentUser
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content: 'Thank you for using Healthsphere! We hope you find it helpful.',
      createdAt: new Date(Date.now() - 1),
      isRead: true,
      isDeleted: false,
      sender: mockConversations[0].participants![0]
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content: 'Welcome to HealthSphere! How can we assist you today?',
      createdAt: new Date(),
      isRead: false,
      isDeleted: false,
      sender: mockConversations[0].participants![0]
    }
  ];

  useEffect(() => {
    // Initialize conversations
    setConversations(mockConversations);
    setIsLoading(false);
    
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      // Load messages for active conversation
      const conversationMessages = mockMessages.filter(
        msg => msg.conversationId === activeConversation.id
      );
      setMessages(conversationMessages);
      scrollToBottom();
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: MessageWithSender = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      content: newMessage.trim(),
      createdAt: new Date(),
      isRead: false,
      isDeleted: false,
      sender: currentUser
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    scrollToBottom();

    // In real implementation, call MessageService.sendMessage
    // await MessageService.sendMessage(activeConversation.id, currentUser.id, newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      patient: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      doctor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      nurse: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      receptionist: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      pharmacist: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      lab_technician: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      hospital_management: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[role] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400';
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants?.some(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesRole = filterRole === 'all' || 
      conv.participants?.some(p => p.role === filterRole);
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Conversations Sidebar */}
        <div className={`flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className={`font-bold text-xl text-zinc-900 dark:text-white ${
                sidebarCollapsed ? 'hidden' : 'block'
              }`}>
                Messages
              </h1>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewConversation(true)}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Conversation</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {!sidebarCollapsed && (
              <>
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>

                {/* Filter */}
                <Select value={filterRole} onValueChange={(value) => setFilterRole(value as UserRole | 'all')}>
                  <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="patient">Patients</SelectItem>
                    <SelectItem value="doctor">Doctors</SelectItem>
                    <SelectItem value="nurse">Nurses</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="pharmacist">Pharmacists</SelectItem>
                    <SelectItem value="lab_technician">Lab Technicians</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    activeConversation?.id === conversation.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : 'hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {sidebarCollapsed ? (
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={conversation.participants?.[0]?.profileImageUrl} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            {conversation.isGroupConversation ? (
                              <Users className="h-4 w-4" />
                            ) : (
                              `${conversation.participants?.[0]?.firstName?.[0]}${conversation.participants?.[0]?.lastName?.[0]}`
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-emerald-600 hover:bg-emerald-600 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.participants?.[0]?.profileImageUrl} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              {conversation.isGroupConversation ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                `${conversation.participants?.[0]?.firstName?.[0]}${conversation.participants?.[0]?.lastName?.[0]}`
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-emerald-600 hover:bg-emerald-600 text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                              {conversation.title || conversation.participants?.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                            </h3>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formatTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            {conversation.participants?.map((participant, index) => (
                              <Badge
                                key={participant.id}
                                variant="secondary"
                                className={`text-xs ${getRoleColor(participant.role)}`}
                              >
                                {participant.role}
                              </Badge>
                            ))}
                            {conversation.isGroupConversation && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Group
                              </Badge>
                            )}
                          </div>

                          {conversation.lastMessage && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeConversation.participants?.[0]?.profileImageUrl} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        {activeConversation.isGroupConversation ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          `${activeConversation.participants?.[0]?.firstName?.[0]}${activeConversation.participants?.[0]?.lastName?.[0]}`
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="font-semibold text-zinc-900 dark:text-white">
                        {activeConversation.title || activeConversation.participants?.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                      </h2>
                      <div className="flex items-center gap-2">
                        {activeConversation.participants?.map((participant) => (
                          <Badge
                            key={participant.id}
                            variant="secondary"
                            className={`text-xs ${getRoleColor(participant.role)}`}
                          >
                            <Stethoscope className="h-3 w-3 mr-1" />
                            {participant.role}
                          </Badge>
                        ))}
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {activeConversation.participants?.length} participant{activeConversation.participants?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Voice Call</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                          <Video className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Video Call</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Participant
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Conversation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === currentUser.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarImage src={message.sender?.profileImageUrl} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                                {message.sender ? `${message.sender.firstName[0]}${message.sender.lastName[0]}` : '?'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`space-y-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                            {!isOwnMessage && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                  {message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Unknown'}
                                </span>
                                {message.sender && (
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${getRoleColor(message.sender.role)}`}
                                  >
                                    {message.sender.role}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            <div className={`flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 ${
                              isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isOwnMessage && (
                                <div className="ml-1">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="resize-none min-h-[40px] max-h-32 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      rows={1}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach File</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800">
                          <Image className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add Image</TooltipContent>
                    </Tooltip>

                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 text-zinc-400 dark:text-zinc-600 mb-4">
                  <MessageCircle className="h-full w-full" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Choose a conversation from the sidebar to start messaging
                </p>
                <Button
                  onClick={() => setShowNewConversation(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* New Conversation Dialog */}
        <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-white">Start New Conversation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search by name or role..."
                    className="pl-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Selected Users ({selectedUsers.length})
                </label>
                <div className="min-h-[100px] p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  {selectedUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 bg-white dark:bg-zinc-700 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback className="text-xs">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-zinc-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </span>
                          <Badge variant="secondary" className={`text-xs ${getRoleColor(user.role)}`}>
                            {user.role}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                            className="h-4 w-4 p-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                      No users selected. Search and select users to start a conversation.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewConversation(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={selectedUsers.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Start Conversation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default MessagesPage;