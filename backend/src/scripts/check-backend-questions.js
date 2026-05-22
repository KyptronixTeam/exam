const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

async function checkBackendQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Count Backend Developer questions
    const count = await MCQQuestion.countDocuments({ category: 'Backend Developer' });
    console.log(`\n📊 Total Backend Developer questions: ${count}\n`);

    // Get all Backend Developer questions with details
    const questions = await MCQQuestion.find({ category: 'Backend Developer' })
      .select('question options correctAnswer difficulty points')
      .sort({ createdAt: 1 });

    console.log('═══════════════════════════════════════════════════════════');
    questions.forEach((q, idx) => {
      console.log(`\n${idx + 1}. Question: ${q.question}`);
      console.log(`   Options: [${q.options.join(' | ')}]`);
      console.log(`   Correct Answer Index: ${q.correctAnswer} (${q.options[q.correctAnswer]})`);
      console.log(`   Difficulty: ${q.difficulty} | Points: ${q.points}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error checking Backend Developer questions:', error);
    process.exit(1);
  }
}

checkBackendQuestions();
