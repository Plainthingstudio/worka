export interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  htmlLink?: string;
  isAllDay: boolean;
}

export interface GoogleCalendarProfile {
  connected: boolean;
  email?: string;
  syncSource?: "primary";
  connectedAt?: string;
}

export interface GoogleCalendarStatus extends GoogleCalendarProfile {
  isConfigured: boolean;
  needsReconnect: boolean;
}
