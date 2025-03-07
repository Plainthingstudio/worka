
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientsHeaderProps {
  onCreateClient: () => void;
}

const ClientsHeader = ({ onCreateClient }: ClientsHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Clients
        </h1>
        <p className="text-muted-foreground">
          Manage your client relationships.
        </p>
      </div>
      <Button onClick={onCreateClient}>
        <Plus className="mr-2 h-4 w-4" />
        Create Client
      </Button>
    </div>
  );
};

export default ClientsHeader;
