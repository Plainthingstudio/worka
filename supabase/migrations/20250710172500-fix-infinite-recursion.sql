
-- Fix the infinite recursion issue by updating the has_role function
-- to bypass RLS completely

-- Drop the existing function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Create a new security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Use a direct query that bypasses RLS
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Also create a function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
  
  RETURN user_role;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Now update the RLS policies to be simpler and avoid recursion
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow owners and admins to view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role management for owners and initial setup" ON public.user_roles;

-- Create new simplified policies
-- Policy for users to view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for owners and administrators to view all roles
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
