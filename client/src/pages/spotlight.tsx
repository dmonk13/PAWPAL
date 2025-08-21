import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, X, Zap, MessageSquare, MapPin, Calendar, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/bottom-nav";
import { SpotlightCandidate, WoofStatus } from "@shared/schema";
import "../styles/spotlight.css";

const CURRENT_USER_ID = "user-1"; // Sarah's user ID from sample data

export default function Spotlight() {
  const [selectedDog, setSelectedDog] = useState<SpotlightCandidate | null>(null);
  const [likeNotes, setLikeNotes] = useState<Record<string, string>>({});
  const [isSubmittingLike, setIsSubmittingLike] = useState(false);
  const [isSubmittingWoof, setIsSubmittingWoof] = useState(false);
  const { toast } = useToast();

  // Fetch Spotlight candidates
  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ["/api/spotlight"],
    queryFn: async (): Promise<SpotlightCandidate[]> => {
      const response = await fetch("/api/spotlight");
      if (!response.ok) throw new Error('Failed to fetch Spotlight candidates');
      return response.json();
    },
  });

  // Fetch woof status
  const { data: woofStatus } = useQuery({
    queryKey: ["/api/woof/status"],
    queryFn: async (): Promise<WoofStatus> => {
      const response = await fetch("/api/woof/status");
      if (!response.ok) throw new Error('Failed to fetch woof status');
      return response.json();
    },
  });

  const handleNoteChange = (dogId: string, note: string) => {
    if (note.length <= 200) {
      setLikeNotes(prev => ({ ...prev, [dogId]: note }));
    }
  };

  const handleLike = async (dogId: string) => {
    setIsSubmittingLike(true);
    try {
      const note = likeNotes[dogId] || "";
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toDogId: dogId,
          note: note.trim(),
          type: "like"
        }),
      });

      if (!response.ok) throw new Error('Failed to send like');
      
      toast({
        title: "Like sent! 💕",
        description: note ? "Your message has been delivered!" : "You liked this profile!",
      });

      // Clear the note after successful like
      setLikeNotes(prev => ({ ...prev, [dogId]: "" }));
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLike(false);
    }
  };

  const handleWoof = async (dogId: string) => {
    if (!woofStatus?.woofRemaining) {
      toast({
        title: "No Woofs left!",
        description: "You'll get another Woof tomorrow at midnight.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingWoof(true);
    try {
      const note = likeNotes[dogId] || "";
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toDogId: dogId,
          note: note.trim(),
          type: "woof"
        }),
      });

      if (!response.ok) throw new Error('Failed to send woof');
      
      toast({
        title: "Woof sent! 🚀",
        description: "You're now at the top of their queue!",
      });

      // Clear the note after successful woof
      setLikeNotes(prev => ({ ...prev, [dogId]: "" }));
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to send Woof. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingWoof(false);
    }
  };

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`;
  };

  const getBadges = (dog: SpotlightCandidate) => {
    const badges = [];
    if (dog.vetVerified) badges.push("Vet Verified");
    if (dog.vaccinationStatus === "Up to date") badges.push("Vaccinated");
    if (dog.medicalProfile?.isSpayedNeutered) badges.push("Spayed/Neutered");
    return badges;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Today's Spotlight</h1>
          <p className="text-gray-600">Loading your top picks...</p>
        </header>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
        <h1 className="text-2xl font-bold text-gray-900">Today's Spotlight</h1>
        <p className="text-gray-600">Top 5 picks based on your filters</p>
        {woofStatus && (
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <Zap className="w-4 h-4 mr-1" />
            <span>{woofStatus.woofRemaining} Woof remaining today</span>
          </div>
        )}
      </header>
      
      <div className="flex-1 overflow-auto">
        {candidates.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">No Spotlight picks</h3>
            <p className="text-gray-600 mb-6">
              Adjust your filters to see personalized recommendations
            </p>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white">
              Update Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {candidates.map((dog) => {
              const badges = getBadges(dog);
              const note = likeNotes[dog.id] || "";
              
              return (
                <div key={dog.id} className="spotlight-card bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                  {/* Photo and Match Badge */}
                  <div className="spotlight-media">
                    <img
                      src={(dog.photos && dog.photos[0]) || "/api/placeholder/112/112"} 
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="match-pill">
                      <span className="font-bold">{dog.compatibilityScore}%</span> match
                    </div>
                  </div>

                  {/* Content */}
                  <div className="spotlight-body">
                    {/* Title Row */}
                    <div className="title-row">
                      <h3 className="text-base font-bold text-gray-900 m-0">
                        {dog.name} • {dog.age} yrs
                      </h3>
                    </div>

                    {/* Sub Row */}
                    <div className="sub-row">
                      <div className="breed text-sm text-gray-600">
                        {dog.breed} • {dog.size}
                      </div>
                      {dog.distance && (
                        <div className="distance text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {formatDistance(dog.distance)}
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    {badges.length > 0 && (
                      <div className="badges flex flex-wrap gap-2 mt-1">
                        {badges.map((badge) => (
                          <span 
                            key={badge}
                            className="badge badge-success inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                          >
                            <Shield className="w-3 h-3" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Traits */}
                    <div className="traits mt-1.5 text-sm text-gray-700 space-y-0.5">
                      <div className="trait">
                        <span className="font-semibold text-gray-900">Activity:</span> {dog.activityLevel}
                      </div>
                      <div className="trait">
                        <span className="font-semibold text-gray-900">Temperament:</span> {dog.temperament ? dog.temperament.join(", ") : "Not specified"}
                      </div>
                    </div>

                    {/* Note Input */}
                    <label className="note block relative mt-2">
                      <textarea
                        value={note}
                        onChange={(e) => handleNoteChange(dog.id, e.target.value)}
                        maxLength={200}
                        placeholder="Add a note (optional)"
                        className="w-full min-h-[44px] max-h-24 p-3 pb-6 border border-gray-200 rounded-xl resize-none outline-none text-sm text-gray-900 transition-all duration-150 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(138,209,255,0.35)]"
                      />
                      <span className="counter absolute right-2.5 bottom-1.5 text-xs text-gray-400">
                        {note.length}/200
                      </span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="spotlight-actions grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(dog.id)}
                      disabled={isSubmittingLike}
                      className="btn like h-11 rounded-xl font-bold text-sm bg-rose-500 text-white flex items-center justify-center gap-2 border border-transparent transition-all duration-100 hover:shadow-[0_8px_20px_rgba(255,107,107,0.35)] active:scale-[0.98] disabled:opacity-50"
                    >
                      <Heart className="w-4 h-4" />
                      Like
                    </button>
                    
                    <button
                      onClick={() => handleWoof(dog.id)}
                      disabled={isSubmittingWoof || !woofStatus?.woofRemaining}
                      className="btn woof h-11 rounded-xl font-bold text-sm bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center gap-2 transition-all duration-100 hover:shadow-[0_8px_20px_rgba(245,192,78,0.35)] active:scale-[0.98] disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Woof
                      {woofStatus && (
                        <span className="pill bg-amber-200 text-amber-900 rounded-full px-2 py-0.5 text-xs font-bold ml-1">
                          {woofStatus.woofRemaining}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}