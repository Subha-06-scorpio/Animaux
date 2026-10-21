-- ANIMAUX 2026 — initial schema
-- Run in Supabase: SQL Editor → paste → Run   (or `supabase db push`)
--
-- Security model
--   * RLS is ON for every table.
--   * The anon (public) key can only SELECT published, visible content.
--   * Registrations, enquiries and admin_users have NO anon policies: they are
--     only reachable from the Next.js server using the service-role key,
--     after server-side validation, rate limiting and role checks.

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------- content ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('competition','workshop','quiz','creative','game')),
  short_description text not null default '',
  description text not null default '',
  poster_url text not null default '',
  event_date text not null default '',
  start_time text not null default '',
  end_time text not null default '',
  venue text not null default '',
  participation text not null default 'individual' check (participation in ('individual','team')),
  team_min int not null default 1,
  team_max int not null default 1,
  fee int,
  deadline timestamptz not null,
  rules jsonb not null default '[]',
  eligibility text not null default '',
  coordinator_name text not null default '',
  coordinator_phone text not null default '',
  coordinator_email text not null default '',
  registration_open boolean not null default true,
  visible boolean not null default true,
  capacity int,
  extra_questions jsonb not null default '[]',
  sort_order int not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (team_max >= team_min)
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  "group" text not null check ("group" in ('faculty','leadership','organizing')),
  section text not null,
  bio text not null default '',
  photo_url text not null default '',
  social_url text not null default '',
  spirit_animal text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'image' check (type in ('image','video')),
  url text not null default '',
  thumbnail_url text not null default '',
  caption text not null default '',
  category text not null,
  taken_on text not null default '',
  event_label text not null default '',
  aspect text not null default 'landscape' check (aspect in ('portrait','landscape','square')),
  visible boolean not null default true,
  sort_order int not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  published_on text not null default '',
  pinned boolean not null default false,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  day int not null default 1,
  time text not null default '',
  end_time text not null default '',
  title text not null,
  venue text not null default '',
  kind text not null default 'event' check (kind in ('ceremony','event','break','other')),
  event_slug text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.festival_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------- participant data (private) ----------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  reg_code text not null unique,
  event_id uuid references public.events(id) on delete set null,
  event_name text not null,
  full_name text not null,
  institution text not null,
  department text not null,
  year text not null,
  email text not null,
  phone text not null,
  phone_key text generated always as (right(regexp_replace(phone, '\D', '', 'g'), 10)) stored,
  team_name text not null default '',
  team_members jsonb not null default '[]',
  answers jsonb not null default '{}',
  status text not null default 'confirmed' check (status in ('confirmed','attended','cancelled')),
  email_sent boolean not null default false,
  ip_hash text not null default '',
  created_at timestamptz not null default now()
);
-- Duplicate protection: one active registration per event per email / phone.
create unique index if not exists registrations_event_email_uniq
  on public.registrations (event_id, lower(email)) where status <> 'cancelled';
create unique index if not exists registrations_event_phone_uniq
  on public.registrations (event_id, phone_key) where status <> 'cancelled';
create index if not exists registrations_event_idx on public.registrations (event_id, created_at desc);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  category text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin','editor','registrations')),
  created_at timestamptz not null default now()
);

-- ---------- triggers ----------
do $$
declare t text;
begin
  foreach t in array array['events','team_members','gallery_items','announcements','schedule_items','faqs','festival_settings'] loop
    execute format('drop trigger if exists touch on public.%I', t);
    execute format('create trigger touch before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ---------- row level security ----------
alter table public.events enable row level security;
alter table public.team_members enable row level security;
alter table public.gallery_items enable row level security;
alter table public.announcements enable row level security;
alter table public.schedule_items enable row level security;
alter table public.faqs enable row level security;
alter table public.festival_settings enable row level security;
alter table public.registrations enable row level security;
alter table public.enquiries enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public read visible" on public.events;
create policy "public read visible" on public.events for select to anon, authenticated using (visible);
drop policy if exists "public read visible" on public.team_members;
create policy "public read visible" on public.team_members for select to anon, authenticated using (visible);
drop policy if exists "public read visible" on public.gallery_items;
create policy "public read visible" on public.gallery_items for select to anon, authenticated using (visible);
drop policy if exists "public read visible" on public.announcements;
create policy "public read visible" on public.announcements for select to anon, authenticated using (visible);
drop policy if exists "public read visible" on public.schedule_items;
create policy "public read visible" on public.schedule_items for select to anon, authenticated using (visible);
drop policy if exists "public read visible" on public.faqs;
create policy "public read visible" on public.faqs for select to anon, authenticated using (visible);
drop policy if exists "public read" on public.festival_settings;
create policy "public read" on public.festival_settings for select to anon, authenticated using (true);
-- registrations / enquiries / admin_users: intentionally no policies (service role only).

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 104857600) -- 100 MB per file
on conflict (id) do nothing;
-- Public bucket: files are readable by URL. Uploads happen through signed
-- upload URLs created by the server for signed-in admins only.
