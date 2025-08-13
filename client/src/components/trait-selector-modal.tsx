import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TraitSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  currentTraits: string[];
  dogName: string;
}

const temperamentOptions = [
  "Playful", "Energetic", "Calm", "Friendly", "Shy", "Aggressive", 
  "Intelligent", "Curious", "Loyal", "Independent", "Social", "Protective",
  "Gentle", "Active", "Relaxed", "Alert", "Affectionate", "Focused"
];

export default function TraitSelectorModal({ 
  isOpen, 
  onClose, 
  dogId, 
  currentTraits, 
  dogName 
}: TraitSelectorModalProps) {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(currentTraits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateTraitsMutation = useMutation({
    mutationFn: async (traits: string[]) => {
      return apiRequest('PATCH', `/api/dogs/${dogId}`, { temperament: traits });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
      toast({
        title: "Traits updated",
        description: `${dogName}'s personality traits have been updated successfully.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update traits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length < 6 ? [...prev, trait] : prev
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateTraitsMutation.mutateAsync(selectedTraits);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTraits(currentTraits);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Manage {dogName}'s Traits
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Select up to 6 personality traits that best describe {dogName}. ({selectedTraits.length}/6 selected)
          </p>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-2">
            {temperamentOptions.map((trait) => (
              <Button
                key={trait}
                variant="outline"
                onClick={() => toggleTrait(trait)}
                disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 6}
                className={`h-auto py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  selectedTraits.includes(trait) 
                    ? "bg-pink-600 text-white border-pink-600 hover:bg-pink-700" 
                    : "border-2 hover:border-pink-600 hover:text-pink-600"
                } ${!selectedTraits.includes(trait) && selectedTraits.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid={`trait-option-${trait.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{trait}</span>
                  {selectedTraits.includes(trait) && (
                    <Check className="w-4 h-4 ml-2" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          {selectedTraits.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected traits:</p>
              <div className="flex flex-wrap gap-1">
                {selectedTraits.map((trait) => (
                  <Badge 
                    key={trait}
                    className="bg-pink-100 text-pink-800 border-pink-200 text-xs"
                    data-testid={`selected-trait-${trait.toLowerCase().replace(' ', '-')}`}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
            data-testid="button-cancel-traits"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting || selectedTraits.length === 0}
            className="bg-pink-600 hover:bg-pink-700"
            data-testid="button-save-traits"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}