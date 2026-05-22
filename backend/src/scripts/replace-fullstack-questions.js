const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const newFullStackQuestions = [
  {
    question: "What's the difference between SQL and NoSQL databases for a full-stack application?",
    options: ["NoSQL is always better", "They are identical", "SQL uses tables/schemas; NoSQL uses document/key-value stores; choice depends on data structure", "SQL is always better"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In full-stack development, what's CORS and why is it needed?",
    options: ["Cross-Origin Resource Sharing; allows controlled access from different domains", "Database protocol", "Compression technique", "Cache protocol"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What's the issue with: frontend makes request to backend, but backend doesn't set Access-Control-Allow-Origin header?",
    options: ["Request doesn't reach backend", "No issue", "Backend crashes", "Frontend receives data but JS blocks access (CORS error)"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In a full-stack app, what's JWT (JSON Web Token) used for?",
    options: ["Stateless authentication between frontend and backend", "Database encryption", "Compressing data", "Caching responses"],
    correctAnswer: 0,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What happens if you store sensitive data (like passwords) in localStorage on the frontend?",
    options: ["Database automatically protects it", "Nothing, it's fine", "XSS attacks can steal it; should use httpOnly cookies instead", "It's secure"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In REST APIs, what's the difference between PUT and PATCH?",
    options: ["PUT is faster", "PUT replaces entire resource; PATCH updates specific fields", "Same thing", "PATCH is newer"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the risk of this code? fetch('/api/data', { headers: { 'Authorization': 'Bearer ' + token } })?",
    options: ["Token is encrypted", "Syntax error", "No risk", "Token exposed in browser console/history; should use httpOnly cookie instead"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In frontend-backend communication, what's 'request payload' vs 'response payload'?",
    options: ["Request is data sent to server; Response is data returned from server", "Only for GET requests", "Same thing", "Only for POST requests"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What's a common issue when frontend expects JSON but backend returns HTML error page?",
    options: ["Automatic conversion happens", "JSON.parse() throws error; frontend breaks", "No issue", "Frontend crashes silently"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In a full-stack app, what's the purpose of environment variables (.env)?",
    options: ["Store user data", "Store executable files", "Store sensitive config (API keys, DB URLs) without exposing in source code", "Improve performance"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the difference between client-side validation and server-side validation?",
    options: ["Only server-side matters", "Client is for UX; server is for security (client-side can be bypassed)", "Same security level", "Only client-side matters"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In React with a backend API, what's 'hydration' in Server-Side Rendering (SSR)?",
    options: ["Cache refresh", "Water usage optimization", "Attaching event listeners to server-rendered HTML on the client", "Database sync process"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What does this command do? npm install --save package_name",
    options: ["Installs locally and saves to package.json dependencies", "Updates package.json only", "Uninstalls package", "Installs globally"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "In full-stack development, what's 'middleware'?",
    options: ["Frontend component", "CSS library", "Functions that process requests before reaching handlers/responses", "Database layer"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the issue with: const data = JSON.parse(userInput) without try-catch?",
    options: ["Invalid JSON crashes the app with unhandled error", "Always succeeds", "No issue", "Automatic recovery"],
    correctAnswer: 0,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In API design, what's 'pagination' and why is it needed?",
    options: ["Caching strategy", "Limiting returned records to manage performance/bandwidth", "Search feature", "Page styling"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the difference between Monolithic and Microservices architecture?",
    options: ["Monolith is one large app; Microservices separate into independent services", "Microservices are deprecated", "Only naming difference", "Same thing"],
    correctAnswer: 0,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In full-stack apps, what's 'rate limiting' and where is it implemented?",
    options: ["Caching policy", "Database constraint", "Limiting API requests per user/IP to prevent abuse; usually backend", "Frontend feature"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's WebSocket and how does it differ from HTTP polling?",
    options: ["WebSocket is slower", "Two-way persistent connection vs repeated client requests; WebSocket is more efficient for real-time", "Same technology", "Another HTTP method"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In a full-stack app, what's 'state management' and why do you need it?",
    options: ["Network configuration", "CSS styling", "Database only feature", "Managing app data (state) consistently across components/layers"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the issue with: app.get('/api/secrets', (req, res) => { res.send(process.env); })?",
    options: ["Exposes all environment variables to frontend including sensitive API keys", "Works as intended", "No issue", "Syntax error"],
    correctAnswer: 0,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In frontend-backend communication, what does HTTP status 404 mean?",
    options: ["Success", "Client error", "Resource not found", "Server error"],
    correctAnswer: 2,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What's 'lazy loading' in full-stack web apps and why use it?",
    options: ["Cache invalidation", "Database optimization", "Delayed database queries", "Loading resources only when needed to improve initial load time"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In a full-stack app, what's the purpose of 'logging'?",
    options: ["Recording events/errors for debugging and monitoring", "Performance measurement only", "User tracking", "Tree removal"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What's the security risk of: app.use(express.json({ limit: '500mb' }))?",
    options: ["Syntax error", "Allows huge payloads causing DoS/memory exhaustion; should set reasonable limits", "Improves security", "No risk"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In full-stack development, what's 'dependency injection' and why use it?",
    options: ["Database injection", "Passing dependencies as parameters for flexibility, testability, and decoupling", "CSS technique", "Inserting libraries via npm"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's the difference between synchronous and asynchronous API calls in frontend?",
    options: ["Async is deprecated", "Sync is newer", "Sync blocks UI until response; async allows UI to stay responsive", "No difference"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In full-stack apps, what's 'API versioning' and when is it needed?",
    options: ["Supporting multiple API versions to avoid breaking client changes", "Frontend versioning", "Database versioning", "Version control only"],
    correctAnswer: 0,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the issue with: fetch(url) followed by .then(res => res.json()).then(data => { use data })?",
    options: ["Works perfectly", "Missing error handling; if API fails, error goes unhandled", "Syntax error", "Correct approach"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In a full-stack app, what's the purpose of 'build tools' like Webpack or Vite?",
    options: ["Version control", "Database management", "Bundling, minifying, and optimizing code for production", "Testing only"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  }
];

async function replaceFullStackQuestions() {
  try {
    console.log('✅ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);

    const categoryName = 'Full Stack Developer';

    const count = await MCQQuestion.countDocuments({ category: categoryName });
    console.log(`\n📊 Questions before replacement: ${count}`);

    const deleteResult = await MCQQuestion.deleteMany({ category: categoryName });
    console.log(`🗑️  Deleted: ${deleteResult.deletedCount} old questions`);

    const insertResult = await MCQQuestion.insertMany(
      newFullStackQuestions.map(q => ({
        ...q,
        category: categoryName
      }))
    );
    console.log(`\n✨ Inserted: ${insertResult.length} new questions`);

    const finalCount = await MCQQuestion.countDocuments({ category: categoryName });
    console.log(`📊 Questions after replacement: ${finalCount}`);

    const hardCount = await MCQQuestion.countDocuments({
      category: categoryName,
      difficulty: 'hard'
    });
    const percentage = ((hardCount / finalCount) * 100).toFixed(1);
    console.log(`🎯 Hard difficulty questions: ${hardCount}/${finalCount} (${percentage}%)`);

    console.log('\n✅ SUCCESS! Full Stack Developer questions replaced with tricky ones.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    console.log('✅ Disconnected from MongoDB');
    await mongoose.disconnect();
  }
}

replaceFullStackQuestions();
