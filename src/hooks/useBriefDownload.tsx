
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generateUIDesignBriefPDF } from '@/utils/uiDesignBriefPdf';
import { generateGraphicDesignBriefPDF } from '@/utils/graphicDesignBriefPdf';
import { generateIllustrationBriefPDF } from '@/utils/illustrationBriefPdf';

export const useBriefDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadBrief = async (briefId: string, briefType: string) => {
    try {
      setIsDownloading(true);
      
      // Fetch the brief details
      const { data, error } = await supabase.rpc('get_brief_details', {
        brief_id: briefId,
        brief_type: briefType
      });

      if (error) {
        console.error('Error fetching brief details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch brief details",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "Brief not found",
          variant: "destructive",
        });
        return;
      }

      // Generate PDF based on brief type
      let pdfBlob: Blob | null = null;
      
      try {
        if (briefType === 'UI Design') {
          await generateUIDesignBriefPDF(data);
          // The function handles the download internally, so we don't need to return a blob
          toast({
            title: "Success",
            description: "Brief downloaded successfully",
          });
          return;
        } else if (briefType === 'Graphic Design') {
          const result = await generateGraphicDesignBriefPDF(data);
          if (result === true) {
            // The function handles the download internally
            toast({
              title: "Success", 
              description: "Brief downloaded successfully",
            });
            return;
          } else {
            throw new Error('Failed to generate Graphic Design PDF');
          }
        } else if (briefType === 'Illustration Design') {
          await generateIllustrationBriefPDF(data);
          // The function handles the download internally, so we don't need to return a blob
          toast({
            title: "Success",
            description: "Brief downloaded successfully",
          });
          return;
        } else {
          toast({
            title: "Error",
            description: "Unsupported brief type",
            variant: "destructive",
          });
          return;
        }
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        toast({
          title: "Error",
          description: "Failed to generate PDF",
          variant: "destructive",
        });
        return;
      }

    } catch (error) {
      console.error('Error downloading brief:', error);
      toast({
        title: "Error",
        description: "Failed to download brief",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    downloadBrief,
  };
};
