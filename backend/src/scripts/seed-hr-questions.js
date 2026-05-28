require('dotenv').config();
const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
const hrQuestions = require('./data/hr-questions');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kyptronix-exam';

async function seedHRQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let insertedCount = 0;
    
    // Check for existing questions
    for (const q of hrQuestions) {
      const exists = await MCQQuestion.findOne({ category: 'HR', question: q.question });
      if (!exists) {
        await MCQQuestion.create({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          category: 'HR',
          difficulty: q.difficulty,
          points: 1,
          isActive: true
        });
        insertedCount++;
      }
    }

    console.log(`Seed complete: Inserted ${insertedCount} new HR questions.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding HR questions:', err);
    process.exit(1);
  }
}

seedHRQuestions();
