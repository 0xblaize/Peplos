'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import { updateClosetItem } from '@/lib/closet';

const CATEGORIES: ClosetItem['category'][] = ['top', 'bottom', 'outerwear', 'footwear', 'accessory'];

interface EditItemDrawerProps {
  item: ClosetItem | null;
  disabled: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditItemDrawer({ item, disabled, onClose, onSaved }: EditItemDrawerProps) {
  const [form, setForm] = useState<ClosetItem | null>(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setForm(item); setError(null); }, [item]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await updateClosetItem(form.id, { name: form.name, category: form.category, formality: form.formality, warmth: form.warmth, color: form.color, gender: form.gender });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${item ? '' : 'pointer-events-none'}`} aria-hidden={!item}>
      <button type="button" onClick={onClose} aria-label="Close item editor" className={`absolute inset-0 bg-peplos-ink/45 backdrop-blur-sm transition-opacity ${item ? 'opacity-100' : 'opacity-0'}`} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${item ? 'translate-x-0' : 'translate-x-full'}`}>
        {form && (
          <>
            <div className="flex items-start justify-between border-b border-peplos-line px-6 py-5">
              <div><p className="dashboard-eyebrow text-peplos-pink">Closet archive</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">Edit this piece</h2></div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-peplos-muted transition hover:bg-peplos-panel hover:text-peplos-ink"><X size={18} /></button>
            </div>
            <div className="dashboard-scroll flex-1 overflow-y-auto px-6 py-6">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl" style={{ backgroundColor: `${form.color}33` }}>
                {form.image_url ? <img src={form.image_url} alt={form.name} className="h-full w-full object-cover" /> : <span className="text-xs uppercase tracking-[0.18em] text-peplos-muted">No photo added</span>}
              </div>
              <div className="mt-7 space-y-5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Name<input className="dashboard-input" value={form.name} disabled={disabled} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Category<select className="dashboard-input" value={form.category} disabled={disabled} onChange={(e) => setForm({ ...form, category: e.target.value as ClosetItem['category'] })}>{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Designed for<select className="dashboard-input" value={form.gender} disabled={disabled} onChange={(e) => setForm({ ...form, gender: e.target.value as ClosetItem['gender'] })}><option value="unisex">Unisex</option><option value="female">Girl</option><option value="male">Boy</option></select></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Formality<input type="number" min={0} max={10} className="dashboard-input" value={form.formality} disabled={disabled} onChange={(e) => setForm({ ...form, formality: Number(e.target.value) })} /></label>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Warmth<input type="number" min={0} max={10} className="dashboard-input" value={form.warmth} disabled={disabled} onChange={(e) => setForm({ ...form, warmth: Number(e.target.value) })} /></label>
                </div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Signature color<input type="color" className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-peplos-line bg-white p-1" value={form.color} disabled={disabled} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
                {error && <p className="text-xs text-red-600">{error}</p>}
                {disabled && <p className="rounded-xl bg-peplos-panel p-3 text-xs leading-5 text-peplos-muted">Connect Supabase to save edits. Your demo workspace is currently read-only.</p>}
              </div>
            </div>
            <div className="border-t border-peplos-line px-6 py-5"><button type="button" onClick={handleSave} disabled={disabled || saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-peplos-ink py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40">{saving ? 'Saving…' : <><Check size={16} /> Save changes</>}</button></div>
          </>
        )}
      </aside>
    </div>
  );
}
