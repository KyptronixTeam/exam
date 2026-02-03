const sessionService = require('../services/session.service');
const { logger } = require('../utils/logger');

/**
 * Start or resume a session
 * POST /api/session/start
 * Body: { email, phone }
 */
const startSession = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Email and phone are required' }
            });
        }

        const result = await sessionService.startSession(email, phone);

        if (result.alreadyCompleted) {
            return res.status(200).json({
                success: true,
                data: {
                    alreadyCompleted: true,
                    status: result.status,
                    message: result.status === 'passed'
                        ? 'You have already passed and submitted the exam.'
                        : 'You have already attempted this exam.'
                }
            });
        }

        res.status(result.isNew ? 201 : 200).json({
            success: true,
            data: {
                session: {
                    sessionId: result.session.sessionId,
                    currentStep: result.session.currentStep,
                    formData: result.session.formData,
                    status: result.session.status
                },
                isNew: result.isNew,
                alreadyCompleted: false
            }
        });
    } catch (err) {
        logger.error('Start session error', err);

        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                error: { code: 'DUPLICATE', message: 'Session already exists for this email and phone' }
            });
        }

        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to start session' }
        });
    }
};

/**
 * Get session by ID
 * GET /api/session/:sessionId
 */
const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await sessionService.getSessionById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Session not found' }
            });
        }

        res.json({ success: true, data: { session } });
    } catch (err) {
        logger.error('Get session error', err);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to get session' }
        });
    }
};

/**
 * Save progress
 * PUT /api/session/:sessionId/progress
 * Body: { currentStep, formData }
 */
const saveProgress = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { currentStep, formData } = req.body;

        const session = await sessionService.saveProgress(sessionId, currentStep, formData);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Session not found' }
            });
        }

        res.json({
            success: true,
            data: {
                sessionId: session.sessionId,
                currentStep: session.currentStep,
                status: session.status
            }
        });
    } catch (err) {
        logger.error('Save progress error', err);

        if (err.message === 'Session already completed') {
            return res.status(400).json({
                success: false,
                error: { code: 'SESSION_COMPLETED', message: 'Session already completed' }
            });
        }

        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to save progress' }
        });
    }
};

/**
 * Submit exam
 * POST /api/session/:sessionId/submit
 * Body: { formData, mcqAnswers, mcqScore }
 */
const submitExam = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { formData, mcqAnswers, mcqScore } = req.body;

        if (!mcqScore) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'MCQ score is required' }
            });
        }

        const result = await sessionService.submitExam(sessionId, formData, mcqAnswers, mcqScore);

        res.json({
            success: true,
            data: {
                isPassing: result.isPassing,
                score: result.score,
                status: result.session.status,
                submissionId: result.submissionId,
                message: result.isPassing
                    ? 'Congratulations! You have passed the exam.'
                    : 'Unfortunately, you did not pass the exam.'
            }
        });
    } catch (err) {
        logger.error('Submit exam error', err);

        if (err.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Session not found' }
            });
        }

        if (err.message === 'Session already completed') {
            return res.status(400).json({
                success: false,
                error: { code: 'SESSION_COMPLETED', message: 'Session already completed' }
            });
        }

        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to submit exam' }
        });
    }
};

/**
 * Check attempt status
 * GET /api/session/check?email=...&phone=...
 */
const checkAttemptStatus = async (req, res) => {
    try {
        const { email, phone } = req.query;

        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Email and phone are required' }
            });
        }

        const result = await sessionService.checkAttemptStatus(email, phone);
        res.json({ success: true, data: result });
    } catch (err) {
        logger.error('Check attempt status error', err);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to check attempt status' }
        });
    }
};

/**
 * Mark assessment as failed
 * POST /api/session/:sessionId/fail-assessment
 * Body: { mcqScore }
 */
const markAssessmentFailed = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { mcqScore } = req.body;

        const result = await sessionService.markAssessmentFailed(sessionId, mcqScore);

        if (result.alreadyCompleted) {
            return res.status(200).json({
                success: true,
                data: {
                    alreadyCompleted: true,
                    status: result.session.status,
                    message: 'Session was already completed'
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                status: 'failed',
                message: 'Assessment failed. You cannot retake the assessment.'
            }
        });
    } catch (err) {
        logger.error('Mark assessment failed error', err);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message || 'Failed to mark assessment as failed' }
        });
    }
};

module.exports = {
    startSession,
    getSession,
    saveProgress,
    submitExam,
    checkAttemptStatus,
    markAssessmentFailed
};
