
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Download, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/types";
import { formatDate } from "@/lib/utils";
import DateCell from "@/components/projects/cells/DateCell";
import StatusCell from "@/components/projects/cells/StatusCell";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewClick: (invoiceId: string) => void;
  onDownloadClick: (invoice: Invoice) => void;
  onDeleteClick: (invoiceId: string) => void;
  onEditClick: (invoiceId: string) => void;
  formatCurrency: (amount: number) => string;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  onViewClick,
  onDownloadClick,
  onDeleteClick,
  onEditClick,
  formatCurrency
}) => {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No invoices found. Create your first invoice to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <DateCell date={invoice.date} />
              </TableCell>
              <TableCell>
                <DateCell date={invoice.dueDate} />
              </TableCell>
              <TableCell>{invoice.clientName || "Unknown Client"}</TableCell>
              <TableCell className="text-right">${formatCurrency(invoice.total)}</TableCell>
              <TableCell>
                <StatusCell status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewClick(invoice.id)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditClick(invoice.id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownloadClick(invoice)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(invoice.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoicesTable;
