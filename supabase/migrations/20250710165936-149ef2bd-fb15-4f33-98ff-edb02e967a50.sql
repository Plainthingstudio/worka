
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'administrator', 'team');

-- Create user_roles table to store user role assignments
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create invitations table for email-based invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners and Administrators can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

CREATE POLICY "Owners can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- RLS Policies for invitations table
CREATE POLICY "Owners and Administrators can manage invitations"
  ON public.invitations
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

CREATE POLICY "Anyone can view invitations by token"
  ON public.invitations
  FOR SELECT
  USING (true);

-- Update existing table policies to include role-based access

-- Update team_members policies
DROP POLICY IF EXISTS "Users can view their own team members" ON public.team_members;
CREATE POLICY "All authenticated users can view team members"
  ON public.team_members
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own team members" ON public.team_members;
CREATE POLICY "Only Owners can manage team members"
  ON public.team_members
  FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- Update projects policies to allow team members access
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "All authenticated users can view projects"
  ON public.projects
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Owners and Administrators can manage projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Owners and Administrators can update projects"
  ON public.projects
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Owners and Administrators can delete projects"
  ON public.projects
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'administrator')
  );

-- Trigger to automatically assign 'owner' role to the first user
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If this is the first user, make them an owner
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
