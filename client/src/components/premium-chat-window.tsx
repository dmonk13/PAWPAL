import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Mic, 
  Send, 
  Plus, 
  Smile,
  MapPin,
  Calendar,
  Users,
  UserPlus,
  Heart,
  ThumbsUp,
  CheckCircle2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import MatchedDogProfileModal from "./matched-dog-profile-modal";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "location" | "playdate";
  isRead: boolean;
  reactions?: { emoji: string; count: number }[];
  metadata?: {
    location?: { lat: number; lng: number; name: string };
    playdate?: { 
      title: string; 
      date: string; 
      time: string; 
      location: string; 
      status: 'proposed' | 'accepted' | 'declined';
      note?: string;
    };
  };
}

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  ownerName: string;
  isOnline: boolean;
  isTyping?: boolean;
  lastSeen?: Date;
}

interface PremiumChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (content: string, type?: string, metadata?: any) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

const quickActions = [
  { id: 'location', icon: MapPin, label: 'Share location' },
  { id: 'schedule', icon: Calendar, label: 'Schedule' },
  { id: 'vet', icon: UserPlus, label: 'Vet connect' },
  { id: 'profile', icon: Users, label: 'Send profile' },
];

const reactionEmojis = ['❤️', '👍', '😂', '😮', '😢', '😡'];

export default function PremiumChatWindow({
  conversation,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  onCall,
  onVideoCall
}: PremiumChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showDogProfile, setShowDogProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
    }
  }, [messageText]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'location':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            onSendMessage("📍 Shared location", "location", {
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                name: "Current Location"
              }
            });
            toast({ title: "Location shared!" });
          });
        }
        break;
      case 'schedule':
        // Open scheduling interface
        toast({ title: "Opening scheduler..." });
        break;
      case 'vet':
        // Open vet connect
        toast({ title: "Opening vet connect..." });
        break;
      case 'profile':
        onSendMessage("📋 Shared profile", "profile");
        toast({ title: "Profile shared!" });
        break;
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    // In real app, this would call an API
    toast({ title: `Added ${emoji} reaction` });
  };

  // Mock dog data for profile modal (in real app, this would come from props or API)
  const mockDogData = {
    id: 'matched-dog-1',
    name: conversation.participantName,
    age: 3,
    breed: 'Golden Retriever',
    size: 'Large',
    photos: [
      conversation.participantAvatar,
      "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"
    ],
    temperament: ['Friendly', 'Playful', 'Gentle', 'Energetic'],
    vaccinations: {
      rabies: { status: 'up-to-date' as const, date: '2024-03-15' },
      dhpp: { status: 'due-soon' as const, date: '2024-01-20' }
    },
    allergies: ['chicken', 'wheat'],
    owner: {
      name: conversation.ownerName || 'Sarah',
      verified: true,
      joinedDate: 'March 2023'
    },
    about: `${conversation.participantName} is a loving and energetic dog who loves long walks, playing fetch, and meeting new friends at the dog park. Great with kids and other dogs!`,
    medicalNotes: 'Healthy overall, just needs to watch diet due to food sensitivities.',
    playPreferences: ['Fetch', 'Tug of war', 'Swimming', 'Dog park visits'],
    recentCheckins: [
      { park: 'Central Dog Park', date: '2 days ago' },
      { park: 'Riverside Trail', date: '1 week ago' },
      { park: 'Bark & Recreation', date: '2 weeks ago' }
    ],
    location: 'Brooklyn, NY',
    distance: 2.4
  };

  const handleAvatarTap = () => {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'avatar_tap_profile_open', {
        dog_id: mockDogData.id,
        source: 'chat_header'
      });
    }
    setShowDogProfile(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const currentDay = formatDay(message.timestamp);
    const prevMessage = messages[index - 1];
    const prevDay = prevMessage ? formatDay(prevMessage.timestamp) : null;

    if (currentDay !== prevDay) {
      groups.push({ type: 'day', content: currentDay });
    }
    groups.push(message);
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Premium App Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 relative">
        {/* Online gradient underline */}
        {conversation.isOnline && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 via-blue-500 to-green-400 animate-pulse" />
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="relative cursor-pointer" onClick={handleAvatarTap}>
                <Avatar className="w-11 h-11">
                  <AvatarImage src={conversation.participantAvatar} />
                  <AvatarFallback>{conversation.participantName[0]}</AvatarFallback>
                </Avatar>
                {conversation.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>
              
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {conversation.participantName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  with {conversation.ownerName} • {conversation.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCall}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onVideoCall}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Video className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Conversation Thread */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <AnimatePresence>
          {groupedMessages.map((item, index) => {
            if (item.type === 'day') {
              return (
                <motion.div
                  key={`day-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center my-6"
                >
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                    {item.content}
                  </div>
                </motion.div>
              );
            }

            const message = item as Message;
            const isOwn = message.senderId === currentUserId;
            const showAvatar = !isOwn;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12 }}
                className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {showAvatar && (
                  <Avatar className="w-8 h-8 mb-1">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[78%] ${isOwn ? 'order-first' : ''}`}>
                  {/* Message Bubble */}
                  <div
                    className={`relative px-4 py-3 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm'
                    } ${
                      isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                  >
                    {/* Message Content */}
                    {message.type === 'playdate' && message.metadata?.playdate ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-semibold">Playdate Proposal</span>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-3 space-y-2">
                          <h4 className="font-medium">{message.metadata.playdate.title}</h4>
                          <div className="text-sm space-y-1">
                            <div>📅 {message.metadata.playdate.date}</div>
                            <div>🕐 {message.metadata.playdate.time}</div>
                            <div>📍 {message.metadata.playdate.location}</div>
                          </div>
                          {message.metadata.playdate.note && (
                            <p className="text-sm italic">"{message.metadata.playdate.note}"</p>
                          )}
                        </div>
                        
                        {!isOwn && message.metadata.playdate.status === 'proposed' && (
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => toast({ title: "Playdate accepted!" })}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-current border-current"
                              onClick={() => toast({ title: "Suggest different time..." })}
                            >
                              Suggest change
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}

                    {/* Message tail */}
                    <div
                      className={`absolute bottom-0 w-3 h-3 ${
                        isOwn
                          ? 'right-0 translate-x-1 bg-blue-600'
                          : 'left-0 -translate-x-1 bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700'
                      } ${
                        isOwn ? 'rounded-bl-full' : 'rounded-br-full'
                      }`}
                    />
                  </div>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex space-x-1 mt-1 ml-2">
                      {message.reactions.map((reaction, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 text-xs flex items-center space-x-1 shadow-sm"
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp and Status */}
                  <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isOwn && (
                      <div className="flex space-x-0.5">
                        <Check className="w-3 h-3" />
                        {message.isRead && <Check className="w-3 h-3 -ml-1" />}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {conversation.isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end space-x-2"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={conversation.participantAvatar} />
              <AvatarFallback>{conversation.participantName[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Premium Composer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {/* Quick Actions Row */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Input Dock */}
        <div className="flex items-end space-x-3">
          {/* Attachments Sheet */}
          <Sheet open={showAttachments} onOpenChange={setShowAttachments}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px]">
              <div className="grid grid-cols-3 gap-4 p-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <MapPin className="w-6 h-6" />
                  <span className="text-xs">Location</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span className="text-xs">Vet Proposal</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span className="text-xs">Contact</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-[96px] resize-none rounded-2xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 pr-20 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              rows={1}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="p-2">
                <Smile className="w-4 h-4 text-gray-500" />
              </Button>
              
              {messageText.trim() ? (
                <Button 
                  onClick={handleSend}
                  size="sm" 
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onMouseDown={() => setIsRecording(true)}
                  onMouseUp={() => setIsRecording(false)}
                  onMouseLeave={() => setIsRecording(false)}
                  className={`p-2 ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500'}`}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
      
      {/* Dog Profile Modal */}
      <MatchedDogProfileModal
        isOpen={showDogProfile}
        onClose={() => setShowDogProfile(false)}
        dog={mockDogData}
        currentChatId={conversation.id}
      />
    </div>
  );
}