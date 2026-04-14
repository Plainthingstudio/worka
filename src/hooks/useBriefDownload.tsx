
import { useState } from 'react';
import { databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { toast } from '@/hooks/use-toast';
import { generateUIDesignBriefPDF } from '@/utils/uiDesignBriefPdf';
import { generateGraphicDesignBriefPDF } from '@/utils/graphicDesignBriefPdf';
import { generateIllustrationBriefPDF } from '@/utils/illustrationBriefPdf';

export const useBriefDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadBrief = async (briefId: string, briefType: string) => {
    try {
      setIsDownloading(true);

      // Determine collection based on brief type
      let collectionId = '';
      if (briefType === 'Illustration Design') {
        collectionId = 'illustration_design_briefs';
      } else if (briefType === 'UI Design') {
        collectionId = 'ui_design_briefs';
      } else if (briefType === 'Graphic Design') {
        collectionId = 'graphic_design_briefs';
      }

      if (!collectionId) {
        toast({
          title: "Error",
          description: "Unsupported brief type",
          variant: "destructive",
        });
        return;
      }

      // Fetch the brief details
      const response = await databases.listDocuments(DATABASE_ID, collectionId, [
        Query.equal('$id', briefId)
      ]);
      const data = response.documents[0] ?? null;

      if (!data) {
        toast({
          title: "Error",
          description: "Brief not found",
          variant: "destructive",
        });
        return;
      }

      // Generate PDF based on brief type
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
