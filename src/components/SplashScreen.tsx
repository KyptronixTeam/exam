import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import kyptronixLogo from '@/assets/kyptronix-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500); // Wait 4.5 seconds before transitioning out
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#020617]"
    >
      {/* Dynamic Background Glow based on mouse position */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        animate={{
          background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#00D4FF]"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            boxShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF'
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Background Gradients */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="h-[500px] w-[500px] rounded-full bg-[#8B5CF6] blur-[150px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1.2 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute h-[400px] w-[400px] rounded-full bg-[#00D4FF] blur-[150px]" 
        />
      </div>

      {/* Global Background Blur & Darkening Overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-[#020617]/70 pointer-events-none z-0" />

      {/* Scanning Neon Line */}
      <motion.div
        initial={{ top: '-10%', opacity: 0 }}
        animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: "linear", delay: 0.2 }}
        className="absolute left-0 right-0 h-[2px] w-full bg-[#00D4FF] shadow-[0_0_20px_#00D4FF,0_0_40px_#8B5CF6] z-10"
      />

      {/* Content Container (Transparent/No Card) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="relative z-20 flex flex-col items-center justify-center w-full"
      >
        {/* Logo Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 1.5, ease: "easeOut" }}
          className="relative mb-8"
        >
          <img src={kyptronixLogo} alt="Kyptronix Logo" className="relative h-24 md:h-32 w-auto object-contain" />
        </motion.div>

        {/* Text Animations */}
        <div className="flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="text-lg md:text-xl font-medium text-[#00D4FF] tracking-[0.3em] uppercase mb-3 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]"
          >
            Welcome to
          </motion.h2>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]"
          >
            Kyptronix LLP
          </motion.h1>


        </div>
      </motion.div>
    </motion.div>
  );
};
