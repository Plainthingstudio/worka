import { useEffect, useMemo, useState } from "react";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GoogleCalendarEvent } from "@/types/googleCalendar";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";
import { GoogleCalendarAuthError } from "@/lib/googleCalendar";

const getDateKey = (date: Date) => format(startOfDay(date), "yyyy-MM-dd");

const MeetingScheduleCard = () => {
  const navigate = useNavigate();
  const {
    profile,
    isConfigured,
    isLoading: isIntegrationLoading,
    needsReconnect,
    getEventsForDate,
  } = useGoogleCalendarIntegration();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [tomorrowCount, setTomorrowCount] = useState(0);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      if (!profile.connected || needsReconnect || !isConfigured) {
        setEvents([]);
        setTodayCount(0);
        setTomorrowCount(0);
        setEventError(null);
        return;
      }

      try {
        setIsLoadingEvents(true);
        setEventError(null);

        const dateEntries = [
          startOfDay(selectedDate),
          today,
          tomorrow,
        ];

        const uniqueDates = Array.from(
          new Map(dateEntries.map((date) => [getDateKey(date), date])).values()
        );

        const results = await Promise.all(
          uniqueDates.map(async (date) => {
            const key = getDateKey(date);
            const calendarEvents = await getEventsForDate(date);
            return [key, calendarEvents] as const;
          })
        );

        if (!isMounted) return;

        const eventsByKey = new Map(results);
        setEvents(eventsByKey.get(getDateKey(selectedDate)) || []);
        setTodayCount((eventsByKey.get(getDateKey(today)) || []).length);
        setTomorrowCount((eventsByKey.get(getDateKey(tomorrow)) || []).length);
      } catch (error: unknown) {
        if (!isMounted) return;
        setEvents([]);
        setTodayCount(0);
        setTomorrowCount(0);
        if (error instanceof GoogleCalendarAuthError) {
          setEventError("Google Calendar session expired. Please reconnect from Settings.");
        } else {
          setEventError(error instanceof Error ? error.message : "Unable to load meetings right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [getEventsForDate, isConfigured, needsReconnect, profile.connected, selectedDate, today, tomorrow]);

  const renderState = () => {
    if (!isConfigured) {
      return (
        <div className="rounded-[12px] border border-dashed border-amber-300 bg-amber-50 px-4 py-5 dark:border-amber-700 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-950 dark:text-amber-100">Google Calendar backend belum dikonfigurasi.</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Deploy Appwrite Function Google Calendar dan isi environment OAuth agar widget meeting bisa dipakai.
          </p>
        </div>
      );
    }

    if (isIntegrationLoading) {
      return (
        <div className="rounded-[12px] border border-border-soft bg-surface-2 px-4 py-5 text-sm text-muted-foreground">
          Loading calendar status...
        </div>
      );
    }

    if (!profile.connected) {
      return (
        <div className="rounded-[12px] border border-dashed border-border-soft bg-surface-2 px-4 py-5">
          <p className="text-sm font-medium text-foreground">
            Hubungkan Google Calendar untuk melihat meeting terjadwal.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Setelah connect, dashboard akan membaca event dari primary calendar Anda melalui Appwrite Function.
          </p>
          <Button className="mt-4" onClick={() => navigate("/settings?tab=integrations")}>
            <Link2 className="mr-2 h-4 w-4" />
            Connect Calendar
          </Button>
        </div>
      );
    }

    if (needsReconnect || eventError) {
      return (
        <div className="rounded-[12px] border border-dashed border-border-soft bg-surface-2 px-4 py-5">
          <p className="text-sm font-medium text-foreground">
            {eventError || "Google Calendar perlu dihubungkan ulang."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Backend tidak bisa lagi me-refresh akses Google Calendar. Hubungkan ulang agar meeting tetap tersinkron.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/settings?tab=integrations")}>
            Reconnect from Settings
          </Button>
        </div>
      );
    }

    if (isLoadingEvents) {
      return (
        <div className="rounded-[12px] border border-border-soft bg-surface-2 px-4 py-5 text-sm text-muted-foreground">
          Loading meetings for {format(selectedDate, "d MMM yyyy")}...
        </div>
      );
    }

    if (!events.length) {
      return (
        <div className="rounded-[12px] border border-border-soft bg-surface-2 px-4 py-5">
          <p className="text-sm font-medium text-foreground">
            Tidak ada meeting pada {format(selectedDate, "d MMMM yyyy")}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan tombol panah untuk melihat jadwal hari sebelumnya atau berikutnya.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-[12px] border border-border-soft bg-card">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex h-16 items-center justify-between gap-4 border-b border-border-soft px-4 py-2 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium leading-5 text-foreground">{event.title}</p>
              <p className="mt-2 text-[12px] font-medium leading-5 text-brand-accent">
                {event.isAllDay
                  ? "All day"
                  : `${format(parseISO(event.start), "h:mm a")} - ${format(parseISO(event.end), "h:mm a")}`}
              </p>
            </div>

            {event.htmlLink ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 shrink-0 rounded-[7px] border-border-soft bg-card px-2 text-[12px] font-medium leading-5 text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.05)]"
                onClick={() => window.open(event.htmlLink, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Link
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-[428px] flex-col rounded-[12px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border-soft text-brand-accent">
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-[120%] tracking-[-0.03em] text-foreground">
              Meetings Scheduled
            </p>
            <p className="mt-1 text-[11px] leading-[100%] tracking-[-0.02em] text-muted-foreground">
              View upcoming meetings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-[10px] border-border-soft bg-card px-3 text-[12px] font-medium shadow-[0px_1px_2px_rgba(15,23,42,0.05)]"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[10px] text-foreground"
            onClick={() => setSelectedDate((current) => addDays(current, -1))}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[10px] text-foreground"
            onClick={() => setSelectedDate((current) => addDays(current, 1))}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <span className="ml-1 text-[11px] leading-[100%] tracking-[-0.02em] text-muted-foreground">
            {format(selectedDate, "d MMM")}
          </span>
        </div>
      </div>

      {profile.connected && !needsReconnect && isConfigured && !eventError ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex h-[92px] flex-col justify-between rounded-[10px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span className="text-[11px] font-medium leading-[14px] tracking-[-0.02em] text-foreground">
                Today Meetings
              </span>
            </div>
            <p className="text-[20px] font-medium leading-5 text-foreground">
              {todayCount} {todayCount === 1 ? "Call" : "Calls"}
            </p>
          </div>

          <div className="flex h-[92px] flex-col justify-between rounded-[10px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              <span className="text-[11px] font-medium leading-[14px] tracking-[-0.02em] text-foreground">
                Tomorrow Meetings
              </span>
            </div>
            <p className="text-[20px] font-medium leading-5 text-foreground">
              {tomorrowCount} {tomorrowCount === 1 ? "Call" : "Calls"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex-1">{renderState()}</div>
    </section>
  );
};

export default MeetingScheduleCard;
