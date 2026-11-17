-- ANIMAUX'26 update (17 Nov): WhatsApp group links, Shutter Safari open all day,
-- coaster making (Strokes of Wild) 11:00 AM – 3:30 PM, no limit.
-- Paste into Supabase → SQL Editor → Run. Safe to run more than once; changes nothing else.
alter table public.events add column if not exists whatsapp_group text not null default '';

update public.events
set start_time = '09:00',
    end_time = '16:00',
    capacity = null,
    rules = '["Open all day — submissions accepted from 9:00 AM until the closing ceremony.","No limit on participants: every registration is accepted."]'::jsonb
where slug = 'shutter-safari';

update public.events
set start_time = '11:00',
    end_time = '15:30',
    capacity = null,
    eligibility = 'Individual entry — not a team event. No limit on participants.',
    rules = '["Open from 11:00 AM to 3:30 PM — drop in any time in between.","Participation: individual — no limit on participants."]'::jsonb
where slug = 'strokes-of-wild';

update public.schedule_items
set time = '11:00', end_time = '15:30'
where id = '5c000000-0000-4000-8000-000000000003';
