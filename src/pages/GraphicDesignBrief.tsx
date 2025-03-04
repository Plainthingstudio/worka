
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import StepOne from "@/components/brief-form/StepOne";
import StepTwo from "@/components/brief-form/StepTwo";
import StepThree from "@/components/brief-form/StepThree";
import StepFour from "@/components/brief-form/StepFour";

const GraphicDesignBrief = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
        pricing: "",
        era: "",
        tone: "",
        complexity: "",
        gender: ""
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

  const onSubmit = (data: any) => {
    const processCheckboxGroup = (group: Record<string, boolean>) => {
      if (!group) return [];
      
      return Object.entries(group)
        .filter(([_, checked]) => checked === true)
        .map(([key]) => key.replace(/_/g, ' '));
    };

    // Get current date and time
    const now = new Date();
    // Store the ISO string directly - we'll format it when displaying
    const submissionDate = now.toISOString();

    const briefData = {
      ...data,
      id: Date.now(),
      submissionDate: submissionDate,
      status: "New",
      type: "Graphic Design",
      name: data.name || "",
      email: data.email || "",
      logoFeelings: {
        style: data.logoFeelings?.style || "",
        pricing: data.logoFeelings?.pricing || "",
        era: data.logoFeelings?.era || "",
        tone: data.logoFeelings?.tone || "",
        complexity: data.logoFeelings?.complexity || "",
        gender: data.logoFeelings?.gender || ""
      },
      tone: processCheckboxGroup(data.tone || {}),
      services: processCheckboxGroup(data.services || {}),
      printMedia: processCheckboxGroup(data.printMedia || {}),
      digitalMedia: processCheckboxGroup(data.digitalMedia || {})
    };

    const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
    
    localStorage.setItem("briefs", JSON.stringify([...existingBriefs, briefData]));
    
    localStorage.setItem("lastSubmittedBriefType", "Graphic Design");

    console.log("Submitted brief data:", briefData);
    toast.success("Brief submitted successfully!");
    navigate("/thank-you");
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
