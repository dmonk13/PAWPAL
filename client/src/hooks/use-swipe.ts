import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeResult {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}

export function useSwipe(handlers: SwipeHandlers, threshold = 50): SwipeResult {
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startX.current = clientX;
    startY.current = clientY;
    isDragging.current = true;
  }, []);

  const handleEnd = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    
    // Only trigger swipe if movement is greater than threshold
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      // Determine primary direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        }
      }
    }
    
    isDragging.current = false;
  }, [handlers, threshold]);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      e.preventDefault();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    },
    onMouseDown: (e: React.MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (isDragging.current) {
        e.preventDefault();
      }
    },
    onMouseUp: (e: React.MouseEvent) => {
      handleEnd(e.clientX, e.clientY);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      if (isDragging.current) {
        handleEnd(e.clientX, e.clientY);
      }
    }
  };
}