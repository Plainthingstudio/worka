
-- Add metadata column to store position and message information
ALTER TABLE public.invitations 
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
