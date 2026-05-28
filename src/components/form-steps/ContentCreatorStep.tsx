import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { SubmitConfirmModal } from "../SubmitConfirmModal";
import { FileText, Link as LinkIcon, ClipboardPaste } from "lucide-react";

interface ContentCreatorStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const ContentCreatorStep = ({ formData, updateFormData, onSubmit, onBack, isSubmitting }: ContentCreatorStepProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { violations } = useExamSecurity({ isActive: true, maxViolations: 3 });

  const scriptContent = `Kyptronix Automation Marketing Script

Introduction (0:00 - 0:15)
[Visual: Host smiling, energetic. Graphic of 'Kyptronix Automation' logo appears]
Host: "Tired of spending hours on repetitive marketing tasks? What if you could automate your emails, social media, and lead generation while you sleep? Welcome to Kyptronix Automation!"

Problem (0:15 - 0:30)
[Visual: Split screen showing a stressed business owner manually replying to emails vs. a relaxed owner sipping coffee]
Host: "Most business owners are drowning in manual tasks. You're losing leads because you can't follow up fast enough. That's money left on the table."

Solution (0:30 - 0:50)
[Visual: Screen recording of Kyptronix software dashboard, highlighting ease of use]
Host: "Kyptronix Automation changes everything. We provide a complete suite of tools to put your marketing on autopilot. Capture leads, nurture them with personalized sequences, and convert them into paying customers—all automatically."

Call to Action (0:50 - 1:00)
[Visual: Host pointing down to a link. Text: 'Start Your Free Trial Today']
Host: "Stop working in your business and start working on it. Click the link below to start your 14-day free trial with Kyptronix Automation today!"`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driveLink || !formData.driveLink.includes("drive.google.com")) {
      alert("Please provide a valid Google Drive link.");
      return;
    }
    setShowConfirm(true);
  };

  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateFormData({ driveLink: text });
      }
    } catch (err) {
      alert("Failed to read clipboard. Please ensure you have granted clipboard permissions.");
    }
  };

  return (
    <>
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm animate-scale-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Content Creator Assessment
          </CardTitle>
          <CardDescription>
            Record a short video reading the provided script and submit the Google Drive link.
            <br />
            <span className="text-red-500 font-semibold">Security Warning: Do not switch tabs. Violations: {violations}/3</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Video Script
            </Label>
            <div 
              className="p-6 bg-muted/30 rounded-lg border border-primary/20 whitespace-pre-wrap font-mono text-sm leading-relaxed select-none"
            >
              {scriptContent}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driveLink" className="flex items-center gap-2 text-lg font-semibold">
                <LinkIcon className="w-5 h-5 text-primary" />
                Google Drive Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="driveLink"
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={formData.driveLink || ""}
                  onChange={(e) => updateFormData({ driveLink: e.target.value })}
                  onPaste={(e) => e.preventDefault()}
                  className="bg-background/50 border-primary/20 focus:border-primary transition-all flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePasteLink}
                  className="shrink-0 flex items-center gap-2"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ensure the link access is set to "Anyone with the link can view".
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
                Previous
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.driveLink}>
                Submit Assessment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SubmitConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          onSubmit();
        }}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
