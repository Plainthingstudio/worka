import React from "react";
import { Banknote, Percent } from "lucide-react";
import { Invoice, InvoicePaymentMode, InvoiceType, Project } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { INVOICE_TYPES, getInvoiceType, isPartialInvoiceType } from "@/utils/invoiceTypes";

const PERCENTAGE_PRESETS = [25, 30, 50] as const;

interface InvoicePaymentSettingsProps {
  invoice: Invoice;
  projects: Project[];
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  formatCurrency: (amount: number) => string;
}

const formatMoney = (
  amount: number,
  currency: string | undefined,
  formatCurrency: (amount: number) => string
) => `${currency || "IDR"} ${formatCurrency(amount || 0)}`;

const PAYMENT_MODE_SEGMENTS = [
  { key: "percentage" as const, label: "Percentage", icon: Percent },
  { key: "nominal" as const, label: "Nominal", icon: Banknote },
];

const InvoicePaymentSettings: React.FC<InvoicePaymentSettingsProps> = ({
  invoice,
  projects,
  setInvoice,
  formatCurrency,
}) => {
  const invoiceType = getInvoiceType(invoice);
  const isPartial = isPartialInvoiceType(invoiceType);
  const selectedProject = projects.find((project) => project.id === invoice.projectId);
  const currency = invoice.currency || selectedProject?.currency || "IDR";
  const projectTotal = invoice.projectTotalSnapshot || selectedProject?.fee || 0;
  const alreadyPaid = invoice.alreadyPaidSnapshot || 0;
  const amountDue = invoice.total || 0;
  const remaining = invoice.remainingAmountSnapshot ?? Math.max(projectTotal - alreadyPaid - amountDue, 0);
  const paymentMode = invoice.paymentMode || "percentage";
  const percentage = invoice.paymentPercentage ?? (invoiceType === "Milestone Payment" ? 25 : 50);

  const updateInvoiceType = (nextType: InvoiceType) => {
    setInvoice((prev) => ({
      ...prev,
      invoiceType: nextType,
      paymentType: nextType,
      paymentMode: nextType === "Settlement Invoice" ? "percentage" : prev.paymentMode || "percentage",
      paymentPercentage:
        nextType === "Milestone Payment"
          ? prev.paymentPercentage || 25
          : nextType === "Down Payment"
            ? prev.paymentPercentage || 50
            : prev.paymentPercentage,
    }));
  };

  const updateProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    setInvoice((prev) => ({
      ...prev,
      projectId,
      clientId: project?.clientId || prev.clientId,
      currency: project?.currency || prev.currency,
      projectTotalSnapshot: project?.fee || prev.projectTotalSnapshot || 0,
    }));
  };

  const updateMode = (mode: InvoicePaymentMode) => {
    setInvoice((prev) => ({
      ...prev,
      paymentMode: mode,
    }));
  };

  return (
    <div className="space-y-4 rounded-md border border-border bg-background p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Linked Project</Label>
          <Select value={invoice.projectId || undefined} onValueChange={updateProject}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Invoice Type</Label>
          <Select value={invoiceType} onValueChange={(value) => updateInvoiceType(value as InvoiceType)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select invoice type" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPartial && (
        <div className="space-y-4">
          {invoiceType !== "Settlement Invoice" && (
            <div className="space-y-3">
              <div
                role="tablist"
                aria-label="Payment calculation mode"
                className="inline-flex items-center bg-surface-2 dark:bg-[hsl(222_33%_7%)]"
                style={{ padding: 4, gap: 0, borderRadius: 8 }}
              >
                {PAYMENT_MODE_SEGMENTS.map(({ key, label, icon: Icon }) => {
                  const active = paymentMode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => updateMode(key)}
                      className={`inline-flex items-center text-[14px] font-medium leading-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        active
                          ? "bg-card text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.08)] dark:bg-[hsl(225_31%_11%)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.5)]"
                          : "bg-transparent text-muted-foreground"
                      }`}
                      style={{
                        gap: 4,
                        padding: "4px 12px",
                        height: 32,
                        borderRadius: active ? 8 : 10,
                        fontFamily: "Inter, sans-serif",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMode === "percentage" && (
                <div className="space-y-3 pt-0.5" role="tabpanel">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Payment percentage</Label>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  {(invoiceType === "Down Payment" || invoiceType === "Milestone Payment") && (
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="Common payment percentages"
                    >
                      {PERCENTAGE_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant={percentage === preset ? "default" : "outline"}
                          size="sm"
                          className="h-8 min-w-[3.25rem] px-3"
                          onClick={() =>
                            setInvoice((prev) => ({
                              ...prev,
                              paymentPercentage: preset,
                            }))
                          }
                        >
                          {preset}%
                        </Button>
                      ))}
                    </div>
                  )}
                  <Slider
                    value={[percentage]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) =>
                      setInvoice((prev) => ({
                        ...prev,
                        paymentPercentage: value,
                      }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Preview: {formatMoney(amountDue, currency, formatCurrency)} of{" "}
                    {formatMoney(projectTotal, currency, formatCurrency)}
                  </p>
                </div>
              )}

              {paymentMode === "nominal" && (
                <div className="space-y-1.5 pt-0.5" role="tabpanel">
                  <Label htmlFor="paymentAmount" className="text-muted-foreground">
                    Payment amount
                  </Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    min="0"
                    value={invoice.paymentAmount || ""}
                    onChange={(event) =>
                      setInvoice((prev) => ({
                        ...prev,
                        paymentAmount: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid gap-3 rounded-md bg-muted/40 p-4 md:grid-cols-2">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Project Total</span>
              <span className="font-medium">{formatMoney(projectTotal, currency, formatCurrency)}</span>
            </div>
            {invoiceType !== "Down Payment" && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="font-medium">{formatMoney(alreadyPaid, currency, formatCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {invoiceType === "Down Payment" ? "Down Payment" : "Amount Due"}
              </span>
              <span className="font-medium">{formatMoney(amountDue, currency, formatCurrency)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {invoiceType === "Down Payment" ? "Remaining After Down Payment" : "Remaining Balance"}
              </span>
              <span className="font-medium">{formatMoney(remaining, currency, formatCurrency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePaymentSettings;
