-- Add MCQ answers column to submissions table
ALTER TABLE public.submissions
ADD COLUMN mcq_answers jsonb;

COMMENT ON COLUMN public.submissions.mcq_answers IS 'Stores student MCQ question answers as JSON';