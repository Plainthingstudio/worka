import React from "react";
import { LayoutDashboard, Kanban, LayoutList, Calendar } from "lucide-react";

export type ProjectTab = "overview" | "board" | "list" | "timeline";

interface ProjectTabsProps {
  activeTab: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}

const tabs: {
  key: ProjectTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "board", label: "Board", icon: Kanban },
  { key: "list", label: "List", icon: LayoutList },
  { key: "timeline", label: "Timeline", icon: Calendar },
];

const ProjectTabs = ({ activeTab, onChange }: ProjectTabsProps) => {
  return (
    <div
      className="inline-flex items-center"
      style={{
        padding: 4,
        background: "#F8FAFC",
        borderRadius: 8,
        alignSelf: "flex-start",
        width: "fit-content",
      }}
    >
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="inline-flex items-center transition-all"
            style={{
              gap: 4,
              padding: "4px 12px",
              height: 28,
              borderRadius: active ? 8 : 10,
              background: active ? "#FFFFFF" : "transparent",
              boxShadow: active ? "0px 1px 2px rgba(0,0,0,0.05)" : undefined,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 12,
              lineHeight: "20px",
              color: active ? "#020817" : "#64748B",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ProjectTabs;
