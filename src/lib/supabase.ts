import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export interface ClosetItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory';
  formality: number; // 0 (loungewear) – 10 (black tie)
  warmth: number; // 0 (tank top) – 10 (parka)
  color: string;
  model_url: string;
  in_laundry: boolean;
}
