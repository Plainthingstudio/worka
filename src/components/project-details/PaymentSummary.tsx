import React from "react";
import { Wallet } from "lucide-react";
import { Project } from "@/types";
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

const PaymentSummary = ({ project }: PaymentSummaryProps) => {
  const invoicePayments = project.invoicePayments || [];
  const paidAmount = invoicePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = Math.max(project.fee - paidAmount, 0);

  return (
    <div className="bg-card border border-border-soft" style={cardStyle}>
      <SectionCardHeader
        icon={Wallet}
        title="Payment Summary"
        subtitle="Paid invoices linked to this project"
      />
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
      </div>
    </div>
  );
};

export default PaymentSummary;
