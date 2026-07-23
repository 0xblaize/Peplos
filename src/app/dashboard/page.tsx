'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ClosetItem } from '@/lib/supabase';
import type { DayContext, OutfitOption } from '@/lib/outfitEngine';
import type { WeatherSnapshot } from '@/lib/weather';
import type { CalendarEvent } from '@/lib/mockCalendar';
import { getCloset, isClosetPersisted, setInLaundry, deleteClosetItem } from '@/lib/closet';
import Stage from '@/components/dashboard/Stage';
import Sandbox from '@/components/dashboard/Sandbox';
import EditItemDrawer from '@/components/dashboard/EditItemDrawer';
import CalendarSyncModal from '@/components/dashboard/CalendarSyncModal';
import type { ClosetFilter } from '@/components/dashboard/FilterPills';

interface OutfitResponse {
  weather: WeatherSnapshot;
  schedule: CalendarEvent[];
  scheduleSource: 'google' | 'mock';
  context: DayContext;
  outfits: OutfitOption[];
}

export default function DashboardPage() {
  const { status } = useSession();
  const persisted = isClosetPersisted();

  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [outfitData, setOutfitData] = useState<OutfitResponse | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [wornOverrides, setWornOverrides] = useState<Partial<Record<ClosetItem['category'], ClosetItem>>>({});
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [filter, setFilter] = useState<ClosetFilter>('all');
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const refreshCloset = useCallback(() => {
    getCloset().then(setCloset);
  }, []);

  useEffect(refreshCloset, [refreshCloset]);

  useEffect(() => {
    if (status === 'loading') return;
    fetch('/api/outfit')
      .then((res) => res.json())
      .then(setOutfitData);
  }, [status]);

  const activeOutfit = outfitData ? outfitData.outfits[cycleIndex % outfitData.outfits.length] : undefined;

  const activeItems = (() => {
    if (!activeOutfit) return [];
    const merged = new Map<ClosetItem['category'], ClosetItem>();
    for (const item of activeOutfit.items) merged.set(item.category, item);
    for (const [category, override] of Object.entries(wornOverrides)) {
      if (override) merged.set(category as ClosetItem['category'], override);
    }
    return Array.from(merged.values());
  })();

  const handleGenerate = () => {
    if (!outfitData) return;
    setCycleIndex((i) => i + 1);
    setWornOverrides({});
    setSpinTrigger((t) => t + 1);
  };

  const handleWearNow = (item: ClosetItem) => {
    setWornOverrides((prev) => ({ ...prev, [item.category]: item }));
    setSpinTrigger((t) => t + 1);
  };

  const handleToggleDirty = (item: ClosetItem) => {
    setInLaundry(item.id, !item.in_laundry).then(refreshCloset);
  };

  const handleDelete = (id: string) => {
    deleteClosetItem(id).then(refreshCloset);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await Promise.all(activeItems.map((item) => setInLaundry(item.id, true)));
      refreshCloset();
    } finally {
      setConfirming(false);
    }
  };

  if (!outfitData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-peplos-bg text-neutral-500">
        Coordinating today&apos;s outfit…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-peplos-bg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-[62%] order-2 md:order-1">
          <Sandbox
            closet={closet}
            persisted={persisted}
            filter={filter}
            onFilterChange={setFilter}
            onAdded={refreshCloset}
            onOpenItem={setSelectedItem}
            onWearNow={handleWearNow}
            onToggleDirty={handleToggleDirty}
            onDelete={handleDelete}
            onOpenCalendarModal={() => setCalendarModalOpen(true)}
          />
        </div>

        <div className="w-full md:w-[38%] order-1 md:order-2 md:sticky md:top-0 md:h-screen border-b md:border-b-0 md:border-l border-neutral-200">
          <Stage
            weather={outfitData.weather}
            nextEvent={outfitData.schedule[0]}
            activeItems={activeItems}
            outfitLabel={activeOutfit?.label}
            spinTrigger={spinTrigger}
            onGenerate={handleGenerate}
            onConfirm={handleConfirm}
            confirming={confirming}
          />
        </div>
      </div>

      <EditItemDrawer
        item={selectedItem}
        disabled={!persisted}
        onClose={() => setSelectedItem(null)}
        onSaved={refreshCloset}
      />

      <CalendarSyncModal open={calendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
    </div>
  );
}
