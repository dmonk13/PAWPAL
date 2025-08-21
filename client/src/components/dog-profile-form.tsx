import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload, CheckCircle, Heart, AlertTriangle, Shield, Camera, Plus, Trash2, Eye, Sparkles, AlertCircle, ChevronRight, ChevronLeft, Search, Minus } from "lucide-react";
import { insertDogSchema, insertMedicalProfileSchema, type Dog, type MedicalProfile } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DogProfileFormProps {
  dog?: Dog & { medicalProfile?: MedicalProfile };
  onClose: () => void;
}

const temperamentOptions = [
  "Playful", "Energetic", "Calm", "Friendly", "Shy", "Aggressive", 
  "Intelligent", "Curious", "Loyal", "Independent", "Social", "Protective",
  "Gentle", "Active", "Relaxed", "Alert", "Affectionate", "Focused"
];

const personalityPrompts = [
  {
    id: "favorite_activity",
    question: "What's your dog's favorite way to spend a sunny afternoon?",
    placeholder: "e.g., Chasing tennis balls at the park or napping in sunbeams"
  },
  {
    id: "best_friend_type", 
    question: "What type of dog would be your pup's ideal best friend?",
    placeholder: "e.g., A calm companion for gentle walks or an energetic buddy for adventures"
  },
  {
    id: "unique_quirk",
    question: "What's the most adorable quirk or habit your dog has?",
    placeholder: "e.g., Tilts head when confused or always steals socks"
  },
  {
    id: "dream_date",
    question: "Describe your dog's perfect playdate:",
    placeholder: "e.g., Beach day with fetch and lots of treats"
  }
];

const formSchema = insertDogSchema.extend({
  temperament: z.array(z.string()).default([]),
  matingPreference: z.boolean().default(false),
  distanceRadius: z.number().min(1).max(100).default(10),
  personalityPrompts: z.record(z.string()).optional(),
});

const medicalSchema = insertMedicalProfileSchema.extend({
  vetClearance: z.boolean().default(false),
  vetClearanceDate: z.string().optional(),
  vetDocumentUrl: z.string().optional(),
});

const steps = ['basic', 'photos', 'personality', 'medical'] as const;
type Step = typeof steps[number];

const stepLabels = {
  basic: 'Basic',
  photos: 'Photos', 
  personality: 'Personality',
  medical: 'Medical'
};

export default function DogProfileForm({ dog, onClose }: DogProfileFormProps) {
  // Main view state
  const [currentView, setCurrentView] = useState<'edit' | 'preview'>('edit');
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  
  // Form state
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>(
    dog?.temperament || []
  );
  const [allergies, setAllergies] = useState<string[]>(
    dog?.medicalProfile?.allergies || []
  );
  const [conditions, setConditions] = useState<string[]>(
    dog?.medicalProfile?.conditions || []
  );
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [distanceRadius, setDistanceRadius] = useState([dog?.distanceRadius || 10]);
  const [insurance, setInsurance] = useState({
    provider: dog?.medicalProfile?.insurance?.provider || "",
    policyNumber: dog?.medicalProfile?.insurance?.policyNumber || "",
    coverageType: dog?.medicalProfile?.insurance?.coverageType || "",
    coverageLimit: dog?.medicalProfile?.insurance?.coverageLimit || "",
    deductible: dog?.medicalProfile?.insurance?.deductible || "",
    expirationDate: dog?.medicalProfile?.insurance?.expirationDate || "",
    contactNumber: dog?.medicalProfile?.insurance?.contactNumber || "",
  });
  const [hasInsurance, setHasInsurance] = useState(!!dog?.medicalProfile?.insurance?.provider);
  const [photos, setPhotos] = useState<string[]>(dog?.photos || []);
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string>>(
    dog?.personalityPrompts || {}
  );
  
  // Progress and save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load persisted tab preference
  useEffect(() => {
    const savedTab = localStorage.getItem('profileFormLastTab') as 'edit' | 'preview';
    if (savedTab) {
      setCurrentView(savedTab);
    }
  }, []);

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem('profileFormLastTab', currentView);
  }, [currentView]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerId: dog?.ownerId || "user-1",
      name: dog?.name || "",
      breed: dog?.breed || "",
      age: dog?.age || 1,
      gender: dog?.gender || "",
      size: dog?.size || "",
      bio: dog?.bio || "",
      photos: dog?.photos || [],
      temperament: dog?.temperament || [],
      personalityPrompts: dog?.personalityPrompts || {},
      matingPreference: dog?.matingPreference || false,
      distanceRadius: dog?.distanceRadius || 10,
      latitude: dog?.latitude || null,
      longitude: dog?.longitude || null,
      isActive: dog?.isActive !== false,
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && photos.length < 6) {
      Array.from(files).slice(0, 6 - photos.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = e.target?.result as string;
          setPhotos(prev => [...prev, newPhoto]);
          form.setValue("photos", [...photos, newPhoto]);
          setHasUnsavedChanges(true);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    form.setValue("photos", newPhotos);
    setHasUnsavedChanges(true);
  };

  const handlePersonalityChange = (promptId: string, answer: string) => {
    const newAnswers = { ...personalityAnswers, [promptId]: answer };
    setPersonalityAnswers(newAnswers);
    form.setValue("personalityPrompts", newAnswers);
    setHasUnsavedChanges(true);
  };

  // Step navigation
  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  // Age stepper handlers
  const incrementAge = () => {
    const currentAge = form.getValues('age');
    if (currentAge < 20) {
      form.setValue('age', currentAge + 1);
      setHasUnsavedChanges(true);
    }
  };

  const decrementAge = () => {
    const currentAge = form.getValues('age');
    if (currentAge > 0) {
      form.setValue('age', currentAge - 1);
      setHasUnsavedChanges(true);
    }
  };

  const saveDogMutation = useMutation({
    mutationFn: async (data: any) => {
      const dogData = {
        ...data,
        temperament: selectedTemperaments,
        distanceRadius: distanceRadius[0],
        photos,
        personalityPrompts: personalityAnswers,
      };

      if (dog?.id) {
        const response = await apiRequest("PATCH", `/api/dogs/${dog.id}`, dogData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/dogs", dogData);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      // Don't automatically close the form - let the onSubmit function handle closing
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save dog profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleTemperament = (temperament: string) => {
    setSelectedTemperaments(prev => 
      prev.includes(temperament)
        ? prev.filter(t => t !== temperament)
        : [...prev, temperament]
    );
    setHasUnsavedChanges(true);
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      const trimmedAllergy = newAllergy.trim();
      setAllergies([...allergies, trimmedAllergy]);
      setNewAllergy("");
      setHasUnsavedChanges(true);
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
    setHasUnsavedChanges(true);
  };

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      const trimmedCondition = newCondition.trim();
      setConditions([...conditions, trimmedCondition]);
      setNewCondition("");
      setHasUnsavedChanges(true);
    }
  };

  const removeCondition = (condition: string) => {
    setConditions(conditions.filter(c => c !== condition));
    setHasUnsavedChanges(true);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Save dog profile first
      const savedDog = await saveDogMutation.mutateAsync(data);
      const dogId = savedDog?.id || dog?.id;
      
      // Then save medical profile if it has data
      if (dogId && (allergies.length > 0 || conditions.length > 0 || hasInsurance)) {
        const medicalData = {
          dogId: dogId,
          allergies,
          conditions,
          vetClearance: dog?.medicalProfile?.vetClearance || false,
          insurance: hasInsurance ? insurance : null,
        };

        if (dog?.medicalProfile?.id) {
          await apiRequest("PATCH", `/api/medical-profiles/${dog.medicalProfile.id}`, medicalData);
        } else {
          await apiRequest("POST", `/api/dogs/${dogId}/medical`, medicalData);
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      }

      // Only close the form if we're on the final medical step
      if (currentStep === 'medical') {
        toast({
          title: "Success",
          description: dog?.id ? "Dog profile updated successfully!" : "Dog profile created successfully!",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create preview dog object based on current form data
  const previewDog = {
    id: dog?.id || "preview",
    name: form.watch("name") || "Unnamed Pup",
    breed: form.watch("breed") || "Unknown Breed",
    age: form.watch("age") || 1,
    gender: form.watch("gender") || "",
    size: form.watch("size") || "",
    bio: form.watch("bio") || "",
    photos: photos,
    temperament: selectedTemperaments,
    personalityPrompts: personalityAnswers,
    distanceRadius: distanceRadius[0],
  };

  const StepChip = ({ step, label, isActive, isCompleted }: { 
    step: Step; 
    label: string; 
    isActive: boolean; 
    isCompleted: boolean;
  }) => (
    <button
      type="button"
      onClick={() => goToStep(step)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[#FF6B6B] text-white shadow-sm'
          : isCompleted 
          ? 'bg-[#4ECDC4] text-white'
          : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-[#F7F8FB] w-full h-full md:rounded-xl md:max-w-4xl md:h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header with Segmented Control */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {dog?.id ? "Edit Profile" : "Create Dog Profile"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Segmented Control */}
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setCurrentView('edit')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setCurrentView('preview')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'edit' ? (
            <div className="h-full flex flex-col">
              {/* Step Navigation */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 overflow-x-auto">
                  {steps.map((step, index) => (
                    <StepChip
                      key={step}
                      step={step}
                      label={stepLabels[step]}
                      isActive={currentStep === step}
                      isCompleted={steps.indexOf(currentStep) > index}
                    />
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <Form {...form}>
                  <form id="dog-profile-form" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Basic Step */}
                    {currentStep === 'basic' && (
                      <Card className="border-0 bg-white rounded-2xl shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Heart className="w-5 h-5 text-[#FF6B6B]" />
                            Basic Information
                          </CardTitle>
                          <p className="text-sm text-gray-500">Essential details about your pup</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Name & Age Row */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Buddy" 
                                      {...field} 
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="rounded-lg border-gray-300 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="age"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Age (years)</FormLabel>
                                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={decrementAge}
                                      disabled={field.value <= 0}
                                      className="h-8 w-8 p-0 hover:bg-gray-200"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        field.onChange(value);
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="flex-1 text-center border-0 bg-transparent focus:ring-0 font-medium"
                                      min={0}
                                      max={20}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={incrementAge}
                                      disabled={field.value >= 20}
                                      className="h-8 w-8 p-0 hover:bg-gray-200"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Breed with Search */}
                          <FormField
                            control={form.control}
                            name="breed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Breed</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input 
                                      placeholder="e.g., Golden Retriever" 
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="pl-10 rounded-lg border-gray-300 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Gender & Size Pills */}
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Gender</FormLabel>
                                  <div className="flex gap-2">
                                    {['Male', 'Female'].map((gender) => (
                                      <button
                                        key={gender}
                                        type="button"
                                        onClick={() => {
                                          field.onChange(gender);
                                          setHasUnsavedChanges(true);
                                        }}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                          field.value === gender
                                            ? 'bg-[#FF6B6B] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {gender}
                                      </button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="size"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Size</FormLabel>
                                  <Select value={field.value} onValueChange={(value) => {
                                    field.onChange(value);
                                    setHasUnsavedChanges(true);
                                  }}>
                                    <SelectTrigger className="rounded-lg border-gray-300 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]">
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Small">Small</SelectItem>
                                      <SelectItem value="Medium">Medium</SelectItem>
                                      <SelectItem value="Large">Large</SelectItem>
                                      <SelectItem value="Extra Large">Extra Large</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Photos Step */}
                    {currentStep === 'photos' && (
                      <Card className="border-0 bg-white rounded-2xl shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Camera className="w-5 h-5 text-[#FF6B6B]" />
                            Profile Photos
                          </CardTitle>
                          <p className="text-sm text-gray-500">Add up to 6 photos to showcase personality</p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            {photos.map((photo, index) => (
                              <div key={index} className="relative aspect-square">
                                <img
                                  src={photo}
                                  alt={`Dog photo ${index + 1}`}
                                  className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => removePhoto(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            
                            {photos.length < 6 && (
                              <div
                                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B6B] hover:bg-red-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 font-medium">Add Photo</span>
                              </div>
                            )}
                          </div>
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Personality Step */}
                    {currentStep === 'personality' && (
                      <Card className="border-0 bg-white rounded-2xl shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-[#FF6B6B]" />
                            Personality Traits
                          </CardTitle>
                          <p className="text-sm text-gray-500">Select traits that best describe your pup</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {temperamentOptions.slice(0, 12).map((trait) => (
                              <button
                                key={trait}
                                type="button"
                                onClick={() => toggleTemperament(trait)}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                  selectedTemperaments.includes(trait)
                                    ? 'bg-[#FF6B6B] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {trait}
                                {selectedTemperaments.includes(trait) && (
                                  <span className="ml-1 bg-white/20 rounded-full px-1 text-xs">
                                    {selectedTemperaments.indexOf(trait) + 1}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                          
                          {selectedTemperaments.length > 0 && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <p className="text-sm text-red-700">
                                <span className="font-medium">{selectedTemperaments.length}</span> traits selected
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Medical Step */}
                    {currentStep === 'medical' && (
                      <Card className="border-0 bg-white rounded-2xl shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="w-5 h-5 text-[#FF6B6B]" />
                            Medical Information
                          </CardTitle>
                          <p className="text-sm text-gray-500">Optional health details for safety</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Allergies */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Known Allergies</Label>
                            <div className="flex gap-2 mb-2">
                              <Input
                                placeholder="Add allergies (comma-separated)"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                                className="rounded-lg border-gray-300 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]"
                              />
                              <Button type="button" onClick={addAllergy} size="sm" className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/90">
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {allergies.map((allergy, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer bg-red-100 text-red-800 hover:bg-red-200"
                                  onClick={() => removeAllergy(allergy)}
                                >
                                  {allergy} ✕
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Medical Conditions */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Medical Conditions</Label>
                            <div className="flex gap-2 mb-2">
                              <Input
                                placeholder="Add conditions (comma-separated)"
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                                className="rounded-lg border-gray-300 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]"
                              />
                              <Button type="button" onClick={addCondition} size="sm" className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/90">
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {conditions.map((condition, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  onClick={() => removeCondition(condition)}
                                >
                                  {condition} ✕
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </form>
                </Form>
              </div>

              {/* Step Navigation Footer */}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 'basic'}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentStep !== 'medical' ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white flex items-center gap-2 min-h-[44px] px-6"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        form="dog-profile-form"
                        className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 text-white min-h-[44px] px-6"
                        disabled={saveDogMutation.isPending}
                      >
                        {saveDogMutation.isPending ? "Saving..." : dog?.id ? "Update Profile" : "Create Profile"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>


            </div>
          ) : (
            /* Preview View */
            <div className="h-full bg-[#F7F8FB] flex items-center justify-center p-4">
              <div className="max-w-sm w-full">
                <div className="mb-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
                  <p className="text-sm text-gray-500">See how your profile will look to other users</p>
                </div>
                
                {/* Dog Card Preview */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  {/* Photos */}
                  <div className="aspect-square relative overflow-hidden rounded-t-2xl bg-gray-200">
                    {previewDog.photos.length > 0 ? (
                      <img
                        src={previewDog.photos[0]}
                        alt={previewDog.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {previewDog.photos.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        +{previewDog.photos.length - 1} more
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{previewDog.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {previewDog.breed} • {previewDog.age} {previewDog.age === 1 ? 'year' : 'years'} old
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{previewDog.gender} • {previewDog.size}</p>
                    </div>

                    {previewDog.bio && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3">{previewDog.bio}</p>
                    )}

                    {/* Temperament Tags */}
                    {previewDog.temperament.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {previewDog.temperament.slice(0, 3).map((trait) => (
                          <span
                            key={trait}
                            className="px-3 py-1 bg-red-50 text-[#FF6B6B] text-xs font-medium rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                        {previewDog.temperament.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{previewDog.temperament.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}