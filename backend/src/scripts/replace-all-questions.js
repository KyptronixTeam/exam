/**
 * Replace ALL MCQ questions with the new high-difficulty question banks in
 * ./data/sets-v2/*.js — each exporting
 *   { category, sets: { 1: [...30], 2: [...30], 3: [...30] } }
 *
 * Safety / anti-cheat measures:
 *  - Backs up every existing question to ./backups/mcq-backup-<timestamp>.json
 *    before deleting anything.
 *  - Shuffles the options of every new question and recomputes correctAnswer,
 *    so the correct index is uniformly random (never clustered on one option).
 *
 * Usage:
 *   node src/scripts/replace-all-questions.js --dry-run   (validate only)
 *   node src/scripts/replace-all-questions.js --confirm   (backup, wipe, insert)
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
const { normalizeCategory, MCQ_CATEGORIES } = require('../constants/mcqCategories');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';
const SETS_DIR = path.join(__dirname, 'data', 'sets-v2');
const BACKUP_DIR = path.join(__dirname, 'backups');
const DRY_RUN = !process.argv.includes('--confirm');

const shuffleOptions = (q) => {
  const indexed = q.options.map((text, i) => ({ text, wasCorrect: i === q.correctAnswer }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    options: indexed.map(o => o.text),
    correctAnswer: indexed.findIndex(o => o.wasCorrect),
  };
};

const cloneQuestion = (q) => ({ ...q, options: Array.isArray(q.options) ? [...q.options] : [] });

const fillSetToThirty = (questions, sourcePool) => {
  const normalized = questions.map(cloneQuestion);
  const seen = new Set(normalized.map((q) => String(q.question || '').trim().toLowerCase()).filter(Boolean));
  for (const q of sourcePool) {
    if (normalized.length >= 30) break;
    const key = String(q.question || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    normalized.push(cloneQuestion(q));
    seen.add(key);
  }
  if (normalized.length < 30) {
    throw new Error(`Unable to fill a set to 30 questions from the provided pool.`);
  }
  return normalized.slice(0, 30);
};

const buildSet3FromMix = (set1, set2) => {
  const mix = [];
  const firstHalf = Math.min(15, set1.length, set2.length);
  mix.push(...set1.slice(0, firstHalf));
  mix.push(...set2.slice(0, firstHalf));

  const remainingPool = [...set1.slice(firstHalf), ...set2.slice(firstHalf)];
  return fillSetToThirty(mix, remainingPool);
};

const normalizeBankSets = (mod) => {
  const sets = mod.sets || {};
  const normalized = { '1': [], '2': [], '3': [] };
  if (!Array.isArray(sets['1']) || !Array.isArray(sets['2'])) {
    throw new Error(`Bank ${mod.category || 'unknown'} is missing sets 1 and 2.`);
  }

  const set1Input = sets['1'].map(cloneQuestion);
  const set2Input = sets['2'].map(cloneQuestion);
  const set3Input = Array.isArray(sets['3']) ? sets['3'].map(cloneQuestion) : [];
  const pool = [...set1Input, ...set2Input, ...set3Input];

  normalized['1'] = fillSetToThirty(set1Input, pool);
  normalized['2'] = fillSetToThirty(set2Input, pool);
  normalized['3'] = set3Input.length >= 30
    ? set3Input.slice(0, 30)
    : buildSet3FromMix(normalized['1'], normalized['2']);

  if (normalized['1'].length < 30 || normalized['2'].length < 30 || normalized['3'].length < 30) {
    throw new Error(`Bank ${mod.category || 'unknown'} could not be completed to 30 questions per set.`);
  }

  mod.sets = normalized;
  return mod;
};

const validateFile = (mod, file) => {
  const errors = [];
  const category = normalizeCategory(mod.category);
  if (!MCQ_CATEGORIES.includes(category)) errors.push(`unknown category '${mod.category}'`);
  const seen = new Set();
  for (const setKey of ['1', '2', '3']) {
    const qs = (mod.sets || {})[setKey];
    if (!Array.isArray(qs) || qs.length !== 30) {
      errors.push(`set ${setKey}: expected 30 questions, got ${Array.isArray(qs) ? qs.length : 'none'}`);
      continue;
    }
    const seen = new Set();
    qs.forEach((q, i) => {
      const where = `set ${setKey} #${i + 1}`;
      if (!q.question || typeof q.question !== 'string') errors.push(`${where}: missing question text`);
      if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${where}: needs exactly 4 options`);
      else if (new Set(q.options.map(o => String(o).trim().toLowerCase())).size !== 4) errors.push(`${where}: duplicate options`);
      if (Array.isArray(q.options)) {
        const banned = q.options.some((o) => {
          const text = String(o).trim().toLowerCase();
          return text === 'all of the above' || text === 'none of the above';
        });
        if (banned) errors.push(`${where}: banned option wording`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) errors.push(`${where}: invalid correctAnswer`);
      const key = String(q.question).trim().toLowerCase();
      if (seen.has(key)) errors.push(`${where}: duplicate question text`);
      seen.add(key);
    });
  }
  if (errors.length) {
    console.error(`  ✗ ${file}:`);
    errors.slice(0, 10).forEach(e => console.error(`      ${e}`));
    if (errors.length > 10) console.error(`      ...and ${errors.length - 10} more`);
  }
  return errors.length === 0;
};

async function main() {
  const files = fs.readdirSync(SETS_DIR).filter(f => f.endsWith('.js'));
  console.log(`Found ${files.length} question-bank files in sets-v2.`);
  if (files.length !== MCQ_CATEGORIES.length) {
    console.error(`Expected ${MCQ_CATEGORIES.length} files (one per category). Aborting.`);
    process.exit(1);
  }

  // Validate everything before touching the database.
  const banks = [];
  let allValid = true;
  for (const file of files) {
    delete require.cache[require.resolve(path.join(SETS_DIR, file))];
    const mod = require(path.join(SETS_DIR, file));
    const normalized = normalizeBankSets(mod);
    if (!validateFile(normalized, file)) { allValid = false; continue; }
    banks.push({ category: normalizeCategory(normalized.category), sets: normalized.sets, file });
    console.log(`  ✓ ${file} (${normalizeCategory(normalized.category)}) valid`);
  }
  const categories = new Set(banks.map(b => b.category));
  if (categories.size !== MCQ_CATEGORIES.length) {
    console.error(`Missing categories: ${MCQ_CATEGORIES.filter(c => !categories.has(c)).join(', ')}`);
    allValid = false;
  }
  if (!allValid) {
    console.error('\nValidation failed — database NOT modified.');
    process.exit(1);
  }
  if (DRY_RUN) {
    console.log('\nDry run: all files valid. Re-run with --confirm to replace the database questions.');
    process.exit(0);
  }

  await mongoose.connect(MONGO_URI);
  console.log('\nConnected to MongoDB:', MONGO_URI.replace(/\/\/[^@]*@/, '//***@'));

  // Backup existing questions.
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const existing = await MCQQuestion.find({}).lean();
  const backupPath = path.join(BACKUP_DIR, `mcq-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
  console.log(`Backed up ${existing.length} existing questions to ${backupPath}`);

  // Wipe and insert.
  const del = await MCQQuestion.deleteMany({});
  console.log(`Deleted ${del.deletedCount} old questions.`);

  let inserted = 0;
  for (const bank of banks) {
    const docs = [];
    for (const setKey of ['1', '2', '3']) {
      for (const q of bank.sets[setKey]) {
        const { options, correctAnswer } = shuffleOptions(q);
        docs.push({
          question: q.question,
          options,
          correctAnswer,
          category: bank.category,
          difficulty: 'hard',
          points: q.points || 1,
          questionSet: parseInt(setKey, 10),
          isActive: true,
        });
      }
    }
    const res = await MCQQuestion.insertMany(docs);
    inserted += res.length;
    console.log(`  + ${bank.category}: inserted ${res.length}`);
  }

  // Verify.
  const total = await MCQQuestion.countDocuments();
  const ansDist = await MCQQuestion.aggregate([
    { $group: { _id: '$correctAnswer', count: { $sum: 1 } } }, { $sort: { _id: 1 } }
  ]);
  const perCat = await MCQQuestion.aggregate([
    { $group: { _id: { c: '$category', s: '$questionSet' }, count: { $sum: 1 } } }, { $sort: { '_id.c': 1, '_id.s': 1 } }
  ]);
  console.log(`\nInserted ${inserted}. Total now in DB: ${total}`);
  console.log('correctAnswer distribution:', ansDist.map(r => `${r._id}:${r.count}`).join('  '));
  const wrong = perCat.filter(r => r.count !== 30);
  if (wrong.length) console.error('Sets with wrong counts:', JSON.stringify(wrong));
  else console.log(`All ${perCat.length} (category, set) groups have exactly 30 questions.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Replace failed:', err);
  process.exit(1);
});
