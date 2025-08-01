import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Star, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Globe,
  Mail,
  Shield,
  Stethoscope,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Veterinarian {
  id: string;
  name: string;
  clinicName: string;
  specialties: string[];
  services: string[];
  rating: string;
  reviewCount: number;
  phoneNumber: string;
  email: string;
  website: string | null;
  address: string;
  latitude: string;
  longitude: string;
  workingHours: {
    Monday?: { open: string; close: string; closed?: boolean };
    Tuesday?: { open: string; close: string; closed?: boolean };
    Wednesday?: { open: string; close: string; closed?: boolean };
    Thursday?: { open: string; close: string; closed?: boolean };
    Friday?: { open: string; close: string; closed?: boolean };
    Saturday?: { open: string; close: string; closed?: boolean };
    Sunday?: { open: string; close: string; closed?: boolean };
  };
  emergencyServices: boolean;
  onlineBooking: boolean;
  bookingUrl: string | null;
  isActive: boolean;
}

export default function VetProfile() {
  const [, params] = useRoute("/vet-profile/:vetId");
  const [, setLocation] = useLocation();
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    dogName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceType: '',
    notes: ''
  });
  const { toast } = useToast();

  const { data: veterinarian, isLoading } = useQuery({
    queryKey: ['/api/veterinarians', params?.vetId],
    enabled: !!params?.vetId,
    queryFn: async () => {
      const response = await fetch(`/api/veterinarians/${params!.vetId}`);
      if (!response.ok) throw new Error('Veterinarian not found');
      return response.json();
    }
  });

  const handleBookAppointment = async () => {
    try {
      // Create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user', // This would come from auth context
          veterinarianId: params!.vetId,
          dogName: appointmentForm.dogName,
          ownerName: appointmentForm.ownerName,
          ownerPhone: appointmentForm.ownerPhone,
          ownerEmail: appointmentForm.ownerEmail,
          appointmentDate: appointmentForm.appointmentDate,
          appointmentTime: appointmentForm.appointmentTime,
          serviceType: appointmentForm.serviceType,
          notes: appointmentForm.notes,
          status: 'pending'
        })
      });

      if (!response.ok) throw new Error('Failed to book appointment');

      toast({
        title: "Appointment Requested",
        description: "Your appointment request has been sent. The clinic will contact you to confirm.",
      });

      setShowBookingDialog(false);
      setAppointmentForm({
        dogName: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        appointmentDate: '',
        appointmentTime: '',
        serviceType: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to submit appointment request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatWorkingHours = (workingHours: Veterinarian['workingHours']) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => {
      const dayKey = day as keyof typeof workingHours;
      const hours = workingHours[dayKey];
      
      if (!hours || hours.closed) {
        return { day, hours: 'Closed' };
      }
      
      return { day, hours: `${hours.open} - ${hours.close}` };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!veterinarian) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Veterinarian Not Found</h1>
            <Button onClick={() => setLocation('/vet-connect')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vet Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/vet-connect')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            VET CONNECT + SAFETY
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {veterinarian.name}
                    </CardTitle>
                    <CardDescription className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                      {veterinarian.clinicName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">{veterinarian.rating}</span>
                    <span className="text-gray-500 dark:text-gray-400">({veterinarian.reviewCount} reviews)</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{veterinarian.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{veterinarian.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{veterinarian.address}</span>
                    </div>
                    {veterinarian.website && (
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={veterinarian.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>Visit Website</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Specialties */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {veterinarian.specialties.map((specialty: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Services Offered
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {veterinarian.services.map((service: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Services */}
                {veterinarian.emergencyServices && (
                  <>
                    <Separator />
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-semibold">Emergency Services Available</span>
                      </div>
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        This clinic provides 24/7 emergency veterinary care.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Working Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatWorkingHours(veterinarian.workingHours).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{item.day}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Book Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {veterinarian.onlineBooking && veterinarian.bookingUrl ? (
                  <Button 
                    className="w-full"
                    onClick={() => window.open(veterinarian.bookingUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Book Online
                  </Button>
                ) : (
                  <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Request Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Appointment</DialogTitle>
                        <DialogDescription>
                          Fill out this form to request an appointment. The clinic will contact you to confirm.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dogName">Dog's Name</Label>
                            <Input
                              id="dogName"
                              value={appointmentForm.dogName}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, dogName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ownerName">Your Name</Label>
                            <Input
                              id="ownerName"
                              value={appointmentForm.ownerName}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, ownerName: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ownerPhone">Phone Number</Label>
                            <Input
                              id="ownerPhone"
                              type="tel"
                              value={appointmentForm.ownerPhone}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ownerEmail">Email</Label>
                            <Input
                              id="ownerEmail"
                              type="email"
                              value={appointmentForm.ownerEmail}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="appointmentDate">Preferred Date</Label>
                            <Input
                              id="appointmentDate"
                              type="date"
                              value={appointmentForm.appointmentDate}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="appointmentTime">Preferred Time</Label>
                            <Input
                              id="appointmentTime"
                              type="time"
                              value={appointmentForm.appointmentTime}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceType">Service Type</Label>
                          <Select value={appointmentForm.serviceType} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, serviceType: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                              {veterinarian.services.map((service: string) => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            value={appointmentForm.notes}
                            onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any additional information about your pet or appointment"
                          />
                        </div>
                        
                        <Button onClick={handleBookAppointment} className="w-full">
                          Send Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`tel:${veterinarian.phoneNumber}`, '_self')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            {/* Safety Badge */}
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-3" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Verified Veterinarian
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    This veterinarian has been verified by PupMatch for quality and safety standards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}