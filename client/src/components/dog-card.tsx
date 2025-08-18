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
      className={`h-full w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col ${className}`}
      role="region"
      aria-labelledby={`dog-${dog.id}-name`}
      aria-describedby={`dog-${dog.id}-details`}
    >
      {/* Hero Photo Section - Clean, no overlays */}
      <div className="relative h-2/5 flex-shrink-0">
        <img 
          src={dog.photos?.[0] || "/placeholder-dog.jpg"}
          alt={`${dog.name}, ${dog.breed} dog`}
          className="w-full h-full object-cover"
        />
        
        {/* Simple Distance Badge - Top Right */}
        {dog.distance && (
          <div className="absolute top-3 right-3 bg-white text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg border border-gray-200">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-rose-500" />
            <span>{Math.round(dog.distance)} mi</span>
          </div>
        )}

        {/* Clean Status Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[60%]">
          {isVaccinated && (
            <Badge 
              className="bg-white text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-green-200"
              role="status"
              aria-label="Vaccinated dog"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Vaccinated
            </Badge>
          )}
          
          {medicalProfile?.vetClearance && (
            <Badge 
              className="bg-white text-rose-700 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-rose-200"
              role="status"  
              aria-label="Veterinary clearance confirmed"
            >
              <Shield className="w-3 h-3 mr-1" />
              Vet Cleared
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge 
              className="bg-white text-amber-700 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-amber-200"
              role="status"
              aria-label="Has known allergies"
            >
              ⚠️ Allergies
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section - Clean white background */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto"
          data-scrollable="true"
        >
          <div className="p-4">
            {/* Name & Age Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h2 
                  id={`dog-${dog.id}-name`}
                  className="text-2xl font-bold text-gray-900 truncate"
                >
                  {dog.name}
                </h2>
              </div>
              <div className="bg-rose-500 text-white px-3 py-1.5 rounded-full shadow-sm ml-3 flex-shrink-0">
                <span className="text-base font-bold">{dog.age}</span>
                <span className="text-sm ml-1">yrs</span>
              </div>
            </div>

            {/* Meta Badges Row - Gender, Size, Breed */}
            <div className="flex items-center flex-wrap gap-1.5 mb-4">
              <Badge 
                className="bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 font-bold text-xs rounded-full"
                data-testid="badge-gender"
                aria-label={`Gender: ${dog.gender}`}
              >
                {dog.gender}
              </Badge>
              <Badge 
                className="bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 font-bold text-xs rounded-full"
                data-testid="badge-size"
                aria-label={`Size: ${dog.size}`}
              >
                {dog.size}
              </Badge>
              <Badge 
                className="bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 font-bold text-xs rounded-full"
                data-testid="badge-breed"
                aria-label={`Breed: ${dog.breed}`}
              >
                {dog.breed}
              </Badge>
            </div>
            
            {/* Bio Section with Truncation */}
            <div 
              className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200"
              id={`dog-${dog.id}-details`}
            >
              <p 
                className={`text-sm text-gray-600 leading-relaxed font-medium ${
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
                  className="mt-2 p-0 h-auto text-rose-500 hover:text-rose-600 font-semibold"
                  aria-expanded={showFullBio}
                  aria-controls={`dog-${dog.id}-details`}
                >
                  {showFullBio ? 'Less' : 'More'}
                </Button>
              )}
            </div>
            
            {/* Compact High-Contrast Personality Pills */}
            {dog.temperament && dog.temperament.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {dog.temperament.slice(0, 3).map((trait: string, index: number) => {
                    const IconComponent = personalityIcons[trait] || Star;
                    return (
                      <Badge 
                        key={index} 
                        className="bg-gray-900 text-white border-0 px-3 py-2 font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] flex items-center touch-manipulation"
                        role="button"
                        tabIndex={0}
                        data-testid={`personality-${trait.toLowerCase()}`}
                        aria-label={`Personality trait: ${trait}`}
                      >
                        <IconComponent className="w-3 h-3 mr-1.5" />
                        {trait}
                      </Badge>
                    );
                  })}
                  {dog.temperament.length > 3 && (
                    <Badge 
                      className="bg-gray-200 text-gray-600 border-0 px-3 py-2 font-medium text-xs rounded-full min-h-[44px] flex items-center"
                      aria-label={`${dog.temperament.length - 3} more personality traits`}
                    >
                      +{dog.temperament.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Section - Inside Scroll Area */}
            <div className="pt-4 border-t border-gray-200">
              {/* Medical Profile - Single Button Only */}
              <Button
                onClick={onMedicalClick}
                className="w-full flex items-center justify-center space-x-3 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-h-[48px] touch-manipulation"
                data-testid="button-medical-profile"
                aria-label={`View medical profile for ${dog.name}`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-base">View Medical Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}