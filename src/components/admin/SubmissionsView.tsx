import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

  const fetchSubmissions = async (page = 1) => {
    try {
      const isNewQuery = page === 1;
      if (isNewQuery) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5112';
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = (session as any)?.accessToken || (session as any)?.access_token;

      if (!accessToken) {
        throw new Error('Admin session not found');
      }

      let queryParams = `page=${page}&limit=${limit}`;
      if (selectedRole !== "All") queryParams += `&role=${encodeURIComponent(selectedRole)}`;
      if (shortlistedFilter !== "all") queryParams += `&shortlisted=${shortlistedFilter === "shortlisted"}`;
      if (collegeFilter) queryParams += `&college=${encodeURIComponent(collegeFilter)}`;
      if (startDate) queryParams += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) queryParams += `&endDate=${encodeURIComponent(endDate)}`;

      const response = await fetch(`${apiUrl}/api/submissions?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success && result.data) {
        if (isNewQuery) {
          setSubmissions(result.data.items || []);
        } else {
          setSubmissions(prev => [...prev, ...(result.data.items || [])]);
        }
        setTotalSubmissions(result.data.total || 0);
        setTotalPages(result.data.pages || 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleToggleShortlist = async (id: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5112';
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = (session as any)?.accessToken || (session as any)?.access_token;

      if (!accessToken) throw new Error('Admin session not found');

      const response = await fetch(`${apiUrl}/api/submissions/${id}/shortlist`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (!response.ok) throw new Error('Failed to toggle shortlist');

      const result = await response.json();
      if (result.success) {
        setSubmissions(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, shortlisted: !s.shortlisted } : s));
        toast({
          title: "Success",
          description: "Shortlist status updated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
                          onClick={() => { setSelected(submission); setOpen(true); }}
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
            <div className="space-y-4 p-2">
              {selected ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <p><strong>Name:</strong> {selected.personalInfo?.fullName || selected.full_name || '-'}</p>
                    <p><strong>Email:</strong> {selected.personalInfo?.email || selected.email || '-'}</p>
                    <p><strong>Phone:</strong> {selected.personalInfo?.phone || selected.phone || '-'}</p>
                    <p><strong>College:</strong> {selected.personalInfo?.collegeName || selected.college_name || '-'}</p>
                    <p><strong>Department:</strong> {selected.personalInfo?.department || selected.course_department || '-'}</p>
                    <p><strong>Role:</strong> {selected.personalInfo?.role || selected.role || '-'}</p>
                    <p><strong>Year/Sem:</strong> {selected.personalInfo ? `${selected.personalInfo.year || '-'} / ${selected.personalInfo.semester || '-'}` : selected.year_semester || '-'}</p>
                  </div>
                  <div className="p-4 border rounded">
                    <h4 className="font-semibold mb-2">Project Details</h4>
                    <p><strong>Title:</strong> {selected.projectDetails?.title || selected.project_title || '-'}</p>
                    <p className="break-words"><strong>Description:</strong> {selected.projectDetails?.description || selected.project_description || '-'}</p>
                    <p><strong>Website:</strong> {selected.projectDetails?.websiteUrl || selected.website_url || '-'}</p>
                    <p><strong>GitHub Repo:</strong> {selected.projectDetails?.githubRepo || selected.github_repo || '-'}</p>
                    {(selected.driveLink || (selected as any).drive_link) && (
                      <p><strong>Drive Link:</strong> <a href={selected.driveLink || (selected as any).drive_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{selected.driveLink || (selected as any).drive_link}</a></p>
                    )}
                    {(selected.essayText || (selected as any).essay_text) && (
                      <p className="mt-2 whitespace-pre-wrap break-words"><strong>Essay / Strategy:</strong><br/>{selected.essayText || (selected as any).essay_text}</p>
                    )}
                  </div>

                  <div className="p-4 border rounded md:col-span-2">
                    <h4 className="font-semibold mb-2">MCQ Score / Answers</h4>
                    <div className="mb-2 text-sm">
                      <strong>Total:</strong> {selected.mcqScore?.totalQuestions ?? selected.mcq_score?.totalQuestions ?? (selected.mcq_answers ? selected.mcq_answers.length : '-')}
                      <span className="ml-4"><strong>Correct:</strong> {selected.mcqScore?.correctAnswers ?? selected.mcq_score?.correctAnswers ?? '-'}</span>
                      <span className="ml-4"><strong>Percent:</strong> {selected.mcqScore?.percentage ?? selected.mcq_score?.percentage ?? '-'}%</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="pb-1">#</th>
                            <th className="pb-1">Question ID</th>
                            <th className="pb-1">Selected</th>
                            <th className="pb-1">Correct</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selected.mcqAnswers || selected.mcq_answers || []).map((a: any, i: number) => (
                            <tr key={i} className="border-t">
                              <td className="py-1 align-top">{i + 1}</td>
                              <td className="py-1 align-top break-words text-xs">{a.questionId}</td>
                              <td className="py-1 align-top">{typeof a.selectedAnswer === 'number' ? `Option ${a.selectedAnswer}` : String(a.selectedAnswer)}</td>
                              <td className="py-1 align-top">{a.isCorrect ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 border rounded md:col-span-2">
                    <h4 className="font-semibold mb-2">Raw Submission JSON</h4>
                    <pre className="text-xs whitespace-pre-wrap overflow-x-auto bg-muted p-2 rounded">{JSON.stringify(selected, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div>No submission selected.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
