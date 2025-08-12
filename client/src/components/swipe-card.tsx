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
      <div className="relative h-full">
        {/* Main photo with Hinge-style overlay */}
        <div className="relative h-full">
          <img 
            src={dog.photos?.[0] || "/placeholder-dog.jpg"}
            alt={`${dog.name} - ${dog.breed}`}
            className="w-full h-full object-cover"
          />
          
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Distance indicator - Hinge style */}
          {dog.distance && (
            <div 
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-800 px-3 py-2 rounded-full text-sm font-semibold shadow-lg border border-gray-200/50"
              data-testid="distance-tag"
            >
              <MapPin className="w-4 h-4 inline mr-1 text-rose-500" />
              {Math.round(dog.distance)} mi
            </div>
          )}

          {/* Priority-based tag system with Hinge colors */}
          <div className="absolute top-4 left-4 right-20 max-w-[70%]">
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/50 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl hover:bg-white flex items-center gap-1.5"
                  data-testid={`tag-${tag.id}`}
                  onClick={() => tag.category === 'health' ? onMedicalClick() : undefined}
                >
                  {tag.icon}
                  <span>{tag.label}</span>
                </div>
              ))}
              
              {/* "More info" expansion option */}
              {hiddenTagsCount > 0 && !expandedTags && (
                <div
                  className="bg-white/80 backdrop-blur-md text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/50 cursor-pointer hover:bg-white transition-colors"
                  onClick={() => setExpandedTags(true)}
                  data-testid="expand-tags"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  +{hiddenTagsCount} more
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Profile info with Hinge-inspired bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/98 to-transparent p-6">
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
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-medium bg-stone-50/80 backdrop-blur rounded-lg p-3 border border-stone-200/50 shadow-sm">{dog.bio}</p>
              )}

              {/* Temperament traits - Hinge style inline */}
              {dog.temperament && dog.temperament.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {dog.temperament.slice(0, 3).map((trait: string, index: number) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 shadow-sm"
                        data-testid={`temperament-${trait.toLowerCase()}`}
                      >
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        {trait}
                      </span>
                    ))}
                    {dog.temperament.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 shadow-sm">
                        +{dog.temperament.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced medical info toggle with Hinge-inspired button */}
            <Button
              onClick={onMedicalClick}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              data-testid="view-health-profile"
            >
              <Shield className="w-5 h-5" />
              <span>View Health Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}