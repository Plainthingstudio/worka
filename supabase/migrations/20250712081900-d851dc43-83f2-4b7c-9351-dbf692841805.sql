
-- Fix the infinite recursion issue by updating the RLS policies on user_roles table

-- First, drop all existing problematic policies on user_roles
DROP POLICY IF EXISTS "Allow owners and admins to view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role management for owners and initial setup" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to view their own roles" ON public.user_roles;

-- Create new simplified policies that don't cause recursion
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for owners and administrators to view all roles (using the SECURITY DEFINER function)
CREATE POLICY "Owners and Administrators can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

-- Policy for owners to manage all roles
CREATE POLICY "Owners can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- Policy to allow initial user role creation (when no owner exists yet)
CREATE POLICY "Allow initial role creation"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') OR
    public.has_role(auth.uid(), 'owner')
  );
