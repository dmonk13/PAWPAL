import React, { useState } from "react";
import { Share2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ActionRowProps {
  onShare: () => void;
  onReport: (reason: string, description?: string) => void;
  dogName?: string;
}

const reportReasons = [
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "spam", label: "Spam or scam" },
  { value: "safety_concern", label: "Safety concern" },
  { value: "other", label: "Other" }
];

export default function ActionRow({ onShare, onReport, dogName = "profile" }: ActionRowProps) {
  const { toast } = useToast();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = () => {
    onShare();
    // Add haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
    // Add haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const submitReport = async () => {
    if (!selectedReason) {
      toast({
        title: "Please select a reason",
        description: "A reason for reporting is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the onReport callback with the selected reason and description
      await onReport(selectedReason, description);
      
      setShowReportModal(false);
      setSelectedReason("");
      setDescription("");
      
      toast({
        title: "Report submitted",
        description: `Thank you for reporting this ${dogName}. We'll review it within 24 hours.`,
      });
    } catch (error) {
      toast({
        title: "Report failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowReportModal(false);
    setSelectedReason("");
    setDescription("");
  };

  return (
    <>
      <div 
        role="group" 
        aria-label="Profile actions"
        className="grid grid-cols-2 gap-2.5 mt-3"
        data-testid="action-row"
      >
        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="h-11 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 transition-all duration-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 min-h-[44px] touch-manipulation focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          data-testid="button-share"
          aria-label={`Share ${dogName}`}
        >
          <Share2 className="w-4 h-4 flex-shrink-0" />
          <span className="hidden min-[341px]:inline">Share</span>
        </Button>

        {/* Report Button */}
        <Button
          onClick={handleReport}
          variant="outline"
          className="h-11 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:shadow-md hover:shadow-rose-200/50 dark:hover:shadow-rose-900/50 transition-all duration-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 min-h-[44px] touch-manipulation focus-visible:outline-2 focus-visible:outline-rose-500 focus-visible:outline-offset-2"
          data-testid="button-report"
          aria-label={`Report ${dogName}`}
        >
          <Flag className="w-4 h-4 flex-shrink-0" />
          <span className="hidden min-[341px]:inline">Report</span>
        </Button>
      </div>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Profile</DialogTitle>
            <DialogDescription>
              Please let us know why you're reporting this profile. This will help us maintain a safe community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reason Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Reason for reporting</Label>
              <RadioGroup 
                value={selectedReason} 
                onValueChange={setSelectedReason}
                className="space-y-2"
              >
                {reportReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={reason.value} 
                      id={reason.value}
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                    <Label 
                      htmlFor={reason.value} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Optional Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Additional details (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide any additional context that might help us review this report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] focus-visible:ring-2 focus-visible:ring-blue-500"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {description.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={submitReport}
              disabled={isSubmitting || !selectedReason}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}