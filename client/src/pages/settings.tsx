import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, Shield, Heart, MapPin, Edit, Navigation } from "lucide-react";
import BottomNav from "@/components/bottom-nav";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [returnPath, setReturnPath] = useState("/profile");
  const [searchRadius, setSearchRadius] = useState([25]);
  const [currentLocation, setCurrentLocation] = useState("New York, NY");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if we came from discover page
    const storedReturnPath = localStorage.getItem('settingsReturnPath');
    if (storedReturnPath) {
      setReturnPath(storedReturnPath);
      // Clear the stored path after using it
      localStorage.removeItem('settingsReturnPath');
    }
    
    // Load saved preferences
    const savedRadius = localStorage.getItem('searchRadius');
    const savedLocation = localStorage.getItem('currentLocation');
    
    if (savedRadius) {
      setSearchRadius([parseInt(savedRadius)]);
    }
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href={returnPath}>
            <Button variant="ghost" size="sm" className="p-2" data-testid="settings-back-button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Push Notifications</span>
                  <span className="text-sm text-gray-500">Get notified about new matches</span>
                </Label>
                <Switch id="push-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="text-sm text-gray-500">Receive updates via email</span>
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="message-notifications" className="flex flex-col space-y-1">
                  <span>Message Notifications</span>
                  <span className="text-sm text-gray-500">Get notified about new messages</span>
                </Label>
                <Switch id="message-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Safety */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <CardTitle>Privacy & Safety</CardTitle>
              </div>
              <CardDescription>
                Control your privacy and safety settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="location-sharing" className="flex flex-col space-y-1">
                  <span>Location Sharing</span>
                  <span className="text-sm text-gray-500">Allow location-based matching</span>
                </Label>
                <Switch id="location-sharing" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility" className="flex flex-col space-y-1">
                  <span>Profile Visibility</span>
                  <span className="text-sm text-gray-500">Show your profile to other users</span>
                </Label>
                <Switch id="profile-visibility" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="incognito-mode" className="flex flex-col space-y-1">
                  <span>Incognito Mode</span>
                  <span className="text-sm text-gray-500">Browse without being seen</span>
                </Label>
                <Switch id="incognito-mode" />
              </div>
            </CardContent>
          </Card>

          {/* Matching Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <CardTitle>Matching Preferences</CardTitle>
              </div>
              <CardDescription>
                Customize your matching experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="breed-match" className="flex flex-col space-y-1">
                  <span>Match by Breed</span>
                  <span className="text-sm text-gray-500">Only show dogs of the same breed</span>
                </Label>
                <Switch id="breed-match" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-distance" className="flex flex-col space-y-1">
                  <span>Show Distance</span>
                  <span className="text-sm text-gray-500">Display distance in profiles</span>
                </Label>
                <Switch id="show-distance" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <CardTitle>Location Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your location preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Search Radius</Label>
                  <span className="text-sm font-medium text-gray-900">{searchRadius[0]} miles</span>
                </div>
                <Slider
                  value={searchRadius}
                  onValueChange={(value) => {
                    setSearchRadius(value);
                    localStorage.setItem('searchRadius', value[0].toString());
                    toast({
                      title: "Search radius updated",
                      description: `Now searching within ${value[0]} miles`
                    });
                  }}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 mile</span>
                  <span>100 miles</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Current Location</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isEditingLocation) {
                        // Save the location
                        if (tempLocation.trim()) {
                          setCurrentLocation(tempLocation.trim());
                          localStorage.setItem('currentLocation', tempLocation.trim());
                          toast({
                            title: "Location updated",
                            description: `Location set to ${tempLocation.trim()}`
                          });
                        }
                        setIsEditingLocation(false);
                        setTempLocation("");
                      } else {
                        // Start editing
                        setTempLocation(currentLocation);
                        setIsEditingLocation(true);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {isEditingLocation ? 'Save' : 'Edit'}
                  </Button>
                </div>
                
                {isEditingLocation ? (
                  <div className="space-y-2">
                    <Input
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      placeholder="Enter city, state or address"
                      className="w-full"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (tempLocation.trim()) {
                            setCurrentLocation(tempLocation.trim());
                            localStorage.setItem('currentLocation', tempLocation.trim());
                            toast({
                              title: "Location updated",
                              description: `Location set to ${tempLocation.trim()}`
                            });
                          }
                          setIsEditingLocation(false);
                          setTempLocation("");
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if ('geolocation' in navigator) {
                          try {
                            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                              navigator.geolocation.getCurrentPosition(resolve, reject);
                            });
                            
                            // In a real app, you'd reverse geocode these coordinates
                            // For now, we'll just show coordinates
                            const locationString = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                            setTempLocation(locationString);
                            
                            toast({
                              title: "Location detected",
                              description: "Using your current GPS location"
                            });
                          } catch (error) {
                            toast({
                              title: "Location access denied",
                              description: "Please enter your location manually",
                              variant: "destructive"
                            });
                          }
                        } else {
                          toast({
                            title: "GPS not available",
                            description: "Please enter your location manually",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="w-full"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Use Current GPS Location
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-900">{currentLocation}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Delete Account
              </Button>
              <Separator />
              <div className="text-xs text-gray-500 text-center">
                PupMatch v1.0.0
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}