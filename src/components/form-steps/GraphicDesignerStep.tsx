import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { SubmitConfirmModal } from "../SubmitConfirmModal";
import { FileText, Link as LinkIcon, ClipboardPaste } from "lucide-react";

interface GraphicDesignerStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const GraphicDesignerStep = ({ formData, updateFormData, onSubmit, onBack, isSubmitting }: GraphicDesignerStepProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { violations } = useExamSecurity({ isActive: true, maxViolations: 3 });

  const content1 = `Headline:
You Never Get A Second Chance At A First Click.

Subheadline:
When potential customers visit your website, they decide within seconds whether to stay or leave. A modern website helps you make those seconds count.

CTA Options:
Start Converting`;

  const content2 = `Headline:
What Happens When Someone Searches For Your Business?

Subheadline:
Do they find a strong online presence or a competitor? Your digital marketing strategy often answers that question before you can.

CTA:
Own Search`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.graphicDesignLink1 || !formData.graphicDesignLink1.includes("drive.google.com") || !formData.graphicDesignLink2 || !formData.graphicDesignLink2.includes("drive.google.com")) {
      alert("Please provide valid Google Drive links for both contents.");
      return;
    }
    setShowConfirm(true);
  };

  const handlePasteLink1 = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateFormData({ graphicDesignLink1: text });
      }
    } catch (err) {
      alert("Failed to read clipboard. Please ensure you have granted clipboard permissions.");
    }
  };

  const handlePasteLink2 = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateFormData({ graphicDesignLink2: text });
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
            Graphic Designer Assessment
          </CardTitle>
          <CardDescription>
            Create two social media posts based on the provided content and submit their Google Drive links.
            <br />
            <span className="text-red-500 font-semibold">Security Warning: Do not switch tabs. Violations: {violations}/3</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Content 1
            </Label>
            <div className="p-6 bg-muted/30 rounded-lg border border-primary/20 whitespace-pre-wrap font-mono text-sm leading-relaxed select-none">
              {content1}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graphicDesignLink1" className="flex items-center gap-2 text-md font-semibold">
                <LinkIcon className="w-4 h-4 text-primary" />
                Google Drive Link for Content 1
              </Label>
              <div className="flex gap-2">
                <Input
                  id="graphicDesignLink1"
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={formData.graphicDesignLink1 || ""}
                  onChange={(e) => updateFormData({ graphicDesignLink1: e.target.value })}
                  onPaste={(e) => e.preventDefault()}
                  className="bg-background/50 border-primary/20 focus:border-primary transition-all flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePasteLink1}
                  className="shrink-0 flex items-center gap-2"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste Link
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Content 2
            </Label>
            <div className="p-6 bg-muted/30 rounded-lg border border-primary/20 whitespace-pre-wrap font-mono text-sm leading-relaxed select-none">
              {content2}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graphicDesignLink2" className="flex items-center gap-2 text-md font-semibold">
                <LinkIcon className="w-4 h-4 text-primary" />
                Google Drive Link for Content 2
              </Label>
              <div className="flex gap-2">
                <Input
                  id="graphicDesignLink2"
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={formData.graphicDesignLink2 || ""}
                  onChange={(e) => updateFormData({ graphicDesignLink2: e.target.value })}
                  onPaste={(e) => e.preventDefault()}
                  className="bg-background/50 border-primary/20 focus:border-primary transition-all flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePasteLink2}
                  className="shrink-0 flex items-center gap-2"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste Link
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Ensure both link accesses are set to "Anyone with the link can view".
            </p>
            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
                Previous
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.graphicDesignLink1 || !formData.graphicDesignLink2}>
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
