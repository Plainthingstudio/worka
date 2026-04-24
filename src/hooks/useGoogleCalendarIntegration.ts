import { useCallback, useEffect, useState } from "react";
import { GoogleCalendarProfile } from "@/types/googleCalendar";
import {
  fetchGoogleCalendarEvents,
  getGoogleCalendarStatus,
  startGoogleCalendarConnection,
  disconnectGoogleCalendarConnection,
} from "@/lib/googleCalendar";

const DEFAULT_PROFILE: GoogleCalendarProfile = {
  connected: false,
};

export const useGoogleCalendarIntegration = () => {
  const [profile, setProfile] = useState<GoogleCalendarProfile>(DEFAULT_PROFILE);
  const [isConfigured, setIsConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const status = await getGoogleCalendarStatus();
      setIsConfigured(status.isConfigured);
      setNeedsReconnect(status.needsReconnect);
      setProfile({
        connected: status.connected,
        email: status.email,
        syncSource: status.syncSource,
        connectedAt: status.connectedAt,
      });
    } catch (err: any) {
      const message = err?.message || "Failed to load Google Calendar integration.";
      setError(message);
      setIsConfigured(false);
      setNeedsReconnect(false);
      setProfile(DEFAULT_PROFILE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const connect = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      const { authUrl } = await startGoogleCalendarConnection();
      window.location.assign(authUrl);
      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to start Google Calendar connection.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      await disconnectGoogleCalendarConnection();
      setProfile(DEFAULT_PROFILE);
      setNeedsReconnect(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to disconnect Google Calendar.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const getEventsForDate = useCallback(async (date: Date) => {
    return fetchGoogleCalendarEvents(date);
  }, []);

  return {
    profile,
    isConfigured,
    isLoading,
    isSaving,
    error,
    needsReconnect,
    refreshProfile: loadProfile,
    connect,
    disconnect,
    getEventsForDate,
  };
};
