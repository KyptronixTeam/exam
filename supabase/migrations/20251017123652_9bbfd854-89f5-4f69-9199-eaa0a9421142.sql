-- Drop the incorrect policy
DROP POLICY IF EXISTS "Users can view questions" ON public.mcq_questions;

-- Create a new policy that allows anyone to view questions (needed for assessment)
CREATE POLICY "Anyone can view questions"
ON public.mcq_questions
FOR SELECT
USING (true);

-- Keep admin policy for management
-- The "Admins can manage questions" policy already exists and is fine