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

export type WearOccasion = 'casual' | 'gym' | 'office' | 'formal' | 'date' | 'lounge';

export interface ClosetItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory' | 'gymwear' | 'full outfit';
  formality: number; // 0 (loungewear) – 10 (black tie)
  warmth: number; // 0 (tank top) – 10 (parka)
  color: string;
  model_url: string;
  in_laundry: boolean;
  image_url?: string;
  gender: 'male' | 'female' | 'unisex';
  wear?: WearOccasion[]; // occasion tags
}
