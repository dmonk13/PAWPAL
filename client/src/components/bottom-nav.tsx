import { Link, useLocation } from "wouter";
import { Search, Sparkles, MessageCircle, User, Stethoscope } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { id: "discover", label: "Discover", icon: Search, path: "/" },
    { id: "spotlight", label: "Spotlight", icon: Sparkles, path: "/spotlight" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
    { id: "vet-connect", label: "Vet Connect", icon: Stethoscope, path: "/vet-connect" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (tab.path === "/" && location === "/discover") || (tab.path === "/vet-connect" && location.startsWith("/vet-"));
          
          return (
            <Link key={tab.id} href={tab.path}>
              <button className={`flex flex-col items-center py-2 transition-colors ${
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}>
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
