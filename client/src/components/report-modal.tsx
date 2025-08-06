import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface ReportModalProps {
  dogName: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

export default function ReportModal({ dogName, onClose, onSubmit }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reportReasons = [
    "Inappropriate messages",
    "Fake profile",
    "Harassment or bullying",
    "Spam or scam",
    "No-show for arranged meetup", 
    "Aggressive behavior",
    "Other"
  ];

  const handleSubmit = () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    if (reason && details) {
      onSubmit(reason, details);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Report {dogName}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-report">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Help keep PupMatch safe by reporting concerning behavior.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for reporting:</label>
              {reportReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <Checkbox
                    id={reason}
                    checked={selectedReason === reason}
                    onCheckedChange={() => setSelectedReason(reason)}
                    data-testid={`checkbox-${reason.toLowerCase().replace(/ /g, '-')}`}
                  />
                  <label htmlFor={reason} className="text-sm">
                    {reason}
                  </label>
                </div>
              ))}
            </div>
            
            {selectedReason === "Other" && (
              <Textarea
                placeholder="Please specify the reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2"
                data-testid="input-custom-reason"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Additional details:</label>
            <Textarea
              placeholder="Please provide more details about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1"
              data-testid="input-report-details"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || !details || (selectedReason === "Other" && !customReason)}
              className="flex-1 bg-red-600 hover:bg-red-700"
              data-testid="button-submit-report"
            >
              Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}