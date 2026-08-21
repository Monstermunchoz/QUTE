-- SALONS
create table public.salons (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  description text,
  theme text,
  region text default 'Lyon Métropole',
  est_public boolean default true,
  created_at timestamptz default now()
);

alter table public.salons enable row level security;

create policy "lecture salons publics" on public.salons
  for select using (est_public = true);

-- Messages de salon
create table public.salon_messages (
  id uuid default gen_random_uuid() primary key,
  salon_id uuid references public.salons(id) on delete cascade,
  auteur_id uuid references public.profiles(id) on delete cascade,
  contenu text not null check (char_length(contenu) <= 1000),
  created_at timestamptz default now()
);

alter table public.salon_messages enable row level security;

create policy "lecture messages salon" on public.salon_messages
  for select using (true);

create policy "envoie message salon" on public.salon_messages
  for insert with check (auth.uid() = auteur_id);

-- GROUPES
create table public.groupes (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  description text,
  createur_id uuid references public.profiles(id) on delete cascade,
  est_prive boolean default false,
  created_at timestamptz default now()
);

alter table public.groupes enable row level security;

create policy "lecture groupes publics" on public.groupes
  for select using (est_prive = false);

create policy "voit ses groupes prives" on public.groupes
  for select using (
    createur_id = auth.uid()
    or exists (
      select 1 from public.groupe_membres gm
      where gm.groupe_id = id
      and gm.user_id = auth.uid()
    )
  );

create policy "cree un groupe" on public.groupes
  for insert with check (auth.uid() = createur_id);

-- Membres des groupes
create table public.groupe_membres (
  id uuid default gen_random_uuid() primary key,
  groupe_id uuid references public.groupes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'membre' check (role in ('admin','moderateur','membre')),
  joined_at timestamptz default now(),
  unique(groupe_id, user_id)
);

alter table public.groupe_membres enable row level security;

create policy "voit les membres" on public.groupe_membres
  for select using (true);

create policy "rejoint un groupe" on public.groupe_membres
  for insert with check (auth.uid() = user_id);

create policy "quitte un groupe" on public.groupe_membres
  for delete using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.salon_messages;

-- Salons par défaut Lyon
insert into public.salons (nom, description, theme) values
  ('Lyon Général', 'Le salon principal de la communauté QUTE Lyon', 'general'),
  ('Sorties ce soir', 'Où est-ce qu''on sort ce soir ?', 'sorties'),
  ('Techno Lyon', 'La scène techno et électro lyonnaise', 'musique'),
  ('Trans Lyon', 'Espace de discussion pour la communauté trans', 'identite'),
  ('Gay Lyon', 'Salon gay de Lyon', 'identite'),
  ('Lesbiennes Lyon', 'Salon lesbien de Lyon', 'identite'),
  ('Bi/Pan Lyon', 'Pour les bi et pan de Lyon', 'identite'),
  ('Queer Lyon', 'Espace queer ouvert', 'identite'),
  ('Associations', 'Actualités des assos LGBTQIA+ lyonnaises', 'communaute');
