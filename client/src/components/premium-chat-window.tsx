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
  Image as ImageIcon,
  MapPin,
  Calendar,
  Users,
  UserPlus,
  Heart,
  ThumbsUp,
  CheckCircle2,
  Check,
  Pin,
  Paperclip
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

// Pin button options with expanded functionality
const pinOptions = [
  {
    id: "location",
    label: "Share location",
    icon: MapPin
  },
  {
    id: "schedule", 
    label: "Schedule",
    icon: Calendar
  },
  {
    id: "vet",
    label: "Vet connect",
    icon: UserPlus
  },
  {
    id: "profile",
    label: "Share Dog Profile",
    icon: Heart
  },
  {
    id: "attachment",
    label: "Attach File",
    icon: Paperclip
  }
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
  const [shouldShowScroll, setShouldShowScroll] = useState(false);
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

  const handlePinAction = (actionId: string) => {
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
      case 'attachment':
        // Open file picker
        toast({ title: "Opening file picker..." });
        break;
    }
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        toast({ title: "🎙️ Recording started..." });
        
        // Start recording logic would go here
        // For now, simulate recording for 3 seconds
        setTimeout(() => {
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
          onSendMessage("🎵 Voice message", "audio");
          toast({ title: "Voice message sent!" });
        }, 3000);
        
      } catch (error) {
        console.error("Microphone access denied:", error);
        toast({ 
          title: "Microphone access required", 
          description: "Please allow microphone access to record voice messages.",
          variant: "destructive"
        });
      }
    } else {
      // Stop recording
      setIsRecording(false);
      toast({ title: "Recording stopped" });
    }
  };

  const handleUnmatch = () => {
    // Remove match and go back to matches list
    toast({ 
      title: "Unmatched successfully", 
      description: "This profile has been removed from your matches." 
    });
    // Call onBack to return to matches list since profile is now removed
    onBack();
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
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={handleUnmatch}
                  data-testid="menu-unmatch"
                >
                  Unmatch
                </DropdownMenuItem>
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

        {/* Input Dock */}
        <div className="flex items-center space-x-2">
          {/* Pin Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10"
                data-testid="button-pin"
              >
                <Pin className="w-5 h-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {pinOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem key={option.id} onClick={() => handlePinAction(option.id)}>
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Photo/Video Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10"
                data-testid="button-photo"
              >
                <ImageIcon className="w-5 h-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuItem>
                <ImageIcon className="w-4 h-4 mr-2" />
                Photo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="w-4 h-4 mr-2" />
                Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                // Check if scrolling is needed
                setTimeout(() => {
                  if (textareaRef.current) {
                    const needsScroll = textareaRef.current.scrollHeight > textareaRef.current.clientHeight;
                    setShouldShowScroll(needsScroll);
                  }
                }, 0);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className={`min-h-[44px] max-h-[96px] resize-none rounded-2xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 pr-20 focus:ring-2 focus:ring-blue-300 focus:border-transparent ${shouldShowScroll ? 'overflow-y-auto' : 'overflow-hidden'} scrollbar-hide`}
              rows={1}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {/* Emoji Picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                    <Smile className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setMessageText(prev => prev + emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      🎬 GIF
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {messageText.trim() ? (
                <Button 
                  onClick={handleSend}
                  size="sm" 
                  className="p-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleVoiceRecording}
                  className={`p-2 h-8 w-8 ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500'}`}
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