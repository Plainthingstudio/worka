import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import IllustrationStepOne from "@/components/illustrations-brief-form/IllustrationStepOne";
import IllustrationStepTwo from "@/components/illustrations-brief-form/IllustrationStepTwo";
import IllustrationStepThree from "@/components/illustrations-brief-form/IllustrationStepThree";
import { useIllustrationsBrief, IllustrationBriefFormValues } from "@/hooks/useIllustrationsBrief";
import { toast } from "sonner";

const IllustrationsBrief = () => {
  const [step, setStep] = useState(1);
  const [searchParams] = useSearchParams();
  const forUserId = searchParams.get("u");
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserExists = async () => {
      if (!forUserId) {
        setIsValidUser(true); // No specific user, so form is valid for general submission
        return;
      }

      try {
        const normalizedUserId = forUserId.trim();
        const isValidAppwriteId = normalizedUserId.length > 0 && normalizedUserId.length <= 36;

        if (isValidAppwriteId) {
          setIsValidUser(true);
        } else {
          console.error("Invalid Appwrite user ID");
          setIsValidUser(false);
        }
      } catch (err) {
        console.error("Error verifying user:", err);
        setIsValidUser(false);
      }
    };

    checkUserExists();
  }, [forUserId]);

  const { handleSubmit, isSubmitting } = useIllustrationsBrief(forUserId);

  const methods = useForm<IllustrationBriefFormValues>({
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
      hasBrandGuidelines: "No",
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

  const onSubmit = methods.handleSubmit(handleSubmit);

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
            {step === 3 && <IllustrationStepThree onPrevious={handlePrevious} onSubmit={onSubmit} />}
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

export default IllustrationsBrief;
