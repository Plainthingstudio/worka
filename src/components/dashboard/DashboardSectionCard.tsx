import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface DashboardSectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}

const DashboardSectionCard = ({
  title,
  description,
  icon: Icon,
  action,
  children,
}: DashboardSectionCardProps) => {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_-24px_rgba(15,23,42,0.45)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
};

export default DashboardSectionCard;
