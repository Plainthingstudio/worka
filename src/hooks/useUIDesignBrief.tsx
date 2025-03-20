
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export const useUIDesignBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract the 'for' query parameter which contains the designer's user ID
  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Form data:", data);

    try {
      // Get the authenticated user (if any)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine which user ID to use for the brief
      // If the brief is being submitted for a specific designer, use their ID
      // Otherwise use the current authenticated user's ID
      const effectiveUserId = forUserId || (user ? user.id : null);
      
      console.log("Submitting UI design brief with user_id:", effectiveUserId);

      // Map form field names to database column names
      const formattedData = {
        user_id: effectiveUserId,
        name: data.name,
        email: data.email,
        company_name: data.companyName,
        about_company: data.aboutCompany,
        project_description: data.projectDescription,
        project_type: data.projectType,
        project_size: data.projectSize,
        website_type_interest: data.websiteTypeInterest,
        current_website: data.currentWebsite,
        competitor1: data.competitor1,
        competitor2: data.competitor2,
        competitor3: data.competitor3,
        competitor4: data.competitor4,
        target_audience: data.targetAudience,
        website_purpose: data.websitePurpose,
        reference1: data.reference1,
        reference2: data.reference2,
        reference3: data.reference3,
        reference4: data.reference4,
        general_style: data.generalStyle,
        color_preferences: data.colorPreferences,
        font_preferences: data.fontPreferences, 
        existing_brand_assets: data.existingBrandAssets,
        has_brand_guidelines: data.hasBrandGuidelines,
        brand_guidelines_details: data.brandGuidelinesDetails,
        has_wireframe: data.hasWireframe,
        wireframe_details: data.wireframeDetails,
        page_count: Number(data.pageCount || 0),
        page_details: data.pageDetails,
        completion_deadline: data.completionDeadline,
        development_service: data.developmentService,
        website_content: data.websiteContent,
        style_preferences: data.stylePreferences,
        submission_date: new Date().toISOString(),
        status: "New"
      };

      console.log("Formatted data for submission:", formattedData);

      const { error } = await supabase.from("ui_design_briefs").insert(formattedData);

      if (error) {
        console.error("Error submitting UI design brief:", error);
        toast.error(`Failed to submit brief: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Store in localStorage as well
      try {
        const storedBriefs = localStorage.getItem("briefs");
        const briefs = storedBriefs ? JSON.parse(storedBriefs) : [];
        
        briefs.push({
          ...formattedData,
          id: uuidv4(),
          type: "UI Design",
          status: "New"
        });
        
        localStorage.setItem("briefs", JSON.stringify(briefs));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      toast.success("UI design brief submitted successfully!");
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

export default useUIDesignBrief;
