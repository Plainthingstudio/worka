
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const GraphicDesignBriefSchema = z.object({
  name: z.string(),
  email: z.string(),
  companyName: z.string(),
  aboutCompany: z.string(),
  visionMission: z.string(),
  slogan: z.string(),
  logoFeelings: z.object({
    style: z.string().optional(),
    pricing: z.string().optional(),
    era: z.string().optional(),
    tone: z.string().optional(),
    gender: z.string().optional(),
    complexity: z.string().optional()
  }),
  // Remove tone from the schema since it doesn't exist in the database
  logoType: z.string(),
  reference1: z.string(),
  reference2: z.string(),
  reference3: z.string(),
  reference4: z.string(),
  targetAge: z.string(),
  targetGender: z.string(),
  targetDemography: z.string(),
  targetProfession: z.string(),
  targetPersonality: z.string(),
  productsServices: z.string(),
  featuresAndBenefits: z.string(),
  marketCategory: z.string(),
  competitor1: z.string(),
  competitor2: z.string(),
  competitor3: z.string(),
  competitor4: z.string(),
  brandPositioning: z.string(),
  barrierToEntry: z.string(),
  specificImagery: z.string(),
  services: z.record(z.string(), z.boolean()),
  printMedia: z.record(z.string(), z.boolean()),
  digitalMedia: z.record(z.string(), z.boolean())
});

export type GraphicDesignBriefFormValues = z.infer<typeof GraphicDesignBriefSchema>;

export const useGraphicDesignBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<GraphicDesignBriefFormValues>({
    resolver: zodResolver(GraphicDesignBriefSchema)
  });

  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

  const handleSubmit = async (data: GraphicDesignBriefFormValues) => {
    setIsSubmitting(true);
    console.log("Form data:", data);
    console.log("Designer userId from URL:", forUserId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const effectiveUserId = forUserId || (user ? user.id : null);
      
      console.log("Submitting graphic design brief with user_id:", effectiveUserId);

      const formattedData = {
        name: data.name,
        email: data.email,
        company_name: data.companyName,
        about_company: data.aboutCompany,
        vision_mission: data.visionMission,
        slogan: data.slogan,
        logo_feelings: data.logoFeelings,
        // Remove tone from formattedData
        logo_type: data.logoType,
        reference1: data.reference1,
        reference2: data.reference2,
        reference3: data.reference3,
        reference4: data.reference4,
        target_age: data.targetAge,
        target_gender: data.targetGender,
        target_demography: data.targetDemography,
        target_profession: data.targetProfession,
        target_personality: data.targetPersonality,
        products_services: data.productsServices,
        features_and_benefits: data.featuresAndBenefits,
        market_category: data.marketCategory,
        competitor1: data.competitor1,
        competitor2: data.competitor2,
        competitor3: data.competitor3,
        competitor4: data.competitor4,
        brand_positioning: data.brandPositioning,
        barrier_to_entry: data.barrierToEntry,
        specific_imagery: data.specificImagery,
        services: data.services,
        print_media: data.printMedia,
        digital_media: data.digitalMedia,
        user_id: effectiveUserId,
        submission_date: new Date().toISOString(),
        status: "New"
      };

      const { error } = await supabase.from("graphic_design_briefs").insert(formattedData);

      if (error) {
        console.error("Error submitting graphic design brief:", error);
        toast.error("Failed to submit brief. Please try again.");
        setIsSubmitting(false);
        return;
      }

      try {
        const storedBriefs = localStorage.getItem("briefs");
        const briefs = storedBriefs ? JSON.parse(storedBriefs) : [];
        
        briefs.push({
          ...formattedData,
          id: uuidv4(),
          type: "Graphic Design",
          status: "New"
        });
        
        localStorage.setItem("briefs", JSON.stringify(briefs));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      toast.success("Graphic design brief submitted successfully!");
      navigate("/thank-you");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit
  };
};

export default useGraphicDesignBrief;
