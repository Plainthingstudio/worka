
-- Add brief connection columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN brief_id uuid,
ADD COLUMN brief_type text;

-- Add comment to document the brief_type values
COMMENT ON COLUMN public.tasks.brief_type IS 'Type of brief connected to this task: UI Design, Graphic Design, or Illustration Design';

-- Create index for better query performance
CREATE INDEX idx_tasks_brief_id ON public.tasks(brief_id);
CREATE INDEX idx_tasks_brief_type ON public.tasks(brief_type);

-- Update RLS policies to ensure users can only connect briefs they have access to
-- This policy ensures users can only link briefs they own or have access to
CREATE OR REPLACE FUNCTION public.user_can_access_brief(brief_id uuid, brief_type text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user can access the brief based on brief type
  IF brief_type = 'UI Design' THEN
    RETURN EXISTS (
      SELECT 1 FROM ui_design_briefs 
      WHERE id = brief_id 
      AND (user_id = $3 OR submitted_for_id = $3)
    );
  ELSIF brief_type = 'Graphic Design' THEN
    RETURN EXISTS (
      SELECT 1 FROM graphic_design_briefs 
      WHERE id = brief_id 
      AND (user_id = $3 OR submitted_for_id = $3)
    );
  ELSIF brief_type = 'Illustration Design' THEN
    RETURN EXISTS (
      SELECT 1 FROM illustration_design_briefs 
      WHERE id = brief_id 
      AND (user_id = $3 OR submitted_for_id = $3)
    );
  END IF;
  
  RETURN false;
END;
$$;

-- Update task policies to validate brief access during updates
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
CREATE POLICY "Users can update tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
)
WITH CHECK (
  ((auth.uid() = user_id) OR 
   has_role(auth.uid(), 'owner'::app_role) OR 
   has_role(auth.uid(), 'administrator'::app_role)) AND
  (brief_id IS NULL OR 
   brief_type IS NULL OR 
   user_can_access_brief(brief_id, brief_type, auth.uid()))
);
