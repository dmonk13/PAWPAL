import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useSwipeDeck } from "@/hooks/use-swipe-deck";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SwipeableCard from "./swipeable-card";
import SwipeControls from "./swipe-controls";
import ImmersiveMedicalView from "./immersive-medical-view";
import EnhancedMatchModal from "./enhanced-match-modal";

const CURRENT_DOG_ID = "dog-1"; // Buddy's ID from sample data

export default function SwipeArea() {
  const [selectedDog, setSelectedDog] = useState<DogWithMedical | null>(null);
  const [matchedDog, setMatchedDog] = useState<DogWithMedical | null>(null);
  const [currentUserDog, setCurrentUserDog] = useState<DogWithMedical | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { latitude, longitude, error: locationError } = useGeolocation();
  const { toast } = useToast();
  
  // Use fallback Bangalore coordinates if geolocation fails
  const effectiveLatitude = latitude || 12.9716;
  const effectiveLongitude = longitude || 77.5946;

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current user's dog for match modal
  const { data: userDogs } = useQuery<DogWithMedical[]>({
    queryKey: ["/api/users/user-1/dogs"],
    queryFn: async () => {
      const response = await fetch("/api/users/user-1/dogs");
      if (!response.ok) throw new Error('Failed to fetch user dogs');
      return response.json();
    }
  });

  // Set current user dog when data is available
  useEffect(() => {
    if (userDogs && userDogs.length > 0 && !currentUserDog) {
      setCurrentUserDog(userDogs[0]);
    }
  }, [userDogs, currentUserDog]);

  // Get dogs for matching
  const { data: dogs = [], isLoading, error: dogsError, refetch } = useQuery<DogWithMedical[]>({
    queryKey: ["/api/dogs/discover", CURRENT_DOG_ID, effectiveLatitude, effectiveLongitude],
    enabled: true,
    queryFn: async () => {
      const params = new URLSearchParams({
        dogId: CURRENT_DOG_ID,
        latitude: effectiveLatitude.toString(),
        longitude: effectiveLongitude.toString(),
        maxDistance: "25"
      });
      
      const response = await fetch(`/api/dogs/discover?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dogs');
      return response.json();
    },
    retry: (failureCount, error) => {
      // Only retry on network errors, not on 4xx errors
      return failureCount < 3 && !error.message.includes('4');
    }
  });

  // Initialize swipe deck
  const {
    currentDog,
    nextDog,
    isEmpty,
    isLoading: isSwipeLoading,
    state,
    swipe,
    canSwipe,
    reset,
    progress
  } = useSwipeDeck(dogs, {
    currentDogId: CURRENT_DOG_ID,
    onMatch: (dog) => setMatchedDog(dog),
    onSwipeComplete: () => {
      // Optional: Add analytics or additional side effects
    }
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!canSwipe) return;
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'x':
        case 'X':
          event.preventDefault();
          swipe('left', 'keyboard');
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          event.preventDefault();
          swipe('right', 'keyboard');
          break;
        case 'Enter':
          event.preventDefault();
          if (currentDog) {
            setSelectedDog(currentDog);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSwipe, swipe, currentDog]);

  // Connection error state
  if (!isOnline) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-sm mx-auto">
          <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Connection</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You're offline. Check your connection and try again.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Location error state
  if (locationError) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-sm mx-auto">
          <div className="text-4xl mb-6">📍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Location Required</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            PupMatch needs your location to find dogs nearby. We're using Bangalore as a fallback, but you can enable location access for better matches.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="animate-spin text-4xl mb-6">🐕</div>
          <p className="text-gray-600 font-medium">Finding dogs near you...</p>
          {!isOnline && (
            <div className="mt-4 flex items-center justify-center text-amber-600">
              <WifiOff className="w-4 h-4 mr-2" />
              <span className="text-sm">Offline mode</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (dogsError) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-sm mx-auto">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Something went wrong</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We couldn't load profiles right now. Please try again.
          </p>
          <Button 
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-sm mx-auto">
          <div className="text-4xl mb-6">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No More Dogs!</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You've seen all the available dogs in your area. Check back later for new profiles!
          </p>
          <Button 
            onClick={() => {
              reset();
              refetch();
            }}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="relative h-[calc(100vh-8rem)] overflow-hidden bg-gray-50">
        {/* Progress indicator */}
        {progress > 0 && (
          <div className="absolute top-0 left-0 right-0 z-30">
            <div className="bg-gray-200 h-1">
              <div 
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Connection status indicator */}
        {!isOnline && (
          <div className="absolute top-4 left-4 right-4 z-40">
            <div className="bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-amber-800 text-sm font-medium">You're offline</span>
            </div>
          </div>
        )}

        {/* Card Stack Container */}
        <div className="absolute inset-4">
          {/* Next card (behind, slightly scaled) */}
          {nextDog && (
            <SwipeableCard
              dog={nextDog}
              isTop={false}
              onMedicalClick={() => setSelectedDog(nextDog)}
              className="pointer-events-none transform scale-95 opacity-70 z-10"
              disabled={true}
            />
          )}

          {/* Current card */}
          {currentDog && (
            <SwipeableCard
              dog={currentDog}
              isTop={true}
              onSwipe={swipe}
              onMedicalClick={() => setSelectedDog(currentDog)}
              isAnimating={state.isAnimating}
              swipeDirection={state.swipeDirection}
              disabled={!canSwipe || isSwipeLoading}
              className="z-20"
            />
          )}
        </div>

        {/* Swipe Controls */}
        <div className="absolute bottom-8 left-0 right-0 z-30">
          <SwipeControls
            onPass={() => swipe('left', 'button')}
            onLike={() => swipe('right', 'button')}
            onInfo={() => currentDog && setSelectedDog(currentDog)}
            disabled={!canSwipe || isSwipeLoading}
            isLoading={isSwipeLoading}
          />
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-2 left-0 right-0 z-20">
          <div className="text-center text-xs text-gray-500">
            Use ← → arrow keys or X/L to swipe • Enter for details
          </div>
        </div>
      </main>

      {/* Immersive Medical View for Discover */}
      <ImmersiveMedicalView
        dog={selectedDog}
        isOpen={!!selectedDog}
        onClose={() => setSelectedDog(null)}
      />

      {/* Enhanced Match Modal */}
      <EnhancedMatchModal
        dog={matchedDog}
        currentUserDog={currentUserDog || undefined}
        isOpen={!!matchedDog}
        onClose={() => setMatchedDog(null)}
        onSendMessage={() => {
          setMatchedDog(null);
          // TODO: Navigate to messages with match
          toast({
            title: "Match saved!",
            description: "You can find this match in your Messages tab.",
          });
        }}
        onKeepSwiping={() => setMatchedDog(null)}
      />
    </>
  );
}