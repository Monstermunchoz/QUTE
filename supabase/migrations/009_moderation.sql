-- Rôle admin sur les profils
alter table public.profiles
  add column if not exists role text default 'user'
  check (role in ('user','moderateur','admin'));

-- is_staff() : évite la récursion RLS sur profiles
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','moderateur')
  );
$$;

-- Signalements
create table public.signalements (
  id uuid default gen_random_uuid() primary key,
  rapporteur_id uuid references public.profiles(id) on delete cascade,
  cible_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('profil','message','salon','evenement','autre')),
  raison text not null check (char_length(raison) <= 500),
  statut text default 'en_attente' check (statut in ('en_attente','traite','rejete')),
  note_admin text,
  created_at timestamptz default now()
);

alter table public.signalements enable row level security;

create policy "cree un signalement" on public.signalements
  for insert with check (auth.uid() = rapporteur_id);

create policy "voit ses signalements" on public.signalements
  for select using (auth.uid() = rapporteur_id);

create policy "admin voit tout" on public.signalements
  for all using (public.is_staff());

-- Admin voit / gère tous les profils
create policy "admin voit profils" on public.profiles
  for all using (public.is_staff());

-- Admin gère les événements
create policy "admin gere evenements" on public.evenements
  for all using (public.is_staff());

update public.profiles set role = 'admin' where pseudo = 'MonsterP';
