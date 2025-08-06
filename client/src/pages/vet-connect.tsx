import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Clock, Calendar, ExternalLink } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">VET CONNECT + SAFETY</h1>
          <p className="text-gray-600 text-lg">Find trusted veterinarians near you</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
              Premium Feature
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700 font-medium">
              Location-Based Search
            </Badge>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {searchRadius} miles
              </label>
              <Input
                id="radius"
                type="range"
                min="5"
                max="50"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                {veterinarians?.length || 0} veterinarians found
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Veterinarians List */}
        {veterinarians && veterinarians.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {veterinarians.map((vet: VeterinarianWithDistance) => (
              <Card key={vet.id} className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    {vet.profilePhoto && (
                      <img 
                        src={vet.profilePhoto} 
                        alt={vet.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {vet.name}
                            {vet.title && <span className="text-sm font-normal text-gray-600 ml-2">{vet.title}</span>}
                          </CardTitle>
                          <CardDescription className="text-primary font-medium">
                            {vet.clinicName}
                          </CardDescription>
                          {vet.yearsExperience && (
                            <p className="text-sm text-gray-600 mt-1">
                              {vet.yearsExperience} years experience
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-900">{vet.rating}</span>
                          <span className="text-gray-500">({vet.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Bio */}
                  {vet.bio && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-3">
                      {vet.bio}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4 pt-2">
                  {/* Education & Certifications */}
                  {(vet.education?.length || vet.certifications?.length) && (
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-2">Education & Certifications:</p>
                      <div className="space-y-1">
                        {vet.education?.slice(0, 1).map((edu, idx) => (
                          <p key={idx} className="text-xs text-gray-600">
                            {edu.degree} - {edu.institution} ({edu.year})
                          </p>
                        ))}
                        {vet.certifications?.slice(0, 1).map((cert, idx) => (
                          <p key={idx} className="text-xs text-primary font-medium">
                            {cert.name} ({cert.year})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Distance, Status, and Fee */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vet.distance} miles</span>
                      </div>
                      {vet.consultationFee && (
                        <div className="text-sm font-medium text-gray-900">
                          ${vet.consultationFee}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={isOpenNow(vet.workingHours) ? "default" : "secondary"}
                      className={isOpenNow(vet.workingHours) 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {isOpenNow(vet.workingHours) ? "Open Now" : "Closed"}
                    </Badge>
                  </div>

                  {/* Today's Hours */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Today: {getTodayHours(vet.workingHours)}</span>
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs border-primary/30 text-primary">
                          {specialty}
                        </Badge>
                      ))}
                      {vet.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                          +{vet.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Languages & Insurance */}
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    {vet.languages && vet.languages.length > 1 && (
                      <span>Languages: {vet.languages.join(', ')}</span>
                    )}
                    {vet.acceptsInsurance && (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-200">
                        Accepts Insurance
                      </Badge>
                    )}
                  </div>

                  {/* Emergency Services */}
                  {vet.emergencyServices && (
                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 w-full justify-center">
                      24/7 Emergency Services Available
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/vet-profile/${vet.id}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium" size="sm">
                        View Full Profile
                      </Button>
                    </Link>
                    
                    {vet.onlineBooking && vet.bookingUrl ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(vet.bookingUrl!, '_blank')}
                        className="flex items-center space-x-1 border-gray-300"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`tel:${vet.phoneNumber}`, '_self')}
                        className="flex items-center space-x-1 border-gray-300"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call</span>
                      </Button>
                    )}
                  </div>
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
    </div>
  );
}