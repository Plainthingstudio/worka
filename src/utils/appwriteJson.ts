export const parseJsonField = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  if (typeof value === "object") {
    return value as T;
  }

  return fallback;
};

export const stringifyJsonField = (value: unknown, fallback = "{}") => {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value ?? JSON.parse(fallback));
  } catch {
    return fallback;
  }
};
