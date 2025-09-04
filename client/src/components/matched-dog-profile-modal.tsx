import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  X, Heart, Share, Bookmark, Calendar, MapPin, Shield, 
  Award, Camera, User, Clock, Star, CheckCircle, AlertTriangle,
  ChevronLeft, ChevronRight, MessageCircle, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MatchedDog {
  id: string;
  name: string;
  age: number;
  breed: string;
  size: string;
  photos: string[];
  temperament: string[];
  vaccinations: {
    rabies: { status: 'up-to-date' | 'due-soon' | 'overdue'; date: string };
    dhpp: { status: 'up-to-date' | 'due-soon' | 'overdue'; date: string };
  };
  allergies: string[];
  owner: {
    name: string;
    verified: boolean;
    joinedDate: string;
  };
  about: string;
  medicalNotes: string;
  playPreferences: string[];
  recentCheckins: { park: string; date: string }[];
  location: string;
  distance: number;
}

interface MatchedDogProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: MatchedDog;
  currentChatId?: string;
}

export default function MatchedDogProfileModal({ 
  isOpen, 
  onClose, 
  dog,
  currentChatId 
}: MatchedDogProfileModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSwipeDown = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      const deltaY = moveTouch.clientY - startY;
      
      if (deltaY > 100) {
        onClose();
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', handleTouchMove);
    }, { once: true });
  };

  const handleStartChat = () => {
    // Track analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'action_tap', {
        action_type: 'start_chat',
        dog_id: dog.id
      });
    }
    
    onClose();
    // If already in a chat, stay in messages, otherwise navigate
    if (!currentChatId) {
      setLocation('/messages');
    }
    toast({
      title: "Chat opened",
      description: `Started conversation with ${dog.name}'s owner`
    });
  };

  const handleShareProfile = () => {
    // Track analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'action_tap', {
        action_type: 'share_profile',
        dog_id: dog.id
      });
    }
    
    navigator.share?.({
      title: `${dog.name}'s Profile`,
      text: `Check out ${dog.name}, a ${dog.age}-year-old ${dog.breed}!`,
      url: window.location.href
    }) || toast({
      title: "Share link copied",
      description: "Profile link copied to clipboard"
    });
  };

  const handleToggleFavorite = () => {
    // Track analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'action_tap', {
        action_type: 'toggle_favorite',
        dog_id: dog.id,
        favorited: !isFavorited
      });
    }
    
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? 
        `${dog.name} removed from your favorites` :
        `${dog.name} added to your favorites`
    });
  };

  const handleSchedulePlaydate = () => {
    // Track analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'action_tap', {
        action_type: 'schedule_playdate',
        dog_id: dog.id
      });
    }
    
    toast({
      title: "Playdate scheduling",
      description: "Feature coming soon! For now, use chat to coordinate."
    });
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < dog.photos.length - 1 ? prev + 1 : 0
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : dog.photos.length - 1
    );
  };

  const getVaccinationStatus = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Up to date</Badge>;
      case 'due-soon':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Due soon</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Track modal open analytics
  React.useEffect(() => {
    if (isOpen && typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'avatar_tap_profile_open', {
        dog_id: dog.id,
        source: currentChatId ? 'chat' : 'discover'
      });
    }
  }, [isOpen, dog.id, currentChatId]);

  // Track modal close analytics
  const handleClose = () => {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'profile_close', {
        dog_id: dog.id
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-lg max-h-[95vh] overflow-hidden p-0 gap-0"
        onTouchStart={handleSwipeDown}
      >
        <ScrollArea className="max-h-[95vh]">
          {/* Header with swipable photos */}
          <div className="relative">
            <div className="relative h-80 bg-gray-100">
              <img
                src={dog.photos[currentPhotoIndex]}
                alt={`${dog.name} photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {dog.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevPhoto}
                    data-testid="button-prev-photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextPhoto}
                    data-testid="button-next-photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Photo indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {dog.photos.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 min-h-[44px] min-w-[44px]"
              onClick={handleClose}
              data-testid="button-close-profile"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic info and owner */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1" data-testid="text-dog-name">
                    {dog.name}
                  </h1>
                  <p className="text-gray-600 mb-2" data-testid="text-dog-details">
                    {dog.age} {dog.age === 1 ? 'year' : 'years'} old • {dog.breed} • {dog.size}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{dog.location} • {dog.distance} mi away</span>
                  </div>
                </div>
              </div>

              {/* Owner info */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{dog.owner.name}</span>
                {dog.owner.verified && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <span className="text-xs text-gray-500">• Joined {dog.owner.joinedDate}</span>
              </div>
            </div>

            {/* Temperament tags */}
            {dog.temperament.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Temperament</h3>
                <div className="flex flex-wrap gap-2">
                  {dog.temperament.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Vaccination status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Health & Vaccination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Rabies</span>
                  {getVaccinationStatus(dog.vaccinations.rabies.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">DHPP</span>
                  {getVaccinationStatus(dog.vaccinations.dhpp.status)}
                </div>
                
                {dog.allergies.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {dog.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-red-200 text-red-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            <Separator />

            {/* Secondary sections */}
            <div className="space-y-4">
              {/* About */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About {dog.name}</h3>
                <p className="text-sm text-gray-600">{dog.about}</p>
              </div>

              {/* Medical notes */}
              {dog.medicalNotes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Medical Notes</h3>
                  <p className="text-sm text-gray-600">{dog.medicalNotes}</p>
                </div>
              )}

              {/* Play preferences */}
              {dog.playPreferences.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Play Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {dog.playPreferences.map((preference, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {preference}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent check-ins */}
              {dog.recentCheckins.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recent Park Check-ins</h3>
                  <div className="space-y-2">
                    {dog.recentCheckins.slice(0, 3).map((checkin, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{checkin.park}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{checkin.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}