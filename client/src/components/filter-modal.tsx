import React, { useState, useEffect } from "react";
import { X, CheckCircle, Users, Heart, Shield, Baby, Scissors, MapPin, AlertTriangle, Info, RotateCcw, Plus, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  initialFilters?: any;
}

export default function FilterModal({ isOpen, onClose, onApplyFilters, initialFilters = {} }: FilterModalProps) {
  // Core filters
  const [distance, setDistance] = useState([initialFilters.maxDistance || 10]);
  const [customDistance, setCustomDistance] = useState(false);
  const [customDistanceValue, setCustomDistanceValue] = useState(initialFilters.maxDistance || 10);
  
  // Age filters
  const [selectedAgeChips, setSelectedAgeChips] = useState<string[]>(initialFilters.ageChips || []);
  const [showCustomAge, setShowCustomAge] = useState(false);
  const [customMinAge, setCustomMinAge] = useState(initialFilters.minAge || 0);
  const [customMaxAge, setCustomMaxAge] = useState(initialFilters.maxAge || 15);
  const [hasCustomAge, setHasCustomAge] = useState(initialFilters.hasCustomAge || false);
  
  // Size filters
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialFilters.sizes || []);
  
  // Medical requirements
  const [vaccinated, setVaccinated] = useState(initialFilters.vaccinated !== undefined ? initialFilters.vaccinated : true);
  const [spayedNeutered, setSpayedNeutered] = useState(initialFilters.spayedNeutered || false);
  const [noAllergies, setNoAllergies] = useState(initialFilters.noAllergies || false);
  const [vetClearance, setVetClearance] = useState(initialFilters.vetClearance || false);
  
  // Special preferences
  const [matingPreference, setMatingPreference] = useState(initialFilters.matingPreference || false);
  const [playmatePreference, setPlaymatePreference] = useState(initialFilters.playmatePreference || false);
  
  // Temperament
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>(initialFilters.temperaments || []);
  
  // UI state
  const [showTooltips, setShowTooltips] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Configuration data
  const temperamentOptions = [
    "Playful", "Energetic", "Calm", "Friendly", "Shy", 
    "Intelligent", "Curious", "Loyal", "Social", "Gentle"
  ];
  
  const ageChipOptions = [
    { id: "puppy", label: "Puppy", subtitle: "0-1y", range: "0-1 years", icon: Baby },
    { id: "young", label: "Young", subtitle: "1-3y", range: "1-3 years", icon: Heart },
    { id: "adult", label: "Adult", subtitle: "3-7y", range: "3-7 years", icon: Shield },
    { id: "senior", label: "Senior", subtitle: "7y+", range: "7+ years", icon: MapPin },
    { id: "custom", label: "Custom", subtitle: "Set range", range: "Custom range", icon: Plus }
  ];
  
  const sizeOptions = ["Small", "Medium", "Large"];
  
  const distanceSnapPoints = [1, 5, 10, 25, 50];
  
  const medicalRequirements = [
    {
      id: "vaccinated",
      label: "Vaccinated",
      hint: "Up-to-date on core vaccines",
      tooltip: "Includes rabies, DHPP, and other core vaccinations as recommended by veterinarians",
      icon: Heart,
      color: "text-red-500"
    },
    {
      id: "vetClearance", 
      label: "Vet Clearance",
      hint: "Recent health checkup",
      tooltip: "Dog has received a clean bill of health from a veterinarian within the last 12 months",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      id: "spayedNeutered",
      label: "Spayed/Neutered",
      hint: "Prevents unwanted breeding",
      tooltip: "Dog has been spayed (female) or neutered (male) to prevent reproduction",
      icon: Scissors,
      color: "text-blue-500"
    },
    {
      id: "noAllergies",
      label: "No Allergies",
      hint: "No known food allergies",
      tooltip: "Dog has no documented food allergies or dietary restrictions that could complicate playdates",
      icon: AlertTriangle,
      color: "text-orange-500"
    }
  ];

  // Handler functions
  const toggleTemperament = (temperament: string) => {
    if (selectedTemperaments.length >= 5 && !selectedTemperaments.includes(temperament)) {
      return; // Prevent selecting more than 5
    }
    setSelectedTemperaments(prev => 
      prev.includes(temperament)
        ? prev.filter(t => t !== temperament)
        : [...prev, temperament]
    );
    setHasChanges(true);
  };
  
  const toggleAgeChip = (chipId: string) => {
    if (chipId === 'custom') {
      setShowCustomAgeSheet(true);
      return;
    }
    
    setSelectedAgeChips(prev => {
      const newSelection = prev.includes(chipId)
        ? prev.filter(id => id !== chipId)
        : [...prev, chipId];
      
      // Remove custom if user selects preset chips
      if (newSelection.length > 0 && hasCustomAge) {
        setHasCustomAge(false);
      }
      
      return newSelection;
    });
    setHasChanges(true);
  };
  
  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
    setHasChanges(true);
  };
  
  const snapToNearestDistance = (value: number) => {
    const nearest = distanceSnapPoints.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    return nearest;
  };
  
  const handleDistanceChange = (value: number[]) => {
    const snapped = snapToNearestDistance(value[0]);
    setDistance([snapped]);
    setCustomDistanceValue(snapped);
    setHasChanges(true);
  };
  
  const handleCustomDistanceChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 1 && numValue <= 100) {
      setCustomDistanceValue(numValue);
      setDistance([numValue]);
      setHasChanges(true);
    }
  };
  
  const validateAgeRange = () => {
    if (customMinAge > customMaxAge) {
      const temp = customMinAge;
      setCustomMinAge(customMaxAge);
      setCustomMaxAge(temp);
    }
  };
  
  const handleCustomAgeApply = () => {
    validateAgeRange();
    setHasCustomAge(true);
    setSelectedAgeChips([]); // Clear preset selections
    setShowCustomAgeSheet(false);
    setHasChanges(true);
  };
  
  const resetToPresets = () => {
    setHasCustomAge(false);
    setCustomMinAge(0);
    setCustomMaxAge(15);
    setShowCustomAgeSheet(false);
  };
  
  // Track changes for UI feedback
  useEffect(() => {
    validateAgeRange();
  }, [customMinAge, customMaxAge]);

  const handleApply = () => {
    const filters = {
      maxDistance: customDistance ? customDistanceValue : distance[0],
      ageChips: selectedAgeChips,
      hasCustomAge,
      minAge: hasCustomAge ? customMinAge : undefined,
      maxAge: hasCustomAge ? customMaxAge : undefined,
      sizes: selectedSizes,
      vaccinated,
      spayedNeutered,
      noAllergies,
      vetClearance,
      matingPreference,
      playmatePreference,
      temperaments: selectedTemperaments,
    };
    
    // Save filters to localStorage for persistence
    localStorage.setItem('pupMatchFilters', JSON.stringify(filters));
    
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setDistance([10]);
    setCustomDistance(false);
    setCustomDistanceValue(10);
    setSelectedAgeChips([]);
    setHasCustomAge(false);
    setCustomMinAge(0);
    setCustomMaxAge(15);
    setSelectedSizes([]);
    setVaccinated(true);
    setSpayedNeutered(false);
    setNoAllergies(false);
    setVetClearance(false);
    setMatingPreference(false);
    setPlaymatePreference(false);
    setSelectedTemperaments([]);
    setHasChanges(false);
    
    // Clear saved filters
    localStorage.removeItem('pupMatchFilters');
  };
  
  const handleResetToRecommended = () => {
    setDistance([10]);
    setCustomDistance(false);
    setCustomDistanceValue(10);
    setSelectedAgeChips(["young", "adult"]);
    setHasCustomAge(false);
    setSelectedSizes(["Medium"]);
    setVaccinated(true);
    setSpayedNeutered(false);
    setNoAllergies(false);
    setVetClearance(true);
    setMatingPreference(false);
    setPlaymatePreference(true);
    setSelectedTemperaments(["Friendly", "Social", "Playful"]);
    setHasChanges(true);
  };
  
  // Get active filter count for summary
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedAgeChips.length > 0 || hasCustomAge) count++;
    if (selectedSizes.length > 0) count++;
    if (distance[0] !== 10) count++;
    if (!vaccinated || spayedNeutered || noAllergies || vetClearance) count++;
    if (matingPreference || playmatePreference) count++;
    if (selectedTemperaments.length > 0) count++;
    return count;
  };
  
  const getDistanceText = () => {
    const dist = customDistance ? customDistanceValue : distance[0];
    return `Showing within ${dist} mile${dist !== 1 ? 's' : ''}`;
  };

  // Get filter summary pills
  const getFilterSummary = () => {
    const pills = [];
    if (selectedAgeChips.length > 0) {
      pills.push(`Ages: ${selectedAgeChips.map(id => ageChipOptions.find(opt => opt.id === id)?.label).join(', ')}`);
    }
    if (hasCustomAge) {
      pills.push(`Age: ${customMinAge}-${customMaxAge}y`);
    }
    if (selectedSizes.length > 0) {
      pills.push(`Size: ${selectedSizes.join(', ')}`);
    }
    if (distance[0] !== 10) {
      pills.push(`${distance[0]}mi`);
    }
    if (selectedTemperaments.length > 0) {
      pills.push(`${selectedTemperaments.length} traits`);
    }
    return pills;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto h-full max-h-screen overflow-hidden p-0 gap-0 [&>button]:hidden" 
                     aria-describedby="filter-description">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-left">
              Filters
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 -mr-2"
              data-testid="button-close-filters"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <DialogDescription id="filter-description" className="text-gray-600 text-left">
            Find your perfect playmate
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <TooltipProvider>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-8 py-4">
              
              {/* Distance Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-gray-900">Distance</Label>
                  <div className="text-sm text-gray-600 font-medium">
                    {getDistanceText()}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={distance}
                      onValueChange={handleDistanceChange}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                      data-testid="slider-distance"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                      {distanceSnapPoints.map(point => (
                        <span key={point} className={distance[0] === point ? 'font-bold text-pink-600' : ''}>
                          {point}mi
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Distance Input */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="custom-distance"
                      checked={customDistance}
                      onCheckedChange={(checked) => setCustomDistance(checked === true)}
                      data-testid="checkbox-custom-distance"
                    />
                    <Label htmlFor="custom-distance" className="text-sm text-gray-700">
                      Custom distance:
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => customDistanceValue > 1 && handleCustomDistanceChange((customDistanceValue - 1).toString())}
                        disabled={!customDistance || customDistanceValue <= 1}
                        className="w-8 h-8 p-0"
                        data-testid="button-distance-minus"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={customDistanceValue}
                        onChange={(e) => handleCustomDistanceChange(e.target.value)}
                        disabled={!customDistance}
                        className="w-16 text-center"
                        min="1"
                        max="100"
                        data-testid="input-custom-distance"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => customDistanceValue < 100 && handleCustomDistanceChange((customDistanceValue + 1).toString())}
                        disabled={!customDistance || customDistanceValue >= 100}
                        className="w-8 h-8 p-0"
                        data-testid="button-distance-plus"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-500">miles</span>
                    </div>
                  </div>
                </div>
              </div>
          
              {/* Age Range Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-gray-900">Age Preference</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <Info className="w-4 h-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">Age affects energy and training needs</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="text-sm text-gray-600">
                  Select one or more age groups
                </div>
                
                {/* Age Chips */}
                <div className="grid grid-cols-2 gap-2">
                  {ageChipOptions.slice(0, 4).map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedAgeChips.includes(option.id);
                    return (
                      <Button
                        key={option.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => toggleAgeChip(option.id)}
                        className={`h-[60px] p-2 flex flex-col items-center justify-center gap-1 border-2 transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                          isSelected 
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg" 
                            : "hover:border-pink-300 hover:bg-pink-50 border-gray-300"
                        }`}
                        data-testid={`chip-age-${option.id}`}
                        aria-label={`Select ${option.label} dogs: ${option.range}`}
                      >
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        <div className="text-center leading-tight">
                          <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {option.label}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-pink-100' : 'text-gray-500'}`}>
                            {option.subtitle}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                {/* Custom Age Range Section */}
                {!showCustomAge ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomAge(true)}
                    className="w-full h-[48px] border-2 border-dashed border-gray-300 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200"
                    data-testid="button-custom-age"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {hasCustomAge ? `Custom Range: ${customMinAge}-${customMaxAge} years` : 'Custom Age Range'}
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 border-2 border-pink-200 rounded-lg bg-pink-50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-900">Custom Age Range</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCustomAge(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Min Age</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => customMinAge > 0 && handleCustomAgeChange(customMinAge - 1, customMaxAge)}
                            disabled={customMinAge <= 0}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium">{customMinAge}y</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => customMinAge < 20 && handleCustomAgeChange(customMinAge + 1, customMaxAge)}
                            disabled={customMinAge >= 20}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Max Age</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => customMaxAge > customMinAge && handleCustomAgeChange(customMinAge, customMaxAge - 1)}
                            disabled={customMaxAge <= customMinAge}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium">{customMaxAge}y</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => customMaxAge < 20 && handleCustomAgeChange(customMinAge, customMaxAge + 1)}
                            disabled={customMaxAge >= 20}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleCustomAgeChange(0, 20);
                          setHasCustomAge(false);
                        }}
                        className="flex-1"
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setHasCustomAge(true);
                          setShowCustomAge(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Selected Summary */}
                {(selectedAgeChips.length > 0 || hasCustomAge) && (
                  <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-pink-700 font-medium">
                        {selectedAgeChips.length + (hasCustomAge ? 1 : 0)} age group{selectedAgeChips.length + (hasCustomAge ? 1 : 0) !== 1 ? 's' : ''} selected
                      </div>
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-xs">
                        {hasCustomAge && `${customMinAge}-${customMaxAge}y`}
                        {selectedAgeChips.length > 0 && selectedAgeChips.map(id => ageChipOptions.find(opt => opt.id === id)?.label).join(', ')}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
          
              {/* Size Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-gray-900">Size</Label>
                  {selectedSizes.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedSizes.length} selected
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {sizeOptions.map((sizeOption) => {
                    const isSelected = selectedSizes.includes(sizeOption);
                    return (
                      <Button
                        key={sizeOption}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => toggleSize(sizeOption)}
                        className={`min-h-[48px] text-sm font-medium border-2 transition-all duration-200 ${
                          isSelected 
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg" 
                            : "hover:border-pink-300 hover:bg-pink-50"
                        }`}
                        data-testid={`chip-size-${sizeOption.toLowerCase()}`}
                      >
                        {sizeOption}
                        {isSelected && <CheckCircle className="w-4 h-4 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
          
              {/* Medical Requirements Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900">Medical Requirements</Label>
                
                <div className="space-y-3">
                  {medicalRequirements.map((req) => {
                    const IconComponent = req.icon;
                    const isChecked = req.id === 'vaccinated' ? vaccinated : 
                                     req.id === 'vetClearance' ? vetClearance :
                                     req.id === 'spayedNeutered' ? spayedNeutered : 
                                     noAllergies;
                    
                    return (
                      <div key={req.id} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Checkbox
                          id={req.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const value = checked === true;
                            if (req.id === 'vaccinated') setVaccinated(value);
                            else if (req.id === 'vetClearance') setVetClearance(value);
                            else if (req.id === 'spayedNeutered') setSpayedNeutered(value);
                            else setNoAllergies(value);
                            setHasChanges(true);
                          }}
                          className="mt-1"
                          data-testid={`checkbox-${req.id}`}
                        />
                        
                        <div className="flex-1">
                          <Label htmlFor={req.id} className="cursor-pointer flex items-center">
                            <IconComponent className={`w-5 h-5 mr-2 ${req.color}`} />
                            <div>
                              <div className="font-medium text-gray-900">{req.label}</div>
                              <div className="text-sm text-gray-600">{req.hint}</div>
                            </div>
                          </Label>
                        </div>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              <Info className="w-4 h-4 text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="text-sm">{req.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Preferences Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900">Special Preferences</Label>
                
                <div className="space-y-3">
                  {/* Mating Partners */}
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="mating"
                        checked={matingPreference}
                        onCheckedChange={(checked) => {
                          setMatingPreference(checked === true);
                          setHasChanges(true);
                        }}
                        data-testid="checkbox-mating-preference"
                      />
                      <div className="flex-1">
                        <Label htmlFor="mating" className="cursor-pointer flex items-center">
                          <Users className="w-5 h-5 mr-2 text-purple-500" />
                          <div>
                            <div className="font-medium text-gray-900">Looking for mating partners only</div>
                            <div className="text-sm text-gray-600">Focus on breeding compatibility</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Playmate Preference */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 hover:bg-gradient-to-r hover:from-pink-100 hover:to-rose-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="playmate"
                        checked={playmatePreference}
                        onCheckedChange={(checked) => {
                          setPlaymatePreference(checked === true);
                          setHasChanges(true);
                        }}
                        data-testid="checkbox-playmate-preference"
                      />
                      <div className="flex-1">
                        <Label htmlFor="playmate" className="cursor-pointer flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-pink-500" />
                          <div>
                            <div className="font-medium text-gray-900 flex items-center">
                              Playmate
                              <Badge variant="secondary" className="ml-2 text-xs bg-pink-100 text-pink-700">
                                New
                              </Badge>
                            </div>
                            <div className="text-sm text-pink-700">
                              Focuses on temperament compatibility and energy level
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Temperament Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-gray-900">Temperament</Label>
                  <div className="text-sm text-gray-600">
                    {selectedTemperaments.length}/5 selected
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  Select up to 5 traits you prefer in a playmate
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {temperamentOptions.map((temperament) => {
                    const isSelected = selectedTemperaments.includes(temperament);
                    const isDisabled = selectedTemperaments.length >= 5 && !isSelected;
                    
                    return (
                      <Button
                        key={temperament}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => toggleTemperament(temperament)}
                        disabled={isDisabled}
                        className={`min-h-[48px] text-sm font-medium border-2 transition-all duration-200 ${
                          isSelected 
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg" 
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-pink-300 hover:bg-pink-50"
                        }`}
                        data-testid={`chip-temperament-${temperament.toLowerCase()}`}
                      >
                        {temperament}
                        {isSelected && <CheckCircle className="w-4 h-4 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
                
                {selectedTemperaments.length >= 5 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Maximum of 5 temperament traits selected
                  </div>
                )}
              </div>
              
              {/* Bottom spacing - reduced gap */}
              <div className="h-4"></div>
            </div>
          </div>
        </TooltipProvider>
        
        {/* Sticky Summary Bar */}
        {getActiveFilterCount() > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {getFilterSummary().map((pill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {pill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full min-h-[48px] border-2" 
              onClick={handleReset}
              data-testid="button-clear-filters"
            >
              Clear All
            </Button>
            <Button 
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 min-h-[48px] shadow-lg" 
              onClick={handleApply}
              data-testid="button-apply-filters"
            >
              Apply Filters
              {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
