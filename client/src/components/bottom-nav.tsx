import { Link, useLocation } from "wouter";
import { Search, Heart, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { id: "discover", label: "Discover", icon: Search, path: "/" },
    { id: "matches", label: "Matches", icon: Heart, path: "/matches" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (tab.path === "/" && location === "/discover");
          
          return (
            <Link key={tab.id} href={tab.path}>
              <button className={`flex flex-col items-center py-2 ${
                isActive ? "coral" : "medium-gray"
              }`}>
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
