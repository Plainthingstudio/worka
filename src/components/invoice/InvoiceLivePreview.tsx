import React, { useMemo } from "react";
import { Client, Invoice } from "@/types";
import { generateInvoiceHtml } from "@/utils/pdf/invoiceHtmlGenerator";
import { cn } from "@/lib/utils";

function buildPreviewClient(invoice: Invoice, clients: Client[]) {
  const c = clients.find((x) => x.id === invoice.clientId);
  if (c) {
    return {
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address || "",
    };
  }
  return {
    name: "Select a client",
    phone: "",
    email: "—",
    address: "",
  };
}

interface InvoiceLivePreviewProps {
  invoice: Invoice;
  clients: Client[];
  className?: string;
}

/** Slightly shrinks preview only; PDF output unchanged. */
const PREVIEW_SCALE = 0.9;

const InvoiceLivePreview: React.FC<InvoiceLivePreviewProps> = ({ invoice, clients, className }) => {
  const srcDoc = useMemo(() => {
    const client = buildPreviewClient(invoice, clients);
    const body = generateInvoiceHtml(invoice, client);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
html{height:100%}
html,body{margin:0;padding:0;background:#f4f4f5;box-sizing:border-box}
*,*::before,*::after{box-sizing:inherit}
#preview-scale-wrap{
  width:100%;
  max-width:100%;
  overflow-x:hidden;
  min-height:100%;
  zoom:${PREVIEW_SCALE}
}
#invoice-container{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
</style></head><body><div id="preview-scale-wrap">${body}</div></body></html>`;
  }, [invoice, clients]);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="shrink-0 border-b border-border bg-muted/40 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Invoice preview</h2>
        <p className="text-xs text-muted-foreground">
          Live preview — matches PDF layout as you edit.
        </p>
      </div>
      <div className="relative min-h-0 flex-1 bg-muted/20 p-2">
        <iframe
          title="Invoice preview"
          srcDoc={srcDoc}
          className="absolute inset-0 box-border h-full w-full rounded-md border border-border bg-white shadow-inner"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
};

export default InvoiceLivePreview;
