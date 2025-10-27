import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PersonalInfoStep } from "./form-steps/PersonalInfoStep";
import { ProjectDetailsStep } from "./form-steps/ProjectDetailsStep";
import { MCQStep } from "./form-steps/MCQStep";
// FileUploadStep removed/commented out per request
// import { FileUploadStep } from "./form-steps/FileUploadStep";
import { ReviewStep } from "./form-steps/ReviewStep";
import { SuccessModal } from "./SuccessModal";

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
  files: [],
};

interface SubmissionFormProps {
  onBack: () => void;
}

export const SubmissionForm = ({ onBack }: SubmissionFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Reduce total steps by removing the File upload step (step 4)
  const TOTAL_STEPS = 4;
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare answers array in the format expected by the validate RPC
      const answersArray = Object.entries(formData.mcqAnswers).map(([questionId, selected]) => ({
        questionId,
        selectedAnswer: selected
      }));

      // Validate answers server-side to get scoring and per-question correctness
      const validateRes = await fetch('/api/mcq/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray })
      });
      if (!validateRes.ok) throw new Error('Failed to validate answers');
      const validateBody = await validateRes.json();
      if (!validateBody || !validateBody.success) throw new Error((validateBody && validateBody.error && validateBody.error.message) || 'Validation failed');
      const result = validateBody.data;

      // Fetch all questions so we can translate selectedAnswer (text) -> index
      const { data: allQuestions, error: qerr } = await supabase.from('mcq_questions').select('*');
      if (qerr) throw qerr;

      const qMap = new Map<string, any>();
      (allQuestions || []).forEach((q: any) => qMap.set(q.id, q));

      // Build mcqAnswers array in the DB shape: { questionId, selectedAnswer: Number, isCorrect }
      const mcqAnswersForDb = (result?.details || []).map((d: any) => {
        const q = qMap.get(d.questionId) || {};
        const selectedIndex = (d.selected == null) ? -1 : (Array.isArray(q.options) ? q.options.findIndex((o: string) => o === d.selected) : -1);
        return {
          questionId: d.questionId,
          // store null for skipped/unanswered so it's clear in DB
          selectedAnswer: selectedIndex >= 0 ? selectedIndex : null,
          isCorrect: !!d.isCorrect
        };
      });

      // Build submission payload
      const payload = {
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          collegeName: formData.collegeName,
            department: formData.department,
            role: formData.role,
          year: formData.year,
          semester: formData.semester
        },
        projectDetails: {
          title: formData.projectTitle,
          description: formData.projectDescription,
          websiteUrl: formData.websiteUrl,
          githubRepo: formData.githubRepo
        },
        mcqAnswers: mcqAnswersForDb,
        mcqScore: {
          totalQuestions: result?.totalQuestions || mcqAnswersForDb.length,
          correctAnswers: result?.correctCount || mcqAnswersForDb.filter((a: any) => a.isCorrect).length,
          percentage: result?.percentage || 0
        },
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      const { data, error } = await supabase.from('submissions').insert(payload);
      console.log('Submission insert response:', { data, error });
      if (error) throw error;

      setShowSuccess(true);
    } catch (err: any) {
      console.error('Submission error', err);
      const msg = err?.error?.message || err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      toast({ title: 'Submission Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Reset form and go back to hero
    setFormData(initialFormData);
    setCurrentStep(1);
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step <= currentStep
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-16 mx-1 transition-all duration-300 ${
                    step < currentStep ? "bg-primary" : "bg-muted"
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
            onNext={nextStep}
            onBack={onBack}
          />
        )}
        {currentStep === 2 && (
          <MCQStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
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
            onSubmit={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} />
    </div>
  );
};
