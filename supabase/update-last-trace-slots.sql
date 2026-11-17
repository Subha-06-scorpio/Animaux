-- ANIMAUX'26 update: The Last Trace — two slots, 4 teams each. Safe to run more than once.
update public.events
set capacity = 8,
    extra_questions = '[{"id":"slot","label":"Choose your slot","type":"select","options":["Slot 1 — 11:30 AM","Slot 2 — 2:15 PM"],"required":true,"limitPerOption":4}]'::jsonb,
    rules = '["Two slots: Slot 1 at 11:30 AM and Slot 2 at 2:15 PM — pick one when you register.","4 teams per slot (8 teams in total), up to 5 members each.","Duration: approximately 45 minutes per session.","One continuous investigation combining clue-hunting, puzzles and case-solving.","Evidence must be collected and labelled correctly — mishandled clues may be declared compromised."]'::jsonb
where slug = 'the-last-trace';

update public.schedule_items set title = 'The Last Trace — Slot 1' where id = '5c000000-0000-4000-8000-000000000005';
update public.schedule_items set title = 'The Last Trace — Slot 2' where id = '5c000000-0000-4000-8000-000000000010';

update public.faqs set answer = 'The team leader registers once for the whole team: a team name, plus each member’s name. Team sizes and team limits (for example, 4 teams in each of the two slots for The Last Trace) are shown on each event.' where id = 'fa000000-0000-4000-8000-000000000005';
