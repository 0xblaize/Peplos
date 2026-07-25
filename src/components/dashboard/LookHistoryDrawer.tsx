'use client';

import { Images, X } from 'lucide-react';
import type { LookHistoryEntry } from '@/lib/lookHistory';

interface LookHistoryDrawerProps {
  open: boolean;
  entries: LookHistoryEntry[];
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function LookHistoryDrawer({ open, entries, onClose }: LookHistoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="look-history-title">
      <button type="button" onClick={onClose} aria-label="Close look history" className="absolute inset-0 bg-peplos-ink/45 backdrop-blur-sm" />
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-4xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-peplos-line px-6 py-5 sm:px-8">
          <div>
            <p className="dashboard-eyebrow text-peplos-pink">Utility zone</p>
            <h2 id="look-history-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Your past looks.</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-neutral-400 transition hover:bg-peplos-panel hover:text-peplos-ink">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-peplos-panel px-6 py-12 text-center">
              <Images size={22} className="text-peplos-muted" />
              <p className="text-sm font-semibold text-peplos-ink">No looks generated yet.</p>
              <p className="max-w-xs text-xs leading-5 text-peplos-muted">Your successful try-ons will show up here once you generate a real look.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {entries.map((entry) => (
                <div key={entry.id} className="overflow-hidden rounded-2xl border border-peplos-line bg-peplos-panel">
                  <img src={entry.imageUrl} alt={entry.garments.map((g) => g.name).join(' + ')} className="aspect-[3/4] w-full object-cover" />
                  <div className="px-2.5 py-2">
                    <p className="truncate text-[11px] font-semibold text-peplos-ink">{entry.garments.map((g) => g.name).join(' + ') || 'Look'}</p>
                    <p className="text-[10px] text-peplos-muted">{timeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
