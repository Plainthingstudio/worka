
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import IllustrationStepOne from "@/components/illustrations-brief-form/IllustrationStepOne";
import IllustrationStepTwo from "@/components/illustrations-brief-form/IllustrationStepTwo";
import IllustrationStepThree from "@/components/illustrations-brief-form/IllustrationStepThree";
import { supabase } from "@/integrations/supabase/client";

const IllustrationsBrief = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      type: "Illustration Design",
      name: "",
      email: "",
      companyName: "",
      aboutCompany: "",
      illustrationsPurpose: "",
      illustrationsFor: "",
      illustrationsStyle: "",
      targetAudience: "",
      competitor1: "",
      competitor2: "",
      competitor3: "",
      competitor4: "",
      brandGuidelines: "",
      reference1: "",
      reference2: "",
      reference3: "",
      reference4: "",
      generalStyle: "",
      colorPreferences: "",
      likeDislikeDesign: "",
      completionDeadline: "",
      illustrationsCount: 1,
      illustrationDetails: [""],
      deliverables: {},
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
        "illustrationsPurpose"
      ]);
      
      if (isValid) {
        setStep(2);
      } else {
        toast.error("Please fill in all required fields");
      }
    } else if (step === 2) {
      const isValid = await methods.trigger([
        "illustrationsFor", 
        "illustrationsStyle", 
        "targetAudience", 
        "illustrationsCount"
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
      // Convert the deliverables object to an array of selected items
      const formData = methods.getValues();
      const selectedDeliverables = Object.entries(formData.deliverables || {})
        .filter(([_, isSelected]) => isSelected)
        .map(([key, _]) => {
          // Convert back to original format
          return key
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/png/i, '.PNG')
            .replace(/pdf/i, '.PDF')
            .replace(/ai/i, '.AI')
            .replace(/svg/i, '.SVG')
            .replace(/mp4/i, '.MP4')
            .replace(/webm/i, '.WebM');
        });

      // Try to get the current user - if logged in, attach user_id
      const { data: { user } } = await supabase.auth.getUser();

      // Prepare data for Supabase with correct column names
      const briefData: any = {
        name: formData.name,
        email: formData.email,
        company_name: formData.companyName,
        type: "Illustration Design",
        status: "New",
        about_company: formData.aboutCompany,
        target_audience: formData.targetAudience,
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
        has_brand_guidelines: formData.brandGuidelines,
        completion_deadline: formData.completionDeadline,
        // Custom fields for illustrations
        illustrations_purpose: formData.illustrationsPurpose,
        illustrations_for: formData.illustrationsFor,
        illustrations_style: formData.illustrationsStyle,
        illustrations_count: formData.illustrationsCount,
        illustration_details: formData.illustrationDetails,
        like_dislike_design: formData.likeDislikeDesign,
        deliverables: selectedDeliverables,
        submission_date: new Date().toISOString()
      };

      // If user is logged in, add user_id
      if (user) {
        briefData.user_id = user.id;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('briefs')
        .insert(briefData);

      if (error) throw error;

      // Also save to localStorage for backward compatibility
      const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
      const localStorageBrief = {
        ...formData,
        id: Date.now(),
        submissionDate: new Date().toISOString(),
        status: "New",
        deliverables: selectedDeliverables
      };
      localStorage.setItem("briefs", JSON.stringify([...existingBriefs, localStorageBrief]));
    
      // Save the brief type for the thank you page
      localStorage.setItem("lastSubmittedBriefType", "Illustration Design");
    
      // Show success message
      toast.success("Illustration design brief submitted successfully!");
    
      // Navigate to the thank you page
      navigate("/thank-you");
    } catch (error: any) {
      console.error("Error submitting brief:", error);
      toast.error(error.message || "Failed to submit brief");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Illustration Design Brief</h1>
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
            {step === 1 && <IllustrationStepOne onNext={handleNext} />}
            {step === 2 && <IllustrationStepTwo onNext={handleNext} onPrevious={handlePrevious} />}
            {step === 3 && <IllustrationStepThree onPrevious={handlePrevious} onSubmit={handleSubmit} />}
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default IllustrationsBrief;
