import { useState } from "react";
import { Sliders, PawPrint, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeArea from "@/components/swipe-area";
import FilterModal from "@/components/filter-modal";
import BottomNav from "@/components/bottom-nav";

export default function Discover() {
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = (filters: any) => {
    // TODO: Apply filters to the discover query
    console.log("Applying filters:", filters);
  };

  return (
    <>
      {/* Header - Hinge style */}
      <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <PawPrint className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-gray-900">PupMatch</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </header>

      {/* Main content - Hinge style background */}
      <div className="flex-1 bg-gray-50">
        <SwipeArea />
      </div>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Filter modal */}
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
        />
      )}
    </>
  );
}
