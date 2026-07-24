'use client';

import { useEffect, useRef } from 'react';
import { Camera, Check, UserRound } from 'lucide-react';

const STORAGE_KEY = 'peplos-base-photo';

interface BaseModelCardProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BaseModelCard({ value, onChange }: BaseModelCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && !value) onChange(saved);
  }, [onChange, value]);

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      window.localStorage.setItem(STORAGE_KEY, reader.result);
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="rounded-2xl border border-peplos-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="dashboard-eyebrow text-peplos-pink">01 / Base model</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.04em]">Your lookbook subject.</h2>
          <p className="mt-1.5 max-w-xs text-xs leading-5 text-peplos-muted">One clear photo powers every virtual try-on. Use a full-body photo with simple lighting.</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-peplos-panel text-peplos-muted"><UserRound size={16} /></span>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-xl bg-peplos-panel/70 p-3">
        <div className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          {value ? <img src={value} alt="Your base model" className="h-full w-full object-cover" /> : <UserRound size={22} className="text-peplos-muted" strokeWidth={1.4} />}
          {value && <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-peplos-lime text-peplos-ink"><Check size={12} /></span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-peplos-ink">{value ? 'Base photo ready' : 'No base photo yet'}</p>
          <p className="mt-1 text-[11px] leading-4 text-peplos-muted">{value ? 'This is the person AI will dress.' : 'Add a photo to unlock generation.'}</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-peplos-ink underline underline-offset-4 hover:text-peplos-pink">
            <Camera size={12} /> {value ? 'Update photo' : 'Choose photo'}
          </button>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = ''; }} />
        </div>
      </div>
    </section>
  );
}
