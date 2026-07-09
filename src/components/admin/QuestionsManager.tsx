import { useState, useEffect } from "react";
import { mcqApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { MCQ_CATEGORY_OPTIONS } from "@/lib/mcqRoles";

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  // backend may return either numeric index or text; keep as any to be flexible
  correctAnswer?: string | number;
  correct_answer?: string | number;
  difficulty?: string;
  isActive?: boolean;
  questionSet?: number;
}

export const QuestionsManager = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionSet, setQuestionSet] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedSet, setSelectedSet] = useState('All');

  useEffect(() => {
    // Load categories from predefined enum since RPC may not be available
    const predefinedCategories = MCQ_CATEGORY_OPTIONS;
    setCategories(['All', ...predefinedCategories]);

    // Try to load additional categories from the backend if available
    const load = async () => {
      try {
        const catsRaw = await mcqApi.listCategories();
        if (Array.isArray(catsRaw) && catsRaw.length > 0) {
          const normalized = Array.from(new Set(catsRaw.map((c: any) => (typeof c === 'string' ? c.trim() : c)).filter(Boolean)));
          const allCats = Array.from(new Set([...predefinedCategories, ...normalized]));
          setCategories(['All', ...allCats.filter((c: string) => c.toLowerCase() !== 'all')]);
        }
      } catch (e) {
        console.warn('Failed to load categories, using predefined', e);
      }
      fetchQuestions();
    };
    load();
  }, []);

  const fetchQuestions = async (categoryFilter?: string, setFilter?: string) => {
    try {
      const cat = categoryFilter ?? selectedCategory;
      const setSel = setFilter ?? selectedSet;
      const qs = await mcqApi.listQuestions({
        category: cat && cat !== 'All' ? cat : undefined,
        questionSet: setSel && setSel !== 'All' ? Number(setSel) : undefined,
        limit: 1000,
      }) as unknown as Question[];
      setQuestions(qs);
      // Merge any categories discovered in fetched questions into the filter list.
      try {
        const catsFromQs = Array.from(new Set(qs.map(q => (q.category ?? (q as any).subject)).filter(Boolean)));
        setCategories((prev) => {
          const existing = Array.isArray(prev) && prev.length > 0 ? prev.filter(c => c && c.toLowerCase() !== 'all') : [];
          const merged = Array.from(new Set([...existing, ...catsFromQs]));
          return ['All', ...merged];
        });
      } catch (e) {
        console.warn('Failed to merge categories from questions', e);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch questions: " + error.message,
        variant: "destructive",
      });
    }
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error('CSV must have at least header and one data row');

      // Parse header using CSV-aware parser to handle quoted header names
      const rawHeaderFields = parseCsvLine(lines[0]).map(h => h.trim());
      // strip BOM if present on first header
      if (rawHeaderFields.length > 0) rawHeaderFields[0] = rawHeaderFields[0].replace(/^\uFEFF/, '');
      const headerFields = rawHeaderFields.map(h => h.toLowerCase());

      // Build index map for columns (lowercased keys)
      const indexMap: Record<string, number> = {};
      headerFields.forEach((h, idx) => { indexMap[h] = idx; });

      // helper to find first matching alias in indexMap
      const findIdx = (aliases: string[]) => {
        for (const a of aliases) {
          if (indexMap[a] !== undefined) return indexMap[a];
        }
        return -1;
      };

      // Accept either old headers (subject, correct_answer) or new ones (category, correctAnswer)
      const colCategoryIdx = findIdx(['category', 'subject']);
      const colQuestionIdx = findIdx(['question']);
      const colOption1Idx = findIdx(['option1', 'option_1']);
      const colOption2Idx = findIdx(['option2', 'option_2']);
      const colOption3Idx = findIdx(['option3', 'option_3']);
      const colOption4Idx = findIdx(['option4', 'option_4']);
      const colCorrectIdx = findIdx(['correct_answer', 'correctanswer', 'correct-answer', 'correctAnswer']);
      const colDifficultyIdx = findIdx(['difficulty']);
      const colPointsIdx = findIdx(['points']);
      const colIsActiveIdx = findIdx(['isactive', 'is_active', 'active']);
      const colSetIdx = findIdx(['questionset', 'question_set', 'set']);

      if (colCategoryIdx < 0 || colQuestionIdx < 0 || colOption1Idx < 0 || colOption2Idx < 0 || colOption3Idx < 0 || colOption4Idx < 0 || colCorrectIdx < 0) {
        throw new Error('CSV must have columns: category/subject, question, option1..option4, correct_answer/correctAnswer');
      }

      const parsedQuestions: any[] = [];
      const skippedRows: Array<{ row: number; reason: string; values: string[] }> = [];

      const normalizeText = (s: string) => {
        if (!s && s !== '') return '';
        let t = s.trim();
        // strip surrounding single/double quotes
        t = t.replace(/^['"]+|['"]+$/g, '').trim();
        // strip trailing punctuation that's likely not significant for matching
        t = t.replace(/[\.\!\?,;:\s]+$/g, '');
        return t.toLowerCase();
      };
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        // Normalize length by trimming trailing empty values
        // Allow rows that may contain extra commas inside quotes already handled by parser
        if (values.length < headerFields.length) {
          console.warn(`Skipping row ${i + 1}: expected at least ${headerFields.length} columns, got ${values.length}`, values);
          continue;
        }
        let subj = '';
        let q = '';
        let o1 = '';
        let o2 = '';
        let o3 = '';
        let o4 = '';
        let ca = '';
        let difficultyVal = '';
        let pointsVal: number | undefined = undefined;
        let isActiveVal: boolean | undefined = undefined;

        if (values.length === headerFields.length) {
          subj = (values[colCategoryIdx] || '').trim();
          q = (values[colQuestionIdx] || '').trim();
          o1 = (values[colOption1Idx] || '').trim();
          o2 = (values[colOption2Idx] || '').trim();
          o3 = (values[colOption3Idx] || '').trim();
          o4 = (values[colOption4Idx] || '').trim();
          ca = (values[colCorrectIdx] || '').trim();
          if (colDifficultyIdx >= 0) difficultyVal = (values[colDifficultyIdx] || '').trim();
          if (colPointsIdx >= 0) pointsVal = Number((values[colPointsIdx] || '').trim());
          if (colIsActiveIdx >= 0) {
            const v = (values[colIsActiveIdx] || '').trim().toLowerCase();
            isActiveVal = v === 'true' || v === '1' || v === 'yes';
          }
        } else if (values.length > headerFields.length) {
          // Attempt best-effort recovery when a row has extra commas (unquoted commas inside fields)
          // Assume columns are in standard order: subject,question,option1..option4,correct_answer
          subj = (values[colCategoryIdx] || values[0] || '').trim();
          q = (values[colQuestionIdx] || values[1] || '').trim();

          // Last field is likely the correct_answer
          ca = (values[values.length - 1] || '').trim();

          // try to pick up optional fields if present at the end
          // If we have extra columns beyond options+correct, try parse difficulty/points/isActive heuristically
          const extras = values.slice(values.length - 4, values.length - 1).map(s => s.trim());
          // extras may contain difficulty, points, isActive in some order; attempt common patterns
          for (const e of extras) {
            if (!e) continue;
            if (!difficultyVal && /^(easy|medium|hard)$/i.test(e)) difficultyVal = e;
            else if (pointsVal === undefined && /^\d+$/.test(e)) pointsVal = Number(e);
            else if (isActiveVal === undefined && /^(true|false|1|0|yes|no)$/i.test(e)) isActiveVal = /^(true|1|yes)$/i.test(e);
          }

          // Everything between option1 index and last field belongs to options but may have been split.
          const optsPart = values.slice(2, values.length - 1).map(s => s.trim());

          // Merge fragments from the right until we have 4 option strings
          const merged = [...optsPart];
          while (merged.length > 4) {
            // merge the penultimate and last fragments
            const last = merged.pop() as string;
            merged[merged.length - 1] = `${merged[merged.length - 1]},${last}`;
          }

          // Pad with empty strings if fewer than 4
          while (merged.length < 4) merged.push('');

          [o1, o2, o3, o4] = merged.slice(0, 4);

          // Log first few occurrences to help debugging
          if (i < 6) {
            console.warn(`Recovered row ${i + 1}: merged ${optsPart.length} option fragments into 4 options`, {
              rawValues: values,
              mergedOptions: merged,
              correct_answer_candidate: ca,
            });
          }
        } else {
          // fewer columns already handled above; this branch should not happen
          console.warn(`Unexpected column count on row ${i + 1}`, values);
        }

        if (!subj || !q) {
          skippedRows.push({ row: i + 1, reason: 'missing subject or question', values });
          console.warn(`Skipping row ${i + 1}: missing subject or question`);
          continue;
        }

        // Determine correct answer index: accept numeric index (0-3) or option text
        // Normalize correct answer candidate for numeric parsing or text matching
        const caClean = (ca || '').trim().replace(/^['"]+|['"]+$/g, '');
        let correctIndex = parseInt(caClean, 10);
        if (isNaN(correctIndex)) {
          // try match by option text (case-insensitive) using normalization
          const opts = [o1, o2, o3, o4];
          const found = opts.findIndex(opt => {
            if (!opt) return false;
            return normalizeText(opt) === normalizeText(ca || '');
          });
          if (found >= 0) correctIndex = found;
        }

        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
          skippedRows.push({ row: i + 1, reason: `invalid correct_answer '${ca}'`, values });
          console.warn(`Skipping row ${i + 1}: invalid correct_answer '${ca}'`);
          continue;
        }

        const setVal = colSetIdx >= 0 ? parseInt((values[colSetIdx] || '').trim(), 10) : NaN;
        parsedQuestions.push({
          category: subj,
          question: q,
          options: [o1, o2, o3, o4],
          correctAnswer: correctIndex,
          difficulty: /^(easy|medium|hard)$/i.test(difficultyVal) ? difficultyVal.toLowerCase() : 'medium',
          points: pointsVal && !Number.isNaN(pointsVal) ? pointsVal : 1,
          questionSet: Number.isFinite(setVal) && setVal >= 1 ? setVal : 1,
          isActive: isActiveVal ?? true,
        });
      }

      console.log(`Parsed ${parsedQuestions.length} questions from ${lines.length - 1} CSV rows`);
      if (skippedRows.length > 0) {
        console.warn(`Skipped ${skippedRows.length} rows. Showing up to 20 examples:`);
        console.table(skippedRows.slice(0, 20));
      }

      if (parsedQuestions.length === 0) throw new Error('No valid questions found in CSV');

      await mcqApi.bulkCreateQuestions(parsedQuestions);

      toast({
        title: "Success",
        description: `Uploaded ${parsedQuestions.length} questions from CSV`,
      });

      setCsvFile(null);
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await mcqApi.createQuestion({
        category,
        question,
        options,
        correctAnswer: options.indexOf(correctAnswer),
        difficulty,
        questionSet: Number(questionSet) || 1,
        isActive,
      });

      toast({
        title: "Success",
        description: "Question added successfully",
      });

      // Reset form
      setCategory("");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setDifficulty("medium");
      setQuestionSet("1");
      setIsActive(true);
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await mcqApi.deleteQuestion(id);

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant={showQuestions ? "secondary" : "default"}
          onClick={() => setShowQuestions(!showQuestions)}
          className="shadow-sm"
        >
          {showQuestions ? "Hide Questions" : "View Existing Questions"}
        </Button>
      </div>

      <div className={showQuestions ? "w-full" : "flex flex-col items-center"}>
        {!showQuestions && (
          <div className="space-y-6 w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Create assessment questions for different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MCQ_CATEGORY_OPTIONS.map((categoryOption) => (
                        <SelectItem key={categoryOption} value={categoryOption}>
                          {categoryOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {options.map((option, index) => (
                    <Input
                      key={index}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      required
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correct">Correct Answer</Label>
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {options
                        .filter((option) => option.trim() !== "")
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionSet">Question Set</Label>
                  <Select value={questionSet} onValueChange={setQuestionSet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Set 1</SelectItem>
                      <SelectItem value="2">Set 2</SelectItem>
                      <SelectItem value="3">Set 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>Bulk Upload CSV</CardTitle>
              <CardDescription>Upload multiple questions from a CSV file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv">CSV File</Label>
                  <Input
                    id="csv"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    CSV format: category,question,option1,option2,option3,option4,correct_answer (0-3),difficulty,questionSet
                    <br />(questionSet column is optional; defaults to 1)
                  </p>
                </div>
                <Button
                  onClick={handleCsvUpload}
                  className="w-full"
                  disabled={loading || !csvFile}
                >
                  Upload CSV
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {showQuestions && (
          <div className="w-full">
            <Card className="h-full flex flex-col border-primary/20 shadow-md">
              <CardHeader>
                <div className="w-full flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Existing Questions</CardTitle>
                    <CardDescription>Total: {questions.length} questions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="categoryFilter" className="text-sm">Filter</Label>
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); fetchQuestions(v, selectedSet); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedSet} onValueChange={(v) => { setSelectedSet(v); fetchQuestions(selectedCategory, v); }}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="All sets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Sets</SelectItem>
                        <SelectItem value="1">Set 1</SelectItem>
                        <SelectItem value="2">Set 2</SelectItem>
                        <SelectItem value="3">Set 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto p-6 pt-0">
                  {questions.map((q) => (
                    <Card key={q.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-muted-foreground">{q.category} · Set {q.questionSet ?? 1}</p>
                              <p className="font-medium mt-1">{q.question}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                Difficulty: {q.difficulty || 'medium'}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-1 text-sm">
                            {q.options.map((opt, idx) => {
                              const correctIndex = q.correctAnswer ?? q.correct_answer;
                              const isCorrect = Number(correctIndex) === idx;
                              return (
                                <p
                                  key={idx}
                                  className={isCorrect ? "text-green-600 font-medium" : ""}
                                >
                                  {idx + 1}. {opt}
                                  {isCorrect && " ✓"}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
