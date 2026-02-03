import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface SubmitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export const SubmitConfirmModal = ({ isOpen, onClose, onConfirm, isSubmitting }: SubmitConfirmModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md border-primary/20 bg-card/95 backdrop-blur-xl">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Submit Exam?
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2 text-foreground/80">
                        Are you sure you want to submit and end the exam? This action cannot be undone, and you will not be able to change your answers after this.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-2">
                    <p className="text-sm text-center text-muted-foreground">
                        Your final score will be calculated and your project details will be recorded once you confirm.
                    </p>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        onClick={onClose}
                        variant="glass"
                        className="w-full sm:flex-1"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="hero"
                        className="w-full sm:flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Yes, Submit Now"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
