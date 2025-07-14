
-- Fix storage policies for task-attachments bucket
-- First, drop existing policies to recreate them
DROP POLICY IF EXISTS "Task attachment files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own task attachments" ON storage.objects;

-- Create more permissive policies for task attachments
CREATE POLICY "Anyone can view task attachment files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-attachments');

CREATE POLICY "Authenticated users can upload task attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'task-attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own task attachment files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own task attachment files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
