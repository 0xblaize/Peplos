import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
