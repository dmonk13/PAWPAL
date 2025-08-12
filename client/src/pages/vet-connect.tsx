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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile-First Header - Single column layout with 16px gutters */}
      <header 
        className="bg-white dark:bg-gray-900 border-b border-[hsl(var(--borders-light))] px-4 py-4 sticky top-0 z-40 shadow-sm"
        role="banner"
        aria-label="Vet Connect navigation"
      >
        <div className="flex items-center justify-between min-h-[44px]">
          {/* Back button with AA contrast and 44px tap target */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="min-w-[44px] min-h-[44px] p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex items-center justify-center"
            data-testid="button-back"
            aria-label="Go back to previous screen"
          >
            <ArrowLeft className="w-6 h-6 text-[hsl(var(--text-primary))]" />
          </Button>
          
          {/* Title section */}
          <div className="flex-1 text-center mx-4">
            <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] leading-tight">
              Vet Connect
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Find trusted veterinarians
            </p>
          </div>
          
          {/* Filters button with AA contrast and 44px tap target */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="min-w-[44px] min-h-[44px] p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative flex items-center justify-center"
                data-testid="button-filters"
                aria-label={`Sort and filter options${(selectedSpecialties.length > 0 || sortBy !== "distance") ? " - Filters active" : ""}`}
              >
                <SlidersHorizontal className="w-6 h-6 text-[hsl(var(--text-primary))]" />
                {(selectedSpecialties.length > 0 || sortBy !== "distance") && (
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--primary-rose))] rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-white text-xs font-bold">{selectedSpecialties.length || 1}</span>
                  </div>
                )}
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      </header>

      {/* Main Content with safe-area bottom padding */}
      <main 
        className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 pb-safe"
        role="main"
        aria-label="Vet search results"
      >
        {/* Premium Feature Badges - Stacked mobile design */}
        <section 
          className="px-4 py-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-b border-pink-100 dark:border-pink-900"
          aria-label="Premium features"
        >
          <div className="flex flex-col space-y-2">
            <div className="flex justify-center">
              <Badge 
                className="bg-[hsl(var(--info-blue))] text-white px-4 py-2 font-medium text-sm min-h-[44px] flex items-center"
                data-tone="info"
                role="status"
                aria-label="Premium feature available"
              >
                <Crown className="w-4 h-4 mr-2" />
                Premium Feature
              </Badge>
            </div>
            <div className="flex justify-center">
              <Badge 
                className="bg-[hsl(var(--success-green))] text-white px-4 py-2 font-medium text-sm min-h-[44px] flex items-center"
                data-tone="success"
                role="status"
                aria-label="Location-based search active"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Location-Based Search
              </Badge>
            </div>
          </div>
        </section>

        {/* Search Radius Control - 16px spacing */}
        <section 
          className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-[hsl(var(--borders-light))]"
          aria-label="Search radius control"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="search-radius"
                className="text-base font-semibold text-[hsl(var(--text-primary))]"
              >
                Search Radius
              </label>
              <span className="text-lg font-bold text-[hsl(var(--text-primary))] min-w-[60px] text-right">
                {searchRadius[0]} km
              </span>
            </div>
            <Slider
              id="search-radius"
              value={searchRadius}
              onValueChange={setSearchRadius}
              max={50}
              min={1}
              step={1}
              className="w-full touch-manipulation"
              data-testid="slider-search-radius"
              aria-label={`Search radius: ${searchRadius[0]} kilometers`}
            />
            <div className="flex justify-between text-sm text-[hsl(var(--text-secondary))] mt-2">
              <span>1 km</span>
              <span>50 km</span>
            </div>
            <Button
              onClick={() => setSearchRadius([25])}
              variant="outline"
              size="sm"
              className="w-full min-h-[44px] mt-4 text-[hsl(var(--text-primary))] border-[hsl(var(--borders-light))]"
              data-testid="button-reset-radius"
            >
              Reset to Default (25 km)
            </Button>
          </div>
        </section>

        {/* Results Summary - Mobile optimized */}
        <section 
          className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-[hsl(var(--borders-light))]"
          aria-label="Search results summary"
        >
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                {filteredVeterinarians.length} veterinarian{filteredVeterinarians.length !== 1 ? 's' : ''} found
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(true)}
                className="min-h-[44px] px-4 text-sm text-[hsl(var(--text-secondary))] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                data-testid="button-sort-results"
                aria-label={`Sort results. Currently sorted by ${sortBy}`}
              >
                Sort: {sortBy === "distance" ? "Distance" : sortBy === "rating" ? "Rating" : "Price"}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Specialty Filter Chips - Mobile optimized with 8px spacing */}
        {allSpecialties.length > 0 && (
          <section 
            className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-[hsl(var(--borders-light))]"
            aria-label="Specialty filters"
          >
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">
              Filter by Specialty
            </h3>
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
                  className={`min-h-[44px] px-4 py-2 text-sm rounded-full border transition-all duration-200 touch-manipulation ${
                    selectedSpecialties.includes(specialty)
                      ? "bg-[hsl(var(--primary-rose))] text-white border-[hsl(var(--primary-rose))]"
                      : "bg-gray-50 dark:bg-gray-800 text-[hsl(var(--text-primary))] border-[hsl(var(--borders-light))] hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  data-testid={`chip-specialty-${specialty.toLowerCase().replace(' ', '-')}`}
                  data-tone={selectedSpecialties.includes(specialty) ? "info" : "default"}
                  aria-pressed={selectedSpecialties.includes(specialty)}
                  aria-label={`Filter by ${specialty}${selectedSpecialties.includes(specialty) ? " - currently selected" : ""}`}
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Veterinarians List - Mobile-first with 16px gutters */}
        <section 
          className="px-4 py-4 bg-gray-50 dark:bg-gray-950"
          aria-label="Veterinarian search results"
          role="region"
        >
          {/* Loading State - Optimized for mobile */}
          {isLoading && (
            <div className="space-y-4" role="status" aria-label="Loading veterinarians">
              {[...Array(4)].map((_, i) => (
                <Card 
                  key={i} 
                  className="animate-pulse bg-white dark:bg-gray-900 shadow-sm border border-[hsl(var(--borders-light))] rounded-xl"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                        </div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mt-4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <span className="sr-only">Loading veterinarian results...</span>
            </div>
          )}

          {/* Mobile-First Vet Cards */}
          {filteredVeterinarians && filteredVeterinarians.length > 0 && (
            <div className="space-y-4" role="list" aria-label={`${filteredVeterinarians.length} veterinarians found`}>
              {filteredVeterinarians.map((vet: VeterinarianWithDistance) => (
                <Card 
                  key={vet.id} 
                  className="bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200 border border-[hsl(var(--borders-light))] rounded-xl touch-manipulation"
                  role="listitem"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-4">
                      {/* Header: Avatar, Name, Rating */}
                      <div className="flex items-start space-x-4">
                        {vet.profilePhoto ? (
                          <img 
                            src={vet.profilePhoto} 
                            alt={`${vet.name} profile photo`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(var(--borders-light))]"
                            data-testid={`img-vet-avatar-${vet.id}`}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center border-2 border-[hsl(var(--borders-light))]">
                            <span className="text-blue-600 dark:text-blue-300 text-2xl" role="img" aria-label="Doctor">👨‍⚕️</span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] leading-tight truncate">
                              {vet.name}
                            </h3>
                            <div className="flex items-center space-x-1 ml-2 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">{vet.rating}</span>
                              <span className="text-xs text-[hsl(var(--text-secondary))]">({vet.reviewCount})</span>
                            </div>
                          </div>
                          
                          {/* Clinic + Distance */}
                          <div className="flex items-center text-sm text-[hsl(var(--text-secondary))] mb-3">
                            <MapPin className="w-4 h-4 mr-2 text-[hsl(var(--text-secondary))]" />
                            <span className="truncate font-medium">{vet.clinicName}</span>
                            <span className="mx-2 text-[hsl(var(--text-secondary))]">•</span>
                            <span className="font-bold text-[hsl(var(--text-primary))]">{vet.distance} km</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties with attribute-based styling */}
                      <div className="flex flex-wrap gap-2">
                        {vet.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                          <Badge 
                            key={idx} 
                            className="bg-[hsl(var(--info-blue))] text-white px-3 py-1 rounded-full text-sm font-medium"
                            data-tone="info"
                            data-testid={`specialty-${specialty.toLowerCase().replace(' ', '-')}`}
                          >
                            {specialty}
                          </Badge>
                        ))}
                        {vet.emergencyServices && (
                          <Badge 
                            className="bg-[hsl(var(--warning-amber))] text-white px-3 py-1 rounded-full text-sm font-medium"
                            data-tone="warning"
                            role="status"
                            aria-label="24/7 Emergency services available"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            24/7 Emergency
                          </Badge>
                        )}
                      </div>
                      
                      {/* Availability Badge and Hours */}
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                          <span className={`text-sm font-medium ${
                            isOpenNow(vet.workingHours) 
                              ? "text-[hsl(var(--success-green))]" 
                              : "text-[hsl(var(--text-secondary))]"
                          }`}>
                            {getTodayHours(vet.workingHours)}
                          </span>
                          {isOpenNow(vet.workingHours) && (
                            <Badge 
                              className="bg-[hsl(var(--success-green))] text-white px-2 py-0.5 text-xs font-bold rounded-full"
                              data-tone="success"
                              role="status"
                              aria-label="Currently open"
                            >
                              OPEN
                            </Badge>
                          )}
                        </div>
                        {vet.consultationFee && (
                          <span className="text-sm font-bold text-[hsl(var(--text-primary))]">${vet.consultationFee}</span>
                        )}
                      </div>
                      
                      {/* Full-width Main Action Button */}
                      {vet.onlineBooking && vet.bookingUrl ? (
                        <Button 
                          className="w-full bg-[hsl(var(--primary-rose))] hover:bg-[hsl(var(--primary-rose))]/90 text-white min-h-[48px] text-base font-semibold rounded-xl shadow-sm"
                          onClick={() => window.open(vet.bookingUrl!, '_blank')}
                          data-testid={`button-book-${vet.id}`}
                          aria-label={`Book appointment with ${vet.name}`}
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Book Appointment
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-[hsl(var(--primary-rose))] hover:bg-[hsl(var(--primary-rose))]/90 text-white min-h-[48px] text-base font-semibold rounded-xl shadow-sm"
                          onClick={() => window.open(`tel:${vet.phoneNumber}`, '_self')}
                          data-testid={`button-call-${vet.id}`}
                          aria-label={`Call ${vet.name} at ${vet.phoneNumber}`}
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call Now
                        </Button>
                      )}
                      
                      {/* Secondary Action */}
                      <Link href={`/vet-profile/${vet.id}`} className="w-full">
                        <Button 
                          variant="outline" 
                          className="w-full min-h-[44px] border-[hsl(var(--borders-light))] text-[hsl(var(--text-primary))] hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl"
                          data-testid={`button-view-profile-${vet.id}`}
                          aria-label={`View detailed profile for ${vet.name}`}
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State - Mobile optimized */}
          {filteredVeterinarians && filteredVeterinarians.length === 0 && !isLoading && (
            <div className="text-center py-12" role="status" aria-live="polite">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[hsl(var(--borders-light))] p-8 mx-auto max-w-sm">
                <MapPin className="w-16 h-16 mx-auto text-[hsl(var(--text-secondary))] mb-4" />
                <h3 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-3">
                  No veterinarians found
                </h3>
                <p className="text-[hsl(var(--text-secondary))] mb-6 leading-relaxed">
                  Try adjusting your search radius or clearing filters to find more options in your area.
                </p>
                {selectedSpecialties.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSpecialties([])}
                    className="min-h-[44px] border-[hsl(var(--borders-light))] text-[hsl(var(--text-primary))] hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Mobile-First Sort & Filter Bottom Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="max-h-[80vh] bg-white dark:bg-gray-900 border-t border-[hsl(var(--borders-light))]">
          <SheetHeader className="pb-4 border-b border-[hsl(var(--borders-light))]">
            <SheetTitle className="text-xl font-bold text-[hsl(var(--text-primary))]">
              Sort & Filter
            </SheetTitle>
            <SheetDescription className="text-[hsl(var(--text-secondary))]">
              Customize your search results
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Sort Options with 44px tap targets */}
            <div>
              <h4 className="font-semibold text-[hsl(var(--text-primary))] mb-4 text-lg">Sort by</h4>
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
                    className={`w-full justify-start min-h-[44px] px-4 rounded-xl text-base ${
                      sortBy === value 
                        ? "bg-[hsl(var(--primary-rose))] text-white" 
                        : "text-[hsl(var(--text-primary))] hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    data-testid={`sort-option-${value}`}
                    data-tone={sortBy === value ? "info" : "default"}
                    aria-pressed={sortBy === value}
                  >
                    {Icon && <Icon className="w-5 h-5 mr-3" />}
                    {label}
                    {sortBy === value && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Specialty Filters with improved accessibility */}
            {allSpecialties.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-[hsl(var(--text-primary))] text-lg">Specialties</h4>
                  {selectedSpecialties.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedSpecialties([])}
                      className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] min-h-[44px] px-3"
                      data-testid="button-clear-specialty-filters"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
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
                      className={`min-h-[44px] text-base transition-all duration-200 rounded-xl ${
                        selectedSpecialties.includes(specialty)
                          ? "bg-[hsl(var(--primary-rose))] text-white border-[hsl(var(--primary-rose))]"
                          : "bg-white dark:bg-gray-800 text-[hsl(var(--text-primary))] border-[hsl(var(--borders-light))] hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      data-testid={`filter-specialty-${specialty.toLowerCase().replace(' ', '-')}`}
                      data-tone={selectedSpecialties.includes(specialty) ? "info" : "default"}
                      aria-pressed={selectedSpecialties.includes(specialty)}
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Apply button with safe-area padding */}
          <div className="py-4 pb-safe border-t border-[hsl(var(--borders-light))]">
            <Button 
              onClick={() => setShowFilters(false)}
              className="w-full bg-[hsl(var(--primary-rose))] hover:bg-[hsl(var(--primary-rose))]/90 text-white min-h-[48px] font-semibold text-base rounded-xl"
              data-testid="button-apply-filters"
            >
              Apply Filters ({filteredVeterinarians.length} result{filteredVeterinarians.length !== 1 ? 's' : ''})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Persistent Bottom Navigation */}
      <BottomNav />
    </div>
  );
}