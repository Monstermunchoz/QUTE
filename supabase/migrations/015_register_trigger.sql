-- L'échec du trigger ne doit jamais empêcher auth.users d'être créé.

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

  begin
    insert into public.profiles (id, pseudo, date_naissance)
    values (new.id, nick, birth)
    on conflict (id) do nothing;
  exception
    when unique_violation then
      insert into public.profiles (id, pseudo)
      values (
        new.id,
        nick || '_' || substr(replace(new.id::text, '-', ''), 1, 4)
      )
      on conflict (id) do nothing;
    when others then
      raise warning 'handle_new_user: %', sqlerrm;
  end;

  return new;
exception
  when others then
    raise warning 'handle_new_user fatal: %', sqlerrm;
    return new;
end;
$$;
