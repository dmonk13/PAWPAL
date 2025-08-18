import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DogWithMedical } from '@shared/schema';

interface SwipeDeckState {
  currentIndex: number;
  swipeDirection: 'left' | 'right' | null;
  isAnimating: boolean;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  dragVelocity: { x: number; y: number };
}

interface SwipeDeckOptions {
  currentDogId: string;
  onMatch?: (matchedDog: DogWithMedical) => void;
  onSwipeComplete?: () => void;
}

export function useSwipeDeck(dogs: DogWithMedical[], options: SwipeDeckOptions) {
  const { currentDogId, onMatch, onSwipeComplete } = options;
  const { toast } = useToast();
  
  const [state, setState] = useState<SwipeDeckState>({
    currentIndex: 0,
    swipeDirection: null,
    isAnimating: false,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    dragVelocity: { x: 0, y: 0 }
  });
  
  const lastDragTime = useRef<number>(0);
  const lastDragPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  // Swipe mutation with optimistic updates
  const swipeMutation = useMutation({
    mutationFn: async ({ dogId, isLike, source = 'discovery' }: { 
      dogId: string; 
      isLike: boolean;
      source?: string;
    }) => {
      const response = await apiRequest('POST', '/api/swipes', {
        swiperDogId: currentDogId,
        swipedDogId: dogId,
        isLike,
        source
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Check for match
      if (data.match && variables.isLike) {
        const swipedDog = dogs.find(dog => dog.id === variables.dogId);
        if (swipedDog && onMatch) {
          onMatch(swipedDog);
        }
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/dogs/discover'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dogs/', currentDogId, '/matches'] });
      
      onSwipeComplete?.();
    },
    onError: (error) => {
      console.error('Swipe error:', error);
      toast({
        title: 'Error',
        description: 'Failed to record swipe. Please try again.',
        variant: 'destructive'
      });
      
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        currentIndex: Math.max(0, prev.currentIndex - 1),
        isAnimating: false,
        swipeDirection: null
      }));
    }
  });

  const getCurrentDog = useCallback(() => {
    return dogs[state.currentIndex] || null;
  }, [dogs, state.currentIndex]);

  const getNextDog = useCallback(() => {
    return dogs[state.currentIndex + 1] || null;
  }, [dogs, state.currentIndex]);

  const swipe = useCallback(async (direction: 'left' | 'right', source = 'button') => {
    const currentDog = getCurrentDog();
    if (!currentDog || state.isAnimating || swipeMutation.isPending) return;

    const isLike = direction === 'right';
    
    // Optimistic update - start animation
    setState(prev => ({
      ...prev,
      swipeDirection: direction,
      isAnimating: true,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    }));

    // Delay mutation to allow animation
    setTimeout(() => {
      // Optimistic update - move to next card
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));
      
      // Perform swipe mutation
      swipeMutation.mutate({ 
        dogId: currentDog.id, 
        isLike,
        source 
      });
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          swipeDirection: null,
          isAnimating: false
        }));
      }, 350);
    }, 300);
    
  }, [getCurrentDog, state.isAnimating, swipeMutation, currentDogId]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (state.isAnimating || !getCurrentDog()) return;
    
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragOffset: { x: 0, y: 0 }
    }));
    
    lastDragTime.current = Date.now();
    lastDragPosition.current = { x: clientX, y: clientY };
  }, [state.isAnimating, getCurrentDog]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!state.isDragging) return;

    const deltaX = clientX - lastDragPosition.current.x;
    const deltaY = clientY - lastDragPosition.current.y;
    const deltaTime = Date.now() - lastDragTime.current;
    
    // Calculate velocity
    const velocity = {
      x: deltaTime > 0 ? deltaX / deltaTime : 0,
      y: deltaTime > 0 ? deltaY / deltaTime : 0
    };

    setState(prev => ({
      ...prev,
      dragOffset: {
        x: prev.dragOffset.x + deltaX,
        y: prev.dragOffset.y + deltaY
      },
      dragVelocity: velocity
    }));

    lastDragTime.current = Date.now();
    lastDragPosition.current = { x: clientX, y: clientY };
  }, [state.isDragging]);

  const endDrag = useCallback(() => {
    if (!state.isDragging) return;

    const { dragOffset, dragVelocity } = state;
    const threshold = 100; // pixels
    const velocityThreshold = 0.5; // pixels per ms
    
    // Determine swipe direction based on drag distance and velocity
    const shouldSwipeRight = dragOffset.x > threshold || 
      (dragOffset.x > 50 && dragVelocity.x > velocityThreshold);
    const shouldSwipeLeft = dragOffset.x < -threshold || 
      (dragOffset.x < -50 && dragVelocity.x < -velocityThreshold);

    if (shouldSwipeRight) {
      swipe('right', 'drag');
    } else if (shouldSwipeLeft) {
      swipe('left', 'drag');
    } else {
      // Snap back
      setState(prev => ({
        ...prev,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        dragVelocity: { x: 0, y: 0 }
      }));
    }
  }, [state, swipe]);

  const skipToNext = useCallback(() => {
    if (state.isAnimating || !getCurrentDog()) return;
    
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1
    }));
  }, [state.isAnimating, getCurrentDog]);

  const reset = useCallback(() => {
    setState({
      currentIndex: 0,
      swipeDirection: null,
      isAnimating: false,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      dragVelocity: { x: 0, y: 0 }
    });
  }, []);

  return {
    // State
    currentDog: getCurrentDog(),
    nextDog: getNextDog(),
    isEmpty: state.currentIndex >= dogs.length,
    isLoading: swipeMutation.isPending,
    state,
    
    // Actions
    swipe,
    startDrag,
    updateDrag,
    endDrag,
    skipToNext,
    reset,
    
    // Computed values
    canSwipe: !state.isAnimating && !swipeMutation.isPending && !!getCurrentDog(),
    progress: dogs.length > 0 ? (state.currentIndex / dogs.length) * 100 : 0
  };
}