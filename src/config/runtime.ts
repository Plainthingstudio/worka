const parseBooleanFlag = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return fallback;
};

export const isDemoLoginEnabled = parseBooleanFlag(
  import.meta.env.VITE_ENABLE_DEMO_LOGIN as string | undefined,
  import.meta.env.DEV
);
