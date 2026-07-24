'use client';

import { Plus, Sparkles } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import ContextHeader from './ContextHeader';
import IngestionZone from './IngestionZone';
import FilterPills, { type ClosetFilter } from './FilterPills';
import ClosetGrid from './ClosetGrid';

interface SandboxProps {
  closet: ClosetItem[];
  persisted: boolean;
  filter: ClosetFilter;
  onFilterChange: (filter: ClosetFilter) => void;
  onAdded: () => void;
  onOpenItem: (item: ClosetItem) => void;
  onWearNow: (item: ClosetItem) => void;
  onToggleDirty: (item: ClosetItem) => void;
  onDelete: (id: string) => void;
  onOpenCalendarModal: () => void;
}

export default function Sandbox({ closet, persisted, filter, onFilterChange, onAdded, onOpenItem, onWearNow, onToggleDirty, onDelete, onOpenCalendarModal }: SandboxProps) {
  return (
    <div className="px-1 py-1 sm:px-2 sm:py-2">
      <ContextHeader closet={closet} onOpenCalendarModal={onOpenCalendarModal} />

      {!persisted && (
        <div className="mb-7 flex items-start gap-3 rounded-2xl border border-peplos-pink/25 bg-peplos-pink/10 px-4 py-3.5 text-xs text-peplos-ink/70">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-peplos-pink" />
          <p><strong className="font-semibold text-peplos-ink">Demo workspace.</strong> Your closet is read-only until Supabase is configured. Add <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to persist pieces.</p>
        </div>
      )}

      <div className="dashboard-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-peplos-line px-4 py-4 sm:px-6">
          <div><p className="dashboard-eyebrow">01 / Add to closet</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">Bring a piece into focus.</h2></div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peplos-ink text-white"><Plus size={15} /></span>
        </div>
        <div className="p-4 sm:p-6"><IngestionZone disabled={!persisted} onAdded={onAdded} /></div>
      </div>

      <div className="mt-5 dashboard-surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="dashboard-eyebrow">02 / Your collection</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">The closet, edited.</h2></div>
          <p className="text-xs text-peplos-muted">{closet.length} piece{closet.length === 1 ? '' : 's'} in your archive</p>
        </div>
        <div className="mt-5"><FilterPills active={filter} items={closet} onChange={onFilterChange} /></div>
        <ClosetGrid items={closet} filter={filter} disabled={!persisted} onOpen={onOpenItem} onWearNow={onWearNow} onToggleDirty={onToggleDirty} onDelete={onDelete} />
      </div>
    </div>
  );
}
