import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import {
  generateIllustrationBriefPDF,
  generateUIDesignBriefPDF,
  generateGraphicDesignBriefPDF
} from '@/utils/briefPdfGenerator';

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
      try {
        await account.get();
      } catch {
        console.log("User not authenticated, using basic brief data for PDF");
        return brief;
      }

      // Determine collection based on brief type
      const briefType = brief.type;
      let collectionId = '';
      if (briefType === 'Illustration Design' || briefType === 'Illustrations') {
        collectionId = 'illustration_design_briefs';
      } else if (briefType === 'UI Design') {
        collectionId = 'ui_design_briefs';
      } else if (briefType === 'Graphic Design') {
        collectionId = 'graphic_design_briefs';
      }

      if (!collectionId) return brief;

      const response = await databases.listDocuments(DATABASE_ID, collectionId, [
        Query.equal('$id', brief.id)
      ]);
      const data = response.documents[0] ?? null;

      if (data && typeof data === 'object') {
        console.log("Retrieved full brief details for PDF generation:", data);

        // Transform any snake_case to camelCase if needed
        const fullBriefData: BriefData = {
          ...brief,
          ...data
        };

        if (data.company_name) {
          fullBriefData.companyName = data.company_name;
        }

        if (data.submission_date) {
          fullBriefData.submissionDate = data.submission_date;
        }

        if (data.website_type_interest) {
          fullBriefData.websiteTypeInterest = data.website_type_interest;
        }

        // Handle logo feelings correctly for graphic design briefs
        if (brief.type === "Graphic Design" && data.logo_feelings) {
          // If it's an array, keep it as is
          if (Array.isArray(data.logo_feelings)) {
            fullBriefData.logoFeelings = data.logo_feelings;
          }
          // If it's a JSON string, parse it
          else if (typeof data.logo_feelings === 'string') {
            try {
              fullBriefData.logoFeelings = JSON.parse(data.logo_feelings);
            } catch (e) {
              console.error("Error parsing logo_feelings:", e);
            }
          }
        }

        console.log("Full brief data prepared for PDF generation:", fullBriefData);
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
