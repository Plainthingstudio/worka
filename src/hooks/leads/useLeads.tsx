
import { useEffect } from 'react';
import { useFetchLeads } from './useFetchLeads';
import { useLeadOperations } from './useLeadOperations';
import { UseLeadsReturn } from './types';

export const useLeads = (): UseLeadsReturn => {
  const { leads, setLeads, isLoading, fetchLeads } = useFetchLeads();
  const { addLead, updateLead, deleteLead } = useLeadOperations(leads, setLeads);

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    fetchLeads
  };
};
