import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface FailureModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export const FailureModal = ({ isOpen, onClose, message }: FailureModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                        Exam Not Passed
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        {message || "Unfortunately, you did not meet the passing requirements for this exam."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-center text-red-700 dark:text-red-300">
                            Your attempt has been recorded. You cannot retake this exam with the same email and phone number.
                        </p>
                    </div>

                    <Button
                        onClick={onClose}
                        className="w-full"
                        variant="destructive"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
