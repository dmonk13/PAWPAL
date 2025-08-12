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
    <div className={`absolute inset-4 bg-card-light rounded-2xl shadow-xl overflow-hidden ${className}`}>
      <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {/* Main photo */}
        <img 
          src={dog.photos?.[0] || "/placeholder-dog.jpg"}
          alt={`${dog.name} - ${dog.breed}`}
          className="w-full h-2/3 object-cover"
        />
        
        {/* Distance indicator */}
        {dog.distance && (
          <div className="absolute top-4 right-4 bg-card-light/95 backdrop-blur-sm text-secondary-gray px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border border-divider">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />
            <span>{Math.round(dog.distance)} mi</span>
          </div>
        )}

        {/* Status badges with new color scheme */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[60%]">
          {isVaccinated && (
            <Badge className="bg-card-light/95 backdrop-blur-sm text-success text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-success/20">
              <Heart className="w-3 h-3 mr-1 text-success" />
              Vaccinated
            </Badge>
          )}
          
          {medicalProfile?.vetClearance && (
            <Badge className="bg-card-light/95 backdrop-blur-sm text-primary-rose text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-primary-rose/20">
              <CheckCircle className="w-3 h-3 mr-1 text-primary-rose" />
              Vet Cleared
            </Badge>
          )}
          
          {dog.matingPreference && (
            <Badge className="bg-card-light/95 backdrop-blur-sm text-purple-accent text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-purple-accent/20">
              <Users className="w-3 h-3 mr-1 text-purple-accent" />
              Breeding
            </Badge>
          )}
          
          {medicalProfile?.isSpayedNeutered && (
            <Badge className="bg-card-light/95 backdrop-blur-sm text-coral text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-coral/20">
              <Plus className="w-3 h-3 mr-1 text-coral" />
              Fixed
            </Badge>
          )}
          
          {hasAllergies && (
            <Badge className="bg-card-light/95 backdrop-blur-sm text-error text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-error/20">
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
                      className="text-xs bg-profile-card text-primary-dark border-primary-rose/20 px-3 py-1.5 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
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
            className="flex items-center justify-center space-x-2 bg-coral hover:bg-coral/90 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Info className="w-5 h-5" />
            <span>View Medical Profile</span>
          </Button>
        </div>
        
        {/* Integrated Action Buttons */}
        <div className="p-4 bg-divider border-t border-border">
          <div className="flex justify-center items-center space-x-4">
            {/* Pass (Reject) Button */}
            <Button
              size="lg"
              className="flex-1 h-14 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => onSwipe?.('left')}
            >
              <X className="w-6 h-6 mr-2" />
              Pass
            </Button>
            
            {/* Info Button */}
            <Button
              size="lg"
              className="w-14 h-14 bg-coral hover:bg-coral/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={onMedicalClick}
            >
              <Info className="w-5 h-5" />
            </Button>
            
            {/* Like Button */}
            <Button
              size="lg"
              className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
