
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { account, databases, DATABASE_ID, ID } from "@/integrations/appwrite/client";
import { stringifyBriefPayload } from "@/utils/briefPayload";

export interface GraphicDesignBriefFormValues {
  name: string;
  email: string;
  companyName: string;
  aboutCompany: string;
  visionMission: string;
  slogan: string;
  logoFeelings: {
    style?: string;
    pricing: string;
    era: string;
    tone: string;
    gender: string;
    complexity: string;
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

      console.log("Submitting form data:", data);
      console.log("Logo feelings data:", data.logoFeelings);
      console.log("Submitted for user ID:", submittedForId);

      const submissionDate = new Date().toISOString();
      const briefPayload = {
        ...data,
        type: "Graphic Design",
        status: "New",
        logoFeelings: data.logoFeelings || {},
        services,
        printMedia,
        digitalMedia,
        submissionDate,
      };

      const briefData: any = {
        name: data.name || "",
        email: data.email || "",
        company_name: data.companyName || "",
        status: "New",
        brief_payload: stringifyBriefPayload(briefPayload),
        submission_date: submissionDate,
      };

      if (submittedForId) {
        console.log("Setting submitted_for_id:", submittedForId);
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

      await databases.createDocument(DATABASE_ID, 'graphic_design_briefs', ID.unique(), briefData);

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
        userId: briefData.user_id
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
