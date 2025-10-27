import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Submission Successful</DialogTitle>
          <DialogDescription>Your project has been submitted successfully.</DialogDescription>
        </DialogHeader>
        <div className="text-center py-8">
          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
                <CheckCircle2 className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🎉 Submission Successful!
          </h2>
          <p className="text-muted-foreground mb-2">
            Your project has been submitted successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            You'll receive a confirmation email shortly.
          </p>

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full animate-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random(),
                }}
              />
            ))}
          </div>

          {/* Action Button */}
          <Button variant="hero" onClick={onClose} className="w-full">
            Return to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
