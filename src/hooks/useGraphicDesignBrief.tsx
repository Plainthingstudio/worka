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
  tone: z.record(z.string(), z.boolean()),
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

export const useGraphicDesignBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof GraphicDesignBriefSchema>>({
    resolver: zodResolver(GraphicDesignBriefSchema)
  });

  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

  const handleSubmit = async (data: z.infer<typeof GraphicDesignBriefSchema>) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const effectiveUserId = forUserId || (user ? user.id : null);
      
      console.log("Submitting brief with user_id:", effectiveUserId);
      console.log("Form data:", data);

      const { error } = await supabase.from("graphic_design_briefs").insert({
        ...data,
        user_id: effectiveUserId,
        submission_date: new Date().toISOString(),
        id: uuidv4()
      });

      if (error) {
        console.error("Error submitting graphic design brief:", error);
        toast.error("Failed to submit brief. Please try again.");
        return;
      }

      try {
        const storedBriefs = localStorage.getItem("briefs");
        const briefs = storedBriefs ? JSON.parse(storedBriefs) : [];
        
        briefs.push({
          ...data,
          id: uuidv4(),
          type: "Graphic Design",
          user_id: effectiveUserId,
          submission_date: new Date().toISOString(),
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
    handleSubmit: form.handleSubmit(handleSubmit)
  };
};

export default useGraphicDesignBrief;
