'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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

  useEffect(() => {
    setForm(item);
    setError(null);
  }, [item]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await updateClosetItem(form.id, {
        name: form.name,
        category: form.category,
        formality: form.formality,
        warmth: form.warmth,
        color: form.color,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${item ? '' : 'pointer-events-none'}`}
      aria-hidden={!item}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          item ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 ${
          item ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {form && (
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Edit item</h2>
              <button onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div
              className="h-48 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${form.color}33` }}
            >
              {form.image_url ? (
                <img src={form.image_url} alt={form.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-xs text-neutral-400">No photo</span>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Name
                <input
                  className="mt-1 w-full border border-neutral-200 rounded-md px-3 py-2 text-sm font-normal normal-case"
                  value={form.name}
                  disabled={disabled}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Category
                <select
                  className="mt-1 w-full border border-neutral-200 rounded-md px-3 py-2 text-sm font-normal normal-case"
                  value={form.category}
                  disabled={disabled}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ClosetItem['category'] })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Formality
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="mt-1 w-full border border-neutral-200 rounded-md px-3 py-2 text-sm font-normal normal-case"
                    value={form.formality}
                    disabled={disabled}
                    onChange={(e) => setForm({ ...form, formality: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Warmth
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="mt-1 w-full border border-neutral-200 rounded-md px-3 py-2 text-sm font-normal normal-case"
                    value={form.warmth}
                    disabled={disabled}
                    onChange={(e) => setForm({ ...form, warmth: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Color
                <input
                  type="color"
                  className="mt-1 w-full h-10 border border-neutral-200 rounded-md"
                  value={form.color}
                  disabled={disabled}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}
              {disabled && (
                <p className="text-xs text-neutral-400">
                  Connect Supabase to save edits — see .env.example.
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={disabled || saving}
              className="mt-4 w-full rounded-full bg-peplos-pink text-white font-semibold py-3 text-sm disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
