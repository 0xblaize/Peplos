'use client';

import dynamic from 'next/dynamic';
import { Sparkles, Check } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';
import type { WeatherSnapshot } from '@/lib/weather';
import type { CalendarEvent } from '@/lib/mockCalendar';
import EnvironmentWidget from './EnvironmentWidget';

const AvatarViewer = dynamic(() => import('@/components/AvatarViewer'), { ssr: false });

interface StageProps {
  weather: WeatherSnapshot;
  nextEvent?: CalendarEvent;
  activeItems: ClosetItem[];
  outfitLabel?: string;
  spinTrigger: number;
  onGenerate: () => void;
  onConfirm: () => void;
  confirming: boolean;
}

export default function Stage({
  weather,
  nextEvent,
  activeItems,
  outfitLabel,
  spinTrigger,
  onGenerate,
  onConfirm,
  confirming,
}: StageProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="relative flex-1 min-h-[320px]">
        <EnvironmentWidget weather={weather} nextEvent={nextEvent} />
        <AvatarViewer items={activeItems} spinTrigger={spinTrigger} />
      </div>

      <div className="px-6 pb-6 pt-2 space-y-4">
        <button
          onClick={onGenerate}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-peplos-pink text-white font-bold uppercase tracking-wide py-4 text-sm sm:text-base transition-transform hover:scale-[1.02] active:scale-[0.99]"
        >
          <Sparkles size={18} />
          Generate Today&apos;s Fit
        </button>

        {activeItems.length > 0 && (
          <div className="space-y-2">
            {outfitLabel && (
              <p className="text-xs uppercase tracking-widest text-neutral-400">{outfitLabel}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {activeItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
              ))}
            </div>
            <button
              onClick={onConfirm}
              disabled={confirming}
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-neutral-900 text-neutral-900 font-semibold py-2.5 text-sm disabled:opacity-40"
            >
              <Check size={16} />
              {confirming ? 'Confirming…' : 'Confirm Outfit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
