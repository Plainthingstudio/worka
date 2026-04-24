
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/types";
import { useTeamMemberMap } from "@/hooks/useTeamMemberMap";
import ClientItem from "./ClientItem";

interface ClientsTableProps {
  clients: Client[];
  onDelete?: (id: string) => void;
  onInlineUpdate?: (clientId: string, fields: Partial<Client>) => void;
}

const ClientsTable = ({ clients, onDelete, onInlineUpdate }: ClientsTableProps) => {
  const { getMember } = useTeamMemberMap();
  const headerCellStyle = { padding: "8px 16px" };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead style={headerCellStyle}>Name</TableHead>
          <TableHead style={headerCellStyle}>Email</TableHead>
          <TableHead style={headerCellStyle}>Phone Number</TableHead>
          <TableHead style={headerCellStyle}>Lead Source</TableHead>
          <TableHead style={headerCellStyle}>Created By</TableHead>
          <TableHead style={headerCellStyle}>Created</TableHead>
          <TableHead style={{ ...headerCellStyle, width: 48 }} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
              No clients found.
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <ClientItem
              key={client.id}
              client={client}
              creator={getMember(client.createdBy)}
              onDelete={onDelete}
              onInlineUpdate={onInlineUpdate}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
