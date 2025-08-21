import { Heart, MapPin, Shield, CheckCircle, AlertTriangle, Users, Baby, Plus } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SwipeCardProps {
  dog: DogWithMedical;
  onMedicalClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TagInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  priority: number;
  category: 'health' | 'behavior' | 'logistics' | 'compatibility';
}

export default function SwipeCard({ dog, onMedicalClick, className = "", style }: SwipeCardProps) {
  const { medicalProfile } = dog;
  const [expandedTags, setExpandedTags] = useState(false);
  
  const isVaccinated = medicalProfile?.vaccinations?.some(v => v.type === "Rabies");
  const hasAllergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0;
  const isSpayedNeutered = medicalProfile?.isSpayedNeutered;

  // Generate priority-based tags with Hinge-inspired styling
  const generateTags = (): TagInfo[] => {
    const tags: TagInfo[] = [];

    // Priority 1: Critical Health Information
    if (isVaccinated) {
      tags.push({
        id: 'vaccinated',
        label: 'Vaccinated',
        icon: <Shield className="w-3 h-3" />,
        priority: 1,
        category: 'health'
      });
    }

    if (medicalProfile?.vetClearance) {
      tags.push({
        id: 'vet-cleared',
        label: 'Vet Cleared',
        icon: <CheckCircle className="w-3 h-3" />,
        priority: 1,
        category: 'health'
      });
    }

    if (hasAllergies) {
      tags.push({
        id: 'allergies',
        label: 'Allergies',
        icon: <AlertTriangle className="w-3 h-3" />,
        priority: 1,
        category: 'health'
      });
    }

    // Priority 2: Spay/Neuter status
    if (isSpayedNeutered) {
      tags.push({
        id: 'spayed-neutered',
        label: 'Spayed/Neutered',
        icon: <Shield className="w-3 h-3" />,
        priority: 2,
        category: 'health'
      });
    }

    // Priority 3: Temperament (first few traits)
    if (dog.temperament && dog.temperament.length > 0) {
      dog.temperament.slice(0, 2).forEach((trait, index) => {
        tags.push({
          id: `temperament-${trait.toLowerCase()}`,
          label: trait,
          icon: <Heart className="w-3 h-3" />,
          priority: 3,
          category: 'behavior'
        });
      });
    }

    // Priority 4: Compatibility tags
    if (dog.size === 'Small') {
      tags.push({
        id: 'good-with-kids',
        label: 'Good with Kids',
        icon: <Baby className="w-3 h-3" />,
        priority: 4,
        category: 'compatibility'
      });
    }

    // Priority 5: Breeding preference
    if (dog.matingPreference) {
      tags.push({
        id: 'breeding',
        label: 'Available for Breeding',
        icon: <Users className="w-3 h-3" />,
        priority: 5,
        category: 'logistics'
      });
    }

    return tags.sort((a, b) => a.priority - b.priority);
  };

  const tags = generateTags();
  const visibleTags = expandedTags ? tags : tags.slice(0, 4);
  const hiddenTagsCount = tags.length - 4;
  
  return (
    <div 
      className={`swipe-card absolute inset-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
      style={style}
    >
      <div className="relative h-full flex flex-col">
        {/* Clean photo section - no overlays */}
        <div className="relative h-3/5 flex-shrink-0">
          <img 
            src={dog.photos?.[0] || "/placeholder-dog.jpg"}
            alt={`${dog.name} - ${dog.breed}`}
            className="w-full h-full object-cover"
          />
          
          {/* Simple distance indicator */}
          {dog.distance && (
            <div 
              className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-2 rounded-full text-sm font-semibold shadow-lg"
              data-testid="distance-tag"
            >
              <MapPin className="w-4 h-4 inline mr-1 text-rose-500" />
              {Math.round(dog.distance)} mi
            </div>
          )}

          {/* Clean status badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[60%]">
            {visibleTags.slice(0, 2).map((tag) => (
              <div
                key={tag.id}
                className="bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border flex items-center gap-1.5"
                data-testid={`tag-${tag.id}`}
              >
                {tag.icon}
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clean bottom section with white background */}
        <div className="flex-1 bg-white p-6 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">{dog.name}</h2>
              <div className="bg-rose-500 text-white px-4 py-2 rounded-full shadow-md">
                <span className="text-lg font-bold">{dog.age}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Badge className="bg-stone-100 text-stone-700 border-stone-200 px-3 py-1.5 font-medium text-sm rounded-full">
                {dog.breed}
              </Badge>
              <Badge className="bg-rose-100 text-rose-700 border-rose-200 px-3 py-1.5 font-medium text-sm rounded-full">
                {dog.size}
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1.5 font-medium text-sm rounded-full">
                {dog.gender}
              </Badge>
            </div>
            
            {dog.bio && (
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-medium">{dog.bio}</p>
            )}

            {/* Temperament traits */}
            {dog.temperament && dog.temperament.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {dog.temperament.slice(0, 3).map((trait: string, index: number) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                      data-testid={`temperament-${trait.toLowerCase()}`}
                    >
                      <Heart className="w-3 h-3 mr-1 fill-current" />
                      {trait}
                    </span>
                  ))}
                  {dog.temperament.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                      +{dog.temperament.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Medical info button */}
          <Button
            onClick={onMedicalClick}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            data-testid="view-health-profile"
          >
            <Shield className="w-5 h-5" />
            <span>View Health Profile</span>
          </Button>

          {/* Swipe instruction text */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              <span className="inline-flex items-center mx-1">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                Swipe left to pass
              </span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="inline-flex items-center mx-1">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Swipe right to like
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}