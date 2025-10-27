
-- Add phone column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Create an admin user profile (you'll need to sign up with this email first)
-- Note: The actual user account needs to be created through the signup process
-- This just prepares the profile structure
