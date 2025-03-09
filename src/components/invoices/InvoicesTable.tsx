
import React from "react";
import { format } from "date-fns";
import { Eye, Trash, Download, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Invoice } from "@/types";

interface InvoicesTableProps {
  invoices: Invoice[];
  getClientName: (clientId: string) => string;
  onView: (invoiceId: string) => void;
  onEdit: (invoiceId: string) => void; // Keeping for type compatibility but won't use
  onDelete: (invoiceId: string) => void;
  onDownload: (invoice: Invoice) => void;
}

const InvoicesTable = ({
  invoices,
  getClientName,
  onView,
  onDelete,
  onDownload,
}: InvoicesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>{getClientName(invoice.clientId)}</TableCell>
              <TableCell>
                {format(new Date(invoice.date), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                ${invoice.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onDownload(invoice)}
                  title="Download PDF"
                  className="h-9 px-4"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      title="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onView(invoice.id)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {/* Removed Edit option */}
                    <DropdownMenuItem 
                      onClick={() => onDelete(invoice.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-muted-foreground"
            >
              No invoices found. Create your first invoice to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InvoicesTable;
