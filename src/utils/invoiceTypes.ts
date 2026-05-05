import { Invoice, InvoiceItem, InvoiceType, PaymentType, Project, ProjectInvoicePayment } from "@/types";
import { v4 as uuidv4 } from "uuid";

type InvoiceDocument = {
  $id?: string;
  $updatedAt?: string;
  invoice_number?: string;
  invoice_type?: string;
  payment_type?: string;
  payment_amount?: number;
  total?: number;
  date?: string;
  status?: string;
};

export const INVOICE_TYPES: InvoiceType[] = [
  "Down Payment",
  "Milestone Payment",
  "Settlement Invoice",
  "Full Invoice",
];

export const PARTIAL_INVOICE_TYPES: InvoiceType[] = [
  "Down Payment",
  "Milestone Payment",
  "Settlement Invoice",
];

export const getInvoiceType = (invoice: Partial<Invoice> | undefined): InvoiceType => {
  if (!invoice) return "Full Invoice";
  return invoice.invoiceType || invoice.paymentType || "Full Invoice";
};

export const isPartialInvoiceType = (invoiceType: InvoiceType) =>
  PARTIAL_INVOICE_TYPES.includes(invoiceType);

/** True if the project already has any saved invoice (any status) with type Down Payment. */
export const projectHasPriorDownPaymentInvoice = (
  invoices: Invoice[],
  projectId: string | undefined,
  excludeInvoiceId?: string
): boolean => {
  if (!projectId) return false;
  return invoices.some(
    (inv) =>
      inv.projectId === projectId &&
      inv.id !== excludeInvoiceId &&
      getInvoiceType(inv) === "Down Payment"
  );
};

/** When creating a new invoice, which types are available based on project payment phase. */
export const getCreatableInvoiceTypesForProject = (hasPriorDownPayment: boolean): {
  enabled: InvoiceType[];
  disabled: InvoiceType[];
} => {
  if (hasPriorDownPayment) {
    return {
      enabled: ["Milestone Payment", "Settlement Invoice"],
      disabled: ["Down Payment", "Full Invoice"],
    };
  }
  return {
    enabled: ["Down Payment", "Full Invoice"],
    disabled: ["Milestone Payment", "Settlement Invoice"],
  };
};

export const toLegacyPaymentType = (invoiceType: InvoiceType): PaymentType => {
  if (invoiceType === "Down Payment" || invoiceType === "Milestone Payment") {
    return invoiceType;
  }

  return "Final Payment";
};

export const invoiceTypeFromDocument = (document: InvoiceDocument): InvoiceType => {
  const invoiceType = document.invoice_type || document.payment_type;
  if (INVOICE_TYPES.includes(invoiceType)) {
    return invoiceType;
  }

  if (invoiceType === "Final Payment") {
    return "Settlement Invoice";
  }

  return "Full Invoice";
};

export const getPaidInvoiceAmount = (invoice: Partial<Invoice> & InvoiceDocument): number => {
  const explicitAmount = Number(invoice.paymentAmount ?? invoice.payment_amount);
  if (Number.isFinite(explicitAmount) && explicitAmount > 0) {
    return explicitAmount;
  }

  return Number(invoice.total) || 0;
};

export const buildPartialInvoiceItem = (
  invoiceType: InvoiceType,
  amount: number,
  existingItem?: InvoiceItem
): InvoiceItem => ({
  id: existingItem?.id || uuidv4(),
  description: invoiceType,
  quantity: 1,
  rate: amount,
  amount,
});

export const getPaidInvoicesForProject = (
  invoices: Invoice[],
  projectId: string,
  excludeInvoiceId?: string
) =>
  invoices.filter((invoice) =>
    invoice.projectId === projectId &&
    invoice.status === "Paid" &&
    invoice.id !== excludeInvoiceId
  );

export const getPaidAmountForProject = (
  invoices: Invoice[],
  projectId: string,
  excludeInvoiceId?: string
) =>
  getPaidInvoicesForProject(invoices, projectId, excludeInvoiceId).reduce(
    (sum, invoice) => sum + getPaidInvoiceAmount(invoice),
    0
  );

export const calculateInvoicePaymentAmount = ({
  invoiceType,
  paymentMode,
  paymentPercentage,
  paymentAmount,
  projectTotal,
  alreadyPaid,
}: {
  invoiceType: InvoiceType;
  paymentMode?: "percentage" | "nominal";
  paymentPercentage?: number;
  paymentAmount?: number;
  projectTotal: number;
  alreadyPaid: number;
}) => {
  const remaining = Math.max(projectTotal - alreadyPaid, 0);

  if (invoiceType === "Settlement Invoice") {
    return remaining;
  }

  const rawAmount =
    paymentMode === "nominal"
      ? Number(paymentAmount) || 0
      : (projectTotal * (Number(paymentPercentage) || 0)) / 100;

  return Math.min(Math.max(rawAmount, 0), remaining);
};

/** Label for the payment principal row (%, nominal, or settlement) in forms / PDF. */
export const getPartialPaymentPrincipalLabel = (invoice: Partial<Invoice>): string => {
  const t = getInvoiceType(invoice as Invoice);
  if (t === "Settlement Invoice") {
    return "Settlement amount";
  }
  const mode = invoice.paymentMode || "percentage";
  if (t === "Down Payment") {
    return mode === "nominal"
      ? "Down payment (nominal)"
      : `Down payment (${Number(invoice.paymentPercentage) || 50}%)`;
  }
  return mode === "nominal"
    ? "Milestone payment (nominal)"
    : `Milestone payment (${Number(invoice.paymentPercentage ?? 25)}%)`;
};

export const mapInvoiceDocumentToProjectPayment = (invoice: InvoiceDocument): ProjectInvoicePayment | null => {
  if (invoice.status !== "Paid") return null;

  return {
    id: invoice.$id || "",
    invoiceNumber: invoice.invoice_number || "",
    invoiceType: invoiceTypeFromDocument(invoice),
    amount: getPaidInvoiceAmount(invoice),
    date: new Date(invoice.$updatedAt || invoice.date || Date.now()),
    status: "Paid",
  };
};

export const getProjectCurrency = (project?: Project | null) => project?.currency || "IDR";
