import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionCardHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

const SectionCardHeader = ({ icon: Icon, title, subtitle, action }: SectionCardHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full" style={{ gap: 8 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        >
          <Icon className="h-4 w-4" style={{ color: "#0080FF" }} strokeWidth={1.67} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              lineHeight: "120%",
              letterSpacing: "-0.03em",
              color: "#020817",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 11,
              lineHeight: "100%",
              letterSpacing: "-0.02em",
              color: "#64748B",
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default SectionCardHeader;
