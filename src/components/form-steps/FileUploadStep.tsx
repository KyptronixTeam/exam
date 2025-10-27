import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, File, X } from "lucide-react";
import { useRef } from "react";

interface FileUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FileUploadStep = ({ formData, updateFormData, onNext, onBack }: FileUploadStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      updateFormData({ files: [...formData.files, ...newFiles] });
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = formData.files.filter((_: File, i: number) => i !== index);
    updateFormData({ files: newFiles });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      updateFormData({ files: [...formData.files, ...newFiles] });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="animate-scale-in">
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Upload Project Files
        </h2>

        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Accepted: ZIP, PDF, DOCX, PPTX (Max 200 MB)
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".zip,.pdf,.docx,.pptx,.doc,.ppt"
            />
          </div>

          {/* File List */}
          {formData.files.length > 0 && (
            <div className="space-y-3">
              <Label className="text-foreground">Uploaded Files ({formData.files.length})</Label>
              {formData.files.map((file: File, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-primary/10 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
