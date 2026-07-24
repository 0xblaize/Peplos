'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, ChevronRight, CircleHelp, Sparkles } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import { getCloset, isClosetPersisted, setInLaundry, deleteClosetItem } from '@/lib/closet';
import AuthButton from '@/components/AuthButton';
import Sandbox from '@/components/dashboard/Sandbox';
import LookbookStage from '@/components/dashboard/LookbookStage';
import EditItemDrawer from '@/components/dashboard/EditItemDrawer';
import CalendarSyncModal from '@/components/dashboard/CalendarSyncModal';
import type { ClosetFilter } from '@/components/dashboard/FilterPills';

export default function DashboardPage() {
  const persisted = isClosetPersisted();
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [filter, setFilter] = useState<ClosetFilter>('all');
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const refreshCloset = useCallback(() => {
    getCloset().then(setCloset);
  }, []);

  useEffect(refreshCloset, [refreshCloset]);

  function handleToggleDirty(item: ClosetItem) {
    setInLaundry(item.id, !item.in_laundry).then(refreshCloset);
  }

  function handleDelete(id: string) {
    deleteClosetItem(id).then(refreshCloset);
  }

  const cleanCount = closet.filter((item) => !item.in_laundry).length;

  return (
    <div className="min-h-screen bg-peplos-bg">
      <header className="relative z-20 bg-peplos-night text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-3">
            <span className="font-['Anton'] text-xl tracking-[0.08em]">PEPLOS</span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45 sm:block">Personal wardrobe OS</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-peplos-lime" />
              {persisted ? 'Closet synced' : 'Demo workspace'}
            </div>
            <AuthButton />
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <span>Workspace</span><ChevronRight size={13} /><span className="text-white/85">Today&apos;s edit</span>
          </div>
          <a href="#closet" className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 transition hover:text-white sm:flex">
            Browse closet <ArrowUpRight size={13} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <div className="mb-4 flex items-center justify-between px-1 lg:mb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-peplos-muted">
            <Sparkles size={13} className="text-peplos-pink" /> The daily edit
          </div>
          <button type="button" onClick={() => setCalendarModalOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-peplos-line bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-peplos-muted transition hover:border-peplos-ink hover:text-peplos-ink">
            <CalendarDays size={13} /> Calendar settings
          </button>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)] lg:gap-6">
          <section id="closet" className="min-w-0 rounded-4xl border border-peplos-line bg-[#f4efec] p-4 shadow-soft sm:p-6 lg:p-8">
            <Sandbox
              closet={closet}
              persisted={persisted}
              filter={filter}
              onFilterChange={setFilter}
              onAdded={refreshCloset}
              onOpenItem={setSelectedItem}
              onWearNow={() => undefined}
              onToggleDirty={handleToggleDirty}
              onDelete={handleDelete}
              onOpenCalendarModal={() => setCalendarModalOpen(true)}
            />
          </section>

          <aside className="min-w-0 lg:sticky lg:top-4">
            <LookbookStage />
            <div className="mt-3 flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-peplos-muted">
              <span>{cleanCount} clean pieces available</span>
              <span className="inline-flex items-center gap-1"><CircleHelp size={12} /> VTO preview</span>
            </div>
          </aside>
        </div>
      </main>

      <EditItemDrawer item={selectedItem} disabled={!persisted} onClose={() => setSelectedItem(null)} onSaved={refreshCloset} />
      <CalendarSyncModal open={calendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
    </div>
  );
}
