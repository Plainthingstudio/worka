-- Fix the ambiguous user_id reference in user_can_access_brief function
CREATE OR REPLACE FUNCTION public.user_can_access_brief(brief_id uuid, brief_type text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user can access the brief based on brief type
  IF brief_type = 'UI Design' THEN
    RETURN EXISTS (
      SELECT 1 FROM ui_design_briefs ui
      WHERE ui.id = brief_id 
      AND (ui.user_id = user_can_access_brief.user_id OR ui.submitted_for_id = user_can_access_brief.user_id)
    );
  ELSIF brief_type = 'Graphic Design' THEN
    RETURN EXISTS (
      SELECT 1 FROM graphic_design_briefs gd
      WHERE gd.id = brief_id 
      AND (gd.user_id = user_can_access_brief.user_id OR gd.submitted_for_id = user_can_access_brief.user_id)
    );
  ELSIF brief_type = 'Illustration Design' THEN
    RETURN EXISTS (
      SELECT 1 FROM illustration_design_briefs ill
      WHERE ill.id = brief_id 
      AND (ill.user_id = user_can_access_brief.user_id OR ill.submitted_for_id = user_can_access_brief.user_id)
    );
  END IF;
  
  RETURN false;
END;
$$;