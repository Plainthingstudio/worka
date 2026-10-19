export const mergeAssigneeIds = (current: string[], inherited: string[]) =>
  Array.from(new Set([...current, ...inherited]));
