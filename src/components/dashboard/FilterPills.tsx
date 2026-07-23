import type { ClosetItem } from '@/lib/supabase';

export type ClosetFilter = 'all' | ClosetItem['category'] | 'dirty';

const FILTERS: Array<{ key: ClosetFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'footwear', label: 'Shoes' },
  { key: 'accessory', label: 'Accessories' },
  { key: 'dirty', label: 'Dirty/Laundry' },
];

interface FilterPillsProps {
  active: ClosetFilter;
  onChange: (filter: ClosetFilter) => void;
}

export default function FilterPills({ active, onChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            active === f.key
              ? 'bg-neutral-900 text-white'
              : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
