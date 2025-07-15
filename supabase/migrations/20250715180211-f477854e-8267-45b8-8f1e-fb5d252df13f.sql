
-- Fix the ambiguous user_id reference in get_user_briefs function
CREATE OR REPLACE FUNCTION public.get_user_briefs(user_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, name text, email text, company_name text, type text, status text, submission_date timestamp with time zone, submitted_for_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is owner or administrator
  IF has_role(user_uuid, 'owner'::app_role) OR has_role(user_uuid, 'administrator'::app_role) THEN
    -- Return all briefs for owners and administrators
    RETURN QUERY
    -- UI Design Briefs
    SELECT 
      ui.id, 
      ui.user_id, 
      ui.name, 
      ui.email, 
      ui.company_name, 
      'UI Design'::TEXT as type, 
      ui.status, 
      ui.submission_date,
      ui.submitted_for_id
    FROM ui_design_briefs ui

    UNION ALL

    -- Graphic Design Briefs
    SELECT 
      gd.id, 
      gd.user_id, 
      gd.name, 
      gd.email, 
      gd.company_name, 
      'Graphic Design'::TEXT as type, 
      gd.status, 
      gd.submission_date,
      gd.submitted_for_id
    FROM graphic_design_briefs gd

    UNION ALL

    -- Illustration Design Briefs
    SELECT 
      ill.id, 
      ill.user_id, 
      ill.name, 
      ill.email, 
      ill.company_name, 
      'Illustration Design'::TEXT as type, 
      ill.status, 
      ill.submission_date,
      ill.submitted_for_id
    FROM illustration_design_briefs ill

    ORDER BY submission_date DESC;
  ELSE
    -- Return only user's own briefs for regular users
    RETURN QUERY
    -- UI Design Briefs
    SELECT 
      ui.id, 
      ui.user_id, 
      ui.name, 
      ui.email, 
      ui.company_name, 
      'UI Design'::TEXT as type, 
      ui.status, 
      ui.submission_date,
      ui.submitted_for_id
    FROM ui_design_briefs ui
    WHERE ui.user_id = user_uuid OR ui.submitted_for_id = user_uuid

    UNION ALL

    -- Graphic Design Briefs
    SELECT 
      gd.id, 
      gd.user_id, 
      gd.name, 
      gd.email, 
      gd.company_name, 
      'Graphic Design'::TEXT as type, 
      gd.status, 
      gd.submission_date,
      gd.submitted_for_id
    FROM graphic_design_briefs gd
    WHERE gd.user_id = user_uuid OR gd.submitted_for_id = user_uuid

    UNION ALL

    -- Illustration Design Briefs
    SELECT 
      ill.id, 
      ill.user_id, 
      ill.name, 
      ill.email, 
      ill.company_name, 
      'Illustration Design'::TEXT as type, 
      ill.status, 
      ill.submission_date,
      ill.submitted_for_id
    FROM illustration_design_briefs ill
    WHERE ill.user_id = user_uuid OR ill.submitted_for_id = user_uuid

    ORDER BY submission_date DESC;
  END IF;
END;
$$;
