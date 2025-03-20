
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export interface IllustrationBriefFormValues {
  type: string;
  name: string;
  email: string;
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

export const useIllustrationsBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

  const handleSubmit = async (data: IllustrationBriefFormValues) => {
    setIsSubmitting(true);
    console.log("Form data:", data);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const effectiveUserId = forUserId || (user ? user.id : null);
      
      console.log("Submitting brief with user_id:", effectiveUserId);

      // Map form field names to database column names
      const formattedData = {
        name: data.name,
        email: data.email,
        company_name: data.companyName,
        about_company: data.aboutCompany,
        illustrations_purpose: data.illustrationsPurpose,
        illustrations_for: data.illustrationsFor,
        illustrations_style: data.illustrationsStyle,
        target_audience: data.targetAudience,
        competitor1: data.competitor1,
        competitor2: data.competitor2,
        competitor3: data.competitor3,
        competitor4: data.competitor4,
        has_brand_guidelines: data.hasBrandGuidelines,
        brand_guidelines: data.brandGuidelines,
        reference1: data.reference1,
        reference2: data.reference2,
        reference3: data.reference3,
        reference4: data.reference4,
        general_style: data.generalStyle,
        color_preferences: data.colorPreferences,
        like_dislike_design: data.likeDislikeDesign,
        completion_deadline: data.completionDeadline,
        illustrations_count: data.illustrationsCount,
        illustration_details: data.illustrationDetails,
        deliverables: data.deliverables,
        user_id: effectiveUserId,
        submission_date: new Date().toISOString(),
        status: "New"
      };

      console.log("Formatted data for submission:", formattedData);

      const { error } = await supabase.from("illustration_design_briefs").insert(formattedData);

      if (error) {
        console.error("Error submitting illustration brief:", error);
        toast.error(`Failed to submit brief: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      try {
        const storedBriefs = localStorage.getItem("briefs");
        const briefs = storedBriefs ? JSON.parse(storedBriefs) : [];
        
        briefs.push({
          ...formattedData,
          id: uuidv4(),
          type: "Illustration Design",
          status: "New"
        });
        
        localStorage.setItem("briefs", JSON.stringify(briefs));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      toast.success("Illustration brief submitted successfully!");
      navigate("/thank-you");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
