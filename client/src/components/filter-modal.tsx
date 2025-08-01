import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

  const handleApply = () => {
    onApplyFilters({
      maxDistance: distance[0],
      ageRange,
      size,
      vaccinated,
      spayedNeutered,
      noAllergies,
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold dark-gray">Filters</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Distance */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-3">
              Distance ({distance[0]} miles)
            </Label>
            <Slider
              value={distance}
              onValueChange={setDistance}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs medium-gray mt-1">
              <span>1 mi</span>
              <span>25 mi</span>
              <span>50 mi</span>
            </div>
          </div>
          
          {/* Age Range */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-3">Age Range</Label>
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Puppy (0-1 year)">Puppy (0-1 year)</SelectItem>
                <SelectItem value="Young (1-3 years)">Young (1-3 years)</SelectItem>
                <SelectItem value="Adult (3-7 years)">Adult (3-7 years)</SelectItem>
                <SelectItem value="Senior (7+ years)">Senior (7+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Size */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-3">Size</Label>
            <div className="flex flex-wrap gap-2">
              {["Small", "Medium", "Large"].map((sizeOption) => (
                <Button
                  key={sizeOption}
                  variant={size === sizeOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSize(size === sizeOption ? "" : sizeOption)}
                  className={size === sizeOption ? "bg-coral text-white" : ""}
                >
                  {sizeOption}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Medical Requirements */}
          <div>
            <Label className="block text-sm font-semibold dark-gray mb-3">Medical Requirements</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="vaccinated"
                  checked={vaccinated}
                  onCheckedChange={setVaccinated}
                />
                <Label htmlFor="vaccinated" className="text-sm">Vaccinated</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="spayedNeutered"
                  checked={spayedNeutered}
                  onCheckedChange={setSpayedNeutered}
                />
                <Label htmlFor="spayedNeutered" className="text-sm">Spayed/Neutered</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="noAllergies"
                  checked={noAllergies}
                  onCheckedChange={setNoAllergies}
                />
                <Label htmlFor="noAllergies" className="text-sm">No Allergies</Label>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              className="flex-1 bg-coral text-white hover:bg-coral/90" 
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
