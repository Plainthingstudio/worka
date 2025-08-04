
import React from "react";
import { format } from "date-fns";
import { Mail, Phone, Pencil, Trash, MapPin } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types";
import { getLeadSourceBadgeVariant } from "@/components/projects/utils/projectItemUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClientItemProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientItem = ({ client, onEdit, onDelete }: ClientItemProps) => {
  return (
    <TableRow key={client.id}>
      <TableCell className="font-medium">
        <div>
          {client.name}
          {client.address && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{client.address}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{client.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{client.phone}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getLeadSourceBadgeVariant(client.leadSource)}>
          {client.leadSource}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(client.createdAt), "MMM dd, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(client)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Client</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete(client.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Client</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ClientItem;
