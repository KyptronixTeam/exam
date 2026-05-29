import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SubmitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    answeredCount?: number;
    totalQuestions?: number;
}

export const SubmitConfirmModal = ({ isOpen, onClose, onConfirm, isSubmitting, answeredCount, totalQuestions }: SubmitConfirmModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-lg border-green-500/20 bg-card/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-green-900/10">
                <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto mt-2 mb-2 w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center ring-8 ring-green-50 dark:ring-green-900/10">
                        <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400 animate-pulse" />
                    </div>
                    <DialogTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
                        Submit Assessment?
                    </DialogTitle>
                    <DialogDescription className="text-lg pt-1 text-foreground/80 leading-relaxed px-4">
                        Are you completely sure you want to submit and end the exam? 
                        <br/><span className="text-muted-foreground font-medium text-sm mt-2 block">This action cannot be undone, and you will not be able to change your answers.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-xl border border-green-100 dark:border-green-900/50 mt-4 mx-4 shadow-sm text-center">
                    {answeredCount !== undefined && totalQuestions !== undefined && (
                        <div className="mb-3 inline-flex items-center justify-center bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-4 py-1.5 rounded-full font-bold text-sm border border-green-200 dark:border-green-800">
                            You have answered {answeredCount} out of {totalQuestions} questions.
                        </div>
                    )}
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        Your final score will be calculated and your project details will be recorded once you confirm.
                    </p>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8 mx-4">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full sm:flex-1 py-6 text-base rounded-xl border-2 hover:bg-muted"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="w-full sm:flex-1 py-6 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] border-0"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
