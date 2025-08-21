import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  reactions?: { emoji: string; count: number }[];
}

interface SimpleChatWindowProps {
  conversation: {
    id: string;
    participantName: string;
    participantAvatar: string;
    ownerName: string;
    isOnline: boolean;
  };
  messages: Message[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export default function SimpleChatWindow({
  conversation,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  onCall,
  onVideoCall
}: SimpleChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any[], message) => {
    const messageDate = new Date(message.timestamp);
    const dateKey = messageDate.toDateString();
    
    if (!groups.find(g => g.date === dateKey)) {
      groups.push({
        date: dateKey,
        label: getDateLabel(messageDate),
        messages: []
      });
    }
    
    const group = groups.find(g => g.date === dateKey);
    group.messages.push(message);
    
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.participantAvatar} />
            <AvatarFallback>{conversation.participantName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{conversation.participantName}</h2>
              {conversation.isOnline && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              with {conversation.ownerName} • {conversation.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCall && (
            <Button variant="ghost" size="sm" onClick={onCall} className="p-2">
              <Phone className="h-5 w-5 text-gray-600" />
            </Button>
          )}
          {onVideoCall && (
            <Button variant="ghost" size="sm" onClick={onVideoCall} className="p-2">
              <Video className="h-5 w-5 text-gray-600" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex justify-center my-4">
                <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full">
                  {group.label}
                </span>
              </div>

              {/* Messages for this date */}
              {group.messages.map((message: Message, index: number) => {
                const isOwn = message.senderId === currentUserId;
                const showTime = index === group.messages.length - 1 || 
                  (index < group.messages.length - 1 && 
                   new Date(group.messages[index + 1].timestamp).getTime() - new Date(message.timestamp).getTime() > 300000); // 5 minutes

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {!isOwn && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={conversation.participantAvatar} />
                          <AvatarFallback className="text-xs">{conversation.participantName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl max-w-full break-words ${
                            isOwn
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        
                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {message.reactions.map((reaction, i) => (
                              <div key={i} className="flex items-center gap-1 text-xs bg-white border rounded-full px-2 py-1">
                                <span>{reaction.emoji}</span>
                                <span className="text-gray-600">{reaction.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {showTime && (
                          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {formatTime(new Date(message.timestamp))}
                            {isOwn && message.isRead && (
                              <span className="ml-1 text-blue-500">✓✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            size="sm"
            className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}