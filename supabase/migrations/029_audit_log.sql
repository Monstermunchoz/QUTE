-- 029 : RLS profils (connexion requise, pending invisible) + journal d'audit admin
--
-- Les deux policies SELECT PERMISSIVE demandées initialement se combineraient
-- en OR : « auth.uid() is not null » rouvrirait tous les pending à n'importe
-- quel compte connecté. On n'applique que la règle du résultat attendu.

drop policy if exists "lecture profil public" on public.profiles;
drop policy if exists "lecture profil connecte" on public.profiles;
drop policy if exists "lecture profil public minimal" on public.profiles;

create policy "lecture profil connecte" on public.profiles
  for select using (
    auth.uid() is not null
    and (
      id = auth.uid()
      or photo_status = 'approved'
      or public.is_staff()
    )
  );

create table if not exists public.audit_log (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  cible_type text check (cible_type in
    ('profil','message','photo','evenement','salon','signalement')),
  cible_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table public.audit_log enable row level security;

revoke update, delete on public.audit_log from authenticated;
grant select, insert on public.audit_log to authenticated;

drop policy if exists "admin voit audit log" on public.audit_log;
create policy "admin voit audit log" on public.audit_log
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin','moderateur')
    )
  );

drop policy if exists "admin insere audit log" on public.audit_log;
create policy "admin insere audit log" on public.audit_log
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin','moderateur')
    )
  );

notify pgrst, 'reload schema';
