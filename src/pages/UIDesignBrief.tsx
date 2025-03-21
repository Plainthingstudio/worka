
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import UIStepOne from "@/components/ui-brief-form/UIStepOne";
import UIStepTwo from "@/components/ui-brief-form/UIStepTwo";
import UIStepThree from "@/components/ui-brief-form/UIStepThree";
import { supabase } from "@/integrations/supabase/client";

const UIDesignBrief = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forUserId = searchParams.get("for");
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkUserExists = async () => {
      if (!forUserId) {
        setIsValidUser(true); // No specific user, so form is valid for general submission
        return;
      }

      try {
        // Check if the user ID exists in the profiles table
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", forUserId)
          .single();

        if (error) {
          console.error("Error checking user:", error);
          setIsValidUser(false);
        } else {
          setIsValidUser(!!data);
        }
      } catch (err) {
        console.error("Error verifying user:", err);
        setIsValidUser(false);
      }
    };

    checkUserExists();
  }, [forUserId]);

  const methods = useForm({
    defaultValues: {
      type: "UI Design",
      name: "",
      email: "",
      companyName: "",
      aboutCompany: "",
      targetAudience: "",
      websitePurpose: "",
      projectDescription: "",
      currentWebsite: "",
      projectType: "",
      projectSize: "",
      websiteTypeInterest: {},
      competitor1: "",
      competitor2: "",
      competitor3: "",
      competitor4: "",
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
      pageCount: 1,
      pageDetails: [{ name: "", description: "" }],
      websiteContent: "",
      developmentService: "",
      completionDeadline: "",
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await methods.trigger([
        "name", 
        "email", 
        "companyName", 
        "aboutCompany",
        "projectType",
        "projectSize"
      ]);
      
      if (isValid) {
        setStep(2);
      } else {
        toast.error("Please fill in all required fields");
      }
    } else if (step === 2) {
      const isValid = await methods.trigger([
        "targetAudience", 
        "websitePurpose", 
        "projectDescription",
        "generalStyle"
      ]);
      
      if (isValid) {
        setStep(3);
      } else {
        toast.error("Please fill in all required fields");
      }
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = methods.getValues();
      
      // Process the website type interests
      const websiteTypeInterests = Object.entries(formData.websiteTypeInterest || {})
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => {
          return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        });
      
      console.log("Submitting UI design brief for user ID:", forUserId);
      
      // Prepare data for Supabase with correct column names
      const briefData: any = {
        name: formData.name,
        email: formData.email,
        company_name: formData.companyName,
        status: "New",
        about_company: formData.aboutCompany,
        target_audience: formData.targetAudience,
        website_purpose: formData.websitePurpose,
        project_description: formData.projectDescription,
        current_website: formData.currentWebsite,
        project_type: formData.projectType,
        project_size: formData.projectSize,
        website_type_interest: websiteTypeInterests.length > 0 ? websiteTypeInterests : null,
        competitor1: formData.competitor1,
        competitor2: formData.competitor2,
        competitor3: formData.competitor3,
        competitor4: formData.competitor4,
        reference1: formData.reference1,
        reference2: formData.reference2,
        reference3: formData.reference3,
        reference4: formData.reference4,
        general_style: formData.generalStyle,
        color_preferences: formData.colorPreferences,
        font_preferences: formData.fontPreferences,
        existing_brand_assets: formData.existingBrandAssets,
        has_brand_guidelines: formData.hasBrandGuidelines,
        brand_guidelines_details: formData.brandGuidelinesDetails,
        has_wireframe: formData.hasWireframe,
        wireframe_details: formData.wireframeDetails,
        style_preferences: formData.stylePreferences,
        page_count: formData.pageCount,
        page_details: formData.pageDetails,
        website_content: formData.websiteContent,
        development_service: formData.developmentService,
        completion_deadline: formData.completionDeadline,
        submission_date: new Date().toISOString()
      };

      // Try to get the current user - if logged in, attach user_id (optional)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        briefData.user_id = user.id;
      }
      
      // If form is being submitted for a specific user, add submitted_for_id
      if (forUserId) {
        briefData.submitted_for_id = forUserId;
      }

      // Insert into Supabase - now using the specific table for UI design briefs
      const { error } = await supabase
        .from('ui_design_briefs')
        .insert(briefData);

      if (error) throw error;

      // Also save to localStorage for backward compatibility
      const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
      const localStorageBrief = {
        ...formData,
        id: Date.now(),
        submissionDate: new Date().toISOString(),
        status: "New",
        type: "UI Design",
        submittedForId: forUserId || null
      };
      localStorage.setItem("briefs", JSON.stringify([...existingBriefs, localStorageBrief]));
      
      // Save the brief type for the thank you page
      localStorage.setItem("lastSubmittedBriefType", "UI Design");
      
      // Show success message
      toast.success("UI design brief submitted successfully!");
      
      // Navigate to the thank you page
      navigate("/thank-you");
    } catch (error: any) {
      console.error("Error submitting brief:", error);
      toast.error(error.message || "Failed to submit brief");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidUser === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Invalid Form Link</h2>
          <p className="text-gray-600">
            This form link appears to be invalid or has expired. Please contact the person who shared this link with you.
          </p>
        </div>
      </div>
    );
  }

  if (isValidUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">UI Design Brief</h1>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          
          <FormProvider {...methods}>
            {step === 1 && <UIStepOne onNext={handleNext} />}
            {step === 2 && <UIStepTwo onNext={handleNext} onPrevious={handlePrevious} />}
            {step === 3 && <UIStepThree onPrevious={handlePrevious} onSubmit={handleSubmit} />}
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default UIDesignBrief;
