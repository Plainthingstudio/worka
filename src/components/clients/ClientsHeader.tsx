
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientsHeaderProps {
  onCreateClient?: () => void;
}

const ClientsHeader = ({ onCreateClient }: ClientsHeaderProps) => {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 max-lg:mb-6 max-lg:flex-col">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight max-lg:text-[22px] max-lg:leading-7">
          Clients
        </h1>
        <p className="text-muted-foreground max-lg:max-w-[24rem] max-lg:text-[13px] max-lg:leading-5">
          Manage your client relationships and contact information.
        </p>
      </div>
      {onCreateClient && (
        <Button onClick={onCreateClient} className="whitespace-nowrap max-lg:h-9 max-lg:w-auto max-lg:self-start max-lg:text-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      )}
    </div>
  );
};

export default ClientsHeader;
