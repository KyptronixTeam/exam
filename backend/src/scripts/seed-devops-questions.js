const mongoose = require('mongoose');
const MCQQuestion = require('../models/mcqQuestion.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const devOpsQuestions = [
    // AWS
    {
        question: "Which AWS service is primarily used for scalable object storage?",
        options: ["Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon Lambda"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What does EC2 stand for in AWS?",
        options: ["Elastic Compute Cloud", "Elastic Cloud Computer", "Enterprise Cloud Computational", "Easy Computer Cloud"],
        correctAnswer: 0,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "Which AWS service is used to run code without provisioning or managing servers?",
        options: ["EC2", "Lambda", "S3", "VPC"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "What is the primary purpose of AWS IAM?",
        options: ["To manage databases", "To manage networking rule", "To manage access and permissions", "To monitor application performance"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },

    // Docker
    {
        question: "What command is used to build a Docker image from a Dockerfile?",
        options: ["docker create", "docker run", "docker build", "docker image"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "Which file is used to define multi-container Docker applications?",
        options: ["Dockerfile", "docker-compose.yml", "package.json", "manifest.json"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What is the main difference between a Docker Image and a Docker Container?",
        options: ["No difference", "Image is a running process, Container is the file", "Image is the blueprint, Container is the running instance", "Container is for Linux, Image is for Windows"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "Which command runs a container in the background (detached mode)?",
        options: ["docker run -b", "docker run -d", "docker run --hidden", "docker run &"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },

    // CI/CD
    {
        question: "What does CI stand for in CI/CD?",
        options: ["Continuous Integration", "Continuous Improvement", "Code Integration", "Cloud Inspection"],
        correctAnswer: 0,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "Which of the following is a popular CI/CD tool?",
        options: ["Photoshop", "Jenkins", "Postman", "Excel"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "In a typical CI/CD pipeline, what happens after the 'Build' stage?",
        options: ["Plan", "Code", "Test", "Monitor"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "What is the main benefit of Continuous Deployment?",
        options: ["Manual approval for every release", "Slower release cycles", "Automated release to production", "More bugs in production"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "hard",
        points: 1
    },

    // SSL / Security
    {
        question: "What is the standard port for HTTPS traffic?",
        options: ["80", "21", "443", "8080"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What does SSL stand for?",
        options: ["Secure Sockets Layer", "Secure Standard Language", "System Security Level", "Simple Socket Link"],
        correctAnswer: 0,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "Which of these is used to obtain a free SSL certificate?",
        options: ["GoDaddy", "Let's Encrypt", "AWS Route53", "Nginx"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "What is the purpose of SSH keys?",
        options: ["To encrypt database fields", "To log in to remote servers securely", "To valid HTML forms", "To sign email messages"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },

    // Hosting / VPS
    {
        question: "Which of the following is an example of a web server software?",
        options: ["MySQL", "Nginx", "Redis", "MongoDB"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What is a 'Reverse Proxy'?",
        options: ["A proxy that hides the client", "A server that sits in front of web servers and forwards requests", "A firewall rule", "A database backup tool"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "hard",
        points: 1
    },
    {
        question: "Which command is used to list running processes in Linux?",
        options: ["ls", "cd", "ps", "mkdir"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "What does 'localhost' typically resolve to?",
        options: ["192.168.1.1", "127.0.0.1", "0.0.0.0", "10.0.0.1"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },

    // Routing / Domains
    {
        question: "Which DNS record type maps a domain name to an IPv4 address?",
        options: ["CNAME", "MX", "A", "TXT"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "Which DNS record is used for email server configuration?",
        options: ["A", "PTR", "MX", "AAAA"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What is the function of a Load Balancer?",
        options: ["To store data", "To distribute incoming network traffic across multiple servers", "To encrypt passwords", "To compile code"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "What does DNS stand for?",
        options: ["Domain Name System", "Dynamic Network Service", "Digital Name Server", "Data Network Storage"],
        correctAnswer: 0,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },

    // General DevOps
    {
        question: "What is 'Infrastructure as Code' (IaC)?",
        options: ["Writing code to build infrastructure manually", "Managing and provisioning infrastructure through machine-readable definition files", "Rack mounting servers physically", "Coding inside a data center"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "Which tool is commonly used for Infrastructure as Code?",
        options: ["Terraform", "Slack", "Trello", "Zoom"],
        correctAnswer: 0,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    },
    {
        question: "What is the default port for SSH?",
        options: ["22", "23", "80", "443"],
        correctAnswer: 0,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "Which status code indicates 'Not Found'?",
        options: ["200", "500", "404", "301"],
        correctAnswer: 2,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What is 'Git' primarily used for?",
        options: ["Virtualization", "Version Control", "Containerization", "Database Management"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "easy",
        points: 1
    },
    {
        question: "What does 'kubectl' do?",
        options: ["Manages Docker containers", "Command line tool for controlling Kubernetes clusters", "Builds Java applications", "Monitors network traffic"],
        correctAnswer: 1,
        category: "DevOps Engineer",
        difficulty: "medium",
        points: 1
    }
];

async function seedQuestions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await MCQQuestion.insertMany(devOpsQuestions);
        console.log(`Successfully seeded ${result.length} DevOps questions!`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding questions:', error);
        process.exit(1);
    }
}

seedQuestions();
