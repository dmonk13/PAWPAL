import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, FileText, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddVaccinationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  vaccineType?: string;
  onSuccess?: () => void;
}

export default function AddVaccinationDialog({ 
  isOpen, 
  onClose, 
  dogId, 
  vaccineType,
  onSuccess 
}: AddVaccinationDialogProps) {
  const [formData, setFormData] = useState({
    type: vaccineType || '',
    date: new Date().toISOString().split('T')[0],
    nextDue: '',
    veterinarian: '',
    clinic: '',
    batchNumber: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Common vaccine types
  const vaccineTypes = [
    'Rabies',
    'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
    'Bordetella',
    'Lyme Disease',
    'Canine Influenza',
    'Leptospirosis',
    'Other'
  ];

  // Calculate next due date based on vaccine type and current date
  const calculateNextDue = (type: string, givenDate: string) => {
    const given = new Date(givenDate);
    let months = 12; // Default to 1 year

    switch (type.toLowerCase()) {
      case 'rabies':
        months = 36; // 3 years for rabies (after initial)
        break;
      case 'bordetella':
        months = 6; // 6 months for bordetella
        break;
      case 'canine influenza':
        months = 12;
        break;
      default:
        months = 12;
    }

    const nextDue = new Date(given);
    nextDue.setMonth(nextDue.getMonth() + months);
    return nextDue.toISOString().split('T')[0];
  };

  // Auto-calculate next due date when type or date changes
  React.useEffect(() => {
    if (formData.type && formData.date) {
      const nextDue = calculateNextDue(formData.type, formData.date);
      setFormData(prev => ({ ...prev, nextDue }));
    }
  }, [formData.type, formData.date]);

  // Add vaccination record mutation
  const addVaccinationMutation = useMutation({
    mutationFn: async (vaccinationData: any) => {
      // First get the dog's medical profile
      const dogResponse = await fetch(`/api/dogs/${dogId}`);
      const dog = await dogResponse.json();
      
      const newVaccination = {
        type: formData.type,
        date: formData.date,
        nextDue: formData.nextDue,
        veterinarian: formData.veterinarian,
        clinic: formData.clinic,
        batchNumber: formData.batchNumber,
        notes: formData.notes
      };

      // Update the medical profile with new vaccination
      const existingVaccinations = dog.medicalProfile?.vaccinations || [];
      const updatedVaccinations = [...existingVaccinations, newVaccination];

      return apiRequest('PATCH', `/api/dogs/${dogId}`, {
        medicalProfile: {
          ...dog.medicalProfile,
          vaccinations: updatedVaccinations
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Vaccination record added",
        description: `${formData.type} vaccination has been recorded successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add record",
        description: "Unable to save vaccination record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!formData.type || !formData.date || !formData.nextDue) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addVaccinationMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      type: vaccineType || '',
      date: new Date().toISOString().split('T')[0],
      nextDue: '',
      veterinarian: '',
      clinic: '',
      batchNumber: '',
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add Vaccination Record
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Record a completed vaccination for your dog
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Important</p>
                  <p className="text-sm text-gray-600">
                    Only add vaccines that have already been administered by a licensed veterinarian.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vaccine Type */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Vaccine Type <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select vaccine type" />
              </SelectTrigger>
              <SelectContent>
                {vaccineTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Given */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Date Given <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="h-11"
              data-testid="input-vaccination-date"
            />
          </div>

          {/* Next Due Date */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Next Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.nextDue}
              onChange={(e) => setFormData(prev => ({ ...prev, nextDue: e.target.value }))}
              min={formData.date}
              className="h-11"
              data-testid="input-next-due-date"
            />
            <p className="text-xs text-gray-500">
              Automatically calculated based on vaccine type. You can adjust if needed.
            </p>
          </div>

          {/* Veterinarian & Clinic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Veterinarian</Label>
              <Input
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                placeholder="Dr. Smith"
                className="h-11"
                data-testid="input-veterinarian"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Clinic/Hospital</Label>
              <Input
                value={formData.clinic}
                onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                placeholder="Animal Medical Center"
                className="h-11"
                data-testid="input-clinic"
              />
            </div>
          </div>

          {/* Batch Number */}
          <div className="space-y-2">
            <Label>Batch/Lot Number</Label>
            <Input
              value={formData.batchNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
              placeholder="Optional - vaccine batch number"
              className="h-11"
              data-testid="input-batch-number"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this vaccination..."
              className="min-h-[80px]"
              data-testid="textarea-vaccination-notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-vaccination"
            >
              Cancel
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-2"
              data-testid="button-reset-form"
            >
              Reset
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.type || !formData.date || !formData.nextDue}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-save-vaccination"
            >
              <Check className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}