import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MapPin, Phone, Star, Clock, Calendar, ExternalLink, ArrowLeft, Filter, 
  SlidersHorizontal, Navigation, Crown, Shield, Heart, ChevronDown, Info,
  Stethoscope, Video, Home, Timer, User, MapPinIcon, Zap, Award
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
  const [locationBasedSearch, setLocationBasedSearch] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Premium Header */}
      <header 
        className="sticky top-0 z-40 pt-safe"
        style={{
          background: 'linear-gradient(135deg, #FFF8F2 0%, #FFFFFF 100%)',
        }}
        role="banner"
        aria-label="Vet Connect premium navigation"
      >
        {/* Premium Surface with Gradient Accent */}
        <div className="relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'linear-gradient(135deg, #6B21A8 0%, #F59E0B 100%)',
            }}
          />
          
          <div className="relative px-4 py-4">
            {/* Top Row: Back + Title + Premium Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Link href="/discover">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-w-[44px] min-h-[44px] p-0 hover:bg-white/50"
                    aria-label="Go back to discovery"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  <h1 className="text-2xl font-bold text-gray-900">Vet Connect</h1>
                </div>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      className="bg-gradient-to-r from-purple-600 to-amber-500 text-white px-3 py-1 font-semibold"
                      data-tone="info"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Premium Feature
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Access to verified veterinarians with advanced booking</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Subtitle */}
            <p className="text-gray-600 mb-4 font-medium">
              Find trusted veterinarians nearby
            </p>
            
            {/* Quick Toggles Row */}
            <div className="flex flex-col space-y-2 bg-white/60 rounded-xl p-3 border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Location-Based Search</span>
                </div>
                <Switch 
                  checked={locationBasedSearch} 
                  onCheckedChange={setLocationBasedSearch}
                  aria-label="Toggle location-based search"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Specialty Filter</span>
                </div>
                <Switch 
                  checked={specialtyFilter} 
                  onCheckedChange={setSpecialtyFilter}
                  aria-label="Toggle specialty filtering"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Emergency Only</span>
                </div>
                <Switch 
                  checked={emergencyOnly} 
                  onCheckedChange={setEmergencyOnly}
                  aria-label="Show only emergency services"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Radius Section */}
      <section className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Search Radius</span>
          </div>
          <span className="text-sm font-bold text-purple-600">{searchRadius[0]} km</span>
        </div>
        <Slider
          value={searchRadius}
          onValueChange={setSearchRadius}
          max={50}
          min={5}
          step={5}
          className="w-full"
          aria-label="Search radius in kilometers"
        />
      </section>

      {/* Active Filters Chips */}
      {(selectedSpecialties.length > 0 || emergencyOnly) && (
        <section className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialties.map((specialty) => (
              <Badge
                key={specialty}
                className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1"
                data-tone="info"
              >
                <span>{specialty}</span>
                <button
                  onClick={() => setSelectedSpecialties(prev => prev.filter(s => s !== specialty))}
                  className="ml-1 hover:text-blue-600"
                  aria-label={`Remove ${specialty} filter`}
                >
                  ×
                </button>
              </Badge>
            ))}
            {emergencyOnly && (
              <Badge className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Emergency Only</span>
                <button
                  onClick={() => setEmergencyOnly(false)}
                  className="ml-1 hover:text-red-600"
                  aria-label="Remove emergency filter"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </section>
      )}

      {/* Results Summary */}
      <section className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold text-gray-900">
              {filteredVeterinarians.length} {filteredVeterinarians.length === 1 ? 'veterinarian' : 'veterinarians'}
            </div>
            <div className="text-sm text-gray-600">found nearby</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="text-sm text-purple-600 hover:bg-purple-50 px-2 py-1"
            aria-label="Open sort and filter options"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            Sort & Filter
          </Button>
        </div>
      </section>

      {/* Premium Doctor Cards List */}
      <main className="flex-1 bg-gray-50 pb-safe overflow-y-auto">
        <div className="px-4 py-4">
          {/* Premium Enhanced Doctor Cards - Mobile-First */}
          {isLoading && (
            <div className="space-y-3" role="status" aria-label="Loading veterinarians">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex space-x-1">
                          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                          <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Premium Doctor Cards */}
          {filteredVeterinarians && filteredVeterinarians.length > 0 && (
            <div className="space-y-3" role="list">
              {filteredVeterinarians.map((vet: VeterinarianWithDistance) => (
                <Card 
                  key={vet.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
                  style={{ 
                    background: isOpenNow(vet.workingHours) 
                      ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.02) 0%, transparent 100%)' 
                      : 'linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, transparent 100%)'
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      {/* 56px Avatar */}
                      {vet.profilePhoto ? (
                        <img 
                          src={vet.profilePhoto} 
                          alt={vet.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      
                      {/* Compact Content */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Name + Rating + Availability */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate">
                              {vet.name}
                            </h3>
                            {vet.emergencyServices ? (
                              <Badge className="bg-amber-500 text-white px-1.5 py-0.5 text-xs font-bold rounded-full">24/7</Badge>
                            ) : isOpenNow(vet.workingHours) ? (
                              <Badge className="bg-green-500 text-white px-1.5 py-0.5 text-xs font-bold rounded-full">OPEN</Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-gray-900">{vet.rating}</span>
                          </div>
                        </div>

                        {/* Row 2: Clinic + Distance + Price */}
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center space-x-1 flex-1 min-w-0">
                            <span className="text-gray-600 truncate">{vet.clinicName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-bold text-gray-900">{vet.distance}km</span>
                          </div>
                          {vet.consultationFee && (
                            <span className="text-sm font-bold text-purple-600">from ${vet.consultationFee}</span>
                          )}
                        </div>

                        {/* Short Bio/Description (1-2 lines) */}
                        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {vet.specialties.slice(0, 2).join(", ")} • {vet.yearsExperience || 5}+ years experience
                          {vet.languages && vet.languages.length > 0 && ` • ${vet.languages.slice(0, 2).join(", ")}`}
                        </div>

                        {/* Micro-metadata Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {vet.specialties.slice(0, 2).map((specialty, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 text-xs rounded-full">
                                <Stethoscope className="w-2.5 h-2.5 mr-0.5" />
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {vet.services && vet.services.includes('Telehealth') && <Video className="w-3 h-3" />}
                            {vet.services && vet.services.includes('House Call') && <Home className="w-3 h-3" />}
                            <Timer className="w-3 h-3" />
                            <span>~15 min</span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center space-x-2">
                          {vet.onlineBooking && vet.bookingUrl ? (
                            <Button 
                              className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-sm font-semibold rounded-lg flex-1"
                              onClick={() => window.open(vet.bookingUrl!, '_blank')}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Book
                            </Button>
                          ) : (
                            <Button 
                              className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-sm font-semibold rounded-lg flex-1"
                              onClick={() => window.open(`tel:${vet.phoneNumber}`, '_self')}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-w-[44px] min-h-[44px] p-0 rounded-lg"
                            onClick={() => window.open(`tel:${vet.phoneNumber}`, '_self')}
                          >
                            <Phone className="w-4 h-4 text-gray-600" />
                          </Button>
                          
                          <Link href={`/vet-profile/${vet.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-w-[44px] min-h-[44px] p-0 rounded-lg"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-600" />
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

          {/* Empty State */}
          {filteredVeterinarians && filteredVeterinarians.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mx-auto max-w-sm">
                <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">No veterinarians found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search radius or clearing filters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSpecialties([])}
                  className="min-h-[44px]"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Premium Bottom Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="max-h-[80vh] bg-white rounded-t-2xl">
          <SheetHeader className="pb-4 border-b border-gray-200">
            <SheetTitle className="text-xl font-bold text-gray-900">Sort & Filter</SheetTitle>
            <SheetDescription className="text-gray-600">Customize your search results</SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Sort by</h4>
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
                    className={`w-full justify-start min-h-[44px] px-4 rounded-xl ${
                      sortBy === value ? "bg-purple-600 text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-3" />}
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            {allSpecialties.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Specialties</h4>
                <div className="grid grid-cols-1 gap-2">
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
                      className={`min-h-[44px] text-base ${
                        selectedSpecialties.includes(specialty)
                          ? "bg-purple-600 text-white border-purple-600"
                          : "hover:bg-gray-50"
                      }`}
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white min-h-[48px] font-semibold rounded-xl"
            >
              Apply Filters ({filteredVeterinarians.length} results)
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}