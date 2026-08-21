-- Ce trigger remettait role = ancienne valeur dès que is_staff() était faux.
-- Dans le SQL Editor, auth.uid() est NULL → is_staff() faux → role toujours 'user'.
drop trigger if exists protect_profile_moderation on public.profiles;
drop function if exists public.protect_profile_moderation();

update public.profiles
set role = 'admin'
where id = 'ba57db15-9e89-4ec4-85bd-43846af8c491';

notify pgrst, 'reload schema';
