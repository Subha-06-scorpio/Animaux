-- Grant dashboard access to a user.
-- 1. Supabase → Authentication → Users → "Add user" (email + password, tick "Auto confirm").
-- 2. Replace the email and role below, then run this in the SQL Editor.
--    Roles: 'admin'         – everything
--           'editor'        – events, team, gallery, schedule, announcements, FAQs
--           'registrations' – view/export registrations and answer enquiries

insert into public.admin_users (user_id, email, role)
select id, email, 'admin'
from auth.users
where email = 'organiser@example.com'
on conflict (user_id) do update set role = excluded.role;

-- Remove access:
-- delete from public.admin_users where email = 'someone@example.com';
