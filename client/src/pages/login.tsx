import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  ExternalLink
} from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
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

type LoginForm = z.infer<typeof loginSchema>;
type MagicLinkForm = z.infer<typeof magicLinkSchema>;

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
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

  // Check for maintenance mode (simplified for demo)
  useEffect(() => {
    // In a real app, this would check a system status endpoint
    setIsMaintenanceMode(false);
  }, []);

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

  const onSubmit = (data: LoginForm) => {
    if (loginDelay > 0) return;
    loginMutation.mutate({ ...data, keepSignedIn });
  };

  const onMagicLinkSubmit = (data: MagicLinkForm) => {
    magicLinkMutation.mutate(data);
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
                      onClick={() => toast({ title: "Password reset", description: "Check your email for reset instructions." })}
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
                        <Lock className="w-4 h-4 text-warning-500" title="Caps Lock is on" />
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
                onClick={() => setShowMagicLink(!showMagicLink)}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                {showMagicLink ? "Use password instead" : "Other sign-in methods"}
              </button>
            </div>

            {/* Create Account Link */}
            <div className="text-center pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToRegister}
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
    </div>
  );
}