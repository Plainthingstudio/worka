
// This file re-exports the hook from the briefs directory
// to maintain backward compatibility
import { useBriefs as useBriefsHook } from "./briefs/useBriefs";

export const useBriefs = useBriefsHook;
