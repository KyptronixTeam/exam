import { useEffect, useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseExamSecurityProps {
  isActive: boolean;
  onViolationThresholdReached?: () => void;
  maxViolations?: number;
}

export const useExamSecurity = ({ 
  isActive, 
  onViolationThresholdReached,
  maxViolations = 3
}: UseExamSecurityProps) => {
  const { toast } = useToast();
  const [violations, setViolations] = useState(0);

  const handleViolation = useCallback((type: string, message: string) => {
    setViolations((prev) => {
      const currentViolations = prev + 1;
      
      if (currentViolations >= maxViolations) {
        if (onViolationThresholdReached) {
          onViolationThresholdReached();
        }
      } else {
        toast({
          title: `Security Warning (${currentViolations}/${maxViolations})`,
          description: message,
          variant: 'destructive',
          duration: 5000,
        });
      }
      return currentViolations;
    });
  }, [maxViolations, onViolationThresholdReached, toast]);

  useEffect(() => {
    if (!isActive) return;

    // Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Optional: don't count right-click as a full violation, or do count it
    };

    // Prevent copy/cut/paste globally
    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('clipboard', 'Copy/paste is disabled during the assessment.');
    };

    // Prevent tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('visibility', 'Switching tabs or windows is not allowed during the assessment.');
      }
    };

    // Keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleViolation('keyboard', 'Keyboard shortcuts are disabled during the assessment.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleViolation]);

  return { violations };
};
