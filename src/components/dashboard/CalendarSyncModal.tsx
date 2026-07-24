'use client';

import { CalendarDays, Check, ExternalLink, X } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useGoogleCalendarStatus } from '@/components/useGoogleCalendarStatus';

interface CalendarSyncModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CalendarSyncModal({ open, onClose }: CalendarSyncModalProps) {
  const { data: session } = useSession();
  const { googleConfigured, checking } = useGoogleCalendarStatus();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title">
      <button type="button" onClick={onClose} aria-label="Close calendar settings" className="absolute inset-0 bg-peplos-ink/45 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-4xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-peplos-line px-6 py-5 sm:px-8">
          <div>
            <p className="dashboard-eyebrow text-peplos-pink">Workspace connection</p>
            <h2 id="calendar-modal-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Your calendar, in context.</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-neutral-400 transition hover:bg-peplos-panel hover:text-peplos-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex gap-4 rounded-2xl bg-peplos-panel p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-peplos-pink shadow-sm">
              <CalendarDays size={20} />
            </span>
            <p className="text-sm leading-6 text-peplos-muted">
              Peplos reads today&apos;s events to understand the dress code — a client meeting, a gym session, or a late dinner. It never writes to your calendar.
            </p>
          </div>

          {checking ? (
            <div className="h-12 animate-pulse rounded-2xl bg-peplos-panel" />
          ) : !googleConfigured ? (
            <div className="rounded-2xl border border-dashed border-peplos-line p-4">
              <p className="text-sm font-semibold text-peplos-ink">Google Calendar is not configured yet.</p>
              <p className="mt-2 text-xs leading-5 text-peplos-muted">
                Add <code className="rounded bg-peplos-panel px-1 py-0.5">AUTH_GOOGLE_ID</code> and <code className="rounded bg-peplos-panel px-1 py-0.5">AUTH_GOOGLE_SECRET</code> to the deployment environment, then add the OAuth callback URL from <code className="rounded bg-peplos-panel px-1 py-0.5">.env.example</code> in Google Cloud.
              </p>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-peplos-ink underline underline-offset-4">
                Open Google Cloud credentials <ExternalLink size={12} />
              </a>
            </div>
          ) : session ? (
            <div className="flex items-center justify-between rounded-2xl border border-peplos-line p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peplos-lime/40 text-peplos-ink"><Check size={16} /></span>
                <div>
                  <p className="text-sm font-semibold">Calendar connected</p>
                  <p className="text-xs text-peplos-muted">{session.user?.email ?? session.user?.name}</p>
                </div>
              </div>
              <button type="button" onClick={() => signOut()} className="text-xs font-semibold text-peplos-muted underline underline-offset-4 hover:text-peplos-ink">Disconnect</button>
            </div>
          ) : (
            <button type="button" onClick={() => signIn('google')} className="flex w-full items-center justify-center gap-2 rounded-full bg-peplos-ink px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black">
              <CalendarDays size={17} />
              Connect Google Calendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
