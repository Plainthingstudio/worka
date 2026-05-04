import React from "react";
import { format } from "date-fns";
import { DollarSign, CalendarIcon, Eye, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project } from "@/types";
import SectionCardHeader from "./SectionCardHeader";

interface PaymentHistoryProps {
  project: Project;
}

const cardStyle: React.CSSProperties = {
  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
};

const PaymentHistory = ({ project }: PaymentHistoryProps) => {
  const navigate = useNavigate();
  const invoicePayments = project.invoicePayments || [];

  return (
    <div className="bg-card border border-border-soft" style={cardStyle}>
      <SectionCardHeader
        icon={ReceiptText}
        title="Payment History"
        subtitle="Paid invoices linked to this project"
      />
      <div>
        {invoicePayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No paid invoices yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Mark a linked invoice as paid to reflect it in this project.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Type</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicePayments
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.invoiceType}
                    </TableCell>
                    <TableCell>
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {payment.amount.toLocaleString()} {project.currency}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(new Date(payment.date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/invoices/${payment.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
