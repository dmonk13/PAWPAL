import { useState } from "react";
import { 
  Heart, MapPin, Plus, CheckCircle, Users, X, Info, Share2, Bookmark, Flag,
  Activity, Shield, Eye, MoreHorizontal, Timer, Zap, Star, Dog, User
} from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface DogCardProps {
  dog: DogWithMedical;
  onMedicalClick: () => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  className?: string;
}

export default function DogCard({ dog, onMedicalClick, onSwipe, className = "" }: DogCardProps) {
  const [showFullBio, setShowFullBio] = useState(false);
  const { medicalProfile } = dog;
  
  const isVaccinated = medicalProfile?.vaccinations?.some(v => v.type === "Rabies");
  const hasAllergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0;

  // Personality trait icons mapping
  const personalityIcons: Record<string, any> = {
    'Athletic': Activity,
    'Independent': Shield,
    'Alert': Eye,
    'Energetic': Zap,
    'Calm': Timer,
    'Friendly': Heart,
    'Playful': Star
  };

  // Gender icons mapping
  const genderIcons: Record<string, any> = {
    'Male': User,
    'Female': User
  };

  // Size icons mapping  
  const sizeIcons: Record<string, any> = {
    'Small': Dog,
    'Medium': Dog,
    'Large': Dog,
    'Extra Large': Dog
  };
  
  return (
    <div 
      className={`absolute inset-4 bg-[hsl(var(--surface-white))] rounded-2xl shadow-xl overflow-hidden ${className}`}
      role="region"
      aria-labelledby={`dog-${dog.id}-name`}
      aria-describedby={`dog-${dog.id}-details`}
    >
      {/* Hero Photo Section - Fixed Height */}
      <div className="relative h-3/5 flex-shrink-0">
        <img 
          src={dog.photos?.[0] || "/placeholder-dog.jpg"}
          alt={`${dog.name}, ${dog.breed} dog`}
          className="w-full h-full object-cover"
        />
        
        {/* Distance Badge - Top Right */}
        {dog.distance && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[hsl(var(--text-secondary))] px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg border border-[hsl(var(--borders-light))]">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
            <span>{Math.round(dog.distance)} mi</span>
          </div>
        )}

        {/* Status Badges - Top Left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[60%]">
          {isVaccinated && (
            <Badge 
              variant="status"
              className="text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30"
              data-tone="success"
              role="status"
              aria-label="Vaccinated dog"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Vaccinated
            </Badge>
          )}
          
          {medicalProfile?.vetClearance && (
            <Badge 
              variant="status"
              className="text-[hsl(var(--primary-rose))] border-[hsl(var(--primary-rose))]/30"
              data-tone="primary"
              role="status"  
              aria-label="Veterinary clearance confirmed"
            >
              <Shield className="w-3 h-3 mr-1" />
              Vet Cleared
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge 
              variant="status"
              className="text-[hsl(var(--warning-amber))] border-[hsl(var(--warning-amber))]/30"
              data-tone="warning"
              role="status"
              aria-label="Has known allergies"
            >
              ⚠️ Allergies
            </Badge>
          )}
        </div>
      </div>

      {/* Single-Column Content Section */}
      <div className="flex-1 flex flex-col bg-[hsl(var(--surface-white))] overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <div className="p-4 space-y-4">
            {/* Name & Age Section */}
            <div className="space-y-2">
              <h2 
                id={`dog-${dog.id}-name`}
                className="text-2xl font-bold text-[hsl(var(--text-primary))] leading-tight"
              >
                {dog.name}
              </h2>
              <div className="bg-[hsl(var(--primary-rose))] text-white px-3 py-1.5 rounded-full shadow-sm inline-flex items-center">
                <span className="text-base font-bold">{dog.age}</span>
                <span className="text-sm ml-1">yrs</span>
              </div>
            </div>

            {/* Premium Meta Badges - Single Column with proper spacing */}
            <div className="space-y-2">
              {/* Gender Badge */}
              <div className="flex">
                <Badge 
                  variant="premium"
                  size="lg"
                  className="flex-1"
                  data-testid="badge-gender"
                  aria-label={`Gender: ${dog.gender}`}
                >
                  <User className="w-4 h-4 mr-2" />
                  {dog.gender}
                </Badge>
              </div>
              
              {/* Size Badge */}
              <div className="flex">
                <Badge 
                  variant="premium"
                  size="lg"
                  className="flex-1"
                  data-testid="badge-size"
                  aria-label={`Size: ${dog.size}`}
                >
                  <Dog className="w-4 h-4 mr-2" />
                  {dog.size}
                </Badge>
              </div>
              
              {/* Breed Badge */}
              <div className="flex">
                <Badge 
                  variant="premium"
                  size="lg"
                  className="flex-1"
                  data-testid="badge-breed"
                  aria-label={`Breed: ${dog.breed}`}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {dog.breed}
                </Badge>
              </div>
            </div>
            
            {/* Bio Section with Truncation */}
            <div 
              className="bg-[hsl(var(--surface-gray))] rounded-xl p-3 mb-4 border border-[hsl(var(--borders-light))]"
              id={`dog-${dog.id}-details`}
            >
              <p 
                className={`text-sm text-[hsl(var(--text-secondary))] leading-relaxed font-medium ${
                  !showFullBio ? 'line-clamp-2' : ''
                }`}
              >
                {dog.bio}
              </p>
              {dog.bio && dog.bio.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="mt-2 p-0 h-auto text-[hsl(var(--primary-rose))] hover:text-[hsl(var(--primary-rose))]/80 font-semibold"
                  aria-expanded={showFullBio}
                  aria-controls={`dog-${dog.id}-details`}
                >
                  {showFullBio ? 'Less' : 'More'}
                </Button>
              )}
            </div>
            
            {/* Premium Personality Section - Single Column */}
            {dog.temperament && dog.temperament.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide">Personality</h4>
                <div className="space-y-2">
                  {dog.temperament.slice(0, 3).map((trait: string, index: number) => {
                    const IconComponent = personalityIcons[trait] || Star;
                    return (
                      <div key={index} className="flex">
                        <Badge 
                          variant="personality"
                          size="lg"
                          className="flex-1"
                          role="button"
                          tabIndex={0}
                          data-testid={`personality-${trait.toLowerCase()}`}
                          aria-label={`Personality trait: ${trait}`}
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {trait}
                        </Badge>
                      </div>
                    );
                  })}
                  {dog.temperament.length > 3 && (
                    <div className="flex">
                      <Badge 
                        className="bg-[hsl(var(--borders-light))] text-[hsl(var(--text-secondary))] border-0 px-4 py-3 font-bold text-sm rounded-full min-h-[48px] flex items-center flex-1 uppercase tracking-wide"
                        aria-label={`${dog.temperament.length - 3} more personality traits`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {dog.temperament.length - 3} More
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Bar - Outside Scroll Area */}
        <div className="flex-shrink-0 p-4 bg-[hsl(var(--surface-white))] border-t border-[hsl(var(--borders-light))] pb-safe">
          <div className="space-y-3">
            {/* Medical Profile - Prominent Action */}
            <Button
              onClick={onMedicalClick}
              className="w-full flex items-center justify-center space-x-3 bg-[hsl(var(--primary-rose))] hover:bg-[hsl(var(--primary-rose))]/90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-h-[48px] touch-manipulation"
              data-tone="primary"
              aria-label={`View medical profile for ${dog.name}`}
            >
              <Info className="w-5 h-5" />
              <span className="text-base">View Medical Profile</span>
            </Button>

            {/* Action Row: Like, Pass, Overflow Menu */}
            <div className="flex items-center space-x-3">
              {/* Pass Button */}
              <Button
                size="lg"
                className="flex-1 h-12 bg-[hsl(var(--surface-gray))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--borders-light))] font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] touch-manipulation"
                onClick={() => onSwipe?.('left')}
                data-tone="default"
                aria-label={`Pass on ${dog.name}`}
              >
                <X className="w-5 h-5 mr-2" />
                Pass
              </Button>
              
              {/* Like Button */}
              <Button
                size="lg"
                className="flex-1 h-12 bg-[hsl(var(--success-green))] hover:bg-[hsl(var(--success-green))]/90 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 min-h-[44px] touch-manipulation"
                onClick={() => onSwipe?.('right')}
                data-tone="success"
                aria-label={`Like ${dog.name}`}
              >
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Like
              </Button>

              {/* Overflow Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-12 h-12 p-0 rounded-xl border-2 border-[hsl(var(--borders-light))] hover:bg-[hsl(var(--surface-gray))] shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] min-w-[44px] touch-manipulation"
                    aria-label={`More options for ${dog.name}`}
                  >
                    <MoreHorizontal className="w-5 h-5 text-[hsl(var(--text-secondary))]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-white border-[hsl(var(--borders-light))] shadow-xl rounded-xl"
                >
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 px-4 py-3 text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-gray))] rounded-lg cursor-pointer"
                    aria-label={`Share ${dog.name}'s profile`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 px-4 py-3 text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-gray))] rounded-lg cursor-pointer"
                    aria-label={`Save ${dog.name} for later`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 px-4 py-3 text-[hsl(var(--danger-red))] hover:bg-red-50 rounded-lg cursor-pointer"
                    aria-label={`Report ${dog.name}'s profile`}
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}