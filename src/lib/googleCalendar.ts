import type { CalendarEvent } from './mockCalendar';

const OUTDOOR_KEYWORDS = /park|hike|hiking|beach|trail|stadium|field|garden|patio|outdoor|picnic|festival|farmers market|bbq|barbecue/i;

interface GoogleCalendarEvent {
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
}

/**
 * Fetches today's events from the signed-in user's primary Google Calendar
 * and converts them into the same CalendarEvent shape the mock schedule
 * uses, so the coordination engine doesn't need to know which source it's
 * reading from. `indoor` is a heuristic — Google Calendar has no such
 * field — defaulting to indoor unless the title/location suggests
 * otherwise, since the app's core requirement is never over-dressing for
 * an indoor day, not under-dressing for an outdoor one.
 */
export async function fetchTodaysGoogleEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const params = new URLSearchParams({
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    throw new Error(`Google Calendar request failed: ${res.status}`);
  }

  const data = (await res.json()) as { items?: GoogleCalendarEvent[] };

  return (data.items ?? []).map((event) => {
    const title = event.summary ?? 'Untitled event';
    const isOutdoor = OUTDOOR_KEYWORDS.test(`${title} ${event.location ?? ''}`);
    const startDateTime = event.start?.dateTime;
    const time = startDateTime
      ? new Date(startDateTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : 'All day';

    return { time, title, indoor: !isOutdoor };
  });
}
