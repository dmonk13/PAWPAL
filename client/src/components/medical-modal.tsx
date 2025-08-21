import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Shield, Calendar, AlertTriangle, Clock, Plus, ChevronRight, 
  Activity, FileText, Phone, MapPin, User
} from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CareDetailsDialog from "@/components/care-details-dialog";
import AddVaccinationDialog from "@/components/add-vaccination-dialog";

interface MedicalModalProps {
  dog: DogWithMedical;
  onClose: () => void;
}

export default function MedicalModal({ 
  dog, 
  onClose
}: MedicalModalProps) {
  const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
  const [showCareDetails, setShowCareDetails] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [, setLocation] = useLocation();

  // Dog data is already provided as prop
  const isLoading = false;

  // Early return if dog is not provided
  if (!dog) {
    return null;
  }

  // Use real vaccination data from medical profile or provide demo data
  const vaccinations = dog?.medicalProfile?.vaccinations || [
    {
      id: '1',
      type: 'Rabies',
      date: '2023-06-15',
      nextDue: '2024-06-15',
      status: 'overdue' as const,
      notes: 'Annual rabies vaccination required by law'
    },
    {
      id: '2', 
      type: 'DHPP',
      date: '2023-08-20',
      nextDue: '2024-08-20', 
      status: 'due-soon' as const,
      notes: 'Core vaccine for distemper, hepatitis, parvovirus, parainfluenza'
    },
    {
      id: '3',
      type: 'Bordetella',
      date: '2023-12-10',
      nextDue: '2024-06-10',
      status: 'up-to-date' as const,
      notes: 'Kennel cough prevention'
    }
  ];

  // Calculate status for each vaccination
  const getVaccinationStatus = (nextDue: string) => {
    const dueDate = new Date(nextDue);
    const today = new Date();
    const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 0) return 'overdue';
    if (daysDifference <= 30) return 'due-soon';
    return 'up-to-date';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysText = (nextDue: string) => {
    const dueDate = new Date(nextDue);
    const today = new Date();
    const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 0) {
      return `${Math.abs(daysDifference)} days overdue`;
    } else if (daysDifference <= 30) {
      return `Due in ${daysDifference} days`;
    }
    return 'Up to date';
  };

  const handleVaccinationClick = (vaccination: any) => {
    setSelectedVaccination({
      ...vaccination,
      status: getVaccinationStatus(vaccination.nextDue)
    });
    setShowCareDetails(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'due-soon':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Due Soon
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Up to Date
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              {dog.name}'s Medical Profile
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Track vaccinations, health records, and care reminders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Vaccinations Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  Vaccinations
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddRecord(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  data-testid="button-add-vaccination"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Record
                </Button>
              </div>

              <div className="space-y-3">
                {vaccinations.map((vaccination: any, index: number) => {
                  const status = getVaccinationStatus(vaccination.nextDue);
                  return (
                    <Card 
                      key={vaccination.id || index}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        status === 'overdue' 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : status === 'due-soon'
                          ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleVaccinationClick(vaccination)}
                      data-testid={`vaccination-card-${vaccination.type.toLowerCase().replace(' ', '-')}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{vaccination.type}</h4>
                              {getStatusBadge(status)}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>Last given: {formatDate(vaccination.date)}</p>
                              <p>Next due: {formatDate(vaccination.nextDue)}</p>
                              <p className={`font-medium ${
                                status === 'overdue' ? 'text-red-600' : 
                                status === 'due-soon' ? 'text-amber-600' : 
                                'text-green-600'
                              }`}>
                                {getDaysText(vaccination.nextDue)}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 border-2"
                  data-testid="button-schedule-checkup"
                  onClick={() => {
                    onClose();
                    setLocation('/vet-connect');
                  }}
                >
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Schedule Checkup</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 border-2"
                  data-testid="button-find-vet"
                  onClick={() => {
                    onClose();
                    setLocation('/vet-connect');
                  }}
                >
                  <MapPin className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Find Vet</span>
                </Button>
              </div>
            </div>

            {/* Health Summary */}
            {dog?.medicalProfile && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Health Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  {dog.medicalProfile.allergies && dog.medicalProfile.allergies.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Allergies: </span>
                      <span className="text-gray-600">{dog.medicalProfile.allergies.join(', ')}</span>
                    </div>
                  )}
                  {dog.medicalProfile.conditions && dog.medicalProfile.conditions.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Conditions: </span>
                      <span className="text-gray-600">{dog.medicalProfile.conditions.join(', ')}</span>
                    </div>
                  )}
                  {dog.medicalProfile.vetOnFile && (
                    <div>
                      <span className="font-medium text-gray-700">Primary Vet: </span>
                      <span className="text-gray-600">{(dog.medicalProfile.vetOnFile as any).name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Care Details Dialog */}
      {selectedVaccination && (
        <CareDetailsDialog
          isOpen={showCareDetails}
          onClose={() => {
            setShowCareDetails(false);
            setSelectedVaccination(null);
          }}
          vaccination={selectedVaccination}
          dog={{
            id: dog.id,
            name: dog.name,
            breed: dog?.breed || '',
            age: dog?.age || 0,
            weight: (dog as any)?.weight,
            medicalProfile: dog?.medicalProfile ? {
              allergies: dog.medicalProfile.allergies || [],
              vetOnFile: (dog.medicalProfile as any).vetOnFile
            } : undefined
          }}
          status={selectedVaccination.status}
        />
      )}

      {/* Add Vaccination Dialog */}
      <AddVaccinationDialog
        isOpen={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        dogId={dog.id}
        onSuccess={() => {
          setShowAddRecord(false);
          // Refresh data would happen here if needed
        }}
      />
    </>
  );
}