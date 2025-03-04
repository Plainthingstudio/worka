
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import UIStepOne from "@/components/ui-brief-form/UIStepOne";
import UIStepTwo from "@/components/ui-brief-form/UIStepTwo";
import UIStepThree from "@/components/ui-brief-form/UIStepThree";

const UIDesignBrief = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const methods = useForm({
    defaultValues: {
      // User contact information
      name: "",
      email: "",
      
      // Step One defaults
      companyName: "",
      aboutCompany: "",
      projectType: "",
      projectSize: "",
      websiteTypeInterest: {
        agency: false,
        portfolio: false,
        finance: false,
        saas: false,
        ecommerce: false,
        web3: false,
        crypto: false,
        webapp: false,
        desktopapp: false,
        mobileapp: false,
        other: false
      },
      currentWebsite: "",
      competitor1: "",
      competitor2: "",
      competitor3: "",
      competitor4: "",
      
      // Step Two defaults
      targetAudience: "",
      websitePurpose: "",
      projectDescription: "",
      // Removed keyFeatures
      reference1: "",
      reference2: "",
      reference3: "",
      reference4: "",
      generalStyle: "",
      colorPreferences: "",
      fontPreferences: "",
      existingBrandAssets: "",
      hasBrandGuidelines: "",
      brandGuidelinesDetails: "",
      hasWireframe: "",
      wireframeDetails: "",
      stylePreferences: "",
      // Removed responsiveRequirements
      
      // Step Three defaults
      pageCount: 1,
      pageDetails: [],
      websiteContent: "",
      developmentService: "",
      completionDeadline: ""
    }
  });

  const onSubmit = (data: any) => {
    // Process checkbox group
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
      type: "UI Design", // Mark this as a UI design brief
      // Ensure the name and email are included
      name: data.name || "",
      email: data.email || "",
      // Process checkbox groups
      websiteTypeInterest: processCheckboxGroup(data.websiteTypeInterest || {})
    };

    // Get existing briefs
    const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
    
    // Add new brief
    localStorage.setItem("briefs", JSON.stringify([...existingBriefs, briefData]));
    
    // Store last submitted brief type
    localStorage.setItem("lastSubmittedBriefType", "UI Design");

    console.log("Submitted UI brief data:", briefData);
    toast.success("UI Design Brief submitted successfully!");
    navigate("/thank-you");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UIStepOne
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <UIStepTwo
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <UIStepThree
            onPrevious={() => setCurrentStep(2)}
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
            <h1 className="text-2xl font-semibold mb-2">UI Design Brief</h1>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
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

export default UIDesignBrief;
