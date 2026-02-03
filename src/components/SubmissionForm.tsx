import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useExamSession } from "@/hooks/useExamSession";
import { PersonalInfoStep } from "./form-steps/PersonalInfoStep";
import { ProjectDetailsStep } from "./form-steps/ProjectDetailsStep";
import { MCQStep } from "./form-steps/MCQStep";
import { ReviewStep } from "./form-steps/ReviewStep";
import { SuccessModal } from "./SuccessModal";
import { FailureModal } from "./FailureModal";
import { SubmitConfirmModal } from "./SubmitConfirmModal";


interface FormData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  department: string;
  role: string;
  year: string;
  semester: string;
  // Project Details
  projectTitle: string;
  projectDescription: string;
  websiteUrl: string;
  githubRepo?: string;
  // MCQ Answers
  mcqAnswers: Record<string, string>;
  mcqCurrentPage: number;
  // Assessment Results
  assessmentPassed?: boolean;
  assessmentScore?: number;
  // File Upload
  files: File[];
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  collegeName: "",
  department: "",
  role: "",
  year: "",
  semester: "",
  projectTitle: "",
  projectDescription: "",
  websiteUrl: "",
  githubRepo: "",
  mcqAnswers: {},
  mcqCurrentPage: 0,
  assessmentPassed: false,
  assessmentScore: 0,
  files: [],
};


interface SubmissionFormProps {
  onBack: () => void;
}

export const SubmissionForm = ({ onBack }: SubmissionFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const { toast } = useToast();
  const {
    startSession,
    saveProgress,
    submitExam,
    loadLocalSession,
    clearLocalSession,
    failAssessment
  } = useExamSession();

  // Load local session on mount
  useEffect(() => {
    const localSession = loadLocalSession();
    if (localSession && localSession.status === 'in_progress') {
      // Restore form data from local session
      const savedData = localSession.formData;
      if (savedData) {
        setFormData(prev => ({
          ...prev,
          fullName: savedData.fullName || prev.fullName,
          email: savedData.email || prev.email,
          phone: savedData.phone || prev.phone,
          collegeName: savedData.collegeName || prev.collegeName,
          department: savedData.department || prev.department,
          role: savedData.role || prev.role,
          year: savedData.year || prev.year,
          semester: savedData.semester || prev.semester,
          projectTitle: savedData.projectTitle || prev.projectTitle,
          projectDescription: savedData.projectDescription || prev.projectDescription,
          websiteUrl: savedData.websiteUrl || prev.websiteUrl,
          githubRepo: savedData.githubRepo || prev.githubRepo,
          mcqAnswers: savedData.mcqAnswers || prev.mcqAnswers,
          mcqCurrentPage: savedData.mcqCurrentPage || prev.mcqCurrentPage,
          assessmentPassed: savedData.assessmentPassed ?? prev.assessmentPassed,
          assessmentScore: savedData.assessmentScore ?? prev.assessmentScore,
        }));
        setCurrentStep(localSession.currentStep || 1);
        setSessionStarted(true);
        toast({
          title: "Session Restored",
          description: "Resuming from where you left off.",
        });
      }
    } else if (localSession && localSession.status === 'failed') {
      // If session is failed, show failure modal
      setFailureMessage("You have already attempted this assessment and did not pass.");
      setShowFailure(true);
    }
  }, [loadLocalSession, toast]);

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // Auto-save progress when step changes
  useEffect(() => {
    if (sessionStarted && currentStep > 1) {
      saveProgress(currentStep, formData);
    }
  }, [currentStep, sessionStarted]);

  // Auto-save MCQ answers and page whenever they change (debounced)
  useEffect(() => {
    if (sessionStarted && currentStep === 2) {
      // Debounce to avoid excessive saves
      const timeout = setTimeout(() => {
        saveProgress(currentStep, formData);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [formData.mcqAnswers, formData.mcqCurrentPage, sessionStarted, currentStep]);

  const TOTAL_STEPS = 4;

  const nextStep = () => {
    const newStep = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(newStep);
    if (sessionStarted) {
      saveProgress(newStep, formData);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle personal info submission - start/resume session
  const handlePersonalInfoSubmit = async () => {
    // Start or resume session with email + phone
    const result = await startSession(formData.email, formData.phone);

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to start session",
        variant: "destructive",
      });
      return;
    }

    if (result.alreadyCompleted) {
      toast({
        title: "Already Submitted",
        description: result.message || "You have already attempted this exam.",
        variant: "destructive",
      });
      return;
    }

    // Session started/resumed
    setSessionStarted(true);

    // If resuming, load the saved data
    if (!result.isNew && result.session) {
      const savedData = result.session.formData;
      if (savedData) {
        setFormData(prev => ({
          ...prev,
          ...savedData
        }));
        setCurrentStep(result.session.currentStep || 2);
        toast({
          title: "Session Resumed",
          description: "Continuing from where you left off.",
        });
        return;
      }
    }

    // New session - save initial data and proceed
    saveProgress(2, formData);
    nextStep();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // If the user reached step 4 (ReviewStep), they have already passed the MCQ
      // Use the stored assessment result instead of re-validating
      const isPassing = formData.assessmentPassed === true;
      const storedScore = formData.assessmentScore || 0;

      // Build mcqScore from stored data
      const mcqScore = {
        totalQuestions: Object.keys(formData.mcqAnswers || {}).length,
        correctAnswers: Math.round((storedScore / 100) * Object.keys(formData.mcqAnswers || {}).length),
        percentage: storedScore
      };

      // Build mcqAnswersForDb (simplified format for storage)
      const mcqAnswersForDb = Object.entries(formData.mcqAnswers || {}).map(([questionId, selected]) => ({
        questionId,
        selectedAnswer: selected,
        isCorrect: null // We don't recalculate correctness here
      }));

      // Submit exam through session API
      const submitResult = await submitExam(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          collegeName: formData.collegeName,
          department: formData.department,
          role: formData.role,
          year: formData.year,
          semester: formData.semester,
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          websiteUrl: formData.websiteUrl,
          githubRepo: formData.githubRepo
        },
        mcqAnswersForDb,
        mcqScore
      );

      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Submission failed');
      }

      // Clear local storage
      clearLocalSession();

      // Use the stored assessmentPassed for determining success/failure
      if (isPassing) {
        setShowSuccess(true);
      } else {
        setFailureMessage(submitResult.message || "Unfortunately, you did not pass the exam.");
        setShowFailure(true);
      }
    } catch (err: any) {
      console.error('Submission error', err);
      const msg = err?.error?.message || err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      toast({ title: 'Submission Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setFormData(initialFormData);
    setCurrentStep(1);
    setSessionStarted(false);
    onBack();
  };

  const handleFailureClose = () => {
    setShowFailure(false);
    setFormData(initialFormData);
    setCurrentStep(1);
    setSessionStarted(false);
    onBack();
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step <= currentStep
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-16 mx-1 transition-all duration-300 ${step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={currentStep === 1 ? "text-primary font-semibold" : "text-muted-foreground"}>Personal</span>
          <span className={currentStep === 2 ? "text-primary font-semibold" : "text-muted-foreground"}>Assessment</span>
          <span className={currentStep === 3 ? "text-primary font-semibold" : "text-muted-foreground"}>Project</span>
          <span className={currentStep === 4 ? "text-primary font-semibold" : "text-muted-foreground"}>Review</span>
        </div>
      </div>

      {/* Form Steps */}
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handlePersonalInfoSubmit}
            onBack={onBack}
          />
        )}
        {currentStep === 2 && (
          <MCQStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onFail={(score) => failAssessment(score)}
          />
        )}
        {currentStep === 3 && (
          <ProjectDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            formData={formData}
            onSubmit={() => setShowSubmitConfirm(true)}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} />

      {/* Failure Modal */}
      <FailureModal
        isOpen={showFailure}
        onClose={handleFailureClose}
        message={failureMessage}
      />
    </div>
  );
};
