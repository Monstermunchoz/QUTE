-- SELECT profiles ne doit pas évaluer une policy FOR ALL (récursion RLS).
-- Le cache PostgREST doit connaître la colonne role.
drop policy if exists "admin voit profils" on public.profiles;

create policy "admin modifie profils" on public.profiles
  for update using (public.is_staff())
  with check (public.is_staff());

create policy "admin supprime profils" on public.profiles
  for delete using (public.is_staff());

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_staff() to authenticated;

update public.profiles set role = 'admin' where pseudo = 'MonsterP';

notify pgrst, 'reload schema';

-- Vérif : select id, pseudo, role from public.profiles where pseudo = 'MonsterP';
