
import React, { useRef, useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, MapPin, Trash } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Client, LeadSource } from "@/types";
import { getLeadSourceBadgeVariant } from "@/components/projects/utils/projectItemUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LEAD_SOURCES: LeadSource[] = [
  "Dribbble",
  "Website",
  "LinkedIn",
  "Behance",
  "Direct Email",
  "Other",
];

interface CreatorEntry {
  userId: string;
  name: string;
  initials: string;
}

interface ClientItemProps {
  client: Client;
  creator?: CreatorEntry | null;
  onDelete?: (id: string) => void;
  onInlineUpdate?: (clientId: string, fields: Partial<Client>) => void;
}

const inputClass =
  "w-full rounded border border-[#3762FB] px-2 py-0.5 text-sm outline-none focus:ring-1 focus:ring-[#3762FB]";

const EditableText = ({
  value,
  onSave,
  type = "text",
  prefix,
}: {
  value: string;
  onSave: (v: string) => void;
  type?: string;
  prefix?: React.ReactNode;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  return editing ? (
    <input
      ref={inputRef}
      autoFocus
      type={type}
      value={draft}
      className={inputClass}
      onClick={e => e.stopPropagation()}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
      }}
    />
  ) : (
    <button
      className="flex items-center gap-2 w-full text-left rounded px-1 py-0.5 hover:bg-[#F1F5F9] transition-colors text-sm"
      onClick={e => { e.stopPropagation(); setDraft(value); setEditing(true); }}
    >
      {prefix}
      <span>{value}</span>
    </button>
  );
};

const AddressField = ({
  address,
  onSave,
}: {
  address?: string;
  onSave: (v: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(address || "");

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed !== (address || "")) onSave(trimmed);
    else setDraft(address || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        placeholder="Enter address..."
        className="w-full rounded border border-[#3762FB] px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-[#3762FB]"
        onClick={e => e.stopPropagation()}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(address || ""); setEditing(false); }
        }}
      />
    );
  }

  if (!address) {
    return (
      <button
        className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground rounded px-1 py-0.5 transition-colors"
        onClick={e => { e.stopPropagation(); setDraft(""); setEditing(true); }}
      >
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="italic">Add address</span>
      </button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground rounded px-1 py-0.5 hover:bg-[#F1F5F9] transition-colors w-full"
            onClick={e => { e.stopPropagation(); setDraft(address); setEditing(true); }}
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[200px]">{address}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-[280px] text-xs">
          {address}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ClientItem = ({ client, creator, onDelete, onInlineUpdate }: ClientItemProps) => {
  const save = (fields: Partial<Client>) => onInlineUpdate?.(client.id, fields);

  return (
    <TableRow className="group">
      {/* Name */}
      <TableCell className="font-medium">
        <div className="flex flex-col gap-0.5">
          <EditableText value={client.name} onSave={v => save({ name: v })} />
          <AddressField
            address={client.address}
            onSave={v => save({ address: v })}
          />
        </div>
      </TableCell>

      {/* Email */}
      <TableCell>
        <EditableText
          value={client.email}
          type="email"
          onSave={v => save({ email: v })}
          prefix={<Mail className="h-4 w-4 text-muted-foreground shrink-0" />}
        />
      </TableCell>

      {/* Phone */}
      <TableCell>
        <EditableText
          value={client.phone}
          type="tel"
          onSave={v => save({ phone: v })}
          prefix={<Phone className="h-4 w-4 text-muted-foreground shrink-0" />}
        />
      </TableCell>

      {/* Lead Source */}
      <TableCell>
        {onInlineUpdate ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded focus:outline-none focus:ring-1 focus:ring-[#3762FB]"
                onClick={e => e.stopPropagation()}
              >
                <Badge
                  variant={getLeadSourceBadgeVariant(client.leadSource)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {client.leadSource}
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-44">
              {LEAD_SOURCES.map(s => (
                <DropdownMenuItem
                  key={s}
                  className={s === client.leadSource ? "font-medium text-[#3762FB]" : ""}
                  onClick={() => save({ leadSource: s })}
                >
                  <Badge variant={getLeadSourceBadgeVariant(s)} className="pointer-events-none">
                    {s}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant={getLeadSourceBadgeVariant(client.leadSource)}>
            {client.leadSource}
          </Badge>
        )}
      </TableCell>

      {/* Created By */}
      <TableCell>
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

      {/* Created — read-only */}
      <TableCell className="text-muted-foreground text-sm">
        {format(new Date(client.createdAt), "MMM dd, yyyy")}
      </TableCell>

      {/* Delete — shows on row hover */}
      <TableCell className="w-12 text-right">
        {onDelete && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-red-50 text-red-500"
            onClick={e => { e.stopPropagation(); onDelete(client.id); }}
          >
            <Trash className="h-4 w-4" />
          </button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ClientItem;
