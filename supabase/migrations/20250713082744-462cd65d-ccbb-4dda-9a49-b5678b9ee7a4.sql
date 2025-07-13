
-- Add RLS policies only for tables that don't already have them
-- Skip invoice_items since that policy already exists

-- Check if leads policy exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leads' 
        AND policyname = 'Administrators and owners can view all leads'
    ) THEN
        CREATE POLICY "Administrators and owners can view all leads" 
        ON public.leads 
        FOR SELECT 
        USING (
          has_role(auth.uid(), 'owner'::app_role) OR 
          has_role(auth.uid(), 'administrator'::app_role)
        );
    END IF;
END $$;

-- Check if invoices policy exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoices' 
        AND policyname = 'Administrators and owners can view all invoices'
    ) THEN
        CREATE POLICY "Administrators and owners can view all invoices" 
        ON public.invoices 
        FOR SELECT 
        USING (
          has_role(auth.uid(), 'owner'::app_role) OR 
          has_role(auth.uid(), 'administrator'::app_role)
        );
    END IF;
END $$;
