const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
const { additionalRoleQuestionGroups } = require('./data/additional-role-questions');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const questionKey = ({ category, question }) =>
  `${String(category).trim().toLowerCase()}::${String(question).trim().toLowerCase()}`;

async function seedAdditionalRoleQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = Object.keys(additionalRoleQuestionGroups);
    const existing = await MCQQuestion.find(
      { category: { $in: categories } },
      { category: 1, question: 1 }
    ).lean();

    const existingKeys = new Set(existing.map(questionKey));
    const questionsToInsert = [];
    const summary = [];

    for (const [category, questions] of Object.entries(additionalRoleQuestionGroups)) {
      const missingQuestions = questions.filter((question) => !existingKeys.has(questionKey(question)));
      questionsToInsert.push(...missingQuestions);
      summary.push({
        category,
        total: questions.length,
        inserted: missingQuestions.length,
        skippedExisting: questions.length - missingQuestions.length
      });
    }

    if (questionsToInsert.length > 0) {
      await MCQQuestion.insertMany(questionsToInsert, { ordered: true });
    }

    console.table(summary);
    console.log(`Inserted ${questionsToInsert.length} new MCQ questions across ${categories.length} roles.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding additional role questions:', error);
    process.exit(1);
  }
}

seedAdditionalRoleQuestions();
