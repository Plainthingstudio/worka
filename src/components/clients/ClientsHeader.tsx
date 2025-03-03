
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientsHeaderProps {
  onAddClient: () => void;
}

const ClientsHeader = ({ onAddClient }: ClientsHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Clients
        </h1>
        <p className="text-muted-foreground">
          Manage and track your client relationships.
        </p>
      </div>
      <Button onClick={onAddClient}>
        <Plus className="mr-2 h-4 w-4" />
        Add Client
      </Button>
    </div>
  );
};

export default ClientsHeader;
