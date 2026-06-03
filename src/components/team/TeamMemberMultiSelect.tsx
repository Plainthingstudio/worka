import React, { useMemo, useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
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

interface TeamMemberMultiSelectProps {
  teamMembers: TeamMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  getMemberValue?: (member: TeamMember) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptySelectionText?: string;
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
}: TeamMemberMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sortedTeamMembers = useMemo(
    () =>
      [...teamMembers].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a)),
    [teamMembers]
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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
  const filteredTeamMembers = normalizedSearch
    ? availableTeamMembers.filter((member) =>
        `${member.name} ${member.position}`.toLowerCase().includes(normalizedSearch)
      )
    : availableTeamMembers;

  const handleSelect = (member: TeamMember) => {
    const memberValue = getMemberValue(member);
    if (!selectedIdSet.has(memberValue)) {
      onChange([...selectedIds, memberValue]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const handleRemove = (memberId: string) => {
    onChange(selectedIds.filter((id) => id !== memberId));
  };

  return (
    <div className="space-y-4">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          portalled={false}
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
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size={24} />
                    <span className="truncate font-medium">{member.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{member.position}</span>
                  </CommandItem>
                ))}
                {availableTeamMembers.length === 0 && (
                  <CommandItem value="no-members" disabled>
                    No more team members available
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2 mt-2">
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
      </div>
    </div>
  );
};

export default TeamMemberMultiSelect;
