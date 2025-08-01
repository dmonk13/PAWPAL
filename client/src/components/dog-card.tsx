import { Heart, MapPin, Plus, CheckCircle, Users } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DogCardProps {
  dog: DogWithMedical;
  onMedicalClick: () => void;
  className?: string;
}

export default function DogCard({ dog, onMedicalClick, className = "" }: DogCardProps) {
  const { medicalProfile } = dog;
  
  const isVaccinated = medicalProfile?.vaccinations?.some(v => v.type === "Rabies");
  const hasAllergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0;
  
  return (
    <div className={`absolute inset-4 bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
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

        {/* Status badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {isVaccinated && (
            <Badge className="medical-badge text-white text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Vaccinated
            </Badge>
          )}
          
          {medicalProfile?.vetClearance && (
            <Badge className="bg-green-500 text-white text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Vet Approved
            </Badge>
          )}
          
          {dog.matingPreference && (
            <Badge className="bg-purple-500 text-white text-xs">
              <Users className="w-3 h-3 mr-1" />
              Mating
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge className="bg-warm-yellow text-dark-gray text-xs">
              Allergies
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
            
            <p className="text-sm medium-gray line-clamp-2 mb-3">{dog.bio}</p>
            
            {/* Temperament tags */}
            {dog.temperament && dog.temperament.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {dog.temperament.slice(0, 3).map((trait: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs bg-coral bg-opacity-10 text-coral border-coral">
                    {trait}
                  </Badge>
                ))}
                {dog.temperament.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{dog.temperament.length - 3}
                  </Badge>
                )}
              </div>
            )}
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
