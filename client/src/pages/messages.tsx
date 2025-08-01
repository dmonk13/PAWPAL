import { MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/bottom-nav";

export default function Messages() {
  // TODO: Implement real messaging functionality
  const conversations = [
    {
      id: "1",
      dogName: "Luna",
      dogPhoto: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      lastMessage: "Would love to set up a playdate!",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      dogName: "Max",
      dogPhoto: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      lastMessage: "Thanks for the match! 🐕",
      timestamp: "1 day ago",
      unread: false,
    },
  ];

  return (
    <>
      <div className="min-h-screen p-4 pb-20">
        <header className="mb-6">
          <h1 className="text-2xl font-bold dark-gray">Messages</h1>
          <p className="medium-gray">Chat with your matches</p>
        </header>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 medium-gray" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
        
        {conversations.length === 0 ? (
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
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={conversation.dogPhoto}
                        alt={conversation.dogName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.unread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-coral rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${conversation.unread ? 'dark-gray' : 'medium-gray'}`}>
                          {conversation.dogName}
                        </h3>
                        <span className="text-xs medium-gray">
                          {conversation.timestamp}
                        </span>
                      </div>
                      
                      <p className={`text-sm truncate ${
                        conversation.unread ? 'dark-gray' : 'medium-gray'
                      }`}>
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
    </>
  );
}
