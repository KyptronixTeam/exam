import { useEffect, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
}

export const SubmissionsView = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5112/api/submissions?page=${page}&limit=${limit}`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.success && result.data) {
        setSubmissions(result.data.items || []);
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
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Submissions</CardTitle>
        <CardDescription>
          Total submissions: {totalSubmissions} | Page {currentPage} of {totalPages}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Project Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => {
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
                    <TableCell className="font-medium">{fullName || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{email || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{college || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{department || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{submission.personalInfo?.role || submission.role || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{projectTitle || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <Badge variant={status === "pending" ? "secondary" : "default"}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>{dateStr || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => { setSelected(submission); setOpen(true); }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalSubmissions)} of {totalSubmissions} submissions
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
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
