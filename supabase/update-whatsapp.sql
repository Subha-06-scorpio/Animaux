-- ANIMAUX'26 update (17 Nov): WhatsApp group links + Shutter Safari open all day.
-- Paste into Supabase → SQL Editor → Run. Safe to run more than once; changes nothing else.
alter table public.events add column if not exists whatsapp_group text not null default '';

update public.events
set start_time = '09:00',
    end_time = '16:00',
    capacity = null,
    rules = '["Open all day — submissions accepted from 9:00 AM until the closing ceremony.","No limit on participants: every registration is accepted."]'::jsonb
where slug = 'shutter-safari';
