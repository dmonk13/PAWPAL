import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X, Sparkles, Star } from 'lucide-react';
import { DogWithMedical } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnhancedMatchModalProps {
  dog: DogWithMedical | null;
  currentUserDog?: DogWithMedical;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export default function EnhancedMatchModal({
  dog,
  currentUserDog,
  isOpen,
  onClose,
  onSendMessage,
  onKeepSwiping
}: EnhancedMatchModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!dog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2 text-white transition-colors"
                aria-label="Close match modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Celebration Header */}
              <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 px-6 py-8 text-center">
                {/* Animated Background Elements */}
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </motion.div>

                {/* Match Icon */}
                <motion.div
                  className="mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-rose-500 fill-current" />
                  </div>
                </motion.div>

                {/* Match Text */}
                <motion.h1
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  It's a Match!
                </motion.h1>
                
                <motion.p
                  className="text-white/90 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  You and {dog.name} liked each other
                </motion.p>
              </div>

              {/* Dog Profiles */}
              <div className="p-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  {/* Current User's Dog */}
                  {currentUserDog && (
                    <motion.div
                      className="flex-1 text-center"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 ring-4 ring-rose-200">
                        <img
                          src={currentUserDog.photos?.[0] || "/placeholder-dog.jpg"}
                          alt={currentUserDog.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{currentUserDog.name}</h3>
                      <p className="text-xs text-gray-600">{currentUserDog.age} years • {currentUserDog.breed}</p>
                    </motion.div>
                  )}

                  {/* Heart Connector */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white fill-current" />
                    </div>
                  </motion.div>

                  {/* Matched Dog */}
                  <motion.div
                    className="flex-1 text-center"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 ring-4 ring-rose-200">
                      <img
                        src={dog.photos?.[0] || "/placeholder-dog.jpg"}
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">{dog.name}</h3>
                    <p className="text-xs text-gray-600">{dog.age} years • {dog.breed}</p>
                  </motion.div>
                </div>

                {/* Quick Match Stats */}
                {!showDetails && (
                  <motion.div
                    className="bg-gray-50 rounded-2xl p-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      {dog.distance && (
                        <div className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {Math.round(dog.distance)} mi away
                        </div>
                      )}
                      
                      {dog.temperament && dog.temperament.length > 0 && (
                        <div className="flex items-center text-gray-600">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {dog.temperament.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Detailed Info (Expandable) */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {dog.bio && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">About {dog.name}</h4>
                          <p className="text-sm text-gray-600">{dog.bio}</p>
                        </div>
                      )}
                      
                      {dog.temperament && dog.temperament.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Personality</h4>
                          <div className="flex flex-wrap gap-1">
                            {dog.temperament.map((trait) => (
                              <Badge key={trait} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  {/* Primary CTA - Send Message */}
                  <Button
                    onClick={onSendMessage}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send a Message
                  </Button>

                  {/* Secondary Actions */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      {showDetails ? 'Less Info' : 'More Info'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={onKeepSwiping}
                      className="flex-1 text-gray-600 hover:bg-gray-50 rounded-xl"
                    >
                      Keep Swiping
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}