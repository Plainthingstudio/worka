
-- First, let's temporarily disable RLS on user_roles to assign the owner role
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Assign owner role to the first user (Demo User) if not already assigned
INSERT INTO public.user_roles (user_id, role)
SELECT '3d2f16db-195e-41f4-8d9d-3ba0d63afb60', 'owner'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '3d2f16db-195e-41f4-8d9d-3ba0d63afb60'
);

-- Also assign team role to the second user if not already assigned
INSERT INTO public.user_roles (user_id, role)
SELECT 'f5954882-5596-4a96-be9c-db688b253628', 'team'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'f5954882-5596-4a96-be9c-db688b253628'
);

-- Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners and Administrators can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage all roles" ON public.user_roles;

-- Create new policies that allow initial role assignment
CREATE POLICY "Allow users to view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow owners and admins to view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

-- Allow owners to manage roles, but also allow initial assignment when no roles exist
CREATE POLICY "Allow role management for owners and initial setup"
  ON public.user_roles
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'owner') OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner')
  );
