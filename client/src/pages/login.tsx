import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  PawPrint, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield, 
  Loader2, 
  Wifi, 
  WifiOff,
  Smartphone,
  Settings,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  Phone,
  Zap
} from "lucide-react";
import { SiGoogle, SiApple, SiFacebook } from "react-icons/si";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordResetSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const phoneSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
});

type LoginForm = z.infer<typeof loginSchema>;
type MagicLinkForm = z.infer<typeof magicLinkSchema>;
type PasswordResetForm = z.infer<typeof passwordResetSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtherSignIn, setShowOtherSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [lastUsedProvider, setLastUsedProvider] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [otherSignInError, setOtherSignInError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [lastFailedAttempt, setLastFailedAttempt] = useState<number | null>(null);
  const [loginDelay, setLoginDelay] = useState(0);
  
  const { toast } = useToast();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle caps lock detection
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  }, []);

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  }, [handleKeyUp]);

  // Calculate login delay based on failed attempts
  useEffect(() => {
    if (failedAttempts > 2) {
      const delay = Math.min(30000, Math.pow(2, failedAttempts - 3) * 5000); // Progressive delay up to 30s
      setLoginDelay(delay);
      
      const timer = setTimeout(() => {
        setLoginDelay(0);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordResetForm = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  // Check for maintenance mode (simplified for demo)
  useEffect(() => {
    // In a real app, this would check a system status endpoint
    setIsMaintenanceMode(false);
  }, []);

  // Check for last used provider when other sign-in is shown
  useEffect(() => {
    if (showOtherSignIn) {
      const lastProvider = localStorage.getItem('pawpal_last_provider');
      setLastUsedProvider(lastProvider);
      
      // Fire analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'auth_other_screen_view', {
          event_category: 'authentication',
          event_label: 'other_signin_methods'
        });
      }
    }
  }, [showOtherSignIn]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm & { keepSignedIn?: boolean }) => {
      // Add delay if there were previous failed attempts
      if (loginDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, loginDelay));
      }
      
      return await apiRequest("POST", "/api/auth/login", {
        ...data,
        keepSignedIn,
        timestamp: Date.now(), // For bot protection
      });
    },
    onSuccess: () => {
      setFailedAttempts(0);
      setLastFailedAttempt(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Success toast with smooth transition
      toast({
        title: "Welcome back!",
        description: "Signing you in now...",
        duration: 2000,
      });
      
      // Smooth transition delay
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    },
    onError: (error: any) => {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setLastFailedAttempt(Date.now());
      
      let errorMessage = "Invalid username or password";
      
      if (error.message?.includes("rate limit")) {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message?.includes("account locked")) {
        errorMessage = "Account temporarily locked. Please reset your password.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
        duration: newFailedAttempts > 3 ? 10000 : 5000,
      });
    },
  });

  const magicLinkMutation = useMutation({
    mutationFn: async (data: MagicLinkForm) => {
      return await apiRequest("POST", "/api/auth/magic-link", data);
    },
    onSuccess: () => {
      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
        duration: 5000,
      });
      setShowMagicLink(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send magic link",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: async (data: PasswordResetForm) => {
      return await apiRequest("POST", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password changed successfully!",
        description: "Your password has been updated. Please sign in with your new password.",
        duration: 5000,
      });
      setShowPasswordReset(false);
      passwordResetForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to change password",
        description: error.message || "Please check your current password and try again.",
        variant: "destructive",
      });
    },
  });

  // Phone OTP mutation
  const phoneOtpMutation = useMutation({
    mutationFn: async (data: PhoneForm) => {
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
      setOtherSignInError(error.message || "Failed to send verification code");
    },
  });

  // Enhanced magic link mutation for other sign-in
  const otherMagicLinkMutation = useMutation({
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
      setOtherSignInError(error.message || "Failed to send magic link");
    },
  });

  const onSubmit = (data: LoginForm) => {
    if (loginDelay > 0) return;
    loginMutation.mutate({ ...data, keepSignedIn });
  };

  const onMagicLinkSubmit = (data: MagicLinkForm) => {
    magicLinkMutation.mutate(data);
  };

  const onPasswordResetSubmit = (data: PasswordResetForm) => {
    passwordResetMutation.mutate(data);
  };

  const onEmailSubmit = (data: EmailForm) => {
    otherMagicLinkMutation.mutate(data);
  };

  const onPhoneSubmit = (data: PhoneForm) => {
    phoneOtpMutation.mutate(data);
  };

  const handleProviderAuth = async (provider: string) => {
    setLoadingProvider(provider);
    setOtherSignInError(null);
    
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
          setOtherSignInError("No previous sign-in method found. Please choose a method below.");
          setLoadingProvider(null);
          return;
        }
      }

      if (provider === 'facebook') {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && !(window as any).FB) {
          window.location.href = `/api/auth/facebook/web`;
        } else {
          window.location.href = `/api/auth/facebook`;
        }
      } else if (provider === 'google') {
        window.location.href = `/api/auth/google`;
      } else if (provider === 'apple') {
        window.location.href = `/api/auth/apple`;
      }

      localStorage.setItem('pawpal_last_provider', provider);
      
    } catch (error: any) {
      setOtherSignInError(error.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  const isProviderAvailable = (provider: string) => {
    return true; // For now, all are available
  };

  const handleBackFromOtherSignIn = () => {
    setShowOtherSignIn(false);
    setActiveMethod(null);
    setOtherSignInError(null);
    setLoadingProvider(null);
  };

  const handleBackFromRegister = () => {
    setShowRegister(false);
    setActiveMethod(null);
    setOtherSignInError(null);
    setLoadingProvider(null);
  };

  const isFormValid = form.watch("username") && form.watch("password") && 
                     !form.formState.errors.username && !form.formState.errors.password;

  const canSubmit = isFormValid && !loginMutation.isPending && loginDelay === 0 && !isMaintenanceMode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center p-4 relative">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-warning-500 text-white py-2 px-4 text-center z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">No internet connection. Changes will sync when online.</span>
          </div>
        </div>
      )}

      {/* Maintenance Banner */}
      {isMaintenanceMode && (
        <div className="fixed top-0 left-0 right-0 bg-info-500 text-white py-2 px-4 text-center z-50" style={{ top: !isOnline ? '44px' : '0' }}>
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">System maintenance in progress. Some features may be limited.</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-6" style={{ marginTop: (!isOnline || isMaintenanceMode) ? '60px' : '0' }}>
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl shadow-xl mb-6 flex items-center justify-center overflow-hidden" 
               style={{ background: 'var(--primary-gradient)' }}>
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" 
              style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome Back
          </h1>
          <p className="text-neutral-600 text-lg">Sign in to find your pup's perfect match</p>
        </div>

        {/* Main Authentication Card */}
        <Card className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-neutral-800">Sign In</CardTitle>
            <CardDescription className="text-neutral-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* SSO Options */}
            <div className="space-y-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 border-neutral-300 hover:border-neutral-400 text-neutral-700"
                style={{ minHeight: '44px' }}
              >
                <SiApple className="w-5 h-5 mr-3" />
                Continue with Apple
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 border-neutral-300 hover:border-neutral-400 text-neutral-700"
                style={{ minHeight: '44px' }}
              >
                <SiGoogle className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex justify-center">
                <span className="bg-white px-4 text-sm text-neutral-500">or continue with</span>
              </div>
            </div>

            {!showMagicLink ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-neutral-700">
                    Username or Email
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    className="h-11 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    style={{ minHeight: '44px' }}
                    aria-describedby="username-error"
                    {...form.register("username")}
                  />
                  {form.formState.errors.username && (
                    <p id="username-error" className="text-sm text-error-500 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                      onClick={() => setShowPasswordReset(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 pr-20"
                      style={{ minHeight: '44px' }}
                      aria-describedby="password-error password-caps"
                      {...form.register("password")}
                    />
                    <div className="absolute right-2 top-0 h-full flex items-center gap-1">
                      {capsLockOn && (
                        <Lock className="w-4 h-4 text-warning-500" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-neutral-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {capsLockOn && (
                    <p id="password-caps" className="text-sm text-warning-500 flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      Caps Lock is on
                    </p>
                  )}
                  
                  {form.formState.errors.password && (
                    <p id="password-error" className="text-sm text-error-500 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Keep Signed In */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keep-signed-in"
                    checked={keepSignedIn}
                    onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
                  />
                  <Label
                    htmlFor="keep-signed-in"
                    className="text-sm font-normal text-neutral-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Keep me signed in
                  </Label>
                </div>
                <p className="text-xs text-neutral-500 -mt-2 pl-6">
                  Stay signed in for up to 30 days on this device
                </p>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full h-11 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: canSubmit ? 'var(--primary-gradient)' : 'var(--neutral-400)',
                    minHeight: '44px'
                  }}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : loginDelay > 0 ? (
                    `Wait ${Math.ceil(loginDelay / 1000)}s`
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Rate Limiting Info */}
                {failedAttempts > 2 && (
                  <Alert className="bg-warning-50 border-warning-200">
                    <AlertTriangle className="h-4 w-4 text-warning-500" />
                    <AlertDescription className="text-warning-700">
                      Multiple failed attempts detected. Delays increase with each failed attempt for security.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            ) : (
              /* Magic Link Form */
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email" className="text-sm font-medium text-neutral-700">
                    Email Address
                  </Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-11 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    style={{ minHeight: '44px' }}
                    {...magicLinkForm.register("email")}
                  />
                  {magicLinkForm.formState.errors.email && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {magicLinkForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={magicLinkMutation.isPending}
                  className="w-full h-11 font-medium text-white shadow-lg transition-all duration-300"
                  style={{ background: 'var(--primary-gradient)', minHeight: '44px' }}
                >
                  {magicLinkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Other Sign-in Methods */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  // Fire analytics event if available
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'auth_other_button_click', {
                      event_category: 'authentication',
                      event_label: 'other_signin_methods_show'
                    });
                  }
                  setShowOtherSignIn(true);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                Other sign‑in methods
              </button>
            </div>

            {/* Create Account Link */}
            <div className="text-center pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setShowRegister(true)}
                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Create account
                </button>
              </p>
            </div>

            {/* Device & Session Management */}
            <div className="text-center">
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors flex items-center justify-center gap-1 mx-auto"
                onClick={() => toast({ title: "Device Management", description: "Manage your devices and active sessions." })}
              >
                <Smartphone className="w-3 h-3" />
                Manage devices & sessions
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Other Sign-In Full Screen */}
        {showOtherSignIn && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
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
                onClick={handleBackFromOtherSignIn}
                className="text-white hover:bg-white/10 rounded-full p-2"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 px-6 pt-8 pb-12 h-full overflow-y-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
                    <PawPrint className="w-8 h-8 text-primary-900" />
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
              {otherSignInError && (
                <Alert className="mb-6 bg-red-500/10 border-red-400 text-red-100" role="alert" aria-live="assertive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{otherSignInError}</AlertDescription>
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
                        <Label htmlFor="other-email" className="text-white font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="other-email"
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
                        disabled={otherMagicLinkMutation.isPending}
                        className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-primary-900 font-semibold rounded-xl"
                      >
                        {otherMagicLinkMutation.isPending ? (
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

              {/* Legal Footer */}
              <div className="mt-16 text-center">
                <p className="text-white/60 text-sm leading-relaxed">
                  By signing up, you agree to our{' '}
                  <button 
                    className="text-white underline hover:no-underline"
                    onClick={() => {
                      toast({ title: "Terms", description: "Terms of Service would open here" });
                    }}
                  >
                    Terms
                  </button>
                  . See how we use your data in our{' '}
                  <button 
                    className="text-white underline hover:no-underline"
                    onClick={() => {
                      toast({ title: "Privacy", description: "Privacy Policy would open here" });
                    }}
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Dialog */}
        {showRegister && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 text-neutral-800 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-36 -translate-y-36"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
            </div>
            
            {/* Header with prominent back button */}
            <div className="relative z-10 flex items-center justify-start p-4 pt-12">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBackFromRegister}
                className="text-neutral-800 hover:bg-white/20 bg-white/10 rounded-full p-3 shadow-lg backdrop-blur-sm border border-white/20"
                aria-label="Go back to login"
              >
                <ArrowLeft className="w-8 h-8" />
              </Button>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 px-6 pt-8 pb-12 h-full overflow-y-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-neutral-800 rounded-3xl flex items-center justify-center shadow-lg">
                    <PawPrint className="w-10 h-10 text-yellow-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-neutral-800">PAWPAL</h1>
                </div>
                <p className="text-neutral-700 text-lg font-medium">
                  Join the community for dog lovers
                </p>
              </div>

              {/* Error Alert */}
              {otherSignInError && (
                <Alert className="mb-6 bg-red-500/10 border-red-400 text-red-800" role="alert" aria-live="assertive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{otherSignInError}</AlertDescription>
                </Alert>
              )}

              {/* Registration Methods */}
              <div className="space-y-4">
                {/* Facebook */}
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

                {/* Google */}
                <Button
                  onClick={() => handleProviderAuth('google')}
                  disabled={loadingProvider === 'google'}
                  className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl text-lg shadow-md border border-gray-200"
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

                {/* Phone Number */}
                <Button
                  onClick={() => setActiveMethod(activeMethod === 'phone' ? null : 'phone')}
                  disabled={!!loadingProvider}
                  className="w-full h-14 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-2xl text-lg"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  Use cell phone number
                </Button>

                {/* Phone Number Form */}
                {activeMethod === 'phone' && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-phone" className="text-neutral-800 font-medium">
                          Phone Number
                        </Label>
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="h-12 bg-white text-gray-900 border-0 rounded-xl"
                          {...phoneForm.register("phone")}
                        />
                        {phoneForm.formState.errors.phone && (
                          <p className="text-red-700 text-sm flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {phoneForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={phoneOtpMutation.isPending}
                        className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl"
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
                <Button
                  onClick={() => setActiveMethod(activeMethod === 'email' ? null : 'email')}
                  disabled={!!loadingProvider}
                  className="w-full h-14 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-2xl text-lg"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Use email
                </Button>

                {/* Email Form */}
                {activeMethod === 'email' && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-neutral-800 font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          className="h-12 bg-white text-gray-900 border-0 rounded-xl"
                          {...emailForm.register("email")}
                        />
                        {emailForm.formState.errors.email && (
                          <p className="text-red-700 text-sm flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {emailForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={otherMagicLinkMutation.isPending}
                        className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl"
                      >
                        {otherMagicLinkMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send sign-up link
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Legal Footer */}
              <div className="mt-16 text-center">
                <p className="text-neutral-700 text-sm leading-relaxed">
                  By signing up, you agree to our{' '}
                  <button 
                    className="text-neutral-800 underline hover:no-underline font-medium"
                    onClick={() => {
                      toast({ title: "Terms", description: "Terms of Service would open here" });
                    }}
                  >
                    Terms
                  </button>
                  . See how we use your data in our{' '}
                  <button 
                    className="text-neutral-800 underline hover:no-underline font-medium"
                    onClick={() => {
                      toast({ title: "Privacy", description: "Privacy Policy would open here" });
                    }}
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demo Credentials */}
        <Card className="bg-info-50 border-info-200 rounded-xl">
          <CardContent className="pt-4">
            <p className="text-sm text-info-800 font-medium mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Demo Credentials
            </p>
            <div className="text-sm text-info-700 space-y-1">
              <p>Username: <code className="bg-info-100 px-2 py-1 rounded font-mono">sarah_golden</code></p>
              <p>Password: <code className="bg-info-100 px-2 py-1 rounded font-mono">password123</code></p>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-success-500" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-error-500" />
                <span>Offline - changes will sync when online</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your current credentials and choose a new password to reset your account password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={passwordResetForm.handleSubmit(onPasswordResetSubmit)} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="reset-username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="reset-username"
                type="text"
                placeholder="Enter your username"
                className="h-11 border-neutral-300 focus:border-primary-500"
                {...passwordResetForm.register("username")}
              />
              {passwordResetForm.formState.errors.username && (
                <p className="text-sm text-error-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {passwordResetForm.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="reset-current-password" className="text-sm font-medium">
                Current Password
              </Label>
              <Input
                id="reset-current-password"
                type="password"
                placeholder="Enter your current password"
                className="h-11 border-neutral-300 focus:border-primary-500"
                {...passwordResetForm.register("currentPassword")}
              />
              {passwordResetForm.formState.errors.currentPassword && (
                <p className="text-sm text-error-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {passwordResetForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="reset-new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="h-11 border-neutral-300 focus:border-primary-500 pr-10"
                  {...passwordResetForm.register("newPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-0 h-11 w-8 p-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-500" />
                  )}
                </Button>
              </div>
              {passwordResetForm.formState.errors.newPassword && (
                <p className="text-sm text-error-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {passwordResetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="h-11 border-neutral-300 focus:border-primary-500 pr-10"
                  {...passwordResetForm.register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-0 h-11 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-500" />
                  )}
                </Button>
              </div>
              {passwordResetForm.formState.errors.confirmPassword && (
                <p className="text-sm text-error-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {passwordResetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordReset(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={passwordResetMutation.isPending}
                className="flex-1"
                style={{ background: 'var(--primary-gradient)' }}
              >
                {passwordResetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}