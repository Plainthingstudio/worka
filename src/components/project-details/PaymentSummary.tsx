import React, { useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Project, PaymentType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { databases, DATABASE_ID, ID } from "@/integrations/appwrite/client";
import { projectDetailsQueryKey } from "@/hooks/useProjectData";
import SectionCardHeader from "./SectionCardHeader";

interface PaymentSummaryProps {
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

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "20px",
};

const valueStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
};

const paymentTypes: PaymentType[] = ["Down Payment", "Milestone Payment", "Final Payment"];

const getTodayInputValue = () => new Date().toISOString().slice(0, 10);

const PaymentSummary = ({ project }: PaymentSummaryProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("Milestone Payment");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayInputValue);
  const [notes, setNotes] = useState("");

  const invoicePayments = project.invoicePayments || [];
  const manualPayments = project.payments || [];
  const invoicePaidAmount = invoicePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const manualPaidAmount = manualPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = invoicePaidAmount + manualPaidAmount;
  const remaining = Math.max(project.fee - paidAmount, 0);
  const canSave = useMemo(() => {
    const parsedAmount = Number(amount);
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && Boolean(date);
  }, [amount, date]);

  const resetForm = () => {
    setPaymentType("Milestone Payment");
    setAmount("");
    setDate(getTodayInputValue());
    setNotes("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleRecordPayment = async () => {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (!date) {
      toast.error("Select a payment date");
      return;
    }

    setIsSaving(true);
    try {
      const paymentDate = new Date(`${date}T00:00:00`);
      const payload: Record<string, unknown> = {
        project_id: project.id,
        payment_type: paymentType,
        amount: parsedAmount,
        date: paymentDate.toISOString(),
      };

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      await databases.createDocument(DATABASE_ID, "payments", ID.unique(), payload);
      await queryClient.invalidateQueries({ queryKey: projectDetailsQueryKey(project.id) });
      toast.success("Payment recorded");
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast.error(error?.message || "Failed to record payment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border-soft" style={cardStyle}>
        <div className="flex items-start justify-between gap-3">
          <SectionCardHeader
            icon={Wallet}
            title="Payment Summary"
            subtitle="Paid invoices and manually recorded payments"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-[38px] shrink-0 gap-2 bg-card px-3 shadow-[0px_1px_2px_rgba(15,23,42,0.05)] hover:bg-accent"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={rowStyle}>
            <span style={labelStyle}>Total Fee:</span>
            <span style={{ ...valueStyle, fontWeight: 700 }}>
              {project.fee.toLocaleString()} {project.currency}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Paid Amount:</span>
            <span style={valueStyle}>
              {paidAmount.toLocaleString()} {project.currency}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Remaining:</span>
            <span style={valueStyle}>
              {remaining.toLocaleString()} {project.currency}
            </span>
          </div>
          <div className="h-px bg-border-soft w-full" />
          <div style={rowStyle}>
            <span style={labelStyle}>Paid Invoices:</span>
            <span style={valueStyle}>{invoicePayments.length}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Manual Payments:</span>
            <span style={valueStyle}>{manualPayments.length}</span>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Add a payment received outside the in-app invoice flow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="payment-type">Payment type</Label>
              <Select value={paymentType} onValueChange={(value) => setPaymentType(value as PaymentType)}>
                <SelectTrigger id="payment-type">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Amount ({project.currency})</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-date">Payment date</Label>
              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Bank transfer, cash, external invoice number..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={isSaving || !canSave}>
              {isSaving ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentSummary;
