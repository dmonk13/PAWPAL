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
  Info
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
import ReportModal from "./report-modal";
import RemoveMatchModal from "./remove-match-modal";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "audio";
  mediaUrl?: string;
  isRead: boolean;
}

interface ChatWindowProps {
  matchId: string;
  dogName: string;
  dogPhoto: string;
  ownerName?: string;
  onBack: () => void;
}

export default function ChatWindow({ matchId, dogName, dogPhoto, ownerName, onBack }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "other",
      content: "Hi! Our dogs matched! Would love to set up a playdate 🐕",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
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
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: "text",
      isRead: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: message,
      timestamp: new Date(),
      type: "text",
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

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

  return (
    <>
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

      <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
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
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={dogPhoto} alt={dogName} />
              <AvatarFallback>{dogName[0]}</AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="font-semibold text-gray-900" data-testid="text-dog-name">{dogName}</h2>
              {ownerName && (
                <p className="text-sm text-gray-500" data-testid="text-owner-name">with {ownerName}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAudioCall}
              data-testid="button-audio-call"
            >
              <Phone className="w-5 h-5 text-green-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVideoCall}
              data-testid="button-video-call"
            >
              <Video className="w-5 h-5 text-blue-600" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-menu">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="menu-view-profile">
                  <Info className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600" 
                  data-testid="menu-report-match"
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report Match
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600" 
                  data-testid="menu-remove-match"
                  onClick={() => setShowRemoveModal(true)}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove Match
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const showDate = index === 0 || 
            formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
          
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-sm text-gray-500 mb-4">
                  {formatDate(msg.timestamp)}
                </div>
              )}
              
              <div className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.senderId === 'me' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
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
                  
                  <p className="text-sm" data-testid="message-content">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderId === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
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

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,audio/*"
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-attach"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-image"
          >
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </Button>
          
          <div className="flex-1">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-0 resize-none border-0 bg-gray-100 rounded-full px-4 py-2"
              rows={1}
              data-testid="input-message"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-emoji"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}