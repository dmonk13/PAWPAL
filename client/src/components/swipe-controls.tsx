import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, RotateCcw, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SwipeControlsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function SwipeControls({
  onPass,
  onLike,
  onSuperLike,
  onUndo,
  disabled = false,
  isLoading = false,
  className = ''
}: SwipeControlsProps) {
  const [actionFeedback, setActionFeedback] = useState<'pass' | 'like' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Handle haptic feedback for mobile devices
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Success feedback animation
  const showFeedback = (action: 'pass' | 'like') => {
    setActionFeedback(action);
    triggerHaptic();
    setTimeout(() => setActionFeedback(null), 800);
  };

  const handlePass = () => {
    if (disabled || isLoading) return;
    showFeedback('pass');
    onPass();
  };

  const handleLike = () => {
    if (disabled || isLoading) return;
    showFeedback('like');
    onLike();
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const containerVariants = {
    hidden: { 
      y: 100, 
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.3 }
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.3, ease: 'easeOut' }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.15 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
    disabled: { scale: 0.95, opacity: 0.6 },
    success: { 
      scale: [1, 1.1, 1], 
      transition: { duration: 0.4, ease: 'easeInOut' }
    }
  };

  const pulseVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 0], 
      opacity: [0, 0.6, 0],
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 1rem)'
      }}
    >
      {/* Backdrop with blur and opacity */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-t border-gray-200/50 dark:border-gray-700/50 rounded-t-2xl shadow-2xl" />
      
      {/* Soft top shadow for anchoring */}
      <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-b from-black/10 to-transparent rounded-t-2xl" />
      
      {/* Control bar content */}
      <div className="relative h-20 md:h-22 flex items-center justify-center px-6 md:px-8">
        
        {/* Secondary actions (left side) */}
        <div className="flex items-center space-x-3">
          {onUndo && (
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover={!disabled ? "hover" : undefined}
              whileTap={!disabled ? "tap" : undefined}
              animate={disabled ? "disabled" : "initial"}
              onClick={onUndo}
              disabled={disabled || isLoading}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Undo last swipe"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <RotateCcw className="w-5 h-5 mx-auto" />
            </motion.button>
          )}
          
          {onSuperLike && (
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover={!disabled ? "hover" : undefined}
              whileTap={!disabled ? "tap" : undefined}
              animate={disabled ? "disabled" : "initial"}
              onClick={onSuperLike}
              disabled={disabled || isLoading}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Super like this profile"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <Zap className="w-5 h-5 mx-auto" fill="currentColor" />
            </motion.button>
          )}
        </div>

        {/* Primary actions (center) */}
        <div className="flex-1 flex items-center justify-center space-x-4 md:space-x-6 max-w-sm mx-4">
          
          {/* Pass Button */}
          <div className="relative flex-1">
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover={!disabled ? "hover" : undefined}
              whileTap={!disabled ? "tap" : undefined}
              animate={
                disabled ? "disabled" : 
                actionFeedback === 'pass' ? "success" : 
                "initial"
              }
              onClick={handlePass}
              disabled={disabled || isLoading}
              className="w-full h-14 md:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-label="Pass on this profile"
              style={{ minHeight: '56px' }}
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
              <span className="hidden sm:inline text-sm md:text-base">Pass</span>
            </motion.button>
            
            {/* Success pulse animation */}
            <AnimatePresence>
              {actionFeedback === 'pass' && (
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  exit="initial"
                  className="absolute inset-0 rounded-2xl bg-red-500"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Like Button */}
          <div className="relative flex-1">
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover={!disabled ? "hover" : undefined}
              whileTap={!disabled ? "tap" : undefined}
              animate={
                disabled ? "disabled" : 
                actionFeedback === 'like' ? "success" : 
                "initial"
              }
              onClick={handleLike}
              disabled={disabled || isLoading}
              className="w-full h-14 md:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-label="Like this profile"
              style={{ minHeight: '56px' }}
            >
              <Heart className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
              <span className="hidden sm:inline text-sm md:text-base">Like</span>
            </motion.button>
            
            {/* Success pulse animation */}
            <AnimatePresence>
              {actionFeedback === 'like' && (
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  exit="initial"
                  className="absolute inset-0 rounded-2xl bg-green-500"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Balance space for secondary actions */}
        <div className="w-12 md:w-20" />
      </div>
    </motion.div>
  );
}