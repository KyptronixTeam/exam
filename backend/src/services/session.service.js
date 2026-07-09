const { ExamSession, Submission } = require('../models');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const mcqService = require('./mcq.service');

/**
 * Re-validate MCQ answers on the server so stored submissions always carry
 * an authoritative score and per-question isCorrect flags, regardless of
 * what the client managed to send.
 * @param {Array} mcqAnswers [{ questionId, selectedAnswer }]
 * @returns {{ mcqAnswers: Array, mcqScore: Object } | null} null if validation not possible
 */
const gradeAnswersServerSide = async (mcqAnswers) => {
    if (!Array.isArray(mcqAnswers) || mcqAnswers.length === 0) return null;
    try {
        const result = await mcqService.validateAnswers(
            mcqAnswers.map(a => ({ questionId: a.questionId, selectedAnswer: a.selectedAnswer }))
        );
        const detailMap = new Map((result.details || []).map(d => [String(d.questionId), d]));
        const graded = mcqAnswers.map(a => {
            const d = detailMap.get(String(a.questionId));
            return {
                questionId: a.questionId,
                selectedAnswer: a.selectedAnswer,
                isCorrect: d ? !!d.isCorrect : null
            };
        });
        return {
            mcqAnswers: graded,
            mcqScore: {
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctCount,
                percentage: result.percentage
            }
        };
    } catch (err) {
        logger.warn('Server-side answer grading failed, falling back to client score', { error: err.message });
        return null;
    }
};

/**
 * Start or resume an exam session
 * @param {string} email 
 * @param {string} phone 
 * @returns {Object} { session, isNew, alreadyCompleted }
 */
const startSession = async (email, phone) => {
    const normalizedEmail = email.toLowerCase().trim();
    // Normalize phone: remove non-digits and take last 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    const normalizedPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    if (normalizedPhone.length !== 10) {
        throw new Error('Phone number must be exactly 10 digits');
    }

    // Check for existing session
    let session = await ExamSession.findOne({
        email: normalizedEmail,
        phone: normalizedPhone
    });

    if (session) {
        // Check if already completed (passed or failed)
        if (session.status !== 'in_progress') {
            return {
                session,
                isNew: false,
                alreadyCompleted: true,
                status: session.status
            };
        }
        // Resume existing in-progress session
        return { session, isNew: false, alreadyCompleted: false };
    }

    // Create new session
    session = new ExamSession({
        email: normalizedEmail,
        phone: normalizedPhone,
        currentStep: 1,
        formData: { email: normalizedEmail, phone: normalizedPhone }
    });
    await session.save();

    return { session, isNew: true, alreadyCompleted: false };
};

/**
 * Get session by sessionId
 */
const getSessionById = async (sessionId) => {
    return ExamSession.findOne({ sessionId }).lean();
};

/**
 * Save progress for a session
 */
const saveProgress = async (sessionId, currentStep, formData) => {
    const session = await ExamSession.findOne({ sessionId });
    if (!session) return null;

    if (session.status !== 'in_progress') {
        throw new Error('Session already completed');
    }

    session.currentStep = currentStep;
    // Merge form data
    session.formData = { ...session.formData.toObject(), ...formData };
    await session.save();

    return session;
};

/**
 * Submit the exam - calculate score, save to Submission if passing
 */
const submitExam = async (sessionId, finalFormData, mcqAnswersForDb, mcqScore) => {
    const session = await ExamSession.findOne({ sessionId });
    if (!session) {
        throw new Error('Session not found');
    }

    if (session.status !== 'in_progress') {
        throw new Error('Session already completed');
    }

    // Fetch passing percentage from database settings, fallback to model static
    const Setting = require('../models/setting.model');
    let passingPercentage = ExamSession.PASSING_PERCENTAGE; // default 50
    try {
        const setting = await Setting.findOne({ key: 'mcq_passing_percentage' });
        if (setting && typeof setting.value === 'number') {
            passingPercentage = setting.value;
        }
    } catch (err) {
        logger.warn('Failed to fetch passing percentage from settings, using default', { error: err.message });
    }

    // Grade answers on the server: authoritative score + isCorrect per answer.
    // Falls back to the client-provided score only if grading is impossible.
    const graded = await gradeAnswersServerSide(mcqAnswersForDb);
    const finalScore = graded ? graded.mcqScore : mcqScore;
    const finalAnswers = graded ? graded.mcqAnswers : (mcqAnswersForDb || []);

    const role = (finalFormData.role || session.formData.role || '').toUpperCase();
    // Roles whose MCQ decides pass/fail automatically. SMO passes/fails on the
    // MCQ too, but its essay still goes to manual review below.
    const isAutoGraded = ['HR', 'SEO', 'SMO', 'FULL STACK DEVELOPER'].includes(role);
    // Roles whose submission needs a human review even after passing
    const needsManualReview = ['SMO', 'CONTENT CREATOR', 'GRAPHIC DESIGNER'].includes(role);

    let isPassing = false;
    let reviewStatus = 'pending_review';
    let submissionStatus = 'under_review';

    if (isAutoGraded) {
        isPassing = finalScore.percentage >= passingPercentage;
        if (!isPassing) {
            reviewStatus = 'auto_failed';
            submissionStatus = 'rejected';
        } else if (needsManualReview) {
            reviewStatus = 'pending_review';
            submissionStatus = 'under_review';
        } else {
            reviewStatus = 'auto_passed';
            submissionStatus = 'submitted';
        }
    } else {
        // Content Creator, Graphic Designer, etc. go to manual review
        isPassing = true; // Always save the submission for review
        reviewStatus = 'pending_review';
        submissionStatus = 'under_review';
    }

    logger.info('Evaluating pass/fail', { role, percentage: finalScore.percentage, passingPercentage, isPassing, isAutoGraded, serverGraded: !!graded });

    // Update session with final data
    session.formData = { ...session.formData.toObject(), ...finalFormData };
    session.mcqScore = finalScore;
    session.status = isPassing ? 'passed' : 'failed';
    session.completedAt = new Date();

    const submissionPayload = {
        personalInfo: {
            fullName: session.formData.fullName,
            email: session.formData.email,
            phone: session.formData.phone,
            collegeName: session.formData.collegeName,
            department: session.formData.department,
            role: session.formData.role,
            year: session.formData.year,
            semester: session.formData.semester
        },
        projectDetails: {
            title: session.formData.projectTitle,
            description: session.formData.projectDescription,
            websiteUrl: session.formData.websiteUrl,
            githubRepo: session.formData.githubRepo
        },
        essayText: session.formData.essayText,
        driveLink: session.formData.driveLink,
        graphicDesignLink1: session.formData.graphicDesignLink1,
        graphicDesignLink2: session.formData.graphicDesignLink2,
        graphicDesignLink3: session.formData.graphicDesignLink3,
        questionSet: session.formData.questionSet || 1,
        tabSwitchCount: session.formData.tabSwitchCount || 0,
        mcqAnswers: finalAnswers,
        mcqScore: finalScore,
        status: submissionStatus,
        reviewStatus: reviewStatus,
        submittedAt: new Date()
    };

    const submission = new Submission(submissionPayload);
    await submission.save();
    session.submissionId = submission._id;

    logger.info('Submission created', {
        sessionId,
        submissionId: submission._id,
        score: finalScore.percentage,
        role,
        reviewStatus,
        isPassing
    });

    await session.save();

    return {
        session,
        isPassing,
        submissionId: session.submissionId || null,
        score: finalScore
    };
};

/**
 * Check if an email+phone has already attempted
 */
const checkAttemptStatus = async (email, phone) => {
    const normalizedEmail = email.toLowerCase().trim();
    const digitsOnly = phone.replace(/\D/g, '');
    const normalizedPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    const session = await ExamSession.findOne({
        email: normalizedEmail,
        phone: normalizedPhone
    }).lean();

    if (!session) {
        return { attempted: false };
    }

    return {
        attempted: true,
        status: session.status,
        sessionId: session.sessionId,
        currentStep: session.currentStep,
        canResume: session.status === 'in_progress'
    };
};

/**
 * Mark session as failed immediately when MCQ assessment fails
 * This prevents retakes of the assessment
 */
const markAssessmentFailed = async (sessionId, mcqScore) => {
    const session = await ExamSession.findOne({ sessionId });
    if (!session) {
        throw new Error('Session not found');
    }

    if (session.status !== 'in_progress') {
        // Already completed - just return current status
        return { session, alreadyCompleted: true };
    }

    // Rebuild answers from the session and grade them server-side so failed
    // attempts are stored with full per-question results too.
    const rawAnswers = session.formData.mcqAnswers
        ? Object.entries(session.formData.mcqAnswers).map(([q, a]) => ({
            questionId: q,
            selectedAnswer: a === '__SKIPPED__' ? null : a
        }))
        : [];
    const graded = await gradeAnswersServerSide(rawAnswers);
    const finalScore = graded ? graded.mcqScore : mcqScore;
    const finalAnswers = graded ? graded.mcqAnswers : rawAnswers;

    // Mark as failed
    session.status = 'failed';
    session.mcqScore = finalScore;
    session.completedAt = new Date();

    // Create Submission record for the failed assessment
    const submissionPayload = {
        personalInfo: {
            fullName: session.formData.fullName,
            email: session.formData.email,
            phone: session.formData.phone,
            collegeName: session.formData.collegeName,
            department: session.formData.department,
            role: session.formData.role,
            year: session.formData.year,
            semester: session.formData.semester
        },
        projectDetails: {
            title: session.formData.projectTitle,
            description: session.formData.projectDescription,
            websiteUrl: session.formData.websiteUrl,
            githubRepo: session.formData.githubRepo
        },
        essayText: session.formData.essayText,
        driveLink: session.formData.driveLink,
        graphicDesignLink1: session.formData.graphicDesignLink1,
        graphicDesignLink2: session.formData.graphicDesignLink2,
        graphicDesignLink3: session.formData.graphicDesignLink3,
        questionSet: session.formData.questionSet || 1,
        tabSwitchCount: session.formData.tabSwitchCount || 0,
        mcqAnswers: finalAnswers,
        mcqScore: finalScore,
        status: 'rejected',
        reviewStatus: 'auto_failed',
        submittedAt: new Date()
    };

    const submission = new Submission(submissionPayload);
    await submission.save();
    
    session.submissionId = submission._id;
    await session.save();

    logger.info('Assessment failed - session and submission marked as failed', {
        sessionId,
        submissionId: submission._id,
        score: finalScore && finalScore.percentage
    });

    return { session, alreadyCompleted: false };
};

module.exports = {
    startSession,
    getSessionById,
    saveProgress,
    submitExam,
    checkAttemptStatus,
    markAssessmentFailed
};
