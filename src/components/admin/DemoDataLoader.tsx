import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2, Trash2, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const demoQuestions = [
  // UI/UX Designer Questions
  {
    subject: "UI/UX Designer",
    question: "What does UX stand for?",
    options: ["User Experience", "User Execution", "Universal Experience", "User Extension"],
    correct_answer: "User Experience"
  },
  {
    subject: "UI/UX Designer",
    question: "Which tool is commonly used for wireframing?",
    options: ["Figma", "MySQL", "Python", "Docker"],
    correct_answer: "Figma"
  },
  {
    subject: "UI/UX Designer",
    question: "What is the F-pattern in web design?",
    options: ["A coding pattern", "How users scan web content", "A color scheme", "A layout framework"],
    correct_answer: "How users scan web content"
  },
  {
    subject: "UI/UX Designer",
    question: "What is A/B testing?",
    options: ["Testing server speed", "Comparing two versions", "Database testing", "API testing"],
    correct_answer: "Comparing two versions"
  },
  {
    subject: "UI/UX Designer",
    question: "What is the recommended touch target size for mobile?",
    options: ["20x20 pixels", "32x32 pixels", "44x44 pixels", "64x64 pixels"],
    correct_answer: "44x44 pixels"
  },

  // Frontend Developer Questions
  {
    subject: "Frontend Developer",
    question: "What does HTML stand for?",
    options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
    correct_answer: "HyperText Markup Language"
  },
  {
    subject: "Frontend Developer",
    question: "Which CSS property is used for flexbox?",
    options: ["display: flex", "display: grid", "display: block", "display: inline"],
    correct_answer: "display: flex"
  },
  {
    subject: "Frontend Developer",
    question: "What is the Virtual DOM in React?",
    options: ["A database", "Lightweight copy of actual DOM", "Server component", "CSS framework"],
    correct_answer: "Lightweight copy of actual DOM"
  },
  {
    subject: "Frontend Developer",
    question: "Which hook manages side effects in React?",
    options: ["useState", "useEffect", "useContext", "useMemo"],
    correct_answer: "useEffect"
  },
  {
    subject: "Frontend Developer",
    question: "What is responsive design?",
    options: ["Fast loading design", "Design that adapts to screen sizes", "Colorful design", "Animated design"],
    correct_answer: "Design that adapts to screen sizes"
  },

  // Backend Developer Questions
  {
    subject: "Backend Developer",
    question: "What is REST API?",
    options: ["Representational State Transfer", "Remote State Transfer", "Reliable State Transfer", "Real-time State Transfer"],
    correct_answer: "Representational State Transfer"
  },
  {
    subject: "Backend Developer",
    question: "Which HTTP method is used to update data?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correct_answer: "PUT"
  },
  {
    subject: "Backend Developer",
    question: "What is SQL used for?",
    options: ["Styling web pages", "Managing databases", "Creating animations", "Building UI"],
    correct_answer: "Managing databases"
  },
  {
    subject: "Backend Developer",
    question: "What does CRUD stand for?",
    options: ["Create Read Update Delete", "Connect Run Update Deploy", "Create Run Update Delete", "Connect Read Update Deploy"],
    correct_answer: "Create Read Update Delete"
  },
  {
    subject: "Backend Developer",
    question: "What is Node.js?",
    options: ["A database", "JavaScript runtime environment", "A CSS framework", "A design tool"],
    correct_answer: "JavaScript runtime environment"
  },

  // Python Developer Questions
  {
    subject: "Python Developer",
    question: "What is Python primarily used for?",
    options: ["Styling", "Programming and scripting", "Database design only", "Hardware control only"],
    correct_answer: "Programming and scripting"
  },
  {
    subject: "Python Developer",
    question: "Which keyword is used to define a function in Python?",
    options: ["function", "def", "func", "define"],
    correct_answer: "def"
  },
  {
    subject: "Python Developer",
    question: "What is Django?",
    options: ["A database", "A Python web framework", "A JavaScript library", "A design tool"],
    correct_answer: "A Python web framework"
  },
  {
    subject: "Python Developer",
    question: "What does PEP 8 define?",
    options: ["Python syntax", "Style guide for Python code", "Database schema", "API endpoints"],
    correct_answer: "Style guide for Python code"
  },
  {
    subject: "Python Developer",
    question: "What is pip in Python?",
    options: ["A variable", "Package installer", "A function", "A loop"],
    correct_answer: "Package installer"
  },

  // Full Stack Developer Questions
  {
    subject: "Full Stack Developer",
    question: "What is the MERN stack?",
    options: ["MySQL Express React Node", "MongoDB Express React Node", "MongoDB Express Redux Node", "MySQL Express Redux Node"],
    correct_answer: "MongoDB Express React Node"
  },
  {
    subject: "Full Stack Developer",
    question: "What is Git used for?",
    options: ["Database management", "Version control", "Server hosting", "UI design"],
    correct_answer: "Version control"
  },
  {
    subject: "Full Stack Developer",
    question: "What is an API?",
    options: ["A database", "Application Programming Interface", "A design pattern", "A framework"],
    correct_answer: "Application Programming Interface"
  },
  {
    subject: "Full Stack Developer",
    question: "What does JWT stand for?",
    options: ["Java Web Token", "JSON Web Token", "JavaScript Web Tool", "Java Web Tool"],
    correct_answer: "JSON Web Token"
  },
  {
    subject: "Full Stack Developer",
    question: "What is Docker used for?",
    options: ["Database design", "Containerization", "UI design", "Testing only"],
    correct_answer: "Containerization"
  },
];

const demoSubmissions = [
  {
    full_name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    college_name: "Indian Institute of Technology Delhi",
    course_department: "UI/UX Designer",
    year_semester: "3rd Year - Semester 5",
    project_title: "Mobile Banking App Redesign",
    project_description: "A complete UX overhaul of a traditional banking app focusing on accessibility and user-friendly navigation for elderly users. Includes detailed user research, wireframes, and high-fidelity prototypes.",
    website_url: "https://figma.com/rahul-banking-redesign",
    mcq_answers: ["User Experience", "Figma", "How users scan web content", "Comparing two versions", "44x44 pixels"],
    status: "approved"
  },
  {
    full_name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 87654 32109",
    college_name: "National Institute of Technology Trichy",
    course_department: "Frontend Developer",
    year_semester: "4th Year - Semester 7",
    project_title: "E-Commerce Platform with React",
    project_description: "Built a fully responsive e-commerce platform using React, Redux, and Tailwind CSS. Features include product catalog, shopping cart, checkout flow, and admin dashboard with real-time inventory management.",
    website_url: "https://github.com/priya-ecommerce-demo",
    mcq_answers: ["HyperText Markup Language", "display: flex", "Lightweight copy of actual DOM", "useEffect", "Design that adapts to screen sizes"],
    status: "pending"
  },
  {
    full_name: "Arjun Kumar",
    email: "arjun.kumar@example.com",
    phone: "+91 76543 21098",
    college_name: "Delhi Technological University",
    course_department: "Backend Developer",
    year_semester: "3rd Year - Semester 6",
    project_title: "RESTful API for Healthcare Management",
    project_description: "Developed a secure RESTful API using Node.js and PostgreSQL for managing patient records, appointments, and medical prescriptions. Implemented JWT authentication and role-based access control.",
    website_url: "https://github.com/arjun-healthcare-api",
    mcq_answers: ["Representational State Transfer", "PUT", "Managing databases", "Create Read Update Delete", "JavaScript runtime environment"],
    status: "approved"
  },
  {
    full_name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 65432 10987",
    college_name: "BITS Pilani",
    course_department: "Python Developer",
    year_semester: "2nd Year - Semester 4",
    project_title: "AI-Powered Chatbot using Python",
    project_description: "Created an intelligent chatbot using Python, NLTK, and TensorFlow for customer support automation. The bot can handle common queries, escalate complex issues, and learn from interactions.",
    website_url: "https://github.com/sneha-ai-chatbot",
    mcq_answers: ["Programming and scripting", "def", "A Python web framework", "Style guide for Python code", "Package installer"],
    status: "pending"
  },
  {
    full_name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 54321 09876",
    college_name: "Anna University",
    course_department: "Full Stack Developer",
    year_semester: "4th Year - Semester 8",
    project_title: "Social Media Platform - MERN Stack",
    project_description: "Full-stack social media application built with MongoDB, Express, React, and Node.js. Features include user authentication, posts, comments, likes, real-time chat, and image uploads with AWS S3 integration.",
    website_url: "https://social-connect-demo.netlify.app",
    mcq_answers: ["MongoDB Express React Node", "Version control", "Application Programming Interface", "JSON Web Token", "Containerization"],
    status: "approved"
  },
  {
    full_name: "Ananya Gupta",
    email: "ananya.gupta@example.com",
    phone: "+91 43210 98765",
    college_name: "Vellore Institute of Technology",
    course_department: "UI/UX Designer",
    year_semester: "2nd Year - Semester 3",
    project_title: "Food Delivery App UI/UX Case Study",
    project_description: "Comprehensive UI/UX design for a food delivery application with focus on minimizing order time and improving user satisfaction. Includes competitive analysis, user personas, and usability testing results.",
    website_url: "https://behance.net/ananya-food-delivery",
    mcq_answers: ["User Experience", "Figma", "How users scan web content", "Comparing two versions", "44x44 pixels"],
    status: "rejected"
  },
  {
    full_name: "Karan Mehta",
    email: "karan.mehta@example.com",
    phone: "+91 32109 87654",
    college_name: "Manipal Institute of Technology",
    course_department: "Frontend Developer",
    year_semester: "3rd Year - Semester 5",
    project_title: "Portfolio Website with Next.js",
    project_description: "Modern, performant portfolio website built with Next.js 14, TypeScript, and Framer Motion. Features server-side rendering, optimized images, dynamic routing, and a blog powered by MDX.",
    website_url: "https://karan-portfolio.vercel.app",
    mcq_answers: ["HyperText Markup Language", "display: flex", "Lightweight copy of actual DOM", "useEffect", "Design that adapts to screen sizes"],
    status: "pending"
  },
  {
    full_name: "Divya Nair",
    email: "divya.nair@example.com",
    phone: "+91 21098 76543",
    college_name: "College of Engineering Pune",
    course_department: "Backend Developer",
    year_semester: "4th Year - Semester 7",
    project_title: "Microservices Architecture for E-Learning",
    project_description: "Scalable microservices-based backend for an e-learning platform using Docker, Kubernetes, and RabbitMQ. Services include user management, course catalog, video streaming, and payment processing.",
    website_url: "https://github.com/divya-elearning-microservices",
    mcq_answers: ["Representational State Transfer", "PUT", "Managing databases", "Create Read Update Delete", "JavaScript runtime environment"],
    status: "approved"
  }
];

export const DemoDataLoader = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [clearingSubmissions, setClearingSubmissions] = useState(false);

  const loadDemoQuestions = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('mcq_questions')
        .insert(demoQuestions);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Added ${demoQuestions.length} demo questions to the database.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllQuestions = async () => {
    if (!confirm("Are you sure you want to delete ALL questions? This cannot be undone!")) {
      return;
    }

    setClearing(true);
    try {
      const { error } = await supabase
        .from('mcq_questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) throw error;

      toast({
        title: "Success!",
        description: "All questions have been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const loadDemoSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      // Get current user to use as user_id for demo submissions
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to load demo submissions.",
          variant: "destructive",
        });
        return;
      }

      // Add user_id to each submission
      const submissionsWithUserId = demoSubmissions.map(sub => ({
        ...sub,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('submissions')
        .insert(submissionsWithUserId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Added ${demoSubmissions.length} demo submissions to the database.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const clearAllSubmissions = async () => {
    if (!confirm("Are you sure you want to delete ALL submissions? This cannot be undone!")) {
      return;
    }

    setClearingSubmissions(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) throw error;

      toast({
        title: "Success!",
        description: "All submissions have been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClearingSubmissions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* MCQ Questions Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Demo MCQ Questions
          </CardTitle>
          <CardDescription>
            Quickly populate the database with sample MCQ questions for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={loadDemoQuestions} 
              disabled={loading || clearing}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Load {demoQuestions.length} Demo Questions
                </>
              )}
            </Button>
            
            <Button 
              onClick={clearAllQuestions} 
              disabled={loading || clearing}
              variant="destructive"
              className="flex-1"
            >
              {clearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Questions
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Adds 5 questions per department</p>
            <p>• Covers: UI/UX, Frontend, Backend, Python, Full Stack</p>
            <p>• Total: {demoQuestions.length} questions</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submissions Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Demo Submissions
          </CardTitle>
          <CardDescription>
            Populate the database with sample student submissions for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={loadDemoSubmissions} 
              disabled={loadingSubmissions || clearingSubmissions}
              className="flex-1"
            >
              {loadingSubmissions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Load {demoSubmissions.length} Demo Submissions
                </>
              )}
            </Button>
            
            <Button 
              onClick={clearAllSubmissions} 
              disabled={loadingSubmissions || clearingSubmissions}
              variant="destructive"
              className="flex-1"
            >
              {clearingSubmissions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Submissions
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Sample submissions from various departments</p>
            <p>• Includes approved, pending, and rejected statuses</p>
            <p>• Total: {demoSubmissions.length} submissions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
