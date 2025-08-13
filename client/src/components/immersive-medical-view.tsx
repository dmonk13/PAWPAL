import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, FileText, X, ChevronDown, Activity, Calendar } from "lucide-react";
import type { DogWithMedical } from "@shared/schema";

interface ImmersiveMedicalViewProps {
  dog: DogWithMedical | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImmersiveMedicalView({ 
  dog, 
  isOpen,
  onClose
}: ImmersiveMedicalViewProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !dog) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`relative mt-auto bg-white rounded-t-3xl shadow-2xl transition-transform duration-500 ease-out max-h-[85vh] overflow-hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-6 h-6 mr-3 text-pink-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {dog.name}'s Medical Profile
                </h2>
                <p className="text-sm text-gray-600">
                  Health information and medical summary
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              data-testid="button-close-immersive-medical"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-6">
          <div className="space-y-6 pt-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">
                    {dog.medicalProfile?.isSpayedNeutered ? 'Spayed/Neutered' : 'Not Spayed/Neutered'}
                  </p>
                  <p className="text-xs text-blue-700">
                    Age: {dog.age} years
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium text-green-900">
                    {dog.medicalProfile?.vetClearance ? 'Vet Cleared' : 'No Vet Clearance'}
                  </p>
                  <p className="text-xs text-green-700">
                    Breed: {dog.breed}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Medical Information */}
            {dog?.medicalProfile ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4 text-sm">
                  {/* Allergies */}
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Allergies:</span>
                    {dog.medicalProfile.allergies && dog.medicalProfile.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dog.medicalProfile.allergies.map((allergy, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">None reported</p>
                    )}
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Medical Conditions:</span>
                    {dog.medicalProfile.conditions && dog.medicalProfile.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dog.medicalProfile.conditions.map((condition, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">None reported</p>
                    )}
                  </div>

                  {/* Vaccinations */}
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Vaccinations:</span>
                    {dog.medicalProfile.vaccinations && dog.medicalProfile.vaccinations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dog.medicalProfile.vaccinations.map((vaccination, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            {vaccination.type}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No vaccination records</p>
                    )}
                  </div>

                  {/* Last Vet Visit */}
                  {dog.medicalProfile.lastVetVisit && (
                    <div>
                      <span className="font-medium text-gray-700 block mb-1">Last Vet Visit:</span>
                      <p className="text-gray-600">
                        {new Date(dog.medicalProfile.lastVetVisit).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Information</h3>
                  <p className="text-gray-600">
                    This pet's medical profile hasn't been completed yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 text-center leading-relaxed">
                <span className="font-medium">Important:</span> This information is provided by the pet owner for compatibility purposes. 
                Always verify medical information with a qualified veterinarian before making any health-related decisions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl"
                onClick={onClose}
                data-testid="button-continue-swiping"
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Continue Swiping
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl"
                onClick={onClose}
                data-testid="button-back-to-profile"
              >
                Back to {dog.name}'s Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}