import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Camera, Heart, Edit3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/bottom-nav";

const CURRENT_USER_ID = "user-1";

export default function Profile() {
  const [selectedDog, setSelectedDog] = useState<string | null>(null);

  const { data: dogs = [], isLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "dogs"],
  });

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen p-4 pb-20">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold dark-gray">Profile</h1>
              <p className="medium-gray">Manage your dog's profiles</p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </header>
          
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
      </>
    );
  }

  const currentDog = dogs.find((dog: any) => dog.id === selectedDog) || dogs[0];

  return (
    <>
      <div className="min-h-screen p-4 pb-20">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold dark-gray">Profile</h1>
            <p className="medium-gray">Manage your dog's profiles</p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </header>

        {dogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 medium-gray" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark-gray">Add Your First Dog</h3>
            <p className="medium-gray mb-6">
              Create a profile for your dog to start matching with other pups!
            </p>
            <Button className="bg-coral text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Dog Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dog selector if multiple dogs */}
            {dogs.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {dogs.map((dog: any) => (
                  <Button
                    key={dog.id}
                    variant={selectedDog === dog.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDog(dog.id)}
                    className="whitespace-nowrap"
                  >
                    {dog.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Main profile card */}
            {currentDog && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={currentDog.photos?.[0] || "/placeholder-dog.jpg"}
                        alt={currentDog.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-coral text-white p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-xl font-bold dark-gray">{currentDog.name}</h2>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="medium-gray mb-2">
                        {currentDog.breed} • {currentDog.age} years • {currentDog.size}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={currentDog.isActive ? "default" : "secondary"}>
                          {currentDog.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {currentDog.medicalProfile?.vaccinations?.length > 0 && (
                          <Badge variant="secondary">
                            <Heart className="w-3 h-3 mr-1" />
                            Vaccinated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm medium-gray mb-4">
                    {currentDog.bio || "No bio yet. Add one to attract more matches!"}
                  </p>
                  
                  <Button variant="outline" className="w-full">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Medical profile section */}
            {currentDog?.medicalProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Medical Profile</span>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Vaccinations</h4>
                    {currentDog.medicalProfile.vaccinations?.length > 0 ? (
                      <div className="space-y-1">
                        {currentDog.medicalProfile.vaccinations.map((vax: any, index: number) => (
                          <div key={index} className="text-sm medium-gray">
                            {vax.type} - {new Date(vax.date).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm medium-gray">No vaccination records</p>
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
                </CardContent>
              </Card>
            )}

            {/* Add new dog button */}
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Dog
            </Button>
          </div>
        )}
      </div>
      
      <BottomNav />
    </>
  );
}
