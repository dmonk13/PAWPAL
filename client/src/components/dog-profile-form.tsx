import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload, CheckCircle, Heart, AlertTriangle } from "lucide-react";
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

const formSchema = insertDogSchema.extend({
  temperament: z.array(z.string()).default([]),
  matingPreference: z.boolean().default(false),
  distanceRadius: z.number().min(1).max(100).default(10),
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
      matingPreference: dog?.matingPreference || false,
      distanceRadius: dog?.distanceRadius || 10,
      latitude: dog?.latitude || null,
      longitude: dog?.longitude || null,
      isActive: dog?.isActive !== false,
    },
  });

  const saveDogMutation = useMutation({
    mutationFn: async (data: any) => {
      const dogData = {
        ...data,
        temperament: selectedTemperaments,
        distanceRadius: distanceRadius[0],
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    saveDogMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="bg-white rounded-2xl max-w-2xl mx-auto">
          <div className="sticky top-0 bg-white rounded-t-2xl border-b p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold dark-gray">
              {dog?.id ? "Edit Dog Profile" : "Add Dog Profile"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
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
                            className="resize-none"
                            {...field}
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
                  <Label className="text-sm font-medium mb-3 block">
                    Select traits that describe your dog (choose up to 6)
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {temperamentOptions.map((temperament) => (
                      <Button
                        key={temperament}
                        type="button"
                        variant={selectedTemperaments.includes(temperament) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTemperament(temperament)}
                        disabled={!selectedTemperaments.includes(temperament) && selectedTemperaments.length >= 6}
                        className={selectedTemperaments.includes(temperament) ? "bg-coral text-white" : ""}
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

              {/* Medical Information */}
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

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-coral text-white hover:bg-coral/90"
                  disabled={saveDogMutation.isPending}
                >
                  {saveDogMutation.isPending ? "Saving..." : dog?.id ? "Update Profile" : "Create Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}