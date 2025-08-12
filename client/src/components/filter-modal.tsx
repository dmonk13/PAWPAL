import { useState } from "react";
import { X, CheckCircle, Users, Heart, Shield, Baby, Scissors, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface FilterModalProps {
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function FilterModal({ onClose, onApplyFilters }: FilterModalProps) {
  const [distance, setDistance] = useState([10]);
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [vaccinated, setVaccinated] = useState(true);
  const [spayedNeutered, setSpayedNeutered] = useState(false);
  const [noAllergies, setNoAllergies] = useState(false);
  const [vetClearance, setVetClearance] = useState(false);
  const [matingPreference, setMatingPreference] = useState(false);
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>([]);

  const temperamentOptions = [
    "Playful", "Energetic", "Calm", "Friendly", "Shy", 
    "Intelligent", "Curious", "Loyal", "Social", "Gentle", "Active"
  ];

  const toggleTemperament = (temperament: string) => {
    setSelectedTemperaments(prev => 
      prev.includes(temperament)
        ? prev.filter(t => t !== temperament)
        : [...prev, temperament]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      maxDistance: distance[0],
      ageRange,
      size,
      vaccinated,
      spayedNeutered,
      noAllergies,
      vetClearance,
      matingPreference,
      temperaments: selectedTemperaments,
    });
    onClose();
  };

  const handleReset = () => {
    setDistance([10]);
    setAgeRange("");
    setSize("");
    setVaccinated(true);
    setSpayedNeutered(false);
    setNoAllergies(false);
    setVetClearance(false);
    setMatingPreference(false);
    setSelectedTemperaments([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      <div className="bg-card rounded-t-3xl mt-16 flex-1 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h3 className="text-xl font-bold text-primary-dark">Filters</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="touch-manipulation min-h-[44px] min-w-[44px]">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
          <div className="space-y-6 py-2">
          {/* Distance */}
          <div>
            <Label className="block text-sm font-semibold text-primary-dark mb-4">
              Distance ({distance[0]} miles)
            </Label>
            <div className="px-2 py-4">
              <Slider
                value={distance}
                onValueChange={setDistance}
                max={50}
                min={1}
                step={1}
                className="w-full touch-manipulation"
              />
              <div className="flex justify-between text-xs text-secondary-gray mt-2 px-1">
                <span>1 mi</span>
                <span>25 mi</span>
                <span>50 mi</span>
              </div>
            </div>
          </div>
          
          {/* Age Range */}
          <div>
            <Label className="block text-sm font-semibold text-primary-dark mb-4">Age Range</Label>
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger className="touch-manipulation min-h-[48px] text-left">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent className="touch-manipulation">
                <SelectItem value="Puppy (0-1 year)" className="min-h-[48px] flex items-center">
                  <Baby className="w-4 h-4 mr-2 text-pink-500" />
                  Puppy (0-1 year)
                </SelectItem>
                <SelectItem value="Young (1-3 years)" className="min-h-[48px] flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-green-500" />
                  Young (1-3 years)
                </SelectItem>
                <SelectItem value="Adult (3-7 years)" className="min-h-[48px] flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-500" />
                  Adult (3-7 years)
                </SelectItem>
                <SelectItem value="Senior (7+ years)" className="min-h-[48px] flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Senior (7+ years)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Size */}
          <div>
            <Label className="block text-sm font-semibold text-primary-dark mb-4">Size</Label>
            <div className="grid grid-cols-3 gap-3">
              {["Small", "Medium", "Large"].map((sizeOption) => (
                <Button
                  key={sizeOption}
                  variant={size === sizeOption ? "default" : "outline"}
                  onClick={() => setSize(size === sizeOption ? "" : sizeOption)}
                  className={`touch-manipulation min-h-[48px] text-sm font-medium ${
                    size === sizeOption ? "bg-primary-rose text-white border-primary-rose" : "border-2 hover:border-primary-rose hover:text-primary-rose"
                  }`}
                >
                  {sizeOption}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Medical Requirements */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-4">Medical Requirements</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 touch-manipulation min-h-[56px]">
                <Checkbox
                  id="vaccinated"
                  checked={vaccinated}
                  onCheckedChange={(checked) => setVaccinated(checked === true)}
                  className="touch-manipulation"
                />
                <Label htmlFor="vaccinated" className="text-sm flex items-center flex-1 cursor-pointer">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Must be vaccinated
                </Label>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 touch-manipulation min-h-[56px]">
                <Checkbox
                  id="vet-clearance"
                  checked={vetClearance}
                  onCheckedChange={(checked) => setVetClearance(checked === true)}
                  className="touch-manipulation"
                />
                <Label htmlFor="vet-clearance" className="text-sm flex items-center flex-1 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Vet clearance required
                </Label>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 touch-manipulation min-h-[56px]">
                <Checkbox
                  id="spayedNeutered"
                  checked={spayedNeutered}
                  onCheckedChange={(checked) => setSpayedNeutered(checked === true)}
                  className="touch-manipulation"
                />
                <Label htmlFor="spayedNeutered" className="text-sm flex-1 cursor-pointer">
                  <Scissors className="w-4 h-4 mr-2 text-blue-500" />
                  Spayed/Neutered only
                </Label>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 touch-manipulation min-h-[56px]">
                <Checkbox
                  id="noAllergies"
                  checked={noAllergies}
                  onCheckedChange={(checked) => setNoAllergies(checked === true)}
                  className="touch-manipulation"
                />
                <Label htmlFor="noAllergies" className="text-sm flex-1 cursor-pointer">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                  No food allergies
                </Label>
              </div>
            </div>
          </div>

          {/* Special Preferences */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-4">Special Preferences</Label>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 touch-manipulation min-h-[56px]">
              <Checkbox
                id="mating"
                checked={matingPreference}
                onCheckedChange={(checked) => setMatingPreference(checked === true)}
                className="touch-manipulation"
              />
              <Label htmlFor="mating" className="text-sm flex items-center flex-1 cursor-pointer">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                Looking for mating partners only
              </Label>
            </div>
          </div>

          {/* Temperament Filter */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-4">
              Temperament (select traits you prefer)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {temperamentOptions.map((temperament) => (
                <Button
                  key={temperament}
                  type="button"
                  variant={selectedTemperaments.includes(temperament) ? "default" : "outline"}
                  onClick={() => toggleTemperament(temperament)}
                  className={`touch-manipulation min-h-[48px] text-sm font-medium ${
                    selectedTemperaments.includes(temperament) 
                      ? "bg-coral text-white border-coral" 
                      : "border-2 hover:border-coral hover:text-coral"
                  }`}
                >
                  {temperament}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Bottom spacing for mobile */}
          <div className="h-20"></div>
        </div>
      </div>
        
        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-white">
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1 touch-manipulation min-h-[48px]" 
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              className="flex-1 bg-coral text-white hover:bg-coral/90 touch-manipulation min-h-[48px]" 
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
