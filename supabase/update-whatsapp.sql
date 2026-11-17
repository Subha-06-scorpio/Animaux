-- ANIMAUX'26 update (17 Nov): WhatsApp group links + Shutter Safari 11:00 AM – 3:30 PM.
-- Paste into Supabase → SQL Editor → Run. Safe to run more than once; changes nothing else.
alter table public.events add column if not exists whatsapp_group text not null default '';

update public.events
set start_time = '11:00',
    end_time = '15:30',
    capacity = null,
    rules = '["Open from 11:00 AM to 3:30 PM — drop in any time in between.","No limit on participants: every registration is accepted."]'::jsonb
where slug = 'shutter-safari';
