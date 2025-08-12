import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/bottom-nav";

const CURRENT_DOG_ID = "975edab1-60b7-452c-962c-32fb2a622a7f"; // Buddy's ID from database

export default function Matches() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/dogs", CURRENT_DOG_ID, "matches"],
    queryFn: async () => {
      const response = await fetch(`/api/dogs/${CURRENT_DOG_ID}/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
          <h1 className="text-2xl font-bold dark-gray">Matches</h1>
          <p className="medium-gray">Dogs that liked you back</p>
        </header>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-bold dark-gray">Matches</h1>
        <p className="medium-gray">Dogs that liked you back</p>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 medium-gray" />
            <h3 className="text-xl font-bold mb-2 dark-gray">No matches yet</h3>
            <p className="medium-gray mb-6">
              Keep swiping to find your dog's perfect playmate!
            </p>
            <Button className="bg-coral text-white">
              Back to Discover
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match: any) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={match.otherDog?.photos?.[0] || "/placeholder-dog.jpg"}
                      alt={match.otherDog?.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold dark-gray">{match.otherDog?.name}</h3>
                        <span className="text-sm medium-gray">
                          {match.otherDog?.age} years
                        </span>
                      </div>
                      
                      <p className="text-sm medium-gray mb-2">
                        {match.otherDog?.breed} • {match.otherDog?.size}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {match.otherDog?.medicalProfile?.vaccinations?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Vaccinated
                          </Badge>
                        )}
                        {match.otherDog?.medicalProfile?.isSpayedNeutered && (
                          <Badge variant="secondary" className="text-xs">
                            Spayed/Neutered
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button size="sm" className="bg-coral text-white">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                  
                  <p className="text-xs medium-gray mt-3">
                    Matched {new Date(match.createdAt).toLocaleDateString()}
                  </p>
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
