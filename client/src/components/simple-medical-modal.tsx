import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, FileText } from "lucide-react";
import type { DogWithMedical } from "@shared/schema";

interface SimpleMedicalModalProps {
  dog: DogWithMedical;
  onClose: () => void;
}

export default function SimpleMedicalModal({ 
  dog, 
  onClose
}: SimpleMedicalModalProps) {
  // Early return if dog is not provided
  if (!dog) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-pink-600" />
            {dog.name}'s Medical Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Basic medical information and health summary
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Medical Information */}
          {dog?.medicalProfile ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Health Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                {/* Allergies */}
                {dog.medicalProfile.allergies && dog.medicalProfile.allergies.length > 0 ? (
                  <div>
                    <span className="font-medium text-gray-700">Allergies: </span>
                    <div className="mt-1 flex flex-wrap gap-1">
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
                  </div>
                ) : (
                  <div>
                    <span className="font-medium text-gray-700">Allergies: </span>
                    <span className="text-gray-500">None reported</span>
                  </div>
                )}

                {/* Medical Conditions */}
                {dog.medicalProfile.conditions && dog.medicalProfile.conditions.length > 0 ? (
                  <div>
                    <span className="font-medium text-gray-700">Medical Conditions: </span>
                    <div className="mt-1 flex flex-wrap gap-1">
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
                  </div>
                ) : (
                  <div>
                    <span className="font-medium text-gray-700">Medical Conditions: </span>
                    <span className="text-gray-500">None reported</span>
                  </div>
                )}

                {/* Spay/Neuter Status */}
                <div>
                  <span className="font-medium text-gray-700">Spayed/Neutered: </span>
                  <span className="text-gray-600">
                    {dog.medicalProfile.isSpayedNeutered ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="pt-2 border-t border-blue-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Age: </span>
                      <span className="text-gray-600">{dog.age} years</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Breed: </span>
                      <span className="text-gray-600">{dog.breed}</span>
                    </div>
                    {dog.size && (
                      <div>
                        <span className="font-medium text-gray-700">Size: </span>
                        <span className="text-gray-600">{dog.size}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 text-sm">No medical profile available</p>
              </CardContent>
            </Card>
          )}

          {/* Note for owners */}
          <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
            This information is provided by the pet owner for compatibility purposes.
            Always verify medical information with a veterinarian.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}