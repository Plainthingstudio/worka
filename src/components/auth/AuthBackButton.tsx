
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthBackButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      className="absolute left-4 top-4 flex items-center text-muted-foreground"
      onClick={() => navigate("/")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Home
    </Button>
  );
};

export default AuthBackButton;
