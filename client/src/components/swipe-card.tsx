import { Heart, MapPin, Plus, CheckCircle, AlertTriangle, Users, Shield, Baby, Scissors, Phone } from "lucide-react";
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
  color: string;
  bgColor: string;
  borderColor: string;
  priority: number;
  category: 'health' | 'behavior' | 'logistics' | 'compatibility';
}

export default function SwipeCard({ dog, onMedicalClick, className = "", style }: SwipeCardProps) {
  const { medicalProfile } = dog;
  const [expandedTags, setExpandedTags] = useState(false);
  
  const isVaccinated = medicalProfile?.vaccinations?.some(v => v.type === "Rabies");
  const hasAllergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0;
  const isSpayedNeutered = medicalProfile?.isSpayedNeutered;
  // Note: microchip field not available in current schema

  // Generate priority-based tags according to the document
  const generateTags = (): TagInfo[] => {
    const tags: TagInfo[] = [];

    // Priority 1: Critical Health Information (top-left)
    if (isVaccinated) {
      tags.push({
        id: 'vaccinated',
        label: 'Vaccinated',
        icon: <Shield className="w-3 h-3" />,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        priority: 1,
        category: 'health'
      });
    }

    if (medicalProfile?.vetClearance) {
      tags.push({
        id: 'vet-cleared',
        label: 'Vet Cleared',
        icon: <CheckCircle className="w-3 h-3" />,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        priority: 1,
        category: 'health'
      });
    }

    if (hasAllergies) {
      tags.push({
        id: 'allergies',
        label: 'Allergies',
        icon: <AlertTriangle className="w-3 h-3" />,
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        priority: 1,
        category: 'health'
      });
    }

    // Priority 2: Spay/Neuter and Microchip Status (essential info)
    if (isSpayedNeutered) {
      tags.push({
        id: 'fixed',
        label: 'Spayed/Neutered',
        icon: <Scissors className="w-3 h-3" />,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        priority: 2,
        category: 'health'
      });
    }

    if (hasMicrochip) {
      tags.push({
        id: 'microchip',
        label: 'Microchipped',
        icon: <Phone className="w-3 h-3" />,
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        priority: 2,
        category: 'health'
      });
    }

    // Priority 3: Behavioral tags (center position)
    if (dog.temperament) {
      dog.temperament.slice(0, 2).forEach((trait, index) => {
        tags.push({
          id: `behavior-${index}`,
          label: trait,
          icon: <Heart className="w-3 h-3" />,
          color: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          priority: 3,
          category: 'behavior'
        });
      });
    }

    // Priority 4: Compatibility tags (using basic info since goodWithKids isn't in schema)
    if (dog.size === 'Small') {
      tags.push({
        id: 'good-with-kids',
        label: 'Good with Kids',
        icon: <Baby className="w-3 h-3" />,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        priority: 4,
        category: 'compatibility'
      });
    }

    // Priority 5: Breeding preference (lower priority)
    if (dog.matingPreference) {
      tags.push({
        id: 'breeding',
        label: 'Available for Breeding',
        icon: <Users className="w-3 h-3" />,
        color: 'text-pink-700',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
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
        
        {/* Distance indicator - Priority 6: Logistical info (top-right) */}
        {dog.distance && (
          <div 
            className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-800 px-3 py-2 rounded-lg text-sm font-semibold shadow-md border border-gray-200 cursor-pointer hover:bg-white transition-colors"
            data-testid="distance-tag"
          >
            <MapPin className="w-4 h-4 inline mr-1 text-blue-600" />
            {Math.round(dog.distance)} mi
          </div>
        )}

        {/* Priority-based tag system with improved visual hierarchy */}
        <div className="absolute top-3 left-3 right-16 max-w-[70%]">
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <div
                key={tag.id}
                className={`
                  ${tag.bgColor} ${tag.borderColor} ${tag.color}
                  backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold 
                  shadow-md border transition-all duration-200 cursor-pointer
                  hover:scale-105 hover:shadow-lg
                  flex items-center gap-1.5
                `}
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
                className="bg-gray-50 border-gray-300 text-gray-600 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedTags(true)}
                data-testid="expand-tags"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                +{hiddenTagsCount} more
              </div>
            )}
            
            {expandedTags && hiddenTagsCount > 0 && (
              <div
                className="bg-gray-50 border-gray-300 text-gray-600 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedTags(false)}
                data-testid="collapse-tags"
              >
                Show less
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Profile info with better content strategy */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent p-6">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{dog.name}</h2>
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1.5 rounded-full shadow-md">
                <span className="text-lg font-bold">{dog.age}</span>
                <span className="text-sm ml-1">yrs</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-2.5 py-1 font-semibold text-sm">
                {dog.breed}
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-2.5 py-1 font-semibold text-sm">
                {dog.size}
              </Badge>
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-2.5 py-1 font-semibold text-sm">
                {dog.gender}
              </Badge>
            </div>
            
            {dog.bio && (
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-medium bg-gray-50 rounded-lg p-2 border border-gray-200">{dog.bio}</p>
            )}
          </div>
        </div>
        
        {/* Enhanced temperament section with better mobile optimization */}
        <div className="absolute -bottom-6 left-4 right-4 z-10">
          {dog.temperament && dog.temperament.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Personality Traits
                </span>
                {dog.temperament.length > 3 && (
                  <span className="text-xs text-gray-400">
                    {dog.temperament.length} traits
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {dog.temperament.slice(0, 3).map((trait: string, index: number) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 transition-all hover:scale-105 cursor-pointer"
                    data-testid={`temperament-${trait.toLowerCase()}`}
                  >
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    {trait}
                  </span>
                ))}
                {dog.temperament.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                    <Plus className="w-3 h-3 mr-1" />
                    +{dog.temperament.length - 3} more
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
