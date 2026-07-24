'use client';

import { LoaderCircle, Sparkles, X } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';

interface GenerationActionProps {
  basePhotoUrl: string;
  selectedGarments: ClosetItem[];
  isGenerating: boolean;
  onRemove: (item: ClosetItem) => void;
  onGenerate: () => void;
}

export default function GenerationAction({ basePhotoUrl, selectedGarments, isGenerating, onRemove, onGenerate }: GenerationActionProps) {
  const ready = Boolean(basePhotoUrl && selectedGarments.length > 0 && selectedGarments.every((item) => item.image_url));
  const isFullOutfit = selectedGarments.some((item) => item.category === 'full outfit');
  const maxSlots = isFullOutfit ? 1 : 2;

  return (
    <section className="rounded-2xl bg-peplos-ink p-4 text-white shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-peplos-pink">05 / The magic moment</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.04em]">Your look, assembled.</h2></div>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          {isFullOutfit ? '1/1 — Full Look' : `${selectedGarments.length}/${maxSlots} selected`}
        </span>
      </div>
      <div className="mt-4 flex min-h-14 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2">
        {selectedGarments.length ? selectedGarments.map((item) => (
          <div key={item.id} className={`group relative flex min-w-0 items-center gap-2 rounded-lg bg-white/10 py-1.5 pl-1.5 pr-2.5 ${item.category === 'full outfit' ? 'flex-1' : ''}`}>
            <div className={`overflow-hidden rounded-md shrink-0 ${item.category === 'full outfit' ? 'h-16 w-12' : 'h-9 w-8'}`} style={{ backgroundColor: `${item.color}55` }}>
              {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-semibold text-white/80">{item.name}</span>
              {item.category === 'full outfit' && <span className="text-[9px] text-peplos-pink font-bold uppercase tracking-wide">Full outfit</span>}
            </div>
            <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item.name}`} className="shrink-0 text-white/35 transition hover:text-white"><X size={12} /></button>
          </div>
        )) : <p className="px-2 text-xs text-white/35">Select a garment from your closet to begin.</p>}
      </div>
      <button type="button" onClick={onGenerate} disabled={!ready || isGenerating} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-peplos-pink px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-peplos-ink transition hover:bg-[#f09bc3] disabled:cursor-not-allowed disabled:opacity-30">
        {isGenerating ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {isGenerating ? 'Generating look' : 'Generate look'}
      </button>
      {!ready && <p className="mt-3 text-center text-[10px] text-white/35">Add your base photo and at least one clean garment.</p>}
    </section>
  );
}
