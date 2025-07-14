-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Planning',
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  task_type TEXT NOT NULL DEFAULT 'Primary' CHECK (task_type IN ('Primary', 'Secondary', 'Tertiary')),
  assignees UUID[] DEFAULT '{}',
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task attachments table
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks of their projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their projects" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks of their projects" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks of their projects" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for task comments
CREATE POLICY "Users can view comments of their project tasks" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_comments.task_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments for their project tasks" ON public.task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_comments.task_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON public.task_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.task_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for task attachments
CREATE POLICY "Users can view attachments of their project tasks" ON public.task_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_attachments.task_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their project tasks" ON public.task_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_attachments.task_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own attachments" ON public.task_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true);

-- Storage policies for task attachments
CREATE POLICY "Task attachment files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-attachments');

CREATE POLICY "Users can upload task attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own task attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own task attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();