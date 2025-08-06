import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Login from "./login";
import Register from "./register";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐕</div>
          <p className="text-gray-600 font-medium">Loading PupMatch...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return <>{children}</>;
  }

  // Show authentication screens
  const handleLoginSuccess = () => {
    // The useQuery will automatically refetch and user will be available
    // No additional action needed as the query will be invalidated
  };

  if (authMode === "register") {
    return (
      <Register
        onLoginSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setAuthMode("login")}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setAuthMode("register")}
    />
  );
}