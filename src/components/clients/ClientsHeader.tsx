
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/hooks/useUserRole";

interface ClientsHeaderProps {
  onCreateClient?: () => void;
  userRole?: UserRole;
}

const ClientsHeader = ({ onCreateClient, userRole }: ClientsHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Clients
        </h1>
        <p className="text-muted-foreground">
          Manage your client relationships and contact information.
        </p>
        {userRole && (
          <p className="text-xs text-muted-foreground mt-1">
            Your role: <span className="capitalize font-medium">{userRole}</span>
          </p>
        )}
      </div>
      {onCreateClient && (
        <Button onClick={onCreateClient} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      )}
    </div>
  );
};

export default ClientsHeader;
