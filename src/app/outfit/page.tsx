'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ClosetItem } from '@/lib/supabase';
import type { DayContext, OutfitOption } from '@/lib/outfitEngine';
import type { WeatherSnapshot } from '@/lib/weather';

const AvatarViewer = dynamic(() => import('@/components/AvatarViewer'), { ssr: false });

interface OutfitResponse {
  weather: WeatherSnapshot;
  context: DayContext;
  outfits: OutfitOption[];
}

export default function OutfitPage() {
  const [data, setData] = useState<OutfitResponse | null>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/outfit')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load outfit');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Coordinating today&apos;s outfit…
      </div>
    );
  }

  const activeOutfit = data.outfits[selected];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-neutral-950 text-white">
      <div className="w-full md:w-2/3 h-1/2 md:h-full">
        {activeOutfit && <AvatarViewer items={activeOutfit.items as ClosetItem[]} />}
      </div>

      <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest opacity-70">
            {data.weather.tempC}°C · {data.weather.condition}
          </p>
          <a href="/wardrobe" className="text-xs underline opacity-75 hover:opacity-100">
            Wardrobe →
          </a>
        </div>
        <h1 className="text-2xl font-bold">Today&apos;s Outfit</h1>

        <div className="space-y-3">
          {data.outfits.map((outfit, index) => (
            <button
              key={outfit.label}
              onClick={() => setSelected(index)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${
                index === selected
                  ? 'border-white bg-white/10'
                  : 'border-white/20 hover:border-white/50'
              }`}
            >
              <p className="font-semibold">{outfit.label}</p>
              <p className="text-sm opacity-75 mt-1">{outfit.rationale}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
