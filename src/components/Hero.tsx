import { Button } from "@/components/ui/button";
import { Rocket, Shield } from "lucide-react";
import kyptronixLogo from "@/assets/kyptronix-logo.png";
import { Link } from "react-router-dom";

interface HeroProps {
  onStartSubmission: () => void;
}

export const Hero = ({ onStartSubmission }: HeroProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Admin Button - Top Right */}
      <Link to="/auth" className="absolute top-4 right-4 z-20">
        <Button variant="outline" size="sm">
          <Shield className="mr-2 h-4 w-4" />
          Admin Login
        </Button>
      </Link>
      
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-30" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      {/* Main Hero Card */}
      <div className="relative z-10 max-w-2xl w-full animate-scale-in">
        <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-12 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-float">
            <div className="relative">
              <img 
                src={kyptronixLogo} 
                alt="Kyptronix Logo" 
                className="w-24 h-24 object-contain"
              />
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-glow" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
            College Project Submission Portal
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-center text-muted-foreground mb-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Powered by <span className="text-primary font-semibold">Kyptronix LLP</span>
          </p>
          
          <p className="text-lg text-center text-accent mb-10 font-medium animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Submit. Track. Grow.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              variant="hero" 
              size="xl"
              onClick={onStartSubmission}
              className="group"
            >
              <Rocket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Submission
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {["Auto-Sync", "File Upload", "Track Progress"].map((feature) => (
              <div
                key={feature}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary backdrop-blur-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 border-2 border-primary/30 rounded-lg rotate-12 animate-float" />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 border-2 border-secondary/30 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
      </div>
    </div>
  );
};
