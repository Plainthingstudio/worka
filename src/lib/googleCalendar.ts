import { format } from "date-fns";
import { ExecutionMethod } from "appwrite";
import { functions } from "@/integrations/appwrite/client";
import { GoogleCalendarEvent, GoogleCalendarStatus } from "@/types/googleCalendar";

const GOOGLE_CALENDAR_FUNCTION_ID =
  (import.meta.env.VITE_GOOGLE_CALENDAR_FUNCTION_ID as string | undefined)?.trim() || "google-calendar";

interface GoogleCalendarFunctionResponse {
  message?: string;
  error?: string;
}

interface GoogleCalendarConnectResponse extends GoogleCalendarFunctionResponse {
  authUrl: string;
}

interface GoogleCalendarEventsResponse extends GoogleCalendarFunctionResponse {
  events: GoogleCalendarEvent[];
}

export class GoogleCalendarAuthError extends Error {
  constructor(message = "Google Calendar authorization is required.") {
    super(message);
    this.name = "GoogleCalendarAuthError";
  }
}

const executeGoogleCalendarFunction = async <T>(
  method: ExecutionMethod,
  path: string,
  body?: Record<string, unknown>
) => {
  const execution = await functions.createExecution({
    functionId: GOOGLE_CALENDAR_FUNCTION_ID,
    async: false,
    xpath: path,
    method,
    headers: {
      "content-type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const responseBody = execution.responseBody || "{}";
  let parsed: T & GoogleCalendarFunctionResponse;

  try {
    parsed = JSON.parse(responseBody) as T & GoogleCalendarFunctionResponse;
  } catch {
    throw new Error("Google Calendar backend returned an invalid response.");
  }

  if (execution.responseStatusCode >= 400) {
    const message =
      parsed.message ||
      parsed.error ||
      `Google Calendar backend failed with status ${execution.responseStatusCode}.`;

    if (execution.responseStatusCode === 401 || execution.responseStatusCode === 403) {
      throw new GoogleCalendarAuthError(message);
    }

    throw new Error(message);
  }

  return parsed;
};

export const getGoogleCalendarStatus = async () =>
  executeGoogleCalendarFunction<GoogleCalendarStatus>(ExecutionMethod.GET, "/status");

export const startGoogleCalendarConnection = async () =>
  executeGoogleCalendarFunction<GoogleCalendarConnectResponse>(ExecutionMethod.POST, "/connect/start");

export const disconnectGoogleCalendarConnection = async () =>
  executeGoogleCalendarFunction<{ success: boolean }>(ExecutionMethod.POST, "/disconnect");

export const fetchGoogleCalendarEvents = async (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const formattedDate = format(date, "yyyy-MM-dd");
  const response = await executeGoogleCalendarFunction<GoogleCalendarEventsResponse>(
    ExecutionMethod.GET,
    `/events?date=${formattedDate}&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`
  );

  return response.events || [];
};
