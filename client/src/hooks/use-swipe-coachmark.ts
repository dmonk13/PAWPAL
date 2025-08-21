import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'discovery.coachmarkSeen';

interface UseSwipeCoachmarkOptions {
  onSwipeAction?: () => void;
}

export function useSwipeCoachmark(options: UseSwipeCoachmarkOptions = {}) {
  const [isCoachmarkVisible, setIsCoachmarkVisible] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);

  // Check if coachmark has been seen before
  useEffect(() => {
    const checkCoachmarkStatus = () => {
      try {
        const hasSeenCoachmark = localStorage.getItem(STORAGE_KEY) === 'true';
        
        // Only show coachmark if user hasn't seen it before
        if (!hasSeenCoachmark) {
          // Small delay to ensure page is loaded
          setTimeout(() => {
            setIsCoachmarkVisible(true);
          }, 500);
        }
      } catch (error) {
        console.warn('Unable to access localStorage for coachmark state:', error);
      }
    };

    checkCoachmarkStatus();
  }, []);

  // Mark coachmark as seen and hide it
  const dismissCoachmark = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsCoachmarkVisible(false);
    } catch (error) {
      console.warn('Unable to save coachmark state to localStorage:', error);
      setIsCoachmarkVisible(false);
    }
  }, []);

  // Handle user conversion (first swipe action)
  const handleConversion = useCallback(() => {
    if (!hasConverted && isCoachmarkVisible) {
      setHasConverted(true);
      dismissCoachmark();
      
      // Call optional callback
      options.onSwipeAction?.();
    }
  }, [hasConverted, isCoachmarkVisible, dismissCoachmark, options]);

  // Method to trigger conversion on swipe actions
  const onSwipeAction = useCallback(() => {
    if (isCoachmarkVisible) {
      handleConversion();
    }
  }, [isCoachmarkVisible, handleConversion]);

  // Reset coachmark (for testing/debugging)
  const resetCoachmark = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setIsCoachmarkVisible(true);
      setHasConverted(false);
    } catch (error) {
      console.warn('Unable to reset coachmark state:', error);
    }
  }, []);

  return {
    isCoachmarkVisible,
    dismissCoachmark,
    onSwipeAction,
    resetCoachmark, // Exposed for debugging
    hasConverted
  };
}