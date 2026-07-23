'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { X, CalendarDays } from 'lucide-react';

interface CalendarSyncModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CalendarSyncModal({ open, onClose }: CalendarSyncModalProps) {
  const { data: session } = useSession();
  const [googleConfigured, setGoogleConfigured] = useState(false);

  useEffect(() => {
    fetch('/api/auth/config')
      .then((res) => res.json())
      .then((data) => setGoogleConfigured(Boolean(data.googleConfigured)))
      .catch(() => setGoogleConfigured(false));
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4">
          <X size={18} />
        </button>

        <CalendarDays size={28} className="text-peplos-pink mb-3" />
        <h2 className="text-lg font-bold mb-2">Calendar sync</h2>
        <p className="text-sm text-neutral-600 mb-5">
          We need to know if you&apos;re going to the gym or a gala so we don&apos;t dress you in
          sweatpants for a wedding. Connecting your Google Calendar lets Peplos read today&apos;s
          event titles and times — nothing is written back, and we only look at today.
        </p>

        {!googleConfigured ? (
          <p className="text-xs text-neutral-400">
            Google Calendar isn&apos;t configured for this deployment yet — Peplos is using a demo
            schedule instead. See <code>.env.example</code> for the required keys.
          </p>
        ) : session ? (
          <div className="space-y-3">
            <p className="text-sm">
              Connected as <span className="font-semibold">{session.user?.name}</span>.
            </p>
            <button
              onClick={() => signOut()}
              className="w-full rounded-full border-2 border-neutral-900 py-2.5 text-sm font-semibold"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="w-full rounded-full bg-peplos-pink text-white py-2.5 text-sm font-semibold"
          >
            Connect Google Calendar
          </button>
        )}
      </div>
    </div>
  );
}
