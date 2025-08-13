import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload, CheckCircle, Heart, AlertTriangle, Shield, Camera, Plus, Trash2, Eye, Sparkles } from "lucide-react";
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

export default function DogProfileForm({ dog, onClose }: DogProfileFormProps) {
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
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'photos' | 'personality' | 'medical'>('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

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
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = e.target?.result as string;
          setPhotos(prev => [...prev, newPhoto]);
          form.setValue("photos", [...photos, newPhoto]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    form.setValue("photos", newPhotos);
  };

  const handlePersonalityChange = (promptId: string, answer: string) => {
    const newAnswers = { ...personalityAnswers, [promptId]: answer };
    setPersonalityAnswers(newAnswers);
    form.setValue("personalityPrompts", newAnswers);
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
      toast({
        title: "Success",
        description: dog?.id ? "Dog profile updated successfully!" : "Dog profile created successfully!",
      });
      onClose();
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
  };

  const addAllergy = () => {
    if (newAllergy && !allergies.includes(newAllergy)) {
      setAllergies([...allergies, newAllergy]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const addCondition = () => {
    if (newCondition && !conditions.includes(newCondition)) {
      setConditions([...conditions, newCondition]);
      setNewCondition("");
    }
  };

  const removeCondition = (condition: string) => {
    setConditions(conditions.filter(c => c !== condition));
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Save dog profile first
      await saveDogMutation.mutateAsync(data);
      
      // Then save medical profile if it has data
      if (dog?.id && (allergies.length > 0 || conditions.length > 0 || hasInsurance)) {
        const medicalData = {
          dogId: dog.id,
          allergies,
          conditions,
          vetClearance: dog.medicalProfile?.vetClearance || false,
          insurance: hasInsurance ? insurance : null,
        };

        if (dog.medicalProfile?.id) {
          await apiRequest("PATCH", `/api/medical-profiles/${dog.medicalProfile.id}`, medicalData);
        } else {
          await apiRequest("POST", "/api/medical-profiles", medicalData);
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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

  const TabButton = ({ tab, label, icon: Icon, isActive }: { tab: string; label: string; icon: any; isActive: boolean }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 ${isActive ? "bg-primary text-white" : "text-gray-600"}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      <div className="bg-white rounded-t-3xl mt-8 flex-1 flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {dog?.id ? "Edit Dog Profile" : "Add Dog Profile"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create an engaging profile to help your pup find their perfect match
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="touch-manipulation min-h-[44px] min-w-[44px]">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            <TabButton tab="basic" label="Basic Info" icon={Heart} isActive={activeTab === 'basic'} />
            <TabButton tab="photos" label="Photos" icon={Camera} isActive={activeTab === 'photos'} />
            <TabButton tab="personality" label="Personality" icon={Sparkles} isActive={activeTab === 'personality'} />
            <TabButton tab="medical" label="Medical" icon={Shield} isActive={activeTab === 'medical'} />
          </div>
        </div>

        {/* Content with Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Form Section */}
          <div className={`${showPreview ? "w-1/2 border-r border-gray-200" : "w-full"} overflow-y-auto overscroll-contain`}>
            <Form {...form}>
              <form id="dog-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Photos Tab */}
                {activeTab === 'photos' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Profile Photos
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Add up to 6 photos to showcase your dog's personality
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Photo Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={photo}
                              alt={`Dog photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removePhoto(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        
                        {photos.length < 6 && (
                          <div
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Add Photo</span>
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      
                      <p className="text-xs text-gray-400">
                        First photo will be your main profile picture. Drag to reorder.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Personality Prompts Tab */}
                {activeTab === 'personality' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Personality & Fun Facts
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Help others get to know your dog's unique personality
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {personalityPrompts.map((prompt) => (
                        <div key={prompt.id} className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            {prompt.question}
                          </Label>
                          <Textarea
                            value={personalityAnswers[prompt.id] || ""}
                            onChange={(e) => handlePersonalityChange(prompt.id, e.target.value)}
                            placeholder={prompt.placeholder}
                            className="min-h-[80px] resize-none"
                            rows={3}
                          />
                        </div>
                      ))}
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                              Pro Tip: Be Creative!
                            </h4>
                            <p className="text-sm text-blue-700">
                              Fun, detailed answers help you stand out and find better matches. 
                              Show off your dog's unique personality!
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dog's name" {...field} />
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
                                <FormLabel>Age (years)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="breed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Breed</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Golden Retriever" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Small">Small</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Large">Large</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your dog's personality and what they love..."
                                  className="resize-none touch-manipulation min-h-[100px]"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Temperament */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Temperament</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Label className="text-sm font-medium mb-4 block">
                          Select traits that describe your dog (choose up to 6)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {temperamentOptions.map((temperament) => (
                            <Button
                              key={temperament}
                              type="button"
                              variant={selectedTemperaments.includes(temperament) ? "default" : "outline"}
                              onClick={() => toggleTemperament(temperament)}
                              disabled={!selectedTemperaments.includes(temperament) && selectedTemperaments.length >= 6}
                              className={`touch-manipulation min-h-[48px] text-sm font-medium ${
                                selectedTemperaments.includes(temperament) 
                                  ? "bg-coral text-white border-coral" 
                                  : "border-2 hover:border-coral hover:text-coral"
                              }`}
                            >
                              {temperament}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Matching Preferences */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Matching Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-3 block">
                            Search Distance ({distanceRadius[0]} miles)
                          </Label>
                          <Slider
                            value={distanceRadius}
                            onValueChange={setDistanceRadius}
                            max={100}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs medium-gray mt-1">
                            <span>1 mi</span>
                            <span>50 mi</span>
                            <span>100 mi</span>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="matingPreference"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Interested in Mating
                                </FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Show your dog to others looking for mating partners
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Medical Tab */}
                {activeTab === 'medical' && (
                  <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Allergies</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add an allergy"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                      />
                      <Button type="button" onClick={addAllergy} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeAllergy(allergy)}
                        >
                          {allergy} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Medical Conditions</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a condition"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      />
                      <Button type="button" onClick={addCondition} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {conditions.map((condition, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeCondition(condition)}
                        >
                          {condition} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Pet Insurance Section */}
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        <Label className="text-sm font-medium">Pet Insurance</Label>
                      </div>
                      <Switch
                        checked={hasInsurance}
                        onCheckedChange={setHasInsurance}
                      />
                    </div>
                    
                    {hasInsurance && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">Insurance Provider</Label>
                            <Input
                              placeholder="e.g., Trupanion, Healthy Paws"
                              value={insurance.provider}
                              onChange={(e) => setInsurance({...insurance, provider: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Policy Number</Label>
                            <Input
                              placeholder="Policy number"
                              value={insurance.policyNumber}
                              onChange={(e) => setInsurance({...insurance, policyNumber: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">Coverage Type</Label>
                            <Select value={insurance.coverageType} onValueChange={(value) => setInsurance({...insurance, coverageType: value})}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select coverage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="accident-only">Accident Only</SelectItem>
                                <SelectItem value="accident-illness">Accident & Illness</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                <SelectItem value="wellness">Wellness</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Coverage Limit</Label>
                            <Input
                              placeholder="e.g., $10,000/year"
                              value={insurance.coverageLimit}
                              onChange={(e) => setInsurance({...insurance, coverageLimit: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">Deductible</Label>
                            <Input
                              placeholder="e.g., $250"
                              value={insurance.deductible}
                              onChange={(e) => setInsurance({...insurance, deductible: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Expiration Date</Label>
                            <Input
                              type="date"
                              value={insurance.expirationDate}
                              onChange={(e) => setInsurance({...insurance, expirationDate: e.target.value})}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600">Contact Number</Label>
                          <Input
                            placeholder="Insurance contact number"
                            value={insurance.contactNumber}
                            onChange={(e) => setInsurance({...insurance, contactNumber: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-mint bg-opacity-10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <Label className="text-sm font-medium">Vet Clearance</Label>
                      </div>
                      <Switch
                        checked={dog?.medicalProfile?.vetClearance || false}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    <p className="text-xs medium-gray mb-3">
                      Upload veterinary documents to verify your dog's health status
                    </p>
                    <Button type="button" variant="outline" size="sm" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Vet Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
                )}

                {/* Bottom spacing for mobile */}
                <div className="h-20"></div>
              </form>
            </Form>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
                <p className="text-sm text-gray-500">See how your profile will look to other users</p>
              </div>
              
              {/* Dog Card Preview */}
              <div className="bg-white rounded-lg shadow-sm border max-w-sm mx-auto">
                {/* Photos */}
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-200">
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
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      +{previewDog.photos.length - 1} more
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{previewDog.name}</h3>
                      <p className="text-sm text-gray-600">
                        {previewDog.breed} • {previewDog.age} {previewDog.age === 1 ? 'year' : 'years'} old
                      </p>
                      <p className="text-sm text-gray-500">{previewDog.gender} • {previewDog.size}</p>
                    </div>
                  </div>

                  {previewDog.bio && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">{previewDog.bio}</p>
                  )}

                  {/* Temperament Tags */}
                  {previewDog.temperament.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {previewDog.temperament.slice(0, 3).map((trait) => (
                        <span
                          key={trait}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                      {previewDog.temperament.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{previewDog.temperament.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Personality Prompts Preview */}
                  {Object.keys(previewDog.personalityPrompts).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(previewDog.personalityPrompts)
                        .slice(0, 2)
                        .map(([promptId, answer]) => {
                          const prompt = personalityPrompts.find(p => p.id === promptId);
                          if (!prompt || !answer) return null;
                          return (
                            <div key={promptId} className="bg-gray-50 p-2 rounded">
                              <p className="text-xs font-medium text-gray-600 mb-1">{prompt.question}</p>
                              <p className="text-xs text-gray-700 line-clamp-2">{answer}</p>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-white">
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 touch-manipulation min-h-[48px]">
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="dog-profile-form"
              className="flex-1 bg-coral text-white hover:bg-coral/90 touch-manipulation min-h-[48px]"
              disabled={saveDogMutation.isPending}
            >
              {saveDogMutation.isPending ? "Saving..." : dog?.id ? "Update Profile" : "Create Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}