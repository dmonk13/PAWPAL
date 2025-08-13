import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Calendar, Clock, MapPin, Phone, Shield, AlertTriangle, Info, 
  User, Weight, Heart, CheckCircle, X, ArrowRight, Star, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// These will be imported after components are created

interface CareDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: {
    id?: string;
    type: string;
    date: string;
    nextDue: string;
    notes?: string;
    sideEffects?: string[];
    contraindications?: string[];
  };
  dog: {
    id: string;
    name: string;
    breed: string;
    age: number;
    weight?: number;
    medicalProfile?: {
      allergies?: string[];
      vetOnFile?: {
        name: string;
        clinic: string;
        phone: string;
      };
    };
  };
  status: 'overdue' | 'due-soon' | 'up-to-date';
}

export default function CareDetailsDialog({ 
  isOpen, 
  onClose, 
  vaccination, 
  dog, 
  status 
}: CareDetailsDialogProps) {
  const [showScheduling, setShowScheduling] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if user has premium subscription
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Calculate days overdue/until due
  const dueDate = new Date(vaccination.nextDue);
  const today = new Date();
  const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysDifference < 0;
  const daysOverdue = Math.abs(daysDifference);

  // Get vaccination interval (typically 1 year for most vaccines)
  const lastGiven = new Date(vaccination.date);
  const recommendedInterval = "12 months";

  // Medical recommendations based on vaccine type
  const getMedicalInfo = (vaccineType: string) => {
    const common = {
      preVisitAdvice: [
        "Ensure your dog is feeling well before vaccination",
        "Bring previous vaccination records",
        "Fast for 2-3 hours before visit if combining with health check"
      ],
      commonSideEffects: [
        "Mild lethargy for 24-48 hours",
        "Temporary soreness at injection site",
        "Mild fever"
      ],
      contraindications: [
        "Current illness or fever",
        "Recent antibiotic treatment",
        "Pregnancy (for certain vaccines)"
      ]
    };

    switch (vaccineType.toLowerCase()) {
      case 'rabies':
        return {
          ...common,
          specificNotes: "Required by law in most areas. Single dose provides 1-3 year immunity.",
          contraindications: [...common.contraindications, "Previous adverse reaction to rabies vaccine"]
        };
      case 'dhpp':
      case 'distemper':
        return {
          ...common,
          specificNotes: "Core vaccine protecting against distemper, hepatitis, parvovirus, and parainfluenza.",
          contraindications: [...common.contraindications, "Immunocompromised dogs"]
        };
      default:
        return common;
    }
  };

  const medicalInfo = getMedicalInfo(vaccination.type);

  const handleScheduleWithVet = () => {
    // Track analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'schedule_confirm', {
        vaccine_type: vaccination.type,
        dog_id: dog.id,
        status: status
      });
    }

    // Close the dialog and navigate to vet connect
    onClose();
    setLocation('/vet-connect');
  };

  const handleMarkAsDone = () => {
    setShowAddRecord(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Track dialog open analytics
  React.useEffect(() => {
    if (isOpen && typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'dialog_open', {
        vaccine_type: vaccination.type,
        status: status,
        dog_id: dog.id
      });
    }
  }, [isOpen, vaccination.type, status, dog.id]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                  {vaccination.type} Vaccination
                </DialogTitle>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${
                      status === 'overdue' 
                        ? 'bg-red-100 text-red-800 border-red-200' 
                        : status === 'due-soon'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                    }`}
                  >
                    {status === 'overdue' 
                      ? `Overdue ${daysOverdue} days` 
                      : status === 'due-soon'
                      ? `Due in ${daysOverdue} days`
                      : 'Up to date'
                    }
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Due: {formatDate(vaccination.nextDue)}
                  </span>
                </div>
              </div>
            </div>
            <DialogDescription className="text-gray-600">
              Manage vaccination schedule and book appointments for {dog.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Pet Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Pet Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-gray-900">{dog.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Breed</p>
                    <p className="text-gray-900">{dog.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Age</p>
                    <p className="text-gray-900">{dog.age} {dog.age === 1 ? 'year' : 'years'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Weight</p>
                    <p className="text-gray-900">{dog.weight || 'Not recorded'} {dog.weight ? 'lbs' : ''}</p>
                  </div>
                </div>
                
                {dog.medicalProfile?.vetOnFile && (
                  <div className="mt-4 p-3 bg-white rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Vet on File</p>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-medium">{dog.medicalProfile.vetOnFile.name}</p>
                      <p className="text-gray-600">{dog.medicalProfile.vetOnFile.clinic}</p>
                      <p className="text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {dog.medicalProfile.vetOnFile.phone}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Medical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Given</p>
                    <p className="text-gray-900">{formatDate(vaccination.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Recommended Interval</p>
                    <p className="text-gray-900">{recommendedInterval}</p>
                  </div>
                </div>

                {(medicalInfo as any).specificNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                    <p className="text-gray-600 text-sm">{(medicalInfo as any).specificNotes}</p>
                  </div>
                )}

                <Separator />

                {/* Side Effects */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1 text-blue-500" />
                    Common Side Effects
                  </p>
                  <ul className="space-y-1">
                    {medicalInfo.commonSideEffects.map((effect, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contraindications */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
                    Contraindications
                  </p>
                  <ul className="space-y-1">
                    {medicalInfo.contraindications.map((contraindication, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {contraindication}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Allergies */}
                {dog.medicalProfile?.allergies && dog.medicalProfile.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Heart className="w-4 h-4 mr-1 text-red-500" />
                      Known Allergies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {dog.medicalProfile.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-red-200 text-red-700">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre-visit Advice */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Pre-visit Preparation
                  </p>
                  <ul className="space-y-1">
                    {medicalInfo.preVisitAdvice.map((advice, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleScheduleWithVet}
                className="w-full h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold"
                data-testid="button-schedule-vet-connect"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule with Vet Connect Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  // Track analytics for other clinics
                  if (typeof (window as any).gtag !== 'undefined') {
                    (window as any).gtag('event', 'find_other_clinics', {
                      vaccine_type: vaccination.type,
                      dog_id: dog.id
                    });
                  }
                  // TODO: Implement clinic finder
                  toast({
                    title: "Feature coming soon",
                    description: "Clinic finder will be available in the next update.",
                  });
                }}
                className="w-full h-11 border-2"
                data-testid="button-find-other-clinics"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Find Other Clinics
              </Button>

              <Button
                variant="ghost"
                onClick={handleMarkAsDone}
                className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                data-testid="button-mark-as-done"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note: Additional dialogs would be rendered here */}
    </>
  );
}