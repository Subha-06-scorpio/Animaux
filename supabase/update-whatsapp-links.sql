-- ANIMAUX'26 update: WhatsApp group links (per event + common group). Safe to run more than once.
alter table public.events add column if not exists whatsapp_group text not null default '';

update public.events set whatsapp_group = 'https://chat.whatsapp.com/CyiWoHAe9IU0tY1BPhGoRL' where slug = 'the-last-trace';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/JcCrxrnqNYG1B2aVL3ZL93' where slug = 'trace-evidence-relay';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/BLEKOu6lXtcHacthgH8HAL' where slug = 'wild-shark-tank';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/I94F9k3YUL7CljNVPpYJxz' where slug = 'the-poachers-tale';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/BUoAEL5OoVr1s53ZpX3gnA' where slug = 'flood-zone';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/E1qU0jAaWja6prqOZYDSPn' where slug = '7-steps';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/LCLmk5gh0jDEUpf40g7l24' where slug = 'shutter-safari';
update public.events set whatsapp_group = 'https://chat.whatsapp.com/Jqf2DNL8QAZASjzNEoIgLz' where slug = 'strokes-of-wild';

update public.festival_settings
set data = jsonb_set(data, '{whatsappCommonGroup}', '"https://chat.whatsapp.com/D7NampL9cIo2YA4wybPwpM"'::jsonb)
where id = 1;
