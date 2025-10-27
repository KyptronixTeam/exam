import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, GraduationCap, BookOpen, Calendar, Briefcase } from "lucide-react";

interface PersonalInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const departments = [
  "UI/UX",
  "Frontend Developer",
  "Backend Developer",
  "Python Developer",
  "Full Stack Developer"
];

export const PersonalInfoStep = ({ formData, updateFormData, onNext, onBack }: PersonalInfoStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || formData.role.trim() === '') {
      alert('Please select your role before proceeding.');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="animate-scale-in">
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary" />
              Full Name
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              required
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              required
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              required
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="+91 12345 67890"
            />
          </div>

          {/* College Name */}
          <div className="space-y-2">
            <Label htmlFor="collegeName" className="flex items-center gap-2 text-foreground">
              <GraduationCap className="w-4 h-4 text-primary" />
              College Name
            </Label>
            <Input
              id="collegeName"
              value={formData.collegeName}
              onChange={(e) => updateFormData({ collegeName: e.target.value })}
              required
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="Your college name"
            />
          </div>

          {/* College Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2 text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              College Department
            </Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => updateFormData({ department: e.target.value })}
              required
              className="bg-background/50 border-primary/20 focus:border-primary transition-all"
              placeholder="e.g., Computer Science"
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year" className="flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Year
            </Label>
            <Select value={formData.year} onValueChange={(value) => updateFormData({ year: value })}>
              <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Semester */}
          <div className="space-y-2">
            <Label htmlFor="semester" className="flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Semester
            </Label>
            <Select value={formData.semester} onValueChange={(value) => updateFormData({ semester: value })}>
              <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2 text-foreground">
              <Briefcase className="w-4 h-4 text-primary" />
              Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => updateFormData({ role: value })}>
              <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button type="button" variant="glass" onClick={onBack}>
            Back to Home
          </Button>
          <Button type="submit" variant="hero">
            Next Step
          </Button>
        </div>
      </div>
    </form>
  );
};
