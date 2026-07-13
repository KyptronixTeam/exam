import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mcqApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Clock, BarChart, Layers } from "lucide-react";
import { normalizeMcqRole } from "@/lib/mcqRoles";
import { SubmitConfirmModal } from "../SubmitConfirmModal";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { Textarea } from "@/components/ui/textarea";

interface MCQStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: (override?: Record<string, any>) => void;
  onBack: () => void;
  onFail?: (score: any) => void;
  isSubmitting?: boolean;
}

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct_answer: string;
}

const AnimatedCounter = ({ end, duration = 1500 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}</>;
};

export const MCQStep = ({ formData, updateFormData, onNext, onBack, onFail, isSubmitting }: MCQStepProps) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>(formData.mcqAnswers || {});
  const [currentPage, setCurrentPage] = useState(formData.mcqCurrentPage || 0);
  const [attempts, setAttempts] = useState(formData.assessmentAttempts || 0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [essayText, setEssayText] = useState(formData.essayText || "");
  const { violations } = useExamSecurity({ isActive: true, maxViolations: 3, onViolationThresholdReached: () => {
      // Auto fail if threshold reached
      if (onFail) onFail({ percentage: 0, correctAnswers: 0, totalQuestions: questions.length });
  }});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [passingPercentage, setPassingPercentage] = useState<number | null>(null);
  // Exam is time-restricted: 40 minutes for SMO, 30 minutes for every other role.
  const examDurationSeconds = (normalizeMcqRole(formData.role || "") === "SMO" ? 40 : 30) * 60;
  const [timeLeft, setTimeLeft] = useState(examDurationSeconds);
  const [timeExpired, setTimeExpired] = useState(false);
  // Question set selection
  const [availableSets, setAvailableSets] = useState<Array<{ set: number; count: number }>>([]);
  const [selectedSet, setSelectedSet] = useState<number | null>(formData.questionSet || null);
  const [loadingSets, setLoadingSets] = useState(true);

  // Countdown anchored to a persisted wall-clock start time so a page refresh
  // cannot reset the timer.
  useEffect(() => {
    if (loading || checking || showResult || showCorrectAnswers || questions.length === 0) return;
    if (!formData.examStartedAt) {
      updateFormData({ examStartedAt: Date.now() });
      return;
    }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - formData.examStartedAt) / 1000);
      setTimeLeft(Math.max(0, examDurationSeconds - elapsed));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, checking, showResult, showCorrectAnswers, questions.length, formData.examStartedAt, examDurationSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

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

      const data = await mcqApi.validateAnswers(answersArray);
      if (!data) throw new Error('Validation failed');
      console.log('Assessment result:', data);
      setResult(data);
      setShowResult(true);

      updateFormData({
        role: formData.role,
        mcqAnswers: answers,
        questionSet: selectedSet || 1,
        assessmentScore: data,
        assessmentPassed: data.passed,
        assessmentAttempts: currentAttempt,
        essayText: essayText,
        tabSwitchCount: violations
      });

      if (formData.role === "SMO") {
          // SMO goes straight to submission without showing the result dialog.
          // Pass the freshly-computed values directly so submitExam doesn't rely
          // on the not-yet-flushed formData state (previous cause of 0% scores
          // and lost essays for SMO).
          onNext({
            role: formData.role,
            mcqAnswers: answers,
            questionSet: selectedSet || 1,
            assessmentScore: data,
            assessmentPassed: data.passed,
            essayText: essayText,
            tabSwitchCount: violations,
          });
      } else {
          setResult(data);
          setShowResult(true);
      }
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

  // Auto-submit when the exam time limit is reached.
  useEffect(() => {
    if (timeExpired || questions.length === 0 || loading || checking || showResult || showCorrectAnswers) return;
    if (formData.examStartedAt && timeLeft <= 0) {
      setTimeExpired(true);
      setShowConfirm(false);
      toast({
        title: "Time's up!",
        description: "Your exam time has ended. Submitting your answers automatically.",
        variant: "destructive",
      });
      handleFinalSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timeExpired, questions.length, loading, checking, showResult, showCorrectAnswers]);

  // Fetch passing percentage config from backend
  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        const body = await mcqApi.getConfig();
        if (body && typeof body.passingPercentage === 'number') {
          if (mounted) setPassingPercentage(body.passingPercentage);
        } else {
          if (mounted) setPassingPercentage(null); // no fallback
        }
      } catch (e) {
        console.warn('Could not load MCQ config', e);
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

  // Fetch the available question sets whenever the role changes so the student
  // can choose which set (Set 1 / Set 2 / Set 3) to attempt.
  useEffect(() => {
    let mounted = true;
    const loadSets = async () => {
      if (!formData.role) return;
      setLoadingSets(true);
      try {
        const category = normalizeMcqRole(formData.role);
        const sets = await mcqApi.listSets(category);
        if (!mounted) return;
        const valid = (sets || []).filter(s => s.count > 0).sort((a, b) => a.set - b.set);
        setAvailableSets(valid);
        // If a set was already chosen (session restore) keep it; if only one set
        // exists, auto-select it.
        if (formData.questionSet && valid.some(s => s.set === formData.questionSet)) {
          setSelectedSet(formData.questionSet);
        } else if (valid.length === 1) {
          setSelectedSet(valid[0].set);
        }
      } catch (e) {
        console.warn('Could not load question sets', e);
        if (mounted) setAvailableSets([]);
      } finally {
        if (mounted) setLoadingSets(false);
      }
    };
    loadSets();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  // Fetch questions once a set has been chosen.
  useEffect(() => {
    if (formData.role && selectedSet) {
      fetchQuestions(selectedSet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role, selectedSet]);

  const fetchQuestions = async (setNumber: number) => {
    setLoading(true);
    try {
      const category = normalizeMcqRole(formData.role);
      console.log("Fetching questions for role:", category, "set:", setNumber);

      let data = await mcqApi.listQuestions({ category, questionSet: setNumber, limit: 500 });

      // Fallback: if the chosen set has no exact-category matches, fuzzy match
      // against all questions in that set (handles legacy casing/spacing).
      if (!data || data.length === 0) {
        const all = await mcqApi.listQuestions({ questionSet: setNumber, limit: 1000 });
        data = all.filter((q: any) => normalizeMcqRole(q.subject || q.category || "") === category);
      }

      // Remove duplicates based on question text
      const uniqueQuestions = data.filter((question, index, self) =>
        index === self.findIndex((q) => q.question === question.question)
      );

      console.log(`Filtered to ${uniqueQuestions.length} unique questions from ${data.length} total`);

      let finalQuestions = uniqueQuestions;
      if (formData.role === "SMO") {
          finalQuestions = uniqueQuestions.slice(0, 20);
      }

      setQuestions(finalQuestions as unknown as Question[]);

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

  const handleUnskipQuestion = (questionId: string) => {
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
    updateFormData({ mcqAnswers: newAnswers });
  };

  const syncCurrentPage = (page: number) => {
    setCurrentPage(page);
    updateFormData({ mcqCurrentPage: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ---- Question set selection screen ----
  if (!selectedSet) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm max-w-3xl mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Question Set
          </CardTitle>
          <CardDescription className="text-base">
            {formData.role} assessment — select the set your manager assigned you.
            <br />Each set contains a different set of questions. You get 1 attempt only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSets ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableSets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No question sets available for this role. Please contact the administrator.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {availableSets.map(({ set, count }) => (
                <button
                  key={set}
                  type="button"
                  onClick={() => {
                    setSelectedSet(set);
                    updateFormData({ questionSet: set });
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all shadow-sm hover:shadow-md"
                >
                  <Layers className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">Set {set}</span>
                  <span className="text-sm text-muted-foreground">{count} questions</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-start pt-4">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              Previous
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formData.role} Assessment — Set {selectedSet} (1 Attempt Only)
          </CardTitle>
          <CardDescription className="text-base">
            Complete the assessment for {formData.role} 
            {formData.role !== 'SMO' && passingPercentage !== null ? ` (${passingPercentage}% required to pass)` : ''}
            <br/>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm font-medium text-red-500 dark:text-red-400 bg-muted/70 dark:bg-muted/30 px-4 py-2 rounded-full border shadow-sm w-fit mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <span>Security Warning: Do not switch tabs. Violations: {violations}/3</span>
            </div>
            
            {!loading && questions.length > 0 && (
              <div className={`flex items-center justify-center gap-2 mt-4 text-sm font-bold px-6 py-2.5 rounded-xl border-2 shadow-sm w-fit mx-auto tracking-widest ${timeLeft <= 5 * 60 ? 'text-destructive border-destructive bg-destructive/10 animate-pulse' : 'text-foreground border-border bg-accent/30 dark:bg-accent/10'}`}>
                <Clock className={`h-4 w-4 ${timeLeft <= 5 * 60 ? 'text-destructive' : 'text-primary'}`} />
                <span>{formatTime(timeLeft)} left</span>
              </div>
            )}
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
              <div className="hidden">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {Math.ceil(questions.length / 5)}
                </p>
              </div>

              {questions.slice(currentPage * 5, (currentPage + 1) * 5).map((q, index) => {
                const globalIndex = currentPage * 5 + index;
                const hasAnswer = !!answers[q.id] && answers[q.id] !== '__SKIPPED__';

                return (
                  <div key={q.id} className="space-y-6 select-none bg-background/80 dark:bg-muted/10 p-5 sm:p-8 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>
                    <div className="flex items-start justify-between gap-4">
                      <Label className="text-xl sm:text-2xl font-semibold select-none leading-relaxed text-foreground">
                        {globalIndex + 1}. {q.question}
                      </Label>
                      <div className="shrink-0 mt-1">
                        {answers[q.id] === '__SKIPPED__' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full font-medium border hidden sm:block">Skipped</span>
                            <Button size="sm" variant="outline" className="rounded-lg shadow-sm text-primary hover:bg-primary/10 hover:text-primary transition-colors border-primary/20" onClick={() => handleUnskipQuestion(q.id)}>Unskip</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="rounded-lg shadow-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" onClick={() => handleSkipQuestion(q.id)}>Skip</Button>
                        )}
                      </div>
                    </div>

                    <RadioGroup
                      value={answers[q.id] === '__SKIPPED__' ? "" : (answers[q.id] || "")}
                      onValueChange={(value) => handleAnswerChange(q.id, value)}
                      className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4 pt-2 select-none"
                      disabled={showCorrectAnswers || answers[q.id] === '__SKIPPED__' || showResult}
                    >
                      {q.options.map((option) => {
                        const isCorrect = showCorrectAnswers && option === q.correct_answer;
                        const isWrong = showCorrectAnswers && answers[q.id] === option && option !== q.correct_answer;
                        const isSelected = answers[q.id] === option;
                        
                        let optionClasses = "flex items-center p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 select-none text-base sm:text-lg font-medium h-full min-h-[4.5rem]";

                        if (showCorrectAnswers) {
                          if (isCorrect) {
                            optionClasses += " bg-green-100 border-green-500 text-green-900 dark:bg-green-900/40 dark:border-green-500 dark:text-green-100 shadow-sm";
                          } else if (isWrong) {
                            optionClasses += " bg-red-100 border-red-500 text-red-900 dark:bg-red-900/40 dark:border-red-500 dark:text-red-100 shadow-sm";
                          } else {
                            optionClasses += " opacity-50 grayscale bg-muted border-transparent";
                          }
                        } else {
                          if (hasAnswer) {
                            if (isSelected) {
                              optionClasses += " bg-green-100 border-white text-black dark:bg-green-100 dark:border-white dark:text-black";
                            } else {
                              optionClasses += " opacity-50 bg-muted/60 border-transparent text-muted-foreground hover:opacity-70";
                            }
                          } else {
                            optionClasses += " bg-card border-border hover:border-primary/40 hover:bg-accent/50";
                          }
                        }

                        return (
                          <div key={option} className="relative w-full h-full">
                            <RadioGroupItem value={option} id={`${q.id}-${option}`} className="peer sr-only" />
                            <Label
                              htmlFor={`${q.id}-${option}`}
                              className={optionClasses}
                            >
                              <span className="flex-1">{option}</span>
                              {isCorrect && <span className="ml-2 text-green-600 dark:text-green-400 font-bold shrink-0">✓ Correct</span>}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                );
              })}

              {/* SMO Essay Section */}
              {formData.role === "SMO" && currentPage === Math.ceil(questions.length / 5) - 1 && (
                  <div className="mt-8 space-y-4 pt-6 border-t border-primary/20">
                    <Label className="text-lg font-semibold text-primary">
                      Strategy Essay (Required)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Outline a 30-day Social Media Strategy for a newly launched startup brand.
                    </p>
                    <Textarea 
                      rows={8} 
                      placeholder="Type your strategy here..." 
                      value={essayText}
                      onChange={(e) => {
                          setEssayText(e.target.value);
                          updateFormData({ essayText: e.target.value });
                      }}
                      onPaste={(e) => {
                          e.preventDefault();
                      }}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {essayText.length} characters (Paste is disabled)
                    </p>
                  </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="px-6 sm:px-10 text-base shadow-sm"
                  onClick={() => syncCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || checking || showCorrectAnswers}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  {Object.keys(answers).length} / {questions.length} answered
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="px-6 sm:px-10 text-base shadow-sm"
                  onClick={() => syncCurrentPage(Math.min(Math.ceil(questions.length / 5) - 1, currentPage + 1))}
                  disabled={currentPage >= Math.ceil(questions.length / 5) - 1 || checking || showCorrectAnswers}
                >
                  Next
                </Button>
              </div>

              {currentPage === Math.ceil(questions.length / 5) - 1 && (
                <div className="flex pt-8 pb-4">
                  {!showCorrectAnswers ? (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full text-lg py-6 sm:py-8 shadow-md hover:shadow-lg transition-all rounded-xl"
                      size="lg"
                      disabled={checking || showCorrectAnswers || showResult || (formData.role === 'SMO' && essayText.length < 50)}
                    >
                      {checking ? (
                        <>
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
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
                      className="w-full text-lg py-6 sm:py-8 shadow-md hover:shadow-lg transition-all rounded-xl"
                      size="lg"
                      variant="destructive"
                    >
                      End Submission
                    </Button>
                  )}
                </div>
              )}
            </>
          )}          {!loading && formData.role && questions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No questions available for this role. Please contact the administrator.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={(open) => {
        if (!open && !isSubmitting) handleResultClose();
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-primary/20 bg-card/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-primary/10">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className={`flex items-center justify-center text-3xl font-extrabold bg-gradient-to-r ${result ? (result.percentage < 30 ? "from-red-600 to-rose-400 dark:from-red-400 dark:to-rose-300" : result.percentage < 70 ? "from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300" : "from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-300") : ""} bg-clip-text text-transparent`}>
              <BarChart className={`w-8 h-8 mr-3 ${result ? (result.percentage < 30 ? "text-red-500" : result.percentage < 70 ? "text-amber-500" : "text-green-500") : ""}`} />
              Your Result
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Score Summary Card */}
            <div className={`bg-gradient-to-br ${result ? (result.percentage < 30 ? "from-red-500/20 to-red-600/10 dark:from-red-900/40 dark:to-red-950/20 border-red-500/30" : result.percentage < 70 ? "from-amber-500/20 to-amber-600/10 dark:from-amber-900/40 dark:to-amber-950/20 border-amber-500/30" : "from-green-500/20 to-emerald-600/10 dark:from-green-900/40 dark:to-emerald-950/20 border-green-500/30") : ""} p-8 rounded-3xl border-2 shadow-inner relative overflow-hidden`}>
              <div className="text-center relative z-10">
                <p className={`text-7xl font-black mb-6 bg-gradient-to-r ${result ? (result.percentage < 30 ? "from-red-600 to-rose-400 dark:from-red-400 dark:to-rose-300" : result.percentage < 70 ? "from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300" : "from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-300") : ""} bg-clip-text text-transparent drop-shadow-sm`}>
                  {showResult && <AnimatedCounter end={result?.percentage || 0} />}%
                </p>
                <div className="flex justify-center items-center gap-6 text-sm mb-8 font-medium">
                  <div className="flex flex-col items-center gap-1 bg-background/50 px-4 py-2 rounded-xl border border-border/50">
                    <span className="text-green-600 font-bold text-xl">✓ {result?.correctCount}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Correct</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-background/50 px-4 py-2 rounded-xl border border-border/50">
                    <span className="text-red-600 font-bold text-xl">✗ {result?.totalQuestions ? result.totalQuestions - result.correctCount : 0}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Wrong</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-background/50 px-4 py-2 rounded-xl border border-border/50">
                    <span className="font-bold text-xl text-foreground">{result?.totalQuestions}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Total</span>
                  </div>
                </div>

                <div className="bg-background/80 dark:bg-background/40 backdrop-blur-md p-5 rounded-2xl border border-border/50 shadow-sm">
                  {result?.passed ? (
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        ✅ Outstanding! You scored above {passingPercentage ?? 'required'}%.
                      </p>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">{result?.feedback || "Assessment Complete! We appreciate your participation."}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-red-700 dark:text-red-400">
                        ❌ Assessment not passed.
                      </p>
                      <p className="text-sm text-red-600/80 dark:text-red-400/80">The passing score is {passingPercentage ?? 70}%. {result?.feedback || "Please review your answers and try again."}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleResultClose}
              className="w-full text-lg py-6 sm:py-8 shadow-md hover:shadow-lg transition-all rounded-xl"
              size="lg"
              variant={result?.passed ? "default" : "destructive"}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Saving...</>
              ) : result?.passed ? "Finish & Go Home" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SubmitConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={checking}
        answeredCount={Object.keys(answers).filter(k => answers[k] !== '__SKIPPED__').length}
        totalQuestions={questions.length}
      />
    </>

  );
};
