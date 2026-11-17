-- ANIMAUX'26 — per-event WhatsApp group link (shown after registering). Safe to run more than once.
alter table public.events add column if not exists whatsapp_group text not null default '';
