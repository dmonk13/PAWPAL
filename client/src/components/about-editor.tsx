import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AboutEditorProps {
  dogId: string;
  currentBio: string;
  dogName: string;
  onCancel: () => void;
}

export default function AboutEditor({ dogId, currentBio, dogName, onCancel }: AboutEditorProps) {
  const [bio, setBio] = useState(currentBio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBioMutation = useMutation({
    mutationFn: async (newBio: string) => {
      return apiRequest('PATCH', `/api/dogs/${dogId}`, { bio: newBio });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
      toast({
        title: "About section updated",
        description: `${dogName}'s bio has been updated successfully.`,
      });
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update bio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (bio.trim().length === 0) {
      toast({
        title: "Bio required",
        description: "Please add some information about your dog.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBioMutation.mutateAsync(bio.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setBio(currentBio);
    onCancel();
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder={`Tell us about ${dogName}! What makes them special? Their favorite activities, personality quirks, or what kind of doggy friends they enjoy playing with...`}
        className="min-h-[120px] resize-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        maxLength={500}
        data-testid="textarea-about-bio"
        autoFocus
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {bio.length}/500 characters
        </span>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-gray-600 hover:text-gray-700"
            data-testid="button-cancel-about"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || bio.trim().length === 0}
            className="bg-pink-600 hover:bg-pink-700 text-white"
            data-testid="button-save-about"
          >
            <Check className="w-4 h-4 mr-1" />
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}