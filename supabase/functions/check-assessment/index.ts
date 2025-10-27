import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, department, questionIds } = await req.json();
    
    console.log("Checking assessment for department:", department);
    console.log(`Validating ${answers.length} answers`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch only the specific questions that were shown to the student
    const { data: questions, error: questionsError } = await supabase
      .from("mcq_questions")
      .select("*")
      .in("id", questionIds);

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      throw new Error("Failed to fetch questions");
    }

    if (!questions || questions.length === 0) {
      throw new Error("No questions found for this department");
    }

    console.log(`Found ${questions.length} questions for ${department}`);

    // Prepare questions and answers for AI evaluation
    const questionAnswerPairs = questions.map((q: any, index: number) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      studentAnswer: answers[index]
    }));

    // Use AI to verify answers and provide feedback
    const prompt = `You are an expert examiner. Evaluate the following MCQ test answers for a ${department} student.

Questions and Answers:
${questionAnswerPairs.map((qa, i) => `
Question ${i + 1}: ${qa.question}
Options: ${qa.options.join(", ")}
Correct Answer: ${qa.correctAnswer}
Student Answer: ${qa.studentAnswer}
`).join("\n")}

Please analyze:
1. How many answers are correct
2. Calculate the percentage score
3. Provide brief feedback

Return your response in this exact JSON format:
{
  "correctCount": <number>,
  "totalQuestions": ${questions.length},
  "percentage": <number>,
  "feedback": "<brief feedback message>"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise assessment evaluator. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI Gateway request failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log("AI Response:", aiContent);
    
    // Parse AI response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          feedback: result.feedback,
          passed: result.percentage >= 90
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in check-assessment function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
