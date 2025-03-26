
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateIllustrationBriefPDF, 
  generateUIDesignBriefPDF, 
  generateGraphicDesignBriefPDF 
} from '@/utils/briefPdfGenerator';
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
        // Use type assertion to inform TypeScript about the structure
        const jsonData = data as Record<string, any>;
        
        if (jsonData.company_name) {
          // Type assertion to inform TypeScript that fullBriefData has dynamic properties
          (fullBriefData as Record<string, any>).companyName = jsonData.company_name;
        }
        
        if (jsonData.submission_date) {
          // Type assertion to inform TypeScript that fullBriefData has dynamic properties
          (fullBriefData as Record<string, any>).submissionDate = jsonData.submission_date;
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
      
      // Now generate the PDF with either the full data or original brief data
      if (brief.type === "Illustration Design" || brief.type === "Illustrations") {
        await generateIllustrationBriefPDF(fullBriefData);
        toast.success("Illustration brief downloaded successfully");
      } else if (brief.type === "UI Design") {
        await generateUIDesignBriefPDF(fullBriefData);
        toast.success("UI Design brief downloaded successfully");
      } else if (brief.type === "Graphic Design") {
        await generateGraphicDesignBriefPDF(fullBriefData);
        toast.success("Graphic Design brief downloaded successfully");
      } else {
        toast.error("Download not supported for this brief type");
        return false;
      }
      
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
