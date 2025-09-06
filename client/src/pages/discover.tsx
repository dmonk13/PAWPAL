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
            <h1 className="text-xl font-bold text-gray-900">PAWPAL</h1>
            <p className="text-gray-600 text-sm">Find a friend, start a wag</p>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="default"
            size="default"
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-2 rounded-xl font-medium"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5 mr-2" />
            Filters
          </Button>
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
