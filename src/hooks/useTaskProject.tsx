
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectData {
  id: string;
  name: string;
  status: string;
}

export const useTaskProject = (projectId: string | null) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      return;
    }

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('Error fetching project:', error);
          return;
        }

        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, isLoading };
};
