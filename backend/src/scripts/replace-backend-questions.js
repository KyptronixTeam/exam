const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const newBackendQuestions = [
  {
    question: "What's the issue with this query optimization? SELECT * FROM users WHERE YEAR(created_at) = 2024;",
    options: ["No issue", "Should use LEFT JOIN", "Function on column prevents index usage", "Missing WHERE clause"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In database transactions, what does 'dirty read' mean in isolation levels?",
    options: ["Reading deleted data", "Invalid SQL query", "Reading uncommitted changes from another transaction", "Data is corrupted"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What does this query return if 'email' is NULL? SELECT id FROM users WHERE email != 'test@example.com';",
    options: ["All records with NULL email", "Error", "Only records with NULL email", "All records except NULL emails"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In Node.js async operations, what's the difference between these? promise.catch() vs promise.catch().catch()?",
    options: ["Same thing", "Not allowed syntax", "Second catch catches errors from first catch", "Second catch doesn't catch errors from first catch"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's the security issue here? app.use(cors());",
    options: ["Missing credentials", "Allows requests from ANY origin (security risk for sensitive operations)", "Syntax error", "No issue"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In REST API design, when designing pagination, what's the risk of offset-based pagination at scale?",
    options: ["Uses more memory", "Skipped/duplicate records if data changes between requests", "Slower response times", "No risk"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What does this code do? SELECT COUNT(*) as count FROM users; vs SELECT COUNT(id) as count FROM users;",
    options: ["COUNT(*) is slower", "Second is invalid", "COUNT(*) counts rows; COUNT(id) counts non-NULL ids (different if NULLs exist)", "Same result always"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "Which HTTP method is used to create a new resource on the server?",
    options: ["GET", "PUT", "POST", "DELETE"],
    correctAnswer: 2,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What's the issue with storing passwords as: db.save({ password: Buffer.from(userPassword, 'utf8') });",
    options: ["Should use hex", "Encoding is wrong", "Hashing is missing, passwords stored in plaintext", "No issue"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In database indexing, when is adding MORE indexes harmful?",
    options: ["Only with large tables", "Slows INSERT/UPDATE/DELETE and uses more storage", "Indexes are always free", "Never harmful"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's 'connection pooling' and why is it important?",
    options: ["Limiting data access", "Swimming pools for servers", "Backing up connections", "Reusing database connections instead of creating new ones for performance"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the race condition in this code? let count = 0; async function increment() { count++; }",
    options: ["JavaScript prevents this", "Should use let instead of var", "Multiple calls to increment() may have unpredictable behavior if interleaved with awaits", "No race condition in single-threaded JS"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's 'stored procedure injection' and how is it different from SQL injection?",
    options: ["Not a real vulnerability", "Only affects MongoDB", "Malicious code injected into stored procedures; can bypass parameterized query protections if not careful", "Same as SQL injection"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In an API, what's the correct approach for handling large file uploads?",
    options: ["Not recommended in APIs", "Save to disk then process", "Stream the file and avoid loading entire content in memory", "Load entire file in memory first"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's the primary role of a database in a backend application?",
    options: ["To manage frontend routing", "To display data to users", "To store and manage application data persistently", "To handle API requests"],
    correctAnswer: 2,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What does 'CSRF' (Cross-Site Request Forgery) protect against and what's a common mitigation?",
    options: ["SQL Injection", "Session hijacking", "Unauthorized actions performed on behalf of user; use CSRF tokens", "DDoS attacks"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In Express.js, what's the issue with: app.get('/api/data', (req, res) => { throw new Error('test'); })?",
    options: ["Error goes to frontend", "Syntax error", "Error crashes the server (unhandled exception)", "Error is caught automatically"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's 'eventual consistency' in distributed databases?",
    options: ["Not reliable", "Consistency that never happens", "Faster than strong consistency", "Data becomes consistent eventually (not immediately) across all nodes"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the difference between POST /users and POST /users/{id}?",
    options: ["No difference", "First returns 201; second returns 200", "Both create new resources", "POST /users creates new; POST /users/{id} should not be used (undefined behavior)"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's a 'phantom read' in database transactions?",
    options: ["Reading updated data", "Not a real issue", "Reading newly inserted rows from another transaction between two queries", "Reading deleted data"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In NoSQL (MongoDB), what's the danger of running complex aggregation pipelines?",
    options: ["Always fast", "Indexes don't help", "No danger", "Can consume excessive memory and CPU if not optimized"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's the difference between symmetric and asymmetric encryption?",
    options: ["Symmetric is faster always", "Asymmetric doesn't exist", "No difference", "Symmetric uses same key; asymmetric uses public/private key pairs"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In API versioning, what's the issue with /api/v1 vs content-type based versioning?",
    options: ["No way to version APIs", "URL versioning is deprecated", "URL versioning is simpler; content-type is cleaner but more complex", "No difference"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's 'n-tier architecture' and when is it useful?",
    options: ["Modern apps don't use it", "Only for monoliths", "Separating concerns into layers (presentation, business, data); useful for scalability", "Never useful"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the issue with: app.post('/api/data', async (req, res) => { db.save(req.body); res.send('ok'); });",
    options: ["No issue", "Missing error handling", "Both B and C", "No await for db.save(); response sent before data saved"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In REST APIs, what's the correct status code if a resource cannot be created due to validation failure?",
    options: ["201 Created", "500 Internal Server Error", "400 Bad Request", "404 Not Found"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's 'transaction isolation level' and why does it matter?",
    options: ["All isolation levels are the same", "Only for MongoDB", "Determines what other transactions can see; affects consistency vs performance tradeoff", "Not important"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In caching, what's the difference between 'cache-control: max-age' vs 'cache-control: s-maxage'?",
    options: ["Only one is used", "s-maxage is deprecated", "max-age for browser cache; s-maxage for shared/proxy cache", "No difference"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's a 'time-of-check-to-time-of-use (TOCTOU)' vulnerability?",
    options: ["Cache issue", "Not a real vulnerability", "Gap between checking permission and using resource allows race condition exploit", "Timing attack"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In microservices architecture, what's an 'API Gateway' primarily responsible for?",
    options: ["Creating backups", "Managing databases", "Routing requests, handling auth, load balancing, and rate limiting", "Storing all application data"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  }
];

async function replaceBackendQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const beforeCount = await MCQQuestion.countDocuments({ category: 'Backend Developer' });
    console.log(`📊 Questions before replacement: ${beforeCount}`);

    const deleteResult = await MCQQuestion.deleteMany({ category: 'Backend Developer' });
    console.log(`🗑️  Deleted: ${deleteResult.deletedCount} old questions\n`);

    const questionsToInsert = newBackendQuestions.map(q => ({
      ...q,
      category: 'Backend Developer'
    }));

    const insertResult = await MCQQuestion.insertMany(questionsToInsert, { ordered: true });
    console.log(`✨ Inserted: ${insertResult.length} new questions\n`);

    const afterCount = await MCQQuestion.countDocuments({ category: 'Backend Developer' });
    const hardCount = newBackendQuestions.filter(q => q.difficulty === 'hard').length;
    const hardPercentage = ((hardCount / newBackendQuestions.length) * 100).toFixed(1);

    console.log(`📊 Questions after replacement: ${afterCount}`);
    console.log(`🎯 Hard difficulty questions: ${hardCount}/30 (${hardPercentage}%)`);

    if (afterCount === newBackendQuestions.length) {
      console.log('\n✅ SUCCESS! Backend Developer questions replaced with tricky ones.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

replaceBackendQuestions();
