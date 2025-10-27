-- Function to check if any admin exists (ignores RLS)
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  );
$$;

-- Allow bootstrapping the first admin: if no admin exists, the authenticated user can insert their own admin role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Bootstrap first admin'
  ) THEN
    CREATE POLICY "Bootstrap first admin"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
      (role = 'admin'::app_role) AND (auth.uid() = user_id) AND (NOT public.admin_exists())
    );
  END IF;
END $$;