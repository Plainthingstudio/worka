
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateIllustrationBriefPDF, 
  generateUIDesignBriefPDF, 
  generateGraphicDesignBriefPDF 
} from '@/utils/briefPdfGenerator';

export function useBriefPdf() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateBriefPDF = useCallback(async (brief: any) => {
    if (isDownloading) return false;
    
    try {
      setIsDownloading(true);
      toast.info("Preparing brief for download...");
      
      // First, try to get the full brief data
      let fullBriefData = brief;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get the full brief data using the database function
        try {
          const { data, error } = await supabase.rpc(
            'get_brief_details',
            { 
              brief_id: brief.id,
              brief_type: brief.type
            }
          );
          
          if (error) {
            console.warn("Could not fetch full brief details for PDF:", error);
          } else if (data) {
            console.log("Retrieved full brief details for PDF generation:", data);
            
            const transformedData: any = data;
            // Transform any snake_case to camelCase if needed
            fullBriefData = {
              ...transformedData,
              type: brief.type,
              companyName: transformedData.company_name,
              submissionDate: transformedData.submission_date
            };
          }
        } catch (fetchError) {
          console.warn("Error fetching brief details for PDF:", fetchError);
        }
      } else {
        console.log("User not authenticated, using basic brief data for PDF");
      }
      
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
