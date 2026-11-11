-- ANIMAUX'26 — "The Survival Files" update. Safe to run more than once.
-- Run AFTER 20261021000000_init.sql, in Supabase → SQL Editor.

-- Main vs mini events (mini = on the spot, no online registration) + taglines.
alter table public.events add column if not exists tier text not null default 'main';
alter table public.events add column if not exists tagline text not null default '';
alter table public.events drop constraint if exists events_tier_check;
alter table public.events add constraint events_tier_check check (tier in ('main', 'mini'));

-- Registration form now asks only for name, college, year and contact number;
-- email and department are optional.
alter table public.registrations alter column email set default '';
alter table public.registrations alter column department set default '';
drop index if exists public.registrations_event_email_uniq;
create unique index registrations_event_email_uniq
  on public.registrations (event_id, lower(email)) where status <> 'cancelled' and email <> '';
