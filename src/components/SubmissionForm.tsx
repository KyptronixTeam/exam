import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useExamSession } from "@/hooks/useExamSession";
import { PersonalInfoStep } from "./form-steps/PersonalInfoStep";
import { ProjectDetailsStep } from "./form-steps/ProjectDetailsStep";
import { MCQStep } from "./form-steps/MCQStep";
import { ReviewStep } from "./form-steps/ReviewStep";
import { ContentCreatorStep } from "./form-steps/ContentCreatorStep";
import { GraphicDesignerStep } from "./form-steps/GraphicDesignerStep";
import { SuccessModal } from "./SuccessModal";
import { FailureModal } from "./FailureModal";
import { SubmitConfirmModal } from "./SubmitConfirmModal";
import { PendingReviewModal } from "./PendingReviewModal";


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
  // Chosen question set (1/2/3)
  questionSet?: number;
  // Assessment Results
  assessmentPassed?: boolean;
  assessmentScore?: number;
  // File Upload
  files: File[];
  // Essay Text for SMO
  essayText?: string;
  // Drive Link for Content Creator
  driveLink?: string;
  // Graphic Designer links
  graphicDesignLink1?: string;
  graphicDesignLink2?: string;
  graphicDesignLink3?: string;
  // Tab Switch Count
  tabSwitchCount?: number;
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
  const [showPendingReview, setShowPendingReview] = useState(false);
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
          essayText: savedData.essayText || prev.essayText,
          driveLink: savedData.driveLink || prev.driveLink,
          graphicDesignLink1: savedData.graphicDesignLink1 || prev.graphicDesignLink1,
          graphicDesignLink2: savedData.graphicDesignLink2 || prev.graphicDesignLink2,
          graphicDesignLink3: savedData.graphicDesignLink3 || prev.graphicDesignLink3,
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

  // Roles that fill a project/work submission form AFTER passing the MCQ,
  // so managers can review what they actually submitted.
  const ROLES_WITH_PROJECT_STEP = ["SEO", "SMO", "Full Stack Developer"];
  const needsProjectStep = ROLES_WITH_PROJECT_STEP.includes(formData.role);
  const TOTAL_STEPS = needsProjectStep ? 3 : 2;

  // Advance the flow. `override` lets a child (MCQStep) hand us freshly-computed
  // values so we don't depend on not-yet-flushed state.
  const nextStep = (override?: Partial<FormData>) => {
    const merged = override ? { ...formData, ...override } : formData;
    if (override) {
      setFormData(merged);
    }

    // From the assessment (step 2): passers of project-step roles go to the
    // project form (step 3); everyone else submits directly.
    if (currentStep === 2) {
      if (needsProjectStep) {
        setCurrentStep(3);
        if (sessionStarted) saveProgress(3, merged);
        return;
      }
      handleSubmit(merged);
      return;
    }

    // From the project form (step 3): submit.
    if (currentStep === 3) {
      handleSubmit(merged);
      return;
    }

    const newStep = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(newStep);
    if (sessionStarted) {
      saveProgress(newStep, merged);
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

  const handleSubmit = async (dataOverride?: FormData) => {
    const data = dataOverride || formData;
    setIsSubmitting(true);
    try {
      // The user has already passed the MCQ; use the stored assessment result.
      const isPassing = data.assessmentPassed === true;
      // Build mcqScore from stored data
      let mcqScore = { totalQuestions: 0, correctAnswers: 0, percentage: 0 };
      if (typeof data.assessmentScore === 'object' && data.assessmentScore !== null) {
          const scoreObj = data.assessmentScore as any;
          mcqScore = {
              totalQuestions: scoreObj.totalQuestions || Object.keys(data.mcqAnswers || {}).length,
              correctAnswers: scoreObj.correctCount || 0,
              percentage: scoreObj.percentage || 0
          };
      } else {
          const scoreNum = typeof data.assessmentScore === 'number' ? data.assessmentScore : 0;
          mcqScore = {
            totalQuestions: Object.keys(data.mcqAnswers || {}).length,
            correctAnswers: Math.round((scoreNum / 100) * Object.keys(data.mcqAnswers || {}).length),
            percentage: scoreNum
          };
      }

      // Build mcqAnswersForDb. The server re-grades authoritatively, so isCorrect
      // is left null here and computed backend-side.
      const mcqAnswersForDb = Object.entries(data.mcqAnswers || {}).map(([questionId, selected]) => ({
        questionId,
        selectedAnswer: selected === '__SKIPPED__' ? null : selected,
        isCorrect: null
      }));

      // Submit exam through session API
      const submitResult = await submitExam(
        {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          collegeName: data.collegeName,
          department: data.department,
          role: data.role,
          year: data.year,
          semester: data.semester,
          essayText: data.essayText,
          driveLink: data.driveLink,
          graphicDesignLink1: data.graphicDesignLink1,
          graphicDesignLink2: data.graphicDesignLink2,
          graphicDesignLink3: data.graphicDesignLink3,
          questionSet: data.questionSet,
          tabSwitchCount: data.tabSwitchCount,
          projectTitle: data.projectTitle,
          projectDescription: data.projectDescription,
          websiteUrl: data.websiteUrl,
          githubRepo: data.githubRepo
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
      if (['SMO', 'Content Creator', 'Graphic Designer'].includes(data.role)) {
          setShowPendingReview(true);
      } else if (isPassing) {
        // Automatically close and go home since they already saw the MCQ modal
        handleSuccessClose();
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
    setShowPendingReview(false);
    setFormData(initialFormData);
    setCurrentStep(1);
    setSessionStarted(false);
    onBack();
  };

  const handleFailureClose = () => {
    setShowFailure(false);
    setShowPendingReview(false);
    setFormData(initialFormData);
    setCurrentStep(1);
    setSessionStarted(false);
    onBack();
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      {/* Progress Indicator */}
      <div className="max-w-3xl mx-auto mb-10 px-4 sm:px-12">
        <div className="flex items-center justify-between relative">
          {/* Background Line */}
          <div className="absolute left-[10%] right-[10%] h-1.5 bg-muted top-5 -translate-y-1/2 z-0 rounded-full">
            <div className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full" style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>
          </div>

          {(needsProjectStep
            ? [{ n: 1, label: "Personal Details" }, { n: 2, label: "Assessment" }, { n: 3, label: "Submission" }]
            : [{ n: 1, label: "Personal Details" }, { n: 2, label: "Assessment" }]
          ).map(({ n, label }) => (
            <div key={n} className="flex flex-col items-center gap-3 relative z-10 w-28 sm:w-36">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ring-4 ${currentStep >= n ? "bg-primary text-primary-foreground ring-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "bg-card border-2 border-muted text-muted-foreground ring-transparent"}`}>
                {n}
              </div>
              <span className={`text-xs sm:text-sm whitespace-nowrap ${currentStep >= n ? "text-primary font-bold drop-shadow-sm" : "text-muted-foreground font-medium"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="max-w-5xl mx-auto">
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handlePersonalInfoSubmit}
            onBack={onBack}
          />
        )}
        {currentStep === 2 && formData.role === "Content Creator" && (
          <ContentCreatorStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={nextStep}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 2 && formData.role === "Graphic Designer" && (
          <GraphicDesignerStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={nextStep}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 2 && formData.role !== "Content Creator" && formData.role !== "Graphic Designer" && (
          <MCQStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onFail={(score) => failAssessment(score)}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 3 && (
          <ProjectDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => nextStep()}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => handleSubmit()}
        isSubmitting={isSubmitting}
      />

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} />
      <PendingReviewModal isOpen={showPendingReview} onClose={handleSuccessClose} />

      {/* Failure Modal */}
      <FailureModal
        isOpen={showFailure}
        onClose={handleFailureClose}
        message={failureMessage}
      />
    </div>
  );
};
