
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

// Define an interface for the data we'll send to Supabase
interface SupabaseBriefData {
  name: string;
  email: string;
  company_name: string;
  about_company: string | null;
  illustrations_purpose: string | null;
  illustrations_for: string | null;
  illustrations_style: string | null;
  target_audience: string | null;
  competitor1: string | null;
  competitor2: string | null;
  competitor3: string | null;
  competitor4: string | null;
  brand_guidelines: string | null;
  reference1: string | null;
  reference2: string | null;
  reference3: string | null;
  reference4: string | null;
  general_style: string | null;
  color_preferences: string | null;
  like_dislike_design: string | null;
  completion_deadline: string | null;
  illustrations_count: number;
  illustration_details: string[];
  deliverables: string[];
  status: string;
  submission_date: string;
  user_id?: string; // Make this optional since it might not always be present
}

export const useIllustrationsBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Extract the 'for' query parameter
  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

  const handleSubmit = async (data: IllustrationBriefFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting form data:", data);
      console.log("For user ID from query param:", forUserId);
      
      // Process the deliverables checkbox group
      const deliverables = Object.entries(data.deliverables || {})
        .filter(([_, checked]) => checked === true)
        .map(([key]) => key);
      
      // Prepare data for Supabase with correct column names
      const briefData: SupabaseBriefData = {
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
        brand_guidelines: data.hasBrandGuidelines === "Yes" ? data.brandGuidelines : null,
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
        deliverables: deliverables,
        status: "New",
        submission_date: new Date().toISOString()
      };
      
      // If query parameter 'for' is present, assign the brief to that user
      if (forUserId) {
        briefData.user_id = forUserId;
        console.log("Assigning brief to user ID:", forUserId);
      } else {
        // If no query parameter, check if the current user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          briefData.user_id = user.id;
          console.log("Assigning brief to current user ID:", user.id);
        } else {
          console.log("No user ID available, brief will be unassigned");
        }
      }
      
      // Insert into Supabase
      const { data: insertedData, error } = await supabase
        .from('illustration_design_briefs')
        .insert(briefData)
        .select('id, user_id')
        .single();
      
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      console.log("Brief inserted successfully:", insertedData);
      
      // Also save to localStorage for backward compatibility
      const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
      const localStorageBrief = {
        ...data,
        id: insertedData?.id || Date.now().toString(),
        submissionDate: new Date().toISOString(),
        status: "New",
        type: "Illustration Design",
        user_id: briefData.user_id // Store the user_id in localStorage as well
      };
      
      localStorage.setItem("briefs", JSON.stringify([...existingBriefs, localStorageBrief]));
      localStorage.setItem("lastSubmittedBriefType", "Illustration Design");
      
      toast.success("Brief submitted successfully!");
      navigate("/thank-you");
    } catch (error: any) {
      console.error("Error submitting brief:", error);
      toast.error(error.message || "Failed to submit brief");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSubmit,
    isSubmitting
  };
};
