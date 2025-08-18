import React, { useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Heart, RotateCcw, Info } from 'lucide-react';
import { DogWithMedical } from '@shared/schema';
import DogCard from './dog-card';

interface SwipeableCardProps {
  dog: DogWithMedical;
  isTop?: boolean;
  onSwipe?: (direction: 'left' | 'right') => void;
  onMedicalClick?: () => void;
  isAnimating?: boolean;
  swipeDirection?: 'left' | 'right' | null;
  className?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;

export default function SwipeableCard({
  dog,
  isTop = false,
  onSwipe,
  onMedicalClick,
  isAnimating = false,
  swipeDirection = null,
  className = '',
  disabled = false
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);
  
  // Badge opacity based on drag distance
  const passOpacity = useTransform(x, [-200, -50, 0], [1, 0.7, 0]);
  const likeOpacity = useTransform(x, [0, 50, 200], [0, 0.7, 1]);
  
  // Scale effect for better visual feedback
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      
      // Determine swipe direction based on drag distance and velocity
      const shouldSwipeLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -500;
      const shouldSwipeRight = offset.x > SWIPE_THRESHOLD || velocity.x > 500;
      
      if (shouldSwipeLeft && onSwipe) {
        onSwipe('left');
      } else if (shouldSwipeRight && onSwipe) {
        onSwipe('right');
      }
    },
    [onSwipe]
  );

  // Handle programmatic animations (button clicks)
  useEffect(() => {
    if (isAnimating && swipeDirection) {
      const targetX = swipeDirection === 'left' ? -300 : 300;
      
      // Animate out
      x.set(targetX);
      
      // Reset position after animation
      setTimeout(() => {
        x.set(0);
        y.set(0);
      }, 350);
    }
  }, [isAnimating, swipeDirection, x, y]);

  // Variants for different states
  const cardVariants = {
    initial: { scale: 0.95, opacity: 0.8 },
    active: { scale: 1, opacity: 1 },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -300 : 300,
      rotate: direction === 'left' ? -25 : 25,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: 'easeOut' }
    })
  };

  // Auto-animate exit when swipeDirection changes
  const animationVariant = isAnimating && swipeDirection ? 'exit' : isTop ? 'active' : 'initial';

  return (
    <motion.div
      ref={cardRef}
      className={`absolute inset-0 cursor-grab active:cursor-grabbing ${className}`}
      style={{ 
        x: isAnimating ? undefined : x, 
        y: isAnimating ? undefined : y,
        rotate: isAnimating ? undefined : rotate,
        opacity: isAnimating ? undefined : opacity,
        scale: isAnimating ? undefined : scale,
        zIndex: isTop ? 20 : 10
      }}
      variants={cardVariants}
      custom={swipeDirection}
      animate={animationVariant}
      initial="initial"
      drag={isTop && !disabled && !isAnimating}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, zIndex: 30 }}
      onDragEnd={handleDragEnd}
      dragSnapToOrigin={!isAnimating}
    >
      {/* Card Content */}
      <DogCard
        dog={dog}
        onMedicalClick={onMedicalClick || (() => {})}
        className="h-full"
      />
      
      {/* Drag Feedback Badges - Only show when actively dragging and on top */}
      {isTop && !disabled && (
        <>
          {/* Pass Badge */}
          <motion.div
            className="absolute top-20 left-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg border-4 border-red-400"
            style={{ opacity: passOpacity }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <X className="w-6 h-6 inline mr-2" />
            PASS
          </motion.div>

          {/* Like Badge */}
          <motion.div
            className="absolute top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg border-4 border-green-400"
            style={{ opacity: likeOpacity }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Heart className="w-6 h-6 inline mr-2" />
            LIKE
          </motion.div>
        </>
      )}
      
      {/* Accessibility Helper - Hidden but available for screen readers */}
      <div className="sr-only">
        <button
          onClick={() => onSwipe?.('left')}
          aria-label={`Pass on ${dog.name}`}
          disabled={disabled || isAnimating}
        />
        <button
          onClick={() => onSwipe?.('right')}
          aria-label={`Like ${dog.name}`}
          disabled={disabled || isAnimating}
        />
      </div>
    </motion.div>
  );
}