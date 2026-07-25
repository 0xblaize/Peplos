export interface LookHistoryEntry {
  id: string;
  imageUrl: string;
  garments: { name: string; category: string }[];
  createdAt: string;
}

const KEY = 'peplos-look-history';
const MAX_ENTRIES = 24;

export function getLookHistory(): LookHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LookHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addLookHistoryEntry(entry: Omit<LookHistoryEntry, 'id' | 'createdAt'>): LookHistoryEntry[] {
  const next: LookHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [next, ...getLookHistory()].slice(0, MAX_ENTRIES);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(updated));
  }
  return updated;
}
