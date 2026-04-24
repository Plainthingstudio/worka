
import React, { useState } from 'react';
import { Lead, LeadSource, LeadStage } from '@/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStageBadgeVariant } from './utils/leadBadgeUtils';
import { getLeadSourceBadgeVariant } from '@/components/projects/utils/projectItemUtils';

const LEAD_SOURCES: LeadSource[] = [
  'Dribbble',
  'Website',
  'LinkedIn',
  'Behance',
  'Direct Email',
  'Other',
];

interface CreatorEntry {
  userId: string;
  name: string;
  initials: string;
}

interface LeadRowProps {
  lead: Lead;
  stages: LeadStage[];
  creator?: CreatorEntry | null;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onInlineUpdate: (id: string, fields: Partial<Lead>) => void;
}

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #E2E8F0',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '20px',
  color: '#020817',
};

const inputClass =
  'w-full rounded border border-[#3762FB] px-2 py-0.5 text-sm outline-none focus:ring-1 focus:ring-[#3762FB] bg-white';

const InlineText = ({
  value,
  onSave,
  type = 'text',
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed || value);
    else setDraft(value);
    setEditing(false);
  };

  return editing ? (
    <input
      autoFocus
      type={type}
      value={draft}
      placeholder={placeholder}
      className={inputClass}
      onClick={e => e.stopPropagation()}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      }}
    />
  ) : (
    <button
      className="w-full text-left rounded px-1 py-0.5 hover:bg-[#F1F5F9] transition-colors text-sm"
      onClick={e => { e.stopPropagation(); setDraft(value); setEditing(true); }}
    >
      {value || <span className="text-muted-foreground italic">{placeholder || '—'}</span>}
    </button>
  );
};

const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  stages,
  creator,
  onDelete,
  onStageChange,
  onInlineUpdate,
}) => {
  return (
    <TableRow className="group">
      {/* Name */}
      <TableCell style={cellStyle}>
        <InlineText
          value={lead.name}
          onSave={v => onInlineUpdate(lead.id, { name: v })}
        />
      </TableCell>

      {/* Email */}
      <TableCell className="hidden md:table-cell" style={cellStyle}>
        <InlineText
          value={lead.email}
          type="email"
          onSave={v => onInlineUpdate(lead.id, { email: v })}
        />
      </TableCell>

      {/* Phone */}
      <TableCell className="hidden lg:table-cell" style={cellStyle}>
        <InlineText
          value={lead.phone || ''}
          type="tel"
          placeholder="Add phone"
          onSave={v => onInlineUpdate(lead.id, { phone: v })}
        />
      </TableCell>

      {/* Source */}
      <TableCell className="hidden md:table-cell" style={cellStyle}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded focus:outline-none focus:ring-1 focus:ring-[#3762FB]"
              onClick={e => e.stopPropagation()}
            >
              {lead.source ? (
                <Badge
                  variant={getLeadSourceBadgeVariant(lead.source)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {lead.source}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground italic hover:text-foreground transition-colors cursor-pointer">
                  Add source
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-44">
            {LEAD_SOURCES.map(s => (
              <DropdownMenuItem
                key={s}
                className={s === lead.source ? 'font-medium text-[#3762FB]' : ''}
                onClick={() => onInlineUpdate(lead.id, { source: s })}
              >
                <Badge variant={getLeadSourceBadgeVariant(s)} className="pointer-events-none">
                  {s}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* Stage — dropdown */}
      <TableCell style={{ padding: '10px 16px', borderBottom: '1px solid #E2E8F0' }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded focus:outline-none focus:ring-1 focus:ring-[#3762FB]"
              onClick={e => e.stopPropagation()}
            >
              <Badge
                variant={getStageBadgeVariant(lead.stage)}
                className="rounded-[10px] px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
              >
                {lead.stage}
              </Badge>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-52">
            <DropdownMenuItem className="text-xs text-muted-foreground font-medium" disabled>
              Move to Stage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {stages.map(stage => (
              <DropdownMenuItem
                key={stage}
                disabled={lead.stage === stage}
                className={lead.stage === stage ? 'font-medium text-[#3762FB]' : ''}
                onClick={() => onStageChange(lead.id, stage)}
              >
                <Badge variant={getStageBadgeVariant(stage)} className="pointer-events-none text-xs">
                  {stage}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* Created By */}
      <TableCell className="hidden lg:table-cell" style={cellStyle}>
        {creator ? (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[10px] font-semibold text-[#1D4ED8]">
              {creator.initials}
            </div>
            <span className="text-sm text-[#475569] truncate max-w-[120px]">{creator.name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Updated — read-only */}
      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm" style={cellStyle}>
        {new Date(lead.updatedAt).toLocaleDateString()}
      </TableCell>

      {/* Delete — shows on row hover */}
      <TableCell style={{ padding: '6px 16px', borderBottom: '1px solid #E2E8F0', width: 48 }}>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-red-50 text-red-500"
          onClick={e => { e.stopPropagation(); onDelete(lead.id); }}
        >
          <Trash className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
};

export default LeadRow;
