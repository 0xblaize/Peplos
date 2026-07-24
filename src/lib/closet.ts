import { getSupabaseClient, type ClosetItem } from './supabase';

export async function getCloset(gender?: 'male' | 'female'): Promise<ClosetItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase.from('closet_items').select('*');
  if (gender) query = query.in('gender', ['unisex', gender]);

  const { data, error } = await query;
  if (error || !data) return [];
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

export async function updateClosetItem(id: string, patch: Partial<ClosetItem>): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');

  const { error } = await supabase.from('closet_items').update(patch).eq('id', id);
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
