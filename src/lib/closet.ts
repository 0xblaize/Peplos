import { supabase, type ClosetItem } from './supabase';
import { MOCK_CLOSET } from './mockCloset';

export async function getCloset(): Promise<ClosetItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_CLOSET;
  }

  const { data, error } = await supabase.from('closet_items').select('*');
  if (error || !data) return MOCK_CLOSET;
  return data as ClosetItem[];
}
