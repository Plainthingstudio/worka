import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateBriefPDF } from '@/utils/briefPdfGenerator';
import { Json } from '@/integrations/supabase/types';

interface BriefData {
  id: string;
  type: string;
  [key: string]: any;
}

export function useBriefPdf() {
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchFullBriefData = async (brief: BriefData): Promise<BriefData> => {
    // Try to get the full brief data from the database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User not authenticated, using basic brief data for PDF");
        return brief;
      }
      
      const { data, error } = await supabase.rpc(
        'get_brief_details',
        { 
          brief_id: brief.id,
          brief_type: brief.type
        }
      );
      
      if (error) {
        console.warn("Could not fetch full brief details for PDF:", error);
        return brief;
      }
      
      if (data && typeof data === 'object') {
        console.log("Retrieved full brief details for PDF generation:", data);
        
        // Transform any snake_case to camelCase if needed
        const fullBriefData = {
          ...brief,
          ...data
        };
        
        // Make sure companyName and submissionDate are properly set
        const jsonData = data as Record<string, any>;
        
        if (jsonData.company_name) {
          fullBriefData.companyName = jsonData.company_name;
        }
        
        if (jsonData.submission_date) {
          fullBriefData.submissionDate = jsonData.submission_date;
        }
        
        // Handle website type interest correctly for UI design briefs
        if (brief.type === "UI Design" && jsonData.website_type_interest) {
          // If it's an array, keep it as is
          if (Array.isArray(jsonData.website_type_interest)) {
            fullBriefData.websiteTypeInterest = jsonData.website_type_interest;
          }
          // If it's a JSON string, parse it
          else if (typeof jsonData.website_type_interest === 'string') {
            try {
              fullBriefData.websiteTypeInterest = 
                JSON.parse(jsonData.website_type_interest);
            } catch (e) {
              console.error("Error parsing website_type_interest:", e);
            }
          }
        }
        
        return fullBriefData;
      }
    } catch (fetchError) {
      console.warn("Error fetching brief details for PDF:", fetchError);
    }
    
    return brief;
  };

  const generateBriefPDF = useCallback(async (brief: BriefData) => {
    if (isDownloading) return false;
    
    try {
      setIsDownloading(true);
      toast.info("Preparing brief for download...");
      
      // Get the full brief data
      const fullBriefData = await fetchFullBriefData(brief);
      
      // Use the new unified PDF generator
      await generateBriefPDF(fullBriefData);
      toast.success(`${brief.type} brief downloaded successfully`);
      
      return true;
    } catch (error) {
      console.error("Error downloading brief:", error);
      toast.error("Failed to download brief. Please try again.");
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading]);

  return { generateBriefPDF, isDownloading };
}
