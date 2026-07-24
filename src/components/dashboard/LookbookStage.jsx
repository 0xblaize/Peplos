'use client';

import { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Sparkles, Upload } from 'lucide-react';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

function UploadCard({ label, imageUrl, onSelect }) {
  const inputRef = useRef(null);

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    onSelect(await readImage(file));
    event.target.value = '';
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative flex aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#f4f1ef] text-left transition hover:border-black/30 hover:shadow-lg"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      {imageUrl ? (
        <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="m-auto flex flex-col items-center gap-3 px-4 text-center text-neutral-500">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <ImagePlus size={21} strokeWidth={1.7} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-neutral-900">{label}</span>
            <span className="mt-1 block text-xs">Upload a clear image</span>
          </span>
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-10 text-xs font-semibold uppercase tracking-[0.18em] text-white">
        {imageUrl ? `Change ${label}` : label}
      </span>
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
      const response = await fetch('/api/generate-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userImageUrl: userImage, garmentImageUrl: selectedGarment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Generation failed.');
      setGeneratedResult(data.resultImageUrl);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[2rem] bg-[#111] text-white shadow-2xl lg:flex-row">
      <div className="flex w-full flex-col justify-between p-6 sm:p-8 lg:w-[42%] lg:p-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e882b4]">Virtual try-on</p>
          <h1 className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
            See the fit before you wear it.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
            Give Peplos a photo of you and today&apos;s garment. Our fitting engine will create a
            polished lookbook preview in seconds.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <UploadCard label="Your Photo" imageUrl={userImage} onSelect={setUserImage} />
          <UploadCard label="Today&apos;s Garment" imageUrl={selectedGarment} onSelect={setSelectedGarment} />
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={generateFit}
            disabled={!userImage || !selectedGarment || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e882b4] px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-[#f09bc3] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {isLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isLoading ? 'Generating your fit' : "Generate today's fit"}
          </button>
          {error && <p className="mt-3 text-center text-xs text-red-300">{error}</p>}
          {!userImage || !selectedGarment ? (
            <p className="mt-3 text-center text-xs text-white/35">Add both images to unlock generation.</p>
          ) : null}
        </div>
      </div>

      <div className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden bg-[#191919] p-6 sm:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#e882b4]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#6eb5ff]/15 blur-3xl" />

        {generatedResult ? (
          <img
            src={generatedResult}
            alt="AI-generated virtual try-on result"
            className="relative z-10 max-h-[560px] w-full max-w-md rounded-2xl object-cover shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          />
        ) : isLoading ? (
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#e882b4]/40 bg-[#e882b4]/10 shadow-[0_0_80px_rgba(232,130,180,0.28)]">
              <div className="absolute inset-3 animate-pulse rounded-full border border-[#e882b4]/50" />
              <LoaderCircle className="animate-spin text-[#e882b4]" size={30} strokeWidth={1.5} />
            </div>
            <p className="mt-8 text-lg font-medium tracking-[-0.02em]">AI is tailoring your outfit...</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">Constructing your lookbook</p>
          </div>
        ) : (
          <div className="relative z-10 max-w-xs text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <Upload size={22} strokeWidth={1.5} className="text-white/60" />
            </div>
            <p className="mt-6 text-xl font-medium tracking-[-0.03em]">Ready to generate your lookbook</p>
            <p className="mt-3 text-sm leading-6 text-white/40">
              Your generated outfit will appear here as a high-resolution try-on preview.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
