
-- Add RLS policies for administrators and owners to view all briefs across all brief types

-- UI Design Briefs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ui_design_briefs' 
        AND policyname = 'Administrators and owners can view all UI design briefs'
    ) THEN
        CREATE POLICY "Administrators and owners can view all UI design briefs" 
        ON public.ui_design_briefs 
        FOR SELECT 
        USING (
          has_role(auth.uid(), 'owner'::app_role) OR 
          has_role(auth.uid(), 'administrator'::app_role)
        );
    END IF;
END $$;

-- Graphic Design Briefs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'graphic_design_briefs' 
        AND policyname = 'Administrators and owners can view all graphic design briefs'
    ) THEN
        CREATE POLICY "Administrators and owners can view all graphic design briefs" 
        ON public.graphic_design_briefs 
        FOR SELECT 
        USING (
          has_role(auth.uid(), 'owner'::app_role) OR 
          has_role(auth.uid(), 'administrator'::app_role)
        );
    END IF;
END $$;

-- Illustration Design Briefs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'illustration_design_briefs' 
        AND policyname = 'Administrators and owners can view all illustration design briefs'
    ) THEN
        CREATE POLICY "Administrators and owners can view all illustration design briefs" 
        ON public.illustration_design_briefs 
        FOR SELECT 
        USING (
          has_role(auth.uid(), 'owner'::app_role) OR 
          has_role(auth.uid(), 'administrator'::app_role)
        );
    END IF;
END $$;
