import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Globe, Sparkles } from "lucide-react";

interface ProjectDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProjectDetailsStep = ({ formData, updateFormData, onNext, onBack }: ProjectDetailsStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="animate-scale-in">
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Project Details
        </h2>

        <div className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="projectTitle" className="flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4 text-primary" />
              Project Title
            </Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) => updateFormData({ projectTitle: e.target.value })}
              required
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="Enter your project title"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="projectDescription" className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Project Description
            </Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={(e) => updateFormData({ projectDescription: e.target.value })}
              required
              rows={6}
              className="bg-background/50 border-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Describe your project, its features, technologies used, and objectives..."
            />
            <p className="text-xs text-muted-foreground">
              {formData.projectDescription.length} characters
            </p>
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2 text-foreground">
              <Globe className="w-4 h-4 text-primary" />
              Website URL (Optional)
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="https://your-project-website.com"
            />
            {formData.websiteUrl && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <a
                  href={formData.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {formData.websiteUrl}
                </a>
              </div>
            )}
          </div>

          {/* GitHub Repo URL */}
          <div className="space-y-2">
            <Label htmlFor="githubRepo" className="flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4 text-primary" />
              GitHub Repo/Google Drive Link (Optional)
            </Label>
            <Input
              id="githubRepo"
              type="url"
              value={formData.githubRepo}
              onChange={(e) => updateFormData({ githubRepo: e.target.value })}
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="https://github.com/your-org/your-repo"
            />
            {formData.githubRepo && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <a
                  href={formData.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {formData.githubRepo}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button type="button" variant="glass" onClick={onBack}>
            Previous
          </Button>
          <Button type="submit" variant="hero">
            Next Step
          </Button>
        </div>
      </div>
    </form>
  );
};
