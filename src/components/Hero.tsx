import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import kyptronixLogo from "@/assets/kyptronix-logo.png";

interface HeroProps {
  onStartSubmission: () => void;
}

export const Hero = ({ onStartSubmission }: HeroProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 backdrop-blur-sm bg-background/40">
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-30" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: "1s" }} />

      {/* Main Hero Card */}
      <div className="relative z-10 max-w-2xl w-full animate-slide-in-left">
        <div className="w-full flex flex-col items-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src={kyptronixLogo} 
                alt="Kyptronix Logo" 
                className="w-24 h-24 object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-6 text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-fade-in">
            Are You Ready ?
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-center text-zinc-300 font-light mb-12 max-w-xl animate-fade-in drop-shadow-md" style={{ animationDelay: "0.2s" }}>
            Prepare to submit your college project securely and efficiently. Track your progress every step of the way.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="xl"
              onClick={onStartSubmission}
              className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] rounded-full px-10 py-8"
            >
              {/* Green Hover Animation Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              
              {/* Button Content */}
              <div className="relative z-10 flex items-center">
                <Rocket className="mr-3 h-6 w-6 group-hover:-translate-y-1 group-hover:rotate-12 transition-all duration-300" />
                <span className="font-semibold tracking-wide">I'M READY</span>
              </div>
            </Button>
          </div>


        </div>

        {/* Floating Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 border-2 border-primary/30 rounded-lg rotate-12 animate-float" />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 border-2 border-secondary/30 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
      </div>
    </div>
  );
};
