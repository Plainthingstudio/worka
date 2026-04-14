
import { useState, useEffect } from 'react';
import { Client, Project, TeamMember, TeamPosition } from '@/types';
import { databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { toast } from 'sonner';

export const useStatisticsData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch clients
      const clientsResponse = await databases.listDocuments(
        DATABASE_ID,
        'clients',
        [Query.orderDesc('$createdAt')]
      );

      const transformedClients: Client[] = clientsResponse.documents.map((client: any) => ({
        id: client.$id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
        leadSource: client.lead_source as any || 'Website',
        createdAt: new Date(client.$createdAt)
      }));

      // Fetch projects
      const projectsResponse = await databases.listDocuments(DATABASE_ID, 'projects');

      // For each project fetch its payments
      const transformedProjects: Project[] = await Promise.all(
        projectsResponse.documents.map(async (project: any) => {
          let payments: any[] = [];
          try {
            const paymentsResponse = await databases.listDocuments(
              DATABASE_ID,
              'payments',
              [Query.equal('project_id', project.$id)]
            );
            payments = paymentsResponse.documents.map((payment: any) => ({
              id: payment.$id,
              projectId: payment.project_id,
              paymentType: payment.payment_type as any,
              amount: payment.amount,
              date: new Date(payment.date),
              notes: payment.notes || ''
            }));
          } catch (e) {
            // no payments
          }

          return {
            id: project.$id,
            name: project.name,
            clientId: project.client_id,
            status: project.status as any,
            deadline: new Date(project.deadline),
            fee: project.fee,
            currency: project.currency as any,
            projectType: project.project_type as any,
            categories: project.categories || ['Other'],
            teamMembers: project.team_members || [],
            createdAt: new Date(project.$createdAt),
            payments: payments
          };
        })
      );

      // Fetch team members
      const teamResponse = await databases.listDocuments(DATABASE_ID, 'team_members');

      const transformedTeamMembers: TeamMember[] = teamResponse.documents.map((member: any) => ({
        id: member.$id,
        user_id: member.user_id,
        name: member.name,
        position: member.position as TeamPosition,
        skills: member.skills || [],
        startDate: new Date(member.start_date),
        createdAt: new Date(member.$createdAt)
      }));

      setClients(transformedClients);
      setProjects(transformedProjects);
      setTeamMembers(transformedTeamMembers);
    } catch (error: any) {
      console.error("Error fetching statistics data:", error);
      setError(error.message);
      toast.error("Failed to load statistics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    clients,
    projects,
    teamMembers,
    isLoading,
    error,
    fetchData
  };
};
