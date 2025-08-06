import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PawPrint, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const dogSchema = z.object({
  name: z.string().min(2, "Pet name must be at least 2 characters"),
  breed: z.string().min(2, "Please specify the breed"),
  age: z.number().min(0, "Age must be 0 or greater").max(30, "Please enter a valid age"),
  gender: z.enum(["Male", "Female"]),
  size: z.enum(["Small", "Medium", "Large"]),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  temperament: z.array(z.string()).min(1, "Select at least one temperament trait"),
  matingPreference: z.boolean(),
  distanceRadius: z.number().min(1, "Distance must be at least 1 km").max(100, "Distance cannot exceed 100 km"),
});

type UserForm = z.infer<typeof userSchema>;
type DogForm = z.infer<typeof dogSchema>;

interface RegisterProps {
  onLoginSuccess: () => void;
  onSwitchToLogin: () => void;
}

const temperamentOptions = [
  "Playful", "Energetic", "Friendly", "Calm", "Affectionate", "Intelligent", 
  "Loyal", "Protective", "Social", "Independent", "Curious", "Gentle",
  "Athletic", "Easy-going", "Alert", "Obedient", "Water-loving", "Brave"
];

export default function Register({ onLoginSuccess, onSwitchToLogin }: RegisterProps) {
  const [step, setStep] = useState(1); // 1: User Info, 2: Pet Info
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const dogForm = useForm<DogForm>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      breed: "",
      age: 1,
      gender: "Male",
      size: "Medium",
      bio: "",
      temperament: [],
      matingPreference: false,
      distanceRadius: 15,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { user: UserForm; dog: DogForm }) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to PupMatch!",
        description: "Your account and pet profile have been created successfully.",
      });
      onLoginSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    const isValid = await userForm.trigger();
    if (isValid) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    const userValid = await userForm.trigger();
    const dogValid = await dogForm.trigger();
    
    if (userValid && dogValid) {
      const userData = userForm.getValues();
      const dogData = dogForm.getValues();
      registerMutation.mutate({ user: userData, dog: dogData });
    }
  };

  const toggleTemperament = (trait: string) => {
    const currentTraits = dogForm.getValues("temperament");
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    dogForm.setValue("temperament", newTraits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
            {step === 1 ? "Create Account" : "Tell Us About Your Pup"}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? "Join PupMatch to find your pet's perfect companion" : "Help us create the perfect profile for your dog"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`h-1 w-12 ${step >= 2 ? 'bg-pink-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              {step === 1 ? "Your Information" : "Pet Profile"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {step === 1 ? "Step 1 of 2: Create your account" : "Step 2 of 2: Add your pet's details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              // Step 1: User Information
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    {...userForm.register("username")}
                  />
                  {userForm.formState.errors.username && (
                    <p className="text-sm text-red-500">{userForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    {...userForm.register("email")}
                  />
                  {userForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{userForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500 pr-10"
                      {...userForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {userForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{userForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500 pr-10"
                      {...userForm.register("confirmPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {userForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{userForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full h-11 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-medium shadow-lg transition-all duration-200"
                >
                  Next: Pet Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              // Step 2: Pet Information
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Pet Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Buddy"
                      className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                      {...dogForm.register("name")}
                    />
                    {dogForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{dogForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed" className="text-sm font-medium text-gray-700">
                      Breed *
                    </Label>
                    <Input
                      id="breed"
                      type="text"
                      placeholder="e.g. Golden Retriever"
                      className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                      {...dogForm.register("breed")}
                    />
                    {dogForm.formState.errors.breed && (
                      <p className="text-sm text-red-500">{dogForm.formState.errors.breed.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                      Age (years) *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="30"
                      className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                      {...dogForm.register("age", { valueAsNumber: true })}
                    />
                    {dogForm.formState.errors.age && (
                      <p className="text-sm text-red-500">{dogForm.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Gender *</Label>
                    <Select onValueChange={(value) => dogForm.setValue("gender", value as "Male" | "Female")}>
                      <SelectTrigger className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Size *</Label>
                    <Select onValueChange={(value) => dogForm.setValue("size", value as "Small" | "Medium" | "Large")}>
                      <SelectTrigger className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    About Your Pet *
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your pet's personality, favorite activities, and what makes them special..."
                    className="border-gray-200 focus:border-pink-500 focus:ring-pink-500 min-h-[80px]"
                    {...dogForm.register("bio")}
                  />
                  {dogForm.formState.errors.bio && (
                    <p className="text-sm text-red-500">{dogForm.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Temperament Traits *</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {temperamentOptions.map((trait) => (
                      <label key={trait} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={dogForm.watch("temperament")?.includes(trait) || false}
                          onCheckedChange={() => toggleTemperament(trait)}
                        />
                        <span className="text-sm">{trait}</span>
                      </label>
                    ))}
                  </div>
                  {dogForm.formState.errors.temperament && (
                    <p className="text-sm text-red-500">{dogForm.formState.errors.temperament.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Looking for Breeding?</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={dogForm.watch("matingPreference") || false}
                        onCheckedChange={(checked) => dogForm.setValue("matingPreference", !!checked)}
                      />
                      <span className="text-sm">Yes, open to breeding</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distanceRadius" className="text-sm font-medium text-gray-700">
                      Search Radius (km) *
                    </Label>
                    <Input
                      id="distanceRadius"
                      type="number"
                      min="1"
                      max="100"
                      className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                      {...dogForm.register("distanceRadius", { valueAsNumber: true })}
                    />
                    {dogForm.formState.errors.distanceRadius && (
                      <p className="text-sm text-red-500">{dogForm.formState.errors.distanceRadius.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={registerMutation.isPending}
                    className="flex-1 h-11 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-medium shadow-lg transition-all duration-200"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </>
            )}

            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-medium text-pink-600 hover:text-pink-500 transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}