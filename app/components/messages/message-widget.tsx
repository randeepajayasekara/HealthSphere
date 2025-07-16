"use client";

import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Users, 
  Clock,
  CheckCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message, Conversation, User, UserRole } from '@/app/types';

interface MessageWidgetProps {
  userId: string;
  userRole: UserRole;
  patientId?: string;
  doctorId?: string;
  className?: string;
}

interface QuickMessage extends Message {
  sender?: User;
}

const MessageWidget: React.FC<MessageWidgetProps> = ({
  userId,
  userRole,
  patientId,
  doctorId,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<QuickMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      participants: ['user-1', 'user-2'],
      title: 'Dr. Smith',
      lastMessageAt: new Date(),
      createdAt: new Date(),
      isGroupConversation: false
    },
    {
      id: 'conv-2',
      participants: ['user-1', 'user-3'],
      title: 'Emergency Team',
      lastMessageAt: new Date(Date.now() - 3600000),
      createdAt: new Date(),
      isGroupConversation: true
    }
  ];

  const mockMessages: QuickMessage[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content: 'Patient is ready for the next procedure.',
      createdAt: new Date(Date.now() - 1800000),
      isRead: true,
      isDeleted: false,
      sender: {
        id: 'user-2',
        email: 'dr.smith@healthsphere.com',
        firstName: 'Dr.',
        lastName: 'Smith',
        role: 'doctor',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: 'Thank you, I\'ll be there in 5 minutes.',
      createdAt: new Date(Date.now() - 900000),
      isRead: true,
      isDeleted: false,
      sender: {
        id: 'user-1',
        email: 'nurse@healthsphere.com',
        firstName: 'Nurse',
        lastName: 'Johnson',
        role: 'nurse',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message: QuickMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeChat.id,
      senderId: userId,
      content: newMessage.trim(),
      createdAt: new Date(),
      isRead: false,
      isDeleted: false,
      sender: {
        id: userId,
        email: 'current@user.com',
        firstName: 'Current',
        lastName: 'User',
        role: userRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className={`w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-96'
      }`}>
        <CardHeader className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              {activeChat ? activeChat.title : 'Quick Messages'}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {!activeChat ? (
              /* Conversation List */
              <div className="flex-1">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Recent Conversations</p>
                </div>
                <ScrollArea className="h-48">
                  <div className="space-y-1 p-2">
                    {mockConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setActiveChat(conversation);
                          setMessages(mockMessages.filter(m => m.conversationId === conversation.id));
                        }}
                        className="p-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                              {conversation.isGroupConversation ? (
                                <Users className="h-4 w-4" />
                              ) : (
                                'DS'
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                              {conversation.title}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formatTime(conversation.lastMessageAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              /* Active Chat */
              <>
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveChat(null)}
                        className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                      >
                        ←
                      </Button>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {activeChat.title}
                      </span>
                    </div>
                    {activeChat.isGroupConversation && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Group
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === userId;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${isOwnMessage ? 'order-1' : 'order-0'}`}>
                            {!isOwnMessage && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-zinc-900 dark:text-white">
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
                              className={`px-3 py-2 rounded-lg text-sm ${
                                isOwnMessage
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                              }`}
                            >
                              {message.content}
                            </div>
                            
                            <div className={`flex items-center gap-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isOwnMessage && (
                                <div>
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
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MessageWidget;
