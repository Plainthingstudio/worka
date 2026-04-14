
import { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '@/integrations/appwrite/client';

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
        const doc = await databases.getDocument(DATABASE_ID, 'projects', projectId);
        setProject({
          id: doc.$id,
          name: doc.name,
          status: doc.status,
        });
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
