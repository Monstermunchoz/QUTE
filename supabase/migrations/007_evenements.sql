-- Événements
create table public.evenements (
  id uuid default gen_random_uuid() primary key,
  titre text not null,
  description text,
  lieu_id uuid references public.lieux(id),
  lieu_nom text,
  adresse text,
  date_debut timestamptz not null,
  date_fin timestamptz,
  createur_id uuid references public.profiles(id) on delete cascade,
  statut text default 'pending' check (statut in ('pending','publie','refuse')),
  categorie text check (categorie in ('soiree','concert','culture','sport','rencontre','association','autre')),
  image_url text,
  max_participants integer,
  created_at timestamptz default now()
);

alter table public.evenements enable row level security;

create policy "lecture evenements publies" on public.evenements
  for select using (statut = 'publie');

create policy "voit ses propres evenements" on public.evenements
  for select using (auth.uid() = createur_id);

create policy "cree un evenement" on public.evenements
  for insert with check (auth.uid() = createur_id);

create policy "modifie son evenement" on public.evenements
  for update using (auth.uid() = createur_id and statut = 'pending');

-- Participations
create table public.participations (
  id uuid default gen_random_uuid() primary key,
  evenement_id uuid references public.evenements(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  statut text default 'interesse' check (statut in ('interesse','participe','absent')),
  created_at timestamptz default now(),
  unique(evenement_id, user_id)
);

alter table public.participations enable row level security;

create policy "voit les participations" on public.participations
  for select using (true);

create policy "gere sa participation" on public.participations
  for all using (auth.uid() = user_id);

-- Événements de test (statut publie pour tester)
insert into public.evenements (titre, description, lieu_nom, adresse, date_debut, statut, categorie) values
  ('Soirée Queer Techno', 'Une nuit de techno pour la communauté QUTE', 'Le Sucre', '50 Quai Rambaud, Lyon', now() + interval '3 days', 'publie', 'soiree'),
  ('Drag Show Lyon', 'Spectacle de drag queens lyonnaises', 'Le Marché Gare', '35 Rue du Bât d''Argent, Lyon', now() + interval '7 days', 'publie', 'culture'),
  ('Apéro LGBTI+', 'Apéro mensuel de la communauté', 'Café de la Cloche', '5 Place Antonin Poncet, Lyon', now() + interval '2 days', 'publie', 'rencontre');
