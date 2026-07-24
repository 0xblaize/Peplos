'use client';

import { CalendarDays, Shirt, Sparkles, Waves } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { ClosetItem } from '@/lib/supabase';

interface ContextHeaderProps {
  closet: ClosetItem[];
  onOpenCalendarModal: () => void;
}

export default function ContextHeader({ closet, onOpenCalendarModal }: ContextHeaderProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const dirty = closet.filter((item) => item.in_laundry).length;
  const clean = closet.length - dirty;

  return (
    <div className="mb-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="dashboard-eyebrow flex items-center gap-2"><Sparkles size={12} className="text-peplos-pink" /> Friday, your wardrobe edit</p>
          <h1 className="mt-3 max-w-xl font-['Anton'] text-[2.7rem] uppercase leading-[0.92] tracking-[-0.02em] text-peplos-ink sm:text-6xl">
            Good morning, {firstName}.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-peplos-muted">A considered closet for a less considered morning. Add a piece, build your look, and step out with confidence.</p>
        </div>
        <button type="button" onClick={onOpenCalendarModal} aria-label="Open calendar settings" className="flex shrink-0 items-center gap-2 rounded-full border border-peplos-line bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-peplos-muted shadow-sm transition hover:border-peplos-ink hover:text-peplos-ink sm:px-4">
          <CalendarDays size={15} /> <span className="hidden sm:inline">Calendar</span>
        </button>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between text-peplos-muted"><span className="text-[10px] font-bold uppercase tracking-[0.18em]">In closet</span><Shirt size={14} /></div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{closet.length}</p>
          <p className="mt-1 text-[10px] text-peplos-muted">pieces total</p>
        </div>
        <div className="rounded-2xl bg-peplos-lime/35 p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between text-peplos-ink/60"><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Ready</span><Waves size={14} /></div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{clean}</p>
          <p className="mt-1 text-[10px] text-peplos-ink/60">clean pieces</p>
        </div>
        <div className="rounded-2xl bg-peplos-pink/25 p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between text-peplos-ink/60"><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Laundry</span><span className="text-sm">◌</span></div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{dirty}</p>
          <p className="mt-1 text-[10px] text-peplos-ink/60">pieces to refresh</p>
        </div>
      </div>
    </div>
  );
}
