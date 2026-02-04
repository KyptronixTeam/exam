import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

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
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    // Load categories from predefined enum since RPC may not be available
    const predefinedCategories = ['Full Stack Developer', 'Python Developer', 'Backend Developer', 'Frontend Developer', 'UI/UX Designer', 'DevOps Engineer', 'Data Analyst'];
    setCategories(['All', ...predefinedCategories]);

    // Try to load additional categories from RPC if available
    const load = async () => {
      try {
        const res = await supabase.rpc('mcq_categories');
        const catsRaw = res?.data?.categories || res?.data || null;
        if (Array.isArray(catsRaw) && catsRaw.length > 0) {
          // Normalize and dedupe: trim whitespace and remove empty values
          const normalized = Array.from(new Set(catsRaw.map((c: any) => (typeof c === 'string' ? c.trim() : c)).filter(Boolean)));
          // Merge with predefined and ensure 'All' is first
          const allCats = Array.from(new Set([...predefinedCategories, ...normalized]));
          setCategories(['All', ...allCats.filter((c: string) => c.toLowerCase() !== 'all')]);
        }
      } catch (e) {
        console.warn('Failed to load categories via rpc, using predefined', e);
      }
      fetchQuestions();
    };
    load();
  }, []);

  const fetchQuestions = async (categoryFilter?: string) => {
    try {
      const qb = supabase.from("mcq_questions").select("*");
      if (categoryFilter && categoryFilter !== 'All') qb.eq('category', categoryFilter);
      qb.order('created_at', { ascending: false });
      const { data, error } = await qb;

      if (error) throw error;
      const qs = (data || []) as Question[];
      setQuestions(qs);
      // Always merge categories discovered in the fetched questions into the
      // categories state. This ensures any category present in the DB appears
      // in the filter even if the backend RPC wasn't available earlier.
      try {
        // Support both `category` and legacy `subject` fields returned by the
        // client shim. Use functional state update to avoid stale-closure issues.
        const catsFromQs = Array.from(new Set(qs.map(q => (q.category ?? (q as any).subject)).filter(Boolean)));
        setCategories((prev) => {
          const existing = Array.isArray(prev) && prev.length > 0 ? prev.filter(c => c && c.toLowerCase() !== 'all') : [];
          const merged = Array.from(new Set([...existing, ...catsFromQs]));
          return ['All', ...merged];
        });
      } catch (e) {
        // ignore merge errors and leave categories as-is
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

        parsedQuestions.push({
          category: subj,
          question: q,
          options: [o1, o2, o3, o4],
          correctAnswer: correctIndex
        });
      }

      console.log(`Parsed ${parsedQuestions.length} questions from ${lines.length - 1} CSV rows`);
      if (skippedRows.length > 0) {
        console.warn(`Skipped ${skippedRows.length} rows. Showing up to 20 examples:`);
        console.table(skippedRows.slice(0, 20));
      }

      if (parsedQuestions.length === 0) throw new Error('No valid questions found in CSV');

      // Use the shim to call bulk endpoint
      const { error } = await supabase.from('mcq_questions').insert(parsedQuestions);

      if (error) throw error;

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
      const { error } = await supabase.from("mcq_questions").insert({
        category,
        question,
        options,
        correctAnswer: options.indexOf(correctAnswer),
        difficulty,
        isActive,
      });

      if (error) throw error;

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
      const { error } = await supabase.from("mcq_questions").delete().eq("id", id);

      if (error) throw error;

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
    <div className="grid gap-6 lg:grid-cols-3">
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
                  <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                  <SelectItem value="Python Developer">Python Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
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

      <Card>
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
                CSV format: subject,question,option1,option2,option3,option4,correct_answer (0-3)
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

      <Card>
        <CardHeader>
          <div className="w-full flex items-center justify-between gap-4">
            <div>
              <CardTitle>Existing Questions</CardTitle>
              <CardDescription>Total: {questions.length} questions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="categoryFilter" className="text-sm">Filter</Label>
              <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); fetchQuestions(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {questions.map((q) => (
              <Card key={q.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-muted-foreground">{q.category}</p>
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
  );
};
