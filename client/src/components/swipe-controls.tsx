import { motion } from 'framer-motion';
import { X, Heart, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.95 },
    disabled: { scale: 0.9, opacity: 0.5 }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.9, rotate: -5 }
  };

  return (
    <div className={`flex items-center justify-center space-x-6 px-8 ${className}`}>
      {/* Undo Button (optional) */}
      {onUndo && (
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileTap="tap"
          animate={disabled ? "disabled" : "initial"}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onUndo}
            disabled={disabled || isLoading}
            aria-label="Undo last swipe"
          >
            <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
              <RotateCcw className="w-4 h-4" />
            </motion.div>
          </Button>
        </motion.div>
      )}

      {/* Pass Button */}
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileTap="tap"
        animate={disabled ? "disabled" : "initial"}
      >
        <Button
          variant="destructive"
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl border-4 border-red-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          onClick={onPass}
          disabled={disabled || isLoading}
          aria-label="Pass on this profile (Left Arrow)"
        >
          <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
            <X className="w-6 h-6 text-white" strokeWidth={3} />
          </motion.div>
        </Button>
      </motion.div>

      {/* Super Like Button (optional) */}
      {onSuperLike && (
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileTap="tap"
          animate={disabled ? "disabled" : "initial"}
        >
          <Button
            variant="default"
            size="sm"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg border-4 border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSuperLike}
            disabled={disabled || isLoading}
            aria-label="Super like this profile"
          >
            <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </motion.div>
          </Button>
        </motion.div>
      )}

      {/* Like Button */}
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileTap="tap"
        animate={disabled ? "disabled" : "initial"}
      >
        <Button
          variant="default"
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl border-4 border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          onClick={onLike}
          disabled={disabled || isLoading}
          aria-label="Like this profile (Right Arrow)"
        >
          <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
            <Heart className="w-6 h-6 text-white" fill="currentColor" strokeWidth={2} />
          </motion.div>
        </Button>
      </motion.div>


    </div>
  );
}