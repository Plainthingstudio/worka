import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ListChecks,
  CheckSquare,
  UserRound,
  FileText,
  FileEdit,
  BarChart,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowRight,
  Bell,
  Search,
  Filter,
  Calendar,
  Flag,
  Circle,
  CheckCircle,
  MoreHorizontal,
  Kanban,
  LayoutList,
  Briefcase,
  DollarSign,
  Activity,
} from "lucide-react";
import Logo from "@/components/Logo";
import StatCard from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ────────────────────────────────────────────────────────────
   Building blocks
   ──────────────────────────────────────────────────────────── */

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="mb-14">
    <div className="mb-5 pb-3 border-b border-slate-200">
      <h2 className="text-[18px] font-semibold tracking-tight text-[#020817]">{title}</h2>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
    {children}
  </section>
);

const Subsection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{title}</h3>
    {children}
  </div>
);

const Swatch = ({ name, hex, className }: { name: string; hex: string; className?: string }) => (
  <div className="flex flex-col gap-1.5 min-w-[110px]">
    <div
      className="h-14 rounded-lg border border-slate-200"
      style={className ? undefined : { background: hex }}
    />
    <div>
      <div className="text-xs font-medium text-[#020817]">{name}</div>
      <div className="text-[10px] text-slate-500 font-mono">{hex}</div>
    </div>
  </div>
);

const Spec = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="text-slate-500 min-w-[90px]">{label}</span>
    <code className="text-[#020817] bg-slate-100 px-1.5 py-0.5 rounded font-mono">{value}</code>
  </div>
);

/* ────────────────────────────────────────────────────────────
   Pre-built styled elements (mirroring app components)
   ──────────────────────────────────────────────────────────── */

const PrimaryGradientButton = ({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<any> }) => (
  <button
    className="inline-flex items-center justify-center"
    style={{
      gap: 8,
      padding: "8px 12px",
      height: 36,
      background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #3762FB",
      boxShadow: "0px 1px 2px rgba(14,18,27,0.239216), 0px 0px 0px 1px #3762FB",
      borderRadius: 7,
      color: "#F8FAFC",
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: 14,
    }}
  >
    {Icon && <Icon style={{ width: 16, height: 16, color: "#F8FAFC" }} strokeWidth={1.67} />}
    {children}
  </button>
);

const PillBadge = ({ bg, fg, ring, label }: { bg: string; fg: string; ring: string; label: string }) => (
  <span
    className="inline-flex items-center"
    style={{
      padding: "4px 8px",
      background: bg,
      boxShadow: `inset 0px 0px 0px 1px ${ring}`,
      borderRadius: 10,
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: 12,
      lineHeight: "16px",
      color: fg,
    }}
  >
    {label}
  </span>
);

const NavItem = ({ icon: Icon, label, active }: { icon: React.ComponentType<any>; label: string; active?: boolean }) => (
  <div
    className="flex items-center"
    style={{
      gap: 8,
      padding: "8px 12px",
      height: active ? 38 : 36,
      borderRadius: active ? 8 : 7,
      background: active ? "#FFFFFF" : "transparent",
      border: active ? "1px solid #E4EAF1" : undefined,
      boxShadow: active ? "0px 1px 2px rgba(10,13,20,0.0314)" : undefined,
    }}
  >
    <Icon style={{ width: 16, height: 16, color: active ? "#0080FF" : "#384351" }} strokeWidth={1.67} />
    <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, letterSpacing: "-0.03em", color: active ? "#121A2D" : "#384351" }}>
      {label}
    </span>
  </div>
);

const TabPill = ({ active, icon: Icon, label }: { active?: boolean; icon: React.ComponentType<any>; label: string }) => (
  <button
    type="button"
    className={
      "inline-flex items-center text-[14px] font-medium leading-5 transition-all " +
      (active
        ? "bg-card text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.08)] dark:bg-[hsl(225_31%_11%)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.5)]"
        : "bg-transparent text-muted-foreground")
    }
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
    {label}
  </button>
);

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

export default function DesignSystem() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-6xl mx-auto p-10">
        {/* Hero */}
        <div className="mb-12 flex items-center gap-4">
          <Logo size={56} />
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#020817]">Worka — Design System</h1>
            <p className="text-slate-500 mt-1">Design tokens, components & patterns used throughout the application.</p>
          </div>
        </div>

        {/* ─── FOUNDATIONS ─────────────────────────────────────── */}
        <Section title="Color Tokens" description="Primary palette and semantic colors.">
          <Subsection title="Brand & Primary">
            <div className="flex flex-wrap gap-4">
              <Swatch name="Primary" hex="#0080FF" />
              <Swatch name="Primary Gradient Top" hex="#2D5BFF" />
              <Swatch name="Primary Gradient Bottom" hex="#3762FA" />
              <Swatch name="Primary 900" hex="#1D3485" />
              <Swatch name="Brand Subtitle" hex="#77706A" />
            </div>
          </Subsection>

          <Subsection title="Surface">
            <div className="flex flex-wrap gap-4">
              <Swatch name="Background" hex="#F8FAFC" />
              <Swatch name="Card" hex="#FFFFFF" />
              <Swatch name="Muted / Table Head" hex="#F8FAFC" />
              <Swatch name="Border Light" hex="#E4EAF1" />
              <Swatch name="Border" hex="#E2E8F0" />
            </div>
          </Subsection>

          <Subsection title="Text">
            <div className="flex flex-wrap gap-4">
              <Swatch name="Text Primary" hex="#020817" />
              <Swatch name="Text Secondary" hex="#0B0B0B" />
              <Swatch name="Text Muted" hex="#64748B" />
              <Swatch name="Nav Inactive" hex="#384351" />
              <Swatch name="Nav Active Text" hex="#121A2D" />
              <Swatch name="Logout" hex="#3F3F46" />
            </div>
          </Subsection>

          <Subsection title="Status">
            <div className="flex flex-wrap gap-4">
              <Swatch name="Due Today" hex="#DC2626" />
              <Swatch name="Due Tomorrow" hex="#EA580C" />
              <Swatch name="Warning" hex="#CA8A04" />
              <Swatch name="Success" hex="#22C55E" />
              <Swatch name="Info" hex="#2563EB" />
            </div>
          </Subsection>
        </Section>

        <Section title="Typography" description="Inter across the board. Each row mirrors a specific role used in the app.">
          {(() => {
            const rows: { name: string; usage: string; spec: string; sample: string; style: React.CSSProperties }[] = [
              {
                name: "Page Title / H1",
                usage: "Dashboard Overview · Tasks · Clients · any page heading.",
                spec: "Inter 600 · 24 / 32 · -0.03em · #020817",
                sample: "Dashboard Overview",
                style: { fontWeight: 600, fontSize: 24, lineHeight: "32px", letterSpacing: "-0.03em", color: "#020817" },
              },
              {
                name: "Page Subtitle",
                usage: "Supporting line below page title (Tasks page).",
                spec: "Inter 400 · 16 / 24 · #64748B",
                sample: "List of task for all team members",
                style: { fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "#64748B" },
              },
              {
                name: "Navbar Title",
                usage: "Top bar — current page name.",
                spec: "Inter 500 · 18 / 135% · -0.03em · #0B0B0B",
                sample: "Dashboard",
                style: { fontWeight: 500, fontSize: 18, lineHeight: "135%", letterSpacing: "-0.03em", color: "#0B0B0B" },
              },
              {
                name: "Card Title / H3",
                usage: "Inside cards — Upcoming Deadlines, Recent Clients, etc.",
                spec: "Inter 600 · 14 · 120% · -0.03em · #020817",
                sample: "Upcoming Deadlines",
                style: { fontWeight: 600, fontSize: 14, lineHeight: "120%", letterSpacing: "-0.03em", color: "#020817" },
              },
              {
                name: "Stat Value",
                usage: "Big number in stat card.",
                spec: "Inter 700 · 24 / 32 · #020817",
                sample: "$1,500",
                style: { fontWeight: 700, fontSize: 24, lineHeight: "32px", color: "#020817" },
              },
              {
                name: "Stat Label",
                usage: "Title above stat value.",
                spec: "Inter 500 · 14 / 20 · #64748B",
                sample: "Total Earnings",
                style: { fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#64748B" },
              },
              {
                name: "Overline / Column Header",
                usage: "ClickUp task list column labels, small uppercase markers.",
                spec: "Inter 400 · 12 / 16 · tracking 0.6px · #64748B",
                sample: "Task",
                style: { fontWeight: 400, fontSize: 12, lineHeight: "16px", letterSpacing: "0.6px", color: "#64748B" },
              },
              {
                name: "Table Header",
                usage: "Table column heading (th).",
                spec: "Inter 500 · 14 / 20 · #64748B",
                sample: "Name",
                style: { fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#64748B" },
              },
              {
                name: "Body Strong",
                usage: "Primary cell content — row titles, project names.",
                spec: "Inter 500 · 14 / 20 · #020817",
                sample: "Website Redesign",
                style: { fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#020817" },
              },
              {
                name: "Body",
                usage: "Default body text in cells & paragraphs.",
                spec: "Inter 400 · 14 / 20 · #020817",
                sample: "agumsatriaiii@gmail.com",
                style: { fontWeight: 400, fontSize: 14, lineHeight: "20px", color: "#020817" },
              },
              {
                name: "Body Muted",
                usage: "Secondary info, captions, timestamps.",
                spec: "Inter 400 · 14 / 20 · #64748B",
                sample: "Apr 22, 2026",
                style: { fontWeight: 400, fontSize: 14, lineHeight: "20px", color: "#64748B" },
              },
              {
                name: "Brand Name (sidebar)",
                usage: "'Worka' in sidebar header.",
                spec: "Inter 500 · 14 · -0.02em · #1D3485",
                sample: "Worka",
                style: { fontWeight: 500, fontSize: 14, letterSpacing: "-0.02em", color: "#1D3485" },
              },
              {
                name: "Brand Subtitle (sidebar)",
                usage: "Small line under brand name.",
                spec: "Inter 500 · 12 / 16 · -0.03em · #77706A",
                sample: "Plainthing Studio",
                style: { fontWeight: 500, fontSize: 12, lineHeight: "16px", letterSpacing: "-0.03em", color: "#77706A" },
              },
              {
                name: "Nav Item",
                usage: "Sidebar menu item label.",
                spec: "Inter 500 · 14 / 135% · -0.03em · #384351 (or #121A2D active)",
                sample: "Dashboard",
                style: { fontWeight: 500, fontSize: 14, lineHeight: "135%", letterSpacing: "-0.03em", color: "#384351" },
              },
              {
                name: "Badge / Caption",
                usage: "All pill badges, small status labels.",
                spec: "Inter 500 · 12 / 16",
                sample: "Kickoff",
                style: { fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#15803D" },
              },
              {
                name: "Motivational (sidebar card)",
                usage: "'Kurangi sambat, ayo semangat!' card.",
                spec: "Inter 500 · 20 / 28 · #FFFFFF",
                sample: "Kurangi sambat,",
                style: { fontWeight: 500, fontSize: 20, lineHeight: "28px", color: "#FFFFFF", background: "#3D67FB", padding: "2px 10px", borderRadius: 4, display: "inline-block" },
              },
            ];
            return (
              <div className="space-y-4">
                {rows.map((r) => (
                  <div key={r.name} className="grid grid-cols-[220px_1fr_260px] items-baseline gap-6 border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-[13px] font-semibold text-[#020817]">{r.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.usage}</div>
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", ...r.style }}>{r.sample}</p>
                    <code className="text-[11px] text-slate-500 font-mono">{r.spec}</code>
                  </div>
                ))}
              </div>
            );
          })()}
        </Section>

        <Section title="Radius & Shadows">
          <Subsection title="Border Radius">
            <div className="flex flex-wrap items-end gap-6">
              {[
                { label: "6", value: 6 },
                { label: "7", value: 7 },
                { label: "8", value: 8 },
                { label: "10", value: 10 },
                { label: "12", value: 12 },
                { label: "20", value: 20 },
                { label: "9999", value: 9999 },
              ].map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div style={{ width: 56, height: 56, background: "#0080FF", borderRadius: r.value }} />
                  <span className="text-xs text-slate-500 font-mono">{r.label}</span>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Shadows">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col gap-2">
                <div className="w-40 h-16 bg-white rounded-lg" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} />
                <span className="text-xs text-slate-500 font-mono">card</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-40 h-16 bg-white rounded-lg" style={{ boxShadow: "0px 1px 2px rgba(10,13,20,0.0314)" }} />
                <span className="text-xs text-slate-500 font-mono">sidebar card</span>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className="w-40 h-16 rounded-lg"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #3762FB",
                    boxShadow: "0px 1px 2px rgba(14,18,27,0.239216), 0px 0px 0px 1px #3762FB",
                  }}
                />
                <span className="text-xs text-slate-500 font-mono">primary button</span>
              </div>
            </div>
          </Subsection>
        </Section>

        {/* ─── BRAND ─────────────────────────────────────────── */}
        <Section title="Logo">
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Logo size={32} />
              <span className="text-xs text-slate-500 font-mono">32</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Logo size={40} />
              <span className="text-xs text-slate-500 font-mono">40 · sidebar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Logo size={56} />
              <span className="text-xs text-slate-500 font-mono">56</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Logo size={72} />
              <span className="text-xs text-slate-500 font-mono">72</span>
            </div>
          </div>
        </Section>

        {/* ─── BUTTONS ───────────────────────────────────────── */}
        <Section title="Buttons">
          <Subsection title="Primary (gradient)">
            <div className="flex flex-wrap gap-3 items-center">
              <PrimaryGradientButton icon={Plus}>Create</PrimaryGradientButton>
              <PrimaryGradientButton icon={Plus}>Add Task</PrimaryGradientButton>
              <PrimaryGradientButton>Save Changes</PrimaryGradientButton>
            </div>
            <div className="mt-3 space-y-1">
              <Spec label="Background" value="linear-gradient(180°, rgba(255,255,255,0.12), rgba(255,255,255,0)), #3762FB" />
              <Spec label="Shadow" value="0 1 2 rgba(14,18,27,.24), 0 0 0 1px #3762FB" />
              <Spec label="Radius" value="7px" />
              <Spec label="Text" value="Inter 500 · 14 · #F8FAFC" />
            </div>
          </Subsection>

          <Subsection title="Shadcn variants">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </Subsection>

          <Subsection title="View All (ghost link)">
            <button className="inline-flex items-center transition-opacity hover:opacity-80" style={{ gap: 17, padding: "8px 11px", height: 33, borderRadius: 10 }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, lineHeight: "120%", letterSpacing: "-0.03em", color: "#020817" }}>
                View All
              </span>
              <ArrowRight style={{ width: 12, height: 12, color: "#020817" }} strokeWidth={1.67} />
            </button>
          </Subsection>

          <Subsection title="Pill tab group (Board / List / Timeline)">
            <div
              className="inline-flex items-center bg-surface-2 dark:bg-[hsl(222_33%_7%)]"
              style={{ padding: 4, borderRadius: 8 }}
            >
              <TabPill active icon={LayoutList} label="List" />
              <TabPill icon={Kanban} label="Board" />
              <TabPill icon={Calendar} label="Timeline" />
            </div>
          </Subsection>

          <Subsection title="Icon buttons">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center justify-center"
                style={{ width: 24, height: 24, background: "#FFFFFF", border: "1px solid #E4EAF1", boxShadow: "0px 1px 2px rgba(10,13,20,0.0314)", borderRadius: 6 }}
              >
                <ChevronLeft style={{ width: 16, height: 16, color: "#64748B" }} strokeWidth={1.67} />
              </button>
              <button
                className="flex items-center justify-center hover:bg-slate-100"
                style={{ width: 32, height: 32, borderRadius: 7 }}
              >
                <MoreHorizontal style={{ width: 16, height: 16, color: "#020817" }} strokeWidth={1.67} />
              </button>
              <button className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 10 }}>
                <Bell style={{ width: 16, height: 16, color: "#020817" }} strokeWidth={1.67} />
              </button>
            </div>
          </Subsection>
        </Section>

        {/* ─── BADGES ─────────────────────────────────────────── */}
        <Section title="Badges">
          <Subsection title="Task status (dashboard deadline, task list status)">
            <div className="flex flex-wrap gap-3">
              <PillBadge label="Planning" bg="#F9FAFB" fg="#374151" ring="rgba(75,85,99,0.2)" />
              <PillBadge label="In progress" bg="#DBEAFE" fg="#1D4ED8" ring="rgba(29,78,216,0.2)" />
              <PillBadge label="Paused" bg="#FEF9C3" fg="#854D0E" ring="rgba(133,77,14,0.2)" />
              <PillBadge label="Completed" bg="#DCFCE7" fg="#166534" ring="rgba(22,101,52,0.2)" />
              <PillBadge label="Cancelled" bg="#FEE2E2" fg="#B91C1C" ring="rgba(185,28,28,0.2)" />
              <PillBadge label="Task" bg="#EFF6FF" fg="#020817" ring="rgba(29,78,216,0.1)" />
            </div>
          </Subsection>

          <Subsection title="Priority (task priority flag)">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center" style={{ padding: "4px 8px", gap: 6, background: "#EFF6FF", borderRadius: 10, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: "#2563EB" }}>
                <Flag style={{ width: 12, height: 12, color: "#2563EB" }} strokeWidth={1.5} /> Normal
              </span>
              <span className="inline-flex items-center" style={{ padding: "4px 8px", gap: 6, background: "#FFEDD5", borderRadius: 10, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: "#EA580C" }}>
                <Flag style={{ width: 12, height: 12, color: "#EA580C" }} strokeWidth={1.5} /> High
              </span>
              <span className="inline-flex items-center" style={{ padding: "4px 8px", gap: 6, background: "#FEE2E2", borderRadius: 10, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: "#DC2626" }}>
                <Flag style={{ width: 12, height: 12, color: "#DC2626" }} strokeWidth={1.5} /> Urgent
              </span>
              <span className="inline-flex items-center" style={{ padding: "4px 8px", gap: 6, background: "#F1F5F9", borderRadius: 10, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: "#64748B" }}>
                <Flag style={{ width: 12, height: 12, color: "#64748B" }} strokeWidth={1.5} /> Low
              </span>
            </div>
          </Subsection>

          <Subsection title="Brief type (2-letter badge)">
            <div className="flex flex-wrap gap-3">
              <PillBadge label="UI" bg="#3B82F6" fg="#FFFFFF" ring="rgba(59,130,246,0.5)" />
              <PillBadge label="GD" bg="#22C55E" fg="#FFFFFF" ring="rgba(34,197,94,0.5)" />
              <PillBadge label="IL" bg="#A855F7" fg="#FFFFFF" ring="rgba(168,85,247,0.5)" />
            </div>
          </Subsection>

          <Subsection title="Lead source">
            <div className="flex flex-wrap gap-3">
              <PillBadge label="Dribbble" bg="#FDF2F8" fg="#BE185D" ring="rgba(190,24,93,0.1)" />
              <PillBadge label="Instagram" bg="#FCE7F3" fg="#9D174D" ring="rgba(157,23,77,0.1)" />
              <PillBadge label="LinkedIn" bg="#DBEAFE" fg="#1D4ED8" ring="rgba(29,78,216,0.1)" />
              <PillBadge label="Behance" bg="#EDE9FE" fg="#5B21B6" ring="rgba(91,33,182,0.1)" />
              <PillBadge label="Website" bg="#DCFCE7" fg="#166534" ring="rgba(22,101,52,0.1)" />
              <PillBadge label="Direct Email" bg="#FEF9C3" fg="#854D0E" ring="rgba(133,77,14,0.1)" />
              <PillBadge label="Referral" bg="#DCFCE7" fg="#15803D" ring="rgba(21,128,61,0.1)" />
            </div>
          </Subsection>

          <Subsection title="Lead stage">
            <div className="flex flex-wrap gap-3">
              <PillBadge label="Leads" bg="#F1F5F9" fg="#475569" ring="rgba(71,85,105,0.1)" />
              <PillBadge label="First Meeting" bg="#DBEAFE" fg="#1D4ED8" ring="rgba(29,78,216,0.1)" />
              <PillBadge label="Follow up 1" bg="#FEF9C3" fg="#854D0E" ring="rgba(133,77,14,0.1)" />
              <PillBadge label="Ghosting" bg="#FEE2E2" fg="#B91C1C" ring="rgba(185,28,28,0.1)" />
              <PillBadge label="Moodboard" bg="#FEF9C3" fg="#854D0E" ring="rgba(133,77,14,0.1)" />
              <PillBadge label="Down Payment" bg="#0080FF" fg="#FFFFFF" ring="rgba(0,128,255,0.5)" />
              <PillBadge label="Kickoff" bg="#F0FDF4" fg="#15803D" ring="rgba(22,163,74,0.2)" />
              <PillBadge label="Finish" bg="#DCFCE7" fg="#166534" ring="rgba(22,101,52,0.2)" />
            </div>
          </Subsection>
        </Section>

        {/* ─── AVATARS ───────────────────────────────────────── */}
        <Section title="Avatars">
          <Subsection title="Assignee avatar (24px)">
            <div className="flex items-center">
              {["AO", "BS", "CD"].map((initials, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 9999,
                    background: "#0080FF",
                    border: "2px solid #F8FAFC",
                    boxShadow: "0px 0px 0px 1px #E2E8F0",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#F8FAFC",
                    marginLeft: i === 0 ? 0 : -6,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Dashboard assignee pills (with name)">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {["AO", "RS"].map((initials, i) => (
                  <div
                    key={i}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 9999,
                      background: "#EFF6FF",
                      border: "1.5px solid #FFFFFF",
                      marginLeft: i === 0 ? 0 : -6,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: 10,
                      color: "#1D4ED8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#020817]">Agum O., Rina S. <span className="text-slate-500">+2</span></span>
            </div>
          </Subsection>
        </Section>

        {/* ─── CARDS ─────────────────────────────────────────── */}
        <Section title="Cards">
          <Subsection title="Stat card">
            <div className="grid grid-cols-4 gap-4 max-w-5xl">
              <StatCard title="New Leads" value={12} icon={Users} />
              <StatCard title="New Projects" value={4} icon={Briefcase} />
              <StatCard title="Total Earnings" value="$1,500" icon={DollarSign} />
              <StatCard title="Active Projects" value={2} icon={Activity} />
            </div>
          </Subsection>

          <Subsection title="Content card">
            <div
              className="bg-white max-w-md"
              style={{ padding: 12, border: "1px solid #E2E8F0", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)", borderRadius: 12 }}
            >
              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, lineHeight: "120%", letterSpacing: "-0.03em", color: "#020817" }}>
                Card Title
              </h3>
              <p className="text-sm text-slate-500 mt-2">Body content sits inside with 12px padding and 12px gap.</p>
            </div>
          </Subsection>

          <Subsection title="Motivational card (sidebar)">
            <div
              className="flex flex-col items-start"
              style={{
                width: 191,
                height: 192,
                padding: 16,
                gap: 10,
                background: "linear-gradient(180deg, #BFDBFE 0%, #3D67FB 100%)",
                borderRadius: 20,
                justifyContent: "flex-end",
              }}
            >
              <div style={{ width: 48, height: 48, background: "#FFFFFF", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, lineHeight: "28px" }}>😆</span>
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 20, lineHeight: "28px", color: "#FFFFFF" }}>
                Kurangi sambat, ayo semangat!
              </div>
            </div>
          </Subsection>
        </Section>

        {/* ─── INPUTS ────────────────────────────────────────── */}
        <Section title="Inputs">
          <Subsection title="Search input (Tasks / Leads)">
            <div className="relative" style={{ width: 208, height: 36 }}>
              <Search style={{ position: "absolute", left: 12, top: 10, width: 16, height: 16, color: "#64748B" }} strokeWidth={1.67} />
              <Input
                placeholder="Search task..."
                style={{
                  width: 208,
                  height: 36,
                  paddingLeft: 40,
                  paddingRight: 12,
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: "#020817",
                }}
              />
            </div>
          </Subsection>

          <Subsection title="Filter button">
            <button
              className="inline-flex items-center justify-center hover:bg-slate-100"
              style={{ gap: 8, height: 36, padding: "0 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, color: "#020817" }}
            >
              <Filter style={{ width: 16, height: 16, color: "#020817" }} strokeWidth={1.67} />
              Filter
            </button>
          </Subsection>
        </Section>

        {/* ─── NAV ───────────────────────────────────────────── */}
        <Section title="Sidebar navigation">
          <div
            style={{
              width: 224,
              background: "#F8FAFC",
              border: "1px solid #E4EAF1",
              borderRadius: 8,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={FolderKanban} label="Leads & Pipeline" />
            <NavItem icon={Users} label="Clients" />
            <NavItem icon={ListChecks} label="Projects" />
            <NavItem icon={CheckSquare} label="Tasks" />
            <NavItem icon={UserRound} label="Team" />
            <NavItem icon={FileText} label="Invoices" />
            <NavItem icon={FileEdit} label="Briefs" />
            <NavItem icon={BarChart} label="Statistics" />
            <NavItem icon={SettingsIcon} label="Settings" />
            <div style={{ borderTop: "1px solid rgba(229,231,235,0.5)", marginTop: 4, paddingTop: 8 }}>
              <div className="flex items-center" style={{ gap: 12, padding: 8, height: 36, borderRadius: 10 }}>
                <LogOut style={{ width: 16, height: 16, color: "rgba(63,63,70,0.7)" }} strokeWidth={1.67} />
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(63,63,70,0.7)" }}>
                  Logout
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── TABLE ─────────────────────────────────────────── */}
        <Section title="Tables" description="Default table style uses #F8FAFC header, #E2E8F0 row border.">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
            <div className="px-3 pt-3 pb-3">
              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: "#020817" }}>
                Active Projects
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Website Redesign</TableCell>
                  <TableCell className="text-muted-foreground">Arya Studio</TableCell>
                  <TableCell className="text-muted-foreground">Apr 22, 2026</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Brand Identity</TableCell>
                  <TableCell className="text-muted-foreground">Nova Brand</TableCell>
                  <TableCell className="text-muted-foreground">May 05, 2026</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* ─── TASK GROUP HEADER ─────────────────────────────── */}
        <Section title="Task group headers (ClickUp-style)">
          {[
            { label: "PLANNING", dot: "#61A6FA" },
            { label: "IN PROGRESS", dot: "#FBBD23" },
            { label: "COMPLETED", dot: "#22C55E" },
            { label: "PAUSED", dot: "#94A3B8" },
            { label: "CANCELLED", dot: "#EF4444" },
          ].map((g) => (
            <div
              key={g.label}
              className="flex items-center mb-2"
              style={{ height: 36, padding: "6px 16px", gap: 10, background: "#F8FAFC", borderRadius: 8 }}
            >
              <ChevronDown style={{ width: 16, height: 16, color: "#64748B" }} strokeWidth={1.67} />
              <div style={{ width: 6, height: 20, background: g.dot, borderRadius: 20 }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: "#020817" }}>
                {g.label}
              </span>
              <span
                className="inline-flex items-center"
                style={{
                  padding: "0 8px",
                  background: "rgba(241,245,249,0.6)",
                  borderRadius: 9999,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "#64748B",
                }}
              >
                3
              </span>
            </div>
          ))}
        </Section>

        {/* ─── ICONS ─────────────────────────────────────────── */}
        <Section title="Icon usage (Lucide · stroke 1.67)">
          <div className="flex flex-wrap gap-4">
            {[ChevronLeft, ChevronRight, ChevronDown, Plus, Search, Filter, Bell, Calendar, Flag, CheckCircle, Circle, MoreHorizontal, ArrowRight, LogOut, LayoutDashboard, Users].map(
              (Icon, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
                    <Icon style={{ width: 16, height: 16, color: "#020817" }} strokeWidth={1.67} />
                  </div>
                </div>
              )
            )}
          </div>
        </Section>

        <footer className="mt-16 text-xs text-slate-400 text-center">
          Hidden design system reference · /design-system
        </footer>
      </div>
    </div>
  );
}
