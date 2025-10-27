-- Create table for MCQ questions
CREATE TABLE public.mcq_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage questions"
ON public.mcq_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can view questions (for taking the test)
CREATE POLICY "Users can view questions"
ON public.mcq_questions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_mcq_questions_updated_at
BEFORE UPDATE ON public.mcq_questions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();