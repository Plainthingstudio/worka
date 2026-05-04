import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Client, Project, TeamMember, TeamPosition } from '@/types';
import { client as appwriteClient, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { toast } from 'sonner';

interface StatisticsData {
  clients: Client[];
  projects: Project[];
  teamMembers: TeamMember[];
}

const STATISTICS_REALTIME_COLLECTIONS = ['clients', 'projects', 'payments', 'team_members'];

export const statisticsQueryKey = ['statistics'] as const;

const fetchStatisticsData = async (): Promise<StatisticsData> => {
  const [clientsResponse, projectsResponse, paymentsResponse, teamResponse] = await Promise.all([
    databases.listDocuments(DATABASE_ID, 'clients', [Query.orderDesc('$createdAt')]),
    databases.listDocuments(DATABASE_ID, 'projects'),
    databases.listDocuments(DATABASE_ID, 'payments'),
    databases.listDocuments(DATABASE_ID, 'team_members'),
  ]);

  const clients: Client[] = clientsResponse.documents.map((c: any) => ({
    id: c.$id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    address: c.address || '',
    leadSource: (c.lead_source as any) || 'Website',
    createdAt: new Date(c.$createdAt),
  }));

  const paymentsByProject = new Map<string, any[]>();
  paymentsResponse.documents.forEach((payment: any) => {
    const list = paymentsByProject.get(payment.project_id) || [];
    list.push({
      id: payment.$id,
      projectId: payment.project_id,
      paymentType: payment.payment_type,
      amount: payment.amount,
      date: new Date(payment.date),
      notes: payment.notes || '',
    });
    paymentsByProject.set(payment.project_id, list);
  });

  const projects: Project[] = projectsResponse.documents.map((project: any) => ({
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
    payments: paymentsByProject.get(project.$id) || [],
  }));

  const teamMembers: TeamMember[] = teamResponse.documents.map((member: any) => ({
    id: member.$id,
    user_id: member.user_id,
    name: member.name,
    position: member.position as TeamPosition,
    skills: member.skills || [],
    startDate: new Date(member.start_date),
    createdAt: new Date(member.$createdAt),
  }));

  return { clients, projects, teamMembers };
};

export const useStatisticsData = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: statisticsQueryKey,
    queryFn: fetchStatisticsData,
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load statistics data');
    }
  }, [error]);

  useEffect(() => {
    const channels = STATISTICS_REALTIME_COLLECTIONS.map(
      (collection) => `databases.${DATABASE_ID}.collections.${collection}.documents`
    );

    const unsubscribe = appwriteClient.subscribe(channels, () => {
      queryClient.invalidateQueries({ queryKey: statisticsQueryKey });
    });

    return () => unsubscribe();
  }, [queryClient]);

  return {
    clients: data?.clients ?? [],
    projects: data?.projects ?? [],
    teamMembers: data?.teamMembers ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    fetchData: async () => {
      await refetch();
    },
  };
};
