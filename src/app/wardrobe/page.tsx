'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import { getCloset, isClosetPersisted, addClosetItem, setInLaundry, deleteClosetItem } from '@/lib/closet';

const CATEGORIES: ClosetItem['category'][] = ['top', 'bottom', 'outerwear', 'footwear', 'accessory'];

const EMPTY_FORM = {
  name: '',
  category: 'top' as ClosetItem['category'],
  formality: 5,
  warmth: 5,
  color: '#888888',
  model_url: '',
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function WardrobePage() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const persisted = isClosetPersisted();

  const refresh = () => {
    setLoading(true);
    getCloset()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!persisted || !form.name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await addClosetItem({
        id: `${slugify(form.name)}-${Date.now().toString(36)}`,
        name: form.name.trim(),
        category: form.category,
        formality: form.formality,
        warmth: form.warmth,
        color: form.color,
        model_url: form.model_url || '',
        in_laundry: false,
      });
      setForm(EMPTY_FORM);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLaundry = async (item: ClosetItem) => {
    if (!persisted) return;
    try {
      await setInLaundry(item.id, !item.in_laundry);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, in_laundry: !i.in_laundry } : i)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!persisted) return;
    try {
      await deleteClosetItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-4 py-8 sm:px-10 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-2xl font-bold">Wardrobe</h1>
          <a href="/outfit" className="text-sm underline opacity-75 hover:opacity-100">
            Today&apos;s Outfit →
          </a>
        </div>
        <p className="text-sm opacity-60 mb-6">
          {items.length} item{items.length === 1 ? '' : 's'} ·{' '}
          {items.filter((i) => i.in_laundry).length} in laundry
        </p>

        {!persisted && (
          <div className="mb-6 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm">
            Supabase isn&apos;t configured, so you&apos;re viewing the built-in mock
            closet in read-only mode. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see <code>supabase/schema.sql</code>)
            to add, edit, and remove real items.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleAdd}
          className={`mb-8 grid grid-cols-2 sm:grid-cols-6 gap-3 rounded-xl border border-white/15 p-4 ${
            persisted ? '' : 'opacity-40 pointer-events-none'
          }`}
        >
          <input
            className="col-span-2 sm:col-span-2 bg-white/5 border border-white/15 rounded-md px-3 py-2 text-sm"
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="bg-white/5 border border-white/15 rounded-md px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ClosetItem['category'] })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs bg-white/5 border border-white/15 rounded-md px-3 py-2">
            Formality
            <input
              type="number"
              min={0}
              max={10}
              className="w-12 bg-transparent"
              value={form.formality}
              onChange={(e) => setForm({ ...form, formality: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-2 text-xs bg-white/5 border border-white/15 rounded-md px-3 py-2">
            Warmth
            <input
              type="number"
              min={0}
              max={10}
              className="w-12 bg-transparent"
              value={form.warmth}
              onChange={(e) => setForm({ ...form, warmth: Number(e.target.value) })}
            />
          </label>
          <input
            type="color"
            className="h-full w-full rounded-md border border-white/15 bg-white/5"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
          <button
            type="submit"
            disabled={submitting || !form.name.trim()}
            className="col-span-2 sm:col-span-6 flex items-center justify-center gap-2 rounded-md bg-white text-black font-semibold py-2 text-sm disabled:opacity-50"
          >
            <Plus size={16} /> Add to closet
          </button>
        </form>

        {loading ? (
          <p className="opacity-60 text-sm">Loading closet…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.in_laundry ? 'border-white/10 opacity-50' : 'border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs opacity-60 capitalize">{item.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={!persisted}
                    aria-label={`Delete ${item.name}`}
                    className="opacity-50 hover:opacity-100 disabled:opacity-20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs opacity-60 mt-3">
                  Formality {item.formality}/10 · Warmth {item.warmth}/10
                </p>

                <label className="flex items-center gap-2 mt-3 text-xs">
                  <input
                    type="checkbox"
                    checked={item.in_laundry}
                    disabled={!persisted}
                    onChange={() => handleToggleLaundry(item)}
                  />
                  In laundry
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
