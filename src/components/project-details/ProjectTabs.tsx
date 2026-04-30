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
      className="inline-flex items-center bg-surface-2 dark:bg-[hsl(222_33%_7%)]"
      style={{
        padding: 4,
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
            className={`inline-flex items-center text-[14px] font-medium leading-5 transition-all ${
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
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ProjectTabs;
