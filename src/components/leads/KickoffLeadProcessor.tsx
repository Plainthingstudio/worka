
import { useEffect } from 'react';
import { Lead } from '@/types';
import { useClients } from '@/hooks/useClients';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface KickoffLeadProcessorProps {
  leads: Lead[];
}

/**
 * Component that handles automatic conversion of Kickoff stage leads to clients
 */
const KickoffLeadProcessor: React.FC<KickoffLeadProcessorProps> = ({ leads }) => {
  const { addClient } = useClients();
  
  // Check for leads in "Kickoff" stage and add them as clients
  useEffect(() => {
    // Create a function to handle the client addition process
    const processKickoffLeads = async () => {
      const kickoffLeads = leads.filter(lead => lead.stage === 'Kickoff');
      
      // Process each kickoff lead one by one to avoid race conditions
      for (const lead of kickoffLeads) {
        try {
          // Check if this lead exists in clients table by email
          const { data: existingClients, error: checkError } = await supabase
            .from('clients')
            .select('email')
            .eq('email', lead.email);
            
          if (checkError) throw checkError;
          
          // If client with this email doesn't exist, add them
          if (!existingClients || existingClients.length === 0) {
            // Convert lead to client format
            const newClient = {
              name: lead.name,
              email: lead.email,
              phone: lead.phone || '',
              address: lead.address || '',
              leadSource: lead.source || 'Other'
            };
            
            // Add to clients table
            const success = await addClient(newClient);
            if (success) {
              toast.success(`Lead "${lead.name}" automatically added to clients`);
            }
          }
        } catch (error) {
          console.error('Error adding kickoff lead as client:', error);
          toast.error('Failed to add lead as client automatically');
        }
      }
    };
    
    // Call the async function
    if (leads.length > 0) {
      processKickoffLeads();
    }
  }, [leads, addClient]);

  // This component doesn't render anything
  return null;
};

export default KickoffLeadProcessor;
