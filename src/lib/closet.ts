import { getSupabaseClient, type ClosetItem } from './supabase';
import { MOCK_CLOSET } from './mockCloset';

export async function getCloset(): Promise<ClosetItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return MOCK_CLOSET;

  const { data, error } = await supabase.from('closet_items').select('*');
  if (error || !data) return MOCK_CLOSET;
  return data as ClosetItem[];
}

export function isClosetPersisted(): boolean {
  return getSupabaseClient() !== null;
}

export async function addClosetItem(item: ClosetItem): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');

  const { error } = await supabase.from('closet_items').insert(item);
  if (error) throw new Error(error.message);
}

export async function setInLaundry(id: string, inLaundry: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');

  const { error } = await supabase.from('closet_items').update({ in_laundry: inLaundry }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteClosetItem(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');

  const { error } = await supabase.from('closet_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
