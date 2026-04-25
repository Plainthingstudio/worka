import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Link2, Loader2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";

const GoogleCalendarSettings = () => {
  const {
    profile,
    isConfigured,
    isLoading,
    isSaving,
    error,
    needsReconnect,
    connect,
    disconnect,
  } = useGoogleCalendarIntegration();

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="rounded-2xl border border-border-soft bg-surface-2 p-3 text-foreground/80">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your primary Google Calendar so dashboard meetings stay in sync with your daily schedule.
                </p>
              </div>

              {!isConfigured ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                  Deploy the Google Calendar Appwrite Function and set its Google OAuth environment variables before connecting.
                </div>
              ) : null}

              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading integration status...</p>
              ) : (
                <div className="space-y-2 text-sm text-foreground/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${profile.connected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/40"}`} />
                    <span>{profile.connected ? "Connected" : "Not connected"}</span>
                  </div>

                  {profile.connected && profile.email ? (
                    <p>
                      Connected account: <span className="font-medium text-foreground">{profile.email}</span>
                    </p>
                  ) : null}
                  {profile.connected && profile.connectedAt ? (
                    <p>
                      Connected at:{" "}
                      <span className="font-medium text-foreground">
                        {format(new Date(profile.connectedAt), "dd MMM yyyy, HH:mm")}
                      </span>
                    </p>
                  ) : null}
                  {profile.connected ? (
                    <p className="text-muted-foreground">
                      Google Calendar access is stored server-side through Appwrite Functions, so users stay connected
                      across browser sessions until access is revoked.
                    </p>
                  ) : null}
                  {needsReconnect ? (
                    <p className="text-amber-700 dark:text-amber-300">
                      Akses Google Calendar tidak lagi valid. Reconnect diperlukan agar backend bisa menyimpan token baru.
                    </p>
                  ) : null}
                  {error ? <p className="text-red-600 dark:text-red-400">{error}</p> : null}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => void connect()}
              disabled={!isConfigured || isSaving}
              className="min-w-[170px]"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
              {profile.connected ? "Reconnect Calendar" : "Connect Calendar"}
            </Button>

            <Button
              variant="outline"
              onClick={() => void disconnect()}
              disabled={!profile.connected || isSaving}
              className="min-w-[150px]"
            >
              <Unplug className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface-2 p-4">
          <h4 className="text-sm font-semibold text-foreground">Setup checklist</h4>
          <div className="mt-3 space-y-2 text-sm text-foreground/80">
            <p>1. Enable Google Calendar API dan buat OAuth Client ID tipe Web application.</p>
            <p>2. Buat Appwrite Function `google-calendar` dan aktifkan execute access `Any` agar callback Google bisa masuk ke function domain.</p>
            <p>3. Isi `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, dan `GOOGLE_STATE_SECRET` di env function.</p>
            <p>4. Tambahkan callback function URL ke Google OAuth redirect URIs dan deploy function.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarSettings;
