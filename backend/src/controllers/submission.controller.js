const submissionService = require('../services/submission.service');
const { logger } = require('../utils/logger');

const createSubmission = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const data = req.body;
    logger.info('Create submission request', { userId, body: data });
    // minor safety: ensure github repo field visibility in logs (trimmed)
    if (data?.projectDetails?.githubRepo || data?.github_repo) {
      const reported = (data.projectDetails && data.projectDetails.githubRepo) || data.github_repo;
      logger.info('GitHub repo in submission', { repo: String(reported).slice(0, 200) });
    }
    const submission = await submissionService.createSubmission(userId, data);
    res.status(201).json({ success: true, data: { submission } });
  } catch (err) {
    logger.error('Create submission error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create submission' } });
  }
};

const getSubmission = async (req, res) => {
  try {
    const id = req.params.id;
    const submission = await submissionService.getSubmissionById(id);
    if (!submission) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Submission not found' } });
    // If not admin, ensure owner (guard when submission is anonymous)
    const user = req.user || {};
    if (!(user.roles || []).includes('admin')) {
      if (submission.userId) {
        if (submission.userId.toString() !== user.id) {
          return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }
      } else {
        // submission is anonymous and requester is not admin — deny access
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }
    }
    res.json({ success: true, data: { submission } });
  } catch (err) {
    logger.error('Get submission error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch submission' } });
  }
};

const updateSubmission = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const actor = { id: req.user.id, roles: req.user.roles };
    const submission = await submissionService.updateSubmission(id, updates, actor);
    res.json({ success: true, data: { submission } });
  } catch (err) {
    logger.error('Update submission error', err);
    const status = err.status || 500;
    res.status(status).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Failed to update' } });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const id = req.params.id;
    const actor = { id: req.user.id, roles: req.user.roles };
    await submissionService.deleteSubmission(id, actor);
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete submission error', err);
    const status = err.status || 500;
    res.status(status).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Failed to delete' } });
  }
};

const listSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.userId = req.query.userId;
    const actor = req.user ? { id: req.user.id, roles: req.user.roles } : { roles: ['admin'] };
    const result = await submissionService.listSubmissions({ page, limit, filter, actor });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('List submissions error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to list submissions' } });
  }
};

const setStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'status is required' } });
    const submission = await submissionService.setSubmissionStatus(id, status, req.user.id);
    res.json({ success: true, data: { submission } });
  } catch (err) {
    logger.error('Set status error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update status' } });
  }
};

module.exports = { createSubmission, getSubmission, updateSubmission, deleteSubmission, listSubmissions, setStatus };
