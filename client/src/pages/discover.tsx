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
      {/* Enhanced Header with subtle, calming colors */}
      <header className="bg-card border-b border-border p-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-divider rounded-full flex items-center justify-center shadow-sm">
            <PawPrint className="w-7 h-7 text-secondary-gray" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary-gray">PupMatch</h1>
            <p className="text-secondary-gray/70 text-sm font-medium">Find your pup's perfect match</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-secondary-gray hover:text-primary-dark hover:bg-divider rounded-full p-3 transition-all duration-200 shadow-sm border border-divider hover:border-secondary-gray/30"
            onClick={() => setShowFilters(true)}
          >
            <Sliders className="w-5 h-5" />
          </Button>
          <UserNav />
        </div>
      </header>

      {/* Main content with subtle background */}
      <div className="flex-1 bg-background overflow-hidden">
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
