import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Clock, Calendar, ExternalLink } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import BottomNav from "@/components/bottom-nav";

interface VeterinarianWithDistance {
  id: string;
  name: string;
  title?: string;
  clinicName: string;
  profilePhoto?: string;
  bio?: string;
  yearsExperience?: number;
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications?: {
    name: string;
    issuingBody: string;
    year: number;
    expiryDate?: string;
  }[];
  specialties: string[];
  services: string[];
  languages?: string[];
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
  consultationFee?: string;
  acceptsInsurance?: boolean;
  acceptedInsurances?: string[];
  isActive: boolean;
  distance?: number;
}

export default function VetConnect() {
  const [searchRadius, setSearchRadius] = useState(25);
  const { latitude, longitude, error: locationError } = useGeolocation();
  
  // Use fallback Bangalore coordinates if geolocation fails
  const effectiveLatitude = latitude || 12.9716;
  const effectiveLongitude = longitude || 77.5946;

  const { data: veterinarians = [], isLoading } = useQuery({
    queryKey: ['/api/veterinarians/nearby', effectiveLatitude, effectiveLongitude, searchRadius],
    enabled: true, // Always enabled with fallback coordinates
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: effectiveLatitude.toString(),
        longitude: effectiveLongitude.toString(),
        maxDistance: searchRadius.toString()
      });
      
      const response = await fetch(`/api/veterinarians/nearby?${params}`);
      if (!response.ok) throw new Error('Failed to fetch veterinarians');
      return response.json();
    }
  });

  const getTodayHours = (workingHours: VeterinarianWithDistance['workingHours']) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof typeof workingHours;
    const todayHours = workingHours[today];
    
    if (!todayHours || todayHours.closed) {
      return "Closed today";
    }
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  const isOpenNow = (workingHours: VeterinarianWithDistance['workingHours']) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as keyof typeof workingHours;
    const todayHours = workingHours[today];
    
    if (!todayHours || todayHours.closed) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  if (locationError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">VET CONNECT + SAFETY</h1>
            <div className="bg-white border border-red-200 rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="text-red-600 text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
              <p className="text-gray-600 leading-relaxed">
                Location access is required to find nearby veterinarians. Please enable location services and refresh the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Vet Connect</h1>
        <p className="text-gray-600">Find trusted veterinarians near you</p>
      </header>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
              Premium Feature
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700 font-medium">
              Location-Based Search
            </Badge>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium dark-gray mb-2 block">
                Search Radius: {searchRadius} miles
              </label>
              <Input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs medium-gray mt-1">
                <span>1 mile</span>
                <span>50 miles</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm medium-gray font-medium">
                {veterinarians?.length || 0} veterinarians found
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Veterinarians List */}
        {veterinarians && veterinarians.length > 0 && (
          <div className="space-y-4">
            {veterinarians.map((vet: VeterinarianWithDistance) => (
              <Card key={vet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {vet.profilePhoto ? (
                      <img 
                        src={vet.profilePhoto} 
                        alt={vet.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm">👨‍⚕️</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold dark-gray">{vet.name}</h3>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{vet.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm medium-gray mb-2">
                        {vet.clinicName} • {vet.distance} miles
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {vet.specialties.slice(0, 2).map((specialty: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {vet.emergencyServices && (
                          <Badge variant="destructive" className="text-xs bg-red-50 text-red-700">
                            24/7
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href={`/vet-profile/${vet.id}`}>
                        <Button size="sm" className="bg-coral text-white text-xs">
                          View Profile
                        </Button>
                      </Link>
                      {vet.onlineBooking && vet.bookingUrl ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(vet.bookingUrl!, '_blank')}
                          className="text-xs"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Book
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${vet.phoneNumber}`, '_self')}
                          className="text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs medium-gray mt-3">
                    {getTodayHours(vet.workingHours)} • {vet.consultationFee && `$${vet.consultationFee} consultation`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {veterinarians && veterinarians.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No veterinarians found
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Try increasing your search radius to find more options in your area.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}