import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Crown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type User } from "@shared/schema";

export function DiscoverUserNav() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Clear user data and let AuthWrapper handle the redirect to login
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    // Set a flag in localStorage to indicate we came from discover
    localStorage.setItem('settingsReturnPath', '/discover');
    navigate("/settings");
  };

  const initials = user.username
    .split(/\s+/)
    .map((word: string) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-2 hover:bg-gray-100 rounded-full"
          data-testid="discover-profile-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2" onClick={handleProfileClick}>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none cursor-pointer">
            <p className="font-medium text-sm">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {user.isPro && (
          <DropdownMenuItem>
            <Crown className="mr-2 h-4 w-4 text-yellow-500" />
            <span className="text-yellow-600">Pro Account</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}