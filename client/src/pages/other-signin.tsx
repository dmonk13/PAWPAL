import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone,
  Smartphone,
  Zap,
  AlertTriangle
} from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Schemas for different auth methods
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const phoneSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;

interface OtherSignInProps {
  onLoginSuccess?: () => void;
}

export default function OtherSignIn({ onLoginSuccess }: OtherSignInProps) {
  const [, setLocation] = useLocation();
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [lastUsedProvider, setLastUsedProvider] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for last used provider
  useEffect(() => {
    const lastProvider = localStorage.getItem('pawpal_last_provider');
    setLastUsedProvider(lastProvider);
    
    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'auth_other_screen_view', {
        event_category: 'authentication',
        event_label: 'other_signin_methods'
      });
    }
  }, []);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  // Email magic link mutation
  const magicLinkMutation = useMutation({
    mutationFn: async (data: EmailForm) => {
      return await apiRequest("POST", "/api/auth/magic-link", data);
    },
    onSuccess: () => {
      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
        duration: 5000,
      });
      setActiveMethod(null);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to send magic link");
    },
  });

  // Phone OTP mutation (placeholder - needs backend implementation)
  const phoneOtpMutation = useMutation({
    mutationFn: async (data: PhoneForm) => {
      // This would be implemented when backend supports OTP
      return await apiRequest("POST", "/api/auth/phone-otp", data);
    },
    onSuccess: () => {
      toast({
        title: "Verification code sent!",
        description: "Check your phone for the verification code.",
        duration: 5000,
      });
      setActiveMethod(null);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to send verification code");
    },
  });

  const handleProviderAuth = async (provider: string) => {
    setLoadingProvider(provider);
    setError(null);
    
    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'auth_other_method_select', {
        event_category: 'authentication',
        event_label: provider,
        method: provider
      });
    }

    try {
      if (provider === 'quick') {
        if (lastUsedProvider) {
          await handleProviderAuth(lastUsedProvider);
          return;
        } else {
          // Show provider picker if no last used provider
          setError("No previous sign-in method found. Please choose a method below.");
          setLoadingProvider(null);
          return;
        }
      }

      if (provider === 'facebook') {
        // Check if Facebook app is available
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && !(window as any).FB) {
          // Use web flow if no Facebook app
          window.location.href = `/api/auth/facebook/web`;
        } else {
          // Use regular Facebook OAuth
          window.location.href = `/api/auth/facebook`;
        }
      } else if (provider === 'google') {
        window.location.href = `/api/auth/google`;
      } else if (provider === 'apple') {
        window.location.href = `/api/auth/apple`;
      }

      // Store last used provider
      localStorage.setItem('pawpal_last_provider', provider);
      
    } catch (error: any) {
      setError(error.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  const handleBack = () => {
    setLocation('/'); // Navigate back to main login
  };

  const onEmailSubmit = (data: EmailForm) => {
    magicLinkMutation.mutate(data);
  };

  const onPhoneSubmit = (data: PhoneForm) => {
    phoneOtpMutation.mutate(data);
  };

  // Check if provider should be hidden (disabled/unavailable)
  const isProviderAvailable = (provider: string) => {
    // Add logic here to check if providers are enabled
    return true; // For now, all are available
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-white hover:bg-white/10 rounded-full p-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-6 pt-8 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <h1 className="text-3xl font-bold text-yellow-400">PAWPAL</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            For the Love of<br />Love
          </h2>
          <p className="text-white/80 text-lg">
            {lastUsedProvider ? `You last signed in with ${lastUsedProvider}` : 'Choose your preferred sign-in method'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-400 text-red-100" role="alert" aria-live="assertive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Auth Methods */}
        <div className="space-y-4">
          {/* Quick Sign-in (if available) */}
          {lastUsedProvider && isProviderAvailable('quick') && (
            <Button
              onClick={() => handleProviderAuth('quick')}
              disabled={loadingProvider === 'quick'}
              className="w-full h-14 bg-yellow-400 hover:bg-yellow-300 text-primary-900 font-semibold rounded-2xl text-lg"
              aria-busy={loadingProvider === 'quick'}
            >
              {loadingProvider === 'quick' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-3" />
                  Quick sign in
                </>
              )}
            </Button>
          )}

          {/* Facebook */}
          {isProviderAvailable('facebook') && (
            <Button
              onClick={() => handleProviderAuth('facebook')}
              disabled={loadingProvider === 'facebook'}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl text-lg"
              aria-busy={loadingProvider === 'facebook'}
            >
              {loadingProvider === 'facebook' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <SiFacebook className="w-5 h-5 mr-3" />
                  Continue with Facebook
                </>
              )}
            </Button>
          )}

          {/* Google */}
          {isProviderAvailable('google') && (
            <Button
              onClick={() => handleProviderAuth('google')}
              disabled={loadingProvider === 'google'}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl text-lg"
              aria-busy={loadingProvider === 'google'}
            >
              {loadingProvider === 'google' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <SiGoogle className="w-5 h-5 mr-3" />
                  Continue with Google
                </>
              )}
            </Button>
          )}

          {/* Phone Number */}
          {isProviderAvailable('phone') && (
            <Button
              onClick={() => setActiveMethod(activeMethod === 'phone' ? null : 'phone')}
              disabled={!!loadingProvider}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl text-lg"
            >
              <Phone className="w-5 h-5 mr-3" />
              Use cell phone number
            </Button>
          )}

          {/* Phone Number Form */}
          {activeMethod === 'phone' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="h-12 bg-white text-gray-900 border-0 rounded-xl"
                    {...phoneForm.register("phone")}
                  />
                  {phoneForm.formState.errors.phone && (
                    <p className="text-red-300 text-sm flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={phoneOtpMutation.isPending}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-primary-900 font-semibold rounded-xl"
                >
                  {phoneOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Send verification code
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Email */}
          {isProviderAvailable('email') && (
            <Button
              onClick={() => setActiveMethod(activeMethod === 'email' ? null : 'email')}
              disabled={!!loadingProvider}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl text-lg"
            >
              <Mail className="w-5 h-5 mr-3" />
              Use email
            </Button>
          )}

          {/* Email Form */}
          {activeMethod === 'email' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="h-12 bg-white text-gray-900 border-0 rounded-xl"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-red-300 text-sm flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={magicLinkMutation.isPending}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-primary-900 font-semibold rounded-xl"
                >
                  {magicLinkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send magic link
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Legal Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-white/60 text-sm leading-relaxed">
          By signing up, you agree to our{' '}
          <button 
            className="text-white underline hover:no-underline"
            onClick={() => {
              // Handle Terms navigation
              toast({ title: "Terms", description: "Terms of Service would open here" });
            }}
          >
            Terms
          </button>
          . See how we use your data in our{' '}
          <button 
            className="text-white underline hover:no-underline"
            onClick={() => {
              // Handle Privacy navigation  
              toast({ title: "Privacy", description: "Privacy Policy would open here" });
            }}
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
}