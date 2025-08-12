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
      <header className="bg-gradient-to-r from-rose-500 to-amber-500 text-white p-6 flex items-center justify-between sticky top-0 z-40 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-md">
            <PawPrint className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PupMatch</h1>
            <p className="text-rose-100 text-sm font-medium">Find your pup's perfect match</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full p-3 transition-all duration-200 shadow-sm border border-white/20 hover:border-white/40"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5" />
          </Button>
          <UserNav />
        </div>
      </header>

      {/* Main content - Hinge style background */}
      <div className="flex-1 bg-gradient-to-b from-rose-50/30 to-amber-50/30 overflow-hidden">
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
