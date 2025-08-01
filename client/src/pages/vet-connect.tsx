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
  distance?: number;
}

export default function VetConnect() {
  const [searchRadius, setSearchRadius] = useState(25);
  const { latitude, longitude, error: locationError } = useGeolocation();

  const { data: veterinarians, isLoading } = useQuery({
    queryKey: ['/api/veterinarians/nearby', latitude, longitude, searchRadius],
    enabled: !!latitude && !!longitude,
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: latitude!.toString(),
        longitude: longitude!.toString(),
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">VET CONNECT + SAFETY</h1>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-700 dark:text-red-300">
                Location access is required to find nearby veterinarians. Please enable location services and refresh the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">VET CONNECT + SAFETY</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Find trusted veterinarians near you</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Premium Feature
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300">
              Location-Based Search
            </Badge>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <Card key={vet.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {vet.name}
                      </CardTitle>
                      <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                        {vet.clinicName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{vet.rating}</span>
                      <span className="text-gray-500 dark:text-gray-400">({vet.reviewCount})</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Distance and Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{vet.distance} miles away</span>
                    </div>
                    <Badge 
                      variant={isOpenNow(vet.workingHours) ? "default" : "secondary"}
                      className={isOpenNow(vet.workingHours) 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }
                    >
                      {isOpenNow(vet.workingHours) ? "Open Now" : "Closed"}
                    </Badge>
                  </div>

                  {/* Today's Hours */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Today: {getTodayHours(vet.workingHours)}</span>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{vet.phoneNumber}</span>
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {vet.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{vet.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Emergency Services */}
                  {vet.emergencyServices && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Emergency Services Available
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/vet-profile/${vet.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    
                    {vet.onlineBooking && vet.bookingUrl ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(vet.bookingUrl!, '_blank')}
                        className="flex items-center space-x-1"
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
                        className="flex items-center space-x-1"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <MapPin className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No veterinarians found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try increasing your search radius to find more options.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}