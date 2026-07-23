import { auth, isGoogleCalendarConfigured } from '@/auth';
import { MOCK_SCHEDULE, type CalendarEvent } from './mockCalendar';
import { fetchTodaysGoogleEvents } from './googleCalendar';

export interface ScheduleResult {
  events: CalendarEvent[];
  source: 'google' | 'mock';
}

export async function getTodaysSchedule(): Promise<ScheduleResult> {
  if (!isGoogleCalendarConfigured) {
    return { events: MOCK_SCHEDULE, source: 'mock' };
  }

  const session = await auth();

  if (session?.accessToken) {
    try {
      const events = await fetchTodaysGoogleEvents(session.accessToken);
      return { events, source: 'google' };
    } catch {
      // Token expired/revoked or API hiccup — fall back to the mock
      // schedule rather than failing the whole outfit request.
      return { events: MOCK_SCHEDULE, source: 'mock' };
    }
  }

  return { events: MOCK_SCHEDULE, source: 'mock' };
}
