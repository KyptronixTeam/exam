import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { SubmitConfirmModal } from "../SubmitConfirmModal";

interface MCQStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onFail?: (score: any) => void;
}

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export const MCQStep = ({ formData, updateFormData, onNext, onBack, onFail }: MCQStepProps) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>(formData.mcqAnswers || {});
  const [currentPage, setCurrentPage] = useState(formData.mcqCurrentPage || 0);
  const [attempts, setAttempts] = useState(formData.assessmentAttempts || 0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [passingPercentage, setPassingPercentage] = useState<number | null>(null);

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    // Increment attempts
    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);
    setChecking(true);

    try {
      // Send answers in the format expected by backend
      const answersArray = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: (answers[q.id] && answers[q.id] !== '__SKIPPED__') ? answers[q.id] : null
      }));

      // Use the supabase shim rpc which forwards to backend and handles auth
      const rpcRes: any = await supabase.rpc('validate-answers', { answers: answersArray });
      const data = rpcRes?.data;
      if (!data) throw new Error('Validation failed');
      console.log('Assessment result:', data);
      setResult(data);
      setShowResult(true);

      // Update form data with assessment results (persist role not department)
      updateFormData({
        role: formData.role,
        mcqAnswers: answers,
        assessmentScore: data.percentage,
        assessmentPassed: data.passed,
        assessmentAttempts: currentAttempt
      });
    } catch (error: any) {
      console.error('Assessment check error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to check assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };



  // Fetch passing percentage config from backend
  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        const res: any = await supabase.rpc('mcq_config');
        const body = res?.data;
        if (body && typeof body.passingPercentage === 'number') {
          if (mounted) setPassingPercentage(body.passingPercentage);
        } else {
          if (mounted) setPassingPercentage(null); // no fallback
        }
      } catch (e) {
        console.warn('Could not load MCQ config via supabase shim', e);
        if (mounted) setPassingPercentage(null); // no fallback
      }
    };
    fetchConfig();
    return () => { mounted = false; };
  }, []);

  // No longer needed: independently saving to localStorage.
  // SubmissionForm handles auto-save via formData.

  // Sync local state with formData when it changes (e.g., on session restore)
  useEffect(() => {
    const restoredAnswers = formData.mcqAnswers || {};
    const restoredPage = formData.mcqCurrentPage || 0;

    // Only update if different to avoid unnecessary re-renders
    if (JSON.stringify(restoredAnswers) !== JSON.stringify(answers)) {
      setAnswers(restoredAnswers);
    }
    if (restoredPage !== currentPage) {
      setCurrentPage(restoredPage);
    }
  }, [formData.mcqAnswers, formData.mcqCurrentPage]);


  // On mount, ensure we have a role from formData
  useEffect(() => {
    if (!formData.role) {
      // If no role, this shouldn't happen as it's selected in previous step
      console.warn('No role selected in formData');
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize role string to match backend canonical categories
  const normalizeRole = (d: string) => {
    if (!d) return d;
    const s = String(d).trim().toLowerCase();
    if (['full stack developer', 'full-stack developer', 'fullstack developer', 'fullstack', 'fill developer', 'fill', 'full developer'].includes(s)) return 'Full Stack Developer';
    if (['python developer', 'python'].includes(s)) return 'Python Developer';
    if (['backend developer', 'backend'].includes(s)) return 'Backend Developer';
    if (['frontend developer', 'frontend'].includes(s)) return 'Frontend Developer';
    // accept the shorter 'UI/UX' label and map to the backend enum
    if (['ui/ux', 'ui ux', 'ux', 'ui', 'ui/ux designer', 'ui ux designer', 'ux designer', 'ui designer', 'uiux designer'].includes(s)) return 'UI/UX Designer';
    // fallback: title-case words
    return String(d).trim();
  };

  // Fetch questions on mount and whenever the selected role changes so students
  // see questions immediately after choosing a role (or on initial load).
  useEffect(() => {
    // Only fetch if a role is selected
    if (formData.role) {
      fetchQuestions();
    }
    // Intentionally ignore exhaustive-deps warning: we want to call the
    // fetchQuestions declared above whenever `formData.role` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      console.log("Fetching questions for role:", formData.role);

      // Fetch questions filtered by selected department/subject
      // Normalize to canonical category names to maximize matching with backend
      const category = normalizeRole(formData.role);
      console.log("Normalized category for query:", category);

      // Try server-side exact match first, then fallback to ilike (case-insensitive
      // contains). If still empty, fetch all and do a client-side fuzzy match as a
      // last resort — this handles inconsistent subject values in the DB.
      let data: any[] | null = null;

      // 1) exact match
      let res: any = await supabase.from("mcq_questions").select("*").eq("subject", category);
      console.log("Server exact match result:", res?.data?.length, "rows", res?.error || null);
      if (res.error) throw res.error;
      data = res.data;

      // 2) fallback to ilike (case-insensitive contains)
      if (!data || data.length === 0) {
        const likePattern = `%${category}%`;
        const res2: any = await supabase.from("mcq_questions").select("*").ilike("subject", likePattern);
        console.log("Server ilike match result:", res2?.data?.length, "rows", res2?.error || null);
        if (res2.error) throw res2.error;
        data = res2.data;
      }

      // 3) final fallback: fetch all and filter client-side using a loose match
      if (!data || data.length === 0) {
        const res3: any = await supabase.from("mcq_questions").select("*");
        console.log("Server full fetch result:", res3?.data?.length, "rows", res3?.error || null);
        if (res3.error) throw res3.error;
        const all = res3.data || [];
        const lowerCat = String(category || "").toLowerCase();
        data = all.filter((q: any) => String(q.subject || "").toLowerCase().includes(lowerCat));
      }

      console.log("Query result - data:", data);

      // Remove duplicates based on question text
      const uniqueQuestions = data.filter((question, index, self) =>
        index === self.findIndex((q) => q.question === question.question)
      );

      console.log(`Filtered to ${uniqueQuestions.length} unique questions from ${data.length} total`);

      setQuestions(uniqueQuestions as Question[]);

      // Only reset answers if we don't already have some (e.g., from restoration)
      if (Object.keys(formData.mcqAnswers || {}).length === 0) {
        setAnswers({});
        updateFormData({ mcqAnswers: {} });
      }

      // Only reset page if it's not already set
      if (!formData.mcqCurrentPage) {
        setCurrentPage(0);
        updateFormData({ mcqCurrentPage: 0 });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch questions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(newAnswers);
    updateFormData({ mcqAnswers: newAnswers });
  };

  const handleSkipQuestion = (questionId: string) => {
    // mark as skipped with a sentinel value
    const newAnswers = {
      ...answers,
      [questionId]: '__SKIPPED__'
    };
    setAnswers(newAnswers);
    updateFormData({ mcqAnswers: newAnswers });
  };

  const syncCurrentPage = (page: number) => {
    setCurrentPage(page);
    updateFormData({ mcqCurrentPage: page });
  };




  const handleResultClose = () => {
    setShowResult(false);

    if (result?.passed) {
      // Proceed to next step (Project Details)
      setResult(null);
      onNext();
    } else {
      // Failed - only 1 attempt allowed, end submission
      // Call onFail prop if provided
      if (onFail && result) {
        onFail({
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctCount,
          percentage: result.percentage
        });
      }

      toast({
        title: "Assessment Complete",
        description: "Thank you for participating. Goodbye!",
        variant: "destructive",
      });
      // Go back to home after 3 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  };

  return (
    <>
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Department Assessment (1 Attempt Only)
          </CardTitle>
          <CardDescription>
            Complete the assessment for {formData.role} ({passingPercentage !== null ? `${passingPercentage}%` : 'config error'} required to proceed)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && questions.length > 0 && (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {Math.ceil(questions.length / 5)}
                </p>
              </div>

              {questions.slice(currentPage * 5, (currentPage + 1) * 5).map((q, index) => {
                const globalIndex = currentPage * 5 + index;
                return (
                  <div key={q.id} className="space-y-3 select-none" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>
                    <div className="flex items-start justify-between">
                      <Label className="text-base font-semibold select-none">
                        {globalIndex + 1}. {q.question}
                      </Label>
                      <div className="ml-4">
                        {answers[q.id] === '__SKIPPED__' ? (
                          <span className="text-sm text-muted-foreground">Skipped</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleSkipQuestion(q.id)}>Skip</Button>
                        )}
                      </div>
                    </div>

                    <RadioGroup
                      value={answers[q.id] === '__SKIPPED__' ? "" : (answers[q.id] || "")}
                      onValueChange={(value) => handleAnswerChange(q.id, value)}
                      className="space-y-2 pl-4 select-none"
                      disabled={showCorrectAnswers || answers[q.id] === '__SKIPPED__' || showResult}
                    >
                      {q.options.map((option) => {
                        const isCorrect = showCorrectAnswers && option === q.correct_answer;
                        const isWrong = showCorrectAnswers && answers[q.id] === option && option !== q.correct_answer;

                        return (
                          <div key={option} className={`flex items-center space-x-2 select-none ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 p-2 rounded' : isWrong ? 'bg-red-100 dark:bg-red-900/30 p-2 rounded' : ''}`}>
                            <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                            <Label
                              htmlFor={`${q.id}-${option}`}
                              className={`font-normal cursor-pointer flex-1 select-none ${isCorrect ? 'font-bold text-green-700 dark:text-green-300' : isWrong ? 'text-red-700 dark:text-red-300' : ''}`}
                            >
                              {option} {isCorrect && "✓ Correct Answer"}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => syncCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || checking || showCorrectAnswers}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(answers).length} / {questions.length} answered
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => syncCurrentPage(Math.min(Math.ceil(questions.length / 5) - 1, currentPage + 1))}
                  disabled={currentPage >= Math.ceil(questions.length / 5) - 1 || checking || showCorrectAnswers}
                >
                  Next
                </Button>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                  disabled={checking || showCorrectAnswers}
                >
                  Previous
                </Button>
                {!showCorrectAnswers ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={checking || showCorrectAnswers || showResult}
                  >
                    {checking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Submit Assessment"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleResultClose}
                    className="flex-1"
                    variant="destructive"
                  >
                    End Submission
                  </Button>
                )}
              </div>
            </>
          )}          {!loading && formData.role && questions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No questions available for this role. Please contact the administrator.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={(open) => {
        if (!open) handleResultClose();
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-2xl ${result?.passed ? "text-green-600" : "text-orange-600"}`}>
              {result?.passed ? "🎉 Excellent Performance!" : "📚 Review Required"}
            </DialogTitle>
            <DialogDescription>
              {result?.passed ? "Congratulations! You have passed the assessment." : "Please review your answers below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Score Summary */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-lg border-2 border-primary/20">
              <div className="text-center">
                <p className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {result?.percentage}%
                </p>
                <div className="flex justify-center items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold text-lg">✓ {result?.correctCount}</span>
                    <span className="text-muted-foreground">Correct</span>
                  </div>
                  <div className="h-4 w-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold text-lg">✗ {result?.totalQuestions - result?.correctCount}</span>
                    <span className="text-muted-foreground">Wrong</span>
                  </div>
                  <div className="h-4 w-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{result?.totalQuestions}</span>
                    <span className="text-muted-foreground">Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm leading-relaxed">{result?.feedback}</p>
            </div>

            {/* Wrong Answers Section removed per request: do not show student mistakes after submission */}

            {/* Status Message */}
            {result?.passed ? (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
                <p className="text-center font-semibold text-green-700 dark:text-green-300">
                  ✅ Outstanding! You scored above {passingPercentage ?? 'required'}%. Proceeding to project submission...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <p className="text-center font-semibold text-orange-700 dark:text-orange-300">
                    ❌ Assessment not passed. Review your answers above.
                  </p>
                </div>
                <div className="text-center py-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold mb-2">👋 Thank You!</p>
                  <p className="text-sm text-muted-foreground">
                    We appreciate your participation. Redirecting to home...
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleResultClose}
              className="w-full"
              size="lg"
              variant={result?.passed ? "default" : "destructive"}
            >
              {result?.passed ? "Continue to Project Submission →" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SubmitConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={checking}
      />
    </>

  );
};
