
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

// Define interface for the data sent to Supabase
interface BriefDataForSupabase {
  name: string;
  email: string;
  company_name: string;
  type: string;
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
  has_brand_guidelines: string;
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
}

export const useIllustrationsBrief = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: IllustrationBriefFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert the deliverables object to an array of selected items
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

      // Check if user is logged in - optional for public form
      const { data: { user } } = await supabase.auth.getUser();

      // Prepare data for Supabase with correct column names
      const briefData: BriefDataForSupabase = {
        name: formData.name,
        email: formData.email,
        company_name: formData.companyName,
        type: "Illustration Design",
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
        has_brand_guidelines: formData.brandGuidelines,
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

      // Add phone if provided
      if (formData.phone) {
        briefData.phone = formData.phone;
      }

      // If user is logged in, add user_id
      if (user) {
        briefData.user_id = user.id;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('briefs')
        .insert(briefData);

      if (error) throw error;

      // Save to localStorage for backward compatibility
      const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
      const localStorageBrief = {
        ...formData,
        id: Date.now(),
        submissionDate: new Date().toISOString(),
        status: "New",
        deliverables: selectedDeliverables
      };
      localStorage.setItem("briefs", JSON.stringify([...existingBriefs, localStorageBrief]));
    
      // Save the brief type for the thank you page
      localStorage.setItem("lastSubmittedBriefType", "Illustration Design");
    
      // Show success message
      toast.success("Illustration design brief submitted successfully!");
    
      // Navigate to the thank you page
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
