import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RemoveMatchModalProps {
  dogName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RemoveMatchModal({ dogName, onClose, onConfirm }: RemoveMatchModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Remove Match
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-remove">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to remove your match with <strong>{dogName}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone. You will lose all chat history and won't be able to contact each other anymore.
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-remove"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-remove"
            >
              Remove Match
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}