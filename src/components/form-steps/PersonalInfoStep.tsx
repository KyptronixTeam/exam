import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, GraduationCap, BookOpen, Calendar, Briefcase, AlertTriangle, Lock, ArrowRight, Check, ChevronLeft } from "lucide-react";
import { STUDENT_ROLE_OPTIONS, isRoleEnabled } from "@/lib/mcqRoles";
import { motion, AnimatePresence } from "framer-motion";

interface PersonalInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PersonalInfoStep = ({ formData, updateFormData, onNext, onBack }: PersonalInfoStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [subStep, setSubStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    updateFormData({ [field]: value });
  };

  const handleNextSubStep = () => {
    let newErrors: Record<string, string> = {};

    if (subStep === 1) {
      if (!formData.fullName) newErrors.fullName = "Full Name is required";
      if (!formData.email) newErrors.email = "Email Address is required";
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) newErrors.email = "Invalid email format";
      
      if (!formData.phone) newErrors.phone = "Phone Number is required";
      else if (formData.phone.length < 10) newErrors.phone = "Phone Number must be 10 digits";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setSubStep(2);
    } else if (subStep === 2) {
      if (!formData.collegeName) newErrors.collegeName = "College Name is required";
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.year) newErrors.year = "Year is required";
      if (!formData.semester) newErrors.semester = "Semester is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setSubStep(3);
    }
  };

  const handlePrevSubStep = () => {
    setErrors({});
    if (subStep > 1) {
      setSubStep(subStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (subStep !== 3) {
      handleNextSubStep();
      return;
    }

    let newErrors: Record<string, string> = {};
    if (!formData.role || formData.role.trim() === '') {
      newErrors.role = 'Please select your role before proceeding.';
    }
    if (!isConfirmed) {
      newErrors.isConfirmed = 'Please confirm that your details are correct.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-scale-in" noValidate autoComplete="off">
      {/* Compact Card with smaller padding */}
      <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 md:p-8 shadow-[var(--shadow-card)] relative overflow-hidden flex flex-col">
        
        {/* Header & Back Button - Centered Text */}
        <div className="relative flex items-center justify-center mb-6">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevSubStep} 
            className="absolute left-0 rounded-full bg-white/5 hover:bg-white/10 shrink-0 w-10 h-10"
            disabled={isLoading}
          >
            <ChevronLeft className="w-5 h-5 text-zinc-300" />
          </Button>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-md text-center tracking-tight">
              {subStep === 1 && "Personal Details"}
              {subStep === 2 && "Academic Profile"}
              {subStep === 3 && "Select Role"}
            </h2>
            {/* Dot Indicators - Green Active State */}
            <div className="flex items-center gap-3 mt-3">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`transition-all duration-500 rounded-full ${
                    subStep === step 
                      ? 'w-8 h-2 bg-green-500 shadow-[0_0_10px_#22c55e]' 
                      : subStep > step
                      ? 'w-2 h-2 bg-green-500/60'
                      : 'w-2 h-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 relative mt-2">
          <AnimatePresence mode="wait">
            {subStep === 1 && (
              <motion.div 
                key="step1"
                variants={slideVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                    <User className="w-5 h-5 text-white" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName_no_autocomplete"
                    autoComplete="new-password"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={`bg-white/5 border ${errors.fullName ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-[72px] px-6 text-xl md:text-xl rounded-2xl text-white shadow-inner`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.fullName}</p>}
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                    <Mail className="w-5 h-5 text-white" /> Email Address
                  </Label>
                  <Input
                    id="email" type="email"
                    name="email_no_autocomplete"
                    autoComplete="new-password"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`bg-white/5 border ${errors.email ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-[72px] px-6 text-xl md:text-xl rounded-2xl text-white shadow-inner`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.email}</p>}
                </div>
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                    <Phone className="w-5 h-5 text-white" /> Phone Number (10 digits)
                  </Label>
                  <Input
                    id="phone" type="tel"
                    name="phone_no_autocomplete"
                    autoComplete="new-password"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleChange("phone", val);
                    }}
                    maxLength={10} minLength={10}
                    className={`bg-white/5 border ${errors.phone ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-[72px] px-6 text-xl md:text-xl rounded-2xl text-white shadow-inner tracking-widest`}
                    placeholder="1234567890"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.phone}</p>}
                </div>
              </motion.div>
            )}

            {subStep === 2 && (
              <motion.div 
                key="step2"
                variants={slideVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* College Name */}
                <div className="space-y-2">
                  <Label htmlFor="collegeName" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                    <GraduationCap className="w-5 h-5 text-white" /> College Name
                  </Label>
                  <Input
                    id="collegeName"
                    name="collegeName_no_autocomplete"
                    autoComplete="new-password"
                    value={formData.collegeName}
                    onChange={(e) => handleChange("collegeName", e.target.value)}
                    className={`bg-white/5 border ${errors.collegeName ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-[72px] px-6 text-xl md:text-xl rounded-2xl text-white shadow-inner`}
                    placeholder="Your college name"
                  />
                  {errors.collegeName && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.collegeName}</p>}
                </div>
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                    <BookOpen className="w-5 h-5 text-white" /> College Department
                  </Label>
                  <Input
                    id="department"
                    name="department_no_autocomplete"
                    autoComplete="new-password"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className={`bg-white/5 border ${errors.department ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-[72px] px-6 text-xl md:text-xl rounded-2xl text-white shadow-inner`}
                    placeholder="e.g., Computer Science"
                  />
                  {errors.department && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.department}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Year */}
                  <div className="space-y-2">
                    <Label htmlFor="year" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                      <Calendar className="w-5 h-5 text-white" /> Year
                    </Label>
                    <Select value={formData.year} onValueChange={(value) => handleChange("year", value)}>
                      <SelectTrigger className={`bg-white/5 border ${errors.year ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus:ring-0 focus:ring-offset-0 transition-all h-[72px] px-6 text-xl rounded-2xl text-white shadow-inner`}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.year && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.year}</p>}
                  </div>
                  {/* Semester */}
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                      <Calendar className="w-5 h-5 text-white" /> Semester
                    </Label>
                    <Select value={formData.semester} onValueChange={(value) => handleChange("semester", value)}>
                      <SelectTrigger className={`bg-white/5 border ${errors.semester ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus:ring-0 focus:ring-offset-0 transition-all h-[72px] px-6 text-xl rounded-2xl text-white shadow-inner`}>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.semester && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.semester}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {subStep === 3 && (
              <motion.div 
                key="step3"
                variants={slideVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2 text-zinc-300 text-xl font-medium">
                    <Briefcase className="w-5 h-5 text-white" /> Select Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => {
                    if (isRoleEnabled(value)) handleChange("role", value);
                  }}>
                    <SelectTrigger className={`bg-white/5 border ${errors.role ? 'border-red-500/50 focus:bg-red-500/10' : 'border-transparent focus:bg-white/10'} focus:ring-0 focus:ring-offset-0 transition-all h-[72px] px-6 text-xl rounded-2xl text-white shadow-inner font-semibold`}>
                      <SelectValue placeholder="Choose your desired role" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_ROLE_OPTIONS.map((role) => {
                        const enabled = isRoleEnabled(role);
                        return (
                          <SelectItem 
                            key={role} 
                            value={role}
                            disabled={!enabled}
                            className={!enabled ? "opacity-50 pointer-events-none py-3" : "py-3 text-lg cursor-pointer"}
                          >
                            <div className="flex items-center justify-between w-full pr-2">
                              <span>{role}</span>
                              {!enabled && <Lock className="w-4 h-4 ml-2" />}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-red-400 text-sm mt-1 px-1 animate-fade-in">{errors.role}</p>}
                </div>

                {/* Verification Checkbox */}
                <div className={`mt-6 p-5 bg-green-500/10 border ${errors.isConfirmed ? 'border-red-500' : 'border-green-500/30'} rounded-2xl flex items-start gap-4 transition-colors`}>
                  <AlertTriangle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                  <div className="space-y-3 w-full">
                    <div>
                      <p className="text-sm font-bold text-green-500 uppercase tracking-wider mb-1">
                        Verify your information
                      </p>
                      <p className="text-sm text-green-100/80 leading-relaxed">
                        Your Email and Phone Number will be used to create your unique exam session.
                        <span className="text-green-400 font-semibold block mt-1">
                          These cannot be changed later.
                        </span>
                      </p>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group p-2 -ml-2 rounded-xl hover:bg-green-500/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => {
                          setErrors(prev => ({...prev, isConfirmed: ''}));
                          setIsConfirmed(e.target.checked);
                        }}
                        className="w-5 h-5 rounded border-green-500/30 bg-green-500/20 text-green-500 focus:ring-green-500 focus:ring-offset-0 transition-all cursor-pointer"
                      />
                      <span className="text-base text-green-200/90 group-hover:text-green-200 transition-colors font-medium">
                        I confirm my details are correct.
                      </span>
                    </label>
                    {errors.isConfirmed && <p className="text-red-400 text-sm mt-1 animate-fade-in">{errors.isConfirmed}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Next/Submit Icon Button */}
        <div className="flex justify-center mt-8">
          <Button 
            type="submit" 
            size="icon"
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] text-white transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : subStep === 3 ? (
              <Check className="w-10 h-10 drop-shadow-md" />
            ) : (
              <ArrowRight className="w-10 h-10 drop-shadow-md" />
            )}
          </Button>
        </div>

      </div>
    </form>
  );
};
