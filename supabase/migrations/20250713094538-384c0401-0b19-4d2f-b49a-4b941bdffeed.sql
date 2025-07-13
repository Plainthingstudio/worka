-- First, let's check if the foreign key exists and drop it if it does
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'team_members_user_id_fkey' 
               AND table_name = 'team_members') THEN
        ALTER TABLE public.team_members DROP CONSTRAINT team_members_user_id_fkey;
    END IF;
END $$;

-- Now create the proper foreign key relationship
ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;