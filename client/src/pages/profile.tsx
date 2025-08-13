import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Settings, Camera, Heart, Edit3, Plus, MapPin, CheckCircle, Users, Star, Crown, Shield, PawPrint,
  HelpCircle, MoreVertical, Calendar, FileText, AlertCircle, Clock, Activity, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/bottom-nav";
import DogProfileForm from "@/components/dog-profile-form";
import TraitSelectorModal from "@/components/trait-selector-modal";
import AboutEditor from "@/components/about-editor";
import MedicalModal from "@/components/medical-modal";
import { Link, useLocation } from "wouter";
import { type User } from "@shared/schema";

// Helper function to calculate vaccination status
const getVaccinationStatus = (vax: any) => {
  if (!vax.nextDue) return { status: 'up-to-date', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  
  const nextDue = new Date(vax.nextDue);
  const today = new Date();
  const daysUntil = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle };
  if (daysUntil <= 30) return { status: 'due-soon', color: 'bg-amber-100 text-amber-800', icon: Clock };
  return { status: 'up-to-date', color: 'bg-green-100 text-green-800', icon: CheckCircle };
};

export default function Profile() {
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDog, setEditingDog] = useState<any>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTraitModal, setShowTraitModal] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/signin');
    },
  });

  const handleLogout = () => {
    setShowLogoutDialog(false);
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Minimalist Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-gray-100 rounded-full"
                data-testid="button-help"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </Button>
              <Link href="/settings">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  data-testid="button-settings"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
              <CardContent className="p-4">
                <div className="h-16 bg-pink-100 rounded-lg"></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
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
      {/* Minimalist Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-help"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </Button>
            <Link href="/settings">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-gray-100 rounded-full"
                data-testid="button-settings"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="max-w-md mx-auto space-y-4">

          {/* Premium Upgrade Banner */}
          <Card className="bg-[#FFF8F2] dark:bg-[#0B1020] border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#6B21A8] to-[#F59E0B] p-[1px]">
              <div className="bg-[#FFF8F2] dark:bg-[#0B1020] rounded-lg">
                <CardContent className="px-4 py-6">
                  {/* Header with Crown and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#6B21A8] to-[#F59E0B] rounded-full flex items-center justify-center shadow-md">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          Upgrade to Pro
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Unlock premium features for your pup
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Premium Feature Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 px-3 py-1.5 text-xs font-medium">
                      <Shield className="w-3 h-3 mr-1.5 text-[#D4AF37]" />
                      Vet Connect
                    </Badge>
                    <Badge className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 px-3 py-1.5 text-xs font-medium">
                      <Heart className="w-3 h-3 mr-1.5 text-[#D4AF37]" />
                      Unlimited Swipes
                    </Badge>
                    <Badge className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 px-3 py-1.5 text-xs font-medium">
                      <Star className="w-3 h-3 mr-1.5 text-[#D4AF37]" />
                      Priority Visibility
                    </Badge>
                  </div>

                  {/* Call-to-Action Buttons */}
                  <div className="space-y-3">
                    <Link href="/premium" className="block">
                      <Button 
                        className="w-full h-11 bg-gradient-to-r from-[#6B21A8] to-[#F59E0B] hover:from-[#5B1A8B] hover:to-[#E8890B] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                        data-testid="button-upgrade-pro"
                        aria-label="Upgrade to Pro plan"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        Upgrade Now
                      </Button>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <Link href="/premium" className="block">
                        <Button 
                          variant="ghost" 
                          className="text-[#E94B6E] hover:text-[#D73E5E] hover:bg-pink-50 dark:hover:bg-pink-900/10 font-medium h-auto p-0"
                          data-testid="button-compare-plans"
                          aria-label="Compare all available plans"
                        >
                          Compare Plans
                        </Button>
                      </Link>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Cancel anytime
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          {dogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center shadow-sm">
                <Plus className="w-12 h-12 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Add Your First Dog</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                Create a profile for your furry friend to start connecting with other dogs in your area!
              </p>
              <Button 
                size="lg"
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setShowEditForm(true)}
                data-testid="button-create-dog-profile"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Dog Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dog Switcher - Horizontal scrollable chips */}
              {dogs.length > 1 && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Your Dogs</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowEditForm(true)}
                        className="text-pink-600 hover:bg-pink-50"
                        data-testid="button-add-dog-chip"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
                      {dogs.map((dog: any) => (
                        <Button
                          key={dog.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDog(dog.id)}
                          className={`flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${
                            selectedDog === dog.id || (selectedDog === null && dog === dogs[0])
                              ? "bg-pink-100 text-pink-800 border-b-2 border-pink-600 font-semibold" 
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                          data-testid={`chip-dog-${dog.id}`}
                        >
                          <img 
                            src={dog.photos?.[0] || "/placeholder-dog.jpg"} 
                            alt={dog.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span>{dog.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Primary Dog Card */}
              {currentDog && (
                <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={currentDog.photos?.[0] || "/placeholder-dog.jpg"}
                            alt={currentDog.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            data-testid="img-dog-avatar"
                          />
                          <Button
                            size="sm"
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-pink-600 p-0 shadow-md hover:bg-gray-50"
                            data-testid="button-change-photo"
                            aria-label="Change photo"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-white">
                          <h2 className="text-2xl font-bold mb-1">{currentDog.name}</h2>
                          <p className="text-white/90 text-sm">{currentDog.breed}</p>
                          <div className="flex items-center space-x-3 mt-2 text-white/80 text-sm">
                            <span>{currentDog.age} {currentDog.age === 1 ? 'year' : 'years'}</span>
                            <span>•</span>
                            <span>{currentDog.size}</span>
                            <span>•</span>
                            <span>{currentDog.distanceRadius}km radius</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 text-white hover:bg-white/20 rounded-full"
                        onClick={() => {
                          setEditingDog(currentDog);
                          setShowEditForm(true);
                        }}
                        data-testid="button-menu-options"
                        aria-label="Edit profile"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Status Pills */}
                    <div className="flex space-x-2 mt-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <MapPin className="w-3 h-3 mr-1" />
                        Nearby
                      </Badge>
                      {currentDog.matingPreference && (
                        <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                          <Heart className="w-3 h-3 mr-1" />
                          Looking for love
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Personality Traits */}
              {currentDog && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                        <PawPrint className="w-5 h-5 mr-2 text-pink-600" />
                        Personality Traits
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowTraitModal(true)}
                        data-testid="button-manage-traits"
                      >
                        Manage Traits
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentDog.temperament && currentDog.temperament.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {currentDog.temperament.map((trait: string, index: number) => (
                          <Badge 
                            key={index} 
                            className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1.5 text-sm font-medium rounded-full"
                            data-testid={`trait-${trait.toLowerCase().replace(' ', '-')}`}
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <PawPrint className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No personality traits added yet</p>
                        <p className="text-sm">Help others get to know {currentDog.name} better!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* About Section */}
              {currentDog && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">About {currentDog.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setIsEditingAbout(true)}
                        data-testid="button-edit-about"
                        aria-label="Edit about section"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditingAbout ? (
                      <AboutEditor
                        dogId={currentDog.id}
                        currentBio={currentDog.bio || ""}
                        dogName={currentDog.name}
                        onCancel={() => setIsEditingAbout(false)}
                      />
                    ) : currentDog.bio ? (
                      <Collapsible open={aboutExpanded} onOpenChange={setAboutExpanded}>
                        <div className="text-gray-700 leading-relaxed">
                          <p className={`${!aboutExpanded ? 'line-clamp-2' : ''}`}>
                            {currentDog.bio}
                          </p>
                        </div>
                        {currentDog.bio.length > 100 && (
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 p-0 h-auto text-pink-600 hover:text-pink-700"
                              data-testid="button-read-more"
                            >
                              {aboutExpanded ? 'Show less' : 'Read more...'}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </Collapsible>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No bio added yet</p>
                        <p className="text-sm">Share something special about {currentDog.name}!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Medical Profile - Integrated with Care Details System */}
              {currentDog && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-pink-600" />
                        Medical Profile
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMedicalModal(true)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        data-testid="button-view-medical-profile"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Quick Medical Summary */}
                    <div className="space-y-4">
                      {/* Vaccination Status Summary */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">Vaccination Status</h4>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            1 Overdue
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Rabies vaccination is overdue. Tap to schedule with Vet Connect Premium.
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMedicalModal(true)}
                          className="h-auto p-3 flex flex-col items-center space-y-1 border-2 hover:bg-blue-50"
                          data-testid="button-manage-vaccinations"
                        >
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-medium">Vaccinations</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-auto p-3 flex flex-col items-center space-y-1 border-2 hover:bg-green-50"
                          data-testid="button-schedule-checkup"
                        >
                          <Calendar className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-medium">Checkup</span>
                        </Button>
                      </div>

                      {/* Health Summary */}
                      {currentDog.medicalProfile && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-600 space-y-1">
                            {currentDog.medicalProfile.allergies && currentDog.medicalProfile.allergies.length > 0 && (
                              <div className="flex items-center">
                                <Heart className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                                <span>Allergies: {currentDog.medicalProfile.allergies.slice(0, 2).join(', ')}</span>
                                {currentDog.medicalProfile.allergies.length > 2 && (
                                  <span className="text-gray-500 ml-1">+{currentDog.medicalProfile.allergies.length - 2} more</span>
                                )}
                              </div>
                            )}
                            {currentDog.medicalProfile.vetOnFile && (
                              <div className="flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                                <span>Vet: {currentDog.medicalProfile.vetOnFile.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Logout Button - Profile Specific */}
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200"
                      data-testid="button-logout"
                      aria-label="Log out"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Log Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white">
                        Are you sure you want to log out?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                        You'll need to sign in again to access your account and continue using PupMatch.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel 
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                        data-testid="button-cancel-logout"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                        data-testid="button-confirm-logout"
                        disabled={logoutMutation.isPending}
                      >
                        {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            </div>
          )}
        </div>
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

      {/* Trait Selector Modal */}
      {currentDog && (
        <TraitSelectorModal
          isOpen={showTraitModal}
          onClose={() => setShowTraitModal(false)}
          dogId={currentDog.id}
          currentTraits={currentDog.temperament || []}
          dogName={currentDog.name}
        />
      )}

      {/* Medical Modal - Unified Care Details & Scheduling Flow */}
      {currentDog && (
        <MedicalModal
          isOpen={showMedicalModal}
          onClose={() => setShowMedicalModal(false)}
          dogId={currentDog.id}
          dogName={currentDog.name}
        />
      )}
    </div>
  );
}