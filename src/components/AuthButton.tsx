'use client';

import { CalendarDays, Check, Settings2 } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useGoogleCalendarStatus } from './useGoogleCalendarStatus';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const { googleConfigured, checking } = useGoogleCalendarStatus();

  if (checking || status === 'loading') {
    return <span className="inline-block h-4 w-28 animate-pulse rounded-full bg-white/20" aria-label="Checking calendar connection" />;
  }

  if (!googleConfigured) {
    return (
      <span className="flex max-w-[230px] items-center gap-2 text-left text-[11px] leading-4 text-white/70">
        <Settings2 size={14} className="shrink-0 text-white/80" />
        <span>Calendar connection is available once Google OAuth is configured.</span>
      </span>
    );
  }

  if (session) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="flex items-center gap-2 text-xs font-semibold text-white transition-opacity hover:opacity-75"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
          <Check size={13} />
        </span>
        {session.user?.name ?? 'Calendar connected'}
        <span className="text-white/50">· Disconnect</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn('google')}
      className="flex items-center gap-2 text-xs font-semibold text-white transition-opacity hover:opacity-75"
    >
      <CalendarDays size={15} />
      Connect Google Calendar
    </button>
  );
}
