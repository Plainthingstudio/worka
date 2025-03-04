
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/types";
import ClientItem from "./ClientItem";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientsTable = ({ clients, onEdit, onDelete }: ClientsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Lead Source</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No clients found.
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <ClientItem 
              key={client.id}
              client={client}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
