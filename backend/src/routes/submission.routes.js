const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { runValidation } = require('../middleware/validation');

// Create a submission (authenticated)
const submissionCreateValidators = [
	body('personalInfo.fullName').isString().notEmpty(),
	body('personalInfo.email').isEmail(),
	body('personalInfo.role').optional().isString(),
	body('projectDetails.title').isString().notEmpty(),
	runValidation
];
// Allow anonymous submissions (students may not be logged in) — do not require authenticate here
router.post('/', submissionCreateValidators, submissionController.createSubmission);

// Get a submission
router.get('/:id',  submissionController.getSubmission);

// Update a submission (owner or admin)
router.put('/:id', authenticate, submissionController.updateSubmission);

// Delete a submission (owner or admin)
router.delete('/:id', authenticate, submissionController.deleteSubmission);

// List submissions (admin sees all, user sees own)
router.get('/', authenticate, submissionController.listSubmissions);

// Admin: set status
router.put('/:id/status', authenticate, requireRole('admin'), submissionController.setStatus);

module.exports = router;
