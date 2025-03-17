
import { Lead, LeadStage, LeadSource } from '@/types';

export interface UseLeadsReturn {
  leads: Lead[];
  isLoading: boolean;
  addLead: (data: AddLeadData) => Promise<Lead | null>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  fetchLeads: () => Promise<void>;
}

export interface AddLeadData {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  notes?: string;
  stage?: LeadStage;
  address?: string;
}
