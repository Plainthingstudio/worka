import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { TeamMember } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UserAvatar } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TeamMemberMultiSelectProps {
  teamMembers: TeamMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void | boolean | Promise<void | boolean>;
  getMemberValue?: (member: TeamMember) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptySelectionText?: string;
  popoverPortalled?: boolean;
  trigger?: React.ReactNode;
  confirmSelection?: boolean;
  showSelected?: boolean;
  popoverClassName?: string;
}

const getCreatedAtTime = (member: TeamMember) => {
  const createdAt = member.createdAt instanceof Date ? member.createdAt : new Date(member.createdAt);
  const time = createdAt.getTime();
  return Number.isNaN(time) ? 0 : time;
};

const TeamMemberMultiSelect = ({
  teamMembers,
  selectedIds,
  onChange,
  getMemberValue = (member) => member.id,
  placeholder = "Select team members",
  searchPlaceholder = "Search team member...",
  emptySelectionText = "No team members assigned yet. Select members from the dropdown above.",
  popoverPortalled = false,
  trigger,
  confirmSelection = false,
  showSelected = true,
  popoverClassName,
}: TeamMemberMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [isApplying, setIsApplying] = useState(false);

  const sortedTeamMembers = useMemo(
    () =>
      [...teamMembers].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a)),
    [teamMembers]
  );

  const activeIds = confirmSelection ? draftIds : selectedIds;
  const selectedIdSet = useMemo(() => new Set(activeIds), [activeIds]);

  const availableTeamMembers = useMemo(
    () => sortedTeamMembers.filter((member) => !selectedIdSet.has(getMemberValue(member))),
    [getMemberValue, selectedIdSet, sortedTeamMembers]
  );

  const selectedMembers = useMemo(
    () =>
      selectedIds
        .map((id) => sortedTeamMembers.find((member) => getMemberValue(member) === id))
        .filter((member): member is TeamMember => Boolean(member)),
    [getMemberValue, selectedIds, sortedTeamMembers]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const pickerMembers = confirmSelection ? sortedTeamMembers : availableTeamMembers;
  const filteredTeamMembers = normalizedSearch
    ? pickerMembers.filter((member) =>
        `${member.name} ${member.position}`.toLowerCase().includes(normalizedSearch)
      )
    : pickerMembers;

  const handleSelect = (member: TeamMember) => {
    const memberValue = getMemberValue(member);
    if (confirmSelection) {
      setDraftIds((current) =>
        current.includes(memberValue)
          ? current.filter((id) => id !== memberValue)
          : [...current, memberValue]
      );
      return;
    }
    if (!selectedIdSet.has(memberValue)) {
      onChange([...selectedIds, memberValue]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const handleRemove = (memberId: string) => {
    onChange(selectedIds.filter((id) => id !== memberId));
  };

  const normalizeIds = (ids: string[]) => Array.from(new Set(ids.map((id) => {
    const member = teamMembers.find((item) => item.id === id || getMemberValue(item) === id);
    return member ? getMemberValue(member) : id;
  })));

  const handleApply = async () => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      const saved = await onChange(draftIds);
      if (saved !== false) {
        setIsOpen(false);
        setSearch("");
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open && confirmSelection) setDraftIds(normalizeIds(selectedIds));
          if (!open) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          {trigger || (
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="h-10 w-full justify-between px-3 font-normal"
            >
              <span className="truncate text-left">{placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-[--radix-popover-trigger-width] p-0", popoverClassName)}
          align="start"
          portalled={popoverPortalled}
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={searchPlaceholder}
            />
            <CommandList className="max-h-[220px] overscroll-contain">
              <CommandEmpty>No team members found.</CommandEmpty>
              <CommandGroup>
                {filteredTeamMembers.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={`${member.id} ${member.name} ${member.position}`}
                    onSelect={() => handleSelect(member)}
                    className="gap-2"
                  >
                    {confirmSelection && (
                      <span className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                        selectedIdSet.has(getMemberValue(member))
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border bg-background"
                      )}>
                        {selectedIdSet.has(getMemberValue(member)) && <Check className="h-3.5 w-3.5" />}
                      </span>
                    )}
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size={24} />
                    <span className="truncate font-medium">{member.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{member.position}</span>
                  </CommandItem>
                ))}
                {!confirmSelection && availableTeamMembers.length === 0 && (
                  <CommandItem value="no-members" disabled>
                    No more team members available
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
          {confirmSelection && (
            <div className="border-t p-2">
              <Button type="button" className="w-full" disabled={isApplying} onClick={handleApply}>
                Apply
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {showSelected && <div className="flex flex-wrap gap-2 mt-2">
        {selectedMembers.map((member) => {
          const memberValue = getMemberValue(member);

          return (
            <Badge key={memberValue} variant="category" className="flex items-center gap-1 py-1 pl-1.5">
              <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size={24} />
              <span>{member.name} - {member.position}</span>
              <button
                type="button"
                onClick={() => handleRemove(memberValue)}
                className="ml-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {member.name}</span>
              </button>
            </Badge>
          );
        })}
        {selectedIds.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {emptySelectionText}
          </div>
        )}
      </div>}
    </div>
  );
};

export default TeamMemberMultiSelect;
