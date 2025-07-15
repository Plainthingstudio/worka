
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
      let pdfBlob: Blob;
      
      if (briefType === 'UI Design') {
        pdfBlob = await generateUIDesignBriefPDF(data);
      } else if (briefType === 'Graphic Design') {
        pdfBlob = await generateGraphicDesignBriefPDF(data);
      } else if (briefType === 'Illustration Design') {
        pdfBlob = await generateIllustrationBriefPDF(data);
      } else {
        toast({
          title: "Error",
          description: "Unsupported brief type",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${briefType.replace(' ', '_')}_Brief_${data.name.replace(' ', '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Brief downloaded successfully",
      });

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
