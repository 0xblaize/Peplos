'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ClosetItem } from '@/lib/supabase';
import { getCloset, isClosetPersisted, setInLaundry, deleteClosetItem } from '@/lib/closet';
import Sandbox from '@/components/dashboard/Sandbox';
import LookbookStage from '@/components/dashboard/LookbookStage';
import EditItemDrawer from '@/components/dashboard/EditItemDrawer';
import CalendarSyncModal from '@/components/dashboard/CalendarSyncModal';
import type { ClosetFilter } from '@/components/dashboard/FilterPills';

export default function DashboardPage() {
  const persisted = isClosetPersisted();
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [filter, setFilter] = useState<ClosetFilter>('all');
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const refreshCloset = useCallback(() => {
    getCloset().then(setCloset);
  }, []);

  useEffect(refreshCloset, [refreshCloset]);

  function handleToggleDirty(item: ClosetItem) {
    setInLaundry(item.id, !item.in_laundry).then(refreshCloset);
  }

  function handleDelete(id: string) {
    deleteClosetItem(id).then(refreshCloset);
  }

  return (
    <div className="min-h-screen bg-peplos-bg">
      <div className="flex flex-col md:flex-row">
        <div className="order-2 w-full md:order-1 md:w-[58%]">
          <Sandbox
            closet={closet}
            persisted={persisted}
            filter={filter}
            onFilterChange={setFilter}
            onAdded={refreshCloset}
            onOpenItem={setSelectedItem}
            onWearNow={() => undefined}
            onToggleDirty={handleToggleDirty}
            onDelete={handleDelete}
            onOpenCalendarModal={() => setCalendarModalOpen(true)}
          />
        </div>

        <div className="order-1 w-full border-b border-neutral-200 p-4 md:order-2 md:sticky md:top-0 md:h-screen md:w-[42%] md:border-b-0 md:border-l md:p-6">
          <LookbookStage />
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
