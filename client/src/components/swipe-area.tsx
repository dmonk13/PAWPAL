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

const CURRENT_DOG_ID = "dog-1"; // In a real app, this would come from auth context

export default function SwipeArea() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDog, setSelectedDog] = useState<DogWithMedical | null>(null);
  const [matchedDog, setMatchedDog] = useState<DogWithMedical | null>(null);
  const [swipingDirection, setSwipingDirection] = useState<string | null>(null);
  
  const { latitude, longitude, error: locationError } = useGeolocation();
  const { toast } = useToast();

  // Get dogs for matching
  const { data: dogs = [], isLoading } = useQuery({
    queryKey: ["/api/dogs/discover", CURRENT_DOG_ID, latitude, longitude],
    enabled: !!latitude && !!longitude,
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
        const swipedDog = dogs.find(dog => dog.id === variables.dogId);
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
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-xl font-bold mb-2 dark-gray">Location Required</h3>
          <p className="medium-gray mb-4">
            PupMatch needs your location to find dogs nearby. Please enable location access in your browser settings.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐕</div>
          <p className="medium-gray">Finding dogs near you...</p>
        </div>
      </div>
    );
  }

  const currentDog = dogs[currentIndex];
  const nextDog = dogs[currentIndex + 1];

  if (!currentDog) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="gradient-bg rounded-2xl mx-4 p-8 text-white text-center">
          <div className="text-6xl mb-4 opacity-50">🐾</div>
          <h3 className="text-2xl font-bold mb-2">That's all for now!</h3>
          <p className="opacity-75 mb-4">Check back later for more potential matches</p>
          <Button className="bg-white text-teal">
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
          className={`z-10 swipe-card ${
            swipingDirection === "left" ? "swiping-left" : 
            swipingDirection === "right" ? "swiping-right" : ""
          }`}
        />

        {/* Swipe buttons - Hinge style */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center space-x-6 px-8">
          <Button
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 shadow-lg"
            onClick={() => handleSwipe("left")}
            disabled={swipeMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-600" />
          </Button>
          
          <Button
            size="lg"
            className="w-16 h-16 bg-primary hover:bg-primary/90 rounded-full text-white shadow-lg"
            onClick={() => setSelectedDog(currentDog)}
          >
            <Info className="w-5 h-5" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-primary bg-white hover:bg-primary/5 shadow-lg"
            onClick={() => handleSwipe("right")}
            disabled={swipeMutation.isPending}
          >
            <Heart className="w-5 h-5 text-primary" />
          </Button>
        </div>
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
