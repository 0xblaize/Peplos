import type { ClosetItem } from '@/lib/supabase';
import type { ClosetFilter } from './FilterPills';
import ClosetCard from './ClosetCard';

interface ClosetGridProps {
  items: ClosetItem[];
  filter: ClosetFilter;
  disabled: boolean;
  onOpen: (item: ClosetItem) => void;
  onWearNow: (item: ClosetItem) => void;
  onToggleDirty: (item: ClosetItem) => void;
  onDelete: (id: string) => void;
}

export default function ClosetGrid({ items, filter, disabled, onOpen, onWearNow, onToggleDirty, onDelete }: ClosetGridProps) {
  const filtered = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'dirty') return item.in_laundry;
    return item.category === filter;
  });

  if (filtered.length === 0) {
    return <p className="text-sm text-neutral-400">No items match this filter yet.</p>;
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
      {filtered.map((item) => (
        <ClosetCard
          key={item.id}
          item={item}
          disabled={disabled}
          onOpen={onOpen}
          onWearNow={onWearNow}
          onToggleDirty={onToggleDirty}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
