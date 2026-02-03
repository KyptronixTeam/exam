const { ExamSession, Submission } = require('../models');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

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

    const isPassing = mcqScore.percentage >= passingPercentage;
    logger.info('Evaluating pass/fail', { percentage: mcqScore.percentage, passingPercentage, isPassing });

    // Update session with final data
    session.formData = { ...session.formData.toObject(), ...finalFormData };
    session.mcqScore = mcqScore;
    session.status = isPassing ? 'passed' : 'failed';
    session.completedAt = new Date();

    // If passing, create a Submission record
    if (isPassing) {
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
            mcqAnswers: mcqAnswersForDb,
            mcqScore: mcqScore,
            status: 'submitted',
            submittedAt: new Date()
        };

        const submission = new Submission(submissionPayload);
        await submission.save();
        session.submissionId = submission._id;

        logger.info('Passing submission created', {
            sessionId,
            submissionId: submission._id,
            score: mcqScore.percentage
        });
    } else {
        logger.info('Failed submission - not saved to Submission collection', {
            sessionId,
            score: mcqScore.percentage
        });
    }

    await session.save();

    return {
        session,
        isPassing,
        submissionId: session.submissionId || null,
        score: mcqScore
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

    // Mark as failed
    session.status = 'failed';
    session.mcqScore = mcqScore;
    session.completedAt = new Date();
    await session.save();

    logger.info('Assessment failed - session marked as failed', {
        sessionId,
        score: mcqScore.percentage
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
