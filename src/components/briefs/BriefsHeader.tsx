
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const BriefsHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Client Briefs</h1>
          <p className="text-muted-foreground">Manage and review client brief submissions</p>
        </div>
      </div>
    </div>
  );
};

export default BriefsHeader;
