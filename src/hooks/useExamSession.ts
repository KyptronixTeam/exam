import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LOCAL_STORAGE_KEY = 'exam_session';

interface SessionData {
    sessionId: string;
    currentStep: number;
    formData: Record<string, any>;
    status: 'in_progress' | 'passed' | 'failed';
}

interface StartSessionResult {
    success: boolean;
    session?: SessionData;
    isNew?: boolean;
    alreadyCompleted?: boolean;
    status?: string;
    message?: string;
    error?: string;
}

interface SubmitResult {
    success: boolean;
    isPassing?: boolean;
    score?: {
        totalQuestions: number;
        correctAnswers: number;
        percentage: number;
    };
    status?: string;
    submissionId?: string;
    message?: string;
    error?: string;
}

/**
 * Hook for managing exam session with localStorage + API synchronization
 */
export const useExamSession = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Get session from localStorage
     */
    const getLocalSession = useCallback((): SessionData | null => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to parse local session:', e);
        }
        return null;
    }, []);

    /**
     * Save session to localStorage
     */
    const saveLocalSession = useCallback((session: SessionData) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
        } catch (e) {
            console.error('Failed to save local session:', e);
        }
    }, []);

    /**
     * Clear session from localStorage
     */
    const clearLocalSession = useCallback(() => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setSessionId(null);
        } catch (e) {
            console.error('Failed to clear local session:', e);
        }
    }, []);

    /**
     * Start or resume a session
     */
    const startSession = useCallback(async (email: string, phone: string): Promise<StartSessionResult> => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/session/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone })
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, error: data.error?.message || 'Failed to start session' };
            }

            // Check if already completed
            if (data.data.alreadyCompleted) {
                return {
                    success: true,
                    alreadyCompleted: true,
                    status: data.data.status,
                    message: data.data.message
                };
            }

            // Save session locally
            const session: SessionData = {
                sessionId: data.data.session.sessionId,
                currentStep: data.data.session.currentStep,
                formData: data.data.session.formData || {},
                status: data.data.session.status
            };
            saveLocalSession(session);
            setSessionId(session.sessionId);

            return {
                success: true,
                session,
                isNew: data.data.isNew,
                alreadyCompleted: false
            };
        } catch (e) {
            console.error('Start session error:', e);
            return { success: false, error: 'Network error' };
        } finally {
            setIsLoading(false);
        }
    }, [saveLocalSession]);

    /**
     * Save progress to both localStorage and API
     */
    const saveProgress = useCallback(async (currentStep: number, formData: Record<string, any>) => {
        // Get current session
        const localSession = getLocalSession();
        const currentSessionId = sessionId || localSession?.sessionId;

        if (!currentSessionId) {
            console.warn('No session to save progress to');
            return;
        }

        // Update local storage immediately for responsiveness
        const updatedSession: SessionData = {
            sessionId: currentSessionId,
            currentStep,
            formData: { ...(localSession?.formData || {}), ...formData },
            status: 'in_progress'
        };
        saveLocalSession(updatedSession);

        // Sync to API in background (no await to avoid blocking UI)
        fetch(`${API_BASE_URL}/api/session/${currentSessionId}/progress`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentStep, formData })
        }).catch(e => console.error('Failed to sync progress to API:', e));
    }, [sessionId, getLocalSession, saveLocalSession]);

    /**
     * Submit the exam
     */
    const submitExam = useCallback(async (
        formData: Record<string, any>,
        mcqAnswers: any[],
        mcqScore: { totalQuestions: number; correctAnswers: number; percentage: number }
    ): Promise<SubmitResult> => {
        const localSession = getLocalSession();
        const currentSessionId = sessionId || localSession?.sessionId;

        if (!currentSessionId) {
            return { success: false, error: 'No active session' };
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/session/${currentSessionId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData, mcqAnswers, mcqScore })
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, error: data.error?.message || 'Submit failed' };
            }

            // Clear local session after successful submission
            clearLocalSession();

            return {
                success: true,
                isPassing: data.data.isPassing,
                score: data.data.score,
                status: data.data.status,
                submissionId: data.data.submissionId,
                message: data.data.message
            };
        } catch (e) {
            console.error('Submit exam error:', e);
            return { success: false, error: 'Network error' };
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, getLocalSession, clearLocalSession]);

    /**
     * Check if user has already attempted (by email + phone)
     */
    const checkAttemptStatus = useCallback(async (email: string, phone: string) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/session/check?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`
            );
            const data = await response.json();
            return data.data || { attempted: false };
        } catch (e) {
            console.error('Check attempt status error:', e);
            return { attempted: false };
        }
    }, []);

    /**
     * Load session from localStorage on mount
     */
    const loadLocalSession = useCallback(() => {
        const session = getLocalSession();
        if (session) {
            setSessionId(session.sessionId);
        }
        return session;
    }, [getLocalSession]);

    /**
     * Mark assessment as failed (locks the session)
     */
    const failAssessment = useCallback(async (
        mcqScore: { totalQuestions: number; correctAnswers: number; percentage: number }
    ): Promise<boolean> => {
        const localSession = getLocalSession();
        const currentSessionId = sessionId || localSession?.sessionId;

        if (!currentSessionId) {
            console.error('No active session to fail');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/session/${currentSessionId}/fail-assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mcqScore })
            });

            const data = await response.json();

            if (data.success) {
                // Update local session status
                const updatedSession: SessionData = {
                    sessionId: currentSessionId,
                    currentStep: localSession?.currentStep || 2,
                    formData: localSession?.formData || {},
                    status: 'failed'
                };
                saveLocalSession(updatedSession);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Fail assessment error:', e);
            return false;
        }
    }, [sessionId, getLocalSession, saveLocalSession]);

    return {
        sessionId,
        isLoading,
        startSession,
        saveProgress,
        submitExam,
        checkAttemptStatus,
        loadLocalSession,
        getLocalSession,
        clearLocalSession,
        failAssessment
    };
};
