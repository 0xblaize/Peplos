'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ChevronRight, Sparkles } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import type { WeatherSnapshot } from '@/lib/weather';
import type { CalendarEvent } from '@/lib/schedule';
import { getCloset, isClosetPersisted, setInLaundry, deleteClosetItem } from '@/lib/closet';
import AuthButton from '@/components/AuthButton';
import Sandbox from '@/components/dashboard/Sandbox';
import LookbookStage from '@/components/dashboard/LookbookStage';
import EditItemDrawer from '@/components/dashboard/EditItemDrawer';
import CalendarSyncModal from '@/components/dashboard/CalendarSyncModal';
import type { ClosetFilter } from '@/components/dashboard/FilterPills';

interface ContextResponse {
  weather: WeatherSnapshot;
  schedule: CalendarEvent[];
  source: 'google' | 'none';
}

const LOADING_PHRASES = [
  'Analyzing weather constraints…',
  'Synthesizing fabric physics…',
  'Rendering editorial lighting…',
];

export default function DashboardPage() {
  const persisted = isClosetPersisted();
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [filter, setFilter] = useState<ClosetFilter>('all');
  const [selectedGarments, setSelectedGarments] = useState<ClosetItem[]>([]);
  const [basePhotoUrl, setBasePhotoUrl] = useState('');
  const [context, setContext] = useState<ContextResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [generationError, setGenerationError] = useState('');
  const [favorite, setFavorite] = useState(false);

  const refreshCloset = useCallback(() => {
    getCloset().then(setCloset);
  }, []);

  useEffect(refreshCloset, [refreshCloset]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('peplos-base-photo');
      if (saved) {
        setBasePhotoUrl(saved);
      } else {
        setBasePhotoUrl('https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png');
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/context?city=New%20York')
      .then((response) => response.json())
      .then((data: ContextResponse) => setContext(data))
      .catch(() => setContext(null));
  }, []);

  useEffect(() => {
    if (!isGenerating) return undefined;
    const timer = window.setInterval(() => setLoadingPhraseIndex((index) => (index + 1) % LOADING_PHRASES.length), 1800);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  function handleSelectGarment(item: ClosetItem) {
    if (item.in_laundry) return;
    setSelectedGarments((current) => {
      // Deselect if already selected
      if (current.some((s) => s.id === item.id)) return current.filter((s) => s.id !== item.id);
      // Full outfit = complete look on its own, always replaces current selection
      if (item.category === 'full outfit') return [item];
      // If a full outfit is already selected, replace it
      if (current.some((s) => s.category === 'full outfit')) return [item];
      // First selection
      if (current.length === 0) return [item];
      // Allow pairing a top with a bottom (max 2)
      const canPair =
        current.length === 1 &&
        ((current[0].category === 'top' && item.category === 'bottom') ||
          (current[0].category === 'bottom' && item.category === 'top'));
      return canPair ? [...current, item] : [item];
    });
    setGeneratedResult(null);
    setFavorite(false);
  }

  function removeGarment(item: ClosetItem) {
    setSelectedGarments((current) => current.filter((selected) => selected.id !== item.id));
  }

  async function generateLook() {
    if (!basePhotoUrl || selectedGarments.length === 0 || isGenerating) return;
    setIsGenerating(true);
    setGenerationError('');
    setGeneratedResult(null);
    setFavorite(false);
    try {
      const nextEvent = context?.schedule[0];
      const contextPrompt = [
        context?.weather ? `${Math.round((context.weather.tempC * 9) / 5 + 32)}°F ${context.weather.condition}` : '',
        nextEvent ? `for ${nextEvent.title} at ${nextEvent.time}` : '',
      ].filter(Boolean).join(', ');
      const response = await fetch('/api/generate-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageUrl: basePhotoUrl,
          garments: selectedGarments.map((item) => ({
            name: item.name,
            category: item.category,
            imageUrl: item.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
          })),
          contextPrompt
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Unable to generate this look.');
      setGeneratedResult(data.resultImageUrl);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unable to generate this look.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToggleDirty(item: ClosetItem) {
    setInLaundry(item.id, !item.in_laundry).then(refreshCloset);
  }

  function handleDelete(id: string) {
    setSelectedGarments((current) => current.filter((item) => item.id !== id));
    deleteClosetItem(id).then(refreshCloset);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-peplos-bg">
      <header className="relative z-20 bg-peplos-night text-white">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3.5 sm:px-8 sm:py-4 lg:px-10"><a href="/" className="flex min-w-0 items-center gap-2.5"><span className="shrink-0 font-['Anton'] text-lg tracking-[0.08em] sm:text-xl">PEPLOS</span><span className="hidden h-4 w-px bg-white/20 sm:block" /><span className="hidden truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45 sm:block">Generative wardrobe studio</span></a><div className="flex min-w-0 items-center gap-2 sm:gap-6"><span className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-peplos-lime" />{persisted ? 'Closet synced' : 'Demo workspace'}</span><div className="max-w-[190px] truncate sm:max-w-none"><AuthButton /></div></div></div>
        <div className="h-px bg-white/10" /><div className="mx-auto flex max-w-[1800px] items-center justify-between px-5 py-3 sm:px-8 lg:px-10"><div className="flex items-center gap-2 text-xs text-white/45"><span>Workspace</span><ChevronRight size={13} /><span className="text-white/85">Lookbook studio</span></div><a href="#closet" className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 transition hover:text-white sm:flex">Browse utility zone <ArrowUpRight size={13} /></a></div>
      </header>

      <main className="mx-auto max-w-[1800px] px-2.5 py-3 sm:px-5 sm:py-5 lg:px-7">
        <div className="mb-3 flex items-center gap-2 px-1 text-[9px] font-bold uppercase tracking-[0.22em] text-peplos-muted sm:mb-4 sm:text-[10px] sm:tracking-[0.28em]"><Sparkles size={12} className="text-peplos-pink sm:h-[13px] sm:w-[13px]" /> The daily lookbook</div>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(360px,35%)_minmax(0,65%)] lg:gap-5">
          <section id="closet" className="dashboard-scroll min-h-0 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1"><Sandbox closet={closet} persisted={persisted} filter={filter} selectedGarments={selectedGarments} basePhotoUrl={basePhotoUrl} weather={context?.weather ?? null} nextEvent={context?.schedule[0]} contextSource={context?.source ?? null} isGenerating={isGenerating} onFilterChange={setFilter} onAdded={refreshCloset} onSelectGarment={handleSelectGarment} onOpenItem={setSelectedItem} onToggleDirty={handleToggleDirty} onDelete={handleDelete} onBasePhotoChange={setBasePhotoUrl} onGenerate={generateLook} onRemoveGarment={removeGarment} onOpenCalendarModal={() => setCalendarModalOpen(true)} /></section>
          <aside className="min-w-0 lg:sticky lg:top-3"><LookbookStage basePhotoUrl={basePhotoUrl} selectedGarments={selectedGarments} generatedResult={generatedResult} isGenerating={isGenerating} loadingPhrase={LOADING_PHRASES[loadingPhraseIndex]} error={generationError} favorite={favorite} onReroll={generateLook} onToggleFavorite={() => setFavorite((current) => !current)} /></aside>
        </div>
      </main>

      <EditItemDrawer item={selectedItem} disabled={!persisted} onClose={() => setSelectedItem(null)} onSaved={refreshCloset} /><CalendarSyncModal open={calendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
    </div>
  );
}
