const { Submission, File: FileModel } = require('../models');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

const createSubmission = async (userId, data) => {
  const payload = { ...data };

  // Normalize phone if present
  if (payload.personalInfo && payload.personalInfo.phone) {
    const digitsOnly = payload.personalInfo.phone.replace(/\D/g, '');
    payload.personalInfo.phone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Check if a submission already exists for this email/phone combination
    const existing = await Submission.findOne({
      'personalInfo.email': payload.personalInfo.email.toLowerCase().trim(),
      'personalInfo.phone': payload.personalInfo.phone
    });
    if (existing) {
      const err = new Error('You have already submitted the exam');
      err.status = 400;
      throw err;
    }
  }

  if (userId) {
    payload.userId = mongoose.Types.ObjectId(userId);
  }
  // ... rest of the canonical normalization ...
  if (payload.personalInfo && payload.personalInfo.role) {
    const s = String(payload.personalInfo.role).trim().toLowerCase();
    if (['ui/ux', 'ui ux', 'ux', 'ui', 'ui/ux designer', 'ui ux designer'].includes(s)) payload.personalInfo.role = 'UI/UX Designer';
    else if (['frontend developer', 'frontend', 'front-end'].includes(s)) payload.personalInfo.role = 'Frontend Developer';
    else if (['backend developer', 'backend'].includes(s)) payload.personalInfo.role = 'Backend Developer';
    else if (['python developer', 'python'].includes(s)) payload.personalInfo.role = 'Python Developer';
    else if (['full stack developer', 'full-stack developer', 'fullstack', 'fill developer', 'fill'].includes(s)) payload.personalInfo.role = 'Full Stack Developer';
    else payload.personalInfo.role = String(payload.personalInfo.role).trim();
  }
  const submission = new Submission(payload);
  await submission.save();
  return submission;
};

const getSubmissionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Submission.findById(id).populate('fileIds').lean();
};

const updateSubmission = async (id, updates, actor) => {
  // actor can be { id, roles }
  const submission = await Submission.findById(id);
  if (!submission) return null;
  // Only owner or admin can update
  if (submission.userId.toString() !== actor.id && !(actor.roles || []).includes('admin')) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  // Allow updates to include github_repo or projectDetails.githubRepo; normalize
  if (updates.github_repo && (!updates.projectDetails || !updates.projectDetails.githubRepo)) {
    updates.projectDetails = updates.projectDetails || {};
    updates.projectDetails.githubRepo = updates.github_repo;
  }
  if (updates.projectDetails && updates.projectDetails.githubRepo) {
    let g = String(updates.projectDetails.githubRepo).trim();
    if (g.startsWith('github.com')) g = `https://${g}`;
    updates.projectDetails.githubRepo = g || undefined;
  }
  Object.assign(submission, updates);
  await submission.save();
  return submission;
};

const deleteSubmission = async (id, actor) => {
  const submission = await Submission.findById(id);
  if (!submission) return null;
  if (submission.userId.toString() !== actor.id && !(actor.roles || []).includes('admin')) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  // Optionally remove associated files metadata (not deleting file storage here)
  await FileModel.updateMany({ _id: { $in: submission.fileIds } }, { $unset: { submissionId: '' } });
  await submission.remove();
  return true;
};

const listSubmissions = async ({ page = 1, limit = 50, filter = {}, actor = {} }) => {
  const query = {};
  if (!(actor.roles || []).includes('admin')) {
    // non-admins only see their own
    query.userId = mongoose.Types.ObjectId(actor.id);
  }
  // apply filters (status, date range, userId)
  if (filter.status) query.status = filter.status;
  if (filter.userId && (actor.roles || []).includes('admin')) query.userId = mongoose.Types.ObjectId(filter.userId);

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Submission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Submission.countDocuments(query)
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const setSubmissionStatus = async (id, status, reviewerId) => {
  const submission = await Submission.findById(id);
  if (!submission) return null;
  submission.status = status;
  submission.reviewedAt = new Date();
  submission.reviewedBy = reviewerId ? mongoose.Types.ObjectId(reviewerId) : undefined;
  await submission.save();
  return submission;
};

module.exports = {
  createSubmission,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  listSubmissions,
  setSubmissionStatus
};
