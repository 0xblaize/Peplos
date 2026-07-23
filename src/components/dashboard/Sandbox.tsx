'use client';

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

export default function Sandbox({
  closet,
  persisted,
  filter,
  onFilterChange,
  onAdded,
  onOpenItem,
  onWearNow,
  onToggleDirty,
  onDelete,
  onOpenCalendarModal,
}: SandboxProps) {
  return (
    <div className="px-6 py-8 sm:px-10 sm:py-12 max-w-4xl mx-auto">
      <ContextHeader closet={closet} onOpenCalendarModal={onOpenCalendarModal} />

      {!persisted && (
        <div className="mb-6 rounded-xl border border-yellow-400/50 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
          Supabase isn&apos;t configured, so you&apos;re viewing the built-in mock closet in
          read-only mode. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see <code>supabase/schema.sql</code>) to add,
          edit, and remove real items.
        </div>
      )}

      <h2
        style={{ fontFamily: "'Anton', sans-serif" }}
        className="text-2xl sm:text-3xl uppercase tracking-tight mb-4"
      >
        Your Closet
      </h2>

      <IngestionZone disabled={!persisted} onAdded={onAdded} />

      <FilterPills active={filter} onChange={onFilterChange} />

      <ClosetGrid
        items={closet}
        filter={filter}
        disabled={!persisted}
        onOpen={onOpenItem}
        onWearNow={onWearNow}
        onToggleDirty={onToggleDirty}
        onDelete={onDelete}
      />
    </div>
  );
}
