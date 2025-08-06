import { X, Heart, Pill, AlertTriangle, Calendar, CheckCircle, FileText, Shield } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MedicalModalProps {
  dog: DogWithMedical;
  onClose: () => void;
}

export default function MedicalModal({ dog, onClose }: MedicalModalProps) {
  const { medicalProfile } = dog;

  if (!medicalProfile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="bg-white rounded-t-3xl p-6 w-full max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold dark-gray">Medical Information</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="medium-gray text-center py-8">No medical information available for {dog.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl p-6 w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold dark-gray">Medical Information</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Vaccinations */}
          <div className="bg-mint bg-opacity-10 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Heart className="w-4 h-4 mint mr-2" />
              <h4 className="font-semibold dark-gray">Vaccinations</h4>
            </div>
            {medicalProfile.vaccinations && medicalProfile.vaccinations.length > 0 ? (
              <ul className="text-sm medium-gray space-y-1">
                {medicalProfile.vaccinations.map((vaccination, index) => (
                  <li key={index}>
                    • {vaccination.type} (Updated: {new Date(vaccination.date).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm medium-gray">No vaccination records</p>
            )}
          </div>
          
          {/* Current Medications */}
          <div className="bg-sky bg-opacity-10 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Pill className="w-4 h-4 sky mr-2" />
              <h4 className="font-semibold dark-gray">Current Medications</h4>
            </div>
            {medicalProfile.medications && medicalProfile.medications.length > 0 ? (
              <ul className="text-sm medium-gray space-y-1">
                {medicalProfile.medications.map((medication, index) => (
                  <li key={index}>
                    • {medication.name} - {medication.dosage} ({medication.frequency})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm medium-gray">None</p>
            )}
          </div>
          
          {/* Allergies & Conditions */}
          <div className="bg-warm-yellow bg-opacity-10 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
              <h4 className="font-semibold dark-gray">Allergies & Conditions</h4>
            </div>
            <div className="space-y-2">
              {medicalProfile.allergies && medicalProfile.allergies.length > 0 && (
                <div>
                  <p className="text-xs font-medium medium-gray mb-1">Allergies:</p>
                  <div className="flex flex-wrap gap-1">
                    {medicalProfile.allergies.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {medicalProfile.conditions && medicalProfile.conditions.length > 0 && (
                <div>
                  <p className="text-xs font-medium medium-gray mb-1">Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {medicalProfile.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {(!medicalProfile.allergies || medicalProfile.allergies.length === 0) &&
               (!medicalProfile.conditions || medicalProfile.conditions.length === 0) && (
                <p className="text-sm medium-gray">No known allergies or medical conditions</p>
              )}
            </div>
          </div>
          
          {/* Vet Clearance */}
          {medicalProfile.vetClearance && (
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <h4 className="font-semibold dark-gray">Veterinary Clearance</h4>
              </div>
              <p className="text-sm medium-gray mb-2">
                Verified by veterinarian on {medicalProfile.vetClearanceDate 
                  ? new Date(medicalProfile.vetClearanceDate).toLocaleDateString()
                  : "Unknown date"
                }
              </p>
              {medicalProfile.vetDocumentUrl && (
                <Button variant="outline" size="sm" className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  View Documents
                </Button>
              )}
            </div>
          )}

          {/* Pet Insurance */}
          {medicalProfile.insurance && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="w-4 h-4 text-blue-600 mr-2" />
                <h4 className="font-semibold dark-gray">Pet Insurance</h4>
              </div>
              <div className="space-y-2 text-sm medium-gray">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Provider:</span> {medicalProfile.insurance.provider}
                  </div>
                  <div>
                    <span className="font-medium">Coverage:</span> {medicalProfile.insurance.coverageType}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Policy:</span> {medicalProfile.insurance.policyNumber}
                  </div>
                  {medicalProfile.insurance.coverageLimit && (
                    <div>
                      <span className="font-medium">Limit:</span> {medicalProfile.insurance.coverageLimit}
                    </div>
                  )}
                </div>
                {medicalProfile.insurance.deductible && (
                  <div>
                    <span className="font-medium">Deductible:</span> {medicalProfile.insurance.deductible}
                  </div>
                )}
                {medicalProfile.insurance.expirationDate && (
                  <div>
                    <span className="font-medium">Expires:</span> {new Date(medicalProfile.insurance.expirationDate).toLocaleDateString()}
                  </div>
                )}
                {medicalProfile.insurance.contactNumber && (
                  <div>
                    <span className="font-medium">Contact:</span> {medicalProfile.insurance.contactNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Vet Visit */}
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-purple-500 mr-2" />
              <h4 className="font-semibold dark-gray">Last Vet Visit</h4>
            </div>
            <p className="text-sm medium-gray">
              {medicalProfile.lastVetVisit 
                ? new Date(medicalProfile.lastVetVisit).toLocaleDateString()
                : "No recent visits recorded"
              }
            </p>
            
            {medicalProfile.isSpayedNeutered && (
              <Badge className="mt-2 bg-purple-500 text-white">
                Spayed/Neutered
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
