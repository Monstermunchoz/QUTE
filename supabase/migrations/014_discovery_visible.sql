-- Fix production : nouveaux inscrits invisibles (RLS pending)
-- + trigger d'inscription qui crée toujours le profil.

drop policy if exists "lecture profil connecte" on public.profiles;

create policy "lecture profil connecte" on public.profiles
  for select using (
    auth.uid() is not null
    and (
      id = auth.uid()
      or photo_status is distinct from 'rejected'
      or public.is_staff()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  birth date;
  nick text;
begin
  nick := nullif(trim(coalesce(new.raw_user_meta_data->>'pseudo', '')), '');
  if nick is null then
    nick := 'qute_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  if coalesce(new.raw_user_meta_data->>'date_naissance', '') <> '' then
    begin
      birth := (new.raw_user_meta_data->>'date_naissance')::date;
    exception
      when others then
        birth := null;
    end;

    if birth is not null
       and birth > (current_date - interval '18 years') then
      birth := null;
    end if;
  end if;

  insert into public.profiles (id, pseudo, date_naissance)
  values (new.id, nick, birth)
  on conflict (id) do nothing;

  if not exists (select 1 from public.profiles where id = new.id) then
    insert into public.profiles (id, pseudo, date_naissance)
    values (
      new.id,
      nick || '_' || substr(replace(new.id::text, '-', ''), 1, 4),
      birth
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

notify pgrst, 'reload schema';
