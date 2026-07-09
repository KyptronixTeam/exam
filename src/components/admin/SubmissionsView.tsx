import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submissionsApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { MCQ_CATEGORY_OPTIONS } from "@/lib/mcqRoles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Submission {
  id?: string;
  _id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  college_name?: string;
  course_department?: string;
  year_semester?: string;
  project_title?: string;
  project_description?: string;
  website_url?: string;
  status?: string;
  created_at?: string;
  mcq_answers?: any;
  mcqScore?: any;
  mcq_score?: any;
  mcqAnswers?: any;
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    collegeName?: string;
    department?: string;
    role?: string;
    year?: string;
    semester?: string;
  };
  projectDetails?: {
    title?: string;
    description?: string;
    websiteUrl?: string;
    githubRepo?: string;
  };
  github_repo?: string;
  role?: string;
  submittedAt?: string;
  createdAt?: string;
  shortlisted?: boolean;
  essayText?: string;
  driveLink?: string;
  graphicDesignLink1?: string;
  graphicDesignLink2?: string;
  graphicDesignLink3?: string;
  questionSet?: number;
  reviewStatus?: string;
}

export const SubmissionsView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [limit] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLTableRowElement>(null);
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [shortlistedFilter, setShortlistedFilter] = useState<string>("all");
  const [collegeInput, setCollegeInput] = useState<string>("");
  const [collegeFilter, setCollegeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage, selectedRole, shortlistedFilter, collegeFilter, startDate, endDate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingMore, currentPage, totalPages]);

  const handleAuthError = (error: any) => {
    if (error instanceof ApiError && error.status === 401) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      navigate("/auth");
      return true;
    }
    return false;
  };

  const fetchSubmissions = async (page = 1) => {
    try {
      const isNewQuery = page === 1;
      if (isNewQuery) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await submissionsApi.list({
        page,
        limit,
        role: selectedRole !== "All" ? selectedRole : undefined,
        shortlisted: shortlistedFilter !== "all" ? (shortlistedFilter === "shortlisted") : undefined,
        college: collegeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (result) {
        if (isNewQuery) {
          setSubmissions(result.items || []);
        } else {
          setSubmissions(prev => [...prev, ...(result.items || [])]);
        }
        setTotalSubmissions(result.total || 0);
        setTotalPages(result.pages || 1);
      }
    } catch (error: any) {
      if (handleAuthError(error)) return;
      toast({
        title: "Error",
        description: "Failed to fetch submissions: " + (error?.message || error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch the full submission (including enriched MCQ answers) when a row is opened.
  const openSubmission = async (submission: Submission) => {
    setSelected(submission);
    setOpen(true);
    const id = submission._id || submission.id;
    if (!id) return;
    try {
      const full = await submissionsApi.getById(id);
      if (full) setSelected(prev => (prev && (prev._id === id || prev.id === id) ? { ...prev, ...full } : prev));
    } catch (error: any) {
      if (handleAuthError(error)) return;
      // Non-fatal: keep showing the list-level data we already have
      console.warn("Failed to load full submission", error);
    }
  };

  const handleToggleShortlist = async (id: string) => {
    try {
      await submissionsApi.toggleShortlist(id);
      setSubmissions(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, shortlisted: !s.shortlisted } : s));
      toast({
        title: "Success",
        description: "Shortlist status updated",
      });
    } catch (error: any) {
      if (handleAuthError(error)) return;
      toast({
        title: "Error",
        description: error?.message || String(error),
        variant: "destructive",
      });
    }
  };



  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription>
                Total submissions: {totalSubmissions} | Page {currentPage} of {totalPages}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">Filter Role:</span>
                <Select value={selectedRole} onValueChange={(val) => { setSelectedRole(val); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    {MCQ_CATEGORY_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">Shortlisted:</span>
                <Select value={shortlistedFilter} onValueChange={(val) => { setShortlistedFilter(val); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="unshortlisted">Not Shortlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-sm font-medium">College Name</span>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search college..." 
                  value={collegeInput} 
                  onChange={(e) => setCollegeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setCollegeFilter(collegeInput); setCurrentPage(1); } }}
                />
                <Button variant="secondary" onClick={() => { setCollegeFilter(collegeInput); setCurrentPage(1); }}>
                  Search
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">From Date</span>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-auto"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">To Date</span>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-auto"
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                setCollegeInput("");
                setCollegeFilter("");
                setStartDate("");
                setEndDate("");
                setSelectedRole("All");
                setShortlistedFilter("all");
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[150px]">College</TableHead>
                <TableHead className="min-w-[100px]">Role</TableHead>
                <TableHead className="min-w-[120px]">MCQ Score</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[150px]">Date</TableHead>
                <TableHead className="sticky right-0 bg-background text-right z-10 border-l shadow-[[-4px_0_4px_-2px_rgba(0,0,0,0.1)]]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[80px] float-right" /></TableCell>
                  </TableRow>
                ))
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission, index) => {
                const id = submission._id || submission.id || '';
                const fullName = submission.personalInfo?.fullName || submission.full_name || '';
                const email = submission.personalInfo?.email || submission.email || '';
                const college = submission.personalInfo?.collegeName || submission.college_name || '';
                const department = submission.personalInfo?.department || submission.course_department || '';
                const projectTitle = submission.projectDetails?.title || submission.project_title || '';
                const status = submission.status || 'submitted';
                const dateRaw = submission.submittedAt || submission.createdAt || submission.created_at;
                let dateStr = '';
                try {
                  const d = new Date(dateRaw);
                  if (!isNaN(d.getTime())) dateStr = d.toLocaleString();
                } catch (_e) {
                  dateStr = '';
                }

                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {(currentPage - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate font-medium" title={fullName}>
                      {fullName || <span className="text-muted-foreground">Unknown</span>}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={college}>
                      {college || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate" title={submission.personalInfo?.role || submission.role || ''}>
                      {submission.personalInfo?.role || submission.role || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="max-w-[120px]">
                      {(() => {
                        const percent = submission.mcqScore?.percentage ?? submission.mcq_score?.percentage;
                        if (percent === undefined || percent === null) return <span className="text-muted-foreground">-</span>;
                        return <span className="font-semibold">{percent}%</span>;
                      })()}
                    </TableCell>
                    <TableCell className="max-w-[100px]">
                      {(() => {
                        const percent = submission.mcqScore?.percentage ?? submission.mcq_score?.percentage;
                        if (percent === undefined || percent === null) return <Badge variant="outline" className="text-muted-foreground">N/A</Badge>;
                        const isPass = percent >= 70;
                        return (
                          <Badge 
                            variant="outline" 
                            className={isPass ? "bg-green-500/15 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800" : "bg-red-500/15 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800"}
                          >
                            {isPass ? "PASS" : "FAIL"}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{dateStr || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="sticky right-0 bg-background text-right z-10 border-l shadow-[[-4px_0_4px_-2px_rgba(0,0,0,0.1)]]">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openSubmission(submission)}
                          title="View Details"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleShortlist(id)}
                          className={submission.shortlisted ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"}
                          title={submission.shortlisted ? "Unshortlist" : "Shortlist"}
                        >
                          {submission.shortlisted ? (
                            <Star className="h-4 w-4 fill-current" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }))}
              
              {loadingMore && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Loading more...
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && currentPage < totalPages && (
                <TableRow ref={observerTarget}>
                  <TableCell colSpan={8} className="h-4"></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <Dialog open={open} onOpenChange={(val) => { if (!val) setSelected(null); setOpen(val); }}>
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                Review full submission data below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 p-2">
              {selected ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Candidate Profile</h4>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2 border">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-lg truncate pr-2">{selected.personalInfo?.fullName || selected.full_name || '-'}</span>
                          <Badge variant="secondary" className="whitespace-nowrap">{selected.personalInfo?.role || selected.role || '-'}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm pt-2">
                          <span className="text-muted-foreground">Email</span>
                          <span className="col-span-2 font-medium break-words">{selected.personalInfo?.email || selected.email || '-'}</span>
                          
                          <span className="text-muted-foreground">Phone</span>
                          <span className="col-span-2 font-medium">{selected.personalInfo?.phone || selected.phone || '-'}</span>
                          
                          <span className="text-muted-foreground">College</span>
                          <span className="col-span-2 font-medium">{selected.personalInfo?.collegeName || selected.college_name || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Info */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assessment Score</h4>
                      <div className="bg-muted/30 p-4 rounded-lg border flex flex-col items-center justify-center h-[142px]">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {selected.mcqScore?.percentage ?? selected.mcq_score?.percentage ?? '-'}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selected.mcqScore?.correctAnswers ?? selected.mcq_score?.correctAnswers ?? '-'} correct out of {selected.mcqScore?.totalQuestions ?? selected.mcq_score?.totalQuestions ?? (selected.mcqAnswers ? selected.mcqAnswers.length : (selected.mcq_answers ? selected.mcq_answers.length : '-'))} questions
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Question Set: <span className="font-semibold text-foreground">{selected.questionSet ?? 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project & Essay */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Project & Strategy</h4>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Project Title</p>
                          <p className="font-medium">{selected.projectDetails?.title || selected.project_title || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Important Links</p>
                          <div className="flex flex-col gap-1 text-sm">
                            {(selected.projectDetails?.websiteUrl || selected.website_url) ? (
                              <a href={selected.projectDetails?.websiteUrl || selected.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">🔗 Live Website</a>
                            ) : <span className="text-muted-foreground">No website provided</span>}
                            
                            {(selected.projectDetails?.githubRepo || selected.github_repo) ? (
                              <a href={selected.projectDetails?.githubRepo || selected.github_repo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">🔗 GitHub Repo</a>
                            ) : null}

                            {(selected.driveLink || (selected as any).drive_link) ? (
                              <a href={selected.driveLink || (selected as any).drive_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">🔗 Drive Link</a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      
                      {(selected.projectDetails?.description || selected.project_description) && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Project Description</p>
                          <p className="text-sm bg-background p-3 rounded border whitespace-pre-wrap">
                            {selected.projectDetails?.description || selected.project_description}
                          </p>
                        </div>
                      )}

                      {(selected.essayText || (selected as any).essay_text) && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Essay / Strategy</p>
                          <p className="text-sm bg-background p-3 rounded border whitespace-pre-wrap">
                            {selected.essayText || (selected as any).essay_text}
                          </p>
                        </div>
                      )}

                      {(selected.graphicDesignLink1 || selected.graphicDesignLink2 || selected.graphicDesignLink3) && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Design Links</p>
                          <div className="flex flex-col gap-1 text-sm">
                            {[selected.graphicDesignLink1, selected.graphicDesignLink2, selected.graphicDesignLink3]
                              .filter(Boolean)
                              .map((link, i) => (
                                <a key={i} href={link as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">🔗 Design Link {i + 1}</a>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full MCQ Answers */}
                  {Array.isArray(selected.mcqAnswers) && selected.mcqAnswers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        MCQ Answers ({selected.mcqAnswers.filter((a: any) => a.isCorrect).length}/{selected.mcqAnswers.length} correct)
                      </h4>
                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {selected.mcqAnswers.map((a: any, idx: number) => {
                          const answered = a.selectedAnswer !== null && a.selectedAnswer !== undefined && a.selectedAnswer !== '__SKIPPED__';
                          return (
                            <div key={idx} className={`p-3 rounded border text-sm ${a.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                              <p className="font-medium mb-1">
                                {idx + 1}. {a.question || <span className="text-muted-foreground italic">Question unavailable</span>}
                              </p>
                              <p className={a.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                                {answered ? `Answered: ${a.selectedAnswer}` : 'Skipped / not answered'}
                                {a.isCorrect ? ' ✓' : ' ✗'}
                              </p>
                              {!a.isCorrect && a.correctAnswer && (
                                <p className="text-muted-foreground mt-0.5">Correct: {a.correctAnswer}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No submission selected.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
