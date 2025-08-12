import { useState } from "react";
import { Sliders, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeArea from "@/components/swipe-area";
import FilterModal from "@/components/filter-modal";
import BottomNav from "@/components/bottom-nav";
import { UserNav } from "@/components/user-nav";

export default function Discover() {
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = (filters: any) => {
    // TODO: Apply filters to the discover query
    console.log("Applying filters:", filters);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PupMatch</h1>
            <p className="text-pink-100 text-sm">Find your pup's perfect match</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5" />
          </Button>
          <UserNav />
        </div>
      </header>

      {/* Main content - Hinge style background */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
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
    </div>
  );
}
