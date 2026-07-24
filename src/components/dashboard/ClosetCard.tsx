'use client';

import { Check, Droplets, MoreHorizontal, Shirt, Sparkles, Trash2 } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';

interface ClosetCardProps {
  item: ClosetItem;
  disabled: boolean;
  onOpen: (item: ClosetItem) => void;
  onWearNow: (item: ClosetItem) => void;
  onToggleDirty: (item: ClosetItem) => void;
  onDelete: (id: string) => void;
}

export default function ClosetCard({ item, disabled, onOpen, onWearNow, onToggleDirty, onDelete }: ClosetCardProps) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-peplos-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-card ${item.in_laundry ? 'opacity-65' : ''}`}>
      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <div className="relative flex aspect-[4/4.5] items-center justify-center overflow-hidden" style={{ backgroundColor: `${item.color}20` }}>
          <div className="absolute left-3 top-3 rounded-full bg-white/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-peplos-muted backdrop-blur-sm">
            {item.in_laundry ? 'In laundry' : item.category}
          </div>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/70 shadow-sm"><Shirt size={34} style={{ color: item.color }} strokeWidth={1.3} /></div>
          )}
          <div className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-peplos-muted opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100"><MoreHorizontal size={15} /></div>
        </div>
        <div className="p-3.5">
          <p className="truncate text-sm font-semibold tracking-[-0.02em] text-peplos-ink">{item.name}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-peplos-muted">
            <span>{item.category}</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.formality}/10 formal</span>
          </div>
        </div>
      </button>

      {!disabled && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button type="button" onClick={() => onWearNow(item)} disabled={item.in_laundry} aria-label="Use in lookbook" title="Use in lookbook" className="rounded-full bg-white/95 p-2 text-peplos-pink shadow-sm transition hover:scale-105 disabled:opacity-40"><Sparkles size={13} /></button>
          <button type="button" onClick={() => onToggleDirty(item)} aria-label={item.in_laundry ? 'Mark clean' : 'Mark dirty'} title={item.in_laundry ? 'Mark clean' : 'Mark dirty'} className="rounded-full bg-white/95 p-2 text-peplos-muted shadow-sm transition hover:scale-105 hover:text-peplos-ink">{item.in_laundry ? <Check size={13} /> : <Droplets size={13} />}</button>
          <button type="button" onClick={() => onDelete(item.id)} aria-label="Delete item" title="Delete item" className="rounded-full bg-white/95 p-2 text-peplos-muted shadow-sm transition hover:scale-105 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      )}
    </article>
  );
}
