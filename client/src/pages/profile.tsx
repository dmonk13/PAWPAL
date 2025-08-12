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
        <header className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 sticky top-0 z-40 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-pink-100 text-sm">Manage your dogs and preferences</p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border-white/30">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-gray-50 to-white">
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
      <header className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-pink-100 text-sm">Manage your dogs and preferences</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border-white/30">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-gray-50 to-white">

        {/* Premium Upgrade Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upgrade to Pro</h3>
                  <p className="text-sm text-gray-600">Unlock premium features</p>
                </div>
              </div>
              <Link href="/premium">
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Star className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">Vet Connect</Badge>
              <Badge variant="secondary" className="text-xs">Unlimited Swipes</Badge>
              <Badge variant="secondary" className="text-xs">Priority Visibility</Badge>
            </div>
          </CardContent>
        </Card>

        {dogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-12 h-12 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Add Your First Dog</h3>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
              Create a profile for your furry friend to start connecting with other dogs in your area!
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
              <Card className="bg-white shadow-md border-0">
                <CardContent className="p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Select Your Dog</h4>
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {dogs.map((dog: any) => (
                      <Button
                        key={dog.id}
                        variant={selectedDog === dog.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDog(dog.id)}
                        className={`whitespace-nowrap transition-all duration-200 ${
                          selectedDog === dog.id 
                            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md" 
                            : "hover:border-pink-300 hover:text-pink-600"
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
              <Card className="bg-white shadow-md border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Personality Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentDog.temperament.map((trait: string, index: number) => (
                      <Badge key={index} className="bg-gradient-to-r from-pink-100 to-red-100 text-pink-700 border-pink-200 px-3 py-1 text-sm font-medium">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main profile card */}
            {currentDog && (
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={currentDog.photos?.[0] || "/placeholder-dog.jpg"}
                        alt={currentDog.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white text-pink-600 p-0 shadow-lg hover:bg-gray-50"
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
                      <p className="text-pink-100 mb-3 text-lg">
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
                          <Badge className="bg-green-500 text-white border-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vet Approved
                          </Badge>
                        )}
                      </div>
                      
                      {/* Additional info row */}
                      <div className="flex items-center space-x-4 text-sm text-pink-100">
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
                    <h4 className="font-bold text-gray-900 mb-2">About {currentDog.name}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {currentDog.bio || "No bio yet. Add one to attract more matches!"}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
              <Card className="bg-white shadow-md border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      Medical Profile
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Vaccinations
                    </h4>
                    {currentDog.medicalProfile.vaccinations?.length > 0 ? (
                      <div className="space-y-2">
                        {currentDog.medicalProfile.vaccinations.map((vax: any, index: number) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="font-medium text-green-800">{vax.type}</div>
                            <div className="text-sm text-green-600">{new Date(vax.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 bg-gray-50 p-3 rounded-lg">No vaccination records</p>
                    )}
                  </div>
                  
                  {currentDog.medicalProfile.allergies?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Allergies</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentDog.medicalProfile.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentDog.medicalProfile.lastVetVisit && (
                    <div>
                      <h4 className="font-semibold mb-2">Last Vet Visit</h4>
                      <p className="text-sm medium-gray">
                        {new Date(currentDog.medicalProfile.lastVetVisit).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {currentDog.medicalProfile.insurance && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        Pet Insurance
                      </h4>
                      <div className="space-y-1 text-sm medium-gray">
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
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
