import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, Clock, MapPin, Phone, Car, Home, CreditCard, 
  CheckCircle, ArrowLeft, Share, Navigation, Plus, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VetSchedulingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: {
    type: string;
    nextDue: string;
  };
  dog: {
    id: string;
    name: string;
    breed: string;
    age: number;
  };
}

export default function VetSchedulingDialog({ 
  isOpen, 
  onClose, 
  vaccination, 
  dog 
}: VetSchedulingDialogProps) {
  const [step, setStep] = useState<'scheduling' | 'confirmation'>('scheduling');
  const [formData, setFormData] = useState({
    clinicId: '',
    date: '',
    time: '',
    method: 'in-clinic' as 'in-clinic' | 'mobile',
    notes: '',
    preferredVet: ''
  });
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch available veterinarians/clinics
  const { data: veterinarians = [], isLoading: loadingVets } = useQuery<any[]>({
    queryKey: ["/api/veterinarians/nearby"],
    enabled: isOpen
  });

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get clinic details
  const selectedClinic = veterinarians.find(vet => vet.id === formData.clinicId);

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest('POST', '/api/appointments', {
        dogId: dog.id,
        veterinarianId: formData.clinicId,
        appointmentType: 'vaccination',
        vaccineType: vaccination.type,
        scheduledDate: `${formData.date}T${formData.time}:00`,
        method: formData.method,
        notes: formData.notes,
        status: 'scheduled'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAppointmentId(data.id);
      setStep('confirmation');
      
      // Track successful booking
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'schedule_confirm', {
          vaccine_type: vaccination.type,
          dog_id: dog.id,
          clinic_id: formData.clinicId,
          method: formData.method
        });
      }

      // Update vaccination status
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      toast({
        title: "Appointment scheduled!",
        description: `${dog.name}'s ${vaccination.type} vaccination is scheduled for ${formatDateTime(formData.date, formData.time)}.`,
      });
    },
    onError: (error) => {
      // Track failed booking
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'schedule_fail', {
          vaccine_type: vaccination.type,
          dog_id: dog.id,
          error: (error as any).message
        });
      }

      toast({
        title: "Booking failed",
        description: "Unable to schedule appointment. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!formData.clinicId || !formData.date || !formData.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createAppointmentMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleAddToCalendar = () => {
    if (!selectedClinic || !formData.date || !formData.time) return;

    const startDate = new Date(`${formData.date}T${formData.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour appointment

    const event = {
      title: `${dog.name} - ${vaccination.type} Vaccination`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `Vaccination appointment at ${selectedClinic.name}`,
      location: selectedClinic.address
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleGetDirections = () => {
    if (!selectedClinic?.address) return;
    
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(selectedClinic.address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${dog.name}'s Vaccination Appointment`,
      text: `${dog.name} has a ${vaccination.type} vaccination scheduled for ${formatDateTime(formData.date, formData.time)} at ${selectedClinic?.name}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Copied to clipboard",
          description: "Appointment details copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      toast({
        title: "Copied to clipboard",
        description: "Appointment details copied to clipboard.",
      });
    }
  };

  if (step === 'confirmation') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              Appointment Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your appointment has been successfully scheduled
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Pet:</span>
                    <span className="text-gray-900">{dog.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Service:</span>
                    <span className="text-gray-900">{vaccination.type} Vaccination</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                    <span className="text-gray-900">{formatDateTime(formData.date, formData.time)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Clinic:</span>
                    <span className="text-gray-900">{selectedClinic?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Method:</span>
                    <span className="text-gray-900 capitalize">{formData.method.replace('-', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={handleAddToCalendar}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-add-to-calendar"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleGetDirections}
                  className="border-2"
                  data-testid="button-get-directions"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="border-2"
                  data-testid="button-share-appointment"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full mt-4"
              data-testid="button-close-confirmation"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Schedule {vaccination.type} Vaccination
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Book an appointment for {dog.name}'s vaccination
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pet & Service Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Pet</p>
                  <p className="text-gray-900">{dog.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Service</p>
                  <p className="text-gray-900">{vaccination.type} Vaccination</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Clinic</Label>
            {loadingVets ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <Select 
                value={formData.clinicId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, clinicId: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {veterinarians.map((vet) => (
                    <SelectItem key={vet.id} value={vet.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{vet.name}</span>
                        <span className="text-sm text-gray-600">{vet.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="h-11"
                data-testid="input-appointment-date"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Time</Label>
              <Select 
                value={formData.time} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Service Method</Label>
            <RadioGroup 
              value={formData.method} 
              onValueChange={(value: 'in-clinic' | 'mobile') => setFormData(prev => ({ ...prev, method: value }))}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="in-clinic" id="in-clinic" />
                <Label htmlFor="in-clinic" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Car className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="font-medium">In-Clinic Visit</p>
                      <p className="text-sm text-gray-600">Visit the veterinary clinic</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Home className="w-5 h-5 mr-3 text-green-600" />
                    <div>
                      <p className="font-medium">Mobile Service</p>
                      <p className="text-sm text-gray-600">Vet comes to your location</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions or concerns..."
              className="min-h-[80px]"
              data-testid="textarea-appointment-notes"
            />
          </div>

          {/* Fee Information */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Estimated Cost</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {vaccination.type} vaccination: $35-65
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Final cost may vary based on clinic and additional services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-scheduling"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.clinicId || !formData.date || !formData.time}
              className="flex-1 bg-pink-600 hover:bg-pink-700"
              data-testid="button-confirm-appointment"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}