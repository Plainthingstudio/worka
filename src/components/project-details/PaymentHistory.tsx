import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, Eye, Pencil, ReceiptText, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { databases, DATABASE_ID } from "@/integrations/appwrite/client";
import { projectDetailsQueryKey } from "@/hooks/useProjectData";
import { Payment, PaymentType, Project } from "@/types";
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

const paymentTypes: PaymentType[] = ["Down Payment", "Milestone Payment", "Final Payment"];

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const PaymentHistory = ({ project }: PaymentHistoryProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editType, setEditType] = useState<PaymentType>("Milestone Payment");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const invoicePayments = project.invoicePayments || [];
  const manualPayments = project.payments || [];
  const canSave = useMemo(() => {
    const parsedAmount = Number(editAmount);
    return Number.isFinite(parsedAmount) && parsedAmount > 0 && Boolean(editDate);
  }, [editAmount, editDate]);

  const historyRows = [
    ...invoicePayments.map((payment) => ({
      id: `invoice-${payment.id}`,
      type: payment.invoiceType,
      reference: payment.invoiceNumber,
      amount: payment.amount,
      date: payment.date,
      source: "invoice" as const,
      invoiceId: payment.id,
    })),
    ...manualPayments.map((payment) => ({
      id: `manual-${payment.id}`,
      type: payment.paymentType,
      reference: payment.notes || "Manual payment",
      amount: payment.amount,
      date: payment.date,
      source: "manual" as const,
      payment,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setEditType(payment.paymentType);
    setEditAmount(String(payment.amount));
    setEditDate(toDateInputValue(payment.date));
    setEditNotes(payment.notes || "");
  };

  const closeEditDialog = () => {
    setEditingPayment(null);
    setEditType("Milestone Payment");
    setEditAmount("");
    setEditDate("");
    setEditNotes("");
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;

    const parsedAmount = Number(editAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (!editDate) {
      toast.error("Select a payment date");
      return;
    }

    setIsSaving(true);
    try {
      await databases.updateDocument(DATABASE_ID, "payments", editingPayment.id, {
        payment_type: editType,
        amount: parsedAmount,
        date: new Date(`${editDate}T00:00:00`).toISOString(),
        notes: editNotes.trim() || null,
      });

      await queryClient.invalidateQueries({ queryKey: projectDetailsQueryKey(project.id) });
      toast.success("Payment updated");
      closeEditDialog();
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error?.message || "Failed to update payment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;

    setIsDeleting(true);
    try {
      await databases.deleteDocument(DATABASE_ID, "payments", deletingPayment.id);
      await queryClient.invalidateQueries({ queryKey: projectDetailsQueryKey(project.id) });
      toast.success("Payment deleted");
      setDeletingPayment(null);
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      toast.error(error?.message || "Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border-soft" style={cardStyle}>
        <SectionCardHeader
          icon={ReceiptText}
          title="Payment History"
          subtitle="Paid invoices and manually recorded payments"
        />
        <div>
          {historyRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No payments yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Mark a linked invoice as paid or record an external payment.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRows
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.type}
                      </TableCell>
                      <TableCell>
                        {payment.reference}
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
                        {payment.source === "invoice" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/invoices/${payment.invoiceId}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Invoice
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(payment.payment)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeletingPayment(payment.payment)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={Boolean(editingPayment)} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Manual Payment</DialogTitle>
            <DialogDescription>
              Update a payment that was recorded outside the invoice flow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-payment-type">Payment type</Label>
              <Select value={editType} onValueChange={(value) => setEditType(value as PaymentType)}>
                <SelectTrigger id="edit-payment-type">
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
              <Label htmlFor="edit-payment-amount">Amount ({project.currency})</Label>
              <Input
                id="edit-payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={editAmount}
                onChange={(event) => setEditAmount(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-payment-date">Payment date</Label>
              <Input
                id="edit-payment-date"
                type="date"
                value={editDate}
                onChange={(event) => setEditDate(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-payment-notes">Notes</Label>
              <Textarea
                id="edit-payment-notes"
                value={editNotes}
                onChange={(event) => setEditNotes(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayment} disabled={isSaving || !canSave}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingPayment)} onOpenChange={(open) => !open && setDeletingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Manual Payment</DialogTitle>
            <DialogDescription>
              This will remove the recorded payment from this project. Linked invoices are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPayment(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePayment} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentHistory;
