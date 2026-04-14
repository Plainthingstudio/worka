
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { account, databases, DATABASE_ID, ID } from "@/integrations/appwrite/client";

export interface IllustrationBriefFormValues {
  type: string;
  name: string;
  email: string;
  phone?: string;
  companyName: string;
  aboutCompany: string;
  illustrationsPurpose: string;
  illustrationsFor: string;
  illustrationsStyle: string;
  targetAudience: string;
  competitor1: string;
  competitor2: string;
  competitor3: string;
  competitor4: string;
  hasBrandGuidelines: string;
  brandGuidelines: string;
  reference1: string;
  reference2: string;
  reference3: string;
  reference4: string;
  generalStyle: string;
  colorPreferences: string;
  likeDislikeDesign: string;
  completionDeadline: string;
  illustrationsCount: number;
  illustrationDetails: string[];
  deliverables: Record<string, boolean>;
}

// Define interface for the data sent to Appwrite
interface BriefDataForAppwrite {
  name: string;
  email: string;
  company_name: string;
  type?: string;
  status: string;
  about_company: string;
  target_audience: string;
  competitor1: string;
  competitor2: string;
  competitor3: string;
  competitor4: string;
  reference1: string;
  reference2: string;
  reference3: string;
  reference4: string;
  general_style: string;
  color_preferences: string;
  brand_guidelines: string;
  completion_deadline: string;
  illustrations_purpose: string;
  illustrations_for: string;
  illustrations_style: string;
  illustrations_count: number;
  illustration_details: string[];
  like_dislike_design: string;
  deliverables: string[];
  submission_date: string;
  user_id?: string;
  phone?: string;
  submitted_for_id?: string;
}

export const useIllustrationsBrief = (submittedForId?: string | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: IllustrationBriefFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedDeliverables = Object.entries(formData.deliverables || {})
        .filter(([_, isSelected]) => isSelected)
        .map(([key, _]) => {
          return key
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/png/i, '.PNG')
            .replace(/pdf/i, '.PDF')
            .replace(/ai/i, '.AI')
            .replace(/svg/i, '.SVG')
            .replace(/mp4/i, '.MP4')
            .replace(/webm/i, '.WebM');
        });

      const brandGuidelinesValue = formData.hasBrandGuidelines === "Yes"
        ? formData.brandGuidelines
        : "No brand guidelines available";

      console.log("Submitting illustration brief for user ID:", submittedForId);

      const briefData: BriefDataForAppwrite = {
        name: formData.name,
        email: formData.email,
        company_name: formData.companyName,
        status: "New",
        about_company: formData.aboutCompany,
        target_audience: formData.targetAudience,
        competitor1: formData.competitor1,
        competitor2: formData.competitor2,
        competitor3: formData.competitor3,
        competitor4: formData.competitor4,
        reference1: formData.reference1,
        reference2: formData.reference2,
        reference3: formData.reference3,
        reference4: formData.reference4,
        general_style: formData.generalStyle,
        color_preferences: formData.colorPreferences,
        brand_guidelines: brandGuidelinesValue,
        completion_deadline: formData.completionDeadline,
        illustrations_purpose: formData.illustrationsPurpose,
        illustrations_for: formData.illustrationsFor,
        illustrations_style: formData.illustrationsStyle,
        illustrations_count: formData.illustrationsCount,
        illustration_details: formData.illustrationDetails,
        like_dislike_design: formData.likeDislikeDesign,
        deliverables: selectedDeliverables,
        submission_date: new Date().toISOString()
      };

      if (formData.phone) {
        briefData.phone = formData.phone;
      }

      if (submittedForId) {
        console.log("Setting submitted_for_id and user_id to:", submittedForId);
        briefData.submitted_for_id = submittedForId;
        briefData.user_id = submittedForId;
      } else {
        try {
          const user = await account.get();
          if (user) {
            console.log("Setting user_id from current user:", user.$id);
            briefData.user_id = user.$id;
          }
        } catch {
          // user not logged in, that's ok for public form
        }
      }

      console.log("Final brief data being sent to Appwrite:", briefData);

      await databases.createDocument(DATABASE_ID, 'illustration_design_briefs', ID.unique(), briefData);

      // Save to localStorage for backward compatibility
      const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
      const localStorageBrief = {
        ...formData,
        id: Date.now(),
        submissionDate: new Date().toISOString(),
        status: "New",
        deliverables: selectedDeliverables,
        submittedForId: submittedForId || null,
        userId: briefData.user_id
      };
      localStorage.setItem("briefs", JSON.stringify([...existingBriefs, localStorageBrief]));

      localStorage.setItem("lastSubmittedBriefType", "Illustration Design");

      toast.success("Illustration design brief submitted successfully!");

      navigate("/thank-you");
    } catch (error: any) {
      console.error("Error submitting brief:", error);
      toast.error(error.message || "Failed to submit brief");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
