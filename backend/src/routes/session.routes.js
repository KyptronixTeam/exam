const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// Check attempt status (must be before /:sessionId routes)
router.get('/check', sessionController.checkAttemptStatus);

// Start or resume a session
router.post('/start', sessionController.startSession);

// Get session by ID
router.get('/:sessionId', sessionController.getSession);

// Save progress
router.put('/:sessionId/progress', sessionController.saveProgress);

// Mark assessment as failed (prevents retakes)
router.post('/:sessionId/fail-assessment', sessionController.markAssessmentFailed);

// Submit exam
router.post('/:sessionId/submit', sessionController.submitExam);

module.exports = router;
