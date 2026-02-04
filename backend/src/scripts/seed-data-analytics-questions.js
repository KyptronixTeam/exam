const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const dataAnalyticsQuestions = [
    // Power BI
    {
        question: "What does Power BI use for data modeling and calculations?",
        options: ["Python", "DAX", "SQL", "JavaScript"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which of these is a key component of Power BI?",
        options: ["Power Query", "Power Sound", "Power Vision", "Power Drive"],
        correctAnswer: 0,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "In Power BI, where do you usually go to transform and clean your data?",
        options: ["Report View", "Data View", "Power Query Editor", "Model View"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which file extension is used for Power BI Desktop files?",
        options: [".pptx", ".pbix", ".xlsx", ".docx"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is the purpose of 'Slicers' in Power BI?",
        options: ["To delete data", "To filter visuals on a report", "To create new tables", "To change the theme"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which DAX function is used to calculate the sum of a column?",
        options: ["TOTAL()", "ADD()", "SUM()", "COUNT()"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },

    // SQL Basics
    {
        question: "Which SQL clause is used to filter rows?",
        options: ["SORT BY", "WHERE", "ORDER BY", "GROUP BY"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Query Language", "Standard Quota List", "Sequential Query Logic"],
        correctAnswer: 0,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which command is used to retrieve data from a database?",
        options: ["GET", "OPEN", "SELECT", "READ"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which JOIN returns all records when there is a match in either left or right table?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctAnswer: 3,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "How do you select all columns from a table named 'Sales'?",
        options: ["SELECT all FROM Sales", "SELECT * FROM Sales", "SELECT columns FROM Sales", "GET * FROM Sales"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },

    // Excel
    {
        question: "In Excel, which symbol is used to start a formula?",
        options: ["@", "#", "=", "$"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is the primary use of a Pivot Table in Excel?",
        options: ["To create a new worksheet", "To summarize and analyze large datasets", "To check spelling", "To change font colors"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which function would you use to find the highest value in a range?",
        options: ["HIGH()", "MAX()", "TOP()", "LARGE()"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What does VLOOKUP stand for?",
        options: ["Very Long Lookup", "Vertical Lookup", "Variable Lookup", "Visual Lookup"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "In Excel, which feature allows you to change the appearance of cells based on their value?",
        options: ["AutoFormat", "Cell Styles", "Conditional Formatting", "Data Validation"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },

    // General Data Analytics / Statistics
    {
        question: "What is the 'Mean' in statistics?",
        options: ["The middle value", "The most frequent value", "The average value", "The difference between high and low"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which of these is a common data visualization tool besides Power BI?",
        options: ["Tableau", "Notepad", "Calculator", "Outlook"],
        correctAnswer: 0,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is a 'Null' value in a database?",
        options: ["Zero", "An empty string", "Missing or unknown data", "A space"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which chart type is best for showing a trend over time?",
        options: ["Pie Chart", "Line Chart", "Scatter Plot", "Bar Chart"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is 'Data Cleaning'?",
        options: ["Wiping the hard drive", "Identifying and fixing errors in a dataset", "Deleting all old data", "Sorting data alphabetically"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is the 'Median'?",
        options: ["The average", "The middle value in a sorted list", "The highest value", "The total count"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "A 'Primary Key' in a table must be:",
        options: ["A number", "Unique and not null", "A string", "The first column"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is 'Qualitative Data'?",
        options: ["Numerical data", "Descriptive data based on observations", "Data from a computer", "Random numbers"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "In data analytics, what does 'ETL' stand for?",
        options: ["Extract, Transform, Load", "Ensure, Transfer, List", "Edit, Test, Log", "Entry, Technical, Level"],
        correctAnswer: 0,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which visualization is best for showing parts of a whole?",
        options: ["Line Chart", "Bar Chart", "Pie Chart", "Scatter Plot"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is an 'Outlier' in a dataset?",
        options: ["The average value", "A value that lies far outside the range of other values", "The smallest value", "A duplicate entry"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "What is the purpose of 'Correlation' in data analysis?",
        options: ["To delete data", "To find the relationship between two variables", "To sort data", "To rename columns"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "Which SQL keyword is used to sort the result-set?",
        options: ["SORT BY", "ALIGN", "ORDER BY", "ARRANGE"],
        correctAnswer: 2,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    },
    {
        question: "In Power BI, what is a 'Measure'?",
        options: ["A physical distance", "A calculation used in visuals", "A type of table", "A folder"],
        correctAnswer: 1,
        category: "Data Analyst",
        difficulty: "easy",
        points: 1,
        isActive: true
    }
];

async function seedQuestions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await MCQQuestion.insertMany(dataAnalyticsQuestions);
        console.log(`Successfully seeded ${result.length} Data Analytics questions!`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding questions:', error);
        process.exit(1);
    }
}

seedQuestions();
