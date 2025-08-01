import { Heart, MapPin, Plus } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SwipeCardProps {
  dog: DogWithMedical;
  onMedicalClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function SwipeCard({ dog, onMedicalClick, className = "", style }: SwipeCardProps) {
  const { medicalProfile } = dog;
  
  const isVaccinated = medicalProfile?.vaccinations?.some(v => v.type === "Rabies");
  const hasAllergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0;
  
  return (
    <div 
      className={`swipe-card absolute inset-4 bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}
      style={style}
    >
      <div className="relative h-full">
        {/* Main photo */}
        <img 
          src={dog.photos?.[0] || "/placeholder-dog.jpg"}
          alt={`${dog.name} - ${dog.breed}`}
          className="w-full h-2/3 object-cover"
        />
        
        {/* Distance indicator */}
        {dog.distance && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            <MapPin className="w-3 h-3 inline mr-1" />
            <span>{dog.distance} mi</span>
          </div>
        )}

        {/* Medical badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-48">
          {medicalProfile?.vetClearance && (
            <Badge className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1">
              <Heart className="w-3 h-3 mr-1" />
              Vet Approved
            </Badge>
          )}
          
          {isVaccinated && (
            <Badge className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1">
              Vaccinated
            </Badge>
          )}
          
          {dog.matingPreference && (
            <Badge className="bg-pink-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1">
              Looking to Mate
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1">
              Has Allergies
            </Badge>
          )}
        </div>

        {/* Profile info */}
        <div className="p-6 bg-white h-1/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold dark-gray">{dog.name}</h2>
              <span className="text-lg medium-gray">{dog.age} years</span>
            </div>
            
            <div className="flex items-center space-x-4 medium-gray mb-3">
              <span className="font-medium">{dog.breed}</span>
              <span>•</span>
              <span>{dog.size}</span>
              <span>•</span>
              <span>{dog.gender}</span>
            </div>
            
            <p className="text-sm medium-gray line-clamp-2 leading-relaxed mb-4">
              {dog.bio || "No bio available"}
            </p>
          </div>
          
          {/* Medical info toggle */}
          <Button
            onClick={onMedicalClick}
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>View Medical Profile</span>
          </Button>
        </div>
        
        {/* Temperament section - positioned below the card */}
        <div className="absolute -bottom-6 left-4 right-4 z-10">
          {dog.temperament && dog.temperament.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {dog.temperament.slice(0, 4).map((trait: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors">
                    {trait}
                  </Badge>
                ))}
                {dog.temperament.length > 4 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                    +{dog.temperament.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
