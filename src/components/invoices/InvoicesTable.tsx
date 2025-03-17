import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, Trash, Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Invoice } from "@/types";
import DateCell from "@/components/projects/cells/DateCell";
import StatusCell from "@/components/projects/cells/StatusCell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface InvoicesTableProps {
  invoices: Invoice[];
  onViewClick: (invoiceId: string) => void;
  onDownloadClick: (invoice: Invoice) => void;
  onDeleteClick: (invoiceId: string) => void;
  onEditClick: (invoiceId: string) => void;
  onStatusChange?: (invoiceId: string, newStatus: "Draft" | "Sent" | "Paid" | "Overdue") => void;
  formatCurrency: (amount: number) => string;
}
const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  onViewClick,
  onDownloadClick,
  onDeleteClick,
  onEditClick,
  onStatusChange,
  formatCurrency
}) => {
  if (!invoices || invoices.length === 0) {
    return <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No invoices found. Create your first invoice to get started.</p>
      </div>;
  }
  const handleStatusChange = (invoiceId: string, status: string) => {
    if (onStatusChange) {
      onStatusChange(invoiceId, status as "Draft" | "Sent" | "Paid" | "Overdue");
    }
  };
  return <div className="rounded-md border bg-white border shadow-sm">
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
          {invoices.map(invoice => <TableRow key={invoice.id}>
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
    </div>;
};
export default InvoicesTable;