'use client';

import { useSession } from 'next-auth/react';
import { Settings } from 'lucide-react';
import type { ClosetItem } from '@/lib/supabase';

interface ContextHeaderProps {
  closet: ClosetItem[];
  onOpenCalendarModal: () => void;
}

export default function ContextHeader({ closet, onOpenCalendarModal }: ContextHeaderProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0]?.toUpperCase() ?? 'THERE';

  const dirty = closet.filter((item) => item.in_laundry).length;
  const clean = closet.length - dirty;

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1
          style={{ fontFamily: "'Anton', sans-serif" }}
          className="text-3xl sm:text-4xl uppercase tracking-tight text-neutral-900"
        >
          Good morning, {firstName}.
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          You have {clean} item{clean === 1 ? '' : 's'} clean · {dirty} in laundry.
        </p>
      </div>
      <button
        onClick={onOpenCalendarModal}
        aria-label="Calendar sync settings"
        className="shrink-0 rounded-full border border-neutral-200 p-2.5 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
      >
        <Settings size={18} />
      </button>
    </div>
  );
}
