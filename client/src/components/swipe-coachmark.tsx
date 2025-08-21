import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight, ArrowLeft, X as CloseIcon } from 'lucide-react';

interface SwipeCoachmarkProps {
  isVisible: boolean;
  onDismiss: () => void;
  onConverted: () => void;
  className?: string;
}

export default function SwipeCoachmark({ 
  isVisible, 
  onDismiss, 
  onConverted,
  className = '' 
}: SwipeCoachmarkProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      
      // Analytics: coachmark_shown
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('coachmark_shown', {
          component: 'discovery_swipe',
          location: 'card_bottom'
        });
      }

      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle keyboard dismissal (Esc key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isShowing) {
        handleDismiss();
      }
    };

    if (isShowing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isShowing]);

  const handleDismiss = () => {
    // Analytics: coachmark_dismissed
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('coachmark_dismissed', {
        component: 'discovery_swipe',
        method: 'timeout_or_manual'
      });
    }

    setIsShowing(false);
    setTimeout(() => onDismiss(), 300); // Wait for animation to complete
  };

  const handleGotItClick = () => {
    // Analytics: coachmark_dismissed
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('coachmark_dismissed', {
        component: 'discovery_swipe',
        method: 'got_it_button'
      });
    }

    handleDismiss();
  };

  // Track conversion when user performs first action
  const trackConversion = () => {
    onConverted();
    
    // Analytics: coachmark_converted
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('coachmark_converted', {
        component: 'discovery_swipe',
        action: 'first_swipe_after_show'
      });
    }
  };

  const coachmarkVariants = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: 'easeOut',
        delay: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  if (!isVisible && !isShowing) return null;

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          className={`absolute bottom-4 left-4 right-4 z-40 flex justify-center ${className}`}
          variants={coachmarkVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="tooltip"
          aria-live="polite"
          aria-label="Swipe instructions: Swipe right to like, swipe left to pass"
        >
          <div className="bg-white/92 dark:bg-gray-800/92 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-lg max-w-sm mx-auto">
            {/* Content */}
            <div className="px-4 py-3 relative">
              {/* Close button */}
              <button
                onClick={handleGotItClick}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                aria-label="Dismiss coaching message"
              >
                <CloseIcon className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Main message */}
              <div className="text-center space-y-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Swipe right to like. Swipe left to pass.
                </p>
                
                {/* Action indicators */}
                <div className="flex items-center justify-center space-x-6">
                  {/* Pass action */}
                  <div className="flex items-center space-x-1.5 text-red-600 dark:text-red-400">
                    <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                    <ArrowLeft className="w-3 h-3" strokeWidth={2} />
                    <span className="text-xs font-medium">Pass</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

                  {/* Like action */}
                  <div className="flex items-center space-x-1.5 text-green-600 dark:text-green-400">
                    <span className="text-xs font-medium">Like</span>
                    <ArrowRight className="w-3 h-3" strokeWidth={2} />
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3" fill="currentColor" strokeWidth={1} />
                    </div>
                  </div>
                </div>

                {/* Got it button */}
                <button
                  onClick={handleGotItClick}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors focus:outline-none focus:underline"
                >
                  Got it
                </button>
              </div>
            </div>

            {/* Pointer/tail */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-white/92 dark:bg-gray-800/92 border-r border-b border-gray-200/50 dark:border-gray-600/50 transform rotate-45"></div>
            </div>
          </div>

          {/* Screen reader only text */}
          <div className="sr-only">
            Coaching tip: You can swipe right on cards to like them, or swipe left to pass. This message will not appear again.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}