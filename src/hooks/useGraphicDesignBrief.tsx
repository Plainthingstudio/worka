
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

interface GraphicDesignBriefData {
  name: string;
  email: string;
  company_name: string;
  status: string;
  about_company: string;
  vision_mission: string;
  slogan: string;
  logo_feelings: any;
  logo_type: string;
  reference1: string;
  reference2: string;
  reference3: string;
  reference4: string;
  target_age: string;
  target_gender: string;
  target_demography: string;
  target_profession: string;
  target_personality: string;
  products_services: string;
  features_and_benefits: string;
  market_category: string;
  competitor1: string;
  competitor2: string;
  competitor3: string;
  competitor4: string;
  brand_positioning: string;
  barrier_to_entry: string;
  specific_imagery: string;
  services: string[];
  print_media: string[];
  digital_media: string[];
  submission_date: string;
  user_id?: string;
}

export const useGraphicDesignBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract the 'for' query parameter
  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

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
      console.log("For user ID from query param:", forUserId);

      // Prepare data for Supabase with correct column names
      const briefData: GraphicDesignBriefData = {
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

      // Insert into Supabase - now using the specific table for graphic design briefs
      const { data: insertedData, error } = await supabase
        .from('graphic_design_briefs')
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
        type: "Graphic Design",
        services: services,
        printMedia: printMedia,
        digitalMedia: digitalMedia,
        user_id: briefData.user_id // Store the user_id in localStorage as well
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
