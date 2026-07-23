'use client';

import { Shirt, Sparkles, Droplets, Trash2 } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';

interface ClosetCardProps {
  item: ClosetItem;
  disabled: boolean;
  onOpen: (item: ClosetItem) => void;
  onWearNow: (item: ClosetItem) => void;
  onToggleDirty: (item: ClosetItem) => void;
  onDelete: (id: string) => void;
}

export default function ClosetCard({
  item,
  disabled,
  onOpen,
  onWearNow,
  onToggleDirty,
  onDelete,
}: ClosetCardProps) {
  return (
    <div className="mb-4 break-inside-avoid group relative">
      <button
        onClick={() => onOpen(item)}
        className={`w-full text-left rounded-2xl overflow-hidden border border-neutral-200 transition-opacity ${
          item.in_laundry ? 'opacity-50' : ''
        }`}
      >
        <div
          className="flex items-center justify-center h-40"
          style={{ backgroundColor: `${item.color}33` }}
        >
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <Shirt size={40} style={{ color: item.color }} strokeWidth={1.5} />
          )}
        </div>
        <div className="p-3 bg-white">
          <p className="text-sm font-semibold truncate">{item.name}</p>
          <p className="text-xs text-neutral-400 capitalize">{item.category}</p>
        </div>
      </button>

      {!disabled && (
        <div className="absolute inset-x-2 top-2 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onWearNow(item)}
            disabled={item.in_laundry}
            aria-label="Wear now"
            title="Wear now"
            className="rounded-full bg-white/95 p-2 shadow disabled:opacity-40"
          >
            <Sparkles size={14} className="text-peplos-pink" />
          </button>
          <button
            onClick={() => onToggleDirty(item)}
            aria-label={item.in_laundry ? 'Mark clean' : 'Mark dirty'}
            title={item.in_laundry ? 'Mark clean' : 'Mark dirty'}
            className="rounded-full bg-white/95 p-2 shadow"
          >
            <Droplets size={14} className={item.in_laundry ? 'text-peplos-blue' : 'text-neutral-500'} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            aria-label="Delete"
            title="Delete"
            className="rounded-full bg-white/95 p-2 shadow"
          >
            <Trash2 size={14} className="text-neutral-500" />
          </button>
        </div>
      )}
    </div>
  );
}
