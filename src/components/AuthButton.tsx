'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { CalendarDays } from 'lucide-react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [googleConfigured, setGoogleConfigured] = useState(false);

  useEffect(() => {
    fetch('/api/auth/config')
      .then((res) => res.json())
      .then((data) => setGoogleConfigured(Boolean(data.googleConfigured)))
      .catch(() => setGoogleConfigured(false));
  }, []);

  if (!googleConfigured) {
    return (
      <span className="text-xs text-white/80">
        Google sign-in isn&apos;t configured for this deployment.
      </span>
    );
  }
  if (status === 'loading') return null;

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-1.5 text-xs text-white underline opacity-90 hover:opacity-100"
      >
        <CalendarDays size={14} />
        {session.user?.name ?? 'Signed in'} · Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-1.5 text-xs text-white underline opacity-90 hover:opacity-100"
    >
      <CalendarDays size={14} />
      Connect Google Calendar
    </button>
  );
}
