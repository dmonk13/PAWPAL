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
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            <MapPin className="w-3 h-3 inline mr-1" />
            <span>{dog.distance} mi</span>
          </div>
        )}

        {/* Medical badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {isVaccinated && (
            <Badge className="medical-badge text-white text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Vaccinated
            </Badge>
          )}
          
          {medicalProfile?.isSpayedNeutered && (
            <Badge className="medical-badge text-white text-xs">
              Spayed/Neutered
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge className="bg-warm-yellow text-dark-gray text-xs">
              Food Allergies
            </Badge>
          )}
          
          {!hasAllergies && medicalProfile && (
            <Badge className="medical-badge text-white text-xs">
              Allergy-Free
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
              <span>{dog.breed}</span>
              <span>•</span>
              <span>{dog.size}</span>
              <span>•</span>
              <span>{dog.gender}</span>
            </div>
            
            <p className="text-sm medium-gray line-clamp-2">
              {dog.bio || "No bio available"}
            </p>
          </div>
          
          {/* Medical info toggle */}
          <Button
            onClick={onMedicalClick}
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-sky bg-opacity-10 text-sky border-sky mt-3"
          >
            <Plus className="w-4 h-4" />
            <span>Medical Details</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
