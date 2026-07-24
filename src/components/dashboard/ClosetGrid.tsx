import { Shirt, Sparkles } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import type { ClosetFilter } from './FilterPills';
import ClosetCard from './ClosetCard';

interface ClosetGridProps {
  items: ClosetItem[];
  selectedIds: string[];
  filter: ClosetFilter;
  disabled: boolean;
  onSelect: (item: ClosetItem) => void;
  onOpen: (item: ClosetItem) => void;
  onToggleDirty: (item: ClosetItem) => void;
  onDelete: (id: string) => void;
}

export default function ClosetGrid({ items, selectedIds, filter, disabled, onSelect, onOpen, onToggleDirty, onDelete }: ClosetGridProps) {
  const filtered = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'dirty') return item.in_laundry;
    return item.category === filter;
  });

  if (items.length === 0) return <div className="mt-5 rounded-2xl border border-dashed border-peplos-line bg-peplos-panel/60 px-6 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-peplos-pink shadow-sm"><Shirt size={20} /></span><p className="mt-4 text-sm font-semibold text-peplos-ink">Your archive is waiting.</p><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-peplos-muted">Add a garment photo above and start building the lookbook source.</p></div>;
  if (filtered.length === 0) return <div className="mt-5 rounded-2xl bg-peplos-panel px-6 py-10 text-center"><Sparkles size={19} className="mx-auto text-peplos-pink" /><p className="mt-3 text-sm font-semibold">Nothing in this edit yet.</p><p className="mt-1 text-xs text-peplos-muted">Try another filter or add a new piece.</p></div>;

  return <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{filtered.map((item) => <ClosetCard key={item.id} item={item} selected={selectedIds.includes(item.id)} disabled={disabled} onSelect={onSelect} onOpen={onOpen} onToggleDirty={onToggleDirty} onDelete={onDelete} />)}</div>;
}
