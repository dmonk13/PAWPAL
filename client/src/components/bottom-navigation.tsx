import { Link, useLocation } from "wouter";
import { Search, Heart, MessageCircle, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navigationTabs = [
    { 
      id: "discover", 
      label: "Discover", 
      icon: Search, 
      path: "/",
      altPaths: ["/discover"]
    },
    { 
      id: "matches", 
      label: "Matches", 
      icon: Heart, 
      path: "/matches" 
    },
    { 
      id: "messages", 
      label: "Messages", 
      icon: MessageCircle, 
      path: "/messages" 
    },
    { 
      id: "profile", 
      label: "Profile", 
      icon: User, 
      path: "/profile" 
    },
  ];

  const isTabActive = (tab: typeof navigationTabs[0]) => {
    if (location === tab.path) return true;
    if (tab.altPaths && tab.altPaths.includes(location)) return true;
    return false;
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2">
      <div className="flex justify-around">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isTabActive(tab);
          
          return (
            <Link key={tab.id} href={tab.path}>
              <button 
                className={`flex flex-col items-center py-2 transition-colors ${
                  isActive ? "text-primary-rose" : "text-secondary-gray hover:text-primary-dark"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
