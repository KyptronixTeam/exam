const mcqService = require('../services/mcq.service');
const submissionService = require('../services/submission.service');
const { User, Submission, MCQQuestion } = require('../models');
const { logger } = require('../utils/logger');

const loadDemoData = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not allowed in production' } });
    }
    // Minimal demo data: create a sample MCQ question
    const sample = await mcqService.createQuestion({
      question: 'Demo: What is 2+2?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 3,
      difficulty: 'easy',
      points: 1
    });
    return res.json({ success: true, data: { sample } });
  } catch (err) {
    logger.error('Load demo data error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to load demo data' } });
  }
};

const getStats = async (req, res) => {
  try {
    // Calculate average score across all submissions that have a score
    const avgScoreAggr = await Submission.aggregate([
      { $match: { 'mcqScore.percentage': { $exists: true, $ne: null } } },
      { $group: { _id: null, avgPercentage: { $avg: '$mcqScore.percentage' } } }
    ]);
    const averageScore = avgScoreAggr.length > 0 ? Math.round(avgScoreAggr[0].avgPercentage * 10) / 10 : 0;
    const submissionsCount = await Submission.countDocuments();
    const mcqs = await MCQQuestion.countDocuments();

    // Aggregations
    const rolesAggr = await Submission.aggregate([
      { $match: { 'personalInfo.role': { $exists: true, $ne: null } } },
      { $group: { _id: '$personalInfo.role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusAggr = await Submission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const collegeAggr = await Submission.aggregate([
      { $match: { 'personalInfo.collegeName': { $exists: true, $ne: null } } },
      { $group: { _id: '$personalInfo.collegeName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Format for frontend Recharts
    const rolesData = rolesAggr.map(r => ({ name: r._id || 'Unknown', value: r.count }));
    const statusData = statusAggr.map(s => ({ name: s._id || 'Unknown', value: s.count }));
    const collegeData = collegeAggr.map(c => ({ name: c._id || 'Unknown', value: c.count }));

    // Mock trend data for last 7 days since createdAt might be sparse in demo
    // In a real scenario, group by $dateToString format %Y-%m-%d of createdAt
    const last7DaysAggr = await Submission.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);
    const trendData = last7DaysAggr.map(t => ({ date: t._id, submissions: t.count }));

    res.json({ 
      success: true, 
      data: { 
        averageScore, 
        submissions: submissionsCount, 
        mcqs,
        rolesData,
        statusData,
        collegeData,
        trendData
      } 
    });
  } catch (err) {
    logger.error('Get stats error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch stats' } });
  }
};

const adminExists = async (req, res) => {
  try {
    const admin = await User.findOne({ roles: { $in: ['admin'] } });
    res.json({ success: true, data: !!admin });
  } catch (err) {
    logger.error('Admin exists check failed', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to check admin' } });
  }
};

const settingService = require('../services/setting.service');

const getSetting = async (req, res) => {
  try {
    const key = req.params.key;
    const value = await settingService.getSetting(key, null);
    res.json({ success: true, data: { key, value } });
  } catch (err) {
    logger.error('Get setting error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get setting' } });
  }
};

const updateSetting = async (req, res) => {
  try {
    const key = req.params.key;
    const value = req.body.value;
    const updated = await settingService.setSetting(key, value);
    res.json({ success: true, data: { setting: updated } });
  } catch (err) {
    logger.error('Update setting error', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update setting' } });
  }
};

module.exports = { loadDemoData, getStats, adminExists, getSetting, updateSetting };
