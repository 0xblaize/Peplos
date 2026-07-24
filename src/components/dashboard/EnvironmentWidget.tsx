import { CloudSun } from 'lucide-react';
import type { WeatherSnapshot } from '@/lib/weather';
import type { CalendarEvent } from '@/lib/schedule';

interface EnvironmentWidgetProps {
  weather: WeatherSnapshot;
  nextEvent?: CalendarEvent;
}

export default function EnvironmentWidget({ weather, nextEvent }: EnvironmentWidgetProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl bg-white/90 backdrop-blur px-4 py-2.5 text-sm shadow-sm">
      <div className="flex items-center gap-2 font-semibold">
        <CloudSun size={16} className="text-peplos-pink" />
        {Math.round(weather.tempC)}°C · {weather.condition}
      </div>
      {nextEvent && (
        <div className="text-xs text-neutral-500 truncate">
          {nextEvent.time} · {nextEvent.title}
        </div>
      )}
    </div>
  );
}
