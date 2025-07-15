-- Fix the ambiguous user_id reference in get_all_briefs function
CREATE OR REPLACE FUNCTION public.get_all_briefs(user_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, name text, email text, company_name text, type text, status text, submission_date timestamp with time zone, submitted_for_id uuid)
 LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- UI Design Briefs (with user_id filtering)
  SELECT 
    ui.id, 
    ui.user_id, 
    ui.name, 
    ui.email as email, 
    ui.company_name, 
    'UI Design'::TEXT as type, 
    ui.status, 
    ui.submission_date,
    ui.submitted_for_id
  FROM ui_design_briefs ui
  WHERE ui.user_id = user_uuid OR ui.submitted_for_id = user_uuid

  UNION ALL

  -- Graphic Design Briefs (with user_id filtering)
  SELECT 
    gd.id, 
    gd.user_id, 
    gd.name, 
    gd.email as email, 
    gd.company_name, 
    'Graphic Design'::TEXT as type, 
    gd.status, 
    gd.submission_date,
    gd.submitted_for_id
  FROM graphic_design_briefs gd
  WHERE gd.user_id = user_uuid OR gd.submitted_for_id = user_uuid

  UNION ALL

  -- Illustration Design Briefs (with user_id filtering) - FIXED the ambiguous reference
  SELECT 
    ill.id, 
    ill.user_id, 
    ill.name, 
    ill.email as email, 
    ill.company_name, 
    'Illustration Design'::TEXT as type, 
    ill.status, 
    ill.submission_date,
    ill.submitted_for_id
  FROM illustration_design_briefs ill
  WHERE ill.user_id = user_uuid OR ill.submitted_for_id = user_uuid

  ORDER BY submission_date DESC;
END;
$$;