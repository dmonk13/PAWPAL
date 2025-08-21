import React, { useState, useEffect } from "react";
import { Heart, Zap, MapPin, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumSpotlightCardProps {
  dog: {
    id: string;
    name: string;
    age: number;
    breed: string;
    size: string;
    distance?: number;
    photos?: string[];
    temperament?: string[];
    activityLevel?: string;
    compatibilityScore?: number;
    vetVerified?: boolean;
    vaccinationStatus?: string;
    isSpayedNeutered?: boolean;
    medicalConditions?: string[];
  };
  woofCount: number;
  onLike: (dogId: string, note?: string) => void;
  onWoof: (dogId: string, note?: string) => void;
  onPhotoClick?: (dog: any) => void;
}

const suggestedNotes = [
  "Beach day?",
  "Fetch buddy?", 
  "Calm playdate",
  "Park adventure?",
  "Training session?",
  "Hiking partner?"
];

const shimmerVariants = {
  initial: { backgroundPosition: "-200px 0" },
  animate: { 
    backgroundPosition: "calc(200px + 100%) 0",
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: 10
    }
  }
};

export default function PremiumSpotlightCard({ 
  dog, 
  woofCount, 
  onLike, 
  onWoof, 
  onPhotoClick 
}: PremiumSpotlightCardProps) {
  const [note, setNote] = useState("");
  const [showFullTraits, setShowFullTraits] = useState(false);
  const [showFullConditions, setShowFullConditions] = useState(false);
  const [isShimmering, setIsShimmering] = useState(true);
  const { toast } = useToast();

  // Auto-shimmer effect for match pill
  useEffect(() => {
    const interval = setInterval(() => {
      setIsShimmering(true);
      setTimeout(() => setIsShimmering(false), 2000);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = () => {
    onLike(dog.id, note.trim());
    // Heart pop animation + haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleWoof = () => {
    if (woofCount <= 0) {
      toast({
        title: "No woofs remaining",
        description: "You've used all your woofs for today. Come back tomorrow!",
        variant: "destructive"
      });
      return;
    }

    onWoof(dog.id, note.trim());
    
    // Pulse animation + sparkle effect + haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  const addSuggestedNote = (suggestion: string) => {
    const newNote = note ? `${note} ${suggestion}` : suggestion;
    if (newNote.length <= 200) {
      setNote(newNote);
    }
  };

  const getTrustBadges = () => {
    const badges = [];
    
    if (dog.vaccinationStatus === "Up to date") {
      badges.push({ text: "Vaccinated", color: "bg-green-50 text-green-700 border-green-200" });
    }
    
    if (dog.isSpayedNeutered) {
      badges.push({ text: "Spayed/Neutered", color: "bg-blue-50 text-blue-700 border-blue-200" });
    }
    
    if (dog.vetVerified) {
      badges.push({ text: "Vet-verified", color: "bg-purple-50 text-purple-700 border-purple-200" });
    }

    return badges;
  };

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${Math.round(distance * 10) / 10} mi` : `${Math.round(distance)} mi`;
  };

  const trustBadges = getTrustBadges();
  const displayTraits = dog.temperament || [];
  const visibleTraits = showFullTraits ? displayTraits : displayTraits.slice(0, 3);

  return (
    <motion.div 
      className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Row */}
      <div className="flex items-start gap-4 mb-3">
        {/* Photo */}
        <div 
          className="relative cursor-pointer group"
          onClick={() => onPhotoClick?.(dog)}
        >
          <img
            src={dog.photos?.[0] || "/api/placeholder/88/88"}
            alt={`${dog.name} profile`}
            className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>

        {/* Identity Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            {/* Name and Age */}
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {dog.name} • {dog.age} yrs
            </h3>

            {/* Match Pill */}
            <motion.div
              className="relative bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 overflow-hidden"
              variants={shimmerVariants}
              initial="initial"
              animate={isShimmering ? "animate" : "initial"}
              style={{
                backgroundImage: isShimmering 
                  ? "linear-gradient(90deg, rgba(244,114,182,1) 0%, rgba(251,146,60,1) 25%, rgba(244,114,182,1) 50%, rgba(251,146,60,1) 75%, rgba(244,114,182,1) 100%)"
                  : undefined,
                backgroundSize: "200px 100%"
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{dog.compatibilityScore || 79}% match</span>
            </motion.div>
          </div>

          {/* Breed and Size */}
          <p className="text-sm text-gray-600 mb-1">
            {dog.breed} • {dog.size}
          </p>

          {/* Distance */}
          {dog.distance && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {formatDistance(dog.distance)} away
            </div>
          )}
        </div>
      </div>

      {/* Trust Pills Row */}
      {trustBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {trustBadges.map((badge, index) => (
            <Badge
              key={index}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.color}`}
            >
              {badge.text}
            </Badge>
          ))}
        </div>
      )}

      {/* Traits Section */}
      {displayTraits.length > 0 && (
        <div className="mb-4">
          {/* Activity Level */}
          {dog.activityLevel && (
            <div className="mb-2">
              <span className="text-sm font-bold text-gray-900">Activity:</span>
              <span className="text-sm text-gray-600 ml-2">{dog.activityLevel}</span>
            </div>
          )}

          {/* Temperament */}
          <div className="mb-2">
            <span className="text-sm font-bold text-gray-900">Temperament:</span>
            <span className="text-sm text-gray-600 ml-2">
              {visibleTraits.join(', ')}
              {displayTraits.length > 3 && !showFullTraits && ', ...'}
            </span>
            {displayTraits.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullTraits(!showFullTraits)}
                className="p-0 h-auto ml-1 text-sm text-rose-600 hover:text-rose-700"
              >
                {showFullTraits ? (
                  <>
                    Less <ChevronUp className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Medical Conditions Section */}
      {dog.medicalConditions && dog.medicalConditions.length > 0 && (
        <div className="mb-4">
          <div className="mb-2">
            <span className="text-sm font-bold text-gray-900">Medical Conditions:</span>
            <span className="text-sm text-gray-600 ml-2">
              {showFullConditions || dog.medicalConditions.length <= 3 
                ? dog.medicalConditions.join(', ')
                : `${dog.medicalConditions.slice(0, 3).join(', ')}, ...`
              }
            </span>
            {dog.medicalConditions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullConditions(!showFullConditions)}
                className="p-0 h-auto ml-1 text-sm text-rose-600 hover:text-rose-700"
              >
                {showFullConditions ? (
                  <>
                    Less <ChevronUp className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {suggestedNotes.slice(0, 3).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => addSuggestedNote(suggestion)}
              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors duration-150"
              disabled={note.length + suggestion.length > 200}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Note Input */}
      <div className="mb-4">
        <Textarea
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          className="min-h-[44px] max-h-[72px] resize-none text-sm bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
          style={{
            backdropFilter: 'blur(4px)',
          }}
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {note.length}/200
          </span>
        </div>
      </div>

      {/* Action Dock */}
      <div className="flex gap-2">
        {/* Like Button */}
        <Button
          onClick={handleLike}
          className="flex-1 h-12 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px]"
          data-testid={`like-button-${dog.id}`}
        >
          <Heart className="w-5 h-5" />
          <span>Like</span>
        </Button>

        {/* Woof Button */}
        <Button
          onClick={handleWoof}
          disabled={woofCount <= 0}
          className="flex-1 h-12 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-yellow-400 text-yellow-800 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed relative"
          data-testid={`woof-button-${dog.id}`}
        >
          <Zap className="w-5 h-5" />
          <span>Woof</span>
          
          {/* Woof Count Badge */}
          {woofCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              {woofCount}
            </div>
          )}
        </Button>
      </div>

      {/* Woof Pulse Animation */}
      <AnimatePresence>
        {/* Add pulse effect trigger here if needed */}
      </AnimatePresence>
    </motion.div>
  );
}