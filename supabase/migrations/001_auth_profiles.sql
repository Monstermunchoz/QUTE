-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  pseudo text not null unique,
  bio text,
  ville text,
  age_visible boolean default false,
  date_naissance date,
  photo_url text,
  photo_status text default 'pending' check (photo_status in ('pending','approved','rejected')),
  compte_verifie boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS deny-by-default
alter table public.profiles enable row level security;

create policy "lecture profil public" on public.profiles
  for select using (true);

create policy "modif son propre profil" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, new.raw_user_meta_data->>'pseudo');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
