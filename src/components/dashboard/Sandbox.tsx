'use client';

import { Plus, Sparkles } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import type { WeatherSnapshot } from '@/lib/weather';
import type { CalendarEvent } from '@/lib/schedule';
import ContextBar from './ContextBar';
import BaseModelCard from './BaseModelCard';
import GenerationAction from './GenerationAction';
import IngestionZone from './IngestionZone';
import FilterPills, { type ClosetFilter } from './FilterPills';
import ClosetGrid from './ClosetGrid';

interface SandboxProps {
  closet: ClosetItem[];
  persisted: boolean;
  filter: ClosetFilter;
  selectedGarments: ClosetItem[];
  basePhotoUrl: string;
  weather: WeatherSnapshot | null;
  nextEvent?: CalendarEvent;
  contextSource: 'google' | 'none' | null;
  isGenerating: boolean;
  onFilterChange: (filter: ClosetFilter) => void;
  onAdded: () => void;
  onSelectGarment: (item: ClosetItem) => void;
  onOpenItem: (item: ClosetItem) => void;
  onToggleDirty: (item: ClosetItem) => void;
  onDelete: (id: string) => void;
  onBasePhotoChange: (value: string) => void;
  onGenerate: () => void;
  onRemoveGarment: (item: ClosetItem) => void;
  onOpenCalendarModal: () => void;
}

export default function Sandbox({ closet, persisted, filter, selectedGarments, basePhotoUrl, weather, nextEvent, contextSource, isGenerating, onFilterChange, onAdded, onSelectGarment, onOpenItem, onToggleDirty, onDelete, onBasePhotoChange, onGenerate, onRemoveGarment, onOpenCalendarModal }: SandboxProps) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div><p className="dashboard-eyebrow flex items-center gap-2"><Sparkles size={12} className="text-peplos-pink" /> Utility zone</p><h1 className="mt-2 font-['Anton'] text-4xl uppercase leading-[0.92] tracking-[-0.02em] text-peplos-ink sm:text-5xl">Build the look.</h1><p className="mt-3 max-w-sm text-sm leading-6 text-peplos-muted">Set the context, choose a piece, and let Peplos turn your closet into an editorial.</p></div>
      {!persisted && <div className="flex items-start gap-3 rounded-2xl border border-peplos-pink/25 bg-peplos-pink/10 px-4 py-3 text-xs text-peplos-ink/70"><Sparkles size={15} className="mt-0.5 shrink-0 text-peplos-pink" /><p><strong className="font-semibold text-peplos-ink">Demo workspace.</strong> Supabase is not configured, so closet edits are read-only.</p></div>}
      <ContextBar weather={weather} nextEvent={nextEvent} source={contextSource} onOpenCalendar={onOpenCalendarModal} />
      <BaseModelCard value={basePhotoUrl} onChange={onBasePhotoChange} />

      <section className="rounded-2xl border border-peplos-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex items-end justify-between gap-3"><div><p className="dashboard-eyebrow text-peplos-pink">03 / Digital inventory</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.04em]">Choose your garment.</h2></div><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-peplos-muted">{selectedGarments.length}/2 selected</span></div>
        <p className="mt-2 text-xs leading-5 text-peplos-muted">Select one primary piece, or pair a top with a bottom. Tap again to remove.</p>
        <div className="mt-4"><FilterPills active={filter} items={closet} onChange={onFilterChange} /></div>
        <ClosetGrid items={closet} selectedIds={selectedGarments.map((item) => item.id)} filter={filter} disabled={false} onSelect={onSelectGarment} onOpen={onOpenItem} onToggleDirty={onToggleDirty} onDelete={onDelete} />
      </section>

      <section className="rounded-2xl border border-dashed border-peplos-line bg-white/60 p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-peplos-panel"><Plus size={14} /></span><div><p className="text-xs font-semibold">Add another piece</p><p className="text-[10px] text-peplos-muted">Paste, drop, or browse a garment photo.</p></div></div><IngestionZone disabled={!persisted} onAdded={onAdded} /></section>

      <div className="sticky bottom-3 z-20 mt-auto"><GenerationAction basePhotoUrl={basePhotoUrl} selectedGarments={selectedGarments} isGenerating={isGenerating} onRemove={onRemoveGarment} onGenerate={onGenerate} /></div>
    </div>
  );
}
