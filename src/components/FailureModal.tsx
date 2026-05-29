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
            <DialogContent className="sm:max-w-lg border-red-500/20 bg-card/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-red-900/10">
                <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto mt-2 mb-2 w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center ring-8 ring-red-50 dark:ring-red-900/10">
                        <XCircle className="w-10 h-10 text-red-500 dark:text-red-400 animate-pulse" />
                    </div>
                    <DialogTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-red-600 to-rose-400 dark:from-red-400 dark:to-rose-300 bg-clip-text text-transparent">
                        Exam Not Passed
                    </DialogTitle>
                    <DialogDescription className="text-lg pt-1 text-foreground/80 leading-relaxed px-4">
                        {message || "Unfortunately, you did not meet the passing requirements for this exam."}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 dark:bg-red-950/30 p-5 rounded-xl border border-red-100 dark:border-red-900/50 mt-4 mx-4 shadow-sm">
                    <p className="text-sm text-center text-red-800 dark:text-red-300 font-medium">
                        Your attempt has been recorded. You cannot retake this exam with the same email and phone number.
                    </p>
                </div>

                <div className="flex justify-center mt-8 mx-4">
                    <Button
                        onClick={onClose}
                        className="w-full py-6 text-base rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] border-0"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
