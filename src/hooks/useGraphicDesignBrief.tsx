
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface GraphicDesignBriefFormValues {
  name: string;
  email: string;
  companyName: string;
  aboutCompany: string;
  visionMission: string;
  slogan: string;
  logoFeelings: {
    style?: string;
    pricing: string;  // Will be "Economical" or "Luxury"
    era: string;      // Will be "Modern" or "Classic"
    tone: string;     // Will be "Serious" or "Playful"
    gender: string;   // Will be "Feminine" or "Masculine"
    complexity: string; // Will be "Simple" or "Complex"
  };
  tone: Record<string, boolean>;
  logoType: string;
  reference1: string;
  reference2: string;
  reference3: string;
  reference4: string;
  targetAge: string;
  targetGender: string;
  targetDemography: string;
  targetProfession: string;
  targetPersonality: string;
  productsServices: string;
  featuresAndBenefits: string;
  marketCategory: string;
  competitor1: string;
  competitor2: string;
  competitor3: string;
  competitor4: string;
  brandPositioning: string;
  barrierToEntry: string;
  specificImagery: string;
  services: Record<string, boolean>;
  printMedia: Record<string, boolean>;
  digitalMedia: Record<string, boolean>;
}

export const useGraphicDesignBrief = (submittedForId?: string | null) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processCheckboxGroup = (group: Record<string, boolean>) => {
    if (!group) return [];
    
    return Object.entries(group)
      .filter(([_, checked]) => checked === true)
      .map(([key]) => {
        return key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
  };

  const onSubmit = async (data: GraphicDesignBriefFormValues) => {
    setIsSubmitting(true);
    
    try {
      const services = processCheckboxGroup(data.services || {});
      const printMedia = processCheckboxGroup(data.printMedia || {});
      const digitalMedia = processCheckboxGroup(data.digitalMedia || {});

      // Log the full form data before submission
      console.log("Submitting form data:", data);
      console.log("Logo feelings data:", data.logoFeelings);
      console.log("Submitted for user ID:", submittedForId);

      // Prepare data for Supabase with correct column names
      const briefData: any = {
        name: data.name || "",
        email: data.email || "",
        company_name: data.companyName || "",
        status: "New",
        about_company: data.aboutCompany || "",
        vision_mission: data.visionMission || "",
        slogan: data.slogan || "",
        logo_feelings: data.logoFeelings || {},
        logo_type: data.logoType || "",
        reference1: data.reference1 || "",
        reference2: data.reference2 || "",
        reference3: data.reference3 || "",
        reference4: data.reference4 || "",
        target_age: data.targetAge || "",
        target_gender: data.targetGender || "",
        target_demography: data.targetDemography || "",
        target_profession: data.targetProfession || "",
        target_personality: data.targetPersonality || "",
        products_services: data.productsServices || "",
        features_and_benefits: data.featuresAndBenefits || "",
        market_category: data.marketCategory || "",
        competitor1: data.competitor1 || "",
        competitor2: data.competitor2 || "",
        competitor3: data.competitor3 || "",
        competitor4: data.competitor4 || "",
        brand_positioning: data.brandPositioning || "",
        barrier_to_entry: data.barrierToEntry || "",
        specific_imagery: data.specificImagery || "",
        services: services,
        print_media: printMedia,
        digital_media: digitalMedia,
        submission_date: new Date().toISOString()
      };

      // If form is being submitted for a specific user, add submitted_for_id
      if (submittedForId) {
        console.log("Setting submitted_for_id:", submittedForId);
        briefData.submitted_for_id = submittedForId;
        
        // For briefs submitted through a personalized link, use the submitted_for_id as the user_id
        briefData.user_id = submittedForId;
      } else {
        // Try to get the current user - if logged in, attach user_id (optional)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Setting user_id from current user:", user.id);
          briefData.user_id = user.id;
        }
      }

      console.log("Final brief data being sent to Supabase:", briefData);

      // Insert into Supabase - now using the specific table for graphic design briefs
      const { error } = await supabase
        .from('graphic_design_briefs')
        .insert(briefData);

      if (error) throw error;

      // Also save to localStorage for backward compatibility
      const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
      const localStorageBrief = {
        ...data,
        id: Date.now(),
        submissionDate: new Date().toISOString(),
        status: "New",
        type: "Graphic Design",
        services: services,
        printMedia: printMedia,
        digitalMedia: digitalMedia,
        submittedForId: submittedForId || null,
        userId: briefData.user_id // Ensure we save the user_id in localStorage too
      };
      localStorage.setItem("briefs", JSON.stringify([...existingBriefs, localStorageBrief]));

      localStorage.setItem("lastSubmittedBriefType", "Graphic Design");

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
    onSubmit,
    isSubmitting
  };
};
