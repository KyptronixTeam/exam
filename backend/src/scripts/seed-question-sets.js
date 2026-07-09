/**
 * Seed additional question sets (Set 2, Set 3) for every role.
 *
 * Reads every file in ./data/sets/*.js — each exporting
 *   { category, sets: { 2: [...30], 3: [...30] } }
 * and inserts the questions with the matching `questionSet` value.
 *
 * Idempotent: for each (category, set) it skips insertion if that set already
 * has questions, so it is safe to re-run. Pass --force to wipe and re-seed
 * sets 2 & 3 (Set 1 is never touched).
 *
 * Usage:
 *   node src/scripts/seed-question-sets.js
 *   node src/scripts/seed-question-sets.js --force
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
const { normalizeCategory } = require('../constants/mcqCategories');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';
const FORCE = process.argv.includes('--force');
const SETS_DIR = path.join(__dirname, 'data', 'sets');

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI.replace(/\/\/[^@]*@/, '//***@'));

  const files = fs.readdirSync(SETS_DIR).filter(f => f.endsWith('.js'));
  console.log(`Found ${files.length} set files.`);

  let totalInserted = 0;
  const summary = [];

  for (const file of files) {
    const mod = require(path.join(SETS_DIR, file));
    const category = normalizeCategory(mod.category);
    if (!category || !mod.sets) {
      console.warn(`  ! Skipping ${file}: missing category/sets`);
      continue;
    }

    for (const setKey of Object.keys(mod.sets)) {
      const setNum = parseInt(setKey, 10);
      if (!Number.isFinite(setNum) || setNum < 2) continue; // never touch set 1
      const questions = mod.sets[setKey] || [];
      if (questions.length === 0) continue;

      const existing = await MCQQuestion.countDocuments({ category, questionSet: setNum });
      if (existing > 0) {
        if (FORCE) {
          await MCQQuestion.deleteMany({ category, questionSet: setNum });
          console.log(`  ~ ${category} set ${setNum}: removed ${existing} existing (force)`);
        } else {
          console.log(`  = ${category} set ${setNum}: already has ${existing} questions, skipping`);
          summary.push({ category, set: setNum, inserted: 0, skipped: true });
          continue;
        }
      }

      const docs = questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        category,
        difficulty: q.difficulty || 'medium',
        points: q.points || 1,
        questionSet: setNum,
        isActive: true,
      }));

      const inserted = await MCQQuestion.insertMany(docs);
      totalInserted += inserted.length;
      console.log(`  + ${category} set ${setNum}: inserted ${inserted.length}`);
      summary.push({ category, set: setNum, inserted: inserted.length, skipped: false });
    }
  }

  console.log(`\nDone. Total inserted: ${totalInserted}`);
  console.table(summary);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
