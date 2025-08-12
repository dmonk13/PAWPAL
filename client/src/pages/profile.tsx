import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Camera, Heart, Edit3, Plus, MapPin, CheckCircle, Users, Star, Crown, Shield, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/bottom-nav";
import DogProfileForm from "@/components/dog-profile-form";
import { Link } from "wouter";
import { type User } from "@shared/schema";

export default function Profile() {
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDog, setEditingDog] = useState<any>(null);

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Get user's dogs
  const { data: dogs = [], isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "dogs"],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID available');
      const response = await fetch(`/api/users/${user.id}/dogs`);
      if (!response.ok) throw new Error('Failed to fetch user dogs');
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="bg-primary text-primary-foreground p-6 sticky top-0 z-40 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-primary-foreground/80 text-sm">Manage your dogs and preferences</p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/30">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 bg-background">
          <div className="animate-pulse space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentDog = dogs.find((dog: any) => dog.id === selectedDog) || dogs[0];

  return (
    <div className="flex flex-col h-full">
      <header className="bg-primary text-primary-foreground p-6 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-primary-foreground/80 text-sm">Manage your dogs and preferences</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/30">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-4 bg-background">

        {/* Premium Upgrade Card */}
        <Card className="mb-6 bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-accent/10 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-dark">Upgrade to Pro</h3>
                  <p className="text-sm text-secondary-gray">Unlock premium features</p>
                </div>
              </div>
              <Link href="/premium">
                <Button size="sm" className="bg-purple-accent hover:bg-purple-accent/90 text-white">
                  <Star className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-divider text-secondary-gray text-xs">Vet Connect</Badge>
              <Badge className="bg-divider text-secondary-gray text-xs">Unlimited Swipes</Badge>
              <Badge className="bg-divider text-secondary-gray text-xs">Priority Visibility</Badge>
            </div>
          </CardContent>
        </Card>

        {dogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-rose/10 rounded-full flex items-center justify-center shadow-sm">
              <Plus className="w-12 h-12 text-primary-rose" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-primary-dark">Add Your First Dog</h3>
            <p className="text-secondary-gray mb-8 max-w-sm mx-auto leading-relaxed">
              Create a profile for your furry friend to start connecting with other dogs in your area!
            </p>
            <Button 
              size="lg"
              className="bg-primary-rose hover:bg-primary-rose/90 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => setShowEditForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Dog Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dog selector if multiple dogs */}
            {dogs.length > 1 && (
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-bold text-primary-dark mb-3">Select Your Dog</h4>
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {dogs.map((dog: any) => (
                      <Button
                        key={dog.id}
                        variant={selectedDog === dog.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDog(dog.id)}
                        className={`whitespace-nowrap transition-all duration-200 ${
                          selectedDog === dog.id 
                            ? "bg-primary-rose text-white shadow-sm" 
                            : "hover:border-primary-rose/30 hover:text-primary-rose"
                        }`}
                      >
                        {dog.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Temperament section */}
            {currentDog?.temperament && currentDog.temperament.length > 0 && (
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-primary-dark flex items-center">
                    <Star className="w-5 h-5 mr-2 text-coral" />
                    Personality Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentDog.temperament.map((trait: string, index: number) => (
                      <Badge key={index} className="bg-primary-rose/10 text-primary-rose border-primary-rose/20 px-3 py-1 text-sm font-medium">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main profile card */}
            {currentDog && (
              <Card className="bg-card border border-border shadow-sm overflow-hidden">
                <div className="bg-primary-rose p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={currentDog.photos?.[0] || "/placeholder-dog.jpg"}
                        alt={currentDog.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white text-primary-rose p-0 shadow-md hover:bg-card"
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 text-white">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold">{currentDog.name}</h2>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-white hover:bg-white/20 rounded-full"
                          onClick={() => {
                            setEditingDog(currentDog);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit3 className="w-5 h-5" />
                        </Button>
                      </div>
                      <p className="text-white/80 mb-3 text-lg">
                        {currentDog.breed} • {currentDog.age} years • {currentDog.size}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant={currentDog.isActive ? "default" : "secondary"} className="bg-white/20 text-white border-white/30">
                          {currentDog.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {currentDog.medicalProfile?.vaccinations?.length > 0 && (
                          <Badge className="bg-white/20 text-white border-white/30">
                            <Heart className="w-3 h-3 mr-1" />
                            Vaccinated
                          </Badge>
                        )}
                        {currentDog.medicalProfile?.vetClearance && (
                          <Badge className="bg-success text-white border-success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vet Approved
                          </Badge>
                        )}
                      </div>
                      
                      {/* Additional info row */}
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        {currentDog.distanceRadius && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{currentDog.distanceRadius}mi radius</span>
                          </div>
                        )}
                        {currentDog.matingPreference && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Open to mating</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="font-bold text-primary-dark mb-2">About {currentDog.name}</h4>
                    <p className="text-secondary-gray leading-relaxed bg-divider p-4 rounded-lg border border-border">
                      {currentDog.bio || "No bio yet. Add one to attract more matches!"}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary-rose hover:bg-primary-rose/90 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      setEditingDog(currentDog);
                      setShowEditForm(true);
                    }}
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Medical profile section */}
            {currentDog?.medicalProfile && (
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-bold text-primary-dark">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-coral" />
                      Medical Profile
                    </div>
                    <Button variant="ghost" size="sm" className="text-secondary-gray hover:text-primary-dark">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-bold text-primary-dark mb-3 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-success" />
                      Vaccinations
                    </h4>
                    {currentDog.medicalProfile.vaccinations?.length > 0 ? (
                      <div className="space-y-2">
                        {currentDog.medicalProfile.vaccinations.map((vax: any, index: number) => (
                          <div key={index} className="bg-success/5 border border-success/20 rounded-lg p-3">
                            <div className="font-medium text-success">{vax.type}</div>
                            <div className="text-sm text-success/80">{new Date(vax.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary-gray bg-divider p-3 rounded-lg border border-border">No vaccination records</p>
                    )}
                  </div>
                  
                  {currentDog.medicalProfile.allergies?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-primary-dark">Allergies</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentDog.medicalProfile.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} className="bg-error/10 text-error border-error/20">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentDog.medicalProfile.lastVetVisit && (
                    <div>
                      <h4 className="font-semibold mb-2 text-primary-dark">Last Vet Visit</h4>
                      <p className="text-sm text-secondary-gray">
                        {new Date(currentDog.medicalProfile.lastVetVisit).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {currentDog.medicalProfile.insurance && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center text-primary-dark">
                        <Shield className="w-4 h-4 mr-2 text-coral" />
                        Pet Insurance
                      </h4>
                      <div className="space-y-1 text-sm text-secondary-gray">
                        <p><span className="font-medium">Provider:</span> {currentDog.medicalProfile.insurance.provider}</p>
                        <p><span className="font-medium">Coverage:</span> {currentDog.medicalProfile.insurance.coverageType}</p>
                        {currentDog.medicalProfile.insurance.expirationDate && (
                          <p><span className="font-medium">Expires:</span> {new Date(currentDog.medicalProfile.insurance.expirationDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Add new dog button */}
            <Button 
              className="w-full bg-purple-accent hover:bg-purple-accent/90 text-white font-medium py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => setShowEditForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Dog
            </Button>
          </div>
        )}
      </div>
      
      <BottomNav />

      {/* Edit/Add Dog Form */}
      {showEditForm && (
        <DogProfileForm
          dog={editingDog}
          onClose={() => {
            setShowEditForm(false);
            setEditingDog(null);
          }}
        />
      )}
    </div>
  );
}
