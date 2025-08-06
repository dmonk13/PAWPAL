import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Heart, Info } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useSwipe } from "@/hooks/use-swipe";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DogCard from "./dog-card";
import MedicalModal from "./medical-modal";
import MatchModal from "./match-modal";

const CURRENT_DOG_ID = "c7803a8b-9d6b-453a-b602-ec2a1d97e418"; // Buddy's ID from database

export default function SwipeArea() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDog, setSelectedDog] = useState<DogWithMedical | null>(null);
  const [matchedDog, setMatchedDog] = useState<DogWithMedical | null>(null);
  const [swipingDirection, setSwipingDirection] = useState<string | null>(null);
  
  const { latitude, longitude, error: locationError } = useGeolocation();
  const { toast } = useToast();

  // Get dogs for matching
  const { data: dogs = [], isLoading } = useQuery<DogWithMedical[]>({
    queryKey: ["/api/dogs/discover", CURRENT_DOG_ID, latitude, longitude],
    enabled: !!latitude && !!longitude,
    queryFn: async () => {
      const params = new URLSearchParams({
        dogId: CURRENT_DOG_ID,
        latitude: latitude!.toString(),
        longitude: longitude!.toString(),
        maxDistance: "25"
      });
      
      const response = await fetch(`/api/dogs/discover?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dogs');
      return response.json();
    },
  });

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ dogId, isLike }: { dogId: string; isLike: boolean }) => {
      const response = await apiRequest("POST", "/api/swipes", {
        swiperDogId: CURRENT_DOG_ID,
        swipedDogId: dogId,
        isLike,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.match && variables.isLike) {
        const swipedDog = dogs.find((dog: DogWithMedical) => dog.id === variables.dogId);
        if (swipedDog) {
          setMatchedDog(swipedDog);
        }
      }
      // Invalidate the discover query to get fresh dogs
      queryClient.invalidateQueries({ queryKey: ["/api/dogs/discover"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record swipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= dogs.length) return;
    
    const currentDog = dogs[currentIndex];
    const isLike = direction === "right";
    
    setSwipingDirection(direction);
    
    setTimeout(() => {
      swipeMutation.mutate({ dogId: currentDog.id, isLike });
      setCurrentIndex(prev => prev + 1);
      setSwipingDirection(null);
    }, 300);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => handleSwipe("left"),
    onSwipeRight: () => handleSwipe("right"),
  });

  if (locationError) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-sm mx-auto">
          <div className="text-4xl mb-6">📍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Location Required</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            PupMatch needs your location to find dogs nearby. Please enable location access in your browser settings.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium shadow-lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="animate-spin text-4xl mb-6">🐕</div>
          <p className="text-gray-600 font-medium">Finding dogs near you...</p>
        </div>
      </div>
    );
  }



  const currentDog = dogs[currentIndex];
  const nextDog = dogs[currentIndex + 1];

  if (!currentDog) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-sm mx-auto">
          <div className="text-6xl mb-6">🐾</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">That's all for now!</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">Check back later for more potential matches in your area</p>
          <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium shadow-lg">
            Expand Search Radius
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main 
        className="relative h-[calc(100vh-8rem)] overflow-hidden"
        {...swipeHandlers}
      >
        {/* Next card (behind) */}
        {nextDog && (
          <DogCard
            dog={nextDog}
            onMedicalClick={() => setSelectedDog(nextDog)}
            className="z-8"
          />
        )}

        {/* Current card */}
        <DogCard
          dog={currentDog}
          onMedicalClick={() => setSelectedDog(currentDog)}
          onSwipe={handleSwipe}
          className={`z-10 swipe-card ${
            swipingDirection === "left" ? "swiping-left" : 
            swipingDirection === "right" ? "swiping-right" : ""
          }`}
        />


      </main>

      {/* Medical Modal */}
      {selectedDog && (
        <MedicalModal
          dog={selectedDog}
          onClose={() => setSelectedDog(null)}
        />
      )}

      {/* Match Modal */}
      {matchedDog && (
        <MatchModal
          dog={matchedDog}
          onClose={() => setMatchedDog(null)}
          onSendMessage={() => {
            setMatchedDog(null);
            // TODO: Navigate to messages
          }}
        />
      )}
    </>
  );
}
