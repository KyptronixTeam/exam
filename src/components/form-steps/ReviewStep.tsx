import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, GraduationCap, FileText, Globe, Upload, Loader2 } from "lucide-react";

interface ReviewStepProps {
  formData: any;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const ReviewStep = ({ formData, onSubmit, onBack, isSubmitting }: ReviewStepProps) => {
  return (
    <div className="animate-scale-in">
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Review & Submit
        </h2>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6 bg-muted/20 border-primary/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">{formData.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{formData.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{formData.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">College</p>
                <p className="font-medium text-foreground">{formData.collegeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium text-foreground">{formData.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Applied Role</p>
                <p className="font-medium text-foreground">{formData.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Year & Semester</p>
                <p className="font-medium text-foreground">
                  Year {formData.year}, Sem {formData.semester}
                </p>
              </div>
            </div>
          </Card>

          {/* Project Details */}
          <Card className="p-6 bg-muted/20 border-primary/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              Project Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Project Title</p>
                <p className="font-medium text-foreground">{formData.projectTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium text-foreground">{formData.projectDescription}</p>
              </div>
              {formData.websiteUrl && (
                <div>
                  <p className="text-muted-foreground">Website URL</p>
                  <a
                    href={formData.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {formData.websiteUrl}
                  </a>
                </div>
              )}
              {formData.githubRepo && (
                <div>
                  <p className="text-muted-foreground">GitHub Repo</p>
                  <a
                    href={formData.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {formData.githubRepo}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Files */}
          {formData.files.length > 0 && (
            <Card className="p-6 bg-muted/20 border-primary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Upload className="w-5 h-5 text-primary" />
                Uploaded Files
              </h3>
              <div className="space-y-2">
                {formData.files.map((file: File, index: number) => (
                  <div key={index} className="text-sm text-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {file.name}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-center text-foreground">
            By submitting, you confirm that all information provided is accurate and complete.
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <Button type="button" variant="glass" onClick={onBack} disabled={isSubmitting}>
            Previous
          </Button>
          <Button
            type="button"
            variant="hero"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Project"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
