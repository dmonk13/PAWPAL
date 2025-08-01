import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Discover from "@/pages/discover";
import Matches from "@/pages/matches";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import VetConnect from "@/pages/vet-connect";
import VetProfile from "@/pages/vet-profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/discover" component={Discover} />
      <Route path="/matches" component={Matches} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />
      <Route path="/vet-connect" component={VetConnect} />
      <Route path="/vet-profile/:vetId" component={VetProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isVetPage = location.startsWith('/vet-');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className={`${isVetPage ? 'max-w-full' : 'max-w-sm mx-auto'} bg-white min-h-screen relative overflow-hidden`}>
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
