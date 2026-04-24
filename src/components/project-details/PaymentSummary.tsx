import React from "react";
import { Wallet } from "lucide-react";
import { Project } from "@/types";
import SectionCardHeader from "./SectionCardHeader";

interface PaymentSummaryProps {
  project: Project;
  onAddPayment: () => void;
}

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
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
  color: "#020817",
};

const valueStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  color: "#020817",
};

const PaymentSummary = ({ project, onAddPayment }: PaymentSummaryProps) => {
  const paidAmount = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = project.fee - paidAmount;

  return (
    <div style={cardStyle}>
      <SectionCardHeader
        icon={Wallet}
        title="Payment Summary"
        subtitle="Track all payments for this project"
        action={
          <button
            type="button"
            onClick={onAddPayment}
            className="inline-flex items-center justify-center transition-colors hover:bg-slate-50"
            style={{
              gap: 4,
              padding: "8px 12px",
              height: 36,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0px 1px 2px rgba(15, 23, 42, 0.05)",
              borderRadius: 7,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "20px",
              color: "#020817",
              cursor: "pointer",
            }}
          >
            Record Payment
          </button>
        }
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
        <div style={{ height: 1, background: "#E2E8F0", width: "100%" }} />
        <div style={rowStyle}>
          <span style={labelStyle}>Payment Count:</span>
          <span style={valueStyle}>{project.payments.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
