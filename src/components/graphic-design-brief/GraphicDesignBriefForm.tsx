
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import StepOne from "@/components/brief-form/StepOne";
import StepTwo from "@/components/brief-form/StepTwo";
import StepThree from "@/components/brief-form/StepThree";
import StepFour from "@/components/brief-form/StepFour";
import { useGraphicDesignBrief, GraphicDesignBriefFormValues } from "@/hooks/useGraphicDesignBrief";

interface GraphicDesignBriefFormProps {
  submittedForId?: string | null;
}

const GraphicDesignBriefForm = ({ submittedForId }: GraphicDesignBriefFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { onSubmit } = useGraphicDesignBrief(submittedForId);
  
  const methods = useForm<GraphicDesignBriefFormValues>({
    defaultValues: {
      name: "",
      email: "",
      
      companyName: "",
      aboutCompany: "",
      visionMission: "",
      slogan: "",
      logoFeelings: {
        pricing: "",      // Will be "Economical" or "Luxury"
        era: "",          // Will be "Modern" or "Classic"
        tone: "",         // Will be "Serious" or "Playful"
        gender: "",       // Will be "Feminine" or "Masculine"
        complexity: ""    // Will be "Simple" or "Complex"
      },
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
  );
};

export default GraphicDesignBriefForm;
