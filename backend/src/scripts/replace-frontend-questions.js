const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const newFrontendQuestions = [
  {
    question: "What will be logged to the console? const arr = [1, 2, 3]; console.log(arr.map(x => x * 2).filter(x => x > 3));",
    options: ["[1, 2, 3]", "[4, 6]", "[2, 4, 6]", "[NaN, NaN, NaN]"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What is the difference between 'margin' and 'padding' in CSS?",
    options: ["They are identical", "Padding is inside the element; margin is outside", "Margin is inside the element; padding is outside", "Margin applies to text; padding applies to images"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 1
  },
  {
    question: "In React, what happens when you call setState in a render method? function MyComponent() { useState(setState(1)); return <div>{state}</div>; }",
    options: ["State updates without issues", "Throws immediate error", "Creates a new state variable", "Causes infinite loop/performance issue"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What does this return? console.log([] + []);",
    options: ["[]", "undefined", "\"\"", "Error"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In CSS, which has higher specificity? .class or [attribute]?",
    options: [".class (0,1,0)", "#id (1,0,0)", "[attribute] (0,1,0) - they are equal", "element selector"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What does this code log? let x = {}; let y = {}; console.log(x == y);",
    options: ["undefined", "false", "true", "Error"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In React, if a child component re-renders, does the parent automatically re-render? Pick the most accurate answer.",
    options: ["Always", "Never", "Only if parent uses React.memo", "No, child re-render doesn't trigger parent"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What is the output? const obj = { a: 1 }; const { a, b = 2 } = obj; console.log(b);",
    options: ["undefined", "2", "1", "Error"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's the correct order of CSS specificity from lowest to highest?",
    options: ["!important < id < class < element", "class < element < id < attribute", "element < attribute < class < id < !important", "element < class < attribute < id < !important"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What does event.stopPropagation() NOT prevent? (Pick what it doesn't prevent)",
    options: ["Parent event handlers from firing", "Default browser behavior like form submission", "Bubbling to parent elements", "All of the above"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In JavaScript, what happens with this code? var a; console.log(a);",
    options: ["undefined", "null", "ReferenceError", "Error"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What is the output? console.log(typeof typeof 1);",
    options: ["number", "\"string\"", "string", "\"number\""],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In React, what's the issue with this code? useEffect(() => { setCount(count + 1); }, [count])",
    options: ["No issue", "Effect won't run", "Missing return statement", "Creates infinite loop"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What is the output? console.log(0.1 + 0.2 == 0.3);",
    options: ["undefined", "true", "false", "Error"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In a flex container, what does 'flex: 1' actually mean?",
    options: ["Sets only width to 1px", "Sets flex-grow: 1, flex-shrink: 1, flex-basis: 0%", "Sets flex-grow to 1 only", "Sets opacity to 1"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What will this code output? const promise = Promise.resolve(5); promise.then(x => console.log(x));",
    options: ["Error", "Logs 5 immediately", "Logs 5 after all synchronous code", "Nothing"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 1
  },
  {
    question: "Which HTML element is semantically correct for important text?",
    options: ["<strong>", "<em>", "<b>", "<mark>"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "What's the difference between 'display: none' and 'visibility: hidden'?",
    options: ["Both remove element from layout", "visibility: hidden is faster", "display: none removes from layout; visibility: hidden hides but keeps space", "No difference"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What does this return? function test(a, a, c) { return a + c; } test(1, 2, 3);",
    options: ["5", "Error", "4", "6"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In React, when does useLayoutEffect run compared to useEffect?",
    options: ["At the same time", "useLayoutEffect after useEffect", "useEffect before useLayoutEffect", "useLayoutEffect runs synchronously after DOM mutations; useEffect runs asynchronously"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What will this log? console.log(parseInt('10', 2));",
    options: ["2", "NaN", "Error", "10"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "In CSS Grid, what's the difference between 'grid-template-columns: 1fr 1fr' vs 'grid-template-columns: 50% 50%'?",
    options: ["No difference", "1fr divides available space after gaps; 50% includes gaps in calculation", "50% is better", "1fr is deprecated"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What is 'tree shaking' in bundlers and how does it work?",
    options: ["Optimizes image sizes", "Removes unused code by analyzing import/export statements", "A linting feature", "A random process"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What does this code do? const arr = [1, 2, 3]; arr.forEach(() => console.log('hi')); console.log(arr);",
    options: ["Logs 'hi' and modifies array", "Error", "Logs only [1, 2, 3]", "Logs 'hi' three times, then [1, 2, 3]"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  },
  {
    question: "In React, what's the issue with: <button onClick={this.handleClick()}>Click</button>?",
    options: ["No issue", "Should use arrow function", "Missing event parameter", "Handler called immediately on render instead of on click"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What does getComputedStyle return for an element with no margin? getComputedStyle(element).margin",
    options: ["undefined", "0", "null", "0px"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What's the difference between Array.prototype.map and Array.prototype.forEach?",
    options: ["map returns new array; forEach returns undefined", "forEach is faster", "No difference", "map modifies original array"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 1
  },
  {
    question: "In REST API design, when should you use PUT vs POST? (Most accurate answer)",
    options: ["Both do the same thing", "PUT for creation; POST for updates", "POST creates; PUT replaces/updates", "No difference for REST"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 1
  },
  {
    question: "What's hoisted first in JavaScript - function declarations or variable declarations?",
    options: ["Variables first", "It depends", "Both equally", "Functions first"],
    correctAnswer: 3,
    difficulty: "hard",
    points: 1
  },
  {
    question: "What will this return? [1, 2, 3].reduce((acc, val) => acc + val);",
    options: ["undefined", "NaN", "Error", "6"],
    correctAnswer: 3,
    difficulty: "medium",
    points: 1
  }
];

async function replaceFrontendQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const beforeCount = await MCQQuestion.countDocuments({ category: 'Frontend Developer' });
    console.log(`📊 Questions before replacement: ${beforeCount}`);

    const deleteResult = await MCQQuestion.deleteMany({ category: 'Frontend Developer' });
    console.log(`🗑️  Deleted: ${deleteResult.deletedCount} old questions\n`);

    const questionsToInsert = newFrontendQuestions.map(q => ({
      ...q,
      category: 'Frontend Developer'
    }));

    const insertResult = await MCQQuestion.insertMany(questionsToInsert, { ordered: true });
    console.log(`✨ Inserted: ${insertResult.length} new questions\n`);

    const afterCount = await MCQQuestion.countDocuments({ category: 'Frontend Developer' });
    const hardCount = newFrontendQuestions.filter(q => q.difficulty === 'hard').length;
    const hardPercentage = ((hardCount / newFrontendQuestions.length) * 100).toFixed(1);

    console.log(`📊 Questions after replacement: ${afterCount}`);
    console.log(`🎯 Hard difficulty questions: ${hardCount}/30 (${hardPercentage}%)`);

    if (afterCount === newFrontendQuestions.length) {
      console.log('\n✅ SUCCESS! Frontend Developer questions replaced with tricky ones.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

replaceFrontendQuestions();
