"use client";

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Clock,
  CheckCheck,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Bell,
  BellOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMessages } from '@/app/contexts/message-context';
import type { Conversation, Message, UserRole } from '@/app/types';

interface MessagingDashboardWidgetProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  allowNewConversation?: boolean;
  filterByRole?: UserRole[];
  onConversationSelect?: (conversation: Conversation) => void;
}

interface ConversationWithPreview extends Conversation {
  lastMessage?: Message;
  unreadCount?: number;
  participantNames?: string[];
}

const MessagingDashboardWidget: React.FC<MessagingDashboardWidgetProps> = ({
  className = "",
  showHeader = true,
  maxHeight = "400px",
  allowNewConversation = true,
  filterByRole = [],
  onConversationSelect
}) => {
  const { 
    conversations, 
    unreadCount, 
    isLoading, 
    setActiveConversation,
    currentUser 
  } = useMessages();

  const [searchTerm, setSearchTerm] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [processedConversations, setProcessedConversations] = useState<ConversationWithPreview[]>([]);

  // Mock data for demonstration
  const mockConversations: ConversationWithPreview[] = [
    {
      id: 'conv-1',
      participants: ['user-1', 'user-2'],
      title: 'Dr. Sarah Johnson',
      lastMessageAt: new Date(),
      createdAt: new Date(),
      isGroupConversation: false,
      lastMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-2',
        content: 'Patient is stable and ready for discharge procedures.',
        createdAt: new Date(Date.now() - 900000),
        isRead: false,
        isDeleted: false
      },
      unreadCount: 2,
      participantNames: ['Dr. Sarah Johnson']
    },
    {
      id: 'conv-2',
      participants: ['user-1', 'user-3', 'user-4'],
      title: 'Emergency Response Team',
      lastMessageAt: new Date(Date.now() - 1800000),
      createdAt: new Date(),
      isGroupConversation: true,
      lastMessage: {
        id: 'msg-2',
        conversationId: 'conv-2',
        senderId: 'user-3',
        content: 'All clear in the ER. Normal operations resumed.',
        createdAt: new Date(Date.now() - 1800000),
        isRead: true,
        isDeleted: false
      },
      unreadCount: 0,
      participantNames: ['Nurse Smith', 'Dr. Wilson', 'Admin Jones']
    },
    {
      id: 'conv-3',
      participants: ['user-1', 'user-5'],
      title: 'Lab Results Discussion',
      lastMessageAt: new Date(Date.now() - 3600000),
      createdAt: new Date(),
      isGroupConversation: false,
      lastMessage: {
        id: 'msg-3',
        conversationId: 'conv-3',
        senderId: 'user-5',
        content: 'Blood work results are available for review.',
        createdAt: new Date(Date.now() - 3600000),
        isRead: false,
        isDeleted: false
      },
      unreadCount: 1,
      participantNames: ['Lab Tech Anderson']
    }
  ];

  useEffect(() => {
    // In real implementation, this would process the actual conversations
    // For now, use mock data
    setProcessedConversations(mockConversations);
  }, [conversations]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const filteredConversations = processedConversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participantNames?.some(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesUnreadFilter = !showUnreadOnly || (conv.unreadCount && conv.unreadCount > 0);
    
    return matchesSearch && matchesUnreadFilter;
  });

  const handleConversationClick = (conversation: ConversationWithPreview) => {
    setActiveConversation(conversation);
    if (onConversationSelect) {
      onConversationSelect(conversation);
    }
  };

  return (
    <TooltipProvider>
      <Card className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${className}`}>
        {showHeader && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                Messages
                {unreadCount > 0 && (
                  <Badge className="bg-emerald-600 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                      className={`h-8 w-8 p-0 ${
                        showUnreadOnly 
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                      }`}
                    >
                      {showUnreadOnly ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showUnreadOnly ? 'Show all conversations' : 'Show unread only'}
                  </TooltipContent>
                </Tooltip>

                {allowNewConversation && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New conversation</TooltipContent>
                  </Tooltip>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Search className="h-4 w-4 mr-2" />
                      Search messages
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Filter className="h-4 w-4 mr-2" />
                      Filter conversations
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm"
              />
            </div>
          </CardHeader>
        )}

        <CardContent className="p-0">
          <ScrollArea style={{ height: maxHeight }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </p>
                {allowNewConversation && !searchTerm && (
                  <Button 
                    size="sm" 
                    className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start conversation
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-sm">
                            {conversation.isGroupConversation ? (
                              <Users className="h-5 w-5" />
                            ) : (
                              conversation.title?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-emerald-600 hover:bg-emerald-600 text-white flex items-center justify-center">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                            {conversation.title}
                          </h3>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 ml-2">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>

                        {conversation.isGroupConversation && (
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="h-3 w-3 text-zinc-400" />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {conversation.participants.length} participants
                            </span>
                          </div>
                        )}

                        {conversation.lastMessage && (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate flex-1">
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.lastMessage.senderId === currentUser?.id && (
                              <div className="shrink-0">
                                {conversation.lastMessage.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Clock className="h-3 w-3 text-zinc-400" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default MessagingDashboardWidget;
