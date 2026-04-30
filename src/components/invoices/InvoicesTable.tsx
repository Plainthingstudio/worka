
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, Trash, Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Invoice, PaymentType } from "@/types";
import DateCell from "@/components/projects/cells/DateCell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewClick: (invoiceId: string) => void;
  onDownloadClick: (invoice: Invoice) => void;
  onDeleteClick: (invoiceId: string) => void;
  onEditClick: (invoiceId: string) => void;
  onStatusChange?: (invoiceId: string, newStatus: "Draft" | "Sent" | "Paid" | "Overdue") => void;
  onPaymentTypeChange?: (invoiceId: string, newType: PaymentType) => void;
  formatCurrency: (amount: number) => string;
}
const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  onViewClick,
  onDownloadClick,
  onDeleteClick,
  onEditClick,
  onStatusChange,
  onPaymentTypeChange,
  formatCurrency
}) => {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No invoices found. Create your first invoice to get started.</p>
      </div>
    );
  }
  const handleStatusChange = (invoiceId: string, status: string) => {
    if (onStatusChange) {
      onStatusChange(invoiceId, status as "Draft" | "Sent" | "Paid" | "Overdue");
    }
  };

  const handlePaymentTypeChange = (invoiceId: string, paymentType: string) => {
    if (onPaymentTypeChange) {
      onPaymentTypeChange(invoiceId, paymentType as PaymentType);
    }
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map(invoice => <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <DateCell date={invoice.date} />
              </TableCell>
              <TableCell>
                <DateCell date={invoice.dueDate} />
              </TableCell>
              <TableCell>{invoice.clientName || "Unknown Client"}</TableCell>
              <TableCell>
                {onPaymentTypeChange ? (
                  <Select 
                    defaultValue={invoice.paymentType || "Milestone Payment"} 
                    onValueChange={(value) => handlePaymentTypeChange(invoice.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Down Payment">Down Payment</SelectItem>
                      <SelectItem value="Milestone Payment">Milestone Payment</SelectItem>
                      <SelectItem value="Final Payment">Final Payment</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                    {invoice.paymentType || "Milestone Payment"}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">${formatCurrency(invoice.total)}</TableCell>
              <TableCell>
                {onStatusChange ? <Select defaultValue={invoice.status} onValueChange={value => handleStatusChange(invoice.id, value)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select> : <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoice.status === "Draft" ? "bg-yellow-100 text-yellow-800" : invoice.status === "Sent" ? "bg-blue-100 text-blue-800" : invoice.status === "Paid" ? "bg-green-100 text-green-800" : invoice.status === "Overdue" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                    {invoice.status}
                  </div>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="default" size="sm" onClick={() => onDownloadClick(invoice)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewClick(invoice.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditClick(invoice.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteClick(invoice.id)} className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>
  );
};
export default InvoicesTable;
