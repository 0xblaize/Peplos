'use client';

import { useRef, useState } from 'react';
import { Download, ImagePlus, LoaderCircle, RefreshCcw, ScanFace, Shirt, Sparkles } from 'lucide-react';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

function UploadCard({ eyebrow, label, imageUrl, onSelect, icon: Icon }) {
  const inputRef = useRef(null);

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    onSelect(await readImage(file));
    event.target.value = '';
  }

  return (
    <button type="button" onClick={() => inputRef.current?.click()} className="group relative flex min-h-40 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] text-left transition hover:border-peplos-pink/70 hover:bg-white/[0.1]">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleChange} className="hidden" />
      {imageUrl ? <img src={imageUrl} alt={label} className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" /> : <div className="m-auto flex flex-col items-center px-3 text-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70"><Icon size={18} strokeWidth={1.5} /></span><span className="mt-3 text-xs font-semibold text-white">{label}</span><span className="mt-1 text-[10px] text-white/35">Tap to upload</span></div>}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8"><span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-peplos-pink">{eyebrow}</span><span className="mt-1 block truncate text-xs font-semibold text-white">{imageUrl ? `Change ${label}` : label}</span></span>
    </button>
  );
}

export default function LookbookStage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userImage, setUserImage] = useState('');
  const [selectedGarment, setSelectedGarment] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState('');

  async function generateFit() {
    if (!userImage || !selectedGarment || isLoading) return;
    setError('');
    setGeneratedResult(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-fit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userImageUrl: userImage, garmentImageUrl: selectedGarment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Generation failed.');
      setGeneratedResult(data.resultImageUrl);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setGeneratedResult(null);
    setError('');
  }

  return (
    <section className="overflow-hidden rounded-4xl bg-peplos-night text-white shadow-soft">
      <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="dashboard-eyebrow text-peplos-pink">03 / Virtual fitting room</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">The lookbook stage.</h2></div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-peplos-pink"><Sparkles size={16} /></span>
        </div>
        <div className="mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35"><span className="flex items-center gap-1.5 text-white/80"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-peplos-pink text-[9px] text-peplos-ink">1</span> Add photos</span><span className="h-px flex-1 bg-white/10" /><span className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15">2</span> Generate</span><span className="h-px flex-1 bg-white/10" /><span className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15">3</span> Step out</span></div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#201d1e] p-4 sm:min-h-[470px] sm:p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-peplos-pink/15 blur-3xl" /><div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-peplos-blue/10 blur-3xl" />
          {generatedResult ? <div className="relative z-10 w-full max-w-sm"><img src={generatedResult} alt="AI-generated virtual try-on result" className="max-h-[520px] w-full rounded-2xl object-cover shadow-[0_24px_80px_rgba(0,0,0,0.45)]" /><div className="mt-3 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Your generated edit</span><div className="flex gap-2"><button type="button" onClick={reset} className="rounded-full border border-white/15 p-2 text-white/60 transition hover:border-white/40 hover:text-white" aria-label="Create another look"><RefreshCcw size={14} /></button><a href={generatedResult} download="peplos-fit.svg" className="rounded-full border border-white/15 p-2 text-white/60 transition hover:border-white/40 hover:text-white" aria-label="Download generated look"><Download size={14} /></a></div></div></div> : isLoading ? <div className="relative z-10 flex flex-col items-center text-center"><div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-peplos-pink/40 bg-peplos-pink/10 shadow-[0_0_80px_rgba(232,130,180,0.25)]"><div className="absolute inset-3 animate-pulse rounded-full border border-peplos-pink/50" /><LoaderCircle className="animate-spin text-peplos-pink" size={27} strokeWidth={1.5} /></div><p className="mt-7 text-base font-medium tracking-[-0.02em]">AI is tailoring your outfit...</p><p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/35">Constructing your lookbook</p></div> : <div className="relative z-10 max-w-[240px] text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"><ScanFace size={24} strokeWidth={1.3} /></div><p className="mt-6 text-xl font-medium tracking-[-0.04em]">Ready when you are.</p><p className="mt-3 text-xs leading-5 text-white/40">Your high-resolution try-on preview will appear here.</p></div>}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row"><UploadCard eyebrow="01 / You" label="Your photo" imageUrl={userImage} onSelect={setUserImage} icon={ScanFace} /><UploadCard eyebrow="02 / Garment" label="Today&apos;s garment" imageUrl={selectedGarment} onSelect={setSelectedGarment} icon={Shirt} /></div>
        <button type="button" onClick={generateFit} disabled={!userImage || !selectedGarment || isLoading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-peplos-pink px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-peplos-ink transition hover:bg-[#f09bc3] disabled:cursor-not-allowed disabled:opacity-30"><Sparkles size={16} />{isLoading ? 'Generating your fit' : "Generate today's fit"}</button>
        {error && <p className="mt-3 text-center text-xs text-red-300">{error}</p>}
        {!userImage || !selectedGarment ? <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/30"><ImagePlus size={12} /> Add both images to unlock the stage.</p> : null}
      </div>
    </section>
  );
}
