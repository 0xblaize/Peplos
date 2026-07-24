-- Peplos closet inventory schema.
-- Run this in the Supabase SQL editor (or via `supabase db push`) once
-- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set.

create table if not exists closet_items (
  id text primary key,
  name text not null,
  category text not null check (category in ('top', 'bottom', 'outerwear', 'footwear', 'accessory', 'gymwear', 'full outfit')),
  formality smallint not null check (formality between 0 and 10),
  warmth smallint not null check (warmth between 0 and 10),
  color text not null,
  model_url text not null default '',
  in_laundry boolean not null default false,
  created_at timestamptz not null default now()
);

alter table closet_items add column if not exists image_url text;

alter table closet_items add column if not exists gender text not null default 'unisex'
  check (gender in ('male', 'female', 'unisex'));

alter table closet_items add column if not exists wear text[] not null default '{}';

alter table closet_items enable row level security;

-- Hackathon-simple policies: anon key can fully manage the closet.
-- Tighten to `auth.uid() = user_id` once accounts exist.
drop policy if exists "anon can read closet" on closet_items;
drop policy if exists "anon can insert closet" on closet_items;
drop policy if exists "anon can update closet" on closet_items;
drop policy if exists "anon can delete closet" on closet_items;
drop policy if exists "public read garments" on storage.objects;

create policy "anon can read closet" on closet_items
  for select using (true);

create policy "anon can insert closet" on closet_items
  for insert with check (true);

create policy "anon can update closet" on closet_items
  for update using (true);

create policy "anon can delete closet" on closet_items
  for delete using (true);

-- Storage bucket for garment .glb/.gltf models.
insert into storage.buckets (id, name, public)
values ('garments', 'garments', true)
on conflict (id) do nothing;

create policy "public read garments" on storage.objects
  for select using (bucket_id = 'garments');

create policy "public insert garments" on storage.objects
  for insert with check (bucket_id = 'garments');

create policy "public update garments" on storage.objects
  for update using (bucket_id = 'garments');

create policy "public delete garments" on storage.objects
  for delete using (bucket_id = 'garments');
