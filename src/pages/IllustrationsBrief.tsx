
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import IllustrationStepOne from "@/components/illustrations-brief-form/IllustrationStepOne";
import IllustrationStepTwo from "@/components/illustrations-brief-form/IllustrationStepTwo";
import IllustrationStepThree from "@/components/illustrations-brief-form/IllustrationStepThree";

const IllustrationsBrief = () => {
  const [step, setStep] = useState(1);
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
    mode: "onChange", // Add this to make validation more responsive
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

  const handleSubmit = () => {
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

    // Get current date and time
    const now = new Date();
    // Store the ISO string directly - we'll format it when displaying
    const submissionDate = now.toISOString();

    // Get existing briefs from localStorage
    const existingBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
    
    // Add the new brief with submission date and status
    const newBrief = {
      ...formData,
      id: Date.now(),
      submissionDate: submissionDate,
      status: "New",
      deliverables: selectedDeliverables
    };
    
    // Save to localStorage
    localStorage.setItem("briefs", JSON.stringify([...existingBriefs, newBrief]));
    
    // Save the brief type for the thank you page
    localStorage.setItem("lastSubmittedBriefType", "Illustration Design");
    
    // Show success message
    toast.success("Illustration design brief submitted successfully!");
    
    // Navigate to the thank you page
    navigate("/thank-you");
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
