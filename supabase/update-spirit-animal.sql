-- ANIMAUX'26 update: replaces the Wild Aim mini event with Spirit Animal. Safe to run more than once.
update public.events
set slug = 'spirit-animal', name = 'Spirit Animal', tagline = '', category = 'game',
    short_description = 'A few quick questions. One animal that matches you.',
    description = 'Answer a few quick questions and find out which animal matches your personality.',
    rules = '[]'::jsonb,
    poster_url = '/events/spirit-animal.jpg'
where id = 'e1000000-0000-4000-8000-000000000010' or slug = 'wild-aim';

update public.faqs set answer = 'Six quick, on-the-spot games — Wildlife Pictionary, Spirit Animal, Wild Eye, Fingerprint Paintings, Who Am I? and the Memory Game. Just walk in on 2 December; no online registration needed.' where id = 'fa000000-0000-4000-8000-000000000006';
