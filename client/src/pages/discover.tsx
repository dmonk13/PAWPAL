import { useState } from "react";
import { Sliders, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeArea from "@/components/swipe-area";
import FilterModal from "@/components/filter-modal";
import BottomNav from "@/components/bottom-nav";
import { DiscoverUserNav } from "@/components/discover-user-nav";

export default function Discover() {
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = (filters: any) => {
    // TODO: Apply filters to the discover query
    console.log("Applying filters:", filters);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PupMatch</h1>
            <p className="text-gray-600 text-sm">Find your pup's perfect match</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-rose-500 hover:bg-gray-100 rounded-full p-2"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5" />
          </Button>
          <DiscoverUserNav />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <SwipeArea />
      </div>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Filter modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
