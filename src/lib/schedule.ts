import { auth, isGoogleCalendarConfigured } from '@/auth';
import { fetchTodaysGoogleEvents } from './googleCalendar';

export interface CalendarEvent {
  time: string;
  title: string;
  indoor: boolean;
}

export interface ScheduleResult {
  events: CalendarEvent[];
  source: 'google' | 'none';
}

export async function getTodaysSchedule(): Promise<ScheduleResult> {
  if (!isGoogleCalendarConfigured) {
    return { events: [], source: 'none' };
  }

  const session = await auth();

  if (session?.accessToken) {
    try {
      const events = await fetchTodaysGoogleEvents(session.accessToken);
      return { events, source: 'google' };
    } catch {
      // Token expired/revoked or API hiccup.
      return { events: [], source: 'none' };
    }
  }

  return { events: [], source: 'none' };
}
