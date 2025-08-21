import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Image as ImageIcon,
  Mic,
  Smile,
  Flag,
  UserMinus,
  Info,
  MapPin,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Heart,
  ThumbsUp,
  ChevronUp,
  Volume2,
  VolumeX,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Reply,
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  DollarSign,
  CheckSquare,
  AlertCircle,
  Pin,
  FileImage,
  MicIcon,
  Square,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReportModal from "./report-modal";
import RemoveMatchModal from "./remove-match-modal";
import MatchedDogProfileModal from "./matched-dog-profile-modal";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "audio" | "location" | "playdate" | "poll" | "payment" | "checklist";
  mediaUrl?: string;
  isRead: boolean;
  isEdited?: boolean;
  replyTo?: string;
  reactions?: { emoji: string; users: string[] }[];
  metadata?: {
    location?: { lat: number; lng: number; name: string; address: string };
    playdate?: { 
      title: string; 
      date: string; 
      time: string; 
      location: string; 
      status: 'proposed' | 'confirmed' | 'declined';
      notes?: string;
    };
    poll?: {
      question: string;
      options: { text: string; votes: string[] }[];
      allowMultiple: boolean;
    };
    payment?: {
      amount: number;
      description: string;
      status: 'pending' | 'completed' | 'declined';
    };
    checklist?: {
      title: string;
      items: { text: string; completed: boolean; assignedTo?: string }[];
    };
  };
}

interface ChatWindowProps {
  matchId: string;
  dogName: string;
  dogPhoto: string;
  ownerName?: string;
  onBack: () => void;
}

interface SuggestionChip {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export default function ChatWindow({ matchId, dogName, dogPhoto, ownerName, onBack }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "other",
      content: "Hi! Our dogs matched! Would love to set up a playdate 🐕",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "text",
      isRead: true
    },
    {
      id: "2", 
      senderId: "me",
      content: "That sounds great! What area of Bangalore are you in?",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      type: "text",
      isRead: true
    },
    {
      id: "3",
      senderId: "other",
      content: "We're near Koramangala. There's a nice dog park there. How about this weekend?",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: "text", 
      isRead: true
    },
    {
      id: "4",
      senderId: "me",
      content: "Perfect! Saturday morning works for us. Looking forward to it!",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "text",
      isRead: true
    },
    {
      id: "5",
      senderId: "other",
      content: "",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: "playdate",
      isRead: true,
      metadata: {
        playdate: {
          title: "Dog Park Playdate",
          date: "2025-08-16",
          time: "10:00 AM",
          location: "Koramangala Dog Park, Bangalore",
          status: "proposed",
          notes: "Bring water bowls and some toys! Luna loves playing fetch."
        }
      }
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDogProfile, setShowDogProfile] = useState(false);
  const [showAvatarActionSheet, setShowAvatarActionSheet] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState("2 min ago");
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [textareaRows, setTextareaRows] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowJumpToBottom(!isNearBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Pin button options
  const pinOptions: SuggestionChip[] = [
    {
      id: "location",
      label: "Share Location",
      icon: MapPin,
      action: () => handleSuggestionAction("location")
    },
    {
      id: "playdate",
      label: "Propose Playdate",
      icon: Calendar,
      action: () => handleSuggestionAction("playdate")
    },
    {
      id: "poll",
      label: "Create Poll",
      icon: Plus,
      action: () => handleSuggestionAction("poll")
    },
    {
      id: "profile",
      label: "Share Dog Profile",
      icon: Heart,
      action: () => handleSuggestionAction("profile")
    },
    {
      id: "attachment",
      label: "Attach File",
      icon: Paperclip,
      action: () => fileInputRef.current?.click()
    }
  ];

  const handleSuggestionAction = (action: string) => {
    switch (action) {
      case "location":
        const locationMessage: Message = {
          id: Date.now().toString(),
          senderId: "me",
          content: "Current Location",
          timestamp: new Date(),
          type: "location",
          isRead: false,
          metadata: {
            location: {
              lat: 12.9352,
              lng: 77.6245,
              name: "Cubbon Park",
              address: "Cubbon Park, Bangalore, Karnataka 560001"
            }
          }
        };
        setMessages(prev => [...prev, locationMessage]);
        break;
        
      case "playdate":
        const playdateMessage: Message = {
          id: Date.now().toString(),
          senderId: "me",
          content: "",
          timestamp: new Date(),
          type: "playdate",
          isRead: false,
          metadata: {
            playdate: {
              title: "Weekend Playdate",
              date: "2025-08-17",
              time: "4:00 PM", 
              location: "Lalbagh Botanical Garden",
              status: "proposed",
              notes: "Perfect weather for outdoor play!"
            }
          }
        };
        setMessages(prev => [...prev, playdateMessage]);
        break;
        
      case "poll":
        const pollMessage: Message = {
          id: Date.now().toString(),
          senderId: "me",
          content: "",
          timestamp: new Date(),
          type: "poll",
          isRead: false,
          metadata: {
            poll: {
              question: "Best time for our playdate?",
              options: [
                { text: "Saturday Morning", votes: [] },
                { text: "Saturday Evening", votes: [] },
                { text: "Sunday Morning", votes: [] }
              ],
              allowMultiple: false
            }
          }
        };
        setMessages(prev => [...prev, pollMessage]);
        break;
    }
    setShowSuggestions(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          const hasUserReacted = existingReaction.users.includes("me");
          if (hasUserReacted) {
            existingReaction.users = existingReaction.users.filter(u => u !== "me");
          } else {
            existingReaction.users.push("me");
          }
        } else {
          reactions.push({ emoji, users: ["me"] });
        }
        
        return { ...msg, reactions: reactions.filter(r => r.users.length > 0) };
      }
      return msg;
    }));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({ title: "Message deleted" });
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, isEdited: true }
        : msg
    ));
    toast({ title: "Message edited" });
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: message,
      timestamp: new Date(),
      type: "text",
      isRead: false,
      replyTo: replyTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setReplyTo(null);
    setTextareaRows(1);

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Add a sample response
      if (message.toLowerCase().includes("photo") || message.toLowerCase().includes("picture")) {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: "other",
          content: "Here's a recent photo of " + dogName + "!",
          timestamp: new Date(Date.now() + 1000),
          type: "image",
          mediaUrl: dogPhoto,
          isRead: false
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you'd upload the file to a server
    const fileUrl = URL.createObjectURL(file);
    
    let messageType: "text" | "image" | "audio" = "text";
    let content = `Sent a file: ${file.name}`;
    
    if (file.type.startsWith('image/')) {
      messageType = "image";
      content = "Sent a photo";
    } else if (file.type.startsWith('audio/')) {
      messageType = "audio";
      content = "Sent an audio message";
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content,
      timestamp: new Date(),
      type: messageType,
      mediaUrl: fileUrl,
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const voiceMessage: Message = {
          id: Date.now().toString(),
          senderId: "me",
          content: "Voice message",
          timestamp: new Date(),
          type: "audio",
          mediaUrl: audioUrl,
          isRead: false
        };
        
        setMessages(prev => [...prev, voiceMessage]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Tap the stop button when you're done"
      });
      
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      toast({
        title: "Voice message sent",
        description: `Recorded ${recordingTime} seconds`
      });
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (timestamp.toDateString() === today.toDateString()) {
      return "Today";
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const handleAudioCall = () => {
    toast({
      title: "Audio Call",
      description: `Starting audio call with ${dogName}'s owner...`,
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call", 
      description: `Starting video call with ${dogName}'s owner...`,
    });
  };

  const handleReportSubmit = (reason: string, details: string) => {
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep PupMatch safe. We'll review your report.",
      variant: "default",
    });
  };

  const handleRemoveMatch = () => {
    toast({
      title: "Match Removed",
      description: `Your match with ${dogName} has been removed.`,
      variant: "destructive",
    });
    onBack();
  };

  // Mock dog data for profile modal (in real app, this would come from props or API)
  const mockDogData = {
    id: 'matched-dog-1',
    name: dogName,
    age: 3,
    breed: 'Golden Retriever',
    size: 'Large',
    photos: [
      dogPhoto,
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
      name: ownerName || 'Sarah',
      verified: true,
      joinedDate: 'March 2023'
    },
    about: `${dogName} is a loving and energetic ${dogName.includes('Luna') ? 'girl' : 'boy'} who loves long walks, playing fetch, and meeting new friends at the dog park. Great with kids and other dogs!`,
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

  const handleAvatarLongPressStart = () => {
    const timer = setTimeout(() => {
      setShowAvatarActionSheet(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleAvatarLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleNameAreaTap = () => {
    handleAvatarTap();
  };

  // Render different message types
  const renderMessageContent = (msg: Message) => {
    switch (msg.type) {
      case "location":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-3 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-sm">Live Location</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <div className="font-medium">{msg.metadata?.location?.name}</div>
              <div className="text-xs">{msg.metadata?.location?.address}</div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-3 h-3 mr-1" />
              View on Map
            </Button>
          </div>
        );

      case "playdate":
        const playdate = msg.metadata?.playdate;
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Playdate Proposal</span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="font-medium">{playdate?.title}</div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{playdate?.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{playdate?.time}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{playdate?.location}</span>
              </div>
              {playdate?.notes && (
                <div className="text-sm text-gray-600 italic">"{playdate.notes}"</div>
              )}
            </div>
            {playdate?.status === "proposed" && msg.senderId === "other" && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => toast({ title: "Playdate accepted!" })}
                >
                  Accept
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast({ title: "Suggest new time" })}
                >
                  Suggest New Time
                </Button>
              </div>
            )}
            {playdate?.status === "confirmed" && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmed</span>
              </div>
            )}
          </div>
        );

      case "poll":
        const poll = msg.metadata?.poll;
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-sm">
            <div className="font-semibold mb-3">{poll?.question}</div>
            <div className="space-y-2">
              {poll?.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-between text-left"
                  onClick={() => toast({ title: `Voted for: ${option.text}` })}
                >
                  <span>{option.text}</span>
                  <Badge variant="secondary">{option.votes.length}</Badge>
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return <p className="text-sm">{msg.content}</p>;
    }
  };

  return (
    <TooltipProvider>
      {showReportModal && (
        <ReportModal
          dogName={dogName}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
        />
      )}
      
      {showRemoveModal && (
        <RemoveMatchModal
          dogName={dogName}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={handleRemoveMatch}
        />
      )}

      {/* Matched Dog Profile Modal */}
      <MatchedDogProfileModal
        isOpen={showDogProfile}
        onClose={() => setShowDogProfile(false)}
        dog={mockDogData}
        currentChatId="current-chat"
      />

      {/* Avatar Long Press Action Sheet */}
      <Sheet open={showAvatarActionSheet} onOpenChange={setShowAvatarActionSheet}>
        <SheetContent side="bottom" className="h-auto">
          <div className="pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={dogPhoto} alt={dogName} />
                <AvatarFallback>{dogName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{dogName}</h3>
                <p className="text-sm text-gray-600">with {ownerName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                onClick={() => {
                  setShowAvatarActionSheet(false);
                  handleAvatarTap();
                }}
                data-testid="button-action-sheet-view-profile"
              >
                <Info className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                onClick={() => {
                  setShowAvatarActionSheet(false);
                  setIsMuted(!isMuted);
                  toast({
                    title: isMuted ? "Notifications enabled" : "Notifications muted",
                    description: isMuted ? 
                      "You'll receive notifications from this chat" :
                      "You won't receive notifications from this chat"
                  });
                }}
                data-testid="button-action-sheet-mute"
              >
                {isMuted ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setShowAvatarActionSheet(false);
                  setShowRemoveModal(true);
                }}
                data-testid="button-action-sheet-block"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Block
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div 
              className="relative cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={handleAvatarTap}
              onTouchStart={handleAvatarLongPressStart}
              onTouchEnd={handleAvatarLongPressEnd}
              onMouseDown={handleAvatarLongPressStart}
              onMouseUp={handleAvatarLongPressEnd}
              onMouseLeave={handleAvatarLongPressEnd}
              data-testid="button-avatar-header"
              aria-label="View dog profile"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={dogPhoto} alt={dogName} />
                <AvatarFallback>{dogName[0]}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div 
              className="cursor-pointer flex-1 min-h-[44px] flex flex-col justify-center"
              onClick={handleNameAreaTap}
              data-testid="button-name-area"
              aria-label="View dog profile"
            >
              <h2 className="font-semibold text-gray-900" data-testid="text-dog-name">{dogName}</h2>
              <div className="flex items-center space-x-2">
                {ownerName && (
                  <p className="text-xs text-gray-500" data-testid="text-owner-name">with {ownerName}</p>
                )}
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">
                  {isOnline ? "Online" : `Last seen ${lastSeen}`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAudioCall}
                  data-testid="button-audio-call"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Call</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVideoCall}
                  data-testid="button-video-call"
                >
                  <Video className="w-5 h-5 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video Call</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-menu">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Read Receipts
                  <Switch className="ml-auto" defaultChecked />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600" 
                  data-testid="menu-report-match"
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600" 
                  data-testid="menu-remove-match"
                  onClick={() => setShowRemoveModal(true)}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unmatch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((msg, index) => {
          const showDate = index === 0 || 
            formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
          const replyToMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
          const isMyMessage = msg.senderId === 'me';
          
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-sm text-gray-500 mb-4 bg-gray-200 rounded-full px-3 py-1 inline-block mx-auto">
                  {formatDate(msg.timestamp)}
                </div>
              )}
              
              <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group`}>
                {/* Show avatar for other user's messages */}
                {!isMyMessage && (
                  <div 
                    className="flex-shrink-0 mr-2 cursor-pointer min-h-[44px] min-w-[44px] flex items-end justify-center pb-2"
                    onClick={handleAvatarTap}
                    data-testid="button-message-avatar"
                    aria-label="View dog profile"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={dogPhoto} alt={dogName} />
                      <AvatarFallback className="text-xs">{dogName[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                <div className="flex flex-col max-w-xs lg:max-w-md">
                  {/* Reply preview */}
                  {replyToMsg && (
                    <div className={`text-xs p-2 mb-1 rounded-lg border-l-2 ${
                      isMyMessage 
                        ? 'bg-blue-100 border-blue-300 text-blue-800' 
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}>
                      <div className="font-medium">Replying to:</div>
                      <div className="truncate">{replyToMsg.content || "Media message"}</div>
                    </div>
                  )}
                  
                  <div className={`relative px-4 py-2 rounded-2xl ${
                    isMyMessage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    {/* Message content */}
                    {msg.type === 'image' && msg.mediaUrl && (
                      <div className="mb-2">
                        <img 
                          src={msg.mediaUrl} 
                          alt="Shared image"
                          className="rounded-lg max-w-full h-auto"
                          data-testid="message-image"
                        />
                      </div>
                    )}
                    
                    {msg.type === 'audio' && msg.mediaUrl && (
                      <div className="mb-2">
                        <audio controls className="max-w-full" data-testid="message-audio">
                          <source src={msg.mediaUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    {/* Rich message types */}
                    {['location', 'playdate', 'poll'].includes(msg.type) ? (
                      renderMessageContent(msg)
                    ) : (
                      <>
                        <div className="text-sm" data-testid="message-content">
                          {msg.content}
                          {msg.isEdited && (
                            <span className={`ml-2 text-xs ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                              (edited)
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className={`text-xs mt-1 flex items-center justify-between ${
                      isMyMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isMyMessage && (
                        <div className="flex items-center space-x-1">
                          {msg.isRead && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      )}
                    </div>

                    {/* Message actions - visible on hover */}
                    <div className={`absolute ${isMyMessage ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0 bg-white border shadow-sm">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMyMessage ? "end" : "start"} className="w-40">
                          <DropdownMenuItem onClick={() => handleReply(msg)}>
                            <Reply className="w-3 h-3 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(msg.content)}>
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {isMyMessage && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditMessage(msg.id, prompt("Edit message:", msg.content) || msg.content)}>
                                <Edit3 className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteMessage(msg.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      {msg.reactions.map((reaction, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs bg-white"
                          onClick={() => handleReaction(msg.id, reaction.emoji)}
                        >
                          {reaction.emoji} {reaction.users.length}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Quick reactions */}
                  <div className={`flex space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isMyMessage ? 'justify-end' : 'justify-start'
                  }`}>
                    {['👍', '❤️', '😂', '😮'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 text-sm hover:bg-gray-100 rounded-full"
                        onClick={() => handleReaction(msg.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-white border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Jump to bottom FAB */}
      {showJumpToBottom && (
        <div className="absolute bottom-24 right-4 z-10">
          <Button
            onClick={scrollToBottom}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </Button>
        </div>
      )}


      {/* Enhanced Input Area */}
      <div className="bg-white border-t border-gray-200">
        {/* Reply Bar */}
        {replyTo && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-sm">
                <div className="text-gray-600">Replying to:</div>
                <div className="text-gray-900 truncate">{replyTo.content || "Media message"}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                ×
              </Button>
            </div>
          </div>
        )}

        <div className="px-4 py-3">
          <div className="flex items-end space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,audio/*"
              className="hidden"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-pin"
                >
                  <Pin className="w-5 h-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {pinOptions.map((option) => (
                  <DropdownMenuItem key={option.id} onClick={option.action}>
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-image"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Photo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type a message..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  // Auto-resize
                  const lines = e.target.value.split('\n').length;
                  setTextareaRows(Math.min(Math.max(lines, 1), 4));
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-0 resize-none border-0 bg-gray-100 rounded-full px-4 py-2 pr-10"
                rows={textareaRows}
                data-testid="input-message"
              />
              
              {/* Emoji button inside textarea */}
              <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    data-testid="button-emoji"
                  >
                    <Smile className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-4">
                  <div className="mb-3">
                    <div className="flex space-x-2 mb-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Smile className="w-4 h-4 mr-1" />
                        Emoji
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileImage className="w-4 h-4 mr-1" />
                        GIF
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {['😀', '😂', '🥰', '😍', '🤗', '😎', '🤔', '😴', '🐕', '🐶', '❤️', '👍', '👏', '🎉', '🔥', '💯'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Tap an emoji to add it to your message
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {message.trim() ? (
              <Button
                onClick={handleSendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 min-w-[40px] h-10"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                {isRecording && (
                  <div className="flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 font-medium">
                      {formatRecordingTime(recordingTime)}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full p-2 min-w-[40px] h-10 ${
                    isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                  }`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  data-testid="button-mic"
                >
                  {isRecording ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}