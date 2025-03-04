
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();
  const [briefType, setBriefType] = useState<string>("");
  
  useEffect(() => {
    // Get the last submitted brief type from localStorage
    const type = localStorage.getItem("lastSubmittedBriefType") || "Design";
    setBriefType(type);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Thank You!</h1>
          <p className="text-muted-foreground mb-6">
            Your {briefType} brief has been submitted successfully. We'll review your information and get back to you shortly.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/briefs")}
              className="gap-2"
            >
              Create Another Brief
            </Button>
            <Button 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;
