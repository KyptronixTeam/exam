import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface PendingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingReviewModal = ({ isOpen, onClose }: PendingReviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center text-2xl">Thank you for your submission!</DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Your response is currently under review by our team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            We appreciate the time you took to complete the assessment. Results will be communicated to you via email once the review is complete.
          </p>
          <Button onClick={onClose} className="w-full sm:w-auto min-w-[200px]">
            Return to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
