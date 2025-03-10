
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import StepOne from "@/components/brief-form/StepOne";
import StepTwo from "@/components/brief-form/StepTwo";
import StepThree from "@/components/brief-form/StepThree";
import StepFour from "@/components/brief-form/StepFour";
import { supabase } from "@/integrations/supabase/client";

const GraphicDesignBrief = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      
      companyName: "",
      aboutCompany: "",
      visionMission: "",
      slogan: "",
      logoFeelings: {
        style: "",
        pricing: "",  // Will be "Economical" or "Luxury"
        era: "",      // Will be "Modern" or "Classic"
        tone: "",     // Will be "Serious" or "Playful"
        complexity: "", // Will be "Simple" or "Complex"
        gender: ""    // Will be "Feminine" or "Masculine"
      },
      tone: {},
      logoType: "",
      reference1: "",
      reference2: "",
      reference3: "",
      reference4: "",

      targetAge: "",
      targetGender: "",
      targetDemography: "",
      targetProfession: "",
      targetPersonality: "",
      productsServices: "",
      featuresAndBenefits: "",
      marketCategory: "",
      competitor1: "",
      competitor2: "",
      competitor3: "",
      competitor4: "",
      brandPositioning: "",
      barrierToEntry: "",
      specificImagery: "",

      services: {},
      printMedia: {},
      digitalMedia: {}
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
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

    try {
      const services = processCheckboxGroup(data.services || {});
      const printMedia = processCheckboxGroup(data.printMedia || {});
      const digitalMedia = processCheckboxGroup(data.digitalMedia || {});

      // Prepare data for Supabase with correct column names
      const briefData = {
        name: data.name || "",
        email: data.email || "",
        company_name: data.companyName || "",
        type: "Graphic Design",
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
        digital_media: digitalMedia
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('briefs')
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
        digitalMedia: digitalMedia
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <StepTwo
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepThree
            onNext={() => setCurrentStep(4)}
            onPrevious={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <StepFour
            onPrevious={() => setCurrentStep(3)}
            onSubmit={methods.handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Graphic Design Brief</h1>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${
                    step <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <FormProvider {...methods}>
            {renderStep()}
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default GraphicDesignBrief;
