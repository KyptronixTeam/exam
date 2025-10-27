import { useState } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Hero } from "@/components/Hero";
import { SubmissionForm } from "@/components/SubmissionForm";

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {!showForm ? (
          <Hero onStartSubmission={() => setShowForm(true)} />
        ) : (
          <SubmissionForm onBack={() => setShowForm(false)} />
        )}
      </div>
    </div>
  );
};

export default Index;
