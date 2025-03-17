
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStage } from '@/types';

export const useFetchLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to view leads");
        setIsLoading(false);
        return;
      }
      
      // Fetch leads from Supabase
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching leads:", error);
        toast.error("Failed to load leads");
        setIsLoading(false);
        return;
      }
      
      // Transform Supabase data to match Lead type
      const transformedLeads = data.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage as LeadStage,
        notes: lead.notes,
        address: lead.address,
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at)
      }));
      
      setLeads(transformedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    leads,
    setLeads,
    isLoading,
    fetchLeads
  };
};
