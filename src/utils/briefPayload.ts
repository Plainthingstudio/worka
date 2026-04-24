import { parseJsonField, stringifyJsonField } from "./appwriteJson";

export const stringifyBriefPayload = (payload: unknown) =>
  stringifyJsonField(payload, "{}");

export const parseBriefPayload = (brief: Record<string, any> | null | undefined) =>
  parseJsonField(brief?.brief_payload ?? brief?.payload, {});

export const mergeBriefPayload = <T extends Record<string, any> | null | undefined>(
  brief: T
) => {
  if (!brief) return brief;

  const payload = parseBriefPayload(brief);
  const merged = payload && typeof payload === "object"
    ? { ...payload, ...brief }
    : { ...brief };

  merged.companyName =
    merged.companyName ?? merged.company_name ?? payload?.companyName ?? "";
  merged.submissionDate =
    merged.submissionDate ?? merged.submission_date ?? payload?.submissionDate;
  merged.logoFeelings =
    merged.logoFeelings ?? merged.logo_feelings ?? payload?.logoFeelings ?? {};
  merged.logo_feelings = merged.logo_feelings ?? merged.logoFeelings;

  return merged;
};
