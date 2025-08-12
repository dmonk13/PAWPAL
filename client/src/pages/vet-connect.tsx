import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  MapPin, Phone, Star, Clock, Calendar, ExternalLink, ArrowLeft, Filter, 
  SlidersHorizontal, Navigation, Crown, Shield, Heart, ChevronDown
} from "lucide-react";
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
  const [searchRadius, setSearchRadius] = useState([25]);
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const { latitude, longitude, error: locationError } = useGeolocation();
  
  // Use fallback Bangalore coordinates if geolocation fails
  const effectiveLatitude = latitude || 12.9716;
  const effectiveLongitude = longitude || 77.5946;

  const { data: veterinarians = [], isLoading } = useQuery({
    queryKey: ['/api/veterinarians/nearby', effectiveLatitude, effectiveLongitude, searchRadius[0]],
    enabled: true, // Always enabled with fallback coordinates
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: effectiveLatitude.toString(),
        longitude: effectiveLongitude.toString(),
        maxDistance: searchRadius[0].toString()
      });
      
      const response = await fetch(`/api/veterinarians/nearby?${params}`);
      if (!response.ok) throw new Error('Failed to fetch veterinarians');
      return response.json();
    }
  });

  // Filter and sort veterinarians
  const filteredVeterinarians = veterinarians
    .filter((vet: VeterinarianWithDistance) => {
      if (selectedSpecialties.length === 0) return true;
      return selectedSpecialties.some(specialty => vet.specialties.includes(specialty));
    })
    .sort((a: VeterinarianWithDistance, b: VeterinarianWithDistance) => {
      switch (sortBy) {
        case "rating":
          return parseFloat(b.rating) - parseFloat(a.rating);
        case "price":
          const aPrice = parseFloat(a.consultationFee || "0");
          const bPrice = parseFloat(b.consultationFee || "0");
          return aPrice - bPrice;
        case "distance":
        default:
          return (a.distance || 0) - (b.distance || 0);
      }
    });

  // Get all unique specialties for filter chips
  const allSpecialties: string[] = Array.from(new Set(veterinarians.flatMap((vet: VeterinarianWithDistance) => vet.specialties)));

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
      {/* Header with Back Button, Title, and Filters */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Vet Connect</h1>
              <p className="text-sm text-gray-600">Find trusted veterinarians</p>
            </div>
          </div>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-gray-100 rounded-full relative"
                data-testid="button-filters"
                aria-label="Sort and filter options"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                {(selectedSpecialties.length > 0 || sortBy !== "distance") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-600 rounded-full"></div>
                )}
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Premium Badge and Location-Based Search */}
        <div className="px-4 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
          <div className="flex items-center justify-center space-x-2">
            <Badge className="bg-[#2563EB] text-white px-3 py-1.5 font-medium">
              <Crown className="w-3 h-3 mr-1.5" />
              Premium Feature
            </Badge>
            <Badge className="bg-[#16A34A] text-white px-3 py-1.5 font-medium">
              <Navigation className="w-3 h-3 mr-1.5" />
              Location-Based Search
            </Badge>
          </div>
        </div>

        {/* Search Radius Control */}
        <div className="px-4 py-4 bg-white border-b border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">
                Search Radius
              </label>
              <span className="text-sm font-semibold text-gray-900">
                {searchRadius[0]} km
              </span>
            </div>
            <Slider
              value={searchRadius}
              onValueChange={setSearchRadius}
              max={50}
              min={1}
              step={1}
              className="w-full"
              data-testid="slider-search-radius"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {filteredVeterinarians.length} veterinarian{filteredVeterinarians.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(true)}
                className="text-xs text-gray-600 hover:bg-gray-100 px-3 py-1.5 h-auto"
                data-testid="button-sort-results"
              >
                Sort: {sortBy === "distance" ? "Distance" : sortBy === "rating" ? "Rating" : "Price"}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Specialty Filter Chips */}
        {allSpecialties.length > 0 && (
          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {allSpecialties.slice(0, 6).map((specialty) => (
                <Button
                  key={specialty}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSpecialties(prev => 
                      prev.includes(specialty) 
                        ? prev.filter(s => s !== specialty)
                        : [...prev, specialty]
                    );
                  }}
                  className={`px-3 py-1.5 h-auto text-xs rounded-full border transition-all duration-200 ${
                    selectedSpecialties.includes(specialty)
                      ? "bg-pink-100 text-pink-800 border-pink-300"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                  data-testid={`chip-specialty-${specialty.toLowerCase().replace(' ', '-')}`}
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Veterinarians List */}
        <div className="px-4 py-4">{/* Grid container with consistent gutters */}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="flex space-x-2">
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                          <div className="h-5 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Veterinarians Results */}
          {filteredVeterinarians && filteredVeterinarians.length > 0 && (
            <div className="space-y-4">
              {filteredVeterinarians.map((vet: VeterinarianWithDistance) => (
                <Card key={vet.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Left-aligned Avatar */}
                      {vet.profilePhoto ? (
                        <img 
                          src={vet.profilePhoto} 
                          alt={vet.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                          data-testid={`img-vet-avatar-${vet.id}`}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-gray-100">
                          <span className="text-blue-600 text-lg">👨‍⚕️</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {/* Name + Rating */}
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-base truncate">{vet.name}</h3>
                          <div className="flex items-center space-x-1 ml-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">{vet.rating}</span>
                            <span className="text-xs text-gray-500">({vet.reviewCount})</span>
                          </div>
                        </div>
                        
                        {/* Clinic + Distance */}
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="truncate">{vet.clinicName}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="font-medium">{vet.distance} km</span>
                        </div>
                        
                        {/* Specialties Chips */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {vet.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1 rounded-full"
                              data-testid={`specialty-${specialty.toLowerCase().replace(' ', '-')}`}
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {vet.emergencyServices && (
                            <Badge className="bg-[#F59E0B] text-white text-xs px-2 py-1 rounded-full font-medium">
                              24/7 Emergency
                            </Badge>
                          )}
                        </div>
                        
                        {/* Hours/Price Line */}
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-gray-400" />
                            <span className={isOpenNow(vet.workingHours) ? "text-[#16A34A] font-medium" : ""}>
                              {getTodayHours(vet.workingHours)}
                            </span>
                          </div>
                          {vet.consultationFee && (
                            <span className="font-medium text-gray-900">${vet.consultationFee}</span>
                          )}
                        </div>
                        
                        {/* Primary and Secondary Actions */}
                        <div className="flex space-x-2">
                          {vet.onlineBooking && vet.bookingUrl ? (
                            <Button 
                              className="bg-pink-600 hover:bg-pink-700 text-white h-11 px-4 flex-1 font-medium"
                              onClick={() => window.open(vet.bookingUrl!, '_blank')}
                              data-testid={`button-book-${vet.id}`}
                              aria-label={`Book appointment with ${vet.name}`}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Book
                            </Button>
                          ) : (
                            <Button 
                              className="bg-pink-600 hover:bg-pink-700 text-white h-11 px-4 flex-1 font-medium"
                              onClick={() => window.open(`tel:${vet.phoneNumber}`, '_self')}
                              data-testid={`button-call-${vet.id}`}
                              aria-label={`Call ${vet.name} at ${vet.phoneNumber}`}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                          )}
                          
                          <Link href={`/vet-profile/${vet.id}`} className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                              data-testid={`button-view-profile-${vet.id}`}
                              aria-label={`View ${vet.name}'s profile`}
                            >
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredVeterinarians && filteredVeterinarians.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mx-auto">
                <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No veterinarians found
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  Try adjusting your search radius or clearing filters to find more options in your area.
                </p>
                {selectedSpecialties.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSpecialties([])}
                    className="text-sm"
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sort & Filter Bottom Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="max-h-[80vh] bg-white border-t border-gray-200">
          <SheetHeader className="pb-4 border-b border-gray-200">
            <SheetTitle className="text-lg font-semibold text-gray-900">Sort & Filter</SheetTitle>
            <SheetDescription className="text-sm text-gray-600">
              Customize your search results
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Sort Options */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sort by</h4>
              <div className="space-y-2">
                {[
                  { value: "distance", label: "Distance", icon: MapPin },
                  { value: "rating", label: "Rating", icon: Star },
                  { value: "price", label: "Price", icon: null }
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant="ghost"
                    onClick={() => setSortBy(value)}
                    className={`w-full justify-start h-11 px-4 ${
                      sortBy === value 
                        ? "bg-pink-50 text-pink-700 border border-pink-200" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    data-testid={`sort-option-${value}`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-3" />}
                    {label}
                    {sortBy === value && (
                      <div className="ml-auto w-2 h-2 bg-pink-600 rounded-full"></div>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Specialty Filters */}
            {allSpecialties.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Specialties</h4>
                  {selectedSpecialties.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedSpecialties([])}
                      className="text-xs text-gray-600 hover:text-gray-800 p-1 h-auto"
                      data-testid="button-clear-specialty-filters"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allSpecialties.map((specialty) => (
                    <Button
                      key={specialty}
                      variant="outline"
                      onClick={() => {
                        setSelectedSpecialties(prev => 
                          prev.includes(specialty) 
                            ? prev.filter(s => s !== specialty)
                            : [...prev, specialty]
                        );
                      }}
                      className={`h-11 text-sm transition-all duration-200 ${
                        selectedSpecialties.includes(specialty)
                          ? "bg-pink-50 text-pink-700 border-pink-300"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      data-testid={`filter-specialty-${specialty.toLowerCase().replace(' ', '-')}`}
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="py-4 border-t border-gray-200">
            <Button 
              onClick={() => setShowFilters(false)}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white h-11 font-medium"
              data-testid="button-apply-filters"
            >
              Apply Filters ({filteredVeterinarians.length} result{filteredVeterinarians.length !== 1 ? 's' : ''})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}