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
      {/* Header */}
      <header className="gradient-bg text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <PawPrint className="w-6 h-6" />
          <h1 className="text-xl font-bold">PupMatch</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-white/20"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4 coral" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <SwipeArea />

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
