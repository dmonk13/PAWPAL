import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  MoreHorizontal, 
  VolumeX, 
  Pin, 
  Trash2, 
  Search,
  UserPlus
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  dogName: string;
  dogPhoto: string;
  ownerName: string;
  isOnline?: boolean;
  isVerified?: boolean;
  unreadCount?: number;
  lastActivity?: Date;
  isPinned?: boolean;
  isMuted?: boolean;
}

interface MatchesStripProps {
  matches: Match[];
  onMatchSelect: (matchId: string) => void;
  onMatchAction?: (matchId: string, action: 'mute' | 'pin' | 'remove') => void;
  onAddMatch?: () => void;
}

export default function MatchesStrip({ 
  matches, 
  onMatchSelect, 
  onMatchAction = () => {},
  onAddMatch
}: MatchesStripProps) {
  const [pressedMatch, setPressedMatch] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Sort matches by recent activity and pinned status
  const sortedMatches = React.useMemo(() => {
    return [...matches].sort((a, b) => {
      // Pinned matches first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by last activity
      const aTime = a.lastActivity?.getTime() || 0;
      const bTime = b.lastActivity?.getTime() || 0;
      return bTime - aTime;
    });
  }, [matches]);

  const handleMatchPress = (matchId: string) => {
    const timer = setTimeout(() => {
      setPressedMatch(matchId);
    }, 500); // 500ms for long press
    setPressTimer(timer);
  };

  const handleMatchRelease = (matchId: string) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    if (pressedMatch === matchId) {
      // Long press detected - don't trigger tap
      setPressedMatch(null);
      return;
    }
    
    // Regular tap
    onMatchSelect(matchId);
  };

  const handleQuickAction = (matchId: string, action: 'mute' | 'pin' | 'remove') => {
    onMatchAction(matchId, action);
    setPressedMatch(null);
    
    const actionLabels = {
      mute: 'muted',
      pin: 'pinned',
      remove: 'removed'
    };
    
    toast({
      title: `Match ${actionLabels[action]}`,
      description: `This match has been ${actionLabels[action]}.`
    });
  };

  const handleAddMatch = () => {
    setShowAddDialog(true);
  };

  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent, matchId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onMatchSelect(matchId);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Matches</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddMatch}
          className="text-sm text-gray-600 hover:text-gray-900"
          data-testid="button-add-match"
        >
          <Search className="w-4 h-4 mr-1" />
          Find More
        </Button>
      </div>
      
      <ScrollArea className="w-full">
        <div 
          ref={scrollRef}
          className="flex space-x-4 pb-2"
          role="listbox"
          aria-label="Recent matches"
        >
          {/* Add Match Button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleAddMatch}
              className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 flex items-center justify-center"
              aria-label="Add new match"
              data-testid="button-add-new-match"
            >
              <Plus className="w-6 h-6 text-gray-400 hover:text-pink-500" />
            </Button>
            <p className="text-xs text-gray-500 text-center mt-1 w-14 truncate">
              Add
            </p>
          </div>

          {/* Matches */}
          {sortedMatches.map((match) => (
            <div
              key={match.id}
              className="flex-shrink-0 relative"
              role="option"
              aria-selected="false"
            >
              <div className="relative">
                {/* Long Press Actions */}
                {pressedMatch === match.id && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 flex space-x-1 p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction(match.id, 'mute')}
                      className="w-8 h-8 p-0"
                      aria-label="Mute match"
                    >
                      <VolumeX className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction(match.id, 'pin')}
                      className="w-8 h-8 p-0"
                      aria-label="Pin match"
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction(match.id, 'remove')}
                      className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                      aria-label="Remove match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Avatar with Status Ring */}
                <div
                  className={`relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                    match.isOnline || match.isVerified 
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600' 
                      : 'bg-gray-300'
                  } ${
                    match.isPinned ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                  }`}
                  onMouseDown={() => handleMatchPress(match.id)}
                  onMouseUp={() => handleMatchRelease(match.id)}
                  onMouseLeave={() => {
                    if (pressTimer) {
                      clearTimeout(pressTimer);
                      setPressTimer(null);
                    }
                    setPressedMatch(null);
                  }}
                  onTouchStart={() => handleMatchPress(match.id)}
                  onTouchEnd={() => handleMatchRelease(match.id)}
                  onKeyDown={(e) => handleKeyDown(e, match.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Chat with ${match.dogName}`}
                  data-testid={`match-avatar-${match.id}`}
                  style={{ minWidth: '44px', minHeight: '44px' }} // Ensure 44px touch target
                >
                  <Avatar className="w-full h-full border-2 border-white">
                    <AvatarImage 
                      src={match.dogPhoto} 
                      alt={`${match.dogName}'s photo`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                      {match.dogName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Online Status Indicator */}
                  {match.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}

                  {/* Verified Badge */}
                  {match.isVerified && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}

                  {/* Unread Badge */}
                  {match.unreadCount && match.unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white border-2 border-white rounded-full flex items-center justify-center p-0"
                      aria-label={`${match.unreadCount} unread messages`}
                    >
                      {match.unreadCount > 9 ? '9+' : match.unreadCount}
                    </Badge>
                  )}

                  {/* Muted Indicator */}
                  {match.isMuted && (
                    <div className="absolute bottom-0 left-0 w-4 h-4 bg-gray-500 border-2 border-white rounded-full flex items-center justify-center">
                      <VolumeX className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name Label */}
              <p className="text-xs text-gray-700 text-center mt-1 w-14 truncate font-medium">
                {match.dogName}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add Match Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="add-match-description">
          <DialogHeader>
            <DialogTitle>Find New Matches</DialogTitle>
            <DialogDescription id="add-match-description">
              Search for new dogs to connect with or invite friends to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for dogs or owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-matches"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                className="w-full"
                data-testid="button-browse-dogs"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Dogs
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                onClick={() => setShowAddDialog(false)}
                data-testid="button-invite-friends"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}