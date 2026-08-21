-- Lot 12 : anon ne lit/écrit aucune table métier.
-- Les policies USING (true) / sans auth.uid() sont resserrées.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- PROFILES : plus de SELECT public (anon).
-- Pending invisible pour les autres, visible pour soi et le staff.
drop policy if exists "lecture profil public" on public.profiles;
drop policy if exists "lecture profil connecte" on public.profiles;

create policy "lecture profil connecte" on public.profiles
  for select using (
    auth.uid() is not null
    and (
      id = auth.uid()
      or photo_status is distinct from 'pending'
      or public.is_staff()
    )
  );

-- SALONS / MESSAGES SALON
drop policy if exists "lecture salons publics" on public.salons;
create policy "lecture salons publics" on public.salons
  for select using (auth.uid() is not null and est_public = true);

drop policy if exists "lecture messages salon" on public.salon_messages;
create policy "lecture messages salon" on public.salon_messages
  for select using (auth.uid() is not null);

-- GROUPES
drop policy if exists "lecture groupes publics" on public.groupes;
create policy "lecture groupes publics" on public.groupes
  for select using (auth.uid() is not null and est_prive = false);

drop policy if exists "voit les membres" on public.groupe_membres;
create policy "voit les membres" on public.groupe_membres
  for select using (auth.uid() is not null);

-- LIEUX (GPS de lieux, pas de personnes) : connecté uniquement
drop policy if exists "lecture lieux" on public.lieux;
create policy "lecture lieux" on public.lieux
  for select using (auth.uid() is not null);

-- EVENEMENTS / PARTICIPATIONS
drop policy if exists "lecture evenements publies" on public.evenements;
create policy "lecture evenements publies" on public.evenements
  for select using (auth.uid() is not null and statut = 'publie');

drop policy if exists "voit les participations" on public.participations;
create policy "voit les participations" on public.participations
  for select using (auth.uid() is not null);

-- JE SORS
drop policy if exists "voit les je_sors actifs" on public.je_sors;
create policy "voit les je_sors actifs" on public.je_sors
  for select using (
    auth.uid() is not null
    and expires_at > now()
    and (
      visibilite = 'tous'
      or auth.uid() = user_id
      or (
        visibilite = 'matchs'
        and exists (
          select 1 from public.matchs m
          where (m.user1_id = auth.uid() and m.user2_id = user_id)
             or (m.user2_id = auth.uid() and m.user1_id = user_id)
        )
      )
    )
  );

-- 18+ côté base
create or replace function public.enforce_adult_profile()
returns trigger
language plpgsql
as $$
begin
  if new.date_naissance is not null
     and new.date_naissance > (current_date - interval '18 years') then
    raise exception 'Tu dois avoir 18 ans ou plus.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_adult_profile on public.profiles;
create trigger enforce_adult_profile
  before insert or update of date_naissance on public.profiles
  for each row execute procedure public.enforce_adult_profile();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  birth date;
begin
  if coalesce(new.raw_user_meta_data->>'date_naissance', '') <> '' then
    birth := (new.raw_user_meta_data->>'date_naissance')::date;
    if birth > current_date - interval '18 years' then
      raise exception 'Tu dois avoir 18 ans ou plus.';
    end if;
  end if;

  insert into public.profiles (id, pseudo, date_naissance)
  values (new.id, new.raw_user_meta_data->>'pseudo', birth);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Storage : pas de lecture anon ; pending.jpg seulement soi + staff
drop policy if exists "voit avatars approuves" on storage.objects;
drop policy if exists "voit avatars hors pending" on storage.objects;
drop policy if exists "staff voit avatars" on storage.objects;

create policy "voit avatars hors pending" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and name not like '%/pending.jpg'
  );

create policy "staff voit avatars" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and public.is_staff()
  );

notify pgrst, 'reload schema';
