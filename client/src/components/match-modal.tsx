import { Heart } from "lucide-react";
import { DogWithMedical } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface MatchModalProps {
  dog: DogWithMedical;
  onClose: () => void;
  onSendMessage: () => void;
}

const CURRENT_DOG_PHOTO = "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";

export default function MatchModal({ dog, onClose, onSendMessage }: MatchModalProps) {
  return (
    <div className="fixed inset-0 gradient-bg z-60 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <div className="mb-8">
          <Heart className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
          <p className="text-lg opacity-90">You and {dog.name} both swiped right!</p>
        </div>
        
        <div className="flex justify-center space-x-4 mb-8">
          <div className="w-24 h-24 bg-white rounded-full p-1">
            <img 
              src={CURRENT_DOG_PHOTO}
              alt="Your dog" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="w-24 h-24 bg-white rounded-full p-1">
            <img 
              src={dog.photos?.[0] || "/placeholder-dog.jpg"}
              alt={`Matched dog ${dog.name}`}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-white text-coral py-4 rounded-full font-bold text-lg hover:bg-gray-100"
            onClick={onSendMessage}
          >
            Send Message
          </Button>
          <Button 
            variant="outline"
            className="w-full border-2 border-white text-white py-4 rounded-full font-bold text-lg hover:bg-white hover:text-coral"
            onClick={onClose}
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
