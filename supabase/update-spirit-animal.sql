-- ANIMAUX'26 update: replaces the Wild Aim mini event with Spirit Animal. Safe to run more than once.
update public.events
set slug = 'spirit-animal', name = 'Spirit Animal', tagline = 'Which creature of the wild are you?', category = 'game',
    short_description = 'Answer a few quick questions and discover the animal that matches your personality.',
    description = 'Are you a lone leopard, a loyal wolf, a curious octopus or a wise old owl? Answer a few quick, fun questions about how you think, act and react — and uncover the creature of the wild that matches your personality.

Walk away with your spirit animal and a fascinating fact about your wild twin.',
    rules = '["Walk in any time — takes just a couple of minutes."]'::jsonb,
    poster_url = '/events/spirit-animal.jpg'
where id = 'e1000000-0000-4000-8000-000000000010' or slug = 'wild-aim';

update public.faqs set answer = 'Six quick, on-the-spot games — Wildlife Pictionary, Spirit Animal, Wild Eye, Fingerprint Paintings, Who Am I? and the Memory Game. Just walk in on 2 December; no online registration needed.' where id = 'fa000000-0000-4000-8000-000000000006';
