-- ANIMAUX'26 update (updated flyer): brochure flip-book link + event name as on the flyer. Safe to run more than once.
update public.festival_settings
set data = jsonb_set(data, '{brochureUrl}', '"https://heyzine.com/flip-book/b2667467d6.html"'::jsonb)
where id = 1;

update public.events set name = 'Strokes of Wild: Coaster-Making' where slug = 'strokes-of-wild';
