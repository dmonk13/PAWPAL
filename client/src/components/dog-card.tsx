import { Heart, MapPin, Plus, CheckCircle, Users } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DogCardProps {
  dog: DogWithMedical;
  onMedicalClick: () => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  className?: string;
}

export default function DogCard({ dog, onMedicalClick, onSwipe, className = "" }: DogCardProps) {
  const { medicalProfile } = dog;
  
  const isVaccinated = medicalProfile?.vaccinations?.some(v => v.type === "Rabies");
  const hasAllergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0;
  
  return (
    <div className={`absolute inset-4 bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {/* Main photo */}
        <img 
          src={dog.photos?.[0] || "/placeholder-dog.jpg"}
          alt={`${dog.name} - ${dog.breed}`}
          className="w-full h-2/3 object-cover"
        />
        
        {/* Distance indicator */}
        {dog.distance && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border border-gray-200">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />
            <span>{Math.round(dog.distance)} mi</span>
          </div>
        )}

        {/* Cohesive Status badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[60%]">
          {isVaccinated && (
            <Badge className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-green-200">
              <Heart className="w-3 h-3 mr-1 text-green-600" />
              Vaccinated
            </Badge>
          )}
          
          {medicalProfile?.vetClearance && (
            <Badge className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-blue-200">
              <CheckCircle className="w-3 h-3 mr-1 text-blue-600" />
              Vet Cleared
            </Badge>
          )}
          
          {dog.matingPreference && (
            <Badge className="bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-purple-200">
              <Users className="w-3 h-3 mr-1 text-purple-600" />
              Breeding
            </Badge>
          )}
          
          {medicalProfile?.isSpayedNeutered && (
            <Badge className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-indigo-200">
              <Plus className="w-3 h-3 mr-1 text-indigo-600" />
              Fixed
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge className="bg-white/90 backdrop-blur-sm text-orange-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-orange-200">
              ⚠️ Allergies
            </Badge>
          )}
        </div>

        {/* Enhanced Profile info */}
        <div className="p-6 bg-white min-h-[40%] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold text-gray-900">{dog.name}</h2>
              <div className="text-right">
                <span className="text-xl font-semibold text-gray-700">{dog.age}</span>
                <span className="text-sm text-gray-500 ml-1">years old</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600 mb-3">
              <span className="font-medium">{dog.breed}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{dog.size}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{dog.gender}</span>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{dog.bio}</p>
            
            {/* Enhanced Temperament tags */}
            {dog.temperament && dog.temperament.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {dog.temperament.slice(0, 3).map((trait: string, index: number) => (
                  <Badge 
                    key={index} 
                    className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 border-0 px-2.5 py-1 font-medium"
                  >
                    {trait}
                  </Badge>
                ))}
                {dog.temperament.length > 3 && (
                  <Badge className="text-xs bg-gray-100 text-gray-600 border-0 px-2.5 py-1">
                    +{dog.temperament.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Enhanced Medical info toggle */}
          <Button
            onClick={onMedicalClick}
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 mt-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">View Medical Info</span>
          </Button>
        </div>
        
        {/* Integrated Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-center items-center space-x-4">
            {/* Pass (Reject) Button */}
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-12 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-medium transition-all duration-200"
              onClick={() => onSwipe?.('left')}
            >
              <X className="w-5 h-5 mr-2" />
              Pass
            </Button>
            
            {/* Info Button */}
            <Button
              size="lg"
              variant="outline"
              className="w-12 h-12 bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-200"
              onClick={onMedicalClick}
            >
              <Info className="w-5 h-5" />
            </Button>
            
            {/* Like Button */}
            <Button
              size="lg"
              className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-medium shadow-md transition-all duration-200"
              onClick={() => onSwipe?.('right')}
            >
              <Heart className="w-5 h-5 mr-2 fill-current" />
              Like
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
