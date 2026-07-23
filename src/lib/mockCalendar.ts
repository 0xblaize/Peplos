export interface CalendarEvent {
  time: string;
  title: string;
  indoor: boolean;
}

// Hardcoded schedule for the hackathon demo — swap for real Google Calendar
// API events once OAuth is wired up.
export const MOCK_SCHEDULE: CalendarEvent[] = [
  { time: '07:00', title: 'Gym', indoor: true },
  { time: '09:30', title: 'Team Standup', indoor: true },
  { time: '14:00', title: 'Client Pitch', indoor: true },
  { time: '20:00', title: 'Dinner with friends', indoor: true },
];
