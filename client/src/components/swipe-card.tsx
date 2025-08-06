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
      className={`swipe-card absolute inset-4 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
      style={style}
    >
      <div className="relative h-full">
        {/* Main photo */}
        <img 
          src={dog.photos?.[0] || "/placeholder-dog.jpg"}
          alt={`${dog.name} - ${dog.breed}`}
          className="w-full h-3/5 object-cover"
        />
        
        {/* Distance indicator - Hinge style */}
        {dog.distance && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
            {dog.distance} mi away
          </div>
        )}

        {/* Status badges - Hinge style */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {medicalProfile?.vetClearance && (
            <div className="bg-white/95 backdrop-blur text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              Vet ✓
            </div>
          )}
          
          {isVaccinated && (
            <div className="bg-white/95 backdrop-blur text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              Vaccinated
            </div>
          )}
        </div>

        {/* Profile info - Hinge style */}
        <div className="p-5 bg-white h-2/5 flex flex-col">
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-2xl font-semibold text-gray-900">{dog.name}</h2>
              <span className="text-lg text-gray-600">{dog.age}</span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{dog.breed} • {dog.size} • {dog.gender}</p>
            
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
              {dog.bio || "No bio available"}
            </p>
          </div>
          
          {/* Medical info toggle - Hinge style */}
          <Button
            onClick={onMedicalClick}
            variant="outline"
            className="w-full text-gray-700 border-gray-200 hover:bg-gray-50 py-2.5 text-sm font-medium"
          >
            View Health Profile
          </Button>
        </div>
        
        {/* Temperament section - Hinge style positioned below card */}
        <div className="absolute -bottom-5 left-4 right-4 z-10">
          {dog.temperament && dog.temperament.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
              <div className="flex flex-wrap gap-2">
                {dog.temperament.slice(0, 4).map((trait: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {trait}
                  </span>
                ))}
                {dog.temperament.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{dog.temperament.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
