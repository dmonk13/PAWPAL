import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

export function useSwipe(handlers: SwipeHandlers) {
  const touchState = useRef<TouchState | null>(null);
  const minSwipeDistance = 50;
  const maxSwipeTime = 500;
  const minHorizontalRatio = 1.5; // Horizontal movement must be 1.5x more than vertical

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Check if touch started on a scrollable element or interactive element
    const target = e.target as HTMLElement;
    const scrollableElement = target.closest('[data-scrollable="true"]');
    const interactiveElement = target.closest('button, a, input, textarea, select, [role="button"]');
    
    if (scrollableElement || interactiveElement) {
      // Don't handle swipe if touching scrollable content or interactive elements
      touchState.current = null;
      return;
    }
    
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;

    // Check if we're still over a scrollable element
    const target = e.target as HTMLElement;
    const scrollableElement = target.closest('[data-scrollable="true"]');
    
    if (scrollableElement) {
      // Cancel swipe handling if moved over scrollable content
      touchState.current = null;
      return;
    }

    const touch = e.touches[0];
    const { startX, startY } = touchState.current;
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // If this looks like vertical scrolling, cancel swipe detection
    if (absDeltaY > absDeltaX && absDeltaY > 10) {
      touchState.current = null;
      return;
    }
    
    // If significant horizontal movement, prevent default to avoid conflicts
    if (absDeltaX > 20 && absDeltaX / Math.max(absDeltaY, 1) > minHorizontalRatio) {
      e.preventDefault();
    }
  }, [minHorizontalRatio]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;

    // Check if touch ended on a scrollable element
    const target = e.target as HTMLElement;
    const scrollableElement = target.closest('[data-scrollable="true"]');
    
    if (scrollableElement) {
      // Don't handle swipe if touching scrollable content
      touchState.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const { startX, startY, startTime } = touchState.current;
    
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    
    // Check if this was a reasonable time swipe
    if (deltaTime > maxSwipeTime) {
      touchState.current = null;
      return;
    }
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Only trigger horizontal swipes if they are significantly more horizontal than vertical
    if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY * minHorizontalRatio) {
      // Horizontal swipe
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (absDeltaY > absDeltaX * minHorizontalRatio && absDeltaY > minSwipeDistance) {
      // Vertical swipe (only if significantly more vertical than horizontal)
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }
    
    touchState.current = null;
  }, [handlers, minHorizontalRatio, minSwipeDistance, maxSwipeTime]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
