
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import UIStepOne from "@/components/ui-brief-form/UIStepOne";
import UIStepTwo from "@/components/ui-brief-form/UIStepTwo";
import UIStepThree from "@/components/ui-brief-form/UIStepThree";
import { useUIDesignBrief } from "@/hooks/useUIDesignBrief";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UIDesignBrief = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const [designerName, setDesignerName] = useState<string | null>(null);
  const { handleSubmit, isSubmitting } = useUIDesignBrief();
  
  // Extract the 'for' query parameter
  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');
  
  useEffect(() => {
    // If there's a forUserId, try to fetch the user's name
    if (forUserId) {
      const fetchUserInfo = async () => {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', forUserId)
            .single();
            
          if (error) {
            console.error("Error fetching designer info:", error);
            return;
          }
          
          if (profileData) {
            setDesignerName(profileData.full_name);
          }
        } catch (err) {
          console.error("Error in fetchUserInfo:", err);
        }
      };
      
      fetchUserInfo();
    }
  }, [forUserId]);

  // Set up form
  const methods = useForm();

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await methods.trigger([
        "name", 
        "email", 
        "companyName", 
        "aboutCompany"
      ]);
      
      if (isValid) {
        setStep(2);
      } else {
        toast.error("Please fill in all required fields");
      }
    } else if (step === 2) {
      const isValid = await methods.trigger([
        "projectDescription",
        "targetAudience"
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

  const onSubmit = methods.handleSubmit(handleSubmit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {designerName && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md mb-4 text-center">
            You're submitting a brief for <strong>{designerName}</strong>
          </div>
        )}
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
            {step === 3 && <UIStepThree onPrevious={handlePrevious} onSubmit={onSubmit} isSubmitting={isSubmitting} />}
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default UIDesignBrief;
