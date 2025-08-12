import { Heart, MapPin, Plus, CheckCircle, Users, X, Info } from "lucide-react";
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

        {/* Enhanced Profile info with gradient background */}
        <div className="p-6 bg-gradient-to-b from-white to-gray-50 min-h-[40%] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{dog.name}</h2>
              <div className="text-right bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-2 rounded-full shadow-md">
                <span className="text-lg font-bold">{dog.age}</span>
                <span className="text-sm ml-1">yrs</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-3 py-1 font-semibold text-sm">
                {dog.breed}
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-3 py-1 font-semibold text-sm">
                {dog.size}
              </Badge>
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-3 py-1 font-semibold text-sm">
                {dog.gender}
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed font-medium">{dog.bio}</p>
            </div>
            
            {/* Enhanced Temperament tags */}
            {dog.temperament && dog.temperament.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {dog.temperament.slice(0, 3).map((trait: string, index: number) => (
                    <Badge 
                      key={index} 
                      className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200 px-3 py-1.5 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {trait}
                    </Badge>
                  ))}
                  {dog.temperament.length > 3 && (
                    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200 px-3 py-1.5 font-medium">
                      +{dog.temperament.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Medical info toggle */}
          <Button
            onClick={onMedicalClick}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Info className="w-5 h-5" />
            <span>View Medical Profile</span>
          </Button>
        </div>
        
        {/* Integrated Action Buttons */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-4">
            {/* Pass (Reject) Button */}
            <Button
              size="lg"
              className="flex-1 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => onSwipe?.('left')}
            >
              <X className="w-6 h-6 mr-2" />
              Pass
            </Button>
            
            {/* Info Button */}
            <Button
              size="lg"
              className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={onMedicalClick}
            >
              <Info className="w-5 h-5" />
            </Button>
            
            {/* Like Button */}
            <Button
              size="lg"
              className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => onSwipe?.('right')}
            >
              <Heart className="w-6 h-6 mr-2 fill-current" />
              Like
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
