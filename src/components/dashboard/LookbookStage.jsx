'use client';

import { useState } from 'react';
import { Download, Heart, LoaderCircle, RefreshCcw, ScanFace, Share2, Sparkles } from 'lucide-react';

export default function LookbookStage({ basePhotoUrl, selectedGarments, generatedResult, isGenerating, loadingPhrase, error, favorite, onReroll, onToggleFavorite }) {
  const [shared, setShared] = useState(false);

  async function shareResult() {
    if (!generatedResult) return;
    try {
      if (navigator.share) await navigator.share({ title: 'My Peplos look', text: 'My latest Peplos virtual try-on.', url: generatedResult });
      else await navigator.clipboard.writeText(generatedResult);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      setShared(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-4xl bg-peplos-night text-white shadow-soft lg:min-h-[calc(100vh-2rem)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6"><div><p className="dashboard-eyebrow text-peplos-pink">Lookbook stage</p><h2 className="mt-2 font-['Anton'] text-4xl uppercase leading-[0.9] tracking-[-0.02em] sm:text-5xl">The reveal.</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-peplos-pink"><Sparkles size={17} /></span></div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className={`relative flex min-h-[58vh] flex-1 items-center justify-center overflow-hidden rounded-3xl border p-4 transition ${isGenerating ? 'border-peplos-pink/70 shadow-[0_0_80px_rgba(232,130,180,0.16)]' : 'border-white/10'} bg-[#201d1e]`}>
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-peplos-pink/15 blur-3xl" /><div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-peplos-blue/10 blur-3xl" />
          {generatedResult ? (
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center"><img src={generatedResult} alt="AI-generated lookbook result" className="max-h-[68vh] w-full max-w-2xl rounded-2xl object-contain shadow-[0_28px_100px_rgba(0,0,0,0.5)]" /><div className="mt-4 flex w-full max-w-2xl items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Editorial preview / 01</span><div className="flex items-center gap-2"><button type="button" onClick={onToggleFavorite} className={`rounded-full border p-2.5 transition ${favorite ? 'border-peplos-pink bg-peplos-pink/15 text-peplos-pink' : 'border-white/15 text-white/65 hover:border-peplos-pink hover:text-peplos-pink'}`} aria-label="Favorite look"><Heart size={15} fill={favorite ? 'currentColor' : 'none'} /></button><button type="button" onClick={shareResult} className="rounded-full border border-white/15 p-2.5 text-white/65 transition hover:border-white/40 hover:text-white" aria-label="Share look"><Share2 size={15} /></button><a href={generatedResult} download="peplos-lookbook.svg" className="rounded-full border border-white/15 p-2.5 text-white/65 transition hover:border-white/40 hover:text-white" aria-label="Download look"><Download size={15} /></a><button type="button" onClick={onReroll} className="flex items-center gap-1.5 rounded-full border border-peplos-pink/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-peplos-pink transition hover:bg-peplos-pink hover:text-peplos-ink"><RefreshCcw size={13} /> Reroll</button></div></div><p className="mt-2 h-4 text-right text-[10px] text-peplos-lime">{shared ? 'Link copied to clipboard' : ''}</p></div>
          ) : isGenerating ? (
            <div className="relative z-10 flex flex-col items-center text-center"><div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-peplos-pink/50 bg-peplos-pink/10 shadow-[0_0_100px_rgba(232,130,180,0.28)]"><div className="absolute inset-3 animate-pulse rounded-full border border-peplos-pink/60" /><LoaderCircle className="animate-spin text-peplos-pink" size={30} strokeWidth={1.4} /></div><p className="mt-8 text-lg font-medium tracking-[-0.03em]">{loadingPhrase}</p><p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/35">Peplos fitting engine / live render</p></div>
          ) : (
            <div className="relative z-10 max-w-sm text-center"><div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"><div className="absolute inset-3 rounded-full border border-dashed border-white/15" /><ScanFace size={30} strokeWidth={1.2} className="text-white/55" /></div><p className="mt-8 text-2xl font-medium tracking-[-0.05em]">Select garments to generate today&apos;s lookbook.</p><p className="mt-3 text-sm leading-6 text-white/40">Choose a base model and a clean piece from the utility zone. The final editorial image will live here.</p></div>
          )}
        </div>
        {error && <p className="mt-3 rounded-xl border border-red-300/20 bg-red-300/10 px-3 py-2 text-xs text-red-200">{error}</p>}
        <div className="mt-4 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2">{basePhotoUrl && <img src={basePhotoUrl} alt="Base model" className="h-8 w-7 rounded-md object-cover ring-1 ring-white/15" />}<div className="min-w-0"> <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Inputs in frame</p><p className="truncate text-xs text-white/75">{selectedGarments.length ? selectedGarments.map((item) => item.name).join(' + ') : 'Waiting for your edit'}</p></div></div><span className="shrink-0 text-[9px] uppercase tracking-[0.16em] text-white/30">One look at a time</span></div>
      </div>
    </section>
  );
}
