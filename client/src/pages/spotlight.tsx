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
import MatchedDogProfileModal from "@/components/matched-dog-profile-modal";
import PremiumSpotlightCard from "@/components/premium-spotlight-card";
import { SpotlightCandidate, WoofStatus } from "@shared/schema";
import "../styles/spotlight.css";

const CURRENT_USER_ID = "user-1"; // Sarah's user ID from sample data

export default function Spotlight() {
  const [selectedDog, setSelectedDog] = useState<SpotlightCandidate | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  const handleLike = async (dogId: string, note?: string) => {
    setIsSubmittingLike(true);
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toDogId: dogId,
          note: (note || "").trim(),
          type: "like"
        }),
      });

      if (!response.ok) throw new Error('Failed to send like');
      
      toast({
        title: "Like sent! 💕",
        description: note ? "Your message has been delivered!" : "You liked this profile!",
      });
      
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

  const handleWoof = async (dogId: string, note?: string) => {
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
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toDogId: dogId,
          note: (note || "").trim(),
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

  const handlePhotoClick = (dog: SpotlightCandidate) => {
    setSelectedDog(dog);
    setShowProfileModal(true);
  };

  // Convert SpotlightCandidate to MatchedDog format for modal
  const convertToMatchedDog = (dog: SpotlightCandidate) => {
    return {
      id: dog.id,
      name: dog.name,
      age: dog.age,
      breed: dog.breed,
      size: dog.size,
      photos: dog.photos || ["/api/placeholder/400/400"],
      temperament: dog.temperament || [],
      vaccinations: {
        rabies: { status: 'up-to-date' as const, date: '2024-06-01' },
        dhpp: { status: 'up-to-date' as const, date: '2024-06-01' }
      },
      allergies: dog.medicalProfile?.allergies || [],
      owner: {
        name: "Dog Owner",
        verified: dog.vetVerified || false,
        joinedDate: "2024"
      },
      about: `Meet ${dog.name}, a wonderful ${dog.breed} looking for new friends!`,
      medicalNotes: dog.medicalProfile?.conditions?.join(", ") || "",
      playPreferences: ["Fetch", "Running", "Socializing"],
      recentCheckins: [],
      location: "Nearby",
      distance: dog.distance || 1
    };
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
    <>
      {/* Profile Modal */}
      {showProfileModal && selectedDog && (
        <MatchedDogProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          dog={convertToMatchedDog(selectedDog)}
        />
      )}
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
            {candidates.map((dog) => (
              <PremiumSpotlightCard
                key={dog.id}
                dog={{
                  ...dog,
                  photos: dog.photos || [],
                  temperament: dog.temperament || [],
                  activityLevel: dog.activityLevel || undefined,
                  vetVerified: getBadges(dog).includes("Vet-verified"),
                  vaccinationStatus: getBadges(dog).includes("Vaccinated") ? "Up to date" : "Unknown",
                  isSpayedNeutered: getBadges(dog).includes("Spayed/Neutered"),
                  medicalConditions: dog.medicalProfile?.conditions || [],
                }}
                woofCount={woofStatus?.woofRemaining || 0}
                onLike={(dogId, note) => handleLike(dogId, note)}
                onWoof={(dogId, note) => handleWoof(dogId, note)}
                onPhotoClick={handlePhotoClick}
              />
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
    </>
  );
}