'use client';

import { CalendarDays, CloudSun, MapPin, Sparkles } from 'lucide-react';
import type { WeatherSnapshot } from '@/lib/weather';
import type { CalendarEvent } from '@/lib/schedule';

interface ContextBarProps {
  weather: WeatherSnapshot | null;
  nextEvent?: CalendarEvent;
  source: 'google' | 'none' | null;
  onOpenCalendar: () => void;
}

function fahrenheit(tempC: number) {
  return Math.round((tempC * 9) / 5 + 32);
}

export default function ContextBar({ weather, nextEvent, source, onOpenCalendar }: ContextBarProps) {
  return (
    <section className="rounded-2xl border border-peplos-line bg-white p-3 shadow-card sm:p-4">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-peplos-muted">
        <Sparkles size={12} className="text-peplos-pink" /> Today&apos;s context
        <span className="mx-1 h-3 w-px bg-peplos-line" />
        <MapPin size={11} /> New York
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-peplos-panel px-3 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-peplos-pink"><CloudSun size={16} /></span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-peplos-muted">Weather</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-peplos-ink">{weather ? `${fahrenheit(weather.tempC)}°F · ${weather.condition}` : 'Reading the sky…'}</p>
          </div>
        </div>
        <button type="button" onClick={onOpenCalendar} className="flex min-w-0 items-center gap-3 rounded-xl bg-peplos-panel px-3 py-3 text-left transition hover:bg-peplos-line">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-peplos-ink"><CalendarDays size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-peplos-muted">Calendar <span className={`h-1.5 w-1.5 rounded-full ${source === 'google' ? 'bg-peplos-lime' : 'bg-peplos-pink'}`} /></p>
            <p className="mt-0.5 truncate text-sm font-semibold text-peplos-ink">{nextEvent ? `${nextEvent.time} · ${nextEvent.title}` : 'No major event today'}</p>
          </div>
        </button>
      </div>
    </section>
  );
}
