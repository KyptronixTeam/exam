const mcqService = require('../services/mcq.service');
const { logger } = require('../utils/logger');
const { MCQ_CATEGORIES, normalizeCategory } = require('../constants/mcqCategories');

const createQuestion = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.category) body.category = normalizeCategory(body.category);
    logger.info('Create MCQ request', { category: body.category, questionLength: body.question && body.question.length });
    const q = await mcqService.createQuestion(body);
    res.status(201).json({ success: true, data: { question: q } });
  } catch (err) {
    logger.error('Create MCQ error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create question' } });
  }
};

const bulkCreateQuestions = async (req, res) => {
  try {
    const questions = (req.body.questions || []).map((q) => ({
      ...q,
      category: q.category ? normalizeCategory(q.category) : q.category,
    }));

    logger.info('Bulk MCQ upload', { received: (req.body.questions || []).length, processed: questions.length });
    const created = await mcqService.bulkCreateQuestions(questions);
    res.status(201).json({ success: true, data: { created: created.length } });
  } catch (err) {
    logger.error('Bulk create MCQ error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to bulk create questions' } });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const q = await mcqService.updateQuestion(req.params.id, req.body);
    if (!q) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } });
    res.json({ success: true, data: { question: q } });
  } catch (err) {
    logger.error('Update MCQ error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update question' } });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await mcqService.deleteQuestion(req.params.id);
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete MCQ error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete question' } });
  }
};

const getQuestion = async (req, res) => {
  try {
    const q = await mcqService.getQuestionById(req.params.id);
    if (!q) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } });
    res.json({ success: true, data: { question: q } });
  } catch (err) {
    logger.error('Get MCQ error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch question' } });
  }
};

const listQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const filter = {};
    if (req.query.category) filter.category = normalizeCategory(req.query.category);
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const result = await mcqService.listQuestions({ page, limit, filter });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('List MCQ error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to list questions' } });
  }
};

const listCategories = async (req, res) => {
  try {
    res.json({ success: true, data: { categories: MCQ_CATEGORIES } });
  } catch (err) {
    logger.error('List categories error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to list categories' } });
  }
};

const settingService = require('../services/setting.service');

const getConfig = async (req, res) => {
  try {
    logger.info('getConfig() called - Fetching MCQ passing percentage');

    let v = await settingService.getSetting('mcq_passing_percentage', null);
    logger.debug('Fetched setting value for mcq_passing_percentage:', v);

    if (v === null) {
      logger.warn('MCQ passing percentage not set, applying default value (90)');
      await settingService.setSetting('mcq_passing_percentage', 90);
      v = 90;
    }

    const passingPercentage =
      typeof v === 'number'
        ? v
        : typeof v === 'string' && v.trim() !== ''
          ? Number(v)
          : null;

    logger.debug('Parsed passingPercentage value:', passingPercentage);

    if (passingPercentage === null || isNaN(passingPercentage)) {
      logger.error('Invalid passing percentage value detected:', v);
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Invalid passing percentage value',
        },
      });
    }

    logger.info('Returning passingPercentage successfully:', passingPercentage);
    res.json({ success: true, data: { passingPercentage } });
  } catch (err) {
    logger.error('Get MCQ config error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch mcq config',
      },
    });
  }
};


const validateAnswers = async (req, res) => {
  try {
    const answers = req.body.answers || [];
    const result = await mcqService.validateAnswers(answers);
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('Validate MCQ answers error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to validate answers' } });
  }
};

module.exports = { createQuestion, bulkCreateQuestions, updateQuestion, deleteQuestion, getQuestion, listQuestions, validateAnswers, listCategories, getConfig };
