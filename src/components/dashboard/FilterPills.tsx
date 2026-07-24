import type { ClosetItem } from '@/lib/supabase';

export type ClosetFilter = 'all' | ClosetItem['category'] | 'dirty';

const FILTERS: Array<{ key: ClosetFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'footwear', label: 'Shoes' },
  { key: 'accessory', label: 'Accessories' },
  { key: 'dirty', label: 'Laundry' },
];

interface FilterPillsProps {
  active: ClosetFilter;
  items?: ClosetItem[];
  onChange: (filter: ClosetFilter) => void;
}

export default function FilterPills({ active, items = [], onChange }: FilterPillsProps) {
  const countFor = (key: ClosetFilter) => {
    if (key === 'all') return items.length;
    if (key === 'dirty') return items.filter((item) => item.in_laundry).length;
    return items.filter((item) => item.category === key).length;
  };

  return (
    <div className="dashboard-scroll -mx-1 flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Filter closet">
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          type="button"
          role="tab"
          aria-selected={active === filter.key}
          onClick={() => onChange(filter.key)}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] transition sm:px-4 ${
            active === filter.key
              ? 'bg-peplos-ink text-white shadow-sm'
              : 'bg-peplos-panel text-peplos-muted hover:bg-peplos-line hover:text-peplos-ink'
          }`}
        >
          {filter.label}
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active === filter.key ? 'bg-white/15 text-white/75' : 'bg-white text-peplos-muted'}`}>{countFor(filter.key)}</span>
        </button>
      ))}
    </div>
  );
}
