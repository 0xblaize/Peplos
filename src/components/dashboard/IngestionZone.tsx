'use client';

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ClipboardEvent } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import type { ClosetItem, WearOccasion } from '@/lib/supabase';
import { addClosetItem } from '@/lib/closet';
import { getSupabaseClient } from '@/lib/supabase';

const CATEGORIES: ClosetItem['category'][] = ['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'gymwear', 'full outfit'];
const WEAR_OPTIONS: WearOccasion[] = ['casual', 'gym', 'office', 'formal', 'date', 'lounge'];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
}

type Stage = 'idle' | 'processing' | 'form';

interface IngestionZoneProps {
  disabled: boolean;
  onAdded: () => void;
}

/**
 * Captures a garment photo via drag-and-drop, clipboard paste, or a file
 * picker. There's no vision model wired up to auto-detect background
 * removal or tags, so after a brief "processing" beat this hands the
 * user a pre-filled form (name guessed from the filename) to confirm —
 * the same mock-until-configured pattern the rest of the app uses for
 * weather/calendar/closet data.
 */
export default function IngestionZone({ disabled, onAdded }: IngestionZoneProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'top' as ClosetItem['category'],
    formality: 5,
    warmth: 5,
    color: '#888888',
    gender: 'unisex' as ClosetItem['gender'],
    wear: [] as WearOccasion[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureImage = useCallback((incoming: File) => {
    setFile(incoming);
    setPreviewUrl(URL.createObjectURL(incoming));
    setForm((prev) => ({ ...prev, name: stripExtension(incoming.name) }));
    setStage('processing');
    window.setTimeout(() => setStage('form'), 800);
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped?.type.startsWith('image/')) captureImage(dropped);
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
    const pasted = item?.getAsFile();
    if (pasted) captureImage(pasted);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) captureImage(selected);
    e.target.value = '';
  };

  const reset = () => {
    setStage('idle');
    setPreviewUrl(null);
    setFile(null);
    setForm({ name: '', category: 'top', formality: 5, warmth: 5, color: '#888888', gender: 'unisex', wear: [] });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      let image_url = '';
      const supabase = getSupabaseClient();
      if (supabase && file) {
        const path = `uploads/${Date.now()}-${slugify(file.name)}`;
        const { error: uploadError } = await supabase.storage.from('garments').upload(path, file);
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        image_url = supabase.storage.from('garments').getPublicUrl(path).data.publicUrl;
      }

      await addClosetItem({
        id: `${slugify(form.name)}-${Date.now().toString(36)}`,
        name: form.name.trim(),
        category: form.category,
        formality: form.formality,
        warmth: form.warmth,
        color: form.color,
        model_url: '',
        in_laundry: false,
        image_url,
        gender: form.gender,
        wear: form.wear,
      });

      reset();
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  if (stage === 'form') {
    return (
      <div className="flex flex-col gap-5 rounded-2xl border border-peplos-line bg-peplos-panel/60 p-4 sm:p-5">
        {previewUrl && (
          <div className="relative w-full sm:w-40 shrink-0">
            <img
              src={previewUrl}
              alt="New garment preview"
              className="w-full h-52 sm:h-48 object-cover rounded-xl bg-peplos-bg shadow-md"
            />
            {form.category === 'full outfit' && (
              <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-peplos-ink/80 backdrop-blur-sm px-2 py-1 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-peplos-pink">
                Full outfit — counts as 1 complete look
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <input
            className="dashboard-input col-span-2 mt-0 sm:col-span-3"
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="rounded-xl border border-peplos-line bg-white px-3.5 py-3 text-sm text-peplos-ink"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ClosetItem['category'] })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-peplos-line bg-white px-3.5 py-3 text-sm text-peplos-ink"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as ClosetItem['gender'] })}
          >
            <option value="unisex">Unisex</option>
            <option value="female">Girl</option>
            <option value="male">Boy</option>
          </select>
          <label className="flex items-center justify-between rounded-xl border border-peplos-line bg-white px-3 py-3 text-xs text-peplos-muted">
            <span>Formality</span>
            <input
              type="number"
              min={0}
              max={10}
              className="w-12 rounded-lg border border-peplos-line bg-peplos-bg text-center text-sm font-medium text-peplos-ink"
              value={form.formality}
              onChange={(e) => setForm({ ...form, formality: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-peplos-line bg-white px-3 py-3 text-xs text-peplos-muted">
            <span>Warmth</span>
            <input
              type="number"
              min={0}
              max={10}
              className="w-12 rounded-lg border border-peplos-line bg-peplos-bg text-center text-sm font-medium text-peplos-ink"
              value={form.warmth}
              onChange={(e) => setForm({ ...form, warmth: Number(e.target.value) })}
            />
          </label>
          {/* Wear / Occasion tags */}
          <div className="col-span-2 sm:col-span-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">Wear occasions</p>
            <div className="flex flex-wrap gap-1.5">
              {WEAR_OPTIONS.map((w) => {
                const active = form.wear.includes(w);
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        wear: active
                          ? form.wear.filter((x) => x !== w)
                          : [...form.wear, w],
                      })
                    }
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] border transition ${
                      active
                        ? 'bg-peplos-ink text-white border-peplos-ink'
                        : 'bg-white text-peplos-muted border-peplos-line hover:border-peplos-ink hover:text-peplos-ink'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            type="color"
            className="col-span-2 h-11 w-full cursor-pointer rounded-xl border border-peplos-line bg-white sm:col-span-3"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
          {error && <p className="col-span-2 sm:col-span-3 text-xs text-red-600">{error}</p>}
          <div className="col-span-2 sm:col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="flex-1 rounded-full bg-peplos-ink py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {submitting ? 'Adding…' : 'Add to closet'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-peplos-line bg-white px-5 py-3 text-sm text-peplos-muted transition hover:border-peplos-ink hover:text-peplos-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      className={`flex min-h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors outline-none ${
        dragActive ? 'border-peplos-pink bg-peplos-pink/10' : 'border-peplos-line bg-white/70 hover:border-peplos-pink/60'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {stage === 'processing' ? (
        <>
          <Loader2 size={28} className="animate-spin text-peplos-pink" />
          <p className="text-sm font-medium text-neutral-600">Reading your garment…</p>
        </>
      ) : (
        <>
          <UploadCloud size={28} className="text-neutral-400" />
          <p className="text-sm font-semibold text-neutral-700">
            Just copy a photo from your phone and press Ctrl+V here.
          </p>
          <p className="text-xs text-neutral-400">or drag an image in, or</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold underline text-peplos-pink"
          >
            browse files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </>
      )}
    </div>
  );
}
