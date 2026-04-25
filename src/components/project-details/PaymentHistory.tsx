import React from "react";
import { format } from "date-fns";
import { DollarSign, CalendarIcon, Pencil, Trash, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment, Project } from "@/types";
import SectionCardHeader from "./SectionCardHeader";

interface PaymentHistoryProps {
  project: Project;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
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

const PaymentHistory = ({
  project,
  onEditPayment,
  onDeletePayment,
}: PaymentHistoryProps) => {
  return (
    <div className="bg-card border border-border-soft" style={cardStyle}>
      <SectionCardHeader
        icon={ReceiptText}
        title="Payment History"
        subtitle="All recorded payments for this project"
      />
      <div>
        {project.payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No payments yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click the "Record Payment" button to record a payment for this project.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.payments
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.paymentType}
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
                    <TableCell className="max-w-[200px] truncate">
                      {payment.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditPayment(payment)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => onDeletePayment(payment)}
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
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
