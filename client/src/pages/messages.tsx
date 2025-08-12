import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/bottom-nav";
import ChatWindow from "@/components/chat-window";

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // First get the current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Get the user's dogs
  const { data: userDogs = [] } = useQuery({
    queryKey: ["/api/users", currentUser?.id, "dogs"],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/users/${currentUser.id}/dogs`);
      if (!response.ok) throw new Error('Failed to fetch user dogs');
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  // Use the first dog's ID to fetch matches
  const currentDogId = userDogs[0]?.id;
  
  // Fetch matches which we'll use as conversations
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/dogs", currentDogId, "matches"],
    queryFn: async () => {
      if (!currentDogId) return [];
      const response = await fetch(`/api/dogs/${currentDogId}/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    },
    enabled: !!currentDogId,
  });

  // Transform matches into conversations with mock last messages
  const conversations = matches.map((match: any, index: number) => {
    const lastMessages = [
      "Would love to set up a playdate!",
      "Thanks for the match! 🐕",
      "The park visit was amazing! Same time next week?",
      "How's your dog doing today?",
      "Want to meet at the dog park this weekend?",
    ];
    
    const timestamps = [
      "2 hours ago",
      "1 day ago", 
      "3 days ago",
      "1 week ago",
      "2 weeks ago",
    ];

    return {
      id: match.id,
      dogName: match.otherDog?.name || "Unknown Dog",
      dogPhoto: match.otherDog?.photos?.[0] || "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      ownerName: match.otherDog?.ownerId ? "Owner" : "Unknown Owner",
      lastMessage: lastMessages[index % lastMessages.length],
      timestamp: timestamps[index % timestamps.length],
      unread: index === 0, // First match is unread
    };
  });

  const selectedConversation = conversations.find((c: any) => c.id === selectedChat);

  if (selectedChat && selectedConversation) {
    return (
      <ChatWindow
        matchId={selectedChat}
        dogName={selectedConversation.dogName}
        dogPhoto={selectedConversation.dogPhoto}
        ownerName={selectedConversation.ownerName}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-bold dark-gray">Messages</h1>
        <p className="medium-gray">Chat with your matches</p>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 medium-gray" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
        
        {isLoading || !currentDogId ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 medium-gray" />
            <h3 className="text-xl font-bold mb-2 dark-gray">No messages yet</h3>
            <p className="medium-gray mb-6">
              Start chatting when you get your first match!
            </p>
            <Button className="bg-coral text-white">
              Find Matches
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation: any) => (
              <Card 
                key={conversation.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedChat(conversation.id)}
                data-testid={`chat-item-${conversation.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={conversation.dogPhoto}
                        alt={conversation.dogName}
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid={`img-dog-${conversation.id}`}
                      />
                      {conversation.unread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-coral rounded-full" data-testid={`indicator-unread-${conversation.id}`}></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className={`font-semibold ${conversation.unread ? 'dark-gray' : 'medium-gray'}`} data-testid={`text-dog-name-${conversation.id}`}>
                            {conversation.dogName}
                          </h3>
                          <p className="text-xs text-gray-500" data-testid={`text-owner-name-${conversation.id}`}>
                            with {conversation.ownerName}
                          </p>
                        </div>
                        <span className="text-xs medium-gray" data-testid={`text-timestamp-${conversation.id}`}>
                          {conversation.timestamp}
                        </span>
                      </div>
                      
                      <p className={`text-sm truncate ${
                        conversation.unread ? 'dark-gray' : 'medium-gray'
                      }`} data-testid={`text-last-message-${conversation.id}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
