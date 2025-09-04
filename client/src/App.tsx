import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthWrapper from "@/pages/auth-wrapper";
import NotFound from "@/pages/not-found";

import Discover from "@/pages/discover";
import Spotlight from "@/pages/spotlight";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import VetConnect from "@/pages/vet-connect";
import VetProfile from "@/pages/vet-profile";
import Premium from "@/pages/premium";
import Checkout from "@/pages/checkout";
import OtherSignIn from "@/pages/other-signin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/discover" component={Discover} />
      <Route path="/spotlight" component={Spotlight} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/vet-connect" component={VetConnect} />
      <Route path="/vet-profile/:vetId" component={VetProfile} />
      <Route path="/premium" component={Premium} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isVetPage = location.startsWith('/vet-');
  const isAuthPage = location.startsWith('/auth/');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          {/* Auth routes - rendered outside AuthWrapper */}
          <Route path="/auth/other" component={OtherSignIn} />
          
          {/* Main app routes - wrapped with AuthWrapper */}
          <Route>
            <AuthWrapper>
              <div className={`${isVetPage ? 'max-w-full' : 'max-w-sm mx-auto'} bg-white min-h-screen relative flex flex-col`}>
                <div className="flex-1 overflow-auto pb-20">
                  <Router />
                </div>
              </div>
            </AuthWrapper>
          </Route>
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
