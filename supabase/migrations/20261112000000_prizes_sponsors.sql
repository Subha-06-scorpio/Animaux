-- ANIMAUX'26 — prize badges on events + sponsors. Safe to run more than once.
-- Run after the earlier migrations, in Supabase → SQL Editor.

alter table public.events add column if not exists prize text not null default '';

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null default '',
  logo_url text not null default '',
  website text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch on public.sponsors;
create trigger touch before update on public.sponsors for each row execute function public.touch_updated_at();

alter table public.sponsors enable row level security;
drop policy if exists "public read visible" on public.sponsors;
create policy "public read visible" on public.sponsors for select to anon, authenticated using (visible);
