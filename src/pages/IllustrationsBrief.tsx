
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const IllustrationsBrief = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-8 text-center">
          <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Illustrations Brief</h1>
          <p className="text-muted-foreground mb-6">
            We're currently working on this form. Please check back soon or try our UI Design brief form.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row justify-center">
            <Button variant="outline" onClick={() => navigate("/briefs")}>
              Back to Briefs
            </Button>
            <Button onClick={() => navigate("/briefs/ui-design")}>
              Try UI Design Brief
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IllustrationsBrief;
